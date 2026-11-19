// src/pages/company/competitor-analysis/CompetitorAnalysis.jsx
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaChartLine, FaChartBar, FaChartPie, FaSearch, FaFilter, FaBuilding, FaIndustry, FaUsers, FaBriefcase, FaMapMarkerAlt, FaStar, FaRegStar, FaCheckCircle, FaTimesCircle, FaEye, FaExternalLinkAlt, FaPlus, FaTimes, FaSpinner, FaSync, FaDownload, FaFileExport, FaEllipsisV, FaTrophy, FaAward, FaMedal, FaCrown, FaGem, FaRocket, FaBolt, FaFire, FaBrain, FaRobot, FaMagic, FaLightbulb, FaPercentage, FaArrowUp, FaArrowDown, FaArrowRight, FaGlobe, FaLinkedin, FaMoneyBillWave, FaCalendarAlt, FaClock, FaRegClock, FaUserTie, FaUserFriends, FaUsersCog, FaHandshake, FaHeart, FaThumbsUp, FaComment, FaRegCommentDots, FaCommentDots, FaInfoCircle, FaExclamationTriangle, FaLink, FaShare, FaShareAlt, FaCopy, FaBookmark, FaRegBookmark, FaHistory, FaChevronLeft, FaChevronRight, FaChevronDown, FaChevronUp, FaCheck, FaEdit, FaTrash, FaPaperPlane } from "react-icons/fa";
import {
  collection, doc, query, where, orderBy, limit, onSnapshot,
  addDoc, updateDoc, deleteDoc, serverTimestamp, getDocs,
} from 'firebase/firestore';

import { useAuth } from '../../../context/AuthContext';
import { useNotification } from '../../../context/NotificationContext';
import { db } from '../../../config/firebase';

const COMPARISON_METRICS = [
  { key: 'activeJobs', label: 'Active Jobs', icon: FaBriefcase, higherBetter: true },
  { key: 'avgSalary', label: 'Avg. Salary (M)', icon: FaMoneyBillWave, higherBetter: true, format: 'currency' },
  { key: 'hiringVelocity', label: 'Hiring Velocity', icon: FaRocket, higherBetter: true },
  { key: 'responseTime', label: 'Response Time (days)', icon: FaClock, higherBetter: false },
  { key: 'candidateRating', label: 'Candidate Rating', icon: FaStar, higherBetter: true, format: 'rating' },
  { key: 'benefitsScore', label: 'Benefits Score', icon: FaTrophy, higherBetter: true },
];

const formatNumber = (num) => {
  if (num === null || num === undefined) return 'N/A';
  return new Intl.NumberFormat('en-US').format(num);
};

const formatCurrency = (amount, currency = 'M') => {
  if (amount === null || amount === undefined) return 'N/A';
  if (amount >= 1000) return `${currency}${(amount / 1000).toFixed(1)}K`;
  return `${currency}${formatNumber(amount)}`;
};

const useCompetitorData = (companyId) => {
  const [data, setData] = useState({
    competitors: [],
    myCompany: null,
    loading: true,
    error: '',
  });

  useEffect(() => {
    if (!companyId) { setData(prev => ({ ...prev, loading: false, error: 'Sign in with a company account to view this analysis.' })); return; }
    const unsubs = [];
    let companyLoaded = false;
    let competitorsLoaded = false;
    let failed = false;
    const finishIfLoaded = () => {
      if (companyLoaded && competitorsLoaded && !failed) setData((prev) => ({ ...prev, loading: false }));
    };

    // My company
    unsubs.push(onSnapshot(
      doc(db, 'companies', companyId),
      (snapshot) => {
        if (snapshot.exists()) {
          setData(prev => ({
            ...prev,
            myCompany: { id: snapshot.id, ...snapshot.data() },
            error: failed ? prev.error : '',
          }));
        } else {
          setData((prev) => ({ ...prev, myCompany: null }));
        }
        companyLoaded = true;
        finishIfLoaded();
      },
      (error) => { failed = true; setData((prev) => ({ ...prev, loading: false, error: `Company profile could not load: ${error.message}` })); }
    ));

    // Tracked competitors
    unsubs.push(onSnapshot(
      query(collection(db, 'competitorTracking'), where('companyId', '==', companyId), orderBy('addedAt', 'desc')),
      async (snapshot) => {
        const tracked = await Promise.all(snapshot.docs.map(async (d) => {
          const data = d.data();
          let competitorData = null;
          try {
            const cDoc = await getDoc(doc(db, 'companies', data.competitorId));
            if (cDoc.exists()) {
              competitorData = { id: cDoc.id, ...cDoc.data() };
            }
          } catch (err) {
            console.error('Error fetching competitor:', err);
          }
          return {
            id: d.id,
            ...data,
            competitor: competitorData,
            addedAt: data.addedAt?.toDate?.() || data.addedAt,
          };
        }));
        setData(prev => ({ ...prev, competitors: tracked.filter(c => c.competitor), error: failed ? prev.error : '' }));
        competitorsLoaded = true;
        finishIfLoaded();
      },
      (error) => { failed = true; setData((prev) => ({ ...prev, loading: false, error: `Tracked competitors could not load: ${error.message}` })); }
    ));

    return () => unsubs.forEach(u => u());
  }, [companyId]);

  return data;
};

const RadarChart = ({ companies, metrics, height = 300 }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !companies || companies.length === 0 || !metrics || metrics.length === 0) return;

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
    const radius = Math.min(centerX, centerY) - 40;
    const numAxes = metrics.length;

    // Draw grid circles
    ctx.strokeStyle = 'rgba(156, 163, 175, 0.2)';
    ctx.lineWidth = 1;
    for (let level = 1; level <= 5; level++) {
      ctx.beginPath();
      for (let i = 0; i < numAxes; i++) {
        const angle = (Math.PI * 2 * i) / numAxes - Math.PI / 2;
        const r = (radius * level) / 5;
        const x = centerX + Math.cos(angle) * r;
        const y = centerY + Math.sin(angle) * r;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.stroke();
    }

    // Draw axes
    for (let i = 0; i < numAxes; i++) {
      const angle = (Math.PI * 2 * i) / numAxes - Math.PI / 2;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(x, y);
      ctx.stroke();
    }

    // Calculate max values for normalization
    const maxValues = {};
    metrics.forEach(metric => {
      maxValues[metric.key] = Math.max(...companies.flatMap(c => [
        c.metrics?.[metric.key] ?? 0,
      ]), 1);
    });

    // Draw each company
    const colors = ['#3B82F6', '#EC4899', '#10B981', '#F59E0B', '#8B5CF6'];
    companies.forEach((company, ci) => {
      const color = colors[ci % colors.length];
      ctx.beginPath();
      metrics.forEach((metric, i) => {
        const angle = (Math.PI * 2 * i) / numAxes - Math.PI / 2;
        const value = (company.metrics?.[metric.key] ?? 0) / maxValues[metric.key];
        const r = radius * value;
        const x = centerX + Math.cos(angle) * r;
        const y = centerY + Math.sin(angle) * r;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.closePath();
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = `${color}20`;
      ctx.fill();

      // Draw points
      metrics.forEach((metric, i) => {
        const angle = (Math.PI * 2 * i) / numAxes - Math.PI / 2;
        const value = (company.metrics?.[metric.key] ?? 0) / maxValues[metric.key];
        const r = radius * value;
        const x = centerX + Math.cos(angle) * r;
        const y = centerY + Math.sin(angle) * r;
        ctx.beginPath();
        ctx.fillStyle = color;
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fill();
      });
    });

    // Draw axis labels
    ctx.fillStyle = '#6B7280';
    ctx.font = '10px system-ui';
    ctx.textAlign = 'center';
    metrics.forEach((metric, i) => {
      const angle = (Math.PI * 2 * i) / numAxes - Math.PI / 2;
      const x = centerX + Math.cos(angle) * (radius + 20);
      const y = centerY + Math.sin(angle) * (radius + 20);
      ctx.fillText(metric.label, x, y);
    });
  }, [companies, metrics, height]);

  return <div className="relative" style={{ height }}><canvas ref={canvasRef} /></div>;
};

const CompetitorAnalysis = () => {
  const { currentUser, userProfile } = useAuth();
  const { showNotification } = useNotification();
  const companyId = currentUser?.uid;
  const { competitors, myCompany, loading, error } = useCompetitorData(companyId);

  const [activeTab, setActiveTab] = useState('overview');
  const [showAddModal, setShowAddModal] = useState(false);
  const [availableCompanies, setAvailableCompanies] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [adding, setAdding] = useState(false);
  const [exporting, setExporting] = useState(false);

  // Load available companies to track
  useEffect(() => {
    if (!showAddModal) return;
    const fetchCompanies = async () => {
      try {
        const snapshot = await getDocs(query(collection(db, 'companies'), limit(100)));
        const trackedIds = new Set(competitors.map(c => c.competitorId));
        const available = snapshot.docs
          .filter(d => d.id !== companyId && !trackedIds.has(d.id))
          .map(d => ({ id: d.id, ...d.data() }));
        setAvailableCompanies(available);
      } catch (error) {
        console.error('Error fetching companies:', error);
      }
    };
    fetchCompanies();
  }, [showAddModal, companyId, competitors]);

  // Build comparison data
  const comparisonData = useMemo(() => {
    if (!myCompany && competitors.length === 0) return [];
    
    const myMetrics = {
      activeJobs: myCompany?.activeJobsCount ?? null,
      avgSalary: myCompany?.avgSalary ?? null,
      hiringVelocity: myCompany?.hiringVelocity ?? null,
      responseTime: myCompany?.avgResponseTime ?? null,
      candidateRating: myCompany?.rating ?? null,
      benefitsScore: myCompany?.benefitsScore ?? null,
    };

    const all = [
      {
        id: companyId,
        name: myCompany?.name || myCompany?.companyName || userProfile?.companyName || 'Your Company',
        logo: myCompany?.logo,
        isMyCompany: true,
        metrics: myMetrics,
      },
      ...competitors.map(c => ({
        id: c.competitorId,
        name: c.competitor?.name || c.competitor?.companyName || 'Competitor',
        logo: c.competitor?.logo,
        isMyCompany: false,
        metrics: {
          activeJobs: c.competitor?.activeJobsCount ?? null,
          avgSalary: c.competitor?.avgSalary ?? null,
          hiringVelocity: c.competitor?.hiringVelocity ?? null,
          responseTime: c.competitor?.avgResponseTime ?? null,
          candidateRating: c.competitor?.rating ?? null,
          benefitsScore: c.competitor?.benefitsScore ?? null,
        },
      })),
    ];

    return all;
  }, [myCompany, competitors, companyId, userProfile]);

  const filteredAvailable = useMemo(() => {
    if (!searchTerm) return availableCompanies;
    const term = searchTerm.toLowerCase();
    return availableCompanies.filter(c =>
      (c.name?.toLowerCase() || c.companyName?.toLowerCase() || '').includes(term) ||
      (c.industry?.toLowerCase() || '').includes(term)
    );
  }, [availableCompanies, searchTerm]);

  const handleAddCompetitor = async (company) => {
    try {
      setAdding(true);
      await addDoc(collection(db, 'competitorTracking'), {
        companyId,
        competitorId: company.id,
        competitorName: company.name || company.companyName,
        addedAt: serverTimestamp(),
        addedBy: companyId,
      });

      showNotification('success', `${company.name || company.companyName} added to tracking`);
      setShowAddModal(false);
      setSearchTerm('');
    } catch (error) {
      showNotification('error', 'Failed to add competitor');
    } finally {
      setAdding(false);
    }
  };

  const handleRemoveCompetitor = async (trackingId) => {
    if (!window.confirm('Stop tracking this competitor?')) return;
    try {
      await deleteDoc(doc(db, 'competitorTracking', trackingId));
      showNotification('success', 'Competitor removed');
    } catch (error) {
      showNotification('error', 'Failed to remove');
    }
  };

  const handleExport = () => {
    try {
      setExporting(true);
      const headers = ['Company', ...COMPARISON_METRICS.map(m => m.label)];
      const rows = comparisonData.map(c => [
        c.name,
        ...COMPARISON_METRICS.map(m => c.metrics[m.key]),
      ]);

      const csv = [
        headers.join(','),
        ...rows.map(r => r.map(v => `"${v}"`).join(',')),
      ].join('\n');

      const blob = new Blob([csv], { type: 'text/csv' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `competitor-analysis-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();

      showNotification('success', 'Report exported');
    } catch (error) {
      showNotification('error', 'Failed to export');
    } finally {
      setExporting(false);
    }
  };

  if (loading && !error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 flex items-center justify-center">
        <FaSpinner className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        {error && <div role="alert" className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/30 dark:text-red-200"><span>{error}</span><button type="button" onClick={() => window.location.reload()} className="rounded-lg border border-red-300 px-3 py-2 font-medium hover:bg-red-100 dark:border-red-800 dark:hover:bg-red-900/40">Retry</button></div>}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6"
        >
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <FaChartLine className="w-8 h-8 text-blue-600" />
              Competitor Intelligence
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Monitor and compare your hiring against competitors
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleExport}
              disabled={exporting || comparisonData.length === 0}
              className="px-4 py-2.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-medium border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {exporting ? <FaSpinner className="w-4 h-4 animate-spin" /> : <FaFileExport className="w-4 h-4" />}
              Export
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <FaPlus className="w-4 h-4" />
              Track Competitor
            </button>
          </div>
        </motion.div>

        {comparisonData.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
            <FaChartLine className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No competitors tracked
            </h3>
            <p className="text-gray-500 mb-6">
              Add competitors to see how your hiring compares.
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
            >
              <FaPlus className="w-4 h-4" />
              Add First Competitor
            </button>
          </div>
        ) : (
          <>
            {/* Radar Chart */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <FaChartPie className="w-5 h-5 text-blue-600" />
                  Performance Comparison
                </h3>
              </div>
              <RadarChart companies={comparisonData} metrics={COMPARISON_METRICS} height={350} />
              <div className="flex flex-wrap justify-center gap-4 mt-4">
                {comparisonData.map((c, i) => (
                  <div key={c.id} className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: ['#3B82F6', '#EC4899', '#10B981', '#F59E0B', '#8B5CF6'][i % 5] }} />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {c.name} {c.isMyCompany && '(You)'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Comparison Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
              <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <FaChartBar className="w-5 h-5 text-purple-600" />
                  Detailed Comparison
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Company</th>
                      {COMPARISON_METRICS.map(metric => (
                        <th key={metric.key} className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                          <metric.icon className="w-3 h-3 inline mr-1" />
                          {metric.label}
                        </th>
                      ))}
                      <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {comparisonData.map((company) => (
                      <tr key={company.id} className={company.isMyCompany ? 'bg-blue-50 dark:bg-blue-900/20' : ''}>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {company.logo ? (
                              <img src={company.logo} alt={company.name} className="w-8 h-8 rounded-lg object-cover" />
                            ) : (
                              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                                {company.name.charAt(0)}
                              </div>
                            )}
                            <div>
                              <span className="font-medium text-gray-900 dark:text-white">
                                {company.name}
                              </span>
                              {company.isMyCompany && (
                                <span className="ml-2 px-2 py-0.5 bg-blue-600 text-white rounded text-xs">You</span>
                              )}
                            </div>
                          </div>
                        </td>
                        {COMPARISON_METRICS.map(metric => {
                          const value = company.metrics[metric.key] || 0;
                          const allValues = comparisonData.map(c => c.metrics[metric.key] || 0);
                          const maxVal = Math.max(...allValues);
                          const isBest = metric.higherBetter ? value === maxVal : value === Math.min(...allValues.filter(v => v > 0));
                          return (
                            <td key={metric.key} className="px-6 py-4 text-right">
                              <span className={`font-semibold ${isBest ? 'text-green-600 dark:text-green-400' : 'text-gray-700 dark:text-gray-300'}`}>
                                {metric.format === 'currency' ? formatCurrency(value) :
                                 metric.format === 'rating' ? value.toFixed(1) :
                                 value}
                              </span>
                            </td>
                          );
                        })}
                        <td className="px-6 py-4 text-right">
                          {!company.isMyCompany && (
                            <button
                              onClick={() => {
                                const tracking = competitors.find(c => c.competitorId === company.id);
                                if (tracking) handleRemoveCompetitor(tracking.id);
                              }}
                              className="p-1.5 text-gray-400 hover:text-red-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            >
                              <FaTrash className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Add Competitor Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Track New Competitor
              </h3>
              <div className="relative mb-4">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search companies..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex-1 overflow-y-auto space-y-2 mb-4">
                {filteredAvailable.length > 0 ? filteredAvailable.slice(0, 20).map(company => (
                  <button
                    key={company.id}
                    onClick={() => handleAddCompetitor(company)}
                    disabled={adding}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left disabled:opacity-50"
                  >
                    {company.logo ? (
                      <img src={company.logo} alt="" className="w-10 h-10 rounded-lg object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
                        {(company.name || company.companyName || 'C').charAt(0)}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white truncate">
                        {company.name || company.companyName}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{company.industry || 'Company'}</p>
                    </div>
                    <FaPlus className="w-4 h-4 text-blue-600" />
                  </button>
                )) : (
                  <p className="text-center text-gray-500 py-8">No companies available</p>
                )}
              </div>

              <button
                onClick={() => setShowAddModal(false)}
                className="w-full px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CompetitorAnalysis;
