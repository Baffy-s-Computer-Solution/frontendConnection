import { FaShieldAlt } from "react-icons/fa";

const AdminPageShell = ({ title, description, icon: Icon = FaShieldAlt, actions, children }) => (
  <main className="min-h-full bg-slate-50 dark:bg-slate-950">
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <header className="flex flex-wrap items-center justify-between gap-4 rounded-xl border bg-white p-5 shadow-card dark:bg-slate-900">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-200">
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">{title}</h1>
            {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
          </div>
        </div>
        {actions ? <div>{actions}</div> : null}
      </header>

      <div className="mt-6">{children}</div>
    </div>
  </main>
);

export default AdminPageShell;
