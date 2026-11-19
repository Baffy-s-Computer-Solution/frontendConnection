import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BriefcaseBusiness, CalendarDays, FileText, GraduationCap, UserRound } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useStudent } from '../../context/StudentContext';
import { subscribeToActiveJobs, subscribeToStudentApplications } from '../../services/studentServices';

const QuickActions = () => {
  const { currentUser } = useAuth();
  const { studentData } = useStudent();
  const [jobsCount, setJobsCount] = useState(0);
  const [applicationsCount, setApplicationsCount] = useState(0);
  useEffect(() => {
    const stopJobs = subscribeToActiveJobs((records) => setJobsCount(records.length));
    const stopApplications = currentUser?.uid ? subscribeToStudentApplications(currentUser.uid, (records) => setApplicationsCount(records.length)) : () => {};
    return () => { stopJobs(); stopApplications(); };
  }, [currentUser?.uid]);
  const actions = [
    { id: 1, title: 'Find opportunities', description: 'Browse current jobs and internships', color: 'brand', link: '/student/jobs', Icon: BriefcaseBusiness, count: jobsCount },
    { id: 2, title: 'Explore courses', description: 'Browse published courses and manage learning', color: 'emerald', link: '/student/courses', Icon: GraduationCap },
    { id: 3, title: 'Manage documents', description: 'Upload and organize your career documents', color: 'sky', link: '/student/documents', Icon: FileText },
    { id: 4, title: 'Applications', description: 'Review your application status', color: 'amber', link: '/student/applications', Icon: BriefcaseBusiness, count: applicationsCount },
    { id: 5, title: 'Your profile', description: 'Keep your profile information current', color: 'slate', link: '/student/profile', Icon: UserRound },
    { id: 6, title: 'Calendar', description: 'See deadlines and scheduled interviews', color: 'rose', link: '/student/calendar', Icon: CalendarDays },
  ];

  const pendingTasks = [];

  const colorClasses = {
    brand: 'bg-brand-100 text-brand-700',
    emerald: 'bg-emerald-100 text-emerald-700',
    sky: 'bg-sky-100 text-sky-700',
    amber: 'bg-amber-100 text-amber-700',
    slate: 'bg-slate-200 text-slate-700',
    rose: 'bg-rose-100 text-rose-700',
  };

  return (
    <main className="w-full px-4 py-6 sm:px-6 lg:px-8">
      <h1 className="mb-6 text-2xl font-semibold text-slate-900 dark:text-slate-100">Quick Actions Dashboard</h1>

      <div className="mb-6 grid gap-4 xl:grid-cols-[2fr_1fr]">
        <section>
          <h2 className="mb-3 text-lg font-semibold text-slate-900 dark:text-slate-100">🚀 Quick Access</h2>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {actions.map((action) => (
              <div key={action.id} className="rounded-xl border bg-white p-5 shadow-card dark:bg-slate-900">
                <div className={`mb-4 inline-flex rounded-full p-3 ${colorClasses[action.color]}`}>
                  <action.Icon className="h-5 w-5" aria-hidden="true" />
                  <span className="text-2xl">{action.id === 1 ? '💼' : action.id === 2 ? '📚' : action.id === 3 ? '📤' : action.id === 4 ? '📋' : action.id === 5 ? '👤' : '📅'}</span>
                </div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">{action.title}</h3>
                <p className="mt-2 text-sm text-slate-500">{action.description}</p>
                <div className="mt-4 flex flex-col gap-2">
                  <Link to={action.link} className="inline-flex items-center justify-center rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700">Open</Link>
                  {action.count && <span className="inline-flex self-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-200">{action.count} available</span>}
                  {action.urgent && <span className="inline-flex self-center rounded-full bg-danger px-2.5 py-1 text-xs font-medium text-white">Urgent</span>}
                </div>
              </div>
            ))}
          </div>
        </section>

        <aside className="rounded-xl border bg-white p-5 shadow-card dark:bg-slate-900">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">📝 Pending Tasks</h2>
          <div className="mt-4 space-y-3">
            {pendingTasks.length === 0 ? <p className="rounded-lg bg-slate-50 p-3 text-sm text-slate-500 dark:bg-slate-800">No task records are available.</p> : pendingTasks.map((task) => (
              <div key={task.id} className="flex items-start justify-between gap-3 rounded-lg border border-slate-200 p-3 dark:border-slate-700">
                <div className="flex items-start gap-2">
                  <input type="checkbox" className="mt-1 h-4 w-4 rounded border-slate-300 text-brand-600" id={`task-${task.id}`} />
                  <div>
                    <label htmlFor={`task-${task.id}`} className="text-sm text-slate-700 dark:text-slate-200">{task.task}</label>
                    <p className="mt-1 text-xs text-slate-500">Due: {task.due}</p>
                  </div>
                </div>
                <span className="inline-flex rounded-full bg-amber-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-amber-700">Pending</span>
              </div>
            ))}
          </div>

          <div className="mt-6">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Recent Activity</h3>
            <p className="mt-3 text-sm text-slate-500">Your actual activity appears on the Activity page.</p>
          </div>
        </aside>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-xl border bg-white p-5 shadow-card dark:bg-slate-900">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">📊 Quick Stats</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-3 text-center">
            <div><h3 className="text-3xl font-semibold text-brand-600">{jobsCount}</h3><p className="mt-1 text-sm text-slate-500">Open opportunities</p></div>
            <div><h3 className="text-3xl font-semibold text-emerald-600">{applicationsCount}</h3><p className="mt-1 text-sm text-slate-500">Applications</p></div>
            <div><h3 className="text-3xl font-semibold text-amber-600">{Number(studentData?.profileCompletion) || 0}%</h3><p className="mt-1 text-sm text-slate-500">Profile completion</p></div>
          </div>
        </section>

        <section className="rounded-xl border bg-white p-5 shadow-card dark:bg-slate-900">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">⚡ Quick Tips</h2>
          <div className="mt-4 space-y-3">
            <div className="rounded-lg border border-sky-200 bg-sky-50 p-3 text-sm text-sky-800 dark:border-sky-800 dark:bg-sky-950/40 dark:text-sky-200"><strong>Tip:</strong> Complete your profile to get better job matches</div>
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200"><strong>Tip:</strong> Apply within 24 hours for new job postings</div>
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200"><strong>Tip:</strong> Upload all required documents before applying</div>
          </div>
        </section>
      </div>

      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link to="/student/job-matches" className="inline-flex items-center rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white">View your job matches</Link>
      </div>
    </main>
  );
};

export default QuickActions;
