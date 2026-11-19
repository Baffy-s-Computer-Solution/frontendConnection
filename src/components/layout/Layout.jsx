import { useEffect, useMemo, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { FaBars, FaAward, FaBell, FaBriefcase, FaBuilding, FaCalendarAlt, FaChartLine, FaChevronDown, FaChevronLeft, FaChevronRight, FaMoon, FaChalkboardTeacher, FaComments, FaCog, FaFileAlt, FaGraduationCap, FaHome, FaPlus, FaRocket, FaSchool, FaSignOutAlt, FaSun, FaTimes, FaUser, FaUsers, FaUserShield, FaVideo } from "react-icons/fa";

import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { normalizeUserType } from '../../utils/authRoleUtils';
import { ROUTES } from '../../routing/utils/routeConstants';

const ROLE_NAVIGATION = {
  admin: [
    { label: 'Dashboard', path: '/admin/dashboard', icon: FaHome },
    { label: 'Users', path: '/admin/users', icon: FaUser },
    { label: 'Companies', path: '/admin/companies', icon: FaBuilding },
    { label: 'Jobs', path: '/admin/jobs', icon: FaBriefcase },
    { label: 'Pending Approvals', path: '/admin/pending-approvals', icon: FaUsers },
    { label: 'Analytics', path: '/admin/analytics', icon: FaChartLine },
    { label: 'Search users', path: '/admin/search/users', icon: FaUser },
    { label: 'Search companies', path: '/admin/search/companies', icon: FaBuilding },
    { label: 'Search applications', path: '/admin/search/applications', icon: FaFileAlt },
    { label: 'Admin Management', path: '/admin/admins', icon: FaUserShield },
    { label: 'Audit log', path: '/admin/audit', icon: FaFileAlt },
    { label: 'Admissions', path: '/admin/admissions', icon: FaSchool },
    { label: 'System settings', path: '/admin/system-settings', icon: FaCog },
    { label: 'Profile', path: '/admin/profile', icon: FaUserShield },
    { label: 'Settings', path: '/settings', icon: FaCog },
  ],
  student: [
    { label: 'Dashboard', path: ROUTES.STUDENT_DASHBOARD, icon: FaHome },
    { label: 'Profile', path: ROUTES.STUDENT.PROFILE, icon: FaUser },
    { label: 'Jobs', path: ROUTES.STUDENT.JOBS, icon: FaBriefcase },
    { label: 'Internships', path: ROUTES.STUDENT.SEARCH.INTERNSHIPS, icon: FaBriefcase },
    { label: 'Applications', path: ROUTES.STUDENT.APPLICATIONS, icon: FaFileAlt },
    { label: 'Documents', path: ROUTES.STUDENT.DOCUMENTS, icon: FaFileAlt },
    { label: 'Courses', path: ROUTES.STUDENT.COURSES, icon: FaGraduationCap },
    { label: 'Mentorship', path: ROUTES.STUDENT.MENTORSHIP, icon: FaChalkboardTeacher },
    { label: 'Friends', path: '/student/friends', icon: FaUsers },
    { label: 'Analytics', path: ROUTES.STUDENT.ANALYTICS, icon: FaChartLine },
    { label: 'Job matches', path: ROUTES.STUDENT.JOB_MATCHES, icon: FaChartLine },
    { label: 'Performance', path: ROUTES.STUDENT.PERFORMANCE, icon: FaChartLine },
    { label: 'Settings', path: ROUTES.SETTINGS, icon: FaCog },
  ],
  company: [
    { label: 'Dashboard', path: '/company/dashboard', icon: FaHome },
    { label: 'Hiring', icon: FaBriefcase, children: [
      { label: 'Jobs', path: '/company/jobs', icon: FaBriefcase },
      { label: 'Create job', path: '/company/jobs/create', icon: FaPlus },
      { label: 'Applications', path: '/company/applications', icon: FaFileAlt },
      { label: 'Candidates', path: '/company/candidates', icon: FaUsers },
      { label: 'Video interviews', path: '/company/video-interviews', icon: FaVideo },
      { label: 'Assessments', path: '/company/assessments', icon: FaFileAlt },
      { label: 'Referrals', path: '/company/referrals', icon: FaUsers },
    ] },
    { label: 'Insights', icon: FaChartLine, children: [
      { label: 'Analytics', path: '/company/analytics', icon: FaChartLine },
      { label: 'Diversity analytics', path: '/company/diversity-analytics', icon: FaUsers },
      { label: 'Predictive analytics', path: '/company/predictive-analytics', icon: FaChartLine },
      { label: 'Competitor analysis', path: '/company/competitor-analysis', icon: FaChartLine },
    ] },
    { label: 'Company', icon: FaBuilding, children: [
      { label: 'Profile', path: '/company/profile', icon: FaBuilding },
      { label: 'Branding', path: '/company/branding', icon: FaBuilding },
      { label: 'Teams', path: '/company/teams', icon: FaUsers },
      { label: 'Team workspace', path: '/company/team-workspace', icon: FaUsers },
      { label: 'Onboarding', path: '/company/onboarding', icon: FaRocket },
      { label: 'Documents', path: '/company/documents', icon: FaFileAlt },
    ] },
    { label: 'Network', icon: FaComments, children: [
      { label: 'Followers', path: '/company/followers', icon: FaUsers },
      { label: 'Friends', path: '/company/friends', icon: FaUsers },
      { label: 'Chat', path: '/company/chat', icon: FaComments },
      { label: 'Notifications', path: '/company/notifications', icon: FaBell },
      { label: 'AI matching', path: '/company/ai-matching', icon: FaRocket },
      { label: 'Talent pool', path: '/company/talent-pool', icon: FaUser },
      { label: 'Marketplace', path: '/company/marketplace', icon: FaBuilding },
      { label: 'Search market', path: '/company/search/market', icon: FaChartLine },
      { label: 'Search partners', path: '/company/search/partners', icon: FaBuilding },
      { label: 'Search students', path: '/company/search/students', icon: FaUsers },
    ] },
    { label: 'Settings', path: '/settings', icon: FaCog },
  ],
  institute: [
    { label: 'Dashboard', path: '/institute/dashboard', icon: FaHome },
    { label: 'Profile', path: '/institute/profile', icon: FaSchool },
    { label: 'Courses', path: '/institute/courses', icon: FaGraduationCap },
    { label: 'Faculties', path: '/institute/faculties', icon: FaSchool },
    { label: 'Applications', path: '/institute/applications', icon: FaFileAlt },
    { label: 'Students', path: '/institute/students', icon: FaUsers },
    { label: 'Applications', path: '/institute/applications', icon: FaFileAlt },
    { label: 'Settings', path: '/institute/settings', icon: FaCog },
  ],
  government: [
    { label: 'Dashboard', path: '/government/dashboard', icon: FaHome },
    { label: 'Policy management', path: '/government/policy-management', icon: FaFileAlt },
    { label: 'Employment analytics', path: '/government/youth-employment-analytics', icon: FaChartLine },
    { label: 'Funding allocation', path: '/government/funding-allocation', icon: FaBriefcase },
    { label: 'Regional development', path: '/government/regional-development', icon: FaBuilding },
    { label: 'Economic impact', path: '/government/economic-impact', icon: FaChartLine },
    { label: 'Program effectiveness', path: '/government/program-effectiveness', icon: FaChartLine },
  ],
  mentor: [
    { label: 'Dashboard', path: '/mentor/dashboard', icon: FaHome },
    { label: 'Profile', path: '/mentor/profile', icon: FaChalkboardTeacher },
    { label: 'Sessions', path: '/mentor/sessions', icon: FaUsers },
    { label: 'Applications', path: '/mentor/applications', icon: FaFileAlt },
    { label: 'Earnings', path: '/mentor/earnings', icon: FaChartLine },
    { label: 'Mentees', path: '/mentor/mentees', icon: FaUsers },
    { label: 'Friends', path: '/mentor/friends', icon: FaUsers },
    { label: 'Settings', path: '/mentor/settings', icon: FaCog },
  ],
  youth: [
    { label: 'Dashboard', path: '/youth/dashboard', icon: FaHome },
    { label: 'Profile', path: '/youth/profile', icon: FaRocket },
    { label: 'Business', path: '/youth/business', icon: FaBriefcase },
    { label: 'Funding', path: '/youth/funding', icon: FaChartLine },
    { label: 'Achievements', path: '/youth/achievements', icon: FaAward },
    { label: 'Portfolio', path: '/youth/portfolio', icon: FaFileAlt },
    { label: 'Skills', path: '/youth/skills', icon: FaGraduationCap },
    { label: 'Mentorship', path: '/youth/mentorship', icon: FaUsers },
  ],
  entrepreneur: [
    { label: 'Dashboard', path: '/entrepreneur/dashboard', icon: FaHome },
    { label: 'Hub', path: '/entrepreneur-hub/dashboard', icon: FaChartLine },
    { label: 'Profile', path: '/entrepreneur/profile', icon: FaRocket },
    { label: 'Analytics', path: '/entrepreneur-hub/analytics', icon: FaChartLine },
    { label: 'Applications', path: '/entrepreneur-hub/applications', icon: FaFileAlt },
    { label: 'Communications', path: '/entrepreneur-hub/communications', icon: FaComments },
    { label: 'Company', path: '/entrepreneur-hub/company', icon: FaBuilding },
    { label: 'Funding', path: '/entrepreneur-hub/funding', icon: FaBriefcase },
    { label: 'Portfolio', path: '/entrepreneur-hub/portfolio', icon: FaFileAlt },
    { label: 'Media', path: '/entrepreneur-hub/media', icon: FaFileAlt },
    { label: 'Mentors', path: '/entrepreneur-hub/mentors', icon: FaUsers },
    { label: 'Reviews', path: '/entrepreneur-hub/review', icon: FaFileAlt },
  ],
  parent: [
    { label: 'Dashboard', path: '/parent/dashboard', icon: FaHome },
    { label: 'Student Progress', path: '/parent/student-progress', icon: FaChartLine },
    { label: 'Wellbeing', path: '/parent/wellbeing-monitor', icon: FaUsers },
    { label: 'Career Guidance', path: '/parent/career-guidance', icon: FaGraduationCap },
    { label: 'Financial Planning', path: '/parent/financial-planning', icon: FaBriefcase },
    { label: 'Communication', path: '/parent/communication-hub', icon: FaUsers },
  ],
  alumni: [
    { label: 'Dashboard', path: '/alumni/dashboard', icon: FaHome },
    { label: 'Profile', path: '/alumni/profile', icon: FaGraduationCap },
    { label: 'Network', path: '/alumni/network', icon: FaUsers },
    { label: 'Events', path: '/alumni/events', icon: FaCalendarAlt },
    { label: 'Mentorship', path: '/alumni/mentorship', icon: FaChalkboardTeacher },
    { label: 'Settings', path: '/alumni/settings', icon: FaCog },
  ],
};

const getInitials = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'CC';

const roleLabel = (userProfile) => {
  const userType = normalizeUserType(userProfile?.userType || userProfile?.role || 'student');
  if (!userType) return 'Member';
  return userType.charAt(0).toUpperCase() + userType.slice(1).toLowerCase();
};

const Layout = ({ children }) => {
  const { userProfile, currentUser, logout } = useAuth();
  const { isDark, setTheme } = useTheme();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [avatarFailed, setAvatarFailed] = useState(false);
  const [expandedCompanyGroup, setExpandedCompanyGroup] = useState(null);

  const avatarUrl = useMemo(() => (
    userProfile?.photoURL ||
    userProfile?.profilePhoto ||
    userProfile?.alumniProfile?.photoURL ||
    userProfile?.alumniProfile?.profilePhoto ||
    userProfile?.typeProfile?.photoURL ||
    userProfile?.typeProfile?.profilePhoto ||
    currentUser?.photoURL ||
    ''
  ), [currentUser?.photoURL, userProfile]);

  useEffect(() => setAvatarFailed(false), [avatarUrl]);

  const normalizedUserType = useMemo(() => {
    const rawUserType = userProfile?.userType || userProfile?.role || 'student';
    return normalizeUserType(rawUserType);
  }, [userProfile?.userType, userProfile?.role]);
  const navigationItems = useMemo(() => ROLE_NAVIGATION[normalizedUserType] || ROLE_NAVIGATION.student, [normalizedUserType]);

  useEffect(() => {
    if (normalizedUserType !== 'company') return;
    const activeGroup = navigationItems.find((item) => item.children?.some((child) => location.pathname === child.path || location.pathname.startsWith(`${child.path}/`)));
    if (activeGroup) setExpandedCompanyGroup(activeGroup.label);
  }, [location.pathname, navigationItems, normalizedUserType]);

  const displayName =
    userProfile?.displayName ||
    userProfile?.fullName ||
    currentUser?.displayName ||
    currentUser?.email?.split('@')[0] ||
    'Career Connect User';

  const pageTitle = useMemo(() => {
    const activeItem = navigationItems.flatMap((item) => item.children || [item]).find(
      (item) =>
        location.pathname === item.path ||
        (item.path !== '/' && location.pathname.startsWith(`${item.path}/`))
    );
    return activeItem?.label || 'Workspace';
  }, [location.pathname, navigationItems]);

  const handleLogout = async () => {
    await logout();
    setMobileMenuOpen(false);
  };

  const renderSidebar = () => (
    <>
      <div className="flex items-center justify-between gap-3 border-b px-4 py-4">
        <div className="flex min-w-0 items-center gap-3">
          <img
            className="h-9 w-9 shrink-0 rounded-lg object-cover"
            src="/career connect lesotho logo.jpeg"
            alt="Career Connect Lesotho"
          />
          {!sidebarCollapsed && (
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">Career Connect</div>
              <div className="truncate text-xs text-slate-500">Lesotho workspace</div>
            </div>
          )}
        </div>

        <button
          type="button"
          className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-slate-100"
          onClick={() => setSidebarCollapsed((prev) => !prev)}
          aria-label={sidebarCollapsed ? 'Expand navigation' : 'Collapse navigation'}
          title={sidebarCollapsed ? 'Expand navigation' : 'Collapse navigation'}
        >
          {sidebarCollapsed ? <FaChevronRight /> : <FaChevronLeft />}
        </button>
      </div>

      <div className="flex items-center gap-3 border-b px-4 py-4">
        {avatarUrl && !avatarFailed ? (
          <img
            className="h-10 w-10 rounded-full object-cover ring-2 ring-slate-100 dark:ring-slate-800"
            src={avatarUrl}
            alt={displayName}
            onError={() => setAvatarFailed(true)}
          />
        ) : (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700 dark:bg-brand-950 dark:text-brand-200">{getInitials(displayName)}</div>
        )}
        {!sidebarCollapsed && (
          <div className="min-w-0">
            <strong className="block truncate text-sm text-slate-900 dark:text-slate-100">{displayName}</strong>
            <span className="block truncate text-xs text-slate-500">{currentUser?.email}</span>
            <em className="text-xs not-italic text-brand-600 dark:text-brand-400">{roleLabel(userProfile)}</em>
          </div>
        )}
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4" aria-label="Primary">
        {navigationItems.map((item) => {
          const { label, path, icon: Icon, children } = item;
          if (normalizedUserType === 'company' && children) {
            const expanded = expandedCompanyGroup === label;
            const active = children.some((child) => location.pathname === child.path || location.pathname.startsWith(`${child.path}/`));
            return <div key={label}>
              <button type="button" aria-expanded={expanded} onClick={() => {
                if (sidebarCollapsed) setSidebarCollapsed(false);
                setExpandedCompanyGroup(expanded ? null : label);
              }} title={sidebarCollapsed ? label : undefined}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors ${active ? 'bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-200' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100'} ${sidebarCollapsed ? 'justify-center px-2' : ''}`}>
                <Icon className="h-4 w-4 shrink-0" />
                {!sidebarCollapsed && <><span className="flex-1">{label}</span><FaChevronDown className={`h-3 w-3 transition-transform ${expanded ? 'rotate-180' : ''}`} /></>}
              </button>
              {expanded && !sidebarCollapsed && <div className="ml-4 mt-1 space-y-1 border-l border-slate-200 pl-3 dark:border-slate-700">
                {children.map(({ label: childLabel, path: childPath, icon: ChildIcon }) => <NavLink key={childPath} to={childPath} onClick={() => setMobileMenuOpen(false)} className={({ isActive }) => `flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${isActive ? 'bg-brand-50 font-medium text-brand-700 dark:bg-brand-950 dark:text-brand-200' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100'}`}><ChildIcon className="h-3.5 w-3.5 shrink-0" /><span>{childLabel}</span></NavLink>)}
              </div>}
            </div>;
          }
          return <NavLink key={path} to={path} className={({ isActive }) => `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${isActive ? 'bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-200' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100'} ${sidebarCollapsed ? 'justify-center px-2' : ''}`} onClick={() => setMobileMenuOpen(false)} title={sidebarCollapsed ? label : undefined}><Icon className="h-4 w-4 shrink-0" />{!sidebarCollapsed && <span>{label}</span>}</NavLink>;
        })}
      </nav>

      <button
        type="button"
        className={`mx-3 mb-2 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100 ${sidebarCollapsed ? 'justify-center px-2' : ''}`}
        onClick={() => setTheme(isDark ? 'light' : 'dark')}
        aria-label="Toggle dark mode"
        title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {isDark ? <FaSun className="h-4 w-4" /> : <FaMoon className="h-4 w-4" />}
        {!sidebarCollapsed && <span>{isDark ? 'Light mode' : 'Dark mode'}</span>}
      </button>

      <button
        type="button"
        className={`mx-3 mb-4 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-danger-dark transition hover:bg-danger-light ${sidebarCollapsed ? 'justify-center px-2' : ''}`}
        onClick={handleLogout}
        title="Sign out"
      >
        <FaSignOutAlt className="h-4 w-4" />
        {!sidebarCollapsed && <span>Sign out</span>}
      </button>
    </>
  );

  return (
    <div className="dashboard-app">
      {sidebarCollapsed && (
        <button
          type="button"
          className="fixed left-4 top-4 z-40 rounded-lg border bg-white p-2 text-slate-600 shadow-card dark:bg-slate-900 dark:text-slate-200 lg:hidden"
          onClick={() => setSidebarCollapsed(false)}
          aria-label="Open navigation menu"
          title="Open navigation menu"
        >
          <FaBars className="h-4 w-4" />
        </button>
      )}

      <aside className={`dashboard-sidebar fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r transition-all lg:flex ${sidebarCollapsed ? 'lg:w-20' : ''}`}>
        <div className="flex min-h-0 flex-1 flex-col">{renderSidebar()}</div>
      </aside>

      <div className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b bg-white/95 px-4 backdrop-blur dark:bg-slate-900/95 lg:hidden">
        <button
          type="button"
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
          onClick={() => setMobileMenuOpen(true)}
          aria-label="Open navigation menu"
        >
          <FaBars className="h-5 w-5" />
        </button>
        <div>
          <strong className="block text-sm text-slate-900 dark:text-slate-100">{pageTitle}</strong>
          <span className="block text-xs text-slate-500">{roleLabel(userProfile)}</span>
        </div>
      </div>

      {mobileMenuOpen && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 bg-slate-950/40"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close navigation menu"
          />
          <aside className="dashboard-sidebar fixed inset-y-0 left-0 z-50 flex w-72 flex-col shadow-pop">
            <div className="flex items-center justify-between border-b px-4 py-4">
              <span className="font-semibold text-slate-900 dark:text-slate-100">Navigation</span>
              <button
                type="button"
                className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close navigation menu"
              >
                <FaTimes className="h-5 w-5" />
              </button>
            </div>
            {renderSidebar()}
          </aside>
        </>
      )}

      <main className={`dashboard-content transition-[margin] lg:ml-64 ${sidebarCollapsed ? 'lg:ml-20' : ''}`}>
        <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</div>
      </main>
    </div>
  );
};

export default Layout;
