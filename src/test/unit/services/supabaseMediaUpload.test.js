import { afterEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ getAuth: vi.fn(), uploadFile: vi.fn() }));
vi.mock('firebase/auth', () => ({ getAuth: mocks.getAuth }));
vi.mock('../../../config/supabase', () => ({ getSupabasePublicUrl: (path) => `https://storage.example/${path}` }));
vi.mock('../../../services/supabaseService', () => ({ supabaseService: { uploadFile: mocks.uploadFile, deleteObject: vi.fn() } }));

import { supabaseMediaService } from '../../../services/supabaseMediaService';

describe('Supabase media uploads', () => {
  afterEach(() => vi.clearAllMocks());
  it('scopes object paths to the authenticated Firebase UID and sanitizes filenames', async () => {
    mocks.getAuth.mockReturnValue({ currentUser: { uid: 'student-1' } });
    mocks.uploadFile.mockImplementation(async ({ path }) => ({ success: true, path, url: `https://cdn.example/${path}` }));
    const file = new File(['image'], 'my photo.png', { type: 'image/png' });
    const result = await supabaseMediaService.upload(file, { folder: 'profile photos' });
    const [{ path }] = mocks.uploadFile.mock.calls[0];
    expect(path).toMatch(/^users\/student-1\/profile_photos\/my_photo\.png$/);
    expect(result.storagePath).toBe(path);
  });

  it('rejects upload attempts without an authenticated account', async () => {
    mocks.getAuth.mockReturnValue({ currentUser: null });
    await expect(supabaseMediaService.upload(new File(['x'], 'x.png', { type: 'image/png' })))
      .rejects.toThrow('Sign in to upload media.');
    expect(mocks.uploadFile).not.toHaveBeenCalled();
  });
});
