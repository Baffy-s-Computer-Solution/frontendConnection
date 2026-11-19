import { useCallback, useEffect, useState } from "react";
import { CircleAlert, RefreshCw, TrendingUp } from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import {
  getBusinessIdeas,
  getFundingApplications,
} from "../../services/youthServices";

const STATUS_LABELS = {
  pending: "Pending",
  under_review: "Under review",
  approved: "Approved",
  rejected: "Rejected",
  funded: "Funded",
  completed: "Completed",
};

const getStatus = (value) =>
  String(value || "pending")
    .toLowerCase()
    .replace(/ /g, "_");

export default function Analytics() {
  const { currentUser, userProfile, loading: authLoading } = useAuth();
  const canView =
    String(userProfile?.role || userProfile?.userType || "").toLowerCase() ===
    "entrepreneur";
  const [ideas, setIdeas] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const loadAnalytics = useCallback(async () => {
    if (!currentUser?.uid) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");
    try {
      const [ideasResult, applicationsResult] = await Promise.all([
        getBusinessIdeas(currentUser.uid),
        getFundingApplications(currentUser.uid),
      ]);
      if (!ideasResult.success || !applicationsResult.success) {
        throw new Error("Your portfolio analytics could not be loaded.");
      }

      setIdeas(Array.isArray(ideasResult.data) ? ideasResult.data : []);
      setApplications(
        Array.isArray(applicationsResult.data) ? applicationsResult.data : [],
      );
    } catch (loadError) {
      console.error("Unable to load entrepreneur analytics:", loadError);
      setError("Analytics could not be loaded. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [currentUser?.uid]);

  useEffect(() => {
    if (!authLoading && canView && currentUser) {
      loadAnalytics();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [authLoading, canView, currentUser, loadAnalytics, refreshKey]);

  const applicationCounts = applications.reduce((counts, application) => {
    const status = getStatus(application.status);
    counts[status] = (counts[status] || 0) + 1;
    return counts;
  }, {});
  const activeApplications =
    (applicationCounts.pending || 0) + (applicationCounts.under_review || 0);

  if (authLoading || loading) {
    return (
      <main
        className="mx-auto max-w-6xl animate-pulse space-y-5 px-4 py-8 sm:px-6 lg:px-8"
        aria-label="Loading analytics"
      >
        <div className="h-8 w-64 rounded bg-slate-200" />
        <div className="grid gap-4 md:grid-cols-3">
          <div className="h-32 rounded-2xl bg-slate-200" />
          <div className="h-32 rounded-2xl bg-slate-200" />
          <div className="h-32 rounded-2xl bg-slate-200" />
        </div>
      </main>
    );
  }

  if (!currentUser || !canView) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <div
          role="alert"
          className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-amber-900"
        >
          You do not have permission to view entrepreneur analytics.
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
            Entrepreneur workspace
          </p>
          <h1 className="mt-1 text-3xl font-bold text-slate-900">
            Portfolio analytics
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            A summary of your saved business ideas and funding applications.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setRefreshKey((key) => key + 1)}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:ring-indigo-600"
        >
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          Refresh
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

      {!error && (
        <>
          <section
            aria-label="Portfolio metrics"
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            {[
              {
                label: "Portfolio items",
                value: ideas.length,
                description: "Business ideas you manage",
              },
              {
                label: "Funding applications",
                value: applications.length,
                description: "Applications submitted",
              },
              {
                label: "Awaiting a decision",
                value: activeApplications,
                description: "Pending or under review",
              },
            ].map((metric) => (
              <article
                key={metric.label}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <p className="text-sm font-medium text-slate-600">
                  {metric.label}
                </p>
                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {metric.value}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {metric.description}
                </p>
              </article>
            ))}
          </section>

          <section className="mt-6 grid gap-6 lg:grid-cols-2">
            <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">
                Business portfolio
              </h2>
              {ideas.length === 0 ? (
                <p className="mt-4 text-sm text-slate-600">
                  No business ideas have been added to your portfolio yet.
                </p>
              ) : (
                <ul className="mt-4 divide-y divide-slate-100">
                  {ideas.slice(0, 8).map((idea) => (
                    <li
                      key={idea.id}
                      className="flex items-center justify-between gap-4 py-3"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-medium text-slate-900">
                          {idea.title || "Untitled idea"}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          {idea.industry || "Industry not specified"}
                        </p>
                      </div>
                      <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium capitalize text-slate-700">
                        {idea.stage || idea.status || "Draft"}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </article>

            <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">
                Funding application status
              </h2>
              {applications.length === 0 ? (
                <p className="mt-4 text-sm text-slate-600">
                  No funding applications have been submitted yet.
                </p>
              ) : (
                <ul className="mt-4 space-y-3">
                  {Object.entries(applicationCounts).map(([status, count]) => (
                    <li
                      key={status}
                      className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3"
                    >
                      <span className="text-sm font-medium text-slate-700">
                        {STATUS_LABELS[status] || status.replace(/_/g, " ")}
                      </span>
                      <span className="font-semibold text-slate-900">
                        {count}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
              <div className="mt-5 flex items-center gap-2 text-sm text-slate-600">
                <TrendingUp
                  className="h-4 w-4 text-indigo-600"
                  aria-hidden="true"
                />
                All figures are calculated from your account records.
              </div>
            </article>
          </section>
        </>
      )}
    </main>
  );
}
