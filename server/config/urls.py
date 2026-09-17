"""
Connecta Server API URL Configuration
"""
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # Connecta REST API v1 Namespace
    path('api/v1/users/', include('apps.users.urls')),
    path('api/v1/posts/', include('apps.posts.urls')),
    path('api/v1/comments/', include('apps.comments.urls')),
    path('api/v1/reactions/', include('apps.reactions.urls')),
    path('api/v1/stories/', include('apps.stories.urls')),
    path('api/v1/friends/', include('apps.friendships.urls')),
    path('api/v1/messaging/', include('apps.messaging.urls')),
    path('api/v1/notifications/', include('apps.notifications.urls')),
    path('api/v1/groups/', include('apps.groups.urls')),
    path('api/v1/pages/', include('apps.pages.urls')),
    path('api/v1/events/', include('apps.events.urls')),
    path('api/v1/marketplace/', include('apps.marketplace.urls')),
    path('api/v1/search/', include('apps.search.urls')),
    path('api/v1/reports/', include('apps.reports.urls')),
    path('api/v1/moderation/', include('apps.moderation.urls')),
]

