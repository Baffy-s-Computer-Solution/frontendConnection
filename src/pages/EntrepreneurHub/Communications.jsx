import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Bell, CircleAlert, MessageSquareText, RefreshCw } from "lucide-react";
import {
  collection,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";

import { useAuth } from "../../context/AuthContext";
import { db } from "../../config/firebase";

const getDate = (value) => {
  const date = value?.toDate?.() || (value ? new Date(value) : null);
  return date && !Number.isNaN(date.getTime())
    ? date.toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "Date unavailable";
};

export default function Communications() {
  const { currentUser, userProfile, loading: authLoading } = useAuth();
  const canView =
    String(userProfile?.role || userProfile?.userType || "").toLowerCase() ===
    "entrepreneur";
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState("");
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const loadNotifications = useCallback(async () => {
    if (!currentUser?.uid) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");
    try {
      const source = collection(db, "notifications");
      const [byUser, byRecipient] = await Promise.all([
        getDocs(query(source, where("userId", "==", currentUser.uid))),
        getDocs(query(source, where("recipientId", "==", currentUser.uid))),
      ]);
      const records = new Map();
      for (const snapshot of [...byUser.docs, ...byRecipient.docs]) {
        records.set(snapshot.id, { id: snapshot.id, ...snapshot.data() });
      }

      setNotifications(
        [...records.values()]
          .sort((first, second) => {
            const firstDate = first.createdAt?.toMillis?.() || 0;
            const secondDate = second.createdAt?.toMillis?.() || 0;
            return secondDate - firstDate;
          })
          .slice(0, 50),
      );
    } catch (loadError) {
      console.error("Unable to load entrepreneur communications:", loadError);
      setError("Your updates could not be loaded. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [currentUser?.uid]);

  useEffect(() => {
    if (!authLoading && canView && currentUser) {
      loadNotifications();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [authLoading, canView, currentUser, loadNotifications, refreshKey]);

  const markAsRead = async (item) => {
    if (!currentUser?.uid || updatingId || item.read || item.isRead) return;

    setUpdatingId(item.id);
    setError("");
    try {
      await updateDoc(doc(db, "notifications", item.id), { read: true });
      setNotifications((current) =>
        current.map((notification) =>
          notification.id === item.id
            ? { ...notification, read: true }
            : notification,
        ),
      );
    } catch (updateError) {
      console.error("Unable to mark notification as read:", updateError);
      setError("This update could not be marked as read. Please try again.");
    } finally {
      setUpdatingId("");
    }
  };

  if (authLoading || loading) {
    return (
      <main
        className="mx-auto max-w-5xl animate-pulse space-y-5 px-4 py-8 sm:px-6 lg:px-8"
        aria-label="Loading communications"
      >
        <div className="h-8 w-64 rounded bg-slate-200" />
        <div className="h-36 rounded-2xl bg-slate-200" />
        <div className="h-36 rounded-2xl bg-slate-200" />
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
          You do not have permission to view entrepreneur communications.
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
            Communications
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Account updates and shortcuts to your existing support workflows.
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

      <nav
        aria-label="Communication shortcuts"
        className="mb-6 grid gap-3 sm:grid-cols-2"
      >
        <Link
          to="/entrepreneur-hub/mentors"
          className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 text-sm font-semibold text-indigo-700 hover:bg-indigo-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-600"
        >
          <MessageSquareText className="h-5 w-5" aria-hidden="true" />
          Explore mentor support
        </Link>
        <Link
          to="/entrepreneur-hub/review"
          className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 text-sm font-semibold text-indigo-700 hover:bg-indigo-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-600"
        >
          <Bell className="h-5 w-5" aria-hidden="true" />
          Track funding applications
        </Link>
      </nav>

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

      {notifications.length === 0 && !error ? (
        <section className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
          <Bell
            className="mx-auto h-10 w-10 text-slate-400"
            aria-hidden="true"
          />
          <h2 className="mt-4 text-lg font-semibold text-slate-900">
            No updates yet
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Notifications about your account and applications will appear here.
          </p>
        </section>
      ) : notifications.length > 0 ? (
        <section aria-label="Recent account updates" className="space-y-3">
          {notifications.map((item) => {
            const isRead = Boolean(item.read || item.isRead);
            return (
              <article
                key={item.id}
                className={`rounded-xl border bg-white p-4 shadow-sm ${isRead ? "border-slate-200" : "border-indigo-200"}`}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <h2 className="font-semibold text-slate-900">
                      {item.title || "Account update"}
                    </h2>
                    <p className="mt-1 whitespace-pre-wrap text-sm text-slate-600">
                      {item.message ||
                        item.body ||
                        "No message content was provided."}
                    </p>
                    <p className="mt-2 text-xs text-slate-500">
                      {getDate(item.createdAt || item.timestamp)}
                    </p>
                  </div>
                  {!isRead && (
                    <button
                      type="button"
                      onClick={() => markAsRead(item)}
                      disabled={updatingId === item.id}
                      className="shrink-0 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                    >
                      {updatingId === item.id ? "Saving..." : "Mark read"}
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </section>
      ) : null}
    </main>
  );
}
