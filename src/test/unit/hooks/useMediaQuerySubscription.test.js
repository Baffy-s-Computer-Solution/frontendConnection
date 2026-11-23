import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import useMediaQuery from '../../../hooks/useMediaQuery';

describe('useMediaQuery subscription', () => {
  afterEach(() => vi.restoreAllMocks());
  it('reflects initial match state and responds to media changes', () => {
    let change;
    const removeEventListener = vi.fn();
    vi.spyOn(window, 'matchMedia').mockReturnValue({
      matches: true,
      addEventListener: (_type, handler) => { change = handler; },
      removeEventListener,
    });
    const { result, unmount } = renderHook(() => useMediaQuery('(min-width: 900px)'));
    expect(result.current).toBe(true);
    act(() => change({ matches: false }));
    expect(result.current).toBe(false);
    unmount();
    expect(removeEventListener).toHaveBeenCalledWith('change', change);
  });
});
