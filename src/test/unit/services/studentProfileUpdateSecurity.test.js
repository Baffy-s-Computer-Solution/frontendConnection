import { afterEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  auth: { currentUser: { uid: 'student-1' } }, db: {}, doc: vi.fn(() => ({ ref: 'student-profile' })),
  getDoc: vi.fn(), updateDoc: vi.fn(), serverTimestamp: vi.fn(() => 'server-time'),
}));
vi.mock('firebase/firestore', () => ({
  addDoc: vi.fn(), collection: vi.fn(), deleteDoc: vi.fn(), doc: mocks.doc, getDoc: mocks.getDoc,
  getDocs: vi.fn(), limit: vi.fn(), onSnapshot: vi.fn(), orderBy: vi.fn(), query: vi.fn(),
  runTransaction: vi.fn(), serverTimestamp: mocks.serverTimestamp, setDoc: vi.fn(),
  Timestamp: { now: vi.fn() }, updateDoc: mocks.updateDoc, where: vi.fn(), writeBatch: vi.fn(),
}));
vi.mock('../../../config/firebase', () => ({ auth: mocks.auth, db: mocks.db }));
vi.mock('../../../services/apiClient', () => ({ apiRequest: vi.fn() }));
vi.mock('../../../services/supabaseMediaService', () => ({ supabaseMediaService: {} }));
import { updateStudentProfile } from '../../../services/studentServices';

describe('student profile update authorization and field allowlist', () => {
  afterEach(() => { vi.clearAllMocks(); });
  it('refuses cross-account profile updates before reading or writing Firestore', async () => {
    await expect(updateStudentProfile('student-2', { bio: 'Hello world' })).resolves.toMatchObject({ success: false });
    expect(mocks.getDoc).not.toHaveBeenCalled();
    expect(mocks.updateDoc).not.toHaveBeenCalled();
  });

  it('strips identity and privilege fields from self-service changes', async () => {
    mocks.getDoc.mockResolvedValue({ exists: () => true, data: () => ({ fullName: 'Old Name', skills: [] }) });
    await expect(updateStudentProfile('student-1', {
      fullName: 'New Name', role: 'admin', status: 'approved', email: 'attacker@example.org', uid: 'other-user',
    })).resolves.toEqual({ success: true });
    const writes = mocks.updateDoc.mock.calls.map(([, update]) => update);
    expect(writes.length).toBeGreaterThan(0);
    for (const update of writes) {
      expect(update).not.toHaveProperty('role');
      expect(update).not.toHaveProperty('status');
      expect(update).not.toHaveProperty('email');
      expect(update).not.toHaveProperty('uid');
    }
    expect(writes[0].fullName).toBe('New Name');
  });
});
