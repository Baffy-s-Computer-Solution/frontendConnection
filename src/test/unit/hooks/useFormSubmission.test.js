import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useForm } from '../../../hooks/useForm';

const initialValues = { name: '' };
const validationSchema = { name: { required: true, min: 2 } };

describe('useForm submission', () => {
  it('does not submit invalid values and submits valid values once', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() => useForm(
      initialValues,
      validationSchema,
      onSubmit
    ));
    await act(async () => result.current.handleSubmit({ preventDefault: vi.fn() }));
    expect(onSubmit).not.toHaveBeenCalled();
    expect(result.current.touched.name).toBe(true);
    act(() => result.current.setFieldValue('name', 'Mpho'));
    await act(async () => result.current.handleSubmit({ preventDefault: vi.fn() }));
    expect(onSubmit).toHaveBeenCalledOnce();
    expect(onSubmit.mock.calls[0][0]).toEqual({ name: 'Mpho' });
    expect(result.current.isSubmitting).toBe(false);
  });
});
