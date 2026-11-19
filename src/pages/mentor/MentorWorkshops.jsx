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
  Presentation,
  Users,
  Calendar,
  Clock,
  Video,
  MapPin,
  Plus,
  Edit3,
  Trash2,
  Eye,
  MoreVertical,
  Search,
  Filter,
  X,
  Check,
  Copy,
  Link as LinkIcon,
  Share2,
  ExternalLink,
  Star,
  Bookmark,
  DollarSign,
  CreditCard,
  Wallet,
  Ticket,
  Tag,
  Hash,
  AtSign,
  TrendingUp,
  BarChart3,
  PieChart,
  Activity,
  Target,
  Award,
  Trophy,
  Crown,
  Medal,
  Flame,
  Zap,
  Sparkles,
  Rocket,
  Lightbulb,
  GraduationCap,
  BookOpen,
  Briefcase,
  Building2,
  Handshake,
  Globe,
  Lock,
  Unlock,
  Shield,
  UserCheck,
  UserPlus,
  UserX,
  UserMinus,
  MessageSquare,
  Mail,
  Phone,
  Bell,
  BellRing,
  Settings,
  Loader2,
  AlertCircle,
  Info,
  HelpCircle,
  CheckCircle,
  XCircle,
  Ban,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  ArrowUpRight,
  ArrowDownRight,
  ArrowRight,
  ArrowLeft,
  Home,
  Menu,
  LogOut,
  Download,
  Upload,
  FileText,
  FileSpreadsheet,
  FileVideo,
  FileAudio,
  Image as ImageIcon,
  Camera,
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
  Monitor as Desktop,
  Play,
  Pause,
  Square,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Copy as CopyIcon,
  Scissors,
  Clipboard,
  Move,
  RotateCcw,
  RefreshCw,
  Sun,
  Moon,
  Cloud,
  Wind,
  Droplets,
  Thermometer,
  Eye as EyeIcon,
  EyeOff,
  Key,
  Fingerprint,
  QrCode,
  Scan,
  Percent,
  Calculator,
  Scale,
  Ruler,
  Timer,
  Hourglass,
  History,
  Repeat,
  Route,
  Compass,
  Map,
  Navigation,
  Anchor,
  Flag,
  Crosshair,
  Grid,
  List,
  LayoutGrid,
  Puzzle,
  Component,
  Layout,
  GitBranch,
  Network,
  Workflow,
  Boxes,
  Package,
  Box,
  Archive,
  Folder,
  FolderOpen,
  FilePlus,
  FileMinus,
  Inbox,
  Send,
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
  Funnel,
  FunnelChart,
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import {
  format,
  formatDistanceToNow,
  differenceInDays,
  differenceInHours,
  isToday,
  isPast,
  isFuture,
  startOfDay,
  addHours,
  subDays,
} from "date-fns";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// ============================================================================
// UTILITY
// ============================================================================

const cn = (...inputs) => twMerge(clsx(inputs));

const formatCurrency = (amount, currency = "LSL") =>
  `${currency} ${Number(amount || 0).toLocaleString("en-LS", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;

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
  const i = name?.split("").reduce((a, c) => a + c.charCodeAt(0), 0) || 0;
  return colors[i % colors.length];
};

const getStatusColor = (status) =>
  ({
    draft: "bg-gray-100 text-gray-800",
    published: "bg-green-100 text-green-800",
    live: "bg-red-100 text-red-800",
    completed: "bg-blue-100 text-blue-800",
    cancelled: "bg-red-100 text-red-800",
  })[status] || "bg-gray-100 text-gray-800";

const CATEGORIES = [
  "Career Development",
  "Technical Skills",
  "Leadership",
  "Entrepreneurship",
  "Interview Prep",
  "Resume & CV",
  "Networking",
  "Personal Growth",
  "Finance",
  "Productivity",
  "Communication",
  "Other",
];

// ============================================================================
// COMPONENTS
// ============================================================================

const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-50">
    <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
  </div>
);

const Avatar = ({ src, name, size = "md" }) => {
  const sizes = {
    xs: "w-6 h-6 text-xs",
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base",
    xl: "w-16 h-16 text-lg",
  };
  return (
    <div className="relative inline-block flex-shrink-0">
      {src ? (
        <img
          src={src}
          alt={name}
          className={cn("rounded-full object-cover", sizes[size])}
          onError={(e) => {
            e.target.style.display = "none";
            e.target.nextSibling.style.display = "flex";
          }}
        />
      ) : null}
      <div
        className={cn(
          "rounded-full flex items-center justify-center font-semibold text-white",
          sizes[size],
          !src ? getAvatarColor(name) : "hidden",
        )}
      >
        {getInitials(name)}
      </div>
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

// ============================================================================
// WORKSHOP CARD
// ============================================================================

const WorkshopCard = ({
  workshop,
  onView,
  onEdit,
  onDelete,
  onPublish,
  onCancel,
  attendees,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const h = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target))
        setShowMenu(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const startAt = new Date(workshop.startAt);
  const isLive = workshop.status === "live";
  const isUpcoming = isFuture(startAt) && workshop.status === "published";
  const filledSpots = attendees?.length || workshop.enrolled || 0;
  const capacity = workshop.capacity || 0;
  const fillPercent = capacity > 0 ? (filledSpots / capacity) * 100 : 0;

  return (
    <Card className="p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1 min-w-0">
          <div
            className={cn(
              "w-14 h-14 rounded-lg flex items-center justify-center flex-shrink-0",
              workshop.status === "live"
                ? "bg-red-100"
                : workshop.status === "completed"
                  ? "bg-blue-100"
                  : workshop.status === "draft"
                    ? "bg-gray-100"
                    : "bg-indigo-100",
            )}
          >
            {isLive ? (
              <Radio className="w-7 h-7 text-red-600 animate-pulse" />
            ) : workshop.status === "completed" ? (
              <CheckCircle className="w-7 h-7 text-blue-600" />
            ) : workshop.status === "draft" ? (
              <Edit3 className="w-7 h-7 text-gray-600" />
            ) : (
              <Presentation className="w-7 h-7 text-indigo-600" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 flex-wrap">
              <h3 className="font-semibold text-gray-900 truncate">
                {workshop.title}
              </h3>
              <span
                className={cn(
                  "px-2 py-0.5 text-xs font-medium rounded-full",
                  getStatusColor(workshop.status),
                )}
              >
                {workshop.status}
              </span>
              {workshop.price > 0 && (
                <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-800">
                  {formatCurrency(workshop.price)}
                </span>
              )}
              {!workshop.price && (
                <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-teal-100 text-teal-800">
                  Free
                </span>
              )}
            </div>
            {workshop.description && (
              <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                {workshop.description}
              </p>
            )}
            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-500">
              <span className="flex items-center">
                <Calendar className="w-3.5 h-3.5 mr-1" />
                {format(startAt, "MMM d, yyyy")}
              </span>
              <span className="flex items-center">
                <Clock className="w-3.5 h-3.5 mr-1" />
                {format(startAt, "h:mm a")}
              </span>
              <span className="flex items-center">
                <Timer className="w-3.5 h-3.5 mr-1" />
                {workshop.duration || 60} min
              </span>
              {workshop.category && (
                <span className="flex items-center">
                  <Tag className="w-3.5 h-3.5 mr-1" />
                  {workshop.category}
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
                    onView(workshop);
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <Eye className="w-4 h-4 mr-2" /> View Details
                </button>
                <button
                  onClick={() => {
                    onEdit(workshop);
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <Edit3 className="w-4 h-4 mr-2" /> Edit
                </button>
                {workshop.status === "draft" && (
                  <button
                    onClick={() => {
                      onPublish(workshop);
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center px-4 py-2 text-sm text-green-600 hover:bg-green-50"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" /> Publish
                  </button>
                )}
                {isUpcoming && (
                  <button
                    onClick={() => {
                      onCancel(workshop);
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center px-4 py-2 text-sm text-orange-600 hover:bg-orange-50"
                  >
                    <XCircle className="w-4 h-4 mr-2" /> Cancel Workshop
                  </button>
                )}
                <button
                  onClick={() => {
                    onDelete(workshop);
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4 mr-2" /> Delete
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Enrollment bar */}
      <div className="mt-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-medium text-gray-600">Enrollment</span>
          <span className="text-xs font-semibold text-gray-900">
            {filledSpots}/{capacity || "∞"} spots
          </span>
        </div>
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(fillPercent, 100)}%` }}
            transition={{ duration: 0.5 }}
            className="h-full bg-indigo-600 rounded-full"
          />
        </div>
      </div>

      {/* Action buttons */}
      <div className="mt-4 pt-4 border-t border-gray-100 flex items-center space-x-2">
        {isLive && workshop.meetingLink && (
          <Button
            size="sm"
            icon={Video}
            onClick={() => window.open(workshop.meetingLink, "_blank")}
            className="flex-1"
          >
            Join Workshop
          </Button>
        )}
        {isUpcoming && (
          <>
            <Button
              size="sm"
              variant="secondary"
              icon={Users}
              onClick={() => onView(workshop)}
              className="flex-1"
            >
              Attendees ({filledSpots})
            </Button>
            <Button
              size="sm"
              variant="outline"
              icon={Share2}
              onClick={() => {
                navigator.clipboard.writeText(
                  `${window.location.origin}/workshops/${workshop.id}`,
                );
                toast.success("Link copied!");
              }}
            />
          </>
        )}
        {workshop.status === "draft" && (
          <Button
            size="sm"
            icon={CheckCircle}
            onClick={() => onPublish(workshop)}
            className="flex-1"
          >
            Publish Workshop
          </Button>
        )}
        {workshop.status === "completed" && (
          <Button
            size="sm"
            variant="secondary"
            icon={Eye}
            onClick={() => onView(workshop)}
            className="flex-1"
          >
            View Recording
          </Button>
        )}
      </div>
    </Card>
  );
};

// ============================================================================
// WORKSHOP FORM
// ============================================================================

const WorkshopForm = ({ workshop, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    title: workshop?.title || "",
    description: workshop?.description || "",
    category: workshop?.category || "Career Development",
    startAt: workshop?.startAt
      ? format(new Date(workshop.startAt), "yyyy-MM-dd'T'HH:mm")
      : format(addHours(new Date(), 48), "yyyy-MM-dd'T'HH:mm"),
    duration: workshop?.duration || 60,
    capacity: workshop?.capacity || 20,
    price: workshop?.price || 0,
    currency: workshop?.currency || "LSL",
    meetingPlatform: workshop?.meetingPlatform || "zoom",
    meetingLink: workshop?.meetingLink || "",
    coverImage: workshop?.coverImage || "",
    tags: workshop?.tags || [],
    recordingEnabled: workshop?.recordingEnabled !== false,
    certificateEnabled: workshop?.certificateEnabled || false,
  });
  const [tagInput, setTagInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const coverInputRef = useRef(null);

  const handleImageUpload = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Select an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    try {
      const { uploadToStorage, uploadToCloudinary } =
        await import("../../services/storageService");
      const path = `mentor-workshops/covers/${Date.now()}_${file.name}`;
      const firebaseUrl = await uploadToStorage(file, path, (p) =>
        setUploadProgress(Math.round(p * 100)),
      );
      let finalUrl = firebaseUrl;
      try {
        const cRes = await uploadToCloudinary(file, "mentor-workshops/covers");
        if (cRes?.secure_url) finalUrl = cRes.secure_url;
      } catch (ce) {
        console.warn("Cloudinary fallback:", ce);
      }
      setFormData((p) => ({ ...p, coverImage: finalUrl }));
      toast.success("Cover image uploaded");
    } catch (err) {
      console.error(err);
      toast.error("Upload failed");
    } finally {
      setUploading(false);
      setUploadProgress(0);
      if (coverInputRef.current) coverInputRef.current.value = "";
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error("Title is required");
      return;
    }
    if (!formData.startAt) {
      toast.error("Start time required");
      return;
    }
    setSaving(true);
    try {
      await onSave(formData);
    } catch (err) {
      console.error(err);
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData((p) => ({ ...p, tags: [...p.tags, tagInput.trim()] }));
      setTagInput("");
    }
  };

  const platforms = [
    { value: "zoom", label: "Zoom" },
    { value: "google_meet", label: "Google Meet" },
    { value: "teams", label: "MS Teams" },
    { value: "custom", label: "Custom Link" },
    { value: "in_person", label: "In Person" },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Cover */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Cover Image
        </label>
        <div
          onClick={() => coverInputRef.current?.click()}
          className={cn(
            "relative border-2 border-dashed rounded-lg cursor-pointer transition-colors overflow-hidden",
            formData.coverImage
              ? "border-transparent"
              : "border-gray-300 hover:border-indigo-400",
          )}
          style={{ aspectRatio: "16/6" }}
        >
          <input
            ref={coverInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
          {formData.coverImage ? (
            <>
              <img
                src={formData.coverImage}
                alt="Cover"
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setFormData((p) => ({ ...p, coverImage: "" }));
                }}
                className="absolute top-2 right-2 p-1.5 bg-black bg-opacity-50 rounded-lg text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full">
              {uploading ? (
                <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
              ) : (
                <>
                  <ImageIcon className="w-8 h-8 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-600">
                    Click to upload cover
                  </p>
                </>
              )}
              {uploading && uploadProgress > 0 && (
                <p className="mt-2 text-xs text-indigo-600">
                  {uploadProgress}%
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Title *
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) =>
            setFormData((p) => ({ ...p, title: e.target.value }))
          }
          placeholder="e.g., Mastering Technical Interviews"
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) =>
            setFormData((p) => ({ ...p, description: e.target.value }))
          }
          rows={3}
          placeholder="What will attendees learn?"
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <select
            value={formData.category}
            onChange={(e) =>
              setFormData((p) => ({ ...p, category: e.target.value }))
            }
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Duration (minutes)
          </label>
          <select
            value={formData.duration}
            onChange={(e) =>
              setFormData((p) => ({ ...p, duration: parseInt(e.target.value) }))
            }
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value={30}>30 minutes</option>
            <option value={45}>45 minutes</option>
            <option value={60}>1 hour</option>
            <option value={90}>1.5 hours</option>
            <option value={120}>2 hours</option>
            <option value={180}>3 hours</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Start Date & Time *
          </label>
          <input
            type="datetime-local"
            value={formData.startAt}
            onChange={(e) =>
              setFormData((p) => ({ ...p, startAt: e.target.value }))
            }
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Capacity
          </label>
          <input
            type="number"
            min={1}
            max={1000}
            value={formData.capacity}
            onChange={(e) =>
              setFormData((p) => ({
                ...p,
                capacity: parseInt(e.target.value) || 1,
              }))
            }
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Price
          </label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="number"
              min={0}
              step="0.01"
              value={formData.price}
              onChange={(e) =>
                setFormData((p) => ({
                  ...p,
                  price: parseFloat(e.target.value) || 0,
                }))
              }
              placeholder="0 for free"
              className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Currency
          </label>
          <select
            value={formData.currency}
            onChange={(e) =>
              setFormData((p) => ({ ...p, currency: e.target.value }))
            }
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="LSL">LSL</option>
            <option value="EUR">EUR</option>
            <option value="GBP">GBP</option>
            <option value="INR">INR</option>
            <option value="AUD">AUD</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Platform
        </label>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
          {platforms.map((p) => (
            <button
              key={p.value}
              type="button"
              onClick={() =>
                setFormData((prev) => ({ ...prev, meetingPlatform: p.value }))
              }
              className={cn(
                "p-2.5 rounded-lg border-2 text-xs font-medium transition-all",
                formData.meetingPlatform === p.value
                  ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                  : "border-gray-200 text-gray-600 hover:border-gray-300",
              )}
            >
              {p.label}
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
              setFormData((p) => ({ ...p, meetingLink: e.target.value }))
            }
            placeholder="https://..."
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Tags
        </label>
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyPress={(e) =>
              e.key === "Enter" && (e.preventDefault(), addTag())
            }
            placeholder="Add a tag"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
          <Button type="button" variant="secondary" onClick={addTag}>
            Add
          </Button>
        </div>
        {formData.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {formData.tags.map((t) => (
              <span
                key={t}
                className="inline-flex items-center px-3 py-1 bg-indigo-100 text-indigo-800 text-sm rounded-full"
              >
                {t}
                <button
                  type="button"
                  onClick={() =>
                    setFormData((p) => ({
                      ...p,
                      tags: p.tags.filter((x) => x !== t),
                    }))
                  }
                  className="ml-2 text-indigo-600 hover:text-indigo-800"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center space-x-6">
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.recordingEnabled}
            onChange={(e) =>
              setFormData((p) => ({ ...p, recordingEnabled: e.target.checked }))
            }
            className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
          />
          <span className="text-sm text-gray-700">Enable recording</span>
        </label>
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.certificateEnabled}
            onChange={(e) =>
              setFormData((p) => ({
                ...p,
                certificateEnabled: e.target.checked,
              }))
            }
            className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
          />
          <span className="text-sm text-gray-700">Issue certificates</span>
        </label>
      </div>

      <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" loading={saving}>
          {workshop ? "Update Workshop" : "Create Workshop"}
        </Button>
      </div>
    </form>
  );
};

// ============================================================================
// WORKSHOP DETAIL MODAL
// ============================================================================

const WorkshopDetailModal = ({ workshop, attendees, isOpen, onClose }) => {
  const [tab, setTab] = useState("overview");
  if (!workshop) return null;

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "attendees", label: `Attendees (${attendees.length})` },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={workshop.title} size="xl">
      {workshop.coverImage && (
        <img
          src={workshop.coverImage}
          alt={workshop.title}
          className="w-full h-48 object-cover rounded-lg mb-4"
        />
      )}

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <span
          className={cn(
            "px-2.5 py-1 text-xs font-medium rounded-full",
            getStatusColor(workshop.status),
          )}
        >
          {workshop.status}
        </span>
        {workshop.category && (
          <Badge variant="primary" size="sm">
            {workshop.category}
          </Badge>
        )}
        {workshop.price > 0 ? (
          <Badge variant="success" size="sm">
            {formatCurrency(workshop.price, workshop.currency)}
          </Badge>
        ) : (
          <Badge variant="info" size="sm">
            Free
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-blue-50 rounded-lg p-3 text-center">
          <p className="text-xs text-blue-600">Date</p>
          <p className="text-sm font-bold text-blue-800 mt-0.5">
            {format(new Date(workshop.startAt), "MMM d")}
          </p>
        </div>
        <div className="bg-purple-50 rounded-lg p-3 text-center">
          <p className="text-xs text-purple-600">Time</p>
          <p className="text-sm font-bold text-purple-800 mt-0.5">
            {format(new Date(workshop.startAt), "h:mm a")}
          </p>
        </div>
        <div className="bg-green-50 rounded-lg p-3 text-center">
          <p className="text-xs text-green-600">Duration</p>
          <p className="text-sm font-bold text-green-800 mt-0.5">
            {workshop.duration} min
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-4">
        <nav className="flex space-x-6">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "py-3 border-b-2 text-sm font-medium transition-colors",
                tab === t.id
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700",
              )}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </div>

      {tab === "overview" && (
        <div className="space-y-4">
          {workshop.description && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">
                Description
              </h4>
              <p className="text-sm text-gray-600 whitespace-pre-wrap">
                {workshop.description}
              </p>
            </div>
          )}
          {workshop.meetingLink && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">
                Meeting Link
              </h4>
              <div className="flex items-center space-x-2">
                <input
                  readOnly
                  value={workshop.meetingLink}
                  className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                />
                <Button
                  variant="secondary"
                  size="sm"
                  icon={Copy}
                  onClick={() => {
                    navigator.clipboard.writeText(workshop.meetingLink);
                    toast.success("Copied");
                  }}
                />
              </div>
            </div>
          )}
          {workshop.tags?.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Tags</h4>
              <div className="flex flex-wrap gap-2">
                {workshop.tags.map((t, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {tab === "attendees" && (
        <div className="space-y-2">
          {attendees.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-300 mx-auto" />
              <p className="mt-2 text-sm text-gray-500">No attendees yet</p>
            </div>
          ) : (
            attendees.map((a) => (
              <div
                key={a.id}
                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50"
              >
                <Avatar src={a.avatar} name={a.name} size="md" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-sm truncate">
                    {a.name}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{a.email}</p>
                </div>
                <Badge variant={a.attended ? "success" : "warning"} size="sm">
                  {a.attended ? "Attended" : "Registered"}
                </Badge>
              </div>
            ))
          )}
        </div>
      )}
    </Modal>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const MentorWorkshops = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [workshops, setWorkshops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("upcoming");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingWorkshop, setEditingWorkshop] = useState(null);
  const [detailWorkshop, setDetailWorkshop] = useState(null);
  const [detailAttendees, setDetailAttendees] = useState([]);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const mentorId = user?.uid;

  useEffect(() => {
    if (!mentorId) return;
    const q = query(
      collection(db, "mentorWorkshops"),
      where("mentorId", "==", mentorId),
      orderBy("startAt", "desc"),
    );
    const unsub = onSnapshot(
      q,
      (snap) => {
        setWorkshops(
          snap.docs.map((d) => ({
            id: d.id,
            ...d.data(),
            startAt: d.data().startAt?.toDate?.() || new Date(d.data().startAt),
          })),
        );
        setLoading(false);
      },
      (err) => {
        console.error(err);
        setLoading(false);
      },
    );
    return () => unsub();
  }, [mentorId]);

  const stats = useMemo(
    () => ({
      total: workshops.length,
      upcoming: workshops.filter(
        (w) => w.status === "published" && isFuture(new Date(w.startAt)),
      ).length,
      live: workshops.filter((w) => w.status === "live").length,
      completed: workshops.filter((w) => w.status === "completed").length,
      drafts: workshops.filter((w) => w.status === "draft").length,
      totalAttendees: workshops.reduce((sum, w) => sum + (w.enrolled || 0), 0),
      totalRevenue: workshops.reduce(
        (sum, w) => sum + (w.price || 0) * (w.enrolled || 0),
        0,
      ),
    }),
    [workshops],
  );

  const filtered = useMemo(() => {
    let r = [...workshops];
    if (activeTab === "upcoming")
      r = r.filter(
        (w) =>
          isFuture(new Date(w.startAt)) &&
          w.status !== "draft" &&
          w.status !== "completed",
      );
    else if (activeTab === "drafts") r = r.filter((w) => w.status === "draft");
    else if (activeTab === "completed")
      r = r.filter((w) => w.status === "completed");
    else if (activeTab === "live") r = r.filter((w) => w.status === "live");

    if (statusFilter !== "all") r = r.filter((w) => w.status === statusFilter);
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      r = r.filter(
        (w) =>
          w.title?.toLowerCase().includes(term) ||
          w.description?.toLowerCase().includes(term),
      );
    }
    return r;
  }, [workshops, activeTab, statusFilter, searchTerm]);

  // Load attendees when detail opens
  useEffect(() => {
    if (!detailWorkshop) {
      setDetailAttendees([]);
      return;
    }
    const q = query(
      collection(db, "workshopAttendees"),
      where("workshopId", "==", detailWorkshop.id),
    );
    const unsub = onSnapshot(q, (snap) => {
      setDetailAttendees(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [detailWorkshop]);

  const handleSave = useCallback(
    async (data) => {
      if (!mentorId) return;
      try {
        const payload = {
          ...data,
          startAt: Timestamp.fromDate(new Date(data.startAt)),
          mentorId,
          updatedAt: serverTimestamp(),
        };
        if (editingWorkshop) {
          await updateDoc(
            doc(db, "mentorWorkshops", editingWorkshop.id),
            payload,
          );
          try {
            await supabase
              .from("mentor_workshops")
              .update({
                title: data.title,
                updated_at: new Date().toISOString(),
              })
              .eq("firebase_id", editingWorkshop.id);
          } catch (e) {
            console.warn("supabase sync", e);
          }
          toast.success("Workshop updated!");
        } else {
          payload.createdAt = serverTimestamp();
          payload.status = "draft";
          payload.enrolled = 0;
          const ref = await addDoc(collection(db, "mentorWorkshops"), payload);
          try {
            await supabase.from("mentor_workshops").insert({
              firebase_id: ref.id,
              mentor_id: mentorId,
              title: data.title,
              description: data.description,
              category: data.category,
              start_at: new Date(data.startAt).toISOString(),
              duration: data.duration,
              capacity: data.capacity,
              price: data.price,
              status: "draft",
              created_at: new Date().toISOString(),
            });
          } catch (e) {
            console.warn("supabase sync", e);
          }
          toast.success("Workshop created!");
        }
        setIsFormOpen(false);
        setEditingWorkshop(null);
      } catch (e) {
        console.error(e);
        throw e;
      }
    },
    [mentorId, editingWorkshop],
  );

  const handlePublish = useCallback(
    async (workshop) => {
      if (!window.confirm("Publish this workshop to your mentees?")) return;
      try {
        await updateDoc(doc(db, "mentorWorkshops", workshop.id), {
          status: "published",
          publishedAt: serverTimestamp(),
        });
        try {
          await supabase
            .from("mentor_workshops")
            .update({ status: "published" })
            .eq("firebase_id", workshop.id);
        } catch (e) {}
        await addDoc(collection(db, "notifications"), {
          userId: mentorId,
          type: "workshop_published",
          title: "Workshop Published",
          message: `"${workshop.title}" is now live for registrations`,
          read: false,
          createdAt: serverTimestamp(),
        });
        toast.success("Workshop published!");
      } catch (e) {
        toast.error("Failed to publish");
      }
    },
    [mentorId],
  );

  const handleCancelWorkshop = useCallback(async (workshop) => {
    const reason = window.prompt("Reason for cancellation:");
    if (reason === null) return;
    try {
      await updateDoc(doc(db, "mentorWorkshops", workshop.id), {
        status: "cancelled",
        cancelReason: reason,
        cancelledAt: serverTimestamp(),
      });
      const attendeesQuery = query(
        collection(db, "workshopAttendees"),
        where("workshopId", "==", workshop.id),
      );
      const attendeeSnap = await getDocs(attendeesQuery);
      const batch = writeBatch(db);
      attendeeSnap.forEach((a) => {
        const aRef = doc(collection(db, "notifications"));
        batch.set(aRef, {
          userId: a.data().userId,
          type: "workshop_cancelled",
          title: "Workshop Cancelled",
          message: `"${workshop.title}" has been cancelled${reason ? `: ${reason}` : ""}`,
          read: false,
          createdAt: serverTimestamp(),
        });
      });
      await batch.commit();
      toast.success("Workshop cancelled");
    } catch (e) {
      toast.error("Failed to cancel");
    }
  }, []);

  const handleDelete = useCallback(async (workshop) => {
    if (!window.confirm("Delete this workshop permanently?")) return;
    try {
      if (workshop.coverImage?.includes("firebase")) {
        try {
          await deleteObject(ref(storage, workshop.coverImage));
        } catch (e) {}
      }
      await deleteDoc(doc(db, "mentorWorkshops", workshop.id));
      try {
        await supabase
          .from("mentor_workshops")
          .delete()
          .eq("firebase_id", workshop.id);
      } catch (e) {}
      toast.success("Workshop deleted");
    } catch (e) {
      toast.error("Failed to delete");
    }
  }, []);

  const handleView = useCallback((workshop) => {
    setDetailWorkshop(workshop);
    setIsDetailOpen(true);
  }, []);

  if (authLoading || loading) return <LoadingSpinner />;
  if (!user) {
    navigate("/login");
    return null;
  }

  const tabs = [
    { id: "all", label: "All", count: stats.total },
    { id: "upcoming", label: "Upcoming", count: stats.upcoming },
    { id: "live", label: "Live", count: stats.live },
    { id: "drafts", label: "Drafts", count: stats.drafts },
    { id: "completed", label: "Completed", count: stats.completed },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link
                to="/mentor/dashboard"
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </Link>
              <h1 className="text-lg font-semibold text-gray-900">Workshops</h1>
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
              <Button
                icon={Plus}
                onClick={() => {
                  setEditingWorkshop(null);
                  setIsFormOpen(true);
                }}
              >
                Create Workshop
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase">
                  Upcoming
                </p>
                <p className="mt-1 text-2xl font-bold text-gray-900">
                  {stats.upcoming}
                </p>
              </div>
              <div className="w-11 h-11 bg-indigo-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-indigo-600" />
              </div>
            </div>
          </Card>
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase">
                  Attendees
                </p>
                <p className="mt-1 text-2xl font-bold text-gray-900">
                  {stats.totalAttendees}
                </p>
              </div>
              <div className="w-11 h-11 bg-green-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </Card>
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase">
                  Revenue
                </p>
                <p className="mt-1 text-2xl font-bold text-gray-900">
                  {formatCurrency(stats.totalRevenue)}
                </p>
              </div>
              <div className="w-11 h-11 bg-yellow-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-yellow-600" />
              </div>
            </div>
          </Card>
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase">
                  Completed
                </p>
                <p className="mt-1 text-2xl font-bold text-gray-900">
                  {stats.completed}
                </p>
              </div>
              <div className="w-11 h-11 bg-blue-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center space-x-1 overflow-x-auto">
              {tabs.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={cn(
                    "flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap",
                    activeTab === t.id
                      ? "bg-indigo-600 text-white"
                      : "text-gray-600 hover:bg-gray-100",
                  )}
                >
                  <span>{t.label}</span>
                  <span
                    className={cn(
                      "px-1.5 py-0.5 text-xs rounded-full",
                      activeTab === t.id
                        ? "bg-white bg-opacity-20"
                        : "bg-gray-200",
                    )}
                  >
                    {t.count}
                  </span>
                </button>
              ))}
            </div>
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search workshops..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm w-56"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="live">Live</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </Card>

        {filtered.length === 0 ? (
          <Card className="p-12">
            <div className="text-center">
              <Presentation className="w-16 h-16 text-gray-300 mx-auto" />
              <h3 className="mt-4 text-lg font-semibold text-gray-900">
                {searchTerm
                  ? "No matching workshops"
                  : `No ${activeTab} workshops`}
              </h3>
              <p className="mt-2 text-gray-500 max-w-sm mx-auto">
                {searchTerm
                  ? "Try a different search term"
                  : "Create your first workshop to engage multiple mentees at once."}
              </p>
              <Button
                className="mt-6"
                icon={Plus}
                onClick={() => {
                  setEditingWorkshop(null);
                  setIsFormOpen(true);
                }}
              >
                Create Workshop
              </Button>
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
            {filtered.map((w) => (
              <WorkshopCard
                key={w.id}
                workshop={w}
                onView={handleView}
                onEdit={(ws) => {
                  setEditingWorkshop(ws);
                  setIsFormOpen(true);
                }}
                onPublish={handlePublish}
                onCancel={handleCancelWorkshop}
                onDelete={handleDelete}
                attendees={w.id === detailWorkshop?.id ? detailAttendees : null}
              />
            ))}
          </div>
        )}
      </main>

      <Modal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingWorkshop(null);
        }}
        title={editingWorkshop ? "Edit Workshop" : "Create Workshop"}
        size="lg"
      >
        <WorkshopForm
          workshop={editingWorkshop}
          onSave={handleSave}
          onCancel={() => {
            setIsFormOpen(false);
            setEditingWorkshop(null);
          }}
        />
      </Modal>

      <WorkshopDetailModal
        workshop={detailWorkshop}
        attendees={detailAttendees}
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setDetailWorkshop(null);
        }}
      />
    </div>
  );
};

export default MentorWorkshops;
