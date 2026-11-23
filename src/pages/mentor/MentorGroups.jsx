import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc,
  query, where, orderBy, limit, onSnapshot, serverTimestamp,
  Timestamp, writeBatch, increment, arrayUnion, arrayRemove
} from 'firebase/firestore';
import { db, auth } from '../../config/firebase';
import { supabaseMediaService } from '../../services/supabaseMediaService';
import { supabase } from '../../config/supabase';
import { useAuth } from '../../hooks/useAuth';
import {
  Users, Users2, UserPlus, UserMinus, UserCheck, UserX, Crown,
  Shield, Star, Award, Trophy, Medal, Flame, Zap, Sparkles,
  Rocket, Target, TrendingUp, BarChart3, PieChart, Activity,
  MessageSquare, Send, Video, Mic, MicOff, Headphones, Speaker,
  Calendar, Clock, Timer, Hourglass, Settings, Bell, BellOff,
  BellRing, Search, Filter, Plus, Edit3, Trash2, Eye, EyeOff,
  MoreVertical, MoreHorizontal, X, Check, Copy, Link as LinkIcon,
  Share2, ExternalLink, Globe, Lock, Unlock, Key, Fingerprint,
  Hash, AtSign, Tag, Bookmark, Pin, Flag, Ban, Slash,
  ChevronLeft, ChevronRight, ChevronDown, ChevronUp, ArrowRight,
  ArrowLeft, ArrowUpRight, ArrowDownRight, Loader2, AlertCircle,
  Info, HelpCircle, CheckCircle, XCircle, Home, Menu, LogOut,
  Mail, Phone, MapPin, Building2, Briefcase, GraduationCap,
  BookOpen, Presentation, Folder, FolderOpen, FileText, FilePlus,
  FileMinus, FileSpreadsheet, FileVideo, FileAudio, Image as ImageIcon,
  Download, Upload, CloudUpload, CloudDownload, Database, Server,
  HardDrive, Cpu, MemoryStick, Wifi, Bluetooth, Battery, Plug,
  Power, ToggleLeft, ToggleRight, Sliders, Gauge, Play, Pause, Square, Volume2, VolumeX, Maximize, Minimize,
  Mic2, Radio, Tv, Monitor, Smartphone, Tablet, Laptop, Monitor as Desktop,
  Sun, Moon, Cloud, CloudRain, Wind, Droplets, Thermometer,
  Heart, ThumbsUp, ThumbsDown, Smile, Frown, Meh, Laugh,
  Handshake, Lightbulb, Brain, Compass, Map, Navigation, Anchor,
  Route, GitBranch, Network, Workflow, Puzzle, Component, Boxes,
  Package, Box, Archive, Inbox, Send as SendIcon, Paperclip,
  Camera, Video as VideoIcon, Palette, Brush, Pen, PenTool,
  Ruler, Compass as CompassIcon, Sparkle, Diamond, Gem, Gift
} from 'lucide-react';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  PieChart as RechartsPieChart, Pie, Cell, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  RadialBarChart, RadialBar, ComposedChart
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
  format, formatDistanceToNow, isToday, isYesterday, differenceInDays,
  isFuture, isPast
} from 'date-fns';
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

const GROUP_COLORS = ['indigo', 'purple', 'pink', 'rose', 'orange', 'amber', 'green', 'teal', 'blue', 'cyan'];

const getGroupColorClasses = (color, variant = 'bg') => {
  const map = {
    indigo: { bg: 'bg-indigo-100', text: 'text-indigo-700', solid: 'bg-indigo-600', grad: 'from-indigo-500 to-purple-600' },
    purple: { bg: 'bg-purple-100', text: 'text-purple-700', solid: 'bg-purple-600', grad: 'from-purple-500 to-pink-600' },
    pink: { bg: 'bg-pink-100', text: 'text-pink-700', solid: 'bg-pink-600', grad: 'from-pink-500 to-rose-600' },
    rose: { bg: 'bg-rose-100', text: 'text-rose-700', solid: 'bg-rose-600', grad: 'from-rose-500 to-orange-600' },
    orange: { bg: 'bg-orange-100', text: 'text-orange-700', solid: 'bg-orange-600', grad: 'from-orange-500 to-amber-600' },
    amber: { bg: 'bg-amber-100', text: 'text-amber-700', solid: 'bg-amber-600', grad: 'from-amber-500 to-yellow-600' },
    green: { bg: 'bg-green-100', text: 'text-green-700', solid: 'bg-green-600', grad: 'from-green-500 to-emerald-600' },
    teal: { bg: 'bg-teal-100', text: 'text-teal-700', solid: 'bg-teal-600', grad: 'from-teal-500 to-cyan-600' },
    blue: { bg: 'bg-blue-100', text: 'text-blue-700', solid: 'bg-blue-600', grad: 'from-blue-500 to-indigo-600' },
    cyan: { bg: 'bg-cyan-100', text: 'text-cyan-700', solid: 'bg-cyan-600', grad: 'from-cyan-500 to-blue-600' },
  };
  return map[color] || map.indigo;
};

const getMemberRoleConfig = (role) => ({
  leader: { label: 'Leader', color: 'bg-yellow-100 text-yellow-800', icon: Crown },
  moderator: { label: 'Moderator', color: 'bg-purple-100 text-purple-800', icon: Shield },
  mentor: { label: 'Mentor', color: 'bg-indigo-100 text-indigo-800', icon: Star },
  member: { label: 'Member', color: 'bg-gray-100 text-gray-800', icon: Users },
}[role] || { label: 'Member', color: 'bg-gray-100 text-gray-800', icon: Users });

// ============================================================================
// COMPONENTS
// ============================================================================

const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-50">
    <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
  </div>
);

const Avatar = ({ src, name, size = 'md', ring }) => {
  const sizes = { xs: 'w-6 h-6 text-xs', sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-12 h-12 text-base', xl: 'w-16 h-16 text-lg' };
  return (
    <div className={cn('relative inline-block flex-shrink-0', ring && 'ring-2 ring-white')}>
      {src ? (
        <img src={src} alt={name} className={cn('rounded-full object-cover', sizes[size])}
          onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
      ) : null}
      <div className={cn('rounded-full flex items-center justify-center font-semibold text-white', sizes[size], !src ? getAvatarColor(name) : 'hidden')}>
        {getInitials(name)}
      </div>
    </div>
  );
};

const Button = ({ children, variant = 'primary', size = 'md', icon: Icon, loading, className, ...props }) => {
  const variants = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500',
    secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-500',
    outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-indigo-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
    ghost: 'text-gray-600 hover:bg-gray-100 focus:ring-gray-500',
  };
  const sizes = { sm: 'px-3 py-1.5 text-sm', md: 'px-4 py-2 text-sm', lg: 'px-6 py-3 text-base' };
  return (
    <button className={cn('inline-flex items-center justify-center font-medium rounded-lg transition-colors',
      'focus:outline-none focus:ring-2 focus:ring-offset-2',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      variants[variant], sizes[size], className)}
      disabled={loading || props.disabled} {...props}>
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
  const sizes = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl', full: 'max-w-6xl' };
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
// GROUP CARD
// ============================================================================

const GroupCard = ({ group, memberCount, onView, onEdit, onDelete, onManageMembers, isOwner }) => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);
  const colorCls = getGroupColorClasses(group.color || 'indigo');

  useEffect(() => {
    const h = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setShowMenu(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow" hover>
      {/* Cover strip */}
      <div className={cn('h-20 bg-gradient-to-br relative', colorCls.grad)}>
        <div className="absolute inset-0 bg-black opacity-10" />
        {group.coverImage && (
          <img src={group.coverImage} alt={group.name} className="absolute inset-0 w-full h-full object-cover opacity-60" />
        )}
        <div className="relative p-3 flex justify-between items-start">
          <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center backdrop-blur bg-white bg-opacity-90', colorCls.text)}>
            {group.privacy === 'private' ? <Lock className="w-5 h-5" /> :
             group.privacy === 'invite_only' ? <Key className="w-5 h-5" /> :
             <Users className="w-5 h-5" />}
          </div>
          {isOwner && (
            <div className="relative" ref={menuRef}>
              <button onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
                className="p-1.5 rounded-lg bg-white bg-opacity-90 hover:bg-opacity-100">
                <MoreVertical className="w-4 h-4 text-gray-700" />
              </button>
              <AnimatePresence>
                {showMenu && (
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                    <button onClick={() => { onView(group); setShowMenu(false); }}
                      className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      <Eye className="w-4 h-4 mr-2" /> View Group
                    </button>
                    <button onClick={() => { onEdit(group); setShowMenu(false); }}
                      className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      <Edit3 className="w-4 h-4 mr-2" /> Edit Group
                    </button>
                    <button onClick={() => { onManageMembers(group); setShowMenu(false); }}
                      className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      <Users className="w-4 h-4 mr-2" /> Manage Members
                    </button>
                    <button onClick={() => { onDelete(group); setShowMenu(false); }}
                      className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                      <Trash2 className="w-4 h-4 mr-2" /> Delete Group
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">{group.name}</h3>
            {group.description && (
              <p className="mt-1 text-sm text-gray-500 line-clamp-2">{group.description}</p>
            )}
          </div>
        </div>

        {/* Members preview */}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex -space-x-2">
            {(group.membersPreview || []).slice(0, 4).map((m, i) => (
              <div key={i} className="ring-2 ring-white rounded-full">
                <Avatar src={m.avatar} name={m.name} size="sm" />
              </div>
            ))}
            {memberCount > 4 && (
              <div className="w-8 h-8 rounded-full bg-gray-200 ring-2 ring-white flex items-center justify-center text-xs font-semibold text-gray-700">
                +{memberCount - 4}
              </div>
            )}
          </div>
          <span className="text-sm font-medium text-gray-700">{memberCount} members</span>
        </div>

        {/* Tags */}
        {group.tags?.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {group.tags.slice(0, 3).map((t, i) => (
              <span key={i} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">#{t}</span>
            ))}
          </div>
        )}

        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center space-x-2">
          <Button size="sm" variant="secondary" icon={Eye} onClick={() => onView(group)} className="flex-1">
            Open
          </Button>
          <Button size="sm" variant="outline" icon={Users} onClick={() => onManageMembers(group)}>
            Members
          </Button>
        </div>
      </div>
    </Card>
  );
};

// ============================================================================
// GROUP FORM
// ============================================================================

const GroupForm = ({ group, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: group?.name || '',
    description: group?.description || '',
    privacy: group?.privacy || 'private',
    color: group?.color || 'indigo',
    coverImage: group?.coverImage || '',
    tags: group?.tags || [],
    rules: group?.rules || '',
    welcomeMessage: group?.welcomeMessage || '',
    allowMemberPosts: group?.allowMemberPosts !== false,
    allowMemberInvites: group?.allowMemberInvites || false,
    autoApprove: group?.autoApprove || false,
  });
  const [tagInput, setTagInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const coverRef = useRef(null);

  const handleImageUpload = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('Image required'); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error('Under 5MB'); return; }

    setUploading(true);
    setUploadProgress(0);
    try {
      const uploaded = await supabaseMediaService.uploadFile(file, { folder: 'mentor-groups/covers' });
      setUploadProgress(100);
      setFormData((p) => ({ ...p, coverImage: uploaded.url, coverImagePath: uploaded.path }));
      toast.success('Cover uploaded');
    } catch (e) {
      console.error(e);
      toast.error('Upload failed');
    } finally {
      setUploading(false);
      setUploadProgress(0);
      if (coverRef.current) coverRef.current.value = '';
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) { toast.error('Name is required'); return; }
    setSaving(true);
    try {
      await onSave(formData);
    } finally {
      setSaving(false);
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData((p) => ({ ...p, tags: [...p.tags, tagInput.trim()] }));
      setTagInput('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Cover */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Cover Image</label>
        <div onClick={() => coverRef.current?.click()}
          className={cn('relative border-2 border-dashed rounded-lg cursor-pointer transition-colors overflow-hidden',
            formData.coverImage ? 'border-transparent' : 'border-gray-300 hover:border-indigo-400')}
          style={{ aspectRatio: '16/6' }}>
          <input ref={coverRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
          {formData.coverImage ? (
            <>
              <img src={formData.coverImage} alt="Cover" className="w-full h-full object-cover" />
              <button type="button" onClick={(e) => { e.stopPropagation(); setFormData((p) => ({ ...p, coverImage: '' })); }}
                className="absolute top-2 right-2 p-1.5 bg-black bg-opacity-50 rounded-lg text-white">
                <X className="w-4 h-4" />
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full">
              {uploading ? <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" /> : (
                <>
                  <ImageIcon className="w-8 h-8 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-600">Upload cover image</p>
                </>
              )}
              {uploading && uploadProgress > 0 && (
                <p className="mt-1 text-xs text-indigo-600">{uploadProgress}%</p>
              )}
            </div>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Group Name *</label>
        <input type="text" value={formData.name}
          onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
          placeholder="e.g., Frontend Developers Circle"
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          required />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea value={formData.description}
          onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
          rows={3} placeholder="What is this group about?"
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Privacy</label>
          <select value={formData.privacy}
            onChange={(e) => setFormData((p) => ({ ...p, privacy: e.target.value }))}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
            <option value="private">Private - Only invited members</option>
            <option value="invite_only">Invite Only - Request to join</option>
            <option value="public">Public - Anyone can join</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
          <div className="flex flex-wrap gap-2">
            {GROUP_COLORS.map((c) => {
              const cls = getGroupColorClasses(c);
              return (
                <button key={c} type="button" onClick={() => setFormData((p) => ({ ...p, color: c }))}
                  className={cn('w-8 h-8 rounded-lg transition-transform', cls.solid,
                    formData.color === c ? 'ring-2 ring-offset-2 ring-gray-900 scale-110' : '')} />
              );
            })}
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
        <div className="flex items-center space-x-2">
          <input type="text" value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
            placeholder="Add tag"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
          <Button type="button" variant="secondary" onClick={addTag}>Add</Button>
        </div>
        {formData.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {formData.tags.map((t) => (
              <span key={t} className="inline-flex items-center px-3 py-1 bg-indigo-100 text-indigo-800 text-sm rounded-full">
                #{t}
                <button type="button" onClick={() => setFormData((p) => ({ ...p, tags: p.tags.filter((x) => x !== t) }))}
                  className="ml-2 text-indigo-600 hover:text-indigo-800"><X className="w-3 h-3" /></button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Welcome Message</label>
        <textarea value={formData.welcomeMessage}
          onChange={(e) => setFormData((p) => ({ ...p, welcomeMessage: e.target.value }))}
          rows={2} placeholder="Shown to new members when they join"
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Group Rules</label>
        <textarea value={formData.rules}
          onChange={(e) => setFormData((p) => ({ ...p, rules: e.target.value }))}
          rows={3} placeholder="Community guidelines for this group"
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none" />
      </div>

      <div className="space-y-2">
        {[
          { key: 'allowMemberPosts', label: 'Allow members to post' },
          { key: 'allowMemberInvites', label: 'Allow members to invite others' },
          { key: 'autoApprove', label: 'Auto-approve join requests' },
        ].map((t) => (
          <label key={t.key} className="flex items-center space-x-2 cursor-pointer">
            <input type="checkbox" checked={formData[t.key]}
              onChange={(e) => setFormData((p) => ({ ...p, [t.key]: e.target.checked }))}
              className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" />
            <span className="text-sm text-gray-700">{t.label}</span>
          </label>
        ))}
      </div>

      <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button type="submit" loading={saving}>{group ? 'Update Group' : 'Create Group'}</Button>
      </div>
    </form>
  );
};

// ============================================================================
// MEMBER MANAGER
// ============================================================================

const MemberManager = ({ group, isOpen, onClose, mentees, onAdd, onRemove, onRoleChange, onApprove }) => {
  const [members, setMembers] = useState([]);
  const [pending, setPending] = useState([]);
  const [tab, setTab] = useState('members');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!group || !isOpen) return;
    const membersUnsub = onSnapshot(
      query(collection(db, 'groupMembers'), where('groupId', '==', group.id)),
      (snap) => setMembers(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );
    const pendingUnsub = onSnapshot(
      query(collection(db, 'groupJoinRequests'), where('groupId', '==', group.id), where('status', '==', 'pending')),
      (snap) => setPending(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );
    return () => { membersUnsub(); pendingUnsub(); };
  }, [group, isOpen]);

  const availableMentees = useMemo(() => {
    const memberIds = new Set(members.map((m) => m.userId));
    return (mentees || []).filter((m) => !memberIds.has(m.menteeId || m.id));
  }, [members, mentees]);

  if (!group) return null;

  const filteredAvailable = availableMentees.filter((m) => {
    if (!searchTerm) return true;
    const n = (m.menteeName || m.name || '').toLowerCase();
    return n.includes(searchTerm.toLowerCase());
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Manage Members — ${group.name}`} size="xl">
      <div className="flex items-center space-x-1 border-b border-gray-200 mb-4">
        {[
          { id: 'members', label: `Members (${members.length})` },
          { id: 'pending', label: `Pending (${pending.length})` },
          { id: 'add', label: 'Add Members' },
        ].map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={cn('px-4 py-2.5 text-sm font-medium border-b-2 transition-colors',
              tab === t.id ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700')}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'members' && (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {members.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-10 h-10 text-gray-300 mx-auto" />
              <p className="mt-2 text-sm text-gray-500">No members yet</p>
            </div>
          ) : members.map((m) => {
            const roleConf = getMemberRoleConfig(m.role);
            return (
              <div key={m.id} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50">
                <Avatar src={m.avatar} name={m.name} size="md" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{m.name}</p>
                  <p className="text-xs text-gray-500 truncate">{m.email}</p>
                </div>
                <span className={cn('inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full', roleConf.color)}>
                  <roleConf.icon className="w-3 h-3 mr-1" />
                  {roleConf.label}
                </span>
                <select value={m.role || 'member'} onChange={(e) => onRoleChange(m.id, e.target.value)}
                  className="px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500">
                  <option value="member">Member</option>
                  <option value="moderator">Moderator</option>
                  <option value="leader">Leader</option>
                </select>
                <button onClick={() => onRemove(m)} className="p-1.5 rounded hover:bg-red-50 text-red-600">
                  <UserMinus className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {tab === 'pending' && (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {pending.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="w-10 h-10 text-gray-300 mx-auto" />
              <p className="mt-2 text-sm text-gray-500">No pending requests</p>
            </div>
          ) : pending.map((r) => (
            <div key={r.id} className="flex items-center space-x-3 p-3 rounded-lg bg-yellow-50 border border-yellow-200">
              <Avatar src={r.avatar} name={r.name} size="md" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">{r.name}</p>
                <p className="text-xs text-gray-500 truncate">{r.email}</p>
              </div>
              <Button size="sm" variant="success" icon={Check} onClick={() => onApprove(r)}>Approve</Button>
              <Button size="sm" variant="ghost" onClick={() => onRemove(r)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {tab === 'add' && (
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Search mentees..." value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm" />
          </div>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {filteredAvailable.length === 0 ? (
              <p className="text-center text-sm text-gray-500 py-6">
                {searchTerm ? 'No matching mentees' : 'All your mentees are already members'}
              </p>
            ) : filteredAvailable.map((m) => (
              <div key={m.menteeId || m.id} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50">
                <Avatar src={m.menteeAvatar || m.avatar} name={m.menteeName || m.name} size="md" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{m.menteeName || m.name}</p>
                  <p className="text-xs text-gray-500 truncate">{m.menteeEmail || m.email}</p>
                </div>
                <Button size="sm" icon={UserPlus} onClick={() => onAdd(m)}>Add</Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </Modal>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const MentorGroups = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [mentees, setMentees] = useState([]);
  const [memberCounts, setMemberCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [managingGroup, setManagingGroup] = useState(null);
  const [viewMode, setViewMode] = useState('grid');

  const mentorId = user?.uid;

  // Groups listener
  useEffect(() => {
    if (!mentorId) return;
    const q = query(
      collection(db, 'mentorGroups'),
      where('mentorId', '==', mentorId),
      orderBy('createdAt', 'desc')
    );
    const unsub = onSnapshot(q, (snap) => {
      setGroups(snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
        createdAt: d.data().createdAt?.toDate?.() || new Date(d.data().createdAt || 0),
      })));
      setLoading(false);
    }, (err) => { console.error(err); setLoading(false); });
    return () => unsub();
  }, [mentorId]);

  // Mentees for adding
  useEffect(() => {
    if (!mentorId) return;
    const q = query(collection(db, 'mentorships'), where('mentorId', '==', mentorId), where('status', '==', 'active'));
    const unsub = onSnapshot(q, (snap) => {
      setMentees(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [mentorId]);

  // Member counts for each group
  useEffect(() => {
    if (groups.length === 0) return;
    const unsubs = groups.map((g) => {
      const q = query(collection(db, 'groupMembers'), where('groupId', '==', g.id));
      return onSnapshot(q, (snap) => {
        setMemberCounts((prev) => ({
          ...prev,
          [g.id]: snap.docs.map((d) => ({ id: d.id, ...d.data() })),
        }));
      });
    });
    return () => unsubs.forEach((u) => u());
  }, [groups.length]);

  const stats = useMemo(() => {
    const totalMembers = Object.values(memberCounts).reduce((s, m) => s + m.length, 0);
    const withMembers = groups.filter((g) => (memberCounts[g.id]?.length || 0) > 0).length;
    const privateCount = groups.filter((g) => g.privacy === 'private' || g.privacy === 'invite_only').length;
    return { total: groups.length, totalMembers, withMembers, privateCount };
  }, [groups, memberCounts]);

  const filtered = useMemo(() => {
    let r = [...groups];
    if (activeTab === 'active') r = r.filter((g) => (memberCounts[g.id]?.length || 0) > 0);
    else if (activeTab === 'empty') r = r.filter((g) => (memberCounts[g.id]?.length || 0) === 0);
    else if (activeTab === 'private') r = r.filter((g) => g.privacy === 'private' || g.privacy === 'invite_only');

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      r = r.filter((g) =>
        g.name?.toLowerCase().includes(term) ||
        g.description?.toLowerCase().includes(term) ||
        g.tags?.some((t) => t.toLowerCase().includes(term))
      );
    }
    return r;
  }, [groups, activeTab, searchTerm, memberCounts]);

  const handleSave = useCallback(async (data) => {
    if (!mentorId) return;
    try {
      const payload = {
        ...data,
        mentorId,
        updatedAt: serverTimestamp(),
      };
      if (editingGroup) {
        await updateDoc(doc(db, 'mentorGroups', editingGroup.id), payload);
        try {
          await supabase.from('mentor_groups').update({
            name: data.name, description: data.description,
            privacy: data.privacy, updated_at: new Date().toISOString(),
          }).eq('firebase_id', editingGroup.id);
        } catch (e) { console.warn('supabase sync', e); }
        toast.success('Group updated');
      } else {
        payload.createdAt = serverTimestamp();
        payload.memberCount = 0;
        const ref = await addDoc(collection(db, 'mentorGroups'), payload);
        try {
          await supabase.from('mentor_groups').insert({
            firebase_id: ref.id, mentor_id: mentorId,
            name: data.name, description: data.description,
            privacy: data.privacy, created_at: new Date().toISOString(),
          });
        } catch (e) { console.warn('supabase sync', e); }
        toast.success('Group created');
      }
      setIsFormOpen(false);
      setEditingGroup(null);
    } catch (e) {
      console.error(e);
      toast.error('Failed to save');
      throw e;
    }
  }, [mentorId, editingGroup]);

  const handleDelete = useCallback(async (group) => {
    if (!window.confirm(`Delete "${group.name}" permanently? All members will be removed.`)) return;
    try {
      // Remove all members
      const membersQ = query(collection(db, 'groupMembers'), where('groupId', '==', group.id));
      const membersSnap = await getDocs(membersQ);
      const batch = writeBatch(db);
      membersSnap.forEach((d) => batch.delete(d.ref));
      batch.delete(doc(db, 'mentorGroups', group.id));
      await batch.commit();

      try { await supabase.from('mentor_groups').delete().eq('firebase_id', group.id); } catch (e) {}

      toast.success('Group deleted');
    } catch (e) {
      console.error(e);
      toast.error('Failed to delete');
    }
  }, []);

  const handleAddMember = useCallback(async (mentee) => {
    if (!managingGroup) return;
    try {
      await addDoc(collection(db, 'groupMembers'), {
        groupId: managingGroup.id,
        userId: mentee.menteeId || mentee.id,
        name: mentee.menteeName || mentee.name,
        email: mentee.menteeEmail || mentee.email,
        avatar: mentee.menteeAvatar || mentee.avatar,
        role: 'member',
        joinedAt: serverTimestamp(),
      });

      await updateDoc(doc(db, 'mentorGroups', managingGroup.id), {
        memberCount: increment(1),
      });

      // Notify mentee
      await addDoc(collection(db, 'notifications'), {
        userId: mentee.menteeId || mentee.id,
        type: 'added_to_group',
        title: 'Added to Group',
        message: `You've been added to "${managingGroup.name}"`,
        groupId: managingGroup.id,
        read: false,
        createdAt: serverTimestamp(),
      });

      try {
        await supabase.from('group_members').insert({
          group_id: managingGroup.id,
          user_id: mentee.menteeId || mentee.id,
          name: mentee.menteeName || mentee.name,
          role: 'member',
          joined_at: new Date().toISOString(),
        });
      } catch (e) { console.warn('supabase sync', e); }

      toast.success('Member added');
    } catch (e) {
      console.error(e);
      toast.error('Failed to add');
    }
  }, [managingGroup]);

  const handleRemoveMember = useCallback(async (member) => {
    if (!window.confirm(`Remove ${member.name} from the group?`)) return;
    try {
      await deleteDoc(doc(db, 'groupMembers', member.id));
      await updateDoc(doc(db, 'mentorGroups', managingGroup.id), { memberCount: increment(-1) });
      try { await supabase.from('group_members').delete().eq('firebase_id', member.id); } catch (e) {}
      toast.success('Member removed');
    } catch (e) {
      toast.error('Failed to remove');
    }
  }, [managingGroup]);

  const handleRoleChange = useCallback(async (memberId, role) => {
    try {
      await updateDoc(doc(db, 'groupMembers', memberId), { role });
      toast.success('Role updated');
    } catch (e) {
      toast.error('Failed to update role');
    }
  }, []);

  const handleApproveRequest = useCallback(async (request) => {
    if (!managingGroup) return;
    try {
      await updateDoc(doc(db, 'groupJoinRequests', request.id), {
        status: 'approved',
        approvedAt: serverTimestamp(),
      });
      await addDoc(collection(db, 'groupMembers'), {
        groupId: managingGroup.id,
        userId: request.userId,
        name: request.name,
        email: request.email,
        avatar: request.avatar,
        role: 'member',
        joinedAt: serverTimestamp(),
      });
      await updateDoc(doc(db, 'mentorGroups', managingGroup.id), {
        memberCount: increment(1),
      });
      toast.success('Request approved');
    } catch (e) {
      toast.error('Failed to approve');
    }
  }, [managingGroup]);

  if (authLoading || loading) return <LoadingSpinner />;
  if (!user) { navigate('/login'); return null; }

  const tabs = [
    { id: 'all', label: 'All Groups', count: stats.total },
    { id: 'active', label: 'Active', count: stats.withMembers },
    { id: 'empty', label: 'Empty', count: stats.total - stats.withMembers },
    { id: 'private', label: 'Private', count: stats.privateCount },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link to="/mentor/dashboard" className="p-2 rounded-lg hover:bg-gray-100">
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </Link>
              <h1 className="text-lg font-semibold text-gray-900">Mentoring Groups</h1>
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
              <Button icon={Plus} onClick={() => { setEditingGroup(null); setIsFormOpen(true); }}>
                Create Group
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase">Total Groups</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="w-11 h-11 bg-indigo-100 rounded-lg flex items-center justify-center">
                <Users2 className="w-5 h-5 text-indigo-600" />
              </div>
            </div>
          </Card>
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase">Total Members</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">{stats.totalMembers}</p>
              </div>
              <div className="w-11 h-11 bg-green-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </Card>
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase">Active Groups</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">{stats.withMembers}</p>
              </div>
              <div className="w-11 h-11 bg-purple-100 rounded-lg flex items-center justify-center">
                <Activity className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </Card>
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase">Private</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">{stats.privateCount}</p>
              </div>
              <div className="w-11 h-11 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Lock className="w-5 h-5 text-yellow-600" />
              </div>
            </div>
          </Card>
        </div>

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
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" placeholder="Search groups..." value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm w-64" />
            </div>
          </div>
        </Card>

        {filtered.length === 0 ? (
          <Card className="p-12">
            <div className="text-center">
              <Users2 className="w-16 h-16 text-gray-300 mx-auto" />
              <h3 className="mt-4 text-lg font-semibold text-gray-900">
                {searchTerm ? 'No matching groups' : 'No groups yet'}
              </h3>
              <p className="mt-2 text-gray-500 max-w-sm mx-auto">
                {searchTerm ? 'Try a different search' : 'Create your first group to mentor multiple students together.'}
              </p>
              <Button className="mt-6" icon={Plus} onClick={() => { setEditingGroup(null); setIsFormOpen(true); }}>
                Create Group
              </Button>
            </div>
          </Card>
        ) : (
          <div className={cn(viewMode === 'grid'
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
            : 'space-y-4')}>
            {filtered.map((g) => (
              <GroupCard
                key={g.id}
                group={{ ...g, membersPreview: (memberCounts[g.id] || []).slice(0, 4).map((m) => ({ name: m.name, avatar: m.avatar })) }}
                memberCount={memberCounts[g.id]?.length || 0}
                onView={(group) => navigate(`/mentor/groups/${group.id}`)}
                onEdit={(group) => { setEditingGroup(group); setIsFormOpen(true); }}
                onDelete={handleDelete}
                onManageMembers={setManagingGroup}
                isOwner={true}
              />
            ))}
          </div>
        )}
      </main>

      <Modal isOpen={isFormOpen}
        onClose={() => { setIsFormOpen(false); setEditingGroup(null); }}
        title={editingGroup ? 'Edit Group' : 'Create New Group'} size="lg">
        <GroupForm group={editingGroup} onSave={handleSave}
          onCancel={() => { setIsFormOpen(false); setEditingGroup(null); }} />
      </Modal>

      <MemberManager
        group={managingGroup}
        isOpen={!!managingGroup}
        onClose={() => setManagingGroup(null)}
        mentees={mentees}
        onAdd={handleAddMember}
        onRemove={handleRemoveMember}
        onRoleChange={handleRoleChange}
        onApprove={handleApproveRequest}
      />
    </div>
  );
};

export default MentorGroups;
