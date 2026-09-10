from django.db import models
from django.conf import settings
from apps.posts.models import Post
from apps.media.models import Photo

class Memory(models.Model):
    id = models.CharField(max_length=64, primary_key=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='memories')
    post = models.ForeignKey(Post, on_delete=models.CASCADE, null=True, blank=True)
    photo = models.ForeignKey(Photo, on_delete=models.CASCADE, null=True, blank=True)
    memory_date = models.DateTimeField()
    is_seed_data = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'connecta_memories'

    def __str__(self):
        return f"Memory {self.id} for {self.user.username}"
