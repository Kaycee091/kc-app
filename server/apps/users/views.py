from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action, api_view, permission_classes
from django.contrib.auth import get_user_model
from django.db.models import Q, Count
from apps.users.serializers import UserSerializer
from apps.posts.models import Post
from apps.comments.models import Comment
from apps.reactions.models import Reaction
from apps.reports.models import Report

User = get_user_model()

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.select_related('profile').all().order_by('-date_joined')
    serializer_class = UserSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        qs = super().get_queryset()
        search = self.request.query_params.get('search', None)
        status_param = self.request.query_params.get('status', None)
        role = self.request.query_params.get('role', None)

        if search:
            qs = qs.filter(
                Q(username__icontains=search) |
                Q(email__icontains=search) |
                Q(first_name__icontains=search) |
                Q(last_name__icontains=search)
            )
        if status_param:
            qs = qs.filter(status=status_param)
        if role:
            qs = qs.filter(role=role)
        return qs

    @action(detail=True, methods=['post'])
    def suspend(self, request, pk=None):
        user = self.get_object()
        user.status = 'suspended'
        user.is_active = False
        user.save()
        return Response({'success': True, 'message': f'User {user.username} suspended', 'status': user.status})

    @action(detail=True, methods=['post'])
    def restore(self, request, pk=None):
        user = self.get_object()
        user.status = 'active'
        user.is_active = True
        user.save()
        return Response({'success': True, 'message': f'User {user.username} restored', 'status': user.status})

@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def admin_dashboard_stats(request):
    return Response({
        'total_users': User.objects.count(),
        'active_users': User.objects.filter(status='active').count(),
        'suspended_users': User.objects.filter(status='suspended').count(),
        'total_posts': Post.objects.count(),
        'total_comments': Comment.objects.count(),
        'total_reactions': Reaction.objects.count(),
        'total_reports': Report.objects.count(),
        'pending_reports': Report.objects.filter(status='pending').count()
    })
