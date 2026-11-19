import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { db, auth } from "../../config/firebase";
import { supabase } from "../../config/supabase";
import { useAuth } from "../../hooks/useAuth";
import {
  BarChart3,
  PieChart,
  TrendingUp,
  TrendingDown,
  Activity,
  Users,
  Calendar,
  Clock,
  Star,
  DollarSign,
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
  Brain,
  Heart,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Loader2,
  AlertCircle,
  Info,
  HelpCircle,
  Download,
  RefreshCw,
  Filter,
  Search,
  Settings,
  Bell,
  Globe,
  MapPin,
  ArrowUpRight,
  ArrowDownRight,
  ArrowUp,
  ArrowDown,
  Minus,
  Equal,
  Percent,
  Calculator,
  Scale,
  Ruler,
  Timer,
  Hourglass,
  History,
  RotateCcw,
  Eye,
  MoreVertical,
  ExternalLink,
  Copy,
  Check,
  X,
  Plus,
  Share2,
  Bookmark,
  Tag,
  Hash,
  AtSign,
  Users as UsersIcon,
  UserCheck,
  UserX,
  UserPlus,
  UserMinus,
  MessageSquare,
  Video,
  FileText,
  BookOpen,
  GraduationCap,
  Briefcase,
  Building2,
  Handshake,
  Home,
  LogOut,
  Menu,
  Sun,
  Moon,
  Cloud,
  CloudRain,
  Wind,
  Droplets,
  Thermometer,
  Shield,
  Lock,
  Unlock,
  Key,
  Fingerprint,
  Calendar as CalendarIcon,
  ThumbsUp,
  ThumbsDown,
  Smile,
  Frown,
  Meh,
  Send,
  Mail,
  Phone,
  Camera,
  Image as ImageIcon,
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
  Monitor as Desktop,
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
  Archive,
  Folder,
  FolderOpen,
  FileSpreadsheet,
  FilePlus,
  FileMinus,
  Crosshair,
  Compass,
  Map,
  Navigation,
  Anchor,
  Flag,
  Route,
  GitBranch,
  Network,
  Workflow,
  Puzzle,
  Component,
  Layout,
  LayoutGrid,
  Grid,
  List,
  Book,
  Library,
  Laptop as LaptopIcon,
  Star as StarIcon,
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
  Treemap,
  Funnel,
  FunnelChart,
  Sankey,
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
  startOfWeek,
  endOfWeek,
  subWeeks,
  addWeeks,
  startOfYear,
  endOfYear,
  subYears,
  subDays,
  addDays,
  eachMonthOfInterval,
  eachWeekOfInterval,
  isSameMonth,
  isSameWeek,
  getMonth,
  getYear,
} from "date-fns";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const cn = (...inputs) => twMerge(clsx(inputs));

const formatCurrency = (amount) =>
  `LSL ${Number(amount || 0).toLocaleString("en-LS", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;

const formatNumber = (n) => {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return (n || 0).toString();
};

const CHART_COLORS = [
  "#6366f1",
  "#8b5cf6",
  "#ec4899",
  "#f59e0b",
  "#10b981",
  "#06b6d4",
  "#ef4444",
  "#84cc16",
];

// ============================================================================
// CUSTOM HOOKS
// ============================================================================

const useAnalytics = (mentorId, dateRange = "6months") => {
  const [data, setData] = useState({
    sessions: [],
    mentees: [],
    reviews: [],
    earnings: [],
    resources: [],
    messages: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!mentorId) return;

    const unsubscribers = [];

    const sessionsUnsub = onSnapshot(
      query(
        collection(db, "mentorSessions"),
        where("mentorId", "==", mentorId),
      ),
      (snap) => {
        setData((prev) => ({
          ...prev,
          sessions: snap.docs.map((d) => ({
            id: d.id,
            ...d.data(),
            scheduledAt:
              d.data().scheduledAt?.toDate?.() ||
              new Date(d.data().scheduledAt || 0),
            createdAt:
              d.data().createdAt?.toDate?.() ||
              new Date(d.data().createdAt || 0),
          })),
        }));
      },
    );
    unsubscribers.push(sessionsUnsub);

    const menteesUnsub = onSnapshot(
      query(collection(db, "mentorships"), where("mentorId", "==", mentorId)),
      (snap) => {
        setData((prev) => ({
          ...prev,
          mentees: snap.docs.map((d) => ({ id: d.id, ...d.data() })),
        }));
      },
    );
    unsubscribers.push(menteesUnsub);

    const reviewsUnsub = onSnapshot(
      query(collection(db, "mentorReviews"), where("mentorId", "==", mentorId)),
      (snap) => {
        setData((prev) => ({
          ...prev,
          reviews: snap.docs.map((d) => ({
            id: d.id,
            ...d.data(),
            createdAt:
              d.data().createdAt?.toDate?.() ||
              new Date(d.data().createdAt || 0),
          })),
        }));
      },
    );
    unsubscribers.push(reviewsUnsub);

    const earningsUnsub = onSnapshot(
      query(
        collection(db, "mentorTransactions"),
        where("mentorId", "==", mentorId),
      ),
      (snap) => {
        setData((prev) => ({
          ...prev,
          earnings: snap.docs.map((d) => ({
            id: d.id,
            ...d.data(),
            createdAt:
              d.data().createdAt?.toDate?.() ||
              new Date(d.data().createdAt || 0),
          })),
          loading: false,
        }));
      },
    );
    unsubscribers.push(earningsUnsub);

    const resourcesUnsub = onSnapshot(
      query(
        collection(db, "mentorResources"),
        where("mentorId", "==", mentorId),
      ),
      (snap) => {
        setData((prev) => ({
          ...prev,
          resources: snap.docs.map((d) => ({ id: d.id, ...d.data() })),
        }));
      },
    );
    unsubscribers.push(resourcesUnsub);

    return () => unsubscribers.forEach((u) => u());
  }, [mentorId]);

  return data;
};

// ============================================================================
// COMPONENTS
// ============================================================================

const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-50">
    <div className="text-center">
      <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto" />
      <p className="mt-4 text-gray-600 font-medium">Loading analytics...</p>
    </div>
  </div>
);

const Card = ({ children, className, onClick }) => (
  <div
    onClick={onClick}
    className={cn(
      "bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden",
      className,
    )}
  >
    {children}
  </div>
);

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
    ghost: "text-gray-600 hover:bg-gray-100 focus:ring-gray-500",
  };
  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
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

const StatCard = ({ title, value, change, icon: Icon, color, subtitle }) => {
  const isPositive = change >= 0;
  return (
    <Card className="p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">
            {title}
          </p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="mt-1 text-xs text-gray-400">{subtitle}</p>}
          {change !== undefined && (
            <div className="mt-2 flex items-center space-x-1">
              {isPositive ? (
                <ArrowUpRight className="w-4 h-4 text-green-600" />
              ) : (
                <ArrowDownRight className="w-4 h-4 text-red-600" />
              )}
              <span
                className={cn(
                  "text-sm font-semibold",
                  isPositive ? "text-green-600" : "text-red-600",
                )}
              >
                {Math.abs(change)}%
              </span>
              <span className="text-sm text-gray-500">vs prev period</span>
            </div>
          )}
        </div>
        <div
          className={cn(
            "w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0",
            color,
          )}
        >
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </Card>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const MentorAnalytics = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState("6months"); // week, month, 3months, 6months, year, all
  const [activeSection, setActiveSection] = useState("overview");

  const mentorId = user?.uid;
  const { sessions, mentees, reviews, earnings, resources, loading, error } =
    useAnalytics(mentorId, dateRange);

  // Period bounds
  const periodBounds = useMemo(() => {
    const now = new Date();
    switch (dateRange) {
      case "week":
        return {
          start: startOfWeek(now),
          end: endOfWeek(now),
          prevStart: startOfWeek(subWeeks(now, 1)),
          prevEnd: endOfWeek(subWeeks(now, 1)),
        };
      case "month":
        return {
          start: startOfMonth(now),
          end: endOfMonth(now),
          prevStart: startOfMonth(subMonths(now, 1)),
          prevEnd: endOfMonth(subMonths(now, 1)),
        };
      case "3months":
        return {
          start: subMonths(now, 3),
          end: now,
          prevStart: subMonths(now, 6),
          prevEnd: subMonths(now, 3),
        };
      case "6months":
        return {
          start: subMonths(now, 6),
          end: now,
          prevStart: subMonths(now, 12),
          prevEnd: subMonths(now, 6),
        };
      case "year":
        return {
          start: startOfYear(now),
          end: endOfYear(now),
          prevStart: startOfYear(subYears(now, 1)),
          prevEnd: endOfYear(subYears(now, 1)),
        };
      default:
        return {
          start: new Date(0),
          end: now,
          prevStart: new Date(0),
          prevEnd: now,
        };
    }
  }, [dateRange]);

  // Filtered data within range
  const periodSessions = useMemo(
    () =>
      sessions.filter(
        (s) =>
          s.scheduledAt >= periodBounds.start &&
          s.scheduledAt <= periodBounds.end,
      ),
    [sessions, periodBounds],
  );
  const prevSessions = useMemo(
    () =>
      sessions.filter(
        (s) =>
          s.scheduledAt >= periodBounds.prevStart &&
          s.scheduledAt < periodBounds.prevEnd,
      ),
    [sessions, periodBounds],
  );
  const periodEarnings = useMemo(
    () =>
      earnings.filter(
        (e) =>
          e.createdAt >= periodBounds.start &&
          e.createdAt <= periodBounds.end &&
          e.type !== "withdrawal" &&
          e.status === "completed",
      ),
    [earnings, periodBounds],
  );
  const prevEarnings = useMemo(
    () =>
      earnings.filter(
        (e) =>
          e.createdAt >= periodBounds.prevStart &&
          e.createdAt < periodBounds.prevEnd &&
          e.type !== "withdrawal" &&
          e.status === "completed",
      ),
    [earnings, periodBounds],
  );

  // Stats
  const stats = useMemo(() => {
    const totalEarnings = periodEarnings.reduce(
      (sum, e) => sum + (e.amount || 0),
      0,
    );
    const prevTotalEarnings = prevEarnings.reduce(
      (sum, e) => sum + (e.amount || 0),
      0,
    );
    const earningsChange =
      prevTotalEarnings > 0
        ? ((totalEarnings - prevTotalEarnings) / prevTotalEarnings) * 100
        : 0;

    const completedSessions = periodSessions.filter(
      (s) => s.status === "completed",
    ).length;
    const prevCompletedSessions = prevSessions.filter(
      (s) => s.status === "completed",
    ).length;
    const sessionsChange =
      prevCompletedSessions > 0
        ? ((completedSessions - prevCompletedSessions) /
            prevCompletedSessions) *
          100
        : 0;

    const avgRating =
      reviews.length > 0
        ? (
            reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
          ).toFixed(1)
        : "0.0";

    const activeMentees = mentees.filter(
      (m) => m.status === "active" || !m.status,
    ).length;

    const totalHours = periodSessions
      .filter((s) => s.status === "completed")
      .reduce((sum, s) => sum + (s.duration || 60) / 60, 0);

    const completionRate =
      periodSessions.length > 0
        ? Math.round((completedSessions / periodSessions.length) * 100)
        : 0;

    return {
      totalEarnings,
      earningsChange: Math.round(earningsChange),
      completedSessions,
      sessionsChange: Math.round(sessionsChange),
      avgRating,
      totalReviews: reviews.length,
      activeMentees,
      totalMentees: mentees.length,
      totalHours: Math.round(totalHours),
      completionRate,
      totalSessions: periodSessions.length,
      cancelledSessions: periodSessions.filter((s) => s.status === "cancelled")
        .length,
      avgSessionDuration:
        completedSessions > 0
          ? Math.round(
              periodSessions
                .filter((s) => s.status === "completed")
                .reduce((sum, s) => sum + (s.duration || 60), 0) /
                completedSessions,
            )
          : 0,
    };
  }, [
    periodSessions,
    prevSessions,
    periodEarnings,
    prevEarnings,
    reviews,
    mentees,
  ]);

  // Monthly trend data
  const monthlyTrend = useMemo(() => {
    const now = new Date();
    const months = eachMonthOfInterval({ start: subMonths(now, 11), end: now });
    return months.map((m) => {
      const mStart = startOfMonth(m);
      const mEnd = endOfMonth(m);
      const monthSessions = sessions.filter(
        (s) => s.scheduledAt >= mStart && s.scheduledAt <= mEnd,
      );
      const completed = monthSessions.filter(
        (s) => s.status === "completed",
      ).length;
      const monthEarnings = earnings
        .filter(
          (e) =>
            e.createdAt >= mStart &&
            e.createdAt <= mEnd &&
            e.type !== "withdrawal" &&
            e.status === "completed",
        )
        .reduce((sum, e) => sum + (e.amount || 0), 0);
      const monthReviews = reviews.filter(
        (r) => r.createdAt >= mStart && r.createdAt <= mEnd,
      );
      const monthAvgRating =
        monthReviews.length > 0
          ? monthReviews.reduce((sum, r) => sum + r.rating, 0) /
            monthReviews.length
          : 0;
      return {
        name: format(m, "MMM yyyy"),
        shortName: format(m, "MMM"),
        sessions: monthSessions.length,
        completed,
        earnings: monthEarnings,
        rating: parseFloat(monthAvgRating.toFixed(1)),
        newMentees: mentees.filter((mnt) => {
          const created =
            mnt.createdAt?.toDate?.() || new Date(mnt.createdAt || 0);
          return created >= mStart && created <= mEnd;
        }).length,
      };
    });
  }, [sessions, earnings, reviews, mentees]);

  // Session status distribution
  const statusDistribution = useMemo(() => {
    const counts = {
      completed: 0,
      scheduled: 0,
      cancelled: 0,
      in_progress: 0,
      no_show: 0,
    };
    periodSessions.forEach((s) => {
      if (counts[s.status] !== undefined) counts[s.status]++;
    });
    return Object.entries(counts)
      .filter(([, v]) => v > 0)
      .map(([name, value]) => ({
        name: name.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase()),
        value,
      }));
  }, [periodSessions]);

  // Rating distribution
  const ratingDistribution = useMemo(() => {
    const dist = [5, 4, 3, 2, 1].map((r) => ({
      name: `${r} Star${r > 1 ? "s" : ""}`,
      count: reviews.filter((rev) => Math.round(rev.rating) === r).length,
      fill:
        r === 5
          ? "#10b981"
          : r === 4
            ? "#84cc16"
            : r === 3
              ? "#f59e0b"
              : r === 2
                ? "#f97316"
                : "#ef4444",
    }));
    return dist;
  }, [reviews]);

  // Earnings breakdown by type
  const earningsByType = useMemo(() => {
    const byType = {};
    periodEarnings.forEach((e) => {
      const t = e.type || "other";
      byType[t] = (byType[t] || 0) + (e.amount || 0);
    });
    return Object.entries(byType).map(([name, value]) => ({
      name: name.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
      value,
    }));
  }, [periodEarnings]);

  // Session heatmap (by day and hour)
  const sessionHeatmap = useMemo(() => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const hours = [
      6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22,
    ];
    const grid = days.map((d) => ({ day: d, hours: hours.map(() => 0) }));
    periodSessions.forEach((s) => {
      const date = new Date(s.scheduledAt);
      const dIdx = date.getDay();
      const h = date.getHours();
      const hIdx = hours.indexOf(h);
      if (hIdx !== -1) grid[dIdx].hours[hIdx]++;
    });
    const max = Math.max(1, ...grid.flatMap((g) => g.hours));
    return { days, hours, grid, max };
  }, [periodSessions]);

  // Top mentees by session count
  const topMentees = useMemo(() => {
    const countByMentee = {};
    periodSessions.forEach((s) => {
      const key = s.menteeId;
      if (!key) return;
      if (!countByMentee[key]) {
        countByMentee[key] = {
          id: key,
          name: s.menteeName || "Mentee",
          avatar: s.menteeAvatar,
          sessions: 0,
          completed: 0,
        };
      }
      countByMentee[key].sessions++;
      if (s.status === "completed") countByMentee[key].completed++;
    });
    return Object.values(countByMentee)
      .sort((a, b) => b.sessions - a.sessions)
      .slice(0, 5);
  }, [periodSessions]);

  // Export CSV
  const handleExport = useCallback(() => {
    const headers = ["Metric", "Value"];
    const rows = [
      ["Total Earnings", stats.totalEarnings],
      ["Completed Sessions", stats.completedSessions],
      ["Total Sessions", stats.totalSessions],
      ["Avg Rating", stats.avgRating],
      ["Total Reviews", stats.totalReviews],
      ["Active Mentees", stats.activeMentees],
      ["Total Mentees", stats.totalMentees],
      ["Total Hours", stats.totalHours],
      ["Completion Rate", `${stats.completionRate}%`],
      ["Cancelled Sessions", stats.cancelledSessions],
      ["Avg Session Duration (min)", stats.avgSessionDuration],
    ];

    let csv = headers.join(",") + "\n";
    csv += rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    csv += "\n\nMonthly Trend\n";
    csv += "Month,Sessions,Completed,Earnings,Rating,New Mentees\n";
    csv += monthlyTrend
      .map((m) =>
        [
          m.name,
          m.sessions,
          m.completed,
          m.earnings,
          m.rating,
          m.newMentees,
        ].join(","),
      )
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mentor-analytics-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Analytics exported!");
  }, [stats, monthlyTrend]);

  if (authLoading || loading) return <LoadingSpinner />;
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center max-w-md mx-auto p-8">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto" />
          <h2 className="mt-4 text-xl font-bold text-gray-900">
            Error loading analytics
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

  const dateRanges = [
    { value: "week", label: "This Week" },
    { value: "month", label: "This Month" },
    { value: "3months", label: "Last 3 Months" },
    { value: "6months", label: "Last 6 Months" },
    { value: "year", label: "This Year" },
    { value: "all", label: "All Time" },
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
              <h1 className="text-lg font-semibold text-gray-900">Analytics</h1>
            </div>
            <div className="flex items-center space-x-3">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              >
                {dateRanges.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
              <Button
                variant="outline"
                size="sm"
                icon={Download}
                onClick={handleExport}
              >
                Export
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Earnings"
            value={formatCurrency(stats.totalEarnings)}
            change={stats.earningsChange}
            icon={DollarSign}
            color="bg-green-500"
            subtitle={`${periodEarnings.length} transactions`}
          />
          <StatCard
            title="Completed Sessions"
            value={stats.completedSessions}
            change={stats.sessionsChange}
            icon={CheckCircle}
            color="bg-indigo-500"
            subtitle={`${stats.completionRate}% completion rate`}
          />
          <StatCard
            title="Avg Rating"
            value={stats.avgRating}
            icon={Star}
            color="bg-yellow-500"
            subtitle={`${stats.totalReviews} total reviews`}
          />
          <StatCard
            title="Active Mentees"
            value={stats.activeMentees}
            icon={Users}
            color="bg-purple-500"
            subtitle={`${stats.totalMentees} total`}
          />
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Total Hours</p>
                <p className="text-lg font-bold text-gray-900">
                  {stats.totalHours}h
                </p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Timer className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Avg Duration</p>
                <p className="text-lg font-bold text-gray-900">
                  {stats.avgSessionDuration}m
                </p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Cancelled</p>
                <p className="text-lg font-bold text-gray-900">
                  {stats.cancelledSessions}
                </p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-teal-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Resources</p>
                <p className="text-lg font-bold text-gray-900">
                  {resources.length}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Monthly Trend - Earnings + Sessions */}
        <Card className="p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Monthly Performance (12 months)
            </h2>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={monthlyTrend}>
                <defs>
                  <linearGradient id="earningsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="shortName" tick={{ fontSize: 12 }} />
                <YAxis
                  yAxisId="left"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(v) => `LSL ${formatNumber(v)}`}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "none",
                    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
                  }}
                  formatter={(v, n) =>
                    n === "earnings" ? [formatCurrency(v), "Earnings"] : [v, n]
                  }
                />
                <Legend />
                <Bar
                  yAxisId="right"
                  dataKey="sessions"
                  name="Sessions"
                  fill="#6366f1"
                  radius={[4, 4, 0, 0]}
                />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="earnings"
                  name="Earnings"
                  stroke="#10b981"
                  strokeWidth={2}
                  fill="url(#earningsGrad)"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="rating"
                  name="Rating"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Session Status Distribution */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              Session Status
            </h2>
            {statusDistribution.length === 0 ? (
              <div className="text-center py-12">
                <PieChart className="w-12 h-12 text-gray-300 mx-auto" />
                <p className="mt-3 text-gray-500">
                  No session data in this period
                </p>
              </div>
            ) : (
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={statusDistribution}
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                      innerRadius={55}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {statusDistribution.map((entry, idx) => (
                        <Cell
                          key={idx}
                          fill={CHART_COLORS[idx % CHART_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card>

          {/* Earnings by Type */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              Earnings by Type
            </h2>
            {earningsByType.length === 0 ? (
              <div className="text-center py-12">
                <DollarSign className="w-12 h-12 text-gray-300 mx-auto" />
                <p className="mt-3 text-gray-500">No earnings in this period</p>
              </div>
            ) : (
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={earningsByType}
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                      innerRadius={55}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {earningsByType.map((entry, idx) => (
                        <Cell
                          key={idx}
                          fill={CHART_COLORS[(idx + 2) % CHART_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => formatCurrency(v)} />
                    <Legend />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Rating Distribution */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              Rating Distribution
            </h2>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ratingDistribution} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis type="number" tick={{ fontSize: 12 }} />
                  <YAxis
                    dataKey="name"
                    type="category"
                    tick={{ fontSize: 12 }}
                    width={80}
                  />
                  <Tooltip />
                  <Bar dataKey="count" name="Reviews" radius={[0, 4, 4, 0]}>
                    {ratingDistribution.map((entry, idx) => (
                      <Cell key={idx} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Top Mentees */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              Top Mentees
            </h2>
            {topMentees.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-gray-300 mx-auto" />
                <p className="mt-3 text-gray-500">
                  No mentee activity in this period
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {topMentees.map((mentee, idx) => (
                  <div
                    key={mentee.id}
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-semibold text-xs">
                      #{idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm truncate">
                        {mentee.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {mentee.sessions} sessions · {mentee.completed}{" "}
                        completed
                      </p>
                    </div>
                    <div className="flex-1 max-w-[120px]">
                      <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-600 rounded-full"
                          style={{
                            width: `${(mentee.sessions / topMentees[0].sessions) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Session Heatmap */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Session Activity Heatmap
            </h2>
            <p className="text-sm text-gray-500">Sessions by day and hour</p>
          </div>
          <div className="overflow-x-auto">
            <div className="min-w-[800px]">
              <div className="flex">
                <div className="w-12 flex-shrink-0" />
                {sessionHeatmap.hours.map((h) => (
                  <div
                    key={h}
                    className="flex-1 text-center text-xs text-gray-500 py-2"
                  >
                    {h}:00
                  </div>
                ))}
              </div>
              {sessionHeatmap.days.map((day, dIdx) => (
                <div key={day} className="flex items-center">
                  <div className="w-12 flex-shrink-0 text-xs font-medium text-gray-600 text-right pr-2">
                    {day}
                  </div>
                  {sessionHeatmap.grid[dIdx].hours.map((count, hIdx) => {
                    const intensity = count / sessionHeatmap.max;
                    return (
                      <div key={hIdx} className="flex-1 px-0.5">
                        <div
                          className="h-8 rounded"
                          style={{
                            backgroundColor:
                              count === 0
                                ? "#f3f4f6"
                                : `rgba(99, 102, 241, ${0.15 + intensity * 0.85})`,
                          }}
                          title={`${count} sessions at ${sessionHeatmap.hours[hIdx]}:00 on ${day}`}
                        />
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
          <div className="mt-4 flex items-center justify-end space-x-2 text-xs text-gray-500">
            <span>Less</span>
            <div className="w-4 h-4 rounded bg-gray-100" />
            <div
              className="w-4 h-4 rounded"
              style={{ backgroundColor: "rgba(99, 102, 241, 0.3)" }}
            />
            <div
              className="w-4 h-4 rounded"
              style={{ backgroundColor: "rgba(99, 102, 241, 0.6)" }}
            />
            <div className="w-4 h-4 rounded bg-indigo-600" />
            <span>More</span>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default MentorAnalytics;
