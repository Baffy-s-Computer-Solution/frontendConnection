/**
 * Parent Pages — Barrel Export
 * ============================================================================
 * Central export hub for all parent-facing pages.
 *
 * Usage:
 *   import { ParentDashboard, StudentProgress } from '@/pages/parent';
 *   // or relative:
 *   import { ParentDashboard, StudentProgress } from '../../pages/parent';
 *
 * All pages are lazy-loadable. Recommended pattern:
 *   const ParentDashboard = lazy(() => import('@/pages/parent/ParentDashboard'));
 * ============================================================================
 */

// ============================================================================
// CORE DASHBOARD & PROGRESS
// ============================================================================
export { default as ParentDashboard } from './ParentDashboard';
export { default as StudentProgress } from './StudentProgress';
export { default as ChildProfile } from './ChildProfile';
export { default as ParentProfile } from './ParentProfile';
export { default as ParentSettings } from './ParentSettings';

// ============================================================================
// COMMUNICATION & NOTIFICATIONS
// ============================================================================
export { default as CommunicationHub } from './CommunicationHub';
export { default as ParentNotifications } from './ParentNotifications';

// ============================================================================
// FINANCE & WELLBEING
// ============================================================================
export { default as FinancialPlanning } from './FinancialPlanning';
export { default as WellbeingMonitor } from './WellbeingMonitor';
export { default as ParentHealthRecords } from './ParentHealthRecords';
export { default as ParentAnalytics } from './ParentAnalytics';
export { default as ParentMarketplace } from './ParentMarketplace';
export { default as ParentVolunteerBoard } from './ParentVolunteerBoard';
export { default as FamilyEmergencyCenter } from './FamilyEmergencyCenter';
export { default as ParentRewards } from './ParentRewards';

// ============================================================================
// GUIDANCE & SCHEDULING
// ============================================================================
export { default as CareerGuidance } from './CareerGuidance';
export { default as ParentMeetings } from './ParentMeetings';
export { default as AcademicCalendar } from './AcademicCalendar';

// ============================================================================
// VAULT & COMMUNITY
// ============================================================================
export { default as ParentDocuments } from './ParentDocuments';
export { default as ParentCommunity } from './ParentCommunity';

// ============================================================================
// AGGREGATED METADATA (used for navigation, breadcrumbs, role guards)
// ============================================================================
export const PARENT_PAGES = [
  {
    key: 'dashboard',
    name: 'Dashboard',
    path: '/parent/dashboard',
    component: 'ParentDashboard',
    icon: '🏠',
    description: 'Overview of children, meetings, expenses, and alerts',
    group: 'core',
  },
  {
    key: 'student-progress',
    name: 'Student Progress',
    path: '/parent/student-progress',
    component: 'StudentProgress',
    icon: '📊',
    description: 'Grades, attendance, assignments, milestones',
    group: 'core',
  },
  {
    key: 'child-profile',
    name: 'Child Profile',
    path: '/parent/child-profile',
    component: 'ChildProfile',
    icon: '🧒',
    description: 'Per-child academic, wellbeing, teacher, and health details',
    group: 'core',
  },
  {
    key: 'profile',
    name: 'Profile',
    path: '/parent/profile',
    component: 'ParentProfile',
    icon: '👤',
    description: 'Parent profile, emergency contacts, and account details',
    group: 'core',
  },
  {
    key: 'settings',
    name: 'Settings',
    path: '/parent/settings',
    component: 'ParentSettings',
    icon: '⚙️',
    description: 'Preferences, security, privacy, data export, account controls',
    group: 'core',
  },
  {
    key: 'communication',
    name: 'Communication Hub',
    path: '/parent/communication-hub',
    component: 'CommunicationHub',
    icon: '💬',
    description: 'Messages, contacts, groups, announcements',
    group: 'connect',
  },
  {
    key: 'notifications',
    name: 'Notifications',
    path: '/parent/notifications',
    component: 'ParentNotifications',
    icon: '🔔',
    description: 'Notification center and preferences',
    group: 'connect',
  },
  {
    key: 'finance',
    name: 'Financial Planning',
    path: '/parent/financial-planning',
    component: 'FinancialPlanning',
    icon: '💰',
    description: 'Budgets, expenses, invoices, payments, goals',
    group: 'money',
  },
  {
    key: 'health-records',
    name: 'Health Records',
    path: '/parent/health-records',
    component: 'ParentHealthRecords',
    icon: '🩺',
    description: 'Immunizations, medications, allergies, and doctor visits',
    group: 'care',
  },
  {
    key: 'wellbeing',
    name: 'Wellbeing Monitor',
    path: '/parent/wellbeing-monitor',
    component: 'WellbeingMonitor',
    icon: '💚',
    description: 'Mood tracking, alerts, interventions',
    group: 'care',
  },
  {
    key: 'career',
    name: 'Career Guidance',
    path: '/parent/career-guidance',
    component: 'CareerGuidance',
    icon: '🎓',
    description: 'Career paths, skill gaps, mentors',
    group: 'care',
  },
  {
    key: 'analytics',
    name: 'Parent Analytics',
    path: '/parent/analytics',
    component: 'ParentAnalytics',
    icon: '📈',
    description: 'Cross-child averages, trend analysis, and engagement insights',
    group: 'care',
  },
  {
    key: 'marketplace',
    name: 'Marketplace',
    path: '/parent/marketplace',
    component: 'ParentMarketplace',
    icon: '🛍️',
    description: 'Buy, sell, and trade school essentials with the parent community',
    group: 'community',
  },
  {
    key: 'volunteer-board',
    name: 'Volunteer Board',
    path: '/parent/volunteer-board',
    component: 'ParentVolunteerBoard',
    icon: '🤝',
    description: 'Coordinate parent volunteer opportunities and school support',
    group: 'community',
  },
  {
    key: 'family-emergency-center',
    name: 'Emergency Center',
    path: '/parent/family-emergency-center',
    component: 'FamilyEmergencyCenter',
    icon: '🚨',
    description: 'Quick access to emergency contacts, safety plans, and critical family details',
    group: 'care',
  },
  {
    key: 'rewards',
    name: 'Rewards & Recognition',
    path: '/parent/rewards',
    component: 'ParentRewards',
    icon: '🏆',
    description: 'Track family achievements, encouragement rewards, and milestones',
    group: 'care',
  },
  {
    key: 'calendar',
    name: 'Academic Calendar',
    path: '/parent/calendar',
    component: 'AcademicCalendar',
    icon: '📅',
    description: 'School dates, exams, holidays, reminders, and events',
    group: 'schedule',
  },
  {
    key: 'meetings',
    name: 'Meetings',
    path: '/parent/meetings',
    component: 'ParentMeetings',
    icon: '📅',
    description: 'Teacher meetings, minutes, follow-ups',
    group: 'schedule',
  },
  {
    key: 'documents',
    name: 'Document Vault',
    path: '/parent/documents',
    component: 'ParentDocuments',
    icon: '📁',
    description: 'Secure document storage with expiry tracking',
    group: 'assets',
  },
  {
    key: 'community',
    name: 'Parent Community',
    path: '/parent/community',
    component: 'ParentCommunity',
    icon: '👥',
    description: 'Social feed, groups, events, trending',
    group: 'connect',
  },
];

// Group metadata for sidebar / menu rendering
export const PARENT_PAGE_GROUPS = [
  { id: 'core', label: 'Overview', order: 1 },
  { id: 'connect', label: 'Connect', order: 2 },
  { id: 'money', label: 'Finance', order: 3 },
  { id: 'care', label: 'Care & Growth', order: 4 },
  { id: 'community', label: 'Community', order: 5 },
  { id: 'schedule', label: 'Schedule', order: 6 },
  { id: 'assets', label: 'Assets', order: 7 },
];

// Quick lookup helper
export const getParentPage = (key) => PARENT_PAGES.find((p) => p.key === key);

// Grouped pages helper
export const getParentPagesByGroup = (groupId) =>
  PARENT_PAGES.filter((p) => p.group === groupId);

// Default export = full namespace (optional convenience)
const ParentPages = {
  ParentDashboard: () => import('./ParentDashboard'),
  StudentProgress: () => import('./StudentProgress'),
  ChildProfile: () => import('./ChildProfile'),
  ParentProfile: () => import('./ParentProfile'),
  ParentSettings: () => import('./ParentSettings'),
  CommunicationHub: () => import('./CommunicationHub'),
  ParentNotifications: () => import('./ParentNotifications'),
  FinancialPlanning: () => import('./FinancialPlanning'),
  WellbeingMonitor: () => import('./WellbeingMonitor'),
  ParentHealthRecords: () => import('./ParentHealthRecords'),
  ParentAnalytics: () => import('./ParentAnalytics'),
  CareerGuidance: () => import('./CareerGuidance'),
  ParentMeetings: () => import('./ParentMeetings'),
  AcademicCalendar: () => import('./AcademicCalendar'),
  ParentDocuments: () => import('./ParentDocuments'),
  ParentCommunity: () => import('./ParentCommunity'),
};

export default ParentPages;