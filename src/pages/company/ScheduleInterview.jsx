// src/pages/company/ScheduleInterview.jsx
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FaCalendarAlt, FaCalendarCheck, FaCalendarPlus, FaCalendarMinus, FaCalendarTimes, FaCalendarDay, FaCalendarWeek, FaClock, FaRegClock, FaVideo, FaPhone, FaMapMarkerAlt, FaUser, FaUsers, FaUserTie, FaBriefcase, FaCheck, FaCheckCircle, FaTimes, FaTimesCircle, FaEdit, FaTrash, FaFilter, FaSearch, FaSpinner, FaExclamationTriangle, FaSync, FaBell, FaBellSlash, FaLink, FaCopy, FaWhatsapp, FaEnvelope, FaPaperPlane, FaExternalLinkAlt, FaEllipsisV, FaChevronLeft, FaChevronRight, FaPlus, FaDownload, FaFileExport, FaFilePdf, FaChartLine, FaChartBar, FaPercentage, FaHourglass, FaHourglassHalf, FaStopwatch, FaHistory, FaUndo, FaRedo, FaReply, FaComment, FaCommentDots, FaRegCommentDots, FaCalendarCheck as FaCalendarCheckSolid, FaRegCalendarAlt, FaRegCalendarCheck, FaRegCalendarTimes, FaRegCalendarPlus, FaRegCalendarMinus, FaGlobe, FaWifi, FaInfoCircle, FaQuestionCircle, FaStar, FaRegStar, FaThumbsUp, FaThumbsDown, FaMeh, FaSmile, FaFrown, FaBolt, FaRocket, FaFlag, FaBookmark, FaRegBookmark, FaShare, FaShareAlt, FaEye, FaEyeSlash, FaCog, FaCogs, FaSlidersH, FaToggleOn, FaToggleOff, FaPlay, FaPause, FaStop, FaCircle, FaDotCircle, FaDotCircle as FaDotCircleSolid, FaRegDotCircle, FaRegCircle, FaMinus, FaRobot, FaBrain, FaMagic, FaLightbulb, FaClipboard, FaClipboardCheck, FaClipboardList, FaTasks, FaProjectDiagram, FaSitemap, FaNetworkWired, FaServer, FaDatabase, FaCloud, FaCloudUploadAlt, FaCloudDownloadAlt, FaBolt as FaBoltSolid, FaFire, FaSnowflake, FaSun, FaMoon, FaRegSmile, FaRegLaugh, FaRegHeart, FaHeart, FaRegThumbsUp, FaRegThumbsDown, FaRegFrown, FaRegMeh, FaAward, FaTrophy, FaMedal, FaCrown, FaGem, FaHandshake, FaHandsHelping, FaUserCheck, FaUserTimes, FaUserPlus, FaUserMinus, FaUserFriends, FaUsersCog, FaUserCog, FaUserEdit, FaUserCircle, FaRegUser, FaRegUserCircle, FaBuilding, FaBuilding as FaBuildingSolid, FaRegBuilding, FaMap, FaMapMarked, FaMapMarkedAlt, FaMapPin, FaDirections, FaRoute, FaCompass, FaCrosshairs, FaLocationArrow, FaPaperclip, FaFile, FaFileAlt, FaRegFileAlt, FaFilePdf as FaFilePdfSolid, FaFileWord, FaFileExcel, FaFilePowerpoint, FaFileImage, FaFileVideo, FaFileAudio, FaFileArchive, FaFileCode, FaFolder, FaFolderOpen, FaRegFolder, FaRegFolderOpen, FaHdd, FaMemory, FaMicrochip, FaNetworkWired as FaNetworkWiredSolid, FaPlug, FaChargingStation, FaBatteryFull, FaBatteryHalf, FaBatteryEmpty, FaBroadcastTower, FaSatelliteDish, FaRss, FaPodcast, FaMicrophone, FaMicrophoneAlt, FaHeadphones, FaVolumeUp, FaVolumeMute, FaVolumeDown, FaMusic, FaFilm, FaCamera, FaCameraRetro, FaPhotoVideo, FaImages, FaImage, FaRegImage, FaDesktop, FaLaptop, FaTabletAlt, FaMobileAlt, FaPrint, FaFax, FaVoicemail, FaInbox, FaPaperPlane as FaPaperPlaneSolid, FaSms, FaAt, FaHashtag, FaPercentage as FaPercentageSolid, FaDollarSign, FaReceipt, FaFileInvoice, FaFileInvoiceDollar, FaCalculator, FaBalanceScale, FaCreditCard, FaMoneyBill, FaMoneyBillWave, FaMoneyCheck, FaUniversity, FaLandmark, FaPiggyBank, FaCoins, FaWallet, FaDonate, FaHandHoldingUsd, FaHandHoldingHeart, FaHeart as FaHeartSolid, FaHeartbeat, FaStethoscope, FaUserMd, FaUserNurse, FaAmbulance, FaHospital, FaClinicMedical, FaFirstAid, FaMedkit, FaPills, FaCapsules, FaTablets, FaSyringe, FaVial, FaVials, FaFlask, FaMicroscope, FaDna, FaAtom, FaViruses, FaBacteria, FaVirus, FaVirusSlash, FaShieldVirus, FaBiohazard, FaRadiation, FaSkull, FaBone, FaTooth, FaTeeth, FaTeethOpen, FaEye as FaEyeSolid, FaEyeSlash as FaEyeSlashSolid, FaAssistiveListeningSystems as FaEarListen, FaDeaf, FaSignLanguage, FaBlind, FaLowVision, FaWheelchair, FaCrutch, FaProcedures, FaWalking, FaRunning, FaBiking, FaHiking, FaSkiing, FaSnowboarding, FaSkating, FaSwimmer, FaSwimmingPool, FaDumbbell, FaBasketballBall, FaFootballBall, FaBaseballBall, FaVolleyballBall, FaGolfBall, FaTableTennis, FaBowlingBall, FaChess, FaChessBoard, FaDice, FaGamepad, FaPuzzlePiece, FaGhost, FaDragon, FaHatWizard, FaBroom, FaHatCowboy, FaGlasses, FaTshirt, FaShoePrints, FaSocks, FaMitten, FaCoffee, FaMugHot, FaUtensils, FaUtensilSpoon, FaHamburger, FaPizzaSlice, FaHotdog, FaIceCream, FaBirthdayCake, FaCookie, FaCookieBite, FaCandyCane, FaCarrot, FaLemon, FaPepperHot, FaDrumstickBite, FaBacon, FaEgg, FaCheese, FaBreadSlice, FaAppleAlt, FaSeedling, FaLeaf, FaTree, FaSpa, FaHotTub, FaUmbrellaBeach, FaPlane, FaPlaneDeparture, FaPlaneArrival, FaHelicopter, FaParachuteBox, FaRocket as FaRocketSolid, FaSpaceShuttle, FaSatellite, FaMeteor, FaUserAstronaut, FaGlobeAmericas, FaGlobeEurope, FaGlobeAsia, FaGlobeAfrica, FaMoon as FaMoonSolid, FaSun as FaSunSolid, FaCloudSun, FaCloudMoon, FaCloudRain, FaCloudShowersHeavy, FaCloudMeatball, FaCloudMoonRain, FaCloudSunRain, FaPooStorm, FaWind, FaUmbrella, FaWater, FaTint, FaTintSlash, FaEyeDropper, FaFill, FaFillDrip, FaFaucet, FaSink, FaToilet, FaToiletPaper, FaShower, FaBath, FaHotTub as FaHotTubSolid, FaSpa as FaSpaSolid, FaBroom as FaBroomSolid, FaSprayCan, FaPaintBrush, FaPaintRoller, FaPalette, FaRuler, FaRulerCombined, FaRulerHorizontal, FaRulerVertical, FaDraftingCompass, FaVectorSquare, FaBezierCurve, FaDrawPolygon, FaShapes, FaCube, FaCubes, FaLayerGroup, FaObjectGroup, FaObjectUngroup, FaAlignLeft, FaAlignRight, FaAlignCenter, FaAlignJustify, FaIndent, FaOutdent, FaListUl, FaListOl, FaListAlt, FaStream, FaBars, FaEllipsisH, FaEllipsisV as FaEllipsisVSolid, FaGripHorizontal, FaGripVertical, FaGripLines, FaGripLinesVertical, FaTh, FaThList, FaThLarge, FaBorderAll, FaBorderNone, FaBorderStyle, FaColumns, FaRssSquare, FaTable, FaTablet, FaTachometerAlt, FaThermometer, FaThermometerEmpty, FaThermometerFull, FaThermometerHalf, FaThermometerQuarter, FaThermometerThreeQuarters, FaTicketAlt, FaTags, FaTag, FaAsterisk, FaPlusCircle, FaMinusCircle, FaExclamationCircle, FaBan, FaSmoking, FaSmokingBan, FaWineGlass, FaWineGlassAlt, FaBeer, FaCocktail, FaGlassCheers, FaGlassWhiskey, FaGlassMartini, FaGlassMartiniAlt, FaGift, FaBell as FaBellSolid, FaRegBell, FaBellSlash as FaBellSlashSolid, FaRegBellSlash, FaEnvelopeOpen, FaEnvelopeOpenText, FaRegEnvelopeOpen, FaRegEnvelope, FaMailBulk, FaPaperPlane as FaPaperPlaneAlt, FaShareAlt as FaShareAltSolid, FaShareSquare, FaRegShareSquare, FaRetweet, FaReplyAll, FaForward, FaTrashAlt, FaRegTrashAlt, FaRegEdit, FaPen, FaPencilAlt, FaMarker, FaHighlighter, FaEraser, FaRegCopy, FaPaste, FaCut, FaSave, FaRegSave, FaUpload, FaDownload as FaDownloadSolid, FaSyncAlt, FaRedoAlt, FaUndoAlt, FaSort, FaSortUp, FaSortDown, FaSortAmountUp, FaSortAmountDown, FaSortAmountUpAlt, FaSortAmountDownAlt, FaSortNumericUp, FaSortNumericDown, FaSortAlphaUp, FaSortAlphaDown, FaRandom, FaExpand, FaExpandArrowsAlt, FaCompress, FaCompressArrowsAlt, FaSearchPlus, FaSearchMinus, FaSlidersH as FaSlidersHSolid, FaTools, FaWrench, FaHammer, FaScrewdriver, FaLevelUpAlt, FaLevelDownAlt, FaArrowsAlt, FaArrowsAltH, FaArrowsAltV, FaLongArrowAltDown, FaLongArrowAltLeft, FaLongArrowAltRight, FaLongArrowAltUp, FaArrowAltCircleDown, FaArrowAltCircleLeft, FaArrowAltCircleRight, FaArrowAltCircleUp, FaArrowCircleDown, FaArrowCircleLeft, FaArrowCircleRight, FaArrowCircleUp, FaArrowDown, FaArrowLeft, FaArrowRight, FaArrowUp, FaCaretDown, FaCaretLeft, FaCaretRight, FaCaretSquareDown, FaCaretSquareLeft, FaCaretSquareRight, FaCaretSquareUp, FaCaretUp, FaChevronCircleDown, FaChevronCircleLeft, FaChevronCircleRight, FaChevronCircleUp, FaChevronDown, FaChevronLeft as FaChevronLeftSolid, FaChevronRight as FaChevronRightSolid, FaChevronUp, FaExchangeAlt, FaSignInAlt, FaSignOutAlt, FaSign, FaSignLanguage as FaSignLanguageSolid, FaTextHeight, FaTextWidth, FaFont, FaBold, FaItalic, FaUnderline, FaStrikethrough, FaSubscript, FaSuperscript, FaParagraph, FaQuoteLeft, FaQuoteRight, FaHeading, FaHeading as FaHeadingSolid, FaLanguage, FaSpellCheck, FaSpellCheck as FaSpellCheckSolid, FaBook, FaBookOpen, FaBookReader, FaBookmark as FaBookmarkSolid, FaBookmark as FaBookmarkAlt, FaNewspaper, FaScroll, FaPaste as FaPasteSolid, FaSpellCheck as FaSpellCheckAlt, FaAddressBook, FaAddressCard, FaIdCard, FaIdBadge, FaPassport, FaFingerprint, FaKey, FaUnlock, FaUnlockAlt, FaLock, FaLockOpen, FaShieldAlt, FaShieldAlt as FaShieldAltSolid, FaUserLock, FaUserShield, FaUserSecret, FaUserNinja, FaUserAstronaut as FaUserAstronautSolid, FaUserSecret as FaUserRobot, FaUserSecret as FaUserAlien, FaUserTie as FaUserCowboy, FaCrown as FaUserCrown, FaUserTie as FaUserEmperor, FaUserTie as FaUserEmpress, FaUserTie as FaUserKing, FaUserTie as FaUserQueen, FaUserTie as FaUserPrince, FaUserTie as FaUserPrincess, FaHatWizard as FaUserWizard, FaUserSecret as FaUserWitch, FaUserNinja as FaUserPirate, FaUserNinja as FaUserSamurai, FaUserGraduate, FaUserTie as FaUserTieSolid } from "react-icons/fa";
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
} from 'firebase/firestore';

import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { db } from '../../config/firebase';
import { supabase } from '../../config/supabase';

// ============================================
// CONSTANTS
// ============================================

const INTERVIEW_TYPES = [
  { value: 'video', label: 'Video Call', icon: FaVideo, color: 'blue' },
  { value: 'phone', label: 'Phone Call', icon: FaPhone, color: 'green' },
  { value: 'in-person', label: 'In-Person', icon: FaMapMarkerAlt, color: 'purple' },
];

const INTERVIEW_STATUSES = [
  { value: 'all', label: 'All Interviews', color: 'gray' },
  { value: 'scheduled', label: 'Scheduled', color: 'blue' },
  { value: 'in-progress', label: 'In Progress', color: 'yellow' },
  { value: 'completed', label: 'Completed', color: 'green' },
  { value: 'cancelled', label: 'Cancelled', color: 'red' },
  { value: 'no-show', label: 'No Show', color: 'gray' },
  { value: 'rescheduled', label: 'Rescheduled', color: 'orange' },
];

const DURATIONS = [15, 30, 45, 60, 90, 120];

const TIME_SLOTS = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
];

// ============================================
// UTILITY FUNCTIONS
// ============================================

const formatDateTime = (date) => {
  if (!date) return 'Not scheduled';
  const d = date instanceof Date ? date : date?.toDate?.() || new Date(date);
  if (isNaN(d.getTime())) return 'Invalid date';
  return d.toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
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
  if (diffDays < 7) return `${diffDays}d ago`;
  return past.toLocaleDateString();
};

const getTimeUntil = (date) => {
  if (!date) return '';
  const now = new Date();
  const target = date instanceof Date ? date : date?.toDate?.() || new Date(date);
  if (isNaN(target.getTime())) return '';

  const diffMs = target - now;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMs < 0) return 'Past';
  if (diffMins < 60) return `In ${diffMins} min`;
  if (diffHours < 24) return `In ${diffHours} hours`;
  if (diffDays < 7) return `In ${diffDays} days`;
  return `In ${Math.floor(diffDays / 7)} weeks`;
};

const getStatusConfig = (status) => {
  const configs = {
    scheduled: { 
      bg: 'bg-blue-100 dark:bg-blue-900/30', 
      text: 'text-blue-700 dark:text-blue-300', 
      icon: FaCalendarCheck, 
      label: 'Scheduled',
      dot: 'bg-blue-500'
    },
    'in-progress': { 
      bg: 'bg-yellow-100 dark:bg-yellow-900/30', 
      text: 'text-yellow-700 dark:text-yellow-300', 
      icon: FaHourglassHalf, 
      label: 'In Progress',
      dot: 'bg-yellow-500'
    },
    completed: { 
      bg: 'bg-green-100 dark:bg-green-900/30', 
      text: 'text-green-700 dark:text-green-300', 
      icon: FaCheckCircle, 
      label: 'Completed',
      dot: 'bg-green-500'
    },
    cancelled: { 
      bg: 'bg-red-100 dark:bg-red-900/30', 
      text: 'text-red-700 dark:text-red-300', 
      icon: FaTimesCircle, 
      label: 'Cancelled',
      dot: 'bg-red-500'
    },
    'no-show': { 
      bg: 'bg-gray-100 dark:bg-gray-700', 
      text: 'text-gray-700 dark:text-gray-300', 
      icon: FaUserTimes, 
      label: 'No Show',
      dot: 'bg-gray-500'
    },
    rescheduled: { 
      bg: 'bg-orange-100 dark:bg-orange-900/30', 
      text: 'text-orange-700 dark:text-orange-300', 
      icon: FaSync, 
      label: 'Rescheduled',
      dot: 'bg-orange-500'
    },
  };
  return configs[status] || configs.scheduled;
};

const getTypeConfig = (type) => {
  const configs = {
    video: { bg: 'bg-blue-500', text: 'text-white', label: 'Video Call', icon: FaVideo },
    phone: { bg: 'bg-green-500', text: 'text-white', label: 'Phone Call', icon: FaPhone },
    'in-person': { bg: 'bg-purple-500', text: 'text-white', label: 'In-Person', icon: FaMapMarkerAlt },
  };
  return configs[type] || configs.video;
};

// ============================================
// CUSTOM HOOKS
// ============================================

const useInterviews = (companyId, filters = {}) => {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!companyId) {
      setLoading(false);
      return;
    }

    let q = query(
      collection(db, 'interviews'),
      where('companyId', '==', companyId),
      orderBy('scheduledAt', 'desc'),
      limit(100)
    );

    if (filters.status && filters.status !== 'all') {
      q = query(
        collection(db, 'interviews'),
        where('companyId', '==', companyId),
        where('status', '==', filters.status),
        orderBy('scheduledAt', 'desc'),
        limit(100)
      );
    }

    const unsubscribe = onSnapshot(
      q,
      async (snapshot) => {
        const interviewsData = await Promise.all(
          snapshot.docs.map(async (docSnapshot) => {
            const data = docSnapshot.data();
            
            // Fetch application details
            let application = null;
            if (data.applicationId) {
              try {
                const appDoc = await getDoc(doc(db, 'applications', data.applicationId));
                if (appDoc.exists()) {
                  const appData = appDoc.data();
                  
                  // Fetch candidate
                  let candidate = null;
                  if (appData.candidateId) {
                    const candidateDoc = await getDoc(doc(db, 'users', appData.candidateId));
                    if (candidateDoc.exists()) {
                      candidate = { id: candidateDoc.id, ...candidateDoc.data() };
                    }
                  }
                  
                  // Fetch job
                  let job = null;
                  if (appData.jobId) {
                    const jobDoc = await getDoc(doc(db, 'jobs', appData.jobId));
                    if (jobDoc.exists()) {
                      job = { id: jobDoc.id, ...jobDoc.data() };
                    }
                  }
                  
                  application = { id: appDoc.id, ...appData, candidate, job };
                }
              } catch (err) {
                console.error('Error fetching application:', err);
              }
            }

            return {
              id: docSnapshot.id,
              ...data,
              application,
              scheduledAt: data.scheduledAt?.toDate?.() || data.scheduledAt,
              createdAt: data.createdAt?.toDate?.() || data.createdAt,
              updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
            };
          })
        );

        setInterviews(interviewsData);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching interviews:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [companyId, filters.status]);

  return { interviews, loading, error };
};

const useAvailableApplications = (companyId) => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!companyId) return;

    const q = query(
      collection(db, 'applications'),
      where('companyId', '==', companyId),
      where('status', 'in', ['reviewed', 'shortlisted', 'interview']),
      orderBy('updatedAt', 'desc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const appsData = await Promise.all(
        snapshot.docs.map(async (docSnapshot) => {
          const data = docSnapshot.data();
          
          let candidate = null;
          if (data.candidateId) {
            const candidateDoc = await getDoc(doc(db, 'users', data.candidateId));
            if (candidateDoc.exists()) {
              candidate = { id: candidateDoc.id, ...candidateDoc.data() };
            }
          }
          
          let job = null;
          if (data.jobId) {
            const jobDoc = await getDoc(doc(db, 'jobs', data.jobId));
            if (jobDoc.exists()) {
              job = { id: jobDoc.id, ...jobDoc.data() };
            }
          }

          return {
            id: docSnapshot.id,
            ...data,
            candidate,
            job,
          };
        })
      );
      
      setApplications(appsData.filter(a => a.candidate));
      setLoading(false);
    });

    return () => unsubscribe();
  }, [companyId]);

  return { applications, loading };
};

// ============================================
// COMPONENTS
// ============================================

const LoadingSkeleton = () => (
  <div className="space-y-4">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-6 animate-pulse">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
          <div className="flex-1">
            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          </div>
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
      <FaCalendarAlt className="w-12 h-12 text-gray-400" />
    </div>
    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
      {hasFilters ? 'No interviews match your filters' : 'No interviews scheduled'}
    </h3>
    <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
      {hasFilters 
        ? 'Try adjusting your search or filter criteria.'
        : 'Schedule your first interview to get started.'
      }
    </p>
    <button
      onClick={onAction}
      className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
    >
      <FaCalendarPlus className="w-4 h-4" />
      Schedule Interview
    </button>
  </motion.div>
);

const InterviewCard = ({ 
  interview, 
  onJoin, 
  onEdit, 
  onCancel, 
  onMarkComplete,
  onReschedule,
  onCopyLink,
  onSendReminder 
}) => {
  const statusConfig = getStatusConfig(interview.status);
  const typeConfig = getTypeConfig(interview.interviewType);
  const StatusIcon = statusConfig.icon;
  const TypeIcon = typeConfig.icon;
  const [showMenu, setShowMenu] = useState(false);

  const candidate = interview.application?.candidate;
  const job = interview.application?.job;
  const isUpcoming = interview.status === 'scheduled' && new Date(interview.scheduledAt) > new Date();
  const isSoon = isUpcoming && new Date(interview.scheduledAt) - new Date() < 30 * 60 * 1000;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white dark:bg-gray-800 rounded-xl p-5 border transition-all hover:shadow-md ${
        isSoon ? 'border-yellow-400 ring-1 ring-yellow-400' : 'border-gray-100 dark:border-gray-700'
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        {/* Left Section */}
        <div className="flex items-start gap-4 flex-1">
          {/* Type Icon */}
          <div className={`p-3 rounded-xl ${typeConfig.bg} ${typeConfig.text}`}>
            <TypeIcon className="w-5 h-5" />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h4 className="font-semibold text-gray-900 dark:text-white">
                {candidate?.name || candidate?.displayName || 'Unknown Candidate'}
              </h4>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.text}`}>
                <StatusIcon className="w-3 h-3" />
                {statusConfig.label}
              </span>
              {isSoon && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 animate-pulse">
                  <FaBell className="w-3 h-3" />
                  Starting Soon
                </span>
              )}
            </div>

            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
              {job?.title || 'Position'} • {typeConfig.label}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1">
                <FaCalendarAlt className="w-3 h-3" />
                {formatDateTime(interview.scheduledAt)}
              </span>
              <span className="flex items-center gap-1">
                <FaClock className="w-3 h-3" />
                {interview.duration || 30} min
              </span>
              {isUpcoming && (
                <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-medium">
                  <FaHourglass className="w-3 h-3" />
                  {getTimeUntil(interview.scheduledAt)}
                </span>
              )}
            </div>

            {interview.interviewerName && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                <FaUser className="w-3 h-3 inline mr-1" />
                Interviewer: {interview.interviewerName}
              </p>
            )}

            {/* Meeting link for video interviews */}
            {interview.interviewType === 'video' && interview.meetingLink && isUpcoming && (
              <div className="flex items-center gap-2 mt-3">
                <button
                  onClick={() => onJoin(interview)}
                  className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-1"
                >
                  <FaVideo className="w-3 h-3" />
                  Join Meeting
                </button>
                <button
                  onClick={() => onCopyLink(interview.meetingLink)}
                  className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center gap-1"
                >
                  <FaCopy className="w-3 h-3" />
                  Copy Link
                </button>
              </div>
            )}

            {/* Location for in-person */}
            {interview.interviewType === 'in-person' && interview.location && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 flex items-center gap-1">
                <FaMapMarkerAlt className="w-3 h-3" />
                {interview.location}
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 relative">
          {isUpcoming && (
            <button
              onClick={() => onSendReminder(interview)}
              className="p-2 text-gray-400 hover:text-yellow-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="Send Reminder"
            >
              <FaBell className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <FaEllipsisV className="w-4 h-4" />
          </button>

          <AnimatePresence>
            {showMenu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 py-2 z-10"
              >
                <button
                  onClick={() => { onEdit(interview); setShowMenu(false); }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                >
                  <FaEdit className="w-4 h-4" />
                  Edit Interview
                </button>
                {isUpcoming && (
                  <button
                    onClick={() => { onReschedule(interview); setShowMenu(false); }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                  >
                    <FaSync className="w-4 h-4" />
                    Reschedule
                  </button>
                )}
                {interview.status === 'scheduled' && (
                  <button
                    onClick={() => { onMarkComplete(interview); setShowMenu(false); }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                  >
                    <FaCheckCircle className="w-4 h-4" />
                    Mark Complete
                  </button>
                )}
                {interview.status === 'scheduled' && (
                  <button
                    onClick={() => { onCancel(interview); setShowMenu(false); }}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                  >
                    <FaTimesCircle className="w-4 h-4" />
                    Cancel Interview
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

const ScheduleModal = ({ 
  show, 
  onClose, 
  onSubmit, 
  applications = [],
  interview = null,
  loading = false,
  preselectedApplicationId = null
}) => {
  const [formData, setFormData] = useState({
    applicationId: '',
    interviewType: 'video',
    scheduledDate: '',
    scheduledTime: '10:00',
    duration: 30,
    interviewerName: '',
    interviewerEmail: '',
    meetingLink: '',
    location: '',
    notes: '',
    sendNotification: true,
    sendReminder: true,
  });
  const [errors, setErrors] = useState({});
  const [selectedApplication, setSelectedApplication] = useState(null);

  useEffect(() => {
    if (interview) {
      const scheduledAt = interview.scheduledAt instanceof Date 
        ? interview.scheduledAt 
        : interview.scheduledAt?.toDate?.() || new Date(interview.scheduledAt);
      
      setFormData({
        applicationId: interview.applicationId || '',
        interviewType: interview.interviewType || 'video',
        scheduledDate: scheduledAt.toISOString().split('T')[0],
        scheduledTime: scheduledAt.toTimeString().slice(0, 5),
        duration: interview.duration || 30,
        interviewerName: interview.interviewerName || '',
        interviewerEmail: interview.interviewerEmail || '',
        meetingLink: interview.meetingLink || '',
        location: interview.location || '',
        notes: interview.notes || '',
        sendNotification: false,
        sendReminder: true,
      });
    } else if (preselectedApplicationId) {
      setFormData(prev => ({
        ...prev,
        applicationId: preselectedApplicationId,
      }));
    }
  }, [interview, preselectedApplicationId]);

  useEffect(() => {
    if (formData.applicationId) {
      const app = applications.find(a => a.id === formData.applicationId);
      setSelectedApplication(app);
    }
  }, [formData.applicationId, applications]);

  const validate = () => {
    const newErrors = {};

    if (!formData.applicationId) {
      newErrors.applicationId = 'Please select an application';
    }
    if (!formData.scheduledDate) {
      newErrors.scheduledDate = 'Please select a date';
    } else {
      const scheduled = new Date(`${formData.scheduledDate}T${formData.scheduledTime}`);
      if (scheduled < new Date()) {
        newErrors.scheduledDate = 'Date must be in the future';
      }
    }
    if (!formData.duration || formData.duration < 15) {
      newErrors.duration = 'Duration must be at least 15 minutes';
    }
    if (formData.interviewType === 'video' && !formData.meetingLink) {
      newErrors.meetingLink = 'Paste a Google Meet link for video interviews.';
    } else if (formData.interviewType === 'video') {
      try {
        const meetingUrl = new URL(formData.meetingLink);
        if (meetingUrl.protocol !== 'https:' || meetingUrl.hostname !== 'meet.google.com' || !/^\/[a-z]{3}-[a-z]{4}-[a-z]{3}\/?$/i.test(meetingUrl.pathname)) {
          newErrors.meetingLink = 'Use a valid link from meet.google.com.';
        }
      } catch {
        newErrors.meetingLink = 'Enter a valid Google Meet URL.';
      }
    }
    if (formData.interviewType === 'in-person' && !formData.location) {
      newErrors.location = 'Location is required for in-person interviews';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      const scheduledAt = new Date(`${formData.scheduledDate}T${formData.scheduledTime}`);
      onSubmit({
        ...formData,
        scheduledAt,
      });
    }
  };

  const handleTypeChange = (type) => {
    setFormData(prev => ({
      ...prev,
      interviewType: type,
      meetingLink: type === 'video' ? prev.meetingLink : '',
    }));
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
              {interview ? 'Edit Interview' : 'Schedule Interview'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <FaTimes className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
            {/* Application Selection */}
            {!interview && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Select Application *
                </label>
                <select
                  value={formData.applicationId}
                  onChange={(e) => setFormData({ ...formData, applicationId: e.target.value })}
                  className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.applicationId ? 'border-red-500' : 'border-gray-200 dark:border-gray-600'
                  }`}
                >
                  <option value="">Choose a candidate...</option>
                  {applications.map((app) => (
                    <option key={app.id} value={app.id}>
                      {app.candidate?.name || app.candidate?.displayName} - {app.job?.title}
                    </option>
                  ))}
                </select>
                {errors.applicationId && (
                  <p className="mt-1 text-sm text-red-500">{errors.applicationId}</p>
                )}
              </div>
            )}

            {/* Selected Candidate Preview */}
            {selectedApplication && (
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center gap-3">
                {selectedApplication.candidate?.avatar ? (
                  <img
                    src={selectedApplication.candidate.avatar}
                    alt={selectedApplication.candidate.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                    {selectedApplication.candidate?.name?.charAt(0) || 'C'}
                  </div>
                )}
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {selectedApplication.candidate?.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {selectedApplication.job?.title}
                  </p>
                </div>
              </div>
            )}

            {/* Interview Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Interview Type *
              </label>
              <div className="grid grid-cols-3 gap-3">
                {INTERVIEW_TYPES.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => handleTypeChange(type.value)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                      formData.interviewType === type.value
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <type.icon className={`w-6 h-6 ${
                      formData.interviewType === type.value ? 'text-blue-600' : 'text-gray-400'
                    }`} />
                    <span className={`text-sm font-medium ${
                      formData.interviewType === type.value ? 'text-blue-600' : 'text-gray-600 dark:text-gray-400'
                    }`}>
                      {type.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Date *
                </label>
                <input
                  type="date"
                  value={formData.scheduledDate}
                  onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.scheduledDate ? 'border-red-500' : 'border-gray-200 dark:border-gray-600'
                  }`}
                />
                {errors.scheduledDate && (
                  <p className="mt-1 text-sm text-red-500">{errors.scheduledDate}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Time *
                </label>
                <select
                  value={formData.scheduledTime}
                  onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {TIME_SLOTS.map(slot => (
                    <option key={slot} value={slot}>{slot}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Duration *
                </label>
                <select
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {DURATIONS.map(duration => (
                    <option key={duration} value={duration}>{duration} minutes</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Meeting Link / Location */}
            {formData.interviewType === 'video' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Meeting Link *
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={formData.meetingLink}
                    onChange={(e) => setFormData({ ...formData, meetingLink: e.target.value })}
                    placeholder="https://meet.google.com/abc-defg-hij"
                    className={`flex-1 px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.meetingLink ? 'border-red-500' : 'border-gray-200 dark:border-gray-600'
                    }`}
                  />
                </div>
                <a className="mt-2 inline-flex text-sm font-medium text-blue-600 hover:underline dark:text-blue-400" href="https://meet.google.com/new" target="_blank" rel="noreferrer">Create a Google Meet link</a>
                {errors.meetingLink && (
                  <p className="mt-1 text-sm text-red-500">{errors.meetingLink}</p>
                )}
              </div>
            )}

            {formData.interviewType === 'in-person' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Location *
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Office address, building, room number..."
                  className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.location ? 'border-red-500' : 'border-gray-200 dark:border-gray-600'
                  }`}
                />
                {errors.location && (
                  <p className="mt-1 text-sm text-red-500">{errors.location}</p>
                )}
              </div>
            )}

            {/* Interviewer */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Interviewer Name
                </label>
                <input
                  type="text"
                  value={formData.interviewerName}
                  onChange={(e) => setFormData({ ...formData, interviewerName: e.target.value })}
                  placeholder="e.g., John Smith"
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Interviewer Email
                </label>
                <input
                  type="email"
                  value={formData.interviewerEmail}
                  onChange={(e) => setFormData({ ...formData, interviewerEmail: e.target.value })}
                  placeholder="interviewer@company.com"
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                placeholder="Preparation materials, topics to cover, etc."
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            {/* Options */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.sendNotification}
                  onChange={(e) => setFormData({ ...formData, sendNotification: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Send notification to candidate
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.sendReminder}
                  onChange={(e) => setFormData({ ...formData, sendReminder: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Send reminder 1 hour before interview
                </span>
              </label>
            </div>
          </form>

          <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-100 dark:border-gray-700">
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <FaSpinner className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <FaCalendarCheck className="w-4 h-4" />
                  {interview ? 'Update Interview' : 'Schedule Interview'}
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

const ScheduleInterview = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { currentUser, userProfile } = useAuth();
  const { showNotification } = useNotification();

  const companyId = currentUser?.uid;
  const preselectedAppId = searchParams.get('application');

  const [statusFilter, setStatusFilter] = useState('all');
  const { interviews, loading, error } = useInterviews(companyId, { status: statusFilter });
  const { applications } = useAvailableApplications(companyId);

  // Local state
  const [searchTerm, setSearchTerm] = useState('');
  const [showScheduleModal, setShowScheduleModal] = useState(!!preselectedAppId);
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [interviewToCancel, setInterviewToCancel] = useState(null);

  // Stats
  const stats = useMemo(() => ({
    total: interviews.length,
    scheduled: interviews.filter(i => i.status === 'scheduled').length,
    completed: interviews.filter(i => i.status === 'completed').length,
    cancelled: interviews.filter(i => i.status === 'cancelled').length,
    today: interviews.filter(i => {
      const scheduled = i.scheduledAt instanceof Date ? i.scheduledAt : i.scheduledAt?.toDate?.();
      if (!scheduled) return false;
      const today = new Date();
      return scheduled.toDateString() === today.toDateString();
    }).length,
  }), [interviews]);

  // Filtered interviews
  const filteredInterviews = useMemo(() => {
    let filtered = [...interviews];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(interview => {
        const candidateName = (interview.application?.candidate?.name || '').toLowerCase();
        const jobTitle = (interview.application?.job?.title || '').toLowerCase();
        const interviewer = (interview.interviewerName || '').toLowerCase();
        
        return candidateName.includes(term) || jobTitle.includes(term) || interviewer.includes(term);
      });
    }

    // Sort by date - upcoming first
    filtered.sort((a, b) => {
      const aDate = a.scheduledAt instanceof Date ? a.scheduledAt : a.scheduledAt?.toDate?.() || new Date(0);
      const bDate = b.scheduledAt instanceof Date ? b.scheduledAt : b.scheduledAt?.toDate?.() || new Date(0);
      
      // Upcoming interviews first
      const now = new Date();
      const aUpcoming = aDate > now && a.status === 'scheduled';
      const bUpcoming = bDate > now && b.status === 'scheduled';
      
      if (aUpcoming && !bUpcoming) return -1;
      if (!aUpcoming && bUpcoming) return 1;
      
      // Then sort by date
      if (aUpcoming && bUpcoming) {
        return aDate - bDate; // Ascending for upcoming
      }
      return bDate - aDate; // Descending for past
    });

    return filtered;
  }, [interviews, searchTerm]);

  // ============================================
  // HANDLERS
  // ============================================

  const handleScheduleInterview = async (formData) => {
    if (!companyId) return;

    try {
      setSaving(true);

      const interviewData = {
        companyId,
        companyName: userProfile?.companyName || userProfile?.displayName || 'Company',
        applicationId: formData.applicationId,
        interviewType: formData.interviewType,
        scheduledAt: Timestamp.fromDate(formData.scheduledAt),
        duration: formData.duration,
        interviewerName: formData.interviewerName,
        interviewerEmail: formData.interviewerEmail,
        meetingLink: formData.interviewType === 'video' ? formData.meetingLink : null,
        location: formData.interviewType === 'in-person' ? formData.location : null,
        notes: formData.notes,
        status: 'scheduled',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        createdBy: companyId,
      };

      let interviewId;

      if (selectedInterview) {
        // Update existing interview
        await updateDoc(doc(db, 'interviews', selectedInterview.id), {
          ...interviewData,
          updatedAt: serverTimestamp(),
        });
        interviewId = selectedInterview.id;
      } else {
        // Create new interview
        const docRef = await addDoc(collection(db, 'interviews'), interviewData);
        interviewId = docRef.id;

        // Update application status
        await updateDoc(doc(db, 'applications', formData.applicationId), {
          status: 'interview',
          interviewAt: Timestamp.fromDate(formData.scheduledAt),
          interviewId: docRef.id,
          updatedAt: serverTimestamp(),
        });
      }

      // Sync to Supabase
      await supabase
        .from('interviews')
        .upsert({
          id: interviewId,
          company_id: companyId,
          application_id: formData.applicationId,
          interview_type: formData.interviewType,
          scheduled_at: formData.scheduledAt.toISOString(),
          duration: formData.duration,
          status: 'scheduled',
          interviewer_name: formData.interviewerName,
          meeting_link: formData.meetingLink,
          location: formData.location,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'id' });

      // Get application to find candidate
      const appDoc = await getDoc(doc(db, 'applications', formData.applicationId));
      if (appDoc.exists()) {
        const appData = appDoc.data();
        
        if (formData.sendNotification && appData.candidateId) {
          // Create notification for candidate
          await addDoc(collection(db, 'notifications'), {
            userId: appData.candidateId,
            type: 'interview_scheduled',
            title: 'Interview Scheduled',
            message: `Your interview for ${appData.job?.title || 'a position'} has been scheduled`,
            interviewId,
            companyId,
            read: false,
            createdAt: serverTimestamp(),
          });
        }
      }

      // Log activity
      await addDoc(collection(db, 'companyActivities'), {
        companyId,
        type: selectedInterview ? 'interview_updated' : 'interview_scheduled',
        description: `Interview ${selectedInterview ? 'updated' : 'scheduled'} with candidate`,
        metadata: { interviewId, applicationId: formData.applicationId },
        createdAt: serverTimestamp(),
      });

      showNotification('success', `Interview ${selectedInterview ? 'updated' : 'scheduled'} successfully!`);
      setShowScheduleModal(false);
      setSelectedInterview(null);
    } catch (error) {
      console.error('Error scheduling interview:', error);
      showNotification('error', 'Failed to schedule interview. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (interview) => {
    setSelectedInterview(interview);
    setShowScheduleModal(true);
  };

  const handleCancelClick = (interview) => {
    setInterviewToCancel(interview);
    setShowCancelConfirm(true);
  };

  const handleCancelConfirm = async () => {
    if (!interviewToCancel) return;

    try {
      await updateDoc(doc(db, 'interviews', interviewToCancel.id), {
        status: 'cancelled',
        cancelledAt: serverTimestamp(),
        cancelledBy: companyId,
        updatedAt: serverTimestamp(),
      });

      // Sync to Supabase
      await supabase
        .from('interviews')
        .update({ status: 'cancelled', updated_at: new Date().toISOString() })
        .eq('id', interviewToCancel.id);

      // Notify candidate
      if (interviewToCancel.application?.candidateId) {
        await addDoc(collection(db, 'notifications'), {
          userId: interviewToCancel.application.candidateId,
          type: 'interview_cancelled',
          title: 'Interview Cancelled',
          message: `Your interview for ${interviewToCancel.application?.job?.title || 'a position'} has been cancelled`,
          read: false,
          createdAt: serverTimestamp(),
        });
      }

      showNotification('success', 'Interview cancelled successfully');
      setShowCancelConfirm(false);
      setInterviewToCancel(null);
    } catch (error) {
      console.error('Error cancelling interview:', error);
      showNotification('error', 'Failed to cancel interview');
    }
  };

  const handleMarkComplete = async (interview) => {
    try {
      await updateDoc(doc(db, 'interviews', interview.id), {
        status: 'completed',
        completedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      await supabase
        .from('interviews')
        .update({ status: 'completed', updated_at: new Date().toISOString() })
        .eq('id', interview.id);

      showNotification('success', 'Interview marked as completed');
    } catch (error) {
      console.error('Error marking interview complete:', error);
      showNotification('error', 'Failed to update interview');
    }
  };

  const handleReschedule = (interview) => {
    setSelectedInterview(interview);
    setShowScheduleModal(true);
  };

  const handleJoin = (interview) => {
    if (interview.meetingLink) {
      window.open(interview.meetingLink, '_blank');
    }
  };

  const handleCopyLink = async (link) => {
    try {
      await navigator.clipboard.writeText(link);
      showNotification('success', 'Meeting link copied to clipboard');
    } catch (error) {
      console.error('Error copying link:', error);
    }
  };

  const handleSendReminder = async (interview) => {
    try {
      if (!interview.application?.candidateId) {
        showNotification('error', 'Cannot send reminder - candidate not found');
        return;
      }

      await addDoc(collection(db, 'notifications'), {
        userId: interview.application.candidateId,
        type: 'interview_reminder',
        title: 'Interview Reminder',
        message: `Reminder: Your interview for ${interview.application?.job?.title} is scheduled at ${formatDateTime(interview.scheduledAt)}`,
        interviewId: interview.id,
        read: false,
        createdAt: serverTimestamp(),
      });

      showNotification('success', 'Reminder sent to candidate');
    } catch (error) {
      console.error('Error sending reminder:', error);
      showNotification('error', 'Failed to send reminder');
    }
  };

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
              <FaCalendarCheck className="w-8 h-8 text-blue-600" />
              Interview Schedule
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Manage and track all your candidate interviews
            </p>
          </div>

          <button
            onClick={() => {
              setSelectedInterview(null);
              setShowScheduleModal(true);
            }}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <FaCalendarPlus className="w-4 h-4" />
            Schedule Interview
          </button>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-6">
          {[
            { label: 'Total', value: stats.total, icon: FaCalendarAlt, color: 'blue', filter: 'all' },
            { label: 'Scheduled', value: stats.scheduled, icon: FaCalendarCheck, color: 'green', filter: 'scheduled' },
            { label: 'Today', value: stats.today, icon: FaCalendarDay, color: 'yellow', filter: null },
            { label: 'Completed', value: stats.completed, icon: FaCheckCircle, color: 'purple', filter: 'completed' },
            { label: 'Cancelled', value: stats.cancelled, icon: FaTimesCircle, color: 'red', filter: 'cancelled' },
          ].map((stat, index) => (
            <motion.button
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => stat.filter && setStatusFilter(stat.filter)}
              className={`bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border transition-all text-left ${
                statusFilter === stat.filter 
                  ? 'border-blue-500 ring-1 ring-blue-500' 
                  : 'border-gray-100 dark:border-gray-700 hover:border-gray-200'
              }`}
            >
              <div className={`p-2 rounded-lg inline-block mb-2 ${
                stat.color === 'blue' ? 'bg-blue-50 text-blue-600' :
                stat.color === 'green' ? 'bg-green-50 text-green-600' :
                stat.color === 'yellow' ? 'bg-yellow-50 text-yellow-600' :
                stat.color === 'purple' ? 'bg-purple-50 text-purple-600' :
                'bg-red-50 text-red-600'
              }`}>
                <stat.icon className="w-4 h-4" />
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stat.value}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</p>
            </motion.button>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 mb-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="relative flex-1 w-full">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by candidate, job, or interviewer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {INTERVIEW_STATUSES.map(status => (
                <option key={status.value} value={status.value}>{status.label}</option>
              ))}
            </select>
          </div>
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
        ) : filteredInterviews.length === 0 ? (
          <EmptyState 
            onAction={() => setShowScheduleModal(true)} 
            hasFilters={searchTerm || statusFilter !== 'all'} 
          />
        ) : (
          <div className="space-y-4">
            {filteredInterviews.map((interview) => (
              <InterviewCard
                key={interview.id}
                interview={interview}
                onJoin={handleJoin}
                onEdit={handleEdit}
                onCancel={handleCancelClick}
                onMarkComplete={handleMarkComplete}
                onReschedule={handleReschedule}
                onCopyLink={handleCopyLink}
                onSendReminder={handleSendReminder}
              />
            ))}
          </div>
        )}
      </div>

      {/* Schedule Modal */}
      <ScheduleModal
        show={showScheduleModal}
        onClose={() => {
          setShowScheduleModal(false);
          setSelectedInterview(null);
        }}
        onSubmit={handleScheduleInterview}
        applications={applications}
        interview={selectedInterview}
        loading={saving}
        preselectedApplicationId={preselectedAppId}
      />

      {/* Cancel Confirmation Modal */}
      <AnimatePresence>
        {showCancelConfirm && interviewToCancel && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowCancelConfirm(false)}
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
                    Cancel Interview
                  </h3>
                  <p className="text-sm text-gray-500">
                    This will notify the candidate
                  </p>
                </div>
              </div>

              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Are you sure you want to cancel the interview with{' '}
                <strong>{interviewToCancel.application?.candidate?.name}</strong>?
              </p>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowCancelConfirm(false)}
                  className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Keep Interview
                </button>
                <button
                  onClick={handleCancelConfirm}
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors"
                >
                  Cancel Interview
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ScheduleInterview;
