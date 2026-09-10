from django.db import models
from django.conf import settings

class Friendship(models.Model):
    STATUS_CHOICES = (
        ('accepted', 'Accepted'),
        ('pending', 'Pending'),
    )

    user_a = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='friendships_initiated')
    user_b = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='friendships_received')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='accepted')
    is_seed_data = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'connecta_friendships'
        unique_together = ('user_a', 'user_b')

    def __str__(self):
        return f"Friendship ({self.user_a.username} <-> {self.user_b.username})"
