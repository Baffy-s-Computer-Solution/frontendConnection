const StudentCourses = () => {
  const enrolledCourses = [
    {
      id: 1,
      title: 'Advanced JavaScript',
      institution: 'Online Tech Academy',
      progress: 85,
      nextDeadline: '2024-01-20',
      status: 'in-progress',
    },
    {
      id: 2,
      title: 'Data Science Fundamentals',
      institution: 'Coursera',
      progress: 100,
      completionDate: '2024-01-10',
      status: 'completed',
    },
    {
      id: 3,
      title: 'Project Management',
      institution: 'Lesotho College of Education',
      progress: 30,
      nextDeadline: '2024-01-25',
      status: 'in-progress',
    },
  ];

  const recommendedCourses = [
    {
      id: 1,
      title: 'React Native Development',
      institution: 'Udemy',
      duration: '8 weeks',
      level: 'Intermediate',
      match: 92,
    },
    {
      id: 2,
      title: 'Cloud Computing Basics',
      institution: 'AWS Academy',
      duration: '6 weeks',
      level: 'Beginner',
      match: 85,
    },
    {
      id: 3,
      title: 'UI/UX Design Principles',
      institution: 'Coursera',
      duration: '5 weeks',
      level: 'Beginner',
      match: 78,
    },
  ];

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 dark:bg-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
              Learning
            </p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900 dark:text-slate-100">My Courses</h1>
          </div>
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-brand-500"
          >
            Find New Courses
          </button>
        </header>

        <div className="grid gap-6 xl:grid-cols-[1.7fr_1fr]">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <h2 className="mb-4 text-xl font-semibold text-slate-900 dark:text-slate-100">
              Enrolled Courses
            </h2>

            <div className="space-y-4">
              {enrolledCourses.map((course) => (
                <div
                  key={course.id}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-950/40"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                        {course.title}
                      </h3>
                      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                        {course.institution}
                      </p>

                      <div className="mt-3">
                        <div className="mb-1 flex items-center justify-between text-sm text-slate-600 dark:text-slate-300">
                          <span>Progress</span>
                          <span>{course.progress}%</span>
                        </div>
                        <div className="h-2.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-brand-500 to-violet-500"
                            style={{ width: `${course.progress}%` }}
                          />
                        </div>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2">
                        {course.status === 'completed' ? (
                          <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200">
                            Completed on {new Date(course.completionDate).toLocaleDateString()}
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-500/10 dark:text-amber-200">
                            Next deadline: {new Date(course.nextDeadline).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      className={`inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-medium transition ${
                        course.status === 'completed'
                          ? 'border border-emerald-600 bg-white text-emerald-700 hover:bg-emerald-50 dark:border-emerald-400 dark:bg-slate-900 dark:text-emerald-300 dark:hover:bg-emerald-500/10'
                          : 'bg-brand-600 text-white hover:bg-brand-500'
                      }`}
                    >
                      {course.status === 'completed' ? 'View Certificate' : 'Continue Learning'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <h2 className="mb-4 text-xl font-semibold text-slate-900 dark:text-slate-100">
              Recommended Courses
            </h2>

            <div className="space-y-4">
              {recommendedCourses.map((course) => (
                <div key={course.id} className="border-b border-slate-200 pb-4 last:border-b-0 last:pb-0 dark:border-slate-700">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                        {course.title}
                      </h3>
                      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{course.institution}</p>
                    </div>
                    <span className="inline-flex rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200">
                      {course.match}%
                    </span>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="rounded-full bg-sky-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-sky-700 dark:bg-sky-500/10 dark:text-sky-200">
                      {course.level}
                    </span>
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                      {course.duration}
                    </span>
                  </div>

                  <button
                    type="button"
                    className="mt-3 inline-flex items-center justify-center rounded-lg border border-brand-600 px-3 py-2 text-xs font-medium text-brand-600 transition hover:bg-brand-50 dark:border-brand-400 dark:text-brand-300 dark:hover:bg-brand-500/10"
                  >
                    Enroll
                  </button>
                </div>
              ))}
            </div>

            <button
              type="button"
              className="mt-5 w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:border-brand-500 hover:text-brand-600 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-200 dark:hover:border-brand-400 dark:hover:text-brand-300"
            >
              Browse All Courses
            </button>
          </aside>
        </div>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <h2 className="mb-4 text-xl font-semibold text-slate-900 dark:text-slate-100">
            Learning Statistics
          </h2>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { value: '8', label: 'Courses Completed', tone: 'text-brand-600' },
              { value: '42', label: 'Learning Hours', tone: 'text-emerald-600' },
              { value: '3', label: 'Active Courses', tone: 'text-amber-600' },
              { value: '92%', label: 'Average Score', tone: 'text-sky-600' },
            ].map((stat) => (
              <div key={stat.label} className="rounded-2xl bg-slate-50 p-4 text-center dark:bg-slate-950/40">
                <div className={`text-3xl font-bold ${stat.tone}`}>{stat.value}</div>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
};

// Keep the legacy import path connected to the live Firestore-backed page.
export { default } from './StudentCoursesLive';


