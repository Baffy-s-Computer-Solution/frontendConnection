// src/pages/company/CompanyDashboard.jsx
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { FaBuilding, FaUsers, FaBriefcase, FaChartLine, FaEye, FaCalendarAlt, FaFilter, FaArrowUp, FaArrowDown, FaSync, FaPlus, FaBell, FaFileAlt, FaCheckCircle, FaClock, FaTimesCircle, FaChartPie, FaHandshake, FaBolt, FaInfoCircle, FaExternalLinkAlt, FaStar, FaEllipsisV, FaTrash, FaEdit, FaUserTie, FaGraduationCap, FaLightbulb, FaRocket, FaChartBar, FaFileContract, FaCommentDots, FaCalendarCheck, FaHistory, FaUsersCog, FaUserCheck, FaCalendarDay, FaArrowRight, FaMapMarkerAlt, FaGlobe, FaIndustry, FaUserPlus, FaNewspaper, FaVideo, FaBullhorn, FaUpload, FaCloudUploadAlt, FaSearch, FaChartArea, FaUserFriends, FaBook, FaRegClock, FaRegCalendar, FaRegComments, FaRegUserCircle, FaCog, FaFilePdf, FaLinkedin, FaTwitter, FaFacebook, FaInstagram, FaYoutube, FaRegEnvelope, FaPhone, FaMapMarker, FaLink, FaCamera, FaTimes, FaSpinner, FaRegEye, FaRegThumbsUp, FaRegCommentDots, FaRegShareSquare, FaRegBookmark, FaThermometerThreeQuarters, FaTrophy, FaAward, FaMedal, FaCrown, FaGem, FaDollarSign, FaCreditCard, FaUniversity, FaUserGraduate, FaUserTie as FaUserTieSolid, FaUserEdit, FaUserCog, FaUserShield, FaShieldAlt, FaRobot, FaPalette, FaClipboardCheck, FaBrain, FaStore, FaUsersCog as FaUsersCogIcon, FaHeart, FaComment, FaShare, FaBookmark, FaPaperPlane, FaImage, FaVideo as FaVideoSolid, FaPoll, FaCalendarPlus, FaUserFriends as FaUserFriendsSolid, FaBriefcase as FaBriefcaseSolid, FaBuilding as FaBuildingSolid, FaChartLine as FaChartLineSolid, FaUserPlus as FaUserPlusSolid, FaCheckDouble, FaExclamationTriangle, FaRegSmile, FaRegLaugh, FaRegHeart, FaThumbsUp, FaShareAlt, FaEllipsisH, FaRegClock as FaRegClockSolid, FaWifi, FaPlug, FaDatabase, FaCloud } from "react-icons/fa";
import {
  collection,
  doc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  Timestamp,
  increment,
  writeBatch,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { updateProfile } from 'firebase/auth';

import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { useTheme } from '../../context/ThemeContext';
import SocialDashboardSection from '../../components/social/SocialDashboardSection';
import TestimonialComposer from '../../components/social/TestimonialComposer';
import { db, storage, auth } from '../../config/firebase';
import supabaseConfig, { supabase } from '../../config/supabase';
import cloudinaryService from '../../services/cloudinaryService';
import API_BASE_URL from '../../services/apiConfig';

// ============================================
// UTILITY FUNCTIONS
// ============================================

const getTimeGreeting = (date = new Date()) => {
  const hour = date.getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
};

const formatNumber = (num) => {
  if (num === null || num === undefined) return '0';
  return new Intl.NumberFormat('en-US').format(num);
};

const formatCurrency = (amount, currency = 'M') => {
  if (amount === null || amount === undefined) return `${currency}0`;
  return `${currency}${new Intl.NumberFormat('en-US').format(amount)}`;
};

const formatDate = (date, options = {}) => {
  if (!date) return 'N/A';
  const d = date instanceof Date ? date : new Date(date);
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
  const past = date instanceof Date ? date : new Date(date);
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
  return past.toLocaleDateString();
};

const getStatusConfig = (status) => {
  const configs = {
    // Application statuses
    applied: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-300', icon: FaFileAlt, label: 'Applied' },
    pending: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-300', icon: FaClock, label: 'Pending' },
    reviewed: { bg: 'bg-indigo-100 dark:bg-indigo-900/30', text: 'text-indigo-700 dark:text-indigo-300', icon: FaEye, label: 'Reviewed' },
    interview: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-300', icon: FaCalendarAlt, label: 'Interview' },
    shortlisted: { bg: 'bg-cyan-100 dark:bg-cyan-900/30', text: 'text-cyan-700 dark:text-cyan-300', icon: FaStar, label: 'Shortlisted' },
    hired: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-300', icon: FaCheckCircle, label: 'Hired' },
    rejected: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-300', icon: FaTimesCircle, label: 'Rejected' },
    withdrawn: { bg: 'bg-gray-100 dark:bg-gray-700', text: 'text-gray-700 dark:text-gray-300', icon: FaTimes, label: 'Withdrawn' },
    // Job statuses
    active: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-300', icon: FaCheckCircle, label: 'Active' },
    draft: { bg: 'bg-gray-100 dark:bg-gray-700', text: 'text-gray-700 dark:text-gray-300', icon: FaFileAlt, label: 'Draft' },
    paused: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-300', icon: FaClock, label: 'Paused' },
    closed: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-300', icon: FaTimesCircle, label: 'Closed' },
    expired: { bg: 'bg-gray-100 dark:bg-gray-700', text: 'text-gray-700 dark:text-gray-300', icon: FaClock, label: 'Expired' },
  };
  return configs[status] || configs.pending;
};

const getPriorityConfig = (priority) => {
  const configs = {
    urgent: { bg: 'bg-red-500', text: 'text-white', label: 'Urgent' },
    high: { bg: 'bg-orange-500', text: 'text-white', label: 'High' },
    normal: { bg: 'bg-blue-500', text: 'text-white', label: 'Normal' },
    low: { bg: 'bg-gray-500', text: 'text-white', label: 'Low' },
  };
  return configs[priority] || configs.normal;
};

// ============================================
// CUSTOM HOOKS
// ============================================

const useRealtimeCompanyData = (companyId) => {
  const [data, setData] = useState({
    company: null,
    stats: null,
    jobs: [],
    applications: [],
    teamMembers: [],
    followers: [],
    notifications: [],
    socialPosts: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!companyId) {
      setData(prev => ({ ...prev, loading: false }));
      return;
    }

    const unsubscribers = [];

    // Subscribe to company profile
    const companyUnsub = onSnapshot(
      doc(db, 'companies', companyId),
      (snapshot) => {
        if (snapshot.exists()) {
          setData(prev => ({
            ...prev,
            company: { id: snapshot.id, ...snapshot.data() },
          }));
        }
      },
      (error) => {
        console.error('Company subscription error:', error);
        setData(prev => ({ ...prev, error: error.message }));
      }
    );
    unsubscribers.push(companyUnsub);

    // Subscribe to jobs
    const jobsQuery = query(
      collection(db, 'jobs'),
      where('companyId', '==', companyId),
      orderBy('createdAt', 'desc'),
      limit(50)
    );
    const jobsUnsub = onSnapshot(
      jobsQuery,
      (snapshot) => {
        const jobs = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setData(prev => ({ ...prev, jobs }));
      },
      (error) => {
        console.error('Jobs subscription error:', error);
      }
    );
    unsubscribers.push(jobsUnsub);

    // Subscribe to applications
    const applicationsQuery = query(
      collection(db, 'applications'),
      where('companyId', '==', companyId),
      orderBy('appliedAt', 'desc'),
      limit(100)
    );
    const applicationsUnsub = onSnapshot(
      applicationsQuery,
      (snapshot) => {
        const applications = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setData(prev => ({ ...prev, applications }));
      },
      (error) => {
        console.error('Applications subscription error:', error);
      }
    );
    unsubscribers.push(applicationsUnsub);

    // Subscribe to team members
    const teamQuery = query(
      collection(db, 'companyTeamMembers'),
      where('companyId', '==', companyId),
      where('status', '==', 'active')
    );
    const teamUnsub = onSnapshot(
      teamQuery,
      (snapshot) => {
        const teamMembers = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setData(prev => ({ ...prev, teamMembers }));
      },
      (error) => {
        console.error('Team subscription error:', error);
      }
    );
    unsubscribers.push(teamUnsub);

    // Subscribe to followers
    const followersQuery = query(
      collection(db, 'companyFollowers'),
      where('companyId', '==', companyId),
      orderBy('followedAt', 'desc'),
      limit(100)
    );
    const followersUnsub = onSnapshot(
      followersQuery,
      (snapshot) => {
        const followers = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setData(prev => ({ ...prev, followers }));
      },
      (error) => {
        console.error('Followers subscription error:', error);
      }
    );
    unsubscribers.push(followersUnsub);

    // Subscribe to notifications
    const notificationsQuery = query(
      collection(db, 'companyNotifications'),
      where('companyId', '==', companyId),
      orderBy('createdAt', 'desc'),
      limit(20)
    );
    const notificationsUnsub = onSnapshot(
      notificationsQuery,
      (snapshot) => {
        const notifications = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setData(prev => ({ ...prev, notifications, loading: false }));
      },
      (error) => {
        console.error('Notifications subscription error:', error);
        setData(prev => ({ ...prev, loading: false }));
      }
    );
    unsubscribers.push(notificationsUnsub);

    // Subscribe to social posts
    const socialQuery = query(
      collection(db, 'socialPosts'),
      where('authorId', '==', companyId),
      orderBy('createdAt', 'desc'),
      limit(20)
    );
    const socialUnsub = onSnapshot(
      socialQuery,
      (snapshot) => {
        const socialPosts = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setData(prev => ({ ...prev, socialPosts }));
      },
      (error) => {
        console.error('Social posts subscription error:', error);
      }
    );
    unsubscribers.push(socialUnsub);

    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
  }, [companyId]);

  return data;
};

const useSupabaseRealtime = (companyId) => {
  const [supabaseData, setSupabaseData] = useState({
    analytics: null,
    messages: [],
    activities: [],
  });

  useEffect(() => {
    const realtimeEnabled = import.meta.env.VITE_ENABLE_SUPABASE_REALTIME === 'true';
    if (!companyId || !supabase || !supabaseConfig.configured || !realtimeEnabled) return;

    // Subscribe to Supabase realtime for analytics
    const analyticsChannel = supabase
      .channel(`company-analytics-${companyId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'company_analytics',
          filter: `company_id=eq.${companyId}`,
        },
        (payload) => {
          setSupabaseData(prev => ({
            ...prev,
            analytics: payload.new,
          }));
        }
      )
      .subscribe();

    // Subscribe to messages
    const messagesChannel = supabase
      .channel(`company-messages-${companyId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${companyId}`,
        },
        (payload) => {
          setSupabaseData(prev => ({
            ...prev,
            messages: [payload.new, ...prev.messages].slice(0, 50),
          }));
        }
      )
      .subscribe();

    // Subscribe to activities
    const activitiesChannel = supabase
      .channel(`company-activities-${companyId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'activities',
          filter: `company_id=eq.${companyId}`,
        },
        (payload) => {
          setSupabaseData(prev => ({
            ...prev,
            activities: [payload.new, ...prev.activities].slice(0, 50),
          }));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(analyticsChannel);
      supabase.removeChannel(messagesChannel);
      supabase.removeChannel(activitiesChannel);
    };
  }, [companyId]);

  return supabaseData;
};

// ============================================
// COMPONENT: Loading Skeleton
// ============================================

const LoadingSkeleton = ({ className = '' }) => (
  <div className={`animate-pulse ${className}`}>
    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
  </div>
);

const CardSkeleton = () => (
  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm animate-pulse">
    <div className="flex items-center justify-between mb-4">
      <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
      <div className="w-16 h-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
    </div>
    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
  </div>
);

// ============================================
// COMPONENT: Stat Card
// ============================================

const StatCard = ({ 
  title, 
  value, 
  icon: Icon, 
  change, 
  changeType = 'positive',
  color = 'blue',
  onClick,
  loading = false,
  subtitle,
}) => {
  const colorClasses = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    green: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400',
    purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
    orange: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400',
    red: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400',
    indigo: 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400',
    pink: 'bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400',
    teal: 'bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400',
  };

  if (loading) return <CardSkeleton />;

  return (
    <motion.div
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      className={`bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-all cursor-pointer border border-gray-100 dark:border-gray-700 ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-xl ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
        {change !== undefined && (
          <div className={`flex items-center gap-1 text-sm font-medium ${
            changeType === 'positive' ? 'text-green-600' : 'text-red-600'
          }`}>
            {changeType === 'positive' ? (
              <FaArrowUp className="w-3 h-3" />
            ) : (
              <FaArrowDown className="w-3 h-3" />
            )}
            <span>{change}%</span>
          </div>
        )}
      </div>
      <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
        {typeof value === 'number' ? formatNumber(value) : value}
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
      {subtitle && (
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{subtitle}</p>
      )}
    </motion.div>
  );
};

// ============================================
// COMPONENT: Pipeline Stage
// ============================================

const PipelineStage = ({ stage, count, color, icon: Icon, total, onClick }) => {
  const percentage = total > 0 ? Math.round((count / total) * 100) : 0;

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="flex-1 bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 cursor-pointer hover:shadow-md transition-all"
      onClick={onClick}
    >
      <div className="flex items-center gap-3 mb-3">
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400 capitalize">
          {stage}
        </span>
      </div>
      <div className="flex items-end justify-between">
        <span className="text-2xl font-bold text-gray-900 dark:text-white">{count}</span>
        <span className="text-sm text-gray-500">{percentage}%</span>
      </div>
      <div className="mt-3 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            stage === 'new' ? 'bg-blue-500' :
            stage === 'reviewed' ? 'bg-indigo-500' :
            stage === 'interview' ? 'bg-purple-500' :
            'bg-green-500'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </motion.div>
  );
};

// ============================================
// COMPONENT: Application Card
// ============================================

const ApplicationCard = ({ application, onView, onUpdateStatus, onMessage }) => {
  const statusConfig = getStatusConfig(application.status);
  const StatusIcon = statusConfig.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className="relative">
            {application.candidate?.avatar ? (
              <img
                src={application.candidate.avatar}
                alt={application.candidate.name}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                {application.candidate?.name?.charAt(0) || 'C'}
              </div>
            )}
            {application.matchScore >= 80 && (
              <div className="absolute -top-1 -right-1 bg-green-500 rounded-full p-1">
                <FaStar className="w-3 h-3 text-white" />
              </div>
            )}
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white">
              {application.candidate?.name || 'Unknown Candidate'}
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {application.job?.title || 'Position'}
            </p>
            <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
              <span className="flex items-center gap-1">
                <FaClock className="w-3 h-3" />
                {formatTimeAgo(application.appliedAt)}
              </span>
              <span className="flex items-center gap-1">
                <FaChartLine className="w-3 h-3" />
                {application.matchScore || 0}% match
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.text}`}>
            <StatusIcon className="w-3 h-3" />
            {statusConfig.label}
          </span>
        </div>
      </div>

      {application.candidate?.skills && application.candidate.skills.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-3">
          {application.candidate.skills.slice(0, 3).map((skill, index) => (
            <span
              key={index}
              className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded text-xs"
            >
              {skill}
            </span>
          ))}
          {application.candidate.skills.length > 3 && (
            <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded text-xs">
              +{application.candidate.skills.length - 3}
            </span>
          )}
        </div>
      )}

      <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
        <button
          onClick={() => onView(application)}
          className="flex-1 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg text-sm font-medium hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
        >
          <FaEye className="w-4 h-4 inline mr-1" />
          View
        </button>
        {application.status === 'applied' && (
          <button
            onClick={() => onUpdateStatus(application.id, 'reviewed')}
            className="flex-1 px-3 py-2 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg text-sm font-medium hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors"
          >
            <FaCheckCircle className="w-4 h-4 inline mr-1" />
            Review
          </button>
        )}
        {application.status === 'reviewed' && (
          <button
            onClick={() => onUpdateStatus(application.id, 'interview')}
            className="flex-1 px-3 py-2 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-lg text-sm font-medium hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-colors"
          >
            <FaCalendarAlt className="w-4 h-4 inline mr-1" />
            Interview
          </button>
        )}
        <button
          onClick={() => onMessage(application)}
          className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          <FaCommentDots className="w-5 h-5" />
        </button>
      </div>
    </motion.div>
  );
};

// ============================================
// COMPONENT: Job Row
// ============================================

const JobRow = ({ job, onView, onEdit, onDelete, onToggleStatus }) => {
  const statusConfig = getStatusConfig(job.status);
  const StatusIcon = statusConfig.icon;

  return (
    <motion.tr
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50"
    >
      <td className="py-4 px-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <FaBriefcase className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="font-medium text-gray-900 dark:text-white">{job.title}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
              <FaMapMarkerAlt className="w-3 h-3" />
              {job.location || 'Remote'}
            </p>
          </div>
        </div>
      </td>
      <td className="py-4 px-4">
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.text}`}>
          <StatusIcon className="w-3 h-3" />
          {statusConfig.label}
        </span>
      </td>
      <td className="py-4 px-4">
        <div className="flex items-center gap-2">
          <FaUsers className="w-4 h-4 text-gray-400" />
          <span className="text-gray-700 dark:text-gray-300">{job.applicantsCount || 0}</span>
        </div>
      </td>
      <td className="py-4 px-4">
        <div className="flex items-center gap-2">
          <FaEye className="w-4 h-4 text-gray-400" />
          <span className="text-gray-700 dark:text-gray-300">{job.views || 0}</span>
        </div>
      </td>
      <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-400">
        {formatTimeAgo(job.createdAt)}
      </td>
      <td className="py-4 px-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onView(job)}
            className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
            title="View"
          >
            <FaEye className="w-4 h-4" />
          </button>
          <button
            onClick={() => onEdit(job)}
            className="p-2 text-gray-400 hover:text-indigo-600 transition-colors"
            title="Edit"
          >
            <FaEdit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onToggleStatus(job)}
            className="p-2 text-gray-400 hover:text-yellow-600 transition-colors"
            title={job.status === 'active' ? 'Pause' : 'Activate'}
          >
            {job.status === 'active' ? <FaClock className="w-4 h-4" /> : <FaCheckCircle className="w-4 h-4" />}
          </button>
          <button
            onClick={() => onDelete(job)}
            className="p-2 text-gray-400 hover:text-red-600 transition-colors"
            title="Delete"
          >
            <FaTrash className="w-4 h-4" />
          </button>
        </div>
      </td>
    </motion.tr>
  );
};

// ============================================
// COMPONENT: Social Post Card
// ============================================

const SocialPostCard = ({ post, onLike, onComment, onShare }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [showComments, setShowComments] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700"
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
          {post.authorName?.charAt(0) || 'C'}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white">{post.authorName}</h4>
              <p className="text-xs text-gray-500">{formatTimeAgo(post.createdAt)}</p>
            </div>
            <button className="p-1 text-gray-400 hover:text-gray-600">
              <FaEllipsisH className="w-4 h-4" />
            </button>
          </div>
          
          <p className="mt-3 text-gray-700 dark:text-gray-300">{post.content}</p>
          
          {post.media && post.media.length > 0 && (
            <div className="mt-3 grid grid-cols-2 gap-2">
              {post.media.slice(0, 4).map((media, index) => (
                <div key={index} className="relative aspect-video rounded-lg overflow-hidden">
                  {media.type === 'image' ? (
                    <img
                      src={media.url}
                      alt={`Post media ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <video
                      src={media.url}
                      className="w-full h-full object-cover"
                      controls
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center gap-4 mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
            <button
              onClick={() => {
                setIsLiked(!isLiked);
                onLike(post.id);
              }}
              className={`flex items-center gap-1 text-sm ${
                isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
              } transition-colors`}
            >
              {isLiked ? <FaHeart className="w-4 h-4" /> : <FaRegHeart className="w-4 h-4" />}
              <span>{post.likesCount + (isLiked ? 1 : 0)}</span>
            </button>
            <button
              onClick={() => setShowComments(!showComments)}
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-blue-500 transition-colors"
            >
              <FaRegCommentDots className="w-4 h-4" />
              <span>{post.commentsCount || 0}</span>
            </button>
            <button
              onClick={() => onShare(post.id)}
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-green-500 transition-colors"
            >
              <FaShare className="w-4 h-4" />
              <span>Share</span>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// ============================================
// COMPONENT: Notification Item
// ============================================

const NotificationItem = ({ notification, onRead, onDelete }) => {
  const typeIcons = {
    application: FaFileAlt,
    message: FaCommentDots,
    interview: FaCalendarAlt,
    hire: FaCheckCircle,
    follow: FaUserPlus,
    review: FaStar,
  };
  const Icon = typeIcons[notification.type] || FaBell;

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className={`flex items-start gap-3 p-3 rounded-lg ${
        notification.read ? 'bg-transparent' : 'bg-blue-50 dark:bg-blue-900/20'
      } hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors`}
    >
      <div className={`p-2 rounded-lg ${
        notification.type === 'application' ? 'bg-blue-100 text-blue-600' :
        notification.type === 'message' ? 'bg-green-100 text-green-600' :
        notification.type === 'interview' ? 'bg-purple-100 text-purple-600' :
        'bg-gray-100 text-gray-600'
      }`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-900 dark:text-white font-medium truncate">
          {notification.title}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
          {notification.message}
        </p>
        <p className="text-xs text-gray-400 mt-1">{formatTimeAgo(notification.createdAt)}</p>
      </div>
      <button
        onClick={() => onDelete(notification.id)}
        className="p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <FaTimes className="w-3 h-3" />
      </button>
    </motion.div>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================

const CompanyDashboard = () => {
  const navigate = useNavigate();
  const { currentUser, userProfile } = useAuth();
  const { showNotification } = useNotification();
  const { theme } = useTheme();
  
  const companyId = currentUser?.uid;
  
  // Real-time data hooks
  const { 
    company, 
    jobs, 
    applications, 
    teamMembers, 
    followers, 
    notifications,
    socialPosts,
    loading, 
    error 
  } = useRealtimeCompanyData(companyId);
  
  const supabaseData = useSupabaseRealtime(companyId);

  // Local state
  const [greeting, setGreeting] = useState(() => getTimeGreeting());
  const [activeTab, setActiveTab] = useState('overview');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [searchTerm, setSearchTerm] = useState('');
  const [showQuickActions, setShowQuickActions] = useState(true);
  const [showLogoUpload, setShowLogoUpload] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [logoPreview, setLogoPreview] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [showJobModal, setShowJobModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleteType, setDeleteType] = useState(null);
  
  const logoInputRef = useRef(null);

  // Update greeting every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setGreeting(getTimeGreeting());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Online/offline detection
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Compute stats from real-time data
  const stats = useMemo(() => {
    const totalApplications = applications.length;
    const pendingReviews = applications.filter(a => a.status === 'applied').length;
    const activeJobs = jobs.filter(j => j.status === 'active').length;
    const interviews = applications.filter(a => a.status === 'interview').length;
    const hired = applications.filter(a => a.status === 'hired').length;
    const rejected = applications.filter(a => a.status === 'rejected').length;
    
    const interviewRate = totalApplications > 0 
      ? Math.round((interviews / totalApplications) * 100) 
      : 0;
    const hireRate = totalApplications > 0 
      ? Math.round((hired / totalApplications) * 100) 
      : 0;
    
    // Calculate average time to hire
    const hiredApps = applications.filter(a => a.status === 'hired' && a.appliedAt && a.hiredAt);
    const avgTimeToHire = hiredApps.length > 0
      ? Math.round(hiredApps.reduce((sum, app) => {
          const applied = new Date(app.appliedAt?.toDate?.() || app.appliedAt);
          const hiredDate = new Date(app.hiredAt?.toDate?.() || app.hiredAt);
          return sum + Math.ceil((hiredDate - applied) / (1000 * 60 * 60 * 24));
        }, 0) / hiredApps.length)
      : 0;

    return {
      totalJobs: jobs.length,
      activeJobs,
      totalApplications,
      pendingReviews,
      interviews,
      hired,
      rejected,
      interviewRate,
      hireRate,
      avgTimeToHire,
      totalFollowers: followers.length,
      teamMembers: teamMembers.length,
      profileViews: company?.profileViews || 0,
      pipelineStats: {
        new: applications.filter(a => a.status === 'applied').length,
        reviewed: applications.filter(a => a.status === 'reviewed').length,
        interview: interviews,
        hired: hired,
      },
    };
  }, [jobs, applications, followers, teamMembers, company]);

  // Filter and sort applications
  const filteredApplications = useMemo(() => {
    let filtered = [...applications];
    
    if (filterStatus !== 'all') {
      filtered = filtered.filter(a => a.status === filterStatus);
    }
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(a => 
        a.candidate?.name?.toLowerCase().includes(term) ||
        a.job?.title?.toLowerCase().includes(term) ||
        a.candidate?.email?.toLowerCase().includes(term)
      );
    }
    
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.appliedAt?.toDate?.() || b.appliedAt) - new Date(a.appliedAt?.toDate?.() || a.appliedAt);
        case 'oldest':
          return new Date(a.appliedAt?.toDate?.() || a.appliedAt) - new Date(b.appliedAt?.toDate?.() || b.appliedAt);
        case 'match':
          return (b.matchScore || 0) - (a.matchScore || 0);
        default:
          return 0;
      }
    });
    
    return filtered;
  }, [applications, filterStatus, sortBy, searchTerm]);

  // ============================================
  // HANDLERS
  // ============================================

  const handleLogoUpload = async () => {
    if (!logoFile || !companyId) return;

    try {
      setUploadingLogo(true);

      const token = await auth.currentUser?.getIdToken();
      if (!token) throw new Error('Please sign in again before uploading the company logo.');
      const formData = new FormData();
      formData.append('file', logoFile);
      formData.append('assetType', 'logo');
      const response = await fetch(`${API_BASE_URL}/api/media/company/branding-image`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || !payload.success || !payload.data?.url) {
        throw new Error(payload.message || 'Company logo upload failed.');
      }

      showNotification('success', 'Logo updated successfully!');
      setShowLogoUpload(false);
      setLogoFile(null);
      setLogoPreview(null);
    } catch (error) {
      console.error('Error uploading logo:', error);
      showNotification('error', error.message || 'Failed to upload logo. Please try again.');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      showNotification('error', 'Please select a valid image file (JPEG, PNG, GIF, or WebP)');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showNotification('error', 'File size must be less than 5MB');
      return;
    }

    setLogoFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleUpdateApplicationStatus = async (applicationId, newStatus) => {
    try {
      await updateDoc(doc(db, 'applications', applicationId), {
        status: newStatus,
        [`${newStatus}At`]: serverTimestamp(),
        updatedAt: serverTimestamp(),
        updatedBy: companyId,
      });

      // Add activity to Supabase
      await supabase
        .from('company_activities')
        .insert({
          company_id: companyId,
          activity_type: 'application_status_updated',
          metadata: { application_id: applicationId, new_status: newStatus },
          created_at: new Date().toISOString(),
        });

      showNotification('success', `Application status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating application status:', error);
      showNotification('error', 'Failed to update application status');
    }
  };

  const handleToggleJobStatus = async (job) => {
    try {
      const newStatus = job.status === 'active' ? 'paused' : 'active';
      await updateDoc(doc(db, 'jobs', job.id), {
        status: newStatus,
        updatedAt: serverTimestamp(),
      });
      showNotification('success', `Job ${newStatus === 'active' ? 'activated' : 'paused'}`);
    } catch (error) {
      console.error('Error toggling job status:', error);
      showNotification('error', 'Failed to update job status');
    }
  };

  const handleDeleteJob = async (job) => {
    setItemToDelete(job);
    setDeleteType('job');
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;

    try {
      if (deleteType === 'job') {
        await deleteDoc(doc(db, 'jobs', itemToDelete.id));
        showNotification('success', 'Job deleted successfully');
      } else if (deleteType === 'application') {
        await deleteDoc(doc(db, 'applications', itemToDelete.id));
        showNotification('success', 'Application deleted successfully');
      } else if (deleteType === 'notification') {
        await deleteDoc(doc(db, 'companyNotifications', itemToDelete.id));
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      showNotification('error', 'Failed to delete item');
    } finally {
      setShowDeleteConfirm(false);
      setItemToDelete(null);
      setDeleteType(null);
    }
  };

  const handleMarkNotificationRead = async (notificationId) => {
    try {
      await updateDoc(doc(db, 'companyNotifications', notificationId), {
        read: true,
        readAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleLikePost = async (postId) => {
    try {
      const postRef = doc(db, 'socialPosts', postId);
      const postDoc = await getDoc(postRef);
      
      if (postDoc.exists()) {
        const post = postDoc.data();
        const likes = post.likes || [];
        const isLiked = likes.includes(companyId);
        
        await updateDoc(postRef, {
          likes: isLiked ? arrayRemove(companyId) : arrayUnion(companyId),
          likesCount: increment(isLiked ? -1 : 1),
        });
      }
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleSharePost = async (postId) => {
    try {
      const postUrl = `${window.location.origin}/company/posts/${postId}`;
      
      if (navigator.share) {
        await navigator.share({
          title: 'Check out this post',
          url: postUrl,
        });
      } else {
        await navigator.clipboard.writeText(postUrl);
        showNotification('success', 'Link copied to clipboard');
      }
    } catch (error) {
      console.error('Error sharing post:', error);
    }
  };

  const handleViewApplication = (application) => {
    setSelectedApplication(application);
    setShowApplicationModal(true);
  };

  const handleMessageCandidate = (application) => {
    navigate(`/company/chat?candidate=${application.candidateId}`);
  };

  const handleViewJob = (job) => {
    navigate(`/company/jobs/${job.id}`);
  };

  const handleEditJob = (job) => {
    navigate(`/company/jobs/${job.id}/edit`);
  };

  // ============================================
  // RENDER
  // ============================================

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-32 bg-white dark:bg-gray-800 rounded-xl"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-40 bg-white dark:bg-gray-800 rounded-xl"></div>
              ))}
            </div>
            <div className="h-64 bg-white dark:bg-gray-800 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 max-w-md text-center">
          <FaExclamationTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Something went wrong
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  const companyName = company?.name || company?.companyName || userProfile?.companyName || 'Your Company';
  const displayName = userProfile?.displayName || userProfile?.fullName || '';
  const unreadNotifications = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Offline Banner */}
      <AnimatePresence>
        {!isOnline && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-yellow-500 text-white px-4 py-2 text-center text-sm"
          >
            <FaWifi className="w-4 h-4 inline mr-2" />
            You are offline. Some features may be limited.
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto p-4 md:p-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm mb-6"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {/* Company Logo */}
              <div className="relative group">
                {company?.logo ? (
                  <img
                    src={company.logo}
                    alt={companyName}
                    className="w-16 h-16 rounded-xl object-cover border-2 border-gray-100 dark:border-gray-700"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                    {companyName.charAt(0)}
                  </div>
                )}
                <button
                  onClick={() => setShowLogoUpload(true)}
                  className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <FaCamera className="w-6 h-6 text-white" />
                </button>
              </div>

              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {greeting}, {displayName || companyName}!
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                  Here's what's happening with your company today
                </p>
                <div className="flex items-center gap-3 mt-2">
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                    company?.isVerified 
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                  }`}>
                    <FaShieldAlt className="w-3 h-3" />
                    {company?.isVerified ? 'Verified' : 'Unverified'}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-gray-500">
                    <FaEye className="w-3 h-3" />
                    {formatNumber(stats.profileViews)} profile views
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <TestimonialComposer userType="company" profile={{ ...userProfile, companyName }} />
              <button
                onClick={() => navigate('/company/notifications')}
                className="relative p-3 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <FaBell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                {unreadNotifications > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {unreadNotifications > 9 ? '9+' : unreadNotifications}
                  </span>
                )}
              </button>
              <button
                onClick={() => navigate('/company/jobs/create')}
                className="px-4 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <FaPlus className="w-4 h-4" />
                Post Job
              </button>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            title="Total Jobs"
            value={stats.totalJobs}
            icon={FaBriefcase}
            color="blue"
            subtitle={`${stats.activeJobs} active`}
            onClick={() => navigate('/company/jobs')}
          />
          <StatCard
            title="Applications"
            value={stats.totalApplications}
            icon={FaUsers}
            color="green"
            subtitle={`${stats.pendingReviews} pending review`}
            onClick={() => navigate('/company/applications')}
          />
          <StatCard
            title="Interview Rate"
            value={`${stats.interviewRate}%`}
            icon={FaChartLine}
            color="purple"
            change={5}
            changeType="positive"
            onClick={() => navigate('/company/analytics')}
          />
          <StatCard
            title="Avg. Time to Hire"
            value={`${stats.avgTimeToHire} days`}
            icon={FaClock}
            color="orange"
            change={-2}
            changeType="positive"
            onClick={() => navigate('/company/analytics')}
          />
        </div>

        {/* Discovery shortcuts moved here from the company sidebar. */}
        <section className="mb-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800" aria-labelledby="company-discovery-title">
          <div className="mb-4">
            <h2 id="company-discovery-title" className="text-lg font-semibold text-gray-900 dark:text-white">Discover talent and partners</h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Search registered students, organizations, and the company marketplace.</p>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {[
              { label: 'Find students', detail: 'Explore registered student profiles', icon: FaUsers, path: '/company/search/students' },
              { label: 'Find partners', detail: 'Connect with organizations', icon: FaBuilding, path: '/company/search/partners' },
              { label: 'Explore marketplace', detail: 'Browse opportunities and listings', icon: FaStore, path: '/company/search/market' },
            ].map(({ label, detail, icon: Icon, path }) => (
              <Link key={path} to={path} className="group flex min-w-0 items-center gap-3 rounded-xl border border-gray-200 p-4 transition hover:border-blue-400 hover:bg-blue-50/60 dark:border-gray-700 dark:hover:border-blue-500 dark:hover:bg-gray-700/70">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"><Icon className="h-5 w-5" /></span>
                <span className="min-w-0 flex-1"><span className="block font-medium text-gray-900 dark:text-white">{label}</span><span className="mt-0.5 block text-sm text-gray-500 dark:text-gray-400">{detail}</span></span>
                <FaArrowRight aria-hidden="true" className="h-4 w-4 shrink-0 text-gray-400 transition group-hover:translate-x-1 group-hover:text-blue-600" />
              </Link>
            ))}
          </div>
        </section>

        {/* Pipeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <FaChartArea className="w-5 h-5 text-blue-600" />
              Recruitment Pipeline
            </h2>
            <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-medium rounded-full">
              Real-time
            </span>
          </div>
          <div className="flex flex-col md:flex-row gap-4">
            <PipelineStage
              stage="new"
              count={stats.pipelineStats.new}
              color="bg-blue-100 text-blue-600"
              icon={FaUserPlus}
              total={stats.totalApplications}
              onClick={() => navigate('/company/applications?status=applied')}
            />
            <PipelineStage
              stage="reviewed"
              count={stats.pipelineStats.reviewed}
              color="bg-indigo-100 text-indigo-600"
              icon={FaEye}
              total={stats.totalApplications}
              onClick={() => navigate('/company/applications?status=reviewed')}
            />
            <PipelineStage
              stage="interview"
              count={stats.pipelineStats.interview}
              color="bg-purple-100 text-purple-600"
              icon={FaCalendarAlt}
              total={stats.totalApplications}
              onClick={() => navigate('/company/applications?status=interview')}
            />
            <PipelineStage
              stage="hired"
              count={stats.pipelineStats.hired}
              color="bg-green-100 text-green-600"
              icon={FaUserCheck}
              total={stats.totalApplications}
              onClick={() => navigate('/company/applications?status=hired')}
            />
          </div>
        </motion.div>

        {/* Quick Actions */}
        <AnimatePresence>
          {showQuickActions && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm mb-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <FaBolt className="w-5 h-5 text-yellow-500" />
                  Quick Actions
                </h2>
                <button
                  onClick={() => setShowQuickActions(false)}
                  className="p-1 text-gray-400 hover:text-gray-600"
                >
                  <FaTimes className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { icon: FaRocket, label: 'Post Job', color: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20', onClick: () => navigate('/company/jobs/create') },
                  { icon: FaUserCheck, label: 'Review Apps', color: 'bg-green-50 text-green-600 dark:bg-green-900/20', onClick: () => navigate('/company/applications'), badge: stats.pendingReviews },
                  { icon: FaCalendarCheck, label: 'Schedule', color: 'bg-purple-50 text-purple-600 dark:bg-purple-900/20', onClick: () => navigate('/company/schedule-interview') },
                  { icon: FaChartBar, label: 'Analytics', color: 'bg-orange-50 text-orange-600 dark:bg-orange-900/20', onClick: () => navigate('/company/analytics') },
                  { icon: FaUsersCog, label: 'Team', color: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20', onClick: () => navigate('/company/teams') },
                  { icon: FaBuilding, label: 'Profile', color: 'bg-pink-50 text-pink-600 dark:bg-pink-900/20', onClick: () => navigate('/company/profile') },
                  { icon: FaCommentDots, label: 'Messages', color: 'bg-teal-50 text-teal-600 dark:bg-teal-900/20', onClick: () => navigate('/company/chat') },
                  { icon: FaFileContract, label: 'Documents', color: 'bg-gray-50 text-gray-600 dark:bg-gray-700', onClick: () => navigate('/company/documents') },
                ].map((action, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={action.onClick}
                    className="relative flex flex-col items-center justify-center p-4 rounded-xl border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all"
                  >
                    <div className={`p-3 rounded-xl ${action.color} mb-2`}>
                      <action.icon className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {action.label}
                    </span>
                    {action.badge > 0 && (
                      <span className="absolute top-2 right-2 px-1.5 py-0.5 bg-red-500 text-white text-xs rounded-full">
                        {action.badge}
                      </span>
                    )}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
          {/* Tab Navigation */}
          <div className="flex border-b border-gray-100 dark:border-gray-700 overflow-x-auto">
            {[
              { id: 'overview', label: 'Overview', icon: FaChartPie },
              { id: 'applications', label: 'Applications', icon: FaFileAlt, badge: stats.pendingReviews },
              { id: 'jobs', label: 'Jobs', icon: FaBriefcase },
              { id: 'social', label: 'Social', icon: FaBullhorn },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50 dark:bg-blue-900/10'
                    : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
                {tab.badge > 0 && (
                  <span className="px-1.5 py-0.5 bg-red-500 text-white text-xs rounded-full">
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-6">
            <AnimatePresence mode="wait">
              {activeTab === 'overview' && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="grid grid-cols-1 lg:grid-cols-3 gap-6"
                >
                  {/* Recent Applications */}
                  <div className="lg:col-span-2">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Recent Applications
                      </h3>
                      <Link
                        to="/company/applications"
                        className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                      >
                        View All
                        <FaArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                    <div className="space-y-3">
                      {applications.slice(0, 5).map((application) => (
                        <ApplicationCard
                          key={application.id}
                          application={application}
                          onView={handleViewApplication}
                          onUpdateStatus={handleUpdateApplicationStatus}
                          onMessage={handleMessageCandidate}
                        />
                      ))}
                      {applications.length === 0 && (
                        <div className="text-center py-12">
                          <FaFileAlt className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                          <p className="text-gray-500">No applications yet</p>
                          <button
                            onClick={() => navigate('/company/jobs/create')}
                            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
                          >
                            Post Your First Job
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Sidebar */}
                  <div className="space-y-6">
                    {/* Notifications */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Notifications
                      </h3>
                      <div className="space-y-2">
                        {notifications.slice(0, 5).map((notification) => (
                          <NotificationItem
                            key={notification.id}
                            notification={notification}
                            onRead={handleMarkNotificationRead}
                            onDelete={(id) => {
                              setItemToDelete({ id });
                              setDeleteType('notification');
                              setShowDeleteConfirm(true);
                            }}
                          />
                        ))}
                        {notifications.length === 0 && (
                          <p className="text-sm text-gray-500 text-center py-4">
                            No notifications
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Team Members */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Team Members
                      </h3>
                      <div className="flex -space-x-2">
                        {teamMembers.slice(0, 5).map((member) => (
                          <div
                            key={member.id}
                            className="w-10 h-10 rounded-full border-2 border-white dark:border-gray-800 bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-medium"
                            title={member.name}
                          >
                            {member.name?.charAt(0) || 'U'}
                          </div>
                        ))}
                        {teamMembers.length > 5 && (
                          <div className="w-10 h-10 rounded-full border-2 border-white dark:border-gray-800 bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 text-sm font-medium">
                            +{teamMembers.length - 5}
                          </div>
                        )}
                      </div>
                      <Link
                        to="/company/teams"
                        className="mt-3 text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                      >
                        Manage Team
                        <FaArrowRight className="w-3 h-3" />
                      </Link>
                    </div>

                    {/* Followers */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Followers
                      </h3>
                      <div className="flex items-center gap-4">
                        <div className="text-3xl font-bold text-gray-900 dark:text-white">
                          {formatNumber(stats.totalFollowers)}
                        </div>
                        <div className="text-sm text-gray-500">
                          students following
                          <br />
                          your company
                        </div>
                      </div>
                      <Link
                        to="/company/followers"
                        className="mt-3 text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                      >
                        View All Followers
                        <FaArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'applications' && (
                <motion.div
                  key="applications"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  {/* Filters */}
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search applications..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-64"
                        />
                      </div>
                      <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="all">All Status</option>
                        <option value="applied">Applied</option>
                        <option value="reviewed">Reviewed</option>
                        <option value="interview">Interview</option>
                        <option value="hired">Hired</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </div>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="newest">Newest First</option>
                      <option value="oldest">Oldest First</option>
                      <option value="match">Best Match</option>
                    </select>
                  </div>

                  {/* Applications Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredApplications.map((application) => (
                      <ApplicationCard
                        key={application.id}
                        application={application}
                        onView={handleViewApplication}
                        onUpdateStatus={handleUpdateApplicationStatus}
                        onMessage={handleMessageCandidate}
                      />
                    ))}
                  </div>

                  {filteredApplications.length === 0 && (
                    <div className="text-center py-12">
                      <FaFileAlt className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">No applications found</p>
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'jobs' && (
                <motion.div
                  key="jobs"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Your Jobs ({jobs.length})
                    </h3>
                    <button
                      onClick={() => navigate('/company/jobs/create')}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                      <FaPlus className="w-4 h-4" />
                      Post New Job
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-100 dark:border-gray-700">
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Job</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Status</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Applications</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Views</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Posted</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {jobs.map((job) => (
                          <JobRow
                            key={job.id}
                            job={job}
                            onView={handleViewJob}
                            onEdit={handleEditJob}
                            onDelete={handleDeleteJob}
                            onToggleStatus={handleToggleJobStatus}
                          />
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {jobs.length === 0 && (
                    <div className="text-center py-12">
                      <FaBriefcase className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">No jobs posted yet</p>
                      <button
                        onClick={() => navigate('/company/jobs/create')}
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
                      >
                        Post Your First Job
                      </button>
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'social' && (
                <motion.div
                  key="social"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Company Feed
                    </h3>
                    <button
                      onClick={() => navigate('/company/social/create')}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                      <FaPlus className="w-4 h-4" />
                      Create Post
                    </button>
                  </div>

                  <div className="space-y-4">
                    {socialPosts.map((post) => (
                      <SocialPostCard
                        key={post.id}
                        post={post}
                        onLike={handleLikePost}
                        onComment={() => {}}
                        onShare={handleSharePost}
                      />
                    ))}
                    {socialPosts.length === 0 && (
                      <div className="text-center py-12">
                        <FaBullhorn className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">No posts yet</p>
                        <p className="text-sm text-gray-400 mt-1">
                          Share updates with your followers
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Logo Upload Modal */}
      <AnimatePresence>
        {showLogoUpload && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowLogoUpload(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Upload Company Logo
                </h3>
                <button
                  onClick={() => setShowLogoUpload(false)}
                  className="p-1 text-gray-400 hover:text-gray-600"
                >
                  <FaTimes className="w-5 h-5" />
                </button>
              </div>

              <div
                onClick={() => logoInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center cursor-pointer hover:border-blue-500 transition-colors"
              >
                {logoPreview ? (
                  <div>
                    <img
                      src={logoPreview}
                      alt="Logo preview"
                      className="w-32 h-32 mx-auto rounded-xl object-cover mb-4"
                    />
                    <p className="text-sm text-gray-500">Click to change</p>
                  </div>
                ) : (
                  <div>
                    <FaCloudUploadAlt className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-300 font-medium">
                      Click to upload
                    </p>
                    <p className="text-sm text-gray-400 mt-1">
                      PNG, JPG, GIF up to 5MB
                    </p>
                  </div>
                )}
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>

              <div className="flex items-center gap-3 mt-6">
                <button
                  onClick={() => setShowLogoUpload(false)}
                  className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogoUpload}
                  disabled={!logoFile || uploadingLogo}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {uploadingLogo ? (
                    <>
                      <FaSpinner className="w-4 h-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <FaUpload className="w-4 h-4" />
                      Upload
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowDeleteConfirm(false)}
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
                    Confirm Delete
                  </h3>
                  <p className="text-sm text-gray-500">
                    This action cannot be undone
                  </p>
                </div>
              </div>

              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Are you sure you want to delete this {deleteType}? This will permanently remove it from your records.
              </p>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Application Detail Modal */}
      <AnimatePresence>
        {showApplicationModal && selectedApplication && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowApplicationModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Application Details
                </h3>
                <button
                  onClick={() => setShowApplicationModal(false)}
                  className="p-1 text-gray-400 hover:text-gray-600"
                >
                  <FaTimes className="w-5 h-5" />
                </button>
              </div>

              {/* Candidate Info */}
              <div className="flex items-start gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
                  {selectedApplication.candidate?.name?.charAt(0) || 'C'}
                </div>
                <div>
                  <h4 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {selectedApplication.candidate?.name || 'Unknown Candidate'}
                  </h4>
                  <p className="text-gray-500">{selectedApplication.candidate?.email}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                      getStatusConfig(selectedApplication.status).bg
                    } ${getStatusConfig(selectedApplication.status).text}`}>
                      {getStatusConfig(selectedApplication.status).label}
                    </span>
                    {selectedApplication.matchScore && (
                      <span className="text-sm text-gray-500">
                        {selectedApplication.matchScore}% match
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Job Info */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 mb-6">
                <h5 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                  Applied For
                </h5>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {selectedApplication.job?.title || 'Position'}
                </p>
                <p className="text-sm text-gray-500">
                  {selectedApplication.job?.location || 'Remote'}
                </p>
              </div>

              {/* Skills */}
              {selectedApplication.candidate?.skills?.length > 0 && (
                <div className="mb-6">
                  <h5 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                    Skills
                  </h5>
                  <div className="flex flex-wrap gap-2">
                    {selectedApplication.candidate.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full text-sm"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                {selectedApplication.status === 'applied' && (
                  <button
                    onClick={() => {
                      handleUpdateApplicationStatus(selectedApplication.id, 'reviewed');
                      setShowApplicationModal(false);
                    }}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                  >
                    Mark as Reviewed
                  </button>
                )}
                {selectedApplication.status === 'reviewed' && (
                  <button
                    onClick={() => {
                      handleUpdateApplicationStatus(selectedApplication.id, 'interview');
                      setShowApplicationModal(false);
                    }}
                    className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
                  >
                    Schedule Interview
                  </button>
                )}
                <button
                  onClick={() => handleMessageCandidate(selectedApplication)}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Send Message
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="mx-auto w-full max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
        <SocialDashboardSection audience="company" title="Career Connect network" subtitle="Share company updates publicly or with your accepted connections, and connect with members across the platform." />
      </div>
    </div>
  );
};

export default CompanyDashboard;
