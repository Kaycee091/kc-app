import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocialProvider, useSocial } from './context/SocialContext';
import { MessengerProvider } from './context/MessengerContext';
import { AdminProvider, useAdmin } from './context/AdminContext';
import { AuthScreen } from './components/auth/AuthScreen';
import { OnboardingWizard } from './components/auth/OnboardingWizard';
import { Navbar } from './components/layout/Navbar';
import { LeftSidebar } from './components/layout/LeftSidebar';
import { RightSidebar } from './components/layout/RightSidebar';
import { MobileBottomNav } from './components/layout/MobileBottomNav';
import { StoryTray } from './components/stories/StoryTray';
import { PostCard } from './components/feed/PostCard';
import { PostComposer } from './components/feed/PostComposer';
import { MessengerDock } from './components/messenger/MessengerDock';
import { FullMessengerView } from './components/messenger/FullMessengerView';
import { ProfileView } from './components/profile/ProfileView';
import { FriendsView } from './components/friends/FriendsView';
import { GroupFeedView } from './components/groups/GroupFeedView';
import { MarketplaceView } from './components/marketplace/MarketplaceView';
import { EventsView } from './components/events/EventsView';
import { MemoriesView } from './components/memories/MemoriesView';
import { SavedItemsView } from './components/saved/SavedItemsView';
import { AdminLayout } from './components/admin/AdminLayout';
import { WatchView } from './components/watch/WatchView';
import { Avatar } from './components/ui/Avatar';
import { Plus, Image, Smile, Video, ShieldAlert } from 'lucide-react';
import { Skeleton } from './components/ui/Skeleton';
import { router, RouteMatch } from './router';
import { seedService } from './services/seedService';
import { postsService } from './services/postsService';

// Dedicated Pages
import { SearchPage } from './components/pages/SearchPage';
import { NotificationsPage } from './components/pages/NotificationsPage';
import { GroupDetailPage } from './components/pages/GroupDetailPage';
import { PageDetailPage } from './components/pages/PageDetailPage';
import { EventDetailPage } from './components/pages/EventDetailPage';
import { MarketplaceDetailPage } from './components/pages/MarketplaceDetailPage';
import { StoryViewerPage } from './components/pages/StoryViewerPage';
import { SettingsPage } from './components/pages/SettingsPage';
import { AdminLoginPage } from './components/admin/AdminLoginPage';
import { NotFoundPage } from './components/pages/NotFoundPage';
import { SplashScreen } from './components/auth/SplashScreen';
import { OnboardingScreens } from './components/auth/OnboardingScreens';
import { RecommendationBanners } from './components/feed/RecommendationBanners';

const SocialAppContent: React.FC = () => {
  const { user } = useAuth();
  const { activeTab, setActiveTab, posts, globalSearchQuery } = useSocial();
  const { setActiveAdminRoute, setSelectedUserId } = useAdmin();

  const [routeMatch, setRouteMatch] = useState<RouteMatch>(() => router.matchCurrentRoute());
  const [isComposerOpen, setIsComposerOpen] = useState(false);

  useEffect(() => {
    seedService.initializeSeedData();
  }, []);

  useEffect(() => {
    const unsub = router.subscribe((match) => {
      setRouteMatch(match);

      // Sync route patterns with activeTab & admin context
      if (match.pattern.startsWith('/admin')) {
        setActiveTab('admin');
        if (match.pattern === '/admin/users/:id' && match.params.id) {
          setActiveAdminRoute('users');
          setSelectedUserId(match.params.id);
        } else {
          const rawRoute = match.pattern.replace('/admin/', '').replace('/admin', '') || 'dashboard';
          const validRoute = rawRoute.split('/')[0] || 'dashboard';
          setActiveAdminRoute((validRoute as any) || 'dashboard');
          setSelectedUserId(null);
        }
      } else if (match.pattern.startsWith('/friends')) {
        setActiveTab('friends');
      } else if (match.pattern.startsWith('/watch') || match.pattern.startsWith('/videos')) {
        setActiveTab('watch');
      } else if (match.pattern.startsWith('/marketplace')) {
        setActiveTab('marketplace');
      } else if (match.pattern.startsWith('/groups')) {
        setActiveTab('groups');
      } else if (match.pattern.startsWith('/events')) {
        setActiveTab('events');
      } else if (match.pattern.startsWith('/memories')) {
        setActiveTab('memories');
      } else if (match.pattern.startsWith('/saved')) {
        setActiveTab('saved');
      } else if (match.pattern.startsWith('/profile')) {
        setActiveTab('profile');
      } else if (match.pattern.startsWith('/messages')) {
        setActiveTab('messages');
      } else if (match.pattern.startsWith('/notifications')) {
        setActiveTab('notifications');
      } else if (match.pattern.startsWith('/search')) {
        setActiveTab('search');
      } else if (match.pattern.startsWith('/settings')) {
        setActiveTab('settings');
      } else {
        setActiveTab('feed');
      }
    });

    return unsub;
  }, [setActiveTab, setActiveAdminRoute, setSelectedUserId]);

  // 1. ADMIN ROUTES HANDLER
  if (routeMatch.pattern.startsWith('/admin')) {
    if (routeMatch.pattern === '/admin/login') {
      return <AdminLoginPage />;
    }

    const isAdminAuthorized = user && user.role && user.role !== 'user';
    if (!isAdminAuthorized) {
      return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 bg-[#F0F2F5] dark:bg-[#0F172A] text-center animate-fade-in">
          <div className="w-16 h-16 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto mb-4 border border-rose-500/20">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">403 Forbidden — Access Restricted</h1>
          <p className="text-xs text-slate-500 max-w-md mt-2 mb-6 leading-relaxed">
            The Connecta Administrator Portal requires elevated staff credentials (<code className="bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded text-rose-500 font-bold">super_admin, admin, moderator, support</code>). Your account (<strong className="text-slate-700 dark:text-slate-300">@{user?.username}</strong>) is currently authenticated as a standard user role.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => router.navigate('/admin/login')}
              className="px-6 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/25 transition-all"
            >
              Sign In with Staff Account
            </button>
            <button
              onClick={() => router.navigate('/feed')}
              className="px-6 py-2.5 rounded-full bg-[#2563EB] text-white font-bold text-xs shadow-lg shadow-[#2563EB]/25 hover:bg-blue-600 transition-all"
            >
              Return to Connecta Feed
            </button>
          </div>
        </div>
      );
    }

    return <AdminLayout onSwitchToApp={() => router.navigate('/feed')} />;
  }

  // Exclude hidden posts from user feeds
  const activeVisiblePosts = posts.filter((p) => !postsService.getHiddenPostIds().includes(p.id));
  const filteredPosts = globalSearchQuery.trim()
    ? activeVisiblePosts.filter((p) => p.content.toLowerCase().includes(globalSearchQuery.toLowerCase()))
    : activeVisiblePosts;

  // Render main content area based on routeMatch
  const renderMainRouteContent = () => {
    switch (routeMatch.pattern) {
      case '/search':
      case '/search/:category':
        return <SearchPage />;

      case '/notifications':
        return <NotificationsPage />;

      case '/groups/:id':
        return <GroupDetailPage groupId={routeMatch.params.id} />;

      case '/pages/:id':
        return <PageDetailPage pageId={routeMatch.params.id} />;

      case '/events/:id':
        return <EventDetailPage eventId={routeMatch.params.id} />;

      case '/marketplace/:id':
        return <MarketplaceDetailPage itemId={routeMatch.params.id} />;

      case '/stories':
      case '/stories/:id':
        return <StoryViewerPage storyId={routeMatch.params.id} />;

      case '/settings':
      case '/settings/:subtab':
        return <SettingsPage subtab={routeMatch.params.subtab} />;

      case '/friends':
      case '/friends/requests':
      case '/friends/suggestions':
      case '/following':
        return <FriendsView />;

      case '/watch':
      case '/videos':
        return <WatchView />;

      case '/groups':
        return <GroupFeedView />;

      case '/marketplace':
        return <MarketplaceView />;

      case '/events':
        return <EventsView />;

      case '/memories':
        return <MemoriesView />;

      case '/saved':
        return <SavedItemsView />;

      case '/profile':
      case '/profile/:username':
        return <ProfileView />;

      case '/messages':
      case '/messages/:conversationId':
        return <FullMessengerView />;

      case '/feed':
      case '/home':
      case '/':
        return (
          <div className="space-y-4">
            {/* 24h Stories Tray */}
            <StoryTray />

            {/* Create Post Trigger Card */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-4 shadow-sm border border-slate-200/80 dark:border-slate-700/80 space-y-3">
              <div className="flex items-center gap-3">
                <Avatar src={user?.avatar_url} name={user?.full_name || 'User'} size="md" />
                <button
                  onClick={() => setIsComposerOpen(true)}
                  className="flex-1 text-left py-2.5 px-4 rounded-full bg-slate-100 dark:bg-slate-700/70 text-slate-500 dark:text-slate-400 text-xs font-medium hover:bg-slate-200/60 dark:hover:bg-slate-700 transition-colors"
                >
                  What's on your mind, {user?.first_name || 'friend'}?
                </button>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700/80 text-xs font-bold text-slate-600 dark:text-slate-300">
                <button
                  onClick={() => setIsComposerOpen(true)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-rose-500"
                >
                  <Video className="w-4 h-4" /> Live Video
                </button>
                <button
                  onClick={() => setIsComposerOpen(true)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-emerald-500"
                >
                  <Image className="w-4 h-4" /> Photo/Video
                </button>
                <button
                  onClick={() => setIsComposerOpen(true)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-amber-500"
                >
                  <Smile className="w-4 h-4" /> Feeling
                </button>
              </div>
            </div>

            {/* Discovery & Recommendation Banners */}
            <RecommendationBanners />

            {/* Feed Stream */}
            <div className="space-y-4">
              {filteredPosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          </div>
        );

      case '*':
      default:
        return <NotFoundPage />;
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-[#F0F2F5] dark:bg-[#0F172A]">
      <Navbar />

      <div className="flex-1 flex justify-center w-full max-w-7xl mx-auto px-0 sm:px-4">
        <LeftSidebar />

        {/* CENTER MAIN CONTENT AREA */}
        <main className="flex-1 max-w-2xl w-full p-2 sm:p-4 min-w-0">
          {(user?.status === 'suspended' || user?.status === 'banned') && (
            <div className="mb-4 p-4 rounded-3xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 font-bold text-xs flex items-center gap-3">
              <span className="text-lg">⚠️</span>
              <div>
                <p className="font-extrabold uppercase">Account Status Notice: {user.status}</p>
                <p className="font-medium text-[11px] opacity-90">Your account has been restricted by platform moderators. Interactive features may be limited.</p>
              </div>
            </div>
          )}

          {renderMainRouteContent()}
        </main>

        <RightSidebar />
      </div>

      {/* Floating Messenger Dock */}
      <MessengerDock />

      {/* Mobile Bottom Bar */}
      <MobileBottomNav onOpenCreatePost={() => setIsComposerOpen(true)} />

      {/* Post Composer Modal */}
      <PostComposer isOpen={isComposerOpen} onClose={() => setIsComposerOpen(false)} />
    </div>
  );
};

const MainContent: React.FC = () => {
  const { user, isAuthenticated, isLoading, isOnboarding, isOnboardingCompleted, markOnboardingCompleted } = useAuth();
  const [routeMatch, setRouteMatch] = useState<RouteMatch>(() => router.matchCurrentRoute());

  // Startup 5-second Splash state: runs once per session launch
  const [showSplash, setShowSplash] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    if (window.location.pathname.startsWith('/admin')) return false;
    return !sessionStorage.getItem('connecta_startup_splash_done');
  });

  const [showOnboarding, setShowOnboarding] = useState<boolean>(false);

  useEffect(() => {
    return router.subscribe((match) => {
      setRouteMatch(match);
      if (match.pattern === '/onboarding') {
        setShowOnboarding(true);
      }
    });
  }, []);

  const handleSplashComplete = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('connecta_startup_splash_done', 'true');
    }
    setShowSplash(false);

    // If currently on an admin route, stay there
    if (routeMatch.pattern.startsWith('/admin')) return;

    // STATE A: Returning authenticated user → go straight to feed
    if (isAuthenticated) {
      if (['/', '/home', '/splash', '/login', '/register', '/onboarding', '/verify-email'].includes(routeMatch.pattern)) {
        router.navigate('/feed');
      }
      return;
    }

    // STATE B: Returning user (seen intro before) → show sign-in
    const introSeen =
      sessionStorage.getItem('connecta_intro_seen') === 'true' ||
      isOnboardingCompleted ||
      localStorage.getItem('connecta_onboarding_completed_device') === 'true';

    if (introSeen) {
      if (['/', '/home', '/splash', '/onboarding'].includes(routeMatch.pattern)) {
        router.navigate('/login');
      }
      return;
    }

    // STATE C: Brand-new device / first-time user → 3-screen intro
    setShowOnboarding(true);
    if (routeMatch.pattern !== '/onboarding') {
      router.navigate('/onboarding');
    }
  };

  // 1. Admin routes access (handled immediately so admins aren't forced through onboarding/splash)
  if (routeMatch.pattern.startsWith('/admin')) {
    if (routeMatch.pattern === '/admin/login' || !isAuthenticated) {
      return (
        <AdminProvider>
          <AdminLoginPage />
        </AdminProvider>
      );
    }

    return (
      <SocialProvider>
        <MessengerProvider>
          <AdminProvider>
            <SocialAppContent />
          </AdminProvider>
        </MessengerProvider>
      </SocialProvider>
    );
  }

  // 2. Initial Startup 5-Second Splash Screen
  if (showSplash) {
    return <SplashScreen durationSeconds={5} onComplete={handleSplashComplete} />;
  }

  // 3. Silent loading fallback (no text shown to user)
  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-black">
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-[#2563EB] to-[#8B5CF6] flex items-center justify-center shadow-lg shadow-[#2563EB]/30 animate-pulse">
          <span className="text-white font-black text-2xl tracking-tighter">KC</span>
        </div>
      </div>
    );
  }

  // 4. Three-Screen Onboarding INTRO for brand-new devices
  if (showOnboarding || routeMatch.pattern === '/onboarding') {
    return (
      <OnboardingScreens
        onComplete={() => {
          // Only mark the intro screens as seen — NOT the profile wizard.
          // The profile wizard (OnboardingWizard) is marked complete after registration.
          if (typeof sessionStorage !== 'undefined') {
            sessionStorage.setItem('connecta_intro_seen', 'true');
          }
          setShowOnboarding(false);
          // Send the user to Create Account, not Login
          router.navigate('/register');
        }}
      />
    );
  }

  // 5. Unauthenticated → show AuthScreen
  // Guard: if user landed on a protected route while unauthenticated, silently
  // rewrite the URL to /login so AuthScreen picks up the correct initial mode.
  if (!isAuthenticated) {
    const PROTECTED_PREFIXES = ['/feed', '/profile', '/friends', '/messages',
      '/notifications', '/search', '/groups', '/pages', '/events', '/marketplace',
      '/memories', '/saved', '/photos', '/albums', '/videos', '/watch', '/settings',
      '/following', '/stories'];
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      const isProtected = PROTECTED_PREFIXES.some((p) => path === p || path.startsWith(p + '/'));
      if (isProtected) {
        window.history.replaceState({}, '', '/login');
      }
    }
    return <AuthScreen />;
  }

  // 6. Post-registration wizard if any
  if (isOnboarding) return <OnboardingWizard />;

  // 7. Authenticated User -> Main Social Application
  return (
    <SocialProvider>
      <MessengerProvider>
        <AdminProvider>
          <SocialAppContent />
        </AdminProvider>
      </MessengerProvider>
    </SocialProvider>
  );
};

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MainContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
