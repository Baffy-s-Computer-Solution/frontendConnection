import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useForm } from '../../../hooks/useForm';

const initialValues = { email: '' };
const validationSchema = { email: (value) => (value.includes('@') ? '' : 'Enter a valid email') };

describe('useForm field validation', () => {
  it('validates fields on blur and updates touched/error state', () => {
    const { result } = renderHook(() => useForm(initialValues, validationSchema));
    act(() => result.current.handleBlur({ target: { name: 'email' } }));
    expect(result.current.touched.email).toBe(true);
    expect(result.current.errors.email).toBe('Enter a valid email');
    act(() => result.current.setFieldValue('email', 'person@example.org'));
    expect(result.current.errors.email).toBeFalsy();
  });
});
