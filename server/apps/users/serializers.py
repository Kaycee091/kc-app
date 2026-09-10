from rest_framework import serializers
from django.contrib.auth import get_user_model
from apps.profiles.models import Profile

User = get_user_model()

class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = '__all__'

class UserSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer(read_only=True)
    full_name = serializers.SerializerMethodField(method_name='get_full_name')

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 'full_name',
            'role', 'status', 'phone', 'is_active', 'last_active', 'date_joined',
            'is_seed_data', 'profile'
        ]

    def get_full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}".strip() or obj.username
