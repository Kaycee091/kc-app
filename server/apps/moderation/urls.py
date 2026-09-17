from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.moderation.views import AppealViewSet

router = DefaultRouter()
router.register(r'appeals', AppealViewSet, basename='appeal')

urlpatterns = [
    path('', include(router.urls)),
]
