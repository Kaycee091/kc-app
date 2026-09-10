from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.users.views import UserViewSet, admin_dashboard_stats

router = DefaultRouter()
router.register(r'', UserViewSet, basename='user')

urlpatterns = [
    path('admin-stats/', admin_dashboard_stats, name='admin-stats'),
    path('', include(router.urls)),
]
