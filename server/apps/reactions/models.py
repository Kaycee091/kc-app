from django.db import models
from django.conf import settings
from apps.posts.models import Post

class Reaction(models.Model):
    REACTION_CHOICES = (
        ('like', 'Like'),
        ('love', 'Love'),
        ('care', 'Care'),
        ('haha', 'Haha'),
        ('wow', 'Wow'),
        ('sad', 'Sad'),
        ('angry', 'Angry'),
    )

    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='reactions')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='reactions')
    reaction_type = models.CharField(max_length=20, choices=REACTION_CHOICES, default='like')
    is_seed_data = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'connecta_reactions'
        unique_together = ('post', 'user')

    def __str__(self):
        return f"{self.user.username} reacted {self.reaction_type} to Post {self.post.id}"
