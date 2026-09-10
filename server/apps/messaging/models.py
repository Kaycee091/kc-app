from django.db import models
from django.conf import settings

class Conversation(models.Model):
    id = models.CharField(max_length=64, primary_key=True)
    is_group = models.BooleanField(default=False)
    name = models.CharField(max_length=150, blank=True, default='')
    avatar_url = models.URLField(max_length=500, blank=True, default='')
    is_seed_data = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'connecta_conversations'
        ordering = ['-updated_at']

    def __str__(self):
        return f"Conversation {self.id} ({self.name or '1-on-1'})"

class ConversationMember(models.Model):
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name='members')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='conversations')
    is_seed_data = models.BooleanField(default=False)
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'connecta_conversation_members'
        unique_together = ('conversation', 'user')

    def __str__(self):
        return f"{self.user.username} in Conv {self.conversation.id}"

class Message(models.Model):
    id = models.CharField(max_length=64, primary_key=True)
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='sent_messages')
    content = models.TextField()
    attachment_url = models.URLField(max_length=500, blank=True, default='')
    attachment_type = models.CharField(max_length=30, blank=True, default='')
    is_read = models.BooleanField(default=False)
    is_seed_data = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'connecta_messages'
        ordering = ['created_at']

    def __str__(self):
        return f"Msg {self.id} by {self.sender.username}"
