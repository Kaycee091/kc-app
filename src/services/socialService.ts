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

class SocialService {
  private stories: Story[] = DEMO_STORIES;
  private marketplace: MarketplaceListing[] = DEMO_MARKETPLACE;
  private groups: Group[] = DEMO_GROUPS;
  private pages: Page[] = DEMO_PAGES;
  private events: EventItem[] = DEMO_EVENTS;
  private notifications: NotificationItem[] = DEMO_NOTIFICATIONS;
  private reports: ReportItem[] = [];

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
    return newReport;
  }

  getReports(): ReportItem[] {
    return this.reports;
  }
}

export const socialService = new SocialService();
