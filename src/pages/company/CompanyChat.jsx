// src/pages/company/CompanyChat.jsx
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
/* eslint-disable react/no-unescaped-entities */
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FaCommentDots, FaComment, FaComments, FaPaperPlane, FaSearch, FaUser, FaUsers, FaUserCircle, FaEllipsisV, FaEllipsisH, FaPhone, FaVideo, FaPaperclip, FaSmile, FaImage, FaFile, FaMicrophone, FaTimes, FaCheck, FaCheckDouble, FaClock, FaBell, FaBellSlash, FaStar, FaRegStar, FaBookmark, FaRegBookmark, FaArchive, FaTrash, FaEdit, FaReply, FaForward, FaCopy, FaLink, FaExternalLinkAlt, FaDownload, FaUpload, FaCloudUploadAlt, FaSpinner, FaExclamationTriangle, FaInfoCircle, FaPlus, FaMinus, FaChevronLeft, FaChevronRight, FaChevronDown, FaChevronUp, FaArrowLeft, FaArrowRight, FaSync, FaFilter, FaSort, FaSortAmountDown, FaSortAmountUp, FaThumbtack, FaThumbtack as FaThumbtackSolid, FaFire, FaSnowflake, FaSun, FaMoon, FaRegSmile, FaRegLaugh, FaRegHeart, FaHeart, FaRegThumbsUp, FaThumbsUp, FaRegThumbsDown, FaThumbsDown, FaRegFrown, FaFrown, FaRegMeh, FaMeh, FaRegSurprise, FaSurprise, FaRegAngry, FaAngry, FaRegSadTear, FaSadTear, FaRegTired, FaTired, FaRegGrin, FaGrin, FaRegGrinBeam, FaGrinBeam, FaGrinStars, FaGrinHearts, FaKissWinkHeart, FaLaughSquint, FaLaughBeam, FaSmileBeam, FaSmileWink, FaGrinTongueWink, FaGrinTongueSquint, FaGrinTears, FaGrinSquintTears, FaGrinSquint, FaGrinAlt, FaGrimace, FaGrinBeamSweat, FaFlushed, FaDizzy, FaGrinWink, FaEye, FaEyeSlash, FaCog, FaSlidersH, FaToggleOn, FaToggleOff, FaVolumeUp, FaVolumeMute, FaVolumeDown, FaMicrophoneAlt, FaMicrophoneSlash, FaHeadphones, FaHeadphonesAlt, FaPhoneAlt, FaPhoneSlash, FaPhoneVolume, FaVideoSlash, FaCamera, FaCameraRetro, FaPhotoVideo, FaImages, FaFileAlt, FaFilePdf, FaFileWord, FaFileExcel, FaFilePowerpoint, FaFileArchive, FaFileCode, FaFileAudio, FaFileVideo, FaFileImage, FaFolder, FaFolderOpen, FaHdd, FaCloud, FaCloudDownloadAlt, FaBolt, FaRocket, FaFlag, FaBan, FaUserPlus, FaUserMinus, FaUserCheck, FaUserTimes, FaUserFriends, FaUsersCog, FaUserTie, FaBriefcase, FaBuilding, FaMapMarkerAlt, FaGlobe, FaWifi, FaCircle, FaDotCircle, FaRegCircle, FaRegDotCircle, FaInfo, FaQuestion, FaExclamation, FaCheckCircle, FaTimesCircle, FaExclamationCircle, FaQuestionCircle, FaPlusCircle, FaMinusCircle, FaShare, FaShareAlt, FaShareSquare, FaRetweet, FaQuoteLeft, FaQuoteRight, FaHashtag, FaAt, FaPercentage, FaAsterisk, FaBold, FaItalic, FaUnderline, FaStrikethrough, FaCode, FaTerminal, FaKeyboard, FaMouse, FaDesktop, FaLaptop, FaTabletAlt, FaMobileAlt, FaPrint, FaInbox, FaPaperPlane as FaPaperPlaneSolid, FaSms, FaEnvelope, FaEnvelopeOpen, FaEnvelopeOpenText, FaMailBulk, FaBoxOpen, FaBox, FaGift, FaBirthdayCake, FaGlassCheers, FaHandshake, FaHandsHelping, FaHandHoldingHeart, FaPrayingHands, FaPray, FaPeace, FaYinYang, FaDove, FaFeather, FaLeaf, FaSeedling, FaTree, FaSpa, FaHotTub, FaUmbrellaBeach, FaPlane, FaRocket as FaRocketSolid, FaCompass, FaMap, FaMapMarked, FaMapMarkedAlt, FaMapPin, FaDirections, FaRoute, FaCrosshairs, FaLocationArrow, FaAnchor, FaShip, FaLifeRing, FaSwimmer, FaWater, FaTint, FaFish, FaDragon, FaCrown, FaGem, FaTrophy, FaAward, FaMedal, FaStar as FaStarSolid, FaHeart as FaHeartSolid, FaBolt as FaBoltSolid, FaFire as FaFireSolid, FaSnowflake as FaSnowflakeSolid, FaSun as FaSunSolid, FaMoon as FaMoonSolid, FaCloudSun, FaCloudMoon, FaCloudRain, FaWind, FaUmbrella, FaRainbow, FaMeteor, FaSpaceShuttle, FaSatellite, FaUserAstronaut, FaGlobeAmericas, FaGlobeEurope, FaGlobeAsia, FaGlobeAfrica } from "react-icons/fa";
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
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { db, storage } from '../../config/firebase';
import cloudinaryService from '../../services/cloudinaryService';
import socialPlatformService from '../../services/socialPlatformService';

// ============================================
// UTILITY FUNCTIONS
// ============================================

const formatMessageTime = (date) => {
  if (!date) return 'Just now';
  const now = new Date();
  const past = date instanceof Date ? date : date?.toDate?.() || new Date(date);
  if (isNaN(past.getTime())) return 'Just now';
  
  const diffMs = now - past;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}d`;
  return past.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const formatConversationTime = (date) => {
  if (!date) return '';
  const now = new Date();
  const past = date instanceof Date ? date : date?.toDate?.() || new Date(date);
  if (isNaN(past.getTime())) return '';

  const diffMs = now - past;
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffDays === 0) {
    return past.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return past.toLocaleDateString('en-US', { weekday: 'short' });
  } else {
    return past.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
};

// ============================================
// CUSTOM HOOKS
// ============================================

const useConversations = (userId) => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'conversations'),
      where('participants', 'array-contains', userId),
      orderBy('updatedAt', 'desc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(
      q,
      async (snapshot) => {
        const conversationsData = await Promise.all(
          snapshot.docs.map(async (docSnapshot) => {
            const data = docSnapshot.data();
            
            // Fetch other participants' details
            const otherParticipantIds = (data.participants || []).filter(id => id !== userId);
            const participants = await Promise.all(
              otherParticipantIds.map(async (pid) => {
                try {
                  const userDoc = await getDoc(doc(db, 'users', pid));
                  if (userDoc.exists()) {
                    return { id: pid, ...userDoc.data() };
                  }
                } catch (err) {
                  console.log('Error fetching participant:', err);
                }
                return { id: pid, name: 'Unknown User' };
              })
            );

            return {
              id: docSnapshot.id,
              ...data,
              participants,
              updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
              createdAt: data.createdAt?.toDate?.() || data.createdAt,
            };
          })
        );

        setConversations(conversationsData);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching conversations:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  return { conversations, loading, error };
};

const useMessages = (conversationId) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!conversationId) {
      setMessages([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'messages'),
      where('conversationId', '==', conversationId),
      orderBy('createdAt', 'asc'),
      limit(200)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messagesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt,
      }));
      setMessages(messagesData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [conversationId]);

  return { messages, loading };
};

// ============================================
// COMPONENTS
// ============================================

const ConversationItem = ({ conversation, isActive, currentUserId, onClick }) => {
  const otherParticipant = conversation.participants?.find(p => p.id !== currentUserId);
  const lastMessage = conversation.lastMessage || 'No messages yet';
  const unreadCount = conversation.unreadCount?.[currentUserId] || 0;

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-start gap-3 p-4 transition-colors text-left ${
        isActive 
          ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-600' 
          : 'hover:bg-gray-50 dark:hover:bg-gray-700/50 border-l-4 border-transparent'
      }`}
    >
      <div className="relative flex-shrink-0">
        {otherParticipant?.avatar ? (
          <img
            src={otherParticipant.avatar}
            alt={otherParticipant.name}
            className="w-12 h-12 rounded-full object-cover"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
            {otherParticipant?.name?.charAt(0) || 'U'}
          </div>
        )}
        {otherParticipant?.isOnline && (
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <h4 className="font-medium text-gray-900 dark:text-white truncate">
            {otherParticipant?.name || otherParticipant?.displayName || 'Unknown User'}
          </h4>
          <span className="text-xs text-gray-400 flex-shrink-0">
            {formatConversationTime(conversation.updatedAt)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-2 mt-1">
          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
            {lastMessage}
          </p>
          {unreadCount > 0 && (
            <span className="flex-shrink-0 w-5 h-5 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  );
};

const MessageBubble = ({ message, isOwn, showAvatar, sender }) => {
  const [showActions, setShowActions] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-end gap-2 mb-4 ${isOwn ? 'flex-row-reverse' : ''}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Avatar */}
      {!isOwn && (
        <div className={`flex-shrink-0 ${showAvatar ? '' : 'invisible'}`}>
          {sender?.avatar ? (
            <img
              src={sender.avatar}
              alt={sender.name}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-semibold">
              {sender?.name?.charAt(0) || 'U'}
            </div>
          )}
        </div>
      )}

      {/* Message Content */}
      <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} max-w-[70%]`}>
        <div
          className={`px-4 py-2.5 rounded-2xl ${
            isOwn
              ? 'bg-blue-600 text-white rounded-br-md'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-md'
          }`}
        >
          <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
          
          {/* Attachments */}
          {message.attachments && message.attachments.length > 0 && (
            <div className="mt-2 space-y-2">
              {message.attachments.map((attachment, index) => (
                <div key={index}>
                  {attachment.type?.startsWith('image/') ? (
                    <img
                      src={attachment.url}
                      alt={attachment.name}
                      className="max-w-full rounded-lg cursor-pointer"
                      onClick={() => window.open(attachment.url, '_blank')}
                    />
                  ) : (
                    <a
                      href={attachment.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center gap-2 p-2 rounded-lg ${
                        isOwn ? 'bg-blue-700' : 'bg-white dark:bg-gray-600'
                      }`}
                    >
                      <FaFile className="w-4 h-4" />
                      <span className="text-xs truncate">{attachment.name}</span>
                      <FaDownload className="w-3 h-3 ml-auto" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className={`flex items-center gap-2 mt-1 text-xs text-gray-400 ${isOwn ? 'flex-row-reverse' : ''}`}>
          <span>{formatMessageTime(message.createdAt)}</span>
          {isOwn && (
            <>
              {message.status === 'sent' && <FaCheck className="w-3 h-3" />}
              {message.status === 'delivered' && <FaCheckDouble className="w-3 h-3" />}
              {message.status === 'read' && <FaCheckDouble className="w-3 h-3 text-blue-500" />}
            </>
          )}
        </div>
      </div>

      {/* Actions */}
      <AnimatePresence>
        {showActions && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex items-center gap-1"
          >
            <button
              onClick={() => {/* Add reaction */}}
              className="p-1.5 text-gray-400 hover:text-yellow-500 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <FaRegSmile className="w-3 h-3" />
            </button>
            <button
              onClick={() => {/* Reply */}}
              className="p-1.5 text-gray-400 hover:text-blue-500 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <FaReply className="w-3 h-3" />
            </button>
            <button
              onClick={() => {/* More options */}}
              className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <FaEllipsisV className="w-3 h-3" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================

const CompanyChat = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { currentUser, userProfile } = useAuth();
  const { showNotification } = useNotification();

  const userId = currentUser?.uid;
  const preselectedCandidateId = searchParams.get('candidate');

  const { conversations, loading: conversationsLoading, error: conversationsError } = useConversations(userId);

  // Local state
  const [activeConversation, setActiveConversation] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [sending, setSending] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [showNewChat, setShowNewChat] = useState(false);
  const [followerCandidates, setFollowerCandidates] = useState([]);
  const [followersReady, setFollowersReady] = useState(false);
  const [followerSearch, setFollowerSearch] = useState('');

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const messageInputRef = useRef(null);

  const { messages, loading: messagesLoading } = useMessages(activeConversation?.id);

  useEffect(() => {
    if (!userId) return undefined;
    setFollowersReady(false);
    const followersQuery = query(collection(db, 'companyFollowers'), where('companyId', '==', userId), orderBy('followedAt', 'desc'), limit(200));
    return onSnapshot(followersQuery, async (snapshot) => {
      const followers = await Promise.all(snapshot.docs.map(async (item) => {
        const data = item.data();
        const followerId = data.studentId || data.userId;
        if (!followerId || data.status === 'inactive') return null;
        const edgeSnapshot = await getDoc(doc(db, 'company_chat_followers', `${userId}_${followerId}`)).catch(() => null);
        if (!edgeSnapshot?.exists() || edgeSnapshot.data()?.status === 'inactive') return null;
        const [userSnapshot, blockSnapshot] = await Promise.all([
          getDoc(doc(db, 'users', followerId)).catch(() => null),
          getDoc(doc(db, 'social_blocks', `${followerId}_${userId}`)).catch(() => null),
        ]);
        if (!userSnapshot?.exists() || blockSnapshot?.exists()) return null;
        const user = userSnapshot.data();
        const consent = user.privacySettings?.messageConsent || user.privacy?.messageConsent || 'connections';
        if (consent !== 'followers' && consent !== 'everyone') return null;
        return { id: followerId, ...userSnapshot.data() };
      }));
      setFollowerCandidates(followers.filter(Boolean));
      setFollowersReady(true);
    }, (error) => {
      console.error('Unable to load company followers for chat:', error);
      showNotification('error', 'Unable to load company followers. Please try again later.');
    });
  }, [userId]);

  // Check mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Auto-select conversation from URL
  useEffect(() => {
    if (preselectedCandidateId && followersReady && conversations.length > 0) {
      const conv = conversations.find(c => 
        c.participants?.some(p => p.id === preselectedCandidateId)
      );
      if (conv) {
        setActiveConversation(conv);
        setShowMobileSidebar(false);
      } else {
        // Create new conversation
        createConversation(preselectedCandidateId);
      }
    }
  }, [preselectedCandidateId, conversations, followersReady, followerCandidates]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Filtered conversations
  const filteredConversations = useMemo(() => {
    if (!searchTerm) return conversations;
    
    const term = searchTerm.toLowerCase();
    return conversations.filter(conv => {
      const otherParticipant = conv.participants?.find(p => p.id !== userId);
      return (
        otherParticipant?.name?.toLowerCase().includes(term) ||
        otherParticipant?.displayName?.toLowerCase().includes(term) ||
        conv.lastMessage?.toLowerCase().includes(term)
      );
    });
  }, [conversations, searchTerm, userId]);

  // ============================================
  // HANDLERS
  // ============================================

  const createConversation = async (otherUserId) => {
    if (!userId || !otherUserId) return;
    if (!followerCandidates.some((candidate) => candidate.id === otherUserId)) {
      showNotification('warning', 'Company chat is available only with people who follow this company.');
      return;
    }

    try {
      // Check if conversation already exists
      const existingQuery = query(
        collection(db, 'conversations'),
        where('participants', 'array-contains', userId)
      );

      const snapshot = await getDocs(existingQuery);
      const existing = snapshot.docs.find(doc => {
        const data = doc.data();
        return data.participants?.includes(otherUserId);
      });

      if (existing) {
        setActiveConversation({ id: existing.id, ...existing.data() });
        return;
      }

      // Fetch other user details
      const otherUserDoc = await getDoc(doc(db, 'users', otherUserId));
      const otherUser = otherUserDoc.exists() ? otherUserDoc.data() : {};
      const consent = otherUser.privacySettings?.messageConsent || otherUser.privacy?.messageConsent || 'connections';
      if (consent !== 'followers' && consent !== 'everyone') {
        showNotification('warning', 'This member is not accepting new messages from company followers.');
        return;
      }

      // Create new conversation
      const convRef = await addDoc(collection(db, 'conversations'), {
        participants: [userId, otherUserId],
        participantDetails: {
          [userId]: {
            name: userProfile?.companyName || userProfile?.displayName || 'Company',
            avatar: userProfile?.logo || null,
            type: 'company',
          },
          [otherUserId]: {
            name: otherUser.name || otherUser.displayName || 'User',
            avatar: otherUser.avatar || otherUser.photoURL || null,
            type: 'candidate',
          },
        },
        lastMessage: '',
        lastMessageAt: serverTimestamp(),
        unreadCount: {
          [userId]: 0,
          [otherUserId]: 0,
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // Fetch the new conversation
      const newConvDoc = await getDoc(convRef);
      if (newConvDoc.exists()) {
        setActiveConversation({
          id: newConvDoc.id,
          ...newConvDoc.data(),
          participants: [
            { id: userId, name: userProfile?.companyName || userProfile?.displayName || 'Company', avatar: userProfile?.logo || null, type: 'company' },
            { id: otherUserId, name: otherUser.name || otherUser.displayName || 'Member', avatar: otherUser.avatar || otherUser.photoURL || null, type: otherUser.userType || 'member' },
          ],
        });
        setShowMobileSidebar(false);
      }
    } catch (error) {
      console.error('Error creating conversation:', error);
      showNotification('error', 'Failed to start conversation');
    }
  };

  const handleSendMessage = async () => {
    if ((!messageInput.trim() && attachments.length === 0) || !activeConversation) return;

    try {
      setSending(true);

      const messageData = {
        conversationId: activeConversation.id,
        senderId: userId,
        senderName: userProfile?.companyName || userProfile?.displayName || 'Company',
        senderAvatar: userProfile?.logo || null,
        content: messageInput.trim(),
        attachments: attachments.length > 0 ? attachments : null,
        status: 'sent',
        createdAt: serverTimestamp(),
      };

      // Add message to Firebase
      await addDoc(collection(db, 'messages'), messageData);

      // Update conversation
      const otherParticipantId = activeConversation.participants?.find(p => p.id !== userId);
      
      await updateDoc(doc(db, 'conversations', activeConversation.id), {
        lastMessage: messageInput.trim() || 'Sent an attachment',
        lastMessageAt: serverTimestamp(),
        lastMessageSenderId: userId,
        [`unreadCount.${otherParticipantId}`]: increment(1),
        updatedAt: serverTimestamp(),
      });

      // Notify recipient
      if (otherParticipantId) {
        await addDoc(collection(db, 'notifications'), {
          userId: otherParticipantId,
          type: 'new_message',
          title: 'New Message',
          message: `${userProfile?.companyName || 'A company'} sent you a message`,
          conversationId: activeConversation.id,
          read: false,
          createdAt: serverTimestamp(),
        });
      }

      setMessageInput('');
      setAttachments([]);
      setShowEmojiPicker(false);
    } catch (error) {
      console.error('Error sending message:', error);
      showNotification('error', 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleReportMessage = async (message) => {
    const reason = window.prompt('Why are you reporting this message?');
    if (!reason?.trim()) return;
    try {
      await socialPlatformService.reportContent({ targetType: 'message', targetId: message.id, ownerId: message.senderId, reason });
      showNotification('success', 'Message report submitted privately.');
    } catch (error) { showNotification('error', error.message || 'Unable to submit message report.'); }
  };

  const handleBlockParticipant = async () => {
    if (!otherParticipant?.id || !window.confirm(`Block ${otherParticipant.name || 'this member'}? This prevents future chats and hides social content.`)) return;
    try {
      await socialPlatformService.blockUser(otherParticipant.id, otherParticipant.name);
      setActiveConversation(null);
      showNotification('success', 'Member blocked.');
    } catch (error) { showNotification('error', error.message || 'Unable to block this member.'); }
  };

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    try {
      setUploading(true);
      const uploadedFiles = [];

      for (const file of files) {
        // Validate file
        if (file.size > 10 * 1024 * 1024) {
          showNotification('warning', `${file.name} is too large (max 10MB)`);
          continue;
        }

        // Upload to Cloudinary
        const isImage = file.type.startsWith('image/');
        const result = isImage
          ? await cloudinaryService.uploadImage(file, {
              folder: 'career-connect/chat',
              publicId: `chat-${activeConversation.id}-${Date.now()}`,
            })
          : await cloudinaryService.uploadFile(file, {
              folder: 'career-connect/chat',
              publicId: `chat-${activeConversation.id}-${Date.now()}`,
            });

        if (result.success) {
          uploadedFiles.push({
            id: Date.now() + Math.random(),
            name: file.name,
            type: file.type,
            size: file.size,
            url: result.url,
            publicId: result.publicId,
          });
        }
      }

      setAttachments(prev => [...prev, ...uploadedFiles]);
    } catch (error) {
      console.error('Error uploading files:', error);
      showNotification('error', 'Failed to upload files');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveAttachment = (attachmentId) => {
    setAttachments(prev => prev.filter(a => a.id !== attachmentId));
  };

  const handleEmojiSelect = (emoji) => {
    setMessageInput(prev => prev + emoji);
    messageInputRef.current?.focus();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSelectConversation = async (conversation) => {
    setActiveConversation(conversation);
    setShowMobileSidebar(false);

    // Mark as read
    if (conversation.unreadCount?.[userId] > 0) {
      try {
        await updateDoc(doc(db, 'conversations', conversation.id), {
          [`unreadCount.${userId}`]: 0,
        });
      } catch (error) {
        console.error('Error marking as read:', error);
      }
    }
  };

  // ============================================
  // RENDER
  // ============================================

  const otherParticipant = activeConversation?.participants?.find(p => p.id !== userId);

  return (
    <div className="flex h-[calc(100dvh-4rem)] min-h-[32rem] min-w-0 overflow-hidden bg-gray-50 dark:bg-gray-900 lg:h-[calc(100dvh-3rem)]">
      {/* Sidebar - Conversations List */}
      <div className={`w-full md:w-80 lg:w-96 bg-white dark:bg-gray-800 border-r border-gray-100 dark:border-gray-700 flex flex-col ${
        isMobile && !showMobileSidebar ? 'hidden' : ''
      }`}>
        {/* Header */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-700">
          <div className="mb-4 flex items-center justify-between gap-2">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <FaCommentDots className="w-6 h-6 text-blue-600" />
              Messages
            </h1>
            <button type="button" onClick={() => setShowNewChat(true)} className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700" aria-label="Start a chat with a company follower"><FaPlus/><span className="hidden sm:inline">New chat</span></button>
          </div>

          {/* Search */}
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {conversationsLoading ? (
            <div className="p-4 space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 animate-pulse">
                  <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : conversationsError ? (
            <div className="p-4 text-center text-red-500">
              <FaExclamationTriangle className="w-8 h-8 mx-auto mb-2" />
              <p className="text-sm">{conversationsError}</p>
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="p-8 text-center">
              <FaComments className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">
                {searchTerm ? 'No conversations found' : 'No conversations yet'}
              </p>
            </div>
          ) : (
            filteredConversations.map((conversation) => (
              <ConversationItem
                key={conversation.id}
                conversation={conversation}
                isActive={activeConversation?.id === conversation.id}
                currentUserId={userId}
                onClick={() => handleSelectConversation(conversation)}
              />
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className={`min-w-0 flex-1 flex-col ${isMobile && showMobileSidebar ? 'hidden' : 'flex'}`}>
        {activeConversation ? (
          <>
            {/* Chat Header */}
            <div className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {isMobile && (
                    <button
                      onClick={() => setShowMobileSidebar(true)}
                      className="p-2 text-gray-400 hover:text-gray-600"
                    >
                      <FaArrowLeft className="w-5 h-5" />
                    </button>
                  )}

                  {otherParticipant?.avatar ? (
                    <img
                      src={otherParticipant.avatar}
                      alt={otherParticipant.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                      {otherParticipant?.name?.charAt(0) || 'U'}
                    </div>
                  )}

                  <div>
                    <h2 className="font-semibold text-gray-900 dark:text-white">
                      {otherParticipant?.name || otherParticipant?.displayName || 'Unknown User'}
                    </h2>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      {otherParticipant?.isOnline ? (
                        <>
                          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                          Online
                        </>
                      ) : (
                        'Offline'
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                    <FaPhone className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                    <FaVideo className="w-4 h-4" />
                  </button>
                  <button type="button" onClick={handleBlockParticipant} title="Block member" aria-label="Block member" className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"><FaBan className="w-4 h-4" /></button>
                  <button type="button" onClick={async () => { const reason = window.prompt('Why are you reporting this profile?'); if (!reason?.trim()) return; try { await socialPlatformService.reportContent({ targetType: 'profile', targetId: otherParticipant?.id, ownerId: otherParticipant?.id, reason }); showNotification('success', 'Profile report submitted privately.'); } catch (error) { showNotification('error', error.message || 'Unable to submit report.'); } }} title="Report profile" aria-label="Report profile" className="p-2 text-gray-400 hover:text-amber-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"><FaFlag className="w-4 h-4" /></button>
                  <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                    <FaEllipsisV className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900">
              {messagesLoading ? (
                <div className="flex justify-center py-8">
                  <FaSpinner className="w-6 h-6 text-blue-600 animate-spin" />
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-16">
                  <FaCommentDots className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Start a conversation
                  </h3>
                  <p className="text-sm text-gray-500">
                    Send your first message to {otherParticipant?.name}
                  </p>
                </div>
              ) : (
                <>
                  {messages.map((message, index) => (
                    <div key={message.id} className="group relative">
                      <MessageBubble
                        message={message}
                        isOwn={message.senderId === userId}
                        showAvatar={index === 0 || messages[index - 1]?.senderId !== message.senderId}
                        sender={
                          message.senderId === userId
                            ? { name: userProfile?.companyName, avatar: userProfile?.logo }
                            : { name: otherParticipant?.name, avatar: otherParticipant?.avatar }
                        }
                      />
                      {message.senderId !== userId && <button type="button" onClick={() => handleReportMessage(message)} className="ml-14 mt-1 text-xs text-slate-500 underline decoration-dotted hover:text-red-600">Report message</button>}
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Message Input */}
            <div className="bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 p-4">
              {/* Attachments Preview */}
              {attachments.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-2">
                  {attachments.map((attachment) => (
                    <div
                      key={attachment.id}
                      className="relative group p-2 bg-gray-100 dark:bg-gray-700 rounded-lg"
                    >
                      {attachment.type.startsWith('image/') ? (
                        <img
                          src={attachment.url}
                          alt={attachment.name}
                          className="w-16 h-16 object-cover rounded"
                        />
                      ) : (
                        <div className="w-16 h-16 flex items-center justify-center">
                          <FaFile className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                      <button
                        onClick={() => handleRemoveAttachment(attachment.id)}
                        className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <FaTimes className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Emoji Picker */}
              <AnimatePresence>
                {showEmojiPicker && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="mb-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div className="grid grid-cols-8 gap-2">
                      {['😀', '😂', '🥰', '😍', '🤔', '😎', '😊', '👍', '❤️', '🎉', '🔥', '✨', '👋', '🙏', '💪', '🤝', '😅', '😢', '😡', '🤯', '🥳', '😴', '🤗', '😇'].map((emoji) => (
                        <button
                          key={emoji}
                          onClick={() => handleEmojiSelect(emoji)}
                          className="text-2xl hover:scale-125 transition-transform"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex items-end gap-2">
                {/* Attachment Button */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
                >
                  {uploading ? (
                    <FaSpinner className="w-5 h-5 animate-spin" />
                  ) : (
                    <FaPaperclip className="w-5 h-5" />
                  )}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                />

                {/* Emoji Button */}
                <button
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="p-2 text-gray-400 hover:text-yellow-500 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <FaRegSmile className="w-5 h-5" />
                </button>

                {/* Message Input */}
                <div className="flex-1">
                  <textarea
                    ref={messageInputRef}
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type a message..."
                    rows={1}
                    className="w-full px-4 py-2.5 bg-gray-100 dark:bg-gray-700 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm"
                    style={{ maxHeight: '120px' }}
                  />
                </div>

                {/* Send Button */}
                <button
                  onClick={handleSendMessage}
                  disabled={sending || (!messageInput.trim() && attachments.length === 0)}
                  className="p-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sending ? (
                    <FaSpinner className="w-5 h-5 animate-spin" />
                  ) : (
                    <FaPaperPlane className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          </>
        ) : (
          /* Empty State */
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="text-center max-w-md">
              <div className="w-24 h-24 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <FaCommentDots className="w-12 h-12 text-blue-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Welcome to Messages
              </h2>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                Select a conversation from the sidebar or start a new one to begin messaging.
              </p>
              {isMobile && (
                <button
                  onClick={() => setShowMobileSidebar(true)}
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
                >
                  View Conversations
                </button>
              )}
            </div>
          </div>
        )}
      </div>
      {showNewChat && <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-3 sm:p-6" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowNewChat(false); }}><section role="dialog" aria-modal="true" aria-labelledby="company-chat-new-title" className="flex max-h-[85dvh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900"><div className="flex items-start justify-between gap-4 border-b border-slate-200 p-5 dark:border-slate-800"><div><h2 id="company-chat-new-title" className="text-lg font-semibold text-slate-900 dark:text-white">Message a follower</h2><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Only people following this company are listed.</p></div><button type="button" onClick={() => setShowNewChat(false)} aria-label="Close" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"><FaTimes/></button></div><div className="p-4"><input value={followerSearch} onChange={(event) => setFollowerSearch(event.target.value)} placeholder="Search followers" aria-label="Search company followers" className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"/></div><ul className="min-h-0 flex-1 divide-y divide-slate-100 overflow-y-auto dark:divide-slate-800">{followerCandidates.filter((candidate) => `${candidate.displayName || candidate.name || ''} ${candidate.email || ''}`.toLowerCase().includes(followerSearch.trim().toLowerCase())).map((candidate) => <li key={candidate.id}><button type="button" onClick={() => { setShowNewChat(false); setFollowerSearch(''); createConversation(candidate.id); }} className="flex w-full items-center gap-3 p-4 text-left hover:bg-slate-50 dark:hover:bg-slate-800"><span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-blue-100 font-semibold text-blue-700 dark:bg-blue-950 dark:text-blue-200">{candidate.photoURL || candidate.avatar ? <img src={candidate.photoURL || candidate.avatar} alt="" className="h-full w-full object-cover"/> : String(candidate.displayName || candidate.name || candidate.email || 'U').slice(0,1).toUpperCase()}</span><span className="min-w-0 flex-1"><span className="block truncate font-medium text-slate-900 dark:text-white">{candidate.displayName || candidate.name || 'Member'}</span><span className="block truncate text-sm text-slate-500 dark:text-slate-400">{candidate.email || candidate.userType || 'Follower'}</span></span><FaComment className="shrink-0 text-blue-600"/></button></li>)}</ul>{followerCandidates.length === 0 && <p className="p-8 text-center text-sm text-slate-500 dark:text-slate-400">No followers are available to message yet.</p>}</section></div>}
    </div>
  );
};

export default CompanyChat;
