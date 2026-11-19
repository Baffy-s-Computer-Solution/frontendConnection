import { useCallback, useEffect, useState } from "react";
import { doc, getDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { CircleAlert, RefreshCw, Save } from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import { db } from "../../config/firebase";

const PROFILE_FIELDS = [
  "fullName",
  "companyName",
  "businessType",
  "industry",
  "website",
  "phone",
  "description",
  "mission",
  "vision",
  "stage",
  "teamSize",
  "fundingStage",
];

const getInitialForm = (profile = {}) =>
  Object.fromEntries(
    PROFILE_FIELDS.map((field) => [field, String(profile[field] ?? "")]),
  );

const getWebsiteError = (value) => {
  if (!value) return "";
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol)
      ? ""
      : "Website must use HTTP or HTTPS.";
  } catch {
    return "Enter a valid website URL, including https://.";
  }
};

export default function EntrepreneurProfile() {
  const {
    currentUser,
    userProfile,
    loading: authLoading,
    updateUserProfile,
  } = useAuth();
  const canManage =
    String(userProfile?.role || userProfile?.userType || "").toLowerCase() ===
    "entrepreneur";
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState(getInitialForm());
  const [lookingForInvestment, setLookingForInvestment] = useState(false);
  const [lookingForMentors, setLookingForMentors] = useState(false);
  const [lookingForPartners, setLookingForPartners] = useState(false);
  const [fundingNeeded, setFundingNeeded] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const loadProfile = useCallback(async () => {
    if (!currentUser?.uid) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");
    try {
      const snapshot = await getDoc(doc(db, "entrepreneurs", currentUser.uid));
      if (!snapshot.exists()) {
        throw new Error("Your entrepreneur profile has not been created yet.");
      }

      const data = { id: snapshot.id, ...snapshot.data() };
      setProfile(data);
      setForm(getInitialForm(data));
      setLookingForInvestment(Boolean(data.lookingForInvestment));
      setLookingForMentors(Boolean(data.lookingForMentors));
      setLookingForPartners(Boolean(data.lookingForPartners));
      setFundingNeeded(
        data.fundingNeeded == null ? "" : String(data.fundingNeeded),
      );
    } catch (loadError) {
      console.error("Unable to load entrepreneur profile:", loadError);
      setError(
        loadError.message ||
          "Your profile could not be loaded. Please try again.",
      );
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

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!currentUser?.uid || !canManage || !profile || saving) return;

    const websiteError = getWebsiteError(form.website.trim());
    if (websiteError) {
      setError(websiteError);
      return;
    }

    const numericFunding =
      fundingNeeded.trim() === "" ? null : Number(fundingNeeded);
    if (
      numericFunding !== null &&
      (!Number.isFinite(numericFunding) || numericFunding < 0)
    ) {
      setError("Enter a non-negative funding amount.");
      return;
    }

    if (
      form.fullName.trim().length > 160 ||
      form.companyName.trim().length > 160
    ) {
      setError("Names must be 160 characters or fewer.");
      return;
    }
    if (
      form.description.length > 3000 ||
      form.mission.length > 1000 ||
      form.vision.length > 1000
    ) {
      setError("Description, mission, or vision exceeds its maximum length.");
      return;
    }

    const updates = {
      ...Object.fromEntries(
        PROFILE_FIELDS.map((field) => [field, form[field].trim()]),
      ),
      fundingNeeded: numericFunding,
      lookingForInvestment,
      lookingForMentors,
      lookingForPartners,
      updatedAt: serverTimestamp(),
    };

    setSaving(true);
    setError("");
    setNotice("");
    try {
      await updateDoc(doc(db, "entrepreneurs", currentUser.uid), updates);
      const savedAt = new Date();
      setProfile((current) => ({ ...current, ...updates, updatedAt: savedAt }));
      updateUserProfile?.({ ...updates, updatedAt: savedAt });
      setNotice("Your entrepreneur profile has been saved.");
    } catch (saveError) {
      console.error("Unable to save entrepreneur profile:", saveError);
      setError("Your profile could not be saved. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <main
        className="mx-auto max-w-5xl animate-pulse space-y-5 px-4 py-8 sm:px-6 lg:px-8"
        aria-label="Loading profile"
      >
        <div className="h-8 w-64 rounded bg-slate-200" />
        <div className="h-96 rounded-2xl bg-slate-200" />
      </main>
    );
  }

  if (!currentUser || !canManage) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <div
          role="alert"
          className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-amber-900"
        >
          You do not have permission to manage this entrepreneur profile.
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
            Entrepreneur workspace
          </p>
          <h1 className="mt-1 text-3xl font-bold text-slate-900">
            Business profile
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Keep your business information current for mentors and funding
            partners.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setRefreshKey((key) => key + 1)}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-600"
        >
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          Reload
        </button>
      </header>

      {error && (
        <div
          role="alert"
          className="mb-5 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800"
        >
          <CircleAlert className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}
      {notice && (
        <p role="status" className="mb-5 text-sm text-emerald-700">
          {notice}
        </p>
      )}

      {profile && (
        <form onSubmit={handleSubmit} className="space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-lg font-semibold text-slate-900">
              Contact and business details
            </h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {[
                ["fullName", "Contact name"],
                ["companyName", "Business name"],
                ["businessType", "Business type"],
                ["industry", "Industry"],
                ["phone", "Phone"],
                ["website", "Website"],
                ["stage", "Business stage"],
                ["teamSize", "Team size"],
                ["fundingStage", "Funding stage"],
              ].map(([field, label]) => (
                <label
                  key={field}
                  className="text-sm font-medium text-slate-700"
                >
                  {label}
                  <input
                    value={form[field]}
                    onChange={(event) =>
                      setForm((value) => ({
                        ...value,
                        [field]: event.target.value,
                      }))
                    }
                    maxLength={field === "website" ? 240 : 160}
                    type={field === "website" ? "url" : "text"}
                    className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
                  />
                </label>
              ))}
              <label className="text-sm font-medium text-slate-700">
                Funding needed (M)
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={fundingNeeded}
                  onChange={(event) => setFundingNeeded(event.target.value)}
                  className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
                />
              </label>
              <label className="text-sm font-medium text-slate-700 md:col-span-2">
                Description
                <textarea
                  rows={4}
                  maxLength={3000}
                  value={form.description}
                  onChange={(event) =>
                    setForm((value) => ({
                      ...value,
                      description: event.target.value,
                    }))
                  }
                  className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
                />
              </label>
              <label className="text-sm font-medium text-slate-700 md:col-span-2">
                Mission
                <textarea
                  rows={2}
                  maxLength={1000}
                  value={form.mission}
                  onChange={(event) =>
                    setForm((value) => ({
                      ...value,
                      mission: event.target.value,
                    }))
                  }
                  className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
                />
              </label>
              <label className="text-sm font-medium text-slate-700 md:col-span-2">
                Vision
                <textarea
                  rows={2}
                  maxLength={1000}
                  value={form.vision}
                  onChange={(event) =>
                    setForm((value) => ({
                      ...value,
                      vision: event.target.value,
                    }))
                  }
                  className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
                />
              </label>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-lg font-semibold text-slate-900">
              What you are looking for
            </h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {[
                ["lookingForInvestment", "Investment"],
                ["lookingForMentors", "Mentorship"],
                ["lookingForPartners", "Business partners"],
              ].map(([field, label]) => {
                const value =
                  field === "lookingForInvestment"
                    ? lookingForInvestment
                    : field === "lookingForMentors"
                      ? lookingForMentors
                      : lookingForPartners;
                const setter =
                  field === "lookingForInvestment"
                    ? setLookingForInvestment
                    : field === "lookingForMentors"
                      ? setLookingForMentors
                      : setLookingForPartners;
                return (
                  <label
                    key={field}
                    className="flex items-center gap-3 rounded-lg border border-slate-200 p-3 text-sm text-slate-700"
                  >
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={(event) => setter(event.target.checked)}
                      className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600"
                    />
                    Looking for {label.toLowerCase()}
                  </label>
                );
              })}
            </div>
          </section>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-600 focus-visible:outline-offset-2"
            >
              <Save className="h-4 w-4" aria-hidden="true" />
              {saving ? "Saving..." : "Save profile"}
            </button>
          </div>
        </form>
      )}
    </main>
  );
}
