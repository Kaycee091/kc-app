from django.db import models
from django.conf import settings

class Story(models.Model):
    STORY_TYPE_CHOICES = (
        ('text', 'Text'),
        ('image', 'Image'),
        ('video', 'Video'),
    )

    id = models.CharField(max_length=64, primary_key=True)
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='stories')
    content = models.TextField(blank=True, default='')
    media_url = models.URLField(max_length=500, blank=True, default='')
    story_type = models.CharField(max_length=20, choices=STORY_TYPE_CHOICES, default='image')
    background_color = models.CharField(max_length=30, blank=True, default='#1877F2')
    expires_at = models.DateTimeField()
    is_seed_data = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'connecta_stories'
        ordering = ['-created_at']

    def __str__(self):
        return f"Story #{self.id} by {self.author.username}"
