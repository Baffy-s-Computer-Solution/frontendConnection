import { useCallback, useEffect, useMemo, useState } from 'react';
import { FaBan, FaBuilding, FaCheckCircle, FaClock, FaDownload, FaEdit, FaEnvelope, FaExternalLinkAlt, FaEye, FaFilter, FaGlobe, FaHistory, FaIndustry, FaMapMarkerAlt, FaPhone, FaSearch, FaSync, FaTimes, FaTimesCircle, FaTrash, FaUserCheck, FaUsers } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';

import AdminPageShell from '../../components/admin/AdminPageShell';
import Button from '../../components/ui/Button';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import Modal from '../../components/ui/Modal';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import adminService from '../../services/adminService';
import cloudinaryService from '../../services/cloudinaryService';

const statusConfig = {
  pending: { label: 'Pending Review', color: 'bg-amber-100 text-amber-700', icon: FaClock },
  approved: { label: 'Approved', color: 'bg-emerald-100 text-emerald-700', icon: FaCheckCircle },
  active: { label: 'Active', color: 'bg-emerald-100 text-emerald-700', icon: FaCheckCircle },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-700', icon: FaTimesCircle },
  suspended: { label: 'Suspended', color: 'bg-slate-100 text-slate-700', icon: FaBan },
  awaiting_approval: { label: 'Awaiting Approval', color: 'bg-amber-100 text-amber-700', icon: FaClock },
  verified: { label: 'Verified', color: 'bg-sky-100 text-sky-700', icon: FaUserCheck },
};

const SearchCompanies = () => {
  const navigate = useNavigate();
  const { currentUser, userProfile, isAdmin } = useAuth();
  const { addSuccessNotification, addErrorNotification } = useNotification();

  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [industryFilter, setIndustryFilter] = useState('all');
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [approveComments, setApproveComments] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [suspendReason, setSuspendReason] = useState('');
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
    suspended: 0,
    rejected: 0,
  });

  const itemsPerPage = 15;

  const loadCompanies = useCallback(async () => {
    if (!isAdmin) return;
    setError('');
    setLoading(true);

    try {
      const response = await adminService.companies.getAllCompanies(
        { search, status: statusFilter, industry: industryFilter },
        currentPage,
        itemsPerPage
      );

      if (response.success) {
        setCompanies(response.data.companies || []);
        setTotalPages(response.data.totalPages || 1);
        setStats(
          response.data.stats || {
            total: 0,
            pending: 0,
            approved: 0,
            suspended: 0,
            rejected: 0,
          }
        );
      } else {
        setError(response.error || 'Failed to load companies');
      }
    } catch (err) {
      console.error('Error loading companies:', err);
      setError(err.message || 'Failed to load companies');
      addErrorNotification('Error', 'Failed to load companies');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [isAdmin, search, statusFilter, industryFilter, currentPage, addErrorNotification]);

  useEffect(() => {
    loadCompanies();
  }, [loadCompanies]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadCompanies();
  };

  const handleViewDetails = async (company) => {
    try {
      const details = await adminService.companies.getCompanyDetails(company.id);
      setSelectedCompany(details.success ? details.data : company);
      setShowDetailsModal(true);
    } catch (err) {
      console.error('Error loading company details:', err);
      setSelectedCompany(company);
      setShowDetailsModal(true);
    }
  };

  const handleEdit = (company) => {
    setEditForm({ ...company });
    setSelectedCompany(company);
    setShowEditModal(true);
  };

  const handleUpdateCompany = async () => {
    setActionLoading(true);
    try {
      const response = await adminService.companies.updateCompany(
        editForm.id,
        editForm,
        currentUser,
        userProfile
      );

      if (response.success) {
        addSuccessNotification('Success', 'Company updated successfully');
        setShowEditModal(false);
        setEditForm({});
        setSelectedCompany(null);
        await loadCompanies();
      } else {
        throw new Error(response.error || 'Failed to update company');
      }
    } catch (err) {
      console.error('Error updating company:', err);
      addErrorNotification('Error', err.message || 'Failed to update company');
    } finally {
      setActionLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedCompany) return;
    setActionLoading(true);

    try {
      const response = await adminService.companies.approveCompany(
        selectedCompany.id,
        approveComments,
        currentUser,
        userProfile
      );

      if (response.success) {
        addSuccessNotification('Success', 'Company approved successfully');
        setShowApproveModal(false);
        setApproveComments('');
        setSelectedCompany(null);
        await loadCompanies();
      } else {
        throw new Error(response.error || 'Failed to approve company');
      }
    } catch (err) {
      console.error('Error approving company:', err);
      addErrorNotification('Error', err.message || 'Failed to approve company');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedCompany || !rejectReason.trim()) return;
    setActionLoading(true);

    try {
      const response = await adminService.companies.rejectCompany(
        selectedCompany.id,
        rejectReason,
        currentUser,
        userProfile
      );

      if (response.success) {
        addSuccessNotification('Success', 'Company rejected successfully');
        setShowRejectModal(false);
        setRejectReason('');
        setSelectedCompany(null);
        await loadCompanies();
      } else {
        throw new Error(response.error || 'Failed to reject company');
      }
    } catch (err) {
      console.error('Error rejecting company:', err);
      addErrorNotification('Error', err.message || 'Failed to reject company');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSuspend = async () => {
    if (!selectedCompany || !suspendReason.trim()) return;
    setActionLoading(true);

    try {
      const response = await adminService.companies.suspendCompany(
        selectedCompany.id,
        suspendReason,
        currentUser,
        userProfile
      );

      if (response.success) {
        addSuccessNotification('Success', 'Company suspended successfully');
        setShowSuspendModal(false);
        setSuspendReason('');
        setSelectedCompany(null);
        await loadCompanies();
      } else {
        throw new Error(response.error || 'Failed to suspend company');
      }
    } catch (err) {
      console.error('Error suspending company:', err);
      addErrorNotification('Error', err.message || 'Failed to suspend company');
    } finally {
      setActionLoading(false);
    }
  };

  const handleActivate = async (companyId) => {
    setActionLoading(true);
    try {
      const response = await adminService.companies.activateCompany(
        companyId,
        currentUser,
        userProfile
      );

      if (response.success) {
        addSuccessNotification('Success', 'Company activated successfully');
        await loadCompanies();
      } else {
        throw new Error(response.error || 'Failed to activate company');
      }
    } catch (err) {
      console.error('Error activating company:', err);
      addErrorNotification('Error', err.message || 'Failed to activate company');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedCompany) return;
    setActionLoading(true);

    try {
      const response = await adminService.companies.deleteCompany(
        selectedCompany.id,
        deleteReason,
        currentUser,
        userProfile
      );

      if (response.success) {
        addSuccessNotification('Success', 'Company deleted successfully');
        setShowDeleteModal(false);
        setDeleteReason('');
        setSelectedCompany(null);
        await loadCompanies();
      } else {
        throw new Error(response.error || 'Failed to delete company');
      }
    } catch (err) {
      console.error('Error deleting company:', err);
      addErrorNotification('Error', err.message || 'Failed to delete company');
    } finally {
      setActionLoading(false);
    }
  };

  const handleBulkApprove = async () => {
    if (selectedIds.length === 0) return;
    setActionLoading(true);

    try {
      const response = await adminService.companies.bulkApproveCompanies(
        selectedIds,
        'Bulk approval',
        currentUser,
        userProfile
      );

      if (response.success) {
        addSuccessNotification('Success', `${selectedIds.length} companies approved`);
        setSelectedIds([]);
        await loadCompanies();
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
    const reason = prompt('Enter rejection reason for all selected companies:');
    if (!reason) return;
    setActionLoading(true);

    try {
      const response = await adminService.companies.bulkRejectCompanies(
        selectedIds,
        reason,
        currentUser,
        userProfile
      );

      if (response.success) {
        addSuccessNotification('Success', `${selectedIds.length} companies rejected`);
        setSelectedIds([]);
        await loadCompanies();
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
        `Are you sure you want to delete ${selectedIds.length} companies? This cannot be undone.`
      )
    )
      return;
    setActionLoading(true);

    try {
      const response = await adminService.companies.bulkDeleteCompanies(
        selectedIds,
        'Bulk deletion',
        currentUser,
        userProfile
      );

      if (response.success) {
        addSuccessNotification('Success', `${selectedIds.length} companies deleted`);
        setSelectedIds([]);
        await loadCompanies();
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
    if (selectedIds.length === companies.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(companies.map((c) => c.id));
    }
  };

  const handleSelectOne = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleExport = async (format = 'csv') => {
    try {
      const response = await adminService.companies.exportCompanies(
        { search, status: statusFilter, industry: industryFilter },
        format
      );

      if (response.success && response.data) {
        const blob = new Blob([response.data], {
          type: format === 'csv' ? 'text/csv' : 'application/json',
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `companies-${new Date().toISOString().slice(0, 10)}.${format}`;
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
      addErrorNotification('Error', 'Failed to export companies');
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

  const filteredCompanies = useMemo(() => {
    return companies.filter((company) => {
      const matchesSearch =
        !search ||
        company.companyName?.toLowerCase().includes(search.toLowerCase()) ||
        company.name?.toLowerCase().includes(search.toLowerCase()) ||
        company.email?.toLowerCase().includes(search.toLowerCase()) ||
        company.industry?.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'all' || company.status === statusFilter;
      const matchesIndustry = industryFilter === 'all' || company.industry === industryFilter;
      return matchesSearch && matchesStatus && matchesIndustry;
    });
  }, [companies, search, statusFilter, industryFilter]);

  if (!isAdmin) {
    return (
      <AdminPageShell
        title="Search Companies"
        description="Access denied - Admin privileges required"
        icon={FaBuilding}
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
      title="Search Companies"
      description="Search, verify, and manage employer and partner companies"
      icon={FaBuilding}
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
          {
            label: 'Suspended',
            value: stats.suspended,
            color: 'text-slate-700',
            bg: 'bg-slate-100',
          },
          { label: 'Rejected', value: stats.rejected, color: 'text-red-700', bg: 'bg-red-100' },
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
                <FaBuilding className={`h-5 w-5 ${stat.color}`} />
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
                placeholder="Search by company name, email, or industry..."
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
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="rejected">Rejected</option>
              <option value="awaiting_approval">Awaiting Approval</option>
              <option value="verified">Verified</option>
            </select>
            <select
              value={industryFilter}
              onChange={(e) => {
                setIndustryFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800"
            >
              <option value="all">All Industries</option>
              <option value="technology">Technology</option>
              <option value="finance">Finance</option>
              <option value="healthcare">Healthcare</option>
              <option value="education">Education</option>
              <option value="retail">Retail</option>
              <option value="manufacturing">Manufacturing</option>
              <option value="consulting">Consulting</option>
            </select>
          </div>

          {selectedIds.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-2 rounded-lg border border-brand-200 bg-brand-50 p-3 dark:border-brand-700 dark:bg-brand-950">
              <span className="text-sm font-medium text-brand-700 dark:text-brand-200">
                {selectedIds.length} selected
              </span>
              <Button variant="primary" size="sm" onClick={handleBulkApprove} disabled={actionLoading}>
                <FaCheckCircle className="mr-1" /> Approve
              </Button>
              <Button variant="danger" size="sm" onClick={handleBulkReject} disabled={actionLoading}>
                <FaTimes className="mr-1" /> Reject
              </Button>
              <Button variant="danger" size="sm" onClick={handleBulkDelete} disabled={actionLoading}>
                <FaTrash className="mr-1" /> Delete
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

      {/* Companies Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              Companies
            </h2>
            <span className="text-sm text-slate-500">
              {filteredCompanies.length} company(ies)
            </span>
          </div>
        </CardHeader>
        <CardBody className="p-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600" />
              <p className="mt-4 text-sm text-slate-500">Loading companies...</p>
            </div>
          ) : filteredCompanies.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <FaBuilding className="mb-3 h-12 w-12 text-slate-300" />
              <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200">
                No companies found
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Adjust your filters or wait for new registrations.
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
                          selectedIds.length === filteredCompanies.length &&
                          filteredCompanies.length > 0
                        }
                        onChange={handleSelectAll}
                        className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Company
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Industry
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
                  {filteredCompanies.map((company) => (
                    <tr
                      key={company.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    >
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(company.id)}
                          onChange={() => handleSelectOne(company.id)}
                          className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-100 text-brand-700">
                            {company.logo ? (
                              <img
                                src={company.logo}
                                alt={company.companyName}
                                className="h-10 w-10 rounded-lg object-cover"
                              />
                            ) : (
                              <FaBuilding />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-slate-800 dark:text-slate-100">
                              {company.companyName || company.name || 'Unnamed Company'}
                            </p>
                            <p className="flex items-center gap-1 text-xs text-slate-500">
                              <FaEnvelope className="h-3 w-3" />
                              {company.email || 'No email'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <FaIndustry className="text-slate-400" />
                          <span className="text-sm text-slate-700 dark:text-slate-200">
                            {company.industry || 'Not specified'}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">{getStatusBadge(company.status)}</td>
                      <td className="px-4 py-3 text-sm text-slate-500">
                        {formatDate(company.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleViewDetails(company)}
                            className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-600 dark:border-slate-700"
                            title="View Details"
                          >
                            <FaEye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(company)}
                            className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:border-sky-300 hover:bg-sky-50 hover:text-sky-600 dark:border-slate-700"
                            title="Edit"
                          >
                            <FaEdit className="h-4 w-4" />
                          </button>
                          {['pending', 'awaiting_approval'].includes(company.status) && (
                            <>
                              <button
                                onClick={() => {
                                  setSelectedCompany(company);
                                  setShowApproveModal(true);
                                }}
                                className="rounded-lg border border-emerald-200 p-2 text-emerald-600 transition hover:bg-emerald-50"
                                title="Approve"
                              >
                                <FaCheckCircle className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedCompany(company);
                                  setShowRejectModal(true);
                                }}
                                className="rounded-lg border border-red-200 p-2 text-red-600 transition hover:bg-red-50"
                                title="Reject"
                              >
                                <FaTimesCircle className="h-4 w-4" />
                              </button>
                            </>
                          )}
                          {['approved', 'active'].includes(company.status) && (
                            <button
                              onClick={() => {
                                setSelectedCompany(company);
                                setShowSuspendModal(true);
                              }}
                              className="rounded-lg border border-amber-200 p-2 text-amber-600 transition hover:bg-amber-50"
                              title="Suspend"
                            >
                              <FaBan className="h-4 w-4" />
                            </button>
                          )}
                          {company.status === 'suspended' && (
                            <button
                              onClick={() => handleActivate(company.id)}
                              className="rounded-lg border border-emerald-200 p-2 text-emerald-600 transition hover:bg-emerald-50"
                              title="Activate"
                            >
                              <FaUserCheck className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setSelectedCompany(company);
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
          setSelectedCompany(null);
        }}
        title={selectedCompany?.companyName || selectedCompany?.name || 'Company Details'}
        size="lg"
      >
        {selectedCompany && (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Company Name
                </p>
                <p className="mt-1 text-sm text-slate-800 dark:text-slate-100">
                  {selectedCompany.companyName || selectedCompany.name || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Email
                </p>
                <p className="mt-1 flex items-center gap-2 text-sm text-slate-800 dark:text-slate-100">
                  <FaEnvelope className="text-slate-400" />
                  {selectedCompany.email || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Phone
                </p>
                <p className="mt-1 flex items-center gap-2 text-sm text-slate-800 dark:text-slate-100">
                  <FaPhone className="text-slate-400" />
                  {selectedCompany.phoneNumber || selectedCompany.phone || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Industry
                </p>
                <p className="mt-1 flex items-center gap-2 text-sm text-slate-800 dark:text-slate-100">
                  <FaIndustry className="text-slate-400" />
                  {selectedCompany.industry || 'Not specified'}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Website
                </p>
                <p className="mt-1 flex items-center gap-2 text-sm text-slate-800 dark:text-slate-100">
                  <FaGlobe className="text-slate-400" />
                  {selectedCompany.website ? (
                    <a
                      href={selectedCompany.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand-600 hover:underline"
                    >
                      {selectedCompany.website}
                    </a>
                  ) : (
                    'N/A'
                  )}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Location
                </p>
                <p className="mt-1 flex items-center gap-2 text-sm text-slate-800 dark:text-slate-100">
                  <FaMapMarkerAlt className="text-slate-400" />
                  {selectedCompany.location || selectedCompany.address || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Status
                </p>
                <div className="mt-1">{getStatusBadge(selectedCompany.status)}</div>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Created
                </p>
                <p className="mt-1 text-sm text-slate-800 dark:text-slate-100">
                  {formatDate(selectedCompany.createdAt)}
                </p>
              </div>
            </div>

            {selectedCompany.description && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Description
                </p>
                <p className="mt-1 rounded-lg bg-slate-50 p-3 text-sm text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                  {selectedCompany.description}
                </p>
              </div>
            )}
          </div>
        )}
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" onClick={() => setShowDetailsModal(false)}>
            Close
          </Button>
          {selectedCompany && ['pending', 'awaiting_approval'].includes(selectedCompany.status) && (
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
        }}
        title="Edit Company"
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
              Company Name
            </label>
            <input
              type="text"
              value={editForm.companyName || editForm.name || ''}
              onChange={(e) => setEditForm({ ...editForm, companyName: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 dark:border-slate-700 dark:bg-slate-800"
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                Email
              </label>
              <input
                type="email"
                value={editForm.email || ''}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 dark:border-slate-700 dark:bg-slate-800"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                Phone
              </label>
              <input
                type="tel"
                value={editForm.phoneNumber || editForm.phone || ''}
                onChange={(e) => setEditForm({ ...editForm, phoneNumber: e.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 dark:border-slate-700 dark:bg-slate-800"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                Industry
              </label>
              <input
                type="text"
                value={editForm.industry || ''}
                onChange={(e) => setEditForm({ ...editForm, industry: e.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 dark:border-slate-700 dark:bg-slate-800"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                Website
              </label>
              <input
                type="url"
                value={editForm.website || ''}
                onChange={(e) => setEditForm({ ...editForm, website: e.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 dark:border-slate-700 dark:bg-slate-800"
              />
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
                Status
              </label>
              <select
                value={editForm.status || 'pending'}
                onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800"
              >
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
                <option value="rejected">Rejected</option>
                <option value="verified">Verified</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
              Description
            </label>
            <textarea
              value={editForm.description || ''}
              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
              rows={4}
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
            }}
          >
            Cancel
          </Button>
          <Button variant="primary" onClick={handleUpdateCompany} disabled={actionLoading}>
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
        }}
        title="Approve Company"
      >
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Are you sure you want to approve{' '}
          <strong>{selectedCompany?.companyName || selectedCompany?.name}</strong>?
        </p>
        <div className="mt-4">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
            Comments (optional)
          </label>
          <textarea
            value={approveComments}
            onChange={(e) => setApproveComments(e.target.value)}
            rows={3}
            placeholder="Add any comments for the company..."
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
            {actionLoading ? 'Approving...' : 'Approve Company'}
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
        title="Reject Company"
      >
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
          This will notify the company that their registration was not approved.
        </div>
        <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">
          Are you sure you want to reject{' '}
          <strong>{selectedCompany?.companyName || selectedCompany?.name}</strong>?
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
            {actionLoading ? 'Rejecting...' : 'Reject Company'}
          </Button>
        </div>
      </Modal>

      {/* Suspend Modal */}
      <Modal
        isOpen={showSuspendModal}
        onClose={() => {
          setShowSuspendModal(false);
          setSuspendReason('');
        }}
        title="Suspend Company"
      >
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Are you sure you want to suspend{' '}
          <strong>{selectedCompany?.companyName || selectedCompany?.name}</strong>?
        </p>
        <div className="mt-4">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
            Reason for suspension *
          </label>
          <textarea
            value={suspendReason}
            onChange={(e) => setSuspendReason(e.target.value)}
            rows={3}
            placeholder="Provide a reason for suspension..."
            className="mt-1 w-full rounded-lg border border-slate-200 p-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 dark:border-slate-700 dark:bg-slate-800"
            required
          />
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setShowSuspendModal(false);
              setSuspendReason('');
            }}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleSuspend}
            disabled={actionLoading || !suspendReason.trim()}
          >
            {actionLoading ? 'Suspending...' : 'Suspend Company'}
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
        title="Delete Company"
      >
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <strong>Warning:</strong> This action cannot be undone. The company will be permanently
          removed.
        </div>
        <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">
          Are you sure you want to delete{' '}
          <strong>{selectedCompany?.companyName || selectedCompany?.name}</strong>?
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
            {actionLoading ? 'Deleting...' : 'Delete Company'}
          </Button>
        </div>
      </Modal>
    </AdminPageShell>
  );
};

export default SearchCompanies;