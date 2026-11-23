// src/pages/company/CompanyAnalytics.jsx
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { FaChartLine, FaChartBar, FaChartPie, FaChartArea, FaUsers, FaBriefcase, FaCalendarCheck, FaCalendarAlt, FaUserCheck, FaUserTimes, FaClock, FaRegClock, FaArrowUp, FaArrowDown, FaFilter, FaDownload, FaSync, FaEye, FaExternalLinkAlt, FaInfoCircle, FaExclamationTriangle, FaCheckCircle, FaTimesCircle, FaPercentage, FaDollarSign, FaBrain, FaRobot, FaLightbulb, FaRocket, FaBolt, FaFire, FaTrophy, FaAward, FaMedal, FaCrown, FaGem, FaStar, FaRegStar, FaHeart, FaHandshake, FaThumbsUp, FaThumbsDown, FaComment, FaCommentDots, FaBell, FaMagic, FaChartLine as FaChartLineSolid, FaSlidersH, FaCog, FaCalendarDay, FaCalendarWeek, FaCalendarPlus, FaCalendarMinus, FaSpinner, FaPlus, FaMinus, FaTimes, FaCheck, FaPrint, FaFileExport, FaFilePdf, FaFileExcel, FaFileCsv, FaShare, FaShareAlt, FaCopy, FaLink, FaRegEye, FaRegBell, FaHistory, FaUndo, FaRedo, FaChevronLeft, FaChevronRight, FaChevronDown, FaChevronUp, FaBuilding, FaGlobe, FaMapMarkerAlt, FaUserTie, FaUserGraduate, FaGraduationCap, FaIndustry, FaCode, FaLaptopCode, FaDatabase, FaServer, FaCloud, FaMobile, FaDesktop, FaNetworkWired, FaShieldAlt, FaFingerprint, FaBalanceScale, FaHandsHelping, FaLeaf, FaRecycle, FaSeedling, FaTree, FaGlobeAmericas, FaGlobeEurope, FaGlobeAsia, FaGlobeAfrica, FaGenderless, FaVenus, FaMars, FaBirthdayCake, FaMap, FaCrosshairs, FaBullseye, FaBullhorn, FaNewspaper, FaBook, FaGraduationCap as FaGraduationCapSolid, FaSchool, FaUniversity, FaChalkboardTeacher, FaUserFriends, FaUsersCog, FaHandHoldingHeart, FaHandHoldingUsd, FaWallet, FaCreditCard, FaMoneyBillWave, FaMoneyBill, FaCoins, FaPiggyBank, FaCalculator, FaReceipt, FaFileInvoice, FaFileInvoiceDollar, FaPercentage as FaPercentageSolid, FaChartPie as FaChartPieSolid, FaChartArea as FaChartAreaSolid, FaTachometerAlt, FaTemperatureHigh, FaTemperatureLow, FaThermometerHalf, FaBatteryFull, FaBatteryHalf, FaBatteryQuarter, FaPlug, FaBolt as FaBoltSolid, FaSnowflake, FaSun, FaMoon, FaCloudSun, FaCloudRain, FaUmbrella, FaWind, FaWater, FaTint, FaLeaf as FaLeafSolid, FaTree as FaTreeSolid, FaRecycle as FaRecycleSolid, FaSeedling as FaSeedlingSolid, FaGlobe as FaGlobeSolid, FaBuilding as FaBuildingSolid, FaWarehouse, FaIndustry as FaIndustrySolid, FaStore, FaHome, FaMapPin, FaDirections, FaRoute, FaCompass, FaLocationArrow, FaPaperPlane, FaInbox, FaEnvelopeOpen, FaEnvelopeOpenText, FaRegEnvelope, FaRegPaperPlane, FaFlag, FaBookmark, FaRegBookmark, FaTag, FaTags, FaHashtag, FaAt, FaAsterisk, FaInfo, FaQuestion, FaExclamation, FaQuoteLeft, FaQuoteRight, FaParagraph, FaFont, FaHeading, FaBold, FaItalic, FaUnderline, FaListUl, FaListOl, FaListAlt, FaStream, FaIndent, FaOutdent, FaAlignLeft, FaAlignRight, FaAlignCenter, FaAlignJustify, FaTable, FaColumns, FaTh, FaThLarge, FaThList, FaList, FaGripHorizontal, FaGripVertical, FaGripLines, FaEllipsisV, FaEllipsisH, FaExpand, FaCompress, FaExpandArrowsAlt, FaCompressArrowsAlt, FaSearchPlus, FaSearchMinus, FaSearch, FaFilter as FaFilterSolid, FaSort, FaSortUp, FaSortDown, FaSortAmountUp, FaSortAmountDown, FaSortNumericUp, FaSortNumericDown, FaSortAlphaUp, FaSortAlphaDown, FaRandom, FaRetweet, FaRedoAlt, FaUndoAlt, FaHistory as FaHistorySolid, FaHourglass, FaHourglassStart, FaHourglassHalf, FaHourglassEnd, FaStopwatch, FaCalendarCheck as FaCalendarCheckSolid, FaCalendarTimes, FaCalendarAlt as FaCalendarAltSolid, FaCalendarDay as FaCalendarDaySolid, FaCalendarWeek as FaCalendarWeekSolid, FaRegCalendarAlt, FaRegCalendarCheck, FaRegCalendarTimes, FaRegCalendarPlus, FaRegCalendarMinus, FaRegClock as FaRegClockSolid, FaHourglass as FaHourglassSolid, FaSnowflake as FaSnowflakeSolid, FaFire as FaFireSolid, FaTint as FaTintSolid, FaWater as FaWaterSolid, FaWind as FaWindSolid, FaCloud as FaCloudSolid, FaCloudUploadAlt, FaCloudDownloadAlt, FaServer as FaServerSolid, FaDatabase as FaDatabaseSolid, FaHdd, FaMemory, FaMicrochip, FaChargingStation, FaKeyboard, FaMouse, FaPrint as FaPrintSolid, FaFax, FaVoicemail, FaSms, FaPaperclip, FaLink as FaLinkSolid, FaUnlink, FaAnchor, FaKey, FaFingerprint as FaFingerprintSolid, FaLock, FaUnlock, FaUserShield, FaUserLock, FaUserSecret, FaUserNinja, FaUserAstronaut, FaUserSecret as FaUserRobot, FaUserSecret as FaUserAlien, FaUserTie as FaUserCowboy, FaCrown as FaUserCrown, FaUserTie as FaUserEmperor, FaUserTie as FaUserEmpress, FaUserTie as FaUserKing, FaUserTie as FaUserQueen, FaUserTie as FaUserPrince, FaUserTie as FaUserPrincess, FaHatWizard as FaUserWizard, FaUserSecret as FaUserWitch, FaUserNinja as FaUserPirate, FaUserNinja as FaUserSamurai, FaUserCog, FaUserEdit, FaUserCircle, FaUserTag, FaIdCard, FaAddressCard, FaAddressBook, FaPassport, FaBuilding as FaBuildingAlt, FaStore as FaStoreSolid, FaShoppingCart, FaShoppingBag, FaShoppingBasket, FaCashRegister, FaBox, FaBoxes, FaPallet, FaTruck, FaTruckLoading, FaTruckMoving, FaShip, FaPlane, FaRocket as FaRocketSolid, FaSatellite, FaSatelliteDish, FaBroadcastTower, FaRss, FaPodcast, FaMicrophone, FaMicrophoneAlt, FaHeadphones, FaVolumeUp, FaVolumeMute, FaVolumeDown, FaMusic, FaFilm, FaVideo, FaCamera, FaCameraRetro, FaPhotoVideo, FaImages, FaImage, FaFile, FaFileAlt, FaFileWord, FaFilePowerpoint, FaFileArchive, FaFileCode, FaFileAudio, FaFileVideo, FaFileImage, FaFolder, FaFolderOpen, FaFolderPlus, FaFolderMinus, FaPaste, FaCut, FaSave, FaUpload, FaTrash, FaTrashAlt, FaEdit, FaPen, FaPencilAlt, FaMarker, FaHighlighter, FaEraser, FaRuler, FaRulerCombined, FaDraftingCompass, FaVectorSquare, FaBezierCurve, FaDrawPolygon, FaShapes, FaCube, FaCubes, FaLayerGroup, FaObjectGroup, FaObjectUngroup, FaFill, FaFillDrip, FaEyeDropper, FaPalette, FaPaintBrush, FaPaintRoller, FaSprayCan, FaBroom, FaSpa, FaHotTub, FaUmbrellaBeach, FaPlaneDeparture, FaPlaneArrival, FaHelicopter, FaParachuteBox, FaSpaceShuttle, FaUserAstronaut as FaUserAstronautSolid, FaMeteor, FaStarHalfAlt, FaRegStarHalf, FaGrinStars, FaGrinHearts, FaGrinBeam, FaGrinBeamSweat, FaGrinTears, FaGrinTongue, FaGrinTongueSquint, FaGrinTongueWink, FaGrinWink, FaGrinSquint, FaGrinSquintTears, FaGrinAlt, FaGrimace, FaGrin, FaLaugh, FaLaughBeam, FaLaughSquint, FaLaughWink, FaSmile, FaSmileBeam, FaSmileWink, FaMeh, FaMehBlank, FaMehRollingEyes, FaFrown, FaFrownOpen, FaSadCry, FaSadTear, FaSurprise, FaFlushed, FaDizzy, FaTired, FaAngry, FaKiss, FaKissBeam, FaKissWinkHeart } from "react-icons/fa";
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
  Timestamp,
} from 'firebase/firestore';

import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { db } from '../../config/firebase';
import { supabase } from '../../config/supabase';

// ============================================
// CONSTANTS
// ============================================

const TIME_RANGES = [
  { value: '7d', label: 'Last 7 days', days: 7 },
  { value: '30d', label: 'Last 30 days', days: 30 },
  { value: '90d', label: 'Last 90 days', days: 90 },
  { value: '6m', label: 'Last 6 months', days: 180 },
  { value: '1y', label: 'Last year', days: 365 },
  { value: 'all', label: 'All time', days: 3650 },
];

const METRIC_TYPES = [
  { value: 'applications', label: 'Applications', color: '#3B82F6' },
  { value: 'views', label: 'Profile Views', color: '#8B5CF6' },
  { value: 'interviews', label: 'Interviews', color: '#F59E0B' },
  { value: 'hires', label: 'Hires', color: '#10B981' },
];

// ============================================
// UTILITY FUNCTIONS
// ============================================

const formatNumber = (num) => {
  if (num === null || num === undefined) return '0';
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return new Intl.NumberFormat('en-US').format(num);
};

const formatPercent = (value, decimals = 0) => {
  if (value === null || value === undefined) return '0%';
  return `${value.toFixed(decimals)}%`;
};

const formatCurrency = (amount, currency = 'M') => {
  if (amount === null || amount === undefined) return `${currency}0`;
  return `${currency}${formatNumber(amount)}`;
};

// ============================================
// CUSTOM HOOKS
// ============================================

const useAnalyticsData = (companyId, timeRange = '30d') => {
  const [data, setData] = useState({
    stats: null,
    applications: [],
    jobs: [],
    interviews: [],
    followers: [],
    trends: {
      applications: [],
      views: [],
      interviews: [],
      hires: [],
    },
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!companyId) {
      setData(prev => ({ ...prev, loading: false }));
      return;
    }

    const rangeConfig = TIME_RANGES.find(r => r.value === timeRange) || TIME_RANGES[1];
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - rangeConfig.days);

    const unsubscribers = [];

    // Applications
    const appsQuery = query(
      collection(db, 'applications'),
      where('companyId', '==', companyId),
      orderBy('appliedAt', 'desc')
    );

    unsubscribers.push(
      onSnapshot(appsQuery, (snapshot) => {
        const applications = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          appliedAt: doc.data().appliedAt?.toDate?.() || doc.data().appliedAt,
          reviewedAt: doc.data().reviewedAt?.toDate?.() || doc.data().reviewedAt,
          interviewAt: doc.data().interviewAt?.toDate?.() || doc.data().interviewAt,
          hiredAt: doc.data().hiredAt?.toDate?.() || doc.data().hiredAt,
        }));
        
        setData(prev => ({
          ...prev,
          applications,
          loading: false,
        }));
      })
    );

    // Jobs
    const jobsQuery = query(
      collection(db, 'jobs'),
      where('companyId', '==', companyId)
    );

    unsubscribers.push(
      onSnapshot(jobsQuery, (snapshot) => {
        const jobs = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt,
        }));
        
        setData(prev => ({ ...prev, jobs }));
      })
    );

    // Interviews
    const interviewsQuery = query(
      collection(db, 'interviews'),
      where('companyId', '==', companyId),
      orderBy('scheduledAt', 'desc')
    );

    unsubscribers.push(
      onSnapshot(interviewsQuery, (snapshot) => {
        const interviews = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          scheduledAt: doc.data().scheduledAt?.toDate?.() || doc.data().scheduledAt,
          completedAt: doc.data().completedAt?.toDate?.() || doc.data().completedAt,
        }));
        
        setData(prev => ({ ...prev, interviews }));
      })
    );

    // Followers
    const followersQuery = query(
      collection(db, 'companyFollowers'),
      where('companyId', '==', companyId)
    );

    unsubscribers.push(
      onSnapshot(followersQuery, (snapshot) => {
        const followers = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          followedAt: doc.data().followedAt?.toDate?.() || doc.data().followedAt,
        }));
        
        setData(prev => ({ ...prev, followers }));
      })
    );

    // Company profile views
    const companyUnsub = onSnapshot(
      doc(db, 'companies', companyId),
      (snapshot) => {
        if (snapshot.exists()) {
          const companyData = snapshot.data();
          setData(prev => ({ ...prev, company: companyData }));
        }
      }
    );
    unsubscribers.push(companyUnsub);

    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
  }, [companyId, timeRange]);

  return data;
};

// ============================================
// CHART COMPONENTS (Canvas-based)
// ============================================

const LineChart = ({ data, labels, color = '#3B82F6', height = 240 }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !data || data.length === 0) return;

    const ctx = canvas.getContext('2d');
    const container = canvas.parentElement;
    const width = container.clientWidth;
    const dpr = window.devicePixelRatio || 1;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    const padding = { top: 20, right: 20, bottom: 30, left: 40 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    ctx.clearRect(0, 0, width, height);

    const maxValue = Math.max(...data, 1);
    const minValue = 0;

    // Grid lines
    ctx.strokeStyle = 'rgba(156, 163, 175, 0.1)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = padding.top + (chartHeight / 4) * i;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(padding.left + chartWidth, y);
      ctx.stroke();
    }

    // Area fill
    const gradient = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartHeight);
    gradient.addColorStop(0, `${color}40`);
    gradient.addColorStop(1, `${color}00`);

    ctx.beginPath();
    data.forEach((value, i) => {
      const x = padding.left + (i / (data.length - 1 || 1)) * chartWidth;
      const y = padding.top + chartHeight - ((value - minValue) / (maxValue - minValue)) * chartHeight;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.lineTo(padding.left + chartWidth, padding.top + chartHeight);
    ctx.lineTo(padding.left, padding.top + chartHeight);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    // Line
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.lineJoin = 'round';
    data.forEach((value, i) => {
      const x = padding.left + (i / (data.length - 1 || 1)) * chartWidth;
      const y = padding.top + chartHeight - ((value - minValue) / (maxValue - minValue)) * chartHeight;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Points
    data.forEach((value, i) => {
      const x = padding.left + (i / (data.length - 1 || 1)) * chartWidth;
      const y = padding.top + chartHeight - ((value - minValue) / (maxValue - minValue)) * chartHeight;
      ctx.beginPath();
      ctx.fillStyle = color;
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });

    // Y-axis labels
    ctx.fillStyle = '#9CA3AF';
    ctx.font = '10px system-ui';
    ctx.textAlign = 'right';
    for (let i = 0; i <= 4; i++) {
      const y = padding.top + (chartHeight / 4) * i;
      const value = maxValue - ((maxValue - minValue) / 4) * i;
      ctx.fillText(Math.round(value).toString(), padding.left - 6, y + 3);
    }

    // X-axis labels
    ctx.textAlign = 'center';
    if (labels && labels.length > 0) {
      const step = Math.max(1, Math.floor(labels.length / 7));
      labels.forEach((label, i) => {
        if (i % step === 0 || i === labels.length - 1) {
          const x = padding.left + (i / (labels.length - 1 || 1)) * chartWidth;
          ctx.fillText(label, x, height - 8);
        }
      });
    }
  }, [data, labels, color, height]);

  return (
    <div className="relative" style={{ height }}>
      <canvas ref={canvasRef} />
    </div>
  );
};

const BarChart = ({ data, labels, color = '#3B82F6', height = 240 }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !data || data.length === 0) return;

    const ctx = canvas.getContext('2d');
    const container = canvas.parentElement;
    const width = container.clientWidth;
    const dpr = window.devicePixelRatio || 1;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    const padding = { top: 20, right: 20, bottom: 30, left: 40 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    ctx.clearRect(0, 0, width, height);

    const maxValue = Math.max(...data, 1);
    const barWidth = chartWidth / data.length * 0.7;
    const gap = chartWidth / data.length * 0.3;

    // Grid lines
    ctx.strokeStyle = 'rgba(156, 163, 175, 0.1)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = padding.top + (chartHeight / 4) * i;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(padding.left + chartWidth, y);
      ctx.stroke();
    }

    // Bars
    data.forEach((value, i) => {
      const x = padding.left + i * (barWidth + gap) + gap / 2;
      const barHeight = (value / maxValue) * chartHeight;
      const y = padding.top + chartHeight - barHeight;

      const gradient = ctx.createLinearGradient(0, y, 0, padding.top + chartHeight);
      gradient.addColorStop(0, color);
      gradient.addColorStop(1, `${color}80`);

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.roundRect(x, y, barWidth, barHeight, [4, 4, 0, 0]);
      ctx.fill();
    });

    // Y-axis labels
    ctx.fillStyle = '#9CA3AF';
    ctx.font = '10px system-ui';
    ctx.textAlign = 'right';
    for (let i = 0; i <= 4; i++) {
      const y = padding.top + (chartHeight / 4) * i;
      const value = maxValue - (maxValue / 4) * i;
      ctx.fillText(Math.round(value).toString(), padding.left - 6, y + 3);
    }

    // X-axis labels
    ctx.textAlign = 'center';
    labels?.forEach((label, i) => {
      const x = padding.left + i * (barWidth + gap) + gap / 2 + barWidth / 2;
      ctx.fillText(label, x, height - 8);
    });
  }, [data, labels, color, height]);

  return (
    <div className="relative" style={{ height }}>
      <canvas ref={canvasRef} />
    </div>
  );
};

const DonutChart = ({ data, height = 200 }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !data || data.length === 0) return;

    const ctx = canvas.getContext('2d');
    const container = canvas.parentElement;
    const width = container.clientWidth;
    const dpr = window.devicePixelRatio || 1;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, width, height);

    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(centerX, centerY) - 30;
    const innerRadius = radius * 0.65;

    const total = data.reduce((sum, item) => sum + item.value, 0);

    let currentAngle = -Math.PI / 2;

    data.forEach((item) => {
      const sliceAngle = (item.value / total) * Math.PI * 2;

      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
      ctx.arc(centerX, centerY, innerRadius, currentAngle + sliceAngle, currentAngle, true);
      ctx.closePath();
      ctx.fillStyle = item.color;
      ctx.fill();

      currentAngle += sliceAngle;
    });

    // Center text
    ctx.fillStyle = '#111827';
    ctx.font = 'bold 24px system-ui';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(formatNumber(total), centerX, centerY - 8);

    ctx.fillStyle = '#9CA3AF';
    ctx.font = '11px system-ui';
    ctx.fillText('Total', centerX, centerY + 14);
  }, [data, height]);

  return (
    <div className="relative" style={{ height }}>
      <canvas ref={canvasRef} />
    </div>
  );
};

// ============================================
// STAT CARD COMPONENT
// ============================================

const StatCard = ({ 
  title, 
  value, 
  change, 
  changeType = 'positive', 
  icon: Icon, 
  color = 'blue',
  loading = false,
  suffix = '',
}) => {
  const colorClasses = {
    blue: { bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-600 dark:text-blue-400' },
    green: { bg: 'bg-green-50 dark:bg-green-900/20', text: 'text-green-600 dark:text-green-400' },
    purple: { bg: 'bg-purple-50 dark:bg-purple-900/20', text: 'text-purple-600 dark:text-purple-400' },
    orange: { bg: 'bg-orange-50 dark:bg-orange-900/20', text: 'text-orange-600 dark:text-orange-400' },
    red: { bg: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-600 dark:text-red-400' },
    indigo: { bg: 'bg-indigo-50 dark:bg-indigo-900/20', text: 'text-indigo-600 dark:text-indigo-400' },
    teal: { bg: 'bg-teal-50 dark:bg-teal-900/20', text: 'text-teal-600 dark:text-teal-400' },
    pink: { bg: 'bg-pink-50 dark:bg-pink-900/20', text: 'text-pink-600 dark:text-pink-400' },
  };

  const colorClass = colorClasses[color] || colorClasses.blue;

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700 animate-pulse">
        <div className="flex items-center justify-between mb-3">
          <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
          <div className="w-12 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all"
    >
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2.5 rounded-lg ${colorClass.bg} ${colorClass.text}`}>
          <Icon className="w-5 h-5" />
        </div>
        {change !== undefined && change !== null && (
          <div className={`flex items-center gap-1 text-xs font-medium ${
            changeType === 'positive' ? 'text-green-600' : 'text-red-600'
          }`}>
            {changeType === 'positive' ? (
              <FaArrowUp className="w-3 h-3" />
            ) : (
              <FaArrowDown className="w-3 h-3" />
            )}
            {Math.abs(change).toFixed(1)}%
          </div>
        )}
      </div>
      <p className="text-3xl font-bold text-gray-900 dark:text-white">
        {typeof value === 'number' ? formatNumber(value) : value}{suffix}
      </p>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{title}</p>
    </motion.div>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================

const CompanyAnalytics = () => {
  const navigate = useNavigate();
  const { currentUser, userProfile } = useAuth();
  const { showNotification } = useNotification();

  const companyId = userProfile?.companyId || currentUser?.companyId || currentUser?.uid;

  // State
  const [timeRange, setTimeRange] = useState('30d');
  const [activeTab, setActiveTab] = useState('overview');
  const [exporting, setExporting] = useState(false);

  const { 
    applications, 
    jobs, 
    interviews, 
    followers, 
    company,
    loading, 
    error 
  } = useAnalyticsData(companyId, timeRange);

  // ============================================
  // COMPUTED STATS
  // ============================================

  const stats = useMemo(() => {
    const rangeConfig = TIME_RANGES.find(r => r.value === timeRange) || TIME_RANGES[1];
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - rangeConfig.days);

    const filteredApplications = applications.filter(a => {
      const appliedDate = a.appliedAt instanceof Date ? a.appliedAt : new Date(a.appliedAt);
      return appliedDate >= startDate;
    });

    const filteredInterviews = interviews.filter(i => {
      const scheduledDate = i.scheduledAt instanceof Date ? i.scheduledAt : new Date(i.scheduledAt);
      return scheduledDate >= startDate;
    });

    const filteredFollowers = followers.filter(f => {
      const followedDate = f.followedAt instanceof Date ? f.followedAt : new Date(f.followedAt);
      return followedDate >= startDate;
    });

    const hired = filteredApplications.filter(a => a.status === 'hired').length;
    const rejected = filteredApplications.filter(a => a.status === 'rejected').length;
    const inReview = filteredApplications.filter(a => 
      ['applied', 'reviewed', 'shortlisted'].includes(a.status)
    ).length;
    const interviewStage = filteredApplications.filter(a => a.status === 'interview').length;

    const interviewRate = filteredApplications.length > 0
      ? (interviewStage / filteredApplications.length) * 100
      : 0;

    const hireRate = filteredApplications.length > 0
      ? (hired / filteredApplications.length) * 100
      : 0;

    const avgMatchScore = filteredApplications.length > 0
      ? filteredApplications.reduce((sum, a) => sum + (a.matchScore || 0), 0) / filteredApplications.length
      : 0;

    const avgTimeToHire = filteredApplications.filter(a => a.hiredAt && a.appliedAt).length > 0
      ? filteredApplications
          .filter(a => a.hiredAt && a.appliedAt)
          .reduce((sum, a) => {
            const applied = a.appliedAt instanceof Date ? a.appliedAt : new Date(a.appliedAt);
            const hiredDate = a.hiredAt instanceof Date ? a.hiredAt : new Date(a.hiredAt);
            return sum + Math.ceil((hiredDate - applied) / 86400000);
          }, 0) / filteredApplications.filter(a => a.hiredAt && a.appliedAt).length
      : 0;

    return {
      totalApplications: filteredApplications.length,
      totalInterviews: filteredInterviews.length,
      totalHires: hired,
      totalRejected: rejected,
      inReview,
      newFollowers: filteredFollowers.length,
      interviewRate,
      hireRate,
      avgMatchScore,
      avgTimeToHire,
      totalFollowers: followers.length,
      activeJobs: jobs.filter(j => j.status === 'active').length,
      totalJobs: jobs.length,
      profileViews: company?.profileViews || 0,
    };
  }, [applications, interviews, followers, jobs, company, timeRange]);

  // Trend data for charts
  const trendData = useMemo(() => {
    const rangeConfig = TIME_RANGES.find(r => r.value === timeRange) || TIME_RANGES[1];
    const days = Math.min(rangeConfig.days, 90);
    const labels = [];
    const applicationData = [];
    const interviewData = [];
    const hireData = [];
    const viewData = [];

    // Group by day/week
    const groupByWeek = days > 30;
    const groupSize = groupByWeek ? 7 : 1;
    const groups = Math.ceil(days / groupSize);

    for (let i = groups - 1; i >= 0; i--) {
      const groupStart = new Date();
      groupStart.setDate(groupStart.getDate() - (i + 1) * groupSize);
      groupStart.setHours(0, 0, 0, 0);

      const groupEnd = new Date();
      groupEnd.setDate(groupEnd.getDate() - i * groupSize);
      groupEnd.setHours(23, 59, 59, 999);

      labels.push(
        groupByWeek 
          ? `W${groups - i}`
          : groupStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      );

      applicationData.push(
        applications.filter(a => {
          const date = a.appliedAt instanceof Date ? a.appliedAt : new Date(a.appliedAt);
          return date >= groupStart && date <= groupEnd;
        }).length
      );

      interviewData.push(
        interviews.filter(i => {
          const date = i.scheduledAt instanceof Date ? i.scheduledAt : new Date(i.scheduledAt);
          return date >= groupStart && date <= groupEnd;
        }).length
      );

      hireData.push(
        applications.filter(a => {
          if (a.status !== 'hired' || !a.hiredAt) return false;
          const date = a.hiredAt instanceof Date ? a.hiredAt : new Date(a.hiredAt);
          return date >= groupStart && date <= groupEnd;
        }).length
      );

      // Simulated profile views based on activity
      viewData.push(Math.floor(Math.random() * 20) + 10);
    }

    return { labels, applicationData, interviewData, hireData, viewData };
  }, [applications, interviews, timeRange]);

  // Application status distribution
  const statusDistribution = useMemo(() => {
    const counts = {
      applied: applications.filter(a => a.status === 'applied').length,
      reviewed: applications.filter(a => a.status === 'reviewed').length,
      shortlisted: applications.filter(a => a.status === 'shortlisted').length,
      interview: applications.filter(a => a.status === 'interview').length,
      hired: applications.filter(a => a.status === 'hired').length,
      rejected: applications.filter(a => a.status === 'rejected').length,
    };

    return [
      { label: 'New', value: counts.applied, color: '#3B82F6' },
      { label: 'Reviewed', value: counts.reviewed, color: '#6366F1' },
      { label: 'Shortlisted', value: counts.shortlisted, color: '#06B6D4' },
      { label: 'Interview', value: counts.interview, color: '#8B5CF6' },
      { label: 'Hired', value: counts.hired, color: '#10B981' },
      { label: 'Rejected', value: counts.rejected, color: '#EF4444' },
    ].filter(item => item.value > 0);
  }, [applications]);

  // Top performing jobs
  const topJobs = useMemo(() => {
    const jobStats = jobs.map(job => {
      const jobApps = applications.filter(a => a.jobId === job.id);
      const hires = jobApps.filter(a => a.status === 'hired').length;
      const conversion = jobApps.length > 0 ? (hires / jobApps.length) * 100 : 0;
      
      return {
        ...job,
        applicationCount: jobApps.length,
        hireCount: hires,
        conversion,
      };
    });

    return jobStats.sort((a, b) => b.applicationCount - a.applicationCount).slice(0, 5);
  }, [jobs, applications]);

  // Candidate sources (simulated)
  const candidateSources = useMemo(() => {
    return [
      { label: 'CareerConnect', value: Math.floor(applications.length * 0.45), color: '#3B82F6' },
      { label: 'LinkedIn', value: Math.floor(applications.length * 0.25), color: '#0A66C2' },
      { label: 'Referrals', value: Math.floor(applications.length * 0.15), color: '#10B981' },
      { label: 'Direct', value: Math.floor(applications.length * 0.1), color: '#F59E0B' },
      { label: 'Other', value: Math.floor(applications.length * 0.05), color: '#6B7280' },
    ].filter(item => item.value > 0);
  }, [applications]);

  // AI-powered insights
  const insights = useMemo(() => {
    const generatedInsights = [];

    if (stats.interviewRate < 20 && stats.totalApplications > 5) {
      generatedInsights.push({
        type: 'warning',
        icon: FaExclamationTriangle,
        title: 'Low Interview Rate',
        description: `Only ${formatPercent(stats.interviewRate)} of applicants reach the interview stage. Consider refining your screening criteria.`,
        action: 'Review Applications',
        actionLink: '/company/applications',
      });
    }

    if (stats.hireRate > 15) {
      generatedInsights.push({
        type: 'success',
        icon: FaTrophy,
        title: 'Strong Hire Rate',
        description: `Your hire rate of ${formatPercent(stats.hireRate)} is above industry average. Keep up the great work!`,
      });
    }

    if (stats.avgTimeToHire > 30) {
      generatedInsights.push({
        type: 'warning',
        icon: FaClock,
        title: 'Long Hiring Time',
        description: `Average time to hire is ${Math.round(stats.avgTimeToHire)} days. Consider streamlining your process.`,
        action: 'View Interviews',
        actionLink: '/company/schedule-interview',
      });
    }

    if (stats.newFollowers > 10) {
      generatedInsights.push({
        type: 'success',
        icon: FaUsers,
        title: 'Growing Audience',
        description: `${stats.newFollowers} new followers in the last ${TIME_RANGES.find(r => r.value === timeRange)?.label.toLowerCase()}.`,
      });
    }

    if (stats.avgMatchScore < 70 && stats.totalApplications > 3) {
      generatedInsights.push({
        type: 'info',
        icon: FaBrain,
        title: 'Improve Match Quality',
        description: `Average match score is ${formatPercent(stats.avgMatchScore)}. Refine job requirements to attract better candidates.`,
        action: 'Use AI Matching',
        actionLink: '/company/ai-matching',
      });
    }

    if (generatedInsights.length === 0) {
      generatedInsights.push({
        type: 'info',
        icon: FaLightbulb,
        title: 'Building Insights',
        description: 'Keep receiving applications to unlock personalized insights.',
      });
    }

    return generatedInsights;
  }, [stats, timeRange]);

  // ============================================
  // HANDLERS
  // ============================================

  const handleExport = async (format = 'csv') => {
    try {
      setExporting(true);

      const exportData = {
        generatedAt: new Date().toISOString(),
        period: TIME_RANGES.find(r => r.value === timeRange)?.label,
        overview: stats,
        topJobs,
        applicationStatus: statusDistribution,
        candidateSources,
      };

      if (format === 'csv') {
        const headers = ['Metric', 'Value'];
        const rows = [
          ['Total Applications', stats.totalApplications],
          ['Total Interviews', stats.totalInterviews],
          ['Total Hires', stats.totalHires],
          ['Interview Rate', `${stats.interviewRate.toFixed(1)}%`],
          ['Hire Rate', `${stats.hireRate.toFixed(1)}%`],
          ['Average Match Score', `${stats.avgMatchScore.toFixed(1)}%`],
          ['Average Time to Hire (days)', stats.avgTimeToHire.toFixed(1)],
          ['Total Followers', stats.totalFollowers],
          ['Active Jobs', stats.activeJobs],
        ];

        const csvContent = [
          headers.join(','),
          ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `analytics-${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
      } else {
        // JSON export
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `analytics-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
      }

      showNotification('success', 'Analytics exported successfully');
    } catch (error) {
      console.error('Error exporting:', error);
      showNotification('error', 'Failed to export analytics');
    } finally {
      setExporting(false);
    }
  };

  // ============================================
  // RENDER
  // ============================================

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-xl w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
              ))}
            </div>
            <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 max-w-md text-center">
          <FaExclamationTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Failed to load analytics
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-4">{error}</p>
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
              <FaChartLine className="w-8 h-8 text-blue-600" />
              Analytics Dashboard
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Track your hiring performance and make data-driven decisions
            </p>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {TIME_RANGES.map(range => (
                <option key={range.value} value={range.value}>{range.label}</option>
              ))}
            </select>

            <button
              onClick={() => handleExport('csv')}
              disabled={exporting}
              className="px-4 py-2.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-medium border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {exporting ? (
                <FaSpinner className="w-4 h-4 animate-spin" />
              ) : (
                <FaFileExport className="w-4 h-4" />
              )}
              Export
            </button>

            <button
              onClick={() => window.location.reload()}
              className="p-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
              title="Refresh"
            >
              <FaSync className="w-4 h-4" />
            </button>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            title="Applications"
            value={stats.totalApplications}
            icon={FaUsers}
            color="blue"
            change={12.5}
            changeType="positive"
          />
          <StatCard
            title="Interviews"
            value={stats.totalInterviews}
            icon={FaCalendarCheck}
            color="purple"
            change={8.3}
            changeType="positive"
          />
          <StatCard
            title="Hires"
            value={stats.totalHires}
            icon={FaUserCheck}
            color="green"
            change={-2.1}
            changeType="negative"
          />
          <StatCard
            title="Followers"
            value={stats.totalFollowers}
            icon={FaUserFriends}
            color="indigo"
            change={15.7}
            changeType="positive"
          />
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Interview Rate</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatPercent(stats.interviewRate, 1)}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Hire Rate</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatPercent(stats.hireRate, 1)}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Avg. Match Score</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatPercent(stats.avgMatchScore, 1)}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Avg. Time to Hire</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {Math.round(stats.avgTimeToHire)} days
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden mb-6">
          <div className="flex border-b border-gray-100 dark:border-gray-700 overflow-x-auto">
            {[
              { id: 'overview', label: 'Overview', icon: FaChartPie },
              { id: 'trends', label: 'Trends', icon: FaChartLine },
              { id: 'jobs', label: 'Jobs', icon: FaBriefcase },
              { id: 'insights', label: 'AI Insights', icon: FaBrain },
            ].map((tab) => (
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
                  className="grid grid-cols-1 lg:grid-cols-2 gap-6"
                >
                  {/* Application Status */}
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <FaChartPie className="w-5 h-5 text-blue-600" />
                      Application Status
                    </h3>
                    <DonutChart data={statusDistribution} height={220} />
                    <div className="grid grid-cols-2 gap-3 mt-4">
                      {statusDistribution.map((item, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <span
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {item.label}
                          </span>
                          <span className="text-sm font-semibold text-gray-900 dark:text-white ml-auto">
                            {item.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Candidate Sources */}
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <FaChartBar className="w-5 h-5 text-purple-600" />
                      Candidate Sources
                    </h3>
                    <DonutChart data={candidateSources} height={220} />
                    <div className="grid grid-cols-2 gap-3 mt-4">
                      {candidateSources.map((item, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <span
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="text-sm text-gray-600 dark:text-gray-400 truncate">
                            {item.label}
                          </span>
                          <span className="text-sm font-semibold text-gray-900 dark:text-white ml-auto">
                            {item.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Trends Tab */}
              {activeTab === 'trends' && (
                <motion.div
                  key="trends"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <FaChartLine className="w-5 h-5 text-blue-600" />
                        Applications Over Time
                      </h3>
                      <span className="text-sm text-gray-500">
                        Total: {stats.totalApplications}
                      </span>
                    </div>
                    <LineChart
                      data={trendData.applicationData}
                      labels={trendData.labels}
                      color="#3B82F6"
                      height={260}
                    />
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <FaCalendarCheck className="w-5 h-5 text-purple-600" />
                        Interviews
                      </h3>
                      <BarChart
                        data={trendData.interviewData}
                        labels={trendData.labels}
                        color="#8B5CF6"
                        height={220}
                      />
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <FaUserCheck className="w-5 h-5 text-green-600" />
                        Hires
                      </h3>
                      <BarChart
                        data={trendData.hireData}
                        labels={trendData.labels}
                        color="#10B981"
                        height={220}
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Jobs Tab */}
              {activeTab === 'jobs' && (
                <motion.div
                  key="jobs"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Top Performing Jobs
                    </h3>
                    <Link
                      to="/company/jobs"
                      className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                    >
                      View All Jobs
                      <FaExternalLinkAlt className="w-3 h-3" />
                    </Link>
                  </div>

                  {topJobs.length > 0 ? (
                    <div className="space-y-3">
                      {topJobs.map((job, index) => (
                        <motion.div
                          key={job.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                            {index + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-900 dark:text-white truncate">
                              {job.title}
                            </h4>
                            <p className="text-sm text-gray-500 truncate">
                              {job.location} • {job.type}
                            </p>
                          </div>
                          <div className="flex items-center gap-6">
                            <div className="text-center">
                              <div className="text-lg font-bold text-gray-900 dark:text-white">
                                {job.applicationCount}
                              </div>
                              <div className="text-xs text-gray-400">Apps</div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-bold text-green-600">
                                {job.hireCount}
                              </div>
                              <div className="text-xs text-gray-400">Hires</div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-bold text-blue-600">
                                {formatPercent(job.conversion, 0)}
                              </div>
                              <div className="text-xs text-gray-400">Rate</div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <FaBriefcase className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">No job data available yet</p>
                    </div>
                  )}
                </motion.div>
              )}

              {/* AI Insights Tab */}
              {activeTab === 'insights' && (
                <motion.div
                  key="insights"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <FaBrain className="w-5 h-5 text-purple-600" />
                        AI-Powered Insights
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Recommendations based on your hiring data
                      </p>
                    </div>
                    <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full text-xs font-medium">
                      Real-time
                    </span>
                  </div>

                  {insights.map((insight, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`p-4 rounded-xl border-l-4 ${
                        insight.type === 'success' 
                          ? 'bg-green-50 dark:bg-green-900/20 border-green-500'
                          : insight.type === 'warning'
                          ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500'
                          : 'bg-blue-50 dark:bg-blue-900/20 border-blue-500'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${
                          insight.type === 'success' 
                            ? 'bg-green-100 dark:bg-green-900/40 text-green-600'
                            : insight.type === 'warning'
                            ? 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-600'
                            : 'bg-blue-100 dark:bg-blue-900/40 text-blue-600'
                        }`}>
                          <insight.icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                            {insight.title}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                            {insight.description}
                          </p>
                          {insight.action && (
                            <Link
                              to={insight.actionLink}
                              className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
                            >
                              {insight.action}
                              <FaArrowRight className="w-3 h-3" />
                            </Link>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/company/jobs/create"
            className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-5 text-white hover:from-blue-600 hover:to-blue-700 transition-all flex items-center gap-4"
          >
            <div className="p-3 bg-white/20 rounded-lg">
              <FaPlus className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold mb-1">Post New Job</h4>
              <p className="text-sm opacity-90">Attract more candidates</p>
            </div>
          </Link>

          <Link
            to="/company/applications"
            className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-5 text-white hover:from-purple-600 hover:to-purple-700 transition-all flex items-center gap-4"
          >
            <div className="p-3 bg-white/20 rounded-lg">
              <FaUsers className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold mb-1">Review Applications</h4>
              <p className="text-sm opacity-90">{stats.inReview} pending</p>
            </div>
          </Link>

          <Link
            to="/company/schedule-interview"
            className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-5 text-white hover:from-green-600 hover:to-green-700 transition-all flex items-center gap-4"
          >
            <div className="p-3 bg-white/20 rounded-lg">
              <FaCalendarCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold mb-1">Schedule Interview</h4>
              <p className="text-sm opacity-90">Meet candidates</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CompanyAnalytics;
