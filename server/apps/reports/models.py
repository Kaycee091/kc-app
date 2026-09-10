from django.db import models
from django.conf import settings

class Report(models.Model):
    REPORT_TYPE_CHOICES = (
        ('spam', 'Spam'),
        ('harassment', 'Harassment'),
        ('fake_account', 'Fake Account'),
        ('hate_content', 'Hate/Abusive Content'),
        ('scam', 'Scam'),
        ('inappropriate', 'Inappropriate Content'),
        ('copyright', 'Copyright'),
        ('other', 'Other'),
    )
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('under_review', 'Under Review'),
        ('resolved', 'Resolved'),
        ('rejected', 'Rejected'),
    )
    TARGET_TYPE_CHOICES = (
        ('user', 'User'),
        ('post', 'Post'),
        ('comment', 'Comment'),
        ('group', 'Group'),
        ('page', 'Page'),
        ('marketplace', 'Marketplace Listing'),
    )

    id = models.CharField(max_length=64, primary_key=True)
    reporter = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='filed_reports')
    reported_user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='reports_against')
    report_type = models.CharField(max_length=30, choices=REPORT_TYPE_CHOICES, default='spam')
    target_type = models.CharField(max_length=30, choices=TARGET_TYPE_CHOICES, default='post')
    target_id = models.CharField(max_length=64)
    reason = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    moderator_notes = models.TextField(blank=True, default='')
    is_seed_data = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'connecta_reports'
        ordering = ['-created_at']

    def __str__(self):
        return f"Report #{self.id} [{self.report_type}] - {self.status}"
