import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, RefreshCw, Sparkles } from 'lucide-react';
import { useStudent } from '../../context/StudentContext';
import { formatLocation } from '../../utils/formatters';

const Recommendations = () => {
  const { fetchRecommendedJobs } = useStudent();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadRecommendations = async () => {
    setLoading(true);
    const result = await fetchRecommendedJobs?.();
    setJobs(Array.isArray(result) ? result : []);
    setLoading(false);
  };

  useEffect(() => {
    loadRecommendations();
  }, []);

  return (
    <main className="dashboard-page">
      <section className="dashboard-hero">
        <p className="dashboard-eyebrow">Personalised discovery</p>
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <h1 className="mt-2 text-3xl font-semibold">Recommendations</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-brand-100">Opportunities are calculated from your profile, skills, preferences, and live listings.</p>
          </div>
          <button type="button" onClick={loadRecommendations} className="button button-glass" disabled={loading}>
            <RefreshCw className={loading ? 'h-4 w-4 animate-spin' : 'h-4 w-4'} /> Refresh
          </button>
        </div>
      </section>

      <section className="mt-6">
        {loading && <div className="dashboard-empty">Finding live opportunities for your profile...</div>}
        {!loading && jobs.length === 0 && (
          <div className="dashboard-empty">
            <Sparkles className="mx-auto h-8 w-8 text-brand-500" />
            <p className="mt-3 font-medium text-slate-700 dark:text-slate-200">No recommendations yet</p>
            <p className="mt-1">Complete your profile or browse current jobs to improve matching.</p>
            <Link to="/student/jobs" className="button button-primary mt-5">Browse jobs <ArrowRight className="h-4 w-4" /></Link>
          </div>
        )}
        <div className="grid gap-4 lg:grid-cols-2">
          {jobs.map((job) => {
            const details = job.jobDetails || job;
            return (
              <article key={job.id} className="dashboard-card">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{details.title || 'Opportunity'}</h2>
                    <p className="mt-1 text-sm text-slate-500">{details.company || details.companyName || 'Employer details available'}{formatLocation(details.location) ? ` · ${formatLocation(details.location)}` : ''}</p>
                  </div>
                  {job.matchScore != null && <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">{job.matchScore}% match</span>}
                </div>
                <div className="mt-5 flex flex-wrap gap-2 text-xs text-slate-600 dark:text-slate-300">
                  {details.jobType && <span className="rounded-full bg-slate-100 px-3 py-1 dark:bg-slate-800">{details.jobType}</span>}
                  {details.salary && <span className="rounded-full bg-slate-100 px-3 py-1 dark:bg-slate-800">{details.salary}</span>}
                </div>
                <Link to={`/student/jobs/apply/${job.id}`} className="button button-primary mt-5">View opportunity <ArrowRight className="h-4 w-4" /></Link>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
};

export default Recommendations;
