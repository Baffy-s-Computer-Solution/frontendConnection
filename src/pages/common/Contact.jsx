import { useEffect, useState } from 'react';
import {
  ArrowUpRight,
  Globe2,
  Home,
  Mail,
  MessageCircle,
  Phone,
  Send,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getDashboardPathByUserType, normalizeUserType } from '../../utils/authRoleUtils';
import API_BASE_URL from '../../services/apiConfig';

const CONTACT_EMAIL = 'khoalibafokeng@gmail.com';
const CONTACT_PHONE = '+266 632 10786';
const CONTACT_PHONE_LINK = '+26663210786';
const WHATSAPP_LINK =
  'https://wa.me/26663210786?text=Hello%2C%20I%20would%20like%20to%20know%20more%20about%20Career%20Connect%20Lesotho.';
const DEVELOPER_SITE = 'https://baffy.vercel.app/';

const CONTACT_OPTIONS = [
  {
    title: 'Email',
    detail: CONTACT_EMAIL,
    description: 'Open your email app and write to us.',
    href: `mailto:${CONTACT_EMAIL}`,
    icon: Mail,
  },
  {
    title: 'Call',
    detail: CONTACT_PHONE,
    description: 'Call the Career Connect team in Lesotho.',
    href: `tel:${CONTACT_PHONE_LINK}`,
    icon: Phone,
  },
  {
    title: 'WhatsApp',
    detail: 'Chat with us',
    description: 'Start a WhatsApp conversation with a prepared message.',
    href: WHATSAPP_LINK,
    icon: MessageCircle,
    external: true,
  },
  {
    title: 'Developer',
    detail: "Baffy's Computer Solutions",
    description: 'Visit the team developing this platform.',
    href: DEVELOPER_SITE,
    icon: Globe2,
    external: true,
  },
];

const Contact = () => {
  const { currentUser, userProfile } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState('');
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (!currentUser) return;
    const name = userProfile?.displayName || userProfile?.fullName || userProfile?.companyName || currentUser.displayName || '';
    const email = currentUser.email || userProfile?.email || '';
    setFormData((current) => ({
      ...current,
      name: current.name || name,
      email: current.email || email,
    }));
  }, [currentUser, userProfile]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
    setSent(false);
    setSendError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSending(true);
    setSendError('');
    setSent(false);
    try {
      const headers = { 'Content-Type': 'application/json', Accept: 'application/json' };
      if (currentUser) headers.Authorization = `Bearer ${await currentUser.getIdToken()}`;
      const response = await fetch(`${API_BASE_URL}/api/contact`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          subject: formData.subject.trim(),
          message: formData.message.trim(),
        }),
      });
      const result = await response.json().catch(() => null);
      if (!response.ok || result?.success !== true) {
        throw new Error(result?.message || 'We could not send your message. Please try again.');
      }
      setSent(true);
      setFormData((current) => ({ ...current, subject: '', message: '' }));
    } catch (error) {
      setSendError(error.message || 'We could not send your message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const role = normalizeUserType(userProfile?.userType || userProfile?.role);
  const dashboardPath = currentUser && ['student', 'mentor', 'company', 'admin', 'super_admin'].includes(role)
    ? getDashboardPathByUserType(role)
    : null;

  return (
    <main className="common-page">
      <section className="page-hero">
        <div className="hero-content">
          {dashboardPath && (
            <Link to={dashboardPath} aria-label="Return to dashboard" title="Return to dashboard" className="mb-5 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/30 bg-white/10 text-white transition hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">
              <Home className="h-5 w-5" aria-hidden="true" />
            </Link>
          )}
          <span className="section-kicker justify-center">
            <MessageCircle aria-hidden="true" />
            We&apos;re here to help
          </span>
          <h1 className="mt-4">Let&apos;s connect</h1>
          <p>
            Questions about opportunities, partnerships, or the platform? Contact the Career
            Connect Lesotho team using the channel that works best for you.
          </p>
        </div>
      </section>

      <section className="py-12 sm:py-16">
        <div className="landing-shell">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {CONTACT_OPTIONS.map(({ title, detail, description, href, icon: Icon, external }) => (
              <a
                key={title}
                href={href}
                target={external ? '_blank' : undefined}
                rel={external ? 'noreferrer' : undefined}
                className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-card transition hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-pop dark:border-slate-800 dark:bg-slate-900 dark:hover:border-brand-700"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-200">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <span className="mt-4 flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {title}
                  {external && <ArrowUpRight className="h-4 w-4" aria-hidden="true" />}
                </span>
                <span className="mt-1 block break-words text-sm font-medium text-brand-700 dark:text-brand-300">
                  {detail}
                </span>
                <span className="mt-2 block text-sm leading-6 text-slate-500 dark:text-slate-400">
                  {description}
                </span>
              </a>
            ))}
          </div>

          <div className="mt-8 grid items-start gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(18rem,0.85fr)]">
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card dark:border-slate-800 dark:bg-slate-900 sm:p-8">
              <div className="mb-6">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-200">
                  <Send className="h-5 w-5" aria-hidden="true" />
                </span>
                <h2 className="mt-4 text-2xl font-semibold text-slate-900 dark:text-slate-100">
                  Write us a message
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
                  Send a message directly to the Career Connect Lesotho support team. We&apos;ll reply
                  to the email address you provide.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="contact-name" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                      Your name
                    </label>
                    <input
                      id="contact-name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      autoComplete="name"
                      maxLength={100}
                      required
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                    />
                  </div>
                  <div>
                    <label htmlFor="contact-email" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                      Your email
                    </label>
                    <input
                      id="contact-email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      autoComplete="email"
                      maxLength={254}
                      required
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="contact-subject" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Subject
                  </label>
                  <input
                    id="contact-subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    maxLength={140}
                    required
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label htmlFor="contact-message" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Message
                  </label>
                  <textarea
                    id="contact-message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    maxLength={5000}
                    className="w-full resize-y rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm leading-6 text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                  />
                </div>

                <button
                  type="submit"
                  disabled={sending}
                  className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-60"
                >
                  {sending ? 'Sending…' : 'Send message'}
                  <Send className="h-4 w-4" aria-hidden="true" />
                </button>
              </form>

              {sendError && (
                <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-800 dark:bg-red-950/30 dark:text-red-200" role="alert">
                  {sendError}
                </div>
              )}
              {sent && (
                <div
                  className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-200"
                  role="status"
                >
                  <p>Your message was sent successfully to the Career Connect Lesotho team.</p>
                </div>
              )}
            </section>

            <aside className="space-y-5">
              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card dark:border-slate-800 dark:bg-slate-900">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  Developed in Lesotho
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
                  Career Connect Lesotho is powered by Baffy&apos;s Computer Solutions, a local
                  technology company delivering web, mobile, database, AI, and cloud solutions.
                </p>
                <a
                  href={DEVELOPER_SITE}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-brand-700 hover:text-brand-600 dark:text-brand-300 dark:hover:text-brand-200"
                >
                  Visit Baffy&apos;s Computer Solutions
                  <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                </a>
              </section>

              <a
                href={WHATSAPP_LINK}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-4 rounded-2xl bg-emerald-700 p-5 text-white transition hover:bg-emerald-600"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/15">
                  <MessageCircle className="h-6 w-6" aria-hidden="true" />
                </span>
                <span className="flex-1">
                  <strong className="block text-base">Prefer WhatsApp?</strong>
                  <span className="mt-1 block text-sm text-emerald-50">
                    Start a direct chat with our team.
                  </span>
                </span>
                <ArrowUpRight className="h-5 w-5 shrink-0" aria-hidden="true" />
              </a>
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Contact;
