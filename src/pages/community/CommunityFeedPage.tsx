import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Users,
  MessageSquare,
  Heart,
  Bookmark,
  Share2,
  Plus,
  Video,
  Send,
  RefreshCw,
  AlertCircle,
  X,
  Loader2
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Avatar } from '../../components/common/Avatar';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { SearchBar } from '../../components/common/SearchBar';
import { IntegrationModal } from '../../components/feedback/IntegrationModal';

export const CommunityFeedPage: React.FC = () => {
  const {
    posts,
    createPost,
    toggleLikePost,
    toggleBookmarkPost,
    addCommentToPost,
    fetchCommentsForPost,
    isCommunityLoading,
    hasNewPosts,
    refreshPosts,
    loadMorePosts,
    communityError,
    clearCommunityError,
  } = useData();
  const { student } = useAuth();

  const [search, setSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('All');
  const [showCreatePostModal, setShowCreatePostModal] = useState(false);
  const [showZegoModal, setShowZegoModal] = useState(false);

  // Loading & In-flight states
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [likingPostId, setLikingPostId] = useState<string | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // New Post State
  const [postTitle, setPostTitle] = useState('');
  const [postCategory, setPostCategory] = useState('Anatomy Tips');
  const [postContent, setPostContent] = useState('');

  // Comment State per post
  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [loadingCommentsPostId, setLoadingCommentsPostId] = useState<string | null>(null);

  // Expanding a post's comments always fetches the authoritative, full comment list from
  // the server (getComments), rather than trusting whatever was embedded at initial feed
  // load (getPosts always returns comments: []). This fixes comments from other users, or
  // from earlier sessions, not showing up / count mismatching the visible list.
  const handleToggleComments = async (postId: string) => {
    const isOpening = activeCommentPostId !== postId;
    setActiveCommentPostId(isOpening ? postId : null);

    if (isOpening) {
      setLoadingCommentsPostId(postId);
      try {
        await fetchCommentsForPost(postId);
      } finally {
        setLoadingCommentsPostId(null);
      }
    }
  };

  const tags = ['All', 'Anatomy Tips', 'Pharmacology Tips', 'NCLEX', 'Study Groups', 'Clinical Stories'];

  const filteredPosts = posts.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.content.toLowerCase().includes(search.toLowerCase()) ||
      p.authorName.toLowerCase().includes(search.toLowerCase());

    const matchesTag = selectedTag === 'All' || p.category === selectedTag;

    return matchesSearch && matchesTag;
  });

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postTitle.trim() || !postContent.trim() || isCreatingPost) return;

    setIsCreatingPost(true);
    try {
      await createPost(postTitle, postContent, postCategory, ['#NursingStudent', '#NursaFlow']);
      setPostTitle('');
      setPostContent('');
      setShowCreatePostModal(false);
    } catch (err) {
      console.error('[CommunityFeedPage] Failed to create post:', err);
    } finally {
      setIsCreatingPost(false);
    }
  };

  const handleToggleLike = async (postId: string) => {
    if (likingPostId === postId) return;
    setLikingPostId(postId);
    try {
      await toggleLikePost(postId);
    } finally {
      setLikingPostId(null);
    }
  };

  const handleAddComment = async (postId: string) => {
    if (!commentText.trim() || isSubmittingComment) return;

    setIsSubmittingComment(true);
    try {
      await addCommentToPost(postId, commentText);
      setCommentText('');
    } catch (err) {
      console.error('[CommunityFeedPage] Failed to add comment:', err);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleLoadMore = async () => {
    if (isLoadingMore) return;
    setIsLoadingMore(true);
    try {
      await loadMorePosts();
    } finally {
      setIsLoadingMore(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <Users className="w-8 h-8 text-brand-600 dark:text-brand-400" />
            <span>Nursing Peer Community</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Connect with nursing students, share study hacks, ask clinical questions & join live study rooms.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="glass"
            icon={Video}
            onClick={() => setShowZegoModal(true)}
          >
            Start Live Study Room
          </Button>

          <Button
            variant="primary"
            icon={Plus}
            onClick={() => setShowCreatePostModal(true)}
          >
            Create Discussion Post
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

      {/* Floating/Sticky New Posts Available Banner */}
      {hasNewPosts && (
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-brand-600 to-teal-600 text-white shadow-lg flex items-center justify-between gap-4 animate-bounce">
          <div className="flex items-center gap-2 text-xs font-bold">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>New discussion posts available in community!</span>
          </div>
          <Button size="sm" variant="glass" onClick={refreshPosts} className="text-xs">
            Refresh Feed
          </Button>
        </div>
      )}

      {/* Tag Navigation & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto no-scrollbar py-1">
          {tags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                selectedTag === tag
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        <div className="w-full sm:w-64">
          <SearchBar value={search} onChange={setSearch} placeholder="Search discussions..." />
        </div>
      </div>

      {/* Initial Loading Skeleton */}
      {isCommunityLoading ? (
        <div className="space-y-6 max-w-3xl">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-6 space-y-4 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-800" />
                <div className="space-y-2 flex-1">
                  <div className="w-32 h-4 rounded bg-slate-800" />
                  <div className="w-24 h-3 rounded bg-slate-800/60" />
                </div>
              </div>
              <div className="w-3/4 h-5 rounded bg-slate-800" />
              <div className="w-full h-12 rounded bg-slate-800/40" />
            </Card>
          ))}
        </div>
      ) : (
        /* Community Feed Posts */
        <div className="space-y-6 max-w-3xl">
          {filteredPosts.length === 0 ? (
            <Card className="p-8 text-center space-y-3">
              <Users className="w-10 h-10 text-slate-500 mx-auto" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">No discussions found</h3>
              <p className="text-xs text-slate-400">Be the first nursing peer to start a conversation on this topic!</p>
            </Card>
          ) : (
            filteredPosts.map((post) => (
              <Card key={post.id} className="space-y-4">
                {/* Post Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Avatar src={post.authorAvatar} name={post.authorName} size="md" />
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <span>{post.authorName}</span>
                        <Badge variant="brand" size="sm">{post.authorLevel}</Badge>
                      </h4>
                      <p className="text-xs text-slate-400">
                        {post.authorSchool} • {new Date(post.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <Badge variant="neutral">{post.category}</Badge>
                </div>

                {/* Post Content Body */}
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {post.title}
                  </h3>
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                    {post.content}
                  </p>
                </div>

                {/* Post Tags */}
                <div className="flex flex-wrap gap-1.5">
                  {post.tags.map((tag, idx) => (
                    <span key={idx} className="text-xs font-semibold text-brand-600 dark:text-brand-400">
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Action Bar */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold text-slate-500">
                  <div className="flex items-center gap-6">
                    <button
                      onClick={() => handleToggleLike(post.id)}
                      disabled={likingPostId === post.id}
                      className={`flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 ${
                        post.isLiked ? 'text-rose-500' : 'hover:text-rose-500'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${post.isLiked ? 'fill-current text-rose-500' : ''}`} />
                      <span>{post.likesCount} Likes</span>
                    </button>

                    <button
                      onClick={() => handleToggleComments(post.id)}
                      className="flex items-center gap-1.5 hover:text-brand-500 transition-colors cursor-pointer"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>{post.commentsCount} Comments</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleBookmarkPost(post.id)}
                      className={`p-1.5 rounded-lg cursor-pointer ${
                        post.isBookmarked ? 'text-amber-500 bg-amber-500/10' : 'hover:text-slate-800'
                      }`}
                    >
                      <Bookmark className="w-4 h-4 fill-current" />
                    </button>

                    <button className="p-1.5 rounded-lg hover:text-slate-800 cursor-pointer">
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Expandable Comments Section */}
                {activeCommentPostId === post.id && (
                  <div className="pt-4 space-y-4 border-t border-slate-100 dark:border-slate-800 animate-in fade-in duration-200">
                    {/* Comments List */}
                    <div className="space-y-3">
                      {loadingCommentsPostId === post.id ? (
                        <div className="flex items-center gap-2 text-xs text-slate-400 py-2">
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Loading comments...</span>
                        </div>
                      ) : post.comments.length === 0 ? (
                        <p className="text-xs text-slate-400 py-1">No comments yet — be the first to reply.</p>
                      ) : null}
                      {post.comments.map((c) => (
                        <div key={c.id} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 flex items-start gap-3">
                          <Avatar src={c.authorAvatar} name={c.authorName} size="sm" />
                          <div className="flex-1 min-w-0 space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-slate-900 dark:text-white">
                                {c.authorName}
                              </span>
                              <span className="text-[10px] text-slate-400">{new Date(c.createdAt).toLocaleDateString()}</span>
                            </div>
                            <p className="text-xs text-slate-700 dark:text-slate-300">{c.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Add Comment Box */}
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="Write a comment..."
                        disabled={isSubmittingComment}
                        className="flex-1 px-4 py-2 rounded-xl text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:opacity-50"
                      />
                      <Button size="sm" variant="primary" icon={isSubmittingComment ? Loader2 : Send} onClick={() => handleAddComment(post.id)} disabled={isSubmittingComment}>
                        {isSubmittingComment ? 'Sending...' : 'Send'}
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            ))
          )}

          {/* Load More Posts Pagination Button */}
          {filteredPosts.length > 0 && (
            <div className="text-center pt-4">
              <Button
                variant="outline"
                onClick={handleLoadMore}
                disabled={isLoadingMore}
                icon={isLoadingMore ? Loader2 : RefreshCw}
              >
                {isLoadingMore ? 'Loading More Posts...' : 'Load More Discussions'}
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Create Discussion Post Modal */}
      <Modal isOpen={showCreatePostModal} onClose={() => !isCreatingPost && setShowCreatePostModal(false)} title="Create Community Discussion">
        <form onSubmit={handleCreatePost} className="space-y-4 pt-2">
          <Input
            label="Post Title"
            placeholder="e.g. What is the easiest way to remember cranial nerves?"
            value={postTitle}
            onChange={(e) => setPostTitle(e.target.value)}
            required
            disabled={isCreatingPost}
          />

          <Select
            label="Category"
            value={postCategory}
            onChange={(e) => setPostCategory(e.target.value)}
            disabled={isCreatingPost}
            options={[
              { value: 'Anatomy Tips', label: 'Anatomy Tips' },
              { value: 'Pharmacology Tips', label: 'Pharmacology Tips' },
              { value: 'NCLEX Prep', label: 'NCLEX Prep' },
              { value: 'Study Groups', label: 'Study Groups' },
              { value: 'Clinical Stories', label: 'Clinical Stories' },
            ]}
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Discussion Content
            </label>
            <textarea
              rows={5}
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              placeholder="Ask a question or share a nursing clinical tip with peers..."
              disabled={isCreatingPost}
              className="w-full p-4 rounded-xl text-sm border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:opacity-50"
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" type="button" onClick={() => setShowCreatePostModal(false)} disabled={isCreatingPost}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={isCreatingPost} icon={isCreatingPost ? Loader2 : undefined}>
              {isCreatingPost ? 'Publishing...' : 'Publish Post'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ZEGOCLOUD Live Room Placeholder Modal */}
      <IntegrationModal
        isOpen={showZegoModal}
        onClose={() => setShowZegoModal(false)}
        serviceType="zegocloud"
        featureTitle="Live Audio/Video Study Room"
      />
    </div>
  );
};
