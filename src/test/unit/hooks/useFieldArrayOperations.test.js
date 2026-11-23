import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useFieldArray } from '../../../hooks/useForm';

describe('useFieldArray operations', () => {
  it('supports append, indexed update, and removal', () => {
    const form = { values: { skills: ['JavaScript'] }, setFieldValue: vi.fn() };
    const { result } = renderHook(() => useFieldArray('skills', form));
    act(() => result.current.push('SQL'));
    expect(result.current.fields).toEqual(['JavaScript', 'SQL']);
    act(() => result.current.update(0, 'TypeScript'));
    expect(result.current.fields[0]).toBe('TypeScript');
    act(() => result.current.remove(1));
    expect(result.current.fields).toEqual(['TypeScript']);
  });
});
