import { useCallback, useEffect, useState } from 'react';
import { BriefcaseBusiness, CircleAlert, Pencil, Plus, RefreshCw, Trash2, X } from 'lucide-react';

import { useAuth } from '../../context/AuthContext';
import {
  createBusinessIdea,
  deleteBusinessIdea,
  getBusinessIdeas,
  updateBusinessIdea,
} from '../../services/youthServices';

const EMPTY_FORM = {
  title: '',
  description: '',
  industry: '',
  problemSolved: '',
  targetMarket: '',
  revenueModel: '',
  fundingNeeded: '',
  stage: 'idea',
  status: 'draft',
};

const formatDate = (value) => {
  const date = value?.toDate?.() || (value ? new Date(value) : null);
  return date && !Number.isNaN(date.getTime())
    ? date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
    : 'Date not available';
};

export default function ManagePortfolio() {
  const { currentUser, userProfile, loading: authLoading } = useAuth();
  const role = String(userProfile?.role || userProfile?.userType || '').toLowerCase();
  const canManage = role === 'entrepreneur';
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [editingId, setEditingId] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  const loadIdeas = useCallback(async () => {
    if (!currentUser?.uid) {
      setIdeas([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');
    const result = await getBusinessIdeas(currentUser.uid);
    if (result.success) {
      setIdeas(Array.isArray(result.data) ? result.data : []);
    } else {
      setError('Your portfolio could not be loaded. Please try again.');
    }
    setLoading(false);
  }, [currentUser?.uid]);

  useEffect(() => {
    if (!authLoading && canManage) {
      loadIdeas();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [authLoading, canManage, loadIdeas]);

  const openCreateForm = () => {
    setEditingId('');
    setForm(EMPTY_FORM);
    setFormOpen(true);
    setError('');
    setNotice('');
  };

  const openEditForm = (idea) => {
    setEditingId(idea.id);
    setForm({
      ...EMPTY_FORM,
      ...idea,
      fundingNeeded: idea.fundingNeeded == null ? '' : String(idea.fundingNeeded),
    });
    setFormOpen(true);
    setError('');
    setNotice('');
  };

  const closeForm = () => {
    setEditingId('');
    setForm(EMPTY_FORM);
    setFormOpen(false);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!currentUser?.uid || !canManage || saving) return;

    const fundingNeeded = form.fundingNeeded === '' ? null : Number(form.fundingNeeded);
    if (fundingNeeded !== null && (!Number.isFinite(fundingNeeded) || fundingNeeded < 0)) {
      setError('Enter a valid non-negative funding amount.');
      return;
    }

    setSaving(true);
    setError('');
    setNotice('');
    const payload = { ...form, fundingNeeded };
    const result = editingId
      ? await updateBusinessIdea(currentUser.uid, editingId, payload)
      : await createBusinessIdea(currentUser.uid, payload);

    if (!result.success) {
      setError('Your changes could not be saved. Please try again.');
      setSaving(false);
      return;
    }

    const wasEditing = Boolean(editingId);
    closeForm();
    setNotice(wasEditing ? 'Portfolio item updated.' : 'Portfolio item added.');
    await loadIdeas();
    setSaving(false);
  };

  const handleDelete = async (idea) => {
    if (!currentUser?.uid || !canManage || deletingId) return;
    if (!window.confirm(`Delete "${idea.title}" from your portfolio?`)) return;

    setDeletingId(idea.id);
    setError('');
    setNotice('');
    const result = await deleteBusinessIdea(currentUser.uid, idea.id);
    if (!result.success) {
      setError('This portfolio item could not be deleted. Please try again.');
      setDeletingId('');
      return;
    }

    setNotice('Portfolio item deleted.');
    await loadIdeas();
    setDeletingId('');
  };

  if (authLoading || loading) {
    return (
      <main className="mx-auto max-w-6xl animate-pulse space-y-5 px-4 py-8 sm:px-6 lg:px-8" aria-label="Loading portfolio">
        <div className="h-8 w-56 rounded bg-slate-200" />
        <div className="h-32 rounded-2xl bg-slate-200" />
        <div className="h-48 rounded-2xl bg-slate-200" />
      </main>
    );
  }

  if (!currentUser || !canManage) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <div role="alert" className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-amber-900">
          You do not have permission to manage this portfolio.
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">Entrepreneur workspace</p>
          <h1 className="mt-1 text-3xl font-bold text-slate-900">Business portfolio</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            Keep your business concepts, market, and funding needs up to date.
          </p>
        </div>
        {!formOpen && (
          <button
            type="button"
            onClick={openCreateForm}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add business
          </button>
        )}
      </header>

      {error && (
        <div className="mb-5 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800" role="alert">
          <CircleAlert className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
          <span>{error}</span>
          <button type="button" onClick={loadIdeas} className="ml-auto font-semibold underline focus-visible:outline focus-visible:outline-2">
            Retry
          </button>
        </div>
      )}
      {notice && <p className="mb-5 text-sm text-emerald-700" role="status">{notice}</p>}

      {formOpen && (
        <form onSubmit={handleSubmit} className="mb-7 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5 flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">{editingId ? 'Edit business' : 'Add a business'}</h2>
              <p className="mt-1 text-sm text-slate-600">This information is saved to your entrepreneur profile.</p>
            </div>
            <button
              type="button"
              onClick={closeForm}
              disabled={saving}
              aria-label="Close business form"
              className="rounded-md p-2 text-slate-500 hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 disabled:opacity-50"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-medium text-slate-700">
              Business or idea name *
              <input required maxLength={120} name="title" value={form.title} onChange={handleChange} className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600" />
            </label>
            <label className="text-sm font-medium text-slate-700">
              Industry
              <input maxLength={100} name="industry" value={form.industry} onChange={handleChange} className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600" />
            </label>
            <label className="text-sm font-medium text-slate-700 sm:col-span-2">
              Description
              <textarea rows={3} maxLength={2000} name="description" value={form.description} onChange={handleChange} className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600" />
            </label>
            <label className="text-sm font-medium text-slate-700">
              Problem solved
              <input maxLength={500} name="problemSolved" value={form.problemSolved} onChange={handleChange} className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600" />
            </label>
            <label className="text-sm font-medium text-slate-700">
              Target market
              <input maxLength={300} name="targetMarket" value={form.targetMarket} onChange={handleChange} className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600" />
            </label>
            <label className="text-sm font-medium text-slate-700">
              Revenue model
              <input maxLength={300} name="revenueModel" value={form.revenueModel} onChange={handleChange} className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600" />
            </label>
            <label className="text-sm font-medium text-slate-700">
              Funding needed (M)
              <input type="number" min="0" step="0.01" name="fundingNeeded" value={form.fundingNeeded} onChange={handleChange} className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600" />
            </label>
            <label className="text-sm font-medium text-slate-700">
              Stage
              <select name="stage" value={form.stage} onChange={handleChange} className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600">
                <option value="idea">Idea</option>
                <option value="startup">Startup</option>
                <option value="growth">Growth</option>
                <option value="established">Established</option>
              </select>
            </label>
            <label className="text-sm font-medium text-slate-700">
              Visibility
              <select name="status" value={form.status} onChange={handleChange} className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600">
                <option value="draft">Draft</option>
                <option value="active">Active</option>
              </select>
            </label>
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button type="submit" disabled={saving} className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60">
              {saving ? 'Saving…' : editingId ? 'Save changes' : 'Add to portfolio'}
            </button>
            {editingId && (
              <button type="button" onClick={closeForm} disabled={saving} className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 disabled:opacity-60">
                Cancel
              </button>
            )}
          </div>
        </form>
      )}

      {ideas.length === 0 && !formOpen && !error ? (
        <section className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
          <BriefcaseBusiness className="mx-auto h-10 w-10 text-slate-400" aria-hidden="true" />
          <h2 className="mt-4 text-lg font-semibold text-slate-900">Your portfolio is empty</h2>
          <p className="mt-2 text-sm text-slate-600">Add a business or idea to start building your portfolio.</p>
          <button type="button" onClick={openCreateForm} className="mt-5 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2">
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add business
          </button>
        </section>
      ) : ideas.length > 0 ? (
        <section aria-label="Portfolio items" className="grid gap-4 md:grid-cols-2">
          {ideas.map((idea) => (
            <article key={idea.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="break-words text-lg font-semibold text-slate-900">{idea.title || 'Untitled business'}</h2>
                  <p className="mt-1 text-sm text-indigo-700">{idea.industry || 'Industry not specified'}</p>
                </div>
                <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium capitalize text-slate-700">
                  {String(idea.status || 'draft').replace(/_/g, ' ')}
                </span>
              </div>
              <p className="mt-4 whitespace-pre-line text-sm leading-6 text-slate-600">{idea.description || 'No description added.'}</p>
              <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                {idea.targetMarket && <div><dt className="text-xs font-medium text-slate-500">Target market</dt><dd className="mt-1 break-words text-slate-800">{idea.targetMarket}</dd></div>}
                {idea.stage && <div><dt className="text-xs font-medium text-slate-500">Stage</dt><dd className="mt-1 capitalize text-slate-800">{idea.stage}</dd></div>}
                {idea.fundingNeeded != null && <div><dt className="text-xs font-medium text-slate-500">Funding needed</dt><dd className="mt-1 text-slate-800">M{Number(idea.fundingNeeded).toLocaleString()}</dd></div>}
                <div><dt className="text-xs font-medium text-slate-500">Updated</dt><dd className="mt-1 text-slate-800">{formatDate(idea.updatedAt || idea.createdAt)}</dd></div>
              </dl>
              <div className="mt-5 flex items-center gap-2 border-t border-slate-100 pt-4">
                <button type="button" onClick={() => openEditForm(idea)} aria-label={`Edit ${idea.title}`} className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600">
                  <Pencil className="h-4 w-4" aria-hidden="true" />
                  Edit
                </button>
                <button type="button" onClick={() => handleDelete(idea)} disabled={Boolean(deletingId)} aria-label={`Delete ${idea.title}`} className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-rose-700 hover:bg-rose-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-600 disabled:cursor-not-allowed disabled:opacity-50">
                  {deletingId === idea.id ? <RefreshCw className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Trash2 className="h-4 w-4" aria-hidden="true" />}
                  Delete
                </button>
              </div>
            </article>
          ))}
        </section>
      ) : null}
    </main>
  );
}
