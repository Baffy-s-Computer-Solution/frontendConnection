// frontend/src/test/unit/utils/dateUtils.test.js
// ============================================================
// Unit Tests: Date Utilities
// ============================================================
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  getDaysBetween,
  addDays,
  isToday,
  isPast,
  isFuture,
  getStartOfDay,
  getEndOfDay,
  getWeekDays,
  getMonthDays,
  formatDuration,
  getTimeSlots,
  isSameDay,
  getAge,
} from '../../src/utils/dateUtils';

describe('Date Utilities', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-06-15T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('getDaysBetween', () => {
    it('should calculate days between dates', () => {
      const start = new Date('2024-01-01');
      const end = new Date('2024-01-10');
      expect(getDaysBetween(start, end)).toBe(9);
    });

    it('should handle same date', () => {
      const date = new Date('2024-01-01');
      expect(getDaysBetween(date, date)).toBe(0);
    });

    it('should handle negative ranges', () => {
      const start = new Date('2024-01-10');
      const end = new Date('2024-01-01');
      expect(getDaysBetween(start, end)).toBe(-9);
    });
  });

  describe('addDays', () => {
    it('should add days to a date', () => {
      const date = new Date('2024-01-01');
      const result = addDays(date, 5);
      expect(result.getDate()).toBe(6);
    });

    it('should subtract days with negative values', () => {
      const date = new Date('2024-01-10');
      const result = addDays(date, -5);
      expect(result.getDate()).toBe(5);
    });

    it('should not mutate original date', () => {
      const date = new Date('2024-01-01');
      addDays(date, 5);
      expect(date.getDate()).toBe(1);
    });
  });

  describe('isToday', () => {
    it('should return true for today', () => {
      expect(isToday(new Date())).toBe(true);
    });

    it('should return false for other days', () => {
      expect(isToday(new Date('2024-01-01'))).toBe(false);
    });
  });

  describe('isPast', () => {
    it('should return true for past dates', () => {
      expect(isPast(new Date('2024-01-01'))).toBe(true);
    });

    it('should return false for future dates', () => {
      expect(isPast(new Date('2025-01-01'))).toBe(false);
    });
  });

  describe('isFuture', () => {
    it('should return true for future dates', () => {
      expect(isFuture(new Date('2025-01-01'))).toBe(true);
    });

    it('should return false for past dates', () => {
      expect(isFuture(new Date('2024-01-01'))).toBe(false);
    });
  });

  describe('getStartOfDay', () => {
    it('should return start of day', () => {
      const date = new Date('2024-06-15T15:30:45');
      const start = getStartOfDay(date);
      expect(start.getHours()).toBe(0);
      expect(start.getMinutes()).toBe(0);
      expect(start.getSeconds()).toBe(0);
    });
  });

  describe('getEndOfDay', () => {
    it('should return end of day', () => {
      const date = new Date('2024-06-15T15:30:45');
      const end = getEndOfDay(date);
      expect(end.getHours()).toBe(23);
      expect(end.getMinutes()).toBe(59);
      expect(end.getSeconds()).toBe(59);
    });
  });

  describe('getWeekDays', () => {
    it('should return 7 days', () => {
      const days = getWeekDays(new Date('2024-06-15'));
      expect(days).toHaveLength(7);
    });

    it('should start on Monday by default', () => {
      const days = getWeekDays(new Date('2024-06-15'));
      expect(days[0].getDay()).toBe(1);
    });
  });

  describe('getMonthDays', () => {
    it('should return days in month', () => {
      const days = getMonthDays(2024, 1); // February 2024 (leap year)
      expect(days).toHaveLength(29);
    });

    it('should handle 30-day months', () => {
      const days = getMonthDays(2024, 3); // April
      expect(days).toHaveLength(30);
    });
  });

  describe('formatDuration', () => {
    it('should format minutes', () => {
      expect(formatDuration(30)).toBe('30 min');
    });

    it('should format hours', () => {
      expect(formatDuration(60)).toBe('1 hour');
      expect(formatDuration(120)).toBe('2 hours');
    });

    it('should format hours and minutes', () => {
      expect(formatDuration(90)).toBe('1 hour 30 min');
    });
  });

  describe('getTimeSlots', () => {
    it('should generate time slots', () => {
      const slots = getTimeSlots('09:00', '12:00', 60);
      expect(slots).toEqual(['09:00', '10:00', '11:00']);
    });

    it('should handle 30-minute intervals', () => {
      const slots = getTimeSlots('09:00', '10:00', 30);
      expect(slots).toEqual(['09:00', '09:30']);
    });
  });

  describe('isSameDay', () => {
    it('should return true for same day', () => {
      expect(
        isSameDay(new Date('2024-06-15T10:00'), new Date('2024-06-15T20:00'))
      ).toBe(true);
    });

    it('should return false for different days', () => {
      expect(
        isSameDay(new Date('2024-06-15'), new Date('2024-06-16'))
      ).toBe(false);
    });
  });

  describe('getAge', () => {
    it('should calculate age correctly', () => {
      const birthDate = new Date('2000-06-15');
      expect(getAge(birthDate)).toBe(24);
    });

    it('should handle birthday not yet occurred this year', () => {
      const birthDate = new Date('2000-12-15');
      expect(getAge(birthDate)).toBe(23);
    });
  });
});