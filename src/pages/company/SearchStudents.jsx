// src/pages/company/SearchStudents.jsx
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FaSearch, FaFilter, FaSort, FaSortAmountDown, FaSortAmountUp, FaUsers, FaUserGraduate, FaUserTie, FaGraduationCap, FaBriefcase, FaMapMarkerAlt, FaBuilding, FaStar, FaRegStar, FaHeart, FaRegHeart, FaBookmark, FaRegBookmark, FaEye, FaCommentDots, FaEnvelope, FaPhone, FaGlobe, FaLinkedin, FaGithub, FaTwitter, FaCheckCircle, FaTimesCircle, FaClock, FaCalendarAlt, FaSpinner, FaExclamationTriangle, FaInfoCircle, FaPlus, FaTimes, FaCheck, FaDownload, FaFileExport, FaExternalLinkAlt, FaUserPlus, FaUserCheck, FaUserTimes, FaPaperPlane, FaTh, FaList, FaThLarge, FaEllipsisV, FaChartLine, FaPercentage, FaAward, FaTrophy, FaMedal, FaCrown, FaGem, FaRocket, FaBolt, FaFire, FaSnowflake, FaSun, FaMoon, FaRobot, FaBrain, FaMagic, FaLightbulb, FaCode, FaLaptopCode, FaDatabase, FaCloud, FaMobile, FaDesktop, FaShieldAlt, FaWifi, FaHandshake, FaHandsHelping, FaHeart as FaHeartSolid, FaStar as FaStarSolid, FaRegStar as FaRegStarSolid, FaTrash, FaEdit, FaLink, FaChevronLeft, FaChevronRight, FaChevronDown, FaChevronUp, FaArrowUp, FaArrowDown, FaArrowLeft, FaArrowRight, FaRegClock, FaRegCalendar, FaRegCommentDots, FaRegUserCircle, FaUserCircle, FaUserFriends, FaUsersCog, FaRegSmile, FaSmile, FaCopy, FaShare, FaShareAlt, FaBook, FaBookOpen, FaNewspaper, FaBullhorn, FaBullseye, FaCrosshairs, FaCompass, FaMap, FaMapMarked, FaMapMarkedAlt, FaDirections, FaRoute, FaLocationArrow, FaLanguage, FaSpellCheck, FaClipboard, FaClipboardCheck, FaClipboardList, FaTasks, FaProjectDiagram, FaSitemap, FaNetworkWired, FaServer, FaTerminal, FaBug, FaCogs, FaWrench, FaTools, FaHammer, FaScrewdriver, FaKey, FaLock, FaUnlock, FaFingerprint, FaUserShield, FaUserLock, FaUserSecret, FaUserNinja, FaUserAstronaut, FaUserSecret as FaUserRobot, FaUserSecret as FaUserAlien, FaUserTie as FaUserCowboy, FaUserTie as FaUserKing, FaUserTie as FaUserQueen, FaUserTie as FaUserPrince, FaUserTie as FaUserPrincess, FaHatWizard as FaUserWizard, FaUserSecret as FaUserWitch, FaUserNinja as FaUserPirate, FaUserNinja as FaUserSamurai, FaIdCard, FaAddressCard, FaAddressBook, FaPassport, FaFolder, FaFolderOpen, FaFile, FaFileAlt, FaRegFileAlt, FaFilePdf, FaFileWord, FaFileExcel, FaFilePowerpoint, FaFileImage, FaFileVideo, FaFileAudio, FaFileArchive, FaFileCode, FaImages, FaImage, FaVideo, FaCamera, FaMicrophone, FaMusic, FaHeadphones, FaVolumeUp, FaVolumeMute, FaPlay, FaPause, FaStop, FaRecordVinyl, FaFilm, FaPhotoVideo, FaPalette, FaPaintBrush, FaRuler, FaDraftingCompass, FaVectorSquare, FaBezierCurve, FaDrawPolygon, FaShapes, FaCube, FaCubes, FaLayerGroup, FaObjectGroup, FaObjectUngroup, FaFill, FaEyeDropper, FaSwatchbook, FaCut, FaPaste, FaEllipsisH, FaGripHorizontal, FaGripVertical, FaGripLines, FaDotCircle, FaRegDotCircle, FaCircle, FaRegCircle, FaSquare, FaRegSquare, FaCheckSquare, FaRegCheckSquare, FaMinusSquare, FaPlusSquare, FaRegSmile as FaRegSmileSolid, FaRegLaugh, FaLaugh, FaGrin, FaGrinBeam, FaGrinStars, FaGrinHearts, FaGrinTears, FaGrinTongue, FaGrinWink, FaGrinSquint, FaMeh, FaRegMeh, FaFrown, FaRegFrown, FaSadTear, FaRegSadTear, FaAngry, FaRegAngry, FaSurprise, FaRegSurprise, FaTired, FaRegTired, FaKiss, FaRegKiss, FaFlushed, FaDizzy, FaGrimace, FaFrownOpen, FaSadCry, FaGrinAlt } from "react-icons/fa";
import {
  collection,
  doc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  onSnapshot,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore';

import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { db } from '../../config/firebase';
import { supabase } from '../../config/supabase';
import { apiRequest } from '../../services/apiClient';

// ============================================
// CONSTANTS
// ============================================

const EXPERIENCE_LEVELS = [
  { value: 'all', label: 'Any Experience' },
  { value: 'entry', label: 'Entry Level (0-2 years)' },
  { value: 'mid', label: 'Mid Level (2-5 years)' },
  { value: 'senior', label: 'Senior (5+ years)' },
];

const AVAILABILITY_OPTIONS = [
  { value: 'all', label: 'Any Availability' },
  { value: 'immediately', label: 'Available Now' },
  { value: '2-weeks', label: 'Within 2 Weeks' },
  { value: '1-month', label: 'Within 1 Month' },
  { value: '3-months', label: 'Within 3 Months' },
];

const SORT_OPTIONS = [
  { value: 'relevance', label: 'Best Match' },
  { value: 'recent', label: 'Most Recent' },
  { value: 'experience', label: 'Most Experienced' },
  { value: 'name', label: 'Name A-Z' },
  { value: 'matchScore', label: 'Highest Match Score' },
  { value: 'graduationYear', label: 'Recent Graduates' },
];

const EDUCATION_LEVELS = [
  { value: 'all', label: 'Any Education' },
  { value: 'diploma', label: 'Diploma' },
  { value: 'bachelor', label: "Bachelor's Degree" },
  { value: 'master', label: "Master's Degree" },
  { value: 'phd', label: 'PhD / Doctorate' },
];

const ITEMS_PER_PAGE = 12;

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
  if (!date) return 'Recently';
  const now = new Date();
  const past = date instanceof Date ? date : date?.toDate?.() || new Date(date);
  if (isNaN(past.getTime())) return 'Recently';

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

const getMatchScoreConfig = (score) => {
  if (score >= 90) return { bg: 'bg-green-500', text: 'text-green-600', label: 'Excellent' };
  if (score >= 80) return { bg: 'bg-blue-500', text: 'text-blue-600', label: 'Great' };
  if (score >= 70) return { bg: 'bg-yellow-500', text: 'text-yellow-600', label: 'Good' };
  if (score >= 60) return { bg: 'bg-orange-500', text: 'text-orange-600', label: 'Fair' };
  return { bg: 'bg-red-500', text: 'text-red-600', label: 'Low' };
};

const getAvailabilityConfig = (availability) => {
  const configs = {
    immediately: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-300', label: 'Available Now' },
    '2-weeks': { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-300', label: '2 Weeks Notice' },
    '1-month': { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-300', label: '1 Month Notice' },
    '3-months': { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-300', label: '3 Months Notice' },
  };
  return configs[availability] || { bg: 'bg-gray-100 dark:bg-gray-700', text: 'text-gray-700 dark:text-gray-300', label: 'Not Specified' };
};

// ============================================
// CUSTOM HOOKS
// ============================================

const useStudents = (companyId) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [nextCursor, setNextCursor] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    if (!companyId) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    apiRequest(`/api/company/students?limit=${ITEMS_PER_PAGE * 3}`)
      .then((result) => {
        if (cancelled) return;
        setStudents(result.students || []);
        setNextCursor(result.nextCursor || null);
        setHasMore(Boolean(result.hasMore));
      })
      .catch((err) => { if (!cancelled) setError(err.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [companyId]);

  const loadMore = useCallback(async () => {
    if (!companyId || !nextCursor || !hasMore) return;

    try {
      const result = await apiRequest(`/api/company/students?limit=${ITEMS_PER_PAGE}&cursor=${encodeURIComponent(nextCursor)}`);
      setStudents((prev) => [...prev, ...(result.students || [])]);
      setNextCursor(result.nextCursor || null);
      setHasMore(Boolean(result.hasMore));
    } catch (err) {
      console.error('Error loading more students:', err);
    }
  }, [companyId, nextCursor, hasMore]);

  return { students, loading, error, hasMore, loadMore };
};

const useSavedCandidates = (companyId) => {
  const [saved, setSaved] = useState(new Set());

  useEffect(() => {
    if (!companyId) return;

    const q = query(
      collection(db, 'savedCandidates'),
      where('companyId', '==', companyId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const savedIds = new Set(snapshot.docs.map(doc => doc.data().candidateId));
      setSaved(savedIds);
    });

    return () => unsubscribe();
  }, [companyId]);

  return { saved, setSaved };
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
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-4"></div>
        <div className="flex gap-2">
          <div className="h-9 bg-gray-200 dark:bg-gray-700 rounded flex-1"></div>
          <div className="h-9 bg-gray-200 dark:bg-gray-700 rounded flex-1"></div>
        </div>
      </div>
    ))}
  </div>
);

const EmptyState = ({ onClearFilters, hasFilters }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="text-center py-16"
  >
    <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
      <FaUserGraduate className="w-12 h-12 text-gray-400" />
    </div>
    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
      {hasFilters ? 'No candidates match your filters' : 'No candidates found'}
    </h3>
    <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
      {hasFilters
        ? 'Try adjusting your search or filter criteria to find more candidates.'
        : 'Candidates will appear here as they complete their profiles.'}
    </p>
    {hasFilters && (
      <button
        onClick={onClearFilters}
        className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
      >
        Clear Filters
      </button>
    )}
  </motion.div>
);

const StudentCard = ({ 
  student, 
  onView, 
  onMessage, 
  onSave, 
  onInvite,
  isSaved,
  viewMode = 'grid'
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const matchScore = Number.isFinite(student.matchScore) ? student.matchScore : null;
  const matchConfig = matchScore == null ? null : getMatchScoreConfig(matchScore);
  const availabilityConfig = getAvailabilityConfig(student.availability);

  const studentName = student.name || student.displayName || student.email?.split('@')[0] || 'Candidate';
  const studentInitial = studentName.charAt(0).toUpperCase();

  if (viewMode === 'list') {
    return (
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all"
      >
        <div className="relative flex-shrink-0">
          {student.avatar || student.photoURL ? (
            <img
              src={student.avatar || student.photoURL}
              alt={studentName}
              className="w-14 h-14 rounded-full object-cover"
            />
          ) : (
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-semibold">
              {studentInitial}
            </div>
          )}
          {matchScore != null && matchScore >= 80 && (
            <div className="absolute -top-1 -right-1 bg-green-500 rounded-full p-1">
              <FaStar className="w-3 h-3 text-white" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold text-gray-900 dark:text-white truncate">
              {studentName}
            </h4>
            {student.isVerified && (
              <FaCheckCircle className="w-4 h-4 text-blue-500 flex-shrink-0" />
            )}
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
            {student.headline || student.course || 'Student'}
          </p>
          <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
            {student.location && (
              <span className="flex items-center gap-1">
                <FaMapMarkerAlt className="w-3 h-3" />
                {student.location}
              </span>
            )}
            {student.graduationYear && (
              <span className="flex items-center gap-1">
                <FaGraduationCap className="w-3 h-3" />
                {student.graduationYear}
              </span>
            )}
          </div>
        </div>

        <div className="hidden md:flex items-center gap-6">
          {matchScore != null && <div className="text-center">
            <div className={`text-lg font-bold ${matchConfig.text}`}>
              {matchScore}%
            </div>
            <div className="text-xs text-gray-400">Match</div>
          </div>}
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${availabilityConfig.bg} ${availabilityConfig.text}`}>
            {availabilityConfig.label}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onSave(student)}
            className={`p-2 rounded-lg transition-colors ${
              isSaved
                ? 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
                : 'text-gray-400 hover:text-yellow-500 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            {isSaved ? <FaBookmark className="w-4 h-4" /> : <FaRegBookmark className="w-4 h-4" />}
          </button>
          <button
            onClick={() => onView(student)}
            className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <FaEye className="w-4 h-4" />
          </button>
          <button
            onClick={() => onMessage(student)}
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
      className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3">
          <div className="relative">
            {student.avatar || student.photoURL ? (
              <img
                src={student.avatar || student.photoURL}
                alt={studentName}
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-semibold">
                {studentInitial}
              </div>
            )}
            {matchScore != null && matchScore >= 80 && (
              <div className="absolute -top-1 -right-1 bg-green-500 rounded-full p-1">
                <FaStar className="w-3 h-3 text-white" />
              </div>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-gray-900 dark:text-white">
                {studentName}
              </h4>
              {student.isVerified && (
                <FaCheckCircle className="w-4 h-4 text-blue-500" />
              )}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {student.headline || student.course || 'Student'}
            </p>
            {student.location && (
              <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                <FaMapMarkerAlt className="w-3 h-3" />
                {student.location}
              </p>
            )}
          </div>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <FaEllipsisV className="w-4 h-4" />
          </button>

          <AnimatePresence>
            {showMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 py-2 z-20"
                >
                  <button
                    onClick={() => { onView(student); setShowMenu(false); }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                  >
                    <FaEye className="w-4 h-4" /> View Profile
                  </button>
                  <button
                    onClick={() => { onMessage(student); setShowMenu(false); }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                  >
                    <FaCommentDots className="w-4 h-4" /> Send Message
                  </button>
                  <button
                    onClick={() => { onInvite(student); setShowMenu(false); }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                  >
                    <FaPaperPlane className="w-4 h-4" /> Invite to Apply
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Match Score */}
      {matchScore != null && <div className="mb-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-gray-500">Match Score</span>
          <span className={`text-sm font-semibold ${matchConfig.text}`}>
            {matchScore}% - {matchConfig.label}
          </span>
        </div>
        <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${matchConfig.bg}`}
            style={{ width: `${matchScore}%` }}
          />
        </div>
      </div>}

      {/* Details */}
      <div className="space-y-2 mb-4 text-sm">
        {student.email && (
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
            <FaEnvelope className="w-4 h-4" />
            <span className="truncate">{student.email}</span>
          </div>
        )}
        {student.experience && (
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
            <FaBriefcase className="w-4 h-4" />
            <span>{student.experience}</span>
          </div>
        )}
        {student.education && (
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
            <FaGraduationCap className="w-4 h-4" />
            <span className="truncate">{student.education}</span>
          </div>
        )}
      </div>

      {/* Skills */}
      {student.skills && student.skills.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-4">
          {student.skills.slice(0, 3).map((skill, index) => (
            <span
              key={index}
              className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded text-xs"
            >
              {skill}
            </span>
          ))}
          {student.skills.length > 3 && (
            <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded text-xs">
              +{student.skills.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Availability */}
      <div className="mb-4">
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${availabilityConfig.bg} ${availabilityConfig.text}`}>
          <FaClock className="w-3 h-3" />
          {availabilityConfig.label}
        </span>
      </div>

      {/* Footer */}
      <div className="flex items-center gap-2 pt-4 border-t border-gray-100 dark:border-gray-700">
        <button
          onClick={() => onSave(student)}
          className={`p-2 rounded-lg transition-colors ${
            isSaved
              ? 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
              : 'text-gray-400 hover:text-yellow-500 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          {isSaved ? <FaBookmark className="w-4 h-4" /> : <FaRegBookmark className="w-4 h-4" />}
        </button>
        <button
          onClick={() => onView(student)}
          className="flex-1 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg text-sm font-medium hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
        >
          <FaEye className="w-3.5 h-3.5 inline mr-1" />
          View Profile
        </button>
        <button
          onClick={() => onMessage(student)}
          className="flex-1 px-3 py-2 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg text-sm font-medium hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors"
        >
          <FaCommentDots className="w-3.5 h-3.5 inline mr-1" />
          Message
        </button>
      </div>
    </motion.div>
  );
};

const DetailModal = ({ student, show, onClose, onMessage, onSave, onInvite, isSaved }) => {
  if (!student) return null;

  const matchScore = Number.isFinite(student.matchScore) ? student.matchScore : null;
  const availabilityConfig = getAvailabilityConfig(student.availability);
  const studentName = student.name || student.displayName || 'Candidate';

  return (
    <AnimatePresence>
      {show && (
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
            className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-3xl my-8"
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Candidate Profile
              </h2>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 max-h-[70vh] overflow-y-auto">
              {/* Profile Header */}
              <div className="flex items-start gap-6 mb-6">
                <div className="relative">
                  {student.avatar || student.photoURL ? (
                    <img
                      src={student.avatar || student.photoURL}
                      alt={studentName}
                      className="w-24 h-24 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold">
                      {studentName.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {studentName}
                    </h3>
                    {student.isVerified && (
                      <FaCheckCircle className="w-5 h-5 text-blue-500" />
                    )}
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 mb-2">
                    {student.headline || student.course || 'Student'}
                  </p>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className={`text-sm font-semibold ${matchScore == null ? 'text-gray-500' : matchConfig.text}`}>
                      {matchScore == null ? 'Match score unavailable' : `${matchScore}% Match`}
                    </span>
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${availabilityConfig.bg} ${availabilityConfig.text}`}>
                      <FaClock className="w-3 h-3" />
                      {availabilityConfig.label}
                    </span>
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {student.email && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                    <FaEnvelope className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Email</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {student.email}
                      </p>
                    </div>
                  </div>
                )}
                {student.phone && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                    <FaPhone className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Phone</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {student.phone}
                      </p>
                    </div>
                  </div>
                )}
                {student.location && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                    <FaMapMarkerAlt className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Location</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {student.location}
                      </p>
                    </div>
                  </div>
                )}
                {student.graduationYear && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                    <FaGraduationCap className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Graduation Year</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {student.graduationYear}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Bio */}
              {student.bio && (
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-500 mb-3">About</h4>
                  <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                    <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                      {student.bio}
                    </p>
                  </div>
                </div>
              )}

              {/* Skills */}
              {student.skills && student.skills.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-500 mb-3">Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {student.skills.map((skill, index) => (
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

              {/* Experience */}
              {student.workExperience && student.workExperience.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-500 mb-3">Work Experience</h4>
                  <div className="space-y-3">
                    {student.workExperience.map((exp, index) => (
                      <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                        <h5 className="font-medium text-gray-900 dark:text-white">
                          {exp.title}
                        </h5>
                        <p className="text-sm text-gray-500">
                          {exp.company} • {exp.duration}
                        </p>
                        {exp.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                            {exp.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Education */}
              {student.educationHistory && student.educationHistory.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-500 mb-3">Education</h4>
                  <div className="space-y-3">
                    {student.educationHistory.map((edu, index) => (
                      <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                        <h5 className="font-medium text-gray-900 dark:text-white">
                          {edu.degree}
                        </h5>
                        <p className="text-sm text-gray-500">
                          {edu.institution} • {edu.year}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Social Links */}
              {(student.linkedin || student.github || student.website) && (
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-500 mb-3">Links</h4>
                  <div className="flex flex-wrap gap-2">
                    {student.linkedin && (
                      <a
                        href={student.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg text-sm hover:bg-blue-100"
                      >
                        <FaLinkedin className="w-4 h-4" />
                        LinkedIn
                      </a>
                    )}
                    {student.github && (
                      <a
                        href={student.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm hover:bg-gray-200"
                      >
                        <FaGithub className="w-4 h-4" />
                        GitHub
                      </a>
                    )}
                    {student.website && (
                      <a
                        href={student.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm hover:bg-gray-200"
                      >
                        <FaGlobe className="w-4 h-4" />
                        Portfolio
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 p-6 border-t border-gray-100 dark:border-gray-700">
              <button
                onClick={() => onSave(student)}
                className={`px-4 py-2.5 rounded-xl font-medium transition-colors flex items-center gap-2 ${
                  isSaved
                    ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
                }`}
              >
                {isSaved ? <FaBookmark className="w-4 h-4" /> : <FaRegBookmark className="w-4 h-4" />}
                {isSaved ? 'Saved' : 'Save'}
              </button>
              <button
                onClick={() => onInvite(student)}
                className="px-4 py-2.5 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors flex items-center gap-2"
              >
                <FaPaperPlane className="w-4 h-4" />
                Invite to Apply
              </button>
              <button
                onClick={() => onMessage(student)}
                className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <FaCommentDots className="w-4 h-4" />
                Send Message
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================

const SearchStudents = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { currentUser, userProfile } = useAuth();
  const { showNotification } = useNotification();

  const companyId = userProfile?.companyId || currentUser?.companyId || currentUser?.uid;
  const { students, loading, error, hasMore, loadMore } = useStudents(companyId);
  const { saved, setSaved } = useSavedCandidates(companyId);

  // Local state
  const [searchTerm, setSearchTerm] = useState('');
  const [experienceFilter, setExperienceFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState('all');
  const [educationFilter, setEducationFilter] = useState('all');
  const [skillsFilter, setSkillsFilter] = useState([]);
  const [newSkillFilter, setNewSkillFilter] = useState('');
  const [sortBy, setSortBy] = useState('relevance');
  const [viewMode, setViewMode] = useState('grid');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [studentToInvite, setStudentToInvite] = useState(null);
  const [inviteMessage, setInviteMessage] = useState('');
  const [inviting, setInviting] = useState(false);

  // Stats
  const stats = useMemo(() => ({
    total: students.length,
    available: students.filter(s => s.availability === 'immediately').length,
    highMatch: students.filter(s => (s.matchScore || 0) >= 80).length,
    saved: saved.size,
  }), [students, saved]);

  // Filtered students
  const filteredStudents = useMemo(() => {
    let filtered = [...students];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(student =>
        (student.name?.toLowerCase() || '').includes(term) ||
        (student.displayName?.toLowerCase() || '').includes(term) ||
        (student.email?.toLowerCase() || '').includes(term) ||
        (student.headline?.toLowerCase() || '').includes(term) ||
        (student.skills?.some(s => s.toLowerCase().includes(term)) || false)
      );
    }

    if (experienceFilter !== 'all') {
      filtered = filtered.filter(s => s.experienceLevel === experienceFilter);
    }

    if (locationFilter) {
      filtered = filtered.filter(s =>
        s.location?.toLowerCase().includes(locationFilter.toLowerCase())
      );
    }

    if (availabilityFilter !== 'all') {
      filtered = filtered.filter(s => s.availability === availabilityFilter);
    }

    if (educationFilter !== 'all') {
      filtered = filtered.filter(s => s.educationLevel === educationFilter);
    }

    if (skillsFilter.length > 0) {
      filtered = filtered.filter(student =>
        skillsFilter.every(skill =>
          student.skills?.some(s => s.toLowerCase().includes(skill.toLowerCase()))
        )
      );
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'relevance':
          return (b.matchScore || 0) - (a.matchScore || 0);
        case 'recent':
          return new Date(b.updatedAt?.toDate?.() || b.updatedAt) - new Date(a.updatedAt?.toDate?.() || a.updatedAt);
        case 'experience':
          return (b.experienceYears || 0) - (a.experienceYears || 0);
        case 'name':
          return (a.name || a.displayName || '').localeCompare(b.name || b.displayName || '');
        case 'matchScore':
          return (b.matchScore || 0) - (a.matchScore || 0);
        case 'graduationYear':
          return (b.graduationYear || 0) - (a.graduationYear || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [students, searchTerm, experienceFilter, locationFilter, availabilityFilter, educationFilter, skillsFilter, sortBy]);

  // ============================================
  // HANDLERS
  // ============================================

  const handleSaveStudent = async (student) => {
    if (!companyId) return;

    try {
      const savedRef = doc(db, 'savedCandidates', `${companyId}_${student.id}`);
      const savedDoc = await getDoc(savedRef);

      if (savedDoc.exists()) {
        await deleteDoc(savedRef);
        setSaved(prev => {
          const next = new Set(prev);
          next.delete(student.id);
          return next;
        });
        showNotification('success', 'Removed from saved candidates');
      } else {
        await addDoc(collection(db, 'savedCandidates'), {
          companyId,
          candidateId: student.id,
          candidateName: student.name || student.displayName,
          candidateEmail: student.email,
          savedAt: serverTimestamp(),
        });
        setSaved(prev => new Set([...prev, student.id]));
        showNotification('success', 'Added to saved candidates');
      }
    } catch (error) {
      console.error('Error saving candidate:', error);
      showNotification('error', 'Failed to save candidate');
    }
  };

  const handleMessageStudent = (student) => {
    navigate(`/company/chat?candidate=${student.id}`);
  };

  const handleInviteClick = (student) => {
    setStudentToInvite(student);
    setInviteMessage('');
    setShowInviteModal(true);
  };

  const handleInviteConfirm = async () => {
    if (!studentToInvite || !companyId) return;

    try {
      setInviting(true);

      await addDoc(collection(db, 'invitations'), {
        companyId,
        companyName: userProfile?.companyName || 'Company',
        candidateId: studentToInvite.id,
        candidateName: studentToInvite.name || studentToInvite.displayName,
        candidateEmail: studentToInvite.email,
        message: inviteMessage,
        status: 'pending',
        sentAt: serverTimestamp(),
        createdBy: companyId,
      });

      // Send notification
      await addDoc(collection(db, 'notifications'), {
        userId: studentToInvite.id,
        type: 'job_invitation',
        title: 'Job Invitation',
        message: `${userProfile?.companyName || 'A company'} has invited you to apply for a position`,
        companyId,
        read: false,
        createdAt: serverTimestamp(),
      });

      // Log activity
      await supabase
        .from('company_activities')
        .insert({
          company_id: companyId,
          activity_type: 'candidate_invited',
          metadata: {
            candidate_id: studentToInvite.id,
            candidate_name: studentToInvite.name,
          },
          created_at: new Date().toISOString(),
        });

      showNotification('success', `Invitation sent to ${studentToInvite.name || studentToInvite.email}`);
      setShowInviteModal(false);
      setStudentToInvite(null);
      setInviteMessage('');
    } catch (error) {
      console.error('Error sending invitation:', error);
      showNotification('error', 'Failed to send invitation');
    } finally {
      setInviting(false);
    }
  };

  const handleViewStudent = (student) => {
    setSelectedStudent(student);
    setShowDetailModal(true);
  };

  const handleAddSkillFilter = () => {
    const skill = newSkillFilter.trim();
    if (skill && !skillsFilter.includes(skill)) {
      setSkillsFilter(prev => [...prev, skill]);
      setNewSkillFilter('');
    }
  };

  const handleRemoveSkillFilter = (skill) => {
    setSkillsFilter(prev => prev.filter(s => s !== skill));
  };

  const clearFilters = () => {
    setSearchTerm('');
    setExperienceFilter('all');
    setLocationFilter('');
    setAvailabilityFilter('all');
    setEducationFilter('all');
    setSkillsFilter([]);
    setSortBy('relevance');
  };

  const hasFilters = searchTerm || experienceFilter !== 'all' || locationFilter || 
    availabilityFilter !== 'all' || educationFilter !== 'all' || skillsFilter.length > 0;

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
              <FaUserGraduate className="w-8 h-8 text-blue-600" />
              Search Candidates
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Discover talented students and candidates for your opportunities
            </p>
          </div>

          <button
            onClick={() => navigate('/company/talent-pool')}
            className="px-4 py-2.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-medium border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
          >
            <FaBookmark className="w-4 h-4" />
            Saved ({saved.size})
          </button>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Candidates', value: stats.total, icon: FaUsers, color: 'blue' },
            { label: 'Available Now', value: stats.available, icon: FaClock, color: 'green' },
            { label: 'High Match', value: stats.highMatch, icon: FaStar, color: 'yellow' },
            { label: 'Saved', value: stats.saved, icon: FaBookmark, color: 'purple' },
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700"
            >
              <div className={`p-2.5 rounded-lg inline-block mb-3 ${
                stat.color === 'blue' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600' :
                stat.color === 'green' ? 'bg-green-50 dark:bg-green-900/20 text-green-600' :
                stat.color === 'yellow' ? 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600' :
                'bg-purple-50 dark:bg-purple-900/20 text-purple-600'
              }`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {formatNumber(stat.value)}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 mb-6">
          <div className="flex flex-col gap-4">
            {/* Search Row */}
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
              <div className="relative flex-1 w-full">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, email, skills, or headline..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="flex-1 md:flex-none px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {SORT_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>

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

            {/* Filter Row */}
            <div className="flex flex-wrap items-center gap-3">
              <select
                value={experienceFilter}
                onChange={(e) => setExperienceFilter(e.target.value)}
                className="px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {EXPERIENCE_LEVELS.map(level => (
                  <option key={level.value} value={level.value}>{level.label}</option>
                ))}
              </select>

              <input
                type="text"
                placeholder="Location"
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-32"
              />

              <select
                value={availabilityFilter}
                onChange={(e) => setAvailabilityFilter(e.target.value)}
                className="px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {AVAILABILITY_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>

              <select
                value={educationFilter}
                onChange={(e) => setEducationFilter(e.target.value)}
                className="px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {EDUCATION_LEVELS.map(level => (
                  <option key={level.value} value={level.value}>{level.label}</option>
                ))}
              </select>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Add skill filter..."
                  value={newSkillFilter}
                  onChange={(e) => setNewSkillFilter(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddSkillFilter()}
                  className="px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-40"
                />
                <button
                  onClick={handleAddSkillFilter}
                  className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <FaPlus className="w-4 h-4" />
                </button>
              </div>

              {hasFilters && (
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl font-medium transition-colors flex items-center gap-2 text-sm"
                >
                  <FaTimes className="w-4 h-4" />
                  Clear Filters
                </button>
              )}
            </div>

            {/* Active Skill Filters */}
            {skillsFilter.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-gray-500">Skills:</span>
                {skillsFilter.map((skill, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full text-xs font-medium"
                  >
                    {skill}
                    <button
                      onClick={() => handleRemoveSkillFilter(skill)}
                      className="hover:text-blue-800"
                    >
                      <FaTimes className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Showing {filteredStudents.length} of {students.length} candidates
          </p>
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
        ) : filteredStudents.length === 0 ? (
          <EmptyState onClearFilters={clearFilters} hasFilters={hasFilters} />
        ) : (
          <>
            <div className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
                : 'space-y-3'
            }>
              {filteredStudents.map((student) => (
                <StudentCard
                  key={student.id}
                  student={student}
                  onView={handleViewStudent}
                  onMessage={handleMessageStudent}
                  onSave={handleSaveStudent}
                  onInvite={handleInviteClick}
                  isSaved={saved.has(student.id)}
                  viewMode={viewMode}
                />
              ))}
            </div>

            {/* Load More */}
            {hasMore && (
              <div className="text-center mt-8">
                <button
                  onClick={loadMore}
                  disabled={loading}
                  className="px-6 py-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-medium border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <FaSpinner className="w-4 h-4 animate-spin" />
                      Loading...
                    </span>
                  ) : (
                    'Load More Candidates'
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Detail Modal */}
      <DetailModal
        student={selectedStudent}
        show={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedStudent(null);
        }}
        onMessage={handleMessageStudent}
        onSave={handleSaveStudent}
        onInvite={handleInviteClick}
        isSaved={selectedStudent ? saved.has(selectedStudent.id) : false}
      />

      {/* Invite Modal */}
      <AnimatePresence>
        {showInviteModal && studentToInvite && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowInviteModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Invite to Apply
                </h3>
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <FaTimes className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-xl mb-4">
                {studentToInvite.avatar ? (
                  <img
                    src={studentToInvite.avatar}
                    alt={studentToInvite.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                    {(studentToInvite.name || studentToInvite.displayName)?.charAt(0) || 'C'}
                  </div>
                )}
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {studentToInvite.name || studentToInvite.displayName}
                  </p>
                  <p className="text-sm text-gray-500">{studentToInvite.email}</p>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Personal Message (optional)
                </label>
                <textarea
                  value={inviteMessage}
                  onChange={(e) => setInviteMessage(e.target.value)}
                  rows={4}
                  placeholder="Add a personal note to the invitation..."
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm"
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleInviteConfirm}
                  disabled={inviting}
                  className="flex-1 px-4 py-2.5 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {inviting ? (
                    <>
                      <FaSpinner className="w-4 h-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <FaPaperPlane className="w-4 h-4" />
                      Send Invitation
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchStudents;
