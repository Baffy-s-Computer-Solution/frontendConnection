import { describe, expect, it } from 'vitest';
import { addDays, daysBetween, endOfMonth, endOfWeek, startOfDay, startOfWeek, toISOString } from '../../../utils/dateUtils';

describe('date utilities', () => {
  it('adds calendar days and counts whole date differences', () => {
    const source = new Date(2024, 1, 28, 12);
    expect(addDays(source, 1).getDate()).toBe(29);
    expect(source.getDate()).toBe(28);
    expect(daysBetween('2024-01-01', '2024-01-10')).toBe(9);
    expect(daysBetween('2024-01-10', '2024-01-01')).toBe(9);
  });

  it('calculates Monday-to-Sunday weeks and leap-month boundaries', () => {
    const date = new Date(2024, 5, 15, 15, 30);
    expect(startOfWeek(date).getDay()).toBe(1);
    expect(endOfWeek(date).getDay()).toBe(0);
    expect(endOfMonth(new Date(2024, 1, 2)).getDate()).toBe(29);
    expect(startOfDay(date).getHours()).toBe(0);
  });

  it('converts dates to ISO strings', () => {
    expect(toISOString('2024-01-01T00:00:00.000Z')).toBe('2024-01-01T00:00:00.000Z');
  });
});
