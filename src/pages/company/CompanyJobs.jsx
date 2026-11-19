// src/pages/company/CompanyJobs.jsx
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { FaBriefcase, FaPlus, FaSearch, FaFilter, FaSort, FaEye, FaEdit, FaTrash, FaCopy, FaCheckCircle, FaTimesCircle, FaClock, FaPause, FaPlay, FaMapMarkerAlt, FaMoneyBillWave, FaUsers, FaCalendarAlt, FaChartLine, FaEllipsisV, FaExternalLinkAlt, FaShare, FaBookmark, FaRegBookmark, FaStar, FaRegStar, FaBuilding, FaGraduationCap, FaLaptopHouse, FaGlobe, FaWifi, FaSpinner, FaExclamationTriangle, FaCloudUploadAlt, FaTimes, FaCheck, FaArrowUp, FaArrowDown, FaRegClock, FaRegCalendar, FaRegFileAlt, FaRegBuilding, FaRegUser, FaRegEnvelope, FaRegMap, FaRegMoneyBillAlt, FaRegClock as FaRegClockSolid, FaSync, FaTh, FaList, FaThLarge, FaFileExport, FaFileImport, FaArchive, FaRedo, FaUndo, FaLock, FaUnlock, FaTags, FaHashtag, FaLink, FaVideo, FaFileContract, FaHandshake, FaAward, FaTrophy, FaMedal, FaCrown, FaGem, FaRocket, FaBolt, FaFire, FaSnowflake, FaSun, FaMoon, FaRegSmile, FaRegLaugh, FaRegHeart, FaRegThumbsUp, FaThumbsUp, FaHeart, FaComment, FaShareAlt, FaPaperPlane, FaImage, FaPoll, FaCalendarPlus, FaUserPlus, FaUserCheck, FaUserTie, FaUserGraduate, FaRobot, FaBrain, FaMagic, FaLightbulb, FaChartBar, FaChartPie, FaChartArea, FaPercentage, FaDollarSign, FaCreditCard, FaUniversity, FaReceipt, FaFileInvoice, FaFileInvoiceDollar, FaCalculator, FaBalanceScale, FaShieldAlt, FaFingerprint, FaKey, FaUserShield, FaUserLock, FaUserSecret, FaUserNinja, FaUserAstronaut, FaUserMd, FaUserCog, FaUserEdit, FaUserFriends, FaUsersCog, FaUserCircle, FaAddressBook, FaAddressCard, FaIdCard, FaPassport, FaPlane, FaGlobeAmericas, FaGlobeEurope, FaGlobeAsia, FaGlobeAfrica, FaMapMarked, FaMapMarkedAlt, FaMapPin, FaDirections, FaRoute, FaCar, FaBus, FaTrain, FaSubway, FaBicycle, FaWalking, FaRunning, FaHome, FaWarehouse, FaIndustry, FaStore, FaShoppingCart, FaShoppingBag, FaShoppingBasket, FaCashRegister, FaBox, FaBoxes, FaPallet, FaTruck, FaTruckLoading, FaTruckMoving, FaShip, FaAnchor, FaRocket as FaRocketSolid, FaSatellite, FaSatelliteDish, FaWifi as FaWifiSolid, FaBroadcastTower, FaSignal, FaRss, FaPodcast, FaMicrophone, FaMicrophoneAlt, FaHeadphones, FaHeadphonesAlt, FaVolumeUp, FaVolumeMute, FaVolumeDown, FaMusic, FaFilm, FaVideo as FaVideoSolidAlt, FaCamera, FaCameraRetro, FaPhotoVideo, FaImages, FaFileImage, FaFileVideo, FaFileAudio, FaFilePdf, FaFileWord, FaFileExcel, FaFilePowerpoint, FaFileArchive, FaFileCode, FaFileAlt, FaFileAlt as FaFileAltSolid, FaFile, FaFolder, FaFolderOpen, FaFolderPlus, FaFolderMinus, FaCopy as FaCopySolid, FaPaste, FaCut, FaSave, FaDownload, FaUpload, FaCloudDownloadAlt, FaCloudUploadAlt as FaCloudUploadAltSolid, FaCloud, FaCloudRain, FaCloudSun, FaCloudMoon, FaSnowflake as FaSnowflakeSolid, FaWind, FaUmbrella, FaUmbrellaBeach, FaTree, FaLeaf, FaSeedling, FaSpa, FaHotTub, FaSwimmer, FaSwimmingPool, FaDumbbell, FaBasketballBall, FaFootballBall, FaBaseballBall, FaGolfBall, FaTableTennis, FaBowlingBall, FaChess, FaChessBoard, FaChessKing, FaChessQueen, FaChessKnight, FaChessBishop, FaChessRook, FaChessPawn, FaDice, FaDiceOne, FaDiceTwo, FaDiceThree, FaDiceFour, FaDiceFive, FaDiceSix, FaPuzzlePiece, FaGamepad, FaGhost, FaDragon, FaHatWizard, FaMagic as FaMagicSolid, FaBroom, FaHatCowboy, FaHatCowboySide, FaGlasses, FaTshirt, FaShoePrints, FaSocks, FaMitten, FaHandsHelping, FaHandHoldingHeart, FaHandHoldingUsd, FaHandRock, FaHandPaper, FaHandScissors, FaHandLizard, FaHandSpock, FaHandPeace, FaHandPointUp, FaHandPointDown, FaHandPointLeft, FaHandPointRight, FaHandPointer, FaHandMiddleFinger, FaThumbsDown, FaRegThumbsDown, FaPrayingHands, FaPray, FaChurch, FaMosque, FaSynagogue, FaPrayingHands as FaPrayingHandsSolid, FaCross, FaStarOfDavid, FaOm, FaPeace, FaYinYang, FaDove, FaFeather, FaFeatherAlt, FaKiwiBird, FaCrow, FaDove as FaDoveSolid, FaFish, FaFrog, FaHorse, FaHorseHead, FaCat, FaDog, FaPaw, FaSpider, FaBug, FaDragon as FaDragonSolid, FaHippo, FaIcicles, FaOtter, FaStroopwafel, FaKiwiBird as FaKiwiBirdSolid, FaAudible, FaAws, FaBandcamp, FaBattleNet, FaBehance, FaBitcoin, FaBluetooth, FaBluetoothB, FaBtc, FaBuyNLarge, FaBuysellads, FaCanadianMapleLeaf, FaCcAmazonPay, FaCcAmex, FaCcApplePay, FaCcDinersClub, FaCcDiscover, FaCcJcb, FaCcMastercard, FaCcPaypal, FaCcStripe, FaCcVisa, FaCentercode, FaChrome, FaChromecast, FaCloudflare, FaCodepen, FaCodiepie, FaConnectdevelop, FaContao, FaCottonBureau, FaCpanel, FaCreativeCommons, FaCreativeCommonsBy, FaCreativeCommonsNc, FaCreativeCommonsNcEu, FaCreativeCommonsNcJp, FaCreativeCommonsNd, FaCreativeCommonsPd, FaCreativeCommonsPdAlt, FaCreativeCommonsRemix, FaCreativeCommonsSa, FaCreativeCommonsSampling, FaCreativeCommonsSamplingPlus, FaCreativeCommonsShare, FaCreativeCommonsZero, FaCriticalRole, FaCss3, FaCss3Alt, FaCuttlefish, FaDAndD, FaDAndDBeyond, FaDailymotion, FaDashcube, FaDelicious, FaDeploydog, FaDeskpro, FaDev, FaDeviantart, FaDhl, FaDiaspora, FaDigg, FaDigitalOcean, FaDiscord, FaDiscourse, FaDochub, FaDocker, FaDribbble, FaDropbox, FaDrupal, FaDyalog, FaEarlybirds, FaEbay, FaEdge, FaElementor, FaEllo, FaEmber, FaEmpire, FaEnvira, FaErlang, FaEthereum, FaEtsy, FaEvernote, FaExpeditedssl, FaFacebook, FaFacebookF, FaFacebookMessenger, FaFacebookSquare, FaFantasyFlightGames, FaFedex, FaFedora, FaFigma, FaFirefox, FaFirefoxBrowser, FaFirstOrder, FaFirstOrderAlt, FaFirstdraft, FaFlickr, FaFlipboard, FaFly, FaFontAwesome, FaFontAwesomeAlt, FaFontAwesomeFlag, FaFonticons, FaFonticonsFi, FaFortAwesome, FaFortAwesomeAlt, FaForumbee, FaFoursquare, FaFreeCodeCamp, FaFreebsd, FaFulcrum, FaGalacticRepublic, FaGalacticSenate, FaGetPocket, FaGg, FaGgCircle, FaGit, FaGitAlt, FaGitSquare, FaGithub, FaGithubAlt, FaGithubSquare, FaGitkraken, FaGitlab, FaGitter, FaGlide, FaGlideG, FaGofore, FaGoodreads, FaGoodreadsG, FaGoogle, FaGoogleDrive, FaGooglePlay, FaGooglePlus, FaGooglePlusG, FaGooglePlusSquare, FaGoogleWallet, FaGratipay, FaGrav, FaGripfire, FaGrunt, FaGulp, FaHackerNews, FaHackerNewsSquare, FaHackerrank, FaHips, FaHireAHelper, FaHooli, FaHornbill, FaHotjar, FaHouzz, FaHtml5, FaHubspot, FaIdeal, FaImdb, FaInstagram, FaInstagramSquare, FaIntercom, FaInternetExplorer, FaInvision, FaIoxhost, FaItchIo, FaItunes, FaItunesNote, FaJava, FaJediOrder, FaJenkins, FaJira, FaJoget, FaJoomla, FaJs, FaJsSquare, FaJsfiddle, FaKaggle, FaKeybase, FaKeycdn, FaKickstarter, FaKickstarterK, FaKorvue, FaLaravel, FaLastfm, FaLastfmSquare, FaLeanpub, FaLess, FaLine, FaLinkedin, FaLinkedinIn, FaLinode, FaLinux, FaLyft, FaMagento, FaMailchimp, FaMandalorian, FaMarkdown, FaMastodon, FaMaxcdn, FaMdb, FaMedapps, FaMedium, FaMediumM, FaMedrt, FaMeetup, FaMegaport, FaMendeley, FaMicroblog, FaMicrosoft, FaMix, FaMixcloud, FaMixer, FaMizuni, FaModx, FaMonero, FaNapster, FaNeos, FaNimblr, FaNode, FaNodeJs, FaNpm, FaNs8, FaNutritionix, FaOdnoklassniki, FaOdnoklassnikiSquare, FaOldRepublic, FaOpencart, FaOpenid, FaOpera, FaOptinMonster, FaOrcid, FaOsi, FaPage4, FaPagelines, FaPalfed, FaPatreon, FaPaypal, FaPennyArcade, FaPeriscope, FaPhabricator, FaPhoenixFramework, FaPhoenixSquadron, FaPhp, FaPiedPiper, FaPiedPiperAlt, FaPiedPiperHat, FaPiedPiperPp, FaPiedPiperSquare, FaPinterest, FaPinterestP, FaPinterestSquare, FaPlaystation, FaProductHunt, FaPushed, FaPython, FaQq, FaQuinscape, FaQuora, FaRProject, FaRaspberryPi, FaRavelry, FaReact, FaReacteurope, FaReadme, FaRebel, FaRedRiver, FaReddit, FaRedditAlien, FaRedditSquare, FaRedhat, FaRenren, FaReplyd, FaResearchgate, FaResolving, FaRev, FaRocketchat, FaRockrms, FaRust, FaSafari, FaSalesforce, FaSass, FaSchlix, FaScribd, FaSearchengin, FaSellcast, FaSellsy, FaServicestack, FaShirtsinbulk, FaShopify, FaShopware, FaSimplybuilt, FaSistrix, FaSith, FaSketch, FaSkyatlas, FaSkype, FaSlack, FaSlackHash, FaSlideshare, FaSnapchat, FaSnapchatGhost, FaSnapchatSquare, FaSoundcloud, FaSourcetree, FaSpeakap, FaSpeakerDeck, FaSpotify, FaSquarespace, FaStackExchange, FaStackOverflow, FaStackpath, FaStaylinked, FaSteam, FaSteamSquare, FaSteamSymbol, FaStickerMule, FaStrava, FaStripe, FaStripeS, FaStudiovinari, FaStumbleupon, FaStumbleuponCircle, FaSuperpowers, FaSupple, FaSuse, FaSwift, FaSymfony, FaTeamspeak, FaTelegram, FaTelegramPlane, FaTencentWeibo, FaTheRedYeti, FaThemeco, FaThemeisle, FaThinkPeaks, FaTiktok, FaTradeFederation, FaTrello, FaTripadvisor, FaTumblr, FaTumblrSquare, FaTwitch, FaTwitter, FaTwitterSquare, FaTypo3, FaUber, FaUbuntu, FaUikit, FaUmbraco, FaUniregistry, FaUnity, FaUntappd, FaUps, FaUsb, FaUsps, FaUssunnah, FaVaadin, FaViacoin, FaViadeo, FaViadeoSquare, FaViber, FaVimeo, FaVimeoSquare, FaVimeoV, FaVine, FaVk, FaVnv, FaVuejs, FaWaze, FaWeebly, FaWeibo, FaWeixin, FaWhatsapp, FaWhatsappSquare, FaWhmcs, FaWikipediaW, FaWindows, FaWix, FaWizardsOfTheCoast, FaWolfPackBattalion, FaWordpress, FaWordpressSimple, FaWpbeginner, FaWpexplorer, FaWpforms, FaWpressr, FaXbox, FaXing, FaXingSquare, FaYCombinator, FaYahoo, FaYammer, FaYandex, FaYandexInternational, FaYarn, FaYelp, FaYoast, FaYoutube, FaYoutubeSquare, FaZhihu } from "react-icons/fa";
import {
  collection,
  doc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  endBefore,
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
  setDoc,
  getCountFromServer,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { db, storage } from '../../config/firebase';
import { supabase } from '../../config/supabase';
import cloudinaryService from '../../services/cloudinaryService';

// ============================================
// CONSTANTS
// ============================================

const JOB_TYPES = [
  { value: 'full-time', label: 'Full-time' },
  { value: 'part-time', label: 'Part-time' },
  { value: 'contract', label: 'Contract' },
  { value: 'internship', label: 'Internship' },
  { value: 'temporary', label: 'Temporary' },
  { value: 'volunteer', label: 'Volunteer' },
];

const EXPERIENCE_LEVELS = [
  { value: 'entry', label: 'Entry Level (0-2 years)' },
  { value: 'mid', label: 'Mid Level (3-5 years)' },
  { value: 'senior', label: 'Senior Level (6+ years)' },
  { value: 'lead', label: 'Lead / Manager' },
  { value: 'executive', label: 'Executive' },
];

const JOB_STATUSES = [
  { value: 'active', label: 'Active', color: 'green' },
  { value: 'draft', label: 'Draft', color: 'gray' },
  { value: 'paused', label: 'Paused', color: 'yellow' },
  { value: 'closed', label: 'Closed', color: 'red' },
  { value: 'expired', label: 'Expired', color: 'gray' },
];

const DEPARTMENTS = [
  'Engineering',
  'Product',
  'Design',
  'Marketing',
  'Sales',
  'Human Resources',
  'Finance',
  'Operations',
  'Customer Success',
  'Legal',
  'IT',
  'Research & Development',
  'Other',
];

const CURRENCIES = [
  { value: 'M', label: 'Maloti (M)' },
  { value: 'ZAR', label: 'South African Rand (R)' },
  { value: 'USD', label: 'US Dollar ($)' },
  { value: 'EUR', label: 'Euro (€)' },
  { value: 'GBP', label: 'British Pound (£)' },
];

// ============================================
// UTILITY FUNCTIONS
// ============================================

const formatNumber = (num) => {
  if (num === null || num === undefined) return '0';
  if (typeof num === 'string') return num;
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
    active: { 
      bg: 'bg-green-100 dark:bg-green-900/30', 
      text: 'text-green-700 dark:text-green-300', 
      icon: FaCheckCircle, 
      label: 'Active',
      dot: 'bg-green-500'
    },
    draft: { 
      bg: 'bg-gray-100 dark:bg-gray-700', 
      text: 'text-gray-700 dark:text-gray-300', 
      icon: FaFileAlt, 
      label: 'Draft',
      dot: 'bg-gray-500'
    },
    paused: { 
      bg: 'bg-yellow-100 dark:bg-yellow-900/30', 
      text: 'text-yellow-700 dark:text-yellow-300', 
      icon: FaPause, 
      label: 'Paused',
      dot: 'bg-yellow-500'
    },
    closed: { 
      bg: 'bg-red-100 dark:bg-red-900/30', 
      text: 'text-red-700 dark:text-red-300', 
      icon: FaTimesCircle, 
      label: 'Closed',
      dot: 'bg-red-500'
    },
    expired: { 
      bg: 'bg-gray-100 dark:bg-gray-700', 
      text: 'text-gray-700 dark:text-gray-300', 
      icon: FaClock, 
      label: 'Expired',
      dot: 'bg-gray-500'
    },
  };
  return configs[status] || configs.draft;
};

// ============================================
// CUSTOM HOOKS
// ============================================

const useCompanyJobs = (companyId) => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastDoc, setLastDoc] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  const PAGE_SIZE = 20;

  useEffect(() => {
    if (!companyId) {
      setLoading(false);
      return;
    }

    const jobsQuery = query(
      collection(db, 'jobs'),
      where('companyId', '==', companyId),
      orderBy('createdAt', 'desc'),
      limit(PAGE_SIZE)
    );

    const unsubscribe = onSnapshot(
      jobsQuery,
      (snapshot) => {
        const jobsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt,
          updatedAt: doc.data().updatedAt?.toDate?.() || doc.data().updatedAt,
          deadline: doc.data().deadline?.toDate?.() || doc.data().deadline,
        }));
        setJobs(jobsData);
        setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
        setHasMore(snapshot.docs.length === PAGE_SIZE);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching jobs:', err);
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
        collection(db, 'jobs'),
        where('companyId', '==', companyId),
        orderBy('createdAt', 'desc'),
        startAfter(lastDoc),
        limit(PAGE_SIZE)
      );

      const snapshot = await getDocs(moreQuery);
      const moreJobs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt,
        updatedAt: doc.data().updatedAt?.toDate?.() || doc.data().updatedAt,
        deadline: doc.data().deadline?.toDate?.() || doc.data().deadline,
      }));

      setJobs(prev => [...prev, ...moreJobs]);
      setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
      setHasMore(snapshot.docs.length === PAGE_SIZE);
    } catch (err) {
      console.error('Error loading more jobs:', err);
    }
  }, [companyId, lastDoc, hasMore]);

  return { jobs, loading, error, hasMore, loadMore };
};

// ============================================
// COMPONENTS
// ============================================

const LoadingSkeleton = () => (
  <div className="animate-pulse space-y-4">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
          <div className="flex-1">
            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          </div>
        </div>
      </div>
    ))}
  </div>
);

const EmptyState = ({ onAction }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="text-center py-16"
  >
    <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
      <FaBriefcase className="w-12 h-12 text-gray-400" />
    </div>
    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
      No jobs posted yet
    </h3>
    <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
      Create your first job posting to start receiving applications from qualified candidates.
    </p>
    <button
      onClick={onAction}
      className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
    >
      <FaPlus className="w-4 h-4" />
      Post Your First Job
    </button>
  </motion.div>
);

const JobCard = ({ job, onView, onEdit, onDelete, onToggleStatus, onDuplicate, onShare }) => {
  const statusConfig = getStatusConfig(job.status);
  const StatusIcon = statusConfig.icon;
  const [showMenu, setShowMenu] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
            <FaBriefcase className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {job.title}
            </h3>
            <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1">
                <FaMapMarkerAlt className="w-3 h-3" />
                {job.location || 'Remote'}
              </span>
              <span className="flex items-center gap-1">
                <FaClock className="w-3 h-3" />
                {JOB_TYPES.find(t => t.value === job.type)?.label || job.type}
              </span>
              {job.salary && (
                <span className="flex items-center gap-1">
                  <FaMoneyBillWave className="w-3 h-3" />
                  {job.currency || 'M'}{formatNumber(job.salary)}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
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
                  onClick={() => { onView(job); setShowMenu(false); }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                >
                  <FaEye className="w-4 h-4" />
                  View Details
                </button>
                <button
                  onClick={() => { onEdit(job); setShowMenu(false); }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                >
                  <FaEdit className="w-4 h-4" />
                  Edit Job
                </button>
                <button
                  onClick={() => { onDuplicate(job); setShowMenu(false); }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                >
                  <FaCopy className="w-4 h-4" />
                  Duplicate
                </button>
                <button
                  onClick={() => { onShare(job); setShowMenu(false); }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                >
                  <FaShare className="w-4 h-4" />
                  Share
                </button>
                <div className="border-t border-gray-100 dark:border-gray-700 my-2"></div>
                <button
                  onClick={() => { onToggleStatus(job); setShowMenu(false); }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                >
                  {job.status === 'active' ? (
                    <>
                      <FaPause className="w-4 h-4" />
                      Pause Job
                    </>
                  ) : (
                    <>
                      <FaPlay className="w-4 h-4" />
                      Activate Job
                    </>
                  )}
                </button>
                <button
                  onClick={() => { onDelete(job); setShowMenu(false); }}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                >
                  <FaTrash className="w-4 h-4" />
                  Delete Job
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-4">
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.text}`}>
          <StatusIcon className="w-3 h-3" />
          {statusConfig.label}
        </span>
        {job.urgency === 'urgent' && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300">
            <FaFire className="w-3 h-3" />
            Urgent
          </span>
        )}
        {job.remote && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
            <FaWifi className="w-3 h-3" />
            Remote
          </span>
        )}
      </div>

      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-4">
        {job.description || 'No description provided'}
      </p>

      <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
          <span className="flex items-center gap-1">
            <FaUsers className="w-4 h-4" />
            {formatNumber(job.applicantsCount || 0)} applicants
          </span>
          <span className="flex items-center gap-1">
            <FaEye className="w-4 h-4" />
            {formatNumber(job.views || 0)} views
          </span>
        </div>
        <span className="text-xs text-gray-400">
          {formatTimeAgo(job.createdAt)}
        </span>
      </div>
    </motion.div>
  );
};

const JobListItem = ({ job, onView, onEdit, onDelete, onToggleStatus }) => {
  const statusConfig = getStatusConfig(job.status);
  const StatusIcon = statusConfig.icon;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 hover:shadow-sm transition-all"
    >
      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
        <FaBriefcase className="w-5 h-5 text-blue-600 dark:text-blue-400" />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-gray-900 dark:text-white truncate">
            {job.title}
          </h3>
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.text}`}>
            <StatusIcon className="w-3 h-3" />
            {statusConfig.label}
          </span>
        </div>
        <div className="flex items-center gap-3 mt-1 text-sm text-gray-500 dark:text-gray-400">
          <span>{job.location || 'Remote'}</span>
          <span>•</span>
          <span>{JOB_TYPES.find(t => t.value === job.type)?.label || job.type}</span>
          <span>•</span>
          <span>{formatNumber(job.applicantsCount || 0)} applicants</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onView(job)}
          className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          title="View"
        >
          <FaEye className="w-4 h-4" />
        </button>
        <button
          onClick={() => onEdit(job)}
          className="p-2 text-gray-400 hover:text-indigo-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          title="Edit"
        >
          <FaEdit className="w-4 h-4" />
        </button>
        <button
          onClick={() => onToggleStatus(job)}
          className="p-2 text-gray-400 hover:text-yellow-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          title={job.status === 'active' ? 'Pause' : 'Activate'}
        >
          {job.status === 'active' ? <FaPause className="w-4 h-4" /> : <FaPlay className="w-4 h-4" />}
        </button>
        <button
          onClick={() => onDelete(job)}
          className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          title="Delete"
        >
          <FaTrash className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
};

const JobFormModal = ({ 
  show, 
  onClose, 
  onSubmit, 
  job = null, 
  loading = false 
}) => {
  const [formData, setFormData] = useState({
    title: '',
    department: '',
    location: '',
    type: 'full-time',
    experience: 'entry',
    salary: '',
    salaryType: 'monthly',
    currency: 'M',
    salaryNegotiable: false,
    remote: false,
    hybrid: false,
    description: '',
    responsibilities: '',
    requirements: '',
    qualifications: '',
    skills: [],
    newSkill: '',
    benefits: [],
    newBenefit: '',
    deadline: '',
    status: 'draft',
    urgency: 'normal',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (job) {
      setFormData({
        title: job.title || '',
        department: job.department || '',
        location: job.location || '',
        type: job.type || 'full-time',
        experience: job.experience || 'entry',
        salary: job.salary || '',
        salaryType: job.salaryType || 'monthly',
        currency: job.currency || 'M',
        salaryNegotiable: job.salaryNegotiable || false,
        remote: job.remote || false,
        hybrid: job.hybrid || false,
        description: job.description || '',
        responsibilities: job.responsibilities || '',
        requirements: job.requirements || '',
        qualifications: job.qualifications || '',
        skills: job.skills || [],
        newSkill: '',
        benefits: job.benefits || [],
        newBenefit: '',
        deadline: job.deadline ? formatDate(job.deadline, { year: 'numeric', month: '2-digit', day: '2-digit' }).split('/').reverse().join('-') : '',
        status: job.status || 'draft',
        urgency: job.urgency || 'normal',
      });
    }
  }, [job]);

  const validate = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Job title is required';
    }
    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Job description is required';
    }
    if (formData.skills.length === 0) {
      newErrors.skills = 'At least one skill is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  const handleAddSkill = () => {
    if (formData.newSkill.trim() && !formData.skills.includes(formData.newSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, prev.newSkill.trim()],
        newSkill: '',
      }));
    }
  };

  const handleRemoveSkill = (skill) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill),
    }));
  };

  const handleAddBenefit = () => {
    if (formData.newBenefit.trim() && !formData.benefits.includes(formData.newBenefit.trim())) {
      setFormData(prev => ({
        ...prev,
        benefits: [...prev.benefits, prev.newBenefit.trim()],
        newBenefit: '',
      }));
    }
  };

  const handleRemoveBenefit = (benefit) => {
    setFormData(prev => ({
      ...prev,
      benefits: prev.benefits.filter(b => b !== benefit),
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
          className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-4xl my-8"
        >
          <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {job ? 'Edit Job' : 'Post New Job'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <FaTimes className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <FaFileAlt className="w-5 h-5 text-blue-600" />
                Basic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Job Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.title ? 'border-red-500' : 'border-gray-200 dark:border-gray-600'
                    }`}
                    placeholder="e.g., Senior Software Engineer"
                  />
                  {errors.title && (
                    <p className="mt-1 text-sm text-red-500">{errors.title}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Department
                  </label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Department</option>
                    {DEPARTMENTS.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Location *
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.location ? 'border-red-500' : 'border-gray-200 dark:border-gray-600'
                    }`}
                    placeholder="e.g., Maseru, Lesotho"
                  />
                  {errors.location && (
                    <p className="mt-1 text-sm text-red-500">{errors.location}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Job Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {JOB_TYPES.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Experience Level
                  </label>
                  <select
                    value={formData.experience}
                    onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {EXPERIENCE_LEVELS.map(level => (
                      <option key={level.value} value={level.value}>{level.label}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.remote}
                      onChange={(e) => setFormData({ ...formData, remote: e.target.checked })}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Remote</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.hybrid}
                      onChange={(e) => setFormData({ ...formData, hybrid: e.target.checked })}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Hybrid</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Salary */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <FaMoneyBillWave className="w-5 h-5 text-green-600" />
                Compensation
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Currency
                  </label>
                  <select
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {CURRENCIES.map(curr => (
                      <option key={curr.value} value={curr.value}>{curr.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Salary Range
                  </label>
                  <input
                    type="text"
                    value={formData.salary}
                    onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 15,000 - 25,000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Salary Period
                  </label>
                  <select
                    value={formData.salaryType}
                    onChange={(e) => setFormData({ ...formData, salaryType: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="monthly">Per Month</option>
                    <option value="yearly">Per Year</option>
                    <option value="hourly">Per Hour</option>
                  </select>
                </div>
              </div>
              <label className="flex items-center gap-2 mt-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.salaryNegotiable}
                  onChange={(e) => setFormData({ ...formData, salaryNegotiable: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Salary is negotiable</span>
              </label>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <FaFileAlt className="w-5 h-5 text-purple-600" />
                Job Description
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
                      errors.description ? 'border-red-500' : 'border-gray-200 dark:border-gray-600'
                    }`}
                    placeholder="Describe the role, team, and impact..."
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-500">{errors.description}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Key Responsibilities
                  </label>
                  <textarea
                    value={formData.responsibilities}
                    onChange={(e) => setFormData({ ...formData, responsibilities: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    placeholder="List the main responsibilities..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Requirements
                    </label>
                    <textarea
                      value={formData.requirements}
                      onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      placeholder="Required skills and experience..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Qualifications
                    </label>
                    <textarea
                      value={formData.qualifications}
                      onChange={(e) => setFormData({ ...formData, qualifications: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      placeholder="Educational qualifications..."
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Skills */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <FaTags className="w-5 h-5 text-indigo-600" />
                Required Skills *
              </h3>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={formData.newSkill}
                  onChange={(e) => setFormData({ ...formData, newSkill: e.target.value })}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                  className="flex-1 px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., JavaScript, React, Project Management"
                />
                <button
                  type="button"
                  onClick={handleAddSkill}
                  className="px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                >
                  <FaPlus className="w-4 h-4" />
                </button>
              </div>
              {errors.skills && (
                <p className="mb-2 text-sm text-red-500">{errors.skills}</p>
              )}
              <div className="flex flex-wrap gap-2">
                {formData.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-full text-sm"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      <FaTimes className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Benefits */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <FaAward className="w-5 h-5 text-yellow-600" />
                Benefits & Perks
              </h3>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={formData.newBenefit}
                  onChange={(e) => setFormData({ ...formData, newBenefit: e.target.value })}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddBenefit())}
                  className="flex-1 px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Health insurance, Remote work"
                />
                <button
                  type="button"
                  onClick={handleAddBenefit}
                  className="px-4 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
                >
                  <FaPlus className="w-4 h-4" />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.benefits.map((benefit, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-full text-sm"
                  >
                    <FaCheckCircle className="w-3 h-3" />
                    {benefit}
                    <button
                      type="button"
                      onClick={() => handleRemoveBenefit(benefit)}
                      className="text-green-500 hover:text-green-700"
                    >
                      <FaTimes className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Application Settings */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <FaCog className="w-5 h-5 text-gray-600" />
                Application Settings
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Application Deadline
                  </label>
                  <input
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Urgency
                  </label>
                  <select
                    value={formData.urgency}
                    onChange={(e) => setFormData({ ...formData, urgency: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="normal">Normal</option>
                    <option value="high">High Priority</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {JOB_STATUSES.map(status => (
                      <option key={status.value} value={status.value}>{status.label}</option>
                    ))}
                  </select>
                </div>
              </div>
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
              className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <FaSpinner className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <FaSave className="w-4 h-4" />
                  {job ? 'Update Job' : 'Create Job'}
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

const CompanyJobs = () => {
  const navigate = useNavigate();
  const { currentUser, userProfile } = useAuth();
  const { showNotification } = useNotification();
  
  const companyId = currentUser?.uid;
  const { jobs, loading, error, hasMore, loadMore } = useCompanyJobs(companyId);

  // Local state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState('grid');
  const [showJobModal, setShowJobModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [jobToDelete, setJobToDelete] = useState(null);
  const [saving, setSaving] = useState(false);

  // Filter and sort jobs
  const filteredJobs = useMemo(() => {
    let filtered = [...jobs];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(job =>
        job.title?.toLowerCase().includes(term) ||
        job.location?.toLowerCase().includes(term) ||
        job.department?.toLowerCase().includes(term) ||
        job.skills?.some(skill => skill.toLowerCase().includes(term))
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(job => job.status === statusFilter);
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(job => job.type === typeFilter);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt?.toDate?.() || b.createdAt) - new Date(a.createdAt?.toDate?.() || a.createdAt);
        case 'oldest':
          return new Date(a.createdAt?.toDate?.() || a.createdAt) - new Date(b.createdAt?.toDate?.() || b.createdAt);
        case 'applicants':
          return (b.applicantsCount || 0) - (a.applicantsCount || 0);
        case 'views':
          return (b.views || 0) - (a.views || 0);
        case 'title':
          return (a.title || '').localeCompare(b.title || '');
        default:
          return 0;
      }
    });

    return filtered;
  }, [jobs, searchTerm, statusFilter, typeFilter, sortBy]);

  // Stats
  const stats = useMemo(() => ({
    total: jobs.length,
    active: jobs.filter(j => j.status === 'active').length,
    draft: jobs.filter(j => j.status === 'draft').length,
    paused: jobs.filter(j => j.status === 'paused').length,
    totalApplicants: jobs.reduce((sum, j) => sum + (j.applicantsCount || 0), 0),
    totalViews: jobs.reduce((sum, j) => sum + (j.views || 0), 0),
  }), [jobs]);

  // Handlers
  const handleCreateJob = async (formData) => {
    if (!companyId) return;

    try {
      setSaving(true);

      const jobData = {
        ...formData,
        companyId,
        companyName: userProfile?.companyName || userProfile?.displayName || 'Company',
        companyLogo: userProfile?.logo || null,
        applicantsCount: 0,
        views: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        createdBy: companyId,
      };

      // Convert deadline to Timestamp if provided
      if (formData.deadline) {
        jobData.deadline = Timestamp.fromDate(new Date(formData.deadline));
      }

      // Add to Firebase
      const docRef = await addDoc(collection(db, 'jobs'), jobData);

      // Add to Supabase for analytics
      await supabase
        .from('company_jobs')
        .insert({
          job_id: docRef.id,
          company_id: companyId,
          title: formData.title,
          department: formData.department,
          location: formData.location,
          type: formData.type,
          status: formData.status,
          created_at: new Date().toISOString(),
        });

      // Log activity
      await supabase
        .from('company_activities')
        .insert({
          company_id: companyId,
          activity_type: 'job_created',
          metadata: { job_id: docRef.id, job_title: formData.title },
          created_at: new Date().toISOString(),
        });

      showNotification('success', 'Job created successfully!');
      setShowJobModal(false);
      setSelectedJob(null);
    } catch (error) {
      console.error('Error creating job:', error);
      showNotification('error', 'Failed to create job. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateJob = async (formData) => {
    if (!companyId || !selectedJob) return;

    try {
      setSaving(true);

      const jobData = {
        ...formData,
        updatedAt: serverTimestamp(),
        updatedBy: companyId,
      };

      // Convert deadline to Timestamp if provided
      if (formData.deadline) {
        jobData.deadline = Timestamp.fromDate(new Date(formData.deadline));
      }

      await updateDoc(doc(db, 'jobs', selectedJob.id), jobData);

      // Update Supabase
      await supabase
        .from('company_jobs')
        .update({
          title: formData.title,
          department: formData.department,
          location: formData.location,
          type: formData.type,
          status: formData.status,
          updated_at: new Date().toISOString(),
        })
        .eq('job_id', selectedJob.id);

      showNotification('success', 'Job updated successfully!');
      setShowJobModal(false);
      setSelectedJob(null);
    } catch (error) {
      console.error('Error updating job:', error);
      showNotification('error', 'Failed to update job. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteJob = async () => {
    if (!jobToDelete) return;

    try {
      await deleteDoc(doc(db, 'jobs', jobToDelete.id));

      // Delete from Supabase
      await supabase
        .from('company_jobs')
        .delete()
        .eq('job_id', jobToDelete.id);

      // Log activity
      await supabase
        .from('company_activities')
        .insert({
          company_id: companyId,
          activity_type: 'job_deleted',
          metadata: { job_id: jobToDelete.id, job_title: jobToDelete.title },
          created_at: new Date().toISOString(),
        });

      showNotification('success', 'Job deleted successfully!');
      setShowDeleteConfirm(false);
      setJobToDelete(null);
    } catch (error) {
      console.error('Error deleting job:', error);
      showNotification('error', 'Failed to delete job. Please try again.');
    }
  };

  const handleToggleStatus = async (job) => {
    try {
      const newStatus = job.status === 'active' ? 'paused' : 'active';
      
      await updateDoc(doc(db, 'jobs', job.id), {
        status: newStatus,
        updatedAt: serverTimestamp(),
      });

      await supabase
        .from('company_jobs')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('job_id', job.id);

      showNotification('success', `Job ${newStatus === 'active' ? 'activated' : 'paused'} successfully!`);
    } catch (error) {
      console.error('Error toggling job status:', error);
      showNotification('error', 'Failed to update job status.');
    }
  };

  const handleDuplicateJob = async (job) => {
    try {
      const { id, createdAt, updatedAt, applicantsCount, views, ...jobData } = job;
      
      await addDoc(collection(db, 'jobs'), {
        ...jobData,
        title: `${job.title} (Copy)`,
        status: 'draft',
        applicantsCount: 0,
        views: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        createdBy: companyId,
      });

      showNotification('success', 'Job duplicated successfully!');
    } catch (error) {
      console.error('Error duplicating job:', error);
      showNotification('error', 'Failed to duplicate job.');
    }
  };

  const handleShareJob = async (job) => {
    try {
      const jobUrl = `${window.location.origin}/jobs/${job.id}`;
      
      if (navigator.share) {
        await navigator.share({
          title: job.title,
          text: `Check out this job opportunity: ${job.title}`,
          url: jobUrl,
        });
      } else {
        await navigator.clipboard.writeText(jobUrl);
        showNotification('success', 'Job link copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing job:', error);
    }
  };

  const handleViewJob = (job) => {
    navigate(`/company/jobs/${job.id}`);
  };

  const handleEditJob = (job) => {
    setSelectedJob(job);
    setShowJobModal(true);
  };

  const handleDeleteClick = (job) => {
    setJobToDelete(job);
    setShowDeleteConfirm(true);
  };

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
              <FaBriefcase className="w-8 h-8 text-blue-600" />
              Job Postings
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Manage your job listings and track applications
            </p>
          </div>

          <button
            onClick={() => {
              setSelectedJob(null);
              setShowJobModal(true);
            }}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            <FaPlus className="w-4 h-4" />
            Post New Job
          </button>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
          {[
            { label: 'Total Jobs', value: stats.total, icon: FaBriefcase, color: 'blue' },
            { label: 'Active', value: stats.active, icon: FaCheckCircle, color: 'green' },
            { label: 'Draft', value: stats.draft, icon: FaFileAlt, color: 'gray' },
            { label: 'Paused', value: stats.paused, icon: FaPause, color: 'yellow' },
            { label: 'Applicants', value: stats.totalApplicants, icon: FaUsers, color: 'purple' },
            { label: 'Views', value: stats.totalViews, icon: FaEye, color: 'indigo' },
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700"
            >
              <div className={`p-2 rounded-lg inline-block mb-2 ${
                stat.color === 'blue' ? 'bg-blue-50 text-blue-600' :
                stat.color === 'green' ? 'bg-green-50 text-green-600' :
                stat.color === 'gray' ? 'bg-gray-100 text-gray-600' :
                stat.color === 'yellow' ? 'bg-yellow-50 text-yellow-600' :
                stat.color === 'purple' ? 'bg-purple-50 text-purple-600' :
                'bg-indigo-50 text-indigo-600'
              }`}>
                <stat.icon className="w-4 h-4" />
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatNumber(stat.value)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 mb-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="relative flex-1 w-full">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search jobs by title, location, or skills..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="flex-1 md:flex-none px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                {JOB_STATUSES.map(status => (
                  <option key={status.value} value={status.value}>{status.label}</option>
                ))}
              </select>

              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="flex-1 md:flex-none px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Types</option>
                {JOB_TYPES.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="flex-1 md:flex-none px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="applicants">Most Applicants</option>
                <option value="views">Most Views</option>
                <option value="title">Title A-Z</option>
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
        ) : filteredJobs.length === 0 ? (
          <EmptyState onAction={() => setShowJobModal(true)} />
        ) : (
          <>
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredJobs.map((job) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    onView={handleViewJob}
                    onEdit={handleEditJob}
                    onDelete={handleDeleteClick}
                    onToggleStatus={handleToggleStatus}
                    onDuplicate={handleDuplicateJob}
                    onShare={handleShareJob}
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredJobs.map((job) => (
                  <JobListItem
                    key={job.id}
                    job={job}
                    onView={handleViewJob}
                    onEdit={handleEditJob}
                    onDelete={handleDeleteClick}
                    onToggleStatus={handleToggleStatus}
                  />
                ))}
              </div>
            )}

            {/* Load More */}
            {hasMore && (
              <div className="text-center mt-8">
                <button
                  onClick={loadMore}
                  className="px-6 py-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-medium border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Load More Jobs
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Job Form Modal */}
      <JobFormModal
        show={showJobModal}
        onClose={() => {
          setShowJobModal(false);
          setSelectedJob(null);
        }}
        onSubmit={selectedJob ? handleUpdateJob : handleCreateJob}
        job={selectedJob}
        loading={saving}
      />

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && jobToDelete && (
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
                    Delete Job
                  </h3>
                  <p className="text-sm text-gray-500">
                    This action cannot be undone
                  </p>
                </div>
              </div>

              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Are you sure you want to delete <strong>{jobToDelete.title}</strong>? 
                All applications for this job will also be removed.
              </p>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteJob}
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors"
                >
                  Delete Job
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CompanyJobs;