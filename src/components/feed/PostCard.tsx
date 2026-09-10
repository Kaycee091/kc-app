import React, { useState } from 'react';
import { Post, ReactionType } from '../../types/social';
import { useAuth } from '../../context/AuthContext';
import { useSocial } from '../../context/SocialContext';
import { Avatar } from '../ui/Avatar';
import { ReactionsPicker } from './ReactionsPicker';
import { CommentSection } from './CommentSection';
import { ShareModal } from './ShareModal';
import { formatDistanceToNow } from 'date-fns';
import {
  Globe,
  Users,
  Lock,
  ThumbsUp,
  MessageSquare,
  Share2,
  Bookmark,
  MoreHorizontal,
  MapPin,
  Smile,
  Trash2,
  Flag,
  Copy,
  Pin,
  Edit2,
  MessageSquareOff,
  CheckCircle2
} from 'lucide-react';
import { clsx } from 'clsx';

interface PostCardProps {
  post: Post;
}

const EMOJI_MAP: Record<ReactionType, string> = {
  like: '👍',
  love: '❤️',
  care: '🥰',
  haha: '😂',
  wow: '😮',
  sad: '😢',
  angry: '😡',
};

export const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const { user } = useAuth();
  const {
    toggleReaction,
    addComment,
    toggleSavePost,
    deletePost,
    votePoll,
    editPost,
    togglePinPost,
    toggleCommentsDisabled,
    submitReport,
    setViewingProfileUser,
    setActiveTab,
  } = useSocial();

  const [showReactions, setShowReactions] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showPostMenu, setShowPostMenu] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Edit Mode states
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);

  const isAuthorMe = post.author_id === user?.id;

  // Normalize to arrays — seeded posts may have undefined reactions/comments
  const reactions = post.reactions ?? [];
  const comments = post.comments ?? [];

  const userReaction = reactions.find((r) => r.user_id === user?.id);

  // Group reaction counts by emoji
  const reactionCounts = reactions.reduce<Record<string, number>>((acc, r) => {
    acc[r.reaction_type] = (acc[r.reaction_type] || 0) + 1;
    return acc;
  }, {});

  const topReactions = Object.keys(reactionCounts).slice(0, 3) as ReactionType[];

  const handleAuthorClick = () => {
    if (post.author) {
      setViewingProfileUser(post.author);
      setActiveTab('profile');
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 1500);
  };

  const handleSaveEdit = () => {
    if (editContent.trim()) {
      editPost(post.id, editContent);
    }
    setIsEditing(false);
  };

  // Poll percentage calculation helper
  const totalPollVotes = post.poll
    ? post.poll.options.reduce((sum, opt) => sum + opt.votes.length, 0)
    : 0;

  return (
    <article className="bg-white dark:bg-slate-800/90 rounded-3xl shadow-sm border border-slate-200/80 dark:border-slate-700/80 p-4 space-y-3.5 transition-all animate-fade-in relative">
      
      {/* Pinned Post Badge */}
      {post.is_pinned && (
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#2563EB] bg-blue-50 dark:bg-blue-950/60 px-3 py-1 rounded-full w-max">
          <Pin className="w-3 h-3 fill-current" /> Pinned Post
        </div>
      )}

      {/* 1. AUTHOR HEADER */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 cursor-pointer" onClick={handleAuthorClick}>
          <Avatar
            src={post.author?.avatar_url}
            name={post.author?.full_name || 'User'}
            size="md"
            isVerified={post.author?.is_verified}
          />

          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white hover:underline">
                {post.author?.full_name}
              </h4>
              {post.feeling && (
                <span className="text-xs text-slate-500 font-medium">
                  is feeling {post.feeling}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium mt-0.5">
              <span>{formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</span>
              <span>·</span>
              <span title={post.privacy}>
                {post.privacy === 'public' && <Globe className="w-3 h-3" />}
                {post.privacy === 'friends' && <Users className="w-3 h-3" />}
                {post.privacy === 'only_me' && <Lock className="w-3 h-3" />}
              </span>
              {post.location && (
                <>
                  <span>·</span>
                  <span className="flex items-center gap-0.5">
                    <MapPin className="w-3 h-3 text-rose-500" /> {post.location}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Post Options Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowPostMenu(!showPostMenu)}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>

          {showPostMenu && (
            <div
              className="absolute right-0 mt-1 w-48 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 py-1.5 z-30 text-xs font-semibold"
              onClick={() => setShowPostMenu(false)}
            >
              <button
                onClick={() => toggleSavePost(post.id)}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <Bookmark className="w-4 h-4 text-purple-500" />
                <span>{post.is_saved ? 'Unsave Post' : 'Save Post'}</span>
              </button>

              <button
                onClick={handleCopyLink}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <Copy className="w-4 h-4 text-slate-500" />
                <span>{copiedLink ? 'Link Copied!' : 'Copy Link'}</span>
              </button>

              {isAuthorMe && (
                <>
                  <button
                    onClick={() => togglePinPost(post.id)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <Pin className="w-4 h-4 text-[#2563EB]" />
                    <span>{post.is_pinned ? 'Unpin Post' : 'Pin to Profile'}</span>
                  </button>

                  <button
                    onClick={() => setIsEditing(true)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <Edit2 className="w-4 h-4 text-emerald-500" />
                    <span>Edit Post</span>
                  </button>

                  <button
                    onClick={() => toggleCommentsDisabled(post.id)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <MessageSquareOff className="w-4 h-4 text-amber-500" />
                    <span>{post.comments_disabled ? 'Enable Comments' : 'Turn Off Comments'}</span>
                  </button>

                  <button
                    onClick={() => deletePost(post.id)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/60"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete Post</span>
                  </button>
                </>
              )}

              {!isAuthorMe && (
                <button
                  onClick={() => submitReport('post', post.id, 'Inappropriate content')}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/60"
                >
                  <Flag className="w-4 h-4" />
                  <span>Report Post</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 2. POST CONTENT / EDIT MODE */}
      {isEditing ? (
        <div className="space-y-2">
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="w-full p-3 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
            rows={3}
          />
          <div className="flex justify-end gap-2">
            <button onClick={() => setIsEditing(false)} className="px-3 py-1 text-xs text-slate-500 font-bold">
              Cancel
            </button>
            <button onClick={handleSaveEdit} className="px-3 py-1 text-xs bg-[#2563EB] text-white rounded-lg font-bold">
              Save
            </button>
          </div>
        </div>
      ) : (
        post.content && (
          <div className={post.bg_style ? post.bg_style : 'text-sm text-slate-900 dark:text-slate-100 font-normal leading-relaxed whitespace-pre-wrap'}>
            {post.content}
          </div>
        )
      )}

      {/* Media Image Grid */}
      {post.media && post.media.length > 0 && (
        <div
          className={clsx(
            'grid gap-1.5 rounded-2xl overflow-hidden',
            post.media.length === 1 ? 'grid-cols-1' : 'grid-cols-2'
          )}
        >
          {post.media.map((item) => (
            <img
              key={item.id}
              src={item.url}
              alt="Post attachment"
              className="w-full max-h-96 object-cover rounded-xl cursor-pointer hover:opacity-95 transition-opacity"
              onClick={() => window.open(item.url, '_blank')}
            />
          ))}
        </div>
      )}

      {/* Shared Post Card Attachment */}
      {post.shared_post && (
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-2">
          <div className="flex items-center gap-2">
            <Avatar src={post.shared_post.author?.avatar_url} name={post.shared_post.author?.full_name || 'User'} size="sm" />
            <span className="text-xs font-bold text-slate-900 dark:text-white">{post.shared_post.author?.full_name}</span>
          </div>
          <p className="text-xs text-slate-700 dark:text-slate-300">{post.shared_post.content}</p>
        </div>
      )}

      {/* Interactive Poll Widget with Live Vote Percentages */}
      {post.poll && (
        <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-800/80 space-y-3">
          <div className="flex justify-between items-center">
            <h5 className="text-xs font-bold text-slate-900 dark:text-white">
              📊 {post.poll.question}
            </h5>
            <span className="text-[10px] text-slate-400 font-mono">{totalPollVotes} votes</span>
          </div>

          <div className="space-y-2">
            {post.poll.options.map((opt) => {
              const hasVotedThis = user ? opt.votes.includes(user.id) : false;
              const percentage = totalPollVotes > 0 ? Math.round((opt.votes.length / totalPollVotes) * 100) : 0;

              return (
                <button
                  key={opt.id}
                  onClick={() => votePoll(post.id, opt.id)}
                  className={clsx(
                    'w-full p-2.5 rounded-xl text-xs font-semibold transition-all relative overflow-hidden text-left flex justify-between items-center border',
                    hasVotedThis
                      ? 'border-[#2563EB] bg-blue-100/60 dark:bg-blue-900/60 text-[#2563EB]'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:border-[#2563EB]'
                  )}
                >
                  {/* Progress background bar */}
                  <div
                    className="absolute left-0 top-0 bottom-0 bg-[#2563EB]/15 transition-all duration-500 pointer-events-none"
                    style={{ width: `${percentage}%` }}
                  />
                  
                  <span className="z-10 flex items-center gap-1.5">
                    {opt.text}
                    {hasVotedThis && <CheckCircle2 className="w-3.5 h-3.5 text-[#2563EB]" />}
                  </span>

                  <span className="z-10 text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400">
                    {percentage}% ({opt.votes.length})
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. REACTION & COMMENT COUNTS */}
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1 pb-2 border-b border-slate-100 dark:border-slate-700/80">
        <div className="flex items-center gap-1.5">
          {topReactions.length > 0 && (
            <div className="flex items-center -space-x-1">
              {topReactions.map((t) => (
                <span key={t} className="text-sm">
                  {EMOJI_MAP[t]}
                </span>
              ))}
            </div>
          )}
          <span className="font-semibold text-[11px]">
            {reactions.length > 0 ? reactions.length : 'Be the first to react'}
          </span>
        </div>

        <div className="flex items-center gap-3 text-[11px] font-medium">
          {post.comments_count > 0 && (
            <button onClick={() => setShowComments(!showComments)} className="hover:underline">
              {post.comments_count} comments
            </button>
          )}
          {post.shares_count > 0 && <span>{post.shares_count} shares</span>}
        </div>
      </div>

      {/* 4. POST ACTION BUTTONS */}
      <div className="relative flex items-center justify-between pt-1">
        
        {/* Reaction Hover Trigger */}
        <div
          className="relative flex-1"
          onMouseEnter={() => setShowReactions(true)}
          onMouseLeave={() => setShowReactions(false)}
        >
          {showReactions && (
            <ReactionsPicker
              onSelectReaction={(type) => {
                toggleReaction(post.id, type);
                setShowReactions(false);
              }}
            />
          )}

          <button
            onClick={() => toggleReaction(post.id, userReaction ? userReaction.reaction_type : 'like')}
            className={clsx(
              'w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all',
              userReaction
                ? 'text-[#2563EB] dark:text-blue-400 bg-blue-50/80 dark:bg-blue-950/60'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/60'
            )}
          >
            {userReaction ? (
              <span className="text-base">{EMOJI_MAP[userReaction.reaction_type]}</span>
            ) : (
              <ThumbsUp className="w-4 h-4" />
            )}
            <span>{userReaction ? userReaction.reaction_type.toUpperCase() : 'Like'}</span>
          </button>
        </div>

        {/* Comment button */}
        <button
          disabled={post.comments_disabled}
          onClick={() => !post.comments_disabled && setShowComments(!showComments)}
          className={clsx(
            'flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all',
            post.comments_disabled
              ? 'text-slate-400 opacity-60 cursor-not-allowed'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/60'
          )}
        >
          <MessageSquare className="w-4 h-4" />
          <span>{post.comments_disabled ? 'Comments Off' : 'Comment'}</span>
        </button>

        {/* Share button */}
        <button
          onClick={() => setShowShareModal(true)}
          className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/60 transition-all"
        >
          <Share2 className="w-4 h-4" />
          <span>Share</span>
        </button>
      </div>

      {/* 5. COMMENT SECTION STREAM */}
      {showComments && !post.comments_disabled && (
        <CommentSection
          comments={comments}
          onAddComment={(content, parentId, imageUrl) => addComment(post.id, content, parentId, imageUrl)}
        />
      )}

      {/* SHARE MODAL */}
      <ShareModal post={post} isOpen={showShareModal} onClose={() => setShowShareModal(false)} />

    </article>
  );
};

