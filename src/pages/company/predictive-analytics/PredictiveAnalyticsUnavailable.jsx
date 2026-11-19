import { FaBrain, FaInfoCircle } from 'react-icons/fa';

export default function PredictiveAnalyticsUnavailable() {
  return (
    <main className="min-h-full bg-slate-50 px-4 py-8 dark:bg-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <header className="mb-6 flex items-center gap-3">
          <span className="rounded-xl bg-indigo-100 p-3 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300"><FaBrain aria-hidden="true" /></span>
          <div>
            <p className="text-sm font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">Company workspace</p>
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Predictive analytics</h1>
          </div>
        </header>
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8" role="status">
          <div className="flex items-start gap-4">
            <FaInfoCircle className="mt-1 shrink-0 text-slate-500 dark:text-slate-400" aria-hidden="true" />
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Not available yet</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
                Predictive analytics is not enabled for this workspace. No forecasts are being generated or shown. This page will become available when the platform has a supported prediction service and enough verified company data.
              </p>
              <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">Your jobs and application data remain available in the Jobs, Applications, and Analytics sections.</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
