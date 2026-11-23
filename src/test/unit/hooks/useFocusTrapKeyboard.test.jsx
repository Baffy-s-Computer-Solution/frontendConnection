import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import useFocusTrap from '../../../hooks/useFocusTrap';

describe('focus trap keyboard handling', () => {
  it('calls the escape handler only while the trap is active', () => {
    const container = document.createElement('div');
    const ref = { current: container };
    const onEscape = vi.fn();
    const { rerender, unmount } = renderHook(({ active }) => useFocusTrap(ref, active, onEscape), { initialProps: { active: true } });
    act(() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' })));
    expect(onEscape).toHaveBeenCalledOnce();
    rerender({ active: false });
    act(() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' })));
    expect(onEscape).toHaveBeenCalledOnce();
    unmount();
  });
});
