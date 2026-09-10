// Lightweight Client-Side Router for Connecta (KC APP)

export type RoutePattern =
  | '/'
  | '/home'
  | '/feed'
  | '/profile'
  | '/profile/:username'
  | '/friends'
  | '/friends/requests'
  | '/friends/suggestions'
  | '/following'
  | '/stories'
  | '/stories/:id'
  | '/messages'
  | '/messages/:conversationId'
  | '/notifications'
  | '/search'
  | '/search/:category'
  | '/groups'
  | '/groups/:id'
  | '/groups/:id/members'
  | '/groups/:id/posts'
  | '/pages'
  | '/pages/:id'
  | '/events'
  | '/events/:id'
  | '/memories'
  | '/saved'
  | '/photos'
  | '/albums'
  | '/albums/:id'
  | '/videos'
  | '/watch'
  | '/marketplace'
  | '/marketplace/:id'
  | '/settings'
  | '/settings/:subtab'
  | '/admin'
  | '/admin/login'
  | '/admin/dashboard'
  | '/admin/users'
  | '/admin/users/:id'
  | '/admin/posts'
  | '/admin/comments'
  | '/admin/stories'
  | '/admin/reports'
  | '/admin/moderation'
  | '/admin/groups'
  | '/admin/pages'
  | '/admin/events'
  | '/admin/marketplace'
  | '/admin/notifications'
  | '/admin/analytics'
  | '/admin/logs'
  | '/admin/settings'
  | '/admin/roles'
  | '*';

export interface RouteMatch {
  path: string;
  pattern: string;
  params: Record<string, string>;
}

export type RouteListener = (routeMatch: RouteMatch) => void;

class Router {
  private listeners: Set<RouteListener> = new Set();

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('popstate', () => {
        this.notify();
      });
    }
  }

  public getPath(): string {
    if (typeof window === 'undefined') return '/feed';
    const path = window.location.pathname;
    return path;
  }

  public navigate(path: string, replace = false) {
    if (typeof window === 'undefined') return;
    if (window.location.pathname === path) return;

    if (replace) {
      window.history.replaceState({}, '', path);
    } else {
      window.history.pushState({}, '', path);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.notify();
  }

  public subscribe(listener: RouteListener): () => void {
    this.listeners.add(listener);
    // Immediate notification of current path
    listener(this.matchCurrentRoute());
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    const current = this.matchCurrentRoute();
    this.listeners.forEach((listener) => listener(current));
  }

  public matchCurrentRoute(): RouteMatch {
    const currentPath = this.getPath();

    // Match static & parameterized routes
    const routes: RoutePattern[] = [
      '/admin/users/:id',
      '/admin/login',
      '/admin/dashboard',
      '/admin/users',
      '/admin/posts',
      '/admin/comments',
      '/admin/stories',
      '/admin/reports',
      '/admin/moderation',
      '/admin/groups',
      '/admin/pages',
      '/admin/events',
      '/admin/marketplace',
      '/admin/notifications',
      '/admin/analytics',
      '/admin/logs',
      '/admin/settings',
      '/admin/roles',
      '/admin',
      '/profile/:username',
      '/stories/:id',
      '/messages/:conversationId',
      '/search/:category',
      '/groups/:id/members',
      '/groups/:id/posts',
      '/groups/:id',
      '/pages/:id',
      '/events/:id',
      '/marketplace/:id',
      '/albums/:id',
      '/settings/:subtab',
      '/feed',
      '/home',
      '/',
      '/profile',
      '/friends/requests',
      '/friends/suggestions',
      '/friends',
      '/following',
      '/stories',
      '/messages',
      '/notifications',
      '/search',
      '/groups',
      '/pages',
      '/events',
      '/memories',
      '/saved',
      '/photos',
      '/videos',
      '/watch',
      '/marketplace',
      '/settings',
    ];

    for (const pattern of routes) {
      const params = this.matchPattern(pattern, currentPath);
      if (params !== null) {
        return { path: currentPath, pattern, params };
      }
    }

    return { path: currentPath, pattern: '*', params: {} };
  }

  private matchPattern(pattern: string, path: string): Record<string, string> | null {
    const patternParts = pattern.split('/').filter(Boolean);
    const pathParts = path.split('/').filter(Boolean);

    if (patternParts.length !== pathParts.length) return null;

    const params: Record<string, string> = {};

    for (let i = 0; i < patternParts.length; i++) {
      if (patternParts[i].startsWith(':')) {
        const paramName = patternParts[i].slice(1);
        params[paramName] = decodeURIComponent(pathParts[i]);
      } else if (patternParts[i] !== pathParts[i]) {
        return null;
      }
    }

    return params;
  }
}

export const router = new Router();
