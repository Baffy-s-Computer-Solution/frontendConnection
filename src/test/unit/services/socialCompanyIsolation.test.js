import { afterEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  auth: { currentUser: { uid: 'company-1', role: 'company' } }, db: {},
  getDocs: vi.fn(), writeBatch: vi.fn(), doc: vi.fn(), collection: vi.fn(),
}));
vi.mock('../../../config/firebase', () => ({
  auth: mocks.auth, db: mocks.db, addDoc: vi.fn(), collection: mocks.collection, deleteDoc: vi.fn(),
  doc: mocks.doc, getDoc: vi.fn(), getDocs: mocks.getDocs, limit: vi.fn(), onSnapshot: vi.fn(),
  query: vi.fn(), setDoc: vi.fn(), Timestamp: { now: vi.fn() }, updateDoc: vi.fn(), where: vi.fn(),
  writeBatch: mocks.writeBatch,
}));
vi.mock('../../../services/supabaseMediaService', () => ({ supabaseMediaService: {} }));
vi.mock('../../../services/apiClient', () => ({ apiRequest: vi.fn() }));
import socialPlatformService from '../../../services/socialPlatformService';

describe('social connection company isolation', () => {
  afterEach(() => vi.clearAllMocks());
  it('rejects company-to-person friend requests before any Firestore access', async () => {
    await expect(socialPlatformService.sendFriendRequest({ id: 'student-1', role: 'student' }, { role: 'company' }))
      .rejects.toThrow('Company profiles are followed, not added as friends.');
    expect(mocks.getDocs).not.toHaveBeenCalled();
    expect(mocks.writeBatch).not.toHaveBeenCalled();
  });
});
