import { describe, expect, it } from 'vitest';
import { checkRouteAccess } from '../../../utils/routingUtils';

describe('route access policy helper', () => {
  it('allows role-specific and shared routes for the documented roles', () => {
    expect(checkRouteAccess('student', '/student/profile')).toBe(true);
    expect(checkRouteAccess('company', '/company/jobs')).toBe(true);
    expect(checkRouteAccess('mentor', '/student/profile')).toBe(false);
    expect(checkRouteAccess('student', '/settings')).toBe(true);
  });
  it('denies unsupported route prefixes and confines admin pages', () => {
    expect(checkRouteAccess('student', '/admin/users')).toBe(false);
    expect(checkRouteAccess('admin', '/admin/users')).toBe(true);
    expect(checkRouteAccess('student', '/unmapped')).toBe(false);
  });
});
