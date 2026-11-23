import { useCallback, useEffect, useMemo, useState } from 'react';
import { FaCheckCircle, FaClock, FaDownload, FaEnvelope, FaEye, FaFilter, FaGraduationCap, FaPhone, FaSearch, FaSync, FaTimes, FaTimesCircle, FaTrash, FaUniversity, FaUser, FaUserCheck, FaUserGraduate, FaUserPlus } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';

import AdminPageShell from '../../components/admin/AdminPageShell';
import Button from '../../components/ui/Button';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import Modal from '../../components/ui/Modal';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import adminService from '../../services/adminService';
import supabaseMediaService from '../../services/supabaseMediaService';

const statusConfig = {
  pending: { label: 'Pending Review', color: 'bg-amber-100 text-amber-700', icon: FaClock },
  approved: { label: 'Approved', color: 'bg-emerald-100 text-emerald-700', icon: FaCheckCircle },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-700', icon: FaTimesCircle },
  waitlisted: { label: 'Waitlisted', color: 'bg-sky-100 text-sky-700', icon: FaClock },
  enrolled: { label: 'Enrolled', color: 'bg-indigo-100 text-indigo-700', icon: FaUserCheck },
};

const AdmissionsManagement = () => {
  const navigate = useNavigate();
  const { currentUser, userProfile, isAdmin } = useAuth();
  const { addSuccessNotification, addErrorNotification } = useNotification();

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [programFilter, setProgramFilter] = useState('all');
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [approveComments, setApproveComments] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [deleteReason, setDeleteReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    waitlisted: 0,
  });

  const itemsPerPage = 15;

  const loadApplications = useCallback(async () => {
    if (!isAdmin) return;
    setError('');
    setLoading(true);

    try {
      const response = await adminService.admissions.getAllApplications(
        { search, status: statusFilter, program: programFilter },
        currentPage,
        itemsPerPage
      );

      if (response.success) {
        setApplications(response.data.applications || []);
        setTotalPages(response.data.totalPages || 1);
        setStats(response.data.stats || {
          total: 0,
          pending: 0,
          approved: 0,
          rejected: 0,
          waitlisted: 0,
        });
      } else {
        setError(response.error || 'Failed to load applications');
      }
    } catch (err) {
      console.error('Error loading applications:', err);
      setError(err.message || 'Failed to load applications');
      addErrorNotification('Error', 'Failed to load admission applications');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [isAdmin, search, statusFilter, programFilter, currentPage, addErrorNotification]);

  useEffect(() => {
    loadApplications();
  }, [loadApplications]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadApplications();
  };

  const handleViewDetails = async (application) => {
    try {
      const details = await adminService.admissions.getApplicationDetails(application.id);
      setSelectedApplication(details.success ? details.data : application);
      setShowDetailsModal(true);
    } catch (err) {
      console.error('Error loading application details:', err);
      setSelectedApplication(application);
      setShowDetailsModal(true);
    }
  };

  const handleApprove = async () => {
    if (!selectedApplication) return;
    setActionLoading(true);

    try {
      const response = await adminService.admissions.approveApplication(
        selectedApplication.id,
        approveComments,
        currentUser,
        userProfile
      );

      if (response.success) {
        addSuccessNotification('Success', 'Application approved successfully');
        setShowApproveModal(false);
        setApproveComments('');
        setSelectedApplication(null);
        await loadApplications();
      } else {
        throw new Error(response.error || 'Failed to approve application');
      }
    } catch (err) {
      console.error('Error approving application:', err);
      addErrorNotification('Error', err.message || 'Failed to approve application');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedApplication || !rejectReason.trim()) return;
    setActionLoading(true);

    try {
      const response = await adminService.admissions.rejectApplication(
        selectedApplication.id,
        rejectReason,
        currentUser,
        userProfile
      );

      if (response.success) {
        addSuccessNotification('Success', 'Application rejected successfully');
        setShowRejectModal(false);
        setRejectReason('');
        setSelectedApplication(null);
        await loadApplications();
      } else {
        throw new Error(response.error || 'Failed to reject application');
      }
    } catch (err) {
      console.error('Error rejecting application:', err);
      addErrorNotification('Error', err.message || 'Failed to reject application');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedApplication) return;
    setActionLoading(true);

    try {
      const response = await adminService.admissions.deleteApplication(
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

  const handleBulkApprove = async () => {
    if (selectedIds.length === 0) return;
    setActionLoading(true);

    try {
      const response = await adminService.admissions.bulkApproveApplications(
        selectedIds,
        'Bulk approval',
        currentUser,
        userProfile
      );

      if (response.success) {
        addSuccessNotification('Success', `${selectedIds.length} applications approved`);
        setSelectedIds([]);
        await loadApplications();
      } else {
        throw new Error(response.error || 'Bulk approval failed');
      }
    } catch (err) {
      console.error('Error bulk approving:', err);
      addErrorNotification('Error', err.message || 'Bulk approval failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleBulkReject = async () => {
    if (selectedIds.length === 0) return;
    const reason = prompt('Enter rejection reason for all selected applications:');
    if (!reason) return;
    setActionLoading(true);

    try {
      const response = await adminService.admissions.bulkRejectApplications(
        selectedIds,
        reason,
        currentUser,
        userProfile
      );

      if (response.success) {
        addSuccessNotification('Success', `${selectedIds.length} applications rejected`);
        setSelectedIds([]);
        await loadApplications();
      } else {
        throw new Error(response.error || 'Bulk rejection failed');
      }
    } catch (err) {
      console.error('Error bulk rejecting:', err);
      addErrorNotification('Error', err.message || 'Bulk rejection failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSelectAll = () => {
    if (selectedIds.length === applications.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(applications.map((app) => app.id));
    }
  };

  const handleSelectOne = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleExport = async (format = 'csv') => {
    try {
      const response = await adminService.admissions.exportApplications(
        { search, status: statusFilter, program: programFilter },
        format
      );

      if (response.success && response.data) {
        const blob = new Blob([response.data], {
          type: format === 'csv' ? 'text/csv' : 'application/json',
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `admissions-${new Date().toISOString().slice(0, 10)}.${format}`;
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
        app.programName?.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
      const matchesProgram = programFilter === 'all' || app.program === programFilter;
      return matchesSearch && matchesStatus && matchesProgram;
    });
  }, [applications, search, statusFilter, programFilter]);

  if (!isAdmin) {
    return (
      <AdminPageShell
        title="Admissions Management"
        description="Access denied - Admin privileges required"
        icon={FaGraduationCap}
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
      title="Admissions Management"
      description="Review, approve, and manage student admission applications"
      icon={FaGraduationCap}
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
      {/* Stats Cards */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {[
          { label: 'Total', value: stats.total, color: 'text-slate-700', bg: 'bg-slate-100' },
          { label: 'Pending', value: stats.pending, color: 'text-amber-700', bg: 'bg-amber-100' },
          {
            label: 'Approved',
            value: stats.approved,
            color: 'text-emerald-700',
            bg: 'bg-emerald-100',
          },
          { label: 'Rejected', value: stats.rejected, color: 'text-red-700', bg: 'bg-red-100' },
          {
            label: 'Waitlisted',
            value: stats.waitlisted,
            color: 'text-sky-700',
            bg: 'bg-sky-100',
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
              <span className={`h-10 w-10 rounded-full ${stat.bg} flex items-center justify-center`}>
                <FaUserGraduate className={`h-5 w-5 ${stat.color}`} />
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
                placeholder="Search by name, email, or program..."
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
              <option value="waitlisted">Waitlisted</option>
              <option value="enrolled">Enrolled</option>
            </select>
            <select
              value={programFilter}
              onChange={(e) => {
                setProgramFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800"
            >
              <option value="all">All Programs</option>
              <option value="computer-science">Computer Science</option>
              <option value="business">Business</option>
              <option value="engineering">Engineering</option>
              <option value="medicine">Medicine</option>
              <option value="education">Education</option>
            </select>
          </div>

          {selectedIds.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-2 rounded-lg border border-brand-200 bg-brand-50 p-3 dark:border-brand-700 dark:bg-brand-950">
              <span className="text-sm font-medium text-brand-700 dark:text-brand-200">
                {selectedIds.length} selected
              </span>
              <Button variant="primary" size="sm" onClick={handleBulkApprove} disabled={actionLoading}>
                <FaCheckCircle className="mr-1" /> Approve Selected
              </Button>
              <Button variant="danger" size="sm" onClick={handleBulkReject} disabled={actionLoading}>
                <FaTimes className="mr-1" /> Reject Selected
              </Button>
              <Button variant="outline" size="sm" onClick={() => setSelectedIds([])}>
                Clear
              </Button>
            </div>
          )}
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

      {/* Applications Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              Admission Applications
            </h2>
            <span className="text-sm text-slate-500">
              {filteredApplications.length} application(s)
            </span>
          </div>
        </CardHeader>
        <CardBody className="p-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600" />
              <p className="mt-4 text-sm text-slate-500">Loading applications...</p>
            </div>
          ) : filteredApplications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <FaUserGraduate className="mb-3 h-12 w-12 text-slate-300" />
              <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200">
                No applications found
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Adjust your filters or wait for new applications.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
                  <tr>
                    <th className="px-4 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={
                          selectedIds.length === filteredApplications.length &&
                          filteredApplications.length > 0
                        }
                        onChange={handleSelectAll}
                        className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Applicant
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Program
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Submitted
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
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(application.id)}
                          onChange={() => handleSelectOne(application.id)}
                          className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-brand-700">
                            <FaUser />
                          </div>
                          <div>
                            <p className="font-medium text-slate-800 dark:text-slate-100">
                              {application.applicantName || 'Unknown Applicant'}
                            </p>
                            <p className="flex items-center gap-1 text-xs text-slate-500">
                              <FaEnvelope className="h-3 w-3" />
                              {application.email || 'No email'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <FaUniversity className="text-slate-400" />
                          <span className="text-sm text-slate-700 dark:text-slate-200">
                            {application.programName || application.program || 'General'}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">{getStatusBadge(application.status)}</td>
                      <td className="px-4 py-3 text-sm text-slate-500">
                        {formatDate(application.createdAt || application.submittedAt)}
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
                          {application.status === 'pending' && (
                            <>
                              <button
                                onClick={() => {
                                  setSelectedApplication(application);
                                  setShowApproveModal(true);
                                }}
                                className="rounded-lg border border-emerald-200 p-2 text-emerald-600 transition hover:bg-emerald-50"
                                title="Approve"
                              >
                                <FaCheckCircle className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedApplication(application);
                                  setShowRejectModal(true);
                                }}
                                className="rounded-lg border border-red-200 p-2 text-red-600 transition hover:bg-red-50"
                                title="Reject"
                              >
                                <FaTimesCircle className="h-4 w-4" />
                              </button>
                            </>
                          )}
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
                  Applicant Name
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
                  Phone
                </p>
                <p className="mt-1 text-sm text-slate-800 dark:text-slate-100">
                  {selectedApplication.phoneNumber || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Program
                </p>
                <p className="mt-1 text-sm text-slate-800 dark:text-slate-100">
                  {selectedApplication.programName || selectedApplication.program || 'N/A'}
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
                  Submitted
                </p>
                <p className="mt-1 text-sm text-slate-800 dark:text-slate-100">
                  {formatDate(selectedApplication.createdAt || selectedApplication.submittedAt)}
                </p>
              </div>
            </div>

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

            {selectedApplication.notes && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Notes
                </p>
                <p className="mt-1 rounded-lg bg-slate-50 p-3 text-sm text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                  {selectedApplication.notes}
                </p>
              </div>
            )}
          </div>
        )}
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" onClick={() => setShowDetailsModal(false)}>
            Close
          </Button>
          {selectedApplication?.status === 'pending' && (
            <>
              <Button
                variant="primary"
                onClick={() => {
                  setShowDetailsModal(false);
                  setShowApproveModal(true);
                }}
              >
                <FaCheckCircle className="mr-2" /> Approve
              </Button>
              <Button
                variant="danger"
                onClick={() => {
                  setShowDetailsModal(false);
                  setShowRejectModal(true);
                }}
              >
                <FaTimesCircle className="mr-2" /> Reject
              </Button>
            </>
          )}
        </div>
      </Modal>

      {/* Approve Modal */}
      <Modal
        isOpen={showApproveModal}
        onClose={() => {
          setShowApproveModal(false);
          setApproveComments('');
        }}
        title="Approve Application"
      >
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Are you sure you want to approve{' '}
          <strong>{selectedApplication?.applicantName || selectedApplication?.email}</strong>'s
          application?
        </p>
        <div className="mt-4">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
            Comments (optional)
          </label>
          <textarea
            value={approveComments}
            onChange={(e) => setApproveComments(e.target.value)}
            rows={3}
            placeholder="Add any comments for the applicant..."
            className="mt-1 w-full rounded-lg border border-slate-200 p-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 dark:border-slate-700 dark:bg-slate-800"
          />
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setShowApproveModal(false);
              setApproveComments('');
            }}
          >
            Cancel
          </Button>
          <Button variant="primary" onClick={handleApprove} disabled={actionLoading}>
            {actionLoading ? 'Approving...' : 'Approve Application'}
          </Button>
        </div>
      </Modal>

      {/* Reject Modal */}
      <Modal
        isOpen={showRejectModal}
        onClose={() => {
          setShowRejectModal(false);
          setRejectReason('');
        }}
        title="Reject Application"
      >
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
          This will notify the applicant that their application was not successful.
        </div>
        <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">
          Are you sure you want to reject{' '}
          <strong>{selectedApplication?.applicantName || selectedApplication?.email}</strong>'s
          application?
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
            required
          />
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setShowRejectModal(false);
              setRejectReason('');
            }}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleReject}
            disabled={actionLoading || !rejectReason.trim()}
          >
            {actionLoading ? 'Rejecting...' : 'Reject Application'}
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
          Are you sure you want to delete{' '}
          <strong>{selectedApplication?.applicantName || selectedApplication?.email}</strong>'s
          application?
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

export default AdmissionsManagement;
