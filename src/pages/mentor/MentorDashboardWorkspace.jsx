import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  ArrowUpRight,
  Award,
  Bell,
  Briefcase,
  CalendarDays,
  Clock3,
  DollarSign,
  MessageCircle,
  RefreshCw,
  Settings,
  Star,
  Users,
  Video,
} from "lucide-react";
import { motion } from "framer-motion";
import { mentorService } from "../../services/mentorService";
import { useAuth } from "../../hooks/useAuth";
import SocialDashboardSection from "../../components/social/SocialDashboardSection";

const links = [
  {
    label: "Sessions",
    href: "/mentor/sessions",
    icon: CalendarDays,
    hint: "Plan and manage meetings",
  },
  {
    label: "Applications",
    href: "/mentor/applications",
    icon: Briefcase,
    hint: "Review mentorship requests",
  },
  {
    label: "Mentees",
    href: "/mentor/students",
    icon: Users,
    hint: "Find registered students and invite them",
  },
  {
    label: "Earnings",
    href: "/mentor/earnings",
    icon: DollarSign,
    hint: "Track payouts and income",
  },
];

const statCards = [
  {
    title: "Mentees supported",
    icon: Users,
    value: (data) => data?.uniqueStudents ?? "—",
    detail: "Across your mentoring journey",
    iconStyle:
      "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300",
  },
  {
    title: "Sessions delivered",
    icon: CalendarDays,
    value: (data) => data?.totalSessions ?? "—",
    detail: (data) =>
      data?.completedSessions == null
        ? "Completed sessions unavailable"
        : `${data.completedSessions} completed`,
    iconStyle:
      "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300",
  },
  {
    title: "Total earnings",
    icon: DollarSign,
    value: (data) =>
      data?.totalEarnings == null
        ? "—"
        : `LSL ${Number(data.totalEarnings).toLocaleString("en-LS", { maximumFractionDigits: 2 })}`,
    detail: "View earnings and payouts",
    iconStyle:
      "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300",
  },
  {
    title: "Average rating",
    icon: Star,
    value: (data) => data?.averageRating ?? "—",
    detail: (data) =>
      data?.totalReviews == null
        ? "Student reviews unavailable"
        : `${data.totalReviews} student reviews`,
    iconStyle:
      "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-300",
  },
];

const dateValue = (value) =>
  value?.toDate?.() || (value ? new Date(value) : null);

export default function MentorDashboardWorkspace() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [summary, setSummary] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [period, setPeriod] = useState("30d");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!user?.uid) return;
    setLoading(true);
    setError("");
    try {
      const [profileResult, analyticsResult, sessionsResult] =
        await Promise.all([
          mentorService.getMentorProfile(user.uid),
          mentorService.getAnalytics(user.uid, period),
          mentorService.getMentorSessions(user.uid, { status: "scheduled" }),
        ]);
      if (profileResult?.success) setProfile(profileResult.data);
      if (analyticsResult?.success)
        setSummary(analyticsResult.data?.summary || analyticsResult.data);
      if (sessionsResult?.success) {
        setSessions(
          (sessionsResult.data || [])
            .map((session) => ({
              ...session,
              date: dateValue(session.scheduledAt),
            }))
            .filter((session) => session.date && session.date > new Date())
            .sort((a, b) => a.date - b.date)
            .slice(0, 5),
        );
      }
    } catch (loadError) {
      console.error("Unable to load mentor dashboard", loadError);
      setError(
        "Some dashboard data could not be loaded. Refresh to try again.",
      );
    } finally {
      setLoading(false);
    }
  }, [user?.uid, period]);

  useEffect(() => {
    load();
  }, [load]);

  const name =
    profile?.fullName || profile?.displayName || user?.displayName || "Mentor";

  return (
    <main className="mx-auto w-full max-w-7xl space-y-7 px-4 py-8 sm:px-6 lg:px-8">
      <motion.header
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-700 via-indigo-600 to-violet-600 p-7 text-white shadow-xl shadow-indigo-950/10 sm:p-10"
      >
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-6">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-indigo-100">
              Mentor workspace
            </p>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Welcome back, {name}
            </h1>
            <p className="mt-3 max-w-xl text-sm text-indigo-100 sm:text-base">
              Your mentoring work, upcoming sessions, and student progress at a
              glance.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={load}
              disabled={loading}
              aria-label="Refresh dashboard"
              className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/25 bg-white/10 transition hover:bg-white/20 disabled:opacity-60"
            >
              <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
            </button>
            <Link
              to="/mentor/settings"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-indigo-700 shadow-sm hover:bg-indigo-50"
            >
              <Settings size={16} />
              Settings
            </Link>
          </div>
        </div>
        <div
          aria-hidden="true"
          className="absolute -right-12 -top-24 h-72 w-72 rounded-full border-[38px] border-white/10"
        />
      </motion.header>

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-200"
        >
          {error}
        </div>
      )}

      <section
        aria-label="Mentor workspace shortcuts"
        className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4"
      >
        {links.map(({ label, href, icon: Icon, hint }) => (
          <Link
            key={href}
            to={href}
            className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300">
              <Icon size={20} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-semibold text-slate-900 dark:text-white">
                {label}
              </span>
              <span className="mt-1 block truncate text-xs text-slate-500 dark:text-slate-400">
                {hint}
              </span>
            </span>
            <ArrowUpRight
              size={16}
              className="text-slate-400 transition group-hover:text-indigo-600"
            />
          </Link>
        ))}
      </section>

      <section
        aria-label="Mentor performance"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        {statCards.map(({ title, icon: Icon, value, detail, iconStyle }) => (
          <article
            key={title}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
          >
            <span
              className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconStyle}`}
            >
              <Icon size={20} />
            </span>
            <h2 className="mt-4 text-sm font-medium text-slate-500 dark:text-slate-400">
              {title}
            </h2>
            <p className="mt-1 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              {loading ? "—" : value(summary)}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {typeof detail === "function" ? detail(summary) : detail}
            </p>
          </article>
        ))}
      </section>

      <SocialDashboardSection audience="mentor" title="Mentor community" subtitle="Share career insights, media, and updates with the Career Connect community." />

      <section className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(300px,1fr)]">
        <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4 dark:border-slate-800">
            <div>
              <h2 className="font-semibold text-slate-900 dark:text-white">
                Upcoming sessions
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Your next scheduled conversations
              </p>
            </div>
            <Link
              to="/mentor/sessions"
              className="text-sm font-semibold text-indigo-600 hover:text-indigo-700"
            >
              Manage sessions
            </Link>
          </div>
          {loading ? (
            <p className="p-8 text-center text-sm text-slate-500">
              Loading your schedule…
            </p>
          ) : sessions.length ? (
            <ul className="divide-y divide-slate-100 px-5 dark:divide-slate-800">
              {sessions.map((session) => (
                <li key={session.id} className="flex items-center gap-4 py-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300">
                    <Video size={19} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-slate-900 dark:text-white">
                      {session.studentName || session.menteeName || "Mentee"}
                    </span>
                    <span className="mt-1 block truncate text-sm text-slate-500">
                      {session.topic || "Mentoring session"}
                    </span>
                  </span>
                  <time className="shrink-0 text-right text-xs text-slate-500">
                    {session.date.toLocaleDateString([], {
                      month: "short",
                      day: "numeric",
                    })}
                    <span className="mt-1 block">
                      {session.date.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </time>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-9 text-center">
              <CalendarDays className="mx-auto h-9 w-9 text-slate-300" />
              <p className="mt-3 text-sm font-medium text-slate-800 dark:text-slate-100">
                No upcoming sessions
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Scheduled meetings will appear here.
              </p>
              <Link
                to="/mentor/sessions"
                className="mt-4 inline-flex rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
              >
                View schedule
              </Link>
            </div>
          )}
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="font-semibold text-slate-900 dark:text-white">
                Mentor overview
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Choose a period for your activity summary.
              </p>
            </div>
            <Activity className="text-indigo-600" size={20} />
          </div>
          <label htmlFor="mentor-period" className="sr-only">
            Analytics period
          </label>
          <select
            id="mentor-period"
            value={period}
            onChange={(event) => setPeriod(event.target.value)}
            className="mt-5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          <div className="mt-5 space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">Completed sessions</span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {summary?.completedSessions ?? "—"}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">Student reviews</span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {summary?.totalReviews ?? "—"}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">Average rating</span>
              <span className="inline-flex items-center gap-1 font-semibold text-slate-900 dark:text-white">
                <Star size={14} className="fill-amber-400 text-amber-400" />
                {summary?.averageRating ?? "—"}
              </span>
            </div>
          </div>
        </article>
      </section>

      <section className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-indigo-100 bg-indigo-50/70 p-5 dark:border-indigo-900/60 dark:bg-indigo-950/20">
        <div>
          <h2 className="font-semibold text-slate-900 dark:text-white">
            Build stronger mentoring relationships
          </h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            Respond to requests, stay connected, and keep your profile up to
            date.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            to="/mentor/applications"
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            <Briefcase size={16} />
            Applications
          </Link>
          <Link
            to="/mentor/settings"
            className="inline-flex items-center gap-2 rounded-lg border border-indigo-200 bg-white px-3 py-2 text-sm font-semibold text-indigo-700 hover:bg-indigo-50 dark:border-slate-700 dark:bg-slate-900 dark:text-indigo-300"
          >
            <Settings size={16} />
            Profile settings
          </Link>
        </div>
      </section>
    </main>
  );
}
