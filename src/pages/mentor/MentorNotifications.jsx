import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc,
  query, where, orderBy, limit, onSnapshot, serverTimestamp,
  Timestamp, writeBatch, increment
} from 'firebase/firestore';
import { db, storage, auth } from '../../config/firebase';
import { supabase } from '../../config/supabase';
import { useAuth } from '../../hooks/useAuth';
import {
  Bell, BellRing, BellOff, Check, CheckCheck, X, Trash2, Archive,
  Star, MessageSquare, Calendar, Video, DollarSign, Users, UserPlus,
  UserMinus, Award, Trophy, Crown, Medal, Flame, Zap, Heart,
  ThumbsUp, AlertCircle, Info, HelpCircle, CheckCircle, XCircle,
  Loader2, ChevronLeft, ChevronRight, ChevronDown, ChevronUp,
  MoreVertical, MoreHorizontal, Search, Filter, SlidersHorizontal,
  Settings, RefreshCw, Eye, EyeOff, Pin, Flag, Bookmark, Share2,
  Send, Mail, Phone, MapPin, Globe, Clock, Timer, Hourglass,
  Home, Menu, LogOut, Plus, Edit3, Copy, ExternalLink, ArrowRight,
  ArrowLeft, ArrowUpRight, ArrowDownRight, TrendingUp, TrendingDown,
  BarChart3, PieChart, Activity, Target, Sparkles, Rocket, Lightbulb,
  Briefcase, Building2, Handshake, GraduationCap, BookOpen, FileText,
  Wallet, CreditCard, Banknote, Receipt, PiggyBank, Gift, Package,
  Box, Archive as ArchiveIcon, Folder, FolderOpen, Inbox, Send as SendIcon,
  Shield, Lock, Unlock, Key, Fingerprint, Ban, Slash, Sun, Moon,
  Cloud, CloudRain, Wind, Droplets, Thermometer, Users as UsersIcon,
  User as UserIcon, Calendar as CalendarIcon, CheckSquare, Square as SquareIcon,
  Circle, CircleDot, Dot
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
  format, formatDistanceToNow, isToday, isYesterday, isThisWeek,
  isThisMonth, differenceInDays, differenceInHours
} from 'date-fns';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const cn = (...inputs) => twMerge(clsx(inputs));

const getInitials = (name) => {
  if (!name) return '?';
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
};

const getAvatarColor = (name) => {
  const colors = [
    'bg-red-500', 'bg-orange-500', 'bg-amber-500', 'bg-yellow-500',
    'bg-lime-500', 'bg-green-500', 'bg-emerald-500', 'bg-teal-500',
    'bg-cyan-500', 'bg-sky-500', 'bg-blue-500', 'bg-indigo-500',
    'bg-violet-500', 'bg-purple-500', 'bg-fuchsia-500', 'bg-pink-500', 'bg-rose-500',
  ];
  const index = name?.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) || 0;
  return colors[index % colors.length];
};

const getNotificationConfig = (type) => {
  const configs = {
    session_scheduled: { icon: Calendar, color: 'text-blue-600', bg: 'bg-blue-100', label: 'Session Scheduled' },
    session_reminder: { icon: BellRing, color: 'text-indigo-600', bg: 'bg-indigo-100', label: 'Session Reminder' },
    session_cancelled: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-100', label: 'Session Cancelled' },
    session_completed: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100', label: 'Session Completed' },
    message: { icon: MessageSquare, color: 'text-purple-600', bg: 'bg-purple-100', label: 'New Message' },
    new_mentee: { icon: UserPlus, color: 'text-teal-600', bg: 'bg-teal-100', label: 'New Mentee' },
    mentorship_ended: { icon: UserMinus, color: 'text-orange-600', bg: 'bg-orange-100', label: 'Mentorship Ended' },
    review_received: { icon: Star, color: 'text-yellow-600', bg: 'bg-yellow-100', label: 'New Review' },
    review_response: { icon: MessageSquare, color: 'text-indigo-600', bg: 'bg-indigo-100', label: 'Review Response' },
    payment_received: { icon: DollarSign, color: 'text-green-600', bg: 'bg-green-100', label: 'Payment Received' },
    withdrawal_requested: { icon: Banknote, color: 'text-blue-600', bg: 'bg-blue-100', label: 'Withdrawal Requested' },
    withdrawal_completed: { icon: Wallet, color: 'text-emerald-600', bg: 'bg-emerald-100', label: 'Withdrawal Completed' },
    achievement: { icon: Trophy, color: 'text-yellow-600', bg: 'bg-yellow-100', label: 'Achievement Unlocked' },
    system: { icon: Info, color: 'text-gray-600', bg: 'bg-gray-100', label: 'System' },
    milestone: { icon: Target, color: 'text-purple-600', bg: 'bg-purple-100', label: 'Milestone' },
    subscription: { icon: Crown, color: 'text-amber-600', bg: 'bg-amber-100', label: 'Subscription' },
    payout_processed: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100', label: 'Payout Processed' },
  };
  return configs[type] || configs.system;
};

const groupByDate = (notifications) => {
  const groups = { today: [], yesterday: [], thisWeek: [], thisMonth: [], older: [] };
  notifications.forEach((n) => {
    const date = new Date(n.createdAt);
    if (isToday(date)) groups.today.push(n);
    else if (isYesterday(date)) groups.yesterday.push(n);
    else if (isThisWeek(date)) groups.thisWeek.push(n);
    else if (isThisMonth(date)) groups.thisMonth.push(n);
    else groups.older.push(n);
  });
  return groups;
};

// ============================================================================
// COMPONENTS
// ============================================================================

const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-50">
    <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
  </div>
);

const Avatar = ({ src, name, size = 'md' }) => {
  const sizeClasses = {
    xs: 'w-6 h-6 text-xs', sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
  };
  return (
    <div className="relative inline-block flex-shrink-0">
      {src ? (
        <img src={src} alt={name} className={cn('rounded-full object-cover', sizeClasses[size])}
          onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
      ) : null}
      <div className={cn('rounded-full flex items-center justify-center font-semibold text-white',
        sizeClasses[size], !src ? getAvatarColor(name) : 'hidden')}>
        {getInitials(name)}
      </div>
    </div>
  );
};

const Button = ({ children, variant = 'primary', size = 'md', icon: Icon, loading, className, ...props }) => {
  const variants = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500',
    secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-500',
    outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-indigo-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    ghost: 'text-gray-600 hover:bg-gray-100 focus:ring-gray-500',
  };
  const sizes = { sm: 'px-3 py-1.5 text-sm', md: 'px-4 py-2 text-sm', lg: 'px-6 py-3 text-base' };
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center font-medium rounded-lg transition-colors',
        'focus:outline-none focus:ring-2 focus:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant], sizes[size], className
      )}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> :
        Icon ? <Icon className={cn('w-4 h-4', children && 'mr-2')} /> : null}
      {children}
    </button>
  );
};

const Card = ({ children, className }) => (
  <div className={cn('bg-white rounded-xl shadow-sm border border-gray-200', className)}>
    {children}
  </div>
);

// ============================================================================
// NOTIFICATION ITEM
// ============================================================================

const NotificationItem = ({ notification, onMarkRead, onDelete, onArchive, onClick }) => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);
  const config = getNotificationConfig(notification.type);
  const Icon = config.icon;

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setShowMenu(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className={cn(
        'relative p-4 rounded-lg border transition-all cursor-pointer group',
        notification.read
          ? 'bg-white border-gray-200 hover:border-gray-300'
          : 'bg-indigo-50 border-indigo-200 hover:border-indigo-300'
      )}
      onClick={() => onClick?.(notification)}
    >
      {!notification.read && (
        <div className="absolute left-1.5 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-indigo-600" />
      )}
      <div className="flex items-start space-x-3 pl-3">
        {/* Icon or avatar */}
        {notification.senderAvatar ? (
          <Avatar src={notification.senderAvatar} name={notification.senderName} size="md" />
        ) : (
          <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0', config.bg)}>
            <Icon className={cn('w-5 h-5', config.color)} />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <p className={cn(
                'text-sm',
                notification.read ? 'text-gray-700' : 'text-gray-900 font-semibold'
              )}>
                {notification.title || config.label}
              </p>
              <p className="text-sm text-gray-600 mt-0.5 line-clamp-2">
                {notification.message}
              </p>
              <div className="flex items-center mt-1.5 space-x-3 text-xs text-gray-500">
                <span className="flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                </span>
                <span className={cn('px-1.5 py-0.5 rounded text-xs font-medium',
                  config.bg, config.color)}>
                  {config.label}
                </span>
              </div>
            </div>

            <div className="relative ml-2" ref={menuRef}>
              <button
                onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
                className="p-1.5 rounded-lg hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreVertical className="w-4 h-4 text-gray-500" />
              </button>
              <AnimatePresence>
                {showMenu && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="absolute right-0 mt-1 w-44 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20"
                  >
                    {!notification.read && (
                      <button
                        onClick={(e) => { e.stopPropagation(); onMarkRead(notification.id); setShowMenu(false); }}
                        className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <Check className="w-4 h-4 mr-2" /> Mark as read
                      </button>
                    )}
                    <button
                      onClick={(e) => { e.stopPropagation(); onArchive(notification.id); setShowMenu(false); }}
                      className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <Archive className="w-4 h-4 mr-2" /> Archive
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); onDelete(notification.id); setShowMenu(false); }}
                      className="w-full flex items-center px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4 mr-2" /> Delete
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const MentorNotifications = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // all, unread, archived
  const [typeFilter, setTypeFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [bulkMode, setBulkMode] = useState(false);

  const mentorId = user?.uid;

  // Fetch notifications
  useEffect(() => {
    if (!mentorId) return;

    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', mentorId),
      orderBy('createdAt', 'desc'),
      limit(200)
    );

    const unsub = onSnapshot(q, (snap) => {
      setNotifications(snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
        createdAt: d.data().createdAt?.toDate?.() || new Date(d.data().createdAt || 0),
      })));
      setLoading(false);
    }, (err) => {
      console.error('Notifications error:', err);
      setLoading(false);
    });

    return () => unsub();
  }, [mentorId]);

  // Stats
  const stats = useMemo(() => {
    const unread = notifications.filter((n) => !n.read && !n.archived).length;
    const archived = notifications.filter((n) => n.archived).length;
    const today = notifications.filter((n) => !n.archived && isToday(new Date(n.createdAt))).length;
    return { total: notifications.length, unread, archived, today };
  }, [notifications]);

  // Filtered
  const filtered = useMemo(() => {
    let result = [...notifications];

    if (activeTab === 'unread') result = result.filter((n) => !n.read && !n.archived);
    else if (activeTab === 'archived') result = result.filter((n) => n.archived);
    else result = result.filter((n) => !n.archived);

    if (typeFilter !== 'all') result = result.filter((n) => n.type === typeFilter);

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (n) =>
          n.title?.toLowerCase().includes(term) ||
          n.message?.toLowerCase().includes(term)
      );
    }

    return result;
  }, [notifications, activeTab, typeFilter, searchTerm]);

  // Groups
  const grouped = useMemo(() => groupByDate(filtered), [filtered]);

  // Available types for filter
  const availableTypes = useMemo(() => {
    const set = new Set(notifications.map((n) => n.type).filter(Boolean));
    return Array.from(set);
  }, [notifications]);

  // Handlers
  const handleMarkRead = useCallback(async (id) => {
    try {
      await updateDoc(doc(db, 'notifications', id), { read: true, readAt: serverTimestamp() });
      try {
        await supabase.from('notifications').update({ read: true }).eq('firebase_id', id);
      } catch (e) { /* silent */ }
    } catch (e) {
      toast.error('Failed to mark as read');
    }
  }, []);

  const handleMarkAllRead = useCallback(async () => {
    const unread = notifications.filter((n) => !n.read && !n.archived);
    if (unread.length === 0) { toast.info('No unread notifications'); return; }

    try {
      const batch = writeBatch(db);
      unread.forEach((n) => batch.update(doc(db, 'notifications', n.id), { read: true, readAt: serverTimestamp() }));
      await batch.commit();
      toast.success(`Marked ${unread.length} as read`);
    } catch (e) {
      toast.error('Failed to mark all as read');
    }
  }, [notifications]);

  const handleDelete = useCallback(async (id) => {
    try {
      await deleteDoc(doc(db, 'notifications', id));
      try {
        await supabase.from('notifications').delete().eq('firebase_id', id);
      } catch (e) { /* silent */ }
      toast.success('Notification deleted');
    } catch (e) {
      toast.error('Failed to delete');
    }
  }, []);

  const handleArchive = useCallback(async (id) => {
    try {
      await updateDoc(doc(db, 'notifications', id), { archived: true, archivedAt: serverTimestamp() });
      toast.success('Archived');
    } catch (e) {
      toast.error('Failed to archive');
    }
  }, []);

  const handleBulkAction = useCallback(async (action) => {
    if (selectedIds.size === 0) return;

    try {
      const batch = writeBatch(db);
      selectedIds.forEach((id) => {
        const ref = doc(db, 'notifications', id);
        if (action === 'read') batch.update(ref, { read: true });
        else if (action === 'archive') batch.update(ref, { archived: true });
        else if (action === 'delete') batch.delete(ref);
      });
      await batch.commit();
      toast.success(`${selectedIds.size} notification(s) updated`);
      setSelectedIds(new Set());
      setBulkMode(false);
    } catch (e) {
      toast.error('Bulk action failed');
    }
  }, [selectedIds]);

  const toggleSelect = useCallback((id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleNotificationClick = useCallback(async (notification) => {
    if (!notification.read) await handleMarkRead(notification.id);
    if (notification.link) navigate(notification.link);
    else if (notification.conversationId) navigate(`/mentor/messages/${notification.conversationId}`);
    else if (notification.sessionId) navigate('/mentor/sessions');
    else if (notification.type === 'review_received' || notification.type === 'review_response') navigate('/mentor/reviews');
    else if (notification.type === 'withdrawal_completed' || notification.type === 'payment_received' || notification.type === 'payout_processed') navigate('/mentor/earnings');
  }, [handleMarkRead, navigate]);

  const handleClearAll = useCallback(async () => {
    if (!window.confirm('Delete all notifications? This cannot be undone.')) return;
    try {
      const batch = writeBatch(db);
      filtered.forEach((n) => batch.delete(doc(db, 'notifications', n.id)));
      await batch.commit();
      toast.success('All notifications cleared');
    } catch (e) {
      toast.error('Failed to clear notifications');
    }
  }, [filtered]);

  if (authLoading || loading) return <LoadingSpinner />;
  if (!user) { navigate('/login'); return null; }

  const tabs = [
    { id: 'all', label: 'All', count: notifications.filter((n) => !n.archived).length },
    { id: 'unread', label: 'Unread', count: stats.unread },
    { id: 'archived', label: 'Archived', count: stats.archived },
  ];

  const groupedSections = [
    { key: 'today', label: 'Today', items: grouped.today },
    { key: 'yesterday', label: 'Yesterday', items: grouped.yesterday },
    { key: 'thisWeek', label: 'This Week', items: grouped.thisWeek },
    { key: 'thisMonth', label: 'This Month', items: grouped.thisMonth },
    { key: 'older', label: 'Older', items: grouped.older },
  ].filter((g) => g.items.length > 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link to="/mentor/dashboard" className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </Link>
              <h1 className="text-lg font-semibold text-gray-900 flex items-center">
                Notifications
                {stats.unread > 0 && (
                  <span className="ml-2 px-2 py-0.5 bg-red-500 text-white text-xs font-semibold rounded-full">
                    {stats.unread}
                  </span>
                )}
              </h1>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" onClick={() => setBulkMode(!bulkMode)}>
                {bulkMode ? 'Cancel' : 'Select'}
              </Button>
              {stats.unread > 0 && (
                <Button variant="outline" size="sm" icon={CheckCheck} onClick={handleMarkAllRead}>
                  Mark all read
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase">Total</p>
                <p className="mt-1 text-xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="w-9 h-9 bg-indigo-100 rounded-lg flex items-center justify-center">
                <Bell className="w-4 h-4 text-indigo-600" />
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase">Unread</p>
                <p className="mt-1 text-xl font-bold text-red-600">{stats.unread}</p>
              </div>
              <div className="w-9 h-9 bg-red-100 rounded-lg flex items-center justify-center">
                <BellRing className="w-4 h-4 text-red-600" />
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase">Today</p>
                <p className="mt-1 text-xl font-bold text-blue-600">{stats.today}</p>
              </div>
              <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center">
                <Clock className="w-4 h-4 text-blue-600" />
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase">Archived</p>
                <p className="mt-1 text-xl font-bold text-gray-600">{stats.archived}</p>
              </div>
              <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center">
                <Archive className="w-4 h-4 text-gray-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center space-x-1 overflow-x-auto">
              {tabs.map((t) => (
                <button key={t.id} onClick={() => setActiveTab(t.id)}
                  className={cn(
                    'flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap',
                    activeTab === t.id ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-100'
                  )}>
                  <span>{t.label}</span>
                  <span className={cn('px-1.5 py-0.5 text-xs rounded-full',
                    activeTab === t.id ? 'bg-white bg-opacity-20' : 'bg-gray-200')}>
                    {t.count}
                  </span>
                </button>
              ))}
            </div>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm w-44"
                />
              </div>
              <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm">
                <option value="all">All Types</option>
                {availableTypes.map((t) => (
                  <option key={t} value={t}>{getNotificationConfig(t).label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Bulk actions */}
          <AnimatePresence>
            {bulkMode && selectedIds.size > 0 && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-3 pt-3 border-t border-gray-200 flex items-center justify-between">
                  <p className="text-sm text-gray-600">{selectedIds.size} selected</p>
                  <div className="flex items-center space-x-2">
                    <Button size="sm" variant="outline" icon={Check} onClick={() => handleBulkAction('read')}>Mark Read</Button>
                    <Button size="sm" variant="outline" icon={Archive} onClick={() => handleBulkAction('archive')}>Archive</Button>
                    <Button size="sm" variant="danger" icon={Trash2} onClick={() => handleBulkAction('delete')}>Delete</Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>

        {/* Notification List */}
        {filtered.length === 0 ? (
          <Card className="p-12">
            <div className="text-center">
              <BellOff className="w-16 h-16 text-gray-300 mx-auto" />
              <h3 className="mt-4 text-lg font-semibold text-gray-900">
                {activeTab === 'unread' ? 'No unread notifications' :
                 activeTab === 'archived' ? 'No archived notifications' :
                 searchTerm ? 'No matching notifications' :
                 'No notifications yet'}
              </h3>
              <p className="mt-2 text-gray-500">
                You're all caught up! New notifications will appear here.
              </p>
            </div>
          </Card>
        ) : (
          <div className="space-y-6">
            {groupedSections.map((section) => (
              <div key={section.key}>
                <div className="flex items-center space-x-3 mb-3">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                    {section.label}
                  </h3>
                  <div className="flex-1 h-px bg-gray-200" />
                  <span className="text-xs text-gray-400">{section.items.length}</span>
                </div>
                <div className="space-y-2">
                  {section.items.map((n) => (
                    <div key={n.id} className="flex items-start space-x-2">
                      {bulkMode && (
                        <button onClick={() => toggleSelect(n.id)}
                          className="mt-4 p-0.5 flex-shrink-0">
                          {selectedIds.has(n.id) ? (
                            <CheckSquare className="w-5 h-5 text-indigo-600" />
                          ) : (
                            <SquareIcon className="w-5 h-5 text-gray-400" />
                          )}
                        </button>
                      )}
                      <div className="flex-1">
                        <NotificationItem
                          notification={n}
                          onMarkRead={handleMarkRead}
                          onDelete={handleDelete}
                          onArchive={handleArchive}
                          onClick={handleNotificationClick}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Clear all button */}
            {filtered.length > 5 && (
              <div className="flex justify-center pt-4">
                <Button variant="ghost" size="sm" icon={Trash2} onClick={handleClearAll}>
                  Clear all {filtered.length} notifications
                </Button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default MentorNotifications;