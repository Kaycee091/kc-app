import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from '../ui/Avatar';
import { uploadFile } from '../../services/storageService';
import { Camera, User, Mail, Phone, FileText } from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const { user, updateProfile } = useAuth();

  const [fullName, setFullName] = useState(user?.full_name || '');
  const [username, setUsername] = useState(user?.username || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || '');
  const [isUploading, setIsUploading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const uploaded = await uploadFile(file);
      setAvatarUrl(uploaded.url);
    } catch (err: any) {
      alert(err.message || 'Avatar upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    const res = await updateProfile({
      full_name: fullName,
      username,
      bio,
      phone,
      avatar_url: avatarUrl,
    });

    if (res.success) {
      setSuccessMsg('Profile updated successfully!');
      setTimeout(() => {
        setSuccessMsg('');
        onClose();
      }, 1000);
    } else {
      setErrorMsg(res.error || 'Failed to update profile');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit User Profile" maxWidth="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {successMsg && (
          <div className="p-3 text-xs font-semibold rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200">
            {successMsg}
          </div>
        )}
        {errorMsg && (
          <div className="p-3 text-xs font-semibold rounded-xl bg-rose-50 text-rose-600 border border-rose-200">
            {errorMsg}
          </div>
        )}

        {/* Avatar Upload */}
        <div className="flex flex-col items-center gap-2 pb-2">
          <div className="relative group">
            <Avatar src={avatarUrl} name={fullName || 'User'} size="xl" />
            <label className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="w-6 h-6 text-white" />
              <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
            </label>
          </div>
          <p className="text-[11px] text-slate-400">Click avatar to upload new image</p>
        </div>

        <Input
          label="Full Name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          leftIcon={<User className="w-4 h-4" />}
          required
        />

        <Input
          label="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
            Bio / About
          </label>
          <textarea
            rows={2}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full text-xs font-medium p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-[#5B5FEF] focus:outline-none"
          />
        </div>

        <Input
          label="Phone Number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          leftIcon={<Phone className="w-4 h-4" />}
        />

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isUploading}>
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
};
