import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, Paperclip, Phone, Video, UserPlus, Loader2, AlertCircle, X, RefreshCw, Search } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { dbService } from '../../services/supabase/dbService';
import { Card } from '../../components/common/Card';
import { Avatar } from '../../components/common/Avatar';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';
import { SearchBar } from '../../components/common/SearchBar';
import { IntegrationModal } from '../../components/feedback/IntegrationModal';

interface PeerSearchResult {
  id: string;
  name: string;
  email: string;
  school: string;
  level: string;
  avatarUrl: string;
}

export const DirectChatPage: React.FC = () => {
  const {
    conversations,
    activeConversationId,
    selectConversation,
    startConversation,
    loadMessagesForConversation,
    sendMessage,
    isCommunityLoading,
    communityError,
    clearCommunityError,
  } = useData();
  const { student } = useAuth();

  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showZegoModal, setShowZegoModal] = useState(false);

  // Start New Conversation Modal & Peer Search State
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<PeerSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isStartingChat, setIsStartingChat] = useState(false);
  const [rawUserId, setRawUserId] = useState('');

  // Pagination & Scroll preservation state
  const [msgPage, setMsgPage] = useState(0);
  const [isLoadingOlder, setIsLoadingOlder] = useState(false);

  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Active conversation target
  const activeConv = conversations.find((c) => c.id === activeConversationId) || conversations[0];

  // Auto-select initial conversation if none selected
  useEffect(() => {
    if (!activeConversationId && conversations.length > 0) {
      selectConversation(conversations[0].id);
    }
  }, [conversations, activeConversationId]);

  // Peer Profile Search Effect
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await dbService.searchProfiles(searchQuery, student?.id);
        setSearchResults(results);
      } catch (err) {
        console.error('[DirectChatPage] Profile search error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, student?.id]);

  // Scroll to bottom on initial conversation open or new incoming messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeConv?.id, activeConv?.messages?.length]);

  const handleSelectConv = (id: string) => {
    setMsgPage(0);
    selectConversation(id);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeConv?.id || isSending) return;

    const messageText = inputText;
    setInputText('');
    setIsSending(true);

    try {
      await sendMessage(activeConv.id, messageText);
    } catch (err) {
      console.error('[DirectChatPage] Failed to send message:', err);
    } finally {
      setIsSending(false);
    }
  };

  const handleStartChatWithPeer = async (peerId: string) => {
    if (isStartingChat) return;

    setIsStartingChat(true);
    try {
      const convId = await startConversation(peerId);
      setSearchQuery('');
      setSearchResults([]);
      setRawUserId('');
      setShowNewChatModal(false);
      selectConversation(convId);
    } catch (err) {
      console.error('[DirectChatPage] Failed to start conversation:', err);
    } finally {
      setIsStartingChat(false);
    }
  };

  const handleLoadOlderMessages = async () => {
    if (!activeConv?.id || isLoadingOlder) return;

    const container = messagesContainerRef.current;
    const oldScrollHeight = container ? container.scrollHeight : 0;

    setIsLoadingOlder(true);
    const nextPage = msgPage + 1;
    try {
      await loadMessagesForConversation(activeConv.id, nextPage);
      setMsgPage(nextPage);

      // Preserve scroll position so user doesn't jump to bottom
      requestAnimationFrame(() => {
        if (container) {
          const newScrollHeight = container.scrollHeight;
          container.scrollTop = newScrollHeight - oldScrollHeight;
        }
      });
    } catch (err) {
      console.error('[DirectChatPage] Error loading older messages:', err);
    } finally {
      setIsLoadingOlder(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <MessageSquare className="w-8 h-8 text-brand-600 dark:text-brand-400" />
            <span>Peer Messaging & Chat</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Direct messages, study exchange & 1-to-1 audio/video call UI.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" icon={UserPlus} onClick={() => setShowNewChatModal(true)}>
            Start New Chat
          </Button>

          <Button variant="primary" icon={Video} onClick={() => setShowZegoModal(true)}>
            1-to-1 Call Integration
          </Button>
        </div>
      </div>

      {/* Community Error Banner */}
      {communityError && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-3 text-xs font-semibold">
            <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
            <span>{communityError}</span>
          </div>
          <button onClick={clearCommunityError} className="p-1 hover:bg-rose-500/20 rounded-lg transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Chat Workspace Interface */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 min-h-[500px]">
        {/* Conversations List Sidebar */}
        <Card className="md:col-span-1 p-4 space-y-3 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Conversations ({conversations.length})
              </h3>
              <button
                onClick={() => setShowNewChatModal(true)}
                className="text-xs font-bold text-brand-500 hover:text-brand-400 flex items-center gap-1 cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>New</span>
              </button>
            </div>

            {isCommunityLoading && conversations.length === 0 ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="p-3 rounded-2xl bg-slate-800/40 animate-pulse h-14" />
                ))}
              </div>
            ) : conversations.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400 space-y-2">
                <MessageSquare className="w-8 h-8 mx-auto text-slate-500" />
                <p>No active conversations yet.</p>
                <Button size="sm" variant="outline" onClick={() => setShowNewChatModal(true)}>
                  Message a Peer
                </Button>
              </div>
            ) : (
              <div className="space-y-1 overflow-y-auto max-h-[440px]">
                {conversations.map((conv) => {
                  const isActive = conv.id === activeConv?.id;
                  return (
                    <button
                      key={conv.id}
                      onClick={() => handleSelectConv(conv.id)}
                      className={`w-full p-3 rounded-2xl transition-all flex items-center gap-3 text-left cursor-pointer ${
                        isActive
                          ? 'bg-brand-600 text-white shadow-md shadow-brand-600/20'
                          : 'hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      <Avatar
                        src={conv.peerAvatar}
                        name={conv.peerName}
                        size="md"
                        status={conv.isOnline ? 'online' : 'offline'}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold truncate">{conv.peerName}</span>
                          <span className={`text-[10px] ${isActive ? 'text-brand-100' : 'text-slate-400'}`}>
                            {conv.lastMessageTime}
                          </span>
                        </div>
                        <p className={`text-xs truncate ${isActive ? 'text-brand-100' : 'text-slate-400'}`}>
                          {conv.lastMessage}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </Card>

        {/* Active Chat Conversation Area */}
        {activeConv ? (
          <Card className="md:col-span-2 p-0 flex flex-col justify-between overflow-hidden">
            {/* Peer Header */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
              <div className="flex items-center gap-3">
                <Avatar src={activeConv.peerAvatar} name={activeConv.peerName} size="md" status={activeConv.isOnline ? 'online' : 'offline'} />
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    {activeConv.peerName}
                  </h4>
                  <span className="text-xs text-emerald-500 font-semibold">
                    {activeConv.isOnline ? 'Online now' : 'Offline'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowZegoModal(true)}
                  className="p-2 rounded-xl text-slate-400 hover:text-brand-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                  title="Voice Call"
                >
                  <Phone className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setShowZegoModal(true)}
                  className="p-2 rounded-xl text-slate-400 hover:text-brand-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                  title="Video Call"
                >
                  <Video className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Chat Messages Body */}
            <div ref={messagesContainerRef} className="p-4 flex-1 overflow-y-auto space-y-3 min-h-[320px] max-h-[440px]">
              {/* Load Older History Pagination Trigger - Only shown when server has more history */}
              {activeConv.hasMoreMessages !== false && (activeConv.messages || []).length > 0 && (
                <div className="text-center pb-2">
                  <button
                    onClick={handleLoadOlderMessages}
                    disabled={isLoadingOlder}
                    className="text-xs font-semibold text-brand-500 hover:text-brand-400 flex items-center gap-1.5 mx-auto disabled:opacity-50 cursor-pointer"
                  >
                    {isLoadingOlder ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                    <span>{isLoadingOlder ? 'Loading older history...' : 'Load older messages'}</span>
                  </button>
                </div>
              )}

              {(activeConv.messages || []).length === 0 ? (
                <div className="text-center py-12 text-xs text-slate-400">
                  No messages yet. Send a message to start chatting!
                </div>
              ) : (
                (activeConv.messages || []).map((msg) => {
                  const isTemp = msg.id.startsWith('temp_m_');
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[75%] p-3.5 rounded-2xl text-xs space-y-1 transition-opacity ${
                          msg.isMe
                            ? 'bg-brand-600 text-white rounded-br-none'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-bl-none'
                        } ${isTemp ? 'opacity-70 animate-pulse' : ''}`}
                      >
                        <p className="whitespace-pre-line">{msg.text}</p>
                        <span className={`text-[9px] block text-right ${msg.isMe ? 'text-brand-200' : 'text-slate-400'}`}>
                          {isTemp ? 'Sending...' : msg.timestamp}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input Bar */}
            <form onSubmit={handleSend} className="p-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowZegoModal(true)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <Paperclip className="w-5 h-5" />
              </button>

              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                disabled={isSending}
                placeholder={`Message ${activeConv.peerName}...`}
                className="flex-1 px-4 py-2.5 rounded-xl text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:opacity-50"
              />

              <Button type="submit" variant="primary" size="sm" icon={isSending ? Loader2 : Send} disabled={isSending || !inputText.trim()}>
                {isSending ? 'Sending...' : 'Send'}
              </Button>
            </form>
          </Card>
        ) : (
          <Card className="md:col-span-2 p-12 flex flex-col items-center justify-center text-center text-slate-400 space-y-3">
            <MessageSquare className="w-12 h-12 text-slate-500" />
            <h3 className="text-base font-bold text-slate-200">Select or Start a Conversation</h3>
            <p className="text-xs max-w-sm">
              Choose a conversation from the sidebar or click "Start New Chat" to search for a nursing peer by name or email.
            </p>
            <Button variant="primary" icon={UserPlus} onClick={() => setShowNewChatModal(true)}>
              Start New Chat
            </Button>
          </Card>
        )}
      </div>

      {/* Start New Conversation Search Modal */}
      <Modal isOpen={showNewChatModal} onClose={() => !isStartingChat && setShowNewChatModal(false)} title="Start New Conversation">
        <div className="space-y-4 pt-2">
          <p className="text-xs text-slate-400">
            Search for nursing peers registered on NursaFlow by name or email to initiate a 1-to-1 conversation.
          </p>

          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Type peer name or email (e.g. Maya, Alex, testpeer)..."
          />

          {/* Search Results Display */}
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {isSearching ? (
              <div className="p-6 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-brand-500" />
                <span>Searching peer profiles...</span>
              </div>
            ) : searchResults.length > 0 ? (
              searchResults.map((peer) => (
                <div
                  key={peer.id}
                  className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between gap-3 hover:border-brand-500 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Avatar src={peer.avatarUrl} name={peer.name} size="md" />
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">{peer.name}</h4>
                      <p className="text-xs text-slate-400">
                        {peer.school} • {peer.level}
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="primary"
                    disabled={isStartingChat}
                    onClick={() => handleStartChatWithPeer(peer.id)}
                  >
                    Message
                  </Button>
                </div>
              ))
            ) : searchQuery.trim() ? (
              <div className="p-6 text-center text-xs text-slate-400 space-y-3">
                <p>No registered peers found matching "{searchQuery}".</p>
                <div className="pt-2 border-t border-slate-800 text-left space-y-2">
                  <span className="text-[11px] font-semibold text-slate-500">Or paste exact User UUID manually:</span>
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="e.g. 072f0a95-a89e-4d3a-8671-..."
                      value={rawUserId}
                      onChange={(e) => setRawUserId(e.target.value)}
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={!rawUserId.trim() || isStartingChat}
                      onClick={() => handleStartChatWithPeer(rawUserId.trim())}
                    >
                      Open
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6 text-center text-xs text-slate-400">
                Type in the search bar above to find nursing peers.
              </div>
            )}
          </div>

          <div className="flex justify-end pt-2">
            <Button variant="outline" type="button" onClick={() => setShowNewChatModal(false)} disabled={isStartingChat}>
              Close
            </Button>
          </div>
        </div>
      </Modal>

      <IntegrationModal
        isOpen={showZegoModal}
        onClose={() => setShowZegoModal(false)}
        serviceType="zegocloud"
        featureTitle="1-to-1 Voice & Video Call Signaling"
      />
    </div>
  );
};
