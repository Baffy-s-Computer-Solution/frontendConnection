import { useCallback, useEffect, useState } from 'react';
import {
  CircleAlert,
  FileImage,
  FileText,
  Film,
  Image as ImageIcon,
  LoaderCircle,
  Trash2,
  Upload,
} from 'lucide-react';

import { useAuth } from '../../context/AuthContext';
import { supabaseMediaService } from '../../services/supabaseMediaService';
import {
  deleteEntrepreneurMedia,
  listEntrepreneurMedia,
  uploadEntrepreneurMedia,
} from '../../services/entrepreneurMediaApi';

const ACCEPTED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'video/mp4',
  'video/quicktime',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

const safeMediaUrl = (value) => {
  if (typeof value !== 'string') return null;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && supabaseMediaService.isSupabaseUrl(url.toString()) ? url.toString() : null;
  } catch {
    return null;
  }
};

const formatSize = (bytes) => {
  if (!Number.isFinite(Number(bytes)) || Number(bytes) < 0) return 'Size unavailable';
  const value = Number(bytes);
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
};

const formatDate = (value) => {
  const date = value ? new Date(value) : null;
  return date && !Number.isNaN(date.getTime())
    ? date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
    : 'Date unavailable';
};

function MediaSkeleton() {
  return (
    <div className="grid animate-pulse gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-label="Loading media">
      {[1, 2, 3].map((item) => <div key={item} className="h-64 rounded-2xl bg-slate-200" />)}
    </div>
  );
}

function MediaPreview({ item, url }) {
  if (!url) {
    return (
      <div className="flex h-40 items-center justify-center bg-slate-100 text-slate-500">
        <FileText className="h-10 w-10" aria-hidden="true" />
        <span className="sr-only">Preview unavailable</span>
      </div>
    );
  }

  if (item.contentType?.startsWith('image/')) {
    return <img src={url} alt={item.name} className="h-40 w-full bg-slate-100 object-cover" loading="lazy" />;
  }

  if (item.contentType?.startsWith('video/')) {
    return <video src={url} controls preload="metadata" className="h-40 w-full bg-slate-950 object-contain" aria-label={`Preview of ${item.name}`} />;
  }

  return (
    <div className="flex h-40 items-center justify-center bg-slate-100 text-slate-500">
      <FileText className="h-10 w-10" aria-hidden="true" />
      <span className="sr-only">Document</span>
    </div>
  );
}

export default function MediaLibrary() {
  const { currentUser, userProfile, loading: authLoading } = useAuth();
  const role = String(userProfile?.role || userProfile?.userType || '').toLowerCase();
  const canManage = role === 'entrepreneur';
  const [items, setItems] = useState([]);
  const [nextCursor, setNextCursor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  const loadFirstPage = useCallback(async (signal) => {
    setLoading(true);
    setError('');
    try {
      const result = await listEntrepreneurMedia(null, { signal });
      if (!signal.aborted) {
        setItems(Array.isArray(result?.items) ? result.items : []);
        setNextCursor(result?.nextCursor || null);
      }
    } catch {
      if (!signal.aborted) {
        setItems([]);
        setError('Your media could not be loaded. Please try again.');
      }
    } finally {
      if (!signal.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authLoading) return undefined;
    if (!currentUser || !canManage) {
      setLoading(false);
      return undefined;
    }

    const controller = new AbortController();
    loadFirstPage(controller.signal);
    return () => controller.abort();
  }, [authLoading, canManage, currentUser, loadFirstPage, refreshKey]);

  const handleUpload = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const file = form.elements.mediaFile.files?.[0];
    if (!file || uploading) return;
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError('Choose an image, supported video, PDF, or Word document.');
      return;
    }

    setUploading(true);
    setError('');
    setNotice('');
    try {
      await uploadEntrepreneurMedia(file);
      form.reset();
      setNotice('Media uploaded.');
      setRefreshKey((key) => key + 1);
    } catch (uploadError) {
      setError(uploadError.message || 'This file could not be uploaded. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleLoadMore = async () => {
    if (!nextCursor || loadingMore) return;
    setLoadingMore(true);
    setError('');
    try {
      const result = await listEntrepreneurMedia(nextCursor);
      setItems((current) => [...current, ...(Array.isArray(result?.items) ? result.items : [])]);
      setNextCursor(result?.nextCursor || null);
    } catch (loadError) {
      setError(loadError.message || 'More media could not be loaded.');
    } finally {
      setLoadingMore(false);
    }
  };

  const handleDelete = async (item) => {
    if (deletingId) return;
    if (!window.confirm(`Permanently delete "${item.name}"?`)) return;

    setDeletingId(item.id);
    setError('');
    setNotice('');
    try {
      await deleteEntrepreneurMedia(item.id);
      setNotice('Media deleted.');
      setRefreshKey((key) => key + 1);
    } catch (deleteError) {
      setError(deleteError.message || 'This media could not be deleted. Please try again.');
    } finally {
      setDeletingId('');
    }
  };

  if (authLoading) {
    return <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8" role="status">Loading your account…</main>;
  }

  if (!currentUser || !canManage) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <div role="alert" className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-amber-900">
          You do not have permission to manage this media library.
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-7">
        <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">Entrepreneur workspace</p>
        <h1 className="mt-1 text-3xl font-bold text-slate-900">Media library</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-600">
          Store and manage business images, videos, and supporting documents.
        </p>
      </header>

      <form onSubmit={handleUpload} className="mb-6 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-end">
        <label className="min-w-0 flex-1 text-sm font-medium text-slate-700">
          Choose a file
          <input
            type="file"
            name="mediaFile"
            accept="image/jpeg,image/png,image/gif,image/webp,video/mp4,video/quicktime,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            required
            disabled={uploading}
            className="mt-1.5 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 file:mr-3 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-1.5 file:font-medium file:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 disabled:opacity-60"
          />
          <span className="mt-1 block text-xs font-normal text-slate-500">Maximum upload size: 5 MB.</span>
        </label>
        <button type="submit" disabled={uploading} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60">
          {uploading ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Upload className="h-4 w-4" aria-hidden="true" />}
          {uploading ? 'Uploading…' : 'Upload file'}
        </button>
      </form>

      {error && (
        <div className="mb-5 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800" role="alert">
          <CircleAlert className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
          <span>{error}</span>
          <button type="button" onClick={() => setRefreshKey((key) => key + 1)} className="ml-auto font-semibold underline focus-visible:outline focus-visible:outline-2">
            Retry
          </button>
        </div>
      )}
      {notice && <p className="mb-5 text-sm text-emerald-700" role="status">{notice}</p>}

      {loading ? (
        <MediaSkeleton />
      ) : items.length === 0 && !error ? (
        <section className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
          <FileImage className="mx-auto h-10 w-10 text-slate-400" aria-hidden="true" />
          <h2 className="mt-4 text-lg font-semibold text-slate-900">No media uploaded</h2>
          <p className="mt-2 text-sm text-slate-600">Choose a file above to add it to your business library.</p>
        </section>
      ) : items.length > 0 ? (
        <section aria-label="Uploaded media" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => {
            const url = safeMediaUrl(item.url);
            return (
              <article key={item.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <MediaPreview item={item} url={url} />
                <div className="p-4">
                  <div className="flex items-start gap-2">
                    {item.contentType?.startsWith('video/') ? <Film className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" aria-hidden="true" /> : item.contentType?.startsWith('image/') ? <ImageIcon className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" aria-hidden="true" /> : <FileText className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" aria-hidden="true" />}
                    <h2 className="min-w-0 break-words text-sm font-semibold text-slate-900">{item.name}</h2>
                  </div>
                  <p className="mt-2 text-xs text-slate-500">{formatSize(item.size)} · {formatDate(item.createdAt)}</p>
                  <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-3">
                    {url ? (
                      <a href={url} target="_blank" rel="noopener noreferrer nofollow" className="text-sm font-medium text-indigo-700 underline focus-visible:outline focus-visible:outline-2">
                        Open file
                      </a>
                    ) : <span className="text-xs text-slate-500">Preview unavailable</span>}
                    <button type="button" onClick={() => handleDelete(item)} disabled={Boolean(deletingId)} aria-label={`Delete ${item.name}`} className="inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm font-medium text-rose-700 hover:bg-rose-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-600 disabled:cursor-not-allowed disabled:opacity-50">
                      {deletingId === item.id ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Trash2 className="h-4 w-4" aria-hidden="true" />}
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      ) : null}
      {nextCursor && !loading && (
        <div className="mt-6 text-center">
          <button type="button" onClick={handleLoadMore} disabled={loadingMore} className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 disabled:opacity-60">
            {loadingMore ? 'Loading…' : 'Load more'}
          </button>
        </div>
      )}
    </main>
  );
}
