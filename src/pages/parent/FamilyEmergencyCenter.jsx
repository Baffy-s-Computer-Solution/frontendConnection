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
      {error && <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}
      {loading ? <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{Array.from({ length: 8 }).map((_, idx) => <div key={idx} className="h-24 animate-pulse rounded-2xl border border-slate-200 bg-white" />)}</div> : children}
    </div>
  </div>
);

const Btn = ({ children, variant = 'primary', size = 'md', onClick, type = 'button', disabled, loading, className = '' }) => {
  const base = 'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition focus:outline-none focus:ring-2 focus:ring-sky-500/30 disabled:cursor-not-allowed disabled:opacity-60';
  const sizes = { sm: 'px-3 py-1.5 text-xs', md: 'px-4 py-2.5 text-sm', lg: 'px-5 py-3 text-base' };
  const variants = {
    primary: 'bg-sky-600 text-white hover:bg-sky-700',
    secondary: 'bg-slate-100 text-slate-800 hover:bg-slate-200',
    outline: 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50',
    danger: 'bg-red-600 text-white hover:bg-red-700',
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

const Card = ({ title, subtitle, action, children }) => (
  <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
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
        {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
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

const FamilyEmergencyCenter = () => {
  const { user, profile } = useAuth();
  const parentId = user?.uid ?? profile?.uid;
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState({ open: false, editing: null });
  const [form, setForm] = useState({ name: '', relation: 'Parent', phone: '', email: '', location: '', notes: '' });

  useEffect(() => {
    if (!parentId) return;
    const q = query(collection(db, 'family_emergency_contacts'), where('parentId', '==', parentId), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => setContacts(snapshot.docs.map((docSnapshot) => ({ id: docSnapshot.id, ...docSnapshot.data() }))),
      (e) => setError(e.message)
    );
    setLoading(false);
    return () => unsubscribe();
  }, [parentId]);

  const filteredContacts = useMemo(() => contacts.filter((contact) => `${contact.name} ${contact.relation} ${contact.phone}`.toLowerCase().includes(search.toLowerCase())), [contacts, search]);

  const showToast = (message, tone = 'success') => {
    setToast({ message, tone });
    setTimeout(() => setToast(null), 2600);
  };

  const handleSave = async () => {
    try {
      const payload = { ...form, parentId };
      if (modal.editing) {
        await updateDoc(doc(db, 'family_emergency_contacts', modal.editing.id), { ...payload, updatedAt: serverTimestamp() });
        await syncSupabase('family_emergency_contacts', payload, modal.editing.id);
        showToast('Contact updated');
      } else {
        const ref = await addDoc(collection(db, 'family_emergency_contacts'), { ...payload, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
        await syncSupabase('family_emergency_contacts', payload, ref.id);
        showToast('Contact created');
      }
      setModal({ open: false, editing: null });
      setForm({ name: '', relation: 'Parent', phone: '', email: '', location: '', notes: '' });
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, 'family_emergency_contacts', id));
      await supabase?.from('family_emergency_contacts').delete().eq('id', id);
      showToast('Contact removed');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <PageShell title="Emergency Center" subtitle="Keep family safety, important contacts, and response plans ready in one place." loading={loading} error={error} actions={<Btn onClick={() => setModal({ open: true, editing: null })}>Add contact</Btn>}>
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 rounded-xl px-4 py-3 text-sm font-semibold text-white shadow-lg ${toast.tone === 'error' ? 'bg-red-600' : 'bg-emerald-600'}`}>
          {toast.message}
        </div>
      )}

      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><p className="text-xs uppercase tracking-[0.2em] text-slate-500">Contacts</p><p className="mt-2 text-3xl font-bold text-slate-900">{contacts.length}</p></div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><p className="text-xs uppercase tracking-[0.2em] text-sky-600">Primary</p><p className="mt-2 text-3xl font-bold text-sky-900">{contacts.filter((c) => c.relation === 'Parent').length}</p></div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><p className="text-xs uppercase tracking-[0.2em] text-amber-600">Medical</p><p className="mt-2 text-3xl font-bold text-amber-900">{contacts.filter((c) => c.relation === 'Doctor').length}</p></div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><p className="text-xs uppercase tracking-[0.2em] text-emerald-600">Ready</p><p className="mt-2 text-3xl font-bold text-emerald-900">{filteredContacts.length}</p></div>
      </div>

      <div className="mb-6 grid gap-6 xl:grid-cols-2">
        <Card title="Safety checklist" subtitle="Key emergency action plan">
          <div className="space-y-3 text-sm text-slate-600">
            <div className="rounded-xl bg-red-50 px-3 py-2 text-red-700">Emergency contact list reviewed monthly.</div>
            <div className="rounded-xl bg-sky-50 px-3 py-2 text-sky-700">School pickup authorizations updated.</div>
            <div className="rounded-xl bg-emerald-50 px-3 py-2 text-emerald-700">Medical notes and allergy instructions saved.</div>
          </div>
        </Card>

        <Card title="Quick access" subtitle="Search contacts and response details">
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name, relation, or phone" className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-700 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20" />
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        {filteredContacts.length === 0 ? (
          <Card title="No emergency contacts" subtitle="Add a guardian or support contact."><p className="text-sm text-slate-500">Nothing matches your current search.</p></Card>
        ) : (
          filteredContacts.map((contact) => (
            <Card key={contact.id} title={contact.name} subtitle={contact.relation} action={<span className="rounded-full bg-red-100 px-2 py-1 text-[10px] font-bold uppercase text-red-700">Priority</span>}>
              <div className="space-y-3 text-sm text-slate-600">
                <p>{contact.phone}</p>
                <p>{contact.email || 'No email on file'}</p>
                <p>{contact.location || 'No location noted'}</p>
                <p>{contact.notes || 'No special instructions'}</p>
                <div className="flex gap-2">
                  <Btn size="sm" variant="outline" onClick={() => { setForm({ ...contact }); setModal({ open: true, editing: contact }); }}>Edit</Btn>
                  <Btn size="sm" variant="danger" onClick={() => handleDelete(contact.id)}>Delete</Btn>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      <Modal open={modal.open} onClose={() => setModal({ open: false, editing: null })} title={modal.editing ? 'Edit emergency contact' : 'Add emergency contact'} footer={<><Btn variant="secondary" onClick={() => setModal({ open: false, editing: null })}>Cancel</Btn><Btn onClick={handleSave}>Save</Btn></>}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Name" name="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <Field label="Relation" name="relation" value={form.relation} onChange={(e) => setForm({ ...form, relation: e.target.value })} options={[{ value: 'Parent', label: 'Parent' }, { value: 'Guardian', label: 'Guardian' }, { value: 'Doctor', label: 'Doctor' }, { value: 'Relative', label: 'Relative' }, { value: 'Other', label: 'Other' }]} />
          <Field label="Phone" name="phone" type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <Field label="Email" name="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <Field label="Location" name="location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
          <Field label="Notes" name="notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        </div>
      </Modal>
    </PageShell>
  );
};

export default FamilyEmergencyCenter;
