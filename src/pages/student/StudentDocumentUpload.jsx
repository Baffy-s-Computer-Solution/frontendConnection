import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, FileUp, UploadCloud } from 'lucide-react';

import { useAuth } from '../../context/AuthContext';
import { uploadDocument } from '../../services/studentServices';

const documentTypes = [
  { value: 'resume', label: 'Resume / CV' },
  { value: 'transcript', label: 'Academic transcript' },
  { value: 'identification', label: 'Identification' },
  { value: 'cover_letter', label: 'Cover letter' },
  { value: 'certificate', label: 'Certificate' },
  { value: 'portfolio', label: 'Portfolio' },
  { value: 'other', label: 'Other' },
];

const StudentDocumentUpload = () => {
  const { currentUser } = useAuth();
  const [documentType, setDocumentType] = useState('resume');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploadProgress, setUploadProgress] = useState('');
  const fileInputRef = useRef(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formElement = event.currentTarget;
    setError('');
    setSuccess('');

    if (!currentUser?.uid) {
      setError('Sign in to upload documents.');
      return;
    }
    if (!file) {
      setError('Choose a document to upload.');
      return;
    }

    setUploading(true);
    setUploadProgress('Uploading file securely…');
    try {
      const result = await uploadDocument(currentUser.uid, file, documentType);
      if (!result.success) throw new Error(result.error || 'Unable to upload this document.');
      setFile(null);
      formElement.reset();
      if (fileInputRef.current) fileInputRef.current.value = '';
      setDocumentType('resume');
      setSuccess('Document uploaded and saved to your library.');
      setUploadProgress('');
    } catch (uploadError) {
      const message = uploadError?.code === 'storage/unauthorized' || uploadError?.code === 'permission-denied' || /permission|unauthorized/i.test(uploadError?.message || '')
        ? 'Your account is not allowed to upload to document storage yet. Check the student storage and Firestore rules for this Firebase project.'
        : uploadError.message || 'Unable to upload this document.';
      setError(message);
      setUploadProgress('');
    } finally {
      setUploading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 dark:bg-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <Link to="/student/documents" className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-brand-600 dark:text-slate-300">
          <ArrowLeft className="h-4 w-4" /> Documents
        </Link>

        <section className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <header className="border-b border-slate-200 p-6 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">
                <FileUp className="h-5 w-5" />
              </span>
              <div>
                <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Upload a document</h1>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Files are stored with your student document records.</p>
              </div>
            </div>
          </header>

          <form onSubmit={handleSubmit} className="space-y-5 p-6">
            {error && <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-200">{error}</p>}
            {success && <p role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-200">{success}</p>}

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">Document type</span>
              <select value={documentType} onChange={(event) => setDocumentType(event.target.value)} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100">
                {documentTypes.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}
              </select>
            </label>

            <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-center dark:border-slate-700 dark:bg-slate-950">
              <UploadCloud className="mx-auto h-8 w-8 text-slate-400" />
              <p className="mt-3 text-sm font-medium text-slate-800 dark:text-slate-100">{file?.name || 'Choose a file'}</p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">PDF, Word, or image files, up to 10 MB</p>
              <input ref={fileInputRef} id="student-document-file" type="file" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" onChange={(event) => { setFile(event.target.files?.[0] || null); setError(''); }} className="sr-only" />
              <button type="button" onClick={() => fileInputRef.current?.click()} className="mt-4 inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:border-brand-500 hover:text-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">Choose file</button>
              {file && <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{(file.size / 1024 / 1024).toFixed(2)} MB selected</p>}
              {uploadProgress && <p className="mt-2 text-sm text-brand-700 dark:text-brand-300" role="status">{uploadProgress}</p>}
            </div>

            <div className="flex items-center justify-end gap-3">
              <Link to="/student/documents" className="rounded-lg px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">Cancel</Link>
              <button type="submit" disabled={uploading || !file} className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-500 disabled:cursor-not-allowed disabled:opacity-60">
                <UploadCloud className="h-4 w-4" /> {uploading ? 'Uploading...' : 'Upload document'}
              </button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
};

export default StudentDocumentUpload;
