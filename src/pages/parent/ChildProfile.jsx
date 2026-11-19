import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { supabase } from '../../config/supabase';
import { useAuth } from '../../hooks/useAuth';

const PageShell = ({ title, subtitle, actions, children, loading, error }) => (
  <div className="min-h-screen bg-slate-50">
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <nav className="mb-2 flex items-center gap-2 text-xs text-slate-500">
            <Link to="/parent/dashboard" className="hover:text-sky-700">Parent</Link>
            <span>/</span>
            <span className="font-medium text-slate-700">{title}</span>
          </nav>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{title}</h1>
          {subtitle && <p className="mt-1 max-w-2xl text-sm text-slate-600">{subtitle}</p>}
        </div>
        <div className="flex flex-wrap items-center gap-2">{actions}</div>
      </header>

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl border border-slate-200 bg-white" />
          ))}
        </div>
      ) : (
        children
      )}
    </div>
  </div>
);

const Btn = ({ children, variant = 'primary', onClick, type = 'button', disabled, size = 'md', className = '', loading }) => {
  const base = 'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition focus:outline-none focus:ring-2 focus:ring-sky-500/30 disabled:cursor-not-allowed disabled:opacity-60';
  const sizes = { sm: 'px-3 py-1.5 text-xs', md: 'px-4 py-2.5 text-sm', lg: 'px-5 py-3 text-base' };
  const variants = {
    primary: 'bg-sky-600 text-white hover:bg-sky-700',
    secondary: 'bg-slate-100 text-slate-800 hover:bg-slate-200',
    danger: 'bg-red-600 text-white hover:bg-red-700',
    outline: 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50',
    success: 'bg-emerald-600 text-white hover:bg-emerald-700',
    ghost: 'bg-transparent text-slate-700 hover:bg-slate-100',
  };

  return (
    <button type={type} disabled={disabled || loading} onClick={onClick} className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}>
      {loading ? (
        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
          <path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm16 0a8 8 0 01-8 8v4c6.627 0 12-5.373 12-12h-4z" fill="currentColor" className="opacity-75" />
        </svg>
      ) : null}
      {children}
    </button>
  );
};

const Card = ({ title, subtitle, action, children, className = '' }) => (
  <section className={`rounded-2xl border border-slate-200 bg-white shadow-sm ${className}`}>
    {(title || action) && (
      <header className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
        <div>
          {title && <h2 className="text-sm font-semibold text-slate-900">{title}</h2>}
          {subtitle && <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>}
        </div>
        {action}
      </header>
    )}
    <div className="p-5">{children}</div>
  </section>
);

const Field = ({ label, name, value, onChange, type = 'text', required, error, textarea, rows = 4, options = [], ...rest }) => (
  <div className="w-full">
    {label && (
      <label htmlFor={name} className="mb-1.5 block text-xs font-semibold text-slate-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
    )}

    {textarea ? (
      <textarea
        id={name}
        name={name}
        value={value ?? ''}
        onChange={onChange}
        rows={rows}
        className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 ${error ? 'border-red-400' : 'border-slate-300'}`}
        {...rest}
      />
    ) : options.length ? (
      <select
        id={name}
        name={name}
        value={value ?? ''}
        onChange={onChange}
        className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 ${error ? 'border-red-400' : 'border-slate-300'}`}
        {...rest}
      >
        <option value="">Select...</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    ) : (
      <input
        id={name}
        name={name}
        type={type}
        value={value ?? ''}
        onChange={onChange}
        className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 ${error ? 'border-red-400' : 'border-slate-300'}`}
        {...rest}
      />
    )}

    {error && <p className="mt-1 text-xs font-medium text-red-600">{error}</p>}
  </div>
);

const Modal = ({ open, onClose, title, children, footer }) => {
  useEffect(() => {
    if (!open) return undefined;
    const handler = (event) => {
      if (event.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
      <div role="dialog" aria-modal="true" className="max-h-[80vh] w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">
        <header className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h3 className="text-base font-semibold text-slate-900">{title}</h3>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100" aria-label="Close">
            ×
          </button>
        </header>
        <div className="max-h-[calc(80vh-130px)] overflow-y-auto p-5">{children}</div>
        {footer && <footer className="flex items-center justify-end gap-2 border-t border-slate-100 bg-slate-50 px-5 py-3">{footer}</footer>}
      </div>
    </div>
  );
};

const syncSupabase = async (table, payload, id) => {
  if (!supabase) return;
  try {
    if (id) {
      const { error } = await supabase.from(table).upsert({ id, ...payload });
      if (error) throw error;
    } else {
      const { error } = await supabase.from(table).insert(payload);
      if (error) throw error;
    }
  } catch (error) {
    console.warn(`[supabase:${table}]`, error.message);
  }
};

const createChildEntry = async (parentId, payload) => {
  const ref = await addDoc(collection(db, 'parent_children'), {
    ...payload,
    parentId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return { id: ref.id, ...payload, parentId };
};

const updateChildEntry = async (id, payload) => {
  await updateDoc(doc(db, 'parent_children', id), {
    ...payload,
    updatedAt: serverTimestamp(),
  });
};

const deleteChildEntry = async (id) => {
  await deleteDoc(doc(db, 'parent_children', id));
};

const ChildProfile = () => {
  const { user, profile } = useAuth();
  const parentId = user?.uid ?? profile?.uid;

  const [children, setChildren] = useState([]);
  const [selectedChildId, setSelectedChildId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);
  const [teacherModal, setTeacherModal] = useState({ open: false, editing: null });
  const [alertModal, setAlertModal] = useState({ open: false, editing: null });
  const [scheduleModal, setScheduleModal] = useState({ open: false, editing: null });
  const [teacherForm, setTeacherForm] = useState({ name: '', role: '', email: '', phone: '', availability: '' });
  const [alertForm, setAlertForm] = useState({ title: '', type: 'medical', detail: '', severity: 'medium' });
  const [scheduleForm, setScheduleForm] = useState({ day: 'Monday', subject: '', time: '', classroom: '', teacher: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [alertFilter, setAlertFilter] = useState('all');
  const [profileForm, setProfileForm] = useState({
    fullName: '',
    grade: '',
    school: '',
    dateOfBirth: '',
    gender: '',
    cohort: '',
    address: '',
    status: 'active',
    avatarUrl: '',
    notes: '',
  });
  const [teachers, setTeachers] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [schedule, setSchedule] = useState([]);

  useEffect(() => {
    if (!parentId) return;

    const q = query(collection(db, 'parent_children'), where('parentId', '==', parentId), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const rows = snapshot.docs.map((docSnapshot) => ({ id: docSnapshot.id, ...docSnapshot.data() }));
        setChildren(rows);
        if (!selectedChildId && rows.length) {
          setSelectedChildId(rows[0].id);
        }
        setLoading(false);
      },
      (e) => {
        setError(e.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [parentId, selectedChildId]);

  const selectedChild = useMemo(
    () => children.find((child) => child.id === selectedChildId) || children[0] || null,
    [children, selectedChildId]
  );

  useEffect(() => {
    if (!selectedChild) return;
    setProfileForm({
      fullName: selectedChild.fullName || '',
      grade: selectedChild.grade || '',
      school: selectedChild.school || '',
      dateOfBirth: selectedChild.dateOfBirth || '',
      gender: selectedChild.gender || '',
      cohort: selectedChild.cohort || '',
      address: selectedChild.address || '',
      status: selectedChild.status || 'active',
      avatarUrl: selectedChild.avatarUrl || '',
      notes: selectedChild.notes || '',
    });

    const teacherQ = query(collection(db, 'parent_child_teachers'), where('parentId', '==', parentId), where('childId', '==', selectedChild.id), orderBy('createdAt', 'desc'));
    const alertQ = query(collection(db, 'parent_child_alerts'), where('parentId', '==', parentId), where('childId', '==', selectedChild.id), orderBy('createdAt', 'desc'));
    const scheduleQ = query(collection(db, 'parent_child_schedule'), where('parentId', '==', parentId), where('childId', '==', selectedChild.id), orderBy('day', 'asc'));

    const teacherUnsub = onSnapshot(teacherQ, (snapshot) => setTeachers(snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }))), (err) => console.warn(err.message));
    const alertUnsub = onSnapshot(alertQ, (snapshot) => setAlerts(snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }))), (err) => console.warn(err.message));
    const scheduleUnsub = onSnapshot(scheduleQ, (snapshot) => setSchedule(snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }))), (err) => console.warn(err.message));

    return () => {
      teacherUnsub();
      alertUnsub();
      scheduleUnsub();
    };
  }, [selectedChild, parentId]);

  const showToast = (message, tone = 'success') => {
    setToast({ message, tone });
    setTimeout(() => setToast(null), 2500);
  };

  const handleSaveChild = async () => {
    if (!selectedChild) return;
    try {
      const payload = { ...profileForm, parentId };
      await updateChildEntry(selectedChild.id, payload);
      await syncSupabase('parent_children', payload, selectedChild.id);
      showToast('Child profile saved');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleCreateChild = async () => {
    if (!parentId) return;
    try {
      const created = await createChildEntry(parentId, {
        fullName: 'New Child',
        grade: 'Grade 1',
        school: 'School name',
        status: 'active',
      });
      setSelectedChildId(created.id);
      showToast('Student profile created');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteChild = async () => {
    if (!selectedChild) return;
    if (!window.confirm('Delete this child profile and linked records?')) return;
    try {
      await deleteChildEntry(selectedChild.id);
      await supabase?.from('parent_children').delete().eq('id', selectedChild.id);
      const next = children.filter((child) => child.id !== selectedChild.id);
      setChildren(next);
      setSelectedChildId(next[0]?.id || '');
      showToast('Child profile deleted');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleSaveTeacher = async () => {
    if (!selectedChild) return;
    try {
      const payload = { ...teacherForm, parentId, childId: selectedChild.id, createdAt: new Date().toISOString() };
      if (teacherModal.editing) {
        await updateDoc(doc(db, 'parent_child_teachers', teacherModal.editing.id), { ...payload, updatedAt: serverTimestamp() });
        await syncSupabase('parent_child_teachers', payload, teacherModal.editing.id);
      } else {
        const ref = await addDoc(collection(db, 'parent_child_teachers'), { ...payload, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
        await syncSupabase('parent_child_teachers', payload, ref.id);
      }
      setTeacherModal({ open: false, editing: null });
      setTeacherForm({ name: '', role: '', email: '', phone: '', availability: '' });
      showToast('Teacher saved');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleSaveAlert = async () => {
    if (!selectedChild) return;
    try {
      const payload = { ...alertForm, parentId, childId: selectedChild.id, createdAt: new Date().toISOString() };
      if (alertModal.editing) {
        await updateDoc(doc(db, 'parent_child_alerts', alertModal.editing.id), { ...payload, updatedAt: serverTimestamp() });
        await syncSupabase('parent_child_alerts', payload, alertModal.editing.id);
      } else {
        const ref = await addDoc(collection(db, 'parent_child_alerts'), { ...payload, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
        await syncSupabase('parent_child_alerts', payload, ref.id);
      }
      setAlertModal({ open: false, editing: null });
      setAlertForm({ title: '', type: 'medical', detail: '', severity: 'medium' });
      showToast('Alert saved');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleSaveSchedule = async () => {
    if (!selectedChild) return;
    try {
      const payload = { ...scheduleForm, parentId, childId: selectedChild.id, createdAt: new Date().toISOString() };
      if (scheduleModal.editing) {
        await updateDoc(doc(db, 'parent_child_schedule', scheduleModal.editing.id), { ...payload, updatedAt: serverTimestamp() });
        await syncSupabase('parent_child_schedule', payload, scheduleModal.editing.id);
      } else {
        const ref = await addDoc(collection(db, 'parent_child_schedule'), { ...payload, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
        await syncSupabase('parent_child_schedule', payload, ref.id);
      }
      setScheduleModal({ open: false, editing: null });
      setScheduleForm({ day: 'Monday', subject: '', time: '', classroom: '', teacher: '' });
      showToast('Schedule item saved');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteTeacher = async (id) => {
    try {
      await deleteDoc(doc(db, 'parent_child_teachers', id));
      await supabase?.from('parent_child_teachers').delete().eq('id', id);
      showToast('Teacher removed');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteAlert = async (id) => {
    try {
      await deleteDoc(doc(db, 'parent_child_alerts', id));
      await supabase?.from('parent_child_alerts').delete().eq('id', id);
      showToast('Alert removed');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteSchedule = async (id) => {
    try {
      await deleteDoc(doc(db, 'parent_child_schedule', id));
      await supabase?.from('parent_child_schedule').delete().eq('id', id);
      showToast('Schedule removed');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const filteredTeachers = teachers.filter((teacher) => {
    const haystack = `${teacher.name} ${teacher.role} ${teacher.email}`.toLowerCase();
    return haystack.includes(searchTerm.toLowerCase());
  });

  const filteredAlerts = alerts.filter((alert) => {
    const matchesSearch = `${alert.title} ${alert.type} ${alert.detail}`.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = alertFilter === 'all' || alert.severity === alertFilter || alert.type === alertFilter;
    return matchesSearch && matchesFilter;
  });

  const completionScore = Math.min(100, Math.round((teachers.length * 12 + alerts.length * 8 + schedule.length * 10) / 3));
  const actionQueue = [
    { label: 'Review report card', active: true },
    { label: 'Confirm parent meeting', active: true },
    { label: 'Check medication plan', active: alerts.some((alert) => alert.type === 'medical') },
    { label: 'Update school contact', active: teachers.length > 0 },
  ];

  return (
    <PageShell
      title="Child Profile"
      subtitle="Track each child’s academic, health, schedule, and teacher details in one place."
      loading={loading}
      error={error}
      actions={
        <>
          <Btn variant="outline" size="sm" onClick={handleCreateChild}>Add child</Btn>
          <Btn size="sm" onClick={handleSaveChild}>Save profile</Btn>
        </>
      }
    >
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 rounded-xl px-4 py-3 text-sm font-semibold text-white shadow-lg ${toast.tone === 'error' ? 'bg-red-600' : 'bg-emerald-600'}`}>
          {toast.message}
        </div>
      )}

      {selectedChild ? (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-sky-500 to-indigo-600 text-xl font-bold text-white ring-4 ring-slate-100">
                  {profileForm.fullName ? profileForm.fullName.charAt(0).toUpperCase() : 'C'}
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-sky-700">Selected child</p>
                  <h2 className="text-xl font-bold text-slate-900">{profileForm.fullName || 'Unnamed Child'}</h2>
                  <p className="text-sm text-slate-500">{profileForm.grade || 'Grade not set'} • {profileForm.school || 'School not set'}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {children.map((child) => (
                  <button
                    key={child.id}
                    type="button"
                    onClick={() => setSelectedChildId(child.id)}
                    className={`rounded-xl px-3 py-2 text-xs font-semibold ${selectedChild.id === child.id ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-700'}`}
                  >
                    {child.fullName || 'Child'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-5 xl:grid-cols-[1.7fr_1fr]">
            <Card title="Student Information" subtitle="Academic and personal details">
              <div className="mb-5 grid gap-3 md:grid-cols-4">
                <div className="rounded-xl bg-sky-50 p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-sky-700">Progress</p>
                  <p className="mt-2 text-2xl font-bold text-sky-900">{completionScore}%</p>
                </div>
                <div className="rounded-xl bg-emerald-50 p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-700">Attendance</p>
                  <p className="mt-2 text-2xl font-bold text-emerald-900">96%</p>
                </div>
                <div className="rounded-xl bg-violet-50 p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-violet-700">Teachers</p>
                  <p className="mt-2 text-2xl font-bold text-violet-900">{teachers.length}</p>
                </div>
                <div className="rounded-xl bg-amber-50 p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-700">Alerts</p>
                  <p className="mt-2 text-2xl font-bold text-amber-900">{alerts.length}</p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Full name" name="fullName" value={profileForm.fullName} onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })} />
                <Field label="Grade" name="grade" value={profileForm.grade} onChange={(e) => setProfileForm({ ...profileForm, grade: e.target.value })} />
                <Field label="School" name="school" value={profileForm.school} onChange={(e) => setProfileForm({ ...profileForm, school: e.target.value })} />
                <Field label="Cohort" name="cohort" value={profileForm.cohort} onChange={(e) => setProfileForm({ ...profileForm, cohort: e.target.value })} />
                <Field label="Date of birth" name="dateOfBirth" type="date" value={profileForm.dateOfBirth} onChange={(e) => setProfileForm({ ...profileForm, dateOfBirth: e.target.value })} />
                <Field label="Gender" name="gender" value={profileForm.gender} onChange={(e) => setProfileForm({ ...profileForm, gender: e.target.value })} options={[{ value: 'female', label: 'Female' }, { value: 'male', label: 'Male' }, { value: 'other', label: 'Other' }]} />
                <Field label="Address" name="address" value={profileForm.address} onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })} className="md:col-span-2" />
                <Field label="Status" name="status" value={profileForm.status} onChange={(e) => setProfileForm({ ...profileForm, status: e.target.value })} options={[{ value: 'active', label: 'Active' }, { value: 'on-leave', label: 'On Leave' }, { value: 'graduate', label: 'Graduate' }, { value: 'at-risk', label: 'At Risk' }]} />
                <Field label="Avatar URL" name="avatarUrl" value={profileForm.avatarUrl} onChange={(e) => setProfileForm({ ...profileForm, avatarUrl: e.target.value })} />
              </div>

              <div className="mt-4">
                <Field label="Notes" name="notes" value={profileForm.notes} onChange={(e) => setProfileForm({ ...profileForm, notes: e.target.value })} textarea rows={4} />
              </div>
            </Card>

            <Card title="Quick Summary" subtitle="Key metrics">
              <div className="space-y-4">
                <div className="rounded-xl bg-sky-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-sky-700">Attendance</p>
                  <p className="mt-1 text-3xl font-bold text-sky-900">96%</p>
                </div>
                <div className="rounded-xl bg-emerald-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Average grade</p>
                  <p className="mt-1 text-3xl font-bold text-emerald-900">B+</p>
                </div>
                <div className="rounded-xl bg-violet-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-violet-700">Teacher count</p>
                  <p className="mt-1 text-3xl font-bold text-violet-900">{teachers.length}</p>
                </div>
                <div className="rounded-xl bg-amber-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">Open alerts</p>
                  <p className="mt-1 text-3xl font-bold text-amber-900">{alerts.filter((alert) => alert.severity !== 'closed').length}</p>
                </div>
              </div>
            </Card>
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <Card title="Action center" subtitle="Priority items needing attention">
              <div className="space-y-3">
                {actionQueue.map((item) => (
                  <div key={item.label} className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                    <span className="text-sm text-slate-700">{item.label}</span>
                    <span className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase ${item.active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>
                      {item.active ? 'Ready' : 'Pending'}
                    </span>
                  </div>
                ))}
              </div>
            </Card>

            <Card title="Family readiness" subtitle="Current support status">
              <div className="space-y-4">
                <div>
                  <div className="mb-1 flex items-center justify-between text-xs text-slate-600">
                    <span>Profile completeness</span>
                    <span>{completionScore}%</span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-slate-200">
                    <div className="h-full rounded-full bg-gradient-to-r from-sky-500 to-indigo-600" style={{ width: `${completionScore}%` }} />
                  </div>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
                  <p className="font-semibold text-slate-800">Next milestone</p>
                  <p className="mt-1">Parent-teacher review scheduled for Friday at 3:00 PM.</p>
                </div>
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card
              title="Teachers & Mentors"
              subtitle="Academic support and communication"
              action={<Btn size="sm" variant="outline" onClick={() => setTeacherModal({ open: true, editing: null })}>Add teacher</Btn>}
            >
              {teachers.length === 0 ? (
                <p className="text-sm text-slate-500">No teachers added yet.</p>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {teachers.map((teacher) => (
                    <div key={teacher.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="text-sm font-semibold text-slate-900">{teacher.name}</h3>
                          <p className="text-xs text-slate-500">{teacher.role}</p>
                        </div>
                        <span className="rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-bold uppercase text-sky-700">{teacher.availability || 'Available'}</span>
                      </div>
                      <div className="mt-3 space-y-1 text-xs text-slate-600">
                        {teacher.email && <p>{teacher.email}</p>}
                        {teacher.phone && <p>{teacher.phone}</p>}
                      </div>
                      <div className="mt-4 flex justify-end gap-2">
                        <Btn size="sm" variant="outline" onClick={() => { setTeacherForm({ ...teacher }); setTeacherModal({ open: true, editing: teacher }); }}>Edit</Btn>
                        <Btn size="sm" variant="danger" onClick={() => handleDeleteTeacher(teacher.id)}>Delete</Btn>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <Card
              title="School Schedule"
              subtitle="Class timetable and subjects"
              action={<Btn size="sm" variant="outline" onClick={() => setScheduleModal({ open: true, editing: null })}>Add slot</Btn>}
            >
              {schedule.length === 0 ? (
                <p className="text-sm text-slate-500">No timetable items added yet.</p>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {schedule.map((item) => (
                    <div key={item.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{item.subject}</p>
                          <p className="text-xs text-slate-500">{item.day}</p>
                        </div>
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-700">{item.time}</span>
                      </div>
                      <div className="mt-3 text-xs text-slate-600">
                        {item.classroom && <p>Room: {item.classroom}</p>}
                        {item.teacher && <p>Teacher: {item.teacher}</p>}
                      </div>
                      <div className="mt-4 flex justify-end gap-2">
                        <Btn size="sm" variant="outline" onClick={() => { setScheduleForm({ ...item }); setScheduleModal({ open: true, editing: item }); }}>Edit</Btn>
                        <Btn size="sm" variant="danger" onClick={() => handleDeleteSchedule(item.id)}>Delete</Btn>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <Card
              title="Alerts & Notes"
              subtitle="Health, wellbeing, and school alerts"
              action={<Btn size="sm" variant="outline" onClick={() => setAlertModal({ open: true, editing: null })}>Add alert</Btn>}
            >
              {alerts.length === 0 ? (
                <p className="text-sm text-slate-500">No alerts recorded.</p>
              ) : (
                <ul className="space-y-3">
                  {alerts.map((alert) => (
                    <li key={alert.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{alert.title}</p>
                          <p className="text-xs text-slate-500">{alert.type} • {alert.severity}</p>
                        </div>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${alert.severity === 'high' ? 'bg-red-100 text-red-700' : alert.severity === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                          {alert.severity}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-slate-600">{alert.detail}</p>
                      <div className="mt-4 flex justify-end">
                        <Btn size="sm" variant="danger" onClick={() => handleDeleteAlert(alert.id)}>Delete</Btn>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>
        </div>
      ) : (
        <Card title="No child profile yet">
          <p className="text-sm text-slate-500">Create a child profile to start tracking academic and wellbeing information.</p>
          <div className="mt-4">
            <Btn onClick={handleCreateChild}>Create child profile</Btn>
          </div>
        </Card>
      )}

      <Modal
        open={teacherModal.open}
        onClose={() => setTeacherModal({ open: false, editing: null })}
        title={teacherModal.editing ? 'Edit teacher' : 'Add teacher'}
        footer={
          <>
            <Btn variant="ghost" onClick={() => setTeacherModal({ open: false, editing: null })}>Cancel</Btn>
            <Btn onClick={handleSaveTeacher}>Save</Btn>
          </>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Name" name="name" value={teacherForm.name} onChange={(e) => setTeacherForm({ ...teacherForm, name: e.target.value })} required />
          <Field label="Role" name="role" value={teacherForm.role} onChange={(e) => setTeacherForm({ ...teacherForm, role: e.target.value })} required />
          <Field label="Email" name="email" type="email" value={teacherForm.email} onChange={(e) => setTeacherForm({ ...teacherForm, email: e.target.value })} />
          <Field label="Phone" name="phone" type="tel" value={teacherForm.phone} onChange={(e) => setTeacherForm({ ...teacherForm, phone: e.target.value })} />
          <div className="sm:col-span-2">
            <Field label="Availability" name="availability" value={teacherForm.availability} onChange={(e) => setTeacherForm({ ...teacherForm, availability: e.target.value })} />
          </div>
        </div>
      </Modal>

      <Modal
        open={alertModal.open}
        onClose={() => setAlertModal({ open: false, editing: null })}
        title={alertModal.editing ? 'Edit alert' : 'Add alert'}
        footer={
          <>
            <Btn variant="ghost" onClick={() => setAlertModal({ open: false, editing: null })}>Cancel</Btn>
            <Btn onClick={handleSaveAlert}>Save</Btn>
          </>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Title" name="title" value={alertForm.title} onChange={(e) => setAlertForm({ ...alertForm, title: e.target.value })} required />
          <Field label="Type" name="type" value={alertForm.type} onChange={(e) => setAlertForm({ ...alertForm, type: e.target.value })} options={[{ value: 'medical', label: 'Medical' }, { value: 'academic', label: 'Academic' }, { value: 'wellbeing', label: 'Wellbeing' }, { value: 'behavior', label: 'Behavior' }]} />
          <Field label="Severity" name="severity" value={alertForm.severity} onChange={(e) => setAlertForm({ ...alertForm, severity: e.target.value })} options={[{ value: 'low', label: 'Low' }, { value: 'medium', label: 'Medium' }, { value: 'high', label: 'High' }]} />
          <div className="sm:col-span-2">
            <Field label="Details" name="detail" value={alertForm.detail} onChange={(e) => setAlertForm({ ...alertForm, detail: e.target.value })} textarea rows={4} />
          </div>
        </div>
      </Modal>

      <Modal
        open={scheduleModal.open}
        onClose={() => setScheduleModal({ open: false, editing: null })}
        title={scheduleModal.editing ? 'Edit schedule item' : 'Add schedule item'}
        footer={
          <>
            <Btn variant="ghost" onClick={() => setScheduleModal({ open: false, editing: null })}>Cancel</Btn>
            <Btn onClick={handleSaveSchedule}>Save</Btn>
          </>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Day" name="day" value={scheduleForm.day} onChange={(e) => setScheduleForm({ ...scheduleForm, day: e.target.value })} options={[{ value: 'Monday', label: 'Monday' }, { value: 'Tuesday', label: 'Tuesday' }, { value: 'Wednesday', label: 'Wednesday' }, { value: 'Thursday', label: 'Thursday' }, { value: 'Friday', label: 'Friday' }, { value: 'Saturday', label: 'Saturday' }, { value: 'Sunday', label: 'Sunday' }]} />
          <Field label="Subject" name="subject" value={scheduleForm.subject} onChange={(e) => setScheduleForm({ ...scheduleForm, subject: e.target.value })} required />
          <Field label="Time" name="time" value={scheduleForm.time} onChange={(e) => setScheduleForm({ ...scheduleForm, time: e.target.value })} />
          <Field label="Classroom" name="classroom" value={scheduleForm.classroom} onChange={(e) => setScheduleForm({ ...scheduleForm, classroom: e.target.value })} />
          <div className="sm:col-span-2">
            <Field label="Teacher" name="teacher" value={scheduleForm.teacher} onChange={(e) => setScheduleForm({ ...scheduleForm, teacher: e.target.value })} />
          </div>
        </div>
      </Modal>
    </PageShell>
  );
};

export default ChildProfile;
