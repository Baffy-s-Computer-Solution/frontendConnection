// src/pages/mentor/MentorHelp.jsx
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  startAfter,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  increment,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytesResumable, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';
import { db, storage, auth } from '../../config/firebase';
import { supabase } from '../../config/supabase';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { 
  HelpCircle,
  MessageSquare,
  BookOpen,
  Video,
  FileText,
  Search,
  Filter,
  Plus,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  X,
  Check,
  CheckCircle,
  CheckCircle2,
  AlertCircle,
  Info,
  Clock,
  Clock3,
  Send,
  Paperclip,
  Image,
  Link,
  ExternalLink,
  Download,
  Upload,
  Eye,
  Edit2,
  Trash2,
  MoreVertical,
  RefreshCw,
  ThumbsUp,
  ThumbsDown,
  Star,
  Heart,
  Bookmark,
  Flag,
  Loader2,
  Search as SearchIcon,
  MessageCircle,
  Phone,
  Mail,
  Globe,
  Users,
  User,
  Calendar,
  Tag,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  BarChart3,
  PieChart,
  Activity,
  Zap,
  Award,
  Trophy,
  Crown,
  Sparkles,
  Rocket,
  Shield,
  Lock,
  Unlock,
  Key,
  Fingerprint,
  Building,
  Briefcase,
  GraduationCap,
  Target,
  Layers,
  Settings,
  Wrench,
  Bug,
  Lightbulb,
  Palette,
  Cpu,
  Database,
  Cloud,
  Server,
  Monitor,
  Smartphone,
  Tablet,
  Watch,
  Headphones,
  Mic,
  Camera,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Maximize,
  Minimize
} from 'lucide-react';

const ITEMS_PER_PAGE = 10;

const TICKET_STATUS = {
  OPEN: 'open',
  IN_PROGRESS: 'in_progress',
  WAITING_ON_USER: 'waiting_on_user',
  RESOLVED: 'resolved',
  CLOSED: 'closed'
};

const TICKET_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent'
};

const TICKET_CATEGORY = {
  TECHNICAL: 'technical',
  ACCOUNT: 'account',
  BILLING: 'billing',
  FEATURE: 'feature',
  BUG: 'bug',
  GENERAL: 'general'
};

const FAQ_CATEGORIES = [
  { id: 'getting-started', label: 'Getting Started', icon: Rocket },
  { id: 'profile', label: 'Profile & Account', icon: User },
  { id: 'mentorship', label: 'Mentorship', icon: Users },
  { id: 'sessions', label: 'Sessions', icon: Video },
  { id: 'payments', label: 'Payments', icon: DollarSign },
  { id: 'technical', label: 'Technical', icon: Cpu }
];

const HELP_ARTICLES = [
  {
    id: 'art-1',
    title: 'How to complete your mentor profile',
    category: 'profile',
    readTime: '5 min',
    content: 'A complete profile helps mentees find and trust you...',
    views: 1250,
    helpful: 89
  },
  {
    id: 'art-2',
    title: 'Setting up your availability calendar',
    category: 'sessions',
    readTime: '3 min',
    content: 'Learn how to set your available hours and sync with your calendar...',
    views: 980,
    helpful: 76
  },
  {
    id: 'art-3',
    title: 'Best practices for mentoring sessions',
    category: 'mentorship',
    readTime: '8 min',
    content: 'Prepare for productive sessions with these proven strategies...',
    views: 2100,
    helpful: 156
  },
  {
    id: 'art-4',
    title: 'Managing payments and withdrawals',
    category: 'payments',
    readTime: '6 min',
    content: 'Understand how to set your rates and withdraw earnings...',
    views: 750,
    helpful: 45
  },
  {
    id: 'art-5',
    title: 'Video call troubleshooting guide',
    category: 'technical',
    readTime: '4 min',
    content: 'Fix common issues with video, audio, and screen sharing...',
    views: 1800,
    helpful: 120
  }
];

const VIDEO_TUTORIALS = [
  {
    id: 'vid-1',
    title: 'Getting Started as a Mentor',
    duration: '5:32',
    thumbnail: null,
    views: 3400,
    category: 'getting-started'
  },
  {
    id: 'vid-2',
    title: 'Creating Engaging Sessions',
    duration: '8:15',
    thumbnail: null,
    views: 2200,
    category: 'sessions'
  },
  {
    id: 'vid-3',
    title: 'Building Your Mentor Brand',
    duration: '6:48',
    thumbnail: null,
    views: 1800,
    category: 'profile'
  },
  {
    id: 'vid-4',
    title: 'Payment Setup Tutorial',
    duration: '4:20',
    thumbnail: null,
    views: 950,
    category: 'payments'
  }
];

// Utility Functions
const formatDate = (timestamp) => {
  if (!timestamp) return 'N/A';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

const formatRelativeTime = (timestamp) => {
  if (!timestamp) return 'N/A';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(timestamp);
};

// Custom Hooks
const useTickets = (userId, filters = {}) => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    if (!userId) return;

    let q = query(
      collection(db, 'supportTickets'),
      where('userId', '==', userId)
    );

    if (filters.status && filters.status !== 'all') {
      q = query(q, where('status', '==', filters.status));
    }
    if (filters.category && filters.category !== 'all') {
      q = query(q, where('category', '==', filters.category));
    }

    q = query(q, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ticketsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTickets(ticketsData);
      setTotalCount(ticketsData.length);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching tickets:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId, filters.status, filters.category]);

  return { tickets, loading, totalCount };
};

const useTicketMessages = (ticketId) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ticketId) return;

    const q = query(
      collection(db, 'ticketMessages'),
      where('ticketId', '==', ticketId),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messagesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMessages(messagesData);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching messages:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [ticketId]);

  return { messages, loading };
};

// Sub-Components
const StatusBadge = ({ status }) => {
  const statusConfig = {
    [TICKET_STATUS.OPEN]: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', icon: AlertCircle, label: 'Open' },
    [TICKET_STATUS.IN_PROGRESS]: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', icon: Clock, label: 'In Progress' },
    [TICKET_STATUS.WAITING_ON_USER]: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', icon: MessageCircle, label: 'Waiting on You' },
    [TICKET_STATUS.RESOLVED]: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', icon: CheckCircle, label: 'Resolved' },
    [TICKET_STATUS.CLOSED]: { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200', icon: XCircle, label: 'Closed' }
  };

  const config = statusConfig[status] || statusConfig[TICKET_STATUS.OPEN];
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${config.bg} ${config.text} ${config.border}`}>
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
};

const PriorityBadge = ({ priority }) => {
  const priorityConfig = {
    [TICKET_PRIORITY.LOW]: { bg: 'bg-gray-50', text: 'text-gray-600', border: 'border-gray-200', label: 'Low' },
    [TICKET_PRIORITY.MEDIUM]: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200', label: 'Medium' },
    [TICKET_PRIORITY.HIGH]: { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200', label: 'High' },
    [TICKET_PRIORITY.URGENT]: { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-200', label: 'Urgent' }
  };

  const config = priorityConfig[priority] || priorityConfig[TICKET_PRIORITY.MEDIUM];

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${config.bg} ${config.text} ${config.border}`}>
      {config.label}
    </span>
  );
};

const Modal = ({ isOpen, onClose, title, children, size = 'md', showCloseButton = true }) => {
  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-6xl'
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose} />
        <div className={`inline-block w-full ${sizes[size]} p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            {showCloseButton && (
              <button
                onClick={onClose}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
          {children}
        </div>
      </div>
    </div>
  );
};

const Toast = ({ message, type = 'success', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const typeClasses = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-amber-50 border-amber-200 text-amber-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800'
  };

  const icons = {
    success: CheckCircle2,
    error: XCircle,
    warning: AlertCircle,
    info: Info
  };

  const Icon = icons[type];

  return (
    <div className={`fixed bottom-4 right-4 z-50 flex items-center gap-3 px-4 py-3 border rounded-lg shadow-lg ${typeClasses[type]} animate-slide-up`}>
      <Icon className="w-5 h-5" />
      <span className="text-sm font-medium">{message}</span>
      <button onClick={onClose} className="ml-2 p-1 hover:bg-white/50 rounded">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

const LoadingSpinner = ({ size = 'md', text }) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className="flex flex-col items-center justify-center py-8">
      <Loader2 className={`${sizes[size]} text-blue-600 animate-spin`} />
      {text && <p className="mt-2 text-sm text-gray-500">{text}</p>}
    </div>
  );
};

// Main Component
const MentorHelp = () => {
  const { currentUser, userProfile } = useAuth();
  const { showNotification } = useNotification();
  const [activeTab, setActiveTab] = useState('faq');
  const [filters, setFilters] = useState({ status: 'all', category: 'all', search: '' });
  const [showNewTicketModal, setShowNewTicketModal] = useState(false);
  const [showTicketDetails, setShowTicketDetails] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [toast, setToast] = useState(null);
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [newTicketForm, setNewTicketForm] = useState({
    subject: '',
    category: TICKET_CATEGORY.GENERAL,
    priority: TICKET_PRIORITY.MEDIUM,
    description: '',
    attachments: []
  });
  const [replyText, setReplyText] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  const { tickets, loading: ticketsLoading, totalCount } = useTickets(currentUser?.uid, filters);
  const { messages, loading: messagesLoading } = useTicketMessages(selectedTicket?.id);

  const filteredTickets = useMemo(() => {
    if (!filters.search) return tickets;
    const searchLower = filters.search.toLowerCase();
    return tickets.filter(t => 
      t.subject?.toLowerCase().includes(searchLower) ||
      t.description?.toLowerCase().includes(searchLower) ||
      t.ticketNumber?.toLowerCase().includes(searchLower)
    );
  }, [tickets, filters.search]);

  const filteredFaqs = useMemo(() => {
    if (!filters.search) return HELP_ARTICLES;
    const searchLower = filters.search.toLowerCase();
    return HELP_ARTICLES.filter(a => 
      a.title.toLowerCase().includes(searchLower) ||
      a.content.toLowerCase().includes(searchLower)
    );
  }, [filters.search]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleCreateTicket = async () => {
    if (!newTicketForm.subject.trim() || !newTicketForm.description.trim()) {
      setToast({ message: 'Please fill in all required fields', type: 'warning' });
      return;
    }

    try {
      const ticketNumber = `TKT-${Date.now().toString(36).toUpperCase()}`;
      
      const ticketData = {
        userId: currentUser.uid,
        userName: userProfile?.displayName || 'Mentor',
        userEmail: currentUser.email,
        userRole: 'mentor',
        ticketNumber,
        subject: newTicketForm.subject,
        category: newTicketForm.category,
        priority: newTicketForm.priority,
        description: newTicketForm.description,
        status: TICKET_STATUS.OPEN,
        attachments: newTicketForm.attachments,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        messageCount: 1
      };

      const docRef = await addDoc(collection(db, 'supportTickets'), ticketData);

      // Add initial message
      await addDoc(collection(db, 'ticketMessages'), {
        ticketId: docRef.id,
        senderId: currentUser.uid,
        senderName: userProfile?.displayName || 'Mentor',
        senderRole: 'mentor',
        message: newTicketForm.description,
        attachments: newTicketForm.attachments,
        createdAt: serverTimestamp()
      });

      // Sync to Supabase
      await supabase.from('support_tickets').insert({
        user_id: currentUser.uid,
        ticket_number: ticketNumber,
        subject: newTicketForm.subject,
        category: newTicketForm.category,
        priority: newTicketForm.priority,
        description: newTicketForm.description,
        status: 'open',
        created_at: new Date().toISOString()
      });

      setShowNewTicketModal(false);
      setNewTicketForm({
        subject: '',
        category: TICKET_CATEGORY.GENERAL,
        priority: TICKET_PRIORITY.MEDIUM,
        description: '',
        attachments: []
      });
      setToast({ message: `Ticket ${ticketNumber} created successfully!`, type: 'success' });
    } catch (error) {
      console.error('Error creating ticket:', error);
      setToast({ message: 'Failed to create ticket', type: 'error' });
    }
  };

  const handleSendReply = async () => {
    if (!replyText.trim() || !selectedTicket) return;

    try {
      await addDoc(collection(db, 'ticketMessages'), {
        ticketId: selectedTicket.id,
        senderId: currentUser.uid,
        senderName: userProfile?.displayName || 'Mentor',
        senderRole: 'mentor',
        message: replyText,
        attachments: [],
        createdAt: serverTimestamp()
      });

      await updateDoc(doc(db, 'supportTickets', selectedTicket.id), {
        updatedAt: serverTimestamp(),
        status: TICKET_STATUS.OPEN,
        messageCount: increment(1)
      });

      setReplyText('');
      setToast({ message: 'Reply sent!', type: 'success' });
    } catch (error) {
      console.error('Error sending reply:', error);
      setToast({ message: 'Failed to send reply', type: 'error' });
    }
  };

  const handleFileUpload = async (files) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const storageRef = ref(storage, `support-tickets/${currentUser.uid}/${Date.now()}_${file.name}`);
        const uploadTask = uploadBytesResumable(storageRef, file);

        return new Promise((resolve, reject) => {
          uploadTask.on('state_changed',
            (snapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              setUploadProgress(progress);
            },
            (error) => reject(error),
            async () => {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              resolve({
                name: file.name,
                url: downloadURL,
                size: file.size,
                type: file.type
              });
            }
          );
        });
      });

      const uploadedFiles = await Promise.all(uploadPromises);
      setNewTicketForm(prev => ({
        ...prev,
        attachments: [...prev.attachments, ...uploadedFiles]
      }));
      setToast({ message: `${uploadedFiles.length} file(s) uploaded!`, type: 'success' });
    } catch (error) {
      console.error('Error uploading files:', error);
      setToast({ message: 'Failed to upload files', type: 'error' });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleRemoveAttachment = (index) => {
    setNewTicketForm(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  const handleViewTicket = (ticket) => {
    setSelectedTicket(ticket);
    setShowTicketDetails(true);
  };

  const handleCloseTicket = async (ticketId) => {
    try {
      await updateDoc(doc(db, 'supportTickets', ticketId), {
        status: TICKET_STATUS.CLOSED,
        closedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      setToast({ message: 'Ticket closed', type: 'success' });
      setShowTicketDetails(false);
    } catch (error) {
      setToast({ message: 'Failed to close ticket', type: 'error' });
    }
  };

  const handleReopenTicket = async (ticketId) => {
    try {
      await updateDoc(doc(db, 'supportTickets', ticketId), {
        status: TICKET_STATUS.OPEN,
        reopenedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      setToast({ message: 'Ticket reopened', type: 'success' });
    } catch (error) {
      setToast({ message: 'Failed to reopen ticket', type: 'error' });
    }
  };

  const handleFaqHelpful = async (articleId, helpful) => {
    try {
      const article = HELP_ARTICLES.find(a => a.id === articleId);
      if (article) {
        article.helpful += helpful ? 1 : -1;
      }
      setToast({ message: helpful ? 'Thanks for your feedback!' : 'We\'ll improve this article', type: 'success' });
    } catch (error) {
      console.error('Error recording feedback:', error);
    }
  };

  // Render FAQ Tab
  const renderFaq = () => (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search help articles..."
          value={filters.search}
          onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
          className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Categories */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {FAQ_CATEGORIES.map((category) => {
          const CategoryIcon = category.icon;
          return (
            <button
              key={category.id}
              onClick={() => setFilters(prev => ({ 
                ...prev, 
                category: prev.category === category.id ? 'all' : category.id 
              }))}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
                filters.category === category.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm'
              }`}
            >
              <CategoryIcon className={`w-6 h-6 ${
                filters.category === category.id ? 'text-blue-600' : 'text-gray-500'
              }`} />
              <span className={`text-xs font-medium text-center ${
                filters.category === category.id ? 'text-blue-700' : 'text-gray-700'
              }`}>
                {category.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Articles */}
      <div className="space-y-3">
        {filteredFaqs
          .filter(a => filters.category === 'all' || a.category === filters.category)
          .map((article) => (
          <div 
            key={article.id}
            className="bg-white rounded-xl border border-gray-200 overflow-hidden"
          >
            <button
              onClick={() => setExpandedFaq(expandedFaq === article.id ? null : article.id)}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <FileText className="w-4 h-4 text-blue-600" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-900">{article.title}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-gray-500">{article.readTime} read</span>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs text-gray-500">{article.views} views</span>
                  </div>
                </div>
              </div>
              {expandedFaq === article.id ? (
                <ChevronUp className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              )}
            </button>
            {expandedFaq === article.id && (
              <div className="px-4 pb-4 border-t border-gray-100">
                <div className="pt-4 text-sm text-gray-600 leading-relaxed">
                  {article.content}
                </div>
                <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100">
                  <span className="text-xs text-gray-500">Was this helpful?</span>
                  <button
                    onClick={() => handleFaqHelpful(article.id, true)}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                  >
                    <ThumbsUp className="w-3 h-3" />
                    Yes ({article.helpful})
                  </button>
                  <button
                    onClick={() => handleFaqHelpful(article.id, false)}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <ThumbsDown className="w-3 h-3" />
                    No
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Video Tutorials */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Video Tutorials</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {VIDEO_TUTORIALS.map((video) => (
            <div 
              key={video.id}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="aspect-video bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <Play className="w-6 h-6 text-white ml-1" />
                </div>
              </div>
              <div className="p-4">
                <p className="font-medium text-gray-900 text-sm mb-1">{video.title}</p>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Clock className="w-3 h-3" />
                  {video.duration}
                  <span>•</span>
                  <span>{video.views} views</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Still Need Help */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-lg">
              <HelpCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Still need help?</h3>
              <p className="text-sm text-white/80">Our support team is here for you</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowNewTicketModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-white text-blue-600 rounded-lg font-medium hover:bg-white/90 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Ticket
            </button>
            <button
              onClick={() => setActiveTab('contact')}
              className="flex items-center gap-2 px-5 py-2.5 bg-white/20 text-white rounded-lg font-medium hover:bg-white/30 transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              Live Chat
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Render Tickets Tab
  const renderTickets = () => (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 w-full sm:w-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search tickets..."
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <select
          value={filters.status}
          onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
          className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Status</option>
          <option value={TICKET_STATUS.OPEN}>Open</option>
          <option value={TICKET_STATUS.IN_PROGRESS}>In Progress</option>
          <option value={TICKET_STATUS.WAITING_ON_USER}>Waiting on You</option>
          <option value={TICKET_STATUS.RESOLVED}>Resolved</option>
          <option value={TICKET_STATUS.CLOSED}>Closed</option>
        </select>
        <button
          onClick={() => setShowNewTicketModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Ticket
        </button>
      </div>

      {/* Tickets List */}
      {ticketsLoading ? (
        <LoadingSpinner text="Loading tickets..." />
      ) : filteredTickets.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 py-16">
          <div className="flex flex-col items-center justify-center px-4">
            <div className="p-4 bg-gray-100 rounded-full mb-4">
              <MessageSquare className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No tickets found</h3>
            <p className="text-sm text-gray-500 text-center max-w-md mb-6">
              {filters.search || filters.status !== 'all' 
                ? 'Try adjusting your filters' 
                : 'Create a support ticket and we\'ll get back to you'}
            </p>
            <button
              onClick={() => setShowNewTicketModal(true)}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Create Ticket
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="divide-y divide-gray-100">
            {filteredTickets.map((ticket) => (
              <div
                key={ticket.id}
                onClick={() => handleViewTicket(ticket)}
                className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-lg ${
                    ticket.priority === TICKET_PRIORITY.URGENT ? 'bg-red-50' :
                    ticket.priority === TICKET_PRIORITY.HIGH ? 'bg-amber-50' :
                    'bg-blue-50'
                  }`}>
                    <MessageSquare className={`w-5 h-5 ${
                      ticket.priority === TICKET_PRIORITY.URGENT ? 'text-red-600' :
                      ticket.priority === TICKET_PRIORITY.HIGH ? 'text-amber-600' :
                      'text-blue-600'
                    }`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs text-gray-500">{ticket.ticketNumber}</span>
                      <StatusBadge status={ticket.status} />
                      <PriorityBadge priority={ticket.priority} />
                    </div>
                    <p className="font-medium text-gray-900">{ticket.subject}</p>
                    <p className="text-sm text-gray-500 line-clamp-1 mt-1">{ticket.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right hidden sm:block">
                    <p className="text-xs text-gray-500">{formatRelativeTime(ticket.updatedAt || ticket.createdAt)}</p>
                    <p className="text-xs text-gray-400 capitalize">{ticket.category}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  // Render Contact Tab
  const renderContact = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Contact Methods */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Contact Us</h3>
        
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <Mail className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Email Support</p>
              <p className="text-sm text-gray-500 mt-1">Response within 24 hours</p>
              <a href="mailto:support@careerconnect.com" className="text-sm text-blue-600 hover:text-blue-700 mt-2 inline-block">
                support@careerconnect.com
              </a>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-4 flex items-start gap-4">
            <div className="p-3 bg-green-50 rounded-lg">
              <MessageCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Live Chat</p>
              <p className="text-sm text-gray-500 mt-1">Mon-Fri, 9AM-6PM SAST</p>
              <button className="text-sm text-green-600 hover:text-green-700 mt-2 inline-flex items-center gap-1">
                Start Chat
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-4 flex items-start gap-4">
            <div className="p-3 bg-purple-50 rounded-lg">
              <Phone className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Phone Support</p>
              <p className="text-sm text-gray-500 mt-1">For urgent matters only</p>
              <a href="tel:+27123456789" className="text-sm text-purple-600 hover:text-purple-700 mt-2 inline-block">
                +27 12 345 6789
              </a>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-4 flex items-start gap-4">
            <div className="p-3 bg-amber-50 rounded-lg">
              <BookOpen className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Documentation</p>
              <p className="text-sm text-gray-500 mt-1">Browse our knowledge base</p>
              <button 
                onClick={() => setActiveTab('faq')}
                className="text-sm text-amber-600 hover:text-amber-700 mt-2 inline-flex items-center gap-1"
              >
                View Articles
                <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* Office Hours */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-500" />
            Support Hours
          </h4>
          <div className="space-y-2">
            {[
              { day: 'Monday - Friday', hours: '9:00 AM - 6:00 PM' },
              { day: 'Saturday', hours: '10:00 AM - 2:00 PM' },
              { day: 'Sunday', hours: 'Closed' },
              { day: 'Public Holidays', hours: 'Closed' }
            ].map((schedule) => (
              <div key={schedule.day} className="flex items-center justify-between text-sm">
                <span className="text-gray-600">{schedule.day}</span>
                <span className={`font-medium ${schedule.hours === 'Closed' ? 'text-gray-400' : 'text-gray-900'}`}>
                  {schedule.hours}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Contact Form */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Send Us a Message</h3>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
              <input
                type="text"
                value={newTicketForm.subject}
                onChange={(e) => setNewTicketForm(prev => ({ ...prev, subject: e.target.value }))}
                placeholder="Brief description of your issue"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={newTicketForm.category}
                onChange={(e) => setNewTicketForm(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={TICKET_CATEGORY.GENERAL}>General Inquiry</option>
                <option value={TICKET_CATEGORY.TECHNICAL}>Technical Support</option>
                <option value={TICKET_CATEGORY.ACCOUNT}>Account Issues</option>
                <option value={TICKET_CATEGORY.BILLING}>Billing</option>
                <option value={TICKET_CATEGORY.FEATURE}>Feature Request</option>
                <option value={TICKET_CATEGORY.BUG}>Report a Bug</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
              <textarea
                value={newTicketForm.description}
                onChange={(e) => setNewTicketForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe your issue in detail..."
                rows={5}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>
            <button
              onClick={handleCreateTicket}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              <Send className="w-4 h-4" />
              Send Message
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
                <HelpCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Help Center</h1>
                <p className="text-sm text-gray-500">Find answers and get support</p>
              </div>
            </div>
            <button
              onClick={() => setShowNewTicketModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Ticket
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-6">
            {[
              { id: 'faq', label: 'FAQ & Articles', icon: BookOpen },
              { id: 'tickets', label: 'My Tickets', icon: MessageSquare, count: totalCount },
              { id: 'contact', label: 'Contact Us', icon: Mail }
            ].map((tab) => {
              const TabIcon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-4 border-b-2 text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <TabIcon className="w-4 h-4" />
                  {tab.label}
                  {tab.count !== undefined && tab.count > 0 && (
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      activeTab === tab.id ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'faq' && renderFaq()}
        {activeTab === 'tickets' && renderTickets()}
        {activeTab === 'contact' && renderContact()}
      </div>

      {/* New Ticket Modal */}
      <Modal
        isOpen={showNewTicketModal}
        onClose={() => setShowNewTicketModal(false)}
        title="Create Support Ticket"
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subject <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={newTicketForm.subject}
              onChange={(e) => setNewTicketForm(prev => ({ ...prev, subject: e.target.value }))}
              placeholder="Brief description of your issue"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={newTicketForm.category}
                onChange={(e) => setNewTicketForm(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={TICKET_CATEGORY.GENERAL}>General Inquiry</option>
                <option value={TICKET_CATEGORY.TECHNICAL}>Technical Support</option>
                <option value={TICKET_CATEGORY.ACCOUNT}>Account Issues</option>
                <option value={TICKET_CATEGORY.BILLING}>Billing</option>
                <option value={TICKET_CATEGORY.FEATURE}>Feature Request</option>
                <option value={TICKET_CATEGORY.BUG}>Report a Bug</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select
                value={newTicketForm.priority}
                onChange={(e) => setNewTicketForm(prev => ({ ...prev, priority: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={TICKET_PRIORITY.LOW}>Low</option>
                <option value={TICKET_PRIORITY.MEDIUM}>Medium</option>
                <option value={TICKET_PRIORITY.HIGH}>High</option>
                <option value={TICKET_PRIORITY.URGENT}>Urgent</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={newTicketForm.description}
              onChange={(e) => setNewTicketForm(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe your issue in detail..."
              rows={5}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Attachments</label>
            <div className="border-2 border-dashed border-gray-200 rounded-lg p-4">
              {newTicketForm.attachments.length > 0 && (
                <div className="space-y-2 mb-4">
                  {newTicketForm.attachments.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Paperclip className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-700">{file.name}</span>
                      </div>
                      <button
                        onClick={() => handleRemoveAttachment(index)}
                        className="p-1 text-gray-400 hover:text-red-600 rounded"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={(e) => handleFileUpload(e.target.files)}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="w-full flex items-center justify-center gap-2 py-2 text-sm text-gray-600 hover:text-blue-600 transition-colors"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Uploading... {Math.round(uploadProgress)}%
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Click to upload files
                  </>
                )}
              </button>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setShowNewTicketModal(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateTicket}
              disabled={uploading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              Create Ticket
            </button>
          </div>
        </div>
      </Modal>

      {/* Ticket Details Modal */}
      <Modal
        isOpen={showTicketDetails}
        onClose={() => setShowTicketDetails(false)}
        title={selectedTicket?.subject || 'Ticket Details'}
        size="xl"
      >
        {selectedTicket && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
              <span className="font-mono text-sm text-gray-500">{selectedTicket.ticketNumber}</span>
              <StatusBadge status={selectedTicket.status} />
              <PriorityBadge priority={selectedTicket.priority} />
              <span className="text-xs text-gray-400 capitalize ml-auto">{selectedTicket.category}</span>
            </div>

            <div className="max-h-96 overflow-y-auto space-y-4">
              {messagesLoading ? (
                <LoadingSpinner text="Loading messages..." />
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex gap-3 ${msg.senderRole === 'mentor' ? 'flex-row-reverse' : ''}`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0 ${
                      msg.senderRole === 'mentor' ? 'bg-blue-500' : 'bg-purple-500'
                    }`}>
                      {msg.senderName?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <div className={`flex-1 max-w-[80%] ${msg.senderRole === 'mentor' ? 'text-right' : ''}`}>
                      <div className={`inline-block p-3 rounded-xl ${
                        msg.senderRole === 'mentor' 
                          ? 'bg-blue-50 text-blue-900' 
                          : 'bg-gray-100 text-gray-900'
                      }`}>
                        <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        {msg.senderName} • {formatRelativeTime(msg.createdAt)}
                      </p>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {selectedTicket.status !== TICKET_STATUS.CLOSED && (
              <div className="pt-4 border-t border-gray-100">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendReply()}
                    placeholder="Type your reply..."
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={handleSendReply}
                    disabled={!replyText.trim()}
                    className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex justify-between mt-3">
                  <button
                    onClick={() => handleCloseTicket(selectedTicket.id)}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    Close Ticket
                  </button>
                </div>
              </div>
            )}

            {selectedTicket.status === TICKET_STATUS.CLOSED && (
              <div className="pt-4 border-t border-gray-100 text-center">
                <p className="text-sm text-gray-500 mb-3">This ticket is closed</p>
                <button
                  onClick={() => handleReopenTicket(selectedTicket.id)}
                  className="px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  Reopen Ticket
                </button>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default MentorHelp;