import { getAuth } from 'firebase/auth';
import { getSupabasePublicUrl } from '../config/supabase';
import { supabaseService } from './supabaseService';

const sanitizePath = (value) => String(value || 'media')
  .replace(/\\/g, '/')
  .split('/')
  .filter((part) => part && part !== '.' && part !== '..')
  .map((part) => part.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 120))
  .filter(Boolean)
  .join('/');

const normalizeUploadArguments = (folderOrOptions, extraOptions = {}) => {
  if (typeof folderOrOptions === 'string') return { ...extraOptions, folder: folderOrOptions };
  return folderOrOptions || {};
};

const isSupportedImage = (file) => Boolean(file?.type?.startsWith('image/'));
const isSupabaseUrl = (value) => typeof value === 'string' && /\/storage\/v1\/object\/(public|sign)\//i.test(value);
const getObjectPath = (value) => {
  if (!value || typeof value !== 'string') return '';
  const publicPath = value.match(/\/object\/public\/[^/]+\/(.+)$/);
  const signedPath = value.match(/\/object\/sign\/[^/]+\/(.+?)(?:\?|$)/);
  if (publicPath || signedPath) return decodeURIComponent((publicPath || signedPath)[1]);
  return value;
};

const upload = async (file, folderOrOptions = {}, extraOptions = {}) => {
  const options = normalizeUploadArguments(folderOrOptions, extraOptions);
  const user = getAuth().currentUser;
  if (!user) throw new Error('Sign in to upload media.');
  if (!file) throw new Error('Choose a file to upload.');
  const folder = sanitizePath(options.folder || options.path || 'media');
  const fileName = String(options.fileName || options.publicId || file.name || 'upload')
    .split(/[\\/]/).pop().replace(/[^a-zA-Z0-9._-]/g, '_').slice(-140) || 'upload';
  const path = `users/${user.uid}/${options.path ? sanitizePath(options.path) : folder}/${fileName}`;
  const result = await supabaseService.uploadFile({ path, file });
  return {
    ...result,
    publicId: result.path,
    storagePath: result.path,
    secureUrl: result.url,
    public_id: result.path,
    secure_url: result.url,
    resourceType: file.type?.startsWith('video/') ? 'video' : 'image',
  };
};

export const supabaseMediaService = {
  upload,
  uploadImage: (file, options) => upload(file, options),
  uploadFile: (file, options) => upload(file, options),
  uploadVideo: (file, options) => upload(file, options),
  uploadToSupabase: (file, folder, options) => upload(file, folder, options),
  deleteFile: async (path) => {
    const objectPath = getObjectPath(path);
    if (!objectPath || /^https?:\/\//i.test(objectPath)) throw new Error('A Supabase object path is required for deletion.');
    return supabaseService.deleteObject(objectPath);
  },
  deleteImage: async (path) => {
    const result = await supabaseMediaService.deleteFile(path);
    return { success: true, result };
  },
  deleteFromSupabase: async (path) => supabaseMediaService.deleteFile(path),
  getImageUrl: (path) => /^https?:\/\//i.test(path || '') ? path : getSupabasePublicUrl(path),
  getVideoUrl: (path) => /^https?:\/\//i.test(path || '') ? path : getSupabasePublicUrl(path),
  optimizeImage: (url) => url,
  getThumbnailUrl: (url) => url,
  getResponsiveUrls: (url) => ({ original: url, small: url, medium: url, large: url }),
  validateImageFile: (file) => {
    if (!isSupportedImage(file)) throw new Error('Choose a valid image file.');
    if (file.size > 10 * 1024 * 1024) throw new Error('Images must be no larger than 10 MB.');
    return true;
  },
  validateFile: (file) => {
    if (!file || file.size > 20 * 1024 * 1024) throw new Error('Choose a file no larger than 20 MB.');
    return true;
  },
  isSupabaseUrl,
  extractObjectPath: getObjectPath,
  getPlaceholderUrl: (width = 300, height = 300) => `https://placehold.co/${width}x${height}`,
};

export const uploadToSupabase = supabaseMediaService.uploadToSupabase;
export const uploadImage = supabaseMediaService.uploadImage;
export const uploadFile = supabaseMediaService.uploadFile;
export default supabaseMediaService;
