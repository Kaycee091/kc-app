import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSocial } from '../../context/SocialContext';
import { Avatar } from '../ui/Avatar';
import { UserPlus, UserCheck, Check, Users, Sparkles, X, Plus, Compass } from 'lucide-react';
import { DEMO_USERS } from '../../services/mockSocialData';
import { router } from '../../router';

export const RecommendationBanners: React.FC = () => {
  const { user } = useAuth();
  const { friends, followingIds, sendFriendRequest, toggleFollow, groups, toggleJoinGroup } = useSocial();

  const [dismissedUserIds, setDismissedUserIds] = useState<string[]>([]);
  const [requestedUserIds, setRequestedUserIds] = useState<string[]>([]);
  const [isPeopleBannerDismissed, setIsPeopleBannerDismissed] = useState(false);
  const [isGroupsBannerDismissed, setIsGroupsBannerDismissed] = useState(false);

  // Filter recommendations: platform users who are not current user, not existing friends, not dismissed
  const recommendedUsers = DEMO_USERS.filter(
    (u) =>
      u.id !== user?.id &&
      !friends.some((f) => f.id === u.id) &&
      !dismissedUserIds.includes(u.id)
  ).slice(0, 8);

  // Recommended groups: groups not yet joined by the current user
  const recommendedGroups = groups
    .filter((g) => !g.is_joined)
    .slice(0, 6);

  const handleAddFriend = (targetUserId: string) => {
    sendFriendRequest(targetUserId);
    setRequestedUserIds((prev) => [...prev, targetUserId]);
  };

  const handleDismissUser = (targetUserId: string) => {
    setDismissedUserIds((prev) => [...prev, targetUserId]);
  };

  return (
    <div className="space-y-4 mb-4">
      {/* ================================================================= */}
      {/* BANNER 1: PEOPLE YOU MAY KNOW                                     */}
      {/* ================================================================= */}
      {!isPeopleBannerDismissed && recommendedUsers.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-4 sm:p-5 shadow-sm border border-slate-200/80 dark:border-slate-700/80 space-y-3 animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-xl bg-blue-500/10 text-[#2563EB]">
                <UserPlus className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white tracking-tight">
                  People You May Know
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Connect with creators, professionals, and friends on Connecta
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsPeopleBannerDismissed(true)}
              className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              title="Dismiss suggestions"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Horizontal scrollable cards */}
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none snap-x">
            {recommendedUsers.map((recUser) => {
              const isRequested = requestedUserIds.includes(recUser.id);
              const isFollowing = followingIds.includes(recUser.id);

              return (
                <div
                  key={recUser.id}
                  className="w-44 flex-shrink-0 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200/70 dark:border-slate-700/70 p-3.5 flex flex-col items-center text-center justify-between space-y-2.5 relative snap-start group"
                >
                  {/* Dismiss card */}
                  <button
                    type="button"
                    onClick={() => handleDismissUser(recUser.id)}
                    className="absolute top-2 right-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                    title="Not interested"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>

                  <div
                    onClick={() => router.navigate(`/profile/${recUser.username}`)}
                    className="cursor-pointer space-y-1.5 flex flex-col items-center"
                  >
                    <Avatar
                      src={recUser.avatar_url}
                      name={recUser.full_name}
                      size="lg"
                      isVerified={recUser.is_verified}
                    />
                    <div className="min-w-0 px-1">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[130px]">
                        {recUser.full_name}
                      </h4>
                      <p className="text-[10px] text-slate-500 truncate max-w-[130px]">
                        @{recUser.username}
                      </p>
                    </div>
                  </div>

                  <span className="text-[9px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-full">
                    {recUser.location || 'Suggested for you'}
                  </span>

                  {/* Action Buttons */}
                  <div className="w-full space-y-1.5 pt-1">
                    <button
                      type="button"
                      disabled={isRequested}
                      onClick={() => handleAddFriend(recUser.id)}
                      className={`w-full py-1.5 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 shadow-sm ${
                        isRequested
                          ? 'bg-emerald-500/15 text-emerald-600 border border-emerald-500/30'
                          : 'bg-[#2563EB] hover:bg-blue-600 text-white'
                      }`}
                    >
                      {isRequested ? (
                        <>
                          <Check className="w-3.5 h-3.5" /> Requested
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-3.5 h-3.5" /> Add Friend
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => toggleFollow(recUser.id)}
                      className={`w-full py-1 px-2 rounded-xl text-[11px] font-semibold transition-colors ${
                        isFollowing
                          ? 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800'
                      }`}
                    >
                      {isFollowing ? 'Following' : 'Follow'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* BANNER 2: GROUPS YOU MAY LIKE                                     */}
      {/* ================================================================= */}
      {!isGroupsBannerDismissed && recommendedGroups.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-4 sm:p-5 shadow-sm border border-slate-200/80 dark:border-slate-700/80 space-y-3 animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-xl bg-purple-500/10 text-purple-600">
                <Compass className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white tracking-tight">
                  Groups You May Like
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Join communities around your passions, hobbies, and topics
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsGroupsBannerDismissed(true)}
              className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              title="Dismiss groups"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Group Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {recommendedGroups.map((grp) => (
              <div
                key={grp.id}
                className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-700/70 hover:border-purple-500/30 transition-all"
              >
                <div
                  onClick={() => router.navigate(`/groups/${grp.id}`)}
                  className="flex items-center gap-3 cursor-pointer min-w-0"
                >
                  <div className="w-11 h-11 rounded-2xl bg-cover bg-center flex-shrink-0 border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm"
                    style={{ backgroundImage: `url(${grp.cover_url})` }}
                  />
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {grp.name}
                    </h4>
                    <p className="text-[10px] text-slate-500 truncate">
                      {grp.members_count} members • {grp.category || 'Community'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => toggleJoinGroup(grp.id)}
                  className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md shadow-purple-600/20 transition-all flex items-center gap-1 ml-2 flex-shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" /> Join
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RecommendationBanners;
