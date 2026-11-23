import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useLocalStorage } from '../../../hooks/useLocalStorage';

describe('useLocalStorage persistence', () => {
  it('loads defaults, persists functional updates, and removes stored values', () => {
    const { result } = renderHook(() => useLocalStorage('preferences', { theme: 'light' }));
    expect(result.current[0]).toEqual({ theme: 'light' });
    act(() => result.current[1]((previous) => ({ ...previous, theme: 'dark' })));
    expect(result.current[0]).toEqual({ theme: 'dark' });
    expect(JSON.parse(window.localStorage.getItem('preferences'))).toEqual({ theme: 'dark' });
    act(() => result.current[2]());
    expect(result.current[0]).toEqual({ theme: 'light' });
  });
});
