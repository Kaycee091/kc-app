from django.db import models
from django.conf import settings

class Group(models.Model):
    PRIVACY_CHOICES = (
        ('public', 'Public'),
        ('private', 'Private'),
    )
    STATUS_CHOICES = (
        ('active', 'Active'),
        ('inactive', 'Inactive'),
    )

    id = models.CharField(max_length=64, primary_key=True)
    name = models.CharField(max_length=150)
    slug = models.SlugField(max_length=150, unique=True)
    description = models.TextField(blank=True, default='')
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='owned_groups')
    privacy = models.CharField(max_length=20, choices=PRIVACY_CHOICES, default='public')
    category = models.CharField(max_length=100, default='General')
    avatar_url = models.URLField(max_length=500, blank=True, default='')
    cover_url = models.URLField(max_length=500, blank=True, default='')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    is_seed_data = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'connecta_groups'

    def __str__(self):
        return self.name

class GroupMember(models.Model):
    ROLE_CHOICES = (
        ('admin', 'Admin'),
        ('moderator', 'Moderator'),
        ('member', 'Member'),
    )

    group = models.ForeignKey(Group, on_delete=models.CASCADE, related_name='memberships')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='group_memberships')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='member')
    is_seed_data = models.BooleanField(default=False)
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'connecta_group_members'
        unique_together = ('group', 'user')

    def __str__(self):
        return f"{self.user.username} in {self.group.name}"
