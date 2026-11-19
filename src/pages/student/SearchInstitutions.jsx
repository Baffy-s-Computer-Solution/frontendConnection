import Button from '../../components/ui/Button';

const SearchInstitutions = () => {
  const currentDate = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <main className="w-full px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Search Institutions</h1>
          <p className="mt-1 text-sm text-slate-500">{currentDate} | Student View</p>
        </div>
        <Button variant="primary">Refresh</Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <section className="rounded-xl border bg-white shadow-card dark:bg-slate-900">
          <div className="border-b px-5 py-4">
            <h2 className="font-semibold">Overview</h2>
          </div>
          <div className="p-5">
            <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">
              Browse trusted institutions and programs that match your academic and career interests.
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-600 dark:text-slate-300">
              <li>Compare institutions and offerings</li>
              <li>Explore programs aligned with your goals</li>
              <li>Track admissions and enrollment steps</li>
              <li>Keep up with updates and deadlines</li>
            </ul>
          </div>
        </section>

        <div className="space-y-4">
          <section className="rounded-xl border bg-white shadow-card dark:bg-slate-900">
            <div className="border-b px-5 py-4">
              <h2 className="font-semibold">Quick Stats</h2>
            </div>
            <div className="p-5 text-center">
              <h3 className="text-3xl font-semibold">0</h3>
              <p className="mt-2 text-sm text-slate-500">Saved institutions</p>
              <Button variant="outline" size="sm" className="mt-3 w-full">
                View All
              </Button>
            </div>
          </section>

          <section className="rounded-xl border bg-white shadow-card dark:bg-slate-900">
            <div className="border-b px-5 py-4">
              <h2 className="font-semibold">Recent Activity</h2>
            </div>
            <div className="p-5">
              <p className="text-sm text-slate-500">No recent activity</p>
              <Button variant="outline" size="sm" className="mt-3 w-full">
                View Activity Log
              </Button>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
};

export default SearchInstitutions;
