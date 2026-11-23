import { describe, expect, it } from 'vitest';
import { validation } from '../../../utils/validation';

describe('validation utility', () => {
  it('accepts normal email addresses and rejects missing domain separators', () => {
    expect(validation.email('person@example.org').isValid).toBe(true);
    expect(validation.email('person@example').isValid).toBe(false);
    expect(validation.email('not-an-email').isValid).toBe(false);
  });

  it('reports weak passwords and accepts a sufficiently strong password', () => {
    expect(validation.password('weak').isValid).toBe(false);
    expect(validation.password('CareerPass9!').isValid).toBe(true);
    expect(validation.password('Caaaaeer9!').isValid).toBe(false);
    expect(validation.password(null).isValid).toBe(false);
  });
});
