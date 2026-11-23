import { afterEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ auth: { currentUser: null } }));
vi.mock('../../../config/firebase', () => ({ auth: mocks.auth }));
vi.mock('../../../services/apiConfig', () => ({ default: 'https://api.example.test' }));

import { ApiClientError, apiRequest } from '../../../services/apiClient';

describe('authenticated API client', () => {
  afterEach(() => { vi.unstubAllGlobals(); vi.clearAllMocks(); mocks.auth.currentUser = null; });

  it('refuses requests without a signed-in Firebase user', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    await expect(apiRequest('/api/private')).rejects.toMatchObject({ status: 401, code: 'AUTH_REQUIRED' });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('attaches the ID token and serializes JSON request bodies', async () => {
    mocks.auth.currentUser = { getIdToken: vi.fn().mockResolvedValue('firebase-id-token') };
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => ({ data: { saved: true } }) });
    vi.stubGlobal('fetch', fetchMock);

    await expect(apiRequest('/api/profile', { method: 'PATCH', body: { name: 'Mpho' } })).resolves.toEqual({ saved: true });
    expect(fetchMock).toHaveBeenCalledWith('https://api.example.test/api/profile', expect.objectContaining({
      method: 'PATCH', body: '{"name":"Mpho"}',
      headers: expect.objectContaining({ Authorization: 'Bearer firebase-id-token', 'Content-Type': 'application/json' }),
    }));
    expect(ApiClientError).toBeDefined();
  });
});
