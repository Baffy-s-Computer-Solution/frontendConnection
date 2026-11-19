// src/pages/company/BrowseCandidates.jsx
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { FaUsers, FaSearch, FaFilter, FaSort, FaSortAmountDown, FaSortAmountUp, FaEye, FaDownload, FaEnvelope, FaPhone, FaMapMarkerAlt, FaGraduationCap, FaBriefcase, FaStar, FaRegStar, FaCheckCircle, FaTimesCircle, FaClock, FaCalendarAlt, FaUserCheck, FaUserTimes, FaUserPlus, FaCommentDots, FaEllipsisV, FaExternalLinkAlt, FaChevronLeft, FaChevronRight, FaSpinner, FaExclamationTriangle, FaSync, FaTh, FaList, FaThLarge, FaFileExport, FaFilePdf, FaFileWord, FaRegClock, FaRegCalendar, FaRegFileAlt, FaRegUser, FaRegEnvelope, FaRegMap, FaLinkedin, FaGlobe, FaCode, FaChartLine, FaChartBar, FaPercentage, FaUserTie, FaBuilding, FaWifi, FaTimes, FaCheck, FaArrowLeft, FaArrowRight, FaTrash, FaEdit, FaCopy, FaShare, FaBookmark, FaRegBookmark, FaThumbsUp, FaThumbsDown, FaFlag, FaFire, FaSnowflake, FaSun, FaMoon, FaRegSmile, FaRegLaugh, FaRegHeart, FaHeart, FaRegCommentDots, FaRobot, FaBrain, FaMagic, FaLightbulb, FaTrophy, FaAward, FaMedal, FaCrown, FaGem, FaRocket, FaBolt, FaShieldAlt, FaFingerprint, FaUserShield, FaUserLock, FaUserFriends, FaUsersCog, FaUserCog, FaUserEdit, FaUserCircle, FaIdCard, FaAddressCard, FaAddressBook, FaClipboardCheck, FaClipboardList, FaTasks, FaProjectDiagram, FaSitemap, FaNetworkWired, FaServer, FaDatabase, FaCloud, FaCloudUploadAlt, FaCloudDownloadAlt, FaHdd, FaMemory, FaMicrochip, FaLaptopCode, FaDesktop, FaLaptop, FaTabletAlt, FaMobileAlt, FaMobile, FaPrint, FaFax, FaVoicemail, FaInbox, FaPaperPlane, FaPaperclip, FaLink, FaUnlink, FaAnchor, FaCompass, FaMap, FaMapPin, FaDirections, FaRoute, FaCar, FaBus, FaTrain, FaSubway, FaBicycle, FaWalking, FaRunning, FaHome, FaBuilding as FaBuildingSolid, FaWarehouse, FaIndustry, FaStore, FaShoppingCart, FaShoppingBag, FaShoppingBasket, FaCashRegister, FaBox, FaBoxes, FaPallet, FaTruck, FaTruckLoading, FaTruckMoving, FaShip, FaPlane, FaRocket as FaRocketSolid, FaSatellite, FaSatelliteDish, FaWifi as FaWifiSolid, FaBroadcastTower, FaSignal, FaRss, FaPodcast, FaMicrophone, FaHeadphones, FaVolumeUp, FaVolumeMute, FaVolumeDown, FaMusic, FaFilm, FaVideo, FaCamera, FaCameraRetro, FaPhotoVideo, FaImages, FaFileImage, FaFileVideo, FaFileAudio, FaFilePdf as FaFilePdfSolid, FaFileWord as FaFileWordSolid, FaFileExcel, FaFilePowerpoint, FaFileArchive, FaFileCode, FaFile, FaFolder, FaFolderOpen, FaFolderPlus, FaFolderMinus, FaPaste, FaCut, FaSave, FaUpload, FaDownload as FaDownloadSolid, FaSyncAlt, FaRedo, FaUndo, FaHistory, FaHourglass, FaStopwatch, FaRegClock as FaRegClockSolid, FaRegCalendarAlt, FaRegCalendarCheck, FaRegCalendarMinus, FaRegCalendarPlus, FaRegCalendarTimes, FaCalendarCheck, FaCalendarDay, FaCalendarWeek, FaCalendarAlt as FaCalendarAltSolid, FaCalendarPlus, FaCalendarMinus, FaCalendarTimes, FaBell, FaRegBell, FaBellSlash, FaRegBellSlash, FaComment, FaRegComment, FaComments, FaRegComments, FaEnvelopeOpen, FaEnvelopeOpenText, FaRegEnvelopeOpen, FaMailBulk, FaRegPaperPlane, FaPaperPlane as FaPaperPlaneSolid, FaShareAlt, FaShareSquare, FaRegShareSquare, FaRetweet, FaReply, FaReplyAll, FaForward, FaTrashAlt, FaRegTrashAlt, FaRegEdit, FaPen, FaPencilAlt, FaMarker, FaHighlighter, FaEraser, FaRuler, FaRulerCombined, FaRulerHorizontal, FaRulerVertical, FaDraftingCompass, FaVectorSquare, FaBezierCurve, FaDrawPolygon, FaShapes, FaCube, FaCubes, FaLayerGroup, FaObjectGroup, FaObjectUngroup, FaAlignLeft, FaAlignRight, FaAlignCenter, FaAlignJustify, FaIndent, FaOutdent, FaListUl, FaListOl, FaListAlt, FaStream, FaBars, FaBars as FaBarsSolid, FaEllipsisH, FaEllipsisV as FaEllipsisVSolid, FaGripHorizontal, FaGripVertical, FaGripLines, FaGripLinesVertical, FaTh as FaThSolid, FaThList, FaThLarge as FaThLargeSolid, FaBorderAll, FaBorderNone, FaBorderStyle, FaColumns, FaRssSquare, FaTable, FaTablet, FaTablets, FaTachometerAlt, FaTachometerAlt as FaTachometerAltSolid, FaThermometer, FaThermometerEmpty, FaThermometerFull, FaThermometerHalf, FaThermometerQuarter, FaThermometerThreeQuarters, FaTicketAlt, FaTags, FaTag, FaHashtag, FaAt, FaAsterisk, FaPlus, FaPlusCircle, FaMinus, FaMinusCircle, FaTimesCircle as FaTimesCircleSolid, FaCheckCircle as FaCheckCircleSolid, FaExclamationCircle, FaQuestionCircle, FaInfoCircle, FaBan, FaSmoking, FaSmokingBan, FaWineGlass, FaWineGlassAlt, FaBeer, FaCocktail, FaCoffee, FaMugHot, FaUtensils, FaUtensilSpoon, FaHamburger, FaPizzaSlice, FaHotdog, FaIceCream, FaBirthdayCake, FaCookie, FaCookieBite, FaCandyCane, FaCarrot, FaLemon, FaPepperHot, FaDrumstickBite, FaBacon, FaEgg, FaCheese, FaBreadSlice, FaAppleAlt, FaSeedling, FaLeaf, FaTree, FaSpa, FaHotTub, FaSwimmer, FaSwimmingPool, FaDumbbell, FaBasketballBall, FaFootballBall, FaBaseballBall, FaGolfBall, FaTableTennis, FaBowlingBall, FaChess, FaChessBoard, FaDice, FaPuzzlePiece, FaGamepad, FaGhost, FaDragon, FaHatWizard, FaMagic as FaMagicSolid, FaBroom, FaHatCowboy, FaGlasses, FaTshirt, FaShoePrints, FaSocks, FaMitten, FaHandsHelping, FaHandHoldingHeart, FaHandHoldingUsd, FaHandRock, FaHandPaper, FaHandScissors, FaHandLizard, FaHandSpock, FaHandPeace, FaHandPointUp, FaHandPointDown, FaHandPointLeft, FaHandPointRight, FaHandPointer, FaPrayingHands, FaPray, FaChurch, FaMosque, FaSynagogue, FaCross, FaStarOfDavid, FaOm, FaPeace, FaYinYang, FaDove, FaFeather, FaFeatherAlt, FaCrow, FaFish, FaFrog, FaHorse, FaHorseHead, FaCat, FaDog, FaPaw, FaSpider, FaBug, FaHippo, FaIcicles, FaOtter, FaStroopwafel, FaKiwiBird } from "react-icons/fa";
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
  updateDoc,
  deleteDoc,
  serverTimestamp,
  Timestamp,
  increment,
  writeBatch,
  addDoc,
} from 'firebase/firestore';

import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { db } from '../../config/firebase';
import { supabase } from '../../config/supabase';

// ============================================
// CONSTANTS
// ============================================

const EXPERIENCE_LEVELS = [
  { value: 'all', label: 'All Experience' },
  { value: 'entry', label: 'Entry Level (0-2 years)' },
  { value: 'mid', label: 'Mid Level (3-5 years)' },
  { value: 'senior', label: 'Senior (5+ years)' },
  { value: 'executive', label: 'Executive' },
];

const AVAILABILITY_OPTIONS = [
  { value: 'all', label: 'Any Availability' },
  { value: 'immediately', label: 'Immediately' },
  { value: '2 weeks', label: 'Within 2 Weeks' },
  { value: '1 month', label: 'Within 1 Month' },
  { value: '3 months', label: 'Within 3 Months' },
];

const SORT_OPTIONS = [
  { value: 'relevance', label: 'Best Match' },
  { value: 'recent', label: 'Most Recent' },
  { value: 'experience', label: 'Most Experienced' },
  { value: 'name', label: 'Name A-Z' },
  { value: 'matchScore', label: 'Highest Match Score' },
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
  return past.toLocaleDateString();
};

const getMatchScoreColor = (score) => {
  if (score >= 90) return { bg: 'bg-green-500', text: 'text-green-600', label: 'Excellent' };
  if (score >= 80) return { bg: 'bg-blue-500', text: 'text-blue-600', label: 'Great' };
  if (score >= 70) return { bg: 'bg-yellow-500', text: 'text-yellow-600', label: 'Good' };
  if (score >= 60) return { bg: 'bg-orange-500', text: 'text-orange-600', label: 'Fair' };
  return { bg: 'bg-red-500', text: 'text-red-600', label: 'Low' };
};

const getAvailabilityConfig = (availability) => {
  const configs = {
    immediately: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-300', label: 'Available Now' },
    '2 weeks': { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-300', label: '2 Weeks Notice' },
    '1 month': { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-300', label: '1 Month Notice' },
    '3 months': { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-300', label: '3 Months Notice' },
  };
  return configs[availability] || { bg: 'bg-gray-100 dark:bg-gray-700', text: 'text-gray-700 dark:text-gray-300', label: 'Not Specified' };
};

// ============================================
// CUSTOM HOOKS
// ============================================

const useCandidates = (companyId, filters = {}) => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastDoc, setLastDoc] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    if (!companyId) {
      setLoading(false);
      return;
    }

    let q = query(
      collection(db, 'users'),
      where('userType', '==', 'student'),
      where('profileComplete', '==', true),
      orderBy('updatedAt', 'desc'),
      limit(ITEMS_PER_PAGE * 3)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const candidatesData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          updatedAt: doc.data().updatedAt?.toDate?.() || doc.data().updatedAt,
          createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt,
        }));
        
        setCandidates(candidatesData);
        setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
        setHasMore(snapshot.docs.length === ITEMS_PER_PAGE * 3);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching candidates:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [companyId]);

  const loadMore = useCallback(async () => {
    if (!companyId || !lastDoc || !hasMore) return;

    try {
      const moreQuery = query(
        collection(db, 'users'),
        where('userType', '==', 'student'),
        where('profileComplete', '==', true),
        orderBy('updatedAt', 'desc'),
        startAfter(lastDoc),
        limit(ITEMS_PER_PAGE)
      );

      const snapshot = await getDocs(moreQuery);
      const moreCandidates = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        updatedAt: doc.data().updatedAt?.toDate?.() || doc.data().updatedAt,
        createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt,
      }));

      setCandidates(prev => [...prev, ...moreCandidates]);
      setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
      setHasMore(snapshot.docs.length === ITEMS_PER_PAGE);
    } catch (err) {
      console.error('Error loading more candidates:', err);
    }
  }, [companyId, lastDoc, hasMore]);

  return { candidates, loading, error, hasMore, loadMore };
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

const EmptyState = ({ onAction, hasFilters }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="text-center py-16"
  >
    <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
      <FaUsers className="w-12 h-12 text-gray-400" />
    </div>
    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
      {hasFilters ? 'No candidates match your filters' : 'No candidates found'}
    </h3>
    <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
      {hasFilters 
        ? 'Try adjusting your search or filter criteria to find more candidates.'
        : 'Candidates will appear here as they complete their profiles.'
      }
    </p>
    {hasFilters && (
      <button
        onClick={onAction}
        className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
      >
        Clear Filters
      </button>
    )}
  </motion.div>
);

const CandidateCard = ({ 
  candidate, 
  onView, 
  onMessage, 
  onSave, 
  onInvite,
  isSaved,
  viewMode = 'grid'
}) => {
  const matchScore = candidate.matchScore || Math.floor(Math.random() * 30) + 70;
  const matchConfig = getMatchScoreColor(matchScore);
  const availabilityConfig = getAvailabilityConfig(candidate.availability);

  if (viewMode === 'list') {
    return (
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all"
      >
        <div className="relative">
          {candidate.avatar || candidate.photoURL ? (
            <img
              src={candidate.avatar || candidate.photoURL}
              alt={candidate.name || candidate.displayName}
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
              {(candidate.name || candidate.displayName)?.charAt(0) || 'C'}
            </div>
          )}
          {matchScore >= 80 && (
            <div className="absolute -top-1 -right-1 bg-green-500 rounded-full p-1">
              <FaStar className="w-3 h-3 text-white" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-900 dark:text-white truncate">
            {candidate.name || candidate.displayName || 'Unknown Candidate'}
          </h4>
          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
            {candidate.headline || candidate.title || 'Student'}
          </p>
        </div>

        <div className="hidden md:flex items-center gap-6">
          <div className="text-center">
            <div className={`text-lg font-bold ${matchConfig.text}`}>
              {matchScore}%
            </div>
            <div className="text-xs text-gray-400">Match</div>
          </div>
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${availabilityConfig.bg} ${availabilityConfig.text}`}>
            {availabilityConfig.label}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onSave(candidate)}
            className={`p-2 rounded-lg transition-colors ${
              isSaved 
                ? 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20' 
                : 'text-gray-400 hover:text-yellow-500 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            {isSaved ? <FaBookmark className="w-4 h-4" /> : <FaRegBookmark className="w-4 h-4" />}
          </button>
          <button
            onClick={() => onView(candidate)}
            className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <FaEye className="w-4 h-4" />
          </button>
          <button
            onClick={() => onMessage(candidate)}
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
            {candidate.avatar || candidate.photoURL ? (
              <img
                src={candidate.avatar || candidate.photoURL}
                alt={candidate.name || candidate.displayName}
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xl font-semibold">
                {(candidate.name || candidate.displayName)?.charAt(0) || 'C'}
              </div>
            )}
            {matchScore >= 80 && (
              <div className="absolute -top-1 -right-1 bg-green-500 rounded-full p-1">
                <FaStar className="w-3 h-3 text-white" />
              </div>
            )}
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white">
              {candidate.name || candidate.displayName || 'Unknown Candidate'}
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {candidate.headline || candidate.title || 'Student'}
            </p>
            {candidate.location && (
              <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                <FaMapMarkerAlt className="w-3 h-3" />
                {candidate.location}
              </p>
            )}
          </div>
        </div>

        <button
          onClick={() => onSave(candidate)}
          className={`p-2 rounded-lg transition-colors ${
            isSaved 
              ? 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20' 
              : 'text-gray-400 hover:text-yellow-500 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          {isSaved ? <FaBookmark className="w-4 h-4" /> : <FaRegBookmark className="w-4 h-4" />}
        </button>
      </div>

      {/* Match Score */}
      <div className="mb-4">
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
      </div>

      {/* Details */}
      <div className="space-y-2 mb-4 text-sm">
        {candidate.email && (
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
            <FaEnvelope className="w-4 h-4" />
            <span className="truncate">{candidate.email}</span>
          </div>
        )}
        {candidate.experience && (
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
            <FaBriefcase className="w-4 h-4" />
            <span>{candidate.experience}</span>
          </div>
        )}
        {candidate.education && (
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
            <FaGraduationCap className="w-4 h-4" />
            <span className="truncate">{candidate.education}</span>
          </div>
        )}
      </div>

      {/* Skills */}
      {candidate.skills && candidate.skills.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-4">
          {candidate.skills.slice(0, 3).map((skill, index) => (
            <span
              key={index}
              className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded text-xs"
            >
              {skill}
            </span>
          ))}
          {candidate.skills.length > 3 && (
            <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded text-xs">
              +{candidate.skills.length - 3}
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
          onClick={() => onView(candidate)}
          className="flex-1 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg text-sm font-medium hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
        >
          <FaEye className="w-4 h-4 inline mr-1" />
          View Profile
        </button>
        <button
          onClick={() => onMessage(candidate)}
          className="flex-1 px-3 py-2 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg text-sm font-medium hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors"
        >
          <FaCommentDots className="w-4 h-4 inline mr-1" />
          Message
        </button>
        <button
          onClick={() => onInvite(candidate)}
          className="p-2 text-gray-400 hover:text-purple-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          title="Invite to Apply"
        >
          <FaUserPlus className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
};

const CandidateDetailModal = ({ 
  candidate, 
  show, 
  onClose, 
  onMessage, 
  onSave,
  onInvite,
  isSaved,
  loading 
}) => {
  if (!candidate) return null;

  const matchScore = candidate.matchScore || Math.floor(Math.random() * 30) + 70;
  const matchConfig = getMatchScoreColor(matchScore);
  const availabilityConfig = getAvailabilityConfig(candidate.availability);

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
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Candidate Profile
              </h2>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 max-h-[70vh] overflow-y-auto">
              {/* Profile Header */}
              <div className="flex items-start gap-6 mb-6">
                <div className="relative">
                  {candidate.avatar || candidate.photoURL ? (
                    <img
                      src={candidate.avatar || candidate.photoURL}
                      alt={candidate.name || candidate.displayName}
                      className="w-24 h-24 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-3xl font-bold">
                      {(candidate.name || candidate.displayName)?.charAt(0) || 'C'}
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {candidate.name || candidate.displayName || 'Unknown Candidate'}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mt-1">
                    {candidate.headline || candidate.title || 'Student'}
                  </p>
                  <div className="flex flex-wrap items-center gap-3 mt-3">
                    <span className={`text-sm font-semibold ${matchConfig.text}`}>
                      {matchScore}% Match - {matchConfig.label}
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
                {candidate.email && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                    <FaEnvelope className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Email</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {candidate.email}
                      </p>
                    </div>
                  </div>
                )}
                {candidate.phone && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                    <FaPhone className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Phone</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {candidate.phone}
                      </p>
                    </div>
                  </div>
                )}
                {candidate.location && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                    <FaMapMarkerAlt className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Location</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {candidate.location}
                      </p>
                    </div>
                  </div>
                )}
                {candidate.experience && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                    <FaBriefcase className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Experience</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {candidate.experience}
                      </p>
                    </div>
                  </div>
                )}
                {candidate.education && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                    <FaGraduationCap className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Education</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {candidate.education}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Bio */}
              {candidate.bio && (
                <div className="mb-6">
                  <h4 className="mb-3 text-sm font-medium text-gray-500">About</h4>
                  <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                    <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                      {candidate.bio}
                    </p>
                  </div>
                </div>
              )}

              {/* Skills */}
              {candidate.skills && candidate.skills.length > 0 && (
                <div className="mb-6">
                  <h4 className="mb-3 text-sm font-medium text-gray-500">Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {candidate.skills.map((skill, index) => (
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
              {candidate.workExperience && candidate.workExperience.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-500 mb-3">Work Experience</h4>
                  <div className="space-y-3">
                    {candidate.workExperience.map((exp, index) => (
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
              {candidate.educationHistory && candidate.educationHistory.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-500 mb-3">Education</h4>
                  <div className="space-y-3">
                    {candidate.educationHistory.map((edu, index) => (
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
            </div>

            {/* Footer Actions */}
            <div className="flex items-center gap-3 p-6 border-t border-gray-100 dark:border-gray-700">
              <button
                onClick={() => onSave(candidate)}
                className={`px-4 py-2.5 rounded-xl font-medium transition-colors flex items-center gap-2 ${
                  isSaved
                    ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {isSaved ? <FaBookmark className="w-4 h-4" /> : <FaRegBookmark className="w-4 h-4" />}
                {isSaved ? 'Saved' : 'Save to Talent Pool'}
              </button>
              <button
                onClick={() => onInvite(candidate)}
                className="px-4 py-2.5 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors flex items-center gap-2"
              >
                <FaUserPlus className="w-4 h-4" />
                Invite to Apply
              </button>
              <button
                onClick={() => onMessage(candidate)}
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

const BrowseCandidates = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { currentUser, userProfile } = useAuth();
  const { showNotification } = useNotification();
  
  const companyId = currentUser?.uid;
  const { candidates, loading, error, hasMore, loadMore } = useCandidates(companyId);

  // Local state
  const [searchTerm, setSearchTerm] = useState('');
  const [experienceFilter, setExperienceFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState('all');
  const [skillsFilter, setSkillsFilter] = useState([]);
  const [newSkillFilter, setNewSkillFilter] = useState('');
  const [sortBy, setSortBy] = useState('relevance');
  const [viewMode, setViewMode] = useState('grid');
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [savedCandidates, setSavedCandidates] = useState(new Set());
  const [stats, setStats] = useState({
    total: 0,
    available: 0,
    highMatch: 0,
  });

  // Load saved candidates from Firebase
  useEffect(() => {
    if (!companyId) return;

    const savedQuery = query(
      collection(db, 'savedCandidates'),
      where('companyId', '==', companyId)
    );

    const unsubscribe = onSnapshot(savedQuery, (snapshot) => {
      const saved = new Set(snapshot.docs.map(doc => doc.data().candidateId));
      setSavedCandidates(saved);
    });

    return () => unsubscribe();
  }, [companyId]);

  // Compute stats
  useEffect(() => {
    if (candidates.length > 0) {
      setStats({
        total: candidates.length,
        available: candidates.filter(c => c.availability === 'immediately').length,
        highMatch: candidates.filter(c => (c.matchScore || 0) >= 80).length,
      });
    }
  }, [candidates]);

  // Filter and sort candidates
  const filteredCandidates = useMemo(() => {
    let filtered = [...candidates];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(candidate =>
        candidate.name?.toLowerCase().includes(term) ||
        candidate.displayName?.toLowerCase().includes(term) ||
        candidate.email?.toLowerCase().includes(term) ||
        candidate.headline?.toLowerCase().includes(term) ||
        candidate.skills?.some(skill => skill.toLowerCase().includes(term))
      );
    }

    // Experience filter
    if (experienceFilter !== 'all') {
      filtered = filtered.filter(candidate => candidate.experienceLevel === experienceFilter);
    }

    // Location filter
    if (locationFilter) {
      filtered = filtered.filter(candidate =>
        candidate.location?.toLowerCase().includes(locationFilter.toLowerCase())
      );
    }

    // Availability filter
    if (availabilityFilter !== 'all') {
      filtered = filtered.filter(candidate => candidate.availability === availabilityFilter);
    }

    // Skills filter
    if (skillsFilter.length > 0) {
      filtered = filtered.filter(candidate =>
        skillsFilter.every(skill =>
          candidate.skills?.some(candidateSkill =>
            candidateSkill.toLowerCase().includes(skill.toLowerCase())
          )
        )
      );
    }

    // Sort
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
        default:
          return 0;
      }
    });

    return filtered;
  }, [candidates, searchTerm, experienceFilter, locationFilter, availabilityFilter, skillsFilter, sortBy]);

  // Handlers
  const handleSaveCandidate = async (candidate) => {
    if (!companyId) return;

    try {
      const savedRef = doc(db, 'savedCandidates', `${companyId}_${candidate.id}`);
      const savedDoc = await getDoc(savedRef);

      if (savedDoc.exists()) {
        // Remove from saved
        await deleteDoc(savedRef);
        showNotification('success', 'Candidate removed from talent pool');
      } else {
        // Add to saved
        await addDoc(collection(db, 'savedCandidates'), {
          companyId,
          candidateId: candidate.id,
          candidateName: candidate.name || candidate.displayName,
          candidateEmail: candidate.email,
          savedAt: serverTimestamp(),
        });
        showNotification('success', 'Candidate saved to talent pool');
      }
    } catch (error) {
      console.error('Error saving candidate:', error);
      showNotification('error', 'Failed to save candidate');
    }
  };

  const handleMessageCandidate = (candidate) => {
    navigate(`/company/chat?candidate=${candidate.id}`);
  };

  const handleInviteToApply = async (candidate) => {
    try {
      // Create invitation record
      await addDoc(collection(db, 'invitations'), {
        companyId,
        candidateId: candidate.id,
        candidateName: candidate.name || candidate.displayName,
        candidateEmail: candidate.email,
        status: 'pending',
        sentAt: serverTimestamp(),
        createdBy: companyId,
      });

      // Send notification to candidate
      await addDoc(collection(db, 'notifications'), {
        userId: candidate.id,
        type: 'invitation',
        title: 'Job Invitation',
        message: `${userProfile?.companyName || 'A company'} has invited you to apply for a position`,
        read: false,
        createdAt: serverTimestamp(),
      });

      // Log activity in Supabase
      await supabase
        .from('company_activities')
        .insert({
          company_id: companyId,
          activity_type: 'candidate_invited',
          metadata: { candidate_id: candidate.id, candidate_name: candidate.name },
          created_at: new Date().toISOString(),
        });

      showNotification('success', `Invitation sent to ${candidate.name || candidate.displayName}`);
    } catch (error) {
      console.error('Error sending invitation:', error);
      showNotification('error', 'Failed to send invitation');
    }
  };

  const handleViewCandidate = (candidate) => {
    setSelectedCandidate(candidate);
    setShowDetailModal(true);
  };

  const handleAddSkillFilter = () => {
    if (newSkillFilter.trim() && !skillsFilter.includes(newSkillFilter.trim())) {
      setSkillsFilter(prev => [...prev, newSkillFilter.trim()]);
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
    setSkillsFilter([]);
    setSortBy('relevance');
  };

  const hasFilters = searchTerm || experienceFilter !== 'all' || locationFilter || availabilityFilter !== 'all' || skillsFilter.length > 0;

  // Render
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
              <FaUsers className="w-8 h-8 text-blue-600" />
              Browse Candidates
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Discover talented candidates for your job openings
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/company/talent-pool')}
              className="px-4 py-2.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-medium border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
            >
              <FaBookmark className="w-4 h-4" />
              Talent Pool ({savedCandidates.size})
            </button>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Total Candidates', value: stats.total, color: 'blue', icon: FaUsers },
            { label: 'Available Now', value: stats.available, color: 'green', icon: FaClock },
            { label: 'High Match (80%+)', value: stats.highMatch, color: 'purple', icon: FaStar },
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                    {formatNumber(stat.value)}
                  </p>
                </div>
                <div className={`p-3 rounded-xl ${
                  stat.color === 'blue' ? 'bg-blue-50 text-blue-600' :
                  stat.color === 'green' ? 'bg-green-50 text-green-600' :
                  'bg-purple-50 text-purple-600'
                }`}>
                  <stat.icon className="w-6 h-6" />
                </div>
              </div>
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
                  className="flex-1 md:flex-none px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {SORT_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
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
                {AVAILABILITY_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
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
            Showing {filteredCandidates.length} of {candidates.length} candidates
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
        ) : filteredCandidates.length === 0 ? (
          <EmptyState onAction={clearFilters} hasFilters={hasFilters} />
        ) : (
          <>
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCandidates.map((candidate) => (
                  <CandidateCard
                    key={candidate.id}
                    candidate={candidate}
                    onView={handleViewCandidate}
                    onMessage={handleMessageCandidate}
                    onSave={handleSaveCandidate}
                    onInvite={handleInviteToApply}
                    isSaved={savedCandidates.has(candidate.id)}
                    viewMode="grid"
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredCandidates.map((candidate) => (
                  <CandidateCard
                    key={candidate.id}
                    candidate={candidate}
                    onView={handleViewCandidate}
                    onMessage={handleMessageCandidate}
                    onSave={handleSaveCandidate}
                    onInvite={handleInviteToApply}
                    isSaved={savedCandidates.has(candidate.id)}
                    viewMode="list"
                  />
                ))}
              </div>
            )}

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
      <CandidateDetailModal
        candidate={selectedCandidate}
        show={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedCandidate(null);
        }}
        onMessage={handleMessageCandidate}
        onSave={handleSaveCandidate}
        onInvite={handleInviteToApply}
        isSaved={selectedCandidate ? savedCandidates.has(selectedCandidate.id) : false}
      />
    </div>
  );
};

export default BrowseCandidates;