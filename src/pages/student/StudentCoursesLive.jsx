import { useEffect, useMemo, useState } from 'react';
import { collection, collectionGroup, deleteDoc, doc, onSnapshot, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import { BookOpen, ExternalLink, GraduationCap, LoaderCircle, Search, Trash2 } from 'lucide-react';

import { db } from '../../config/firebase';
import { useAuth } from '../../context/AuthContext';

const panel = 'rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900';
const normalizeCourse = (snapshot) => {
  const data = snapshot.data();
  const institute = snapshot.ref.parent.parent;
  return {
    id: snapshot.id,
    ...data,
    institutionId: data.institutionId || institute?.id || '',
    institutionName: data.institutionName || data.instituteName || data.institution || '',
    title: data.title || data.courseName || data.name || 'Course',
    coursePath: snapshot.ref.path,
    courseUrl: data.courseUrl || data.courseURL || data.url || data.link || '',
  };
};

export default function StudentCoursesLive() {
  const { currentUser } = useAuth();
  const uid = currentUser?.uid;
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('catalog');
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    const stop = onSnapshot(collectionGroup(db, 'courses'), (snapshot) => {
      const visible = snapshot.docs.map(normalizeCourse).filter((course) =>
        (!course.status || ['active', 'published', 'open', 'approved'].includes(String(course.status).toLowerCase())) && course.isActive !== false && course.isPublished !== false
      );
      setCourses(visible);
      setLoading(false);
      setError('');
    }, (loadError) => {
      setError(loadError.message || 'Unable to load the course catalog.');
      setLoading(false);
    });
    return stop;
  }, []);

  useEffect(() => {
    if (!uid) {
      setEnrollments([]);
      return undefined;
    }
    return onSnapshot(collection(db, 'students', uid, 'enrollments'), (snapshot) => {
      setEnrollments(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })));
    }, (loadError) => setError(loadError.message || 'Unable to load your enrollments.'));
  }, [uid]);

  const enrolledIds = useMemo(() => new Set(enrollments.map((item) => item.courseKey)), [enrollments]);
  const visibleCourses = useMemo(() => courses.filter((course) => {
      const target = tab === 'enrolled' ? enrolledIds.has(`${course.institutionId}_${course.id}`) : !enrolledIds.has(`${course.institutionId}_${course.id}`);
    const needle = search.trim().toLowerCase();
    return target && (!needle || `${course.title} ${course.institutionName} ${course.description || ''} ${course.category || ''}`.toLowerCase().includes(needle));
  }), [courses, enrolledIds, search, tab]);

  const enroll = async (course) => {
    if (!uid) return;
    const courseKey = `${course.institutionId}_${course.id}`;
    const id = encodeURIComponent(courseKey);
    setSavingId(courseKey); setError(''); setNotice('');
    try {
      await setDoc(doc(db, 'students', uid, 'enrollments', id), {
        studentId: uid,
        courseId: course.id,
        courseKey,
        coursePath: course.coursePath,
        institutionId: course.institutionId,
        institutionName: course.institutionName,
        courseTitle: course.title,
        status: 'enrolled',
        progress: 0,
        enrolledAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }, { merge: true });
      setTab('enrolled');
      setNotice('You are enrolled. Your course will appear in My learning.');
    } catch (saveError) { setError(saveError.message || 'Unable to enroll in this course.'); }
    finally { setSavingId(''); }
  };

  const updateProgress = async (enrollment, progress) => {
    setSavingId(enrollment.courseKey);
    try {
      await updateDoc(doc(db, 'students', uid, 'enrollments', enrollment.id), {
        progress,
        status: progress >= 100 ? 'completed' : 'in_progress',
        updatedAt: serverTimestamp(),
        ...(progress >= 100 ? { completedAt: serverTimestamp() } : {}),
      });
      setNotice(progress >= 100 ? 'Course marked complete.' : 'Learning progress updated.');
    } catch (saveError) { setError(saveError.message || 'Unable to update course progress.'); }
    finally { setSavingId(''); }
  };

  const withdraw = async (enrollment) => {
    if (!window.confirm(`Remove ${enrollment.courseTitle} from your learning list?`)) return;
    setSavingId(enrollment.courseKey);
    try {
      await deleteDoc(doc(db, 'students', uid, 'enrollments', enrollment.id));
      setNotice('Enrollment removed.');
    } catch (saveError) { setError(saveError.message || 'Unable to remove this enrollment.'); }
    finally { setSavingId(''); }
  };

  const enrollmentFor = (course) => enrollments.find((item) => item.courseKey === `${course.institutionId}_${course.id}`);

  return <main className="mx-auto min-h-screen max-w-7xl space-y-6 bg-slate-50 px-4 py-6 dark:bg-slate-950 sm:px-6 lg:px-8">
    <header className={`${panel} flex flex-wrap items-center justify-between gap-4 p-6`}><div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-300">Learning</p><h1 className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">Courses</h1><p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Browse published courses and manage your learning progress.</p></div><div className="flex gap-2"><button type="button" onClick={() => setTab('catalog')} className={`rounded-xl px-4 py-2 text-sm font-semibold ${tab === 'catalog' ? 'bg-indigo-600 text-white' : 'border border-slate-300 text-slate-700 dark:border-slate-700 dark:text-slate-200'}`}>Course catalog</button><button type="button" onClick={() => setTab('enrolled')} className={`rounded-xl px-4 py-2 text-sm font-semibold ${tab === 'enrolled' ? 'bg-indigo-600 text-white' : 'border border-slate-300 text-slate-700 dark:border-slate-700 dark:text-slate-200'}`}>My learning ({enrollments.length})</button></div></header>
    {error && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200">{error}</p>}{notice && <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200">{notice}</p>}
    <label className={`${panel} flex items-center gap-3 p-4`}><Search className="h-4 w-4 text-slate-400"/><span className="sr-only">Search courses</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search courses, providers, or topics" className="w-full bg-transparent text-sm outline-none dark:text-white"/></label>
    {loading ? <div className={`${panel} flex items-center justify-center gap-2 p-12 text-slate-600 dark:text-slate-300`}><LoaderCircle className="animate-spin"/>Loading courses…</div> : visibleCourses.length ? <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{visibleCourses.map((course) => {
      const enrollment = enrollmentFor(course);
      return <article key={`${course.institutionId}_${course.id}`} className={`${panel} flex flex-col p-5`}><div className="flex items-start gap-3"><span className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300"><BookOpen className="h-5 w-5"/></span><div className="min-w-0"><h2 className="font-semibold text-slate-900 dark:text-white">{course.title}</h2><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{course.institutionName || 'Education provider'}</p></div></div>{course.description && <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{course.description}</p>}<div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-500">{course.level && <span className="rounded-full bg-slate-100 px-2.5 py-1 dark:bg-slate-800">{course.level}</span>}{course.duration && <span className="rounded-full bg-slate-100 px-2.5 py-1 dark:bg-slate-800">{course.duration}</span>}{course.category && <span className="rounded-full bg-slate-100 px-2.5 py-1 dark:bg-slate-800">{course.category}</span>}</div><div className="mt-auto flex flex-wrap items-center gap-2 pt-5">{enrollment ? <><span className="mr-auto text-sm font-semibold text-indigo-700 dark:text-indigo-300">{enrollment.status === 'completed' ? 'Completed' : `${Number(enrollment.progress) || 0}% complete`}</span><button disabled={savingId === enrollment.courseKey} onClick={() => updateProgress(enrollment, enrollment.progress >= 100 ? 0 : Math.min(100, (Number(enrollment.progress) || 0) + 10))} className="rounded-xl border border-indigo-600 px-3 py-2 text-xs font-semibold text-indigo-700 disabled:opacity-50 dark:text-indigo-300">{enrollment.progress >= 100 ? 'Restart' : 'Update progress'}</button><button disabled={savingId === enrollment.courseKey} onClick={() => withdraw(enrollment)} aria-label="Remove enrollment" title="Remove enrollment" className="rounded-xl border border-rose-200 p-2 text-rose-600 dark:border-rose-900"><Trash2 className="h-4 w-4"/></button>{course.courseUrl && <a href={course.courseUrl} target="_blank" rel="noreferrer" aria-label="Open course" title="Open course" className="rounded-xl bg-indigo-600 p-2 text-white"><ExternalLink className="h-4 w-4"/></a>}</> : <button type="button" disabled={!uid || savingId === `${course.institutionId}_${course.id}`} onClick={() => enroll(course)} className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"><GraduationCap className="h-4 w-4"/>{savingId === `${course.institutionId}_${course.id}` ? 'Enrolling…' : 'Enroll'}</button>}</div></article>;
    })}</section> : <div className={`${panel} p-12 text-center`}><BookOpen className="mx-auto h-9 w-9 text-slate-400"/><h2 className="mt-3 font-semibold text-slate-900 dark:text-white">{tab === 'enrolled' ? 'No enrolled courses yet' : 'No published courses found'}</h2><p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{tab === 'enrolled' ? 'Enroll in a course from the catalog to start learning.' : 'Try another search or check back when providers publish courses.'}</p></div>}
  </main>;
}
