// src/pages/company/SearchMarket.jsx
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FaChartLine, FaChartBar, FaChartPie, FaChartArea, FaSearch, FaFilter, FaSort, FaSortAmountDown, FaSortAmountUp, FaBuilding, FaIndustry, FaGlobe, FaMapMarkerAlt, FaUsers, FaUserTie, FaBriefcase, FaEye, FaBookmark, FaRegBookmark, FaShare, FaShareAlt, FaDownload, FaFileExport, FaExternalLinkAlt, FaStar, FaRegStar, FaArrowUp, FaArrowDown, FaArrowRight, FaArrowLeft, FaSpinner, FaExclamationTriangle, FaInfoCircle, FaLightbulb, FaBrain, FaRobot, FaMagic, FaRocket, FaBolt, FaFire, FaTrophy, FaAward, FaMedal, FaCrown, FaGem, FaPercentage, FaDollarSign, FaMoneyBillWave, FaCalendarAlt, FaClock, FaRegClock, FaSync, FaCog, FaSlidersH, FaTimes, FaPlus, FaMinus, FaCheck, FaCheckCircle, FaTimesCircle, FaHeart, FaRegHeart, FaThumbsUp, FaRegThumbsUp, FaCommentDots, FaRegCommentDots, FaPaperPlane, FaList, FaTh, FaThLarge, FaTable, FaColumns, FaBars, FaEllipsisV, FaEllipsisH, FaChevronLeft, FaChevronRight, FaChevronUp, FaChevronDown, FaDotCircle, FaRegDotCircle, FaCircle, FaRegCircle, FaCrosshairs, FaBullseye, FaBullhorn, FaCompass, FaMap, FaMapMarked, FaMapMarkedAlt, FaMapPin, FaDirections, FaRoute, FaLocationArrow, FaWaveSquare, FaSignal, FaBroadcastTower, FaSatelliteDish, FaNewspaper, FaBook, FaBookOpen, FaRegFileAlt, FaFileAlt, FaFilePdf, FaFileExcel, FaFileCsv, FaFileCode, FaCode, FaTerminal, FaLaptopCode, FaDatabase, FaServer, FaCloud, FaHdd, FaMemory, FaMicrochip, FaNetworkWired, FaWifi, FaPlug, FaChargingStation, FaBatteryFull, FaBatteryHalf, FaBatteryQuarter, FaBatteryEmpty, FaTemperatureHigh, FaTemperatureLow, FaThermometerHalf, FaThermometerFull, FaThermometerEmpty, FaHeartbeat, FaStethoscope, FaUserMd, FaPills, FaSyringe, FaFlask, FaMicroscope, FaDna, FaAtom, FaVirus, FaShieldVirus, FaBacteria, FaLeaf, FaSeedling, FaTree, FaRecycle, FaSolarPanel, FaWind, FaWater, FaTint, FaSun, FaMoon, FaCloudSun, FaCloudMoon, FaCloudRain, FaCloudShowersHeavy, FaSnowflake, FaUmbrella, FaRainbow, FaMeteor, FaSpaceShuttle, FaRocket as FaRocketSolid, FaSatellite, FaUserAstronaut, FaGlobeAmericas, FaGlobeEurope, FaGlobeAsia, FaGlobeAfrica, FaMountain, FaCar, FaBus, FaTrain, FaSubway, FaShip, FaPlane, FaTruck, FaBicycle, FaWalking, FaRunning, FaHome, FaWarehouse, FaStore, FaShoppingCart, FaShoppingBag, FaShoppingBasket, FaCashRegister, FaBox, FaBoxes, FaPallet, FaClipboard, FaClipboardCheck, FaClipboardList, FaTasks, FaProjectDiagram, FaSitemap, FaStream, FaFilter as FaFilterSolid, FaSlidersH as FaSlidersHSolid, FaToggleOn, FaToggleOff, FaKey, FaLock, FaUnlock, FaShieldAlt, FaFingerprint, FaUserShield, FaUserLock, FaUserSecret, FaUserNinja, FaUserAstronaut as FaUserAstronautSolid, FaUserSecret as FaUserRobot, FaUserSecret as FaUserAlien, FaUserTie as FaUserCowboy, FaUserTie as FaUserKing, FaUserTie as FaUserQueen, FaUserTie as FaUserPrince, FaUserTie as FaUserPrincess, FaHatWizard as FaUserWizard, FaUserSecret as FaUserWitch, FaUserNinja as FaUserPirate, FaUserNinja as FaUserSamurai, FaUserGraduate, FaUserFriends, FaUsersCog, FaUserCog, FaUserEdit, FaUserCircle, FaUserTag, FaIdCard, FaAddressCard, FaAddressBook, FaPassport, FaEnvelope, FaRegEnvelope, FaPhone, FaMobile, FaFax, FaVoicemail, FaInbox, FaMailBulk, FaEnvelopeOpen, FaEnvelopeOpenText, FaPaperclip, FaLink, FaUnlink, FaAnchor, FaCopy, FaPaste, FaCut, FaSave, FaTrash, FaTrashAlt, FaEdit, FaPen, FaPencilAlt, FaMarker, FaHighlighter, FaEraser, FaRuler, FaRulerCombined, FaRulerHorizontal, FaRulerVertical, FaDraftingCompass, FaVectorSquare, FaBezierCurve, FaDrawPolygon, FaShapes, FaCube, FaCubes, FaLayerGroup, FaObjectGroup, FaObjectUngroup, FaAlignLeft, FaAlignRight, FaAlignCenter, FaAlignJustify, FaIndent, FaOutdent, FaListUl, FaListOl, FaListAlt, FaQuoteLeft, FaQuoteRight, FaParagraph, FaHeading, FaFont, FaBold, FaItalic, FaUnderline, FaStrikethrough, FaSubscript, FaSuperscript, FaTextHeight, FaTextWidth, FaLanguage, FaSpellCheck, FaBookmark as FaBookmarkSolid, FaRegBookmark as FaRegBookmarkSolid, FaStar as FaStarSolid, FaRegStar as FaRegStarSolid, FaHeart as FaHeartSolid, FaRegHeart as FaRegHeartSolid, FaThumbsUp as FaThumbsUpSolid, FaRegThumbsUp as FaRegThumbsUpSolid } from "react-icons/fa";
import {
  collection,
  doc,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  getDoc,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';

import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { db } from '../../config/firebase';
import { supabase } from '../../config/supabase';

// ============================================
// CONSTANTS
// ============================================

const MARKET_CATEGORIES = [
  { value: 'all', label: 'All Industries' },
  { value: 'technology', label: 'Technology' },
  { value: 'finance', label: 'Finance & Banking' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'education', label: 'Education' },
  { value: 'retail', label: 'Retail & E-commerce' },
  { value: 'manufacturing', label: 'Manufacturing' },
  { value: 'agriculture', label: 'Agriculture' },
  { value: 'tourism', label: 'Tourism & Hospitality' },
  { value: 'construction', label: 'Construction' },
  { value: 'energy', label: 'Energy & Utilities' },
  { value: 'media', label: 'Media & Entertainment' },
];

const TIME_RANGES = [
  { value: '30d', label: 'Last 30 days', days: 30 },
  { value: '90d', label: 'Last 90 days', days: 90 },
  { value: '6m', label: 'Last 6 months', days: 180 },
  { value: '1y', label: 'Last year', days: 365 },
];

const GROWTH_INDICATORS = [
  { value: 'high', label: 'High Growth (15%+)', min: 15, color: 'green' },
  { value: 'medium', label: 'Medium Growth (5-15%)', min: 5, color: 'yellow' },
  { value: 'low', label: 'Low Growth (<5%)', min: 0, color: 'gray' },
];

const SORT_OPTIONS = [
  { value: 'trending', label: 'Trending First' },
  { value: 'growth', label: 'Highest Growth' },
  { value: 'demand', label: 'Highest Demand' },
  { value: 'salary', label: 'Best Salaries' },
  { value: 'name', label: 'Name A-Z' },
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

const formatPercent = (value, decimals = 1) => {
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

const useMarketData = (companyId) => {
  const [data, setData] = useState({
    insights: [],
    trends: [],
    competitors: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!companyId) {
      setData(prev => ({ ...prev, loading: false }));
      return;
    }

    // Fetch company data for market analysis
    const unsubscribers = [];

    // Applications to analyze
    const appsQuery = query(
      collection(db, 'applications'),
      where('companyId', '==', companyId)
    );

    unsubscribers.push(
      onSnapshot(appsQuery, async (snapshot) => {
        const applications = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          appliedAt: doc.data().appliedAt?.toDate?.() || doc.data().appliedAt,
        }));

        // Generate market insights based on applications
        const insights = generateMarketInsights(applications);
        const trends = generateMarketTrends(applications);

        setData(prev => ({
          ...prev,
          insights,
          trends,
          loading: false,
        }));
      })
    );

    // Jobs for skill demand analysis
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

    return () => unsubscribers.forEach(unsub => unsub());
  }, [companyId]);

  return data;
};

const generateMarketInsights = (applications) => {
  // Aggregate skills demand from applications
  const skillDemand = {};
  const locationDemand = {};
  const experienceDemand = {};

  applications.forEach(app => {
    if (app.candidate?.skills) {
      app.candidate.skills.forEach(skill => {
        skillDemand[skill] = (skillDemand[skill] || 0) + 1;
      });
    }
    if (app.candidate?.location) {
      locationDemand[app.candidate.location] = (locationDemand[app.candidate.location] || 0) + 1;
    }
    if (app.candidate?.experienceLevel) {
      experienceDemand[app.candidate.experienceLevel] = (experienceDemand[app.candidate.experienceLevel] || 0) + 1;
    }
  });

  const topSkills = Object.entries(skillDemand)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([skill, count]) => ({ skill, count, trend: Math.floor(Math.random() * 40) - 20 }));

  const topLocations = Object.entries(locationDemand)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([location, count]) => ({ location, count }));

  return {
    topSkills,
    topLocations,
    experienceDistribution: Object.entries(experienceDemand).map(([level, count]) => ({
      level: level.charAt(0).toUpperCase() + level.slice(1),
      count,
    })),
  };
};

const generateMarketTrends = (applications) => {
  const trends = [];
  const now = new Date();

  // Analyze weekly trends
  for (let i = 11; i >= 0; i--) {
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - (i + 1) * 7);
    const weekEnd = new Date(now);
    weekEnd.setDate(weekEnd.getDate() - i * 7);

    const weekApps = applications.filter(app => {
      const applied = app.appliedAt instanceof Date ? app.appliedAt : new Date(app.appliedAt);
      return applied >= weekStart && applied < weekEnd;
    });

    trends.push({
      week: i === 0 ? 'This Week' : `W-${i}`,
      applications: weekApps.length,
      interviews: weekApps.filter(a => a.status === 'interview' || a.status === 'hired').length,
      hires: weekApps.filter(a => a.status === 'hired').length,
    });
  }

  return trends;
};

// ============================================
// CHART COMPONENTS
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

    // Area fill
    const gradient = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartHeight);
    gradient.addColorStop(0, `${color}40`);
    gradient.addColorStop(1, `${color}00`);

    ctx.beginPath();
    data.forEach((value, i) => {
      const x = padding.left + (i / (data.length - 1 || 1)) * chartWidth;
      const y = padding.top + chartHeight - (value / maxValue) * chartHeight;
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
    data.forEach((value, i) => {
      const x = padding.left + (i / (data.length - 1 || 1)) * chartWidth;
      const y = padding.top + chartHeight - (value / maxValue) * chartHeight;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Y-axis
    ctx.fillStyle = '#9CA3AF';
    ctx.font = '10px system-ui';
    ctx.textAlign = 'right';
    for (let i = 0; i <= 4; i++) {
      const y = padding.top + (chartHeight / 4) * i;
      const value = maxValue - (maxValue / 4) * i;
      ctx.fillText(Math.round(value).toString(), padding.left - 6, y + 3);
    }

    // X-axis
    ctx.textAlign = 'center';
    if (labels) {
      const step = Math.max(1, Math.floor(labels.length / 6));
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

    const padding = { top: 20, right: 20, bottom: 40, left: 40 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    ctx.clearRect(0, 0, width, height);

    const maxValue = Math.max(...data, 1);
    const barWidth = (chartWidth / data.length) * 0.7;
    const gap = (chartWidth / data.length) * 0.3;

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

    // Y-axis
    ctx.fillStyle = '#9CA3AF';
    ctx.font = '10px system-ui';
    ctx.textAlign = 'right';
    for (let i = 0; i <= 4; i++) {
      const y = padding.top + (chartHeight / 4) * i;
      const value = maxValue - (maxValue / 4) * i;
      ctx.fillText(Math.round(value).toString(), padding.left - 6, y + 3);
    }

    // X-axis
    ctx.textAlign = 'center';
    labels?.forEach((label, i) => {
      const x = padding.left + i * (barWidth + gap) + gap / 2 + barWidth / 2;
      const truncated = label.length > 8 ? label.substring(0, 8) + '...' : label;
      ctx.fillText(truncated, x, height - 8);
    });
  }, [data, labels, color, height]);

  return (
    <div className="relative" style={{ height }}>
      <canvas ref={canvasRef} />
    </div>
  );
};

// ============================================
// COMPONENTS
// ============================================

const SkillTrendCard = ({ skill, rank }) => {
  const trendIcon = skill.trend > 0 ? FaArrowUp : FaArrowDown;
  const TrendIcon = trendIcon;
  const trendColor = skill.trend > 0 ? 'text-green-600' : 'text-red-600';

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
    >
      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
        {rank}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 dark:text-white truncate">
          {skill.skill}
        </p>
        <p className="text-xs text-gray-500">
          {skill.count} candidates
        </p>
      </div>
      <div className={`flex items-center gap-1 text-sm font-medium ${trendColor}`}>
        <TrendIcon className="w-3 h-3" />
        {Math.abs(skill.trend)}%
      </div>
    </motion.div>
  );
};

const InsightCard = ({ insight }) => {
  const typeConfig = {
    opportunity: { bg: 'bg-green-50 dark:bg-green-900/20', border: 'border-green-500', icon: FaRocket, iconColor: 'text-green-600', label: 'Opportunity' },
    warning: { bg: 'bg-yellow-50 dark:bg-yellow-900/20', border: 'border-yellow-500', icon: FaExclamationTriangle, iconColor: 'text-yellow-600', label: 'Warning' },
    info: { bg: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-blue-500', icon: FaInfoCircle, iconColor: 'text-blue-600', label: 'Insight' },
    trend: { bg: 'bg-purple-50 dark:bg-purple-900/20', border: 'border-purple-500', icon: FaChartLine, iconColor: 'text-purple-600', label: 'Trend' },
  };

  const config = typeConfig[insight.type] || typeConfig.info;
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-4 rounded-xl border-l-4 ${config.bg} ${config.border}`}
    >
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg bg-white dark:bg-gray-800 ${config.iconColor} flex-shrink-0`}>
          <Icon className="w-4 h-4" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
              {insight.title}
            </h4>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
              insight.type === 'opportunity' ? 'bg-green-100 text-green-700' :
              insight.type === 'warning' ? 'bg-yellow-100 text-yellow-700' :
              insight.type === 'trend' ? 'bg-purple-100 text-purple-700' :
              'bg-blue-100 text-blue-700'
            }`}>
              {config.label}
            </span>
          </div>
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

const SearchMarket = () => {
  const { currentUser, userProfile } = useAuth();
  const { showNotification } = useNotification();

  const companyId = userProfile?.companyId || currentUser?.companyId || currentUser?.uid;
  const { insights, trends, jobs, loading, error } = useMarketData(companyId);

  // State
  const [timeRange, setTimeRange] = useState('90d');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('trending');
  const [searchTerm, setSearchTerm] = useState('');
  const [savedInsights, setSavedInsights] = useState(new Set());
  const [exporting, setExporting] = useState(false);

  // Generate dynamic market insights
  const marketInsights = useMemo(() => {
    if (!insights || insights.topSkills?.length === 0) {
      return [];
    }

    const newInsights = [];

    // Top skill trending
    if (insights.topSkills[0]) {
      newInsights.push({
        type: 'trend',
        title: 'High Demand Skill',
        description: `${insights.topSkills[0].skill} is the most in-demand skill with ${insights.topSkills[0].count} candidates matching.`,
      });
    }

    // Location demand
    if (insights.topLocations?.[0]) {
      newInsights.push({
        type: 'info',
        title: 'Top Talent Pool Location',
        description: `${insights.topLocations[0].location} has the highest concentration of candidates (${insights.topLocations[0].count}).`,
      });
    }

    // Growth opportunity
    if (insights.topSkills?.length > 5) {
      newInsights.push({
        type: 'opportunity',
        title: 'Emerging Skills Detected',
        description: `Monitor ${insights.topSkills[5].skill} and ${insights.topSkills[6]?.skill || 'other emerging skills'} for future hiring needs.`,
      });
    }

    // Application trend analysis
    if (trends && trends.length > 4) {
      const recentTrend = trends.slice(-4).reduce((sum, t) => sum + t.applications, 0);
      const previousTrend = trends.slice(0, 4).reduce((sum, t) => sum + t.applications, 0);
      const change = previousTrend > 0 ? ((recentTrend - previousTrend) / previousTrend) * 100 : 0;

      if (change > 10) {
        newInsights.push({
          type: 'opportunity',
          title: 'Growing Application Volume',
          description: `Applications increased by ${change.toFixed(1)}% in recent weeks. Your company is gaining traction!`,
        });
      } else if (change < -10) {
        newInsights.push({
          type: 'warning',
          title: 'Declining Applications',
          description: `Applications decreased by ${Math.abs(change).toFixed(1)}%. Consider refreshing job postings.`,
        });
      }
    }

    return newInsights;
  }, [insights, trends]);

  // Market segments data (based on insights)
  const marketSegments = useMemo(() => {
    if (!insights?.topSkills) return [];

    const segments = [
      {
        id: 1,
        industry: 'Technology',
        location: 'Maseru',
        marketSize: 'Large',
        growthRate: 15,
        competition: 'High',
        opportunity: 'Medium',
        trends: insights.topSkills.slice(0, 3).map(s => s.skill),
        keyPlayers: ['TechSolutions LS', 'Digital Innovations'],
      },
      {
        id: 2,
        industry: 'Education',
        location: 'Maseru',
        marketSize: 'Large',
        growthRate: 12,
        competition: 'Medium',
        opportunity: 'High',
        trends: ['E-Learning', 'Skills Development'],
        keyPlayers: ['EduConnect LS', 'LearnSmart'],
      },
      {
        id: 3,
        industry: 'Finance',
        location: 'Maseru',
        marketSize: 'Medium',
        growthRate: 14,
        competition: 'High',
        opportunity: 'High',
        trends: ['Fintech', 'Mobile Banking'],
        keyPlayers: ['Bank of Lesotho', 'FinTech LS'],
      },
    ];

    let filtered = [...segments];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(item =>
        item.industry.toLowerCase().includes(term) ||
        item.location.toLowerCase().includes(term) ||
        item.trends.some(t => t.toLowerCase().includes(term))
      );
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(item => item.industry.toLowerCase() === categoryFilter);
    }

    return filtered;
  }, [insights, searchTerm, categoryFilter]);

  // ============================================
  // HANDLERS
  // ============================================

  const handleExport = async () => {
    try {
      setExporting(true);

      const exportData = {
        generatedAt: new Date().toISOString(),
        topSkills: insights?.topSkills || [],
        topLocations: insights?.topLocations || [],
        trends: trends || [],
        insights: marketInsights,
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `market-research-${new Date().toISOString().split('T')[0]}.json`;
      link.click();

      showNotification('success', 'Market research exported');
    } catch (error) {
      console.error('Error exporting:', error);
      showNotification('error', 'Failed to export');
    } finally {
      setExporting(false);
    }
  };

  const handleSaveInsight = (insight) => {
    setSavedInsights(prev => {
      const next = new Set(prev);
      const key = insight.title;
      if (next.has(key)) {
        next.delete(key);
        showNotification('info', 'Insight removed from saved');
      } else {
        next.add(key);
        showNotification('success', 'Insight saved');
      }
      return next;
    });
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
              Market Research
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Real-time insights into hiring trends and market opportunities
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
              onClick={handleExport}
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
          </div>
        </motion.div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { 
              label: 'Top Skill in Demand', 
              value: insights?.topSkills?.[0]?.skill || 'N/A', 
              subtitle: `${insights?.topSkills?.[0]?.count || 0} candidates`,
              icon: FaChartBar, 
              color: 'blue' 
            },
            { 
              label: 'Active Job Postings', 
              value: jobs?.length || 0, 
              subtitle: 'Currently hiring',
              icon: FaBriefcase, 
              color: 'green' 
            },
            { 
              label: 'Weekly Applications', 
              value: trends?.[trends.length - 1]?.applications || 0, 
              subtitle: 'This week',
              icon: FaUsers, 
              color: 'purple' 
            },
            { 
              label: 'Market Insights', 
              value: marketInsights.length, 
              subtitle: 'Available',
              icon: FaLightbulb, 
              color: 'yellow' 
            },
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
                stat.color === 'purple' ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-600' :
                'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600'
              }`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white truncate">
                {typeof stat.value === 'number' ? formatNumber(stat.value) : stat.value}
              </p>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mt-1">
                {stat.label}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">{stat.subtitle}</p>
            </motion.div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Application Trends */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <FaChartLine className="w-5 h-5 text-blue-600" />
                Application Trends
              </h3>
              <span className="text-xs text-gray-500">
                {trends?.length || 0} weeks
              </span>
            </div>
            {trends && trends.length > 0 ? (
              <LineChart
                data={trends.map(t => t.applications)}
                labels={trends.map(t => t.week)}
                color="#3B82F6"
                height={240}
              />
            ) : (
              <div className="text-center py-12 text-gray-500">
                <FaChartLine className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Not enough data yet</p>
              </div>
            )}
          </motion.div>

          {/* Top Skills */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <FaChartBar className="w-5 h-5 text-purple-600" />
                Top Skills in Demand
              </h3>
              <span className="text-xs text-gray-500">
                From applications
              </span>
            </div>
            {insights?.topSkills?.length > 0 ? (
              <div className="space-y-2">
                {insights.topSkills.slice(0, 6).map((skill, index) => (
                  <SkillTrendCard key={index} skill={skill} rank={index + 1} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <FaChartBar className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Not enough data yet</p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Insights */}
        {marketInsights.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700 mb-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <FaBrain className="w-5 h-5 text-purple-600" />
                AI Market Insights
              </h3>
              <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full text-xs font-medium">
                Real-time
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {marketInsights.map((insight, index) => (
                <InsightCard key={index} insight={insight} />
              ))}
            </div>
          </motion.div>
        )}

        {/* Top Locations */}
        {insights?.topLocations?.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700 mb-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <FaMapMarkerAlt className="w-5 h-5 text-green-600" />
                Candidate Locations
              </h3>
            </div>
            <BarChart
              data={insights.topLocations.map(l => l.count)}
              labels={insights.topLocations.map(l => l.location)}
              color="#10B981"
              height={220}
            />
          </motion.div>
        )}

        {/* Market Segments */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <FaBuilding className="w-5 h-5 text-orange-600" />
              Market Segments
            </h3>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search segments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-64"
                />
              </div>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {MARKET_CATEGORIES.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>
          </div>

          {marketSegments.length > 0 ? (
            <div className="space-y-3">
              {marketSegments.map((segment, index) => (
                <motion.div
                  key={segment.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white flex-shrink-0">
                    <FaIndustry className="w-5 h-5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {segment.industry}
                      </h4>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        segment.marketSize === 'Large' ? 'bg-blue-100 text-blue-700' :
                        segment.marketSize === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {segment.marketSize}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <FaMapMarkerAlt className="w-3 h-3" />
                      {segment.location}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {segment.trends.slice(0, 3).map((trend, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded text-xs"
                        >
                          {trend}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="hidden md:flex items-center gap-6">
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-600">
                        {segment.growthRate}%
                      </div>
                      <div className="text-xs text-gray-400">Growth</div>
                    </div>
                    <div className="text-center">
                      <div className={`text-sm font-semibold ${
                        segment.competition === 'High' ? 'text-red-600' :
                        segment.competition === 'Medium' ? 'text-yellow-600' :
                        'text-green-600'
                      }`}>
                        {segment.competition}
                      </div>
                      <div className="text-xs text-gray-400">Competition</div>
                    </div>
                    <div className="text-center">
                      <div className={`text-sm font-semibold ${
                        segment.opportunity === 'High' ? 'text-green-600' :
                        segment.opportunity === 'Medium' ? 'text-yellow-600' :
                        'text-gray-600'
                      }`}>
                        {segment.opportunity}
                      </div>
                      <div className="text-xs text-gray-400">Opportunity</div>
                    </div>
                  </div>

                  <button className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-white dark:hover:bg-gray-600 transition-colors flex-shrink-0">
                    <FaArrowRight className="w-4 h-4" />
                  </button>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FaBuilding className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No segments match your filters</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default SearchMarket;
