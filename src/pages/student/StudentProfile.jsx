/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useMemo, useRef, useState } from 'react';
import { 
  Camera, X, Save, User, GraduationCap, Briefcase, Code, 
  Link as LinkIcon, Award, CheckCircle2, AlertCircle, 
  Plus, Trash2, Loader2, CloudUpload
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import settingsService from '../../services/settingsService';
import { updateStudentProfile } from '../../services/studentServices';

// ============================================================================
// SECURITY & SANITIZATION UTILS (OWASP Alignment)
// ============================================================================
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const sanitizeInput = (str) => {
  if (typeof str !== 'string') return str;
  // Basic XSS prevention: strip HTML tags, though React escapes by default
  return str.replace(/<[^>]*>?/gm, '').trim();
};

const validateUrl = (url) => {
  if (!url) return true;
  try {
    const parsed = new URL(url.startsWith('http') ? url : `https://${url}`);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
};

const normalizeTextItems = (items) => Array.isArray(items)
  ? items.map((item) => typeof item === 'string' ? item : item?.name || item?.title || '').filter(Boolean)
  : [];

const normalizeObjectItems = (items, fields) => Array.isArray(items)
  ? items.map((item) => {
    if (item && typeof item === 'object' && !Array.isArray(item)) return item;
    return { [fields[0]]: typeof item === 'string' ? item : '' };
  })
  : [];

// ============================================================================
// DEFAULT STATE (The 19-Step Data Model)
// ============================================================================
const createDefaultProfile = (currentUser, userProfile) => ({
  // 1-4: Basic Info
  fullName: userProfile?.fullName || currentUser?.displayName || '',
  email: userProfile?.email || currentUser?.email || '',
  phone: userProfile?.phone || '',
  location: userProfile?.location || '',
  bio: userProfile?.bio || '',
  profilePhoto: userProfile?.profilePhoto || currentUser?.photoURL || '',
  
  // 5-7: Academic
  institution: userProfile?.institution || '',
  program: userProfile?.program || '',
  yearOfStudy: userProfile?.yearOfStudy || '',
  
  // 8-10: Professional Links
  portfolioUrl: userProfile?.portfolioUrl || '',
  linkedinUrl: userProfile?.linkedinUrl || '',
  githubUrl: userProfile?.githubUrl || '',
  
  // 11-13: Skills & Languages
  skills: normalizeTextItems(userProfile?.skills),
  softSkills: normalizeTextItems(userProfile?.softSkills),
  languages: normalizeTextItems(userProfile?.languages),
  
  // 14-16: Experience & Projects
  experience: normalizeObjectItems(userProfile?.experience, ['role']),
  projects: normalizeObjectItems(userProfile?.projects, ['name']),
  certifications: normalizeObjectItems(userProfile?.certifications, ['name']),
  
  // 17-19: Meta & Preferences
  availability: userProfile?.availability || 'Open to work',
  preferredLocations: userProfile?.preferredLocations || '',
  expectedSalary: userProfile?.expectedSalary || '',
});

const StudentProfile = () => {
  const { currentUser, userProfile, refreshUserProfile, updateUserPhoto } = useAuth();
  const photoInputRef = useRef(null);
  
  // State
  const [profile, setProfile] = useState(() => createDefaultProfile(currentUser, userProfile));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [autoSaveStatus, setAutoSaveStatus] = useState('saved'); // 'saving', 'saved', 'error'
  // Temporary input states
  const [newSkill, setNewSkill] = useState('');
  const [newSoftSkill, setNewSoftSkill] = useState('');
  const [newLanguage, setNewLanguage] = useState('');
  const saveQueueRef = useRef(Promise.resolve());

  // ==========================================================================
  // Save debounced edits to Firestore; the database remains the source of truth.
  // ==========================================================================
  useEffect(() => {
    if (loading || !currentUser) return;
    
    setAutoSaveStatus('saving');
    const timeoutId = setTimeout(() => {
      const payload = { ...profile, userType: 'student' };
      saveQueueRef.current = saveQueueRef.current
        .catch(() => {})
        .then(async () => {
          const [settingsResult, studentResult] = await Promise.all([
            settingsService.saveUserSettings(currentUser.uid, 'student', payload),
            updateStudentProfile(currentUser.uid, payload),
          ]);
          if (!settingsResult?.success || !studentResult?.success) {
            throw new Error('Your profile changes could not be saved.');
          }
          setAutoSaveStatus('saved');
        })
        .catch((error) => {
          console.error('Student profile auto-save failed:', error);
          setAutoSaveStatus('error');
        });
    }, 1200);

    return () => clearTimeout(timeoutId);
  }, [profile, loading, currentUser]);

  // Load the saved profile from Firebase.
  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    const loadData = async () => {
      try {
        const result = await settingsService?.getUserSettings?.(currentUser.uid, 'student');
        if (result?.success && result?.data) {
          setProfile(createDefaultProfile(currentUser, { ...userProfile, ...result.data }));
        }
      } catch (error) {
        console.error('Failed to load profile:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [currentUser, userProfile]);

  // ==========================================================================
  // HELPERS
  // ==========================================================================
  const profileCompletion = useMemo(() => {
    const fields = [
      profile.fullName, profile.phone, profile.location, profile.bio,
      profile.institution, profile.program, profile.yearOfStudy,
      profile.linkedinUrl, profile.githubUrl
    ];
    const basic = Math.round((fields.filter(Boolean).length / fields.length) * 50);
    const skills = profile.skills.length > 0 ? 15 : 0;
    const exp = profile.experience.length > 0 ? 15 : 0;
    const photo = profile.profilePhoto ? 10 : 0;
    return Math.min(100, basic + skills + exp + photo);
  }, [profile]);

  const updateField = (field, value) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleListAdd = (field, value) => {
    if (typeof value === 'string' && !value.trim()) return;
    setProfile(prev => ({
      ...prev,
      [field]: [...(Array.isArray(prev[field]) ? prev[field] : []), typeof value === 'string' ? sanitizeInput(value) : value]
    }));
  };

  const updateListItem = (field, index, key, value) => {
    setProfile((prev) => ({
      ...prev,
      [field]: prev[field].map((item, itemIndex) => itemIndex === index
        ? { ...item, [key]: sanitizeInput(value) }
        : item),
    }));
  };

  const handleListRemove = (field, index) => {
    setProfile(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  // ==========================================================================
  // ACTIONS (Save & Upload)
  // ==========================================================================
  const handleSave = async () => {
    if (!currentUser) {
      setStatus({ type: 'error', message: 'You must be signed in to save.' });
      return;
    }

    // Validate URLs
    if (profile.linkedinUrl && !validateUrl(profile.linkedinUrl)) {
      setStatus({ type: 'error', message: 'Invalid LinkedIn URL format.' });
      return;
    }
    if (profile.githubUrl && !validateUrl(profile.githubUrl)) {
      setStatus({ type: 'error', message: 'Invalid GitHub URL format.' });
      return;
    }

    try {
      setSaving(true);
      setStatus({ type: '', message: '' });

      const payload = {
        ...profile,
        userType: 'student',
        updatedAt: new Date().toISOString(),
      };

      const [settingsResult, studentResult] = await Promise.all([
        settingsService.saveUserSettings(currentUser.uid, 'student', payload),
        updateStudentProfile(currentUser.uid, payload),
      ]);

      if (!settingsResult?.success || !studentResult?.success) {
        throw new Error('Database sync failed. Please try again.');
      }

      setAutoSaveStatus('saved');
      await refreshUserProfile?.();
      setStatus({ type: 'success', message: 'Profile saved successfully.' });
    } catch (error) {
      console.error('Save error:', error);
      setStatus({ type: 'error', message: error.message || 'Failed to save profile.' });
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file || !currentUser?.uid) return;

    // OWASP: Validate file type and size
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setStatus({ type: 'error', message: 'Only JPG, PNG, and WebP images are allowed.' });
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setStatus({ type: 'error', message: 'Image must be smaller than 5MB.' });
      return;
    }

    setSaving(true);
    setStatus({ type: '', message: '' });

    try {
      const uploaded = await settingsService.uploadProfileMedia(file, { 
        userId: currentUser.uid, 
        role: 'student', 
        folder: `students/${currentUser.uid}/profile` 
      });

      const newPhotoUrl = uploaded.url;
      setProfile(prev => ({ ...prev, profilePhoto: newPhotoUrl }));
      
      await updateStudentProfile(currentUser.uid, { 
        profilePhoto: newPhotoUrl, 
        photoURL: newPhotoUrl 
      });
      
      await updateUserPhoto?.(newPhotoUrl);
      setStatus({ type: 'success', message: 'Photo updated successfully.' });
    } catch (err) {
      setStatus({ type: 'error', message: 'Failed to upload image.' });
    } finally {
      setSaving(false);
      event.target.value = '';
    }
  };

  // ==========================================================================
  // RENDER
  // ==========================================================================
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="h-10 w-10 animate-spin text-brand-600" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 pb-12 dark:bg-slate-950">
      
      {/* HEADER */}
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/80">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Profile</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Build your CV-ready profile.</p>
          </div>
          <div className="flex items-center gap-4">
            {/* Auto-save indicator */}
            <div className="hidden items-center gap-2 text-sm text-slate-500 sm:flex">
                  {autoSaveStatus === 'saving' && <><CloudUpload className="h-4 w-4 animate-bounce" /> Saving to your profile...</>}
                  {autoSaveStatus === 'saved' && <><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Saved to your profile</>}
              {autoSaveStatus === 'error' && <><AlertCircle className="h-4 w-4 text-rose-500" /> Save failed</>}
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 font-medium text-white transition hover:bg-brand-700 disabled:opacity-50"
            >
              {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto mt-8 max-w-5xl px-4 sm:px-6">
        
        {/* STATUS BANNER */}
        {status.message && (
          <div className={`mb-6 flex items-center gap-3 rounded-xl border p-4 ${
            status.type === 'error' ? 'border-rose-200 bg-rose-50 text-rose-700' : 
            status.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 
            'border-blue-200 bg-blue-50 text-blue-700'
          }`}>
            {status.type === 'error' ? <AlertCircle className="h-5 w-5" /> : <CheckCircle2 className="h-5 w-5" />}
            <p className="text-sm font-medium">{status.message}</p>
            <button onClick={() => setStatus({type:'', message:''})} className="ml-auto hover:opacity-75"><X className="h-4 w-4" /></button>
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-3">
          
          {/* LEFT COLUMN: Basic Info & Photo */}
          <div className="space-y-6 lg:col-span-1">
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex flex-col items-center">
                <div className="group relative h-32 w-32 overflow-hidden rounded-full border-4 border-slate-100 bg-slate-50 dark:border-slate-800">
                  {profile.profilePhoto ? (
                    <img src={profile.profilePhoto} alt="Profile" className="h-full w-full object-cover" />
                  ) : (
                    <User className="h-16 w-16 m-8 text-slate-300" />
                  )}
                  <div 
                    onClick={() => photoInputRef.current?.click()}
                    className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/50 opacity-0 transition group-hover:opacity-100"
                  >
                    <Camera className="h-8 w-8 text-white" />
                  </div>
                </div>
                <input ref={photoInputRef} type="file" accept="image/*" hidden onChange={handlePhotoUpload} />
                <h2 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">{profile.fullName || 'Your profile'}</h2>
                <p className="text-sm text-slate-500">{profile.program || 'Add your program'}</p>
              </div>

              {/* Completion Bar */}
              <div className="mt-6">
                <div className="mb-2 flex justify-between text-xs font-medium">
                  <span className="text-slate-600 dark:text-slate-400">Profile Strength</span>
                  <span className="text-brand-600">{profileCompletion}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div className="h-full rounded-full bg-brand-500 transition-all duration-500" style={{ width: `${profileCompletion}%` }} />
                </div>
              </div>

              <div className="mt-8 space-y-4">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-500 uppercase">Full Name</label>
                  <input type="text" value={profile.fullName} onChange={e => updateField('fullName', e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-500 uppercase">Email (Read-only)</label>
                  <input type="email" value={profile.email} readOnly className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-500 uppercase">Phone</label>
                  <input type="tel" value={profile.phone} onChange={e => updateField('phone', e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-500 uppercase">Location</label>
                  <input type="text" value={profile.location} onChange={e => updateField('location', e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-500 uppercase">Bio</label>
                  <textarea rows="4" value={profile.bio} onChange={e => updateField('bio', e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
                </div>
              </div>
            </section>
          </div>

          {/* RIGHT COLUMN: The 19-Step Detail Modules */}
          <div className="space-y-6 lg:col-span-2">
            
            {/* ACADEMIC */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="mb-6 flex items-center gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
                <div className="rounded-lg bg-emerald-100 p-2 text-emerald-600 dark:bg-emerald-900/30"><GraduationCap className="h-5 w-5" /></div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Academic Information</h3>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-500 uppercase">Institution</label>
                  <input type="text" value={profile.institution} onChange={e => updateField('institution', e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-500 uppercase">Program / Degree</label>
                  <input type="text" value={profile.program} onChange={e => updateField('program', e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-500 uppercase">Year of Study</label>
                  <input type="text" value={profile.yearOfStudy} onChange={e => updateField('yearOfStudy', e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
                </div>
              </div>
            </section>

            {/* LINKS & PORTFOLIO */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="mb-6 flex items-center gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
                <div className="rounded-lg bg-blue-100 p-2 text-blue-600 dark:bg-blue-900/30"><LinkIcon className="h-5 w-5" /></div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Professional Links</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-500 uppercase">LinkedIn URL</label>
                  <input type="url" value={profile.linkedinUrl} onChange={e => updateField('linkedinUrl', e.target.value)} placeholder="https://linkedin.com/in/..." className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-500 uppercase">GitHub / Portfolio</label>
                  <input type="url" value={profile.githubUrl} onChange={e => updateField('githubUrl', e.target.value)} placeholder="https://github.com/..." className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-500 uppercase">Portfolio website</label>
                  <input type="url" value={profile.portfolioUrl} onChange={e => updateField('portfolioUrl', e.target.value)} placeholder="https://" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
                </div>
              </div>
            </section>

            {/* SOFT SKILLS & LANGUAGES */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="mb-4 flex items-center gap-3"><Award className="h-5 w-5 text-violet-600" /><h3 className="text-lg font-semibold text-slate-900 dark:text-white">Strengths & languages</h3></div>
              {[['softSkills', 'Soft skills', newSoftSkill, setNewSoftSkill], ['languages', 'Languages', newLanguage, setNewLanguage]].map(([field, label, value, setter]) => (
                <div key={field} className="mb-5 last:mb-0">
                  <h4 className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-200">{label}</h4>
                  <div className="mb-3 flex flex-wrap gap-2">{profile[field].map((item, index) => <span key={`${field}-${index}`} className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-sm dark:bg-slate-800 dark:text-slate-200">{item}<button type="button" aria-label={`Remove ${item}`} onClick={() => handleListRemove(field, index)}><X className="h-3.5 w-3.5" /></button></span>)}</div>
                  <div className="flex gap-2"><input value={value} onChange={(event) => setter(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); handleListAdd(field, value); setter(''); } }} className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white" aria-label={`Add ${label.toLowerCase()}`} /><button type="button" onClick={() => { handleListAdd(field, value); setter(''); }} className="rounded-lg bg-slate-900 px-3 py-2 text-sm text-white dark:bg-slate-700">Add</button></div>
                </div>
              ))}
            </section>

            {/* SKILLS */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="mb-6 flex items-center gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
                <div className="rounded-lg bg-violet-100 p-2 text-violet-600 dark:bg-violet-900/30"><Code className="h-5 w-5" /></div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Skills</h3>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {profile.skills.map((skill, index) => (
                  <span key={index} className="flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                    {skill}
                    <button onClick={() => handleListRemove('skills', index)} className="text-slate-400 hover:text-rose-500"><X className="h-3.5 w-3.5" /></button>
                  </span>
                ))}
                {profile.skills.length === 0 && <p className="text-sm text-slate-500">No skills added yet.</p>}
              </div>

              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={newSkill} 
                  onChange={e => setNewSkill(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { handleListAdd('skills', newSkill); setNewSkill(''); } }}
                  placeholder="e.g. JavaScript, Project Management" 
                  className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white" 
                />
                <button 
                  onClick={() => { handleListAdd('skills', newSkill); setNewSkill(''); }}
                  className="flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 dark:bg-slate-700"
                >
                  <Plus className="h-4 w-4" /> Add
                </button>
              </div>
            </section>

            {/* EXPERIENCE */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="mb-6 flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-orange-100 p-2 text-orange-600 dark:bg-orange-900/30"><Briefcase className="h-5 w-5" /></div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Experience</h3>
                </div>
                <button 
                  type="button"
                  onClick={() => handleListAdd('experience', { role: '', company: '', startDate: '', endDate: '', description: '' })}
                  className="text-sm font-medium text-brand-600 hover:text-brand-700"
                >
                  + Add Experience
                </button>
              </div>
              
              <div className="space-y-4">
                {profile.experience.map((exp, index) => (
                  <div key={index} className="relative rounded-xl border border-slate-200 p-4 dark:border-slate-700">
                    <button onClick={() => handleListRemove('experience', index)} className="absolute right-3 top-3 text-slate-400 hover:text-rose-500"><Trash2 className="h-4 w-4" /></button>
                    <div className="grid gap-3 sm:grid-cols-2">
                       <div>
                         <label className="mb-1 block text-xs font-medium text-slate-500">Role</label>
                         <input type="text" value={exp.role || ''} onChange={e => updateListItem('experience', index, 'role', e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
                       </div>
                       <div>
                         <label className="mb-1 block text-xs font-medium text-slate-500">Company</label>
                         <input type="text" value={exp.company || ''} onChange={e => updateListItem('experience', index, 'company', e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
                       </div>
                       <div><label className="mb-1 block text-xs font-medium text-slate-500">Start date</label><input type="text" value={exp.startDate || ''} onChange={e => updateListItem('experience', index, 'startDate', e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white" /></div>
                       <div><label className="mb-1 block text-xs font-medium text-slate-500">End date</label><input type="text" value={exp.endDate || ''} onChange={e => updateListItem('experience', index, 'endDate', e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white" /></div>
                       <div className="sm:col-span-2"><label className="mb-1 block text-xs font-medium text-slate-500">What you did</label><textarea rows="3" value={exp.description || ''} onChange={e => updateListItem('experience', index, 'description', e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white" /></div>
                    </div>
                  </div>
                ))}
                {profile.experience.length === 0 && <p className="text-sm text-slate-500">No experience added yet.</p>}
              </div>
            </section>

            {/* PROJECTS & CERTIFICATIONS */}
            {[
              { field: 'projects', title: 'Projects', icon: Code, empty: 'No projects added yet.', initial: { name: '', description: '', url: '' }, fields: [['name', 'Project name'], ['description', 'Description'], ['url', 'Project link']] },
              { field: 'certifications', title: 'Certificates', icon: Award, empty: 'No certificates added yet.', initial: { name: '', issuer: '', date: '' }, fields: [['name', 'Certificate'], ['issuer', 'Issued by'], ['date', 'Date']] },
            ].map(({ field, title, icon: Icon, empty, initial, fields }) => (
              <section key={field} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="mb-5 flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800"><div className="flex items-center gap-3"><Icon className="h-5 w-5 text-brand-600" /><h3 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h3></div><button type="button" onClick={() => handleListAdd(field, initial)} className="text-sm font-medium text-brand-600">+ Add</button></div>
                <div className="space-y-4">{profile[field].map((item, index) => <div key={`${field}-${index}`} className="relative grid gap-3 rounded-xl border border-slate-200 p-4 pr-12 dark:border-slate-700 sm:grid-cols-2">{fields.map(([key, label]) => <label key={key} className={key === 'description' ? 'sm:col-span-2' : ''}><span className="mb-1 block text-xs font-medium text-slate-500">{label}</span>{key === 'description' ? <textarea rows="3" value={item[key] || ''} onChange={e => updateListItem(field, index, key, e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white" /> : <input type={key === 'url' ? 'url' : 'text'} value={item[key] || ''} onChange={e => updateListItem(field, index, key, e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white" />}</label>)}<button type="button" aria-label={`Remove ${title.toLowerCase()}`} onClick={() => handleListRemove(field, index)} className="absolute right-3 top-3 text-slate-400 hover:text-rose-500"><Trash2 className="h-4 w-4" /></button></div>)}{profile[field].length === 0 && <p className="text-sm text-slate-500">{empty}</p>}</div>
              </section>
            ))}

            {/* JOB PREFERENCES */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="mb-5 flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-emerald-600" /><h3 className="text-lg font-semibold text-slate-900 dark:text-white">Work preferences</h3></div>
              <div className="grid gap-4 sm:grid-cols-2">
                <label><span className="mb-1 block text-xs font-medium text-slate-500">Availability</span><select value={profile.availability} onChange={e => updateField('availability', e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white"><option value="Open to work">Open to work</option><option value="Not looking">Not looking</option><option value="Available for internships">Available for internships</option></select></label>
                <label><span className="mb-1 block text-xs font-medium text-slate-500">Preferred locations</span><input value={profile.preferredLocations} onChange={e => updateField('preferredLocations', e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white" /></label>
                <label className="sm:col-span-2"><span className="mb-1 block text-xs font-medium text-slate-500">Expected monthly salary (LSL)</span><input type="number" min="0" value={profile.expectedSalary} onChange={e => updateField('expectedSalary', e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white" /></label>
              </div>
            </section>

          </div>
        </div>
      </div>
    </main>
  );
};

export default StudentProfile;
