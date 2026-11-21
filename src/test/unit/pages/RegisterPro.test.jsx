import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import RegisterPro from '../../../pages/auth/RegisterPro';

vi.mock('react-router-dom', async (importOriginal) => await importOriginal());

vi.mock('../../../context/AuthContext', () => ({
  useAuth: () => ({ loginWithGoogle: vi.fn(), register: vi.fn() }),
}));

const renderAtRegistrationPath = (path) => {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <RegisterPro />
    </MemoryRouter>
  );
};

describe('RegisterPro role selection', () => {
  it.each(['student', 'mentor', 'company'])('preselects the public %s role', (role) => {
    renderAtRegistrationPath(`/register?role=${role}`);

    expect(screen.getByText(`Step 2 of 3: ${role[0].toUpperCase()}${role.slice(1)} account`)).toBeInTheDocument();
    expect(screen.queryByText('Select your account type')).not.toBeInTheDocument();
  });

  it('does not allow an unlisted role to skip role selection', () => {
    renderAtRegistrationPath('/register?role=entrepreneur');

    expect(screen.getByText('Select your account type')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /entrepreneur/i })).not.toBeInTheDocument();
  });

  it('collects mentor expertise as part of the final signup step', () => {
    renderAtRegistrationPath('/register?role=mentor');

    fireEvent.change(screen.getByLabelText('Full Name'), { target: { value: 'Mentor Example' } });
    fireEvent.change(screen.getByLabelText('Email Address'), { target: { value: 'mentor@example.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'Strong123' } });
    fireEvent.change(screen.getByLabelText('Confirm Password'), { target: { value: 'Strong123' } });
    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));

    expect(screen.getByLabelText('Area of expertise')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '3');
  });
});
