import { useEffect, useMemo, useState } from 'react';
import { CalendarPlus, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

import { subscribeToActiveJobs, subscribeToStudentApplications, subscribeToStudentDocuments } from '../../services/studentServices';
import { useAuth } from '../../context/AuthContext';

const asDate = (value) => {
  const date = value?.toDate ? value.toDate() : value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const Deadlines = () => {
  const { currentUser } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let ready = 0;
    const sources = currentUser?.uid ? 3 : 1;
    const markReady = () => { ready += 1; if (ready >= sources) setLoading(false); };
    const onError = (loadError) => { setError(loadError.message || 'Unable to load live deadline data.'); markReady(); };
    const stopJobs = subscribeToActiveJobs((records) => { setJobs(records); markReady(); }, onError);
    const stopApplications = currentUser?.uid ? subscribeToStudentApplications(currentUser.uid, (records) => { setApplications(records); markReady(); }, onError) : () => {};
    const stopDocuments = currentUser?.uid ? subscribeToStudentDocuments(currentUser.uid, (records) => { setDocuments(records); markReady(); }, onError) : () => {};
    return () => { stopJobs(); stopApplications(); stopDocuments(); };
  }, [currentUser?.uid]);

  const deadlines = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return jobs.map((job) => {
      const deadline = asDate(job.deadline);
      if (!deadline) return null;
      const application = applications.find((item) => item.jobId === job.id && String(item.status || '').toLowerCase() !== 'withdrawn');
      return {
        id: job.id,
        title: job.title || job.jobDetails?.title || 'Opportunity deadline',
        institution: job.company || job.companyName || job.jobDetails?.company || 'Employer details available',
        type: job.jobType || job.type || job.jobDetails?.jobType || 'job',
        deadline,
        application,
        status: application ? 'applied' : 'pending',
      };
    }).filter((item) => item && item.deadline >= today).sort((left, right) => left.deadline - right.deadline);
  }, [applications, jobs]);

  const applicationProgress = jobs.length ? Math.min(100, Math.round((applications.length / jobs.length) * 100)) : 0;
  const documentProgress = Math.min(100, Math.round((documents.length / 5) * 100));
  const getDaysRemaining = (deadline) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return Math.max(0, Math.ceil((deadline - today) / (1000 * 60 * 60 * 24)));
  };
  const getStatusBadge = (status) => {
    const classes = status === 'applied' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700';
    return <span className={`inline-flex rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-wide ${classes}`}>{status}</span>;
  };
  const reminderLink = (item) => ({
    pathname: '/student/calendar',
    search: `?title=${encodeURIComponent(`${item.title} deadline`)}&date=${encodeURIComponent(item.deadline.toISOString())}`,
  });

  return (
    <main className="w-full px-4 py-6 sm:px-6 lg:px-8">
      <header className="mb-6">
        <p className="text-sm font-medium text-brand-700 dark:text-brand-300">Stay on track</p>
        <h1 className="mt-1 text-2xl font-semibold text-slate-900 dark:text-slate-100">Deadlines &amp; Important Dates</h1>
      </header>

      <section className="mb-6 rounded-xl border border-slate-200 bg-white p-5 shadow-card dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Upcoming opportunity deadlines</h2>
          <span className="text-xs text-slate-500 dark:text-slate-400">Live from published opportunities</span>
        </div>

        {loading && <p className="text-sm text-slate-500">Loading live deadlines...</p>}
        {error && <p role="alert" className="mb-3 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200">{error}</p>}
        {!loading && deadlines.length === 0 && <div className="rounded-lg border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">No upcoming deadlines found in your current opportunities.</div>}
        {!loading && deadlines.length > 0 && <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-300">
              <tr>
                <th className="pb-3 pr-4 font-medium">Opportunity</th>
                <th className="pb-3 pr-4 font-medium">Institution/Company</th>
                <th className="pb-3 pr-4 font-medium">Type</th>
                <th className="pb-3 pr-4 font-medium">Deadline</th>
                <th className="pb-3 pr-4 font-medium">Days left</th>
                <th className="pb-3 pr-4 font-medium">Status</th>
                <th className="pb-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {deadlines.map((item) => {
                const daysLeft = getDaysRemaining(item.deadline);
                return (
                  <tr key={item.id} className="align-middle">
                    <td className="py-3 pr-4 text-slate-800 dark:text-slate-200">{item.title}</td>
                    <td className="py-3 pr-4 text-slate-600 dark:text-slate-300">{item.institution}</td>
                    <td className="py-3 pr-4"><span className="inline-flex rounded-full bg-brand-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-brand-700">{item.type}</span></td>
                    <td className="py-3 pr-4 text-slate-600 dark:text-slate-300">{item.deadline.toLocaleDateString()}</td>
                    <td className={`py-3 pr-4 font-medium ${daysLeft <= 3 ? 'text-rose-600' : daysLeft <= 7 ? 'text-amber-600' : 'text-slate-600 dark:text-slate-300'}`}>{daysLeft} days</td>
                    <td className="py-3 pr-4">{getStatusBadge(item.status)}</td>
                    <td className="py-3">
                      <div className="flex flex-wrap gap-2">
                        <Link to={item.application ? '/student/applications' : `/student/jobs/apply/${encodeURIComponent(item.id)}`} className="inline-flex items-center gap-1 rounded-lg bg-brand-600 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-brand-700">
                          <ExternalLink className="h-3 w-3" />{item.application ? 'View application' : 'Apply'}
                        </Link>
                        <Link to={reminderLink(item)} className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">
                          <CalendarPlus className="h-3 w-3" />Reminder
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>}
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-card dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Urgent deadlines (3 days or less)</h2>
          <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200">{deadlines.filter((item) => getDaysRemaining(item.deadline) <= 3).length} urgent deadlines require attention</div>
          <ul className="mt-4 space-y-3">
            {deadlines.filter((item) => getDaysRemaining(item.deadline) <= 3).map((item) => (
              <li key={item.id} className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 p-3 dark:border-slate-700">
                <div><p className="font-medium text-slate-800 dark:text-slate-100">{item.title}</p><p className="text-xs text-slate-500">{item.institution}</p></div>
                <span className="rounded-full bg-rose-600 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">{getDaysRemaining(item.deadline)} days</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-card dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Completion progress</h2>
          <div className="mt-4 space-y-4">
            <div>
              <div className="mb-1 flex justify-between text-sm text-slate-600 dark:text-slate-300"><span>Applications vs. open jobs</span><span>{applicationProgress}%</span></div>
              <div className="h-2.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800"><div className="h-full rounded-full bg-emerald-500" style={{ width: `${applicationProgress}%` }} /></div>
            </div>
            <div>
              <div className="mb-1 flex justify-between text-sm text-slate-600 dark:text-slate-300"><span>Document uploads</span><span>{documentProgress}%</span></div>
              <div className="h-2.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800"><div className="h-full rounded-full bg-amber-500" style={{ width: `${documentProgress}%` }} /></div>
            </div>
          </div>
          <div className="mt-6"><Link to="/student/calendar" className="inline-flex rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700">Manage calendar &amp; reminders</Link></div>
        </section>
      </div>
    </main>
  );
};

export default Deadlines;
