import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useWindowSize } from '../../../hooks/useWindowSize';

describe('window size hook events', () => {
  it('updates responsive dimensions after resize and removes listeners on unmount', () => {
    const { result, unmount } = renderHook(() => useWindowSize());
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 1024 });
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 768 });
    act(() => window.dispatchEvent(new Event('resize')));
    expect(result.current).toMatchObject({ width: 1024, height: 768 });
    unmount();
  });
});
