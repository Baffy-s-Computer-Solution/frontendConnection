import { cloudinaryService } from './cloudinaryService';

const storageClient = Object.freeze({ provider: 'cloudinary' });
const uploadedAssets = new Map();

export const getStorage = () => storageClient;

export const ref = (storageOrReference, path) => {
  const fullPath = path === undefined ? storageOrReference : path;
  if (typeof fullPath !== 'string' || !fullPath.trim()) {
    throw new Error('A Cloudinary asset path is required.');
  }
  const normalizedPath = fullPath.replace(/^\/+|\/+$/g, '');
  const saved = uploadedAssets.get(normalizedPath);
  return {
    bucket: 'cloudinary',
    fullPath: saved?.publicId || normalizedPath,
    name: normalizedPath.split('/').at(-1),
    publicId: saved?.publicId || normalizedPath,
    url: saved?.url || (/^https?:\/\//i.test(normalizedPath) ? normalizedPath : ''),
  };
};

const resolveReference = (reference) => {
  const candidate = reference?.ref || reference;
  if (!candidate?.url && candidate?.fullPath) {
    const stored = uploadedAssets.get(candidate.fullPath);
    if (stored) return { ...candidate, ...stored };
  }
  return candidate;
};

const upload = async (reference, file, metadata = {}) => {
  const target = resolveReference(reference);
  if (!file || !target?.fullPath) throw new Error('A file and Cloudinary path are required.');
  const segments = target.fullPath.split('/');
  const fileName = segments.pop();
  const folder = segments.join('/') || 'career-connect/uploads';
  const resourceType = file.type?.startsWith('image/') ? 'image' : file.type?.startsWith('video/') ? 'video' : 'raw';
  const result = await cloudinaryService.uploadToCloudinary(file, folder, {
    resource_type: resourceType,
    public_id: fileName.replace(/\.[^.]+$/, ''),
    tags: metadata.customMetadata ? Object.values(metadata.customMetadata).filter(Boolean) : undefined,
  });
  if (!result?.success || !result.url || !result.public_id) {
    throw new Error(result?.error || 'Cloudinary upload failed.');
  }

  const asset = { publicId: result.public_id, url: result.url };
  uploadedAssets.set(target.fullPath, asset);
  uploadedAssets.set(result.public_id, asset);
  target.fullPath = result.public_id;
  target.publicId = result.public_id;
  target.url = result.url;

  return {
    ref: target,
    bytesTransferred: Number(result.bytes) || file.size || 0,
    totalBytes: Number(result.bytes) || file.size || 0,
    state: 'success',
    metadata: {
      name: result.public_id.split('/').at(-1),
      fullPath: result.public_id,
      contentType: file.type || metadata.contentType || 'application/octet-stream',
      size: Number(result.bytes) || file.size || 0,
      timeCreated: result.created_at || new Date().toISOString(),
      customMetadata: metadata.customMetadata || {},
      resourceType: result.resource_type || resourceType,
    },
  };
};

export const uploadBytes = (reference, file, metadata = {}) => upload(reference, file, metadata);

export const uploadBytesResumable = (reference, file, metadata = {}) => {
  const target = resolveReference(reference);
  const task = {
    snapshot: { ref: target, bytesTransferred: 0, totalBytes: file?.size || 0, state: 'running' },
    on(event, nextOrObserver, error, complete) {
      if (event !== 'state_changed') throw new Error(`Unsupported upload event: ${event}`);
      const observer = typeof nextOrObserver === 'object' ? nextOrObserver : { next: nextOrObserver, error, complete };
      upload(target, file, metadata).then((snapshot) => {
        task.snapshot = snapshot;
        observer.next?.(snapshot);
        observer.complete?.();
      }).catch((uploadError) => {
        task.snapshot = { ...task.snapshot, state: 'error', error: uploadError };
        observer.error?.(uploadError);
      });
      return () => {};
    },
    pause: () => false,
    resume: () => true,
    cancel: () => false,
  };
  return task;
};

export const uploadString = async (reference, value, format = 'raw', metadata = {}) => {
  const blob = format === 'data_url'
    ? await (await fetch(value)).blob()
    : new Blob([value], { type: metadata.contentType || 'text/plain' });
  const file = new File([blob], reference?.name || 'upload', { type: blob.type });
  return upload(reference, file, metadata);
};

export const getDownloadURL = async (reference) => {
  const target = resolveReference(reference);
  if (target?.url) return target.url;
  const stored = target?.fullPath ? uploadedAssets.get(target.fullPath) : null;
  if (stored?.url) return stored.url;
  if (/^https?:\/\//i.test(target?.fullPath || '')) return target.fullPath;
  throw new Error('This Cloudinary asset has no stored URL.');
};

export const deleteObject = async (reference) => {
  const target = resolveReference(reference);
  const publicId = target?.publicId || target?.fullPath;
  if (!publicId) throw new Error('A Cloudinary public ID is required to delete an asset.');
  const result = await cloudinaryService.deleteImage(publicId);
  if (!result?.success) throw new Error(result?.error || 'Cloudinary deletion failed.');
  uploadedAssets.delete(target.fullPath);
  uploadedAssets.delete(publicId);
};

export const listAll = async () => ({ items: [], prefixes: [], nextPageToken: null });
export const getMetadata = async (reference) => {
  const target = resolveReference(reference);
  return { fullPath: target?.publicId || target?.fullPath || '', name: target?.name || '', contentType: '', size: 0 };
};

export const uploadBytesResumableCompat = uploadBytesResumable;
