// frontend/src/pages/student/Documents.jsx
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Button,
  Modal,
  Form,
  Spinner,
  Alert,
  Badge,
  InputGroup,
  FormControl,
  Dropdown,
  Pagination,
  OverlayTrigger,
  Tooltip,
  ProgressBar,
  ListGroup,
  Nav,
  Tab,
  Accordion,
  ButtonGroup,
  FloatingLabel,
  Toast,
  ToastContainer,
} from '../../components/ui/tailwindCompat';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  deleteDoc,
  updateDoc,
  serverTimestamp,
  Timestamp,
  addDoc,
  onSnapshot,
  limit,
  startAfter,
  writeBatch,
  increment,
} from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import { FaUpload, FaDownload, FaTrash, FaEye, FaEdit, FaFilter, FaSearch, FaSort, FaFilePdf, FaFileWord, FaFileExcel, FaFileImage, FaFileArchive, FaFileAlt, FaFile, FaFileVideo, FaFileAudio, FaFileCode, FaFileCsv, FaFilePowerpoint, FaCheckCircle, FaTimesCircle, FaClock, FaFolderPlus, FaSortAmountDown, FaSortAmountUp, FaCloudUploadAlt, FaCloudDownloadAlt, FaCopy, FaShare, FaLink, FaExternalLinkAlt, FaStar, FaRegStar, FaTag, FaTags, FaHistory, FaRedo, FaUndo, FaSync, FaSyncAlt, FaInfoCircle, FaExclamationTriangle, FaShieldAlt, FaLock, FaUnlock, FaCertificate, FaAward, FaGraduationCap, FaBriefcase, FaIdCard, FaPassport, FaFileSignature, FaFileInvoice, FaFileContract, FaFolder, FaFolderOpen, FaPlus, FaMinus, FaTimes, FaCheck, FaEllipsisV, FaEllipsisH, FaChevronDown, FaChevronUp, FaChevronLeft, FaChevronRight, FaArrowUp, FaArrowDown, FaPrint, FaPaperclip, FaCommentAlt, FaComments, FaUser, FaUserTie, FaBuilding, FaUniversity, FaCalendarAlt, FaHdd, FaDatabase, FaServer, FaCloud, FaWifi, FaChartPie, FaChartBar, FaChartLine, FaBell, FaCog, FaCogs, FaTools, FaWrench, FaMagic, FaFingerprint, FaKey, FaQrcode, FaBarcode, FaSignature, FaStamp, FaHighlighter, FaMarker, FaPen, FaPenAlt, FaPencilAlt, FaEraser, FaCut, FaCrop, FaCompress, FaExpand, FaClone, FaObjectGroup, FaObjectUngroup, FaLayerGroup, FaTh, FaThLarge, FaThList, FaList, FaListAlt, FaListUl, FaListOl, FaGripHorizontal, FaGripVertical, FaGripLines, FaStream, FaBars, FaColumns, FaTable, FaBorderAll, FaBorderNone, FaBox, FaBoxOpen, FaArchive, FaInbox, FaTrashAlt, FaRecycle, FaDumpster, FaDumpsterFire, FaBroom, FaSoap, FaSprayCan, FaBolt, FaBatteryFull, FaBatteryHalf, FaBatteryQuarter, FaPlug, FaPowerOff, FaToggleOn, FaToggleOff, FaEyeSlash, FaLowVision, FaRegEye, FaRegEyeSlash, FaRegFile, FaRegFileAlt, FaRegFileArchive, FaRegFileAudio, FaRegFileCode, FaRegFileExcel, FaRegFileImage, FaRegFilePdf, FaRegFilePowerpoint, FaRegFileVideo, FaRegFileWord, FaRegFolder, FaRegFolderOpen, FaRegClock, FaRegCalendarAlt, FaRegCheckCircle, FaRegTimesCircle, FaRegBell, FaRegComment, FaRegCommentDots, FaRegEnvelope, FaRegEnvelopeOpen, FaRegStar as FaRegStarIcon, FaRegHeart, FaRegBookmark, FaRegCopy, FaRegEdit, FaRegTrashAlt, FaRegSave, FaRegShareSquare, FaRegQuestionCircle, FaRegLightbulb, FaRegSmile, FaRegMeh, FaRegFrown } from "react-icons/fa";
import {
  MdOutlineFolder,
  MdOutlineFolderOpen,
  MdOutlineFolderShared,
  MdOutlineFolderSpecial,
  MdOutlineFolderDelete,
  MdOutlineFolderOff,
  MdOutlineFolderZip,
  MdOutlineFolderCopy,
  MdOutlineCreateNewFolder,
  MdOutlineDriveFileMove,
  MdOutlineFileCopy,
  MdOutlineFileDownload,
  MdOutlineFileUpload,
  MdOutlineFileOpen,
  MdOutlineFilePresent,
  MdOutlineFileDownloadDone,
  MdOutlineFileDownloadOff,
  MdOutlineSnippetFolder,
  MdOutlineTopic,
  MdOutlineRuleFolder,
  MdOutlineWorkspaces,
  MdOutlineInventory,
  MdOutlineInventory2,
  MdOutlineCategory,
  MdOutlineLabel,
  MdOutlineLabelOff,
  MdOutlineLocalOffer,
  MdOutlineSell,
  MdOutlineCloudUpload,
  MdOutlineCloudDownload,
  MdOutlineCloudDone,
  MdOutlineCloudOff,
  MdOutlineCloudSync,
  MdOutlineSync,
  MdOutlineSyncProblem,
  MdOutlineSystemUpdateAlt,
  MdOutlinePublishedWithChanges,
  MdOutlineChangeCircle,
  MdOutlineCached,
  MdOutlineAutorenew,
  MdOutlineRefresh,
  MdOutlineLoop,
  MdOutlineVerified,
  MdOutlineVerifiedUser,
  MdOutlineSecurity,
  MdOutlineGppGood,
  MdOutlineGppBad,
  MdOutlineGppMaybe,
  MdOutlineFingerprint,
  MdOutlineFace,
  MdOutlineInsertDriveFile,
  MdOutlineAttachFile,
  MdOutlineAttachment,
  MdOutlineLink,
  MdOutlineLinkOff,
  MdOutlineInsertLink,
  MdOutlineContentCopy,
  MdOutlineContentCut,
  MdOutlineContentPaste,
  MdOutlineContentPasteOff,
  MdOutlineDownload,
  MdOutlineUpload,
  MdOutlinePrint,
  MdOutlineSave,
  MdOutlineSaveAs,
  MdOutlineSaveAlt,
  MdOutlineDriveFileRenameOutline,
  MdOutlineEditNote,
  MdEditDocument,
  MdOutlinePreview,
  MdOutlineVisibility,
  MdOutlineVisibilityOff,
  MdOutlineRemoveRedEye,
  MdOutlineScreenShare,
  MdOutlineShare,
  MdOutlineIosShare,
  MdOutlineSend,
  MdOutlineSendToMobile,
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
  MdOutlineAssistant,
  MdOutlineSupportAgent,
  MdOutlinePerson,
  MdOutlineGroup,
  MdOutlineGroups,
  MdOutlineBusiness,
  MdOutlineSchool,
  MdOutlineWork,
  MdOutlineBadge,
  MdOutlineCardMembership,
  MdOutlineWorkspacePremium,
  MdOutlineMilitaryTech,
  MdOutlineEmojiEvents,
  MdOutlineLocalActivity,
  MdOutlineSportsScore,
  MdOutlineHealthAndSafety,
  MdOutlineMedicalServices,
  MdOutlineLocalHospital,
  MdOutlineEmergency,
  MdOutlineVaccines,
  MdOutlineBloodtype,
  MdOutlineMonitorHeart,
  MdMonitorHeart,
  MdOutlineFavorite as MdOutlineFavoriteIcon,
  MdOutlineStarOutline,
  MdOutlineStar,
  MdOutlineStarBorder,
  MdOutlineStarHalf,
  MdOutlineStarPurple500,
  MdOutlineGrade,
  MdOutlineAutoAwesome,
  MdOutlineAutoFixHigh,
  MdOutlineAutoFixNormal,
  MdOutlineAutoFixOff,
  MdOutlineTipsAndUpdates,
  MdOutlineLightbulb,
  MdOutlineLightbulbCircle,
  MdOutlineEmojiObjects,
  MdOutlinePsychology,
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
  MdOutlineDonutLarge,
  MdOutlineDonutSmall,
  MdOutlineBubbleChart,
  MdOutlineScatterPlot,
  MdOutlineMultilineChart,
  MdOutlineWaterfallChart,
  MdOutlineSsidChart,
  MdOutlineDataUsage,
  MdOutlineDataExploration,
  MdOutlineQueryBuilder,
  MdOutlineSearch,
  MdOutlineSearchOff,
  MdOutlineFilterAlt,
  MdOutlineFilterAltOff,
  MdOutlineFilterList,
  MdOutlineFilterListOff,
  MdOutlineFilter,
  MdOutlineFilterAlt as MdOutlineFilterAltIcon,
  MdOutlineSort,
  MdOutlineSwapVert,
  MdOutlineSwapHoriz,
  MdOutlineLowPriority,
  MdPriorityHigh,
  MdOutlinePriorityHigh,
  MdOutlineVerified as MdOutlineVerifiedIcon,
  MdOutlineReport,
  MdOutlineReportGmailerrorred,
  MdOutlineReportOff,
  MdOutlineReportProblem,
  MdOutlineWarning,
  MdOutlineWarningAmber,
  MdOutlineError,
  MdOutlineErrorOutline,
  MdOutlineInfo,
  MdOutlineHelp,
  MdOutlineHelpCenter,
  MdOutlineHelpOutline,
  MdOutlineSupport,
  MdOutlineContactSupport,
  MdOutlineBugReport,
  MdHealthAndSafety,
  MdOutlinePrivacyTip,
  MdOutlinePolicy,
  MdOutlineAdminPanelSettings,
  MdOutlineSettings,
  MdOutlineTune,
  MdOutlineConstruction,
  MdOutlineEngineering,
  MdOutlineHandyman,
  MdOutlineHomeRepairService,
  MdOutlineBuild,
  MdOutlineBuildCircle,
  MdOutlineArchitecture,
  MdOutlineDesignServices,
  MdOutlineDraw,
  MdOutlineBrush,
  MdOutlineFormatPaint,
  MdOutlineColorLens,
  MdOutlinePalette,
  MdOutlineInvertColors,
  MdOutlineOpacity,
  MdOutlineWaterDrop,
  MdOutlineGradient,
  MdOutlineBlurOn,
  MdOutlineBlurOff,
  MdOutlineBlurLinear,
  MdOutlineBlurCircular,
  MdOutlineFilterTiltShift,
  MdOutlineFilterCenterFocus,
  MdOutlineFilterNone,
  MdOutlineFilterBAndW,
  MdOutlineFilterDrama,
  MdOutlineFilterFrames,
  MdOutlineFilterHdr,
  MdOutlineFilterVintage,
  MdOutlineTexture,
  MdOutlineGridOn,
  MdOutlineGridOff,
  MdOutlineGrid4X4,
  MdOutlineGrid3X3,
  MdOutlineGridGoldenratio,
  MdOutlineViewModule,
  MdOutlineViewQuilt,
  MdOutlineViewStream,
  MdOutlineViewWeek,
  MdOutlineViewDay,
  MdOutlineViewAgenda,
  MdOutlineViewCarousel,
  MdOutlineViewColumn,
  MdOutlineViewComfy,
  MdOutlineViewCompact,
  MdOutlineViewHeadline,
  MdOutlineViewList,
  MdOutlineViewSidebar,
  MdOutlineViewTimeline,
  MdOutlineDashboard,
  MdOutlineDashboardCustomize,
  MdOutlineSpaceDashboard,
  MdOutlineWindow,
  MdOutlineWebAsset,
  MdOutlineWeb,
  MdOutlinePublic,
  MdOutlineLanguage,
  MdOutlineTranslate,
  MdOutlineGTranslate,
  MdOutlinePhonelink,
  MdOutlineDevices,
  MdOutlineDeviceHub,
  MdOutlineDeviceUnknown,
  MdOutlineDevicesOther,
  MdOutlineImportantDevices,
  MdOutlineComputer,
  MdOutlineLaptop,
  MdOutlinePhoneIphone,
  MdOutlinePhoneAndroid,
  MdOutlineTabletMac,
  MdOutlineTabletAndroid,
  MdOutlineWatch,
  MdOutlineTv,
  MdOutlineMonitor,
  MdOutlineSpeaker,
  MdOutlineHeadphones,
  MdOutlineHeadset,
  MdOutlineMic,
  MdOutlineVideocam,
  MdOutlinePhotoCamera,
  MdOutlineCameraAlt,
  MdOutlineCamera,
  MdOutlinePhotoLibrary,
  MdOutlineImage,
  MdOutlineImagesearchRoller,
  MdOutlineCollections,
  MdOutlineAutoStories,
  MdOutlineMenuBook,
  MdOutlineLibraryBooks,
  MdOutlineLocalLibrary,
  MdOutlineImportContacts,
  MdOutlineContactPage,
  MdOutlineContacts,
  MdOutlinePersonSearch,
  MdOutlinePersonAdd,
  MdOutlinePersonRemove,
  MdOutlinePersonOff,
  MdOutlineManageAccounts,
  MdOutlineAccountBox,
  MdOutlineAccountCircle,
  MdOutlineAccountTree,
  MdOutlineSwitchAccount,
  MdOutlineSupervisorAccount,
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
} from 'react-icons/md';

import { auth, db } from '../../config/firebase';
import { useAuth } from '../../context/AuthContext';
import { useStudent } from '../../context/StudentContext';
import { useNotification } from '../../context/NotificationContext';
import supabaseMediaService from '../../services/supabaseMediaService';
import supabaseService from '../../services/supabaseService';
import notificationService from '../../services/notificationService';

// ============================================
// CONSTANTS
// ============================================

const DOCUMENT_CATEGORIES = {
  ACADEMIC: 'academic',
  CERTIFICATES: 'certificates',
  RESUME: 'resume',
  IDENTIFICATION: 'identification',
  PORTFOLIO: 'portfolio',
  TRANSCRIPTS: 'transcripts',
  LETTERS: 'letters',
  CONTRACTS: 'contracts',
  FINANCIAL: 'financial',
  MEDICAL: 'medical',
  LEGAL: 'legal',
  PROJECTS: 'projects',
  RESEARCH: 'research',
  OTHER: 'other',
};

const DOCUMENT_STATUS = {
  PENDING: 'pending',
  VERIFIED: 'verified',
  REJECTED: 'rejected',
  EXPIRED: 'expired',
  DRAFT: 'draft',
  ARCHIVED: 'archived',
};

const DOCUMENT_PRIORITY = {
  REQUIRED: 'required',
  RECOMMENDED: 'recommended',
  OPTIONAL: 'optional',
};

const FILE_TYPE_CONFIG = {
  'application/pdf': { icon: FaFilePdf, color: '#dc2626', label: 'PDF' },
  'application/msword': { icon: FaFileWord, color: '#2563eb', label: 'DOC' },
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': {
    icon: FaFileWord,
    color: '#2563eb',
    label: 'DOCX',
  },
  'application/vnd.ms-excel': { icon: FaFileExcel, color: '#16a34a', label: 'XLS' },
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': {
    icon: FaFileExcel,
    color: '#16a34a',
    label: 'XLSX',
  },
  'application/vnd.ms-powerpoint': { icon: FaFilePowerpoint, color: '#ea580c', label: 'PPT' },
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': {
    icon: FaFilePowerpoint,
    color: '#ea580c',
    label: 'PPTX',
  },
  'text/csv': { icon: FaFileCsv, color: '#16a34a', label: 'CSV' },
  'text/plain': { icon: FaFileAlt, color: '#64748b', label: 'TXT' },
  'image/jpeg': { icon: FaFileImage, color: '#db2777', label: 'JPG' },
  'image/png': { icon: FaFileImage, color: '#db2777', label: 'PNG' },
  'image/gif': { icon: FaFileImage, color: '#db2777', label: 'GIF' },
  'image/webp': { icon: FaFileImage, color: '#db2777', label: 'WEBP' },
  'image/svg+xml': { icon: FaFileImage, color: '#db2777', label: 'SVG' },
  'video/mp4': { icon: FaFileVideo, color: '#7c3aed', label: 'MP4' },
  'video/mpeg': { icon: FaFileVideo, color: '#7c3aed', label: 'MPEG' },
  'video/webm': { icon: FaFileVideo, color: '#7c3aed', label: 'WEBM' },
  'audio/mpeg': { icon: FaFileAudio, color: '#0891b2', label: 'MP3' },
  'audio/wav': { icon: FaFileAudio, color: '#0891b2', label: 'WAV' },
  'application/zip': { icon: FaFileArchive, color: '#f59e0b', label: 'ZIP' },
  'application/x-rar-compressed': { icon: FaFileArchive, color: '#f59e0b', label: 'RAR' },
  'application/x-7z-compressed': { icon: FaFileArchive, color: '#f59e0b', label: '7Z' },
  'application/json': { icon: FaFileCode, color: '#eab308', label: 'JSON' },
  'application/xml': { icon: FaFileCode, color: '#eab308', label: 'XML' },
  'text/html': { icon: FaFileCode, color: '#eab308', label: 'HTML' },
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // Supabase private_documents bucket limit
const PRIVATE_DOCUMENT_TYPES = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/png',
]);
const MAX_TOTAL_STORAGE = 500 * 1024 * 1024; // 500MB
const ITEMS_PER_PAGE = 12;

const SORT_OPTIONS = {
  NEWEST: 'newest',
  OLDEST: 'oldest',
  NAME_ASC: 'name_asc',
  NAME_DESC: 'name_desc',
  SIZE_ASC: 'size_asc',
  SIZE_DESC: 'size_desc',
  TYPE: 'type',
};

const VIEW_MODES = {
  GRID: 'grid',
  LIST: 'list',
  TABLE: 'table',
};

const DEFAULT_CATEGORIES = [
  { value: 'academic', label: 'Academic Records', icon: '🎓', color: '#2563eb' },
  { value: 'certificates', label: 'Certificates', icon: '🏆', color: '#eab308' },
  { value: 'resume', label: 'Resume/CV', icon: '📄', color: '#dc2626' },
  { value: 'identification', label: 'Identification', icon: '🆔', color: '#7c3aed' },
  { value: 'portfolio', label: 'Portfolio', icon: '🎨', color: '#db2777' },
  { value: 'transcripts', label: 'Transcripts', icon: '📋', color: '#0891b2' },
  { value: 'letters', label: 'Recommendation Letters', icon: '✉️', color: '#059669' },
  { value: 'contracts', label: 'Contracts', icon: '📝', color: '#ea580c' },
  { value: 'financial', label: 'Financial Documents', icon: '💰', color: '#16a34a' },
  { value: 'medical', label: 'Medical Records', icon: '🏥', color: '#dc2626' },
  { value: 'legal', label: 'Legal Documents', icon: '⚖️', color: '#4f46e5' },
  { value: 'projects', label: 'Projects', icon: '🚀', color: '#7c3aed' },
  { value: 'research', label: 'Research Papers', icon: '🔬', color: '#0891b2' },
  { value: 'other', label: 'Other', icon: '📁', color: '#64748b' },
];

// ============================================
// HELPER FUNCTIONS
// ============================================

const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

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

const getFileConfig = (mimeType, fileName) => {
  if (FILE_TYPE_CONFIG[mimeType]) return FILE_TYPE_CONFIG[mimeType];

  const ext = fileName?.split('.').pop()?.toLowerCase();
  const extMap = {
    pdf: FILE_TYPE_CONFIG['application/pdf'],
    doc: FILE_TYPE_CONFIG['application/msword'],
    docx: FILE_TYPE_CONFIG['application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    xls: FILE_TYPE_CONFIG['application/vnd.ms-excel'],
    xlsx: FILE_TYPE_CONFIG['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
    ppt: FILE_TYPE_CONFIG['application/vnd.ms-powerpoint'],
    pptx: FILE_TYPE_CONFIG['application/vnd.openxmlformats-officedocument.presentationml.presentation'],
    csv: FILE_TYPE_CONFIG['text/csv'],
    txt: FILE_TYPE_CONFIG['text/plain'],
    jpg: FILE_TYPE_CONFIG['image/jpeg'],
    jpeg: FILE_TYPE_CONFIG['image/jpeg'],
    png: FILE_TYPE_CONFIG['image/png'],
    gif: FILE_TYPE_CONFIG['image/gif'],
    webp: FILE_TYPE_CONFIG['image/webp'],
    svg: FILE_TYPE_CONFIG['image/svg+xml'],
    mp4: FILE_TYPE_CONFIG['video/mp4'],
    mp3: FILE_TYPE_CONFIG['audio/mpeg'],
    zip: FILE_TYPE_CONFIG['application/zip'],
    rar: FILE_TYPE_CONFIG['application/x-rar-compressed'],
    json: FILE_TYPE_CONFIG['application/json'],
    xml: FILE_TYPE_CONFIG['application/xml'],
    html: FILE_TYPE_CONFIG['text/html'],
  };

  return extMap[ext] || { icon: FaFile, color: '#64748b', label: ext?.toUpperCase() || 'FILE' };
};

const validateFile = (file) => {
  if (!file) return { valid: false, error: 'No file selected' };

  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size exceeds ${formatFileSize(MAX_FILE_SIZE)} limit`,
    };
  }

  if (file.size === 0) {
    return { valid: false, error: 'File is empty' };
  }

  if (!PRIVATE_DOCUMENT_TYPES.has(file.type)) {
    return { valid: false, error: 'Only PDF, DOC, DOCX, JPG, and PNG files can be stored privately.' };
  }

  // Block potentially dangerous file types
  const blockedTypes = [
    'application/x-msdownload',
    'application/x-executable',
    'application/x-msdos-program',
    'application/x-sh',
    'application/x-bat',
  ];

  if (blockedTypes.includes(file.type)) {
    return { valid: false, error: 'This file type is not allowed for security reasons' };
  }

  return { valid: true };
};

const getStatusConfig = (status) => {
  const configs = {
    [DOCUMENT_STATUS.PENDING]: { bg: 'warning', label: 'Pending Review', color: '#f59e0b' },
    [DOCUMENT_STATUS.VERIFIED]: { bg: 'success', label: 'Verified', color: '#10b981' },
    [DOCUMENT_STATUS.REJECTED]: { bg: 'danger', label: 'Rejected', color: '#dc2626' },
    [DOCUMENT_STATUS.EXPIRED]: { bg: 'secondary', label: 'Expired', color: '#64748b' },
    [DOCUMENT_STATUS.DRAFT]: { bg: 'info', label: 'Draft', color: '#0891b2' },
    [DOCUMENT_STATUS.ARCHIVED]: { bg: 'dark', label: 'Archived', color: '#334155' },
  };
  return configs[status] || configs[DOCUMENT_STATUS.PENDING];
};

// ============================================
// MAIN COMPONENT
// ============================================

const Documents = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, userData } = useAuth();
  const { studentData } = useStudent();
  const { showNotification } = useNotification();

  // ============================================
  // STATE
  // ============================================

  // Data
  const [documents, setDocuments] = useState([]);
  const [filteredDocuments, setFilteredDocuments] = useState([]);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [storageStats, setStorageStats] = useState({
    used: 0,
    total: MAX_TOTAL_STORAGE,
    files: 0,
    byCategory: {},
    byStatus: {},
  });

  // Loading
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Upload
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadQueue, setUploadQueue] = useState([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    title: '',
    description: '',
    category: 'academic',
    tags: [],
    files: [],
    priority: DOCUMENT_PRIORITY.OPTIONAL,
    expiryDate: '',
    isConfidential: false,
    shareWithEmployers: true,
    shareWithInstitutions: false,
  });
  const [newTag, setNewTag] = useState('');

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [sortBy, setSortBy] = useState(SORT_OPTIONS.NEWEST);
  const [viewMode, setViewMode] = useState(VIEW_MODES.GRID);

  // Modals
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  // Selected
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [selectedDocuments, setSelectedDocuments] = useState([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectAll, setSelectAll] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);

  // Refs
  const fileInputRef = useRef(null);
  const dropZoneRef = useRef(null);
  const unsubscribeRef = useRef(null);

  // ============================================
  // COMPUTED
  // ============================================

  const storagePercentage = useMemo(() => {
    if (!storageStats.total) return 0;
    return Math.round((storageStats.used / storageStats.total) * 100);
  }, [storageStats]);

  const totalPages = useMemo(() => {
    return Math.ceil(filteredDocuments.length / ITEMS_PER_PAGE);
  }, [filteredDocuments]);

  const paginatedDocuments = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredDocuments.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredDocuments, currentPage]);

  const categoryMap = useMemo(() => {
    const map = {};
    categories.forEach((cat) => {
      map[cat.value] = cat;
    });
    return map;
  }, [categories]);

  // ============================================
  // EFFECTS
  // ============================================

  useEffect(() => {
    if (!currentUser?.uid) {
      setLoading(false);
      return;
    }

    setupRealtimeListener();
    loadStorageStats();

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [currentUser?.uid]);

  useEffect(() => {
    applyFilters();
  }, [documents, searchTerm, filterCategory, filterStatus, filterPriority, sortBy]);

  // Drag & drop setup
  useEffect(() => {
    const dropZone = dropZoneRef.current;
    if (!dropZone) return;

    const handleDragOver = (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropZone.classList.add('drag-over');
    };

    const handleDragLeave = (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropZone.classList.remove('drag-over');
    };

    const handleDrop = (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropZone.classList.remove('drag-over');

      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        handleFilesSelected(files);
      }
    };

    dropZone.addEventListener('dragover', handleDragOver);
    dropZone.addEventListener('dragleave', handleDragLeave);
    dropZone.addEventListener('drop', handleDrop);

    return () => {
      dropZone.removeEventListener('dragover', handleDragOver);
      dropZone.removeEventListener('dragleave', handleDragLeave);
      dropZone.removeEventListener('drop', handleDrop);
    };
  }, []);

  // ============================================
  // DATA LOADING
  // ============================================

  const setupRealtimeListener = useCallback(() => {
    if (!currentUser?.uid) return;

    if (unsubscribeRef.current) {
      unsubscribeRef.current();
    }

    try {
      const docsQuery = query(
        collection(db, 'studentDocuments'),
        where('studentId', '==', currentUser.uid),
        orderBy('uploadDate', 'desc'),
        limit(500)
      );

      const unsubscribe = onSnapshot(
        docsQuery,
        (snapshot) => {
          const docs = snapshot.docs.map((doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data,
              uploadDate: data.uploadDate?.toDate?.() || new Date(),
              lastUpdated: data.lastUpdated?.toDate?.() || new Date(),
              verifiedDate: data.verifiedDate?.toDate?.() || null,
              expiryDate: data.expiryDate?.toDate?.() || null,
            };
          });

          setDocuments(docs);
          setLoading(false);
          setRefreshing(false);
        },
        (error) => {
          console.error('Documents listener error:', error);
          toast.error('Failed to load documents');
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

  const loadStorageStats = async () => {
    try {
      // Get stats from the documents collection directly
      const statsRef = doc(db, 'userStorageStats', currentUser.uid);
      const statsSnap = await getDoc(statsRef);

      if (statsSnap.exists()) {
        setStorageStats(statsSnap.data());
      } else {
        // Initialize stats
        const initialStats = {
          used: 0,
          total: MAX_TOTAL_STORAGE,
          files: 0,
          byCategory: {},
          byStatus: {},
          lastUpdated: serverTimestamp(),
        };
        await setDoc(statsRef, initialStats);
        setStorageStats(initialStats);
      }
    } catch (error) {
      console.error('Error loading storage stats:', error);
    }
  };

  const refreshDocuments = async () => {
    setRefreshing(true);
    await loadStorageStats();
    setTimeout(() => setRefreshing(false), 800);
  };

  // ============================================
  // FILE HANDLING
  // ============================================

  const handleFilesSelected = (files) => {
    const validFiles = [];
    const errors = [];

    files.forEach((file) => {
      const validation = validateFile(file);
      if (validation.valid) {
        validFiles.push({
          file,
          id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: file.name,
          size: file.size,
          type: file.type,
          preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
          status: 'pending',
          progress: 0,
        });
      } else {
        errors.push(`${file.name}: ${validation.error}`);
      }
    });

    if (errors.length > 0) {
      errors.forEach((err) => toast.error(err));
    }

    if (validFiles.length > 0) {
      setUploadForm((prev) => ({
        ...prev,
        files: [...prev.files, ...validFiles],
      }));

      if (validFiles.length === 1) {
        const fileName = validFiles[0].name.replace(/\.[^/.]+$/, '');
        setUploadForm((prev) => ({
          ...prev,
          title: prev.title || fileName,
        }));
      }

      toast.success(`${validFiles.length} file(s) added to upload queue`);
    }
  };

  const handleFileInputChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      handleFilesSelected(files);
    }
    e.target.value = '';
  };

  const removeFileFromQueue = (fileId) => {
    setUploadForm((prev) => ({
      ...prev,
      files: prev.files.filter((f) => {
        if (f.id === fileId && f.preview) {
          URL.revokeObjectURL(f.preview);
        }
        return f.id !== fileId;
      }),
    }));
  };

  const handleAddTag = () => {
    const tag = newTag.trim().toLowerCase();
    if (tag && !uploadForm.tags.includes(tag)) {
      setUploadForm((prev) => ({
        ...prev,
        tags: [...prev.tags, tag],
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setUploadForm((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  // ============================================
  // UPLOAD
  // ============================================

  const handleUpload = async () => {
    if (uploadForm.files.length === 0) {
      toast.error('Please select at least one file');
      return;
    }

    if (!uploadForm.title.trim() && uploadForm.files.length === 1) {
      toast.error('Please provide a title');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    const uploadedDocuments = [];

    try {
      for (let i = 0; i < uploadForm.files.length; i++) {
        const fileItem = uploadForm.files[i];
        const file = fileItem.file;

        try {
          // Update status
          setUploadForm((prev) => ({
            ...prev,
            files: prev.files.map((f) =>
              f.id === fileItem.id ? { ...f, status: 'uploading' } : f
            ),
          }));

          const documentTitle = uploadForm.files.length === 1
            ? uploadForm.title.trim()
            : file.name.replace(/\.[^/.]+$/, '');
          const uploadResult = await supabaseService.uploadPrivateDocument({
            file,
            contentType: file.type,
            title: documentTitle,
            category: uploadForm.category,
          });
          const docRef = doc(db, 'studentDocuments', uploadResult.documentId);
          const documentData = {
            id: docRef.id,
            studentId: currentUser.uid,
            studentName: studentData?.fullName || userData?.fullName || 'Student',
            studentEmail: currentUser.email,
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type,
            fileExtension: file.name.split('.').pop().toLowerCase(),
            title: documentTitle,
            category: uploadForm.category,
            description: uploadForm.description.trim(),
            tags: uploadForm.tags,
            priority: uploadForm.priority,
            isConfidential: uploadForm.isConfidential,
            shareWithEmployers: uploadForm.shareWithEmployers,
            shareWithInstitutions: uploadForm.shareWithInstitutions,
            status: DOCUMENT_STATUS.PENDING,
            uploadDate: serverTimestamp(),
            lastUpdated: serverTimestamp(),
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            expiryDate: uploadForm.expiryDate ? Timestamp.fromDate(new Date(uploadForm.expiryDate)) : null,
            downloadURL: null,
            storageType: 'supabase_private',
            storageProvider: 'supabase',
            storagePath: uploadResult.path,
            storageBucket: 'private_documents',
            verifiedBy: null,
            verifiedDate: null,
            version: 1,
            downloadCount: 0,
            viewCount: 0,
          };

          await setDoc(docRef, documentData);
          uploadedDocuments.push(documentData);

          // Update progress
          const progress = Math.round(((i + 1) / uploadForm.files.length) * 100);
          setUploadProgress(progress);

          // Update file status
          setUploadForm((prev) => ({
            ...prev,
            files: prev.files.map((f) =>
              f.id === fileItem.id ? { ...f, status: 'complete', progress: 100 } : f
            ),
          }));

          // Sync to Supabase
          try {
            // Private metadata is saved by the authenticated backend alongside
            // the Firestore ownership record.
          } catch (sbError) {
            console.warn('Supabase sync failed (non-critical):', sbError);
          }

          // Log activity
          await addDoc(collection(db, 'documentActivities'), {
            documentId: docRef.id,
            studentId: currentUser.uid,
            action: 'upload',
            timestamp: serverTimestamp(),
            metadata: { fileName: file.name, fileSize: file.size },
          });
        } catch (fileError) {
          console.error(`Error uploading ${file.name}:`, fileError);
          setUploadForm((prev) => ({
            ...prev,
            files: prev.files.map((f) =>
              f.id === fileItem.id ? { ...f, status: 'error', error: fileError.message } : f
            ),
          }));
        }
      }

      if (uploadedDocuments.length > 0) {
        // Update storage stats
        const newUsed =
          storageStats.used + uploadedDocuments.reduce((sum, d) => sum + d.fileSize, 0);
        const statsRef = doc(db, 'userStorageStats', currentUser.uid);
        await updateDoc(statsRef, {
          used: newUsed,
          files: increment(uploadedDocuments.length),
          lastUpdated: serverTimestamp(),
        });

        // Send notification
        await notificationService.createNotification({
          userId: currentUser.uid,
          type: 'document',
          title: `${uploadedDocuments.length} Document(s) Uploaded`,
          message: `Your document(s) have been uploaded and are pending review.`,
          priority: 'low',
          data: { documentIds: uploadedDocuments.map((d) => d.id) },
        });

        toast.success(`${uploadedDocuments.length} document(s) uploaded successfully`);

        // Reset form
        uploadForm.files.forEach((f) => {
          if (f.preview) URL.revokeObjectURL(f.preview);
        });

        setUploadForm({
          title: '',
          description: '',
          category: 'academic',
          tags: [],
          files: [],
          priority: DOCUMENT_PRIORITY.OPTIONAL,
          expiryDate: '',
          isConfidential: false,
          shareWithEmployers: true,
          shareWithInstitutions: false,
        });
        setUploadProgress(0);
        setShowUploadModal(false);
      }
    } catch (error) {
      console.error('Error uploading documents:', error);
      toast.error('Failed to upload documents');
    } finally {
      setUploading(false);
    }
  };

  // ============================================
  // CRUD OPERATIONS
  // ============================================

  const handleDownload = async (document) => {
    try {
      setDownloading(true);

      let downloadURL = document.downloadURL;
      if (document.storageType === 'supabase_private' && document.storagePath) {
        downloadURL = await supabaseService.getPrivateDocumentUrl(document.id);
      }

      // Create link
      const link = document.createElement('a');
      link.href = downloadURL;
      link.download = document.fileName;
      link.target = '_blank';
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);

      // Increment download count
      const docRef = doc(db, 'studentDocuments', document.id);
      await updateDoc(docRef, {
        downloadCount: increment(1),
        lastAccessed: serverTimestamp(),
      });

      // Log activity
      await addDoc(collection(db, 'documentActivities'), {
        documentId: document.id,
        studentId: currentUser.uid,
        action: 'download',
        timestamp: serverTimestamp(),
        userAgent: navigator.userAgent,
      });

      toast.success('Download started');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Download failed');
    } finally {
      setDownloading(false);
    }
  };

  const handlePreview = async (document) => {
    let previewDocument = document;
    try {
      if (document.storageType === 'supabase_private' && document.storagePath) {
        previewDocument = { ...document, downloadURL: await supabaseService.getPrivateDocumentUrl(document.id) };
      }
    } catch (error) {
      toast.error(error.message || 'Unable to open this private document.');
      return;
    }
    setSelectedDocument(previewDocument);
    setShowPreviewModal(true);

    // Increment view count
    try {
      await updateDoc(doc(db, 'studentDocuments', document.id), {
        viewCount: increment(1),
        lastAccessed: serverTimestamp(),
      });
    } catch (error) {
      console.warn('Failed to log view:', error);
    }
  };

  const handleDelete = async () => {
    if (!selectedDocument) return;

    setDeleting(true);
    try {
      if (selectedDocument.storageType === 'supabase_private') {
        await supabaseService.deletePrivateDocument(selectedDocument.id);
      } else if (selectedDocument.supabasePublicId) {
        try {
          await supabaseMediaService.deleteFile(
            selectedDocument.supabasePublicId,
            selectedDocument.supabaseResourceType || 'raw'
          );
        } catch (cloudError) {
          console.warn('supabase delete failed:', cloudError);
        }
      }

      // Delete legacy Supabase public media when a path is present.
      if (selectedDocument.storagePath && selectedDocument.storageType !== 'supabase_private') {
        try {
          await supabaseMediaService.deleteFile(selectedDocument.storagePath);
        } catch (storageError) {
          console.warn('Supabase storage delete failed:', storageError);
        }
      }

      if (selectedDocument.storageType !== 'supabase_private') {
        await deleteDoc(doc(db, 'studentDocuments', selectedDocument.id));
      }

      // Update storage stats
      const statsRef = doc(db, 'userStorageStats', currentUser.uid);
      const newUsed = Math.max(0, storageStats.used - (selectedDocument.fileSize || 0));
      await updateDoc(statsRef, {
        used: newUsed,
        files: increment(-1),
        lastUpdated: serverTimestamp(),
      });

      // Log activity
      await addDoc(collection(db, 'documentActivities'), {
        documentId: selectedDocument.id,
        studentId: currentUser.uid,
        action: 'delete',
        timestamp: serverTimestamp(),
        metadata: { fileName: selectedDocument.fileName },
      });

      toast.success('Document deleted successfully');
      setShowDeleteModal(false);
      setSelectedDocument(null);
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete document');
    } finally {
      setDeleting(false);
    }
  };

  const handleUpdateDocument = async () => {
    if (!selectedDocument) return;

    try {
      await updateDoc(doc(db, 'studentDocuments', selectedDocument.id), {
        title: selectedDocument.title,
        description: selectedDocument.description,
        category: selectedDocument.category,
        tags: selectedDocument.tags || [],
        priority: selectedDocument.priority,
        isConfidential: selectedDocument.isConfidential,
        shareWithEmployers: selectedDocument.shareWithEmployers,
        shareWithInstitutions: selectedDocument.shareWithInstitutions,
        lastUpdated: serverTimestamp(),
        version: increment(1),
      });

      // Log activity
      await addDoc(collection(db, 'documentActivities'), {
        documentId: selectedDocument.id,
        studentId: currentUser.uid,
        action: 'update',
        timestamp: serverTimestamp(),
      });

      toast.success('Document updated successfully');
      setShowEditModal(false);
      setSelectedDocument(null);
    } catch (error) {
      console.error('Update error:', error);
      toast.error('Failed to update document');
    }
  };

  const handleShareDocument = async (shareMethod) => {
    if (!selectedDocument) return;

    try {
      const shareUrl = selectedDocument.downloadURL;

      if (shareMethod === 'link') {
        await navigator.clipboard.writeText(shareUrl);
        toast.success('Link copied to clipboard');
      } else if (shareMethod === 'email') {
        const subject = encodeURIComponent(`Document: ${selectedDocument.title}`);
        const body = encodeURIComponent(
          `Hi,\n\nI'm sharing a document with you: ${selectedDocument.title}\n\n${shareUrl}\n\nBest regards`
        );
        window.location.href = `mailto:?subject=${subject}&body=${body}`;
      } else if (shareMethod === 'qr') {
        // Generate QR code - to be implemented
        toast.info('QR code generation coming soon');
      }

      // Log share activity
      await addDoc(collection(db, 'documentActivities'), {
        documentId: selectedDocument.id,
        studentId: currentUser.uid,
        action: 'share',
        method: shareMethod,
        timestamp: serverTimestamp(),
      });

      setShowShareModal(false);
    } catch (error) {
      console.error('Share error:', error);
      toast.error('Failed to share document');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedDocuments.length === 0) return;

    setDeleting(true);
    try {
      const batch = writeBatch(db);
      let totalSize = 0;

      for (const docId of selectedDocuments) {
        const document = documents.find((d) => d.id === docId);
        if (!document) continue;

        totalSize += document.fileSize || 0;

        if (document.storageType === 'supabase_private') {
          await supabaseService.deletePrivateDocument(document.id);
        } else if (document.supabasePublicId) {
          try {
            await supabaseMediaService.deleteFile(
              document.supabasePublicId,
              document.supabaseResourceType || 'raw'
            );
          } catch (err) {
            console.warn('supabase delete failed:', err);
          }
        }

        // Delete from Firebase
        batch.delete(doc(db, 'studentDocuments', docId));
      }

      await batch.commit();

      // Update storage stats
      const statsRef = doc(db, 'userStorageStats', currentUser.uid);
      await updateDoc(statsRef, {
        used: Math.max(0, storageStats.used - totalSize),
        files: increment(-selectedDocuments.length),
        lastUpdated: serverTimestamp(),
      });

      toast.success(`${selectedDocuments.length} document(s) deleted`);
      clearSelection();
      setShowBulkDeleteModal(false);
    } catch (error) {
      console.error('Bulk delete error:', error);
      toast.error('Failed to delete documents');
    } finally {
      setDeleting(false);
    }
  };

  const handleChangeStatus = async (documentId, newStatus) => {
    try {
      await updateDoc(doc(db, 'studentDocuments', documentId), {
        status: newStatus,
        lastUpdated: serverTimestamp(),
        ...(newStatus === DOCUMENT_STATUS.VERIFIED && {
          verifiedDate: serverTimestamp(),
          verifiedBy: currentUser.uid,
        }),
      });

      toast.success(`Status changed to ${newStatus}`);
    } catch (error) {
      console.error('Status change error:', error);
      toast.error('Failed to change status');
    }
  };

  // ============================================
  // FILTERING & SORTING
  // ============================================

  const applyFilters = useCallback(() => {
    let filtered = [...documents];

    // Category filter
    if (filterCategory !== 'all') {
      filtered = filtered.filter((d) => d.category === filterCategory);
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter((d) => d.status === filterStatus);
    }

    // Priority filter
    if (filterPriority !== 'all') {
      filtered = filtered.filter((d) => d.priority === filterPriority);
    }

    // Search
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(
        (d) =>
          d.title?.toLowerCase().includes(search) ||
          d.description?.toLowerCase().includes(search) ||
          d.fileName?.toLowerCase().includes(search) ||
          d.tags?.some((tag) => tag.toLowerCase().includes(search))
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case SORT_OPTIONS.NEWEST:
          return new Date(b.uploadDate) - new Date(a.uploadDate);
        case SORT_OPTIONS.OLDEST:
          return new Date(a.uploadDate) - new Date(b.uploadDate);
        case SORT_OPTIONS.NAME_ASC:
          return (a.title || '').localeCompare(b.title || '');
        case SORT_OPTIONS.NAME_DESC:
          return (b.title || '').localeCompare(a.title || '');
        case SORT_OPTIONS.SIZE_ASC:
          return (a.fileSize || 0) - (b.fileSize || 0);
        case SORT_OPTIONS.SIZE_DESC:
          return (b.fileSize || 0) - (a.fileSize || 0);
        case SORT_OPTIONS.TYPE:
          return (a.fileExtension || '').localeCompare(b.fileExtension || '');
        default:
          return 0;
      }
    });

    setFilteredDocuments(filtered);
    setCurrentPage(1);
  }, [documents, filterCategory, filterStatus, filterPriority, searchTerm, sortBy]);

  // ============================================
  // SELECTION
  // ============================================

  const toggleSelection = (docId) => {
    setSelectedDocuments((prev) =>
      prev.includes(docId) ? prev.filter((id) => id !== docId) : [...prev, docId]
    );
  };

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedDocuments([]);
      setSelectAll(false);
    } else {
      setSelectedDocuments(paginatedDocuments.map((d) => d.id));
      setSelectAll(true);
    }
  };

  const clearSelection = () => {
    setSelectedDocuments([]);
    setSelectAll(false);
    setIsSelectionMode(false);
  };

  // ============================================
  // LOADING / ERROR STATES
  // ============================================

  if (loading) {
    return (
      <Container fluid className="documents-loading-container">
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" style={{ width: '3rem', height: '3rem' }} />
          <h5 className="mt-4 text-muted">Loading your documents...</h5>
        </div>
      </Container>
    );
  }

  if (!currentUser) {
    return (
      <Container fluid className="py-5">
        <Alert variant="warning" className="text-center">
          <FaExclamationTriangle className="me-2" />
          Please sign in to view your documents
        </Alert>
      </Container>
    );
  }

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="documents-page">
      <Toaster position="top-right" />

      <Container fluid className="py-4">
        {/* Header */}
        <Row className="mb-4 align-items-center">
          <Col md={8}>
            <h1 className="documents-title mb-1">
              <FaFolder className="me-2 text-primary" />
              My Documents
            </h1>
            <p className="text-muted mb-0">
              Manage and organize all your academic and professional documents
            </p>
          </Col>
          <Col md={4} className="text-end">
            <div className="d-flex gap-2 justify-content-end">
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={refreshDocuments}
                disabled={refreshing}
              >
                <FaSync className={refreshing ? 'spin' : ''} />
                <span className="d-none d-md-inline ms-2">Refresh</span>
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setShowUploadModal(true)}
              >
                <FaUpload className="me-2" />
                Upload Document
              </Button>
            </div>
          </Col>
        </Row>

        {/* Storage Stats */}
        <Card className="mb-4 border-0 shadow-sm">
          <Card.Body>
            <Row className="align-items-center">
              <Col md={8}>
                <div className="d-flex justify-content-between mb-2">
                  <span className="fw-medium">Storage Usage</span>
                  <span className="text-muted">
                    {formatFileSize(storageStats.used)} / {formatFileSize(storageStats.total)}
                  </span>
                </div>
                <ProgressBar
                  now={storagePercentage}
                  variant={
                    storagePercentage > 90
                      ? 'danger'
                      : storagePercentage > 70
                        ? 'warning'
                        : 'success'
                  }
                  style={{ height: '10px' }}
                  className="mb-2"
                />
                <small className="text-muted">
                  {storagePercentage}% used •{' '}
                  {formatFileSize(storageStats.total - storageStats.used)} remaining
                </small>
              </Col>
              <Col md={4} className="text-md-end mt-3 mt-md-0">
                <Badge bg="primary" className="me-2">
                  {storageStats.files || documents.length} Files
                </Badge>
                <Badge bg="secondary">
                  {categories.length} Categories
                </Badge>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Toolbar */}
        <Card className="mb-4 border-0 shadow-sm">
          <Card.Body>
            <Row className="g-3">
              <Col md={4}>
                <InputGroup>
                  <InputGroup.Text>
                    <FaSearch />
                  </InputGroup.Text>
                  <FormControl
                    placeholder="Search documents..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  {searchTerm && (
                    <Button variant="outline-secondary" onClick={() => setSearchTerm('')}>
                      <FaTimes />
                    </Button>
                  )}
                </InputGroup>
              </Col>
              <Col md={2}>
                <Form.Select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                >
                  <option value="all">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </Form.Select>
              </Col>
              <Col md={2}>
                <Form.Select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="all">All Statuses</option>
                  <option value={DOCUMENT_STATUS.PENDING}>Pending</option>
                  <option value={DOCUMENT_STATUS.VERIFIED}>Verified</option>
                  <option value={DOCUMENT_STATUS.REJECTED}>Rejected</option>
                  <option value={DOCUMENT_STATUS.EXPIRED}>Expired</option>
                  <option value={DOCUMENT_STATUS.DRAFT}>Draft</option>
                  <option value={DOCUMENT_STATUS.ARCHIVED}>Archived</option>
                </Form.Select>
              </Col>
              <Col md={2}>
                <Dropdown>
                  <Dropdown.Toggle variant="outline-secondary" className="w-100">
                    <FaSort className="me-1" />
                    Sort By
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    <Dropdown.Item
                      onClick={() => setSortBy(SORT_OPTIONS.NEWEST)}
                      active={sortBy === SORT_OPTIONS.NEWEST}
                    >
                      <FaSortAmountDown className="me-2" />
                      Newest First
                    </Dropdown.Item>
                    <Dropdown.Item
                      onClick={() => setSortBy(SORT_OPTIONS.OLDEST)}
                      active={sortBy === SORT_OPTIONS.OLDEST}
                    >
                      <FaSortAmountUp className="me-2" />
                      Oldest First
                    </Dropdown.Item>
                    <Dropdown.Divider />
                    <Dropdown.Item
                      onClick={() => setSortBy(SORT_OPTIONS.NAME_ASC)}
                      active={sortBy === SORT_OPTIONS.NAME_ASC}
                    >
                      Name (A-Z)
                    </Dropdown.Item>
                    <Dropdown.Item
                      onClick={() => setSortBy(SORT_OPTIONS.NAME_DESC)}
                      active={sortBy === SORT_OPTIONS.NAME_DESC}
                    >
                      Name (Z-A)
                    </Dropdown.Item>
                    <Dropdown.Divider />
                    <Dropdown.Item
                      onClick={() => setSortBy(SORT_OPTIONS.SIZE_DESC)}
                      active={sortBy === SORT_OPTIONS.SIZE_DESC}
                    >
                      Largest First
                    </Dropdown.Item>
                    <Dropdown.Item
                      onClick={() => setSortBy(SORT_OPTIONS.SIZE_ASC)}
                      active={sortBy === SORT_OPTIONS.SIZE_ASC}
                    >
                      Smallest First
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </Col>
              <Col md={2}>
                <ButtonGroup className="w-100">
                  <Button
                    variant={viewMode === VIEW_MODES.GRID ? 'primary' : 'outline-secondary'}
                    onClick={() => setViewMode(VIEW_MODES.GRID)}
                  >
                    <FaTh />
                  </Button>
                  <Button
                    variant={viewMode === VIEW_MODES.LIST ? 'primary' : 'outline-secondary'}
                    onClick={() => setViewMode(VIEW_MODES.LIST)}
                  >
                    <FaList />
                  </Button>
                  <Button
                    variant={viewMode === VIEW_MODES.TABLE ? 'primary' : 'outline-secondary'}
                    onClick={() => setViewMode(VIEW_MODES.TABLE)}
                  >
                    <FaTable />
                  </Button>
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
                      <span className="fw-medium">
                        {selectedDocuments.length} selected
                      </span>
                    </div>
                    <div className="d-flex gap-2">
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => {
                          /* Bulk download */
                        }}
                        disabled={selectedDocuments.length === 0}
                      >
                        <FaDownload className="me-1" />
                        Download
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => setShowBulkDeleteModal(true)}
                        disabled={selectedDocuments.length === 0}
                      >
                        <FaTrash className="me-1" />
                        Delete
                      </Button>
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={clearSelection}
                      >
                        <FaTimes />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </Card.Body>
        </Card>

        {/* Content */}
        {filteredDocuments.length === 0 ? (
          <Card className="border-0 shadow-sm">
            <Card.Body className="text-center py-5">
              <FaFolderPlus size={64} className="text-muted mb-3" />
              <h4>
                {searchTerm || filterCategory !== 'all' || filterStatus !== 'all'
                  ? 'No documents match your filters'
                  : 'No documents yet'}
              </h4>
              <p className="text-muted mb-4">
                {searchTerm || filterCategory !== 'all' || filterStatus !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'Upload your first document to get started'}
              </p>
              {searchTerm || filterCategory !== 'all' || filterStatus !== 'all' ? (
                <Button
                  variant="outline-primary"
                  onClick={() => {
                    setSearchTerm('');
                    setFilterCategory('all');
                    setFilterStatus('all');
                    setFilterPriority('all');
                  }}
                >
                  Clear Filters
                </Button>
              ) : (
                <Button variant="primary" onClick={() => setShowUploadModal(true)}>
                  <FaUpload className="me-2" />
                  Upload Document
                </Button>
              )}
            </Card.Body>
          </Card>
        ) : (
          <>
            {/* Select All Toggle */}
            <div className="d-flex justify-content-between align-items-center mb-3">
              <Button
                variant="link"
                size="sm"
                className="text-decoration-none p-0"
                onClick={() => setIsSelectionMode(!isSelectionMode)}
              >
                <FaCheckSquare className="me-1" />
                {isSelectionMode ? 'Cancel Selection' : 'Select Multiple'}
              </Button>
              <small className="text-muted">
                Showing {paginatedDocuments.length} of {filteredDocuments.length}
              </small>
            </div>

            {/* Grid View */}
            {viewMode === VIEW_MODES.GRID && (
              <Row className="g-3">
                {paginatedDocuments.map((document) => {
                  const fileConfig = getFileConfig(document.fileType, document.fileName);
                  const FileIcon = fileConfig.icon;
                  const statusConfig = getStatusConfig(document.status);
                  const category = categoryMap[document.category];
                  const isSelected = selectedDocuments.includes(document.id);

                  return (
                    <Col key={document.id} xs={12} sm={6} md={4} lg={3}>
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Card
                          className={`document-card h-100 border-0 shadow-sm ${isSelected ? 'selected' : ''}`}
                        >
                          <Card.Body>
                            {isSelectionMode && (
                              <Form.Check
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleSelection(document.id)}
                                className="position-absolute top-0 start-0 m-2"
                              />
                            )}

                            <div className="d-flex align-items-start mb-3">
                              <div
                                className="document-icon-wrapper me-3"
                                style={{
                                  backgroundColor: `${fileConfig.color}15`,
                                  color: fileConfig.color,
                                }}
                              >
                                <FileIcon size={28} />
                              </div>
                              <div className="flex-grow-1 min-width-0">
                                <h6 className="document-title mb-1 text-truncate">
                                  {document.title}
                                </h6>
                                <p className="document-filename text-muted small mb-0 text-truncate">
                                  {document.fileName}
                                </p>
                              </div>
                            </div>

                            {document.description && (
                              <p className="document-description text-muted small mb-2">
                                {document.description.substring(0, 80)}
                                {document.description.length > 80 ? '...' : ''}
                              </p>
                            )}

                            <div className="d-flex gap-1 flex-wrap mb-3">
                              <Badge bg={statusConfig.bg} style={{ fontSize: '0.7rem' }}>
                                {statusConfig.label}
                              </Badge>
                              {category && (
                                <Badge
                                  bg="light"
                                  text="dark"
                                  style={{ fontSize: '0.7rem' }}
                                >
                                  {category.icon} {category.label}
                                </Badge>
                              )}
                            </div>

                            <div className="document-meta text-muted small">
                              <div className="d-flex justify-content-between mb-1">
                                <span>
                                  <FaDatabase size={10} className="me-1" />
                                  {formatFileSize(document.fileSize)}
                                </span>
                                <span>{formatDate(document.uploadDate)}</span>
                              </div>
                            </div>
                          </Card.Body>
                          <Card.Footer className="bg-transparent border-0 d-flex gap-1">
                            <OverlayTrigger placement="top" overlay={<Tooltip>Preview</Tooltip>}>
                              <Button
                                variant="outline-primary"
                                size="sm"
                                className="flex-fill"
                                onClick={() => handlePreview(document)}
                              >
                                <FaEye />
                              </Button>
                            </OverlayTrigger>
                            <OverlayTrigger placement="top" overlay={<Tooltip>Download</Tooltip>}>
                              <Button
                                variant="outline-success"
                                size="sm"
                                className="flex-fill"
                                onClick={() => handleDownload(document)}
                              >
                                <FaDownload />
                              </Button>
                            </OverlayTrigger>
                            <Dropdown>
                              <Dropdown.Toggle variant="outline-secondary" size="sm">
                                <FaEllipsisV />
                              </Dropdown.Toggle>
                              <Dropdown.Menu align="end">
                                <Dropdown.Item
                                  onClick={() => {
                                    setSelectedDocument(document);
                                    setShowEditModal(true);
                                  }}
                                >
                                  <FaEdit className="me-2" />
                                  Edit Details
                                </Dropdown.Item>
                                <Dropdown.Item
                                  onClick={() => {
                                    setSelectedDocument(document);
                                    setShowShareModal(true);
                                  }}
                                >
                                  <FaShare className="me-2" />
                                  Share
                                </Dropdown.Item>
                                <Dropdown.Item
                                  onClick={() => {
                                    setSelectedDocument(document);
                                    setShowDetailsModal(true);
                                  }}
                                >
                                  <FaInfoCircle className="me-2" />
                                  View Details
                                </Dropdown.Item>
                                <Dropdown.Divider />
                                <Dropdown.Item
                                  onClick={() =>
                                    handleChangeStatus(document.id, DOCUMENT_STATUS.ARCHIVED)
                                  }
                                >
                                  <FaArchive className="me-2" />
                                  Archive
                                </Dropdown.Item>
                                <Dropdown.Item
                                  className="text-danger"
                                  onClick={() => {
                                    setSelectedDocument(document);
                                    setShowDeleteModal(true);
                                  }}
                                >
                                  <FaTrash className="me-2" />
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

            {/* List View */}
            {viewMode === VIEW_MODES.LIST && (
              <ListGroup>
                {paginatedDocuments.map((document) => {
                  const fileConfig = getFileConfig(document.fileType, document.fileName);
                  const FileIcon = fileConfig.icon;
                  const statusConfig = getStatusConfig(document.status);
                  const isSelected = selectedDocuments.includes(document.id);

                  return (
                    <ListGroup.Item
                      key={document.id}
                      className={`document-list-item ${isSelected ? 'selected' : ''}`}
                    >
                      <div className="d-flex align-items-center">
                        {isSelectionMode && (
                          <Form.Check
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelection(document.id)}
                            className="me-3"
                          />
                        )}
                        <div
                          className="document-icon-wrapper me-3"
                          style={{
                            backgroundColor: `${fileConfig.color}15`,
                            color: fileConfig.color,
                          }}
                        >
                          <FileIcon size={24} />
                        </div>
                        <div className="flex-grow-1 min-width-0">
                          <h6 className="mb-1 text-truncate">{document.title}</h6>
                          <div className="d-flex gap-3 text-muted small">
                            <span>{document.fileName}</span>
                            <span>{formatFileSize(document.fileSize)}</span>
                            <span>{formatDate(document.uploadDate)}</span>
                          </div>
                        </div>
                        <Badge bg={statusConfig.bg} className="me-3">
                          {statusConfig.label}
                        </Badge>
                        <div className="d-flex gap-1">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => handlePreview(document)}
                          >
                            <FaEye />
                          </Button>
                          <Button
                            variant="outline-success"
                            size="sm"
                            onClick={() => handleDownload(document)}
                          >
                            <FaDownload />
                          </Button>
                          <Dropdown>
                            <Dropdown.Toggle variant="outline-secondary" size="sm">
                              <FaEllipsisV />
                            </Dropdown.Toggle>
                            <Dropdown.Menu align="end">
                              <Dropdown.Item
                                onClick={() => {
                                  setSelectedDocument(document);
                                  setShowEditModal(true);
                                }}
                              >
                                <FaEdit className="me-2" />
                                Edit
                              </Dropdown.Item>
                              <Dropdown.Item
                                onClick={() => {
                                  setSelectedDocument(document);
                                  setShowShareModal(true);
                                }}
                              >
                                <FaShare className="me-2" />
                                Share
                              </Dropdown.Item>
                              <Dropdown.Divider />
                              <Dropdown.Item
                                className="text-danger"
                                onClick={() => {
                                  setSelectedDocument(document);
                                  setShowDeleteModal(true);
                                }}
                              >
                                <FaTrash className="me-2" />
                                Delete
                              </Dropdown.Item>
                            </Dropdown.Menu>
                          </Dropdown>
                        </div>
                      </div>
                    </ListGroup.Item>
                  );
                })}
              </ListGroup>
            )}

            {/* Table View */}
            {viewMode === VIEW_MODES.TABLE && (
              <Card className="border-0 shadow-sm">
                <Card.Body className="p-0">
                  <Table hover responsive className="mb-0">
                    <thead>
                      <tr>
                        {isSelectionMode && <th style={{ width: '40px' }}></th>}
                        <th>Document</th>
                        <th>Category</th>
                        <th>Size</th>
                        <th>Status</th>
                        <th>Uploaded</th>
                        <th className="text-end">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedDocuments.map((document) => {
                        const fileConfig = getFileConfig(document.fileType, document.fileName);
                        const FileIcon = fileConfig.icon;
                        const statusConfig = getStatusConfig(document.status);
                        const category = categoryMap[document.category];
                        const isSelected = selectedDocuments.includes(document.id);

                        return (
                          <tr key={document.id} className={isSelected ? 'table-active' : ''}>
                            {isSelectionMode && (
                              <td>
                                <Form.Check
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => toggleSelection(document.id)}
                                />
                              </td>
                            )}
                            <td>
                              <div className="d-flex align-items-center">
                                <FileIcon
                                  size={20}
                                  className="me-2"
                                  style={{ color: fileConfig.color }}
                                />
                                <div>
                                  <div className="fw-medium">{document.title}</div>
                                  <small className="text-muted">{document.fileName}</small>
                                </div>
                              </div>
                            </td>
                            <td>
                              {category && (
                                <Badge bg="light" text="dark">
                                  {category.icon} {category.label}
                                </Badge>
                              )}
                            </td>
                            <td>{formatFileSize(document.fileSize)}</td>
                            <td>
                              <Badge bg={statusConfig.bg}>{statusConfig.label}</Badge>
                            </td>
                            <td>{formatDate(document.uploadDate)}</td>
                            <td className="text-end">
                              <ButtonGroup size="sm">
                                <Button
                                  variant="outline-primary"
                                  onClick={() => handlePreview(document)}
                                >
                                  <FaEye />
                                </Button>
                                <Button
                                  variant="outline-success"
                                  onClick={() => handleDownload(document)}
                                >
                                  <FaDownload />
                                </Button>
                                <Button
                                  variant="outline-danger"
                                  onClick={() => {
                                    setSelectedDocument(document);
                                    setShowDeleteModal(true);
                                  }}
                                >
                                  <FaTrash />
                                </Button>
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
      </Container>

      {/* ============================================
          MODALS
          ============================================ */}

      {/* Upload Modal */}
      <Modal
        show={showUploadModal}
        onHide={() => !uploading && setShowUploadModal(false)}
        centered
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <FaCloudUploadAlt className="me-2" />
            Upload Documents
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {/* Drop Zone */}
          <div
            ref={dropZoneRef}
            className="upload-drop-zone text-center p-5 border-2 border-dashed rounded mb-4"
            onClick={() => fileInputRef.current?.click()}
            style={{ cursor: 'pointer' }}
          >
            <FaCloudUploadAlt size={48} className="text-primary mb-3" />
            <h5>Drag & drop files here</h5>
            <p className="text-muted mb-3">or click to browse</p>
            <Button variant="outline-primary" size="sm">
              Choose Files
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="d-none"
              onChange={handleFileInputChange}
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.webp,.txt,.csv,.zip,.rar"
            />
            <p className="text-muted small mt-3 mb-0">
              Max {formatFileSize(MAX_FILE_SIZE)} per file • PDF, DOC, DOCX, XLS, XLSX, images
            </p>
          </div>

          {/* File Queue */}
          {uploadForm.files.length > 0 && (
            <div className="mb-4">
              <h6 className="mb-3">
                Files to Upload ({uploadForm.files.length})
              </h6>
              <ListGroup>
                {uploadForm.files.map((fileItem) => {
                  const fileConfig = getFileConfig(fileItem.type, fileItem.name);
                  const FileIcon = fileConfig.icon;

                  return (
                    <ListGroup.Item key={fileItem.id}>
                      <div className="d-flex align-items-center">
                        <FileIcon
                          size={24}
                          className="me-3"
                          style={{ color: fileConfig.color }}
                        />
                        <div className="flex-grow-1 min-width-0">
                          <div className="fw-medium text-truncate">{fileItem.name}</div>
                          <small className="text-muted">
                            {formatFileSize(fileItem.size)}
                          </small>
                          {fileItem.status === 'uploading' && (
                            <ProgressBar
                              now={fileItem.progress || 0}
                              className="mt-2"
                              style={{ height: '4px' }}
                              animated
                            />
                          )}
                        </div>
                        {fileItem.status === 'pending' && (
                          <Button
                            variant="link"
                            className="text-danger p-1"
                            onClick={() => removeFileFromQueue(fileItem.id)}
                          >
                            <FaTimes />
                          </Button>
                        )}
                        {fileItem.status === 'complete' && (
                          <FaCheckCircle className="text-success" size={20} />
                        )}
                        {fileItem.status === 'error' && (
                          <FaTimesCircle className="text-danger" size={20} />
                        )}
                      </div>
                    </ListGroup.Item>
                  );
                })}
              </ListGroup>
            </div>
          )}

          {/* Form Fields */}
          {uploadForm.files.length > 0 && (
            <>
              <Row className="g-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Title *</Form.Label>
                    <Form.Control
                      type="text"
                      value={uploadForm.title}
                      onChange={(e) =>
                        setUploadForm((prev) => ({ ...prev, title: e.target.value }))
                      }
                      placeholder="e.g., University Transcript"
                      disabled={uploading}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Category *</Form.Label>
                    <Form.Select
                      value={uploadForm.category}
                      onChange={(e) =>
                        setUploadForm((prev) => ({ ...prev, category: e.target.value }))
                      }
                      disabled={uploading}
                    >
                      {categories.map((cat) => (
                        <option key={cat.value} value={cat.value}>
                          {cat.icon} {cat.label}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={12}>
                  <Form.Group>
                    <Form.Label>Description</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={2}
                      value={uploadForm.description}
                      onChange={(e) =>
                        setUploadForm((prev) => ({ ...prev, description: e.target.value }))
                      }
                      placeholder="Brief description of the document(s)"
                      disabled={uploading}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Priority</Form.Label>
                    <Form.Select
                      value={uploadForm.priority}
                      onChange={(e) =>
                        setUploadForm((prev) => ({ ...prev, priority: e.target.value }))
                      }
                      disabled={uploading}
                    >
                      <option value="required">Required</option>
                      <option value="recommended">Recommended</option>
                      <option value="optional">Optional</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Expiry Date (Optional)</Form.Label>
                    <Form.Control
                      type="date"
                      value={uploadForm.expiryDate}
                      onChange={(e) =>
                        setUploadForm((prev) => ({ ...prev, expiryDate: e.target.value }))
                      }
                      disabled={uploading}
                    />
                  </Form.Group>
                </Col>
                <Col md={12}>
                  <Form.Group>
                    <Form.Label>Tags</Form.Label>
                    <InputGroup className="mb-2">
                      <FormControl
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        placeholder="Add a tag and press Enter"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddTag();
                          }
                        }}
                        disabled={uploading}
                      />
                      <Button
                        variant="outline-secondary"
                        onClick={handleAddTag}
                        disabled={uploading || !newTag.trim()}
                      >
                        <FaPlus />
                      </Button>
                    </InputGroup>
                    <div className="d-flex flex-wrap gap-1">
                      {uploadForm.tags.map((tag) => (
                        <Badge key={tag} bg="primary">
                          {tag}
                          <Button
                            variant="link"
                            className="text-white p-0 ms-2"
                            onClick={() => handleRemoveTag(tag)}
                          >
                            <FaTimes size={10} />
                          </Button>
                        </Badge>
                      ))}
                    </div>
                  </Form.Group>
                </Col>
                <Col md={12}>
                  <Form.Group>
                    <Form.Check
                      type="switch"
                      id="confidential-switch"
                      label="Mark as confidential"
                      checked={uploadForm.isConfidential}
                      onChange={(e) =>
                        setUploadForm((prev) => ({
                          ...prev,
                          isConfidential: e.target.checked,
                        }))
                      }
                      disabled={uploading}
                    />
                  </Form.Group>
                </Col>
                <Col md={12}>
                  <Form.Group className="mb-0">
                    <Form.Label>Sharing Permissions</Form.Label>
                    <Form.Check
                      type="checkbox"
                      id="share-employers"
                      label="Allow employers to view this document"
                      checked={uploadForm.shareWithEmployers}
                      onChange={(e) =>
                        setUploadForm((prev) => ({
                          ...prev,
                          shareWithEmployers: e.target.checked,
                        }))
                      }
                      disabled={uploading}
                    />
                    <Form.Check
                      type="checkbox"
                      id="share-institutions"
                      label="Allow educational institutions to view this document"
                      checked={uploadForm.shareWithInstitutions}
                      onChange={(e) =>
                        setUploadForm((prev) => ({
                          ...prev,
                          shareWithInstitutions: e.target.checked,
                        }))
                      }
                      disabled={uploading}
                    />
                  </Form.Group>
                </Col>
              </Row>
            </>
          )}

          {/* Upload Progress */}
          {uploading && (
            <div className="mt-4">
              <div className="d-flex justify-content-between mb-1">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <ProgressBar now={uploadProgress} animated />
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowUploadModal(false)}
            disabled={uploading}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleUpload}
            disabled={uploading || uploadForm.files.length === 0}
          >
            {uploading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Uploading...
              </>
            ) : (
              <>
                <FaUpload className="me-2" />
                Upload {uploadForm.files.length} File(s)
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <FaExclamationTriangle className="text-danger me-2" />
            Delete Document
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="warning">
            <FaExclamationTriangle className="me-2" />
            This action cannot be undone.
          </Alert>
          <p>
            Are you sure you want to delete <strong>&quot;{selectedDocument?.title}&quot;</strong>?
          </p>
          <p className="text-muted small mb-0">
            The file will be permanently removed from storage.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete} disabled={deleting}>
            {deleting ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Deleting...
              </>
            ) : (
              <>
                <FaTrash className="me-2" />
                Delete Document
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Preview Modal */}
      <Modal
        show={showPreviewModal}
        onHide={() => setShowPreviewModal(false)}
        size="xl"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {selectedDocument?.title}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          {selectedDocument &&
            (selectedDocument.fileType?.startsWith('image/') ? (
              <img
                src={selectedDocument.downloadURL}
                alt={selectedDocument.title}
                className="img-fluid"
                style={{ width: '100%' }}
              />
            ) : selectedDocument.fileType === 'application/pdf' ? (
              <iframe
                src={`${selectedDocument.downloadURL}#toolbar=1`}
                title={selectedDocument.title}
                style={{ width: '100%', height: '70vh', border: 'none' }}
              />
            ) : (
              <div className="text-center py-5">
                <FaFileAlt size={64} className="text-muted mb-3" />
                <h5>Preview not available</h5>
                <p className="text-muted">
                  This file type cannot be previewed. Please download it to view.
                </p>
                <Button variant="primary" onClick={() => handleDownload(selectedDocument)}>
                  <FaDownload className="me-2" />
                  Download File
                </Button>
              </div>
            ))}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowPreviewModal(false)}>
            Close
          </Button>
          <Button
            variant="primary"
            onClick={() => handleDownload(selectedDocument)}
            disabled={downloading}
          >
            <FaDownload className="me-2" />
            Download
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Edit Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <FaEdit className="me-2" />
            Edit Document
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedDocument && (
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Title</Form.Label>
                <Form.Control
                  type="text"
                  value={selectedDocument.title}
                  onChange={(e) =>
                    setSelectedDocument({ ...selectedDocument, title: e.target.value })
                  }
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={selectedDocument.description || ''}
                  onChange={(e) =>
                    setSelectedDocument({ ...selectedDocument, description: e.target.value })
                  }
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Category</Form.Label>
                <Form.Select
                  value={selectedDocument.category}
                  onChange={(e) =>
                    setSelectedDocument({ ...selectedDocument, category: e.target.value })
                  }
                >
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.icon} {cat.label}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Priority</Form.Label>
                <Form.Select
                  value={selectedDocument.priority || 'optional'}
                  onChange={(e) =>
                    setSelectedDocument({ ...selectedDocument, priority: e.target.value })
                  }
                >
                  <option value="required">Required</option>
                  <option value="recommended">Recommended</option>
                  <option value="optional">Optional</option>
                </Form.Select>
              </Form.Group>
              <Form.Check
                type="switch"
                label="Confidential"
                checked={selectedDocument.isConfidential || false}
                onChange={(e) =>
                  setSelectedDocument({
                    ...selectedDocument,
                    isConfidential: e.target.checked,
                  })
                }
                className="mb-2"
              />
              <Form.Check
                type="switch"
                label="Share with employers"
                checked={selectedDocument.shareWithEmployers !== false}
                onChange={(e) =>
                  setSelectedDocument({
                    ...selectedDocument,
                    shareWithEmployers: e.target.checked,
                  })
                }
                className="mb-2"
              />
              <Form.Check
                type="switch"
                label="Share with institutions"
                checked={selectedDocument.shareWithInstitutions || false}
                onChange={(e) =>
                  setSelectedDocument({
                    ...selectedDocument,
                    shareWithInstitutions: e.target.checked,
                  })
                }
              />
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleUpdateDocument}>
            <FaCheck className="me-2" />
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Share Modal */}
      <Modal show={showShareModal} onHide={() => setShowShareModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <FaShare className="me-2" />
            Share Document
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="mb-3">
            Share <strong>{selectedDocument?.title}</strong> with others:
          </p>
          <div className="d-grid gap-2">
            <Button variant="outline-primary" onClick={() => handleShareDocument('link')}>
              <FaLink className="me-2" />
              Copy Share Link
            </Button>
            <Button variant="outline-success" onClick={() => handleShareDocument('email')}>
              <FaExternalLinkAlt className="me-2" />
              Share via Email
            </Button>
            <Button variant="outline-info" onClick={() => handleShareDocument('qr')}>
              <FaQrcode className="me-2" />
              Generate QR Code
            </Button>
          </div>
        </Modal.Body>
      </Modal>

      {/* Details Modal */}
      <Modal show={showDetailsModal} onHide={() => setShowDetailsModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <FaInfoCircle className="me-2" />
            Document Details
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedDocument && (
            <ListGroup variant="flush">
              <ListGroup.Item className="d-flex justify-content-between">
                <span className="text-muted">Title</span>
                <span className="fw-medium">{selectedDocument.title}</span>
              </ListGroup.Item>
              <ListGroup.Item className="d-flex justify-content-between">
                <span className="text-muted">File Name</span>
                <span>{selectedDocument.fileName}</span>
              </ListGroup.Item>
              <ListGroup.Item className="d-flex justify-content-between">
                <span className="text-muted">Size</span>
                <span>{formatFileSize(selectedDocument.fileSize)}</span>
              </ListGroup.Item>
              <ListGroup.Item className="d-flex justify-content-between">
                <span className="text-muted">Type</span>
                <span>{selectedDocument.fileExtension?.toUpperCase()}</span>
              </ListGroup.Item>
              <ListGroup.Item className="d-flex justify-content-between">
                <span className="text-muted">Category</span>
                <span>{categoryMap[selectedDocument.category]?.label}</span>
              </ListGroup.Item>
              <ListGroup.Item className="d-flex justify-content-between">
                <span className="text-muted">Status</span>
                <Badge bg={getStatusConfig(selectedDocument.status).bg}>
                  {getStatusConfig(selectedDocument.status).label}
                </Badge>
              </ListGroup.Item>
              <ListGroup.Item className="d-flex justify-content-between">
                <span className="text-muted">Uploaded</span>
                <span>{formatDateTime(selectedDocument.uploadDate)}</span>
              </ListGroup.Item>
              {selectedDocument.verifiedDate && (
                <ListGroup.Item className="d-flex justify-content-between">
                  <span className="text-muted">Verified</span>
                  <span>{formatDateTime(selectedDocument.verifiedDate)}</span>
                </ListGroup.Item>
              )}
              <ListGroup.Item className="d-flex justify-content-between">
                <span className="text-muted">Downloads</span>
                <span>{selectedDocument.downloadCount || 0}</span>
              </ListGroup.Item>
              <ListGroup.Item className="d-flex justify-content-between">
                <span className="text-muted">Views</span>
                <span>{selectedDocument.viewCount || 0}</span>
              </ListGroup.Item>
              {selectedDocument.tags?.length > 0 && (
                <ListGroup.Item>
                  <div className="text-muted mb-2">Tags</div>
                  <div className="d-flex flex-wrap gap-1">
                    {selectedDocument.tags.map((tag) => (
                      <Badge key={tag} bg="light" text="dark">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </ListGroup.Item>
              )}
            </ListGroup>
          )}
        </Modal.Body>
      </Modal>

      {/* Bulk Delete Modal */}
      <Modal show={showBulkDeleteModal} onHide={() => setShowBulkDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <FaExclamationTriangle className="text-danger me-2" />
            Delete Multiple Documents
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="warning">
            <FaExclamationTriangle className="me-2" />
            This action cannot be undone.
          </Alert>
          <p>
            Are you sure you want to delete <strong>{selectedDocuments.length}</strong> document
            (s)?
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowBulkDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleBulkDelete} disabled={deleting}>
            {deleting ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Deleting...
              </>
            ) : (
              <>
                <FaTrash className="me-2" />
                Delete {selectedDocuments.length} Document(s)
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Documents;


