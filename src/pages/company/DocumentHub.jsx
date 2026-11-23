// src/pages/company/DocumentHub.jsx
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { FaBullhorn, FaGraduationCap, FaThLarge } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { FaFileAlt, FaUpload, FaDownload, FaTrash, FaSearch, FaFilter, FaFolder, FaFolderPlus, FaFolderOpen, FaFolderMinus, FaFilePdf, FaFileWord, FaFileExcel, FaFilePowerpoint, FaFileImage, FaFileArchive, FaFileAudio, FaFileVideo, FaFileCode, FaFile, FaEye, FaEdit, FaShareAlt, FaCopy, FaCalendarAlt, FaUser, FaSortAmountDown, FaSortAmountUp, FaCloudUploadAlt, FaCheckCircle, FaTimesCircle, FaLock, FaUnlock, FaTags, FaExternalLinkAlt, FaSpinner, FaExclamationTriangle, FaInfoCircle, FaPlus, FaTimes, FaCheck, FaLink, FaBell, FaCog, FaEllipsisV, FaEllipsisH, FaStar, FaRegStar, FaBookmark, FaRegBookmark, FaHistory, FaClock, FaRegClock, FaEllipsisV as FaEllipsisVSolid, FaChartLine, FaChartBar, FaChartPie, FaPercentage, FaHdd, FaDatabase, FaServer, FaCloud, FaWifi, FaDownload as FaDownloadSolid, FaUpload as FaUploadSolid, FaCloudDownloadAlt, FaSync, FaSyncAlt, FaRedo, FaUndo, FaPrint, FaFileExport, FaFileImport, FaFileCsv, FaGoogleDrive, FaDropbox, FaAws, FaWordpress, FaSlack, FaGithub, FaFigma, FaTrello, FaJira, FaEvernote, FaMicrosoft, FaApple, FaWindows, FaLinux, FaAndroid, FaAppStoreIos, FaNodeJs, FaReact, FaVuejs, FaAngular, FaPython, FaJava, FaHtml5, FaCss3Alt, FaJs, FaPhp, FaDocker, FaGitAlt, FaNpm, FaDatabase as FaDatabaseSolid, FaLock as FaLockSolid, FaKey, FaFingerprint, FaShieldAlt, FaUserShield, FaUserLock, FaUserSecret, FaUserNinja, FaUserAstronaut, FaUserSecret as FaUserRobot, FaUserSecret as FaUserAlien, FaUserTie as FaUserCowboy, FaCrown as FaUserCrown, FaUserTie as FaUserEmperor, FaUserTie as FaUserEmpress, FaUserTie as FaUserKing, FaUserTie as FaUserQueen, FaUserTie as FaUserPrince, FaUserTie as FaUserPrincess, FaHatWizard as FaUserWizard, FaUserSecret as FaUserWitch, FaUserNinja as FaUserPirate, FaUserNinja as FaUserSamurai, FaUsers, FaUserFriends, FaUsersCog, FaUserCog, FaUserEdit, FaUserCircle, FaUserTag, FaIdCard, FaAddressCard, FaAddressBook, FaPassport, FaBuilding, FaRegBuilding, FaGlobe, FaLinkedin, FaTwitter, FaFacebook, FaInstagram, FaYoutube, FaWhatsapp, FaTelegram, FaDiscord, FaSlack as FaSlackSolid, FaGithub as FaGithubSolid, FaGitlab, FaBitbucket, FaJira as FaJiraSolid, FaTrello as FaTrelloSolid, FaFigma as FaFigmaSolid, FaDribbble, FaBehance, FaPinterest, FaReddit, FaTumblr, FaFlickr, FaVimeo, FaVimeoV, FaYoutube as FaYoutubeSolid, FaTwitch, FaSpotify, FaSoundcloud, FaItunes, FaGoogle, FaApple as FaAppleSolid, FaAmazon, FaPaypal, FaCcVisa, FaCcMastercard, FaCcAmex, FaCcPaypal, FaCcStripe, FaBitcoin, FaEthereum, FaWallet, FaCreditCard, FaReceipt, FaFileInvoice, FaFileInvoiceDollar, FaMoneyBill, FaMoneyBillWave, FaMoneyCheck, FaMoneyCheckAlt, FaCoins, FaPiggyBank, FaDonate, FaHandHoldingUsd, FaHandHoldingHeart, FaHandshake, FaHandsHelping, FaPrayingHands, FaHeart, FaRegHeart, FaThumbsUp, FaRegThumbsUp, FaThumbsDown, FaRegThumbsDown, FaComment, FaRegComment, FaComments, FaRegComments, FaCommentDots, FaRegCommentDots, FaCommentAlt, FaRegCommentAlt, FaPaperPlane, FaRegPaperPlane, FaShare, FaRetweet, FaReply, FaReplyAll, FaForward, FaQuoteLeft, FaQuoteRight, FaParagraph, FaHashtag, FaAt, FaAsterisk, FaInfo, FaQuestion, FaExclamation, FaCheckDouble, FaRegSmile, FaSmile, FaRegLaugh, FaLaugh, FaRegGrin, FaGrin, FaRegGrinBeam, FaGrinBeam, FaGrinStars, FaGrinHearts, FaGrinTears, FaGrinTongue, FaGrinTongueSquint, FaGrinTongueWink, FaGrinWink, FaGrinSquint, FaGrinSquintTears, FaGrinAlt, FaGrimace, FaMeh, FaMehBlank, FaMehRollingEyes, FaFrown, FaFrownOpen, FaSadCry, FaSadTear, FaSurprise, FaFlushed, FaDizzy, FaTired, FaAngry, FaKiss, FaKissBeam, FaKissWinkHeart, FaLaughBeam, FaLaughSquint, FaLaughWink, FaSmileBeam, FaSmileWink, FaHeart as FaHeartSolid, FaStar as FaStarSolid, FaFire, FaBolt, FaSnowflake, FaSun, FaMoon, FaCloudSun, FaCloudMoon, FaCloudRain, FaUmbrella, FaWind, FaWater, FaLeaf, FaSeedling, FaTree, FaSpa, FaHotTub, FaUmbrellaBeach, FaPlane, FaRocket, FaSpaceShuttle, FaSatellite, FaUserAstronaut as FaUserAstronautSolid, FaGlobeAmericas, FaGlobeEurope, FaGlobeAsia, FaGlobeAfrica, FaMap, FaMapMarked, FaMapMarkedAlt, FaMapPin, FaDirections, FaRoute, FaCompass, FaCrosshairs, FaLocationArrow, FaCar, FaBus, FaTrain, FaSubway, FaBicycle, FaWalking, FaRunning, FaHome, FaWarehouse, FaIndustry, FaStore, FaShoppingCart, FaShoppingBag, FaShoppingBasket, FaCashRegister, FaBox, FaBoxes, FaPallet, FaTruck, FaTruckLoading, FaTruckMoving, FaShip, FaRocket as FaRocketSolid, FaSatelliteDish, FaBroadcastTower, FaRss, FaPodcast, FaMicrophone, FaMicrophoneAlt, FaHeadphones, FaHeadphonesAlt, FaVolumeUp, FaVolumeMute, FaVolumeDown, FaMusic, FaFilm, FaVideo, FaCamera, FaCameraRetro, FaPhotoVideo, FaImages, FaImage, FaKeyboard, FaMouse, FaDesktop, FaLaptop, FaTabletAlt, FaMobileAlt, FaPrint as FaPrintSolid, FaFax, FaVoicemail, FaInbox, FaPaperclip, FaLink as FaLinkSolid, FaUnlink, FaAnchor, FaHdd as FaHddSolid, FaMemory, FaMicrochip, FaPlug, FaChargingStation, FaBatteryFull, FaBatteryHalf, FaBatteryQuarter, FaBatteryEmpty } from "react-icons/fa";
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
import supabaseMediaService from '../../services/supabaseMediaService';

// ============================================
// CONSTANTS
// ============================================

const DOCUMENT_CATEGORIES = [
  { value: 'general', label: 'General', icon: FaFileAlt, color: 'gray' },
  { value: 'hr-policies', label: 'HR Policies', icon: FaUsers, color: 'blue' },
  { value: 'templates', label: 'Templates', icon: FaFileAlt, color: 'green' },
  { value: 'reports', label: 'Reports', icon: FaChartBar, color: 'purple' },
  { value: 'legal', label: 'Legal', icon: FaFileAlt, color: 'red' },
  { value: 'marketing', label: 'Marketing', icon: FaBullhorn, color: 'orange' },
  { value: 'technical', label: 'Technical', icon: FaFileCode, color: 'indigo' },
  { value: 'training', label: 'Training', icon: FaGraduationCap, color: 'teal' },
  { value: 'contracts', label: 'Contracts', icon: FaFileAlt, color: 'pink' },
  { value: 'invoices', label: 'Invoices', icon: FaFileInvoice, color: 'yellow' },
];

const ACCESS_LEVELS = [
  { value: 'private', label: 'Private', description: 'Only you can access', icon: FaLock },
  { value: 'team', label: 'Team', description: 'All team members can access', icon: FaUsers },
  { value: 'public', label: 'Public', description: 'Anyone with the link', icon: FaGlobe },
];

const ALLOWED_FILE_TYPES = {
  'application/pdf': { ext: 'pdf', icon: FaFilePdf, color: 'text-red-500', label: 'PDF' },
  'application/msword': { ext: 'doc', icon: FaFileWord, color: 'text-blue-600', label: 'Word' },
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': { ext: 'docx', icon: FaFileWord, color: 'text-blue-600', label: 'Word' },
  'application/vnd.ms-excel': { ext: 'xls', icon: FaFileExcel, color: 'text-green-600', label: 'Excel' },
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': { ext: 'xlsx', icon: FaFileExcel, color: 'text-green-600', label: 'Excel' },
  'application/vnd.ms-powerpoint': { ext: 'ppt', icon: FaFilePowerpoint, color: 'text-orange-500', label: 'PowerPoint' },
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': { ext: 'pptx', icon: FaFilePowerpoint, color: 'text-orange-500', label: 'PowerPoint' },
  'image/jpeg': { ext: 'jpg', icon: FaFileImage, color: 'text-purple-500', label: 'Image' },
  'image/png': { ext: 'png', icon: FaFileImage, color: 'text-purple-500', label: 'Image' },
  'image/gif': { ext: 'gif', icon: FaFileImage, color: 'text-purple-500', label: 'Image' },
  'image/webp': { ext: 'webp', icon: FaFileImage, color: 'text-purple-500', label: 'Image' },
  'text/plain': { ext: 'txt', icon: FaFileAlt, color: 'text-gray-500', label: 'Text' },
  'text/csv': { ext: 'csv', icon: FaFileCsv, color: 'text-green-500', label: 'CSV' },
  'application/zip': { ext: 'zip', icon: FaFileArchive, color: 'text-yellow-500', label: 'ZIP' },
  'application/x-rar-compressed': { ext: 'rar', icon: FaFileArchive, color: 'text-yellow-500', label: 'RAR' },
};

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

// ============================================
// UTILITY FUNCTIONS
// ============================================

const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

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

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 30) return `${diffDays}d ago`;
  return formatDate(past);
};

const getFileInfo = (mimeType, fileName = '') => {
  if (ALLOWED_FILE_TYPES[mimeType]) {
    return ALLOWED_FILE_TYPES[mimeType];
  }
  
  const ext = fileName.split('.').pop()?.toLowerCase();
  const fallback = Object.values(ALLOWED_FILE_TYPES).find(t => t.ext === ext);
  
  return fallback || { ext: ext || 'file', icon: FaFile, color: 'text-gray-500', label: 'File' };
};

const getCategoryConfig = (category) => {
  return DOCUMENT_CATEGORIES.find(c => c.value === category) || DOCUMENT_CATEGORIES[0];
};

// ============================================
// CUSTOM HOOKS
// ============================================

const useDocuments = (companyId) => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!companyId) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'companyDocuments'),
      where('companyId', '==', companyId),
      orderBy('uploadedAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const docs = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          uploadedAt: doc.data().uploadedAt?.toDate?.() || doc.data().uploadedAt,
          updatedAt: doc.data().updatedAt?.toDate?.() || doc.data().updatedAt,
        }));
        setDocuments(docs);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching documents:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [companyId]);

  return { documents, loading, error };
};

// ============================================
// COMPONENTS
// ============================================

const LoadingSkeleton = () => (
  <div className="space-y-3">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-4 animate-pulse">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
          <div className="flex-1">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          </div>
        </div>
      </div>
    ))}
  </div>
);

const EmptyState = ({ onUpload, hasFilters }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="text-center py-16"
  >
    <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
      <FaFolderOpen className="w-12 h-12 text-gray-400" />
    </div>
    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
      {hasFilters ? 'No documents match your filters' : 'No documents yet'}
    </h3>
    <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
      {hasFilters
        ? 'Try adjusting your search or filter criteria.'
        : 'Upload your first document to start organizing your company files.'}
    </p>
    <button
      onClick={onUpload}
      className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
    >
      <FaCloudUploadAlt className="w-4 h-4" />
      Upload Document
    </button>
  </motion.div>
);

const DocumentCard = ({
  document,
  onView,
  onDownload,
  onEdit,
  onDelete,
  onShare,
  onToggleFavorite,
  isFavorite,
  viewMode = 'grid',
}) => {
  const fileInfo = getFileInfo(document.fileType, document.fileName);
  const categoryConfig = getCategoryConfig(document.category);
  const FileIcon = fileInfo.icon;
  const [showMenu, setShowMenu] = useState(false);

  const isImage = document.fileType?.startsWith('image/');

  if (viewMode === 'list') {
    return (
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all"
      >
        <div className="w-12 h-12 rounded-lg bg-gray-50 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
          <FileIcon className={`w-6 h-6 ${fileInfo.color}`} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-medium text-gray-900 dark:text-white truncate">
              {document.name}
            </h4>
            {isFavorite && <FaStar className="w-3.5 h-3.5 text-yellow-500 flex-shrink-0" />}
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span>{fileInfo.label}</span>
            <span>•</span>
            <span>{formatFileSize(document.fileSize)}</span>
            <span>•</span>
            <span>{formatTimeAgo(document.uploadedAt)}</span>
          </div>
        </div>

        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
          document.accessLevel === 'public' 
            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
            : document.accessLevel === 'team'
            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
        }`}>
          {document.accessLevel || 'private'}
        </span>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onToggleFavorite(document)}
            className={`p-2 rounded-lg transition-colors ${
              isFavorite
                ? 'text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/20'
                : 'text-gray-400 hover:text-yellow-500 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            {isFavorite ? <FaStar className="w-4 h-4" /> : <FaRegStar className="w-4 h-4" />}
          </button>
          <button
            onClick={() => onView(document)}
            className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <FaEye className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDownload(document)}
            className="p-2 text-gray-400 hover:text-green-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <FaDownload className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(document)}
            className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <FaTrash className="w-4 h-4" />
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
      className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all overflow-hidden"
    >
      {/* Preview */}
      <div className="relative aspect-[4/3] bg-gray-50 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
        {isImage && document.downloadURL ? (
          <img
            src={document.downloadURL}
            alt={document.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        ) : (
          <div className="flex flex-col items-center justify-center">
            <FileIcon className={`w-16 h-16 ${fileInfo.color}`} />
            <p className="text-xs text-gray-400 mt-2">{fileInfo.label}</p>
          </div>
        )}

        {/* Favorite Badge */}
        {isFavorite && (
          <div className="absolute top-2 right-2 bg-yellow-500 rounded-full p-1.5">
            <FaStar className="w-3 h-3 text-white" />
          </div>
        )}

        {/* Menu */}
        <div className="absolute top-2 left-2">
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1.5 bg-white/80 dark:bg-gray-900/80 backdrop-blur rounded-lg hover:bg-white dark:hover:bg-gray-900 transition-colors"
            >
              <FaEllipsisV className="w-3 h-3 text-gray-600 dark:text-gray-300" />
            </button>

            <AnimatePresence>
              {showMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="absolute left-0 top-full mt-1 w-40 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-100 dark:border-gray-700 py-1 z-20"
                  >
                    <button
                      onClick={() => { onView(document); setShowMenu(false); }}
                      className="w-full px-3 py-2 text-left text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                    >
                      <FaEye className="w-3 h-3" /> View
                    </button>
                    <button
                      onClick={() => { onDownload(document); setShowMenu(false); }}
                      className="w-full px-3 py-2 text-left text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                    >
                      <FaDownload className="w-3 h-3" /> Download
                    </button>
                    <button
                      onClick={() => { onShare(document); setShowMenu(false); }}
                      className="w-full px-3 py-2 text-left text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                    >
                      <FaShareAlt className="w-3 h-3" /> Share
                    </button>
                    <button
                      onClick={() => { onToggleFavorite(document); setShowMenu(false); }}
                      className="w-full px-3 py-2 text-left text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                    >
                      {isFavorite ? <FaStar className="w-3 h-3" /> : <FaRegStar className="w-3 h-3" />}
                      {isFavorite ? 'Remove' : 'Favorite'}
                    </button>
                    <div className="border-t border-gray-100 dark:border-gray-700 my-1" />
                    <button
                      onClick={() => { onDelete(document); setShowMenu(false); }}
                      className="w-full px-3 py-2 text-left text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                    >
                      <FaTrash className="w-3 h-3" /> Delete
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <h4 className="font-medium text-gray-900 dark:text-white truncate mb-1">
          {document.name}
        </h4>
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
          <span>{fileInfo.label}</span>
          <span>•</span>
          <span>{formatFileSize(document.fileSize)}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
            document.accessLevel === 'public' 
              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
              : document.accessLevel === 'team'
              ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
          }`}>
            {document.accessLevel || 'private'}
          </span>
          <span className="text-xs text-gray-400">
            {formatTimeAgo(document.uploadedAt)}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

const UploadModal = ({ show, onClose, onUpload, loading }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'general',
    accessLevel: 'private',
    tags: [],
    newTag: '',
  });
  const [file, setFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = (selectedFile) => {
    if (!selectedFile) return;

    // Validate file size
    if (selectedFile.size > MAX_FILE_SIZE) {
      setErrors({ file: `File is too large (max ${formatFileSize(MAX_FILE_SIZE)})` });
      return;
    }

    // Validate file type
    if (!ALLOWED_FILE_TYPES[selectedFile.type]) {
      // Check extension
      const ext = selectedFile.name.split('.').pop()?.toLowerCase();
      const validExt = Object.values(ALLOWED_FILE_TYPES).some(t => t.ext === ext);
      if (!validExt) {
        setErrors({ file: 'File type not supported' });
        return;
      }
    }

    setFile(selectedFile);
    setFormData(prev => ({
      ...prev,
      name: prev.name || selectedFile.name.replace(/\.[^/.]+$/, ''),
    }));
    setErrors({});
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    handleFileSelect(e.dataTransfer.files?.[0]);
  };

  const handleAddTag = () => {
    const tag = formData.newTag.trim();
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag],
        newTag: '',
      }));
    }
  };

  const handleRemoveTag = (tag) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!file) newErrors.file = 'Please select a file';
    if (!formData.name.trim()) newErrors.name = 'Document name is required';
    if (!formData.category) newErrors.category = 'Category is required';

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      onUpload({ ...formData, file });
    }
  };

  if (!show) return null;

  const selectedCategory = DOCUMENT_CATEGORIES.find(c => c.value === formData.category);

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
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <FaCloudUploadAlt className="w-5 h-5 text-blue-600" />
              Upload Document
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <FaTimes className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
            {/* File Drop Zone */}
            <div>
              <div
                className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                  dragActive
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : errors.file
                    ? 'border-red-500'
                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                }`}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                onDragLeave={() => setDragActive(false)}
                onDrop={handleDrop}
              >
                {file ? (
                  <div className="flex items-center justify-center gap-3">
                    {(() => {
                      const info = getFileInfo(file.type, file.name);
                      const Icon = info.icon;
                      return <Icon className={`w-10 h-10 ${info.color}`} />;
                    })()}
                    <div className="text-left">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {file.name}
                      </p>
                      <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFile(null);
                      }}
                      className="p-2 text-gray-400 hover:text-red-500"
                    >
                      <FaTimes className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <FaCloudUploadAlt className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-sm text-gray-500">
                      PDF, Word, Excel, Images up to {formatFileSize(MAX_FILE_SIZE)}
                    </p>
                  </>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={(e) => handleFileSelect(e.target.files?.[0])}
                  accept={Object.keys(ALLOWED_FILE_TYPES).join(',')}
                />
              </div>
              {errors.file && (
                <p className="mt-2 text-sm text-red-500">{errors.file}</p>
              )}
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Document Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter document name"
                className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.name ? 'border-red-500' : 'border-gray-200 dark:border-gray-600'
                }`}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-500">{errors.name}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
                placeholder="Add a description (optional)"
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            {/* Category & Access */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {DOCUMENT_CATEGORIES.slice(0, 6).map(cat => (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, category: cat.value })}
                      className={`p-2 rounded-lg border-2 text-xs font-medium transition-all ${
                        formData.category === cat.value
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600'
                          : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                      }`}
                    >
                      <cat.icon className="w-4 h-4 mx-auto mb-1" />
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Access Level
                </label>
                <div className="space-y-2">
                  {ACCESS_LEVELS.map(level => (
                    <button
                      key={level.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, accessLevel: level.value })}
                      className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
                        formData.accessLevel === level.value
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <level.icon className={`w-4 h-4 ${
                          formData.accessLevel === level.value ? 'text-blue-600' : 'text-gray-400'
                        }`} />
                        <div>
                          <p className={`text-sm font-medium ${
                            formData.accessLevel === level.value
                              ? 'text-blue-600'
                              : 'text-gray-900 dark:text-white'
                          }`}>
                            {level.label}
                          </p>
                          <p className="text-xs text-gray-500">{level.description}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <FaTags className="w-3.5 h-3.5 inline mr-1" />
                Tags
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full text-sm"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-blue-800"
                    >
                      <FaTimes className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formData.newTag}
                  onChange={(e) => setFormData({ ...formData, newTag: e.target.value })}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  placeholder="Add tags (press Enter)"
                  className="flex-1 px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <FaPlus className="w-4 h-4" />
                </button>
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
              disabled={loading || !file}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <FaSpinner className="w-4 h-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <FaUpload className="w-4 h-4" />
                  Upload Document
                </>
              )}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

const ShareModal = ({ show, onClose, document }) => {
  const [copied, setCopied] = useState(false);

  if (!show || !document) return null;

  const shareUrl = document.downloadURL || `${window.location.origin}/documents/${document.id}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Error copying:', error);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Share Document
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <FaTimes className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg mb-4">
            {(() => {
              const info = getFileInfo(document.fileType, document.fileName);
              const Icon = info.icon;
              return <Icon className={`w-6 h-6 ${info.color}`} />;
            })()}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 dark:text-white truncate">
                {document.name}
              </p>
              <p className="text-xs text-gray-500">
                {formatFileSize(document.fileSize)}
              </p>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Share Link
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="flex-1 px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm text-gray-600 dark:text-gray-400"
              />
              <button
                onClick={handleCopy}
                className={`px-4 py-2.5 rounded-xl font-medium transition-colors flex items-center gap-2 ${
                  copied
                    ? 'bg-green-600 text-white'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {copied ? <FaCheck className="w-4 h-4" /> : <FaCopy className="w-4 h-4" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={`mailto:?subject=Document: ${document.name}&body=Check out this document: ${shareUrl}`}
              className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
            >
              <FaPaperPlane className="w-4 h-4" />
              Email
            </a>
            <a
              href={`https://wa.me/?text=${encodeURIComponent(`Check out: ${shareUrl}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
            >
              <FaWhatsapp className="w-4 h-4" />
              WhatsApp
            </a>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================

const DocumentHub = () => {
  const navigate = useNavigate();
  const { currentUser, userProfile } = useAuth();
  const { showNotification } = useNotification();

  const companyId = userProfile?.companyId || currentUser?.companyId || currentUser?.uid;
  const { documents, loading, error } = useDocuments(companyId);

  // Local state
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [accessFilter, setAccessFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [viewMode, setViewMode] = useState('grid');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [documentToShare, setDocumentToShare] = useState(null);
  const [documentToDelete, setDocumentToDelete] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [favorites, setFavorites] = useState(new Set());

  // Load favorites from localStorage (per company)
  useEffect(() => {
    if (!companyId) return;
    const stored = localStorage.getItem(`docFavorites_${companyId}`);
    if (stored) {
      try {
        setFavorites(new Set(JSON.parse(stored)));
      } catch (e) {
        console.error('Failed to parse favorites:', e);
      }
    }
  }, [companyId]);

  // Save favorites
  useEffect(() => {
    if (!companyId) return;
    localStorage.setItem(`docFavorites_${companyId}`, JSON.stringify([...favorites]));
  }, [favorites, companyId]);

  // Stats
  const stats = useMemo(() => {
    const totalSize = documents.reduce((sum, d) => sum + (d.fileSize || 0), 0);
    
    const byCategory = {};
    documents.forEach(d => {
      byCategory[d.category] = (byCategory[d.category] || 0) + 1;
    });

    const byType = {};
    documents.forEach(d => {
      const ext = d.fileName?.split('.').pop()?.toLowerCase() || 'other';
      const info = getFileInfo(d.fileType, d.fileName);
      const key = info.label;
      byType[key] = (byType[key] || 0) + 1;
    });

    return {
      total: documents.length,
      totalSize,
      byCategory,
      byType,
      favorites: favorites.size,
    };
  }, [documents, favorites]);

  // Filtered documents
  const filteredDocuments = useMemo(() => {
    let filtered = [...documents];

    // Search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(doc =>
        (doc.name?.toLowerCase() || '').includes(term) ||
        (doc.description?.toLowerCase() || '').includes(term) ||
        (doc.tags || []).some(tag => tag.toLowerCase().includes(term))
      );
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(d => d.category === categoryFilter);
    }

    // Access filter
    if (accessFilter !== 'all') {
      filtered = filtered.filter(d => d.accessLevel === accessFilter);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.uploadedAt) - new Date(a.uploadedAt);
        case 'oldest':
          return new Date(a.uploadedAt) - new Date(b.uploadedAt);
        case 'name':
          return (a.name || '').localeCompare(b.name || '');
        case 'size':
          return (b.fileSize || 0) - (a.fileSize || 0);
        case 'favorites': {
          const aFav = favorites.has(a.id) ? 1 : 0;
          const bFav = favorites.has(b.id) ? 1 : 0;
          return bFav - aFav;
        }
        default:
          return 0;
      }
    });

    return filtered;
  }, [documents, searchTerm, categoryFilter, accessFilter, sortBy, favorites]);

  // ============================================
  // HANDLERS
  // ============================================

  const handleUpload = async (formData) => {
    if (!companyId || !formData.file) return;

    try {
      setUploading(true);

      // Upload to supabase
      const isImage = formData.file.type.startsWith('image/');
      const result = isImage
        ? await supabaseMediaService.uploadImage(formData.file, {
            folder: `career-connect/company-documents/${companyId}`,
            publicId: `${companyId}-${Date.now()}-${formData.file.name.replace(/[^a-z0-9]/gi, '_')}`,
          })
        : await supabaseMediaService.uploadFile(formData.file, {
            folder: `career-connect/company-documents/${companyId}`,
            publicId: `${companyId}-${Date.now()}-${formData.file.name.replace(/[^a-z0-9]/gi, '_')}`,
            resourceType: 'raw',
          });

      if (!result.success) {
        throw new Error(result.error || 'Upload failed');
      }

      // Save to Firebase
      const docData = {
        companyId,
        name: formData.name,
        description: formData.description,
        category: formData.category,
        accessLevel: formData.accessLevel,
        tags: formData.tags,
        fileName: formData.file.name,
        fileType: formData.file.type,
        fileSize: formData.file.size,
        downloadURL: result.url,
        supabaseId: result.publicId,
        uploadedBy: companyId,
        uploadedByName: userProfile?.displayName || userProfile?.companyName || 'Company',
        uploadedAt: serverTimestamp(),
        views: 0,
        downloads: 0,
      };

      await addDoc(collection(db, 'companyDocuments'), docData);

      // Sync to Supabase
      await supabase
        .from('company_documents')
        .insert({
          company_id: companyId,
          name: formData.name,
          category: formData.category,
          file_type: formData.file.type,
          file_size: formData.file.size,
          url: result.url,
          created_at: new Date().toISOString(),
        });

      // Log activity
      await addDoc(collection(db, 'companyActivities'), {
        companyId,
        type: 'document_uploaded',
        description: `Uploaded document: ${formData.name}`,
        createdAt: serverTimestamp(),
      });

      showNotification('success', 'Document uploaded successfully!');
      setShowUploadModal(false);
    } catch (error) {
      console.error('Error uploading document:', error);
      showNotification('error', 'Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  const handleView = async (doc) => {
    try {
      // Increment view count
      await updateDoc(doc(db, 'companyDocuments', doc.id), {
        views: increment(1),
      });

      // Open in new tab
      if (doc.downloadURL) {
        window.open(doc.downloadURL, '_blank');
      }
    } catch (error) {
      console.error('Error viewing document:', error);
    }
  };

  const handleDownload = async (doc) => {
    try {
      // Increment download count
      await updateDoc(doc(db, 'companyDocuments', doc.id), {
        downloads: increment(1),
      });

      // Create a temporary anchor to trigger download
      const link = document.createElement('a');
      link.href = doc.downloadURL;
      link.download = doc.fileName || doc.name;
      link.target = '_blank';
      link.click();

      showNotification('success', 'Download started');
    } catch (error) {
      console.error('Error downloading document:', error);
      showNotification('error', 'Failed to download document');
    }
  };

  const handleShare = (doc) => {
    setDocumentToShare(doc);
    setShowShareModal(true);
  };

  const handleDeleteClick = (doc) => {
    setDocumentToDelete(doc);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!documentToDelete) return;

    try {
      // Delete from supabase
      if (documentToDelete.supabaseId) {
        try {
          await supabaseMediaService.deleteFile(
            documentToDelete.supabaseId,
            documentToDelete.fileType?.startsWith('image/') ? 'image' : 'raw'
          );
        } catch (err) {
          console.log('Could not delete from supabase:', err);
        }
      }

      // Delete from Firebase
      await deleteDoc(doc(db, 'companyDocuments', documentToDelete.id));

      // Delete from Supabase
      await supabase
        .from('company_documents')
        .delete()
        .eq('company_id', companyId)
        .eq('name', documentToDelete.name);

      showNotification('success', 'Document deleted successfully');
      setShowDeleteConfirm(false);
      setDocumentToDelete(null);
    } catch (error) {
      console.error('Error deleting document:', error);
      showNotification('error', 'Failed to delete document');
    }
  };

  const handleToggleFavorite = (doc) => {
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(doc.id)) {
        next.delete(doc.id);
        showNotification('info', 'Removed from favorites');
      } else {
        next.add(doc.id);
        showNotification('success', 'Added to favorites');
      }
      return next;
    });
  };

  const clearFilters = () => {
    setSearchTerm('');
    setCategoryFilter('all');
    setAccessFilter('all');
    setSortBy('recent');
  };

  const hasFilters = searchTerm || categoryFilter !== 'all' || accessFilter !== 'all';

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
              <FaFolderOpen className="w-8 h-8 text-blue-600" />
              Document Hub
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Store and manage all your company documents in one place
            </p>
          </div>

          <button
            onClick={() => setShowUploadModal(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <FaCloudUploadAlt className="w-4 h-4" />
            Upload Document
          </button>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700"
          >
            <div className="p-2.5 rounded-lg bg-blue-50 dark:bg-blue-900/20 w-fit mb-3">
              <FaFileAlt className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {formatNumber(stats.total)}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Total Documents
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700"
          >
            <div className="p-2.5 rounded-lg bg-purple-50 dark:bg-purple-900/20 w-fit mb-3">
              <FaHdd className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {formatFileSize(stats.totalSize)}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Storage Used
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700"
          >
            <div className="p-2.5 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 w-fit mb-3">
              <FaStar className="w-5 h-5 text-yellow-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {formatNumber(stats.favorites)}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Favorites
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700"
          >
            <div className="p-2.5 rounded-lg bg-green-50 dark:bg-green-900/20 w-fit mb-3">
              <FaFolder className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {Object.keys(stats.byCategory).length}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Categories
            </p>
          </motion.div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 mb-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="relative flex-1 w-full">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search documents by name, description, or tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Categories</option>
                {DOCUMENT_CATEGORIES.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>

              <select
                value={accessFilter}
                onChange={(e) => setAccessFilter(e.target.value)}
                className="px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Access</option>
                <option value="private">Private</option>
                <option value="team">Team</option>
                <option value="public">Public</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="recent">Most Recent</option>
                <option value="oldest">Oldest First</option>
                <option value="name">Name A-Z</option>
                <option value="size">Largest First</option>
                <option value="favorites">Favorites First</option>
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
        ) : filteredDocuments.length === 0 ? (
          <EmptyState
            onUpload={() => setShowUploadModal(true)}
            hasFilters={hasFilters}
          />
        ) : (
          <div className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'
              : 'space-y-3'
          }>
            {filteredDocuments.map((doc) => (
              <DocumentCard
                key={doc.id}
                document={doc}
                onView={handleView}
                onDownload={handleDownload}
                onEdit={() => showNotification('info', 'Edit coming soon')}
                onDelete={handleDeleteClick}
                onShare={handleShare}
                onToggleFavorite={handleToggleFavorite}
                isFavorite={favorites.has(doc.id)}
                viewMode={viewMode}
              />
            ))}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      <UploadModal
        show={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onUpload={handleUpload}
        loading={uploading}
      />

      {/* Share Modal */}
      <ShareModal
        show={showShareModal}
        onClose={() => {
          setShowShareModal(false);
          setDocumentToShare(null);
        }}
        document={documentToShare}
      />

      {/* Delete Confirmation */}
      <AnimatePresence>
        {showDeleteConfirm && documentToDelete && (
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
                    Delete Document
                  </h3>
                  <p className="text-sm text-gray-500">
                    This action cannot be undone
                  </p>
                </div>
              </div>

              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Are you sure you want to delete{' '}
                <strong>{documentToDelete.name}</strong>? The file will be permanently removed.
              </p>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DocumentHub;
