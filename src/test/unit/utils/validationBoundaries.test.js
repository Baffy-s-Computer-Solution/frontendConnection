import { describe, expect, it } from 'vitest';
import { validators, validateNumberRange } from '../../../utils/validators';

describe('input validation boundaries', () => {
  it('accepts valid email and rejects malformed addresses', () => {
    expect(validators.email('person@example.org')).toBe(true);
    expect(validators.email('person@example')).toBe(false);
    expect(validators.email('person.example.org')).toBe(false);
  });
  it('handles required values and numeric range edges', () => {
    expect(validators.required('  ')).toBe(false);
    expect(validators.required(['item'])).toBe(true);
    expect(validateNumberRange('5', 5, 10)).toBe(true);
    expect(validateNumberRange('11', 5, 10)).toBe(false);
    expect(validateNumberRange('not-a-number', 0, 10)).toBe(false);
  });
});
