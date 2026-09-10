from django.db import models
from django.conf import settings

class ModerationLog(models.Model):
    id = models.CharField(max_length=64, primary_key=True)
    admin = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='moderation_actions')
    action = models.CharField(max_length=100) # e.g. User Suspended, Post Removed, Report Resolved
    target_type = models.CharField(max_length=50)
    target_id = models.CharField(max_length=64)
    reason = models.TextField(blank=True, default='')
    is_seed_data = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'connecta_moderation_logs'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.admin.username}: {self.action} on {self.target_type}:{self.target_id}"
