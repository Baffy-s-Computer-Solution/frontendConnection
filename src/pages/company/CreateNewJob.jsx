// src/pages/company/CreateNewJob.jsx
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaBriefcase, FaArrowLeft, FaArrowRight, FaSave, FaEye, FaCalendarAlt, FaMoneyBillWave, FaMapMarkerAlt, FaUsers, FaGraduationCap, FaFileAlt, FaTags, FaDollarSign, FaClock, FaCheckCircle, FaLightbulb, FaRocket, FaCloudUploadAlt, FaInfoCircle, FaTimes, FaPlus, FaTrash, FaMagic, FaBrain, FaRobot, FaWifi, FaBuilding, FaGlobe, FaHandshake, FaHeart, FaAward, FaTrophy, FaMedal, FaCrown, FaGem, FaStar, FaBolt, FaFire, FaSnowflake, FaSun, FaMoon, FaUmbrella, FaCoffee, FaUtensils, FaDumbbell, FaBook, FaBookOpen, FaLaptopCode, FaHome, FaCar, FaBus, FaPlane, FaHeartbeat, FaStethoscope, FaPills, FaBaby, FaDog, FaCat, FaGamepad, FaMusic, FaFilm, FaCamera, FaPalette, FaHandsHelping, FaHandHoldingHeart, FaCheck, FaCheckDouble, FaExclamationTriangle, FaSpinner, FaChevronLeft, FaChevronRight, FaChevronUp, FaChevronDown, FaCopy, FaLink, FaExternalLinkAlt, FaShare, FaDownload, FaPrint, FaPencilAlt, FaEraser, FaUndo, FaRedo, FaHistory, FaClipboardCheck, FaClipboardList, FaTasks, FaProjectDiagram, FaSitemap, FaNetworkWired, FaServer, FaDatabase, FaCloud, FaChartLine, FaChartBar, FaChartPie, FaPercentage, FaSlidersH, FaCog, FaCogs, FaToggleOn, FaToggleOff, FaLock, FaUnlock, FaShieldAlt, FaFingerprint, FaKey, FaUserShield, FaUserLock, FaUserTie, FaUserGraduate, FaUsersCog, FaUserFriends, FaUserPlus, FaUserMinus, FaUserCheck, FaUserTimes, FaQuestionCircle, FaBullseye, FaCrosshairs, FaFlag, FaMap, FaMapMarked, FaMapMarkedAlt, FaCompass, FaDirections, FaRoute, FaLocationArrow, FaPaperclip, FaPaperPlane, FaInbox, FaBell, FaRegBell, FaEnvelope, FaRegEnvelope, FaPhone, FaMobile, FaDesktop, FaLaptop, FaKeyboard, FaMouse, FaPrint as FaPrintSolid, FaFolder, FaFolderOpen, FaFile, FaFilePdf, FaFileWord, FaFileExcel, FaFilePowerpoint, FaFileImage, FaFileVideo, FaFileAudio, FaFileArchive, FaFileCode, FaImage, FaVideo, FaMicrophone, FaHeadphones, FaVolumeUp, FaVolumeMute, FaPlay, FaPause, FaStop, FaStepForward, FaStepBackward, FaFastForward, FaFastBackward, FaExpand, FaCompress, FaSearchPlus, FaSearchMinus, FaSearch, FaFilter, FaSort, FaSortAmountDown, FaSortAmountUp, FaList, FaTh, FaThLarge, FaThList, FaTable, FaColumns, FaBars, FaEllipsisV, FaEllipsisH, FaGripHorizontal, FaGripVertical, FaGripLines, FaDotCircle, FaCircle, FaRegCircle, FaRegDotCircle, FaSquare, FaRegSquare, FaCheckSquare, FaRegCheckSquare, FaMinusSquare, FaRegMinusSquare, FaPlusSquare, FaRegPlusSquare, FaHeart as FaHeartSolid, FaRegHeart, FaThumbsUp, FaRegThumbsUp, FaThumbsDown, FaRegThumbsDown, FaComment, FaRegComment, FaCommentDots, FaRegCommentDots, FaComments, FaRegComments, FaShareAlt, FaRetweet, FaQuoteLeft, FaQuoteRight, FaHashtag, FaAt, FaAsterisk, FaInfo, FaExclamation, FaSmile, FaRegSmile, FaLaugh, FaRegLaugh, FaGrin, FaRegGrin, FaGrinBeam, FaRegGrinBeam, FaGrinStars, FaGrinHearts, FaGrinTears, FaMeh, FaRegMeh, FaFrown, FaRegFrown, FaSadTear, FaRegSadTear, FaAngry, FaRegAngry, FaSurprise, FaRegSurprise, FaTired, FaRegTired, FaKiss, FaRegKiss, FaRegKissBeam, FaKissBeam, FaKissWinkHeart, FaRegKissWinkHeart } from "react-icons/fa";
import {
  collection,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';

import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { db } from '../../config/firebase';
import supabaseConfig, { supabase } from '../../config/supabase';

// ============================================
// CONSTANTS
// ============================================

const JOB_TYPES = [
  { value: 'full-time', label: 'Full-time', icon: FaBriefcase },
  { value: 'part-time', label: 'Part-time', icon: FaClock },
  { value: 'contract', label: 'Contract', icon: FaFileAlt },
  { value: 'internship', label: 'Internship', icon: FaGraduationCap },
  { value: 'temporary', label: 'Temporary', icon: FaClock },
  { value: 'volunteer', label: 'Volunteer', icon: FaHeart },
];

const EXPERIENCE_LEVELS = [
  { value: 'entry', label: 'Entry Level (0-2 years)', description: 'Ideal for recent graduates' },
  { value: 'mid', label: 'Mid Level (3-5 years)', description: 'Some professional experience' },
  { value: 'senior', label: 'Senior Level (6+ years)', description: 'Extensive experience' },
  { value: 'lead', label: 'Lead / Manager', description: 'Team leadership role' },
  { value: 'executive', label: 'Executive', description: 'Senior leadership position' },
];

const DEPARTMENTS = [
  'Engineering',
  'Product',
  'Design',
  'Marketing',
  'Sales',
  'Human Resources',
  'Finance',
  'Operations',
  'Customer Success',
  'Legal',
  'IT',
  'Research & Development',
  'Other',
];

const CURRENCIES = [
  { value: 'LSL', label: 'Maloti (LSL)' },
  { value: 'ZAR', label: 'Rand (R)' },
  { value: 'EUR', label: 'Euro (€)' },
  { value: 'GBP', label: 'Pound (£)' },
];

const BENEFIT_PRESETS = [
  { icon: 'FaHeartbeat', label: 'Health Insurance' },
  { icon: 'FaStethoscope', label: 'Medical Aid' },
  { icon: 'FaPills', label: 'Dental & Vision' },
  { icon: 'FaHome', label: 'Remote Work' },
  { icon: 'FaClock', label: 'Flexible Hours' },
  { icon: 'FaPlane', label: 'Paid Time Off' },
  { icon: 'FaBook', label: 'Learning Budget' },
  { icon: 'FaDumbbell', label: 'Gym Membership' },
  { icon: 'FaCar', label: 'Company Car' },
  { icon: 'FaUtensils', label: 'Free Meals' },
  { icon: 'FaCoffee', label: 'Free Coffee' },
  { icon: 'FaGamepad', label: 'Game Room' },
  { icon: 'FaBaby', label: 'Parental Leave' },
  { icon: 'FaAward', label: 'Bonus Scheme' },
  { icon: 'FaGem', label: 'Stock Options' },
  { icon: 'FaGraduationCap', label: 'Tuition Reimbursement' },
];

const AI_SUGGESTIONS = {
  engineering: {
    skills: ['JavaScript', 'React', 'Node.js', 'TypeScript', 'Python', 'AWS', 'Docker', 'Git'],
    responsibilities: [
      'Design and implement scalable software solutions',
      'Collaborate with cross-functional teams',
      'Write clean, maintainable, and efficient code',
      'Participate in code reviews and technical discussions',
      'Troubleshoot and debug production issues',
    ],
    benefits: ['Health Insurance', 'Remote Work', 'Learning Budget', 'Stock Options'],
  },
  design: {
    skills: ['Figma', 'Adobe Creative Suite', 'UI Design', 'UX Research', 'Prototyping', 'Sketch'],
    responsibilities: [
      'Create user-centered design solutions',
      'Conduct user research and usability testing',
      'Develop wireframes, prototypes, and high-fidelity mockups',
      'Collaborate with product and engineering teams',
    ],
    benefits: ['Remote Work', 'Flexible Hours', 'Creative Environment', 'Learning Budget'],
  },
  marketing: {
    skills: ['SEO', 'Content Marketing', 'Social Media', 'Google Analytics', 'Email Marketing'],
    responsibilities: [
      'Develop and execute marketing campaigns',
      'Analyze market trends and competitor activities',
      'Manage social media presence',
      'Create engaging content for various channels',
    ],
    benefits: ['Remote Work', 'Flexible Hours', 'Bonus Scheme', 'Health Insurance'],
  },
  sales: {
    skills: ['CRM', 'Negotiation', 'Lead Generation', 'Salesforce', 'B2B Sales', 'Cold Calling'],
    responsibilities: [
      'Identify and pursue new business opportunities',
      'Build and maintain client relationships',
      'Meet and exceed sales targets',
      'Prepare and deliver sales presentations',
    ],
    benefits: ['Commission Structure', 'Company Car', 'Health Insurance', 'Bonus Scheme'],
  },
  default: {
    skills: ['Communication', 'Teamwork', 'Problem Solving', 'Time Management', 'Microsoft Office'],
    responsibilities: [
      'Perform duties as assigned',
      'Collaborate with team members',
      'Meet deadlines and quality standards',
      'Contribute to team goals',
    ],
    benefits: ['Health Insurance', 'Paid Time Off', 'Learning Budget'],
  },
};

const STEPS = [
  { id: 1, label: 'Basic Info', icon: FaBriefcase },
  { id: 2, label: 'Details', icon: FaFileAlt },
  { id: 3, label: 'Requirements', icon: FaTags },
  { id: 4, label: 'Benefits', icon: FaAward },
  { id: 5, label: 'Review', icon: FaEye },
];

// ============================================
// COMPONENTS
// ============================================

const ProgressBar = ({ currentStep, totalSteps }) => (
  <div className="mb-8">
    <div className="flex items-center justify-between mb-4">
      {STEPS.map((step, index) => {
        const stepNumber = index + 1;
        const isActive = stepNumber === currentStep;
        const isCompleted = stepNumber < currentStep;

        return (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center flex-1">
              <motion.div
                initial={false}
                animate={{
                  scale: isActive ? 1.1 : 1,
                  backgroundColor: isCompleted || isActive ? '#3B82F6' : '#E5E7EB',
                }}
                className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-colors ${
                  isCompleted || isActive ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                {isCompleted ? (
                  <FaCheck className="w-4 h-4 md:w-5 md:h-5 text-white" />
                ) : (
                  <step.icon
                    className={`w-4 h-4 md:w-5 md:h-5 ${
                      isActive ? 'text-white' : 'text-gray-500 dark:text-gray-400'
                    }`}
                  />
                )}
              </motion.div>
              <span
                className={`mt-2 text-xs md:text-sm font-medium text-center ${
                  isActive
                    ? 'text-blue-600 dark:text-blue-400'
                    : isCompleted
                    ? 'text-gray-900 dark:text-white'
                    : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                {step.label}
              </span>
            </div>
            {index < STEPS.length - 1 && (
              <div
                className={`flex-1 h-1 mx-2 md:mx-4 mt-[-20px] md:mt-[-24px] rounded ${
                  stepNumber < currentStep ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                }`}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
      <motion.div
        initial={false}
        animate={{ width: `${(currentStep / totalSteps) * 100}%` }}
        className="bg-blue-600 h-2 rounded-full"
      />
    </div>
  </div>
);

const TagInput = ({ tags = [], onChange, placeholder, suggestions = [], label }) => {
  const [input, setInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const filteredSuggestions = suggestions.filter(
    s => !tags.includes(s) && s.toLowerCase().includes(input.toLowerCase())
  );

  const handleAdd = (tag) => {
    const trimmed = tag.trim();
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed]);
      setInput('');
      setShowSuggestions(false);
    }
  };

  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {label}
        </label>
      )}
      <div className="flex flex-wrap gap-2 mb-2">
        {tags.map((tag, index) => (
          <motion.span
            key={index}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium"
          >
            {tag}
            <button
              type="button"
              onClick={() => onChange(tags.filter(t => t !== tag))}
              className="hover:text-blue-900 dark:hover:text-blue-100"
            >
              <FaTimes className="w-3 h-3" />
            </button>
          </motion.span>
        ))}
      </div>
      <div className="relative">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => { setInput(e.target.value); setShowSuggestions(true); }}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAdd(input))}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            placeholder={placeholder}
            className="flex-1 px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
          <button
            type="button"
            onClick={() => handleAdd(input)}
            className="px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
          >
            <FaPlus className="w-4 h-4" />
          </button>
        </div>

        {showSuggestions && filteredSuggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute z-20 left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl shadow-lg max-h-48 overflow-y-auto"
          >
            {filteredSuggestions.slice(0, 8).map((suggestion, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleAdd(suggestion)}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

// ============================================
// STEP COMPONENTS
// ============================================

const BasicInfoStep = ({ formData, setFormData, errors }) => {
  const handleInput = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Basic Information
        </h2>
        <p className="text-gray-500 dark:text-gray-400">
          Let's start with the essential details about this position
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Job Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => handleInput('title', e.target.value)}
            placeholder="e.g., Senior Software Engineer"
            className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.title ? 'border-red-500' : 'border-gray-200 dark:border-gray-600'
            }`}
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-500">{errors.title}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Department
          </label>
          <select
            value={formData.department}
            onChange={(e) => handleInput('department', e.target.value)}
            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Department</option>
            {DEPARTMENTS.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Job Type <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.type}
            onChange={(e) => handleInput('type', e.target.value)}
            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {JOB_TYPES.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Location <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <FaMapMarkerAlt className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={formData.location}
              onChange={(e) => handleInput('location', e.target.value)}
              placeholder="e.g., Maseru, Lesotho"
              className={`w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.location ? 'border-red-500' : 'border-gray-200 dark:border-gray-600'
              }`}
            />
          </div>
          {errors.location && (
            <p className="mt-1 text-sm text-red-500">{errors.location}</p>
          )}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Work Arrangement
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'onsite', label: 'On-site', icon: FaBuilding, description: 'Work from office' },
              { id: 'hybrid', label: 'Hybrid', icon: FaHandshake, description: 'Mix of both' },
              { id: 'remote', label: 'Remote', icon: FaWifi, description: 'Work from anywhere' },
            ].map(option => {
              const isActive =
                (option.id === 'remote' && formData.remote) ||
                (option.id === 'hybrid' && formData.hybrid) ||
                (option.id === 'onsite' && !formData.remote && !formData.hybrid);
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => {
                    if (option.id === 'remote') {
                      setFormData(prev => ({ ...prev, remote: true, hybrid: false }));
                    } else if (option.id === 'hybrid') {
                      setFormData(prev => ({ ...prev, remote: false, hybrid: true }));
                    } else {
                      setFormData(prev => ({ ...prev, remote: false, hybrid: false }));
                    }
                  }}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                    isActive
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                  }`}
                >
                  <option.icon
                    className={`w-6 h-6 ${isActive ? 'text-blue-600' : 'text-gray-400'}`}
                  />
                  <span
                    className={`text-sm font-medium ${
                      isActive ? 'text-blue-600' : 'text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {option.label}
                  </span>
                  <span className="text-xs text-gray-500">{option.description}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Experience Level
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {EXPERIENCE_LEVELS.map(level => (
              <button
                key={level.value}
                type="button"
                onClick={() => handleInput('experience', level.value)}
                className={`flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all ${
                  formData.experience === level.value
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    formData.experience === level.value
                      ? 'border-blue-500 bg-blue-500'
                      : 'border-gray-300'
                  }`}
                >
                  {formData.experience === level.value && (
                    <FaCheck className="w-2.5 h-2.5 text-white" />
                  )}
                </div>
                <div>
                  <p
                    className={`font-medium ${
                      formData.experience === level.value
                        ? 'text-blue-600'
                        : 'text-gray-900 dark:text-white'
                    }`}
                  >
                    {level.label}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">{level.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const DetailsStep = ({ formData, setFormData, errors, onEnhanceWithAI, enhancing }) => {
  const handleInput = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Job Details
        </h2>
        <p className="text-gray-500 dark:text-gray-400">
          Describe the role, responsibilities, and compensation
        </p>
      </div>

      {/* Salary Section */}
      <div className="p-5 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <FaMoneyBillWave className="w-5 h-5 text-green-600" />
          Compensation
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Currency
            </label>
            <select
              value={formData.currency}
              onChange={(e) => handleInput('currency', e.target.value)}
              className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {CURRENCIES.map(curr => (
                <option key={curr.value} value={curr.value}>{curr.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Salary Range
            </label>
            <input
              type="text"
              value={formData.salary}
              onChange={(e) => handleInput('salary', e.target.value)}
              placeholder="e.g., 15,000 - 25,000"
              className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Period
            </label>
            <select
              value={formData.salaryType}
              onChange={(e) => handleInput('salaryType', e.target.value)}
              className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="monthly">Per Month</option>
              <option value="yearly">Per Year</option>
              <option value="hourly">Per Hour</option>
            </select>
          </div>
        </div>

        <label className="flex items-center gap-2 mt-4 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.salaryNegotiable}
            onChange={(e) => handleInput('salaryNegotiable', e.target.checked)}
            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">
            Salary is negotiable
          </span>
        </label>
      </div>

      {/* Description */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Job Description <span className="text-red-500">*</span>
          </label>
          <button
            type="button"
            onClick={onEnhanceWithAI}
            disabled={enhancing || !formData.title}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-purple-600 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-colors disabled:opacity-50"
          >
            {enhancing ? (
              <FaSpinner className="w-3 h-3 animate-spin" />
            ) : (
              <FaMagic className="w-3 h-3" />
            )}
            AI Enhance
          </button>
        </div>
        <textarea
          value={formData.description}
          onChange={(e) => handleInput('description', e.target.value)}
          rows={6}
          placeholder="Describe the role, team, culture, and what makes this opportunity exciting..."
          className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
            errors.description ? 'border-red-500' : 'border-gray-200 dark:border-gray-600'
          }`}
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-500">{errors.description}</p>
        )}
      </div>

      {/* Responsibilities */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          Key Responsibilities
        </label>
        <textarea
          value={formData.responsibilities}
          onChange={(e) => handleInput('responsibilities', e.target.value)}
          rows={5}
          placeholder="List the main responsibilities, one per line..."
          className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>

      {/* Application Deadline */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          Application Deadline
        </label>
        <input
          type="date"
          value={formData.deadline}
          onChange={(e) => handleInput('deadline', e.target.value)}
          min={new Date().toISOString().split('T')[0]}
          className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  );
};

const RequirementsStep = ({ formData, setFormData, errors, suggestedSkills = [] }) => {
  const handleInput = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Requirements & Skills
        </h2>
        <p className="text-gray-500 dark:text-gray-400">
          Define what you're looking for in an ideal candidate
        </p>
      </div>

      <TagInput
        label="Required Skills *"
        tags={formData.skills}
        onChange={(skills) => handleInput('skills', skills)}
        placeholder="Add skills (e.g., JavaScript, React)"
        suggestions={suggestedSkills}
      />
      {errors.skills && (
        <p className="text-sm text-red-500">{errors.skills}</p>
      )}

      {suggestedSkills.length > 0 && (
        <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <FaBrain className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
                AI Suggestions
              </span>
            </div>
            <button
              type="button"
              onClick={() => handleInput('skills', [...new Set([...formData.skills, ...suggestedSkills])])}
              className="text-xs font-medium text-purple-600 hover:text-purple-700"
            >
              Add all
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {suggestedSkills.filter(s => !formData.skills.includes(s)).slice(0, 8).map(skill => (
              <button
                key={skill}
                type="button"
                onClick={() => handleInput('skills', [...formData.skills, skill])}
                className="px-3 py-1.5 bg-white dark:bg-gray-800 text-purple-600 dark:text-purple-400 rounded-full text-xs font-medium hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-colors flex items-center gap-1"
              >
                <FaPlus className="w-2.5 h-2.5" />
                {skill}
              </button>
            ))}
          </div>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          Requirements
        </label>
        <textarea
          value={formData.requirements}
          onChange={(e) => handleInput('requirements', e.target.value)}
          rows={5}
          placeholder="List the minimum requirements and qualifications..."
          className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          Qualifications
        </label>
        <textarea
          value={formData.qualifications}
          onChange={(e) => handleInput('qualifications', e.target.value)}
          rows={4}
          placeholder="Educational qualifications, certifications, etc."
          className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>

      <TagInput
        label="Technology Stack"
        tags={formData.techStack}
        onChange={(tech) => handleInput('techStack', tech)}
        placeholder="Add technologies (e.g., Node.js, MongoDB)"
        suggestions={['Node.js', 'MongoDB', 'PostgreSQL', 'Redis', 'AWS', 'Docker', 'Kubernetes', 'GraphQL']}
      />
    </div>
  );
};

const BenefitsStep = ({ formData, setFormData }) => {
  const handleInput = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleBenefit = (benefit) => {
    const isSelected = formData.benefits.includes(benefit);
    handleInput(
      'benefits',
      isSelected
        ? formData.benefits.filter(b => b !== benefit)
        : [...formData.benefits, benefit]
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Benefits & Perks
        </h2>
        <p className="text-gray-500 dark:text-gray-400">
          Highlight what makes your company a great place to work
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Select Benefits
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {BENEFIT_PRESETS.map((benefit) => {
            const isSelected = formData.benefits.includes(benefit.label);
            return (
              <button
                key={benefit.label}
                type="button"
                onClick={() => toggleBenefit(benefit.label)}
                className={`flex items-center gap-2 p-3 rounded-xl border-2 text-left transition-all ${
                  isSelected
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 ${
                    isSelected ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-600'
                  }`}
                >
                  {isSelected && <FaCheck className="w-3 h-3 text-white" />}
                </div>
                <span
                  className={`text-sm font-medium truncate ${
                    isSelected ? 'text-green-700 dark:text-green-300' : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {benefit.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <TagInput
        label="Additional Benefits"
        tags={formData.benefits.filter(b => !BENEFIT_PRESETS.some(p => p.label === b))}
        onChange={(custom) => {
          const presetBenefits = formData.benefits.filter(b => BENEFIT_PRESETS.some(p => p.label === b));
          handleInput('benefits', [...presetBenefits, ...custom]);
        }}
        placeholder="Add custom benefits"
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          Company Culture
        </label>
        <textarea
          value={formData.culture}
          onChange={(e) => handleInput('culture', e.target.value)}
          rows={4}
          placeholder="Describe your company culture and what it's like to work here..."
          className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>
    </div>
  );
};

const ReviewStep = ({ formData, companyName, companyLogo }) => {
  const formatSalary = () => {
    if (!formData.salary) return 'Not specified';
    const typeMap = { monthly: 'per month', yearly: 'per year', hourly: 'per hour' };
    return `${formData.currency}${formData.salary} ${typeMap[formData.salaryType] || ''}`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Review & Publish
        </h2>
        <p className="text-gray-500 dark:text-gray-400">
          Review your job posting before publishing
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl border-2 border-gray-100 dark:border-gray-700 overflow-hidden">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
          <div className="flex items-start gap-4">
            {companyLogo ? (
              <img
                src={companyLogo}
                alt={companyName}
                className="w-16 h-16 rounded-xl object-cover border-2 border-white/30"
              />
            ) : (
              <div className="w-16 h-16 rounded-xl bg-white/20 flex items-center justify-center">
                <FaBuilding className="w-8 h-8" />
              </div>
            )}
            <div className="flex-1">
              <h3 className="text-2xl font-bold mb-1">{formData.title || 'Untitled Position'}</h3>
              <p className="text-white/90">{companyName}</p>
              <div className="flex flex-wrap items-center gap-4 mt-3 text-sm">
                <span className="flex items-center gap-1">
                  <FaMapMarkerAlt className="w-3.5 h-3.5" />
                  {formData.location || 'Location not set'}
                </span>
                <span className="flex items-center gap-1">
                  <FaBriefcase className="w-3.5 h-3.5" />
                  {JOB_TYPES.find(t => t.value === formData.type)?.label || formData.type}
                </span>
                {formData.remote && (
                  <span className="flex items-center gap-1">
                    <FaWifi className="w-3.5 h-3.5" />
                    Remote
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Quick Info */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">Salary</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                {formatSalary()}
              </p>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">Experience</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white capitalize">
                {formData.experience || 'Not set'}
              </p>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">Department</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                {formData.department || 'Not set'}
              </p>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">Deadline</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                {formData.deadline || 'Open'}
              </p>
            </div>
          </div>

          {/* Description */}
          {formData.description && (
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                Description
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                {formData.description}
              </p>
            </div>
          )}

          {/* Responsibilities */}
          {formData.responsibilities && (
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                Responsibilities
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                {formData.responsibilities}
              </p>
            </div>
          )}

          {/* Skills */}
          {formData.skills.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                Required Skills
              </h4>
              <div className="flex flex-wrap gap-2">
                {formData.skills.map(skill => (
                  <span
                    key={skill}
                    className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full text-xs font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Benefits */}
          {formData.benefits.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                Benefits
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {formData.benefits.map(benefit => (
                  <div key={benefit} className="flex items-center gap-2">
                    <FaCheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
                      {benefit}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
        <div className="flex items-start gap-3">
          <FaInfoCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-700 dark:text-blue-300">
            <p className="font-medium mb-1">Ready to publish?</p>
            <p className="text-blue-600 dark:text-blue-400">
              Your job posting will be visible to candidates immediately. You can edit or pause it anytime.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================

const CreateNewJob = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, userProfile } = useAuth();
  const { addSuccessNotification, addErrorNotification } = useNotification();

  const companyId = currentUser?.uid;
  const companyName = userProfile?.companyName || userProfile?.displayName || 'Your Company';
  const companyLogo = userProfile?.logo || userProfile?.photoURL || null;

  // State
  const [currentStep, setCurrentStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [enhancing, setEnhancing] = useState(false);
  const [autoSaved, setAutoSaved] = useState(null);
  const [errors, setErrors] = useState({});
  const autoSaveTimer = useRef(null);

  const [formData, setFormData] = useState({
    // Basic Info
    title: '',
    department: '',
    location: '',
    type: 'full-time',
    experience: 'entry',
    remote: false,
    hybrid: false,

    // Details
    description: '',
    responsibilities: '',
    requirements: '',
    qualifications: '',
    salary: '',
    salaryType: 'monthly',
    currency: 'LSL',
    salaryNegotiable: false,
    deadline: '',

    // Requirements
    skills: [],
    techStack: [],

    // Benefits
    benefits: [],
    culture: '',

    // Settings
    status: 'draft',
    urgency: 'normal',
    visibility: 'public',
  });

  // Load draft from localStorage
  useEffect(() => {
    const savedDraft = localStorage.getItem('jobDraft');
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft);
        setFormData(prev => ({ ...prev, ...draft }));
      } catch (e) {
        console.error('Failed to parse draft:', e);
      }
    }

    // Prefill from location state
    if (location.state?.prefill) {
      setFormData(prev => ({ ...prev, ...location.state.prefill }));
    }
  }, []);

  // Auto-save
  useEffect(() => {
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);

    autoSaveTimer.current = setTimeout(() => {
      if (formData.title || formData.description) {
        localStorage.setItem('jobDraft', JSON.stringify(formData));
        setAutoSaved(new Date());
      }
    }, 5000);

    return () => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    };
  }, [formData]);

  // Get suggested skills based on department
  const suggestedSkills = useMemo(() => {
    const dept = formData.department?.toLowerCase() || '';
    let key = 'default';
    
    if (dept.includes('engineer') || dept.includes('tech') || dept.includes('develop')) key = 'engineering';
    else if (dept.includes('design')) key = 'design';
    else if (dept.includes('market')) key = 'marketing';
    else if (dept.includes('sales')) key = 'sales';

    return AI_SUGGESTIONS[key].skills;
  }, [formData.department]);

  // ============================================
  // HANDLERS
  // ============================================

  const validateStep = (step) => {
    const newErrors = {};

    if (step === 1) {
      if (!formData.title.trim()) newErrors.title = 'Job title is required';
      if (!formData.location.trim()) newErrors.location = 'Location is required';
    }

    if (step === 2) {
      if (!formData.description.trim()) newErrors.description = 'Job description is required';
    }

    if (step === 3) {
      if (formData.skills.length === 0) newErrors.skills = 'Add at least one required skill';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, STEPS.length));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStepClick = (step) => {
    if (step < currentStep) {
      setCurrentStep(step);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (step === currentStep + 1) {
      handleNext();
    }
  };

  const handleEnhanceWithAI = async () => {
    try {
      setEnhancing(true);

      const dept = formData.department?.toLowerCase() || '';
      let key = 'default';
      if (dept.includes('engineer') || dept.includes('tech')) key = 'engineering';
      else if (dept.includes('design')) key = 'design';
      else if (dept.includes('market')) key = 'marketing';
      else if (dept.includes('sales')) key = 'sales';

      const suggestions = AI_SUGGESTIONS[key];

      // Simulate AI generation with template
      await new Promise(resolve => setTimeout(resolve, 1500));

      const enhancedDescription = `We are seeking a talented ${formData.title || 'professional'} to join our ${formData.department || 'team'} at ${companyName}.

${formData.description || 'About the role:'}

As a key member of our team, you will play a crucial role in driving our success. We're looking for someone who is passionate, driven, and eager to make an impact.

What we offer:
${suggestions.benefits.map(b => `• ${b}`).join('\n')}

Join us in building the future!`;

      setFormData(prev => ({
        ...prev,
        description: enhancedDescription,
        skills: [...new Set([...prev.skills, ...suggestions.skills.slice(0, 5)])],
      }));

      showNotification('success', 'AI-enhanced description generated!');
    } catch (error) {
      console.error('Error enhancing:', error);
      showNotification('error', 'Failed to enhance with AI');
    } finally {
      setEnhancing(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!companyId) return;

    try {
      setSaving(true);

      const jobData = {
        ...formData,
        companyId,
        companyName,
        companyLogo,
        status: 'draft',
        applicantsCount: 0,
        views: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        createdBy: companyId,
      };

      // Convert deadline to Timestamp if set
      if (formData.deadline) {
        jobData.deadline = Timestamp.fromDate(new Date(formData.deadline));
      }

      await addDoc(collection(db, 'jobs'), jobData);

      // Clear draft
      localStorage.removeItem('jobDraft');

      showNotification('success', 'Job saved as draft!');
      navigate('/company/jobs');
    } catch (error) {
      console.error('Error saving draft:', error);
      showNotification('error', 'Failed to save draft');
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!companyId) return;
    if (!validateStep(1) || !validateStep(2) || !validateStep(3)) return;

    try {
      setPublishing(true);

      const jobData = {
        ...formData,
        companyId,
        companyName,
        companyLogo,
        status: 'active',
        applicantsCount: 0,
        views: 0,
        publishedAt: serverTimestamp(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        createdBy: companyId,
        isActive: true,
      };

      if (formData.deadline) {
        jobData.deadline = Timestamp.fromDate(new Date(formData.deadline));
      }

      const docRef = await addDoc(collection(db, 'jobs'), jobData);

      if (supabaseConfig.configured && supabase) {
        await Promise.allSettled([
          supabase.from('company_jobs').insert({
            job_id: docRef.id,
            company_id: companyId,
            title: formData.title,
            department: formData.department,
            location: formData.location,
            type: formData.type,
            status: 'active',
            created_at: new Date().toISOString(),
          }),
          supabase.from('company_activities').insert({
            company_id: companyId,
            activity_type: 'job_published',
            metadata: { job_id: docRef.id, job_title: formData.title },
            created_at: new Date().toISOString(),
          }),
        ]);
      }

      // Clear draft
      localStorage.removeItem('jobDraft');

      addSuccessNotification('Job published', 'Job published successfully!');
      navigate(`/company/jobs/${docRef.id}`);
    } catch (error) {
      console.error('Error publishing:', error);
      addErrorNotification('Job publishing failed', 'Failed to publish job');
    } finally {
      setPublishing(false);
    }
  };

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto p-4 md:p-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6"
        >
          <button
            onClick={() => navigate('/company/jobs')}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <FaArrowLeft className="w-4 h-4" />
            Back to Jobs
          </button>

          {autoSaved && (
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <FaCheckCircle className="w-3 h-3 text-green-500" />
              Auto-saved {autoSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          )}
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Create New Job
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Fill in the details to attract the best candidates
          </p>
        </motion.div>

        {/* Progress */}
        <ProgressBar currentStep={currentStep} totalSteps={STEPS.length} />

        {/* Step Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 dark:border-gray-700 mb-6"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {currentStep === 1 && (
                <BasicInfoStep
                  formData={formData}
                  setFormData={setFormData}
                  errors={errors}
                />
              )}
              {currentStep === 2 && (
                <DetailsStep
                  formData={formData}
                  setFormData={setFormData}
                  errors={errors}
                  onEnhanceWithAI={handleEnhanceWithAI}
                  enhancing={enhancing}
                />
              )}
              {currentStep === 3 && (
                <RequirementsStep
                  formData={formData}
                  setFormData={setFormData}
                  errors={errors}
                  suggestedSkills={suggestedSkills}
                />
              )}
              {currentStep === 4 && (
                <BenefitsStep formData={formData} setFormData={setFormData} />
              )}
              {currentStep === 5 && (
                <ReviewStep
                  formData={formData}
                  companyName={companyName}
                  companyLogo={companyLogo}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Navigation */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex gap-3">
            {currentStep > 1 && (
              <button
                onClick={handleBack}
                className="px-6 py-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-medium border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
              >
                <FaArrowLeft className="w-4 h-4" />
                Back
              </button>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleSaveDraft}
              disabled={saving || !formData.title}
              className="px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <FaSpinner className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <FaSave className="w-4 h-4" />
                  Save Draft
                </>
              )}
            </button>

            {currentStep < STEPS.length ? (
              <button
                onClick={handleNext}
                className="px-8 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                Continue
                <FaArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handlePublish}
                disabled={publishing}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {publishing ? (
                  <>
                    <FaSpinner className="w-4 h-4 animate-spin" />
                    Publishing...
                  </>
                ) : (
                  <>
                    <FaRocket className="w-4 h-4" />
                    Publish Job
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateNewJob;
