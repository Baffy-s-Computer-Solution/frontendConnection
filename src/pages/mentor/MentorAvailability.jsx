import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  doc, getDoc, updateDoc, serverTimestamp, collection, addDoc,
  query, where, onSnapshot, deleteDoc, writeBatch, Timestamp
} from 'firebase/firestore';
import { db, auth } from '../../config/firebase';
import { supabase } from '../../config/supabase';
import { useAuth } from '../../hooks/useAuth';
import {
  Calendar, Clock, Plus, Trash2, Edit3, Save, X, Check, Loader2,
  ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Copy, Repeat,
  Globe, MapPin, Info, AlertCircle, HelpCircle, Bell, BellOff,
  Settings, Sun, Moon, Cloud, Wind, Lock, Unlock, Users, User,
  Video, MessageSquare, Coffee, Briefcase, Timer, Hourglass, Zap,
  Sparkles, CheckCircle, XCircle, Ban, Slash, RefreshCw, Filter,
  Search, Eye, EyeOff, Download, Upload, ExternalLink, ArrowRight,
  ArrowLeft, ChevronsLeft, ChevronsRight, MoreVertical, Flag,
  Home, Menu, LogOut, Star, Award, Trophy, Crown, Medal, Flame,
  Activity, TrendingUp, BarChart3, PieChart, Target, Crosshair,
  Compass, Map, Navigation, Anchor, Route, Hash, AtSign, Link as LinkIcon,
  Share2, Bookmark, Tag, DollarSign, CreditCard, Wallet, Receipt
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
  format, addDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth,
  eachDayOfInterval, isSameDay, isToday, isPast, isFuture, addWeeks,
  subWeeks, addMonths, subMonths, getDay, parseISO, setHours, setMinutes
} from 'date-fns';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const cn = (...inputs) => twMerge(clsx(inputs));

const DAYS = [
  { key: 'monday', label: 'Monday', short: 'Mon' },
  { key: 'tuesday', label: 'Tuesday', short: 'Tue' },
  { key: 'wednesday', label: 'Wednesday', short: 'Wed' },
  { key: 'thursday', label: 'Thursday', short: 'Thu' },
  { key: 'friday', label: 'Friday', short: 'Fri' },
  { key: 'saturday', label: 'Saturday', short: 'Sat' },
  { key: 'sunday', label: 'Sunday', short: 'Sun' },
];

const HOURS = Array.from({ length: 24 }, (_, i) => i);

const TIMEZONES = [
  { value: 'America/New_York', label: 'Eastern Time (US & Canada)', short: 'ET' },
  { value: 'America/Chicago', label: 'Central Time (US & Canada)', short: 'CT' },
  { value: 'America/Denver', label: 'Mountain Time (US & Canada)', short: 'MT' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (US & Canada)', short: 'PT' },
  { value: 'Europe/London', label: 'London', short: 'GMT' },
  { value: 'Europe/Paris', label: 'Paris / Berlin / Madrid', short: 'CET' },
  { value: 'Europe/Moscow', label: 'Moscow', short: 'MSK' },
  { value: 'Asia/Dubai', label: 'Dubai', short: 'GST' },
  { value: 'Asia/Kolkata', label: 'Mumbai / Delhi', short: 'IST' },
  { value: 'Asia/Singapore', label: 'Singapore', short: 'SGT' },
  { value: 'Asia/Tokyo', label: 'Tokyo', short: 'JST' },
  { value: 'Asia/Shanghai', label: 'Beijing / Shanghai', short: 'CST' },
  { value: 'Australia/Sydney', label: 'Sydney', short: 'AEDT' },
  { value: 'Pacific/Auckland', label: 'Auckland', short: 'NZDT' },
];

const getLocalTimezone = () => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return 'America/New_York';
  }
};

const formatHour = (h) => {
  if (h === 0) return '12 AM';
  if (h === 12) return '12 PM';
  if (h < 12) return `${h} AM`;
  return `${h - 12} PM`;
};

const SLOT_MINUTES = 60;

// ============================================================================
// COMPONENTS
// ============================================================================

const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-50">
    <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
  </div>
);

const Button = ({ children, variant = 'primary', size = 'md', icon: Icon, loading, className, ...props }) => {
  const variants = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500',
    secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-500',
    outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-indigo-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
    ghost: 'text-gray-600 hover:bg-gray-100 focus:ring-gray-500',
  };
  const sizes = {
    sm: 'px-3 py-1.5 text-sm', md: 'px-4 py-2 text-sm', lg: 'px-6 py-3 text-base',
  };
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

const Card = ({ children, className, onClick }) => (
  <div onClick={onClick} className={cn('bg-white rounded-xl shadow-sm border border-gray-200', className)}>
    {children}
  </div>
);

const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;
  const sizes = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }} onClick={(e) => e.stopPropagation()}
          className={cn('bg-white rounded-xl shadow-xl w-full max-h-[90vh] overflow-y-auto', sizes[size])}
        >
          <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 transition-colors">
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
// WEEKLY SCHEDULE GRID
// ============================================================================

const WeeklyScheduleGrid = ({ availability, onChange }) => {
  const [dragging, setDragging] = useState(false);
  const [dragValue, setDragValue] = useState(true);

  const isSlotAvailable = (dayKey, hour) => {
    return availability?.[dayKey]?.includes(hour) || false;
  };

  const toggleSlot = (dayKey, hour) => {
    const daySlots = availability?.[dayKey] || [];
    const has = daySlots.includes(hour);
    const next = has ? daySlots.filter((h) => h !== hour) : [...daySlots, hour].sort((a, b) => a - b);
    onChange({ ...availability, [dayKey]: next });
  };

  const handleMouseDown = (dayKey, hour) => {
    setDragging(true);
    const has = isSlotAvailable(dayKey, hour);
    setDragValue(!has);
    toggleSlot(dayKey, hour);
  };

  const handleMouseEnter = (dayKey, hour) => {
    if (!dragging) return;
    const has = isSlotAvailable(dayKey, hour);
    if (has !== dragValue) toggleSlot(dayKey, hour);
  };

  useEffect(() => {
    const stop = () => setDragging(false);
    window.addEventListener('mouseup', stop);
    return () => window.removeEventListener('mouseup', stop);
  }, []);

  return (
    <div className="overflow-x-auto select-none">
      <div className="min-w-[900px]">
        {/* Header */}
        <div className="flex">
          <div className="w-20 flex-shrink-0" />
          {DAYS.map((day) => (
            <div key={day.key} className="flex-1 text-center py-3">
              <p className="text-sm font-semibold text-gray-900">{day.short}</p>
            </div>
          ))}
        </div>

        {/* Grid */}
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          {HOURS.map((hour, hIdx) => (
            <div
              key={hour}
              className={cn('flex border-gray-200', hIdx !== HOURS.length - 1 && 'border-b')}
            >
              <div className="w-20 flex-shrink-0 py-2 pr-3 text-right text-xs text-gray-500 font-medium bg-gray-50">
                {formatHour(hour)}
              </div>
              {DAYS.map((day) => {
                const available = isSlotAvailable(day.key, hour);
                return (
                  <button
                    key={`${day.key}-${hour}`}
                    onMouseDown={() => handleMouseDown(day.key, hour)}
                    onMouseEnter={() => handleMouseEnter(day.key, hour)}
                    className={cn(
                      'flex-1 h-8 border-l border-gray-200 transition-colors relative',
                      available
                        ? 'bg-indigo-500 hover:bg-indigo-600'
                        : 'bg-white hover:bg-indigo-50'
                    )}
                    title={`${day.label} ${formatHour(hour)} - ${formatHour(hour + 1)}`}
                  >
                    {available && (
                      <Check className="w-3 h-3 text-white mx-auto" />
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// QUICK PRESETS
// ============================================================================

const QuickPresets = ({ onApply }) => {
  const presets = [
    {
      label: 'Weekdays 9-5',
      icon: Briefcase,
      data: {
        monday: [9, 10, 11, 12, 13, 14, 15, 16],
        tuesday: [9, 10, 11, 12, 13, 14, 15, 16],
        wednesday: [9, 10, 11, 12, 13, 14, 15, 16],
        thursday: [9, 10, 11, 12, 13, 14, 15, 16],
        friday: [9, 10, 11, 12, 13, 14, 15, 16],
      },
    },
    {
      label: 'Weekday Mornings',
      icon: Sun,
      data: {
        monday: [8, 9, 10, 11, 12],
        tuesday: [8, 9, 10, 11, 12],
        wednesday: [8, 9, 10, 11, 12],
        thursday: [8, 9, 10, 11, 12],
        friday: [8, 9, 10, 11, 12],
      },
    },
    {
      label: 'Weekday Evenings',
      icon: Moon,
      data: {
        monday: [17, 18, 19, 20, 21],
        tuesday: [17, 18, 19, 20, 21],
        wednesday: [17, 18, 19, 20, 21],
        thursday: [17, 18, 19, 20, 21],
        friday: [17, 18, 19, 20, 21],
      },
    },
    {
      label: 'Evenings + Weekends',
      icon: Coffee,
      data: {
        monday: [17, 18, 19, 20, 21],
        tuesday: [17, 18, 19, 20, 21],
        wednesday: [17, 18, 19, 20, 21],
        thursday: [17, 18, 19, 20, 21],
        friday: [17, 18, 19, 20, 21],
        saturday: [9, 10, 11, 12, 13, 14, 15, 16, 17, 18],
        sunday: [9, 10, 11, 12, 13, 14, 15, 16, 17, 18],
      },
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {presets.map((preset) => (
        <button
          key={preset.label}
          onClick={() => onApply(preset.data)}
          className="flex flex-col items-center p-3 rounded-lg border-2 border-gray-200 hover:border-indigo-400 hover:bg-indigo-50 transition-all"
        >
          <preset.icon className="w-5 h-5 text-gray-600 mb-1.5" />
          <span className="text-xs font-medium text-gray-700 text-center">{preset.label}</span>
        </button>
      ))}
    </div>
  );
};

// ============================================================================
// BLACKOUT DATES
// ============================================================================

const BlackoutDatesSection = ({ blackouts, onAdd, onRemove }) => {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [formData, setFormData] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    reason: '',
    fullDay: true,
  });

  const handleAdd = async () => {
    if (!formData.date) { toast.error('Select a date'); return; }
    try {
      await onAdd({
        date: formData.date,
        reason: formData.reason || 'Unavailable',
        fullDay: formData.fullDay,
      });
      setIsAddOpen(false);
      setFormData({ date: format(new Date(), 'yyyy-MM-dd'), reason: '', fullDay: true });
    } catch (e) {
      toast.error('Failed to add blackout date');
    }
  };

  const upcoming = blackouts
    .filter((b) => !isPast(parseISO(b.date)))
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Blackout Dates</h3>
          <p className="text-sm text-gray-500">Block specific days when you're unavailable.</p>
        </div>
        <Button size="sm" icon={Plus} onClick={() => setIsAddOpen(true)}>Add Date</Button>
      </div>

      {upcoming.length === 0 ? (
        <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
          <Ban className="w-10 h-10 text-gray-300 mx-auto" />
          <p className="mt-2 text-sm text-gray-500">No blackout dates set</p>
        </div>
      ) : (
        <div className="space-y-2">
          {upcoming.map((b) => (
            <div key={b.id} className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <Ban className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">
                    {format(parseISO(b.date), 'EEEE, MMMM d, yyyy')}
                  </p>
                  <p className="text-xs text-red-600">{b.reason}</p>
                </div>
              </div>
              <button onClick={() => onRemove(b.id)}
                className="p-1.5 rounded-lg hover:bg-red-100 text-red-600 transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Add Blackout Date" size="sm">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              value={formData.date}
              min={format(new Date(), 'yyyy-MM-dd')}
              onChange={(e) => setFormData((p) => ({ ...p, date: e.target.value }))}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
            <input
              type="text"
              value={formData.reason}
              onChange={(e) => setFormData((p) => ({ ...p, reason: e.target.value }))}
              placeholder="e.g., Holiday, Personal leave"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.fullDay}
              onChange={(e) => setFormData((p) => ({ ...p, fullDay: e.target.checked }))}
              className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
            />
            <span className="text-sm text-gray-700">Block the entire day</span>
          </label>
          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-gray-200">
            <Button variant="secondary" size="sm" onClick={() => setIsAddOpen(false)}>Cancel</Button>
            <Button size="sm" onClick={handleAdd}>Add Blackout</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const MentorAvailability = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [availability, setAvailability] = useState({});
  const [timezone, setTimezone] = useState(getLocalTimezone());
  const [slotDuration, setSlotDuration] = useState(60);
  const [bufferMinutes, setBufferMinutes] = useState(15);
  const [maxSessionsPerDay, setMaxSessionsPerDay] = useState(4);
  const [minNoticeHours, setMinNoticeHours] = useState(24);
  const [maxAdvanceDays, setMaxAdvanceDays] = useState(60);
  const [blackouts, setBlackouts] = useState([]);
  const [hasChanges, setHasChanges] = useState(false);

  const mentorId = user?.uid;

  // Load profile & blackouts
  useEffect(() => {
    if (!mentorId) return;

    const unsubs = [];

    unsubs.push(onSnapshot(doc(db, 'mentors', mentorId), (snap) => {
      if (snap.exists()) {
        const d = snap.data();
        setProfile({ id: snap.id, ...d });
        setAvailability(d.availability || {});
        setTimezone(d.timezone || getLocalTimezone());
        setSlotDuration(d.slotDuration || 60);
        setBufferMinutes(d.bufferMinutes || 15);
        setMaxSessionsPerDay(d.maxSessionsPerDay || 4);
        setMinNoticeHours(d.minNoticeHours || 24);
        setMaxAdvanceDays(d.maxAdvanceDays || 60);
      }
      setLoading(false);
    }));

    const blackoutsQuery = query(
      collection(db, 'mentorBlackouts'),
      where('mentorId', '==', mentorId)
    );
    unsubs.push(onSnapshot(blackoutsQuery, (snap) => {
      setBlackouts(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    }));

    return () => unsubs.forEach((u) => u());
  }, [mentorId]);

  // Track changes
  useEffect(() => {
    if (!profile) return;
    const original = JSON.stringify({
      availability: profile.availability || {},
      timezone: profile.timezone,
      slotDuration: profile.slotDuration,
      bufferMinutes: profile.bufferMinutes,
      maxSessionsPerDay: profile.maxSessionsPerDay,
      minNoticeHours: profile.minNoticeHours,
      maxAdvanceDays: profile.maxAdvanceDays,
    });
    const current = JSON.stringify({
      availability, timezone, slotDuration, bufferMinutes,
      maxSessionsPerDay, minNoticeHours, maxAdvanceDays,
    });
    setHasChanges(original !== current);
  }, [availability, timezone, slotDuration, bufferMinutes, maxSessionsPerDay, minNoticeHours, maxAdvanceDays, profile]);

  // Stats
  const stats = useMemo(() => {
    let totalHours = 0;
    const dayCounts = {};
    DAYS.forEach((d) => {
      const count = availability?.[d.key]?.length || 0;
      dayCounts[d.key] = count;
      totalHours += count;
    });
    const activeDays = Object.values(dayCounts).filter((c) => c > 0).length;
    return { totalHours, activeDays, dayCounts, upcomingBlackouts: blackouts.filter((b) => !isPast(parseISO(b.date))).length };
  }, [availability, blackouts]);

  // Chart data
  const weeklyChartData = useMemo(() =>
    DAYS.map((d) => ({
      name: d.short,
      hours: availability?.[d.key]?.length || 0,
    })),
  [availability]);

  // Handlers
  const handleSave = useCallback(async () => {
    if (!mentorId) return;
    setSaving(true);
    try {
      const updates = {
        availability,
        timezone,
        slotDuration,
        bufferMinutes,
        maxSessionsPerDay,
        minNoticeHours,
        maxAdvanceDays,
        updatedAt: serverTimestamp(),
      };

      await updateDoc(doc(db, 'mentors', mentorId), updates);

      try {
        await supabase.from('mentor_profiles').upsert({
          firebase_id: mentorId,
          availability: JSON.stringify(availability),
          timezone,
          slot_duration: slotDuration,
          buffer_minutes: bufferMinutes,
          max_sessions_per_day: maxSessionsPerDay,
          min_notice_hours: minNoticeHours,
          max_advance_days: maxAdvanceDays,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'firebase_id' });
      } catch (e) { console.warn('Supabase sync failed:', e); }

      toast.success('Availability saved!');
      setHasChanges(false);
    } catch (e) {
      console.error(e);
      toast.error('Failed to save availability');
    } finally {
      setSaving(false);
    }
  }, [mentorId, availability, timezone, slotDuration, bufferMinutes, maxSessionsPerDay, minNoticeHours, maxAdvanceDays]);

  const handleAddBlackout = useCallback(async (data) => {
    if (!mentorId) return;
    const ref = await addDoc(collection(db, 'mentorBlackouts'), {
      mentorId,
      ...data,
      createdAt: serverTimestamp(),
    });
    try {
      await supabase.from('mentor_blackouts').insert({
        firebase_id: ref.id,
        mentor_id: mentorId,
        date: data.date,
        reason: data.reason,
        full_day: data.fullDay,
        created_at: new Date().toISOString(),
      });
    } catch (e) { console.warn('Supabase sync failed:', e); }
    toast.success('Blackout date added');
  }, [mentorId]);

  const handleRemoveBlackout = useCallback(async (id) => {
    try {
      await deleteDoc(doc(db, 'mentorBlackouts', id));
      try {
        await supabase.from('mentor_blackouts').delete().eq('firebase_id', id);
      } catch (e) { /* silent */ }
      toast.success('Blackout date removed');
    } catch (e) {
      toast.error('Failed to remove');
    }
  }, []);

  const applyPreset = useCallback((preset) => {
    setAvailability(preset);
    toast.success('Preset applied');
  }, []);

  const clearAll = useCallback(() => {
    if (!window.confirm('Clear all availability?')) return;
    setAvailability({});
  }, []);

  if (authLoading || loading) return <LoadingSpinner />;
  if (!user) { navigate('/login'); return null; }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link to="/mentor/dashboard" className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </Link>
              <h1 className="text-lg font-semibold text-gray-900">Availability</h1>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" onClick={clearAll}>Clear All</Button>
              <Button
                size="sm"
                icon={Save}
                loading={saving}
                disabled={!hasChanges}
                onClick={handleSave}
              >
                {hasChanges ? 'Save Changes' : 'Saved'}
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
                <p className="text-xs font-medium text-gray-500 uppercase">Weekly Hours</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">{stats.totalHours}h</p>
              </div>
              <div className="w-11 h-11 bg-indigo-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-indigo-600" />
              </div>
            </div>
          </Card>
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase">Active Days</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">{stats.activeDays}/7</p>
              </div>
              <div className="w-11 h-11 bg-green-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </Card>
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase">Slot Duration</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">{slotDuration}m</p>
              </div>
              <div className="w-11 h-11 bg-purple-100 rounded-lg flex items-center justify-center">
                <Timer className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </Card>
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase">Blackouts</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">{stats.upcomingBlackouts}</p>
              </div>
              <div className="w-11 h-11 bg-red-100 rounded-lg flex items-center justify-center">
                <Ban className="w-5 h-5 text-red-600" />
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Presets */}
            <Card className="p-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Quick Presets</h3>
                <p className="text-sm text-gray-500">Apply a template to get started quickly.</p>
              </div>
              <QuickPresets onApply={applyPreset} />
            </Card>

            {/* Weekly Grid */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Weekly Schedule</h3>
                  <p className="text-sm text-gray-500">Click and drag to toggle time slots.</p>
                </div>
                <div className="flex items-center space-x-2 text-xs">
                  <div className="flex items-center space-x-1.5">
                    <div className="w-3 h-3 rounded bg-indigo-500" />
                    <span className="text-gray-600">Available</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <div className="w-3 h-3 rounded bg-white border border-gray-300" />
                    <span className="text-gray-600">Unavailable</span>
                  </div>
                </div>
              </div>
              <WeeklyScheduleGrid availability={availability} onChange={setAvailability} />
            </Card>

            {/* Weekly Distribution Chart */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Distribution</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(v) => [`${v} hours`, 'Available']} />
                    <Bar dataKey="hours" fill="#6366f1" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Blackout Dates */}
            <Card className="p-6">
              <BlackoutDatesSection
                blackouts={blackouts}
                onAdd={handleAddBlackout}
                onRemove={handleRemoveBlackout}
              />
            </Card>
          </div>

          {/* Right column */}
          <div className="space-y-6">
            {/* Timezone */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Timezone</h3>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                {TIMEZONES.map((tz) => (
                  <option key={tz.value} value={tz.value}>{tz.label}</option>
                ))}
                {!TIMEZONES.find((t) => t.value === timezone) && (
                  <option value={timezone}>{timezone} (Local)</option>
                )}
              </select>
              <p className="mt-2 text-xs text-gray-500 flex items-center">
                <Globe className="w-3 h-3 mr-1" />
                All times shown in your timezone
              </p>
            </Card>

            {/* Booking Settings */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Slot Duration</label>
                  <select
                    value={slotDuration}
                    onChange={(e) => setSlotDuration(parseInt(e.target.value))}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value={30}>30 minutes</option>
                    <option value={45}>45 minutes</option>
                    <option value={60}>1 hour</option>
                    <option value={90}>1.5 hours</option>
                    <option value={120}>2 hours</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Buffer Between Sessions</label>
                  <select
                    value={bufferMinutes}
                    onChange={(e) => setBufferMinutes(parseInt(e.target.value))}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value={0}>None</option>
                    <option value={5}>5 minutes</option>
                    <option value={10}>10 minutes</option>
                    <option value={15}>15 minutes</option>
                    <option value={30}>30 minutes</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Sessions Per Day</label>
                  <input
                    type="number"
                    min={1}
                    max={12}
                    value={maxSessionsPerDay}
                    onChange={(e) => setMaxSessionsPerDay(parseInt(e.target.value))}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
            </Card>

            {/* Notice Requirements */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Notice Requirements</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Minimum Notice
                  </label>
                  <select
                    value={minNoticeHours}
                    onChange={(e) => setMinNoticeHours(parseInt(e.target.value))}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value={1}>1 hour before</option>
                    <option value={2}>2 hours before</option>
                    <option value={12}>12 hours before</option>
                    <option value={24}>24 hours before</option>
                    <option value={48}>48 hours before</option>
                    <option value={72}>72 hours before</option>
                  </select>
                  <p className="mt-1 text-xs text-gray-500">How far in advance mentees can book</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Maximum Advance Booking
                  </label>
                  <select
                    value={maxAdvanceDays}
                    onChange={(e) => setMaxAdvanceDays(parseInt(e.target.value))}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value={7}>1 week ahead</option>
                    <option value={14}>2 weeks ahead</option>
                    <option value={30}>1 month ahead</option>
                    <option value={60}>2 months ahead</option>
                    <option value={90}>3 months ahead</option>
                    <option value={180}>6 months ahead</option>
                  </select>
                  <p className="mt-1 text-xs text-gray-500">How far out bookings can be made</p>
                </div>
              </div>
            </Card>

            {/* Save bar */}
            {hasChanges && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="sticky bottom-4"
              >
                <Card className="p-4 border-indigo-300 bg-indigo-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Info className="w-4 h-4 text-indigo-600" />
                      <span className="text-sm font-medium text-indigo-900">Unsaved changes</span>
                    </div>
                    <Button size="sm" icon={Save} loading={saving} onClick={handleSave}>
                      Save
                    </Button>
                  </div>
                </Card>
              </motion.div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default MentorAvailability;