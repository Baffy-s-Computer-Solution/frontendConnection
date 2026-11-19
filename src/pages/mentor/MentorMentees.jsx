import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  limit,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  writeBatch,
  increment,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { db, storage, auth } from "../../config/firebase";
import { supabase } from "../../config/supabase";
import { useAuth } from "../../hooks/useAuth";
import {
  Users,
  UserPlus,
  UserMinus,
  UserCheck,
  UserX,
  Search,
  Filter,
  Plus,
  Edit3,
  Trash2,
  Eye,
  EyeOff,
  MoreVertical,
  MoreHorizontal,
  Mail,
  Phone,
  MapPin,
  Globe,
  Linkedin,
  Twitter,
  Github,
  Calendar,
  Clock,
  Video,
  MessageSquare,
  Star,
  Award,
  Trophy,
  Crown,
  Medal,
  Flame,
  Zap,
  Target,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  Activity,
  CheckCircle,
  XCircle,
  AlertCircle,
  Info,
  HelpCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Building2,
  Briefcase,
  GraduationCap,
  Handshake,
  Lightbulb,
  Rocket,
  Sparkles,
  Heart,
  ThumbsUp,
  Share2,
  Bookmark,
  Tag,
  Hash,
  AtSign,
  Download,
  Upload,
  FileText,
  FileSpreadsheet,
  FilePlus,
  FileMinus,
  Folder,
  FolderOpen,
  Archive,
  Send,
  Copy,
  Check,
  X,
  Link as LinkIcon,
  ExternalLink,
  RefreshCw,
  Settings,
  Bell,
  Shield,
  Lock,
  Unlock,
  Key,
  Fingerprint,
  Eye as EyeIcon,
  Ban,
  Slash,
  Flag,
  Pin,
  Calendar as CalendarIcon,
  User as UserIcon,
  Users as UsersIcon,
  GraduationCap as GradIcon,
  BookOpen,
  Award as AwardIcon,
  TrendingUp as TrendUp,
  Play,
  Pause,
  Square,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Headphones,
  Speaker,
  Radio,
  Tv,
  Monitor,
  Smartphone,
  Tablet,
  Laptop,
  Server,
  Database,
  HardDrive,
  Cpu,
  MemoryStick,
  Wifi,
  Bluetooth,
  Battery,
  BatteryCharging,
  Plug,
  Power,
  ToggleLeft,
  ToggleRight,
  Sliders,
  Gauge,
  DollarSign,
  CreditCard,
  Wallet,
  Receipt,
  Banknote,
  PiggyBank,
  Coins,
  Gem,
  Diamond,
  Gift,
  Package,
  Box,
  Menu,
  Home,
  LogOut,
  ArrowRight,
  ArrowLeft,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Equal,
  Divide,
  Percent,
  Calculator,
  Scale,
  Ruler,
  Timer,
  Hourglass,
  History,
  RotateCcw,
  Sun,
  Moon,
  Cloud,
  CloudRain,
  Wind,
  Droplets,
  Thermometer,
  Eye as EyeIcon3,
  Brain,
  Stethoscope,
} from "lucide-react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  ComposedChart,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import {
  format,
  formatDistanceToNow,
  differenceInDays,
  differenceInHours,
  startOfMonth,
  endOfMonth,
  subMonths,
  addMonths,
  subDays,
  addDays,
  startOfWeek,
  endOfWeek,
  isToday,
  isYesterday,
  isThisWeek,
} from "date-fns";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const cn = (...inputs) => twMerge(clsx(inputs));

const formatCurrency = (amount) =>
  `LSL ${Number(amount || 0).toLocaleString("en-LS", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;

const getInitials = (name) => {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

const getAvatarColor = (name) => {
  const colors = [
    "bg-red-500",
    "bg-orange-500",
    "bg-amber-500",
    "bg-yellow-500",
    "bg-lime-500",
    "bg-green-500",
    "bg-emerald-500",
    "bg-teal-500",
    "bg-cyan-500",
    "bg-sky-500",
    "bg-blue-500",
    "bg-indigo-500",
    "bg-violet-500",
    "bg-purple-500",
    "bg-fuchsia-500",
    "bg-pink-500",
    "bg-rose-500",
  ];
  const index =
    name?.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) || 0;
  return colors[index % colors.length];
};

const getProgressColor = (progress) => {
  if (progress >= 80) return "bg-green-500";
  if (progress >= 60) return "bg-lime-500";
  if (progress >= 40) return "bg-yellow-500";
  if (progress >= 20) return "bg-orange-500";
  return "bg-red-500";
};

const getStatusColor = (status) => {
  const colors = {
    active: "bg-green-100 text-green-800",
    pending: "bg-yellow-100 text-yellow-800",
    paused: "bg-gray-100 text-gray-800",
    completed: "bg-blue-100 text-blue-800",
    cancelled: "bg-red-100 text-red-800",
  };
  return colors[status] || "bg-gray-100 text-gray-800";
};

// ============================================================================
// CUSTOM HOOKS
// ============================================================================

const useMentees = (mentorId) => {
  const [mentees, setMentees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!mentorId) {
      setLoading(false);
      return undefined;
    }

    const q = query(
      collection(db, "mentorships"),
      where("mentorId", "==", mentorId),
    );

    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs
          .map((mentorshipDoc) => {
            const mentorship = mentorshipDoc.data();
            return {
              id: mentorshipDoc.id,
              ...mentorship,
              createdAt:
                mentorship.createdAt?.toDate?.() ||
                (mentorship.createdAt ? new Date(mentorship.createdAt) : null),
            };
          })
          .sort(
            (left, right) =>
              (right.createdAt?.getTime() || 0) -
              (left.createdAt?.getTime() || 0),
          );
        setMentees(data);
        setLoading(false);
      },
      (err) => {
        console.error("Mentees error:", err);
        setError(err.message);
        setLoading(false);
      },
    );

    return () => unsub();
  }, [mentorId]);

  return { mentees, loading, error };
};

// ============================================================================
// COMPONENTS
// ============================================================================

const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-50">
    <div className="text-center">
      <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto" />
      <p className="mt-4 text-gray-600 font-medium">Loading mentees...</p>
    </div>
  </div>
);

const Avatar = ({ src, name, size = "md", status }) => {
  const sizeClasses = {
    xs: "w-6 h-6 text-xs",
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base",
    xl: "w-16 h-16 text-lg",
    "2xl": "w-20 h-20 text-xl",
  };
  return (
    <div className="relative inline-block flex-shrink-0">
      {src ? (
        <img
          src={src}
          alt={name}
          className={cn("rounded-full object-cover", sizeClasses[size])}
          onError={(e) => {
            e.target.style.display = "none";
            e.target.nextSibling.style.display = "flex";
          }}
        />
      ) : null}
      <div
        className={cn(
          "rounded-full flex items-center justify-center font-semibold text-white",
          sizeClasses[size],
          !src ? getAvatarColor(name) : "hidden",
        )}
      >
        {getInitials(name)}
      </div>
      {status && (
        <span
          className={cn(
            "absolute bottom-0 right-0 block rounded-full ring-2 ring-white",
            size === "xs" || size === "sm" ? "w-2 h-2" : "w-3 h-3",
            status === "online" && "bg-green-500",
            status === "offline" && "bg-gray-400",
          )}
        />
      )}
    </div>
  );
};

const Badge = ({ children, variant = "default", size = "md" }) => {
  const variants = {
    default: "bg-gray-100 text-gray-800",
    primary: "bg-indigo-100 text-indigo-800",
    success: "bg-green-100 text-green-800",
    warning: "bg-yellow-100 text-yellow-800",
    danger: "bg-red-100 text-red-800",
    info: "bg-blue-100 text-blue-800",
    purple: "bg-purple-100 text-purple-800",
  };
  const sizes = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-1 text-sm",
    lg: "px-3 py-1.5 text-base",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center font-medium rounded-full",
        variants[variant],
        sizes[size],
      )}
    >
      {children}
    </span>
  );
};

const Button = ({
  children,
  variant = "primary",
  size = "md",
  icon: Icon,
  loading,
  className,
  ...props
}) => {
  const variants = {
    primary:
      "bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500",
    secondary:
      "bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-500",
    outline:
      "border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-indigo-500",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
    success: "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500",
    ghost: "text-gray-600 hover:bg-gray-100 focus:ring-gray-500",
  };
  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
    xl: "px-8 py-4 text-lg",
  };
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center font-medium rounded-lg transition-colors",
        "focus:outline-none focus:ring-2 focus:ring-offset-2",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        variants[variant],
        sizes[size],
        className,
      )}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      ) : Icon ? (
        <Icon className={cn("w-4 h-4", children && "mr-2")} />
      ) : null}
      {children}
    </button>
  );
};

const Card = ({ children, className, onClick, hover = false }) => (
  <div
    onClick={onClick}
    className={cn(
      "bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden",
      hover && "hover:shadow-lg transition-shadow cursor-pointer",
      className,
    )}
  >
    {children}
  </div>
);

const Modal = ({ isOpen, onClose, title, children, size = "md" }) => {
  if (!isOpen) return null;
  const sizes = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
    full: "max-w-6xl",
  };
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className={cn(
            "bg-white rounded-xl shadow-xl w-full max-h-[90vh] overflow-y-auto",
            sizes[size],
          )}
        >
          <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          <div className="p-6">{children}</div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

const ProgressBar = ({ value, max = 100, size = "md", color }) => {
  const percentage = Math.min((value / max) * 100, 100);
  const sizes = { sm: "h-1.5", md: "h-2", lg: "h-3" };
  return (
    <div
      className={cn(
        "w-full bg-gray-200 rounded-full overflow-hidden",
        sizes[size],
      )}
    >
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={cn(
          "h-full rounded-full",
          color || getProgressColor(percentage),
        )}
      />
    </div>
  );
};

// ============================================================================
// MENTEE CARD
// ============================================================================

const MenteeCard = ({
  mentee,
  onView,
  onMessage,
  onSchedule,
  onEdit,
  onPause,
  onResume,
  onRemove,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target))
        setShowMenu(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const progress = mentee.progress || 0;

  return (
    <Card className="p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4 flex-1 min-w-0">
          <Avatar
            src={mentee.menteeAvatar || mentee.avatar}
            name={mentee.menteeName || mentee.name}
            size="xl"
            status={mentee.status === "active" ? "online" : "offline"}
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <h3 className="font-semibold text-gray-900 truncate">
                {mentee.menteeName || mentee.name || "Unknown Mentee"}
              </h3>
              <Badge
                variant={
                  mentee.status === "active"
                    ? "success"
                    : mentee.status === "paused"
                      ? "warning"
                      : "default"
                }
                size="sm"
              >
                {mentee.status || "active"}
              </Badge>
            </div>
            {(mentee.menteeEmail || mentee.email) && (
              <p className="text-sm text-gray-500 truncate">
                {mentee.menteeEmail || mentee.email}
              </p>
            )}
            {(mentee.menteeHeadline || mentee.headline) && (
              <p className="text-sm text-gray-600 truncate mt-0.5">
                {mentee.menteeHeadline || mentee.headline}
              </p>
            )}
            <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
              {mentee.createdAt && (
                <span className="flex items-center">
                  <Calendar className="w-3 h-3 mr-1" />
                  Started{" "}
                  {formatDistanceToNow(new Date(mentee.createdAt), {
                    addSuffix: true,
                  })}
                </span>
              )}
              {mentee.completedSessions !== undefined && (
                <span className="flex items-center">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  {mentee.completedSessions} sessions
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <MoreVertical className="w-4 h-4 text-gray-500" />
          </button>
          <AnimatePresence>
            {showMenu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20"
              >
                <button
                  onClick={() => {
                    onView(mentee);
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <Eye className="w-4 h-4 mr-2" /> View Details
                </button>
                <button
                  onClick={() => {
                    onMessage(mentee);
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <MessageSquare className="w-4 h-4 mr-2" /> Send Message
                </button>
                <button
                  onClick={() => {
                    onEdit(mentee);
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <Edit3 className="w-4 h-4 mr-2" /> Edit Notes
                </button>
                {mentee.status === "active" ? (
                  <button
                    onClick={() => {
                      onPause(mentee);
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center px-4 py-2 text-sm text-yellow-600 hover:bg-yellow-50"
                  >
                    <Pause className="w-4 h-4 mr-2" /> Pause Mentorship
                  </button>
                ) : mentee.status === "paused" ? (
                  <button
                    onClick={() => {
                      onResume(mentee);
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center px-4 py-2 text-sm text-green-600 hover:bg-green-50"
                  >
                    <Play className="w-4 h-4 mr-2" /> Resume Mentorship
                  </button>
                ) : null}
                <button
                  onClick={() => {
                    onRemove(mentee);
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <UserMinus className="w-4 h-4 mr-2" /> Remove
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Progress */}
      <div className="mt-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-medium text-gray-600">
            Overall Progress
          </span>
          <span className="text-xs font-semibold text-gray-900">
            {progress}%
          </span>
        </div>
        <ProgressBar value={progress} />
      </div>

      {/* Goals / Skills */}
      {mentee.goals && mentee.goals.length > 0 && (
        <div className="mt-4">
          <p className="text-xs font-medium text-gray-500 uppercase mb-2">
            Goals
          </p>
          <div className="flex flex-wrap gap-1.5">
            {mentee.goals.slice(0, 3).map((goal, i) => (
              <span
                key={i}
                className="px-2 py-1 bg-indigo-50 text-indigo-700 text-xs font-medium rounded-full"
              >
                {goal}
              </span>
            ))}
            {mentee.goals.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                +{mentee.goals.length - 3}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="mt-4 pt-4 border-t border-gray-100 flex items-center space-x-2">
        <Button
          size="sm"
          variant="secondary"
          icon={MessageSquare}
          onClick={() => onMessage(mentee)}
          className="flex-1"
        >
          Message
        </Button>
        <Button
          size="sm"
          variant="outline"
          icon={Calendar}
          onClick={() => onSchedule(mentee)}
          className="flex-1"
        >
          Schedule
        </Button>
      </div>
    </Card>
  );
};

// ============================================================================
// MENTEE DETAIL MODAL
// ============================================================================

const MenteeDetailModal = ({
  mentee,
  isOpen,
  onClose,
  sessions,
  onMessage,
  onSchedule,
}) => {
  const [activeTab, setActiveTab] = useState("overview");

  if (!mentee) return null;

  const menteeSessions =
    sessions?.filter(
      (s) => s.menteeId === mentee.menteeId || s.menteeId === mentee.id,
    ) || [];
  const completedSessions = menteeSessions.filter(
    (s) => s.status === "completed",
  );
  const upcomingSessions = menteeSessions.filter(
    (s) => new Date(s.scheduledAt) > new Date() && s.status === "scheduled",
  );

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "sessions", label: `Sessions (${menteeSessions.length})` },
    { id: "notes", label: "Notes" },
    { id: "goals", label: "Goals" },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Mentee Details" size="xl">
      {/* Header */}
      <div className="flex items-start space-x-4 pb-6 border-b border-gray-200">
        <Avatar
          src={mentee.menteeAvatar || mentee.avatar}
          name={mentee.menteeName || mentee.name}
          size="2xl"
        />
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <h2 className="text-2xl font-bold text-gray-900">
              {mentee.menteeName || mentee.name}
            </h2>
            <Badge variant={mentee.status === "active" ? "success" : "warning"}>
              {mentee.status || "active"}
            </Badge>
          </div>
          {(mentee.menteeHeadline || mentee.headline) && (
            <p className="mt-1 text-gray-600">
              {mentee.menteeHeadline || mentee.headline}
            </p>
          )}
          <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-gray-500">
            {(mentee.menteeEmail || mentee.email) && (
              <span className="flex items-center">
                <Mail className="w-4 h-4 mr-1" />
                {mentee.menteeEmail || mentee.email}
              </span>
            )}
            {mentee.phone && (
              <span className="flex items-center">
                <Phone className="w-4 h-4 mr-1" />
                {mentee.phone}
              </span>
            )}
            {mentee.location && (
              <span className="flex items-center">
                <MapPin className="w-4 h-4 mr-1" />
                {mentee.location}
              </span>
            )}
          </div>
          <div className="mt-4 flex items-center space-x-2">
            <Button
              size="sm"
              icon={MessageSquare}
              onClick={() => onMessage(mentee)}
            >
              Message
            </Button>
            <Button size="sm" variant="outline" icon={Calendar} onClick={() => onSchedule(mentee)}>
              Schedule Session
            </Button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 my-6">
        <div className="bg-blue-50 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-blue-700">
            {menteeSessions.length}
          </p>
          <p className="text-xs text-blue-600">Total Sessions</p>
        </div>
        <div className="bg-green-50 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-green-700">
            {completedSessions.length}
          </p>
          <p className="text-xs text-green-600">Completed</p>
        </div>
        <div className="bg-purple-50 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-purple-700">
            {mentee.progress || 0}%
          </p>
          <p className="text-xs text-purple-600">Progress</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-4">
        <nav className="flex space-x-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "py-3 border-b-2 text-sm font-medium transition-colors",
                activeTab === tab.id
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700",
              )}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="space-y-4">
        {activeTab === "overview" && (
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">
                About
              </h4>
              <p className="text-sm text-gray-600">
                {mentee.bio || "No bio provided."}
              </p>
            </div>
            {mentee.skills && mentee.skills.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">
                  Skills
                </h4>
                <div className="flex flex-wrap gap-2">
                  {mentee.skills.map((skill, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {mentee.interests && mentee.interests.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">
                  Interests
                </h4>
                <div className="flex flex-wrap gap-2">
                  {mentee.interests.map((interest, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs font-medium rounded-full"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "sessions" && (
          <div className="space-y-3">
            {menteeSessions.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No sessions yet</p>
            ) : (
              menteeSessions.map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900 text-sm">
                      {session.title || "Session"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {format(
                        new Date(session.scheduledAt),
                        "MMM d, yyyy h:mm a",
                      )}
                    </p>
                  </div>
                  <Badge
                    variant={
                      session.status === "completed"
                        ? "success"
                        : session.status === "cancelled"
                          ? "danger"
                          : "info"
                    }
                    size="sm"
                  >
                    {session.status}
                  </Badge>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === "notes" && (
          <div>
            <p className="text-sm text-gray-600 whitespace-pre-wrap">
              {mentee.mentorNotes || "No notes added yet."}
            </p>
          </div>
        )}

        {activeTab === "goals" && (
          <div className="space-y-3">
            {(mentee.goals || []).length === 0 ? (
              <p className="text-center text-gray-500 py-8">No goals set</p>
            ) : (
              mentee.goals.map((goal, i) => (
                <div
                  key={i}
                  className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg"
                >
                  <Target className="w-4 h-4 text-indigo-600 mt-0.5" />
                  <p className="text-sm text-gray-700">{goal}</p>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const MentorMentees = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [filters, setFilters] = useState({ status: "all", search: "" });
  const [activeTab, setActiveTab] = useState("active");
  const [viewMode, setViewMode] = useState("grid"); // grid, list
  const [selectedMentee, setSelectedMentee] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [sessionsError, setSessionsError] = useState("");

  const mentorId = user?.uid;
  const { mentees, loading, error } = useMentees(mentorId);

  // Fetch sessions for detail view
  useEffect(() => {
    if (!mentorId) return;
    const q = query(
      collection(db, "mentorSessions"),
      where("mentorId", "==", mentorId),
    );
    const unsub = onSnapshot(
      q,
      (snapshot) => {
        setSessions(
          snapshot.docs
            .map((sessionDoc) => {
              const session = sessionDoc.data();
              return {
                id: sessionDoc.id,
                ...session,
                scheduledAt:
                  session.scheduledAt?.toDate?.() ||
                  (session.scheduledAt ? new Date(session.scheduledAt) : null),
              };
            })
            .sort(
              (left, right) =>
                (right.scheduledAt?.getTime() || 0) -
                (left.scheduledAt?.getTime() || 0),
            ),
        );
        setSessionsError("");
      },
      (error) =>
        setSessionsError(
          error.message || "Unable to load sessions for mentees.",
        ),
    );
    return () => unsub();
  }, [mentorId]);

  const stats = useMemo(() => {
    return {
      total: mentees.length,
      active: mentees.filter((m) => m.status === "active" || !m.status).length,
      paused: mentees.filter((m) => m.status === "paused").length,
      completed: mentees.filter((m) => m.status === "completed").length,
      avgProgress:
        mentees.length > 0
          ? Math.round(
              mentees.reduce((sum, m) => sum + (m.progress || 0), 0) /
                mentees.length,
            )
          : 0,
    };
  }, [mentees]);

  const filteredMentees = useMemo(() => {
    let filtered = [...mentees];

    if (activeTab === "active") {
      filtered = filtered.filter((m) => m.status === "active" || !m.status);
    } else if (activeTab === "paused") {
      filtered = filtered.filter((m) => m.status === "paused");
    } else if (activeTab === "completed") {
      filtered = filtered.filter((m) => m.status === "completed");
    }

    if (filters.search) {
      const term = filters.search.toLowerCase();
      filtered = filtered.filter(
        (m) =>
          (m.menteeName || m.name)?.toLowerCase().includes(term) ||
          (m.menteeEmail || m.email)?.toLowerCase().includes(term),
      );
    }

    return filtered;
  }, [mentees, activeTab, filters.search]);

  const handleMessage = useCallback(
    (mentee) => {
      navigate(`/mentor/messages?mentee=${encodeURIComponent(mentee.menteeId || mentee.id)}&mentorship=${encodeURIComponent(mentee.id)}`);
    },
    [navigate],
  );

  const handleSchedule = useCallback((mentee) => {
    navigate(`/mentor/sessions?mentee=${encodeURIComponent(mentee.menteeId || mentee.id)}`);
  }, [navigate]);

  const handlePause = useCallback(async (mentee) => {
    if (!window.confirm("Pause this mentorship?")) return;
    try {
      await updateDoc(doc(db, "mentorships", mentee.id), {
        status: "paused",
        pausedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      await supabase
        .from("mentorships")
        .update({ status: "paused" })
        .eq("firebase_id", mentee.id)
        .catch(() => {});
      toast.success("Mentorship paused");
    } catch (error) {
      toast.error("Failed to pause mentorship");
    }
  }, []);

  const handleResume = useCallback(async (mentee) => {
    try {
      await updateDoc(doc(db, "mentorships", mentee.id), {
        status: "active",
        resumedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      await supabase
        .from("mentorships")
        .update({ status: "active" })
        .eq("firebase_id", mentee.id)
        .catch(() => {});
      toast.success("Mentorship resumed");
    } catch (error) {
      toast.error("Failed to resume mentorship");
    }
  }, []);

  const handleRemove = useCallback(async (mentee) => {
    if (!window.confirm("Remove this mentee? This action cannot be undone."))
      return;
    try {
      await updateDoc(doc(db, "mentorships", mentee.id), {
        status: "ended",
        endedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      await addDoc(collection(db, "notifications"), {
        userId: mentee.menteeId,
        type: "mentorship_ended",
        title: "Mentorship Ended",
        message: "Your mentorship has been ended by your mentor.",
        read: false,
        createdAt: serverTimestamp(),
      });

      await supabase
        .from("mentorships")
        .update({ status: "ended" })
        .eq("firebase_id", mentee.id)
        .catch(() => {});
      toast.success("Mentee removed");
    } catch (error) {
      toast.error("Failed to remove mentee");
    }
  }, []);

  const handleView = useCallback((mentee) => {
    setSelectedMentee(mentee);
    setIsDetailOpen(true);
  }, []);

  if (authLoading || loading) return <LoadingSpinner />;
  if (!user) {
    navigate("/login");
    return null;
  }

  const tabs = [
    { id: "active", label: "Active", count: stats.active },
    { id: "paused", label: "Paused", count: stats.paused },
    { id: "completed", label: "Completed", count: stats.completed },
    { id: "all", label: "All", count: stats.total },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link
                to="/mentor/dashboard"
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </Link>
              <h1 className="text-lg font-semibold text-gray-900">
                My Mentees
              </h1>
            </div>
            <div className="flex items-center space-x-3">
              <div className="hidden md:flex items-center bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={cn(
                    "px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
                    viewMode === "grid"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-600",
                  )}
                >
                  Grid
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={cn(
                    "px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
                    viewMode === "list"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-600",
                  )}
                >
                  List
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {sessionsError && (
          <p
            role="alert"
            className="mb-5 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200"
          >
            {sessionsError}
          </p>
        )}
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Total Mentees
                </p>
                <p className="mt-1 text-2xl font-bold text-gray-900">
                  {stats.total}
                </p>
              </div>
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-indigo-600" />
              </div>
            </div>
          </Card>
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Active</p>
                <p className="mt-1 text-2xl font-bold text-green-600">
                  {stats.active}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <UserCheck className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </Card>
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Paused</p>
                <p className="mt-1 text-2xl font-bold text-yellow-600">
                  {stats.paused}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Pause className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </Card>
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Avg Progress
                </p>
                <p className="mt-1 text-2xl font-bold text-purple-600">
                  {stats.avgProgress}%
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center space-x-1 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap",
                    activeTab === tab.id
                      ? "bg-indigo-600 text-white"
                      : "text-gray-600 hover:bg-gray-100",
                  )}
                >
                  <span>{tab.label}</span>
                  <span
                    className={cn(
                      "px-1.5 py-0.5 text-xs rounded-full",
                      activeTab === tab.id
                        ? "bg-white bg-opacity-20"
                        : "bg-gray-200",
                    )}
                  >
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search mentees..."
                value={filters.search}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, search: e.target.value }))
                }
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm w-64"
              />
            </div>
          </div>
        </Card>

        {/* Mentees Grid/List */}
        {filteredMentees.length === 0 ? (
          <Card className="p-12">
            <div className="text-center">
              <Users className="w-16 h-16 text-gray-300 mx-auto" />
              <h3 className="mt-4 text-lg font-semibold text-gray-900">
                {filters.search
                  ? "No matching mentees"
                  : `No ${activeTab} mentees`}
              </h3>
              <p className="mt-2 text-gray-500 max-w-sm mx-auto">
                {filters.search
                  ? "Try a different search term"
                  : "Mentees will appear here once they join your mentorship."}
              </p>
            </div>
          </Card>
        ) : (
          <div
            className={cn(
              viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                : "space-y-4",
            )}
          >
            {filteredMentees.map((mentee) => (
              <MenteeCard
                key={mentee.id}
                mentee={mentee}
                onView={handleView}
                onMessage={handleMessage}
                onSchedule={handleSchedule}
                onEdit={handleView}
                onPause={handlePause}
                onResume={handleResume}
                onRemove={handleRemove}
              />
            ))}
          </div>
        )}
      </main>

      <MenteeDetailModal
        mentee={selectedMentee}
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedMentee(null);
        }}
        sessions={sessions}
        onMessage={handleMessage}
        onSchedule={handleSchedule}
      />
    </div>
  );
};

export default MentorMentees;
