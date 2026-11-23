import { afterEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  collection: vi.fn(() => 'jobs'), where: vi.fn((...args) => args), orderBy: vi.fn((...args) => args),
  query: vi.fn((...args) => args), getDocs: vi.fn(), db: {},
}));
vi.mock('firebase/firestore', () => ({
  addDoc: vi.fn(), collection: mocks.collection, deleteDoc: vi.fn(), doc: vi.fn(), getDoc: vi.fn(),
  getDocs: mocks.getDocs, orderBy: mocks.orderBy, query: mocks.query, serverTimestamp: vi.fn(),
  Timestamp: { fromDate: (date) => date }, updateDoc: vi.fn(), where: mocks.where,
}));
vi.mock('../../../config/firebase', () => ({ db: mocks.db }));
import jobService from '../../../services/jobService';

describe('job listing integration with Firestore snapshots', () => {
  afterEach(() => { vi.clearAllMocks(); vi.restoreAllMocks(); });
  it('normalizes Firestore records and applies type, location, and search filters', async () => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
    mocks.getDocs.mockResolvedValue({ forEach: (callback) => [
      { id: '1', data: () => ({ status: 'active', type: 'full-time', location: 'Maseru', title: 'Developer', createdAt: '2025-01-01' }) },
      { id: '2', data: () => ({ status: 'active', type: 'internship', location: 'Leribe', title: 'Analyst' }) },
    ].forEach(callback) });
    const result = await jobService.getActiveJobs({ type: 'full-time', location: 'maseru', search: 'develop' });
    expect(result.success).toBe(true);
    expect(result.data.map((job) => job.id)).toEqual(['1']);
    expect(result.data[0].createdAt).toBeInstanceOf(Date);
    expect(mocks.where).toHaveBeenCalledWith('status', '==', 'active');
  });
});
