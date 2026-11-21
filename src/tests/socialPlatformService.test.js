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

vi.mock('../config/firebase', () => ({
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
  ref: vi.fn(),
  storage: {},
  getDownloadURL: vi.fn(),
  uploadBytes: vi.fn(),
  arrayRemove: vi.fn(),
  arrayUnion: vi.fn(),
  increment: vi.fn(),
}));

vi.mock('../services/apiClient', () => ({ apiRequest: mocks.apiRequest }));

import { socialPlatformService } from '../services/socialPlatformService';

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

  it('stops denied connection listeners and reports the permission issue once', () => {
    const onError = vi.fn();
    const stop = vi.fn();
    let connectionSnapshotCallback;
    mocks.onSnapshot.mockImplementation((query, onData, onSubscriptionError) => {
      if (query.collection.name === 'social_blocks') onData({ docs: [] });
      if (query.collection.name === 'social_connections') {
        connectionSnapshotCallback = onData;
        onData({ docs: [{ data: () => ({ userIds: ['user-1', 'user-2'] }) }] });
      }
      if (query.collection.name === 'social_posts' &&
          query.constraints.some((constraint) => constraint.field === 'authorId' && constraint.value === 'user-2')) {
        mocks.connectionErrorCallback = onSubscriptionError;
        return stop;
      }
      return vi.fn();
    });

    const unsubscribe = socialPlatformService.subscribeToFeed(vi.fn(), onError);
    mocks.connectionErrorCallback({ code: 'permission-denied' });

    expect(stop).toHaveBeenCalledOnce();
    expect(onError).toHaveBeenCalledOnce();

    connectionSnapshotCallback({ docs: [{ data: () => ({ userIds: ['user-1', 'user-2'] }) }] });
    expect(mocks.onSnapshot.mock.calls.filter(([query]) =>
      query.collection.name === 'social_posts' &&
      query.constraints.some((constraint) => constraint.field === 'authorId' && constraint.value === 'user-2')
    )).toHaveLength(1);

    unsubscribe();
  });
});
