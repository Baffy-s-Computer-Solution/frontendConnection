import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBookmark, FaBriefcase, FaCalendarAlt, FaFilter, FaMapMarkerAlt, FaMoneyBillWave, FaSearch, FaSync } from "react-icons/fa";
import { BookmarkCheck, CircleAlert, Send } from 'lucide-react';

import { useAuth } from '../../context/AuthContext';
import {
  setStudentJobSaved,
  subscribeToActiveJobs,
  subscribeToSavedJobs,
  subscribeToStudentApplications,
} from '../../services/studentServices';
import { formatLocation } from '../../utils/formatters';

const formatSalary = (min, max) => {
  if (!min && !max) return 'Negotiable';
  if (!max) return `LSL ${Number(min).toLocaleString()}+`;
  return `LSL ${Number(min).toLocaleString()} - ${Number(max).toLocaleString()}`;
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return 'Open';
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
};

const SearchJobs = ({ internshipsOnly = false }) => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [savedJobs, setSavedJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeToActiveJobs(
      (data) => {
        setJobs(data);
        setLoading(false);
        setError('');
      },
      (loadError) => {
        const isPermissionError = loadError?.code === 'permission-denied' || /permission/i.test(loadError?.message || '');
        setError(isPermissionError
          ? 'Job listings are not readable with the current Firebase rules. Enable public reads for active jobs or provide a student jobs endpoint.'
          : loadError.message || 'Unable to load opportunities.');
        setLoading(false);
      }
    );
    return unsubscribe;
  }, [refreshKey]);

  useEffect(() => {
    const studentId = currentUser?.uid;
    if (!studentId) {
      setSavedJobs([]);
      setApplications([]);
      return undefined;
    }

    const onError = () => setNotice('Some personal activity could not be loaded. Job listings remain available; your account may need updated access permissions.');
    const unsubscribeSaved = subscribeToSavedJobs(studentId, setSavedJobs, onError);
    const unsubscribeApplications = subscribeToStudentApplications(studentId, setApplications, onError);
    return () => {
      unsubscribeSaved();
      unsubscribeApplications();
    };
  }, [currentUser?.uid]);

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const jobType = String(job.type || job.jobType || '').toLowerCase();
      const matchesInternship = !internshipsOnly || jobType === 'internship';
      const matchesType = internshipsOnly || selectedType === 'all' || jobType === selectedType;
      const skills = Array.isArray(job.skills) ? job.skills : [];
      const combined = `${job.title || ''} ${job.companyName || ''} ${formatLocation(job.location)} ${job.description || ''} ${skills.join(' ')}`.toLowerCase();
      const matchesSearch = !searchTerm || combined.includes(searchTerm.toLowerCase());
      return matchesInternship && matchesType && matchesSearch;
    });
  }, [jobs, searchTerm, selectedType, internshipsOnly]);

  const toggleSaved = async (jobId) => {
    if (!currentUser?.uid) {
      setNotice('Sign in to save opportunities.');
      return;
    }
    const isSaved = savedJobs.some((savedJob) => savedJob.jobId === jobId);
    const result = await setStudentJobSaved(currentUser.uid, jobId, !isSaved);
    setNotice(result.success ? (isSaved ? 'Opportunity removed from saved jobs.' : 'Opportunity saved.') : result.error);
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 dark:bg-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Career hub</p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900 dark:text-slate-100">{internshipsOnly ? 'Search Internships' : 'Search Jobs'}</h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-brand-500 hover:text-brand-600 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
              onClick={() => setSelectedType((prev) => (prev === 'all' ? 'full-time' : 'all'))}
            >
              <FaFilter />
              {selectedType === 'all' ? 'All types' : 'Filtered'}
            </button>
            <button
              type="button"
              onClick={() => setRefreshKey((value) => value + 1)}
              aria-label="Refresh job listings"
              title="Refresh job listings"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-brand-500 hover:text-brand-600 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
            >
              <FaSync />
              Refresh
              
            </button>
          </div>
        </header>

        <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <label className="relative flex-1">
              <span className="sr-only">Search {internshipsOnly ? 'internships' : 'jobs'}</span>
              <FaSearch className="pointer-events-none absolute left-3 top-3.5 text-slate-400" />
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder={`Search ${internshipsOnly ? 'internships' : 'jobs'}, companies, or skills`}
                className="w-full rounded-xl border border-slate-300 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-brand-500 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100"
              />
            </label>

            <select
              value={internshipsOnly ? 'internship' : selectedType}
              onChange={(event) => setSelectedType(event.target.value)}
              disabled={internshipsOnly}
              className="rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-brand-500 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100"
            >
              <option value="all">All roles</option>
              <option value="full-time">Full-time</option>
              <option value="internship">Internship</option>
              <option value="contract">Contract</option>
            </select>
          </div>
        </section>

        <section className="space-y-4">
          {loading ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center dark:border-slate-700 dark:bg-slate-900" role="status">
              <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600" />
              <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">Loading jobs...</p>
            </div>
          ) : error ? (
            <div className="flex items-center gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200" role="alert">
              <CircleAlert className="h-5 w-5 shrink-0" />{error}
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center dark:border-slate-700 dark:bg-slate-900">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                <FaBriefcase />
              </div>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">No {internshipsOnly ? 'internships' : 'jobs'} found</h2>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Try another keyword or switch the job type.</p>
            </div>
          ) : (
            filteredJobs.map((job) => {
              const isSaved = savedJobs.some((savedJob) => savedJob.jobId === job.id);
              const hasApplied = applications.some((application) => application.jobId === job.id && application.status !== 'withdrawn');
              const skills = Array.isArray(job.skills) ? job.skills : [];
              const jobType = String(job.type || job.jobType || 'opportunity').replace(/-/g, ' ');
              const salaryText = typeof job.salary === 'string'
                ? job.salary
                : job.salary && typeof job.salary === 'object'
                  ? formatSalary(job.salary.min || job.salary.salaryMin, job.salary.max || job.salary.salaryMax)
                  : formatSalary(job.salaryMin, job.salaryMax);

              return (
                <article key={job.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">{job.title}</h2>
                        <span className="inline-flex items-center rounded-full bg-brand-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-brand-700 dark:bg-brand-500/10 dark:text-brand-200">
                          {jobType}
                        </span>
                      </div>

                      <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-slate-600 dark:text-slate-300">
                        <span className="flex items-center gap-1.5"><FaBriefcase className="text-brand-500" />{job.companyName || 'Company'}</span>
                        <span className="flex items-center gap-1.5"><FaMapMarkerAlt className="text-brand-500" />{formatLocation(job.location, 'Location not specified')}</span>
                        <span className="flex items-center gap-1.5"><FaMoneyBillWave className="text-brand-500" />{salaryText}</span>
                      </div>

                      <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-300">{job.description || 'No description provided.'}</p>

                      <div className="mt-4 flex flex-wrap gap-2">
                        {skills.map((skill) => (
                          <span key={skill} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex min-w-[180px] flex-col gap-3 lg:items-end">
                      <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                        <FaCalendarAlt className="text-brand-500" />
                        Deadline: {formatDate(job.deadline)}
                      </div>

                      <div className="flex items-center gap-2 lg:flex-col lg:items-stretch">
                        <button
                          type="button"
                          onClick={() => toggleSaved(job.id)}
                          title={isSaved ? 'Remove saved job' : 'Save job'}
                          aria-label={isSaved ? 'Remove saved job' : 'Save job'}
                          className={`inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition ${
                            isSaved
                              ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-200'
                              : 'border border-slate-300 bg-white text-slate-700 hover:border-brand-500 hover:text-brand-600 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-200'
                          }`}
                        >
                          {isSaved ? <BookmarkCheck className="h-4 w-4" /> : <FaBookmark />}
                        </button>

                        <button
                          type="button"
                          onClick={() => navigate(`/student/jobs/apply/${encodeURIComponent(job.id)}`)}
                          title={hasApplied ? 'Already applied' : 'Apply for job'}
                          aria-label={hasApplied ? 'Already applied' : 'Apply for job'}
                          className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-white transition hover:bg-brand-500 disabled:cursor-not-allowed disabled:opacity-60"
                          disabled={!currentUser || hasApplied}
                        >
                          <Send className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </section>
        {notice && <p className="mt-4 text-sm text-slate-600 dark:text-slate-300" role="status">{notice}</p>}
      </div>
    </main>
  );
};

export default SearchJobs;
