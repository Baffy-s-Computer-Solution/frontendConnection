import { supabaseMediaService } from './supabaseMediaService';
import API_BASE_URL from './apiConfig';

class StorageService {
  constructor() {
    this.baseUrl = String(API_BASE_URL || '').replace(/\/+$/, '') + '/api';
  }

  async uploadFile(file, path = 'media', metadata = {}) {
    if (!file) throw new Error('Choose a file to upload.');
    return supabaseMediaService.uploadToSupabase(file, path, metadata);
  }

  async uploadToSupabase(file, path = 'media', metadata = {}) {
    return this.uploadFile(file, path, metadata);
  }

  async getFileUrl(path) {
    const url = supabaseMediaService.getImageUrl(path);
    return { success: true, url, storageType: 'supabase' };
  }

  async deleteFile(path) {
    await supabaseMediaService.deleteFile(path);
    return { success: true, storageType: 'supabase' };
  }

  async uploadProfilePhoto(file, userId) {
    return this.uploadFile(file, 'profile-photos/' + userId);
  }

  async uploadDocument(file, userId, documentType = 'document') {
    return this.uploadFile(file, 'documents/' + userId + '/' + documentType);
  }

  async getOptimizedImageUrl(path) {
    return supabaseMediaService.getImageUrl(path);
  }
}

export const storageService = new StorageService();
export default storageService;
