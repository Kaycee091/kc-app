from django.http import JsonResponse
from django.contrib.auth import get_user_model

User = get_user_model()

class EnforceActiveAccountMiddleware:
    """
    Middleware to ensure banned and suspended users cannot access normal
    Connecta features (posts, comments, reactions, friends, messaging, groups, etc.).
    Only allows auth, status check, and appeal submission.
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        path = request.path

        # Whitelist non-API routes and permitted API routes
        ALLOWED_PREFIXES = (
            '/admin/',
            '/static/',
            '/media/',
            '/api/v1/moderation/appeals/',
            '/api/v1/users/send-verification/',
            '/api/v1/users/verify-code/',
            '/api/v1/users/register/',
            '/api/v1/users/admin-stats/',
        )

        if any(path.startswith(prefix) for prefix in ALLOWED_PREFIXES):
            return self.get_response(request)

        # Check if user is authenticated via Django auth or via X-User-Id / user_id header
        user = None
        if hasattr(request, 'user') and request.user.is_authenticated:
            user = request.user
        else:
            user_id = request.headers.get('X-User-Id') or request.META.get('HTTP_X_USER_ID')
            if user_id:
                try:
                    user = User.objects.filter(id=user_id).first()
                except Exception:
                    user = None

        if user and getattr(user, 'status', None) in ('banned', 'suspended'):
            # Allow user to check their own profile/status with GET
            if request.method == 'GET' and (path.rstrip('/') == f'/api/v1/users/{user.id}' or path.rstrip('/') == '/api/v1/users'):
                return self.get_response(request)

            reason = getattr(user, 'ban_reason', '') or 'Your account has been banned for violating community guidelines.'
            banned_at = getattr(user, 'banned_at', None)
            return JsonResponse({
                'error': f'Your account has been {user.status}.',
                'banned': user.status == 'banned',
                'suspended': user.status == 'suspended',
                'status': user.status,
                'ban_reason': reason,
                'banned_at': banned_at.isoformat() if banned_at else None,
            }, status=403)

        return self.get_response(request)
