import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from '../ui/Avatar';
import { Users, Check } from 'lucide-react';

interface GroupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GroupModal: React.FC<GroupModalProps> = ({ isOpen, onClose }) => {
  const { allUsers, createGroupConversation } = useChat();
  const { user: currentUser } = useAuth();

  const [groupName, setGroupName] = useState('');
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [error, setError] = useState('');

  const eligibleUsers = allUsers.filter((u) => u.id !== currentUser?.id);

  const toggleMember = (id: string) => {
    setSelectedMemberIds((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!groupName.trim()) {
      setError('Please enter a group name');
      return;
    }
    if (selectedMemberIds.length === 0) {
      setError('Please select at least one member');
      return;
    }

    await createGroupConversation(groupName.trim(), selectedMemberIds);
    setGroupName('');
    setSelectedMemberIds([]);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Group Chat" maxWidth="md">
      <form onSubmit={handleCreateGroup} className="space-y-4">
        {error && (
          <div className="p-3 text-xs font-medium rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 text-rose-600">
            {error}
          </div>
        )}

        <Input
          label="Group Name"
          placeholder="e.g. Design Team, Family, Sprint 4"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          leftIcon={<Users className="w-4 h-4" />}
          required
        />

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
            Select Members ({selectedMemberIds.length})
          </label>
          <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1 border border-slate-200 dark:border-slate-700 rounded-2xl p-2 bg-slate-50 dark:bg-slate-800/40">
            {eligibleUsers.map((u) => {
              const isSelected = selectedMemberIds.includes(u.id);
              return (
                <div
                  key={u.id}
                  onClick={() => toggleMember(u.id)}
                  className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-[#5B5FEF]/10 dark:bg-[#5B5FEF]/20 border border-[#5B5FEF]/30'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Avatar src={u.avatar_url} name={u.full_name} size="sm" />
                    <div>
                      <h4 className="text-xs font-bold">{u.full_name}</h4>
                      <p className="text-[10px] text-slate-400">@{u.username}</p>
                    </div>
                  </div>

                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center border transition-colors ${
                      isSelected
                        ? 'bg-[#5B5FEF] border-[#5B5FEF] text-white'
                        : 'border-slate-300 dark:border-slate-600'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            Create Group
          </Button>
        </div>
      </form>
    </Modal>
  );
};
