import { describe, expect, it } from 'vitest';
import { getDashboardPathByUserType, normalizeUserType } from '../../../utils/authRoleUtils';

describe('role to dashboard mapping', () => {
  it.each([
    ['super_admin', '/admin/dashboard'], ['company_staff', '/company/teams'],
    ['mentor', '/mentor/dashboard'], ['institute', '/institute/dashboard'],
  ])('maps %s to its role dashboard', (role, path) => {
    expect(getDashboardPathByUserType(role)).toBe(path);
  });
  it('normalizes aliases and safely falls back for unknown roles', () => {
    expect(normalizeUserType('  Employer ')).toBe('company');
    expect(getDashboardPathByUserType('unknown-role')).toBe('/student/dashboard');
  });
});
