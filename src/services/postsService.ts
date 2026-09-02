import { Post, ReactionType, PostComment, PostPrivacy } from '../types/social';
import { DEMO_POSTS } from './mockSocialData';
import { realtimeEngine } from './realtimeService';
import { authService } from './authService';

const POSTS_KEY = 'connecta_posts_db';

class PostsService {
  private posts: Post[] = [];

  constructor() {
    const saved = localStorage.getItem(POSTS_KEY);
    this.posts = saved ? JSON.parse(saved) : DEMO_POSTS;
  }

  private persist() {
    localStorage.setItem(POSTS_KEY, JSON.stringify(this.posts));
  }

  getPosts(): Post[] {
    return this.posts;
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
    return newPost;
  }

  async toggleReaction(postId: string, reactionType: ReactionType): Promise<Post> {
    const user = authService.getCurrentUser();
    if (!user) throw new Error('Unauthenticated');

    this.posts = this.posts.map((p) => {
      if (p.id !== postId) return p;
      const existingSame = p.reactions.find((r) => r.user_id === user.id && r.reaction_type === reactionType);
      let updated;
      if (existingSame) {
        updated = p.reactions.filter((r) => r.user_id !== user.id);
      } else {
        const filteredOther = p.reactions.filter((r) => r.user_id !== user.id);
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
      return {
        ...p,
        comments: [...p.comments, newComment],
        comments_count: p.comments_count + 1,
      };
    });

    this.persist();
    realtimeEngine.broadcast('post_comment', { postId, comment: newComment });
    return newComment;
  }

  deletePost(postId: string) {
    this.posts = this.posts.filter((p) => p.id !== postId);
    this.persist();
  }

  toggleSavePost(postId: string) {
    this.posts = this.posts.map((p) => (p.id === postId ? { ...p, is_saved: !p.is_saved } : p));
    this.persist();
  }
}

export const postsService = new PostsService();
