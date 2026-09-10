import React, { useState } from 'react';
import { useSocial } from '../../context/SocialContext';
import { useAuth } from '../../context/AuthContext';
import { PostCard } from '../feed/PostCard';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';
import { Search, Users, FileText, Store, Tv, Shield, ChevronRight, UserPlus, Check } from 'lucide-react';
import { clsx } from 'clsx';
import { router } from '../../router';

export const SearchPage: React.FC = () => {
  const { user } = useAuth();
  const {
    globalSearchQuery,
    setGlobalSearchQuery,
    posts,
    marketplaceListings,
    groups,
    pages,
    friends,
    followingIds,
    toggleFollow,
    sendFriendRequest,
    toggleJoinGroup,
    toggleFollowPage,
  } = useSocial();

  const [activeTab, setActiveTab] = useState<'all' | 'people' | 'posts' | 'groups' | 'pages' | 'events' | 'marketplace'>('all');

  const query = globalSearchQuery.trim().toLowerCase();

  const events = useSocial().events || [];
  const filteredEvents = events.filter(
    (e) => e.title.toLowerCase().includes(query) || e.location.toLowerCase().includes(query)
  );

  // Filtered dataset
  const filteredPosts = posts.filter(
    (p) => p.content.toLowerCase().includes(query) || (p.author?.full_name && p.author.full_name.toLowerCase().includes(query))
  );

  const filteredMarketplace = marketplaceListings.filter(
    (m) => m.title.toLowerCase().includes(query) || m.category.toLowerCase().includes(query)
  );

  const filteredGroups = groups.filter(
    (g) => g.name.toLowerCase().includes(query) || g.description?.toLowerCase().includes(query)
  );

  const filteredPages = pages.filter(
    (p) => p.name.toLowerCase().includes(query) || p.category?.toLowerCase().includes(query)
  );

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12 animate-fade-in">
      {/* Search Header */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-200/80 dark:border-slate-700/80 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#2563EB]/10 text-[#2563EB] flex items-center justify-center">
            <Search className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 dark:text-white">Connecta Search</h1>
            <p className="text-xs text-slate-500">Explore people, posts, communities, pages, and products.</p>
          </div>
        </div>

        {/* Input */}
        <div className="relative">
          <Search className="w-5 h-5 absolute left-4 top-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search Connecta..."
            value={globalSearchQuery}
            onChange={(e) => setGlobalSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 text-sm font-semibold rounded-2xl bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
          />
        </div>

        {/* Filter Sub-Tabs */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100 dark:border-slate-700">
          {(['all', 'people', 'posts', 'groups', 'pages', 'events', 'marketplace'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={clsx(
                'px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all',
                activeTab === tab
                  ? 'bg-[#2563EB] text-white shadow-md shadow-[#2563EB]/25'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Results Feed */}
      {!query && (
        <div className="p-8 text-center bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/80 dark:border-slate-700">
          <Search className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700 dark:text-slate-200">Start Searching Connecta</h3>
          <p className="text-xs text-slate-400 mt-1">Type keywords above to discover posts, friends, groups, and products.</p>
        </div>
      )}

      {query && (
        <div className="space-y-6">
          {/* Posts Section */}
          {(activeTab === 'all' || activeTab === 'posts') && filteredPosts.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-500 px-1">Matching Posts ({filteredPosts.length})</h3>
              {filteredPosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}

          {/* Events Section */}
          {(activeTab === 'all' || activeTab === 'events') && filteredEvents.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-500 px-1">Matching Events ({filteredEvents.length})</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredEvents.map((e) => (
                  <div
                    key={e.id}
                    onClick={() => router.navigate(`/events/${e.id}`)}
                    className="bg-white dark:bg-slate-800 rounded-3xl p-4 border border-slate-200 dark:border-slate-700 space-y-2 cursor-pointer hover:shadow-md transition-shadow"
                  >
                    <div className="h-28 rounded-2xl bg-cover bg-center" style={{ backgroundImage: `url(${e.cover_url})` }} />
                    <h4 className="font-extrabold text-sm text-slate-900 dark:text-white truncate">{e.title}</h4>
                    <p className="text-xs text-slate-500">{e.location}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Groups Section */}
          {(activeTab === 'all' || activeTab === 'groups') && filteredGroups.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-500 px-1">Communities & Groups</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredGroups.map((g) => (
                  <div
                    key={g.id}
                    onClick={() => router.navigate(`/groups/${g.id}`)}
                    className="bg-white dark:bg-slate-800 rounded-3xl p-4 border border-slate-200 dark:border-slate-700 space-y-3 flex flex-col justify-between cursor-pointer hover:shadow-md transition-shadow"
                  >
                    <div>
                      <div className="h-24 rounded-2xl bg-cover bg-center mb-3" style={{ backgroundImage: `url(${g.cover_url})` }} />
                      <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">{g.name}</h4>
                      <p className="text-xs text-slate-500 line-clamp-2 mt-1">{g.description}</p>
                    </div>
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-[11px] font-bold text-slate-400">{g.members_count} Members</span>
                      <Button size="sm" variant={g.is_joined ? 'outline' : 'primary'} onClick={(e) => { e.stopPropagation(); toggleJoinGroup(g.id); }}>
                        {g.is_joined ? 'Joined' : 'Join Group'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Marketplace Section */}
          {(activeTab === 'all' || activeTab === 'marketplace') && filteredMarketplace.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-500 px-1">Marketplace Listings</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {filteredMarketplace.map((m) => (
                  <div
                    key={m.id}
                    onClick={() => router.navigate(`/marketplace/${m.id}`)}
                    className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 cursor-pointer hover:shadow-md transition-shadow"
                  >
                    <img src={m.image_url} alt={m.title} className="w-full h-36 object-cover" />
                    <div className="p-3">
                      <p className="font-black text-sm text-emerald-600">${m.price}</p>
                      <h5 className="font-bold text-xs text-slate-900 dark:text-white truncate">{m.title}</h5>
                      <p className="text-[10px] text-slate-400 truncate">{m.location}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
