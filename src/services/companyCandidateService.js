import { apiRequest } from './apiClient';

export const getCompanyCandidateProfile = (candidateUid) => {
  if (!candidateUid || typeof candidateUid !== 'string') {
    return Promise.reject(new Error('A valid candidate ID is required.'));
  }
  return apiRequest(`/api/company/candidates/${encodeURIComponent(candidateUid)}/profile`);
};
