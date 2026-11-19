// frontend/src/pages/alumni/AlumniCareerBoard.jsx
import { useEffect, useMemo, useState } from 'react';
import {
  FaBookmark, FaBriefcase, FaBuilding, FaCalendarAlt, FaExternalLinkAlt,
  FaFilter, FaGlobe, FaMapPin, FaRegBookmark, FaSearch, FaSync, FaTimes,
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { alumniService } from '../../services/alumniService';

const safe = (v) => (v == null ? '' : String(v));

const TYPE_LABEL = {
  fulltime: 'Full-time', parttime: 'Part-time', contract: 'Contract', internship: 'Internship', remote: 'Remote',
};

const CareerBoard = () => {
  const { currentUser } = useAuth();
  const { addSuccessNotification, addErrorNotification } = useNotification();
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState([]);
  const [saved, setSaved] = useState(new Set());
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [location, setLocation] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selected, setSelected] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await alumniService.listAlumniJobs?.({
        search: search || undefined,
        type: type || undefined,
        location: location || undefined,
      });
      if (res?.success) setJobs(Array.isArray(res.data) ? res.data : []);
      else addErrorNotification('Jobs', res?.error || 'Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  const loadSaved = async () => {
    try {
      const res = await alumniService.getSavedJobs?.();
      if (res?.success) setSaved(new Set((res.data || []).map((j) => j.id)));
    } catch { /* ignore */ }
  };

  useEffect(() => { load(); loadSaved(); /* eslint-disable-next-line */ }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return jobs.filter((j) => {
      if (q && !(`${j.title || ''} ${j.company || ''} ${j.description || ''}`.toLowerCase().includes(q))) return false;
      if (type && j.type !== type) return false;
      if (location && !(j.location || '').toLowerCase().includes(location.toLowerCase())) return false;
      return true;
    });
  }, [jobs, search, type, location]);

  const toggleSave = async (job) => {
    if (!job?.id) return;
    const isSaved = saved.has(job.id);
    const res = isSaved ? await alumniService.unsaveJob?.(job.id) : await alumniService.saveJob?.(job.id);
    if (res?.success) {
      setSaved((prev) => {
        const next = new Set(prev);
        isSaved ? next.delete(job.id) : next.add(job.id);
        return next;
      });
      addSuccessNotification('Jobs', isSaved ? 'Removed from saved' : 'Saved');
    }
  };

  const applyToJob = (job) => {
    if (job.applyUrl && /^https?:\/\//i.test(job.applyUrl)) {
      window.open(job.applyUrl, '_blank', 'noopener,noreferrer');
    } else if (job.contactEmail) {
      window.location.href = `mailto:${encodeURIComponent(job.contactEmail)}?subject=${encodeURIComponent(`Application for ${job.title}`)}`;
    } else {
      setSelected(job);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 dark:bg-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1400px]">
        <header className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600">Alumni careers</p>
              <h1 className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100">Career board</h1>
              <p className="mt-1 text-sm text-slate-500">Jobs and opportunities shared by alumni and partner companies.</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowFilters((v) => !v)} className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700">
                <FaFilter /> Filters
              </button>
              <button onClick={load} className="flex items-center gap-2 rounded-lg bg-brand-600 px-3 py-2 text-xs font-semibold text-white hover:bg-brand-700">
                <FaSync /> Refresh
              </button>
            </div>
          </div>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <div className="relative flex-1">
              <FaSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input value={search} onChange={(e) => setSearch(e.target.value.slice(0, 100))} onKeyDown={(e) => e.key === 'Enter' && load()} placeholder="Search jobs by title, company, description…" className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm dark:border-slate-700 dark:bg-slate-800" />
            </div>
            <button onClick={load} className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white">Search</button>
          </div>
        </header>

        {showFilters && (
          <section className="mb-4 grid gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-3 dark:border-slate-700 dark:bg-slate-900">
            <select value={type} onChange={(e) => setType(e.target.value)} className="rounded-lg border border-slate-200 p-2 text-xs dark:border-slate-700 dark:bg-slate-800">
              <option value="">All types</option>
              {Object.entries(TYPE_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
            <input value={location} onChange={(e) => setLocation(e.target.value.slice(0, 100))} placeholder="Location" className="rounded-lg border border-slate-200 p-2 text-xs dark:border-slate-700 dark:bg-slate-800" />
            <button onClick={() => { setType(''); setLocation(''); }} className="rounded-lg border border-slate-200 p-2 text-xs dark:border-slate-700">Clear filters</button>
          </section>
        )}

        <section className="space-y-3">
          {loading ? (
            [1, 2, 3].map((i) => <div key={i} className="h-32 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />)
          ) : filtered.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-white p-10 text-center dark:border-slate-700 dark:bg-slate-900">
              <FaBriefcase className="mx-auto mb-3 h-10 w-10 text-slate-300" />
              <p className="text-sm text-slate-600 dark:text-slate-300">No jobs match your search.</p>
            </div>
          ) : (
            filtered.map((job) => {
              const isSaved = saved.has(job.id);
              return (
                <article key={job.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md dark:border-slate-700 dark:bg-slate-900">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex items-start justify-between gap-2">
                        <h3 className="truncate text-base font-semibold text-slate-900 dark:text-slate-100">{safe(job.title)}</h3>
                        {job.type && <span className="rounded-full bg-brand-100 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-brand-700">{TYPE_LABEL[job.type] || safe(job.type)}</span>}
                      </div>
                      <p className="flex items-center gap-1 text-xs text-slate-500"><FaBuilding /> {safe(job.company)}</p>
                      <div className="mt-1 flex flex-wrap gap-3 text-[11px] text-slate-500">
                        {job.location && <span className="flex items-center gap-1"><FaMapPin /> {safe(job.location)}</span>}
                        {job.isRemote && <span className="flex items-center gap-1"><FaGlobe /> Remote</span>}
                        {job.postedAt && <span className="flex items-center gap-1"><FaCalendarAlt /> {new Date(job.postedAt).toLocaleDateString()}</span>}
                      </div>
                      {job.description && <p className="mt-2 line-clamp-2 text-xs text-slate-600 dark:text-slate-300">{safe(job.description)}</p>}
                    </div>
                    <div className="flex gap-2 sm:flex-col">
                      <button
                        onClick={() => toggleSave(job)}
                        aria-label={isSaved ? 'Unsave job' : 'Save job'}
                        className={`flex items-center justify-center rounded-lg border p-2 text-xs ${isSaved ? 'border-amber-300 bg-amber-50 text-amber-600' : 'border-slate-200 text-slate-500 hover:bg-slate-50 dark:border-slate-700'}`}
                      >
                        {isSaved ? <FaBookmark /> : <FaRegBookmark />}
                      </button>
                      <button onClick={() => applyToJob(job)} className="flex items-center gap-1 rounded-lg bg-brand-600 px-3 py-2 text-xs font-semibold text-white hover:bg-brand-700">
                        Apply <FaExternalLinkAlt className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </section>

        {selected && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true">
            <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl dark:bg-slate-900">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-base font-semibold">{safe(selected.title)}</h3>
                <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-red-500" aria-label="Close"><FaTimes /></button>
              </div>
              <p className="mb-2 text-xs text-slate-500">{safe(selected.company)} · {safe(selected.location || 'Remote')}</p>
              <p className="mb-3 whitespace-pre-wrap text-xs text-slate-600 dark:text-slate-300">{safe(selected.description)}</p>
              <div className="flex justify-end">
                <a
                  href={selected.applyUrl && /^https?:\/\//i.test(selected.applyUrl) ? selected.applyUrl : '#'}
                  target="_blank" rel="noopener noreferrer"
                  className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white"
                >
                  Open application
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default CareerBoard;