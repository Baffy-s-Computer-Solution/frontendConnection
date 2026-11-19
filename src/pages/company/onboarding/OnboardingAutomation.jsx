// src/pages/company/onboarding/OnboardingAutomation.jsx
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUserCheck, FaUserPlus, FaClipboardCheck, FaClipboardList, FaTasks, FaPlus, FaSearch, FaFilter, FaEllipsisV, FaCheck, FaTimes, FaSpinner, FaSync, FaEdit, FaTrash, FaEnvelope, FaPaperPlane, FaClock, FaCheckCircle, FaTimesCircle, FaCalendarAlt, FaPlay, FaPause, FaStop, FaArrowRight, FaArrowLeft, FaChevronRight, FaChevronDown, FaChevronUp, FaInfoCircle, FaExclamationTriangle, FaFileAlt, FaFolder, FaUsers, FaUserTie, FaBuilding, FaLaptop, FaIdCard, FaGraduationCap, FaShieldAlt, FaFileSignature, FaFileContract, FaBriefcase, FaRocket, FaBolt, FaFire, FaStar, FaTrophy, FaAward, FaMedal, FaCrown, FaGem, FaHeart, FaHandsHelping, FaHandshake, FaLightbulb, FaBrain, FaMagic, FaChartLine, FaChartBar, FaPercentage, FaUserFriends, FaUsersCog, FaRegClock, FaRegCalendar, FaRegCommentDots, FaEllipsisH, FaDotCircle, FaRegDotCircle, FaCircle, FaRegCircle, FaCheckSquare, FaRegCheckSquare, FaSquare, FaRegSquare, FaStream, FaLayerGroup, FaSitemap, FaProjectDiagram, FaTasks as FaTasksSolid } from "react-icons/fa";
import {
  collection, doc, query, where, orderBy, onSnapshot, addDoc,
  updateDoc, deleteDoc, serverTimestamp, writeBatch, getDocs,
} from 'firebase/firestore';

import { useAuth } from '../../../context/AuthContext';
import { useNotification } from '../../../context/NotificationContext';
import { db } from '../../../config/firebase';
import { supabase } from '../../../config/supabase';

const DEFAULT_ONBOARDING_STEPS = [
  { id: 1, title: 'Welcome Email Sent', description: 'Automated welcome message', category: 'communication', required: true },
  { id: 2, title: 'Sign Employment Contract', description: 'Digital contract signature', category: 'documentation', required: true },
  { id: 3, title: 'Submit ID Documents', description: 'Upload required identification', category: 'documentation', required: true },
  { id: 4, title: 'IT Setup Request', description: 'Laptop, email, and accounts setup', category: 'it', required: true },
  { id: 5, title: 'Office Access Card', description: 'Physical access card issuance', category: 'facilities', required: false },
  { id: 6, title: 'Team Introduction', description: 'Introduction to team members', category: 'social', required: true },
  { id: 7, title: 'Complete Training Modules', description: 'Mandatory training programs', category: 'training', required: true },
  { id: 8, title: 'Schedule First Week Check-in', description: '30-minute manager check-in', category: 'management', required: true },
  { id: 9, title: 'Benefits Enrollment', description: 'Health, retirement, other benefits', category: 'hr', required: true },
  { id: 10, title: '30-Day Feedback Session', description: 'Structured feedback collection', category: 'management', required: true },
];

const CATEGORY_COLORS = {
  communication: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-300', icon: FaEnvelope },
  documentation: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-300', icon: FaFileAlt },
  it: { bg: 'bg-indigo-100 dark:bg-indigo-900/30', text: 'text-indigo-700 dark:text-indigo-300', icon: FaLaptop },
  facilities: { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-300', icon: FaBuilding },
  social: { bg: 'bg-pink-100 dark:bg-pink-900/30', text: 'text-pink-700 dark:text-pink-300', icon: FaUsers },
  training: { bg: 'bg-teal-100 dark:bg-teal-900/30', text: 'text-teal-700 dark:text-teal-300', icon: FaGraduationCap },
  management: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-300', icon: FaUserTie },
  hr: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-300', icon: FaHeart },
};

const formatTimeAgo = (date) => {
  if (!date) return 'Just now';
  const now = new Date();
  const past = date instanceof Date ? date : date?.toDate?.() || new Date(date);
  if (isNaN(past.getTime())) return 'Just now';
  const diffMins = Math.floor((now - past) / 60000);
  const diffHours = Math.floor((now - past) / 3600000);
  const diffDays = Math.floor((now - past) / 86400000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
};

const useOnboardingData = (companyId) => {
  const [data, setData] = useState({ onboardings: [], loading: true });

  useEffect(() => {
    if (!companyId) { setData({ onboardings: [], loading: false }); return; }
    const unsub = onSnapshot(
      query(collection(db, 'employeeOnboardings'), where('companyId', '==', companyId), orderBy('createdAt', 'desc')),
      (snap) => {
        const onboardings = snap.docs.map(d => ({
          id: d.id, ...d.data(),
          createdAt: d.data().createdAt?.toDate?.() || d.data().createdAt,
          completedAt: d.data().completedAt?.toDate?.() || d.data().completedAt,
        }));
        setData({ onboardings, loading: false });
      }
    );
    return () => unsub();
  }, [companyId]);

  return data;
};

const OnboardingProgress = ({ steps = [], completedSteps = [] }) => {
  const total = steps.length;
  const completed = completedSteps.length;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-gray-500">{completed} of {total} steps</span>
        <span className="text-xs font-semibold text-blue-600">{percentage}%</span>
      </div>
      <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

const OnboardingCard = ({ onboarding, onToggleStep, onView }) => {
  const completedSteps = onboarding.completedSteps || [];
  const steps = onboarding.steps || DEFAULT_ONBOARDING_STEPS;
  const percentage = steps.length > 0 ? (completedSteps.length / steps.length) * 100 : 0;
  const isComplete = percentage === 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3">
          {onboarding.employeePhoto ? (
            <img src={onboarding.employeePhoto} alt={onboarding.employeeName} className="w-12 h-12 rounded-full object-cover" />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
              {onboarding.employeeName?.charAt(0) || 'E'}
            </div>
          )}
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white">
              {onboarding.employeeName || 'New Employee'}
            </h4>
            <p className="text-sm text-gray-500">
              {onboarding.jobTitle || 'Position'}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              Started {formatTimeAgo(onboarding.createdAt)}
            </p>
          </div>
        </div>
        {isComplete && (
          <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
            <FaCheckCircle className="w-4 h-4 text-green-600" />
          </div>
        )}
      </div>

      <OnboardingProgress steps={steps} completedSteps={completedSteps} />

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
        <button
          onClick={() => onView(onboarding)}
          className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1"
        >
          <FaClipboardCheck className="w-3.5 h-3.5" />
          View Steps
        </button>
      </div>
    </motion.div>
  );
};

const OnboardingAutomation = () => {
  const { currentUser, userProfile } = useAuth();
  const { showNotification } = useNotification();
  const companyId = currentUser?.uid;
  const { onboardings, loading } = useOnboardingData(companyId);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showStepsModal, setShowStepsModal] = useState(false);
  const [selectedOnboarding, setSelectedOnboarding] = useState(null);
  const [saving, setSaving] = useState(false);
  const [newEmployee, setNewEmployee] = useState({
    employeeName: '',
    employeeEmail: '',
    jobTitle: '',
    department: '',
    startDate: '',
  });

  const stats = useMemo(() => {
    const total = onboardings.length;
    const completed = onboardings.filter(o => {
      const p = (o.completedSteps?.length || 0) / (o.steps?.length || 10) * 100;
      return p === 100;
    }).length;
    const inProgress = total - completed;
    const avgProgress = total > 0
      ? Math.round(onboardings.reduce((sum, o) => sum + ((o.completedSteps?.length || 0) / (o.steps?.length || 10) * 100), 0) / total)
      : 0;
    return { total, completed, inProgress, avgProgress };
  }, [onboardings]);

  const filteredOnboardings = useMemo(() => {
    let filtered = [...onboardings];
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(o =>
        (o.employeeName?.toLowerCase() || '').includes(term) ||
        (o.employeeEmail?.toLowerCase() || '').includes(term) ||
        (o.jobTitle?.toLowerCase() || '').includes(term)
      );
    }
    if (filterStatus === 'completed') {
      filtered = filtered.filter(o => (o.completedSteps?.length || 0) === (o.steps?.length || 10));
    } else if (filterStatus === 'in-progress') {
      filtered = filtered.filter(o => (o.completedSteps?.length || 0) < (o.steps?.length || 10));
    }
    return filtered;
  }, [onboardings, searchTerm, filterStatus]);

  const handleCreateOnboarding = async () => {
    if (!newEmployee.employeeName.trim() || !newEmployee.employeeEmail.trim()) {
      return showNotification('error', 'Name and email are required');
    }
    try {
      setSaving(true);
      const docRef = await addDoc(collection(db, 'employeeOnboardings'), {
        ...newEmployee,
        companyId,
        steps: DEFAULT_ONBOARDING_STEPS,
        completedSteps: [],
        createdBy: companyId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      await supabase.from('company_activities').insert({
        company_id: companyId,
        activity_type: 'onboarding_started',
        metadata: { employee_name: newEmployee.employeeName },
        created_at: new Date().toISOString(),
      });

      showNotification('success', 'Onboarding created');
      setShowCreateModal(false);
      setNewEmployee({ employeeName: '', employeeEmail: '', jobTitle: '', department: '', startDate: '' });
    } catch (error) {
      showNotification('error', 'Failed to create onboarding');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStep = async (onboardingId, stepId) => {
    try {
      const onboarding = onboardings.find(o => o.id === onboardingId);
      if (!onboarding) return;
      const completedSteps = onboarding.completedSteps || [];
      const isCompleted = completedSteps.includes(stepId);
      const newCompleted = isCompleted
        ? completedSteps.filter(s => s !== stepId)
        : [...completedSteps, stepId];

      await updateDoc(doc(db, 'employeeOnboardings', onboardingId), {
        completedSteps: newCompleted,
        updatedAt: serverTimestamp(),
        ...(newCompleted.length === (onboarding.steps?.length || 10) ? { completedAt: serverTimestamp() } : {}),
      });

      if (selectedOnboarding?.id === onboardingId) {
        setSelectedOnboarding(prev => ({ ...prev, completedSteps: newCompleted }));
      }
    } catch (error) {
      showNotification('error', 'Failed to update step');
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
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6"
        >
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <FaUserCheck className="w-8 h-8 text-blue-600" />
              Onboarding Automation
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Automate new employee onboarding workflows
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <FaUserPlus className="w-4 h-4" />
            Start Onboarding
          </button>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Onboardings', value: stats.total, icon: FaUsers, color: 'blue' },
            { label: 'In Progress', value: stats.inProgress, icon: FaClock, color: 'yellow' },
            { label: 'Completed', value: stats.completed, icon: FaCheckCircle, color: 'green' },
            { label: 'Avg Progress', value: `${stats.avgProgress}%`, icon: FaChartLine, color: 'purple' },
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
                stat.color === 'yellow' ? 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600' :
                stat.color === 'green' ? 'bg-green-50 dark:bg-green-900/20 text-green-600' :
                'bg-purple-50 dark:bg-purple-900/20 text-purple-600'
              }`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
              <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 mb-6">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search onboardings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        {filteredOnboardings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredOnboardings.map(onboarding => (
              <OnboardingCard
                key={onboarding.id}
                onboarding={onboarding}
                onToggleStep={handleToggleStep}
                onView={(o) => { setSelectedOnboarding(o); setShowStepsModal(true); }}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
            <FaUserCheck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No onboardings yet
            </h3>
            <p className="text-gray-500 mb-6">Start onboarding a new employee to see them here.</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
            >
              <FaUserPlus className="w-4 h-4" />
              Start First Onboarding
            </button>
          </div>
        )}
      </div>

      {/* Create Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Start New Onboarding
              </h3>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Employee full name *"
                  value={newEmployee.employeeName}
                  onChange={(e) => setNewEmployee({ ...newEmployee, employeeName: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="email"
                  placeholder="Employee email *"
                  value={newEmployee.employeeEmail}
                  onChange={(e) => setNewEmployee({ ...newEmployee, employeeEmail: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Job title"
                    value={newEmployee.jobTitle}
                    onChange={(e) => setNewEmployee({ ...newEmployee, jobTitle: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="Department"
                    value={newEmployee.department}
                    onChange={(e) => setNewEmployee({ ...newEmployee, department: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <input
                  type="date"
                  value={newEmployee.startDate}
                  onChange={(e) => setNewEmployee({ ...newEmployee, startDate: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                  <p className="text-sm text-blue-700 dark:text-blue-300 font-medium mb-2">
                    {DEFAULT_ONBOARDING_STEPS.length} Default Steps Will Be Created:
                  </p>
                  <ul className="space-y-1 text-xs text-blue-600 dark:text-blue-400">
                    {DEFAULT_ONBOARDING_STEPS.slice(0, 5).map(step => (
                      <li key={step.id} className="flex items-center gap-1">
                        <FaCheckCircle className="w-2.5 h-2.5" />
                        {step.title}
                      </li>
                    ))}
                    <li className="text-blue-500">+ {DEFAULT_ONBOARDING_STEPS.length - 5} more...</li>
                  </ul>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateOnboarding}
                  disabled={saving}
                  className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving ? <FaSpinner className="w-4 h-4 animate-spin" /> : <FaRocket className="w-4 h-4" />}
                  Start Onboarding
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Steps Modal */}
      <AnimatePresence>
        {showStepsModal && selectedOnboarding && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowStepsModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-2xl max-h-[85vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {selectedOnboarding.employeeName}'s Onboarding
                  </h3>
                  <p className="text-sm text-gray-500">
                    {selectedOnboarding.jobTitle || 'Position'}
                  </p>
                </div>
                <button
                  onClick={() => setShowStepsModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <FaTimes className="w-5 h-5" />
                </button>
              </div>

              <OnboardingProgress
                steps={selectedOnboarding.steps || DEFAULT_ONBOARDING_STEPS}
                completedSteps={selectedOnboarding.completedSteps || []}
              />

              <div className="mt-6 space-y-2">
                {(selectedOnboarding.steps || DEFAULT_ONBOARDING_STEPS).map(step => {
                  const isCompleted = (selectedOnboarding.completedSteps || []).includes(step.id);
                  const categoryConfig = CATEGORY_COLORS[step.category] || CATEGORY_COLORS.communication;
                  const Icon = categoryConfig.icon;

                  return (
                    <motion.div
                      key={step.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all cursor-pointer ${
                        isCompleted
                          ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                          : 'bg-gray-50 dark:bg-gray-700 border-gray-100 dark:border-gray-600 hover:border-blue-300'
                      }`}
                      onClick={() => handleToggleStep(selectedOnboarding.id, step.id)}
                    >
                      <div className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 ${
                        isCompleted ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                      }`}>
                        {isCompleted && <FaCheck className="w-3 h-3 text-white" />}
                      </div>
                      <div className={`p-2 rounded-lg ${categoryConfig.bg} ${categoryConfig.text}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${
                          isCompleted ? 'text-green-800 dark:text-green-200 line-through' : 'text-gray-900 dark:text-white'
                        }`}>
                          {step.title}
                        </p>
                        <p className="text-xs text-gray-500 truncate">{step.description}</p>
                      </div>
                      {step.required && (
                        <span className="text-xs px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded font-medium">
                          Required
                        </span>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OnboardingAutomation;