from rest_framework import serializers
from apps.moderation.models import Appeal, ModerationLog
from apps.users.serializers import UserSerializer

class AppealSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    reviewed_by = UserSerializer(read_only=True)
    user_id = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = Appeal
        fields = [
            'id', 'user', 'user_id', 'ban_reason', 'appeal_message',
            'supporting_info', 'status', 'created_at', 'reviewed_at',
            'reviewed_by', 'admin_notes'
        ]

class ModerationLogSerializer(serializers.ModelSerializer):
    admin = UserSerializer(read_only=True)

    class Meta:
        model = ModerationLog
        fields = '__all__'
