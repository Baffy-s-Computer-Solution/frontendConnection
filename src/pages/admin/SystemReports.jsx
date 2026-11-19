import { useCallback, useEffect, useMemo, useState } from 'react';
import { FaArrowDown, FaArrowUp, FaBriefcase, FaBuilding, FaCalendar, FaChartBar, FaChartLine, FaCheckCircle, FaDownload, FaEnvelope, FaFileAlt, FaFileCsv, FaFilePdf, FaFilter, FaGraduationCap, FaSync, FaTimes, FaTimesCircle, FaUserCheck, FaUsers } from "react-icons/fa";

import AdminPageShell from '../../components/admin/AdminPageShell';
import Button from '../../components/ui/Button';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import Modal from '../../components/ui/Modal';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import adminService from '../../services/adminService';

const rangeLabels = {
  day: 'Today',
  week: 'This Week',
  month: 'This Month',
  quarter: 'This Quarter',
  year: 'This Year',
  custom: 'Custom Range',
};

const SystemReports = () => {
  const { currentUser, userProfile, isAdmin } = useAuth();
  const { addSuccessNotification, addErrorNotification } = useNotification();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [dateRange, setDateRange] = useState('month');
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFormat, setExportFormat] = useState('pdf');
  const [exporting, setExporting] = useState(false);
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState({
    userGrowth: [],
    applications: [],
    jobPostings: [],
    revenue: [],
  });
  const [breakdowns, setBreakdowns] = useState({
    usersByType: {},
    usersByStatus: {},
    jobsByType: {},
    applicationsByStatus: {},
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [topPerformers, setTopPerformers] = useState([]);
  const [systemMetrics, setSystemMetrics] = useState({
    uptime: 99.9,
    avgResponseTime: 145,
    errorRate: 0.2,
    activeSessions: 0,
    storageUsed: 0,
    storageTotal: 100,
  });

  const loadReports = useCallback(async () => {
    if (!isAdmin) return;
    setError('');
    setLoading(true);

    try {
      const response = await adminService.reports.getSystemReport(
        { dateRange },
        currentUser,
        userProfile
      );

      if (response.success) {
        setStats(response.data.stats || {});
        setChartData(response.data.chartData || chartData);
        setBreakdowns(response.data.breakdowns || breakdowns);
        setRecentActivities(response.data.recentActivities || []);
        setTopPerformers(response.data.topPerformers || []);
        setSystemMetrics((prev) => ({ ...prev, ...(response.data.systemMetrics || {}) }));
      } else {
        throw new Error(response.error || 'Failed to load reports');
      }
    } catch (err) {
      console.error('Error loading reports:', err);
      setError(err.message || 'Failed to load reports');
      addErrorNotification('Error', 'Failed to load system reports');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [isAdmin, dateRange, currentUser, userProfile, addErrorNotification]);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadReports();
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const response = await adminService.reports.exportSystemReport(
        { dateRange, format: exportFormat },
        currentUser,
        userProfile
      );

      if (response.success && response.data) {
        const mimeTypes = {
          pdf: 'application/pdf',
          csv: 'text/csv',
          json: 'application/json',
          excel: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        };

        const blob = new Blob([response.data], {
          type: mimeTypes[exportFormat] || 'application/octet-stream',
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `system-report-${dateRange}-${new Date().toISOString().slice(0, 10)}.${exportFormat}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        addSuccessNotification('Success', `Report exported as ${exportFormat.toUpperCase()}`);
        setShowExportModal(false);
      } else {
        throw new Error(response.error || 'Export failed');
      }
    } catch (err) {
      console.error('Export error:', err);
      addErrorNotification('Error', err.message || 'Failed to export report');
    } finally {
      setExporting(false);
    }
  };

  const formatNumber = (num) => {
    if (num === null || num === undefined) return '0';
    return num.toLocaleString();
  };

  const formatPercentage = (num) => {
    if (num === null || num === undefined) return '0%';
    return `${num.toFixed(1)}%`;
  };

  const formatDate = (value) => {
    if (!value) return 'N/A';
    return new Date(value).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const keyMetrics = useMemo(() => {
    if (!stats) return [];
    return [
      {
        label: 'Total Users',
        value: stats.totalUsers || 0,
        change: stats.usersChange || 0,
        icon: FaUsers,
        color: 'text-brand-700',
        bg: 'bg-brand-100',
        accent: 'bg-brand-500',
      },
      {
        label: 'Companies',
        value: stats.activeCompanies || 0,
        change: stats.companiesChange || 0,
        icon: FaBuilding,
        color: 'text-sky-700',
        bg: 'bg-sky-100',
        accent: 'bg-sky-500',
      },
      {
        label: 'Active Jobs',
        value: stats.activeJobs || 0,
        change: stats.jobsChange || 0,
        icon: FaBriefcase,
        color: 'text-amber-700',
        bg: 'bg-amber-100',
        accent: 'bg-amber-500',
      },
      {
        label: 'Applications',
        value: stats.totalApplications || 0,
        change: stats.applicationsChange || 0,
        icon: FaFileAlt,
        color: 'text-emerald-700',
        bg: 'bg-emerald-100',
        accent: 'bg-emerald-500',
      },
    ];
  }, [stats]);

  const maxChartValue = (data) => {
    if (!data || data.length === 0) return 1;
    return Math.max(...data.map((d) => d.value || 0), 1);
  };

  if (!isAdmin) {
    return (
      <AdminPageShell
        title="System Reports"
        description="Access denied - Admin privileges required"
        icon={FaChartLine}
      >
        <Card>
          <CardBody>
            <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-700">
              <FaTimesCircle className="mb-3 h-10 w-10" />
              <h2 className="text-xl font-semibold">Access Denied</h2>
              <p className="mt-1 text-sm">
                You must be an administrator to view system reports.
              </p>
            </div>
          </CardBody>
        </Card>
      </AdminPageShell>
    );
  }

  return (
    <AdminPageShell
      title="System Reports"
      description="Comprehensive platform analytics, insights, and performance metrics"
      icon={FaChartLine}
      actions={
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowExportModal(true)}>
            <FaDownload className="mr-2" /> Export
          </Button>
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
            <FaSync className={`mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      }
    >
      {/* Date Range Selector */}
      <Card className="mb-6">
        <CardBody>
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap gap-2">
              {['day', 'week', 'month', 'quarter', 'year'].map((range) => (
                <button
                  key={range}
                  onClick={() => setDateRange(range)}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                    dateRange === range
                      ? 'bg-brand-600 text-white shadow-sm'
                      : 'border border-slate-200 bg-white text-slate-600 hover:border-brand-300 hover:text-brand-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                  }`}
                >
                  {rangeLabels[range]}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <FaCalendar />
              <span>Data range: {rangeLabels[dateRange]}</span>
            </div>
          </div>
        </CardBody>
      </Card>

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

      {loading ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white py-24 dark:border-slate-700 dark:bg-slate-900">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600" />
          <p className="mt-4 text-sm text-slate-500">Loading report data...</p>
        </div>
      ) : (
        <>
          {/* Key Metrics */}
          <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {keyMetrics.map((metric) => {
              const Icon = metric.icon;
              const isPositive = metric.change >= 0;
              return (
                <div
                  key={metric.label}
                  className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-slate-700 dark:bg-slate-900"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-500">{metric.label}</p>
                      <h2 className={`mt-2 text-3xl font-bold ${metric.color}`}>
                        {formatNumber(metric.value)}
                      </h2>
                    </div>
                    <span
                      className={`flex h-11 w-11 items-center justify-center rounded-lg ${metric.bg}`}
                    >
                      <Icon className={`h-5 w-5 ${metric.color}`} />
                    </span>
                  </div>
                  <div
                    className={`mt-3 flex items-center gap-1 text-xs font-semibold ${
                      isPositive ? 'text-emerald-600' : 'text-red-600'
                    }`}
                  >
                    {isPositive ? <FaArrowUp /> : <FaArrowDown />}
                    {Math.abs(metric.change).toFixed(1)}%
                    <span className="font-normal text-slate-400">vs previous</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* System Health */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center gap-2">
                <FaCheckCircle className="text-emerald-600" />
                <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  System Health
                </h2>
              </div>
            </CardHeader>
            <CardBody>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-700">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Uptime
                  </p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-2xl font-bold text-emerald-600">
                      {formatPercentage(systemMetrics.uptime)}
                    </span>
                    <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
                      Healthy
                    </span>
                  </div>
                </div>
                <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-700">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Avg Response Time
                  </p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-2xl font-bold text-sky-600">
                      {systemMetrics.avgResponseTime}ms
                    </span>
                    <span className="rounded-full bg-sky-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-sky-700">
                      Fast
                    </span>
                  </div>
                </div>
                <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-700">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Error Rate
                  </p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-2xl font-bold text-emerald-600">
                      {formatPercentage(systemMetrics.errorRate)}
                    </span>
                    <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
                      Excellent
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-300">Storage Used</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-100">
                    {systemMetrics.storageUsed}GB / {systemMetrics.storageTotal}GB
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div
                    className="h-full rounded-full bg-brand-500 transition-all"
                    style={{
                      width: `${Math.min(
                        100,
                        (systemMetrics.storageUsed / systemMetrics.storageTotal) * 100
                      )}%`,
                    }}
                  />
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Chart Breakdowns */}
          <div className="mb-6 grid gap-6 lg:grid-cols-2">
            {/* User Distribution */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <FaUsers className="text-brand-600" />
                  <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                    User Distribution
                  </h2>
                </div>
              </CardHeader>
              <CardBody>
                {Object.keys(breakdowns.usersByType || {}).length === 0 ? (
                  <p className="py-8 text-center text-sm text-slate-500">No data available</p>
                ) : (
                  <div className="space-y-3">
                    {Object.entries(breakdowns.usersByType).map(([type, count]) => {
                      const total = Object.values(breakdowns.usersByType).reduce(
                        (a, b) => a + b,
                        0
                      );
                      const percentage = total > 0 ? (count / total) * 100 : 0;
                      return (
                        <div key={type}>
                          <div className="mb-1 flex items-center justify-between text-sm">
                            <span className="font-medium capitalize text-slate-700 dark:text-slate-200">
                              {type}
                            </span>
                            <span className="text-slate-500">
                              {count} ({percentage.toFixed(1)}%)
                            </span>
                          </div>
                          <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                            <div
                              className="h-full rounded-full bg-brand-500 transition-all"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardBody>
            </Card>

            {/* User Status */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <FaUserCheck className="text-emerald-600" />
                  <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                    User Status Breakdown
                  </h2>
                </div>
              </CardHeader>
              <CardBody>
                {Object.keys(breakdowns.usersByStatus || {}).length === 0 ? (
                  <p className="py-8 text-center text-sm text-slate-500">No data available</p>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(breakdowns.usersByStatus).map(([status, count]) => {
                      const colorMap = {
                        active: 'bg-emerald-100 text-emerald-700',
                        pending: 'bg-amber-100 text-amber-700',
                        suspended: 'bg-red-100 text-red-700',
                        rejected: 'bg-slate-100 text-slate-700',
                        verified: 'bg-sky-100 text-sky-700',
                      };
                      const colorClass = colorMap[status] || 'bg-slate-100 text-slate-700';
                      return (
                        <div
                          key={status}
                          className={`rounded-lg p-3 ${colorClass}`}
                        >
                          <p className="text-xs font-semibold uppercase tracking-wide">
                            {status}
                          </p>
                          <p className="mt-1 text-2xl font-bold">{count}</p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardBody>
            </Card>
          </div>

          {/* Chart Breakdowns - Jobs & Applications */}
          <div className="mb-6 grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <FaBriefcase className="text-amber-600" />
                  <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                    Jobs by Type
                  </h2>
                </div>
              </CardHeader>
              <CardBody>
                {Object.keys(breakdowns.jobsByType || {}).length === 0 ? (
                  <p className="py-8 text-center text-sm text-slate-500">No data available</p>
                ) : (
                  <div className="space-y-3">
                    {Object.entries(breakdowns.jobsByType).map(([type, count]) => {
                      const max = maxChartValue(
                        Object.entries(breakdowns.jobsByType).map(([k, v]) => ({
                          label: k,
                          value: v,
                        }))
                      );
                      const percentage = (count / max) * 100;
                      return (
                        <div key={type}>
                          <div className="mb-1 flex items-center justify-between text-sm">
                            <span className="font-medium capitalize text-slate-700 dark:text-slate-200">
                              {type.replace(/-/g, ' ')}
                            </span>
                            <span className="text-slate-500">{count}</span>
                          </div>
                          <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                            <div
                              className="h-full rounded-full bg-amber-500 transition-all"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardBody>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <FaFileAlt className="text-emerald-600" />
                  <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                    Applications by Status
                  </h2>
                </div>
              </CardHeader>
              <CardBody>
                {Object.keys(breakdowns.applicationsByStatus || {}).length === 0 ? (
                  <p className="py-8 text-center text-sm text-slate-500">No data available</p>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(breakdowns.applicationsByStatus).map(([status, count]) => {
                      const colorMap = {
                        pending: 'bg-amber-100 text-amber-700',
                        approved: 'bg-emerald-100 text-emerald-700',
                        rejected: 'bg-red-100 text-red-700',
                        review: 'bg-sky-100 text-sky-700',
                        withdrawn: 'bg-slate-100 text-slate-700',
                      };
                      const colorClass = colorMap[status] || 'bg-slate-100 text-slate-700';
                      return (
                        <div key={status} className={`rounded-lg p-3 ${colorClass}`}>
                          <p className="text-xs font-semibold uppercase tracking-wide">
                            {status}
                          </p>
                          <p className="mt-1 text-2xl font-bold">{count}</p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardBody>
            </Card>
          </div>

          {/* Recent Activities & Top Performers */}
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <FaChartBar className="text-slate-500" />
                  <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                    Recent Activities
                  </h2>
                </div>
              </CardHeader>
              <CardBody className="p-0">
                {recentActivities.length === 0 ? (
                  <p className="py-8 text-center text-sm text-slate-500">
                    No recent activities
                  </p>
                ) : (
                  <div className="divide-y divide-slate-200 dark:divide-slate-700">
                    {recentActivities.slice(0, 8).map((activity, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-4">
                        <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-brand-500" />
                        <div className="flex-1">
                          <p className="text-sm text-slate-700 dark:text-slate-200">
                            {activity.description}
                          </p>
                          <p className="mt-0.5 text-xs text-slate-500">
                            {formatDate(activity.timestamp)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardBody>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <FaGraduationCap className="text-purple-600" />
                  <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                    Top Performers
                  </h2>
                </div>
              </CardHeader>
              <CardBody className="p-0">
                {topPerformers.length === 0 ? (
                  <p className="py-8 text-center text-sm text-slate-500">
                    No performers data available
                  </p>
                ) : (
                  <div className="divide-y divide-slate-200 dark:divide-slate-700">
                    {topPerformers.map((performer, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-4">
                        <span
                          className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                            idx === 0
                              ? 'bg-amber-100 text-amber-700'
                              : idx === 1
                                ? 'bg-slate-100 text-slate-700'
                                : idx === 2
                                  ? 'bg-orange-100 text-orange-700'
                                  : 'bg-slate-50 text-slate-500'
                          }`}
                        >
                          {idx + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="truncate font-medium text-slate-800 dark:text-slate-100">
                            {performer.name || 'Unnamed'}
                          </p>
                          <p className="text-xs text-slate-500">
                            {performer.metric || 'N/A'} · {performer.value || 0}
                          </p>
                        </div>
                        <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
                          {performer.badge || 'Top'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardBody>
            </Card>
          </div>
        </>
      )}

      {/* Export Modal */}
      <Modal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        title="Export System Report"
      >
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
              Format
            </label>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {[
                { value: 'pdf', label: 'PDF', icon: FaFilePdf, color: 'text-red-600' },
                { value: 'csv', label: 'CSV', icon: FaFileCsv, color: 'text-emerald-600' },
                { value: 'json', label: 'JSON', icon: FaFileAlt, color: 'text-sky-600' },
                { value: 'excel', label: 'Excel', icon: FaChartLine, color: 'text-emerald-700' },
              ].map((format) => {
                const Icon = format.icon;
                return (
                  <button
                    key={format.value}
                    onClick={() => setExportFormat(format.value)}
                    className={`flex items-center gap-2 rounded-lg border p-3 text-left transition ${
                      exportFormat === format.value
                        ? 'border-brand-500 bg-brand-50 dark:bg-brand-950'
                        : 'border-slate-200 hover:border-brand-300 dark:border-slate-700'
                    }`}
                  >
                    <Icon className={`h-5 w-5 ${format.color}`} />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                      {format.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
              Date Range
            </label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800"
            >
              {Object.entries(rangeLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div className="rounded-lg border border-sky-200 bg-sky-50 p-3 text-sm text-sky-700">
            <strong>Note:</strong> Report generation may take a few moments for large date
            ranges.
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" onClick={() => setShowExportModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleExport} disabled={exporting}>
            {exporting ? (
              <>
                <FaSync className="mr-2 animate-spin" /> Generating...
              </>
            ) : (
              <>
                <FaDownload className="mr-2" /> Export Report
              </>
            )}
          </Button>
        </div>
      </Modal>
    </AdminPageShell>
  );
};

export default SystemReports;