import { afterEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  auth: { currentUser: { getIdToken: vi.fn().mockResolvedValue('firebase-token') } },
  getSupabasePublicUrl: vi.fn(), fetch: vi.fn(),
}));
vi.mock('../../../config/firebase', () => ({ auth: mocks.auth }));
vi.mock('../../../config/supabase', () => ({ default: { configured: true }, getSupabasePublicUrl: mocks.getSupabasePublicUrl }));
vi.mock('../../../services/apiConfig', () => ({ default: 'https://api.example.test' }));

import { supabaseService } from '../../../services/supabaseService';

describe('Supabase private document API adapter', () => {
  afterEach(() => { vi.unstubAllGlobals(); vi.clearAllMocks(); });

  it('uploads a document as multipart data through the authenticated backend', async () => {
    mocks.auth.currentUser = { getIdToken: vi.fn().mockResolvedValue('firebase-token') };
    const file = new File(['resume'], 'resume.pdf', { type: 'application/pdf' });
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 201, json: async () => ({ success: true, path: 'private_documents/u1/resume.pdf' }) });
    vi.stubGlobal('fetch', fetchMock);
    await expect(supabaseService.uploadPrivateDocument({ file, title: 'Resume', category: 'resume' }))
      .resolves.toMatchObject({ path: 'private_documents/u1/resume.pdf' });
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe('https://api.example.test/api/documents');
    expect(options.headers.Authorization).toBe('Bearer firebase-token');
    expect(options.headers['Content-Type']).toBeUndefined();
    expect(options.body).toBeInstanceOf(FormData);
    expect(options.body.get('file')).toBe(file);
  });

  it('uses document IDs for signed URL and deletion requests', async () => {
    mocks.auth.currentUser = { getIdToken: vi.fn().mockResolvedValue('firebase-token') };
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({ ok: true, status: 200, json: async () => ({ success: true, url: 'https://signed.example/doc' }) })
      .mockResolvedValueOnce({ ok: true, status: 200, json: async () => ({ success: true }) });
    vi.stubGlobal('fetch', fetchMock);
    await expect(supabaseService.getPrivateDocumentUrl('doc/1')).resolves.toBe('https://signed.example/doc');
    await expect(supabaseService.deletePrivateDocument('doc/1')).resolves.toMatchObject({ success: true });
    expect(fetchMock.mock.calls.map(([url]) => url)).toEqual([
      'https://api.example.test/api/documents/doc%2F1/url',
      'https://api.example.test/api/documents/doc%2F1',
    ]);
  });
});
