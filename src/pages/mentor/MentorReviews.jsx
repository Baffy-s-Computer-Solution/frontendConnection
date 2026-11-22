import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  collection, doc, getDoc, getDocs, addDoc, updateDoc,
  query, where, orderBy, limit, onSnapshot, serverTimestamp,
  Timestamp, writeBatch, runTransaction
} from 'firebase/firestore';
import { db, storage, auth } from '../../config/firebase';
import { supabase } from '../../config/supabase';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../context/ThemeContext';
import './MentorReviews.css';
import {
  Star, MessageSquare, ThumbsUp, ThumbsDown, Award, Trophy, Crown,
  Medal, Flame, Zap, Sparkles, Target, TrendingUp, BarChart3, PieChart,
  Activity, Filter, Search, ChevronLeft, ChevronRight, ChevronDown,
  ChevronUp, MoreVertical, MoreHorizontal, Loader2, AlertCircle,
  CheckCircle, XCircle, Info, HelpCircle, Settings, Bell, RefreshCw,
  ExternalLink, Reply, Flag, Edit3, Copy, Check, X, Send,
  User as UserIcon, Users, Calendar, Clock, Video, Briefcase,
  GraduationCap, Building2, Heart, Share2, Bookmark, Eye, EyeOff,
  Download, Upload, FileText, Image as ImageIcon, Link as LinkIcon,
  DollarSign, Gift, Hash, AtSign, Percent, Smile, Frown, Meh,
  Sun, Moon, Cloud, CloudRain, Wind, Droplets, Thermometer,
  Menu, Home, LogOut, ArrowRight, ArrowLeft, ArrowUpRight, ArrowDownRight,
  Shield, Lock, Unlock, Key, Fingerprint, Globe, MapPin, Phone, Mail
} from 'lucide-react';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  PieChart as RechartsPieChart, Pie, Cell, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  RadialBarChart, RadialBar, RadarChart, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
  format, formatDistanceToNow, differenceInDays, startOfMonth,
  endOfMonth, subMonths, addMonths, startOfYear, endOfYear, subDays
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

const renderStars = (rating, size = 'md') => {
  const sizeClasses = { sm: 'w-3 h-3', md: 'w-4 h-4', lg: 'w-5 h-5', xl: 'w-6 h-6' };
  return [...Array(5)].map((_, i) => (
    <Star
      key={i}
      className={cn(
        sizeClasses[size],
        i < Math.round(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
      )}
    />
  ));
};

// ============================================================================
// COMPONENTS
// ============================================================================

const LoadingSpinner = () => (
  <div className="mentor-reviews-page flex items-center justify-center min-h-screen bg-gray-50">
    <div className="text-center">
      <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto" />
      <p className="mt-4 text-gray-600 font-medium">Loading reviews...</p>
    </div>
  </div>
);

const Avatar = ({ src, name, size = 'md' }) => {
  const sizeClasses = {
    xs: 'w-6 h-6 text-xs', sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base', xl: 'w-16 h-16 text-lg',
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
    success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
    ghost: 'text-gray-600 hover:bg-gray-100 focus:ring-gray-500',
  };
  const sizes = {
    sm: 'px-3 py-1.5 text-sm', md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base', xl: 'px-8 py-4 text-lg',
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

const Card = ({ children, className, onClick, hover = false }) => (
  <div onClick={onClick} className={cn(
    'bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden',
    hover && 'hover:shadow-lg transition-shadow cursor-pointer', className
  )}>
    {children}
  </div>
);

// ============================================================================
// REVIEW CARD
// ============================================================================

const ReviewCard = ({ review, onReply, onFlag, onHelpful, currentUserId, isOwner }) => {
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [replyText, setReplyText] = useState(review.response || '');
  const [submitting, setSubmitting] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [helpfulPending, setHelpfulPending] = useState(false);
  const markedHelpful = Array.isArray(review.helpfulBy) && review.helpfulBy.includes(currentUserId);
  const helpful = Number(review.helpfulCount ?? review.helpfulBy?.length ?? 0);

  const handleSubmitReply = async () => {
    if (!replyText.trim()) return;
    setSubmitting(true);
    try {
      await onReply(review.id, replyText.trim());
      setShowReplyBox(false);
      toast.success('Response posted!');
    } catch (error) {
      toast.error('Failed to post response');
    } finally {
      setSubmitting(false);
    }
  };

  const handleHelpful = async () => {
    if (markedHelpful || helpfulPending) return;
    setHelpfulPending(true);
    try {
      await onHelpful(review.id);
    } catch (error) {
      toast.error('Could not save your helpful vote. Please try again.');
    } finally {
      setHelpfulPending(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4 flex-1 min-w-0">
          <Avatar src={review.reviewerAvatar} name={review.reviewerName} size="lg" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <p className="font-semibold text-gray-900">{review.reviewerName}</p>
                  {review.verified && (
                    <CheckCircle className="w-4 h-4 text-blue-500" title="Verified mentee" />
                  )}
                </div>
                <div className="flex items-center mt-1 space-x-3">
                  <div className="flex items-center">{renderStars(review.rating)}</div>
                  <span className="text-sm text-gray-500">
                    {formatDistanceToNow(new Date(review.createdAt?.toDate?.() || review.createdAt), { addSuffix: true })}
                  </span>
                </div>
              </div>
              {isOwner && (
                <div className="relative">
                  <button
                    onClick={() => setShowMenu(!showMenu)}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <MoreVertical className="w-4 h-4 text-gray-500" />
                  </button>
                  <AnimatePresence>
                    {showMenu && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="absolute right-0 mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20"
                      >
                        <button
                          onClick={() => { onFlag(review.id); setShowMenu(false); }}
                          className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <Flag className="w-4 h-4 mr-2" /> Flag Review
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {review.title && (
              <h3 className="mt-3 font-semibold text-gray-900">{review.title}</h3>
            )}
            <p className="mt-2 text-gray-700 whitespace-pre-wrap">{review.comment}</p>

            {review.tags && review.tags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {review.tags.map((tag, i) => (
                  <span key={i} className="px-2 py-1 bg-indigo-50 text-indigo-700 text-xs font-medium rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {review.response && (
              <div className="mt-4 pl-4 border-l-4 border-indigo-200 bg-indigo-50 rounded-r-lg p-3">
                <div className="flex items-center space-x-2 mb-1">
                  <Crown className="w-3.5 h-3.5 text-indigo-600" />
                  <span className="text-xs font-semibold text-indigo-700">Your Response</span>
                </div>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{review.response}</p>
                {review.respondedAt && (
                  <p className="mt-1 text-xs text-gray-500">
                    Responded {formatDistanceToNow(new Date(review.respondedAt?.toDate?.() || review.respondedAt), { addSuffix: true })}
                  </p>
                )}
              </div>
            )}

            <div className="mt-4 flex items-center space-x-4">
              <button
                onClick={handleHelpful}
                disabled={markedHelpful || helpfulPending}
                className={cn(
                  'flex items-center space-x-1.5 text-sm font-medium transition-colors',
                  markedHelpful ? 'text-indigo-600' : 'text-gray-500 hover:text-indigo-600'
                )}
              >
                <ThumbsUp className={cn('w-4 h-4', markedHelpful && 'fill-current')} />
                <span>Helpful ({helpful})</span>
              </button>
              {isOwner && !review.response && (
                <button
                  onClick={() => setShowReplyBox(!showReplyBox)}
                  className="flex items-center space-x-1.5 text-sm font-medium text-gray-500 hover:text-indigo-600 transition-colors"
                >
                  <Reply className="w-4 h-4" />
                  <span>Reply</span>
                </button>
              )}
              {isOwner && review.response && (
                <button
                  onClick={() => setShowReplyBox(!showReplyBox)}
                  className="flex items-center space-x-1.5 text-sm font-medium text-gray-500 hover:text-indigo-600 transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Edit Response</span>
                </button>
              )}
            </div>

            {showReplyBox && (
              <div className="mt-4">
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Write a professional response..."
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none text-sm"
                />
                <div className="mt-2 flex items-center justify-end space-x-2">
                  <Button size="sm" variant="ghost" onClick={() => setShowReplyBox(false)}>
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    loading={submitting}
                    onClick={handleSubmitReply}
                    icon={Send}
                  >
                    Post Response
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const MentorReviews = () => {
  const { user, loading: authLoading } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [searchTerm, setSearchTerm] = useState('');
  const mentorId = user?.uid;

  // Fetch reviews
  useEffect(() => {
    if (authLoading) return undefined;
    if (!mentorId) {
      setReviews([]);
      setLoadError('Sign in with a mentor account to view reviews.');
      setLoading(false);
      return undefined;
    }

    setLoading(true);
    setLoadError('');

    const q = query(
      collection(db, 'mentorReviews'),
      where('mentorId', '==', mentorId),
      orderBy('createdAt', 'desc')
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || new Date(doc.data().createdAt),
      }));
      setReviews(data);
      setLoading(false);
    }, (error) => {
      console.error('Reviews error:', error);
      setLoadError('Reviews could not be loaded from your account. Please refresh and try again.');
      setLoading(false);
    });

    return () => unsub();
  }, [authLoading, mentorId]);

  // Stats
  const stats = useMemo(() => {
    if (reviews.length === 0) {
      return {
        average: 0, total: 0, distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
        withResponse: 0, withoutResponse: 0, verified: 0,
      };
    }
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((r) => {
      const r5 = Math.round(r.rating);
      if (distribution[r5] !== undefined) distribution[r5]++;
    });
    return {
      average: (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1),
      total: reviews.length,
      distribution,
      withResponse: reviews.filter((r) => r.response).length,
      withoutResponse: reviews.filter((r) => !r.response).length,
      verified: reviews.filter((r) => r.verified).length,
    };
  }, [reviews]);

  // Rating trend over time
  const trendData = useMemo(() => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const date = subMonths(new Date(), i);
      const start = startOfMonth(date);
      const end = endOfMonth(date);
      const monthReviews = reviews.filter((r) => {
        const d = new Date(r.createdAt);
        return d >= start && d <= end;
      });
      const avg = monthReviews.length > 0
        ? monthReviews.reduce((sum, r) => sum + r.rating, 0) / monthReviews.length
        : 0;
      months.push({
        name: format(date, 'MMM'),
        rating: parseFloat(avg.toFixed(1)),
        count: monthReviews.length,
      });
    }
    return months;
  }, [reviews]);

  // Filter reviews
  const filteredReviews = useMemo(() => {
    let filtered = [...reviews];

    if (activeTab === 'unanswered') {
      filtered = filtered.filter((r) => !r.response);
    } else if (activeTab === 'answered') {
      filtered = filtered.filter((r) => r.response);
    }

    if (ratingFilter !== 'all') {
      filtered = filtered.filter((r) => Math.round(r.rating) === parseInt(ratingFilter));
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.reviewerName?.toLowerCase().includes(term) ||
          r.comment?.toLowerCase().includes(term) ||
          r.title?.toLowerCase().includes(term)
      );
    }

    // Sort
    if (sortBy === 'recent') {
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortBy === 'oldest') {
      filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else if (sortBy === 'highest') {
      filtered.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'lowest') {
      filtered.sort((a, b) => a.rating - b.rating);
    } else if (sortBy === 'helpful') {
      filtered.sort((a, b) => (b.helpfulCount || 0) - (a.helpfulCount || 0));
    }

    return filtered;
  }, [reviews, activeTab, ratingFilter, searchTerm, sortBy]);

  // Handlers
  const handleReply = useCallback(async (reviewId, response) => {
    try {
      await updateDoc(doc(db, 'mentorReviews', reviewId), {
        response,
        respondedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // Sync to Supabase
      try {
        await supabase
          .from('mentor_reviews')
          .update({ response, responded_at: new Date().toISOString() })
          .eq('firebase_id', reviewId);
      } catch (supabaseError) {
        console.warn('Supabase sync failed:', supabaseError);
      }

      // Notify reviewer
      const review = reviews.find((r) => r.id === reviewId);
      if (review?.reviewerId) {
        await addDoc(collection(db, 'notifications'), {
          userId: review.reviewerId,
          type: 'review_response',
          title: 'Mentor Responded to Your Review',
          message: `Your mentor has responded to your review`,
          reviewId,
          read: false,
          createdAt: serverTimestamp(),
        });
      }
    } catch (error) {
      console.error('Reply error:', error);
      throw error;
    }
  }, [reviews]);

  const handleFlag = useCallback(async (reviewId) => {
    if (!window.confirm('Flag this review as inappropriate?')) return;
    try {
      await updateDoc(doc(db, 'mentorReviews', reviewId), {
        flagged: true,
        flaggedAt: serverTimestamp(),
        flaggedBy: mentorId,
      });

      try {
        await supabase
          .from('mentor_reviews')
          .update({ flagged: true })
          .eq('firebase_id', reviewId);
      } catch (e) { console.warn('Supabase flag sync failed:', e); }

      toast.success('Review flagged for moderation');
    } catch (error) {
      console.error('Flag error:', error);
      toast.error('Failed to flag review');
    }
  }, [mentorId]);

  const handleHelpful = useCallback(async (reviewId) => {
    if (!mentorId) throw new Error('A signed-in mentor account is required.');
    const reviewRef = doc(db, 'mentorReviews', reviewId);
    await runTransaction(db, async (transaction) => {
      const snapshot = await transaction.get(reviewRef);
      if (!snapshot.exists()) throw new Error('This review is no longer available.');
      const review = snapshot.data();
      const helpfulBy = Array.isArray(review.helpfulBy) ? review.helpfulBy : [];
      if (helpfulBy.includes(mentorId)) return;
      const helpfulCount = Number(review.helpfulCount ?? helpfulBy.length);
      transaction.update(reviewRef, {
        helpfulBy: [...helpfulBy, mentorId],
        helpfulCount: helpfulCount + 1,
      });
    });
  }, [mentorId]);

  if (authLoading || loading) return <LoadingSpinner />;
  if (!user) { navigate('/login'); return null; }

  const tabs = [
    { id: 'all', label: 'All Reviews', count: stats.total },
    { id: 'unanswered', label: 'Needs Response', count: stats.withoutResponse },
    { id: 'answered', label: 'Answered', count: stats.withResponse },
  ];

  const ratingDistributionData = [
    { name: '5 stars', value: stats.distribution[5], color: '#10b981' },
    { name: '4 stars', value: stats.distribution[4], color: '#84cc16' },
    { name: '3 stars', value: stats.distribution[3], color: '#f59e0b' },
    { name: '2 stars', value: stats.distribution[2], color: '#f97316' },
    { name: '1 star', value: stats.distribution[1], color: '#ef4444' },
  ].filter((d) => d.value > 0);

  return (
    <div className="mentor-reviews-page min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link to="/mentor/dashboard" className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </Link>
              <h1 className="text-lg font-semibold text-gray-900">Reviews & Ratings</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Average Rating Card */}
          <Card className="p-6 bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full shadow-sm mb-4">
                <span className="text-3xl font-bold text-gray-900">{stats.average}</span>
              </div>
              <div className="flex items-center justify-center space-x-1 mb-2">
                {renderStars(parseFloat(stats.average) || 0, 'lg')}
              </div>
              <p className="text-sm font-medium text-gray-700">
                Based on {stats.total} review{stats.total !== 1 ? 's' : ''}
              </p>
            </div>
          </Card>

          {/* Rating Distribution */}
          <Card className="p-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Rating Distribution</h3>
            <div className="space-y-2.5">
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = stats.distribution[rating];
                const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;
                return (
                  <button
                    key={rating}
                    onClick={() => setRatingFilter(ratingFilter === String(rating) ? 'all' : String(rating))}
                    className={cn(
                      'w-full flex items-center space-x-3 text-sm transition-opacity',
                      ratingFilter !== 'all' && ratingFilter !== String(rating) && 'opacity-40'
                    )}
                  >
                    <span className="w-3 text-gray-700 font-medium">{rating}</span>
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                        className={cn(
                          'h-full rounded-full',
                          rating === 5 ? 'bg-green-500' :
                          rating === 4 ? 'bg-lime-500' :
                          rating === 3 ? 'bg-yellow-500' :
                          rating === 2 ? 'bg-orange-500' : 'bg-red-500'
                        )}
                      />
                    </div>
                    <span className="w-10 text-right text-gray-500 text-xs">{count}</span>
                  </button>
                );
              })}
            </div>
          </Card>

          {/* Response Rate */}
          <Card className="p-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Response Rate</h3>
            <div className="flex items-center justify-center h-32">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart
                  data={[{
                    name: 'Responded',
                    value: stats.total > 0 ? (stats.withResponse / stats.total) * 100 : 0,
                    fill: '#6366f1',
                  }]}
                  innerRadius="70%"
                  outerRadius="100%"
                  startAngle={90}
                  endAngle={-270}
                >
                  <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                  <RadialBar background dataKey="value" cornerRadius={10} />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="absolute text-center">
                <p className="text-2xl font-bold text-gray-900">
                  {stats.total > 0 ? Math.round((stats.withResponse / stats.total) * 100) : 0}%
                </p>
                <p className="text-xs text-gray-500">Response Rate</p>
              </div>
            </div>
            <div className="mt-2 flex items-center justify-center space-x-4 text-sm">
              <span className="flex items-center text-green-600">
                <CheckCircle className="w-3.5 h-3.5 mr-1" />
                {stats.withResponse} replied
              </span>
              <span className="flex items-center text-orange-600">
                <Clock className="w-3.5 h-3.5 mr-1" />
                {stats.withoutResponse} pending
              </span>
            </div>
          </Card>
        </div>

        {/* Rating Trend */}
        {reviews.length > 0 && (
          <Card className="p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Rating Trend (Last 6 Months)</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="colorRating" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#fbbf24" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#334155' : '#f0f0f0'} />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: isDark ? '#cbd5e1' : '#6b7280' }} />
                  <YAxis domain={[0, 5]} tick={{ fontSize: 12, fill: isDark ? '#cbd5e1' : '#6b7280' }} />
                  <Tooltip
                    formatter={(value, name) => [name === 'rating' ? `${value} ⭐` : value, name === 'rating' ? 'Avg Rating' : 'Reviews']}
                    contentStyle={{
                      borderRadius: '8px',
                      border: `1px solid ${isDark ? '#334155' : '#e5e7eb'}`,
                      backgroundColor: isDark ? '#0f172a' : '#ffffff',
                      color: isDark ? '#f1f5f9' : '#111827',
                      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="rating"
                    stroke="#fbbf24"
                    strokeWidth={2}
                    fill="url(#colorRating)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        )}

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
                    'flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap',
                    activeTab === tab.id
                      ? 'bg-indigo-600 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  )}
                >
                  <span>{tab.label}</span>
                  <span className={cn(
                    'px-1.5 py-0.5 text-xs rounded-full',
                    activeTab === tab.id ? 'bg-white bg-opacity-20' : 'bg-gray-200'
                  )}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Search and Sort */}
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search reviews..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm w-56"
                />
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              >
                <option value="recent">Most Recent</option>
                <option value="oldest">Oldest First</option>
                <option value="highest">Highest Rated</option>
                <option value="lowest">Lowest Rated</option>
                <option value="helpful">Most Helpful</option>
              </select>
            </div>
          </div>

          {/* Active filters */}
          {(ratingFilter !== 'all' || searchTerm) && (
            <div className="mt-4 flex items-center space-x-2">
              <span className="text-sm text-gray-500">Active filters:</span>
              {ratingFilter !== 'all' && (
                <span className="inline-flex items-center px-3 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full">
                  {ratingFilter} star{ratingFilter !== '1' ? 's' : ''}
                  <button onClick={() => setRatingFilter('all')} className="ml-2 hover:opacity-70">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {searchTerm && (
                <span className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-800 text-sm rounded-full">
                  "{searchTerm}"
                  <button onClick={() => setSearchTerm('')} className="ml-2 hover:opacity-70">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>
          )}
        </Card>

        {/* Reviews List */}
        {loadError ? (
          <Card className="p-6" role="alert">
            <div className="flex items-start gap-3 text-red-700 dark:text-red-300">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
              <p>{loadError}</p>
            </div>
          </Card>
        ) : filteredReviews.length === 0 ? (
          <Card className="p-12">
            <div className="text-center">
              <Star className="w-16 h-16 text-gray-300 mx-auto" />
              <h3 className="mt-4 text-lg font-semibold text-gray-900">
                {searchTerm || ratingFilter !== 'all' ? 'No matching reviews' : 'No reviews yet'}
              </h3>
              <p className="mt-2 text-gray-500 max-w-sm mx-auto">
                {searchTerm || ratingFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Reviews from your mentees will appear here.'}
              </p>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredReviews.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                onReply={handleReply}
                onFlag={handleFlag}
                onHelpful={handleHelpful}
                currentUserId={mentorId}
                isOwner={true}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default MentorReviews;
