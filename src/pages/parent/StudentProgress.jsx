// frontend/src/pages/parent/StudentProgress.jsx
// ============================================================================
// STUDENT PROGRESS - Production Ready
// Full CRUD | Firebase | Supabase | Cloudinary | Realtime | Tailwind CSS
// ============================================================================

import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
  memo,
} from 'react';
import { Link } from 'react-router-dom';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
  writeBatch,
} from 'firebase/firestore';
import { db, storage } from '../../config/firebase';
import { supabase } from '../../config/supabase';
import { useAuth } from '../../hooks/useAuth';
import { useParent } from '../../hooks/useParent';
import { useNotifications } from '../../hooks/useNotifications';
import {
  formatDate,
  formatRelativeTime,
  formatCurrency,
  truncate,
  debounce,
} from '../../utils/formatters';
import {
  validateRequired,
  validateMaxLength,
  validateNumberRange,
} from '../../utils/validators';

// ============================================================================
// TAILWIND UI PRIMITIVES
// ============================================================================

const PageShell = ({ title, subtitle, actions, children, loading, error }) => (
  <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      <header className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <nav aria-label="Breadcrumb" className="mb-2 flex items-center gap-2 text-xs text-slate-500">
            <Link to="/parent" className="hover:text-blue-600">Parent</Link>
            <span aria-hidden="true">/</span>
            <span className="font-medium text-slate-700">{title}</span>
          </nav>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            {title}
          </h1>
          {subtitle && <p className="mt-1 max-w-2xl text-sm text-slate-600">{subtitle}</p>}
        </div>
        <div className="flex flex-wrap items-center gap-2">{actions}</div>
      </header>

      {error && (
        <div role="alert" className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <svg className="mt-0.5 h-5 w-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <div className="flex-1">{error}</div>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-2xl border border-slate-200 bg-white/60" />
          ))}
        </div>
      ) : (
        children
      )}
    </div>
  </div>
);

const Btn = ({ children, variant = 'primary', size = 'md', onClick, disabled, loading, type = 'button', className = '', icon, ...rest }) => {
  const base = 'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60';
  const sizes = { sm: 'px-3 py-1.5 text-xs', md: 'px-4 py-2.5 text-sm', lg: 'px-5 py-3 text-base' };
  const variants = {
    primary: 'bg-blue-600 text-white shadow-sm hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-slate-100 text-slate-800 hover:bg-slate-200 focus:ring-slate-400',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    ghost: 'bg-transparent text-slate-700 hover:bg-slate-100 focus:ring-slate-300',
    outline: 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 focus:ring-slate-400',
    success: 'bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-500',
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled || loading} className={`${base} ${sizes[size]} ${variants[variant]} ${className}`} {...rest}>
      {loading ? (
        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
          <path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" fill="currentColor" className="opacity-75" />
        </svg>
      ) : icon ? <span aria-hidden="true">{icon}</span> : null}
      {children}
    </button>
  );
};

const Card = ({ title, subtitle, action, children, className = '', pad = true }) => (
  <section className={`rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md ${className}`}>
    {(title || action) && (
      <header className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
        <div>
          {title && <h2 className="text-sm font-semibold text-slate-900">{title}</h2>}
          {subtitle && <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>}
        </div>
        {action}
      </header>
    )}
    <div className={pad ? 'p-5' : ''}>{children}</div>
  </section>
);

const StatsCard = ({ label, value, delta, icon, tone = 'blue', onClick }) => {
  const tones = {
    blue: 'from-blue-500/10 to-blue-500/0 text-blue-700 ring-blue-200',
    emerald: 'from-emerald-500/10 to-emerald-500/0 text-emerald-700 ring-emerald-200',
    amber: 'from-amber-500/10 to-amber-500/0 text-amber-700 ring-amber-200',
    rose: 'from-rose-500/10 to-rose-500/0 text-rose-700 ring-rose-200',
    violet: 'from-violet-500/10 to-violet-500/0 text-violet-700 ring-violet-200',
  };
  return (
    <div onClick={onClick} className="group cursor-pointer rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{value ?? '—'}</p>
          {delta != null && (
            <p className="mt-1 text-xs font-medium text-slate-500">
              {typeof delta === 'number' && delta !== 0 && (
                <span className={delta > 0 ? 'text-emerald-600' : 'text-rose-600'}>
                  {delta > 0 ? '▲' : '▼'} {Math.abs(delta)}%
                </span>
              )}
            </p>
          )}
        </div>
        {icon && <span className={`rounded-xl bg-gradient-to-b p-2 ring-1 ${tones[tone]}`}><span aria-hidden="true">{icon}</span></span>}
      </div>
    </div>
  );
};

const Field = ({ label, name, value, onChange, type = 'text', placeholder, required, error, textarea, options, rows = 3, min, max, ...rest }) => (
  <div className="w-full">
    {label && <label htmlFor={name} className="mb-1.5 block text-xs font-semibold text-slate-700">{label} {required && <span className="text-red-500">*</span>}</label>}
    {textarea ? (
      <textarea id={name} name={name} value={value ?? ''} onChange={onChange} placeholder={placeholder} rows={rows}
        className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 ${error ? 'border-red-400' : 'border-slate-300'}`} {...rest} />
    ) : options ? (
      <select id={name} name={name} value={value ?? ''} onChange={onChange}
        className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 ${error ? 'border-red-400' : 'border-slate-300'}`} {...rest}>
        <option value="">Select…</option>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    ) : (
      <input id={name} name={name} type={type} value={value ?? ''} onChange={onChange} placeholder={placeholder} min={min} max={max}
        className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 ${error ? 'border-red-400' : 'border-slate-300'}`} {...rest} />
    )}
    {error && <p className="mt-1 text-xs font-medium text-red-600">{error}</p>}
  </div>
);

const Modal = ({ open, onClose, title, children, footer, size = 'md' }) => {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    if (open) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  if (!open) return null;
  const sizes = { sm: 'max-w-md', md: 'max-w-xl', lg: 'max-w-3xl', xl: 'max-w-5xl' };
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 p-4 backdrop-blur-sm sm:items-center">
      <div role="dialog" aria-modal="true" className={`w-full ${sizes[size]} overflow-hidden rounded-2xl bg-white shadow-2xl`}>
        <header className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h3 className="text-base font-semibold text-slate-900">{title}</h3>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100" aria-label="Close">
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
            </svg>
          </button>
        </header>
        <div className="max-h-[70vh] overflow-y-auto p-5">{children}</div>
        {footer && <footer className="flex items-center justify-end gap-2 border-t border-slate-100 bg-slate-50 px-5 py-3">{footer}</footer>}
      </div>
    </div>
  );
};

const Tabs = ({ tabs, active, onChange }) => (
  <div className="flex flex-wrap gap-1 rounded-xl bg-slate-100 p-1">
    {tabs.map((t) => (
      <button key={t.id} onClick={() => onChange(t.id)}
        className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition ${active === t.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}>
        {t.label}
        {t.count != null && <span className="ml-1.5 rounded-full bg-slate-200 px-1.5 py-0.5 text-[10px] text-slate-700">{t.count}</span>}
      </button>
    ))}
  </div>
);

const EmptyState = ({ title, description, action }) => (
  <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white/60 px-6 py-14 text-center">
    <div className="mb-3 rounded-full bg-slate-100 p-3 text-slate-400">
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    </div>
    <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
    {description && <p className="mt-1 max-w-sm text-xs text-slate-500">{description}</p>}
    {action && <div className="mt-4">{action}</div>}
  </div>
);

// ============================================================================
// REALTIME HOOKS
// ============================================================================

function useRealtimeCollection(collectionName, constraints = [], deps = []) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const constraintsRef = useRef(constraints);
  useEffect(() => { constraintsRef.current = constraints; });

  useEffect(() => {
    setLoading(true);
    let unsub = () => {};
    try {
      const q = query(collection(db, collectionName), ...constraintsRef.current);
      unsub = onSnapshot(q,
        (snap) => { setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() }))); setLoading(false); },
        (err) => { console.error(`[${collectionName}]`, err); setError(err.message); setLoading(false); }
      );
    } catch (err) { setError(err.message); setLoading(false); }
    return () => unsub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collectionName, ...deps]);

  return { items, loading, error };
}

function useCloudinaryUpload(folder = 'parent-uploads') {
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const upload = useCallback(async (file, onComplete) => {
    if (!file) return null;
    setUploading(true); setError(null); setProgress(0);
    try {
      const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
      const preset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
      if (!cloudName || !preset) throw new Error('Cloudinary env missing');

      const form = new FormData();
      form.append('file', file);
      form.append('upload_preset', preset);
      form.append('folder', folder);

      const xhr = new XMLHttpRequest();
      const url = `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`;

      const result = await new Promise((resolve, reject) => {
        xhr.open('POST', url);
        xhr.upload.onprogress = (e) => { if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100)); };
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) resolve(JSON.parse(xhr.responseText));
          else reject(new Error(`Cloudinary upload failed: ${xhr.status}`));
        };
        xhr.onerror = () => reject(new Error('Network error during upload'));
        xhr.send(form);
      });

      onComplete?.(result);
      setUploading(false);
      return result;
    } catch (err) { setError(err.message); setUploading(false); throw err; }
  }, [folder]);

  return { upload, uploading, progress, error };
}

// ============================================================================
// CRUD HELPERS
// ============================================================================

async function createDocument(collectionName, data, authorId) {
  const payload = { ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp(), createdBy: authorId ?? null, updatedBy: authorId ?? null };
  const ref = await addDoc(collection(db, collectionName), payload);
  return { id: ref.id, ...payload };
}

async function updateDocument(collectionName, id, data, authorId) {
  await updateDoc(doc(db, collectionName, id), { ...data, updatedAt: serverTimestamp(), updatedBy: authorId ?? null });
}

async function deleteDocument(collectionName, id) {
  await deleteDoc(doc(db, collectionName, id));
}

async function syncToSupabase(table, payload, id) {
  try {
    if (id) {
      const { error } = await supabase.from(table).upsert({ id, ...payload });
      if (error) throw error;
    } else {
      const { error } = await supabase.from(table).insert(payload);
      if (error) throw error;
    }
  } catch (err) { console.warn(`[supabase sync:${table}]`, err.message); }
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const StudentProgress = () => {
  const { user, profile } = useAuth();
  const { refresh: refreshParent } = useParent();
  const { push: pushNotification } = useNotifications();
  const { upload: uploadToCloudinary, uploading, progress } = useCloudinaryUpload(`parents/${user?.uid ?? 'anon'}/progress`);
  const parentId = user?.uid ?? profile?.uid;

  // ---------- Realtime ----------
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const setSearchDebounced = useMemo(() => debounce((v) => setDebouncedSearch(v), 300), []);
  useEffect(() => { setSearchDebounced(searchQuery); }, [searchQuery, setSearchDebounced]);

  const { items: children, loading: childrenLoading, error: childrenError } = useRealtimeCollection(
    'parent_children',
    parentId ? [where('parentId', '==', parentId), orderBy('createdAt', 'desc')] : [],
    [parentId]
  );

  const { items: grades } = useRealtimeCollection(
    'student_grades',
    parentId ? [where('parentId', '==', parentId), orderBy('createdAt', 'desc')] : [],
    [parentId]
  );

  const { items: attendance } = useRealtimeCollection(
    'student_attendance',
    parentId ? [where('parentId', '==', parentId), orderBy('date', 'desc')] : [],
    [parentId]
  );

  const { items: assignments } = useRealtimeCollection(
    'student_assignments',
    parentId ? [where('parentId', '==', parentId), orderBy('dueDate', 'asc')] : [],
    [parentId]
  );

  const { items: milestones } = useRealtimeCollection(
    'student_milestones',
    parentId ? [where('parentId', '==', parentId), orderBy('achievedAt', 'desc')] : [],
    [parentId]
  );

  const { items: behaviorNotes } = useRealtimeCollection(
    'student_behavior_notes',
    parentId ? [where('parentId', '==', parentId), orderBy('createdAt', 'desc')] : [],
    [parentId]
  );

  const { items: progressReports } = useRealtimeCollection(
    'student_progress_reports',
    parentId ? [where('parentId', '==', parentId), orderBy('createdAt', 'desc')] : [],
    [parentId]
  );

  // ---------- Derived ----------
  const filteredGrades = useMemo(() => {
    if (!debouncedSearch) return grades;
    const q = debouncedSearch.toLowerCase();
    return grades.filter((g) =>
      g.subject?.toLowerCase().includes(q) ||
      g.childName?.toLowerCase().includes(q) ||
      g.term?.toLowerCase().includes(q)
    );
  }, [grades, debouncedSearch]);

  const overviewStats = useMemo(() => {
    const avgGrade =
      grades.length > 0
        ? Math.round(grades.reduce((s, g) => s + (Number(g.score) || 0), 0) / grades.length)
        : null;
    const attendanceRate =
      attendance.length > 0
        ? Math.round((attendance.filter((a) => a.status === 'present').length / attendance.length) * 100)
        : null;
    return {
      children: children.length,
      avgGrade,
      attendanceRate,
      pendingAssignments: assignments.filter((a) => a.status !== 'completed').length,
      milestones: milestones.length,
    };
  }, [children, grades, attendance, assignments, milestones]);

  // ---------- Local UI ----------
  const [gradeModal, setGradeModal] = useState({ open: false, editing: null });
  const [attendanceModal, setAttendanceModal] = useState({ open: false, editing: null });
  const [assignmentModal, setAssignmentModal] = useState({ open: false, editing: null });
  const [milestoneModal, setMilestoneModal] = useState({ open: false, editing: null });
  const [noteModal, setNoteModal] = useState({ open: false, editing: null });
  const [reportModal, setReportModal] = useState({ open: false, editing: null });
  const [confirmDelete, setConfirmDelete] = useState({ open: false, target: null, type: '' });
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, tone = 'success') => {
    setToast({ message, tone });
    setTimeout(() => setToast(null), 3200);
  }, []);

  // ---------- Forms ----------
  const [gradeForm, setGradeForm] = useState({ childId: '', childName: '', subject: '', score: '', term: '', date: '', teacher: '', remarks: '' });
  const [attendanceForm, setAttendanceForm] = useState({ childId: '', childName: '', date: '', status: 'present', reason: '' });
  const [assignmentForm, setAssignmentForm] = useState({ childId: '', childName: '', title: '', subject: '', dueDate: '', status: 'pending', description: '', attachmentUrl: '' });
  const [milestoneForm, setMilestoneForm] = useState({ childId: '', childName: '', title: '', description: '', achievedAt: '', category: 'academic', badgeUrl: '' });
  const [noteForm, setNoteForm] = useState({ childId: '', childName: '', type: 'positive', note: '', teacher: '', date: '' });
  const [reportForm, setReportForm] = useState({ childId: '', childName: '', title: '', term: '', summary: '', fileUrl: '', overallScore: '' });

  const [formErrors, setFormErrors] = useState({});

  // ---------- Validation ----------
  const validateGrade = () => {
    const errors = {};
    if (!validateRequired(gradeForm.childId)) errors.childId = 'Select child';
    if (!validateRequired(gradeForm.subject)) errors.subject = 'Subject required';
    if (!validateNumberRange(gradeForm.score, 0, 100)) errors.score = 'Score 0-100';
    setFormErrors(errors); return Object.keys(errors).length === 0;
  };
  const validateAttendance = () => {
    const errors = {};
    if (!validateRequired(attendanceForm.childId)) errors.childId = 'Select child';
    if (!validateRequired(attendanceForm.date)) errors.date = 'Date required';
    setFormErrors(errors); return Object.keys(errors).length === 0;
  };
  const validateAssignment = () => {
    const errors = {};
    if (!validateRequired(assignmentForm.childId)) errors.childId = 'Select child';
    if (!validateRequired(assignmentForm.title)) errors.title = 'Title required';
    if (!validateRequired(assignmentForm.dueDate)) errors.dueDate = 'Due date required';
    setFormErrors(errors); return Object.keys(errors).length === 0;
  };
  const validateMilestone = () => {
    const errors = {};
    if (!validateRequired(milestoneForm.childId)) errors.childId = 'Select child';
    if (!validateRequired(milestoneForm.title)) errors.title = 'Title required';
    setFormErrors(errors); return Object.keys(errors).length === 0;
  };
  const validateNote = () => {
    const errors = {};
    if (!validateRequired(noteForm.childId)) errors.childId = 'Select child';
    if (!validateRequired(noteForm.note)) errors.note = 'Note required';
    setFormErrors(errors); return Object.keys(errors).length === 0;
  };
  const validateReport = () => {
    const errors = {};
    if (!validateRequired(reportForm.childId)) errors.childId = 'Select child';
    if (!validateRequired(reportForm.title)) errors.title = 'Title required';
    setFormErrors(errors); return Object.keys(errors).length === 0;
  };

  // ---------- CRUD: Grades ----------
  const handleSaveGrade = async () => {
    if (!validateGrade()) return;
    try {
      const payload = { ...gradeForm, score: Number(gradeForm.score), parentId };
      if (gradeModal.editing) {
        await updateDocument('student_grades', gradeModal.editing.id, payload, parentId);
        await syncToSupabase('student_grades', payload, gradeModal.editing.id);
        showToast('Grade updated');
      } else {
        const created = await createDocument('student_grades', payload, parentId);
        await syncToSupabase('student_grades', payload, created.id);
        showToast('Grade added');
      }
      setGradeModal({ open: false, editing: null });
      setGradeForm({ childId: '', childName: '', subject: '', score: '', term: '', date: '', teacher: '', remarks: '' });
    } catch (err) { showToast(err.message, 'error'); }
  };

  const handleDeleteGrade = async () => {
    if (!confirmDelete.target) return;
    try {
      await deleteDocument('student_grades', confirmDelete.target.id);
      await supabase.from('student_grades').delete().eq('id', confirmDelete.target.id);
      showToast('Grade deleted');
      setConfirmDelete({ open: false, target: null, type: '' });
    } catch (err) { showToast(err.message, 'error'); }
  };

  // ---------- CRUD: Attendance ----------
  const handleSaveAttendance = async () => {
    if (!validateAttendance()) return;
    try {
      const payload = { ...attendanceForm, parentId };
      if (attendanceModal.editing) {
        await updateDocument('student_attendance', attendanceModal.editing.id, payload, parentId);
        await syncToSupabase('student_attendance', payload, attendanceModal.editing.id);
        showToast('Attendance updated');
      } else {
        const created = await createDocument('student_attendance', payload, parentId);
        await syncToSupabase('student_attendance', payload, created.id);
        showToast('Attendance recorded');
      }
      setAttendanceModal({ open: false, editing: null });
      setAttendanceForm({ childId: '', childName: '', date: '', status: 'present', reason: '' });
    } catch (err) { showToast(err.message, 'error'); }
  };

  const handleDeleteAttendance = async () => {
    if (!confirmDelete.target) return;
    try {
      await deleteDocument('student_attendance', confirmDelete.target.id);
      await supabase.from('student_attendance').delete().eq('id', confirmDelete.target.id);
      showToast('Attendance deleted');
      setConfirmDelete({ open: false, target: null, type: '' });
    } catch (err) { showToast(err.message, 'error'); }
  };

  // ---------- CRUD: Assignments ----------
  const handleSaveAssignment = async () => {
    if (!validateAssignment()) return;
    try {
      const payload = { ...assignmentForm, parentId };
      if (assignmentModal.editing) {
        await updateDocument('student_assignments', assignmentModal.editing.id, payload, parentId);
        await syncToSupabase('student_assignments', payload, assignmentModal.editing.id);
        showToast('Assignment updated');
      } else {
        const created = await createDocument('student_assignments', payload, parentId);
        await syncToSupabase('student_assignments', payload, created.id);
        showToast('Assignment added');
      }
      setAssignmentModal({ open: false, editing: null });
      setAssignmentForm({ childId: '', childName: '', title: '', subject: '', dueDate: '', status: 'pending', description: '', attachmentUrl: '' });
    } catch (err) { showToast(err.message, 'error'); }
  };

  const handleDeleteAssignment = async () => {
    if (!confirmDelete.target) return;
    try {
      await deleteDocument('student_assignments', confirmDelete.target.id);
      await supabase.from('student_assignments').delete().eq('id', confirmDelete.target.id);
      showToast('Assignment deleted');
      setConfirmDelete({ open: false, target: null, type: '' });
    } catch (err) { showToast(err.message, 'error'); }
  };

  // ---------- CRUD: Milestones ----------
  const handleSaveMilestone = async () => {
    if (!validateMilestone()) return;
    try {
      const payload = { ...milestoneForm, parentId };
      if (milestoneModal.editing) {
        await updateDocument('student_milestones', milestoneModal.editing.id, payload, parentId);
        await syncToSupabase('student_milestones', payload, milestoneModal.editing.id);
        showToast('Milestone updated');
      } else {
        const created = await createDocument('student_milestones', payload, parentId);
        await syncToSupabase('student_milestones', payload, created.id);
        showToast('Milestone added');
      }
      setMilestoneModal({ open: false, editing: null });
      setMilestoneForm({ childId: '', childName: '', title: '', description: '', achievedAt: '', category: 'academic', badgeUrl: '' });
    } catch (err) { showToast(err.message, 'error'); }
  };

  const handleDeleteMilestone = async () => {
    if (!confirmDelete.target) return;
    try {
      await deleteDocument('student_milestones', confirmDelete.target.id);
      await supabase.from('student_milestones').delete().eq('id', confirmDelete.target.id);
      showToast('Milestone deleted');
      setConfirmDelete({ open: false, target: null, type: '' });
    } catch (err) { showToast(err.message, 'error'); }
  };

  // ---------- CRUD: Behavior Notes ----------
  const handleSaveNote = async () => {
    if (!validateNote()) return;
    try {
      const payload = { ...noteForm, parentId };
      if (noteModal.editing) {
        await updateDocument('student_behavior_notes', noteModal.editing.id, payload, parentId);
        await syncToSupabase('student_behavior_notes', payload, noteModal.editing.id);
        showToast('Note updated');
      } else {
        const created = await createDocument('student_behavior_notes', payload, parentId);
        await syncToSupabase('student_behavior_notes', payload, created.id);
        showToast('Note added');
      }
      setNoteModal({ open: false, editing: null });
      setNoteForm({ childId: '', childName: '', type: 'positive', note: '', teacher: '', date: '' });
    } catch (err) { showToast(err.message, 'error'); }
  };

  const handleDeleteNote = async () => {
    if (!confirmDelete.target) return;
    try {
      await deleteDocument('student_behavior_notes', confirmDelete.target.id);
      await supabase.from('student_behavior_notes').delete().eq('id', confirmDelete.target.id);
      showToast('Note deleted');
      setConfirmDelete({ open: false, target: null, type: '' });
    } catch (err) { showToast(err.message, 'error'); }
  };

  // ---------- CRUD: Progress Reports ----------
  const handleSaveReport = async () => {
    if (!validateReport()) return;
    try {
      const payload = { ...reportForm, overallScore: Number(reportForm.overallScore) || 0, parentId };
      if (reportModal.editing) {
        await updateDocument('student_progress_reports', reportModal.editing.id, payload, parentId);
        await syncToSupabase('student_progress_reports', payload, reportModal.editing.id);
        showToast('Report updated');
      } else {
        const created = await createDocument('student_progress_reports', payload, parentId);
        await syncToSupabase('student_progress_reports', payload, created.id);
        showToast('Report added');
      }
      setReportModal({ open: false, editing: null });
      setReportForm({ childId: '', childName: '', title: '', term: '', summary: '', fileUrl: '', overallScore: '' });
    } catch (err) { showToast(err.message, 'error'); }
  };

  const handleDeleteReport = async () => {
    if (!confirmDelete.target) return;
    try {
      await deleteDocument('student_progress_reports', confirmDelete.target.id);
      await supabase.from('student_progress_reports').delete().eq('id', confirmDelete.target.id);
      showToast('Report deleted');
      setConfirmDelete({ open: false, target: null, type: '' });
    } catch (err) { showToast(err.message, 'error'); }
  };

  // ---------- File uploads ----------
  const handleMilestoneBadgeUpload = async (file) => {
    try {
      const result = await uploadToCloudinary(file);
      setMilestoneForm((f) => ({ ...f, badgeUrl: result?.secure_url || '' }));
      showToast('Badge uploaded');
    } catch (err) { showToast(err.message, 'error'); }
  };

  const handleReportFileUpload = async (file) => {
    try {
      const result = await uploadToCloudinary(file);
      setReportForm((f) => ({ ...f, fileUrl: result?.secure_url || '' }));
      showToast('Report file uploaded');
    } catch (err) { showToast(err.message, 'error'); }
  };

  const handleAssignmentAttachmentUpload = async (file) => {
    try {
      const result = await uploadToCloudinary(file);
      setAssignmentForm((f) => ({ ...f, attachmentUrl: result?.secure_url || '' }));
      showToast('Attachment uploaded');
    } catch (err) { showToast(err.message, 'error'); }
  };

  // ---------- Export CSV ----------
  const exportGradesCSV = () => {
    const header = ['Child', 'Subject', 'Score', 'Term', 'Teacher', 'Date'];
    const rows = grades.map((g) => [`"${g.childName ?? ''}"`, `"${g.subject ?? ''}"`, g.score ?? 0, `"${g.term ?? ''}"`, `"${g.teacher ?? ''}"`, g.date ?? '']);
    const csv = [header.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `student-grades-${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const exportAttendanceCSV = () => {
    const header = ['Child', 'Date', 'Status', 'Reason'];
    const rows = attendance.map((a) => [`"${a.childName ?? ''}"`, a.date ?? '', a.status ?? '', `"${a.reason ?? ''}"`]);
    const csv = [header.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `student-attendance-${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  // ---------- Render ----------
  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'grades', label: 'Grades', count: grades.length },
    { id: 'attendance', label: 'Attendance', count: attendance.length },
    { id: 'assignments', label: 'Assignments', count: assignments.length },
    { id: 'milestones', label: 'Milestones', count: milestones.length },
    { id: 'notes', label: 'Behavior', count: behaviorNotes.length },
    { id: 'reports', label: 'Reports', count: progressReports.length },
  ];

  return (
    <PageShell
      title="Student Progress"
      subtitle="Track grades, attendance, assignments, milestones, and reports in real time."
      loading={childrenLoading}
      error={childrenError}
      actions={
        <>
          <Btn variant="outline" onClick={refreshParent}>
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
            </svg>
            Refresh
          </Btn>
          <Btn onClick={() => setGradeModal({ open: true, editing: null })}>
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" />
            </svg>
            Add Grade
          </Btn>
        </>
      }
    >
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 rounded-xl px-4 py-3 text-sm font-medium text-white shadow-lg transition ${toast.tone === 'error' ? 'bg-red-600' : 'bg-emerald-600'}`}>
          {toast.message}
        </div>
      )}

      {/* Stats */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatsCard label="Children" value={overviewStats.children} tone="blue" icon="👨‍👩‍👧" />
        <StatsCard label="Avg Grade" value={overviewStats.avgGrade ?? '—'} tone="emerald" icon="📊" />
        <StatsCard label="Attendance %" value={overviewStats.attendanceRate != null ? `${overviewStats.attendanceRate}%` : '—'} tone="amber" icon="🗓️" />
        <StatsCard label="Pending Assignments" value={overviewStats.pendingAssignments} tone="rose" icon="📝" />
        <StatsCard label="Milestones" value={overviewStats.milestones} tone="violet" icon="🏆" />
      </div>

      {/* Tabs + Search */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Tabs tabs={tabs} active={activeTab} onChange={setActiveTab} />
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search grades…"
          className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 sm:w-64"
        />
      </div>

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <Card title="Recent Grades" subtitle="Latest academic performance">
            {grades.length === 0 ? <p className="text-sm text-slate-500">No grades yet.</p> : (
              <ul className="divide-y divide-slate-100">
                {grades.slice(0, 6).map((g) => (
                  <li key={g.id} className="flex items-center justify-between py-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{g.subject} · {g.childName}</p>
                      <p className="text-xs text-slate-500">{g.term} · {g.teacher}</p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${g.score >= 75 ? 'bg-emerald-50 text-emerald-700' : g.score >= 50 ? 'bg-amber-50 text-amber-700' : 'bg-rose-50 text-rose-700'}`}>
                      {g.score}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card title="Upcoming Assignments" subtitle="Pending tasks">
            {assignments.filter((a) => a.status !== 'completed').length === 0 ? (
              <p className="text-sm text-slate-500">No pending assignments.</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {assignments.filter((a) => a.status !== 'completed').slice(0, 6).map((a) => (
                  <li key={a.id} className="flex items-start gap-3 py-3">
                    <span className="mt-1 rounded-lg bg-rose-50 p-2 text-rose-600">📝</span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-800">{a.title}</p>
                      <p className="text-xs text-slate-500">{a.subject} · Due {a.dueDate}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      )}

      {activeTab === 'grades' && (
        <Card title="Grades" action={<div className="flex gap-2"><Btn size="sm" variant="outline" onClick={exportGradesCSV}>Export CSV</Btn><Btn size="sm" onClick={() => setGradeModal({ open: true, editing: null })}>Add Grade</Btn></div>}>
          {filteredGrades.length === 0 ? (
            <EmptyState title="No grades yet" description="Add the first grade to get started." action={<Btn onClick={() => setGradeModal({ open: true, editing: null })}>Add Grade</Btn>} />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <th className="px-3 py-3">Child</th>
                    <th className="px-3 py-3">Subject</th>
                    <th className="px-3 py-3">Score</th>
                    <th className="px-3 py-3">Term</th>
                    <th className="px-3 py-3">Teacher</th>
                    <th className="px-3 py-3">Date</th>
                    <th className="px-3 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredGrades.map((g) => (
                    <tr key={g.id} className="border-b border-slate-50 hover:bg-slate-50/60">
                      <td className="px-3 py-3 font-medium text-slate-800">{g.childName}</td>
                      <td className="px-3 py-3 text-slate-600">{g.subject}</td>
                      <td className="px-3 py-3"><span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${g.score >= 75 ? 'bg-emerald-50 text-emerald-700' : g.score >= 50 ? 'bg-amber-50 text-amber-700' : 'bg-rose-50 text-rose-700'}`}>{g.score}</span></td>
                      <td className="px-3 py-3 text-slate-600">{g.term}</td>
                      <td className="px-3 py-3 text-slate-600">{g.teacher}</td>
                      <td className="px-3 py-3 text-slate-500">{g.date}</td>
                      <td className="px-3 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <Btn size="sm" variant="outline" onClick={() => { setGradeForm({ childId: g.childId || '', childName: g.childName || '', subject: g.subject || '', score: g.score ?? '', term: g.term || '', date: g.date || '', teacher: g.teacher || '', remarks: g.remarks || '' }); setGradeModal({ open: true, editing: g }); }}>Edit</Btn>
                          <Btn size="sm" variant="danger" onClick={() => setConfirmDelete({ open: true, target: g, type: 'grade' })}>Delete</Btn>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {activeTab === 'attendance' && (
        <Card title="Attendance" action={<div className="flex gap-2"><Btn size="sm" variant="outline" onClick={exportAttendanceCSV}>Export CSV</Btn><Btn size="sm" onClick={() => setAttendanceModal({ open: true, editing: null })}>Record Attendance</Btn></div>}>
          {attendance.length === 0 ? (
            <EmptyState title="No attendance records" description="Start recording attendance." action={<Btn onClick={() => setAttendanceModal({ open: true, editing: null })}>Record Attendance</Btn>} />
          ) : (
            <ul className="divide-y divide-slate-100">
              {attendance.map((a) => (
                <li key={a.id} className="flex items-start gap-4 py-4">
                  <span className={`rounded-xl p-3 ${a.status === 'present' ? 'bg-emerald-50 text-emerald-600' : a.status === 'absent' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'}`}>
                    {a.status === 'present' ? '✅' : a.status === 'absent' ? '❌' : '⏰'}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-800">{a.childName} · {a.date}</p>
                    <p className="text-xs text-slate-500">{a.status}{a.reason ? ` · ${a.reason}` : ''}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Btn size="sm" variant="outline" onClick={() => { setAttendanceForm({ childId: a.childId || '', childName: a.childName || '', date: a.date || '', status: a.status || 'present', reason: a.reason || '' }); setAttendanceModal({ open: true, editing: a }); }}>Edit</Btn>
                    <Btn size="sm" variant="danger" onClick={() => setConfirmDelete({ open: true, target: a, type: 'attendance' })}>Delete</Btn>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      )}

      {activeTab === 'assignments' && (
        <Card title="Assignments" action={<Btn size="sm" onClick={() => setAssignmentModal({ open: true, editing: null })}>Add Assignment</Btn>}>
          {assignments.length === 0 ? (
            <EmptyState title="No assignments" description="Add the first assignment." action={<Btn onClick={() => setAssignmentModal({ open: true, editing: null })}>Add Assignment</Btn>} />
          ) : (
            <ul className="divide-y divide-slate-100">
              {assignments.map((a) => (
                <li key={a.id} className="flex items-start gap-4 py-4">
                  <span className="rounded-xl bg-blue-50 p-3 text-blue-600">📝</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-800">{a.title}</p>
                    <p className="text-xs text-slate-500">{a.subject} · Due {a.dueDate} · <span className={`font-semibold ${a.status === 'completed' ? 'text-emerald-600' : 'text-amber-600'}`}>{a.status}</span></p>
                    {a.description && <p className="truncate text-xs text-slate-400">{a.description}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <Btn size="sm" variant="outline" onClick={() => { setAssignmentForm({ childId: a.childId || '', childName: a.childName || '', title: a.title || '', subject: a.subject || '', dueDate: a.dueDate || '', status: a.status || 'pending', description: a.description || '', attachmentUrl: a.attachmentUrl || '' }); setAssignmentModal({ open: true, editing: a }); }}>Edit</Btn>
                    <Btn size="sm" variant="danger" onClick={() => setConfirmDelete({ open: true, target: a, type: 'assignment' })}>Delete</Btn>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      )}

      {activeTab === 'milestones' && (
        <Card title="Milestones" action={<Btn size="sm" onClick={() => setMilestoneModal({ open: true, editing: null })}>Add Milestone</Btn>}>
          {milestones.length === 0 ? (
            <EmptyState title="No milestones" description="Celebrate achievements by adding milestones." action={<Btn onClick={() => setMilestoneModal({ open: true, editing: null })}>Add Milestone</Btn>} />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {milestones.map((m) => (
                <div key={m.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center gap-3">
                    {m.badgeUrl ? <img src={m.badgeUrl} alt="badge" className="h-12 w-12 rounded-full object-cover" /> : <span className="rounded-full bg-amber-50 p-3 text-amber-600">🏆</span>}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-800">{m.title}</p>
                      <p className="text-xs text-slate-500">{m.childName} · {m.category}</p>
                    </div>
                  </div>
                  {m.description && <p className="mt-3 line-clamp-2 text-xs text-slate-500">{m.description}</p>}
                  <div className="mt-4 flex items-center justify-end gap-2">
                    <Btn size="sm" variant="outline" onClick={() => { setMilestoneForm({ childId: m.childId || '', childName: m.childName || '', title: m.title || '', description: m.description || '', achievedAt: m.achievedAt || '', category: m.category || 'academic', badgeUrl: m.badgeUrl || '' }); setMilestoneModal({ open: true, editing: m }); }}>Edit</Btn>
                    <Btn size="sm" variant="danger" onClick={() => setConfirmDelete({ open: true, target: m, type: 'milestone' })}>Delete</Btn>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {activeTab === 'notes' && (
        <Card title="Behavior Notes" action={<Btn size="sm" onClick={() => setNoteModal({ open: true, editing: null })}>Add Note</Btn>}>
          {behaviorNotes.length === 0 ? (
            <EmptyState title="No behavior notes" description="Record teacher observations." action={<Btn onClick={() => setNoteModal({ open: true, editing: null })}>Add Note</Btn>} />
          ) : (
            <ul className="divide-y divide-slate-100">
              {behaviorNotes.map((n) => (
                <li key={n.id} className="flex items-start gap-4 py-4">
                  <span className={`rounded-xl p-3 ${n.type === 'positive' ? 'bg-emerald-50 text-emerald-600' : n.type === 'negative' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'}`}>
                    {n.type === 'positive' ? '👍' : n.type === 'negative' ? '⚠️' : '📌'}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-800">{n.childName} · {n.teacher}</p>
                    <p className="text-xs text-slate-500">{n.note}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Btn size="sm" variant="outline" onClick={() => { setNoteForm({ childId: n.childId || '', childName: n.childName || '', type: n.type || 'positive', note: n.note || '', teacher: n.teacher || '', date: n.date || '' }); setNoteModal({ open: true, editing: n }); }}>Edit</Btn>
                    <Btn size="sm" variant="danger" onClick={() => setConfirmDelete({ open: true, target: n, type: 'note' })}>Delete</Btn>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      )}

      {activeTab === 'reports' && (
        <Card title="Progress Reports" action={<Btn size="sm" onClick={() => setReportModal({ open: true, editing: null })}>Add Report</Btn>}>
          {progressReports.length === 0 ? (
            <EmptyState title="No progress reports" description="Upload or add progress reports." action={<Btn onClick={() => setReportModal({ open: true, editing: null })}>Add Report</Btn>} />
          ) : (
            <ul className="divide-y divide-slate-100">
              {progressReports.map((r) => (
                <li key={r.id} className="flex items-start gap-4 py-4">
                  <span className="rounded-xl bg-violet-50 p-3 text-violet-600">📄</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-800">{r.title}</p>
                    <p className="text-xs text-slate-500">{r.childName} · {r.term} · Score: {r.overallScore}</p>
                    {r.summary && <p className="truncate text-xs text-slate-400">{r.summary}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    {r.fileUrl && <a href={r.fileUrl} target="_blank" rel="noreferrer" className="text-xs font-medium text-blue-600 hover:underline">View</a>}
                    <Btn size="sm" variant="outline" onClick={() => { setReportForm({ childId: r.childId || '', childName: r.childName || '', title: r.title || '', term: r.term || '', summary: r.summary || '', fileUrl: r.fileUrl || '', overallScore: r.overallScore ?? '' }); setReportModal({ open: true, editing: r }); }}>Edit</Btn>
                    <Btn size="sm" variant="danger" onClick={() => setConfirmDelete({ open: true, target: r, type: 'report' })}>Delete</Btn>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      )}

      {/* Grade Modal */}
      <Modal open={gradeModal.open} onClose={() => setGradeModal({ open: false, editing: null })} title={gradeModal.editing ? 'Edit Grade' : 'Add Grade'}
        footer={<><Btn variant="ghost" onClick={() => setGradeModal({ open: false, editing: null })}>Cancel</Btn><Btn onClick={handleSaveGrade}>Save</Btn></>}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Child" name="childId" options={children.map((c) => ({ value: c.id, label: c.fullName }))} value={gradeForm.childId} onChange={(e) => { const c = children.find((x) => x.id === e.target.value); setGradeForm({ ...gradeForm, childId: e.target.value, childName: c?.fullName || '' }); }} required error={formErrors.childId} />
          <Field label="Subject" name="subject" value={gradeForm.subject} onChange={(e) => setGradeForm({ ...gradeForm, subject: e.target.value })} required error={formErrors.subject} />
          <Field label="Score (0-100)" name="score" type="number" min={0} max={100} value={gradeForm.score} onChange={(e) => setGradeForm({ ...gradeForm, score: e.target.value })} required error={formErrors.score} />
          <Field label="Term" name="term" value={gradeForm.term} onChange={(e) => setGradeForm({ ...gradeForm, term: e.target.value })} />
          <Field label="Teacher" name="teacher" value={gradeForm.teacher} onChange={(e) => setGradeForm({ ...gradeForm, teacher: e.target.value })} />
          <Field label="Date" name="date" type="date" value={gradeForm.date} onChange={(e) => setGradeForm({ ...gradeForm, date: e.target.value })} />
          <div className="sm:col-span-2"><Field label="Remarks" name="remarks" textarea value={gradeForm.remarks} onChange={(e) => setGradeForm({ ...gradeForm, remarks: e.target.value })} /></div>
        </div>
      </Modal>

      {/* Attendance Modal */}
      <Modal open={attendanceModal.open} onClose={() => setAttendanceModal({ open: false, editing: null })} title={attendanceModal.editing ? 'Edit Attendance' : 'Record Attendance'}
        footer={<><Btn variant="ghost" onClick={() => setAttendanceModal({ open: false, editing: null })}>Cancel</Btn><Btn onClick={handleSaveAttendance}>Save</Btn></>}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Child" name="childId" options={children.map((c) => ({ value: c.id, label: c.fullName }))} value={attendanceForm.childId} onChange={(e) => { const c = children.find((x) => x.id === e.target.value); setAttendanceForm({ ...attendanceForm, childId: e.target.value, childName: c?.fullName || '' }); }} required error={formErrors.childId} />
          <Field label="Date" name="date" type="date" value={attendanceForm.date} onChange={(e) => setAttendanceForm({ ...attendanceForm, date: e.target.value })} required error={formErrors.date} />
          <Field label="Status" name="status" options={[{ value: 'present', label: 'Present' }, { value: 'absent', label: 'Absent' }, { value: 'late', label: 'Late' }]} value={attendanceForm.status} onChange={(e) => setAttendanceForm({ ...attendanceForm, status: e.target.value })} />
          <Field label="Reason" name="reason" value={attendanceForm.reason} onChange={(e) => setAttendanceForm({ ...attendanceForm, reason: e.target.value })} />
        </div>
      </Modal>

      {/* Assignment Modal */}
      <Modal open={assignmentModal.open} onClose={() => setAssignmentModal({ open: false, editing: null })} title={assignmentModal.editing ? 'Edit Assignment' : 'Add Assignment'}
        footer={<><Btn variant="ghost" onClick={() => setAssignmentModal({ open: false, editing: null })}>Cancel</Btn><Btn onClick={handleSaveAssignment}>Save</Btn></>}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Child" name="childId" options={children.map((c) => ({ value: c.id, label: c.fullName }))} value={assignmentForm.childId} onChange={(e) => { const c = children.find((x) => x.id === e.target.value); setAssignmentForm({ ...assignmentForm, childId: e.target.value, childName: c?.fullName || '' }); }} required error={formErrors.childId} />
          <Field label="Title" name="title" value={assignmentForm.title} onChange={(e) => setAssignmentForm({ ...assignmentForm, title: e.target.value })} required error={formErrors.title} />
          <Field label="Subject" name="subject" value={assignmentForm.subject} onChange={(e) => setAssignmentForm({ ...assignmentForm, subject: e.target.value })} />
          <Field label="Due Date" name="dueDate" type="date" value={assignmentForm.dueDate} onChange={(e) => setAssignmentForm({ ...assignmentForm, dueDate: e.target.value })} required error={formErrors.dueDate} />
          <Field label="Status" name="status" options={[{ value: 'pending', label: 'Pending' }, { value: 'in-progress', label: 'In Progress' }, { value: 'completed', label: 'Completed' }]} value={assignmentForm.status} onChange={(e) => setAssignmentForm({ ...assignmentForm, status: e.target.value })} />
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700">Attachment</label>
            <input type="file" accept="image/*,application/pdf" onChange={(e) => e.target.files?.[0] && handleAssignmentAttachmentUpload(e.target.files[0])} className="block w-full cursor-pointer text-xs text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-blue-50 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-blue-700 hover:file:bg-blue-100" />
            {uploading && <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-200"><div className="h-full bg-blue-600 transition-all" style={{ width: `${progress}%` }} /></div>}
            {assignmentForm.attachmentUrl && <a href={assignmentForm.attachmentUrl} target="_blank" rel="noreferrer" className="mt-2 inline-block text-xs font-medium text-blue-600 hover:underline">View attachment</a>}
          </div>
          <div className="sm:col-span-2"><Field label="Description" name="description" textarea value={assignmentForm.description} onChange={(e) => setAssignmentForm({ ...assignmentForm, description: e.target.value })} /></div>
        </div>
      </Modal>

      {/* Milestone Modal */}
      <Modal open={milestoneModal.open} onClose={() => setMilestoneModal({ open: false, editing: null })} title={milestoneModal.editing ? 'Edit Milestone' : 'Add Milestone'}
        footer={<><Btn variant="ghost" onClick={() => setMilestoneModal({ open: false, editing: null })}>Cancel</Btn><Btn onClick={handleSaveMilestone}>Save</Btn></>}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Child" name="childId" options={children.map((c) => ({ value: c.id, label: c.fullName }))} value={milestoneForm.childId} onChange={(e) => { const c = children.find((x) => x.id === e.target.value); setMilestoneForm({ ...milestoneForm, childId: e.target.value, childName: c?.fullName || '' }); }} required error={formErrors.childId} />
          <Field label="Title" name="title" value={milestoneForm.title} onChange={(e) => setMilestoneForm({ ...milestoneForm, title: e.target.value })} required error={formErrors.title} />
          <Field label="Category" name="category" options={[{ value: 'academic', label: 'Academic' }, { value: 'sports', label: 'Sports' }, { value: 'arts', label: 'Arts' }, { value: 'leadership', label: 'Leadership' }, { value: 'other', label: 'Other' }]} value={milestoneForm.category} onChange={(e) => setMilestoneForm({ ...milestoneForm, category: e.target.value })} />
          <Field label="Achieved At" name="achievedAt" type="date" value={milestoneForm.achievedAt} onChange={(e) => setMilestoneForm({ ...milestoneForm, achievedAt: e.target.value })} />
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700">Badge</label>
            <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && handleMilestoneBadgeUpload(e.target.files[0])} className="block w-full cursor-pointer text-xs text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-blue-50 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-blue-700 hover:file:bg-blue-100" />
            {milestoneForm.badgeUrl && <img src={milestoneForm.badgeUrl} alt="badge" className="mt-2 h-16 w-16 rounded-full object-cover" />}
          </div>
          <div className="sm:col-span-2"><Field label="Description" name="description" textarea value={milestoneForm.description} onChange={(e) => setMilestoneForm({ ...milestoneForm, description: e.target.value })} /></div>
        </div>
      </Modal>

      {/* Note Modal */}
      <Modal open={noteModal.open} onClose={() => setNoteModal({ open: false, editing: null })} title={noteModal.editing ? 'Edit Note' : 'Add Behavior Note'}
        footer={<><Btn variant="ghost" onClick={() => setNoteModal({ open: false, editing: null })}>Cancel</Btn><Btn onClick={handleSaveNote}>Save</Btn></>}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Child" name="childId" options={children.map((c) => ({ value: c.id, label: c.fullName }))} value={noteForm.childId} onChange={(e) => { const c = children.find((x) => x.id === e.target.value); setNoteForm({ ...noteForm, childId: e.target.value, childName: c?.fullName || '' }); }} required error={formErrors.childId} />
          <Field label="Type" name="type" options={[{ value: 'positive', label: 'Positive' }, { value: 'negative', label: 'Negative' }, { value: 'neutral', label: 'Neutral' }]} value={noteForm.type} onChange={(e) => setNoteForm({ ...noteForm, type: e.target.value })} />
          <Field label="Teacher" name="teacher" value={noteForm.teacher} onChange={(e) => setNoteForm({ ...noteForm, teacher: e.target.value })} />
          <Field label="Date" name="date" type="date" value={noteForm.date} onChange={(e) => setNoteForm({ ...noteForm, date: e.target.value })} />
          <div className="sm:col-span-2"><Field label="Note" name="note" textarea value={noteForm.note} onChange={(e) => setNoteForm({ ...noteForm, note: e.target.value })} required error={formErrors.note} /></div>
        </div>
      </Modal>

      {/* Report Modal */}
      <Modal open={reportModal.open} onClose={() => setReportModal({ open: false, editing: null })} title={reportModal.editing ? 'Edit Report' : 'Add Progress Report'}
        footer={<><Btn variant="ghost" onClick={() => setReportModal({ open: false, editing: null })}>Cancel</Btn><Btn onClick={handleSaveReport}>Save</Btn></>}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Child" name="childId" options={children.map((c) => ({ value: c.id, label: c.fullName }))} value={reportForm.childId} onChange={(e) => { const c = children.find((x) => x.id === e.target.value); setReportForm({ ...reportForm, childId: e.target.value, childName: c?.fullName || '' }); }} required error={formErrors.childId} />
          <Field label="Title" name="title" value={reportForm.title} onChange={(e) => setReportForm({ ...reportForm, title: e.target.value })} required error={formErrors.title} />
          <Field label="Term" name="term" value={reportForm.term} onChange={(e) => setReportForm({ ...reportForm, term: e.target.value })} />
          <Field label="Overall Score" name="overallScore" type="number" value={reportForm.overallScore} onChange={(e) => setReportForm({ ...reportForm, overallScore: e.target.value })} />
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700">Report File</label>
            <input type="file" accept="application/pdf,image/*" onChange={(e) => e.target.files?.[0] && handleReportFileUpload(e.target.files[0])} className="block w-full cursor-pointer text-xs text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-blue-50 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-blue-700 hover:file:bg-blue-100" />
            {reportForm.fileUrl && <a href={reportForm.fileUrl} target="_blank" rel="noreferrer" className="mt-2 inline-block text-xs font-medium text-blue-600 hover:underline">View uploaded file</a>}
          </div>
          <div className="sm:col-span-2"><Field label="Summary" name="summary" textarea value={reportForm.summary} onChange={(e) => setReportForm({ ...reportForm, summary: e.target.value })} /></div>
        </div>
      </Modal>

      {/* Confirm Delete */}
      <Modal open={confirmDelete.open} onClose={() => setConfirmDelete({ open: false, target: null, type: '' })} title="Confirm Delete" size="sm"
        footer={<><Btn variant="ghost" onClick={() => setConfirmDelete({ open: false, target: null, type: '' })}>Cancel</Btn><Btn variant="danger" onClick={() => {
          if (confirmDelete.type === 'grade') handleDeleteGrade();
          if (confirmDelete.type === 'attendance') handleDeleteAttendance();
          if (confirmDelete.type === 'assignment') handleDeleteAssignment();
          if (confirmDelete.type === 'milestone') handleDeleteMilestone();
          if (confirmDelete.type === 'note') handleDeleteNote();
          if (confirmDelete.type === 'report') handleDeleteReport();
        }}>Delete</Btn></>}>
        <p className="text-sm text-slate-600">Are you sure? This action cannot be undone.</p>
      </Modal>
    </PageShell>
  );
};

export default memo(StudentProgress);