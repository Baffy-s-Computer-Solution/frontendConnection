// frontend/src/test/unit/utils/formatters.test.js
// ============================================================
// Unit Tests: Formatter Utilities
// ============================================================
import { describe, it, expect } from 'vitest';
import {
  formatCurrency,
  formatDate,
  formatRelativeTime,
  formatNumber,
  formatPercentage,
  formatPhoneNumber,
  formatName,
  truncateText,
  formatFileSize,
  capitalize,
  titleCase,
  slugify,
} from '../../src/utils/formatters';

describe('Formatter Utilities', () => {
  describe('formatCurrency', () => {
    it('should format USD currency', () => {
      expect(formatCurrency(1000)).toBe('$1,000.00');
      expect(formatCurrency(1234.56)).toBe('$1,234.56');
      expect(formatCurrency(0)).toBe('$0.00');
    });

    it('should format different currencies', () => {
      expect(formatCurrency(1000, 'EUR')).toContain('1,000');
      expect(formatCurrency(1000, 'GBP')).toContain('1,000');
    });

    it('should handle string numbers', () => {
      expect(formatCurrency('1500')).toBe('$1,500.00');
    });

    it('should handle invalid input', () => {
      expect(formatCurrency(null)).toBe('$0.00');
      expect(formatCurrency(undefined)).toBe('$0.00');
      expect(formatCurrency('abc')).toBe('$0.00');
    });
  });

  describe('formatDate', () => {
    it('should format dates', () => {
      const date = new Date('2024-01-15T12:00:00Z');
      expect(formatDate(date)).toMatch(/Jan/);
      expect(formatDate(date, 'yyyy-MM-dd')).toBe('2024-01-15');
    });

    it('should handle string dates', () => {
      expect(formatDate('2024-01-15')).toMatch(/Jan/);
    });

    it('should handle invalid dates', () => {
      expect(formatDate(null)).toBe('');
      expect(formatDate('invalid')).toBe('');
    });
  });

  describe('formatRelativeTime', () => {
    it('should format recent times', () => {
      const now = new Date();
      const oneMinuteAgo = new Date(now.getTime() - 60 * 1000);
      expect(formatRelativeTime(oneMinuteAgo)).toContain('minute');
    });

    it('should format hours ago', () => {
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
      expect(formatRelativeTime(twoHoursAgo)).toContain('hour');
    });

    it('should format days ago', () => {
      const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
      expect(formatRelativeTime(threeDaysAgo)).toContain('day');
    });
  });

  describe('formatNumber', () => {
    it('should format numbers with commas', () => {
      expect(formatNumber(1000)).toBe('1,000');
      expect(formatNumber(1000000)).toBe('1,000,000');
    });

    it('should handle decimals', () => {
      expect(formatNumber(1234.5678, 2)).toBe('1,234.57');
    });
  });

  describe('formatPercentage', () => {
    it('should format percentages', () => {
      expect(formatPercentage(0.5)).toBe('50.0%');
      expect(formatPercentage(0.123, 2)).toBe('12.30%');
      expect(formatPercentage(1)).toBe('100.0%');
    });
  });

  describe('formatPhoneNumber', () => {
    it('should format US phone numbers', () => {
      expect(formatPhoneNumber('1234567890')).toBe('(123) 456-7890');
      expect(formatPhoneNumber('123-456-7890')).toBe('(123) 456-7890');
    });
  });

  describe('formatName', () => {
    it('should format names properly', () => {
      expect(formatName('john doe')).toBe('John Doe');
      expect(formatName('JOHN DOE')).toBe('John Doe');
      expect(formatName('  john   doe  ')).toBe('John Doe');
    });
  });

  describe('truncateText', () => {
    it('should truncate long text', () => {
      expect(truncateText('This is a long text', 10)).toBe('This is a...');
      expect(truncateText('Short', 10)).toBe('Short');
    });

    it('should use custom suffix', () => {
      expect(truncateText('This is long', 7, '…')).toBe('This is…');
    });
  });

  describe('formatFileSize', () => {
    it('should format bytes', () => {
      expect(formatFileSize(0)).toBe('0 B');
      expect(formatFileSize(1024)).toBe('1 KB');
      expect(formatFileSize(1024 * 1024)).toBe('1 MB');
      expect(formatFileSize(1024 * 1024 * 1024)).toBe('1 GB');
    });
  });

  describe('capitalize', () => {
    it('should capitalize first letter', () => {
      expect(capitalize('hello')).toBe('Hello');
      expect(capitalize('HELLO')).toBe('HELLO');
      expect(capitalize('')).toBe('');
    });
  });

  describe('titleCase', () => {
    it('should title case strings', () => {
      expect(titleCase('hello world')).toBe('Hello World');
      expect(titleCase('the quick brown fox')).toBe('The Quick Brown Fox');
    });
  });

  describe('slugify', () => {
    it('should create URL-friendly slugs', () => {
      expect(slugify('Hello World')).toBe('hello-world');
      expect(slugify('This is a Test!')).toBe('this-is-a-test');
      expect(slugify('  Multiple   Spaces  ')).toBe('multiple-spaces');
    });
  });
});