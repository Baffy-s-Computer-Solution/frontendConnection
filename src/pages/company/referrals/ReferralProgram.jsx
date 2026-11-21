// src/pages/company/referrals/ReferralProgram.jsx
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FaUserPlus, FaUsers, FaGift, FaTrophy, FaAward, FaMedal, FaCrown, FaGem, FaMoneyBillWave, FaDollarSign, FaCoins, FaPiggyBank, FaHandHoldingUsd, FaHandshake, FaHandsHelping, FaHeart, FaStar, FaRegStar, FaCheckCircle, FaTimesCircle, FaClock, FaCalendarAlt, FaHourglass, FaHourglassHalf, FaSearch, FaFilter, FaSort, FaSortAmountDown, FaSortAmountUp, FaEllipsisV, FaEye, FaEdit, FaTrash, FaCopy, FaLink, FaShare, FaShareAlt, FaPaperPlane, FaEnvelope, FaPhone, FaWhatsapp, FaTwitter, FaLinkedin, FaFacebook, FaPlus, FaTimes, FaCheck, FaSpinner, FaExclamationTriangle, FaInfoCircle, FaRocket, FaBolt, FaFire, FaSnowflake, FaSun, FaMoon, FaChartLine, FaChartBar, FaChartPie, FaPercentage, FaArrowUp, FaArrowDown, FaArrowRight, FaArrowLeft, FaExternalLinkAlt, FaDownload, FaFileExport, FaHistory, FaUndo, FaRedo, FaCog, FaSlidersH, FaToggleOn, FaToggleOff, FaBell, FaRegBell, FaComment, FaRegCommentDots, FaCommentDots, FaThumbsUp, FaRegThumbsUp, FaHeart as FaHeartSolid, FaStar as FaStarSolid, FaCrown as FaCrownSolid, FaTrophy as FaTrophySolid, FaAward as FaAwardSolid, FaMedal as FaMedalSolid, FaGem as FaGemSolid, FaUserFriends, FaUsersCog, FaUserTie, FaUserCheck, FaBriefcase, FaBuilding, FaGlobe, FaMapMarkerAlt, FaGraduationCap, FaBook, FaBookOpen, FaClipboard, FaClipboardCheck, FaClipboardList, FaTasks, FaCheckDouble, FaCalendarCheck, FaCalendarDay, FaCalendarWeek, FaRegCalendar, FaRegClock, FaStopwatch, FaPlay, FaPause, FaStop, FaFastForward, FaFastBackward, FaStepForward, FaStepBackward, FaFlag, FaFlagCheckered, FaBullseye, FaCrosshairs, FaMapPin, FaDirections, FaRoute, FaCompass, FaLocationArrow, FaMailBulk, FaEnvelopeOpen, FaEnvelopeOpenText, FaPaperclip, FaRegPaperPlane, FaInbox, FaLayerGroup, FaCube, FaCubes, FaPuzzlePiece, FaLightbulb, FaBrain, FaRobot, FaMagic, FaHandSparkles, FaMousePointer, FaHandPointer, FaRegHandPointer, FaRegThumbsUp as FaRegThumbsUpSolid, FaThumbsDown, FaRegThumbsDown, FaSmile, FaRegSmile, FaGrin, FaGrinStars, FaGrinHearts, FaGrinBeam, FaGrinTears, FaLaugh, FaLaughBeam, FaMeh, FaRegMeh, FaFrown, FaRegFrown, FaSadTear, FaRegSadTear, FaAngry, FaRegAngry, FaSurprise, FaRegSurprise, FaFlushed, FaDizzy, FaTired, FaRegTired, FaKiss, FaRegKiss, FaGrimace, FaMehBlank, FaFrownOpen, FaSadCry, FaGrinAlt } from "react-icons/fa";
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
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  increment,
  writeBatch,
  Timestamp,
} from 'firebase/firestore';

import { useAuth } from '../../../context/AuthContext';
import { useNotification } from '../../../context/NotificationContext';
import { db } from '../../../config/firebase';

// ============================================
// CONSTANTS
// ============================================

const REFERRAL_STATUSES = [
  { value: 'all', label: 'All Referrals' },
  { value: 'pending', label: 'Pending', color: 'yellow', icon: FaClock },
  { value: 'applied', label: 'Applied', color: 'blue', icon: FaPaperPlane },
  { value: 'interviewing', label: 'Interviewing', color: 'purple', icon: FaCalendarAlt },
  { value: 'hired', label: 'Hired', color: 'green', icon: FaCheckCircle },
  { value: 'rejected', label: 'Not Selected', color: 'red', icon: FaTimesCircle },
];

const REWARD_TYPES = [
  { value: 'cash', label: 'Cash Bonus', icon: FaMoneyBillWave, color: 'green' },
  { value: 'gift-card', label: 'Gift Card', icon: FaGift, color: 'purple' },
  { value: 'extra-pto', label: 'Extra PTO', icon: FaCalendarDay, color: 'blue' },
  { value: 'recognition', label: 'Recognition', icon: FaTrophy, color: 'yellow' },
  { value: 'equipment', label: 'Equipment', icon: FaGem, color: 'pink' },
  { value: 'other', label: 'Other', icon: FaGift, color: 'gray' },
];

const DEFAULT_REWARDS = {
  applied: { type: 'cash', amount: 250, description: 'When your referral applies' },
  interviewing: { type: 'cash', amount: 500, description: 'When they reach the interview stage' },
  hired: { type: 'cash', amount: 2000, description: 'When they get hired and complete onboarding' },
};

const REWARD_TIERS = [
  { referrals: 1, badge: 'Starter', icon: FaStar, color: 'blue' },
  { referrals: 3, badge: 'Connector', icon: FaMedal, color: 'purple' },
  { referrals: 5, badge: 'Advocate', icon: FaAward, color: 'orange' },
  { referrals: 10, badge: 'Champion', icon: FaTrophy, color: 'yellow' },
  { referrals: 25, badge: 'Legend', icon: FaCrown, color: 'red' },
];

// ============================================
// UTILITY FUNCTIONS
// ============================================

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

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 30) return `${diffDays}d ago`;
  return formatDate(past);
};

const getStatusConfig = (status) => {
  const configs = {
    pending: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-300', icon: FaClock, label: 'Pending' },
    applied: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-300', icon: FaPaperPlane, label: 'Applied' },
    interviewing: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-300', icon: FaCalendarAlt, label: 'Interviewing' },
    hired: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-300', icon: FaCheckCircle, label: 'Hired' },
    rejected: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-300', icon: FaTimesCircle, label: 'Not Selected' },
  };
  return configs[status] || configs.pending;
};

const getRewardTier = (referralCount) => {
  let currentTier = null;
  for (const tier of REWARD_TIERS) {
    if (referralCount >= tier.referrals) {
      currentTier = tier;
    } else {
      break;
    }
  }
  return currentTier || { referrals: 0, badge: 'Newcomer', icon: FaUserPlus, color: 'gray' };
};

const generateReferralCode = (companyName = 'COMP', length = 8) => {
  const prefix = companyName.substring(0, 4).toUpperCase().replace(/[^A-Z]/g, '') || 'COMP';
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let suffix = '';
  for (let i = 0; i < length; i++) {
    suffix += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${prefix}-${suffix}`;
};

// ============================================
// CUSTOM HOOKS
// ============================================

const useReferralProgram = (companyId) => {
  const [data, setData] = useState({
    program: null,
    referrals: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!companyId) {
      setData(prev => ({ ...prev, loading: false }));
      return;
    }

    const unsubscribers = [];

    // Program settings
    const programUnsub = onSnapshot(
      doc(db, 'referralPrograms', companyId),
      (snapshot) => {
        if (snapshot.exists()) {
          const programData = snapshot.data();
          setData(prev => ({
            ...prev,
            program: {
              id: snapshot.id,
              ...programData,
              createdAt: programData.createdAt?.toDate?.() || programData.createdAt,
              updatedAt: programData.updatedAt?.toDate?.() || programData.updatedAt,
            },
          }));
        } else {
          setData(prev => ({ ...prev, program: null }));
        }
      },
      (err) => {
        console.error('Program error:', err);
        setData(prev => ({ ...prev, error: err.message, loading: false }));
      }
    );
    unsubscribers.push(programUnsub);

    // Referrals
    const referralsQuery = query(
      collection(db, 'referrals'),
      where('companyId', '==', companyId),
      orderBy('createdAt', 'desc'),
      limit(200)
    );

    const referralsUnsub = onSnapshot(
      referralsQuery,
      (snapshot) => {
        const referrals = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt,
          updatedAt: doc.data().updatedAt?.toDate?.() || doc.data().updatedAt,
          hiredAt: doc.data().hiredAt?.toDate?.() || doc.data().hiredAt,
        }));
        setData(prev => ({ ...prev, referrals, loading: false }));
      },
      (err) => {
        console.error('Referrals error:', err);
        setData(prev => ({ ...prev, error: err.message, loading: false }));
      }
    );
    unsubscribers.push(referralsUnsub);

    return () => unsubscribers.forEach(unsub => unsub());
  }, [companyId]);

  return data;
};

// ============================================
// COMPONENTS
// ============================================

const LoadingSkeleton = () => (
  <div className="animate-pulse space-y-6">
    <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
      ))}
    </div>
    <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
  </div>
);

const StatCard = ({ icon: Icon, label, value, color = 'blue', subtitle }) => {
  const colorClasses = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600',
    green: 'bg-green-50 dark:bg-green-900/20 text-green-600',
    yellow: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600',
    purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600',
    red: 'bg-red-50 dark:bg-red-900/20 text-red-600',
    orange: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700"
    >
      <div className={`p-2.5 rounded-lg inline-block mb-3 ${colorClasses[color]}`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-3xl font-bold text-gray-900 dark:text-white">
        {typeof value === 'number' ? formatNumber(value) : value}
      </p>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{label}</p>
      {subtitle && (
        <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>
      )}
    </motion.div>
  );
};

const ReferralCard = ({ referral, onView, onUpdateStatus }) => {
  const statusConfig = getStatusConfig(referral.status);
  const StatusIcon = statusConfig.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3">
          {referral.referrerPhoto ? (
            <img
              src={referral.referrerPhoto}
              alt={referral.referrerName}
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
              {referral.referrerName?.charAt(0) || 'R'}
            </div>
          )}
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white">
              {referral.candidateName || 'Anonymous Candidate'}
            </h4>
            <p className="text-sm text-gray-500">
              Referred by {referral.referrerName || 'Team Member'}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.text}`}>
                <StatusIcon className="w-3 h-3" />
                {statusConfig.label}
              </span>
              {referral.rewardAmount && (
                <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-xs font-medium">
                  {formatCurrency(referral.rewardAmount)}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {referral.candidateEmail && (
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
          <FaEnvelope className="w-3.5 h-3.5" />
          <span className="truncate">{referral.candidateEmail}</span>
        </div>
      )}

      {referral.jobTitle && (
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
          <FaBriefcase className="w-3.5 h-3.5" />
          <span className="truncate">{referral.jobTitle}</span>
        </div>
      )}

      <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
        <span className="text-xs text-gray-400">
          {formatTimeAgo(referral.createdAt)}
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onView(referral)}
            className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <FaEye className="w-3 h-3" />
            View
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const ReferralLinkCard = ({ referralCode, referralUrl, onCopy }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    onCopy(referralUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl p-6 text-white">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-white/20 rounded-lg">
          <FaLink className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-semibold">Your Referral Link</h3>
          <p className="text-xs text-white/80">Share with your network</p>
        </div>
      </div>

      <div className="bg-white/10 rounded-lg p-3 mb-4">
        <p className="text-xs text-white/70 mb-1">Your Code</p>
        <p className="text-2xl font-bold font-mono">{referralCode}</p>
      </div>

      <div className="flex gap-2">
        <div className="flex-1 bg-white/10 rounded-lg p-3 truncate">
          <p className="text-xs text-white/70 truncate">{referralUrl}</p>
        </div>
        <button
          onClick={handleCopy}
          className="px-4 py-3 bg-white text-blue-600 rounded-lg font-medium hover:bg-white/90 transition-colors flex items-center gap-2"
        >
          {copied ? <FaCheck className="w-4 h-4" /> : <FaCopy className="w-4 h-4" />}
        </button>
      </div>

      <div className="flex gap-2 mt-4">
        <a
          href={`https://wa.me/?text=${encodeURIComponent(`Check out these opportunities at our company! ${referralUrl}`)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-center text-sm font-medium transition-colors flex items-center justify-center gap-2"
        >
          <FaWhatsapp className="w-4 h-4" />
          WhatsApp
        </a>
        <a
          href={`https://twitter.com/intent/tweet?text=${encodeURIComponent('Check out these opportunities!')}&url=${encodeURIComponent(referralUrl)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-center text-sm font-medium transition-colors flex items-center justify-center gap-2"
        >
          <FaTwitter className="w-4 h-4" />
          Twitter
        </a>
        <a
          href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralUrl)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-center text-sm font-medium transition-colors flex items-center justify-center gap-2"
        >
          <FaLinkedin className="w-4 h-4" />
          LinkedIn
        </a>
      </div>
    </div>
  );
};

const RewardSettingsModal = ({ 
  show, 
  onClose, 
  program, 
  onSave, 
  saving 
}) => {
  const [rewards, setRewards] = useState(DEFAULT_REWARDS);
  const [programEnabled, setProgramEnabled] = useState(true);

  useEffect(() => {
    if (program?.rewards) {
      setRewards(program.rewards);
    }
    if (program?.enabled !== undefined) {
      setProgramEnabled(program.enabled);
    }
  }, [program]);

  const handleRewardChange = (stage, field, value) => {
    setRewards(prev => ({
      ...prev,
      [stage]: {
        ...prev[stage],
        [field]: value,
      },
    }));
  };

  const handleSave = () => {
    onSave({ rewards, enabled: programEnabled });
  };

  if (!show) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-2xl my-8"
        >
          <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Referral Program Settings
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <FaTimes className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
            {/* Enable toggle */}
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  Program Status
                </p>
                <p className="text-sm text-gray-500">
                  Enable or disable the referral program
                </p>
              </div>
              <button
                onClick={() => setProgramEnabled(!programEnabled)}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  programEnabled ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <span
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                    programEnabled ? 'left-7' : 'left-1'
                  }`}
                />
              </button>
            </div>

            {/* Reward Configuration */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Reward Structure
              </h3>

              {Object.entries(rewards).map(([stage, reward]) => {
                const statusConfig = getStatusConfig(stage);
                const StatusIcon = statusConfig.icon;
                return (
                  <div key={stage} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                    <div className="flex items-center gap-2 mb-3">
                      <StatusIcon className={`w-4 h-4 ${statusConfig.text}`} />
                      <span className="font-medium text-gray-900 dark:text-white capitalize">
                        {statusConfig.label} Stage
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">
                          Reward Type
                        </label>
                        <select
                          value={reward.type}
                          onChange={(e) => handleRewardChange(stage, 'type', e.target.value)}
                          className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          {REWARD_TYPES.map(type => (
                            <option key={type.value} value={type.value}>{type.label}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs text-gray-500 mb-1">
                          Amount (M)
                        </label>
                        <input
                          type="number"
                          value={reward.amount}
                          onChange={(e) => handleRewardChange(stage, 'amount', parseInt(e.target.value) || 0)}
                          className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          min="0"
                          step="50"
                        />
                      </div>
                    </div>

                    <div className="mt-3">
                      <label className="block text-xs text-gray-500 mb-1">
                        Description
                      </label>
                      <input
                        type="text"
                        value={reward.description}
                        onChange={(e) => handleRewardChange(stage, 'description', e.target.value)}
                        className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-100 dark:border-gray-700">
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {saving ? (
                <>
                  <FaSpinner className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <FaCheck className="w-4 h-4" />
                  Save Settings
                </>
              )}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================

const ReferralProgram = () => {
  const navigate = useNavigate();
  const { currentUser, userProfile } = useAuth();
  const { showNotification } = useNotification();

  const companyId = currentUser?.uid;
  const { program, referrals, loading, error } = useReferralProgram(companyId);

  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [referralCode, setReferralCode] = useState('');
  const referralCodeInitializationStarted = useRef(false);

  useEffect(() => {
    if (program?.referralCode) {
      setReferralCode(program.referralCode);
      referralCodeInitializationStarted.current = true;
    } else if (companyId && !loading && !referralCodeInitializationStarted.current) {
      referralCodeInitializationStarted.current = true;
      const code = generateReferralCode(userProfile?.companyName || 'COMP');
      setDoc(doc(db, 'referralPrograms', companyId), {
        companyId,
        referralCode: code,
        rewards: program?.rewards || DEFAULT_REWARDS,
        enabled: program?.enabled ?? true,
        ...(program?.id ? {} : { createdAt: serverTimestamp() }),
        updatedAt: serverTimestamp(),
      }, { merge: true })
        .then(() => setReferralCode(code))
        .catch((error) => {
          referralCodeInitializationStarted.current = false;
          console.error('Failed to initialize company referral program:', error);
          showNotification('error', error.message || 'Could not create the referral program');
        });
    }
  }, [program, companyId, loading, userProfile, showNotification]);

  const referralUrl = useMemo(() => {
    const baseUrl = window.location.origin;
    const params = new URLSearchParams({ ref: referralCode, company: companyId || '' });
    return `${baseUrl}/register?${params.toString()}`;
  }, [referralCode, companyId]);

  // Stats
  const stats = useMemo(() => {
    const total = referrals.length;
    const hired = referrals.filter(r => r.status === 'hired').length;
    const interviewing = referrals.filter(r => r.status === 'interviewing').length;
    const pending = referrals.filter(r => r.status === 'pending').length;

    const totalRewards = referrals
      .filter(r => r.status === 'hired')
      .reduce((sum, r) => sum + (r.rewardAmount || 0), 0);

    const conversionRate = total > 0 ? (hired / total) * 100 : 0;

    return {
      total,
      hired,
      interviewing,
      pending,
      totalRewards,
      conversionRate,
    };
  }, [referrals]);

  // Filtered referrals
  const filteredReferrals = useMemo(() => {
    let filtered = [...referrals];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(r =>
        (r.candidateName?.toLowerCase() || '').includes(term) ||
        (r.candidateEmail?.toLowerCase() || '').includes(term) ||
        (r.referrerName?.toLowerCase() || '').includes(term) ||
        (r.jobTitle?.toLowerCase() || '').includes(term)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(r => r.status === statusFilter);
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'reward':
          return (b.rewardAmount || 0) - (a.rewardAmount || 0);
        case 'candidate':
          return (a.candidateName || '').localeCompare(b.candidateName || '');
        default:
          return 0;
      }
    });

    return filtered;
  }, [referrals, searchTerm, statusFilter, sortBy]);

  // Top referrers
  const topReferrers = useMemo(() => {
    const referrerCounts = {};
    referrals.forEach(r => {
      if (r.referrerId) {
        if (!referrerCounts[r.referrerId]) {
          referrerCounts[r.referrerId] = {
            id: r.referrerId,
            name: r.referrerName,
            photo: r.referrerPhoto,
            count: 0,
            hired: 0,
          };
        }
        referrerCounts[r.referrerId].count++;
        if (r.status === 'hired') {
          referrerCounts[r.referrerId].hired++;
        }
      }
    });

    return Object.values(referrerCounts)
      .sort((a, b) => b.hired - a.hired || b.count - a.count)
      .slice(0, 5);
  }, [referrals]);

  // ============================================
  // HANDLERS
  // ============================================

  const handleSaveSettings = async (settings) => {
    if (!companyId) return;

    try {
      setSaving(true);

      const programData = {
        companyId,
        referralCode,
        rewards: settings.rewards,
        enabled: settings.enabled,
        updatedAt: serverTimestamp(),
      };

      await setDoc(doc(db, 'referralPrograms', companyId), {
        ...programData,
        ...(program?.id ? {} : { createdAt: serverTimestamp() }),
      }, { merge: true });

      showNotification('success', 'Settings saved successfully');
      setShowSettingsModal(false);
    } catch (error) {
      console.error('Error saving settings:', error);
      showNotification('error', 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleCopyLink = async (url) => {
    try {
      await navigator.clipboard.writeText(url);
      showNotification('success', 'Link copied to clipboard');
    } catch (error) {
      console.error('Error copying:', error);
      showNotification('error', 'Failed to copy link');
    }
  };

  const handleGenerateNewCode = async () => {
    try {
      const newCode = generateReferralCode(userProfile?.companyName || 'COMP');
      setReferralCode(newCode);

      await setDoc(doc(db, 'referralPrograms', companyId), {
        companyId,
        referralCode: newCode,
        rewards: program?.rewards || DEFAULT_REWARDS,
        enabled: program?.enabled ?? true,
        updatedAt: serverTimestamp(),
        ...(program?.id ? {} : { createdAt: serverTimestamp() }),
      }, { merge: true });

      showNotification('success', 'New referral code generated');
    } catch (error) {
      console.error('Error generating code:', error);
      showNotification('error', 'Failed to generate code');
    }
  };

  const handleExportReferrals = () => {
    try {
      const exportData = filteredReferrals.map(r => ({
        Candidate: r.candidateName || '',
        Email: r.candidateEmail || '',
        Referrer: r.referrerName || '',
        Job: r.jobTitle || '',
        Status: r.status,
        Reward: r.rewardAmount || 0,
        'Referred Date': formatDate(r.createdAt),
        'Hired Date': r.hiredAt ? formatDate(r.hiredAt) : '',
      }));

      const headers = Object.keys(exportData[0] || {}).join(',');
      const rows = exportData.map(row => Object.values(row).map(v => `"${v}"`).join(','));
      const csv = [headers, ...rows].join('\n');

      const blob = new Blob([csv], { type: 'text/csv' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `referrals-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();

      showNotification('success', 'Referrals exported');
    } catch (error) {
      console.error('Error exporting:', error);
      showNotification('error', 'Failed to export');
    }
  };

  // ============================================
  // RENDER
  // ============================================

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <LoadingSkeleton />
        </div>
      </div>
    );
  }

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
              <FaUserPlus className="w-8 h-8 text-blue-600" />
              Referral Program
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Reward your team for successful candidate referrals
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleExportReferrals}
              disabled={filteredReferrals.length === 0}
              className="px-4 py-2.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-medium border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <FaFileExport className="w-4 h-4" />
              Export
            </button>
            <button
              onClick={() => setShowSettingsModal(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <FaCog className="w-4 h-4" />
              Settings
            </button>
          </div>
        </motion.div>

        {error && (
          <div role="alert" className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-900/20 dark:text-red-300">
            Referral data could not be loaded: {error}
          </div>
        )}

        {/* Referral Link Card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2">
            <ReferralLinkCard
              referralCode={referralCode}
              referralUrl={referralUrl}
              onCopy={handleCopyLink}
            />
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <FaTrophy className="w-4 h-4 text-yellow-500" />
              Top Referrers
            </h3>
            {topReferrers.length > 0 ? (
              <div className="space-y-3">
                {topReferrers.map((referrer, index) => {
                  const tier = getRewardTier(referrer.hired);
                  const TierIcon = tier.icon;
                  return (
                    <div key={referrer.id} className="flex items-center gap-3">
                      <div className="relative">
                        {referrer.photo ? (
                          <img
                            src={referrer.photo}
                            alt={referrer.name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold">
                            {referrer.name?.charAt(0) || 'R'}
                          </div>
                        )}
                        {index < 3 && (
                          <div className={`absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center ${
                            index === 0 ? 'bg-yellow-500' :
                            index === 1 ? 'bg-gray-400' :
                            'bg-orange-600'
                          } text-white`}>
                            <span className="text-xs font-bold">{index + 1}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 dark:text-white truncate text-sm">
                          {referrer.name || 'Unknown'}
                        </p>
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <TierIcon className={`w-3 h-3 text-${tier.color}-500`} />
                          {tier.badge} • {referrer.hired} hired
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">
                No referrals yet
              </p>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard
            icon={FaUsers}
            label="Total Referrals"
            value={stats.total}
            color="blue"
          />
          <StatCard
            icon={FaUserCheck}
            label="Hired"
            value={stats.hired}
            color="green"
            subtitle={`${stats.conversionRate.toFixed(1)}% conversion`}
          />
          <StatCard
            icon={FaHourglassHalf}
            label="In Progress"
            value={stats.interviewing + stats.pending}
            color="yellow"
          />
          <StatCard
            icon={FaMoneyBillWave}
            label="Rewards Paid"
            value={formatCurrency(stats.totalRewards)}
            color="purple"
          />
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 mb-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="relative flex-1 w-full">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search referrals..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="flex-1 md:flex-none px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {REFERRAL_STATUSES.map(status => (
                  <option key={status.value} value={status.value}>{status.label}</option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="flex-1 md:flex-none px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="recent">Most Recent</option>
                <option value="oldest">Oldest First</option>
                <option value="reward">Highest Reward</option>
                <option value="candidate">Candidate Name</option>
              </select>
            </div>
          </div>
        </div>

        {/* Referrals List */}
        {filteredReferrals.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredReferrals.map((referral) => (
              <ReferralCard
                key={referral.id}
                referral={referral}
                onView={(r) => navigate(`/company/referrals/${r.id}`)}
              />
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-16 border border-gray-100 dark:border-gray-700 text-center"
          >
            <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaUserPlus className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {referrals.length === 0 ? 'No referrals yet' : 'No matches found'}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
              {referrals.length === 0
                ? 'Share your referral link with your team to start receiving referrals.'
                : 'Try adjusting your search or filter criteria.'}
            </p>
            {referrals.length === 0 && (
              <button
                onClick={() => handleCopyLink(referralUrl)}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
              >
                <FaShare className="w-4 h-4" />
                Share Referral Link
              </button>
            )}
          </motion.div>
        )}
      </div>

      {/* Settings Modal */}
      <RewardSettingsModal
        show={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        program={program}
        onSave={handleSaveSettings}
        saving={saving}
      />
    </div>
  );
};

export default ReferralProgram;
