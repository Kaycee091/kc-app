import React, { useState, useRef } from 'react';
import { Paperclip, Smile, Mic, Send, X, Image as ImageIcon, FileText, Loader2, Square } from 'lucide-react';
import { uploadFile } from '../../services/storageService';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Message } from '../../types';

const EMOJI_LIST = [
  '😊', '😂', '❤️', '👍', '🔥', '😍', '🎉', '🙌', 
  '😎', '🤔', '😢', '😮', '👏', '✨', '🚀', '💯', 
  '🙏', '💪', '🤝', '⚡', '🥳', '🤩', '💡', '📌'
];

interface MessageComposerProps {
  onSendMessage: (
    content: string,
    type?: 'text' | 'image' | 'file' | 'voice',
    fileData?: { url: string; name: string; size: number },
    replyToId?: string
  ) => Promise<void>;
  onTyping: () => void;
  replyingTo: Message | null;
  onClearReply: () => void;
}

export const MessageComposer: React.FC<MessageComposerProps> = ({
  onSendMessage,
  onTyping,
  replyingTo,
  onClearReply,
}) => {
  const [text, setText] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  
  // Image Preview Modal state
  const [pendingImage, setPendingImage] = useState<{ url: string; name: string; size: number } | null>(null);
  const [imageCaption, setImageCaption] = useState('');

  // Audio Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    onTyping();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = async () => {
    if ((!text.trim() && !pendingImage) || isUploading) return;

    if (pendingImage) {
      await onSendMessage(imageCaption || text, 'image', pendingImage, replyingTo?.id);
      setPendingImage(null);
      setImageCaption('');
    } else {
      await onSendMessage(text.trim(), 'text', undefined, replyingTo?.id);
    }

    setText('');
    onClearReply();
    setShowEmojiPicker(false);

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const res = await uploadFile(file);
      if (file.type.startsWith('image/')) {
        setPendingImage(res);
      } else {
        await onSendMessage('', 'file', res, replyingTo?.id);
      }
    } catch (err: any) {
      alert(err.message || 'File upload failed');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const startVoiceRecording = () => {
    setIsRecording(true);
    setRecordingTime(0);
    timerRef.current = setInterval(() => {
      setRecordingTime((prev) => prev + 1);
    }, 1000);
  };

  const stopAndSendVoiceRecording = async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsRecording(false);

    // Mock Audio Voice sample send
    await onSendMessage(
      'Voice message',
      'voice',
      {
        url: 'https://actions.google.com/sounds/v1/ambiences/rain_heavy.ogg',
        name: 'voice_note.ogg',
        size: 140000,
      },
      replyingTo?.id
    );
    setRecordingTime(0);
  };

  const cancelVoiceRecording = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsRecording(false);
    setRecordingTime(0);
  };

  return (
    <div className="relative border-t border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-3 sm:p-4 z-20">
      
      {/* Quoted Message Banner */}
      {replyingTo && (
        <div className="mb-2 p-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-between animate-slide-up">
          <div className="min-w-0 pr-2">
            <span className="text-xs font-bold text-[#5B5FEF] dark:text-indigo-400">
              Replying to {replyingTo.sender?.full_name || 'Message'}
            </span>
            <p className="text-xs text-slate-600 dark:text-slate-300 truncate">
              {replyingTo.content}
            </p>
          </div>
          <button
            onClick={onClearReply}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Emoji Picker Popup */}
      {showEmojiPicker && (
        <div className="absolute bottom-20 left-4 z-50 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-3 grid grid-cols-6 gap-2 animate-slide-up">
          {EMOJI_LIST.map((emoji) => (
            <button
              key={emoji}
              onClick={() => {
                setText((prev) => prev + emoji);
                setShowEmojiPicker(false);
              }}
              className="text-xl hover:scale-125 transition-transform p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* Recording Bar */}
      {isRecording ? (
        <div className="flex items-center justify-between p-2 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 animate-pulse">
          <div className="flex items-center gap-3 pl-2">
            <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping" />
            <span className="text-xs font-mono font-bold text-rose-600 dark:text-rose-400">
              Recording {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button size="sm" variant="ghost" onClick={cancelVoiceRecording}>
              Cancel
            </Button>
            <Button size="sm" variant="danger" onClick={stopAndSendVoiceRecording} leftIcon={<Square className="w-3.5 h-3.5 fill-current" />}>
              Send Voice
            </Button>
          </div>
        </div>
      ) : (
        /* Standard Composer Controls */
        <div className="flex items-end gap-2">
          {/* File attachment input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="hidden"
            accept="image/*,application/pdf,document/*"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="p-2.5 rounded-xl text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex-shrink-0"
            title="Attach file or image"
          >
            {isUploading ? <Loader2 className="w-5 h-5 animate-spin text-[#5B5FEF]" /> : <Paperclip className="w-5 h-5" />}
          </button>

          {/* Text Input area */}
          <div className="flex-1 relative flex items-center bg-slate-100 dark:bg-slate-800/90 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 focus-within:border-[#5B5FEF] transition-all">
            <textarea
              ref={textareaRef}
              rows={1}
              value={text}
              onChange={handleTextChange}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              className="w-full py-2.5 pl-4 pr-10 text-sm font-medium bg-transparent text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none resize-none max-h-32"
            />

            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="absolute right-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            >
              <Smile className="w-5 h-5" />
            </button>
          </div>

          {/* Voice recorder button / Send button */}
          {text.trim() ? (
            <button
              onClick={handleSend}
              className="p-2.5 rounded-2xl bg-[#5B5FEF] hover:bg-[#4A4EC5] text-white shadow-lg shadow-[#5B5FEF]/30 transition-all flex-shrink-0 active:scale-95"
              title="Send message"
            >
              <Send className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={startVoiceRecording}
              className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-all flex-shrink-0"
              title="Record voice message"
            >
              <Mic className="w-5 h-5" />
            </button>
          )}
        </div>
      )}

      {/* Image Preview Modal before sending */}
      <Modal
        isOpen={Boolean(pendingImage)}
        onClose={() => setPendingImage(null)}
        title="Send Image Preview"
      >
        {pendingImage && (
          <div className="space-y-4">
            <img
              src={pendingImage.url}
              alt="Preview"
              className="w-full max-h-72 object-contain rounded-2xl bg-slate-900/5 dark:bg-white/5"
            />
            <input
              type="text"
              placeholder="Add a caption..."
              value={imageCaption}
              onChange={(e) => setImageCaption(e.target.value)}
              className="w-full py-2.5 px-4 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#5B5FEF]"
            />
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" onClick={() => setPendingImage(null)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleSend}>
                Send Image
              </Button>
            </div>
          </div>
        )}
      </Modal>

    </div>
  );
};
