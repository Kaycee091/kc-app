from django.db import models
from django.conf import settings

class Video(models.Model):
    id = models.CharField(max_length=64, primary_key=True)
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='videos')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, default='')
    video_url = models.URLField(max_length=500)
    thumbnail_url = models.URLField(max_length=500, blank=True, default='')
    duration = models.IntegerField(default=60) # seconds
    views_count = models.IntegerField(default=0)
    is_seed_data = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'connecta_videos'
        ordering = ['-created_at']

    def __str__(self):
        return f"Video: {self.title}"

class Album(models.Model):
    id = models.CharField(max_length=64, primary_key=True)
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='albums')
    title = models.CharField(max_length=150)
    description = models.TextField(blank=True, default='')
    category = models.CharField(max_length=50, default='General')
    is_seed_data = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'connecta_albums'

    def __str__(self):
        return f"Album {self.title} by {self.owner.username}"

class Photo(models.Model):
    id = models.CharField(max_length=64, primary_key=True)
    album = models.ForeignKey(Album, on_delete=models.CASCADE, null=True, blank=True, related_name='photos')
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='photos')
    image_url = models.URLField(max_length=500)
    caption = models.TextField(blank=True, default='')
    is_seed_data = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'connecta_photos'
        ordering = ['-created_at']

    def __str__(self):
        return f"Photo {self.id} by {self.author.username}"
