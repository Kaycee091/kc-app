import React, { useState } from 'react';
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
import { Avatar } from './components/ui/Avatar';
import { Plus, Image, Smile, Video } from 'lucide-react';
import { Skeleton } from './components/ui/Skeleton';

const SocialAppContent: React.FC = () => {
  const { user } = useAuth();
  const { activeTab, setActiveTab, posts, globalSearchQuery } = useSocial();
  const [isComposerOpen, setIsComposerOpen] = useState(false);

  // If user selected 'admin' tab in sidebar/menu, open full Admin Portal Layout!
  if (activeTab === 'admin') {
    return <AdminLayout onSwitchToApp={() => setActiveTab('feed')} />;
  }

  // Filter posts if global search query active
  const filteredPosts = globalSearchQuery.trim()
    ? posts.filter((p) => p.content.toLowerCase().includes(globalSearchQuery.toLowerCase()))
    : posts;

  return (
    <div className="min-h-screen w-full flex flex-col bg-[#F0F2F5] dark:bg-[#0F172A]">
      <Navbar />

      <div className="flex-1 flex justify-center w-full max-w-7xl mx-auto px-0 sm:px-4">
        <LeftSidebar />

        {/* CENTER MAIN FEED & ACTIVE TAB CONTENT */}
        <main className="flex-1 max-w-2xl w-full p-2 sm:p-4 min-w-0">

          {/* 1. HOME FEED TAB */}
          {activeTab === 'feed' && (
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

              {/* Feed Stream */}
              <div className="space-y-4">
                {filteredPosts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            </div>
          )}

          {/* OTHER TABS */}
          {activeTab === 'friends' && <FriendsView />}
          {activeTab === 'groups' && <GroupFeedView />}
          {activeTab === 'marketplace' && <MarketplaceView />}
          {activeTab === 'events' && <EventsView />}
          {activeTab === 'memories' && <MemoriesView />}
          {activeTab === 'saved' && <SavedItemsView />}
          {activeTab === 'profile' && <ProfileView />}
          {activeTab === 'messages' && <FullMessengerView />}

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
  const { isAuthenticated, isLoading, isOnboarding } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#F0F2F5] dark:bg-[#0F172A] p-4 space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-[#2563EB] to-[#8B5CF6] flex items-center justify-center shadow-lg shadow-[#2563EB]/30 animate-pulse">
          <span className="text-white font-black text-2xl tracking-tighter">KC</span>
        </div>
        <Skeleton className="w-32 h-4" />
      </div>
    );
  }

  if (!isAuthenticated) return <AuthScreen />;
  if (isOnboarding) return <OnboardingWizard />;

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
