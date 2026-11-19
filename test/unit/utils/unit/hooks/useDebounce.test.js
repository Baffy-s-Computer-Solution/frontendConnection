// frontend/src/test/unit/hooks/useDebounce.test.js
// ============================================================
// Unit Tests: useDebounce Hook
// ============================================================
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDebounce } from '../../src/hooks/useDebounce';

describe('useDebounce Hook', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should return initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('initial', 500));
    expect(result.current).toBe('initial');
  });

  it('should debounce value changes', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 500 } }
    );

    rerender({ value: 'updated', delay: 500 });
    expect(result.current).toBe('initial');

    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(result.current).toBe('updated');
  });

  it('should cancel previous timeout on rapid changes', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: 'a' } }
    );

    rerender({ value: 'ab' });
    act(() => vi.advanceTimersByTime(100));
    rerender({ value: 'abc' });
    act(() => vi.advanceTimersByTime(100));
    rerender({ value: 'abcd' });
    act(() => vi.advanceTimersByTime(300));

    expect(result.current).toBe('abcd');
  });

  it('should handle delay changes', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 500 } }
    );

    rerender({ value: 'updated', delay: 1000 });
    act(() => vi.advanceTimersByTime(500));
    expect(result.current).toBe('initial');

    act(() => vi.advanceTimersByTime(500));
    expect(result.current).toBe('updated');
  });

  it('should work with different value types', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 100),
      { initialProps: { value: { id: 1 } } }
    );

    const newObj = { id: 2 };
    rerender({ value: newObj });
    act(() => vi.advanceTimersByTime(100));
    expect(result.current).toEqual(newObj);
  });

  it('should cleanup on unmount', () => {
    const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');
    const { unmount } = renderHook(() => useDebounce('value', 500));
    unmount();
    expect(clearTimeoutSpy).toHaveBeenCalled();
  });
});