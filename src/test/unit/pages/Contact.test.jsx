import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Contact from '../../../pages/common/Contact';

describe('Contact page', () => {
  it('provides working email, phone, WhatsApp, and developer links', () => {
    render(<Contact />);

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

  it('prepares an email draft without claiming that the message was sent', async () => {
    const user = userEvent.setup();
    render(<Contact />);

    await user.type(screen.getByLabelText('Your name'), 'Lerato');
    await user.type(screen.getByLabelText('Your email'), 'lerato@example.com');
    await user.type(screen.getByLabelText('Subject'), 'Mentorship question');
    await user.type(screen.getByLabelText('Message'), 'I would like to ask about mentoring.');
    await user.click(screen.getByRole('button', { name: /prepare email/i }));

    expect(screen.getByRole('status')).toHaveTextContent(
      'Your email draft is ready. Open it to review and send your message.'
    );
    expect(screen.queryByText(/message sent/i)).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: /open email draft/i })).toHaveAttribute(
      'href',
      expect.stringContaining('mailto:khoalibafokeng@gmail.com')
    );
  });
});
