import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSocial } from '../../context/SocialContext';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';
import { PostCard } from '../feed/PostCard';
import { MapPin, Briefcase, GraduationCap, Heart, Link, Calendar, Edit2, UserCheck, UserPlus } from 'lucide-react';
import { EditProfileModal } from './EditProfileModal';
import { UserProfile } from '../../types/social';

export const ProfileView: React.FC = () => {
  const { user: currentUser } = useAuth();
  const { viewingProfileUser, posts, friends, sendFriendRequest } = useSocial();
  const [profileTab, setProfileTab] = useState<'posts' | 'about' | 'friends' | 'photos'>('posts');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const profile: UserProfile = viewingProfileUser || currentUser || {
    id: 'user_alex',
    username: 'alex_j',
    first_name: 'Alex',
    last_name: 'Johnson',
    full_name: 'Alex Johnson',
    is_online: true,
  };

  const isOwnProfile = profile.id === currentUser?.id;
  const userPosts = posts.filter((p) => p.author_id === profile.id);

  return (
    <div className="space-y-4 max-w-4xl mx-auto pb-12 animate-fade-in">
      {/* Profile Header & Cover Photo */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl overflow-hidden shadow-sm border border-slate-200/80 dark:border-slate-700/80">
        <div className="h-48 sm:h-64 relative bg-gradient-to-r from-blue-600 to-purple-600">
          {profile.cover_url && (
            <img src={profile.cover_url} alt="Cover" className="w-full h-full object-cover" />
          )}
        </div>

        <div className="p-4 sm:p-6 relative pt-0">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-16 sm:-mt-20 mb-4">
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 text-center sm:text-left">
              <Avatar
                src={profile.avatar_url}
                name={profile.full_name}
                size="2xl"
                isVerified={profile.is_verified}
                className="border-4 border-white dark:border-slate-800 shadow-xl"
              />
              <div className="space-y-0.5">
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                  {profile.full_name}
                </h2>
                <p className="text-xs font-semibold text-slate-500">@{profile.username}</p>
                {profile.bio && <p className="text-xs text-slate-700 dark:text-slate-300 max-w-md pt-1">{profile.bio}</p>}
              </div>
            </div>

            <div className="flex justify-center gap-2">
              {isOwnProfile ? (
                <Button variant="outline" size="sm" onClick={() => setIsEditModalOpen(true)} leftIcon={<Edit2 className="w-4 h-4" />}>
                  Edit Profile
                </Button>
              ) : (
                <Button variant="primary" size="sm" onClick={() => sendFriendRequest(profile.id)} leftIcon={<UserPlus className="w-4 h-4" />}>
                  Add Friend
                </Button>
              )}
            </div>
          </div>

          {/* Profile Navigation Tabs */}
          <div className="flex items-center gap-2 border-t border-slate-100 dark:border-slate-700 pt-2 text-xs font-bold text-slate-600 dark:text-slate-300">
            <button
              onClick={() => setProfileTab('posts')}
              className={`px-4 py-2 rounded-xl transition-all ${profileTab === 'posts' ? 'bg-[#2563EB]/10 text-[#2563EB]' : 'hover:bg-slate-100 dark:hover:bg-slate-700'}`}
            >
              Posts ({userPosts.length})
            </button>
            <button
              onClick={() => setProfileTab('about')}
              className={`px-4 py-2 rounded-xl transition-all ${profileTab === 'about' ? 'bg-[#2563EB]/10 text-[#2563EB]' : 'hover:bg-slate-100 dark:hover:bg-slate-700'}`}
            >
              About
            </button>
            <button
              onClick={() => setProfileTab('friends')}
              className={`px-4 py-2 rounded-xl transition-all ${profileTab === 'friends' ? 'bg-[#2563EB]/10 text-[#2563EB]' : 'hover:bg-slate-100 dark:hover:bg-slate-700'}`}
            >
              Friends ({friends.length})
            </button>
          </div>
        </div>
      </div>

      {/* Posts Tab */}
      {profileTab === 'posts' && (
        <div className="space-y-4">
          {userPosts.length === 0 ? (
            <p className="text-xs text-center text-slate-400 py-8">No posts published yet</p>
          ) : (
            userPosts.map((post) => <PostCard key={post.id} post={post} />)
          )}
        </div>
      )}

      {/* About Tab */}
      {profileTab === 'about' && (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 space-y-4 text-xs font-medium">
          <h3 className="font-bold text-base text-slate-900 dark:text-white border-b pb-2">Overview</h3>
          {profile.work && (
            <div className="flex items-center gap-3">
              <Briefcase className="w-5 h-5 text-slate-400" />
              <span>Works at <strong>{profile.work}</strong></span>
            </div>
          )}
          {profile.education && (
            <div className="flex items-center gap-3">
              <GraduationCap className="w-5 h-5 text-slate-400" />
              <span>Studied at <strong>{profile.education}</strong></span>
            </div>
          )}
          {profile.location && (
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-slate-400" />
              <span>Lives in <strong>{profile.location}</strong></span>
            </div>
          )}
          {profile.relationship_status && (
            <div className="flex items-center gap-3">
              <Heart className="w-5 h-5 text-rose-500" />
              <span>Relationship: <strong>{profile.relationship_status}</strong></span>
            </div>
          )}
        </div>
      )}

      {/* Friends Tab */}
      {profileTab === 'friends' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {friends.map((f) => (
            <div key={f.id} className="p-3 bg-white dark:bg-slate-800 rounded-2xl border flex items-center gap-3">
              <Avatar src={f.avatar_url} name={f.full_name} size="md" />
              <div className="min-w-0">
                <h4 className="text-xs font-bold truncate">{f.full_name}</h4>
                <p className="text-[10px] text-slate-400">@{f.username}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <EditProfileModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} />
    </div>
  );
};
