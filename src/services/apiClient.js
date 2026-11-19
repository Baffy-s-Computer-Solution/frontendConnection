import { auth } from '../config/firebase';
import API_BASE_URL from './apiConfig';

export class ApiClientError extends Error {
  constructor(message, status, code) {
    super(message);
    this.name = 'ApiClientError';
    this.status = status;
    this.code = code;
  }
}

export async function apiRequest(path, options = {}) {
  const user = auth.currentUser;
  if (!user) {
    throw new ApiClientError('Please sign in to continue.', 401, 'AUTH_REQUIRED');
  }

  const token = await user.getIdToken();
  const { body, headers = {}, ...requestOptions } = options;
  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
  const requestHeaders = {
    Accept: 'application/json',
    Authorization: `Bearer ${token}`,
    ...headers,
  };

  if (body !== undefined && !isFormData && !requestHeaders['Content-Type']) {
    requestHeaders['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...requestOptions,
    headers: requestHeaders,
    body: body === undefined || isFormData ? body : JSON.stringify(body),
  });

  const result = response.status === 204 ? null : await response.json().catch(() => null);
  if (!response.ok) {
    const message =
      typeof result?.message === 'string' ? result.message : 'The request could not be completed.';
    throw new ApiClientError(message, response.status, result?.code);
  }

  return result?.data ?? result;
}
