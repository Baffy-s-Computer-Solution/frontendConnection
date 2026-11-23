// src/pages/company/CompanyProfile.jsx
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { FaBuilding, FaCamera, FaCloudUploadAlt, FaSave, FaMapMarkerAlt, FaGlobe, FaPhone, FaEnvelope, FaIndustry, FaUsers, FaCalendarAlt, FaLinkedin, FaTwitter, FaFacebook, FaInstagram, FaYoutube, FaCheckCircle, FaTimesCircle, FaSpinner, FaExclamationTriangle, FaInfoCircle, FaEdit, FaTrash, FaPlus, FaTimes, FaImage, FaPalette, FaFont, FaBullhorn, FaHandshake, FaAward, FaTrophy, FaRocket, FaEye, FaHeart, FaShare, FaBookmark, FaRegBookmark, FaExternalLinkAlt, FaCopy, FaLink, FaCheck, FaWifi, FaClock, FaBriefcase, FaGraduationCap, FaChartLine, FaShieldAlt, FaFingerprint, FaFileContract, FaFileAlt, FaVideo, FaImage as FaImageSolid, FaStar, FaRegStar, FaCrown, FaGem, FaMedal, FaThumbsUp, FaRegThumbsUp, FaCommentDots, FaShareAlt, FaBook, FaNewspaper, FaPoll, FaUserPlus, FaUserCheck, FaUserFriends, FaUsersCog, FaBuilding as FaBuildingSolid, FaStore, FaWarehouse, FaIndustry as FaIndustrySolid, FaLeaf, FaSeedling, FaRecycle, FaHandsHelping, FaHeart as FaHeartSolid, FaRegHeart, FaRegSmile, FaRegLaugh, FaMagic, FaRobot, FaBrain, FaLightbulb, FaBolt, FaFire, FaSnowflake, FaSun, FaMoon, FaCloud, FaCloudSun, FaCloudMoon, FaCloudRain, FaUmbrella, FaWind, FaWater, FaMountain, FaTree, FaTree as FaTreeSolid, FaGlobeAmericas, FaGlobeAfrica, FaGlobeAsia, FaGlobeEurope, FaDirections, FaRoute, FaCar, FaBus, FaTrain, FaPlane, FaShip, FaBicycle, FaWalking, FaCoffee, FaUtensils, FaPizzaSlice, FaHamburger, FaIceCream, FaBirthdayCake, FaGift, FaGlassCheers, FaWineGlassAlt, FaBeer, FaCocktail, FaMugHot, FaMusic, FaHeadphones, FaMicrophone, FaGuitar, FaDrum, FaGamepad, FaDice, FaChess, FaPuzzlePiece, FaTrophy as FaTrophySolid, FaAward as FaAwardSolid, FaMedal as FaMedalSolid, FaCrown as FaCrownSolid, FaGem as FaGemSolid, FaRing, FaGlasses, FaTshirt, FaShoePrints, FaSocks, FaHatCowboy, FaHatWizard, FaMagic as FaMagicSolid, FaBroom, FaSprayCan, FaPaintBrush, FaPaintRoller, FaPalette as FaPaletteSolid, FaFillDrip, FaEyeDropper, FaSwatchbook, FaRuler, FaRulerCombined, FaDraftingCompass, FaVectorSquare, FaBezierCurve, FaDrawPolygon, FaShapes, FaCube, FaCubes, FaLayerGroup, FaObjectGroup, FaObjectUngroup, FaClipboard, FaClipboardCheck, FaClipboardList, FaTasks, FaProjectDiagram, FaSitemap, FaNetworkWired, FaServer, FaDatabase, FaHdd, FaMemory, FaMicrochip, FaLaptopCode, FaDesktop, FaLaptop, FaTabletAlt, FaMobileAlt, FaPrint, FaFax, FaVoicemail, FaInbox, FaPaperPlane, FaPaperclip, FaPaperclip as FaPaperclipSolid, FaLink as FaLinkSolid, FaUnlink, FaAnchor, FaCompass, FaMap, FaMapPin, FaMapMarked, FaMapMarkedAlt, FaPhoneAlt, FaPhoneSquare, FaPhoneVolume, FaPhoneSlash, FaEnvelopeOpen, FaEnvelopeOpenText, FaMailBulk, FaAt, FaHashtag, FaPercentage, FaDollarSign, FaEuroSign, FaPoundSign, FaYenSign, FaRupeeSign, FaWonSign, FaBitcoin, FaEthereum, FaCcVisa, FaCcMastercard, FaCcPaypal, FaCcStripe, FaCcAmazonPay, FaCcApplePay, FaCreditCard, FaMoneyBill, FaMoneyBillWave, FaMoneyBillAlt, FaMoneyCheck, FaMoneyCheckAlt, FaReceipt, FaFileInvoice, FaFileInvoiceDollar, FaCalculator, FaBalanceScale, FaChartPie, FaChartBar, FaChartArea, FaChartLine as FaChartLineSolid, FaTachometerAlt, FaThermometer, FaThermometerHalf, FaThermometerFull, FaThermometerEmpty, FaBatteryFull, FaBatteryHalf, FaBatteryQuarter, FaBatteryEmpty, FaPlug, FaChargingStation, FaToggleOn, FaToggleOff, FaSlidersH, FaCog, FaCogs, FaTools, FaWrench, FaHammer, FaScrewdriver, FaRulerVertical, FaRulerHorizontal, FaLevelUpAlt, FaLevelDownAlt, FaArrowsAlt, FaArrowsAltH, FaArrowsAltV, FaExpand, FaExpandArrowsAlt, FaCompress, FaCompressArrowsAlt, FaSearchPlus, FaSearchMinus, FaSearch, FaFilter, FaSort, FaSortUp, FaSortDown, FaSortAmountUp, FaSortAmountDown, FaSortAmountUpAlt, FaSortAmountDownAlt, FaSortNumericUp, FaSortNumericDown, FaSortAlphaUp, FaSortAlphaDown, FaRandom, FaRetweet, FaSync, FaSyncAlt, FaRedo, FaRedoAlt, FaUndo, FaUndoAlt, FaHistory, FaHourglass, FaHourglassStart, FaHourglassHalf, FaHourglassEnd, FaStopwatch, FaRegClock, FaClock as FaClockSolid, FaRegCalendar, FaCalendarAlt as FaCalendarAltSolid, FaCalendarCheck, FaCalendarDay, FaCalendarWeek, FaCalendarPlus, FaCalendarMinus, FaCalendarTimes, FaBell, FaRegBell, FaBellSlash, FaRegBellSlash, FaComment, FaRegComment, FaComments, FaRegComments, FaCommentAlt, FaRegCommentAlt, FaCommentDots as FaCommentDotsSolid, FaRegCommentDots, FaCommentSlash, FaRegComment as FaRegCommentSolid, FaSms, FaRegSmileBeam, FaRegGrin, FaRegGrinAlt, FaRegGrinBeam, FaRegGrinBeamSweat, FaRegGrinHearts, FaRegGrinSquint, FaRegGrinSquintTears, FaRegGrinStars, FaRegGrinTears, FaRegGrinTongue, FaRegGrinTongueSquint, FaRegGrinTongueWink, FaRegGrinWink, FaRegKiss, FaRegKissBeam, FaRegKissWinkHeart, FaRegLaughBeam, FaRegLaughSquint, FaRegLaughWink, FaRegMeh, FaRegMehBlank, FaRegMehRollingEyes, FaRegSadCry, FaRegSadTear, FaRegSmile as FaRegSmileSolid, FaRegSmileBeam as FaRegSmileBeamSolid, FaRegSmileWink, FaRegSurprise, FaRegTired } from "react-icons/fa";
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
  setDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  serverTimestamp,
  Timestamp,
  increment,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';

import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { db, auth } from '../../config/firebase';
import { supabase } from '../../config/supabase';
import supabaseMediaService from '../../services/supabaseMediaService';
import API_BASE_URL from '../../services/apiConfig';

// ============================================
// CONSTANTS
// ============================================

const COMPANY_SIZES = [
  { value: '1-10', label: '1-10 employees' },
  { value: '11-50', label: '11-50 employees' },
  { value: '51-200', label: '51-200 employees' },
  { value: '201-500', label: '201-500 employees' },
  { value: '501-1000', label: '501-1000 employees' },
  { value: '1001-5000', label: '1001-5000 employees' },
  { value: '5000+', label: '5000+ employees' },
];

const INDUSTRIES = [
  'Technology',
  'Finance',
  'Healthcare',
  'Education',
  'Retail',
  'Manufacturing',
  'Agriculture',
  'Tourism',
  'Construction',
  'Energy',
  'Transportation',
  'Media & Entertainment',
  'Real Estate',
  'Consulting',
  'Legal',
  'Non-Profit',
  'Government',
  'Other',
];

const SOCIAL_PLATFORMS = [
  { id: 'linkedin', name: 'LinkedIn', icon: FaLinkedin, color: 'text-blue-600', placeholder: 'https://linkedin.com/company/your-company' },
  { id: 'twitter', name: 'Twitter', icon: FaTwitter, color: 'text-sky-500', placeholder: 'https://twitter.com/your-company' },
  { id: 'facebook', name: 'Facebook', icon: FaFacebook, color: 'text-blue-700', placeholder: 'https://facebook.com/your-company' },
  { id: 'instagram', name: 'Instagram', icon: FaInstagram, color: 'text-pink-600', placeholder: 'https://instagram.com/your-company' },
  { id: 'youtube', name: 'YouTube', icon: FaYoutube, color: 'text-red-600', placeholder: 'https://youtube.com/@your-company' },
];

const PROFILE_TABS = [
  { id: 'overview', label: 'Overview', icon: FaBuilding },
  { id: 'branding', label: 'Branding', icon: FaPalette },
  { id: 'culture', label: 'Culture & Values', icon: FaHeart },
  { id: 'benefits', label: 'Benefits', icon: FaAward },
  { id: 'social', label: 'Social Media', icon: FaShare },
  { id: 'media', label: 'Media Gallery', icon: FaImage },
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

// ============================================
// CUSTOM HOOKS
// ============================================

const useCompanyProfile = (companyId) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!companyId) {
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(
      doc(db, 'companies', companyId),
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          setProfile({
            id: snapshot.id,
            ...data,
            createdAt: data.createdAt?.toDate?.() || data.createdAt,
            updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
            foundedYear: data.foundedYear || null,
            verifiedAt: data.verifiedAt?.toDate?.() || data.verifiedAt,
          });
        } else {
          setProfile(null);
        }
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching profile:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [companyId]);

  return { profile, loading, error };
};

const useCompanyStats = (companyId) => {
  const [stats, setStats] = useState({
    totalJobs: 0,
    activeJobs: 0,
    totalApplications: 0,
    totalFollowers: 0,
    profileViews: 0,
    rating: 0,
    reviewCount: 0,
  });

  useEffect(() => {
    if (!companyId) return;

    // Subscribe to jobs count
    const jobsQuery = query(
      collection(db, 'jobs'),
      where('companyId', '==', companyId)
    );

    const jobsUnsub = onSnapshot(jobsQuery, (snapshot) => {
      const jobs = snapshot.docs.map(doc => doc.data());
      setStats(prev => ({
        ...prev,
        totalJobs: jobs.length,
        activeJobs: jobs.filter(j => j.status === 'active').length,
      }));
    });

    // Subscribe to applications count
    const appsQuery = query(
      collection(db, 'applications'),
      where('companyId', '==', companyId)
    );

    const appsUnsub = onSnapshot(appsQuery, (snapshot) => {
      setStats(prev => ({
        ...prev,
        totalApplications: snapshot.docs.length,
      }));
    });

    // Subscribe to followers count
    const followersQuery = query(
      collection(db, 'companyFollowers'),
      where('companyId', '==', companyId)
    );

    const followersUnsub = onSnapshot(followersQuery, (snapshot) => {
      setStats(prev => ({
        ...prev,
        totalFollowers: snapshot.docs.length,
      }));
    });

    return () => {
      jobsUnsub();
      appsUnsub();
      followersUnsub();
    };
  }, [companyId]);

  return stats;
};

// ============================================
// COMPONENTS
// ============================================

const LoadingSkeleton = () => (
  <div className="animate-pulse space-y-6">
    <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-2xl"></div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-4">
        <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
        <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
      </div>
      <div className="space-y-4">
        <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
        <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
      </div>
    </div>
  </div>
);

const ImageUploader = ({ 
  currentImage, 
  onUpload, 
  uploading, 
  aspect = 'square', 
  label = 'Upload Image',
  maxSize = 5,
  folder = 'company'
}) => {
  const inputRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFileSelect = (file) => {
    if (!file) return;

    // Validate
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      return;
    }

    if (file.size > maxSize * 1024 * 1024) {
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);

    onUpload(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    handleFileSelect(file);
  };

  const aspectClasses = {
    square: 'aspect-square',
    video: 'aspect-video',
    wide: 'aspect-[3/1]',
  };

  return (
    <div
      className={`relative group cursor-pointer rounded-xl overflow-hidden border-2 border-dashed transition-colors ${aspectClasses[aspect]} ${
        dragActive 
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
          : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
      }`}
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
      onDragLeave={() => setDragActive(false)}
      onDrop={handleDrop}
    >
      {(preview || currentImage) ? (
        <>
          <img
            src={preview || currentImage}
            alt="Preview"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <div className="text-center text-white">
              <FaCamera className="w-8 h-8 mx-auto mb-2" />
              <span className="text-sm font-medium">Change Image</span>
            </div>
          </div>
        </>
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center">
          <FaCloudUploadAlt className="w-10 h-10 text-gray-400 mb-2" />
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {label}
          </span>
          <span className="text-xs text-gray-400 mt-1">
            Click or drag to upload (max {maxSize}MB)
          </span>
        </div>
      )}

      {uploading && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
          <div className="text-center text-white">
            <FaSpinner className="w-8 h-8 animate-spin mx-auto mb-2" />
            <span className="text-sm">Uploading...</span>
          </div>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={(e) => handleFileSelect(e.target.files?.[0])}
        className="hidden"
      />
    </div>
  );
};

const TagInput = ({ tags = [], onChange, placeholder = 'Add tag...', maxTags = 20 }) => {
  const [input, setInput] = useState('');

  const handleAdd = () => {
    const trimmed = input.trim();
    if (trimmed && !tags.includes(trimmed) && tags.length < maxTags) {
      onChange([...tags, trimmed]);
      setInput('');
    }
  };

  const handleRemove = (tag) => {
    onChange(tags.filter(t => t !== tag));
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-2">
        {tags.map((tag, index) => (
          <span
            key={index}
            className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full text-sm"
          >
            {tag}
            <button
              type="button"
              onClick={() => handleRemove(tag)}
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
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAdd())}
          placeholder={placeholder}
          className="flex-1 px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={tags.length >= maxTags}
        />
        <button
          type="button"
          onClick={handleAdd}
          disabled={tags.length >= maxTags}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          <FaPlus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

const BenefitEditor = ({ benefits = [], onChange }) => {
  const [newBenefit, setNewBenefit] = useState({ title: '', description: '', icon: 'FaAward' });

  const iconOptions = [
    'FaAward', 'FaHeart', 'FaRocket', 'FaTrophy', 'FaStar', 'FaGem', 
    'FaMedal', 'FaCrown', 'FaGift', 'FaCoffee', 'FaUtensils', 'FaDumbbell',
    'FaBook', 'FaGraduationCap', 'FaPlane', 'FaCar', 'FaHome', 'FaBolt'
  ];

  const handleAdd = () => {
    if (newBenefit.title.trim()) {
      onChange([...benefits, { ...newBenefit, id: Date.now() }]);
      setNewBenefit({ title: '', description: '', icon: 'FaAward' });
    }
  };

  const handleRemove = (id) => {
    onChange(benefits.filter(b => b.id !== id));
  };

  return (
    <div className="space-y-4">
      {benefits.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {benefits.map((benefit) => (
            <div
              key={benefit.id}
              className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
            >
              <div className="p-2 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-lg">
                <FaCheckCircle className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-white text-sm">
                  {benefit.title}
                </p>
                {benefit.description && (
                  <p className="text-xs text-gray-500 mt-1">{benefit.description}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => handleRemove(benefit.id)}
                className="p-1 text-gray-400 hover:text-red-500"
              >
                <FaTimes className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg space-y-3">
        <input
          type="text"
          value={newBenefit.title}
          onChange={(e) => setNewBenefit({ ...newBenefit, title: e.target.value })}
          placeholder="Benefit title (e.g., Health Insurance)"
          className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="text"
          value={newBenefit.description}
          onChange={(e) => setNewBenefit({ ...newBenefit, description: e.target.value })}
          placeholder="Short description (optional)"
          className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="button"
          onClick={handleAdd}
          disabled={!newBenefit.title.trim()}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <FaPlus className="w-4 h-4" />
          Add Benefit
        </button>
      </div>
    </div>
  );
};

const ValueEditor = ({ values = [], onChange }) => {
  const [newValue, setNewValue] = useState({ title: '', description: '' });

  const handleAdd = () => {
    if (newValue.title.trim()) {
      onChange([...values, { ...newValue, id: Date.now() }]);
      setNewValue({ title: '', description: '' });
    }
  };

  const handleRemove = (id) => {
    onChange(values.filter(v => v.id !== id));
  };

  return (
    <div className="space-y-4">
      {values.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {values.map((value) => (
            <div
              key={value.id}
              className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {value.title}
                  </p>
                  {value.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {value.description}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => handleRemove(value.id)}
                  className="p-1 text-gray-400 hover:text-red-500"
                >
                  <FaTimes className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg space-y-3">
        <input
          type="text"
          value={newValue.title}
          onChange={(e) => setNewValue({ ...newValue, title: e.target.value })}
          placeholder="Value title (e.g., Innovation)"
          className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <textarea
          value={newValue.description}
          onChange={(e) => setNewValue({ ...newValue, description: e.target.value })}
          placeholder="Describe this value (optional)"
          rows={2}
          className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
        <button
          type="button"
          onClick={handleAdd}
          disabled={!newValue.title.trim()}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <FaPlus className="w-4 h-4" />
          Add Value
        </button>
      </div>
    </div>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================

const CompanyProfile = () => {
  const navigate = useNavigate();
  const { currentUser, userProfile, refreshUserProfile } = useAuth();
  const { showNotification } = useNotification();

  const companyId = userProfile?.companyId || currentUser?.companyId || currentUser?.uid;
  const { profile, loading: profileLoading, error: profileError } = useCompanyProfile(companyId);
  const stats = useCompanyStats(companyId);

  // Local state
  const [activeTab, setActiveTab] = useState('overview');
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    tagline: '',
    email: '',
    phone: '',
    website: '',
    address: '',
    city: '',
    country: 'Lesotho',
    industry: '',
    size: '',
    foundedYear: '',
    description: '',
    mission: '',
    vision: '',
    culture: '',
    benefits: [],
    values: [],
    socialLinks: {
      linkedin: '',
      twitter: '',
      facebook: '',
      instagram: '',
      youtube: '',
    },
    brandColors: {
      primary: '#3B82F6',
      secondary: '#8B5CF6',
      accent: '#F59E0B',
    },
    media: [],
  });
  const [errors, setErrors] = useState({});

  // Sync form with profile
  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || profile.companyName || '',
        tagline: profile.tagline || '',
        email: profile.email || '',
        phone: profile.phone || '',
        website: profile.website || '',
        address: profile.address || '',
        city: profile.city || '',
        country: profile.country || 'Lesotho',
        industry: profile.industry || '',
        size: profile.size || profile.companySize || '',
        foundedYear: profile.foundedYear || '',
        description: profile.description || '',
        mission: profile.mission || '',
        vision: profile.vision || '',
        culture: profile.culture || '',
        benefits: profile.benefits || [],
        values: profile.values || [],
        socialLinks: {
          linkedin: profile.socialLinks?.linkedin || '',
          twitter: profile.socialLinks?.twitter || '',
          facebook: profile.socialLinks?.facebook || '',
          instagram: profile.socialLinks?.instagram || '',
          youtube: profile.socialLinks?.youtube || '',
        },
        brandColors: {
          primary: profile.brandColors?.primary || '#3B82F6',
          secondary: profile.brandColors?.secondary || '#8B5CF6',
          accent: profile.brandColors?.accent || '#F59E0B',
        },
        media: profile.media || [],
      });
    }
  }, [profile]);

  // ============================================
  // HANDLERS
  // ============================================

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Company name is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!formData.industry) {
      newErrors.industry = 'Industry is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm() || !companyId) return;

    try {
      setSaving(true);

      const updates = {
        ...formData,
        companyName: formData.name,
        updatedAt: serverTimestamp(),
      };

      // Update Firebase
      await updateDoc(doc(db, 'companies', companyId), updates);

      // Update auth profile
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, {
          displayName: formData.name,
        });
      }

      // Sync to Supabase for search
      await supabase
        .from('companies')
        .upsert({
          id: companyId,
          name: formData.name,
          tagline: formData.tagline,
          industry: formData.industry,
          city: formData.city,
          country: formData.country,
          size: formData.size,
          description: formData.description,
          website: formData.website,
          email: formData.email,
          phone: formData.phone,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'id' });

      // Log activity
      await supabase
        .from('company_activities')
        .insert({
          company_id: companyId,
          activity_type: 'profile_updated',
          metadata: { updated_fields: Object.keys(formData) },
          created_at: new Date().toISOString(),
        });

      showNotification('success', 'Profile updated successfully!');
      setEditing(false);
      await refreshUserProfile();
    } catch (error) {
      console.error('Error saving profile:', error);
      showNotification('error', 'Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (file) => {
    if (!companyId) return;

    try {
      setUploadingLogo(true);

      const token = await auth.currentUser?.getIdToken();
      if (!token) throw new Error('Please sign in again before uploading the company logo.');
      const formData = new FormData();
      formData.append('file', file);
      formData.append('assetType', 'logo');
      const response = await fetch(`${API_BASE_URL}/api/media/company/branding-image`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: formData });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || !payload.success || !payload.data?.url) throw new Error(payload.message || 'Upload failed.');

      showNotification('success', 'Logo updated successfully!');
    } catch (error) {
      console.error('Error uploading logo:', error);
      showNotification('error', error.message || 'Failed to upload logo.');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleCoverUpload = async (file) => {
    if (!companyId) return;

    try {
      setUploadingCover(true);

      const token = await auth.currentUser?.getIdToken();
      if (!token) throw new Error('Please sign in again before uploading the company cover.');
      const formData = new FormData();
      formData.append('file', file);
      formData.append('assetType', 'cover');
      const response = await fetch(`${API_BASE_URL}/api/media/company/branding-image`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: formData });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || !payload.success || !payload.data?.url) throw new Error(payload.message || 'Upload failed.');

      showNotification('success', 'Cover image updated successfully!');
    } catch (error) {
      console.error('Error uploading cover:', error);
      showNotification('error', error.message || 'Failed to upload cover image.');
    } finally {
      setUploadingCover(false);
    }
  };

  const handleMediaUpload = async (file) => {
    if (!companyId) return;

    try {
      const result = await supabaseMediaService.uploadImage(file, {
        folder: 'career-connect/company-media',
        publicId: `company-${companyId}-media-${Date.now()}`,
        transformation: [
          { width: 800, height: 600, crop: 'limit' },
          { quality: 'auto', fetch_format: 'auto' },
        ],
      });

      if (!result.success) {
        throw new Error(result.error || 'Upload failed');
      }

      const newMedia = {
        id: Date.now(),
        url: result.url,
        publicId: result.publicId,
        type: file.type.startsWith('video') ? 'video' : 'image',
        name: file.name,
        uploadedAt: new Date().toISOString(),
      };

      await updateDoc(doc(db, 'companies', companyId), {
        media: arrayUnion(newMedia),
        updatedAt: serverTimestamp(),
      });

      showNotification('success', 'Media added successfully!');
    } catch (error) {
      console.error('Error uploading media:', error);
      showNotification('error', 'Failed to upload media.');
    }
  };

  const handleMediaDelete = async (mediaItem) => {
    if (!companyId) return;

    try {
      // Delete from supabase
      if (mediaItem.publicId) {
        try {
          await supabaseMediaService.deleteImage(mediaItem.publicId);
        } catch (err) {
          console.log('Could not delete from supabase:', err);
        }
      }

      // Remove from Firebase
      await updateDoc(doc(db, 'companies', companyId), {
        media: arrayRemove(mediaItem),
        updatedAt: serverTimestamp(),
      });

      showNotification('success', 'Media deleted successfully!');
    } catch (error) {
      console.error('Error deleting media:', error);
      showNotification('error', 'Failed to delete media.');
    }
  };

  const handleSocialLinkChange = (platform, value) => {
    setFormData(prev => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [platform]: value,
      },
    }));
  };

  const handleBrandColorChange = (colorType, value) => {
    setFormData(prev => ({
      ...prev,
      brandColors: {
        ...prev.brandColors,
        [colorType]: value,
      },
    }));
  };

  // ============================================
  // RENDER
  // ============================================

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <LoadingSkeleton />
        </div>
      </div>
    );
  }

  if (profileError) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 max-w-md text-center">
          <FaExclamationTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Failed to load profile
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-4">{profileError}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Reload Page
          </button>
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
              <FaBuilding className="w-8 h-8 text-blue-600" />
              Company Profile
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Manage your company's public profile and branding
            </p>
          </div>

          <div className="flex items-center gap-3">
            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <FaEdit className="w-4 h-4" />
                Edit Profile
              </button>
            ) : (
              <>
                <button
                  onClick={() => {
                    setEditing(false);
                    setErrors({});
                  }}
                  className="px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <FaSpinner className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <FaSave className="w-4 h-4" />
                      Save Changes
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </motion.div>

        {/* Cover & Logo Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden mb-6"
        >
          {/* Cover Image */}
          <div className="relative h-48 md:h-64">
            {profile?.coverImage ? (
              <img
                src={profile.coverImage}
                alt="Company cover"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
            )}
            {editing && (
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                <ImageUploader
                  currentImage={profile?.coverImage}
                  onUpload={handleCoverUpload}
                  uploading={uploadingCover}
                  aspect="wide"
                  label="Upload Cover Image"
                  maxSize={10}
                />
              </div>
            )}
          </div>

          {/* Logo & Info */}
          <div className="px-6 pb-6 relative">
            <div className="flex flex-col md:flex-row md:items-end gap-4 -mt-16 md:-mt-20">
              {/* Logo */}
              <div className="relative">
                {editing ? (
                  <div className="w-32 h-32 md:w-40 md:h-40">
                    <ImageUploader
                      currentImage={profile?.logo}
                      onUpload={handleLogoUpload}
                      uploading={uploadingLogo}
                      aspect="square"
                      label="Upload Logo"
                      maxSize={5}
                    />
                  </div>
                ) : (
                  <div className="w-32 h-32 md:w-40 md:h-40 rounded-2xl overflow-hidden border-4 border-white dark:border-gray-800 bg-white dark:bg-gray-800 shadow-lg">
                    {profile?.logo ? (
                      <img
                        src={profile.logo}
                        alt={profile.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-5xl font-bold">
                        {(profile?.name || profile?.companyName)?.charAt(0) || 'C'}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Company Info */}
              <div className="flex-1 pb-4">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                    {formData.name || 'Your Company'}
                  </h1>
                  {profile?.isVerified && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium">
                      <FaShieldAlt className="w-3 h-3" />
                      Verified
                    </span>
                  )}
                </div>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                  {formData.tagline || formData.industry || 'Company'}
                </p>
                
                <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-500 dark:text-gray-400">
                  {formData.city && (
                    <span className="flex items-center gap-1">
                      <FaMapMarkerAlt className="w-4 h-4" />
                      {formData.city}, {formData.country}
                    </span>
                  )}
                  {formData.website && (
                    <a
                      href={formData.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-blue-600 hover:text-blue-700"
                    >
                      <FaGlobe className="w-4 h-4" />
                      {formData.website.replace(/^https?:\/\//, '')}
                    </a>
                  )}
                  {formData.foundedYear && (
                    <span className="flex items-center gap-1">
                      <FaCalendarAlt className="w-4 h-4" />
                      Founded {formData.foundedYear}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatNumber(stats.totalJobs)}
                </p>
                <p className="text-sm text-gray-500">Jobs Posted</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatNumber(stats.activeJobs)}
                </p>
                <p className="text-sm text-gray-500">Active Jobs</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatNumber(stats.totalFollowers)}
                </p>
                <p className="text-sm text-gray-500">Followers</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatNumber(stats.totalApplications)}
                </p>
                <p className="text-sm text-gray-500">Applications</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="flex border-b border-gray-100 dark:border-gray-700 overflow-x-auto">
            {PROFILE_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50 dark:bg-blue-900/10'
                    : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-6">
            <AnimatePresence mode="wait">
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  {/* Basic Info */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Basic Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Company Name *
                        </label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          disabled={!editing}
                          className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60 ${
                            errors.name ? 'border-red-500' : 'border-gray-200 dark:border-gray-600'
                          }`}
                        />
                        {errors.name && (
                          <p className="mt-1 text-sm text-red-500">{errors.name}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Tagline
                        </label>
                        <input
                          type="text"
                          value={formData.tagline}
                          onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                          disabled={!editing}
                          placeholder="A short memorable phrase"
                          className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Email *
                        </label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          disabled={!editing}
                          className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60 ${
                            errors.email ? 'border-red-500' : 'border-gray-200 dark:border-gray-600'
                          }`}
                        />
                        {errors.email && (
                          <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Phone
                        </label>
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          disabled={!editing}
                          className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Website
                        </label>
                        <input
                          type="url"
                          value={formData.website}
                          onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                          disabled={!editing}
                          placeholder="https://example.com"
                          className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Industry *
                        </label>
                        <select
                          value={formData.industry}
                          onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                          disabled={!editing}
                          className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60 ${
                            errors.industry ? 'border-red-500' : 'border-gray-200 dark:border-gray-600'
                          }`}
                        >
                          <option value="">Select Industry</option>
                          {INDUSTRIES.map(industry => (
                            <option key={industry} value={industry}>{industry}</option>
                          ))}
                        </select>
                        {errors.industry && (
                          <p className="mt-1 text-sm text-red-500">{errors.industry}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Company Size
                        </label>
                        <select
                          value={formData.size}
                          onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                          disabled={!editing}
                          className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
                        >
                          <option value="">Select Size</option>
                          {COMPANY_SIZES.map(size => (
                            <option key={size.value} value={size.value}>{size.label}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Founded Year
                        </label>
                        <input
                          type="number"
                          value={formData.foundedYear}
                          onChange={(e) => setFormData({ ...formData, foundedYear: e.target.value })}
                          disabled={!editing}
                          min="1900"
                          max={new Date().getFullYear()}
                          className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Address */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Location
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Street Address
                        </label>
                        <input
                          type="text"
                          value={formData.address}
                          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                          disabled={!editing}
                          className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          City
                        </label>
                        <input
                          type="text"
                          value={formData.city}
                          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                          disabled={!editing}
                          className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Country
                        </label>
                        <input
                          type="text"
                          value={formData.country}
                          onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                          disabled={!editing}
                          className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      About Company
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Description
                        </label>
                        <textarea
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          disabled={!editing}
                          rows={4}
                          placeholder="Tell candidates about your company..."
                          className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60 resize-none"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Mission
                          </label>
                          <textarea
                            value={formData.mission}
                            onChange={(e) => setFormData({ ...formData, mission: e.target.value })}
                            disabled={!editing}
                            rows={3}
                            placeholder="Your company's mission..."
                            className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60 resize-none"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Vision
                          </label>
                          <textarea
                            value={formData.vision}
                            onChange={(e) => setFormData({ ...formData, vision: e.target.value })}
                            disabled={!editing}
                            rows={3}
                            placeholder="Your company's vision..."
                            className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60 resize-none"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Branding Tab */}
              {activeTab === 'branding' && (
                <motion.div
                  key="branding"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      Brand Colors
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                      These colors will be used across your company profile and job postings.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {[
                        { key: 'primary', label: 'Primary Color' },
                        { key: 'secondary', label: 'Secondary Color' },
                        { key: 'accent', label: 'Accent Color' },
                      ].map(({ key, label }) => (
                        <div key={key}>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            {label}
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={formData.brandColors[key]}
                              onChange={(e) => handleBrandColorChange(key, e.target.value)}
                              disabled={!editing}
                              className="w-12 h-12 rounded-lg cursor-pointer border-0 disabled:opacity-60"
                            />
                            <input
                              type="text"
                              value={formData.brandColors[key]}
                              onChange={(e) => handleBrandColorChange(key, e.target.value)}
                              disabled={!editing}
                              className="flex-1 px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60 font-mono text-sm"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Brand Preview */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Preview
                    </h3>
                    <div
                      className="p-6 rounded-xl"
                      style={{
                        background: `linear-gradient(135deg, ${formData.brandColors.primary}20, ${formData.brandColors.secondary}20)`,
                      }}
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className="w-16 h-16 rounded-xl flex items-center justify-center text-white text-2xl font-bold"
                          style={{ backgroundColor: formData.brandColors.primary }}
                        >
                          {formData.name?.charAt(0) || 'C'}
                        </div>
                        <div>
                          <h4
                            className="text-xl font-bold"
                            style={{ color: formData.brandColors.primary }}
                          >
                            {formData.name || 'Company Name'}
                          </h4>
                          <p className="text-gray-600 dark:text-gray-400">
                            {formData.tagline || 'Your company tagline'}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <button
                          className="px-4 py-2 rounded-lg text-white text-sm font-medium"
                          style={{ backgroundColor: formData.brandColors.primary }}
                        >
                          View Jobs
                        </button>
                        <button
                          className="px-4 py-2 rounded-lg text-white text-sm font-medium"
                          style={{ backgroundColor: formData.brandColors.secondary }}
                        >
                          Follow
                        </button>
                        <button
                          className="px-4 py-2 rounded-lg text-white text-sm font-medium"
                          style={{ backgroundColor: formData.brandColors.accent }}
                        >
                          Contact
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Culture Tab */}
              {activeTab === 'culture' && (
                <motion.div
                  key="culture"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      Culture & Values
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                      Share your company culture and core values to attract like-minded candidates.
                    </p>

                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Culture Description
                      </label>
                      <textarea
                        value={formData.culture}
                        onChange={(e) => setFormData({ ...formData, culture: e.target.value })}
                        disabled={!editing}
                        rows={4}
                        placeholder="Describe your company culture..."
                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60 resize-none"
                      />
                    </div>

                    <div>
                      <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">
                        Core Values
                      </h4>
                      <ValueEditor
                        values={formData.values}
                        onChange={(values) => setFormData({ ...formData, values })}
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Benefits Tab */}
              {activeTab === 'benefits' && (
                <motion.div
                  key="benefits"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Employee Benefits
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    Highlight the benefits you offer to attract top talent.
                  </p>
                  <BenefitEditor
                    benefits={formData.benefits}
                    onChange={(benefits) => setFormData({ ...formData, benefits })}
                  />
                </motion.div>
              )}

              {/* Social Tab */}
              {activeTab === 'social' && (
                <motion.div
                  key="social"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      Social Media Links
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                      Connect your social media accounts to increase visibility.
                    </p>

                    <div className="space-y-4">
                      {SOCIAL_PLATFORMS.map((platform) => (
                        <div key={platform.id}>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            <platform.icon className={`w-4 h-4 inline mr-2 ${platform.color}`} />
                            {platform.name}
                          </label>
                          <input
                            type="url"
                            value={formData.socialLinks[platform.id]}
                            onChange={(e) => handleSocialLinkChange(platform.id, e.target.value)}
                            disabled={!editing}
                            placeholder={platform.placeholder}
                            className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Media Tab */}
              {activeTab === 'media' && (
                <motion.div
                  key="media"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Media Gallery
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Showcase your office, team, and company events.
                      </p>
                    </div>
                    {editing && (
                      <label className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors cursor-pointer flex items-center gap-2">
                        <FaCloudUploadAlt className="w-4 h-4" />
                        Upload Media
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleMediaUpload(file);
                          }}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>

                  {formData.media && formData.media.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {formData.media.map((item, index) => (
                        <div
                          key={index}
                          className="relative group aspect-square rounded-xl overflow-hidden"
                        >
                          <img
                            src={item.url}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                          {editing && (
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <button
                                onClick={() => handleMediaDelete(item)}
                                className="p-3 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                              >
                                <FaTrash className="w-5 h-5" />
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-gray-50 dark:bg-gray-700 rounded-xl">
                      <FaImage className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-500 dark:text-gray-400">
                        No media uploaded yet
                      </p>
                      {editing && (
                        <label className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors cursor-pointer">
                          <FaCloudUploadAlt className="w-4 h-4" />
                          Upload First Image
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleMediaUpload(file);
                            }}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyProfile;
