from django.db import models
from django.conf import settings

class Profile(models.Model):
    GENDER_CHOICES = (
        ('male', 'Male'),
        ('female', 'Female'),
        ('other', 'Other'),
        ('unspecified', 'Unspecified'),
    )

    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='profile', primary_key=True)
    bio = models.TextField(blank=True, default='')
    gender = models.CharField(max_length=20, choices=GENDER_CHOICES, default='unspecified')
    dob = models.DateField(blank=True, null=True)
    location = models.CharField(max_length=150, blank=True, default='')
    website = models.URLField(max_length=255, blank=True, default='')
    avatar_url = models.URLField(max_length=500, blank=True, default='')
    cover_url = models.URLField(max_length=500, blank=True, default='')
    privacy_settings = models.JSONField(default=dict, blank=True)
    notification_settings = models.JSONField(default=dict, blank=True)
    user_preferences = models.JSONField(default=dict, blank=True)
    is_seed_data = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'connecta_profiles'

    def __str__(self):
        return f"Profile of {self.user.username}"
