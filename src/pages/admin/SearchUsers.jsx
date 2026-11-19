import { useCallback, useEffect, useMemo, useState } from 'react';
import { FaBan, FaCheckCircle, FaClock, FaDownload, FaEdit, FaEnvelope, FaEye, FaFilter, FaHistory, FaLock, FaPhone, FaSearch, FaSync, FaTimes, FaTimesCircle, FaTrash, FaUnlock, FaUser, FaUserCheck, FaUserPlus, FaUsers } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';

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
  suspended: { label: 'Suspended', color: 'bg-red-100 text-red-700', icon: FaBan },
  rejected: { label: 'Rejected', color: 'bg-slate-100 text-slate-700', icon: FaTimesCircle },
  deleted: { label: 'Deleted', color: 'bg-slate-100 text-slate-700', icon: FaTrash },
};

const userTypeConfig = {
  admin: { label: 'Admin', color: 'bg-red-100 text-red-700' },
  company: { label: 'Company', color: 'bg-amber-100 text-amber-700' },
  institute: { label: 'Institute', color: 'bg-sky-100 text-sky-700' },
  entrepreneur: { label: 'Entrepreneur', color: 'bg-emerald-100 text-emerald-700' },
  youth: { label: 'Youth', color: 'bg-indigo-100 text-indigo-700' },
  student: { label: 'Student', color: 'bg-slate-100 text-slate-700' },
  employer: { label: 'Employer', color: 'bg-slate-100 text-slate-700' },
  mentor: { label: 'Mentor', color: 'bg-purple-100 text-purple-700' },
  parent: { label: 'Parent', color: 'bg-pink-100 text-pink-700' },
};

const SearchUsers = () => {
  const navigate = useNavigate();
  const { currentUser, userProfile, isAdmin } = useAuth();
  const { addSuccessNotification, addErrorNotification } = useNotification();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [showActivateModal, setShowActivateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [suspendReason, setSuspendReason] = useState('');
  const [deleteReason, setDeleteReason] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [approveComments, setApproveComments] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [editForm, setEditForm] = useState({});
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    displayName: '',
    userType: 'student',
    phoneNumber: '',
    status: 'active',
  });
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    pending: 0,
    suspended: 0,
    rejected: 0,
  });
  const [recentActivity, setRecentActivity] = useState([]);

  const itemsPerPage = 15;

  const loadUsers = useCallback(async () => {
    if (!isAdmin) return;
    setError('');
    setLoading(true);

    try {
      const response = await adminService.users.getAllUsers(
        { search, status: statusFilter, userType: typeFilter },
        currentPage,
        itemsPerPage
      );

      if (response.success) {
        setUsers(response.data.users || []);
        setTotalPages(response.data.totalPages || 1);
        setStats(
          response.data.stats || {
            total: 0,
            active: 0,
            pending: 0,
            suspended: 0,
            rejected: 0,
          }
        );
        setRecentActivity(response.data.recentActivity || []);
      } else {
        setError(response.error || 'Failed to load users');
      }
    } catch (err) {
      console.error('Error loading users:', err);
      setError(err.message || 'Failed to load users');
      addErrorNotification('Error', 'Failed to load users');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [isAdmin, search, statusFilter, typeFilter, currentPage, addErrorNotification]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadUsers();
  };

  const handleViewDetails = async (user) => {
    try {
      const details = await adminService.users.getUserDetails(user.id);
      setSelectedUser(details.success ? details.data : user);
      setShowDetailsModal(true);
    } catch (err) {
      console.error('Error loading user details:', err);
      setSelectedUser(user);
      setShowDetailsModal(true);
    }
  };

  const handleEdit = (user) => {
    setEditForm({ ...user });
    setSelectedUser(user);
    setShowEditModal(true);
  };

  const handleUpdateUser = async () => {
    setActionLoading(true);
    try {
      const response = await adminService.users.updateUser(
        editForm.id,
        editForm,
        currentUser,
        userProfile
      );

      if (response.success) {
        addSuccessNotification('Success', 'User updated successfully');
        setShowEditModal(false);
        setEditForm({});
        setSelectedUser(null);
        await loadUsers();
      } else {
        throw new Error(response.error || 'Failed to update user');
      }
    } catch (err) {
      console.error('Error updating user:', err);
      addErrorNotification('Error', err.message || 'Failed to update user');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateUser = async () => {
    if (!newUser.email || !newUser.password) {
      addErrorNotification('Validation', 'Email and password are required');
      return;
    }
    setActionLoading(true);

    try {
      const response = await adminService.users.createUser(newUser, currentUser, userProfile);

      if (response.success) {
        addSuccessNotification('Success', 'User created successfully');
        setShowCreateModal(false);
        setNewUser({
          email: '',
          password: '',
          displayName: '',
          userType: 'student',
          phoneNumber: '',
          status: 'active',
        });
        await loadUsers();
      } else {
        throw new Error(response.error || 'Failed to create user');
      }
    } catch (err) {
      console.error('Error creating user:', err);
      addErrorNotification('Error', err.message || 'Failed to create user');
    } finally {
      setActionLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedUser) return;
    setActionLoading(true);

    try {
      const response = await adminService.users.approveUser(
        selectedUser.id,
        approveComments,
        currentUser,
        userProfile
      );

      if (response.success) {
        addSuccessNotification('Success', 'User approved successfully');
        setShowApproveModal(false);
        setApproveComments('');
        setSelectedUser(null);
        await loadUsers();
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

  const handleReject = async () => {
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
        await loadUsers();
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

  const handleSuspend = async () => {
    if (!selectedUser || !suspendReason.trim()) return;
    setActionLoading(true);

    try {
      const response = await adminService.users.suspendUser(
        selectedUser.id,
        suspendReason,
        currentUser,
        userProfile
      );

      if (response.success) {
        addSuccessNotification('Success', 'User suspended successfully');
        setShowSuspendModal(false);
        setSuspendReason('');
        setSelectedUser(null);
        await loadUsers();
      } else {
        throw new Error(response.error || 'Failed to suspend user');
      }
    } catch (err) {
      console.error('Error suspending user:', err);
      addErrorNotification('Error', err.message || 'Failed to suspend user');
    } finally {
      setActionLoading(false);
    }
  };

  const handleActivate = async (userId) => {
    setActionLoading(true);
    try {
      const response = await adminService.users.activateUser(userId, currentUser, userProfile);

      if (response.success) {
        addSuccessNotification('Success', 'User activated successfully');
        await loadUsers();
      } else {
        throw new Error(response.error || 'Failed to activate user');
      }
    } catch (err) {
      console.error('Error activating user:', err);
      addErrorNotification('Error', err.message || 'Failed to activate user');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedUser) return;
    setActionLoading(true);

    try {
      const response = await adminService.users.deleteUser(
        selectedUser.id,
        deleteReason,
        currentUser,
        userProfile
      );

      if (response.success) {
        addSuccessNotification('Success', 'User deleted successfully');
        setShowDeleteModal(false);
        setDeleteReason('');
        setSelectedUser(null);
        await loadUsers();
      } else {
        throw new Error(response.error || 'Failed to delete user');
      }
    } catch (err) {
      console.error('Error deleting user:', err);
      addErrorNotification('Error', err.message || 'Failed to delete user');
    } finally {
      setActionLoading(false);
    }
  };

  const handleBulkApprove = async () => {
    if (selectedIds.length === 0) return;
    setActionLoading(true);

    try {
      const response = await adminService.users.bulkApproveUsers(
        selectedIds,
        'Bulk approval',
        currentUser,
        userProfile
      );

      if (response.success) {
        addSuccessNotification('Success', `${selectedIds.length} users approved`);
        setSelectedIds([]);
        await loadUsers();
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

  const handleBulkSuspend = async () => {
    if (selectedIds.length === 0) return;
    const reason = prompt('Enter suspension reason for all selected users:');
    if (!reason) return;
    setActionLoading(true);

    try {
      const response = await adminService.users.bulkSuspendUsers(
        selectedIds,
        reason,
        currentUser,
        userProfile
      );

      if (response.success) {
        addSuccessNotification('Success', `${selectedIds.length} users suspended`);
        setSelectedIds([]);
        await loadUsers();
      } else {
        throw new Error(response.error || 'Bulk suspension failed');
      }
    } catch (err) {
      console.error('Error bulk suspending:', err);
      addErrorNotification('Error', err.message || 'Bulk suspension failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (
      !window.confirm(
        `Are you sure you want to delete ${selectedIds.length} users? This cannot be undone.`
      )
    )
      return;
    setActionLoading(true);

    try {
      const response = await adminService.users.bulkDeleteUsers(
        selectedIds,
        'Bulk deletion',
        currentUser,
        userProfile
      );

      if (response.success) {
        addSuccessNotification('Success', `${selectedIds.length} users deleted`);
        setSelectedIds([]);
        await loadUsers();
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
    if (selectedIds.length === users.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(users.map((u) => u.id));
    }
  };

  const handleSelectOne = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleExport = async (format = 'csv') => {
    try {
      const response = await adminService.users.exportUsers(
        { search, status: statusFilter, userType: typeFilter },
        format
      );

      if (response.success && response.data) {
        const blob = new Blob([response.data], {
          type: format === 'csv' ? 'text/csv' : 'application/json',
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `users-${new Date().toISOString().slice(0, 10)}.${format}`;
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
      addErrorNotification('Error', 'Failed to export users');
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

  const getUserTypeBadge = (type) => {
    const config = userTypeConfig[type] || {
      label: type || 'Unknown',
      color: 'bg-slate-100 text-slate-700',
    };
    return (
      <span
        className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${config.color}`}
      >
        {config.label}
      </span>
    );
  };

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        !search ||
        user.displayName?.toLowerCase().includes(search.toLowerCase()) ||
        user.email?.toLowerCase().includes(search.toLowerCase()) ||
        user.phoneNumber?.includes(search) ||
        user.userType?.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
      const matchesType = typeFilter === 'all' || user.userType === typeFilter;
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [users, search, statusFilter, typeFilter]);

  if (!isAdmin) {
    return (
      <AdminPageShell
        title="Search Users"
        description="Access denied - Admin privileges required"
        icon={FaUsers}
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
      title="Search Users"
      description="Search, manage, and administer all user accounts"
      icon={FaUsers}
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
          <Button variant="primary" size="sm" onClick={() => setShowCreateModal(true)}>
            <FaUserPlus className="mr-2" /> Add User
          </Button>
        </div>
      }
    >
      {/* Stats Cards */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {[
          { label: 'Total Users', value: stats.total, color: 'text-slate-700', bg: 'bg-slate-100' },
          {
            label: 'Active',
            value: stats.active,
            color: 'text-emerald-700',
            bg: 'bg-emerald-100',
          },
          {
            label: 'Pending',
            value: stats.pending,
            color: 'text-amber-700',
            bg: 'bg-amber-100',
          },
          {
            label: 'Suspended',
            value: stats.suspended,
            color: 'text-red-700',
            bg: 'bg-red-100',
          },
          {
            label: 'Rejected',
            value: stats.rejected,
            color: 'text-slate-700',
            bg: 'bg-slate-100',
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
                <FaUsers className={`h-5 w-5 ${stat.color}`} />
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Search and Filters */}
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
                placeholder="Search by name, email, phone, or role..."
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
              <option value="suspended">Suspended</option>
              <option value="rejected">Rejected</option>
            </select>
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="company">Company</option>
              <option value="institute">Institute</option>
              <option value="entrepreneur">Entrepreneur</option>
              <option value="youth">Youth</option>
              <option value="student">Student</option>
              <option value="employer">Employer</option>
              <option value="mentor">Mentor</option>
              <option value="parent">Parent</option>
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
              <Button variant="danger" size="sm" onClick={handleBulkSuspend} disabled={actionLoading}>
                <FaBan className="mr-1" /> Suspend
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

      {/* Users Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              User Directory
            </h2>
            <span className="text-sm text-slate-500">
              {filteredUsers.length} user(s)
            </span>
          </div>
        </CardHeader>
        <CardBody className="p-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600" />
              <p className="mt-4 text-sm text-slate-500">Loading users...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <FaUsers className="mb-3 h-12 w-12 text-slate-300" />
              <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200">
                No users found
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
                    <th className="px-4 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={
                          selectedIds.length === filteredUsers.length &&
                          filteredUsers.length > 0
                        }
                        onChange={handleSelectAll}
                        className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      User
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Role
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Contact
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {filteredUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    >
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(user.id)}
                          onChange={() => handleSelectOne(user.id)}
                          className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-brand-700">
                            {user.photoURL ? (
                              <img
                                src={user.photoURL}
                                alt={user.displayName}
                                className="h-10 w-10 rounded-full object-cover"
                              />
                            ) : (
                              <FaUser />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-slate-800 dark:text-slate-100">
                              {user.displayName || 'No Name'}
                            </p>
                            <p className="text-xs text-slate-500">ID: {user.id?.slice(0, 8)}...</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">{getUserTypeBadge(user.userType)}</td>
                      <td className="px-4 py-3">{getStatusBadge(user.status)}</td>
                      <td className="px-4 py-3">
                        <div className="space-y-1">
                          <p className="flex items-center gap-1 text-xs text-slate-500">
                            <FaEnvelope className="h-3 w-3" />
                            {user.email || 'No email'}
                          </p>
                          {user.phoneNumber && (
                            <p className="flex items-center gap-1 text-xs text-slate-500">
                              <FaPhone className="h-3 w-3" />
                              {user.phoneNumber}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleViewDetails(user)}
                            className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-600 dark:border-slate-700"
                            title="View Details"
                          >
                            <FaEye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(user)}
                            className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:border-sky-300 hover:bg-sky-50 hover:text-sky-600 dark:border-slate-700"
                            title="Edit"
                          >
                            <FaEdit className="h-4 w-4" />
                          </button>
                          {user.status === 'pending' && (
                            <>
                              <button
                                onClick={() => {
                                  setSelectedUser(user);
                                  setShowApproveModal(true);
                                }}
                                className="rounded-lg border border-emerald-200 p-2 text-emerald-600 transition hover:bg-emerald-50"
                                title="Approve"
                              >
                                <FaCheckCircle className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedUser(user);
                                  setShowRejectModal(true);
                                }}
                                className="rounded-lg border border-red-200 p-2 text-red-600 transition hover:bg-red-50"
                                title="Reject"
                              >
                                <FaTimesCircle className="h-4 w-4" />
                              </button>
                            </>
                          )}
                          {user.status === 'active' && (
                            <button
                              onClick={() => {
                                setSelectedUser(user);
                                setShowSuspendModal(true);
                              }}
                              className="rounded-lg border border-amber-200 p-2 text-amber-600 transition hover:bg-amber-50"
                              title="Suspend"
                            >
                              <FaLock className="h-4 w-4" />
                            </button>
                          )}
                          {user.status === 'suspended' && (
                            <button
                              onClick={() => handleActivate(user.id)}
                              className="rounded-lg border border-emerald-200 p-2 text-emerald-600 transition hover:bg-emerald-50"
                              title="Activate"
                            >
                              <FaUnlock className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setSelectedUser(user);
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
          setSelectedUser(null);
        }}
        title="User Details"
        size="lg"
      >
        {selectedUser && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-100 text-brand-700">
                {selectedUser.photoURL ? (
                  <img
                    src={selectedUser.photoURL}
                    alt={selectedUser.displayName}
                    className="h-16 w-16 rounded-full object-cover"
                  />
                ) : (
                  <FaUser className="h-8 w-8" />
                )}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                  {selectedUser.displayName || 'No Name'}
                </h3>
                <div className="mt-1 flex gap-2">
                  {getUserTypeBadge(selectedUser.userType)}
                  {getStatusBadge(selectedUser.status)}
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Email
                </p>
                <p className="mt-1 text-sm text-slate-800 dark:text-slate-100">
                  {selectedUser.email || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Phone
                </p>
                <p className="mt-1 text-sm text-slate-800 dark:text-slate-100">
                  {selectedUser.phoneNumber || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  User ID
                </p>
                <p className="mt-1 break-all text-xs text-slate-800 dark:text-slate-100">
                  {selectedUser.id}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Email Verified
                </p>
                <p className="mt-1 text-sm text-slate-800 dark:text-slate-100">
                  {selectedUser.emailVerified ? 'Yes' : 'No'}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Created
                </p>
                <p className="mt-1 text-sm text-slate-800 dark:text-slate-100">
                  {formatDate(selectedUser.createdAt)}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Last Updated
                </p>
                <p className="mt-1 text-sm text-slate-800 dark:text-slate-100">
                  {formatDate(selectedUser.updatedAt)}
                </p>
              </div>
            </div>
          </div>
        )}
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" onClick={() => setShowDetailsModal(false)}>
            Close
          </Button>
          {selectedUser?.status === 'pending' && (
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

      {/* Create User Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setNewUser({
            email: '',
            password: '',
            displayName: '',
            userType: 'student',
            phoneNumber: '',
            status: 'active',
          });
        }}
        title="Create New User"
      >
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
              Email Address *
            </label>
            <input
              type="email"
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              placeholder="user@example.com"
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 dark:border-slate-700 dark:bg-slate-800"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
              Password *
            </label>
            <input
              type="password"
              value={newUser.password}
              onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
              placeholder="Minimum 6 characters"
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 dark:border-slate-700 dark:bg-slate-800"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
              Display Name
            </label>
            <input
              type="text"
              value={newUser.displayName}
              onChange={(e) => setNewUser({ ...newUser, displayName: e.target.value })}
              placeholder="User's name"
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 dark:border-slate-700 dark:bg-slate-800"
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                User Type
              </label>
              <select
                value={newUser.userType}
                onChange={(e) => setNewUser({ ...newUser, userType: e.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800"
              >
                <option value="student">Student</option>
                <option value="admin">Admin</option>
                <option value="company">Company</option>
                <option value="institute">Institute</option>
                <option value="entrepreneur">Entrepreneur</option>
                <option value="youth">Youth</option>
                <option value="employer">Employer</option>
                <option value="mentor">Mentor</option>
                <option value="parent">Parent</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                Status
              </label>
              <select
                value={newUser.status}
                onChange={(e) => setNewUser({ ...newUser, status: e.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800"
              >
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
              Phone Number
            </label>
            <input
              type="tel"
              value={newUser.phoneNumber}
              onChange={(e) => setNewUser({ ...newUser, phoneNumber: e.target.value })}
              placeholder="+266 1234 5678"
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 dark:border-slate-700 dark:bg-slate-800"
            />
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setShowCreateModal(false);
              setNewUser({
                email: '',
                password: '',
                displayName: '',
                userType: 'student',
                phoneNumber: '',
                status: 'active',
              });
            }}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleCreateUser}
            disabled={actionLoading || !newUser.email || !newUser.password}
          >
            {actionLoading ? 'Creating...' : 'Create User'}
          </Button>
        </div>
      </Modal>

      {/* Edit User Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditForm({});
        }}
        title="Edit User"
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
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                User Type
              </label>
              <select
                value={editForm.userType || 'student'}
                onChange={(e) => setEditForm({ ...editForm, userType: e.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800"
              >
                <option value="student">Student</option>
                <option value="admin">Admin</option>
                <option value="company">Company</option>
                <option value="institute">Institute</option>
                <option value="entrepreneur">Entrepreneur</option>
                <option value="youth">Youth</option>
                <option value="employer">Employer</option>
                <option value="mentor">Mentor</option>
                <option value="parent">Parent</option>
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
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
              Phone Number
            </label>
            <input
              type="tel"
              value={editForm.phoneNumber || ''}
              onChange={(e) => setEditForm({ ...editForm, phoneNumber: e.target.value })}
              placeholder="+266 1234 5678"
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 dark:border-slate-700 dark:bg-slate-800"
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
            <input
              type="checkbox"
              checked={editForm.emailVerified || false}
              onChange={(e) => setEditForm({ ...editForm, emailVerified: e.target.checked })}
              className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
            />
            Email Verified
          </label>
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
          <Button variant="primary" onClick={handleUpdateUser} disabled={actionLoading}>
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
        title="Approve User"
      >
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Are you sure you want to approve{' '}
          <strong>{selectedUser?.displayName || selectedUser?.email}</strong>?
        </p>
        <div className="mt-4">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
            Comments (optional)
          </label>
          <textarea
            value={approveComments}
            onChange={(e) => setApproveComments(e.target.value)}
            rows={3}
            placeholder="Add any comments for the user..."
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
            }}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleReject}
            disabled={actionLoading || !rejectReason.trim()}
          >
            {actionLoading ? 'Rejecting...' : 'Reject User'}
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
        title="Suspend User"
      >
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Are you sure you want to suspend{' '}
          <strong>{selectedUser?.displayName || selectedUser?.email}</strong>?
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
            {actionLoading ? 'Suspending...' : 'Suspend User'}
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
        title="Delete User"
      >
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <strong>Warning:</strong> This action cannot be undone. The user account will be
          permanently removed.
        </div>
        <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">
          Are you sure you want to delete{' '}
          <strong>{selectedUser?.displayName || selectedUser?.email}</strong>?
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
            {actionLoading ? 'Deleting...' : 'Delete User'}
          </Button>
        </div>
      </Modal>
    </AdminPageShell>
  );
};

export default SearchUsers;