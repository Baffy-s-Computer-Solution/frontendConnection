import { describe, expect, it } from 'vitest';
import { arrayUtils } from '../../../utils/arrayUtils';

describe('array operations', () => {
  it('groups and sorts without mutating the input', () => {
    const rows = [{ team: 'A', score: 2 }, { team: 'B', score: 1 }, { team: 'A', score: 3 }];
    expect(arrayUtils.groupBy(rows, 'team').A).toHaveLength(2);
    expect(arrayUtils.sortBy(rows, 'score').map((row) => row.score)).toEqual([1, 2, 3]);
    expect(rows[0].score).toBe(2);
  });
  it('partitions by predicate and removes duplicate keys stably', () => {
    expect(arrayUtils.partition([1, 2, 3], (value) => value % 2 === 1)).toEqual([[1, 3], [2]]);
    expect(arrayUtils.uniqueBy([{ id: 1 }, { id: 1 }, { id: 2 }], 'id')).toEqual([{ id: 1 }, { id: 2 }]);
  });
});
