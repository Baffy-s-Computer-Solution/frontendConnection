import { auth } from '../config/firebase';
import supabaseConfig, { getSupabasePublicUrl, supabaseFetch } from '../config/supabase';
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

  listPublicUsers: async () => {
    try {
      const data = await supabaseFetch('/rest/v1/app_users?select=*&status=eq.active', {
        method: 'GET',
      });
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message, data: [] };
    }
  },

  getPublicUrl: getSupabasePublicUrl,
};

export default supabaseService;
