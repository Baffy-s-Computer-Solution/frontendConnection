import { useEffect, useMemo, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { FaAward, FaBars, FaBell, FaBriefcase, FaBuilding, FaCalendarAlt, FaChartLine, FaChevronLeft, FaChevronRight, FaChalkboardTeacher, FaCog, FaComments, FaFileAlt, FaGraduationCap, FaHome, FaMoon, FaPlus, FaRocket, FaSchool, FaSearch, FaShieldAlt, FaSignOutAlt, FaSun, FaUser, FaUsers, FaUserShield, FaVideo } from "react-icons/fa";

import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { normalizeUserType } from "../../utils/authRoleUtils";
import { ROUTES } from "../../routing/utils/routeConstants";

const ROLE_NAVIGATION = {
  admin: [
    { label: "Dashboard", path: ROUTES.ADMIN.DASHBOARD, icon: FaHome },
    { label: "Users", path: ROUTES.ADMIN.USERS, icon: FaUser },
    { label: "Companies", path: ROUTES.ADMIN.COMPANIES, icon: FaBuilding },
    { label: "Jobs", path: ROUTES.ADMIN.JOBS, icon: FaBriefcase },
    {
      label: "Pending approvals",
      path: ROUTES.ADMIN.PENDING_APPROVALS,
      icon: FaUsers,
    },
    { label: "Analytics", path: ROUTES.ADMIN.ANALYTICS, icon: FaChartLine },
    { label: "Admissions", path: ROUTES.ADMIN.ADMISSIONS, icon: FaSchool },
    { label: "Search users", path: ROUTES.ADMIN.SEARCH.USERS, icon: FaSearch },
    {
      label: "Search companies",
      path: ROUTES.ADMIN.SEARCH.COMPANIES,
      icon: FaBuilding,
    },
    {
      label: "Search applications",
      path: ROUTES.ADMIN.SEARCH.APPLICATIONS,
      icon: FaFileAlt,
    },
    { label: "Audit log", path: ROUTES.ADMIN.AUDIT, icon: FaShieldAlt },
    {
      label: "System settings",
      path: ROUTES.ADMIN.SYSTEM_SETTINGS,
      icon: FaCog,
    },
    { label: "Profile", path: ROUTES.ADMIN.PROFILE, icon: FaUserShield },
    { label: "Settings", path: ROUTES.SETTINGS, icon: FaCog },
  ],
  student: [
    { label: "Dashboard", path: ROUTES.STUDENT_DASHBOARD, icon: FaHome },
    { label: "Profile", path: ROUTES.STUDENT.PROFILE, icon: FaUser },
    { label: "Jobs", path: ROUTES.STUDENT.JOBS, icon: FaBriefcase },
    {
      label: "Internships",
      path: ROUTES.STUDENT.SEARCH.INTERNSHIPS,
      icon: FaBriefcase,
    },
    {
      label: "Applications",
      path: ROUTES.STUDENT.APPLICATIONS,
      icon: FaFileAlt,
    },
    { label: "Documents", path: ROUTES.STUDENT.DOCUMENTS, icon: FaFileAlt },
    { label: "Courses", path: ROUTES.STUDENT.COURSES, icon: FaGraduationCap },
    {
      label: "Mentorship",
      path: ROUTES.STUDENT.MENTORSHIP,
      icon: FaChalkboardTeacher,
    },
    { label: "Friends", path: "/student/friends", icon: FaUsers },
    { label: "Analytics", path: ROUTES.STUDENT.ANALYTICS, icon: FaChartLine },
    { label: "Job matches", path: ROUTES.STUDENT.JOB_MATCHES, icon: FaChartLine },
    { label: "Performance", path: ROUTES.STUDENT.PERFORMANCE, icon: FaChartLine },
    { label: "Settings", path: ROUTES.SETTINGS, icon: FaCog },
  ],
  company: [
    { label: "Dashboard", path: ROUTES.COMPANY.DASHBOARD, icon: FaHome },
    { label: "Profile", path: ROUTES.COMPANY.PROFILE, icon: FaBuilding },
    { label: "Jobs", path: ROUTES.COMPANY.JOBS, icon: FaBriefcase },
    { label: "Create job", path: ROUTES.COMPANY.CREATE_JOB, icon: FaPlus },
    {
      label: "Applications",
      path: ROUTES.COMPANY.APPLICATIONS,
      icon: FaFileAlt,
    },
    { label: "Candidates", path: ROUTES.COMPANY.CANDIDATES, icon: FaUsers },
    { label: "Analytics", path: ROUTES.COMPANY.ANALYTICS, icon: FaChartLine },
    { label: "Teams", path: ROUTES.COMPANY.TEAMS, icon: FaUsers },
    { label: "Documents", path: ROUTES.COMPANY.DOCUMENTS, icon: FaFileAlt },
    { label: "Chat", path: ROUTES.COMPANY.CHAT, icon: FaComments },
    { label: "Followers", path: ROUTES.COMPANY.FOLLOWERS, icon: FaUsers },
    { label: "Friends", path: "/company/friends", icon: FaUsers },
    { label: "AI matching", path: ROUTES.COMPANY.AI_MATCHING, icon: FaRocket },
    {
      label: "Video interviews",
      path: ROUTES.COMPANY.VIDEO_INTERVIEWS,
      icon: FaVideo,
    },
    { label: "Branding", path: ROUTES.COMPANY.BRANDING, icon: FaBuilding },
    {
      label: "Diversity",
      path: ROUTES.COMPANY.DIVERSITY_ANALYTICS,
      icon: FaUsers,
    },
    { label: "Talent pool", path: ROUTES.COMPANY.TALENT_POOL, icon: FaUser },
    { label: "Assessments", path: ROUTES.COMPANY.ASSESSMENTS, icon: FaFileAlt },
    { label: "Referrals", path: ROUTES.COMPANY.REFERRALS, icon: FaUsers },
    { label: "Settings", path: ROUTES.SETTINGS, icon: FaCog },
  ],
  institute: [
    { label: "Dashboard", path: ROUTES.INSTITUTE.DASHBOARD, icon: FaHome },
    { label: "Profile", path: ROUTES.INSTITUTE.PROFILE, icon: FaSchool },
    { label: "Courses", path: ROUTES.INSTITUTE.COURSES, icon: FaGraduationCap },
    { label: "Faculties", path: ROUTES.INSTITUTE.FACULTIES, icon: FaSchool },
    { label: "Students", path: ROUTES.INSTITUTE.STUDENTS, icon: FaUsers },
    {
      label: "Applications",
      path: ROUTES.INSTITUTE.APPLICATIONS,
      icon: FaFileAlt,
    },
    { label: "Analytics", path: ROUTES.INSTITUTE.ANALYTICS, icon: FaChartLine },
    {
      label: "Placements",
      path: ROUTES.INSTITUTE.PLACEMENTS,
      icon: FaBriefcase,
    },
    { label: "Settings", path: ROUTES.INSTITUTE.SETTINGS, icon: FaCog },
  ],
  mentor: [
    { label: "Dashboard", path: ROUTES.MENTOR.DASHBOARD, icon: FaHome },
    {
      label: "Profile",
      path: ROUTES.MENTOR.PROFILE,
      icon: FaChalkboardTeacher,
    },
    { label: "Sessions", path: ROUTES.MENTOR.SESSIONS, icon: FaUsers },
    {
      label: "Applications",
      path: ROUTES.MENTOR.APPLICATIONS,
      icon: FaFileAlt,
    },
    { label: "Mentees", path: ROUTES.MENTOR.MENTEES, icon: FaUsers },
    { label: "Friends", path: "/mentor/friends", icon: FaUsers },
    { label: "Earnings", path: ROUTES.MENTOR.EARNINGS, icon: FaChartLine },
    { label: "Schedule", path: ROUTES.MENTOR.SCHEDULE, icon: FaCalendarAlt },
    { label: "Resources", path: ROUTES.MENTOR.RESOURCES, icon: FaFileAlt },
    { label: "Reviews", path: ROUTES.MENTOR.REVIEWS, icon: FaAward },
    { label: "Settings", path: ROUTES.MENTOR.SETTINGS, icon: FaCog },
  ],
  youth: [
    { label: "Dashboard", path: ROUTES.YOUTH.DASHBOARD, icon: FaHome },
    { label: "Profile", path: ROUTES.YOUTH.PROFILE, icon: FaRocket },
    { label: "Business", path: ROUTES.YOUTH.BUSINESS, icon: FaBriefcase },
    { label: "Funding", path: ROUTES.YOUTH.FUNDING, icon: FaChartLine },
    { label: "Achievements", path: ROUTES.YOUTH.ACHIEVEMENTS, icon: FaAward },
    { label: "Portfolio", path: ROUTES.YOUTH.PORTFOLIO, icon: FaFileAlt },
    { label: "Skills", path: ROUTES.YOUTH.SKILLS, icon: FaGraduationCap },
    { label: "Mentorship", path: ROUTES.YOUTH.MENTORSHIP, icon: FaUsers },
    { label: "Resources", path: ROUTES.YOUTH.RESOURCES, icon: FaSchool },
    { label: "Network", path: ROUTES.YOUTH.NETWORK, icon: FaUsers },
    { label: "Settings", path: ROUTES.SETTINGS, icon: FaCog },
  ],
  entrepreneur: [
    { label: "Dashboard", path: ROUTES.ENTREPRENEUR_DASHBOARD, icon: FaHome },
    { label: "Profile", path: "/entrepreneur/profile", icon: FaRocket },
    { label: "Hub", path: "/entrepreneur-hub/dashboard", icon: FaBriefcase },
    {
      label: "Analytics",
      path: "/entrepreneur-hub/analytics",
      icon: FaChartLine,
    },
    {
      label: "Applications",
      path: "/entrepreneur-hub/applications",
      icon: FaFileAlt,
    },
    { label: "Funding", path: "/entrepreneur-hub/funding", icon: FaBriefcase },
    {
      label: "Portfolio",
      path: "/entrepreneur-hub/portfolio",
      icon: FaFileAlt,
    },
    { label: "Mentors", path: "/entrepreneur-hub/mentors", icon: FaUsers },
    { label: "Reviews", path: "/entrepreneur-hub/review", icon: FaAward },
    { label: "Settings", path: ROUTES.SETTINGS, icon: FaCog },
  ],
  parent: [
    { label: "Dashboard", path: "/parent/dashboard", icon: FaHome },
    {
      label: "Student progress",
      path: "/parent/student-progress",
      icon: FaChartLine,
    },
    { label: "Wellbeing", path: "/parent/wellbeing-monitor", icon: FaUsers },
    {
      label: "Career guidance",
      path: "/parent/career-guidance",
      icon: FaGraduationCap,
    },
    {
      label: "Financial planning",
      path: "/parent/financial-planning",
      icon: FaBriefcase,
    },
    {
      label: "Communication",
      path: "/parent/communication-hub",
      icon: FaComments,
    },
    { label: "Settings", path: ROUTES.SETTINGS, icon: FaCog },
  ],
  alumni: [
    { label: "Dashboard", path: "/alumni/dashboard", icon: FaHome },
    { label: "Profile", path: "/alumni/profile", icon: FaUser },
    { label: "Network", path: "/alumni/network", icon: FaUsers },
    { label: "Events", path: "/alumni/events", icon: FaCalendarAlt },
    {
      label: "Mentorship",
      path: "/alumni/mentorship",
      icon: FaChalkboardTeacher,
    },
    { label: "Settings", path: "/alumni/settings", icon: FaCog },
  ],
};

const getInitials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "CC";

const roleLabel = (userProfile) => {
  const rawUserType = userProfile?.userType || userProfile?.role || "student";
  const userType = normalizeUserType(rawUserType);
  if (!userType) return "Member";
  return userType.charAt(0).toUpperCase() + userType.slice(1).toLowerCase();
};

export default function Sidebar() {
  const { userProfile, currentUser, logout } = useAuth();
  const { isDark, setTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth < 1024 : false,
  );

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!isMobile) setMobileOpen(false);
  }, [isMobile, location.pathname]);

  const userType = useMemo(() => {
    const rawUserType =
      userProfile?.userType ||
      userProfile?.role ||
      currentUser?.userType ||
      "student";
    return normalizeUserType(rawUserType);
  }, [currentUser?.userType, userProfile?.role, userProfile?.userType]);

  const navigationItems = useMemo(
    () => ROLE_NAVIGATION[userType] || ROLE_NAVIGATION.student,
    [userType],
  );

  const displayName =
    userProfile?.displayName ||
    userProfile?.fullName ||
    currentUser?.displayName ||
    currentUser?.email?.split("@")[0] ||
    "Career Connect User";

  const currentPageTitle = useMemo(() => {
    const activeItem = navigationItems.find(
      (item) =>
        location.pathname === item.path ||
        (item.path !== "/" && location.pathname.startsWith(`${item.path}/`)),
    );

    return activeItem?.label || "Workspace";
  }, [location.pathname, navigationItems]);

  const handleLogout = async () => {
    setMobileOpen(false);
    await logout();
    navigate("/login");
  };

  const sidebarWidthClass = collapsed ? "lg:w-20" : "lg:w-72";

  return (
    <>
      <style>{`
        .career-sidebar-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgba(148, 163, 184, 0.9) transparent;
        }

        .career-sidebar-scrollbar::-webkit-scrollbar {
          width: 8px;
        }

        .career-sidebar-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }

        .career-sidebar-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(148, 163, 184, 0.9);
          border-radius: 9999px;
        }

        .career-sidebar-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(100, 116, 139, 0.95);
        }

        :root.dark .career-sidebar-scrollbar {
          scrollbar-color: rgba(71, 85, 105, 0.9) transparent;
        }

        :root.dark .career-sidebar-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(71, 85, 105, 0.9);
        }

        :root.dark .career-sidebar-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(51, 65, 85, 1);
        }
      `}</style>

      {isMobile && (
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="fixed left-4 top-4 z-40 inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-lg transition hover:scale-[1.02] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 lg:hidden"
          aria-label="Open navigation"
        >
          <FaBars className="h-4 w-4" />
        </button>
      )}

      {isMobile && mobileOpen && (
        <button
          type="button"
          aria-label="Close navigation overlay"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-30 bg-slate-950/50 backdrop-blur-sm"
        />
      )}

      <aside
        className={[
          "fixed inset-y-0 left-0 z-40 flex flex-col border-r border-slate-200 bg-white/95 text-slate-800 shadow-xl backdrop-blur-xl transition-all duration-300 ease-out dark:border-slate-800 dark:bg-slate-950/95 dark:text-slate-100",
          isMobile
            ? mobileOpen
              ? "translate-x-0"
              : "-translate-x-full"
            : "translate-x-0",
          isMobile ? "w-72" : sidebarWidthClass,
          "lg:static lg:z-auto lg:shadow-none",
        ].join(" ")}
      >
        <div className="flex h-full min-h-0 flex-col overflow-hidden">
          <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-4 dark:border-slate-800">
            <div className="flex min-w-0 items-center gap-3">
              <img
                src="/career connect lesotho logo.jpeg"
                alt="Career Connect Lesotho"
                className="h-9 w-9 shrink-0 rounded-lg object-cover ring-2 ring-slate-200 dark:ring-slate-700"
              />
              {!collapsed && !isMobile && (
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                    Career Connect
                  </div>
                  <div className="truncate text-[11px] text-slate-500 dark:text-slate-400">
                    Lesotho workspace
                  </div>
                </div>
              )}
            </div>

            {!isMobile && (
              <button
                type="button"
                onClick={() => setCollapsed((prev) => !prev)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                {collapsed ? (
                  <FaChevronRight className="h-4 w-4" />
                ) : (
                  <FaChevronLeft className="h-4 w-4" />
                )}
              </button>
            )}
          </div>

          <div className="flex items-center gap-3 border-b border-slate-200 px-4 py-4 dark:border-slate-800">
            {userProfile?.photoURL || userProfile?.profilePhoto || currentUser?.photoURL ? (
              <img
                src={userProfile?.photoURL || userProfile?.profilePhoto || currentUser?.photoURL}
                alt={displayName}
                className="h-10 w-10 rounded-full object-cover ring-2 ring-slate-200 dark:ring-slate-700"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700 dark:bg-brand-950 dark:text-brand-200">
                {getInitials(displayName)}
              </div>
            )}

            {!collapsed && !isMobile && (
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {displayName}
                </div>
                <div className="truncate text-[11px] text-slate-500 dark:text-slate-400">
                  {currentUser?.email || "careerconnect@example.com"}
                </div>
                <div className="mt-0.5 text-[11px] font-medium text-brand-600 dark:text-brand-400">
                  {roleLabel(userProfile)}
                </div>
              </div>
            )}
          </div>

          <nav
            aria-label="Primary navigation"
            className="career-sidebar-scrollbar flex-1 overflow-y-auto px-3 py-4"
          >
            <div className="space-y-1">
              {navigationItems.map(({ label, path, icon: Icon }) => {
                const isActive =
                  location.pathname === path ||
                  (path !== "/" && location.pathname.startsWith(`${path}/`));

                return (
                  <NavLink
                    key={path}
                    to={path}
                    onClick={() => setMobileOpen(false)}
                    title={collapsed ? label : undefined}
                    className={({ isActive: activeRoute }) =>
                      [
                        "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                        collapsed ? "justify-center px-2" : "",
                        activeRoute
                          ? "bg-brand-50 text-brand-700 shadow-sm ring-1 ring-brand-200 dark:bg-brand-950/80 dark:text-brand-200 dark:ring-brand-900"
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white",
                      ].join(" ")
                    }
                    aria-current={isActive ? "page" : undefined}
                  >
                    {({ isActive: activeRoute }) => (
                      <>
                        <Icon
                          className={[
                            "h-4 w-4 shrink-0 transition-transform duration-200",
                            activeRoute ? "scale-110" : "group-hover:scale-105",
                          ].join(" ")}
                        />
                        {!collapsed && !isMobile && <span>{label}</span>}
                      </>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </nav>

          <div className="border-t border-slate-200 px-3 py-3 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setTheme(isDark ? "light" : "dark")}
              className={[
                "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white",
                collapsed ? "justify-center px-2" : "",
              ].join(" ")}
              aria-label="Toggle dark mode"
              title={isDark ? "Switch to light mode" : "Switch to dark mode"}
            >
              {isDark ? (
                <FaSun className="h-4 w-4" />
              ) : (
                <FaMoon className="h-4 w-4" />
              )}
              {!collapsed && !isMobile && (
                <span>{isDark ? "Light mode" : "Dark mode"}</span>
              )}
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className={[
                "mt-2 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950/40 dark:hover:text-red-300",
                collapsed ? "justify-center px-2" : "",
              ].join(" ")}
              aria-label="Sign out"
              title="Sign out"
            >
              <FaSignOutAlt className="h-4 w-4" />
              {!collapsed && !isMobile && <span>Sign out</span>}
            </button>
          </div>
        </div>
      </aside>

      {!isMobile && (
        <div className="hidden border-b border-slate-200 bg-white/95 px-4 py-3 dark:border-slate-800 dark:bg-slate-950/95 lg:flex lg:items-center lg:justify-between">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
              {currentPageTitle}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {roleLabel(userProfile)}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            {isDark ? (
              <FaSun className="h-3.5 w-3.5" />
            ) : (
              <FaMoon className="h-3.5 w-3.5" />
            )}
            {isDark ? "Light mode" : "Dark mode"}
          </button>
        </div>
      )}
    </>
  );
}
