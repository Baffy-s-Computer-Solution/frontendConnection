import { useEffect, useState } from 'react';
import { CheckCircle2, Clock3, ClipboardCheck, ArrowLeft } from 'lucide-react';
import { collection, doc, getDoc, onSnapshot, query, serverTimestamp, where, writeBatch } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../context/AuthContext';

export default function StudentAssessments() {
  const { currentUser } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [submittedIds, setSubmittedIds] = useState(new Set());

  useEffect(() => {
    if (!currentUser?.uid) { setAssignments([]); setLoading(false); return undefined; }
    const stopAssignments = onSnapshot(
      query(collection(db, 'assessmentAssignments'), where('candidateId', '==', currentUser.uid)),
      (snapshot) => { setAssignments(snapshot.docs.map((item) => ({ id: item.id, ...item.data() }))); setLoading(false); },
      (subscriptionError) => { setError(subscriptionError.message || 'Unable to load assigned assessments.'); setLoading(false); },
    );
    const stopSubmissions = onSnapshot(
      query(collection(db, 'assessmentSubmissions'), where('candidateId', '==', currentUser.uid)),
      (snapshot) => setSubmittedIds(new Set(snapshot.docs.map((item) => item.data().assignmentId))),
      (subscriptionError) => setError(subscriptionError.message || 'Unable to load submission status.'),
    );
    return () => { stopAssignments(); stopSubmissions(); };
  }, [currentUser?.uid]);

  const startAssessment = async (assignment) => {
    setError('');
    try {
      const assessmentSnapshot = await getDoc(doc(db, 'companyAssessments', assignment.assessmentId));
      if (!assessmentSnapshot.exists()) throw new Error('This assessment is no longer available.');
      setActive({ assignment, assessment: { id: assessmentSnapshot.id, ...assessmentSnapshot.data() } });
      setAnswers({});
    } catch (loadError) { setError(loadError.message || 'Unable to open assessment.'); }
  };

  const submitAssessment = async () => {
    if (!active) return;
    const questions = active.assessment.questions || [];
    const unanswered = questions.some((question) => answers[question.id] === undefined || String(answers[question.id]).trim() === '');
    if (unanswered) { setError('Please answer every question before submitting.'); return; }
    setSubmitting(true); setError('');
    try {
      const batch = writeBatch(db);
      const submissionRef = doc(collection(db, 'assessmentSubmissions'));
      batch.set(submissionRef, {
        assignmentId: active.assignment.id,
        assessmentId: active.assessment.id,
        companyId: active.assignment.companyId,
        candidateId: currentUser.uid,
        answers,
        status: 'submitted',
        submittedAt: serverTimestamp(),
      });
      batch.update(doc(db, 'assessmentAssignments', active.assignment.id), {
        status: 'submitted', submittedAt: serverTimestamp(), updatedAt: serverTimestamp(),
      });
      await batch.commit();
      setActive(null);
    } catch (submitError) { setError(submitError.message || 'Unable to submit this assessment.'); }
    finally { setSubmitting(false); }
  };

  return (
    <main className="mx-auto w-full max-w-4xl space-y-5 p-4 sm:p-6">
      <header className="flex items-start gap-3">
        <span className="rounded-xl bg-indigo-100 p-2.5 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300"><ClipboardCheck className="h-5 w-5" /></span>
        <div><h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Assessments</h1><p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Complete assessments shared with you by companies.</p></div>
      </header>
      {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/30 dark:text-red-200">{error}</div>}
      {active ? (
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
          <button type="button" onClick={() => setActive(null)} className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-indigo-700 dark:text-indigo-300"><ArrowLeft className="h-4 w-4" />Back to assessments</button>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">{active.assessment.title}</h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{active.assessment.description}</p>
          <div className="mt-5 space-y-4">
            {(active.assessment.questions || []).map((question, index) => <fieldset key={question.id} className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
              <legend className="px-1 text-sm font-semibold text-slate-900 dark:text-white">{index + 1}. {question.text} <span className="font-normal text-slate-500">({question.points || 1} pt)</span></legend>
              {question.type === 'multiple_choice' ? <div className="mt-2 space-y-2">{(question.options || []).map((option, optionIndex) => <label key={`${question.id}-${optionIndex}`} className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800"><input type="radio" name={question.id} value={optionIndex} checked={String(answers[question.id]) === String(optionIndex)} onChange={() => setAnswers((current) => ({ ...current, [question.id]: optionIndex }))} />{option}</label>)}</div> : <textarea aria-label={`Answer for question ${index + 1}`} rows={3} value={answers[question.id] || ''} onChange={(event) => setAnswers((current) => ({ ...current, [question.id]: event.target.value }))} className="mt-2 w-full rounded-lg border border-slate-300 bg-white p-3 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white" />}
            </fieldset>)}
          </div>
          <button type="button" disabled={submitting || !(active.assessment.questions || []).length} onClick={submitAssessment} className="mt-5 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50">{submitting ? 'Submitting…' : 'Submit assessment'}</button>
        </section>
      ) : loading ? <div className="py-16 text-center text-sm text-slate-500">Loading assessments…</div> : assignments.length === 0 ? <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">No assessments have been assigned to you.</div> : (
        <div className="space-y-3">{assignments.map((assignment) => {
          const complete = assignment.status === 'submitted' || submittedIds.has(assignment.id);
          return <article key={assignment.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 sm:p-5">
            <div className="min-w-0"><h2 className="font-semibold text-slate-900 dark:text-white">{assignment.assessmentTitle || 'Skills assessment'}</h2><p className="mt-1 flex items-center gap-2 text-sm text-slate-500"><Clock3 className="h-4 w-4" />{assignment.assessmentType || 'Assessment'} · {assignment.status || 'assigned'}</p></div>
            {complete ? <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1.5 text-sm font-medium text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200"><CheckCircle2 className="h-4 w-4" />Submitted</span> : <button type="button" onClick={() => startAssessment(assignment)} className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700">Start assessment</button>}
          </article>;
        })}</div>
      )}
    </main>
  );
}
