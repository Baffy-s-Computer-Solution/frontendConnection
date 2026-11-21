/* eslint-disable no-unused-vars */
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  addDoc,
  writeBatch,
  limit as queryLimit,
} from 'firebase/firestore';

import { auth, db } from '../config/firebase';
import { canonicalUserStatus } from '../utils/userStatus';
import API_BASE_URL from './apiConfig';
import { apiRequest } from './apiClient';

// Helper functions
const getAdminId = (currentUser) => currentUser?.uid || 'system';
const getAdminName = (currentUser, userProfile) =>
  userProfile?.displayName || currentUser?.email || 'System Administrator';

// Log admin action
const logAction = async (action, details, currentUser, userProfile) => {
  try {
    await addDoc(collection(db, 'admin_actions'), {
      action,
      adminId: getAdminId(currentUser),
      adminName: getAdminName(currentUser, userProfile),
      timestamp: serverTimestamp(),
      ...details,
    });
  } catch (error) {
    console.error('Error logging admin action:', error);
  }
};

// Safe document fetch with error handling
const safeGetDocs = async (q) => {
  try {
    const snapshot = await getDocs(q);
    return snapshot;
  } catch (error) {
    const isPermissionIssue =
      error?.code === 'permission-denied' ||
      error?.message?.toLowerCase().includes('permission') ||
      error?.message?.toLowerCase().includes('insufficient permissions');

    if (!isPermissionIssue) {
      console.warn('Error fetching documents:', error);
    }

    return { size: 0, docs: [] };
  }
};

// Safely convert timestamp to date
const safeDate = (timestamp) => {
  if (!timestamp) return null;
  if (timestamp.toDate && typeof timestamp.toDate === 'function') {
    return timestamp.toDate();
  }
  if (timestamp instanceof Date) {
    return timestamp;
  }
  if (typeof timestamp === 'string' || typeof timestamp === 'number') {
    return new Date(timestamp);
  }
  return null;
};

const normalizeRecord = (snapshotDoc) => {
  const data = snapshotDoc.data();
  return {
    id: snapshotDoc.id,
    ...data,
    createdAt: safeDate(data.createdAt),
    updatedAt: safeDate(data.updatedAt),
    timestamp: safeDate(data.timestamp),
  };
};

const adminApiRequest = async (path, options = {}) => {
  const token = await auth.currentUser?.getIdToken?.(true);
  if (!token) {
    return { success: false, error: 'Authentication required' };
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    return { success: false, error: data.error || data.message || response.statusText };
  }

  return data;
};

const safeResult = (data = {}, error = null) => ({
  success: !error,
  data,
  error: error ? error.message || String(error) : null,
});

const recordData = (snapshotDoc) => normalizeRecord(snapshotDoc);

const getCollectionRecords = async (collectionName, filters = {}, page = 1, limit = 20) => {
  const snapshot = await getDocs(collection(db, collectionName));
  let records = snapshot.docs.map(recordData);
  const search = String(filters.search || '').trim().toLowerCase();
  records = records.filter((record) => {
    const matchesSearch = !search || JSON.stringify(record).toLowerCase().includes(search);
    const matchesFilters = Object.entries(filters).every(([key, value]) => {
      if (value === undefined || value === '' || value === 'all') return true;
      if (collectionName === 'users' && key === 'status') {
        return canonicalUserStatus(record.status) === canonicalUserStatus(value);
      }
      return record[key] === value;
    });
    return matchesSearch && matchesFilters;
  });
  records.sort((left, right) => new Date(right.createdAt || right.updatedAt || 0) - new Date(left.createdAt || left.updatedAt || 0));
  const safeLimit = Math.max(1, Number(limit) || 20);
  const safePage = Math.max(1, Number(page) || 1);
  return { records, page: safePage, limit: safeLimit, total: records.length, totalPages: Math.max(1, Math.ceil(records.length / safeLimit)), items: records.slice((safePage - 1) * safeLimit, safePage * safeLimit) };
};

const updateRecord = async (collectionName, id, updates, currentUser, userProfile, action) => {
  await updateDoc(doc(db, collectionName, id), { ...updates, updatedAt: serverTimestamp() });
  await logAction(action, { [`${collectionName.slice(0, -1)}Id`]: id, updates }, currentUser, userProfile);
  return { id, ...updates };
};

const exportCollection = async (collectionName, filters = {}) => {
  const result = await getCollectionRecords(collectionName, filters, 1, 10000);
  return result.records;
};
export const adminService = {
  // ==================== DASHBOARD STATISTICS ====================

  getDashboardStats: async (currentUser, userProfile) => {
    try {
      console.log('Fetching dashboard stats...');

      // Use try-catch for each query to prevent cascading failures
      const collectionCounts = {};
      let userStats = { total: 0, active: 0, pending: 0, suspended: 0, byType: {} };
      let recentActivities = [];
      let pendingApprovals = [];

      try {
        // Get users count
        const usersRef = collection(db, 'users');
        const usersQuery = query(usersRef);
        const usersSnapshot = await safeGetDocs(usersQuery);
        const users = usersSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: safeDate(doc.data().createdAt),
        }));

        collectionCounts.users = users.length;

        // Calculate user stats
        userStats = {
          total: users.length,
          active: users.filter((u) => u.status === 'active').length,
          pending: users.filter((u) => u.status === 'pending').length,
          suspended: users.filter((u) => u.status === 'suspended').length,
          byType: users.reduce((acc, user) => {
            const type = user.userType || 'unknown';
            acc[type] = (acc[type] || 0) + 1;
            return acc;
          }, {}),
        };

        // Get pending approvals
        pendingApprovals = users
          .filter((user) => user.status === 'pending')
          .slice(0, 5)
          .map((user) => ({
            id: user.id,
            email: user.email,
            displayName: user.displayName,
            userType: user.userType,
            createdAt: user.createdAt,
          }));
      } catch (error) {
        console.warn('Error processing users:', error);
      }

      try {
        // Get companies count
        const companiesRef = collection(db, 'companies');
        const companiesQuery = query(companiesRef);
        const companiesSnapshot = await safeGetDocs(companiesQuery);
        collectionCounts.companies = companiesSnapshot.docs.length;
      } catch (error) {
        console.warn('Error counting companies:', error);
        collectionCounts.companies = 0;
      }

      try {
        // Get jobs count
        const jobsRef = collection(db, 'jobs');
        const jobsQuery = query(jobsRef, where('status', '==', 'active'));
        const jobsSnapshot = await safeGetDocs(jobsQuery);
        collectionCounts.jobs = jobsSnapshot.docs.length;
      } catch (error) {
        console.warn('Error counting jobs:', error);
        collectionCounts.jobs = 0;
      }

      try {
        // Get applications count
        const appsRef = collection(db, 'applications');
        const appsQuery = query(appsRef);
        const appsSnapshot = await safeGetDocs(appsQuery);
        collectionCounts.applications = appsSnapshot.docs.length;
      } catch (error) {
        console.warn('Error counting applications:', error);
        collectionCounts.applications = 0;
      }

      try {
        // Get recent activities
        const activitiesRef = collection(db, 'activities');
        const activitiesQuery = query(activitiesRef, orderBy('timestamp', 'desc'), queryLimit(10));
        const activitiesSnapshot = await safeGetDocs(activitiesQuery);
        recentActivities = activitiesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          timestamp: safeDate(doc.data().timestamp),
        }));
      } catch (error) {
        console.warn('Error fetching activities:', error);
      }

      // Calculate recent registrations (last 7 days)
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const recentRegistrations = userStats.byType
        ? Object.values(userStats.byType).reduce((sum, count) => sum + count, 0)
        : 0;

      const stats = {
        timestamp: new Date().toISOString(),
        collectionCounts,
        userStats,
        recentActivities,
        pendingApprovals,
        recentRegistrations,
        summary: {
          totalUsers: userStats.total || 0,
          pendingApprovals: userStats.pending || 0,
          activeCompanies: collectionCounts.companies || 0,
          activeJobs: collectionCounts.jobs || 0,
        },
      };

      try {
        await logAction(
          'dashboard_stats_viewed',
          { stats: stats.summary },
          currentUser,
          userProfile
        );
      } catch (logError) {
        console.warn('Error logging action:', logError);
      }

      console.log('Dashboard stats fetched successfully');
      return { success: true, data: stats };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);

      // Return fallback data
      const fallbackStats = {
        timestamp: new Date().toISOString(),
        collectionCounts: { users: 0, companies: 0, jobs: 0, applications: 0 },
        userStats: { total: 0, active: 0, pending: 0, suspended: 0, byType: {} },
        recentActivities: [],
        pendingApprovals: [],
        recentRegistrations: 0,
        summary: {
          totalUsers: 0,
          pendingApprovals: 0,
          activeCompanies: 0,
          activeJobs: 0,
        },
      };

      return { success: false, error: error.message, data: fallbackStats };
    }
  },

  // ==================== PENDING APPROVALS ====================

  getPendingApprovals: async (currentUser, userProfile) => {
    try {
      console.log('Fetching pending approvals...');

      const usersRef = collection(db, 'users');
      const q = query(
        usersRef,
        where('status', 'in', ['pending', 'awaiting_approval', 'pending_approval']),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await safeGetDocs(q);

      const pendingUsers = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: safeDate(doc.data().createdAt),
        updatedAt: safeDate(doc.data().updatedAt),
      }));

      console.log(`Found ${pendingUsers.length} pending users`);

      // Log the action
      await logAction(
        'pending_approvals_viewed',
        {
          count: pendingUsers.length,
        },
        currentUser,
        userProfile
      );

      return {
        success: true,
        data: {
          users: pendingUsers,
          total: pendingUsers.length,
        },
      };
    } catch (error) {
      console.error('Error fetching pending approvals:', error);
      return {
        success: false,
        error: error.message,
        data: { users: [], total: 0 },
      };
    }
  },

  rejectUser: async (userId, reason, currentUser, userProfile) => {
    try {
      const response = await adminApiRequest(
        `/api/admin/users/${encodeURIComponent(userId)}/status`,
        {
          method: 'PUT',
          body: JSON.stringify({ status: 'rejected', reason }),
        },
      );
      if (!response.success) throw new Error(response.error || 'Failed to reject user');

      await logAction('user_rejected', { userId, reason }, currentUser, userProfile);
      return { success: true, message: 'User rejected successfully' };
    } catch (error) {
      console.error('Error rejecting user:', error);
      return { success: false, error: error.message };
    }
  },

  bulkApproveUsers: async (userIds, comments, currentUser, userProfile) => {
    return runBulkMutation(userIds, (userId) =>
      adminService.users.approveUser(userId, comments || 'Bulk approval', currentUser, userProfile),
    );
  },

  bulkRejectUsers: async (userIds, reason, currentUser, userProfile) => {
    return runBulkMutation(userIds, (userId) =>
      adminService.users.rejectUser(userId, reason, currentUser, userProfile),
    );
  },

  // ==================== USER MANAGEMENT ====================

  users: {
    getPendingApprovals: async (currentUser, userProfile) =>
      adminService.getPendingApprovals(currentUser, userProfile),

    rejectUser: async (userId, reason, currentUser, userProfile) =>
      adminService.rejectUser(userId, reason, currentUser, userProfile),

    bulkApproveUsers: async (userIds, comments, currentUser, userProfile) =>
      adminService.bulkApproveUsers(userIds, comments, currentUser, userProfile),

    bulkRejectUsers: async (userIds, reason, currentUser, userProfile) =>
      adminService.bulkRejectUsers(userIds, reason, currentUser, userProfile),

    getAllUsers: async (arg1 = {}, arg2 = 1, arg3 = 20) => {
      try {
        // Backward-compatible signature handling:
        // getAllUsers(filters, page, limit) OR getAllUsers(page, limit, filters)
        let filters = {};
        let page = 1;
        let limit = 20;

        if (typeof arg1 === 'number') {
          page = arg1;
          limit = typeof arg2 === 'number' ? arg2 : 20;
          filters = typeof arg3 === 'object' && arg3 !== null ? arg3 : {};
        } else {
          filters = typeof arg1 === 'object' && arg1 !== null ? arg1 : {};
          page = typeof arg2 === 'number' ? arg2 : 1;
          limit = typeof arg3 === 'number' ? arg3 : 20;
        }

        console.log('Fetching users with filters:', filters);

        let users = [];

        // Simple fetch without complex queries to avoid Firestore errors
        const usersRef = collection(db, 'users');
        const snapshot = await safeGetDocs(usersRef);

        users = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: safeDate(doc.data().createdAt),
        }));

        // Apply filters client-side
        let filteredUsers = users;

        if (filters.status && filters.status !== 'all') {
          filteredUsers = filteredUsers.filter((user) => user.status === filters.status);
        }

        if (filters.userType && filters.userType !== 'all') {
          filteredUsers = filteredUsers.filter((user) => user.userType === filters.userType);
        }

        if (filters.search) {
          const searchTerm = filters.search.toLowerCase();
          filteredUsers = filteredUsers.filter(
            (user) =>
              user.email?.toLowerCase().includes(searchTerm) ||
              false ||
              user.displayName?.toLowerCase().includes(searchTerm) ||
              false ||
              user.userType?.toLowerCase().includes(searchTerm) ||
              false
          );
        }

        // Sort by createdAt descending
        filteredUsers.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        });

        // Calculate pagination
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

        const payload = {
          users: paginatedUsers,
          total: filteredUsers.length,
          page,
          totalPages: Math.ceil(filteredUsers.length / limit),
          limit,
        };

        return {
          success: true,
          data: payload,
          ...payload,
        };
      } catch (error) {
        console.error('Error fetching users:', error);
        const payload = {
          users: [],
          total: 0,
          page: 1,
          totalPages: 0,
          limit: typeof arg3 === 'number' ? arg3 : 20,
        };

        return {
          success: false,
          error: error.message,
          data: payload,
          ...payload,
        };
      }
    },

    getUserDetails: async (userId) => {
      try {
        console.log('Fetching user details for:', userId);

        const userRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
          return { success: false, error: 'User not found' };
        }

        const userData = {
          id: userSnap.id,
          ...userSnap.data(),
          createdAt: safeDate(userSnap.data().createdAt),
        };

        // Get additional data based on user type
        let additionalData = {};

        try {
          if (userData.userType === 'company') {
            const companyRef = doc(db, 'companies', userId);
            const companySnap = await getDoc(companyRef);
            if (companySnap.exists()) {
              additionalData.companyDetails = companySnap.data();
            }
          } else if (userData.userType === 'student') {
            const studentRef = doc(db, 'profiles', userId);
            const studentSnap = await getDoc(studentRef);
            if (studentSnap.exists()) {
              additionalData.profileDetails = studentSnap.data();
            }
          }
        } catch (profileError) {
          console.warn('Error fetching additional data:', profileError);
        }

        console.log('User details fetched successfully');
        return {
          success: true,
          data: { ...userData, ...additionalData },
        };
      } catch (error) {
        console.error('Error fetching user details:', error);
        return { success: false, error: error.message };
      }
    },

    updateUser: async (userId, updates, currentUser, userProfile) => {
      try {
        console.log('Updating user:', userId, 'with:', updates);

        const response = await adminApiRequest(`/api/admin/users/${encodeURIComponent(userId)}`, {
          method: 'PUT',
          body: JSON.stringify(updates),
        });
        if (!response.success) throw new Error(response.error || 'Failed to update user');

        await logAction(
          'user_updated',
          {
            userId,
            updates,
            userEmail: updates.email,
          },
          currentUser,
          userProfile
        );

        console.log('User updated successfully');
        return { success: true, message: 'User updated successfully' };
      } catch (error) {
        console.error('Error updating user:', error);
        return { success: false, error: error.message };
      }
    },

    deleteUser: async (userId, currentUser, userProfile) => {
      try {
        console.log('Deleting user:', userId);

        const response = await adminApiRequest(
          `/api/admin/users/${encodeURIComponent(userId)}/status`,
          {
            method: 'PUT',
            body: JSON.stringify({ status: 'deleted' }),
          },
        );
        if (!response.success) throw new Error(response.error || 'Failed to delete user');

        await logAction('user_deleted', { userId }, currentUser, userProfile);

        console.log('User marked as deleted');
        return { success: true, message: 'User marked as deleted' };
      } catch (error) {
        console.error('Error deleting user:', error);
        return { success: false, error: error.message };
      }
    },

    approveUser: async (userId, comments = '', currentUser, userProfile) => {
      if (comments && typeof comments === 'object') {
        userProfile = currentUser;
        currentUser = comments;
        comments = '';
      }

      try {
        console.log('Approving user:', userId);

        const response = await adminApiRequest(
          `/api/admin/users/${encodeURIComponent(userId)}/status`,
          {
            method: 'PUT',
            body: JSON.stringify({ status: 'active', comments: comments || '' }),
          },
        );
        if (!response.success) throw new Error(response.error || 'Failed to approve user');

        await logAction('user_approved', { userId }, currentUser, userProfile);

        console.log('User approved successfully');
        return { success: true, message: 'User approved successfully' };
      } catch (error) {
        console.error('Error approving user:', error);
        return { success: false, error: error.message };
      }
    },

    suspendUser: async (userId, reason, currentUser, userProfile) => {
      try {
        const response = await adminApiRequest(
          `/api/admin/users/${encodeURIComponent(userId)}/status`,
          {
            method: 'PUT',
            body: JSON.stringify({ status: 'suspended', reason }),
          },
        );
        if (!response.success) throw new Error(response.error || 'Failed to suspend user');

        await logAction('user_suspended', { userId, reason }, currentUser, userProfile);
        return { success: true, message: 'User suspended successfully' };
      } catch (error) {
        console.error('Error suspending user:', error);
        return { success: false, error: error.message };
      }
    },

    activateUser: async (userId, currentUser, userProfile) => {
      try {
        const response = await adminApiRequest(
          `/api/admin/users/${encodeURIComponent(userId)}/status`,
          {
            method: 'PUT',
            body: JSON.stringify({ status: 'active' }),
          },
        );
        if (!response.success) throw new Error(response.error || 'Failed to activate user');

        await logAction('user_activated', { userId }, currentUser, userProfile);
        return { success: true, message: 'User activated successfully' };
      } catch (error) {
        return { success: false, error: error.message };
      }
    },

    createUser: async (newUser, currentUser, userProfile) => {
      try {
        const email = String(newUser?.email || '')
          .trim()
          .toLowerCase();
        if (!email) return { success: false, error: 'Email is required' };
        if (!newUser?.password) return { success: false, error: 'Password is required' };

        const response = await adminApiRequest('/api/admin/users', {
          method: 'POST',
          body: JSON.stringify({
            email,
            password: newUser.password,
            displayName: newUser.displayName,
            userType: newUser.userType || 'student',
            status: newUser.status || 'active',
            phoneNumber: newUser.phoneNumber || '',
          }),
        });
        if (!response.success) throw new Error(response.error || 'Failed to create user');

        const userId = response.data?.uid || response.data?.id;
        await logAction('user_created', { userId, email }, currentUser, userProfile);
        return { success: true, data: response.data };
      } catch (error) {
        return { success: false, error: error.message };
      }
    },
  },

  // ==================== COMPANY MANAGEMENT ====================

  companies: {
    getAllCompanies: async (filters = {}, page = 1, limit = 20) => {
      try {
        console.log('Fetching companies with filters:', filters);

        const companiesRef = collection(db, 'companies');
        const snapshot = await safeGetDocs(companiesRef);

        let allCompanies = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: safeDate(doc.data().createdAt),
        }));

        // Apply filters client-side
        let filteredCompanies = allCompanies;

        if (filters.status && filters.status !== 'all') {
          filteredCompanies = filteredCompanies.filter(
            (company) => company.status === filters.status
          );
        }

        if (filters.search) {
          const searchTerm = filters.search.toLowerCase();
          filteredCompanies = filteredCompanies.filter(
            (company) =>
              company.companyName?.toLowerCase().includes(searchTerm) ||
              false ||
              company.email?.toLowerCase().includes(searchTerm) ||
              false ||
              company.industry?.toLowerCase().includes(searchTerm) ||
              false
          );
        }

        // Sort by createdAt descending
        filteredCompanies.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        });

        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedCompanies = filteredCompanies.slice(startIndex, endIndex);

        return {
          success: true,
          data: {
            companies: paginatedCompanies,
            total: filteredCompanies.length,
            page,
            totalPages: Math.ceil(filteredCompanies.length / limit),
            limit,
          },
        };
      } catch (error) {
        console.error('Error fetching companies:', error);
        return {
          success: false,
          error: error.message,
          data: {
            companies: [],
            total: 0,
            page: 1,
            totalPages: 0,
            limit,
          },
        };
      }
    },

    approveCompany: async (companyId, currentUser, userProfile) => {
      try {
        console.log('Approving company:', companyId);

        const companyRef = doc(db, 'companies', companyId);

        // Update company status
        await updateDoc(companyRef, {
          status: 'approved',
          approvedAt: serverTimestamp(),
          approvedBy: getAdminId(currentUser),
        });

        // Try to update user status if exists
        try {
          const userRef = doc(db, 'users', companyId);
          await updateDoc(userRef, {
            status: 'active',
            isActive: true,
            approvedAt: serverTimestamp(),
          });
        } catch (userError) {
          console.warn('User update failed (might not exist):', userError);
        }

        // Mirror the approved Firebase user into Supabase when the admin API
        // is configured. Firebase remains the source of truth for approval.
        try {
          const mirrorResult = await adminApiRequest(`/api/supabase/sync/users/${companyId}`, {
            method: 'POST',
          });
          if (mirrorResult?.success === false) {
            console.warn('Supabase company mirror failed:', mirrorResult.error);
          }
        } catch (mirrorError) {
          console.warn('Supabase company mirror unavailable:', mirrorError.message);
        }

        await logAction('company_approved', { companyId }, currentUser, userProfile);

        console.log('Company approved successfully');
        return { success: true, message: 'Company approved successfully' };
      } catch (error) {
        console.error('Error approving company:', error);
        return { success: false, error: error.message };
      }
    },
  },

  // ==================== JOB MANAGEMENT ====================

  jobs: {
    getAllJobs: async (filters = {}, page = 1, limit = 20) => {
      try {
        console.log('Fetching jobs with filters:', filters);

        const jobsRef = collection(db, 'jobs');
        const snapshot = await safeGetDocs(jobsRef);

        let allJobs = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: safeDate(doc.data().createdAt),
        }));

        // Apply filters client-side
        let filteredJobs = allJobs;

        if (filters.status && filters.status !== 'all') {
          filteredJobs = filteredJobs.filter((job) => job.status === filters.status);
        }

        if (filters.jobType && filters.jobType !== 'all') {
          filteredJobs = filteredJobs.filter((job) => job.jobType === filters.jobType);
        }

        if (filters.approved !== undefined) {
          filteredJobs = filteredJobs.filter((job) => job.approved === filters.approved);
        }

        if (filters.search) {
          const searchTerm = filters.search.toLowerCase();
          filteredJobs = filteredJobs.filter(
            (job) =>
              job.title?.toLowerCase().includes(searchTerm) ||
              false ||
              job.companyName?.toLowerCase().includes(searchTerm) ||
              false ||
              job.description?.toLowerCase().includes(searchTerm) ||
              false
          );
        }

        // Sort by createdAt descending
        filteredJobs.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        });

        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedJobs = filteredJobs.slice(startIndex, endIndex);

        return {
          success: true,
          data: {
            jobs: paginatedJobs,
            total: filteredJobs.length,
            page,
            totalPages: Math.ceil(filteredJobs.length / limit),
            limit,
          },
        };
      } catch (error) {
        console.error('Error fetching jobs:', error);
        return {
          success: false,
          error: error.message,
          data: {
            jobs: [],
            total: 0,
            page: 1,
            totalPages: 0,
            limit,
          },
        };
      }
    },

    updateJob: async (jobId, updates, currentUser, userProfile) => {
      try {
        console.log('Updating job:', jobId, 'with:', updates);

        const jobRef = doc(db, 'jobs', jobId);

        await updateDoc(jobRef, {
          ...updates,
          updatedAt: serverTimestamp(),
        });

        await logAction('job_updated', { jobId, updates }, currentUser, userProfile);

        console.log('Job updated successfully');
        return { success: true, message: 'Job updated successfully' };
      } catch (error) {
        console.error('Error updating job:', error);
        return { success: false, error: error.message };
      }
    },
  },

  // ==================== APPLICATION MANAGEMENT ====================

  applications: {
    getAllApplications: async (filters = {}, page = 1, limit = 20) => {
      try {
        console.log('Fetching applications with filters:', filters);

        const appsRef = collection(db, 'applications');
        const snapshot = await safeGetDocs(appsRef);

        let allApplications = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          submittedAt: safeDate(doc.data().submittedAt),
        }));

        // Apply filters client-side
        let filteredApps = allApplications;

        if (filters.status && filters.status !== 'all') {
          filteredApps = filteredApps.filter((app) => app.status === filters.status);
        }

        if (filters.type && filters.type !== 'all') {
          filteredApps = filteredApps.filter((app) => app.type === filters.type);
        }

        if (filters.search) {
          const searchTerm = filters.search.toLowerCase();
          filteredApps = filteredApps.filter(
            (app) =>
              app.applicantName?.toLowerCase().includes(searchTerm) ||
              false ||
              app.applicantEmail?.toLowerCase().includes(searchTerm) ||
              false ||
              app.jobTitle?.toLowerCase().includes(searchTerm) ||
              false
          );
        }

        // Sort by submittedAt descending
        filteredApps.sort((a, b) => {
          const dateA = a.submittedAt ? new Date(a.submittedAt).getTime() : 0;
          const dateB = b.submittedAt ? new Date(b.submittedAt).getTime() : 0;
          return dateB - dateA;
        });

        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedApplications = filteredApps.slice(startIndex, endIndex);

        return {
          success: true,
          data: {
            applications: paginatedApplications,
            total: filteredApps.length,
            page,
            totalPages: Math.ceil(filteredApps.length / limit),
            limit,
          },
        };
      } catch (error) {
        console.error('Error fetching applications:', error);
        return {
          success: false,
          error: error.message,
          data: {
            applications: [],
            total: 0,
            page: 1,
            totalPages: 0,
            limit,
          },
        };
      }
    },
  },

  // ==================== SYSTEM ANALYTICS ====================

  analytics: {
    getRegistrationTrends: async (days = 30) => {
      try {
        console.log('Fetching registration trends for', days, 'days');

        const usersRef = collection(db, 'users');
        const snapshot = await safeGetDocs(usersRef);

        const users = snapshot.docs.map((doc) => ({
          ...doc.data(),
          createdAt: safeDate(doc.data().createdAt),
        }));

        const trends = [];
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        // Initialize trends for each day
        for (let i = 0; i <= days; i++) {
          const date = new Date(startDate);
          date.setDate(date.getDate() + i);
          const dateString = date.toISOString().split('T')[0];

          trends.push({
            date: dateString,
            count: 0,
            byType: {},
          });
        }

        // Count registrations by date
        users.forEach((user) => {
          if (user.createdAt && user.createdAt >= startDate) {
            const dayIndex = Math.floor((user.createdAt - startDate) / (1000 * 60 * 60 * 24));
            if (dayIndex >= 0 && dayIndex <= days) {
              trends[dayIndex].count++;

              const userType = user.userType || 'unknown';
              trends[dayIndex].byType[userType] = (trends[dayIndex].byType[userType] || 0) + 1;
            }
          }
        });

        console.log('Registration trends fetched successfully');
        return { success: true, data: trends };
      } catch (error) {
        console.error('Error fetching registration trends:', error);
        return { success: false, error: error.message };
      }
    },

    getPlatformMetrics: async () => {
      try {
        console.log('Fetching platform metrics');

        // Get counts from collections
        const collections = ['users', 'companies', 'jobs', 'applications'];
        const metrics = {};

        for (const collectionName of collections) {
          const snapshot = await safeGetDocs(collection(db, collectionName));
          metrics[collectionName] = snapshot.docs.length;
        }

        // Get recent activities
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const activitiesRef = collection(db, 'activities');
        const activitiesSnapshot = await safeGetDocs(activitiesRef);

        const recentActivities = activitiesSnapshot.docs
          .map((doc) => doc.data())
          .filter((activity) => {
            const activityDate = safeDate(activity.timestamp);
            return activityDate && activityDate >= weekAgo;
          });

        const activeUsers = [
          ...new Set(recentActivities.map((activity) => activity.userId)),
        ].filter(Boolean).length;

        console.log('Platform metrics fetched successfully');
        return {
          success: true,
          data: {
            ...metrics,
            activeUsersLast7Days: activeUsers,
            conversionRate:
              metrics.applications && metrics.users
                ? ((metrics.applications / metrics.users) * 100).toFixed(2)
                : '0.00',
          },
        };
      } catch (error) {
        console.error('Error fetching platform metrics:', error);
        return { success: false, error: error.message };
      }
    },
  },

  // ==================== SYSTEM SETTINGS ====================

  settings: {
    getSystemSettings: async () => {
      try {
        console.log('Fetching system settings');

        const apiResult = await adminApiRequest('/api/admin/settings');
        if (apiResult.success) {
          return { success: true, data: apiResult.data || apiResult.settings || {} };
        }

        const settingsRef = doc(db, 'system_settings', 'general');
        const settingsSnap = await getDoc(settingsRef);

        if (settingsSnap.exists()) {
          return { success: true, data: settingsSnap.data() };
        } else {
          // Return default settings
          const defaultSettings = {
            requireJobApproval: true,
            autoApproveInternships: true,
            emailNotifications: true,
            maintenanceMode: false,
            registrationOpen: true,
            maxFileSize: 10, // MB
            allowedFileTypes: ['pdf', 'doc', 'docx', 'jpg', 'png'],
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          };

          // Don't create settings automatically, just return defaults
          return { success: true, data: defaultSettings };
        }
      } catch (error) {
        console.error('Error fetching system settings:', error);
        return { success: false, error: error.message };
      }
    },

    updateSystemSettings: async (updates, currentUser, userProfile) => {
      try {
        console.log('Updating system settings:', updates);

        const apiResult = await adminApiRequest('/api/admin/settings', {
          method: 'PUT',
          body: JSON.stringify(updates),
        });
        if (apiResult.success) {
          return { success: true, message: apiResult.message || 'Settings updated successfully' };
        }

        const settingsRef = doc(db, 'system_settings', 'general');
        const settingsSnap = await getDoc(settingsRef);

        const updateData = {
          ...updates,
          updatedAt: serverTimestamp(),
          updatedBy: getAdminId(currentUser),
        };

        if (settingsSnap.exists()) {
          await updateDoc(settingsRef, updateData);
        } else {
          await setDoc(settingsRef, {
            ...updateData,
            createdAt: serverTimestamp(),
          });
        }

        await logAction('system_settings_updated', { updates }, currentUser, userProfile);

        console.log('System settings updated successfully');
        return { success: true, message: 'Settings updated successfully' };
      } catch (error) {
        console.error('Error updating system settings:', error);
        return { success: false, error: error.message };
      }
    },
  },

  // ==================== AUDIT LOGS ====================
  audit: {
    getAuditLogs: async (filters = {}, page = 1, limit = 50) => {
      try {
        const actionsRef = collection(db, 'admin_actions');
        const snapshot = await safeGetDocs(
          query(actionsRef, orderBy('timestamp', 'desc'), queryLimit(500))
        );

        let logs = snapshot.docs.map(normalizeRecord);

        if (filters.action && filters.action !== 'all') {
          logs = logs.filter((log) => log.action === filters.action);
        }

        if (filters.adminId) {
          logs = logs.filter((log) => log.adminId === filters.adminId);
        }

        if (filters.search) {
          const term = filters.search.toLowerCase();
          logs = logs.filter((log) =>
            [log.action, log.adminName, log.adminId, JSON.stringify(log)]
              .filter(Boolean)
              .some((value) => String(value).toLowerCase().includes(term))
          );
        }

        const startIndex = (page - 1) * limit;
        const paginatedLogs = logs.slice(startIndex, startIndex + limit);

        return {
          success: true,
          data: {
            logs: paginatedLogs,
            total: logs.length,
            page,
            totalPages: Math.ceil(logs.length / limit),
            limit,
          },
        };
      } catch (error) {
        return {
          success: false,
          error: error.message,
          data: { logs: [], total: 0, page: 1, totalPages: 0, limit },
        };
      }
    },
  },

  // ==================== MEDIA REGISTRY ====================
  media: {
    registerUpload: async (payload, currentUser, userProfile) => {
      try {
        const mediaRef = await addDoc(collection(db, 'media_uploads'), {
          ...payload,
          uploadedAt: serverTimestamp(),
          uploadedBy: getAdminId(currentUser),
          uploadedByName: getAdminName(currentUser, userProfile),
        });

        await logAction(
          'media_uploaded',
          {
            mediaId: mediaRef.id,
            provider: payload.provider || 'cloudinary',
            publicId: payload.publicId || payload.public_id || null,
            folder: payload.folder || null,
          },
          currentUser,
          userProfile
        );

        return { success: true, data: { id: mediaRef.id } };
      } catch (error) {
        return { success: false, error: error.message };
      }
    },
  },
  // ==================== ADMIN MANAGEMENT ====================
  admins: {
    getAllAdmins: async (filters = {}, page = 1, limit = 20) => {
      try {
        const params = new URLSearchParams({ page: String(page), limit: String(limit) });
        if (filters.search) params.set('search', filters.search);
        if (filters.status && filters.status !== 'all') params.set('status', filters.status);
        if (filters.role && filters.role !== 'all') params.set('role', filters.role);
        const data = await apiRequest(`/api/admin/admins?${params}`);
        const admins = Array.isArray(data) ? data : data.admins || [];
        return { success: true, data: { admins, totalPages: data.totalPages || 1, stats: data.stats } };
      } catch (error) {
        return { success: false, error: error.message, data: [] };
      }
    },

    createAdmin: async (payload, currentUser, userProfile) => {
      try {
        const normalizedEmail = String(payload?.email || '')
          .trim()
          .toLowerCase();
        if (!normalizedEmail) {
          return { success: false, error: 'Email is required' };
        }

        const data = await apiRequest('/api/admin/admins', { method: 'POST', body: {
          email: normalizedEmail,
          displayName: payload?.displayName,
          adminLevel: payload?.adminLevel || payload?.role || 'admin',
          permissions: payload?.permissions || [],
        } });
        return { success: true, data, message: 'Admin access granted successfully' };
      } catch (error) {
        return { success: false, error: error.message };
      }
    },

    updateAdmin: async (adminId, updates, currentUser, userProfile) => {
      try {
        await apiRequest(`/api/admin/admins/${encodeURIComponent(adminId)}`, { method: 'PUT', body: {
          displayName: updates.displayName,
          adminLevel: updates.adminLevel || updates.role,
          status: updates.status,
          permissions: updates.permissions,
        } });
        return { success: true, message: 'Admin updated successfully' };
      } catch (error) {
        return { success: false, error: error.message };
      }
    },

    deactivateAdmin: async (adminId, currentUser, userProfile) => {
      try {
        await apiRequest(`/api/admin/admins/${encodeURIComponent(adminId)}`, { method: 'DELETE' });
        return { success: true, message: 'Admin deactivated successfully' };
      } catch (error) {
        return { success: false, error: error.message };
      }
    },
  },
};

const runBulkMutation = async (ids, mutation) => {
  const results = await Promise.all(ids.map((id) => mutation(id)));
  const failed = results.filter((result) => result?.success === false);
  return failed.length ? safeResult({ results }, new Error(`${failed.length} operation(s) failed`)) : safeResult({ results, count: results.length });
};

const getOne = async (collectionName, id) => {
  const snapshot = await getDoc(doc(db, collectionName, id));
  return snapshot.exists() ? recordData(snapshot) : null;
};

const addAdminServiceCompatibility = () => {
  adminService.getDashboardStats = async (currentUser, userProfile) => {
    try {
      const users = await getCollectionRecords('users', {}, 1, 10000);
      const companies = await getCollectionRecords('companies', {}, 1, 10000);
      const jobs = await getCollectionRecords('jobs', {}, 1, 10000);
      const applications = await getCollectionRecords('applications', {}, 1, 10000);
      const stats = { totalUsers: users.total, activeCompanies: companies.records.filter((item) => ['active', 'approved'].includes(item.status)).length, activeJobs: jobs.records.filter((item) => item.status === 'active').length, pendingApprovals: users.records.filter((item) => canonicalUserStatus(item.status) === 'pending').length, totalApplications: applications.total };
      await logAction('dashboard_stats_viewed', { stats }, currentUser, userProfile);
      return safeResult({
        stats,
        changes: { users: 0, companies: 0, jobs: 0, approvals: 0 },
        chartData: [],
      });
    } catch (error) { return safeResult({ stats: {}, changes: {}, chartData: [] }, error); }
  };

  adminService.getRecentActivities = async (currentUser, userProfile, limit = 10) => {
    try { const result = await getCollectionRecords('admin_actions', {}, 1, limit); return safeResult({ activities: result.items, total: result.total }); } catch (error) { return safeResult({ activities: [], total: 0 }, error); }
  };
  adminService.getSystemStatus = async () => safeResult({ database: 'online', storage: 'online', api: 'online', email: 'unknown', lastUpdated: new Date().toISOString() });
  adminService.getDashboardReport = async () => safeResult(JSON.stringify({ generatedAt: new Date().toISOString() }));

  adminService.users.getAllUsers = async (filters = {}, page = 1, limit = 20) => {
    try {
      // Do not delegate status filtering to the legacy getAllUsers implementation:
      // it matches status strings exactly and drops pending_approval/awaiting_approval.
      const result = await getCollectionRecords('users', filters, page, limit);
      return safeResult({ users: result.items, page: result.page, limit: result.limit, total: result.total, totalPages: result.totalPages });
    } catch (error) {
      return safeResult({ users: [], page, limit, total: 0, totalPages: 1 }, error);
    }
  };
  adminService.users.getPendingApprovals = async (arg1 = {}, arg2 = 1, arg3 = 20, arg4 = 1, arg5 = 20) => {
    const legacy = arg1 && typeof arg1 === 'object' && arg1.uid;
    const filters = legacy ? (arg3 && typeof arg3 === 'object' ? arg3 : {}) : (arg1 || {});
    const page = legacy ? Number(arg4) || 1 : Number(arg2) || 1;
    const limit = legacy ? Number(arg5) || 20 : Number(arg3) || 20;
    try { const result = await getCollectionRecords('users', { ...filters, status: undefined }, 1, 10000); const records = result.records.filter((item) => canonicalUserStatus(item.status) === 'pending'); const start = (page - 1) * limit; return safeResult({ users: records.slice(start, start + limit), total: records.length, page, limit, totalPages: Math.max(1, Math.ceil(records.length / limit)), stats: { total: records.length } }); } catch (error) { return safeResult({ users: [], total: 0, page, limit, totalPages: 1, stats: { total: 0 } }, error); }
  };
  adminService.users.getUserDetails = async (id) => { try { const data = await getOne('users', id); return data ? safeResult(data) : safeResult({}, new Error('User not found')); } catch (error) { return safeResult({}, error); } };
  adminService.users.bulkSuspendUsers = async (ids, reason, currentUser, userProfile) => runBulkMutation(ids, (id) => adminService.users.suspendUser(id, reason, currentUser, userProfile));
  adminService.users.bulkDeleteUsers = async (ids, reason, currentUser, userProfile) => runBulkMutation(ids, (id) => adminService.users.deleteUser(id, currentUser, userProfile));
  adminService.users.exportUsers = async (filters = {}) => { try { return safeResult(await exportCollection('users', filters)); } catch (error) { return safeResult([], error); } };
  adminService.users.exportPendingApprovals = async (filters = {}) => adminService.users.exportUsers({ ...filters, status: 'pending' });

  const addEntityNamespace = (namespace, collectionName, idName) => {
    const target = adminService[namespace] || {};
    target.getAll = async (filters = {}, page = 1, limit = 20) => { try { const result = await getCollectionRecords(collectionName, filters, page, limit); return safeResult({ [collectionName]: result.items, items: result.items, page, limit, total: result.total, totalPages: result.totalPages }); } catch (error) { return safeResult({ [collectionName]: [], items: [], page, limit, total: 0, totalPages: 1 }, error); } };
    target.getDetails = async (id) => { try { const data = await getOne(collectionName, id); return data ? safeResult(data) : safeResult({}, new Error(`${collectionName} record not found`)); } catch (error) { return safeResult({}, error); } };
    target.update = async (id, updates, currentUser, userProfile) => { try { return safeResult(await updateRecord(collectionName, id, updates, currentUser, userProfile, `${namespace}_update`)); } catch (error) { return safeResult({}, error); } };
    target.delete = async (id, currentUser, userProfile) => { try { await updateDoc(doc(db, collectionName, id), { status: 'deleted', deletedAt: serverTimestamp(), updatedAt: serverTimestamp() }); await logAction(`${namespace}_delete`, { [idName]: id }, currentUser, userProfile); return safeResult({ id }); } catch (error) { return safeResult({}, error); } };
    target.export = async (filters = {}) => { try { return safeResult(await exportCollection(collectionName, filters)); } catch (error) { return safeResult([], error); } };
    adminService[namespace] = target;
    return target;
  };

  const companies = addEntityNamespace('companies', 'companies', 'companyId');
  companies.createCompany = async (payload, currentUser, userProfile) => { try { const reference = await addDoc(collection(db, 'companies'), { ...payload, createdAt: serverTimestamp(), updatedAt: serverTimestamp(), createdBy: getAdminId(currentUser) }); await logAction('company_create', { companyId: reference.id }, currentUser, userProfile); return safeResult({ id: reference.id }); } catch (error) { return safeResult({}, error); } };
  companies.getAllCompanies = async (filters = {}, page = 1, limit = 20) => { try { const result = await getCollectionRecords('companies', filters, page, limit); return safeResult({ companies: result.items, page, limit, total: result.total, totalPages: result.totalPages }); } catch (error) { return safeResult({ companies: [], page, limit, total: 0, totalPages: 1 }, error); } };
  companies.updateCompanyStatus = async (id, status, reason, currentUser, userProfile) => { const action = status === 'approved' ? companies.approveCompany : status === 'rejected' ? companies.rejectCompany : status === 'suspended' ? companies.suspendCompany : companies.activateCompany; return action(id, reason, currentUser, userProfile); };
  companies.getCompanyDetails = companies.getDetails; companies.updateCompany = companies.update; companies.deleteCompany = companies.delete; companies.exportCompanies = companies.export; companies.getTopCompanies = async (currentUser, userProfile, limit = 5) => companies.getAllCompanies({}, 1, limit);
  const companyStatus = (status, action) => async (id, reason = '', currentUser, userProfile) => { try { const data = await updateRecord('companies', id, { status, verified: status === 'approved' || status === 'active', reviewNotes: reason }, currentUser, userProfile, `company_${action}`); return safeResult(data); } catch (error) { return safeResult({}, error); } };
  companies.approveCompany = companyStatus('approved', 'approve'); companies.rejectCompany = companyStatus('rejected', 'reject'); companies.suspendCompany = companyStatus('suspended', 'suspend'); companies.activateCompany = companyStatus('active', 'activate');
  companies.bulkApproveCompanies = async (ids, currentUser, userProfile) => runBulkMutation(ids, (id) => companies.approveCompany(id, '', currentUser, userProfile)); companies.bulkRejectCompanies = async (ids, reason, currentUser, userProfile) => runBulkMutation(ids, (id) => companies.rejectCompany(id, reason, currentUser, userProfile)); companies.bulkDeleteCompanies = async (ids, currentUser, userProfile) => runBulkMutation(ids, (id) => companies.deleteCompany(id, currentUser, userProfile));

  const jobs = addEntityNamespace('jobs', 'jobs', 'jobId');
  jobs.getAllJobs = async (filters = {}, page = 1, limit = 20) => { try { const result = await getCollectionRecords('jobs', filters, page, limit); return safeResult({ jobs: result.items, page, limit, total: result.total, totalPages: result.totalPages }); } catch (error) { return safeResult({ jobs: [], page, limit, total: 0, totalPages: 1 }, error); } };
  jobs.getJobDetails = jobs.getDetails; jobs.updateJob = jobs.update; jobs.deleteJob = jobs.delete; jobs.exportJobs = jobs.export; jobs.approveJob = async (id, currentUser, userProfile) => { try { return safeResult(await updateRecord('jobs', id, { status: 'approved', approved: true }, currentUser, userProfile, 'job_approve')); } catch (error) { return safeResult({}, error); } }; jobs.rejectJob = async (id, reason, currentUser, userProfile) => { try { return safeResult(await updateRecord('jobs', id, { status: 'rejected', rejectionReason: reason }, currentUser, userProfile, 'job_reject')); } catch (error) { return safeResult({}, error); } }; jobs.closeJob = async (id, currentUser, userProfile) => { try { return safeResult(await updateRecord('jobs', id, { status: 'closed' }, currentUser, userProfile, 'job_close')); } catch (error) { return safeResult({}, error); } }; jobs.reopenJob = async (id, currentUser, userProfile) => { try { return safeResult(await updateRecord('jobs', id, { status: 'active' }, currentUser, userProfile, 'job_reopen')); } catch (error) { return safeResult({}, error); } }; jobs.bulkApproveJobs = async (ids, currentUser, userProfile) => runBulkMutation(ids, (id) => jobs.approveJob(id, currentUser, userProfile)); jobs.bulkRejectJobs = async (ids, reason, currentUser, userProfile) => runBulkMutation(ids, (id) => jobs.rejectJob(id, reason, currentUser, userProfile)); jobs.bulkDeleteJobs = async (ids, currentUser, userProfile) => runBulkMutation(ids, (id) => jobs.deleteJob(id, currentUser, userProfile));

  const applications = adminService.applications;
  applications.searchApplications = applications.getAllApplications; applications.getApplicationDetails = async (id) => { try { const data = await getOne('applications', id); return data ? safeResult(data) : safeResult({}, new Error('Application not found')); } catch (error) { return safeResult({}, error); } }; applications.deleteApplication = async (id, currentUser, userProfile) => { try { return safeResult(await updateRecord('applications', id, { status: 'deleted' }, currentUser, userProfile, 'application_delete')); } catch (error) { return safeResult({}, error); } }; applications.exportApplications = async (filters = {}) => { try { return safeResult(await exportCollection('applications', filters)); } catch (error) { return safeResult([], error); } };

  adminService.audit.getAuditLogDetails = async (id) => { try { const data = await getOne('admin_actions', id); return data ? safeResult(data) : safeResult({}, new Error('Audit log not found')); } catch (error) { return safeResult({}, error); } }; adminService.audit.clearAuditLogs = async (filters = {}, currentUser, userProfile) => { try { const result = await getCollectionRecords('admin_actions', filters, 1, 500); await Promise.all(result.records.map((item) => deleteDoc(doc(db, 'admin_actions', item.id)))); await logAction('audit_clear', { count: result.records.length }, currentUser, userProfile); return safeResult({ count: result.records.length }); } catch (error) { return safeResult({}, error); } }; adminService.audit.exportAuditLogs = async (filters = {}) => { try { return safeResult(await exportCollection('admin_actions', filters)); } catch (error) { return safeResult([], error); } };

  const admins = adminService.admins;
  admins.approveExistingTestimonials = async () => {
    try { const data = await apiRequest('/api/admin/testimonials/approve-existing', { method: 'POST', body: {} }); return { success: true, data }; }
    catch (error) { return { success: false, error: error.message }; }
  };
  admins.getAdminDetails = async (id) => {
    try {
      const result = await apiRequest(`/api/admin/admins/${encodeURIComponent(id)}`);
      return { success: true, data: result };
    } catch (error) { return { success: false, error: error.message }; }
  };
  admins.suspendAdmin = async (id, reason) => admins.updateAdmin(id, { status: 'suspended', suspensionReason: reason });
  admins.activateAdmin = async (id) => admins.updateAdmin(id, { status: 'active' });
  admins.revokeAdminAccess = async (id, reason) => {
    try { const data = await apiRequest(`/api/admin/admins/${encodeURIComponent(id)}/revoke`, { method: 'POST', body: { reason } }); return { success: true, data }; }
    catch (error) { return { success: false, error: error.message }; }
  };
  admins.deleteAdmin = async (id, reason) => {
    try { const data = await apiRequest(`/api/admin/admins/${encodeURIComponent(id)}`, { method: 'DELETE', body: { reason } }); return { success: true, data }; }
    catch (error) { return { success: false, error: error.message }; }
  };
  admins.exportAdmins = async (filters = {}, format = 'csv') => {
    try {
      const data = await apiRequest(`/api/admin/admins?${new URLSearchParams({ ...filters, page: '1', limit: '100' })}`);
      const records = data.admins || (Array.isArray(data) ? data : []);
      if (format === 'csv') {
        const quote = (value) => `"${String(value ?? '').replaceAll('"', '""')}"`;
        return { success: true, data: [
          ['Name', 'Email', 'Role', 'Status', 'Created'].map(quote).join(','),
          ...records.map((item) => [item.displayName, item.email, item.role, item.status, item.createdAt].map(quote).join(',')),
        ].join('\n') };
      }
      return { success: true, data: JSON.stringify(records, null, 2) };
    }
    catch (error) { return { success: false, error: error.message }; }
  };

  adminService.admissions = { getAllApplications: applications.getAllApplications, getApplicationDetails: applications.getApplicationDetails, approveApplication: async (id, currentUser, userProfile) => { try { return safeResult(await updateRecord('applications', id, { status: 'approved' }, currentUser, userProfile, 'admission_approve')); } catch (error) { return safeResult({}, error); } }, rejectApplication: async (id, reason, currentUser, userProfile) => { try { return safeResult(await updateRecord('applications', id, { status: 'rejected', rejectionReason: reason }, currentUser, userProfile, 'admission_reject')); } catch (error) { return safeResult({}, error); } }, deleteApplication: applications.deleteApplication, bulkApproveApplications: async (ids, currentUser, userProfile) => runBulkMutation(ids, (id) => adminService.admissions.approveApplication(id, currentUser, userProfile)), bulkRejectApplications: async (ids, reason, currentUser, userProfile) => runBulkMutation(ids, (id) => adminService.admissions.rejectApplication(id, reason, currentUser, userProfile),), exportApplications: applications.exportApplications };

  adminService.profile = { getAdminProfile: async (id) => { try { const data = await getOne('users', id); return data ? safeResult(data) : safeResult({}, new Error('Profile not found')); } catch (error) { return safeResult({}, error); } }, updateAdminProfile: async (id, data, currentUser, userProfile) => { try { return safeResult(await updateRecord('users', id, data, currentUser, userProfile, 'admin_profile_update')); } catch (error) { return safeResult({}, error); } }, updateAdminPhoto: async (id, data, currentUser, userProfile) => adminService.profile.updateAdminProfile(id, data, currentUser, userProfile), removeAdminPhoto: async (id, currentUser, userProfile) => adminService.profile.updateAdminProfile(id, { photoURL: null, photoPublicId: null }, currentUser, userProfile), changeAdminPassword: async () => safeResult({}, new Error('Password changes must be completed through Firebase Authentication')), toggle2FA: async (id, enabled, currentUser, userProfile) => adminService.profile.updateAdminProfile(id, { twoFactorEnabled: enabled }, currentUser, userProfile), getAdminActivity: async (id, limit = 10) => { const result = await adminService.audit.getAuditLogs({ adminId: id }, 1, limit); return { ...result, data: { ...(result.data || {}), activities: result.data?.logs || [] } }; }, deleteAdminAccount: async (id, currentUser, userProfile) => admins.deleteAdmin(id, currentUser, userProfile) };
  adminService.reports = { getSystemReport: async (filters = {}) => adminService.getDashboardStats(auth.currentUser, null).then((result) => safeResult({ ...result.data, filters })), exportSystemReport: async (filters = {}) => adminService.reports.getSystemReport(filters) };
};

addAdminServiceCompatibility();

const normalizeServiceEnvelope = (service) => {
  Object.entries(service).forEach(([key, value]) => {
    if (typeof value === 'function') {
      service[key] = async (...args) => {
        try {
          const result = await value(...args);
          if (result && typeof result === 'object' && 'success' in result) {
            return { ...result, data: result.data ?? {}, error: result.error ?? null };
          }
          return { success: true, data: result ?? {}, error: null };
        } catch (error) {
          return { success: false, data: {}, error: error?.message || String(error) };
        }
      };
    } else if (value && typeof value === 'object' && !Array.isArray(value)) {
      normalizeServiceEnvelope(value);
    }
  });
  return service;
};

normalizeServiceEnvelope(adminService);

export default adminService;
