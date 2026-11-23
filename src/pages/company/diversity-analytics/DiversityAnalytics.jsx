// src/pages/company/diversity-analytics/DiversityAnalytics.jsx
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { FaUsers, FaChartLine, FaChartBar, FaChartPie, FaPercentage, FaVenus, FaMars, FaGenderless, FaTransgender, FaGlobe, FaGlobeAmericas, FaGlobeEurope, FaGlobeAsia, FaGlobeAfrica, FaGraduationCap, FaBriefcase, FaMapMarkerAlt, FaUserFriends, FaHeart, FaHandsHelping, FaBalanceScale, FaShieldAlt, FaCheckCircle, FaInfoCircle, FaLightbulb, FaArrowUp, FaArrowDown, FaArrowRight, FaDownload, FaFileExport, FaSync, FaSpinner, FaFilter, FaCalendarAlt, FaRegCalendar, FaRegClock, FaEllipsisV, FaTrophy, FaAward, FaStar, FaBrain, FaRobot, FaMagic, FaUsers as FaUsersSolid, FaUserTie, FaUserGraduate, FaUserMd, FaUserNurse, FaUserAstronaut, FaUserSecret as FaUserRobot, FaUserSecret, FaChartArea, FaLayerGroup, FaSitemap, FaNetworkWired, FaHandHoldingHeart, FaHandHoldingUsd, FaPrayingHands, FaDove, FaFeather, FaLeaf, FaSeedling, FaTree, FaSpa, FaRainbow, FaSun, FaMoon, FaStar as FaStarSolid, FaCrown, FaGem, FaMedal, FaTrophy as FaTrophySolid, FaChartPie as FaChartPieSolid, FaChartBar as FaChartBarSolid, FaChevronLeft, FaChevronRight, FaChevronUp, FaChevronDown, FaCheck, FaTimes, FaPlus, FaMinus, FaEdit, FaEye, FaExternalLinkAlt, FaFileAlt, FaClipboard, FaClipboardCheck } from "react-icons/fa";
import {
  collection, doc, query, where, orderBy, onSnapshot, Timestamp,
} from 'firebase/firestore';

import { useAuth } from '../../../context/AuthContext';
import { useNotification } from '../../../context/NotificationContext';
import { db } from '../../../config/firebase';
import { supabase } from '../../../config/supabase';

const TIME_RANGES = [
  { value: '30d', label: 'Last 30 days', days: 30 },
  { value: '90d', label: 'Last 90 days', days: 90 },
  { value: '6m', label: 'Last 6 months', days: 180 },
  { value: '1y', label: 'Last year', days: 365 },
  { value: 'all', label: 'All time', days: 3650 },
];

const GENDER_OPTIONS = [
  { value: 'male', label: 'Male', icon: FaMars, color: '#3B82F6' },
  { value: 'female', label: 'Female', icon: FaVenus, color: '#EC4899' },
  { value: 'non-binary', label: 'Non-binary', icon: FaGenderless, color: '#8B5CF6' },
  { value: 'prefer-not-to-say', label: 'Prefer not to say', icon: FaGenderless, color: '#6B7280' },
];

const AGE_BRACKETS = [
  { value: '18-24', label: '18-24', color: '#3B82F6' },
  { value: '25-34', label: '25-34', color: '#8B5CF6' },
  { value: '35-44', label: '35-44', color: '#EC4899' },
  { value: '45-54', label: '45-54', color: '#F59E0B' },
  { value: '55+', label: '55+', color: '#10B981' },
];

const formatNumber = (num) => {
  if (num === null || num === undefined) return '0';
  return new Intl.NumberFormat('en-US').format(num);
};

const formatPercent = (value, decimals = 1) => {
  if (value === null || value === undefined) return '0%';
  return `${value.toFixed(decimals)}%`;
};

const useDiversityData = (companyId, timeRange = '90d') => {
  const [data, setData] = useState({
    applications: [],
    hires: [],
    loading: true,
    error: '',
  });

  useEffect(() => {
    if (!companyId) { setData(prev => ({ ...prev, loading: false })); return; }
    const unsubs = [];

    const rangeConfig = TIME_RANGES.find(r => r.value === timeRange) || TIME_RANGES[1];
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - rangeConfig.days);

    unsubs.push(onSnapshot(
      query(collection(db, 'applications'), where('companyId', '==', companyId), orderBy('appliedAt', 'desc')),
      (snap) => {
        const applications = snap.docs
          .map(d => ({
            id: d.id, ...d.data(),
            appliedAt: d.data().appliedAt?.toDate?.() || d.data().appliedAt,
            hiredAt: d.data().hiredAt?.toDate?.() || d.data().hiredAt,
          }))
          .filter(a => {
            const date = a.appliedAt instanceof Date ? a.appliedAt : new Date(a.appliedAt);
            return date >= startDate;
          });
        setData(prev => ({ ...prev, applications, loading: false, error: '' }));
      },
      (error) => setData(prev => ({ ...prev, loading: false, error: error.message || 'Could not load application records.' }))
    ));

    unsubs.push(onSnapshot(
      query(collection(db, 'jobs'), where('companyId', '==', companyId)),
      (snap) => {
        const jobs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setData(prev => ({ ...prev, jobs, error: '' }));
      },
      (error) => setData(prev => ({ ...prev, loading: false, error: error.message || 'Could not load company jobs.' }))
    ));

    return () => unsubs.forEach(u => u());
  }, [companyId, timeRange]);

  return data;
};

const DonutChart = ({ data, height = 240, centerLabel, centerValue }) => {
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
    const total = data.reduce((sum, d) => sum + d.value, 0) || 1;

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

    ctx.fillStyle = '#111827';
    ctx.font = 'bold 22px system-ui';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(centerValue || formatNumber(total), centerX, centerY - 8);
    ctx.fillStyle = '#9CA3AF';
    ctx.font = '11px system-ui';
    ctx.fillText(centerLabel || 'Total', centerX, centerY + 14);
  }, [data, height, centerLabel, centerValue]);

  return <div className="relative" style={{ height }}><canvas ref={canvasRef} /></div>;
};

const BarChart = ({ data, height = 240 }) => {
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

    const padding = { top: 20, right: 20, bottom: 40, left: 40 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;
    const maxValue = Math.max(...data.map(d => d.value), 1);
    const barWidth = (chartWidth / data.length) * 0.7;
    const gap = (chartWidth / data.length) * 0.3;

    ctx.strokeStyle = 'rgba(156, 163, 175, 0.1)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = padding.top + (chartHeight / 4) * i;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(padding.left + chartWidth, y);
      ctx.stroke();
    }

    data.forEach((item, i) => {
      const x = padding.left + i * (barWidth + gap) + gap / 2;
      const barHeight = (item.value / maxValue) * chartHeight;
      const y = padding.top + chartHeight - barHeight;
      const gradient = ctx.createLinearGradient(0, y, 0, padding.top + chartHeight);
      gradient.addColorStop(0, item.color);
      gradient.addColorStop(1, `${item.color}80`);
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.roundRect(x, y, barWidth, barHeight, [4, 4, 0, 0]);
      ctx.fill();

      ctx.fillStyle = '#9CA3AF';
      ctx.font = '10px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(item.label, x + barWidth / 2, height - 8);
    });
  }, [data, height]);

  return <div className="relative" style={{ height }}><canvas ref={canvasRef} /></div>;
};

const DiversityAnalytics = () => {
  const { currentUser, userProfile } = useAuth();
  const { showNotification } = useNotification();
  const companyId = userProfile?.companyId || currentUser?.companyId || currentUser?.uid;

  const [timeRange, setTimeRange] = useState('90d');
  const { applications, jobs, loading, error } = useDiversityData(companyId, timeRange);
  const [exporting, setExporting] = useState(false);

  // Generate diversity data from applications
  const diversityData = useMemo(() => {
    if (applications.length === 0) {
      return {
        genderData: [],
        ageData: [],
        locationData: [],
        educationData: [],
        diversityScore: null,
        demographicSampleSize: 0,
        totalApplications: 0,
        totalHires: 0,
        hireRate: 0,
      };
    }

    // Calculate gender distribution
    const genderCounts = {};
    const ageCounts = {};
    const locationCounts = {};
    const educationCounts = {};

    applications.forEach(app => {
      const gender = app.candidate?.gender;
      if (gender) genderCounts[gender] = (genderCounts[gender] || 0) + 1;

      const age = app.candidate?.ageBracket;
      if (age) ageCounts[age] = (ageCounts[age] || 0) + 1;

      const location = app.candidate?.location;
      if (location) locationCounts[location] = (locationCounts[location] || 0) + 1;

      const education = app.candidate?.educationLevel;
      if (education) educationCounts[education] = (educationCounts[education] || 0) + 1;
    });

    const genderData = GENDER_OPTIONS.map(g => ({
      label: g.label,
      value: genderCounts[g.value] || 0,
      color: g.color,
    })).filter(d => d.value >= 5);

    const ageData = AGE_BRACKETS.map(a => ({
      label: a.label,
      value: ageCounts[a.value] || 0,
      color: a.color,
    })).filter((entry) => entry.value >= 5);

    const locationData = Object.entries(locationCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([location, count], i) => ({
        label: location,
        value: count,
        color: ['#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#6366F1'][i],
      })).filter((entry) => entry.value >= 5);

    const educationData = [
      { label: 'High School', value: educationCounts['high-school'] || 0, color: '#6B7280' },
      { label: 'Diploma', value: educationCounts['diploma'] || 0, color: '#3B82F6' },
      { label: 'Bachelor', value: educationCounts['bachelor'] || 0, color: '#8B5CF6' },
      { label: 'Master', value: educationCounts['master'] || 0, color: '#EC4899' },
      { label: 'PhD', value: educationCounts['phd'] || 0, color: '#10B981' },
    ].filter(d => d.value >= 5);

    // Calculate diversity score
    const demographicSampleSize = Object.values(genderCounts).reduce((sum, count) => sum + count, 0);
    const total = applications.length;
    const femaleRatio = (genderCounts['female'] || 0) / total;
    const maleRatio = (genderCounts['male'] || 0) / total;
    const genderBalance = 1 - Math.abs(femaleRatio - maleRatio);

    const ageEntropy = Object.values(ageCounts).reduce((sum, count) => {
      const p = count / total;
      return p > 0 ? sum - p * Math.log2(p) : sum;
    }, 0) / Math.log2(AGE_BRACKETS.length);

    const locationEntropy = Object.values(locationCounts).reduce((sum, count) => {
      const p = count / total;
      return p > 0 ? sum - p * Math.log2(p) : sum;
    }, 0) / Math.log2(Object.keys(locationCounts).length || 1);

    const diversityScore = demographicSampleSize >= 5
      ? Math.round((genderBalance * 0.4 + ageEntropy * 0.3 + locationEntropy * 0.3) * 100)
      : null;

    const hires = applications.filter(a => a.status === 'hired').length;
    const hireRate = total > 0 ? (hires / total) * 100 : 0;

    return {
      genderData,
      ageData,
      locationData,
      educationData,
      diversityScore,
      totalApplications: total,
      demographicSampleSize,
      totalHires: hires,
      hireRate,
    };
  }, [applications]);

  const insights = useMemo(() => {
    const list = [];
    if (diversityData.diversityScore != null && diversityData.diversityScore >= 70) {
      list.push({
        type: 'success',
        title: 'Strong Diversity Score',
        description: `Your diversity score of ${diversityData.diversityScore}% indicates a well-balanced candidate pool.`,
      });
    } else if (diversityData.diversityScore != null && diversityData.diversityScore < 50 && diversityData.totalApplications > 5) {
      list.push({
        type: 'warning',
        title: 'Room for Improvement',
        description: `Your diversity score is ${diversityData.diversityScore}%. Consider expanding outreach to underrepresented groups.`,
      });
    }

    if (diversityData.genderData.length > 0) {
      const topGender = diversityData.genderData.reduce((a, b) => a.value > b.value ? a : b);
      const topPercent = (topGender.value / diversityData.totalApplications) * 100;
      if (topPercent > 70) {
        list.push({
          type: 'info',
          title: 'Gender Concentration',
          description: `${topPercent.toFixed(0)}% of applicants are ${topGender.label}. Consider diversifying recruitment channels.`,
        });
      }
    }

    if (list.length === 0) {
      list.push({
        type: 'info',
        title: 'Building Insights',
        description: 'Keep collecting applications to unlock detailed diversity insights.',
      });
    }

    return list;
  }, [diversityData]);

  const handleExport = () => {
    try {
      setExporting(true);
      const exportData = {
        generatedAt: new Date().toISOString(),
        timeRange,
        diversityScore: diversityData.diversityScore,
        totalApplications: diversityData.totalApplications,
        totalHires: diversityData.totalHires,
        hireRate: diversityData.hireRate,
        genderDistribution: diversityData.genderData,
        ageDistribution: diversityData.ageData,
        locationDistribution: diversityData.locationData,
        educationDistribution: diversityData.educationData,
      };

      const csv = [
        'Metric,Value',
        `Diversity Score,${diversityData.diversityScore}%`,
        `Total Applications,${diversityData.totalApplications}`,
        `Total Hires,${diversityData.totalHires}`,
        `Hire Rate,${diversityData.hireRate.toFixed(1)}%`,
      ].join('\n');

      const blob = new Blob([csv], { type: 'text/csv' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `diversity-analytics-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();

      showNotification('success', 'Data exported successfully');
    } catch (error) {
      showNotification('error', 'Failed to export');
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 flex items-center justify-center">
        <FaSpinner className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        {error && <div role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-900 dark:bg-red-950/30 dark:text-red-200">Application analytics could not load: {error}</div>}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6"
        >
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <FaUsers className="w-8 h-8 text-purple-600" />
              Diversity & Inclusion Analytics
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Track and improve diversity in your hiring pipeline
            </p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {TIME_RANGES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
            <button
              onClick={handleExport}
              disabled={exporting}
              className="px-4 py-2.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-medium border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
            >
              {exporting ? <FaSpinner className="w-4 h-4 animate-spin" /> : <FaFileExport className="w-4 h-4" />}
              Export
            </button>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Diversity Score', value: diversityData.diversityScore == null ? 'Insufficient data' : `${diversityData.diversityScore}%`, icon: FaBalanceScale, color: diversityData.diversityScore == null ? 'gray' : diversityData.diversityScore >= 70 ? 'green' : diversityData.diversityScore >= 50 ? 'yellow' : 'red' },
            { label: 'Total Applications', value: diversityData.totalApplications, icon: FaUsers, color: 'blue' },
            { label: 'Total Hires', value: diversityData.totalHires, icon: FaCheckCircle, color: 'green' },
            { label: 'Hire Rate', value: `${diversityData.hireRate.toFixed(1)}%`, icon: FaChartLine, color: 'purple' },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700"
            >
              <div className={`p-2.5 rounded-lg inline-block mb-3 ${
                stat.color === 'blue' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600' :
                stat.color === 'green' ? 'bg-green-50 dark:bg-green-900/20 text-green-600' :
                stat.color === 'yellow' ? 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600' :
                stat.color === 'red' ? 'bg-red-50 dark:bg-red-900/20 text-red-600' :
                'bg-purple-50 dark:bg-purple-900/20 text-purple-600'
              }`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {typeof stat.value === 'number' ? formatNumber(stat.value) : stat.value}
              </p>
              <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {diversityData.totalApplications === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
            <FaUsers className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Not enough data yet
            </h3>
            <p className="text-gray-500">
              Diversity analytics will appear once you start receiving applications.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <FaVenus className="w-5 h-5 text-pink-500" />
                  Gender Distribution
                </h3>
                {diversityData.genderData.length > 0 ? (
                  <>
                    <DonutChart
                      data={diversityData.genderData}
                      height={220}
                      centerLabel="Applicants"
                      centerValue={formatNumber(diversityData.totalApplications)}
                    />
                    <div className="grid grid-cols-2 gap-3 mt-4">
                      {diversityData.genderData.map((item, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                          <span className="text-sm text-gray-600 dark:text-gray-400 truncate flex-1">{item.label}</span>
                          <span className="text-sm font-semibold text-gray-900 dark:text-white">
                            {((item.value / Math.max(diversityData.demographicSampleSize, 1)) * 100).toFixed(0)}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <p className="text-center text-gray-500 py-8">No gender data available</p>
                )}
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <FaChartBar className="w-5 h-5 text-blue-600" />
                  Age Distribution
                </h3>
                <BarChart data={diversityData.ageData} height={220} />
              </div>
            </div>

            {/* Second Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <FaMapMarkerAlt className="w-5 h-5 text-green-600" />
                  Location Distribution
                </h3>
                {diversityData.locationData.length > 0 ? (
                  <BarChart data={diversityData.locationData} height={220} />
                ) : (
                  <p className="text-center text-gray-500 py-8">No location data available</p>
                )}
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <FaGraduationCap className="w-5 h-5 text-purple-600" />
                  Education Distribution
                </h3>
                {diversityData.educationData.length > 0 ? (
                  <DonutChart
                    data={diversityData.educationData}
                    height={220}
                    centerLabel="Total"
                    centerValue={formatNumber(diversityData.educationData.reduce((s, d) => s + d.value, 0))}
                  />
                ) : (
                  <p className="text-center text-gray-500 py-8">No education data available</p>
                )}
              </div>
            </div>

            {/* Insights */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <FaLightbulb className="w-5 h-5 text-yellow-500" />
                AI-Powered Insights
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {insights.map((insight, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={`p-4 rounded-xl border-l-4 ${
                      insight.type === 'success' ? 'bg-green-50 dark:bg-green-900/20 border-green-500' :
                      insight.type === 'warning' ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500' :
                      'bg-blue-50 dark:bg-blue-900/20 border-blue-500'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg flex-shrink-0 ${
                        insight.type === 'success' ? 'bg-green-100 text-green-600' :
                        insight.type === 'warning' ? 'bg-yellow-100 text-yellow-600' :
                        'bg-blue-100 text-blue-600'
                      }`}>
                        {insight.type === 'success' ? <FaCheckCircle className="w-4 h-4" /> :
                         insight.type === 'warning' ? <FaInfoCircle className="w-4 h-4" /> :
                         <FaLightbulb className="w-4 h-4" />}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">
                          {insight.title}
                        </h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {insight.description}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DiversityAnalytics;
