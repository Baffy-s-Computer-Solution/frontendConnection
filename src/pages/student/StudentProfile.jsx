import { useEffect, useMemo, useRef, useState } from 'react';
import { Camera } from 'lucide-react';
import { FaBriefcase, FaCheckCircle, FaEdit, FaGraduationCap, FaSave, FaUser } from "react-icons/fa";

import { useAuth } from '../../context/AuthContext';
import settingsService from '../../services/settingsService';
import { updateStudentProfile } from '../../services/studentServices';

const createDefaultProfile = (currentUser, userProfile) => ({
  fullName: userProfile?.fullName || userProfile?.displayName || currentUser?.displayName || '',
  email: userProfile?.email || currentUser?.email || '',
  phone: userProfile?.phone || userProfile?.contactNumber || '',
  studentId: userProfile?.studentId || '',
  institution: userProfile?.institution || '',
  program: userProfile?.program || '',
  yearOfStudy: userProfile?.yearOfStudy || '',
  bio: userProfile?.bio || userProfile?.description || '',
  skills: Array.isArray(userProfile?.skills)
    ? userProfile.skills.map((skill) => typeof skill === 'string' ? skill : skill?.name || skill?.title || '').filter(Boolean)
    : [],
  profilePhoto: userProfile?.profilePhoto || userProfile?.photoURL || currentUser?.photoURL || '',
  location: userProfile?.location || '',
});

const StudentProfile = () => {
  const { currentUser, userProfile, refreshUserProfile, updateUserPhoto } = useAuth();
  const photoInputRef = useRef(null);
  const [profile, setProfile] = useState(() => createDefaultProfile(currentUser, userProfile));
  const [newSkill, setNewSkill] = useState('');
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState('');

  useEffect(() => {
    if (!currentUser) return undefined;

    const syncProfile = (data = {}) => {
      setProfile(createDefaultProfile(currentUser, { ...userProfile, ...data }));
    };

    const loadProfile = async () => {
      try {
        const result = await settingsService?.getUserSettings?.(currentUser.uid, 'student');
        if (result?.success && result?.data) {
          syncProfile(result.data);
        }
      } catch (error) {
        console.error('Failed to load student profile settings:', error);
      }
    };

    loadProfile();
    const unsubscribe = settingsService?.watchUserSettings?.(currentUser.uid, 'student', syncProfile);

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [currentUser, userProfile]);

  const profileCompletion = useMemo(() => {
    const fields = [profile.fullName, profile.email, profile.phone, profile.location, profile.studentId, profile.institution, profile.program, profile.yearOfStudy, profile.bio];
    const basic = Math.round((fields.filter((value) => String(value || '').trim()).length / fields.length) * 40);
    return Math.min(100, basic + (profile.skills.length ? 10 : 0) + (profile.profilePhoto ? 10 : 0));
  }, [profile]);

  const updateField = (field, value) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const addSkill = (value) => {
    const skill = value.trim();
    if (!skill) return;

    setProfile((prev) => ({
      ...prev,
      skills: prev.skills.includes(skill) ? prev.skills : [...prev.skills, skill],
    }));
    setNewSkill('');
  };

  const removeSkill = (skillToRemove) => {
    setProfile((prev) => ({
      ...prev,
      skills: prev.skills.filter((skill) => skill !== skillToRemove),
    }));
  };

  const handleSave = async () => {
    if (!currentUser) {
      setStatus('You need to sign in to save your profile.');
      return;
    }

    try {
      setSaving(true);
      setStatus('');

      const payload = {
        fullName: profile.fullName,
        displayName: profile.fullName,
        email: profile.email,
        phone: profile.phone,
        studentId: profile.studentId,
        institution: profile.institution,
        program: profile.program,
        yearOfStudy: profile.yearOfStudy,
        bio: profile.bio,
        skills: Array.isArray(profile.skills) ? profile.skills : [],
        profilePhoto: profile.profilePhoto,
        photoURL: profile.profilePhoto,
        location: profile.location,
        userType: 'student',
        updatedAt: new Date().toISOString(),
      };

      if (typeof settingsService?.saveUserSettings !== 'function') {
        throw new Error('Profile persistence service is unavailable.');
      }

      const [settingsResult, studentResult] = await Promise.all([
        settingsService.saveUserSettings(currentUser.uid, 'student', payload),
        updateStudentProfile(currentUser.uid, payload),
      ]);
      if (!settingsResult?.success || !studentResult?.success) {
        throw new Error(settingsResult?.error || studentResult?.error || 'Unable to save the profile.');
      }
      await refreshUserProfile?.();
      setStatus('Profile saved successfully.');
    } catch (error) {
      console.error('Student profile save failed:', error);
      setStatus(error.message || 'Unable to save your profile right now.');
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file || !currentUser?.uid) return;
    if (!file.type.startsWith('image/') || file.size > 5 * 1024 * 1024) {
      setStatus('Choose an image no larger than 5 MB.');
      event.target.value = '';
      return;
    }
    setSaving(true); setStatus('');
    try {
      const uploaded = await settingsService.uploadProfileMedia(file, { userId: currentUser.uid, role: 'student', folder: `students/${currentUser.uid}/profile` });
      const nextProfile = { ...profile, profilePhoto: uploaded.url };
      setProfile(nextProfile);
      const payload = { profilePhoto: uploaded.url, photoURL: uploaded.url, updatedAt: new Date().toISOString() };
      const [settingsResult, studentResult] = await Promise.all([
        settingsService.saveUserSettings(currentUser.uid, 'student', payload),
        updateStudentProfile(currentUser.uid, payload),
      ]);
      if (!settingsResult?.success || !studentResult?.success) throw new Error(settingsResult?.error || studentResult?.error || 'Photo saved, but profile sync failed.');
      await refreshUserProfile?.();
      await updateUserPhoto?.(uploaded.url);
      setStatus('Profile photo updated successfully.');
    } catch (uploadError) { setStatus(uploadError.message || 'Unable to upload your profile photo.'); }
    finally { setSaving(false); event.target.value = ''; }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 dark:bg-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-6 rounded-2xl bg-gradient-to-r from-brand-600 to-violet-600 p-6 text-white shadow-lg">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-100">
                Student profile
              </p>
              <h1 className="mt-2 text-3xl font-bold">{profile.fullName}</h1>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-white/15 text-sm font-semibold text-white">
                {profile.profilePhoto ? <img src={profile.profilePhoto} alt={profile.fullName} className="h-full w-full object-cover" /> : profile.fullName.split(/\s+/).map((part) => part[0]).join('').slice(0, 2)}
                <button type="button" aria-label="Upload profile photo" title="Upload profile photo" onClick={() => photoInputRef.current?.click()} className="absolute inset-0 flex items-center justify-center bg-slate-950/40 opacity-0 transition hover:opacity-100 focus:opacity-100"><Camera className="h-4 w-4" /></button>
                <input ref={photoInputRef} type="file" accept="image/*" hidden onChange={handlePhotoUpload} />
              </div>
              <button
                type="button"
                aria-label="Save profile"
                title="Save profile"
                onClick={handleSave}
                disabled={saving}
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-white text-brand-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-70"
              >
                <FaSave className={saving ? 'animate-pulse' : ''} />
              </button>
            </div>
          </div>
        </header>

        <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                Profile completion
              </div>
              <div className="mt-2 text-3xl font-bold text-slate-900 dark:text-slate-100">
                {profileCompletion}%
              </div>
            </div>
            <div className="flex-1">
              <div className="h-3 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-brand-500 to-violet-500"
                  style={{ width: `${profileCompletion}%` }}
                />
              </div>
            </div>
          </div>
          {status ? (
            <div role="status" className={`mt-4 rounded-xl border px-3 py-2 text-sm ${status.includes('successfully') ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300' : 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-200'}`}>
              {status}
            </div>
          ) : null}
        </section>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <div className="mb-4 flex items-center gap-2">
              <FaUser className="text-brand-600" />
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                Personal details
              </h2>
            </div>

            <div className="space-y-4">
              <label htmlFor="student-full-name" className="block">
                <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
                  Full name
                </span>
                <input
                  id="student-full-name"
                  value={profile.fullName}
                  onChange={(event) => updateField('fullName', event.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none focus:border-brand-500 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100"
                />
              </label>

              <label htmlFor="student-email" className="block">
                <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
                  Email
                </span>
                <input
                  id="student-email"
                  type="email"
                  value={profile.email}
                  readOnly
                  title="Change your sign-in email from account security settings."
                  className="w-full rounded-xl border border-slate-300 bg-slate-100 px-3 py-2.5 text-slate-500 outline-none dark:border-slate-600 dark:bg-slate-900 dark:text-slate-400"
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label htmlFor="student-phone" className="block">
                  <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
                    Phone
                  </span>
                  <input
                    id="student-phone"
                    value={profile.phone}
                    onChange={(event) => updateField('phone', event.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none focus:border-brand-500 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100"
                  />
                </label>

                <label htmlFor="student-id" className="block">
                  <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
                    Student ID
                  </span>
                  <input
                    id="student-id"
                    value={profile.studentId}
                    onChange={(event) => updateField('studentId', event.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none focus:border-brand-500 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100"
                  />
                </label>
              </div>

              <label htmlFor="student-bio" className="block">
                <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
                  Bio
                </span>
                <textarea
                  id="student-bio"
                  rows="4"
                  value={profile.bio}
                  onChange={(event) => updateField('bio', event.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none focus:border-brand-500 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100"
                />
              </label>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <div className="mb-4 flex items-center gap-2">
              <FaGraduationCap className="text-emerald-600" />
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                Academic information
              </h2>
            </div>

            <div className="space-y-4">
              <label htmlFor="student-institution" className="block">
                <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
                  Institution
                </span>
                <input
                  id="student-institution"
                  value={profile.institution}
                  onChange={(event) => updateField('institution', event.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none focus:border-brand-500 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100"
                />
              </label>

              <label htmlFor="student-program" className="block">
                <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
                  Program
                </span>
                <input
                  id="student-program"
                  value={profile.program}
                  onChange={(event) => updateField('program', event.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none focus:border-brand-500 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100"
                />
              </label>

              <label htmlFor="student-year-of-study" className="block">
                <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
                  Year of study
                </span>
                <input
                  id="student-year-of-study"
                  value={profile.yearOfStudy}
                  onChange={(event) => updateField('yearOfStudy', event.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none focus:border-brand-500 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100"
                />
              </label>
            </div>
          </section>
        </div>

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div className="mb-4 flex items-center gap-2">
            <FaBriefcase className="text-violet-600" />
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
              Skills & experience
            </h2>
          </div>

          <div className="flex flex-wrap gap-2">
            {profile.skills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                <button
                  type="button"
                  onClick={() => removeSkill(skill)}
                  className="text-slate-500 transition hover:text-red-500 dark:text-slate-300"
                  aria-label={`Remove ${skill}`}
                  title={`Remove ${skill}`}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
                <FaCheckCircle className="text-emerald-500" />
                {skill}
              </span>
            ))}
          </div>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <input
              id="new-skill-input"
              type="text"
              value={newSkill}
              onChange={(event) => setNewSkill(event.target.value)}
              placeholder="Add a new skill"
              className="flex-1 rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none focus:border-brand-500 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100"
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  addSkill(newSkill);
                }
              }}
            />
            <button
              type="button"
              onClick={() => addSkill(newSkill)}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-brand-500"
            >
              <FaEdit />
              Add skill
            </button>
          </div>
        </section>
      </div>
    </main>
  );
};

export default StudentProfile;
