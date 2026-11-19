/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useMemo, useState } from 'react';
import { BriefcaseBusiness, Bookmark, MapPin, Search } from 'lucide-react';
import { Link } from 'react-router-dom';

import { useAuth } from '../../hooks/useAuth';
import { setStudentJobSaved, subscribeToActiveJobs, subscribeToSavedJobs } from '../../services/studentServices';

const JobMatches = () => {
  const { user, userProfile } = useAuth();
  const studentId = user?.uid || userProfile?.uid;
  const [jobs, setJobs] = useState([]);
  const [saved, setSaved] = useState([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [savingId, setSavingId] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    return subscribeToActiveJobs((records) => { setJobs(records); setIsLoading(false); }, (error) => { setMessage(error.message || 'Unable to load active jobs.'); setIsLoading(false); });
  }, []);
  useEffect(() => {
    if (!studentId) return undefined;
    return subscribeToSavedJobs(studentId, setSaved, (error) => setMessage(error.message || 'Unable to load saved jobs.'));
  }, [studentId]);
  const savedIds = useMemo(() => new Set(saved.map((item) => item.jobId)), [saved]);
  const jobMatches = useMemo(() => jobs.filter((job) => `${job.title || ''} ${job.companyName || ''} ${job.location || ''} ${job.description || ''}`.toLowerCase().includes(search.trim().toLowerCase())), [jobs, search]);
  const toggleSaved = async (job) => {
    if (!studentId) return;
    setSavingId(job.id);
    const result = await setStudentJobSaved(studentId, job.id, !savedIds.has(job.id));
    setMessage(result.success ? (savedIds.has(job.id) ? 'Job removed from saved jobs.' : 'Job saved to your account.') : result.error || 'Unable to update saved job.');
    setSavingId('');
  };

  if (isLoading) return <main className="mx-auto max-w-7xl p-8 text-center text-slate-500">Loading active opportunities...</main>;
  return <main className="min-h-screen bg-slate-50 px-4 py-8 dark:bg-slate-950 sm:px-6 lg:px-8"><div className="mx-auto max-w-7xl"><header className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Career opportunities</p><h1 className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">Job matches</h1><p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Live opportunities from the jobs database.</p></div><span className="text-sm text-slate-500">{jobMatches.length} active roles</span></header><label className="mb-5 flex max-w-xl items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 dark:border-slate-700 dark:bg-slate-900"><Search className="h-4 w-4 text-slate-400"/><input aria-label="Search job matches" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search title, company, or location" className="w-full bg-transparent py-3 text-sm outline-none dark:text-white"/></label>{message && <p role="status" className="mb-4 rounded-xl bg-slate-100 p-3 text-sm text-slate-700 dark:bg-slate-800 dark:text-slate-200">{message}</p>}{jobMatches.length === 0 ? <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center dark:border-slate-700 dark:bg-slate-900"><BriefcaseBusiness className="mx-auto h-9 w-9 text-slate-400"/><h2 className="mt-3 text-lg font-semibold text-slate-900 dark:text-white">No matching opportunities</h2><p className="mt-1 text-sm text-slate-500">Try another search or check back when employers publish jobs.</p></div> : <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{jobMatches.map((job) => <article key={job.id} className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"><div className="flex items-start justify-between gap-3"><div><h2 className="text-lg font-semibold text-slate-900 dark:text-white">{job.title}</h2><p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{job.companyName || 'Employer'}</p></div><button type="button" title={savedIds.has(job.id) ? 'Remove saved job' : 'Save job'} aria-label={savedIds.has(job.id) ? 'Remove saved job' : 'Save job'} disabled={savingId === job.id} onClick={() => toggleSaved(job)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 disabled:opacity-50 dark:hover:bg-slate-800"><Bookmark className={`h-5 w-5 ${savedIds.has(job.id) ? 'fill-current text-indigo-600' : ''}`}/></button></div><p className="mt-3 line-clamp-3 flex-1 text-sm text-slate-600 dark:text-slate-300">{job.description || 'View the opportunity for full details.'}</p><div className="mt-4 flex items-center gap-1 text-xs text-slate-500"><MapPin className="h-4 w-4"/>{job.location || 'Location not specified'}</div><Link to={`/student/jobs/apply/${job.id}`} className="mt-4 inline-flex justify-center rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700">View and apply</Link></article>)}</div>}</div></main>;
};
export default JobMatches;
