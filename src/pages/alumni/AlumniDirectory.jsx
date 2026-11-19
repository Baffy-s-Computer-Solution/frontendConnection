// frontend/src/pages/alumni/AlumniDirectory.jsx
import { useEffect, useMemo, useState } from 'react';
import {
  FaBookOpen, FaBriefcase, FaBuilding, FaChevronLeft, FaChevronRight,
  FaFilter, FaGraduationCap, FaLocationArrow, FaMapPin, FaMagnifyingGlass,
  FaArrowsRotate, FaUserPlus, FaUsers, FaXmark,
  FaDownload,
} from 'react-icons/fa6';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { alumniService } from '../../services/alumniService';

const safe = (v) => (v == null ? '' : String(v));
const AVATAR_FALLBACK = 'https://ui-avatars.com/api/?background=6366f1&color=fff&bold=true&size=128&name=';

const AlumniDirectory = () => {
  const navigate = useNavigate();
  const { currentUser, userProfile } = useAuth();
  const { addSuccessNotification, addErrorNotification } = useNotification();

  const [loading, setLoading] = useState(true);
  const [alumni, setAlumni] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(12);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    industry: '', graduationYear: '', schoolId: '', location: '',
  });
  const [schoolOptions, setSchoolOptions] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [selected, setSelected] = useState(null);
  const [requesting, setRequesting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await alumniService.listAlumni?.({
        page, pageSize, search,
        industry: filters.industry || undefined,
        graduationYear: filters.graduationYear || undefined,
        schoolId: filters.schoolId || undefined,
        location: filters.location || undefined,
      });
      if (res?.success) {
        setAlumni(Array.isArray(res.data?.items) ? res.data.items : []);
        setTotal(res.data?.total || 0);
      } else {
        addErrorNotification('Directory', res?.error || 'Failed to load alumni');
      }
    } catch (e) {
      addErrorNotification('Directory', 'Failed to load alumni');
    } finally {
      setLoading(false);
    }
  };

  const loadSchools = async () => {
    try {
      const res = await alumniService.getLinkedSchools?.();
      if (res?.success) setSchoolOptions(Array.isArray(res.data) ? res.data : []);
    } catch { /* ignore */ }
  };

  useEffect(() => {
    load();
    loadSchools();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, filters]);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / pageSize)), [total, pageSize]);

  const exportVisibleAlumni = () => {
    const columns = ['name', 'position', 'company', 'industry', 'schoolName', 'graduationYear', 'location'];
    const escapeCsv = (value) => {
      const text = safe(value).replace(/[\r\n]+/g, ' ').trim();
      const protectedText = /^[=+\-@]/.test(text) ? `'${text}` : text;
      return `"${protectedText.replace(/"/g, '""')}"`;
    };
    const csv = [columns.join(','), ...alumni.map((person) => columns.map((column) => escapeCsv(person[column])).join(','))].join('\r\n');
    const url = URL.createObjectURL(new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `alumni-directory-page-${page}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const handleRequestConnect = async (alumnus) => {
    if (!alumnus?.id) return;
    setRequesting(true);
    try {
      const res = await alumniService.sendConnectionRequest?.(alumnus.id);
      if (res?.success) {
        addSuccessNotification('Connection', `Request sent to ${safe(alumnus.name)}`);
        setSelected(null);
      } else {
        addErrorNotification('Connection', res?.error || 'Failed to send request');
      }
    } finally {
      setRequesting(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 dark:bg-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1500px]">
        <header className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600">Alumni Network</p>
              <h1 className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100">Alumni directory</h1>
              <p className="mt-1 text-sm text-slate-500">Discover alumni by industry, graduation year, school, or location.</p>
            </div>
            <div className="flex gap-2">
              <button onClick={exportVisibleAlumni} disabled={loading || alumni.length === 0} className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:text-slate-300">
                <FaDownload /> Export page
              </button>
              <button onClick={() => setShowFilters((v) => !v)} className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700">
                <FaFilter /> Filters
              </button>
              <button onClick={() => load()} className="flex items-center gap-2 rounded-lg bg-brand-600 px-3 py-2 text-xs font-semibold text-white hover:bg-brand-700">
                <FaArrowsRotate /> Refresh
              </button>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <div className="relative flex-1">
              <FaMagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value.slice(0, 200))}
                onKeyDown={(e) => e.key === 'Enter' && (setPage(1), load())}
                placeholder="Search by name, company, role…"
                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 dark:border-slate-700 dark:bg-slate-800"
              />
            </div>
            <button onClick={() => { setPage(1); load(); }} className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white">Search</button>
          </div>
        </header>

        {showFilters && (
          <section className="mb-4 grid gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-4 dark:border-slate-700 dark:bg-slate-900">
            <select value={filters.industry} onChange={(e) => { setPage(1); setFilters((p) => ({ ...p, industry: e.target.value })); }} className="rounded-lg border border-slate-200 p-2 text-xs dark:border-slate-700 dark:bg-slate-800">
              <option value="">All industries</option>
              {['Technology', 'Finance', 'Education', 'Healthcare', 'Government', 'NGO', 'Retail', 'Manufacturing'].map((i) => <option key={i} value={i}>{i}</option>)}
            </select>
            <input value={filters.graduationYear} onChange={(e) => { setPage(1); setFilters((p) => ({ ...p, graduationYear: e.target.value.replace(/\D/g, '').slice(0, 4) })); }} placeholder="Graduation year" className="rounded-lg border border-slate-200 p-2 text-xs dark:border-slate-700 dark:bg-slate-800" />
            <select value={filters.schoolId} onChange={(e) => { setPage(1); setFilters((p) => ({ ...p, schoolId: e.target.value })); }} className="rounded-lg border border-slate-200 p-2 text-xs dark:border-slate-700 dark:bg-slate-800">
              <option value="">All schools</option>
              {schoolOptions.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <input value={filters.location} onChange={(e) => { setPage(1); setFilters((p) => ({ ...p, location: e.target.value.slice(0, 100) })); }} placeholder="Location" className="rounded-lg border border-slate-200 p-2 text-xs dark:border-slate-700 dark:bg-slate-800" />
          </section>
        )}

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {loading ? (
            [1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="animate-pulse rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
                <div className="mb-3 h-14 w-14 rounded-full bg-slate-200 dark:bg-slate-800" />
                <div className="mb-2 h-3 w-2/3 rounded bg-slate-200 dark:bg-slate-800" />
                <div className="h-2 w-1/2 rounded bg-slate-200 dark:bg-slate-800" />
              </div>
            ))
          ) : alumni.length === 0 ? (
            <div className="col-span-full rounded-xl border border-slate-200 bg-white p-10 text-center dark:border-slate-700 dark:bg-slate-900">
              <FaUsers className="mx-auto mb-3 h-10 w-10 text-slate-300" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">No alumni found</p>
              <p className="mt-1 text-xs text-slate-500">Try adjusting your filters or search query.</p>
            </div>
          ) : (
            alumni.map((a) => (
              <button
                key={a.id}
                onClick={() => setSelected(a)}
                className="rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:shadow-md dark:border-slate-700 dark:bg-slate-900"
              >
                <img
                  src={a.photoURL || a.profilePhoto || `${AVATAR_FALLBACK}${encodeURIComponent(safe(a.name || 'A'))}`}
                  alt=""
                  loading="lazy" referrerPolicy="no-referrer"
                  className="mb-3 h-14 w-14 rounded-full object-cover ring-2 ring-white dark:ring-slate-800"
                  onError={(e) => { e.currentTarget.src = `${AVATAR_FALLBACK}${encodeURIComponent(safe(a.name || 'A'))}`; }}
                />
                <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">{safe(a.name)}</p>
                <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-slate-500"><FaBriefcase /> {safe(a.position || 'Alumni')}</p>
                {a.company && <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-slate-500"><FaBuilding /> {safe(a.company)}</p>}
                {a.schoolName && <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-brand-600"><FaBookOpen /> {safe(a.schoolName)}</p>}
                {a.location && <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-slate-500"><FaMapPin /> {safe(a.location)}</p>}
              </button>
            ))
          )}
        </div>

        <nav className="mt-6 flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-900">
          <span className="text-slate-500">
            {total === 0 ? 'No results' : `Showing ${(page - 1) * pageSize + 1}–${Math.min(page * pageSize, total)} of ${total}`}
          </span>
          <div className="flex items-center gap-2">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className="rounded-lg border border-slate-200 p-2 disabled:opacity-50 dark:border-slate-700"><FaChevronLeft /></button>
            <span className="font-semibold">Page {page} / {totalPages}</span>
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="rounded-lg border border-slate-200 p-2 disabled:opacity-50 dark:border-slate-700"><FaChevronRight /></button>
          </div>
        </nav>

        {selected && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true">
            <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl dark:bg-slate-900">
              <div className="mb-3 flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <img src={selected.photoURL || selected.profilePhoto || `${AVATAR_FALLBACK}${encodeURIComponent(safe(selected.name || 'A'))}`} alt="" className="h-14 w-14 rounded-full object-cover" />
                  <div>
                    <p className="text-base font-semibold text-slate-900 dark:text-slate-100">{safe(selected.name)}</p>
                    <p className="text-xs text-slate-500">{safe(selected.position)} · {safe(selected.company)}</p>
                  </div>
                </div>
                <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-red-500" aria-label="Close"><FaXmark /></button>
              </div>
              <dl className="space-y-2 text-xs">
                {selected.schoolName && <div><dt className="text-slate-500">School</dt><dd className="font-semibold">{safe(selected.schoolName)}</dd></div>}
                {selected.graduationYear && <div><dt className="text-slate-500">Graduation</dt><dd className="font-semibold"><FaGraduationCap className="inline" /> {selected.graduationYear}</dd></div>}
                {selected.industry && <div><dt className="text-slate-500">Industry</dt><dd className="font-semibold">{safe(selected.industry)}</dd></div>}
                {selected.location && <div><dt className="text-slate-500">Location</dt><dd className="font-semibold"><FaLocationArrow className="inline" /> {safe(selected.location)}</dd></div>}
                {Array.isArray(selected.interests) && selected.interests.length > 0 && (
                  <div>
                    <dt className="text-slate-500">Interests</dt>
                    <dd className="mt-1 flex flex-wrap gap-1">
                      {selected.interests.slice(0, 8).map((t, i) => (
                        <span key={i} className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">{safe(t)}</span>
                      ))}
                    </dd>
                  </div>
                )}
              </dl>
              <div className="mt-4 flex justify-end gap-2">
                <button onClick={() => setSelected(null)} className="rounded-lg border px-4 py-2 text-sm">Close</button>
                <button
                  onClick={() => handleRequestConnect(selected)}
                  disabled={requesting || selected.id === currentUser?.uid}
                  className="flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
                >
                  <FaUserPlus /> {requesting ? 'Sending…' : 'Connect'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default AlumniDirectory;
