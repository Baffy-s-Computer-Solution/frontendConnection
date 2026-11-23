// frontend/src/pages/parent/ParentCommunity.jsx
import { supabaseMediaService } from '../../services/supabaseMediaService';
// ============================================================================
// PARENT COMMUNITY - Production Ready
// Social feed | Posts | Likes | Comments | Shares | Realtime | Media gallery
// Firebase | Supabase | supabase | Tailwind CSS
// ============================================================================

import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
  memo,
} from 'react';
import { Link } from 'react-router-dom';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  writeBatch,
  increment,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { supabase } from '../../config/supabase';
import { useAuth } from '../../hooks/useAuth';
import { useParent } from '../../hooks/useParent';
import { useNotifications } from '../../hooks/useNotifications';
import {
  formatRelativeTime,
  truncate,
  debounce,
} from '../../utils/formatters';
import { validateRequired, validateMaxLength } from '../../utils/validators';

// ============================================================================
// TAILWIND UI PRIMITIVES
// ============================================================================

const PageShell = ({ title, subtitle, actions, children, loading, error }) => (
  <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-fuchsia-50/20">
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      <header className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <nav aria-label="Breadcrumb" className="mb-2 flex items-center gap-2 text-xs text-slate-500">
            <Link to="/parent" className="hover:text-fuchsia-600">Parent</Link>
            <span aria-hidden="true">/</span>
            <span className="font-medium text-slate-700">{title}</span>
          </nav>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{title}</h1>
          {subtitle && <p className="mt-1 max-w-2xl text-sm text-slate-600">{subtitle}</p>}
        </div>
        <div className="flex flex-wrap items-center gap-2">{actions}</div>
      </header>

      {error && (
        <div role="alert" className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <svg className="mt-0.5 h-5 w-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <div className="flex-1">{error}</div>
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-40 animate-pulse rounded-2xl border border-slate-200 bg-white/60" />
          ))}
        </div>
      ) : children}
    </div>
  </div>
);

const Btn = ({ children, variant = 'primary', size = 'md', onClick, disabled, loading, type = 'button', className = '', icon, ...rest }) => {
  const base = 'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60';
  const sizes = { sm: 'px-3 py-1.5 text-xs', md: 'px-4 py-2.5 text-sm', lg: 'px-5 py-3 text-base' };
  const variants = {
    primary: 'bg-fuchsia-600 text-white shadow-sm hover:bg-fuchsia-700 focus:ring-fuchsia-500',
    secondary: 'bg-slate-100 text-slate-800 hover:bg-slate-200 focus:ring-slate-400',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    ghost: 'bg-transparent text-slate-700 hover:bg-slate-100 focus:ring-slate-300',
    outline: 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 focus:ring-slate-400',
    success: 'bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-500',
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled || loading} className={`${base} ${sizes[size]} ${variants[variant]} ${className}`} {...rest}>
      {loading ? (
        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
          <path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" fill="currentColor" className="opacity-75" />
        </svg>
      ) : icon ? <span aria-hidden="true">{icon}</span> : null}
      {children}
    </button>
  );
};

const Card = ({ title, subtitle, action, children, className = '', pad = true }) => (
  <section className={`rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md ${className}`}>
    {(title || action) && (
      <header className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
        <div>
          {title && <h2 className="text-sm font-semibold text-slate-900">{title}</h2>}
          {subtitle && <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>}
        </div>
        {action}
      </header>
    )}
    <div className={pad ? 'p-5' : ''}>{children}</div>
  </section>
);

const StatsCard = ({ label, value, icon, tone = 'fuchsia', onClick }) => {
  const tones = {
    fuchsia: 'from-fuchsia-500/10 to-fuchsia-500/0 text-fuchsia-700 ring-fuchsia-200',
    blue: 'from-blue-500/10 to-blue-500/0 text-blue-700 ring-blue-200',
    emerald: 'from-emerald-500/10 to-emerald-500/0 text-emerald-700 ring-emerald-200',
    amber: 'from-amber-500/10 to-amber-500/0 text-amber-700 ring-amber-200',
    rose: 'from-rose-500/10 to-rose-500/0 text-rose-700 ring-rose-200',
  };
  return (
    <div onClick={onClick} className="group cursor-pointer rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{value ?? '—'}</p>
        </div>
        {icon && <span className={`rounded-xl bg-gradient-to-b p-2 ring-1 ${tones[tone]}`}><span aria-hidden="true">{icon}</span></span>}
      </div>
    </div>
  );
};

const Field = ({ label, name, value, onChange, type = 'text', placeholder, required, error, textarea, options, rows = 3, ...rest }) => (
  <div className="w-full">
    {label && <label htmlFor={name} className="mb-1.5 block text-xs font-semibold text-slate-700">{label} {required && <span className="text-red-500">*</span>}</label>}
    {textarea ? (
      <textarea id={name} name={name} value={value ?? ''} onChange={onChange} placeholder={placeholder} rows={rows}
        className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-fuchsia-500 focus:ring-2 focus:ring-fuchsia-500/20 ${error ? 'border-red-400' : 'border-slate-300'}`} {...rest} />
    ) : options ? (
      <select id={name} name={name} value={value ?? ''} onChange={onChange}
        className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-fuchsia-500 focus:ring-2 focus:ring-fuchsia-500/20 ${error ? 'border-red-400' : 'border-slate-300'}`} {...rest}>
        <option value="">Select…</option>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    ) : (
      <input id={name} name={name} type={type} value={value ?? ''} onChange={onChange} placeholder={placeholder}
        className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-fuchsia-500 focus:ring-2 focus:ring-fuchsia-500/20 ${error ? 'border-red-400' : 'border-slate-300'}`} {...rest} />
    )}
    {error && <p className="mt-1 text-xs font-medium text-red-600">{error}</p>}
  </div>
);

const Modal = ({ open, onClose, title, children, footer, size = 'md' }) => {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    if (open) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  if (!open) return null;
  const sizes = { sm: 'max-w-md', md: 'max-w-xl', lg: 'max-w-3xl', xl: 'max-w-5xl' };
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 p-4 backdrop-blur-sm sm:items-center">
      <div role="dialog" aria-modal="true" className={`w-full ${sizes[size]} overflow-hidden rounded-2xl bg-white shadow-2xl`}>
        <header className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h3 className="text-base font-semibold text-slate-900">{title}</h3>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100" aria-label="Close">
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
            </svg>
          </button>
        </header>
        <div className="max-h-[70vh] overflow-y-auto p-5">{children}</div>
        {footer && <footer className="flex items-center justify-end gap-2 border-t border-slate-100 bg-slate-50 px-5 py-3">{footer}</footer>}
      </div>
    </div>
  );
};

const Tabs = ({ tabs, active, onChange }) => (
  <div className="flex flex-wrap gap-1 rounded-xl bg-slate-100 p-1">
    {tabs.map((t) => (
      <button key={t.id} onClick={() => onChange(t.id)}
        className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition ${active === t.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}>
        {t.label}
        {t.count != null && <span className="ml-1.5 rounded-full bg-slate-200 px-1.5 py-0.5 text-[10px] text-slate-700">{t.count}</span>}
      </button>
    ))}
  </div>
);

const EmptyState = ({ title, description, action, icon = '💬' }) => (
  <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white/60 px-6 py-14 text-center">
    <div className="mb-3 rounded-full bg-slate-100 p-3 text-2xl">{icon}</div>
    <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
    {description && <p className="mt-1 max-w-sm text-xs text-slate-500">{description}</p>}
    {action && <div className="mt-4">{action}</div>}
  </div>
);

const Avatar = ({ src, name, size = 'md', ring = false }) => {
  const sizes = { sm: 'h-8 w-8 text-xs', md: 'h-10 w-10 text-sm', lg: 'h-12 w-12 text-base', xl: 'h-16 w-16 text-lg' };
  return (
    <div className={`${sizes[size]} overflow-hidden rounded-full bg-gradient-to-br from-fuchsia-500 to-violet-500 ${ring ? 'ring-2 ring-white' : ''}`}>
      {src ? (
        <img src={src} alt={name} className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center font-bold text-white">
          {(name?.[0] || '?').toUpperCase()}
        </div>
      )}
    </div>
  );
};

const Badge = ({ tone = 'gray', children }) => {
  const tones = {
    gray: 'bg-slate-100 text-slate-700',
    fuchsia: 'bg-fuchsia-100 text-fuchsia-700',
    blue: 'bg-blue-100 text-blue-700',
    emerald: 'bg-emerald-100 text-emerald-700',
    amber: 'bg-amber-100 text-amber-700',
    rose: 'bg-rose-100 text-rose-700',
  };
  return <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${tones[tone]}`}>{children}</span>;
};

const PostMedia = ({ media = [] }) => {
  if (!media.length) return null;
  if (media.length === 1) {
    return (
      <div className="mt-3 overflow-hidden rounded-xl border border-slate-200">
        {media[0].type?.startsWith('video') ? (
          <video src={media[0].url} controls className="max-h-96 w-full object-cover" />
        ) : (
          <img src={media[0].url} alt="post media" className="max-h-96 w-full object-cover" />
        )}
      </div>
    );
  }
  return (
    <div className={`mt-3 grid gap-1 ${media.length === 2 ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-3'}`}>
      {media.slice(0, 4).map((m, i) => (
        <div key={i} className="relative overflow-hidden rounded-xl border border-slate-200">
          {m.type?.startsWith('video') ? (
            <video src={m.url} className="aspect-square h-full w-full object-cover" />
          ) : (
            <img src={m.url} alt="media" className="aspect-square h-full w-full object-cover" />
          )}
          {i === 3 && media.length > 4 && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-2xl font-bold text-white">
              +{media.length - 4}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

// ============================================================================
// REALTIME HOOKS
// ============================================================================

function useRealtimeCollection(collectionName, constraints = [], deps = []) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const constraintsRef = useRef(constraints);
  useEffect(() => { constraintsRef.current = constraints; });

  useEffect(() => {
    setLoading(true);
    let unsub = () => {};
    try {
      const q = query(collection(db, collectionName), ...constraintsRef.current);
      unsub = onSnapshot(q,
        (snap) => { setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() }))); setLoading(false); },
        (err) => { console.error(`[${collectionName}]`, err); setError(err.message); setLoading(false); }
      );
    } catch (err) { setError(err.message); setLoading(false); }
    return () => unsub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collectionName, ...deps]);

  return { items, loading, error };
}

function useSupabaseUpload(folder = 'parent-uploads') {
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const upload = useCallback(async (file, onComplete) => {
    if (!file) return null;
    setUploading(true); setError(null); setProgress(0);
    try {
      const result = await supabaseMediaService.uploadToSupabase(file, folder);
      setProgress(100); onComplete?.(result); return result;
    } catch (uploadError) { setError(uploadError.message); throw uploadError; }
    finally { setUploading(false); }
  }, [folder]);
  return { upload, uploading, progress, error };
}

// ============================================================================
// CRUD HELPERS
// ============================================================================

async function createDocument(collectionName, data, authorId) {
  const payload = { ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp(), createdBy: authorId ?? null, updatedBy: authorId ?? null };
  const ref = await addDoc(collection(db, collectionName), payload);
  return { id: ref.id, ...payload };
}

async function updateDocument(collectionName, id, data, authorId) {
  await updateDoc(doc(db, collectionName, id), { ...data, updatedAt: serverTimestamp(), updatedBy: authorId ?? null });
}

async function deleteDocument(collectionName, id) {
  await deleteDoc(doc(db, collectionName, id));
}

async function syncToSupabase(table, payload, id) {
  try {
    if (id) {
      const { error } = await supabase.from(table).upsert({ id, ...payload });
      if (error) throw error;
    } else {
      const { error } = await supabase.from(table).insert(payload);
      if (error) throw error;
    }
  } catch (err) { console.warn(`[supabase sync:${table}]`, err.message); }
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const ParentCommunity = () => {
  const { user, profile } = useAuth();
  const { refresh: refreshParent } = useParent();
  const { push: pushNotification } = useNotifications();
  const { upload: uploadToSupabase, uploading, progress } = useSupabaseUpload(`parents/${user?.uid ?? 'anon'}/community`);
  const parentId = user?.uid ?? profile?.uid;

  // ---------- Realtime ----------
  const [activeTab, setActiveTab] = useState('feed');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const setSearchDebounced = useMemo(() => debounce((v) => setDebouncedSearch(v), 300), []);
  useEffect(() => { setSearchDebounced(searchQuery); }, [searchQuery, setSearchDebounced]);

  const { items: posts, loading: postsLoading, error: postsError } = useRealtimeCollection(
    'parent_posts',
    [orderBy('createdAt', 'desc'), limit(100)],
    []
  );

  const { items: comments } = useRealtimeCollection(
    'parent_post_comments',
    [orderBy('createdAt', 'asc'), limit(500)],
    []
  );

  const { items: groups } = useRealtimeCollection(
    'parent_groups',
    parentId ? [where('members', 'array-contains', parentId), orderBy('createdAt', 'desc')] : [],
    [parentId]
  );

  const { items: events } = useRealtimeCollection(
    'parent_events',
    [orderBy('scheduledAt', 'asc'), limit(50)],
    []
  );

  const { items: trending } = useRealtimeCollection(
    'community_trending',
    [orderBy('score', 'desc'), limit(10)],
    []
  );

  // ---------- Derived ----------
  const myPosts = useMemo(() => posts.filter((p) => p.authorId === parentId), [posts, parentId]);
  const likedPosts = useMemo(() => posts.filter((p) => (p.likes || []).includes(parentId)), [posts, parentId]);

  const filteredPosts = useMemo(() => {
    let list = posts;
    if (activeTab === 'mine') list = myPosts;
    else if (activeTab === 'liked') list = likedPosts;
    else if (activeTab === 'media') list = list.filter((p) => (p.media || []).length > 0);
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      list = list.filter((p) =>
        p.content?.toLowerCase().includes(q) ||
        p.authorName?.toLowerCase().includes(q) ||
        p.tags?.some?.((t) => t?.toLowerCase().includes(q))
      );
    }
    return list;
  }, [posts, activeTab, debouncedSearch, myPosts, likedPosts]);

  const overviewStats = useMemo(() => ({
    posts: posts.length,
    mine: myPosts.length,
    liked: likedPosts.length,
    groups: groups.length,
    events: events.length,
  }), [posts, myPosts, likedPosts, groups, events]);

  // ---------- Local UI ----------
  const [postModal, setPostModal] = useState({ open: false, editing: null });
  const [commentDrawer, setCommentDrawer] = useState({ open: false, post: null });
  const [groupModal, setGroupModal] = useState({ open: false, editing: null });
  const [confirmDelete, setConfirmDelete] = useState({ open: false, target: null, type: '' });
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, tone = 'success') => {
    setToast({ message, tone });
    setTimeout(() => setToast(null), 3200);
  }, []);

  // ---------- Forms ----------
  const [postForm, setPostForm] = useState({ content: '', media: [], tags: [], visibility: 'public', groupId: '' });
  const [commentForm, setCommentForm] = useState('');
  const [groupForm, setGroupForm] = useState({ name: '', description: '', visibility: 'public', avatarUrl: '' });
  const [tagInput, setTagInput] = useState('');
  const [formErrors, setFormErrors] = useState({});

  // ---------- Validation ----------
  const validatePost = () => {
    const errors = {};
    if (!validateRequired(postForm.content) && !postForm.media?.length) errors.content = 'Write something or add media';
    if (postForm.content && !validateMaxLength(postForm.content, 2000)) errors.content = 'Too long (max 2000 chars)';
    setFormErrors(errors); return Object.keys(errors).length === 0;
  };
  const validateGroup = () => {
    const errors = {};
    if (!validateRequired(groupForm.name)) errors.name = 'Name required';
    setFormErrors(errors); return Object.keys(errors).length === 0;
  };

  // ---------- CRUD: Posts ----------
  const handleSavePost = async () => {
    if (!validatePost()) return;
    try {
      const payload = {
        ...postForm,
        authorId: parentId,
        authorName: profile?.displayName || profile?.name || 'Parent',
        authorAvatar: profile?.photoURL || profile?.avatarUrl || '',
        likes: [],
        likeCount: 0,
        commentCount: 0,
        shareCount: 0,
      };
      if (postModal.editing) {
        await updateDocument('parent_posts', postModal.editing.id, payload, parentId);
        await syncToSupabase('parent_posts', payload, postModal.editing.id);
        showToast('Post updated');
      } else {
        const created = await createDocument('parent_posts', payload, parentId);
        await syncToSupabase('parent_posts', payload, created.id);
        showToast('Post published');
      }
      setPostModal({ open: false, editing: null });
      setPostForm({ content: '', media: [], tags: [], visibility: 'public', groupId: '' });
      setTagInput('');
    } catch (err) { showToast(err.message, 'error'); }
  };

  const handleDeletePost = async () => {
    if (!confirmDelete.target) return;
    try {
      await deleteDocument('parent_posts', confirmDelete.target.id);
      await supabase.from('parent_posts').delete().eq('id', confirmDelete.target.id);
      showToast('Post deleted');
      setConfirmDelete({ open: false, target: null, type: '' });
    } catch (err) { showToast(err.message, 'error'); }
  };

  // ---------- Likes ----------
  const handleToggleLike = async (post) => {
    try {
      const isLiked = (post.likes || []).includes(parentId);
      await updateDocument('parent_posts', post.id, {
        likes: isLiked ? arrayRemove(parentId) : arrayUnion(parentId),
        likeCount: increment(isLiked ? -1 : 1),
      }, parentId);
    } catch (err) { showToast(err.message, 'error'); }
  };

  // ---------- Comments ----------
  const handleAddComment = async () => {
    if (!commentForm.trim() || !commentDrawer.post) return;
    try {
      const payload = {
        postId: commentDrawer.post.id,
        parentId,
        authorId: parentId,
        authorName: profile?.displayName || profile?.name || 'Parent',
        authorAvatar: profile?.photoURL || profile?.avatarUrl || '',
        text: commentForm.trim(),
      };
      const created = await createDocument('parent_post_comments', payload, parentId);
      await syncToSupabase('parent_post_comments', payload, created.id);
      await updateDocument('parent_posts', commentDrawer.post.id, { commentCount: increment(1) }, parentId);
      // Notify post author
      if (commentDrawer.post.authorId && commentDrawer.post.authorId !== parentId) {
        pushNotification?.({
          title: 'New comment',
          body: `${payload.authorName} commented on your post`,
          audience: 'parent',
          recipientId: commentDrawer.post.authorId,
        });
      }
      setCommentForm('');
    } catch (err) { showToast(err.message, 'error'); }
  };

  const handleDeleteComment = async (comment) => {
    try {
      await deleteDocument('parent_post_comments', comment.id);
      await supabase.from('parent_post_comments').delete().eq('id', comment.id);
      await updateDocument('parent_posts', comment.postId, { commentCount: increment(-1) }, parentId);
      showToast('Comment deleted');
    } catch (err) { showToast(err.message, 'error'); }
  };

  // ---------- Shares ----------
  const handleSharePost = async (post) => {
    try {
      await updateDocument('parent_posts', post.id, { shareCount: increment(1) }, parentId);
      const shareUrl = `${window.location.origin}/parent/community/post/${post.id}`;
      if (navigator.share) {
        await navigator.share({ title: 'Shared post', text: post.content, url: shareUrl });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        showToast('Link copied to clipboard');
      }
    } catch (err) { /* user cancelled share */ }
  };

  // ---------- CRUD: Groups ----------
  const handleSaveGroup = async () => {
    if (!validateGroup()) return;
    try {
      const payload = { ...groupForm, parentId, members: [parentId] };
      if (groupModal.editing) {
        await updateDocument('parent_groups', groupModal.editing.id, payload, parentId);
        await syncToSupabase('parent_groups', payload, groupModal.editing.id);
        showToast('Group updated');
      } else {
        const created = await createDocument('parent_groups', payload, parentId);
        await syncToSupabase('parent_groups', payload, created.id);
        showToast('Group created');
      }
      setGroupModal({ open: false, editing: null });
      setGroupForm({ name: '', description: '', visibility: 'public', avatarUrl: '' });
    } catch (err) { showToast(err.message, 'error'); }
  };

  const handleDeleteGroup = async () => {
    if (!confirmDelete.target) return;
    try {
      await deleteDocument('parent_groups', confirmDelete.target.id);
      await supabase.from('parent_groups').delete().eq('id', confirmDelete.target.id);
      showToast('Group deleted');
      setConfirmDelete({ open: false, target: null, type: '' });
    } catch (err) { showToast(err.message, 'error'); }
  };

  // ---------- Uploads ----------
  const handlePostMediaUpload = async (files) => {
    const uploaded = [];
    for (const f of files) {
      try {
        const result = await uploadToSupabase(f);
        uploaded.push({ url: result.secure_url, type: f.type, name: f.name });
      } catch (err) {
        showToast(err.message, 'error');
      }
    }
    setPostForm((f) => ({ ...f, media: [...f.media, ...uploaded] }));
    showToast(`${uploaded.length} file(s) uploaded`);
  };

  const handleGroupAvatarUpload = async (file) => {
    try {
      const result = await uploadToSupabase(file);
      setGroupForm((f) => ({ ...f, avatarUrl: result?.secure_url || '' }));
      showToast('Group avatar uploaded');
    } catch (err) { showToast(err.message, 'error'); }
  };

  const removeMedia = (i) => {
    setPostForm((f) => ({ ...f, media: f.media.filter((_, idx) => idx !== i) }));
  };

  // ---------- Tags ----------
  const addTag = () => {
    const t = tagInput.trim().replace(/^#/, '');
    if (!t) return;
    if (postForm.tags.includes(t)) return;
    setPostForm({ ...postForm, tags: [...postForm.tags, t] });
    setTagInput('');
  };
  const removeTag = (t) => setPostForm({ ...postForm, tags: postForm.tags.filter((x) => x !== t) });

  // ---------- Render Post ----------
  const renderPost = (p) => {
    const liked = (p.likes || []).includes(parentId);
    const isMine = p.authorId === parentId;
    const postComments = comments.filter((c) => c.postId === p.id);

    return (
      <article key={p.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
        <header className="flex items-start gap-3">
          <Avatar src={p.authorAvatar} name={p.authorName} size="md" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="truncate text-sm font-semibold text-slate-800">{p.authorName || 'Parent'}</p>
              {p.visibility === 'group' && <Badge tone="blue">GROUP</Badge>}
              {p.visibility === 'private' && <Badge tone="amber">PRIVATE</Badge>}
            </div>
            <p className="text-xs text-slate-400">{formatRelativeTime(p.createdAt)}</p>
          </div>
          {isMine && (
            <div className="flex items-center gap-1">
              <Btn size="sm" variant="ghost" onClick={() => {
                setPostForm({ content: p.content || '', media: p.media || [], tags: p.tags || [], visibility: p.visibility || 'public', groupId: p.groupId || '' });
                setPostModal({ open: true, editing: p });
              }} title="Edit">✏️</Btn>
              <Btn size="sm" variant="ghost" onClick={() => setConfirmDelete({ open: true, target: p, type: 'post' })} title="Delete">🗑</Btn>
            </div>
          )}
        </header>

        {p.content && <p className="mt-3 whitespace-pre-wrap break-words text-sm text-slate-700">{p.content}</p>}

        <PostMedia media={p.media} />

        {p.tags?.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {p.tags.map((t, i) => (
              <button key={i} onClick={() => setSearchQuery(t)} className="rounded-full bg-fuchsia-50 px-2.5 py-0.5 text-[11px] font-medium text-fuchsia-700 hover:bg-fuchsia-100">
                #{t}
              </button>
            ))}
          </div>
        )}

        <footer className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
          <div className="flex items-center gap-1">
            <button
              onClick={() => handleToggleLike(p)}
              className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition ${liked ? 'bg-rose-50 text-rose-600' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              {liked ? '❤️' : '🤍'} {p.likeCount || 0}
            </button>
            <button
              onClick={() => setCommentDrawer({ open: true, post: p })}
              className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-100"
            >
              💬 {p.commentCount || postComments.length}
            </button>
            <button
              onClick={() => handleSharePost(p)}
              className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-100"
            >
              ↗ Share {p.shareCount || 0}
            </button>
          </div>
        </footer>
      </article>
    );
  };

  // ---------- Render ----------
  const tabs = [
    { id: 'feed', label: 'Feed', count: posts.length },
    { id: 'mine', label: 'My Posts', count: myPosts.length },
    { id: 'liked', label: 'Liked', count: likedPosts.length },
    { id: 'media', label: 'Media' },
    { id: 'groups', label: 'Groups', count: groups.length },
    { id: 'events', label: 'Events', count: events.length },
    { id: 'trending', label: 'Trending' },
  ];

  return (
    <PageShell
      title="Parent Community"
      subtitle="Share, connect, and support each other — real-time social feed for parents."
      loading={postsLoading}
      error={postsError}
      actions={
        <>
          <Btn variant="outline" onClick={refreshParent}>
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
            </svg>
            Refresh
          </Btn>
          <Btn size="sm" variant="outline" onClick={() => setGroupModal({ open: true, editing: null })}>+ Group</Btn>
          <Btn onClick={() => setPostModal({ open: true, editing: null })}>
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" />
            </svg>
            New Post
          </Btn>
        </>
      }
    >
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 rounded-xl px-4 py-3 text-sm font-medium text-white shadow-lg transition ${toast.tone === 'error' ? 'bg-red-600' : 'bg-emerald-600'}`}>
          {toast.message}
        </div>
      )}

      {/* Stats */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatsCard label="Posts" value={overviewStats.posts} tone="fuchsia" icon="📝" />
        <StatsCard label="My Posts" value={overviewStats.mine} tone="blue" icon="✍️" />
        <StatsCard label="Liked" value={overviewStats.liked} tone="rose" icon="❤️" />
        <StatsCard label="Groups" value={overviewStats.groups} tone="emerald" icon="👥" />
        <StatsCard label="Events" value={overviewStats.events} tone="amber" icon="📅" />
      </div>

      {/* Tabs + Search */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Tabs tabs={tabs} active={activeTab} onChange={setActiveTab} />
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search posts, tags, authors…"
          className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm outline-none focus:border-fuchsia-500 focus:ring-2 focus:ring-fuchsia-500/20 sm:w-64"
        />
      </div>

      {/* Quick composer */}
      {activeTab === 'feed' && (
        <div className="mb-6">
          <Card>
            <div className="flex items-start gap-3">
              <Avatar src={profile?.photoURL || profile?.avatarUrl} name={profile?.displayName || 'Parent'} size="md" />
              <button
                onClick={() => setPostModal({ open: true, editing: null })}
                className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-left text-sm text-slate-500 transition hover:bg-slate-100"
              >
                Share something with the community…
              </button>
            </div>
          </Card>
        </div>
      )}

      {/* FEED / MINE / LIKED / MEDIA */}
      {(activeTab === 'feed' || activeTab === 'mine' || activeTab === 'liked' || activeTab === 'media') && (
        <div className="space-y-4">
          {filteredPosts.length === 0 ? (
            <Card>
              <EmptyState
                title={activeTab === 'mine' ? 'You haven\'t posted yet' : activeTab === 'liked' ? 'No liked posts' : activeTab === 'media' ? 'No media posts' : 'No posts yet'}
                description="Be the first to share something!"
                action={<Btn onClick={() => setPostModal({ open: true, editing: null })}>Create Post</Btn>}
              />
            </Card>
          ) : (
            filteredPosts.map(renderPost)
          )}
        </div>
      )}

      {/* GROUPS */}
      {activeTab === 'groups' && (
        <Card title="Groups" action={<Btn size="sm" onClick={() => setGroupModal({ open: true, editing: null })}>Create Group</Btn>}>
          {groups.length === 0 ? (
            <EmptyState title="No groups" description="Create or join a group to connect with parents." icon="👥" action={<Btn onClick={() => setGroupModal({ open: true, editing: null })}>Create Group</Btn>} />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {groups.map((g) => (
                <div key={g.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center gap-3">
                    <Avatar src={g.avatarUrl} name={g.name} size="lg" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-800">{g.name}</p>
                      <p className="text-xs text-slate-500">{g.members?.length || 0} members</p>
                    </div>
                  </div>
                  {g.description && <p className="mt-3 line-clamp-2 text-xs text-slate-500">{g.description}</p>}
                  <div className="mt-4 flex items-center justify-end gap-2">
                    <Btn size="sm" variant="outline" onClick={() => {
                      setGroupForm({ name: g.name || '', description: g.description || '', visibility: g.visibility || 'public', avatarUrl: g.avatarUrl || '' });
                      setGroupModal({ open: true, editing: g });
                    }}>Edit</Btn>
                    <Btn size="sm" variant="danger" onClick={() => setConfirmDelete({ open: true, target: g, type: 'group' })}>Delete</Btn>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* EVENTS */}
      {activeTab === 'events' && (
        <Card title="Community Events">
          {events.length === 0 ? (
            <EmptyState title="No events" description="Community events will appear here." icon="📅" />
          ) : (
            <ul className="divide-y divide-slate-100">
              {events.map((e) => {
                const d = e.scheduledAt?.toDate?.();
                return (
                  <li key={e.id} className="flex items-start gap-4 py-4">
                    <div className="flex h-14 w-14 flex-col items-center justify-center rounded-xl bg-fuchsia-50 text-fuchsia-700">
                      <span className="text-[10px] font-bold uppercase">{d ? d.toLocaleString('default', { month: 'short' }) : '—'}</span>
                      <span className="text-lg font-bold leading-none">{d ? d.getDate() : '—'}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-800">{e.title}</p>
                      <p className="text-xs text-slate-500">{d ? d.toLocaleString() : 'TBD'} · {e.location || 'Location TBD'}</p>
                      {e.description && <p className="truncate text-xs text-slate-400">{e.description}</p>}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      )}

      {/* TRENDING */}
      {activeTab === 'trending' && (
        <Card title="Trending Topics" subtitle="What parents are talking about">
          {trending.length === 0 ? (
            <EmptyState title="Nothing trending yet" description="Popular topics will appear here." icon="🔥" />
          ) : (
            <ul className="divide-y divide-slate-100">
              {trending.map((t, i) => (
                <li key={t.id || i} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-fuchsia-600">#{i + 1}</span>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">#{t.tag || t.topic}</p>
                      <p className="text-xs text-slate-500">{t.postCount || 0} posts · {t.engagementCount || 0} engagements</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSearchQuery(t.tag || t.topic)}
                    className="rounded-lg bg-fuchsia-50 px-3 py-1.5 text-xs font-semibold text-fuchsia-700 hover:bg-fuchsia-100"
                  >
                    View
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Card>
      )}

      {/* POST MODAL */}
      <Modal
        open={postModal.open}
        onClose={() => setPostModal({ open: false, editing: null })}
        title={postModal.editing ? 'Edit Post' : 'New Post'}
        size="lg"
        footer={<><Btn variant="ghost" onClick={() => setPostModal({ open: false, editing: null })}>Cancel</Btn><Btn onClick={handleSavePost}>{postModal.editing ? 'Update' : 'Publish'}</Btn></>}
      >
        <div className="space-y-4">
          <Field
            label="What's on your mind?"
            name="content"
            textarea
            rows={5}
            value={postForm.content}
            onChange={(e) => setPostForm({ ...postForm, content: e.target.value })}
            error={formErrors.content}
            placeholder="Share a thought, ask a question, or celebrate a win…"
          />

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700">Media</label>
            <input
              type="file"
              multiple
              accept="image/*,video/*"
              onChange={(e) => e.target.files && handlePostMediaUpload(Array.from(e.target.files))}
              className="block w-full cursor-pointer text-xs text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-fuchsia-50 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-fuchsia-700 hover:file:bg-fuchsia-100"
            />
            {uploading && <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-200"><div className="h-full bg-fuchsia-600 transition-all" style={{ width: `${progress}%` }} /></div>}
            {postForm.media.length > 0 && (
              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {postForm.media.map((m, i) => (
                  <div key={i} className="relative overflow-hidden rounded-xl border border-slate-200">
                    {m.type?.startsWith('video') ? (
                      <video src={m.url} className="aspect-square h-full w-full object-cover" />
                    ) : (
                      <img src={m.url} alt="upload" className="aspect-square h-full w-full object-cover" />
                    )}
                    <button
                      onClick={() => removeMedia(i)}
                      className="absolute right-1.5 top-1.5 rounded-full bg-black/60 p-1 text-xs text-white hover:bg-black/80"
                    >✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700">Tags</label>
            <div className="mb-2 flex flex-wrap gap-1.5">
              {postForm.tags.map((t, i) => (
                <span key={i} className="inline-flex items-center gap-1 rounded-full bg-fuchsia-50 px-2 py-0.5 text-xs text-fuchsia-700">
                  #{t}
                  <button onClick={() => removeTag(t)} className="ml-0.5 text-fuchsia-600 hover:text-fuchsia-800">×</button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                placeholder="Add a tag…"
                className="flex-1 rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-fuchsia-500 focus:ring-2 focus:ring-fuchsia-500/20"
              />
              <Btn size="sm" variant="outline" onClick={addTag}>Add</Btn>
            </div>
          </div>

          <Field
            label="Visibility"
            name="visibility"
            options={[
              { value: 'public', label: 'Public — anyone in the community' },
              { value: 'group', label: 'Group only' },
              { value: 'private', label: 'Private — only me' },
            ]}
            value={postForm.visibility}
            onChange={(e) => setPostForm({ ...postForm, visibility: e.target.value })}
          />

          {postForm.visibility === 'group' && (
            <Field
              label="Post to group"
              name="groupId"
              options={groups.map((g) => ({ value: g.id, label: g.name }))}
              value={postForm.groupId}
              onChange={(e) => setPostForm({ ...postForm, groupId: e.target.value })}
            />
          )}
        </div>
      </Modal>

      {/* COMMENT DRAWER (uses modal shell) */}
      <Modal
        open={commentDrawer.open}
        onClose={() => setCommentDrawer({ open: false, post: null })}
        title="Comments"
        size="lg"
        footer={<Btn onClick={() => setCommentDrawer({ open: false, post: null })}>Close</Btn>}
      >
        {commentDrawer.post && (
          <div className="space-y-4">
            <div className="rounded-xl bg-slate-50 p-3">
              <div className="flex items-center gap-2">
                <Avatar src={commentDrawer.post.authorAvatar} name={commentDrawer.post.authorName} size="sm" />
                <p className="text-sm font-semibold text-slate-800">{commentDrawer.post.authorName}</p>
              </div>
              {commentDrawer.post.content && <p className="mt-2 text-sm text-slate-700">{commentDrawer.post.content}</p>}
            </div>

            <div className="max-h-72 space-y-3 overflow-y-auto">
              {comments.filter((c) => c.postId === commentDrawer.post.id).length === 0 ? (
                <p className="text-center text-sm text-slate-500">No comments yet. Be the first!</p>
              ) : (
                comments.filter((c) => c.postId === commentDrawer.post.id).map((c) => (
                  <div key={c.id} className="group flex items-start gap-3">
                    <Avatar src={c.authorAvatar} name={c.authorName} size="sm" />
                    <div className="min-w-0 flex-1 rounded-xl bg-slate-50 px-3 py-2">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-semibold text-slate-800">{c.authorName}</p>
                        <span className="text-[10px] text-slate-400">{formatRelativeTime(c.createdAt)}</span>
                      </div>
                      <p className="mt-0.5 text-sm text-slate-700">{c.text}</p>
                    </div>
                    {c.authorId === parentId && (
                      <button
                        onClick={() => handleDeleteComment(c)}
                        className="opacity-0 transition group-hover:opacity-100"
                      >🗑</button>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="flex items-end gap-2 border-t border-slate-100 pt-3">
              <Avatar src={profile?.photoURL || profile?.avatarUrl} name={profile?.displayName || 'Parent'} size="sm" />
              <textarea
                value={commentForm}
                onChange={(e) => setCommentForm(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAddComment(); } }}
                placeholder="Write a comment…"
                rows={1}
                className="flex-1 resize-none rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-fuchsia-500 focus:ring-2 focus:ring-fuchsia-500/20"
              />
              <Btn onClick={handleAddComment} disabled={!commentForm.trim()}>Send</Btn>
            </div>
          </div>
        )}
      </Modal>

      {/* GROUP MODAL */}
      <Modal
        open={groupModal.open}
        onClose={() => setGroupModal({ open: false, editing: null })}
        title={groupModal.editing ? 'Edit Group' : 'Create Group'}
        footer={<><Btn variant="ghost" onClick={() => setGroupModal({ open: false, editing: null })}>Cancel</Btn><Btn onClick={handleSaveGroup}>Save</Btn></>}
      >
        <div className="space-y-4">
          <Field label="Name" name="name" value={groupForm.name} onChange={(e) => setGroupForm({ ...groupForm, name: e.target.value })} required error={formErrors.name} />
          <Field label="Description" name="description" textarea value={groupForm.description} onChange={(e) => setGroupForm({ ...groupForm, description: e.target.value })} />
          <Field label="Visibility" name="visibility" options={[
            { value: 'public', label: 'Public' },
            { value: 'private', label: 'Private' },
          ]} value={groupForm.visibility} onChange={(e) => setGroupForm({ ...groupForm, visibility: e.target.value })} />
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700">Group Avatar</label>
            <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && handleGroupAvatarUpload(e.target.files[0])}
              className="block w-full cursor-pointer text-xs text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-fuchsia-50 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-fuchsia-700 hover:file:bg-fuchsia-100" />
            {groupForm.avatarUrl && <img src={groupForm.avatarUrl} alt="avatar" className="mt-2 h-16 w-16 rounded-full object-cover" />}
          </div>
        </div>
      </Modal>

      {/* CONFIRM DELETE */}
      <Modal
        open={confirmDelete.open}
        onClose={() => setConfirmDelete({ open: false, target: null, type: '' })}
        title="Confirm Delete"
        size="sm"
        footer={<><Btn variant="ghost" onClick={() => setConfirmDelete({ open: false, target: null, type: '' })}>Cancel</Btn><Btn variant="danger" onClick={() => {
          if (confirmDelete.type === 'post') handleDeletePost();
          if (confirmDelete.type === 'group') handleDeleteGroup();
        }}>Delete</Btn></>}
      >
        <p className="text-sm text-slate-600">Are you sure? This action cannot be undone.</p>
      </Modal>
    </PageShell>
  );
};

export default memo(ParentCommunity);
