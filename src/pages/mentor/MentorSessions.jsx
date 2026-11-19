import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
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
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  writeBatch,
  increment,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { db, storage, auth } from "../../config/firebase";
import { supabase } from "../../config/supabase";
import { useAuth } from "../../hooks/useAuth";
import {
  Calendar,
  Clock,
  Video,
  Users,
  Plus,
  Search,
  Filter,
  X,
  Check,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Edit3,
  Trash2,
  Eye,
  MoreVertical,
  Play,
  Square,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader2,
  Bell,
  Settings,
  MapPin,
  Globe,
  Link as LinkIcon,
  Copy,
  Download,
  Upload,
  FileText,
  MessageSquare,
  Star,
  Award,
  Zap,
  TrendingUp,
  BarChart3,
  PieChart,
  Activity,
  DollarSign,
  CreditCard,
  RefreshCw,
  ExternalLink,
  Info,
  HelpCircle,
  Lock,
  Unlock,
  Shield,
  User as UserIcon,
  Briefcase,
  GraduationCap,
  Building2,
  Handshake,
  Lightbulb,
  Rocket,
  Sparkles,
  Crown,
  Medal,
  Trophy,
  Flame,
  Sun,
  Moon,
  Cloud,
  CloudRain,
  Wind,
  Droplets,
  Thermometer,
  Eye as EyeIcon,
  EyeOff,
  Key,
  Fingerprint,
  Scan,
  QrCode,
  Barcode,
  Wallet,
  Receipt,
  FileSpreadsheet,
  FilePlus,
  FileMinus,
  Folder,
  FolderOpen,
  Archive,
  Trash,
  RotateCcw,
  RotateCw,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Move,
  Copy as CopyIcon,
  Clipboard,
  Scissors,
  Paintbrush,
  Palette,
  Pipette,
  Ruler,
  PenTool,
  Type,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Indent,
  Outdent,
  Unlink,
  Image,
  Video as VideoIcon,
  Music,
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
  Beaker,
  FlaskConical,
  Atom,
  Dna,
  Microscope,
  Telescope,
  Satellite,
  Plane,
  Car,
  Bike,
  Train,
  Ship,
  Truck,
  Bus,
  Ambulance,
  FireExtinguisher,
  Hospital,
  School,
  Church,
  Landmark,
  Banknote,
  Coins,
  PiggyBank,
  Gem,
  Diamond,
  Gift,
  Package,
  Box,
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
  Scatter,
  ScatterChart,
  ZAxis,
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
  differenceInMinutes,
  isToday,
  isYesterday,
  isTomorrow,
  isPast,
  isFuture,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  subDays,
  subWeeks,
  subMonths,
  addDays,
  addWeeks,
  addMonths,
  eachDayOfInterval,
  isSameDay,
  isSameMonth,
  parseISO,
  setHours,
  setMinutes,
  getDay,
  getDate,
  getMonth,
  getYear,
  startOfDay,
  endOfDay,
  addHours,
  subHours,
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

const getStatusColor = (status) => {
  const colors = {
    scheduled: "bg-blue-100 text-blue-800",
    confirmed: "bg-indigo-100 text-indigo-800",
    in_progress: "bg-yellow-100 text-yellow-800",
    completed: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
    rescheduled: "bg-orange-100 text-orange-800",
    no_show: "bg-gray-100 text-gray-800",
  };
  return colors[status] || "bg-gray-100 text-gray-800";
};

// ============================================================================
// CUSTOM HOOKS
// ============================================================================

const useSessions = (mentorId, filters = {}) => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!mentorId) {
      setLoading(false);
      return undefined;
    }
    setError(null);

    let q = query(
      collection(db, "mentorSessions"),
      where("mentorId", "==", mentorId),
    );

    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs
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
          .filter(
            (session) =>
              !filters.status ||
              filters.status === "all" ||
              session.status === filters.status,
          )
          .sort(
            (left, right) =>
              (right.scheduledAt?.getTime() || 0) -
              (left.scheduledAt?.getTime() || 0),
          );
        setSessions(data);
        setLoading(false);
      },
      (err) => {
        console.error("Sessions listener error:", err);
        setError(err.message);
        setLoading(false);
      },
    );

    return () => unsub();
  }, [mentorId, filters.status]);

  return { sessions, loading, error };
};

const useMentees = (mentorId) => {
  const [mentees, setMentees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!mentorId) {
      setMentees([]);
      setLoading(false);
      return undefined;
    }
    setError(null);

    const q = query(
      collection(db, "mentorships"),
      where("mentorId", "==", mentorId),
    );

    const unsub = onSnapshot(
      q,
      (snapshot) => {
        setMentees(
          snapshot.docs
            .map((mentorshipDoc) => ({
              mentorshipId: mentorshipDoc.id,
              ...mentorshipDoc.data(),
              id: mentorshipDoc.data().menteeId,
            }))
            .filter((mentorship) => mentorship.status === "active"),
        );
        setError(null);
        setLoading(false);
      },
      (listenerError) => {
        setError(listenerError.message || "Unable to load mentees.");
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
      <p className="mt-4 text-gray-600 font-medium">Loading sessions...</p>
    </div>
  </div>
);

const Avatar = ({ src, name, size = "md", status, className }) => {
  const sizeClasses = {
    xs: "w-6 h-6 text-xs",
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base",
    xl: "w-16 h-16 text-lg",
    "2xl": "w-20 h-20 text-xl",
  };

  return (
    <div className={cn("relative inline-block", className)}>
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
            status === "busy" && "bg-red-500",
            status === "away" && "bg-yellow-500",
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

const EmptyState = ({ icon: Icon, title, description, action }) => (
  <div className="text-center py-12">
    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
      <Icon className="w-8 h-8 text-gray-400" />
    </div>
    <h3 className="mt-4 text-lg font-semibold text-gray-900">{title}</h3>
    <p className="mt-2 text-gray-500 max-w-sm mx-auto">{description}</p>
    {action && <div className="mt-6">{action}</div>}
  </div>
);

// ============================================================================
// CALENDAR COMPONENT
// ============================================================================

const SessionCalendar = ({
  sessions,
  currentDate,
  onDateChange,
  onSessionClick,
}) => {
  const [view, setView] = useState("month"); // month, week, day

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const getSessionsForDay = (day) => {
    return sessions.filter((s) => isSameDay(s.scheduledAt, day));
  };

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <Card className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-bold text-gray-900">
            {format(currentDate, "MMMM yyyy")}
          </h2>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => onDateChange(subMonths(currentDate, 1))}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDateChange(new Date())}
              className="px-3 py-1.5 text-sm font-medium rounded-lg hover:bg-gray-100 transition-colors"
            >
              Today
            </button>
            <button
              onClick={() => onDateChange(addMonths(currentDate, 1))}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <select
            value={view}
            onChange={(e) => setView(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="month">Month</option>
            <option value="week">Week</option>
            <option value="day">Day</option>
          </select>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden">
        {/* Day Headers */}
        {weekDays.map((day) => (
          <div
            key={day}
            className="bg-gray-50 py-3 text-center text-xs font-semibold text-gray-600 uppercase"
          >
            {day}
          </div>
        ))}

        {/* Calendar Days */}
        {days.map((day, index) => {
          const daySessions = getSessionsForDay(day);
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isTodayDate = isToday(day);

          return (
            <div
              key={index}
              className={cn(
                "bg-white min-h-[120px] p-2 transition-colors hover:bg-gray-50",
                !isCurrentMonth && "bg-gray-50 opacity-60",
              )}
            >
              <div
                className={cn(
                  "w-7 h-7 rounded-full flex items-center justify-center text-sm font-medium mb-1",
                  isTodayDate ? "bg-indigo-600 text-white" : "text-gray-700",
                )}
              >
                {getDate(day)}
              </div>
              <div className="space-y-1">
                {daySessions.slice(0, 3).map((session) => (
                  <button
                    key={session.id}
                    onClick={() => onSessionClick(session)}
                    className={cn(
                      "w-full text-left px-2 py-1 rounded text-xs truncate",
                      "hover:opacity-80 transition-opacity",
                      session.status === "completed"
                        ? "bg-green-100 text-green-800"
                        : session.status === "cancelled"
                          ? "bg-red-100 text-red-800"
                          : session.status === "in_progress"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-indigo-100 text-indigo-800",
                    )}
                  >
                    {format(session.scheduledAt, "h:mm a")} -{" "}
                    {session.menteeName || "Session"}
                  </button>
                ))}
                {daySessions.length > 3 && (
                  <button
                    onClick={() => onDateChange(day)}
                    className="text-xs text-indigo-600 font-medium hover:text-indigo-700"
                  >
                    +{daySessions.length - 3} more
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

// ============================================================================
// SESSION CARD COMPONENT
// ============================================================================

const SessionCard = ({
  session,
  onJoin,
  onEdit,
  onCancel,
  onComplete,
  onDelete,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const sessionDate = new Date(session.scheduledAt);
  const isUpcoming = isFuture(sessionDate) && session.status !== "cancelled";
  const isPast = isPast(sessionDate);
  const canJoin =
    session.status === "scheduled" ||
    session.status === "confirmed" ||
    (isToday(sessionDate) &&
      session.status !== "completed" &&
      session.status !== "cancelled");

  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1 min-w-0">
          <Avatar
            src={session.menteeAvatar}
            name={session.menteeName}
            size="lg"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <h3 className="font-semibold text-gray-900 truncate">
                {session.title || "Mentorship Session"}
              </h3>
              <span
                className={cn(
                  "px-2 py-0.5 text-xs font-medium rounded-full",
                  getStatusColor(session.status),
                )}
              >
                {session.status?.replace("_", " ") || "scheduled"}
              </span>
            </div>
            <p className="mt-0.5 text-sm text-gray-600">{session.menteeName}</p>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-gray-500">
              <span className="flex items-center">
                <Calendar className="w-3.5 h-3.5 mr-1" />
                {format(sessionDate, "MMM d, yyyy")}
              </span>
              <span className="flex items-center">
                <Clock className="w-3.5 h-3.5 mr-1" />
                {format(sessionDate, "h:mm a")} ({session.duration || 60} min)
              </span>
              {session.meetingPlatform && (
                <span className="flex items-center">
                  <Video className="w-3.5 h-3.5 mr-1" />
                  {session.meetingPlatform}
                </span>
              )}
            </div>
            {session.agenda && (
              <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                {session.agenda}
              </p>
            )}
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
                {canJoin && (
                  <button
                    onClick={() => {
                      onJoin(session);
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <Video className="w-4 h-4 mr-2" /> Join Session
                  </button>
                )}
                {isUpcoming && (
                  <button
                    onClick={() => {
                      onEdit(session);
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <Edit3 className="w-4 h-4 mr-2" /> Edit
                  </button>
                )}
                {isPast && session.status === "scheduled" && (
                  <button
                    onClick={() => {
                      onComplete(session);
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" /> Mark Complete
                  </button>
                )}
                {isUpcoming && (
                  <button
                    onClick={() => {
                      onCancel(session);
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <XCircle className="w-4 h-4 mr-2" /> Cancel
                  </button>
                )}
                {isPast && (
                  <button
                    onClick={() => {
                      onDelete(session);
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4 mr-2" /> Delete
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {canJoin && (
        <div className="mt-4 flex items-center justify-end space-x-2">
          {session.meetingLink && (
            <Button
              size="sm"
              variant="primary"
              icon={Video}
              onClick={() => onJoin(session)}
            >
              Join Now
            </Button>
          )}
        </div>
      )}
    </Card>
  );
};

// ============================================================================
// SESSION FORM
// ============================================================================

const SessionForm = ({ session, mentees, onSave, onCancel, initialMenteeId = "" }) => {
  const [formData, setFormData] = useState({
    title: session?.title || "",
    menteeId: session?.menteeId || initialMenteeId,
    agenda: session?.agenda || "",
    scheduledAt: session?.scheduledAt
      ? format(new Date(session.scheduledAt), "yyyy-MM-dd'T'HH:mm")
      : format(addHours(new Date(), 24), "yyyy-MM-dd'T'HH:mm"),
    duration: session?.duration || 60,
    meetingPlatform: session?.meetingPlatform || "zoom",
    meetingLink: session?.meetingLink || "",
    notes: session?.notes || "",
    timezone:
      session?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.menteeId) {
      toast.error("Please select a mentee");
      return;
    }
    if (!formData.scheduledAt) {
      toast.error("Please select a date and time");
      return;
    }

    setSaving(true);
    try {
      const selectedMentee = mentees.find((m) => m.id === formData.menteeId);
      await onSave({
        ...formData,
        menteeName:
          selectedMentee?.menteeName || selectedMentee?.name || "Mentee",
        menteeAvatar:
          selectedMentee?.menteeAvatar || selectedMentee?.avatar || null,
        scheduledAt: Timestamp.fromDate(new Date(formData.scheduledAt)),
      });
      toast.success(session ? "Session updated!" : "Session scheduled!");
    } catch (error) {
      console.error("Error saving session:", error);
      toast.error("Failed to save session");
    } finally {
      setSaving(false);
    }
  };

  const platforms = [
    { value: "zoom", label: "Zoom", icon: Video },
    { value: "google_meet", label: "Google Meet", icon: Video },
    { value: "teams", label: "Microsoft Teams", icon: Video },
    { value: "custom", label: "Custom Link", icon: LinkIcon },
    { value: "in_person", label: "In Person", icon: MapPin },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Session Title
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, title: e.target.value }))
          }
          placeholder="e.g., Career Strategy Discussion"
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Mentee *
        </label>
        <select
          value={formData.menteeId}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, menteeId: e.target.value }))
          }
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          required
        >
          <option value="">Select a mentee</option>
          {mentees.map((mentee) => (
            <option key={mentee.id} value={mentee.id}>
              {mentee.menteeName ||
                mentee.name ||
                mentee.displayName ||
                "Mentee"}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date & Time *
          </label>
          <input
            type="datetime-local"
            value={formData.scheduledAt}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, scheduledAt: e.target.value }))
            }
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Duration (minutes)
          </label>
          <select
            value={formData.duration}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                duration: parseInt(e.target.value),
              }))
            }
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value={30}>30 minutes</option>
            <option value={45}>45 minutes</option>
            <option value={60}>1 hour</option>
            <option value={90}>1.5 hours</option>
            <option value={120}>2 hours</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Meeting Platform
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {platforms.map((platform) => (
            <button
              key={platform.value}
              type="button"
              onClick={() =>
                setFormData((prev) => ({
                  ...prev,
                  meetingPlatform: platform.value,
                }))
              }
              className={cn(
                "flex flex-col items-center p-3 rounded-lg border-2 transition-all",
                formData.meetingPlatform === platform.value
                  ? "border-indigo-500 bg-indigo-50"
                  : "border-gray-200 hover:border-gray-300",
              )}
            >
              <platform.icon
                className={cn(
                  "w-5 h-5 mb-1",
                  formData.meetingPlatform === platform.value
                    ? "text-indigo-600"
                    : "text-gray-500",
                )}
              />
              <span className="text-xs font-medium text-gray-700">
                {platform.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {formData.meetingPlatform !== "in_person" && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Meeting Link
          </label>
          <input
            type="url"
            value={formData.meetingLink}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, meetingLink: e.target.value }))
            }
            placeholder="https://zoom.us/j/..."
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
          <p className="mt-1 text-xs text-gray-500">
            Leave empty to auto-generate on first join
          </p>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Agenda
        </label>
        <textarea
          value={formData.agenda}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, agenda: e.target.value }))
          }
          placeholder="What will you discuss in this session?"
          rows={3}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Private Notes
        </label>
        <textarea
          value={formData.notes}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, notes: e.target.value }))
          }
          placeholder="Notes for yourself (not visible to mentee)"
          rows={2}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
        />
      </div>

      <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" loading={saving}>
          {session ? "Update Session" : "Schedule Session"}
        </Button>
      </div>
    </form>
  );
};

// ============================================================================
// SESSION DETAIL MODAL
// ============================================================================

const SessionDetailModal = ({
  session,
  isOpen,
  onClose,
  onJoin,
  onComplete,
  onCancel,
}) => {
  if (!session) return null;

  const sessionDate = new Date(session.scheduledAt);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Session Details" size="lg">
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Avatar
            src={session.menteeAvatar}
            name={session.menteeName}
            size="xl"
          />
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              {session.title || "Mentorship Session"}
            </h3>
            <p className="text-gray-600">{session.menteeName}</p>
            <span
              className={cn(
                "inline-block mt-1 px-2.5 py-1 text-xs font-medium rounded-full",
                getStatusColor(session.status),
              )}
            >
              {session.status?.replace("_", " ") || "scheduled"}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-xs font-medium text-gray-500 uppercase">Date</p>
            <p className="mt-1 font-semibold text-gray-900">
              {format(sessionDate, "EEEE, MMMM d, yyyy")}
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-xs font-medium text-gray-500 uppercase">Time</p>
            <p className="mt-1 font-semibold text-gray-900">
              {format(sessionDate, "h:mm a")} ({session.duration || 60} min)
            </p>
          </div>
        </div>

        {session.agenda && (
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Agenda</h4>
            <p className="text-gray-600 whitespace-pre-wrap">
              {session.agenda}
            </p>
          </div>
        )}

        {session.meetingLink && (
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-2">
              Meeting Link
            </h4>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={session.meetingLink}
                readOnly
                className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600"
              />
              <Button
                variant="secondary"
                size="sm"
                icon={Copy}
                onClick={() => {
                  navigator.clipboard.writeText(session.meetingLink);
                  toast.success("Link copied!");
                }}
              />
            </div>
          </div>
        )}

        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
          {session.status === "scheduled" && (
            <Button variant="danger" onClick={() => onCancel(session)}>
              Cancel Session
            </Button>
          )}
          {isPast(sessionDate) &&
            session.status !== "completed" &&
            session.status !== "cancelled" && (
              <Button
                variant="success"
                icon={CheckCircle}
                onClick={() => onComplete(session)}
              >
                Mark Complete
              </Button>
            )}
          {session.meetingLink &&
            session.status !== "completed" &&
            session.status !== "cancelled" && (
              <Button icon={Video} onClick={() => onJoin(session)}>
                Join Session
              </Button>
            )}
        </div>
      </div>
    </Modal>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const MentorSessions = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState("list"); // list, calendar
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingSession, setEditingSession] = useState(null);
  const [prefillMenteeId, setPrefillMenteeId] = useState("");
  const [selectedSession, setSelectedSession] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    status: "all",
    search: "",
    dateRange: "all",
  });
  const [activeTab, setActiveTab] = useState("upcoming"); // upcoming, past, cancelled, all

  const mentorId = user?.uid;
  const { sessions, loading, error } = useSessions(mentorId, filters);
  const { mentees, loading: menteesLoading, error: menteesError } = useMentees(mentorId);
  const requestedMenteeId = searchParams.get("mentee");

  useEffect(() => {
    if (!requestedMenteeId || menteesLoading) return;
    if (mentees.some((mentee) => mentee.id === requestedMenteeId)) {
      setPrefillMenteeId(requestedMenteeId);
      setEditingSession(null);
      setIsFormModalOpen(true);
    } else {
      toast.error("This student is not an active mentee on your account.");
    }
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete("mentee");
    setSearchParams(nextParams, { replace: true });
  }, [requestedMenteeId, menteesLoading, mentees, searchParams, setSearchParams]);

  // Filter sessions based on active tab
  const filteredSessions = useMemo(() => {
    let filtered = [...sessions];

    // Tab filter
    if (activeTab === "upcoming") {
      filtered = filtered.filter(
        (s) =>
          isFuture(new Date(s.scheduledAt)) &&
          s.status !== "cancelled" &&
          s.status !== "completed",
      );
    } else if (activeTab === "past") {
      filtered = filtered.filter(
        (s) => isPast(new Date(s.scheduledAt)) || s.status === "completed",
      );
    } else if (activeTab === "cancelled") {
      filtered = filtered.filter((s) => s.status === "cancelled");
    }

    // Search filter
    if (filters.search) {
      const term = filters.search.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.title?.toLowerCase().includes(term) ||
          s.menteeName?.toLowerCase().includes(term) ||
          s.agenda?.toLowerCase().includes(term),
      );
    }

    // Status filter
    if (filters.status !== "all") {
      filtered = filtered.filter((s) => s.status === filters.status);
    }

    return filtered;
  }, [sessions, activeTab, filters]);

  // Statistics
  const stats = useMemo(() => {
    const now = new Date();
    const thisMonth = sessions.filter((s) => {
      const d = new Date(s.scheduledAt);
      return (
        d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
      );
    });

    return {
      total: sessions.length,
      upcoming: sessions.filter(
        (s) => isFuture(new Date(s.scheduledAt)) && s.status !== "cancelled",
      ).length,
      completed: sessions.filter((s) => s.status === "completed").length,
      cancelled: sessions.filter((s) => s.status === "cancelled").length,
      thisMonth: thisMonth.length,
      completionRate:
        sessions.length > 0
          ? Math.round(
              (sessions.filter((s) => s.status === "completed").length /
                sessions.length) *
                100,
            )
          : 0,
    };
  }, [sessions]);

  const handleSaveSession = useCallback(
    async (data) => {
      if (!mentorId) return;

      try {
        if (editingSession) {
          await updateDoc(doc(db, "mentorSessions", editingSession.id), {
            ...data,
            updatedAt: serverTimestamp(),
          });

          // Sync to Supabase
          try {
            await supabase
              .from("mentor_sessions")
              .update({
                title: data.title,
                agenda: data.agenda,
                scheduled_at: data.scheduledAt.toDate().toISOString(),
                duration: data.duration,
                meeting_platform: data.meetingPlatform,
                meeting_link: data.meetingLink,
                updated_at: new Date().toISOString(),
              })
              .eq("firebase_id", editingSession.id);
          } catch (supabaseError) {
            console.warn("Supabase sync failed:", supabaseError);
          }
        } else {
          const docRef = await addDoc(collection(db, "mentorSessions"), {
            ...data,
            mentorId,
            status: "scheduled",
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });

          // Create notification for mentee
          await addDoc(collection(db, "notifications"), {
            userId: data.menteeId,
            type: "session_scheduled",
            title: "New Session Scheduled",
            message: `A new session "${data.title}" has been scheduled`,
            sessionId: docRef.id,
            read: false,
            createdAt: serverTimestamp(),
          });

          // Sync to Supabase
          try {
            await supabase.from("mentor_sessions").insert({
              firebase_id: docRef.id,
              mentor_id: mentorId,
              mentee_id: data.menteeId,
              title: data.title,
              agenda: data.agenda,
              scheduled_at: data.scheduledAt.toDate().toISOString(),
              duration: data.duration,
              meeting_platform: data.meetingPlatform,
              meeting_link: data.meetingLink,
              status: "scheduled",
              created_at: new Date().toISOString(),
            });
          } catch (supabaseError) {
            console.warn("Supabase sync failed:", supabaseError);
          }
        }

        setIsFormModalOpen(false);
        setEditingSession(null);
        setPrefillMenteeId("");
      } catch (error) {
        console.error("Error saving session:", error);
        throw error;
      }
    },
    [mentorId, editingSession],
  );

  const handleJoinSession = useCallback(async (session) => {
    if (session.meetingLink) {
      window.open(session.meetingLink, "_blank");
      // Update session status to in_progress
      try {
        await updateDoc(doc(db, "mentorSessions", session.id), {
          status: "in_progress",
          startedAt: serverTimestamp(),
        });
      } catch (err) {
        console.warn("Could not update session status:", err);
      }
    } else {
      toast.error("No meeting link available");
    }
  }, []);

  const handleCompleteSession = useCallback(
    async (session) => {
      if (!window.confirm("Mark this session as completed?")) return;

      try {
        await updateDoc(doc(db, "mentorSessions", session.id), {
          status: "completed",
          completedAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });

        // Update mentee's session count
        const mentorshipQuery = query(
          collection(db, "mentorships"),
          where("mentorId", "==", mentorId),
        );
        const mentorshipDocs = await getDocs(mentorshipQuery);
        const mentorship = mentorshipDocs.docs.find(
          (mentorshipDoc) => mentorshipDoc.data().menteeId === session.menteeId,
        );
        if (mentorship) {
          await updateDoc(mentorship.ref, {
            completedSessions: increment(1),
            updatedAt: serverTimestamp(),
          });
        }

        // Create notification for mentee
        await addDoc(collection(db, "notifications"), {
          userId: session.menteeId,
          type: "session_completed",
          title: "Session Completed",
          message: `Your session "${session.title}" has been marked as completed`,
          sessionId: session.id,
          read: false,
          createdAt: serverTimestamp(),
        });

        // Sync to Supabase
        try {
          await supabase
            .from("mentor_sessions")
            .update({
              status: "completed",
              completed_at: new Date().toISOString(),
            })
            .eq("firebase_id", session.id);
        } catch (supabaseError) {
          console.warn("Supabase sync failed:", supabaseError);
        }

        toast.success("Session marked as completed");
        setIsDetailModalOpen(false);
      } catch (error) {
        console.error("Error completing session:", error);
        toast.error("Failed to complete session");
      }
    },
    [mentorId],
  );

  const handleCancelSession = useCallback(async (session) => {
    const reason = window.prompt("Reason for cancellation (optional):");
    if (reason === null) return; // User clicked cancel

    try {
      await updateDoc(doc(db, "mentorSessions", session.id), {
        status: "cancelled",
        cancelReason: reason || "Cancelled by mentor",
        cancelledAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // Notify mentee
      await addDoc(collection(db, "notifications"), {
        userId: session.menteeId,
        type: "session_cancelled",
        title: "Session Cancelled",
        message: `Your session "${session.title}" has been cancelled${reason ? `: ${reason}` : ""}`,
        sessionId: session.id,
        read: false,
        createdAt: serverTimestamp(),
      });

      try {
        await supabase
          .from("mentor_sessions")
          .update({
            status: "cancelled",
            cancel_reason: reason,
            cancelled_at: new Date().toISOString(),
          })
          .eq("firebase_id", session.id);
      } catch (supabaseError) {
        console.warn("Supabase sync failed:", supabaseError);
      }

      toast.success("Session cancelled");
      setIsDetailModalOpen(false);
    } catch (error) {
      console.error("Error cancelling session:", error);
      toast.error("Failed to cancel session");
    }
  }, []);

  const handleDeleteSession = useCallback(async (session) => {
    if (
      !window.confirm(
        "Are you sure you want to permanently delete this session?",
      )
    )
      return;

    try {
      await deleteDoc(doc(db, "mentorSessions", session.id));

      try {
        await supabase
          .from("mentor_sessions")
          .delete()
          .eq("firebase_id", session.id);
      } catch (supabaseError) {
        console.warn("Supabase delete failed:", supabaseError);
      }

      toast.success("Session deleted");
    } catch (error) {
      console.error("Error deleting session:", error);
      toast.error("Failed to delete session");
    }
  }, []);

  const handleSessionClick = useCallback((session) => {
    setSelectedSession(session);
    setIsDetailModalOpen(true);
  }, []);

  if (authLoading || loading) return <LoadingSpinner />;
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center max-w-md mx-auto p-8">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto" />
          <h2 className="mt-4 text-xl font-bold text-gray-900">
            Error loading sessions
          </h2>
          <p className="mt-2 text-gray-600">{error}</p>
        </div>
      </div>
    );
  }
  if (!user) {
    navigate("/login");
    return null;
  }

  const tabs = [
    { id: "upcoming", label: "Upcoming", count: stats.upcoming },
    { id: "past", label: "Past", count: stats.completed },
    { id: "cancelled", label: "Cancelled", count: stats.cancelled },
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
              <h1 className="text-lg font-semibold text-gray-900">Sessions</h1>
            </div>
            <div className="flex items-center space-x-3">
              <div className="hidden md:flex items-center bg-gray-100 rounded-lg p-1">
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
                <button
                  onClick={() => setViewMode("calendar")}
                  className={cn(
                    "px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
                    viewMode === "calendar"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-600",
                  )}
                >
                  Calendar
                </button>
              </div>
              <Button
                icon={Plus}
                onClick={() => {
                  setEditingSession(null);
                  setIsFormModalOpen(true);
                }}
              >
                Schedule Session
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {menteesError && (
          <p
            role="alert"
            className="mb-5 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200"
          >
            {menteesError}
          </p>
        )}
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Upcoming</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">
                  {stats.upcoming}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </Card>
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Completed</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">
                  {stats.completed}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </Card>
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">This Month</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">
                  {stats.thisMonth}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </Card>
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Completion Rate
                </p>
                <p className="mt-1 text-2xl font-bold text-gray-900">
                  {stats.completionRate}%
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Filters & Tabs */}
        <Card className="p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Tabs */}
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

            {/* Search & Filter */}
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search sessions..."
                  value={filters.search}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, search: e.target.value }))
                  }
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm w-64"
                />
              </div>
              <select
                value={filters.status}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, status: e.target.value }))
                }
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              >
                <option value="all">All Status</option>
                <option value="scheduled">Scheduled</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Content */}
        {viewMode === "calendar" ? (
          <SessionCalendar
            sessions={sessions}
            currentDate={currentDate}
            onDateChange={setCurrentDate}
            onSessionClick={handleSessionClick}
          />
        ) : (
          <>
            {filteredSessions.length === 0 ? (
              <Card className="p-12">
                <EmptyState
                  icon={Calendar}
                  title={
                    filters.search
                      ? "No sessions found"
                      : `No ${activeTab} sessions`
                  }
                  description={
                    filters.search
                      ? "Try a different search term"
                      : activeTab === "upcoming"
                        ? "Schedule your first session to get started"
                        : "Sessions will appear here"
                  }
                  action={
                    activeTab === "upcoming" && (
                      <Button
                        icon={Plus}
                        onClick={() => {
                          setEditingSession(null);
                          setIsFormModalOpen(true);
                        }}
                      >
                        Schedule Session
                      </Button>
                    )
                  }
                />
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredSessions.map((session) => (
                  <SessionCard
                    key={session.id}
                    session={session}
                    onJoin={handleJoinSession}
                    onEdit={(s) => {
                      setEditingSession(s);
                      setIsFormModalOpen(true);
                    }}
                    onCancel={handleCancelSession}
                    onComplete={handleCompleteSession}
                    onDelete={handleDeleteSession}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {/* Form Modal */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingSession(null);
          setPrefillMenteeId("");
        }}
        title={editingSession ? "Edit Session" : "Schedule New Session"}
        size="lg"
      >
        <SessionForm
          session={editingSession}
          mentees={mentees}
          initialMenteeId={prefillMenteeId}
          onSave={handleSaveSession}
          onCancel={() => {
            setIsFormModalOpen(false);
            setEditingSession(null);
            setPrefillMenteeId("");
          }}
        />
      </Modal>

      {/* Detail Modal */}
      <SessionDetailModal
        session={selectedSession}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedSession(null);
        }}
        onJoin={handleJoinSession}
        onComplete={handleCompleteSession}
        onCancel={handleCancelSession}
      />
    </div>
  );
};

export default MentorSessions;
