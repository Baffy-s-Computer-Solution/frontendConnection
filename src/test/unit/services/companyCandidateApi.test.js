import { afterEach, describe, expect, it, vi } from 'vitest';

const api = vi.hoisted(() => ({ apiRequest: vi.fn() }));
vi.mock('../../../services/apiClient', () => api);
import { getCompanyCandidateProfile } from '../../../services/companyCandidateService';

describe('company candidate profile API adapter', () => {
  afterEach(() => vi.clearAllMocks());
  it('validates identifiers and URL-encodes candidate IDs before requesting the scoped endpoint', async () => {
    await expect(getCompanyCandidateProfile('')).rejects.toThrow('A valid candidate ID is required.');
    api.apiRequest.mockResolvedValue({ id: 'candidate/1' });
    await expect(getCompanyCandidateProfile('candidate/1')).resolves.toEqual({ id: 'candidate/1' });
    expect(api.apiRequest).toHaveBeenCalledWith('/api/company/candidates/candidate%2F1/profile');
  });
});
