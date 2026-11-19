import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../../services/apiClient', () => ({ apiRequest: vi.fn() }));

import { cloudinaryService } from '../../../services/cloudinaryService';

describe('CloudinaryService.uploadFile', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('surfaces the Cloudinary error message instead of raw JSON', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      text: vi.fn().mockResolvedValue(
        JSON.stringify({ error: { message: 'Upload preset not found' } })
      ),
    }));

    const file = new File(['%PDF-1.4'], 'runtime-check.pdf', {
      type: 'application/pdf',
    });
    const result = await cloudinaryService.uploadFile(file);

    expect(result).toEqual({
      success: false,
      error: 'Cloudinary upload failed: Upload preset not found',
      code: 'FILE_UPLOAD_FAILED',
    });
  });
});
