from django.db import models
from django.conf import settings
from apps.groups.models import Group
from apps.pages.models import Page

class Post(models.Model):
    POST_TYPE_CHOICES = (
        ('text', 'Text'),
        ('image', 'Image'),
        ('video', 'Video'),
        ('poll', 'Poll'),
        ('shared', 'Shared'),
        ('check_in', 'Check-In'),
    )
    PRIVACY_CHOICES = (
        ('public', 'Public'),
        ('friends', 'Friends'),
        ('only_me', 'Only Me'),
    )

    id = models.CharField(max_length=64, primary_key=True)
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='posts')
    content = models.TextField(blank=True, default='')
    media_urls = models.JSONField(default=list, blank=True)
    post_type = models.CharField(max_length=20, choices=POST_TYPE_CHOICES, default='text')
    privacy = models.CharField(max_length=20, choices=PRIVACY_CHOICES, default='public')
    location = models.CharField(max_length=150, blank=True, default='')
    shared_post = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='shares')
    group = models.ForeignKey(Group, on_delete=models.CASCADE, null=True, blank=True, related_name='posts')
    page = models.ForeignKey(Page, on_delete=models.CASCADE, null=True, blank=True, related_name='posts')
    poll_data = models.JSONField(default=dict, blank=True, null=True)
    is_seed_data = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'connecta_posts'
        ordering = ['-created_at']

    def __str__(self):
        return f"Post #{self.id} by {self.author.username}"
