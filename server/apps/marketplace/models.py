from django.db import models
from django.conf import settings

class MarketplaceListing(models.Model):
    CONDITION_CHOICES = (
        ('new', 'New'),
        ('used_like_new', 'Used - Like New'),
        ('used_good', 'Used - Good'),
        ('used_fair', 'Used - Fair'),
    )
    STATUS_CHOICES = (
        ('available', 'Available'),
        ('pending', 'Pending'),
        ('sold', 'Sold'),
    )

    id = models.CharField(max_length=64, primary_key=True)
    seller = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='marketplace_listings')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, default='')
    price = models.DecimalField(max_digits=12, decimal_places=2)
    currency = models.CharField(max_length=10, default='NGN')
    category = models.CharField(max_length=100, default='Other')
    location = models.CharField(max_length=150, default='Lagos, Nigeria')
    condition = models.CharField(max_length=20, choices=CONDITION_CHOICES, default='used_good')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='available')
    image_url = models.URLField(max_length=500, blank=True, default='')
    is_seed_data = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'connecta_marketplace_listings'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} (₦{self.price})"
