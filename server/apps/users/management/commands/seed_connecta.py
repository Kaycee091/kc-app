import random
import datetime
from django.core.management.base import BaseCommand
from django.utils import timezone
from django.db import transaction, IntegrityError
from django.contrib.auth import get_user_model

from apps.profiles.models import Profile
from apps.friendships.models import Friendship
from apps.follows.models import Follow
from apps.groups.models import Group, GroupMember
from apps.pages.models import Page, PageFollower
from apps.posts.models import Post
from apps.comments.models import Comment
from apps.reactions.models import Reaction
from apps.stories.models import Story
from apps.messaging.models import Conversation, ConversationMember, Message
from apps.notifications.models import Notification
from apps.events.models import Event, EventAttendee
from apps.marketplace.models import MarketplaceListing
from apps.media.models import Video, Album, Photo
from apps.memories.models import Memory
from apps.saved.models import SavedItem
from apps.reports.models import Report
from apps.moderation.models import ModerationLog
from apps.analytics.models import AuditLog, DailyAnalytics

User = get_user_model()

FIRST_NAMES = [
    "Alex", "Sarah", "Michael", "Emily", "David", "Jessica", "James", "Amanda", "Daniel", "Ashley",
    "Chinedu", "Amina", "Kenechukwu", "Nneka", "Tunde", "Zainab", "Emeka", "Fatima", "Funke", "Obinna",
    "Kwame", "Nia", "Tariq", "Malik", "Jabari", "Aisha", "Bisi", "Ade", "Chioma", "Ifeanyi",
    "Marcus", "Elena", "Liam", "Sophia", "Noah", "Olivia", "Ethan", "Ava", "Lucas", "Isabella",
    "Mateo", "Camila", "Leo", "Mia", "Julian", "Charlotte", "Gabriel", "Amara", "Ezra", "Freya"
]

LAST_NAMES = [
    "Johnson", "Adams", "Smith", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez",
    "Okonkwo", "Abubakar", "Asogwa", "Eze", "Adeyemi", "Bello", "Nnadi", "Oman", "Dania", "Umeh",
    "Mensah", "Diallo", "Sowah", "Kassama", "Toure", "Kamara", "Traore", "Ndiaye", "Sow", "Diop",
    "Silva", "Santos", "Fischer", "Weber", "Müller", "Schneider", "Wagner", "Becker", "Hoffmann", "Schäfer"
]

LOCATIONS = [
    "Lagos, Nigeria", "Abuja, Nigeria", "Port Harcourt, Nigeria", "Enugu, Nigeria", "Ibadan, Nigeria",
    "London, UK", "New York, USA", "Toronto, Canada", "Berlin, Germany", "Tokyo, Japan",
    "Accra, Ghana", "Nairobi, Kenya", "Johannesburg, South Africa", "Dubai, UAE", "Atlanta, USA"
]

INTERESTS_BIO = [
    "Tech enthusiast, software developer, and lover of great coffee ☕",
    "Digital creator | Photography | Travelling around the world 🌍",
    "Crypto & Web3 explorer 🚀 | Always learning something new",
    "Passionate about fitness, healthy living, and mindfulness ✨",
    "Music lover, guitarist 🎸, and podcast addict",
    "Entrepreneur building the next big thing in Africa 💡",
    "UI/UX designer crafting clean and intuitive user experiences",
    "Foodie 🍕 | Exploring culinary hotspots across the city",
    "Sports fan ⚽ | Manchester United till I die!",
    "Fashion enthusiast & lifestyle blogger 👗"
]

MARKETPLACE_CATEGORIES = [
    "Electronics", "Phones", "Computers", "Fashion", "Furniture",
    "Vehicles", "Books", "Home", "Accessories", "Services", "Other"
]

PAGE_CATEGORIES = [
    "Technology", "Entertainment", "Sports", "Education", "Business",
    "News", "Food", "Fashion", "Music", "Gaming", "Community"
]

class Command(BaseCommand):
    help = 'Generate 1,500 realistic dummy records and fully integrate them into Connecta database'

    def add_arguments(self, parser):
        parser.add_argument('--count', type=int, default=1500, help='Number of primary users to seed (default: 1500)')

    def handle(self, *args, **options):
        user_count = options['count']
        self.stdout.write(self.style.SUCCESS(f"Starting Connecta deterministic seeding for {user_count} primary users..."))

        # Seed random generator deterministically
        rng = random.Random(42)

        start_time = datetime.datetime.now()

        # 1. CREATE SUPER ADMIN & MODERATOR & DUMMY USERS
        users = []
        profiles = []

        # Super Admin User
        admin_user, created = User.objects.get_or_create(
            username='humble',
            defaults={
                'id': 'user_alex',
                'first_name': 'Alex',
                'last_name': 'Johnson',
                'email': 'asogwakenechukwu284@gmail.com',
                'role': 'super_admin',
                'status': 'active',
                'is_staff': True,
                'is_superuser': True,
                'is_seed_data': True,
            }
        )
        if created or not hasattr(admin_user, 'profile'):
            Profile.objects.get_or_create(
                user=admin_user,
                defaults={
                    'bio': 'Platform Super Admin & Lead Developer',
                    'gender': 'male',
                    'location': 'Lagos, Nigeria',
                    'avatar_url': 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
                    'cover_url': 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800',
                    'is_seed_data': True
                }
            )
        users.append(admin_user)

        # Moderator User
        mod_user, created = User.objects.get_or_create(
            username='sarah_mod',
            defaults={
                'id': 'user_sarah',
                'first_name': 'Sarah',
                'last_name': 'Adams',
                'email': 'sarah@connecta.app',
                'role': 'moderator',
                'status': 'active',
                'is_staff': True,
                'is_seed_data': True,
            }
        )
        if created or not hasattr(mod_user, 'profile'):
            Profile.objects.get_or_create(
                user=mod_user,
                defaults={
                    'bio': 'Platform Moderator & Trust/Safety Lead',
                    'gender': 'female',
                    'location': 'Abuja, Nigeria',
                    'avatar_url': 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
                    'cover_url': 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800',
                    'is_seed_data': True
                }
            )
        users.append(mod_user)

        # Batch User creation
        self.stdout.write("Generating primary Users and Profiles...")
        now = timezone.now()

        existing_user_count = User.objects.filter(is_seed_data=True).count()
        needed_users = max(0, user_count - len(users))

        for i in range(1, needed_users + 1):
            fname = rng.choice(FIRST_NAMES)
            lname = rng.choice(LAST_NAMES)
            uname = f"{fname.lower()}_{lname.lower()}_{i}"
            email = f"{uname}@connecta-seed.com"

            # Status distribution: 95% active, 3% inactive, 2% suspended
            rand_val = rng.random()
            if rand_val < 0.95:
                status = 'active'
            elif rand_val < 0.98:
                status = 'inactive'
            else:
                status = 'suspended'

            # Days joined: between 1 and 365 days ago
            days_ago = rng.randint(1, 360)
            joined_date = now - datetime.timedelta(days=days_ago, hours=rng.randint(0, 23))

            uid = f"seed_u_{i:04d}"

            u = User(
                id=uid,
                username=uname,
                first_name=fname,
                last_name=lname,
                email=email,
                role='user',
                status=status,
                is_active=(status != 'suspended'),
                is_seed_data=True,
                date_joined=joined_date
            )
            users.append(u)

        # Bulk create Users if not saved
        users_to_create = [u for u in users if u.pk is None or not User.objects.filter(pk=u.pk).exists()]
        if users_to_create:
            User.objects.bulk_create(users_to_create, ignore_conflicts=True)
            self.stdout.write(f"  Created {len(users_to_create)} User DB records.")

        all_seeded_users = list(User.objects.filter(is_seed_data=True))

        # Create Profiles for all seeded users missing a profile
        existing_profile_uids = set(Profile.objects.values_list('user_id', flat=True))
        profiles_to_create = []

        genders = ['male', 'female', 'other', 'unspecified']

        for u in all_seeded_users:
            if u.id not in existing_profile_uids:
                g = rng.choice(genders)
                avatar_seed = u.username
                profiles_to_create.append(Profile(
                    user=u,
                    bio=rng.choice(INTERESTS_BIO),
                    gender=g,
                    location=rng.choice(LOCATIONS),
                    website=f"https://{u.username}.me",
                    avatar_url=f"https://api.dicebear.com/7.x/avataaars/svg?seed={avatar_seed}",
                    cover_url=f"https://picsum.photos/seed/{avatar_seed}/800/250",
                    privacy_settings={"profile_visibility": rng.choice(["public", "friends"])},
                    notification_settings={"email_alerts": True, "push_alerts": True},
                    user_preferences={"theme": rng.choice(["dark", "light", "system"])},
                    is_seed_data=True,
                    created_at=u.date_joined
                ))

        if profiles_to_create:
            Profile.objects.bulk_create(profiles_to_create, ignore_conflicts=True)
            self.stdout.write(f"  Created {len(profiles_to_create)} Profile records.")

        # 2. FRIENDSHIPS (~2,500 - 3,500)
        self.stdout.write("Generating Friendships...")
        friendships_to_create = []
        seen_friendships = set(Friendship.objects.values_list('user_a_id', 'user_b_id'))

        target_friendships = 3000
        attempts = 0

        while len(friendships_to_create) + len(seen_friendships) < target_friendships and attempts < target_friendships * 3:
            attempts += 1
            u1, u2 = rng.sample(all_seeded_users, 2)
            pair = (min(u1.id, u2.id), max(u1.id, u2.id))
            if pair not in seen_friendships:
                seen_friendships.add(pair)
                friendships_to_create.append(Friendship(
                    user_a=u1,
                    user_b=u2,
                    status=rng.choice(['accepted', 'accepted', 'accepted', 'pending']),
                    is_seed_data=True
                ))

        if friendships_to_create:
            Friendship.objects.bulk_create(friendships_to_create, ignore_conflicts=True)
            self.stdout.write(f"  Created {len(friendships_to_create)} Friendship records.")

        # 3. FOLLOWS (~4,000)
        self.stdout.write("Generating Follows...")
        follows_to_create = []
        seen_follows = set(Follow.objects.values_list('follower_id', 'following_id'))
        target_follows = 4500
        attempts = 0

        while len(follows_to_create) + len(seen_follows) < target_follows and attempts < target_follows * 3:
            attempts += 1
            u1, u2 = rng.sample(all_seeded_users, 2)
            pair = (u1.id, u2.id)
            if pair not in seen_follows:
                seen_follows.add(pair)
                follows_to_create.append(Follow(
                    follower=u1,
                    following=u2,
                    is_seed_data=True
                ))

        if follows_to_create:
            Follow.objects.bulk_create(follows_to_create, ignore_conflicts=True)
            self.stdout.write(f"  Created {len(follows_to_create)} Follow records.")

        # 4. GROUPS & MEMBERS (~75 groups)
        self.stdout.write("Generating Groups & Memberships...")
        groups = []
        group_members = []
        target_groups = 75

        group_categories = ["Tech & Innovation", "Fitness & Wellness", "Cryptocurrency & Trading", "Connecta Developers", "Nigeria Gaming Hub", "Fashion & Style", "Photography Lovers"]

        for i in range(1, target_groups + 1):
            gid = f"grp_{i:03d}"
            gname = f"{rng.choice(group_categories)} #{i}"
            gowner = rng.choice(all_seeded_users)

            group = Group(
                id=gid,
                name=gname,
                slug=f"group-{i}-{rng.randint(1000, 9999)}",
                description=f"Official group for {gname}. Share ideas, posts, and connect with members!",
                owner=gowner,
                privacy=rng.choice(['public', 'public', 'private']),
                category=rng.choice(PAGE_CATEGORIES),
                avatar_url=f"https://picsum.photos/seed/grp{i}/200/200",
                cover_url=f"https://picsum.photos/seed/grpcover{i}/800/250",
                is_seed_data=True
            )
            groups.append(group)

        Group.objects.bulk_create(groups, ignore_conflicts=True)
        all_groups = list(Group.objects.filter(is_seed_data=True))

        for g in all_groups:
            # Group owner is admin
            group_members.append(GroupMember(group=g, user=g.owner, role='admin', is_seed_data=True))
            # Add 10-60 members
            member_count = rng.randint(10, 60)
            members = rng.sample(all_seeded_users, min(len(all_seeded_users), member_count))
            for m in members:
                if m.id != g.owner.id:
                    group_members.append(GroupMember(group=g, user=m, role='member', is_seed_data=True))

        GroupMember.objects.bulk_create(group_members, ignore_conflicts=True)
        self.stdout.write(f"  Created {len(all_groups)} Groups & {len(group_members)} Group Members.")

        # 5. PAGES & FOLLOWERS (~50 pages)
        self.stdout.write("Generating Pages & Page Followers...")
        pages = []
        page_followers = []

        for i in range(1, 51):
            pid = f"pg_{i:03d}"
            pname = f"{rng.choice(PAGE_CATEGORIES)} Digest {i}"
            powner = rng.choice(all_seeded_users)

            page = Page(
                id=pid,
                name=pname,
                slug=f"page-{i}-{rng.randint(1000, 9999)}",
                description=f"Welcome to {pname}. Follow us for daily updates and insights!",
                category=rng.choice(PAGE_CATEGORIES),
                owner=powner,
                avatar_url=f"https://picsum.photos/seed/pg{i}/200/200",
                cover_url=f"https://picsum.photos/seed/pgcover{i}/800/250",
                is_seed_data=True
            )
            pages.append(page)

        Page.objects.bulk_create(pages, ignore_conflicts=True)
        all_pages = list(Page.objects.filter(is_seed_data=True))

        for p in all_pages:
            follower_count = rng.randint(15, 80)
            followers = rng.sample(all_seeded_users, min(len(all_seeded_users), follower_count))
            for f in followers:
                page_followers.append(PageFollower(page=p, user=f, is_seed_data=True))

        PageFollower.objects.bulk_create(page_followers, ignore_conflicts=True)
        self.stdout.write(f"  Created {len(all_pages)} Pages & {len(page_followers)} Page Followers.")

        # 6. POSTS (~3,000)
        self.stdout.write("Generating Posts (~3,000)...")
        posts = []
        post_contents = [
            "Just launched our new feature on Connecta! Excited for everyone to test it out 🚀",
            "What's your favorite programming language in 2026? Python, TypeScript, or Dart? Let me know below!",
            "Beautiful morning walk around Victoria Island today 🌅",
            "Check out this amazing article on AI & Web Development!",
            "Building high-performance scalable systems with Django & PostgreSQL is pure joy ❤️",
            "Weekend vibes! Time to relax, listen to some music and code 🎧💻",
            "Which team is winning the Champions League this season? ⚽",
            "Great networking session at the Lagos Tech Meetup today!",
            "Reminder: Always commit your code before going to sleep 😅",
            "Exploring new design tokens and dark mode UI patterns."
        ]

        post_types = ['text', 'image', 'video', 'poll', 'check_in']
        privacies = ['public', 'public', 'public', 'friends', 'only_me']

        for i in range(1, 3001):
            pid = f"post_{i:04d}"
            author = rng.choice(all_seeded_users)
            ptype = rng.choice(post_types)
            priv = rng.choice(privacies)
            created_dt = now - datetime.timedelta(days=rng.randint(0, 180), minutes=rng.randint(0, 1440))

            media = []
            if ptype == 'image':
                media = [f"https://picsum.photos/seed/postmedia{i}/600/400"]
            elif ptype == 'video':
                media = ["https://www.w3schools.com/html/mov_bbb.mp4"]

            group_ref = rng.choice(all_groups) if (i % 8 == 0) else None
            page_ref = rng.choice(all_pages) if (i % 12 == 0) else None

            posts.append(Post(
                id=pid,
                author=author,
                content=f"{rng.choice(post_contents)} #{i}",
                media_urls=media,
                post_type=ptype,
                privacy=priv,
                location=rng.choice(LOCATIONS) if (i % 5 == 0) else '',
                group=group_ref,
                page=page_ref,
                is_seed_data=True,
                created_at=created_dt
            ))

        Post.objects.bulk_create(posts, ignore_conflicts=True)
        all_posts = list(Post.objects.filter(is_seed_data=True))
        self.stdout.write(f"  Created {len(all_posts)} Post DB records.")

        # 7. COMMENTS (~5,000)
        self.stdout.write("Generating Comments (~5,000)...")
        comments = []
        comment_texts = [
            "Totally agree with this! 👍",
            "Great post, thanks for sharing!",
            "Interesting perspective, let's connect!",
            "100% facts 👌",
            "Could you elaborate more on this point?",
            "Nice picture! 🔥",
            "Bookmark this for later!",
            "Awesome update!",
            "Spot on! 🙌",
            "Thanks for the insight!"
        ]

        for i in range(1, 5001):
            cid = f"cmt_{i:04d}"
            post = rng.choice(all_posts)
            author = rng.choice(all_seeded_users)
            created_dt = post.created_at + datetime.timedelta(minutes=rng.randint(5, 300))

            comments.append(Comment(
                id=cid,
                post=post,
                author=author,
                content=rng.choice(comment_texts),
                is_seed_data=True,
                created_at=created_dt
            ))

        Comment.objects.bulk_create(comments, ignore_conflicts=True)
        all_comments = list(Comment.objects.filter(is_seed_data=True))
        self.stdout.write(f"  Created {len(all_comments)} Comment DB records.")

        # 8. REACTIONS (~8,000)
        self.stdout.write("Generating Reactions (~8,000)...")
        reactions_to_create = []
        seen_reactions = set(Reaction.objects.values_list('post_id', 'user_id'))
        reaction_types = ['like', 'like', 'like', 'love', 'care', 'haha', 'wow', 'sad', 'angry']

        attempts = 0
        target_reactions = 8000

        while len(reactions_to_create) + len(seen_reactions) < target_reactions and attempts < target_reactions * 3:
            attempts += 1
            post = rng.choice(all_posts)
            user = rng.choice(all_seeded_users)
            pair = (post.id, user.id)
            if pair not in seen_reactions:
                seen_reactions.add(pair)
                reactions_to_create.append(Reaction(
                    post=post,
                    user=user,
                    reaction_type=rng.choice(reaction_types),
                    is_seed_data=True
                ))

        Reaction.objects.bulk_create(reactions_to_create, ignore_conflicts=True)
        self.stdout.write(f"  Created {len(reactions_to_create)} Reaction DB records.")

        # 9. STORIES (~300)
        self.stdout.write("Generating Stories (~300)...")
        stories = []
        for i in range(1, 301):
            sid = f"story_{i:03d}"
            author = rng.choice(all_seeded_users)
            # 50% active (expires in future), 50% expired
            if i % 2 == 0:
                expires_at = now + datetime.timedelta(hours=rng.randint(2, 20))
            else:
                expires_at = now - datetime.timedelta(hours=rng.randint(1, 48))

            stories.append(Story(
                id=sid,
                author=author,
                content=f"Story update #{i} from {author.first_name}",
                media_url=f"https://picsum.photos/seed/story{i}/400/700",
                story_type=rng.choice(['image', 'image', 'text', 'video']),
                expires_at=expires_at,
                is_seed_data=True
            ))

        Story.objects.bulk_create(stories, ignore_conflicts=True)
        all_stories = list(Story.objects.filter(is_seed_data=True))
        self.stdout.write(f"  Created {len(all_stories)} Story DB records.")

        # 10. CONVERSATIONS & MESSAGES (~500 conversations, ~6,500 messages)
        self.stdout.write("Generating Conversations & Messages...")
        conversations = []
        conv_members = []
        messages = []

        for i in range(1, 501):
            cvid = f"conv_{i:03d}"
            is_grp = (i % 5 == 0)
            cname = f"Group Chat #{i}" if is_grp else ""

            conv = Conversation(
                id=cvid,
                is_group=is_grp,
                name=cname,
                is_seed_data=True
            )
            conversations.append(conv)

        Conversation.objects.bulk_create(conversations, ignore_conflicts=True)
        all_convs = list(Conversation.objects.filter(is_seed_data=True))

        sample_messages = [
            "Hey! How are you doing today?",
            "Did you check out the new Connecta update?",
            "Let's meet up later this evening.",
            "Sure, sounds good to me!",
            "Sending over the requested files now.",
            "Thanks a lot for your help!",
            "Check this link out when you have a moment.",
            "Have a great weekend!"
        ]

        msg_counter = 1
        for cv in all_convs:
            if cv.is_group:
                members = rng.sample(all_seeded_users, rng.randint(3, 8))
            else:
                members = rng.sample(all_seeded_users, 2)

            for m in members:
                conv_members.append(ConversationMember(conversation=cv, user=m, is_seed_data=True))

            # Add 8-15 messages per conversation
            msg_count = rng.randint(8, 15)
            start_dt = now - datetime.timedelta(days=rng.randint(1, 30))
            for k in range(msg_count):
                sender = rng.choice(members)
                msg_dt = start_dt + datetime.timedelta(minutes=k * 15)

                messages.append(Message(
                    id=f"msg_{msg_counter:05d}",
                    conversation=cv,
                    sender=sender,
                    content=rng.choice(sample_messages),
                    is_read=(k < msg_count - 2),
                    is_seed_data=True,
                    created_at=msg_dt
                ))
                msg_counter += 1

        ConversationMember.objects.bulk_create(conv_members, ignore_conflicts=True)
        Message.objects.bulk_create(messages, ignore_conflicts=True)
        self.stdout.write(f"  Created {len(all_convs)} Conversations, {len(conv_members)} Conv Members, & {len(messages)} Messages.")

        # 11. NOTIFICATIONS (~3,000)
        self.stdout.write("Generating Notifications (~3,000)...")
        notifications = []
        notif_types = ['friend_request', 'like', 'comment', 'message', 'group_activity', 'mention']

        for i in range(1, 3001):
            nid = f"notif_{i:04d}"
            recip = rng.choice(all_seeded_users)
            actor = rng.choice(all_seeded_users)
            ntype = rng.choice(notif_types)

            notifications.append(Notification(
                id=nid,
                recipient=recip,
                actor=actor,
                notification_type=ntype,
                title=f"New {ntype.replace('_', ' ').title()}",
                content=f"{actor.first_name} interacted with your profile/content.",
                is_read=(i % 3 != 0),
                is_seed_data=True
            ))

        Notification.objects.bulk_create(notifications, ignore_conflicts=True)
        self.stdout.write(f"  Created {len(notifications)} Notification DB records.")

        # 12. EVENTS & ATTENDEES (~100 events)
        self.stdout.write("Generating Events & Attendees (~100)...")
        events = []
        event_attendees = []

        for i in range(1, 101):
            eid = f"evt_{i:03d}"
            org = rng.choice(all_seeded_users)

            # Date distribution: past, today, upcoming
            if i % 3 == 0:
                edate = now - datetime.timedelta(days=rng.randint(1, 30))
                status = 'completed'
            elif i % 5 == 0:
                edate = now + datetime.timedelta(hours=4)
                status = 'today'
            else:
                edate = now + datetime.timedelta(days=rng.randint(1, 60))
                status = 'upcoming'

            event = Event(
                id=eid,
                name=f"Connecta Tech & Culture Summit #{i}",
                description=f"Join us for summit #{i} live at {rng.choice(LOCATIONS)}. Network with top industry leaders!",
                organizer=org,
                event_date=edate,
                location=rng.choice(LOCATIONS),
                cover_url=f"https://picsum.photos/seed/evt{i}/800/300",
                status=status,
                is_seed_data=True
            )
            events.append(event)

        Event.objects.bulk_create(events, ignore_conflicts=True)
        all_events = list(Event.objects.filter(is_seed_data=True))

        for ev in all_events:
            attendee_count = rng.randint(10, 40)
            attendees = rng.sample(all_seeded_users, min(len(all_seeded_users), attendee_count))
            for a in attendees:
                event_attendees.append(EventAttendee(
                    event=ev,
                    user=a,
                    status=rng.choice(['going', 'going', 'interested', 'not_going']),
                    is_seed_data=True
                ))

        EventAttendee.objects.bulk_create(event_attendees, ignore_conflicts=True)
        self.stdout.write(f"  Created {len(all_events)} Events & {len(event_attendees)} Event Attendees.")

        # 13. MARKETPLACE LISTINGS (~250)
        self.stdout.write("Generating Marketplace Listings (~250)...")
        listings = []
        item_titles = [
            "iPhone 15 Pro Max 256GB - Clean Condition",
            "MacBook Pro M3 16-inch - Space Grey",
            "Ergonomic Office Chair with Lumbar Support",
            "Sony PlayStation 5 Digital Edition + 2 Controllers",
            "Samsung 55-inch 4K Smart OLED TV",
            "Toyota Camry 2022 Model - Low Mileage",
            "Designer Leather Jacket - Unisex",
            "Wireless Noise Cancelling Headphones",
            "Gaming Desk with RGB Lighting",
            "Clean Apple Watch Series 9"
        ]

        for i in range(1, 251):
            lid = f"mkt_{i:03d}"
            seller = rng.choice(all_seeded_users)

            listings.append(MarketplaceListing(
                id=lid,
                seller=seller,
                title=f"{rng.choice(item_titles)} #{i}",
                description=f"Awesome condition item listed for sale by {seller.first_name}. Serious buyers only!",
                price=rng.randint(25000, 1500000),
                currency='NGN',
                category=rng.choice(MARKETPLACE_CATEGORIES),
                location=rng.choice(LOCATIONS),
                condition=rng.choice(['new', 'used_like_new', 'used_good', 'used_fair']),
                status=rng.choice(['available', 'available', 'available', 'pending', 'sold']),
                image_url=f"https://picsum.photos/seed/mkt{i}/500/500",
                is_seed_data=True
            ))

        MarketplaceListing.objects.bulk_create(listings, ignore_conflicts=True)
        self.stdout.write(f"  Created {len(listings)} Marketplace Listings.")

        # 14. VIDEOS, ALBUMS & PHOTOS (~150 videos, ~200 photos/albums)
        self.stdout.write("Generating Videos, Albums & Photos...")
        videos = []
        albums = []
        photos = []

        for i in range(1, 151):
            vid = f"vid_{i:03d}"
            author = rng.choice(all_seeded_users)

            videos.append(Video(
                id=vid,
                author=author,
                title=f"Connecta Reel #{i}: Exploring AI Tech",
                description=f"Short video highlights shared by {author.first_name}",
                video_url="https://www.w3schools.com/html/mov_bbb.mp4",
                thumbnail_url=f"https://picsum.photos/seed/vidthumb{i}/600/350",
                duration=rng.randint(30, 300),
                views_count=rng.randint(100, 50000),
                is_seed_data=True
            ))

        Video.objects.bulk_create(videos, ignore_conflicts=True)

        for i in range(1, 51):
            aid = f"alb_{i:03d}"
            owner = rng.choice(all_seeded_users)
            album = Album(
                id=aid,
                owner=owner,
                title=f"Album: {rng.choice(['Travel', 'Family', 'Events', 'Work', 'Lifestyle'])} #{i}",
                category='General',
                is_seed_data=True
            )
            albums.append(album)

        Album.objects.bulk_create(albums, ignore_conflicts=True)
        all_albums = list(Album.objects.filter(is_seed_data=True))

        for i in range(1, 201):
            pid = f"photo_{i:03d}"
            author = rng.choice(all_seeded_users)
            album_ref = rng.choice(all_albums) if (i % 2 == 0) else None

            photos.append(Photo(
                id=pid,
                album=album_ref,
                author=author,
                image_url=f"https://picsum.photos/seed/photo{i}/600/600",
                caption=f"Snapshot moment #{i}",
                is_seed_data=True
            ))

        Photo.objects.bulk_create(photos, ignore_conflicts=True)
        self.stdout.write(f"  Created {len(videos)} Videos, {len(all_albums)} Albums, & {len(photos)} Photos.")

        # 15. MEMORIES & SAVED ITEMS (~100 memories, ~500 saved items)
        self.stdout.write("Generating Memories & Saved Items...")
        memories = []
        saved_items_to_create = []

        for i in range(1, 101):
            mid = f"mem_{i:03d}"
            user = rng.choice(all_seeded_users)
            post_ref = rng.choice(all_posts)

            memories.append(Memory(
                id=mid,
                user=user,
                post=post_ref,
                memory_date=now - datetime.timedelta(days=365 * rng.randint(1, 3)),
                is_seed_data=True
            ))

        Memory.objects.bulk_create(memories, ignore_conflicts=True)

        seen_saved = set(SavedItem.objects.values_list('user_id', 'item_type', 'item_id'))
        target_saved = 500
        attempts = 0

        while len(saved_items_to_create) + len(seen_saved) < target_saved and attempts < target_saved * 3:
            attempts += 1
            user = rng.choice(all_seeded_users)
            post = rng.choice(all_posts)
            key = (user.id, 'post', post.id)
            if key not in seen_saved:
                seen_saved.add(key)
                saved_items_to_create.append(SavedItem(
                    id=f"saved_{len(saved_items_to_create)+1:04d}",
                    user=user,
                    item_type='post',
                    item_id=post.id,
                    is_seed_data=True
                ))

        SavedItem.objects.bulk_create(saved_items_to_create, ignore_conflicts=True)
        self.stdout.write(f"  Created {len(memories)} Memories & {len(saved_items_to_create)} Saved Items.")

        # 16. REPORTS, MODERATION LOGS, AUDIT LOGS & ANALYTICS (~150 reports)
        self.stdout.write("Generating Reports, Moderation & Audit Logs...")
        reports = []
        mod_logs = []
        audit_logs = []
        daily_analytics = []

        report_types = ['spam', 'harassment', 'fake_account', 'hate_content', 'scam', 'inappropriate', 'copyright', 'other']
        statuses = ['pending', 'under_review', 'resolved', 'rejected']

        for i in range(1, 151):
            rid = f"rep_{i:03d}"
            reporter = rng.choice(all_seeded_users)
            target_post = rng.choice(all_posts)

            reports.append(Report(
                id=rid,
                reporter=reporter,
                reported_user=target_post.author,
                report_type=rng.choice(report_types),
                target_type='post',
                target_id=target_post.id,
                reason=f"Content flagged by community member #{reporter.id}",
                status=rng.choice(statuses),
                moderator_notes="Reviewed by automated moderation scanner." if i % 2 == 0 else "",
                is_seed_data=True
            ))

        Report.objects.bulk_create(reports, ignore_conflicts=True)

        for i in range(1, 51):
            mlid = f"modlog_{i:03d}"
            mod_logs.append(ModerationLog(
                id=mlid,
                admin=mod_user,
                action=rng.choice(['User Suspended', 'Post Removed', 'Report Resolved', 'Warning Sent']),
                target_type='post',
                target_id=f"post_{i:04d}",
                reason="Violation of platform community standards",
                is_seed_data=True
            ))

        ModerationLog.objects.bulk_create(mod_logs, ignore_conflicts=True)

        for i in range(1, 51):
            alid = f"audit_{i:03d}"
            audit_logs.append(AuditLog(
                id=alid,
                admin=admin_user,
                admin_name="Alex Johnson",
                admin_role="super_admin",
                action=rng.choice(['Updated Platform Settings', 'Resolved Escalated Report', 'Restored Account']),
                target_type='setting',
                target_id='sys_config',
                details='Automated seed audit log entry',
                ip_address=f"192.168.1.{rng.randint(2, 254)}",
                is_seed_data=True
            ))

        AuditLog.objects.bulk_create(audit_logs, ignore_conflicts=True)

        # 30 Days Daily Analytics
        for d in range(30):
            day_date = (now - datetime.timedelta(days=d)).date()
            daily_analytics.append(DailyAnalytics(
                date=day_date,
                total_users=User.objects.filter(is_seed_data=True).count(),
                active_users=rng.randint(800, 1400),
                total_posts=Post.objects.filter(is_seed_data=True).count(),
                total_comments=Comment.objects.filter(is_seed_data=True).count(),
                total_reactions=Reaction.objects.filter(is_seed_data=True).count(),
                total_messages=Message.objects.filter(is_seed_data=True).count(),
                total_reports=Report.objects.filter(is_seed_data=True).count(),
                is_seed_data=True
            ))

        DailyAnalytics.objects.bulk_create(daily_analytics, ignore_conflicts=True)
        self.stdout.write(f"  Created {len(reports)} Reports, {len(mod_logs)} Moderation Logs, & {len(audit_logs)} Audit Logs.")

        end_time = datetime.datetime.now()
        duration = (end_time - start_time).total_seconds()

        self.stdout.write(self.style.SUCCESS(f"\n========================================"))
        self.stdout.write(self.style.SUCCESS(f"CONNECTA SEEDING COMPLETED SUCCESSFULLY in {duration:.2f}s!"))
        self.stdout.write(self.style.SUCCESS(f"========================================"))
