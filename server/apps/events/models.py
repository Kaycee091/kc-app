from django.db import models
from django.conf import settings

class Event(models.Model):
    PRIVACY_CHOICES = (
        ('public', 'Public'),
        ('private', 'Private'),
    )
    STATUS_CHOICES = (
        ('upcoming', 'Upcoming'),
        ('today', 'Today'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    )

    id = models.CharField(max_length=64, primary_key=True)
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True, default='')
    organizer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='organized_events')
    event_date = models.DateTimeField()
    location = models.CharField(max_length=200, blank=True, default='')
    privacy = models.CharField(max_length=20, choices=PRIVACY_CHOICES, default='public')
    cover_url = models.URLField(max_length=500, blank=True, default='')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='upcoming')
    is_seed_data = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'connecta_events'
        ordering = ['event_date']

    def __str__(self):
        return self.name

class EventAttendee(models.Model):
    STATUS_CHOICES = (
        ('going', 'Going'),
        ('interested', 'Interested'),
        ('not_going', 'Not Going'),
    )

    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='attendees')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='event_attendances')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='going')
    is_seed_data = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'connecta_event_attendees'
        unique_together = ('event', 'user')

    def __str__(self):
        return f"{self.user.username} - {self.status} for {self.event.name}"
