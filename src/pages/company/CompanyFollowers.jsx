// src/pages/company/CompanyFollowers.jsx
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { FaUsers, FaUserPlus, FaUserCheck, FaUserMinus, FaUserFriends, FaUserCircle, FaEnvelope, FaPhone, FaMapMarkerAlt, FaGraduationCap, FaBriefcase, FaStar, FaRegStar, FaHeart, FaRegHeart, FaBookmark, FaRegBookmark, FaSearch, FaFilter, FaSort, FaSortAmountDown, FaSortAmountUp, FaEllipsisV, FaEye, FaEyeSlash, FaPaperPlane, FaCommentDots, FaRegCommentDots, FaBell, FaRegBell, FaTimes, FaCheck, FaCheckCircle, FaTimesCircle, FaExclamationTriangle, FaInfoCircle, FaSpinner, FaSync, FaPlus, FaMinus, FaChartLine, FaChartBar, FaChartPie, FaPercentage, FaCalendarAlt, FaClock, FaHistory, FaRegClock, FaDownload, FaFileExport, FaFileImport, FaExternalLinkAlt, FaLinkedin, FaTwitter, FaFacebook, FaInstagram, FaGlobe, FaWifi, FaCircle, FaDotCircle, FaRegCircle, FaArrowUp, FaArrowDown, FaArrowLeft, FaArrowRight, FaChevronLeft, FaChevronRight, FaGripVertical, FaGripHorizontal, FaTh, FaThLarge, FaList, FaThList, FaTable, FaColumns, FaCog, FaSlidersH, FaToggleOn, FaToggleOff, FaTags, FaTag, FaHashtag, FaAt, FaShare, FaShareAlt, FaCopy, FaLink, FaRocket, FaBolt, FaFire, FaSnowflake, FaSun, FaMoon, FaMagic, FaBrain, FaRobot, FaLightbulb, FaHandshake, FaHandsHelping, FaHeart as FaHeartSolid, FaCrown, FaGem, FaAward, FaTrophy, FaMedal, FaThumbsUp, FaRegThumbsUp, FaUserTie, FaBuilding, FaRegBuilding, FaUserGraduate, FaBook, FaNewspaper, FaBullhorn, FaBullseye, FaCrosshairs, FaLocationArrow, FaDirections, FaCompass, FaMap, FaMapMarked, FaMapMarkedAlt, FaMapPin, FaGlobeAmericas, FaGlobeEurope, FaGlobeAsia, FaGlobeAfrica, FaMale, FaFemale, FaVenus, FaMars, FaTransgender, FaGenderless, FaBirthdayCake, FaUsersCog, FaUsers as FaUsersSolid, FaRegSmile, FaSmile, FaRegLaugh, FaLaugh, FaGrinStars, FaHeartbeat, FaStarHalfAlt, FaStar as FaStarSolid, FaRegStarHalf, FaFilter as FaFilterSolid, FaUndo, FaRedo, FaTrash, FaTrashAlt, FaEdit, FaSave, FaRegSave, FaFileAlt, FaRegFileAlt, FaFilePdf, FaFileWord, FaFileExcel, FaFileCsv, FaPrint, FaMailBulk, FaEnvelopeOpen, FaEnvelopeOpenText, FaPaperclip, FaImage, FaVideo, FaPoll, FaSmile as FaSmileSolid, FaThumbsDown, FaRegThumbsDown, FaMeh, FaRegMeh, FaFrown, FaRegFrown, FaHeart as FaHeartAlt, FaRegHeart as FaRegHeartAlt } from "react-icons/fa";
import {
  collection,
  doc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  onSnapshot,
  getDocs,
  getDoc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  Timestamp,
  increment,
  writeBatch,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore';

import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { db } from '../../config/firebase';
import { supabase } from '../../config/supabase';

// ============================================
// CONSTANTS
// ============================================

const FOLLOWER_FILTERS = [
  { value: 'all', label: 'All Followers' },
  { value: 'active', label: 'Active', color: 'green' },
  { value: 'recent', label: 'Recent', color: 'blue' },
  { value: 'engaged', label: 'Highly Engaged', color: 'purple' },
  { value: 'jobseekers', label: 'Job Seekers', color: 'orange' },
];

const SORT_OPTIONS = [
  { value: 'recent', label: 'Most Recent' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'name', label: 'Name A-Z' },
  { value: 'engagement', label: 'Most Engaged' },
  { value: 'matchScore', label: 'Best Match' },
];

const ENGAGEMENT_LEVELS = [
  { value: 'high', label: 'Highly Engaged', color: 'green', minScore: 70 },
  { value: 'medium', label: 'Moderately Engaged', color: 'yellow', minScore: 40 },
  { value: 'low', label: 'Low Engagement', color: 'gray', minScore: 0 },
];

// ============================================
// UTILITY FUNCTIONS
// ============================================

const formatNumber = (num) => {
  if (num === null || num === undefined) return '0';
  return new Intl.NumberFormat('en-US').format(num);
};

const formatDate = (date, options = {}) => {
  if (!date) return 'N/A';
  const d = date instanceof Date ? date : date?.toDate?.() || new Date(date);
  if (isNaN(d.getTime())) return 'N/A';
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    ...options,
  });
};

const formatTimeAgo = (date) => {
  if (!date) return 'Just now';
  const now = new Date();
  const past = date instanceof Date ? date : date?.toDate?.() || new Date(date);
  if (isNaN(past.getTime())) return 'Just now';

  const diffMs = now - past;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffWeeks < 4) return `${diffWeeks}w ago`;
  if (diffMonths < 12) return `${diffMonths}mo ago`;
  return formatDate(past);
};

const getEngagementLevel = (score) => {
  if (score >= 70) return ENGAGEMENT_LEVELS[0];
  if (score >= 40) return ENGAGEMENT_LEVELS[1];
  return ENGAGEMENT_LEVELS[2];
};

const getEngagementColorClasses = (level) => {
  const colors = {
    high: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
    medium: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
    low: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300',
  };
  return colors[level] || colors.low;
};

// ============================================
// CUSTOM HOOKS
// ============================================

const useFollowers = (companyId) => {
  const [followers, setFollowers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!companyId) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'companyFollowers'),
      where('companyId', '==', companyId),
      orderBy('followedAt', 'desc'),
      limit(500)
    );

    const unsubscribe = onSnapshot(
      q,
      async (snapshot) => {
        const followersData = await Promise.all(
            snapshot.docs
              .filter((docSnapshot) => docSnapshot.data().status !== 'inactive')
              .map(async (docSnapshot) => {
            const data = docSnapshot.data();
            
            // Fetch follower user details
            let user = null;
            const followerUid = data.userId || data.studentId;
            if (followerUid) {
              try {
                const userDoc = await getDoc(doc(db, 'users', followerUid));
                if (userDoc.exists()) {
                  const userData = userDoc.data();
                  user = {
                    id: userDoc.id,
                    ...userData,
                  };
                }
              } catch (err) {
                console.log('Error fetching user:', err);
              }
            }

            // Calculate engagement score (based on interactions)
            const engagementScore = calculateEngagementScore(data, user);

            return {
              id: docSnapshot.id,
              ...data,
              user: user || { name: 'Unknown User' },
              engagementScore,
              followedAt: data.followedAt?.toDate?.() || data.followedAt,
              lastActive: data.lastActive?.toDate?.() || data.lastActive || user?.lastActive,
            };
          })
        );

        setFollowers(followersData);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching followers:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [companyId]);

  return { followers, loading, error };
};

const calculateEngagementScore = (followData, user) => {
  let score = 0;
  
  // Base score for following
  score += 10;
  
  // Interactions score
  if (followData.interactions) {
    const { profileViews = 0, jobViews = 0, applications = 0, messages = 0 } = followData.interactions;
    score += Math.min(profileViews * 2, 20);
    score += Math.min(jobViews * 3, 30);
    score += Math.min(applications * 10, 30);
    score += Math.min(messages * 5, 10);
  }
  
  // Activity recency
  if (user?.lastActive) {
    const lastActive = user.lastActive?.toDate?.() || new Date(user.lastActive);
    const diffDays = Math.floor((Date.now() - lastActive.getTime()) / 86400000);
    if (diffDays < 1) score += 20;
    else if (diffDays < 7) score += 15;
    else if (diffDays < 30) score += 10;
    else if (diffDays < 90) score += 5;
  }
  
  // Profile completeness
  if (user) {
    if (user.avatar || user.photoURL) score += 5;
    if (user.bio) score += 5;
    if (user.skills && user.skills.length > 0) score += 5;
    if (user.experience) score += 5;
  }
  
  return Math.min(score, 100);
};

// ============================================
// COMPONENTS
// ============================================

const LoadingSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {[...Array(6)].map((_, i) => (
      <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-6 animate-pulse">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
          <div className="flex-1">
            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          </div>
        </div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
      </div>
    ))}
  </div>
);

const EmptyState = ({ hasFilters }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="text-center py-16"
  >
    <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
      <FaUserFriends className="w-12 h-12 text-gray-400" />
    </div>
    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
      {hasFilters ? 'No followers match your filters' : 'No followers yet'}
    </h3>
    <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
      {hasFilters
        ? 'Try adjusting your search or filter criteria.'
        : 'Build your employer brand by sharing content and engaging with candidates.'}
    </p>
  </motion.div>
);

const FollowerCard = ({
  follower,
  isSelected,
  onSelect,
  onView,
  onMessage,
  onRemove,
  onSave,
  isSaved,
  viewMode = 'grid',
}) => {
  const user = follower.user;
  const engagementLevel = getEngagementLevel(follower.engagementScore);
  const engagementClasses = getEngagementColorClasses(engagementLevel.value);

  const userName = user?.name || user?.displayName || user?.email?.split('@')[0] || 'Follower';
  const userInitial = userName.charAt(0).toUpperCase();
  const userRole = String(user?.userType || user?.role || (follower.userId ? 'mentor' : 'student')).toLowerCase();

  if (viewMode === 'list') {
    return (
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className={`flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl border transition-all hover:shadow-md ${
          isSelected ? 'border-blue-500 ring-1 ring-blue-500' : 'border-gray-100 dark:border-gray-700'
        }`}
      >
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onSelect(follower.id)}
          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
        />

        <div className="relative flex-shrink-0">
          {user?.avatar || user?.photoURL ? (
            <img
              src={user.avatar || user.photoURL}
              alt={userName}
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
              {userInitial}
            </div>
          )}
          {follower.engagementScore >= 70 && (
            <div className="absolute -top-1 -right-1 bg-yellow-500 rounded-full p-1">
              <FaStar className="w-2.5 h-2.5 text-white" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-gray-900 dark:text-white truncate">
              {userName}
            </h4>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${engagementClasses}`}>
              {engagementLevel.label}
            </span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
            {userRole} · {user?.headline || user?.title || user?.email || 'Follower'}
          </p>
        </div>

        <div className="hidden md:flex items-center gap-6">
          <div className="text-center">
            <div className="text-lg font-bold text-gray-900 dark:text-white">
              {follower.engagementScore}
            </div>
            <div className="text-xs text-gray-400">Engagement</div>
          </div>
          <span className="text-xs text-gray-400">{formatTimeAgo(follower.followedAt)}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onSave(follower)}
            className={`p-2 rounded-lg transition-colors ${
              isSaved
                ? 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
                : 'text-gray-400 hover:text-yellow-500 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            {isSaved ? <FaBookmark className="w-4 h-4" /> : <FaRegBookmark className="w-4 h-4" />}
          </button>
          <button
            onClick={() => onView(follower)}
            className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <FaEye className="w-4 h-4" />
          </button>
          <button
            onClick={() => onMessage(follower)}
            className="p-2 text-gray-400 hover:text-green-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <FaCommentDots className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className={`bg-white dark:bg-gray-800 rounded-xl p-5 border transition-all hover:shadow-md ${
        isSelected ? 'border-blue-500 ring-1 ring-blue-500' : 'border-gray-100 dark:border-gray-700'
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onSelect(follower.id)}
          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
        />
        <button
          onClick={() => onSave(follower)}
          className={`p-1.5 rounded-lg transition-colors ${
            isSaved
              ? 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
              : 'text-gray-400 hover:text-yellow-500 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          {isSaved ? <FaBookmark className="w-4 h-4" /> : <FaRegBookmark className="w-4 h-4" />}
        </button>
      </div>

      <div className="flex flex-col items-center text-center mb-4">
        <div className="relative mb-3">
          {user?.avatar || user?.photoURL ? (
            <img
              src={user.avatar || user.photoURL}
              alt={userName}
              className="w-20 h-20 rounded-full object-cover border-4 border-white dark:border-gray-800 shadow-lg"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold border-4 border-white dark:border-gray-800 shadow-lg">
              {userInitial}
            </div>
          )}
          {follower.engagementScore >= 70 && (
            <div className="absolute -bottom-1 -right-1 bg-yellow-500 rounded-full p-1.5 border-2 border-white dark:border-gray-800">
              <FaStar className="w-3 h-3 text-white" />
            </div>
          )}
        </div>

        <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
          {userName}
        </h4>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 line-clamp-1">
          {userRole} · {user?.headline || user?.title || 'Follower'}
        </p>

        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${engagementClasses}`}>
          <FaChartLine className="w-3 h-3" />
          {engagementLevel.label}
        </span>
      </div>

      {/* Details */}
      <div className="space-y-2 mb-4 text-sm">
        {user?.location && (
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
            <FaMapMarkerAlt className="w-3.5 h-3.5" />
            <span className="truncate">{user.location}</span>
          </div>
        )}
        {user?.education && (
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
            <FaGraduationCap className="w-3.5 h-3.5" />
            <span className="truncate">{user.education}</span>
          </div>
        )}
        {user?.experience && (
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
            <FaBriefcase className="w-3.5 h-3.5" />
            <span className="truncate">{user.experience}</span>
          </div>
        )}
      </div>

      {/* Skills */}
      {user?.skills && user.skills.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-4">
          {user.skills.slice(0, 3).map((skill, index) => (
            <span
              key={index}
              className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded text-xs"
            >
              {skill}
            </span>
          ))}
          {user.skills.length > 3 && (
            <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded text-xs">
              +{user.skills.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Meta */}
      <div className="flex items-center justify-between text-xs text-gray-400 mb-4">
        <span>Followed {formatTimeAgo(follower.followedAt)}</span>
        <div className="flex items-center gap-1">
          <FaChartLine className="w-3 h-3" />
          {follower.engagementScore}%
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-4 border-t border-gray-100 dark:border-gray-700">
        <button
          onClick={() => onView(follower)}
          className="flex-1 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg text-sm font-medium hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
        >
          <FaEye className="w-3.5 h-3.5 inline mr-1" />
          View
        </button>
        <button
          onClick={() => onMessage(follower)}
          className="flex-1 px-3 py-2 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg text-sm font-medium hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors"
        >
          <FaCommentDots className="w-3.5 h-3.5 inline mr-1" />
          Message
        </button>
        <button
          onClick={() => onRemove(follower)}
          className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          title="Remove follower"
        >
          <FaUserMinus className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
};

const FollowersStatsCard = ({ followers }) => {
  const stats = useMemo(() => {
    const now = new Date();
    const last7Days = followers.filter(f => {
      const followed = f.followedAt instanceof Date ? f.followedAt : f.followedAt?.toDate?.();
      return followed && (now - followed) / 86400000 <= 7;
    }).length;
    const last30Days = followers.filter(f => {
      const followed = f.followedAt instanceof Date ? f.followedAt : f.followedAt?.toDate?.();
      return followed && (now - followed) / 86400000 <= 30;
    }).length;
    const avgEngagement = followers.length > 0
      ? Math.round(followers.reduce((sum, f) => sum + f.engagementScore, 0) / followers.length)
      : 0;

    return {
      total: followers.length,
      last7Days,
      last30Days,
      avgEngagement,
    };
  }, [followers]);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="p-2.5 rounded-lg bg-blue-50 dark:bg-blue-900/20">
            <FaUsers className="w-5 h-5 text-blue-600" />
          </div>
          <FaArrowUp className="w-4 h-4 text-green-500" />
        </div>
        <p className="text-3xl font-bold text-gray-900 dark:text-white">
          {formatNumber(stats.total)}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Total Followers
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="p-2.5 rounded-lg bg-green-50 dark:bg-green-900/20">
            <FaUserPlus className="w-5 h-5 text-green-600" />
          </div>
          <span className="text-xs font-medium text-green-600">+{stats.last7Days}</span>
        </div>
        <p className="text-3xl font-bold text-gray-900 dark:text-white">
          {formatNumber(stats.last7Days)}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          New This Week
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="p-2.5 rounded-lg bg-purple-50 dark:bg-purple-900/20">
            <FaCalendarAlt className="w-5 h-5 text-purple-600" />
          </div>
        </div>
        <p className="text-3xl font-bold text-gray-900 dark:text-white">
          {formatNumber(stats.last30Days)}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Last 30 Days
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="p-2.5 rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
            <FaChartLine className="w-5 h-5 text-yellow-600" />
          </div>
        </div>
        <p className="text-3xl font-bold text-gray-900 dark:text-white">
          {stats.avgEngagement}%
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Avg Engagement
        </p>
      </motion.div>
    </div>
  );
};

const FollowersChart = ({ followers }) => {
  const chartData = useMemo(() => {
    // Last 12 weeks of follower growth
    const weeks = [];
    const now = new Date();
    
    for (let i = 11; i >= 0; i--) {
      const weekStart = new Date(now);
      weekStart.setDate(weekStart.getDate() - (i * 7));
      weekStart.setHours(0, 0, 0, 0);
      
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);
      
      const count = followers.filter(f => {
        const followed = f.followedAt instanceof Date ? f.followedAt : f.followedAt?.toDate?.();
        return followed && followed >= weekStart && followed < weekEnd;
      }).length;
      
      weeks.push({
        label: `W${12 - i}`,
        count,
      });
    }
    
    const max = Math.max(...weeks.map(w => w.count), 1);
    return weeks.map(w => ({
      ...w,
      percentage: (w.count / max) * 100,
    }));
  }, [followers]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <FaChartBar className="w-4 h-4 text-blue-600" />
            Follower Growth
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Last 12 weeks
          </p>
        </div>
      </div>

      <div className="flex items-end justify-between gap-2 h-32">
        {chartData.map((week, index) => (
          <div key={index} className="flex-1 flex flex-col items-center gap-2">
            <div className="w-full relative" style={{ height: '100%' }}>
              <div
                className="absolute bottom-0 w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-lg transition-all hover:from-blue-700 hover:to-blue-500"
                style={{ height: `${Math.max(week.percentage, 3)}%` }}
                title={`${week.count} followers`}
              />
            </div>
            <span className="text-xs text-gray-400">{week.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================

const CompanyFollowers = () => {
  const navigate = useNavigate();
  const { currentUser, userProfile } = useAuth();
  const { showNotification } = useNotification();

  const companyId = currentUser?.uid;
  const { followers, loading, error } = useFollowers(companyId);

  // Local state
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [viewMode, setViewMode] = useState('grid');
  const [selectedFollowers, setSelectedFollowers] = useState([]);
  const [savedFollowers, setSavedFollowers] = useState(new Set());
  const [showEngageModal, setShowEngageModal] = useState(false);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const [followerToRemove, setFollowerToRemove] = useState(null);
  const [engagementData, setEngagementData] = useState({
    subject: '',
    message: '',
  });
  const [engaging, setEngaging] = useState(false);

  // Load saved followers
  useEffect(() => {
    if (!companyId) return;

    const savedQuery = query(
      collection(db, 'savedFollowers'),
      where('companyId', '==', companyId)
    );

    const unsubscribe = onSnapshot(savedQuery, (snapshot) => {
      const saved = new Set(snapshot.docs.map(doc => doc.data().followerUserId));
      setSavedFollowers(saved);
    });

    return () => unsubscribe();
  }, [companyId]);

  // Filtered followers
  const filteredFollowers = useMemo(() => {
    let filtered = [...followers];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(f => {
        const user = f.user;
        return (
          (user?.name?.toLowerCase() || '').includes(term) ||
          (user?.displayName?.toLowerCase() || '').includes(term) ||
          (user?.email?.toLowerCase() || '').includes(term) ||
          (user?.headline?.toLowerCase() || '').includes(term) ||
          (user?.skills?.some(s => s.toLowerCase().includes(term)) || false)
        );
      });
    }

    if (filter === 'active') {
      filtered = filtered.filter(f => {
        if (!f.lastActive) return false;
        const lastActive = f.lastActive instanceof Date ? f.lastActive : new Date(f.lastActive);
        return (Date.now() - lastActive.getTime()) / 86400000 <= 7;
      });
    } else if (filter === 'recent') {
      filtered = filtered.filter(f => {
        const followed = f.followedAt instanceof Date ? f.followedAt : new Date(f.followedAt);
        return (Date.now() - followed.getTime()) / 86400000 <= 30;
      });
    } else if (filter === 'engaged') {
      filtered = filtered.filter(f => f.engagementScore >= 70);
    } else if (filter === 'jobseekers') {
      filtered = filtered.filter(f => f.user?.jobSeeking || f.user?.status === 'seeking');
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.followedAt) - new Date(a.followedAt);
        case 'oldest':
          return new Date(a.followedAt) - new Date(b.followedAt);
        case 'name':
          return (a.user?.name || '').localeCompare(b.user?.name || '');
        case 'engagement':
          return b.engagementScore - a.engagementScore;
        case 'matchScore':
          return (b.matchScore || 0) - (a.matchScore || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [followers, searchTerm, filter, sortBy]);

  // ============================================
  // HANDLERS
  // ============================================

  const handleSelectFollower = (followerId) => {
    setSelectedFollowers(prev =>
      prev.includes(followerId)
        ? prev.filter(id => id !== followerId)
        : [...prev, followerId]
    );
  };

  const handleSelectAll = () => {
    if (selectedFollowers.length === filteredFollowers.length) {
      setSelectedFollowers([]);
    } else {
      setSelectedFollowers(filteredFollowers.map(f => f.id));
    }
  };

  const handleSaveFollower = async (follower) => {
    if (!companyId) return;

    try {
      const userId = follower.user?.id || follower.userId;
      const savedRef = doc(db, 'savedFollowers', `${companyId}_${userId}`);
      const savedDoc = await getDoc(savedRef);

      if (savedDoc.exists()) {
        await deleteDoc(savedRef);
        showNotification('success', 'Removed from saved followers');
      } else {
        await setDoc(savedRef, {
          companyId,
          followerUserId: userId,
          followerName: follower.user?.name,
          followerEmail: follower.user?.email,
          savedAt: serverTimestamp(),
        });
        showNotification('success', 'Added to saved followers');
      }
    } catch (error) {
      console.error('Error saving follower:', error);
      showNotification('error', 'Failed to save follower');
    }
  };

  const handleRemoveFollower = (follower) => {
    setFollowerToRemove(follower);
    setShowRemoveConfirm(true);
  };

  const handleRemoveConfirm = async () => {
    if (!followerToRemove) return;

    try {
      const followerUid = followerToRemove.user?.id || followerToRemove.studentId || followerToRemove.userId;
      const followerRef = doc(db, 'companyFollowers', followerToRemove.id);
      const edgeSnapshot = followerUid
        ? await getDocs(query(
          collection(db, 'company_chat_followers'),
          where('companyId', '==', companyId),
          limit(500)
        ))
        : null;
      const edgeRef = edgeSnapshot?.docs.find((edge) => edge.data().followerId === followerUid)?.ref;
      const batch = writeBatch(db);
      batch.delete(followerRef);
      if (edgeRef) {
        batch.update(edgeRef, { status: 'inactive', updatedAt: serverTimestamp() });
      }
      await batch.commit();

      await supabase
        .from('company_activities')
        .insert({
          company_id: companyId,
          activity_type: 'follower_removed',
          metadata: {
            follower_id: followerToRemove.user?.id,
            follower_name: followerToRemove.user?.name,
          },
          created_at: new Date().toISOString(),
        });

      showNotification('success', 'Follower removed');
      setShowRemoveConfirm(false);
      setFollowerToRemove(null);
    } catch (error) {
      console.error('Error removing follower:', error);
      showNotification('error', 'Failed to remove follower');
    }
  };

  const handleViewFollower = (follower) => {
    const userId = follower.user?.id || follower.userId;
    if (userId) {
      navigate(`/company/candidates/${userId}`);
    }
  };

  const handleMessageFollower = (follower) => {
    const userId = follower.user?.id || follower.userId;
    if (userId) {
      navigate(`/company/chat?candidate=${userId}`);
    }
  };

  const handleBulkEngage = async () => {
    if (selectedFollowers.length === 0) {
      showNotification('warning', 'No followers selected');
      return;
    }
    setShowEngageModal(true);
  };

  const handleSendEngagement = async () => {
    if (!engagementData.subject.trim() || !engagementData.message.trim()) {
      showNotification('warning', 'Please fill in subject and message');
      return;
    }

    try {
      setEngaging(true);

      const selectedFollowerData = followers.filter(f => selectedFollowers.includes(f.id));

      // Send notifications to each selected follower
      const batch = writeBatch(db);

      for (const follower of selectedFollowerData) {
        const userId = follower.user?.id || follower.userId;
        if (!userId) continue;

        const notifRef = doc(collection(db, 'notifications'));
        batch.set(notifRef, {
          userId,
          type: 'company_broadcast',
          title: engagementData.subject,
          message: engagementData.message,
          companyId,
          companyName: userProfile?.companyName || 'Company',
          read: false,
          createdAt: serverTimestamp(),
        });
      }

      await batch.commit();

      // Log to Supabase
      await supabase
        .from('company_activities')
        .insert({
          company_id: companyId,
          activity_type: 'bulk_message_sent',
          metadata: {
            recipient_count: selectedFollowers.length,
            subject: engagementData.subject,
          },
          created_at: new Date().toISOString(),
        });

      showNotification('success', `Message sent to ${selectedFollowers.length} followers`);
      setShowEngageModal(false);
      setSelectedFollowers([]);
      setEngagementData({ subject: '', message: '' });
    } catch (error) {
      console.error('Error sending engagement:', error);
      showNotification('error', 'Failed to send message');
    } finally {
      setEngaging(false);
    }
  };

  const handleExport = () => {
    try {
      const dataToExport = selectedFollowers.length > 0
        ? followers.filter(f => selectedFollowers.includes(f.id))
        : filteredFollowers;

      const headers = ['Name', 'Email', 'Location', 'Headline', 'Engagement Score', 'Followed At'];
      const rows = dataToExport.map(f => [
        f.user?.name || '',
        f.user?.email || '',
        f.user?.location || '',
        f.user?.headline || '',
        f.engagementScore,
        formatDate(f.followedAt),
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `followers-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();

      showNotification('success', 'Followers exported successfully');
    } catch (error) {
      console.error('Error exporting:', error);
      showNotification('error', 'Failed to export');
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilter('all');
    setSortBy('recent');
  };

  const hasFilters = searchTerm || filter !== 'all';

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6"
        >
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <FaUserFriends className="w-8 h-8 text-blue-600" />
              Followers
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Manage and engage with students and mentors following your company
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleExport}
              className="px-4 py-2.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-medium border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
            >
              <FaFileExport className="w-4 h-4" />
              Export
            </button>
            <button
              onClick={handleBulkEngage}
              disabled={selectedFollowers.length === 0}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <FaPaperPlane className="w-4 h-4" />
              Engage {selectedFollowers.length > 0 && `(${selectedFollowers.length})`}
            </button>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="mb-6">
          <FollowersStatsCard followers={followers} />
        </div>

        {/* Chart */}
        {followers.length > 0 && (
          <div className="mb-6">
            <FollowersChart followers={followers} />
          </div>
        )}

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 mb-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="relative flex-1 w-full">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search followers by name, email, or skills..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {FOLLOWER_FILTERS.map(f => (
                  <option key={f.value} value={f.value}>{f.label}</option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {SORT_OPTIONS.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>

              {hasFilters && (
                <button
                  onClick={clearFilters}
                  className="px-4 py-2.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl font-medium transition-colors flex items-center gap-2 text-sm"
                >
                  <FaTimes className="w-4 h-4" />
                  Clear
                </button>
              )}

              <div className="hidden md:flex items-center bg-gray-100 dark:bg-gray-700 rounded-xl p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-white dark:bg-gray-600 text-blue-600 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <FaThLarge className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'list'
                      ? 'bg-white dark:bg-gray-600 text-blue-600 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <FaList className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Selection Info */}
          {filteredFollowers.length > 0 && (
            <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
              <input
                type="checkbox"
                checked={selectedFollowers.length === filteredFollowers.length && filteredFollowers.length > 0}
                onChange={handleSelectAll}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {selectedFollowers.length > 0 
                  ? `${selectedFollowers.length} of ${filteredFollowers.length} selected`
                  : `Select all ${filteredFollowers.length} followers`
                }
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        {loading ? (
          <LoadingSkeleton />
        ) : error ? (
          <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-6 text-center">
            <FaExclamationTriangle className="w-12 h-12 text-red-500 mx-auto mb-3" />
            <p className="text-red-600 dark:text-red-400">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : filteredFollowers.length === 0 ? (
          <EmptyState hasFilters={hasFilters} />
        ) : (
          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
            : 'space-y-3'
          }>
            {filteredFollowers.map((follower) => (
              <FollowerCard
                key={follower.id}
                follower={follower}
                isSelected={selectedFollowers.includes(follower.id)}
                onSelect={handleSelectFollower}
                onView={handleViewFollower}
                onMessage={handleMessageFollower}
                onRemove={handleRemoveFollower}
                onSave={handleSaveFollower}
                isSaved={savedFollowers.has(follower.user?.id || follower.userId)}
                viewMode={viewMode}
              />
            ))}
          </div>
        )}
      </div>

      {/* Engage Modal */}
      <AnimatePresence>
        {showEngageModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowEngageModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-lg"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Engage with {selectedFollowers.length} Followers
                </h3>
                <button
                  onClick={() => setShowEngageModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <FaTimes className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Subject
                  </label>
                  <input
                    type="text"
                    value={engagementData.subject}
                    onChange={(e) => setEngagementData({ ...engagementData, subject: e.target.value })}
                    placeholder="e.g., New Opportunity at Our Company"
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Message
                  </label>
                  <textarea
                    value={engagementData.message}
                    onChange={(e) => setEngagementData({ ...engagementData, message: e.target.value })}
                    rows={5}
                    placeholder="Write your message to followers..."
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>

                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-xs text-blue-600 dark:text-blue-400 flex items-start gap-2">
                    <FaInfoCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                    This message will be sent as a notification to all selected followers
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 mt-6">
                <button
                  onClick={() => setShowEngageModal(false)}
                  className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendEngagement}
                  disabled={engaging || !engagementData.subject.trim() || !engagementData.message.trim()}
                  className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {engaging ? (
                    <>
                      <FaSpinner className="w-4 h-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <FaPaperPlane className="w-4 h-4" />
                      Send
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Remove Confirmation Modal */}
      <AnimatePresence>
        {showRemoveConfirm && followerToRemove && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowRemoveConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full">
                  <FaExclamationTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Remove Follower
                  </h3>
                  <p className="text-sm text-gray-500">
                    They will stop following your company
                  </p>
                </div>
              </div>

              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Are you sure you want to remove{' '}
                <strong>{followerToRemove.user?.name || 'this follower'}</strong> from your followers?
              </p>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowRemoveConfirm(false)}
                  className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRemoveConfirm}
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors"
                >
                  Remove
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CompanyFollowers;
