import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useStudent } from '../../context/StudentContext';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import SocialDashboardSection from '../../components/social/SocialDashboardSection';
import { ROUTES } from '../../routing/utils/routeConstants';
import { subscribeToStudentApplications } from '../../services/studentServices';
import { CalendarDays, Activity, ClipboardList, Bell, RefreshCw, BellRing, UserRound, BriefcaseBusiness, FileText, Bookmark, ChevronDown, Zap } from 'lucide-react';
import { formatLocation } from '../../utils/formatters';
import TestimonialComposer from '../../components/social/TestimonialComposer';

const getTimeGreeting = (date = new Date()) => {
  const hour = date.getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
};

const StudentDashboard = () => {
  const {
    studentData,
    loading,
    fetchApplications,
    fetchRecommendedJobs,
  } = useStudent();
  const { currentUser } = useAuth();
  const { notifications, unreadCount, fetchNotifications, markAsRead } = useNotification();

  const [greeting, setGreeting] = useState('');
  const [applications, setApplications] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [dashboardDataLoading, setDashboardDataLoading] = useState(true);
  const [refreshingNotifications, setRefreshingNotifications] = useState(false);
  const [quickActionsOpen, setQuickActionsOpen] = useState(true);

  const displayName = studentData?.firstName || studentData?.fullName || currentUser?.displayName || 'Student';

  const stats = useMemo(() => {
    const pendingApplications = applications.filter((application) =>
      ['pending', 'under_review'].includes(String(application.status || '').toLowerCase()),
    ).length;
    const acceptedApplications = applications.filter((application) =>
      ['accepted', 'approved', 'hired', 'interview'].includes(String(application.status || '').toLowerCase()),
    ).length;

    return {
      profileCompletion: Number(studentData?.profileCompletion || 0),
      pendingApplications,
      acceptedApplications,
      jobMatches: recommendations.length,
    };
  }, [applications, recommendations.length, studentData?.profileCompletion]);

  const quickActions = [
    { id: 1, title: 'Update profile', to: ROUTES.STUDENT.PROFILE, Icon: UserRound },
    { id: 2, title: 'Browse opportunities', to: ROUTES.STUDENT.JOBS, Icon: BriefcaseBusiness },
    { id: 3, title: 'My applications', to: '/student/applications', Icon: FileText },
    { id: 4, title: 'My documents', to: '/student/documents', Icon: Bookmark },
  ];

  useEffect(() => {
    const updateGreeting = () => setGreeting(getTimeGreeting());
    updateGreeting();
    const timer = setInterval(updateGreeting, 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!fetchNotifications) return;
    fetchNotifications().catch((error) => console.error('Unable to refresh dashboard notifications:', error));
  }, [fetchNotifications]);

  const refreshDashboardNotifications = async () => {
    setRefreshingNotifications(true);
    try {
      await fetchNotifications?.();
    } catch (error) {
      console.error('Unable to refresh dashboard notifications:', error);
    } finally {
      setRefreshingNotifications(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const loadStudentSnapshot = async () => {
      if (!studentData?.id) {
        setDashboardDataLoading(false);
        return;
      }

      setDashboardDataLoading(true);
      const [applicationData, recommendedJobs] = await Promise.all([
        fetchApplications?.() || [],
        fetchRecommendedJobs?.() || [],
      ]);

      if (isMounted) {
        setApplications(Array.isArray(applicationData) ? applicationData : []);
        setRecommendations(Array.isArray(recommendedJobs) ? recommendedJobs : []);
        setDashboardDataLoading(false);
      }
    };

    loadStudentSnapshot();

    return () => {
      isMounted = false;
    };
  }, [studentData?.id]);

  useEffect(() => {
    if (!currentUser?.uid) { setApplications([]); return undefined; }
    return subscribeToStudentApplications(currentUser.uid, setApplications, (error) => {
      console.error('Dashboard application subscription failed:', error);
    });
  }, [currentUser?.uid]);

  if (loading) {
    return <main className="flex min-h-[50vh] items-center justify-center"><div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600" /><p className="mt-3 text-slate-500">Loading your dashboard...</p></main>;
  }

  return (
    <main className="w-full bg-slate-50 px-4 py-6 dark:bg-slate-950 sm:px-6 lg:px-8">
      <header className="mb-5 rounded-2xl bg-gradient-to-r from-brand-600 to-violet-600 p-4 text-white shadow-card sm:mb-6 sm:p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-brand-100">Student dashboard</p>
            <h1 className="mt-2 text-2xl font-semibold sm:text-3xl">{greeting}, {displayName}</h1>
            <p className="mt-2 text-sm text-brand-100">Your live snapshot of applications, progress, and upcoming opportunities.</p>
          </div>
          <div className="flex items-center gap-3">
            <TestimonialComposer userType="student" profile={studentData} />
            <button type="button" aria-label="Refresh notifications" title="Refresh notifications" aria-busy={refreshingNotifications} disabled={refreshingNotifications} className="rounded-xl bg-white/10 p-3 text-white hover:bg-white/20 disabled:cursor-wait disabled:opacity-70" onClick={refreshDashboardNotifications}><RefreshCw className={`h-5 w-5 ${refreshingNotifications ? 'animate-spin' : ''}`} /></button>
            <Link to="/student/notifications" aria-label="Notifications" title="Notifications" className="relative inline-flex rounded-xl bg-white/10 p-3 text-white hover:bg-white/20">
              <BellRing className="h-5 w-5" />
              {unreadCount > 0 && <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-semibold">{unreadCount}</span>}
            </Link>
          </div>
        </div>
      </header>

      <section className="mb-5 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card dark:border-slate-800 dark:bg-slate-900">
        <button
          type="button"
          className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
          aria-expanded={quickActionsOpen}
          aria-controls="student-quick-actions"
          onClick={() => setQuickActionsOpen((open) => !open)}
        >
          <span className="flex items-center gap-3">
            <span className="rounded-lg bg-brand-50 p-2 text-brand-700 dark:bg-brand-950 dark:text-brand-200"><Zap className="h-4 w-4" aria-hidden="true" /></span>
            <span>
              <span className="block text-sm font-semibold text-slate-900 dark:text-slate-100">Quick actions</span>
              <span className="block text-xs text-slate-500">{quickActions.length} shortcuts to your student tools</span>
            </span>
          </span>
          <ChevronDown className={`h-5 w-5 text-slate-500 transition-transform ${quickActionsOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
        </button>
        {quickActionsOpen && (
          <nav id="student-quick-actions" aria-label="Student quick actions" className="grid gap-2 border-t border-slate-100 p-3 dark:border-slate-800 sm:grid-cols-2 lg:grid-cols-4">
            {quickActions.map(({ id, title, to, Icon }) => (
              <Link key={id} to={to} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:text-brand-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-600 dark:text-slate-200 dark:hover:bg-slate-800">
                <Icon className="h-4 w-4 shrink-0 text-brand-600" aria-hidden="true" />{title}
              </Link>
            ))}
          </nav>
        )}
      </section>

      <div className="mb-5 grid grid-cols-2 gap-3 sm:mb-6 sm:gap-4 xl:grid-cols-4">
        {[
          { title: 'Profile Completion', value: `${stats.profileCompletion}%`, accent: 'text-brand-600', Icon: UserRound },
          { title: 'Applications', value: stats.pendingApplications, accent: 'text-violet-600', Icon: FileText },
          { title: 'Accepted Jobs', value: stats.acceptedApplications, accent: 'text-emerald-600', Icon: BriefcaseBusiness },
          { title: 'Job Matches', value: stats.jobMatches, accent: 'text-sky-600', Icon: Bookmark },
        ].map((item) => (
          <div key={item.title} className="min-w-0 rounded-xl border bg-white p-3 shadow-card dark:bg-slate-900 sm:p-5">
            <div className="flex items-center justify-between gap-2">
              <p className="min-w-0 text-xs font-medium text-slate-500 sm:text-sm">{item.title}</p>
              <div className="shrink-0 rounded-full bg-slate-100 p-1.5 text-slate-600 dark:bg-slate-800 dark:text-slate-300 sm:p-2"><item.Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" aria-hidden="true" /></div>
            </div>
            <h2 className={`mt-2 text-2xl font-semibold sm:mt-3 sm:text-3xl ${item.accent}`}>{item.value}</h2>
          </div>
        ))}
      </div>

      <section aria-label="Student workspace" className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Calendar', to: '/student/calendar', Icon: CalendarDays },
          { label: 'Activity', to: '/student/activity', Icon: Activity },
          { label: 'Deadlines', to: '/student/deadlines', Icon: ClipboardList },
          { label: 'Notifications', to: '/student/notifications', Icon: Bell },
        ].map(({ label, to, Icon }) => (
          <Link key={to} to={to} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-card transition hover:border-brand-300 hover:text-brand-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-brand-700">
            <Icon className="h-5 w-5 text-brand-600" aria-hidden="true" />{label}
          </Link>
        ))}
      </section>

      <div className="mb-6">
        <SocialDashboardSection audience="student" title="Campus and Career Feed" subtitle="Students can now post wins, upload portfolio media, ask for help, and follow the same kind of social rhythm people expect from modern platforms." />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.7fr_1fr]">
        <section className="space-y-6">
          <div className="rounded-xl border bg-white p-5 shadow-card dark:bg-slate-900">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Applications</h2>
              <Link to="/student/applications" className="text-sm font-medium text-brand-600">View all</Link>
            </div>
            <div className="space-y-3">
              {applications.slice(0, 3).map((application) => (
                <div key={application.id} className="flex items-center justify-between rounded-lg border border-slate-200 p-3 dark:border-slate-700">
                  <div>
                    <p className="font-medium text-slate-800 dark:text-slate-100">{application.jobTitle || application.jobName || 'Job application'}</p>
                    <p className="text-xs text-slate-500">{application.companyName || application.company || 'Company pending'}</p>
                  </div>
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-700 dark:bg-slate-800 dark:text-slate-200">{application.status || 'Pending'}</span>
                </div>
              ))}
              {!dashboardDataLoading && applications.length === 0 && <p className="text-sm text-slate-500">No applications yet. Start exploring opportunities.</p>}
              {dashboardDataLoading && <p className="text-sm text-slate-500">Loading your applications...</p>}
            </div>
          </div>
        </section>

        <aside className="space-y-6">
          <div className="rounded-xl border bg-white p-5 shadow-card dark:bg-slate-900">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Notifications</h2>
              <span className="rounded-full bg-brand-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-brand-700">{unreadCount || 0} new</span>
            </div>
            <div className="space-y-3">
              {notifications?.length ? notifications.slice(0, 4).map((notification) => (
                <button key={notification.id} type="button" onClick={() => markAsRead?.(notification.id)} className="flex w-full items-start gap-3 rounded-lg border border-slate-200 p-3 text-left hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-brand-700"><Bell className="h-4 w-4" aria-hidden="true" /></span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{notification.message || 'New update'}</p>
                    <p className="mt-1 text-[11px] text-slate-500">{notification.createdAt ? new Date(notification.createdAt).toLocaleDateString() : 'Recently'}</p>
                  </div>
                </button>
              )) : <p className="text-sm text-slate-500">No notifications yet.</p>}
            </div>
          </div>

          <div className="rounded-xl border bg-white p-5 shadow-card dark:bg-slate-900">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Recommended Jobs</h2>
              <Link to="/student/jobs" className="text-sm font-medium text-brand-600">Browse</Link>
            </div>
            <div className="space-y-3">
              {recommendations.slice(0, 3).map((job) => (
                <div key={job.id} className="rounded-lg border border-slate-200 p-3 dark:border-slate-700">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-slate-800 dark:text-slate-100">{job.title || job.jobDetails?.title || 'Recommended opportunity'}</p>
                      <p className="text-xs text-slate-500">{job.company || job.jobDetails?.company || formatLocation(job.location, 'Details available')}</p>
                    </div>
                    {job.matchScore && <span className="rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-700">{job.matchScore}%</span>}
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-[11px] text-slate-500">{job.type || job.jobDetails?.jobType || 'Opportunity'}</span>
                    <Link to={`/student/jobs/apply/${job.id}`} className="rounded-lg border border-brand-600 px-3 py-1.5 text-xs font-semibold text-brand-700 hover:bg-brand-50 dark:text-brand-300">Apply</Link>
                  </div>
                </div>
              ))}
              {!dashboardDataLoading && recommendations.length === 0 && <p className="text-sm text-slate-500">No recommendations available yet. Complete your profile to improve matching.</p>}
              {dashboardDataLoading && <p className="text-sm text-slate-500">Finding opportunities for you...</p>}
            </div>
          </div>
        </aside>
      </div>

    </main>
  );
};

export default StudentDashboard;
