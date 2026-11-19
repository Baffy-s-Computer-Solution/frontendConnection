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
        <div className="flex items-center gap-2">{actions}</div>
      </header>

      {error && <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="h-24 animate-pulse rounded-2xl border border-slate-200 bg-white" />
          ))}
        </div>
      ) : (
        children
      )}
    </div>
  </div>
);

const Btn = ({ children, variant = 'primary', size = 'md', onClick, type = 'button', disabled, loading, className = '' }) => {
  const base = 'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition focus:outline-none focus:ring-2 focus:ring-sky-500/30 disabled:cursor-not-allowed disabled:opacity-60';
  const sizes = { sm: 'px-3 py-1.5 text-xs', md: 'px-4 py-2.5 text-sm', lg: 'px-5 py-3 text-base' };
  const variants = {
    primary: 'bg-sky-600 text-white hover:bg-sky-700',
    secondary: 'bg-slate-100 text-slate-800 hover:bg-slate-200',
    danger: 'bg-red-600 text-white hover:bg-red-700',
    outline: 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50',
    success: 'bg-emerald-600 text-white hover:bg-emerald-700',
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
      <textarea id={name} name={name} value={value ?? ''} onChange={onChange} rows={rows} className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 ${error ? 'border-red-400' : 'border-slate-300'}`} {...rest} />
    ) : options.length ? (
      <select id={name} name={name} value={value ?? ''} onChange={onChange} className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 ${error ? 'border-red-400' : 'border-slate-300'}`} {...rest}>
        <option value="">Select...</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    ) : (
      <input id={name} name={name} type={type} value={value ?? ''} onChange={onChange} className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 ${error ? 'border-red-400' : 'border-slate-300'}`} {...rest} />
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
      <div role="dialog" aria-modal="true" className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">
        <header className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h3 className="text-base font-semibold text-slate-900">{title}</h3>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100" aria-label="Close">×</button>
        </header>
        <div className="max-h-[75vh] overflow-y-auto p-5">{children}</div>
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

const ParentHealthRecords = () => {
  const { user, profile } = useAuth();
  const parentId = user?.uid ?? profile?.uid;

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [modal, setModal] = useState({ open: false, editing: null });
  const [form, setForm] = useState({
    type: 'immunization',
    title: '',
    childName: '',
    provider: '',
    recordedDate: '',
    nextDueDate: '',
    status: 'scheduled',
    notes: '',
    severity: 'low',
  });

  useEffect(() => {
    if (!parentId) return;

    const q = query(collection(db, 'parent_health_records'), where('parentId', '==', parentId), orderBy('recordedDate', 'desc'));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setRecords(snapshot.docs.map((docSnapshot) => ({ id: docSnapshot.id, ...docSnapshot.data() })));
        setLoading(false);
      },
      (e) => {
        setError(e.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [parentId]);

  const showToast = (message, tone = 'success') => {
    setToast({ message, tone });
    setTimeout(() => setToast(null), 2600);
  };

  const stats = useMemo(() => {
    const total = records.length;
    const immunization = records.filter((record) => record.type === 'immunization').length;
    const allergies = records.filter((record) => record.type === 'allergy').length;
    const medications = records.filter((record) => record.type === 'medication').length;
    const dueSoon = records.filter((record) => record.nextDueDate && new Date(record.nextDueDate) > new Date()).length;
    return { total, immunization, allergies, medications, dueSoon };
  }, [records]);

  const visibleRecords = activeTab === 'all' ? records : records.filter((record) => record.type === activeTab);
  const filteredRecords = visibleRecords.filter((record) => {
    const query = searchTerm.toLowerCase();
    return `${record.title} ${record.childName} ${record.provider} ${record.type}`.toLowerCase().includes(query);
  });
  const urgentCases = records.filter((record) => record.severity === 'high').length;
  const followUps = records.filter((record) => record.nextDueDate && new Date(record.nextDueDate) >= new Date()).length;
  const nextChecklist = [
    'Follow-up with family doctor',
    'Update allergy emergency plan',
    'Confirm vaccination schedule',
    'Review medication dosage',
  ];

  const handleSave = async () => {
    try {
      const payload = { ...form, parentId };
      if (modal.editing) {
        await updateDoc(doc(db, 'parent_health_records', modal.editing.id), { ...payload, updatedAt: serverTimestamp() });
        await syncSupabase('parent_health_records', payload, modal.editing.id);
        showToast('Health record updated');
      } else {
        const ref = await addDoc(collection(db, 'parent_health_records'), { ...payload, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
        await syncSupabase('parent_health_records', payload, ref.id);
        showToast('Health record added');
      }
      setModal({ open: false, editing: null });
      setForm({
        type: 'immunization',
        title: '',
        childName: '',
        provider: '',
        recordedDate: '',
        nextDueDate: '',
        status: 'scheduled',
        notes: '',
        severity: 'low',
      });
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, 'parent_health_records', id));
      await supabase?.from('parent_health_records').delete().eq('id', id);
      showToast('Record deleted');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <PageShell
      title="Health Records"
      subtitle="Track immunizations, allergies, medical visits, medication plans, and vital care details."
      loading={loading}
      error={error}
      actions={<Btn onClick={() => setModal({ open: true, editing: null })}>Add record</Btn>}
    >
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 rounded-xl px-4 py-3 text-sm font-semibold text-white shadow-lg ${toast.tone === 'error' ? 'bg-red-600' : 'bg-emerald-600'}`}>
          {toast.message}
        </div>
      )}

      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Total</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{stats.total}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase tracking-[0.2em] text-emerald-600">Immunizations</p>
          <p className="mt-2 text-3xl font-bold text-emerald-900">{stats.immunization}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase tracking-[0.2em] text-amber-600">Allergies</p>
          <p className="mt-2 text-3xl font-bold text-amber-900">{stats.allergies}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase tracking-[0.2em] text-sky-600">Due soon</p>
          <p className="mt-2 text-3xl font-bold text-sky-900">{stats.dueSoon}</p>
        </div>
      </div>

      <div className="mb-6 grid gap-6 xl:grid-cols-2">
        <Card title="Priority view" subtitle="Health action queue">
          <div className="space-y-3">
            <div className="rounded-xl bg-red-50 p-3 text-sm text-red-700">Urgent cases: {urgentCases}</div>
            <div className="rounded-xl bg-sky-50 p-3 text-sm text-sky-700">Follow-ups scheduled: {followUps}</div>
            <div className="rounded-xl bg-amber-50 p-3 text-sm text-amber-700">Insurance review due this month</div>
          </div>
        </Card>

        <Card title="Checklist" subtitle="Recommended next actions">
          <div className="space-y-2">
            {nextChecklist.map((item) => (
              <div key={item} className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                <span>{item}</span>
                <span className="rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-bold uppercase text-emerald-700">On track</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-2">
          {['all', 'immunization', 'allergy', 'medication', 'visit', 'insurance'].map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`rounded-xl px-3 py-2 text-xs font-semibold ${activeTab === tab ? 'bg-slate-900 text-white' : 'bg-white text-slate-700 ring-1 ring-slate-200'}`}
            >
              {tab === 'all' ? 'All records' : tab}
            </button>
          ))}
        </div>
        <input
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder="Search by title, child, provider"
          className="w-full max-w-md rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-700 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
        />
      </div>

      <Card title="Medical Vault" subtitle="Secure, searchable health records">
        {filteredRecords.length === 0 ? (
          <p className="text-sm text-slate-500">No health records yet. Add a medical note to get started.</p>
        ) : (
          <div className="space-y-4">
            {filteredRecords.map((record) => (
              <div key={record.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-slate-900">{record.title}</p>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${record.severity === 'high' ? 'bg-red-100 text-red-700' : record.severity === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                        {record.severity}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">{record.type} • {record.childName || 'Child'} • {record.provider || 'Provider not set'}</p>
                    <p className="mt-2 text-sm text-slate-600">{record.notes}</p>
                  </div>
                  <div className="flex gap-2">
                    <Btn size="sm" variant="outline" onClick={() => { setForm({ ...record }); setModal({ open: true, editing: record }); }}>Edit</Btn>
                    <Btn size="sm" variant="danger" onClick={() => handleDelete(record.id)}>Delete</Btn>
                  </div>
                </div>

                <div className="mt-3 grid gap-3 sm:grid-cols-3 text-xs text-slate-600">
                  <div className="rounded-xl bg-white p-3">
                    <p className="font-semibold text-slate-700">Recorded</p>
                    <p className="mt-1">{record.recordedDate || 'Not set'}</p>
                  </div>
                  <div className="rounded-xl bg-white p-3">
                    <p className="font-semibold text-slate-700">Next due</p>
                    <p className="mt-1">{record.nextDueDate || 'Not set'}</p>
                  </div>
                  <div className="rounded-xl bg-white p-3">
                    <p className="font-semibold text-slate-700">Status</p>
                    <p className="mt-1 capitalize">{record.status || 'scheduled'}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Modal
        open={modal.open}
        onClose={() => setModal({ open: false, editing: null })}
        title={modal.editing ? 'Edit record' : 'Add health record'}
        footer={
          <>
            <Btn variant="ghost" onClick={() => setModal({ open: false, editing: null })}>Cancel</Btn>
            <Btn onClick={handleSave}>Save</Btn>
          </>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Type" name="type" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} options={[{ value: 'immunization', label: 'Immunization' }, { value: 'allergy', label: 'Allergy' }, { value: 'medication', label: 'Medication' }, { value: 'visit', label: 'Doctor visit' }, { value: 'insurance', label: 'Insurance' }]} />
          <Field label="Title" name="title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <Field label="Child name" name="childName" value={form.childName} onChange={(e) => setForm({ ...form, childName: e.target.value })} />
          <Field label="Provider" name="provider" value={form.provider} onChange={(e) => setForm({ ...form, provider: e.target.value })} />
          <Field label="Recorded date" name="recordedDate" type="date" value={form.recordedDate} onChange={(e) => setForm({ ...form, recordedDate: e.target.value })} />
          <Field label="Next due date" name="nextDueDate" type="date" value={form.nextDueDate} onChange={(e) => setForm({ ...form, nextDueDate: e.target.value })} />
          <Field label="Status" name="status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} options={[{ value: 'scheduled', label: 'Scheduled' }, { value: 'complete', label: 'Complete' }, { value: 'pending', label: 'Pending' }, { value: 'follow-up', label: 'Follow-up' }]} />
          <Field label="Severity" name="severity" value={form.severity} onChange={(e) => setForm({ ...form, severity: e.target.value })} options={[{ value: 'low', label: 'Low' }, { value: 'medium', label: 'Medium' }, { value: 'high', label: 'High' }]} />
          <div className="sm:col-span-2">
            <Field label="Notes" name="notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} textarea rows={4} />
          </div>
        </div>
      </Modal>
    </PageShell>
  );
};

export default ParentHealthRecords;
