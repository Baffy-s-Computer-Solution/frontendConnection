// src/pages/company/CompanyBranding.jsx
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FaPalette, FaSave, FaCamera, FaImage, FaCloudUploadAlt, FaTrash, FaPlus, FaTimes, FaCheck, FaCheckCircle, FaSpinner, FaExclamationTriangle, FaInfoCircle, FaEye, FaFont, FaVideo, FaBullhorn, FaShare, FaCopy as FaCopyIcon, FaLink, FaExternalLinkAlt, FaDownload, FaUpload, FaUndo, FaRedo, FaSync, FaCog, FaSlidersH, FaMagic, FaBrain, FaLightbulb, FaRocket, FaStar, FaRegStar, FaHeart, FaRegHeart, FaThumbsUp, FaRegThumbsUp, FaBookmark, FaRegBookmark, FaFlag, FaTrophy, FaAward, FaMedal, FaCrown, FaGem, FaHandshake, FaUsers, FaUserFriends, FaBuilding, FaGlobe, FaLinkedin, FaTwitter, FaFacebook, FaInstagram, FaYoutube, FaTiktok, FaWhatsapp, FaPinterest, FaSnapchat, FaReddit, FaMedium, FaBehance, FaDribbble, FaGithub, FaStackOverflow, FaRegCopy, FaRegImage, FaRegFileAlt, FaRegEye, FaRegClock, FaRegCalendar, FaRegSmile, FaRegLaugh, FaRegGrinStars, FaRegGrinHearts, FaImage as FaImageSolid, FaImages, FaPhotoVideo, FaFilm, FaCameraRetro, FaVideo as FaVideoSolid, FaPlay, FaPause, FaStop, FaRecordVinyl, FaMicrophone, FaMicrophoneAlt, FaHeadphones, FaVolumeUp, FaVolumeMute, FaVolumeDown, FaMusic, FaGuitar, FaDrum, FaBullhorn as FaBullhornSolid, FaNewspaper, FaBook, FaBookOpen, FaFileAlt, FaFilePdf, FaFileWord, FaFileExcel, FaFilePowerpoint, FaFileArchive, FaFileImage, FaFileVideo, FaFileAudio, FaFolder, FaFolderOpen, FaHdd, FaCloudUploadAlt as FaCloudUploadAltSolid, FaCloudDownloadAlt, FaCloudRain, FaSun, FaMoon, FaStar as FaStarSolid, FaHeart as FaHeartSolid, FaBell, FaRegBell, FaBellSlash, FaComment, FaRegComment, FaCommentDots, FaRegCommentDots, FaPaperPlane, FaRegPaperPlane, FaHashtag, FaAt, FaPercent, FaAsterisk, FaQuoteLeft, FaQuoteRight, FaParagraph, FaHeading, FaBold, FaItalic, FaUnderline, FaStrikethrough, FaListUl, FaListOl, FaAlignLeft, FaAlignCenter, FaAlignRight, FaAlignJustify, FaIndent, FaOutdent, FaEraser, FaHighlighter, FaPen, FaPencilAlt, FaMarker, FaRuler, FaRulerCombined, FaDraftingCompass, FaVectorSquare, FaBezierCurve, FaDrawPolygon, FaShapes, FaCube, FaCubes, FaLayerGroup, FaObjectGroup, FaObjectUngroup, FaFill, FaFillDrip, FaEyeDropper, FaSwatchbook, FaPaintBrush, FaPaintRoller, FaSprayCan, FaBroom, FaBlender, FaCut, FaPaste, FaClipboard, FaClipboardCheck, FaClipboardList, FaRegClipboard, FaSlidersH as FaSlidersHSolid, FaToggleOn, FaToggleOff, FaCogs, FaWrench, FaTools, FaHammer, FaScrewdriver, FaKey, FaLock, FaUnlock, FaShieldAlt, FaFingerprint, FaUserShield, FaUserLock, FaUserTie, FaUserGraduate, FaUsersCog, FaUserCog, FaUserEdit, FaUserCircle, FaUserTag, FaIdCard, FaAddressCard, FaAddressBook, FaPassport, FaEnvelope, FaRegEnvelope, FaPhone, FaMobile, FaFax, FaVoicemail, FaInbox, FaMailBulk, FaEnvelopeOpen, FaEnvelopeOpenText, FaRegEnvelopeOpen, FaPaperclip, FaAnchor, FaCompass, FaMap, FaMapMarked, FaMapMarkedAlt, FaMapPin, FaDirections, FaRoute, FaLocationArrow, FaCrosshairs, FaBriefcase, FaGraduationCap, FaHandHoldingHeart, FaHandHoldingUsd, FaHandsHelping, FaPrayingHands, FaPray, FaPeace, FaYinYang, FaDove, FaFeather, FaLeaf, FaSeedling, FaTree, FaSpa, FaHotTub, FaUmbrellaBeach, FaPlane, FaCar, FaBus, FaTrain, FaSubway, FaBicycle, FaWalking, FaRunning, FaHome, FaWarehouse, FaIndustry, FaStore, FaShoppingCart, FaShoppingBag, FaShoppingBasket, FaCashRegister, FaBox, FaBoxes, FaPallet, FaTruck, FaShip, FaSatellite, FaSatelliteDish, FaBroadcastTower, FaRss, FaPodcast, FaWifi, FaSignal, FaBroadcastTower as FaBroadcastTowerSolid, FaDesktop, FaLaptop, FaTabletAlt, FaMobileAlt, FaKeyboard, FaMouse, FaPrint, FaTv, FaGamepad, FaDice, FaChess, FaPuzzlePiece, FaGhost, FaDragon, FaHatWizard, FaHatCowboy, FaGlasses, FaTshirt, FaShoePrints, FaSocks, FaMitten, FaCoffee, FaMugHot, FaUtensils, FaHamburger, FaPizzaSlice, FaHotdog, FaIceCream, FaBirthdayCake, FaCookie, FaCandyCane, FaCarrot, FaLemon, FaPepperHot, FaEgg, FaCheese, FaBreadSlice, FaAppleAlt, FaHeartbeat, FaStethoscope, FaUserMd, FaUserNurse, FaPills, FaSyringe, FaVial, FaFlask, FaMicroscope, FaDna, FaAtom, FaVirus, FaRadiation, FaSkull, FaBone, FaTooth, FaAssistiveListeningSystems as FaEarListen, FaDeaf, FaSignLanguage, FaBlind, FaWheelchair, FaCrutch, FaLanguage, FaSpellCheck, FaTasks, FaProjectDiagram, FaSitemap, FaNetworkWired, FaServer, FaDatabase, FaLaptopCode, FaCode, FaTerminal, FaBug, FaSpider, FaFish, FaFrog, FaHorse, FaHorseHead, FaCat, FaDog, FaPaw, FaDove as FaDoveSolid, FaCrow, FaKiwiBird } from "react-icons/fa";
import {
  doc,
  getDoc,
  updateDoc,
  setDoc,
  serverTimestamp,
  collection,
  addDoc,
  onSnapshot,
  query,
  where,
} from 'firebase/firestore';

import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { db } from '../../config/firebase';
import API_BASE_URL from '../../services/apiConfig';

// ============================================
// CONSTANTS
// ============================================

const BRANDING_TABS = [
  { id: 'identity', label: 'Brand Identity', icon: FaPalette },
  { id: 'colors', label: 'Colors', icon: FaEyeDropper },
  { id: 'typography', label: 'Typography', icon: FaFont },
  { id: 'assets', label: 'Media Gallery', icon: FaImages },
  { id: 'social', label: 'Social Links', icon: FaShare },
  { id: 'culture', label: 'Culture & Values', icon: FaHandsHelping },
];

const FONT_FAMILIES = [
  { value: 'Inter', label: 'Inter', category: 'Sans-serif' },
  { value: 'Poppins', label: 'Poppins', category: 'Sans-serif' },
  { value: 'Montserrat', label: 'Montserrat', category: 'Sans-serif' },
  { value: 'Roboto', label: 'Roboto', category: 'Sans-serif' },
  { value: 'Open Sans', label: 'Open Sans', category: 'Sans-serif' },
  { value: 'Lato', label: 'Lato', category: 'Sans-serif' },
  { value: 'Playfair Display', label: 'Playfair Display', category: 'Serif' },
  { value: 'Merriweather', label: 'Merriweather', category: 'Serif' },
  { value: 'Georgia', label: 'Georgia', category: 'Serif' },
  { value: 'JetBrains Mono', label: 'JetBrains Mono', category: 'Monospace' },
];

const COLOR_PRESETS = [
  { name: 'Ocean Blue', primary: '#3B82F6', secondary: '#8B5CF6', accent: '#F59E0B' },
  { name: 'Forest Green', primary: '#10B981', secondary: '#059669', accent: '#FBBF24' },
  { name: 'Sunset Orange', primary: '#F97316', secondary: '#EA580C', accent: '#FCD34D' },
  { name: 'Royal Purple', primary: '#8B5CF6', secondary: '#7C3AED', accent: '#EC4899' },
  { name: 'Crimson Red', primary: '#EF4444', secondary: '#DC2626', accent: '#F59E0B' },
  { name: 'Midnight Dark', primary: '#1F2937', secondary: '#374151', accent: '#6366F1' },
  { name: 'Rose Pink', primary: '#EC4899', secondary: '#DB2777', accent: '#FBBF24' },
  { name: 'Teal Fresh', primary: '#14B8A6', secondary: '#0D9488', accent: '#F59E0B' },
];

const SOCIAL_PLATFORMS = [
  { id: 'linkedin', name: 'LinkedIn', icon: FaLinkedin, color: '#0A66C2', placeholder: 'https://linkedin.com/company/your-company' },
  { id: 'twitter', name: 'Twitter / X', icon: FaTwitter, color: '#000000', placeholder: 'https://twitter.com/your-company' },
  { id: 'facebook', name: 'Facebook', icon: FaFacebook, color: '#1877F2', placeholder: 'https://facebook.com/your-company' },
  { id: 'instagram', name: 'Instagram', icon: FaInstagram, color: '#E4405F', placeholder: 'https://instagram.com/your-company' },
  { id: 'youtube', name: 'YouTube', icon: FaYoutube, color: '#FF0000', placeholder: 'https://youtube.com/@your-company' },
  { id: 'tiktok', name: 'TikTok', icon: FaTiktok, color: '#000000', placeholder: 'https://tiktok.com/@your-company' },
  { id: 'github', name: 'GitHub', icon: FaGithub, color: '#181717', placeholder: 'https://github.com/your-company' },
  { id: 'dribbble', name: 'Dribbble', icon: FaDribbble, color: '#EA4C89', placeholder: 'https://dribbble.com/your-company' },
  { id: 'behance', name: 'Behance', icon: FaBehance, color: '#1769FF', placeholder: 'https://behance.net/your-company' },
  { id: 'medium', name: 'Medium', icon: FaMedium, color: '#000000', placeholder: 'https://medium.com/@your-company' },
];

// ============================================
// UTILITY FUNCTIONS
// ============================================

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

// ============================================
// COMPONENTS
// ============================================

const LoadingSkeleton = () => (
  <div className="animate-pulse space-y-6">
    <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-2xl"></div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 h-96 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
      <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
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
  description 
}) => {
  const inputRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFileSelect = (file) => {
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) return;
    if (file.size > maxSize * 1024 * 1024) return;

    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(file);

    onUpload(file);
  };

  const aspectClasses = {
    square: 'aspect-square',
    video: 'aspect-video',
    wide: 'aspect-[3/1]',
    banner: 'aspect-[4/1]',
  };

  return (
    <div>
      <div
        className={`relative group cursor-pointer rounded-xl overflow-hidden border-2 border-dashed transition-colors ${aspectClasses[aspect]} ${
          dragActive
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
        }`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
        onDragLeave={() => setDragActive(false)}
        onDrop={(e) => { e.preventDefault(); setDragActive(false); handleFileSelect(e.dataTransfer.files?.[0]); }}
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
                <span className="text-sm font-medium">Change</span>
              </div>
            </div>
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center">
            <FaCloudUploadAlt className="w-10 h-10 text-gray-400 mb-2" />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {label}
            </span>
            {description && (
              <span className="text-xs text-gray-400 mt-1">{description}</span>
            )}
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
      {label && (
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">{label}</p>
      )}
    </div>
  );
};

const ColorPicker = ({ label, value, onChange }) => {
  const [inputValue, setInputValue] = useState(value);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleChange = (newValue) => {
    setInputValue(newValue);
    if (/^#[0-9A-Fa-f]{6}$/.test(newValue)) {
      onChange(newValue);
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {label}
      </label>
      <div className="flex items-center gap-3">
        <div className="relative">
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-14 h-14 rounded-xl cursor-pointer border-2 border-gray-200 dark:border-gray-600"
            style={{ backgroundColor: value }}
          />
        </div>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => handleChange(e.target.value)}
          className="flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
          placeholder="#000000"
        />
      </div>
    </div>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================

const CompanyBranding = () => {
  const navigate = useNavigate();
  const { currentUser, userProfile } = useAuth();
  const { showNotification } = useNotification();

  const companyId = userProfile?.companyId || currentUser?.companyId || currentUser?.uid;

  // State
  const [activeTab, setActiveTab] = useState('identity');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedBrandData, setSavedBrandData] = useState(null);
  const [uploading, setUploading] = useState({ logo: false, cover: false, banner: false });
  const [brandData, setBrandData] = useState({
    logo: '',
    coverImage: '',
    bannerImage: '',
    tagline: '',
    primaryColor: '#3B82F6',
    secondaryColor: '#8B5CF6',
    accentColor: '#F59E0B',
    textColor: '#111827',
    backgroundColor: '#FFFFFF',
    headingFont: 'Inter',
    bodyFont: 'Inter',
    socialLinks: {},
    culture: {
      values: [],
      description: '',
      perks: [],
    },
    mediaGallery: [],
  });

  // ============================================
  // LOAD DATA
  // ============================================

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
          const savedData = {
            logo: data.logo || '',
            coverImage: data.coverImage || '',
            bannerImage: data.bannerImage || '',
            tagline: data.tagline || '',
            primaryColor: data.brandColors?.primary || '#3B82F6',
            secondaryColor: data.brandColors?.secondary || '#8B5CF6',
            accentColor: data.brandColors?.accent || '#F59E0B',
            textColor: data.brandColors?.text || '#111827',
            backgroundColor: data.brandColors?.background || '#FFFFFF',
            headingFont: data.typography?.heading || 'Inter',
            bodyFont: data.typography?.body || 'Inter',
            socialLinks: data.socialLinks || {},
            culture: data.culture || { values: [], description: '', perks: [] },
            mediaGallery: data.mediaGallery || [],
          };
          setBrandData(savedData);
          setSavedBrandData(savedData);
        }
        setLoading(false);
      },
      (err) => {
        console.error('Error loading brand data:', err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [companyId]);

  // ============================================
  // HANDLERS
  // ============================================

  const handleSave = async () => {
    if (!companyId) return;

    try {
      setSaving(true);

      const updates = {
        logo: brandData.logo,
        coverImage: brandData.coverImage,
        bannerImage: brandData.bannerImage,
        tagline: brandData.tagline,
        brandColors: {
          primary: brandData.primaryColor,
          secondary: brandData.secondaryColor,
          accent: brandData.accentColor,
          text: brandData.textColor,
          background: brandData.backgroundColor,
        },
        typography: {
          heading: brandData.headingFont,
          body: brandData.bodyFont,
        },
        socialLinks: brandData.socialLinks,
        culture: brandData.culture,
        mediaGallery: brandData.mediaGallery,
        updatedAt: serverTimestamp(),
      };

      await updateDoc(doc(db, 'companies', companyId), updates);
      setSavedBrandData(brandData);

      // Log activity
      await addDoc(collection(db, 'companyActivities'), {
        companyId,
        type: 'branding_updated',
        description: 'Brand assets updated',
        createdAt: serverTimestamp(),
      });

      showNotification('success', 'Branding saved successfully!');
    } catch (error) {
      console.error('Error saving branding:', error);
      showNotification('error', 'Failed to save branding');
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (type, file) => {
    if (!companyId || !file) return;

    try {
      setUploading(prev => ({ ...prev, [type]: true }));

      if (!['logo', 'cover'].includes(type)) throw new Error('Only logo and cover uploads are supported.');
      const token = await currentUser.getIdToken();
      const formData = new FormData();
      formData.append('file', file);
      formData.append('assetType', type);
      const response = await fetch(`${API_BASE_URL}/api/media/company/branding-image`, {
        method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: formData,
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || !payload.success || !payload.data?.url) throw new Error(payload.message || 'Upload failed.');
      const field = type === 'logo' ? 'logo' : 'coverImage';
      const publicIdField = type === 'logo' ? 'logoPublicId' : 'coverImagePublicId';
      setBrandData((prev) => ({ ...prev, [field]: payload.data.url }));

      showNotification('success', `${type.charAt(0).toUpperCase() + type.slice(1)} uploaded!`);
    } catch (error) {
      console.error(`Error uploading ${type}:`, error);
      showNotification('error', error.message || `Failed to upload ${type}`);
    } finally {
      setUploading(prev => ({ ...prev, [type]: false }));
    }
  };

  const handleMediaUpload = async (file) => {
    if (!companyId || !file) return;
    showNotification('error', 'Gallery uploads are not enabled by the authenticated company media API yet. Use the logo and cover image fields.');
  };

  const handleMediaDelete = async (mediaItem) => {
    if (!companyId) return;

    showNotification('error', 'Gallery deletion is not enabled by the authenticated company media API yet.');
  };

  const handleSocialChange = (platformId, value) => {
    setBrandData(prev => ({
      ...prev,
      socialLinks: { ...prev.socialLinks, [platformId]: value },
    }));
  };

  const applyColorPreset = (preset) => {
    setBrandData(prev => ({
      ...prev,
      primaryColor: preset.primary,
      secondaryColor: preset.secondary,
      accentColor: preset.accent,
    }));
  };

  // ============================================
  // RENDER
  // ============================================

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <LoadingSkeleton />
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
              <FaPalette className="w-8 h-8 text-blue-600" />
              Branding Studio
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Customize your company's visual identity and brand assets
            </p>
          </div>

          {savedBrandData && JSON.stringify(savedBrandData) !== JSON.stringify(brandData) && <button
            type="button"
            onClick={() => setBrandData(savedBrandData)}
            disabled={saving}
            className="px-5 py-3 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700 disabled:opacity-50"
          >Cancel</button>}
          <button
            onClick={handleSave}
            disabled={saving || !savedBrandData || JSON.stringify(savedBrandData) === JSON.stringify(brandData)}
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
        </motion.div>

        {/* Preview Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden mb-6"
        >
          {/* Cover */}
          <div
            className="h-40 md:h-56 bg-gradient-to-r from-blue-500 to-purple-500 relative"
            style={brandData.coverImage ? { backgroundImage: `url(${brandData.coverImage})`, backgroundSize: 'cover', backgroundPosition: 'center' } : { background: `linear-gradient(to right, ${brandData.primaryColor}, ${brandData.secondaryColor})` }}
          >
            <div className="absolute inset-0 bg-black/20" />
          </div>

          {/* Logo & Info */}
          <div className="px-6 pb-6 relative">
            <div className="flex flex-col md:flex-row items-start md:items-end gap-4 -mt-12 md:-mt-16">
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl overflow-hidden border-4 border-white dark:border-gray-800 bg-white dark:bg-gray-800 shadow-lg">
                {brandData.logo ? (
                  <img src={brandData.logo} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center text-white text-4xl font-bold"
                    style={{ backgroundColor: brandData.primaryColor }}
                  >
                    {userProfile?.companyName?.charAt(0) || 'C'}
                  </div>
                )}
              </div>

              <div className="flex-1 pb-2">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {userProfile?.companyName || 'Company'}
                </h2>
                <p
                  className="text-sm mt-1"
                  style={{ color: brandData.primaryColor }}
                >
                  {brandData.tagline || 'Your tagline here'}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden sticky top-6">
              {BRANDING_TABS.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-l-4 border-blue-600'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 border-l-4 border-transparent'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Content Area */}
          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
              <AnimatePresence mode="wait">
                {/* Identity Tab */}
                {activeTab === 'identity' && (
                  <motion.div
                    key="identity"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-6"
                  >
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                        Brand Identity
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                        Upload your company logo and cover images
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                          Company Logo
                        </label>
                        <ImageUploader
                          currentImage={brandData.logo}
                          onUpload={(file) => handleImageUpload('logo', file)}
                          uploading={uploading.logo}
                          aspect="square"
                          label="Upload Logo"
                          description="PNG or JPG, square, max 5MB"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                          Cover Image
                        </label>
                        <ImageUploader
                          currentImage={brandData.coverImage}
                          onUpload={(file) => handleImageUpload('cover', file)}
                          uploading={uploading.cover}
                          aspect="video"
                          label="Upload Cover"
                          description="Recommended: 1600x600px"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Company Tagline
                      </label>
                      <input
                        type="text"
                        value={brandData.tagline}
                        onChange={(e) => setBrandData({ ...brandData, tagline: e.target.value })}
                        placeholder="A short memorable phrase that describes your company"
                        maxLength={100}
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        {brandData.tagline.length}/100 characters
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* Colors Tab */}
                {activeTab === 'colors' && (
                  <motion.div
                    key="colors"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-6"
                  >
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                        Brand Colors
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                        Choose colors that represent your brand
                      </p>
                    </div>

                    {/* Color Presets */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                        Quick Presets
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {COLOR_PRESETS.map(preset => (
                          <button
                            key={preset.name}
                            onClick={() => applyColorPreset(preset)}
                            className="group p-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 hover:border-blue-500 transition-all"
                          >
                            <div className="flex gap-1 mb-2">
                              <div className="w-4 h-8 rounded" style={{ backgroundColor: preset.primary }} />
                              <div className="w-4 h-8 rounded" style={{ backgroundColor: preset.secondary }} />
                              <div className="w-4 h-8 rounded" style={{ backgroundColor: preset.accent }} />
                            </div>
                            <p className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">
                              {preset.name}
                            </p>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Custom Colors */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100 dark:border-gray-700">
                      <ColorPicker
                        label="Primary Color"
                        value={brandData.primaryColor}
                        onChange={(v) => setBrandData({ ...brandData, primaryColor: v })}
                      />
                      <ColorPicker
                        label="Secondary Color"
                        value={brandData.secondaryColor}
                        onChange={(v) => setBrandData({ ...brandData, secondaryColor: v })}
                      />
                      <ColorPicker
                        label="Accent Color"
                        value={brandData.accentColor}
                        onChange={(v) => setBrandData({ ...brandData, accentColor: v })}
                      />
                      <ColorPicker
                        label="Text Color"
                        value={brandData.textColor}
                        onChange={(v) => setBrandData({ ...brandData, textColor: v })}
                      />
                    </div>

                    {/* Preview */}
                    <div className="p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                      <p className="text-xs font-medium text-gray-500 mb-3">PREVIEW</p>
                      <div
                        className="rounded-xl overflow-hidden"
                        style={{ backgroundColor: brandData.backgroundColor }}
                      >
                        <div
                          className="p-6"
                          style={{
                            background: `linear-gradient(135deg, ${brandData.primaryColor}, ${brandData.secondaryColor})`,
                          }}
                        >
                          <h4 className="text-white text-xl font-bold mb-2">
                            {userProfile?.companyName || 'Company'}
                          </h4>
                          <p className="text-white/90 text-sm">
                            {brandData.tagline || 'Your tagline here'}
                          </p>
                        </div>
                        <div className="p-6 flex flex-wrap gap-3">
                          <button
                            className="px-4 py-2 rounded-lg text-white text-sm font-medium"
                            style={{ backgroundColor: brandData.primaryColor }}
                          >
                            Primary Button
                          </button>
                          <button
                            className="px-4 py-2 rounded-lg text-white text-sm font-medium"
                            style={{ backgroundColor: brandData.secondaryColor }}
                          >
                            Secondary
                          </button>
                          <button
                            className="px-4 py-2 rounded-lg text-white text-sm font-medium"
                            style={{ backgroundColor: brandData.accentColor }}
                          >
                            Accent
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Typography Tab */}
                {activeTab === 'typography' && (
                  <motion.div
                    key="typography"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-6"
                  >
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                        Typography
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                        Choose fonts that match your brand personality
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Heading Font
                        </label>
                        <select
                          value={brandData.headingFont}
                          onChange={(e) => setBrandData({ ...brandData, headingFont: e.target.value })}
                          className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          {FONT_FAMILIES.map(font => (
                            <option key={font.value} value={font.value}>
                              {font.label} ({font.category})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Body Font
                        </label>
                        <select
                          value={brandData.bodyFont}
                          onChange={(e) => setBrandData({ ...brandData, bodyFont: e.target.value })}
                          className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          {FONT_FAMILIES.map(font => (
                            <option key={font.value} value={font.value}>
                              {font.label} ({font.category})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Font Preview */}
                    <div className="p-6 rounded-xl bg-gray-50 dark:bg-gray-700">
                      <p className="text-xs font-medium text-gray-500 mb-4">PREVIEW</p>
                      <h1
                        className="text-4xl font-bold text-gray-900 dark:text-white mb-3"
                        style={{ fontFamily: brandData.headingFont }}
                      >
                        Heading Example
                      </h1>
                      <h2
                        className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-3"
                        style={{ fontFamily: brandData.headingFont }}
                      >
                        Subheading Example
                      </h2>
                      <p
                        className="text-base text-gray-600 dark:text-gray-400 leading-relaxed"
                        style={{ fontFamily: brandData.bodyFont }}
                      >
                        This is an example of body text using your selected body font. The quick brown fox jumps over the lazy dog. 
                        Good typography enhances readability and creates a memorable brand experience.
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* Assets Tab */}
                {activeTab === 'assets' && (
                  <motion.div
                    key="assets"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-6"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          Media Gallery
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Showcase your office, team, and company events
                        </p>
                      </div>
                      <label className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors cursor-pointer flex items-center gap-2">
                        <FaCloudUploadAlt className="w-4 h-4" />
                        Add Media
                        <input
                          type="file"
                          accept="image/*,video/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleMediaUpload(file);
                          }}
                          className="hidden"
                        />
                      </label>
                    </div>

                    {uploading.media && (
                      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm text-blue-600 flex items-center gap-2">
                        <FaSpinner className="w-4 h-4 animate-spin" />
                        Uploading media...
                      </div>
                    )}

                    {brandData.mediaGallery.length > 0 ? (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {brandData.mediaGallery.map(item => (
                          <div
                            key={item.id}
                            className="relative group aspect-square rounded-xl overflow-hidden"
                          >
                            {item.type === 'image' ? (
                              <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
                            ) : (
                              <video src={item.url} className="w-full h-full object-cover" />
                            )}
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                              <a
                                href={item.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 bg-white/20 text-white rounded-lg hover:bg-white/30"
                              >
                                <FaEye className="w-4 h-4" />
                              </a>
                              <button
                                onClick={() => handleMediaDelete(item)}
                                className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                              >
                                <FaTrash className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 bg-gray-50 dark:bg-gray-700 rounded-xl">
                        <FaImages className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-500 dark:text-gray-400 mb-4">
                          No media uploaded yet
                        </p>
                        <label className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors cursor-pointer">
                          <FaCloudUploadAlt className="w-4 h-4" />
                          Upload First Media
                          <input
                            type="file"
                            accept="image/*,video/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleMediaUpload(file);
                            }}
                            className="hidden"
                          />
                        </label>
                      </div>
                    )}
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
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                        Social Media Links
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                        Connect your social profiles to increase visibility
                      </p>
                    </div>

                    <div className="space-y-4">
                      {SOCIAL_PLATFORMS.map(platform => {
                        const Icon = platform.icon;
                        const value = brandData.socialLinks[platform.id] || '';
                        return (
                          <div key={platform.id}>
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                              <Icon className="w-4 h-4" style={{ color: platform.color }} />
                              {platform.name}
                            </label>
                            <input
                              type="url"
                              value={value}
                              onChange={(e) => handleSocialChange(platform.id, e.target.value)}
                              placeholder={platform.placeholder}
                              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            />
                          </div>
                        );
                      })}
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
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                        Culture & Values
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                        Share what makes your company unique
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Company Culture
                      </label>
                      <textarea
                        value={brandData.culture.description}
                        onChange={(e) => setBrandData({
                          ...brandData,
                          culture: { ...brandData.culture, description: e.target.value },
                        })}
                        rows={4}
                        placeholder="Describe your company culture..."
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Core Values
                      </label>
                      <div className="space-y-2">
                        {brandData.culture.values.map((value, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                          >
                            <div className="flex-1">
                              <input
                                type="text"
                                value={value.title || ''}
                                onChange={(e) => {
                                  const updated = [...brandData.culture.values];
                                  updated[index] = { ...value, title: e.target.value };
                                  setBrandData({
                                    ...brandData,
                                    culture: { ...brandData.culture, values: updated },
                                  });
                                }}
                                placeholder="Value title"
                                className="w-full px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                              <input
                                type="text"
                                value={value.description || ''}
                                onChange={(e) => {
                                  const updated = [...brandData.culture.values];
                                  updated[index] = { ...value, description: e.target.value };
                                  setBrandData({
                                    ...brandData,
                                    culture: { ...brandData.culture, values: updated },
                                  });
                                }}
                                placeholder="Short description"
                                className="w-full mt-2 px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                            <button
                              onClick={() => {
                                const updated = brandData.culture.values.filter((_, i) => i !== index);
                                setBrandData({
                                  ...brandData,
                                  culture: { ...brandData.culture, values: updated },
                                });
                              }}
                              className="p-2 text-gray-400 hover:text-red-500"
                            >
                              <FaTrash className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                        <button
                          onClick={() => {
                            setBrandData({
                              ...brandData,
                              culture: {
                                ...brandData.culture,
                                values: [...brandData.culture.values, { title: '', description: '' }],
                              },
                            });
                          }}
                          className="w-full py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-500 hover:border-blue-500 hover:text-blue-600 transition-colors flex items-center justify-center gap-2"
                        >
                          <FaPlus className="w-3 h-3" />
                          Add Value
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyBranding;
