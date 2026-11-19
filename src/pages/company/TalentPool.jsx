// src/pages/company/TalentPool.jsx
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FaBookmark, FaRegBookmark, FaUsers, FaUserGraduate, FaUserTie, FaStar, FaRegStar, FaSearch, FaFilter, FaSort, FaSortAmountDown, FaSortAmountUp, FaEye, FaCommentDots, FaEnvelope, FaPhone, FaMapMarkerAlt, FaGraduationCap, FaBriefcase, FaCheckCircle, FaTimesCircle, FaClock, FaCalendarAlt, FaSpinner, FaExclamationTriangle, FaInfoCircle, FaPlus, FaTimes, FaCheck, FaDownload, FaFileExport, FaExternalLinkAlt, FaUserPlus, FaUserMinus, FaPaperPlane, FaTh, FaList, FaThLarge, FaEllipsisV, FaHeart, FaRegHeart, FaTrash, FaEdit, FaLink, FaShare, FaShareAlt, FaCopy, FaTags, FaTag, FaHashtag, FaFolder, FaFolderPlus, FaFolderOpen, FaLayerGroup, FaRocket, FaBolt, FaFire, FaSnowflake, FaSun, FaMoon, FaBrain, FaRobot, FaMagic, FaLightbulb, FaChartLine, FaPercentage, FaAward, FaTrophy, FaMedal, FaCrown, FaGem, FaHandshake, FaHandsHelping, FaUserFriends, FaUsersCog, FaUserCog, FaUserEdit, FaUserCircle, FaUserTag, FaIdCard, FaAddressCard, FaAddressBook, FaPassport, FaBuilding, FaGlobe, FaLinkedin, FaGithub, FaTwitter, FaFacebook, FaInstagram, FaYoutube, FaDribbble, FaBehance, FaMedium, FaStackOverflow, FaWhatsapp, FaTelegram, FaSlack, FaDiscord, FaArrowUp, FaArrowDown, FaArrowLeft, FaArrowRight, FaChevronLeft, FaChevronRight, FaChevronDown, FaChevronUp, FaRegClock, FaRegCalendar, FaRegCommentDots, FaRegEnvelope, FaRegUserCircle, FaUserCircle as FaUserCircleSolid, FaCode, FaLaptopCode, FaDatabase, FaCloud, FaMobile, FaDesktop, FaShieldAlt, FaWifi, FaHeart as FaHeartSolid, FaStar as FaStarSolid, FaBookmark as FaBookmarkSolid, FaTrashAlt, FaRegTrashAlt, FaRegSmile, FaSmile, FaGrin, FaGrinBeam, FaGrinStars, FaGrinHearts, FaLaugh, FaMeh, FaFrown, FaThumbsUp, FaRegThumbsUp, FaThumbsDown, FaRegThumbsDown, FaComment, FaRegComment, FaComments, FaRegComments, FaBell, FaRegBell, FaHistory, FaUndo, FaRedo, FaSync, FaSyncAlt, FaCog, FaSlidersH, FaToggleOn, FaToggleOff, FaLock, FaUnlock, FaKey, FaFingerprint, FaUserShield, FaUserLock, FaUserSecret, FaUserNinja, FaUserAstronaut, FaUserSecret as FaUserRobot, FaUserSecret as FaUserAlien, FaUserTie as FaUserCowboy, FaUserTie as FaUserKing, FaUserTie as FaUserQueen, FaUserTie as FaUserPrince, FaUserTie as FaUserPrincess, FaHatWizard as FaUserWizard, FaUserSecret as FaUserWitch, FaUserNinja as FaUserPirate, FaUserNinja as FaUserSamurai, FaFolderMinus, FaBox, FaBoxes, FaArchive, FaFileAlt, FaRegFileAlt, FaFilePdf, FaFileWord, FaFileExcel, FaFilePowerpoint, FaFileImage, FaFileVideo, FaFileAudio, FaFileArchive, FaFileCode, FaFile, FaImages, FaImage, FaVideo, FaCamera, FaMicrophone, FaMusic, FaHeadphones, FaPlay, FaPause, FaStop, FaPalette, FaPaintBrush, FaRuler, FaDraftingCompass, FaVectorSquare, FaShapes, FaCube, FaCubes, FaObjectGroup, FaObjectUngroup, FaFill, FaEyeDropper, FaSwatchbook, FaCut, FaPaste, FaCopy as FaCopySolid, FaEllipsisH, FaGripHorizontal, FaGripVertical, FaGripLines, FaDotCircle, FaRegDotCircle, FaCircle, FaRegCircle, FaSquare, FaRegSquare, FaCheckSquare, FaRegCheckSquare, FaMinusSquare, FaPlusSquare, FaChartBar, FaChartPie, FaChartArea, FaBullseye, FaBullhorn, FaNewspaper, FaBook, FaBookOpen, FaClipboard, FaClipboardCheck, FaClipboardList, FaTasks, FaProjectDiagram, FaSitemap, FaNetworkWired, FaServer, FaMemory, FaMicrochip, FaHdd, FaKeyboard, FaMouse, FaPrint, FaTshirt, FaShoePrints, FaSocks, FaMitten, FaCoffee, FaMugHot, FaUtensils, FaHamburger, FaPizzaSlice, FaHotdog, FaIceCream, FaBirthdayCake, FaCookie, FaCandyCane, FaCarrot, FaLemon, FaPepperHot, FaEgg, FaCheese, FaBreadSlice, FaAppleAlt, FaHeartbeat, FaStethoscope, FaUserMd, FaUserNurse, FaPills, FaSyringe, FaMicroscope, FaDna, FaAtom, FaVirus, FaLeaf, FaSeedling, FaTree, FaSpa, FaUmbrellaBeach, FaPlane, FaCar, FaBus, FaTrain, FaShip, FaBicycle, FaWalking, FaRunning, FaHome, FaWarehouse, FaIndustry, FaStore, FaShoppingCart, FaShoppingBag, FaTruck } from "react-icons/fa";
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

const POOL_FILTERS = [
  { value: 'all', label: 'All Candidates' },
  { value: 'high-match', label: 'High Match (80%+)' },
  { value: 'available', label: 'Available Now' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'interviewed', label: 'Interviewed' },
];

const SORT_OPTIONS = [
  { value: 'recent', label: 'Recently Added' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'name', label: 'Name A-Z' },
  { value: 'matchScore', label: 'Match Score' },
  { value: 'experience', label: 'Experience' },
];

const TAGS = [
  'frontend', 'backend', 'fullstack', 'mobile', 'design',
  'marketing', 'sales', 'manager', 'intern', 'senior',
  'remote', 'onsite', 'contract', 'fulltime', 'parttime',
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
  if (!date) return 'Recently';
  const now = new Date();
  const past = date instanceof Date ? date : date?.toDate?.() || new Date(date);
  if (isNaN(past.getTime())) return 'Recently';

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

const getMatchScoreConfig = (score) => {
  if (score >= 90) return { bg: 'bg-green-500', text: 'text-green-600', label: 'Excellent' };
  if (score >= 80) return { bg: 'bg-blue-500', text: 'text-blue-600', label: 'Great' };
  if (score >= 70) return { bg: 'bg-yellow-500', text: 'text-yellow-600', label: 'Good' };
  if (score >= 60) return { bg: 'bg-orange-500', text: 'text-orange-600', label: 'Fair' };
  return { bg: 'bg-red-500', text: 'text-red-600', label: 'Low' };
};

// ============================================
// CUSTOM HOOKS
// ============================================

const useTalentPool = (companyId) => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!companyId) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'savedCandidates'),
      where('companyId', '==', companyId),
      orderBy('savedAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      async (snapshot) => {
        const candidatesData = await Promise.all(
          snapshot.docs.map(async (docSnapshot) => {
            const data = docSnapshot.data();
            
            // Fetch candidate details
            let candidate = null;
            if (data.candidateId) {
              try {
                const candidateDoc = await getDoc(doc(db, 'users', data.candidateId));
                if (candidateDoc.exists()) {
                  const candidateData = candidateDoc.data();
                  candidate = {
                    id: candidateDoc.id,
                    ...candidateData,
                    lastActive: candidateData.lastActive?.toDate?.() || candidateData.lastActive,
                    createdAt: candidateData.createdAt?.toDate?.() || candidateData.createdAt,
                    updatedAt: candidateData.updatedAt?.toDate?.() || candidateData.updatedAt,
                  };
                }
              } catch (err) {
                console.error('Error fetching candidate:', err);
              }
            }

            return {
              id: docSnapshot.id,
              ...data,
              candidate,
              savedAt: data.savedAt?.toDate?.() || data.savedAt,
            };
          })
        );

        setCandidates(candidatesData.filter(c => c.candidate));
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching talent pool:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [companyId]);

  return { candidates, loading, error };
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

const EmptyState = ({ onBrowse }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="text-center py-16"
  >
    <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
      <FaBookmark className="w-12 h-12 text-gray-400" />
    </div>
    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
      Your talent pool is empty
    </h3>
    <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
      Start saving candidates from the search page to build your talent pool for future opportunities.
    </p>
    <button
      onClick={onBrowse}
      className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
    >
      <FaSearch className="w-4 h-4" />
      Browse Candidates
    </button>
  </motion.div>
);

const CandidateCard = ({ 
  item, 
  onView, 
  onMessage, 
  onRemove, 
  onToggleTag,
  onUpdateNotes,
  viewMode = 'grid'
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [notes, setNotes] = useState(item.notes || '');
  const [savingNotes, setSavingNotes] = useState(false);

  const candidate = item.candidate;
  const matchScore = candidate.matchScore || Math.floor(Math.random() * 30) + 70;
  const matchConfig = getMatchScoreConfig(matchScore);

  const candidateName = candidate.name || candidate.displayName || 'Candidate';
  const candidateInitial = candidateName.charAt(0).toUpperCase();

  const handleSaveNotes = async () => {
    try {
      setSavingNotes(true);
      await onUpdateNotes(item.id, notes);
      setShowNotesModal(false);
    } finally {
      setSavingNotes(false);
    }
  };

  if (viewMode === 'list') {
    return (
      <>
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all"
        >
          <div className="relative flex-shrink-0">
            {candidate.avatar || candidate.photoURL ? (
              <img
                src={candidate.avatar || candidate.photoURL}
                alt={candidateName}
                className="w-14 h-14 rounded-full object-cover"
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-semibold">
                {candidateInitial}
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-semibold text-gray-900 dark:text-white truncate">
                {candidateName}
              </h4>
              <span className="text-xs text-gray-500">
                <FaBookmark className="w-3 h-3 inline mr-1 text-yellow-500" />
                {formatTimeAgo(item.savedAt)}
              </span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
              {candidate.headline || candidate.title || 'Candidate'}
            </p>
            <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
              {candidate.location && (
                <span className="flex items-center gap-1">
                  <FaMapMarkerAlt className="w-3 h-3" />
                  {candidate.location}
                </span>
              )}
              {candidate.experience && (
                <span className="flex items-center gap-1">
                  <FaBriefcase className="w-3 h-3" />
                  {candidate.experience}
                </span>
              )}
            </div>
          </div>

          <div className="hidden md:block text-center">
            <div className={`text-lg font-bold ${matchConfig.text}`}>
              {matchScore}%
            </div>
            <div className="text-xs text-gray-400">Match</div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => onView(item)}
              className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <FaEye className="w-4 h-4" />
            </button>
            <button
              onClick={() => onMessage(item)}
              className="p-2 text-gray-400 hover:text-green-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <FaCommentDots className="w-4 h-4" />
            </button>
            <button
              onClick={() => onRemove(item)}
              className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <FaTrash className="w-4 h-4" />
            </button>
          </div>
        </motion.div>

        {/* Notes Modal */}
        <AnimatePresence>
          {showNotesModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              onClick={() => setShowNotesModal(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Add Notes for {candidateName}
                </h3>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={5}
                  placeholder="Add your notes about this candidate..."
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm"
                />
                <div className="flex items-center gap-3 mt-4">
                  <button
                    onClick={() => setShowNotesModal(false)}
                    className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveNotes}
                    disabled={savingNotes}
                    className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {savingNotes ? (
                      <>
                        <FaSpinner className="w-4 h-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <FaCheck className="w-4 h-4" />
                        Save Notes
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </>
    );
  }

  return (
    <>
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
                  alt={candidateName}
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-semibold">
                  {candidateInitial}
                </div>
              )}
              <div className="absolute -top-1 -right-1 bg-yellow-500 rounded-full p-1.5">
                <FaBookmark className="w-3 h-3 text-white" />
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white">
                {candidateName}
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {candidate.headline || candidate.title || 'Candidate'}
              </p>
              {candidate.location && (
                <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                  <FaMapMarkerAlt className="w-3 h-3" />
                  {candidate.location}
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
                      onClick={() => { onView(item); setShowMenu(false); }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                    >
                      <FaEye className="w-4 h-4" /> View Profile
                    </button>
                    <button
                      onClick={() => { onMessage(item); setShowMenu(false); }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                    >
                      <FaCommentDots className="w-4 h-4" /> Send Message
                    </button>
                    <button
                      onClick={() => { setShowNotesModal(true); setShowMenu(false); }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                    >
                      <FaEdit className="w-4 h-4" /> Add Notes
                    </button>
                    <div className="border-t border-gray-100 dark:border-gray-700 my-1" />
                    <button
                      onClick={() => { onRemove(item); setShowMenu(false); }}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                    >
                      <FaTrash className="w-4 h-4" /> Remove
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
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

        {/* Notes Preview */}
        {item.notes && (
          <div className="p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg mb-4">
            <p className="text-xs text-yellow-800 dark:text-yellow-200 line-clamp-2">
              <FaEdit className="w-3 h-3 inline mr-1" />
              {item.notes}
            </p>
          </div>
        )}

        {/* Tags */}
        {item.tags && item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {item.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded text-xs"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Saved Date */}
        <p className="text-xs text-gray-400 mb-4">
          Saved {formatTimeAgo(item.savedAt)}
        </p>

        {/* Footer */}
        <div className="flex items-center gap-2 pt-4 border-t border-gray-100 dark:border-gray-700">
          <button
            onClick={() => onView(item)}
            className="flex-1 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg text-sm font-medium hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors flex items-center justify-center gap-1"
          >
            <FaEye className="w-3.5 h-3.5" />
            View
          </button>
          <button
            onClick={() => onMessage(item)}
            className="flex-1 px-3 py-2 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg text-sm font-medium hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors flex items-center justify-center gap-1"
          >
            <FaCommentDots className="w-3.5 h-3.5" />
            Message
          </button>
          <button
            onClick={() => onRemove(item)}
            className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <FaTrash className="w-4 h-4" />
          </button>
        </div>
      </motion.div>

      {/* Notes Modal */}
      <AnimatePresence>
        {showNotesModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowNotesModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Add Notes for {candidateName}
              </h3>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={5}
                placeholder="Add your notes about this candidate..."
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm"
              />
              <div className="flex items-center gap-3 mt-4">
                <button
                  onClick={() => setShowNotesModal(false)}
                  className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveNotes}
                  disabled={savingNotes}
                  className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {savingNotes ? (
                    <>
                      <FaSpinner className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <FaCheck className="w-4 h-4" />
                      Save Notes
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================

const TalentPool = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { showNotification } = useNotification();

  const companyId = currentUser?.uid;
  const { candidates, loading, error } = useTalentPool(companyId);

  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [viewMode, setViewMode] = useState('grid');
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const [candidateToRemove, setCandidateToRemove] = useState(null);

  // Stats
  const stats = useMemo(() => {
    const highMatch = candidates.filter(c => (c.candidate?.matchScore || 0) >= 80).length;
    const available = candidates.filter(c => c.candidate?.availability === 'immediately').length;
    const withNotes = candidates.filter(c => c.notes).length;

    return {
      total: candidates.length,
      highMatch,
      available,
      withNotes,
    };
  }, [candidates]);

  // Filtered candidates
  const filteredCandidates = useMemo(() => {
    let filtered = [...candidates];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(item => {
        const candidate = item.candidate;
        return (
          (candidate?.name?.toLowerCase() || '').includes(term) ||
          (candidate?.displayName?.toLowerCase() || '').includes(term) ||
          (candidate?.email?.toLowerCase() || '').includes(term) ||
          (candidate?.headline?.toLowerCase() || '').includes(term) ||
          (candidate?.skills?.some(s => s.toLowerCase().includes(term)) || false) ||
          (item.notes?.toLowerCase() || '').includes(term)
        );
      });
    }

    if (filter === 'high-match') {
      filtered = filtered.filter(c => (c.candidate?.matchScore || 0) >= 80);
    } else if (filter === 'available') {
      filtered = filtered.filter(c => c.candidate?.availability === 'immediately');
    } else if (filter === 'contacted') {
      filtered = filtered.filter(c => c.status === 'contacted' || c.contactedAt);
    } else if (filter === 'interviewed') {
      filtered = filtered.filter(c => c.status === 'interviewed' || c.interviewedAt);
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.savedAt) - new Date(a.savedAt);
        case 'oldest':
          return new Date(a.savedAt) - new Date(b.savedAt);
        case 'name':
          return (a.candidate?.name || '').localeCompare(b.candidate?.name || '');
        case 'matchScore':
          return (b.candidate?.matchScore || 0) - (a.candidate?.matchScore || 0);
        case 'experience':
          return (b.candidate?.experienceYears || 0) - (a.candidate?.experienceYears || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [candidates, searchTerm, filter, sortBy]);

  // ============================================
  // HANDLERS
  // ============================================

  const handleViewCandidate = (item) => {
    navigate(`/company/candidates/${item.candidate.id}`);
  };

  const handleMessageCandidate = (item) => {
    navigate(`/company/chat?candidate=${item.candidate.id}`);
  };

  const handleRemoveClick = (item) => {
    setCandidateToRemove(item);
    setShowRemoveConfirm(true);
  };

  const handleRemoveConfirm = async () => {
    if (!candidateToRemove) return;

    try {
      await deleteDoc(doc(db, 'savedCandidates', candidateToRemove.id));
      showNotification('success', 'Candidate removed from talent pool');
      setShowRemoveConfirm(false);
      setCandidateToRemove(null);
    } catch (error) {
      console.error('Error removing candidate:', error);
      showNotification('error', 'Failed to remove candidate');
    }
  };

  const handleUpdateNotes = async (itemId, notes) => {
    try {
      await updateDoc(doc(db, 'savedCandidates', itemId), {
        notes,
        notesUpdatedAt: serverTimestamp(),
      });
      showNotification('success', 'Notes saved');
    } catch (error) {
      console.error('Error saving notes:', error);
      showNotification('error', 'Failed to save notes');
      throw error;
    }
  };

  const handleExport = () => {
    try {
      const exportData = filteredCandidates.map(item => ({
        Name: item.candidate?.name || '',
        Email: item.candidate?.email || '',
        Location: item.candidate?.location || '',
        Headline: item.candidate?.headline || '',
        Skills: (item.candidate?.skills || []).join('; '),
        'Match Score': item.candidate?.matchScore || 0,
        'Saved Date': formatDate(item.savedAt),
        Notes: item.notes || '',
      }));

      const headers = Object.keys(exportData[0] || {}).join(',');
      const rows = exportData.map(row => Object.values(row).map(v => `"${v}"`).join(','));
      const csv = [headers, ...rows].join('\n');

      const blob = new Blob([csv], { type: 'text/csv' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `talent-pool-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();

      showNotification('success', 'Talent pool exported');
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
              <FaBookmark className="w-8 h-8 text-yellow-500" />
              Talent Pool
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Your saved candidates for future opportunities
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleExport}
              disabled={filteredCandidates.length === 0}
              className="px-4 py-2.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-medium border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <FaFileExport className="w-4 h-4" />
              Export
            </button>
            <button
              onClick={() => navigate('/company/candidates')}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <FaSearch className="w-4 h-4" />
              Browse Candidates
            </button>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Saved', value: stats.total, icon: FaBookmark, color: 'yellow' },
            { label: 'High Match', value: stats.highMatch, icon: FaStar, color: 'blue' },
            { label: 'Available Now', value: stats.available, icon: FaClock, color: 'green' },
            { label: 'With Notes', value: stats.withNotes, icon: FaEdit, color: 'purple' },
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700"
            >
              <div className={`p-2.5 rounded-lg inline-block mb-3 ${
                stat.color === 'yellow' ? 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600' :
                stat.color === 'blue' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600' :
                stat.color === 'green' ? 'bg-green-50 dark:bg-green-900/20 text-green-600' :
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
        {candidates.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 mb-6">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
              <div className="relative flex-1 w-full">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search saved candidates..."
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
                  {POOL_FILTERS.map(f => (
                    <option key={f.value} value={f.value}>{f.label}</option>
                  ))}
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {SORT_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
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

            {/* Results Count */}
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Showing {filteredCandidates.length} of {candidates.length} candidates
              </p>
            </div>
          </div>
        )}

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
        ) : candidates.length === 0 ? (
          <EmptyState onBrowse={() => navigate('/company/candidates')} />
        ) : filteredCandidates.length === 0 ? (
          <div className="text-center py-16">
            <FaBookmark className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No candidates match your filters</p>
            <button
              onClick={clearFilters}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
              : 'space-y-3'
          }>
            {filteredCandidates.map((item) => (
              <CandidateCard
                key={item.id}
                item={item}
                onView={handleViewCandidate}
                onMessage={handleMessageCandidate}
                onRemove={handleRemoveClick}
                onUpdateNotes={handleUpdateNotes}
                viewMode={viewMode}
              />
            ))}
          </div>
        )}
      </div>

      {/* Remove Confirmation Modal */}
      <AnimatePresence>
        {showRemoveConfirm && candidateToRemove && (
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
                    Remove from Talent Pool
                  </h3>
                  <p className="text-sm text-gray-500">
                    This action can be undone by re-saving
                  </p>
                </div>
              </div>

              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Are you sure you want to remove{' '}
                <strong>{candidateToRemove.candidate?.name}</strong> from your talent pool?
              </p>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowRemoveConfirm(false)}
                  className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 transition-colors"
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

export default TalentPool;