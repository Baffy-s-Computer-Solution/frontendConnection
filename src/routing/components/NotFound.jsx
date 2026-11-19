/* eslint-disable react/no-unescaped-entities */
import { Link } from 'react-router-dom';
import { FiHome, FiSearch, FiAlertTriangle } from 'react-icons/fi';
import Button from '../../components/ui/Button';

const NotFound = () => {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12 dark:bg-slate-950">
      <div className="w-full max-w-2xl rounded-xl border bg-white p-8 text-center shadow-card dark:bg-slate-900 sm:p-12">
              <div className="mb-8">
                <FiAlertTriangle size={64} className="mx-auto mb-3 text-warning" />
                <h1 className="text-6xl font-bold tracking-tight text-slate-900 dark:text-slate-100">404</h1>
                <h2 className="mb-3 text-xl font-semibold text-slate-900 dark:text-slate-100">Page Not Found</h2>
                <p className="mb-4 text-slate-500">
                  The page you're looking for doesn't exist or has been moved.
                </p>
              </div>

              <div className="flex flex-col justify-center gap-3 sm:flex-row">
                <Link to="/" className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 text-sm font-medium text-white transition hover:bg-brand-700">
                  <FiHome />
                  Go Home
                </Link>

                <Link to="/search" className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-brand-300 px-4 text-sm font-medium text-brand-700 transition hover:bg-brand-50 dark:border-brand-700 dark:text-brand-200 dark:hover:bg-brand-950">
                  <FiSearch />
                  Search
                </Link>

                <Button variant="outline" onClick={() => window.history.back()}>
                  Go Back
                </Button>
              </div>

              <div className="mt-8 border-t pt-4">
                <p className="mb-2 text-xs text-slate-500">
                  If you believe this is an error, please contact support.
                </p>
                <Link to="/contact" className="text-xs font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400">
                  Contact Support →
                </Link>
              </div>
      </div>
    </main>
  );
};

export default NotFound;
