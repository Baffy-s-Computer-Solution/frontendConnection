import { describe, expect, it } from 'vitest';
import { objectUtils } from '../../../utils/objectUtils';

describe('object operations', () => {
  it('reads nested values with a default for missing paths', () => {
    expect(objectUtils.get({ profile: { name: 'Mpho' } }, 'profile.name')).toBe('Mpho');
    expect(objectUtils.get({}, 'profile.name', 'unknown')).toBe('unknown');
  });
  it('deep-merges nested settings and does not mutate inputs', () => {
    const original = { profile: { name: 'Mpho' } };
    expect(objectUtils.deepMerge(original, { profile: { city: 'Maseru' } })).toEqual({
      profile: { name: 'Mpho', city: 'Maseru' },
    });
    expect(original).toEqual({ profile: { name: 'Mpho' } });
  });
});
