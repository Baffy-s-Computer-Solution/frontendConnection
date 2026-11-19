// frontend/src/test/unit/hooks/usePagination.test.js
// ============================================================
// Unit Tests: usePagination Hook
// ============================================================
import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePagination } from '../../src/hooks/usePagination';

describe('usePagination Hook', () => {
  const items = Array.from({ length: 100 }, (_, i) => ({
    id: i + 1,
    name: `Item ${i + 1}`,
  }));

  it('should initialize with default values', () => {
    const { result } = renderHook(() => usePagination(items));
    expect(result.current.page).toBe(1);
    expect(result.current.pageSize).toBe(10);
    expect(result.current.totalPages).toBe(10);
    expect(result.current.items).toHaveLength(10);
  });

  it('should respect custom page size', () => {
    const { result } = renderHook(() =>
      usePagination(items, { initialPageSize: 25 })
    );
    expect(result.current.pageSize).toBe(25);
    expect(result.current.totalPages).toBe(4);
    expect(result.current.items).toHaveLength(25);
  });

  it('should navigate to next page', () => {
    const { result } = renderHook(() => usePagination(items));
    act(() => result.current.nextPage());
    expect(result.current.page).toBe(2);
    expect(result.current.items[0].id).toBe(11);
  });

  it('should navigate to previous page', () => {
    const { result } = renderHook(() =>
      usePagination(items, { initialPage: 3 })
    );
    act(() => result.current.previousPage());
    expect(result.current.page).toBe(2);
  });

  it('should not go below page 1', () => {
    const { result } = renderHook(() => usePagination(items));
    act(() => result.current.previousPage());
    expect(result.current.page).toBe(1);
  });

  it('should not exceed total pages', () => {
    const { result } = renderHook(() =>
      usePagination(items, { initialPage: 10 })
    );
    act(() => result.current.nextPage());
    expect(result.current.page).toBe(10);
  });

  it('should go to specific page', () => {
    const { result } = renderHook(() => usePagination(items));
    act(() => result.current.goToPage(5));
    expect(result.current.page).toBe(5);
    expect(result.current.items[0].id).toBe(41);
  });

  it('should handle out-of-range page numbers', () => {
    const { result } = renderHook(() => usePagination(items));
    act(() => result.current.goToPage(100));
    expect(result.current.page).toBe(10);

    act(() => result.current.goToPage(-5));
    expect(result.current.page).toBe(1);
  });

  it('should change page size', () => {
    const { result } = renderHook(() => usePagination(items));
    act(() => result.current.setPageSize(20));
    expect(result.current.pageSize).toBe(20);
    expect(result.current.page).toBe(1);
    expect(result.current.totalPages).toBe(5);
  });

  it('should provide correct pagination info', () => {
    const { result } = renderHook(() => usePagination(items));
    expect(result.current.startIndex).toBe(0);
    expect(result.current.endIndex).toBe(10);
    expect(result.current.hasPreviousPage).toBe(false);
    expect(result.current.hasNextPage).toBe(true);
  });

  it('should handle empty arrays', () => {
    const { result } = renderHook(() => usePagination([]));
    expect(result.current.totalPages).toBe(0);
    expect(result.current.items).toHaveLength(0);
    expect(result.current.hasNextPage).toBe(false);
    expect(result.current.hasPreviousPage).toBe(false);
  });

  it('should handle arrays smaller than page size', () => {
    const smallArray = items.slice(0, 5);
    const { result } = renderHook(() => usePagination(smallArray));
    expect(result.current.totalPages).toBe(1);
    expect(result.current.items).toHaveLength(5);
  });
});