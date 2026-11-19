// frontend/src/test/unit/services/api.test.js
// ============================================================
// Unit Tests: API Service
// ============================================================
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { api } from '../../src/services/api';

describe('API Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  describe('request', () => {
    it('should make successful GET request', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ data: 'test' }),
      });

      const result = await api.get('/test');
      expect(result).toEqual({ data: 'test' });
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/test'),
        expect.objectContaining({ method: 'GET' })
      );
    });

    it('should make POST request with body', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ id: 1 }),
      });

      const body = { name: 'Test' };
      await api.post('/items', body);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/items'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(body),
        })
      );
    });

    it('should handle errors', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ error: 'Not found' }),
      });

      await expect(api.get('/missing')).rejects.toThrow('Not found');
    });

    it('should handle network errors', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Network error'));
      await expect(api.get('/test')).rejects.toThrow('Network error');
    });

    it('should retry on 5xx errors', async () => {
      global.fetch
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => ({ error: 'Server error' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => ({ data: 'success' }),
        });

      const result = await api.get('/flaky', { retries: 1 });
      expect(result).toEqual({ data: 'success' });
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    it('should include auth token when available', async () => {
      localStorage.setItem('token', 'test-token');
      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({}),
      });

      await api.get('/protected');
      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token',
          }),
        })
      );
    });

    it('should support request cancellation', async () => {
      const controller = new AbortController();
      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({}),
      });

      await api.get('/test', { signal: controller.signal });
      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ signal: controller.signal })
      );
    });

    it('should handle timeout', async () => {
      vi.useFakeTimers();
      global.fetch.mockImplementationOnce(
        () =>
          new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Timeout')), 5000);
          })
      );

      const promise = api.get('/slow', { timeout: 1000 });
      vi.advanceTimersByTime(1000);
      await expect(promise).rejects.toThrow();
      vi.useRealTimers();
    });
  });
});