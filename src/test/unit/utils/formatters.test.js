import { describe, expect, it } from 'vitest';
import { formatLocation } from '../../../utils/formatters';

describe('formatLocation', () => {
  it('formats structured addresses without returning an object to render', () => {
    expect(formatLocation({
      country: 'Lesotho',
      zipCode: '100',
      street: 'Kingsway',
      city: 'Maseru',
      state: 'Maseru District',
    })).toBe('Kingsway, Maseru, Maseru District, 100, Lesotho');
  });

  it('preserves string locations and uses a fallback for missing values', () => {
    expect(formatLocation('Maseru')).toBe('Maseru');
    expect(formatLocation(null, 'Location not specified')).toBe('Location not specified');
  });
});
