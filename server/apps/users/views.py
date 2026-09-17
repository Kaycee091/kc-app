from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action, api_view, permission_classes
from django.contrib.auth import get_user_model
from django.db.models import Q
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
        reason = request.data.get('reason', '').strip() or 'Suspended for policy violation'
        user.status = 'suspended'
        user.is_active = False
        user.ban_reason = reason
        user.banned_at = timezone.now()
        user.save()
        return Response({'success': True, 'message': f'User {user.username} suspended', 'status': user.status})

    @action(detail=True, methods=['post'])
    def restore(self, request, pk=None):
        user = self.get_object()
        user.status = 'active'
        user.is_active = True
        user.save()
        return Response({'success': True, 'message': f'User {user.username} restored', 'status': user.status})

    @action(detail=True, methods=['post'])
    def ban(self, request, pk=None):
        user = self.get_object()
        reason = request.data.get('reason', '').strip()
        admin_user = request.user if request.user.is_authenticated else None

        user.status = 'banned'
        user.is_active = False
        user.ban_reason = reason or 'Account banned by administrator for terms violation.'
        user.banned_at = timezone.now()
        if admin_user:
            user.banned_by = admin_user
        user.save()

        # Log action in ModerationLog
        try:
            from apps.moderation.models import ModerationLog
            import uuid
            log_admin = admin_user or User.objects.filter(role__in=['super_admin', 'admin']).first() or user
            ModerationLog.objects.create(
                id=f"mod_{uuid.uuid4().hex[:12]}",
                admin=log_admin,
                action='User Banned',
                target_type='user',
                target_id=user.id,
                reason=user.ban_reason,
            )
        except Exception as e:
            print(f"[Connecta Moderation] Log error: {e}")

        return Response({
            'success': True,
            'message': f'User {user.username} has been permanently banned.',
            'status': user.status,
            'ban_reason': user.ban_reason,
            'banned_at': user.banned_at,
        })

    @action(detail=True, methods=['post'])
    def unban(self, request, pk=None):
        user = self.get_object()
        user.status = 'active'
        user.is_active = True
        user.save()

        try:
            from apps.moderation.models import ModerationLog
            import uuid
            admin_user = request.user if request.user.is_authenticated else None
            log_admin = admin_user or User.objects.filter(role__in=['super_admin', 'admin']).first() or user
            ModerationLog.objects.create(
                id=f"mod_{uuid.uuid4().hex[:12]}",
                admin=log_admin,
                action='User Unbanned',
                target_type='user',
                target_id=user.id,
                reason='Ban lifted by administrator',
            )
        except Exception as e:
            print(f"[Connecta Moderation] Log error: {e}")

        return Response({
            'success': True,
            'message': f'User {user.username} has been unbanned and restored to active status.',
            'status': user.status,
        })

    @action(detail=True, methods=['get'])
    def admin_details(self, request, pk=None):
        user = self.get_object()
        from apps.posts.models import Post
        from apps.comments.models import Comment
        from apps.reactions.models import Reaction
        from apps.reports.models import Report
        from apps.friendships.models import Friendship
        from apps.follows.models import Follow
        from apps.groups.models import GroupMember
        from apps.pages.models import PageFollower
        from apps.moderation.models import Appeal, ModerationLog
        from apps.posts.serializers import PostSerializer
        from apps.moderation.serializers import AppealSerializer

        posts_qs = Post.objects.filter(author=user).order_by('-created_at')
        posts_count = posts_qs.count()
        comments_count = Comment.objects.filter(author=user).count()
        reactions_count = Reaction.objects.filter(user=user).count()
        friends_count = Friendship.objects.filter(
            Q(user_a=user) | Q(user_b=user),
            status='accepted'
        ).count()
        followers_count = Follow.objects.filter(following=user).count()
        following_count = Follow.objects.filter(follower=user).count()
        groups_count = GroupMember.objects.filter(user=user).count()
        pages_count = PageFollower.objects.filter(user=user).count()

        reports_against = Report.objects.filter(reported_user=user).order_by('-created_at')
        reports_against_count = reports_against.count()
        reports_filed_count = Report.objects.filter(reporter=user).count()

        appeals_qs = Appeal.objects.filter(user=user).order_by('-created_at')
        moderation_logs = ModerationLog.objects.filter(target_id=user.id).order_by('-created_at')

        recent_posts = PostSerializer(posts_qs[:10], many=True).data

        recent_reports = [
            {
                'id': r.id,
                'reporter': r.reporter.username if r.reporter else 'Anonymous',
                'report_type': r.report_type,
                'reason': r.reason,
                'status': r.status,
                'created_at': r.created_at,
            }
            for r in reports_against[:5]
        ]

        mod_logs_data = [
            {
                'id': log.id,
                'admin': log.admin.username if log.admin else 'Admin',
                'action': log.action,
                'reason': log.reason,
                'created_at': log.created_at,
            }
            for log in moderation_logs[:10]
        ]

        return Response({
            'success': True,
            'user': UserSerializer(user).data,
            'stats': {
                'posts_count': posts_count,
                'comments_count': comments_count,
                'reactions_count': reactions_count,
                'friends_count': friends_count,
                'followers_count': followers_count,
                'following_count': following_count,
                'groups_count': groups_count,
                'pages_count': pages_count,
                'reports_against_count': reports_against_count,
                'reports_filed_count': reports_filed_count,
            },
            'recent_posts': recent_posts,
            'recent_reports': recent_reports,
            'moderation_logs': mod_logs_data,
            'appeals': AppealSerializer(appeals_qs, many=True).data,
        })

    @action(detail=True, methods=['patch'])
    def update_profile(self, request, pk=None):
        """Allow admin to patch user + profile fields."""
        user = self.get_object()
        # User-level fields
        for field in ('first_name', 'last_name', 'email', 'status', 'role'):
            if field in request.data:
                setattr(user, field, request.data[field])
        user.save()
        # Profile fields
        profile = getattr(user, 'profile', None)
        if profile:
            for field in ('bio', 'location', 'avatar_url', 'cover_url', 'gender', 'website'):
                if field in request.data:
                    setattr(profile, field, request.data[field])
            profile.save()
        serializer = UserSerializer(user)
        return Response({'success': True, 'user': serializer.data})


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def admin_dashboard_stats(request):
    from apps.moderation.models import Appeal
    return Response({
        'total_users': User.objects.count(),
        'active_users': User.objects.filter(status='active').count(),
        'suspended_users': User.objects.filter(status='suspended').count(),
        'banned_users': User.objects.filter(status='banned').count(),
        'total_posts': Post.objects.count(),
        'total_comments': Comment.objects.count(),
        'total_reactions': Reaction.objects.count(),
        'total_reports': Report.objects.count(),
        'pending_reports': Report.objects.filter(status='pending').count(),
        'pending_appeals': Appeal.objects.filter(status='pending').count(),
    })


# ─────────────────────────────────────────────────────────────────────────────
# REGISTRATION — persist a new verified user to the database
# ─────────────────────────────────────────────────────────────────────────────

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def register_user(request):
    """
    Called by the frontend after email verification succeeds.
    Creates a real User + Profile in the database.
    Idempotent: if the email/username already exists, returns the existing record.
    """
    from apps.profiles.models import Profile

    email = request.data.get('email', '').strip().lower()
    username = request.data.get('username', '').strip().lower()
    first_name = request.data.get('first_name', '').strip()
    last_name = request.data.get('last_name', '').strip()
    password = request.data.get('password', '')
    avatar_url = request.data.get('avatar_url', '')
    bio = request.data.get('bio', '')
    location = request.data.get('location', '')
    frontend_id = request.data.get('frontend_id', '')  # ID generated by the frontend

    # Basic validation
    if not email or '@' not in email:
        return Response({'success': False, 'error': 'Valid email is required.'}, status=status.HTTP_400_BAD_REQUEST)
    if not username:
        return Response({'success': False, 'error': 'Username is required.'}, status=status.HTTP_400_BAD_REQUEST)
    if not password:
        return Response({'success': False, 'error': 'Password is required.'}, status=status.HTTP_400_BAD_REQUEST)

    # Check for duplicate email
    if User.objects.filter(email__iexact=email).exists():
        existing = User.objects.get(email__iexact=email)
        serializer = UserSerializer(existing)
        return Response({
            'success': True,
            'message': 'User already exists.',
            'user': serializer.data,
            'already_existed': True,
        })

    # Check for duplicate username — auto-suffix if needed
    base_username = username
    counter = 1
    while User.objects.filter(username__iexact=username).exists():
        username = f"{base_username}{counter}"
        counter += 1

    # Use the frontend-generated ID when provided so that localStorage keys stay consistent
    user_id = frontend_id if frontend_id else None

    try:
        user = User(
            username=username,
            email=email,
            first_name=first_name or username,
            last_name=last_name or 'User',
            role='user',
            status='active',
            email_verified=True,
            is_active=True,
        )
        if user_id:
            user.id = user_id
        user.set_password(password)
        user.save()

        # Create matching profile
        Profile.objects.get_or_create(
            user=user,
            defaults={
                'bio': bio,
                'location': location,
                'avatar_url': avatar_url,
            }
        )

        serializer = UserSerializer(user)
        return Response({
            'success': True,
            'message': 'User registered successfully.',
            'user': serializer.data,
        }, status=status.HTTP_201_CREATED)

    except Exception as e:
        print(f"[Connecta] register_user error: {e}")
        return Response({
            'success': False,
            'error': f'Registration failed: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ─────────────────────────────────────────────────────────────────────────────
# EMAIL VERIFICATION (existing)
# ─────────────────────────────────────────────────────────────────────────────

import secrets
from django.utils import timezone
from datetime import timedelta
from django.core.mail import send_mail
from django.conf import settings
from apps.users.models import EmailVerificationCode


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def send_verification_email(request):
    email = request.data.get('email', '').strip().lower()
    if not email or '@' not in email:
        return Response({'success': False, 'error': 'Please provide a valid email address.'}, status=status.HTTP_400_BAD_REQUEST)

    # Invalidate previous unused codes for this email
    EmailVerificationCode.objects.filter(email=email, is_used=False).update(is_used=True)

    # Generate cryptographically secure 6-digit code
    code = f"{secrets.randbelow(900000) + 100000}"
    expires_at = timezone.now() + timedelta(minutes=10)

    EmailVerificationCode.objects.create(
        email=email,
        code=code,
        expires_at=expires_at,
    )

    # Send email
    subject = "Verify your Connecta account"
    message = (
        f"Hello,\n\n"
        f"Your Connecta verification code is: {code}\n\n"
        f"This code will expire in 10 minutes.\n"
        f"If you did not request this verification code, please ignore this email.\n\n"
        f"— The Connecta Team"
    )

    try:
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[email],
            fail_silently=False,
        )
    except Exception as e:
        print(f"[Connecta Email Service] Delivery note: {e}")

    return Response({
        'success': True,
        'message': f'Verification code dispatched to {email}.',
        'expires_in': 600
    })


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def verify_email_code(request):
    email = request.data.get('email', '').strip().lower()
    code = request.data.get('code', '').strip()

    if not email or not code:
        return Response({'success': False, 'error': 'Email and verification code are required.'}, status=status.HTTP_400_BAD_REQUEST)

    record = EmailVerificationCode.objects.filter(email=email, is_used=False).order_by('-created_at').first()
    if not record:
        return Response({'success': False, 'error': 'No active verification session found. Please request a new code.'}, status=status.HTTP_400_BAD_REQUEST)

    # Check attempt limit (max 5)
    if record.attempts >= 5:
        record.is_used = True
        record.save()
        return Response({'success': False, 'error': 'Maximum verification attempts exceeded. Please request a new code.'}, status=status.HTTP_400_BAD_REQUEST)

    record.attempts += 1

    # Check expiration
    if timezone.now() > record.expires_at:
        record.is_used = True
        record.save()
        return Response({'success': False, 'error': 'Verification code has expired. Please request a new code.'}, status=status.HTTP_400_BAD_REQUEST)

    # Validate code
    if record.code != code:
        record.save()
        return Response({'success': False, 'error': 'Invalid verification code. Please check the code in your email and try again.'}, status=status.HTTP_400_BAD_REQUEST)

    # Mark code as used
    record.is_used = True
    record.save()

    # Mark user account as email verified if exists
    User.objects.filter(email__iexact=email).update(email_verified=True)

    return Response({
        'success': True,
        'message': 'Email verified successfully.'
    })
