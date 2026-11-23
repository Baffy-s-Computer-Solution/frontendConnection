// frontend/src/pages/student/Notifications.jsx
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Badge,
  Spinner,
  Alert,
  Form,
  InputGroup,
  FormControl,
  Dropdown,
  ButtonGroup,
  Modal,
  ListGroup,
  Tab,
  Nav,
  Tabs,
  ProgressBar,
  OverlayTrigger,
  Tooltip,
  Toast,
  ToastContainer,
  Pagination,
  FloatingLabel,
  Accordion,
} from '../../components/ui/tailwindCompat';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
  addDoc,
  writeBatch,
  serverTimestamp,
  Timestamp,
  startAfter,
  endBefore,
  limitToLast,
  increment,
  arrayUnion,
  arrayRemove,
  setDoc,
} from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import {
  FiBell,
  FiBellOff,
  FiCheck,
  FiCheckCircle,
  FiCheckSquare,
  FiSquare,
  FiTrash2,
  FiTrash,
  FiArchive,
  FiInbox,
  FiMail,
  FiMail as FiMailIcon,
  FiMessageSquare,
  FiMessageCircle,
  FiBriefcase,
  FiBook,
  FiBookOpen,
  FiCalendar,
  FiClock,
  FiAlertCircle,
  FiAlertTriangle,
  FiInfo,
  FiStar,
  FiHeart,
  FiThumbsUp,
  FiUser,
  FiUsers,
  FiUserPlus,
  FiUserCheck,
  FiUserX,
  FiEye,
  FiEyeOff,
  FiFilter,
  FiSearch,
  FiX,
  FiMoreVertical,
  FiMoreHorizontal,
  FiSettings,
  FiRefreshCw,
  FiDownload,
  FiUpload,
  FiShare2,
  FiExternalLink,
  FiChevronRight,
  FiChevronLeft,
  FiChevronDown,
  FiChevronUp,
  FiChevronsLeft,
  FiChevronsRight,
  FiVolume2,
  FiSmartphone,
  FiMonitor,
  FiWifi,
  FiWifiOff,
  FiSend,
  FiCornerUpRight,
  FiEdit,
  FiEdit2,
  FiEdit3,
  FiCopy,
  FiPaperclip,
  FiLink,
  FiFile,
  FiFileText,
  FiImage,
  FiVideo,
  FiMic,
  FiHeadphones,
  FiAward,
  FiTrendingUp,
  FiActivity,
  FiZap,
  FiTarget,
  FiFlag,
  FiBookmark,
  FiTag,
  FiHash,
  FiAtSign,
  FiGlobe,
  FiLock,
  FiUnlock,
  FiShield,
  FiKey,
  FiDatabase,
  FiCloud,
  FiServer,
  FiCpu,
  FiHardDrive as FiStorage,
  FiSave,
  FiRotateCcw,
  FiRotateCw,
  FiPlay,
  FiPause,
  FiSkipBack,
  FiSkipForward,
  FiVolume,
  FiVolume1,
  FiRadio,
  FiRss,
  FiCast,
  FiAirplay,
  FiLogIn,
  FiLogOut,
  FiPlus,
  FiMinus,
  FiPlusCircle,
  FiMinusCircle,
  FiXCircle,
  FiHelpCircle,
  FiPackage,
  FiGift,
  FiAward as FiAwardIcon,
  FiTrendingDown,
  FiBarChart2,
  FiPieChart,
  FiCrosshair,
  FiCompass,
  FiNavigation,
  FiMapPin,
  FiHome,
  FiCoffee,
  FiSun,
  FiMoon,
  FiCloudRain,
  FiUmbrella,
  FiFeather,
  FiAnchor,
  FiAperture,
  FiCamera,
  FiCameraOff,
  FiVideoOff,
  FiMicOff,
  FiBluetooth,
  FiBattery,
  FiBatteryCharging,
  FiPower,
  FiZapOff,
  FiWind,
  FiDroplet,
  FiThermometer,
  FiSunrise,
  FiSunset,
  FiCloudSnow,
  FiCloudLightning,
  FiCloudDrizzle,
  FiCloudOff,
  FiSpeaker,
} from 'react-icons/fi';
import {
  MdOutlineNotifications,
  MdOutlineNotificationsActive,
  MdOutlineNotificationsNone,
  MdOutlineNotificationsOff,
  MdOutlineNotificationsPaused,
  MdOutlineMarkEmailRead,
  MdOutlineMarkEmailUnread,
  MdOutlineEmail,
  MdOutlineMailOutline,
  MdOutlineMail,
  MdOutlineChat,
  MdOutlineChatBubble,
  MdOutlineChatBubbleOutline,
  MdOutlineComment,
  MdOutlineQuestionAnswer,
  MdOutlineForum,
  MdOutlineTextsms,
  MdOutlineMessage,
  MdOutlineSupportAgent,
  MdOutlineCampaign,
  MdOutlineAnnouncement,
  MdOutlineNewReleases,
  MdOutlineWhatshot,
  MdOutlineTrendingUp,
  MdOutlineTrendingDown,
  MdOutlineInsights,
  MdOutlineAnalytics,
  MdOutlineAutoGraph,
  MdOutlineQueryStats,
  MdOutlineTimeline,
  MdOutlineSpeed,
  MdOutlineSlowMotionVideo,
  MdOutlineFastForward,
  MdOutlineUpdate,
  MdOutlineHistory,
  MdOutlineRestore,
  MdOutlineRestoreFromTrash,
  MdOutlineDeleteOutline,
  MdOutlineDeleteForever,
  MdOutlineArchive as MdOutlineArchiveIcon,
  MdOutlineUnarchive,
  MdOutlineMoveToInbox,
  MdOutlineOutbox,
  MdOutlineDrafts,
  MdOutlineSend,
  MdOutlineScheduleSend,
  MdOutlineSendAndArchive,
  MdOutlineReply,
  MdOutlineReplyAll,
  MdOutlineForward,
  MdOutlineForwardToInbox,
  MdOutlineMarkAsUnread,
  MdOutlineMarkChatRead,
  MdOutlineMarkChatUnread,
  MdOutlineMarkEmailRead as MdOutlineMarkEmailReadIcon,
  MdOutlineMarkEmailUnread as MdOutlineMarkEmailUnreadIcon,
  MdOutlineMarkunread,
  MdOutlineMarkunreadMailbox,
  MdOutlineAllInbox,
  MdOutlineMoveToInbox as MdOutlineMoveToInboxIcon,
  MdOutlineCancelScheduleSend,
  MdOutlineSnooze,
  MdOutlineAccessAlarm,
  MdOutlineAlarm,
  MdOutlineAlarmAdd,
  MdOutlineAlarmOff,
  MdOutlineAlarmOn,
  MdOutlineAvTimer,
  MdOutlineTimer,
  MdOutlineTimerOff,
  MdOutlineHourglassBottom,
  MdOutlineHourglassEmpty,
  MdOutlineHourglassFull,
  MdOutlineHourglassTop,
  MdOutlinePending,
  MdOutlinePendingActions,
  MdOutlineRunningWithErrors,
  MdOutlineTaskAlt,
  MdOutlineCheckCircleOutline,
  MdOutlineCheckCircle,
  MdOutlineHighlightOff,
  MdOutlineCancel,
  MdOutlineReport,
  MdOutlineReportGmailerrorred,
  MdOutlineReportOff,
  MdOutlineReportProblem,
  MdOutlineWarning,
  MdOutlineWarningAmber,
  MdOutlineError,
  MdOutlineErrorOutline,
  MdOutlineInfo as MdOutlineInfoIcon,
  MdOutlineHelp,
  MdOutlineHelpCenter,
  MdOutlineHelpOutline,
  MdOutlineLiveHelp,
  MdOutlineSupport,
  MdOutlineContactSupport,
  MdOutlineSettings as MdOutlineSettingsIcon,
  MdOutlineTune,
  MdOutlineFilterList,
  MdOutlineFilterListOff,
  MdOutlineSort,
  MdOutlineSwapVert,
  MdOutlineSwapHoriz,
  MdOutlineSwapVerticalCircle,
  MdOutlineLowPriority,
  MdPriorityHigh,
  MdOutlinePriorityHigh,
  MdOutlineLabelImportant,
  MdOutlineLabelOff as MdOutlineLabelOffIcon,
  MdOutlineStarOutline,
  MdOutlineStar,
  MdOutlineStarBorder,
  MdOutlineStarHalf,
  MdOutlineBookmarkBorder,
  MdOutlineFavoriteBorder,
  MdOutlineFavorite,
  MdOutlineThumbUp,
  MdOutlineThumbUpOffAlt,
  MdOutlineThumbDown,
  MdOutlineThumbDownOffAlt,
  MdOutlinePushPin,
  MdOutlinePinEnd,
  MdOutlineAttachFile,
  MdOutlineAttachment,
  MdOutlineLink as MdOutlineLinkIcon,
  MdOutlineLinkOff,
  MdOutlineInsertLink,
  MdOutlineInsertDriveFile,
  MdOutlineFolder,
  MdOutlineFolderOpen,
  MdOutlineCreateNewFolder,
  MdOutlineDriveFileMove,
  MdOutlineFileCopy,
  MdOutlineContentCopy,
  MdOutlineContentCut,
  MdOutlineContentPaste,
  MdOutlineContentPasteOff,
  MdOutlineDownload,
  MdOutlineUpload,
  MdOutlineCloudDownload,
  MdOutlineCloudUpload,
  MdOutlineCloudDone,
  MdOutlineCloudOff,
  MdOutlineCloudSync,
  MdOutlineSync,
  MdOutlineSyncDisabled,
  MdOutlineSyncProblem,
  MdOutlineSystemUpdateAlt,
  MdOutlinePublishedWithChanges,
  MdOutlineChangeCircle,
  MdOutlineCached,
  MdOutlineAutorenew,
  MdOutlineRefresh,
  MdOutlineLoop,
  MdOutlineRepeat,
  MdOutlineRepeatOn,
  MdOutlineRepeatOne,
  MdOutlineRepeatOneOn,
  MdOutlineShuffle,
  MdOutlineShuffleOn,
  MdOutlinePlaylistPlay,
  MdOutlinePlaylistAdd,
  MdOutlinePlaylistAddCheck,
  MdOutlinePlaylistRemove,
  MdOutlineQueue,
  MdOutlineQueueMusic,
  MdOutlineQueuePlayNext,
  MdOutlineAddToQueue,
  MdOutlineRemoveFromQueue,
  MdOutlineLibraryAdd,
  MdOutlineLibraryAddCheck,
  MdOutlineLibraryBooks,
  MdOutlineMenuBook,
  MdOutlineAutoStories,
  MdOutlineLocalLibrary,
  MdOutlineImportContacts,
  MdOutlineContactPage,
  MdOutlineContacts,
  MdOutlinePersonAdd,
  MdOutlinePersonAddAlt,
  MdOutlinePersonRemove,
  MdOutlinePersonOff,
  MdOutlinePersonSearch,
  MdOutlinePersonOutline,
  MdOutlinePerson,
  MdOutlineGroup,
  MdOutlineGroups,
  MdOutlineGroupAdd,
  MdOutlineGroupRemove,
  MdOutlineGroupOff,
  MdOutlineDiversity1,
  MdOutlineDiversity2,
  MdOutlineDiversity3,
  MdOutlineReduceCapacity,
  MdOutlineEscalatorWarning,
  MdOutlineElderly,
  MdOutlineElderlyWoman,
  MdOutlineMan,
  MdOutlineWoman,
  MdOutlineBoy,
  MdOutlineGirl,
  MdOutlineChildCare,
  MdOutlineChildFriendly,
  MdOutlinePregnantWoman,
  MdOutlineAccessibility,
  MdOutlineAccessibilityNew,
  MdOutlineAccessible,
  MdOutlineAccessibleForward,
  MdOutlineBlind,
  MdOutlineAssistWalker,
  MdOutlineWheelchairPickup,
  MdOutlineAirlineSeatIndividualSuite,
  MdOutlineAirlineSeatFlat,
  MdOutlineAirlineSeatFlatAngled,
  MdOutlineAirlineSeatLegroomExtra,
  MdOutlineAirlineSeatLegroomNormal,
  MdOutlineAirlineSeatLegroomReduced,
  MdOutlineAirlineSeatReclineExtra,
  MdOutlineAirlineSeatReclineNormal,
  MdOutlineSevereCold,
  MdOutlineSick,
  MdOutlineCoronavirus,
  MdOutlineVaccines,
  MdOutlineHealthAndSafety,
  MdOutlineMedicalServices,
  MdOutlineLocalHospital,
  MdOutlineEmergency,
  MdOutlineLocalPharmacy,
  MdOutlineMedication,
  MdOutlineMedicationLiquid,
  MdOutlineVaccines as MdOutlineVaccinesIcon,
  MdOutlineBloodtype,
  MdOutlineMonitorHeart,
  MdOutlineFavorite as MdOutlineFavoriteIcon,
  MdOutlineFavoriteBorder as MdOutlineFavoriteBorderIcon,
  MdMonitorHeart,
  MdOutlineMonitorHeart as MdOutlineEcgHeart,
  MdOutlineMonitorWeight,
  MdOutlineFitnessCenter,
  MdOutlineSportsGymnastics,
  MdOutlineSportsMartialArts,
  MdOutlineSportsKabaddi,
  MdOutlineSportsHandball,
  MdOutlineSportsBasketball,
  MdOutlineSportsFootball,
  MdOutlineSportsSoccer,
  MdOutlineSportsBaseball,
  MdOutlineSportsCricket,
  MdOutlineSportsTennis,
  MdOutlineSportsVolleyball,
  MdOutlineSportsRugby,
  MdOutlineSportsHockey,
  MdOutlineSportsGolf,
  MdOutlineSportsEsports,
  MdOutlineSportsMotorsports,
  MdOutlineSportsScore,
  MdOutlineEmojiEvents,
  MdOutlineMilitaryTech,
  MdOutlineWorkspacePremium,
  MdOutlineCardMembership,
  MdOutlineBadge,
  MdOutlineVerified,
  MdOutlineVerifiedUser,
  MdOutlineSecurity,
  MdOutlineGppGood,
  MdOutlineGppBad,
  MdOutlineGppMaybe,
  MdOutlineHealthAndSafety as MdOutlineHealthAndSafetyIcon,
  MdOutlineFingerprint,
  MdOutlineFaceRetouchingNatural,
  MdOutlineFaceRetouchingOff,
  MdOutlineFace,
  MdOutlineFace2,
  MdOutlineFace3,
  MdOutlineFace4,
  MdOutlineFace5,
  MdOutlineFace6,
  MdOutlineEmojiEmotions,
  MdOutlineSentimentSatisfied,
  MdOutlineSentimentDissatisfied,
  MdOutlineSentimentVerySatisfied,
  MdOutlineSentimentVeryDissatisfied,
  MdOutlineSentimentNeutral,
  MdOutlineSentimentSatisfiedAlt,
  MdOutlineMood,
} from 'react-icons/md';
import { FaGraduationCap, FaBriefcase, FaBook, FaFileAlt, FaCalendarAlt, FaBell, FaBellSlash, FaCheckCircle, FaTimesCircle, FaExclamationTriangle, FaInfoCircle, FaClock, FaUser, FaUsers, FaUserPlus, FaUserCheck, FaUserTimes, FaHeart, FaStar, FaThumbsUp, FaEye, FaTrash, FaArchive, FaInbox, FaEnvelope, FaEnvelopeOpen, FaComment, FaComments, FaShare, FaExternalLinkAlt, FaLink, FaPaperclip, FaFile, FaFilePdf, FaFileWord, FaFileExcel, FaFileImage, FaFileVideo, FaFileAudio, FaFileArchive, FaDownload, FaUpload, FaSearch, FaFilter, FaSort, FaSortAmountDown, FaSortAmountUp, FaSync, FaSyncAlt, FaRedo, FaUndo, FaChevronLeft, FaChevronRight, FaChevronUp, FaChevronDown, FaEllipsisV, FaEllipsisH, FaPlus, FaMinus, FaTimes, FaCheck, FaCog, FaSlidersH, FaChartLine, FaChartBar, FaChartPie, FaTrophy, FaMedal, FaAward, FaCertificate, FaHandshake, FaLightbulb, FaRocket, FaBookmark, FaTag, FaTags, FaFlag, FaFire, FaBolt, FaGem, FaCrown, FaGift, FaBirthdayCake, FaGlassCheers, FaTruck, FaShippingFast, FaMapMarkerAlt, FaLocationArrow, FaCompass, FaRoad, FaLaptopCode, FaCode, FaTerminal, FaBug, FaWrench, FaTools, FaHammer, FaDraftingCompass, FaRulerCombined, FaMicroscope, FaFlask, FaAtom, FaDna, FaBrain, FaHeartbeat, FaStethoscope, FaPills, FaSyringe, FaHospital, FaAmbulance, FaShieldAlt, FaShieldVirus, FaCreditCard, FaLock, FaLockOpen, FaKey, FaFingerprint, FaUserShield, FaUserSecret, FaUserTie, FaUserGraduate, FaUserMd, FaUserNurse, FaUserCog, FaUserEdit, FaUserMinus, FaUserFriends, FaUsersCog, FaUserAstronaut, FaUserNinja, FaUserSecret as FaUserSecretIcon, FaPhone, FaPhoneAlt, FaPhoneSlash, FaPhoneVolume, FaMobile, FaMobileAlt, FaTablet, FaTabletAlt, FaLaptop, FaDesktop, FaTv, FaPrint, FaFax, FaWifi, FaBluetooth, FaBatteryFull, FaBatteryHalf, FaBatteryQuarter, FaBatteryEmpty, FaPlug, FaPowerOff, FaMicrochip, FaMemory, FaHdd, FaSdCard, FaUsb, FaEthernet, FaNetworkWired, FaServer, FaDatabase, FaCloud, FaCloudDownloadAlt, FaCloudUploadAlt, FaCloudSun, FaCloudMoon, FaCloudRain, FaCloudShowersHeavy, FaSnowflake, FaSun, FaMoon, FaStar as FaStarIcon, FaStarHalfAlt, FaRegStar, FaRegHeart, FaRegClock, FaRegCalendarAlt, FaRegCalendarCheck, FaRegEnvelope, FaRegEnvelopeOpen, FaRegFileAlt, FaRegFilePdf, FaRegFileImage, FaRegFileVideo, FaRegFileAudio, FaRegFileArchive, FaRegSmile, FaRegSmileBeam, FaRegGrin, FaRegGrinBeam, FaRegGrinHearts, FaRegGrinStars, FaRegGrinTears, FaRegLaugh, FaRegLaughBeam, FaRegLaughSquint, FaRegLaughWink, FaRegMeh, FaRegMehBlank, FaRegMehRollingEyes, FaRegFrown, FaRegFrownOpen, FaRegSadCry, FaRegSadTear, FaRegSurprise, FaRegTired, FaRegAngry, FaRegDizzy, FaRegFlushed, FaRegGrimace, FaRegKiss, FaRegKissBeam, FaRegKissWinkHeart, FaRegComments, FaRegComment, FaRegCommentDots, FaRegPaperPlane, FaRegShareSquare, FaRegBookmark, FaRegBell, FaRegLightbulb, FaRegHourglass, FaRegListAlt, FaRegCheckCircle, FaRegTimesCircle, FaRegQuestionCircle, FaRegEye, FaRegEyeSlash, FaRegCopy, FaRegEdit, FaRegTrashAlt, FaRegSave, FaRegFolder, FaRegFolderOpen, FaRegBuilding, FaRegIdCard, FaRegAddressCard, FaRegAddressBook, FaRegCreditCard, FaRegMoneyBillAlt, FaRegChartBar, FaRegHandshake, FaRegThumbsUp, FaRegThumbsDown, FaRegArrowAltCircleRight, FaRegArrowAltCircleLeft, FaRegArrowAltCircleUp, FaRegArrowAltCircleDown } from "react-icons/fa";
import { RiNotificationLine, RiNotificationOffLine, RiNotificationBadgeLine } from 'react-icons/ri';

import { auth, db } from '../../config/firebase';
import { useAuth } from '../../context/AuthContext';
import { useStudent } from '../../context/StudentContext';
import { useNotification } from '../../context/NotificationContext';
import notificationService from '../../services/notificationService';
import settingsService from '../../services/settingsService';
import supabaseService from '../../services/supabaseService';

// ============================================
// CONSTANTS & CONFIGURATION
// ============================================

const NOTIFICATION_TYPES = {
  APPLICATION: 'application',
  JOB: 'job',
  COURSE: 'course',
  MENTORSHIP: 'mentorship',
  DEADLINE: 'deadline',
  MESSAGE: 'message',
  SOCIAL: 'social',
  RECOMMENDATION: 'recommendation',
  SYSTEM: 'system',
  SECURITY: 'security',
  PAYMENT: 'payment',
  DOCUMENT: 'document',
  MILESTONE: 'milestone',
  EVENT: 'event',
  EVENT_REMINDER: 'event_reminder',
  ACHIEVEMENT: 'achievement',
  ANNOUNCEMENT: 'announcement',
  INTERVIEW: 'interview',
};

const NOTIFICATION_PRIORITIES = {
  URGENT: 'urgent',
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
};

const NOTIFICATION_STATUS = {
  UNREAD: 'unread',
  READ: 'read',
  ARCHIVED: 'archived',
  DELETED: 'deleted',
  SNOOZED: 'snoozed',
  PINNED: 'pinned',
};

const NOTIFICATION_CATEGORIES = {
  ALL: 'all',
  UNREAD: 'unread',
  PINNED: 'pinned',
  ARCHIVED: 'archived',
  SNOOZED: 'snoozed',
};

const FILTER_OPTIONS = {
  TODAY: 'today',
  YESTERDAY: 'yesterday',
  THIS_WEEK: 'this_week',
  THIS_MONTH: 'this_month',
  CUSTOM: 'custom',
};

const SORT_OPTIONS = {
  NEWEST: 'newest',
  OLDEST: 'oldest',
  PRIORITY: 'priority',
  TYPE: 'type',
};

const NOTIFICATIONS_PER_PAGE = 20;
const MAX_BATCH_SIZE = 500;

const TYPE_ICONS = {
  [NOTIFICATION_TYPES.APPLICATION]: { icon: FaBriefcase, color: '#2563eb', bg: '#dbeafe' },
  [NOTIFICATION_TYPES.JOB]: { icon: FaBriefcase, color: '#7c3aed', bg: '#ede9fe' },
  [NOTIFICATION_TYPES.COURSE]: { icon: FaBook, color: '#10b981', bg: '#d1fae5' },
  [NOTIFICATION_TYPES.MENTORSHIP]: { icon: FaUsers, color: '#0891b2', bg: '#cffafe' },
  [NOTIFICATION_TYPES.DEADLINE]: { icon: FaCalendarAlt, color: '#dc2626', bg: '#fee2e2' },
  [NOTIFICATION_TYPES.MESSAGE]: { icon: FaComment, color: '#4f46e5', bg: '#e0e7ff' },
  [NOTIFICATION_TYPES.SOCIAL]: { icon: FaUsers, color: '#db2777', bg: '#fce7f3' },
  [NOTIFICATION_TYPES.RECOMMENDATION]: { icon: FaStar, color: '#f59e0b', bg: '#fef3c7' },
  [NOTIFICATION_TYPES.SYSTEM]: { icon: FaCog, color: '#64748b', bg: '#f1f5f9' },
  [NOTIFICATION_TYPES.SECURITY]: { icon: FaShieldAlt, color: '#b91c1c', bg: '#fee2e2' },
  [NOTIFICATION_TYPES.PAYMENT]: { icon: FaCreditCard, color: '#059669', bg: '#d1fae5' },
  [NOTIFICATION_TYPES.DOCUMENT]: { icon: FaFileAlt, color: '#7c3aed', bg: '#ede9fe' },
  [NOTIFICATION_TYPES.MILESTONE]: { icon: FaTrophy, color: '#d97706', bg: '#fef3c7' },
  [NOTIFICATION_TYPES.EVENT]: { icon: FaCalendarAlt, color: '#2563eb', bg: '#dbeafe' },
  [NOTIFICATION_TYPES.EVENT_REMINDER]: { icon: FaClock, color: '#f59e0b', bg: '#fef3c7' },
  [NOTIFICATION_TYPES.ACHIEVEMENT]: { icon: FaAward, color: '#eab308', bg: '#fef9c3' },
  [NOTIFICATION_TYPES.ANNOUNCEMENT]: { icon: FaBell, color: '#9333ea', bg: '#f3e8ff' },
  [NOTIFICATION_TYPES.INTERVIEW]: { icon: FaUserTie, color: '#0891b2', bg: '#cffafe' },
};

const PRIORITY_COLORS = {
  [NOTIFICATION_PRIORITIES.URGENT]: { bg: '#dc2626', color: '#ffffff' },
  [NOTIFICATION_PRIORITIES.HIGH]: { bg: '#f59e0b', color: '#ffffff' },
  [NOTIFICATION_PRIORITIES.MEDIUM]: { bg: '#2563eb', color: '#ffffff' },
  [NOTIFICATION_PRIORITIES.LOW]: { bg: '#64748b', color: '#ffffff' },
};

// ============================================
// HELPER FUNCTIONS
// ============================================

const formatRelativeTime = (timestamp) => {
  if (!timestamp) return 'Just now';

  let date;
  try {
    if (timestamp instanceof Timestamp) {
      date = timestamp.toDate();
    } else if (timestamp?.toDate) {
      date = timestamp.toDate();
    } else if (typeof timestamp === 'string') {
      date = new Date(timestamp);
    } else if (typeof timestamp === 'number') {
      date = new Date(timestamp);
    } else if (timestamp instanceof Date) {
      date = timestamp;
    } else {
      date = new Date(timestamp);
    }

    if (isNaN(date.getTime())) return 'Just now';
  } catch (error) {
    return 'Just now';
  }

  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 604800)}w ago`;

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
};

const formatFullTime = (timestamp) => {
  if (!timestamp) return 'Unknown';

  let date;
  try {
    if (timestamp instanceof Timestamp) {
      date = timestamp.toDate();
    } else if (timestamp?.toDate) {
      date = timestamp.toDate();
    } else if (typeof timestamp === 'string') {
      date = new Date(timestamp);
    } else if (timestamp instanceof Date) {
      date = timestamp;
    } else {
      date = new Date(timestamp);
    }

    if (isNaN(date.getTime())) return 'Unknown';
  } catch (error) {
    return 'Unknown';
  }

  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getDateGroup = (timestamp) => {
  if (!timestamp) return 'Earlier';

  let date;
  try {
    if (timestamp instanceof Timestamp) {
      date = timestamp.toDate();
    } else if (timestamp?.toDate) {
      date = timestamp.toDate();
    } else if (typeof timestamp === 'string') {
      date = new Date(timestamp);
    } else {
      date = new Date(timestamp);
    }
  } catch (error) {
    return 'Earlier';
  }

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const lastWeek = new Date(today);
  lastWeek.setDate(lastWeek.getDate() - 7);
  const lastMonth = new Date(today);
  lastMonth.setMonth(lastMonth.getMonth() - 1);

  if (date >= today) return 'Today';
  if (date >= yesterday) return 'Yesterday';
  if (date >= lastWeek) return 'This Week';
  if (date >= lastMonth) return 'This Month';
  return 'Earlier';
};

const groupNotificationsByDate = (notifications) => {
  const groups = {};

  notifications.forEach((notification) => {
    const group = getDateGroup(notification.createdAt);
    if (!groups[group]) {
      groups[group] = [];
    }
    groups[group].push(notification);
  });

  // Order groups: Today, Yesterday, This Week, This Month, Earlier
  const order = ['Today', 'Yesterday', 'This Week', 'This Month', 'Earlier'];
  const orderedGroups = {};

  order.forEach((key) => {
    if (groups[key]) {
      orderedGroups[key] = groups[key];
    }
  });

  return orderedGroups;
};

const getPriorityOrder = (priority) => {
  const order = { urgent: 0, high: 1, medium: 2, low: 3 };
  return order[priority] || 4;
};

const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

const isNotificationToday = (timestamp) => {
  if (!timestamp) return false;
  let date;
  try {
    if (timestamp instanceof Timestamp) {
      date = timestamp.toDate();
    } else {
      date = new Date(timestamp);
    }
  } catch (error) {
    return false;
  }

  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

// ============================================
// MAIN COMPONENT
// ============================================

const toNotificationText = (value) => {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  if (Array.isArray(value)) {
    return value.map(toNotificationText).filter(Boolean).join(', ');
  }
  if (typeof value === 'object') {
    const textValue = value.message || value.body || value.title || value.text || value.description;
    if (textValue !== undefined) return toNotificationText(textValue);
    try {
      return JSON.stringify(value);
    } catch {
      return '';
    }
  }
  return '';
};

const Notifications = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, userData } = useAuth();
  const { studentData } = useStudent();
  const { showNotification } = useNotification();

  // ============================================
  // STATE MANAGEMENT
  // ============================================

  // Data states
  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Pagination
  const [pagination, setPagination] = useState({
    currentPage: 1,
    itemsPerPage: NOTIFICATIONS_PER_PAGE,
    totalPages: 1,
    hasMore: true,
    lastDoc: null,
  });

  // Filters and sorting
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState(NOTIFICATION_CATEGORIES.ALL);
  const [activeType, setActiveType] = useState('all');
  const [activePriority, setActivePriority] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [sortBy, setSortBy] = useState(SORT_OPTIONS.NEWEST);
  const [sortOrder, setSortOrder] = useState('desc');

  // Selection
  const [selectedNotifications, setSelectedNotifications] = useState([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectAll, setSelectAll] = useState(false);

  // Modals
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSnoozeModal, setShowSnoozeModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showBulkActionsModal, setShowBulkActionsModal] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);

  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    inAppNotifications: true,
    soundEnabled: true,
    showPreview: true,
    groupingEnabled: true,
    quietHoursEnabled: false,
    quietHoursStart: '22:00',
    quietHoursEnd: '07:00',
    categories: {
      application: true,
      job: true,
      course: true,
      mentorship: true,
      deadline: true,
      message: true,
      social: true,
      recommendation: true,
      system: true,
      security: true,
      payment: true,
      document: true,
      milestone: true,
      event: true,
      achievement: true,
      announcement: true,
      interview: true,
    },
  });

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    unread: 0,
    today: 0,
    thisWeek: 0,
    pinned: 0,
    archived: 0,
    byType: {},
    byPriority: {},
  });

  // Real-time listener ref
  const unsubscribeRef = useRef(null);
  const searchTimeoutRef = useRef(null);
  const audioRef = useRef(null);

  // ============================================
  // COMPUTED VALUES
  // ============================================

  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.read && !n.archived && !n.deleted).length;
  }, [notifications]);

  const pinnedCount = useMemo(() => {
    return notifications.filter((n) => n.pinned && !n.deleted).length;
  }, [notifications]);

  const archivedCount = useMemo(() => {
    return notifications.filter((n) => n.archived && !n.deleted).length;
  }, [notifications]);

  const visibleNotifications = useMemo(() => {
    return notifications.filter((n) => !n.deleted);
  }, [notifications]);

  // ============================================
  // EFFECTS
  // ============================================

  // Initial load and real-time listener
  useEffect(() => {
    if (!currentUser?.uid) {
      setLoading(false);
      return;
    }

    setupRealtimeListener();
    loadNotificationSettings();

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [currentUser?.uid]);

  // Apply filters when notifications or filters change
  useEffect(() => {
    applyFilters();
  }, [notifications, searchTerm, activeCategory, activeType, activePriority, dateFilter, sortBy, sortOrder]);

  // Update stats
  useEffect(() => {
    calculateStats();
  }, [notifications]);

  // ============================================
  // DATA LOADING
  // ============================================

  const setupRealtimeListener = useCallback(() => {
    if (!currentUser?.uid) return;

    // Clean up previous listener
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
    }

    try {
      const notificationsQuery = query(
        collection(db, 'notifications'),
        where('userId', '==', currentUser.uid),
        limit(MAX_BATCH_SIZE)
      );

      const unsubscribe = onSnapshot(
        notificationsQuery,
        (snapshot) => {
          const newNotifications = snapshot.docs.map((doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data,
              title: toNotificationText(data.title || data.subject) || 'Notification',
              message: toNotificationText(data.message || data.body || data.details),
              body: toNotificationText(data.body),
              details: toNotificationText(data.details),
              senderName: toNotificationText(data.senderName || data.sender),
              type: toNotificationText(data.type || data.category || 'system').toLowerCase(),
              priority: toNotificationText(data.priority).toLowerCase(),
              createdAt: data.createdAt?.toDate?.() || new Date(),
              updatedAt: data.updatedAt?.toDate?.() || new Date(),
              readAt: data.readAt?.toDate?.() || null,
              archivedAt: data.archivedAt?.toDate?.() || null,
              deletedAt: data.deletedAt?.toDate?.() || null,
              snoozedUntil: data.snoozedUntil?.toDate?.() || null,
            };
          });

          setNotifications(newNotifications);
          setLoading(false);
          setRefreshing(false);
        },
        (error) => {
          console.error('Real-time listener error:', error);
          setError('Failed to load notifications. Please try again.');
          setLoading(false);
          setRefreshing(false);
        }
      );

      unsubscribeRef.current = unsubscribe;
    } catch (error) {
      console.error('Error setting up listener:', error);
      setError('Failed to load notifications');
      setLoading(false);
    }
  }, [currentUser?.uid]);

  const loadNotificationSettings = async () => {
    try {
      const result = await settingsService.getNotificationPreferences(currentUser.uid);
      if (result.success && result.data) {
        setNotificationSettings((prev) => ({ ...prev, ...result.data }));
      }
    } catch (error) {
      console.error('Error loading notification settings:', error);
    }
  };

  const refreshNotifications = async () => {
    setRefreshing(true);
    // The real-time listener will handle the refresh
    setTimeout(() => setRefreshing(false), 1000);
  };

  // ============================================
  // FILTERING & SORTING
  // ============================================

  const applyFilters = useCallback(() => {
    let filtered = [...notifications];

    // Filter out deleted unless viewing deleted
    if (activeCategory !== 'deleted') {
      filtered = filtered.filter((n) => !n.deleted);
    } else {
      filtered = filtered.filter((n) => n.deleted);
    }

    // Category filter
    switch (activeCategory) {
      case NOTIFICATION_CATEGORIES.UNREAD:
        filtered = filtered.filter((n) => !n.read);
        break;
      case NOTIFICATION_CATEGORIES.PINNED:
        filtered = filtered.filter((n) => n.pinned);
        break;
      case NOTIFICATION_CATEGORIES.ARCHIVED:
        filtered = filtered.filter((n) => n.archived);
        break;
      case NOTIFICATION_CATEGORIES.SNOOZED:
        filtered = filtered.filter((n) => n.snoozedUntil && new Date(n.snoozedUntil) > new Date());
        break;
      default:
        // 'all' category - show non-archived
        if (activeCategory === NOTIFICATION_CATEGORIES.ALL) {
          filtered = filtered.filter((n) => !n.archived);
        }
    }

    // Type filter
    if (activeType !== 'all') {
      filtered = filtered.filter((n) => n.type === activeType);
    }

    // Priority filter
    if (activePriority !== 'all') {
      filtered = filtered.filter((n) => n.priority === activePriority);
    }

    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      let cutoffDate = new Date();

      switch (dateFilter) {
        case FILTER_OPTIONS.TODAY:
          cutoffDate.setHours(0, 0, 0, 0);
          break;
        case FILTER_OPTIONS.YESTERDAY:
          cutoffDate.setDate(now.getDate() - 1);
          cutoffDate.setHours(0, 0, 0, 0);
          break;
        case FILTER_OPTIONS.THIS_WEEK:
          cutoffDate.setDate(now.getDate() - 7);
          break;
        case FILTER_OPTIONS.THIS_MONTH:
          cutoffDate.setMonth(now.getMonth() - 1);
          break;
        default:
          cutoffDate = null;
      }

      if (cutoffDate) {
        filtered = filtered.filter((n) => {
          const notifDate = n.createdAt instanceof Date ? n.createdAt : new Date(n.createdAt);
          return notifDate >= cutoffDate;
        });
      }
    }

    // Search filter
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(
        (n) =>
          n.title?.toLowerCase().includes(search) ||
          n.message?.toLowerCase().includes(search) ||
          n.body?.toLowerCase().includes(search) ||
          n.details?.toLowerCase().includes(search) ||
          n.senderName?.toLowerCase().includes(search)
      );
    }

    // Sorting
    filtered.sort((a, b) => {
      // Pinned always on top
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;

      switch (sortBy) {
        case SORT_OPTIONS.NEWEST:
          return new Date(b.createdAt) - new Date(a.createdAt);
        case SORT_OPTIONS.OLDEST:
          return new Date(a.createdAt) - new Date(b.createdAt);
        case SORT_OPTIONS.PRIORITY:
          return getPriorityOrder(a.priority) - getPriorityOrder(b.priority);
        case SORT_OPTIONS.TYPE:
          return (a.type || '').localeCompare(b.type || '');
        default:
          return 0;
      }
    });

    // Apply sort order (reverse if asc)
    if (sortOrder === 'asc' && sortBy !== SORT_OPTIONS.PRIORITY) {
      filtered.reverse();
    }

    setFilteredNotifications(filtered);

    // Update pagination
    setPagination((prev) => ({
      ...prev,
      currentPage: 1,
      totalPages: Math.ceil(filtered.length / prev.itemsPerPage),
    }));
  }, [
    notifications,
    activeCategory,
    activeType,
    activePriority,
    dateFilter,
    searchTerm,
    sortBy,
    sortOrder,
  ]);

  const calculateStats = () => {
    const total = notifications.filter((n) => !n.deleted).length;
    const unread = notifications.filter((n) => !n.read && !n.deleted && !n.archived).length;
    const today = notifications.filter((n) => !n.deleted && isNotificationToday(n.createdAt)).length;
    const thisWeek = notifications.filter((n) => {
      if (n.deleted) return false;
      const date = n.createdAt instanceof Date ? n.createdAt : new Date(n.createdAt);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return date >= weekAgo;
    }).length;

    const pinned = notifications.filter((n) => n.pinned && !n.deleted).length;
    const archived = notifications.filter((n) => n.archived && !n.deleted).length;

    const byType = {};
    const byPriority = {};

    notifications.forEach((n) => {
      if (n.deleted) return;
      if (n.type) {
        byType[n.type] = (byType[n.type] || 0) + 1;
      }
      if (n.priority) {
        byPriority[n.priority] = (byPriority[n.priority] || 0) + 1;
      }
    });

    setStats({
      total,
      unread,
      today,
      thisWeek,
      pinned,
      archived,
      byType,
      byPriority,
    });
  };

  // ============================================
  // NOTIFICATION ACTIONS
  // ============================================

  const handleMarkAsRead = async (notificationId) => {
    try {
      const notifRef = doc(db, 'notifications', notificationId);
      await updateDoc(notifRef, {
        read: true,
        readAt: serverTimestamp(),
      });

      // Update local state
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, read: true, readAt: new Date() } : n
        )
      );

      toast.success('Marked as read');
    } catch (error) {
      console.error('Error marking as read:', error);
      toast.error('Failed to mark as read');
    }
  };

  const handleMarkAsUnread = async (notificationId) => {
    try {
      const notifRef = doc(db, 'notifications', notificationId);
      await updateDoc(notifRef, {
        read: false,
        readAt: null,
      });

      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: false, readAt: null } : n))
      );

      toast.success('Marked as unread');
    } catch (error) {
      console.error('Error marking as unread:', error);
      toast.error('Failed to mark as unread');
    }
  };

  const handleToggleRead = async (notification) => {
    if (notification.read) {
      await handleMarkAsUnread(notification.id);
    } else {
      await handleMarkAsRead(notification.id);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter((n) => !n.read && !n.deleted);

      if (unreadNotifications.length === 0) {
        toast.info('No unread notifications');
        return;
      }

      // Use batch write for efficiency
      const batch = writeBatch(db);

      unreadNotifications.forEach((notification) => {
        const notifRef = doc(db, 'notifications', notification.id);
        batch.update(notifRef, {
          read: true,
          readAt: serverTimestamp(),
        });
      });

      await batch.commit();

      // Update local state
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, read: true, readAt: n.readAt || new Date() }))
      );

      toast.success(`Marked ${unreadNotifications.length} notifications as read`);
    } catch (error) {
      console.error('Error marking all as read:', error);
      toast.error('Failed to mark all as read');
    }
  };

  const handlePin = async (notificationId, shouldPin = true) => {
    try {
      const notifRef = doc(db, 'notifications', notificationId);
      await updateDoc(notifRef, {
        pinned: shouldPin,
        pinnedAt: shouldPin ? serverTimestamp() : null,
      });

      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, pinned: shouldPin } : n))
      );

      toast.success(shouldPin ? 'Pinned' : 'Unpinned');
    } catch (error) {
      console.error('Error pinning notification:', error);
      toast.error('Failed to pin notification');
    }
  };

  const handleArchive = async (notificationId, shouldArchive = true) => {
    try {
      const notifRef = doc(db, 'notifications', notificationId);
      await updateDoc(notifRef, {
        archived: shouldArchive,
        archivedAt: shouldArchive ? serverTimestamp() : null,
      });

      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, archived: shouldArchive } : n))
      );

      toast.success(shouldArchive ? 'Archived' : 'Unarchived');
    } catch (error) {
      console.error('Error archiving notification:', error);
      toast.error('Failed to archive notification');
    }
  };

  const handleDelete = async (notificationId, permanent = false) => {
    try {
      if (permanent) {
        await deleteDoc(doc(db, 'notifications', notificationId));
        setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
        toast.success('Notification deleted permanently');
      } else {
        const notifRef = doc(db, 'notifications', notificationId);
        await updateDoc(notifRef, {
          deleted: true,
          deletedAt: serverTimestamp(),
        });

        setNotifications((prev) =>
          prev.map((n) => (n.id === notificationId ? { ...n, deleted: true } : n))
        );

        toast.success('Notification moved to trash');
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Failed to delete notification');
    }
  };

  const handleRestore = async (notificationId) => {
    try {
      const notifRef = doc(db, 'notifications', notificationId);
      await updateDoc(notifRef, {
        deleted: false,
        deletedAt: null,
      });

      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, deleted: false } : n))
      );

      toast.success('Notification restored');
    } catch (error) {
      console.error('Error restoring notification:', error);
      toast.error('Failed to restore notification');
    }
  };

  const handleSnooze = async (notificationId, snoozeUntil) => {
    try {
      const notifRef = doc(db, 'notifications', notificationId);
      await updateDoc(notifRef, {
        snoozedUntil: Timestamp.fromDate(snoozeUntil),
        snoozedAt: serverTimestamp(),
      });

      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, snoozedUntil } : n))
      );

      setShowSnoozeModal(false);
      toast.success(`Snoozed until ${snoozeUntil.toLocaleString()}`);
    } catch (error) {
      console.error('Error snoozing notification:', error);
      toast.error('Failed to snooze notification');
    }
  };

  const handleBulkMarkAsRead = async () => {
    if (selectedNotifications.length === 0) return;

    try {
      const batch = writeBatch(db);

      selectedNotifications.forEach((id) => {
        const notifRef = doc(db, 'notifications', id);
        batch.update(notifRef, {
          read: true,
          readAt: serverTimestamp(),
        });
      });

      await batch.commit();

      setNotifications((prev) =>
        prev.map((n) => (selectedNotifications.includes(n.id) ? { ...n, read: true } : n))
      );

      toast.success(`Marked ${selectedNotifications.length} notifications as read`);
      clearSelection();
    } catch (error) {
      console.error('Error bulk marking as read:', error);
      toast.error('Failed to mark notifications as read');
    }
  };

  const handleBulkArchive = async () => {
    if (selectedNotifications.length === 0) return;

    try {
      const batch = writeBatch(db);

      selectedNotifications.forEach((id) => {
        const notifRef = doc(db, 'notifications', id);
        batch.update(notifRef, {
          archived: true,
          archivedAt: serverTimestamp(),
        });
      });

      await batch.commit();

      setNotifications((prev) =>
        prev.map((n) => (selectedNotifications.includes(n.id) ? { ...n, archived: true } : n))
      );

      toast.success(`Archived ${selectedNotifications.length} notifications`);
      clearSelection();
    } catch (error) {
      console.error('Error bulk archiving:', error);
      toast.error('Failed to archive notifications');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedNotifications.length === 0) return;

    try {
      const batch = writeBatch(db);

      selectedNotifications.forEach((id) => {
        const notifRef = doc(db, 'notifications', id);
        batch.update(notifRef, {
          deleted: true,
          deletedAt: serverTimestamp(),
        });
      });

      await batch.commit();

      setNotifications((prev) =>
        prev.map((n) => (selectedNotifications.includes(n.id) ? { ...n, deleted: true } : n))
      );

      toast.success(`Deleted ${selectedNotifications.length} notifications`);
      clearSelection();
      setShowBulkActionsModal(false);
    } catch (error) {
      console.error('Error bulk deleting:', error);
      toast.error('Failed to delete notifications');
    }
  };

  const handleDeleteAllRead = async () => {
    try {
      const readNotifications = notifications.filter((n) => n.read && !n.deleted);

      if (readNotifications.length === 0) {
        toast.info('No read notifications to delete');
        return;
      }

      const batch = writeBatch(db);

      readNotifications.forEach((notification) => {
        const notifRef = doc(db, 'notifications', notification.id);
        batch.update(notifRef, {
          deleted: true,
          deletedAt: serverTimestamp(),
        });
      });

      await batch.commit();

      setNotifications((prev) =>
        prev.map((n) => (n.read && !n.deleted ? { ...n, deleted: true } : n))
      );

      toast.success(`Deleted ${readNotifications.length} read notifications`);
    } catch (error) {
      console.error('Error deleting read notifications:', error);
      toast.error('Failed to delete notifications');
    }
  };

  const handleDeleteAll = async () => {
    try {
      const activeNotifications = notifications.filter((n) => !n.deleted);

      if (activeNotifications.length === 0) {
        toast.info('No notifications to delete');
        return;
      }

      const batch = writeBatch(db);

      activeNotifications.forEach((notification) => {
        const notifRef = doc(db, 'notifications', notification.id);
        batch.update(notifRef, {
          deleted: true,
          deletedAt: serverTimestamp(),
        });
      });

      await batch.commit();

      setNotifications((prev) => prev.map((n) => ({ ...n, deleted: true })));

      toast.success(`Deleted ${activeNotifications.length} notifications`);
      setShowDeleteModal(false);
    } catch (error) {
      console.error('Error deleting all notifications:', error);
      toast.error('Failed to delete notifications');
    }
  };

  const handleEmptyTrash = async () => {
    try {
      const deletedNotifications = notifications.filter((n) => n.deleted);

      if (deletedNotifications.length === 0) {
        toast.info('Trash is already empty');
        return;
      }

      const batch = writeBatch(db);

      deletedNotifications.forEach((notification) => {
        batch.delete(doc(db, 'notifications', notification.id));
      });

      await batch.commit();

      setNotifications((prev) => prev.filter((n) => !n.deleted));

      toast.success('Trash emptied');
    } catch (error) {
      console.error('Error emptying trash:', error);
      toast.error('Failed to empty trash');
    }
  };

  // ============================================
  // SELECTION HANDLING
  // ============================================

  const toggleSelection = (notificationId) => {
    setSelectedNotifications((prev) =>
      prev.includes(notificationId)
        ? prev.filter((id) => id !== notificationId)
        : [...prev, notificationId]
    );
  };

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedNotifications([]);
      setSelectAll(false);
    } else {
      const visibleIds = getPaginatedNotifications().map((n) => n.id);
      setSelectedNotifications(visibleIds);
      setSelectAll(true);
    }
  };

  const clearSelection = () => {
    setSelectedNotifications([]);
    setSelectAll(false);
    setIsSelectionMode(false);
  };

  // ============================================
  // NOTIFICATION CLICK HANDLING
  // ============================================

  const handleNotificationClick = async (notification) => {
    // Mark as read
    if (!notification.read) {
      await handleMarkAsRead(notification.id);
    }

    // Handle navigation based on type
    const route = getNotificationRoute(notification);
    if (route) {
      navigate(route);
    } else {
      // Show detail modal
      setSelectedNotification(notification);
      setShowDetailModal(true);
    }
  };

  const getNotificationRoute = (notification) => {
    if (!notification) return null;

    const { type, data, link } = notification;

    if (['friend_request', 'friend_request_accepted', 'connection_request', 'connection_request_accepted'].includes(type)) {
      return '/student/friends';
    }

    // If explicit link is provided, use it
    if (link) return link;

    // Otherwise, generate route based on type and data
    switch (type) {
      case NOTIFICATION_TYPES.APPLICATION:
        if (data?.applicationId) return `/student/applications/${data.applicationId}`;
        return '/student/applications';

      case NOTIFICATION_TYPES.JOB:
        if (data?.jobId) return `/student/jobs/${data.jobId}`;
        return '/student/jobs';

      case NOTIFICATION_TYPES.COURSE:
        if (data?.courseId) return `/student/courses/${data.courseId}`;
        return '/student/courses';

      case NOTIFICATION_TYPES.MENTORSHIP:
        if (data?.sessionId) return `/student/mentorship/sessions/${data.sessionId}`;
        return '/student/mentorship';

      case NOTIFICATION_TYPES.DEADLINE:
        return '/student/deadlines';

      case NOTIFICATION_TYPES.MESSAGE:
        if (data?.conversationId) return `/student/messages/${data.conversationId}`;
        return '/student/messages';

      case NOTIFICATION_TYPES.SOCIAL:
        return '/student/social';

      case NOTIFICATION_TYPES.RECOMMENDATION:
        return '/student/recommendations';

      case NOTIFICATION_TYPES.SECURITY:
        return '/student/settings?tab=security';

      case NOTIFICATION_TYPES.PAYMENT:
        return '/student/billing';

      case NOTIFICATION_TYPES.DOCUMENT:
        return '/student/documents';

      case NOTIFICATION_TYPES.MILESTONE:
        return '/student/achievements';

      case NOTIFICATION_TYPES.EVENT:
      case NOTIFICATION_TYPES.EVENT_REMINDER:
        return '/student/calendar';

      case NOTIFICATION_TYPES.ACHIEVEMENT:
        return '/student/achievements';

      case NOTIFICATION_TYPES.INTERVIEW:
        if (data?.applicationId) return `/student/applications/${data.applicationId}`;
        return '/student/applications';

      default:
        return null;
    }
  };

  // ============================================
  // PAGINATION
  // ============================================

  const getPaginatedNotifications = () => {
    const startIndex = (pagination.currentPage - 1) * pagination.itemsPerPage;
    const endIndex = startIndex + pagination.itemsPerPage;
    return filteredNotifications.slice(startIndex, endIndex);
  };

  const handlePageChange = (page) => {
    setPagination((prev) => ({ ...prev, currentPage: page }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ============================================
  // RENDER HELPERS
  // ============================================

  const getNotificationIcon = (type) => {
    const config = TYPE_ICONS[type] || { icon: FaBell, color: '#64748b', bg: '#f1f5f9' };
    const IconComponent = config.icon;
    return { Icon: IconComponent, color: config.color, bg: config.bg };
  };

  const getPriorityBadge = (priority) => {
    if (!priority) return null;
    const config = PRIORITY_COLORS[priority] || { bg: '#64748b', color: '#ffffff' };
    return (
      <Badge
        style={{
          backgroundColor: config.bg,
          color: config.color,
          fontSize: '0.7rem',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
        }}
      >
        {priority}
      </Badge>
    );
  };

  const getTypeBadge = (type) => {
    if (!type) return null;
    const typeName = type.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
    const config = TYPE_ICONS[type] || { color: '#64748b', bg: '#f1f5f9' };
    return (
      <Badge
        style={{
          backgroundColor: config.bg,
          color: config.color,
          fontSize: '0.7rem',
          fontWeight: 600,
        }}
      >
        {typeName}
      </Badge>
    );
  };

  // ============================================
  // LOADING & ERROR STATES
  // ============================================

  if (loading) {
    return (
      <Container fluid className="notifications-loading-container min-h-screen bg-slate-50 px-4 py-8 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
        <div className="text-center">
          <Spinner animation="border" variant="primary" style={{ width: '3rem', height: '3rem' }} />
          <h5 className="mt-4 text-muted">Loading your notifications...</h5>
          <p className="text-muted small">This won&apos;t take long</p>
        </div>
      </Container>
    );
  }

  if (error && notifications.length === 0) {
    return (
      <Container fluid className="notifications-error-container min-h-screen bg-slate-50 px-4 py-8 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
        <Card className="text-center border-0 shadow-sm mx-auto" style={{ maxWidth: '500px' }}>
          <Card.Body className="py-5">
            <FiAlertCircle size={64} className="text-danger mb-4" />
            <h4>Unable to Load Notifications</h4>
            <p className="text-muted mb-4">{error}</p>
            <Button variant="primary" onClick={refreshNotifications} disabled={refreshing}>
              {refreshing ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Retrying...
                </>
              ) : (
                <>
                  <FiRefreshCw className="me-2" />
                  Try Again
                </>
              )}
            </Button>
          </Card.Body>
        </Card>
      </Container>
    );
  }

  // ============================================
  // MAIN RENDER
  // ============================================

  const paginatedNotifications = getPaginatedNotifications();
  const groupedNotifications = groupNotificationsByDate(paginatedNotifications);
  const categoryTabs = [
    { id: NOTIFICATION_CATEGORIES.ALL, label: 'All', icon: FiInbox, count: notifications.filter((n) => !n.archived && !n.deleted).length },
    { id: NOTIFICATION_CATEGORIES.UNREAD, label: 'Unread', icon: FiMail, count: unreadCount },
    { id: NOTIFICATION_CATEGORIES.PINNED, label: 'Saved', icon: FiStar, count: pinnedCount },
    { id: NOTIFICATION_CATEGORIES.ARCHIVED, label: 'Archived', icon: FiArchive, count: archivedCount },
    { id: 'deleted', label: 'Trash', icon: FiTrash2, count: notifications.filter((n) => n.deleted).length },
  ];

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100">
      <Toaster position="top-right" />
      <main className="mx-auto w-full max-w-5xl px-3 py-5 sm:px-6 sm:py-8">
        <header className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300">
              <FiBell size={23} />
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl font-bold tracking-tight text-slate-950 dark:text-white">Notifications</h1>
              <p className="mt-0.5 text-sm text-slate-600 dark:text-slate-400">
                {unreadCount ? `${unreadCount} unread update${unreadCount === 1 ? '' : 's'}` : 'You’re all caught up'}
                <span className="mx-2 text-slate-300 dark:text-slate-700">·</span>{stats.total} total
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button type="button" onClick={refreshNotifications} disabled={refreshing} aria-label="Refresh notifications" title="Refresh notifications" className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-300 bg-white text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800">
              <FiRefreshCw className={refreshing ? 'animate-spin' : ''} />
            </button>
            <Dropdown align="end">
              <Dropdown.Toggle variant="outline-secondary" aria-label="Notification options" className="inline-flex h-10 w-10 items-center justify-center rounded-xl border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
                <FiMoreVertical />
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item onClick={handleMarkAllAsRead} disabled={unreadCount === 0}><FiCheckSquare className="me-2" />Mark all as read</Dropdown.Item>
                <Dropdown.Item onClick={handleDeleteAllRead}><FiTrash2 className="me-2" />Delete all read</Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item onClick={() => setShowSettingsModal(true)}><FiSettings className="me-2" />Notification settings</Dropdown.Item>
                <Dropdown.Item onClick={() => setShowDeleteModal(true)}><FiTrash className="me-2 text-danger" /><span className="text-danger">Delete all</span></Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </header>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900" aria-label="Notification inbox">
          <nav className="flex gap-1 overflow-x-auto border-b border-slate-200 px-3 pt-3 dark:border-slate-800 sm:px-5" aria-label="Notification filters">
            {categoryTabs.map(({ id, label, icon: Icon, count }) => (
              <button key={id} type="button" onClick={() => setActiveCategory(id)} aria-pressed={activeCategory === id} className={`inline-flex shrink-0 items-center gap-2 rounded-t-xl border-b-2 px-3 py-3 text-sm font-medium transition sm:px-4 ${activeCategory === id ? 'border-indigo-600 text-indigo-700 dark:border-indigo-400 dark:text-indigo-300' : 'border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white'}`}>
                <Icon size={16} />{label}
                {count > 0 && <span className={`rounded-full px-2 py-0.5 text-xs ${activeCategory === id ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-200' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'}`}>{count}</span>}
              </button>
            ))}
          </nav>

          <div className="space-y-3 border-b border-slate-200 p-3 dark:border-slate-800 sm:p-5">
            <div className="relative">
              <FiSearch aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="search" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search notifications" aria-label="Search notifications" className="h-11 w-full rounded-xl border border-slate-300 bg-white pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500" />
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              <Form.Select aria-label="Filter by type" size="sm" value={activeType} onChange={(e) => setActiveType(e.target.value)} className="min-h-10 rounded-xl border-slate-300 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200">
                <option value="all">All types</option>{Object.entries(NOTIFICATION_TYPES).map(([key, value]) => <option key={value} value={value}>{key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}</option>)}
              </Form.Select>
              <Form.Select aria-label="Filter by priority" size="sm" value={activePriority} onChange={(e) => setActivePriority(e.target.value)} className="min-h-10 rounded-xl border-slate-300 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200">
                <option value="all">All priorities</option><option value={NOTIFICATION_PRIORITIES.URGENT}>Urgent</option><option value={NOTIFICATION_PRIORITIES.HIGH}>High</option><option value={NOTIFICATION_PRIORITIES.MEDIUM}>Medium</option><option value={NOTIFICATION_PRIORITIES.LOW}>Low</option>
              </Form.Select>
              <Form.Select aria-label="Filter by date" size="sm" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="min-h-10 rounded-xl border-slate-300 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200">
                <option value="all">Any time</option><option value={FILTER_OPTIONS.TODAY}>Today</option><option value={FILTER_OPTIONS.YESTERDAY}>Yesterday</option><option value={FILTER_OPTIONS.THIS_WEEK}>This week</option><option value={FILTER_OPTIONS.THIS_MONTH}>This month</option>
              </Form.Select>
            </div>
          </div>

          {isSelectionMode && (
            <div className="flex flex-col gap-3 border-b border-indigo-100 bg-indigo-50 px-4 py-3 dark:border-indigo-900/60 dark:bg-indigo-950/30 sm:flex-row sm:items-center sm:justify-between">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-200"><Form.Check type="checkbox" checked={selectAll} onChange={toggleSelectAll} />{selectedNotifications.length} selected</label>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline-primary" size="sm" onClick={handleBulkMarkAsRead} disabled={!selectedNotifications.length}><FiCheckSquare className="me-1" />Mark read</Button>
                <Button variant="outline-secondary" size="sm" onClick={handleBulkArchive} disabled={!selectedNotifications.length}><FiArchive className="me-1" />Archive</Button>
                <Button variant="outline-danger" size="sm" onClick={() => setShowBulkActionsModal(true)} disabled={!selectedNotifications.length}><FiTrash2 className="me-1" />Delete</Button>
                <Button variant="outline-secondary" size="sm" onClick={clearSelection}><FiX className="me-1" />Done</Button>
              </div>
            </div>
          )}

          <div className="p-3 sm:p-5">
            {!paginatedNotifications.length ? (
              <div className="flex min-h-64 flex-col items-center justify-center px-4 py-14 text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                  {activeCategory === 'deleted' ? <FiTrash2 size={24} /> : activeCategory === NOTIFICATION_CATEGORIES.ARCHIVED ? <FiArchive size={24} /> : activeCategory === NOTIFICATION_CATEGORIES.PINNED ? <FiStar size={24} /> : <FiBell size={24} />}
                </div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{searchTerm || activeType !== 'all' || activePriority !== 'all' || dateFilter !== 'all' ? 'No matching notifications' : activeCategory === 'deleted' ? 'Trash is empty' : activeCategory === NOTIFICATION_CATEGORIES.ARCHIVED ? 'Nothing archived' : activeCategory === NOTIFICATION_CATEGORIES.PINNED ? 'Nothing saved yet' : activeCategory === NOTIFICATION_CATEGORIES.UNREAD ? 'You’re all caught up' : 'No notifications yet'}</h2>
                <p className="mt-1 max-w-md text-sm text-slate-600 dark:text-slate-400">{searchTerm || activeType !== 'all' || activePriority !== 'all' || dateFilter !== 'all' ? 'Try changing your search or filters.' : activeCategory === NOTIFICATION_CATEGORIES.UNREAD ? 'New activity will appear here when you receive it.' : 'Updates about your account and activity will appear here.'}</p>
                {(searchTerm || activeType !== 'all' || activePriority !== 'all' || dateFilter !== 'all') && <button type="button" onClick={() => { setSearchTerm(''); setActiveType('all'); setActivePriority('all'); setDateFilter('all'); }} className="mt-4 rounded-lg px-3 py-2 text-sm font-semibold text-indigo-700 hover:bg-indigo-50 dark:text-indigo-300 dark:hover:bg-indigo-950/40">Clear filters</button>}
              </div>
            ) : (
              <>
                <div className="mb-3 flex items-center justify-between gap-3">
                  {!isSelectionMode && <button type="button" onClick={() => setIsSelectionMode(true)} className="inline-flex min-h-9 items-center gap-2 rounded-lg px-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"><FiCheckSquare />Select</button>}
                  <span className="ml-auto text-xs text-slate-500 dark:text-slate-400">{paginatedNotifications.length} of {filteredNotifications.length}</span>
                </div>
                <div className="space-y-6">
                  {Object.entries(groupedNotifications).map(([group, items]) => (
                    <section key={group} aria-label={group}>
                      <h2 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{group}</h2>
                      <div className="divide-y divide-slate-200 overflow-hidden rounded-xl border border-slate-200 dark:divide-slate-800 dark:border-slate-800">
                        {items.map((notification) => {
                          const { Icon, color, bg } = getNotificationIcon(notification.type);
                          const selected = selectedNotifications.includes(notification.id);
                          return (
                            <article key={notification.id} className={`group relative flex flex-wrap gap-3 p-4 transition sm:flex-nowrap sm:gap-4 sm:p-5 ${notification.read ? 'bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800/60' : 'bg-indigo-50/70 hover:bg-indigo-50 dark:bg-indigo-950/25 dark:hover:bg-indigo-950/40'} ${selected ? 'ring-2 ring-inset ring-indigo-500' : ''}`}>
                              {!notification.read && <span className="absolute bottom-4 left-1 top-4 w-1 rounded-full bg-indigo-600 dark:bg-indigo-400" aria-label="Unread" />}
                              {isSelectionMode && <div className="pt-1"><Form.Check type="checkbox" checked={selected} onChange={() => toggleSelection(notification.id)} aria-label={`Select ${notification.title || 'notification'}`} /></div>}
                              <button type="button" onClick={() => isSelectionMode ? toggleSelection(notification.id) : handleNotificationClick(notification)} className="flex w-full min-w-0 flex-1 gap-3 text-left sm:w-auto sm:gap-4">
                                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: bg, color }}><Icon size={19} /></span>
                                <span className="min-w-0 flex-1">
                                  <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                                    <span className={`text-sm text-slate-900 dark:text-slate-100 ${notification.read ? 'font-medium' : 'font-bold'}`}>{notification.title || 'Notification'}</span>
                                    {notification.pinned && <FiStar size={14} className="text-amber-500" aria-label="Saved" />}
                                    {!notification.read && <span className="h-2 w-2 rounded-full bg-indigo-600 dark:bg-indigo-400" aria-label="Unread" />}
                                  </span>
                                  <span className="mt-1 block break-words text-sm leading-6 text-slate-700 dark:text-slate-300">{notification.message || notification.body || notification.details || 'You have a new update.'}</span>
                                  <span className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                                    {notification.senderName && <span className="font-medium text-slate-700 dark:text-slate-300">{notification.senderName}</span>}
                                    {notification.senderName && <span aria-hidden="true">·</span>}
                                    <time>{formatRelativeTime(notification.createdAt)}</time>
                                    {notification.type && <><span aria-hidden="true">·</span><span>{notification.type.replace(/_/g, ' ')}</span></>}
                                  </span>
                                  {notification.actionUrl && <span className="mt-3 inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white">View update <FiChevronRight /></span>}
                                </span>
                              </button>
                              {!isSelectionMode && (
                                <div className="ml-auto flex w-full shrink-0 flex-wrap items-center justify-end gap-1 border-t border-slate-200 pt-2 dark:border-slate-800 sm:ml-0 sm:w-auto sm:items-start sm:border-0 sm:pt-0 sm:gap-2">
                                  <button type="button" aria-label={notification.read ? 'Mark unread' : 'Mark read'} title={notification.read ? 'Mark unread' : 'Mark read'} onClick={() => handleToggleRead(notification)} className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-white hover:text-indigo-700 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-indigo-300">{notification.read ? <FiMail size={17} /> : <FiCheckCircle size={17} />}</button>
                                  <button type="button" aria-label={notification.pinned ? 'Unsave notification' : 'Save notification'} title={notification.pinned ? 'Unsave' : 'Save'} onClick={() => handlePin(notification.id, !notification.pinned)} className={`flex h-9 w-9 items-center justify-center rounded-lg transition hover:bg-white dark:hover:bg-slate-700 ${notification.pinned ? 'text-amber-500' : 'text-slate-500 dark:text-slate-400'}`}><FiStar size={17} fill={notification.pinned ? 'currentColor' : 'none'} /></button>
                                  <Dropdown align="end">
                                    <Dropdown.Toggle variant="link" aria-label="More notification actions" className="flex h-9 w-9 items-center justify-center rounded-lg p-0 text-slate-500 no-underline hover:bg-white dark:text-slate-400 dark:hover:bg-slate-700"><FiMoreHorizontal size={18} /></Dropdown.Toggle>
                                    <Dropdown.Menu>
                                      <Dropdown.Item onClick={() => handleArchive(notification.id, !notification.archived)}><FiArchive className="me-2" />{notification.archived ? 'Unarchive' : 'Archive'}</Dropdown.Item>
                                      <Dropdown.Item onClick={() => { setSelectedNotification(notification); setShowSnoozeModal(true); }}><FiClock className="me-2" />Snooze</Dropdown.Item>
                                      <Dropdown.Item className="text-danger" onClick={() => notification.deleted ? handleRestore(notification.id) : handleDelete(notification.id, false)}>{notification.deleted ? <FiRotateCcw className="me-2" /> : <FiTrash2 className="me-2" />}{notification.deleted ? 'Restore' : 'Delete'}</Dropdown.Item>
                                    </Dropdown.Menu>
                                  </Dropdown>
                                </div>
                              )}
                            </article>
                          );
                        })}
                      </div>
                    </section>
                  ))}
                </div>
                {pagination.totalPages > 1 && <div className="mt-5 flex justify-center"><Pagination><Pagination.First onClick={() => handlePageChange(1)} disabled={pagination.currentPage === 1} /><Pagination.Prev onClick={() => handlePageChange(pagination.currentPage - 1)} disabled={pagination.currentPage === 1} />{[...Array(Math.min(5, pagination.totalPages))].map((_, i) => { const page = pagination.totalPages <= 5 ? i + 1 : pagination.currentPage <= 3 ? i + 1 : pagination.currentPage >= pagination.totalPages - 2 ? pagination.totalPages - 4 + i : pagination.currentPage - 2 + i; return <Pagination.Item key={page} active={page === pagination.currentPage} onClick={() => handlePageChange(page)}>{page}</Pagination.Item>; })}<Pagination.Next onClick={() => handlePageChange(pagination.currentPage + 1)} disabled={pagination.currentPage === pagination.totalPages} /><Pagination.Last onClick={() => handlePageChange(pagination.totalPages)} disabled={pagination.currentPage === pagination.totalPages} /></Pagination></div>}
              </>
            )}
          </div>
        </section>
      </main>

      {/* ============================================
          MODALS
          ============================================ */}

      {/* Delete All Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <FiAlertTriangle className="text-danger me-2" />
            Delete All Notifications
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="warning">
            <FiAlertTriangle className="me-2" />
            This will move all notifications to trash. You can restore them within 30 days.
          </Alert>
          <p>
            Are you sure you want to delete all <strong>{notifications.filter((n) => !n.deleted).length}</strong>{' '}
            notifications?
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteAll}>
            <FiTrash2 className="me-2" />
            Delete All
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Snooze Modal */}
      <Modal show={showSnoozeModal} onHide={() => setShowSnoozeModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <FiClock className="me-2" />
            Snooze Notification
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="text-muted mb-4">Choose when you want to be reminded again:</p>
          <div className="d-grid gap-2">
            {[
              { label: 'In 1 hour', hours: 1 },
              { label: 'In 3 hours', hours: 3 },
              { label: 'Tomorrow morning (9 AM)', custom: 'tomorrow-morning' },
              { label: 'Tomorrow afternoon (2 PM)', custom: 'tomorrow-afternoon' },
              { label: 'Next week', custom: 'next-week' },
            ].map((option, index) => (
              <Button
                key={index}
                variant="outline-primary"
                className="text-start"
                onClick={() => {
                  let snoozeUntil = new Date();

                  if (option.hours) {
                    snoozeUntil.setHours(snoozeUntil.getHours() + option.hours);
                  } else if (option.custom === 'tomorrow-morning') {
                    snoozeUntil.setDate(snoozeUntil.getDate() + 1);
                    snoozeUntil.setHours(9, 0, 0, 0);
                  } else if (option.custom === 'tomorrow-afternoon') {
                    snoozeUntil.setDate(snoozeUntil.getDate() + 1);
                    snoozeUntil.setHours(14, 0, 0, 0);
                  } else if (option.custom === 'next-week') {
                    snoozeUntil.setDate(snoozeUntil.getDate() + 7);
                    snoozeUntil.setHours(9, 0, 0, 0);
                  }

                  handleSnooze(selectedNotification?.id, snoozeUntil);
                }}
              >
                <FiClock className="me-2" />
                {option.label}
              </Button>
            ))}
          </div>
        </Modal.Body>
      </Modal>

      {/* Bulk Actions Modal */}
      <Modal show={showBulkActionsModal} onHide={() => setShowBulkActionsModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Bulk Actions</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Apply actions to <strong>{selectedNotifications.length}</strong> selected
            notifications?
          </p>
          <div className="d-grid gap-2">
            <Button variant="outline-primary" onClick={handleBulkMarkAsRead}>
              <FiCheckSquare className="me-2" />
              Mark as Read
            </Button>
            <Button variant="outline-secondary" onClick={handleBulkArchive}>
              <FiArchive className="me-2" />
              Archive
            </Button>
            <Button variant="outline-danger" onClick={handleBulkDelete}>
              <FiTrash2 className="me-2" />
              Delete
            </Button>
          </div>
        </Modal.Body>
      </Modal>

      {/* Notification Detail Modal */}
      <Modal
        show={showDetailModal}
        onHide={() => setShowDetailModal(false)}
        centered
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title className="d-flex align-items-center">
            {selectedNotification && (
              <>
                {(() => {
                  const { Icon, color, bg } = getNotificationIcon(selectedNotification.type);
                  return (
                    <div
                      className="notification-type-icon me-3"
                      style={{ backgroundColor: bg, color: color }}
                    >
                      <Icon size={20} />
                    </div>
                  );
                })()}
                {selectedNotification.title || 'Notification Details'}
              </>
            )}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedNotification && (
            <>
              <div className="mb-4">
                <div className="d-flex gap-2 mb-3">
                  {getTypeBadge(selectedNotification.type)}
                  {getPriorityBadge(selectedNotification.priority)}
                  {selectedNotification.pinned && (
                    <Badge bg="warning">
                      <FiStar size={10} className="me-1" />
                      Pinned
                    </Badge>
                  )}
                </div>

                <p className="notification-detail-message">
                  {selectedNotification.message ||
                    selectedNotification.body ||
                    selectedNotification.details}
                </p>

                {selectedNotification.data && Object.keys(selectedNotification.data).length > 0 && (
                  <div className="notification-detail-data mt-4">
                    <h6 className="text-muted mb-3">Additional Information</h6>
                    <ListGroup variant="flush" className="border rounded">
                      {Object.entries(selectedNotification.data).map(([key, value]) => (
                        <ListGroup.Item
                          key={key}
                          className="d-flex justify-content-between"
                        >
                          <span className="text-muted">
                            {key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                          </span>
                          <span className="fw-medium">
                            {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                          </span>
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                  </div>
                )}
              </div>

              <div className="text-muted small">
                <div className="d-flex gap-4 flex-wrap">
                  <span>
                    <FiClock className="me-1" size={12} />
                    {formatFullTime(selectedNotification.createdAt)}
                  </span>
                  {selectedNotification.senderName && (
                    <span>
                      <FiUser className="me-1" size={12} />
                      {selectedNotification.senderName}
                    </span>
                  )}
                  {selectedNotification.readAt && (
                    <span>
                      <FiCheckCircle className="me-1" size={12} />
                      Read {formatRelativeTime(selectedNotification.readAt)}
                    </span>
                  )}
                </div>
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetailModal(false)}>
            Close
          </Button>
          {selectedNotification && (
            <>
              {getNotificationRoute(selectedNotification) && (
                <Button
                  variant="primary"
                  onClick={() => {
                    setShowDetailModal(false);
                    navigate(getNotificationRoute(selectedNotification));
                  }}
                >
                  <FiExternalLink className="me-2" />
                  View Details
                </Button>
              )}
            </>
          )}
        </Modal.Footer>
      </Modal>

      {/* Notification Settings Modal */}
      <Modal
        show={showSettingsModal}
        onHide={() => setShowSettingsModal(false)}
        centered
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <FiSettings className="me-2" />
            Notification Settings
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <h6 className="text-muted mb-3">Notification Channels</h6>

          <div className="notification-preference-item">
            <div className="d-flex align-items-center">
              <FiMail className="me-3 text-primary" />
              <div>
                <div className="fw-medium">Email Notifications</div>
                <small className="text-muted">Receive notifications via email</small>
              </div>
            </div>
            <Form.Check
              type="switch"
              checked={notificationSettings.emailNotifications}
              onChange={(e) => {
                setNotificationSettings((prev) => ({
                  ...prev,
                  emailNotifications: e.target.checked,
                }));
              }}
            />
          </div>

          <div className="notification-preference-item">
            <div className="d-flex align-items-center">
              <FiSmartphone className="me-3 text-success" />
              <div>
                <div className="fw-medium">Push Notifications</div>
                <small className="text-muted">Receive push notifications on your devices</small>
              </div>
            </div>
            <Form.Check
              type="switch"
              checked={notificationSettings.pushNotifications}
              onChange={(e) => {
                setNotificationSettings((prev) => ({
                  ...prev,
                  pushNotifications: e.target.checked,
                }));
              }}
            />
          </div>

          <div className="notification-preference-item">
            <div className="d-flex align-items-center">
              <FiBell className="me-3 text-info" />
              <div>
                <div className="fw-medium">In-App Notifications</div>
                <small className="text-muted">Show notifications within the app</small>
              </div>
            </div>
            <Form.Check
              type="switch"
              checked={notificationSettings.inAppNotifications}
              onChange={(e) => {
                setNotificationSettings((prev) => ({
                  ...prev,
                  inAppNotifications: e.target.checked,
                }));
              }}
            />
          </div>

          <div className="notification-preference-item">
            <div className="d-flex align-items-center">
              <FiVolume2 className="me-3 text-warning" />
              <div>
                <div className="fw-medium">Sound</div>
                <small className="text-muted">Play sound for new notifications</small>
              </div>
            </div>
            <Form.Check
              type="switch"
              checked={notificationSettings.soundEnabled}
              onChange={(e) => {
                setNotificationSettings((prev) => ({
                  ...prev,
                  soundEnabled: e.target.checked,
                }));
              }}
            />
          </div>

          <hr />

          <h6 className="text-muted mb-3">Notification Categories</h6>

          {Object.entries(notificationSettings.categories || {}).map(([category, enabled]) => (
            <div key={category} className="d-flex justify-content-between align-items-center py-2">
              <span className="text-capitalize">{category.replace(/_/g, ' ')}</span>
              <Form.Check
                type="switch"
                checked={enabled}
                onChange={(e) => {
                  setNotificationSettings((prev) => ({
                    ...prev,
                    categories: {
                      ...prev.categories,
                      [category]: e.target.checked,
                    },
                  }));
                }}
              />
            </div>
          ))}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowSettingsModal(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={async () => {
              try {
                await settingsService.updateNotificationPreferences(
                  currentUser.uid,
                  notificationSettings
                );
                toast.success('Settings saved');
                setShowSettingsModal(false);
              } catch (error) {
                toast.error('Failed to save settings');
              }
            }}
          >
            <FiSave className="me-2" />
            Save Settings
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Notifications;


