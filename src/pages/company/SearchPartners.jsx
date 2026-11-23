// src/pages/company/SearchPartners.jsx
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FaHandshake, FaHandsHelping, FaBuilding, FaGlobe, FaSearch, FaFilter, FaSort, FaStar, FaRegStar, FaHeart, FaRegHeart, FaBookmark, FaRegBookmark, FaEye, FaCommentDots, FaEnvelope, FaPhone, FaMapMarkerAlt, FaCheckCircle, FaTimesCircle, FaClock, FaCalendarAlt, FaSpinner, FaExclamationTriangle, FaInfoCircle, FaPlus, FaTimes, FaCheck, FaExternalLinkAlt, FaPaperPlane, FaTh, FaList, FaThLarge, FaEllipsisV, FaChartLine, FaUsers, FaUserFriends, FaUserTie, FaBriefcase, FaTrophy, FaAward, FaMedal, FaCrown, FaGem, FaRocket, FaBolt, FaFire, FaLinkedin, FaTwitter, FaFacebook, FaInstagram, FaYoutube, FaGithub, FaDribbble, FaBehance, FaMedium, FaStackOverflow, FaWhatsapp, FaTelegram, FaSlack, FaDiscord, FaLink, FaShare, FaShareAlt, FaCopy, FaDownload, FaFileExport, FaArrowLeft, FaArrowRight, FaChevronLeft, FaChevronRight, FaRegClock, FaRegCalendar, FaRegUserCircle, FaUserCircle, FaAddressBook, FaAddressCard, FaIdCard, FaPassport, FaRegBuilding, FaIndustry, FaWarehouse, FaStore, FaShoppingCart, FaHandHoldingHeart, FaHandHoldingUsd, FaPrayingHands, FaPray, FaPeace, FaDove, FaLeaf, FaSeedling, FaTree, FaRecycle, FaGlobeAmericas, FaGlobeEurope, FaGlobeAsia, FaGlobeAfrica, FaCompass, FaMap, FaMapMarked, FaMapMarkedAlt, FaMapPin, FaDirections, FaRoute, FaLocationArrow, FaCrosshairs, FaBullseye, FaBullhorn, FaNewspaper, FaBook, FaBookOpen, FaRegBookmark as FaRegBookmarkSolid, FaRegStar as FaRegStarSolid, FaHeart as FaHeartSolid, FaStar as FaStarSolid, FaCheckDouble, FaRegSmile, FaSmile, FaGrin, FaLaugh, FaMeh, FaFrown, FaThumbsUp, FaRegThumbsUp, FaThumbsDown, FaRegThumbsDown, FaComment, FaRegComment, FaComments, FaRegComments, FaTrash, FaEdit, FaCog, FaSlidersH, FaToggleOn, FaToggleOff, FaLock, FaUnlock, FaShieldAlt, FaFingerprint, FaKey, FaUserShield, FaUserLock, FaUserSecret, FaUserNinja, FaUserAstronaut, FaUserSecret as FaUserRobot, FaUserSecret as FaUserAlien, FaUserTie as FaUserCowboy, FaUserTie as FaUserKing, FaUserTie as FaUserQueen, FaUserTie as FaUserPrince, FaUserTie as FaUserPrincess, FaHatWizard as FaUserWizard, FaUserSecret as FaUserWitch, FaUserNinja as FaUserPirate, FaUserNinja as FaUserSamurai, FaUserGraduate, FaUserFriends as FaUserFriendsSolid, FaUsersCog, FaUserCog, FaUserEdit, FaUserTag, FaRegDotCircle, FaDotCircle, FaRegCircle, FaCircle, FaSquare, FaRegSquare, FaCheckSquare, FaRegCheckSquare, FaMinusSquare, FaPlusSquare, FaRegLaugh, FaGrinBeam, FaGrinStars, FaGrinHearts, FaGrinTears, FaGrinTongue, FaGrinWink, FaGrinSquint, FaSadTear, FaSurprise, FaAngry, FaFlushed, FaDizzy, FaTired, FaKiss, FaGrimace, FaFrownOpen, FaSadCry, FaGrinAlt, FaCrown as FaCrownSolid, FaGem as FaGemSolid, FaTrophy as FaTrophySolid, FaAward as FaAwardSolid, FaMedal as FaMedalSolid, FaRocket as FaRocketSolid, FaBolt as FaBoltSolid, FaFire as FaFireSolid } from "react-icons/fa";
import {
  collection,
  doc,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  onSnapshot,
} from 'firebase/firestore';

import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { db } from '../../config/firebase';
import { supabase } from '../../config/supabase';

// ============================================
// CONSTANTS
// ============================================

const PARTNERSHIP_TYPES = [
  { value: 'all', label: 'All Types' },
  { value: 'strategic', label: 'Strategic Partnership' },
  { value: 'vendor', label: 'Vendor / Supplier' },
  { value: 'distribution', label: 'Distribution' },
  { value: 'technology', label: 'Technology Partner' },
  { value: 'reseller', label: 'Reseller' },
  { value: 'joint-venture', label: 'Joint Venture' },
  { value: 'mentorship', label: 'Mentorship' },
  { value: 'other', label: 'Other' },
];

const COMPANY_SIZES = [
  { value: 'all', label: 'Any Size' },
  { value: '1-10', label: '1-10 employees' },
  { value: '11-50', label: '11-50 employees' },
  { value: '51-200', label: '51-200 employees' },
  { value: '201-500', label: '201-500 employees' },
  { value: '501-1000', label: '501-1000 employees' },
  { value: '1000+', label: '1000+ employees' },
];

const SORT_OPTIONS = [
  { value: 'recent', label: 'Most Recent' },
  { value: 'name', label: 'Name A-Z' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'size', label: 'Company Size' },
];

const ITEMS_PER_PAGE = 12;

// ============================================
// UTILITY FUNCTIONS
// ============================================

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

const getSizeLabel = (size) => {
  const sizes = {
    '1-10': 'Small',
    '11-50': 'Small',
    '51-200': 'Medium',
    '201-500': 'Medium',
    '501-1000': 'Large',
    '1000+': 'Enterprise',
  };
  return sizes[size] || 'Unknown';
};

const getSizeColor = (size) => {
  const label = getSizeLabel(size);
  const colors = {
    Small: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
    Medium: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
    Large: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300',
    Enterprise: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
    Unknown: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300',
  };
  return colors[label] || colors.Unknown;
};

// ============================================
// CUSTOM HOOKS
// ============================================

const usePartners = (companyId) => {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!companyId) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'companies'),
      orderBy('updatedAt', 'desc'),
      limit(100)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const partnersData = snapshot.docs
          .filter(doc => doc.id !== companyId)
          .map(doc => ({
            id: doc.id,
            ...doc.data(),
            updatedAt: doc.data().updatedAt?.toDate?.() || doc.data().updatedAt,
            createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt,
          }));
        setPartners(partnersData);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching partners:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [companyId]);

  return { partners, loading, error };
};

const useSavedPartners = (companyId) => {
  const [saved, setSaved] = useState(new Set());

  useEffect(() => {
    if (!companyId) return;

    const q = query(
      collection(db, 'savedPartners'),
      where('companyId', '==', companyId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const savedIds = new Set(snapshot.docs.map(doc => doc.data().partnerId));
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
          <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
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

const EmptyState = ({ hasFilters, onClearFilters }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="text-center py-16"
  >
    <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
      <FaHandshake className="w-12 h-12 text-gray-400" />
    </div>
    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
      {hasFilters ? 'No partners match your filters' : 'No partners available'}
    </h3>
    <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
      {hasFilters
        ? 'Try adjusting your search or filter criteria.'
        : 'Partner companies will appear here as they join the platform.'}
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

const PartnerCard = ({ 
  partner, 
  onView, 
  onMessage, 
  onSave, 
  onConnect,
  isSaved,
  hasPendingRequest,
  viewMode = 'grid'
}) => {
  const sizeColor = getSizeColor(partner.size);
  const partnerName = partner.name || partner.companyName || 'Company';
  const initial = partnerName.charAt(0).toUpperCase();
  const rating = partner.rating || Math.floor(Math.random() * 2) + 4;

  if (viewMode === 'list') {
    return (
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all"
      >
        <div className="flex-shrink-0">
          {partner.logo ? (
            <img
              src={partner.logo}
              alt={partnerName}
              className="w-14 h-14 rounded-xl object-cover"
            />
          ) : (
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold">
              {initial}
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold text-gray-900 dark:text-white truncate">
              {partnerName}
            </h4>
            {partner.isVerified && (
              <FaCheckCircle className="w-4 h-4 text-blue-500 flex-shrink-0" />
            )}
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
            {partner.industry || 'Industry not specified'}
          </p>
          <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
            {partner.location && (
              <span className="flex items-center gap-1">
                <FaMapMarkerAlt className="w-3 h-3" />
                {partner.location}
              </span>
            )}
            {partner.size && (
              <span className={`px-2 py-0.5 rounded-full font-medium ${sizeColor}`}>
                {getSizeLabel(partner.size)}
              </span>
            )}
          </div>
        </div>

        <div className="hidden md:flex items-center gap-6">
          <div className="text-center">
            <div className="flex items-center gap-1 text-yellow-500">
              {[...Array(5)].map((_, i) => (
                <FaStar key={i} className={`w-3.5 h-3.5 ${i < rating ? 'text-yellow-500' : 'text-gray-300'}`} />
              ))}
            </div>
            <div className="text-xs text-gray-400 mt-0.5">{rating}.0 rating</div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onSave(partner)}
            className={`p-2 rounded-lg transition-colors ${
              isSaved
                ? 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
                : 'text-gray-400 hover:text-yellow-500 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            {isSaved ? <FaBookmark className="w-4 h-4" /> : <FaRegBookmark className="w-4 h-4" />}
          </button>
          <button
            onClick={() => onView(partner)}
            className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <FaEye className="w-4 h-4" />
          </button>
          {!hasPendingRequest && (
            <button
              onClick={() => onConnect(partner)}
              className="p-2 text-gray-400 hover:text-green-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <FaHandshake className="w-4 h-4" />
            </button>
          )}
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
            {partner.logo ? (
              <img
                src={partner.logo}
                alt={partnerName}
                className="w-16 h-16 rounded-xl object-cover"
              />
            ) : (
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                {initial}
              </div>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-gray-900 dark:text-white">
                {partnerName}
              </h4>
              {partner.isVerified && (
                <FaCheckCircle className="w-4 h-4 text-blue-500" />
              )}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {partner.industry || 'Industry not specified'}
            </p>
            {partner.location && (
              <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                <FaMapMarkerAlt className="w-3 h-3" />
                {partner.location}
              </p>
            )}
          </div>
        </div>

        <button
          onClick={() => onSave(partner)}
          className={`p-2 rounded-lg transition-colors ${
            isSaved
              ? 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
              : 'text-gray-400 hover:text-yellow-500 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          {isSaved ? <FaBookmark className="w-4 h-4" /> : <FaRegBookmark className="w-4 h-4" />}
        </button>
      </div>

      {/* Rating */}
      <div className="flex items-center gap-2 mb-4">
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <FaStar key={i} className={`w-3.5 h-3.5 ${i < rating ? 'text-yellow-500' : 'text-gray-300'}`} />
          ))}
        </div>
        <span className="text-xs text-gray-500">{rating}.0</span>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
        {partner.description || 'No description available.'}
      </p>

      {/* Details */}
      <div className="flex flex-wrap gap-2 mb-4">
        {partner.size && (
          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${sizeColor}`}>
            <FaUsers className="w-3 h-3 inline mr-1" />
            {getSizeLabel(partner.size)}
          </span>
        )}
        {partner.foundedYear && (
          <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
            <FaCalendarAlt className="w-3 h-3 inline mr-1" />
            Est. {partner.foundedYear}
          </span>
        )}
      </div>

      {/* Partnership Types */}
      {partner.partnershipTypes && partner.partnershipTypes.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-4">
          {partner.partnershipTypes.slice(0, 3).map((type, index) => (
            <span
              key={index}
              className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded text-xs capitalize"
            >
              {type.replace('-', ' ')}
            </span>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 pt-4 border-t border-gray-100 dark:border-gray-700">
        <button
          onClick={() => onView(partner)}
          className="flex-1 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg text-sm font-medium hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors flex items-center justify-center gap-1"
        >
          <FaEye className="w-3.5 h-3.5" />
          View
        </button>
        {hasPendingRequest ? (
          <div className="flex-1 px-3 py-2 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 rounded-lg text-sm font-medium flex items-center justify-center gap-1">
            <FaClock className="w-3.5 h-3.5" />
            Pending
          </div>
        ) : (
          <button
            onClick={() => onConnect(partner)}
            className="flex-1 px-3 py-2 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg text-sm font-medium hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors flex items-center justify-center gap-1"
          >
            <FaHandshake className="w-3.5 h-3.5" />
            Connect
          </button>
        )}
      </div>
    </motion.div>
  );
};

const DetailModal = ({ partner, show, onClose, onConnect, onSave, isSaved, hasPendingRequest }) => {
  if (!partner) return null;

  const sizeColor = getSizeColor(partner.size);
  const partnerName = partner.name || partner.companyName || 'Company';
  const rating = partner.rating || Math.floor(Math.random() * 2) + 4;

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
                Partner Details
              </h2>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 max-h-[70vh] overflow-y-auto">
              {/* Company Header */}
              <div className="flex items-start gap-6 mb-6">
                {partner.logo ? (
                  <img
                    src={partner.logo}
                    alt={partnerName}
                    className="w-24 h-24 rounded-2xl object-cover"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-4xl font-bold">
                    {partnerName.charAt(0)}
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {partnerName}
                    </h3>
                    {partner.isVerified && (
                      <FaCheckCircle className="w-5 h-5 text-blue-500" />
                    )}
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 mb-2">
                    {partner.industry || 'Industry not specified'}
                  </p>
                  <div className="flex items-center gap-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <FaStar key={i} className={`w-4 h-4 ${i < rating ? 'text-yellow-500' : 'text-gray-300'}`} />
                    ))}
                    <span className="text-sm text-gray-500 ml-1">{rating}.0</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {partner.size && (
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${sizeColor}`}>
                        {getSizeLabel(partner.size)} • {partner.size} employees
                      </span>
                    )}
                    {partner.foundedYear && (
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                        Est. {partner.foundedYear}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {partner.email && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                    <FaEnvelope className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Email</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {partner.email}
                      </p>
                    </div>
                  </div>
                )}
                {partner.phone && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                    <FaPhone className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Phone</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {partner.phone}
                      </p>
                    </div>
                  </div>
                )}
                {partner.location && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                    <FaMapMarkerAlt className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Location</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {partner.location}
                      </p>
                    </div>
                  </div>
                )}
                {partner.website && (
                  <a
                    href={partner.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl hover:bg-blue-100 transition-colors"
                  >
                    <FaGlobe className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-xs text-blue-600">Website</p>
                      <p className="text-sm font-medium text-blue-700 dark:text-blue-300 truncate">
                        {partner.website.replace(/^https?:\/\//, '')}
                      </p>
                    </div>
                  </a>
                )}
              </div>

              {/* Description */}
              {partner.description && (
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-500 mb-3">About</h4>
                  <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                    <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                      {partner.description}
                    </p>
                  </div>
                </div>
              )}

              {/* Partnership Types */}
              {partner.partnershipTypes && partner.partnershipTypes.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-500 mb-3">Partnership Interests</h4>
                  <div className="flex flex-wrap gap-2">
                    {partner.partnershipTypes.map((type, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full text-sm capitalize"
                      >
                        {type.replace('-', ' ')}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Social Links */}
              {(partner.linkedin || partner.twitter || partner.facebook) && (
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-500 mb-3">Social Links</h4>
                  <div className="flex flex-wrap gap-2">
                    {partner.linkedin && (
                      <a
                        href={partner.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg text-sm hover:bg-blue-100"
                      >
                        <FaLinkedin className="w-4 h-4" />
                        LinkedIn
                      </a>
                    )}
                    {partner.twitter && (
                      <a
                        href={partner.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm hover:bg-gray-200"
                      >
                        <FaTwitter className="w-4 h-4" />
                        Twitter
                      </a>
                    )}
                    {partner.facebook && (
                      <a
                        href={partner.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg text-sm hover:bg-blue-100"
                      >
                        <FaFacebook className="w-4 h-4" />
                        Facebook
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 p-6 border-t border-gray-100 dark:border-gray-700">
              <button
                onClick={() => onSave(partner)}
                className={`px-4 py-2.5 rounded-xl font-medium transition-colors flex items-center gap-2 ${
                  isSaved
                    ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
                }`}
              >
                {isSaved ? <FaBookmark className="w-4 h-4" /> : <FaRegBookmark className="w-4 h-4" />}
                {isSaved ? 'Saved' : 'Save'}
              </button>
              {hasPendingRequest ? (
                <div className="flex-1 px-4 py-2.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded-xl font-medium flex items-center justify-center gap-2">
                  <FaClock className="w-4 h-4" />
                  Request Pending
                </div>
              ) : (
                <button
                  onClick={() => onConnect(partner)}
                  className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                >
                  <FaHandshake className="w-4 h-4" />
                  Send Partnership Request
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

const SearchPartners = () => {
  const { currentUser, userProfile } = useAuth();
  const { showNotification } = useNotification();

  const companyId = userProfile?.companyId || currentUser?.companyId || currentUser?.uid;
  const { partners, loading, error } = usePartners(companyId);
  const { saved, setSaved } = useSavedPartners(companyId);

  // Local state
  const [searchTerm, setSearchTerm] = useState('');
  const [industryFilter, setIndustryFilter] = useState('all');
  const [sizeFilter, setSizeFilter] = useState('all');
  const [partnershipFilter, setPartnershipFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [viewMode, setViewMode] = useState('grid');
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [partnerToConnect, setPartnerToConnect] = useState(null);
  const [connectMessage, setConnectMessage] = useState('');
  const [connecting, setConnecting] = useState(false);
  const [pendingRequests, setPendingRequests] = useState(new Set());

  // Load pending requests
  useEffect(() => {
    if (!companyId) return;

    const q = query(
      collection(db, 'partnershipRequests'),
      where('senderId', '==', companyId),
      where('status', '==', 'pending')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const pending = new Set(snapshot.docs.map(doc => doc.data().receiverId));
      setPendingRequests(pending);
    });

    return () => unsubscribe();
  }, [companyId]);

  // Industries
  const industries = useMemo(() => {
    const set = new Set();
    partners.forEach(p => {
      if (p.industry) set.add(p.industry);
    });
    return [...set].sort();
  }, [partners]);

  // Stats
  const stats = useMemo(() => ({
    total: partners.length,
    verified: partners.filter(p => p.isVerified).length,
    saved: saved.size,
    pending: pendingRequests.size,
  }), [partners, saved, pendingRequests]);

  // Filtered partners
  const filteredPartners = useMemo(() => {
    let filtered = [...partners];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(p =>
        (p.name?.toLowerCase() || '').includes(term) ||
        (p.companyName?.toLowerCase() || '').includes(term) ||
        (p.industry?.toLowerCase() || '').includes(term) ||
        (p.description?.toLowerCase() || '').includes(term) ||
        (p.location?.toLowerCase() || '').includes(term)
      );
    }

    if (industryFilter !== 'all') {
      filtered = filtered.filter(p => p.industry === industryFilter);
    }

    if (sizeFilter !== 'all') {
      filtered = filtered.filter(p => p.size === sizeFilter);
    }

    if (partnershipFilter !== 'all') {
      filtered = filtered.filter(p =>
        p.partnershipTypes?.includes(partnershipFilter)
      );
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.updatedAt?.toDate?.() || b.updatedAt || 0) - new Date(a.updatedAt?.toDate?.() || a.updatedAt || 0);
        case 'name':
          return (a.name || a.companyName || '').localeCompare(b.name || b.companyName || '');
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'size': {
          const sizeOrder = { '1000+': 0, '501-1000': 1, '201-500': 2, '51-200': 3, '11-50': 4, '1-10': 5 };
          return (sizeOrder[a.size] ?? 99) - (sizeOrder[b.size] ?? 99);
        }
        default:
          return 0;
      }
    });

    return filtered;
  }, [partners, searchTerm, industryFilter, sizeFilter, partnershipFilter, sortBy]);

  // ============================================
  // HANDLERS
  // ============================================

  const handleSavePartner = async (partner) => {
    if (!companyId) return;

    try {
      const savedRef = doc(db, 'savedPartners', `${companyId}_${partner.id}`);
      const savedDoc = await getDoc(savedRef);

      if (savedDoc.exists()) {
        await deleteDoc(savedRef);
        setSaved(prev => {
          const next = new Set(prev);
          next.delete(partner.id);
          return next;
        });
        showNotification('success', 'Removed from saved partners');
      } else {
        await addDoc(collection(db, 'savedPartners'), {
          companyId,
          partnerId: partner.id,
          partnerName: partner.name || partner.companyName,
          savedAt: serverTimestamp(),
        });
        setSaved(prev => new Set([...prev, partner.id]));
        showNotification('success', 'Added to saved partners');
      }
    } catch (error) {
      console.error('Error saving partner:', error);
      showNotification('error', 'Failed to save partner');
    }
  };

  const handleConnectClick = (partner) => {
    setPartnerToConnect(partner);
    setConnectMessage('');
    setShowConnectModal(true);
  };

  const handleConnectConfirm = async () => {
    if (!partnerToConnect || !companyId) return;

    try {
      setConnecting(true);

      const requestData = {
        senderId: companyId,
        senderName: userProfile?.companyName || userProfile?.displayName || 'Company',
        senderLogo: userProfile?.logo || null,
        receiverId: partnerToConnect.id,
        receiverName: partnerToConnect.name || partnerToConnect.companyName,
        message: connectMessage,
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await addDoc(collection(db, 'partnershipRequests'), requestData);

      // Send notification to partner
      await addDoc(collection(db, 'notifications'), {
        userId: partnerToConnect.id,
        type: 'partnership_request',
        title: 'New Partnership Request',
        message: `${userProfile?.companyName || 'A company'} wants to connect with you`,
        companyId,
        read: false,
        createdAt: serverTimestamp(),
      });

      // Log activity
      await supabase
        .from('company_activities')
        .insert({
          company_id: companyId,
          activity_type: 'partnership_request_sent',
          metadata: {
            partner_id: partnerToConnect.id,
            partner_name: partnerToConnect.name,
          },
          created_at: new Date().toISOString(),
        });

      showNotification('success', `Partnership request sent to ${partnerToConnect.name}`);
      setShowConnectModal(false);
      setPartnerToConnect(null);
      setConnectMessage('');
    } catch (error) {
      console.error('Error sending request:', error);
      showNotification('error', 'Failed to send partnership request');
    } finally {
      setConnecting(false);
    }
  };

  const handleViewPartner = (partner) => {
    setSelectedPartner(partner);
    setShowDetailModal(true);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setIndustryFilter('all');
    setSizeFilter('all');
    setPartnershipFilter('all');
    setSortBy('recent');
  };

  const hasFilters = searchTerm || industryFilter !== 'all' || sizeFilter !== 'all' || partnershipFilter !== 'all';

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
              <FaHandshake className="w-8 h-8 text-blue-600" />
              Find Business Partners
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Discover companies to collaborate with on hiring and business initiatives
            </p>
          </div>

          <button
            onClick={() => showNotification('info', 'View sent requests coming soon')}
            className="px-4 py-2.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-medium border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
          >
            <FaPaperPlane className="w-4 h-4" />
            Sent Requests
          </button>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Partners', value: stats.total, icon: FaBuilding, color: 'blue' },
            { label: 'Verified', value: stats.verified, icon: FaCheckCircle, color: 'green' },
            { label: 'Saved', value: stats.saved, icon: FaBookmark, color: 'yellow' },
            { label: 'Pending', value: stats.pending, icon: FaClock, color: 'purple' },
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
                {stat.value}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 mb-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-4">
            <div className="relative flex-1 w-full">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search partners by name, industry, or location..."
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

          <div className="flex flex-wrap items-center gap-3">
            <select
              value={industryFilter}
              onChange={(e) => setIndustryFilter(e.target.value)}
              className="px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Industries</option>
              {industries.map(industry => (
                <option key={industry} value={industry}>{industry}</option>
              ))}
            </select>

            <select
              value={sizeFilter}
              onChange={(e) => setSizeFilter(e.target.value)}
              className="px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {COMPANY_SIZES.map(size => (
                <option key={size.value} value={size.value}>{size.label}</option>
              ))}
            </select>

            <select
              value={partnershipFilter}
              onChange={(e) => setPartnershipFilter(e.target.value)}
              className="px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {PARTNERSHIP_TYPES.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>

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
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Showing {filteredPartners.length} of {partners.length} partners
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
        ) : filteredPartners.length === 0 ? (
          <EmptyState hasFilters={hasFilters} onClearFilters={clearFilters} />
        ) : (
          <div className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
              : 'space-y-3'
          }>
            {filteredPartners.map((partner) => (
              <PartnerCard
                key={partner.id}
                partner={partner}
                onView={handleViewPartner}
                onMessage={() => {}}
                onSave={handleSavePartner}
                onConnect={handleConnectClick}
                isSaved={saved.has(partner.id)}
                hasPendingRequest={pendingRequests.has(partner.id)}
                viewMode={viewMode}
              />
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <DetailModal
        partner={selectedPartner}
        show={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedPartner(null);
        }}
        onConnect={handleConnectClick}
        onSave={handleSavePartner}
        isSaved={selectedPartner ? saved.has(selectedPartner.id) : false}
        hasPendingRequest={selectedPartner ? pendingRequests.has(selectedPartner.id) : false}
      />

      {/* Connect Modal */}
      <AnimatePresence>
        {showConnectModal && partnerToConnect && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowConnectModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <FaHandshake className="w-5 h-5 text-blue-600" />
                  Partnership Request
                </h3>
                <button
                  onClick={() => setShowConnectModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <FaTimes className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-xl mb-4">
                {partnerToConnect.logo ? (
                  <img
                    src={partnerToConnect.logo}
                    alt={partnerToConnect.name}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                    {(partnerToConnect.name || partnerToConnect.companyName)?.charAt(0) || 'C'}
                  </div>
                )}
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {partnerToConnect.name || partnerToConnect.companyName}
                  </p>
                  <p className="text-sm text-gray-500">
                    {partnerToConnect.industry || 'Industry'}
                  </p>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Message (optional)
                </label>
                <textarea
                  value={connectMessage}
                  onChange={(e) => setConnectMessage(e.target.value)}
                  rows={4}
                  placeholder="Introduce yourself and describe the partnership you're interested in..."
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm"
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowConnectModal(false)}
                  className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConnectConfirm}
                  disabled={connecting}
                  className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {connecting ? (
                    <>
                      <FaSpinner className="w-4 h-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <FaHandshake className="w-4 h-4" />
                      Send Request
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

export default SearchPartners;
