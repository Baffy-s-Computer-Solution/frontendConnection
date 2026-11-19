import { useCallback, useEffect, useMemo, useState } from 'react';
import { addDoc, collection, doc, increment, onSnapshot, orderBy, query, serverTimestamp, updateDoc, where } from 'firebase/firestore';
import { BadgeCheck, CalendarDays, Clock3, Flag, GraduationCap, LoaderCircle, MessageSquareText, Search, Send, Shield, Sparkles, UserRound, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../config/firebase';
import socialPlatformService from '../../services/socialPlatformService';
import { cancelStudentMentorshipRequest, createStudentMentorshipRequest, respondToMentorRequest, subscribeToAvailableMentors, subscribeToStudentMentorshipData } from '../../services/studentMentorshipService';

const card = 'rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900';
const input = 'w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100';
const friendlyError = (message = '') => /permission|insufficient/i.test(message)
  ? `Firestore denied this mentorship read${message.includes(':') ? ` (${message.split(':', 1)[0]})` : ''}. Please refresh; if this persists, share this collection name with an administrator.`
  : message;
const displayDate = (value) => {
  const date = value?.toDate ? value.toDate() : value ? new Date(value) : null;
  return date && !Number.isNaN(date.getTime()) ? date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'Date not set';
};
const statusStyle = (status) => ({
  pending: 'bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-200',
  accepted: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-200',
  active: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-200',
  completed: 'bg-sky-100 text-sky-800 dark:bg-sky-500/15 dark:text-sky-200',
  cancelled: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200',
  rejected: 'bg-rose-100 text-rose-800 dark:bg-rose-500/15 dark:text-rose-200',
}[String(status || '').toLowerCase()] || 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200');

export default function StudentMentorship() {
  const { currentUser } = useAuth();
  const studentId = currentUser?.uid;
  const [mentors, setMentors] = useState([]);
  const [requests, setRequests] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [chatDraft, setChatDraft] = useState('');
  const [sendingChat, setSendingChat] = useState(false);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('mentors');
  const [selected, setSelected] = useState(null);
  const [topic, setTopic] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    setLoading(true); setError('');
    const stopMentors = subscribeToAvailableMentors(search, (items) => { setMentors(items); setLoading(false); }, (loadError) => { setError(friendlyError(`mentors: ${loadError.message || 'Unable to load approved mentors.'}`)); setLoading(false); });
    return () => stopMentors();
  }, [search, studentId]);

  useEffect(() => {
    if (!studentId) return undefined;
    return subscribeToStudentMentorshipData(studentId, ({ requests: nextRequests, sessions: nextSessions }) => { setRequests(nextRequests); setSessions(nextSessions); }, (loadError) => setNotice(friendlyError(loadError.message || 'Some mentorship activity could not be loaded.')));
  }, [studentId]);

  useEffect(() => {
    if (!studentId) { setConversations([]); setActiveConversationId(''); return undefined; }
    const conversationQuery = query(collection(db, 'conversations'), where('participants', 'array-contains', studentId), orderBy('lastMessageAt', 'desc'));
    return onSnapshot(conversationQuery, (snapshot) => {
      const items = snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
      setConversations(items);
      setActiveConversationId((current) => current && items.some((item) => item.id === current) ? current : (items[0]?.id || ''));
    }, (loadError) => setNotice(friendlyError(`conversations: ${loadError.message || 'Unable to load mentor messages.'}`)));
  }, [studentId]);

  useEffect(() => {
    if (!activeConversationId) { setChatMessages([]); return undefined; }
    const messageQuery = query(collection(db, 'messages'), where('conversationId', '==', activeConversationId), orderBy('createdAt', 'asc'));
    return onSnapshot(messageQuery, (snapshot) => setChatMessages(snapshot.docs.map((item) => ({ id: item.id, ...item.data() }))), (loadError) => setNotice(friendlyError(`messages: ${loadError.message || 'Unable to load messages.'}`)));
  }, [activeConversationId]);

  useEffect(() => {
    if (!studentId || !activeConversationId || !chatMessages.length) return;
    const unread = chatMessages.filter((item) => item.senderId !== studentId && !item.read);
    if (!unread.length) return;
    Promise.all(unread.map((item) => updateDoc(doc(db, 'messages', item.id), { read: true, readAt: serverTimestamp() })))
      .then(() => updateDoc(doc(db, 'conversations', activeConversationId), { [`unreadCount.${studentId}`]: 0 }))
      .catch((readError) => setNotice(friendlyError(`messages read status: ${readError.message || 'Could not update read status.'}`)));
  }, [studentId, activeConversationId, chatMessages]);

  const sendChatMessage = async (event) => {
    event.preventDefault();
    const content = chatDraft.trim();
    const conversation = conversations.find((item) => item.id === activeConversationId);
    if (!content || !studentId || !conversation || sendingChat) return;
    const mentor = (conversation.participantsData || []).find((item) => item.id !== studentId);
    setSendingChat(true);
    try {
      await addDoc(collection(db, 'messages'), {
        conversationId: conversation.id, senderId: studentId,
        senderName: currentUser?.displayName || currentUser?.email || 'Student',
        senderAvatar: currentUser?.photoURL || '', content, attachments: [],
        read: false, delivered: true, createdAt: serverTimestamp(),
      });
      await updateDoc(doc(db, 'conversations', conversation.id), {
        lastMessage: { content, senderId: studentId, createdAt: new Date().toISOString() },
        lastMessageAt: serverTimestamp(), [`unreadCount.${mentor?.id}`]: increment(1),
      });
      if (mentor?.id) await addDoc(collection(db, 'notifications'), {
        userId: mentor.id, type: 'message', title: 'New Message',
        message: `${currentUser?.displayName || 'Your mentee'}: ${content.slice(0, 80)}`,
        conversationId: conversation.id, read: false, createdAt: serverTimestamp(),
      });
      setChatDraft('');
    } catch (sendError) {
      setError(friendlyError(sendError.message || 'Message could not be sent.'));
    } finally { setSendingChat(false); }
  };

  const activeConversation = conversations.find((item) => item.id === activeConversationId);
  const activeMentor = (activeConversation?.participantsData || []).find((item) => item.id !== studentId);
  const reportMentorMessage = async (item) => {
    const reason = window.prompt('Why are you reporting this message?');
    if (!reason?.trim()) return;
    try { await socialPlatformService.reportContent({ targetType: 'message', targetId: item.id, ownerId: item.senderId, reason }); setNotice('Message report submitted privately.'); }
    catch (reportError) { setError(reportError.message || 'Unable to submit report.'); }
  };
  const blockActiveMentor = async () => {
    if (!activeMentor?.id || !window.confirm(`Block ${activeMentor.displayName || 'this mentor'}? Messaging and social access will be stopped.`)) return;
    try { await socialPlatformService.blockUser(activeMentor.id, activeMentor.displayName); setActiveConversationId(''); setNotice('Mentor blocked.'); }
    catch (blockError) { setError(blockError.message || 'Unable to block this mentor.'); }
  };

  const activeCount = useMemo(() => sessions.filter((item) => ['active', 'accepted', 'scheduled', 'in_progress'].includes(String(item.status || '').toLowerCase())).length, [sessions]);
  const completedCount = useMemo(() => sessions.filter((item) => String(item.status || '').toLowerCase() === 'completed').length, [sessions]);

  const sendRequest = async (event) => {
    event.preventDefault(); if (!selected) return;
    setSaving(true); setError(''); setNotice('');
    const result = await createStudentMentorshipRequest({ studentId, mentor: selected, topic, message });
    if (result.success) {
      setSelected(null); setTopic(''); setMessage(''); setTab('requests');
      setNotice('Your mentorship request was sent. You can follow its status in My requests.');
    } else setError(friendlyError(result.error));
    setSaving(false);
  };

  const cancelRequest = async (request) => {
    if (!window.confirm('Cancel this pending mentorship request?')) return;
    setSaving(true); setError('');
    const result = await cancelStudentMentorshipRequest(request.id, studentId);
    if (result.success) {
      setNotice('Request cancelled.');
    } else setError(friendlyError(result.error));
    setSaving(false);
  };

  const receivedRequests = requests.filter((request) => request.initiatedBy === 'mentor');
  const sentRequests = requests.filter((request) => request.initiatedBy !== 'mentor');
  const respond = async (request, status) => {
    setSaving(true);
    const result = await respondToMentorRequest(request.id, studentId, status);
    setSaving(false);
    setNotice(result.success ? (status === 'accepted' ? 'Mentorship invitation accepted.' : 'Mentorship invitation declined.') : result.error || 'Unable to save your response.');
  };

  return <main className="mx-auto min-h-screen max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
    <header className={`${card} overflow-hidden`}><div className="bg-gradient-to-r from-indigo-700 to-violet-700 p-6 text-white sm:p-8"><div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="text-sm font-semibold uppercase tracking-wider text-indigo-100">Student career hub</p><h1 className="mt-2 text-3xl font-bold">Mentorship</h1><p className="mt-2 max-w-2xl text-sm text-indigo-100">Connect with approved mentors, send a request, and follow your mentorship activity.</p></div><div className="flex gap-3"><div className="rounded-xl bg-white/10 px-4 py-3"><p className="text-2xl font-bold">{activeCount}</p><p className="text-xs text-indigo-100">Active</p></div><div className="rounded-xl bg-white/10 px-4 py-3"><p className="text-2xl font-bold">{completedCount}</p><p className="text-xs text-indigo-100">Completed</p></div></div></div></div></header>
    {error && <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200">{error}</div>}
    {notice && <div role="status" className="rounded-xl border border-sky-200 bg-sky-50 p-4 text-sm text-sky-800 dark:border-sky-900 dark:bg-sky-950/40 dark:text-sky-200">{notice}</div>}
    {activeMentor && <div className={`${card} flex flex-wrap items-center justify-between gap-3 px-4 py-3`}><span className="text-sm text-slate-600 dark:text-slate-300">Conversation safety controls for {activeMentor.displayName || 'your mentor'}</span><div className="flex gap-2"><button type="button" onClick={blockActiveMentor} className="inline-flex items-center gap-2 rounded-lg border border-rose-200 px-3 py-2 text-sm text-rose-700 hover:bg-rose-50 dark:border-rose-900 dark:text-rose-200 dark:hover:bg-rose-950/40"><Shield size={16}/> Block</button><button type="button" onClick={async () => { const reason = window.prompt('Why are you reporting this profile?'); if (!reason?.trim()) return; try { await socialPlatformService.reportContent({ targetType: 'profile', targetId: activeMentor.id, ownerId: activeMentor.id, reason }); setNotice('Profile report submitted privately.'); } catch (reportError) { setError(reportError.message || 'Unable to report profile.'); } }} className="inline-flex items-center gap-2 rounded-lg border border-amber-200 px-3 py-2 text-sm text-amber-700 hover:bg-amber-50 dark:border-amber-900 dark:text-amber-200 dark:hover:bg-amber-950/40"><Flag size={16}/> Report profile</button></div></div>}
    <section className={`${card} overflow-hidden`} aria-label="Messages from mentors"><div className="border-b border-slate-200 px-5 py-4 dark:border-slate-800"><h2 className="font-semibold text-slate-900 dark:text-white">Messages from mentors</h2><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Messages update live as you and your mentor chat.</p></div>{conversations.length ? <div className="grid min-h-[24rem] md:grid-cols-[16rem_1fr]"><aside className="border-b border-slate-200 dark:border-slate-800 md:border-b-0 md:border-r">{conversations.map((conversation) => { const mentor = (conversation.participantsData || []).find((item) => item.id !== studentId); const unread = Number(conversation.unreadCount?.[studentId] || 0); return <button type="button" key={conversation.id} onClick={() => setActiveConversationId(conversation.id)} className={`block w-full border-b border-slate-100 p-4 text-left hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800 ${activeConversationId === conversation.id ? 'bg-indigo-50 dark:bg-indigo-950/40' : ''}`}><span className="block truncate text-sm font-semibold text-slate-900 dark:text-white">{mentor?.displayName || 'Mentor'}</span><span className="mt-1 block truncate text-xs text-slate-500 dark:text-slate-400">{conversation.lastMessage?.content || 'Start your conversation'}</span>{unread > 0 && <span className="mt-2 inline-flex rounded-full bg-indigo-600 px-2 py-0.5 text-xs text-white">{unread} unread</span>}</button>; })}</aside><div className="flex min-h-[24rem] flex-col"><div className="flex-1 space-y-3 overflow-y-auto p-4">{chatMessages.map((item) => <div key={item.id} className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${item.senderId === studentId ? 'ml-auto bg-indigo-600 text-white' : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-100'}`}><p className="mb-1 text-xs font-semibold opacity-75">{item.senderId === studentId ? 'You' : (item.senderName || 'Mentor')}</p><p className="whitespace-pre-wrap break-words">{item.deleted ? 'This message was deleted.' : item.content}</p>{item.attachments?.map((attachment) => <a key={attachment.url} href={attachment.url} target="_blank" rel="noreferrer" className="mt-2 block underline">{attachment.name || 'Attachment'}</a>)}</div>)}{!chatMessages.length && <p className="py-16 text-center text-sm text-slate-500 dark:text-slate-400">No messages yet. Your mentor can start the conversation.</p>}</div><form onSubmit={sendChatMessage} className="flex gap-2 border-t border-slate-200 p-3 dark:border-slate-800"><input aria-label="Message your mentor" className={input} value={chatDraft} onChange={(event) => setChatDraft(event.target.value)} placeholder="Write a message…"/><button type="submit" disabled={!chatDraft.trim() || sendingChat} aria-label="Send message" className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 text-white disabled:opacity-50"><Send size={17}/></button></form></div></div> : <div className="p-8 text-center text-sm text-slate-600 dark:text-slate-300">Your mentor conversations will appear here when a mentor messages you.</div>}</section>
    <nav className="flex flex-wrap gap-2" aria-label="Mentorship sections">{[['mentors', 'Find mentors'], ['invitations', `Mentor invitations (${receivedRequests.filter((request) => request.status === 'pending').length})`], ['requests', `My requests (${sentRequests.length})`], ['sessions', `My sessions (${sessions.length})`]].map(([key, label]) => <button key={key} type="button" onClick={() => setTab(key)} className={`rounded-xl px-4 py-2.5 text-sm font-semibold ${tab === key ? 'bg-indigo-600 text-white' : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800'}`}>{label}</button>)}</nav>
    {tab === 'mentors' && <section className="space-y-4"><div className={`${card} p-4`}><label className="relative block"><span className="sr-only">Search mentors</span><Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400"/><input className={`${input} pl-10`} value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by name, role, company, or expertise"/></label></div>
      {loading ? <div className={`${card} flex items-center justify-center gap-3 p-12 text-slate-600 dark:text-slate-300`}><LoaderCircle className="animate-spin"/>Loading mentors and your activity…</div> : mentors.length === 0 ? <div className={`${card} p-12 text-center`}><Sparkles className="mx-auto h-9 w-9 text-indigo-500"/><h2 className="mt-3 font-semibold text-slate-900 dark:text-white">No approved mentors found</h2><p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Try another search, or check back as mentors join the network.</p></div> : <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{mentors.map((mentor) => <article key={mentor.id} className={`${card} flex flex-col p-5`}><div className="flex items-start gap-3"><div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-200">{mentor.photoURL ? <img src={mentor.photoURL} alt="" className="h-full w-full object-cover"/> : <UserRound/>}</div><div className="min-w-0"><h2 className="truncate font-semibold text-slate-900 dark:text-white">{mentor.name}</h2><p className="text-sm text-slate-600 dark:text-slate-300">{mentor.title}{mentor.company ? ` · ${mentor.company}` : ''}</p></div>{mentor.isVerified && <BadgeCheck className="ml-auto shrink-0 text-emerald-600" aria-label="Verified mentor"/>}</div>{mentor.bio && <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{mentor.bio}</p>}<div className="mt-4 flex flex-wrap gap-2">{mentor.expertise.slice(0, 5).map((skill) => <span key={skill} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-200">{skill}</span>)}</div><div className="mt-auto pt-5"><button type="button" onClick={() => { setSelected(mentor); setTopic(''); setMessage(''); }} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"><MessageSquareText size={16}/>Request mentorship</button></div></article>)}</div>}</section>}
    {tab === 'invitations' && <section className={`${card} overflow-hidden`}><div className="border-b border-slate-200 px-5 py-4 dark:border-slate-800"><h2 className="font-semibold text-slate-900 dark:text-white">Mentor invitations</h2><p className="mt-1 text-sm text-slate-500">Review invitations mentors have sent to you.</p></div>{receivedRequests.length ? <ul className="divide-y divide-slate-200 dark:divide-slate-800">{receivedRequests.map((item) => <li key={item.id} className="flex flex-col justify-between gap-3 p-5 sm:flex-row sm:items-center"><div><h3 className="font-semibold text-slate-900 dark:text-white">{item.mentorName || 'Mentor'}{item.topic ? ` · ${item.topic}` : ''}</h3><p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Received {displayDate(item.createdAt)}</p><p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{item.message}</p></div><div className="flex items-center gap-2"><span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyle(item.status)}`}>{item.status || 'pending'}</span>{item.status === 'pending' && <><button type="button" disabled={saving} onClick={() => respond(item, 'accepted')} className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50">Approve</button><button type="button" disabled={saving} onClick={() => respond(item, 'rejected')} className="rounded-lg border border-rose-200 px-3 py-2 text-sm font-semibold text-rose-700 disabled:opacity-50 dark:border-rose-900 dark:text-rose-300">Decline</button></>}</div></li>)}</ul> : <div className="p-10 text-center text-sm text-slate-600 dark:text-slate-300">No mentor invitations yet.</div>}</section>}
    {tab === 'requests' && <section className={`${card} overflow-hidden`}><div className="border-b border-slate-200 px-5 py-4 dark:border-slate-800"><h2 className="font-semibold text-slate-900 dark:text-white">My mentorship requests</h2></div>{sentRequests.length ? <ul className="divide-y divide-slate-200 dark:divide-slate-800">{sentRequests.map((item) => <li key={item.id} className="flex flex-col justify-between gap-3 p-5 sm:flex-row sm:items-center"><div><h3 className="font-semibold text-slate-900 dark:text-white">{item.mentorName || 'Mentor'}{item.topic ? ` · ${item.topic}` : ''}</h3><p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Sent {displayDate(item.createdAt)}{item.message ? ` — ${item.message}` : ''}</p></div><div className="flex items-center gap-3"><span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyle(item.status)}`}>{item.status || 'pending'}</span>{item.status === 'pending' && <button type="button" disabled={saving} onClick={() => cancelRequest(item)} className="rounded-lg border border-rose-200 px-3 py-2 text-sm font-medium text-rose-700 disabled:opacity-50 dark:border-rose-900 dark:text-rose-300">Cancel</button>}</div></li>)}</ul> : <div className="p-10 text-center text-sm text-slate-600 dark:text-slate-300">You have not sent any mentorship requests yet.</div>}</section>}
    {tab === 'sessions' && <section className={`${card} overflow-hidden`}><div className="border-b border-slate-200 px-5 py-4 dark:border-slate-800"><h2 className="font-semibold text-slate-900 dark:text-white">My mentorship sessions</h2></div>{sessions.length ? <ul className="divide-y divide-slate-200 dark:divide-slate-800">{sessions.map((session) => <li key={session.id} className="flex flex-col justify-between gap-3 p-5 sm:flex-row sm:items-center"><div><h3 className="font-semibold text-slate-900 dark:text-white">{session.topic || session.title || 'Mentorship session'}</h3><p className="mt-1 flex flex-wrap items-center gap-3 text-sm text-slate-600 dark:text-slate-300"><span><GraduationCap className="mr-1 inline h-4 w-4"/>{session.mentorName || 'Mentor'}</span><span><CalendarDays className="mr-1 inline h-4 w-4"/>{displayDate(session.scheduledAt || session.sessionDate || session.createdAt)}</span>{session.startTime && <span><Clock3 className="mr-1 inline h-4 w-4"/>{session.startTime}</span>}</p></div><span className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${statusStyle(session.status)}`}>{session.status || 'scheduled'}</span></li>)}</ul> : <div className="p-10 text-center text-sm text-slate-600 dark:text-slate-300">Accepted requests and scheduled sessions will appear here.</div>}</section>}
    {selected && <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget && !saving) setSelected(null); }}><section role="dialog" aria-modal="true" aria-labelledby="request-title" className={`${card} w-full max-w-lg p-6`}><div className="mb-5 flex items-start justify-between"><div><h2 id="request-title" className="text-lg font-semibold text-slate-900 dark:text-white">Request mentorship</h2><p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Send a note to {selected.name}.</p></div><button type="button" onClick={() => setSelected(null)} disabled={saving} aria-label="Close dialog"><X/></button></div><form onSubmit={sendRequest} className="space-y-4"><label className="block text-sm font-medium text-slate-700 dark:text-slate-200">What would you like help with?<input className={input} maxLength={120} value={topic} onChange={(event) => setTopic(event.target.value)} placeholder="Career planning, portfolio review…"/></label><label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Message<textarea className={input} required rows={5} maxLength={1000} value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Introduce yourself and explain what you'd like to work on."/></label><div className="flex justify-end gap-2"><button type="button" disabled={saving} onClick={() => setSelected(null)} className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-medium dark:border-slate-700 dark:text-slate-200">Cancel</button><button type="submit" disabled={saving || !message.trim()} className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{saving ? <LoaderCircle className="animate-spin" size={16}/> : <Send size={16}/>}Send request</button></div></form></section></div>}
  </main>;
}
