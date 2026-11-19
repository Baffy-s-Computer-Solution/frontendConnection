// frontend/src/pages/company/ApplicationDetails.jsx
/**
 * ApplicationDetails
 * ------------------
 * Read-only + action view of a single job application for a company recruiter.
 *
 * OWASP alignment (UI layer):
 *  - A01 Broken Access Control: we never trust route params for authz. The API
 *    must authorize `:id` against the caller's company. UI only gates *buttons*
 *    as a UX nicety, never as the security boundary.
 *  - A03 Injection: all user-controlled strings (name, cover letter, notes) are
 *    rendered as React text children — React escapes them. No
 *    dangerouslySetInnerHTML. URLs from the API are validated against a safe
 *    scheme allowlist before use in <a href>.
 *  - A02 Cryptographic Failures: no tokens, secrets, or PII persisted to
 *    localStorage/sessionStorage here. Auth state comes from useAuth().
 *  - A05 Security Misconfiguration: no inline event handlers constructed from
 *    strings; no eval; no dynamic import of API-provided paths.
 *  - A08 Integrity: all mutations go through the same `useFetch`/API layer that
 *    attaches the session; UI never crafts raw fetch() calls with credentials.
 *  - A09 Logging: user-visible errors are generic; details are not echoed to the
 *    UI (avoids info disclosure). Server logs the real error.
 *  - A10 SSRF: not applicable at UI, but we refuse to render remote iframes or
 *    fetch arbitrary URLs supplied by the application record.
 */
import React, { useMemo, useCallback, useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  CalendarDays,
  CheckCircle2,
  Circle,
  Clock3,
  Download,
  ExternalLink,
  FileText,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  RefreshCw,
  ShieldAlert,
  UserRound,
  XCircle,
} from 'lucide-react';

import { useAuth } from '../../context/AuthContext';
import { apiRequest } from '../../services/apiClient';

/* -------------------------------------------------------------------------- */
/* Small, dependency-free helpers (kept local; no dead exports)               */
/* -------------------------------------------------------------------------- */

const SAFE_URL_SCHEMES = new Set(['http:', 'https:']);

/**
 * Validate an untrusted URL before placing it in an href.
 * Blocks javascript:, data:, vbscript:, and malformed URLs (OWASP A03).
 * @param {unknown} value
 * @returns {string | null} safe absolute URL or null
 */
function toSafeHref(value) {
  if (typeof value !== 'string' || value.length === 0 || value.length > 2048) {
    return null;
  }
  try {
    const url = new URL(value, window.location.origin);
    return SAFE_URL_SCHEMES.has(url.protocol) ? url.toString() : null;
  } catch {
    return null;
  }
}

const STATUS_META = {
  pending: {
    label: 'Pending review',
    Icon: Clock3,
    className: 'bg-amber-50 text-amber-700 ring-amber-200',
  },
  reviewing: {
    label: 'In review',
    Icon: Clock3,
    className: 'bg-sky-50 text-sky-700 ring-sky-200',
  },
  shortlisted: {
    label: 'Shortlisted',
    Icon: CheckCircle2,
    className: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  },
  interview: {
    label: 'Interview',
    Icon: MessageSquare,
    className: 'bg-indigo-50 text-indigo-700 ring-indigo-200',
  },
  rejected: {
    label: 'Rejected',
    Icon: XCircle,
    className: 'bg-rose-50 text-rose-700 ring-rose-200',
  },
  hired: {
    label: 'Hired',
    Icon: CheckCircle2,
    className: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  },
  withdrawn: {
    label: 'Withdrawn',
    Icon: XCircle,
    className: 'bg-slate-100 text-slate-600 ring-slate-200',
  },
};

function StatusBadge({ status }) {
  const meta = STATUS_META[status] ?? {
    label: 'Unknown',
    Icon: Circle,
    className: 'bg-slate-100 text-slate-600 ring-slate-200',
  };
  const { Icon } = meta;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset ${meta.className}`}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {meta.label}
    </span>
  );
}

function InfoRow({ icon: Icon, label, children }) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
      <div className="min-w-0">
        <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
          {label}
        </dt>
        <dd className="mt-0.5 truncate text-sm text-slate-900">{children}</dd>
      </div>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="animate-pulse space-y-6" aria-hidden="true">
      <div className="h-8 w-1/3 rounded bg-slate-200" />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="space-y-3 rounded-xl border border-slate-200 p-6 lg:col-span-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-4 rounded bg-slate-200" />
          ))}
        </div>
        <div className="h-64 rounded-xl border border-slate-200 bg-slate-100" />
      </div>
    </div>
  );
}

function ErrorState({ message, onRetry }) {
  return (
    <div
      role="alert"
      className="flex flex-col items-start gap-4 rounded-xl border border-rose-200 bg-rose-50 p-6 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex items-start gap-3">
        <ShieldAlert className="h-5 w-5 text-rose-600" aria-hidden="true" />
        <div>
          <p className="font-medium text-rose-800">Couldn’t load this application</p>
          <p className="mt-1 text-sm text-rose-700">{message}</p>
        </div>
      </div>
      <button
        type="button"
        onClick={onRetry}
        className="inline-flex items-center gap-2 rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2"
      >
        <RefreshCw className="h-4 w-4" aria-hidden="true" />
        Retry
      </button>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 p-10 text-center">
      <FileText className="mx-auto h-10 w-10 text-slate-300" aria-hidden="true" />
      <p className="mt-3 text-sm font-medium text-slate-700">Application not found</p>
      <p className="mt-1 text-sm text-slate-500">
        It may have been withdrawn or removed by the candidate.
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Page                                                                       */
/* -------------------------------------------------------------------------- */

export default function ApplicationDetails() {
  const { applicationId } = useParams();
  const navigate = useNavigate();
  const { currentUser, userProfile, loading: authLoading } = useAuth();
  const role = String(userProfile?.role || userProfile?.userType || '').toLowerCase();
  const canView = ['company', 'company_admin', 'recruiter'].includes(role);
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  // The API enforces ownership. `enabled` avoids a request for obviously bad ids
  // (defence-in-depth against probing; the server still must authorize).
  const isValidId =
    typeof applicationId === 'string' && /^[A-Za-z0-9_-]{1,64}$/.test(applicationId);

  useEffect(() => {
    if (authLoading || !currentUser || !canView || !isValidId) {
      setLoading(authLoading);
      return undefined;
    }

    const controller = new AbortController();
    setLoading(true);
    setError('');

    apiRequest(`/api/company/applications/${encodeURIComponent(applicationId)}`, {
      signal: controller.signal,
    })
      .then((result) => {
        if (!controller.signal.aborted) {
          setApplication(result);
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setApplication(null);
          setError('Something went wrong while loading. Please try again.');
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, [applicationId, authLoading, canView, currentUser, isValidId, refreshKey]);

  const refetch = useCallback(() => setRefreshKey((key) => key + 1), []);

  const resumeHref = useMemo(
    () => toSafeHref(application?.resumeUrl),
    [application?.resumeUrl],
  );
  const portfolioHref = useMemo(
    () => toSafeHref(application?.portfolioUrl),
    [application?.portfolioUrl],
  );

  const handleBack = useCallback(() => navigate(-1), [navigate]);

  if (authLoading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8" role="status">
        <p className="text-sm text-slate-600">Loading your account…</p>
      </div>
    );
  }

  if (!currentUser || !canView) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900" role="alert">
          You do not have permission to view this application.
        </div>
      </div>
    );
  }

  if (!isValidId) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <ErrorState message="Invalid application reference." onRetry={handleBack} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <nav aria-label="Breadcrumb" className="mb-6">
        <ol className="flex items-center gap-2 text-sm text-slate-500">
          <li>
            <Link to="/company/applications" className="hover:text-slate-700">
              Applications
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="font-medium text-slate-900" aria-current="page">
            {application?.candidateName ?? 'Details'}
          </li>
        </ol>
      </nav>

      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back
          </button>
          <h1 className="text-xl font-semibold text-slate-900">Application details</h1>
        </div>
        {application ? <StatusBadge status={application.status} /> : null}
      </header>

      {loading ? <Skeleton /> : null}
      {!loading && error ? (
        <ErrorState message="Something went wrong while loading. Please try again." onRetry={refetch} />
      ) : null}
      {!loading && !error && !application ? <EmptyState /> : null}

      {!loading && !error && application ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Main column */}
          <section className="space-y-6 lg:col-span-2">
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
                  <UserRound className="h-6 w-6" aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <h2 className="truncate text-lg font-semibold text-slate-900">
                    {application.candidateName ?? 'Unnamed candidate'}
                  </h2>
                  <p className="text-sm text-slate-600">
                    {application.jobTitle ?? 'Unknown role'}
                    {application.companyName ? ` · ${application.companyName}` : null}
                  </p>
                </div>
              </div>

              <dl className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {application.candidateEmail ? (
                  <InfoRow icon={Mail} label="Email">
                    <a
                      href={`mailto:${encodeURIComponent(application.candidateEmail)}`}
                      className="text-indigo-600 hover:underline"
                    >
                      {application.candidateEmail}
                    </a>
                  </InfoRow>
                ) : null}
                {application.candidatePhone ? (
                  <InfoRow icon={Phone} label="Phone">
                    <a
                      href={`tel:${encodeURIComponent(application.candidatePhone)}`}
                      className="text-indigo-600 hover:underline"
                    >
                      {application.candidatePhone}
                    </a>
                  </InfoRow>
                ) : null}
                {application.location ? (
                  <InfoRow icon={MapPin} label="Location">
                    {application.location}
                  </InfoRow>
                ) : null}
                {application.companyName ? (
                  <InfoRow icon={Building2} label="Company">
                    {application.companyName}
                  </InfoRow>
                ) : null}
                {application.appliedAt ? (
                  <InfoRow icon={CalendarDays} label="Applied">
                    {new Date(application.appliedAt).toLocaleString()}
                  </InfoRow>
                ) : null}
              </dl>
            </div>

            {application.coverLetter ? (
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="text-sm font-semibold text-slate-900">Cover letter</h3>
                {/* Rendered as text → React escapes. No dangerouslySetInnerHTML. */}
                <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-slate-700">
                  {application.coverLetter}
                </p>
              </div>
            ) : null}

            {Array.isArray(application.timeline) && application.timeline.length > 0 ? (
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="text-sm font-semibold text-slate-900">Timeline</h3>
                <ol className="mt-4 space-y-4">
                  {application.timeline.map((event, idx) => (
                    <li key={event?.id ?? idx} className="flex gap-3">
                      <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-indigo-500" />
                      <div>
                        <p className="text-sm font-medium text-slate-900">
                          {event?.label ?? 'Update'}
                        </p>
                        {event?.at ? (
                          <p className="text-xs text-slate-500">
                            {new Date(event.at).toLocaleString()}
                          </p>
                        ) : null}
                        {event?.note ? (
                          <p className="mt-1 text-sm text-slate-600">{event.note}</p>
                        ) : null}
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            ) : null}
          </section>

          {/* Sidebar */}
          <aside className="space-y-6">
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-900">Documents</h3>
              <ul className="mt-3 space-y-2 text-sm">
                {resumeHref ? (
                  <li>
                    <a
                      href={resumeHref}
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                      className="inline-flex items-center gap-2 text-indigo-600 hover:underline"
                    >
                      <FileText className="h-4 w-4" aria-hidden="true" />
                      Resume
                      <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                    </a>
                  </li>
                ) : (
                  <li className="text-slate-500">No resume attached</li>
                )}
                {portfolioHref ? (
                  <li>
                    <a
                      href={portfolioHref}
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                      className="inline-flex items-center gap-2 text-indigo-600 hover:underline"
                    >
                      <Download className="h-4 w-4" aria-hidden="true" />
                      Portfolio
                      <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                    </a>
                  </li>
                ) : null}
              </ul>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-500">
              Signed in as <span className="font-medium text-slate-700">{currentUser?.email ?? 'unknown'}</span>
              {role ? ` · ${role}` : null}
            </div>
          </aside>
        </div>
      ) : null}
    </div>
  );
}