// src/pages/company/team-workspace/TeamWorkspace.jsx
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUsersCog, FaComments, FaTasks, FaClipboardList, FaChartLine, FaPlus, FaSearch, FaFilter, FaEllipsisV, FaCheck, FaTimes, FaSpinner, FaSync, FaUserPlus, FaEdit, FaTrash, FaPaperPlane, FaClipboardCheck, FaClock, FaCheckCircle, FaExclamationTriangle, FaChartBar, FaLayerGroup, FaComments as FaCommentsSolid, FaBell, FaExternalLinkAlt, FaDownload, FaFileExport, FaCalendarAlt, FaUserFriends, FaUserTie, FaFlag, FaFire, FaSnowflake, FaRocket, FaBolt, FaStar, FaTrophy, FaAward, FaMedal, FaCrown, FaGem, FaHandshake, FaHandsHelping, FaHeart, FaLightbulb, FaBrain, FaRobot, FaMagic, FaArrowRight, FaArrowLeft, FaChevronLeft, FaChevronRight, FaChevronDown, FaChevronUp, FaTimesCircle, FaInfoCircle, FaPlay, FaPause, FaStop, FaRegClock, FaRegCalendar, FaRegCommentDots, FaRegUserCircle, FaUserCircle, FaTasks as FaTasksSolid, FaColumns, FaList, FaTh, FaThLarge, FaThList, FaTable, FaGripHorizontal, FaGripVertical, FaGripLines, FaDotCircle, FaRegDotCircle, FaCircle, FaRegCircle, FaSquare, FaRegSquare, FaCheckSquare, FaRegCheckSquare, FaEllipsisH, FaEllipsisV as FaEllipsisVSolid } from "react-icons/fa";
import {
  collection, doc, query, where, orderBy, limit, onSnapshot,
  addDoc, updateDoc, deleteDoc, serverTimestamp, getDocs, writeBatch,
} from 'firebase/firestore';

import { useAuth } from '../../../context/AuthContext';
import { useNotification } from '../../../context/NotificationContext';
import { db } from '../../../config/firebase';
import { supabase } from '../../../config/supabase';

const TASK_STATUSES = [
  { value: 'todo', label: 'To Do', color: 'gray' },
  { value: 'in-progress', label: 'In Progress', color: 'blue' },
  { value: 'review', label: 'Under Review', color: 'yellow' },
  { value: 'done', label: 'Done', color: 'green' },
];

const PRIORITIES = [
  { value: 'low', label: 'Low', color: 'green', icon: FaSnowflake },
  { value: 'medium', label: 'Medium', color: 'blue', icon: FaFlag },
  { value: 'high', label: 'High', color: 'orange', icon: FaFire },
  { value: 'urgent', label: 'Urgent', color: 'red', icon: FaBolt },
];

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
  return past.toLocaleDateString();
};

const useWorkspaceData = (companyId) => {
  const [data, setData] = useState({
    teamMembers: [],
    tasks: [],
    messages: [],
    activities: [],
    loading: true,
  });

  useEffect(() => {
    if (!companyId) { setData(prev => ({ ...prev, loading: false })); return; }
    const unsubs = [];

    unsubs.push(onSnapshot(
      query(collection(db, 'companyTeamMembers'), where('companyId', '==', companyId), where('status', '==', 'active')),
      (snap) => setData(prev => ({ ...prev, teamMembers: snap.docs.map(d => ({ id: d.id, ...d.data() })) }))
    ));

    unsubs.push(onSnapshot(
      query(collection(db, 'workspaceTasks'), where('companyId', '==', companyId), orderBy('createdAt', 'desc'), limit(200)),
      (snap) => {
        const tasks = snap.docs.map(d => ({
          id: d.id, ...d.data(),
          createdAt: d.data().createdAt?.toDate?.() || d.data().createdAt,
        }));
        setData(prev => ({ ...prev, tasks, loading: false }));
      }
    ));

    unsubs.push(onSnapshot(
      query(collection(db, 'workspaceMessages'), where('companyId', '==', companyId), orderBy('createdAt', 'desc'), limit(100)),
      (snap) => {
        const messages = snap.docs.map(d => ({
          id: d.id, ...d.data(),
          createdAt: d.data().createdAt?.toDate?.() || d.data().createdAt,
        }));
        setData(prev => ({ ...prev, messages }));
      }
    ));

    unsubs.push(onSnapshot(
      query(collection(db, 'companyActivities'), where('companyId', '==', companyId), orderBy('createdAt', 'desc'), limit(50)),
      (snap) => {
        const activities = snap.docs.map(d => ({
          id: d.id, ...d.data(),
          createdAt: d.data().createdAt?.toDate?.() || d.data().createdAt,
        }));
        setData(prev => ({ ...prev, activities }));
      }
    ));

    return () => unsubs.forEach(u => u());
  }, [companyId]);

  return data;
};

const TaskCard = ({ task, onStatusChange, onDelete }) => {
  const priorityConfig = PRIORITIES.find(p => p.value === task.priority) || PRIORITIES[1];
  const PriorityIcon = priorityConfig.icon;
  const statusConfig = TASK_STATUSES.find(s => s.value === task.status) || TASK_STATUSES[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      layout
      className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-gray-900 dark:text-white truncate">
            {task.title}
          </h4>
          {task.description && (
            <p className="text-sm text-gray-500 mt-1 line-clamp-2">{task.description}</p>
          )}
        </div>
        <div className={`p-1.5 rounded ${priorityConfig.color === 'red' ? 'bg-red-100 text-red-600' :
          priorityConfig.color === 'orange' ? 'bg-orange-100 text-orange-600' :
          priorityConfig.color === 'blue' ? 'bg-blue-100 text-blue-600' :
          'bg-green-100 text-green-600'}`}>
          <PriorityIcon className="w-3 h-3" />
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        <select
          value={task.status}
          onChange={(e) => onStatusChange(task.id, e.target.value)}
          className={`text-xs px-2 py-1 rounded-full font-medium border-0 cursor-pointer ${
            statusConfig.color === 'green' ? 'bg-green-100 text-green-700' :
            statusConfig.color === 'blue' ? 'bg-blue-100 text-blue-700' :
            statusConfig.color === 'yellow' ? 'bg-yellow-100 text-yellow-700' :
            'bg-gray-100 text-gray-700'
          }`}
        >
          {TASK_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
        {task.assigneeName && (
          <span className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
            {task.assigneeName}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
        <span className="text-xs text-gray-400">{formatTimeAgo(task.createdAt)}</span>
        <button
          onClick={() => onDelete(task.id)}
          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
        >
          <FaTrash className="w-3 h-3" />
        </button>
      </div>
    </motion.div>
  );
};

const TeamWorkspace = () => {
  const { currentUser, userProfile } = useAuth();
  const { showNotification } = useNotification();
  const companyId = currentUser?.uid;
  const { teamMembers, tasks, messages, activities, loading } = useWorkspaceData(companyId);

  const [activeTab, setActiveTab] = useState('tasks');
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'medium', status: 'todo', assigneeId: '' });
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [saving, setSaving] = useState(false);

  const stats = useMemo(() => ({
    total: tasks.length,
    todo: tasks.filter(t => t.status === 'todo').length,
    inProgress: tasks.filter(t => t.status === 'in-progress').length,
    done: tasks.filter(t => t.status === 'done').length,
  }), [tasks]);

  const filteredTasks = useMemo(() => {
    let filtered = [...tasks];
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(t =>
        (t.title?.toLowerCase() || '').includes(term) ||
        (t.description?.toLowerCase() || '').includes(term)
      );
    }
    if (statusFilter !== 'all') filtered = filtered.filter(t => t.status === statusFilter);
    return filtered;
  }, [tasks, searchTerm, statusFilter]);

  const handleCreateTask = async () => {
    if (!newTask.title.trim()) return showNotification('error', 'Title required');
    try {
      setSaving(true);
      const assignee = teamMembers.find(m => m.id === newTask.assigneeId);
      await addDoc(collection(db, 'workspaceTasks'), {
        ...newTask,
        companyId,
        assigneeName: assignee?.name || assignee?.email || '',
        createdBy: companyId,
        createdByName: userProfile?.displayName || userProfile?.companyName || 'Admin',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      await supabase.from('company_activities').insert({
        company_id: companyId,
        activity_type: 'task_created',
        metadata: { title: newTask.title },
        created_at: new Date().toISOString(),
      });
      showNotification('success', 'Task created');
      setShowTaskModal(false);
      setNewTask({ title: '', description: '', priority: 'medium', status: 'todo', assigneeId: '' });
    } catch (error) {
      showNotification('error', 'Failed to create task');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateTaskStatus = async (taskId, status) => {
    try {
      await updateDoc(doc(db, 'workspaceTasks', taskId), { status, updatedAt: serverTimestamp() });
    } catch (error) {
      showNotification('error', 'Failed to update');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await deleteDoc(doc(db, 'workspaceTasks', taskId));
      showNotification('success', 'Task deleted');
    } catch (error) {
      showNotification('error', 'Failed to delete');
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    try {
      await addDoc(collection(db, 'workspaceMessages'), {
        companyId,
        content: newMessage,
        senderId: companyId,
        senderName: userProfile?.displayName || userProfile?.companyName || 'Admin',
        senderPhoto: userProfile?.logo || null,
        createdAt: serverTimestamp(),
      });
      setNewMessage('');
    } catch (error) {
      showNotification('error', 'Failed to send');
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
              <FaUsersCog className="w-8 h-8 text-blue-600" />
              Team Workspace
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Collaborate with your team on tasks and communication
            </p>
          </div>
          <button
            onClick={() => setShowTaskModal(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <FaPlus className="w-4 h-4" />
            New Task
          </button>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Tasks', value: stats.total, icon: FaClipboardList, color: 'blue' },
            { label: 'To Do', value: stats.todo, icon: FaClock, color: 'gray' },
            { label: 'In Progress', value: stats.inProgress, icon: FaSpinner, color: 'yellow' },
            { label: 'Completed', value: stats.done, icon: FaCheckCircle, color: 'green' },
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
                stat.color === 'gray' ? 'bg-gray-100 dark:bg-gray-700 text-gray-600' :
                stat.color === 'yellow' ? 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600' :
                'bg-green-50 dark:bg-green-900/20 text-green-600'
              }`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden mb-6">
          <div className="flex border-b border-gray-100 dark:border-gray-700">
            {[
              { id: 'tasks', label: 'Tasks', icon: FaTasks },
              { id: 'chat', label: 'Team Chat', icon: FaComments },
              { id: 'activity', label: 'Activity', icon: FaChartLine },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50 dark:bg-blue-900/10'
                    : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-6">
            <AnimatePresence mode="wait">
              {activeTab === 'tasks' && (
                <motion.div key="tasks" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <div className="flex gap-3 mb-4">
                    <div className="relative flex-1">
                      <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search tasks..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">All Status</option>
                      {TASK_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                  </div>

                  {filteredTasks.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredTasks.map(task => (
                        <TaskCard
                          key={task.id}
                          task={task}
                          onStatusChange={handleUpdateTaskStatus}
                          onDelete={handleDeleteTask}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-16">
                      <FaTasks className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">No tasks found</p>
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'chat' && (
                <motion.div key="chat" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <div className="space-y-3 max-h-96 overflow-y-auto mb-4">
                    {messages.length > 0 ? messages.map(msg => (
                      <div key={msg.id} className={`flex items-start gap-3 ${msg.senderId === companyId ? 'flex-row-reverse' : ''}`}>
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                          {msg.senderName?.charAt(0) || 'U'}
                        </div>
                        <div className={`flex-1 max-w-md ${msg.senderId === companyId ? 'text-right' : ''}`}>
                          <div className={`inline-block p-3 rounded-2xl ${
                            msg.senderId === companyId
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                          }`}>
                            <p className="text-sm">{msg.content}</p>
                          </div>
                          <p className="text-xs text-gray-400 mt-1">{msg.senderName} • {formatTimeAgo(msg.createdAt)}</p>
                        </div>
                      </div>
                    )) : (
                      <p className="text-center text-gray-500 py-8">No messages yet. Start the conversation!</p>
                    )}
                  </div>
                  <div className="flex gap-2 pt-4 border-t border-gray-100 dark:border-gray-700">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Type a message..."
                      className="flex-1 px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                      className="px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      <FaPaperPlane className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )}

              {activeTab === 'activity' && (
                <motion.div key="activity" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
                  {activities.length > 0 ? activities.map(activity => (
                    <div key={activity.id} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                      <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600">
                        <FaBell className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900 dark:text-white">
                          {activity.description || activity.type}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">{formatTimeAgo(activity.createdAt)}</p>
                      </div>
                    </div>
                  )) : (
                    <p className="text-center text-gray-500 py-8">No activity yet</p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Create Task Modal */}
      <AnimatePresence>
        {showTaskModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowTaskModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Create New Task
              </h3>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Task title"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <textarea
                  placeholder="Description (optional)"
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
                <div className="grid grid-cols-2 gap-3">
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                    className="px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {PRIORITIES.map(p => <option key={p.value} value={p.value}>{p.label} Priority</option>)}
                  </select>
                  <select
                    value={newTask.assigneeId}
                    onChange={(e) => setNewTask({ ...newTask, assigneeId: e.target.value })}
                    className="px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Unassigned</option>
                    {teamMembers.map(m => <option key={m.id} value={m.id}>{m.name || m.email}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowTaskModal(false)}
                  className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateTask}
                  disabled={saving || !newTask.title.trim()}
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
    </div>
  );
};

export default TeamWorkspace;