import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc,
  query, where, orderBy, limit, onSnapshot, serverTimestamp,
  Timestamp, writeBatch, increment, arrayUnion, arrayRemove
} from 'firebase/firestore';
import {
  ref, uploadBytesResumable, getDownloadURL, deleteObject
} from 'firebase/storage';
import { db, storage, auth } from '../../config/firebase';
import { supabase } from '../../config/supabase';
import { useAuth } from '../../hooks/useAuth';
import {
  FileText, File, Folder, FolderOpen, Upload, Download, Plus,
  Edit3, Trash2, Eye, MoreVertical, MoreHorizontal, Search, Filter,
  X, Check, Copy, Link as LinkIcon, ExternalLink, Share2, Star,
  Bookmark, Tag, Hash, Image as ImageIcon, Video, Music, Mic,
  FileSpreadsheet, FilePlus, FileMinus, FileArchive, FileCode,
  Presentation, FileImage, FileVideo, FileAudio, FileJson,
  FileText as FilePdf, Loader2, AlertCircle, CheckCircle, Info, HelpCircle,
  ChevronLeft, ChevronRight, ChevronDown, ChevronUp, RefreshCw,
  Grid, List, LayoutGrid, SlidersHorizontal, Clock, Calendar,
  User as UserIcon, Users, Download as DownloadIcon, Upload as UploadIcon,
  Lock, Unlock, Eye as EyeIcon, EyeOff, Globe, Shield, Key,
  Bell, Settings, Menu, Home, LogOut, Archive, Pin, Flag, Ban,
  Send, Paperclip, Sparkles, Zap, Rocket, Lightbulb, Brain,
  BookOpen, GraduationCap, Award, Trophy, Crown, Medal, Flame,
  Target, TrendingUp, BarChart3, PieChart, Activity, Package,
  Box, Gift, Gem, Diamond, Coins, DollarSign, CreditCard, Wallet,
  Play, Pause, Square, Volume2, VolumeX, Maximize, Minimize,
  ThumbsUp, ThumbsDown, Heart, MessageSquare, Share, MoreVertical as MoreVIcon
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, PieChart as RechartsPieChart,
  Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, AreaChart, Area
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
  format, formatDistanceToNow, differenceInDays, subDays, startOfMonth
} from 'date-fns';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const cn = (...inputs) => twMerge(clsx(inputs));

const formatFileSize = (bytes) => {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
};

const getFileIcon = (type, filename = '') => {
  const ext = filename.split('.').pop()?.toLowerCase();
  if (type?.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) {
    return { icon: ImageIcon, color: 'text-pink-600', bg: 'bg-pink-100' };
  }
  if (type?.startsWith('video/') || ['mp4', 'mov', 'avi', 'webm'].includes(ext)) {
    return { icon: Video, color: 'text-red-600', bg: 'bg-red-100' };
  }
  if (type?.startsWith('audio/') || ['mp3', 'wav', 'ogg'].includes(ext)) {
    return { icon: Music, color: 'text-purple-600', bg: 'bg-purple-100' };
  }
  if (['pdf'].includes(ext)) {
    return { icon: FilePdf, color: 'text-red-600', bg: 'bg-red-100' };
  }
  if (['doc', 'docx'].includes(ext)) {
    return { icon: FileText, color: 'text-blue-600', bg: 'bg-blue-100' };
  }
  if (['xls', 'xlsx', 'csv'].includes(ext)) {
    return { icon: FileSpreadsheet, color: 'text-green-600', bg: 'bg-green-100' };
  }
  if (['ppt', 'pptx'].includes(ext)) {
    return { icon: Presentation, color: 'text-orange-600', bg: 'bg-orange-100' };
  }
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) {
    return { icon: FileArchive, color: 'text-yellow-600', bg: 'bg-yellow-100' };
  }
  if (['js', 'jsx', 'ts', 'tsx', 'py', 'java', 'cpp', 'html', 'css'].includes(ext)) {
    return { icon: FileCode, color: 'text-indigo-600', bg: 'bg-indigo-100' };
  }
  if (['json', 'xml', 'yaml', 'yml'].includes(ext)) {
    return { icon: FileJson, color: 'text-teal-600', bg: 'bg-teal-100' };
  }
  return { icon: File, color: 'text-gray-600', bg: 'bg-gray-100' };
};

const RESOURCE_CATEGORIES = [
  { value: 'career', label: 'Career Development', icon: TrendingUp, color: 'blue' },
  { value: 'technical', label: 'Technical Skills', icon: FileCode, color: 'indigo' },
  { value: 'soft_skills', label: 'Soft Skills', icon: Heart, color: 'pink' },
  { value: 'interview', label: 'Interview Prep', icon: MessageSquare, color: 'purple' },
  { value: 'resume', label: 'Resume & CV', icon: FileText, color: 'green' },
  { value: 'leadership', label: 'Leadership', icon: Crown, color: 'yellow' },
  { value: 'entrepreneurship', label: 'Entrepreneurship', icon: Rocket, color: 'orange' },
  { value: 'finance', label: 'Finance', icon: DollarSign, color: 'emerald' },
  { value: 'wellness', label: 'Wellness', icon: Heart, color: 'rose' },
  { value: 'other', label: 'Other', icon: Package, color: 'gray' },
];

// ============================================================================
// COMPONENTS
// ============================================================================

const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-50">
    <div className="text-center">
      <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto" />
      <p className="mt-4 text-gray-600 font-medium">Loading resources...</p>
    </div>
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
  const sizes = {
    sm: 'px-3 py-1.5 text-sm', md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base', xl: 'px-8 py-4 text-lg',
  };
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center font-medium rounded-lg transition-colors',
        'focus:outline-none focus:ring-2 focus:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant], sizes[size], className
      )}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> :
        Icon ? <Icon className={cn('w-4 h-4', children && 'mr-2')} /> : null}
      {children}
    </button>
  );
};

const Card = ({ children, className, onClick, hover = false }) => (
  <div onClick={onClick} className={cn(
    'bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden',
    hover && 'hover:shadow-lg transition-shadow cursor-pointer', className
  )}>
    {children}
  </div>
);

const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;
  const sizes = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }} onClick={(e) => e.stopPropagation()}
          className={cn('bg-white rounded-xl shadow-xl w-full max-h-[90vh] overflow-y-auto', sizes[size])}
        >
          <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 transition-colors">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          <div className="p-6">{children}</div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

const ProgressBar = ({ value, max = 100, size = 'sm' }) => {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div className={cn('w-full bg-gray-200 rounded-full overflow-hidden', size === 'sm' ? 'h-1.5' : 'h-2')}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.3 }}
        className="h-full bg-indigo-600 rounded-full"
      />
    </div>
  );
};

// ============================================================================
// RESOURCE CARD
// ============================================================================

const ResourceCard = ({ resource, onView, onEdit, onDelete, onShare, viewMode }) => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setShowMenu(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fileInfo = getFileIcon(resource.type, resource.name || resource.title || '');
  const FileIcon = fileInfo.icon;
  const category = RESOURCE_CATEGORIES.find((c) => c.value === resource.category);

  if (viewMode === 'list') {
    return (
      <Card className="p-4 hover:shadow-md transition-shadow">
        <div className="flex items-center space-x-4">
          <div className={cn('w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0', fileInfo.bg)}>
            <FileIcon className={cn('w-6 h-6', fileInfo.color)} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <h3 className="font-medium text-gray-900 truncate">{resource.title}</h3>
              {resource.pinned && <Pin className="w-3.5 h-3.5 text-yellow-500 fill-current" />}
            </div>
            <div className="mt-1 flex items-center space-x-4 text-xs text-gray-500">
              {category && (
                <span className="flex items-center">
                  <category.icon className="w-3 h-3 mr-1" />
                  {category.label}
                </span>
              )}
              <span className="flex items-center">
                <Download className="w-3 h-3 mr-1" />
                {resource.downloads || 0} downloads
              </span>
              <span>{format(new Date(resource.createdAt?.toDate?.() || resource.createdAt), 'MMM d, yyyy')}</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button size="sm" variant="ghost" icon={Download} onClick={() => onView(resource)} />
            <div className="relative" ref={menuRef}>
              <button onClick={() => setShowMenu(!showMenu)} className="p-2 rounded-lg hover:bg-gray-100">
                <MoreVertical className="w-4 h-4 text-gray-500" />
              </button>
              <AnimatePresence>
                {showMenu && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="absolute right-0 mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20"
                  >
                    <button onClick={() => { onView(resource); setShowMenu(false); }}
                      className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      <Download className="w-4 h-4 mr-2" /> Download
                    </button>
                    <button onClick={() => { onShare(resource); setShowMenu(false); }}
                      className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      <Share2 className="w-4 h-4 mr-2" /> Share
                    </button>
                    <button onClick={() => { onEdit(resource); setShowMenu(false); }}
                      className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      <Edit3 className="w-4 h-4 mr-2" /> Edit
                    </button>
                    <button onClick={() => { onDelete(resource); setShowMenu(false); }}
                      className="w-full flex items-center px-3 py-2 text-sm text-red-600 hover:bg-red-50">
                      <Trash2 className="w-4 h-4 mr-2" /> Delete
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className={cn('w-12 h-12 rounded-lg flex items-center justify-center', fileInfo.bg)}>
          <FileIcon className={cn('w-6 h-6', fileInfo.color)} />
        </div>
        <div className="relative" ref={menuRef}>
          <button onClick={() => setShowMenu(!showMenu)} className="p-1 rounded hover:bg-gray-100">
            <MoreVertical className="w-4 h-4 text-gray-500" />
          </button>
          <AnimatePresence>
            {showMenu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="absolute right-0 mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20"
              >
                <button onClick={() => { onView(resource); setShowMenu(false); }}
                  className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                  <Download className="w-4 h-4 mr-2" /> Download
                </button>
                <button onClick={() => { onShare(resource); setShowMenu(false); }}
                  className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                  <Share2 className="w-4 h-4 mr-2" /> Share
                </button>
                <button onClick={() => { onEdit(resource); setShowMenu(false); }}
                  className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                  <Edit3 className="w-4 h-4 mr-2" /> Edit
                </button>
                <button onClick={() => { onDelete(resource); setShowMenu(false); }}
                  className="w-full flex items-center px-3 py-2 text-sm text-red-600 hover:bg-red-50">
                  <Trash2 className="w-4 h-4 mr-2" /> Delete
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <h3 className="mt-4 font-semibold text-gray-900 truncate">{resource.title}</h3>
      {resource.description && (
        <p className="mt-1 text-sm text-gray-500 line-clamp-2">{resource.description}</p>
      )}

      {category && (
        <span className={cn('inline-flex items-center mt-3 px-2 py-1 text-xs font-medium rounded-full',
          category.color === 'blue' && 'bg-blue-100 text-blue-800',
          category.color === 'indigo' && 'bg-indigo-100 text-indigo-800',
          category.color === 'pink' && 'bg-pink-100 text-pink-800',
          category.color === 'purple' && 'bg-purple-100 text-purple-800',
          category.color === 'green' && 'bg-green-100 text-green-800',
          category.color === 'yellow' && 'bg-yellow-100 text-yellow-800',
          category.color === 'orange' && 'bg-orange-100 text-orange-800',
          category.color === 'emerald' && 'bg-emerald-100 text-emerald-800',
          category.color === 'rose' && 'bg-rose-100 text-rose-800',
          category.color === 'gray' && 'bg-gray-100 text-gray-800'
        )}>
          <category.icon className="w-3 h-3 mr-1" />
          {category.label}
        </span>
      )}

      <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
        <span className="flex items-center">
          <Download className="w-3 h-3 mr-1" />
          {resource.downloads || 0}
        </span>
        <span>{format(new Date(resource.createdAt?.toDate?.() || resource.createdAt), 'MMM d')}</span>
      </div>
    </Card>
  );
};

// ============================================================================
// UPLOAD FORM
// ============================================================================

const ResourceUploadForm = ({ resource, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    title: resource?.title || '',
    description: resource?.description || '',
    category: resource?.category || 'career',
    tags: resource?.tags || [],
    visibility: resource?.visibility || 'all_mentees',
    allowDownload: resource?.allowDownload !== false,
  });
  const [file, setFile] = useState(null);
  const [tagInput, setTagInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) { toast.error('Title is required'); return; }
    if (!resource && !file) { toast.error('Please select a file'); return; }

    setSaving(true);
    try {
      await onSave(formData, file, setUploadProgress);
      toast.success(resource ? 'Resource updated' : 'Resource uploaded');
    } catch (error) {
      toast.error('Failed to save resource');
    } finally {
      setSaving(false);
      setUploadProgress(0);
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData((prev) => ({ ...prev, tags: [...prev.tags, tagInput.trim()] }));
      setTagInput('');
    }
  };

  const fileInfo = file ? getFileIcon(file.type, file.name) : null;
  const FileIcon = fileInfo?.icon || File;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {!resource && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">File *</label>
          <div
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              'border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors',
              file ? 'border-indigo-400 bg-indigo-50' : 'border-gray-300 hover:border-indigo-400'
            )}
          >
            <input
              ref={fileInputRef}
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="hidden"
              accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.csv,.txt,.md,.jpg,.jpeg,.png,.gif,.webp,.svg,.mp4,.mov,.webm,.mp3,.wav,.zip,.rar"
            />
            {file ? (
              <div className="flex items-center justify-center space-x-3">
                <FileIcon className="w-8 h-8 text-indigo-600" />
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-900">{file.name}</p>
                  <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                </div>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setFile(null); }}
                  className="p-1 hover:bg-indigo-100 rounded"
                >
                  <X className="w-4 h-4 text-indigo-600" />
                </button>
              </div>
            ) : (
              <>
                <Upload className="w-10 h-10 text-gray-400 mx-auto" />
                <p className="mt-2 text-sm text-gray-600">
                  Click to upload or drag and drop
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  PDF, DOC, PPT, XLS, Images, Video, Audio (max 50MB)
                </p>
              </>
            )}
          </div>
          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="mt-2">
              <ProgressBar value={uploadProgress} />
              <p className="mt-1 text-xs text-gray-500 text-right">{uploadProgress}%</p>
            </div>
          )}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
          placeholder="e.g., Resume Writing Guide"
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
          placeholder="What is this resource about?"
          rows={3}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {RESOURCE_CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              type="button"
              onClick={() => setFormData((prev) => ({ ...prev, category: cat.value }))}
              className={cn(
                'flex items-center space-x-2 p-2.5 rounded-lg border-2 transition-all text-left',
                formData.category === cat.value
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-gray-200 hover:border-gray-300'
              )}
            >
              <cat.icon className={cn('w-4 h-4 flex-shrink-0',
                formData.category === cat.value ? 'text-indigo-600' : 'text-gray-500')} />
              <span className="text-xs font-medium text-gray-700 truncate">{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
            placeholder="Add a tag"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
          <Button type="button" variant="secondary" onClick={handleAddTag}>Add</Button>
        </div>
        {formData.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {formData.tags.map((tag) => (
              <span key={tag} className="inline-flex items-center px-3 py-1 bg-indigo-100 text-indigo-800 text-sm rounded-full">
                {tag}
                <button type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, tags: prev.tags.filter((t) => t !== tag) }))}
                  className="ml-2 text-indigo-600 hover:text-indigo-800">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Visibility</label>
          <select
            value={formData.visibility}
            onChange={(e) => setFormData((prev) => ({ ...prev, visibility: e.target.value }))}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="all_mentees">All Mentees</option>
            <option value="selected">Selected Mentees</option>
            <option value="private">Private</option>
          </select>
        </div>
        <div className="flex items-end">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.allowDownload}
              onChange={(e) => setFormData((prev) => ({ ...prev, allowDownload: e.target.checked }))}
              className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
            />
            <span className="text-sm text-gray-700">Allow mentees to download</span>
          </label>
        </div>
      </div>

      <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button type="submit" loading={saving}>
          {resource ? 'Update Resource' : 'Upload Resource'}
        </Button>
      </div>
    </form>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const MentorResources = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingResource, setEditingResource] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const mentorId = user?.uid;

  // Fetch resources
  useEffect(() => {
    if (!mentorId) return;

    const q = query(
      collection(db, 'mentorResources'),
      where('mentorId', '==', mentorId),
      orderBy('createdAt', 'desc')
    );

    const unsub = onSnapshot(q, (snapshot) => {
      setResources(snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || new Date(doc.data().createdAt),
      })));
      setLoading(false);
    }, (error) => {
      console.error('Resources error:', error);
      setLoading(false);
    });

    return () => unsub();
  }, [mentorId]);

  // Stats
  const stats = useMemo(() => {
    const totalDownloads = resources.reduce((sum, r) => sum + (r.downloads || 0), 0);
    const totalSize = resources.reduce((sum, r) => sum + (r.size || 0), 0);
    const byCategory = {};
    resources.forEach((r) => {
      byCategory[r.category || 'other'] = (byCategory[r.category || 'other'] || 0) + 1;
    });

    return { total: resources.length, totalDownloads, totalSize, byCategory };
  }, [resources]);

  // Filtered resources
  const filteredResources = useMemo(() => {
    let filtered = [...resources];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.title?.toLowerCase().includes(term) ||
          r.description?.toLowerCase().includes(term) ||
          r.tags?.some((t) => t.toLowerCase().includes(term))
      );
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter((r) => r.category === categoryFilter);
    }

    if (sortBy === 'recent') filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    else if (sortBy === 'oldest') filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    else if (sortBy === 'downloads') filtered.sort((a, b) => (b.downloads || 0) - (a.downloads || 0));
    else if (sortBy === 'name') filtered.sort((a, b) => (a.title || '').localeCompare(b.title || ''));

    return filtered;
  }, [resources, searchTerm, categoryFilter, sortBy]);

  // Handlers
  const handleSave = useCallback(async (formData, file, setProgress) => {
    if (!mentorId) return;

    let fileUrl = editingResource?.url || '';
    let storagePath = editingResource?.storagePath || '';
    let cloudinaryPublicId = editingResource?.cloudinaryPublicId || '';
    let fileName = editingResource?.name || '';
    let fileType = editingResource?.type || '';
    let fileSize = editingResource?.size || 0;

    if (file) {
      // Upload to Firebase Storage
      const storageRef = ref(storage, `mentor-resources/${mentorId}/${Date.now()}_${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      fileUrl = await new Promise((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            if (setProgress) setProgress(Math.round(progress));
          },
          reject,
          async () => {
            const url = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(url);
          }
        );
      });

      storagePath = storageRef.fullPath;
      fileName = file.name;
      fileType = file.type;
      fileSize = file.size;

      // Backup to Cloudinary
      try {
        const fd = new FormData();
        fd.append('file', file);
        fd.append('upload_preset', process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET);
        fd.append('folder', `mentor-resources/${mentorId}`);
        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${process.env.REACT_APP_CLOUDINARY_CLOUD_NAME}/auto/upload`,
          { method: 'POST', body: fd }
        );
        const cloudData = await response.json();
        if (cloudData.public_id) cloudinaryPublicId = cloudData.public_id;
      } catch (cloudErr) {
        console.warn('Cloudinary backup failed:', cloudErr);
      }
    }

    const dataToSave = {
      ...formData,
      url: fileUrl,
      storagePath,
      cloudinaryPublicId,
      name: fileName,
      type: fileType,
      size: fileSize,
      mentorId,
      updatedAt: serverTimestamp(),
    };

    if (editingResource) {
      await updateDoc(doc(db, 'mentorResources', editingResource.id), dataToSave);
      try {
        await supabase.from('mentor_resources').update({
          title: formData.title,
          description: formData.description,
          category: formData.category,
          updated_at: new Date().toISOString(),
        }).eq('firebase_id', editingResource.id);
      } catch (e) { console.warn('Supabase sync failed:', e); }
    } else {
      dataToSave.createdAt = serverTimestamp();
      dataToSave.downloads = 0;
      const docRef = await addDoc(collection(db, 'mentorResources'), dataToSave);

      try {
        await supabase.from('mentor_resources').insert({
          firebase_id: docRef.id,
          mentor_id: mentorId,
          title: formData.title,
          description: formData.description,
          category: formData.category,
          url: fileUrl,
          type: fileType,
          size: fileSize,
          created_at: new Date().toISOString(),
        });
      } catch (e) { console.warn('Supabase sync failed:', e); }
    }

    setIsFormOpen(false);
    setEditingResource(null);
  }, [mentorId, editingResource]);

  const handleDelete = useCallback(async (resource) => {
    if (!window.confirm('Delete this resource permanently?')) return;

    try {
      // Delete from Firebase Storage
      if (resource.storagePath) {
        try { await deleteObject(ref(storage, resource.storagePath)); }
        catch (e) { console.warn('Storage delete failed:', e); }
      }

      // Delete from Cloudinary
      if (resource.cloudinaryPublicId) {
        try {
          await fetch('/api/cloudinary/delete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ publicId: resource.cloudinaryPublicId }),
          });
        } catch (e) { console.warn('Cloudinary delete failed:', e); }
      }

      await deleteDoc(doc(db, 'mentorResources', resource.id));

      try {
        await supabase.from('mentor_resources').delete().eq('firebase_id', resource.id);
      } catch (e) { console.warn('Supabase delete failed:', e); }

      toast.success('Resource deleted');
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete resource');
    }
  }, []);

  const handleDownload = useCallback(async (resource) => {
    try {
      // Increment download count
      await updateDoc(doc(db, 'mentorResources', resource.id), {
        downloads: increment(1),
      });

      // Open URL
      window.open(resource.url, '_blank');
      toast.success('Downloading...');
    } catch (error) {
      toast.error('Failed to download');
    }
  }, []);

  const handleShare = useCallback(async (resource) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: resource.title,
          text: resource.description,
          url: resource.url,
        });
      } catch (e) { /* user cancelled */ }
    } else {
      await navigator.clipboard.writeText(resource.url);
      toast.success('Link copied to clipboard');
    }
  }, []);

  if (authLoading || loading) return <LoadingSpinner />;
  if (!user) { navigate('/login'); return null; }

  const categoriesWithCounts = [
    { value: 'all', label: 'All Resources', count: stats.total },
    ...RESOURCE_CATEGORIES.map((c) => ({
      ...c,
      count: stats.byCategory[c.value] || 0,
    })).filter((c) => c.count > 0),
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link to="/mentor/dashboard" className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </Link>
              <h1 className="text-lg font-semibold text-gray-900">Resource Library</h1>
            </div>
            <div className="flex items-center space-x-3">
              <div className="hidden md:flex items-center bg-gray-100 rounded-lg p-1">
                <button onClick={() => setViewMode('grid')}
                  className={cn('p-2 rounded-md transition-colors',
                    viewMode === 'grid' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600')}>
                  <Grid className="w-4 h-4" />
                </button>
                <button onClick={() => setViewMode('list')}
                  className={cn('p-2 rounded-md transition-colors',
                    viewMode === 'list' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600')}>
                  <List className="w-4 h-4" />
                </button>
              </div>
              <Button icon={Plus} onClick={() => { setEditingResource(null); setIsFormOpen(true); }}>
                Upload Resource
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
                <p className="text-sm font-medium text-gray-500">Total Resources</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-indigo-600" />
              </div>
            </div>
          </Card>
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Downloads</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">{stats.totalDownloads}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Download className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </Card>
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Storage Used</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">{formatFileSize(stats.totalSize)}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Database className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </Card>
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Categories</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">{Object.keys(stats.byCategory).length}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Folder className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center space-x-2 overflow-x-auto">
              {categoriesWithCounts.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setCategoryFilter(cat.value)}
                  className={cn(
                    'flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap',
                    categoryFilter === cat.value
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'
                  )}
                >
                  {cat.value !== 'all' && <cat.icon className="w-4 h-4" />}
                  <span>{cat.label}</span>
                  <span className={cn('px-1.5 py-0.5 text-xs rounded-full',
                    categoryFilter === cat.value ? 'bg-white bg-opacity-20' : 'bg-gray-100')}>
                    {cat.count}
                  </span>
                </button>
              ))}
            </div>
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm w-56"
                />
              </div>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm">
                <option value="recent">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="downloads">Most Downloaded</option>
                <option value="name">Name (A-Z)</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Resources */}
        {filteredResources.length === 0 ? (
          <Card className="p-12">
            <div className="text-center">
              <FileText className="w-16 h-16 text-gray-300 mx-auto" />
              <h3 className="mt-4 text-lg font-semibold text-gray-900">
                {searchTerm || categoryFilter !== 'all' ? 'No matching resources' : 'No resources yet'}
              </h3>
              <p className="mt-2 text-gray-500 max-w-sm mx-auto">
                {searchTerm || categoryFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Upload your first resource to share with your mentees.'}
              </p>
              {!searchTerm && categoryFilter === 'all' && (
                <Button className="mt-6" icon={Plus} onClick={() => { setEditingResource(null); setIsFormOpen(true); }}>
                  Upload Resource
                </Button>
              )}
            </div>
          </Card>
        ) : (
          <div className={cn(
            viewMode === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
              : 'space-y-3'
          )}>
            {filteredResources.map((resource) => (
              <ResourceCard
                key={resource.id}
                resource={resource}
                viewMode={viewMode}
                onView={handleDownload}
                onEdit={(r) => { setEditingResource(r); setIsFormOpen(true); }}
                onDelete={handleDelete}
                onShare={handleShare}
              />
            ))}
          </div>
        )}
      </main>

      <Modal
        isOpen={isFormOpen}
        onClose={() => { setIsFormOpen(false); setEditingResource(null); }}
        title={editingResource ? 'Edit Resource' : 'Upload Resource'}
        size="lg"
      >
        <ResourceUploadForm
          resource={editingResource}
          onSave={handleSave}
          onCancel={() => { setIsFormOpen(false); setEditingResource(null); }}
        />
      </Modal>
    </div>
  );
};

export default MentorResources;
