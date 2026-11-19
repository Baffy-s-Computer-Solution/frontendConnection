import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc,
  query, where, orderBy, limit, onSnapshot, serverTimestamp,
  Timestamp, writeBatch
} from 'firebase/firestore';
import {
  ref, uploadBytesResumable, getDownloadURL, deleteObject
} from 'firebase/storage';
import { db, storage, auth } from '../../config/firebase';
import { supabase } from '../../config/supabase';
import { useAuth } from '../../hooks/useAuth';
import {
  Award, Trophy, Crown, Medal, Star, Shield, ShieldCheck, BadgeCheck,
  Award as Certificate, FileCheck, CheckCircle, XCircle, Clock, Calendar,
  Plus, Edit3, Trash2, Eye, Download, Upload, ExternalLink, Link as LinkIcon,
  Copy, Share2, MoreVertical, Search, Filter, X, Check, Loader2,
  AlertCircle, Info, HelpCircle, ChevronLeft, ChevronRight, ChevronDown,
  ChevronUp, ArrowUpRight, TrendingUp, BarChart3, Activity, Target,
  Briefcase, Building2, GraduationCap, BookOpen, Globe, MapPin,
  Users, User, Mail, Phone, Hash, Tag, FileText, Image as ImageIcon,
  Play, PlayCircle, Video, Mic, Calendar as CalendarIcon, Hourglass,
  Timer, History, RefreshCw, Sparkles, Zap, Rocket, Lightbulb,
  Flame, Sun, Moon, Cloud, Wind, Lock, Unlock, Key, Fingerprint,
  QrCode, Scan, Percent, Calculator, Scale, Ruler, Compass, Map,
  Navigation, Anchor, Flag, Crosshair, Home, Menu, LogOut,
  Settings, Bell, Eye as EyeIcon, EyeOff, Ban, Slash, ShieldAlert,
  FilePlus, FileMinus, Inbox, Send, Clipboard, ClipboardCheck,
  ClipboardList, ScrollText, BookMarked, Bookmark, Package, Box,
  Folder, FolderOpen, Archive, Database, Server, CloudUpload,
  CloudDownload, HardDrive, Cpu, MemoryStick, Wifi, Bluetooth,
  Battery, Plug, Power, ToggleLeft, ToggleRight, Sliders, Gauge,
  Beaker, FlaskConical, Atom, Dna, Microscope, Telescope,
  Satellite, Plane, Car, Bike, Train, Ship, Truck, Bus, Ambulance
} from 'lucide-react';
import {
  BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, RadialBarChart, RadialBar
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { format, formatDistanceToNow, differenceInDays, isPast, addDays } from 'date-fns';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// ============================================================================
// UTILITY
// ============================================================================

const cn = (...inputs) => twMerge(clsx(inputs));

const getInitials = (name) => {
  if (!name) return '?';
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
};

const getAvatarColor = (name) => {
  const colors = ['bg-red-500','bg-orange-500','bg-amber-500','bg-yellow-500','bg-lime-500','bg-green-500','bg-emerald-500','bg-teal-500','bg-cyan-500','bg-sky-500','bg-blue-500','bg-indigo-500','bg-violet-500','bg-purple-500','bg-fuchsia-500','bg-pink-500','bg-rose-500'];
  const i = name?.split('').reduce((a, c) => a + c.charCodeAt(0), 0) || 0;
  return colors[i % colors.length];
};

const CERT_TYPES = [
  { value: 'professional', label: 'Professional Certification', icon: BadgeCheck, color: 'blue' },
  { value: 'degree', label: 'Degree / Diploma', icon: GraduationCap, color: 'purple' },
  { value: 'course', label: 'Course Completion', icon: BookOpen, color: 'green' },
  { value: 'award', label: 'Award / Recognition', icon: Trophy, color: 'yellow' },
  { value: 'membership', label: 'Professional Membership', icon: Users, color: 'teal' },
  { value: 'license', label: 'License', icon: Shield, color: 'red' },
  { value: 'training', label: 'Training Certificate', icon: Certificate, color: 'indigo' },
  { value: 'achievement', label: 'Achievement', icon: Award, color: 'orange' },
  { value: 'speaking', label: 'Speaking Engagement', icon: Mic, color: 'pink' },
  { value: 'publication', label: 'Publication', icon: FileText, color: 'amber' },
  { value: 'patent', label: 'Patent / IP', icon: Lightbulb, color: 'fuchsia' },
  { value: 'other', label: 'Other', icon: Package, color: 'gray' },
];

const getCertConfig = (type) => CERT_TYPES.find((c) => c.value === type) || CERT_TYPES[11];

const getVerificationStatus = (cert) => {
  if (cert.verified) return { label: 'Verified', color: 'bg-green-100 text-green-800', icon: BadgeCheck };
  if (cert.pendingVerification) return { label: 'Pending Review', color: 'bg-yellow-100 text-yellow-800', icon: Clock };
  return { label: 'Unverified', color: 'bg-gray-100 text-gray-800', icon: AlertCircle };
};

// ============================================================================
// COMPONENTS
// ============================================================================

const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-50">
    <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
  </div>
);

const Button = ({ children, variant = 'primary', size = 'md', icon: Icon, loading, className, ...props }) => {
  const variants = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500',
    secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-500',
    outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-indigo-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
    ghost: 'text-gray-600 hover:bg-gray-100 focus:ring-gray-500',
  };
  const sizes = { sm: 'px-3 py-1.5 text-sm', md: 'px-4 py-2 text-sm', lg: 'px-6 py-3 text-base', xl: 'px-8 py-4 text-lg' };
  return (
    <button
      className={cn('inline-flex items-center justify-center font-medium rounded-lg transition-colors',
        'focus:outline-none focus:ring-2 focus:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant], sizes[size], className)}
      disabled={loading || props.disabled} {...props}
    >
      {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> :
        Icon ? <Icon className={cn('w-4 h-4', children && 'mr-2')} /> : null}
      {children}
    </button>
  );
};

const Card = ({ children, className, onClick, hover = false }) => (
  <div onClick={onClick} className={cn('bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden',
    hover && 'hover:shadow-lg transition-shadow cursor-pointer', className)}>
    {children}
  </div>
);

const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;
  const sizes = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };
  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50" onClick={onClose}>
        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }} onClick={(e) => e.stopPropagation()}
          className={cn('bg-white rounded-xl shadow-xl w-full max-h-[90vh] overflow-y-auto', sizes[size])}>
          <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          <div className="p-6">{children}</div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// ============================================================================
// CERTIFICATION CARD
// ============================================================================

const CertificationCard = ({ cert, onView, onEdit, onDelete, onVerify, onShare }) => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);
  const config = getCertConfig(cert.type);
  const Icon = config.icon;
  const verification = getVerificationStatus(cert);

  useEffect(() => {
    const h = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setShowMenu(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const colorMap = {
    blue: 'bg-blue-100 text-blue-600', purple: 'bg-purple-100 text-purple-600',
    green: 'bg-green-100 text-green-600', yellow: 'bg-yellow-100 text-yellow-600',
    teal: 'bg-teal-100 text-teal-600', red: 'bg-red-100 text-red-600',
    indigo: 'bg-indigo-100 text-indigo-600', orange: 'bg-orange-100 text-orange-600',
    pink: 'bg-pink-100 text-pink-600', amber: 'bg-amber-100 text-amber-600',
    fuchsia: 'bg-fuchsia-100 text-fuchsia-600', gray: 'bg-gray-100 text-gray-600',
  };

  return (
    <Card className="p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1 min-w-0">
          <div className={cn('w-14 h-14 rounded-lg flex items-center justify-center flex-shrink-0',
            colorMap[config.color] || 'bg-gray-100 text-gray-600')}>
            <Icon className="w-7 h-7" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 flex-wrap">
              <h3 className="font-semibold text-gray-900 truncate">{cert.title}</h3>
              <span className={cn('inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full',
                verification.color)}>
                <verification.icon className="w-3 h-3 mr-1" />
                {verification.label}
              </span>
            </div>
            {cert.issuer && (
              <p className="mt-0.5 text-sm text-gray-600 flex items-center">
                <Building2 className="w-3.5 h-3.5 mr-1" />
                {cert.issuer}
              </p>
            )}
            {cert.issueDate && (
              <p className="mt-1 text-xs text-gray-500 flex items-center">
                <Calendar className="w-3 h-3 mr-1" />
                Issued {format(new Date(cert.issueDate), 'MMM yyyy')}
                {cert.expiryDate && ` · Expires ${format(new Date(cert.expiryDate), 'MMM yyyy')}`}
              </p>
            )}
            {cert.credentialId && (
              <p className="mt-1 text-xs text-gray-400 font-mono truncate">
                ID: {cert.credentialId}
              </p>
            )}
            {cert.skills?.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {cert.skills.slice(0, 3).map((s, i) => (
                  <span key={i} className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-full">{s}</span>
                ))}
                {cert.skills.length > 3 && (
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded-full">
                    +{cert.skills.length - 3}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
        <div className="relative" ref={menuRef}>
          <button onClick={() => setShowMenu(!showMenu)} className="p-2 rounded-lg hover:bg-gray-100">
            <MoreVertical className="w-4 h-4 text-gray-500" />
          </button>
          <AnimatePresence>
            {showMenu && (
              <motion.div initial={{ opacity: 0, scale: 0.95, y: -10 }} animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                <button onClick={() => { onView(cert); setShowMenu(false); }}
                  className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                  <Eye className="w-4 h-4 mr-2" /> View Certificate
                </button>
                {cert.fileUrl && (
                  <a href={cert.fileUrl} target="_blank" rel="noopener noreferrer"
                    className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                    <Download className="w-4 h-4 mr-2" /> Download
                  </a>
                )}
                <button onClick={() => { onEdit(cert); setShowMenu(false); }}
                  className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                  <Edit3 className="w-4 h-4 mr-2" /> Edit
                </button>
                {!cert.verified && !cert.pendingVerification && (
                  <button onClick={() => { onVerify(cert); setShowMenu(false); }}
                    className="w-full flex items-center px-4 py-2 text-sm text-blue-600 hover:bg-blue-50">
                    <BadgeCheck className="w-4 h-4 mr-2" /> Request Verification
                  </button>
                )}
                <button onClick={() => { onShare(cert); setShowMenu(false); }}
                  className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                  <Share2 className="w-4 h-4 mr-2" /> Share
                </button>
                <button onClick={() => { onDelete(cert); setShowMenu(false); }}
                  className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                  <Trash2 className="w-4 h-4 mr-2" /> Delete
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </Card>
  );
};

// ============================================================================
// CERTIFICATION FORM
// ============================================================================

const CertificationForm = ({ cert, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    title: cert?.title || '',
    type: cert?.type || 'professional',
    issuer: cert?.issuer || '',
    issueDate: cert?.issueDate ? format(new Date(cert.issueDate), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
    expiryDate: cert?.expiryDate ? format(new Date(cert.expiryDate), 'yyyy-MM-dd') : '',
    credentialId: cert?.credentialId || '',
    credentialUrl: cert?.credentialUrl || '',
    description: cert?.description || '',
    skills: cert?.skills || [],
    fileUrl: cert?.fileUrl || '',
    storagePath: cert?.storagePath || '',
    noExpiry: cert?.noExpiry || true,
  });
  const [skillInput, setSkillInput] = useState('');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) { toast.error('Title is required'); return; }
    setSaving(true);
    try {
      await onSave(formData, file);
    } finally {
      setSaving(false);
    }
  };

  const addSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData((p) => ({ ...p, skills: [...p.skills, skillInput.trim()] }));
      setSkillInput('');
    }
  };

  const handleFileSelect = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 20 * 1024 * 1024) { toast.error('File must be under 20MB'); return; }
    setFile(f);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Certification Title *</label>
          <input type="text" value={formData.title}
            onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
            placeholder="e.g., AWS Solutions Architect Associate"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            required />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Type *</label>
          <select value={formData.type}
            onChange={(e) => setFormData((p) => ({ ...p, type: e.target.value }))}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
            {CERT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Issuing Organization *</label>
          <input type="text" value={formData.issuer}
            onChange={(e) => setFormData((p) => ({ ...p, issuer: e.target.value }))}
            placeholder="e.g., Amazon Web Services"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Issue Date</label>
          <input type="date" value={formData.issueDate}
            onChange={(e) => setFormData((p) => ({ ...p, issueDate: e.target.value }))}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
          <input type="date" value={formData.expiryDate}
            onChange={(e) => setFormData((p) => ({ ...p, expiryDate: e.target.value }))}
            disabled={formData.noExpiry}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-50 disabled:text-gray-400" />
          <label className="flex items-center space-x-2 mt-2 cursor-pointer">
            <input type="checkbox" checked={formData.noExpiry}
              onChange={(e) => setFormData((p) => ({ ...p, noExpiry: e.target.checked, expiryDate: e.target.checked ? '' : p.expiryDate }))}
              className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" />
            <span className="text-xs text-gray-600">Does not expire</span>
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Credential ID</label>
          <input type="text" value={formData.credentialId}
            onChange={(e) => setFormData((p) => ({ ...p, credentialId: e.target.value }))}
            placeholder="e.g., AWS-1234-5678"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono text-sm" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Verification URL</label>
          <input type="url" value={formData.credentialUrl}
            onChange={(e) => setFormData((p) => ({ ...p, credentialUrl: e.target.value }))}
            placeholder="https://verify.issuer.com/..."
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea value={formData.description}
            onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
            rows={3} placeholder="Details about this certification..."
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Skills / Competencies</label>
        <div className="flex items-center space-x-2">
          <input type="text" value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
            placeholder="Add a skill (e.g., Cloud Architecture)"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
          <Button type="button" variant="secondary" onClick={addSkill}>Add</Button>
        </div>
        {formData.skills.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {formData.skills.map((s) => (
              <span key={s} className="inline-flex items-center px-3 py-1 bg-indigo-100 text-indigo-800 text-sm rounded-full">
                {s}
                <button type="button" onClick={() => setFormData((p) => ({ ...p, skills: p.skills.filter((x) => x !== s) }))}
                  className="ml-2 text-indigo-600 hover:text-indigo-800">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Certificate File (PDF/Image)</label>
        <input ref={fileInputRef} type="file" onChange={handleFileSelect}
          accept=".pdf,.jpg,.jpeg,.png,.webp"
          className="hidden" />
        {!file && !formData.fileUrl ? (
          <div onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-indigo-400 transition-colors">
            <Upload className="w-8 h-8 text-gray-400 mx-auto" />
            <p className="mt-2 text-sm text-gray-600">Click to upload certificate</p>
            <p className="mt-1 text-xs text-gray-400">PDF, JPG, PNG (max 20MB)</p>
          </div>
        ) : (
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
            {formData.fileUrl && !file ? (
              <>
                <FileCheck className="w-6 h-6 text-green-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Certificate uploaded</p>
                  <a href={formData.fileUrl} target="_blank" rel="noopener noreferrer"
                    className="text-xs text-indigo-600 hover:underline">
                    View current file
                  </a>
                </div>
                <Button type="button" size="sm" variant="ghost" icon={Upload}
                  onClick={() => fileInputRef.current?.click()}>Replace</Button>
              </>
            ) : (
              <>
                <FileText className="w-6 h-6 text-indigo-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                  <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(0)} KB</p>
                </div>
                <Button type="button" size="sm" variant="ghost" onClick={() => setFile(null)}>
                  <X className="w-4 h-4" />
                </Button>
              </>
            )}
          </div>
        )}
        {uploadProgress > 0 && uploadProgress < 100 && (
          <div className="mt-2">
            <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-600 rounded-full transition-all"
                style={{ width: `${uploadProgress}%` }} />
            </div>
            <p className="mt-1 text-xs text-gray-500 text-right">{uploadProgress}%</p>
          </div>
        )}
      </div>

      <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button type="submit" loading={saving}>
          {cert ? 'Update Certification' : 'Add Certification'}
        </Button>
      </div>
    </form>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const MentorCertifications = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [certifications, setCertifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCert, setEditingCert] = useState(null);

  const mentorId = user?.uid;

  useEffect(() => {
    if (!mentorId) return;
    const q = query(
      collection(db, 'mentorCertifications'),
      where('mentorId', '==', mentorId),
      orderBy('issueDate', 'desc')
    );
    const unsub = onSnapshot(q, (snap) => {
      setCertifications(snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
        issueDate: d.data().issueDate?.toDate?.() || d.data().issueDate,
        expiryDate: d.data().expiryDate?.toDate?.() || d.data().expiryDate,
        createdAt: d.data().createdAt?.toDate?.() || new Date(d.data().createdAt || 0),
      })));
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });
    return () => unsub();
  }, [mentorId]);

  const stats = useMemo(() => {
    const now = new Date();
    const verified = certifications.filter((c) => c.verified).length;
    const pending = certifications.filter((c) => c.pendingVerification && !c.verified).length;
    const expired = certifications.filter((c) => c.expiryDate && new Date(c.expiryDate) < now).length;
    const expiringSoon = certifications.filter((c) => {
      if (!c.expiryDate) return false;
      const d = new Date(c.expiryDate);
      return d > now && differenceInDays(d, now) <= 90;
    }).length;
    const byType = {};
    certifications.forEach((c) => { byType[c.type] = (byType[c.type] || 0) + 1; });
    return { total: certifications.length, verified, pending, expired, expiringSoon, byType };
  }, [certifications]);

  const filtered = useMemo(() => {
    let r = [...certifications];
    if (activeTab === 'verified') r = r.filter((c) => c.verified);
    else if (activeTab === 'pending') r = r.filter((c) => c.pendingVerification && !c.verified);
    else if (activeTab === 'expired') {
      const now = new Date();
      r = r.filter((c) => c.expiryDate && new Date(c.expiryDate) < now);
    } else if (activeTab === 'expiring') {
      const now = new Date();
      r = r.filter((c) => {
        if (!c.expiryDate) return false;
        const d = new Date(c.expiryDate);
        return d > now && differenceInDays(d, now) <= 90;
      });
    }

    if (typeFilter !== 'all') r = r.filter((c) => c.type === typeFilter);

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      r = r.filter((c) =>
        c.title?.toLowerCase().includes(term) ||
        c.issuer?.toLowerCase().includes(term) ||
        c.skills?.some((s) => s.toLowerCase().includes(term))
      );
    }
    return r;
  }, [certifications, activeTab, typeFilter, searchTerm]);

  const handleSave = useCallback(async (data, file) => {
    if (!mentorId) return;

    let fileUrl = data.fileUrl || '';
    let storagePath = data.storagePath || '';

    if (file) {
      const path = `mentor-certifications/${mentorId}/${Date.now()}_${file.name}`;
      const storageRef = ref(storage, path);
      const task = uploadBytesResumable(storageRef, file);
      fileUrl = await new Promise((resolve, reject) => {
        task.on('state_changed', null, reject, async () => {
          const url = await getDownloadURL(task.snapshot.ref);
          resolve(url);
        });
      });
      storagePath = path;

      // Cloudinary backup
      try {
        const fd = new FormData();
        fd.append('file', file);
        fd.append('upload_preset', process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET);
        fd.append('folder', `mentor-certifications/${mentorId}`);
        const res = await fetch(
          `https://api.cloudinary.com/v1_1/${process.env.REACT_APP_CLOUDINARY_CLOUD_NAME}/auto/upload`,
          { method: 'POST', body: fd }
        );
        const cld = await res.json();
        if (cld.secure_url) fileUrl = cld.secure_url;
      } catch (e) { console.warn('Cloudinary backup failed:', e); }
    }

    const payload = {
      ...data,
      fileUrl,
      storagePath,
      issueDate: data.issueDate ? Timestamp.fromDate(new Date(data.issueDate)) : null,
      expiryDate: (!data.noExpiry && data.expiryDate) ? Timestamp.fromDate(new Date(data.expiryDate)) : null,
      mentorId,
      updatedAt: serverTimestamp(),
    };

    if (editingCert) {
      await updateDoc(doc(db, 'mentorCertifications', editingCert.id), payload);
      try {
        await supabase.from('mentor_certifications').update({
          title: data.title, issuer: data.issuer, type: data.type,
          updated_at: new Date().toISOString(),
        }).eq('firebase_id', editingCert.id);
      } catch (e) { console.warn('supabase sync', e); }
      toast.success('Certification updated');
    } else {
      payload.createdAt = serverTimestamp();
      payload.verified = false;
      payload.pendingVerification = false;
      const ref = await addDoc(collection(db, 'mentorCertifications'), payload);
      try {
        await supabase.from('mentor_certifications').insert({
          firebase_id: ref.id, mentor_id: mentorId,
          title: data.title, issuer: data.issuer, type: data.type,
          issue_date: data.issueDate, expiry_date: data.noExpiry ? null : data.expiryDate,
          credential_id: data.credentialId, file_url: fileUrl,
          verified: false, created_at: new Date().toISOString(),
        });
      } catch (e) { console.warn('supabase sync', e); }
      toast.success('Certification added');
    }

    setIsFormOpen(false);
    setEditingCert(null);
  }, [mentorId, editingCert]);

  const handleDelete = useCallback(async (cert) => {
    if (!window.confirm('Delete this certification?')) return;
    try {
      if (cert.storagePath) {
        try { await deleteObject(ref(storage, cert.storagePath)); } catch (e) {}
      }
      await deleteDoc(doc(db, 'mentorCertifications', cert.id));
      try { await supabase.from('mentor_certifications').delete().eq('firebase_id', cert.id); } catch (e) {}
      toast.success('Certification deleted');
    } catch (e) { toast.error('Failed to delete'); }
  }, []);

  const handleVerifyRequest = useCallback(async (cert) => {
    try {
      await updateDoc(doc(db, 'mentorCertifications', cert.id), {
        pendingVerification: true,
        verificationRequestedAt: serverTimestamp(),
      });
      await addDoc(collection(db, 'verificationRequests'), {
        type: 'certification',
        certId: cert.id,
        mentorId,
        certTitle: cert.title,
        issuer: cert.issuer,
        credentialId: cert.credentialId,
        credentialUrl: cert.credentialUrl,
        status: 'pending',
        createdAt: serverTimestamp(),
      });
      toast.success('Verification requested');
    } catch (e) { toast.error('Failed to request verification'); }
  }, [mentorId]);

  const handleShare = useCallback((cert) => {
    const url = `${window.location.origin}/mentor/certifications/${cert.id}`;
    if (navigator.share) {
      navigator.share({ title: cert.title, text: `${cert.title} - ${cert.issuer}`, url }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
      toast.success('Link copied!');
    }
  }, []);

  const handleView = useCallback((cert) => {
    if (cert.fileUrl) window.open(cert.fileUrl, '_blank');
    else toast.info('No file uploaded for this certification');
  }, []);

  if (authLoading || loading) return <LoadingSpinner />;
  if (!user) { navigate('/login'); return null; }

  const tabs = [
    { id: 'all', label: 'All', count: stats.total },
    { id: 'verified', label: 'Verified', count: stats.verified },
    { id: 'pending', label: 'Pending', count: stats.pending },
    { id: 'expiring', label: 'Expiring Soon', count: stats.expiringSoon },
    { id: 'expired', label: 'Expired', count: stats.expired },
  ];

  const typeChartData = Object.entries(stats.byType).map(([k, v]) => ({
    name: getCertConfig(k).label,
    value: v,
  }));
  const CHART_COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#ef4444', '#84cc16'];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link to="/mentor/dashboard" className="p-2 rounded-lg hover:bg-gray-100">
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </Link>
              <h1 className="text-lg font-semibold text-gray-900">Certifications & Credentials</h1>
            </div>
            <div className="flex items-center space-x-3">
              <div className="hidden md:flex items-center bg-gray-100 rounded-lg p-1">
                <button onClick={() => setViewMode('grid')}
                  className={cn('px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
                    viewMode === 'grid' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600')}>Grid</button>
                <button onClick={() => setViewMode('list')}
                  className={cn('px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
                    viewMode === 'list' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600')}>List</button>
              </div>
              <Button icon={Plus} onClick={() => { setEditingCert(null); setIsFormOpen(true); }}>
                Add Certification
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase">Total</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="w-11 h-11 bg-indigo-100 rounded-lg flex items-center justify-center">
                <Award className="w-5 h-5 text-indigo-600" />
              </div>
            </div>
          </Card>
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase">Verified</p>
                <p className="mt-1 text-2xl font-bold text-green-600">{stats.verified}</p>
              </div>
              <div className="w-11 h-11 bg-green-100 rounded-lg flex items-center justify-center">
                <BadgeCheck className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </Card>
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase">Expiring Soon</p>
                <p className="mt-1 text-2xl font-bold text-yellow-600">{stats.expiringSoon}</p>
              </div>
              <div className="w-11 h-11 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
            </div>
          </Card>
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase">Expired</p>
                <p className="mt-1 text-2xl font-bold text-red-600">{stats.expired}</p>
              </div>
              <div className="w-11 h-11 bg-red-100 rounded-lg flex items-center justify-center">
                <ShieldAlert className="w-5 h-5 text-red-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Type distribution */}
        {typeChartData.length > 0 && (
          <Card className="p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Certifications by Type</h2>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={typeChartData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis type="number" tick={{ fontSize: 12 }} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={140} />
                  <Tooltip />
                  <Bar dataKey="value" name="Count" radius={[0, 4, 4, 0]}>
                    {typeChartData.map((_, idx) => (
                      <Cell key={idx} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        )}

        {/* Filters */}
        <Card className="p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center space-x-1 overflow-x-auto">
              {tabs.map((t) => (
                <button key={t.id} onClick={() => setActiveTab(t.id)}
                  className={cn('flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap',
                    activeTab === t.id ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-100')}>
                  <span>{t.label}</span>
                  <span className={cn('px-1.5 py-0.5 text-xs rounded-full',
                    activeTab === t.id ? 'bg-white bg-opacity-20' : 'bg-gray-200')}>{t.count}</span>
                </button>
              ))}
            </div>
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="text" placeholder="Search..." value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm w-56" />
              </div>
              <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm">
                <option value="all">All Types</option>
                {CERT_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
          </div>
        </Card>

        {filtered.length === 0 ? (
          <Card className="p-12">
            <div className="text-center">
              <Award className="w-16 h-16 text-gray-300 mx-auto" />
              <h3 className="mt-4 text-lg font-semibold text-gray-900">
                {searchTerm || activeTab !== 'all' ? 'No matching certifications' : 'No certifications yet'}
              </h3>
              <p className="mt-2 text-gray-500 max-w-sm mx-auto">
                {searchTerm || activeTab !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Add your certifications and credentials to build trust with mentees.'}
              </p>
              {!searchTerm && activeTab === 'all' && (
                <Button className="mt-6" icon={Plus} onClick={() => { setEditingCert(null); setIsFormOpen(true); }}>
                  Add Your First Certification
                </Button>
              )}
            </div>
          </Card>
        ) : (
          <div className={cn(viewMode === 'grid'
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
            : 'space-y-4')}>
            {filtered.map((c) => (
              <CertificationCard key={c.id} cert={c}
                onView={handleView}
                onEdit={(cert) => { setEditingCert(cert); setIsFormOpen(true); }}
                onDelete={handleDelete}
                onVerify={handleVerifyRequest}
                onShare={handleShare} />
            ))}
          </div>
        )}
      </main>

      <Modal isOpen={isFormOpen}
        onClose={() => { setIsFormOpen(false); setEditingCert(null); }}
        title={editingCert ? 'Edit Certification' : 'Add Certification'} size="lg">
        <CertificationForm cert={editingCert} onSave={handleSave}
          onCancel={() => { setIsFormOpen(false); setEditingCert(null); }} />
      </Modal>
    </div>
  );
};

export default MentorCertifications;
