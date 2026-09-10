from django.db import models
from django.conf import settings

class Page(models.Model):
    STATUS_CHOICES = (
        ('active', 'Active'),
        ('suspended', 'Suspended'),
    )

    id = models.CharField(max_length=64, primary_key=True)
    name = models.CharField(max_length=150)
    slug = models.SlugField(max_length=150, unique=True)
    description = models.TextField(blank=True, default='')
    category = models.CharField(max_length=100, default='General')
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='owned_pages')
    avatar_url = models.URLField(max_length=500, blank=True, default='')
    cover_url = models.URLField(max_length=500, blank=True, default='')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    is_seed_data = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'connecta_pages'

    def __str__(self):
        return self.name

class PageFollower(models.Model):
    page = models.ForeignKey(Page, on_delete=models.CASCADE, related_name='followers')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='followed_pages')
    is_seed_data = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'connecta_page_followers'
        unique_together = ('page', 'user')

    def __str__(self):
        return f"{self.user.username} follows page {self.page.name}"
