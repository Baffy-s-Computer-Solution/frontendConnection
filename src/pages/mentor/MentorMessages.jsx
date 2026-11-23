import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate, Link, useParams, useSearchParams } from 'react-router-dom';
import {
  collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc,
  query, where, orderBy, limit, onSnapshot, serverTimestamp,
  Timestamp, writeBatch, increment
} from 'firebase/firestore';
import { db, auth } from '../../config/firebase';
import supabaseMediaService from '../../services/supabaseMediaService';
import socialPlatformService from '../../services/socialPlatformService';
import { useAuth } from '../../hooks/useAuth';
import {
  MessageSquare, Send, Paperclip, Image as ImageIcon, Smile, Mic,
  MicOff, MoreVertical, Search, Plus, X, ChevronLeft, ChevronRight,
  Users, User as UserIcon, Phone, Video, Info, Star, Archive,
  Trash2, Edit3, Copy, Check, CheckCheck, Clock, Bell, BellOff,
  Pin, Flag, Download, FileText, Play, Pause, Volume2, VolumeX,
  Loader2, AlertCircle, CheckCircle, Wifi, WifiOff, RefreshCw,
  Filter, ArrowLeft, ArrowRight, Calendar, MapPin, Globe, Link as LinkIcon,
  ExternalLink, Eye, EyeOff, Lock, Unlock, Shield, Key, Fingerprint,
  Sparkles, Zap, Heart, ThumbsUp, Share2, Bookmark, Tag, Hash,
  AtSign, DollarSign, Percent, Award, Trophy, Crown, Medal, Flame,
  Sun, Moon, Cloud, CloudRain, Wind, Droplets, Thermometer, Activity,
  TrendingUp, BarChart3, PieChart, Settings, Sliders, ToggleLeft,
  ToggleRight, ChevronDown, ChevronUp, MoreHorizontal, Menu, Home,
  LogOut, Briefcase, GraduationCap, Building2, Handshake, Lightbulb,
  Rocket, Camera, Headphones, Speaker, Radio, Tv, Monitor, Smartphone,
  Tablet, Laptop, Monitor as Desktop, Server, Database, HardDrive, Cpu,
  MemoryStick, Bluetooth, Battery, BatteryCharging, Plug, Power
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
  format, formatDistanceToNow, differenceInDays, differenceInHours,
  differenceInMinutes, isToday, isYesterday, isThisWeek, isThisMonth,
  startOfDay, endOfDay
} from 'date-fns';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const cn = (...inputs) => twMerge(clsx(inputs));

const getInitials = (name) => {
  if (!name) return '?';
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
};

const getAvatarColor = (name) => {
  const colors = [
    'bg-red-500', 'bg-orange-500', 'bg-amber-500', 'bg-yellow-500',
    'bg-lime-500', 'bg-green-500', 'bg-emerald-500', 'bg-teal-500',
    'bg-cyan-500', 'bg-sky-500', 'bg-blue-500', 'bg-indigo-500',
    'bg-violet-500', 'bg-purple-500', 'bg-fuchsia-500', 'bg-pink-500', 'bg-rose-500',
  ];
  const index = name?.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) || 0;
  return colors[index % colors.length];
};

const formatMessageTime = (date) => {
  if (!date) return '';
  const d = new Date(date);
  if (isToday(d)) return format(d, 'h:mm a');
  if (isYesterday(d)) return `Yesterday ${format(d, 'h:mm a')}`;
  if (isThisWeek(d)) return format(d, 'EEE h:mm a');
  return format(d, 'MMM d, h:mm a');
};

const formatConversationTime = (date) => {
  if (!date) return '';
  const d = new Date(date);
  if (isToday(d)) return format(d, 'h:mm a');
  if (isYesterday(d)) return 'Yesterday';
  if (isThisWeek(d)) return format(d, 'EEE');
  return format(d, 'MMM d');
};

const groupMessagesByDate = (messages) => {
  const groups = {};
  messages.forEach((msg) => {
    const date = new Date(msg.createdAt);
    const key = format(date, 'yyyy-MM-dd');
    if (!groups[key]) groups[key] = [];
    groups[key].push(msg);
  });
  return groups;
};

const getDateLabel = (dateStr) => {
  const date = new Date(dateStr);
  if (isToday(date)) return 'Today';
  if (isYesterday(date)) return 'Yesterday';
  return format(date, 'EEEE, MMMM d, yyyy');
};

// ============================================================================
// CUSTOM HOOKS
// ============================================================================

const useConversations = (userId) => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!userId) {
      setConversations([]);
      setLoading(false);
      return undefined;
    }
    setLoading(true);
    setError('');

    const q = query(
      collection(db, 'conversations'),
      where('participants', 'array-contains', userId),
      orderBy('lastMessageAt', 'desc')
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        lastMessageAt: doc.data().lastMessageAt?.toDate?.() || new Date(doc.data().lastMessageAt || 0),
      }));
      setConversations(data);
      setLoading(false);
      setError('');
    }, (listenerError) => {
      console.error('Unable to load mentor conversations:', listenerError);
      setError(listenerError.message || 'Unable to load conversations.');
      setConversations([]);
      setLoading(false);
    });

    return () => unsub();
  }, [userId]);

  return { conversations, loading, error };
};

const useMessages = (conversationId) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setError('');
    if (!conversationId) {
      setMessages([]);
      setLoading(false);
      return undefined;
    }
    setLoading(true);

    const q = query(
      collection(db, 'messages'),
      where('conversationId', '==', conversationId),
      orderBy('createdAt', 'asc'),
      limit(200)
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || new Date(doc.data().createdAt || 0),
      }));
      setMessages(data);
      setLoading(false);
      setError('');
    }, (listenerError) => {
      console.error('Unable to load conversation messages:', listenerError);
      setError(listenerError.message || 'Unable to load messages.');
      setMessages([]);
      setLoading(false);
    });

    return () => unsub();
  }, [conversationId]);

  return { messages, loading, error };
};

// ============================================================================
// COMPONENTS
// ============================================================================

const Avatar = ({ src, name, size = 'md', status, className }) => {
  const sizeClasses = {
    xs: 'w-6 h-6 text-xs', sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base', xl: 'w-16 h-16 text-lg',
  };
  return (
    <div className={cn('relative inline-block flex-shrink-0', className)}>
      {src ? (
        <img src={src} alt={name} className={cn('rounded-full object-cover', sizeClasses[size])}
          onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
      ) : null}
      <div className={cn('rounded-full flex items-center justify-center font-semibold text-white',
        sizeClasses[size], !src ? getAvatarColor(name) : 'hidden')}>
        {getInitials(name)}
      </div>
      {status && (
        <span className={cn(
          'absolute bottom-0 right-0 block rounded-full ring-2 ring-white',
          size === 'xs' || size === 'sm' ? 'w-2 h-2' : 'w-3 h-3',
          status === 'online' && 'bg-green-500',
          status === 'offline' && 'bg-gray-400',
          status === 'busy' && 'bg-red-500',
          status === 'away' && 'bg-yellow-500'
        )} />
      )}
    </div>
  );
};

const Button = ({ children, variant = 'primary', size = 'md', icon: Icon, loading, className, ...props }) => {
  const variants = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500',
    secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-500',
    outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-indigo-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
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

// ============================================================================
// MESSAGE BUBBLE
// ============================================================================

const MessageBubble = ({ message, isOwn, onDelete, onEdit }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(message.content);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSaveEdit = async () => {
    if (editText.trim() && editText !== message.content) {
      await onEdit(message.id, editText.trim());
    }
    setIsEditing(false);
  };

  const attachments = message.attachments || [];

  return (
    <div className={cn('flex items-end space-x-2 group', isOwn ? 'flex-row-reverse space-x-reverse' : 'flex-row')}>
      {!isOwn && <Avatar src={message.senderAvatar} name={message.senderName} size="sm" />}
      <div className={cn('flex flex-col max-w-xs sm:max-w-md lg:max-w-lg', isOwn ? 'items-end' : 'items-start')}>
        {!isOwn && (
          <span className="text-xs text-gray-500 mb-1 px-1">{message.senderName}</span>
        )}
        <div className="relative">
          <div className={cn(
            'px-4 py-2 rounded-2xl break-words',
            isOwn
              ? 'bg-indigo-600 text-white rounded-br-sm'
              : 'bg-gray-100 text-gray-900 rounded-bl-sm',
            message.deleted && 'italic opacity-60'
          )}>
            {isEditing ? (
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSaveEdit()}
                  autoFocus
                  className="bg-white text-gray-900 px-2 py-1 rounded border border-gray-300 text-sm"
                />
                <button onClick={handleSaveEdit} className="text-white">
                  <Check className="w-4 h-4" />
                </button>
                <button onClick={() => setIsEditing(false)} className="text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <>
                {message.content && (
                  <p className={cn('text-sm whitespace-pre-wrap', message.deleted && 'line-through')}>
                    {message.content}
                  </p>
                )}
                {attachments.length > 0 && (
                  <div className="mt-2 space-y-2">
                    {attachments.map((att, i) => (
                      <div key={i}>
                        {att.type?.startsWith('image/') ? (
                          <img src={att.url} alt={att.name} className="max-w-full rounded-lg" />
                        ) : att.type?.startsWith('video/') ? (
                          <video src={att.url} controls className="max-w-full rounded-lg" />
                        ) : att.type?.startsWith('audio/') ? (
                          <audio src={att.url} controls className="max-w-full" />
                        ) : (
                          <a href={att.url} target="_blank" rel="noopener noreferrer"
                            className={cn(
                              'flex items-center space-x-2 p-2 rounded-lg',
                              isOwn ? 'bg-indigo-700' : 'bg-white border border-gray-200'
                            )}>
                            <FileText className="w-4 h-4" />
                            <span className="text-xs truncate">{att.name}</span>
                            <Download className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
          <div className={cn('flex items-center mt-1 space-x-1', isOwn ? 'justify-end' : 'justify-start')}>
            <span className="text-xs text-gray-400">{formatMessageTime(message.createdAt)}</span>
            {isOwn && (
              message.read ? <CheckCheck className="w-3 h-3 text-indigo-500" /> :
              message.delivered ? <CheckCheck className="w-3 h-3 text-gray-400" /> :
              <Check className="w-3 h-3 text-gray-400" />
            )}
            {message.editedAt && <span className="text-xs text-gray-400 italic">(edited)</span>}
          </div>
        </div>
      </div>

      {isOwn && !message.deleted && (
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 rounded-lg hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity"
          >
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
                <button
                  onClick={() => { setIsEditing(true); setShowMenu(false); }}
                  className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <Edit3 className="w-4 h-4 mr-2" /> Edit
                </button>
                <button
                  onClick={() => { navigator.clipboard.writeText(message.content); toast.success('Copied!'); setShowMenu(false); }}
                  className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <Copy className="w-4 h-4 mr-2" /> Copy
                </button>
                <button
                  onClick={() => { onDelete(message.id); setShowMenu(false); }}
                  className="w-full flex items-center px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4 mr-2" /> Delete
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// CONVERSATION LIST ITEM
// ============================================================================

const ConversationItem = ({ conversation, currentUserId, isActive, onClick }) => {
  const otherParticipant = conversation.participantsData?.find((p) => p.id !== currentUserId) || {};
  const unreadCount = conversation.unreadCount?.[currentUserId] || 0;

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-start space-x-3 p-3 rounded-lg transition-colors text-left',
        isActive ? 'bg-indigo-50 border border-indigo-200' : 'hover:bg-gray-50'
      )}
    >
      <Avatar
        src={otherParticipant.photoURL}
        name={otherParticipant.displayName}
        size="md"
        status={otherParticipant.status || 'offline'}
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <p className={cn('font-medium truncate', unreadCount > 0 ? 'text-gray-900' : 'text-gray-700')}>
            {otherParticipant.displayName || 'Unknown'}
          </p>
          <span className="text-xs text-gray-400 ml-2 flex-shrink-0">
            {formatConversationTime(conversation.lastMessageAt)}
          </span>
        </div>
        <div className="flex items-center justify-between mt-0.5">
          <p className={cn('text-sm truncate', unreadCount > 0 ? 'text-gray-700 font-medium' : 'text-gray-500')}>
            {conversation.lastMessage?.senderId === currentUserId && 'You: '}
            {conversation.lastMessage?.content || 'No messages yet'}
          </p>
          {unreadCount > 0 && (
            <span className="ml-2 flex-shrink-0 min-w-[20px] h-5 px-1.5 bg-indigo-600 text-white text-xs font-semibold rounded-full flex items-center justify-center">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const MentorMessages = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { conversationId: paramConversationId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeConversationId, setActiveConversationId] = useState(paramConversationId || null);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [uploadingAttachment, setUploadingAttachment] = useState(false);
  const [pendingAttachments, setPendingAttachments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showMobileList, setShowMobileList] = useState(!paramConversationId);
  const [isTyping, setIsTyping] = useState(false);
  const [showNewConversationModal, setShowNewConversationModal] = useState(false);
  const [availableMentees, setAvailableMentees] = useState([]);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const handledMenteeLaunch = useRef('');

  const mentorId = user?.uid;
  const requestedMenteeId = searchParams.get('mentee');
  const requestedMentorshipId = searchParams.get('mentorship');
  const { conversations, loading: conversationsLoading, error: conversationsError } = useConversations(mentorId);
  const conversationsRef = useRef(conversations);
  conversationsRef.current = conversations;
  const { messages, loading: messagesLoading, error: messagesError } = useMessages(activeConversationId);

  useEffect(() => {
    if (!requestedMenteeId) handledMenteeLaunch.current = '';
  }, [requestedMenteeId]);

  useEffect(() => {
    if (!mentorId || !requestedMenteeId || !requestedMentorshipId || conversationsLoading || conversationsError) return undefined;
    const launchKey = `${requestedMentorshipId}:${requestedMenteeId}`;
    if (handledMenteeLaunch.current === launchKey) return undefined;
    handledMenteeLaunch.current = launchKey;
    let cancelled = false;
    const openMenteeConversation = async () => {
      try {
        const mentorshipSnapshot = await getDoc(doc(db, 'mentorships', requestedMentorshipId));
        const mentorship = mentorshipSnapshot.exists() ? mentorshipSnapshot.data() : null;
        if (!mentorship || mentorship.mentorId !== mentorId || mentorship.menteeId !== requestedMenteeId || mentorship.status !== 'active') {
          throw new Error('Messaging is available only for your active mentees.');
        }

        const existing = conversationsRef.current.find((conversation) =>
          conversation.mentorshipId === requestedMentorshipId
          || (conversation.participants || conversation.participantIds || []).includes(requestedMenteeId));
        if (existing) {
          if (cancelled) return;
          setActiveConversationId(existing.id);
          setShowMobileList(false);
          setSearchParams({}, { replace: true });
          return;
        }

        const [studentProfile, userProfile] = await Promise.all([
          getDoc(doc(db, 'students', requestedMenteeId)).catch(() => null),
          getDoc(doc(db, 'users', requestedMenteeId)).catch(() => null),
        ]);
        const profile = studentProfile?.exists() ? studentProfile.data() : {};
        const account = userProfile?.exists() ? userProfile.data() : {};
        const studentName = profile.fullName || profile.displayName || profile.name || account.displayName || account.name || 'Student';
        const participantsData = [
          { id: mentorId, displayName: user.displayName || user.email || 'Mentor', photoURL: user.photoURL || '', role: 'mentor' },
          { id: requestedMenteeId, displayName: studentName, photoURL: profile.photoURL || profile.profilePhoto || account.photoURL || '', role: 'mentee' },
        ];
        const conversation = await addDoc(collection(db, 'conversations'), {
          mentorshipId: requestedMentorshipId,
          participants: [mentorId, requestedMenteeId],
          participantsData,
          lastMessage: null,
          lastMessageAt: serverTimestamp(),
          unreadCount: { [mentorId]: 0, [requestedMenteeId]: 0 },
          createdAt: serverTimestamp(),
        });
        if (cancelled) return;
        setActiveConversationId(conversation.id);
        setShowMobileList(false);
        setSearchParams({}, { replace: true });
        toast.success('Conversation opened');
      } catch (error) {
        if (!cancelled) {
          toast.error(error.message || 'Unable to open a conversation with this mentee.');
          setSearchParams({}, { replace: true });
        }
      }
    };
    openMenteeConversation();
    return () => { cancelled = true; };
  }, [mentorId, requestedMenteeId, requestedMentorshipId, conversationsLoading, conversationsError, setSearchParams, user]);

  const activeConversation = useMemo(
    () => conversations.find((c) => c.id === activeConversationId),
    [conversations, activeConversationId]
  );

  const otherParticipant = useMemo(() => {
    if (!activeConversation) return null;
    return activeConversation.participantsData?.find((p) => p.id !== mentorId) || null;
  }, [activeConversation, mentorId]);

  const filteredConversations = useMemo(() => {
    if (!searchTerm) return conversations;
    const term = searchTerm.toLowerCase();
    return conversations.filter((c) => {
      const other = c.participantsData?.find((p) => p.id !== mentorId);
      return other?.displayName?.toLowerCase().includes(term);
    });
  }, [conversations, searchTerm, mentorId]);

  const groupedMessages = useMemo(() => groupMessagesByDate(messages), [messages]);

  // Load available mentees for new conversation
  useEffect(() => {
    if (!mentorId || !showNewConversationModal) return;

    const q = query(
      collection(db, 'mentorships'),
      where('mentorId', '==', mentorId),
      where('status', '==', 'active')
    );

    getDocs(q).then((snapshot) => {
      const mentees = snapshot.docs.map((doc) => ({
        id: doc.data().menteeId,
        mentorshipId: doc.id,
        ...doc.data(),
      }));
      setAvailableMentees(mentees);
    });
  }, [mentorId, showNewConversationModal]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Mark messages as read when conversation is active
  useEffect(() => {
    if (!activeConversationId || !mentorId || messages.length === 0) return;

    const unreadMessages = messages.filter(
      (m) => m.senderId !== mentorId && !m.read
    );

    if (unreadMessages.length === 0) return;

    const batch = writeBatch(db);
    unreadMessages.forEach((msg) => {
      batch.update(doc(db, 'messages', msg.id), { read: true, readAt: serverTimestamp() });
    });

    // Also update conversation unread count
    if (activeConversation) {
      batch.update(doc(db, 'conversations', activeConversationId), {
        [`unreadCount.${mentorId}`]: 0,
      });
    }

    batch.commit().catch((err) => console.warn('Failed to mark as read:', err));

  }, [activeConversationId, mentorId, messages, activeConversation]);

  // Handle sending message
  const handleSendMessage = useCallback(async () => {
    if (!activeConversationId || !mentorId || (!newMessage.trim() && pendingAttachments.length === 0)) return;

    setSending(true);
    const content = newMessage.trim();
    const attachments = [...pendingAttachments];

    try {
      // Add message to Firestore
      const messageData = {
        conversationId: activeConversationId,
        senderId: mentorId,
        senderName: user.displayName || 'Mentor',
        senderAvatar: user.photoURL || null,
        content: content || '',
        attachments,
        read: false,
        delivered: true,
        createdAt: serverTimestamp(),
      };

      const msgRef = await addDoc(collection(db, 'messages'), messageData);

      // Update conversation
      await updateDoc(doc(db, 'conversations', activeConversationId), {
        lastMessage: {
          content: content || `[${attachments.length} attachment${attachments.length > 1 ? 's' : ''}]`,
          senderId: mentorId,
          createdAt: new Date().toISOString(),
        },
        lastMessageAt: serverTimestamp(),
        [`unreadCount.${otherParticipant?.id}`]: increment(1),
      });

      // Create notification
      if (otherParticipant?.id) {
        await addDoc(collection(db, 'notifications'), {
          userId: otherParticipant.id,
          type: 'message',
          title: 'New Message',
          message: `${user.displayName || 'Your mentor'}: ${content.slice(0, 50)}${content.length > 50 ? '...' : ''}`,
          conversationId: activeConversationId,
          read: false,
          createdAt: serverTimestamp(),
        });
      }

      setNewMessage('');
      setPendingAttachments([]);
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  }, [activeConversationId, mentorId, newMessage, pendingAttachments, user, otherParticipant]);

  const handleReportMessage = async (message) => {
    const reason = window.prompt('Why are you reporting this message?');
    if (!reason?.trim()) return;
    try {
      await socialPlatformService.reportContent({ targetType: 'message', targetId: message.id, ownerId: message.senderId, reason });
      toast.success('Message report submitted privately.');
    } catch (error) { toast.error(error.message || 'Unable to submit report.'); }
  };

  const handleBlockMentee = async () => {
    const memberId = otherParticipant?.id;
    if (!memberId || !window.confirm(`Block ${otherParticipant.displayName || 'this member'}? This ends access to social content and messaging.`)) return;
    try {
      await socialPlatformService.blockUser(memberId, otherParticipant.displayName);
      toast.success('Member blocked.');
      navigate('/mentor/mentees');
    } catch (error) { toast.error(error.message || 'Unable to block this member.'); }
  };

  // Handle file upload
  const handleFileSelect = useCallback(async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0 || !mentorId) return;

    setUploadingAttachment(true);
    const uploaded = [];

    try {
      for (const file of files) {
        if (file.size > 25 * 1024 * 1024) {
          toast.error(`${file.name} is too large (max 25MB)`);
          continue;
        }

        const upload = await supabaseMediaService.uploadToSupabase(file, `mentor-messages/${mentorId}`);
        if (!upload?.success || !upload.url) {
          throw new Error(upload?.error || `Could not upload ${file.name}.`);
        }

        uploaded.push({
          name: file.name,
          type: file.type,
          size: file.size,
          url: upload.url,
          publicId: upload.public_id || '',
          resourceType: upload.resource_type || 'auto',
        });
      }

      setPendingAttachments((prev) => [...prev, ...uploaded]);
      toast.success(`${uploaded.length} file(s) attached`);
    } catch (error) {
      console.error('Error uploading files:', error);
      toast.error('Failed to upload files');
    } finally {
      setUploadingAttachment(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }, [mentorId]);

  // Start new conversation
  const handleStartConversation = useCallback(async (mentee) => {
    if (!mentorId) return;

    try {
      // Check if conversation already exists
      const existing = conversations.find((c) => {
        const other = c.participantsData?.find((p) => p.id !== mentorId);
        return other?.id === mentee.id;
      });

      if (existing) {
        setActiveConversationId(existing.id);
        setShowNewConversationModal(false);
        return;
      }

      // Create new conversation
      const conversationData = {
        mentorshipId: mentee.mentorshipId,
        participants: [mentorId, mentee.id],
        participantsData: [
          {
            id: mentorId,
            displayName: user.displayName,
            photoURL: user.photoURL,
            role: 'mentor',
          },
          {
            id: mentee.id,
            displayName: mentee.menteeName || mentee.name,
            photoURL: mentee.menteeAvatar || mentee.avatar,
            role: 'mentee',
          },
        ],
        lastMessage: null,
        lastMessageAt: serverTimestamp(),
        unreadCount: { [mentorId]: 0, [mentee.id]: 0 },
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, 'conversations'), conversationData);

      setActiveConversationId(docRef.id);
      setShowNewConversationModal(false);
      toast.success('Conversation started');
    } catch (error) {
      console.error('Error starting conversation:', error);
      toast.error('Failed to start conversation');
    }
  }, [mentorId, conversations, user]);

  // Delete message
  const handleDeleteMessage = useCallback(async (messageId) => {
    if (!window.confirm('Delete this message?')) return;

    try {
      await updateDoc(doc(db, 'messages', messageId), {
        content: '',
        attachments: [],
        deleted: true,
        deletedAt: serverTimestamp(),
      });

      toast.success('Message deleted');
    } catch (error) {
      console.error('Error deleting message:', error);
      toast.error('Failed to delete message');
    }
  }, []);

  // Edit message
  const handleEditMessage = useCallback(async (messageId, newContent) => {
    try {
      await updateDoc(doc(db, 'messages', messageId), {
        content: newContent,
        editedAt: serverTimestamp(),
      });

      toast.success('Message edited');
    } catch (error) {
      console.error('Error editing message:', error);
      toast.error('Failed to edit message');
    }
  }, []);

  const handleSelectConversation = useCallback((id) => {
    setActiveConversationId(id);
    setShowMobileList(false);
  }, []);

  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
      </div>
    );
  }

  if (!user) { navigate('/login'); return null; }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link to="/mentor/dashboard" className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </Link>
              <h1 className="text-lg font-semibold text-gray-900">Messages</h1>
            </div>
            <Button icon={Plus} size="sm" onClick={() => setShowNewConversationModal(true)}>
              New Chat
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden max-w-7xl w-full mx-auto">
        {/* Conversations List */}
        <div className={cn(
          'w-full sm:w-80 lg:w-96 bg-white border-r border-gray-200 flex flex-col',
          !showMobileList && 'hidden sm:flex'
        )}>
          {/* Search */}
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              />
            </div>
          </div>

          {/* Conversation List */}
          <div className="flex-1 overflow-y-auto p-2">
            {conversationsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
              </div>
            ) : conversationsError ? (
              <p role="alert" className="m-3 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200">{conversationsError}</p>
            ) : filteredConversations.length === 0 ? (
              <div className="text-center py-12 px-4">
                <MessageSquare className="w-12 h-12 text-gray-300 mx-auto" />
                <p className="mt-3 text-sm text-gray-500">
                  {searchTerm ? 'No conversations found' : 'No conversations yet'}
                </p>
                {!searchTerm && (
                  <Button size="sm" className="mt-4" onClick={() => setShowNewConversationModal(true)}>
                    Start a Conversation
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-1">
                {filteredConversations.map((conv) => (
                  <ConversationItem
                    key={conv.id}
                    conversation={conv}
                    currentUserId={mentorId}
                    isActive={conv.id === activeConversationId}
                    onClick={() => handleSelectConversation(conv.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className={cn(
          'flex-1 flex flex-col bg-white',
          showMobileList && 'hidden sm:flex'
        )}>
          {!activeConversationId ? (
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="text-center">
                <MessageSquare className="w-16 h-16 text-gray-300 mx-auto" />
                <h3 className="mt-4 text-lg font-semibold text-gray-900">Select a conversation</h3>
                <p className="mt-2 text-gray-500">Choose from your existing conversations or start a new one</p>
                <Button className="mt-6" icon={Plus} onClick={() => setShowNewConversationModal(true)}>
                  Start New Conversation
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white flex-shrink-0">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setShowMobileList(true)}
                    className="sm:hidden p-2 rounded-lg hover:bg-gray-100"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <Avatar
                    src={otherParticipant?.photoURL}
                    name={otherParticipant?.displayName}
                    size="md"
                    status={otherParticipant?.status || 'offline'}
                  />
                  <div>
                    <p className="font-semibold text-gray-900">{otherParticipant?.displayName || 'Unknown'}</p>
                    <p className="text-xs text-gray-500">
                      {otherParticipant?.status === 'online' ? 'Online' :
                       isTyping ? 'Typing...' : 'Offline'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => toast.info('Voice call coming soon')}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <Phone className="w-5 h-5 text-gray-600" />
                  </button>
                  <button
                    onClick={() => toast.info('Video call coming soon')}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <Video className="w-5 h-5 text-gray-600" />
                  </button>
                  <button type="button" onClick={handleBlockMentee} title="Block member" aria-label="Block member" className="p-2 rounded-lg text-gray-600 hover:bg-rose-50 hover:text-rose-600"><Shield /></button>
                  <button type="button" onClick={async () => { const reason = window.prompt('Why are you reporting this profile?'); if (!reason?.trim()) return; try { await socialPlatformService.reportContent({ targetType: 'profile', targetId: otherParticipant?.id, ownerId: otherParticipant?.id, reason }); toast.success('Profile report submitted privately.'); } catch (error) { toast.error(error.message || 'Unable to report profile.'); } }} title="Report profile" aria-label="Report profile" className="p-2 rounded-lg text-gray-600 hover:bg-amber-50 hover:text-amber-600"><Flag /></button>
                  <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                    <MoreVertical className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {messagesLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
                  </div>
                ) : messagesError ? (
                  <p role="alert" className="mx-auto max-w-xl rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200">{messagesError}</p>
                ) : messages.length === 0 ? (
                  <div className="text-center py-12">
                    <Sparkles className="w-12 h-12 text-indigo-300 mx-auto" />
                    <p className="mt-3 text-sm text-gray-500">
                      No messages yet. Say hello to start the conversation!
                    </p>
                  </div>
                ) : (
                  Object.entries(groupedMessages).map(([dateKey, msgs]) => (
                    <div key={dateKey}>
                      <div className="flex items-center justify-center my-4">
                        <span className="px-3 py-1 bg-white text-xs font-medium text-gray-500 rounded-full border border-gray-200">
                          {getDateLabel(dateKey)}
                        </span>
                      </div>
                      <div className="space-y-3">
                        {msgs.map((msg) => (
                          <div key={msg.id}>
                            <MessageBubble
                              message={msg}
                              isOwn={msg.senderId === mentorId}
                              onDelete={handleDeleteMessage}
                              onEdit={handleEditMessage}
                            />
                            {msg.senderId !== mentorId && <button type="button" onClick={() => handleReportMessage(msg)} className="ml-12 text-xs text-gray-500 underline decoration-dotted hover:text-rose-600">Report message</button>}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Pending Attachments */}
              {pendingAttachments.length > 0 && (
                <div className="px-4 py-2 border-t border-gray-200 bg-gray-50">
                  <div className="flex items-center space-x-2 overflow-x-auto">
                    {pendingAttachments.map((att, i) => (
                      <div key={i} className="relative flex-shrink-0">
                        {att.type?.startsWith('image/') ? (
                          <img src={att.url} alt={att.name} className="w-16 h-16 object-cover rounded-lg" />
                        ) : (
                          <div className="w-16 h-16 bg-white border border-gray-200 rounded-lg flex items-center justify-center">
                            <FileText className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                        <button
                          onClick={() => setPendingAttachments((prev) => prev.filter((_, idx) => idx !== i))}
                          className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Message Input */}
              <div className="p-4 border-t border-gray-200 bg-white flex-shrink-0">
                <div className="flex items-end space-x-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingAttachment}
                    className="p-2.5 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
                  >
                    {uploadingAttachment ? (
                      <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
                    ) : (
                      <Paperclip className="w-5 h-5 text-gray-600" />
                    )}
                  </button>
                  <div className="flex-1 relative">
                    <textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type a message..."
                      rows={1}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none max-h-32"
                      style={{ minHeight: '42px' }}
                    />
                  </div>
                  <button
                    onClick={handleSendMessage}
                    disabled={sending || (!newMessage.trim() && pendingAttachments.length === 0)}
                    className={cn(
                      'p-2.5 rounded-lg transition-colors',
                      'disabled:opacity-50 disabled:cursor-not-allowed',
                      newMessage.trim() || pendingAttachments.length > 0
                        ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                        : 'bg-gray-100 text-gray-400'
                    )}
                  >
                    {sending ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* New Conversation Modal */}
      {showNewConversationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50" onClick={() => setShowNewConversationModal(false)}>
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[80vh] overflow-hidden"
          >
            <div className="flex items-center justify-between p-5 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Start New Conversation</h3>
              <button onClick={() => setShowNewConversationModal(false)} className="p-1 rounded-lg hover:bg-gray-100">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-5 overflow-y-auto max-h-[60vh]">
              {availableMentees.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-300 mx-auto" />
                  <p className="mt-3 text-sm text-gray-500">No active mentees to message</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {availableMentees.map((mentee) => (
                    <button
                      key={mentee.id}
                      onClick={() => handleStartConversation(mentee)}
                      className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-left"
                    >
                      <Avatar
                        src={mentee.menteeAvatar || mentee.avatar}
                        name={mentee.menteeName || mentee.name}
                        size="md"
                      />
                      <div>
                        <p className="font-medium text-gray-900">{mentee.menteeName || mentee.name}</p>
                        <p className="text-sm text-gray-500">Mentee</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default MentorMessages;
