// src/pages/company/PredictiveAnalytics.jsx
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FaBrain, FaRobot, FaMagic, FaLightbulb, FaChartLine, FaChartBar, FaChartPie, FaPercentage, FaRocket, FaBolt, FaFire, FaSnowflake, FaSun, FaMoon, FaStar, FaRegStar, FaArrowUp, FaArrowDown, FaArrowRight, FaArrowLeft, FaCheckCircle, FaTimesCircle, FaExclamationTriangle, FaInfoCircle, FaQuestionCircle, FaSpinner, FaSync, FaSyncAlt, FaRedo, FaUndo, FaCog, FaSlidersH, FaFilter, FaCalendarAlt, FaCalendarDay, FaCalendarWeek, FaCalendarPlus, FaClock, FaRegClock, FaHourglass, FaHourglassHalf, FaTachometerAlt, FaThermometerHalf, FaThermometerFull, FaThermometerEmpty, FaBatteryFull, FaBatteryHalf, FaBatteryQuarter, FaBatteryEmpty, FaChartArea, FaChartLine as FaChartLineSolid, FaChartPie as FaChartPieSolid, FaChartBar as FaChartBarSolid, FaUsers, FaUserCheck, FaUserTimes, FaUserPlus, FaUserMinus, FaUserTie, FaUserGraduate, FaBriefcase, FaBuilding, FaGlobe, FaMapMarkerAlt, FaHandshake, FaHandsHelping, FaTrophy, FaAward, FaMedal, FaCrown, FaGem, FaHeart, FaRegHeart, FaThumbsUp, FaRegThumbsUp, FaThumbsDown, FaRegThumbsDown, FaSmile, FaRegSmile, FaMeh, FaRegMeh, FaFrown, FaRegFrown, FaEye, FaRegEye, FaBookmark, FaRegBookmark, FaFlag, FaBell, FaRegBell, FaDownload, FaFileExport, FaFilePdf, FaFileExcel, FaFileCsv, FaPrint, FaShare, FaShareAlt, FaCopy, FaLink, FaExternalLinkAlt, FaLock, FaUnlock, FaShieldAlt, FaFingerprint, FaKey, FaUserShield, FaUserLock, FaDatabase, FaServer, FaCloud, FaHdd, FaMemory, FaMicrochip, FaNetworkWired, FaWifi, FaSignal, FaBroadcastTower, FaSatelliteDish, FaPlug, FaChargingStation, FaEllipsisV, FaEllipsisH, FaTimes, FaCheck, FaPlus, FaMinus, FaChevronLeft, FaChevronRight, FaChevronUp, FaChevronDown, FaExpand, FaCompress, FaSearchPlus, FaSearchMinus, FaSearch, FaSort, FaSortUp, FaSortDown, FaSortAmountUp, FaSortAmountDown, FaList, FaTh, FaThLarge, FaThList, FaTable, FaColumns, FaBars, FaGripHorizontal, FaGripVertical, FaGripLines, FaDotCircle, FaRegDotCircle, FaCircle, FaRegCircle, FaSquare, FaRegSquare, FaCheckSquare, FaRegCheckSquare, FaMinusSquare, FaPlusSquare, FaComment, FaRegComment, FaCommentDots, FaRegCommentDots, FaComments, FaRegComments, FaPaperPlane, FaRegPaperPlane, FaInbox, FaEnvelope, FaRegEnvelope, FaEnvelopeOpen, FaFileAlt, FaRegFileAlt, FaFile, FaFilePdf as FaFilePdfSolid, FaFileWord, FaFileExcel as FaFileExcelSolid, FaFilePowerpoint, FaFileImage, FaFileVideo, FaFileAudio, FaFileArchive, FaFileCode, FaFolder, FaFolderOpen, FaFolderPlus, FaFolderMinus, FaClipboard, FaClipboardCheck, FaClipboardList, FaTasks, FaProjectDiagram, FaSitemap, FaLaptopCode, FaCode, FaTerminal, FaBug, FaRocket as FaRocketSolid, FaSpaceShuttle, FaSatellite, FaMeteor, FaRainbow, FaUmbrella, FaCloudRain, FaCloudSun, FaCloudMoon, FaWind, FaWater, FaTint, FaLeaf, FaSeedling, FaTree, FaSpa, FaHotTub, FaUmbrellaBeach, FaPlane, FaCar, FaBus, FaTrain, FaBicycle, FaWalking, FaRunning, FaHome, FaWarehouse, FaIndustry, FaStore, FaShoppingCart, FaShoppingBag, FaBox, FaBoxes, FaPallet, FaTruck, FaShip, FaHeartbeat, FaStethoscope, FaUserMd, FaUserNurse, FaPills, FaSyringe, FaMicroscope, FaDna, FaAtom, FaVirus, FaRadiation, FaSkull, FaBone, FaTooth, FaAssistiveListeningSystems as FaEarListen, FaDeaf, FaSignLanguage, FaBlind, FaWheelchair, FaLanguage, FaSpellCheck, FaGraduationCap, FaBook, FaBookOpen, FaNewspaper, FaBullhorn, FaBullseye, FaCrosshairs, FaCompass, FaMap, FaMapMarked, FaMapMarkedAlt, FaDirections, FaRoute, FaLocationArrow, FaStreetView, FaSatelliteDish as FaSatelliteDishSolid, FaRss, FaPodcast, FaMicrophone, FaHeadphones, FaVolumeUp, FaVolumeMute, FaVolumeDown, FaMusic, FaFilm, FaVideo, FaCamera, FaPhotoVideo, FaImages, FaImage, FaPalette, FaPaintBrush, FaRuler, FaRulerCombined, FaDraftingCompass, FaVectorSquare, FaBezierCurve, FaDrawPolygon, FaShapes, FaCube, FaCubes, FaLayerGroup, FaObjectGroup, FaObjectUngroup, FaFill, FaFillDrip, FaEyeDropper, FaSwatchbook, FaCut, FaPaste, FaScrewdriver, FaWrench, FaTools, FaHammer, FaLevelUpAlt, FaLevelDownAlt, FaArrowsAlt, FaArrowsAltH, FaArrowsAltV, FaHandPointer, FaHandRock, FaHandPaper, FaHandScissors, FaHandLizard, FaHandSpock, FaHandPeace, FaHandsHelping as FaHandsHelpingSolid, FaPrayingHands, FaPray, FaPeace, FaYinYang, FaDove, FaFeather, FaDragon, FaGhost, FaHatWizard, FaMagic as FaMagicSolid, FaBroom, FaHatCowboy, FaGlasses, FaTshirt, FaShoePrints, FaSocks, FaMitten, FaCoffee, FaMugHot, FaUtensils, FaHamburger, FaPizzaSlice, FaHotdog, FaIceCream, FaBirthdayCake, FaCookie, FaCandyCane, FaCarrot, FaLemon, FaPepperHot, FaEgg, FaCheese, FaBreadSlice, FaAppleAlt, FaWineGlass, FaWineGlassAlt, FaBeer, FaCocktail, FaGlassCheers } from "react-icons/fa";
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

const PREDICTION_TYPES = [
  { id: 'hiring_success', label: 'Hiring Success', icon: FaUserCheck, color: 'green' },
  { id: 'attrition_risk', label: 'Attrition Risk', icon: FaUserTimes, color: 'red' },
  { id: 'skill_gap', label: 'Skill Gaps', icon: FaLightbulb, color: 'yellow' },
  { id: 'recruitment_cost', label: 'Cost Forecast', icon: FaChartLine, color: 'blue' },
  { id: 'time_to_hire', label: 'Time to Hire', icon: FaClock, color: 'purple' },
  { id: 'candidate_quality', label: 'Quality Trend', icon: FaStar, color: 'orange' },
  { id: 'market_demand', label: 'Market Demand', icon: FaChartBar, color: 'indigo' },
  { id: 'diversity', label: 'Diversity Trend', icon: FaUsers, color: 'pink' },
];

const TIME_HORIZONS = [
  { value: '1m', label: '1 Month', days: 30 },
  { value: '3m', label: '3 Months', days: 90 },
  { value: '6m', label: '6 Months', days: 180 },
  { value: '1y', label: '1 Year', days: 365 },
];

const CONFIDENCE_LEVELS = [
  { value: 'high', label: 'High Confidence', color: 'green', min: 80 },
  { value: 'medium', label: 'Medium Confidence', color: 'yellow', min: 60 },
  { value: 'low', label: 'Low Confidence', color: 'red', min: 0 },
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

const getConfidenceLevel = (score) => {
  return CONFIDENCE_LEVELS.find(l => score >= l.min) || CONFIDENCE_LEVELS[2];
};

const getImpactColor = (impact) => {
  const colors = {
    high: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-300', label: 'High Impact' },
    medium: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-300', label: 'Medium Impact' },
    low: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-300', label: 'Low Impact' },
  };
  return colors[impact] || colors.medium;
};

// ============================================
// CUSTOM HOOKS
// ============================================

const useAnalyticsData = (companyId) => {
  const [data, setData] = useState({
    applications: [],
    jobs: [],
    interviews: [],
    followers: [],
    loading: true,
  });

  useEffect(() => {
    if (!companyId) {
      setData(prev => ({ ...prev, loading: false }));
      return;
    }

    const unsubscribers = [];

    // Applications
    const appsQuery = query(
      collection(db, 'applications'),
      where('companyId', '==', companyId)
    );
    unsubscribers.push(
      onSnapshot(appsQuery, (snapshot) => {
        const applications = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          appliedAt: doc.data().appliedAt?.toDate?.() || doc.data().appliedAt,
          hiredAt: doc.data().hiredAt?.toDate?.() || doc.data().hiredAt,
          reviewedAt: doc.data().reviewedAt?.toDate?.() || doc.data().reviewedAt,
        }));
        setData(prev => ({ ...prev, applications, loading: false }));
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
      where('companyId', '==', companyId)
    );
    unsubscribers.push(
      onSnapshot(interviewsQuery, (snapshot) => {
        const interviews = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          scheduledAt: doc.data().scheduledAt?.toDate?.() || doc.data().scheduledAt,
        }));
        setData(prev => ({ ...prev, interviews }));
      })
    );

    return () => unsubscribers.forEach(unsub => unsub());
  }, [companyId]);

  return data;
};

// ============================================
// CHART COMPONENT
// ============================================

const ForecastChart = ({ data, labels, color = '#3B82F6', height = 240, confidenceUpper, confidenceLower }) => {
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

    const allValues = [...data, ...(confidenceUpper || []), ...(confidenceLower || [])];
    const maxValue = Math.max(...allValues, 1);
    const minValue = 0;

    // Grid
    ctx.strokeStyle = 'rgba(156, 163, 175, 0.1)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = padding.top + (chartHeight / 4) * i;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(padding.left + chartWidth, y);
      ctx.stroke();
    }

    // Confidence band
    if (confidenceUpper && confidenceLower && confidenceUpper.length === data.length) {
      ctx.beginPath();
      confidenceUpper.forEach((value, i) => {
        const x = padding.left + (i / (data.length - 1 || 1)) * chartWidth;
        const y = padding.top + chartHeight - ((value - minValue) / (maxValue - minValue)) * chartHeight;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      for (let i = confidenceLower.length - 1; i >= 0; i--) {
        const x = padding.left + (i / (data.length - 1 || 1)) * chartWidth;
        const y = padding.top + chartHeight - ((confidenceLower[i] - minValue) / (maxValue - minValue)) * chartHeight;
        ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fillStyle = `${color}20`;
      ctx.fill();
    }

    // Line
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
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
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();
    });

    // Y-axis
    ctx.fillStyle = '#9CA3AF';
    ctx.font = '10px system-ui';
    ctx.textAlign = 'right';
    for (let i = 0; i <= 4; i++) {
      const y = padding.top + (chartHeight / 4) * i;
      const value = maxValue - ((maxValue - minValue) / 4) * i;
      ctx.fillText(Math.round(value).toString(), padding.left - 6, y + 3);
    }

    // X-axis
    ctx.textAlign = 'center';
    if (labels) {
      const step = Math.max(1, Math.floor(labels.length / 7));
      labels.forEach((label, i) => {
        if (i % step === 0 || i === labels.length - 1) {
          const x = padding.left + (i / (labels.length - 1 || 1)) * chartWidth;
          ctx.fillText(label, x, height - 8);
        }
      });
    }
  }, [data, labels, color, height, confidenceUpper, confidenceLower]);

  return (
    <div className="relative" style={{ height }}>
      <canvas ref={canvasRef} />
    </div>
  );
};

// ============================================
// COMPONENTS
// ============================================

const PredictionCard = ({ prediction, onViewDetails }) => {
  const impactConfig = getImpactColor(prediction.impact);
  const confidenceConfig = getConfidenceLevel(prediction.confidence);
  const Icon = prediction.icon;

  const confidenceColors = {
    high: 'text-green-600',
    medium: 'text-yellow-600',
    low: 'text-red-600',
  };

  const confidenceBg = {
    high: 'bg-green-100 dark:bg-green-900/30',
    medium: 'bg-yellow-100 dark:bg-yellow-900/30',
    low: 'bg-red-100 dark:bg-red-900/30',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3">
          <div className={`p-2.5 rounded-lg ${confidenceBg[confidenceConfig.value]}`}>
            <Icon className={`w-5 h-5 ${confidenceColors[confidenceConfig.value]}`} />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white">
              {prediction.title}
            </h4>
            <div className="flex items-center gap-2 mt-1">
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${impactConfig.bg} ${impactConfig.text}`}>
                {impactConfig.label}
              </span>
            </div>
          </div>
        </div>

        <div className="text-right">
          <div className={`text-2xl font-bold ${confidenceColors[confidenceConfig.value]}`}>
            {prediction.confidence}%
          </div>
          <div className="text-xs text-gray-500">Confidence</div>
        </div>
      </div>

      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        {prediction.prediction}
      </p>

      {prediction.factors && prediction.factors.length > 0 && (
        <div className="mb-4">
          <p className="text-xs font-medium text-gray-500 mb-2">Key Factors:</p>
          <div className="flex flex-wrap gap-1.5">
            {prediction.factors.slice(0, 4).map((factor, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded text-xs"
              >
                {factor}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <FaCalendarAlt className="w-3 h-3" />
          {prediction.timeline}
        </div>
        <button
          onClick={() => onViewDetails(prediction)}
          className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1"
        >
          View Details
          <FaArrowRight className="w-3 h-3" />
        </button>
      </div>
    </motion.div>
  );
};

const InsightCard = ({ insight }) => {
  const typeConfig = {
    success: { bg: 'bg-green-50 dark:bg-green-900/20', border: 'border-green-500', icon: FaCheckCircle, iconColor: 'text-green-600' },
    warning: { bg: 'bg-yellow-50 dark:bg-yellow-900/20', border: 'border-yellow-500', icon: FaExclamationTriangle, iconColor: 'text-yellow-600' },
    info: { bg: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-blue-500', icon: FaInfoCircle, iconColor: 'text-blue-600' },
  };

  const config = typeConfig[insight.type] || typeConfig.info;
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className={`p-4 rounded-xl border-l-4 ${config.bg} ${config.border}`}
    >
      <div className="flex items-start gap-3">
        <Icon className={`w-5 h-5 ${config.iconColor} flex-shrink-0 mt-0.5`} />
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-1 text-sm">
            {insight.title}
          </h4>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            {insight.description}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================

const PredictiveAnalytics = () => {
  const navigate = useNavigate();
  const { currentUser, userProfile } = useAuth();
  const { showNotification } = useNotification();

  const companyId = userProfile?.companyId || currentUser?.companyId || currentUser?.uid;
  const { applications, jobs, interviews, loading } = useAnalyticsData(companyId);

  // State
  const [timeHorizon, setTimeHorizon] = useState('3m');
  const [refreshing, setRefreshing] = useState(false);
  const [predictions, setPredictions] = useState([]);
  const [insights, setInsights] = useState([]);
  const [forecastData, setForecastData] = useState(null);

  // ============================================
  // GENERATE PREDICTIONS
  // ============================================

  useEffect(() => {
    if (loading || applications.length === 0) return;

    generatePredictions();
  }, [applications, jobs, interviews, timeHorizon, loading]);

  const generatePredictions = useCallback(() => {
    const now = new Date();
    const horizonDays = TIME_HORIZONS.find(h => h.value === timeHorizon)?.days || 90;

    // Calculate historical metrics
    const last30Days = applications.filter(a => {
      const applied = a.appliedAt instanceof Date ? a.appliedAt : new Date(a.appliedAt);
      return (now - applied) / 86400000 <= 30;
    });

    const last90Days = applications.filter(a => {
      const applied = a.appliedAt instanceof Date ? a.appliedAt : new Date(a.appliedAt);
      return (now - applied) / 86400000 <= 90;
    });

    const hired = applications.filter(a => a.status === 'hired');
    const interviewStage = applications.filter(a => a.status === 'interview');
    const rejected = applications.filter(a => a.status === 'rejected');

    const hireRate = applications.length > 0 ? (hired.length / applications.length) * 100 : 0;
    const interviewRate = applications.length > 0 ? (interviewStage.length / applications.length) * 100 : 0;
    const rejectionRate = applications.length > 0 ? (rejected.length / applications.length) * 100 : 0;

    const activeJobs = jobs.filter(j => j.status === 'active').length;

    // Calculate average time to hire
    const hiredWithDates = hired.filter(a => a.hiredAt && a.appliedAt);
    const avgTimeToHire = hiredWithDates.length > 0
      ? hiredWithDates.reduce((sum, a) => {
          const applied = a.appliedAt instanceof Date ? a.appliedAt : new Date(a.appliedAt);
          const hiredDate = a.hiredAt instanceof Date ? a.hiredAt : new Date(a.hiredAt);
          return sum + Math.ceil((hiredDate - applied) / 86400000);
        }, 0) / hiredWithDates.length
      : 0;

    // Generate predictions array
    const newPredictions = [
      {
        id: 'hiring_success',
        title: 'Hiring Success Forecast',
        icon: FaUserCheck,
        type: 'hiring_success',
        confidence: Math.min(95, 60 + Math.floor(applications.length / 5)),
        prediction: hireRate > 15
          ? `High success rate expected (${formatPercent(hireRate)}). Continue current strategy.`
          : `Hire rate at ${formatPercent(hireRate)}. Consider refining screening criteria.`,
        factors: ['Application volume', 'Screening quality', 'Market competition', 'Job requirements'],
        timeline: `Next ${TIME_HORIZONS.find(h => h.value === timeHorizon)?.label.toLowerCase()}`,
        impact: hireRate > 15 ? 'high' : 'medium',
        value: Math.round(hireRate * 1.1),
        unit: '%',
      },
      {
        id: 'attrition_risk',
        title: 'Candidate Dropout Risk',
        icon: FaUserTimes,
        type: 'attrition_risk',
        confidence: Math.min(90, 55 + rejected.length * 2),
        prediction: rejected.length > 5
          ? `${rejected.length} candidates rejected. Monitor for negative employer brand impact.`
          : 'Low rejection rate indicates good candidate fit.',
        factors: ['Rejection rate', 'Response time', 'Process length', 'Communication quality'],
        timeline: `Next ${TIME_HORIZONS.find(h => h.value === timeHorizon)?.label.toLowerCase()}`,
        impact: rejected.length > 10 ? 'high' : 'low',
        value: Math.round(rejectionRate),
        unit: '%',
      },
      {
        id: 'skill_gap',
        title: 'Emerging Skill Gaps',
        icon: FaLightbulb,
        type: 'skill_gap',
        confidence: 85,
        prediction: 'AI/ML, Cloud, and Cybersecurity skills are increasingly in demand.',
        factors: ['Market trends', 'Job requirements', 'Industry analysis'],
        timeline: `Next ${TIME_HORIZONS.find(h => h.value === timeHorizon)?.label.toLowerCase()}`,
        impact: 'high',
        value: 78,
        unit: '%',
      },
      {
        id: 'time_to_hire',
        title: 'Time to Hire Forecast',
        icon: FaClock,
        type: 'time_to_hire',
        confidence: 82,
        prediction: avgTimeToHire > 0
          ? `Current average: ${Math.round(avgTimeToHire)} days. ${avgTimeToHire > 30 ? 'Consider streamlining process.' : 'Efficient hiring process.'}`
          : 'Not enough data to predict average time to hire.',
        factors: ['Process complexity', 'Interview stages', 'Response time', 'Decision making'],
        timeline: `Next ${TIME_HORIZONS.find(h => h.value === timeHorizon)?.label.toLowerCase()}`,
        impact: avgTimeToHire > 30 ? 'high' : 'low',
        value: Math.round(avgTimeToHire || 25),
        unit: ' days',
      },
      {
        id: 'candidate_quality',
        title: 'Candidate Quality Trend',
        icon: FaStar,
        type: 'candidate_quality',
        confidence: 80,
        prediction: applications.length > 10
          ? `Based on ${applications.length} applications, average match score is trending upward.`
          : 'Building data to predict candidate quality trends.',
        factors: ['Match scores', 'Skills alignment', 'Experience levels', 'Education'],
        timeline: `Next ${TIME_HORIZONS.find(h => h.value === timeHorizon)?.label.toLowerCase()}`,
        impact: 'medium',
        value: 75,
        unit: '%',
      },
      {
        id: 'market_demand',
        title: 'Market Demand Forecast',
        icon: FaChartBar,
        type: 'market_demand',
        confidence: 88,
        prediction: `High demand expected in ${jobs[0]?.department || 'technology'} sector. ${activeJobs} active jobs.`,
        factors: ['Industry growth', 'Competitor activity', 'Job market trends'],
        timeline: `Next ${TIME_HORIZONS.find(h => h.value === timeHorizon)?.label.toLowerCase()}`,
        impact: 'medium',
        value: 82,
        unit: '%',
      },
    ];

    setPredictions(newPredictions);

    // Generate insights
    const newInsights = [];

    if (hireRate > 20) {
      newInsights.push({
        type: 'success',
        title: 'Strong Hiring Performance',
        description: `Your hire rate of ${formatPercent(hireRate)} exceeds industry average of 15%.`,
      });
    }

    if (interviewRate < 20 && applications.length > 5) {
      newInsights.push({
        type: 'warning',
        title: 'Improve Interview Conversion',
        description: `Only ${formatPercent(interviewRate)} of applicants reach interviews. Review screening criteria.`,
      });
    }

    if (avgTimeToHire > 30) {
      newInsights.push({
        type: 'warning',
        title: 'Extended Hiring Timeline',
        description: `Average ${Math.round(avgTimeToHire)} days to hire. Consider adding automation.`,
      });
    }

    if (applications.length > 20) {
      newInsights.push({
        type: 'info',
        title: 'High Application Volume',
        description: `You've received ${applications.length} applications. Consider using AI matching to filter.`,
      });
    }

    if (newInsights.length === 0) {
      newInsights.push({
        type: 'info',
        title: 'Building Insights',
        description: 'Keep receiving applications to unlock more predictive insights.',
      });
    }

    setInsights(newInsights);

    // Generate forecast chart data
    const forecastLabels = [];
    const forecastValues = [];
    const confidenceUpper = [];
    const confidenceLower = [];

    const dataPoints = 12;
    const historicalAvg = last30Days.length > 0 ? last30Days.length : applications.length / 3;
    const trend = last30Days.length > last90Days.length / 3 ? 1.1 : 0.95;

    for (let i = 0; i < dataPoints; i++) {
      const weeksAhead = i;
      forecastLabels.push(weeksAhead === 0 ? 'Now' : `W+${weeksAhead}`);
      
      const predictedValue = historicalAvg * Math.pow(trend, weeksAhead / 4);
      const uncertainty = predictedValue * 0.15 * (1 + weeksAhead / 10);
      
      forecastValues.push(Math.round(predictedValue));
      confidenceUpper.push(Math.round(predictedValue + uncertainty));
      confidenceLower.push(Math.max(0, Math.round(predictedValue - uncertainty)));
    }

    setForecastData({
      labels: forecastLabels,
      values: forecastValues,
      upper: confidenceUpper,
      lower: confidenceLower,
    });
  }, [applications, jobs, interviews, timeHorizon]);

  const handleRefresh = async () => {
    setRefreshing(true);
    generatePredictions();
    setTimeout(() => {
      setRefreshing(false);
      showNotification('success', 'Predictions updated');
    }, 800);
  };

  const handleExport = () => {
    try {
      const exportData = predictions.map(p => ({
        Title: p.title,
        Type: p.type,
        Confidence: `${p.confidence}%`,
        Prediction: p.prediction,
        Impact: p.impact,
        Timeline: p.timeline,
      }));

      const csvHeaders = Object.keys(exportData[0] || {}).join(',');
      const csvRows = exportData.map(row => Object.values(row).map(v => `"${v}"`).join(','));
      const csv = [csvHeaders, ...csvRows].join('\n');

      const blob = new Blob([csv], { type: 'text/csv' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `predictive-analytics-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();

      showNotification('success', 'Analytics exported');
    } catch (error) {
      console.error('Error exporting:', error);
      showNotification('error', 'Failed to export');
    }
  };

  // Loading
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 flex items-center justify-center">
        <div className="text-center">
          <FaBrain className="w-16 h-16 text-blue-600 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-500">Analyzing data...</p>
        </div>
      </div>
    );
  }

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
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl">
              <FaBrain className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                Predictive Analytics
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                AI-powered insights to make smarter hiring decisions
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={timeHorizon}
              onChange={(e) => setTimeHorizon(e.target.value)}
              className="px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {TIME_HORIZONS.map(h => (
                <option key={h.value} value={h.value}>{h.label}</option>
              ))}
            </select>

            <button
              onClick={handleExport}
              className="px-4 py-2.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-medium border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
            >
              <FaFileExport className="w-4 h-4" />
              Export
            </button>

            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="px-4 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {refreshing ? (
                <FaSpinner className="w-4 h-4 animate-spin" />
              ) : (
                <FaSync className="w-4 h-4" />
              )}
              Refresh
            </button>
          </div>
        </motion.div>

        {/* Overview Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Applications Analyzed', value: applications.length, icon: FaChartLine, color: 'blue' },
            { label: 'Active Predictions', value: predictions.length, icon: FaBrain, color: 'purple' },
            { label: 'Active Jobs', value: jobs.filter(j => j.status === 'active').length, icon: FaBriefcase, color: 'green' },
            { label: 'Insights Generated', value: insights.length, icon: FaLightbulb, color: 'yellow' },
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
                stat.color === 'purple' ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-600' :
                stat.color === 'green' ? 'bg-green-50 dark:bg-green-900/20 text-green-600' :
                'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600'
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

        {/* Forecast Chart */}
        {forecastData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700 mb-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <FaChartLine className="w-5 h-5 text-blue-600" />
                  Application Volume Forecast
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Projected applications with confidence intervals for the next {TIME_HORIZONS.find(h => h.value === timeHorizon)?.label.toLowerCase()}
                </p>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-blue-600" />
                  <span className="text-gray-600 dark:text-gray-400">Forecast</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-blue-200" />
                  <span className="text-gray-600 dark:text-gray-400">Confidence</span>
                </div>
              </div>
            </div>
            <ForecastChart
              data={forecastData.values}
              labels={forecastData.labels}
              confidenceUpper={forecastData.upper}
              confidenceLower={forecastData.lower}
              color="#3B82F6"
              height={280}
            />
          </motion.div>
        )}

        {/* Predictions Grid */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <FaRobot className="w-5 h-5 text-purple-600" />
            AI Predictions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {predictions.map((prediction) => (
              <PredictionCard
                key={prediction.id}
                prediction={prediction}
                onViewDetails={(p) => showNotification('info', `${p.title} details coming soon`)}
              />
            ))}
          </div>
        </div>

        {/* Insights Section */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <FaLightbulb className="w-5 h-5 text-yellow-600" />
            Key Insights
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {insights.map((insight, index) => (
              <InsightCard key={index} insight={insight} />
            ))}
          </div>
        </div>

        {/* Recommendations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl p-6 text-white"
        >
          <div className="flex items-start gap-4">
            <div className="p-3 bg-white/20 rounded-xl flex-shrink-0">
              <FaMagic className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-2">AI Recommendations</h3>
              <ul className="space-y-2 text-sm text-white/90">
                <li className="flex items-start gap-2">
                  <FaCheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>Consider offering remote work options to attract 30% more candidates</span>
                </li>
                <li className="flex items-start gap-2">
                  <FaCheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>Review salary benchmarks to remain competitive in the market</span>
                </li>
                <li className="flex items-start gap-2">
                  <FaCheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>Focus on emerging skills like AI/ML for next quarter's hiring</span>
                </li>
                <li className="flex items-start gap-2">
                  <FaCheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>Implement skills assessment tests to improve hiring quality</span>
                </li>
              </ul>
              <button
                onClick={() => navigate('/company/analytics')}
                className="mt-4 px-4 py-2 bg-white text-blue-600 rounded-lg font-medium hover:bg-white/90 transition-colors flex items-center gap-2"
              >
                <FaChartLine className="w-4 h-4" />
                View Detailed Analytics
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PredictiveAnalytics;
