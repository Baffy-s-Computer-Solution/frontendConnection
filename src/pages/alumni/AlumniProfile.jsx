// frontend/src/pages/alumni/AlumniProfile.jsx
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  FaBookOpen, FaBriefcase, FaBuilding, FaCamera, FaCheck, FaCheckCircle,
  FaEdit, FaEnvelope, FaGlobe, FaGraduationCap, FaLink, FaMapPin, FaPhone,
  FaSave, FaStar, FaTimes, FaTrash, FaUpload, FaUser, FaUsers,
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { alumniService } from '../../services/alumniService';
import { formatDate } from '../../utils/formatters';

const ENV = import.meta.env.VITE_APP_ENVIRONMENT || 'production';
const safeLog = (...a) => { if (ENV !== 'production') console.debug('[Profile]', ...a); };
const safe = (v) => (v == null ? '' : String(v));
const MAX_AVATAR_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const AVATAR = 'https://ui-avatars.com/api/?background=6366f1&color=fff&bold=true&size=128&name=';

const Section = ({ title, icon: Icon, action, children }) => (
  <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
    <div className="mb-3 flex items-center justify-between">
      <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100"><Icon className="text-brand-600" /> {title}</h3>
      {action}
    </div>
    {children}
  </section>
);

const Field = ({ label, value, editing, onChange, type = 'text', placeholder, maxLength = 200 }) => (
  <div>
    <label className="text-xs font-medium text-slate-600 dark:text-slate-300">{label}</label>
    {editing ? (
      <input type={type} value={value || ''} onChange={(e) => onChange(e.target.value.slice(0, maxLength))} placeholder={placeholder} className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm dark:border-slate-700 dark:bg-slate-800" />
    ) : (
      <p className="mt-1 text-sm text-slate-900 dark:text-slate-100">{value || <span className="text-slate-400">Not set</span>}</p>
    )}
  </div>
);

const AlumniProfile = () => {
  const { currentUser, userProfile, updateUserPhoto } = useAuth();
  const { addSuccessNotification, addErrorNotification } = useNotification();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState('overview'); // overview | schools | privacy | activity
  const [schools, setSchools] = useState([]);
  const [schoolName, setSchoolName] = useState('');
  const [schoolYear, setSchoolYear] = useState('');
  const [schoolRel, setSchoolRel] = useState('alumni');
  const [schoolConsent, setSchoolConsent] = useState(false);
  const [schoolBusy, setSchoolBusy] = useState(false);
  const [activity, setActivity] = useState([]);
  const [privacy, setPrivacy] = useState({ showEmail: false, showPhone: false, showSchool: true, showLocation: true, allowMessages: true });
  const [avatarUploading, setAvatarUploading] = useState(false);
  const fileRef = useRef(null);

  const load = async () => {
    setLoading(true);
    try {
      const [pRes, sRes, aRes] = await Promise.allSettled([
        alumniService.getAlumniProfile?.(),
        alumniService.getLinkedSchools?.(),
        alumniService.getMyActivity?.(),
      ]);
      if (pRes.status === 'fulfilled' && pRes.value?.success) {
        const p = pRes.value.data || {};
        setProfile(p);
        setForm(p);
        setPrivacy((prev) => ({ ...prev, ...(p.privacy || {}) }));
      }
      if (sRes.status === 'fulfilled' && sRes.value?.success) setSchools(Array.isArray(sRes.value.data) ? sRes.value.data : []);
      if (aRes.status === 'fulfilled' && aRes.value?.success) setActivity(Array.isArray(aRes.value.data) ? aRes.value.data : []);
    } catch (e) {
      safeLog(e);
      addErrorNotification('Profile', 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  const save = async () => {
    setSaving(true);
    try {
      const payload = {
        displayName: (form.displayName || '').slice(0, 100),
        headline: (form.headline || '').slice(0, 150),
        bio: (form.bio || '').slice(0, 1000),
        company: (form.company || '').slice(0, 100),
        position: (form.position || '').slice(0, 100),
        location: (form.location || '').slice(0, 100),
        industry: (form.industry || '').slice(0, 60),
        website: /^https?:\/\//i.test(form.website || '') ? form.website : '',
        phone: (form.phone || '').slice(0, 30),
        interests: Array.isArray(form.interests) ? form.interests.slice(0, 20) : [],
        privacy,
      };
      const res = await alumniService.updateAlumniProfile?.(payload);
      if (res?.success) {
        addSuccessNotification('Profile', 'Profile updated');
        setEditing(false);
        load();
      } else {
        addErrorNotification('Profile', res?.error || 'Update failed');
      }
    } finally {
      setSaving(false);
    }
  };

  const requestSchool = async () => {
    if (!schoolName.trim()) { addErrorNotification('School', 'Enter a school name'); return; }
    if (!schoolConsent) { addErrorNotification('School', 'Please agree to school verification and display consent'); return; }
    setSchoolBusy(true);
    try {
      const res = await alumniService.requestSchoolLink?.({ name: schoolName.trim(), graduationYear: schoolYear ? parseInt(schoolYear, 10) : new Date().getFullYear(), relationship: schoolRel, consentAccepted: true });
      if (res?.success) {
        addSuccessNotification('School', 'Verification requested');
        setSchoolName(''); setSchoolYear(''); setSchoolConsent(false);
        load();
      } else {
        addErrorNotification('School', res?.error || 'Request failed');
      }
    } finally {
      setSchoolBusy(false);
    }
  };

  const unlinkSchool = async (id) => {
    if (!window.confirm('Remove this school from your profile?')) return;
    const res = await alumniService.unlinkSchool?.(id);
    if (res?.success) { load(); addSuccessNotification('School', 'School removed'); }
  };

  const onAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) { addErrorNotification('Avatar', 'Only JPG, PNG, or WEBP allowed'); return; }
    if (file.size > MAX_AVATAR_BYTES) { addErrorNotification('Avatar', 'File exceeds 5MB'); return; }
    setAvatarUploading(true);
    try {
      const res = await alumniService.uploadAvatar?.(file);
      if (res?.success && res.data?.url) {
        updateUserPhoto?.(res.data.url);
        setProfile((p) => ({ ...p, photoURL: res.data.url }));
        setForm((f) => ({ ...f, photoURL: res.data.url }));
        addSuccessNotification('Avatar', 'Avatar updated');
      } else {
        addErrorNotification('Avatar', 'Upload failed');
      }
    } finally {
      setAvatarUploading(false);
      e.target.value = '';
    }
  };

  const savePrivacy = async () => {
    try {
      const res = await alumniService.updateAlumniPrivacy?.(privacy);
      if (res?.success) addSuccessNotification('Privacy', 'Preferences saved');
    } catch { addErrorNotification('Privacy', 'Save failed'); }
  };

  const completion = useMemo(() => {
    const fields = ['displayName', 'headline', 'bio', 'company', 'position', 'location', 'industry', 'phone', 'photoURL'];
    const filled = fields.filter((f) => profile?.[f]);
    return Math.round((filled.length / fields.length) * 100);
  }, [profile]);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-6 dark:bg-slate-950 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1500px] animate-pulse space-y-4">
          <div className="h-40 rounded-2xl bg-slate-100 dark:bg-slate-800" />
          <div className="h-64 rounded-2xl bg-slate-100 dark:bg-slate-800" />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 dark:bg-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1500px]">
        <header className="mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div className="h-24 bg-gradient-to-r from-brand-500 to-brand-700" />
          <div className="-mt-12 flex flex-col items-start gap-3 px-6 pb-6 sm:flex-row sm:items-end">
            <div className="relative">
              <img src={profile?.photoURL || profile?.profilePhoto || userProfile?.photoURL || `${AVATAR}${encodeURIComponent(safe(profile?.displayName || userProfile?.displayName || 'A'))}`} alt="" referrerPolicy="no-referrer" className="h-24 w-24 rounded-full border-4 border-white object-cover dark:border-slate-900" />
              <button onClick={() => fileRef.current?.click()} disabled={avatarUploading} className="absolute bottom-0 right-0 rounded-full bg-brand-600 p-2 text-white shadow hover:bg-brand-700" aria-label="Change avatar">
                {avatarUploading ? <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <FaCamera className="h-3 w-3" />}
              </button>
              <input ref={fileRef} type="file" accept={ALLOWED_IMAGE_TYPES.join(',')} onChange={onAvatarChange} className="hidden" />
            </div>
            <div className="flex-1 sm:pb-2">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{safe(profile?.displayName || userProfile?.displayName || 'Alumni')}</h1>
              <p className="text-sm text-slate-500">{safe(profile?.headline || 'Add a headline to stand out')}</p>
              <p className="mt-1 flex items-center gap-1 text-xs text-slate-500"><FaMapPin /> {safe(profile?.location || 'Location not set')}</p>
            </div>
            <div className="flex gap-2 sm:pb-2">
              {!editing ? (
                <button onClick={() => setEditing(true)} className="flex items-center gap-1 rounded-lg bg-brand-600 px-3 py-2 text-xs font-semibold text-white"><FaEdit /> Edit profile</button>
              ) : (
                <>
                  <button onClick={() => { setEditing(false); setForm(profile || {}); }} className="rounded-lg border border-slate-200 px-3 py-2 text-xs dark:border-slate-700">Cancel</button>
                  <button onClick={save} disabled={saving} className="flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white"><FaSave /> {saving ? 'Saving…' : 'Save'}</button>
                </>
              )}
            </div>
          </div>
          <div className="border-t border-slate-100 p-4 dark:border-slate-800">
            <div className="mb-1 flex justify-between text-xs"><span className="font-semibold text-slate-700 dark:text-slate-200">Profile completion</span><span className="text-slate-500">{completion}%</span></div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"><div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${completion}%` }} /></div>
          </div>
        </header>

        <div className="mb-4 flex flex-wrap gap-1 rounded-xl border border-slate-200 bg-white p-1 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          {[
            { id: 'overview', label: 'Overview', icon: FaUser },
            { id: 'schools', label: 'My schools', icon: FaBookOpen },
            { id: 'privacy', label: 'Privacy', icon: FaCheckCircle },
            { id: 'activity', label: 'Activity', icon: FaUsers },
          ].map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)} className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold ${tab === t.id ? 'bg-brand-600 text-white shadow' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'}`}><t.icon /> {t.label}</button>
          ))}
        </div>

        {tab === 'overview' && (
          <div className="grid gap-4 lg:grid-cols-2">
            <Section title="Personal information" icon={FaUser}>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Display name" value={form.displayName} editing={editing} onChange={(v) => setForm((f) => ({ ...f, displayName: v }))} maxLength={100} />
                <Field label="Headline" value={form.headline} editing={editing} onChange={(v) => setForm((f) => ({ ...f, headline: v }))} maxLength={150} />
                <Field label="Location" value={form.location} editing={editing} onChange={(v) => setForm((f) => ({ ...f, location: v }))} maxLength={100} />
                <Field label="Industry" value={form.industry} editing={editing} onChange={(v) => setForm((f) => ({ ...f, industry: v }))} maxLength={60} />
                <Field label="Phone" value={form.phone} editing={editing} onChange={(v) => setForm((f) => ({ ...f, phone: v }))} maxLength={30} />
                <Field label="Website" value={form.website} editing={editing} onChange={(v) => setForm((f) => ({ ...f, website: v }))} maxLength={300} placeholder="https://…" />
              </div>
              <div className="mt-3">
                <label className="text-xs font-medium text-slate-600 dark:text-slate-300">Bio</label>
                {editing ? <textarea value={form.bio || ''} onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value.slice(0, 1000) }))} rows={4} className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm dark:border-slate-700 dark:bg-slate-800" /> : <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-300">{safe(profile?.bio) || <span className="text-slate-400">No bio yet</span>}</p>}
              </div>
            </Section>

            <Section title="Professional" icon={FaBriefcase}>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Company" value={form.company} editing={editing} onChange={(v) => setForm((f) => ({ ...f, company: v }))} maxLength={100} />
                <Field label="Position" value={form.position} editing={editing} onChange={(v) => setForm((f) => ({ ...f, position: v }))} maxLength={100} />
              </div>
              <div className="mt-3">
                <label className="text-xs font-medium text-slate-600 dark:text-slate-300">Interests</label>
                {editing ? (
                  <input value={(form.interests || []).join(', ')} onChange={(e) => setForm((f) => ({ ...f, interests: e.target.value.split(',').map((s) => s.trim()).filter(Boolean).slice(0, 20) }))} placeholder="Comma separated" className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm dark:border-slate-700 dark:bg-slate-800" />
                ) : (
                  <div className="mt-1 flex flex-wrap gap-1">{(profile?.interests || []).slice(0, 10).map((t, i) => <span key={i} className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] dark:bg-slate-800">{safe(t)}</span>)}{(!profile?.interests || profile.interests.length === 0) && <span className="text-xs text-slate-400">Not set</span>}</div>
                )}
              </div>
            </Section>
          </div>
        )}

        {tab === 'schools' && (
          <div className="grid gap-4 lg:grid-cols-2">
            <Section title="My schools" icon={FaBookOpen}>
              {schools.length === 0 ? (
                <p className="text-xs text-slate-500">No schools linked yet. Verify a school to unlock mentors and alumni from your alma mater.</p>
              ) : (
                <ul className="space-y-2">
                  {schools.map((s) => (
                    <li key={s.id} className="flex items-center gap-3 rounded-lg border border-slate-100 p-2 dark:border-slate-800">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-brand-700"><FaBookOpen className="h-3 w-3" /></span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-semibold">{safe(s.name)}</p>
                        <p className="truncate text-[11px] text-slate-500">{s.status === 'verified' ? '✓ Verified' : s.status === 'pending' ? '⏳ Pending' : 'Unverified'} · {safe(s.relationship || 'Alumni')}</p>
                      </div>
                      {s.status !== 'pending' && <button onClick={() => unlinkSchool(s.id)} className="text-[11px] font-semibold text-slate-400 hover:text-red-500"><FaTrash /></button>}
                    </li>
                  ))}
                </ul>
              )}
            </Section>

            <Section title="Link a new school" icon={FaCheck}>
              <div className="space-y-2">
                <input value={schoolName} onChange={(e) => setSchoolName(e.target.value.slice(0, 200))} placeholder="School name" className="w-full rounded-lg border border-slate-200 p-2 text-sm dark:border-slate-700 dark:bg-slate-800" />
                <input value={schoolYear} onChange={(e) => setSchoolYear(e.target.value.replace(/\D/g, '').slice(0, 4))} placeholder="Graduation year (optional)" className="w-full rounded-lg border border-slate-200 p-2 text-sm dark:border-slate-700 dark:bg-slate-800" />
                <select value={schoolRel} onChange={(e) => setSchoolRel(e.target.value)} className="w-full rounded-lg border border-slate-200 p-2 text-sm dark:border-slate-700 dark:bg-slate-800"><option value="alumni">Alumni</option><option value="staff">Staff</option><option value="student">Student</option><option value="parent">Parent</option></select>
                <label className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300"><input type="checkbox" checked={schoolConsent} onChange={(e) => setSchoolConsent(e.target.checked)} /><span>I consent to storing this school relationship for verification and showing the verified school on my alumni profile.</span></label>
                <button onClick={requestSchool} disabled={schoolBusy || !schoolConsent} className="flex items-center gap-1 rounded-lg bg-brand-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50">{schoolBusy ? 'Submitting…' : 'Request verification'}</button>
              </div>
            </Section>
          </div>
        )}

        {tab === 'privacy' && (
          <Section title="Privacy preferences" icon={FaCheckCircle}>
            <div className="space-y-3">
              {[
                { key: 'showEmail', label: 'Show my email on my profile' },
                { key: 'showPhone', label: 'Show my phone on my profile' },
                { key: 'showSchool', label: 'Show my schools publicly' },
                { key: 'showLocation', label: 'Show my location' },
                { key: 'allowMessages', label: 'Allow other alumni to message me' },
              ].map((p) => (
                <label key={p.key} className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={!!privacy[p.key]} onChange={(e) => setPrivacy((prev) => ({ ...prev, [p.key]: e.target.checked }))} /> {p.label}
                </label>
              ))}
            </div>
            <button onClick={savePrivacy} className="mt-4 flex items-center gap-1 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white"><FaSave /> Save preferences</button>
          </Section>
        )}

        {tab === 'activity' && (
          <Section title="Recent activity" icon={FaUsers}>
            {activity.length === 0 ? (
              <p className="text-xs text-slate-500">No activity yet.</p>
            ) : (
              <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                {activity.slice(0, 20).map((a) => (
                  <li key={a.id} className="flex items-start gap-2 py-2">
                    <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-brand-500" />
                    <div>
                      <p className="text-xs text-slate-700 dark:text-slate-200">{safe(a.description || a.type)}</p>
                      <p className="text-[10px] text-slate-400">{formatDate(a.createdAt?.toDate?.() || a.createdAt)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Section>
        )}
      </div>
    </main>
  );
};

export default AlumniProfile;
