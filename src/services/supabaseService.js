import { auth } from '../config/firebase';
import supabaseConfig, { getSupabasePublicUrl } from '../config/supabase';
import API_BASE_URL from './apiConfig';

const getFirebaseToken = async () => {
  const user = auth.currentUser;
  if (!user) return null;
  return user.getIdToken();
};

const backendRequest = async (path, options = {}) => {
  const token = await getFirebaseToken();
  if (!token) {
    return { success: false, skipped: true, error: 'User is not authenticated' };
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    return {
      success: false,
      error: data.message || data.error || response.statusText,
      data,
    };
  }

  return data;
};

export const supabaseService = {
  config: supabaseConfig,

  health: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/supabase/health`);
      return await response.json();
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  syncCurrentUser: async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      return { success: false, skipped: true, message: 'No authenticated user to sync' };
    }

    return backendRequest('/api/supabase/sync/me', { method: 'POST' });
  },

  uploadBase64: async ({ path, file, contentType }) =>
    backendRequest('/api/supabase/storage/upload-base64', {
      method: 'POST',
      body: JSON.stringify({ path, file, contentType }),
    }),

  deleteObject: async (path) => {
    const result = await backendRequest('/api/supabase/storage/object', {
      method: 'DELETE',
      body: JSON.stringify({ path }),
    });
    if (!result?.success) throw new Error(result?.error || 'Supabase could not delete this file.');
    return result;
  },

  deletePrivateDocument: async (path) => {
    const result = await backendRequest('/api/supabase/storage/document', {
      method: 'DELETE',
      body: JSON.stringify({ path }),
    });
    if (!result?.success) throw new Error(result?.error || 'Supabase could not delete this private document.');
    return result;
  },

  getPrivateDocumentUrl: async (path) => {
    const result = await backendRequest('/api/supabase/storage/document-url', {
      method: 'POST',
      body: JSON.stringify({ path }),
    });
    if (!result?.success || !result.signedUrl) throw new Error(result?.error || 'Unable to open this private document.');
    return result.signedUrl;
  },

  uploadPrivateDocument: async ({ path, file, contentType }) => {
    const result = await backendRequest('/api/supabase/storage/upload-base64', {
      method: 'POST',
      body: JSON.stringify({ path, file, contentType }),
    });
    if (!result?.success || result.storageType !== 'supabase_private') {
      throw new Error(result?.error || 'Supabase could not store this private document.');
    }
    return result;
  },

  getPublicUrl: getSupabasePublicUrl,
};

export default supabaseService;
