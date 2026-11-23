// src/pages/mentor/MentorBlog.jsx
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, addDoc,
  query, where, orderBy, limit, startAfter, onSnapshot, serverTimestamp,
  increment, arrayUnion, arrayRemove, writeBatch
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { supabaseMediaService } from '../../services/supabaseMediaService';
import { supabase } from '../../config/supabase';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import {
  BookOpen, PenSquare, FileText, Eye, Heart, MessageCircle, Share2,
  Bookmark, Send, Search, Filter, Plus, X, Check, CheckCircle2,
  AlertCircle, Info, Clock, ChevronDown, ChevronUp, ChevronLeft,
  ChevronRight, MoreVertical, Edit2, Trash2, RefreshCw, Loader2,
  Sparkles, Rocket, Trophy, Award, Star, Zap, Target, TrendingUp,
  BarChart3, Image, Paperclip, Link as LinkIcon, ExternalLink, Hash,
  Globe, Calendar, User, Users, Settings, Save, Undo2, Redo2,
  Bold, Italic, Underline, List, ListOrdered, Quote, Code, Heading1,
  Heading2, Heading3, AlignLeft, AlignCenter, AlignRight, Copy,
  Download, Upload, EyeOff, Lock, Unlock, Shield, Flag, ThumbsUp,
  ThumbsDown, Crown, Medal, TrendingDown, Activity, PieChart
} from 'lucide-react';

const POSTS_PER_PAGE = 9;
const BLOG_STATUS = { DRAFT: 'draft', PUBLISHED: 'published', ARCHIVED: 'archived' };
const BLOG_CATEGORIES = [
  'Career Development', 'Leadership', 'Entrepreneurship', 'Technology',
  'Personal Growth', 'Industry Insights', 'Mentorship', 'Work-Life Balance',
  'Networking', 'Skills Development'
];

const formatDate = (ts) => {
  if (!ts) return 'N/A';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

const formatRelativeTime = (ts) => {
  if (!ts) return 'N/A';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  const diff = Date.now() - d.getTime();
  const m = Math.floor(diff / 60000);
  const h = Math.floor(diff / 3600000);
  const day = Math.floor(diff / 86400000);
  if (m < 1) return 'Just now';
  if (m < 60) return `${m}m ago`;
  if (h < 24) return `${h}h ago`;
  if (day < 7) return `${day}d ago`;
  return formatDate(ts);
};

const readingTime = (text) => {
  const words = (text || '').trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
};

const slugify = (s) => (s || '').toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');

// ─────────── Hooks ───────────
const useMyBlogs = (userId, filters = {}) => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    let q = query(collection(db, 'mentorBlogs'), where('authorId', '==', userId));
    if (filters.status && filters.status !== 'all') {
      q = query(q, where('status', '==', filters.status));
    }
    q = query(q, orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, snap => {
      let data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      if (filters.category && filters.category !== 'all') {
        data = data.filter(b => b.category === filters.category);
      }
      if (filters.search) {
        const s = filters.search.toLowerCase();
        data = data.filter(b =>
          b.title?.toLowerCase().includes(s) || b.excerpt?.toLowerCase().includes(s)
        );
      }
      setBlogs(data);
      setLoading(false);
    }, err => { console.error(err); setLoading(false); });
    return () => unsub();
  }, [userId, filters.status, filters.category, filters.search]);

  return { blogs, loading };
};

const useDraftPersistence = (draftId, form, enabled) => {
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);

  useEffect(() => {
    if (!enabled || !draftId) return;
    const t = setTimeout(async () => {
      setSaving(true);
      try {
        await updateDoc(doc(db, 'mentorBlogDrafts', draftId), {
          ...form,
          updatedAt: serverTimestamp()
        }).catch(async () => {
          await setDoc(doc(db, 'mentorBlogDrafts', draftId), {
            ...form,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
        });
        setLastSaved(new Date());
      } catch (e) { console.error('autosave error:', e); }
      finally { setSaving(false); }
    }, 2000);
    return () => clearTimeout(t);
  }, [form, draftId, enabled]);

  return { saving, lastSaved };
};

// ─────────── Components ───────────
const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;
  const sizes = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl', full: 'max-w-6xl' };
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 py-8">
        <div className="fixed inset-0 bg-gray-900/60" onClick={onClose} />
        <div className={`relative w-full ${sizes[size]} bg-white rounded-2xl shadow-2xl`}>
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-6 max-h-[80vh] overflow-y-auto">{children}</div>
        </div>
      </div>
    </div>
  );
};

const Toast = ({ message, type = 'success', onClose }) => {
  useEffect(() => { const t = setTimeout(onClose, 4000); return () => clearTimeout(t); }, [onClose]);
  const cfg = {
    success: { bg: 'bg-green-50 border-green-200 text-green-800', I: CheckCircle2 },
    error: { bg: 'bg-red-50 border-red-200 text-red-800', I: X },
    warning: { bg: 'bg-amber-50 border-amber-200 text-amber-800', I: AlertCircle },
    info: { bg: 'bg-blue-50 border-blue-200 text-blue-800', I: Info }
  }[type];
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 border rounded-xl shadow-lg ${cfg.bg}`}>
      <cfg.I className="w-5 h-5" />
      <span className="text-sm font-medium">{message}</span>
      <button onClick={onClose} className="ml-2 p-1 hover:bg-white/50 rounded"><X className="w-4 h-4" /></button>
    </div>
  );
};

const Badge = ({ children, variant = 'default' }) => {
  const v = {
    default: 'bg-gray-100 text-gray-700',
    blue: 'bg-blue-50 text-blue-700',
    green: 'bg-green-50 text-green-700',
    amber: 'bg-amber-50 text-amber-700',
    red: 'bg-red-50 text-red-700',
    purple: 'bg-purple-50 text-purple-700',
    pink: 'bg-pink-50 text-pink-700'
  };
  return <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${v[variant]}`}>{children}</span>;
};

const StatCard = ({ icon: Icon, label, value, color = 'blue' }) => {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    amber: 'bg-amber-50 text-amber-600',
    purple: 'bg-purple-50 text-purple-600',
    pink: 'bg-pink-50 text-pink-600'
  };
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center gap-3">
        <div className={`p-2.5 rounded-lg ${colors[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs font-medium text-gray-500">{label}</p>
          <p className="text-xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
};

const BlogCard = ({ blog, onEdit, onDelete, onPreview, onTogglePublish, isAuthor }) => {
  const statusVariant = {
    [BLOG_STATUS.PUBLISHED]: 'green',
    [BLOG_STATUS.DRAFT]: 'amber',
    [BLOG_STATUS.ARCHIVED]: 'default'
  }[blog.status] || 'default';

  return (
    <article className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all group flex flex-col">
      <div className="aspect-video bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 relative">
        {blog.coverImage ? (
          <img src={blog.coverImage} alt={blog.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <FileText className="w-12 h-12 text-white/50" />
          </div>
        )}
        <div className="absolute top-3 left-3 flex items-center gap-2">
          <Badge variant={statusVariant}>{blog.status}</Badge>
          {blog.featured && <Badge variant="purple"><Crown className="w-3 h-3" /> Featured</Badge>}
        </div>
        <div className="absolute top-3 right-3">
          <div className="flex items-center gap-1 bg-black/40 backdrop-blur-sm rounded-full px-2 py-1">
            <Clock className="w-3 h-3 text-white" />
            <span className="text-xs text-white font-medium">{blog.readTime || readingTime(blog.content)} min</span>
          </div>
        </div>
      </div>
      <div className="p-5 flex-1 flex flex-col">
        <Badge variant="blue">{blog.category || 'General'}</Badge>
        <h3 className="font-semibold text-gray-900 mt-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {blog.title || 'Untitled'}
        </h3>
        <p className="text-sm text-gray-500 mt-2 line-clamp-3 flex-1">
          {blog.excerpt || blog.content?.slice(0, 150) || 'No description...'}
        </p>
        <div className="flex items-center gap-3 mt-4 text-xs text-gray-500">
          <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> {blog.viewsCount || 0}</span>
          <span className="flex items-center gap-1"><Heart className="w-3.5 h-3.5" /> {blog.likesCount || 0}</span>
          <span className="flex items-center gap-1"><MessageCircle className="w-3.5 h-3.5" /> {blog.commentsCount || 0}</span>
          <span className="ml-auto">{formatRelativeTime(blog.updatedAt || blog.createdAt)}</span>
        </div>
        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
          <button
            onClick={() => onEdit(blog)}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Edit2 className="w-4 h-4" /> Edit
          </button>
          <button
            onClick={() => onPreview(blog)}
            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Preview"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => onTogglePublish(blog)}
            className={`p-2 rounded-lg transition-colors ${
              blog.status === BLOG_STATUS.PUBLISHED
                ? 'text-amber-600 hover:bg-amber-50'
                : 'text-green-600 hover:bg-green-50'
            }`}
            title={blog.status === BLOG_STATUS.PUBLISHED ? 'Unpublish' : 'Publish'}
          >
            {blog.status === BLOG_STATUS.PUBLISHED ? <EyeOff className="w-4 h-4" /> : <Rocket className="w-4 h-4" />}
          </button>
          <button
            onClick={() => onDelete(blog.id)}
            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </article>
  );
};

// ─────────── Editor ───────────
const BlogEditor = ({ initialBlog, onClose, onSave, userId, userProfile, setToast }) => {
  const [form, setForm] = useState({
    title: initialBlog?.title || '',
    content: initialBlog?.content || '',
    excerpt: initialBlog?.excerpt || '',
    category: initialBlog?.category || BLOG_CATEGORIES[0],
    tags: initialBlog?.tags?.join(', ') || '',
    coverImage: initialBlog?.coverImage || '',
    coverImagePublicId: initialBlog?.coverImagePublicId || '',
    status: initialBlog?.status || BLOG_STATUS.DRAFT,
    featured: initialBlog?.featured || false
  });
  const [saving, setSaving] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const coverInputRef = useRef(null);

  const draftId = initialBlog?.id || null;
  const { saving: autoSaving, lastSaved } = useDraftPersistence(draftId, form, !!draftId);

  const handleCoverUpload = async (file) => {
    if (!file) return;
    setUploadingCover(true);
    try {
      const uploaded = await supabaseMediaService.uploadFile(file, { folder: 'blog-covers' });
      setForm(prev => ({ ...prev, coverImage: uploaded.url, coverImagePath: uploaded.path }));
      setToast({ message: 'Cover image uploaded', type: 'success' });
    } catch (e) {
      console.error(e);
      setToast({ message: 'Failed to upload cover', type: 'error' });
    } finally { setUploadingCover(false); }
  };

  const handleSubmit = async (status) => {
    if (!form.title.trim() || !form.content.trim()) {
      setToast({ message: 'Title and content are required', type: 'warning' });
      return;
    }
    setSaving(true);
    try {
      const tags = form.tags.split(',').map(t => t.trim()).filter(Boolean);
      const slug = slugify(form.title) + '-' + Date.now().toString(36);
      const payload = {
        ...form,
        tags,
        slug,
        authorId: userId,
        authorName: userProfile?.displayName || 'Mentor',
        authorAvatar: userProfile?.photoURL || '',
        authorTitle: userProfile?.title || 'Mentor',
        status,
        readTime: readingTime(form.content),
        excerpt: form.excerpt || form.content.slice(0, 180),
        publishedAt: status === BLOG_STATUS.PUBLISHED ? serverTimestamp() : initialBlog?.publishedAt || null,
        updatedAt: serverTimestamp()
      };

      let blogId = initialBlog?.id;
      if (blogId) {
        await updateDoc(doc(db, 'mentorBlogs', blogId), payload);
      } else {
        payload.createdAt = serverTimestamp();
        payload.viewsCount = 0;
        payload.likesCount = 0;
        payload.commentsCount = 0;
        const ref = await addDoc(collection(db, 'mentorBlogs'), payload);
        blogId = ref.id;
      }

      // Supabase sync
      await supabase.from('mentor_blogs').upsert({
        firebase_id: blogId,
        author_id: userId,
        title: payload.title,
        slug: payload.slug,
        content: payload.content,
        excerpt: payload.excerpt,
        category: payload.category,
        tags: payload.tags,
        cover_image: payload.coverImage,
        status: payload.status,
        read_time: payload.readTime,
        updated_at: new Date().toISOString()
      }, { onConflict: 'firebase_id' });

      // Remove draft if it existed
      if (initialBlog && initialBlog.status === BLOG_STATUS.DRAFT && status === BLOG_STATUS.PUBLISHED) {
        // keep draft as is, just mark status
      }

      setToast({ message: status === BLOG_STATUS.PUBLISHED ? 'Blog published!' : 'Saved as draft', type: 'success' });
      onSave();
    } catch (e) {
      console.error(e);
      setToast({ message: 'Failed to save blog', type: 'error' });
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 bg-gray-50 overflow-y-auto">
      {/* Editor Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 sm:px-6 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-base font-semibold text-gray-900">
                {initialBlog ? 'Edit Blog Post' : 'New Blog Post'}
              </h2>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                {autoSaving && <><Loader2 className="w-3 h-3 animate-spin" /> Saving...</>}
                {lastSaved && !autoSaving && <>Saved {formatRelativeTime(lastSaved)}</>}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPreviewMode(v => !v)}
              className="hidden sm:flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Eye className="w-4 h-4" /> {previewMode ? 'Edit' : 'Preview'}
            </button>
            <button
              onClick={() => handleSubmit(BLOG_STATUS.DRAFT)}
              disabled={saving}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 border border-gray-200 hover:bg-gray-50 rounded-lg transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" /> Save Draft
            </button>
            <button
              onClick={() => handleSubmit(BLOG_STATUS.PUBLISHED)}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Rocket className="w-4 h-4" />}
              Publish
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Editor */}
        <div className="lg:col-span-2 space-y-4">
          {!previewMode ? (
            <>
              <input
                value={form.title}
                onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Your blog title..."
                className="w-full text-3xl font-bold text-gray-900 placeholder-gray-300 focus:outline-none bg-transparent"
              />
              <textarea
                value={form.excerpt}
                onChange={e => setForm(prev => ({ ...prev, excerpt: e.target.value }))}
                placeholder="Write a short excerpt (shown in previews)..."
                rows={3}
                className="w-full p-4 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
              <textarea
                value={form.content}
                onChange={e => setForm(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Write your blog content here..."
                rows={24}
                className="w-full p-5 bg-white border border-gray-200 rounded-xl text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              {form.coverImage && (
                <img src={form.coverImage} alt="" className="w-full h-64 object-cover" />
              )}
              <div className="p-8">
                <Badge variant="blue">{form.category}</Badge>
                <h1 className="text-3xl font-bold text-gray-900 mt-3">{form.title || 'Untitled'}</h1>
                <div className="flex items-center gap-3 mt-4 text-sm text-gray-500">
                  <span>{userProfile?.displayName || 'Mentor'}</span>
                  <span>•</span>
                  <span>{readingTime(form.content)} min read</span>
                </div>
                <div className="mt-6 text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {form.content || 'No content yet...'}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-4 text-sm">Cover Image</h3>
            <div
              onClick={() => coverInputRef.current?.click()}
              className="aspect-video rounded-lg border-2 border-dashed border-gray-200 hover:border-blue-400 bg-gray-50 flex items-center justify-center cursor-pointer overflow-hidden transition-colors"
            >
              {uploadingCover ? (
                <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
              ) : form.coverImage ? (
                <img src={form.coverImage} alt="cover" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center">
                  <Image className="w-8 h-8 text-gray-400 mx-auto mb-1" />
                  <p className="text-xs text-gray-500">Click to upload</p>
                </div>
              )}
            </div>
            <input
              ref={coverInputRef}
              type="file"
              accept="image/*"
              onChange={e => handleCoverUpload(e.target.files?.[0])}
              className="hidden"
            />
            {form.coverImage && (
              <button
                onClick={() => setForm(prev => ({ ...prev, coverImage: '' }))}
                className="mt-2 text-xs text-red-600 hover:text-red-700"
              >
                Remove cover
              </button>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Category</label>
              <select
                value={form.category}
                onChange={e => setForm(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {BLOG_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Tags</label>
              <input
                value={form.tags}
                onChange={e => setForm(prev => ({ ...prev, tags: e.target.value }))}
                placeholder="leadership, growth, ..."
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-400 mt-1">Separate with commas</p>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <label className="text-sm font-medium text-gray-700">Feature post</label>
              <button
                onClick={() => setForm(prev => ({ ...prev, featured: !prev.featured }))}
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  form.featured ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                  form.featured ? 'translate-x-5' : ''
                }`} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─────────── Main ───────────
const MentorBlog = () => {
  const { currentUser, userProfile } = useAuth();
  const { showNotification } = useNotification();
  const [view, setView] = useState('list'); // list | editor
  const [editingBlog, setEditingBlog] = useState(null);
  const [filters, setFilters] = useState({ status: 'all', category: 'all', search: '' });
  const [previewBlog, setPreviewBlog] = useState(null);
  const [toast, setToast] = useState(null);

  const { blogs, loading } = useMyBlogs(currentUser?.uid, filters);

  const stats = useMemo(() => {
    const published = blogs.filter(b => b.status === BLOG_STATUS.PUBLISHED);
    return {
      total: blogs.length,
      published: published.length,
      drafts: blogs.filter(b => b.status === BLOG_STATUS.DRAFT).length,
      totalViews: blogs.reduce((sum, b) => sum + (b.viewsCount || 0), 0),
      totalLikes: blogs.reduce((sum, b) => sum + (b.likesCount || 0), 0),
      totalComments: blogs.reduce((sum, b) => sum + (b.commentsCount || 0), 0)
    };
  }, [blogs]);

  const handleNewBlog = () => {
    setEditingBlog(null);
    setView('editor');
  };

  const handleEditBlog = (blog) => {
    setEditingBlog(blog);
    setView('editor');
  };

  const handleSave = () => {
    setView('list');
    setEditingBlog(null);
  };

  const handleDeleteBlog = async (blogId) => {
    if (!window.confirm('Delete this blog post permanently?')) return;
    try {
      const blog = blogs.find(b => b.id === blogId);
      if (blog?.coverImage) {
        try {
          await supabaseMediaService.deleteFile(blog.coverImagePath || blog.coverImage);
        } catch (e) { /* cover may not be a storage URL */ }
      }
      await deleteDoc(doc(db, 'mentorBlogs', blogId));
      await supabase.from('mentor_blogs').delete().eq('firebase_id', blogId);
      setToast({ message: 'Blog deleted', type: 'success' });
    } catch (e) {
      console.error(e);
      setToast({ message: 'Failed to delete', type: 'error' });
    }
  };

  const handleTogglePublish = async (blog) => {
    try {
      const newStatus = blog.status === BLOG_STATUS.PUBLISHED ? BLOG_STATUS.DRAFT : BLOG_STATUS.PUBLISHED;
      await updateDoc(doc(db, 'mentorBlogs', blog.id), {
        status: newStatus,
        publishedAt: newStatus === BLOG_STATUS.PUBLISHED ? serverTimestamp() : blog.publishedAt || null,
        updatedAt: serverTimestamp()
      });
      await supabase.from('mentor_blogs').update({
        status: newStatus,
        updated_at: new Date().toISOString()
      }).eq('firebase_id', blog.id);
      setToast({ message: newStatus === BLOG_STATUS.PUBLISHED ? 'Blog published!' : 'Blog unpublished', type: 'success' });
    } catch (e) {
      console.error(e);
      setToast({ message: 'Failed to update status', type: 'error' });
    }
  };

  // Preview — track view
  const handlePreview = async (blog) => {
    setPreviewBlog(blog);
    if (blog.status === BLOG_STATUS.PUBLISHED && blog.authorId !== currentUser?.uid) {
      try {
        await updateDoc(doc(db, 'mentorBlogs', blog.id), { viewsCount: increment(1) });
      } catch (e) { /* silent */ }
    }
  };

  if (view === 'editor') {
    return (
      <>
        <BlogEditor
          initialBlog={editingBlog}
          onClose={() => { setView('list'); setEditingBlog(null); }}
          onSave={handleSave}
          userId={currentUser?.uid}
          userProfile={userProfile}
          setToast={setToast}
        />
        {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">My Blog</h1>
                <p className="text-sm text-gray-500">Share your expertise and grow your audience</p>
              </div>
            </div>
            <button
              onClick={handleNewBlog}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              <PenSquare className="w-4 h-4" /> New Post
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <StatCard icon={FileText} label="Total Posts" value={stats.total} color="blue" />
          <StatCard icon={Rocket} label="Published" value={stats.published} color="green" />
          <StatCard icon={Edit2} label="Drafts" value={stats.drafts} color="amber" />
          <StatCard icon={Eye} label="Views" value={stats.totalViews} color="purple" />
          <StatCard icon={Heart} label="Likes" value={stats.totalLikes} color="pink" />
          <StatCard icon={MessageCircle} label="Comments" value={stats.totalComments} color="blue" />
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={filters.search}
              onChange={e => setFilters(prev => ({ ...prev, search: e.target.value }))}
              placeholder="Search your blogs..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={filters.status}
            onChange={e => setFilters(prev => ({ ...prev, status: e.target.value }))}
            className="px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value={BLOG_STATUS.PUBLISHED}>Published</option>
            <option value={BLOG_STATUS.DRAFT}>Drafts</option>
            <option value={BLOG_STATUS.ARCHIVED}>Archived</option>
          </select>
          <select
            value={filters.category}
            onChange={e => setFilters(prev => ({ ...prev, category: e.target.value }))}
            className="px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Categories</option>
            {BLOG_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* Blog Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {loading ? (
          <div className="py-16 flex justify-center"><Loader2 className="w-8 h-8 text-blue-500 animate-spin" /></div>
        ) : blogs.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 py-20 text-center">
            <div className="inline-flex p-4 bg-gray-100 rounded-full mb-4">
              <BookOpen className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {filters.search || filters.status !== 'all' || filters.category !== 'all' ? 'No matching posts' : 'Start writing'}
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              {filters.search || filters.status !== 'all' || filters.category !== 'all'
                ? 'Try adjusting your filters'
                : 'Share your knowledge with the community'}
            </p>
            <button
              onClick={handleNewBlog}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              <PenSquare className="w-4 h-4" /> Write your first post
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {blogs.map(blog => (
              <BlogCard
                key={blog.id}
                blog={blog}
                isAuthor={blog.authorId === currentUser?.uid}
                onEdit={handleEditBlog}
                onDelete={handleDeleteBlog}
                onPreview={handlePreview}
                onTogglePublish={handleTogglePublish}
              />
            ))}
          </div>
        )}
      </div>

      {/* Preview Modal */}
      <Modal isOpen={!!previewBlog} onClose={() => setPreviewBlog(null)} title="Preview" size="lg">
        {previewBlog && (
          <div>
            {previewBlog.coverImage && (
              <img src={previewBlog.coverImage} alt="" className="w-full h-56 object-cover rounded-lg mb-5" />
            )}
            <Badge variant="blue">{previewBlog.category}</Badge>
            <h1 className="text-2xl font-bold text-gray-900 mt-3">{previewBlog.title}</h1>
            <div className="flex items-center gap-3 mt-3 text-sm text-gray-500">
              <span>{previewBlog.authorName}</span>
              <span>•</span>
              <span>{previewBlog.readTime || readingTime(previewBlog.content)} min read</span>
              <span>•</span>
              <span>{formatDate(previewBlog.createdAt)}</span>
            </div>
            {previewBlog.tags?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {previewBlog.tags.map((t, i) => (
                  <span key={i} className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">#{t}</span>
                ))}
              </div>
            )}
            <div className="mt-6 text-gray-700 leading-relaxed whitespace-pre-wrap">
              {previewBlog.content}
            </div>
          </div>
        )}
      </Modal>

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </div>
  );
};

export default MentorBlog;
