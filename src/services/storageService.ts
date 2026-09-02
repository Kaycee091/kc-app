import { supabase, isSupabaseConfigured } from './supabaseClient';

export interface UploadResult {
  url: string;
  name: string;
  size: number;
}

export const uploadFile = async (file: File): Promise<UploadResult> => {
  // Enforce 25MB file size limit
  if (file.size > 25 * 1024 * 1024) {
    throw new Error('File size exceeds maximum allowed limit of 25MB');
  }

  if (isSupabaseConfigured) {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
      const filePath = `attachments/${fileName}`;

      const { data, error } = await supabase.storage
        .from('chat-attachments')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) {
        console.warn('Supabase storage upload error, falling back to local object URL:', error);
      } else {
        const { data: publicData } = supabase.storage
          .from('chat-attachments')
          .getPublicUrl(filePath);

        return {
          url: publicData.publicUrl,
          name: file.name,
          size: file.size,
        };
      }
    } catch (e) {
      console.warn('Storage upload exception:', e);
    }
  }

  // Local object URL fallback for zero-config preview
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve({
        url: reader.result as string,
        name: file.name,
        size: file.size,
      });
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};
