import { supabase } from './supabaseClient';

export const storageService = {
  /**
   * Upload user profile avatar photo
   */
  async uploadAvatar(file: File): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const filePath = `avatars/${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, { upsert: true });

    if (error) {
      console.warn('[Supabase Storage Warning] uploadAvatar failed or bucket offline, using local URL:', error);
      return URL.createObjectURL(file);
    }

    const { data: publicUrlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(data.path);

    return publicUrlData.publicUrl;
  },

  /**
   * Upload study note attachment / document
   */
  async uploadAttachment(file: File): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const filePath = `attachments/${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
    const { data, error } = await supabase.storage
      .from('attachments')
      .upload(filePath, file, { upsert: true });

    if (error) {
      console.warn('[Supabase Storage Warning] uploadAttachment failed or bucket offline, using local URL:', error);
      return URL.createObjectURL(file);
    }

    const { data: publicUrlData } = supabase.storage
      .from('attachments')
      .getPublicUrl(data.path);

    return publicUrlData.publicUrl;
  },

  /**
   * Legacy compatible file upload replacement for uploadBytesResumable
   */
  async uploadFile(file: File, path: string): Promise<string> {
    console.log(`[Supabase Storage] Uploading ${file.name} to path: ${path}`);
    const bucket = path.split('/')[0] || 'attachments';
    const subPath = path.substring(bucket.length + 1) || file.name;

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(subPath, file, { upsert: true });

    if (error) {
      console.warn('[Supabase Storage Warning] uploadFile failed, using local blob URL:', error);
      return URL.createObjectURL(file);
    }

    const { data: publicUrlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return publicUrlData.publicUrl;
  },

  /**
   * Legacy compatible file deletion replacement for deleteObject
   */
  async deleteFile(fullStoragePath: string): Promise<void> {
    console.log(`[Supabase Storage] Deleting file at path: ${fullStoragePath}`);
    const parts = fullStoragePath.split('/');
    const bucket = parts[0];
    const path = parts.slice(1).join('/');

    const { error } = await supabase.storage.from(bucket).remove([path]);
    if (error) {
      console.error('[Supabase Storage Error] deleteFile failed:', error);
    }
  }
};
