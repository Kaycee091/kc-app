from django.db import models
from django.conf import settings

class Notification(models.Model):
    id = models.CharField(max_length=64, primary_key=True)
    recipient = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notifications')
    actor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, null=True, blank=True, related_name='notifications_triggered')
    notification_type = models.CharField(max_length=50) # e.g. friend_request, like, comment, message, group_activity
    title = models.CharField(max_length=200, blank=True, default='')
    content = models.TextField(blank=True, default='')
    target_type = models.CharField(max_length=50, blank=True, default='')
    target_id = models.CharField(max_length=64, blank=True, default='')
    is_read = models.BooleanField(default=False)
    is_seed_data = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'connecta_notifications'
        ordering = ['-created_at']

    def __str__(self):
        return f"Notification {self.id} for {self.recipient.username}"
