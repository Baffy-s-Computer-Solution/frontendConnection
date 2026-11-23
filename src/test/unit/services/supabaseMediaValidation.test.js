import { describe, expect, it } from 'vitest';
import { vi } from 'vitest';

vi.mock('firebase/auth', () => ({ getAuth: () => ({ currentUser: null }) }));
vi.mock('../../../config/supabase', () => ({ getSupabasePublicUrl: (path) => `https://storage.example/${path}` }));
vi.mock('../../../services/supabaseService', () => ({ supabaseService: { deleteObject: vi.fn() } }));
import { supabaseMediaService } from '../../../services/supabaseMediaService';

describe('Supabase media validation and object URL parsing', () => {
  it('rejects unsupported image types and enforces size boundaries', () => {
    expect(() => supabaseMediaService.validateImageFile({ type: 'application/pdf', size: 100 })).toThrow();
    expect(supabaseMediaService.validateImageFile({ type: 'image/png', size: 10 * 1024 * 1024 })).toBe(true);
    expect(() => supabaseMediaService.validateImageFile({ type: 'image/png', size: 10 * 1024 * 1024 + 1 })).toThrow();
    expect(supabaseMediaService.validateFile({ size: 20 * 1024 * 1024 })).toBe(true);
    expect(() => supabaseMediaService.validateFile({ size: 20 * 1024 * 1024 + 1 })).toThrow();
  });

  it('extracts object paths from public and signed URLs and refuses URL deletion input', async () => {
    expect(supabaseMediaService.extractObjectPath('https://storage.example/storage/v1/object/public/media/users/u1/p.png'))
      .toBe('users/u1/p.png');
    expect(supabaseMediaService.isSupabaseUrl('https://storage.example/storage/v1/object/sign/private/x')).toBe(true);
    await expect(supabaseMediaService.deleteFile('https://storage.example/file.png'))
      .rejects.toThrow('A Supabase object path is required for deletion.');
  });
});
