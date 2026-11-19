import { useEffect, useMemo, useState } from 'react';
import Button from '../../components/ui/Button';
import { Link } from 'react-router-dom';
import { subscribeToActiveJobs, subscribeToStudentApplications, subscribeToStudentDocuments } from '../../services/studentServices';
import { useAuth } from '../../context/AuthContext';

const Deadlines = () => {
  const { currentUser } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let ready = 0;
    const markReady = () => { ready += 1; if (ready >= (currentUser?.uid ? 3 : 1)) setLoading(false); };
    const onError = (loadError) => { setError(loadError.message || 'Unable to load live deadline data.'); markReady(); };
    const stopJobs = subscribeToActiveJobs((records) => { setJobs(records); markReady(); }, onError);
    const stopApplications = currentUser?.uid ? subscribeToStudentApplications(currentUser.uid, (records) => { setApplications(records); markReady(); }, onError) : () => {};
    const stopDocuments = currentUser?.uid ? subscribeToStudentDocuments(currentUser.uid, (records) => { setDocuments(records); markReady(); }, onError) : () => {};
    return () => { stopJobs(); stopApplications(); stopDocuments(); };
  }, [currentUser?.uid]);

  const deadlines = useMemo(() => jobs.filter((job) => job.deadline).map((job) => ({
    id: job.id,
    title: job.title || job.jobDetails?.title || 'Opportunity deadline',
    institution: job.company || job.companyName || job.jobDetails?.company || 'Employer details available',
    type: job.jobType || job.jobDetails?.jobType || 'job',
    deadline: job.deadline?.toDate ? job.deadline.toDate() : new Date(job.deadline),
    status: applications.some((application) => application.jobId === job.id) ? 'applied' : 'pending',
  })), [applications, jobs]);
  const applicationProgress = jobs.length ? Math.round((applications.length / jobs.length) * 100) : 0;
  const documentProgress = Math.min(100, Math.round((documents.length / 5) * 100));

  const getStatusBadge = (status) => {
    const map = {
      applied: 'bg-emerald-100 text-emerald-700',
      pending: 'bg-amber-100 text-amber-700',
      draft: 'bg-sky-100 text-sky-700',
      not_started: 'bg-slate-200 text-slate-700',
    };
    return <span className={`inline-flex rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-wide ${map[status] || map.not_started}`}>{status.replace('_', ' ')}</span>;
  };

  const getDaysRemaining = (deadline) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    return Math.ceil((deadlineDate - today) / (1000 * 60 * 60 * 24));
  };

  return (
    <main className="w-full px-4 py-6 sm:px-6 lg:px-8">
      <h1 className="mb-6 text-2xl font-semibold text-slate-900 dark:text-slate-100">Deadlines & Important Dates</h1>

      <section className="mb-6 rounded-xl border bg-white p-5 shadow-card dark:bg-slate-900">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Upcoming Deadlines</h2>
          <span className="text-xs text-slate-500">Deadlines are derived from live opportunities.</span>
        </div>

        {loading && <p className="text-sm text-slate-500">Loading live deadlines...</p>}
        {error && <p role="alert" className="mb-3 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
        {!loading && deadlines.length === 0 && <div className="dashboard-empty">No upcoming deadlines found in your current opportunities.</div>}
        {!loading && deadlines.length > 0 && <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-300">
              <tr>
                <th className="pb-3 pr-4 font-medium">Opportunity</th>
                <th className="pb-3 pr-4 font-medium">Institution/Company</th>
                <th className="pb-3 pr-4 font-medium">Type</th>
                <th className="pb-3 pr-4 font-medium">Deadline</th>
                <th className="pb-3 pr-4 font-medium">Days Left</th>
                <th className="pb-3 pr-4 font-medium">Status</th>
                <th className="pb-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {deadlines.map((item) => {
                const daysLeft = getDaysRemaining(item.deadline);
                return (
                  <tr key={item.id} className="align-middle">
                    <td className="py-3 pr-4 text-slate-800 dark:text-slate-200">{item.title}</td>
                    <td className="py-3 pr-4 text-slate-600 dark:text-slate-300">{item.institution}</td>
                    <td className="py-3 pr-4"><span className={`inline-flex rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-wide ${item.type === 'job' ? 'bg-brand-100 text-brand-700' : 'bg-emerald-100 text-emerald-700'}`}>{item.type}</span></td>
                    <td className="py-3 pr-4 text-slate-600 dark:text-slate-300">{new Date(item.deadline).toLocaleDateString()}</td>
                    <td className={`py-3 pr-4 font-medium ${daysLeft <= 3 ? 'text-danger' : daysLeft <= 7 ? 'text-amber-600' : 'text-slate-600 dark:text-slate-300'}`}>{daysLeft} days</td>
                    <td className="py-3 pr-4">{getStatusBadge(item.status)}</td>
                    <td className="py-3"><Button variant="outline" size="sm">{item.status === 'not_started' ? 'Start' : 'View'}</Button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>}
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        <section className="rounded-xl border bg-white p-5 shadow-card dark:bg-slate-900">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Urgent Deadlines (≤ 3 days)</h2>
          <div className="mt-4 rounded-lg border border-danger/20 bg-danger-light p-3 text-sm text-danger-dark">{deadlines.filter((item) => getDaysRemaining(item.deadline) <= 3).length} urgent deadlines require attention</div>
          <ul className="mt-4 space-y-3">
            {deadlines.filter((item) => getDaysRemaining(item.deadline) <= 3).map((item) => (
              <li key={item.id} className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 p-3 dark:border-slate-700">
                <div>
                  <p className="font-medium text-slate-800 dark:text-slate-100">{item.title}</p>
                  <p className="text-xs text-slate-500">{item.institution}</p>
                </div>
                <span className="rounded-full bg-danger px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">{getDaysRemaining(item.deadline)} days</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-xl border bg-white p-5 shadow-card dark:bg-slate-900">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Completion Progress</h2>
          <div className="mt-4 space-y-4">
            <div>
              <div className="mb-1 flex justify-between text-sm text-slate-600 dark:text-slate-300"><span>Applications</span><span>{applicationProgress}%</span></div>
              <div className="h-2.5 overflow-hidden rounded-full bg-slate-200"><div className="h-full rounded-full bg-emerald-500" style={{ width: `${applicationProgress}%` }} /></div>
            </div>
            <div>
              <div className="mb-1 flex justify-between text-sm text-slate-600 dark:text-slate-300"><span>Document uploads</span><span>{documentProgress}%</span></div>
              <div className="h-2.5 overflow-hidden rounded-full bg-slate-200"><div className="h-full rounded-full bg-amber-500" style={{ width: `${documentProgress}%` }} /></div>
            </div>
          </div>
          <div className="mt-6 text-center"><Link to="/student/calendar" className="inline-flex rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white">View Calendar</Link></div>
        </section>
      </div>
    </main>
  );
};

export default Deadlines;
