import { useCallback, useEffect, useMemo, useState } from 'react';
import { FaCheckCircle, FaClipboardList, FaClock, FaDownload, FaEnvelope, FaEye, FaFilter, FaHistory, FaSearch, FaSync, FaTimes, FaTimesCircle, FaTrash, FaUser } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';

import AdminPageShell from '../../components/admin/AdminPageShell';
import Button from '../../components/ui/Button';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import Modal from '../../components/ui/Modal';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import adminService from '../../services/adminService';

const statusConfig = {
  pending: { label: 'Pending', color: 'bg-amber-100 text-amber-700', icon: FaClock },
  approved: { label: 'Approved', color: 'bg-emerald-100 text-emerald-700', icon: FaCheckCircle },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-700', icon: FaTimesCircle },
  review: { label: 'Under Review', color: 'bg-sky-100 text-sky-700', icon: FaClock },
  withdrawn: { label: 'Withdrawn', color: 'bg-slate-100 text-slate-700', icon: FaTimes },
};

const SearchApplications = () => {
  const navigate = useNavigate();
  const { currentUser, userProfile, isAdmin } = useAuth();
  const { addSuccessNotification, addErrorNotification } = useNotification();

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteReason, setDeleteReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [recentActivity, setRecentActivity] = useState([]);

  const itemsPerPage = 15;

  const loadApplications = useCallback(async () => {
    if (!isAdmin) return;
    setError('');
    setLoading(true);

    try {
      const response = await adminService.applications.searchApplications(
        { search, status: statusFilter },
        currentPage,
        itemsPerPage
      );

      if (response.success) {
        setApplications(response.data.applications || []);
        setTotalPages(response.data.totalPages || 1);
        setRecentActivity(response.data.recentActivity || []);
      } else {
        setError(response.error || 'Failed to load applications');
      }
    } catch (err) {
      console.error('Error searching applications:', err);
      setError(err.message || 'Failed to load applications');
      addErrorNotification('Error', 'Failed to search applications');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [isAdmin, search, statusFilter, currentPage, addErrorNotification]);

  useEffect(() => {
    loadApplications();
  }, [loadApplications]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadApplications();
  };

  const handleViewDetails = async (application) => {
    try {
      const details = await adminService.applications.getApplicationDetails(application.id);
      setSelectedApplication(details.success ? details.data : application);
      setShowDetailsModal(true);
    } catch (err) {
      console.error('Error loading details:', err);
      setSelectedApplication(application);
      setShowDetailsModal(true);
    }
  };

  const handleDelete = async () => {
    if (!selectedApplication) return;
    setActionLoading(true);

    try {
      const response = await adminService.applications.deleteApplication(
        selectedApplication.id,
        deleteReason,
        currentUser,
        userProfile
      );

      if (response.success) {
        addSuccessNotification('Success', 'Application deleted successfully');
        setShowDeleteModal(false);
        setDeleteReason('');
        setSelectedApplication(null);
        await loadApplications();
      } else {
        throw new Error(response.error || 'Failed to delete application');
      }
    } catch (err) {
      console.error('Error deleting application:', err);
      addErrorNotification('Error', err.message || 'Failed to delete application');
    } finally {
      setActionLoading(false);
    }
  };

  const handleExport = async (format = 'csv') => {
    try {
      const response = await adminService.applications.exportApplications(
        { search, status: statusFilter },
        format
      );

      if (response.success && response.data) {
        const blob = new Blob([response.data], {
          type: format === 'csv' ? 'text/csv' : 'application/json',
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `applications-search-${new Date().toISOString().slice(0, 10)}.${format}`;
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
      addErrorNotification('Error', 'Failed to export applications');
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

  const getStatusBadge = (status) => {
    const config = statusConfig[status] || {
      label: status || 'Unknown',
      color: 'bg-slate-100 text-slate-700',
      icon: FaClock,
    };
    const Icon = config.icon;
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${config.color}`}
      >
        <Icon className="h-3 w-3" />
        {config.label}
      </span>
    );
  };

  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      const matchesSearch =
        !search ||
        app.applicantName?.toLowerCase().includes(search.toLowerCase()) ||
        app.email?.toLowerCase().includes(search.toLowerCase()) ||
        app.position?.toLowerCase().includes(search.toLowerCase()) ||
        app.companyName?.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [applications, search, statusFilter]);

  if (!isAdmin) {
    return (
      <AdminPageShell
        title="Search Applications"
        description="Access denied - Admin privileges required"
        icon={FaClipboardList}
      >
        <Card>
          <CardBody>
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
              <FaTimesCircle className="mb-2 h-8 w-8" />
              <h3 className="text-lg font-semibold">Access Denied</h3>
              <p className="text-sm">You must be an administrator to access this page.</p>
            </div>
          </CardBody>
        </Card>
      </AdminPageShell>
    );
  }

  return (
    <AdminPageShell
      title="Search Applications"
      description="Search and manage all platform applications"
      icon={FaClipboardList}
      actions={
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => handleExport('csv')}>
            <FaDownload className="mr-2" /> CSV
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleExport('json')}>
            <FaDownload className="mr-2" /> JSON
          </Button>
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
            <FaSync className={`mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      }
    >
      {/* Overview Cards */}
      <div className="mb-6 grid gap-4 lg:grid-cols-[2fr_1fr]">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <FaClipboardList className="text-brand-600" />
              <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                Application Search
              </h2>
            </div>
          </CardHeader>
          <CardBody>
            <p className="text-sm leading-6 text-slate-500">
              Search, filter, and manage all applications across the platform. Use the filters
              below to narrow down results.
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {[
                { label: 'Total Applications', value: filteredApplications.length },
                {
                  label: 'Pending Review',
                  value: filteredApplications.filter((a) => a.status === 'pending').length,
                },
                {
                  label: 'Approved',
                  value: filteredApplications.filter((a) => a.status === 'approved').length,
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-lg border border-slate-200 p-3 dark:border-slate-700"
                >
                  <p className="text-xs text-slate-500">{stat.label}</p>
                  <p className="mt-1 text-2xl font-bold text-slate-800 dark:text-slate-100">
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <FaHistory className="text-slate-400" />
              <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                Recent Activity
              </h2>
            </div>
          </CardHeader>
          <CardBody>
            {recentActivity.length === 0 ? (
              <p className="text-sm text-slate-500">No recent activity to display yet.</p>
            ) : (
              <div className="space-y-3">
                {recentActivity.slice(0, 5).map((activity, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="mt-1 h-2 w-2 rounded-full bg-brand-500" />
                    <div>
                      <p className="text-sm text-slate-700 dark:text-slate-200">
                        {activity.description}
                      </p>
                      <p className="text-xs text-slate-500">{formatDate(activity.timestamp)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
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
                placeholder="Search by applicant, email, position, or company..."
                className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-10 pr-4 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 dark:border-slate-700 dark:bg-slate-800"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="review">Under Review</option>
              <option value="withdrawn">Withdrawn</option>
            </select>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearch('');
                  setStatusFilter('all');
                  setCurrentPage(1);
                }}
                className="w-full"
              >
                <FaFilter className="mr-2" /> Clear Filters
              </Button>
            </div>
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

      {/* Results */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              Search Results
            </h2>
            <span className="text-sm text-slate-500">
              {filteredApplications.length} result(s)
            </span>
          </div>
        </CardHeader>
        <CardBody className="p-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600" />
              <p className="mt-4 text-sm text-slate-500">Searching applications...</p>
            </div>
          ) : filteredApplications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <FaClipboardList className="mb-3 h-12 w-12 text-slate-300" />
              <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200">
                No applications found
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Try adjusting your search terms or filters.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Applicant
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Position
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Company
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Applied
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {filteredApplications.map((application) => (
                    <tr
                      key={application.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-brand-700">
                            <FaUser />
                          </div>
                          <div>
                            <p className="font-medium text-slate-800 dark:text-slate-100">
                              {application.applicantName || 'Unknown'}
                            </p>
                            <p className="flex items-center gap-1 text-xs text-slate-500">
                              <FaEnvelope className="h-3 w-3" />
                              {application.email || 'No email'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-slate-700 dark:text-slate-200">
                          {application.position || application.jobTitle || 'N/A'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-slate-700 dark:text-slate-200">
                          {application.companyName || 'N/A'}
                        </span>
                      </td>
                      <td className="px-4 py-3">{getStatusBadge(application.status)}</td>
                      <td className="px-4 py-3 text-sm text-slate-500">
                        {formatDate(application.createdAt || application.appliedAt)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleViewDetails(application)}
                            className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-600 dark:border-slate-700"
                            title="View Details"
                          >
                            <FaEye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedApplication(application);
                              setShowDeleteModal(true);
                            }}
                            className="rounded-lg border border-slate-200 p-2 text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 dark:border-slate-700"
                            title="Delete"
                          >
                            <FaTrash className="h-4 w-4" />
                          </button>
                        </div>
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
          setSelectedApplication(null);
        }}
        title="Application Details"
        size="lg"
      >
        {selectedApplication && (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Applicant
                </p>
                <p className="mt-1 text-sm text-slate-800 dark:text-slate-100">
                  {selectedApplication.applicantName || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Email
                </p>
                <p className="mt-1 text-sm text-slate-800 dark:text-slate-100">
                  {selectedApplication.email || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Position
                </p>
                <p className="mt-1 text-sm text-slate-800 dark:text-slate-100">
                  {selectedApplication.position || selectedApplication.jobTitle || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Company
                </p>
                <p className="mt-1 text-sm text-slate-800 dark:text-slate-100">
                  {selectedApplication.companyName || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Status
                </p>
                <div className="mt-1">{getStatusBadge(selectedApplication.status)}</div>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Applied
                </p>
                <p className="mt-1 text-sm text-slate-800 dark:text-slate-100">
                  {formatDate(selectedApplication.createdAt || selectedApplication.appliedAt)}
                </p>
              </div>
            </div>

            {selectedApplication.coverLetter && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Cover Letter
                </p>
                <p className="mt-1 rounded-lg bg-slate-50 p-3 text-sm text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                  {selectedApplication.coverLetter}
                </p>
              </div>
            )}

            {selectedApplication.documents?.length > 0 && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Documents
                </p>
                <div className="mt-2 space-y-2">
                  {selectedApplication.documents.map((doc, idx) => (
                    <a
                      key={idx}
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 rounded-lg border border-slate-200 p-2 text-sm text-brand-600 hover:bg-brand-50 dark:border-slate-700"
                    >
                      <FaDownload className="h-4 w-4" />
                      {doc.name || `Document ${idx + 1}`}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" onClick={() => setShowDetailsModal(false)}>
            Close
          </Button>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setDeleteReason('');
        }}
        title="Delete Application"
      >
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <strong>Warning:</strong> This action cannot be undone. The application will be
          permanently removed.
        </div>
        <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">
          Are you sure you want to delete this application from{' '}
          <strong>{selectedApplication?.applicantName || selectedApplication?.email}</strong>?
        </p>
        <div className="mt-4">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
            Reason (optional)
          </label>
          <textarea
            value={deleteReason}
            onChange={(e) => setDeleteReason(e.target.value)}
            rows={3}
            placeholder="Provide a reason for deletion..."
            className="mt-1 w-full rounded-lg border border-slate-200 p-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 dark:border-slate-700 dark:bg-slate-800"
          />
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setShowDeleteModal(false);
              setDeleteReason('');
            }}
          >
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete} disabled={actionLoading}>
            {actionLoading ? 'Deleting...' : 'Delete Application'}
          </Button>
        </div>
      </Modal>
    </AdminPageShell>
  );
};

export default SearchApplications;