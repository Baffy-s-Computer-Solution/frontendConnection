import { afterEach, describe, expect, it, vi } from 'vitest';
import api from '../../../services/api';

describe('legacy API adapter', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('returns parsed company data from the configured endpoint', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ companies: [{ id: 'c1' }] }) });
    vi.stubGlobal('fetch', fetchMock);
    await expect(api.companiesAPI.getAll()).resolves.toEqual({ companies: [{ id: 'c1' }] });
    expect(fetchMock.mock.calls[0][0]).toMatch(/\/api\/companies$/);
  });

  it('converts network failures into a safe service result', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));
    await expect(api.testConnection()).resolves.toMatchObject({ success: false, message: expect.stringContaining('offline') });
  });
});
