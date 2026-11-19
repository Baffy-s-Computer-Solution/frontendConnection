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
  onSnapshot,
  serverTimestamp,
  Timestamp,
  writeBatch,
  increment,
} from "firebase/firestore";
import { db, storage, auth } from "../../config/firebase";
import { supabase } from "../../config/supabase";
import { useAuth } from "../../hooks/useAuth";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Wallet,
  CreditCard,
  Banknote,
  Receipt,
  FileText,
  Download,
  Upload,
  Calendar,
  Clock,
  Users,
  Star,
  BarChart3,
  PieChart,
  LineChart,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Filter,
  Search,
  Plus,
  Edit3,
  Trash2,
  Eye,
  EyeOff,
  Copy,
  Check,
  X,
  Loader2,
  AlertCircle,
  CheckCircle,
  XCircle,
  Info,
  HelpCircle,
  Settings,
  Bell,
  RefreshCw,
  ExternalLink,
  MoreVertical,
  MoreHorizontal,
  Menu,
  Home,
  LogOut,
  Building2,
  Briefcase,
  GraduationCap,
  Award,
  Trophy,
  Crown,
  Medal,
  Flame,
  Zap,
  Sparkles,
  Target,
  Rocket,
  PiggyBank,
  Coins,
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
  Shield,
  Lock,
  Unlock,
  Key,
  Fingerprint,
  Globe,
  MapPin,
  Phone,
  Mail,
  Link as LinkIcon,
  Share2,
  Bookmark,
  Tag,
  Hash,
  AtSign,
  Percent,
  Euro,
  PoundSterling,
  JapaneseYen,
  IndianRupee,
  Bitcoin,
  ArrowRight,
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  Minus,
  Plus as PlusIcon,
  Equal,
  Divide,
  X as XIcon,
  Percent as PercentIcon,
  Calculator,
  Scale,
  Ruler,
  Timer,
  Hourglass,
  History,
  RotateCcw,
  Play,
  Pause,
  Square,
  Volume2,
  VolumeX,
  Microscope,
  Beaker,
  FlaskConical,
  Atom,
  Dna,
  Brain,
  Heart,
  Stethoscope,
  Syringe,
  Pill,
  Bone,
  Eye as EyeIcon2,
  Ear,
  Hand,
  Footprints,
  Footprints as FootIcon,
} from "lucide-react";
import {
  LineChart as RechartsLineChart,
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
  Funnel,
  FunnelChart,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Treemap,
  Sankey,
  SunburstChart,
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
  startOfYear,
  endOfYear,
  subYears,
  addYears,
  startOfWeek,
  endOfWeek,
  subWeeks,
  addWeeks,
  startOfDay,
  endOfDay,
  subDays,
  addDays,
  isSameMonth,
  isSameYear,
  isSameDay,
  parseISO,
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

const formatNumber = (num) => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num?.toString() || "0";
};

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

const getTransactionStatusColor = (status) => {
  const colors = {
    completed: "bg-green-100 text-green-800",
    pending: "bg-yellow-100 text-yellow-800",
    processing: "bg-blue-100 text-blue-800",
    failed: "bg-red-100 text-red-800",
    refunded: "bg-purple-100 text-purple-800",
    cancelled: "bg-gray-100 text-gray-800",
  };
  return colors[status] || "bg-gray-100 text-gray-800";
};

const getTransactionTypeColor = (type) => {
  const colors = {
    session_payment: "text-green-600",
    bonus: "text-emerald-600",
    tip: "text-teal-600",
    refund: "text-red-600",
    withdrawal: "text-orange-600",
    fee: "text-gray-600",
    subscription: "text-blue-600",
  };
  return colors[type] || "text-gray-600";
};

// ============================================================================
// CUSTOM HOOKS
// ============================================================================

const useEarningsData = (mentorId, dateRange = "month") => {
  const [data, setData] = useState({
    transactions: [],
    earnings: null,
    payouts: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!mentorId) {
      setData((prev) => ({ ...prev, loading: false }));
      return undefined;
    }
    setData((prev) => ({ ...prev, loading: true, error: null }));

    const unsubscribers = [];

    const txQuery = query(
      collection(db, "mentorTransactions"),
      where("mentorId", "==", mentorId),
    );
    const txUnsub = onSnapshot(
      txQuery,
      (snapshot) => {
        const transactions = snapshot.docs
          .map((transactionDoc) => {
            const transaction = transactionDoc.data();
            return {
              id: transactionDoc.id,
              ...transaction,
              createdAt:
                transaction.createdAt?.toDate?.() ||
                (transaction.createdAt
                  ? new Date(transaction.createdAt)
                  : null),
            };
          })
          .sort(
            (left, right) =>
              (right.createdAt?.getTime() || 0) -
              (left.createdAt?.getTime() || 0),
          );
        setData((prev) => ({ ...prev, transactions, loading: false }));
      },
      (error) => {
        console.error("Transactions error:", error);
        setData((prev) => ({ ...prev, error: error.message, loading: false }));
      },
    );
    unsubscribers.push(txUnsub);

    const earningsUnsub = onSnapshot(
      doc(db, "mentorEarnings", mentorId),
      (snapshot) => {
        setData((prev) => ({
          ...prev,
          earnings: snapshot.exists() ? snapshot.data() : null,
        }));
      },
      (error) => {
        console.error("Earnings summary error:", error);
        setData((prev) => ({
          ...prev,
          error: `Earnings summary: ${error.message}`,
          loading: false,
        }));
      },
    );
    unsubscribers.push(earningsUnsub);

    const payoutsQuery = query(
      collection(db, "mentorPayouts"),
      where("mentorId", "==", mentorId),
    );
    const payoutsUnsub = onSnapshot(
      payoutsQuery,
      (snapshot) => {
        const payouts = snapshot.docs
          .map((payoutDoc) => {
            const payout = payoutDoc.data();
            return {
              id: payoutDoc.id,
              ...payout,
              createdAt:
                payout.createdAt?.toDate?.() ||
                (payout.createdAt ? new Date(payout.createdAt) : null),
            };
          })
          .sort(
            (left, right) =>
              (right.createdAt?.getTime() || 0) -
              (left.createdAt?.getTime() || 0),
          );
        setData((prev) => ({ ...prev, payouts }));
      },
      (error) => {
        console.error("Payouts error:", error);
        setData((prev) => ({
          ...prev,
          error: `Payouts: ${error.message}`,
          loading: false,
        }));
      },
    );
    unsubscribers.push(payoutsUnsub);

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
      <p className="mt-4 text-gray-600 font-medium">Loading earnings...</p>
    </div>
  </div>
);

const Avatar = ({ src, name, size = "md" }) => {
  const sizeClasses = {
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
    </div>
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

const StatCard = ({ title, value, change, icon: Icon, color, subtitle }) => {
  const isPositive = change >= 0;
  return (
    <Card className="p-6">
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
              <span className="text-sm text-gray-500">vs last period</span>
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
// WITHDRAWAL MODAL
// ============================================================================

const WithdrawalModal = ({ isOpen, onClose, availableBalance, onWithdraw }) => {
  const [formData, setFormData] = useState({
    amount: "",
    method: "bank_transfer",
    accountName: "",
    accountNumber: "",
    routingNumber: "",
    bankName: "",
    paypalEmail: "",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const methods = [
    { value: "bank_transfer", label: "Bank Transfer", icon: Building2 },
    { value: "paypal", label: "PayPal", icon: DollarSign },
    { value: "stripe", label: "Stripe", icon: CreditCard },
    { value: "wise", label: "Wise", icon: Globe },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    const amount = parseFloat(formData.amount);

    if (!amount || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    if (amount > availableBalance) {
      toast.error("Insufficient balance");
      return;
    }
    if (amount < 10) {
      toast.error("Minimum withdrawal is LSL 10");
      return;
    }

    setSubmitting(true);
    try {
      await onWithdraw({ ...formData, amount });
      onClose();
      setFormData({
        amount: "",
        method: "bank_transfer",
        accountName: "",
        accountNumber: "",
        routingNumber: "",
        bankName: "",
        paypalEmail: "",
        notes: "",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Withdraw Funds" size="lg">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg p-5 text-white">
          <p className="text-sm opacity-90">Available Balance</p>
          <p className="mt-1 text-3xl font-bold">
            {formatCurrency(availableBalance)}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Amount *
          </label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="number"
              min="10"
              max={availableBalance}
              step="0.01"
              value={formData.amount}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, amount: e.target.value }))
              }
              placeholder="0.00"
              className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-lg font-semibold"
              required
            />
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
            <span>Minimum: LSL 10.00</span>
            <button
              type="button"
              onClick={() =>
                setFormData((prev) => ({
                  ...prev,
                  amount: availableBalance.toString(),
                }))
              }
              className="text-indigo-600 font-medium hover:text-indigo-700"
            >
              Withdraw All
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Withdrawal Method
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {methods.map((method) => (
              <button
                key={method.value}
                type="button"
                onClick={() =>
                  setFormData((prev) => ({ ...prev, method: method.value }))
                }
                className={cn(
                  "flex flex-col items-center p-3 rounded-lg border-2 transition-all",
                  formData.method === method.value
                    ? "border-indigo-500 bg-indigo-50"
                    : "border-gray-200 hover:border-gray-300",
                )}
              >
                <method.icon
                  className={cn(
                    "w-5 h-5 mb-1",
                    formData.method === method.value
                      ? "text-indigo-600"
                      : "text-gray-500",
                  )}
                />
                <span className="text-xs font-medium text-gray-700">
                  {method.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {formData.method === "bank_transfer" && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Account Holder Name
              </label>
              <input
                type="text"
                value={formData.accountName}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    accountName: e.target.value,
                  }))
                }
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bank Name
              </label>
              <input
                type="text"
                value={formData.bankName}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, bankName: e.target.value }))
                }
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Account Number
                </label>
                <input
                  type="text"
                  value={formData.accountNumber}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      accountNumber: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Routing Number
                </label>
                <input
                  type="text"
                  value={formData.routingNumber}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      routingNumber: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
            </div>
          </div>
        )}

        {formData.method === "paypal" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              PayPal Email
            </label>
            <input
              type="email"
              value={formData.paypalEmail}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  paypalEmail: e.target.value,
                }))
              }
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes (optional)
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, notes: e.target.value }))
            }
            rows={2}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
          />
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start space-x-2">
          <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-blue-800">
            Withdrawals are processed within 3-5 business days. A small
            processing fee may apply.
          </p>
        </div>

        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={submitting} icon={Banknote}>
            Withdraw{" "}
            {formData.amount ? formatCurrency(parseFloat(formData.amount)) : ""}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const MentorEarnings = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState("month"); // week, month, quarter, year, all
  const [activeTab, setActiveTab] = useState("overview"); // overview, transactions, payouts
  const [isWithdrawalOpen, setIsWithdrawalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const mentorId = user?.uid;
  const { transactions, earnings, payouts, loading, error } = useEarningsData(
    mentorId,
    dateRange,
  );

  // Calculate stats
  const stats = useMemo(() => {
    const now = new Date();
    const periodStart = {
      week: startOfWeek(now),
      month: startOfMonth(now),
      quarter: startOfMonth(subMonths(now, 2)),
      year: startOfYear(now),
      all: new Date(0),
    }[dateRange];

    const periodTx = transactions.filter(
      (t) => new Date(t.createdAt) >= periodStart,
    );
    const completedTx = periodTx.filter((t) => t.status === "completed");
    const totalEarnings = completedTx
      .filter((t) => t.type !== "withdrawal")
      .reduce((sum, t) => sum + (t.amount || 0), 0);
    const totalWithdrawals = completedTx
      .filter((t) => t.type === "withdrawal")
      .reduce((sum, t) => sum + Math.abs(t.amount || 0), 0);
    const pendingAmount = transactions
      .filter((t) => t.status === "pending" && t.type !== "withdrawal")
      .reduce((sum, t) => sum + (t.amount || 0), 0);
    const availableBalance = earnings?.availableBalance || 0;

    return {
      totalEarnings,
      totalWithdrawals,
      pendingAmount,
      availableBalance,
      transactionCount: periodTx.length,
      completedCount: completedTx.length,
      lifetimeEarnings: earnings?.lifetimeEarnings || 0,
      lifetimeWithdrawals: earnings?.lifetimeWithdrawals || 0,
    };
  }, [transactions, dateRange, earnings]);

  // Chart data - earnings over time
  const earningsChartData = useMemo(() => {
    const now = new Date();
    const months = dateRange === "week" ? 7 : dateRange === "month" ? 30 : 12;
    const data = [];

    if (dateRange === "week" || dateRange === "month") {
      for (let i = months - 1; i >= 0; i--) {
        const date = subDays(now, i);
        const dayStart = startOfDay(date);
        const dayEnd = endOfDay(date);
        const dayTx = transactions.filter((t) => {
          const d = new Date(t.createdAt);
          return (
            d >= dayStart &&
            d <= dayEnd &&
            t.type !== "withdrawal" &&
            t.status === "completed"
          );
        });
        data.push({
          name: format(date, "MMM d"),
          amount: dayTx.reduce((sum, t) => sum + (t.amount || 0), 0),
        });
      }
    } else {
      for (let i = months - 1; i >= 0; i--) {
        const date = subMonths(now, i);
        const monthStart = startOfMonth(date);
        const monthEnd = endOfMonth(date);
        const monthTx = transactions.filter((t) => {
          const d = new Date(t.createdAt);
          return (
            d >= monthStart &&
            d <= monthEnd &&
            t.type !== "withdrawal" &&
            t.status === "completed"
          );
        });
        data.push({
          name: format(date, "MMM yyyy"),
          amount: monthTx.reduce((sum, t) => sum + (t.amount || 0), 0),
        });
      }
    }

    return data;
  }, [transactions, dateRange]);

  // Breakdown by type
  const breakdownData = useMemo(() => {
    const byType = {};
    transactions
      .filter((t) => t.status === "completed" && t.type !== "withdrawal")
      .forEach((t) => {
        byType[t.type] = (byType[t.type] || 0) + (t.amount || 0);
      });
    return Object.entries(byType).map(([name, value]) => ({
      name: name.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase()),
      value,
    }));
  }, [transactions]);

  const COLORS = [
    "#6366f1",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
    "#06b6d4",
  ];

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    let filtered = [...transactions];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.menteeName?.toLowerCase().includes(term) ||
          t.description?.toLowerCase().includes(term) ||
          t.id?.toLowerCase().includes(term),
      );
    }

    if (typeFilter !== "all") {
      filtered = filtered.filter((t) => t.type === typeFilter);
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((t) => t.status === statusFilter);
    }

    return filtered;
  }, [transactions, searchTerm, typeFilter, statusFilter]);

  // Handlers
  const handleWithdraw = useCallback(
    async (data) => {
      if (!mentorId) return;

      try {
        const withdrawalData = {
          mentorId,
          type: "withdrawal",
          amount: -Math.abs(data.amount),
          status: "pending",
          method: data.method,
          paymentDetails: {
            accountName: data.accountName,
            accountNumber: data.accountNumber
              ? `****${data.accountNumber.slice(-4)}`
              : null,
            routingNumber: data.routingNumber,
            bankName: data.bankName,
            paypalEmail: data.paypalEmail,
          },
          notes: data.notes,
          createdAt: serverTimestamp(),
          requestedAt: serverTimestamp(),
        };

        const docRef = await addDoc(
          collection(db, "mentorTransactions"),
          withdrawalData,
        );

        // Update earnings balance (decrement)
        await updateDoc(doc(db, "mentorEarnings", mentorId), {
          availableBalance: increment(-Math.abs(data.amount)),
          pendingWithdrawals: increment(Math.abs(data.amount)),
          updatedAt: serverTimestamp(),
        });

        // Create payout record
        await addDoc(collection(db, "mentorPayouts"), {
          ...withdrawalData,
          transactionId: docRef.id,
          status: "pending",
        });

        // Sync to Supabase
        try {
          await supabase.from("mentor_transactions").insert({
            firebase_id: docRef.id,
            mentor_id: mentorId,
            type: "withdrawal",
            amount: -Math.abs(data.amount),
            status: "pending",
            method: data.method,
            created_at: new Date().toISOString(),
          });
        } catch (supabaseError) {
          console.warn("Supabase sync failed:", supabaseError);
        }

        // Create notification
        await addDoc(collection(db, "notifications"), {
          userId: mentorId,
          type: "withdrawal_requested",
          title: "Withdrawal Requested",
          message: `Your withdrawal of ${formatCurrency(data.amount)} is being processed`,
          read: false,
          createdAt: serverTimestamp(),
        });

        toast.success("Withdrawal request submitted!");
      } catch (error) {
        console.error("Withdrawal error:", error);
        toast.error(
          error?.code === "permission-denied"
            ? "Withdrawal requests are currently restricted by Firebase security rules. Contact support for assistance."
            : error?.message || "Failed to submit withdrawal",
        );
        throw error;
      }
    },
    [mentorId],
  );

  const handleExportCSV = useCallback(() => {
    const headers = [
      "Date",
      "Type",
      "Description",
      "Mentee",
      "Amount",
      "Status",
      "Method",
    ];
    const rows = filteredTransactions.map((t) => [
      format(new Date(t.createdAt), "yyyy-MM-dd HH:mm"),
      t.type,
      t.description || "",
      t.menteeName || "",
      t.amount || 0,
      t.status,
      t.method || "",
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mentor-earnings-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exported!");
  }, [filteredTransactions]);

  if (authLoading || loading) return <LoadingSpinner />;
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center max-w-md mx-auto p-8">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto" />
          <h2 className="mt-4 text-xl font-bold text-gray-900">
            Error loading earnings
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
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "transactions", label: "Transactions", icon: Receipt },
    { id: "payouts", label: "Payouts", icon: Wallet },
  ];

  const dateRanges = [
    { value: "week", label: "This Week" },
    { value: "month", label: "This Month" },
    { value: "quarter", label: "This Quarter" },
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
              <h1 className="text-lg font-semibold text-gray-900">Earnings</h1>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                icon={Download}
                onClick={handleExportCSV}
              >
                Export
              </Button>
              <Button
                size="sm"
                icon={Banknote}
                onClick={() => setIsWithdrawalOpen(true)}
                disabled={stats.availableBalance < 10}
              >
                Withdraw
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Balance Hero */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-8 text-white mb-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-black opacity-10" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-indigo-100 text-sm font-medium">
                Available Balance
              </p>
              <p className="mt-2 text-5xl font-bold">
                {formatCurrency(stats.availableBalance)}
              </p>
              <p className="mt-2 text-indigo-100">
                {stats.pendingAmount > 0 &&
                  `${formatCurrency(stats.pendingAmount)} pending`}
              </p>
            </div>
            <div className="mt-6 md:mt-0 flex items-center space-x-6">
              <div>
                <p className="text-indigo-100 text-sm">Lifetime Earnings</p>
                <p className="mt-1 text-2xl font-bold">
                  {formatCurrency(stats.lifetimeEarnings)}
                </p>
              </div>
              <div className="w-px h-16 bg-white bg-opacity-20" />
              <div>
                <p className="text-indigo-100 text-sm">Total Withdrawn</p>
                <p className="mt-1 text-2xl font-bold">
                  {formatCurrency(stats.lifetimeWithdrawals)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Earnings"
            value={formatCurrency(stats.totalEarnings)}
            change={12}
            icon={TrendingUp}
            color="bg-green-500"
            subtitle={`${stats.completedCount} transactions`}
          />
          <StatCard
            title="Pending"
            value={formatCurrency(stats.pendingAmount)}
            icon={Clock}
            color="bg-yellow-500"
          />
          <StatCard
            title="Withdrawn"
            value={formatCurrency(stats.totalWithdrawals)}
            icon={Banknote}
            color="bg-blue-500"
          />
          <StatCard
            title="Avg/Session"
            value={formatCurrency(
              stats.completedCount > 0
                ? stats.totalEarnings / stats.completedCount
                : 0,
            )}
            icon={Calculator}
            color="bg-purple-500"
          />
        </div>

        {/* Tabs */}
        <div className="flex items-center justify-between mb-6">
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
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
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
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Earnings Chart */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Earnings Trend
              </h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={earningsChartData}>
                    <defs>
                      <linearGradient
                        id="colorEarnings"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#6366f1"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="#6366f1"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis
                      tick={{ fontSize: 12 }}
                      tickFormatter={(v) => `LSL ${formatNumber(v)}`}
                    />
                    <Tooltip
                      formatter={(value) => [formatCurrency(value), "Earnings"]}
                      contentStyle={{
                        borderRadius: "8px",
                        border: "none",
                        boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="amount"
                      stroke="#6366f1"
                      strokeWidth={2}
                      fill="url(#colorEarnings)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Breakdown */}
              <Card className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Earnings Breakdown
                </h2>
                {breakdownData.length === 0 ? (
                  <div className="text-center py-12">
                    <PieChart className="w-12 h-12 text-gray-300 mx-auto" />
                    <p className="mt-3 text-gray-500">No earnings data yet</p>
                  </div>
                ) : (
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={breakdownData}
                          cx="50%"
                          cy="50%"
                          outerRadius={90}
                          innerRadius={50}
                          paddingAngle={5}
                          dataKey="value"
                          label={({ name, percent }) =>
                            `${name} ${(percent * 100).toFixed(0)}%`
                          }
                        >
                          {breakdownData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => formatCurrency(value)} />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </Card>

              {/* Recent Transactions */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Recent Transactions
                  </h2>
                  <button
                    onClick={() => setActiveTab("transactions")}
                    className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
                  >
                    View All
                  </button>
                </div>
                {transactions.length === 0 ? (
                  <div className="text-center py-12">
                    <Receipt className="w-12 h-12 text-gray-300 mx-auto" />
                    <p className="mt-3 text-gray-500">No transactions yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {transactions.slice(0, 5).map((tx) => (
                      <div
                        key={tx.id}
                        className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                      >
                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                          <div
                            className={cn(
                              "w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0",
                              tx.type === "withdrawal"
                                ? "bg-orange-100"
                                : tx.amount > 0
                                  ? "bg-green-100"
                                  : "bg-red-100",
                            )}
                          >
                            {tx.type === "withdrawal" ? (
                              <Banknote className="w-4 h-4 text-orange-600" />
                            ) : tx.amount > 0 ? (
                              <ArrowUpRight className="w-4 h-4 text-green-600" />
                            ) : (
                              <ArrowDownRight className="w-4 h-4 text-red-600" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 text-sm truncate">
                              {tx.description ||
                                tx.type?.replace("_", " ") ||
                                "Transaction"}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatDistanceToNow(new Date(tx.createdAt), {
                                addSuffix: true,
                              })}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p
                            className={cn(
                              "font-semibold",
                              tx.amount > 0
                                ? "text-green-600"
                                : "text-gray-900",
                            )}
                          >
                            {tx.amount > 0 ? "+" : ""}
                            {formatCurrency(tx.amount)}
                          </p>
                          <span
                            className={cn(
                              "inline-block px-1.5 py-0.5 text-xs rounded-full",
                              getTransactionStatusColor(tx.status),
                            )}
                          >
                            {tx.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          </div>
        )}

        {/* Transactions Tab */}
        {activeTab === "transactions" && (
          <Card className="overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  All Transactions
                </h2>
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm w-48"
                    />
                  </div>
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  >
                    <option value="all">All Types</option>
                    <option value="session_payment">Session Payment</option>
                    <option value="bonus">Bonus</option>
                    <option value="tip">Tip</option>
                    <option value="withdrawal">Withdrawal</option>
                    <option value="refund">Refund</option>
                  </select>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  >
                    <option value="all">All Status</option>
                    <option value="completed">Completed</option>
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>
              </div>
            </div>

            {filteredTransactions.length === 0 ? (
              <div className="text-center py-12">
                <Receipt className="w-12 h-12 text-gray-300 mx-auto" />
                <p className="mt-3 text-gray-500">No transactions found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Mentee
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {filteredTransactions.map((tx) => (
                      <tr
                        key={tx.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {format(new Date(tx.createdAt), "MMM d, yyyy")}
                          <p className="text-xs text-gray-400">
                            {format(new Date(tx.createdAt), "h:mm a")}
                          </p>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {tx.description ||
                            tx.type?.replace(/_/g, " ") ||
                            "Transaction"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {tx.menteeName ? (
                            <div className="flex items-center space-x-2">
                              <Avatar
                                src={tx.menteeAvatar}
                                name={tx.menteeName}
                                size="xs"
                              />
                              <span className="text-gray-700">
                                {tx.menteeName}
                              </span>
                            </div>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span
                            className={cn(
                              "font-medium capitalize",
                              getTransactionTypeColor(tx.type),
                            )}
                          >
                            {tx.type?.replace(/_/g, " ")}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={cn(
                              "inline-flex px-2.5 py-1 text-xs font-medium rounded-full",
                              getTransactionStatusColor(tx.status),
                            )}
                          >
                            {tx.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <span
                            className={cn(
                              "font-semibold",
                              tx.amount > 0
                                ? "text-green-600"
                                : "text-gray-900",
                            )}
                          >
                            {tx.amount > 0 ? "+" : ""}
                            {formatCurrency(tx.amount)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        )}

        {/* Payouts Tab */}
        {activeTab === "payouts" && (
          <Card className="overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Payout History
              </h2>
            </div>
            {payouts.length === 0 ? (
              <div className="text-center py-12">
                <Wallet className="w-12 h-12 text-gray-300 mx-auto" />
                <p className="mt-3 text-gray-500">No payouts yet</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {payouts.map((payout) => (
                  <div
                    key={payout.id}
                    className="p-6 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                          <Banknote className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {formatCurrency(Math.abs(payout.amount))}
                          </p>
                          <p className="text-sm text-gray-500">
                            {format(
                              new Date(payout.createdAt),
                              "MMM d, yyyy h:mm a",
                            )}
                          </p>
                          <p className="text-xs text-gray-400 capitalize">
                            {payout.method?.replace("_", " ")}
                          </p>
                        </div>
                      </div>
                      <span
                        className={cn(
                          "px-3 py-1 text-xs font-medium rounded-full",
                          getTransactionStatusColor(payout.status),
                        )}
                      >
                        {payout.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}
      </main>

      <WithdrawalModal
        isOpen={isWithdrawalOpen}
        onClose={() => setIsWithdrawalOpen(false)}
        availableBalance={stats.availableBalance}
        onWithdraw={handleWithdraw}
      />
    </div>
  );
};

export default MentorEarnings;
