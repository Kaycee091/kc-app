import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useAuth } from '../../context/AuthContext';
import { uploadFile } from '../../services/storageService';
import { Camera } from 'lucide-react';
import { Avatar } from '../ui/Avatar';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, onClose }) => {
  const { user, updateProfile } = useAuth();
  const [firstName, setFirstName] = useState(user?.first_name || '');
  const [lastName, setLastName] = useState(user?.last_name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [work, setWork] = useState(user?.work || '');
  const [location, setLocation] = useState(user?.location || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || '');
  const [coverUrl, setCoverUrl] = useState(user?.cover_url || '');
  const [isUploading, setIsUploading] = useState(false);

  const handleAvatarSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const res = await uploadFile(file);
      setAvatarUrl(res.url);
    } catch (e) {}
    setIsUploading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile({
      first_name: firstName,
      last_name: lastName,
      full_name: `${firstName} ${lastName}`,
      bio,
      work,
      location,
      avatar_url: avatarUrl,
      cover_url: coverUrl,
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Profile Details" maxWidth="md">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex flex-col items-center">
          <Avatar src={avatarUrl} name={user?.full_name || 'User'} size="xl" />
          <label className="text-xs text-[#2563EB] font-bold cursor-pointer mt-1">
            Change Photo
            <input type="file" accept="image/*" onChange={handleAvatarSelect} className="hidden" />
          </label>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Input label="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
          <Input label="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
        </div>

        <Input label="Bio" value={bio} onChange={(e) => setBio(e.target.value)} />
        <Input label="Work / Occupation" value={work} onChange={(e) => setWork(e.target.value)} />
        <Input label="Location" value={location} onChange={(e) => setLocation(e.target.value)} />

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
