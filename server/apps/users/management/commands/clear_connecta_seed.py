from django.core.management.base import BaseCommand
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

class Command(BaseCommand):
    help = 'Clear all generated seed data from Connecta database safely'

    def handle(self, *args, **options):
        self.stdout.write(self.style.WARNING("Clearing Connecta seed dataset..."))

        DailyAnalytics.objects.filter(is_seed_data=True).delete()
        AuditLog.objects.filter(is_seed_data=True).delete()
        ModerationLog.objects.filter(is_seed_data=True).delete()
        Report.objects.filter(is_seed_data=True).delete()
        SavedItem.objects.filter(is_seed_data=True).delete()
        Memory.objects.filter(is_seed_data=True).delete()
        Photo.objects.filter(is_seed_data=True).delete()
        Album.objects.filter(is_seed_data=True).delete()
        Video.objects.filter(is_seed_data=True).delete()
        MarketplaceListing.objects.filter(is_seed_data=True).delete()
        EventAttendee.objects.filter(is_seed_data=True).delete()
        Event.objects.filter(is_seed_data=True).delete()
        Notification.objects.filter(is_seed_data=True).delete()
        Message.objects.filter(is_seed_data=True).delete()
        ConversationMember.objects.filter(is_seed_data=True).delete()
        Conversation.objects.filter(is_seed_data=True).delete()
        Story.objects.filter(is_seed_data=True).delete()
        Reaction.objects.filter(is_seed_data=True).delete()
        Comment.objects.filter(is_seed_data=True).delete()
        Post.objects.filter(is_seed_data=True).delete()
        PageFollower.objects.filter(is_seed_data=True).delete()
        Page.objects.filter(is_seed_data=True).delete()
        GroupMember.objects.filter(is_seed_data=True).delete()
        Group.objects.filter(is_seed_data=True).delete()
        Follow.objects.filter(is_seed_data=True).delete()
        Friendship.objects.filter(is_seed_data=True).delete()
        Profile.objects.filter(is_seed_data=True).delete()
        User.objects.filter(is_seed_data=True).delete()

        self.stdout.write(self.style.SUCCESS("All seed dataset records cleared successfully."))
