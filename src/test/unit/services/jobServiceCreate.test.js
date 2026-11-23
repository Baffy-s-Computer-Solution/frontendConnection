import { afterEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ addDoc: vi.fn(), collection: vi.fn(() => 'jobs'), db: {}, serverTimestamp: vi.fn(() => 'server-time') }));
vi.mock('firebase/firestore', () => ({
  addDoc: mocks.addDoc, collection: mocks.collection, deleteDoc: vi.fn(), doc: vi.fn(), getDoc: vi.fn(),
  getDocs: vi.fn(), orderBy: vi.fn(), query: vi.fn(), serverTimestamp: mocks.serverTimestamp,
  Timestamp: { fromDate: (date) => ({ timestamp: date.toISOString() }) }, updateDoc: vi.fn(), where: vi.fn(),
}));
vi.mock('../../../config/firebase', () => ({ db: mocks.db }));
import jobService from '../../../services/jobService';

describe('job creation persistence', () => {
  afterEach(() => { vi.clearAllMocks(); vi.restoreAllMocks(); });
  it('stores jobs under the supplied company and initializes tracking fields', async () => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
    mocks.addDoc.mockResolvedValue({ id: 'job-1' });
    const result = await jobService.createJob({ title: 'Junior Developer', deadline: '2025-05-01' }, 'company-1', 'Example Ltd');
    expect(result).toEqual({ success: true, id: 'job-1' });
    expect(mocks.addDoc.mock.calls[0][1]).toMatchObject({
      companyId: 'company-1', companyName: 'Example Ltd', status: 'active', applicantsCount: 0, views: 0,
      deadline: { timestamp: '2025-05-01T00:00:00.000Z' },
    });
  });
});
