import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Users, Globe, Calendar, Store, Shield, Trash2, CheckCircle2, Search, AlertCircle } from 'lucide-react';
import { AdminConfirmModal } from './AdminConfirmModal';

export const AdminGroupsPages: React.FC = () => {
  const {
    groupsList,
    pagesList,
    eventsList,
    marketplaceList,
    toggleGroupStatus,
    deleteGroup,
    togglePageStatus,
    deletePage,
    toggleEventStatus,
    deleteEvent,
    toggleMarketplaceStatus,
    deleteMarketplaceListing,
    activeAdminRoute,
  } = useAdmin();

  // Determine initial tab based on route if applicable
  const initialTab =
    activeAdminRoute === 'pages'
      ? 'pages'
      : activeAdminRoute === 'events'
      ? 'events'
      : activeAdminRoute === 'marketplace'
      ? 'marketplace'
      : 'groups';

  const [activeTab, setActiveTab] = useState<'groups' | 'pages' | 'events' | 'marketplace'>(initialTab);
  const [search, setSearch] = useState('');

  const [confirmModalState, setConfirmModalState] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    action: () => void;
  }>({
    isOpen: false,
    title: '',
    description: '',
    action: () => {},
  });

  const filteredGroups = groupsList.filter((g) => g.name.toLowerCase().includes(search.toLowerCase()) || g.description?.toLowerCase().includes(search.toLowerCase()));
  const filteredPages = pagesList.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()) || p.category?.toLowerCase().includes(search.toLowerCase()));
  const filteredEvents = eventsList.filter((e) => e.title.toLowerCase().includes(search.toLowerCase()) || e.location?.toLowerCase().includes(search.toLowerCase()));
  const filteredMarketplace = marketplaceList.filter((m) => m.title.toLowerCase().includes(search.toLowerCase()) || m.category?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white">Community & Marketplace Administration</h2>
          <p className="text-xs text-slate-500">Monitor active communities, verify creator pages, manage events, and moderate marketplace items.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="w-full sm:w-48">
            <Input
              placeholder="Search items..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<Search className="w-3.5 h-3.5 text-slate-400" />}
            />
          </div>

          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl text-xs font-bold">
            {(['groups', 'pages', 'events', 'marketplace'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-xl capitalize transition-all ${
                  activeTab === tab ? 'bg-white dark:bg-slate-700 text-[#2563EB] shadow-sm' : 'text-slate-500'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab 1: Groups */}
      {activeTab === 'groups' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredGroups.length === 0 ? (
            <div className="col-span-2 text-center py-12 bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700">
              <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-500">No Groups Found</p>
            </div>
          ) : (
            filteredGroups.map((g) => (
              <div key={g.id} className="p-5 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-500">
                      <Users className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">{g.name}</h4>
                      <p className="text-[10px] text-slate-400">Owner ID: {g.owner_id || 'System'}</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-[10px] font-bold uppercase text-slate-600 dark:text-slate-300">
                    {g.privacy}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{g.description}</p>
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700 text-xs">
                  <span className="text-[11px] font-semibold text-slate-400">{g.members_count || 0} Members</span>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" onClick={() => toggleGroupStatus(g.id)}>
                      Toggle Privacy
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() =>
                        setConfirmModalState({
                          isOpen: true,
                          title: `Delete Group: ${g.name}`,
                          description: 'Are you sure you want to permanently delete this group?',
                          action: () => deleteGroup(g.id),
                        })
                      }
                      leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 2: Pages */}
      {activeTab === 'pages' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredPages.length === 0 ? (
            <div className="col-span-2 text-center py-12 bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700">
              <Globe className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-500">No Creator Pages Found</p>
            </div>
          ) : (
            filteredPages.map((p) => (
              <div key={p.id} className="p-5 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-[#2563EB]">
                      <Globe className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        {p.name} {p.is_verified && <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />}
                      </h4>
                      <p className="text-[10px] text-slate-400">{p.category || 'General'}</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-[#2563EB] text-[10px] font-bold">
                    {p.followers_count || 0} Followers
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{p.description}</p>
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-700 text-xs">
                  <Button size="sm" variant="outline" onClick={() => togglePageStatus(p.id)}>
                    {p.is_verified ? 'Unverify Page' : 'Verify Page'}
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() =>
                      setConfirmModalState({
                        isOpen: true,
                        title: `Delete Page: ${p.name}`,
                        description: 'Are you sure you want to delete this creator page?',
                        action: () => deletePage(p.id),
                      })
                    }
                    leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 3: Events */}
      {activeTab === 'events' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredEvents.length === 0 ? (
            <div className="col-span-2 text-center py-12 bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700">
              <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-500">No Events Found</p>
            </div>
          ) : (
            filteredEvents.map((e) => (
              <div key={e.id} className="p-5 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-500">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">{e.title}</h4>
                      <p className="text-[10px] text-slate-400">{e.start_time} · {e.location}</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/60 text-purple-600 text-[10px] font-bold">
                    {e.going_count || 0} Attending
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{e.description}</p>
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-700 text-xs">
                  <Button size="sm" variant="outline" onClick={() => toggleEventStatus(e.id)}>
                    Toggle Mode ({e.is_online ? 'Online' : 'In-Person'})
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() =>
                      setConfirmModalState({
                        isOpen: true,
                        title: `Delete Event: ${e.title}`,
                        description: 'Are you sure you want to remove this event listing?',
                        action: () => deleteEvent(e.id),
                      })
                    }
                    leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 4: Marketplace */}
      {activeTab === 'marketplace' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredMarketplace.length === 0 ? (
            <div className="col-span-2 text-center py-12 bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700">
              <Store className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-500">No Marketplace Listings Found</p>
            </div>
          ) : (
            filteredMarketplace.map((m) => (
              <div key={m.id} className="p-5 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {m.images && m.images[0] && (
                      <img src={m.images[0]} alt={m.title} className="w-14 h-14 object-cover rounded-2xl border border-slate-200 dark:border-slate-700 flex-shrink-0" />
                    )}
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">{m.title}</h4>
                      <p className="text-sm font-black text-emerald-600">${m.price}</p>
                      <p className="text-[10px] text-slate-400">{m.category} · Seller ID: {m.seller_id}</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold uppercase">
                    {m.status || 'active'}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-2">{m.description}</p>
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-700 text-xs">
                  <Button size="sm" variant="outline" onClick={() => toggleMarketplaceStatus(m.id)}>
                    Toggle Status ({m.status === 'sold' ? 'Available' : 'Sold'})
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() =>
                      setConfirmModalState({
                        isOpen: true,
                        title: `Delete Listing: ${m.title}`,
                        description: 'Are you sure you want to delete this marketplace item?',
                        action: () => deleteMarketplaceListing(m.id),
                      })
                    }
                    leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      <AdminConfirmModal
        isOpen={confirmModalState.isOpen}
        onClose={() => setConfirmModalState((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModalState.action}
        title={confirmModalState.title}
        description={confirmModalState.description}
      />
    </div>
  );
};
