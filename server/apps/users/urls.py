from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.users.views import (
    UserViewSet,
    admin_dashboard_stats,
    send_verification_email,
    verify_email_code,
    register_user,
)

router = DefaultRouter()
router.register(r'', UserViewSet, basename='user')

urlpatterns = [
    path('admin-stats/', admin_dashboard_stats, name='admin-stats'),
    path('send-verification/', send_verification_email, name='send-verification'),
    path('verify-code/', verify_email_code, name='verify-code'),
    path('register/', register_user, name='register-user'),
    path('', include(router.urls)),
]
