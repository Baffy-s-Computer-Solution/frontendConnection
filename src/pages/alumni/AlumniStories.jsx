// frontend/src/pages/alumni/AlumniStories.jsx
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FaArrowLeft, FaArrowRight, FaBookOpen, FaChevronLeft, FaChevronRight,
  FaEdit, FaFilter, FaHeart, FaPenNib, FaQuoteLeft, FaSearch, FaShareAlt,
  FaStar, FaSync, FaTimes, FaTrash, FaUpload, FaUser, FaUsers,
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { alumniService } from '../../services/alumniService';
import { formatDate, truncateText } from '../../utils/formatters';

const ENV = import.meta.env.VITE_APP_ENVIRONMENT || 'production';
const safeLog = (...a) => { if (ENV !== 'production') console.debug('[Stories]', ...a); };
const safe = (v) => (v == null ? '' : String(v));
const MAX_COVER_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const AVATAR = 'https://ui-avatars.com/api/?background=6366f1&color=fff&bold=true&size=128&name=';

const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'career', label: 'Career' },
  { id: 'entrepreneurship', label: 'Entrepreneurship' },
  { id: 'community', label: 'Community' },
  { id: 'research', label: 'Research' },
  { id: 'leadership', label: 'Leadership' },
  { id: 'giving-back', label: 'Giving back' },
];

const StoryCard = ({ story, onOpen, onLike, liked }) => (
  <article className="group overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md dark:border-slate-700 dark:bg-slate-900">
    <button onClick={() => onOpen(story)} className="block w-full text-left">
      {story.coverImage && <img src={story.coverImage} alt={safe(story.title)} loading="lazy" referrerPolicy="no-referrer" className="h-40 w-full object-cover transition group-hover:scale-105" onError={(e) => { e.currentTarget.style.display = 'none'; }} />}
      <div className="p-4">
        <div className="mb-1 flex items-center gap-2">
          <img src={story.authorPhoto || `${AVATAR}${encodeURIComponent(safe(story.authorName || 'A'))}`} alt="" className="h-6 w-6 rounded-full object-cover" onError={(e) => { e.currentTarget.src = `${AVATAR}${encodeURIComponent(safe(story.authorName || 'A'))}`; }} />
          <p className="truncate text-[11px] text-slate-500">{safe(story.authorName)}</p>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-slate-600 dark:bg-slate-800">{safe(story.category)}</span>
        </div>
        <h3 className="line-clamp-2 text-sm font-semibold text-slate-900 dark:text-slate-100">{safe(story.title)}</h3>
        <p className="mt-1 line-clamp-3 text-xs text-slate-600 dark:text-slate-300">{truncateText(safe(story.excerpt || story.content || ''), 160)}</p>
      </div>
    </button>
    <footer className="flex items-center justify-between border-t border-slate-100 px-4 py-2 text-[11px] text-slate-500 dark:border-slate-800">
      <span>{formatDate(story.createdAt?.toDate?.() || story.createdAt)}</span>
      <button onClick={() => onLike(story)} className={`flex items-center gap-1 ${liked ? 'text-red-500' : ''}`}>
        <FaHeart /> {story.likesCount || 0}
      </button>
    </footer>
  </article>
);

const AlumniStories = () => {
  const { currentUser, userProfile } = useAuth();
  const { addSuccessNotification, addErrorNotification } = useNotification();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stories, setStories] = useState([]);
  const [likedIds, setLikedIds] = useState(new Set());
  const [tab, setTab] = useState('feed'); // feed | mine | write
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 9;
  const [activeStory, setActiveStory] = useState(null);
  const [composerOpen, setComposerOpen] = useState(false);
  const [composer, setComposer] = useState({ id: null, title: '', category: 'career', excerpt: '', content: '', coverImage: null });
  const [publishing, setPublishing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [stats, setStats] = useState({ total: 0, mine: 0, likes: 0 });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await alumniService.listAlumniStories?.({ search, category: category === 'all' ? undefined : category });
      if (res?.success) {
        const list = Array.isArray(res.data) ? res.data : [];
        setStories(list);
        setLikedIds(new Set(list.filter((s) => s.isLiked).map((s) => s.id)));
        setStats({ total: list.length, mine: list.filter((s) => s.authorId === currentUser?.uid).length, likes: list.reduce((a, s) => a + (s.likesCount || 0), 0) });
      }
    } catch (e) {
      safeLog(e);
      addErrorNotification('Stories', 'Failed to load');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [search, category, currentUser?.uid, addErrorNotification]);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    return stories.filter((s) => {
      if (tab === 'mine' && s.authorId !== currentUser?.uid) return false;
      if (category !== 'all' && s.category !== category) return false;
      const q = search.toLowerCase();
      if (q && !`${s.title || ''} ${s.excerpt || ''} ${s.content || ''}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [stories, tab, category, search, currentUser?.uid]);

  const paged = useMemo(() => filtered.slice((page - 1) * pageSize, page * pageSize), [filtered, page]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

  const toggleLike = async (story) => {
    const isLiked = likedIds.has(story.id);
    try {
      const res = isLiked ? await alumniService.unlikeAlumniStory?.(story.id) : await alumniService.likeAlumniStory?.(story.id);
      if (res?.success) {
        setLikedIds((prev) => {
          const next = new Set(prev);
          isLiked ? next.delete(story.id) : next.add(story.id);
          return next;
        });
        setStories((prev) => prev.map((s) => s.id === story.id ? { ...s, likesCount: Math.max(0, (s.likesCount || 0) + (isLiked ? -1 : 1)) } : s));
      }
    } catch { /* silent */ }
  };

  const openComposer = (story = null) => {
    if (story) setComposer({ id: story.id, title: story.title, category: story.category || 'career', excerpt: story.excerpt || '', content: story.content || '', coverImage: null });
    else setComposer({ id: null, title: '', category: 'career', excerpt: '', content: '', coverImage: null });
    setComposerOpen(true);
  };

  const handleCover = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) { addErrorNotification('Cover', 'JPG, PNG, WEBP only'); return; }
    if (file.size > MAX_COVER_BYTES) { addErrorNotification('Cover', 'Max 5MB'); return; }
    setComposer((c) => ({ ...c, coverImage: file }));
  };

  const publish = async () => {
    if (composer.title.trim().length < 5) { addErrorNotification('Story', 'Title must be at least 5 chars'); return; }
    if (composer.content.trim().length < 100) { addErrorNotification('Story', 'Content must be at least 100 chars'); return; }
    setPublishing(true);
    try {
      const payload = {
        title: composer.title.trim().slice(0, 200),
        category: composer.category,
        excerpt: composer.excerpt.trim().slice(0, 300),
        content: composer.content.trim().slice(0, 10000),
        coverImage: composer.coverImage || undefined,
      };
      const res = composer.id
        ? await alumniService.updateAlumniStory?.(composer.id, payload)
        : await alumniService.createAlumniStory?.(payload);
      if (res?.success) {
        addSuccessNotification('Story', composer.id ? 'Story updated' : 'Story published');
        setComposerOpen(false);
        setComposer({ id: null, title: '', category: 'career', excerpt: '', content: '', coverImage: null });
        setTab('feed');
        load();
      } else {
        addErrorNotification('Story', res?.error || 'Save failed');
      }
    } finally {
      setPublishing(false);
    }
  };

  const removeStory = async (story) => {
    try {
      const res = await alumniService.deleteAlumniStory?.(story.id);
      if (res?.success) {
        setStories((prev) => prev.filter((s) => s.id !== story.id));
        setConfirmDelete(null);
        addSuccessNotification('Story', 'Story removed');
      }
    } catch { addErrorNotification('Story', 'Delete failed'); }
  };

  const shareStory = async (story) => {
    const url = `${window.location.origin}/alumni/stories/${story.id}`;
    try {
      if (navigator.share) await navigator.share({ title: story.title, text: story.excerpt, url });
      else if (navigator.clipboard) { await navigator.clipboard.writeText(url); addSuccessNotification('Copied', 'Link copied'); }
    } catch { /* silent */ }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 dark:bg-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1500px]">
        <header className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600">Alumni · Stories</p>
              <h1 className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100">Alumni stories</h1>
              <p className="mt-1 text-sm text-slate-500">Real journeys of grit, growth and giving back.</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => openComposer()} className="flex items-center gap-2 rounded-lg bg-brand-600 px-3 py-2 text-sm font-semibold text-white hover:bg-brand-700"><FaPenNib /> Write story</button>
              <button onClick={() => { setRefreshing(true); load(); }} disabled={refreshing} className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700"><FaSync className={refreshing ? 'animate-spin' : ''} /></button>
            </div>
          </div>
        </header>

        <div className="mb-6 grid gap-3 sm:grid-cols-3">
          {[
            { label: 'Stories published', value: stats.total, icon: FaBookOpen, bg: 'bg-brand-100', accent: 'text-brand-600' },
            { label: 'My stories', value: stats.mine, icon: FaUser, bg: 'bg-emerald-100', accent: 'text-emerald-600' },
            { label: 'Total likes', value: stats.likes, icon: FaHeart, bg: 'bg-rose-100', accent: 'text-rose-600' },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
              <div className="flex items-start justify-between"><div><p className="text-xs text-slate-500">{s.label}</p><p className="mt-1 text-2xl font-bold">{s.value}</p></div><span className={`flex h-10 w-10 items-center justify-center rounded-lg ${s.bg}`}><s.icon className={`h-4 w-4 ${s.accent}`} /></span></div>
            </div>
          ))}
        </div>

        <div className="mb-4 flex flex-wrap gap-1 rounded-xl border border-slate-200 bg-white p-1 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          {[{ id: 'feed', label: 'Feed' }, { id: 'mine', label: 'My stories' }, { id: 'write', label: 'Write' }].map((t) => (
            <button key={t.id} onClick={() => { if (t.id === 'write') openComposer(); else { setTab(t.id); setPage(1); } }} className={`flex-1 rounded-lg px-3 py-2 text-xs font-semibold ${tab === t.id ? 'bg-brand-600 text-white shadow' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'}`}>{t.label}</button>
          ))}
        </div>

        <div className="mb-4 flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:flex-row">
          <div className="relative flex-1">
            <FaSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={(e) => { setSearch(e.target.value.slice(0, 100)); setPage(1); }} placeholder="Search stories…" className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm dark:border-slate-700 dark:bg-slate-800" />
          </div>
          <button onClick={() => setShowFilters((v) => !v)} className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs dark:border-slate-700"><FaFilter /> Filters</button>
        </div>

        {showFilters && (
          <div className="mb-4 flex flex-wrap gap-1 rounded-xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            {CATEGORIES.map((c) => (
              <button key={c.id} onClick={() => { setCategory(c.id); setPage(1); }} className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${category === c.id ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'}`}>{c.label}</button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-64 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />)}</div>
        ) : filtered.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-10 text-center dark:border-slate-700 dark:bg-slate-900">
            <FaBookOpen className="mx-auto mb-3 h-10 w-10 text-slate-300" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">No stories yet</p>
            <p className="mt-1 text-xs text-slate-500">Be the first to share your journey with the community.</p>
            <button onClick={() => openComposer()} className="mt-3 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white">Write a story</button>
          </div>
        ) : (
          <>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {paged.map((s) => <StoryCard key={s.id} story={s} onOpen={setActiveStory} onLike={toggleLike} liked={likedIds.has(s.id)} />)}
            </div>
            {totalPages > 1 && (
              <div className="mt-4 flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-900">
                <span className="text-slate-500">Page {page} of {totalPages}</span>
                <div className="flex gap-2">
                  <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="rounded border p-1.5 disabled:opacity-50 dark:border-slate-700"><FaChevronLeft /></button>
                  <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="rounded border p-1.5 disabled:opacity-50 dark:border-slate-700"><FaChevronRight /></button>
                </div>
              </div>
            )}
          </>
        )}

        {activeStory && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 p-4" role="dialog" aria-modal="true">
            <div className="mx-auto mt-8 w-full max-w-2xl rounded-xl bg-white p-5 shadow-xl dark:bg-slate-900">
              <div className="mb-3 flex items-center justify-between">
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold dark:bg-slate-800">{safe(activeStory.category)}</span>
                <div className="flex gap-2">
                  {activeStory.authorId === currentUser?.uid && (
                    <>
                      <button onClick={() => { openComposer(activeStory); setActiveStory(null); }} className="rounded p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"><FaEdit /></button>
                      <button onClick={() => setConfirmDelete(activeStory)} className="rounded p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500"><FaTrash /></button>
                    </>
                  )}
                  <button onClick={() => setActiveStory(null)} className="rounded p-1.5 text-slate-400 hover:text-red-500" aria-label="Close"><FaTimes /></button>
                </div>
              </div>
              {activeStory.coverImage && <img src={activeStory.coverImage} alt="" className="mb-3 h-56 w-full rounded-lg object-cover" referrerPolicy="no-referrer" />}
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">{safe(activeStory.title)}</h2>
              <div className="mt-1 mb-3 flex items-center gap-2">
                <img src={activeStory.authorPhoto || `${AVATAR}${encodeURIComponent(safe(activeStory.authorName || 'A'))}`} alt="" className="h-6 w-6 rounded-full" />
                <p className="text-xs text-slate-500">{safe(activeStory.authorName)} · {formatDate(activeStory.createdAt?.toDate?.() || activeStory.createdAt)}</p>
              </div>
              <div className="prose prose-sm max-w-none whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-300">{safe(activeStory.content)}</div>
              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800">
                <button onClick={() => toggleLike(activeStory)} className={`flex items-center gap-1 text-xs font-semibold ${likedIds.has(activeStory.id) ? 'text-red-500' : 'text-slate-500'}`}><FaHeart /> {activeStory.likesCount || 0}</button>
                <button onClick={() => shareStory(activeStory)} className="flex items-center gap-1 text-xs font-semibold text-brand-600"><FaShareAlt /> Share</button>
              </div>
            </div>
          </div>
        )}

        {composerOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 p-4" role="dialog" aria-modal="true">
            <div className="mx-auto mt-6 w-full max-w-2xl rounded-xl bg-white p-5 shadow-xl dark:bg-slate-900">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-base font-semibold">{composer.id ? 'Edit story' : 'Write a story'}</h3>
                <button onClick={() => setComposerOpen(false)} className="text-slate-400 hover:text-red-500" aria-label="Close"><FaTimes /></button>
              </div>
              <input value={composer.title} onChange={(e) => setComposer((c) => ({ ...c, title: e.target.value.slice(0, 200) }))} placeholder="Title (min 5 chars)" className="mb-2 w-full rounded-lg border border-slate-200 p-2 text-sm dark:border-slate-700 dark:bg-slate-800" />
              <select value={composer.category} onChange={(e) => setComposer((c) => ({ ...c, category: e.target.value }))} className="mb-2 w-full rounded-lg border border-slate-200 p-2 text-sm dark:border-slate-700 dark:bg-slate-800">{CATEGORIES.filter((c) => c.id !== 'all').map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}</select>
              <input value={composer.excerpt} onChange={(e) => setComposer((c) => ({ ...c, excerpt: e.target.value.slice(0, 300) }))} placeholder="Short excerpt (optional, max 300)" className="mb-2 w-full rounded-lg border border-slate-200 p-2 text-sm dark:border-slate-700 dark:bg-slate-800" />
              <textarea value={composer.content} onChange={(e) => setComposer((c) => ({ ...c, content: e.target.value.slice(0, 10000) }))} rows={10} placeholder="Your story (min 100 chars)…" className="mb-2 w-full rounded-lg border border-slate-200 p-2 text-sm dark:border-slate-700 dark:bg-slate-800" />
              <div className="mb-3 flex items-center gap-2">
                <input id="cover" type="file" accept={ALLOWED_IMAGE_TYPES.join(',')} onChange={handleCover} className="hidden" />
                <label htmlFor="cover" className="flex cursor-pointer items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs dark:border-slate-700"><FaUpload /> Cover image</label>
                {composer.coverImage && <span className="text-[11px] text-slate-500">{composer.coverImage.name}</span>}
              </div>
              <div className="flex justify-end gap-2">
                <button onClick={() => setComposerOpen(false)} className="rounded-lg border px-4 py-2 text-sm dark:border-slate-700">Cancel</button>
                <button onClick={publish} disabled={publishing} className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{publishing ? 'Publishing…' : composer.id ? 'Update' : 'Publish'}</button>
              </div>
            </div>
          </div>
        )}

        {confirmDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" role="dialog" aria-modal="true">
            <div className="w-full max-w-sm rounded-xl bg-white p-5 shadow-xl dark:bg-slate-900">
              <h3 className="text-base font-semibold">Delete this story?</h3>
              <p className="mt-1 text-xs text-slate-500">This action cannot be undone.</p>
              <div className="mt-4 flex justify-end gap-2">
                <button onClick={() => setConfirmDelete(null)} className="rounded-lg border px-4 py-2 text-sm dark:border-slate-700">Cancel</button>
                <button onClick={() => removeStory(confirmDelete)} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white">Delete</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default AlumniStories;