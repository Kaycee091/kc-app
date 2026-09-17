from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.utils import timezone
from django.db.models import Q
from django.contrib.auth import get_user_model
import uuid

from apps.moderation.models import Appeal, ModerationLog
from apps.moderation.serializers import AppealSerializer, ModerationLogSerializer

User = get_user_model()

class AppealViewSet(viewsets.ModelViewSet):
    queryset = Appeal.objects.select_related('user', 'reviewed_by').all().order_by('-created_at')
    serializer_class = AppealSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        qs = super().get_queryset()
        status_param = self.request.query_params.get('status', None)
        search = self.request.query_params.get('search', None)
        user_id = self.request.query_params.get('user_id', None)

        if status_param and status_param != 'all':
            qs = qs.filter(status=status_param)
        if user_id:
            qs = qs.filter(user_id=user_id)
        if search:
            qs = qs.filter(
                Q(user__username__icontains=search) |
                Q(user__email__icontains=search) |
                Q(user__first_name__icontains=search) |
                Q(user__last_name__icontains=search) |
                Q(appeal_message__icontains=search) |
                Q(id__icontains=search)
            )
        return qs

    def create(self, request, *args, **kwargs):
        appeal_message = request.data.get('appeal_message', '').strip()
        supporting_info = request.data.get('supporting_info', '').strip()
        user_id = request.data.get('user_id') or request.headers.get('X-User-Id')

        if not appeal_message:
            return Response({'success': False, 'error': 'Appeal message is required.'}, status=status.HTTP_400_BAD_REQUEST)

        # Resolve user
        user = None
        if user_id:
            user = User.objects.filter(id=user_id).first()
        elif request.user.is_authenticated:
            user = request.user

        if not user:
            return Response({'success': False, 'error': 'Unable to identify user account.'}, status=status.HTTP_400_BAD_REQUEST)

        # Check if there is already a pending appeal
        existing_pending = Appeal.objects.filter(user=user, status='pending').first()
        if existing_pending:
            serializer = self.get_serializer(existing_pending)
            return Response({
                'success': True,
                'message': 'An appeal is already pending review.',
                'appeal': serializer.data,
                'already_pending': True
            }, status=status.HTTP_200_OK)

        ban_reason = getattr(user, 'ban_reason', '') or request.data.get('ban_reason', '')

        appeal = Appeal.objects.create(
            id=f"appeal_{uuid.uuid4().hex[:12]}",
            user=user,
            ban_reason=ban_reason,
            appeal_message=appeal_message,
            supporting_info=supporting_info,
            status='pending',
        )

        serializer = self.get_serializer(appeal)
        return Response({
            'success': True,
            'message': 'Ban appeal submitted successfully. Our team will review it shortly.',
            'appeal': serializer.data,
        }, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['get'])
    def my_appeal(self, request):
        user_id = request.query_params.get('user_id') or request.headers.get('X-User-Id')
        user = None
        if user_id:
            user = User.objects.filter(id=user_id).first()
        elif request.user.is_authenticated:
            user = request.user

        if not user:
            return Response({'appeal': None})

        latest_appeal = Appeal.objects.filter(user=user).order_by('-created_at').first()
        if not latest_appeal:
            return Response({'appeal': None})

        serializer = self.get_serializer(latest_appeal)
        return Response({'appeal': serializer.data})

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        appeal = self.get_object()
        notes = request.data.get('notes', '').strip()
        admin_user = request.user if request.user.is_authenticated else None

        appeal.status = 'approved'
        appeal.reviewed_at = timezone.now()
        if admin_user:
            appeal.reviewed_by = admin_user
        if notes:
            appeal.admin_notes = notes
        appeal.save()

        # Unban user account in database
        user = appeal.user
        user.status = 'active'
        user.is_active = True
        user.ban_reason = ''
        user.save()

        # Log action
        try:
            log_admin = admin_user or User.objects.filter(role__in=['super_admin', 'admin']).first() or user
            ModerationLog.objects.create(
                id=f"mod_{uuid.uuid4().hex[:12]}",
                admin=log_admin,
                action='Appeal Approved — User Unbanned',
                target_type='appeal',
                target_id=appeal.id,
                reason=notes or f"Appeal approved for @{user.username}",
            )
        except Exception as e:
            print(f"[Connecta Moderation] Log error: {e}")

        serializer = self.get_serializer(appeal)
        return Response({
            'success': True,
            'message': f'Appeal approved. @{user.username} has been unbanned and restored to active status.',
            'appeal': serializer.data,
            'user_status': user.status,
        })

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        appeal = self.get_object()
        notes = request.data.get('notes', '').strip()
        admin_user = request.user if request.user.is_authenticated else None

        appeal.status = 'rejected'
        appeal.reviewed_at = timezone.now()
        if admin_user:
            appeal.reviewed_by = admin_user
        if notes:
            appeal.admin_notes = notes
        appeal.save()

        # User remains banned
        user = appeal.user
        if user.status != 'banned':
            user.status = 'banned'
            user.is_active = False
            user.save()

        # Log action
        try:
            log_admin = admin_user or User.objects.filter(role__in=['super_admin', 'admin']).first() or user
            ModerationLog.objects.create(
                id=f"mod_{uuid.uuid4().hex[:12]}",
                admin=log_admin,
                action='Appeal Rejected',
                target_type='appeal',
                target_id=appeal.id,
                reason=notes or f"Appeal rejected for @{user.username}",
            )
        except Exception as e:
            print(f"[Connecta Moderation] Log error: {e}")

        serializer = self.get_serializer(appeal)
        return Response({
            'success': True,
            'message': f'Appeal for @{user.username} has been rejected. Account remains banned.',
            'appeal': serializer.data,
            'user_status': user.status,
        })
