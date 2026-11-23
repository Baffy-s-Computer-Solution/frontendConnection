import { describe, expect, it } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { usePagination } from '../../../hooks/usePagination';

describe('usePagination hook', () => {
  const data = Array.from({ length: 24 }, (_, index) => ({ id: index + 1 }));

  it('starts at page one and returns the first page slice', () => {
    const { result } = renderHook(() => usePagination({ data, initialRowsPerPage: 10 }));
    expect(result.current.page).toBe(1);
    expect(result.current.totalPages).toBe(3);
    expect(result.current.currentData.map((item) => item.id)).toEqual(Array.from({ length: 10 }, (_, i) => i + 1));
  });

  it('navigates within bounds and resets after page-size changes', () => {
    const { result } = renderHook(() => usePagination({ data, initialRowsPerPage: 10 }));
    act(() => result.current.nextPage());
    expect(result.current.page).toBe(2);
    act(() => result.current.goToPage(99));
    expect(result.current.page).toBe(2);
    act(() => result.current.changeRowsPerPage(5));
    expect(result.current.page).toBe(1);
    expect(result.current.totalPages).toBe(5);
  });
});
