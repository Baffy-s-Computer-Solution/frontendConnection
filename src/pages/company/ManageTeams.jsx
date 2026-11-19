// src/pages/company/ManageTeams.jsx
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { FaUsers, FaUserPlus, FaUserMinus, FaUserTimes, FaUserCheck, FaUserCog, FaUserEdit, FaUserShield, FaUserLock, FaUserTie, FaUserFriends, FaUsersCog, FaUserCircle, FaRegUser, FaRegUserCircle, FaEnvelope, FaPhone, FaMapMarkerAlt, FaBriefcase, FaCalendarAlt, FaClock, FaCheckCircle, FaTimesCircle, FaExclamationTriangle, FaInfoCircle, FaSearch, FaFilter, FaSort, FaSortAmountDown, FaSortAmountUp, FaEllipsisV, FaEllipsisH, FaEdit, FaTrash, FaTrashAlt, FaCopy, FaShare, FaShareAlt, FaPaperPlane, FaSpinner, FaSync, FaPlus, FaMinus, FaTimes, FaCheck, FaBan, FaUnlock, FaLock, FaKey, FaFingerprint, FaShieldAlt, FaUserTag, FaIdCard, FaAddressCard, FaBuilding, FaRegBuilding, FaGlobe, FaLinkedin, FaTwitter, FaExternalLinkAlt, FaEye, FaEyeSlash, FaCog, FaSlidersH, FaToggleOn, FaToggleOff, FaBell, FaRegBell, FaBookmark, FaRegBookmark, FaStar, FaRegStar, FaCrown, FaGem, FaAward, FaMedal, FaTrophy, FaHandshake, FaHandsHelping, FaHeart, FaRegHeart, FaThumbsUp, FaRegThumbsUp, FaComment, FaRegCommentDots, FaCommentDots, FaChartLine, FaChartBar, FaChartPie, FaPercentage, FaHistory, FaRegClock, FaHourglass, FaUndo, FaRedo, FaDownload, FaUpload, FaFileExport, FaFileImport, FaFileAlt, FaRegFileAlt, FaFolder, FaFolderOpen, FaDatabase, FaServer, FaCloud, FaWifi, FaSignal, FaCircle, FaDotCircle, FaRegCircle, FaArrowUp, FaArrowDown, FaArrowLeft, FaArrowRight, FaChevronLeft, FaChevronRight, FaChevronDown, FaChevronUp, FaCheckDouble, FaRegSmile, FaSmile, FaRegFrown, FaFrown, FaRegMeh, FaMeh, FaBolt, FaRocket, FaFire, FaSnowflake, FaSun, FaMoon, FaRegMoon, FaRegSun, FaMagic, FaBrain, FaRobot, FaLightbulb, FaClipboard, FaClipboardCheck, FaClipboardList, FaTasks, FaProjectDiagram, FaSitemap, FaNetworkWired, FaLaptopCode, FaDesktop, FaLaptop, FaTabletAlt, FaMobileAlt, FaKeyboard, FaMouse, FaPrint, FaFax, FaVoicemail, FaInbox, FaPaperclip, FaLink, FaUnlink, FaAnchor, FaCompass, FaMap, FaMapMarked, FaMapMarkedAlt, FaMapPin, FaDirections, FaRoute, FaCrosshairs, FaLocationArrow, FaPlane, FaCar, FaBus, FaTrain, FaSubway, FaBicycle, FaWalking, FaRunning, FaHome, FaWarehouse, FaIndustry, FaStore, FaShoppingCart, FaShoppingBag, FaShoppingBasket, FaCashRegister, FaBox, FaBoxes, FaPallet, FaTruck, FaTruckLoading, FaTruckMoving, FaShip, FaRocket as FaRocketSolid, FaSatellite, FaSatelliteDish, FaBroadcastTower, FaRss, FaPodcast, FaMicrophone, FaMicrophoneAlt, FaHeadphones, FaHeadphonesAlt, FaVolumeUp, FaVolumeMute, FaVolumeDown, FaMusic, FaFilm, FaVideo, FaCamera, FaCameraRetro, FaPhotoVideo, FaImages, FaImage, FaRegImage, FaFile, FaFilePdf, FaFileWord, FaFileExcel, FaFilePowerpoint, FaFileArchive, FaFileCode, FaFileAudio, FaFileVideo, FaFileImage, FaHdd, FaMemory, FaMicrochip, FaPlug, FaChargingStation, FaBatteryFull, FaBatteryHalf, FaBatteryEmpty, FaFilter as FaFilterSolid } from "react-icons/fa";
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
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  Timestamp,
  increment,
  writeBatch,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore';

import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { db } from '../../config/firebase';
import { supabase } from '../../config/supabase';

// ============================================
// CONSTANTS
// ============================================

const TEAM_ROLES = [
  {
    value: 'admin',
    label: 'Admin',
    description: 'Full access to all features and settings',
    color: 'red',
    permissions: {
      viewJobs: true,
      manageJobs: true,
      viewApplications: true,
      manageApplications: true,
      scheduleInterviews: true,
      viewAnalytics: true,
      manageTeam: true,
      manageBilling: true,
      manageSettings: true,
    },
  },
  {
    value: 'manager',
    label: 'Manager',
    description: 'Can manage jobs, applications, and view analytics',
    color: 'orange',
    permissions: {
      viewJobs: true,
      manageJobs: true,
      viewApplications: true,
      manageApplications: true,
      scheduleInterviews: true,
      viewAnalytics: true,
      manageTeam: false,
      manageBilling: false,
      manageSettings: false,
    },
  },
  {
    value: 'recruiter',
    label: 'Recruiter',
    description: 'Can post jobs and manage applications',
    color: 'blue',
    permissions: {
      viewJobs: true,
      manageJobs: true,
      viewApplications: true,
      manageApplications: true,
      scheduleInterviews: true,
      viewAnalytics: false,
      manageTeam: false,
      manageBilling: false,
      manageSettings: false,
    },
  },
  {
    value: 'interviewer',
    label: 'Interviewer',
    description: 'Can conduct interviews and provide feedback',
    color: 'purple',
    permissions: {
      viewJobs: true,
      manageJobs: false,
      viewApplications: true,
      manageApplications: false,
      scheduleInterviews: true,
      viewAnalytics: false,
      manageTeam: false,
      manageBilling: false,
      manageSettings: false,
    },
  },
  {
    value: 'viewer',
    label: 'Viewer',
    description: 'Read-only access to view jobs and applications',
    color: 'gray',
    permissions: {
      viewJobs: true,
      manageJobs: false,
      viewApplications: true,
      manageApplications: false,
      scheduleInterviews: false,
      viewAnalytics: false,
      manageTeam: false,
      manageBilling: false,
      manageSettings: false,
    },
  },
];

const MEMBER_STATUSES = [
  { value: 'all', label: 'All Members' },
  { value: 'active', label: 'Active', color: 'green' },
  { value: 'pending', label: 'Pending Invitation', color: 'yellow' },
  { value: 'inactive', label: 'Inactive', color: 'gray' },
  { value: 'suspended', label: 'Suspended', color: 'red' },
];

const PERMISSION_LABELS = {
  viewJobs: 'View Jobs',
  manageJobs: 'Manage Jobs',
  viewApplications: 'View Applications',
  manageApplications: 'Manage Applications',
  scheduleInterviews: 'Schedule Interviews',
  viewAnalytics: 'View Analytics',
  manageTeam: 'Manage Team',
  manageBilling: 'Manage Billing',
  manageSettings: 'Manage Settings',
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

const formatDate = (date, options = {}) => {
  if (!date) return 'N/A';
  const d = date instanceof Date ? date : date?.toDate?.() || new Date(date);
  if (isNaN(d.getTime())) return 'N/A';
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    ...options,
  });
};

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
  return formatDate(past);
};

const getRoleConfig = (role) => {
  return TEAM_ROLES.find(r => r.value === role) || TEAM_ROLES[TEAM_ROLES.length - 1];
};

const getStatusConfig = (status) => {
  const configs = {
    active: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-300', label: 'Active', icon: FaCheckCircle },
    pending: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-300', label: 'Pending', icon: FaClock },
    inactive: { bg: 'bg-gray-100 dark:bg-gray-700', text: 'text-gray-700 dark:text-gray-300', label: 'Inactive', icon: FaTimesCircle },
    suspended: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-300', label: 'Suspended', icon: FaBan },
  };
  return configs[status] || configs.inactive;
};

const getRoleColorClasses = (color) => {
  const colors = {
    red: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
    orange: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
    blue: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    purple: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
    gray: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
  };
  return colors[color] || colors.gray;
};

// ============================================
// CUSTOM HOOKS
// ============================================

const useTeamMembers = (companyId) => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!companyId) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'companyTeamMembers'),
      where('companyId', '==', companyId),
      orderBy('invitedAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const membersData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          invitedAt: doc.data().invitedAt?.toDate?.() || doc.data().invitedAt,
          joinedAt: doc.data().joinedAt?.toDate?.() || doc.data().joinedAt,
          lastActive: doc.data().lastActive?.toDate?.() || doc.data().lastActive,
        }));
        setMembers(membersData);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching team members:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [companyId]);

  return { members, loading, error };
};

// ============================================
// COMPONENTS
// ============================================

const LoadingSkeleton = () => (
  <div className="space-y-3">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-4 animate-pulse">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
          <div className="flex-1">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          </div>
        </div>
      </div>
    ))}
  </div>
);

const EmptyState = ({ onInvite, hasFilters }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="text-center py-16"
  >
    <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
      <FaUsers className="w-12 h-12 text-gray-400" />
    </div>
    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
      {hasFilters ? 'No team members match your filters' : 'No team members yet'}
    </h3>
    <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
      {hasFilters
        ? 'Try adjusting your search or filter criteria.'
        : 'Invite team members to help manage your hiring process.'}
    </p>
    <button
      onClick={onInvite}
      className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
    >
      <FaUserPlus className="w-4 h-4" />
      Invite Team Member
    </button>
  </motion.div>
);

const MemberCard = ({
  member,
  onEdit,
  onRemove,
  onResendInvite,
  onToggleStatus,
  onUpdateRole,
  canManage,
}) => {
  const roleConfig = getRoleConfig(member.role);
  const statusConfig = getStatusConfig(member.status);
  const StatusIcon = statusConfig.icon;
  const [showMenu, setShowMenu] = useState(false);

  const memberName = member.name || member.email?.split('@')[0] || 'Team Member';
  const memberInitial = memberName.charAt(0).toUpperCase();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4 flex-1 min-w-0">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            {member.avatar ? (
              <img
                src={member.avatar}
                alt={memberName}
                className="w-14 h-14 rounded-full object-cover"
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-lg font-semibold">
                {memberInitial}
              </div>
            )}
            {member.status === 'active' && member.isOnline && (
              <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white dark:border-gray-800" />
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h4 className="font-semibold text-gray-900 dark:text-white truncate">
                {memberName}
              </h4>
              {member.role === 'admin' && (
                <FaCrown className="w-3.5 h-3.5 text-yellow-500 flex-shrink-0" />
              )}
            </div>

            <p className="text-sm text-gray-500 dark:text-gray-400 truncate mb-2">
              <FaEnvelope className="w-3 h-3 inline mr-1" />
              {member.email}
            </p>

            <div className="flex flex-wrap items-center gap-2">
              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${getRoleColorClasses(roleConfig.color)}`}>
                <FaShieldAlt className="w-3 h-3" />
                {roleConfig.label}
              </span>
              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.text}`}>
                <StatusIcon className="w-3 h-3" />
                {statusConfig.label}
              </span>
              {member.department && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                  <FaBriefcase className="w-3 h-3" />
                  {member.department}
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-gray-400">
              {member.status === 'pending' && (
                <span className="flex items-center gap-1">
                  <FaClock className="w-3 h-3" />
                  Invited {formatTimeAgo(member.invitedAt)}
                </span>
              )}
              {member.status === 'active' && member.lastActive && (
                <span className="flex items-center gap-1">
                  <FaHistory className="w-3 h-3" />
                  Active {formatTimeAgo(member.lastActive)}
                </span>
              )}
              {member.joinedAt && (
                <span className="flex items-center gap-1">
                  <FaCalendarAlt className="w-3 h-3" />
                  Joined {formatDate(member.joinedAt)}
                </span>
              )}
            </div>

            {/* Permissions chips */}
            {member.permissions && (
              <div className="flex flex-wrap gap-1 mt-3">
                {Object.entries(member.permissions)
                  .filter(([_, enabled]) => enabled)
                  .slice(0, 3)
                  .map(([key]) => (
                    <span
                      key={key}
                      className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded text-xs"
                    >
                      {PERMISSION_LABELS[key]}
                    </span>
                  ))}
                {Object.values(member.permissions).filter(Boolean).length > 3 && (
                  <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded text-xs">
                    +{Object.values(member.permissions).filter(Boolean).length - 3} more
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        {canManage && (
          <div className="relative flex-shrink-0">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <FaEllipsisV className="w-4 h-4" />
            </button>

            <AnimatePresence>
              {showMenu && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowMenu(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 py-2 z-20"
                  >
                    {member.status === 'pending' && (
                      <button
                        onClick={() => {
                          onResendInvite(member);
                          setShowMenu(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                      >
                        <FaPaperPlane className="w-4 h-4" />
                        Resend Invitation
                      </button>
                    )}

                    <button
                      onClick={() => {
                        onEdit(member);
                        setShowMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                    >
                      <FaEdit className="w-4 h-4" />
                      Edit Details
                    </button>

                    <div className="border-t border-gray-100 dark:border-gray-700 my-1" />
                    <p className="px-4 py-1 text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Change Role
                    </p>
                    {TEAM_ROLES.map((role) => (
                      <button
                        key={role.value}
                        onClick={() => {
                          onUpdateRole(member, role.value);
                          setShowMenu(false);
                        }}
                        disabled={member.role === role.value}
                        className={`w-full px-4 py-2 text-left text-sm flex items-center gap-2 ${
                          member.role === role.value
                            ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 cursor-default'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                      >
                        <FaShieldAlt className="w-4 h-4" />
                        {role.label}
                        {member.role === role.value && <FaCheck className="w-3 h-3 ml-auto" />}
                      </button>
                    ))}

                    <div className="border-t border-gray-100 dark:border-gray-700 my-1" />

                    {member.status === 'active' && (
                      <button
                        onClick={() => {
                          onToggleStatus(member, 'suspended');
                          setShowMenu(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 flex items-center gap-2"
                      >
                        <FaBan className="w-4 h-4" />
                        Suspend Access
                      </button>
                    )}

                    {member.status === 'suspended' && (
                      <button
                        onClick={() => {
                          onToggleStatus(member, 'active');
                          setShowMenu(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 flex items-center gap-2"
                      >
                        <FaUnlock className="w-4 h-4" />
                        Restore Access
                      </button>
                    )}

                    <button
                      onClick={() => {
                        onRemove(member);
                        setShowMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                    >
                      <FaUserMinus className="w-4 h-4" />
                      Remove Member
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </motion.div>
  );
};

const InviteModal = ({ show, onClose, onSubmit, loading, companyName }) => {
  const [formData, setFormData] = useState({
    email: '',
    role: 'recruiter',
    department: '',
    sendEmail: true,
    customMessage: '',
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  const selectedRole = TEAM_ROLES.find(r => r.value === formData.role);

  if (!show) return null;

  return (
    <AnimatePresence>
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
          className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg my-8"
        >
          <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <FaUserPlus className="w-5 h-5 text-blue-600" />
                Invite Team Member
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Add someone to help manage {companyName || 'your company'}'s hiring
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <FaTimes className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email Address *
              </label>
              <div className="relative">
                <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="colleague@company.com"
                  className={`w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-700 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.email ? 'border-red-500' : 'border-gray-200 dark:border-gray-600'
                  }`}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-500">{errors.email}</p>
              )}
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Role *
              </label>
              <div className="space-y-2">
                {TEAM_ROLES.map((role) => (
                  <button
                    key={role.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, role: role.value })}
                    className={`w-full p-3 rounded-xl border-2 text-left transition-all ${
                      formData.role === role.value
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className={`font-medium ${
                          formData.role === role.value 
                            ? 'text-blue-600' 
                            : 'text-gray-900 dark:text-white'
                        }`}>
                          {role.label}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {role.description}
                        </p>
                      </div>
                      {formData.role === role.value && (
                        <FaCheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Department */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Department (optional)
              </label>
              <div className="relative">
                <FaBriefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  placeholder="e.g., Human Resources, Engineering"
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Permissions preview */}
            {selectedRole && (
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  <FaShieldAlt className="w-4 h-4 inline mr-1" />
                  Permissions
                </p>
                <div className="space-y-1.5">
                  {Object.entries(selectedRole.permissions).map(([key, enabled]) => (
                    <div key={key} className="flex items-center gap-2 text-sm">
                      {enabled ? (
                        <FaCheckCircle className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                      ) : (
                        <FaTimesCircle className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                      )}
                      <span className={enabled ? 'text-gray-700 dark:text-gray-300' : 'text-gray-400'}>
                        {PERMISSION_LABELS[key]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Custom Message */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Personal Message (optional)
              </label>
              <textarea
                value={formData.customMessage}
                onChange={(e) => setFormData({ ...formData, customMessage: e.target.value })}
                rows={3}
                placeholder="Add a personal note to the invitation email..."
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.sendEmail}
                onChange={(e) => setFormData({ ...formData, sendEmail: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Send invitation email
              </span>
            </label>
          </form>

          <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-100 dark:border-gray-700">
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || !formData.email.trim()}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <FaSpinner className="w-4 h-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <FaPaperPlane className="w-4 h-4" />
                  Send Invitation
                </>
              )}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================

const ManageTeams = () => {
  const navigate = useNavigate();
  const { currentUser, userProfile } = useAuth();
  const { showNotification } = useNotification();

  const companyId = currentUser?.uid;
  const companyName = userProfile?.companyName || userProfile?.displayName || 'Your Company';

  const { members, loading, error } = useTeamMembers(companyId);

  // Local state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState(null);
  const [inviting, setInviting] = useState(false);
  const [viewMode, setViewMode] = useState('grid');

  // Current user's role in the team (admin/owner)
  const currentUserRole = useMemo(() => {
    const me = members.find(m => m.userId === companyId || m.email === currentUser?.email);
    return me?.role || 'admin'; // Default to admin for owner
  }, [members, companyId, currentUser]);

  const canManage = currentUserRole === 'admin';

  // Stats
  const stats = useMemo(() => ({
    total: members.length,
    active: members.filter(m => m.status === 'active').length,
    pending: members.filter(m => m.status === 'pending').length,
    admins: members.filter(m => m.role === 'admin').length,
  }), [members]);

  // Filtered members
  const filteredMembers = useMemo(() => {
    let filtered = [...members];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(member =>
        (member.name?.toLowerCase() || '').includes(term) ||
        (member.email?.toLowerCase() || '').includes(term) ||
        (member.department?.toLowerCase() || '').includes(term)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(m => m.status === statusFilter);
    }

    if (roleFilter !== 'all') {
      filtered = filtered.filter(m => m.role === roleFilter);
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.invitedAt?.toDate?.() || b.invitedAt || 0) - new Date(a.invitedAt?.toDate?.() || a.invitedAt || 0);
        case 'oldest':
          return new Date(a.invitedAt?.toDate?.() || a.invitedAt || 0) - new Date(b.invitedAt?.toDate?.() || b.invitedAt || 0);
        case 'name':
          return (a.name || a.email || '').localeCompare(b.name || b.email || '');
        case 'role': {
          const roleOrder = { admin: 0, manager: 1, recruiter: 2, interviewer: 3, viewer: 4 };
          return (roleOrder[a.role] ?? 99) - (roleOrder[b.role] ?? 99);
        }
        default:
          return 0;
      }
    });

    return filtered;
  }, [members, searchTerm, statusFilter, roleFilter, sortBy]);

  // ============================================
  // HANDLERS
  // ============================================

  const handleInvite = async (formData) => {
    if (!companyId) return;

    try {
      setInviting(true);

      // Check if already a member
      const existingQuery = query(
        collection(db, 'companyTeamMembers'),
        where('companyId', '==', companyId),
        where('email', '==', formData.email.toLowerCase())
      );
      const existing = await getDocs(existingQuery);

      if (!existing.empty) {
        showNotification('warning', 'This email has already been invited');
        return;
      }

      const roleConfig = getRoleConfig(formData.role);

      // Create team member record
      const memberData = {
        companyId,
        companyName,
        email: formData.email.toLowerCase(),
        name: formData.email.split('@')[0],
        role: formData.role,
        department: formData.department,
        status: 'pending',
        permissions: roleConfig.permissions,
        invitedBy: companyId,
        invitedByName: userProfile?.displayName || companyName,
        invitedAt: serverTimestamp(),
        emailSent: formData.sendEmail,
        customMessage: formData.customMessage,
      };

      await addDoc(collection(db, 'companyTeamMembers'), memberData);

      // Check if user exists and send notification
      const userQuery = query(
        collection(db, 'users'),
        where('email', '==', formData.email.toLowerCase())
      );
      const userSnapshot = await getDocs(userQuery);

      if (!userSnapshot.empty) {
        const userId = userSnapshot.docs[0].id;

        await addDoc(collection(db, 'notifications'), {
          userId,
          type: 'team_invitation',
          title: 'Team Invitation',
          message: `${companyName} has invited you to join their team as a ${roleConfig.label}`,
          companyId,
          read: false,
          createdAt: serverTimestamp(),
        });
      }

      // Log to Supabase
      await supabase
        .from('company_activities')
        .insert({
          company_id: companyId,
          activity_type: 'team_member_invited',
          metadata: {
            email: formData.email,
            role: formData.role,
          },
          created_at: new Date().toISOString(),
        });

      showNotification('success', `Invitation sent to ${formData.email}`);
      setShowInviteModal(false);
    } catch (error) {
      console.error('Error inviting team member:', error);
      showNotification('error', 'Failed to send invitation');
    } finally {
      setInviting(false);
    }
  };

  const handleUpdateRole = async (member, newRole) => {
    try {
      const roleConfig = getRoleConfig(newRole);

      await updateDoc(doc(db, 'companyTeamMembers', member.id), {
        role: newRole,
        permissions: roleConfig.permissions,
        updatedAt: serverTimestamp(),
      });

      showNotification('success', `Role updated to ${roleConfig.label}`);
    } catch (error) {
      console.error('Error updating role:', error);
      showNotification('error', 'Failed to update role');
    }
  };

  const handleToggleStatus = async (member, newStatus) => {
    try {
      await updateDoc(doc(db, 'companyTeamMembers', member.id), {
        status: newStatus,
        updatedAt: serverTimestamp(),
      });

      showNotification('success', `Member ${newStatus === 'suspended' ? 'suspended' : 'restored'}`);
    } catch (error) {
      console.error('Error updating status:', error);
      showNotification('error', 'Failed to update status');
    }
  };

  const handleResendInvite = async (member) => {
    try {
      // Send notification
      const userQuery = query(
        collection(db, 'users'),
        where('email', '==', member.email)
      );
      const userSnapshot = await getDocs(userQuery);

      if (!userSnapshot.empty) {
        const userId = userSnapshot.docs[0].id;

        await addDoc(collection(db, 'notifications'), {
          userId,
          type: 'team_invitation',
          title: 'Team Invitation Reminder',
          message: `${companyName} has re-sent your team invitation`,
          companyId,
          read: false,
          createdAt: serverTimestamp(),
        });
      }

      await updateDoc(doc(db, 'companyTeamMembers', member.id), {
        lastInviteSentAt: serverTimestamp(),
        inviteCount: increment(1),
      });

      showNotification('success', 'Invitation re-sent');
    } catch (error) {
      console.error('Error resending invite:', error);
      showNotification('error', 'Failed to resend invitation');
    }
  };

  const handleRemoveClick = (member) => {
    setMemberToRemove(member);
    setShowRemoveConfirm(true);
  };

  const handleRemoveConfirm = async () => {
    if (!memberToRemove) return;

    try {
      await deleteDoc(doc(db, 'companyTeamMembers', memberToRemove.id));

      // Log to Supabase
      await supabase
        .from('company_activities')
        .insert({
          company_id: companyId,
          activity_type: 'team_member_removed',
          metadata: {
            email: memberToRemove.email,
            role: memberToRemove.role,
          },
          created_at: new Date().toISOString(),
        });

      showNotification('success', 'Team member removed');
      setShowRemoveConfirm(false);
      setMemberToRemove(null);
    } catch (error) {
      console.error('Error removing member:', error);
      showNotification('error', 'Failed to remove team member');
    }
  };

  const handleEdit = (member) => {
    // Navigate to edit page or open edit modal
    // For simplicity, just show a notification
    showNotification('info', 'Edit functionality coming soon');
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setRoleFilter('all');
    setSortBy('recent');
  };

  const hasFilters = searchTerm || statusFilter !== 'all' || roleFilter !== 'all';

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
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <FaUsersCog className="w-8 h-8 text-blue-600" />
              Manage Team
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Manage your team members, roles, and permissions
            </p>
          </div>

          {canManage && (
            <button
              onClick={() => setShowInviteModal(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <FaUserPlus className="w-4 h-4" />
              Invite Team Member
            </button>
          )}
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Members', value: stats.total, icon: FaUsers, color: 'blue' },
            { label: 'Active', value: stats.active, icon: FaUserCheck, color: 'green' },
            { label: 'Pending Invites', value: stats.pending, icon: FaClock, color: 'yellow' },
            { label: 'Admins', value: stats.admins, icon: FaCrown, color: 'red' },
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700"
            >
              <div className={`p-2 rounded-lg inline-block mb-2 ${
                stat.color === 'blue' ? 'bg-blue-50 text-blue-600' :
                stat.color === 'green' ? 'bg-green-50 text-green-600' :
                stat.color === 'yellow' ? 'bg-yellow-50 text-yellow-600' :
                'bg-red-50 text-red-600'
              }`}>
                <stat.icon className="w-4 h-4" />
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stat.value}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 mb-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="relative flex-1 w-full">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, or department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {MEMBER_STATUSES.map(status => (
                  <option key={status.value} value={status.value}>{status.label}</option>
                ))}
              </select>

              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Roles</option>
                {TEAM_ROLES.map(role => (
                  <option key={role.value} value={role.value}>{role.label}</option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="recent">Most Recent</option>
                <option value="oldest">Oldest First</option>
                <option value="name">Name A-Z</option>
                <option value="role">Role</option>
              </select>

              {hasFilters && (
                <button
                  onClick={clearFilters}
                  className="px-4 py-2.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl font-medium transition-colors flex items-center gap-2 text-sm"
                >
                  <FaTimes className="w-4 h-4" />
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Members List */}
        {loading ? (
          <LoadingSkeleton />
        ) : error ? (
          <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-6 text-center">
            <FaExclamationTriangle className="w-12 h-12 text-red-500 mx-auto mb-3" />
            <p className="text-red-600 dark:text-red-400">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : filteredMembers.length === 0 ? (
          <EmptyState
            onInvite={() => setShowInviteModal(true)}
            hasFilters={hasFilters}
          />
        ) : (
          <div className="space-y-3">
            {filteredMembers.map((member) => (
              <MemberCard
                key={member.id}
                member={member}
                onEdit={handleEdit}
                onRemove={handleRemoveClick}
                onResendInvite={handleResendInvite}
                onToggleStatus={handleToggleStatus}
                onUpdateRole={handleUpdateRole}
                canManage={canManage}
              />
            ))}
          </div>
        )}
      </div>

      {/* Invite Modal */}
      <InviteModal
        show={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        onSubmit={handleInvite}
        loading={inviting}
        companyName={companyName}
      />

      {/* Remove Confirmation Modal */}
      <AnimatePresence>
        {showRemoveConfirm && memberToRemove && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowRemoveConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full">
                  <FaExclamationTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Remove Team Member
                  </h3>
                  <p className="text-sm text-gray-500">
                    This action cannot be undone
                  </p>
                </div>
              </div>

              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Are you sure you want to remove{' '}
                <strong>{memberToRemove.name || memberToRemove.email}</strong> from your team?
                They will lose access immediately.
              </p>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowRemoveConfirm(false)}
                  className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRemoveConfirm}
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors"
                >
                  Remove Member
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ManageTeams;