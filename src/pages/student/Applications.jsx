// frontend/src/pages/student/Applications.jsx
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
/* eslint-disable react/no-unescaped-entities */
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Badge,
  Button,
  Form,
  InputGroup,
  Dropdown,
  Alert,
  Spinner,
  Modal,
  Pagination,
  ProgressBar,
  ListGroup,
  Nav,
  Tab,
  Tabs,
  OverlayTrigger,
  Tooltip,
  ButtonGroup,
  FloatingLabel,
  Toast,
  ToastContainer,
  Accordion,
  Navbar,
} from '../../components/ui/tailwindCompat';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
  addDoc,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  limit,
  startAfter,
  writeBatch,
  increment,
} from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import {
  FiSearch,
  FiFilter,
  FiEye,
  FiTrash2,
  FiDownload,
  FiShare2,
  FiEdit,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiAlertCircle,
  FiCalendar,
  FiBriefcase,
  FiChevronRight,
  FiChevronLeft,
  FiRefreshCw,
  FiPlus,
  FiFileText,
  FiExternalLink,
  FiCopy,
  FiArchive,
  FiMessageSquare,
  FiStar,
  FiHeart,
  FiUser,
  FiMapPin,
  FiDollarSign,
  FiTrendingUp,
  FiArrowRight,
  FiMoreVertical,
  FiMoreHorizontal,
  FiSend,
  FiInbox,
  FiFolder,
  FiBookmark,
  FiX,
  FiCheck,
  FiInfo,
  FiLink,
  FiMail,
  FiPhone,
  FiGlobe,
  FiLinkedin,
  FiGithub,
  FiTwitter,
  FiFacebook,
  FiInstagram,
  FiYoutube,
  FiSliders,
  FiGrid,
  FiList,
  FiColumns,
  FiMaximize,
  FiMinimize,
  FiUploadCloud,
  FiDownloadCloud,
  FiRotateCcw,
  FiRotateCw,
  FiPlay,
  FiPause,
  FiSkipBack,
  FiSkipForward,
  FiVolume2,
  FiVolumeX,
  FiBell,
  FiBellOff,
  FiBookmark as FiBookmarkIcon,
  FiAward,
  FiTarget,
  FiFlag,
  FiZap,
  FiActivity,
  FiBarChart2,
  FiPieChart,
  FiTrendingDown,
  FiSlash,
  FiCheckSquare,
  FiSquare,
  FiEdit2,
  FiEdit3,
  FiSave,
  FiPackage,
  FiCoffee,
  FiSun,
  FiMoon,
  FiCloud,
  FiCloudRain,
  FiUmbrella,
  FiFeather,
  FiAnchor,
  FiCompass,
  FiNavigation,
  FiHome,
  FiKey,
  FiLock,
  FiUnlock,
  FiShield,
  FiUsers,
  FiUserCheck,
  FiUserPlus,
  FiUserMinus,
  FiUserX,
  FiUserPlus as FiUserPlusIcon,
  FiUserCheck as FiUserCheckIcon,
  FiUserX as FiUserXIcon,
  FiMessageCircle,
  FiThumbsUp,
  FiThumbsDown,
  FiShare,
  FiCornerUpRight,
  FiCornerUpLeft,
  FiBookOpen,
  FiBook,
  FiAward as FiAwardIcon,
  FiGift,
  FiCoffee as FiCoffeeIcon,
  FiCamera,
  FiVideo,
  FiMic,
  FiHeadphones,
  FiSpeaker,
  FiMonitor,
  FiSmartphone,
  FiTablet,
  FiWatch,
  FiCpu,
  FiHardDrive as FiStorage,
  FiServer,
  FiDatabase,
  FiWifi,
  FiBluetooth,
  FiPower,
  FiBattery,
  FiBatteryCharging,
  FiZapOff,
  FiThermometer,
  FiDroplet,
  FiWind,
} from 'react-icons/fi';
import {
  MdAssignment,
  MdWork,
  MdBusiness,
  MdLocationOn,
  MdAccessTime,
  MdOutlineAssignment,
  MdOutlineWorkOutline,
  MdOutlineBusinessCenter,
  MdOutlineLocationOn,
  MdOutlineSchedule,
  MdOutlineCheckCircle,
  MdOutlineCancel,
  MdOutlineHourglassEmpty,
  MdOutlinePendingActions,
  MdOutlineSync,
  MdOutlineSyncProblem,
  MdOutlineUpdate,
  MdOutlineHistory,
  MdOutlineRestore,
  MdOutlineDeleteOutline,
  MdOutlineArchive as MdOutlineArchiveIcon,
  MdOutlineUnarchive,
  MdOutlineFolderOpen,
  MdOutlineFolder,
  MdOutlineAttachFile,
  MdOutlineAttachment,
  MdOutlineLink,
  MdOutlineInsertLink,
  MdOutlineContentCopy,
  MdOutlineDownload,
  MdOutlineUpload,
  MdOutlinePrint,
  MdOutlineSave,
  MdOutlineEdit,
  MdOutlineEditNote,
  MdOutlinePreview,
  MdOutlineVisibility,
  MdOutlineRemoveRedEye,
  MdOutlineScreenShare,
  MdOutlineShare,
  MdOutlineIosShare,
  MdOutlineSend,
  MdOutlineEmail,
  MdOutlineMailOutline,
  MdOutlineChat,
  MdOutlineComment,
  MdOutlineQuestionAnswer,
  MdOutlineFeedback,
  MdOutlineRateReview,
  MdOutlineReviews,
  MdOutlineStars,
  MdOutlineThumbUp,
  MdOutlineThumbDown,
  MdOutlineFavorite,
  MdOutlineFavoriteBorder,
  MdOutlineBookmark,
  MdOutlineBookmarkBorder,
  MdOutlineBookmarkAdd,
  MdOutlineBookmarkAdded,
  MdOutlineBookmarkRemove,
  MdOutlineLabelImportant,
  MdOutlineFlag,
  MdOutlineOutlinedFlag,
  MdOutlineTour,
  MdOutlinePerson,
  MdOutlineGroup,
  MdOutlineGroups,
  MdOutlineBusiness,
  MdOutlineSchool,
  MdOutlineBadge,
  MdOutlineCardMembership,
  MdOutlineWorkspacePremium,
  MdOutlineMilitaryTech,
  MdOutlineEmojiEvents,
  MdOutlineLocalActivity,
  MdOutlineSportsScore,
  MdOutlineInsights,
  MdOutlineAnalytics,
  MdOutlineQueryStats,
  MdOutlineAutoGraph,
  MdOutlineTimeline,
  MdOutlineTrendingUp,
  MdOutlineTrendingDown,
  MdOutlineTrendingFlat,
  MdOutlineShowChart,
  MdOutlineStackedLineChart,
  MdOutlineBarChart,
  MdOutlinePieChart,
  MdOutlineDataUsage,
  MdOutlineQueryBuilder,
  MdOutlineSearch,
  MdOutlineFilterAlt,
  MdOutlineFilterList,
  MdOutlineSort,
  MdOutlineSwapVert,
  MdOutlineSwapHoriz,
  MdOutlineLowPriority,
  MdPriorityHigh,
  MdOutlinePriorityHigh,
  MdOutlineVerified,
  MdOutlineReport,
  MdOutlineWarning,
  MdOutlineWarningAmber,
  MdOutlineError,
  MdOutlineErrorOutline,
  MdOutlineInfo,
  MdOutlineHelp,
  MdOutlineSupport,
  MdOutlineContactSupport,
  MdOutlineSettings,
  MdOutlineTune,
  MdOutlineConstruction,
  MdOutlineBuild,
  MdOutlineArchitecture,
  MdOutlineDesignServices,
  MdOutlineDraw,
  MdOutlineBrush,
  MdOutlineFormatPaint,
  MdOutlineColorLens,
  MdOutlinePalette,
  MdOutlineGridView,
  MdOutlineViewModule,
  MdOutlineViewList,
  MdOutlineViewStream,
  MdOutlineViewWeek,
  MdOutlineViewDay,
  MdOutlineViewAgenda,
  MdOutlineViewColumn,
  MdOutlineViewCompact,
  MdOutlineDashboard,
  MdOutlineSpaceDashboard,
  MdOutlineWindow,
  MdOutlineWeb,
  MdOutlinePublic,
  MdOutlineLanguage,
  MdOutlineTranslate,
} from 'react-icons/md';

import { auth, db } from '../../config/firebase';
import { useAuth } from '../../context/AuthContext';
import { useStudent } from '../../context/StudentContext';
import { useNotification } from '../../context/NotificationContext';
import applicationService from '../../services/applicationService';
import notificationService from '../../services/notificationService';
import emailService from '../../services/emailService';
import supabaseService from '../../services/supabaseService';

// ============================================
// CONSTANTS
// ============================================

const APPLICATION_STATUS = {
  DRAFT: 'draft',
  SUBMITTED: 'submitted',
  PENDING: 'pending',
  UNDER_REVIEW: 'under_review',
  SHORTLISTED: 'shortlisted',
  INTERVIEW: 'interview',
  INTERVIEW_SCHEDULED: 'interview_scheduled',
  ASSESSMENT: 'assessment',
  OFFER: 'offer',
  OFFER_EXTENDED: 'offer_extended',
  ACCEPTED: 'accepted',
  HIRED: 'hired',
  REJECTED: 'rejected',
  DECLINED: 'declined',
  WITHDRAWN: 'withdrawn',
  EXPIRED: 'expired',
  ON_HOLD: 'on_hold',
};

const APPLICATION_TYPES = {
  JOB: 'job',
  INTERNSHIP: 'internship',
  SCHOLARSHIP: 'scholarship',
  COURSE: 'course',
  MENTORSHIP: 'mentorship',
  VOLUNTEER: 'volunteer',
  FELLOWSHIP: 'fellowship',
  COMPETITION: 'competition',
};

const STATUS_CONFIG = {
  [APPLICATION_STATUS.DRAFT]: { bg: 'secondary', label: 'Draft', color: '#64748b' },
  [APPLICATION_STATUS.SUBMITTED]: { bg: 'info', label: 'Submitted', color: '#0891b2' },
  [APPLICATION_STATUS.PENDING]: { bg: 'warning', label: 'Pending', color: '#f59e0b' },
  [APPLICATION_STATUS.UNDER_REVIEW]: { bg: 'info', label: 'Under Review', color: '#2563eb' },
  [APPLICATION_STATUS.SHORTLISTED]: { bg: 'primary', label: 'Shortlisted', color: '#7c3aed' },
  [APPLICATION_STATUS.INTERVIEW]: { bg: 'info', label: 'Interview', color: '#0891b2' },
  [APPLICATION_STATUS.INTERVIEW_SCHEDULED]: { bg: 'primary', label: 'Interview Scheduled', color: '#2563eb' },
  [APPLICATION_STATUS.ASSESSMENT]: { bg: 'warning', label: 'Assessment', color: '#f59e0b' },
  [APPLICATION_STATUS.OFFER]: { bg: 'success', label: 'Offer', color: '#10b981' },
  [APPLICATION_STATUS.OFFER_EXTENDED]: { bg: 'success', label: 'Offer Extended', color: '#059669' },
  [APPLICATION_STATUS.ACCEPTED]: { bg: 'success', label: 'Accepted', color: '#10b981' },
  [APPLICATION_STATUS.HIRED]: { bg: 'success', label: 'Hired', color: '#059669' },
  [APPLICATION_STATUS.REJECTED]: { bg: 'danger', label: 'Rejected', color: '#dc2626' },
  [APPLICATION_STATUS.DECLINED]: { bg: 'danger', label: 'Declined', color: '#b91c1c' },
  [APPLICATION_STATUS.WITHDRAWN]: { bg: 'dark', label: 'Withdrawn', color: '#334155' },
  [APPLICATION_STATUS.EXPIRED]: { bg: 'secondary', label: 'Expired', color: '#64748b' },
  [APPLICATION_STATUS.ON_HOLD]: { bg: 'warning', label: 'On Hold', color: '#ea580c' },
};

const STATUS_ORDER = [
  APPLICATION_STATUS.DRAFT,
  APPLICATION_STATUS.SUBMITTED,
  APPLICATION_STATUS.PENDING,
  APPLICATION_STATUS.UNDER_REVIEW,
  APPLICATION_STATUS.SHORTLISTED,
  APPLICATION_STATUS.INTERVIEW,
  APPLICATION_STATUS.INTERVIEW_SCHEDULED,
  APPLICATION_STATUS.ASSESSMENT,
  APPLICATION_STATUS.OFFER,
  APPLICATION_STATUS.OFFER_EXTENDED,
  APPLICATION_STATUS.ACCEPTED,
  APPLICATION_STATUS.HIRED,
  APPLICATION_STATUS.REJECTED,
  APPLICATION_STATUS.DECLINED,
  APPLICATION_STATUS.WITHDRAWN,
  APPLICATION_STATUS.EXPIRED,
  APPLICATION_STATUS.ON_HOLD,
];

const FILTER_STATUS_GROUPS = {
  all: 'All',
  active: 'Active',
  pending: 'Pending Review',
  interview: 'Interviewing',
  offers: 'Offers',
  accepted: 'Accepted',
  rejected: 'Rejected',
  withdrawn: 'Withdrawn',
};

const SORT_OPTIONS = {
  NEWEST: 'newest',
  OLDEST: 'oldest',
  STATUS: 'status',
  DEADLINE: 'deadline',
  TITLE: 'title',
  COMPANY: 'company',
};

const ITEMS_PER_PAGE = 10;
const MAX_BATCH_SIZE = 500;

// ============================================
// HELPER FUNCTIONS
// ============================================

const formatDate = (date) => {
  if (!date) return 'N/A';

  try {
    let d;
    if (date instanceof Timestamp) d = date.toDate();
    else if (date?.toDate) d = date.toDate();
    else if (typeof date === 'string') d = new Date(date);
    else if (date instanceof Date) d = date;
    else d = new Date(date);

    if (isNaN(d.getTime())) return 'N/A';

    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch (error) {
    return 'N/A';
  }
};

const formatDateTime = (date) => {
  if (!date) return 'N/A';

  try {
    let d;
    if (date instanceof Timestamp) d = date.toDate();
    else if (date?.toDate) d = date.toDate();
    else if (typeof date === 'string') d = new Date(date);
    else d = new Date(date);

    if (isNaN(d.getTime())) return 'N/A';

    return d.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch (error) {
    return 'N/A';
  }
};

const formatRelativeTime = (date) => {
  if (!date) return 'N/A';

  try {
    let d;
    if (date instanceof Timestamp) d = date.toDate();
    else if (date?.toDate) d = date.toDate();
    else if (typeof date === 'string') d = new Date(date);
    else d = new Date(date);

    if (isNaN(d.getTime())) return 'N/A';

    const now = new Date();
    const diffMs = now - d;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    const diffWeek = Math.floor(diffDay / 7);
    const diffMonth = Math.floor(diffDay / 30);

    if (diffSec < 60) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHour < 24) return `${diffHour}h ago`;
    if (diffDay < 7) return `${diffDay}d ago`;
    if (diffWeek < 4) return `${diffWeek}w ago`;
    if (diffMonth < 12) return `${diffMonth}mo ago`;

    return d.toLocaleDateString();
  } catch (error) {
    return 'N/A';
  }
};

const daysUntil = (date) => {
  if (!date) return null;
  try {
    let d;
    if (date instanceof Timestamp) d = date.toDate();
    else if (date?.toDate) d = date.toDate();
    else if (typeof date === 'string') d = new Date(date);
    else d = new Date(date);

    const now = new Date();
    const diffMs = d - now;
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  } catch (error) {
    return null;
  }
};

const formatStatus = (status) => {
  if (!status) return 'Unknown';
  return status
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

const getStatusConfig = (status) => {
  return (
    STATUS_CONFIG[status] || {
      bg: 'secondary',
      label: formatStatus(status),
      color: '#64748b',
    }
  );
};

const getStatusIcon = (status) => {
  switch (status) {
    case APPLICATION_STATUS.ACCEPTED:
    case APPLICATION_STATUS.HIRED:
    case APPLICATION_STATUS.OFFER:
    case APPLICATION_STATUS.OFFER_EXTENDED:
      return FiCheckCircle;
    case APPLICATION_STATUS.REJECTED:
    case APPLICATION_STATUS.DECLINED:
      return FiXCircle;
    case APPLICATION_STATUS.PENDING:
    case APPLICATION_STATUS.UNDER_REVIEW:
      return FiClock;
    case APPLICATION_STATUS.INTERVIEW:
    case APPLICATION_STATUS.INTERVIEW_SCHEDULED:
      return FiMessageSquare;
    case APPLICATION_STATUS.WITHDRAWN:
      return FiArchive;
    case APPLICATION_STATUS.EXPIRED:
      return FiAlertCircle;
    default:
      return FiFileText;
  }
};

const getApplicationTypeIcon = (type) => {
  switch (type) {
    case APPLICATION_TYPES.JOB:
      return FiBriefcase;
    case APPLICATION_TYPES.INTERNSHIP:
      return FiAward;
    case APPLICATION_TYPES.SCHOLARSHIP:
      return FiAward;
    case APPLICATION_TYPES.COURSE:
      return FiFileText;
    case APPLICATION_TYPES.MENTORSHIP:
      return FiUsers;
    case APPLICATION_TYPES.VOLUNTEER:
      return FiHeart;
    case APPLICATION_TYPES.FELLOWSHIP:
      return FiStar;
    case APPLICATION_TYPES.COMPETITION:
      return FiTarget;
    default:
      return FiFileText;
  }
};

const filterByStatusGroup = (applications, group) => {
  if (group === 'all') return applications;

  switch (group) {
    case 'active':
      return applications.filter((a) =>
        [
          APPLICATION_STATUS.SUBMITTED,
          APPLICATION_STATUS.UNDER_REVIEW,
          APPLICATION_STATUS.SHORTLISTED,
          APPLICATION_STATUS.INTERVIEW,
          APPLICATION_STATUS.INTERVIEW_SCHEDULED,
          APPLICATION_STATUS.ASSESSMENT,
        ].includes(a.status)
      );
    case 'pending':
      return applications.filter((a) =>
        [APPLICATION_STATUS.PENDING, APPLICATION_STATUS.SUBMITTED, APPLICATION_STATUS.DRAFT].includes(
          a.status
        )
      );
    case 'interview':
      return applications.filter((a) =>
        [
          APPLICATION_STATUS.INTERVIEW,
          APPLICATION_STATUS.INTERVIEW_SCHEDULED,
          APPLICATION_STATUS.ASSESSMENT,
        ].includes(a.status)
      );
    case 'offers':
      return applications.filter((a) =>
        [APPLICATION_STATUS.OFFER, APPLICATION_STATUS.OFFER_EXTENDED].includes(a.status)
      );
    case 'accepted':
      return applications.filter((a) =>
        [APPLICATION_STATUS.ACCEPTED, APPLICATION_STATUS.HIRED].includes(a.status)
      );
    case 'rejected':
      return applications.filter((a) =>
        [APPLICATION_STATUS.REJECTED, APPLICATION_STATUS.DECLINED].includes(a.status)
      );
    case 'withdrawn':
      return applications.filter((a) => a.status === APPLICATION_STATUS.WITHDRAWN);
    default:
      return applications;
  }
};

// ============================================
// MAIN COMPONENT
// ============================================

const Applications = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, userData } = useAuth();
  const { studentData } = useStudent();
  const { showNotification } = useNotification();

  // ============================================
  // STATE
  // ============================================

  // Data
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    pending: 0,
    interviewing: 0,
    offers: 0,
    accepted: 0,
    rejected: 0,
    withdrawn: 0,
    draft: 0,
    successRate: 0,
    responseRate: 0,
    avgResponseTime: 0,
  });

  // Loading
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [filterDateRange, setFilterDateRange] = useState('all');
  const [sortBy, setSortBy] = useState(SORT_OPTIONS.NEWEST);
  const [sortOrder, setSortOrder] = useState('desc');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);

  // Modals
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showTimelineModal, setShowTimelineModal] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [showBulkActionsModal, setShowBulkActionsModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);

  // Selected
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [selectedApplications, setSelectedApplications] = useState([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectAll, setSelectAll] = useState(false);

  // Notes
  const [noteText, setNoteText] = useState('');

  // View mode
  const [viewMode, setViewMode] = useState('table');

  // Refs
  const unsubscribeRef = useRef(null);

  // ============================================
  // COMPUTED
  // ============================================

  const totalPages = useMemo(
    () => Math.ceil(filteredApplications.length / ITEMS_PER_PAGE),
    [filteredApplications]
  );

  const paginatedApplications = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredApplications.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredApplications, currentPage]);

  const categoryStats = useMemo(() => {
    const byStatus = {};
    const byType = {};

    applications.forEach((app) => {
      byStatus[app.status] = (byStatus[app.status] || 0) + 1;
      byType[app.applicationType || app.type] = (byType[app.applicationType || app.type] || 0) + 1;
    });

    return { byStatus, byType };
  }, [applications]);

  // ============================================
  // EFFECTS
  // ============================================

  useEffect(() => {
    if (!currentUser?.uid) {
      setLoading(false);
      return;
    }

    setupRealtimeListener();

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [currentUser?.uid]);

  useEffect(() => {
    applyFilters();
  }, [applications, searchTerm, filterStatus, filterType, filterDateRange, sortBy, sortOrder]);

  useEffect(() => {
    calculateStats();
  }, [applications]);

  // ============================================
  // DATA LOADING
  // ============================================

  const setupRealtimeListener = useCallback(() => {
    if (!currentUser?.uid) return;

    if (unsubscribeRef.current) {
      unsubscribeRef.current();
    }

    try {
      const appsQuery = query(
        collection(db, 'jobApplications'),
        where('studentId', '==', currentUser.uid),
        orderBy('appliedAt', 'desc'),
        limit(MAX_BATCH_SIZE)
      );

      const unsubscribe = onSnapshot(
        appsQuery,
        (snapshot) => {
          const apps = snapshot.docs.map((doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data,
              appliedAt: data.appliedAt?.toDate?.() || new Date(),
              updatedAt: data.updatedAt?.toDate?.() || new Date(),
              statusUpdatedAt: data.statusUpdatedAt?.toDate?.() || null,
              interviewDate: data.interviewDate?.toDate?.() || null,
              deadline: data.deadline?.toDate?.() || null,
              offerDeadline: data.offerDeadline?.toDate?.() || null,
              withdrawnAt: data.withdrawnAt?.toDate?.() || null,
            };
          });

          setApplications(apps);
          setLoading(false);
          setRefreshing(false);
        },
        (error) => {
          console.error('Applications listener error:', error);
          toast.error('Failed to load applications');
          setLoading(false);
          setRefreshing(false);
        }
      );

      unsubscribeRef.current = unsubscribe;
    } catch (error) {
      console.error('Error setting up listener:', error);
      setLoading(false);
    }
  }, [currentUser?.uid]);

  const refreshApplications = async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  };

  // ============================================
  // STATS
  // ============================================

  const calculateStats = () => {
    const total = applications.length;

    if (total === 0) {
      setStats({
        total: 0,
        active: 0,
        pending: 0,
        interviewing: 0,
        offers: 0,
        accepted: 0,
        rejected: 0,
        withdrawn: 0,
        draft: 0,
        successRate: 0,
        responseRate: 0,
        avgResponseTime: 0,
      });
      return;
    }

    const active = applications.filter((a) =>
      [
        APPLICATION_STATUS.SUBMITTED,
        APPLICATION_STATUS.UNDER_REVIEW,
        APPLICATION_STATUS.SHORTLISTED,
        APPLICATION_STATUS.INTERVIEW,
        APPLICATION_STATUS.INTERVIEW_SCHEDULED,
        APPLICATION_STATUS.ASSESSMENT,
      ].includes(a.status)
    ).length;

    const pending = applications.filter((a) =>
      [APPLICATION_STATUS.PENDING, APPLICATION_STATUS.SUBMITTED, APPLICATION_STATUS.DRAFT].includes(
        a.status
      )
    ).length;

    const interviewing = applications.filter((a) =>
      [
        APPLICATION_STATUS.INTERVIEW,
        APPLICATION_STATUS.INTERVIEW_SCHEDULED,
        APPLICATION_STATUS.ASSESSMENT,
      ].includes(a.status)
    ).length;

    const offers = applications.filter((a) =>
      [APPLICATION_STATUS.OFFER, APPLICATION_STATUS.OFFER_EXTENDED].includes(a.status)
    ).length;

    const accepted = applications.filter((a) =>
      [APPLICATION_STATUS.ACCEPTED, APPLICATION_STATUS.HIRED].includes(a.status)
    ).length;

    const rejected = applications.filter((a) =>
      [APPLICATION_STATUS.REJECTED, APPLICATION_STATUS.DECLINED].includes(a.status)
    ).length;

    const withdrawn = applications.filter((a) => a.status === APPLICATION_STATUS.WITHDRAWN).length;
    const draft = applications.filter((a) => a.status === APPLICATION_STATUS.DRAFT).length;

    const responded = applications.filter((a) =>
      [
        APPLICATION_STATUS.UNDER_REVIEW,
        APPLICATION_STATUS.SHORTLISTED,
        APPLICATION_STATUS.INTERVIEW,
        APPLICATION_STATUS.INTERVIEW_SCHEDULED,
        APPLICATION_STATUS.ASSESSMENT,
        APPLICATION_STATUS.OFFER,
        APPLICATION_STATUS.OFFER_EXTENDED,
        APPLICATION_STATUS.ACCEPTED,
        APPLICATION_STATUS.HIRED,
        APPLICATION_STATUS.REJECTED,
        APPLICATION_STATUS.DECLINED,
      ].includes(a.status)
    ).length;

    const responseRate = total > 0 ? Math.round((responded / total) * 100) : 0;
    const successRate = total > 0 ? Math.round((accepted / total) * 100) : 0;

    // Calculate average response time
    const respondedApps = applications.filter((a) => a.statusUpdatedAt && a.appliedAt);
    let avgResponseTime = 0;
    if (respondedApps.length > 0) {
      const totalTime = respondedApps.reduce((sum, app) => {
        const appliedAt = app.appliedAt instanceof Date ? app.appliedAt : new Date(app.appliedAt);
        const statusUpdatedAt =
          app.statusUpdatedAt instanceof Date ? app.statusUpdatedAt : new Date(app.statusUpdatedAt);
        return sum + (statusUpdatedAt - appliedAt);
      }, 0);
      avgResponseTime = Math.round(totalDays(totalTime / respondedApps.length));
    }

    setStats({
      total,
      active,
      pending,
      interviewing,
      offers,
      accepted,
      rejected,
      withdrawn,
      draft,
      successRate,
      responseRate,
      avgResponseTime,
    });
  };

  function totalDays(ms) {
    return ms / (1000 * 60 * 60 * 24);
  }

  // ============================================
  // FILTERING & SORTING
  // ============================================

  const applyFilters = useCallback(() => {
    let filtered = [...applications];

    // Status group filter
    if (filterStatus !== 'all') {
      filtered = filterByStatusGroup(filtered, filterStatus);
    }

    // Type filter
    if (filterType !== 'all') {
      filtered = filtered.filter((a) => (a.applicationType || a.type) === filterType);
    }

    // Date range filter
    if (filterDateRange !== 'all') {
      const now = new Date();
      let cutoffDate = new Date();

      switch (filterDateRange) {
        case 'today':
          cutoffDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          cutoffDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          cutoffDate.setMonth(now.getMonth() - 1);
          break;
        case '3months':
          cutoffDate.setMonth(now.getMonth() - 3);
          break;
        case '6months':
          cutoffDate.setMonth(now.getMonth() - 6);
          break;
        case 'year':
          cutoffDate.setFullYear(now.getFullYear() - 1);
          break;
        default:
          cutoffDate = null;
      }

      if (cutoffDate) {
        filtered = filtered.filter((a) => {
          const appliedDate = a.appliedAt instanceof Date ? a.appliedAt : new Date(a.appliedAt);
          return appliedDate >= cutoffDate;
        });
      }
    }

    // Search filter
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(
        (a) =>
          a.jobTitle?.toLowerCase().includes(search) ||
          a.companyName?.toLowerCase().includes(search) ||
          a.description?.toLowerCase().includes(search) ||
          a.applicationId?.toLowerCase().includes(search) ||
          a.institutionName?.toLowerCase().includes(search)
      );
    }

    // Sort
    filtered.sort((a, b) => {
      let result = 0;

      switch (sortBy) {
        case SORT_OPTIONS.NEWEST:
          result = new Date(b.appliedAt) - new Date(a.appliedAt);
          break;
        case SORT_OPTIONS.OLDEST:
          result = new Date(a.appliedAt) - new Date(b.appliedAt);
          break;
        case SORT_OPTIONS.STATUS:
          result = STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status);
          break;
        case SORT_OPTIONS.DEADLINE:
          const aD = a.deadline ? new Date(a.deadline).getTime() : Infinity;
          const bD = b.deadline ? new Date(b.deadline).getTime() : Infinity;
          result = aD - bD;
          break;
        case SORT_OPTIONS.TITLE:
          result = (a.jobTitle || '').localeCompare(b.jobTitle || '');
          break;
        case SORT_OPTIONS.COMPANY:
          result = (a.companyName || '').localeCompare(b.companyName || '');
          break;
        default:
          result = 0;
      }

      return sortOrder === 'asc' ? result : -result;
    });

    setFilteredApplications(filtered);
    setCurrentPage(1);
  }, [applications, filterStatus, filterType, filterDateRange, searchTerm, sortBy, sortOrder]);

  // ============================================
  // ACTIONS
  // ============================================

  const handleWithdraw = async () => {
    if (!selectedApplication) return;

    setActionLoading(true);
    try {
      await updateDoc(doc(db, 'jobApplications', selectedApplication.id), {
        status: APPLICATION_STATUS.WITHDRAWN,
        statusUpdatedAt: serverTimestamp(),
        withdrawnAt: serverTimestamp(),
      });

      // Log activity
      await addDoc(collection(db, 'applicationActivities'), {
        applicationId: selectedApplication.id,
        studentId: currentUser.uid,
        action: 'withdrawn',
        timestamp: serverTimestamp(),
      });

      // Send notification
      await notificationService.createNotification({
        userId: currentUser.uid,
        type: 'application',
        title: 'Application Withdrawn',
        message: `You have withdrawn your application for ${selectedApplication.jobTitle}`,
        priority: 'low',
        data: { applicationId: selectedApplication.id },
      });

      // Email notification
      try {
        await emailService.sendApplicationWithdrawn(currentUser.email, {
          jobTitle: selectedApplication.jobTitle,
          companyName: selectedApplication.companyName,
        });
      } catch (emailErr) {
        console.warn('Email notification failed:', emailErr);
      }

      toast.success('Application withdrawn successfully');
      setShowWithdrawModal(false);
      setSelectedApplication(null);
    } catch (error) {
      console.error('Withdraw error:', error);
      toast.error('Failed to withdraw application');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedApplication) return;

    setActionLoading(true);
    try {
      await deleteDoc(doc(db, 'jobApplications', selectedApplication.id));

      // Log activity
      await addDoc(collection(db, 'applicationActivities'), {
        applicationId: selectedApplication.id,
        studentId: currentUser.uid,
        action: 'deleted',
        timestamp: serverTimestamp(),
      });

      toast.success('Application deleted');
      setShowDeleteModal(false);
      setSelectedApplication(null);
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete application');
    } finally {
      setActionLoading(false);
    }
  };

  const handleShare = async (method) => {
    if (!selectedApplication) return;

    try {
      const shareUrl = `${window.location.origin}/student/applications/${selectedApplication.id}`;

      if (method === 'link') {
        await navigator.clipboard.writeText(shareUrl);
        toast.success('Link copied to clipboard');
      } else if (method === 'email') {
        const subject = encodeURIComponent(`Application: ${selectedApplication.jobTitle}`);
        const body = encodeURIComponent(
          `Hi,\n\nI wanted to share my application for ${selectedApplication.jobTitle} at ${selectedApplication.companyName}:\n\n${shareUrl}\n\nBest regards`
        );
        window.location.href = `mailto:?subject=${subject}&body=${body}`;
      } else if (method === 'pdf') {
        await handleExportPDF(selectedApplication);
      }

      // Log activity
      await addDoc(collection(db, 'applicationActivities'), {
        applicationId: selectedApplication.id,
        studentId: currentUser.uid,
        action: 'shared',
        method,
        timestamp: serverTimestamp(),
      });

      setShowShareModal(false);
    } catch (error) {
      console.error('Share error:', error);
      toast.error('Failed to share application');
    }
  };

  const handleExportPDF = async (application) => {
    try {
      // Create PDF content
      const content = `
        Application Details
        ==================
        Position: ${application.jobTitle}
        Company: ${application.companyName}
        Status: ${formatStatus(application.status)}
        Applied: ${formatDate(application.appliedAt)}
        ${application.location ? `Location: ${application.location}` : ''}
        ${application.salary ? `Salary: ${application.salary}` : ''}
      `;

      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `application_${application.id}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('Application exported');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export application');
    }
  };

  const handleExportAll = async (format) => {
    setExporting(true);
    try {
      const data = filteredApplications.map((app) => ({
        'Application ID': app.id,
        Position: app.jobTitle || 'N/A',
        Company: app.companyName || 'N/A',
        Type: app.applicationType || app.type || 'N/A',
        Status: formatStatus(app.status),
        'Applied Date': formatDate(app.appliedAt),
        Location: app.location || 'N/A',
        'Application Deadline': formatDate(app.deadline),
      }));

      if (format === 'csv') {
        const headers = Object.keys(data[0] || {});
        const csv = [
          headers.join(','),
          ...data.map((row) =>
            headers.map((h) => `"${String(row[h] || '').replace(/"/g, '""')}"`).join(',')
          ),
        ].join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `applications_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } else if (format === 'json') {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `applications_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }

      toast.success('Applications exported');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export applications');
    } finally {
      setExporting(false);
    }
  };

  const handleBulkWithdraw = async () => {
    if (selectedApplications.length === 0) return;

    setActionLoading(true);
    try {
      const batch = writeBatch(db);

      selectedApplications.forEach((appId) => {
        batch.update(doc(db, 'jobApplications', appId), {
          status: APPLICATION_STATUS.WITHDRAWN,
          statusUpdatedAt: serverTimestamp(),
          withdrawnAt: serverTimestamp(),
        });
      });

      await batch.commit();

      toast.success(`${selectedApplications.length} application(s) withdrawn`);
      clearSelection();
      setShowBulkActionsModal(false);
    } catch (error) {
      console.error('Bulk withdraw error:', error);
      toast.error('Failed to withdraw applications');
    } finally {
      setActionLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedApplications.length === 0) return;

    setActionLoading(true);
    try {
      const batch = writeBatch(db);

      selectedApplications.forEach((appId) => {
        batch.delete(doc(db, 'jobApplications', appId));
      });

      await batch.commit();

      toast.success(`${selectedApplications.length} application(s) deleted`);
      clearSelection();
      setShowBulkActionsModal(false);
    } catch (error) {
      console.error('Bulk delete error:', error);
      toast.error('Failed to delete applications');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddNote = async () => {
    if (!selectedApplication || !noteText.trim()) return;

    try {
      await updateDoc(doc(db, 'jobApplications', selectedApplication.id), {
        notes: [
          ...(selectedApplication.notes || []),
          {
            id: Date.now().toString(),
            text: noteText.trim(),
            createdAt: new Date().toISOString(),
            createdBy: currentUser.uid,
          },
        ],
        updatedAt: serverTimestamp(),
      });

      toast.success('Note added');
      setNoteText('');
    } catch (error) {
      console.error('Add note error:', error);
      toast.error('Failed to add note');
    }
  };

  // ============================================
  // SELECTION
  // ============================================

  const toggleSelection = (appId) => {
    setSelectedApplications((prev) =>
      prev.includes(appId) ? prev.filter((id) => id !== appId) : [...prev, appId]
    );
  };

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedApplications([]);
      setSelectAll(false);
    } else {
      setSelectedApplications(paginatedApplications.map((a) => a.id));
      setSelectAll(true);
    }
  };

  const clearSelection = () => {
    setSelectedApplications([]);
    setSelectAll(false);
    setIsSelectionMode(false);
  };

  // ============================================
  // LOADING / ERROR STATES
  // ============================================

  if (loading) {
    return (
      <Container fluid className="applications-loading-container">
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" style={{ width: '3rem', height: '3rem' }} />
          <h5 className="mt-4 text-muted">Loading your applications...</h5>
        </div>
      </Container>
    );
  }

  if (!currentUser) {
    return (
      <Container fluid className="py-5">
        <Alert variant="warning" className="text-center">
          <FiAlertCircle className="me-2" />
          Please sign in to view your applications
        </Alert>
      </Container>
    );
  }

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="applications-page">
      <Toaster position="top-right" />

      <Container fluid className="py-4">
        {/* Header */}
        <Row className="mb-4 align-items-center">
          <Col md={8}>
            <h1 className="applications-title mb-1">
              <MdAssignment className="me-2 text-primary" />
              My Applications
            </h1>
            <p className="text-muted mb-0">
              Track and manage all your job applications in one place
            </p>
          </Col>
          <Col md={4} className="text-end">
            <div className="d-flex gap-2 justify-content-end">
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={refreshApplications}
                disabled={refreshing}
              >
                <FiRefreshCw className={refreshing ? 'spin' : ''} />
                <span className="d-none d-md-inline ms-2">Refresh</span>
              </Button>
              <Dropdown align="end">
                <Dropdown.Toggle variant="outline-primary" size="sm">
                  <FiDownload className="me-1" />
                  Export
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item onClick={() => handleExportAll('csv')}>
                    Export as CSV
                  </Dropdown.Item>
                  <Dropdown.Item onClick={() => handleExportAll('json')}>
                    Export as JSON
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate('/student/jobs')}
              >
                <FiPlus className="me-2" />
                Apply for Jobs
              </Button>
            </div>
          </Col>
        </Row>

        {/* Stats Cards */}
        <Row className="mb-4 g-3">
          <Col xs={6} md={2}>
            <Card className="stat-card border-0 shadow-sm h-100">
              <Card.Body className="text-center">
                <div className="stat-icon-wrapper bg-primary-subtle mb-2">
                  <FiFileText className="text-primary" size={20} />
                </div>
                <h3 className="mb-1">{stats.total}</h3>
                <small className="text-muted">Total</small>
              </Card.Body>
            </Card>
          </Col>
          <Col xs={6} md={2}>
            <Card className="stat-card border-0 shadow-sm h-100">
              <Card.Body className="text-center">
                <div className="stat-icon-wrapper bg-warning-subtle mb-2">
                  <FiClock className="text-warning" size={20} />
                </div>
                <h3 className="mb-1 text-warning">{stats.pending}</h3>
                <small className="text-muted">Pending</small>
              </Card.Body>
            </Card>
          </Col>
          <Col xs={6} md={2}>
            <Card className="stat-card border-0 shadow-sm h-100">
              <Card.Body className="text-center">
                <div className="stat-icon-wrapper bg-info-subtle mb-2">
                  <FiMessageSquare className="text-info" size={20} />
                </div>
                <h3 className="mb-1 text-info">{stats.interviewing}</h3>
                <small className="text-muted">Interviewing</small>
              </Card.Body>
            </Card>
          </Col>
          <Col xs={6} md={2}>
            <Card className="stat-card border-0 shadow-sm h-100">
              <Card.Body className="text-center">
                <div className="stat-icon-wrapper bg-success-subtle mb-2">
                  <FiAward className="text-success" size={20} />
                </div>
                <h3 className="mb-1 text-success">{stats.offers + stats.accepted}</h3>
                <small className="text-muted">Offers</small>
              </Card.Body>
            </Card>
          </Col>
          <Col xs={6} md={2}>
            <Card className="stat-card border-0 shadow-sm h-100">
              <Card.Body className="text-center">
                <div className="stat-icon-wrapper bg-danger-subtle mb-2">
                  <FiXCircle className="text-danger" size={20} />
                </div>
                <h3 className="mb-1 text-danger">{stats.rejected}</h3>
                <small className="text-muted">Rejected</small>
              </Card.Body>
            </Card>
          </Col>
          <Col xs={6} md={2}>
            <Card className="stat-card border-0 shadow-sm h-100">
              <Card.Body className="text-center">
                <div className="stat-icon-wrapper bg-info-subtle mb-2">
                  <FiTrendingUp className="text-info" size={20} />
                </div>
                <h3 className="mb-1 text-info">{stats.successRate}%</h3>
                <small className="text-muted">Success Rate</small>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Filters */}
        <Card className="mb-4 border-0 shadow-sm">
          <Card.Body>
            <Row className="g-3">
              <Col md={4}>
                <InputGroup>
                  <InputGroup.Text>
                    <FiSearch />
                  </InputGroup.Text>
                  <FormControl
                    placeholder="Search applications..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  {searchTerm && (
                    <Button variant="outline-secondary" onClick={() => setSearchTerm('')}>
                      <FiX />
                    </Button>
                  )}
                </InputGroup>
              </Col>
              <Col md={2}>
                <Form.Select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  {Object.entries(FILTER_STATUS_GROUPS).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </Form.Select>
              </Col>
              <Col md={2}>
                <Form.Select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                  <option value="all">All Types</option>
                  {Object.entries(APPLICATION_TYPES).map(([key, value]) => (
                    <option key={value} value={value}>
                      {key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                    </option>
                  ))}
                </Form.Select>
              </Col>
              <Col md={2}>
                <Form.Select
                  value={filterDateRange}
                  onChange={(e) => setFilterDateRange(e.target.value)}
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="3months">Last 3 Months</option>
                  <option value="6months">Last 6 Months</option>
                  <option value="year">Last Year</option>
                </Form.Select>
              </Col>
              <Col md={2}>
                <ButtonGroup className="w-100">
                  <Button
                    variant={viewMode === 'table' ? 'primary' : 'outline-secondary'}
                    onClick={() => setViewMode('table')}
                  >
                    <FiList />
                  </Button>
                  <Button
                    variant={viewMode === 'card' ? 'primary' : 'outline-secondary'}
                    onClick={() => setViewMode('card')}
                  >
                    <FiGrid />
                  </Button>
                  <Dropdown align="end">
                    <Dropdown.Toggle variant="outline-secondary">
                      <FiFilter />
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                      <Dropdown.Item
                        onClick={() => {
                          setSortBy(SORT_OPTIONS.NEWEST);
                          setSortOrder('desc');
                        }}
                      >
                        Newest First
                      </Dropdown.Item>
                      <Dropdown.Item
                        onClick={() => {
                          setSortBy(SORT_OPTIONS.OLDEST);
                          setSortOrder('asc');
                        }}
                      >
                        Oldest First
                      </Dropdown.Item>
                      <Dropdown.Divider />
                      <Dropdown.Item onClick={() => setSortBy(SORT_OPTIONS.STATUS)}>
                        Sort by Status
                      </Dropdown.Item>
                      <Dropdown.Item onClick={() => setSortBy(SORT_OPTIONS.DEADLINE)}>
                        Sort by Deadline
                      </Dropdown.Item>
                      <Dropdown.Item onClick={() => setSortBy(SORT_OPTIONS.TITLE)}>
                        Sort by Title
                      </Dropdown.Item>
                      <Dropdown.Item onClick={() => setSortBy(SORT_OPTIONS.COMPANY)}>
                        Sort by Company
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                </ButtonGroup>
              </Col>
            </Row>

            {/* Selection Bar */}
            <AnimatePresence>
              {isSelectionMode && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="mt-3 pt-3 border-top"
                >
                  <div className="d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center">
                      <Form.Check
                        type="checkbox"
                        checked={selectAll}
                        onChange={toggleSelectAll}
                        className="me-2"
                      />
                      <span className="fw-medium">{selectedApplications.length} selected</span>
                    </div>
                    <div className="d-flex gap-2">
                      <Button
                        variant="outline-warning"
                        size="sm"
                        onClick={handleBulkWithdraw}
                        disabled={actionLoading || selectedApplications.length === 0}
                      >
                        <FiArchive className="me-1" />
                        Withdraw
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => setShowBulkActionsModal(true)}
                        disabled={selectedApplications.length === 0}
                      >
                        <FiTrash2 className="me-1" />
                        Delete
                      </Button>
                      <Button variant="outline-secondary" size="sm" onClick={clearSelection}>
                        <FiX />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </Card.Body>
        </Card>

        {/* Main Content */}
        {filteredApplications.length === 0 ? (
          <Card className="border-0 shadow-sm">
            <Card.Body className="text-center py-5">
              <FiBriefcase size={64} className="text-muted mb-3" />
              <h4>No applications found</h4>
              <p className="text-muted mb-4">
                {searchTerm ||
                filterStatus !== 'all' ||
                filterType !== 'all' ||
                filterDateRange !== 'all'
                  ? 'Try adjusting your search or filters'
                  : "You haven't applied to any jobs yet. Start exploring opportunities!"}
              </p>
              {searchTerm ||
              filterStatus !== 'all' ||
              filterType !== 'all' ||
              filterDateRange !== 'all' ? (
                <Button
                  variant="outline-primary"
                  onClick={() => {
                    setSearchTerm('');
                    setFilterStatus('all');
                    setFilterType('all');
                    setFilterDateRange('all');
                  }}
                >
                  Clear Filters
                </Button>
              ) : (
                <Button variant="primary" onClick={() => navigate('/student/jobs')}>
                  <FiSearch className="me-2" />
                  Browse Jobs
                </Button>
              )}
            </Card.Body>
          </Card>
        ) : (
          <>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <Button
                variant="link"
                size="sm"
                className="text-decoration-none p-0"
                onClick={() => setIsSelectionMode(!isSelectionMode)}
              >
                <FiCheckSquare className="me-1" />
                {isSelectionMode ? 'Cancel Selection' : 'Select Multiple'}
              </Button>
              <small className="text-muted">
                Showing {paginatedApplications.length} of {filteredApplications.length}
              </small>
            </div>

            {/* Table View */}
            {viewMode === 'table' && (
              <Card className="border-0 shadow-sm">
                <Card.Body className="p-0">
                  <Table hover responsive className="mb-0 applications-table">
                    <thead>
                      <tr>
                        {isSelectionMode && <th style={{ width: '40px' }}></th>}
                        <th>Position</th>
                        <th>Company</th>
                        <th>Applied</th>
                        <th>Status</th>
                        <th>Deadline</th>
                        <th className="text-end">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedApplications.map((application) => {
                        const statusConfig = getStatusConfig(application.status);
                        const StatusIcon = getStatusIcon(application.status);
                        const TypeIcon = getApplicationTypeIcon(
                          application.applicationType || application.type
                        );
                        const daysLeft = daysUntil(application.deadline);
                        const isSelected = selectedApplications.includes(application.id);

                        return (
                          <tr key={application.id} className={isSelected ? 'table-active' : ''}>
                            {isSelectionMode && (
                              <td>
                                <Form.Check
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => toggleSelection(application.id)}
                                />
                              </td>
                            )}
                            <td>
                              <div className="d-flex align-items-center">
                                <div
                                  className="application-icon me-3"
                                  style={{
                                    backgroundColor: `${statusConfig.color}15`,
                                    color: statusConfig.color,
                                  }}
                                >
                                  <TypeIcon size={18} />
                                </div>
                                <div>
                                  <div className="fw-medium">
                                    <Link
                                      to={`/student/application/${application.id}`}
                                      className="text-decoration-none"
                                    >
                                      {application.jobTitle || 'Untitled Position'}
                                    </Link>
                                  </div>
                                  <small className="text-muted">
                                    {application.applicationType || application.type || 'Job'} •{' '}
                                    {application.location || 'Remote'}
                                  </small>
                                </div>
                              </div>
                            </td>
                            <td>
                              <div>
                                <div className="fw-medium">
                                  {application.companyName || 'N/A'}
                                </div>
                                <small className="text-muted">
                                  {application.companyIndustry || 'N/A'}
                                </small>
                              </div>
                            </td>
                            <td>
                              <div>{formatDate(application.appliedAt)}</div>
                              <small className="text-muted">
                                {formatRelativeTime(application.appliedAt)}
                              </small>
                            </td>
                            <td>
                              <Badge bg={statusConfig.bg}>
                                <StatusIcon size={12} className="me-1" />
                                {statusConfig.label}
                              </Badge>
                              {application.statusUpdatedAt && (
                                <div className="text-muted small mt-1">
                                  Updated {formatRelativeTime(application.statusUpdatedAt)}
                                </div>
                              )}
                            </td>
                            <td>
                              {application.deadline ? (
                                <>
                                  <div>{formatDate(application.deadline)}</div>
                                  {daysLeft !== null &&
                                    (daysLeft < 0 ? (
                                      <small className="text-danger">Expired</small>
                                    ) : daysLeft <= 3 ? (
                                      <small className="text-danger">
                                        {daysLeft} day(s) left
                                      </small>
                                    ) : daysLeft <= 7 ? (
                                      <small className="text-warning">
                                        {daysLeft} days left
                                      </small>
                                    ) : (
                                      <small className="text-muted">
                                        {daysLeft} days left
                                      </small>
                                    ))}
                                </>
                              ) : (
                                <span className="text-muted">No deadline</span>
                              )}
                            </td>
                            <td className="text-end">
                              <ButtonGroup size="sm">
                                <OverlayTrigger
                                  placement="top"
                                  overlay={<Tooltip>View Details</Tooltip>}
                                >
                                  <Button
                                    variant="outline-primary"
                                    onClick={() =>
                                      navigate(`/student/application/${application.id}`)
                                    }
                                  >
                                    <FiEye />
                                  </Button>
                                </OverlayTrigger>
                                {[
                                  APPLICATION_STATUS.PENDING,
                                  APPLICATION_STATUS.SUBMITTED,
                                  APPLICATION_STATUS.UNDER_REVIEW,
                                ].includes(application.status) && (
                                  <OverlayTrigger
                                    placement="top"
                                    overlay={<Tooltip>Withdraw</Tooltip>}
                                  >
                                    <Button
                                      variant="outline-warning"
                                      onClick={() => {
                                        setSelectedApplication(application);
                                        setShowWithdrawModal(true);
                                      }}
                                    >
                                      <FiArchive />
                                    </Button>
                                  </OverlayTrigger>
                                )}
                                <OverlayTrigger placement="top" overlay={<Tooltip>Share</Tooltip>}>
                                  <Button
                                    variant="outline-success"
                                    onClick={() => {
                                      setSelectedApplication(application);
                                      setShowShareModal(true);
                                    }}
                                  >
                                    <FiShare2 />
                                  </Button>
                                </OverlayTrigger>
                                <Dropdown align="end">
                                  <Dropdown.Toggle variant="outline-secondary">
                                    <FiMoreVertical />
                                  </Dropdown.Toggle>
                                  <Dropdown.Menu>
                                    <Dropdown.Item
                                      onClick={() => {
                                        setSelectedApplication(application);
                                        setShowDetailModal(true);
                                      }}
                                    >
                                      <FiInfo className="me-2" />
                                      View Details
                                    </Dropdown.Item>
                                    <Dropdown.Item
                                      onClick={() => {
                                        setSelectedApplication(application);
                                        setShowTimelineModal(true);
                                      }}
                                    >
                                      <FiActivity className="me-2" />
                                      View Timeline
                                    </Dropdown.Item>
                                    <Dropdown.Item
                                      onClick={() => {
                                        setSelectedApplication(application);
                                        setShowNotesModal(true);
                                      }}
                                    >
                                      <FiEdit2 className="me-2" />
                                      Add Note
                                    </Dropdown.Item>
                                    <Dropdown.Divider />
                                    <Dropdown.Item
                                      className="text-danger"
                                      onClick={() => {
                                        setSelectedApplication(application);
                                        setShowDeleteModal(true);
                                      }}
                                    >
                                      <FiTrash2 className="me-2" />
                                      Delete
                                    </Dropdown.Item>
                                  </Dropdown.Menu>
                                </Dropdown>
                              </ButtonGroup>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            )}

            {/* Card View */}
            {viewMode === 'card' && (
              <Row className="g-3">
                {paginatedApplications.map((application) => {
                  const statusConfig = getStatusConfig(application.status);
                  const StatusIcon = getStatusIcon(application.status);
                  const TypeIcon = getApplicationTypeIcon(
                    application.applicationType || application.type
                  );
                  const daysLeft = daysUntil(application.deadline);
                  const isSelected = selectedApplications.includes(application.id);

                  return (
                    <Col key={application.id} xs={12} md={6} lg={4}>
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Card
                          className={`application-card h-100 border-0 shadow-sm ${isSelected ? 'selected' : ''}`}
                        >
                          <Card.Body>
                            {isSelectionMode && (
                              <Form.Check
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleSelection(application.id)}
                                className="position-absolute top-0 start-0 m-2"
                              />
                            )}

                            <div className="d-flex justify-content-between align-items-start mb-3">
                              <div className="d-flex align-items-center">
                                <div
                                  className="application-icon me-3"
                                  style={{
                                    backgroundColor: `${statusConfig.color}15`,
                                    color: statusConfig.color,
                                  }}
                                >
                                  <TypeIcon size={20} />
                                </div>
                                <div>
                                  <h6 className="mb-1">{application.jobTitle}</h6>
                                  <p className="text-muted small mb-0">
                                    {application.companyName}
                                  </p>
                                </div>
                              </div>
                              <Badge bg={statusConfig.bg}>{statusConfig.label}</Badge>
                            </div>

                            {application.location && (
                              <p className="text-muted small mb-1">
                                <FiMapPin size={12} className="me-1" />
                                {application.location}
                              </p>
                            )}

                            <div className="d-flex justify-content-between text-muted small mb-3">
                              <span>
                                <FiCalendar size={12} className="me-1" />
                                {formatDate(application.appliedAt)}
                              </span>
                              {daysLeft !== null && (
                                <span
                                  className={
                                    daysLeft < 0
                                      ? 'text-danger'
                                      : daysLeft <= 3
                                        ? 'text-danger'
                                        : daysLeft <= 7
                                          ? 'text-warning'
                                          : ''
                                  }
                                >
                                  <FiClock size={12} className="me-1" />
                                  {daysLeft < 0 ? 'Expired' : `${daysLeft}d left`}
                                </span>
                              )}
                            </div>
                          </Card.Body>
                          <Card.Footer className="bg-transparent border-0 d-flex gap-1">
                            <Button
                              variant="outline-primary"
                              size="sm"
                              className="flex-fill"
                              onClick={() => navigate(`/student/application/${application.id}`)}
                            >
                              <FiEye className="me-1" />
                              View
                            </Button>
                            <Dropdown align="end">
                              <Dropdown.Toggle variant="outline-secondary" size="sm">
                                <FiMoreVertical />
                              </Dropdown.Toggle>
                              <Dropdown.Menu>
                                <Dropdown.Item
                                  onClick={() => {
                                    setSelectedApplication(application);
                                    setShowShareModal(true);
                                  }}
                                >
                                  <FiShare2 className="me-2" />
                                  Share
                                </Dropdown.Item>
                                <Dropdown.Item
                                  onClick={() => {
                                    setSelectedApplication(application);
                                    setShowNotesModal(true);
                                  }}
                                >
                                  <FiEdit2 className="me-2" />
                                  Add Note
                                </Dropdown.Item>
                                <Dropdown.Divider />
                                <Dropdown.Item
                                  className="text-danger"
                                  onClick={() => {
                                    setSelectedApplication(application);
                                    setShowDeleteModal(true);
                                  }}
                                >
                                  <FiTrash2 className="me-2" />
                                  Delete
                                </Dropdown.Item>
                              </Dropdown.Menu>
                            </Dropdown>
                          </Card.Footer>
                        </Card>
                      </motion.div>
                    </Col>
                  );
                })}
              </Row>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="d-flex justify-content-center mt-4">
                <Pagination>
                  <Pagination.First
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                  />
                  <Pagination.Prev
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  />
                  {[...Array(Math.min(5, totalPages))].map((_, i) => {
                    let pageNum;
                    if (totalPages <= 5) pageNum = i + 1;
                    else if (currentPage <= 3) pageNum = i + 1;
                    else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                    else pageNum = currentPage - 2 + i;

                    return (
                      <Pagination.Item
                        key={pageNum}
                        active={pageNum === currentPage}
                        onClick={() => setCurrentPage(pageNum)}
                      >
                        {pageNum}
                      </Pagination.Item>
                    );
                  })}
                  <Pagination.Next
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  />
                  <Pagination.Last
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                  />
                </Pagination>
              </div>
            )}
          </>
        )}

        {/* Tips Section */}
        {applications.length > 0 && (
          <Card className="mt-4 border-0 shadow-sm border-info">
            <Card.Body>
              <h6 className="mb-3">
                <FiInfo className="text-info me-2" />
                Application Tips
              </h6>
              <Row>
                <Col md={4}>
                  <div className="d-flex align-items-start">
                    <FiCheckCircle className="text-success me-2 mt-1" />
                    <div>
                      <strong>Follow up</strong>
                      <p className="text-muted small mb-0">
                        Follow up on pending applications after 1-2 weeks
                      </p>
                    </div>
                  </div>
                </Col>
                <Col md={4}>
                  <div className="d-flex align-items-start">
                    <FiFileText className="text-primary me-2 mt-1" />
                    <div>
                      <strong>Customize applications</strong>
                      <p className="text-muted small mb-0">
                        Tailor your resume and cover letter for each application
                      </p>
                    </div>
                  </div>
                </Col>
                <Col md={4}>
                  <div className="d-flex align-items-start">
                    <FiCalendar className="text-warning me-2 mt-1" />
                    <div>
                      <strong>Track deadlines</strong>
                      <p className="text-muted small mb-0">
                        Set reminders for application deadlines
                      </p>
                    </div>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        )}
      </Container>

      {/* ============================================
          MODALS
          ============================================ */}

      {/* Delete Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <FiAlertTriangle className="text-danger me-2" />
            Delete Application
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="warning">
            <FiAlertTriangle className="me-2" />
            This action cannot be undone.
          </Alert>
          <p>
            Are you sure you want to delete your application for{' '}
            <strong>{selectedApplication?.jobTitle}</strong>?
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete} disabled={actionLoading}>
            {actionLoading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Deleting...
              </>
            ) : (
              <>
                <FiTrash2 className="me-2" />
                Delete Application
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Withdraw Modal */}
      <Modal show={showWithdrawModal} onHide={() => setShowWithdrawModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <FiArchive className="me-2" />
            Withdraw Application
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Are you sure you want to withdraw your application for{' '}
            <strong>{selectedApplication?.jobTitle}</strong> at{' '}
            <strong>{selectedApplication?.companyName}</strong>?
          </p>
          <p className="text-muted small">
            The company will be notified that you have withdrawn your application.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowWithdrawModal(false)}>
            Cancel
          </Button>
          <Button variant="warning" onClick={handleWithdraw} disabled={actionLoading}>
            {actionLoading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Withdrawing...
              </>
            ) : (
              <>
                <FiArchive className="me-2" />
                Withdraw Application
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Share Modal */}
      <Modal show={showShareModal} onHide={() => setShowShareModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <FiShare2 className="me-2" />
            Share Application
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="mb-3">
            Share your application for <strong>{selectedApplication?.jobTitle}</strong>
          </p>
          <div className="d-grid gap-2">
            <Button variant="outline-primary" onClick={() => handleShare('link')}>
              <FiCopy className="me-2" />
              Copy Share Link
            </Button>
            <Button variant="outline-success" onClick={() => handleShare('email')}>
              <FiMail className="me-2" />
              Share via Email
            </Button>
            <Button variant="outline-info" onClick={() => handleShare('pdf')}>
              <FiDownload className="me-2" />
              Download as PDF
            </Button>
          </div>
        </Modal.Body>
      </Modal>

      {/* Detail Modal */}
      <Modal show={showDetailModal} onHide={() => setShowDetailModal(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <FiInfo className="me-2" />
            Application Details
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedApplication && (
            <>
              <div className="mb-4">
                <h5>{selectedApplication.jobTitle}</h5>
                <p className="text-muted mb-3">{selectedApplication.companyName}</p>
                <Badge bg={getStatusConfig(selectedApplication.status).bg}>
                  {getStatusConfig(selectedApplication.status).label}
                </Badge>
              </div>

              <ListGroup variant="flush">
                <ListGroup.Item className="d-flex justify-content-between">
                  <span className="text-muted">Application ID</span>
                  <code>{selectedApplication.id}</code>
                </ListGroup.Item>
                <ListGroup.Item className="d-flex justify-content-between">
                  <span className="text-muted">Applied</span>
                  <span>{formatDateTime(selectedApplication.appliedAt)}</span>
                </ListGroup.Item>
                {selectedApplication.location && (
                  <ListGroup.Item className="d-flex justify-content-between">
                    <span className="text-muted">Location</span>
                    <span>{selectedApplication.location}</span>
                  </ListGroup.Item>
                )}
                {selectedApplication.salary && (
                  <ListGroup.Item className="d-flex justify-content-between">
                    <span className="text-muted">Salary</span>
                    <span>{selectedApplication.salary}</span>
                  </ListGroup.Item>
                )}
                {selectedApplication.jobType && (
                  <ListGroup.Item className="d-flex justify-content-between">
                    <span className="text-muted">Job Type</span>
                    <span>{selectedApplication.jobType}</span>
                  </ListGroup.Item>
                )}
                {selectedApplication.deadline && (
                  <ListGroup.Item className="d-flex justify-content-between">
                    <span className="text-muted">Deadline</span>
                    <span>{formatDate(selectedApplication.deadline)}</span>
                  </ListGroup.Item>
                )}
                {selectedApplication.interviewDate && (
                  <ListGroup.Item className="d-flex justify-content-between">
                    <span className="text-muted">Interview Date</span>
                    <span>{formatDateTime(selectedApplication.interviewDate)}</span>
                  </ListGroup.Item>
                )}
              </ListGroup>

              {selectedApplication.notes && selectedApplication.notes.length > 0 && (
                <div className="mt-4">
                  <h6 className="mb-2">Notes</h6>
                  <ListGroup>
                    {selectedApplication.notes.map((note) => (
                      <ListGroup.Item key={note.id}>
                        <p className="mb-1">{note.text}</p>
                        <small className="text-muted">{formatDateTime(note.createdAt)}</small>
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                </div>
              )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetailModal(false)}>
            Close
          </Button>
          {selectedApplication && (
            <Button
              variant="primary"
              onClick={() => {
                setShowDetailModal(false);
                navigate(`/student/application/${selectedApplication.id}`);
              }}
            >
              <FiExternalLink className="me-2" />
              View Full Details
            </Button>
          )}
        </Modal.Footer>
      </Modal>

      {/* Timeline Modal */}
      <Modal show={showTimelineModal} onHide={() => setShowTimelineModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <FiActivity className="me-2" />
            Application Timeline
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedApplication && (
            <div className="application-timeline">
              <div className="timeline-item d-flex mb-4">
                <div className="timeline-marker bg-success rounded-circle me-3"></div>
                <div>
                  <h6 className="mb-1">Application Submitted</h6>
                  <p className="text-muted small mb-0">
                    {formatDateTime(selectedApplication.appliedAt)}
                  </p>
                </div>
              </div>

              {selectedApplication.statusUpdatedAt && (
                <div className="timeline-item d-flex mb-4">
                  <div className="timeline-marker bg-info rounded-circle me-3"></div>
                  <div>
                    <h6 className="mb-1">Status Updated</h6>
                    <p className="text-muted small mb-0">
                      {formatDateTime(selectedApplication.statusUpdatedAt)}
                    </p>
                    <Badge bg={getStatusConfig(selectedApplication.status).bg}>
                      {getStatusConfig(selectedApplication.status).label}
                    </Badge>
                  </div>
                </div>
              )}

              {selectedApplication.interviewDate && (
                <div className="timeline-item d-flex mb-4">
                  <div className="timeline-marker bg-warning rounded-circle me-3"></div>
                  <div>
                    <h6 className="mb-1">Interview Scheduled</h6>
                    <p className="text-muted small mb-0">
                      {formatDateTime(selectedApplication.interviewDate)}
                    </p>
                  </div>
                </div>
              )}

              {selectedApplication.statusUpdatedAt &&
                [APPLICATION_STATUS.OFFER, APPLICATION_STATUS.OFFER_EXTENDED].includes(
                  selectedApplication.status
                ) && (
                  <div className="timeline-item d-flex mb-4">
                    <div className="timeline-marker bg-success rounded-circle me-3"></div>
                    <div>
                      <h6 className="mb-1">Offer Received</h6>
                      <p className="text-muted small mb-0">
                        {formatDateTime(selectedApplication.statusUpdatedAt)}
                      </p>
                    </div>
                  </div>
                )}

              {selectedApplication.status === APPLICATION_STATUS.WITHDRAWN &&
                selectedApplication.withdrawnAt && (
                  <div className="timeline-item d-flex">
                    <div className="timeline-marker bg-secondary rounded-circle me-3"></div>
                    <div>
                      <h6 className="mb-1">Application Withdrawn</h6>
                      <p className="text-muted small mb-0">
                        {formatDateTime(selectedApplication.withdrawnAt)}
                      </p>
                    </div>
                  </div>
                )}
            </div>
          )}
        </Modal.Body>
      </Modal>

      {/* Notes Modal */}
      <Modal show={showNotesModal} onHide={() => setShowNotesModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <FiEdit2 className="me-2" />
            Add Note
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedApplication && (
            <>
              <p className="text-muted mb-3">
                Add a note for <strong>{selectedApplication.jobTitle}</strong>
              </p>

              {selectedApplication.notes && selectedApplication.notes.length > 0 && (
                <div className="existing-notes mb-3">
                  <h6 className="mb-2">Existing Notes:</h6>
                  <ListGroup>
                    {selectedApplication.notes.map((note) => (
                      <ListGroup.Item key={note.id}>
                        <p className="mb-1">{note.text}</p>
                        <small className="text-muted">{formatDateTime(note.createdAt)}</small>
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                </div>
              )}

              <Form.Group>
                <Form.Label>New Note</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Write your note here..."
                />
              </Form.Group>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowNotesModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleAddNote} disabled={!noteText.trim()}>
            <FiSave className="me-2" />
            Save Note
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Bulk Actions Modal */}
      <Modal show={showBulkActionsModal} onHide={() => setShowBulkActionsModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <FiAlertTriangle className="text-danger me-2" />
            Bulk Actions
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="warning">
            <FiAlertTriangle className="me-2" />
            You are about to perform actions on {selectedApplications.length} application(s).
          </Alert>
          <p>Choose an action:</p>
          <div className="d-grid gap-2">
            <Button variant="outline-warning" onClick={handleBulkWithdraw}>
              <FiArchive className="me-2" />
              Withdraw All Selected
            </Button>
            <Button variant="outline-danger" onClick={handleBulkDelete}>
              <FiTrash2 className="me-2" />
              Delete All Selected
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Applications;


