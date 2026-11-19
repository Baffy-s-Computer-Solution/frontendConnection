import { afterEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  collection: vi.fn((db, name) => ({ name })),
  limit: vi.fn((count) => ({ count })),
  onSnapshot: vi.fn(() => vi.fn()),
  query: vi.fn((source, ...constraints) => ({ source: source.name, constraints })),
  where: vi.fn((field, operator, value) => ({ field, operator, value })),
  auth: { currentUser: null },
  db: {},
}));

vi.mock('firebase/firestore', () => ({
  addDoc: vi.fn(),
  collection: mocks.collection,
  doc: vi.fn(),
  getDoc: vi.fn(),
  getDocs: vi.fn(),
  limit: mocks.limit,
  onSnapshot: mocks.onSnapshot,
  query: mocks.query,
  serverTimestamp: vi.fn(),
  updateDoc: vi.fn(),
  where: mocks.where,
  writeBatch: vi.fn(),
}));

vi.mock('../../../config/firebase', () => ({
  auth: mocks.auth,
  db: mocks.db,
}));

import { subscribeToStudentMentorshipData } from '../../../services/studentMentorshipService';

describe('subscribeToStudentMentorshipData', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('subscribes only to student-owned requests, mentorships, and sessions', () => {
    const stop = subscribeToStudentMentorshipData('student-123', vi.fn(), vi.fn());
    const queries = mocks.onSnapshot.mock.calls.map(([snapshotQuery]) => snapshotQuery);

    expect(queries).toHaveLength(3);
    expect(queries).toEqual(expect.arrayContaining([
      expect.objectContaining({
        source: 'mentorship_requests',
        constraints: expect.arrayContaining([
          expect.objectContaining({ field: 'studentId', value: 'student-123' }),
        ]),
      }),
      expect.objectContaining({
        source: 'mentorships',
        constraints: expect.arrayContaining([
          expect.objectContaining({ field: 'menteeId', value: 'student-123' }),
        ]),
      }),
      expect.objectContaining({
        source: 'mentorSessions',
        constraints: expect.arrayContaining([
          expect.objectContaining({ field: 'menteeId', value: 'student-123' }),
        ]),
      }),
    ]));
    expect(queries.some((item) => item.source === 'mentorship_requests'
      && item.constraints.some((constraint) => constraint.field === 'mentorId'))).toBe(false);

    const unsubscribeCallbacks = mocks.onSnapshot.mock.results.map(({ value }) => value);
    stop();
    unsubscribeCallbacks.forEach((unsubscribe) => expect(unsubscribe).toHaveBeenCalledOnce());
  });

  it('labels denied reads with the Firestore collection', () => {
    const onError = vi.fn();
    subscribeToStudentMentorshipData('student-123', vi.fn(), onError);
    const requestListenerError = mocks.onSnapshot.mock.calls[0][2];

    requestListenerError({ code: 'permission-denied', message: 'Missing or insufficient permissions.' });

    expect(onError).toHaveBeenCalledWith(expect.objectContaining({
      message: expect.stringContaining('mentorship_requests: Missing or insufficient permissions.'),
      code: 'permission-denied',
    }));
  });
});
