from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db.models import Q
from apps.events.models import Event, EventAttendee
from apps.events.serializers import EventSerializer, EventAttendeeSerializer

class EventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.select_related('organizer').all().order_by('event_date')
    serializer_class = EventSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        qs = super().get_queryset()
        search = self.request.query_params.get('search', None)
        status_param = self.request.query_params.get('status', None)
        category = self.request.query_params.get('category', None)

        if search:
            qs = qs.filter(
                Q(name__icontains=search) |
                Q(description__icontains=search) |
                Q(location__icontains=search)
            )
        if status_param:
            qs = qs.filter(status=status_param)
        return qs

    def perform_create(self, serializer):
        user = self.request.user if self.request.user.is_authenticated else None
        if not user:
            from django.contrib.auth import get_user_model
            user = get_user_model().objects.first()
        serializer.save(organizer=user)

    @action(detail=True, methods=['post'])
    def rsvp(self, request, pk=None):
        event = self.get_object()
        user = request.user if request.user.is_authenticated else None
        if not user:
            from django.contrib.auth import get_user_model
            user = get_user_model().objects.first()

        rsvp_status = request.data.get('status', 'going')
        if rsvp_status not in ['going', 'interested', 'not_going']:
            return Response({'error': 'Invalid status. Must be going, interested, or not_going.'}, status=status.HTTP_400_BAD_REQUEST)

        attendee, created = EventAttendee.objects.get_or_create(
            event=event,
            user=user,
            defaults={'status': rsvp_status}
        )
        if not created:
            if attendee.status == rsvp_status:
                # Toggle off
                attendee.delete()
                current_status = None
            else:
                attendee.status = rsvp_status
                attendee.save()
                current_status = rsvp_status
        else:
            current_status = rsvp_status

        going_count = event.attendees.filter(status='going').count()
        interested_count = event.attendees.filter(status='interested').count()

        return Response({
            'success': True,
            'event_id': event.id,
            'rsvp_status': current_status,
            'attendees_count': going_count,
            'interested_count': interested_count
        })
