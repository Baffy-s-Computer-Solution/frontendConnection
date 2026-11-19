import { useCallback, useEffect, useMemo, useState } from 'react';
import { FaBan, FaCheckCircle, FaClock, FaCrown, FaDownload, FaEdit, FaEnvelope, FaEye, FaFilter, FaKey, FaLock, FaPlus, FaSearch, FaShieldAlt, FaSync, FaTimes, FaTimesCircle, FaTrash, FaUnlock, FaUser, FaUserCog, FaUserPlus, FaUserShield } from "react-icons/fa";

import AdminPageShell from '../../components/admin/AdminPageShell';
import Button from '../../components/ui/Button';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import Modal from '../../components/ui/Modal';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import adminService from '../../services/adminService';

const roleConfig = {
  super_admin: {
    label: 'Super Admin',
    color: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-200',
    icon: FaCrown,
  },
  admin: {
    label: 'Admin',
    color: 'bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-200',
    icon: FaUserShield,
  },
  moderator: {
    label: 'Moderator',
    color: 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-200',
    icon: FaUserCog,
  },
  auditor: {
    label: 'Auditor',
    color: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-200',
    icon: FaEye,
  },
};

const statusConfig = {
  active: { label: 'Active', color: 'bg-emerald-100 text-emerald-700', icon: FaCheckCircle },
  suspended: { label: 'Suspended', color: 'bg-red-100 text-red-700', icon: FaBan },
  pending: { label: 'Pending', color: 'bg-amber-100 text-amber-700', icon: FaClock },
  revoked: { label: 'Revoked', color: 'bg-slate-100 text-slate-700', icon: FaTimesCircle },
};

const AdminManagement = () => {
  const { currentUser, userProfile, isAdmin } = useAuth();
  const { addSuccessNotification, addErrorNotification } = useNotification();

  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [showRevokeModal, setShowRevokeModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [suspendReason, setSuspendReason] = useState('');
  const [revokeReason, setRevokeReason] = useState('');
  const [deleteReason, setDeleteReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [form, setForm] = useState({
    email: '',
    displayName: '',
    role: 'admin',
    permissions: ['users.read', 'companies.read'],
  });
  const [editForm, setEditForm] = useState({});
  const [stats, setStats] = useState({
    total: 0,
    superAdmins: 0,
    admins: 0,
    moderators: 0,
    suspended: 0,
  });

  const itemsPerPage = 15;

  const isSuperAdmin = useMemo(() => {
    const email = String(currentUser?.email || '').toLowerCase();
    const ownerEmail = String(import.meta.env.VITE_SUPER_ADMIN_EMAIL || '').toLowerCase();
    return (
      userProfile?.role === 'super_admin' ||
      userProfile?.adminLevel === 'super_admin' ||
      (ownerEmail && ownerEmail === email)
    );
  }, [currentUser?.email, userProfile?.role, userProfile?.adminLevel]);

  const loadAdmins = useCallback(async () => {
    if (!isAdmin) return;
    setError('');
    setLoading(true);

    try {
      const response = await adminService.admins.getAllAdmins(
        { search, role: roleFilter, status: statusFilter },
        currentPage,
        itemsPerPage
      );

      if (response.success) {
        setAdmins(response.data.admins || response.data || []);
        setTotalPages(response.data.totalPages || 1);
        setStats(
          response.data.stats || {
            total: 0,
            superAdmins: 0,
            admins: 0,
            moderators: 0,
            suspended: 0,
          }
        );
      } else {
        setError(response.error || 'Failed to fetch admins');
      }
    } catch (err) {
      console.error('Error loading admins:', err);
      setError(err.message || 'Failed to load admins');
      addErrorNotification('Error', 'Failed to load administrators');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [isAdmin, search, roleFilter, statusFilter, currentPage, addErrorNotification]);

  useEffect(() => {
    loadAdmins();
  }, [loadAdmins]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadAdmins();
  };

  const handleCreateAdmin = async (event) => {
    event.preventDefault();
    if (!isSuperAdmin) {
      addErrorNotification('Forbidden', 'Only super admins can create new admins');
      return;
    }

    if (!form.email.trim()) {
      addErrorNotification('Validation', 'Email address is required');
      return;
    }

    setSaving(true);
    try {
      const response = await adminService.admins.createAdmin(form, currentUser, userProfile);

      if (response.success) {
        addSuccessNotification('Success', 'Administrator created successfully');
        setShowCreateModal(false);
        setForm({
          email: '',
          displayName: '',
          role: 'admin',
          permissions: ['users.read', 'companies.read'],
        });
        await loadAdmins();
      } else {
        throw new Error(response.error || 'Failed to create admin');
      }
    } catch (err) {
      console.error('Error creating admin:', err);
      addErrorNotification('Error', err.message || 'Failed to create admin');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (admin) => {
    setSelectedAdmin(admin);
    setEditForm({ ...admin });
    setShowEditModal(true);
  };

  const handleUpdateAdmin = async () => {
    if (!isSuperAdmin) {
      addErrorNotification('Forbidden', 'Only super admins can modify admins');
      return;
    }

    setActionLoading(true);
    try {
      const response = await adminService.admins.updateAdmin(
        editForm.id,
        editForm,
        currentUser,
        userProfile
      );

      if (response.success) {
        addSuccessNotification('Success', 'Administrator updated successfully');
        setShowEditModal(false);
        setEditForm({});
        setSelectedAdmin(null);
        await loadAdmins();
      } else {
        throw new Error(response.error || 'Failed to update admin');
      }
    } catch (err) {
      console.error('Error updating admin:', err);
      addErrorNotification('Error', err.message || 'Failed to update admin');
    } finally {
      setActionLoading(false);
    }
  };

  const handleViewDetails = async (admin) => {
    try {
      const response = await adminService.admins.getAdminDetails(admin.id);
      setSelectedAdmin(response.success ? response.data : admin);
      setShowDetailsModal(true);
    } catch (err) {
      console.error('Error loading admin details:', err);
      setSelectedAdmin(admin);
      setShowDetailsModal(true);
    }
  };

  const handleSuspend = async () => {
    if (!isSuperAdmin || !selectedAdmin || !suspendReason.trim()) return;
    setActionLoading(true);

    try {
      const response = await adminService.admins.suspendAdmin(
        selectedAdmin.id,
        suspendReason,
        currentUser,
        userProfile
      );

      if (response.success) {
        addSuccessNotification('Success', 'Administrator suspended');
        setShowSuspendModal(false);
        setSuspendReason('');
        setSelectedAdmin(null);
        await loadAdmins();
      } else {
        throw new Error(response.error || 'Failed to suspend admin');
      }
    } catch (err) {
      console.error('Error suspending admin:', err);
      addErrorNotification('Error', err.message || 'Failed to suspend admin');
    } finally {
      setActionLoading(false);
    }
  };

  const handleActivate = async (adminId) => {
    if (!isSuperAdmin) return;
    setActionLoading(true);
    try {
      const response = await adminService.admins.activateAdmin(
        adminId,
        currentUser,
        userProfile
      );

      if (response.success) {
        addSuccessNotification('Success', 'Administrator reactivated');
        await loadAdmins();
      } else {
        throw new Error(response.error || 'Failed to activate admin');
      }
    } catch (err) {
      console.error('Error activating admin:', err);
      addErrorNotification('Error', err.message || 'Failed to activate admin');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRevokeAccess = async () => {
    if (!isSuperAdmin || !selectedAdmin || !revokeReason.trim()) return;
    setActionLoading(true);

    try {
      const response = await adminService.admins.revokeAdminAccess(
        selectedAdmin.id,
        revokeReason,
        currentUser,
        userProfile
      );

      if (response.success) {
        addSuccessNotification('Success', 'Administrator access revoked');
        setShowRevokeModal(false);
        setRevokeReason('');
        setSelectedAdmin(null);
        await loadAdmins();
      } else {
        throw new Error(response.error || 'Failed to revoke access');
      }
    } catch (err) {
      console.error('Error revoking access:', err);
      addErrorNotification('Error', err.message || 'Failed to revoke access');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!isSuperAdmin || !selectedAdmin) return;
    if (selectedAdmin.id === currentUser?.uid) {
      addErrorNotification('Forbidden', 'You cannot delete your own account');
      return;
    }
    setActionLoading(true);

    try {
      const response = await adminService.admins.deleteAdmin(
        selectedAdmin.id,
        deleteReason,
        currentUser,
        userProfile
      );

      if (response.success) {
        addSuccessNotification('Success', 'Administrator deleted');
        setShowDeleteModal(false);
        setDeleteReason('');
        setSelectedAdmin(null);
        await loadAdmins();
      } else {
        throw new Error(response.error || 'Failed to delete admin');
      }
    } catch (err) {
      console.error('Error deleting admin:', err);
      addErrorNotification('Error', err.message || 'Failed to delete admin');
    } finally {
      setActionLoading(false);
    }
  };

  const handleExport = async (format = 'csv') => {
    try {
      const response = await adminService.admins.exportAdmins(
        { search, role: roleFilter, status: statusFilter },
        format
      );

      if (response.success && response.data) {
        const blob = new Blob([response.data], {
          type: format === 'csv' ? 'text/csv' : 'application/json',
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `admins-${new Date().toISOString().slice(0, 10)}.${format}`;
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
      addErrorNotification('Error', 'Failed to export administrators');
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

  const getRoleBadge = (role) => {
    const config = roleConfig[role] || roleConfig.admin;
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

  const getStatusBadge = (status) => {
    const config = statusConfig[status] || statusConfig.pending;
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

  const filteredAdmins = useMemo(() => {
    return admins.filter((admin) => {
      const matchesSearch =
        !search ||
        admin.displayName?.toLowerCase().includes(search.toLowerCase()) ||
        admin.email?.toLowerCase().includes(search.toLowerCase());
      const matchesRole = roleFilter === 'all' || admin.role === roleFilter;
      const matchesStatus = statusFilter === 'all' || admin.status === statusFilter;
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [admins, search, roleFilter, statusFilter]);

  if (!isAdmin) {
    return (
      <AdminPageShell
        title="Admin Management"
        description="Access denied - Admin privileges required"
        icon={FaShieldAlt}
      >
        <Card>
          <CardBody>
            <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-700">
              <FaTimesCircle className="mb-3 h-10 w-10" />
              <h2 className="text-xl font-semibold">Access Denied</h2>
              <p className="mt-1 text-sm">You must be an administrator to access this page.</p>
            </div>
          </CardBody>
        </Card>
      </AdminPageShell>
    );
  }

  return (
    <AdminPageShell
      title="Admin Management"
      description="Owner-level control for admin accounts, roles, and permissions"
      icon={FaShieldAlt}
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${
              isSuperAdmin
                ? 'bg-purple-100 text-purple-700'
                : 'bg-slate-100 text-slate-700'
            }`}
          >
            {isSuperAdmin ? <FaCrown /> : <FaUserShield />}
            {isSuperAdmin ? 'Super Admin' : 'Admin'}
          </span>
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
          {isSuperAdmin && (
            <Button variant="primary" size="sm" onClick={() => setShowCreateModal(true)}>
              <FaUserPlus className="mr-2" /> New Admin
            </Button>
          )}
        </div>
      }
    >
      {/* Stats */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {[
          { label: 'Total Admins', value: stats.total, color: 'text-slate-700', bg: 'bg-slate-100' },
          {
            label: 'Super Admins',
            value: stats.superAdmins,
            color: 'text-purple-700',
            bg: 'bg-purple-100',
          },
          { label: 'Admins', value: stats.admins, color: 'text-brand-700', bg: 'bg-brand-100' },
          {
            label: 'Moderators',
            value: stats.moderators,
            color: 'text-sky-700',
            bg: 'bg-sky-100',
          },
          {
            label: 'Suspended',
            value: stats.suspended,
            color: 'text-red-700',
            bg: 'bg-red-100',
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
                className={`flex h-10 w-10 items-center justify-center rounded-full ${stat.bg}`}
              >
                <FaUserShield className={`h-5 w-5 ${stat.color}`} />
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
                placeholder="Search by name or email..."
                className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-10 pr-4 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 dark:border-slate-700 dark:bg-slate-800"
              />
            </div>
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800"
            >
              <option value="all">All Roles</option>
              <option value="super_admin">Super Admin</option>
              <option value="admin">Admin</option>
              <option value="moderator">Moderator</option>
              <option value="auditor">Auditor</option>
            </select>
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
              <option value="suspended">Suspended</option>
              <option value="pending">Pending</option>
              <option value="revoked">Revoked</option>
            </select>
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

      {/* Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              Administrators
            </h2>
            <span className="text-sm text-slate-500">{filteredAdmins.length} admin(s)</span>
          </div>
        </CardHeader>
        <CardBody className="p-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600" />
              <p className="mt-4 text-sm text-slate-500">Loading administrators...</p>
            </div>
          ) : filteredAdmins.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <FaUserShield className="mb-3 h-12 w-12 text-slate-300" />
              <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200">
                No administrators found
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                {isSuperAdmin
                  ? 'Create the first administrator using the button above.'
                  : 'Adjust filters to see more results.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Admin
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Role
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Last Login
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {filteredAdmins.map((admin) => (
                    <tr key={admin.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-10 w-10 items-center justify-center rounded-full ${
                              admin.role === 'super_admin'
                                ? 'bg-purple-100 text-purple-700'
                                : 'bg-brand-100 text-brand-700'
                            }`}
                          >
                            {admin.role === 'super_admin' ? <FaCrown /> : <FaUser />}
                          </div>
                          <div>
                            <p className="font-medium text-slate-800 dark:text-slate-100">
                              {admin.displayName || 'Admin User'}
                              {admin.id === currentUser?.uid && (
                                <span className="ml-2 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                                  You
                                </span>
                              )}
                            </p>
                            <p className="flex items-center gap-1 text-xs text-slate-500">
                              <FaEnvelope className="h-3 w-3" />
                              {admin.email || 'N/A'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">{getRoleBadge(admin.role)}</td>
                      <td className="px-4 py-3">{getStatusBadge(admin.status || 'active')}</td>
                      <td className="px-4 py-3 text-sm text-slate-500">
                        {formatDate(admin.lastLogin)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleViewDetails(admin)}
                            className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-600 dark:border-slate-700"
                            title="View Details"
                          >
                            <FaEye className="h-4 w-4" />
                          </button>
                          {isSuperAdmin && admin.id !== currentUser?.uid && (
                            <>
                              <button
                                onClick={() => handleEdit(admin)}
                                className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:border-sky-300 hover:bg-sky-50 hover:text-sky-600 dark:border-slate-700"
                                title="Edit"
                              >
                                <FaEdit className="h-4 w-4" />
                              </button>
                              {admin.status === 'suspended' ? (
                                <button
                                  onClick={() => handleActivate(admin.id)}
                                  disabled={actionLoading}
                                  className="rounded-lg border border-emerald-200 p-2 text-emerald-600 transition hover:bg-emerald-50"
                                  title="Reactivate"
                                >
                                  <FaUnlock className="h-4 w-4" />
                                </button>
                              ) : (
                                <button
                                  onClick={() => {
                                    setSelectedAdmin(admin);
                                    setShowSuspendModal(true);
                                  }}
                                  className="rounded-lg border border-amber-200 p-2 text-amber-600 transition hover:bg-amber-50"
                                  title="Suspend"
                                >
                                  <FaLock className="h-4 w-4" />
                                </button>
                              )}
                              <button
                                onClick={() => {
                                  setSelectedAdmin(admin);
                                  setShowRevokeModal(true);
                                }}
                                className="rounded-lg border border-orange-200 p-2 text-orange-600 transition hover:bg-orange-50"
                                title="Revoke Access"
                              >
                                <FaKey className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedAdmin(admin);
                                  setShowDeleteModal(true);
                                }}
                                className="rounded-lg border border-slate-200 p-2 text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 dark:border-slate-700"
                                title="Delete"
                              >
                                <FaTrash className="h-4 w-4" />
                              </button>
                            </>
                          )}
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

      {/* Create Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setForm({
            email: '',
            displayName: '',
            role: 'admin',
            permissions: ['users.read', 'companies.read'],
          });
        }}
        title="Create Administrator"
      >
        <form onSubmit={handleCreateAdmin} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
              Email Address *
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
              placeholder="admin@careerconnect.co.ls"
              required
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 dark:border-slate-700 dark:bg-slate-800"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
              Display Name
            </label>
            <input
              type="text"
              value={form.displayName}
              onChange={(e) => setForm((prev) => ({ ...prev, displayName: e.target.value }))}
              placeholder="Full name"
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 dark:border-slate-700 dark:bg-slate-800"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
              Admin Role *
            </label>
            <select
              value={form.role}
              onChange={(e) => setForm((prev) => ({ ...prev, role: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800"
            >
              <option value="admin">Admin</option>
              <option value="moderator">Moderator</option>
              <option value="auditor">Auditor</option>
              <option value="super_admin">Super Admin</option>
            </select>
          </div>
          <div className="rounded-lg border border-brand-200 bg-brand-50 p-3 text-xs text-brand-700 dark:border-brand-800 dark:bg-brand-950 dark:text-brand-200">
            <FaShieldAlt className="mb-1 inline h-3 w-3" /> The new admin will receive an
            invitation email with instructions to set up their account.
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowCreateModal(false);
                setForm({
                  email: '',
                  displayName: '',
                  role: 'admin',
                  permissions: ['users.read', 'companies.read'],
                });
              }}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={saving || !form.email.trim()}>
              {saving ? 'Creating...' : 'Create Administrator'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditForm({});
          setSelectedAdmin(null);
        }}
        title="Edit Administrator"
      >
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
              Display Name
            </label>
            <input
              type="text"
              value={editForm.displayName || ''}
              onChange={(e) => setEditForm({ ...editForm, displayName: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 dark:border-slate-700 dark:bg-slate-800"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
              Role
            </label>
            <select
              value={editForm.role || 'admin'}
              onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800"
            >
              <option value="admin">Admin</option>
              <option value="moderator">Moderator</option>
              <option value="auditor">Auditor</option>
              <option value="super_admin">Super Admin</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
              Status
            </label>
            <select
              value={editForm.status || 'active'}
              onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800"
            >
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setShowEditModal(false);
              setEditForm({});
              setSelectedAdmin(null);
            }}
          >
            Cancel
          </Button>
          <Button variant="primary" onClick={handleUpdateAdmin} disabled={actionLoading}>
            {actionLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </Modal>

      {/* Details Modal */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedAdmin(null);
        }}
        title="Administrator Details"
        size="lg"
      >
        {selectedAdmin && (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Display Name
                </p>
                <p className="mt-1 text-sm text-slate-800 dark:text-slate-100">
                  {selectedAdmin.displayName || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Email
                </p>
                <p className="mt-1 break-all text-sm text-slate-800 dark:text-slate-100">
                  {selectedAdmin.email || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Role
                </p>
                <div className="mt-1">{getRoleBadge(selectedAdmin.role)}</div>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Status
                </p>
                <div className="mt-1">
                  {getStatusBadge(selectedAdmin.status || 'active')}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  User ID
                </p>
                <p className="mt-1 break-all text-xs text-slate-800 dark:text-slate-100">
                  {selectedAdmin.id}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Created
                </p>
                <p className="mt-1 text-sm text-slate-800 dark:text-slate-100">
                  {formatDate(selectedAdmin.createdAt)}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Last Login
                </p>
                <p className="mt-1 text-sm text-slate-800 dark:text-slate-100">
                  {formatDate(selectedAdmin.lastLogin)}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  2FA Enabled
                </p>
                <p className="mt-1 text-sm text-slate-800 dark:text-slate-100">
                  {selectedAdmin.twoFactorEnabled ? 'Yes' : 'No'}
                </p>
              </div>
            </div>
            {selectedAdmin.permissions?.length > 0 && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Permissions
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {selectedAdmin.permissions.map((perm) => (
                    <span
                      key={perm}
                      className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-200"
                    >
                      {perm}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        <div className="mt-6 flex justify-end">
          <Button variant="outline" onClick={() => setShowDetailsModal(false)}>
            Close
          </Button>
        </div>
      </Modal>

      {/* Suspend Modal */}
      <Modal
        isOpen={showSuspendModal}
        onClose={() => {
          setShowSuspendModal(false);
          setSuspendReason('');
          setSelectedAdmin(null);
        }}
        title="Suspend Administrator"
      >
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Are you sure you want to suspend{' '}
          <strong>{selectedAdmin?.displayName || selectedAdmin?.email}</strong>?
        </p>
        <div className="mt-4">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
            Reason for suspension *
          </label>
          <textarea
            value={suspendReason}
            onChange={(e) => setSuspendReason(e.target.value)}
            rows={3}
            placeholder="Provide a reason..."
            className="mt-1 w-full rounded-lg border border-slate-200 p-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 dark:border-slate-700 dark:bg-slate-800"
          />
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setShowSuspendModal(false);
              setSuspendReason('');
              setSelectedAdmin(null);
            }}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleSuspend}
            disabled={actionLoading || !suspendReason.trim()}
          >
            {actionLoading ? 'Suspending...' : 'Suspend Admin'}
          </Button>
        </div>
      </Modal>

      {/* Revoke Modal */}
      <Modal
        isOpen={showRevokeModal}
        onClose={() => {
          setShowRevokeModal(false);
          setRevokeReason('');
          setSelectedAdmin(null);
        }}
        title="Revoke Admin Access"
      >
        <div className="rounded-lg border border-orange-200 bg-orange-50 p-3 text-sm text-orange-700">
          This will remove all administrative privileges from this user. They will become a
          regular user.
        </div>
        <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">
          Are you sure you want to revoke admin access for{' '}
          <strong>{selectedAdmin?.displayName || selectedAdmin?.email}</strong>?
        </p>
        <div className="mt-4">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
            Reason *
          </label>
          <textarea
            value={revokeReason}
            onChange={(e) => setRevokeReason(e.target.value)}
            rows={3}
            placeholder="Provide a reason..."
            className="mt-1 w-full rounded-lg border border-slate-200 p-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 dark:border-slate-700 dark:bg-slate-800"
          />
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setShowRevokeModal(false);
              setRevokeReason('');
              setSelectedAdmin(null);
            }}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleRevokeAccess}
            disabled={actionLoading || !revokeReason.trim()}
          >
            {actionLoading ? 'Revoking...' : 'Revoke Access'}
          </Button>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setDeleteReason('');
          setSelectedAdmin(null);
        }}
        title="Delete Administrator"
      >
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <strong>Warning:</strong> This action cannot be undone. The admin account will be
          permanently removed.
        </div>
        <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">
          Are you sure you want to delete{' '}
          <strong>{selectedAdmin?.displayName || selectedAdmin?.email}</strong>?
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
              setSelectedAdmin(null);
            }}
          >
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete} disabled={actionLoading}>
            {actionLoading ? 'Deleting...' : 'Delete Admin'}
          </Button>
        </div>
      </Modal>
    </AdminPageShell>
  );
};

export default AdminManagement;