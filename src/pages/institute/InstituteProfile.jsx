import { useCallback, useEffect, useState } from 'react';
import { Building2, CircleAlert, RefreshCw } from 'lucide-react';

import { useAuth } from '../../context/AuthContext';
import { institutionService } from '../../services/institutionServices';

const EMPTY_FORM = {
  name: '',
  email: '',
  phone: '',
  address: '',
  type: 'university',
  website: '',
  description: '',
};

const PROFILE_FIELDS = [
  { name: 'name', label: 'Institution name', required: true, maxLength: 160 },
  { name: 'email', label: 'Contact email', type: 'email', maxLength: 240 },
  { name: 'phone', label: 'Phone number', type: 'tel', maxLength: 60 },
  { name: 'address', label: 'Address', maxLength: 240 },
  { name: 'website', label: 'Website', type: 'url', maxLength: 240 },
];

export default function InstituteProfile() {
  const { currentUser, userProfile, loading: authLoading } = useAuth();
  const role = String(userProfile?.role || userProfile?.userType || '').toLowerCase();
  const canManage = role === 'institute';
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  const loadProfile = useCallback(async () => {
    if (!currentUser?.uid) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const institution = await institutionService.getInstitutionProfile(currentUser.uid);
      setProfile(institution);
      setForm({
        ...EMPTY_FORM,
        name: institution.name || '',
        email: institution.email || '',
        phone: institution.phone || '',
        address: institution.address || '',
        type: institution.type || 'university',
        website: institution.website || '',
        description: institution.description || '',
      });
    } catch {
      setError('Your institution profile could not be loaded. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [currentUser?.uid]);

  useEffect(() => {
    if (!authLoading && canManage && currentUser) {
      loadProfile();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [authLoading, canManage, currentUser, loadProfile, refreshKey]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setError('');
    setNotice('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!profile?.id || !currentUser?.uid || !canManage || saving) return;

    setSaving(true);
    setError('');
    setNotice('');
    try {
      const result = await institutionService.updateInstitutionProfile(
        currentUser.uid,
        profile.id,
        form
      );
      setProfile(result.data);
      setNotice('Institution profile saved.');
    } catch {
      setError('Your profile could not be saved. Check the form and try again.');
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <main className="mx-auto max-w-5xl animate-pulse space-y-5 px-4 py-8 sm:px-6 lg:px-8" aria-label="Loading institution profile">
        <div className="h-8 w-64 rounded bg-slate-200" />
        <div className="h-80 rounded-2xl bg-slate-200" />
      </main>
    );
  }

  if (!currentUser || !canManage) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <div role="alert" className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-amber-900">
          You do not have permission to manage this institution profile.
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-6 flex items-center gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700">
          <Building2 className="h-6 w-6" aria-hidden="true" />
        </span>
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">Institute workspace</p>
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Institution profile</h1>
        </div>
      </header>

      {error && (
        <div className="mb-5 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800" role="alert">
          <CircleAlert className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
          <span>{error}</span>
          <button type="button" onClick={() => setRefreshKey((key) => key + 1)} className="ml-auto inline-flex items-center gap-1 font-semibold underline focus-visible:outline focus-visible:outline-2">
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            Retry
          </button>
        </div>
      )}
      {notice && <p className="mb-5 text-sm text-emerald-700" role="status">{notice}</p>}

      <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
        <div className="mb-6 border-b border-slate-100 pb-4">
          <h2 className="text-lg font-semibold text-slate-900">Profile information</h2>
          <p className="mt-1 text-sm text-slate-600">Keep your institution’s public contact and description accurate.</p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          {PROFILE_FIELDS.map(({ name, label, type = 'text', required, maxLength }) => (
            <label key={name} className="text-sm font-medium text-slate-700">
              {label}{required ? ' *' : ''}
              <input
                type={type}
                name={name}
                value={form[name]}
                onChange={handleChange}
                required={required}
                maxLength={maxLength}
                className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
              />
            </label>
          ))}
          <label className="text-sm font-medium text-slate-700">
            Institution type
            <select name="type" value={form.type} onChange={handleChange} className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600">
              <option value="university">University</option>
              <option value="college">College</option>
              <option value="technical">Technical or vocational</option>
              <option value="school">School</option>
              <option value="other">Other</option>
            </select>
          </label>
          <label className="text-sm font-medium text-slate-700 sm:col-span-2">
            Description
            <textarea name="description" rows={5} maxLength={2000} value={form.description} onChange={handleChange} className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600" />
            <span className="mt-1 block text-xs font-normal text-slate-500">{form.description.length}/2000 characters</span>
          </label>
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button type="submit" disabled={saving} className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60">
            {saving ? 'Saving…' : 'Save profile'}
          </button>
          <span className="text-xs text-slate-500">Changes are saved to the institution record after confirmation.</span>
        </div>
      </form>
    </main>
  );
}
