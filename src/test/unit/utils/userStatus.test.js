import { describe, expect, it } from 'vitest';

import { canonicalUserStatus, isPendingUserStatus } from '../../../utils/userStatus';

describe('user status normalization', () => {
  it.each(['pending', 'pending_approval', 'awaiting_approval', ' PENDING_APPROVAL '])(
    'treats %s as pending',
    (status) => {
      expect(canonicalUserStatus(status)).toBe('pending');
      expect(isPendingUserStatus(status)).toBe(true);
    },
  );

  it('does not classify terminal statuses as pending', () => {
    expect(isPendingUserStatus('active')).toBe(false);
    expect(isPendingUserStatus('rejected')).toBe(false);
    expect(isPendingUserStatus('deleted')).toBe(false);
  });
});
