import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockGetDocs = vi.fn();
const mockCollection = vi.fn();
const mockQuery = vi.fn();
const mockOrderBy = vi.fn();
const mockLimit = vi.fn();

vi.mock('../config/firebase', () => ({
  auth: { currentUser: { uid: 'user-1' } },
  db: {},
  collection: mockCollection,
  query: mockQuery,
  orderBy: mockOrderBy,
  limit: mockLimit,
  getDocs: mockGetDocs,
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

import { socialPlatformService } from '../services/socialPlatformService';

describe('socialPlatformService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    mockCollection.mockReturnValue({});
    mockQuery.mockReturnValue({});
    mockOrderBy.mockReturnValue({});
    mockLimit.mockReturnValue({});
    mockGetDocs.mockResolvedValue({ empty: true, docs: [] });
  });

  it('returns an empty feed when Firestore has no social posts', async () => {
    const result = await socialPlatformService.getFeed({ displayName: 'Admin User' });

    expect(result.success).toBe(true);
    expect(result.data).toEqual([]);
  });
});
