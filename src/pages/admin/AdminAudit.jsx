import { useCallback, useEffect, useMemo, useState } from 'react';
import { FaCalendar, FaCheckCircle, FaDownload, FaEye, FaFilter, FaHistory, FaSearch, FaShieldAlt, FaSync, FaTimes, FaTimesCircle, FaTrash, FaUser } from "react-icons/fa";

import AdminPageShell from '../../components/admin/AdminPageShell';
import Button from '../../components/ui/Button';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import Modal from '../../components/ui/Modal';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import adminService from '../../services/adminService';

const actionColors = {
  login: 'bg-sky-100 text-sky-700',
  logout: 'bg-slate-100 text-slate-700',
  create: 'bg-emerald-100 text-emerald-700',
  update: 'bg-amber-100 text-amber-700',
  delete: 'bg-red-100 text-red-700',
  approve: 'bg-emerald-100 text-emerald-700',
  reject: 'bg-red-100 text-red-700',
  suspend: 'bg-orange-100 text-orange-700',
  activate: 'bg-emerald-100 text-emerald-700',
  settings_change: 'bg-purple-100 text-purple-700',
  upload: 'bg-indigo-100 text-indigo-700',
  export: 'bg-teal-100 text-teal-700',
  bulk_action: 'bg-pink-100 text-pink-700',
};

const AdminAudit = () => {
  const { currentUser, userProfile, isAdmin } = useAuth();
  const { addSuccessNotification, addErrorNotification } = useNotification();

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [dateRange, setDateRange] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedLog, setSelectedLog] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);
  const [clearReason, setClearReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    today: 0,
    thisWeek: 0,
    uniqueAdmins: 0,
  });

  const itemsPerPage = 25;

  const loadLogs = useCallback(async () => {
    if (!isAdmin) return;
    setError('');
    setLoading(true);

    try {
      const response = await adminService.audit.getAuditLogs(
        { search, action: actionFilter, dateRange },
        currentPage,
        itemsPerPage
      );

      if (response.success) {
        setLogs(response.data.logs || []);
        setTotalPages(response.data.totalPages || 1);
        setStats(
          response.data.stats || {
            total: 0,
            today: 0,
            thisWeek: 0,
            uniqueAdmins: 0,
          }
        );
      } else {
        setError(response.error || 'Failed to load audit logs');
      }
    } catch (err) {
      console.error('Error loading audit logs:', err);
      setError(err.message || 'Failed to load audit logs');
      addErrorNotification('Error', 'Failed to load audit logs');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [isAdmin, search, actionFilter, dateRange, currentPage, addErrorNotification]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadLogs();
  };

  const handleViewDetails = async (log) => {
    try {
      const response = await adminService.audit.getAuditLogDetails(log.id);
      setSelectedLog(response.success ? response.data : log);
      setShowDetailsModal(true);
    } catch (err) {
      console.error('Error loading log details:', err);
      setSelectedLog(log);
      setShowDetailsModal(true);
    }
  };

  const handleClearLogs = async () => {
    if (!clearReason.trim()) {
      addErrorNotification('Validation', 'Please provide a reason for clearing logs');
      return;
    }
    setActionLoading(true);

    try {
      const response = await adminService.audit.clearAuditLogs(
        { before: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() },
        clearReason,
        currentUser,
        userProfile
      );

      if (response.success) {
        addSuccessNotification('Success', 'Audit logs cleared successfully');
        setShowClearModal(false);
        setClearReason('');
        await loadLogs();
      } else {
        throw new Error(response.error || 'Failed to clear logs');
      }
    } catch (err) {
      console.error('Error clearing logs:', err);
      addErrorNotification('Error', err.message || 'Failed to clear logs');
    } finally {
      setActionLoading(false);
    }
  };

  const handleExport = async (format = 'csv') => {
    try {
      const response = await adminService.audit.exportAuditLogs(
        { search, action: actionFilter, dateRange },
        format
      );

      if (response.success && response.data) {
        const blob = new Blob([response.data], {
          type: format === 'csv' ? 'text/csv' : 'application/json',
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `audit-logs-${new Date().toISOString().slice(0, 10)}.${format}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        addSuccessNotification('Success', `Exported as ${format.toUpperCase()}`);
      } else {
        throw new Error(response.error || 'Export failed');
      }
    } catch (err) {
      console.error('Export error:', err);
      addErrorNotification('Error', 'Failed to export audit logs');
    }
  };

  const formatDateTime = (value) => {
    if (!value) return 'N/A';
    return new Date(value).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const labelAction = (action = '') =>
    action.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());

  const getActionBadge = (action) => {
    const colorClass = actionColors[action] || 'bg-slate-100 text-slate-700';
    return (
      <span
        className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${colorClass}`}
      >
        {labelAction(action)}
      </span>
    );
  };

  const actionOptions = useMemo(
    () => ['all', ...new Set(logs.map((log) => log.action).filter(Boolean))],
    [logs]
  );

  if (!isAdmin) {
    return (
      <AdminPageShell
        title="Admin Audit"
        description="Access denied - Admin privileges required"
        icon={FaShieldAlt}
      >
        <Card>
          <CardBody>
            <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-700">
              <FaTimesCircle className="mb-3 h-10 w-10" />
              <h2 className="text-xl font-semibold">Access Denied</h2>
              <p className="mt-1 text-sm">You must be an administrator to access audit logs.</p>
            </div>
          </CardBody>
        </Card>
      </AdminPageShell>
    );
  }

  return (
    <AdminPageShell
      title="Admin Audit"
      description="Track privileged actions, approvals, settings changes, and media uploads"
      icon={FaShieldAlt}
      actions={
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => handleExport('csv')}>
            <FaDownload className="mr-2" /> CSV
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleExport('json')}>
            <FaDownload className="mr-2" /> JSON
          </Button>
          <Button variant="danger" size="sm" onClick={() => setShowClearModal(true)}>
            <FaTrash className="mr-2" /> Clear Old Logs
          </Button>
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
            <FaSync className={`mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      }
    >
      {/* Stats Grid */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Total Events', value: stats.total, color: 'text-slate-700', bg: 'bg-slate-100' },
          { label: 'Today', value: stats.today, color: 'text-brand-700', bg: 'bg-brand-100' },
          { label: 'This Week', value: stats.thisWeek, color: 'text-sky-700', bg: 'bg-sky-100' },
          {
            label: 'Unique Admins',
            value: stats.uniqueAdmins,
            color: 'text-emerald-700',
            bg: 'bg-emerald-100',
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              {stat.label}
            </p>
            <div className="mt-2 flex items-center justify-between">
              <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
              <span
                className={`h-10 w-10 rounded-full ${stat.bg} flex items-center justify-center`}
              >
                <FaHistory className={`h-5 w-5 ${stat.color}`} />
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardBody>
          <div className="grid gap-3 md:grid-cols-4">
            <div className="relative md:col-span-2">
              <FaSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search action, admin, ID, or details..."
                className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-10 pr-4 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 dark:border-slate-700 dark:bg-slate-800"
              />
            </div>
            <select
              value={actionFilter}
              onChange={(e) => {
                setActionFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800"
            >
              {actionOptions.map((option) => (
                <option value={option} key={option}>
                  {option === 'all' ? 'All Actions' : labelAction(option)}
                </option>
              ))}
            </select>
            <select
              value={dateRange}
              onChange={(e) => {
                setDateRange(e.target.value);
                setCurrentPage(1);
              }}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
            </select>
          </div>
        </CardBody>
      </Card>

      {/* Error Alert */}
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

      {/* Logs Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              Audit Log
            </h2>
            <span className="text-sm text-slate-500">{logs.length} event(s)</span>
          </div>
        </CardHeader>
        <CardBody className="p-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600" />
              <p className="mt-4 text-sm text-slate-500">Loading audit logs...</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <FaHistory className="mb-3 h-12 w-12 text-slate-300" />
              <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200">
                No audit events found
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Administrative activity will appear here when actions are logged.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Time
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Action
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Admin
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Details
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600 dark:text-slate-300">
                        {formatDateTime(log.timestamp)}
                      </td>
                      <td className="px-4 py-3">{getActionBadge(log.action)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-brand-700">
                            <FaUser className="h-3.5 w-3.5" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-800 dark:text-slate-100">
                              {log.adminName || 'System Administrator'}
                            </p>
                            <p className="text-xs text-slate-500">{log.adminId || 'system'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <code className="line-clamp-1 block max-w-md text-xs text-slate-500">
                          {JSON.stringify(
                            Object.fromEntries(
                              Object.entries(log).filter(
                                ([key]) =>
                                  !['id', 'timestamp', 'action', 'adminName', 'adminId'].includes(
                                    key
                                  )
                              )
                            )
                          )}
                        </code>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleViewDetails(log)}
                          className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-600 dark:border-slate-700"
                          title="View Details"
                        >
                          <FaEye className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 dark:border-slate-700">
            <p className="text-sm text-slate-500">
              Page {currentPage} of {totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Details Modal */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedLog(null);
        }}
        title="Audit Log Details"
        size="lg"
      >
        {selectedLog && (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Timestamp
                </p>
                <p className="mt-1 text-sm text-slate-800 dark:text-slate-100">
                  {formatDateTime(selectedLog.timestamp)}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Action
                </p>
                <div className="mt-1">{getActionBadge(selectedLog.action)}</div>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Admin Name
                </p>
                <p className="mt-1 text-sm text-slate-800 dark:text-slate-100">
                  {selectedLog.adminName || 'System Administrator'}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Admin ID
                </p>
                <p className="mt-1 break-all text-sm text-slate-800 dark:text-slate-100">
                  {selectedLog.adminId || 'system'}
                </p>
              </div>
              {selectedLog.ipAddress && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    IP Address
                  </p>
                  <p className="mt-1 text-sm text-slate-800 dark:text-slate-100">
                    {selectedLog.ipAddress}
                  </p>
                </div>
              )}
              {selectedLog.userAgent && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    User Agent
                  </p>
                  <p className="mt-1 break-all text-xs text-slate-800 dark:text-slate-100">
                    {selectedLog.userAgent}
                  </p>
                </div>
              )}
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Full Payload
              </p>
              <pre className="mt-1 overflow-x-auto rounded-lg bg-slate-50 p-4 text-xs text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                {JSON.stringify(selectedLog, null, 2)}
              </pre>
            </div>
          </div>
        )}
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" onClick={() => setShowDetailsModal(false)}>
            Close
          </Button>
        </div>
      </Modal>

      {/* Clear Logs Modal */}
      <Modal
        isOpen={showClearModal}
        onClose={() => {
          setShowClearModal(false);
          setClearReason('');
        }}
        title="Clear Old Audit Logs"
      >
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
          <strong>Warning:</strong> This will permanently delete audit logs older than 30 days.
          This action cannot be undone.
        </div>
        <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">
          Are you sure you want to clear old audit logs? This will help maintain database
          performance.
        </p>
        <div className="mt-4">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
            Reason for clearing *
          </label>
          <textarea
            value={clearReason}
            onChange={(e) => setClearReason(e.target.value)}
            rows={3}
            placeholder="Provide a reason for clearing logs..."
            className="mt-1 w-full rounded-lg border border-slate-200 p-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 dark:border-slate-700 dark:bg-slate-800"
          />
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setShowClearModal(false);
              setClearReason('');
            }}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleClearLogs}
            disabled={actionLoading || !clearReason.trim()}
          >
            {actionLoading ? 'Clearing...' : 'Clear Old Logs'}
          </Button>
        </div>
      </Modal>
    </AdminPageShell>
  );
};

export default AdminAudit;