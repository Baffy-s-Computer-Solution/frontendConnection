// src/pages/company/VideoInterviews.jsx
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
/* eslint-disable react/no-unescaped-entities */
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FaVideo, FaVideoSlash, FaCamera, FaCameraRetro, FaMicrophone, FaMicrophoneSlash, FaMicrophoneAlt, FaDesktop, FaMobileAlt, FaPhone, FaPhoneSlash, FaPhoneVolume, FaVolumeUp, FaVolumeMute, FaVolumeDown, FaHeadphones, FaHeadphonesAlt, FaPlay, FaPause, FaStop, FaCircle, FaDotCircle, FaRegDotCircle, FaRecordVinyl, FaCalendarAlt, FaClock, FaRegClock, FaUser, FaUsers, FaUserTie, FaUserCheck, FaUserTimes, FaCheckCircle, FaTimesCircle, FaExclamationTriangle, FaInfoCircle, FaQuestionCircle, FaBell, FaRegBell, FaBellSlash, FaCheck, FaCheckDouble, FaTimes, FaPlus, FaMinus, FaEllipsisV, FaEllipsisH, FaCog, FaCogs, FaSlidersH, FaToggleOn, FaToggleOff, FaExpand, FaCompress, FaExpandArrowsAlt, FaCompressArrowsAlt, FaArrowsAlt, FaArrowsAltH, FaArrowsAltV, FaSearchPlus, FaSearchMinus, FaSearch, FaFilter, FaSort, FaSortAmountDown, FaSortAmountUp, FaSync, FaSyncAlt, FaRedo, FaUndo, FaDownload, FaUpload, FaCloudUploadAlt, FaCloudDownloadAlt, FaShare, FaShareAlt, FaLink, FaCopy, FaExternalLinkAlt, FaChartLine, FaChartBar, FaChartPie, FaPercentage, FaBrain, FaRobot, FaMagic, FaLightbulb, FaStar, FaRegStar, FaHeart, FaRegHeart, FaThumbsUp, FaRegThumbsUp, FaThumbsDown, FaRegThumbsDown, FaComment, FaRegComment, FaCommentDots, FaRegCommentDots, FaComments, FaRegComments, FaPaperPlane, FaRegPaperPlane, FaSmile, FaRegSmile, FaMeh, FaRegMeh, FaFrown, FaRegFrown, FaSadTear, FaRegSadTear, FaGrin, FaRegGrin, FaGrinBeam, FaRegGrinBeam, FaGrinStars, FaGrinHearts, FaGrinTears, FaGrinTongue, FaGrinTongueSquint, FaGrinTongueWink, FaGrinWink, FaGrinSquint, FaGrinSquintTears, FaLaugh, FaRegLaugh, FaLaughBeam, FaLaughSquint, FaLaughWink, FaSurprise, FaRegSurprise, FaAngry, FaRegAngry, FaFlushed, FaDizzy, FaTired, FaRegTired, FaKiss, FaRegKiss, FaGrimace, FaMehBlank, FaMehRollingEyes, FaFrownOpen, FaSadCry, FaSpinner, FaRocket, FaBolt, FaFire, FaSnowflake, FaSun, FaMoon, FaCloudSun, FaCloudMoon, FaWifi, FaSignal, FaBroadcastTower, FaSatelliteDish, FaPlug, FaChargingStation, FaBatteryFull, FaBatteryHalf, FaBatteryQuarter, FaBatteryEmpty, FaKeyboard, FaMouse, FaLaptop, FaTabletAlt, FaPrint, FaFileAlt, FaRegFileAlt, FaFilePdf, FaFileWord, FaFileExcel, FaFilePowerpoint, FaFileImage, FaFileVideo, FaFileAudio, FaFileArchive, FaFileCode, FaFile, FaFolder, FaFolderOpen, FaHdd, FaMemory, FaMicrochip, FaServer, FaDatabase, FaCloud, FaLock, FaUnlock, FaShieldAlt, FaFingerprint, FaKey, FaUserShield, FaUserLock, FaUserSecret, FaUserNinja, FaUserAstronaut, FaUserSecret as FaUserRobot, FaUserSecret as FaUserAlien, FaUserTie as FaUserCowboy, FaCrown as FaUserCrown, FaUserTie as FaUserEmperor, FaUserTie as FaUserEmpress, FaUserTie as FaUserKing, FaUserTie as FaUserQueen, FaUserTie as FaUserPrince, FaUserTie as FaUserPrincess, FaHatWizard as FaUserWizard, FaUserSecret as FaUserWitch, FaUserNinja as FaUserPirate, FaUserNinja as FaUserSamurai, FaUserGraduate, FaUserFriends, FaUsersCog, FaUserCog, FaUserEdit, FaUserCircle, FaUserTag, FaIdCard, FaAddressCard, FaAddressBook, FaPassport, FaBuilding, FaRegBuilding, FaGlobe, FaMapMarkerAlt, FaMapPin, FaDirections, FaRoute, FaCompass, FaCrosshairs, FaLocationArrow, FaBriefcase, FaGraduationCap, FaAward, FaTrophy, FaMedal, FaCrown, FaGem, FaHandshake, FaHandsHelping, FaHandHoldingHeart, FaHandHoldingUsd, FaPrayingHands, FaPray, FaPeace, FaYinYang, FaDove, FaFeather, FaLeaf, FaSeedling, FaTree, FaSpa, FaHotTub, FaUmbrellaBeach, FaPlane, FaCar, FaBus, FaTrain, FaBicycle, FaWalking, FaRunning, FaHome, FaWarehouse, FaIndustry, FaStore, FaShoppingCart, FaShoppingBag, FaBox, FaBoxes, FaPallet, FaTruck, FaShip, FaRocket as FaRocketSolid, FaSatellite, FaRss, FaPodcast, FaFilm, FaPhotoVideo, FaImages, FaImage, FaMusic, FaGuitar, FaDrum, FaHeadset, FaGamepad, FaDice, FaChess, FaPuzzlePiece, FaGhost, FaDragon, FaHatWizard, FaBroom, FaHatCowboy, FaGlasses, FaTshirt, FaShoePrints, FaSocks, FaMitten, FaCoffee, FaMugHot, FaUtensils, FaUtensilSpoon, FaHamburger, FaPizzaSlice, FaHotdog, FaIceCream, FaBirthdayCake, FaCookie, FaCandyCane, FaCarrot, FaLemon, FaPepperHot, FaDrumstickBite, FaBacon, FaEgg, FaCheese, FaBreadSlice, FaAppleAlt, FaHeartbeat, FaStethoscope, FaUserMd, FaUserNurse, FaAmbulance, FaHospital, FaClinicMedical, FaFirstAid, FaMedkit, FaPills, FaCapsules, FaTablets, FaSyringe, FaVial, FaVials, FaFlask, FaMicroscope, FaDna, FaAtom, FaViruses, FaBacteria, FaVirus, FaVirusSlash, FaShieldVirus, FaBiohazard, FaRadiation, FaSkull, FaSkullCrossbones, FaBone, FaTooth, FaTeeth, FaTeethOpen, FaEye, FaEyeSlash, FaAssistiveListeningSystems as FaEarListen, FaDeaf, FaSignLanguage, FaBlind, FaLowVision, FaWheelchair, FaCrutch, FaProcedures, FaLanguage, FaSpellCheck, FaSpellCheck as FaSpellCheckSolid, FaClipboard, FaClipboardCheck, FaClipboardList, FaTasks, FaProjectDiagram, FaSitemap, FaNetworkWired, FaLaptopCode, FaCode, FaTerminal, FaBug, FaSpider, FaFish, FaFrog, FaHorse, FaHorseHead, FaCat, FaDog, FaPaw, FaKiwiBird, FaCrow, FaHippo, FaOtter, FaIcicles, FaSnowflake as FaSnowflakeSolid, FaRainbow, FaMeteor, FaSpaceShuttle, FaUserAstronaut as FaUserAstronautSolid, FaGlobeAmericas, FaGlobeEurope, FaGlobeAsia, FaGlobeAfrica, FaMap, FaMapMarked, FaMapMarkedAlt, FaWind, FaWater, FaTint, FaTintSlash, FaFaucet, FaShower, FaBath, FaUmbrella, FaCloudRain, FaCloudShowersHeavy, FaCloudSunRain, FaCloudMoonRain, FaPooStorm } from "react-icons/fa";
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
} from 'firebase/firestore';

import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { db } from '../../config/firebase';
import { supabase } from '../../config/supabase';
import { FaHourglassHalf } from 'react-icons/fa';

// ============================================
// CONSTANTS
// ============================================

const INTERVIEW_TABS = [
  { id: 'upcoming', label: 'Upcoming', icon: FaCalendarAlt, color: 'blue' },
  { id: 'live', label: 'Live', icon: FaCircle, color: 'red' },
  { id: 'completed', label: 'Completed', icon: FaCheckCircle, color: 'green' },
  { id: 'cancelled', label: 'Cancelled', icon: FaTimesCircle, color: 'gray' },
];

const SORT_OPTIONS = [
  { value: 'upcoming', label: 'Upcoming First' },
  { value: 'recent', label: 'Most Recent' },
  { value: 'name', label: 'Candidate Name' },
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
  if (diffMins < 1) return 'Starting now';
  if (diffMins < 60) return `In ${diffMins}m`;
  if (diffHours < 24) return `In ${diffHours}h`;
  if (diffDays < 7) return `In ${diffDays}d`;
  return `In ${Math.floor(diffDays / 7)}w`;
};

const getStatusConfig = (status) => {
  const configs = {
    scheduled: {
      bg: 'bg-blue-100 dark:bg-blue-900/30',
      text: 'text-blue-700 dark:text-blue-300',
      icon: FaCalendarAlt,
      label: 'Scheduled',
      dot: 'bg-blue-500',
    },
    live: {
      bg: 'bg-red-100 dark:bg-red-900/30',
      text: 'text-red-700 dark:text-red-300',
      icon: FaCircle,
      label: 'Live',
      dot: 'bg-red-500 animate-pulse',
    },
    in_progress: {
      bg: 'bg-yellow-100 dark:bg-yellow-900/30',
      text: 'text-yellow-700 dark:text-yellow-300',
      icon: FaHourglassHalf,
      label: 'In Progress',
      dot: 'bg-yellow-500',
    },
    completed: {
      bg: 'bg-green-100 dark:bg-green-900/30',
      text: 'text-green-700 dark:text-green-300',
      icon: FaCheckCircle,
      label: 'Completed',
      dot: 'bg-green-500',
    },
    cancelled: {
      bg: 'bg-gray-100 dark:bg-gray-700',
      text: 'text-gray-700 dark:text-gray-300',
      icon: FaTimesCircle,
      label: 'Cancelled',
      dot: 'bg-gray-500',
    },
    no_show: {
      bg: 'bg-orange-100 dark:bg-orange-900/30',
      text: 'text-orange-700 dark:text-orange-300',
      icon: FaUserTimes,
      label: 'No Show',
      dot: 'bg-orange-500',
    },
  };
  return configs[status] || configs.scheduled;
};

// ============================================
// CUSTOM HOOKS
// ============================================

const useVideoInterviews = (companyId) => {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!companyId) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'interviews'),
      where('companyId', '==', companyId),
      where('interviewType', '==', 'video'),
      orderBy('scheduledAt', 'desc'),
      limit(100)
    );

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

                  let candidate = null;
                  if (appData.candidateId) {
                    const candidateDoc = await getDoc(doc(db, 'users', appData.candidateId));
                    if (candidateDoc.exists()) {
                      candidate = { id: candidateDoc.id, ...candidateDoc.data() };
                    }
                  }

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
              startedAt: data.startedAt?.toDate?.() || data.startedAt,
              endedAt: data.endedAt?.toDate?.() || data.endedAt,
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
  }, [companyId]);

  return { interviews, loading, error };
};

// ============================================
// COMPONENTS
// ============================================

const LoadingSkeleton = () => (
  <div className="space-y-4">
    {[...Array(4)].map((_, i) => (
      <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-6 animate-pulse">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
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

const EmptyState = ({ tab, onSchedule }) => {
  const messages = {
    upcoming: 'No upcoming video interviews scheduled',
    live: 'No live interviews at the moment',
    completed: 'No completed interviews yet',
    cancelled: 'No cancelled interviews',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center py-16"
    >
      <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
        <FaVideo className="w-12 h-12 text-gray-400" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
        {messages[tab]}
      </h3>
      <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
        {tab === 'upcoming'
          ? 'Schedule a video interview to meet with candidates remotely.'
          : 'Interviews will appear here based on their status.'}
      </p>
      {tab === 'upcoming' && (
        <button
          onClick={onSchedule}
          className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
        >
          <FaVideo className="w-4 h-4" />
          Schedule Interview
        </button>
      )}
    </motion.div>
  );
};

const InterviewCard = ({ interview, onJoin, onView, onCopyLink, onCancel, onComplete }) => {
  const statusConfig = getStatusConfig(interview.status);
  const StatusIcon = statusConfig.icon;
  const [showMenu, setShowMenu] = useState(false);
  const candidate = interview.application?.candidate;
  const job = interview.application?.job;

  const isUpcoming = interview.status === 'scheduled' && new Date(interview.scheduledAt) > new Date();
  const isLive = interview.status === 'live' || interview.status === 'in_progress';
  const isSoon = isUpcoming && new Date(interview.scheduledAt) - new Date() < 15 * 60 * 1000;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white dark:bg-gray-800 rounded-xl p-5 border-2 transition-all hover:shadow-lg ${
        isLive
          ? 'border-red-500 bg-red-50 dark:bg-red-900/10'
          : isSoon
          ? 'border-yellow-400'
          : 'border-gray-100 dark:border-gray-700'
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4 flex-1">
          {/* Video Icon / Avatar */}
          <div className="relative flex-shrink-0">
            <div className={`w-16 h-16 rounded-xl flex items-center justify-center ${
              isLive ? 'bg-red-500' : 'bg-gradient-to-br from-blue-500 to-purple-600'
            }`}>
              <FaVideo className="w-7 h-7 text-white" />
            </div>
            {isLive && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white dark:border-gray-800 animate-pulse" />
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h4 className="font-semibold text-gray-900 dark:text-white">
                {candidate?.name || candidate?.displayName || 'Unknown Candidate'}
              </h4>
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.text}`}>
                <StatusIcon className="w-3 h-3" />
                {statusConfig.label}
              </span>
              {isSoon && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 animate-pulse">
                  <FaBell className="w-3 h-3" />
                  Starting Soon
                </span>
              )}
            </div>

            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
              {job?.title || 'Position'}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1">
                <FaCalendarAlt className="w-3.5 h-3.5" />
                {formatDateTime(interview.scheduledAt)}
              </span>
              <span className="flex items-center gap-1">
                <FaClock className="w-3.5 h-3.5" />
                {interview.duration || 30} min
              </span>
              {isUpcoming && (
                <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-medium">
                  <FaHourglassHalf className="w-3.5 h-3.5" />
                  {getTimeUntil(interview.scheduledAt)}
                </span>
              )}
            </div>

            {interview.interviewerName && (
              <p className="text-xs text-gray-400 mt-2">
                <FaUser className="w-3 h-3 inline mr-1" />
                Interviewer: {interview.interviewerName}
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 relative flex-shrink-0">
          {(isUpcoming || isLive) && interview.meetingLink && (
            <button
              onClick={() => onJoin(interview)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                isLive
                  ? 'bg-red-600 text-white hover:bg-red-700 animate-pulse'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              <FaVideo className="w-3.5 h-3.5" />
              {isLive ? 'Rejoin' : 'Join'}
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
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 py-2 z-20"
                >
                  <button
                    onClick={() => { onView(interview); setShowMenu(false); }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                  >
                    <FaEye className="w-4 h-4" />
                    View Details
                  </button>
                  {interview.meetingLink && (
                    <button
                      onClick={() => { onCopyLink(interview.meetingLink); setShowMenu(false); }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                    >
                      <FaCopy className="w-4 h-4" />
                      Copy Meeting Link
                    </button>
                  )}
                  {isUpcoming && (
                    <button
                      onClick={() => { onComplete(interview); setShowMenu(false); }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                    >
                      <FaCheckCircle className="w-4 h-4" />
                      Mark Complete
                    </button>
                  )}
                  {isUpcoming && (
                    <>
                      <div className="border-t border-gray-100 dark:border-gray-700 my-1" />
                      <button
                        onClick={() => { onCancel(interview); setShowMenu(false); }}
                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                      >
                        <FaTimesCircle className="w-4 h-4" />
                        Cancel Interview
                      </button>
                    </>
                  )}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

const DetailModal = ({ interview, show, onClose, onJoin, onCopyLink }) => {
  if (!interview) return null;

  const statusConfig = getStatusConfig(interview.status);
  const candidate = interview.application?.candidate;
  const job = interview.application?.job;

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
            className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-2xl my-8"
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Interview Details
              </h2>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              {/* Candidate Info */}
              <div className="flex items-start gap-4">
                {candidate?.avatar ? (
                  <img
                    src={candidate.avatar}
                    alt={candidate.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xl font-semibold">
                    {candidate?.name?.charAt(0) || 'C'}
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {candidate?.name || 'Candidate'}
                  </h3>
                  <p className="text-sm text-gray-500">{candidate?.email}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {job?.title}
                  </p>
                  <span className={`inline-flex items-center gap-1 mt-2 px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.text}`}>
                    <statusConfig.icon className="w-3 h-3" />
                    {statusConfig.label}
                  </span>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <p className="text-xs text-gray-500 mb-1">Scheduled</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {formatDateTime(interview.scheduledAt)}
                  </p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <p className="text-xs text-gray-500 mb-1">Duration</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {interview.duration || 30} minutes
                  </p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <p className="text-xs text-gray-500 mb-1">Interviewer</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {interview.interviewerName || 'Not specified'}
                  </p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <p className="text-xs text-gray-500 mb-1">Type</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                    {interview.interviewType || 'Video'}
                  </p>
                </div>
              </div>

              {/* Meeting Link */}
              {interview.meetingLink && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Meeting Link
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={interview.meetingLink}
                      readOnly
                      className="flex-1 px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm"
                    />
                    <button
                      onClick={() => onCopyLink(interview.meetingLink)}
                      className="px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      <FaCopy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Notes */}
              {interview.notes && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Notes
                  </label>
                  <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                    <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                      {interview.notes}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-100 dark:border-gray-700">
              <button
                onClick={onClose}
                className="px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Close
              </button>
              {interview.meetingLink && (interview.status === 'scheduled' || interview.status === 'live') && (
                <button
                  onClick={() => onJoin(interview)}
                  className="px-4 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <FaVideo className="w-4 h-4" />
                  Join Interview
                </button>
              )}
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

const VideoInterviews = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { currentUser } = useAuth();
  const { showNotification } = useNotification();

  const companyId = currentUser?.uid;
  const { interviews, loading, error } = useVideoInterviews(companyId);

  // State
  const [activeTab, setActiveTab] = useState('upcoming');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('upcoming');
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [interviewToCancel, setInterviewToCancel] = useState(null);

  // Filter by tab
  const filteredByTab = useMemo(() => {
    const now = new Date();
    return interviews.filter(interview => {
      const scheduledAt = interview.scheduledAt instanceof Date 
        ? interview.scheduledAt 
        : interview.scheduledAt?.toDate?.() || new Date(0);

      switch (activeTab) {
        case 'upcoming':
          return ['scheduled', 'live', 'in_progress'].includes(interview.status) && scheduledAt >= now;
        case 'live':
          return ['live', 'in_progress'].includes(interview.status);
        case 'completed':
          return interview.status === 'completed';
        case 'cancelled':
          return ['cancelled', 'no_show'].includes(interview.status);
        default:
          return true;
      }
    });
  }, [interviews, activeTab]);

  // Apply search and sort
  const displayedInterviews = useMemo(() => {
    let filtered = [...filteredByTab];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(i =>
        (i.application?.candidate?.name?.toLowerCase() || '').includes(term) ||
        (i.application?.job?.title?.toLowerCase() || '').includes(term) ||
        (i.interviewerName?.toLowerCase() || '').includes(term)
      );
    }

    filtered.sort((a, b) => {
      const aDate = a.scheduledAt instanceof Date ? a.scheduledAt : a.scheduledAt?.toDate?.() || new Date(0);
      const bDate = b.scheduledAt instanceof Date ? b.scheduledAt : b.scheduledAt?.toDate?.() || new Date(0);

      switch (sortBy) {
        case 'upcoming':
          return aDate - bDate;
        case 'recent':
          return bDate - aDate;
        case 'name':
          return (a.application?.candidate?.name || '').localeCompare(b.application?.candidate?.name || '');
        default:
          return 0;
      }
    });

    return filtered;
  }, [filteredByTab, searchTerm, sortBy]);

  // Tab counts
  const tabCounts = useMemo(() => {
    const now = new Date();
    return {
      upcoming: interviews.filter(i => {
        const d = i.scheduledAt instanceof Date ? i.scheduledAt : i.scheduledAt?.toDate?.() || new Date(0);
        return ['scheduled', 'live', 'in_progress'].includes(i.status) && d >= now;
      }).length,
      live: interviews.filter(i => ['live', 'in_progress'].includes(i.status)).length,
      completed: interviews.filter(i => i.status === 'completed').length,
      cancelled: interviews.filter(i => ['cancelled', 'no_show'].includes(i.status)).length,
    };
  }, [interviews]);

  // ============================================
  // HANDLERS
  // ============================================

  const handleJoin = (interview) => {
    if (interview.meetingLink) {
      // Mark as live
      updateDoc(doc(db, 'interviews', interview.id), {
        status: 'live',
        startedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }).catch(err => console.error('Error updating status:', err));

      window.open(interview.meetingLink, '_blank');
    }
  };

  const handleCopyLink = async (link) => {
    try {
      await navigator.clipboard.writeText(link);
      showNotification('success', 'Meeting link copied');
    } catch (error) {
      console.error('Error copying:', error);
    }
  };

  const handleView = (interview) => {
    setSelectedInterview(interview);
    setShowDetailModal(true);
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
        updatedAt: serverTimestamp(),
      });

      // Notify candidate
      if (interviewToCancel.application?.candidateId) {
        await addDoc(collection(db, 'notifications'), {
          userId: interviewToCancel.application.candidateId,
          type: 'interview_cancelled',
          title: 'Video Interview Cancelled',
          message: `Your video interview has been cancelled`,
          read: false,
          createdAt: serverTimestamp(),
        });
      }

      showNotification('success', 'Interview cancelled');
      setShowCancelConfirm(false);
      setInterviewToCancel(null);
    } catch (error) {
      console.error('Error cancelling:', error);
      showNotification('error', 'Failed to cancel interview');
    }
  };

  const handleComplete = async (interview) => {
    try {
      await updateDoc(doc(db, 'interviews', interview.id), {
        status: 'completed',
        completedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      showNotification('success', 'Interview marked as completed');
    } catch (error) {
      console.error('Error completing:', error);
      showNotification('error', 'Failed to update interview');
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
              <FaVideo className="w-8 h-8 text-blue-600" />
              Video Interviews
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Conduct and manage video interviews with candidates
            </p>
          </div>

          <button
            onClick={() => navigate('/company/schedule-interview')}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <FaVideo className="w-4 h-4" />
            Schedule Video Interview
          </button>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {INTERVIEW_TABS.map((tab, index) => (
            <motion.button
              key={tab.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => setActiveTab(tab.id)}
              className={`bg-white dark:bg-gray-800 rounded-xl p-5 border-2 transition-all text-left ${
                activeTab === tab.id
                  ? 'border-blue-500 ring-1 ring-blue-500'
                  : 'border-gray-100 dark:border-gray-700 hover:border-gray-200'
              }`}
            >
              <div className={`p-2.5 rounded-lg inline-block mb-3 ${
                tab.color === 'blue' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600' :
                tab.color === 'red' ? 'bg-red-50 dark:bg-red-900/20 text-red-600' :
                tab.color === 'green' ? 'bg-green-50 dark:bg-green-900/20 text-green-600' :
                'bg-gray-50 dark:bg-gray-700 text-gray-600'
              }`}>
                <tab.icon className={`w-5 h-5 ${tab.id === 'live' && tabCounts.live > 0 ? 'animate-pulse' : ''}`} />
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {tabCounts[tab.id]}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{tab.label}</p>
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
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {SORT_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
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
          </div>
        ) : displayedInterviews.length === 0 ? (
          <EmptyState
            tab={activeTab}
            onSchedule={() => navigate('/company/schedule-interview')}
          />
        ) : (
          <div className="space-y-4">
            {displayedInterviews.map((interview) => (
              <InterviewCard
                key={interview.id}
                interview={interview}
                onJoin={handleJoin}
                onView={handleView}
                onCopyLink={handleCopyLink}
                onCancel={handleCancelClick}
                onComplete={handleComplete}
              />
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <DetailModal
        interview={selectedInterview}
        show={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedInterview(null);
        }}
        onJoin={handleJoin}
        onCopyLink={handleCopyLink}
      />

      {/* Cancel Confirmation */}
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
                    Candidate will be notified
                  </p>
                </div>
              </div>

              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Are you sure you want to cancel the video interview with{' '}
                <strong>{interviewToCancel.application?.candidate?.name}</strong>?
              </p>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowCancelConfirm(false)}
                  className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Keep
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

export default VideoInterviews;
