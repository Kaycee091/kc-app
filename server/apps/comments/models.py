from django.db import models
from django.conf import settings
from apps.posts.models import Post

class Comment(models.Model):
    id = models.CharField(max_length=64, primary_key=True)
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='comments')
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='comments')
    content = models.TextField()
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='replies')
    is_seed_data = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'connecta_comments'
        ordering = ['created_at']

    def __str__(self):
        return f"Comment {self.id} by {self.author.username}"
