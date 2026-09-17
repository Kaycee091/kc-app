import { Post, ReactionType, PostComment, PostPrivacy } from '../types/social';
import { DEMO_POSTS } from './mockSocialData';
import { realtimeEngine } from './realtimeService';
import { authService } from './authService';

const POSTS_KEY = 'connecta_posts_db';
const HIDDEN_POSTS_KEY = 'connecta_hidden_posts_db';

class PostsService {
  private posts: Post[] = [];
  private hiddenPostIds: string[] = [];

  /** Ensure every post always has reactions[] and comments[] arrays */
  private normalize(posts: Post[]): Post[] {
    return posts.map((p) => ({
      ...p,
      reactions: Array.isArray(p.reactions) ? p.reactions : [],
      comments: Array.isArray(p.comments) ? p.comments : [],
    }));
  }

  constructor() {
    if (typeof localStorage === 'undefined') {
      this.posts = this.normalize(DEMO_POSTS);
      this.hiddenPostIds = [];
      return;
    }
    const saved = localStorage.getItem(POSTS_KEY);
    this.posts = this.normalize(saved ? JSON.parse(saved) : DEMO_POSTS);

    const savedHidden = localStorage.getItem(HIDDEN_POSTS_KEY);
    this.hiddenPostIds = savedHidden ? JSON.parse(savedHidden) : [];
  }

  private persist() {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(POSTS_KEY, JSON.stringify(this.posts));
    localStorage.setItem(HIDDEN_POSTS_KEY, JSON.stringify(this.hiddenPostIds));
  }

  getPosts(includeHidden = false): Post[] {
    if (includeHidden) return this.posts;
    return this.posts.filter((p) => !this.hiddenPostIds.includes(p.id));
  }

  getHiddenPostIds(): string[] {
    return this.hiddenPostIds;
  }

  toggleHidePost(postId: string): boolean {
    const isHidden = this.hiddenPostIds.includes(postId);
    if (isHidden) {
      this.hiddenPostIds = this.hiddenPostIds.filter((id) => id !== postId);
    } else {
      this.hiddenPostIds = [...this.hiddenPostIds, postId];
    }
    this.persist();
    realtimeEngine.broadcast('post_visibility_changed', { postId, isHidden: !isHidden });
    return !isHidden;
  }

  async createPost(data: {
    content: string;
    mediaUrls?: string[];
    privacy: PostPrivacy;
    feeling?: string;
    location?: string;
    bgStyle?: string;
    pollQuestion?: string;
    pollOptions?: string[];
  }): Promise<Post> {
    const user = authService.getCurrentUser();
    if (!user) throw new Error('Unauthenticated');

    const newPost: Post = {
      id: `post_${Date.now()}`,
      author_id: user.id,
      author: user,
      content: data.content,
      privacy: data.privacy,
      feeling: data.feeling,
      location: data.location,
      bg_style: data.bgStyle,
      media: data.mediaUrls?.map((url, i) => ({ id: `m_${Date.now()}_${i}`, media_type: 'image', url })),
      poll: data.pollQuestion
        ? {
            question: data.pollQuestion,
            options: (data.pollOptions || []).map((txt, idx) => ({ id: `opt_${idx}`, text: txt, votes: [] })),
          }
        : undefined,
      reactions: [],
      comments: [],
      comments_count: 0,
      shares_count: 0,
      created_at: new Date().toISOString(),
    };

    this.posts = [newPost, ...this.posts];
    this.persist();
    realtimeEngine.broadcast('new_post', newPost);
    realtimeEngine.broadcast('db_posts_updated', this.posts);

    // Persist to Django backend
    fetch('/api/v1/posts/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Id': user.id,
      },
      body: JSON.stringify({
        id: newPost.id,
        author_id: user.id,
        content: newPost.content,
        privacy: newPost.privacy,
        location: newPost.location || '',
        media_urls: data.mediaUrls || [],
        post_type: (data.mediaUrls && data.mediaUrls.length > 0) ? 'image' : 'text',
      }),
    }).catch((err) => {
      console.warn('[PostsService] Failed to persist post to backend', err);
    });

    return newPost;
  }

  async toggleReaction(postId: string, reactionType: ReactionType): Promise<Post> {
    const user = authService.getCurrentUser();
    if (!user) throw new Error('Unauthenticated');

    this.posts = this.posts.map((p) => {
      if (p.id !== postId) return p;
      const reactions = p.reactions ?? [];
      const existingSame = reactions.find((r) => r.user_id === user.id && r.reaction_type === reactionType);
      let updated;
      if (existingSame) {
        updated = reactions.filter((r) => r.user_id !== user.id);
      } else {
        const filteredOther = reactions.filter((r) => r.user_id !== user.id);
        updated = [...filteredOther, { id: `r_${Date.now()}`, user_id: user.id, reaction_type: reactionType, user }];
      }
      return { ...p, reactions: updated };
    });

    this.persist();
    realtimeEngine.broadcast('post_reaction', { postId, userId: user.id, reactionType });
    return this.posts.find((p) => p.id === postId)!;
  }

  async addComment(postId: string, content: string, parentId?: string, imageUrl?: string): Promise<PostComment> {
    const user = authService.getCurrentUser();
    if (!user) throw new Error('Unauthenticated');

    const newComment: PostComment = {
      id: `c_${Date.now()}`,
      post_id: postId,
      author_id: user.id,
      author: user,
      parent_id: parentId,
      content,
      image_url: imageUrl,
      created_at: new Date().toISOString(),
    };

    this.posts = this.posts.map((p) => {
      if (p.id !== postId) return p;
      const comments = p.comments ?? [];
      return {
        ...p,
        comments: [...comments, newComment],
        comments_count: (p.comments_count ?? 0) + 1,
      };
    });

    this.persist();
    realtimeEngine.broadcast('post_comment', { postId, comment: newComment });
    return newComment;
  }

  deletePost(postId: string) {
    this.posts = this.posts.filter((p) => p.id !== postId);
    this.hiddenPostIds = this.hiddenPostIds.filter((id) => id !== postId);
    this.persist();
    realtimeEngine.broadcast('admin_post_deleted', { postId });
    realtimeEngine.broadcast('db_posts_updated', this.posts);
    fetch(`/api/v1/posts/${postId}/`, { method: 'DELETE' }).catch(() => {});
  }

  hidePost(postId: string) {
    if (!this.hiddenPostIds.includes(postId)) {
      this.hiddenPostIds = [...this.hiddenPostIds, postId];
      this.persist();
      realtimeEngine.broadcast('admin_post_hidden', { postId });
    }
  }

  restorePost(postId: string) {
    if (this.hiddenPostIds.includes(postId)) {
      this.hiddenPostIds = this.hiddenPostIds.filter((id) => id !== postId);
      this.persist();
      realtimeEngine.broadcast('admin_post_restored', { postId });
    }
  }

  deleteComment(postId: string, commentId: string) {
    this.posts = this.posts.map((p) => {
      if (p.id !== postId) return p;
      const updatedComments = p.comments.filter((c) => c.id !== commentId);
      return {
        ...p,
        comments: updatedComments,
        comments_count: Math.max(0, p.comments_count - 1),
      };
    });
    this.persist();
    realtimeEngine.broadcast('admin_comment_deleted', { postId, commentId });
    realtimeEngine.broadcast('db_posts_updated', this.posts);
  }

  toggleSavePost(postId: string) {
    this.posts = this.posts.map((p) => (p.id === postId ? { ...p, is_saved: !p.is_saved } : p));
    this.persist();
  }

  votePoll(postId: string, optionId: string): Post {
    const user = authService.getCurrentUser();
    if (!user) throw new Error('Unauthenticated');

    this.posts = this.posts.map((p) => {
      if (p.id !== postId || !p.poll) return p;
      const updatedOptions = p.poll.options.map((opt) => {
        // Remove existing vote by this user across options
        const filteredVotes = opt.votes.filter((v) => v !== user.id);
        if (opt.id === optionId) {
          return { ...opt, votes: [...filteredVotes, user.id] };
        }
        return { ...opt, votes: filteredVotes };
      });
      return { ...p, poll: { ...p.poll, options: updatedOptions } };
    });

    this.persist();
    const updated = this.posts.find((p) => p.id === postId)!;
    realtimeEngine.broadcast('poll_vote', { postId, optionId, userId: user.id });
    return updated;
  }

  editPost(postId: string, content: string): Post {
    this.posts = this.posts.map((p) => (p.id === postId ? { ...p, content } : p));
    this.persist();
    return this.posts.find((p) => p.id === postId)!;
  }

  sharePost(postId: string, comment?: string): Post {
    const user = authService.getCurrentUser();
    if (!user) throw new Error('Unauthenticated');

    const original = this.posts.find((p) => p.id === postId);
    if (!original) throw new Error('Post not found');

    // Increment shares count on original
    this.posts = this.posts.map((p) => (p.id === postId ? { ...p, shares_count: p.shares_count + 1 } : p));

    // Create shared post
    const sharedPost: Post = {
      id: `post_${Date.now()}`,
      author_id: user.id,
      author: user,
      content: comment || '',
      privacy: 'public',
      shared_post_id: original.id,
      shared_post: original,
      reactions: [],
      comments: [],
      comments_count: 0,
      shares_count: 0,
      created_at: new Date().toISOString(),
    };

    this.posts = [sharedPost, ...this.posts];
    this.persist();
    realtimeEngine.broadcast('new_post', sharedPost);
    return sharedPost;
  }

  togglePinPost(postId: string): Post {
    this.posts = this.posts.map((p) => (p.id === postId ? { ...p, is_pinned: !p.is_pinned } : p));
    this.persist();
    return this.posts.find((p) => p.id === postId)!;
  }

  toggleCommentsDisabled(postId: string): Post {
    this.posts = this.posts.map((p) => (p.id === postId ? { ...p, comments_disabled: !p.comments_disabled } : p));
    this.persist();
    return this.posts.find((p) => p.id === postId)!;
  }
}

export const postsService = new PostsService();

