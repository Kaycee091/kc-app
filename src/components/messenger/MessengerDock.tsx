import React from 'react';
import { useMessenger } from '../../context/MessengerContext';
import { FloatingChatWindow } from './FloatingChatWindow';

export const MessengerDock: React.FC = () => {
  const { dockedChats, closeDockedChat } = useMessenger();

  if (dockedChats.length === 0) return null;

  return (
    <div className="fixed bottom-0 right-4 z-50 flex items-end gap-3 pointer-events-none">
      {dockedChats.map((contact) => (
        <div key={contact.id} className="pointer-events-auto">
          <FloatingChatWindow contact={contact} onClose={() => closeDockedChat(contact.id)} />
        </div>
      ))}
    </div>
  );
};
