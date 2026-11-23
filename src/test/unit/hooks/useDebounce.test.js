import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useDebounce } from '../../../hooks/useDebounce';

describe('useDebounce hook', () => {
  afterEach(() => vi.useRealTimers());

  it('keeps the prior value until the delay elapses', () => {
    vi.useFakeTimers();
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 300), { initialProps: { value: 'initial' } });
    rerender({ value: 'updated' });
    expect(result.current).toBe('initial');
    act(() => vi.advanceTimersByTime(299));
    expect(result.current).toBe('initial');
    act(() => vi.advanceTimersByTime(1));
    expect(result.current).toBe('updated');
  });

  it('cancels pending work when a newer value arrives', () => {
    vi.useFakeTimers();
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 300), { initialProps: { value: 'a' } });
    rerender({ value: 'ab' });
    act(() => vi.advanceTimersByTime(200));
    rerender({ value: 'abc' });
    act(() => vi.advanceTimersByTime(300));
    expect(result.current).toBe('abc');
  });
});
