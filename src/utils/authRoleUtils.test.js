import { describe, expect, it } from 'vitest';

import { getDashboardPathByUserType, normalizeUserType } from './authRoleUtils';

describe('normalizeUserType', () => {
  it('normalizes common role variants to the canonical lowercase values', () => {
    expect(normalizeUserType('Student')).toBe('student');
    expect(normalizeUserType('Company / Employer')).toBe('company');
    expect(normalizeUserType('company_staff')).toBe('company_staff');
    expect(normalizeUserType('Youth Entrepreneur')).toBe('youth');
    expect(normalizeUserType('  ENTREPRENEUR  ')).toBe('entrepreneur');
    expect(normalizeUserType('Alumnus')).toBe('alumni');
    expect(normalizeUserType('Alumin')).toBe('alumni');
  });

  it('falls back to student for unsupported roles', () => {
    expect(normalizeUserType('unknown-role')).toBe('student');
    expect(normalizeUserType('')).toBe('student');
  });
});

describe('getDashboardPathByUserType', () => {
  it('returns the right dashboard for every supported role', () => {
    expect(getDashboardPathByUserType('student')).toBe('/student/dashboard');
    expect(getDashboardPathByUserType('company')).toBe('/company/dashboard');
    expect(getDashboardPathByUserType('company_staff')).toBe('/company/teams');
    expect(getDashboardPathByUserType('institute')).toBe('/institute/dashboard');
    expect(getDashboardPathByUserType('mentor')).toBe('/mentor/dashboard');
    expect(getDashboardPathByUserType('youth')).toBe('/youth/dashboard');
    expect(getDashboardPathByUserType('entrepreneur')).toBe('/entrepreneur/dashboard');
    expect(getDashboardPathByUserType('parent')).toBe('/parent/dashboard');
    expect(getDashboardPathByUserType('alumni')).toBe('/alumni/dashboard');
    expect(getDashboardPathByUserType('admin')).toBe('/admin/dashboard');
  });
});
