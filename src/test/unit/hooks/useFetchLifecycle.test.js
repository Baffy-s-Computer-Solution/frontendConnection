import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useFetch } from '../../../hooks/useFetch';

describe('useFetch request lifecycle', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('loads JSON, records the HTTP status, and supports refetch', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => ({ ready: true }) });
    vi.stubGlobal('fetch', fetchMock);
    const { result } = renderHook(() => useFetch('/api/health'));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toEqual({ ready: true });
    expect(result.current.status).toBe(200);
    await act(async () => result.current.refetch());
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('surfaces non-success status as an error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 503, json: async () => ({}) }));
    const { result } = renderHook(() => useFetch('/api/health'));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe('HTTP error! status: 503');
    expect(result.current.status).toBe(503);
  });
});
