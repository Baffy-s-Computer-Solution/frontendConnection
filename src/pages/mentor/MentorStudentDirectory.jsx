import { useEffect, useState } from 'react';
import { LoaderCircle, Search, Send, Users } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { createMentorMentorshipRequest, subscribeToRegisteredStudents } from '../../services/studentMentorshipService';

export default function MentorStudentDirectory() {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [message, setMessage] = useState('');
  const [topic, setTopic] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  useEffect(() => user?.uid ? subscribeToRegisteredStudents(setStudents, (e) => setError(e.message || 'Unable to load students.')) : undefined, [user?.uid]);
  const filtered = students.filter((student) => `${student.fullName || student.displayName || ''} ${student.institution || ''} ${student.program || ''} ${student.email || ''}`.toLowerCase().includes(search.trim().toLowerCase()));
  const submit = async (event) => {
    event.preventDefault();
    if (!selected || !user?.uid) return;
    setSaving(true); setError(''); setNotice('');
    const result = await createMentorMentorshipRequest({ mentorId: user.uid, student: selected, topic, message });
    setSaving(false);
    if (!result.success) { setError(result.error || 'Unable to send invitation.'); return; }
    setSelected(null); setMessage(''); setTopic('');
    setNotice('Mentorship invitation sent. The student can approve or decline it.');
  };
  return <main className="mx-auto min-h-screen max-w-6xl space-y-5 px-4 py-8 sm:px-6"><header className="rounded-2xl bg-gradient-to-r from-indigo-700 to-violet-700 p-6 text-white"><p className="text-sm uppercase tracking-widest text-indigo-100">Mentor workspace</p><h1 className="mt-2 text-3xl font-bold">Registered students</h1><p className="mt-2 text-sm text-indigo-100">Browse student profiles and send mentorship invitations.</p></header>
    {error && <p role="alert" className="rounded-xl bg-rose-50 p-3 text-sm text-rose-800">{error}</p>}{notice && <p role="status" className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">{notice}</p>}
    <label className="relative block"><Search className="absolute left-3 top-3 h-4 w-4 text-slate-400"/><span className="sr-only">Search students</span><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search students by name, school, or programme" className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-9 pr-3 dark:border-slate-700 dark:bg-slate-900"/></label>
    {filtered.length ? <ul className="divide-y divide-slate-200 overflow-hidden rounded-2xl border border-slate-200 bg-white dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-900">{filtered.map((student) => <li key={student.id} className="flex flex-wrap items-center justify-between gap-3 p-4"><div className="flex items-center gap-3"><img src={student.photoURL || student.profilePhoto || ''} alt="" className="h-11 w-11 rounded-full bg-slate-100 object-cover"/><div><p className="font-semibold">{student.fullName || student.displayName || 'Student'}</p><p className="text-sm text-slate-500">{[student.institution, student.program, student.email].filter(Boolean).join(' · ') || 'Registered student'}</p></div></div><button type="button" onClick={() => setSelected(student)} className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-3 py-2 text-sm font-semibold text-white"><Send className="h-4 w-4"/>Invite to mentorship</button></li>)}</ul> : <div className="rounded-2xl border border-dashed p-12 text-center text-slate-500"><Users className="mx-auto h-8 w-8"/><p className="mt-3">No registered students found.</p></div>}
    {selected && <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4"><form onSubmit={submit} className="w-full max-w-lg space-y-4 rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900"><h2 className="text-lg font-semibold">Invite {selected.fullName || selected.displayName || 'student'}</h2><label className="block text-sm font-medium">Topic<input value={topic} onChange={(e) => setTopic(e.target.value)} maxLength={120} className="mt-1 w-full rounded-xl border p-2.5 dark:border-slate-700 dark:bg-slate-950"/></label><label className="block text-sm font-medium">Message<textarea required rows={4} maxLength={1000} value={message} onChange={(e) => setMessage(e.target.value)} className="mt-1 w-full rounded-xl border p-2.5 dark:border-slate-700 dark:bg-slate-950"/></label><div className="flex justify-end gap-2"><button type="button" onClick={() => setSelected(null)} className="rounded-xl border px-4 py-2 dark:border-slate-700">Cancel</button><button disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-white disabled:opacity-50">{saving ? <LoaderCircle className="h-4 w-4 animate-spin"/> : <Send className="h-4 w-4"/>}Send invitation</button></div></form></div>}
  </main>;
}
