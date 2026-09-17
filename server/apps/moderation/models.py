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


class Appeal(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('under_review', 'Under Review'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    )

    id = models.CharField(max_length=64, primary_key=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='appeals')
    ban_reason = models.TextField(blank=True, default='')
    appeal_message = models.TextField()
    supporting_info = models.TextField(blank=True, default='')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)
    reviewed_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='reviewed_appeals')
    admin_notes = models.TextField(blank=True, default='')

    class Meta:
        db_table = 'connecta_appeals'
        ordering = ['-created_at']

    def __str__(self):
        return f"Appeal #{self.id} by {self.user.username} - {self.status}"
