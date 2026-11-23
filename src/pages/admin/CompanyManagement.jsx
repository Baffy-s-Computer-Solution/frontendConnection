/* eslint-disable react-hooks/exhaustive-deps */
/**
 * CompanyManagement.jsx
 * ------------------------------------------------------------------
 * Production-ready Company Management for Career Connect Lesotho.
 * Pure Tailwind CSS implementation — no Bootstrap.
 * ------------------------------------------------------------------
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { FaBan, FaBuilding, FaCheck, FaCheckCircle, FaDownload, FaEdit, FaEnvelope, FaExclamationTriangle, FaEye, FaFilter, FaGlobe, FaIndustry, FaMapMarkerAlt, FaPlus, FaRedo, FaSearch, FaSync, FaTimes, FaTrashAlt, FaUserShield } from "react-icons/fa";
import { toast } from 'react-toastify';

import AdminPageShell from '../../components/admin/AdminPageShell';
import { useAuth } from '../../context/AuthContext';
import adminService from '../../services/adminService';
import supabaseMediaService from '../../services/supabaseMediaService';
import firebaseService from '../../services/firebaseHelpers';

/* ------------------------------------------------------------------ */
/* Helpers / constants                                                */
/* ------------------------------------------------------------------ */

const PAGE_SIZE = 15;

const STATUS_META = {
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: FaExclamationTriangle },
  awaiting_approval: { label: 'Awaiting Approval', color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: FaExclamationTriangle },
  approved: { label: 'Approved', color: 'bg-green-100 text-green-800 border-green-200', icon: FaCheckCircle },
  active: { label: 'Active', color: 'bg-green-100 text-green-800 border-green-200', icon: FaCheckCircle },
  suspended: { label: 'Suspended', color: 'bg-gray-200 text-gray-800 border-gray-300', icon: FaBan },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-800 border-red-200', icon: FaBan },
  inactive: { label: 'Inactive', color: 'bg-gray-100 text-gray-600 border-gray-200', icon: FaTimes },
};

const COMPANY_SIZES = ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'];
const INDUSTRIES = [
  'Technology', 'Finance', 'Healthcare', 'Education', 'Agriculture',
  'Manufacturing', 'Retail', 'Construction', 'Mining', 'Tourism',
  'Government', 'NGO', 'Other',
];

const emptyForm = {
  companyName: '', email: '', phoneNumber: '', website: '', industry: '',
  companySize: '', location: '', address: '', description: '', about: '',
  registrationNumber: '', taxNumber: '', contactPersonName: '', contactPersonRole: '',
  contactPersonEmail: '', contactPersonPhone: '', logoUrl: '', logoPublicId: '',
  documents: [], status: 'pending', verified: false, featured: false, reviewNotes: '',
};

const formatDate = (value) => {
  if (!value) return '—';
  try {
    return new Date(value).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
    });
  } catch {
    return '—';
  }
};

const formatValue = (value) => {
  if (value === null || value === undefined || value === '') return '—';
  if (typeof value === 'object') {
    return Object.entries(value)
      .filter(([, item]) => item !== null && item !== undefined && item !== '')
      .map(([key, item]) => `${key}: ${item}`)
      .join(', ');
  }
  return String(value);
};

/* ------------------------------------------------------------------ */
/* Reusable Tailwind UI primitives                                    */
/* ------------------------------------------------------------------ */

const Button = ({ variant = 'primary', size = 'md', className = '', children, ...props }) => {
  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-100',
    success: 'bg-green-600 hover:bg-green-700 text-white',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
    warning: 'bg-yellow-500 hover:bg-yellow-600 text-white',
    dark: 'bg-gray-800 hover:bg-gray-900 text-white',
    outlinePrimary: 'border border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40',
    outlineSecondary: 'border border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800',
    outlineSuccess: 'border border-green-600 text-green-600 hover:bg-green-50 dark:hover:bg-green-950/40',
    outlineDanger: 'border border-red-600 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40',
    outlineWarning: 'border border-yellow-500 text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-950/40',
    outlineInfo: 'border border-cyan-600 text-cyan-600 hover:bg-cyan-50 dark:hover:bg-cyan-950/40',
  };
  const sizes = { sm: 'px-2 py-1 text-xs', md: 'px-3 py-2 text-sm', lg: 'px-4 py-2.5 text-base' };
  return (
    <button
      className={`inline-flex items-center justify-center rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

const Card = ({ className = '', children }) => (
  <div className={`bg-white rounded-lg shadow-sm border border-gray-200 dark:bg-gray-900 dark:border-gray-700 ${className}`}>{children}</div>
);

const Modal = ({ show, onHide, size = 'md', children }) => {
  if (!show) return null;
  const sizes = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-3xl', xl: 'max-w-5xl' };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onHide} />
      <div className={`relative bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full ${sizes[size]} max-h-[90vh] overflow-y-auto`}>
        {children}
      </div>
    </div>
  );
};

const ModalHeader = ({ children, onClose }) => (
  <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-700">
    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">{children}</h3>
    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xl leading-none">&times;</button>
  </div>
);

const ModalBody = ({ children }) => <div className="px-5 py-4">{children}</div>;

const ModalFooter = ({ children }) => (
  <div className="flex flex-wrap justify-end gap-2 px-5 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-b-lg">
    {children}
  </div>
);

const Alert = ({ variant = 'info', children, className = '' }) => {
  const variants = {
    info: 'bg-cyan-50 border-cyan-200 text-cyan-800 dark:bg-cyan-950/40 dark:border-cyan-800 dark:text-cyan-200',
    danger: 'bg-red-50 border-red-200 text-red-800 dark:bg-red-950/40 dark:border-red-800 dark:text-red-200',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-950/40 dark:border-yellow-800 dark:text-yellow-200',
    success: 'bg-green-50 border-green-200 text-green-800 dark:bg-green-950/40 dark:border-green-800 dark:text-green-200',
  };
  return <div className={`border rounded-md px-4 py-3 text-sm ${variants[variant]} ${className}`}>{children}</div>;
};

const Badge = ({ color = 'bg-gray-100 text-gray-800', children, className = '' }) => (
  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${color} ${className}`}>
    {children}
  </span>
);

const Spinner = () => (
  <div className="inline-block w-5 h-5 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
);

const Input = ({ className = '', ...props }) => (
  <input
    className={`w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:border-gray-600 dark:bg-gray-950 dark:text-gray-100 ${className}`}
    {...props}
  />
);

const Select = ({ className = '', children, ...props }) => (
  <select
    className={`w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 dark:border-gray-600 dark:bg-gray-950 dark:text-gray-100 ${className}`}
    {...props}
  >
    {children}
  </select>
);

const Textarea = ({ className = '', ...props }) => (
  <textarea
    className={`w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-950 dark:text-gray-100 ${className}`}
    {...props}
  />
);

const Label = ({ children, className = '', ...props }) => (
  <label className={`block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 ${className}`} {...props}>{children}</label>
);

const Checkbox = ({ checked, onChange, className = '' }) => (
  <input
    type="checkbox"
    checked={checked}
    onChange={onChange}
    className={`w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 ${className}`}
  />
);

const Switch = ({ checked, onChange, label }) => (
  <label className="flex items-center gap-2 cursor-pointer">
    <div className={`relative w-10 h-5 rounded-full transition-colors ${checked ? 'bg-blue-600' : 'bg-gray-300'}`}>
      <input type="checkbox" checked={checked} onChange={onChange} className="sr-only" />
      <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${checked ? 'translate-x-5' : ''}`} />
    </div>
    {label && <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>}
  </label>
);

const ProgressBar = ({ now }) => (
  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
    <div className="bg-blue-600 h-2 rounded-full transition-all" style={{ width: `${now}%` }} />
  </div>
);

const Tooltip = ({ label, children }) => (
  <span className="relative group inline-flex">
    {children}
    <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition-opacity z-10">
      {label}
    </span>
  </span>
);

const Pagination = ({ page, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;
  const pages = [];
  if (totalPages <= 5) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else if (page <= 3) {
    pages.push(1, 2, 3, 4, 5);
  } else if (page >= totalPages - 2) {
    for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(page - 2, page - 1, page, page + 1, page + 2);
  }
  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => onPageChange(Math.max(1, page - 1))}
        disabled={page === 1}
        className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 hover:bg-gray-50"
      >
        Prev
      </button>
      {pages.map((n) => (
        <button
          key={n}
          onClick={() => onPageChange(n)}
          className={`px-3 py-1 text-sm border rounded-md ${n === page ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 hover:bg-gray-50'}`}
        >
          {n}
        </button>
      ))}
      <button
        onClick={() => onPageChange(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
        className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 hover:bg-gray-50"
      >
        Next
      </button>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Component                                                          */
/* ------------------------------------------------------------------ */

const CompanyManagement = () => {
  const { currentUser, userProfile, isAdmin } = useAuth();

  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [industryFilter, setIndustryFilter] = useState('all');
  const [verifiedFilter, setVerifiedFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('all');

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedIds, setSelectedIds] = useState([]);

  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCompanyAdminInviteModal, setShowCompanyAdminInviteModal] = useState(false);

  const [selectedCompany, setSelectedCompany] = useState(null);
  const [companyAdminEmail, setCompanyAdminEmail] = useState('');
  const [editForm, setEditForm] = useState(emptyForm);
  const [createForm, setCreateForm] = useState(emptyForm);
  const [reviewNotes, setReviewNotes] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [suspendReason, setSuspendReason] = useState('');
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [logoProgress, setLogoProgress] = useState(0);
  const [uploadingDocs, setUploadingDocs] = useState(false);
  const [docProgress, setDocProgress] = useState(0);

  const isSuperAdmin = useMemo(() => {
    const email = String(currentUser?.email || '').toLowerCase();
    const ownerEmail = String(import.meta.env.VITE_SUPER_ADMIN_EMAIL || '').toLowerCase();
    return (
      userProfile?.adminLevel === 'super_admin' ||
      userProfile?.role === 'super_admin' ||
      (ownerEmail && ownerEmail === email)
    );
  }, [currentUser?.email, userProfile?.adminLevel, userProfile?.role]);

  /* ------------------ Data loading ------------------ */

  const loadCompanies = useCallback(
    async (showSpinner = true) => {
      if (showSpinner) setLoading(true);
      setError('');
      try {
        let response;
        if (adminService.companies?.getAllCompanies) {
          response = await adminService.companies.getAllCompanies(
            {
              search,
              status: activeTab !== 'all' ? activeTab : statusFilter,
              industry: industryFilter,
              verified: verifiedFilter,
            },
            page,
            PAGE_SIZE
          );
        } else if (adminService.getCollectionPaginated) {
          response = await adminService.getCollectionPaginated(
            'companies',
            page,
            PAGE_SIZE,
            [['status', '==', activeTab !== 'all' ? activeTab : statusFilter]].filter(([, v]) => v && v !== 'all')
          );
        } else {
          response = { success: true, data: { companies: [], totalPages: 1 } };
        }

        if (response?.success) {
          setCompanies(response.data?.companies || response.data?.items || []);
          setTotalPages(response.data?.totalPages || 1);
        } else {
          setError(response?.error || 'Failed to load companies');
        }
      } catch (err) {
        console.error('[CompanyManagement] load error:', err);
        setError(err?.message || 'Failed to load companies');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [activeTab, industryFilter, page, search, statusFilter, verifiedFilter]
  );

  useEffect(() => {
    if (!isAdmin) return;
    loadCompanies();
  }, [isAdmin, loadCompanies]);

  /* ------------------ Summary ------------------ */

  const summary = useMemo(() => {
    const base = { total: companies.length, verified: 0, featured: 0 };
    Object.keys(STATUS_META).forEach((k) => (base[k] = 0));
    companies.forEach((c) => {
      base[c.status || 'pending'] = (base[c.status || 'pending'] || 0) + 1;
      if (c.verified) base.verified += 1;
      if (c.featured) base.featured += 1;
    });
    return base;
  }, [companies]);

  /* ------------------ Helpers ------------------ */

  const resetFilters = () => {
    setSearch('');
    setStatusFilter('all');
    setIndustryFilter('all');
    setVerifiedFilter('all');
    setActiveTab('all');
    setPage(1);
    setSelectedIds([]);
  };

  const handleSelectAll = () => {
    if (selectedIds.length === companies.length) setSelectedIds([]);
    else setSelectedIds(companies.map((c) => c.id));
  };

  const handleSelectOne = (id) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const exportCsv = () => {
    const headers = ['Company', 'Email', 'Phone', 'Industry', 'Size', 'Location', 'Status', 'Verified', 'Created'];
    const rows = companies.map((c) => [
      c.companyName || c.name || '', c.email || '', c.phoneNumber || '', c.industry || '',
      c.companySize || '', c.location || c.address || '', c.status || '',
      c.verified ? 'Yes' : 'No', formatDate(c.createdAt),
    ]);
    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `companies-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Companies exported');
  };

  /* -------------------------------------------------------------- */
  /* Core status update — fixes the "approve company" bug            */
  /* -------------------------------------------------------------- */
  const updateCompanyStatus = async (companyId, status, notes = '') => {
    const payload = {
      status,
      verified: status === 'approved' || status === 'active',
      reviewNotes: notes,
      reviewedAt: new Date().toISOString(),
      reviewedBy: currentUser?.uid,
      reviewedByEmail: currentUser?.email,
      updatedAt: new Date().toISOString(),
    };

    if (status === 'approved' && adminService.companies?.approveCompany) {
      try {
        const res = await adminService.companies.approveCompany(companyId, currentUser, userProfile);
        if (res?.success !== false) return { success: true };
      } catch (err) {
        console.warn('[CompanyManagement] approveCompany helper failed', err?.message);
      }
    }

    if (adminService.companies?.updateCompanyStatus) {
      try {
        const res = await adminService.companies.updateCompanyStatus(companyId, status, notes, currentUser, userProfile);
        if (res?.success !== false) return { success: true };
      } catch (err) {
        console.warn('[CompanyManagement] updateCompanyStatus failed', err?.message);
      }
    }

    if (adminService.updateDocument) {
      try {
        const res = await adminService.updateDocument('companies', companyId, payload, currentUser, userProfile);
        if (res?.success !== false) return { success: true };
      } catch (err) {
        console.warn('[CompanyManagement] updateDocument failed', err?.message);
      }
    }

    try {
      if (typeof firebaseService?.updateDocument === 'function') {
        await firebaseService.updateDocument('companies', companyId, payload);
        return { success: true };
      }
    } catch (err) {
      console.error('[CompanyManagement] Firestore fallback failed:', err);
      throw err;
    }

    throw new Error('All status update strategies failed');
  };

  /* ------------------ CRUD ------------------ */

  const handleCreate = async () => {
    if (!createForm.companyName || !createForm.email) {
      toast.error('Company name and email are required');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...createForm,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: currentUser?.uid,
      };
      let res;
      if (adminService.companies?.createCompany) {
        res = await adminService.companies.createCompany(payload, currentUser, userProfile);
      } else if (adminService.createDocument) {
        res = await adminService.createDocument('companies', payload, currentUser, userProfile);
      } else if (firebaseService?.addDocument) {
        res = await firebaseService.addDocument('companies', payload);
      }
      if (res?.success === false) throw new Error(res.error);

      toast.success('Company created successfully');
      setShowCreateModal(false);
      setCreateForm(emptyForm);
      await loadCompanies(false);
    } catch (err) {
      console.error('[CompanyManagement] create error:', err);
      toast.error(err?.message || 'Failed to create company');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async () => {
    if (!editForm.id) return;
    setSaving(true);
    try {
      const payload = { ...editForm, updatedAt: new Date().toISOString(), updatedBy: currentUser?.uid };
      let res;
      if (adminService.companies?.updateCompany) {
        res = await adminService.companies.updateCompany(editForm.id, payload, currentUser, userProfile);
      } else if (adminService.updateDocument) {
        res = await adminService.updateDocument('companies', editForm.id, payload, currentUser, userProfile);
      } else if (firebaseService?.updateDocument) {
        res = await firebaseService.updateDocument('companies', editForm.id, payload);
      }
      if (res?.success === false) throw new Error(res.error);

      toast.success('Company updated');
      setShowEditModal(false);
      await loadCompanies(false);
    } catch (err) {
      console.error('[CompanyManagement] update error:', err);
      toast.error(err?.message || 'Failed to update company');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedCompany) return;
    setSaving(true);
    try {
      let res;
      if (adminService.companies?.deleteCompany) {
        res = await adminService.companies.deleteCompany(selectedCompany.id, currentUser, userProfile);
      } else if (adminService.deleteDocument) {
        res = await adminService.deleteDocument('companies', selectedCompany.id, currentUser, userProfile);
      } else if (firebaseService?.deleteDocument) {
        res = await firebaseService.deleteDocument('companies', selectedCompany.id);
      }
      if (res?.success === false) throw new Error(res.error);

      toast.success('Company deleted');
      setShowDeleteModal(false);
      setSelectedCompany(null);
      await loadCompanies(false);
    } catch (err) {
      console.error('[CompanyManagement] delete error:', err);
      toast.error(err?.message || 'Failed to delete company');
    } finally {
      setSaving(false);
    }
  };

  /* ------------------ Status actions ------------------ */

  const handleApprove = async () => {
    if (!selectedCompany) return;
    setSaving(true);
    try {
      await updateCompanyStatus(selectedCompany.id, 'approved', reviewNotes || 'Approved by admin');
      toast.success('Company approved');
      setShowApproveModal(false);
      setShowDetailsModal(false);
      await loadCompanies(false);
    } catch (err) {
      console.error('[CompanyManagement] approve error:', err);
      toast.error(err?.message || 'Failed to approve company');
    } finally {
      setSaving(false);
    }
  };

  const handleReject = async () => {
    if (!selectedCompany) return;
    if (!rejectReason.trim()) {
      toast.error('Rejection reason is required');
      return;
    }
    setSaving(true);
    try {
      await updateCompanyStatus(selectedCompany.id, 'rejected', rejectReason);
      toast.success('Company rejected');
      setShowRejectModal(false);
      setShowDetailsModal(false);
      setRejectReason('');
      await loadCompanies(false);
    } catch (err) {
      console.error('[CompanyManagement] reject error:', err);
      toast.error(err?.message || 'Failed to reject company');
    } finally {
      setSaving(false);
    }
  };

  const handleSuspend = async () => {
    if (!selectedCompany) return;
    if (!suspendReason.trim()) {
      toast.error('Suspension reason is required');
      return;
    }
    setSaving(true);
    try {
      await updateCompanyStatus(selectedCompany.id, 'suspended', suspendReason);
      toast.success('Company suspended');
      setShowSuspendModal(false);
      setShowDetailsModal(false);
      setSuspendReason('');
      await loadCompanies(false);
    } catch (err) {
      console.error('[CompanyManagement] suspend error:', err);
      toast.error(err?.message || 'Failed to suspend company');
    } finally {
      setSaving(false);
    }
  };

  const handleRestore = async (company) => {
    setSaving(true);
    try {
      await updateCompanyStatus(company.id, 'approved', 'Restored to active status');
      toast.success('Company restored');
      await loadCompanies(false);
    } catch (err) {
      console.error('[CompanyManagement] restore error:', err);
      toast.error(err?.message || 'Failed to restore company');
    } finally {
      setSaving(false);
    }
  };

  const handleCompanyAdminAssignment = async (company, email) => {
    const hasPendingInvitation = Boolean(company.companyAdminInviteId && !company.companyAdminUid);
    if ((company.companyAdminUid || hasPendingInvitation) && !window.confirm(
      hasPendingInvitation
        ? `Revoke the pending company administrator invitation for ${company.companyAdminEmail || 'this company'}?`
        : `Revoke company administrator access for ${company.companyAdminEmail || company.companyAdminUid}?`
    )) {
      return;
    }

    setSaving(true);
    try {
      const result = company.companyAdminUid || hasPendingInvitation
        ? await adminService.companies.revokeCompanyAdmin(company.id)
        : await adminService.companies.assignCompanyAdmin(company.id, email);

      if (!result.success) throw new Error(result.error || 'Company administrator access could not be updated.');

      toast.success(company.companyAdminUid || hasPendingInvitation
        ? 'Company administrator access or invitation revoked'
        : 'Company administrator invitation sent');
      setShowCompanyAdminInviteModal(false);
      setCompanyAdminEmail('');
      await loadCompanies(false);
    } catch (err) {
      console.error('[CompanyManagement] company admin assignment failed:', err);
      toast.error(err?.message || 'Company administrator access could not be updated');
    } finally {
      setSaving(false);
    }
  };

  const handleResendCompanyAdminInvitation = async (company) => {
    setSaving(true);
    try {
      const result = await adminService.companies.resendCompanyAdminInvitation(company.id);
      if (!result.success) throw new Error(result.error || 'Company administrator invitation could not be resent.');
      toast.success('A new company administrator invitation was sent');
      await loadCompanies(false);
    } catch (err) {
      toast.error(err?.message || 'Company administrator invitation could not be resent');
    } finally {
      setSaving(false);
    }
  };

  const openCompanyAdminInvitation = (company) => {
    setSelectedCompany(company);
    setCompanyAdminEmail(company.companyAdminEmail || '');
    setShowCompanyAdminInviteModal(true);
  };

  /* ------------------ Bulk actions ------------------ */

  const handleBulkStatus = async (status, note) => {
    if (!selectedIds.length) return;
    setSaving(true);
    let success = 0;
    try {
      for (const id of selectedIds) {
        try {
          // eslint-disable-next-line no-await-in-loop
          await updateCompanyStatus(id, status, note);
          success += 1;
        } catch (err) {
          console.warn(`[CompanyManagement] bulk ${status} failed for ${id}:`, err?.message);
        }
      }
      toast.success(`${success}/${selectedIds.length} companies updated`);
      setSelectedIds([]);
      await loadCompanies(false);
    } finally {
      setSaving(false);
    }
  };

  /* ------------------ supabase uploads ------------------ */

  const handleLogoUpload = async (event, forCreate = false) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingLogo(true);
    setLogoProgress(0);
    try {
      const result = await supabaseMediaService.uploadToSupabase(file, 'career-connect/companies/logos', {
        tags: ['company', 'logo'],
        context: `uploaded_by=${currentUser?.uid || 'system'}`,
      });
      setLogoProgress(100);
      if (result?.success) {
        if (forCreate) {
          setCreateForm((prev) => ({ ...prev, logoUrl: result.url, logoPublicId: result.public_id }));
        } else {
          setEditForm((prev) => ({ ...prev, logoUrl: result.url, logoPublicId: result.public_id }));
        }
        toast.success('Logo uploaded');
      } else {
        toast.error('Logo upload failed');
      }
    } catch (err) {
      console.error('[CompanyManagement] logo upload error:', err);
      toast.error('Logo upload failed');
    } finally {
      setUploadingLogo(false);
      setLogoProgress(0);
      event.target.value = '';
    }
  };

  const handleDocumentUpload = async (event, forCreate = false) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    setUploadingDocs(true);
    setDocProgress(0);
    try {
      const uploaded = [];
      for (let i = 0; i < files.length; i += 1) {
        // eslint-disable-next-line no-await-in-loop
        const res = await supabaseMediaService.uploadToSupabase(files[i], 'career-connect/companies/documents', {
          tags: ['company', 'document'],
          context: `uploaded_by=${currentUser?.uid || 'system'}`,
        });
        if (res?.success) {
          uploaded.push({
            url: res.url,
            publicId: res.public_id,
            name: files[i].name,
            bytes: res.bytes,
            format: res.format,
            uploadedAt: new Date().toISOString(),
          });
        }
        setDocProgress(Math.round(((i + 1) / files.length) * 100));
      }

      if (forCreate) {
        setCreateForm((prev) => ({ ...prev, documents: [...prev.documents, ...uploaded] }));
      } else {
        setEditForm((prev) => ({ ...prev, documents: [...prev.documents, ...uploaded] }));
      }
      toast.success(`${uploaded.length} document(s) uploaded`);
    } catch (err) {
      console.error('[CompanyManagement] document upload error:', err);
      toast.error('Document upload failed');
    } finally {
      setUploadingDocs(false);
      setDocProgress(0);
      event.target.value = '';
    }
  };

  const handleRemoveDocument = async (doc, forCreate = false) => {
    if (!doc) return;
    try {
      await supabaseMediaService.deleteFromsupabase?.(doc.publicId);
    } catch (err) {
      console.warn('[CompanyManagement] supabase delete warning:', err?.message);
    }
    if (forCreate) {
      setCreateForm((prev) => ({ ...prev, documents: prev.documents.filter((d) => d.publicId !== doc.publicId) }));
    } else {
      setEditForm((prev) => ({ ...prev, documents: prev.documents.filter((d) => d.publicId !== doc.publicId) }));
    }
    toast.info('Document removed');
  };

  /* ------------------ Modals ------------------ */

  const openDetails = (company) => {
    setSelectedCompany(company);
    setReviewNotes(company.reviewNotes || '');
    setShowDetailsModal(true);
  };

  const openEdit = (company) => {
    setEditForm({ ...emptyForm, ...company });
    setSelectedCompany(company);
    setShowEditModal(true);
  };

  const openDelete = (company) => {
    setSelectedCompany(company);
    setShowDeleteModal(true);
  };

  /* ------------------ Render ------------------ */

  if (!isAdmin) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <Alert variant="danger">
          <h4 className="font-bold text-lg mb-1">Access Denied</h4>
          <p>You must be an administrator to access this page.</p>
        </Alert>
      </div>
    );
  }

  const tabs = [{ key: 'all', label: 'All' }, ...Object.entries(STATUS_META).map(([key, meta]) => ({ key, label: meta.label }))];

  return (
    <AdminPageShell
      title="Company Management"
      description="Approve, verify and manage employer & partner companies."
      icon={FaBuilding}
      actions={
        <div className="flex flex-wrap gap-2">
          <Button variant="outlineSecondary" onClick={exportCsv} disabled={!companies.length}>
            <FaDownload className="mr-2" /> Export
          </Button>
          <Button
            variant="outlinePrimary"
            onClick={() => { setRefreshing(true); loadCompanies(false); }}
            disabled={refreshing}
          >
            <FaSync className={`mr-2 ${refreshing ? 'animate-spin' : ''}`} /> Refresh
          </Button>
          <Button variant="primary" onClick={() => setShowCreateModal(true)}>
            <FaPlus className="mr-2" /> New Company
          </Button>
        </div>
      }
    >
      <div className="w-full">
        {error && (
          <Alert variant="danger" className="mb-4">
            <div className="flex justify-between items-center">
              <span>{error}</span>
              <button onClick={() => setError('')} className="text-red-600 hover:text-red-800">&times;</button>
            </div>
          </Alert>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3 mb-6">
          {[
            { key: 'total', label: 'Total', color: 'text-blue-600' },
            { key: 'pending', label: 'Pending', color: 'text-yellow-600' },
            { key: 'approved', label: 'Approved', color: 'text-green-600' },
            { key: 'suspended', label: 'Suspended', color: 'text-gray-700' },
            { key: 'rejected', label: 'Rejected', color: 'text-red-600' },
            { key: 'verified', label: 'Verified', color: 'text-cyan-600' },
            { key: 'featured', label: 'Featured', color: 'text-purple-600' },
          ].map((s) => (
            <Card key={s.key} className="p-4">
              <div className={`text-xs uppercase font-bold tracking-wide ${s.color}`}>{s.label}</div>
              <div className="text-2xl font-semibold text-gray-800 mt-1">{summary[s.key] || 0}</div>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <div className="p-4">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
              <div className="lg:col-span-4 relative">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input
                  className="pl-9"
                  placeholder="Search company, email, industry..."
                  value={search}
                  onChange={(e) => { setPage(1); setSearch(e.target.value); }}
                />
              </div>
              <div className="lg:col-span-2">
                <Select
                  value={statusFilter}
                  onChange={(e) => { setPage(1); setStatusFilter(e.target.value); }}
                  disabled={activeTab !== 'all'}
                >
                  <option value="all">All statuses</option>
                  {Object.entries(STATUS_META).map(([key, meta]) => (
                    <option value={key} key={key}>{meta.label}</option>
                  ))}
                </Select>
              </div>
              <div className="lg:col-span-2">
                <Select
                  value={industryFilter}
                  onChange={(e) => { setPage(1); setIndustryFilter(e.target.value); }}
                >
                  <option value="all">All industries</option>
                  {INDUSTRIES.map((i) => (<option value={i} key={i}>{i}</option>))}
                </Select>
              </div>
              <div className="lg:col-span-2">
                <Select
                  value={verifiedFilter}
                  onChange={(e) => { setPage(1); setVerifiedFilter(e.target.value); }}
                >
                  <option value="all">All verification</option>
                  <option value="verified">Verified only</option>
                  <option value="unverified">Unverified only</option>
                </Select>
              </div>
              <div className="lg:col-span-2">
                <Button variant="outlineSecondary" className="w-full" onClick={resetFilters}>
                  <FaFilter className="mr-1" /> Clear
                </Button>
              </div>
            </div>

            {selectedIds.length > 0 && (
              <div className="mt-4">
                <Alert variant="info">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <span><strong>{selectedIds.length}</strong> companies selected</span>
                    <div className="flex flex-wrap gap-2">
                      {isSuperAdmin && <>
                        <Button size="sm" variant="success" onClick={() => handleBulkStatus('approved', 'Bulk approved')} disabled={saving}>
                          <FaCheck className="mr-1" /> Approve
                        </Button>
                        <Button size="sm" variant="danger" onClick={() => handleBulkStatus('rejected', 'Bulk rejected')} disabled={saving}>
                          <FaTimes className="mr-1" /> Reject
                        </Button>
                        <Button size="sm" variant="dark" onClick={() => handleBulkStatus('suspended', 'Bulk suspended')} disabled={saving}>
                          <FaBan className="mr-1" /> Suspend
                        </Button>
                      </>}
                      <Button size="sm" variant="outlineSecondary" onClick={() => setSelectedIds([])}>Clear</Button>
                    </div>
                  </div>
                </Alert>
              </div>
            )}
          </div>
        </Card>

        {/* Table */}
        <Card>
          {/* Tabs */}
          <div className="flex overflow-x-auto border-b border-gray-200 px-2">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => { setActiveTab(t.key); setPage(1); }}
                className={`px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                  activeTab === t.key
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="py-16 text-center">
              <Spinner />
              <p className="mt-3 text-gray-500 text-sm">Loading companies...</p>
            </div>
          ) : companies.length === 0 ? (
            <div className="py-16 text-center">
              <FaBuilding size={42} className="text-gray-300 mx-auto mb-3" />
              <h5 className="font-semibold text-gray-700">No companies found</h5>
              <p className="text-gray-500 text-sm">Adjust the filters or add a new company.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wide">
                  <tr>
                    <th className="px-4 py-3 text-left w-10">
                      <Checkbox
                        checked={selectedIds.length === companies.length && companies.length > 0}
                        onChange={handleSelectAll}
                      />
                    </th>
                    <th className="px-4 py-3 text-left">Company</th>
                    <th className="px-4 py-3 text-left">Industry</th>
                    <th className="px-4 py-3 text-left">Location</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-left">Verified</th>
                    <th className="px-4 py-3 text-left">Created</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {companies.map((company) => {
                    const meta = STATUS_META[company.status] || STATUS_META.pending;
                    const Icon = meta.icon;
                    const name = company.companyName || company.name || 'Unnamed company';
                    return (
                      <tr key={company.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <Checkbox
                            checked={selectedIds.includes(company.id)}
                            onChange={() => handleSelectOne(company.id)}
                          />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            {company.logoUrl ? (
                              <img src={company.logoUrl} alt={name} className="w-9 h-9 rounded-full object-cover" />
                            ) : (
                              <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
                                <FaBuilding className="text-gray-400" />
                              </div>
                            )}
                            <div>
                              <div className="font-semibold text-gray-800">{name}</div>
                              <div className="text-xs text-gray-500 flex items-center gap-1">
                                <FaEnvelope /> {company.email || 'No email'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          <FaIndustry className="text-gray-400 mr-2 inline" />
                          {company.industry || '—'}
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          <FaMapMarkerAlt className="text-gray-400 mr-2 inline" />
                          {formatValue(company.location || company.address)}
                        </td>
                        <td className="px-4 py-3">
                          <Badge color={meta.color}>
                            <Icon size={12} /> {meta.label}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          {company.verified
                            ? <Badge color="bg-green-100 text-green-800 border-green-200">Verified</Badge>
                            : <Badge color="bg-gray-100 text-gray-700 border-gray-200">Unverified</Badge>}
                        </td>
                        <td className="px-4 py-3 text-gray-700">{formatDate(company.createdAt)}</td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-1">
                            <Tooltip label="View">
                              <Button variant="outlinePrimary" size="sm" onClick={() => openDetails(company)}>
                                <FaEye />
                              </Button>
                            </Tooltip>
                            <Tooltip label="Edit">
                              <Button variant="outlineInfo" size="sm" onClick={() => openEdit(company)}>
                                <FaEdit />
                              </Button>
                            </Tooltip>
                            {isSuperAdmin && ['approved', 'active'].includes(company.status) && (
                              company.companyAdminUid ? (
                                <Tooltip label={`Revoke Company Admin (${company.companyAdminEmail || company.companyAdminUid})`}>
                                  <Button variant="outlineWarning" size="sm" disabled={saving} onClick={() => handleCompanyAdminAssignment(company)}>
                                    <FaUserShield />
                                  </Button>
                                </Tooltip>
                              ) : company.companyAdminInviteId ? (
                                <>
                                  <Tooltip label={`Resend invite to ${company.companyAdminEmail || 'Company Admin'}`}>
                                    <Button variant="outlinePrimary" size="sm" disabled={saving} onClick={() => handleResendCompanyAdminInvitation(company)}>
                                      <FaRedo />
                                    </Button>
                                  </Tooltip>
                                  <Tooltip label="Revoke pending Company Admin invitation">
                                    <Button variant="outlineWarning" size="sm" disabled={saving} onClick={() => handleCompanyAdminAssignment(company)}>
                                      <FaTimes />
                                    </Button>
                                  </Tooltip>
                                </>
                              ) : (
                                <Tooltip label="Invite Company Admin">
                                  <Button variant="outlinePrimary" size="sm" disabled={saving} onClick={() => openCompanyAdminInvitation(company)}>
                                    <FaUserShield />
                                  </Button>
                                </Tooltip>
                              )
                            )}
                            {isSuperAdmin && ['pending', 'awaiting_approval'].includes(company.status) && (
                              <Tooltip label="Approve">
                                <Button
                                  variant="outlineSuccess"
                                  size="sm"
                                  onClick={() => { setSelectedCompany(company); setShowApproveModal(true); }}
                                >
                                  <FaCheck />
                                </Button>
                              </Tooltip>
                            )}
                            {isSuperAdmin && ['suspended', 'rejected', 'inactive'].includes(company.status) && (
                              <Tooltip label="Restore">
                                <Button variant="outlineSuccess" size="sm" onClick={() => handleRestore(company)}>
                                  <FaRedo />
                                </Button>
                              </Tooltip>
                            )}
                            {isSuperAdmin && ['approved', 'active'].includes(company.status) && (
                              <Tooltip label="Suspend">
                                <Button
                                  variant="outlineWarning"
                                  size="sm"
                                  onClick={() => { setSelectedCompany(company); setShowSuspendModal(true); }}
                                >
                                  <FaBan />
                                </Button>
                              </Tooltip>
                            )}
                            {isSuperAdmin && <Tooltip label="Archive company">
                              <Button variant="outlineDanger" size="sm" onClick={() => openDelete(company)}>
                                <FaTrashAlt />
                              </Button>
                            </Tooltip>}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex justify-end p-4 border-t border-gray-100">
              <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          )}
        </Card>
      </div>

      {/* -------- Details Modal -------- */}
      <Modal show={showDetailsModal} onHide={() => setShowDetailsModal(false)} size="lg">
        <ModalHeader onClose={() => setShowDetailsModal(false)}>
          {selectedCompany?.companyName || selectedCompany?.name || 'Company Details'}
        </ModalHeader>
        <ModalBody>
          {selectedCompany && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div className="text-center">
                  {selectedCompany.logoUrl ? (
                    <img
                      src={selectedCompany.logoUrl}
                      alt="logo"
                      className="w-24 h-24 rounded-full object-cover mx-auto"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mx-auto">
                      <FaBuilding size={36} className="text-gray-400" />
                    </div>
                  )}
                  <div className="mt-3 flex flex-col items-center gap-2">
                    <Badge color={(STATUS_META[selectedCompany.status] || STATUS_META.pending).color}>
                      {(STATUS_META[selectedCompany.status] || STATUS_META.pending).label}
                    </Badge>
                    {selectedCompany.verified
                      ? <Badge color="bg-green-100 text-green-800 border-green-200">Verified</Badge>
                      : <Badge color="bg-gray-100 text-gray-700 border-gray-200">Unverified</Badge>}
                  </div>
                </div>
                <div className="md:col-span-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div><span className="font-semibold text-gray-700">Email</span><div className="text-gray-700">{selectedCompany.email || '—'}</div></div>
                    <div><span className="font-semibold text-gray-700">Phone</span><div className="text-gray-700">{selectedCompany.phoneNumber || '—'}</div></div>
                    <div><span className="font-semibold text-gray-700">Industry</span><div className="text-gray-700">{selectedCompany.industry || '—'}</div></div>
                    <div><span className="font-semibold text-gray-700">Company Size</span><div className="text-gray-700">{selectedCompany.companySize || '—'}</div></div>
                    <div>
                      <span className="font-semibold text-gray-700">Website</span>
                      <div className="text-gray-700">
                        {selectedCompany.website ? (
                          <a href={selectedCompany.website} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                            <FaGlobe className="inline mr-1" />{selectedCompany.website}
                          </a>
                        ) : '—'}
                      </div>
                    </div>
                    <div><span className="font-semibold text-gray-700">Location</span><div className="text-gray-700">{formatValue(selectedCompany.location || selectedCompany.address)}</div></div>
                    <div><span className="font-semibold text-gray-700">Registration No.</span><div className="text-gray-700">{selectedCompany.registrationNumber || '—'}</div></div>
                    <div><span className="font-semibold text-gray-700">Tax Number</span><div className="text-gray-700">{selectedCompany.taxNumber || '—'}</div></div>
                    <div><span className="font-semibold text-gray-700">Contact Person</span><div className="text-gray-700">{selectedCompany.contactPersonName || '—'}</div></div>
                    <div><span className="font-semibold text-gray-700">Contact Role</span><div className="text-gray-700">{selectedCompany.contactPersonRole || '—'}</div></div>
                    <div><span className="font-semibold text-gray-700">Contact Email</span><div className="text-gray-700">{selectedCompany.contactPersonEmail || '—'}</div></div>
                    <div><span className="font-semibold text-gray-700">Contact Phone</span><div className="text-gray-700">{selectedCompany.contactPersonPhone || '—'}</div></div>
                    <div className="md:col-span-2">
                      <span className="font-semibold text-gray-700">Description</span>
                      <p className="text-gray-600 mb-0">{selectedCompany.description || selectedCompany.about || 'No description.'}</p>
                    </div>
                    <div className="md:col-span-2">
                      <span className="font-semibold text-gray-700">Created</span>
                      <div className="text-gray-700">{formatDate(selectedCompany.createdAt)}</div>
                    </div>
                  </div>
                </div>
              </div>

              {(selectedCompany.documents || []).length > 0 && (
                <div className="mb-3">
                  <span className="font-semibold text-gray-700">Attached Documents</span>
                  <ul className="mt-2 space-y-1">
                    {selectedCompany.documents.map((doc, idx) => (
                      <li key={`${doc.publicId || idx}`}>
                        <a href={doc.url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline text-sm">
                          {doc.name || `Document ${idx + 1}`}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div>
                <Label>Review Notes</Label>
                <Textarea
                  rows={3}
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Internal notes about this company..."
                />
              </div>
            </>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outlineSecondary" onClick={() => setShowDetailsModal(false)}>Close</Button>
          <Button variant="danger" onClick={() => { setShowDetailsModal(false); setShowRejectModal(true); }}>
            <FaBan className="mr-2" /> Reject
          </Button>
          <Button variant="warning" onClick={() => { setShowDetailsModal(false); setShowSuspendModal(true); }}>
            Suspend
          </Button>
          <Button variant="success" onClick={() => { setShowDetailsModal(false); setShowApproveModal(true); }}>
            <FaCheckCircle className="mr-2" /> Approve
          </Button>
        </ModalFooter>
      </Modal>

      {/* -------- Edit Modal -------- */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg">
        <ModalHeader onClose={() => setShowEditModal(false)}>Edit Company</ModalHeader>
        <ModalBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Company Name</Label>
              <Input value={editForm.companyName || ''} onChange={(e) => setEditForm({ ...editForm, companyName: e.target.value })} />
            </div>
            <div>
              <Label>Email</Label>
              <Input type="email" value={editForm.email || ''} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} />
            </div>
            <div>
              <Label>Phone</Label>
              <Input value={editForm.phoneNumber || ''} onChange={(e) => setEditForm({ ...editForm, phoneNumber: e.target.value })} />
            </div>
            <div>
              <Label>Website</Label>
              <Input value={editForm.website || ''} onChange={(e) => setEditForm({ ...editForm, website: e.target.value })} />
            </div>
            <div>
              <Label>Industry</Label>
              <Select value={editForm.industry || ''} onChange={(e) => setEditForm({ ...editForm, industry: e.target.value })}>
                <option value="">Select industry</option>
                {INDUSTRIES.map((i) => (<option value={i} key={i}>{i}</option>))}
              </Select>
            </div>
            <div>
              <Label>Company Size</Label>
              <Select value={editForm.companySize || ''} onChange={(e) => setEditForm({ ...editForm, companySize: e.target.value })}>
                <option value="">Select size</option>
                {COMPANY_SIZES.map((s) => (<option value={s} key={s}>{s}</option>))}
              </Select>
            </div>
            <div>
              <Label>Location</Label>
              <Input value={editForm.location || ''} onChange={(e) => setEditForm({ ...editForm, location: e.target.value })} />
            </div>
            <div>
              <Label>Contact Person</Label>
              <Input value={editForm.contactPersonName || ''} onChange={(e) => setEditForm({ ...editForm, contactPersonName: e.target.value })} />
            </div>
            <div>
              <Label>Contact Role</Label>
              <Input value={editForm.contactPersonRole || ''} onChange={(e) => setEditForm({ ...editForm, contactPersonRole: e.target.value })} />
            </div>
            <div className="md:col-span-2">
              <Label>Description</Label>
              <Textarea rows={3} value={editForm.description || ''} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} />
            </div>
            <div>
              <Label>Logo</Label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleLogoUpload(e, false)}
                disabled={uploadingLogo}
                className="w-full text-sm text-gray-700 file:mr-2 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100"
              />
              {uploadingLogo && <ProgressBar now={logoProgress} />}
              {editForm.logoUrl && (
                <img src={editForm.logoUrl} alt="logo" className="w-16 h-16 mt-2 rounded-md object-cover" />
              )}
            </div>
            <div>
              <Label>Documents</Label>
              <input
                type="file"
                multiple
                onChange={(e) => handleDocumentUpload(e, false)}
                disabled={uploadingDocs}
                className="w-full text-sm text-gray-700 file:mr-2 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100"
              />
              {uploadingDocs && <ProgressBar now={docProgress} />}
            </div>
            {editForm.documents?.length > 0 && (
              <div className="md:col-span-2">
                <ul className="mt-2 space-y-1">
                  {editForm.documents.map((doc, idx) => (
                    <li key={`${doc.publicId || idx}`} className="flex items-center gap-3 text-sm">
                      <a href={doc.url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                        {doc.name || `Document ${idx + 1}`}
                      </a>
                      <button type="button" onClick={() => handleRemoveDocument(doc, false)} className="text-red-600 hover:underline text-xs">
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div><Switch checked={!!editForm.featured} onChange={(e) => setEditForm({ ...editForm, featured: e.target.checked })} label="Featured" /></div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleUpdate} disabled={saving}>
            {saving ? <Spinner /> : 'Save Changes'}
          </Button>
        </ModalFooter>
      </Modal>

      {/* -------- Create Modal -------- */}
      <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} size="lg">
        <ModalHeader onClose={() => setShowCreateModal(false)}>Create Company</ModalHeader>
        <ModalBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Company Name *</Label>
              <Input value={createForm.companyName} onChange={(e) => setCreateForm({ ...createForm, companyName: e.target.value })} />
            </div>
            <div>
              <Label>Email *</Label>
              <Input type="email" value={createForm.email} onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })} />
            </div>
            <div>
              <Label>Phone</Label>
              <Input value={createForm.phoneNumber} onChange={(e) => setCreateForm({ ...createForm, phoneNumber: e.target.value })} />
            </div>
            <div>
              <Label>Website</Label>
              <Input value={createForm.website} onChange={(e) => setCreateForm({ ...createForm, website: e.target.value })} />
            </div>
            <div>
              <Label>Industry</Label>
              <Select value={createForm.industry} onChange={(e) => setCreateForm({ ...createForm, industry: e.target.value })}>
                <option value="">Select industry</option>
                {INDUSTRIES.map((i) => (<option value={i} key={i}>{i}</option>))}
              </Select>
            </div>
            <div>
              <Label>Company Size</Label>
              <Select value={createForm.companySize} onChange={(e) => setCreateForm({ ...createForm, companySize: e.target.value })}>
                <option value="">Select size</option>
                {COMPANY_SIZES.map((s) => (<option value={s} key={s}>{s}</option>))}
              </Select>
            </div>
            <div>
              <Label>Location</Label>
              <Input value={createForm.location} onChange={(e) => setCreateForm({ ...createForm, location: e.target.value })} />
            </div>
            <div>
              <Label>Status</Label>
              <Select value={createForm.status} onChange={(e) => setCreateForm({ ...createForm, status: e.target.value })}>
                {Object.entries(STATUS_META).map(([key, meta]) => (<option value={key} key={key}>{meta.label}</option>))}
              </Select>
            </div>
            <div>
              <Label>Contact Person</Label>
              <Input value={createForm.contactPersonName} onChange={(e) => setCreateForm({ ...createForm, contactPersonName: e.target.value })} />
            </div>
            <div>
              <Label>Contact Role</Label>
              <Input value={createForm.contactPersonRole} onChange={(e) => setCreateForm({ ...createForm, contactPersonRole: e.target.value })} />
            </div>
            <div className="md:col-span-2">
              <Label>Description</Label>
              <Textarea rows={3} value={createForm.description} onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })} />
            </div>
            <div>
              <Label>Logo</Label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleLogoUpload(e, true)}
                disabled={uploadingLogo}
                className="w-full text-sm text-gray-700 file:mr-2 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100"
              />
              {uploadingLogo && <ProgressBar now={logoProgress} />}
              {createForm.logoUrl && (
                <img src={createForm.logoUrl} alt="logo" className="w-16 h-16 mt-2 rounded-md object-cover" />
              )}
            </div>
            <div>
              <Label>Documents</Label>
              <input
                type="file"
                multiple
                onChange={(e) => handleDocumentUpload(e, true)}
                disabled={uploadingDocs}
                className="w-full text-sm text-gray-700 file:mr-2 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100"
              />
              {uploadingDocs && <ProgressBar now={docProgress} />}
            </div>
            {createForm.documents?.length > 0 && (
              <div className="md:col-span-2">
                <ul className="mt-2 space-y-1">
                  {createForm.documents.map((doc, idx) => (
                    <li key={`${doc.publicId || idx}`} className="flex items-center gap-3 text-sm">
                      <a href={doc.url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                        {doc.name || `Document ${idx + 1}`}
                      </a>
                      <button type="button" onClick={() => handleRemoveDocument(doc, true)} className="text-red-600 hover:underline text-xs">
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="secondary" onClick={() => setShowCreateModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleCreate} disabled={saving}>
            {saving ? <Spinner /> : 'Create Company'}
          </Button>
        </ModalFooter>
      </Modal>

      {/* -------- Approve Modal -------- */}
      <Modal show={showApproveModal} onHide={() => setShowApproveModal(false)}>
        <ModalHeader onClose={() => setShowApproveModal(false)}>Approve Company</ModalHeader>
        <ModalBody>
          <p className="text-sm text-gray-700 mb-3">
            Approve <strong>{selectedCompany?.companyName || selectedCompany?.name}</strong>?
          </p>
          <p className="text-xs text-gray-500 mb-3">
            This will mark the company as <Badge color="bg-green-100 text-green-800 border-green-200">Approved</Badge> and{' '}
            <Badge color="bg-green-100 text-green-800 border-green-200">Verified</Badge>, allowing them to post jobs and interact with students.
          </p>
          <Label>Approval Notes (optional)</Label>
          <Textarea rows={3} value={reviewNotes} onChange={(e) => setReviewNotes(e.target.value)} />
        </ModalBody>
        <ModalFooter>
          <Button variant="secondary" onClick={() => setShowApproveModal(false)}>Cancel</Button>
          <Button variant="success" onClick={handleApprove} disabled={saving}>
            {saving ? <Spinner /> : 'Approve Company'}
          </Button>
        </ModalFooter>
      </Modal>

      {/* -------- Reject Modal -------- */}
      <Modal show={showRejectModal} onHide={() => setShowRejectModal(false)}>
        <ModalHeader onClose={() => setShowRejectModal(false)}>Reject Company</ModalHeader>
        <ModalBody>
          <Alert variant="warning" className="mb-3">
            Rejecting will prevent the company from posting jobs until reviewed again.
          </Alert>
          <Label>Rejection Reason *</Label>
          <Textarea rows={4} value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="Provide a clear reason for rejection..." />
        </ModalBody>
        <ModalFooter>
          <Button variant="secondary" onClick={() => setShowRejectModal(false)}>Cancel</Button>
          <Button variant="danger" onClick={handleReject} disabled={saving || !rejectReason.trim()}>
            {saving ? <Spinner /> : 'Reject Company'}
          </Button>
        </ModalFooter>
      </Modal>

      {/* -------- Suspend Modal -------- */}
      <Modal show={showSuspendModal} onHide={() => setShowSuspendModal(false)}>
        <ModalHeader onClose={() => setShowSuspendModal(false)}>Suspend Company</ModalHeader>
        <ModalBody>
          <Label>Suspension Reason *</Label>
          <Textarea rows={4} value={suspendReason} onChange={(e) => setSuspendReason(e.target.value)} placeholder="Reason for suspension..." />
        </ModalBody>
        <ModalFooter>
          <Button variant="secondary" onClick={() => setShowSuspendModal(false)}>Cancel</Button>
          <Button variant="warning" onClick={handleSuspend} disabled={saving || !suspendReason.trim()}>
            {saving ? <Spinner /> : 'Suspend'}
          </Button>
        </ModalFooter>
      </Modal>

      <Modal show={showCompanyAdminInviteModal} onHide={() => setShowCompanyAdminInviteModal(false)}>
        <ModalHeader onClose={() => setShowCompanyAdminInviteModal(false)}>Invite Company Admin</ModalHeader>
        <ModalBody>
          <p className="mb-4 text-sm text-gray-600 dark:text-gray-300">
            Invite an administrator for <strong>{selectedCompany?.companyName || selectedCompany?.name}</strong>.
            They will receive a one-time setup link and create their own password; no password is emailed.
          </p>
          <Label htmlFor="company-admin-invite-email">Administrator email *</Label>
          <Input
            id="company-admin-invite-email"
            type="email"
            autoComplete="email"
            required
            value={companyAdminEmail}
            onChange={(event) => setCompanyAdminEmail(event.target.value)}
            placeholder="admin@company.com"
          />
        </ModalBody>
        <ModalFooter>
          <Button variant="secondary" onClick={() => setShowCompanyAdminInviteModal(false)}>Cancel</Button>
          <Button
            variant="primary"
            disabled={saving || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(companyAdminEmail.trim())}
            onClick={() => selectedCompany && handleCompanyAdminAssignment(selectedCompany, companyAdminEmail)}
          >
            {saving ? <Spinner /> : 'Send Invitation'}
          </Button>
        </ModalFooter>
      </Modal>

      {/* -------- Delete Modal -------- */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <ModalHeader onClose={() => setShowDeleteModal(false)}>Delete Company</ModalHeader>
        <ModalBody>
          <Alert variant="danger" className="mb-3">
            <strong>Warning:</strong> This action cannot be undone.
          </Alert>
          <p className="text-sm text-gray-700">
            Are you sure you want to delete{' '}
            <strong>{selectedCompany?.companyName || selectedCompany?.name}</strong>?
          </p>
        </ModalBody>
        <ModalFooter>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
          <Button variant="danger" onClick={handleDelete} disabled={saving}>
            {saving ? <Spinner /> : 'Delete Company'}
          </Button>
        </ModalFooter>
      </Modal>
    </AdminPageShell>
  );
};

export default CompanyManagement;
