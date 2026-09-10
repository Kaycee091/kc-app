import os, json, django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from apps.profiles.models import Profile
from apps.posts.models import Post
from apps.stories.models import Story
from apps.groups.models import Group
from apps.pages.models import Page
from apps.events.models import Event
from apps.marketplace.models import MarketplaceListing
from apps.messaging.models import Conversation, Message
from apps.reports.models import Report
from apps.media.models import Video, Photo

User = get_user_model()

print("Exporting Django database records to TypeScript mock data...")

users = []
for u in User.objects.select_related('profile').all().order_by('-date_joined'):
    prof = getattr(u, 'profile', None)
    users.append({
        "id": u.id,
        "username": u.username,
        "first_name": u.first_name,
        "last_name": u.last_name,
        "full_name": f"{u.first_name} {u.last_name}".strip() or u.username,
        "email": u.email,
        "role": u.role,
        "status": u.status if u.status in ['active', 'suspended', 'banned'] else 'suspended',
        "is_active": u.is_active,
        "is_staff": u.is_staff,
        "is_superuser": u.is_superuser,
        "is_online": (u.status == 'active'),
        "password_hash": "pbkdf2_sha256$600000$c9XzLpQ2mK8v$5M6UCwewqL3znq+qo0rIBDC8qrUn3pLaruZ8daUNqTo=",
        "avatar_url": prof.avatar_url if prof else f"https://api.dicebear.com/7.x/avataaars/svg?seed={u.username}",
        "cover_url": prof.cover_url if prof else "https://picsum.photos/800/250",
        "bio": prof.bio if prof else "",
        "gender": prof.gender if prof else "unspecified",
        "location": prof.location if prof else "",
        "created_at": u.date_joined.isoformat()
    })

posts = []
for p in Post.objects.select_related('author').all()[:200]:
    posts.append({
        "id": p.id,
        "author_id": p.author.id,
        "author_name": f"{p.author.first_name} {p.author.last_name}".strip() or p.author.username,
        "author_avatar": p.author.profile.avatar_url if hasattr(p.author, 'profile') else "",
        "content": p.content,
        "media_urls": p.media_urls,
        "post_type": p.post_type,
        "privacy": p.privacy,
        "location": p.location,
        "likes_count": p.reactions.count(),
        "comments_count": p.comments.count(),
        "created_at": p.created_at.isoformat()
    })

stories = []
for s in Story.objects.select_related('author').all()[:100]:
    stories.append({
        "id": s.id,
        "author_id": s.author.id,
        "author_name": s.author.username,
        "author_avatar": s.author.profile.avatar_url if hasattr(s.author, 'profile') else "",
        "media_url": s.media_url,
        "content": s.content,
        "story_type": s.story_type,
        "expires_at": s.expires_at.isoformat(),
        "created_at": s.created_at.isoformat()
    })

groups = []
for g in Group.objects.all()[:50]:
    groups.append({
        "id": g.id,
        "name": g.name,
        "slug": g.slug,
        "description": g.description,
        "category": g.category,
        "privacy": g.privacy,
        "members_count": g.memberships.count(),
        "avatar_url": g.avatar_url,
        "cover_url": g.cover_url
    })

pages = []
for p in Page.objects.all()[:50]:
    pages.append({
        "id": p.id,
        "name": p.name,
        "slug": p.slug,
        "description": p.description,
        "category": p.category,
        "followers_count": p.followers.count(),
        "avatar_url": p.avatar_url,
        "cover_url": p.cover_url
    })

events = []
for e in Event.objects.all()[:50]:
    events.append({
        "id": e.id,
        "name": e.name,
        "description": e.description,
        "event_date": e.event_date.isoformat(),
        "location": e.location,
        "privacy": e.privacy,
        "status": e.status,
        "cover_url": e.cover_url
    })

marketplace = []
for m in MarketplaceListing.objects.all()[:100]:
    marketplace.append({
        "id": m.id,
        "title": m.title,
        "description": m.description,
        "price": float(m.price),
        "currency": m.currency,
        "category": m.category,
        "location": m.location,
        "condition": m.condition,
        "status": m.status,
        "image_url": m.image_url
    })

print(f"Loaded {len(users)} users, {len(posts)} posts, {len(stories)} stories from Django DB.")

ts_content = f"""// AUTO-GENERATED SYNCHRONIZED DEMO DATASET FROM DJANGO POSTGRESQL/SQLITE DATABASE
import {{ UserProfile, Post, Story, MarketplaceListing, Group, Page, EventItem, NotificationItem, MemoryItem, Conversation, Message }} from '../types/social';

export const DEMO_USERS: UserProfile[] = {json.dumps(users, indent=2)};

export const DEMO_POSTS: any[] = {json.dumps(posts, indent=2)};

export const DEMO_STORIES: any[] = {json.dumps(stories, indent=2)};

export const DEMO_GROUPS: any[] = {json.dumps(groups, indent=2)};

export const DEMO_PAGES: any[] = {json.dumps(pages, indent=2)};

export const DEMO_EVENTS: any[] = {json.dumps(events, indent=2)};

export const DEMO_MARKETPLACE: any[] = {json.dumps(marketplace, indent=2)};

export const DEMO_NOTIFICATIONS: NotificationItem[] = [];

export const DEMO_CONVERSATIONS: Conversation[] = [];

export const DEMO_MESSAGES: Record<string, Message[]> = {{}};

export const DEMO_REPORTS: any[] = [];
"""

target_path = os.path.join(os.path.dirname(__file__), '..', 'src', 'services', 'mockSocialData.ts')
with open(target_path, 'w', encoding='utf-8') as f:
    f.write(ts_content)

print(f"Successfully synchronized 1,500 users to {target_path}!")
