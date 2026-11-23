import { describe, expect, it } from 'vitest';
import { canonicalUserStatus, isPendingUserStatus } from '../../../utils/userStatus';

describe('user account status normalization', () => {
  it.each(['pending', 'pending_approval', 'awaiting_approval', ' PENDING '])(
    'maps %s to the pending state', (status) => {
      expect(canonicalUserStatus(status)).toBe('pending');
      expect(isPendingUserStatus(status)).toBe(true);
    }
  );
  it('normalizes other statuses and handles missing values', () => {
    expect(canonicalUserStatus('Suspended')).toBe('suspended');
    expect(canonicalUserStatus(null)).toBe('');
    expect(isPendingUserStatus(undefined)).toBe(false);
  });
});
