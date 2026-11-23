// src/services/mediaService.js
import { validateFile } from '../utils/validationSchemas';

import { supabaseMediaService } from './supabaseMediaService';

/**
 * Comprehensive Media Service
 * Handles media operations through Supabase Storage.
 */

class MediaService {
  constructor() {
    this.uploadQueue = [];
    this.isUploading = false;
    this.maxConcurrentUploads = 3;
  }

  // ==================== UPLOAD METHODS ====================

  /**
   * Upload media with automatic storage selection
   */
  async uploadMedia(file, options = {}) {
    try {
      const {
        type = 'auto',
        userId,
        folder = 'media',
        metadata = {},
        onProgress = () => {},
      } = options;

      // Validate file
      const validation = await validateFile(file, type);
      if (!validation.isValid) {
        throw new Error(validation.errors);
      }

      const result = await this.uploadToSupabase(file, {
        folder: userId ? `${folder}/${userId}` : folder,
        ...metadata,
      });

      onProgress(100);

      return {
        success: true,
        ...result,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
        uploadedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error('❌ Media upload error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Upload to supabase with retry logic
   */
  async uploadToSupabase(file, options = {}) {
    const maxRetries = 3;
    let lastError;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`☁️ supabase upload attempt ${attempt}/${maxRetries}:`, file.name);

        const result = await supabaseMediaService.uploadFile(file, options);

        if (result.success) {
          return result;
        }

        lastError = result.error;

        if (attempt < maxRetries) {
          // Exponential backoff
          await this.delay(attempt * 1000);
        }
      } catch (error) {
        lastError = error.message;
        if (attempt < maxRetries) {
          await this.delay(attempt * 1000);
        }
      }
    }

    throw new Error(`supabase upload failed after ${maxRetries} attempts: ${lastError}`);
  }

  /**
   * Upload multiple files with queue management
   */
  async uploadMultiple(files, options = {}) {
    const results = [];
    const errors = [];

    const {
      onProgress = () => {},
      onFileComplete = () => {},
      concurrent = this.maxConcurrentUploads,
    } = options;

    const uploadFile = async (file, index) => {
      try {
        const result = await this.uploadMedia(file, {
          ...options,
          onProgress: (progress) => {
            onProgress(index, progress, files.length);
          },
        });

        results.push({
          file: file.name,
          index,
          ...result,
        });

        onFileComplete(index, result, files.length);
      } catch (error) {
        errors.push({
          file: file.name,
          index,
          error: error.message,
        });

        onFileComplete(index, { success: false, error: error.message }, files.length);
      }
    };

    // Upload in batches
    const batches = [];
    for (let i = 0; i < files.length; i += concurrent) {
      batches.push(files.slice(i, i + concurrent));
    }

    for (const batch of batches) {
      await Promise.all(
        batch.map((file, batchIndex) => uploadFile(file, results.length + batchIndex))
      );
    }

    return {
      success: errors.length === 0,
      results,
      errors,
      total: files.length,
      successful: results.length,
      failed: errors.length,
    };
  }

  // ==================== PROCESSING METHODS ====================

  /**
   * Process image with supabase transformations
   */
  async processImage(publicId, transformations = {}) {
    try {
      if (!publicId) {
        throw new Error('Public ID is required');
      }

      const url = supabaseMediaService.getImageUrl(publicId, transformations);

      return {
        success: true,
        url,
        transformations,
        processedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error('❌ Image processing error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Generate thumbnails for an image
   */
  async generateThumbnails(publicId, sizes = [100, 200, 400]) {
    try {
      const thumbnails = {};

      for (const size of sizes) {
        const result = await this.processImage(publicId, {
          width: size,
          height: size,
          crop: 'fill',
          gravity: 'auto',
          quality: 'auto:good',
        });

        if (result.success) {
          thumbnails[`thumb_${size}`] = result.url;
        }
      }

      return {
        success: true,
        thumbnails,
        original: supabaseMediaService.getImageUrl(publicId),
      };
    } catch (error) {
      console.error('❌ Thumbnail generation error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Optimize image for web
   */
  async optimizeImage(publicId, options = {}) {
    const defaultOptions = {
      quality: 'auto:good',
      format: 'auto',
      fetch_format: 'auto',
      width: options.maxWidth || 1920,
    };

    return this.processImage(publicId, {
      ...defaultOptions,
      ...options,
    });
  }

  // ==================== DELETE METHODS ====================

  /**
   * Delete media from storage
   */
  async deleteMedia(url, storageType = 'auto') {
    try {
      if (!url) {
        throw new Error('URL is required');
      }

      // Determine storage type
      let actualStorageType = storageType;
      if (storageType === 'auto') {
        actualStorageType = 'supabase';
      }

      const objectPath = supabaseMediaService.extractObjectPath(url);
      if (!objectPath) throw new Error('Could not determine the Supabase object path.');
      return await supabaseMediaService.deleteFile(objectPath);
    } catch (error) {
      console.error('❌ Media delete error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Delete multiple media files
   */
  async deleteMultiple(urls) {
    const results = [];
    const errors = [];

    for (const url of urls) {
      try {
        const result = await this.deleteMedia(url);
        if (result.success) {
          results.push({ url, success: true });
        } else {
          errors.push({ url, error: result.error });
        }
      } catch (error) {
        errors.push({ url, error: error.message });
      }
    }

    return {
      success: errors.length === 0,
      results,
      errors,
      total: urls.length,
      successful: results.length,
      failed: errors.length,
    };
  }

  // ==================== HELPER METHODS ====================

  /**
   * Determine if supabase should be used
   */
  /**
   * Get file extension from URL
   */
  getFileExtension(url) {
    if (!url) return '';
    const parts = url.split('.');
    return parts.length > 1 ? parts.pop().toLowerCase() : '';
  }

  /**
   * Get file type from MIME type or extension
   */
  getFileType(file) {
    if (file.type) {
      if (file.type.startsWith('image/')) return 'image';
      if (file.type.startsWith('video/')) return 'video';
      if (file.type === 'application/pdf') return 'pdf';
      if (file.type.includes('word') || file.type.includes('document')) return 'document';
    }

    const ext = this.getFileExtension(file.name || '');
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return 'image';
    if (['mp4', 'avi', 'mov', 'wmv'].includes(ext)) return 'video';
    if (ext === 'pdf') return 'pdf';
    if (['doc', 'docx'].includes(ext)) return 'document';

    return 'file';
  }

  /**
   * Format file size
   */
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Delay helper for retries
   */
  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Get optimized image URL for display
   */
  getOptimizedImageUrl(url, width = 800) {
    if (!url) return null;

    if (supabaseMediaService.isSupabaseUrl(url)) {
      const objectPath = supabaseMediaService.extractObjectPath(url);
      if (objectPath) {
        return supabaseMediaService.getImageUrl(objectPath, {
          width,
          quality: 'auto:good',
          fetch_format: 'auto',
        });
      }
    }

    return url;
  }

  /**
   * Create file preview
   */
  async createFilePreview(file) {
    return new Promise((resolve) => {
      if (!file.type.startsWith('image/')) {
        resolve(null);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        resolve(e.target.result);
      };
      reader.readAsDataURL(file);
    });
  }

  /**
   * Compress image file
   */
  async compressImage(file, maxSizeKB = 500) {
    return new Promise((resolve) => {
      if (!file.type.startsWith('image/') || file.size <= maxSizeKB * 1024) {
        resolve(file);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');

          // Calculate dimensions
          let width = img.width;
          let height = img.height;
          const maxDimension = 1920;

          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = (height * maxDimension) / width;
              width = maxDimension;
            } else {
              width = (width * maxDimension) / height;
              height = maxDimension;
            }
          }

          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);

          // Adjust quality based on target size
          let quality = 0.9;
          const adjustQuality = (qlty) => {
            return new Promise((res) => {
              canvas.toBlob(
                (blob) => {
                  if (blob.size <= maxSizeKB * 1024 || qlty <= 0.1) {
                    res(blob);
                  } else {
                    adjustQuality(qlty - 0.1);
                  }
                },
                'image/jpeg',
                qlty
              );
            });
          };

          adjustQuality(quality).then((blob) => {
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          });
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  }
}

// Export singleton instance
export const mediaService = new MediaService();
export default mediaService;
