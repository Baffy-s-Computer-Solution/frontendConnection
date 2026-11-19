import { useCallback, useEffect, useState } from "react";
import { CircleAlert, Pencil, Plus, RefreshCw, Trash2, X } from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import { institutionService } from "../../services/institutionServices";

const EMPTY_FORM = { name: "", code: "", description: "" };

export default function ManageFaculties() {
  const { currentUser, userProfile, loading: authLoading } = useAuth();
  const canManage =
    String(userProfile?.role || userProfile?.userType || "").toLowerCase() ===
    "institute";
  const [institution, setInstitution] = useState(null);
  const [faculties, setFaculties] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const loadFaculties = useCallback(async () => {
    if (!currentUser?.uid) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");
    try {
      const profile = await institutionService.getInstitutionProfile(
        currentUser.uid,
      );
      const records = await institutionService.getFaculties(
        currentUser.uid,
        profile.id,
      );
      setInstitution(profile);
      setFaculties(records);
    } catch (loadError) {
      console.error("Unable to load institution faculties:", loadError);
      setError("Faculties could not be loaded. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [currentUser?.uid]);

  useEffect(() => {
    if (!authLoading && canManage && currentUser) {
      loadFaculties();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [authLoading, canManage, currentUser, loadFaculties, refreshKey]);

  const openCreateForm = () => {
    setEditingId("");
    setForm(EMPTY_FORM);
    setError("");
    setNotice("");
    setFormOpen(true);
  };

  const openEditForm = (faculty) => {
    setEditingId(faculty.id);
    setForm({
      name: faculty.name || "",
      code: faculty.code || "",
      description: faculty.description || "",
    });
    setError("");
    setNotice("");
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditingId("");
    setForm(EMPTY_FORM);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!currentUser?.uid || !institution?.id || saving) return;

    setSaving(true);
    setError("");
    setNotice("");
    try {
      const result = editingId
        ? await institutionService.updateFaculty(
            currentUser.uid,
            editingId,
            form,
          )
        : await institutionService.createFaculty(
            currentUser.uid,
            institution.id,
            form,
          );

      setFaculties((records) =>
        editingId
          ? records.map((faculty) =>
              faculty.id === editingId ? { ...faculty, ...result } : faculty,
            )
          : [result, ...records],
      );
      setNotice(editingId ? "Faculty details updated." : "Faculty created.");
      closeForm();
    } catch (saveError) {
      console.error("Unable to save faculty:", saveError);
      setError(
        saveError.message || "Faculty could not be saved. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (faculty) => {
    if (!currentUser?.uid || deletingId) return;
    if (
      !window.confirm(
        `Delete "${faculty.name}"? This will not delete associated courses.`,
      )
    )
      return;

    setDeletingId(faculty.id);
    setError("");
    setNotice("");
    try {
      await institutionService.deleteFaculty(currentUser.uid, faculty.id);
      setFaculties((records) =>
        records.filter((item) => item.id !== faculty.id),
      );
      setNotice(`${faculty.name} deleted.`);
    } catch (deleteError) {
      console.error("Unable to delete faculty:", deleteError);
      setError("Faculty could not be deleted. Please try again.");
    } finally {
      setDeletingId("");
    }
  };

  if (authLoading || loading) {
    return (
      <main
        className="mx-auto max-w-6xl animate-pulse space-y-5 px-4 py-8 sm:px-6 lg:px-8"
        aria-label="Loading faculties"
      >
        <div className="h-8 w-64 rounded bg-slate-200" />
        <div className="h-44 rounded-2xl bg-slate-200" />
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
          You do not have permission to manage institution faculties.
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
            Institute workspace
          </p>
          <h1 className="mt-1 text-3xl font-bold text-slate-900">Faculties</h1>
          <p className="mt-2 text-sm text-slate-600">
            {institution?.name || "Manage your academic faculties."}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setRefreshKey((key) => key + 1)}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
          >
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            Refresh
          </button>
          <button
            type="button"
            onClick={openCreateForm}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add faculty
          </button>
        </div>
      </header>

      {error && (
        <div
          role="alert"
          className="mb-5 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800"
        >
          <CircleAlert className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
          {error}
        </div>
      )}
      {notice && (
        <p role="status" className="mb-5 text-sm text-emerald-700">
          {notice}
        </p>
      )}

      {formOpen && (
        <form
          onSubmit={handleSubmit}
          className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">
              {editingId ? "Edit faculty" : "Add faculty"}
            </h2>
            <button
              type="button"
              onClick={closeForm}
              aria-label="Close form"
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-600"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm font-medium text-slate-700">
              Faculty name
              <input
                required
                maxLength={120}
                value={form.name}
                onChange={(event) =>
                  setForm((value) => ({ ...value, name: event.target.value }))
                }
                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
              />
            </label>
            <label className="text-sm font-medium text-slate-700">
              Faculty code{" "}
              <span className="font-normal text-slate-500">(optional)</span>
              <input
                maxLength={30}
                value={form.code}
                onChange={(event) =>
                  setForm((value) => ({ ...value, code: event.target.value }))
                }
                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
              />
            </label>
            <label className="text-sm font-medium text-slate-700 md:col-span-2">
              Description{" "}
              <span className="font-normal text-slate-500">(optional)</span>
              <textarea
                rows={3}
                maxLength={1000}
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
          </div>
          <div className="mt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={closeForm}
              className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving
                ? "Saving..."
                : editingId
                  ? "Save changes"
                  : "Create faculty"}
            </button>
          </div>
        </form>
      )}

      {faculties.length === 0 && !error ? (
        <section className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
          <h2 className="text-lg font-semibold text-slate-900">
            No faculties yet
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Add your first faculty to organize your institution.
          </p>
          <button
            type="button"
            onClick={openCreateForm}
            className="mt-5 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            Add faculty
          </button>
        </section>
      ) : faculties.length > 0 ? (
        <section
          aria-label="Institution faculties"
          className="grid gap-4 md:grid-cols-2"
        >
          {faculties.map((faculty) => (
            <article
              key={faculty.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    {faculty.name}
                  </h2>
                  {faculty.code && (
                    <p className="mt-1 text-sm font-medium text-indigo-700">
                      {faculty.code}
                    </p>
                  )}
                </div>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => openEditForm(faculty)}
                    aria-label={`Edit ${faculty.name}`}
                    className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-600"
                  >
                    <Pencil className="h-4 w-4" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(faculty)}
                    disabled={deletingId === faculty.id}
                    aria-label={`Delete ${faculty.name}`}
                    className="rounded-lg p-2 text-rose-600 hover:bg-rose-50 disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-rose-600"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </div>
              <p className="mt-3 whitespace-pre-wrap text-sm text-slate-600">
                {faculty.description || "No description provided."}
              </p>
            </article>
          ))}
        </section>
      ) : null}
    </main>
  );
}
