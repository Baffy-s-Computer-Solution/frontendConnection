import { useCallback, useEffect, useMemo, useState } from 'react';
import { collection, doc, onSnapshot, orderBy, query, serverTimestamp, updateDoc, where } from 'firebase/firestore';
import { Archive, Bell, Check, CheckCheck, Inbox, LoaderCircle, RefreshCw, RotateCcw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db } from '../config/firebase';

const notificationDate = (value) => {
  const date = value?.toDate ? value.toDate() : value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return 'Just now';
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(date);
};

const Notifications = () => {
  const { currentUser, userProfile } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [busyId, setBusyId] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const userType = String(userProfile?.userType || userProfile?.role || '').toLowerCase();
  const ownerField = userType === 'company' ? 'companyId' : 'userId';
  const ownerId = userType === 'company' ? (userProfile?.companyId || currentUser?.uid) : currentUser?.uid;

  useEffect(() => {
    if (!currentUser || !ownerId) { setNotifications([]); setLoading(false); return undefined; }
    setLoading(true);
    setError('');
    const notificationsQuery = query(collection(db, 'notifications'), where(ownerField, '==', ownerId), orderBy('createdAt', 'desc'));
    return onSnapshot(notificationsQuery, (snapshot) => {
      setNotifications(snapshot.docs.map((entry) => ({ id: entry.id, ...entry.data() })));
      setLoading(false);
      setError('');
    }, (cause) => {
      console.error('Unable to subscribe to notifications:', cause);
      setError('Notifications could not be loaded. Check your connection and try again.');
      setLoading(false);
    });
  }, [currentUser, ownerField, ownerId, refreshKey]);

  const activeNotifications = useMemo(() => notifications.filter((item) => !item.archived), [notifications]);
  const unreadCount = activeNotifications.filter((item) => !item.read).length;
  const visibleNotifications = useMemo(() => notifications.filter((item) => {
    if (filter === 'unread') return !item.archived && !item.read;
    if (filter === 'archived') return item.archived;
    return !item.archived;
  }), [notifications, filter]);

  const updateNotification = useCallback(async (id, changes) => {
    setBusyId(id);
    try { await updateDoc(doc(db, 'notifications', id), { ...changes, updatedAt: serverTimestamp() }); }
    catch (cause) {
      console.error('Unable to update notification:', cause);
      setError(cause?.code === 'permission-denied' ? 'You do not have permission to update this notification.' : 'The notification could not be updated. Please try again.');
    } finally { setBusyId(''); }
  }, []);
  const markAllRead = async () => Promise.all(activeNotifications.filter((item) => !item.read).map((item) => updateNotification(item.id, { read: true, readAt: serverTimestamp() })));

  return <main className="mx-auto w-full max-w-5xl px-3 py-5 text-slate-900 dark:text-slate-100 sm:px-6 sm:py-8">
    <header className="mb-5 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between sm:p-6">
      <div className="flex min-w-0 items-center gap-3"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300"><Bell className="h-5 w-5" /></span><div className="min-w-0"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Your updates</p><h1 className="text-xl font-semibold sm:text-2xl">Notifications</h1><p className="mt-0.5 text-sm text-slate-600 dark:text-slate-400">{unreadCount ? `${unreadCount} unread notification${unreadCount === 1 ? '' : 's'}` : 'You are all caught up.'}</p></div></div>
      <div className="flex flex-wrap items-center gap-2"><button type="button" onClick={() => setRefreshKey((value) => value + 1)} className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-300 px-3 text-sm font-medium hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800" aria-label="Refresh notifications"><RefreshCw className="h-4 w-4" />Refresh</button><button type="button" onClick={markAllRead} disabled={!unreadCount} className="inline-flex h-10 items-center gap-2 rounded-lg bg-indigo-600 px-3 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"><CheckCheck className="h-4 w-4" />Mark all read</button></div>
    </header>
    <nav aria-label="Notification filters" className="mb-4 flex gap-2 overflow-x-auto rounded-xl border border-slate-200 bg-white p-2 dark:border-slate-800 dark:bg-slate-900">{[['all', 'All'], ['unread', 'Unread'], ['archived', 'Archived']].map(([key, label]) => <button key={key} type="button" onClick={() => setFilter(key)} aria-pressed={filter === key} className={`shrink-0 rounded-lg px-4 py-2 text-sm font-medium transition ${filter === key ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'}`}>{label}{key === 'unread' && unreadCount > 0 ? <span className="ml-2 rounded-full bg-white/20 px-1.5 py-0.5 text-xs">{unreadCount}</span> : null}</button>)}</nav>
    {error && <div role="alert" className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-200"><span>{error}</span><button type="button" onClick={() => setRefreshKey((value) => value + 1)} className="font-semibold underline">Retry</button></div>}
    <section aria-label="Notifications" className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      {loading ? <div className="flex items-center justify-center gap-2 p-12 text-sm text-slate-500"><LoaderCircle className="h-5 w-5 animate-spin" />Loading notifications</div> : visibleNotifications.length === 0 ? <div className="flex flex-col items-center px-5 py-14 text-center"><span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"><Inbox className="h-6 w-6" /></span><h2 className="font-semibold">{filter === 'unread' ? 'No unread notifications' : filter === 'archived' ? 'Nothing archived' : 'No notifications yet'}</h2><p className="mt-1 max-w-sm text-sm text-slate-500 dark:text-slate-400">Updates about your account and activity will appear here.</p></div> : <ul className="divide-y divide-slate-200 dark:divide-slate-800">{visibleNotifications.map((item) => {
        const isBusy = busyId === item.id;
        return <li key={item.id} className={`flex gap-3 px-4 py-4 transition sm:gap-4 sm:px-6 ${!item.read ? 'bg-indigo-50/60 dark:bg-indigo-500/[0.07]' : ''}`}><span className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${!item.read ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-200' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300'}`}><Bell className="h-4 w-4" /></span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-x-2 gap-y-1"><h2 className="font-semibold leading-5">{item.title || 'Update'}</h2>{!item.read && <span className="h-2 w-2 rounded-full bg-indigo-500" aria-label="Unread" />}<time className="ml-auto text-xs text-slate-500 dark:text-slate-400">{notificationDate(item.createdAt)}</time></div><p className="mt-1 whitespace-pre-wrap break-words text-sm leading-6 text-slate-600 dark:text-slate-300">{item.message || item.body || 'You have a new update.'}</p>{item.actionUrl && <Link to={item.actionUrl} className="mt-2 inline-flex text-sm font-semibold text-indigo-700 hover:underline dark:text-indigo-300">{item.actionLabel || 'View details'}</Link>}<div className="mt-3 flex flex-wrap gap-2">{!item.read && <button type="button" disabled={isBusy} onClick={() => updateNotification(item.id, { read: true, readAt: serverTimestamp() })} className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-slate-300 px-2.5 text-xs font-medium hover:bg-slate-100 disabled:opacity-50 dark:border-slate-700 dark:hover:bg-slate-800"><Check className="h-3.5 w-3.5" />Mark read</button>}{item.archived ? <button type="button" disabled={isBusy} onClick={() => updateNotification(item.id, { archived: false })} className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-slate-300 px-2.5 text-xs font-medium hover:bg-slate-100 disabled:opacity-50 dark:border-slate-700 dark:hover:bg-slate-800"><RotateCcw className="h-3.5 w-3.5" />Restore</button> : <button type="button" disabled={isBusy} onClick={() => updateNotification(item.id, { archived: true, archivedAt: serverTimestamp() })} className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-slate-300 px-2.5 text-xs font-medium hover:bg-slate-100 disabled:opacity-50 dark:border-slate-700 dark:hover:bg-slate-800"><Archive className="h-3.5 w-3.5" />Archive</button>}{isBusy && <LoaderCircle className="h-4 w-4 animate-spin self-center text-slate-400" aria-label="Saving" />}</div></div></li>;
      })}</ul>}
    </section>
  </main>;
};

export default Notifications;
