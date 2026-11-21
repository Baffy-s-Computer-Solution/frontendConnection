/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  DollarSign,
  Star,
  Users,
  TrendingUp,
  Video,
  MessageCircle,
  Bell,
  Settings,
  ChevronRight,
  Activity,
  Award,
  BookOpen,
  Briefcase,
  ArrowUpRight,
  RefreshCw,
} from 'lucide-react';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';

import { mentorService } from '../../services/mentorService';
import { useAuth } from '../../hooks/useAuth';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const MentorDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState('30d');

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user, selectedPeriod]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Load profile
      const profileData = await mentorService.getMentorProfile(user.uid);
      if (profileData.success) {
        setProfile(profileData.data);
      }

      // Load analytics
      const analyticsData = await mentorService.getAnalytics(user.uid, selectedPeriod);
      if (analyticsData.success) {
        setAnalytics(analyticsData.data);
      }

      // Load upcoming sessions
      const sessionsData = await mentorService.getMentorSessions(user.uid, {
        status: 'scheduled',
      });
      if (sessionsData.success) {
        const upcoming = sessionsData.data
          .filter((session) => {
            const date = session.scheduledAt?.toDate?.() || new Date(session.scheduledAt);
            return date > new Date();
          })
          .sort((a, b) => {
            const dateA = a.scheduledAt?.toDate?.() || new Date(a.scheduledAt);
            const dateB = b.scheduledAt?.toDate?.() || new Date(b.scheduledAt);
            return dateA - dateB;
          })
          .slice(0, 5);
        setUpcomingSessions(upcoming);
      }

      setRecentActivity([]);
      setNotifications([]);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const chartData = {
    labels: analytics?.charts?.sessionsByMonth ? Object.keys(analytics.charts.sessionsByMonth) : [],
    datasets: [
      {
        label: 'Sessions',
        data: analytics?.charts?.sessionsByMonth
          ? Object.values(analytics.charts.sessionsByMonth)
          : [],
        borderColor: '#4F46E5',
        backgroundColor: 'rgba(79, 70, 229, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const earningsChartData = {
    labels: analytics?.charts?.earningsByMonth ? Object.keys(analytics.charts.earningsByMonth) : [],
    datasets: [
      {
        label: 'Earnings ($)',
        data: analytics?.charts?.earningsByMonth
          ? Object.values(analytics.charts.earningsByMonth)
          : [],
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const doughnutData = {
    labels: ['Completed', 'Cancelled', 'No-Show'],
    datasets: [
      {
        data: [
          analytics?.summary?.completedSessions || 0,
          analytics?.summary?.cancelledSessions || 0,
          0,
        ],
        backgroundColor: ['#10B981', '#EF4444', '#F59E0B'],
        borderWidth: 0,
      },
    ],
  };

  if (loading) {
    return (
      <div className="mentor-loading">
        <div className="spinner"></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  return (
      <main className="mx-auto w-full max-w-7xl space-y-5 px-4 py-5 sm:space-y-8 sm:px-6 sm:py-8 lg:px-8">
      {/* Welcome Header */}
      <motion.div
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-700 via-indigo-600 to-violet-600 p-4 text-white shadow-xl shadow-indigo-950/10 sm:p-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-6">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-indigo-100">Mentor workspace</p>
            <h1 className="text-2xl font-bold tracking-tight sm:text-4xl">Welcome back, {profile?.fullName || user?.displayName || 'Mentor'}</h1>
            <p className="mt-2 max-w-2xl text-sm text-indigo-100 sm:mt-3 sm:text-base">Your mentoring work, sessions, and student progress at a glance.</p>
          </div>
          <div className="flex items-center gap-3">
            <button type="button" onClick={loadDashboardData} className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/25 bg-white/10 text-white transition hover:bg-white/20" aria-label="Refresh dashboard"><RefreshCw size={19} /></button>
            <Link to="/mentor/settings" className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-indigo-700 shadow-sm transition hover:bg-indigo-50"><Settings size={17} /> Settings</Link>
          </div>
        </div>
        <div aria-hidden="true" className="absolute -right-10 -top-24 h-72 w-72 rounded-full border-[36px] border-white/10" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl border border-indigo-100 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-5"
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div><h2 className="text-lg font-semibold text-slate-900 dark:text-white">Keep your mentoring moving</h2><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Jump straight to the work that needs your attention.</p></div>
          <div className="flex flex-wrap gap-2">
            {[['Sessions', '/mentor/sessions', Calendar], ['Applications', '/mentor/applications', Briefcase], ['Mentees', '/mentor/mentees', Users], ['Earnings', '/mentor/earnings', DollarSign]].map(([label, href, Icon]) => <Link key={href} to={href} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 sm:text-sm"><Icon size={15} />{label}<ArrowUpRight size={13} /></Link>)}
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
        <motion.div
          className="flex min-w-0 items-center gap-2.5 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:block sm:p-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-500/10 sm:h-11 sm:w-11">
            <Users size={17} color="#4F46E5" />
          </div>
          <div className="min-w-0 sm:mt-4">
            <h3 className="truncate text-[11px] font-medium text-slate-500 dark:text-slate-400 sm:text-sm">Mentees supported</h3>
            <p className="mt-0.5 text-xl font-bold tracking-tight text-slate-900 dark:text-white sm:mt-1 sm:text-3xl">{analytics?.summary?.uniqueStudents || 0}</p>
            <span className="mt-1 hidden text-xs text-slate-500 sm:block">Across your mentoring journey</span>
          </div>
        </motion.div>

        <motion.div
          className="flex min-w-0 items-center gap-2.5 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:block sm:p-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-500/10 sm:h-11 sm:w-11">
            <Calendar size={17} color="#10B981" />
          </div>
          <div className="min-w-0 sm:mt-4">
            <h3 className="truncate text-[11px] font-medium text-slate-500 dark:text-slate-400 sm:text-sm">Sessions delivered</h3>
            <p className="mt-0.5 text-xl font-bold tracking-tight text-slate-900 dark:text-white sm:mt-1 sm:text-3xl">{analytics?.summary?.totalSessions || 0}</p>
            <span className="mt-1 hidden text-xs text-slate-500 sm:block">{analytics?.summary?.completedSessions || 0} completed</span>
          </div>
        </motion.div>

        <motion.div
          className="flex min-w-0 items-center gap-2.5 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:block sm:p-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-500/10 sm:h-11 sm:w-11">
            <DollarSign size={17} color="#F59E0B" />
          </div>
          <div className="min-w-0 sm:mt-4">
            <h3 className="truncate text-[11px] font-medium text-slate-500 dark:text-slate-400 sm:text-sm">Total earnings</h3>
            <p className="mt-0.5 truncate text-xl font-bold tracking-tight text-slate-900 dark:text-white sm:mt-1 sm:text-3xl">${analytics?.summary?.totalEarnings || 0}</p>
            <span className="mt-1 hidden text-xs text-slate-500 sm:block">View earnings and payouts</span>
          </div>
        </motion.div>

        <motion.div
          className="flex min-w-0 items-center gap-2.5 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:block sm:p-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-50 dark:bg-rose-500/10 sm:h-11 sm:w-11">
            <Star size={17} color="#EF4444" />
          </div>
          <div className="min-w-0 sm:mt-4">
            <h3 className="truncate text-[11px] font-medium text-slate-500 dark:text-slate-400 sm:text-sm">Average rating</h3>
            <p className="mt-0.5 truncate text-xl font-bold tracking-tight text-slate-900 dark:text-white sm:mt-1 sm:text-3xl">{analytics?.summary?.averageRating || '—'} <span className="text-base text-amber-500 sm:text-lg">★</span></p>
            <span className="mt-1 hidden text-xs text-slate-500 sm:block">{analytics?.summary?.totalReviews || 0} student reviews</span>
          </div>
        </motion.div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <motion.div
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 xl:col-span-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Sessions overview</h3>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
          </div>
          <div className="h-64">
            <Line
              data={chartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false,
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    grid: {
                      display: true,
                      color: 'rgba(0,0,0,0.05)',
                    },
                  },
                  x: {
                    grid: {
                      display: false,
                    },
                  },
                },
              }}
            />
          </div>
        </motion.div>

        <motion.div
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Session completion</h3>
          <div className="mx-auto mt-4 h-56 max-w-56">
            <Doughnut
              data={doughnutData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                cutout: '70%',
                plugins: {
                  legend: {
                    position: 'bottom',
                  },
                },
              }}
            />
          </div>
          <div className="mt-3 text-center">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">{analytics?.summary?.completionRate || 0}%</span>
            <span className="ml-2 text-sm text-slate-500">completion rate</span>
          </div>
        </motion.div>
      </div>

      {/* Upcoming Sessions & Activity */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <motion.div
          className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-800">
            <h3 className="font-semibold text-slate-900 dark:text-white">Upcoming sessions</h3>
            <Link to="/mentor/sessions" className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-700">View all <ChevronRight size={16} />
            </Link>
          </div>
          <div className="divide-y divide-slate-100 px-5 dark:divide-slate-800">
            {upcomingSessions.length > 0 ? (
              upcomingSessions.map((session) => (
                <div key={session.id} className="flex items-center gap-4 py-4">
                  <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300">
                    <Calendar size={17} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="truncate text-sm font-semibold text-slate-900 dark:text-white">{session.studentName || 'Student'}</h4>
                    <p className="mt-1 truncate text-sm text-slate-500">{session.topic || 'Mentoring session'}</p>
                    <p className="mt-1 flex items-center gap-1 text-xs text-slate-500"><Clock size={13} />{(session.scheduledAt?.toDate?.() || new Date(session.scheduledAt)).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</p>
                  </div>
                  <button type="button" onClick={() => navigate('/mentor/sessions')} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">Manage</button>
                </div>
              ))
            ) : (
              <p className="py-8 text-center text-sm text-slate-500">No upcoming sessions. Your scheduled meetings will appear here.</p>
            )}
          </div>
        </motion.div>

        <motion.div
          className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <div className="border-b border-slate-100 px-5 py-4 dark:border-slate-800">
            <h3 className="font-semibold text-slate-900 dark:text-white">Recent activity</h3>
          </div>
          <div className="divide-y divide-slate-100 px-5 dark:divide-slate-800">
            {recentActivity.length ? recentActivity.map((activity) => {
              const Icon = activity.icon;
              return (
                <div key={activity.id} className="flex items-center gap-3 py-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-indigo-600 dark:bg-slate-800 dark:text-indigo-300">
                    <Icon size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{activity.message}</p>
                    <span className="mt-1 block text-xs text-slate-500">{activity.time}</span>
                  </div>
                </div>
              );
            }) : <p className="py-8 text-center text-sm text-slate-500">Activity from your sessions and profile will appear here.</p>}
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
      >
        <h3 className="font-semibold text-slate-900 dark:text-white">Quick actions</h3>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {[[Video, 'Sessions', '/mentor/sessions'], [MessageCircle, 'Messages', '/mentor/messages'], [Calendar, 'Availability', '/mentor/schedule'], [DollarSign, 'Earnings', '/mentor/earnings'], [Briefcase, 'Resources', '/mentor/resources'], [Award, 'Reviews', '/mentor/reviews']].map(([Icon, label, href]) => <Link key={href} to={href} className="flex items-center gap-3 rounded-xl border border-slate-200 p-3 text-sm font-medium text-slate-700 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"><span className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300"><Icon size={17} /></span>{label}<ArrowUpRight className="ml-auto" size={15} /></Link>)}
        </div>
      </motion.div>
      </main>
  );
};

export default MentorDashboard;
