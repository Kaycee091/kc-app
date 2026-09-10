from django.db import models
from django.conf import settings

class AuditLog(models.Model):
    id = models.CharField(max_length=64, primary_key=True)
    admin = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    admin_name = models.CharField(max_length=150, default='System Admin')
    admin_role = models.CharField(max_length=50, default='super_admin')
    action = models.CharField(max_length=150)
    target_type = models.CharField(max_length=50)
    target_id = models.CharField(max_length=64)
    details = models.TextField(blank=True, default='')
    ip_address = models.GenericIPAddressField(default='127.0.0.1')
    timestamp = models.DateTimeField(auto_now_add=True)
    is_seed_data = models.BooleanField(default=False)

    class Meta:
        db_table = 'connecta_audit_logs'
        ordering = ['-timestamp']

    def __str__(self):
        return f"AuditLog #{self.id}: {self.action} by {self.admin_name}"

class DailyAnalytics(models.Model):
    date = models.DateField(primary_key=True)
    total_users = models.IntegerField(default=0)
    active_users = models.IntegerField(default=0)
    total_posts = models.IntegerField(default=0)
    total_comments = models.IntegerField(default=0)
    total_reactions = models.IntegerField(default=0)
    total_messages = models.IntegerField(default=0)
    total_reports = models.IntegerField(default=0)
    is_seed_data = models.BooleanField(default=False)

    class Meta:
        db_table = 'connecta_daily_analytics'
        ordering = ['-date']

    def __str__(self):
        return f"Analytics {self.date}: {self.total_users} Users, {self.total_posts} Posts"
