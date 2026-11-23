import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  startAfter,
  updateDoc,
  where,
} from "firebase/firestore";
import {
  Bookmark,
  CircleAlert,
  LoaderCircle,
  Search,
  Trash2,
} from "lucide-react";

import { useAuth } from "../../../context/AuthContext";
import { db } from "../../../config/firebase";
import { getCompanyCandidateProfile } from "../../../services/companyCandidateService";

const PAGE_SIZE = 30;

const formatDate = (value) => {
  const date = value?.toDate?.() || (value ? new Date(value) : null);
  return date && !Number.isNaN(date.getTime())
    ? date.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "Date unavailable";
};

const getCandidate = async (savedDoc) => {
  const saved = savedDoc.data();
  let profile = {};
  if (saved.candidateId) {
    profile = await getCompanyCandidateProfile(saved.candidateId);
  }

  return {
    id: savedDoc.id,
    candidateId: saved.candidateId,
    name:
      profile.fullName ||
      profile.displayName ||
      saved.candidateName ||
      "Candidate",
    email: profile.email || saved.candidateEmail || "",
    headline: profile.headline || profile.title || "",
    location: profile.location || "",
    skills: Array.isArray(profile.skills) ? profile.skills.slice(0, 6) : [],
    photoURL: profile.photoURL || profile.profilePhoto || "",
    notes: typeof saved.notes === "string" ? saved.notes : "",
    savedAt: saved.savedAt,
  };
};

export default function TalentPool() {
  const { currentUser, userProfile, loading: authLoading } = useAuth();
  const companyId = userProfile?.companyId || currentUser?.companyId || currentUser?.uid;
  const canManage = ['company', 'company_admin', 'supervisor'].includes(
    String(userProfile?.companyRole || userProfile?.role || userProfile?.userType || '').toLowerCase(),
  );
  const [candidates, setCandidates] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState(null);
  const [savingId, setSavingId] = useState("");
  const [removingId, setRemovingId] = useState("");
  const [draftNotes, setDraftNotes] = useState({});
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const loadPage = useCallback(
    async (cursor = null, append = false) => {
      if (!companyId) {
        setLoading(false);
        return;
      }

      if (append) setLoadingMore(true);
      else setLoading(true);
      setError("");
      try {
        const savedCandidatesQuery = query(
          collection(db, "savedCandidates"),
          where("companyId", "==", companyId),
          orderBy("savedAt", "desc"),
          ...(cursor ? [startAfter(cursor)] : []),
          limit(PAGE_SIZE),
        );
        const snapshot = await getDocs(savedCandidatesQuery);
        const resolved = await Promise.all(snapshot.docs.map(getCandidate));
        setCandidates((current) =>
          append ? [...current, ...resolved] : resolved,
        );
        setNextCursor(
          snapshot.docs.length === PAGE_SIZE
            ? snapshot.docs[snapshot.docs.length - 1]
            : null,
        );
      } catch (loadError) {
        console.error("Unable to load the company talent pool:", loadError);
        setError(
          "Your saved candidates could not be loaded. Please try again.",
        );
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [companyId],
  );

  useEffect(() => {
    if (!authLoading && canManage && currentUser) {
      loadPage();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [authLoading, canManage, currentUser, loadPage, refreshKey]);

  const handleSaveNotes = async (candidate) => {
    if (!currentUser?.uid || savingId) return;
    const notes = (draftNotes[candidate.id] ?? candidate.notes).trim();
    if (notes.length > 2000) {
      setError("Notes must be 2000 characters or fewer.");
      return;
    }

    setSavingId(candidate.id);
    setError("");
    setNotice("");
    try {
      await updateDoc(doc(db, "savedCandidates", candidate.id), {
        notes,
        notesUpdatedAt: serverTimestamp(),
      });
      setCandidates((items) =>
        items.map((item) =>
          item.id === candidate.id ? { ...item, notes } : item,
        ),
      );
      setDraftNotes((current) => {
        const next = { ...current };
        delete next[candidate.id];
        return next;
      });
      setNotice(`Notes saved for ${candidate.name}.`);
    } catch (saveError) {
      console.error("Unable to save talent-pool notes:", saveError);
      setError("Notes could not be saved. Please try again.");
    } finally {
      setSavingId("");
    }
  };

  const handleRemove = async (candidate) => {
    if (!currentUser?.uid || removingId) return;
    if (!window.confirm(`Remove ${candidate.name} from your saved candidates?`))
      return;

    setRemovingId(candidate.id);
    setError("");
    setNotice("");
    try {
      await deleteDoc(doc(db, "savedCandidates", candidate.id));
      setCandidates((items) =>
        items.filter((item) => item.id !== candidate.id),
      );
      setNotice(`${candidate.name} was removed from your talent pool.`);
    } catch (removeError) {
      console.error(
        "Unable to remove a candidate from the talent pool:",
        removeError,
      );
      setError("This candidate could not be removed. Please try again.");
    } finally {
      setRemovingId("");
    }
  };

  const normalizedSearch = search.trim().toLowerCase();
  const visibleCandidates = candidates.filter((candidate) =>
    [
      candidate.name,
      candidate.email,
      candidate.headline,
      candidate.location,
      ...candidate.skills,
    ].some((value) =>
      String(value || "")
        .toLowerCase()
        .includes(normalizedSearch),
    ),
  );

  if (authLoading || loading) {
    return (
      <main
        className="mx-auto max-w-6xl animate-pulse space-y-5 px-4 py-8 sm:px-6 lg:px-8"
        aria-label="Loading talent pool"
      >
        <div className="h-8 w-64 rounded bg-slate-200" />
        <div className="grid gap-4 md:grid-cols-2">
          <div className="h-48 rounded-2xl bg-slate-200" />
          <div className="h-48 rounded-2xl bg-slate-200" />
        </div>
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
          You do not have permission to manage this talent pool.
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
            Company workspace
          </p>
          <h1 className="mt-1 text-3xl font-bold text-slate-900">
            Talent pool
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Candidates you saved while browsing profiles.
          </p>
        </div>
        <Link
          to="/company/browse-candidates"
          className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-600 focus-visible:outline-offset-2"
        >
          Browse candidates
        </Link>
      </header>

      <label className="mb-5 flex max-w-xl items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2.5 focus-within:ring-2 focus-within:ring-indigo-600">
        <Search className="h-4 w-4 text-slate-500" aria-hidden="true" />
        <span className="sr-only">Search saved candidates</span>
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search name, skill, location, or email"
          className="min-w-0 flex-1 border-0 bg-transparent text-sm outline-none"
        />
      </label>

      {error && (
        <div
          role="alert"
          className="mb-5 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800"
        >
          <CircleAlert className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setRefreshKey((key) => key + 1)}
            className="ml-auto font-semibold underline"
          >
            Retry
          </button>
        </div>
      )}
      {notice && (
        <p role="status" className="mb-5 text-sm text-emerald-700">
          {notice}
        </p>
      )}

      {visibleCandidates.length === 0 && !error ? (
        <section className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
          <Bookmark
            className="mx-auto h-10 w-10 text-slate-400"
            aria-hidden="true"
          />
          <h2 className="mt-4 text-lg font-semibold text-slate-900">
            {normalizedSearch
              ? "No matching candidates"
              : "Your talent pool is empty"}
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            {normalizedSearch
              ? "Try another search term."
              : "Save candidates from the directory to keep them here."}
          </p>
          {!normalizedSearch && (
            <Link
              to="/company/browse-candidates"
              className="mt-5 inline-flex rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              Browse candidates
            </Link>
          )}
        </section>
      ) : visibleCandidates.length > 0 ? (
        <section
          aria-label="Saved candidates"
          className="grid gap-4 md:grid-cols-2"
        >
          {visibleCandidates.map((candidate) => (
            <article
              key={candidate.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start gap-4">
                {candidate.photoURL ? (
                  <img
                    src={candidate.photoURL}
                    alt=""
                    className="h-12 w-12 rounded-full object-cover"
                  />
                ) : (
                  <div
                    aria-hidden="true"
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-indigo-100 font-semibold text-indigo-700"
                  >
                    {candidate.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <h2 className="truncate text-lg font-semibold text-slate-900">
                    {candidate.name}
                  </h2>
                  {candidate.headline && (
                    <p className="mt-1 text-sm text-slate-600">
                      {candidate.headline}
                    </p>
                  )}
                  {candidate.email && (
                    <a
                      href={`mailto:${candidate.email}`}
                      className="mt-1 block truncate text-sm text-indigo-700 hover:underline"
                    >
                      {candidate.email}
                    </a>
                  )}
                  {candidate.location && (
                    <p className="mt-1 text-sm text-slate-500">
                      {candidate.location}
                    </p>
                  )}
                  <p className="mt-2 text-xs text-slate-500">
                    Saved {formatDate(candidate.savedAt)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemove(candidate)}
                  disabled={removingId === candidate.id}
                  aria-label={`Remove ${candidate.name}`}
                  className="rounded-lg p-2 text-rose-600 hover:bg-rose-50 disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-rose-600"
                >
                  {removingId === candidate.id ? (
                    <LoaderCircle
                      className="h-4 w-4 animate-spin"
                      aria-hidden="true"
                    />
                  ) : (
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  )}
                </button>
              </div>
              {candidate.skills.length > 0 && (
                <ul
                  aria-label={`${candidate.name} skills`}
                  className="mt-4 flex flex-wrap gap-2"
                >
                  {candidate.skills.map((skill) => (
                    <li
                      key={skill}
                      className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-700"
                    >
                      {skill}
                    </li>
                  ))}
                </ul>
              )}
              <label className="mt-4 block text-sm font-medium text-slate-700">
                Private notes
                <textarea
                  rows={3}
                  maxLength={2000}
                  value={draftNotes[candidate.id] ?? candidate.notes}
                  onChange={(event) =>
                    setDraftNotes((current) => ({
                      ...current,
                      [candidate.id]: event.target.value,
                    }))
                  }
                  className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
                />
              </label>
              {draftNotes[candidate.id] !== undefined &&
                draftNotes[candidate.id] !== candidate.notes && (
                  <div className="mt-3 flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleSaveNotes(candidate)}
                      disabled={savingId === candidate.id}
                      className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
                    >
                      {savingId === candidate.id ? "Saving..." : "Save notes"}
                    </button>
                  </div>
                )}
            </article>
          ))}
        </section>
      ) : null}

      {nextCursor && (
        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={() => loadPage(nextCursor, true)}
            disabled={loadingMore}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            {loadingMore ? "Loading..." : "Load more candidates"}
          </button>
        </div>
      )}
    </main>
  );
}
