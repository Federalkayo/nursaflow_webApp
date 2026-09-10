import React, { useState } from 'react';
import { MessageSquare, Send, Paperclip, Phone, Video, Info } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/common/Card';
import { Avatar } from '../../components/common/Avatar';
import { Button } from '../../components/common/Button';
import { IntegrationModal } from '../../components/feedback/IntegrationModal';

export const DirectChatPage: React.FC = () => {
  const { conversations, sendMessage } = useData();
  const { student } = useAuth();

  const [activeConvId, setActiveConvId] = useState(conversations[0]?.id || 'conv_1');
  const [inputText, setInputText] = useState('');
  const [showZegoModal, setShowZegoModal] = useState(false);

  const activeConv = conversations.find((c) => c.id === activeConvId) || conversations[0];

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeConvId) return;

    sendMessage(activeConvId, inputText);
    setInputText('');
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

        <Button variant="outline" icon={Video} onClick={() => setShowZegoModal(true)}>
          1-to-1 Call Integration
        </Button>
      </div>

      {/* Chat Workspace Interface */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 min-h-[500px]">
        {/* Conversations List Sidebar */}
        <Card className="md:col-span-1 p-4 space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2">
            Conversations ({conversations.length})
          </h3>

          <div className="space-y-1">
            {conversations.map((conv) => {
              const isActive = conv.id === activeConvId;
              return (
                <button
                  key={conv.id}
                  onClick={() => setActiveConvId(conv.id)}
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
        </Card>

        {/* Active Chat Conversation Area */}
        {activeConv && (
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
                  className="p-2 rounded-xl text-slate-400 hover:text-brand-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                  title="Voice Call"
                >
                  <Phone className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setShowZegoModal(true)}
                  className="p-2 rounded-xl text-slate-400 hover:text-brand-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                  title="Video Call"
                >
                  <Video className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="p-4 flex-1 overflow-y-auto space-y-3 min-h-[320px]">
              {activeConv.messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[75%] p-3.5 rounded-2xl text-xs space-y-1 ${
                      msg.isMe
                        ? 'bg-brand-600 text-white rounded-br-none'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-bl-none'
                    }`}
                  >
                    <p>{msg.text}</p>
                    <span className={`text-[9px] block text-right ${msg.isMe ? 'text-brand-200' : 'text-slate-400'}`}>
                      {msg.timestamp}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Chat Input Bar */}
            <form onSubmit={handleSend} className="p-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowZegoModal(true)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <Paperclip className="w-5 h-5" />
              </button>

              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={`Message ${activeConv.peerName}...`}
                className="flex-1 px-4 py-2.5 rounded-xl text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />

              <Button type="submit" variant="primary" size="sm" icon={Send}>
                Send
              </Button>
            </form>
          </Card>
        )}
      </div>

      <IntegrationModal
        isOpen={showZegoModal}
        onClose={() => setShowZegoModal(false)}
        serviceType="zegocloud"
        featureTitle="1-to-1 Voice & Video Call Signaling"
      />
    </div>
  );
};
