const PENDING_STATUSES = new Set(['pending', 'pending_approval', 'awaiting_approval']);

export const canonicalUserStatus = (status) => {
  const normalized = String(status || '').trim().toLowerCase();
  return PENDING_STATUSES.has(normalized) ? 'pending' : normalized;
};

export const isPendingUserStatus = (status) => canonicalUserStatus(status) === 'pending';
