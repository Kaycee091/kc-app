from rest_framework import serializers
from apps.posts.models import Post
from apps.users.serializers import UserSerializer

class PostSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    comments_count = serializers.SerializerMethodField(method_name='get_comments_count')
    reactions_count = serializers.SerializerMethodField(method_name='get_reactions_count')

    class Meta:
        model = Post
        fields = '__all__'

    def get_comments_count(self, obj):
        return getattr(obj, 'comments_count', obj.comments.count())

    def get_reactions_count(self, obj):
        return getattr(obj, 'reactions_count', obj.reactions.count())
