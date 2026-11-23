import { afterEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ doc: vi.fn(() => ({ path: 'prefs' })), getDoc: vi.fn(), setDoc: vi.fn(), serverTimestamp: vi.fn(() => 'server-time'), auth: { currentUser: null }, db: {} }));
vi.mock('firebase/firestore', () => ({ doc: mocks.doc, getDoc: mocks.getDoc, setDoc: mocks.setDoc, onSnapshot: vi.fn(), serverTimestamp: mocks.serverTimestamp }));
vi.mock('../../../config/firebase', () => ({ auth: mocks.auth, db: mocks.db }));

import { getProfileCollectionForUserType, normalizeUserType, updateNotificationPreferences } from '../../../services/settingsService';

describe('notification preference settings service', () => {
  afterEach(() => vi.clearAllMocks());
  it('maps supported roles to scoped collections and defaults unknown roles to student', () => {
    expect(normalizeUserType('COMPANY')).toBe('company');
    expect(getProfileCollectionForUserType('mentor')).toBe('mentors');
    expect(getProfileCollectionForUserType('unexpected')).toBe('students');
  });
  it('merges category defaults and persists user ownership metadata', async () => {
    mocks.getDoc.mockResolvedValue({ exists: () => false });
    const result = await updateNotificationPreferences('student-1', { categories: { social: false } });
    const [, payload, options] = mocks.setDoc.mock.calls[0];
    expect(result.success).toBe(true);
    expect(payload.userId).toBe('student-1');
    expect(payload.categories.social).toBe(false);
    expect(payload.categories.security).toBe(true);
    expect(payload.createdAt).toBe('server-time');
    expect(options).toEqual({ merge: true });
  });
});
