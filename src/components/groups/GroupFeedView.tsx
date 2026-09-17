import React, { useState } from 'react';
import { useSocial } from '../../context/SocialContext';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Users, Plus, Check } from 'lucide-react';

export const GroupFeedView: React.FC = () => {
  const { groups, toggleJoinGroup, createGroup } = useSocial();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [privacy, setPrivacy] = useState<'public' | 'private'>('public');
  const [activeTab, setActiveTab] = useState<'discover' | 'my-groups'>('discover');

  const joinedGroups = groups.filter((g) => g.is_joined);
  const displayGroups = activeTab === 'my-groups' ? joinedGroups : groups;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    createGroup(name.trim(), description.trim(), privacy);
    setName('');
    setDescription('');
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto pb-12 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white">Groups & Communities</h2>
          <p className="text-xs text-slate-500">Discover and collaborate with people who share your interests.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold">
            <button
              onClick={() => setActiveTab('discover')}
              className={`px-3 py-1.5 rounded-lg transition-all ${activeTab === 'discover' ? 'bg-white dark:bg-slate-700 text-[#2563EB] shadow' : 'text-slate-500'}`}
            >
              Discover ({groups.length})
            </button>
            <button
              onClick={() => setActiveTab('my-groups')}
              className={`px-3 py-1.5 rounded-lg transition-all ${activeTab === 'my-groups' ? 'bg-white dark:bg-slate-700 text-[#2563EB] shadow' : 'text-slate-500'}`}
            >
              My Groups ({joinedGroups.length})
            </button>
          </div>
          <Button variant="primary" size="sm" onClick={() => setIsModalOpen(true)} leftIcon={<Plus className="w-4 h-4" />}>
            Create
          </Button>
        </div>
      </div>

      {activeTab === 'my-groups' && joinedGroups.length === 0 ? (
        <div className="text-center py-16 px-4 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 space-y-3 shadow-sm">
          <div className="w-14 h-14 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500 mx-auto flex items-center justify-center">
            <Users className="w-7 h-7" />
          </div>
          <h4 className="text-base font-bold text-slate-800 dark:text-slate-200">You haven't joined any groups yet</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            Discover communities and collaborate with people who share your passion, work, or hobbies!
          </p>
          <Button size="sm" variant="primary" onClick={() => setActiveTab('discover')}>
            Explore Groups You May Like
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {displayGroups.map((g) => (
            <div key={g.id} className="bg-white dark:bg-slate-800 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
              <img src={g.cover_url} alt={g.name} className="w-full h-32 object-cover" />
              <div className="p-4 pt-0 space-y-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">{g.name}</h3>
                <p className="text-xs text-slate-500 line-clamp-2">{g.description}</p>
                <div className="flex items-center justify-between pt-2">
                  <span className="text-[11px] font-bold text-slate-400">{g.members_count} members</span>
                  <Button
                    size="sm"
                    variant={g.is_joined ? 'secondary' : 'primary'}
                    onClick={() => toggleJoinGroup(g.id)}
                  >
                    {g.is_joined ? 'Joined' : 'Join Group'}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Group">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input label="Group Name" placeholder="e.g. KC Photographers" value={name} onChange={(e) => setName(e.target.value)} required />
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Create
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
