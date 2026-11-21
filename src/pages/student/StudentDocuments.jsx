import { useEffect, useMemo, useState } from 'react';
import { FileText, ExternalLink, Pencil, Trash2, UploadCloud, LoaderCircle, Files, FileCheck2, Clock3 } from 'lucide-react';

import { useAuth } from '../../context/AuthContext';
import { deleteDocument, subscribeToStudentDocuments, updateStudentDocumentMetadata, uploadDocument } from '../../services/studentServices';

const documentTypes = [
  { value: 'resume', label: 'Resume / CV' }, { value: 'transcript', label: 'Academic transcript' },
  { value: 'identification', label: 'Identification' }, { value: 'cover_letter', label: 'Cover letter' },
  { value: 'certificate', label: 'Certificate' }, { value: 'portfolio', label: 'Portfolio' }, { value: 'other', label: 'Other' },
];

const formatDocumentDate = (value) => {
  if (!value) return 'No date';

  const date = value instanceof Date ? value : typeof value?.toDate === 'function' ? value.toDate() : new Date(value);
  if (Number.isNaN(date.getTime())) return 'No date';

  return new Intl.DateTimeFormat('en-ZA', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
};

function StudentDocuments() {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState([]);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [deletingId, setDeletingId] = useState('');
  const [file, setFile] = useState(null);
  const [documentType, setDocumentType] = useState('resume');
  const [uploading, setUploading] = useState(false);
  const [editingDocument, setEditingDocument] = useState(null);
  const [editForm, setEditForm] = useState({ fileName: '', documentType: 'other' });
  const [savingEdit, setSavingEdit] = useState(false);

  useEffect(() => {
    if (!currentUser?.uid) {
      setLoading(false);
      return undefined;
    }

    setLoading(true);
    setError('');
    return subscribeToStudentDocuments(
      currentUser.uid,
      (records) => {
        setDocuments(records);
        setLoading(false);
      },
      (loadError) => {
        const isPermissionError = loadError?.code === 'permission-denied' || /permission/i.test(loadError?.message || '');
        setError(isPermissionError
          ? 'Your account cannot read its document records yet. Check student document access in the Firebase rules for this project.'
          : loadError.message || 'Unable to load your documents right now.');
        setLoading(false);
      }
    );
  }, [currentUser?.uid]);

  const handleDelete = async (document) => {
    if (!window.confirm(`Delete ${document.fileName || document.name || 'this document'}?`)) return;
    setDeletingId(document.id);
    const result = await deleteDocument(document.id, document.storagePath, currentUser?.uid);
    setNotice(result.success ? 'Document deleted.' : result.error || 'Unable to delete this document.');
    setDeletingId('');
  };

  const handleUpload = async (event) => {
    event.preventDefault();
    if (!file || !currentUser?.uid) return;
    if (file.size > 5 * 1024 * 1024) {
      setError('File must be 5 MB or smaller.');
      return;
    }
    setUploading(true);
    setError('');
    try {
      const result = await uploadDocument(currentUser.uid, file, documentType);
      if (!result.success) {
        setError(result.error || 'Unable to upload this document.');
        return;
      }
      setFile(null);
      event.currentTarget.reset();
      setDocumentType('resume');
      setNotice('Document uploaded. Your library will update automatically.');
    } catch (uploadError) {
      setError(uploadError.message || 'Unable to upload this document.');
    } finally {
      setUploading(false);
    }
  };

  const startEditing = (document) => {
    setEditingDocument(document);
    setEditForm({
      fileName: document.fileName || document.name || '',
      documentType: document.documentType || document.type || 'other',
    });
    setError('');
    setNotice('');
  };

  const handleSaveMetadata = async (event) => {
    event.preventDefault();
    if (!editingDocument || !currentUser?.uid) return;
    setSavingEdit(true);
    setError('');
    const result = await updateStudentDocumentMetadata(editingDocument.id, currentUser.uid, editForm);
    setSavingEdit(false);
    if (!result.success) {
      setError(result.error || 'Unable to update document details.');
      return;
    }
    setEditingDocument(null);
    setNotice('Document details updated.');
  };

  const stats = useMemo(() => ({
    total: documents.length,
    active: documents.filter((doc) => String(doc.status || '').toLowerCase() !== 'deleted').length,
    recent: documents.filter((doc) => {
      const date = doc.uploadedAt || doc.createdAt || doc.updatedAt;
      if (!date) return false;
      const diffInMs = new Date() - new Date(date);
      return diffInMs <= 1000 * 60 * 60 * 24 * 30;
    }).length,
  }), [documents]);

  if (loading) {
    return (
      <main className="w-full bg-slate-50 px-4 py-8 dark:bg-slate-950 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-card dark:border-slate-800 dark:bg-slate-900">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600" />
          <p className="mt-4 text-sm text-slate-500 dark:text-slate-300">Loading your documents...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="w-full bg-slate-50 px-4 py-8 dark:bg-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="flex flex-col justify-between gap-4 rounded-2xl bg-gradient-to-r from-brand-600 to-violet-600 p-6 text-white shadow-card md:flex-row md:items-center">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-brand-100">Student Documents</p>
            <h1 className="mt-2 text-3xl font-semibold text-white">My documents</h1>
          </div>
          <a href="#document-upload" className="inline-flex h-11 items-center gap-2 rounded-lg bg-white px-4 text-sm font-semibold text-brand-700 transition hover:bg-slate-100"><UploadCloud className="h-4 w-4" /> Upload document</a>
        </header>

        <div className="grid grid-cols-3 gap-2.5 sm:gap-4 md:grid-cols-3">
          {[
            { label: 'Total files', value: stats.total, Icon: Files, color: 'text-slate-700 dark:text-slate-200' },
            { label: 'Active', value: stats.active, Icon: FileCheck2, color: 'text-emerald-600' },
            { label: 'Recent', value: stats.recent, Icon: Clock3, color: 'text-brand-600' },
          ].map(({ label, value, Icon, color }) => (
            <div key={label} className="min-w-0 rounded-2xl border border-slate-200 bg-white p-2.5 shadow-card dark:border-slate-800 dark:bg-slate-900 sm:p-5">
              <div className="flex items-center justify-between gap-1">
                <div className="truncate text-[10px] text-slate-500 dark:text-slate-400 sm:text-sm">{label}</div>
                <Icon className={`h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4 ${color}`} aria-hidden="true" />
              </div>
              <div className={`mt-1 text-xl font-semibold sm:mt-3 sm:text-3xl ${color}`}>{value}</div>
            </div>
          ))}
        </div>

        {error && (
          <div className="rounded-2xl border border-danger-soft bg-danger-light p-4 text-sm text-danger-dark dark:border-danger-dark/40 dark:bg-danger-dark/10 dark:text-red-200">
            {error}
          </div>
        )}
        {notice && <p className="text-sm text-slate-600 dark:text-slate-300" role="status">{notice}</p>}

        <div className="rounded-2xl border border-slate-200 bg-white shadow-card dark:border-slate-800 dark:bg-slate-900">
          <div className="border-b border-slate-200 px-5 py-4 dark:border-slate-800">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Document library</h2>
          </div>

          {documents.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
              <FileText className="mb-4 h-10 w-10 text-slate-400" aria-hidden="true" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">No documents uploaded yet</h3>
              <p className="mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400">Your uploaded CV, certificates, and transcripts will appear here in real time once you add them.</p>
              <a href="#document-upload" className="mt-5 inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white"><UploadCloud className="h-4 w-4" /> Upload your first document</a>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-left dark:divide-slate-800">
                <thead className="bg-slate-50 dark:bg-slate-950/60">
                  <tr>
                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Name</th>
                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Type</th>
                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Status</th>
                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Uploaded</th>
                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {documents.map((document) => (
                    <tr key={document.id} className="hover:bg-slate-50 dark:hover:bg-slate-950/40">
                      <td className="px-5 py-4">
                        <div className="font-medium text-slate-900 dark:text-slate-100">{document.fileName || document.name || 'Document file'}</div>
                        {document.fileUrl && (
                          <a href={document.fileUrl} target="_blank" rel="noreferrer" className="mt-1 inline-block text-xs text-brand-600 hover:text-brand-700">
                            Open file
                          </a>
                        )}
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-600 dark:text-slate-300">
                        {document.documentType || document.type || 'Other'}
                      </td>
                      <td className="px-5 py-4">
                        <span className="inline-flex rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200">
                          {document.status || 'Active'}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-600 dark:text-slate-300">
                        {formatDocumentDate(document.uploadedAt || document.createdAt)}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          {document.fileUrl && (
                            <a href={document.fileUrl} target="_blank" rel="noreferrer" aria-label="Open document" title="Open document" className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:border-brand-400 hover:text-brand-600 dark:border-slate-700 dark:text-slate-300">
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          )}
                          <button type="button" onClick={() => startEditing(document)} aria-label="Edit document details" title="Edit document details" className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:border-brand-400 hover:text-brand-600 dark:border-slate-700 dark:text-slate-300">
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button type="button" onClick={() => handleDelete(document)} disabled={deletingId === document.id} aria-label="Delete document" title="Delete document" className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 disabled:opacity-50 dark:border-rose-900 dark:hover:bg-rose-950/30">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <section id="document-upload" className="scroll-mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-card dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-4 flex items-center gap-3"><span className="rounded-xl bg-brand-50 p-2.5 text-brand-700 dark:bg-brand-950 dark:text-brand-200"><UploadCloud className="h-5 w-5" /></span><div><h2 className="font-semibold text-slate-900 dark:text-slate-100">Add a document</h2><p className="text-sm text-slate-500 dark:text-slate-400">PDF, Word, or image files up to 5 MB. Files are stored in Cloudinary.</p></div></div>
          <form onSubmit={handleUpload} className="grid gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Document type<select value={documentType} onChange={(event) => setDocumentType(event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 dark:border-slate-700 dark:bg-slate-950 dark:text-white">{documentTypes.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}</select></label>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Choose file<input type="file" required accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" onChange={(event) => setFile(event.target.files?.[0] || null)} className="mt-1.5 block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-brand-50 file:px-3 file:py-2 file:font-semibold file:text-brand-700 dark:text-slate-200" /></label>
            <button type="submit" disabled={!file || uploading} className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{uploading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}{uploading ? 'Uploading' : 'Upload'}</button>
          </form>
        </section>
      </div>
      {editingDocument && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget && !savingEdit) setEditingDocument(null); }}>
          <form onSubmit={handleSaveMetadata} role="dialog" aria-modal="true" aria-labelledby="edit-document-title" className="w-full max-w-lg space-y-4 rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900">
            <div className="flex items-start justify-between gap-4">
              <div><h2 id="edit-document-title" className="text-lg font-semibold text-slate-900 dark:text-white">Edit document details</h2><p className="mt-1 text-sm text-slate-500">Update the name or category. The uploaded file stays unchanged.</p></div>
              <button type="button" aria-label="Close edit document dialog" disabled={savingEdit} onClick={() => setEditingDocument(null)} className="rounded-lg px-2 py-1 text-slate-500 hover:bg-slate-100 disabled:opacity-50 dark:hover:bg-slate-800">×</button>
            </div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Document name
              <input required maxLength={180} value={editForm.fileName} onChange={(event) => setEditForm((current) => ({ ...current, fileName: event.target.value }))} className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
            </label>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Document type
              <select value={editForm.documentType} onChange={(event) => setEditForm((current) => ({ ...current, documentType: event.target.value }))} className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 dark:border-slate-700 dark:bg-slate-950 dark:text-white">
                {documentTypes.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}
              </select>
            </label>
            <div className="flex justify-end gap-2">
              <button type="button" disabled={savingEdit} onClick={() => setEditingDocument(null)} className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 disabled:opacity-50 dark:border-slate-700 dark:text-slate-200">Cancel</button>
              <button type="submit" disabled={savingEdit} className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{savingEdit ? 'Saving…' : 'Save changes'}</button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
}

export default StudentDocuments;


