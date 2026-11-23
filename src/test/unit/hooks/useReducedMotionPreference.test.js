import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import useReducedMotion from '../../../hooks/useReducedMotion';

describe('reduced-motion preference hook', () => {
  afterEach(() => vi.restoreAllMocks());
  it('tracks the operating-system preference and removes its listener', () => {
    let change;
    const removeEventListener = vi.fn();
    vi.spyOn(window, 'matchMedia').mockReturnValue({
      matches: false,
      addEventListener: (_type, handler) => { change = handler; },
      removeEventListener,
    });
    const { result, unmount } = renderHook(() => useReducedMotion());
    expect(result.current).toBe(false);
    act(() => change({ matches: true }));
    expect(result.current).toBe(true);
    unmount();
    expect(removeEventListener).toHaveBeenCalledWith('change', change);
  });
});
