import { render, screen } from '@testing-library/react';
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
  it('preselects a public role supplied by the landing page', () => {
    renderAtRegistrationPath('/register?role=entrepreneur');

    expect(screen.getByText('Step 2 of 3: Entrepreneur account')).toBeInTheDocument();
    expect(screen.queryByText('Select your account type')).not.toBeInTheDocument();
  });

  it('does not allow an unlisted role to skip role selection', () => {
    renderAtRegistrationPath('/register?role=admin');

    expect(screen.getByText('Select your account type')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /admin/i })).not.toBeInTheDocument();
  });
});
