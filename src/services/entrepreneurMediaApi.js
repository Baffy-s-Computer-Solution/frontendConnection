import { apiRequest } from './apiClient';

const cursorQuery = (cursor) => (cursor ? `?cursor=${encodeURIComponent(cursor)}` : '');

export const listEntrepreneurMedia = (cursor, options = {}) =>
  apiRequest(`/api/media${cursorQuery(cursor)}`, options);

export const uploadEntrepreneurMedia = (file) => {
  const body = new FormData();
  body.append('file', file);
  return apiRequest('/api/media/upload', { method: 'POST', body });
};

export const deleteEntrepreneurMedia = (mediaId) =>
  apiRequest(`/api/media/${encodeURIComponent(mediaId)}`, { method: 'DELETE' });
