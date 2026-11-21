import { useEffect, useState } from 'react';
import { Check, MessageSquareQuote, X, Trash2, RefreshCw } from 'lucide-react';
import { collection, onSnapshot, query, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../context/AuthContext';
import adminService from '../../services/adminService';

export default function TestimonialModeration() {
  const { currentUser } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [savingId, setSavingId] = useState('');
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [publishingExisting, setPublishingExisting] = useState(false);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    let active = true;
    currentUser?.getIdTokenResult?.().then(({ claims }) => {
      if (active) setIsSuperAdmin(claims?.role === 'super_admin' || claims?.superAdmin === true || claims?.isSuperAdmin === true);
    }).catch(() => { if (active) setIsSuperAdmin(false); });
    return () => { active = false; };
  }, [currentUser]);

  useEffect(() => {
    const testimonialsQuery = query(collection(db, 'testimonials'));
    return onSnapshot(testimonialsQuery, (snapshot) => {
      setItems(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })).sort((left, right) => {
        const millis = (value) => value?.toMillis?.() ?? (Number.isFinite(value?.seconds) ? value.seconds * 1000 : new Date(value || 0).getTime());
        return millis(right.createdAt) - millis(left.createdAt);
      }));
      setError('');
      setLoading(false);
    }, (subscriptionError) => {
      setError(subscriptionError.message || 'Unable to load submitted testimonials.');
      setLoading(false);
    });
  }, []);

  const moderate = async (item, approved) => {
    setSavingId(item.id);
    try {
      await updateDoc(doc(db, 'testimonials', item.id), {
        approved,
        status: approved ? 'approved' : 'rejected',
        reviewedBy: currentUser?.uid || '',
        reviewedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (moderationError) {
      setError(moderationError.message || 'Could not update testimonial status.');
    } finally {
      setSavingId('');
    }
  };

  const publishExisting = async () => {
    if (!isSuperAdmin || !window.confirm('Publish every eligible existing student, company, and mentor testimonial?')) return;
    setPublishingExisting(true);
    setError('');
    try {
      const result = await adminService.admins.approveExistingTestimonials();
      if (!result.success) throw new Error(result.error || 'Unable to publish existing testimonials.');
      setNotice(`${result.data?.approvedCount || 0} existing testimonials published. ${result.data?.skippedCount || 0} invalid or unsupported entries were skipped.`);
    } catch (publishError) { setError(publishError.message || 'Unable to publish existing testimonials.'); }
    finally { setPublishingExisting(false); }
  };

  const remove = async (item) => {
    if (!window.confirm('Delete this testimonial permanently?')) return;
    setSavingId(item.id);
    try { await deleteDoc(doc(db, 'testimonials', item.id)); }
    catch (deleteError) { setError(deleteError.message || 'Could not delete testimonial.'); }
    finally { setSavingId(''); }
  };

  return (
    <section className="mx-auto w-full max-w-5xl space-y-5 px-1 sm:px-2">
      <header className="flex items-start gap-3">
        <span className="rounded-xl bg-indigo-100 p-2.5 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300"><MessageSquareQuote className="h-5 w-5" /></span>
        <div className="min-w-0 flex-1"><h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Testimonials</h1><p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Review, publish, unpublish, and remove community testimonials.</p></div>
        {isSuperAdmin && <button type="button" onClick={publishExisting} disabled={publishingExisting} className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white disabled:opacity-60"><RefreshCw className={`h-4 w-4 ${publishingExisting ? 'animate-spin' : ''}`} />{publishingExisting ? 'Publishing…' : 'Publish existing'}</button>}
      </header>
      {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/30 dark:text-red-200">{error}</p>}
      {notice && <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-200">{notice}</p>}
      {loading ? <p className="py-12 text-center text-sm text-slate-500">Loading testimonials…</p> : items.length === 0 ? <div className="rounded-2xl border bg-white p-10 text-center text-sm text-slate-500 dark:bg-slate-900 dark:text-slate-400">No testimonials have been submitted.</div> : (
        <div className="space-y-3">
          {items.map((item) => <article key={item.id} className="rounded-2xl border bg-white p-4 shadow-sm dark:bg-slate-900 sm:p-5">
            <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="font-semibold text-slate-900 dark:text-white">{item.name || 'Member'}</h2><p className="mt-0.5 text-xs capitalize text-slate-500">{item.userType || item.role} · {item.email || item.userId}</p></div><span className={`rounded-full px-2.5 py-1 text-xs font-medium ${item.approved ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200' : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200'}`}>{item.approved ? 'Published' : item.status || 'Pending'}</span></div>
            <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-slate-700 dark:text-slate-300">{item.content || item.text || item.message}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button type="button" disabled={savingId === item.id} onClick={() => moderate(item, !item.approved)} className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60">{item.approved ? <X className="h-4 w-4" /> : <Check className="h-4 w-4" />}{item.approved ? 'Unpublish' : 'Publish'}</button>
              <button type="button" disabled={savingId === item.id} onClick={() => remove(item)} className="inline-flex items-center gap-2 rounded-lg border border-red-300 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-60 dark:border-red-900 dark:text-red-300 dark:hover:bg-red-950/30"><Trash2 className="h-4 w-4" />Delete</button>
            </div>
          </article>)}
        </div>
      )}
    </section>
  );
}
