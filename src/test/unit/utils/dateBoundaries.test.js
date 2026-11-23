import { describe, expect, it } from 'vitest';
import { addDays, daysBetween, startOfWeek, endOfMonth } from '../../../utils/dateUtils';

describe('date calculations', () => {
  it('adds calendar days without mutating the source date', () => {
    const source = new Date(2024, 1, 28, 12);
    const result = addDays(source, 1);
    expect(result.getFullYear()).toBe(2024);
    expect(result.getMonth()).toBe(1);
    expect(result.getDate()).toBe(29);
    expect(source.getDate()).toBe(28);
  });
  it('uses Monday as week start and respects month-end boundaries', () => {
    expect(startOfWeek(new Date(2024, 5, 9)).getDay()).toBe(1);
    expect(endOfMonth(new Date(2024, 1, 10)).getDate()).toBe(29);
    expect(daysBetween('2024-01-01', '2024-01-03')).toBe(2);
  });
});
