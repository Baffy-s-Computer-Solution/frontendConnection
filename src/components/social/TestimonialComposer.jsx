import { useState } from 'react';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { MessageSquareQuote, X } from 'lucide-react';
import { db } from '../../config/firebase';
import { useAuth } from '../../context/AuthContext';
import Modal from '../ui/Modal';

const allowedRoles = new Set(['student', 'company', 'mentor']);

export default function TestimonialComposer({ userType, profile, className = '' }) {
  const { currentUser } = useAuth();
  const role = String(userType || profile?.userType || profile?.role || '').toLowerCase();
  const name = profile?.fullName || profile?.displayName || profile?.companyName || currentUser?.displayName || '';
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  if (!currentUser || !allowedRoles.has(role)) return null;

  const submit = async (event) => {
    event.preventDefault();
    const value = content.trim();
    if (value.length < 15 || value.length > 500) {
      setError('Write between 15 and 500 characters.');
      return;
    }
    setSaving(true);
    setError('');
    setNotice('');
    try {
      await setDoc(doc(db, 'testimonials', currentUser.uid), {
        userId: currentUser.uid,
        userType: role,
        name: name.trim() || currentUser.email || 'Career Connect member',
        content: value,
        approved: false,
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      setContent('');
      setNotice('Your testimonial was submitted for review.');
      setOpen(false);
    } catch (submitError) {
      console.error('Testimonial submission failed:', submitError);
      setError('Could not save your testimonial. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className={`flex flex-wrap items-center gap-2 ${className}`}>
        <button type="button" onClick={() => { setNotice(''); setError(''); setOpen(true); }} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-indigo-300 hover:text-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-indigo-500 dark:hover:text-indigo-300">
          <MessageSquareQuote size={17} aria-hidden="true" /> Share a testimonial
        </button>
        {notice && <p role="status" className="text-sm text-emerald-700 dark:text-emerald-300">{notice}</p>}
      </div>
      <Modal open={open} onClose={() => setOpen(false)} title="Share your experience" size="md">
        <form onSubmit={submit} className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-300">After review, your testimonial can appear publicly on the Career Connect landing page.</p>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200" htmlFor="dashboard-testimonial">Your testimonial
            <textarea id="dashboard-testimonial" value={content} onChange={(event) => setContent(event.target.value)} minLength={15} maxLength={500} rows={5} required placeholder="Tell the community about your experience…" className="mt-1 block w-full rounded-xl border border-slate-300 bg-white p-3 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:ring-indigo-900" />
          </label>
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs text-slate-500">{content.trim().length}/500 characters · minimum 15</span>
            <div className="flex gap-2">
              <button type="button" onClick={() => setOpen(false)} className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"><X size={15} />Cancel</button>
              <button type="submit" disabled={saving || content.trim().length < 15} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50">{saving ? 'Publishing…' : 'Publish testimonial'}</button>
            </div>
          </div>
          {error && <p role="alert" className="text-sm text-red-600 dark:text-red-400">{error}</p>}
        </form>
      </Modal>
    </>
  );
}
