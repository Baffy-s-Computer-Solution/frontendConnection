import { describe, expect, it } from 'vitest';
import { formatCurrency, formatFileSize, formatOrdinal, maskEmail } from '../../../utils/formatters';

describe('display formatting boundaries', () => {
  it('formats Lesotho currency and invalid numeric input predictably', () => {
    expect(formatCurrency(0)).toBe('LSL 0');
    expect(formatCurrency(null)).toBe('LSL 0');
    expect(formatCurrency(1234.5)).toContain('LSL ');
  });
  it('formats ordinal exceptions, file sizes, and masks email', () => {
    expect(formatOrdinal(11)).toBe('11th');
    expect(formatOrdinal(22)).toBe('22nd');
    expect(formatFileSize(0)).toBe('0 Bytes');
    expect(maskEmail('person@example.org')).toBe('p****n@example.org');
  });
});
