from django.db import models
from django.contrib.auth.models import AbstractUser
import uuid

def generate_user_id():
    return f"user_{uuid.uuid4().hex[:12]}"

class User(AbstractUser):
    ROLE_CHOICES = (
        ('super_admin', 'Super Admin'),
        ('moderator', 'Moderator'),
        ('user', 'User'),
    )
    STATUS_CHOICES = (
        ('active', 'Active'),
        ('inactive', 'Inactive'),
        ('suspended', 'Suspended'),
        ('banned', 'Banned'),
    )

    id = models.CharField(max_length=64, primary_key=True, default=generate_user_id)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='user')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    phone = models.CharField(max_length=30, blank=True, null=True)
    password_hash = models.CharField(max_length=255, blank=True, null=True)
    last_active = models.DateTimeField(auto_now=True)
    is_seed_data = models.BooleanField(default=False)
    email_verified = models.BooleanField(default=False)
    ban_reason = models.TextField(blank=True, default='')
    banned_at = models.DateTimeField(null=True, blank=True)
    banned_by = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='banned_users')

    class Meta:
        db_table = 'connecta_users'

    def __str__(self):
        return f"{self.username} ({self.email})"

class EmailVerificationCode(models.Model):
    id = models.CharField(max_length=64, primary_key=True, default=generate_user_id)
    email = models.EmailField(db_index=True)
    code = models.CharField(max_length=10)
    attempts = models.IntegerField(default=0)
    is_used = models.BooleanField(default=False)
    expires_at = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'connecta_email_verifications'
        ordering = ['-created_at']

    def __str__(self):
        return f"Verification for {self.email} (used: {self.is_used})"

