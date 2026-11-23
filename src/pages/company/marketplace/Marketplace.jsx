// src/pages/company/marketplace/Marketplace.jsx
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaStore, FaSearch, FaFilter, FaShoppingCart, FaStar, FaRegStar, FaCheckCircle, FaPlus, FaTimes, FaSpinner, FaExternalLinkAlt, FaUserTie, FaUserGraduate, FaBriefcase, FaBuilding, FaHandshake, FaHandsHelping, FaLightbulb, FaBrain, FaRobot, FaMagic, FaChartLine, FaChartBar, FaFileAlt, FaFileContract, FaShieldAlt, FaUsers, FaUserFriends, FaUsersCog, FaHandHoldingUsd, FaMoneyBillWave, FaRocket, FaBolt, FaFire, FaStar as FaStarSolid, FaCrown, FaGem, FaTrophy, FaAward, FaMedal, FaPercentage, FaEye, FaArrowRight, FaArrowLeft, FaChevronLeft, FaChevronRight, FaChevronDown, FaChevronUp, FaEllipsisV, FaInfoCircle, FaExclamationTriangle, FaPaperPlane, FaCommentDots, FaRegCommentDots, FaHeart, FaRegHeart, FaBookmark, FaRegBookmark, FaShare, FaShareAlt, FaCopy, FaLink, FaDownload, FaLayerGroup, FaSitemap, FaProjectDiagram, FaTasks, FaClipboardCheck, FaCertificate, FaScroll, FaUniversity, FaGraduationCap, FaLanguage, FaVideo, FaMicrophone, FaCamera, FaPaintBrush, FaPalette, FaCode, FaLaptopCode, FaDatabase, FaCloud, FaServer, FaMobile, FaDesktop, FaBullhorn, FaBullseye, FaCrosshairs, FaFlag, FaTrophy as FaTrophySolid, FaChartPie, FaChartArea, FaPercentage as FaPercentageSolid } from "react-icons/fa";
import {
  collection, doc, query, where, orderBy, limit, onSnapshot,
  addDoc, updateDoc, deleteDoc, serverTimestamp, getDocs,
} from 'firebase/firestore';

import { useAuth } from '../../../context/AuthContext';
import { useNotification } from '../../../context/NotificationContext';
import { db } from '../../../config/firebase';
import { supabase } from '../../../config/supabase';

const CATEGORIES = [
  { value: 'all', label: 'All Services', icon: FaStore },
  { value: 'recruitment', label: 'Recruitment', icon: FaUserTie },
  { value: 'assessment', label: 'Assessments', icon: FaClipboardCheck },
  { value: 'training', label: 'Training', icon: FaGraduationCap },
  { value: 'compliance', label: 'Compliance', icon: FaShieldAlt },
  { value: 'payroll', label: 'Payroll', icon: FaMoneyBillWave },
  { value: 'background-check', label: 'Background Checks', icon: FaFileAlt },
  { value: 'consulting', label: 'Consulting', icon: FaLightbulb },
  { value: 'tech', label: 'HR Tech', icon: FaLaptopCode },
];

const PRICE_RANGES = [
  { value: 'all', label: 'Any Price' },
  { value: 'free', label: 'Free' },
  { value: 'under-500', label: 'Under M500' },
  { value: '500-2000', label: 'M500 - M2,000' },
  { value: '2000+', label: 'M2,000+' },
  { value: 'custom', label: 'Custom Pricing' },
];

const SORT_OPTIONS = [
  { value: 'popular', label: 'Most Popular' },
  { value: 'recent', label: 'Newest' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
];

const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return 'Contact';
  if (amount === 0) return 'Free';
  return `M${new Intl.NumberFormat('en-US').format(amount)}`;
};

const formatNumber = (num) => {
  if (num === null || num === undefined) return '0';
  return new Intl.NumberFormat('en-US').format(num);
};

// Default marketplace services catalog
const DEFAULT_SERVICES = [
  {
    id: 'svc-assessment-suite',
    name: 'Complete Skills Assessment Suite',
    category: 'assessment',
    description: 'Comprehensive technical and soft-skill assessments for candidates.',
    price: 1500,
    priceType: 'per-candidate',
    rating: 4.8,
    reviewCount: 156,
    provider: 'SkillVerify Pro',
    features: ['500+ assessment templates', 'Custom test builder', 'Detailed analytics', 'Anti-cheat protection'],
    popular: true,
    icon: 'assessment',
  },
  {
    id: 'svc-bg-check',
    name: 'Background Check Services',
    category: 'background-check',
    description: 'Fast, compliant background verification for all employees.',
    price: 350,
    priceType: 'per-check',
    rating: 4.9,
    reviewCount: 892,
    provider: 'SecureCheck Africa',
    features: ['Criminal records', 'Employment verification', 'Education verification', '24-hour turnaround'],
    popular: true,
    icon: 'compliance',
  },
  {
    id: 'svc-payroll',
    name: 'Payroll Processing',
    category: 'payroll',
    description: 'Automated payroll with tax compliance for Lesotho employers.',
    price: 250,
    priceType: 'per-month',
    rating: 4.7,
    reviewCount: 234,
    provider: 'PayEasy Lesotho',
    features: ['Tax calculations', 'Direct deposits', 'Payslip generation', 'Compliance reporting'],
    icon: 'payroll',
  },
  {
    id: 'svc-compliance',
    name: 'HR Compliance Audit',
    category: 'compliance',
    description: 'Complete HR policy review and compliance audit.',
    price: 5000,
    priceType: 'one-time',
    rating: 4.9,
    reviewCount: 87,
    provider: 'LexPolaris Legal',
    features: ['Policy review', 'Compliance report', 'Remediation plan', '3-month follow-up'],
    icon: 'compliance',
  },
  {
    id: 'svc-training-leadership',
    name: 'Leadership Training Program',
    category: 'training',
    description: '12-week leadership development for emerging managers.',
    price: 2500,
    priceType: 'per-participant',
    rating: 4.8,
    reviewCount: 145,
    provider: 'Elevate Learning',
    features: ['12 interactive modules', '1-on-1 coaching', 'Group workshops', 'Certificate'],
    icon: 'training',
  },
  {
    id: 'svc-ats',
    name: 'Enterprise ATS Integration',
    category: 'tech',
    description: 'Custom ATS integration with your existing HR systems.',
    price: 0,
    priceType: 'custom',
    rating: 4.6,
    reviewCount: 42,
    provider: 'TechBridge Solutions',
    features: ['API integration', 'Data migration', 'Custom workflows', 'Dedicated support'],
    icon: 'tech',
  },
];

const useMarketplace = () => {
  const [services, setServices] = useState(DEFAULT_SERVICES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load from Firebase if exists, else use defaults
    const unsub = onSnapshot(
      query(collection(db, 'marketplaceServices'), orderBy('popular', 'desc'), limit(100)),
      (snapshot) => {
        if (snapshot.docs.length > 0) {
          const remote = snapshot.docs.map(d => ({
            id: d.id, ...d.data(),
            createdAt: d.data().createdAt?.toDate?.() || d.data().createdAt,
          }));
          setServices(remote);
        }
        setLoading(false);
      },
      (err) => {
        console.error('Marketplace error:', err);
        setLoading(false);
      }
    );
    return () => unsub();
  }, []);

  return { services, loading };
};

const ServiceCard = ({ service, onView, isSaved, onToggleSave }) => {
  const categoryConfig = CATEGORIES.find(c => c.value === service.category) || CATEGORIES[0];
  const CategoryIcon = categoryConfig.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all flex flex-col"
    >
      {service.popular && (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded-full text-xs font-medium mb-3 self-start">
          <FaFire className="w-3 h-3" />
          Popular
        </span>
      )}

      <div className="flex items-start gap-3 mb-4">
        <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex-shrink-0">
          <CategoryIcon className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-1 line-clamp-2">
            {service.name}
          </h4>
          <p className="text-xs text-gray-500">{service.provider}</p>
        </div>
        <button
          onClick={() => onToggleSave(service.id)}
          className={`p-1.5 rounded-lg transition-colors ${
            isSaved
              ? 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
              : 'text-gray-400 hover:text-yellow-500 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          {isSaved ? <FaBookmark className="w-3.5 h-3.5" /> : <FaRegBookmark className="w-3.5 h-3.5" />}
        </button>
      </div>

      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 mb-4 flex-1">
        {service.description}
      </p>

      <div className="flex items-center gap-1 mb-4">
        {[...Array(5)].map((_, i) => (
          <FaStar key={i} className={`w-3.5 h-3.5 ${i < Math.floor(service.rating) ? 'text-yellow-500' : 'text-gray-300'}`} />
        ))}
        <span className="text-xs text-gray-500 ml-1">
          {service.rating.toFixed(1)} ({formatNumber(service.reviewCount)})
        </span>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
        <div>
          <p className="text-xl font-bold text-gray-900 dark:text-white">
            {formatCurrency(service.price)}
          </p>
          <p className="text-xs text-gray-500">{service.priceType}</p>
        </div>
        <button
          onClick={() => onView(service)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-1"
        >
          View
          <FaArrowRight className="w-3 h-3" />
        </button>
      </div>
    </motion.div>
  );
};

const ServiceDetailModal = ({ service, show, onClose, onContact, onToggleSave, isSaved }) => {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  if (!service) return null;

  const categoryConfig = CATEGORIES.find(c => c.value === service.category) || CATEGORIES[0];
  const CategoryIcon = categoryConfig.icon;

  const handleContact = async () => {
    setSending(true);
    try {
      await onContact(service, message);
      setMessage('');
    } finally {
      setSending(false);
    }
  };

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
            className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-2xl my-8"
          >
            <div className="flex items-start justify-between p-6 border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-start gap-4">
                <div className="p-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
                  <CategoryIcon className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {service.name}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">by {service.provider}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <FaStar key={i} className={`w-3.5 h-3.5 ${i < Math.floor(service.rating) ? 'text-yellow-500' : 'text-gray-300'}`} />
                      ))}
                    </div>
                    <span className="text-sm text-gray-500">
                      {service.rating.toFixed(1)} • {formatNumber(service.reviewCount)} reviews
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 max-h-[60vh] overflow-y-auto">
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Description</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {service.description}
                </p>
              </div>

              {service.features && service.features.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Features</h4>
                  <div className="space-y-2">
                    {service.features.map((feature, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <FaCheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <p className="text-xs text-gray-500 mb-1">Price</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency(service.price)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{service.priceType}</p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <p className="text-xs text-gray-500 mb-1">Category</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white capitalize">
                    {service.category.replace('-', ' ')}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Request Information
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                  placeholder="Ask about pricing, availability, or special requirements..."
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 p-6 border-t border-gray-100 dark:border-gray-700">
              <button
                onClick={() => onToggleSave(service.id)}
                className={`px-4 py-2.5 rounded-xl font-medium transition-colors flex items-center gap-2 ${
                  isSaved
                    ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
                }`}
              >
                {isSaved ? <FaBookmark className="w-4 h-4" /> : <FaRegBookmark className="w-4 h-4" />}
                {isSaved ? 'Saved' : 'Save'}
              </button>
              <button
                onClick={handleContact}
                disabled={sending}
                className="flex-1 px-6 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {sending ? (
                  <>
                    <FaSpinner className="w-4 h-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <FaPaperPlane className="w-4 h-4" />
                    Contact Provider
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const Marketplace = () => {
  const { currentUser, userProfile } = useAuth();
  const { showNotification } = useNotification();
  const companyId = userProfile?.companyId || currentUser?.companyId || currentUser?.uid;
  const { services, loading } = useMarketplace();

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [priceFilter, setPriceFilter] = useState('all');
  const [sortBy, setSortBy] = useState('popular');
  const [selectedService, setSelectedService] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [savedServices, setSavedServices] = useState(new Set());

  // Load saved services
  useEffect(() => {
    if (!companyId) return;
    const unsub = onSnapshot(
      query(collection(db, 'savedMarketplaceServices'), where('companyId', '==', companyId)),
      (snap) => {
        setSavedServices(new Set(snap.docs.map(d => d.data().serviceId)));
      }
    );
    return () => unsub();
  }, [companyId]);

  const filteredServices = useMemo(() => {
    let filtered = [...services];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(s =>
        (s.name?.toLowerCase() || '').includes(term) ||
        (s.description?.toLowerCase() || '').includes(term) ||
        (s.provider?.toLowerCase() || '').includes(term) ||
        (s.features?.some(f => f.toLowerCase().includes(term)) || false)
      );
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(s => s.category === categoryFilter);
    }

    if (priceFilter !== 'all') {
      filtered = filtered.filter(s => {
        if (priceFilter === 'free') return s.price === 0;
        if (priceFilter === 'under-500') return s.price > 0 && s.price < 500;
        if (priceFilter === '500-2000') return s.price >= 500 && s.price <= 2000;
        if (priceFilter === '2000+') return s.price > 2000;
        if (priceFilter === 'custom') return s.priceType === 'custom';
        return true;
      });
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'popular':
          return (b.reviewCount || 0) - (a.reviewCount || 0);
        case 'recent':
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'price-low':
          return (a.price || 0) - (b.price || 0);
        case 'price-high':
          return (b.price || 0) - (a.price || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [services, searchTerm, categoryFilter, priceFilter, sortBy]);

  const handleToggleSave = async (serviceId) => {
    if (!companyId) return;
    try {
      const existing = await getDocs(
        query(
          collection(db, 'savedMarketplaceServices'),
          where('companyId', '==', companyId),
          where('serviceId', '==', serviceId)
        )
      );

      if (!existing.empty) {
        await deleteDoc(doc(db, 'savedMarketplaceServices', existing.docs[0].id));
        showNotification('success', 'Removed from saved');
      } else {
        await addDoc(collection(db, 'savedMarketplaceServices'), {
          companyId,
          serviceId,
          savedAt: serverTimestamp(),
        });
        showNotification('success', 'Added to saved');
      }
    } catch (error) {
      showNotification('error', 'Failed to update');
    }
  };

  const handleContactProvider = async (service, message) => {
    if (!companyId) return;
    try {
      await addDoc(collection(db, 'marketplaceInquiries'), {
        companyId,
        companyName: userProfile?.companyName || 'Company',
        serviceId: service.id,
        serviceName: service.name,
        provider: service.provider,
        message,
        status: 'pending',
        createdAt: serverTimestamp(),
      });

      await supabase.from('company_activities').insert({
        company_id: companyId,
        activity_type: 'marketplace_inquiry',
        metadata: { service_id: service.id, service_name: service.name },
        created_at: new Date().toISOString(),
      });

      showNotification('success', 'Inquiry sent to provider');
      setShowDetailModal(false);
    } catch (error) {
      showNotification('error', 'Failed to send inquiry');
      throw error;
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
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <FaStore className="w-8 h-8 text-blue-600" />
            Hiring Marketplace
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Discover hiring tools and services from trusted providers
          </p>
        </motion.div>

        {/* Featured Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 mb-6 text-white"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-xl">
              <FaRocket className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold mb-1">Unlock Premium Features</h3>
              <p className="text-sm text-white/80">
                Get exclusive access to advanced hiring tools and priority support.
              </p>
            </div>
            <button className="px-4 py-2 bg-white text-blue-600 rounded-lg font-medium hover:bg-white/90 transition-colors">
              Learn More
            </button>
          </div>
        </motion.div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 mb-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-4">
            <div className="relative flex-1 w-full">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search services..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-auto"
            >
              {SORT_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </div>

          {/* Category Pills */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {CATEGORIES.map(cat => {
              const CatIcon = cat.icon;
              const isActive = categoryFilter === cat.value;
              return (
                <button
                  key={cat.value}
                  onClick={() => setCategoryFilter(cat.value)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                  }`}
                >
                  <CatIcon className="w-3.5 h-3.5" />
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* Price Range */}
          <div className="mt-3 flex flex-wrap gap-2">
            {PRICE_RANGES.map(range => (
              <button
                key={range.value}
                onClick={() => setPriceFilter(range.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  priceFilter === range.value
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {filteredServices.length} service{filteredServices.length !== 1 ? 's' : ''} found
          </p>
        </div>

        {filteredServices.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredServices.map(service => (
              <ServiceCard
                key={service.id}
                service={service}
                onView={(s) => { setSelectedService(s); setShowDetailModal(true); }}
                isSaved={savedServices.has(service.id)}
                onToggleSave={handleToggleSave}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
            <FaStore className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No services found
            </h3>
            <p className="text-gray-500">
              Try adjusting your filters to find more services.
            </p>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <ServiceDetailModal
        service={selectedService}
        show={showDetailModal}
        onClose={() => { setShowDetailModal(false); setSelectedService(null); }}
        onContact={handleContactProvider}
        onToggleSave={handleToggleSave}
        isSaved={selectedService ? savedServices.has(selectedService.id) : false}
      />
    </div>
  );
};

export default Marketplace;
