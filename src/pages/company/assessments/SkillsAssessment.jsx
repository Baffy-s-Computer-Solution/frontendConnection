// src/pages/company/assessments/SkillsAssessment.jsx
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaClipboardCheck, FaClipboardList, FaTasks, FaPlus, FaSearch, FaFilter, FaEllipsisV, FaCheck, FaTimes, FaSpinner, FaEdit, FaTrash, FaEye, FaPaperPlane, FaClock, FaCheckCircle, FaTimesCircle, FaCalendarAlt, FaUser, FaUserTie, FaUsers, FaChartLine, FaChartBar, FaChartPie, FaPercentage, FaStar, FaTrophy, FaAward, FaMedal, FaCrown, FaGem, FaRocket, FaBolt, FaFire, FaBrain, FaRobot, FaMagic, FaLightbulb, FaCode, FaLaptopCode, FaDatabase, FaServer, FaCloud, FaMobile, FaDesktop, FaPalette, FaPaintBrush, FaBullhorn, FaChartArea, FaLayerGroup, FaSitemap, FaProjectDiagram, FaFileAlt, FaFilePdf, FaDownload, FaFileExport, FaCopy, FaExternalLinkAlt, FaLink, FaShare, FaShareAlt, FaHistory, FaUndo, FaRedo, FaSync, FaCog, FaSlidersH, FaToggleOn, FaToggleOff, FaLock, FaUnlock, FaShieldAlt, FaFingerprint, FaUserShield, FaUserLock, FaUserSecret, FaUserGraduate, FaUserFriends, FaUsersCog, FaHandshake, FaHandsHelping, FaHeart, FaThumbsUp, FaRegThumbsUp, FaComment, FaRegCommentDots, FaInfoCircle, FaExclamationTriangle, FaChevronLeft, FaChevronRight, FaChevronDown, FaChevronUp, FaPlay, FaPause, FaStop, FaArrowRight, FaArrowLeft, FaRegClock, FaRegCalendar, FaRegCommentDots as FaRegCommentDotsSolid, FaRegUserCircle, FaUserCircle, FaCircle, FaRegCircle, FaDotCircle, FaRegDotCircle, FaCheckSquare, FaRegCheckSquare, FaSquare, FaRegSquare, FaStream, FaList, FaTh, FaThLarge, FaThList, FaTable, FaColumns, FaBars, FaGripHorizontal, FaGripVertical, FaEllipsisH, FaPlusSquare, FaMinusSquare, FaCheckDouble, FaPercentage as FaPercentageSolid, FaChartPie as FaChartPieSolid, FaChartBar as FaChartBarSolid, FaChartLine as FaChartLineSolid } from "react-icons/fa";
import {
  collection, doc, query, where, orderBy, limit, onSnapshot,
  addDoc, updateDoc, deleteDoc, serverTimestamp, getDocs, writeBatch,
} from 'firebase/firestore';

import { useAuth } from '../../../context/AuthContext';
import { useNotification } from '../../../context/NotificationContext';
import { db } from '../../../config/firebase';
import { supabase } from '../../../config/supabase';

const ASSESSMENT_TYPES = [
  { value: 'technical', label: 'Technical Skills', icon: FaCode, color: 'blue' },
  { value: 'cognitive', label: 'Cognitive Ability', icon: FaBrain, color: 'purple' },
  { value: 'personality', label: 'Personality', icon: FaHeart, color: 'pink' },
  { value: 'language', label: 'Language Proficiency', icon: FaComment, color: 'green' },
  { value: 'situational', label: 'Situational Judgment', icon: FaLightbulb, color: 'yellow' },
  { value: 'custom', label: 'Custom Assessment', icon: FaMagic, color: 'gray' },
];

const DEFAULT_TEMPLATES = [
  {
    id: 'tech-frontend',
    title: 'Frontend Developer Assessment',
    type: 'technical',
    duration: 60,
    passingScore: 70,
    questionCount: 25,
    skills: ['JavaScript', 'React', 'CSS', 'HTML'],
    description: 'Comprehensive frontend development assessment covering modern frameworks.',
  },
  {
    id: 'tech-backend',
    title: 'Backend Developer Assessment',
    type: 'technical',
    duration: 90,
    passingScore: 70,
    questionCount: 30,
    skills: ['Node.js', 'Databases', 'APIs', 'System Design'],
    description: 'Evaluate backend development skills including API design and databases.',
  },
  {
    id: 'cognitive-general',
    title: 'General Cognitive Ability',
    type: 'cognitive',
    duration: 45,
    passingScore: 60,
    questionCount: 40,
    skills: ['Logic', 'Numerical', 'Verbal', 'Spatial'],
    description: 'Standard cognitive assessment measuring problem-solving capabilities.',
  },
  {
    id: 'personality-work',
    title: 'Workplace Personality Profile',
    type: 'personality',
    duration: 30,
    passingScore: 50,
    questionCount: 50,
    skills: ['Teamwork', 'Leadership', 'Adaptability', 'Communication'],
    description: 'Evaluate personality traits relevant to workplace success.',
  },
];

const formatDate = (date) => {
  if (!date) return 'N/A';
  const d = date instanceof Date ? date : date?.toDate?.() || new Date(date);
  if (isNaN(d.getTime())) return 'N/A';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
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

const useAssessments = (companyId) => {
  const [data, setData] = useState({ assessments: [], templates: [], loading: true });

  useEffect(() => {
    if (!companyId) { setData(prev => ({ ...prev, loading: false })); return; }
    const unsubs = [];

    unsubs.push(onSnapshot(
      query(collection(db, 'companyAssessments'), where('companyId', '==', companyId), orderBy('createdAt', 'desc')),
      (snap) => {
        const assessments = snap.docs.map(d => ({
          id: d.id, ...d.data(),
          createdAt: d.data().createdAt?.toDate?.() || d.data().createdAt,
        }));
        setData(prev => ({ ...prev, assessments, loading: false }));
      }
    ));

    unsubs.push(onSnapshot(
      query(collection(db, 'assessmentTemplates'), where('companyId', '==', companyId), orderBy('createdAt', 'desc')),
      (snap) => {
        const templates = snap.docs.map(d => ({
          id: d.id, ...d.data(),
          createdAt: d.data().createdAt?.toDate?.() || d.data().createdAt,
        }));
        setData(prev => ({ ...prev, templates }));
      }
    ));

    return () => unsubs.forEach(u => u());
  }, [companyId]);

  return data;
};

const AssessmentCard = ({ assessment, onView, onDelete, onEdit }) => {
  const typeConfig = ASSESSMENT_TYPES.find(t => t.value === assessment.type) || ASSESSMENT_TYPES[0];
  const TypeIcon = typeConfig.icon;
  const [showMenu, setShowMenu] = useState(false);

  const colorClasses = {
    blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600',
    purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600',
    pink: 'bg-pink-100 dark:bg-pink-900/30 text-pink-600',
    green: 'bg-green-100 dark:bg-green-900/30 text-green-600',
    yellow: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600',
    gray: 'bg-gray-100 dark:bg-gray-700 text-gray-600',
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
          <div className={`p-2.5 rounded-lg ${colorClasses[typeConfig.color]}`}>
            <TypeIcon className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white line-clamp-2">
              {assessment.title}
            </h4>
            <p className="text-xs text-gray-500 mt-1 capitalize">
              {typeConfig.label}
            </p>
          </div>
        </div>
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <FaEllipsisV className="w-4 h-4" />
          </button>
          <AnimatePresence>
            {showMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 py-2 z-20"
                >
                  <button
                    onClick={() => { onView(assessment); setShowMenu(false); }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                  >
                    <FaEye className="w-4 h-4" /> Preview
                  </button>
                  <button
                    onClick={() => { onEdit(assessment); setShowMenu(false); }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                  >
                    <FaEdit className="w-4 h-4" /> Edit
                  </button>
                  <button
                    onClick={() => { onDelete(assessment.id); setShowMenu(false); }}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                  >
                    <FaTrash className="w-4 h-4" /> Delete
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      {assessment.description && (
        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-4">
          {assessment.description}
        </p>
      )}

      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="text-center p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <p className="text-lg font-bold text-gray-900 dark:text-white">{assessment.duration || 60}</p>
          <p className="text-xs text-gray-500">min</p>
        </div>
        <div className="text-center p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <p className="text-lg font-bold text-gray-900 dark:text-white">{assessment.questionCount || 0}</p>
          <p className="text-xs text-gray-500">questions</p>
        </div>
        <div className="text-center p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <p className="text-lg font-bold text-gray-900 dark:text-white">{assessment.passingScore || 70}%</p>
          <p className="text-xs text-gray-500">pass score</p>
        </div>
      </div>

      {assessment.skills && assessment.skills.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-4">
          {assessment.skills.slice(0, 3).map((skill, i) => (
            <span key={i} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded text-xs">
              {skill}
            </span>
          ))}
          {assessment.skills.length > 3 && (
            <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded text-xs">
              +{assessment.skills.length - 3}
            </span>
          )}
        </div>
      )}

      <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
        <span className="text-xs text-gray-400">{formatTimeAgo(assessment.createdAt)}</span>
        <button
          onClick={() => onView(assessment)}
          className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1"
        >
          <FaPlay className="w-3 h-3" />
          Start
        </button>
      </div>
    </motion.div>
  );
};

const SkillsAssessment = () => {
  const { currentUser, userProfile } = useAuth();
  const { showNotification } = useNotification();
  const companyId = currentUser?.uid;
  const { assessments, templates, loading } = useAssessments(companyId);

  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [saving, setSaving] = useState(false);
  const [newAssessment, setNewAssessment] = useState({
    title: '',
    description: '',
    type: 'technical',
    duration: 60,
    passingScore: 70,
    skills: [],
    newSkill: '',
  });

  const stats = useMemo(() => ({
    total: assessments.length,
    technical: assessments.filter(a => a.type === 'technical').length,
    cognitive: assessments.filter(a => a.type === 'cognitive').length,
    personality: assessments.filter(a => a.type === 'personality').length,
  }), [assessments]);

  const filteredAssessments = useMemo(() => {
    let filtered = [...assessments];
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(a =>
        (a.title?.toLowerCase() || '').includes(term) ||
        (a.description?.toLowerCase() || '').includes(term) ||
        (a.skills?.some(s => s.toLowerCase().includes(term)) || false)
      );
    }
    if (typeFilter !== 'all') filtered = filtered.filter(a => a.type === typeFilter);
    return filtered;
  }, [assessments, searchTerm, typeFilter]);

  const handleCreate = async () => {
    if (!newAssessment.title.trim()) return showNotification('error', 'Title required');
    try {
      setSaving(true);
      await addDoc(collection(db, 'companyAssessments'), {
        ...newAssessment,
        companyId,
        questionCount: 0,
        createdBy: companyId,
        createdByName: userProfile?.displayName || userProfile?.companyName || 'Admin',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      await supabase.from('company_activities').insert({
        company_id: companyId,
        activity_type: 'assessment_created',
        metadata: { title: newAssessment.title, type: newAssessment.type },
        created_at: new Date().toISOString(),
      });
      showNotification('success', 'Assessment created');
      setShowCreateModal(false);
      setNewAssessment({ title: '', description: '', type: 'technical', duration: 60, passingScore: 70, skills: [], newSkill: '' });
    } catch (error) {
      showNotification('error', 'Failed to create');
    } finally {
      setSaving(false);
    }
  };

  const handleUseTemplate = async (template) => {
    try {
      setSaving(true);
      const { id, ...templateData } = template;
      await addDoc(collection(db, 'companyAssessments'), {
        ...templateData,
        companyId,
        createdBy: companyId,
        createdByName: userProfile?.displayName || userProfile?.companyName || 'Admin',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      showNotification('success', 'Template applied');
    } catch (error) {
      showNotification('error', 'Failed to apply template');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this assessment?')) return;
    try {
      await deleteDoc(doc(db, 'companyAssessments', id));
      showNotification('success', 'Assessment deleted');
    } catch (error) {
      showNotification('error', 'Failed to delete');
    }
  };

  const handleAddSkill = () => {
    if (newAssessment.newSkill.trim() && !newAssessment.skills.includes(newAssessment.newSkill.trim())) {
      setNewAssessment({
        ...newAssessment,
        skills: [...newAssessment.skills, newAssessment.newSkill.trim()],
        newSkill: '',
      });
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
              <FaClipboardCheck className="w-8 h-8 text-blue-600" />
              Skills Assessment Center
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Create and manage skill assessments for candidates
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <FaPlus className="w-4 h-4" />
            Create Assessment
          </button>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Assessments', value: stats.total, icon: FaClipboardList, color: 'blue' },
            { label: 'Technical', value: stats.technical, icon: FaCode, color: 'purple' },
            { label: 'Cognitive', value: stats.cognitive, icon: FaBrain, color: 'pink' },
            { label: 'Personality', value: stats.personality, icon: FaHeart, color: 'green' },
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
                stat.color === 'purple' ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-600' :
                stat.color === 'pink' ? 'bg-pink-50 dark:bg-pink-900/20 text-pink-600' :
                'bg-green-50 dark:bg-green-900/20 text-green-600'
              }`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
              <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Templates Section */}
        {templates.length === 0 && assessments.length === 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <FaMagic className="w-5 h-5 text-purple-600" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Quick Start Templates
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {DEFAULT_TEMPLATES.map(template => {
                const typeConfig = ASSESSMENT_TYPES.find(t => t.value === template.type);
                const TypeIcon = typeConfig.icon;
                return (
                  <button
                    key={template.id}
                    onClick={() => handleUseTemplate(template)}
                    disabled={saving}
                    className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors text-left disabled:opacity-50"
                  >
                    <TypeIcon className={`w-6 h-6 mb-2 text-${typeConfig.color}-600`} />
                    <h4 className="font-medium text-gray-900 dark:text-white text-sm mb-1">
                      {template.title}
                    </h4>
                    <p className="text-xs text-gray-500">
                      {template.duration}min • {template.questionCount} questions
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Filters */}
        {assessments.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 mb-6">
            <div className="flex gap-3">
              <div className="relative flex-1">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search assessments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Types</option>
                {ASSESSMENT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
          </div>
        )}

        {filteredAssessments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAssessments.map(assessment => (
              <AssessmentCard
                key={assessment.id}
                assessment={assessment}
                onView={(a) => { setSelectedAssessment(a); setShowPreviewModal(true); }}
                onDelete={handleDelete}
                onEdit={(a) => { setSelectedAssessment(a); setShowCreateModal(true); }}
              />
            ))}
          </div>
        ) : assessments.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
            <FaClipboardCheck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No assessments yet
            </h3>
            <p className="text-gray-500 mb-6">
              Create your first assessment to evaluate candidates effectively.
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
            >
              <FaPlus className="w-4 h-4" />
              Create Assessment
            </button>
          </div>
        ) : (
          <div className="text-center py-16">
            <FaClipboardCheck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No assessments match your filters</p>
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
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-lg max-h-[85vh] overflow-y-auto"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Create Assessment
              </h3>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Assessment title"
                  value={newAssessment.title}
                  onChange={(e) => setNewAssessment({ ...newAssessment, title: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <textarea
                  placeholder="Description"
                  value={newAssessment.description}
                  onChange={(e) => setNewAssessment({ ...newAssessment, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Assessment Type
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {ASSESSMENT_TYPES.map(type => {
                      const TypeIcon = type.icon;
                      const isActive = newAssessment.type === type.value;
                      return (
                        <button
                          key={type.value}
                          type="button"
                          onClick={() => setNewAssessment({ ...newAssessment, type: type.value })}
                          className={`p-2 rounded-lg border-2 text-xs font-medium transition-all ${
                            isActive
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600'
                              : 'border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-gray-300'
                          }`}
                        >
                          <TypeIcon className="w-4 h-4 mx-auto mb-1" />
                          {type.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Duration (min)
                    </label>
                    <input
                      type="number"
                      value={newAssessment.duration}
                      onChange={(e) => setNewAssessment({ ...newAssessment, duration: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="5"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Passing Score (%)
                    </label>
                    <input
                      type="number"
                      value={newAssessment.passingScore}
                      onChange={(e) => setNewAssessment({ ...newAssessment, passingScore: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                      max="100"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Skills
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      placeholder="Add a skill"
                      value={newAssessment.newSkill}
                      onChange={(e) => setNewAssessment({ ...newAssessment, newSkill: e.target.value })}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                      className="flex-1 px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={handleAddSkill}
                      className="px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                    >
                      <FaPlus className="w-4 h-4" />
                    </button>
                  </div>
                  {newAssessment.skills.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {newAssessment.skills.map((skill, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full text-sm"
                        >
                          {skill}
                          <button
                            onClick={() => setNewAssessment({
                              ...newAssessment,
                              skills: newAssessment.skills.filter((_, idx) => idx !== i)
                            })}
                            className="hover:text-blue-800"
                          >
                            <FaTimes className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
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
                  onClick={handleCreate}
                  disabled={saving || !newAssessment.title.trim()}
                  className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving ? <FaSpinner className="w-4 h-4 animate-spin" /> : <FaCheck className="w-4 h-4" />}
                  Create
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Preview Modal */}
      <AnimatePresence>
        {showPreviewModal && selectedAssessment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowPreviewModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-lg max-h-[85vh] overflow-y-auto"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {selectedAssessment.title}
                  </h3>
                  <p className="text-sm text-gray-500 capitalize mt-1">
                    {selectedAssessment.type} Assessment
                  </p>
                </div>
                <button
                  onClick={() => setShowPreviewModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <FaTimes className="w-5 h-5" />
                </button>
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                {selectedAssessment.description || 'No description provided.'}
              </p>

              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{selectedAssessment.duration || 60}</p>
                  <p className="text-xs text-gray-500">Minutes</p>
                </div>
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{selectedAssessment.questionCount || 0}</p>
                  <p className="text-xs text-gray-500">Questions</p>
                </div>
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{selectedAssessment.passingScore || 70}%</p>
                  <p className="text-xs text-gray-500">Pass Score</p>
                </div>
              </div>

              {selectedAssessment.skills && selectedAssessment.skills.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2 text-sm">Skills Assessed</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedAssessment.skills.map((skill, i) => (
                      <span key={i} className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full text-sm">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setShowPreviewModal(false)}
                  className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => { showNotification('info', 'Assign to candidate feature coming soon'); }}
                  className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <FaPaperPlane className="w-4 h-4" />
                  Assign
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SkillsAssessment;