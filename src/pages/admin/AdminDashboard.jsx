import { useCallback, useEffect, useMemo, useState } from 'react';
import { FaArrowDown, FaArrowUp, FaBell, FaBriefcase, FaBuilding, FaChartLine, FaCheckCircle, FaClock, FaDownload, FaEnvelope, FaEye, FaFileAlt, FaGraduationCap, FaHistory, FaSync, FaTimes, FaTimesCircle, FaTrash, FaUserCheck, FaUserPlus, FaUsers } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';

import SocialDashboardSection from '../../components/social/SocialDashboardSection';
import Button from '../../components/ui/Button';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import Modal from '../../components/ui/Modal';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import adminService from '../../services/adminService';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { currentUser, userProfile, isAdmin } = useAuth();
  const { addSuccessNotification, addErrorNotification } = useNotification();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeCompanies: 0,
    activeJobs: 0,
    pendingApprovals: 0,
    newRegistrations: 0,
    totalApplications: 0,
    totalRevenue: 0,
    systemHealth: 100,
  });
  const [statsChange, setStatsChange] = useState({
    users: 0,
    companies: 0,
    jobs: 0,
    approvals: 0,
  });
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [topCompanies, setTopCompanies] = useState([]);
  const [systemStatus, setSystemStatus] = useState({
    database: 'online',
    storage: 'online',
    api: 'online',
    email: 'online',
    lastUpdated: new Date().toISOString(),
  });
  const [selectedUser, setSelectedUser] = useState(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [timeRange, setTimeRange] = useState('week');
  const [chartData, setChartData] = useState([]);

  const loadDashboardData = useCallback(async () => {
    if (!isAdmin) return;
    setError('');
    setLoading(true);

    try {
      const [statsRes, pendingRes, activityRes, companiesRes, statusRes] = await Promise.all([
        adminService.getDashboardStats(currentUser, userProfile),
        adminService.users.getPendingApprovals(currentUser, userProfile, 5),
        adminService.getRecentActivities(currentUser, userProfile, 10),
        adminService.companies.getTopCompanies(currentUser, userProfile, 5),
        adminService.getSystemStatus(currentUser, userProfile),
      ]);

      if (statsRes.success) {
        setStats(statsRes.data.stats || {});
        setStatsChange(statsRes.data.changes || {});
        setChartData(statsRes.data.chartData || []);
      }

      if (pendingRes.success) {
        setPendingApprovals(pendingRes.data.users || []);
      }

      if (activityRes.success) {
        setRecentActivities(activityRes.data.activities || []);
      }

      if (companiesRes.success) {
        setTopCompanies(companiesRes.data.companies || []);
      }

      if (statusRes.success) {
        setSystemStatus(statusRes.data || {});
      }
    } catch (err) {
      console.error('Error loading dashboard:', err);
      setError(err.message || 'Failed to load dashboard data');
      addErrorNotification('Error', 'Failed to load dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [isAdmin, currentUser, userProfile, addErrorNotification]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  useEffect(() => {
    if (!isAdmin) return;
    const interval = setInterval(() => {
      loadDashboardData();
    }, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, [isAdmin, loadDashboardData]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  const handleApproveUser = async () => {
    if (!selectedUser) return;
    setActionLoading(true);

    try {
      const response = await adminService.users.approveUser(
        selectedUser.id,
        'Approved from dashboard',
        currentUser,
        userProfile
      );

      if (response.success) {
        addSuccessNotification('Success', 'User approved successfully');
        setShowApproveModal(false);
        setSelectedUser(null);
        await loadDashboardData();
      } else {
        throw new Error(response.error || 'Failed to approve user');
      }
    } catch (err) {
      console.error('Error approving user:', err);
      addErrorNotification('Error', err.message || 'Failed to approve user');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectUser = async () => {
    if (!selectedUser || !rejectReason.trim()) return;
    setActionLoading(true);

    try {
      const response = await adminService.users.rejectUser(
        selectedUser.id,
        rejectReason,
        currentUser,
        userProfile
      );

      if (response.success) {
        addSuccessNotification('Success', 'User rejected successfully');
        setShowRejectModal(false);
        setRejectReason('');
        setSelectedUser(null);
        await loadDashboardData();
      } else {
        throw new Error(response.error || 'Failed to reject user');
      }
    } catch (err) {
      console.error('Error rejecting user:', err);
      addErrorNotification('Error', err.message || 'Failed to reject user');
    } finally {
      setActionLoading(false);
    }
  };

  const handleExportReport = async () => {
    try {
      const response = await adminService.getDashboardReport(currentUser, userProfile, timeRange);

      if (response.success && response.data) {
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `admin-report-${timeRange}-${new Date().toISOString().slice(0, 10)}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        addSuccessNotification('Success', 'Report downloaded successfully');
      } else {
        throw new Error(response.error || 'Failed to generate report');
      }
    } catch (err) {
      console.error('Error generating report:', err);
      addErrorNotification('Error', 'Failed to generate report');
    }
  };

  const formatDate = (value) => {
    if (!value) return 'N/A';
    return new Date(value).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatRelativeTime = (value) => {
    if (!value) return 'N/A';
    const diff = Date.now() - new Date(value).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return formatDate(value);
  };

  const getUserTypeBadge = (userType) => {
    const config = {
      company: { label: 'Company', color: 'bg-amber-100 text-amber-700' },
      institute: { label: 'Institute', color: 'bg-sky-100 text-sky-700' },
      entrepreneur: { label: 'Entrepreneur', color: 'bg-emerald-100 text-emerald-700' },
      youth: { label: 'Youth', color: 'bg-indigo-100 text-indigo-700' },
      student: { label: 'Student', color: 'bg-slate-100 text-slate-700' },
      employer: { label: 'Employer', color: 'bg-slate-100 text-slate-700' },
      mentor: { label: 'Mentor', color: 'bg-purple-100 text-purple-700' },
      parent: { label: 'Parent', color: 'bg-pink-100 text-pink-700' },
    };
    const c = config[userType] || { label: userType, color: 'bg-slate-100 text-slate-700' };
    return (
      <span
        className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${c.color}`}
      >
        {c.label}
      </span>
    );
  };

  const statCards = useMemo(
    () => [
      {
        title: 'Total Users',
        value: stats.totalUsers,
        change: statsChange.users,
        accent: 'text-brand-600',
        bg: 'bg-brand-100',
        icon: FaUsers,
        action: '/admin/users',
      },
      {
        title: 'Companies',
        value: stats.activeCompanies,
        change: statsChange.companies,
        accent: 'text-sky-600',
        bg: 'bg-sky-100',
        icon: FaBuilding,
        action: '/admin/companies',
      },
      {
        title: 'Active Jobs',
        value: stats.activeJobs,
        change: statsChange.jobs,
        accent: 'text-amber-600',
        bg: 'bg-amber-100',
        icon: FaBriefcase,
        action: '/admin/jobs',
      },
      {
        title: 'Pending Approvals',
        value: stats.pendingApprovals,
        change: statsChange.approvals,
        accent: 'text-red-600',
        bg: 'bg-red-100',
        icon: FaClock,
        action: '/admin/pending-approvals',
      },
    ],
    [stats, statsChange]
  );

  if (!isAdmin) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-6 dark:bg-slate-950">
        <div className="mx-auto max-w-4xl">
          <Card>
            <CardBody>
              <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-700">
                <FaTimesCircle className="mb-3 h-10 w-10" />
                <h2 className="text-xl font-semibold">Access Denied</h2>
                <p className="mt-1 text-sm">
                  You must be an administrator to access the dashboard.
                </p>
              </div>
            </CardBody>
          </Card>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 dark:bg-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1600px]">
        {/* Header */}
        <header className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600">
                Admin Dashboard
              </p>
              <h1 className="mt-2 text-3xl font-bold text-slate-900 dark:text-slate-100">
                Welcome back, {userProfile?.displayName || 'Administrator'}
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Here's what's happening across the platform today.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800"
              >
                <option value="day">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="year">This Year</option>
              </select>
              <Button variant="outline" size="sm" onClick={handleExportReport}>
                <FaDownload className="mr-2" /> Export Report
              </Button>
              <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
                <FaSync className={`mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </header>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <div className="flex items-center justify-between">
              <span>{error}</span>
              <button onClick={() => setError('')} className="text-red-500 hover:text-red-700">
                <FaTimes />
              </button>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {statCards.map((item) => {
            const Icon = item.icon;
            const isPositive = item.change >= 0;
            return (
              <div
                key={item.title}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-slate-700 dark:bg-slate-900"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">{item.title}</p>
                    <h2 className={`mt-2 text-3xl font-bold ${item.accent}`}>
                      {loading ? '—' : item.value.toLocaleString()}
                    </h2>
                  </div>
                  <span
                    className={`flex h-11 w-11 items-center justify-center rounded-lg ${item.bg}`}
                  >
                    <Icon className={`h-5 w-5 ${item.accent}`} />
                  </span>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <div
                    className={`flex items-center gap-1 text-xs font-semibold ${
                      isPositive ? 'text-emerald-600' : 'text-red-600'
                    }`}
                  >
                    {isPositive ? <FaArrowUp /> : <FaArrowDown />}
                    {Math.abs(item.change)}%
                    <span className="font-normal text-slate-400">vs last period</span>
                  </div>
                  <button
                    onClick={() => navigate(item.action)}
                    className="text-xs font-semibold text-brand-600 hover:text-brand-700"
                  >
                    View →
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Main Grid */}
        <div className="mb-6 grid gap-6 xl:grid-cols-[2fr_1fr]">
          <div className="space-y-6">
            {/* Platform Conversation */}
            <SocialDashboardSection
              audience="admin"
              title="Platform Conversation"
              subtitle="Monitor community activity and keep the platform aligned with real user momentum."
            />

            {/* Pending Approvals */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FaClock className="text-amber-600" />
                    <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                      Pending Approvals
                    </h2>
                  </div>
                  <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">
                    {pendingApprovals.length}
                  </span>
                </div>
              </CardHeader>
              <CardBody className="p-0">
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600" />
                    <p className="mt-3 text-sm text-slate-500">Loading...</p>
                  </div>
                ) : pendingApprovals.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <FaCheckCircle className="mb-3 h-10 w-10 text-emerald-400" />
                    <p className="text-sm text-slate-500">No pending approvals</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-200 dark:divide-slate-700">
                    {pendingApprovals.slice(0, 5).map((user) => (
                      <div
                        key={user.id}
                        className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-brand-700">
                            <FaUserPlus />
                          </div>
                          <div>
                            <p className="font-medium text-slate-800 dark:text-slate-100">
                              {user.displayName || 'Unknown User'}
                            </p>
                            <p className="flex items-center gap-1 text-xs text-slate-500">
                              <FaEnvelope className="h-3 w-3" />
                              {user.email}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getUserTypeBadge(user.userType)}
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setShowApproveModal(true);
                            }}
                            className="rounded-lg border border-emerald-200 px-3 py-1.5 text-xs font-semibold text-emerald-600 transition hover:bg-emerald-50"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setShowRejectModal(true);
                            }}
                            className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    ))}
                    {pendingApprovals.length > 5 && (
                      <div className="p-4 text-center">
                        <button
                          onClick={() => navigate('/admin/pending-approvals')}
                          className="text-sm font-semibold text-brand-600 hover:text-brand-700"
                        >
                          View all {pendingApprovals.length} pending approvals →
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </CardBody>
            </Card>

            {/* Recent Activities */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <FaHistory className="text-slate-500" />
                  <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                    Recent System Activities
                  </h2>
                </div>
              </CardHeader>
              <CardBody className="p-0">
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600" />
                  </div>
                ) : recentActivities.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <FaHistory className="mb-3 h-10 w-10 text-slate-300" />
                    <p className="text-sm text-slate-500">No recent activity</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-200 dark:divide-slate-700">
                    {recentActivities.slice(0, 6).map((activity) => (
                      <div key={activity.id} className="flex items-start gap-3 p-4">
                        <span className="mt-1.5 flex h-2 w-2 flex-shrink-0 rounded-full bg-brand-500" />
                        <div className="flex-1">
                          <p className="text-sm text-slate-700 dark:text-slate-200">
                            {activity.description}
                          </p>
                          <p className="mt-0.5 text-xs text-slate-500">
                            {formatRelativeTime(activity.timestamp)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardBody>
            </Card>
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  Quick Actions
                </h2>
              </CardHeader>
              <CardBody>
                <div className="grid gap-2">
                  <Button
                    variant="outline"
                    onClick={() => navigate('/admin/pending-approvals')}
                    className="justify-start"
                  >
                    <FaUserCheck className="mr-2" /> Review Approvals
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate('/admin/companies')}
                    className="justify-start"
                  >
                    <FaBuilding className="mr-2" /> Manage Companies
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate('/admin/jobs')}
                    className="justify-start"
                  >
                    <FaBriefcase className="mr-2" /> Review Jobs
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate('/admin/users')}
                    className="justify-start"
                  >
                    <FaUsers className="mr-2" /> User Management
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate('/admin/admissions')}
                    className="justify-start"
                  >
                    <FaGraduationCap className="mr-2" /> Admissions
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate('/admin/audit')}
                    className="justify-start"
                  >
                    <FaHistory className="mr-2" /> Audit Logs
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate('/admin/reports')}
                    className="justify-start"
                  >
                    <FaFileAlt className="mr-2" /> System Reports
                  </Button>
                </div>
              </CardBody>
            </Card>

            {/* System Status */}
            <Card>
              <CardHeader>
                <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  System Status
                </h2>
              </CardHeader>
              <CardBody>
                <div className="space-y-3 text-sm">
                  {[
                    { label: 'Database', status: systemStatus.database },
                    { label: 'Storage', status: systemStatus.storage },
                    { label: 'API', status: systemStatus.api },
                    { label: 'Email Service', status: systemStatus.email },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between">
                      <span className="text-slate-600 dark:text-slate-300">{item.label}</span>
                      <span
                        className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${
                          item.status === 'online'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {item.status || 'unknown'}
                      </span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between border-t border-slate-200 pt-3 dark:border-slate-700">
                    <span className="text-slate-600 dark:text-slate-300">Last Updated</span>
                    <span className="text-xs text-slate-500">
                      {formatRelativeTime(systemStatus.lastUpdated)}
                    </span>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Top Companies */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                    Top Companies
                  </h2>
                  <button
                    onClick={() => navigate('/admin/companies')}
                    className="text-xs font-semibold text-brand-600 hover:text-brand-700"
                  >
                    View All
                  </button>
                </div>
              </CardHeader>
              <CardBody className="p-0">
                {topCompanies.length === 0 ? (
                  <div className="p-6 text-center text-sm text-slate-500">
                    No company data available
                  </div>
                ) : (
                  <div className="divide-y divide-slate-200 dark:divide-slate-700">
                    {topCompanies.map((company, idx) => (
                      <div key={company.id} className="flex items-center gap-3 p-3">
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600 dark:bg-slate-800">
                          {idx + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">
                            {company.companyName || company.name}
                          </p>
                          <p className="text-xs text-slate-500">
                            {company.activeJobs || 0} active jobs
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardBody>
            </Card>

            {/* Chart placeholder */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <FaChartLine className="text-brand-600" />
                  <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                    Growth Trends
                  </h2>
                </div>
              </CardHeader>
              <CardBody>
                <div className="space-y-3">
                  {chartData.length === 0 ? (
                    <p className="text-center text-sm text-slate-500">No chart data available</p>
                  ) : (
                    chartData.slice(0, 5).map((point, idx) => (
                      <div key={idx}>
                        <div className="mb-1 flex items-center justify-between text-xs">
                          <span className="text-slate-600 dark:text-slate-300">
                            {point.label}
                          </span>
                          <span className="font-semibold text-slate-800 dark:text-slate-100">
                            {point.value}
                          </span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                          <div
                            className="h-full rounded-full bg-brand-500 transition-all"
                            style={{
                              width: `${Math.min(100, (point.value / (stats.totalUsers || 1)) * 100)}%`,
                            }}
                          />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardBody>
            </Card>
          </aside>
        </div>
      </div>

      {/* Approve Modal */}
      <Modal
        isOpen={showApproveModal}
        onClose={() => {
          setShowApproveModal(false);
          setSelectedUser(null);
        }}
        title="Approve User"
      >
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Are you sure you want to approve{' '}
          <strong>{selectedUser?.displayName || selectedUser?.email}</strong>?
        </p>
        <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
          The user will be notified and gain access to the platform.
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setShowApproveModal(false);
              setSelectedUser(null);
            }}
          >
            Cancel
          </Button>
          <Button variant="primary" onClick={handleApproveUser} disabled={actionLoading}>
            {actionLoading ? 'Approving...' : 'Approve User'}
          </Button>
        </div>
      </Modal>

      {/* Reject Modal */}
      <Modal
        isOpen={showRejectModal}
        onClose={() => {
          setShowRejectModal(false);
          setRejectReason('');
          setSelectedUser(null);
        }}
        title="Reject User"
      >
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
          This will notify the user that their registration was not approved.
        </div>
        <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">
          Are you sure you want to reject{' '}
          <strong>{selectedUser?.displayName || selectedUser?.email}</strong>?
        </p>
        <div className="mt-4">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
            Reason for rejection *
          </label>
          <textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            rows={4}
            placeholder="Provide a clear reason for rejection..."
            className="mt-1 w-full rounded-lg border border-slate-200 p-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 dark:border-slate-700 dark:bg-slate-800"
          />
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setShowRejectModal(false);
              setRejectReason('');
              setSelectedUser(null);
            }}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleRejectUser}
            disabled={actionLoading || !rejectReason.trim()}
          >
            {actionLoading ? 'Rejecting...' : 'Reject User'}
          </Button>
        </div>
      </Modal>
    </main>
  );
};

export default AdminDashboard;