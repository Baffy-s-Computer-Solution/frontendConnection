import { Building2, ShieldCheck, UserCircle2, GraduationCap } from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import AdminSystemSettings from './admin/SystemSettings';
import CompanySettings from './company/CompanySettings';
import InstituteSettings from './institute/Settings';
import StudentSettings from './student/StudentSettings';
import MentorSettings from './mentor/MentorSettings';
import ParentSettings from './parent/ParentSettings';
import AlumniSettings from './alumni/AlumniSettings';
import { normalizeUserType } from '../utils/authRoleUtils';
import ErrorBoundary from '../components/ErrorBoundary';

const SettingsErrorFallback = () => (
  <div
    role="alert"
    className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200"
  >
    Settings could not be loaded. Refresh the page or contact support if this continues.
  </div>
);

const roleMeta = {
  admin: {
    label: 'Admin settings',
    icon: ShieldCheck,
  },
  student: {
    label: 'Student settings',
    icon: GraduationCap,
  },
  company: {
    label: 'Company settings',
    icon: Building2,
  },
  institute: {
    label: 'Institution settings',
    icon: Building2,
  },
  mentor: { label: 'Mentor settings', icon: GraduationCap },
  parent: { label: 'Parent settings', icon: UserCircle2 },
  alumni: { label: 'Alumni settings', icon: UserCircle2 },
  entrepreneur: { label: 'Entrepreneur settings', icon: Building2 },
  youth: { label: 'Youth settings', icon: UserCircle2 },
};

const Settings = () => {
  const { userProfile, currentUser } = useAuth();
  const rawUserType = userProfile?.userType || userProfile?.role || currentUser?.userType || currentUser?.role || 'student';
  const normalizedUserType = normalizeUserType(rawUserType);
  const selectedRole = roleMeta[normalizedUserType] ? normalizedUserType : 'student';
  const Icon = roleMeta[selectedRole]?.icon || UserCircle2;

  const roleComponentMap = {
    admin: AdminSystemSettings,
    student: StudentSettings,
    company: CompanySettings,
    institute: InstituteSettings,
    mentor: MentorSettings,
    parent: ParentSettings,
    alumni: AlumniSettings,
    entrepreneur: StudentSettings,
    youth: StudentSettings,
  };

  const Component = roleComponentMap[selectedRole] || StudentSettings;

  return (
    <main className="w-full px-4 py-6 sm:px-6 lg:px-8">
      <section className="mb-6 rounded-xl border bg-white shadow-card dark:bg-slate-900">
        <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-200">
              <Icon size={20} aria-hidden />
            </div>
            <div>
              <div className="font-semibold text-slate-900 dark:text-slate-100">{roleMeta[selectedRole]?.label || 'Settings'}</div>
              <p className="mt-1 text-sm text-slate-500">Manage your account, visibility, and platform preferences</p>
            </div>
          </div>
          <span className="rounded-full border bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
            {selectedRole.toUpperCase()}
          </span>
        </div>
      </section>
      <ErrorBoundary fallback={SettingsErrorFallback}>
        <Component />
      </ErrorBoundary>
    </main>
  );
};

export default Settings;
