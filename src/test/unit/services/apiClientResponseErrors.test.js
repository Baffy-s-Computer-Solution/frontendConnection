import { afterEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ auth: { currentUser: { getIdToken: vi.fn().mockResolvedValue('token') } } }));
vi.mock('../../../config/firebase', () => ({ auth: mocks.auth }));
vi.mock('../../../services/apiConfig', () => ({ default: 'https://api.example.test' }));

import { apiRequest } from '../../../services/apiClient';

describe('API response and error handling', () => {
  afterEach(() => { vi.unstubAllGlobals(); });

  it('returns null for a successful no-content response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, status: 204 }));
    await expect(apiRequest('/api/resource')).resolves.toBeNull();
  });

  it('preserves server status and safe error code without leaking response internals', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false, status: 403, json: async () => ({ message: 'Forbidden', code: 'ACCESS_DENIED', secret: 'never expose' }),
    }));
    await expect(apiRequest('/api/private')).rejects.toMatchObject({
      name: 'ApiClientError', message: 'Forbidden', status: 403, code: 'ACCESS_DENIED',
    });
  });
});
