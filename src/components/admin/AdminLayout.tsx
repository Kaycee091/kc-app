import React from 'react';
import { useAdmin } from '../../context/AdminContext';
import { AdminGuard } from './AdminGuard';
import { AdminSidebar } from './AdminSidebar';
import { AdminNavbar } from './AdminNavbar';
import { AdminDashboard } from './AdminDashboard';
import { AdminUsers } from './AdminUsers';
import { AdminPosts } from './AdminPosts';
import { AdminReports } from './AdminReports';
import { AdminModerationQueue } from './AdminModerationQueue';
import { AdminGroupsPages } from './AdminGroupsPages';
import { AdminMessages } from './AdminMessages';
import { AdminNotifications } from './AdminNotifications';
import { AdminAnalytics } from './AdminAnalytics';
import { AdminLogs } from './AdminLogs';
import { AdminSettings } from './AdminSettings';

interface AdminLayoutProps {
  onSwitchToApp: () => void;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ onSwitchToApp }) => {
  const { activeAdminRoute } = useAdmin();

  const renderRouteContent = () => {
    switch (activeAdminRoute) {
      case 'dashboard':
        return <AdminDashboard />;
      case 'users':
        return <AdminUsers />;
      case 'posts':
      case 'comments':
        return <AdminPosts />;
      case 'reports':
        return <AdminReports />;
      case 'moderation':
        return <AdminModerationQueue />;
      case 'groups':
      case 'pages':
        return <AdminGroupsPages />;
      case 'messages':
        return <AdminMessages />;
      case 'notifications':
        return <AdminNotifications />;
      case 'analytics':
        return <AdminAnalytics />;
      case 'logs':
        return <AdminLogs />;
      case 'settings':
        return <AdminSettings />;
      default:
        return <AdminDashboard />;
    }
  };

  return (
    <AdminGuard onRedirectUser={onSwitchToApp}>
      <div className="min-h-screen w-full flex bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white">
        
        {/* Left SaaS Sidebar */}
        <AdminSidebar />

        {/* Main Admin Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <AdminNavbar onSwitchToApp={onSwitchToApp} />

          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto overflow-y-auto">
            {renderRouteContent()}
          </main>
        </div>

      </div>
    </AdminGuard>
  );
};
