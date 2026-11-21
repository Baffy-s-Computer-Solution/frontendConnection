// src/pages/mentor/MentorReferrals.jsx
import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  increment,
  arrayUnion,
  arrayRemove,
  writeBatch,
} from "firebase/firestore";
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { db, storage, auth } from "../../config/firebase";
import { supabase } from "../../config/supabase";
import { useAuth } from "../../context/AuthContext";
import { useNotification } from "../../context/NotificationContext";
import {
  Gift,
  Users,
  Copy,
  Share2,
  TrendingUp,
  DollarSign,
  Award,
  Link2,
  Mail,
  MessageCircle,
  Facebook,
  Twitter,
  Linkedin,
  CheckCircle,
  Clock,
  XCircle,
  Search,
  Filter,
  Download,
  Upload,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Edit2,
  Trash2,
  Eye,
  RefreshCw,
  BarChart3,
  PieChart,
  Target,
  Zap,
  Star,
  Crown,
  Medal,
  Trophy,
  UserPlus,
  Send,
  Calendar,
  Phone,
  Building,
  Briefcase,
  Globe,
  Wallet,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  Info,
  AlertCircle,
  CheckCircle2,
  X,
  Plus,
  Minus,
  Settings,
  HelpCircle,
  ExternalLink,
  QrCode,
  Smartphone,
  MousePointer,
  Activity,
  Layers,
  FileText,
  Clock3,
  ThumbsUp,
  Heart,
  Bookmark,
  Flag,
  Loader2,
  Sparkles,
  Rocket,
  Shield,
  Lock,
  Unlock,
  Key,
  Fingerprint,
} from "lucide-react";

const ITEMS_PER_PAGE = 10;
const REFERRAL_STATUS = {
  PENDING: "pending",
  ACTIVE: "active",
  COMPLETED: "completed",
  EXPIRED: "expired",
  CANCELLED: "cancelled",
};
const REWARD_TYPES = {
  CASH: "cash",
  CREDITS: "credits",
  PREMIUM: "premium",
  BADGE: "badge",
  CERTIFICATE: "certificate",
};
const TIER_LEVELS = {
  BRONZE: {
    name: "Bronze",
    min: 0,
    max: 5,
    color: "amber-600",
    icon: Medal,
    multiplier: 1,
  },
  SILVER: {
    name: "Silver",
    min: 6,
    max: 15,
    color: "gray-400",
    icon: Medal,
    multiplier: 1.25,
  },
  GOLD: {
    name: "Gold",
    min: 16,
    max: 30,
    color: "yellow-500",
    icon: Trophy,
    multiplier: 1.5,
  },
  PLATINUM: {
    name: "Platinum",
    min: 31,
    max: 50,
    color: "cyan-400",
    icon: Crown,
    multiplier: 2,
  },
  DIAMOND: {
    name: "Diamond",
    min: 51,
    max: Infinity,
    color: "purple-400",
    icon: Sparkles,
    multiplier: 3,
  },
};

// Utility Functions
const formatCurrency = (amount) =>
  `LSL ${Number(amount || 0).toLocaleString("en-LS", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const formatDate = (timestamp) => {
  if (!timestamp) return "N/A";
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const formatRelativeTime = (timestamp) => {
  if (!timestamp) return "N/A";
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(timestamp);
};

const generateReferralCode = (userId) => {
  const prefix = "MTR";
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  const userPart = userId ? userId.substring(0, 4).toUpperCase() : "XXXX";
  return `${prefix}-${userPart}-${timestamp.slice(-4)}-${random}`;
};

const getTierFromCount = (count) => {
  if (count >= TIER_LEVELS.DIAMOND.min) return TIER_LEVELS.DIAMOND;
  if (count >= TIER_LEVELS.PLATINUM.min) return TIER_LEVELS.PLATINUM;
  if (count >= TIER_LEVELS.GOLD.min) return TIER_LEVELS.GOLD;
  if (count >= TIER_LEVELS.SILVER.min) return TIER_LEVELS.SILVER;
  return TIER_LEVELS.BRONZE;
};

// Custom Hooks
const useReferralStats = (userId) => {
  const [stats, setStats] = useState({
    totalReferrals: 0,
    activeReferrals: 0,
    completedReferrals: 0,
    totalEarnings: 0,
    pendingEarnings: 0,
    conversionRate: 0,
    averageReward: 0,
    tier: TIER_LEVELS.BRONZE,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const referralsRef = collection(db, "referrals");
    const q = query(referralsRef, where("referrerId", "==", userId));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const referrals = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const total = referrals.length;
        const active = referrals.filter(
          (r) => r.status === REFERRAL_STATUS.ACTIVE,
        ).length;
        const completed = referrals.filter(
          (r) => r.status === REFERRAL_STATUS.COMPLETED,
        ).length;
        const totalEarnings = referrals
          .filter((r) => r.status === REFERRAL_STATUS.COMPLETED)
          .reduce((sum, r) => sum + (r.rewardAmount || 0), 0);
        const pendingEarnings = referrals
          .filter((r) => r.status === REFERRAL_STATUS.PENDING)
          .reduce((sum, r) => sum + (r.rewardAmount || 0), 0);
        const conversionRate = total > 0 ? (completed / total) * 100 : 0;
        const averageReward = completed > 0 ? totalEarnings / completed : 0;
        const tier = getTierFromCount(completed);

        setStats({
          totalReferrals: total,
          activeReferrals: active,
          completedReferrals: completed,
          totalEarnings,
          pendingEarnings,
          conversionRate,
          averageReward,
          tier,
        });
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching referral stats:", error);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [userId]);

  return { stats, loading };
};

const useReferrals = (userId, filters = {}, pagination = {}) => {
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [lastDoc, setLastDoc] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  const fetchReferrals = useCallback(
    async (loadMore = false) => {
      if (!userId) return;

      try {
        setLoading(true);
        let q = query(
          collection(db, "referrals"),
          where("referrerId", "==", userId),
        );

        if (filters.status && filters.status !== "all") {
          q = query(q, where("status", "==", filters.status));
        }
        if (filters.rewardType && filters.rewardType !== "all") {
          q = query(q, where("rewardType", "==", filters.rewardType));
        }

        q = query(q, orderBy("createdAt", "desc"));

        if (loadMore && lastDoc) {
          q = query(q, startAfter(lastDoc));
        }

        q = query(q, limit(ITEMS_PER_PAGE));

        const snapshot = await getDocs(q);
        const newReferrals = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        if (loadMore) {
          setReferrals((prev) => [...prev, ...newReferrals]);
        } else {
          setReferrals(newReferrals);
        }

        setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
        setHasMore(snapshot.docs.length === ITEMS_PER_PAGE);

        // Get total count
        const countQuery = query(
          collection(db, "referrals"),
          where("referrerId", "==", userId),
        );
        const countSnapshot = await getDocs(countQuery);
        setTotalCount(countSnapshot.size);
      } catch (error) {
        console.error("Error fetching referrals:", error);
      } finally {
        setLoading(false);
      }
    },
    [userId, filters.status, filters.rewardType, lastDoc],
  );

  useEffect(() => {
    if (userId) {
      fetchReferrals(false);
    }
  }, [userId, filters.status, filters.rewardType]);

  return {
    referrals,
    loading,
    totalCount,
    hasMore,
    fetchReferrals,
    setReferrals,
  };
};

const useReferralProgram = (userId) => {
  const [program, setProgram] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const programRef = doc(db, "referralPrograms", userId);
    const unsubscribe = onSnapshot(
      programRef,
      (docSnap) => {
        if (docSnap.exists()) {
          setProgram({ id: docSnap.id, ...docSnap.data() });
        } else {
          setProgram(null);
        }
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching referral program:", error);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [userId]);

  const createProgram = async (programData) => {
    if (!userId) return null;
    try {
      const programRef = doc(db, "referralPrograms", userId);
      const referralCode = generateReferralCode(userId);
      const newProgram = {
        userId,
        referralCode,
        referralLink: `${window.location.origin}/register?ref=${encodeURIComponent(referralCode)}&referrer=${encodeURIComponent(userId)}&referrerType=mentor`,
        isActive: true,
        rewardType: REWARD_TYPES.CASH,
        rewardAmount: 50,
        rewardCurrency: "LSL",
        maxReferrals: null,
        expiresAt: null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        ...programData,
      };
      await setDoc(programRef, newProgram);

      return { id: userId, ...newProgram };
    } catch (error) {
      console.error("Error creating referral program:", error);
      throw error;
    }
  };

  const updateProgram = async (updates) => {
    if (!userId) return;
    try {
      const programRef = doc(db, "referralPrograms", userId);
      await updateDoc(programRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error updating referral program:", error);
      throw error;
    }
  };

  return { program, loading, createProgram, updateProgram };
};

// Sub-Components
const StatsCard = ({
  icon: Icon,
  label,
  value,
  subValue,
  trend,
  color = "blue",
  onClick,
}) => {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600 border-blue-200",
    green: "bg-green-50 text-green-600 border-green-200",
    purple: "bg-purple-50 text-purple-600 border-purple-200",
    amber: "bg-amber-50 text-amber-600 border-amber-200",
    red: "bg-red-50 text-red-600 border-red-200",
    cyan: "bg-cyan-50 text-cyan-600 border-cyan-200",
    pink: "bg-pink-50 text-pink-600 border-pink-200",
    indigo: "bg-indigo-50 text-indigo-600 border-indigo-200",
  };

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 ${onClick ? "cursor-pointer" : ""}`}
    >
      <div className="flex items-start justify-between">
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
        {trend !== undefined && (
          <div
            className={`flex items-center gap-1 text-sm font-medium ${trend >= 0 ? "text-green-600" : "text-red-600"}`}
          >
            {trend >= 0 ? (
              <ArrowUpRight className="w-4 h-4" />
            ) : (
              <ArrowDownRight className="w-4 h-4" />
            )}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div className="mt-4">
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        {subValue && <p className="text-sm text-gray-400 mt-1">{subValue}</p>}
      </div>
    </div>
  );
};

const TierBadge = ({ tier, size = "md" }) => {
  const Icon = tier.icon;
  const sizes = {
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-1.5 text-sm",
    lg: "px-4 py-2 text-base",
  };
  const iconSizes = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold bg-${tier.color}/10 text-${tier.color} ${sizes[size]}`}
      style={{
        backgroundColor: tier.color.includes("amber")
          ? "#fef3c7"
          : tier.color.includes("gray")
            ? "#f3f4f6"
            : tier.color.includes("yellow")
              ? "#fef9c3"
              : tier.color.includes("cyan")
                ? "#cffafe"
                : tier.color.includes("purple")
                  ? "#f3e8ff"
                  : "#f3f4f6",
        color: tier.color.includes("amber")
          ? "#d97706"
          : tier.color.includes("gray")
            ? "#6b7280"
            : tier.color.includes("yellow")
              ? "#ca8a04"
              : tier.color.includes("cyan")
                ? "#0891b2"
                : tier.color.includes("purple")
                  ? "#9333ea"
                  : "#6b7280",
      }}
    >
      <Icon className={iconSizes[size]} />
      {tier.name}
    </span>
  );
};

const ProgressBar = ({ value, max, color = "blue", showLabel = true }) => {
  const percentage = Math.min((value / max) * 100, 100);
  const colorClasses = {
    blue: "bg-blue-500",
    green: "bg-green-500",
    purple: "bg-purple-500",
    amber: "bg-amber-500",
    cyan: "bg-cyan-500",
  };

  return (
    <div className="w-full">
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className={`h-2.5 rounded-full transition-all duration-500 ${colorClasses[color]}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <div className="flex justify-between mt-1">
          <span className="text-xs text-gray-500">
            {value} / {max}
          </span>
          <span className="text-xs font-medium text-gray-700">
            {Math.round(percentage)}%
          </span>
        </div>
      )}
    </div>
  );
};

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
  showCloseButton = true,
}) => {
  if (!isOpen) return null;

  const sizes = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
    full: "max-w-6xl",
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={onClose}
        />
        <div
          className={`inline-block w-full ${sizes[size]} p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl`}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            {showCloseButton && (
              <button
                onClick={onClose}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
          {children}
        </div>
      </div>
    </div>
  );
};

const Toast = ({ message, type = "success", onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const typeClasses = {
    success: "bg-green-50 border-green-200 text-green-800",
    error: "bg-red-50 border-red-200 text-red-800",
    warning: "bg-amber-50 border-amber-200 text-amber-800",
    info: "bg-blue-50 border-blue-200 text-blue-800",
  };

  const icons = {
    success: CheckCircle2,
    error: XCircle,
    warning: AlertCircle,
    info: Info,
  };

  const Icon = icons[type];

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 flex items-center gap-3 px-4 py-3 border rounded-lg shadow-lg ${typeClasses[type]} animate-slide-up`}
    >
      <Icon className="w-5 h-5" />
      <span className="text-sm font-medium">{message}</span>
      <button onClick={onClose} className="ml-2 p-1 hover:bg-white/50 rounded">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

const EmptyState = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}) => (
  <div className="flex flex-col items-center justify-center py-16 px-4">
    <div className="p-4 bg-gray-100 rounded-full mb-4">
      <Icon className="w-12 h-12 text-gray-400" />
    </div>
    <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
    <p className="text-sm text-gray-500 text-center max-w-md mb-6">
      {description}
    </p>
    {actionLabel && onAction && (
      <button
        onClick={onAction}
        className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
      >
        {actionLabel}
      </button>
    )}
  </div>
);

const LoadingSpinner = ({ size = "md", text }) => {
  const sizes = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  return (
    <div className="flex flex-col items-center justify-center py-8">
      <Loader2 className={`${sizes[size]} text-blue-600 animate-spin`} />
      {text && <p className="mt-2 text-sm text-gray-500">{text}</p>}
    </div>
  );
};

const StatusBadge = ({ status }) => {
  const statusConfig = {
    [REFERRAL_STATUS.PENDING]: {
      bg: "bg-amber-50",
      text: "text-amber-700",
      border: "border-amber-200",
      icon: Clock,
      label: "Pending",
    },
    [REFERRAL_STATUS.ACTIVE]: {
      bg: "bg-blue-50",
      text: "text-blue-700",
      border: "border-blue-200",
      icon: Activity,
      label: "Active",
    },
    [REFERRAL_STATUS.COMPLETED]: {
      bg: "bg-green-50",
      text: "text-green-700",
      border: "border-green-200",
      icon: CheckCircle,
      label: "Completed",
    },
    [REFERRAL_STATUS.EXPIRED]: {
      bg: "bg-gray-50",
      text: "text-gray-700",
      border: "border-gray-200",
      icon: Clock3,
      label: "Expired",
    },
    [REFERRAL_STATUS.CANCELLED]: {
      bg: "bg-red-50",
      text: "text-red-700",
      border: "border-red-200",
      icon: XCircle,
      label: "Cancelled",
    },
  };

  const config = statusConfig[status] || statusConfig[REFERRAL_STATUS.PENDING];
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${config.bg} ${config.text} ${config.border}`}
    >
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
};

// Main Component
const MentorReferrals = () => {
  const { currentUser, userProfile } = useAuth();
  const { showNotification } = useNotification();
  const [activeTab, setActiveTab] = useState("overview");
  const [filters, setFilters] = useState({
    status: "all",
    rewardType: "all",
    search: "",
  });
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showProgramModal, setShowProgramModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedReferral, setSelectedReferral] = useState(null);
  const [toast, setToast] = useState(null);
  const [copied, setCopied] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [programForm, setProgramForm] = useState({
    rewardType: REWARD_TYPES.CASH,
    rewardAmount: 50,
    rewardCurrency: "LSL",
    maxReferrals: "",
    expiresAt: "",
    customMessage: "",
  });
  const [inviteForm, setInviteForm] = useState({
    emails: "",
    message: "",
  });
  const fileInputRef = useRef(null);

  const { stats, loading: statsLoading } = useReferralStats(currentUser?.uid);
  const {
    program,
    loading: programLoading,
    createProgram,
    updateProgram,
  } = useReferralProgram(currentUser?.uid);
  const {
    referrals,
    loading: referralsLoading,
    totalCount,
    hasMore,
    fetchReferrals,
  } = useReferrals(currentUser?.uid, filters);

  const filteredReferrals = useMemo(() => {
    if (!filters.search) return referrals;
    const searchLower = filters.search.toLowerCase();
    return referrals.filter(
      (r) =>
        r.referredName?.toLowerCase().includes(searchLower) ||
        r.referredEmail?.toLowerCase().includes(searchLower) ||
        r.referralCode?.toLowerCase().includes(searchLower),
    );
  }, [referrals, filters.search]);

  const referralLink = useMemo(() => {
    if (program?.referralCode)
      return `${window.location.origin}/register?ref=${encodeURIComponent(program.referralCode)}&referrer=${encodeURIComponent(userId)}&referrerType=mentor`;
    return "";
  }, [program, userId]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setToast({
        message: "Referral link copied to clipboard!",
        type: "success",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      setToast({ message: "Failed to copy link", type: "error" });
    }
  };

  const handleShare = async (platform) => {
    const shareText = `Join me on Career Connect! Use my referral link to get started: ${referralLink}`;
    const shareUrls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(referralLink)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralLink)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(shareText)}`,
      email: `mailto:?subject=Join Career Connect&body=${encodeURIComponent(shareText)}`,
    };

    if (shareUrls[platform]) {
      window.open(shareUrls[platform], "_blank", "width=600,height=400");
    }
  };

  const handleCreateProgram = async () => {
    try {
      await createProgram(programForm);
      setShowProgramModal(false);
      setToast({
        message: "Referral program created successfully!",
        type: "success",
      });
    } catch (error) {
      setToast({ message: "Failed to create program", type: "error" });
    }
  };

  const handleUpdateProgram = async () => {
    try {
      await updateProgram(programForm);
      setShowProgramModal(false);
      setToast({ message: "Referral program updated!", type: "success" });
    } catch (error) {
      setToast({ message: "Failed to update program", type: "error" });
    }
  };

  const handleSendInvites = async () => {
    try {
      const emails = inviteForm.emails
        .split(",")
        .map((e) => e.trim())
        .filter((e) => e);
      if (emails.length === 0) {
        setToast({
          message: "Please enter at least one email",
          type: "warning",
        });
        return;
      }

      const batch = writeBatch(db);
      const invitesRef = collection(db, "referralInvites");

      emails.forEach((email) => {
        const inviteDoc = doc(invitesRef);
        batch.set(inviteDoc, {
          referrerId: currentUser.uid,
          referrerName: userProfile?.displayName || "A Mentor",
          referredEmail: email,
          message: inviteForm.message,
          referralCode: program?.referralCode,
          referralLink,
          status: REFERRAL_STATUS.PENDING,
          createdAt: serverTimestamp(),
        });
      });

      await batch.commit();

      setShowInviteModal(false);
      setInviteForm({ emails: "", message: "" });
      let deliveryError = null;
      try {
        const result = await supabase.functions.invoke("send-referral-invites", {
          body: {
            emails,
            referrerName: userProfile?.displayName,
            referralLink,
            message: inviteForm.message,
          },
        });
        deliveryError = result.error;
        if (deliveryError) throw deliveryError;
      } catch (error) {
        console.error("Referral invites were saved but email delivery failed:", error);
        setToast({
          message: "Invitations were saved, but email delivery could not be completed.",
          type: "warning",
        });
        return;
      }

      setToast({
        message: `Invites sent to ${emails.length} email(s)!`,
        type: "success",
      });
    } catch (error) {
      console.error("Error sending invites:", error);
      setToast({ message: "Failed to send invites", type: "error" });
    }
  };

  const handleExportReferrals = async () => {
    try {
      const csvContent = [
        [
          "Name",
          "Email",
          "Status",
          "Reward Type",
          "Reward Amount",
          "Date Joined",
          "Date Completed",
        ],
        ...filteredReferrals.map((r) => [
          r.referredName || "N/A",
          r.referredEmail || "N/A",
          r.status,
          r.rewardType,
          r.rewardAmount || 0,
          formatDate(r.createdAt),
          r.completedAt ? formatDate(r.completedAt) : "N/A",
        ]),
      ]
        .map((row) => row.join(","))
        .join("\n");

      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `referrals-export-${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);

      setToast({
        message: "Referrals exported successfully!",
        type: "success",
      });
    } catch (error) {
      setToast({ message: "Failed to export referrals", type: "error" });
    }
  };

  const handleViewDetails = (referral) => {
    setSelectedReferral(referral);
    setShowDetailsModal(true);
  };

  const handleCancelReferral = async (referralId) => {
    try {
      await updateDoc(doc(db, "referrals", referralId), {
        status: REFERRAL_STATUS.CANCELLED,
        cancelledAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      setToast({ message: "Referral cancelled", type: "success" });
    } catch (error) {
      setToast({ message: "Failed to cancel referral", type: "error" });
    }
  };

  const handleReactivateReferral = async (referralId) => {
    try {
      await updateDoc(doc(db, "referrals", referralId), {
        status: REFERRAL_STATUS.ACTIVE,
        reactivatedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      setToast({ message: "Referral reactivated", type: "success" });
    } catch (error) {
      setToast({ message: "Failed to reactivate referral", type: "error" });
    }
  };

  // Render Overview Tab
  const renderOverview = () => (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          icon={Users}
          label="Total Referrals"
          value={stats.totalReferrals}
          subValue={`${stats.activeReferrals} active`}
          color="blue"
        />
        <StatsCard
          icon={CheckCircle}
          label="Completed"
          value={stats.completedReferrals}
          subValue={`${stats.conversionRate.toFixed(1)}% conversion`}
          color="green"
        />
        <StatsCard
          icon={DollarSign}
          label="Total Earnings"
          value={formatCurrency(stats.totalEarnings)}
          subValue={`${formatCurrency(stats.pendingEarnings)} pending`}
          color="purple"
        />
        <StatsCard
          icon={Target}
          label="Avg. Reward"
          value={formatCurrency(stats.averageReward)}
          subValue="Per completed referral"
          color="amber"
        />
      </div>

      {/* Tier Progress */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-50 rounded-lg">
              <Trophy className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Referral Tier Progress
              </h3>
              <p className="text-sm text-gray-500">
                Keep referring to unlock better rewards
              </p>
            </div>
          </div>
          <TierBadge tier={stats.tier} size="lg" />
        </div>
        <ProgressBar
          value={stats.completedReferrals}
          max={
            stats.tier.max === Infinity
              ? stats.completedReferrals + 10
              : stats.tier.max
          }
          color="purple"
        />
        <div className="grid grid-cols-5 gap-2 mt-4">
          {Object.values(TIER_LEVELS).map((tier) => {
            const TierIcon = tier.icon;
            const isActive = stats.completedReferrals >= tier.min;
            const isCurrent = stats.tier.name === tier.name;
            return (
              <div
                key={tier.name}
                className={`text-center p-3 rounded-lg border-2 transition-all ${
                  isCurrent
                    ? "border-purple-500 bg-purple-50"
                    : isActive
                      ? "border-green-200 bg-green-50"
                      : "border-gray-200 bg-gray-50"
                }`}
              >
                <TierIcon
                  className={`w-6 h-6 mx-auto mb-1 ${
                    isCurrent
                      ? "text-purple-600"
                      : isActive
                        ? "text-green-600"
                        : "text-gray-400"
                  }`}
                />
                <p className="text-xs font-medium text-gray-900">{tier.name}</p>
                <p className="text-xs text-gray-500">{tier.min}+</p>
                {tier.multiplier > 1 && (
                  <p className="text-xs font-semibold text-purple-600 mt-1">
                    {tier.multiplier}x
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Referral Link Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-white/20 rounded-lg">
            <Link2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Your Referral Link</h3>
            <p className="text-sm text-white/80">
              Share this link to earn rewards
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-white/10 rounded-lg p-3">
          <input
            type="text"
            value={referralLink}
            readOnly
            className="flex-1 bg-transparent text-white text-sm outline-none placeholder-white/50"
            placeholder="No referral link yet"
          />
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-2 px-4 py-2 bg-white text-blue-600 rounded-lg font-medium hover:bg-white/90 transition-colors"
          >
            {copied ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
        <div className="flex items-center gap-2 mt-4">
          <button
            onClick={() => handleShare("facebook")}
            className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
            title="Share on Facebook"
          >
            <Facebook className="w-5 h-5" />
          </button>
          <button
            onClick={() => handleShare("twitter")}
            className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
            title="Share on Twitter"
          >
            <Twitter className="w-5 h-5" />
          </button>
          <button
            onClick={() => handleShare("linkedin")}
            className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
            title="Share on LinkedIn"
          >
            <Linkedin className="w-5 h-5" />
          </button>
          <button
            onClick={() => handleShare("whatsapp")}
            className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
            title="Share on WhatsApp"
          >
            <MessageCircle className="w-5 h-5" />
          </button>
          <button
            onClick={() => handleShare("email")}
            className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
            title="Share via Email"
          >
            <Mail className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => setShowInviteModal(true)}
          className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all text-left"
        >
          <div className="p-3 bg-blue-50 rounded-lg">
            <UserPlus className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900">Invite via Email</p>
            <p className="text-sm text-gray-500">Send personalized invites</p>
          </div>
        </button>
        <button
          onClick={() => setShowProgramModal(true)}
          className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all text-left"
        >
          <div className="p-3 bg-purple-50 rounded-lg">
            <Settings className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900">Program Settings</p>
            <p className="text-sm text-gray-500">Configure rewards</p>
          </div>
        </button>
        <button
          onClick={handleExportReferrals}
          className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:border-green-300 hover:shadow-md transition-all text-left"
        >
          <div className="p-3 bg-green-50 rounded-lg">
            <Download className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900">Export Data</p>
            <p className="text-sm text-gray-500">Download referral report</p>
          </div>
        </button>
      </div>

      {/* Recent Referrals */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">Recent Referrals</h3>
          <button
            onClick={() => setActiveTab("referrals")}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            View All
          </button>
        </div>
        {referralsLoading ? (
          <LoadingSpinner text="Loading referrals..." />
        ) : filteredReferrals.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No referrals yet"
            description="Start sharing your referral link to earn rewards"
            actionLabel="Invite Friends"
            onAction={() => setShowInviteModal(true)}
          />
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredReferrals.slice(0, 5).map((referral) => (
              <div
                key={referral.id}
                className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                    {referral.referredName?.charAt(0)?.toUpperCase() || "?"}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {referral.referredName || "Unknown"}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatRelativeTime(referral.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={referral.status} />
                  <span className="font-semibold text-gray-900">
                    {formatCurrency(referral.rewardAmount || 0)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  // Render Referrals Tab
  const renderReferrals = () => (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 w-full sm:w-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search referrals..."
            value={filters.search}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, search: e.target.value }))
            }
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <select
          value={filters.status}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, status: e.target.value }))
          }
          className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Status</option>
          <option value={REFERRAL_STATUS.PENDING}>Pending</option>
          <option value={REFERRAL_STATUS.ACTIVE}>Active</option>
          <option value={REFERRAL_STATUS.COMPLETED}>Completed</option>
          <option value={REFERRAL_STATUS.EXPIRED}>Expired</option>
          <option value={REFERRAL_STATUS.CANCELLED}>Cancelled</option>
        </select>
        <select
          value={filters.rewardType}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, rewardType: e.target.value }))
          }
          className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Rewards</option>
          <option value={REWARD_TYPES.CASH}>Cash</option>
          <option value={REWARD_TYPES.CREDITS}>Credits</option>
          <option value={REWARD_TYPES.PREMIUM}>Premium</option>
          <option value={REWARD_TYPES.BADGE}>Badge</option>
        </select>
        <button
          onClick={handleExportReferrals}
          className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <Download className="w-4 h-4" />
          Export
        </button>
      </div>

      {/* Referrals Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {referralsLoading ? (
          <LoadingSpinner text="Loading referrals..." />
        ) : filteredReferrals.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No referrals found"
            description={
              filters.search || filters.status !== "all"
                ? "Try adjusting your filters"
                : "Start inviting people to see referrals here"
            }
            actionLabel={
              filters.search || filters.status !== "all"
                ? "Clear Filters"
                : "Invite Friends"
            }
            onAction={() => {
              if (filters.search || filters.status !== "all") {
                setFilters({ status: "all", rewardType: "all", search: "" });
              } else {
                setShowInviteModal(true);
              }
            }}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Referred User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Reward
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredReferrals.map((referral) => (
                  <tr
                    key={referral.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-semibold">
                          {referral.referredName?.charAt(0)?.toUpperCase() ||
                            "?"}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 text-sm">
                            {referral.referredName || "Unknown"}
                          </p>
                          <p className="text-xs text-gray-500">
                            {referral.referredEmail || "No email"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={referral.status} />
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">
                          {formatCurrency(referral.rewardAmount || 0)}
                        </p>
                        <p className="text-xs text-gray-500 capitalize">
                          {referral.rewardType}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900">
                        {formatDate(referral.createdAt)}
                      </p>
                      {referral.completedAt && (
                        <p className="text-xs text-green-600">
                          Completed {formatRelativeTime(referral.completedAt)}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleViewDetails(referral)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {referral.status === REFERRAL_STATUS.ACTIVE && (
                          <button
                            onClick={() => handleCancelReferral(referral.id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Cancel"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}
                        {referral.status === REFERRAL_STATUS.CANCELLED && (
                          <button
                            onClick={() =>
                              handleReactivateReferral(referral.id)
                            }
                            className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Reactivate"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {hasMore && !referralsLoading && (
          <div className="p-4 border-t border-gray-200 text-center">
            <button
              onClick={() => fetchReferrals(true)}
              className="px-6 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
            >
              Load More
            </button>
          </div>
        )}
      </div>
    </div>
  );

  // Render Analytics Tab
  const renderAnalytics = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Overview */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">
            Performance Overview
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Conversion Rate</span>
              <span className="font-semibold text-gray-900">
                {stats.conversionRate.toFixed(1)}%
              </span>
            </div>
            <ProgressBar
              value={stats.conversionRate}
              max={100}
              color="green"
              showLabel={false}
            />

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Completion Rate</span>
              <span className="font-semibold text-gray-900">
                {stats.totalReferrals > 0
                  ? (
                      (stats.completedReferrals / stats.totalReferrals) *
                      100
                    ).toFixed(1)
                  : 0}
                %
              </span>
            </div>
            <ProgressBar
              value={
                stats.totalReferrals > 0
                  ? (stats.completedReferrals / stats.totalReferrals) * 100
                  : 0
              }
              max={100}
              color="blue"
              showLabel={false}
            />

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Active Rate</span>
              <span className="font-semibold text-gray-900">
                {stats.totalReferrals > 0
                  ? (
                      (stats.activeReferrals / stats.totalReferrals) *
                      100
                    ).toFixed(1)
                  : 0}
                %
              </span>
            </div>
            <ProgressBar
              value={
                stats.totalReferrals > 0
                  ? (stats.activeReferrals / stats.totalReferrals) * 100
                  : 0
              }
              max={100}
              color="cyan"
              showLabel={false}
            />
          </div>
        </div>

        {/* Earnings Breakdown */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">
            Earnings Breakdown
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Wallet className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">
                  Completed Earnings
                </span>
              </div>
              <span className="font-bold text-green-800">
                {formatCurrency(stats.totalEarnings)}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-600" />
                <span className="text-sm font-medium text-amber-800">
                  Pending Earnings
                </span>
              </div>
              <span className="font-bold text-amber-800">
                {formatCurrency(stats.pendingEarnings)}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">
                  Projected Monthly
                </span>
              </div>
              <span className="font-bold text-blue-800">
                {formatCurrency(
                  stats.averageReward * Math.max(stats.completedReferrals, 1),
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Tier Benefits */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 lg:col-span-2">
          <h3 className="font-semibold text-gray-900 mb-4">Tier Benefits</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {Object.values(TIER_LEVELS).map((tier) => {
              const TierIcon = tier.icon;
              const isActive = stats.completedReferrals >= tier.min;
              return (
                <div
                  key={tier.name}
                  className={`p-4 rounded-lg border-2 ${
                    isActive
                      ? "border-green-200 bg-green-50"
                      : "border-gray-200 bg-gray-50"
                  }`}
                >
                  <TierIcon
                    className={`w-8 h-8 mb-2 ${isActive ? "text-green-600" : "text-gray-400"}`}
                  />
                  <h4 className="font-semibold text-gray-900">{tier.name}</h4>
                  <p className="text-xs text-gray-500 mb-2">
                    {tier.min}+ referrals
                  </p>
                  <p className="text-sm font-medium text-purple-600">
                    {tier.multiplier}x rewards
                  </p>
                  {isActive && (
                    <span className="inline-flex items-center gap-1 mt-2 text-xs text-green-600 font-medium">
                      <CheckCircle className="w-3 h-3" />
                      Unlocked
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
                <Gift className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Referral Program
                </h1>
                <p className="text-sm text-gray-500">
                  Invite others and earn rewards
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowInviteModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                <UserPlus className="w-4 h-4" />
                Invite
              </button>
              <button
                onClick={() => setShowProgramModal(true)}
                className="p-2.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
                title="Settings"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-6">
            {[
              { id: "overview", label: "Overview", icon: BarChart3 },
              { id: "referrals", label: "Referrals", icon: Users },
              { id: "analytics", label: "Analytics", icon: TrendingUp },
            ].map((tab) => {
              const TabIcon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-4 border-b-2 text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <TabIcon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {statsLoading || programLoading ? (
          <LoadingSpinner size="lg" text="Loading referral data..." />
        ) : (
          <>
            {activeTab === "overview" && renderOverview()}
            {activeTab === "referrals" && renderReferrals()}
            {activeTab === "analytics" && renderAnalytics()}
          </>
        )}
      </div>

      {/* Invite Modal */}
      <Modal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        title="Invite via Email"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Addresses
            </label>
            <textarea
              value={inviteForm.emails}
              onChange={(e) =>
                setInviteForm((prev) => ({ ...prev, emails: e.target.value }))
              }
              placeholder="email1@example.com, email2@example.com"
              rows={3}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
            <p className="text-xs text-gray-500 mt-1">
              Separate multiple emails with commas
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Personal Message (Optional)
            </label>
            <textarea
              value={inviteForm.message}
              onChange={(e) =>
                setInviteForm((prev) => ({ ...prev, message: e.target.value }))
              }
              placeholder="Hey! I think you'd love Career Connect..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>
          <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
            <Link2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
            <p className="text-xs text-blue-800 break-all">{referralLink}</p>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setShowInviteModal(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSendInvites}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              <Send className="w-4 h-4" />
              Send Invites
            </button>
          </div>
        </div>
      </Modal>

      {/* Program Settings Modal */}
      <Modal
        isOpen={showProgramModal}
        onClose={() => setShowProgramModal(false)}
        title={program ? "Update Referral Program" : "Create Referral Program"}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reward Type
            </label>
            <select
              value={programForm.rewardType}
              onChange={(e) =>
                setProgramForm((prev) => ({
                  ...prev,
                  rewardType: e.target.value,
                }))
              }
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={REWARD_TYPES.CASH}>Cash</option>
              <option value={REWARD_TYPES.CREDITS}>Platform Credits</option>
              <option value={REWARD_TYPES.PREMIUM}>Premium Features</option>
              <option value={REWARD_TYPES.BADGE}>Badge</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reward Amount
              </label>
              <input
                type="number"
                value={programForm.rewardAmount}
                onChange={(e) =>
                  setProgramForm((prev) => ({
                    ...prev,
                    rewardAmount: parseFloat(e.target.value) || 0,
                  }))
                }
                min="0"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Currency
              </label>
              <select
                value={programForm.rewardCurrency}
                onChange={(e) =>
                  setProgramForm((prev) => ({
                    ...prev,
                    rewardCurrency: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="LSL">LSL</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
                <option value="ZAR">ZAR</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Max Referrals (Optional)
            </label>
            <input
              type="number"
              value={programForm.maxReferrals}
              onChange={(e) =>
                setProgramForm((prev) => ({
                  ...prev,
                  maxReferrals: e.target.value,
                }))
              }
              placeholder="Unlimited"
              min="1"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Expiry Date (Optional)
            </label>
            <input
              type="date"
              value={programForm.expiresAt}
              onChange={(e) =>
                setProgramForm((prev) => ({
                  ...prev,
                  expiresAt: e.target.value,
                }))
              }
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setShowProgramModal(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={program ? handleUpdateProgram : handleCreateProgram}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              {program ? "Update Program" : "Create Program"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Details Modal */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        title="Referral Details"
      >
        {selectedReferral && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold text-lg">
                {selectedReferral.referredName?.charAt(0)?.toUpperCase() || "?"}
              </div>
              <div>
                <p className="font-semibold text-gray-900">
                  {selectedReferral.referredName || "Unknown"}
                </p>
                <p className="text-sm text-gray-500">
                  {selectedReferral.referredEmail || "No email"}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Status</p>
                <StatusBadge status={selectedReferral.status} />
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Reward</p>
                <p className="font-semibold text-gray-900">
                  {formatCurrency(selectedReferral.rewardAmount || 0)}
                </p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Referral Code</p>
                <p className="font-mono text-sm text-gray-900">
                  {selectedReferral.referralCode || "N/A"}
                </p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Date Created</p>
                <p className="text-sm text-gray-900">
                  {formatDate(selectedReferral.createdAt)}
                </p>
              </div>
              {selectedReferral.completedAt && (
                <div className="p-3 bg-green-50 rounded-lg col-span-2">
                  <p className="text-xs text-green-600 mb-1">Completed On</p>
                  <p className="text-sm font-medium text-green-800">
                    {formatDate(selectedReferral.completedAt)}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default MentorReferrals;
