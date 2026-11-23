import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  getDocs: vi.fn(),
  collection: vi.fn(),
  query: vi.fn(),
  orderBy: vi.fn(),
  limit: vi.fn(),
  onSnapshot: vi.fn(),
  where: vi.fn(),
  apiRequest: vi.fn(),
}));

vi.mock('../../../config/firebase', () => ({
  auth: { currentUser: { uid: 'user-1' } },
  db: {},
  collection: mocks.collection,
  query: mocks.query,
  orderBy: mocks.orderBy,
  limit: mocks.limit,
  getDocs: mocks.getDocs,
  onSnapshot: mocks.onSnapshot,
  where: mocks.where,
  getDoc: vi.fn(),
  addDoc: vi.fn(),
  updateDoc: vi.fn(),
  doc: vi.fn(),
  Timestamp: { now: () => ({}) },
  arrayRemove: vi.fn(),
  arrayUnion: vi.fn(),
  increment: vi.fn(),
}));

vi.mock('../../../services/apiClient', () => ({ apiRequest: mocks.apiRequest }));

import { socialPlatformService } from '../../../services/socialPlatformService';

describe('socialPlatformService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    mocks.collection.mockImplementation((db, name) => ({ name }));
    mocks.query.mockImplementation((collection, ...constraints) => ({ collection, constraints }));
    mocks.orderBy.mockImplementation((...args) => ({ type: 'orderBy', args }));
    mocks.limit.mockImplementation((value) => ({ type: 'limit', value }));
    mocks.where.mockImplementation((field, operator, value) => ({ type: 'where', field, operator, value }));
    mocks.getDocs.mockResolvedValue({ empty: true, docs: [] });
    mocks.onSnapshot.mockImplementation(() => vi.fn());
    mocks.apiRequest.mockResolvedValue({ id: 'post-1', body: 'A comment' });
  });

  it('returns an empty feed when Firestore has no social posts', async () => {
    const result = await socialPlatformService.getFeed({ displayName: 'Admin User' });

    expect(result.success).toBe(true);
    expect(result.data).toEqual([]);
  });

  it('creates posts through the authenticated backend while retaining live Firestore feeds', async () => {
    const result = await socialPlatformService.createPost({
      content: 'A real update', visibility: 'public', tags: ['career'], files: [],
    }, { userType: 'student' });

    expect(mocks.apiRequest).toHaveBeenCalledWith('/api/social/posts', expect.objectContaining({ method: 'POST' }));
    expect(result).toEqual({ success: true, data: { id: 'post-1', body: 'A comment' } });
  });

  it('routes post likes, comments, and shares through authenticated backend endpoints', async () => {
    await socialPlatformService.toggleLike('post-1', false);
    const comment = await socialPlatformService.addComment('post-1', ' A comment ', {});
    const share = await socialPlatformService.sharePost('post-1');

    expect(mocks.apiRequest).toHaveBeenNthCalledWith(1, '/api/social/posts/post-1/like', { method: 'POST' });
    expect(mocks.apiRequest).toHaveBeenNthCalledWith(2, '/api/social/posts/post-1/comments', {
      method: 'POST', body: { body: 'A comment' },
    });
    expect(mocks.apiRequest).toHaveBeenNthCalledWith(3, '/api/social/posts/post-1/share', { method: 'POST' });
    expect(comment).toEqual({ success: true, data: { id: 'post-1', body: 'A comment' } });
    expect(share.success).toBe(true);
  });

  it('polls the authenticated backend feed and clears the timer on unsubscribe', () => {
    const setIntervalSpy = vi.spyOn(globalThis, 'setInterval').mockReturnValue(42);
    const clearIntervalSpy = vi.spyOn(globalThis, 'clearInterval');
    const unsubscribe = socialPlatformService.subscribeToFeed(vi.fn(), vi.fn());

    expect(mocks.apiRequest).toHaveBeenCalledWith('/api/social/feed?limit=12');
    expect(setIntervalSpy).toHaveBeenCalledWith(expect.any(Function), 30000);
    unsubscribe();
    expect(clearIntervalSpy).toHaveBeenCalledWith(42);
  });
});
