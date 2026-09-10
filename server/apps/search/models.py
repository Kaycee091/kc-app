from django.db import models
from django.conf import settings

class SearchLog(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    query = models.CharField(max_length=255)
    is_seed_data = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'connecta_search_logs'

    def __str__(self):
        return f"Search: {self.query}"
