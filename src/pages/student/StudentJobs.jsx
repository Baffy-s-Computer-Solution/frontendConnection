import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaArrowRight, FaBookmark, FaBriefcase, FaDollarSign, FaFilter, FaMapMarkerAlt, FaSearch, FaUsers, FaUserPlus, FaUserCheck } from "react-icons/fa";

import { useAuth } from '../../context/AuthContext';
import { subscribeToActiveJobs, subscribeToSavedJobs, setStudentJobSaved, subscribeToCompanyFollows, setCompanyFollow } from '../../services/studentServices';
import { formatLocation } from '../../utils/formatters';


const jobTypeClasses = {
  'full-time': 'bg-brand-100 text-brand-700 dark:bg-brand-500/10 dark:text-brand-200',
  'part-time': 'bg-sky-100 text-sky-700 dark:bg-sky-500/10 dark:text-sky-200',
  internship: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200',
  contract: 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-200',
  remote: 'bg-violet-100 text-violet-700 dark:bg-violet-500/10 dark:text-violet-200',
};

const formatSalary = (min, max, currency = 'USD') => {
  if (!min && !max) return 'Negotiable';
  if (!max) return `${currency} ${min?.toLocaleString() || '0'}+`;
  return `${currency} ${(min || 0).toLocaleString()} - ${(max || 0).toLocaleString()}`;
};

const formatDate = (dateString) => {
  if (!dateString) return 'Open';
  const date = dateString?.toDate ? dateString.toDate() : new Date(dateString);
  if (Number.isNaN(date.getTime())) return 'Open';
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
};

function StudentJobs() {
  const { currentUser } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [followedCompanies, setFollowedCompanies] = useState(new Set());
  const [followBusy, setFollowBusy] = useState('');

  useEffect(() => {
    let receivedFirstSnapshot = false;
    const stopJobs = subscribeToActiveJobs((records) => { receivedFirstSnapshot = true; setJobs(records); setLoading(false); setError(''); }, (loadError) => { setError(loadError.message || 'Unable to load jobs.'); setLoading(false); });
    const stopSaved = currentUser?.uid ? subscribeToSavedJobs(currentUser.uid, (records) => setSavedJobs(records.map((item) => item.jobId)), () => {}) : () => {};
    const stopFollows = currentUser?.uid ? subscribeToCompanyFollows(currentUser.uid, setFollowedCompanies, () => {}) : () => {};
    const timeout = window.setTimeout(() => {
      if (!receivedFirstSnapshot) setLoading(false);
    }, 12000);
    return () => { window.clearTimeout(timeout); stopJobs(); stopSaved(); stopFollows(); };
  }, [currentUser?.uid]);
  useEffect(() => { if (jobs.length || error) setLoading(false); }, [jobs, error]);

  const filteredJobs = useMemo(() => {
    return [...jobs]
      .filter((job) => {
        const matchesType = selectedType === 'all' || job.type === selectedType;
        const matchesSearch =
          !searchTerm ||
          String(job.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          String(job.companyName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          formatLocation(job.location).toLowerCase().includes(searchTerm.toLowerCase()) ||
          (Array.isArray(job.skills) ? job.skills : []).some((skill) => String(skill).toLowerCase().includes(searchTerm.toLowerCase()));

        return matchesType && matchesSearch;
      })
      .sort((a, b) => {
        const date = (value) => value?.toDate ? value.toDate().getTime() : new Date(value || 0).getTime();
        return date(b.createdAt || b.datePosted) - date(a.createdAt || a.datePosted);
      });
  }, [jobs, searchTerm, selectedType]);

  const stats = useMemo(() => {
    return {
      total: jobs.length,
      saved: savedJobs.length,
      visible: filteredJobs.length,
    };
  }, [filteredJobs.length, jobs.length, savedJobs.length]);

  const toggleSaved = async (jobId) => {
    if (!currentUser?.uid) return;
    const result = await setStudentJobSaved(currentUser.uid, jobId, !savedJobs.includes(jobId));
    setNotice(result.success ? (savedJobs.includes(jobId) ? 'Job removed from saved jobs.' : 'Job saved.') : result.error || 'Could not update saved jobs.');
  };

  const toggleCompanyFollow = async (companyId) => {
    if (!currentUser?.uid || !companyId) return;
    setFollowBusy(companyId);
    const result = await setCompanyFollow(currentUser.uid, companyId, !followedCompanies.has(companyId));
    setNotice(result.success ? (followedCompanies.has(companyId) ? 'Company unfollowed.' : 'Company followed. You can now receive messages from this company if your privacy settings allow it.') : result.error);
    setFollowBusy('');
  };

  if (loading) {
    return (
      <main className="flex min-h-[50vh] items-center justify-center bg-slate-50 px-4 dark:bg-slate-950">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600" />
          <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">Loading job opportunities...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 dark:bg-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Career hub</p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900 dark:text-slate-100">Job Opportunities</h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-brand-500 hover:text-brand-600 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-brand-400 dark:hover:text-brand-300"
              onClick={() => setSelectedType((prev) => (prev === 'all' ? 'full-time' : 'all'))}
            >
              <FaFilter />
              {selectedType === 'all' ? 'All jobs' : 'Filtered'}
            </button>
            <Link to="/student/documents" className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-500"><FaBriefcase /> Manage documents</Link>
          </div>
        </header>

        <section className="mb-5 grid grid-cols-3 gap-2.5 sm:mb-6 sm:gap-4 md:grid-cols-3">
          {[
            { label: 'Available jobs', value: stats.total, icon: <FaBriefcase className="text-brand-600" /> },
            { label: 'Saved roles', value: stats.saved, icon: <FaBookmark className="text-amber-500" /> },
            { label: 'Matches', value: stats.visible, icon: <FaUsers className="text-emerald-500" /> },
          ].map((item) => (
            <div key={item.label} className="min-w-0 rounded-2xl border border-slate-200 bg-white p-2.5 shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:p-5">
              <div className="flex items-center justify-between gap-1">
                <div className="min-w-0">
                  <div className="truncate text-[9px] font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400 sm:text-xs sm:tracking-[0.2em]">{item.label}</div>
                  <div className="mt-1 text-xl font-bold text-slate-900 dark:text-slate-100 sm:mt-3 sm:text-3xl">{item.value}</div>
                </div>
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-sm dark:bg-slate-800 sm:h-11 sm:w-11 sm:rounded-xl sm:text-lg">{item.icon}</div>
              </div>
            </div>
          ))}
        </section>

        <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <label className="relative flex-1">
              <span className="sr-only">Search jobs</span>
              <FaSearch className="pointer-events-none absolute left-3 top-3.5 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search jobs, companies, or skills"
                className="w-full rounded-xl border border-slate-300 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-brand-500 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100"
              />
            </label>

            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Type</label>
              <select
                value={selectedType}
                onChange={(event) => setSelectedType(event.target.value)}
                className="rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-brand-500 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100"
              >
                <option value="all">All</option>
                <option value="full-time">Full-time</option>
                <option value="part-time">Part-time</option>
                <option value="internship">Internship</option>
                <option value="contract">Contract</option>
                <option value="remote">Remote</option>
              </select>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          {error ? <div role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-800">{error}</div> : filteredJobs.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center dark:border-slate-700 dark:bg-slate-900">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                <FaBriefcase />
              </div>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">No jobs match your search</h2>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Try a different keyword or switch the role type.</p>
            </div>
          ) : (
            filteredJobs.map((job) => (
              <article key={job.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-700 dark:bg-slate-900">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">{job.title}</h2>
              <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ${jobTypeClasses[job.type] || 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200'}`}>
                        {String(job.type || job.jobType || 'opportunity').replace(/-/g, ' ')}
                      </span>
                    </div>

                    <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-slate-600 dark:text-slate-300">
                      <span className="flex items-center gap-1.5"><FaBriefcase className="text-brand-500" />{job.companyName}</span>
                      <span className="flex items-center gap-1.5"><FaMapMarkerAlt className="text-brand-500" />{formatLocation(job.location, 'Location not specified')}</span>
                      <span className="flex items-center gap-1.5"><FaDollarSign className="text-brand-500" />{typeof job.salary === 'string' ? job.salary : formatSalary(job.salaryMin ?? job.salary?.min, job.salaryMax ?? job.salary?.max, job.currency || 'LSL')}</span>
                    </div>

                    <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-300">{job.description}</p>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {(Array.isArray(job.skills) ? job.skills : []).map((skill) => (
                        <span key={skill} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex min-w-[180px] flex-col gap-3 lg:items-end">
                    <div className="text-right text-sm text-slate-600 dark:text-slate-300">
                      <div className="font-medium text-slate-800 dark:text-slate-100">Deadline</div>
                      <div>{formatDate(job.deadline)}</div>
                    </div>

                    <div className="flex items-center gap-2 lg:flex-col lg:items-stretch">
                      {(job.companyId || job.employerId) && <button type="button" disabled={followBusy === (job.companyId || job.employerId)} onClick={() => toggleCompanyFollow(job.companyId || job.employerId)} aria-label={followedCompanies.has(job.companyId || job.employerId) ? `Unfollow ${job.companyName}` : `Follow ${job.companyName}`} title={followedCompanies.has(job.companyId || job.employerId) ? 'Unfollow company' : 'Follow company'} className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-300 bg-white text-slate-700 hover:border-brand-500 hover:text-brand-600 disabled:opacity-50 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-200">{followedCompanies.has(job.companyId || job.employerId) ? <FaUserCheck /> : <FaUserPlus />}</button>}
                        <button
                        type="button"
                        onClick={() => toggleSaved(job.id)}
                        aria-label={savedJobs.includes(job.id) ? 'Remove saved job' : 'Save job'}
                        title={savedJobs.includes(job.id) ? 'Remove saved job' : 'Save job'}
                        className={`inline-flex h-10 w-10 items-center justify-center rounded-xl transition ${savedJobs.includes(job.id) ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-200' : 'border border-slate-300 bg-white text-slate-700 hover:border-brand-500 hover:text-brand-600 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-200 dark:hover:border-brand-400 dark:hover:text-brand-300'}`}
                      >
                        <FaBookmark />
                      </button>

                      <Link to={`/student/jobs/apply/${job.id}`} className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-brand-500">Apply now <FaArrowRight /></Link>
                    </div>
                  </div>
                </div>
              </article>
            ))
          )}
        </section>
        {notice && <p className="mt-4 text-sm text-slate-600 dark:text-slate-300" role="status">{notice}</p>}
      </div>
    </main>
  );
}

export default StudentJobs;


