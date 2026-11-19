/* eslint-disable prettier/prettier */
import { createContext, useState, useContext, useCallback, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { FaBell, FaCheckCircle, FaExclamationTriangle, FaInfoCircle, FaMoneyBillWave, FaUsers, FaCalendarAlt } from "react-icons/fa";
import { addDoc, collection, doc, getDocs, onSnapshot, query, serverTimestamp, updateDoc, where } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    let stopNotifications = () => {};
    const stopAuth = onAuthStateChanged(auth, (user) => {
      stopNotifications();
      setNotifications([]);
      if (!user?.uid) return;
      stopNotifications = onSnapshot(query(collection(db, 'notifications'), where('userId', '==', user.uid)), (snapshot) => {
        setNotifications(snapshot.docs.map((record) => ({ id: record.id, ...record.data() })));
      }, (error) => console.error('Unable to subscribe to account notifications:', error));
    });
    return () => { stopNotifications(); stopAuth(); };
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id));
  }, []);

  const addNotification = useCallback(
    async (notification) => {
      const id = globalThis.crypto?.randomUUID?.() || Date.now().toString();
      const icons = {
        success: <FaCheckCircle />,
        warning: <FaExclamationTriangle />,
        info: <FaInfoCircle />,
        funding: <FaMoneyBillWave />,
        mentorship: <FaUsers />,
        deadline: <FaCalendarAlt />,
        default: <FaBell />,
      };

      const newNotification = {
        id,
        type: notification.type || 'info',
        title: notification.title,
        message: notification.message,
        time: 'Just now',
        read: false,
        icon: icons[notification.type] || icons.default,
        link: notification.link,
        duration: notification.duration || 5000,
        priority: notification.priority || 'normal',
        ...notification,
      };

      if (auth.currentUser?.uid) {
        await addDoc(collection(db, 'notifications'), {
          userId: auth.currentUser.uid,
          type: newNotification.type,
          title: newNotification.title || '',
          message: newNotification.message || '',
          link: newNotification.link || '',
          read: false,
          createdAt: serverTimestamp(),
        });
      } else {
        setNotifications((prev) => [newNotification, ...prev]);
        if (newNotification.duration > 0) setTimeout(() => removeNotification(id), newNotification.duration);
      }

      if (notification.playSound !== false) {
        try {
          const audio = new Audio('/notification.mp3');
          audio.volume = 0.3;
          audio.play().catch(() => {});
        } catch (error) {
          console.log('Notification sound error:', error);
        }
      }

      return id;
    },
    [removeNotification]
  );

  const markAsRead = useCallback(async (id) => {
    if (String(id).length < 15) return;
    await updateDoc(doc(db, 'notifications', id), { read: true, readAt: serverTimestamp() });
    setNotifications((current) => current.map((notification) => notification.id === id ? { ...notification, read: true, readAt: new Date() } : notification));
  }, []);

  const markAllAsRead = useCallback(async () => {
    await Promise.all(notifications.filter((notification) => !notification.read && notification.id.length > 15).map((notification) => updateDoc(doc(db, 'notifications', notification.id), { read: true, readAt: serverTimestamp() })));
  }, [notifications]);

  const clearAllNotifications = useCallback(async () => {
    await Promise.all(notifications.filter((notification) => notification.id.length > 15).map((notification) => updateDoc(doc(db, 'notifications', notification.id), { deleted: true, deletedAt: serverTimestamp() })));
  }, [notifications]);

  const getUnreadCount = useCallback(() => {
    return notifications.filter((notification) => !notification.read && !notification.deleted && !notification.archived).length;
  }, [notifications]);

  const getNotificationsByType = useCallback(
    (type) => {
      return notifications.filter((notification) => notification.type === type);
    },
    [notifications]
  );

  const fetchNotifications = useCallback(async () => {
    const userId = auth.currentUser?.uid;
    if (!userId) {
      setNotifications([]);
      return [];
    }

    const snapshot = await getDocs(query(collection(db, 'notifications'), where('userId', '==', userId)));
    const latestNotifications = snapshot.docs
      .map((record) => ({ id: record.id, ...record.data() }))
      .sort((a, b) => {
        const getMillis = (value) => value?.toMillis?.() ?? (value instanceof Date ? value.getTime() : 0);
        return getMillis(b.createdAt) - getMillis(a.createdAt);
      });
    setNotifications(latestNotifications);
    return latestNotifications;
  }, []);

  const addSuccessNotification = useCallback(
    (title, message, options = {}) =>
      addNotification({
        type: 'success',
        title,
        message,
        ...options,
      }),
    [addNotification]
  );

  const addErrorNotification = useCallback(
    (title, message, options = {}) =>
      addNotification({
        type: 'danger',
        title,
        message,
        ...options,
      }),
    [addNotification]
  );

  const addWarningNotification = useCallback(
    (title, message, options = {}) =>
      addNotification({
        type: 'warning',
        title,
        message,
        ...options,
      }),
    [addNotification]
  );

  const unreadCount = notifications.filter((notification) => !notification.read && !notification.deleted && !notification.archived).length;

  const value = {
    notifications,
    unreadCount,
    addNotification,
    removeNotification,
    markAsRead,
    markAllAsRead,
    clearAllNotifications,
    getUnreadCount,
    getNotificationsByType,
    fetchNotifications,
    addSuccessNotification,
    addErrorNotification,
    addWarningNotification,
  };

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
};

export default NotificationContext;
