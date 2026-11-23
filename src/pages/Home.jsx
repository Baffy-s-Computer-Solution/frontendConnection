import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  ArrowUp,
  BadgeCheck,
  BarChart3,
  BriefcaseBusiness,
  Building2,
  ChevronRight,
  ExternalLink,
  GraduationCap,
  Handshake,
  Landmark,
  LogIn,
  Menu,
  MessageSquareText,
  Rocket,
  ShieldCheck,
  Sparkles,
  Star,
  UsersRound,
  UserRoundPlus,
  X,
} from 'lucide-react';
import { collection, db } from '../config/firebase';
import {
  onSnapshot,
  query,
  where,
} from 'firebase/firestore';
import { supabase } from '../config/supabase';
import { useAuth } from '../context/AuthContext';
import { getUserDashboardPath } from '../utils/dashboardConstants';
import { normalizeUserType } from '../utils/authRoleUtils';

const NAV_LINKS = [
  { label: 'Platform', href: '#platform' },
  { label: 'Pathways', href: '#pathways' },
  { label: 'Testimonials', href: '#stories' },
  { label: 'Impact', href: '#impact' },
  { label: 'FAQ', href: '#faq' },
  { label: 'Contact', href: '/contact' },
];

export const getLegacyPublicPath = (hash) => (hash === '#contact' ? '/contact' : null);

const CONTACT = {
  email: 'khoalibafokeng@gmail.com',
  phone: '+266 632 10786',
  phoneLink: '+26663210786',
  whatsapp:
    'https://wa.me/26663210786?text=Hello%2C%20I%20would%20like%20to%20know%20more%20about%20Career%20Connect%20Lesotho.',
  developerSite: 'https://baffy.vercel.app/',
};

const AUDIENCES = [
  {
    role: 'student',
    title: 'Students',
    description:
      'Build your profile, explore learning and career paths, and apply for jobs and internships.',
    icon: GraduationCap,
    bullets: ['Career and job discovery', 'Profile and skills', 'Application tracking'],
  },
  {
    role: 'youth',
    title: 'Youth',
    description:
      'Find guidance, learning resources, and opportunities to build your future.',
    icon: UsersRound,
    bullets: ['Skills and career development', 'Mentorship', 'Opportunities and resources'],
  },
  {
    role: 'company',
    title: 'Companies & employers',
    description:
      'Connect with candidates, publish roles, and manage applications in one workspace.',
    icon: Building2,
    bullets: ['Job posting', 'Candidate discovery', 'Application management'],
  },
  {
    role: 'mentor',
    title: 'Mentors',
    description:
      'Share your experience and support learners as they work toward their goals.',
    icon: Handshake,
    bullets: ['Mentorship requests', 'Sessions and guidance', 'Mentee progress'],
  },
  {
    role: 'institute',
    title: 'Educational institutions',
    description:
      'Connect students with learning, career readiness, and employment pathways.',
    icon: GraduationCap,
    bullets: ['Courses and student connections', 'Readiness support', 'Progress insights'],
  },
  {
    role: 'government',
    title: 'Government & agencies',
    description:
      'Use employment and program insights to support youth opportunity initiatives.',
    icon: Landmark,
    bullets: ['Employment insights', 'Program monitoring', 'Regional perspectives'],
  },
  {
    role: 'parent',
    title: 'Parents & guardians',
    description:
      'Stay informed and encourage the student in your care as they explore next steps.',
    icon: UsersRound,
    bullets: ['Student progress', 'Career guidance', 'Supportive communication'],
  },
  {
    role: 'alumni',
    title: 'Alumni',
    description:
      'Stay connected to the community and share experience with the next generation.',
    icon: GraduationCap,
    bullets: ['Professional connections', 'Mentorship opportunities', 'Community events'],
  },
  {
    role: 'entrepreneur',
    title: 'Entrepreneurs',
    description:
      'Find business resources, mentorship, and support as you build your venture.',
    icon: Rocket,
    bullets: ['Business development', 'Funding opportunities', 'Mentor connections'],
  },
];

const PLATFORM_HIGHLIGHTS = [
  {
    icon: UserRoundPlus,
    title: 'Profiles for your goals',
    text: 'Keep your career information, skills, interests, and next steps in one place.',
  },
  {
    icon: BriefcaseBusiness,
    title: 'Opportunity discovery',
    text: 'Explore published jobs and other opportunities as you plan your next move.',
  },
  {
    icon: ShieldCheck,
    title: 'Role-based access',
    text: 'Use a workspace designed for your role, with review for account types that require it.',
  },
  {
    icon: Handshake,
    title: 'Mentor connections',
    text: 'Mentors can share guidance, and learners can explore mentorship opportunities.',
  },
  {
    icon: Landmark,
    title: 'Learning and career support',
    text: 'Institutions and public teams can connect their work to career readiness.',
  },
  {
    icon: Building2,
    title: 'Employer engagement',
    text: 'Employers can share roles and manage candidate applications through the platform.',
  },
];

const FAQ_ITEMS = [
  {
    question: 'Who can use Career Connect Lesotho?',
    answer:
      'Students, youth, companies, mentors, educational institutions, government teams, parents, alumni, and entrepreneurs can create role-specific accounts. Administrator accounts are provisioned by the platform team.',
  },
  {
    question: 'How do I get started?',
    answer:
      'Choose Create account and select your role. Some account types require verification before all role features become available.',
  },
  {
    question: 'Does the platform guarantee a job or mentorship placement?',
    answer:
      'No. Career Connect helps people discover opportunities and connect with others, but jobs, mentorship, and other outcomes depend on availability and the decisions of participating organizations.',
  },
  {
    question: 'How do I ask a question or get help?',
    answer:
      `Email ${CONTACT.email}, call ${CONTACT.phone}, or start a WhatsApp chat. You can also use the Contact page to prepare an email message.`,
  },
];

const COMMUNITY_IMAGES = [
  {
    src: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=900&q=85',
    alt: 'A diverse group of young professionals collaborating outdoors',
  },
  {
    src: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=900&q=85',
    alt: 'Professionals sharing ideas during a working session',
  },
];

const EMPTY_LANDING_STATS = {
  students: 0,
  employers: 0,
  mentors: 0,
  institutions: 0,
  activeJobs: 0,
  activeOpportunities: 0,
};

const fetchActiveUserCounts = async () => {
  if (!supabase) {
    throw new Error('Supabase is not configured for landing page statistics');
  }
  const { data, error } = await supabase.rpc('get_public_user_counts');
  if (error) throw error;
  const counts = data && typeof data === 'object' ? data : {};
  const sum = (roles) => roles.reduce((total, role) => total + Number(counts[role] || 0), 0);
  return {
    students: sum(['student', 'youth']),
    employers: sum(['company', 'employer']),
    mentors: sum(['mentor', 'advisor', 'instructor']),
    institutions: sum(['institute', 'institution', 'school']),
  };
};

const formatMetricValue = (value) => `+${Number(value || 0)}`;

const trackCta = (name, location = 'unknown') => {
  const event = {
    event: 'cta_click',
    cta: name,
    location,
    path: typeof window !== 'undefined' ? window.location.pathname : '',
    timestamp: new Date().toISOString(),
  };

  if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
    window.dispatchEvent(new CustomEvent('cc:analytics', { detail: event }));
  }
};

const Home = () => {
  const { currentUser, userProfile } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [navOpen, setNavOpen] = useState(false);
  const [platformStats, setPlatformStats] = useState(EMPTY_LANDING_STATS);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState(false);
  const [testimonials, setTestimonials] = useState([]);
  const [testimonialError, setTestimonialError] = useState('');

  useEffect(() => {
    const legacyPath = getLegacyPublicPath(location.hash);
    if (legacyPath) navigate(legacyPath, { replace: true });
  }, [location.hash, navigate]);

  useEffect(() => {
    let isMounted = true;
    let userStats = null;
    let userStatsRequestInFlight = false;
    const failedSources = new Set();
    const firestoreData = {
      companies: null,
      jobs: null,
      opportunities: null,
    };

    const publishStats = () => {
      if (!userStats || Object.values(firestoreData).some((snapshot) => !snapshot)) return;

      const activeJobs = firestoreData.jobs.docs.filter((item) => {
        const status = String(item.data()?.status || '').trim().toLowerCase();
        return status && !['closed', 'draft', 'archived'].includes(status);
      }).length;

      const activeOpportunities = firestoreData.opportunities.docs.filter((item) => {
        const data = item.data() || {};
        const status = String(data.status || (data.published === true ? 'published' : '')).trim().toLowerCase();
        return status === 'active' || status === 'published' || data.published === true;
      }).length;

      setPlatformStats({
        ...userStats,
        employers: userStats.employers + firestoreData.companies.size,
        activeJobs,
        activeOpportunities,
      });
      setStatsLoading(false);
    };

    const markSourceSuccess = (source) => {
      failedSources.delete(source);
      setStatsError(failedSources.size > 0);
      publishStats();
    };

    const markSourceFailure = (source, error) => {
      console.error(`Could not load landing page ${source} data:`, error);
      failedSources.add(source);
      setStatsError(true);
      setStatsLoading(false);
    };

    const refreshUserStats = async () => {
      if (userStatsRequestInFlight) return;
      userStatsRequestInFlight = true;

      try {
        userStats = await fetchActiveUserCounts();
        if (isMounted) markSourceSuccess('Supabase');
      } catch (error) {
        if (isMounted) markSourceFailure('Supabase', error);
      } finally {
        userStatsRequestInFlight = false;
      }
    };

    const subscriptions = [
      ['companies', 'companies'],
      ['jobs', 'jobs'],
      ['opportunities', 'opportunities'],
    ].map(([source, collectionName]) =>
      onSnapshot(
        collection(db, collectionName),
        (snapshot) => {
          if (!isMounted) return;
          firestoreData[source] = snapshot;
          markSourceSuccess(source);
        },
        (error) => {
          if (isMounted) markSourceFailure(source, error);
        }
      )
    );

    const refreshInterval = window.setInterval(refreshUserStats, 60_000);
    window.addEventListener('focus', refreshUserStats);
    void refreshUserStats();

    return () => {
      isMounted = false;
      subscriptions.forEach((unsubscribe) => unsubscribe());
      window.clearInterval(refreshInterval);
      window.removeEventListener('focus', refreshUserStats);
    };
  }, []);

  useEffect(() => {
    const testimonialsQuery = query(
      collection(db, 'testimonials'),
      where('approved', '==', true),
    );

    return onSnapshot(
      testimonialsQuery,
      (snapshot) => {
        const approvedTestimonials = snapshot.docs
          .map((record) => ({ id: record.id, ...record.data() }))
          .filter((testimonial) =>
            testimonial.approved === true &&
            ['student', 'company', 'mentor'].includes(
              normalizeUserType(testimonial.userType || testimonial.role)
            )
          )
          .sort((left, right) => {
            const millis = (value) => value?.toMillis?.() ?? (Number.isFinite(value?.seconds) ? value.seconds * 1000 : new Date(value || 0).getTime());
            return millis(right.createdAt) - millis(left.createdAt);
          });
        setTestimonials(approvedTestimonials);
        setTestimonialError('');
      },
      (error) => {
        console.error('Could not load approved landing-page testimonials:', error);
        setTestimonials([]);
        setTestimonialError('Testimonials are temporarily unavailable.');
      }
    );
  }, []);

  const dashboardPath = useMemo(
    () => (currentUser ? getUserDashboardPath(userProfile?.userType) : '/login'),
    [currentUser, userProfile]
  );

  const heroMetrics = useMemo(
    () => [
      { value: platformStats.students, label: 'students ready' },
      { value: platformStats.employers, label: 'employers connected' },
      { value: platformStats.activeJobs, label: 'active jobs' },
      { value: platformStats.activeOpportunities, label: 'active opportunities' },
    ],
    [platformStats]
  );

  const trustItems = useMemo(
    () => [
      { label: 'Students', value: platformStats.students },
      { label: 'Employers', value: platformStats.employers },
      { label: 'Mentors', value: platformStats.mentors },
      { label: 'Institutions', value: platformStats.institutions },
    ],
    [platformStats]
  );

  const impactStats = useMemo(
    () => [
      { value: platformStats.students || 0, label: 'Registered students' },
      { value: platformStats.employers || 0, label: 'Connected employers' },
      { value: platformStats.activeJobs || 0, label: 'Active jobs' },
      { value: platformStats.activeOpportunities || 0, label: 'Active opportunities' },
    ],
    [platformStats]
  );

  const handleAction = (id, location) => {
    trackCta(id, location);
    setNavOpen(false);
  };

  return (
    <div id="top" className="landing-page">
      <a href="#main" className="skip-link">
        Skip to main content
      </a>

      <header className="landing-header">
        <div className="landing-shell landing-header-inner">
          <Link to="/" className="brand-mark" aria-label="Career Connect Lesotho home">
            <img
              src="/career connect lesotho logo.jpeg"
              alt="Career Connect Lesotho logo"
              className="brand-logo"
            />
            <span className="brand-name">Career Connect Lesotho</span>
          </Link>

          <button
            type="button"
            className="nav-toggle"
            aria-expanded={navOpen}
            aria-label={navOpen ? 'Close navigation' : 'Open navigation'}
            aria-controls="landing-navigation"
            onClick={() => setNavOpen((value) => !value)}
          >
            {navOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
          </button>

          <nav
            id="landing-navigation"
            className={`landing-nav ${navOpen ? 'is-open' : ''}`}
            aria-label="Primary navigation"
          >
            {NAV_LINKS.map((link) => link.href.startsWith('/') ? (
              <Link key={link.label} to={link.href} onClick={() => setNavOpen(false)}>
                {link.label}
              </Link>
            ) : (
              <a key={link.label} href={link.href} onClick={() => setNavOpen(false)}>
                {link.label}
              </a>
            ))}
          </nav>

          <div className="landing-actions">
            {currentUser ? (
              <Link
                to={dashboardPath}
                className="button button-primary"
                onClick={() => handleAction('header_dashboard', 'desktop')}
              >
                Dashboard <ArrowRight aria-hidden="true" />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="button button-ghost"
                  onClick={() => handleAction('header_signin', 'desktop')}
                >
                  <LogIn aria-hidden="true" /> Sign in
                </Link>
                <Link
                  to="/register"
                  className="button button-primary"
                  onClick={() => handleAction('header_signup', 'desktop')}
                >
                  <UserRoundPlus aria-hidden="true" /> Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main id="main" tabIndex={-1}>
        <section className="hero-section" aria-labelledby="hero-heading">
          <div className="landing-shell hero-layout">
            <div className="hero-copy">
              <span className="section-kicker">
                <Sparkles aria-hidden="true" /> Career readiness, beautifully connected
              </span>
              <h1 id="hero-heading">Where ambition meets opportunity.</h1>
              <p className="hero-lede">
                Career Connect Lesotho brings students, youth, employers, mentors, institutions,
                government, parents, alumni, and entrepreneurs together around meaningful
                opportunities.
              </p>

              <div className="hero-actions">
                {currentUser ? (
                  <Link
                    to={dashboardPath}
                    className="button button-primary button-large"
                    onClick={() => handleAction('hero_dashboard', 'hero')}
                  >
                    Open your dashboard <ArrowRight aria-hidden="true" />
                  </Link>
                ) : (
                  <>
                    <Link
                      to="/register"
                      className="button button-primary button-large"
                      onClick={() => handleAction('hero_signup', 'hero')}
                    >
                      Create account <ArrowRight aria-hidden="true" />
                    </Link>
                    <Link
                      to="/login"
                      className="button button-glass button-large"
                      onClick={() => handleAction('hero_signin', 'hero')}
                    >
                      Log in
                    </Link>
                  </>
                )}
              </div>

              <ul className="hero-trust" aria-label="Trust signals">
                <li>
                  <ShieldCheck aria-hidden="true" />
                  <span>Role-based access</span>
                </li>
                <li>
                  <Star aria-hidden="true" />
                  <span>Live platform data</span>
                </li>
                <li>
                  <Sparkles aria-hidden="true" />
                  <span>Built for Lesotho</span>
                </li>
              </ul>

              <dl className="hero-metrics" aria-label="Platform metrics">
                {heroMetrics.map((metric) => (
                  <div key={metric.label} className="metric-card">
                    <strong>
                      {statsLoading ? '...' : statsError ? '—' : formatMetricValue(metric.value)}
                    </strong>
                    <span>{metric.label}</span>
                  </div>
                ))}
              </dl>
            </div>

            <div className="hero-showcase" aria-label="Product preview">
              <div className="showcase-frame">
                <div className="frame-bar" aria-hidden="true">
                  <span />
                  <span />
                  <span />
                  <em>careerconnect.co.ls/dashboard</em>
                </div>
                <div className="frame-content">
                  <div className="frame-hero">
                    <div className="frame-score">
                      <span className="tiny-label">Readiness overview</span>
                      <strong>Live workspace</strong>
                      <span className="status-pill">Data connected</span>
                    </div>
                    <div className="frame-ring" aria-hidden="true">
                      <svg viewBox="0 0 120 120">
                        <circle cx="60" cy="60" r="52" className="ring-track" />
                        <circle
                          cx="60"
                          cy="60"
                          r="52"
                          className="ring-progress"
                          strokeDasharray="326"
                          strokeDashoffset="46"
                        />
                      </svg>
                      <span>Live</span>
                    </div>
                  </div>
                  <div className="frame-row">
                    <div className="frame-cell">
                      <span className="tiny-label">Career match</span>
                      <strong>Personalized pathways</strong>
                      <em>Matched from your profile</em>
                    </div>
                    <div className="frame-cell">
                      <span className="tiny-label">Support check-in</span>
                      <strong>Support when you need it</strong>
                      <em>Mentors and institutions connected</em>
                    </div>
                  </div>
                  <div className="frame-bars" aria-hidden="true">
                    <span style={{ '--w': '92%' }} />
                    <span style={{ '--w': '74%' }} />
                    <span style={{ '--w': '84%' }} />
                    <span style={{ '--w': '68%' }} />
                  </div>
                </div>
              </div>
              <div className="hero-photo">
                <img
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80"
                  alt="A group of young professionals collaborating"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="landing-section" aria-label="Connected across the career ecosystem" role="region">
          <div className="landing-shell">
            <div className="section-heading">
              <span className="section-kicker">
                <BadgeCheck aria-hidden="true" /> Connected across the career ecosystem
              </span>
            </div>
            <div className="trust-strip">
              {trustItems.map(({ label, value }) => (
                <div key={label} className="trust-item">
                  <strong>{label}</strong>
                  <span>
                    {statsLoading
                      ? 'Loading live count...'
                      : statsError
                        ? 'Live count unavailable'
                        : `${value} registered`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="platform" className="landing-section product-section" aria-label="One platform. Every role. Real outcomes.">
          <div className="landing-shell">
            <div className="section-heading">
              <span className="section-kicker">
                <Rocket aria-hidden="true" /> Built for the whole career ecosystem
              </span>
              <h2>One platform. Every role. Real outcomes.</h2>
            </div>

            <div className="audience-grid">
              {AUDIENCES.map(({ role, title, description, icon: Icon, bullets }) => (
                <article key={role} className="audience-card">
                  <div className="icon-tile">
                    <Icon aria-hidden="true" />
                  </div>
                  <h3>{title}</h3>
                  <p>{description}</p>
                  <ul>
                    {bullets.map((bullet) => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>
                  <Link
                    to={currentUser ? dashboardPath : `/register?role=${role}`}
                    className="card-link"
                    onClick={() => handleAction(`audience_${role}`, 'platform')}
                  >
                    Get started <ChevronRight aria-hidden="true" />
                  </Link>
                </article>
              ))}
            </div>
            <p className="admin-access-note">
              <ShieldCheck aria-hidden="true" />
              Administrator accounts are provisioned by the platform team and aren&apos;t available
              through public sign-up.{' '}
              <a href={`mailto:${CONTACT.email}`}>Contact us about admin access</a>.
            </p>
          </div>
        </section>

        <section id="pathways" className="landing-section" aria-label="Opportunity discovery, readiness tracking, and guided support — in one place.">
          <div className="landing-shell">
            <div className="section-heading">
              <span className="section-kicker">
                <BarChart3 aria-hidden="true" /> Explore the platform
              </span>
              <h2>Opportunity discovery, readiness tracking, and guided support.</h2>
            </div>

            <div className="workflow-grid">
              {PLATFORM_HIGHLIGHTS.map(({ icon: Icon, title, text }) => (
                <div key={title} className="workflow-card">
                  <span>
                    <Icon aria-hidden="true" />
                  </span>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </div>
              ))}
            </div>

            <div className="community-gallery" aria-label="Career Connect community">
              {COMMUNITY_IMAGES.map((image) => (
                <img key={image.src} src={image.src} alt={image.alt} loading="lazy" />
              ))}
            </div>
          </div>
        </section>

        <section id="stories" className="landing-section" aria-label="Community testimonials">
          <div className="landing-shell">
            <div className="section-heading">
              <span className="section-kicker">
                <Star aria-hidden="true" /> Community voices
              </span>
              <h2>Experiences from our community.</h2>
              <p>
                Testimonials from registered students, companies, and mentors are published
                immediately and visible to everyone.
              </p>
            </div>

            <div className="workflow-grid">
              {testimonials.map((testimonial) => (
                <article key={testimonial.id} className="workflow-card testimonial-card">
                  <Star className="testimonial-star" aria-hidden="true" />
                  <blockquote>
                    {testimonial.content || testimonial.text || testimonial.message}
                  </blockquote>
                  <p className="testimonial-author">
                    <strong>{testimonial.name || testimonial.fullName}</strong>
                    <span>{normalizeUserType(testimonial.userType || testimonial.role)}</span>
                  </p>
                </article>
              ))}
            </div>
            {testimonials.length === 0 && (
              <p className="testimonial-empty" role="status">
                No approved testimonials yet. Be among the first to share your experience.
              </p>
            )}
            {testimonialError && <p className="testimonial-empty" role="alert">{testimonialError}</p>}
            <p className="testimonial-empty">Students, mentors, and companies can share their experience from their dashboard.</p>
          </div>
        </section>

        <section id="impact" className="landing-section" aria-label="Current platform activity.">
          <div className="landing-shell">
            <div className="section-heading">
              <span className="section-kicker">
                <Star aria-hidden="true" /> Progress you can see
              </span>
              <h2>Current platform activity.</h2>
            </div>

            <div className="stats-grid">
              {impactStats.map(({ value, label }) => (
                <article key={label} className="stat-card">
                  <strong>
                    {statsLoading ? '...' : statsError ? '—' : formatMetricValue(value)}
                  </strong>
                  <span>{label}</span>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="faq" className="landing-section" aria-label="Everything you need to know.">
          <div className="landing-shell">
            <div className="section-heading">
              <span className="section-kicker">
                <MessageSquareText aria-hidden="true" /> Questions, answered
              </span>
              <h2>Everything you need to know.</h2>
            </div>

            <div className="faq-list">
              {FAQ_ITEMS.map(({ question, answer }, index) => (
                <details key={question} open={index === 0}>
                  <summary>{question}</summary>
                  <p>{answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section id="contact" className="landing-section final-cta-section" aria-label="Ready to get started?">
          <div className="landing-shell final-cta">
            <div>
              <span className="section-kicker">
                <Rocket aria-hidden="true" /> Ready to grow?
              </span>
              <h2>From profile to progress — without the guesswork.</h2>
              <p>
                Build a practical career path with structured guidance, verified opportunities, and
                consistent momentum.
              </p>
            </div>
            <div className="final-cta-actions">
              <div className="final-actions">
                {currentUser ? (
                  <Link
                    to={dashboardPath}
                    className="button button-primary button-large"
                    onClick={() => handleAction('final_dashboard', 'final_cta')}
                  >
                    Go to dashboard <ArrowRight aria-hidden="true" />
                  </Link>
                ) : (
                  <>
                    <Link
                      to="/register"
                      className="button button-primary button-large"
                      onClick={() => handleAction('final_signup', 'final_cta')}
                    >
                      <UserRoundPlus aria-hidden="true" /> Sign up now
                    </Link>
                    <Link
                      to="/login"
                      className="button button-glass button-large"
                      onClick={() => handleAction('final_signin', 'final_cta')}
                    >
                      <LogIn aria-hidden="true" /> Sign in
                    </Link>
                  </>
                )}
              </div>
              <Link to="/contact" className="button button-glass button-large">
                Contact our team <ChevronRight aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="landing-footer" role="contentinfo">
        <div className="landing-shell footer-grid footer-grid-three">
          <div>
            <h3>Resources</h3>
            <ul>
              <li>
                <Link to="/faq">FAQ</Link>
              </li>
              <li>
                <a href="#stories">Stories</a>
              </li>
              <li>
                <Link to="/contact">Contact</Link>
              </li>
            </ul>
          </div>
          <div>
            <h3>Company</h3>
            <ul>
              <li>
                <Link to="/about">About</Link>
              </li>
              <li>
                <Link to="/contact">Contact</Link>
              </li>
              <li>
                <Link to="/terms">Terms</Link>
              </li>
            </ul>
          </div>
          <div>
            <h3>Legal</h3>
            <ul>
              <li>
                <Link to="/privacy">Privacy</Link>
              </li>
              <li>
                <Link to="/terms">Terms</Link>
              </li>
              <li>
                <Link to="/faq">Help</Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="landing-shell footer-attribution">
          <div className="footer-powered-by">
            <img src="/bcs.jpg" alt="Baffy's Computer Solutions logo" loading="lazy" />
            <div>
              <span>Powered by</span>
              <a href={CONTACT.developerSite} target="_blank" rel="noreferrer">
                Baffy&apos;s Computer Solutions <ExternalLink aria-hidden="true" />
              </a>
              <p>Transforming ideas into digital reality.</p>
            </div>
          </div>
        </div>
      </footer>

      <a href="#top" className="back-to-top" aria-label="Back to top" title="Back to top">
        <ArrowUp aria-hidden="true" />
      </a>

      <div className="sticky-mobile-cta" aria-label="Quick actions">
        {currentUser ? (
          <Link
            to={dashboardPath}
            className="button button-primary button-large"
            onClick={() => handleAction('sticky_dashboard', 'sticky_mobile')}
          >
            Open dashboard <ArrowRight aria-hidden="true" />
          </Link>
        ) : (
          <>
            <Link
              to="/register"
              className="button button-primary button-large"
              onClick={() => handleAction('sticky_signup', 'sticky_mobile')}
            >
              <UserRoundPlus aria-hidden="true" />               Sign up
            </Link>
            <Link
              to="/login"
              className="button button-ghost button-large"
              onClick={() => handleAction('sticky_signin', 'sticky_mobile')}
            >
              <LogIn aria-hidden="true" /> Sign in
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

export default Home;
