import React from 'react';
import { useSocial, ActiveTab } from '../../context/SocialContext';
import { useAuth } from '../../context/AuthContext';
import { Home, Users, PlusCircle, Bell, Menu } from 'lucide-react';
import { clsx } from 'clsx';

interface MobileBottomNavProps {
  onOpenCreatePost: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ onOpenCreatePost }) => {
  const { activeTab, setActiveTab, unreadNotifCount, setViewingProfileUser } = useSocial();
  const { user } = useAuth();

  const handleTab = (tab: ActiveTab) => {
    if (tab === 'profile' && user) {
      setViewingProfileUser(user);
    }
    setActiveTab(tab);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 h-14 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 flex items-center justify-around md:hidden">
      <button
        onClick={() => handleTab('feed')}
        className={clsx('flex flex-col items-center gap-0.5 text-[10px] font-bold', activeTab === 'feed' ? 'text-[#2563EB]' : 'text-slate-500')}
      >
        <Home className="w-5 h-5" />
        <span>Home</span>
      </button>

      <button
        onClick={() => handleTab('friends')}
        className={clsx('flex flex-col items-center gap-0.5 text-[10px] font-bold', activeTab === 'friends' ? 'text-[#2563EB]' : 'text-slate-500')}
      >
        <Users className="w-5 h-5" />
        <span>Friends</span>
      </button>

      <button
        onClick={onOpenCreatePost}
        className="flex flex-col items-center justify-center -mt-5"
      >
        <div className="w-12 h-12 rounded-full bg-[#2563EB] text-white flex items-center justify-center shadow-lg shadow-[#2563EB]/40 active:scale-95 transition-transform">
          <PlusCircle className="w-7 h-7" />
        </div>
      </button>

      <button
        onClick={() => handleTab('feed')}
        className={clsx('relative flex flex-col items-center gap-0.5 text-[10px] font-bold text-slate-500')}
      >
        <Bell className="w-5 h-5" />
        <span>Alerts</span>
        {unreadNotifCount > 0 && (
          <span className="absolute top-0 right-2 w-2 h-2 rounded-full bg-[#2563EB]" />
        )}
      </button>

      <button
        onClick={() => handleTab('profile')}
        className={clsx('flex flex-col items-center gap-0.5 text-[10px] font-bold', activeTab === 'profile' ? 'text-[#2563EB]' : 'text-slate-500')}
      >
        <Menu className="w-5 h-5" />
        <span>Menu</span>
      </button>
    </nav>
  );
};
