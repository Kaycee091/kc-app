from django.db import models
from django.conf import settings

class SavedItem(models.Model):
    id = models.CharField(max_length=64, primary_key=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='saved_items')
    item_type = models.CharField(max_length=30, default='post') # post, video, marketplace
    item_id = models.CharField(max_length=64)
    is_seed_data = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'connecta_saved_items'
        unique_together = ('user', 'item_type', 'item_id')

    def __str__(self):
        return f"Saved {self.item_type}:{self.item_id} by {self.user.username}"
