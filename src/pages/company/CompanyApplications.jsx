// src/pages/company/CompanyApplications.jsx
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { FaFileAlt, FaSearch, FaFilter, FaSort, FaSortAmountDown, FaSortAmountUp, FaEye, FaDownload, FaEnvelope, FaPhone, FaMapMarkerAlt, FaGraduationCap, FaBriefcase, FaStar, FaRegStar, FaCheckCircle, FaTimesCircle, FaClock, FaCalendarAlt, FaUserCheck, FaUserTimes, FaUserPlus, FaCommentDots, FaEllipsisV, FaExternalLinkAlt, FaChevronLeft, FaChevronRight, FaSpinner, FaExclamationTriangle, FaSync, FaTh, FaList, FaThLarge, FaFileExport, FaFilePdf, FaFileWord, FaRegClock, FaRegCalendar, FaRegFileAlt, FaRegUser, FaRegEnvelope, FaRegMap, FaLinkedin, FaGlobe, FaCode, FaChartLine, FaChartBar, FaPercentage, FaUserTie, FaBuilding, FaWifi, FaTimes, FaCheck, FaArrowLeft, FaArrowRight, FaTrash, FaEdit, FaCopy, FaShare, FaBookmark, FaRegBookmark, FaThumbsUp, FaThumbsDown, FaRegThumbsUp, FaRegThumbsDown, FaFlag, FaFire, FaSnowflake, FaSun, FaMoon, FaRegSmile, FaRegLaugh, FaRegHeart, FaHeart, FaRegCommentDots, FaRobot, FaBrain, FaMagic, FaLightbulb, FaTrophy, FaAward, FaMedal, FaCrown, FaGem, FaRocket, FaBolt, FaShieldAlt, FaFingerprint, FaUserShield, FaUserLock, FaUsers, FaUserFriends, FaUsersCog, FaUserCog, FaUserEdit, FaUserCircle, FaIdCard, FaAddressCard, FaAddressBook, FaClipboardCheck, FaClipboardList, FaTasks, FaProjectDiagram, FaSitemap, FaNetworkWired, FaServer, FaDatabase, FaCloud, FaCloudUploadAlt, FaCloudDownloadAlt, FaHdd, FaMemory, FaMicrochip, FaLaptopCode, FaDesktop, FaLaptop, FaTabletAlt, FaMobileAlt, FaMobile, FaPrint, FaFax, FaVoicemail, FaInbox, FaPaperPlane, FaPaperclip, FaLink, FaUnlink, FaAnchor, FaCompass, FaMap, FaMapPin, FaDirections, FaRoute, FaCar, FaBus, FaTrain, FaSubway, FaBicycle, FaWalking, FaRunning, FaHome, FaBuilding as FaBuildingSolid, FaWarehouse, FaIndustry, FaStore, FaShoppingCart, FaShoppingBag, FaShoppingBasket, FaCashRegister, FaBox, FaBoxes, FaPallet, FaTruck, FaTruckLoading, FaTruckMoving, FaShip, FaPlane, FaRocket as FaRocketSolid, FaSatellite, FaSatelliteDish, FaWifi as FaWifiSolid, FaBroadcastTower, FaSignal, FaRss, FaPodcast, FaMicrophone, FaHeadphones, FaVolumeUp, FaVolumeMute, FaVolumeDown, FaMusic, FaFilm, FaVideo, FaCamera, FaCameraRetro, FaPhotoVideo, FaImages, FaFileImage, FaFileVideo, FaFileAudio, FaFilePdf as FaFilePdfSolid, FaFileWord as FaFileWordSolid, FaFileExcel, FaFilePowerpoint, FaFileArchive, FaFileCode, FaFile, FaFolder, FaFolderOpen, FaFolderPlus, FaFolderMinus, FaPaste, FaCut, FaSave, FaUpload, FaDownload as FaDownloadSolid, FaSyncAlt, FaRedo, FaUndo, FaHistory, FaHourglass, FaHourglassStart, FaHourglassHalf, FaHourglassEnd, FaStopwatch, FaRegClock as FaRegClockSolid, FaRegCalendarAlt, FaRegCalendarCheck, FaRegCalendarMinus, FaRegCalendarPlus, FaRegCalendarTimes, FaCalendarCheck, FaCalendarDay, FaCalendarWeek, FaCalendarAlt as FaCalendarAltSolid, FaCalendarPlus, FaCalendarMinus, FaCalendarTimes, FaBell, FaRegBell, FaBellSlash, FaRegBellSlash, FaComment, FaRegComment, FaComments, FaRegComments, FaEnvelopeOpen, FaEnvelopeOpenText, FaRegEnvelopeOpen, FaMailBulk, FaRegPaperPlane, FaPaperPlane as FaPaperPlaneSolid, FaShareAlt, FaShareSquare, FaRegShareSquare, FaRetweet, FaReply, FaReplyAll, FaForward, FaTrashAlt, FaRegTrashAlt, FaRegEdit, FaPen, FaPencilAlt, FaMarker, FaHighlighter, FaEraser, FaRuler, FaRulerCombined, FaRulerHorizontal, FaRulerVertical, FaDraftingCompass, FaVectorSquare, FaBezierCurve, FaDrawPolygon, FaShapes, FaCube, FaCubes, FaLayerGroup, FaObjectGroup, FaObjectUngroup, FaAlignLeft, FaAlignRight, FaAlignCenter, FaAlignJustify, FaIndent, FaOutdent, FaListUl, FaListOl, FaListAlt, FaStream, FaBars, FaBars as FaBarsSolid, FaEllipsisH, FaEllipsisV as FaEllipsisVSolid, FaGripHorizontal, FaGripVertical, FaGripLines, FaGripLinesVertical, FaThList, FaThLarge as FaThLargeSolid, FaBorderAll, FaBorderNone, FaBorderStyle, FaColumns, FaRssSquare, FaTable, FaTablet, FaTablets, FaTachometerAlt, FaTachometerAlt as FaTachometerAltSolid, FaThermometer, FaThermometerEmpty, FaThermometerFull, FaThermometerHalf, FaThermometerQuarter, FaThermometerThreeQuarters, FaTicketAlt, FaTags, FaTag, FaHashtag, FaAt, FaAsterisk, FaPlus, FaPlusCircle, FaMinus, FaMinusCircle, FaTimesCircle as FaTimesCircleSolid, FaCheckCircle as FaCheckCircleSolid, FaExclamationCircle, FaQuestionCircle, FaInfoCircle, FaBan, FaSmoking, FaSmokingBan, FaWineGlass, FaWineGlassAlt, FaBeer, FaCocktail, FaCoffee, FaMugHot, FaUtensils, FaUtensilSpoon, FaHamburger, FaPizzaSlice, FaHotdog, FaIceCream, FaBirthdayCake, FaCookie, FaCookieBite, FaCandyCane, FaCarrot, FaLemon, FaPepperHot, FaDrumstickBite, FaBacon, FaEgg, FaCheese, FaBreadSlice, FaAppleAlt, FaSeedling, FaLeaf, FaTree, FaSpa, FaHotTub, FaSwimmer, FaSwimmingPool, FaDumbbell, FaBasketballBall, FaFootballBall, FaBaseballBall, FaGolfBall, FaTableTennis, FaBowlingBall, FaChess, FaChessBoard, FaDice, FaPuzzlePiece, FaGamepad, FaGhost, FaDragon, FaHatWizard, FaMagic as FaMagicSolid, FaBroom, FaHatCowboy, FaGlasses, FaTshirt, FaShoePrints, FaSocks, FaMitten, FaHandsHelping, FaHandHoldingHeart, FaHandHoldingUsd, FaHandRock, FaHandPaper, FaHandScissors, FaHandLizard, FaHandSpock, FaHandPeace, FaHandPointUp, FaHandPointDown, FaHandPointLeft, FaHandPointRight, FaHandPointer, FaPrayingHands, FaPray, FaChurch, FaMosque, FaSynagogue, FaCross, FaStarOfDavid, FaOm, FaPeace, FaYinYang, FaDove, FaFeather, FaFeatherAlt, FaCrow, FaFish, FaFrog, FaHorse, FaHorseHead, FaCat, FaDog, FaPaw, FaSpider, FaBug, FaHippo, FaIcicles, FaOtter, FaStroopwafel, FaKiwiBird, FaDrumstickBite as FaDrumstickBiteSolid, FaDrum, FaDrumSteelpan, FaGuitar, FaMicrophoneAlt, FaMicrophoneAltSlash, FaMicrophoneSlash, FaHeadphonesAlt, FaHeadphones as FaHeadphonesSolid, FaBroadcastTower as FaBroadcastTowerSolid, FaTv, FaSatelliteDish as FaSatelliteDishSolid, FaSdCard, FaSimCard, FaUsb, FaHdd as FaHddSolid, FaMemory as FaMemorySolid, FaMicrochip as FaMicrochipSolid, FaBatteryFull, FaBatteryHalf, FaBatteryQuarter, FaBatteryEmpty, FaBatteryThreeQuarters, FaPlug, FaChargingStation, FaBolt as FaBoltSolid, FaRegSnowflake, FaSnowflake as FaSnowflakeSolid, FaFire as FaFireSolid, FaFireAlt, FaFireExtinguisher, FaSmog, FaCloudSun, FaCloudMoon, FaCloudRain, FaCloudShowersHeavy, FaCloudMeatball, FaCloudMoonRain, FaCloudSunRain, FaPooStorm, FaWind, FaUmbrella, FaUmbrellaBeach, FaWater, FaTint, FaTintSlash, FaEyeDropper, FaFill, FaFillDrip, FaFaucet, FaSink, FaToilet, FaToiletPaper, FaShower, FaBath, FaHotTub as FaHotTubSolid, FaSwimmer as FaSwimmerSolid, FaSwimmingPool as FaSwimmingPoolSolid, FaDumbbell as FaDumbbellSolid, FaBasketballBall as FaBasketballBallSolid, FaFootballBall as FaFootballBallSolid, FaBaseballBall as FaBaseballBallSolid, FaGolfBall as FaGolfBallSolid, FaTableTennis as FaTableTennisSolid, FaBowlingBall as FaBowlingBallSolid, FaChess as FaChessSolid, FaChessBoard as FaChessBoardSolid, FaDice as FaDiceSolid, FaPuzzlePiece as FaPuzzlePieceSolid, FaGamepad as FaGamepadSolid, FaGhost as FaGhostSolid, FaDragon as FaDragonSolid, FaHatWizard as FaHatWizardSolid, FaBroom as FaBroomSolid, FaHatCowboy as FaHatCowboySolid, FaGlasses as FaGlassesSolid, FaTshirt as FaTshirtSolid, FaShoePrints as FaShoePrintsSolid, FaSocks as FaSocksSolid, FaMitten as FaMittenSolid, FaHandsHelping as FaHandsHelpingSolid, FaHandHoldingHeart as FaHandHoldingHeartSolid, FaHandHoldingUsd as FaHandHoldingUsdSolid, FaHandRock as FaHandRockSolid, FaHandPaper as FaHandPaperSolid, FaHandScissors as FaHandScissorsSolid, FaHandLizard as FaHandLizardSolid, FaHandSpock as FaHandSpockSolid, FaHandPeace as FaHandPeaceSolid, FaHandPointUp as FaHandPointUpSolid, FaHandPointDown as FaHandPointDownSolid, FaHandPointLeft as FaHandPointLeftSolid, FaHandPointRight as FaHandPointRightSolid, FaHandPointer as FaHandPointerSolid, FaPrayingHands as FaPrayingHandsSolid, FaPray as FaPraySolid, FaChurch as FaChurchSolid, FaMosque as FaMosqueSolid, FaSynagogue as FaSynagogueSolid, FaCross as FaCrossSolid, FaStarOfDavid as FaStarOfDavidSolid, FaOm as FaOmSolid, FaPeace as FaPeaceSolid, FaYinYang as FaYinYangSolid, FaDove as FaDoveSolid, FaFeather as FaFeatherSolid, FaFeatherAlt as FaFeatherAltSolid, FaCrow as FaCrowSolid, FaFish as FaFishSolid, FaFrog as FaFrogSolid, FaHorse as FaHorseSolid, FaHorseHead as FaHorseHeadSolid, FaCat as FaCatSolid, FaDog as FaDogSolid, FaPaw as FaPawSolid, FaSpider as FaSpiderSolid, FaBug as FaBugSolid, FaHippo as FaHippoSolid, FaIcicles as FaIciclesSolid, FaOtter as FaOtterSolid, FaStroopwafel as FaStroopwafelSolid, FaKiwiBird as FaKiwiBirdSolid } from "react-icons/fa";
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
import { getCompanyCandidateProfile } from '../../services/companyCandidateService';
import { supabase } from '../../config/supabase';
import supabaseMediaService from '../../services/supabaseMediaService';

// ============================================
// CONSTANTS
// ============================================

const APPLICATION_STATUSES = [
  { value: 'all', label: 'All Applications', color: 'gray' },
  { value: 'applied', label: 'New', color: 'blue' },
  { value: 'reviewed', label: 'Reviewed', color: 'indigo' },
  { value: 'shortlisted', label: 'Shortlisted', color: 'cyan' },
  { value: 'interview', label: 'Interview', color: 'purple' },
  { value: 'hired', label: 'Hired', color: 'green' },
  { value: 'rejected', label: 'Rejected', color: 'red' },
  { value: 'withdrawn', label: 'Withdrawn', color: 'gray' },
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'match', label: 'Best Match' },
  { value: 'name', label: 'Candidate Name' },
  { value: 'experience', label: 'Most Experienced' },
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

const getStatusConfig = (status) => {
  const configs = {
    applied: { 
      bg: 'bg-blue-100 dark:bg-blue-900/30', 
      text: 'text-blue-700 dark:text-blue-300', 
      icon: FaFileAlt, 
      label: 'New',
      dot: 'bg-blue-500'
    },
    reviewed: { 
      bg: 'bg-indigo-100 dark:bg-indigo-900/30', 
      text: 'text-indigo-700 dark:text-indigo-300', 
      icon: FaEye, 
      label: 'Reviewed',
      dot: 'bg-indigo-500'
    },
    shortlisted: { 
      bg: 'bg-cyan-100 dark:bg-cyan-900/30', 
      text: 'text-cyan-700 dark:text-cyan-300', 
      icon: FaStar, 
      label: 'Shortlisted',
      dot: 'bg-cyan-500'
    },
    interview: { 
      bg: 'bg-purple-100 dark:bg-purple-900/30', 
      text: 'text-purple-700 dark:text-purple-300', 
      icon: FaCalendarAlt, 
      label: 'Interview',
      dot: 'bg-purple-500'
    },
    hired: { 
      bg: 'bg-green-100 dark:bg-green-900/30', 
      text: 'text-green-700 dark:text-green-300', 
      icon: FaCheckCircle, 
      label: 'Hired',
      dot: 'bg-green-500'
    },
    rejected: { 
      bg: 'bg-red-100 dark:bg-red-900/30', 
      text: 'text-red-700 dark:text-red-300', 
      icon: FaTimesCircle, 
      label: 'Rejected',
      dot: 'bg-red-500'
    },
    withdrawn: { 
      bg: 'bg-gray-100 dark:bg-gray-700', 
      text: 'text-gray-700 dark:text-gray-300', 
      icon: FaTimes, 
      label: 'Withdrawn',
      dot: 'bg-gray-500'
    },
  };
  return configs[status] || configs.applied;
};

const getMatchScoreColor = (score) => {
  if (score >= 90) return { bg: 'bg-green-500', text: 'text-green-600', label: 'Excellent' };
  if (score >= 80) return { bg: 'bg-blue-500', text: 'text-blue-600', label: 'Great' };
  if (score >= 70) return { bg: 'bg-yellow-500', text: 'text-yellow-600', label: 'Good' };
  if (score >= 60) return { bg: 'bg-orange-500', text: 'text-orange-600', label: 'Fair' };
  return { bg: 'bg-red-500', text: 'text-red-600', label: 'Low' };
};

// ============================================
// CUSTOM HOOKS
// ============================================

const useCompanyApplications = (companyId, filters = {}) => {
  const [applications, setApplications] = useState([]);
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
      collection(db, 'applications'),
      where('companyId', '==', companyId),
      orderBy('appliedAt', 'desc'),
      limit(ITEMS_PER_PAGE * 3)
    );

    if (filters.status && filters.status !== 'all') {
      q = query(
        collection(db, 'applications'),
        where('companyId', '==', companyId),
        where('status', '==', filters.status),
        orderBy('appliedAt', 'desc'),
        limit(ITEMS_PER_PAGE * 3)
      );
    }

    const unsubscribe = onSnapshot(
      q,
      async (snapshot) => {
        const applicationsData = await Promise.all(
          snapshot.docs.map(async (docSnapshot) => {
            const data = docSnapshot.data();
            
            // Fetch candidate details
            let candidate = null;
            if (data.candidateId) {
              try {
                candidate = await getCompanyCandidateProfile(data.candidateId);
              } catch (err) {
                console.log('Could not fetch candidate:', err);
              }
            }

            // Fetch job details
            let job = null;
            if (data.jobId) {
              try {
                const jobDoc = await getDoc(doc(db, 'jobs', data.jobId));
                if (jobDoc.exists()) {
                  job = { id: jobDoc.id, ...jobDoc.data() };
                }
              } catch (err) {
                console.log('Could not fetch job:', err);
              }
            }

            return {
              id: docSnapshot.id,
              ...data,
              candidate: candidate || data.candidate || { name: 'Unknown Candidate' },
              job: job || data.job || { title: 'Unknown Position' },
              appliedAt: data.appliedAt?.toDate?.() || data.appliedAt,
              updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
            };
          })
        );

        setApplications(applicationsData);
        setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
        setHasMore(snapshot.docs.length === ITEMS_PER_PAGE * 3);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching applications:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [companyId, filters.status]);

  const loadMore = useCallback(async () => {
    if (!companyId || !lastDoc || !hasMore) return;

    try {
      const moreQuery = query(
        collection(db, 'applications'),
        where('companyId', '==', companyId),
        orderBy('appliedAt', 'desc'),
        startAfter(lastDoc),
        limit(ITEMS_PER_PAGE)
      );

      const snapshot = await getDocs(moreQuery);
      const moreApplications = await Promise.all(
        snapshot.docs.map(async (docSnapshot) => {
          const data = docSnapshot.data();
          
          let candidate = null;
          if (data.candidateId) {
            try {
              candidate = await getCompanyCandidateProfile(data.candidateId);
            } catch (err) {
              console.log('Could not fetch candidate:', err);
            }
          }

          let job = null;
          if (data.jobId) {
            try {
              const jobDoc = await getDoc(doc(db, 'jobs', data.jobId));
              if (jobDoc.exists()) {
                job = { id: jobDoc.id, ...jobDoc.data() };
              }
            } catch (err) {
              console.log('Could not fetch job:', err);
            }
          }

          return {
            id: docSnapshot.id,
            ...data,
            candidate: candidate || data.candidate || { name: 'Unknown Candidate' },
            job: job || data.job || { title: 'Unknown Position' },
            appliedAt: data.appliedAt?.toDate?.() || data.appliedAt,
            updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
          };
        })
      );

      setApplications(prev => [...prev, ...moreApplications]);
      setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
      setHasMore(snapshot.docs.length === ITEMS_PER_PAGE);
    } catch (err) {
      console.error('Error loading more applications:', err);
    }
  }, [companyId, lastDoc, hasMore]);

  return { applications, loading, error, hasMore, loadMore };
};

// ============================================
// COMPONENTS
// ============================================

const LoadingSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {[...Array(6)].map((_, i) => (
      <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-6 animate-pulse">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
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
      <FaFileAlt className="w-12 h-12 text-gray-400" />
    </div>
    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
      {hasFilters ? 'No applications match your filters' : 'No applications yet'}
    </h3>
    <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
      {hasFilters 
        ? 'Try adjusting your search or filter criteria to find more applications.'
        : 'Applications will appear here once candidates apply to your job postings.'
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

const ApplicationCard = ({ 
  application, 
  onView, 
  onUpdateStatus, 
  onMessage, 
  onShortlist,
  onReject,
  isSelected,
  onSelect,
  viewMode = 'grid'
}) => {
  const statusConfig = getStatusConfig(application.status);
  const StatusIcon = statusConfig.icon;
  const matchScore = application.matchScore || 0;
  const matchConfig = getMatchScoreColor(matchScore);

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
          onChange={() => onSelect(application.id)}
          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
        />

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
          {matchScore >= 80 && (
            <div className="absolute -top-1 -right-1 bg-green-500 rounded-full p-1">
              <FaStar className="w-3 h-3 text-white" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-900 dark:text-white truncate">
            {application.candidate?.name || 'Unknown Candidate'}
          </h4>
          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
            {application.job?.title || 'Position'}
          </p>
        </div>

        <div className="hidden md:flex items-center gap-6">
          <div className="text-center">
            <div className={`text-lg font-bold ${matchConfig.text}`}>
              {matchScore}%
            </div>
            <div className="text-xs text-gray-400">Match</div>
          </div>
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.text}`}>
            <StatusIcon className="w-3 h-3" />
            {statusConfig.label}
          </span>
          <span className="text-xs text-gray-400">{formatTimeAgo(application.appliedAt)}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onView(application)}
            className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <FaEye className="w-4 h-4" />
          </button>
          <button
            onClick={() => onMessage(application)}
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
      className={`bg-white dark:bg-gray-800 rounded-xl p-6 border transition-all hover:shadow-md ${
        isSelected ? 'border-blue-500 ring-1 ring-blue-500' : 'border-gray-100 dark:border-gray-700'
      }`}
    >
      {/* Selection checkbox */}
      <div className="absolute top-4 left-4">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onSelect(application.id)}
          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"
        />
      </div>

      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3">
          <div className="relative">
            {application.candidate?.avatar ? (
              <img
                src={application.candidate.avatar}
                alt={application.candidate.name}
                className="w-14 h-14 rounded-full object-cover"
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xl font-semibold">
                {application.candidate?.name?.charAt(0) || 'C'}
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
              {application.candidate?.name || 'Unknown Candidate'}
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {application.job?.title || 'Position'}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.text}`}>
                <StatusIcon className="w-3 h-3" />
                {statusConfig.label}
              </span>
            </div>
          </div>
        </div>
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
        {application.candidate?.email && (
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
            <FaEnvelope className="w-4 h-4" />
            <span className="truncate">{application.candidate.email}</span>
          </div>
        )}
        {application.candidate?.location && (
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
            <FaMapMarkerAlt className="w-4 h-4" />
            <span>{application.candidate.location}</span>
          </div>
        )}
        {application.candidate?.experience && (
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
            <FaBriefcase className="w-4 h-4" />
            <span>{application.candidate.experience}</span>
          </div>
        )}
      </div>

      {/* Skills */}
      {application.candidate?.skills && application.candidate.skills.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-4">
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

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
        <span className="text-xs text-gray-400">
          {formatTimeAgo(application.appliedAt)}
        </span>
        <div className="flex items-center gap-1">
          {application.status === 'applied' && (
            <>
              <button
                onClick={() => onShortlist(application)}
                className="p-2 text-gray-400 hover:text-cyan-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title="Shortlist"
              >
                <FaStar className="w-4 h-4" />
              </button>
              <button
                onClick={() => onReject(application)}
                className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title="Reject"
              >
                <FaTimesCircle className="w-4 h-4" />
              </button>
            </>
          )}
          <button
            onClick={() => onView(application)}
            className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="View"
          >
            <FaEye className="w-4 h-4" />
          </button>
          <button
            onClick={() => onMessage(application)}
            className="p-2 text-gray-400 hover:text-green-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="Message"
          >
            <FaCommentDots className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const ApplicationDetailModal = ({ 
  application, 
  show, 
  onClose, 
  onUpdateStatus, 
  onMessage,
  onDownloadResume,
  loading 
}) => {
  if (!application) return null;

  const statusConfig = getStatusConfig(application.status);
  const matchScore = application.matchScore || 0;
  const matchConfig = getMatchScoreColor(matchScore);

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
                Application Details
              </h2>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 max-h-[70vh] overflow-y-auto">
              {/* Candidate Info */}
              <div className="flex items-start gap-4 mb-6">
                {application.candidate?.avatar ? (
                  <img
                    src={application.candidate.avatar}
                    alt={application.candidate.name}
                    className="w-20 h-20 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
                    {application.candidate?.name?.charAt(0) || 'C'}
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {application.candidate?.name || 'Unknown Candidate'}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    {application.job?.title || 'Position'}
                  </p>
                  <div className="flex flex-wrap items-center gap-3 mt-2">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.text}`}>
                      <statusConfig.icon className="w-3 h-3" />
                      {statusConfig.label}
                    </span>
                    <span className={`text-sm font-semibold ${matchConfig.text}`}>
                      {matchScore}% Match
                    </span>
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {application.candidate?.email && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                    <FaEnvelope className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Email</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {application.candidate.email}
                      </p>
                    </div>
                  </div>
                )}
                {application.candidate?.phone && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                    <FaPhone className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Phone</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {application.candidate.phone}
                      </p>
                    </div>
                  </div>
                )}
                {application.candidate?.location && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                    <FaMapMarkerAlt className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Location</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {application.candidate.location}
                      </p>
                    </div>
                  </div>
                )}
                {application.candidate?.experience && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                    <FaBriefcase className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Experience</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {application.candidate.experience}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Skills */}
              {application.candidate?.skills && application.candidate.skills.length > 0 && (
                <div className="mb-6">
                  <h4 className="mb-3 text-sm font-medium text-gray-500">Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {application.candidate.skills.map((skill, index) => (
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

              {/* Cover Letter / Notes */}
              {application.coverLetter && (
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-500 mb-3">Cover Letter</h4>
                  <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                    <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                      {application.coverLetter}
                    </p>
                  </div>
                </div>
              )}

              {/* Resume */}
              {application.resumeUrl && (
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-500 mb-3">Resume</h4>
                  <button
                    onClick={() => onDownloadResume(application)}
                    className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl w-full hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                  >
                    <FaFileAlt className="w-8 h-8 text-red-500" />
                    <div className="text-left">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Download Resume
                      </p>
                      <p className="text-xs text-gray-500">PDF Document</p>
                    </div>
                    <FaDownload className="w-5 h-5 text-gray-400 ml-auto" />
                  </button>
                </div>
              )}

              {/* Timeline */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-500 mb-3">Timeline</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Applied {formatTimeAgo(application.appliedAt)}
                    </span>
                  </div>
                  {application.reviewedAt && (
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Reviewed {formatTimeAgo(application.reviewedAt)}
                      </span>
                    </div>
                  )}
                  {application.interviewAt && (
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Interview scheduled for {formatDate(application.interviewAt)}
                      </span>
                    </div>
                  )}
                  {application.hiredAt && (
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Hired {formatTimeAgo(application.hiredAt)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex flex-wrap items-center gap-3 p-6 border-t border-gray-100 dark:border-gray-700">
              <div className="flex flex-wrap gap-2 flex-1">
                {application.status === 'applied' && (
                  <>
                    <button
                      onClick={() => onUpdateStatus(application.id, 'reviewed')}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2"
                    >
                      <FaEye className="w-4 h-4" />
                      Mark Reviewed
                    </button>
                    <button
                      onClick={() => onUpdateStatus(application.id, 'shortlisted')}
                      className="px-4 py-2 bg-cyan-600 text-white rounded-lg font-medium hover:bg-cyan-700 transition-colors flex items-center gap-2"
                    >
                      <FaStar className="w-4 h-4" />
                      Shortlist
                    </button>
                  </>
                )}
                {application.status === 'reviewed' && (
                  <button
                    onClick={() => onUpdateStatus(application.id, 'interview')}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center gap-2"
                  >
                    <FaCalendarAlt className="w-4 h-4" />
                    Schedule Interview
                  </button>
                )}
                {application.status === 'interview' && (
                  <button
                    onClick={() => onUpdateStatus(application.id, 'hired')}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center gap-2"
                  >
                    <FaCheckCircle className="w-4 h-4" />
                    Hire Candidate
                  </button>
                )}
                {application.status !== 'rejected' && application.status !== 'hired' && (
                  <button
                    onClick={() => onUpdateStatus(application.id, 'rejected')}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center gap-2"
                  >
                    <FaTimesCircle className="w-4 h-4" />
                    Reject
                  </button>
                )}
              </div>
              <button
                onClick={() => onMessage(application)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <FaCommentDots className="w-4 h-4" />
                Message
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const BulkActionBar = ({ 
  selectedCount, 
  onClearSelection, 
  onBulkUpdateStatus,
  onBulkMessage,
  onBulkExport 
}) => {
  if (selectedCount === 0) return null;

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 dark:bg-gray-800 text-white rounded-xl shadow-xl px-6 py-4 flex items-center gap-4 z-40"
    >
      <span className="text-sm font-medium">
        {selectedCount} selected
      </span>
      <div className="h-6 w-px bg-gray-700"></div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onBulkUpdateStatus('reviewed')}
          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
        >
          <FaEye className="w-3 h-3" />
          Review
        </button>
        <button
          onClick={() => onBulkUpdateStatus('shortlisted')}
          className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-700 rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
        >
          <FaStar className="w-3 h-3" />
          Shortlist
        </button>
        <button
          onClick={() => onBulkUpdateStatus('rejected')}
          className="px-3 py-1.5 bg-red-600 hover:bg-red-700 rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
        >
          <FaTimesCircle className="w-3 h-3" />
          Reject
        </button>
        <button
          onClick={onBulkMessage}
          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
        >
          <FaCommentDots className="w-3 h-3" />
          Message
        </button>
        <button
          onClick={onBulkExport}
          className="px-3 py-1.5 bg-gray-600 hover:bg-gray-700 rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
        >
          <FaFileExport className="w-3 h-3" />
          Export
        </button>
      </div>
      <div className="h-6 w-px bg-gray-700"></div>
      <button
        onClick={onClearSelection}
        className="p-1.5 hover:bg-gray-700 rounded-lg transition-colors"
      >
        <FaTimes className="w-4 h-4" />
      </button>
    </motion.div>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================

const CompanyApplications = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { currentUser, userProfile } = useAuth();
  const { showNotification } = useNotification();
  
  const companyId = userProfile?.companyId || currentUser?.companyId || currentUser?.uid;

  // Get initial filter from URL
  const initialStatus = searchParams.get('status') || 'all';
  
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const { applications, loading, error, hasMore, loadMore } = useCompanyApplications(
    companyId, 
    { status: statusFilter }
  );

  // Local state
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState('grid');
  const [selectedApplications, setSelectedApplications] = useState([]);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    new: 0,
    reviewed: 0,
    interview: 0,
    hired: 0,
    rejected: 0,
  });

  // Update URL when status filter changes
  useEffect(() => {
    if (statusFilter === 'all') {
      searchParams.delete('status');
    } else {
      searchParams.set('status', statusFilter);
    }
    setSearchParams(searchParams, { replace: true });
  }, [statusFilter]);

  // Compute stats
  useEffect(() => {
    if (applications.length > 0) {
      setStats({
        total: applications.length,
        new: applications.filter(a => a.status === 'applied').length,
        reviewed: applications.filter(a => a.status === 'reviewed').length,
        interview: applications.filter(a => a.status === 'interview').length,
        hired: applications.filter(a => a.status === 'hired').length,
        rejected: applications.filter(a => a.status === 'rejected').length,
      });
    }
  }, [applications]);

  // Filter and sort applications
  const filteredApplications = useMemo(() => {
    let filtered = [...applications];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(app =>
        app.candidate?.name?.toLowerCase().includes(term) ||
        app.candidate?.email?.toLowerCase().includes(term) ||
        app.job?.title?.toLowerCase().includes(term) ||
        app.candidate?.skills?.some(skill => skill.toLowerCase().includes(term))
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.appliedAt?.toDate?.() || b.appliedAt) - new Date(a.appliedAt?.toDate?.() || a.appliedAt);
        case 'oldest':
          return new Date(a.appliedAt?.toDate?.() || a.appliedAt) - new Date(b.appliedAt?.toDate?.() || b.appliedAt);
        case 'match':
          return (b.matchScore || 0) - (a.matchScore || 0);
        case 'name':
          return (a.candidate?.name || '').localeCompare(b.candidate?.name || '');
        default:
          return 0;
      }
    });

    return filtered;
  }, [applications, searchTerm, sortBy]);

  // Handlers
  const handleUpdateStatus = async (applicationId, newStatus) => {
    try {
      setUpdating(true);
      
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
      
      if (selectedApplication?.id === applicationId) {
        setSelectedApplication(prev => ({ ...prev, status: newStatus }));
      }
    } catch (error) {
      console.error('Error updating application status:', error);
      showNotification('error', 'Failed to update application status');
    } finally {
      setUpdating(false);
    }
  };

  const handleBulkUpdateStatus = async (newStatus) => {
    if (selectedApplications.length === 0) return;

    try {
      setUpdating(true);
      const batch = writeBatch(db);

      selectedApplications.forEach(appId => {
        batch.update(doc(db, 'applications', appId), {
          status: newStatus,
          [`${newStatus}At`]: serverTimestamp(),
          updatedAt: serverTimestamp(),
          updatedBy: companyId,
        });
      });

      await batch.commit();

      showNotification('success', `${selectedApplications.length} applications updated to ${newStatus}`);
      setSelectedApplications([]);
    } catch (error) {
      console.error('Error bulk updating applications:', error);
      showNotification('error', 'Failed to update applications');
    } finally {
      setUpdating(false);
    }
  };

  const handleSelectApplication = (appId) => {
    setSelectedApplications(prev =>
      prev.includes(appId)
        ? prev.filter(id => id !== appId)
        : [...prev, appId]
    );
  };

  const handleSelectAll = () => {
    if (selectedApplications.length === filteredApplications.length) {
      setSelectedApplications([]);
    } else {
      setSelectedApplications(filteredApplications.map(a => a.id));
    }
  };

  const handleViewApplication = (application) => {
    setSelectedApplication(application);
    setShowDetailModal(true);
  };

  const handleMessageCandidate = (application) => {
    navigate(`/company/chat?candidate=${application.candidateId || application.candidate?.id}`);
  };

  const handleDownloadResume = async (application) => {
    try {
      if (application.resumeUrl) {
        window.open(application.resumeUrl, '_blank');
      } else if (application.candidate?.resumeUrl) {
        window.open(application.candidate.resumeUrl, '_blank');
      } else {
        showNotification('warning', 'No resume available for this candidate');
      }
    } catch (error) {
      console.error('Error downloading resume:', error);
      showNotification('error', 'Failed to download resume');
    }
  };

  const handleShortlist = (application) => {
    handleUpdateStatus(application.id, 'shortlisted');
  };

  const handleReject = (application) => {
    handleUpdateStatus(application.id, 'rejected');
  };

  const handleBulkMessage = () => {
    navigate(`/company/chat?candidates=${selectedApplications.join(',')}`);
  };

  const handleBulkExport = async () => {
    try {
      const selectedData = applications.filter(a => selectedApplications.includes(a.id));
      
      // Create CSV content
      const headers = ['Name', 'Email', 'Phone', 'Job', 'Status', 'Match Score', 'Applied Date'];
      const rows = selectedData.map(app => [
        app.candidate?.name || '',
        app.candidate?.email || '',
        app.candidate?.phone || '',
        app.job?.title || '',
        app.status || '',
        app.matchScore || 0,
        formatDate(app.appliedAt),
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
      ].join('\n');

      // Download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `applications-export-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();

      showNotification('success', 'Applications exported successfully');
    } catch (error) {
      console.error('Error exporting applications:', error);
      showNotification('error', 'Failed to export applications');
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setSortBy('newest');
  };

  const hasFilters = searchTerm || statusFilter !== 'all';

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
              <FaFileAlt className="w-8 h-8 text-blue-600" />
              Applications
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Manage and review job applications from candidates
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/company/jobs')}
              className="px-4 py-2.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-medium border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
            >
              <FaBriefcase className="w-4 h-4" />
              View Jobs
            </button>
            <button
              onClick={handleBulkExport}
              disabled={selectedApplications.length === 0}
              className="px-4 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <FaFileExport className="w-4 h-4" />
              Export
            </button>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          {[
            { label: 'Total', value: stats.total, color: 'blue', icon: FaFileAlt, filter: 'all' },
            { label: 'New', value: stats.new, color: 'blue', icon: FaClock, filter: 'applied' },
            { label: 'Reviewed', value: stats.reviewed, color: 'indigo', icon: FaEye, filter: 'reviewed' },
            { label: 'Interview', value: stats.interview, color: 'purple', icon: FaCalendarAlt, filter: 'interview' },
            { label: 'Hired', value: stats.hired, color: 'green', icon: FaCheckCircle, filter: 'hired' },
            { label: 'Rejected', value: stats.rejected, color: 'red', icon: FaTimesCircle, filter: 'rejected' },
          ].map((stat, index) => (
            <motion.button
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => setStatusFilter(stat.filter)}
              className={`bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border transition-all text-left ${
                statusFilter === stat.filter 
                  ? 'border-blue-500 ring-1 ring-blue-500' 
                  : 'border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600'
              }`}
            >
              <div className={`p-2 rounded-lg inline-block mb-2 ${
                stat.color === 'blue' ? 'bg-blue-50 text-blue-600' :
                stat.color === 'indigo' ? 'bg-indigo-50 text-indigo-600' :
                stat.color === 'purple' ? 'bg-purple-50 text-purple-600' :
                stat.color === 'green' ? 'bg-green-50 text-green-600' :
                stat.color === 'red' ? 'bg-red-50 text-red-600' :
                'bg-gray-50 text-gray-600'
              }`}>
                <stat.icon className="w-4 h-4" />
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatNumber(stat.value)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</p>
            </motion.button>
          ))}
        </div>

        {/* Filters Bar */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 mb-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="relative flex-1 w-full">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, job, or skills..."
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

              {hasFilters && (
                <button
                  onClick={clearFilters}
                  className="px-4 py-2.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl font-medium transition-colors flex items-center gap-2"
                >
                  <FaTimes className="w-4 h-4" />
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Selection Info */}
          {selectedApplications.length > 0 && (
            <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
              <input
                type="checkbox"
                checked={selectedApplications.length === filteredApplications.length}
                onChange={handleSelectAll}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {selectedApplications.length} of {filteredApplications.length} selected
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
        ) : filteredApplications.length === 0 ? (
          <EmptyState onAction={clearFilters} hasFilters={hasFilters} />
        ) : (
          <>
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredApplications.map((application) => (
                  <ApplicationCard
                    key={application.id}
                    application={application}
                    onView={handleViewApplication}
                    onUpdateStatus={handleUpdateStatus}
                    onMessage={handleMessageCandidate}
                    onShortlist={handleShortlist}
                    onReject={handleReject}
                    isSelected={selectedApplications.includes(application.id)}
                    onSelect={handleSelectApplication}
                    viewMode="grid"
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredApplications.map((application) => (
                  <ApplicationCard
                    key={application.id}
                    application={application}
                    onView={handleViewApplication}
                    onUpdateStatus={handleUpdateStatus}
                    onMessage={handleMessageCandidate}
                    onShortlist={handleShortlist}
                    onReject={handleReject}
                    isSelected={selectedApplications.includes(application.id)}
                    onSelect={handleSelectApplication}
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
                    'Load More Applications'
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Bulk Action Bar */}
      <AnimatePresence>
        {selectedApplications.length > 0 && (
          <BulkActionBar
            selectedCount={selectedApplications.length}
            onClearSelection={() => setSelectedApplications([])}
            onBulkUpdateStatus={handleBulkUpdateStatus}
            onBulkMessage={handleBulkMessage}
            onBulkExport={handleBulkExport}
          />
        )}
      </AnimatePresence>

      {/* Detail Modal */}
      <ApplicationDetailModal
        application={selectedApplication}
        show={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedApplication(null);
        }}
        onUpdateStatus={handleUpdateStatus}
        onMessage={handleMessageCandidate}
        onDownloadResume={handleDownloadResume}
        loading={updating}
      />
    </div>
  );
};

export default CompanyApplications;
