import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import Contact from '../../../pages/common/Contact';

vi.mock('../../../context/AuthContext', () => ({
  useAuth: vi.fn(() => ({ currentUser: null, userProfile: null })),
}));

import { useAuth } from '../../../context/AuthContext';

const renderContact = () => render(<Contact />, { wrapper: MemoryRouter });

describe('Contact page', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
    useAuth.mockReturnValue({ currentUser: null, userProfile: null });
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it('provides working email, phone, WhatsApp, and developer links', () => {
    renderContact();

    expect(screen.getByRole('link', { name: /khoalibafokeng@gmail\.com/i })).toHaveAttribute(
      'href',
      'mailto:khoalibafokeng@gmail.com'
    );
    expect(screen.getByRole('link', { name: /\+266 632 10786/ })).toHaveAttribute(
      'href',
      'tel:+26663210786'
    );
    expect(screen.getAllByRole('link', { name: /whatsapp/i })[0]).toHaveAttribute(
      'href',
      expect.stringContaining('https://wa.me/26663210786')
    );
    expect(screen.getByRole('link', { name: /visit baffy.s computer solutions/i })).toHaveAttribute(
      'href',
      'https://baffy.vercel.app/'
    );
  });

  it('sends the form to the support endpoint and reports the confirmed result', async () => {
    const user = userEvent.setup();
    renderContact();
    fetch.mockResolvedValue({ ok: true, json: async () => ({ success: true }) });

    await user.type(screen.getByLabelText('Your name'), 'Lerato');
    await user.type(screen.getByLabelText('Your email'), 'lerato@example.com');
    await user.type(screen.getByLabelText('Subject'), 'Mentorship question');
    await user.type(screen.getByLabelText('Message'), 'I would like to ask about mentoring.');
    await user.click(screen.getByRole('button', { name: /send message/i }));

    expect(await screen.findByText(/message was sent successfully/i)).toBeInTheDocument();
    expect(fetch).toHaveBeenCalledWith(
      expect.stringMatching(/\/api\/contact$/),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          name: 'Lerato',
          email: 'lerato@example.com',
          subject: 'Mentorship question',
          message: 'I would like to ask about mentoring.',
        }),
      })
    );
    expect(screen.queryByRole('link', { name: /open email draft/i })).not.toBeInTheDocument();
  });

  it('shows a failure instead of claiming delivery when the backend rejects the message', async () => {
    const user = userEvent.setup();
    renderContact();
    fetch.mockResolvedValue({ ok: false, json: async () => ({ success: false, message: 'Email delivery is unavailable.' }) });
    await user.type(screen.getByLabelText('Your name'), 'Lerato');
    await user.type(screen.getByLabelText('Your email'), 'lerato@example.com');
    await user.type(screen.getByLabelText('Subject'), 'Mentorship question');
    await user.type(screen.getByLabelText('Message'), 'I would like to ask about mentoring.');
    await user.click(screen.getByRole('button', { name: /send message/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Email delivery is unavailable.');
    expect(screen.queryByText(/message was sent successfully/i)).not.toBeInTheDocument();
  });
});
