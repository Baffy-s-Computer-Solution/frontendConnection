import { useCallback, useEffect, useMemo, useState } from 'react';
import { collection, doc, getDoc, getDocs, orderBy, query, runTransaction, serverTimestamp, where } from 'firebase/firestore';
import { Activity, AlertTriangle, ArrowDownToLine, BookOpen, BriefcaseBusiness, Check, CircleHelp, Plus, RefreshCw, Target, Trash2, TrendingUp, X } from 'lucide-react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { auth, db } from '../../../config/firebase';
import { useAuth } from '../../../context/AuthContext';
import { subscribeToStudentApplications } from '../../../services/studentServices';

const panel = 'rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900';
const button = 'inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60';
const field = 'mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100';
const list = (value) => Array.isArray(value) ? value : [];
const asDate = (value) => {
  if (!value) return null;
  const date = typeof value.toDate === 'function' ? value.toDate() : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

export default function StudentAnalytics() {
  const { currentUser } = useAuth();
  const uid = currentUser?.uid || auth.currentUser?.uid;
  const [profile, setProfile] = useState(null);
  const [applications, setApplications] = useState([]);
  const [goals, setGoals] = useState([]);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [months, setMonths] = useState(6);
  const [dialog, setDialog] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', dueDate: '', progress: 0, name: '', level: 1, target: 5 });

  const refresh = useCallback(async () => {
    if (!uid) { setLoading(false); return; }
    setLoading(true); setError(''); setNotice('');
    try {
      const snapshot = await getDoc(doc(db, 'students', uid));
      if (!snapshot.exists()) throw new Error('Student profile not found. Complete your student profile to view analytics.');
      const data = snapshot.data();
      if (data.userType && String(data.userType).toLowerCase() !== 'student') throw new Error('Student analytics is only available to student accounts.');
      setProfile(data);
      setGoals(list(data.analyticsGoals).map((item, index) => ({ ...item, id: item.id || `goal-${index}` })));
      setSkills(list(data.analyticsSkills).map((item, index) => typeof item === 'string' ? { id: `skill-${index}`, name: item, level: 1, target: 5 } : { ...item, id: item.id || `skill-${index}` }));
      try {
        const result = await getDocs(query(collection(db, 'applications'), where('studentId', '==', uid), orderBy('appliedAt', 'desc')));
        setApplications(result.docs.map((item) => ({ id: item.id, ...item.data() })));
      } catch {
        setApplications([]);
        setNotice('Application activity is temporarily unavailable. Your profile analytics and trackers are ready to use.');
      }
    } catch (loadError) {
      console.error('Failed to load student analytics', loadError);
      setError(loadError.message || 'Analytics could not be loaded. Please try again.');
    } finally { setLoading(false); }
  }, [uid]);

  useEffect(() => { refresh(); }, [refresh]);

  useEffect(() => {
    if (!uid) { setApplications([]); return undefined; }
    return subscribeToStudentApplications(uid, setApplications, (loadError) => {
      setNotice(loadError.message || 'Live application activity is unavailable.');
    });
  }, [uid]);

  const saveCollection = async (key, value) => {
    await runTransaction(db, async (transaction) => {
      const ref = doc(db, 'students', uid);
      const snapshot = await transaction.get(ref);
      if (!snapshot.exists()) throw new Error('Student profile not found.');
      transaction.update(ref, { [key]: value, updatedAt: serverTimestamp() });
    });
  };

  const stats = useMemo(() => {
    const start = new Date(); start.setDate(1); start.setHours(0, 0, 0, 0); start.setMonth(start.getMonth() - months + 1);
    const points = new Map();
    for (let offset = months - 1; offset >= 0; offset -= 1) {
      const date = new Date(); date.setDate(1); date.setMonth(date.getMonth() - offset);
      points.set(date.toLocaleDateString(undefined, { month: 'short', year: '2-digit' }), 0);
    }
    applications.forEach((application) => {
      const date = asDate(application.createdAt || application.appliedAt || application.submittedAt);
      const key = date?.toLocaleDateString(undefined, { month: 'short', year: '2-digit' });
      if (date && date >= start && points.has(key)) points.set(key, points.get(key) + 1);
    });
    return {
      completion: Math.max(0, Math.min(100, Number(profile?.profileCompletion) || 0)),
      pending: applications.filter((item) => ['pending', 'submitted', 'reviewing', 'under_review'].includes(String(item.status).toLowerCase())).length,
      interview: applications.filter((item) => ['interview', 'interviewing', 'shortlisted'].includes(String(item.status).toLowerCase())).length,
      chart: [...points].map(([month, applications]) => ({ month, applications })),
    };
  }, [applications, months, profile]);

  const openDialog = (type, item) => {
    setForm(type === 'goal'
      ? { title: item?.title || '', description: item?.description || '', dueDate: item?.dueDate || '', progress: item?.progress || 0 }
      : { name: item?.name || '', level: item?.level || 1, target: item?.target || 5 });
    setDialog({ type, item: item || null });
  };

  const submit = async (event) => {
    event.preventDefault(); setSaving(true); setError('');
    try {
      const type = dialog.type;
      const source = type === 'goal' ? goals : skills;
      const id = dialog.item?.id || globalThis.crypto?.randomUUID?.();
      if (!id) throw new Error('This browser cannot create a secure tracker identifier.');
      const item = type === 'goal'
        ? { id, title: form.title.trim(), description: form.description.trim(), dueDate: form.dueDate, progress: Math.max(0, Math.min(100, Number(form.progress) || 0)) }
        : { id, name: form.name.trim(), level: Math.max(1, Math.min(5, Number(form.level) || 1)), target: Math.max(1, Math.min(5, Number(form.target) || 5)) };
      if (!(type === 'goal' ? item.title : item.name)) throw new Error('A name is required.');
      const next = dialog.item ? source.map((row) => row.id === id ? { ...row, ...item, updatedAt: new Date().toISOString() } : row) : [...source, { ...item, createdAt: new Date().toISOString() }];
      await saveCollection(type === 'goal' ? 'analyticsGoals' : 'analyticsSkills', next);
      if (type === 'goal') setGoals(next); else setSkills(next);
      setDialog(null);
    } catch (saveError) { setError(saveError.message || 'Could not save your change.'); }
    finally { setSaving(false); }
  };

  const remove = async (type, id) => {
    if (!window.confirm(`Delete this ${type}? This cannot be undone.`)) return;
    setSaving(true); setError('');
    try {
      const source = type === 'goal' ? goals : skills;
      const next = source.filter((item) => item.id !== id);
      await saveCollection(type === 'goal' ? 'analyticsGoals' : 'analyticsSkills', next);
      if (type === 'goal') setGoals(next); else setSkills(next);
    } catch (removeError) { setError(removeError.message || 'Could not delete this item.'); }
    finally { setSaving(false); }
  };

  const exportCsv = () => {
    const rows = [['Type', 'Name', 'Progress', 'Target', 'Due date'], ...goals.map((item) => ['Goal', item.title, `${item.progress || 0}%`, '', item.dueDate || '']), ...skills.map((item) => ['Skill', item.name, item.level, item.target, ''])];
    const csv = rows.map((row) => row.map((value) => `"${String(value ?? '').replace(/"/g, '""')}"`).join(',')).join('\r\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a'); link.href = url; link.download = 'career-analytics.csv'; link.click(); URL.revokeObjectURL(url);
  };

  if (loading) return <main className="p-8 text-slate-600 dark:text-slate-300" aria-live="polite">Loading your analytics…</main>;
  if (error && !profile) return <main className="mx-auto max-w-3xl p-6"><section className={`${panel} p-6`}><AlertTriangle className="mb-3 text-amber-500"/><h1 className="text-xl font-bold text-slate-900 dark:text-white">Analytics unavailable</h1><p className="mt-2 text-slate-600 dark:text-slate-300">{error}</p><button onClick={refresh} className={`${button} mt-5`}><RefreshCw size={16}/>Try again</button></section></main>;

  return <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8" aria-labelledby="analytics-title">
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-sm font-semibold uppercase tracking-wide text-indigo-600 dark:text-indigo-300">Your career journey</p><h1 id="analytics-title" className="mt-1 text-3xl font-bold text-slate-900 dark:text-white">Progress analytics</h1><p className="mt-2 text-slate-600 dark:text-slate-300">Track applications, build skills, and move your career goals forward.</p></div><div className="flex gap-2"><button onClick={refresh} className="rounded-xl border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:text-slate-200"><RefreshCw className="mr-2 inline" size={16}/>Refresh</button><button onClick={exportCsv} className="rounded-xl border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:text-slate-200"><ArrowDownToLine className="mr-2 inline" size={16}/>Export CSV</button></div></header>
    {error && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200">{error}</p>}{notice && <p role="status" className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">{notice}</p>}
    <section className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4" aria-label="Career summary">{[
      { title: 'Profile completion', value: `${stats.completion}%`, detail: 'Keep your profile up to date', Icon: Activity },
      { title: 'Applications', value: applications.length, detail: `${stats.pending} awaiting an update`, Icon: BriefcaseBusiness },
      { title: 'Interviews', value: stats.interview, detail: 'Interviews and shortlists', Icon: TrendingUp },
      { title: 'Skills tracked', value: skills.length, detail: `${goals.filter((goal) => Number(goal.progress) >= 100).length} goals completed`, Icon: Target },
    ].map(({ title, value, detail, Icon }) => <article key={title} className={`${panel} min-w-0 p-3 sm:p-5`}><div className="flex items-center justify-between gap-1 text-[11px] font-medium text-slate-600 dark:text-slate-300 sm:text-sm"><span className="truncate">{title}</span><Icon size={16} className="shrink-0 text-indigo-600 dark:text-indigo-300"/></div><p className="mt-2 truncate text-2xl font-bold text-slate-900 dark:text-white sm:mt-4 sm:text-3xl">{value}</p><p className="mt-1 hidden truncate text-sm text-slate-500 dark:text-slate-400 sm:block">{detail}</p></article>)}</section>
    <section className="grid gap-6 xl:grid-cols-3"><article className={`${panel} p-5 xl:col-span-2`}><div className="mb-5 flex items-center justify-between"><div><h2 className="font-semibold text-slate-900 dark:text-white">Application activity</h2><p className="text-sm text-slate-500 dark:text-slate-400">Your submitted applications over time</p></div><label className="sr-only" htmlFor="analytics-months">Time range</label><select id="analytics-months" className={field} value={months} onChange={(event) => setMonths(Number(event.target.value))}><option value={3}>Last 3 months</option><option value={6}>Last 6 months</option><option value={12}>Last 12 months</option></select></div><div className="h-72"><ResponsiveContainer width="100%" height="100%"><AreaChart data={stats.chart}><defs><linearGradient id="applicationFill" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#4f46e5" stopOpacity={0.25}/><stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.25}/><XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 12 }}/><YAxis allowDecimals={false} tick={{ fill: '#64748b', fontSize: 12 }}/><Tooltip/><Area dataKey="applications" stroke="#4f46e5" fill="url(#applicationFill)" strokeWidth={2}/></AreaChart></ResponsiveContainer></div></article><article className={`${panel} p-5`}><div className="flex items-center gap-3"><BookOpen className="text-sky-600 dark:text-sky-300"/><div><h2 className="font-semibold text-slate-900 dark:text-white">Profile progress</h2><p className="text-sm text-slate-500 dark:text-slate-400">Based on your profile</p></div></div><div className="mt-6 h-3 rounded-full bg-slate-100 dark:bg-slate-800"><div className="h-3 rounded-full bg-indigo-600" style={{ width: `${stats.completion}%` }}/></div><p className="mt-2 text-right text-sm font-semibold text-slate-700 dark:text-slate-200">{stats.completion}% complete</p><p className="mt-4 text-sm leading-6 text-slate-600 dark:text-slate-300">A complete profile helps employers assess your fit. Review your education, skills, contact details, and resume.</p><a href="/student/profile" className="mt-5 inline-flex text-sm font-semibold text-indigo-700 hover:underline dark:text-indigo-300">Update profile →</a></article></section>
    <section className="grid gap-6 xl:grid-cols-2"><article className={`${panel} p-5`}><div className="mb-4 flex items-center justify-between"><div><h2 className="font-semibold text-slate-900 dark:text-white">Career goals</h2><p className="text-sm text-slate-500 dark:text-slate-400">Add, update, or remove your goals</p></div><button className={button} onClick={() => openDialog('goal')}><Plus size={16}/>Add goal</button></div>{goals.length ? <ul className="divide-y divide-slate-200 dark:divide-slate-800">{goals.map((goal) => <li key={goal.id} className="flex gap-3 py-4"><div className="min-w-0 flex-1"><div className="flex justify-between gap-2"><h3 className="font-medium text-slate-900 dark:text-white">{goal.title}</h3><span className="text-xs text-slate-500">{goal.progress || 0}%</span></div>{goal.description && <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{goal.description}</p>}<div className="mt-2 h-2 rounded-full bg-slate-100 dark:bg-slate-800"><div className="h-2 rounded-full bg-emerald-500" style={{ width: `${Math.min(100, Number(goal.progress) || 0)}%` }}/></div>{goal.dueDate && <p className="mt-1 text-xs text-slate-500">Due {goal.dueDate}</p>}</div><button onClick={() => openDialog('goal', goal)} aria-label={`Edit ${goal.title}`} className="rounded-lg px-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">✎</button><button disabled={saving} onClick={() => remove('goal', goal.id)} aria-label={`Delete ${goal.title}`} className="rounded-lg px-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950"><Trash2 size={16}/></button></li>)}</ul> : <div className="rounded-xl border border-dashed border-slate-300 p-6 text-center dark:border-slate-700"><Target className="mx-auto text-slate-400"/><p className="mt-2 text-sm text-slate-600 dark:text-slate-300">No goals tracked yet.</p></div>}</article>
      <article className={`${panel} p-5`}><div className="mb-4 flex items-center justify-between"><div><h2 className="font-semibold text-slate-900 dark:text-white">Skill development</h2><p className="text-sm text-slate-500 dark:text-slate-400">Rate your current level from 1 to 5</p></div><button className={button} onClick={() => openDialog('skill')}><Plus size={16}/>Add skill</button></div>{skills.length ? <ul className="space-y-3">{skills.map((skill) => <li key={skill.id} className="flex items-center gap-3 rounded-xl border border-slate-200 p-4 dark:border-slate-800"><div className="min-w-0 flex-1"><div className="flex justify-between gap-2"><h3 className="font-medium text-slate-900 dark:text-white">{skill.name}</h3><span className="text-xs text-slate-500">Level {skill.level || 1}/{skill.target || 5}</span></div><div className="mt-2 flex gap-1" aria-label={`${skill.name}, level ${skill.level} of ${skill.target}`} role="img">{[1,2,3,4,5].map((level) => <span key={level} className={`h-2 flex-1 rounded-full ${level <= Number(skill.level || 1) ? 'bg-indigo-600' : 'bg-slate-100 dark:bg-slate-800'}`}/>)}</div></div><button onClick={() => openDialog('skill', skill)} aria-label={`Edit ${skill.name}`} className="rounded-lg px-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">✎</button><button disabled={saving} onClick={() => remove('skill', skill.id)} aria-label={`Delete ${skill.name}`} className="rounded-lg px-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950"><Trash2 size={16}/></button></li>)}</ul> : <div className="rounded-xl border border-dashed border-slate-300 p-6 text-center dark:border-slate-700"><TrendingUp className="mx-auto text-slate-400"/><p className="mt-2 text-sm text-slate-600 dark:text-slate-300">No skills tracked yet.</p></div>}</article></section>
    <section className={`${panel} flex gap-3 p-5`}><CircleHelp className="shrink-0 text-indigo-600 dark:text-indigo-300"/><p className="text-sm leading-6 text-slate-600 dark:text-slate-300"><strong className="text-slate-900 dark:text-white">About your analytics.</strong> Application activity is read from your submitted applications. Profile completion comes from your student profile. Goals and skills are private to your account and can be created, edited, and deleted here.</p></section>
    {dialog && <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) setDialog(null); }}><section role="dialog" aria-modal="true" aria-labelledby="analytics-dialog-title" className={`${panel} w-full max-w-lg p-6`}><div className="mb-5 flex justify-between"><h2 id="analytics-dialog-title" className="text-lg font-semibold text-slate-900 dark:text-white">{dialog.item ? 'Edit' : 'Add'} {dialog.type === 'goal' ? 'career goal' : 'skill'}</h2><button onClick={() => setDialog(null)} aria-label="Close dialog"><X/></button></div><form onSubmit={submit} className="space-y-4">{dialog.type === 'goal' ? <><label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Title<input required maxLength={100} className={field} value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })}/></label><label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Description<textarea maxLength={500} rows={3} className={field} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })}/></label><div className="grid grid-cols-2 gap-4"><label className="text-sm font-medium text-slate-700 dark:text-slate-200">Due date<input type="date" className={field} value={form.dueDate} onChange={(event) => setForm({ ...form, dueDate: event.target.value })}/></label><label className="text-sm font-medium text-slate-700 dark:text-slate-200">Progress %<input type="number" min="0" max="100" className={field} value={form.progress} onChange={(event) => setForm({ ...form, progress: event.target.value })}/></label></div></> : <><label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Skill<input required maxLength={80} className={field} value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })}/></label><div className="grid grid-cols-2 gap-4">{['level', 'target'].map((key) => <label key={key} className="text-sm font-medium capitalize text-slate-700 dark:text-slate-200">{key}<select className={field} value={form[key]} onChange={(event) => setForm({ ...form, [key]: event.target.value })}>{[1,2,3,4,5].map((value) => <option key={value} value={value}>Level {value}</option>)}</select></label>)}</div></>}<div className="flex justify-end gap-2"><button type="button" onClick={() => setDialog(null)} className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm dark:border-slate-700 dark:text-slate-200">Cancel</button><button disabled={saving} className={button}>{saving ? 'Saving…' : <><Check size={16}/>Save</>}</button></div></form></section></div>}
  </main>;
}
