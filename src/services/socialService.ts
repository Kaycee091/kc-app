import {
  UserProfile,
  Story,
  MarketplaceListing,
  Group,
  Page,
  EventItem,
  NotificationItem,
  ReportItem
} from '../types/social';
import {
  DEMO_USERS,
  DEMO_STORIES,
  DEMO_MARKETPLACE,
  DEMO_GROUPS,
  DEMO_PAGES,
  DEMO_EVENTS,
  DEMO_NOTIFICATIONS
} from './mockSocialData';
import { authService } from './authService';
import { realtimeEngine } from './realtimeService';

const STORIES_KEY = 'connecta_stories_db';
const MARKETPLACE_KEY = 'connecta_marketplace_db';
const GROUPS_KEY = 'connecta_groups_db';
const PAGES_KEY = 'connecta_pages_db';
const EVENTS_KEY = 'connecta_events_db';
const NOTIFICATIONS_KEY = 'connecta_notifications_db';
const REPORTS_KEY = 'connecta_reports_db';

class SocialService {
  private stories: Story[] = [];
  private marketplace: MarketplaceListing[] = [];
  private groups: Group[] = [];
  private pages: Page[] = [];
  private events: EventItem[] = [];
  private notifications: NotificationItem[] = [];
  private reports: ReportItem[] = [];

  constructor() {
    const sSt = localStorage.getItem(STORIES_KEY);
    this.stories = sSt ? JSON.parse(sSt) : DEMO_STORIES;

    const sMp = localStorage.getItem(MARKETPLACE_KEY);
    this.marketplace = sMp ? JSON.parse(sMp) : DEMO_MARKETPLACE;

    const sGr = localStorage.getItem(GROUPS_KEY);
    this.groups = sGr ? JSON.parse(sGr) : DEMO_GROUPS;

    const sPg = localStorage.getItem(PAGES_KEY);
    this.pages = sPg ? JSON.parse(sPg) : DEMO_PAGES;

    const sEv = localStorage.getItem(EVENTS_KEY);
    this.events = sEv ? JSON.parse(sEv) : DEMO_EVENTS;

    const sNt = localStorage.getItem(NOTIFICATIONS_KEY);
    this.notifications = sNt ? JSON.parse(sNt) : DEMO_NOTIFICATIONS;

    const sRp = localStorage.getItem(REPORTS_KEY);
    this.reports = sRp ? JSON.parse(sRp) : [];
  }

  private persist() {
    localStorage.setItem(STORIES_KEY, JSON.stringify(this.stories));
    localStorage.setItem(MARKETPLACE_KEY, JSON.stringify(this.marketplace));
    localStorage.setItem(GROUPS_KEY, JSON.stringify(this.groups));
    localStorage.setItem(PAGES_KEY, JSON.stringify(this.pages));
    localStorage.setItem(EVENTS_KEY, JSON.stringify(this.events));
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(this.notifications));
    localStorage.setItem(REPORTS_KEY, JSON.stringify(this.reports));
  }

  getStories(): Story[] {
    return this.stories.filter((s) => new Date(s.expires_at) > new Date());
  }

  async createStory(data: { mediaUrl?: string; textContent?: string; bgColor?: string }): Promise<Story> {
    const user = authService.getCurrentUser();
    if (!user) throw new Error('Unauthenticated');

    const newStory: Story = {
      id: `story_${Date.now()}`,
      author_id: user.id,
      author: user,
      media_url: data.mediaUrl,
      text_content: data.textContent,
      bg_color: data.bgColor || 'linear-gradient(135deg, #2563EB, #8B5CF6)',
      expires_at: new Date(Date.now() + 24 * 3600000).toISOString(),
      created_at: new Date().toISOString(),
      views_count: 1,
    };

    this.stories = [newStory, ...this.stories];
    this.persist();
    realtimeEngine.broadcast('new_story', newStory);
    return newStory;
  }

  getMarketplace(): MarketplaceListing[] {
    return this.marketplace;
  }

  createListing(data: Partial<MarketplaceListing>): MarketplaceListing {
    const user = authService.getCurrentUser();
    if (!user) throw new Error('Unauthenticated');

    const newListing: MarketplaceListing = {
      id: `mp_${Date.now()}`,
      seller_id: user.id,
      seller: user,
      title: data.title || 'New Listing',
      price: data.price || 0,
      category: data.category || 'General',
      condition: data.condition || 'New',
      description: data.description || '',
      location: data.location || user.location || 'San Francisco, CA',
      image_url: data.image_url || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&auto=format&fit=crop&q=80',
      created_at: new Date().toISOString(),
    };

    this.marketplace = [newListing, ...this.marketplace];
    this.persist();
    realtimeEngine.broadcast('new_marketplace_listing', newListing);
    return newListing;
  }

  getGroups(): Group[] {
    return this.groups;
  }

  createGroup(name: string, description: string, privacy: 'public' | 'private'): Group {
    const user = authService.getCurrentUser();
    if (!user) throw new Error('Unauthenticated');

    const newGroup: Group = {
      id: `group_${Date.now()}`,
      name,
      description,
      privacy,
      created_by: user.id,
      members_count: 1,
      is_joined: true,
      cover_url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1000&auto=format&fit=crop&q=80',
    };

    this.groups = [newGroup, ...this.groups];
    this.persist();
    realtimeEngine.broadcast('new_group', newGroup);
    return newGroup;
  }

  getEvents(): EventItem[] {
    return this.events;
  }

  getNotifications(): NotificationItem[] {
    return this.notifications;
  }

  submitReport(itemType: ReportItem['item_type'], itemId: string, reason: string): ReportItem {
    const user = authService.getCurrentUser();
    if (!user) throw new Error('Unauthenticated');

    const newReport: ReportItem = {
      id: `rep_${Date.now()}`,
      item_type: itemType,
      item_id: itemId,
      reporter_id: user.id,
      reason,
      status: 'pending',
      created_at: new Date().toISOString(),
    };

    this.reports = [newReport, ...this.reports];
    this.persist();
    realtimeEngine.broadcast('new_report_submitted', newReport);
    return newReport;
  }

  getReports(): ReportItem[] {
    return this.reports;
  }
}

export const socialService = new SocialService();
