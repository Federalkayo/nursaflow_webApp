import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Users,
  MessageSquare,
  Heart,
  Bookmark,
  Share2,
  Plus,
  Search,
  Video,
  Send,
  Sparkles,
  Award
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
  const { posts, createPost, toggleLikePost, toggleBookmarkPost, addCommentToPost } = useData();
  const { student } = useAuth();

  const [search, setSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('All');
  const [showCreatePostModal, setShowCreatePostModal] = useState(false);
  const [showZegoModal, setShowZegoModal] = useState(false);

  // New Post State
  const [postTitle, setPostTitle] = useState('');
  const [postCategory, setPostCategory] = useState('Anatomy Tips');
  const [postContent, setPostContent] = useState('');

  // Comment State per post
  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');

  const tags = ['All', 'Anatomy Tips', 'Pharmacology Tips', 'NCLEX', 'Study Groups', 'Clinical Stories'];

  const filteredPosts = posts.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.content.toLowerCase().includes(search.toLowerCase()) ||
      p.authorName.toLowerCase().includes(search.toLowerCase());

    const matchesTag = selectedTag === 'All' || p.category === selectedTag;

    return matchesSearch && matchesTag;
  });

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postTitle || !postContent) return;

    createPost(postTitle, postContent, postCategory, ['#NursingStudent', '#NursaFlow']);
    setPostTitle('');
    setPostContent('');
    setShowCreatePostModal(false);
  };

  const handleAddComment = (postId: string) => {
    if (!commentText.trim()) return;
    addCommentToPost(postId, commentText);
    setCommentText('');
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

      {/* Community Feed Posts */}
      <div className="space-y-6 max-w-3xl">
        {filteredPosts.map((post) => (
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
                    {post.authorSchool} • {post.createdAt}
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
                  onClick={() => toggleLikePost(post.id)}
                  className={`flex items-center gap-1.5 transition-colors ${
                    post.isLiked ? 'text-rose-500' : 'hover:text-rose-500'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${post.isLiked ? 'fill-current text-rose-500' : ''}`} />
                  <span>{post.likesCount} Likes</span>
                </button>

                <button
                  onClick={() => setActiveCommentPostId(activeCommentPostId === post.id ? null : post.id)}
                  className="flex items-center gap-1.5 hover:text-brand-500 transition-colors"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>{post.commentsCount} Comments</span>
                </button>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => toggleBookmarkPost(post.id)}
                  className={`p-1.5 rounded-lg ${
                    post.isBookmarked ? 'text-amber-500 bg-amber-500/10' : 'hover:text-slate-800'
                  }`}
                >
                  <Bookmark className="w-4 h-4 fill-current" />
                </button>

                <button className="p-1.5 rounded-lg hover:text-slate-800">
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Expandable Comments Section */}
            {activeCommentPostId === post.id && (
              <div className="pt-4 space-y-4 border-t border-slate-100 dark:border-slate-800 animate-in fade-in duration-200">
                {/* Comments List */}
                <div className="space-y-3">
                  {post.comments.map((c) => (
                    <div key={c.id} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 flex items-start gap-3">
                      <Avatar src={c.authorAvatar} name={c.authorName} size="sm" />
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900 dark:text-white">
                            {c.authorName}
                          </span>
                          <span className="text-[10px] text-slate-400">{c.createdAt}</span>
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
                    className="flex-1 px-4 py-2 rounded-xl text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                  <Button size="sm" variant="primary" icon={Send} onClick={() => handleAddComment(post.id)}>
                    Send
                  </Button>
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Create Discussion Post Modal */}
      <Modal isOpen={showCreatePostModal} onClose={() => setShowCreatePostModal(false)} title="Create Community Discussion">
        <form onSubmit={handleCreatePost} className="space-y-4 pt-2">
          <Input
            label="Post Title"
            placeholder="e.g. What is the easiest way to remember cranial nerves?"
            value={postTitle}
            onChange={(e) => setPostTitle(e.target.value)}
            required
          />

          <Select
            label="Category"
            value={postCategory}
            onChange={(e) => setPostCategory(e.target.value)}
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
              className="w-full p-4 rounded-xl text-sm border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" type="button" onClick={() => setShowCreatePostModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Publish Post
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
