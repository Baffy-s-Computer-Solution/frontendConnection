import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BriefcaseBusiness,
  ChevronDown,
  GraduationCap,
  HelpCircle,
  MessageCircle,
  Search,
  Shield,
  UsersRound,
} from 'lucide-react';

const CONTACT_EMAIL = 'khoalibafokeng@gmail.com';
const WHATSAPP_LINK =
  'https://wa.me/26663210786?text=Hello%2C%20I%20have%20a%20question%20about%20Career%20Connect%20Lesotho.';

const CATEGORIES = [
  { id: 'all', label: 'All questions', icon: HelpCircle },
  { id: 'platform', label: 'Platform', icon: UsersRound },
  { id: 'accounts', label: 'Accounts', icon: Shield },
  { id: 'opportunities', label: 'Opportunities', icon: BriefcaseBusiness },
  { id: 'mentorship', label: 'Mentorship', icon: GraduationCap },
  { id: 'support', label: 'Support', icon: MessageCircle },
];

const QUESTIONS = [
  {
    id: 'what-is-career-connect',
    category: 'platform',
    question: 'What is Career Connect Lesotho?',
    answer:
      'Career Connect Lesotho is a platform that brings career opportunities, learning, mentorship, and the people who support career development together.',
  },
  {
    id: 'who-can-use-it',
    category: 'platform',
    question: 'Which roles can use the platform?',
    answer:
      'The public account roles are student, youth, company, mentor, educational institute, government, parent, alumni, and entrepreneur. Administrator accounts are provisioned by the platform team rather than created through public sign-up.',
  },
  {
    id: 'getting-started',
    category: 'accounts',
    question: 'How do I create an account?',
    answer:
      'Select Create account, choose the role that best describes you, and complete the registration steps. Some account types require verification before their role-specific features are available.',
  },
  {
    id: 'account-approval',
    category: 'accounts',
    question: 'Why does my account need approval?',
    answer:
      'Some roles require an administrator to review account details before activation. If you have questions about a pending review, contact the team using the email or WhatsApp options below.',
  },
  {
    id: 'find-opportunities',
    category: 'opportunities',
    question: 'How do I find and apply for opportunities?',
    answer:
      'Sign in with a student account, browse the available jobs or opportunities, and follow the instructions on the listing. Application requirements and availability are set by the organization that posted it.',
  },
  {
    id: 'job-outcomes',
    category: 'opportunities',
    question: 'Does Career Connect guarantee a job?',
    answer:
      'No. The platform helps people discover opportunities and manage connections, but a job or other outcome depends on availability and the decisions of participating organizations.',
  },
  {
    id: 'mentorship',
    category: 'mentorship',
    question: 'How can I connect with a mentor?',
    answer:
      'Sign in to your account and explore the mentorship area to see available mentors and request a connection where that feature is enabled for your account.',
  },
  {
    id: 'password',
    category: 'accounts',
    question: 'How do I reset my password?',
    answer:
      'Use the password reset option on the sign-in page and follow the instructions sent to your account email. If you still cannot access your account, contact support.',
  },
  {
    id: 'contact-support',
    category: 'support',
    question: 'How do I contact the team?',
    answer:
      `Email ${CONTACT_EMAIL} or use the Contact page to call or message us on WhatsApp. The Contact page's message form prepares an email draft for you to review and send.`,
  },
];

const FAQ = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [openQuestion, setOpenQuestion] = useState(QUESTIONS[0].id);

  const filteredQuestions = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    return QUESTIONS.filter((item) => {
      const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
      const matchesSearch =
        !normalizedQuery ||
        item.question.toLowerCase().includes(normalizedQuery) ||
        item.answer.toLowerCase().includes(normalizedQuery);
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  return (
    <main className="common-page">
      <section className="page-hero">
        <div className="hero-content">
          <span className="section-kicker justify-center">
            <HelpCircle aria-hidden="true" />
            Help and guidance
          </span>
          <h1 className="mt-4">Frequently asked questions</h1>
          <p>Answers about roles, accounts, opportunities, mentorship, and contacting our team.</p>
        </div>
      </section>

      <section className="py-12 sm:py-16">
        <div className="landing-shell">
          <label className="relative block">
            <Search
              className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search questions..."
              aria-label="Search frequently asked questions"
              className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-12 pr-4 text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            />
          </label>

          <div className="mt-5 flex flex-wrap gap-2" aria-label="FAQ categories">
            {CATEGORIES.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                aria-pressed={activeCategory === id}
                onClick={() => setActiveCategory(id)}
                className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition ${
                  activeCategory === id
                    ? 'border-brand-600 bg-brand-600 text-white'
                    : 'border-slate-300 bg-white text-slate-700 hover:border-brand-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200'
                }`}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {label}
              </button>
            ))}
          </div>

          <div className="mt-8 space-y-3">
            {filteredQuestions.length ? (
              filteredQuestions.map(({ id, question, answer }) => {
                const isOpen = openQuestion === id;
                return (
                  <article
                    key={id}
                    className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card dark:border-slate-800 dark:bg-slate-900"
                  >
                    <h2>
                      <button
                        type="button"
                        aria-expanded={isOpen}
                        aria-controls={`${id}-answer`}
                        onClick={() => setOpenQuestion(isOpen ? '' : id)}
                        className="flex w-full items-center justify-between gap-4 p-5 text-left text-base font-semibold text-slate-900 hover:bg-slate-50 dark:text-slate-100 dark:hover:bg-slate-800"
                      >
                        {question}
                        <ChevronDown
                          className={`h-5 w-5 shrink-0 text-brand-600 transition-transform dark:text-brand-300 ${
                            isOpen ? 'rotate-180' : ''
                          }`}
                          aria-hidden="true"
                        />
                      </button>
                    </h2>
                    {isOpen && (
                      <div
                        id={`${id}-answer`}
                        className="border-t border-slate-100 px-5 pb-5 pt-4 text-sm leading-6 text-slate-600 dark:border-slate-800 dark:text-slate-300"
                      >
                        {answer}
                      </div>
                    )}
                  </article>
                );
              })
            ) : (
              <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center dark:border-slate-700">
                <h2 className="font-semibold text-slate-900 dark:text-slate-100">
                  No matching questions
                </h2>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                  Try another search or category, or contact the team directly.
                </p>
              </div>
            )}
          </div>

          <section className="mt-10 rounded-2xl bg-slate-900 p-6 text-white sm:flex sm:items-center sm:justify-between sm:gap-6 sm:p-8">
            <div>
              <h2 className="text-xl font-semibold">Still need help?</h2>
              <p className="mt-2 text-sm text-slate-300">
                Send us an email or start a WhatsApp conversation.
              </p>
            </div>
            <div className="mt-5 flex flex-wrap gap-3 sm:mt-0">
              <Link
                to="/contact"
                className="rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
              >
                Contact us
              </Link>
              <a
                href={WHATSAPP_LINK}
                target="_blank"
                rel="noreferrer"
                className="rounded-xl border border-white/25 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/10"
              >
                WhatsApp
              </a>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
};

export default FAQ;
