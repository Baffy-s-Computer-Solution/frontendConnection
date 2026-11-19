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
        <div className="space-y-4">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-28 animate-pulse rounded-2xl border border-slate-200 bg-white" />)}</div>
      ) : children}
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

const AcademicCalendar = () => {
  const { user, profile } = useAuth();
  const parentId = user?.uid ?? profile?.uid;

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [modal, setModal] = useState({ open: false, editing: null });
  const [form, setForm] = useState({
    title: '',
    type: 'school',
    eventDate: '',
    startTime: '',
    endTime: '',
    venue: '',
    reminderMinutes: 60,
    allDay: false,
    description: '',
    status: 'scheduled',
  });

  useEffect(() => {
    if (!parentId) return;
    const q = query(collection(db, 'parent_academic_calendar'), where('parentId', '==', parentId), orderBy('eventDate', 'asc'));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setEvents(snapshot.docs.map((docSnapshot) => ({ id: docSnapshot.id, ...docSnapshot.data() })));
        setLoading(false);
      },
      (e) => {
        setError(e.message);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, [parentId]);

  const filteredEvents = events.filter((event) => {
    const matchesType = filterType === 'all' || event.type === filterType;
    const matchesSearch = `${event.title} ${event.description} ${event.venue}`.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  const groupedEvents = useMemo(() => {
    const map = {};
    for (const event of filteredEvents) {
      const day = event.eventDate || 'No date';
      if (!map[day]) map[day] = [];
      map[day].push(event);
    }
    return map;
  }, [filteredEvents]);

  const upcomingHighlights = filteredEvents.slice(0, 4);

  const showToast = (message, tone = 'success') => {
    setToast({ message, tone });
    setTimeout(() => setToast(null), 2500);
  };

  const handleSave = async () => {
    try {
      const payload = { ...form, parentId };
      if (modal.editing) {
        await updateDoc(doc(db, 'parent_academic_calendar', modal.editing.id), { ...payload, updatedAt: serverTimestamp() });
        await syncSupabase('parent_academic_calendar', payload, modal.editing.id);
        showToast('Calendar item updated');
      } else {
        const ref = await addDoc(collection(db, 'parent_academic_calendar'), { ...payload, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
        await syncSupabase('parent_academic_calendar', payload, ref.id);
        showToast('Calendar item added');
      }
      setModal({ open: false, editing: null });
      setForm({
        title: '',
        type: 'school',
        eventDate: '',
        startTime: '',
        endTime: '',
        venue: '',
        reminderMinutes: 60,
        allDay: false,
        description: '',
        status: 'scheduled',
      });
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, 'parent_academic_calendar', id));
      await supabase?.from('parent_academic_calendar').delete().eq('id', id);
      showToast('Calendar item removed');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <PageShell
      title="Academic Calendar"
      subtitle="School dates, assignments, holidays, events, reminders, and family planning in one view."
      loading={loading}
      error={error}
      actions={<Btn onClick={() => setModal({ open: true, editing: null })}>Add event</Btn>}
    >
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 rounded-xl px-4 py-3 text-sm font-semibold text-white shadow-lg ${toast.tone === 'error' ? 'bg-red-600' : 'bg-emerald-600'}`}>
          {toast.message}
        </div>
      )}

      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Events</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{events.length}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase tracking-[0.2em] text-sky-600">School</p>
          <p className="mt-2 text-3xl font-bold text-sky-900">{events.filter((event) => event.type === 'school').length}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase tracking-[0.2em] text-emerald-600">Exams</p>
          <p className="mt-2 text-3xl font-bold text-emerald-900">{events.filter((event) => event.type === 'exam').length}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase tracking-[0.2em] text-amber-600">Reminders</p>
          <p className="mt-2 text-3xl font-bold text-amber-900">{events.filter((event) => event.reminderMinutes).length}</p>
        </div>
      </div>

      <div className="mb-6 grid gap-6 xl:grid-cols-2">
        <Card title="Upcoming highlights" subtitle="Closest family commitments">
          <div className="space-y-3">
            {upcomingHighlights.length === 0 ? <p className="text-sm text-slate-500">No upcoming items.</p> : upcomingHighlights.map((event) => (
              <div key={event.id} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-slate-800">{event.title}</span>
                  <span className="rounded-full bg-sky-100 px-2 py-1 text-[10px] font-bold uppercase text-sky-700">{event.type}</span>
                </div>
                <p className="mt-1 text-xs text-slate-500">{event.eventDate} • {event.venue || 'No venue'}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Planning tools" subtitle="Search and focus by category">
          <div className="space-y-3">
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search events or venue"
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-700 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
            />
            <select value={filterType} onChange={(event) => setFilterType(event.target.value)} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-700 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20">
              <option value="all">All types</option>
              <option value="school">School</option>
              <option value="exam">Exam</option>
              <option value="holiday">Holiday</option>
              <option value="meeting">Meeting</option>
              <option value="event">Event</option>
            </select>
          </div>
        </Card>
      </div>

      <div className="space-y-5">
        {Object.entries(groupedEvents).map(([date, dateEvents]) => (
          <Card key={date} title={date} subtitle={`${dateEvents.length} items scheduled`}>
            <div className="space-y-3">
              {dateEvents.map((event) => (
                <div key={event.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-slate-900">{event.title}</p>
                        <span className="rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-bold uppercase text-sky-700">{event.type}</span>
                      </div>
                      <p className="mt-1 text-xs text-slate-500">{event.startTime || 'All day'}{event.endTime ? ` - ${event.endTime}` : ''} • {event.venue || 'No venue'}</p>
                      <p className="mt-2 text-sm text-slate-600">{event.description}</p>
                    </div>
                    <div className="flex gap-2">
                      <Btn size="sm" variant="outline" onClick={() => { setForm({ ...event }); setModal({ open: true, editing: event }); }}>Edit</Btn>
                      <Btn size="sm" variant="danger" onClick={() => handleDelete(event.id)}>Delete</Btn>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>

      <Modal
        open={modal.open}
        onClose={() => setModal({ open: false, editing: null })}
        title={modal.editing ? 'Edit event' : 'Add school event'}
        footer={
          <>
            <Btn variant="ghost" onClick={() => setModal({ open: false, editing: null })}>Cancel</Btn>
            <Btn onClick={handleSave}>Save</Btn>
          </>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Title" name="title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <Field label="Type" name="type" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} options={[{ value: 'school', label: 'School' }, { value: 'exam', label: 'Exam' }, { value: 'holiday', label: 'Holiday' }, { value: 'meeting', label: 'Meeting' }, { value: 'event', label: 'Event' }]} />
          <Field label="Date" name="eventDate" type="date" value={form.eventDate} onChange={(e) => setForm({ ...form, eventDate: e.target.value })} required />
          <Field label="Reminder (minutes)" name="reminderMinutes" type="number" value={form.reminderMinutes} onChange={(e) => setForm({ ...form, reminderMinutes: Number(e.target.value) })} />
          <Field label="Start time" name="startTime" type="time" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} />
          <Field label="End time" name="endTime" type="time" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} />
          <Field label="Venue" name="venue" value={form.venue} onChange={(e) => setForm({ ...form, venue: e.target.value })} />
          <Field label="Status" name="status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} options={[{ value: 'scheduled', label: 'Scheduled' }, { value: 'confirmed', label: 'Confirmed' }, { value: 'cancelled', label: 'Cancelled' }]} />
          <div className="sm:col-span-2">
            <Field label="Description" name="description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} textarea rows={4} />
          </div>
          <label className="flex items-center gap-2 self-center text-sm text-slate-700 sm:col-span-2">
            <input type="checkbox" checked={form.allDay} onChange={(e) => setForm({ ...form, allDay: e.target.checked })} className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500" />
            All-day event
          </label>
        </div>
      </Modal>
    </PageShell>
  );
};

export default AcademicCalendar;
