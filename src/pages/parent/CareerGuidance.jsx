// frontend/src/pages/parent/CareerGuidance.jsx
// ============================================================================
// CAREER GUIDANCE - Production Ready
// Career paths | Skill gaps | Mentor matching | Assessments | Realtime
// Firebase | Supabase | Cloudinary | Tailwind CSS
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
  writeBatch,
  increment,
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { supabase } from '../../config/supabase';
import { useAuth } from '../../hooks/useAuth';
import { useParent } from '../../hooks/useParent';
import { useNotifications } from '../../hooks/useNotifications';
import {
  formatRelativeTime,
  formatDate,
  truncate,
  debounce,
} from '../../utils/formatters';
import {
  validateRequired,
  validateNumberRange,
  validateEmail,
} from '../../utils/validators';

// ============================================================================
// TAILWIND UI PRIMITIVES
// ============================================================================

const PageShell = ({ title, subtitle, actions, children, loading, error }) => (
  <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30">
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      <header className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <nav aria-label="Breadcrumb" className="mb-2 flex items-center gap-2 text-xs text-slate-500">
            <Link to="/parent" className="hover:text-violet-600">Parent</Link>
            <span aria-hidden="true">/</span>
            <span className="font-medium text-slate-700">{title}</span>
          </nav>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{title}</h1>
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
      ) : children}
    </div>
  </div>
);

const Btn = ({ children, variant = 'primary', size = 'md', onClick, disabled, loading, type = 'button', className = '', icon, ...rest }) => {
  const base = 'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60';
  const sizes = { sm: 'px-3 py-1.5 text-xs', md: 'px-4 py-2.5 text-sm', lg: 'px-5 py-3 text-base' };
  const variants = {
    primary: 'bg-violet-600 text-white shadow-sm hover:bg-violet-700 focus:ring-violet-500',
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

const StatsCard = ({ label, value, delta, icon, tone = 'violet', onClick }) => {
  const tones = {
    violet: 'from-violet-500/10 to-violet-500/0 text-violet-700 ring-violet-200',
    blue: 'from-blue-500/10 to-blue-500/0 text-blue-700 ring-blue-200',
    emerald: 'from-emerald-500/10 to-emerald-500/0 text-emerald-700 ring-emerald-200',
    amber: 'from-amber-500/10 to-amber-500/0 text-amber-700 ring-amber-200',
    rose: 'from-rose-500/10 to-rose-500/0 text-rose-700 ring-rose-200',
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

const Field = ({ label, name, value, onChange, type = 'text', placeholder, required, error, textarea, options, rows = 3, min, max, step, ...rest }) => (
  <div className="w-full">
    {label && <label htmlFor={name} className="mb-1.5 block text-xs font-semibold text-slate-700">{label} {required && <span className="text-red-500">*</span>}</label>}
    {textarea ? (
      <textarea id={name} name={name} value={value ?? ''} onChange={onChange} placeholder={placeholder} rows={rows}
        className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 ${error ? 'border-red-400' : 'border-slate-300'}`} {...rest} />
    ) : options ? (
      <select id={name} name={name} value={value ?? ''} onChange={onChange}
        className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 ${error ? 'border-red-400' : 'border-slate-300'}`} {...rest}>
        <option value="">Select…</option>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    ) : (
      <input id={name} name={name} type={type} value={value ?? ''} onChange={onChange} placeholder={placeholder} min={min} max={max} step={step}
        className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 ${error ? 'border-red-400' : 'border-slate-300'}`} {...rest} />
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

const EmptyState = ({ title, description, action, icon = '🎓' }) => (
  <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white/60 px-6 py-14 text-center">
    <div className="mb-3 rounded-full bg-slate-100 p-3 text-2xl">{icon}</div>
    <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
    {description && <p className="mt-1 max-w-sm text-xs text-slate-500">{description}</p>}
    {action && <div className="mt-4">{action}</div>}
  </div>
);

const ProgressBar = ({ value = 0, tone = 'violet' }) => {
  const tones = {
    violet: 'from-violet-500 to-fuchsia-500',
    blue: 'from-blue-500 to-cyan-500',
    emerald: 'from-emerald-500 to-teal-500',
    amber: 'from-amber-500 to-orange-500',
    rose: 'from-rose-500 to-red-500',
  };
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
      <div className={`h-full bg-gradient-to-r ${tones[tone]} transition-all`} style={{ width: `${Math.min(100, value)}%` }} />
    </div>
  );
};

// Radar chart for skills
const SkillRadar = ({ skills = [], size = 260 }) => {
  const n = skills.length || 1;
  const cx = 50, cy = 50, r = 40;
  const points = skills.map((s, i) => {
    const angle = (i / n) * 2 * Math.PI - Math.PI / 2;
    const rad = (Math.min(100, s.value) / 100) * r;
    const x = cx + Math.cos(angle) * rad;
    const y = cy + Math.sin(angle) * rad;
    return `${x},${y}`;
  }).join(' ');
  const axisPoints = skills.map((_, i) => {
    const angle = (i / n) * 2 * Math.PI - Math.PI / 2;
    const x = cx + Math.cos(angle) * r;
    const y = cy + Math.sin(angle) * r;
    return { x, y, label: skills[i].label, angle };
  });
  return (
    <div className="flex items-center justify-center">
      <svg viewBox="0 0 100 100" width={size} height={size}>
        {[0.25, 0.5, 0.75, 1].map((f, i) => (
          <circle key={i} cx={cx} cy={cy} r={r * f} fill="none" stroke="#e2e8f0" strokeWidth="0.3" />
        ))}
        {axisPoints.map((p, i) => (
          <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="#e2e8f0" strokeWidth="0.3" />
        ))}
        <polygon points={points} fill="rgba(139, 92, 246, 0.25)" stroke="#8b5cf6" strokeWidth="0.6" />
        {axisPoints.map((p, i) => {
          const labelX = cx + Math.cos(p.angle) * (r + 8);
          const labelY = cy + Math.sin(p.angle) * (r + 8);
          return (
            <text key={i} x={labelX} y={labelY} fontSize="3" textAnchor="middle" fill="#64748b">
              {truncate(p.label, 12)}
            </text>
          );
        })}
      </svg>
    </div>
  );
};

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

const CareerGuidance = () => {
  const { user, profile } = useAuth();
  const { refresh: refreshParent } = useParent();
  const { push: pushNotification } = useNotifications();
  const { upload: uploadToCloudinary, uploading, progress } = useCloudinaryUpload(`parents/${user?.uid ?? 'anon'}/career`);
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

  const { items: careerPaths } = useRealtimeCollection(
    'career_paths',
    parentId ? [where('parentId', '==', parentId), orderBy('createdAt', 'desc')] : [],
    [parentId]
  );

  const { items: skillGaps } = useRealtimeCollection(
    'career_skill_gaps',
    parentId ? [where('parentId', '==', parentId), orderBy('createdAt', 'desc')] : [],
    [parentId]
  );

  const { items: mentors } = useRealtimeCollection(
    'mentor_profiles',
    [where('active', '==', true), orderBy('rating', 'desc'), limit(50)],
    []
  );

  const { items: mentorMatches } = useRealtimeCollection(
    'career_mentor_matches',
    parentId ? [where('parentId', '==', parentId), orderBy('createdAt', 'desc')] : [],
    [parentId]
  );

  const { items: assessments } = useRealtimeCollection(
    'career_assessments',
    parentId ? [where('parentId', '==', parentId), orderBy('createdAt', 'desc')] : [],
    [parentId]
  );

  const { items: resources } = useRealtimeCollection(
    'career_resources',
    [orderBy('createdAt', 'desc'), limit(50)],
    []
  );

  const { items: milestones } = useRealtimeCollection(
    'career_milestones',
    parentId ? [where('parentId', '==', parentId), orderBy('targetDate', 'asc')] : [],
    [parentId]
  );

  // ---------- Derived ----------
  const filteredCareerPaths = useMemo(() => {
    if (!debouncedSearch) return careerPaths;
    const q = debouncedSearch.toLowerCase();
    return careerPaths.filter((c) =>
      c.title?.toLowerCase().includes(q) ||
      c.industry?.toLowerCase().includes(q) ||
      c.childName?.toLowerCase().includes(q)
    );
  }, [careerPaths, debouncedSearch]);

  const filteredMentors = useMemo(() => {
    if (!debouncedSearch) return mentors;
    const q = debouncedSearch.toLowerCase();
    return mentors.filter((m) =>
      m.name?.toLowerCase().includes(q) ||
      m.expertise?.toLowerCase().includes(q) ||
      m.industry?.toLowerCase().includes(q)
    );
  }, [mentors, debouncedSearch]);

  const overviewStats = useMemo(() => ({
    careerPaths: careerPaths.length,
    skillGaps: skillGaps.length,
    mentorMatches: mentorMatches.length,
    assessments: assessments.length,
    milestones: milestones.length,
  }), [careerPaths, skillGaps, mentorMatches, assessments, milestones]);

  const topSkills = useMemo(() => {
    const map = {};
    skillGaps.forEach((g) => {
      const skill = g.skill || 'Other';
      map[skill] = (map[skill] || 0) + (Number(g.gapLevel) || 5);
    });
    return Object.entries(map).slice(0, 6).map(([label, value]) => ({ label, value: Math.min(100, value * 10) }));
  }, [skillGaps]);

  // ---------- Local UI ----------
  const [careerModal, setCareerModal] = useState({ open: false, editing: null });
  const [skillModal, setSkillModal] = useState({ open: false, editing: null });
  const [assessmentModal, setAssessmentModal] = useState({ open: false, editing: null });
  const [milestoneModal, setMilestoneModal] = useState({ open: false, editing: null });
  const [matchModal, setMatchModal] = useState({ open: false, mentor: null });
  const [confirmDelete, setConfirmDelete] = useState({ open: false, target: null, type: '' });
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, tone = 'success') => {
    setToast({ message, tone });
    setTimeout(() => setToast(null), 3200);
  }, []);

  // ---------- Forms ----------
  const [careerForm, setCareerForm] = useState({ title: '', industry: '', description: '', childId: '', childName: '', status: 'exploring', confidence: 50, salaryRange: '', growthOutlook: 'moderate' });
  const [skillForm, setSkillForm] = useState({ skill: '', currentLevel: 3, targetLevel: 8, gapLevel: 5, priority: 'medium', notes: '', childId: '', childName: '' });
  const [assessmentForm, setAssessmentForm] = useState({ title: '', type: 'interest', score: '', maxScore: 100, date: '', interpretation: '', attachmentUrl: '', childId: '', childName: '' });
  const [milestoneForm, setMilestoneForm] = useState({ title: '', description: '', targetDate: '', status: 'planned', category: 'education', childId: '', childName: '' });
  const [matchForm, setMatchForm] = useState({ message: '' });

  const [formErrors, setFormErrors] = useState({});

  // ---------- Validation ----------
  const validateCareer = () => {
    const errors = {};
    if (!validateRequired(careerForm.title)) errors.title = 'Title required';
    if (!validateRequired(careerForm.childId)) errors.childId = 'Select child';
    setFormErrors(errors); return Object.keys(errors).length === 0;
  };
  const validateSkill = () => {
    const errors = {};
    if (!validateRequired(skillForm.skill)) errors.skill = 'Skill required';
    if (!validateRequired(skillForm.childId)) errors.childId = 'Select child';
    if (!validateNumberRange(skillForm.currentLevel, 1, 10)) errors.currentLevel = '1-10';
    if (!validateNumberRange(skillForm.targetLevel, 1, 10)) errors.targetLevel = '1-10';
    setFormErrors(errors); return Object.keys(errors).length === 0;
  };
  const validateAssessment = () => {
    const errors = {};
    if (!validateRequired(assessmentForm.title)) errors.title = 'Title required';
    if (!validateRequired(assessmentForm.childId)) errors.childId = 'Select child';
    setFormErrors(errors); return Object.keys(errors).length === 0;
  };
  const validateMilestone = () => {
    const errors = {};
    if (!validateRequired(milestoneForm.title)) errors.title = 'Title required';
    if (!validateRequired(milestoneForm.childId)) errors.childId = 'Select child';
    setFormErrors(errors); return Object.keys(errors).length === 0;
  };

  // ---------- CRUD: Career Paths ----------
  const handleSaveCareer = async () => {
    if (!validateCareer()) return;
    try {
      const payload = { ...careerForm, confidence: Number(careerForm.confidence), parentId };
      if (careerModal.editing) {
        await updateDocument('career_paths', careerModal.editing.id, payload, parentId);
        await syncToSupabase('career_paths', payload, careerModal.editing.id);
        showToast('Career path updated');
      } else {
        const created = await createDocument('career_paths', payload, parentId);
        await syncToSupabase('career_paths', payload, created.id);
        showToast('Career path added');
      }
      setCareerModal({ open: false, editing: null });
      setCareerForm({ title: '', industry: '', description: '', childId: '', childName: '', status: 'exploring', confidence: 50, salaryRange: '', growthOutlook: 'moderate' });
    } catch (err) { showToast(err.message, 'error'); }
  };

  const handleDeleteCareer = async () => {
    if (!confirmDelete.target) return;
    try {
      await deleteDocument('career_paths', confirmDelete.target.id);
      await supabase.from('career_paths').delete().eq('id', confirmDelete.target.id);
      showToast('Career path deleted');
      setConfirmDelete({ open: false, target: null, type: '' });
    } catch (err) { showToast(err.message, 'error'); }
  };

  // ---------- CRUD: Skill Gaps ----------
  const handleSaveSkill = async () => {
    if (!validateSkill()) return;
    try {
      const payload = {
        ...skillForm,
        currentLevel: Number(skillForm.currentLevel),
        targetLevel: Number(skillForm.targetLevel),
        gapLevel: Math.max(1, Number(skillForm.targetLevel) - Number(skillForm.currentLevel)),
        parentId,
      };
      if (skillModal.editing) {
        await updateDocument('career_skill_gaps', skillModal.editing.id, payload, parentId);
        await syncToSupabase('career_skill_gaps', payload, skillModal.editing.id);
        showToast('Skill gap updated');
      } else {
        const created = await createDocument('career_skill_gaps', payload, parentId);
        await syncToSupabase('career_skill_gaps', payload, created.id);
        showToast('Skill gap added');
      }
      setSkillModal({ open: false, editing: null });
      setSkillForm({ skill: '', currentLevel: 3, targetLevel: 8, gapLevel: 5, priority: 'medium', notes: '', childId: '', childName: '' });
    } catch (err) { showToast(err.message, 'error'); }
  };

  const handleDeleteSkill = async () => {
    if (!confirmDelete.target) return;
    try {
      await deleteDocument('career_skill_gaps', confirmDelete.target.id);
      await supabase.from('career_skill_gaps').delete().eq('id', confirmDelete.target.id);
      showToast('Skill gap deleted');
      setConfirmDelete({ open: false, target: null, type: '' });
    } catch (err) { showToast(err.message, 'error'); }
  };

  // ---------- CRUD: Assessments ----------
  const handleSaveAssessment = async () => {
    if (!validateAssessment()) return;
    try {
      const payload = { ...assessmentForm, score: Number(assessmentForm.score), maxScore: Number(assessmentForm.maxScore), parentId };
      if (assessmentModal.editing) {
        await updateDocument('career_assessments', assessmentModal.editing.id, payload, parentId);
        await syncToSupabase('career_assessments', payload, assessmentModal.editing.id);
        showToast('Assessment updated');
      } else {
        const created = await createDocument('career_assessments', payload, parentId);
        await syncToSupabase('career_assessments', payload, created.id);
        showToast('Assessment added');
      }
      setAssessmentModal({ open: false, editing: null });
      setAssessmentForm({ title: '', type: 'interest', score: '', maxScore: 100, date: '', interpretation: '', attachmentUrl: '', childId: '', childName: '' });
    } catch (err) { showToast(err.message, 'error'); }
  };

  const handleDeleteAssessment = async () => {
    if (!confirmDelete.target) return;
    try {
      await deleteDocument('career_assessments', confirmDelete.target.id);
      await supabase.from('career_assessments').delete().eq('id', confirmDelete.target.id);
      showToast('Assessment deleted');
      setConfirmDelete({ open: false, target: null, type: '' });
    } catch (err) { showToast(err.message, 'error'); }
  };

  // ---------- CRUD: Milestones ----------
  const handleSaveMilestone = async () => {
    if (!validateMilestone()) return;
    try {
      const payload = { ...milestoneForm, parentId };
      if (milestoneModal.editing) {
        await updateDocument('career_milestones', milestoneModal.editing.id, payload, parentId);
        await syncToSupabase('career_milestones', payload, milestoneModal.editing.id);
        showToast('Milestone updated');
      } else {
        const created = await createDocument('career_milestones', payload, parentId);
        await syncToSupabase('career_milestones', payload, created.id);
        showToast('Milestone added');
      }
      setMilestoneModal({ open: false, editing: null });
      setMilestoneForm({ title: '', description: '', targetDate: '', status: 'planned', category: 'education', childId: '', childName: '' });
    } catch (err) { showToast(err.message, 'error'); }
  };

  const handleCompleteMilestone = async (m) => {
    try {
      await updateDocument('career_milestones', m.id, { status: 'completed', completedAt: serverTimestamp() }, parentId);
      await syncToSupabase('career_milestones', { status: 'completed' }, m.id);
      showToast('Milestone completed 🎉');
    } catch (err) { showToast(err.message, 'error'); }
  };

  const handleDeleteMilestone = async () => {
    if (!confirmDelete.target) return;
    try {
      await deleteDocument('career_milestones', confirmDelete.target.id);
      await supabase.from('career_milestones').delete().eq('id', confirmDelete.target.id);
      showToast('Milestone deleted');
      setConfirmDelete({ open: false, target: null, type: '' });
    } catch (err) { showToast(err.message, 'error'); }
  };

  // ---------- CRUD: Mentor Matches ----------
  const handleRequestMatch = async () => {
    if (!matchModal.mentor) return;
    try {
      const payload = {
        parentId,
        mentorId: matchModal.mentor.id,
        mentorName: matchModal.mentor.name,
        mentorExpertise: matchModal.mentor.expertise || '',
        message: matchForm.message || '',
        status: 'pending',
        childId: children[0]?.id || '',
        childName: children[0]?.fullName || '',
      };
      const created = await createDocument('career_mentor_matches', payload, parentId);
      await syncToSupabase('career_mentor_matches', payload, created.id);
      pushNotification?.({ title: 'Mentor match requested', body: `Request sent to ${matchModal.mentor.name}`, audience: 'parent' });
      showToast('Mentor request sent');
      setMatchModal({ open: false, mentor: null });
      setMatchForm({ message: '' });
    } catch (err) { showToast(err.message, 'error'); }
  };

  const handleCancelMatch = async (m) => {
    try {
      await updateDocument('career_mentor_matches', m.id, { status: 'cancelled' }, parentId);
      await syncToSupabase('career_mentor_matches', { status: 'cancelled' }, m.id);
      showToast('Match cancelled');
    } catch (err) { showToast(err.message, 'error'); }
  };

  // ---------- Uploads ----------
  const handleAssessmentUpload = async (file) => {
    try {
      const result = await uploadToCloudinary(file);
      setAssessmentForm((f) => ({ ...f, attachmentUrl: result?.secure_url || '' }));
      showToast('Assessment file uploaded');
    } catch (err) { showToast(err.message, 'error'); }
  };

  // ---------- Export ----------
  const exportSkillsCSV = () => {
    const header = ['Skill', 'Current', 'Target', 'Gap', 'Priority'];
    const rows = skillGaps.map((s) => [
      `"${s.skill ?? ''}"`,
      s.currentLevel ?? 0,
      s.targetLevel ?? 0,
      s.gapLevel ?? 0,
      s.priority ?? '',
    ]);
    const csv = [header.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `career-skills-${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  // ---------- Render ----------
  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'paths', label: 'Career Paths', count: careerPaths.length },
    { id: 'skills', label: 'Skill Gaps', count: skillGaps.length },
    { id: 'mentors', label: 'Mentors', count: mentors.length },
    { id: 'matches', label: 'My Matches', count: mentorMatches.length },
    { id: 'assessments', label: 'Assessments', count: assessments.length },
    { id: 'milestones', label: 'Milestones', count: milestones.length },
    { id: 'resources', label: 'Resources', count: resources.length },
  ];

  return (
    <PageShell
      title="Career Guidance"
      subtitle="Explore career paths, close skill gaps, and connect with mentors."
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
          <Btn onClick={() => setCareerModal({ open: true, editing: null })}>
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" />
            </svg>
            Add Career Path
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
        <StatsCard label="Career Paths" value={overviewStats.careerPaths} tone="violet" icon="🧭" />
        <StatsCard label="Skill Gaps" value={overviewStats.skillGaps} tone="blue" icon="📈" />
        <StatsCard label="Mentor Matches" value={overviewStats.mentorMatches} tone="emerald" icon="🤝" />
        <StatsCard label="Assessments" value={overviewStats.assessments} tone="amber" icon="📝" />
        <StatsCard label="Milestones" value={overviewStats.milestones} tone="rose" icon="🎯" />
      </div>

      {/* Tabs + Search */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Tabs tabs={tabs} active={activeTab} onChange={setActiveTab} />
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search…"
          className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 sm:w-64"
        />
      </div>

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <Card title="Top Skill Gaps" subtitle="Focus areas">
            {topSkills.length === 0 ? (
              <p className="text-sm text-slate-500">No skill gaps recorded yet.</p>
            ) : (
              <SkillRadar skills={topSkills} />
            )}
          </Card>
          <Card title="Upcoming Milestones" subtitle="Next steps">
            {milestones.filter((m) => m.status !== 'completed').length === 0 ? (
              <p className="text-sm text-slate-500">No upcoming milestones.</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {milestones.filter((m) => m.status !== 'completed').slice(0, 6).map((m) => (
                  <li key={m.id} className="flex items-start gap-3 py-3">
                    <span className="mt-1 rounded-lg bg-violet-50 p-2 text-violet-600">🎯</span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-800">{m.title}</p>
                      <p className="text-xs text-slate-500">{m.childName} · {m.targetDate || 'No date'} · {m.category}</p>
                    </div>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${m.status === 'in-progress' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'}`}>
                      {m.status?.toUpperCase()}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      )}

      {activeTab === 'paths' && (
        <Card title="Career Paths" action={<Btn size="sm" onClick={() => setCareerModal({ open: true, editing: null })}>Add Career Path</Btn>}>
          {filteredCareerPaths.length === 0 ? (
            <EmptyState title="No career paths" description="Explore potential career options for your child." action={<Btn onClick={() => setCareerModal({ open: true, editing: null })}>Add Career Path</Btn>} icon="🧭" />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredCareerPaths.map((c) => (
                <div key={c.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-800">{c.title}</p>
                      <p className="text-xs text-slate-500 capitalize">{c.industry} · {c.childName}</p>
                    </div>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${c.status === 'chosen' ? 'bg-emerald-100 text-emerald-700' : c.status === 'exploring' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'}`}>
                      {c.status?.toUpperCase()}
                    </span>
                  </div>
                  {c.description && <p className="mt-3 line-clamp-2 text-xs text-slate-500">{c.description}</p>}
                  <div className="mt-3 space-y-2">
                    <div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500">Confidence</span>
                        <span className="font-semibold text-slate-700">{c.confidence || 0}%</span>
                      </div>
                      <ProgressBar value={c.confidence || 0} tone="violet" />
                    </div>
                    {c.salaryRange && <p className="text-xs text-slate-400">💰 {c.salaryRange}</p>}
                    {c.growthOutlook && <p className="text-xs text-slate-400">📈 {c.growthOutlook} growth</p>}
                  </div>
                  <div className="mt-4 flex items-center justify-end gap-2">
                    <Btn size="sm" variant="outline" onClick={() => {
                      setCareerForm({ title: c.title || '', industry: c.industry || '', description: c.description || '', childId: c.childId || '', childName: c.childName || '', status: c.status || 'exploring', confidence: c.confidence ?? 50, salaryRange: c.salaryRange || '', growthOutlook: c.growthOutlook || 'moderate' });
                      setCareerModal({ open: true, editing: c });
                    }}>Edit</Btn>
                    <Btn size="sm" variant="danger" onClick={() => setConfirmDelete({ open: true, target: c, type: 'career' })}>Delete</Btn>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {activeTab === 'skills' && (
        <Card title="Skill Gaps" action={<div className="flex gap-2"><Btn size="sm" variant="outline" onClick={exportSkillsCSV}>Export CSV</Btn><Btn size="sm" onClick={() => setSkillModal({ open: true, editing: null })}>Add Skill</Btn></div>}>
          {skillGaps.length === 0 ? (
            <EmptyState title="No skill gaps" description="Identify skills to develop." action={<Btn onClick={() => setSkillModal({ open: true, editing: null })}>Add Skill</Btn>} icon="📈" />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {skillGaps.map((s) => (
                <div key={s.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-800">{s.skill}</p>
                      <p className="text-xs text-slate-500">{s.childName}</p>
                    </div>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${s.priority === 'high' ? 'bg-red-100 text-red-700' : s.priority === 'low' ? 'bg-slate-100 text-slate-700' : 'bg-amber-100 text-amber-700'}`}>
                      {s.priority?.toUpperCase()}
                    </span>
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                    <div>
                      <p className="text-xs text-slate-500">Current</p>
                      <p className="text-lg font-bold text-slate-800">{s.currentLevel}/10</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Target</p>
                      <p className="text-lg font-bold text-violet-600">{s.targetLevel}/10</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Gap</p>
                      <p className="text-lg font-bold text-rose-600">{s.gapLevel}</p>
                    </div>
                  </div>
                  <div className="mt-3">
                    <ProgressBar value={(s.currentLevel / 10) * 100} tone="violet" />
                  </div>
                  {s.notes && <p className="mt-3 line-clamp-2 text-xs text-slate-500">{s.notes}</p>}
                  <div className="mt-4 flex items-center justify-end gap-2">
                    <Btn size="sm" variant="outline" onClick={() => {
                      setSkillForm({ skill: s.skill || '', currentLevel: s.currentLevel ?? 3, targetLevel: s.targetLevel ?? 8, gapLevel: s.gapLevel ?? 5, priority: s.priority || 'medium', notes: s.notes || '', childId: s.childId || '', childName: s.childName || '' });
                      setSkillModal({ open: true, editing: s });
                    }}>Edit</Btn>
                    <Btn size="sm" variant="danger" onClick={() => setConfirmDelete({ open: true, target: s, type: 'skill' })}>Delete</Btn>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {activeTab === 'mentors' && (
        <Card title="Find a Mentor" subtitle="Browse mentors available to support your child">
          {filteredMentors.length === 0 ? (
            <EmptyState title="No mentors" description="Mentors will appear here." icon="🤝" />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredMentors.map((m) => (
                <div key={m.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="h-14 w-14 overflow-hidden rounded-full bg-violet-100">
                      {m.avatarUrl ? (
                        <img src={m.avatarUrl} alt={m.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-lg font-semibold text-violet-700">
                          {m.name?.[0] ?? '?'}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-800">{m.name}</p>
                      <p className="truncate text-xs text-slate-500">{m.expertise || m.title}</p>
                      <div className="mt-0.5 flex items-center gap-1 text-xs text-amber-600">
                        ⭐ {m.rating?.toFixed?.(1) ?? m.rating ?? '—'}
                      </div>
                    </div>
                  </div>
                  {m.bio && <p className="mt-3 line-clamp-3 text-xs text-slate-500">{m.bio}</p>}
                  <div className="mt-3 flex flex-wrap gap-1">
                    {m.industry && <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-700">{m.industry}</span>}
                    {m.yearsExperience && <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-700">{m.yearsExperience}y exp</span>}
                  </div>
                  <div className="mt-4 flex items-center justify-end">
                    <Btn size="sm" onClick={() => { setMatchModal({ open: true, mentor: m }); setMatchForm({ message: '' }); }}>Request Match</Btn>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {activeTab === 'matches' && (
        <Card title="My Mentor Matches">
          {mentorMatches.length === 0 ? (
            <EmptyState title="No matches yet" description="Request a mentor from the Mentors tab." icon="🤝" />
          ) : (
            <ul className="divide-y divide-slate-100">
              {mentorMatches.map((m) => (
                <li key={m.id} className="flex items-start gap-4 py-4">
                  <span className={`rounded-xl p-3 ${m.status === 'accepted' ? 'bg-emerald-50 text-emerald-600' : m.status === 'pending' ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-600'}`}>
                    {m.status === 'accepted' ? '✅' : m.status === 'pending' ? '⏳' : '❌'}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-800">{m.mentorName}</p>
                    <p className="text-xs text-slate-500">{m.mentorExpertise} · {m.childName}</p>
                    {m.message && <p className="mt-1 line-clamp-2 text-xs text-slate-400">"{m.message}"</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${m.status === 'accepted' ? 'bg-emerald-100 text-emerald-700' : m.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'}`}>
                      {m.status}
                    </span>
                    {m.status === 'pending' && (
                      <Btn size="sm" variant="danger" onClick={() => handleCancelMatch(m)}>Cancel</Btn>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      )}

      {activeTab === 'assessments' && (
        <Card title="Assessments" action={<Btn size="sm" onClick={() => setAssessmentModal({ open: true, editing: null })}>Add Assessment</Btn>}>
          {assessments.length === 0 ? (
            <EmptyState title="No assessments" description="Add assessment results to guide planning." action={<Btn onClick={() => setAssessmentModal({ open: true, editing: null })}>Add Assessment</Btn>} icon="📝" />
          ) : (
            <ul className="divide-y divide-slate-100">
              {assessments.map((a) => {
                const pct = a.maxScore ? Math.round((a.score / a.maxScore) * 100) : 0;
                return (
                  <li key={a.id} className="flex items-start gap-4 py-4">
                    <span className="rounded-xl bg-amber-50 p-3 text-amber-600">📝</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-slate-800">{a.title}</p>
                      <p className="text-xs text-slate-500 capitalize">{a.type} · {a.childName} · {a.date || formatRelativeTime(a.createdAt)}</p>
                      <div className="mt-2 flex items-center gap-3">
                        <div className="flex-1"><ProgressBar value={pct} tone="amber" /></div>
                        <span className="text-xs font-bold text-slate-700">{pct}%</span>
                      </div>
                      {a.interpretation && <p className="mt-2 text-xs text-slate-500">{a.interpretation}</p>}
                      {a.attachmentUrl && <a href={a.attachmentUrl} target="_blank" rel="noreferrer" className="mt-1 inline-block text-xs font-medium text-violet-600 hover:underline">View file</a>}
                    </div>
                    <div className="flex items-center gap-2">
                      <Btn size="sm" variant="outline" onClick={() => {
                        setAssessmentForm({ title: a.title || '', type: a.type || 'interest', score: a.score ?? '', maxScore: a.maxScore ?? 100, date: a.date || '', interpretation: a.interpretation || '', attachmentUrl: a.attachmentUrl || '', childId: a.childId || '', childName: a.childName || '' });
                        setAssessmentModal({ open: true, editing: a });
                      }}>Edit</Btn>
                      <Btn size="sm" variant="danger" onClick={() => setConfirmDelete({ open: true, target: a, type: 'assessment' })}>Delete</Btn>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      )}

      {activeTab === 'milestones' && (
        <Card title="Career Milestones" action={<Btn size="sm" onClick={() => setMilestoneModal({ open: true, editing: null })}>Add Milestone</Btn>}>
          {milestones.length === 0 ? (
            <EmptyState title="No milestones" description="Add milestones to track progress." action={<Btn onClick={() => setMilestoneModal({ open: true, editing: null })}>Add Milestone</Btn>} icon="🎯" />
          ) : (
            <ul className="divide-y divide-slate-100">
              {milestones.map((m) => (
                <li key={m.id} className="flex items-start gap-4 py-4">
                  <span className={`rounded-xl p-3 ${m.status === 'completed' ? 'bg-emerald-50 text-emerald-600' : m.status === 'in-progress' ? 'bg-amber-50 text-amber-600' : 'bg-violet-50 text-violet-600'}`}>
                    {m.status === 'completed' ? '✅' : m.status === 'in-progress' ? '🚀' : '🎯'}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-800">{m.title}</p>
                    <p className="text-xs text-slate-500">{m.childName} · {m.category} · Target {m.targetDate || 'TBD'}</p>
                    {m.description && <p className="truncate text-xs text-slate-400">{m.description}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    {m.status !== 'completed' && <Btn size="sm" variant="success" onClick={() => handleCompleteMilestone(m)}>Complete</Btn>}
                    <Btn size="sm" variant="outline" onClick={() => {
                      setMilestoneForm({ title: m.title || '', description: m.description || '', targetDate: m.targetDate || '', status: m.status || 'planned', category: m.category || 'education', childId: m.childId || '', childName: m.childName || '' });
                      setMilestoneModal({ open: true, editing: m });
                    }}>Edit</Btn>
                    <Btn size="sm" variant="danger" onClick={() => setConfirmDelete({ open: true, target: m, type: 'milestone' })}>Delete</Btn>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      )}

      {activeTab === 'resources' && (
        <Card title="Career Resources">
          {resources.length === 0 ? (
            <EmptyState title="No resources" description="Curated resources will appear here." icon="📚" />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {resources.map((r) => (
                <div key={r.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center gap-3">
                    <span className="rounded-xl bg-violet-50 p-2.5 text-violet-600">📚</span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-800">{r.title}</p>
                      <p className="text-xs capitalize text-slate-500">{r.category || 'general'}</p>
                    </div>
                  </div>
                  {r.description && <p className="mt-3 line-clamp-3 text-xs text-slate-500">{r.description}</p>}
                  {r.url && (
                    <a href={r.url} target="_blank" rel="noreferrer" className="mt-3 inline-block rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-violet-700">
                      Open
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* CAREER MODAL */}
      <Modal open={careerModal.open} onClose={() => setCareerModal({ open: false, editing: null })} title={careerModal.editing ? 'Edit Career Path' : 'Add Career Path'}
        footer={<><Btn variant="ghost" onClick={() => setCareerModal({ open: false, editing: null })}>Cancel</Btn><Btn onClick={handleSaveCareer}>Save</Btn></>}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Title" name="title" value={careerForm.title} onChange={(e) => setCareerForm({ ...careerForm, title: e.target.value })} required error={formErrors.title} />
          <Field label="Industry" name="industry" value={careerForm.industry} onChange={(e) => setCareerForm({ ...careerForm, industry: e.target.value })} />
          <Field label="Child" name="childId" options={children.map((c) => ({ value: c.id, label: c.fullName }))} value={careerForm.childId} onChange={(e) => {
            const c = children.find((x) => x.id === e.target.value);
            setCareerForm({ ...careerForm, childId: e.target.value, childName: c?.fullName || '' });
          }} required error={formErrors.childId} />
          <Field label="Status" name="status" options={[
            { value: 'exploring', label: 'Exploring' },
            { value: 'chosen', label: 'Chosen' },
            { value: 'archived', label: 'Archived' },
          ]} value={careerForm.status} onChange={(e) => setCareerForm({ ...careerForm, status: e.target.value })} />
          <Field label="Confidence (0-100)" name="confidence" type="number" min={0} max={100} value={careerForm.confidence} onChange={(e) => setCareerForm({ ...careerForm, confidence: e.target.value })} />
          <Field label="Salary Range" name="salaryRange" value={careerForm.salaryRange} onChange={(e) => setCareerForm({ ...careerForm, salaryRange: e.target.value })} placeholder="e.g., $40k-$80k" />
          <Field label="Growth Outlook" name="growthOutlook" options={[
            { value: 'low', label: 'Low' },
            { value: 'moderate', label: 'Moderate' },
            { value: 'high', label: 'High' },
          ]} value={careerForm.growthOutlook} onChange={(e) => setCareerForm({ ...careerForm, growthOutlook: e.target.value })} />
          <div className="sm:col-span-2"><Field label="Description" name="description" textarea rows={4} value={careerForm.description} onChange={(e) => setCareerForm({ ...careerForm, description: e.target.value })} /></div>
        </div>
      </Modal>

      {/* SKILL MODAL */}
      <Modal open={skillModal.open} onClose={() => setSkillModal({ open: false, editing: null })} title={skillModal.editing ? 'Edit Skill Gap' : 'Add Skill Gap'}
        footer={<><Btn variant="ghost" onClick={() => setSkillModal({ open: false, editing: null })}>Cancel</Btn><Btn onClick={handleSaveSkill}>Save</Btn></>}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Skill" name="skill" value={skillForm.skill} onChange={(e) => setSkillForm({ ...skillForm, skill: e.target.value })} required error={formErrors.skill} />
          <Field label="Child" name="childId" options={children.map((c) => ({ value: c.id, label: c.fullName }))} value={skillForm.childId} onChange={(e) => {
            const c = children.find((x) => x.id === e.target.value);
            setSkillForm({ ...skillForm, childId: e.target.value, childName: c?.fullName || '' });
          }} required error={formErrors.childId} />
          <Field label="Current Level (1-10)" name="currentLevel" type="number" min={1} max={10} value={skillForm.currentLevel} onChange={(e) => setSkillForm({ ...skillForm, currentLevel: e.target.value })} error={formErrors.currentLevel} />
          <Field label="Target Level (1-10)" name="targetLevel" type="number" min={1} max={10} value={skillForm.targetLevel} onChange={(e) => setSkillForm({ ...skillForm, targetLevel: e.target.value })} error={formErrors.targetLevel} />
          <Field label="Priority" name="priority" options={[
            { value: 'low', label: 'Low' },
            { value: 'medium', label: 'Medium' },
            { value: 'high', label: 'High' },
          ]} value={skillForm.priority} onChange={(e) => setSkillForm({ ...skillForm, priority: e.target.value })} />
          <div className="sm:col-span-2"><Field label="Notes" name="notes" textarea value={skillForm.notes} onChange={(e) => setSkillForm({ ...skillForm, notes: e.target.value })} /></div>
        </div>
      </Modal>

      {/* ASSESSMENT MODAL */}
      <Modal open={assessmentModal.open} onClose={() => setAssessmentModal({ open: false, editing: null })} title={assessmentModal.editing ? 'Edit Assessment' : 'Add Assessment'}
        footer={<><Btn variant="ghost" onClick={() => setAssessmentModal({ open: false, editing: null })}>Cancel</Btn><Btn onClick={handleSaveAssessment}>Save</Btn></>}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Title" name="title" value={assessmentForm.title} onChange={(e) => setAssessmentForm({ ...assessmentForm, title: e.target.value })} required error={formErrors.title} />
          <Field label="Child" name="childId" options={children.map((c) => ({ value: c.id, label: c.fullName }))} value={assessmentForm.childId} onChange={(e) => {
            const c = children.find((x) => x.id === e.target.value);
            setAssessmentForm({ ...assessmentForm, childId: e.target.value, childName: c?.fullName || '' });
          }} required error={formErrors.childId} />
          <Field label="Type" name="type" options={[
            { value: 'interest', label: 'Interest' },
            { value: 'aptitude', label: 'Aptitude' },
            { value: 'personality', label: 'Personality' },
            { value: 'skills', label: 'Skills' },
            { value: 'other', label: 'Other' },
          ]} value={assessmentForm.type} onChange={(e) => setAssessmentForm({ ...assessmentForm, type: e.target.value })} />
          <Field label="Date" name="date" type="date" value={assessmentForm.date} onChange={(e) => setAssessmentForm({ ...assessmentForm, date: e.target.value })} />
          <Field label="Score" name="score" type="number" min={0} value={assessmentForm.score} onChange={(e) => setAssessmentForm({ ...assessmentForm, score: e.target.value })} />
          <Field label="Max Score" name="maxScore" type="number" min={1} value={assessmentForm.maxScore} onChange={(e) => setAssessmentForm({ ...assessmentForm, maxScore: e.target.value })} />
          <div className="sm:col-span-2"><Field label="Interpretation" name="interpretation" textarea value={assessmentForm.interpretation} onChange={(e) => setAssessmentForm({ ...assessmentForm, interpretation: e.target.value })} /></div>
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-xs font-semibold text-slate-700">Attachment</label>
            <input type="file" onChange={(e) => e.target.files?.[0] && handleAssessmentUpload(e.target.files[0])}
              className="block w-full cursor-pointer text-xs text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-violet-50 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-violet-700 hover:file:bg-violet-100" />
            {assessmentForm.attachmentUrl && <a href={assessmentForm.attachmentUrl} target="_blank" rel="noreferrer" className="mt-2 inline-block text-xs font-medium text-violet-600 hover:underline">View file</a>}
          </div>
        </div>
      </Modal>

      {/* MILESTONE MODAL */}
      <Modal open={milestoneModal.open} onClose={() => setMilestoneModal({ open: false, editing: null })} title={milestoneModal.editing ? 'Edit Milestone' : 'Add Milestone'}
        footer={<><Btn variant="ghost" onClick={() => setMilestoneModal({ open: false, editing: null })}>Cancel</Btn><Btn onClick={handleSaveMilestone}>Save</Btn></>}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Title" name="title" value={milestoneForm.title} onChange={(e) => setMilestoneForm({ ...milestoneForm, title: e.target.value })} required error={formErrors.title} />
          <Field label="Child" name="childId" options={children.map((c) => ({ value: c.id, label: c.fullName }))} value={milestoneForm.childId} onChange={(e) => {
            const c = children.find((x) => x.id === e.target.value);
            setMilestoneForm({ ...milestoneForm, childId: e.target.value, childName: c?.fullName || '' });
          }} required error={formErrors.childId} />
          <Field label="Category" name="category" options={[
            { value: 'education', label: 'Education' },
            { value: 'skills', label: 'Skills' },
            { value: 'experience', label: 'Experience' },
            { value: 'networking', label: 'Networking' },
            { value: 'other', label: 'Other' },
          ]} value={milestoneForm.category} onChange={(e) => setMilestoneForm({ ...milestoneForm, category: e.target.value })} />
          <Field label="Status" name="status" options={[
            { value: 'planned', label: 'Planned' },
            { value: 'in-progress', label: 'In Progress' },
            { value: 'completed', label: 'Completed' },
          ]} value={milestoneForm.status} onChange={(e) => setMilestoneForm({ ...milestoneForm, status: e.target.value })} />
          <Field label="Target Date" name="targetDate" type="date" value={milestoneForm.targetDate} onChange={(e) => setMilestoneForm({ ...milestoneForm, targetDate: e.target.value })} />
          <div className="sm:col-span-2"><Field label="Description" name="description" textarea value={milestoneForm.description} onChange={(e) => setMilestoneForm({ ...milestoneForm, description: e.target.value })} /></div>
        </div>
      </Modal>

      {/* MATCH MODAL */}
      <Modal open={matchModal.open} onClose={() => setMatchModal({ open: false, mentor: null })} title="Request Mentor Match"
        footer={<><Btn variant="ghost" onClick={() => setMatchModal({ open: false, mentor: null })}>Cancel</Btn><Btn onClick={handleRequestMatch}>Send Request</Btn></>}>
        {matchModal.mentor && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-4">
              <div className="h-12 w-12 overflow-hidden rounded-full bg-violet-100">
                <div className="flex h-full w-full items-center justify-center text-base font-semibold text-violet-700">
                  {matchModal.mentor.name?.[0] ?? '?'}
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">{matchModal.mentor.name}</p>
                <p className="text-xs text-slate-500">{matchModal.mentor.expertise || matchModal.mentor.title}</p>
              </div>
            </div>
            <Field label="Message" name="message" textarea rows={4} value={matchForm.message} onChange={(e) => setMatchForm({ message: e.target.value })} placeholder="Introduce yourself and your child's goals…" />
          </div>
        )}
      </Modal>

      {/* CONFIRM DELETE */}
      <Modal open={confirmDelete.open} onClose={() => setConfirmDelete({ open: false, target: null, type: '' })} title="Confirm Delete" size="sm"
        footer={<><Btn variant="ghost" onClick={() => setConfirmDelete({ open: false, target: null, type: '' })}>Cancel</Btn><Btn variant="danger" onClick={() => {
          if (confirmDelete.type === 'career') handleDeleteCareer();
          if (confirmDelete.type === 'skill') handleDeleteSkill();
          if (confirmDelete.type === 'assessment') handleDeleteAssessment();
          if (confirmDelete.type === 'milestone') handleDeleteMilestone();
        }}>Delete</Btn></>}>
        <p className="text-sm text-slate-600">Are you sure? This action cannot be undone.</p>
      </Modal>
    </PageShell>
  );
};

export default memo(CareerGuidance);