import { useCallback, useEffect, useState } from 'react';
import { FaBan, FaCheck, FaCheckCircle, FaDownload, FaEdit, FaExclamationTriangle, FaEye, FaFilter, FaLock, FaPlus, FaSearch, FaSort, FaSortDown, FaSortUp, FaSync, FaTimes, FaTrash, FaUnlock, FaUser, FaUsers, FaUserShield } from "react-icons/fa";
import { collection, onSnapshot } from 'firebase/firestore';

import AdminPageShell from '../../components/admin/AdminPageShell';
import Button from '../../components/ui/Button';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import Modal from '../../components/ui/Modal';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { db } from '../../config/firebase';
import adminService from '../../services/adminService';
import { isPendingUserStatus as isPendingStatus } from '../../utils/userStatus';

const PAGE_SIZE = 15;
const inputClass = 'h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100';
const selectClass = `${inputClass} pr-8`;
const typeMeta = { admin: ['Admin', 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-200'], company: ['Company', 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-200'], institute: ['Institute', 'bg-sky-100 text-sky-700 dark:bg-sky-950/40 dark:text-sky-200'], entrepreneur: ['Entrepreneur', 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-200'], youth: ['Youth', 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-200'], student: ['Student', 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200'], employer: ['Employer', 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200'], mentor: ['Mentor', 'bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-200'] };
const statusMeta = { active: ['Active', 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-200'], pending: ['Pending', 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-200'], pending_approval: ['Pending', 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-200'], awaiting_approval: ['Pending', 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-200'], suspended: ['Suspended', 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-200'], rejected: ['Rejected', 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-200'], deleted: ['Deleted', 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-300'] };
const emptyUser = { email: '', password: '', displayName: '', userType: 'student', phoneNumber: '', status: 'active', adminLevel: 'admin', adminScope: 'platform', confirmSuperAdmin: false, permissions: ['users.read', 'companies.read'], organizationName: '', organizationId: '' };
const generateStrongPassword = () => {
  const groups = ['ABCDEFGHJKLMNPQRSTUVWXYZ', 'abcdefghijkmnopqrstuvwxyz', '23456789', '!@#$%'];
  const chars = groups.join('');
  const values = new Uint32Array(24);
  crypto.getRandomValues(values);
  const required = groups.map((group) => group[values[0] % group.length]);
  const rest = Array.from(values, (value) => chars[value % chars.length]).join('');
  return `${required.join('')}${rest}`.slice(0, 24);
};

const formatDate = (value) => { if (!value) return 'Not available'; const date = value?.toDate ? value.toDate() : new Date(value); return Number.isNaN(date.getTime()) ? 'Not available' : date.toLocaleString(); };
const BadgePill = ({ children, className }) => <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${className}`}>{children}</span>;
const TypeBadge = ({ value }) => { const [label, className] = typeMeta[value] || [value || 'Unknown', 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200']; return <BadgePill className={className}>{label}</BadgePill>; };
const StatusBadge = ({ value }) => { const [label, className] = statusMeta[value] || [value || 'Unknown', 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200']; return <BadgePill className={className}>{label}</BadgePill>; };
const downloadJson = (name, data) => { const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json;charset=utf-8' }); const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = name; link.click(); URL.revokeObjectURL(url); };

const UserForm = ({ value, onChange, includeStatus = false, isSuperAdmin = false }) => {
  const set = (key, next) => onChange({ ...value, [key]: next });
  const adminSelected = value.userType === 'admin';
  const availableTypes = Object.keys(typeMeta).filter((type) => type !== 'admin' || isSuperAdmin || includeStatus);
  if (adminSelected && !isSuperAdmin && !includeStatus) {
    return <div role="alert" className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-100">Only a super administrator can grant administrator access. Choose another account type or ask a super administrator.</div>;
  }

  return (
    <div className="space-y-5">
      {adminSelected && !includeStatus && (
        <div className="rounded-2xl border border-indigo-300 bg-indigo-50 p-4 dark:border-indigo-800 dark:bg-indigo-950/40">
          <div className="flex items-start gap-3">
            <span className="rounded-xl bg-indigo-600 p-2.5 text-white"><FaUserShield /></span>
            <div>
              <h3 className="font-semibold text-indigo-950 dark:text-indigo-100">Administrator access</h3>
              <p className="mt-1 text-sm leading-5 text-indigo-900/80 dark:text-indigo-200">This grants elevated platform permissions. The person must already have a Career Connect account. Their password is never set or viewed here; access is granted by the secured admin service.</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Email address<input className={`${inputClass} mt-1`} type="email" autoComplete="email" required value={value.email || ''} onChange={(event) => set('email', event.target.value)} /></label>
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Display name<input className={`${inputClass} mt-1`} autoComplete="name" value={value.displayName || ''} onChange={(event) => set('displayName', event.target.value)} /></label>

        {!includeStatus && <>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Account type<select className={`${selectClass} mt-1`} value={value.userType || 'student'} onChange={(event) => set('userType', event.target.value)}>{availableTypes.map((type) => <option key={type} value={type}>{typeMeta[type][0]}</option>)}</select></label>
          {adminSelected ? (
            <>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Administrator scope<select className={`${selectClass} mt-1`} value={value.adminScope || 'platform'} onChange={(event) => { set('adminScope', event.target.value); set('adminLevel', event.target.value === 'super_platform' ? 'super_admin' : 'admin'); set('confirmSuperAdmin', false); }}><option value="platform">Platform administrator</option><option value="super_platform">Platform super-administrator</option><option value="company">Company administrator (scoped)</option><option value="institute">Institute administrator (scoped)</option></select></label>
              {['company', 'institute'].includes(value.adminScope) && (
                <div className="sm:col-span-2 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-100">
                  Scoped admin roles are not supported by the platform claims API yet. Grant this user as a platform administrator only, or use the organization/team management workflow.
                </div>
              )}
              {value.adminLevel === 'super_admin' && <div className="sm:col-span-2 rounded-xl border border-red-300 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950/30"><p className="text-sm font-semibold text-red-900 dark:text-red-200">This role has full platform authority, including managing administrator accounts.</p><label className="mt-3 flex items-start gap-2 text-sm text-red-900 dark:text-red-200"><input className="mt-1" type="checkbox" checked={Boolean(value.confirmSuperAdmin)} onChange={(event) => set('confirmSuperAdmin', event.target.checked)} /><span>I confirm this account should receive super-administrator access.</span></label></div>}
            </>
          ) : (
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Temporary password
              <div className="mt-1 flex gap-2">
                <input className={`${inputClass}`} type="text" autoComplete="new-password" minLength={6} required value={value.password || ''} onChange={(event) => set('password', event.target.value)} />
                <Button type="button" variant="outline" size="sm" onClick={() => set('password', generateStrongPassword())}>Generate</Button>
              </div>
              <span className="mt-1 block text-xs font-normal text-slate-500 dark:text-slate-400">Generated credentials are temporary. Share them securely and require a password change after sign-in.</span>
            </label>
          )}
          {!adminSelected && <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Phone number<input className={`${inputClass} mt-1`} type="tel" autoComplete="tel" value={value.phoneNumber || ''} onChange={(event) => set('phoneNumber', event.target.value)} /></label>}
        </>}

        {includeStatus && <>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Account type<input className={`${inputClass} mt-1`} value={typeMeta[value.userType]?.[0] || value.userType || 'Unknown'} disabled /></label>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Account status<select className={`${selectClass} mt-1`} value={value.status || 'active'} onChange={(event) => set('status', event.target.value)}>{Object.keys(statusMeta).map((status) => <option key={status} value={status}>{statusMeta[status][0]}</option>)}</select></label>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Phone number<input className={`${inputClass} mt-1`} type="tel" value={value.phoneNumber || ''} onChange={(event) => set('phoneNumber', event.target.value)} /></label>
        </>}
      </div>
    </div>
  );
};

const UserManagement = () => {
  const { currentUser, userProfile, isAdmin } = useAuth();
  const { addSuccessNotification, addErrorNotification } = useNotification();
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [users, setUsers] = useState([]); const [stats, setStats] = useState({ total: 0, active: 0, pending: 0, suspended: 0, rejected: 0 }); const [loading, setLoading] = useState(true); const [refreshing, setRefreshing] = useState(false); const [actionLoading, setActionLoading] = useState(false); const [error, setError] = useState('');
  const [search, setSearch] = useState(''); const [statusFilter, setStatusFilter] = useState('all'); const [typeFilter, setTypeFilter] = useState('all'); const [activeTab, setActiveTab] = useState('all'); const [sortField, setSortField] = useState('createdAt'); const [sortDirection, setSortDirection] = useState('desc'); const [page, setPage] = useState(1); const [totalPages, setTotalPages] = useState(1); const [selectedIds, setSelectedIds] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null); const [showDetails, setShowDetails] = useState(false); const [showEdit, setShowEdit] = useState(false); const [showCreate, setShowCreate] = useState(false); const [showSuspend, setShowSuspend] = useState(false); const [showDelete, setShowDelete] = useState(false); const [showReject, setShowReject] = useState(false); const [editUser, setEditUser] = useState({}); const [newUser, setNewUser] = useState(emptyUser); const [rejectReason, setRejectReason] = useState(''); const [suspendReason, setSuspendReason] = useState(''); const [deleteReason, setDeleteReason] = useState('');

  useEffect(() => {
    let active = true;
    currentUser?.getIdTokenResult?.().then(({ claims }) => {
      if (active) setIsSuperAdmin(claims?.role === 'super_admin' || claims?.superAdmin === true || claims?.isSuperAdmin === true);
    }).catch(() => { if (active) setIsSuperAdmin(false); });
    return () => { active = false; };
  }, [currentUser]);

  const loadUsers = useCallback(async (silent = false) => {
    if (!isAdmin) return; if (!silent) setLoading(true); setError('');
    try {
      const filterStatus = activeTab !== 'all' ? activeTab : statusFilter;
      const response = await adminService.users.getAllUsers({ search, status: filterStatus, userType: typeFilter }, page, PAGE_SIZE); if (!response?.success) throw new Error(response?.error || 'Failed to load users');
      const result = response.data || response; const rows = result.users || [];
      rows.sort((a, b) => { const left = new Date(a[sortField] || 0).getTime(); const right = new Date(b[sortField] || 0).getTime(); return (left - right) * (sortDirection === 'asc' ? 1 : -1); }); setUsers(rows); setTotalPages(result.totalPages || 1);
      const allResponse = await adminService.users.getAllUsers({}, 1, 10000); const allUsers = (allResponse?.data || allResponse)?.users || [];
      setStats({ total: allUsers.length, active: allUsers.filter((user) => user.status === 'active').length, pending: allUsers.filter((user) => isPendingStatus(user.status)).length, suspended: allUsers.filter((user) => user.status === 'suspended').length, rejected: allUsers.filter((user) => user.status === 'rejected').length });
    } catch (err) { setError(err.message || 'Failed to load users'); addErrorNotification('Error', err.message || 'Failed to load users'); } finally { setLoading(false); setRefreshing(false); }
  }, [activeTab, addErrorNotification, isAdmin, page, search, sortDirection, sortField, statusFilter, typeFilter]);
  useEffect(() => { loadUsers(); }, [loadUsers]);

  useEffect(() => {
    if (!isAdmin) return undefined;
    let initialSnapshot = true;
    const unsubscribe = onSnapshot(
      collection(db, 'users'),
      () => {
        // The initial load is handled by loadUsers; later snapshots keep the table current
        // when an account is registered, approved, rejected, or otherwise updated elsewhere.
        if (initialSnapshot) {
          initialSnapshot = false;
          return;
        }
        loadUsers(true);
      },
      (snapshotError) => {
        initialSnapshot = false;
        setError(snapshotError.message || 'Live user updates are unavailable. Refresh to try again.');
        setLoading(false);
      },
    );
    return unsubscribe;
  }, [isAdmin, loadUsers]);

  const runAction = async (operation, successMessage) => { setActionLoading(true); try { const response = await operation(); if (response?.success === false) throw new Error(response.error || 'Action failed'); addSuccessNotification('Success', successMessage); setError(''); await loadUsers(true); return true; } catch (err) { setError(err.message || 'Action failed'); addErrorNotification('Error', err.message || 'Action failed'); return false; } finally { setActionLoading(false); } };
  const handleSort = (field) => { setSortDirection(sortField === field && sortDirection === 'asc' ? 'desc' : 'asc'); setSortField(field); };
  const sortIcon = (field) => sortField !== field ? <FaSort className="text-slate-400" /> : sortDirection === 'asc' ? <FaSortUp /> : <FaSortDown />;
  const toggleSelected = (id) => setSelectedIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  const allVisibleSelected = users.length > 0 && users.every((user) => selectedIds.includes(user.id)); const toggleAll = () => setSelectedIds(allVisibleSelected ? [] : users.map((user) => user.id));
  const exportUsers = (format) => { if (format === 'json') downloadJson(`users-${new Date().toISOString().slice(0, 10)}.json`, users); else { const headers = ['Name', 'Email', 'Type', 'Status', 'Phone', 'ID', 'Created', 'Updated']; const rows = users.map((user) => [user.displayName || '', user.email || '', user.userType || '', user.status || '', user.phoneNumber || '', user.id, formatDate(user.createdAt), formatDate(user.updatedAt)]); const csv = [headers, ...rows].map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n'); const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' }); const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = `users-${new Date().toISOString().slice(0, 10)}.csv`; link.click(); URL.revokeObjectURL(url); } addSuccessNotification('Export complete', `${users.length} users exported as ${format.toUpperCase()}`); };
  const viewDetails = async (user) => { try { const response = await adminService.users.getUserDetails(user.id); setSelectedUser(response?.success === false ? user : response?.data || response || user); } catch { setSelectedUser(user); } setShowDetails(true); };
  const handleReject = async () => { if ((!selectedUser && !selectedIds.length) || !rejectReason.trim()) return; const ids = selectedIds.length ? [...selectedIds] : [selectedUser.id]; const operation = ids.length > 1 ? () => adminService.users.bulkRejectUsers(ids, rejectReason, currentUser, userProfile) : () => adminService.users.rejectUser(ids[0], rejectReason, currentUser, userProfile); if (await runAction(operation, `${ids.length} user${ids.length === 1 ? '' : 's'} rejected successfully`)) { setShowReject(false); setRejectReason(''); setSelectedUser(null); setSelectedIds([]); } };
  const handleBulk = async (action) => { if (!selectedIds.length) return addErrorNotification('Selection required', 'Select at least one user first'); const ids = [...selectedIds]; if (action === 'reject') { setSelectedUser({ id: ids[0] }); setShowReject(true); return; } if (action === 'approve') { if (await runAction(() => adminService.users.bulkApproveUsers(ids, 'Bulk approval', currentUser, userProfile), `${ids.length} users approved`)) setSelectedIds([]); return; } const method = action === 'suspend' ? 'suspendUser' : 'deleteUser'; const results = await Promise.all(ids.map((id) => runAction(() => adminService.users[method](id, action === 'suspend' ? 'Bulk suspension' : 'Bulk deletion', currentUser, userProfile), `User ${action}d successfully`))); if (results.every(Boolean)) setSelectedIds([]); };
  const handleCreateUser = async () => {
    const adminAccount = newUser.userType === 'admin';
    if (adminAccount && !isSuperAdmin) {
      addErrorNotification('Restricted action', 'Only a super administrator can grant admin access.');
      return;
    }
    if (adminAccount && newUser.adminLevel === 'super_admin' && !newUser.confirmSuperAdmin) {
      addErrorNotification('Confirmation required', 'Confirm that this account should receive full super-administrator access.');
      return;
    }
    if (adminAccount && ['company', 'institute'].includes(newUser.adminScope)) {
      addErrorNotification('Scoped admin unsupported', 'Scoped administrator roles are not yet supported by the platform claims API.');
      return;
    }
    const operation = adminAccount
      ? () => adminService.admins.createAdmin(newUser, currentUser, userProfile)
      : () => adminService.users.createUser(newUser, currentUser, userProfile);
    const successMessage = adminAccount
      ? 'Administrator access granted. Ask the user to sign out and back in.'
      : 'User account created successfully';
    if (await runAction(operation, successMessage)) {
      setShowCreate(false);
      setNewUser(emptyUser);
    }
  };
  const closeCreateDialog = () => {
    if (actionLoading) return;
    setShowCreate(false);
    setNewUser(emptyUser);
  };
  const actions = <div className="flex flex-wrap items-center justify-end gap-2"><Button variant="outline" size="sm" onClick={() => exportUsers('csv')} leadingIcon={FaDownload}>Export CSV</Button><Button variant="outline" size="sm" onClick={() => exportUsers('json')} leadingIcon={FaDownload}>Export JSON</Button><Button variant="outline" size="sm" loading={refreshing} onClick={() => { setRefreshing(true); loadUsers(true); }} leadingIcon={FaSync}>Refresh users</Button><Button size="md" className="min-h-11 px-5 font-semibold shadow-md shadow-brand-600/20" onClick={() => { setNewUser(emptyUser); setShowCreate(true); }} leadingIcon={FaPlus}>Add user</Button></div>;

  if (!isAdmin) return <AdminPageShell title="User Management" description="Manage all users in the system" icon={FaUsers}><Card><CardBody><div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-800 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-200"><h2 className="font-semibold">Access denied</h2><p className="mt-1 text-sm">You must be an administrator to access user management.</p></div></CardBody></Card></AdminPageShell>;
  return <AdminPageShell title="User Management" description="Manage all users in the system" icon={FaUsers} actions={actions}>
    {error && <div role="alert" className="mb-4 flex items-start justify-between gap-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-200"><span>{error}</span><button type="button" onClick={() => setError('')} aria-label="Dismiss error"><FaTimes /></button></div>}
    <div className="mb-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">{[['Total', stats.total, FaUsers], ['Active', stats.active, FaCheckCircle], ['Pending', stats.pending, FaExclamationTriangle], ['Suspended', stats.suspended, FaBan], ['Rejected', stats.rejected, FaTimes]].map(([label, value, Icon]) => <Card key={label}><CardBody><div className="flex items-center justify-between"><div><p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</p><p className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">{value}</p></div><Icon className="h-6 w-6 text-brand-600 dark:text-brand-300" /></div></CardBody></Card>)}</div>
    <Card className="mb-5"><CardBody><div className="grid gap-3 md:grid-cols-[1fr_auto_auto_auto]"><label className="relative"><span className="sr-only">Search users</span><FaSearch className="absolute left-3 top-3 text-slate-400" /><input className={`${inputClass} pl-9`} value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Search by name, email, phone, or type" /></label><select className={selectClass} value={typeFilter} onChange={(event) => { setTypeFilter(event.target.value); setPage(1); }}><option value="all">All types</option>{Object.keys(typeMeta).map((type) => <option key={type} value={type}>{typeMeta[type][0]}</option>)}</select><select className={selectClass} value={statusFilter} disabled={activeTab !== 'all'} onChange={(event) => { setStatusFilter(event.target.value); setPage(1); }}><option value="all">All statuses</option>{Object.keys(statusMeta).map((status) => <option key={status} value={status}>{statusMeta[status][0]}</option>)}</select><Button variant="outline" onClick={() => { setSearch(''); setTypeFilter('all'); setStatusFilter('all'); setActiveTab('all'); setPage(1); }} leadingIcon={FaFilter}>Clear</Button></div></CardBody></Card>
    <Card className="mb-5"><CardBody className="p-2 sm:p-3"><div className="flex flex-wrap gap-2">{['all', 'active', 'pending', 'suspended', 'rejected'].map((tab) => <button type="button" key={tab} onClick={() => { setActiveTab(tab); setPage(1); }} className={`rounded-lg px-3 py-2 text-sm font-medium capitalize ${activeTab === tab ? 'bg-brand-600 text-white' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'}`}>{tab}</button>)}</div></CardBody></Card>
    {selectedIds.length > 0 && <div className="mb-4 flex flex-wrap items-center gap-2 rounded-xl border border-brand-200 bg-brand-50 p-3 dark:border-brand-900/60 dark:bg-brand-950/30"><span className="mr-auto text-sm font-semibold text-brand-800 dark:text-brand-200">{selectedIds.length} selected</span><Button size="sm" variant="success" onClick={() => handleBulk('approve')} leadingIcon={FaCheck}>Approve</Button><Button size="sm" variant="danger" onClick={() => handleBulk('reject')} leadingIcon={FaTimes}>Reject</Button><Button size="sm" variant="warning" onClick={() => handleBulk('suspend')} leadingIcon={FaLock}>Suspend</Button><Button size="sm" variant="outline" onClick={() => handleBulk('delete')} leadingIcon={FaTrash}>Delete</Button><Button size="sm" variant="ghost" onClick={() => setSelectedIds([])}>Clear</Button></div>}
    <Card>
      <CardHeader>
        <div><h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">User accounts</h2><p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Use the labeled actions on each row to manage an account.</p></div>
        <span className="text-sm text-slate-500 dark:text-slate-400">Page {page} of {totalPages}</span>
      </CardHeader>
      <CardBody className="p-0">
        {loading ? <div className="flex min-h-64 flex-col items-center justify-center gap-3"><div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600 dark:border-brand-950 dark:border-t-brand-300" /><p className="text-sm text-slate-500 dark:text-slate-400">Loading users...</p></div>
          : users.length === 0 ? <div className="flex min-h-64 flex-col items-center justify-center p-6 text-center"><FaUsers className="h-10 w-10 text-slate-300 dark:text-slate-600" /><h3 className="mt-4 font-semibold text-slate-900 dark:text-slate-100">No users found</h3><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Try changing the search or filters.</p></div>
            : <div className="overflow-x-auto"><table className="min-w-[1180px] divide-y divide-slate-200 dark:divide-slate-700"><thead className="bg-slate-50 dark:bg-slate-950"><tr><th className="w-12 px-4 py-3 text-left"><input type="checkbox" checked={allVisibleSelected} onChange={toggleAll} aria-label="Select all visible users" /></th>{[['User', 'displayName'], ['Type', 'userType'], ['Status', 'status'], ['Registered', 'createdAt']].map(([label, field]) => <th key={field} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"><button type="button" className="inline-flex items-center gap-2" onClick={() => handleSort(field)}>{label}{sortIcon(field)}</button></th>)}<th className="min-w-[390px] px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Actions</th></tr></thead>
              <tbody className="divide-y divide-slate-200 bg-white dark:divide-slate-700 dark:bg-slate-900">{users.map((user) => <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/60"><td className="px-4 py-4"><input type="checkbox" checked={selectedIds.includes(user.id)} onChange={() => toggleSelected(user.id)} aria-label={`Select ${user.displayName || user.email}`} /></td><td className="px-4 py-4"><div className="flex items-center gap-3"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-200"><FaUser /></div><div className="min-w-0"><p className="font-medium text-slate-900 dark:text-slate-100">{user.displayName || 'Unnamed user'}</p><p className="text-xs text-slate-500 dark:text-slate-400">{user.email || 'No email'}</p></div></div></td><td className="px-4 py-4"><TypeBadge value={user.userType} /></td><td className="px-4 py-4"><StatusBadge value={user.status} /></td><td className="px-4 py-4 text-sm text-slate-600 dark:text-slate-300">{formatDate(user.createdAt)}</td>
                <td className="px-4 py-4"><div className="flex flex-wrap justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={() => viewDetails(user)} aria-label={`View ${user.displayName || user.email}`} title="View account details" leadingIcon={FaEye}>View</Button>
                  <Button variant="outline" size="sm" onClick={() => { setEditUser({ ...user }); setShowEdit(true); }} aria-label={`Edit ${user.displayName || user.email}`} title="Edit account profile" leadingIcon={FaEdit}>Edit</Button>
                  {isPendingStatus(user.status) && <Button variant="success" size="sm" onClick={() => runAction(() => adminService.users.approveUser(user.id, 'Manual approval', currentUser, userProfile), 'User approved successfully')} aria-label={`Approve ${user.displayName || user.email}`} leadingIcon={FaCheck}>Approve</Button>}
                  {user.status === 'active' && <Button variant="warning" size="sm" onClick={() => { setSelectedUser(user); setShowSuspend(true); }} aria-label={`Suspend ${user.displayName || user.email}`} leadingIcon={FaLock}>Suspend</Button>}
                  {user.status === 'suspended' && <Button variant="success" size="sm" onClick={() => runAction(() => adminService.users.activateUser(user.id, currentUser, userProfile), 'User activated successfully')} aria-label={`Activate ${user.displayName || user.email}`} leadingIcon={FaUnlock}>Activate</Button>}
                  <Button variant="danger" size="sm" onClick={() => { setSelectedUser(user); setShowDelete(true); }} aria-label={`Delete ${user.displayName || user.email}`} title="Disable account and mark it deleted" leadingIcon={FaTrash}>Delete</Button>
                </div></td></tr>)}</tbody>
              </table></div>}
      </CardBody>
      {totalPages > 1 && <div className="flex items-center justify-between border-t border-slate-200 px-5 py-4 dark:border-slate-700"><Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((value) => Math.max(1, value - 1))}>Previous</Button><span className="text-sm text-slate-500 dark:text-slate-400">Page {page} of {totalPages}</span><Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage((value) => Math.min(totalPages, value + 1))}>Next</Button></div>}
    </Card>
    <Modal open={showDetails} onClose={() => setShowDetails(false)} title="User details" size="lg"><div className="grid gap-4 sm:grid-cols-2">{[['Name', selectedUser?.displayName || 'Not available'], ['Email', selectedUser?.email || 'Not available'], ['Phone', selectedUser?.phoneNumber || 'Not available'], ['Type', selectedUser?.userType || 'Not available'], ['Status', selectedUser?.status || 'Not available'], ['ID', selectedUser?.id || 'Not available'], ['Verification', selectedUser?.emailVerified ? 'Verified' : 'Not verified'], ['Created', formatDate(selectedUser?.createdAt)], ['Updated', formatDate(selectedUser?.updatedAt)]].map(([label, value]) => <div key={label} className="rounded-lg border border-slate-200 p-3 dark:border-slate-700"><dt className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</dt><dd className="mt-1 break-words text-sm text-slate-900 dark:text-slate-100">{value}</dd></div>)}</div></Modal>
    <Modal open={showReject} onClose={() => setShowReject(false)} title="Reject user"><p className="text-sm text-slate-600 dark:text-slate-300">Provide a reason for rejecting {selectedUser?.displayName || selectedUser?.email || 'this user'}.</p><textarea className={`${inputClass} mt-4 h-28 py-2`} value={rejectReason} onChange={(event) => setRejectReason(event.target.value)} placeholder="Rejection reason" /><div className="mt-5 flex justify-end gap-2"><Button variant="outline" onClick={() => setShowReject(false)}>Cancel</Button><Button variant="danger" loading={actionLoading} disabled={!rejectReason.trim()} onClick={handleReject}>Reject user</Button></div></Modal>
    <Modal open={showSuspend} onClose={() => setShowSuspend(false)} title="Suspend user"><textarea className={`${inputClass} h-28 py-2`} value={suspendReason} onChange={(event) => setSuspendReason(event.target.value)} placeholder="Reason for suspension" /><div className="mt-5 flex justify-end gap-2"><Button variant="outline" onClick={() => setShowSuspend(false)}>Cancel</Button><Button variant="warning" loading={actionLoading} disabled={!suspendReason.trim()} onClick={async () => { if (await runAction(() => adminService.users.suspendUser(selectedUser.id, suspendReason, currentUser, userProfile), 'User suspended successfully')) { setShowSuspend(false); setSuspendReason(''); } }}>Suspend user</Button></div></Modal>
    <Modal open={showDelete} onClose={() => setShowDelete(false)} title="Delete user"><p className="text-sm text-slate-600 dark:text-slate-300">This marks the user as deleted and disables the account.</p><textarea className={`${inputClass} mt-4 h-24 py-2`} value={deleteReason} onChange={(event) => setDeleteReason(event.target.value)} placeholder="Optional reason" /><div className="mt-5 flex justify-end gap-2"><Button variant="outline" onClick={() => setShowDelete(false)}>Cancel</Button><Button variant="danger" loading={actionLoading} onClick={async () => { if (await runAction(() => adminService.users.deleteUser(selectedUser.id, deleteReason, currentUser, userProfile), 'User deleted successfully')) { setShowDelete(false); setDeleteReason(''); } }}>Delete user</Button></div></Modal>
    <Modal open={showCreate} onClose={closeCreateDialog} title={newUser.userType === 'admin' ? 'Grant administrator access' : 'Create user account'} size="lg">
      <div className="space-y-5">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/60"><h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{newUser.userType === 'admin' ? 'Platform administrator' : 'New account'}</h3><p className="mt-1 text-sm leading-5 text-slate-600 dark:text-slate-300">{newUser.userType === 'admin' ? 'Use this form only to grant admin access to an existing Career Connect account. The backend verifies your super-admin token and updates Firebase claims.' : 'Create a standard account with a temporary password. The account details are sent to the authenticated admin API.'}</p></div>
        <UserForm value={newUser} onChange={setNewUser} isSuperAdmin={isSuperAdmin} />
        <div className="flex flex-wrap justify-end gap-2 border-t border-slate-200 pt-4 dark:border-slate-700"><Button variant="outline" disabled={actionLoading} onClick={closeCreateDialog}>Cancel</Button><Button loading={actionLoading} disabled={!newUser.email || (newUser.userType === 'admin' ? !isSuperAdmin || ['company', 'institute'].includes(newUser.adminScope) || (newUser.adminLevel === 'super_admin' && !newUser.confirmSuperAdmin) : (newUser.password || '').length < 6)} onClick={handleCreateUser} leadingIcon={newUser.userType === 'admin' ? FaUserShield : FaPlus}>{newUser.userType === 'admin' ? 'Grant admin access' : 'Create user'}</Button></div>
      </div>
    </Modal>
    <Modal open={showEdit} onClose={() => setShowEdit(false)} title="Edit user"><UserForm value={editUser} onChange={setEditUser} includeStatus /><div className="mt-5 flex justify-end gap-2"><Button variant="outline" onClick={() => setShowEdit(false)}>Cancel</Button><Button loading={actionLoading} onClick={async () => { if (await runAction(() => adminService.users.updateUser(editUser.id, editUser, currentUser, userProfile), 'User updated successfully')) setShowEdit(false); }}>Save changes</Button></div></Modal>
  </AdminPageShell>;
};

export default UserManagement;
