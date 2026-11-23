import { describe, expect, it } from 'vitest';
import { formatCurrency, formatDate, formatRelativeTime, formatNumber, formatPercentage, formatPhoneNumber, truncateText, formatFileSize, capitalizeWords, getInitials } from '../../../../utils/formatters';

describe('formatter regression coverage', () => {
  it('formats currency, numbers, percentages, and file sizes', () => {
    expect(formatCurrency(1000)).toContain('LSL');
    expect(formatNumber(1000)).toBe('1,000');
    expect(formatPercentage(0.5, 1)).toBe('0.5%');
    expect(formatFileSize(1024)).toBe('1 KB');
  });

  it('formats dates and relative time for valid inputs', () => {
    expect(formatDate('2024-01-15')).toContain('Jan');
    expect(formatRelativeTime(new Date(Date.now() - 60_000))).toMatch(/minute/i);
  });

  it('formats phone, truncation, capitalization, and initials', () => {
    expect(formatPhoneNumber('+266 2234 5678')).toBe('+2 (662) 234-5678');
    expect(truncateText('This is a long text', 10)).toBe('This is a ...');
    expect(capitalizeWords('maseru lesotho')).toBe('Maseru Lesotho');
    expect(getInitials('Mpho K. Ndlovu')).toBe('MN');
  });
});
