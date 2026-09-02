import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from '../ui/Avatar';
import { Search, UserPlus } from 'lucide-react';

interface NewChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewChatModal: React.FC<NewChatModalProps> = ({ isOpen, onClose }) => {
  const { allUsers, createDirectConversation, onlineUsers } = useChat();
  const { user: currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredUsers = allUsers.filter(
    (u) =>
      u.id !== currentUser?.id &&
      (u.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.username.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSelectUser = async (targetUserId: string) => {
    await createDirectConversation(targetUserId);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="New Conversation" maxWidth="md">
      <div className="space-y-4">
        {/* Search user input */}
        <div className="relative flex items-center">
          <Search className="w-4 h-4 absolute left-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search users by name or @username..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-[#5B5FEF] focus:outline-none"
            autoFocus
          />
        </div>

        {/* User list */}
        <div className="max-h-64 overflow-y-auto space-y-1.5 pr-1">
          {filteredUsers.length === 0 ? (
            <p className="text-xs text-center text-slate-400 py-6">No users found</p>
          ) : (
            filteredUsers.map((u) => {
              const isOnline = onlineUsers.get(u.id) ?? u.is_online;
              return (
                <div
                  key={u.id}
                  onClick={() => handleSelectUser(u.id)}
                  className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800/80 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Avatar
                      src={u.avatar_url}
                      name={u.full_name}
                      size="md"
                      isOnline={isOnline}
                      showOnlineStatus
                    />
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                        {u.full_name}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        @{u.username}
                      </p>
                    </div>
                  </div>

                  <UserPlus className="w-4 h-4 text-[#5B5FEF]" />
                </div>
              );
            })
          )}
        </div>
      </div>
    </Modal>
  );
};
