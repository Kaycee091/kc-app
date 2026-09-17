from rest_framework import viewsets, permissions
from django.db.models import Count, Q
from apps.posts.models import Post
from apps.posts.serializers import PostSerializer

class PostViewSet(viewsets.ModelViewSet):
    serializer_class = PostSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        qs = Post.objects.select_related('author', 'author__profile', 'group', 'page')\
                         .annotate(comments_count=Count('comments', distinct=True),
                                   reactions_count=Count('reactions', distinct=True))\
                         .order_by('-created_at')
        
        search = self.request.query_params.get('search', None)
        author_id = self.request.query_params.get('author_id', None)
        privacy = self.request.query_params.get('privacy', None)

        if search:
            qs = qs.filter(Q(content__icontains=search) | Q(location__icontains=search))
        if author_id:
            qs = qs.filter(author_id=author_id)
        if privacy:
            qs = qs.filter(privacy=privacy)
            
        return qs

    def perform_create(self, serializer):
        from django.utils import timezone
        import time
        from django.contrib.auth import get_user_model
        User = get_user_model()

        author = None
        if self.request.user and self.request.user.is_authenticated:
            author = self.request.user
        else:
            author_id = self.request.data.get('author_id') or self.request.headers.get('X-User-Id')
            if author_id:
                author = User.objects.filter(id=author_id).first()
            if not author:
                author = User.objects.first()

        post_id = self.request.data.get('id') or f"post_{int(time.time()*1000)}"
        serializer.save(id=post_id, author=author)
