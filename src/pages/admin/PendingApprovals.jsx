import { useCallback, useEffect, useMemo, useState } from 'react';
import { FaArrowLeft, FaBuilding, FaBusinessTime, FaCheck, FaCheckCircle, FaClipboardCheck, FaClock, FaDownload, FaEnvelope, FaEye, FaFilter, FaPhone, FaSearch, FaSync, FaTimes, FaTimesCircle, FaTrash, FaUniversity, FaUser, FaUserGraduate, FaUserPlus, FaUsers } from "react-icons/fa";
import { collection, onSnapshot } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

import AdminPageShell from '../../components/admin/AdminPageShell';
import Button from '../../components/ui/Button';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import Modal from '../../components/ui/Modal';
import { db } from '../../config/firebase';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import adminService from '../../services/adminService';
import { isPendingUserStatus } from '../../utils/userStatus';

const userTypeIcons = {
  company: { icon: FaBuilding, color: 'bg-amber-100 text-amber-700' },
  institute: { icon: FaUniversity, color: 'bg-sky-100 text-sky-700' },
  entrepreneur: { icon: FaBusinessTime, color: 'bg-emerald-100 text-emerald-700' },
  youth: { icon: FaUser, color: 'bg-indigo-100 text-indigo-700' },
  student: { icon: FaUserGraduate, color: 'bg-slate-100 text-slate-700' },
  employer: { icon: FaUser, color: 'bg-slate-100 text-slate-700' },
  mentor: { icon: FaUser, color: 'bg-purple-100 text-purple-700' },
  parent: { icon: FaUser, color: 'bg-pink-100 text-pink-700' },
};

const PendingApprovals = () => {
  const navigate = useNavigate();
  const { currentUser, userProfile, isAdmin } = useAuth();
  const { addSuccessNotification, addErrorNotification } = useNotification();

  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [approveComments, setApproveComments] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [stats, setStats] = useState({
    total: 0,
    companies: 0,
    institutes: 0,
    entrepreneurs: 0,
    youth: 0,
    students: 0,
    employers: 0,
    mentors: 0,
  });

  const itemsPerPage = 20;

  const loadPendingUsers = useCallback(async () => {
    if (!isAdmin) return;
    setError('');
    setLoading(true);

    try {
      const response = await adminService.users.getAllUsers({}, 1, 10000);
      if (!response?.success) {
        throw new Error(response?.error || 'Failed to load users');
      }

      const result = response.data || response;
      const users = Array.isArray(result) ? result : result.users || result.items || [];
      const nextUsers = users.filter((user) => isPendingUserStatus(user.status));
      const countByType = (type) =>
        nextUsers.filter((user) => String(user.userType || '').toLowerCase() === type).length;

      setPendingUsers(nextUsers);
      setStats({
        total: nextUsers.length,
        companies: countByType('company'),
        institutes: countByType('institute'),
        entrepreneurs: countByType('entrepreneur'),
        youth: countByType('youth'),
        students: countByType('student'),
        employers: countByType('employer'),
        mentors: countByType('mentor'),
      });
    } catch (err) {
      console.error('Error loading pending users:', err);
      setError(err.message || 'Failed to load pending users');
      addErrorNotification('Error', 'Failed to load pending users');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [isAdmin, addErrorNotification]);

  useEffect(() => {
    loadPendingUsers();
  }, [loadPendingUsers]);

  useEffect(() => {
    if (!isAdmin) return undefined;
    let initialSnapshot = true;
    const unsubscribe = onSnapshot(
      collection(db, 'users'),
      () => {
        if (initialSnapshot) {
          initialSnapshot = false;
          return;
        }
        loadPendingUsers();
      },
      (snapshotError) => {
        initialSnapshot = false;
        console.error('Error subscribing to user updates:', snapshotError);
        setError(snapshotError.message || 'Live user updates are unavailable. Refresh to try again.');
        setLoading(false);
      },
    );
    return unsubscribe;
  }, [isAdmin, loadPendingUsers]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadPendingUsers();
  };

  const handleViewDetails = async (user) => {
    try {
      const response = await adminService.users.getUserDetails(user.id);
      setSelectedUser(response.success ? response.data : user);
      setShowDetailsModal(true);
    } catch (err) {
      console.error('Error loading user details:', err);
      setSelectedUser(user);
      setShowDetailsModal(true);
    }
  };

  const handleApprove = async () => {
    if (!selectedUser) return;
    setActionLoading(true);

    try {
      const response = await adminService.users.approveUser(
        selectedUser.id,
        approveComments || 'Approved',
        currentUser,
        userProfile
      );

      if (response.success) {
        addSuccessNotification('Success', 'User approved successfully');
        setShowApproveModal(false);
        setApproveComments('');
        setSelectedUser(null);
        await loadPendingUsers();
      } else {
        throw new Error(response.error || 'Approval failed');
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
        await loadPendingUsers();
      } else {
        throw new Error(response.error || 'Rejection failed');
      }
    } catch (err) {
      console.error('Error rejecting user:', err);
      addErrorNotification('Error', err.message || 'Failed to reject user');
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
        await loadPendingUsers();
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
    const reason = prompt('Enter rejection reason for all selected users:');
    if (!reason) return;
    setActionLoading(true);

    try {
      const response = await adminService.users.bulkRejectUsers(
        selectedIds,
        reason,
        currentUser,
        userProfile
      );

      if (response.success) {
        addSuccessNotification('Success', `${selectedIds.length} users rejected`);
        setSelectedIds([]);
        await loadPendingUsers();
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
    const visibleIds = visibleUsers.map((user) => user.id);
    const allVisibleSelected = visibleIds.length > 0 && visibleIds.every((id) => selectedIds.includes(id));
    setSelectedIds((current) =>
      allVisibleSelected
        ? current.filter((id) => !visibleIds.includes(id))
        : [...new Set([...current, ...visibleIds])],
    );
  };

  const handleSelectOne = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleExport = async (format = 'csv') => {
    try {
      const response = await adminService.users.exportPendingApprovals(
        { search, userType: typeFilter },
        format
      );

      if (response.success && response.data) {
        const blob = new Blob([response.data], {
          type: format === 'csv' ? 'text/csv' : 'application/json',
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `pending-approvals-${new Date().toISOString().slice(0, 10)}.${format}`;
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
      addErrorNotification('Error', 'Failed to export');
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

  const getUserIcon = (userType) => {
    const config = userTypeIcons[userType] || { icon: FaUser, color: 'bg-slate-100 text-slate-700' };
    const Icon = config.icon;
    return (
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-full ${config.color}`}
      >
        <Icon />
      </div>
    );
  };

  const getUserTypeBadge = (userType) => {
    const config = userTypeIcons[userType] || { color: 'bg-slate-100 text-slate-700' };
    return (
      <span
        className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${config.color}`}
      >
        {userType || 'Unknown'}
      </span>
    );
  };

  const filteredUsers = useMemo(() => {
    return pendingUsers.filter((user) => {
      const matchesSearch =
        !search ||
        user.displayName?.toLowerCase().includes(search.toLowerCase()) ||
        user.email?.toLowerCase().includes(search.toLowerCase()) ||
        user.phoneNumber?.includes(search);
      const matchesType = typeFilter === 'all' || user.userType === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [pendingUsers, search, typeFilter]);
  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / itemsPerPage));
  const visibleUsers = useMemo(
    () => filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage),
    [currentPage, filteredUsers],
  );

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  if (!isAdmin) {
    return (
      <AdminPageShell
        title="Pending Approvals"
        description="Access denied - Admin privileges required"
        icon={FaClipboardCheck}
      >
        <Card>
          <CardBody>
            <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-700">
              <FaTimesCircle className="mb-3 h-10 w-10" />
              <h2 className="text-xl font-semibold">Access Denied</h2>
              <p className="mt-1 text-sm">
                You must be an administrator to access this page.
              </p>
            </div>
          </CardBody>
        </Card>
      </AdminPageShell>
    );
  }

  return (
    <AdminPageShell
      title="Pending Approvals"
      description="Review and approve/reject user registrations awaiting verification"
      icon={FaClipboardCheck}
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
          <Button variant="outline" size="sm" onClick={() => navigate('/admin/dashboard')}>
            <FaArrowLeft className="mr-2" /> Dashboard
          </Button>
        </div>
      }
    >
      {/* Stats */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Total Pending', value: stats.total, color: 'text-brand-700', bg: 'bg-brand-100', icon: FaUsers },
          { label: 'Companies', value: stats.companies, color: 'text-amber-700', bg: 'bg-amber-100', icon: FaBuilding },
          { label: 'Institutes', value: stats.institutes, color: 'text-sky-700', bg: 'bg-sky-100', icon: FaUniversity },
          {
            label: 'Entrepreneurs/Youth',
            value: stats.entrepreneurs + stats.youth,
            color: 'text-emerald-700',
            bg: 'bg-emerald-100',
            icon: FaBusinessTime,
          },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {stat.label}
                  </p>
                  <p className={`mt-2 text-3xl font-bold ${stat.color}`}>{stat.value}</p>
                </div>
                <span
                  className={`flex h-10 w-10 items-center justify-center rounded-full ${stat.bg}`}
                >
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </span>
              </div>
            </div>
          );
        })}
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
                placeholder="Search by name, email, or phone..."
                className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-10 pr-4 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 dark:border-slate-700 dark:bg-slate-800"
              />
            </div>
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800"
            >
              <option value="all">All User Types</option>
              <option value="company">Companies</option>
              <option value="institute">Institutes</option>
              <option value="entrepreneur">Entrepreneurs</option>
              <option value="youth">Youth</option>
              <option value="student">Students</option>
              <option value="employer">Employers</option>
              <option value="mentor">Mentors</option>
              <option value="parent">Parents</option>
            </select>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearch('');
                  setTypeFilter('all');
                  setCurrentPage(1);
                }}
                className="w-full"
              >
                <FaFilter className="mr-2" /> Clear Filters
              </Button>
            </div>
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
                <FaCheck className="mr-1" /> Approve Selected
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleBulkReject}
                disabled={actionLoading}
              >
                <FaTimes className="mr-1" /> Reject Selected
              </Button>
              <Button variant="outline" size="sm" onClick={() => setSelectedIds([])}>
                <FaTrash className="mr-1" /> Clear
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

      {/* Users Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              Pending User Registrations
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
              <p className="mt-4 text-sm text-slate-500">Loading pending users...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <FaCheckCircle className="mb-3 h-12 w-12 text-emerald-400" />
              <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200">
                No pending approvals
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                All users have been reviewed. Great work!
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/admin/dashboard')}
                className="mt-4"
              >
                <FaArrowLeft className="mr-2" /> Back to Dashboard
              </Button>
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
                          visibleUsers.length > 0 &&
                          visibleUsers.every((user) => selectedIds.includes(user.id))
                        }
                        onChange={handleSelectAll}
                        className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      User
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Type
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Contact
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Registered
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {visibleUsers.map((user) => (
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
                          {getUserIcon(user.userType)}
                          <div>
                            <p className="font-medium text-slate-800 dark:text-slate-100">
                              {user.displayName || 'No Name'}
                            </p>
                            <p className="text-xs text-slate-500">
                              ID: {user.id?.substring(0, 8)}...
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">{getUserTypeBadge(user.userType)}</td>
                      <td className="px-4 py-3">
                        <div className="space-y-1">
                          <p className="flex items-center gap-1 text-xs text-slate-500">
                            <FaEnvelope className="h-3 w-3" />
                            {user.email}
                          </p>
                          {user.phoneNumber && (
                            <p className="flex items-center gap-1 text-xs text-slate-500">
                              <FaPhone className="h-3 w-3" />
                              {user.phoneNumber}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500">
                        {formatDate(user.createdAt)}
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
        open={showDetailsModal}
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
              <div className="scale-150">{getUserIcon(selectedUser.userType)}</div>
              <div>
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                  {selectedUser.displayName || 'No Name'}
                </h3>
                <div className="mt-1 flex gap-2">
                  {getUserTypeBadge(selectedUser.userType)}
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-amber-700">
                    <FaClock className="h-3 w-3" /> Pending Approval
                  </span>
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Email
                </p>
                <p className="mt-1 break-all text-sm text-slate-800 dark:text-slate-100">
                  {selectedUser.email}
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
                  Registered
                </p>
                <p className="mt-1 text-sm text-slate-800 dark:text-slate-100">
                  {formatDate(selectedUser.createdAt)}
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
            </div>

            {selectedUser.additionalData && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Additional Information
                </p>
                <pre className="mt-1 overflow-x-auto rounded-lg bg-slate-50 p-3 text-xs text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                  {JSON.stringify(selectedUser.additionalData, null, 2)}
                </pre>
              </div>
            )}

            <div className="rounded-lg border border-brand-200 bg-brand-50 p-3 text-sm text-brand-700 dark:border-brand-800 dark:bg-brand-950 dark:text-brand-200">
              <strong>Note:</strong> This user is awaiting approval to access the platform.
            </div>
          </div>
        )}
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" onClick={() => setShowDetailsModal(false)}>
            Close
          </Button>
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
        </div>
      </Modal>

      {/* Approve Modal */}
      <Modal
        open={showApproveModal}
        onClose={() => {
          setShowApproveModal(false);
          setApproveComments('');
          setSelectedUser(null);
        }}
        title="Approve User Registration"
      >
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Approve <strong>{selectedUser?.displayName || selectedUser?.email}</strong>?
        </p>
        <p className="mt-1 text-xs text-slate-500">
          Type: {selectedUser?.userType}
        </p>
        <div className="mt-4">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
            Comments (optional)
          </label>
          <textarea
            value={approveComments}
            onChange={(e) => setApproveComments(e.target.value)}
            rows={3}
            placeholder="These comments will be sent to the user..."
            className="mt-1 w-full rounded-lg border border-slate-200 p-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 dark:border-slate-700 dark:bg-slate-800"
          />
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setShowApproveModal(false);
              setApproveComments('');
              setSelectedUser(null);
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
        open={showRejectModal}
        onClose={() => {
          setShowRejectModal(false);
          setRejectReason('');
          setSelectedUser(null);
        }}
        title="Reject User Registration"
      >
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
          <strong>Warning:</strong> Rejecting will prevent access to the platform. The user will
          be notified with your reason.
        </div>
        <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">
          Reject <strong>{selectedUser?.displayName || selectedUser?.email}</strong>?
        </p>
        <div className="mt-4">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
            Reason for rejection *
          </label>
          <textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            rows={4}
            placeholder="Provide a clear reason..."
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
            onClick={handleReject}
            disabled={actionLoading || !rejectReason.trim()}
          >
            {actionLoading ? 'Rejecting...' : 'Reject User'}
          </Button>
        </div>
      </Modal>
    </AdminPageShell>
  );
};

export default PendingApprovals;