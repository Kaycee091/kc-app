from rest_framework import serializers
from apps.events.models import Event, EventAttendee
from apps.users.serializers import UserSerializer

class EventAttendeeSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = EventAttendee
        fields = ['id', 'event', 'user', 'status', 'created_at']

class EventSerializer(serializers.ModelSerializer):
    organizer = UserSerializer(read_only=True)
    attendees_count = serializers.SerializerMethodField()
    interested_count = serializers.SerializerMethodField()
    rsvp_status = serializers.SerializerMethodField()
    title = serializers.CharField(source='name', required=False)
    start_time = serializers.DateTimeField(source='event_date', required=False)

    class Meta:
        model = Event
        fields = [
            'id', 'name', 'title', 'description', 'organizer', 'event_date',
            'start_time', 'location', 'privacy', 'cover_url', 'status',
            'attendees_count', 'interested_count', 'rsvp_status', 'created_at'
        ]

    def get_attendees_count(self, obj):
        return obj.attendees.filter(status='going').count()

    def get_interested_count(self, obj):
        return obj.attendees.filter(status='interested').count()

    def get_rsvp_status(self, obj):
        request = self.context.get('request')
        if request and request.user and request.user.is_authenticated:
            attendee = obj.attendees.filter(user=request.user).first()
            if attendee:
                return attendee.status
        return None
