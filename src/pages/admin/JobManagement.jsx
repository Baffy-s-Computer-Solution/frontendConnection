import { useCallback, useEffect, useMemo, useState } from 'react';
import { FaBan, FaBriefcase, FaBuilding, FaCheckCircle, FaClock, FaDownload, FaEdit, FaEnvelope, FaEye, FaFilter, FaMapMarkerAlt, FaMoneyBillWave, FaSearch, FaSync, FaTimes, FaTimesCircle, FaTrash, FaUserTie } from "react-icons/fa";

import AdminPageShell from '../../components/admin/AdminPageShell';
import Button from '../../components/ui/Button';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import Modal from '../../components/ui/Modal';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import adminService from '../../services/adminService';

const statusConfig = {
  active: { label: 'Active', color: 'bg-emerald-100 text-emerald-700', icon: FaCheckCircle },
  pending: { label: 'Pending', color: 'bg-amber-100 text-amber-700', icon: FaClock },
  approved: { label: 'Approved', color: 'bg-emerald-100 text-emerald-700', icon: FaCheckCircle },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-700', icon: FaTimesCircle },
  closed: { label: 'Closed', color: 'bg-slate-100 text-slate-700', icon: FaBan },
  draft: { label: 'Draft', color: 'bg-sky-100 text-sky-700', icon: FaClock },
  expired: { label: 'Expired', color: 'bg-slate-100 text-slate-700', icon: FaClock },
};

const jobTypeColors = {
  'full-time': 'bg-brand-100 text-brand-700',
  'part-time': 'bg-sky-100 text-sky-700',
  internship: 'bg-emerald-100 text-emerald-700',
  freelance: 'bg-amber-100 text-amber-700',
  volunteer: 'bg-slate-100 text-slate-700',
  remote: 'bg-indigo-100 text-indigo-700',
  contract: 'bg-purple-100 text-purple-700',
};

const normalizeRequirements = (requirements) => {
  if (Array.isArray(requirements)) {
    return requirements
      .map((item) => typeof item === 'string' ? item : item?.name || item?.title || item?.description || '')
      .filter(Boolean);
  }
  if (typeof requirements === 'string') {
    return requirements.split(/\r?\n|,/).map((item) => item.trim()).filter(Boolean);
  }
  if (requirements && typeof requirements === 'object') {
    return Object.entries(requirements).flatMap(([key, value]) => {
      const values = Array.isArray(value) ? value : [value];
      return values
        .filter((item) => item !== null && item !== undefined && item !== '')
        .map((item) => `${key}: ${item}`);
    });
  }
  return [];
};

const JobManagement = () => {
  const { currentUser, userProfile, isAdmin } = useAuth();
  const { addSuccessNotification, addErrorNotification } = useNotification();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [approvalFilter, setApprovalFilter] = useState('all');
  const [selectedJob, setSelectedJob] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [approveComments, setApproveComments] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [closeReason, setCloseReason] = useState('');
  const [deleteReason, setDeleteReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [editForm, setEditForm] = useState({});
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    closed: 0,
    active: 0,
  });

  const itemsPerPage = 15;

  const loadJobs = useCallback(async () => {
    if (!isAdmin) return;
    setError('');
    setLoading(true);

    try {
      const response = await adminService.jobs.getAllJobs(
        {
          search,
          status: statusFilter,
          jobType: typeFilter,
          approved: approvalFilter,
        },
        currentPage,
        itemsPerPage
      );

      if (response.success) {
        setJobs(response.data.jobs || []);
        setTotalPages(response.data.totalPages || 1);
        setStats(
          response.data.stats || {
            total: 0,
            pending: 0,
            approved: 0,
            rejected: 0,
            closed: 0,
            active: 0,
          }
        );
      } else {
        setError(response.error || 'Failed to load jobs');
      }
    } catch (err) {
      console.error('Error loading jobs:', err);
      setError(err.message || 'Failed to load jobs');
      addErrorNotification('Error', 'Failed to load jobs');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [isAdmin, search, statusFilter, typeFilter, approvalFilter, currentPage, addErrorNotification]);

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadJobs();
  };

  const handleViewDetails = async (job) => {
    try {
      const response = await adminService.jobs.getJobDetails(job.id);
      const details = response.success ? response.data : job;
      setSelectedJob({ ...details, requirements: normalizeRequirements(details.requirements) });
      setShowDetailsModal(true);
    } catch (err) {
      console.error('Error loading job details:', err);
      setSelectedJob({ ...job, requirements: normalizeRequirements(job.requirements) });
      setShowDetailsModal(true);
    }
  };

  const handleEdit = (job) => {
    setSelectedJob(job);
    setEditForm({ ...job });
    setShowEditModal(true);
  };

  const handleUpdateJob = async () => {
    setActionLoading(true);
    try {
      const response = await adminService.jobs.updateJob(
        editForm.id,
        editForm,
        currentUser,
        userProfile
      );

      if (response.success) {
        addSuccessNotification('Success', 'Job updated successfully');
        setShowEditModal(false);
        setEditForm({});
        setSelectedJob(null);
        await loadJobs();
      } else {
        throw new Error(response.error || 'Failed to update job');
      }
    } catch (err) {
      console.error('Error updating job:', err);
      addErrorNotification('Error', err.message || 'Failed to update job');
    } finally {
      setActionLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedJob) return;
    setActionLoading(true);

    try {
      const response = await adminService.jobs.approveJob(
        selectedJob.id,
        approveComments,
        currentUser,
        userProfile
      );

      if (response.success) {
        addSuccessNotification('Success', 'Job approved successfully');
        setShowApproveModal(false);
        setApproveComments('');
        setSelectedJob(null);
        await loadJobs();
      } else {
        throw new Error(response.error || 'Failed to approve job');
      }
    } catch (err) {
      console.error('Error approving job:', err);
      addErrorNotification('Error', err.message || 'Failed to approve job');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedJob || !rejectReason.trim()) return;
    setActionLoading(true);

    try {
      const response = await adminService.jobs.rejectJob(
        selectedJob.id,
        rejectReason,
        currentUser,
        userProfile
      );

      if (response.success) {
        addSuccessNotification('Success', 'Job rejected successfully');
        setShowRejectModal(false);
        setRejectReason('');
        setSelectedJob(null);
        await loadJobs();
      } else {
        throw new Error(response.error || 'Failed to reject job');
      }
    } catch (err) {
      console.error('Error rejecting job:', err);
      addErrorNotification('Error', err.message || 'Failed to reject job');
    } finally {
      setActionLoading(false);
    }
  };

  const handleClose = async () => {
    if (!selectedJob || !closeReason.trim()) return;
    setActionLoading(true);

    try {
      const response = await adminService.jobs.closeJob(
        selectedJob.id,
        closeReason,
        currentUser,
        userProfile
      );

      if (response.success) {
        addSuccessNotification('Success', 'Job closed successfully');
        setShowCloseModal(false);
        setCloseReason('');
        setSelectedJob(null);
        await loadJobs();
      } else {
        throw new Error(response.error || 'Failed to close job');
      }
    } catch (err) {
      console.error('Error closing job:', err);
      addErrorNotification('Error', err.message || 'Failed to close job');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReopen = async (jobId) => {
    setActionLoading(true);
    try {
      const response = await adminService.jobs.reopenJob(jobId, currentUser, userProfile);

      if (response.success) {
        addSuccessNotification('Success', 'Job reopened successfully');
        await loadJobs();
      } else {
        throw new Error(response.error || 'Failed to reopen job');
      }
    } catch (err) {
      console.error('Error reopening job:', err);
      addErrorNotification('Error', err.message || 'Failed to reopen job');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedJob) return;
    setActionLoading(true);

    try {
      const response = await adminService.jobs.deleteJob(
        selectedJob.id,
        deleteReason,
        currentUser,
        userProfile
      );

      if (response.success) {
        addSuccessNotification('Success', 'Job deleted successfully');
        setShowDeleteModal(false);
        setDeleteReason('');
        setSelectedJob(null);
        await loadJobs();
      } else {
        throw new Error(response.error || 'Failed to delete job');
      }
    } catch (err) {
      console.error('Error deleting job:', err);
      addErrorNotification('Error', err.message || 'Failed to delete job');
    } finally {
      setActionLoading(false);
    }
  };

  const handleBulkApprove = async () => {
    if (selectedIds.length === 0) return;
    setActionLoading(true);

    try {
      const response = await adminService.jobs.bulkApproveJobs(
        selectedIds,
        'Bulk approval',
        currentUser,
        userProfile
      );

      if (response.success) {
        addSuccessNotification('Success', `${selectedIds.length} jobs approved`);
        setSelectedIds([]);
        await loadJobs();
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
    const reason = prompt('Enter rejection reason for all selected jobs:');
    if (!reason) return;
    setActionLoading(true);

    try {
      const response = await adminService.jobs.bulkRejectJobs(
        selectedIds,
        reason,
        currentUser,
        userProfile
      );

      if (response.success) {
        addSuccessNotification('Success', `${selectedIds.length} jobs rejected`);
        setSelectedIds([]);
        await loadJobs();
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

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (
      !window.confirm(
        `Delete ${selectedIds.length} jobs permanently? This cannot be undone.`
      )
    )
      return;
    setActionLoading(true);

    try {
      const response = await adminService.jobs.bulkDeleteJobs(
        selectedIds,
        'Bulk deletion',
        currentUser,
        userProfile
      );

      if (response.success) {
        addSuccessNotification('Success', `${selectedIds.length} jobs deleted`);
        setSelectedIds([]);
        await loadJobs();
      } else {
        throw new Error(response.error || 'Bulk deletion failed');
      }
    } catch (err) {
      console.error('Error bulk deleting:', err);
      addErrorNotification('Error', err.message || 'Bulk deletion failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSelectAll = () => {
    if (selectedIds.length === jobs.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(jobs.map((j) => j.id));
    }
  };

  const handleSelectOne = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleExport = async (format = 'csv') => {
    try {
      const response = await adminService.jobs.exportJobs(
        {
          search,
          status: statusFilter,
          jobType: typeFilter,
          approved: approvalFilter,
        },
        format
      );

      if (response.success && response.data) {
        const blob = new Blob([response.data], {
          type: format === 'csv' ? 'text/csv' : 'application/json',
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `jobs-${new Date().toISOString().slice(0, 10)}.${format}`;
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
      addErrorNotification('Error', 'Failed to export jobs');
    }
  };

  const formatDate = (value) => {
    if (!value) return 'N/A';
    return new Date(value).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusBadge = (status, approved) => {
    if (approved === false && status !== 'rejected') {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-amber-700">
          <FaClock className="h-3 w-3" /> Pending Approval
        </span>
      );
    }
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

  const getJobTypeBadge = (jobType) => {
    const colorClass = jobTypeColors[jobType] || 'bg-slate-100 text-slate-700';
    return (
      <span
        className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${colorClass}`}
      >
        {jobType?.replace(/-/g, ' ') || 'N/A'}
      </span>
    );
  };

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const matchesSearch =
        !search ||
        job.title?.toLowerCase().includes(search.toLowerCase()) ||
        job.companyName?.toLowerCase().includes(search.toLowerCase()) ||
        job.location?.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
      const matchesType = typeFilter === 'all' || job.jobType === typeFilter;
      const matchesApproval =
        approvalFilter === 'all' ||
        (approvalFilter === 'true' && job.approved === true) ||
        (approvalFilter === 'false' && job.approved === false);
      return matchesSearch && matchesStatus && matchesType && matchesApproval;
    });
  }, [jobs, search, statusFilter, typeFilter, approvalFilter]);

  if (!isAdmin) {
    return (
      <AdminPageShell
        title="Job Management"
        description="Access denied - Admin privileges required"
        icon={FaBriefcase}
      >
        <Card>
          <CardBody>
            <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-700">
              <FaTimesCircle className="mb-3 h-10 w-10" />
              <h2 className="text-xl font-semibold">Access Denied</h2>
              <p className="mt-1 text-sm">You must be an administrator to manage jobs.</p>
            </div>
          </CardBody>
        </Card>
      </AdminPageShell>
    );
  }

  return (
    <AdminPageShell
      title="Job Management"
      description="Review, approve, and manage all job postings across the platform"
      icon={FaBriefcase}
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
      {/* Stats */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
        {[
          { label: 'Total', value: stats.total, color: 'text-slate-700', bg: 'bg-slate-100' },
          { label: 'Active', value: stats.active, color: 'text-emerald-700', bg: 'bg-emerald-100' },
          { label: 'Pending', value: stats.pending, color: 'text-amber-700', bg: 'bg-amber-100' },
          {
            label: 'Approved',
            value: stats.approved,
            color: 'text-emerald-700',
            bg: 'bg-emerald-100',
          },
          { label: 'Rejected', value: stats.rejected, color: 'text-red-700', bg: 'bg-red-100' },
          { label: 'Closed', value: stats.closed, color: 'text-slate-700', bg: 'bg-slate-100' },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              {stat.label}
            </p>
            <p className={`mt-2 text-3xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardBody>
          <div className="grid gap-3 md:grid-cols-5">
            <div className="relative md:col-span-2">
              <FaSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search by title, company, or location..."
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
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="closed">Closed</option>
              <option value="draft">Draft</option>
              <option value="expired">Expired</option>
            </select>
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800"
            >
              <option value="all">All Types</option>
              <option value="full-time">Full Time</option>
              <option value="part-time">Part Time</option>
              <option value="internship">Internship</option>
              <option value="freelance">Freelance</option>
              <option value="volunteer">Volunteer</option>
              <option value="remote">Remote</option>
              <option value="contract">Contract</option>
            </select>
            <select
              value={approvalFilter}
              onChange={(e) => {
                setApprovalFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800"
            >
              <option value="all">All Approval</option>
              <option value="true">Approved</option>
              <option value="false">Pending Approval</option>
            </select>
          </div>

          {selectedIds.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-2 rounded-lg border border-brand-200 bg-brand-50 p-3 dark:border-brand-700 dark:bg-brand-950">
              <span className="text-sm font-medium text-brand-700 dark:text-brand-200">
                {selectedIds.length} selected
              </span>
              <Button
                variant="primary"
                size="sm"
                onClick={handleBulkApprove}
                disabled={actionLoading}
              >
                <FaCheckCircle className="mr-1" /> Approve
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleBulkReject}
                disabled={actionLoading}
              >
                <FaTimes className="mr-1" /> Reject
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleBulkDelete}
                disabled={actionLoading}
              >
                <FaTrash className="mr-1" /> Delete
              </Button>
              <Button variant="outline" size="sm" onClick={() => setSelectedIds([])}>
                Clear
              </Button>
            </div>
          )}
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

      {/* Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              Job Postings
            </h2>
            <span className="text-sm text-slate-500">{filteredJobs.length} job(s)</span>
          </div>
        </CardHeader>
        <CardBody className="p-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600" />
              <p className="mt-4 text-sm text-slate-500">Loading jobs...</p>
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <FaBriefcase className="mb-3 h-12 w-12 text-slate-300" />
              <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200">
                No jobs found
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Adjust your filters or wait for new postings.
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
                          selectedIds.length === filteredJobs.length &&
                          filteredJobs.length > 0
                        }
                        onChange={handleSelectAll}
                        className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Job
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Type
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Created
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {filteredJobs.map((job) => (
                    <tr key={job.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(job.id)}
                          onChange={() => handleSelectOne(job.id)}
                          className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-slate-800 dark:text-slate-100">
                            {job.title || 'Untitled Job'}
                          </p>
                          <p className="flex items-center gap-2 text-xs text-slate-500">
                            <FaBuilding className="h-3 w-3" />
                            {job.companyName || 'Unknown Company'}
                            {job.location && (
                              <>
                                <span className="text-slate-300">·</span>
                                <FaMapMarkerAlt className="h-3 w-3" />
                                {job.location}
                              </>
                            )}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3">{getJobTypeBadge(job.jobType)}</td>
                      <td className="px-4 py-3">{getStatusBadge(job.status, job.approved)}</td>
                      <td className="px-4 py-3 text-sm text-slate-500">
                        {formatDate(job.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleViewDetails(job)}
                            className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-600 dark:border-slate-700"
                            title="View Details"
                          >
                            <FaEye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(job)}
                            className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:border-sky-300 hover:bg-sky-50 hover:text-sky-600 dark:border-slate-700"
                            title="Edit"
                          >
                            <FaEdit className="h-4 w-4" />
                          </button>
                          {!job.approved && job.status !== 'rejected' && (
                            <>
                              <button
                                onClick={() => {
                                  setSelectedJob(job);
                                  setShowApproveModal(true);
                                }}
                                className="rounded-lg border border-emerald-200 p-2 text-emerald-600 transition hover:bg-emerald-50"
                                title="Approve"
                              >
                                <FaCheckCircle className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedJob(job);
                                  setShowRejectModal(true);
                                }}
                                className="rounded-lg border border-red-200 p-2 text-red-600 transition hover:bg-red-50"
                                title="Reject"
                              >
                                <FaTimesCircle className="h-4 w-4" />
                              </button>
                            </>
                          )}
                          {job.status === 'closed' && (
                            <button
                              onClick={() => handleReopen(job.id)}
                              disabled={actionLoading}
                              className="rounded-lg border border-emerald-200 p-2 text-emerald-600 transition hover:bg-emerald-50"
                              title="Reopen"
                            >
                              <FaSync className="h-4 w-4" />
                            </button>
                          )}
                          {job.status === 'active' && (
                            <button
                              onClick={() => {
                                setSelectedJob(job);
                                setShowCloseModal(true);
                              }}
                              className="rounded-lg border border-amber-200 p-2 text-amber-600 transition hover:bg-amber-50"
                              title="Close"
                            >
                              <FaBan className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setSelectedJob(job);
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
          setSelectedJob(null);
        }}
        title="Job Details"
        size="lg"
      >
        {selectedJob && (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Title
                </p>
                <p className="mt-1 text-sm text-slate-800 dark:text-slate-100">
                  {selectedJob.title}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Company
                </p>
                <p className="mt-1 flex items-center gap-2 text-sm text-slate-800 dark:text-slate-100">
                  <FaBuilding className="text-slate-400" />
                  {selectedJob.companyName}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Type
                </p>
                <div className="mt-1">{getJobTypeBadge(selectedJob.jobType)}</div>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Status
                </p>
                <div className="mt-1">
                  {getStatusBadge(selectedJob.status, selectedJob.approved)}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Location
                </p>
                <p className="mt-1 flex items-center gap-2 text-sm text-slate-800 dark:text-slate-100">
                  <FaMapMarkerAlt className="text-slate-400" />
                  {selectedJob.location || 'Remote'}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Salary
                </p>
                <p className="mt-1 flex items-center gap-2 text-sm text-slate-800 dark:text-slate-100">
                  <FaMoneyBillWave className="text-slate-400" />
                  {selectedJob.salary || 'Not specified'}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Created
                </p>
                <p className="mt-1 text-sm text-slate-800 dark:text-slate-100">
                  {formatDate(selectedJob.createdAt)}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Deadline
                </p>
                <p className="mt-1 text-sm text-slate-800 dark:text-slate-100">
                  {formatDate(selectedJob.deadline)}
                </p>
              </div>
            </div>

            {selectedJob.description && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Description
                </p>
                <p className="mt-1 whitespace-pre-wrap rounded-lg bg-slate-50 p-3 text-sm text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                  {selectedJob.description}
                </p>
              </div>
            )}

            {selectedJob.requirements?.length > 0 && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Requirements
                </p>
                <ul className="mt-1 list-disc space-y-1 rounded-lg bg-slate-50 p-3 pl-7 text-sm text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                  {selectedJob.requirements.map((req, idx) => (
                    <li key={idx}>{req}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" onClick={() => setShowDetailsModal(false)}>
            Close
          </Button>
          {selectedJob && !selectedJob.approved && selectedJob.status !== 'rejected' && (
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

      {/* Edit Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditForm({});
          setSelectedJob(null);
        }}
        title="Edit Job"
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
              Title
            </label>
            <input
              type="text"
              value={editForm.title || ''}
              onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 dark:border-slate-700 dark:bg-slate-800"
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                Job Type
              </label>
              <select
                value={editForm.jobType || 'full-time'}
                onChange={(e) => setEditForm({ ...editForm, jobType: e.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800"
              >
                <option value="full-time">Full Time</option>
                <option value="part-time">Part Time</option>
                <option value="internship">Internship</option>
                <option value="freelance">Freelance</option>
                <option value="volunteer">Volunteer</option>
                <option value="remote">Remote</option>
                <option value="contract">Contract</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                Status
              </label>
              <select
                value={editForm.status || 'pending'}
                onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800"
              >
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="closed">Closed</option>
                <option value="draft">Draft</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                Location
              </label>
              <input
                type="text"
                value={editForm.location || ''}
                onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 dark:border-slate-700 dark:bg-slate-800"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                Salary
              </label>
              <input
                type="text"
                value={editForm.salary || ''}
                onChange={(e) => setEditForm({ ...editForm, salary: e.target.value })}
                placeholder="e.g. M 15,000 - M 25,000"
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 dark:border-slate-700 dark:bg-slate-800"
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
              Description
            </label>
            <textarea
              value={editForm.description || ''}
              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
              rows={5}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 dark:border-slate-700 dark:bg-slate-800"
            />
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setShowEditModal(false);
              setEditForm({});
              setSelectedJob(null);
            }}
          >
            Cancel
          </Button>
          <Button variant="primary" onClick={handleUpdateJob} disabled={actionLoading}>
            {actionLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </Modal>

      {/* Approve Modal */}
      <Modal
        isOpen={showApproveModal}
        onClose={() => {
          setShowApproveModal(false);
          setApproveComments('');
          setSelectedJob(null);
        }}
        title="Approve Job"
      >
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Approve <strong>{selectedJob?.title}</strong> from{' '}
          <strong>{selectedJob?.companyName}</strong>? It will become visible to all users.
        </p>
        <div className="mt-4">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
            Comments (optional)
          </label>
          <textarea
            value={approveComments}
            onChange={(e) => setApproveComments(e.target.value)}
            rows={3}
            className="mt-1 w-full rounded-lg border border-slate-200 p-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 dark:border-slate-700 dark:bg-slate-800"
          />
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setShowApproveModal(false);
              setApproveComments('');
              setSelectedJob(null);
            }}
          >
            Cancel
          </Button>
          <Button variant="primary" onClick={handleApprove} disabled={actionLoading}>
            {actionLoading ? 'Approving...' : 'Approve Job'}
          </Button>
        </div>
      </Modal>

      {/* Reject Modal */}
      <Modal
        isOpen={showRejectModal}
        onClose={() => {
          setShowRejectModal(false);
          setRejectReason('');
          setSelectedJob(null);
        }}
        title="Reject Job"
      >
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
          The company will be notified that their job was not approved.
        </div>
        <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">
          Reject <strong>{selectedJob?.title}</strong>?
        </p>
        <div className="mt-4">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
            Reason *
          </label>
          <textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            rows={4}
            className="mt-1 w-full rounded-lg border border-slate-200 p-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 dark:border-slate-700 dark:bg-slate-800"
          />
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setShowRejectModal(false);
              setRejectReason('');
              setSelectedJob(null);
            }}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleReject}
            disabled={actionLoading || !rejectReason.trim()}
          >
            {actionLoading ? 'Rejecting...' : 'Reject Job'}
          </Button>
        </div>
      </Modal>

      {/* Close Modal */}
      <Modal
        isOpen={showCloseModal}
        onClose={() => {
          setShowCloseModal(false);
          setCloseReason('');
          setSelectedJob(null);
        }}
        title="Close Job"
      >
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Close <strong>{selectedJob?.title}</strong>? It will no longer accept applications.
        </p>
        <div className="mt-4">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
            Reason *
          </label>
          <textarea
            value={closeReason}
            onChange={(e) => setCloseReason(e.target.value)}
            rows={3}
            className="mt-1 w-full rounded-lg border border-slate-200 p-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 dark:border-slate-700 dark:bg-slate-800"
          />
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setShowCloseModal(false);
              setCloseReason('');
              setSelectedJob(null);
            }}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleClose}
            disabled={actionLoading || !closeReason.trim()}
          >
            {actionLoading ? 'Closing...' : 'Close Job'}
          </Button>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setDeleteReason('');
          setSelectedJob(null);
        }}
        title="Delete Job"
      >
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <strong>Warning:</strong> This permanently deletes the job and all associated data.
        </div>
        <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">
          Delete <strong>{selectedJob?.title}</strong>?
        </p>
        <div className="mt-4">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
            Reason (optional)
          </label>
          <textarea
            value={deleteReason}
            onChange={(e) => setDeleteReason(e.target.value)}
            rows={3}
            className="mt-1 w-full rounded-lg border border-slate-200 p-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 dark:border-slate-700 dark:bg-slate-800"
          />
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setShowDeleteModal(false);
              setDeleteReason('');
              setSelectedJob(null);
            }}
          >
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete} disabled={actionLoading}>
            {actionLoading ? 'Deleting...' : 'Delete Job'}
          </Button>
        </div>
      </Modal>
    </AdminPageShell>
  );
};

export default JobManagement;