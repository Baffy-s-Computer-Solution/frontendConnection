import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Award,
  BadgeCheck,
  Briefcase,
  CalendarDays,
  Camera,
  CheckCircle,
  Clock,
  ExternalLink,
  Github,
  Globe,
  GraduationCap,
  Languages,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  Plus,
  Save,
  Star,
  Trash2,
  Twitter,
  User,
  Users,
  X,
} from "lucide-react";

import { mentorService } from "../../services/mentorService";
import { useAuth } from "../../hooks/useAuth";

const PROFILE_TABS = [
  { id: "overview", label: "Overview", icon: User },
  { id: "expertise", label: "Expertise", icon: Star },
  { id: "experience", label: "Experience", icon: Briefcase },
  { id: "education", label: "Education", icon: GraduationCap },
  { id: "certifications", label: "Certifications", icon: Award },
];

const inputClass =
  "mt-1 block w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100";
const heroInputClass =
  "mt-1 block w-full rounded-xl border border-white/20 bg-white/10 px-3 py-2.5 text-sm text-white outline-none transition placeholder:text-white/60 focus:border-white/50 focus:ring-2 focus:ring-white/20";
const primaryButtonClass =
  "inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-brand-600 bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:border-brand-700 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500/40 disabled:cursor-not-allowed disabled:opacity-60";
const secondaryButtonClass =
  "inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-brand-500/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800";

const normalizeProfile = (data = {}) => ({
  ...data,
  fullName: data.fullName || "",
  title: data.title || "",
  bio: data.bio || "",
  email: data.email || "",
  phone: data.phone || "",
  location: data.location || "",
  languages: Array.isArray(data.languages) ? data.languages : [],
  expertise: Array.isArray(data.expertise) ? data.expertise : [],
  industries: Array.isArray(data.industries) ? data.industries : [],
  workExperience: Array.isArray(data.workExperience) ? data.workExperience : [],
  education: Array.isArray(data.education) ? data.education : [],
  certifications: Array.isArray(data.certifications) ? data.certifications : [],
  socialLinks: {
    website: "",
    linkedin: "",
    twitter: "",
    github: "",
    ...(data.socialLinks || {}),
  },
});

const getInitials = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("") || "M";

const getMemberSince = (createdAt) => {
  if (!createdAt) return "—";
  const date =
    typeof createdAt.toDate === "function"
      ? createdAt.toDate()
      : new Date(createdAt);
  return Number.isNaN(date.getTime()) ? "—" : date.getFullYear();
};

const SectionHeading = ({ icon: Icon, title, description }) => (
  <div className="mb-5 flex items-start gap-3">
    <span className="dashboard-icon mt-0.5">
      <Icon size={19} aria-hidden="true" />
    </span>
    <div>
      <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
        {title}
      </h2>
      {description && (
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {description}
        </p>
      )}
    </div>
  </div>
);

const EmptyState = ({ children }) => (
  <p className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-400">
    {children}
  </p>
);

const MentorProfile = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoLoadFailed, setPhotoLoadFailed] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [notice, setNotice] = useState(null);
  const [newItems, setNewItems] = useState({ expertise: "", industries: "" });

  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.uid) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setNotice(null);
        const result = await mentorService.getMentorProfile(user.uid);
        if (!result?.success || !result.data) {
          setProfile(null);
          setNotice({
            type: "error",
            message: result?.error || "Your mentor profile could not be found.",
          });
          return;
        }

        const profileData = normalizeProfile({
          ...result.data,
          fullName: result.data.fullName || user.displayName || "",
          email: result.data.email || user.email || "",
        });
        setProfile(profileData);
        setEditForm(profileData);
        setPhotoLoadFailed(false);
      } catch (error) {
        console.error("Error loading mentor profile:", error);
        setNotice({
          type: "error",
          message:
            error instanceof Error
              ? error.message
              : "Unable to load your profile.",
        });
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user?.uid]);

  const handlePhotoUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file || !user?.uid) return;

    try {
      setUploadingPhoto(true);
      setNotice(null);
      const result = await mentorService.uploadProfilePhoto(user.uid, file);
      if (!result?.success || !result.photoUrl) {
        throw new Error("The profile photo could not be uploaded.");
      }

      setProfile((current) =>
        normalizeProfile({
          ...current,
          profilePhoto: result.photoUrl,
          photoURL: result.photoUrl,
        }),
      );
      setEditForm((current) =>
        normalizeProfile({
          ...current,
          profilePhoto: result.photoUrl,
          photoURL: result.photoUrl,
        }),
      );
      setPhotoLoadFailed(false);
      setNotice({
        type: "success",
        message: "Your profile photo has been updated.",
      });
    } catch (error) {
      console.error("Error uploading profile photo:", error);
      setNotice({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Unable to upload your profile photo.",
      });
    } finally {
      setUploadingPhoto(false);
      event.target.value = "";
    }
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setEditForm((current) => ({ ...current, [name]: value }));
  };

  const handleArrayAdd = (field, item) => {
    const value = item.trim();
    if (!value) return;

    setEditForm((current) => ({
      ...current,
      [field]: [...(current[field] || []), value],
    }));
    setNewItems((current) => ({ ...current, [field]: "" }));
  };

  const handleArrayRemove = (field, index) => {
    setEditForm((current) => ({
      ...current,
      [field]: (current[field] || []).filter(
        (_, itemIndex) => itemIndex !== index,
      ),
    }));
  };

  const handleObjectAdd = (field, item) => {
    setEditForm((current) => ({
      ...current,
      [field]: [...(current[field] || []), item],
    }));
  };

  const handleObjectChange = (field, index, key, value) => {
    setEditForm((current) => ({
      ...current,
      [field]: (current[field] || []).map((item, itemIndex) =>
        itemIndex === index ? { ...item, [key]: value } : item,
      ),
    }));
  };

  const handleSave = async () => {
    if (!user?.uid) return;

    try {
      setSaving(true);
      setNotice(null);
      const result = await mentorService.updateMentorProfile(
        user.uid,
        editForm,
      );
      if (!result?.success || !result.data) {
        throw new Error("Your profile could not be saved. Please try again.");
      }

      const savedProfile = normalizeProfile(result.data);
      setProfile(savedProfile);
      setEditForm(savedProfile);
      setIsEditing(false);
      setNotice({ type: "success", message: "Your profile has been saved." });
    } catch (error) {
      console.error("Error saving mentor profile:", error);
      setNotice({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Unable to save your profile.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditForm(normalizeProfile(profile));
    setNewItems({ expertise: "", industries: "" });
    setIsEditing(false);
    setNotice(null);
  };

  const handleSocialLinkChange = (field, value) => {
    setEditForm((current) => ({
      ...current,
      socialLinks: { ...current.socialLinks, [field]: value },
    }));
  };

  if (loading) {
    return (
      <div className="dashboard-page flex min-h-80 flex-col items-center justify-center gap-4">
        <div
          className="h-10 w-10 animate-spin rounded-full border-4 border-brand-100 border-t-brand-600 dark:border-brand-950 dark:border-t-brand-400"
          role="status"
          aria-label="Loading profile"
        />
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
          Loading your profile…
        </p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="dashboard-page space-y-5">
        <header>
          <p className="dashboard-eyebrow">Your presence, professionally</p>
          <h1 className="dashboard-title">Mentor profile</h1>
          <p className="dashboard-subtitle">
            Manage the details students see when they discover you.
          </p>
        </header>
        {notice && (
          <div
            role="alert"
            className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-800 dark:border-rose-900/70 dark:bg-rose-950/30 dark:text-rose-200"
          >
            {notice.message}
          </div>
        )}
      </div>
    );
  }

  const displayName = profile.fullName || user?.displayName || "Mentor";
  const photoUrl =
    [profile.profilePhoto, profile.photoURL, user?.photoURL].find(
      (value) => typeof value === "string" && value.trim(),
    ) || "";
  const rating =
    profile.rating === null ||
    profile.rating === undefined ||
    profile.rating === ""
      ? null
      : Number(profile.rating);
  const socialFields = [
    { field: "website", label: "Website", icon: Globe },
    { field: "linkedin", label: "LinkedIn", icon: Linkedin },
    { field: "twitter", label: "Twitter", icon: Twitter },
    { field: "github", label: "GitHub", icon: Github },
  ];
  const contactFields = [
    {
      field: "email",
      label: "Email address",
      icon: Mail,
      type: "email",
      value: profile.email || user?.email || "",
    },
    {
      field: "phone",
      label: "Phone number",
      icon: Phone,
      type: "tel",
      value: profile.phone,
    },
    {
      field: "location",
      label: "Location",
      icon: MapPin,
      type: "text",
      value: profile.location,
    },
  ];

  return (
    <div className="dashboard-page space-y-6">
      <motion.section
        className="dashboard-hero !p-0"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        aria-labelledby="mentor-profile-title"
      >
        <div className="relative z-10 p-5 sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex min-w-0 items-center gap-4 sm:gap-6">
              <div className="relative h-20 w-20 shrink-0 sm:h-28 sm:w-28">
                {photoUrl && !photoLoadFailed ? (
                  <img
                    src={photoUrl}
                    alt={`${displayName}'s profile`}
                    className="h-full w-full rounded-3xl border-4 border-white/20 object-cover shadow-lg"
                    onError={() => setPhotoLoadFailed(true)}
                  />
                ) : (
                  <div
                    role="img"
                    aria-label={`${displayName}'s profile initials`}
                    className="flex h-full w-full items-center justify-center rounded-3xl border-4 border-white/20 bg-white/15 text-2xl font-bold text-white shadow-lg sm:text-3xl"
                  >
                    {getInitials(displayName)}
                  </div>
                )}
                {isEditing && (
                  <label
                    htmlFor="mentor-profile-photo"
                    className="absolute -bottom-2 -right-2 flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-white/30 !bg-white text-brand-700 shadow-lg transition hover:scale-105"
                    title="Upload a profile photo"
                  >
                    {uploadingPhoto ? (
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-brand-200 border-t-brand-700" />
                    ) : (
                      <Camera size={18} aria-hidden="true" />
                    )}
                    <span className="sr-only">Upload profile photo</span>
                    <input
                      id="mentor-profile-photo"
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      disabled={uploadingPhoto}
                      className="sr-only"
                    />
                  </label>
                )}
              </div>

              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-100">
                  Mentor profile
                </p>
                {isEditing ? (
                  <label className="sr-only" htmlFor="mentor-full-name">
                    Full name
                  </label>
                ) : null}
                {isEditing ? (
                  <input
                    id="mentor-full-name"
                    type="text"
                    name="fullName"
                    value={editForm.fullName || ""}
                    onChange={handleInputChange}
                    placeholder="Full name"
                    className={`${heroInputClass} max-w-xl text-xl font-bold sm:text-2xl`}
                  />
                ) : (
                  <h1
                    id="mentor-profile-title"
                    className="mt-1 truncate text-2xl font-bold tracking-tight text-white sm:text-3xl"
                  >
                    {displayName}
                  </h1>
                )}
                {isEditing ? (
                  <label className="sr-only" htmlFor="mentor-title">
                    Professional title
                  </label>
                ) : null}
                {isEditing ? (
                  <input
                    id="mentor-title"
                    type="text"
                    name="title"
                    value={editForm.title || ""}
                    onChange={handleInputChange}
                    placeholder="Professional title"
                    className={`${heroInputClass} max-w-xl`}
                  />
                ) : (
                  <p className="mt-1 truncate text-sm font-medium text-brand-100 sm:text-base">
                    {profile.title || "Add your professional title"}
                  </p>
                )}
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {profile.isVerified && (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200/30 bg-emerald-300/15 px-3 py-1 text-xs font-semibold text-emerald-100">
                      <BadgeCheck size={14} aria-hidden="true" />
                      Verified mentor
                    </span>
                  )}
                  {rating !== null && Number.isFinite(rating) ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold text-white">
                      <Star
                        size={14}
                        className="fill-amber-300 text-amber-300"
                        aria-hidden="true"
                      />
                      {rating.toFixed(1)}
                      <span className="font-normal text-brand-100">
                        · {profile.totalReviews ?? "—"} reviews
                      </span>
                    </span>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="flex shrink-0 flex-wrap gap-2 xl:justify-end">
              {!isEditing ? (
                <button
                  type="button"
                  className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/40"
                  onClick={() => {
                    setEditForm(normalizeProfile(profile));
                    setIsEditing(true);
                    setNotice(null);
                  }}
                >
                  <User size={17} aria-hidden="true" />
                  Edit profile
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl !bg-white px-4 py-2 text-sm font-semibold text-brand-800 shadow-sm transition hover:bg-brand-50 focus:outline-none focus:ring-2 focus:ring-white/50 disabled:cursor-not-allowed disabled:opacity-60"
                    onClick={handleSave}
                    disabled={saving || uploadingPhoto}
                  >
                    <Save size={16} aria-hidden="true" />
                    {saving ? "Saving…" : "Save changes"}
                  </button>
                  <button
                    type="button"
                    className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/40"
                    onClick={handleCancel}
                    disabled={saving}
                  >
                    <X size={16} aria-hidden="true" />
                    Cancel
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="mt-7 grid gap-3 border-t border-white/15 pt-5 sm:grid-cols-3">
            {[
              {
                label: "Sessions delivered",
                value: profile.totalSessions ?? "—",
                icon: CalendarDays,
              },
              {
                label: "Students supported",
                value: profile.totalStudents ?? "—",
                icon: Users,
              },
              {
                label: "Member since",
                value: getMemberSince(profile.createdAt),
                icon: Clock,
              },
            ].map(({ label, value, icon: Icon }) => (
              <div
                key={label}
                className="flex items-center gap-3 rounded-xl bg-white/10 px-4 py-3"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-brand-100">
                  <Icon size={19} aria-hidden="true" />
                </span>
                <div>
                  <p className="text-lg font-semibold leading-5 text-white">
                    {value}
                  </p>
                  <p className="mt-1 text-xs font-medium text-brand-100">
                    {label}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {notice && (
        <div
          role={notice.type === "error" ? "alert" : "status"}
          className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm ${
            notice.type === "error"
              ? "border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900/70 dark:bg-rose-950/30 dark:text-rose-200"
              : "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/70 dark:bg-emerald-950/30 dark:text-emerald-200"
          }`}
        >
          {notice.type === "error" ? (
            <X size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
          ) : (
            <CheckCircle
              size={18}
              className="mt-0.5 shrink-0"
              aria-hidden="true"
            />
          )}
          <p className="flex-1">{notice.message}</p>
          <button
            type="button"
            className="rounded-md p-1 opacity-70 transition hover:opacity-100"
            onClick={() => setNotice(null)}
            aria-label="Dismiss message"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>
      )}

      <nav
        className="overflow-x-auto rounded-2xl border border-slate-200/80 bg-white shadow-card dark:border-slate-800 dark:bg-slate-900"
        aria-label="Profile sections"
      >
        <div className="flex min-w-max gap-1 p-2" role="tablist">
          {PROFILE_TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              role="tab"
              id={`profile-tab-${id}`}
              aria-selected={activeTab === id}
              aria-controls={`profile-panel-${id}`}
              onClick={() => setActiveTab(id)}
              className={`inline-flex min-h-10 items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-brand-500/30 ${
                activeTab === id
                  ? "bg-brand-600 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100 hover:text-brand-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-brand-300"
              }`}
            >
              <Icon size={16} aria-hidden="true" />
              {label}
            </button>
          ))}
        </div>
      </nav>

      <motion.div
        id={`profile-panel-${activeTab}`}
        role="tabpanel"
        aria-labelledby={`profile-tab-${activeTab}`}
        key={activeTab}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        {activeTab === "overview" && (
          <div className="grid gap-5 xl:grid-cols-[minmax(0,1.3fr)_minmax(18rem,0.9fr)]">
            <div className="space-y-5">
              <section className="dashboard-card">
                <SectionHeading
                  icon={User}
                  title="About me"
                  description="A short introduction helps students get to know you."
                />
                {isEditing ? (
                  <textarea
                    name="bio"
                    value={editForm.bio || ""}
                    onChange={handleInputChange}
                    placeholder="Share your background, approach, and what you enjoy helping people achieve."
                    rows={6}
                    className={`${inputClass} resize-y leading-6`}
                  />
                ) : (
                  <p className="whitespace-pre-wrap text-sm leading-7 text-slate-600 dark:text-slate-300">
                    {profile.bio ||
                      "Add a short introduction to tell students about your background and mentoring approach."}
                  </p>
                )}
              </section>

              <section className="dashboard-card">
                <SectionHeading
                  icon={Globe}
                  title="Social links"
                  description="Share your professional presence and portfolio."
                />
                <div className="grid gap-3 sm:grid-cols-2">
                  {socialFields.map(({ field, label, icon: Icon }) => {
                    const value = editForm.socialLinks?.[field] || "";
                    const savedValue = profile.socialLinks?.[field] || "";
                    return (
                      <div
                        key={field}
                        className="flex min-w-0 items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950/60"
                      >
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-brand-600 shadow-sm dark:bg-slate-900 dark:text-brand-300">
                          <Icon size={17} aria-hidden="true" />
                        </span>
                        <div className="min-w-0 flex-1">
                          {isEditing ? (
                            <>
                              <label
                                htmlFor={`social-${field}`}
                                className="sr-only"
                              >
                                {label}
                              </label>
                              <input
                                id={`social-${field}`}
                                type="url"
                                value={value}
                                onChange={(event) =>
                                  handleSocialLinkChange(
                                    field,
                                    event.target.value,
                                  )
                                }
                                placeholder={`${label} URL`}
                                className="w-full border-0 bg-transparent p-0 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:ring-0 dark:text-slate-100"
                              />
                            </>
                          ) : (
                            <>
                              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                                {label}
                              </p>
                              {savedValue ? (
                                <a
                                  href={savedValue}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="mt-0.5 inline-flex max-w-full items-center gap-1 truncate text-sm font-medium text-brand-700 hover:underline dark:text-brand-300"
                                >
                                  <span className="truncate">{savedValue}</span>
                                  <ExternalLink
                                    size={13}
                                    className="shrink-0"
                                    aria-hidden="true"
                                  />
                                </a>
                              ) : (
                                <p className="mt-0.5 text-sm text-slate-400">
                                  Not provided
                                </p>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            </div>

            <section className="dashboard-card">
              <SectionHeading
                icon={Mail}
                title="Contact information"
                description="Keep your contact details up to date."
              />
              <div className="space-y-4">
                {contactFields.map(
                  ({ field, label, icon: Icon, type, value }) => (
                    <div key={field} className="flex items-start gap-3">
                      <span className="dashboard-icon h-9 w-9 rounded-lg">
                        <Icon size={17} aria-hidden="true" />
                      </span>
                      <div className="min-w-0 flex-1">
                        {isEditing ? (
                          <>
                            <label
                              htmlFor={`contact-${field}`}
                              className="text-xs font-medium text-slate-500 dark:text-slate-400"
                            >
                              {label}
                            </label>
                            <input
                              id={`contact-${field}`}
                              type={type}
                              name={field}
                              value={editForm[field] ?? value}
                              onChange={handleInputChange}
                              placeholder={label}
                              className={inputClass}
                            />
                          </>
                        ) : (
                          <>
                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                              {label}
                            </p>
                            <p className="mt-1 break-words text-sm font-medium text-slate-800 dark:text-slate-200">
                              {value || "Not provided"}
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                  ),
                )}

                <div className="flex items-start gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
                  <span className="dashboard-icon h-9 w-9 rounded-lg">
                    <Languages size={17} aria-hidden="true" />
                  </span>
                  <div className="min-w-0 flex-1">
                    {isEditing ? (
                      <>
                        <label
                          htmlFor="mentor-languages"
                          className="text-xs font-medium text-slate-500 dark:text-slate-400"
                        >
                          Languages
                        </label>
                        <input
                          id="mentor-languages"
                          type="text"
                          value={(editForm.languages || []).join(", ")}
                          onChange={(event) =>
                            setEditForm((current) => ({
                              ...current,
                              languages: event.target.value
                                .split(",")
                                .map((language) => language.trim())
                                .filter(Boolean),
                            }))
                          }
                          placeholder="English, Sesotho"
                          className={inputClass}
                        />
                      </>
                    ) : (
                      <>
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                          Languages
                        </p>
                        <p className="mt-1 text-sm font-medium text-slate-800 dark:text-slate-200">
                          {profile.languages.join(", ") || "Not provided"}
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}

        {activeTab === "expertise" && (
          <div className="grid gap-5 lg:grid-cols-2">
            {[
              {
                field: "expertise",
                title: "Areas of expertise",
                description: "Topics you can help students explore.",
                icon: Star,
              },
              {
                field: "industries",
                title: "Industries",
                description: "Fields where you have practical experience.",
                icon: Briefcase,
              },
            ].map(({ field, title, description, icon: Icon }) => {
              const items = isEditing
                ? editForm[field] || []
                : profile[field] || [];
              return (
                <section key={field} className="dashboard-card">
                  <SectionHeading
                    icon={Icon}
                    title={title}
                    description={description}
                  />
                  {items.length ? (
                    <div className="flex flex-wrap gap-2">
                      {items.map((item, index) => (
                        <span
                          key={`${item}-${index}`}
                          className="inline-flex items-center gap-2 rounded-full border border-brand-100 bg-brand-50 px-3 py-2 text-sm font-medium text-brand-800 dark:border-brand-900/70 dark:bg-brand-950/50 dark:text-brand-200"
                        >
                          {item}
                          {isEditing && (
                            <button
                              type="button"
                              onClick={() => handleArrayRemove(field, index)}
                              className="rounded-full p-0.5 text-brand-500 transition hover:bg-brand-100 hover:text-rose-600 dark:hover:bg-brand-900"
                              aria-label={`Remove ${item}`}
                            >
                              <X size={14} aria-hidden="true" />
                            </button>
                          )}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <EmptyState>
                      {isEditing
                        ? `Add your ${title.toLowerCase()} below.`
                        : `No ${title.toLowerCase()} added yet.`}
                    </EmptyState>
                  )}
                  {isEditing && (
                    <form
                      className="mt-5 flex gap-2"
                      onSubmit={(event) => {
                        event.preventDefault();
                        handleArrayAdd(field, newItems[field] || "");
                      }}
                    >
                      <label htmlFor={`add-${field}`} className="sr-only">
                        Add {title}
                      </label>
                      <input
                        id={`add-${field}`}
                        type="text"
                        value={newItems[field] || ""}
                        onChange={(event) =>
                          setNewItems((current) => ({
                            ...current,
                            [field]: event.target.value,
                          }))
                        }
                        placeholder={`Add ${field === "expertise" ? "an expertise" : "an industry"}`}
                        className={inputClass.replace("mt-1 ", "")}
                      />
                      <button
                        type="submit"
                        className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white transition hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
                        aria-label={`Add ${title}`}
                      >
                        <Plus size={18} aria-hidden="true" />
                      </button>
                    </form>
                  )}
                </section>
              );
            })}
          </div>
        )}

        {activeTab === "experience" && (
          <section className="dashboard-card">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <SectionHeading
                icon={Briefcase}
                title="Work experience"
                description="Highlight the experience that informs your mentoring."
              />
              {isEditing && (
                <button
                  type="button"
                  className={secondaryButtonClass}
                  onClick={() =>
                    handleObjectAdd("workExperience", {
                      position: "",
                      company: "",
                      startDate: "",
                      endDate: "",
                      description: "",
                    })
                  }
                >
                  <Plus size={16} aria-hidden="true" />
                  Add experience
                </button>
              )}
            </div>
            {editForm.workExperience.length === 0 && !isEditing ? (
              <EmptyState>
                Your professional experience will appear here.
              </EmptyState>
            ) : (
              <div className="space-y-4">
                {(isEditing
                  ? editForm.workExperience
                  : profile.workExperience
                ).map((experience, index) => (
                  <article
                    key={`${experience.position || "experience"}-${index}`}
                    className="relative rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/60 sm:p-5"
                  >
                    {isEditing ? (
                      <div className="grid gap-3 sm:grid-cols-2">
                        {[
                          ["position", "Role or position"],
                          ["company", "Company or organization"],
                          ["startDate", "Start date"],
                          ["endDate", "End date or Present"],
                        ].map(([field, label]) => (
                          <label
                            key={field}
                            className="text-xs font-medium text-slate-500 dark:text-slate-400"
                          >
                            {label}
                            <input
                              value={experience[field] || ""}
                              onChange={(event) =>
                                handleObjectChange(
                                  "workExperience",
                                  index,
                                  field,
                                  event.target.value,
                                )
                              }
                              placeholder={label}
                              className={inputClass}
                            />
                          </label>
                        ))}
                        <label className="text-xs font-medium text-slate-500 dark:text-slate-400 sm:col-span-2">
                          Description
                          <textarea
                            value={experience.description || ""}
                            onChange={(event) =>
                              handleObjectChange(
                                "workExperience",
                                index,
                                "description",
                                event.target.value,
                              )
                            }
                            placeholder="Describe your responsibilities and impact."
                            rows={3}
                            className={`${inputClass} resize-y`}
                          />
                        </label>
                        <button
                          type="button"
                          className="inline-flex w-fit items-center gap-2 rounded-lg px-2 py-1 text-sm font-medium text-rose-600 transition hover:bg-rose-50 dark:text-rose-300 dark:hover:bg-rose-950/40 sm:col-span-2"
                          onClick={() =>
                            handleArrayRemove("workExperience", index)
                          }
                        >
                          <Trash2 size={15} aria-hidden="true" />
                          Remove experience
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-start gap-3">
                          <span className="dashboard-icon">
                            <Briefcase size={19} aria-hidden="true" />
                          </span>
                          <div className="min-w-0 flex-1">
                            <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                              {experience.position || "Position"}
                            </h3>
                            <p className="mt-1 text-sm font-medium text-brand-700 dark:text-brand-300">
                              {experience.company || "Organization"}
                            </p>
                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                              {[
                                experience.startDate,
                                experience.endDate ||
                                  (experience.startDate ? "Present" : ""),
                              ]
                                .filter(Boolean)
                                .join(" – ") || "Dates not provided"}
                            </p>
                          </div>
                        </div>
                        {experience.description && (
                          <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-slate-600 dark:text-slate-300">
                            {experience.description}
                          </p>
                        )}
                      </>
                    )}
                  </article>
                ))}
              </div>
            )}
          </section>
        )}

        {activeTab === "education" && (
          <section className="dashboard-card">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <SectionHeading
                icon={GraduationCap}
                title="Education"
                description="Add the qualifications that support your expertise."
              />
              {isEditing && (
                <button
                  type="button"
                  className={secondaryButtonClass}
                  onClick={() =>
                    handleObjectAdd("education", {
                      degree: "",
                      institution: "",
                      year: "",
                    })
                  }
                >
                  <Plus size={16} aria-hidden="true" />
                  Add education
                </button>
              )}
            </div>
            {editForm.education.length === 0 && !isEditing ? (
              <EmptyState>Your education details will appear here.</EmptyState>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {(isEditing ? editForm.education : profile.education).map(
                  (education, index) => (
                    <article
                      key={`${education.degree || "education"}-${index}`}
                      className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/60"
                    >
                      <span className="dashboard-icon">
                        <GraduationCap size={19} aria-hidden="true" />
                      </span>
                      {isEditing ? (
                        <div className="min-w-0 flex-1 space-y-2">
                          {[
                            ["degree", "Degree or qualification"],
                            ["institution", "Institution"],
                            ["year", "Year"],
                          ].map(([field, label]) => (
                            <label
                              key={field}
                              className="block text-xs font-medium text-slate-500 dark:text-slate-400"
                            >
                              {label}
                              <input
                                value={education[field] || ""}
                                onChange={(event) =>
                                  handleObjectChange(
                                    "education",
                                    index,
                                    field,
                                    event.target.value,
                                  )
                                }
                                placeholder={label}
                                className={inputClass}
                              />
                            </label>
                          ))}
                          <button
                            type="button"
                            className="inline-flex items-center gap-2 rounded-lg px-2 py-1 text-sm font-medium text-rose-600 transition hover:bg-rose-50 dark:text-rose-300 dark:hover:bg-rose-950/40"
                            onClick={() =>
                              handleArrayRemove("education", index)
                            }
                          >
                            <Trash2 size={15} aria-hidden="true" />
                            Remove
                          </button>
                        </div>
                      ) : (
                        <div className="min-w-0">
                          <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                            {education.degree || "Qualification"}
                          </h3>
                          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                            {education.institution ||
                              "Institution not provided"}
                          </p>
                          {education.year && (
                            <p className="mt-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                              {education.year}
                            </p>
                          )}
                        </div>
                      )}
                    </article>
                  ),
                )}
              </div>
            )}
          </section>
        )}

        {activeTab === "certifications" && (
          <section className="dashboard-card">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <SectionHeading
                icon={Award}
                title="Certifications"
                description="Showcase credentials, certificates, and professional training."
              />
              {isEditing && (
                <button
                  type="button"
                  className={secondaryButtonClass}
                  onClick={() =>
                    handleObjectAdd("certifications", {
                      name: "",
                      issuer: "",
                      year: "",
                      fileUrl: "",
                    })
                  }
                >
                  <Plus size={16} aria-hidden="true" />
                  Add certification
                </button>
              )}
            </div>
            {editForm.certifications.length === 0 && !isEditing ? (
              <EmptyState>Your certifications will appear here.</EmptyState>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {(isEditing
                  ? editForm.certifications
                  : profile.certifications
                ).map((certification, index) => (
                  <article
                    key={`${certification.name || "certification"}-${index}`}
                    className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/60"
                  >
                    <span className="dashboard-icon">
                      <Award size={19} aria-hidden="true" />
                    </span>
                    {isEditing ? (
                      <div className="min-w-0 flex-1 space-y-2">
                        {[
                          ["name", "Certification name"],
                          ["issuer", "Issuing organization"],
                          ["year", "Year issued"],
                          ["fileUrl", "Certificate URL (optional)"],
                        ].map(([field, label]) => (
                          <label
                            key={field}
                            className="block text-xs font-medium text-slate-500 dark:text-slate-400"
                          >
                            {label}
                            <input
                              value={certification[field] || ""}
                              onChange={(event) =>
                                handleObjectChange(
                                  "certifications",
                                  index,
                                  field,
                                  event.target.value,
                                )
                              }
                              placeholder={label}
                              className={inputClass}
                            />
                          </label>
                        ))}
                        <button
                          type="button"
                          className="inline-flex items-center gap-2 rounded-lg px-2 py-1 text-sm font-medium text-rose-600 transition hover:bg-rose-50 dark:text-rose-300 dark:hover:bg-rose-950/40"
                          onClick={() =>
                            handleArrayRemove("certifications", index)
                          }
                        >
                          <Trash2 size={15} aria-hidden="true" />
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                          {certification.name || "Certification"}
                        </h3>
                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                          {certification.issuer ||
                            "Issuing organization not provided"}
                        </p>
                        {certification.year && (
                          <p className="mt-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                            Issued {certification.year}
                          </p>
                        )}
                        {certification.fileUrl && (
                          <a
                            href={certification.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-brand-700 hover:underline dark:text-brand-300"
                          >
                            View credential
                            <ExternalLink size={14} aria-hidden="true" />
                          </a>
                        )}
                      </div>
                    )}
                  </article>
                ))}
              </div>
            )}
          </section>
        )}
      </motion.div>
    </div>
  );
};

export default MentorProfile;
