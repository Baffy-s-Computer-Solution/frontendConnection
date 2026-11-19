import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Building2,
  GraduationCap,
  Handshake,
  Landmark,
  Rocket,
  UsersRound,
} from 'lucide-react';

const COMMUNITIES = [
  { title: 'Students & youth', icon: GraduationCap },
  { title: 'Employers', icon: Building2 },
  { title: 'Mentors & institutions', icon: Handshake },
  { title: 'Government & agencies', icon: Landmark },
  { title: 'Parents & guardians', icon: UsersRound },
  { title: 'Alumni & entrepreneurs', icon: Rocket },
];

const About = () => (
  <main className="common-page">
    <section className="page-hero">
      <div className="hero-content">
        <span className="section-kicker justify-center">About the platform</span>
        <h1 className="mt-4">Career connections, built for Lesotho.</h1>
        <p>
          Career Connect Lesotho brings people, learning, mentorship, and employment opportunities
          together in one place.
        </p>
      </div>
    </section>

    <section className="py-12 sm:py-16">
      <div className="landing-shell">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(18rem,0.9fr)]">
          <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card dark:border-slate-800 dark:bg-slate-900 sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-wider text-brand-700 dark:text-brand-300">
              Our purpose
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-slate-900 dark:text-slate-100">
              Make the next step easier to find.
            </h2>
            <p className="mt-4 leading-7 text-slate-600 dark:text-slate-300">
              The platform helps students and job seekers develop their profiles, discover
              opportunities, and track applications. Employers, mentors, education providers,
              government teams, families, alumni, and entrepreneurs each have spaces to connect
              with that journey.
            </p>
            <p className="mt-4 leading-7 text-slate-600 dark:text-slate-300">
              Career readiness is a shared effort. Career Connect brings the people and tools
              supporting that effort into a connected digital workspace.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
              >
                Join the platform <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                Contact us
              </Link>
            </div>
          </article>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card dark:border-slate-800 dark:bg-slate-900 sm:p-8">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              One community, many roles
            </h2>
            <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              {COMMUNITIES.map(({ title, icon: Icon }) => (
                <li key={title} className="flex items-center gap-3 rounded-xl bg-slate-50 p-3 dark:bg-slate-800">
                  <Icon className="h-5 w-5 shrink-0 text-brand-600 dark:text-brand-300" aria-hidden="true" />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{title}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <section className="mt-8 rounded-2xl border border-slate-200 bg-slate-900 p-6 text-white shadow-card dark:border-slate-700 dark:bg-slate-900 sm:flex sm:items-center sm:gap-6 sm:p-8">
          <img
            src="/bcs.jpg"
            alt="Baffy's Computer Solutions logo"
            className="mb-5 h-16 w-16 rounded-xl bg-white p-1 object-contain sm:mb-0"
            loading="lazy"
          />
          <div className="flex-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-brand-300">
              Technology partner
            </p>
            <h2 className="mt-2 text-xl font-semibold">Powered by Baffy&apos;s Computer Solutions</h2>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              Founded in Lesotho in 2018, Baffy&apos;s Computer Solutions delivers web and mobile
              development, database design, AI solutions, and cloud services.
            </p>
          </div>
          <a
            href="https://baffy.vercel.app/"
            target="_blank"
            rel="noreferrer"
            className="mt-5 inline-flex shrink-0 items-center gap-2 rounded-xl border border-white/20 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10 sm:mt-0"
          >
            Visit developer site <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </a>
        </section>
      </div>
    </section>
  </main>
);

export default About;
