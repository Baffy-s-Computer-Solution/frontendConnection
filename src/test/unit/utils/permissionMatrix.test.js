import { describe, expect, it } from 'vitest';
import { permissions } from '../../../utils/permissions';
import { PERMISSIONS } from '../../../utils/constants';

describe('frontend permission matrix', () => {
  it('grants expected role capabilities and denies cross-role operations', () => {
    expect(permissions.hasPermission({ role: 'student' }, PERMISSIONS.APPLY_JOB)).toBe(true);
    expect(permissions.hasPermission({ role: 'student' }, PERMISSIONS.DELETE_USER)).toBe(false);
    expect(permissions.hasPermission({ role: 'company' }, PERMISSIONS.CREATE_JOB)).toBe(true);
    expect(permissions.hasPermission({ role: 'company' }, PERMISSIONS.APPLY_JOB)).toBe(false);
  });
  it('fails closed for missing identity and handles all/any checks', () => {
    expect(permissions.hasPermission(null, PERMISSIONS.READ_USER)).toBe(false);
    expect(permissions.hasAnyPermission({ role: 'mentor' }, [PERMISSIONS.READ_USER, PERMISSIONS.DELETE_USER])).toBe(true);
    expect(permissions.hasAllPermissions({ role: 'mentor' }, [PERMISSIONS.READ_USER, PERMISSIONS.DELETE_USER])).toBe(false);
  });
});
