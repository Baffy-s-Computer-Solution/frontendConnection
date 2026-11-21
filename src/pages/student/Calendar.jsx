import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CalendarDays, ChevronLeft, ChevronRight, Clock3, Plus, Trash2, Pencil, X } from 'lucide-react';

import { useAuth } from '../../context/AuthContext';
import {
  deleteStudentCalendarEvent,
  saveStudentCalendarEvent,
  subscribeToStudentApplications,
  subscribeToStudentCalendarEvents,
  subscribeToActiveJobs,
} from '../../services/studentServices';
import { subscribeToStudentMentorshipData } from '../../services/studentMentorshipService';

const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const asDate = (value) => {
  if (!value) return null;
  const date = value?.toDate ? value.toDate() : value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const toLocalInput = (date) => {
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
};

const newEventForm = (event) => ({
  title: event?.title || '',
  startAt: toLocalInput(event?.startAt || new Date()),
  description: event?.description || '',
});

const Calendar = () => {
  const { currentUser } = useAuth();
  const uid = currentUser?.uid;
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [personalEvents, setPersonalEvents] = useState([]);
  const [month, setMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState('');
  const [eventForm, setEventForm] = useState(() => newEventForm());
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    const onError = (loadError) => setError(loadError.message || 'Unable to load your schedule.');
    const stopJobs = subscribeToActiveJobs(setJobs, onError);
    const stopApplications = uid ? subscribeToStudentApplications(uid, setApplications, onError) : () => {};
    const stopSessions = uid ? subscribeToStudentMentorshipData(uid, ({ sessions: records }) => setSessions(records), onError) : () => {};
    const stopPersonalEvents = uid ? subscribeToStudentCalendarEvents(uid, setPersonalEvents, onError) : () => {};
    return () => {
      stopJobs();
      stopApplications();
      stopSessions();
      stopPersonalEvents();
    };
  }, [uid]);

  useEffect(() => {
    const title = searchParams.get('title');
    const dateValue = searchParams.get('date');
    if (!title || !dateValue) return;

    const date = asDate(dateValue);
    if (date) {
      setEventForm({ title, startAt: toLocalInput(date), description: 'Reminder for an opportunity deadline.' });
      setEditingId('');
      setFormOpen(true);
    }
    setSearchParams({}, { replace: true });
  }, [searchParams, setSearchParams]);

  const events = useMemo(() => {
    const records = personalEvents.map((event) => ({
      ...event,
      date: asDate(event.startAt),
      type: 'personal',
      detail: event.description || 'Personal event',
      editable: true,
    }));

    jobs.filter((job) => job.deadline).forEach((job) => records.push({
      id: `deadline-${job.id}`,
      title: job.title || 'Opportunity deadline',
      detail: job.companyName || job.company || '',
      date: asDate(job.deadline),
      type: 'deadline',
      editable: false,
    }));
    sessions.filter((item) => item.scheduledAt || item.sessionDate).forEach((item) => records.push({
      id: `session-${item.id}`,
      title: item.topic || item.title || 'Mentorship session',
      detail: item.mentorName || '',
      date: asDate(item.scheduledAt || item.sessionDate),
      type: 'mentorship',
      editable: false,
    }));
    applications.filter((item) => item.interviewAt || item.interviewDate).forEach((item) => records.push({
      id: `interview-${item.id}`,
      title: `Interview: ${item.jobTitle || item.jobName || 'Application'}`,
      detail: item.companyName || '',
      date: asDate(item.interviewAt || item.interviewDate),
      type: 'interview',
      editable: false,
    }));

    return records.filter((item) => item.date).sort((left, right) => left.date - right.date);
  }, [applications, jobs, personalEvents, sessions]);

  const firstDayOfMonth = new Date(month.getFullYear(), month.getMonth(), 1).getDay();
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const upcomingEvents = events.filter((event) => event.date >= new Date(new Date().setHours(0, 0, 0, 0))).slice(0, 8);

  const startNewEvent = () => {
    setEditingId('');
    setEventForm(newEventForm());
    setError('');
    setNotice('');
    setFormOpen(true);
  };

  const startEditing = (event) => {
    setEditingId(event.id);
    setEventForm(newEventForm(event));
    setError('');
    setNotice('');
    setFormOpen(true);
  };

  const saveEvent = async (submitEvent) => {
    submitEvent.preventDefault();
    setSaving(true);
    setError('');
    setNotice('');
    const result = await saveStudentCalendarEvent(uid, {
      ...eventForm,
      startAt: new Date(eventForm.startAt),
    }, editingId || null);
    setSaving(false);
    if (!result.success) {
      setError(result.error || 'Unable to save this event.');
      return;
    }
    setFormOpen(false);
    setEditingId('');
    setNotice(editingId ? 'Calendar event updated.' : 'Calendar event created.');
    navigate('/student/calendar', { replace: true });
  };

  const removeEvent = async (event) => {
    if (!window.confirm(`Delete "${event.title}" from your calendar?`)) return;
    setDeletingId(event.id);
    setError('');
    const result = await deleteStudentCalendarEvent(uid, event.id);
    setDeletingId('');
    if (!result.success) {
      setError(result.error || 'Unable to delete this event.');
      return;
    }
    setNotice('Calendar event deleted.');
  };

  const monthLabel = month.toLocaleString(undefined, { month: 'long', year: 'numeric' });

  return (
    <main className="mx-auto w-full max-w-7xl space-y-5 px-4 py-6 sm:px-6 lg:px-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-brand-700 dark:text-brand-300">Your schedule</p>
          <h1 className="mt-1 text-2xl font-semibold text-slate-900 dark:text-white">Calendar</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Manage personal events and see live opportunity deadlines, interviews, and mentorship sessions.</p>
        </div>
        <button type="button" onClick={startNewEvent} className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700">
          <Plus className="h-4 w-4" aria-hidden="true" /> Add event
        </button>
      </header>

      {error && <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200">{error}</p>}
      {notice && <p role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200">{notice}</p>}

      {formOpen && (
        <form onSubmit={saveEvent} className="space-y-4 rounded-xl border border-brand-200 bg-white p-5 shadow-card dark:border-brand-900 dark:bg-slate-900">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{editingId ? 'Edit calendar event' : 'Add a calendar event'}</h2>
            <button type="button" onClick={() => setFormOpen(false)} aria-label="Close event form" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"><X className="h-4 w-4" /></button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Event title
              <input required maxLength={120} value={eventForm.title} onChange={(event) => setEventForm((current) => ({ ...current, title: event.target.value }))} className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
            </label>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Date and time
              <input required type="datetime-local" value={eventForm.startAt} onChange={(event) => setEventForm((current) => ({ ...current, startAt: event.target.value }))} className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
            </label>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200 sm:col-span-2">Notes
              <textarea rows={3} maxLength={1000} value={eventForm.description} onChange={(event) => setEventForm((current) => ({ ...current, description: event.target.value }))} className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
            </label>
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setFormOpen(false)} className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-200">Cancel</button>
            <button type="submit" disabled={saving} className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">{saving ? 'Saving…' : editingId ? 'Save changes' : 'Create event'}</button>
          </div>
        </form>
      )}

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(18rem,1fr)]">
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-card dark:border-slate-700 dark:bg-slate-900">
          <div className="mb-5 flex items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-white"><CalendarDays className="h-5 w-5 text-brand-600" />{monthLabel}</h2>
            <div className="flex items-center gap-1">
              <button type="button" aria-label="Previous month" onClick={() => setMonth((date) => new Date(date.getFullYear(), date.getMonth() - 1, 1))} className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"><ChevronLeft className="h-4 w-4" /></button>
              <button type="button" onClick={() => { const today = new Date(); setMonth(new Date(today.getFullYear(), today.getMonth(), 1)); }} className="rounded-lg px-3 py-2 text-xs font-semibold text-brand-700 hover:bg-brand-50 dark:text-brand-300 dark:hover:bg-brand-950">Today</button>
              <button type="button" aria-label="Next month" onClick={() => setMonth((date) => new Date(date.getFullYear(), date.getMonth() + 1, 1))} className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"><ChevronRight className="h-4 w-4" /></button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center">
            {daysOfWeek.map((day) => <div key={day} className="py-2 text-xs font-semibold text-slate-500">{day}</div>)}
            {Array.from({ length: Math.ceil((firstDayOfMonth + daysInMonth) / 7) * 7 }).map((_, index) => {
              const day = index - firstDayOfMonth + 1;
              const matching = day > 0 && day <= daysInMonth
                ? events.filter((event) => event.date.getFullYear() === month.getFullYear() && event.date.getMonth() === month.getMonth() && event.date.getDate() === day)
                : [];
              const today = new Date();
              const isToday = day === today.getDate() && month.getMonth() === today.getMonth() && month.getFullYear() === today.getFullYear();
              return (
                <div key={`${day}-${index}`} className={`min-h-16 rounded-lg border p-2 text-left ${isToday ? 'border-brand-500 bg-brand-50 dark:bg-brand-950' : 'border-slate-100 dark:border-slate-800'}`}>
                  {day > 0 && day <= daysInMonth && <><span className={`text-sm ${isToday ? 'font-bold text-brand-700 dark:text-brand-200' : 'text-slate-700 dark:text-slate-200'}`}>{day}</span>{matching.length > 0 && <span className="mt-2 block h-1.5 w-1.5 rounded-full bg-brand-600" aria-label={`${matching.length} events`} />}</>}
                </div>
              );
            })}
          </div>
          <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">Calendar events you create can be edited or deleted. Opportunity and mentorship dates are synced from their source records.</p>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-card dark:border-slate-700 dark:bg-slate-900">
          <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">Upcoming</h2>
          {upcomingEvents.length === 0 ? <p className="text-sm text-slate-500 dark:text-slate-400">No upcoming items. Add a personal event or check your opportunities.</p> : (
            <ul className="space-y-3">
              {upcomingEvents.map((event) => (
                <li key={event.id} className="flex items-start gap-3 rounded-lg border border-slate-100 p-3 dark:border-slate-800">
                  <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-slate-800 dark:text-slate-100">{event.title}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{event.detail || event.type}</p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{event.date.toLocaleString()}</p>
                    {event.editable && <div className="mt-2 flex gap-2">
                      <button type="button" onClick={() => startEditing(event)} className="inline-flex items-center gap-1 text-xs font-semibold text-brand-700 hover:underline dark:text-brand-300"><Pencil className="h-3 w-3" />Edit</button>
                      <button type="button" onClick={() => removeEvent(event)} disabled={deletingId === event.id} className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 hover:underline disabled:opacity-50"><Trash2 className="h-3 w-3" />{deletingId === event.id ? 'Deleting…' : 'Delete'}</button>
                    </div>}
                  </div>
                  <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-semibold capitalize text-slate-600 dark:bg-slate-800 dark:text-slate-300">{event.type}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-card dark:border-slate-700 dark:bg-slate-900">
        <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">Your events and reminders</h2>
        {personalEvents.length === 0 ? <p className="text-sm text-slate-500 dark:text-slate-400">You haven’t created any personal events yet.</p> : (
          <ul className="divide-y divide-slate-100 dark:divide-slate-800">
            {personalEvents.map((event) => (
              <li key={event.id} className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                <div className="min-w-0">
                  <p className="font-medium text-slate-800 dark:text-slate-100">{event.title}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{event.startAt?.toLocaleString() || 'Date unavailable'}{event.description ? ` · ${event.description}` : ''}</p>
                </div>
                <div className="flex gap-3">
                  <button type="button" onClick={() => startEditing({ ...event, date: event.startAt })} className="inline-flex items-center gap-1 text-xs font-semibold text-brand-700 hover:underline dark:text-brand-300"><Pencil className="h-3 w-3" />Edit</button>
                  <button type="button" onClick={() => removeEvent(event)} disabled={deletingId === event.id} className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 hover:underline disabled:opacity-50"><Trash2 className="h-3 w-3" />{deletingId === event.id ? 'Deleting…' : 'Delete'}</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
};

export default Calendar;
