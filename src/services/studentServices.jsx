import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  writeBatch,
  where,
} from 'firebase/firestore';
import { deleteObject, ref } from 'firebase/storage';

import { auth, db, storage } from '../config/firebase';

import { apiRequest } from './apiClient';
import { cloudinaryService } from './cloudinaryService';
import { storageService } from './storageService';

const COLLECTIONS = {
  STUDENTS: 'students',
  APPLICATIONS: 'applications',
  JOBS: 'jobs',
  DOCUMENTS: 'documents',
  NOTIFICATIONS: 'notifications',
  COMPANIES: 'companies',
  USERS: 'users',
};

// ==================== HELPER FUNCTIONS ====================

const safeDateConvert = (firebaseDate) => {
  if (!firebaseDate) return null;
  if (firebaseDate.toDate && typeof firebaseDate.toDate === 'function') {
    return firebaseDate.toDate();
  }
  if (firebaseDate instanceof Date) {
    return firebaseDate;
  }
  if (typeof firebaseDate === 'string') {
    return new Date(firebaseDate);
  }
  return null;
};

const normalizeOpportunity = (snapshot) => {
  const data = snapshot.data();
  const requirementSkills = Array.isArray(data.requirements)
    ? data.requirements.map((skill) => typeof skill === 'string' ? skill : skill?.name || skill?.title || '').filter(Boolean)
    : Array.isArray(data.requirements?.skills)
      ? data.requirements.skills
      : typeof data.requirements === 'string'
        ? data.requirements.split(/\r?\n|,/).map((skill) => skill.trim()).filter(Boolean)
        : [];

  return {
    ...data,
    id: snapshot.id,
    type: data.type || data.jobType || data.positionType || 'full-time',
    companyName: data.companyName || data.company || '',
    skills: Array.isArray(data.skills)
      ? data.skills.map((skill) => typeof skill === 'string' ? skill : skill?.name || skill?.title || '').filter(Boolean)
      : typeof data.skills === 'string'
        ? data.skills.split(/\r?\n|,/).map((skill) => skill.trim()).filter(Boolean)
        : requirementSkills,
    deadline: safeDateConvert(data.deadline),
  };
};

const subscribeToQuery = (firestoreQuery, onData, onError, mapSnapshot) => {
  if (typeof onData !== 'function') return () => {};
  try {
    return onSnapshot(
      firestoreQuery,
      (snapshot) => onData(mapSnapshot(snapshot)),
      (error) => onError?.(error)
    );
  } catch (error) {
    onError?.(error);
    return () => {};
  }
};

const calculateProfileCompletion = (profile) => {
  if (!profile) return 0;
  let completion = 0;

  // Count only values actually present on the saved profile.
  const basicFields = ['fullName', 'email', 'phone', 'address', 'dateOfBirth', 'institution', 'program', 'yearOfStudy', 'bio'];
  const filledBasicFields = basicFields.filter((field) => String(profile[field] || '').trim()).length;
  completion += Math.round((filledBasicFields / basicFields.length) * 40);

  // Qualifications (30%)
  if (profile.qualifications) {
    const quals = profile.qualifications;
    if (quals.educationLevel && quals.educationLevel !== 'Not specified') completion += 10;
    if (quals.overallGrade && quals.overallGrade !== 'Not specified') completion += 10;
  }

  // Job Preferences (20%)
  if (profile.jobPreferences) {
    const prefs = profile.jobPreferences;
    if (prefs.industries && prefs.industries.length > 0) completion += 5;
    if (prefs.jobTypes && prefs.jobTypes.length > 0) completion += 5;
  }

  // Skills & Documents (20%)
  if (profile.skills && profile.skills.length > 0) completion += 10;
  if (profile.resumeUrl) completion += 10;

  return Math.min(100, completion);
};

const checkJobQualification = (student, job) => {
  if (!student || !job) return false;

  const studentQuals = student.qualifications || {};
  const studentSkills = (Array.isArray(student.skills) ? student.skills : [])
    .map((skill) => typeof skill === 'string' ? skill : skill?.name || '')
    .filter(Boolean);

  // Check education requirements
  if (job.requirements?.minEducation) {
    const educationLevels = {
      high_school: 1,
      diploma: 2,
      bachelors: 3,
      masters: 4,
      phd: 5,
    };

    const studentLevel = educationLevels[studentQuals.educationLevel?.toLowerCase()] || 0;
    const requiredLevel = educationLevels[job.requirements.minEducation?.toLowerCase()] || 0;

    if (studentLevel < requiredLevel) return false;
  }

  // Check skills
  const requiredSkills = (Array.isArray(job.requirements?.skills) ? job.requirements.skills : [])
    .map((skill) => typeof skill === 'string' ? skill : skill?.name || '')
    .filter(Boolean);
  if (requiredSkills.length > 0) {
    const hasRequiredSkills = requiredSkills.every((skill) =>
      studentSkills.some(
        (s) =>
          s.toLowerCase().includes(skill.toLowerCase()) ||
          skill.toLowerCase().includes(s.toLowerCase())
      )
    );
    if (!hasRequiredSkills) return false;
  }

  // Check experience
  if (job.requirements?.minExperience && student.experience) {
    if (student.experience < job.requirements.minExperience) return false;
  }

  return true;
};

// ==================== PROFILE OPERATIONS ====================

export const initializeStudentProfile = async (userId, userData = {}) => {
  try {
    if (!userId) {
      return { success: false, error: 'User ID is required' };
    }

    const studentRef = doc(db, COLLECTIONS.STUDENTS, userId);
    const studentSnap = await getDoc(studentRef);

    if (!studentSnap.exists()) {
      const studentData = {
        uid: userId,
        email: userData.email || '',
        fullName: userData.fullName || userData.displayName || '',
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        phone: userData.phone || '',
        userType: 'student',
        profileCompletion: 0,
        qualifications: {
          educationLevel: '',
          overallGrade: '',
          subjects: [],
          certificates: [],
        },
        jobPreferences: {
          industries: [],
          jobTypes: [],
          locations: [],
          minSalary: null,
        },
        skills: [],
        experience: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        status: 'active',
        isActive: true,
      };

      await setDoc(studentRef, studentData);

      // Also update the users collection to ensure userType is set
      const userRef = doc(db, COLLECTIONS.USERS, userId);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        await setDoc(userRef, {
          uid: userId,
          email: userData.email || '',
          displayName: userData.fullName || userData.displayName || '',
          userType: 'student',
          role: 'student',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } else {
        await updateDoc(userRef, {
          userType: 'student',
          role: 'student',
          updatedAt: serverTimestamp(),
        });
      }

      console.log('✅ Student profile initialized for:', userId);
      return { success: true, data: studentData };
    }
    return { success: true, data: studentSnap.data() };
  } catch (error) {
    console.error('❌ Error initializing student profile:', error);
    return { success: false, error: error.message };
  }
};

export const getStudentProfile = async (userId) => {
  try {
    if (!userId) {
      return { success: false, error: 'User ID is required' };
    }

    const studentRef = doc(db, COLLECTIONS.STUDENTS, userId);
    const studentSnap = await getDoc(studentRef);

    if (studentSnap.exists()) {
      const data = studentSnap.data();

      // Ensure arrays exist
      if (!Array.isArray(data.skills)) data.skills = [];
      if (!Array.isArray(data.qualifications?.subjects)) {
        data.qualifications = data.qualifications || {};
        data.qualifications.subjects = [];
      }

      // Calculate profile completion
      data.profileCompletion = calculateProfileCompletion(data);

      return { success: true, data };
    } else {
      // Try to get user data from users collection
      const userRef = doc(db, COLLECTIONS.USERS, userId);
      const userSnap = await getDoc(userRef);
      const userData = userSnap.exists() ? userSnap.data() : {};

      // Initialize profile with user data
      const initResult = await initializeStudentProfile(userId, {
        email: userData.email || '',
        fullName: userData.displayName || '',
        userType: 'student',
      });

      if (initResult.success) {
        return { success: true, data: initResult.data };
      }

      // Return basic profile if initialization fails
      return {
        success: true,
        data: {
          uid: userId,
          qualifications: {
            educationLevel: 'Not specified',
            overallGrade: 'Not specified',
            subjects: [],
            certificates: [],
          },
          jobPreferences: {
            industries: [],
            jobTypes: [],
            locations: [],
            minSalary: null,
          },
          skills: [],
          profileCompletion: 0,
        },
      };
    }
  } catch (error) {
    console.error('❌ Error getting student profile:', error);

    // Check if this is a permission error
    if (error.code === 'permission-denied' || error.message.includes('permission')) {
      console.log('🔑 Permission denied - trying alternative approach');

      // Try to get user data instead
      try {
        const userRef = doc(db, COLLECTIONS.USERS, userId);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const userData = userSnap.data();
          return {
            success: true,
            data: {
              uid: userId,
              email: userData.email,
              fullName: userData.displayName,
              userType: 'student',
              profileCompletion: 0,
              qualifications: {
                educationLevel: 'Not specified',
                overallGrade: 'Not specified',
                subjects: [],
                certificates: [],
              },
              jobPreferences: {
                industries: [],
                jobTypes: [],
                locations: [],
                minSalary: null,
              },
              skills: [],
            },
          };
        }
      } catch (userError) {
        console.error('❌ Error getting user data:', userError);
      }
    }

    return { success: false, error: error.message };
  }
};

export const updateStudentProfile = async (userId, updates) => {
  try {
    if (!userId) {
      return { success: false, error: 'User ID is required' };
    }

    const studentRef = doc(db, COLLECTIONS.STUDENTS, userId);

    // Check if document exists
    const studentSnap = await getDoc(studentRef);

    if (!studentSnap.exists()) {
      // Initialize first
      await initializeStudentProfile(userId, updates);
    } else {
      // Update existing
      await updateDoc(studentRef, {
        ...updates,
        profileCompletion: calculateProfileCompletion({ ...(studentSnap.data() || {}), ...updates }),
        updatedAt: serverTimestamp(),
      });
    }

    if (!studentSnap.exists()) {
      const createdProfile = await getStudentProfile(userId);
      if (createdProfile.success) {
        await updateDoc(studentRef, { profileCompletion: calculateProfileCompletion(createdProfile.data) });
      }
    }

    // Recalculate profile completion
    const updatedProfile = await getStudentProfile(userId);
    if (updatedProfile.success && updatedProfile.data) {
      const completion = calculateProfileCompletion(updatedProfile.data);
      await updateDoc(studentRef, { profileCompletion: completion });
    }

    return { success: true };
  } catch (error) {
    console.error('❌ Error updating student profile:', error);
    return { success: false, error: error.message };
  }
};

export const updateStudentQualifications = async (userId, qualifications) => {
  try {
    if (!userId) {
      return { success: false, error: 'User ID is required' };
    }

    const studentRef = doc(db, COLLECTIONS.STUDENTS, userId);
    await updateDoc(studentRef, {
      qualifications: qualifications,
      updatedAt: serverTimestamp(),
    });

    return { success: true };
  } catch (error) {
    console.error('❌ Error updating qualifications:', error);
    return { success: false, error: error.message };
  }
};

export const updateJobPreferences = async (userId, preferences) => {
  try {
    if (!userId) {
      return { success: false, error: 'User ID is required' };
    }

    const studentRef = doc(db, COLLECTIONS.STUDENTS, userId);
    await updateDoc(studentRef, {
      jobPreferences: preferences,
      updatedAt: serverTimestamp(),
    });

    return { success: true };
  } catch (error) {
    console.error('❌ Error updating job preferences:', error);
    return { success: false, error: error.message };
  }
};

// ==================== DOCUMENT OPERATIONS ====================

export const uploadResume = async (file, userId) => {
  try {
    if (!file) {
      return { success: false, error: 'No file provided' };
    }

    const validTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    if (!validTypes.includes(file.type)) {
      return { success: false, error: 'Please upload a PDF or Word document' };
    }

    if (file.size > 5 * 1024 * 1024) {
      return { success: false, error: 'File size must be less than 5MB' };
    }

    console.log('📤 Uploading resume...');

    if (auth.currentUser?.uid !== userId) throw new Error('Please sign in again to upload your resume.');
    const formData = new FormData();
    formData.append('file', file);
    const uploadResult = await apiRequest('/api/media/student/resume', {
      method: 'POST',
      body: formData,
    });

    if (!uploadResult?.url || !uploadResult.publicId) {
      throw new Error('Cloudinary returned incomplete resume metadata.');
    }
    const publicId = uploadResult.publicId;

    console.log('Resume uploaded successfully to Cloudinary');

    // Update student profile with resume URL
    const studentRef = doc(db, COLLECTIONS.STUDENTS, userId);
    await updateDoc(studentRef, {
      resumeUrl: uploadResult.url,
      resumeStorageType: 'cloudinary',
      updatedAt: serverTimestamp(),
    });

    // Also save to documents collection
    const documentData = {
      userId,
      studentId: userId,
      documentType: 'resume',
      fileName: file.name,
      fileUrl: uploadResult.url,
      storagePath: publicId,
      publicId,
      cloudinaryResourceType: uploadResult.resourceType || 'raw',
      storageType: 'cloudinary',
      uploadedAt: serverTimestamp(),
      fileSize: file.size,
      mimeType: file.type,
      status: 'active',
    };

    await addDoc(collection(db, COLLECTIONS.DOCUMENTS), documentData);

    return {
      success: true,
      url: uploadResult.url,
      storageType: 'cloudinary',
    };
  } catch (error) {
    console.error('❌ Error uploading resume:', error);
    return { success: false, error: error.message };
  }
};

export const getStudentDocuments = async (studentId) => {
  try {
    if (!studentId) {
      return { success: false, error: 'Student ID is required' };
    }

    const documentsRef = collection(db, COLLECTIONS.DOCUMENTS);
    const [studentRecords, legacyRecords] = await Promise.all([
      getDocs(query(documentsRef, where('studentId', '==', studentId))),
      getDocs(query(documentsRef, where('userId', '==', studentId))),
    ]);
    const documents = Array.from(new Map(
      [...studentRecords.docs, ...legacyRecords.docs].map((documentSnapshot) => {
        const data = documentSnapshot.data();
        return [documentSnapshot.id, {
          id: documentSnapshot.id,
          ...data,
          uploadedAt: safeDateConvert(data.uploadedAt),
        }];
      })
    ).values()).sort((left, right) => (right.uploadedAt?.getTime() || 0) - (left.uploadedAt?.getTime() || 0));

    return { success: true, data: documents };
  } catch (error) {
    if (error?.code === 'permission-denied' || error?.message?.toLowerCase().includes('permission')) {
      return { success: false, error: 'You do not have permission to view these documents. Check the Firestore documents rules or contact support.' };
    }

    console.error('❌ Error getting student documents:', error);
    return { success: false, error: error.message };
  }
};

export const subscribeToStudentDocuments = (studentId, onData, onError) => {
  if (!studentId || typeof onData !== 'function') return () => {};

  const snapshots = new Map();
  const emitDocuments = () => {
    const records = new Map();
    snapshots.forEach((snapshot) => snapshot.docs.forEach((documentSnapshot) => {
      const data = documentSnapshot.data();
      records.set(documentSnapshot.id, {
        id: documentSnapshot.id,
        ...data,
        uploadedAt: safeDateConvert(data.uploadedAt),
      });
    }));
    onData([...records.values()]
      .sort((left, right) => (right.uploadedAt?.getTime() || 0) - (left.uploadedAt?.getTime() || 0)));
  };
  const documentsRef = collection(db, COLLECTIONS.DOCUMENTS);
  const subscribe = (key, field) => subscribeToQuery(
    query(documentsRef, where(field, '==', studentId)),
    (snapshot) => {
      snapshots.set(key, snapshot);
      emitDocuments();
    },
    onError,
    (snapshot) => snapshot
  );
  const unsubscribeByStudentId = subscribe('studentId', 'studentId');
  const unsubscribeByUserId = subscribe('userId', 'userId');
  return () => {
    unsubscribeByStudentId();
    unsubscribeByUserId();
  };
};

export const uploadDocument = async (userId, file, documentType) => {
  try {
    if (!userId || !file) {
      return { success: false, error: 'User ID and file are required' };
    }

    const allowedTypes = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png'];
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    if (!allowedTypes.includes(fileExtension)) {
      return { success: false, error: 'Please upload PDF, Word, or image files only' };
    }

    if (file.size > 5 * 1024 * 1024) {
      return { success: false, error: 'File size must be 5MB or smaller' };
    }

    if (auth.currentUser?.uid !== userId) {
      return { success: false, error: 'Please sign in again to upload this document.' };
    }

    const uploadResult = await cloudinaryService.uploadToCloudinary(file, `students/${userId}/documents`, {
      tags: ['student-document', documentType, `student_${userId}`],
      context: { studentId: userId, documentType, originalName: file.name },
    });
    if (!uploadResult?.success || !uploadResult.url || !uploadResult.public_id) {
      throw new Error(uploadResult?.error || 'Cloudinary could not save the file. Check the upload preset and Cloudinary configuration.');
    }

    const documentData = {
      studentId: userId,
      userId,
      documentType,
      fileName: file.name,
      fileUrl: uploadResult.url,
      storagePath: uploadResult.public_id,
      publicId: uploadResult.public_id,
      storageType: 'cloudinary',
      cloudinaryResourceType: uploadResult.resource_type || 'raw',
      uploadedAt: serverTimestamp(),
      fileSize: file.size,
      mimeType: file.type,
      status: 'active',
    };

    const documentsRef = collection(db, COLLECTIONS.DOCUMENTS);
    let docRef;
    try {
      docRef = await addDoc(documentsRef, documentData);
    } catch (recordError) {
      throw recordError;
    }

    return {
      success: true,
      id: docRef.id,
      url: uploadResult.url,
      storageType: 'cloudinary',
      message: 'Document uploaded successfully!',
    };
  } catch (error) {
    console.error('❌ Error uploading document:', error);
    return { success: false, error: error.message };
  }
};

export const deleteDocument = async (documentId, storagePath, studentId = null) => {
  try {
    if (!documentId) {
      return { success: false, error: 'Document ID is required' };
    }

    const documentRef = doc(db, COLLECTIONS.DOCUMENTS, documentId);
    const documentSnapshot = await getDoc(documentRef);
    if (!documentSnapshot.exists()) {
      return { success: false, error: 'Document not found.' };
    }
    const documentData = documentSnapshot.data();
    const ownerId = documentData.studentId || documentData.userId;
    if (studentId && ownerId !== studentId) {
      return { success: false, error: 'You can only delete your own documents.' };
    }

    const storedPath = storagePath || documentData.storagePath;
    const cloudinaryStored = documentData.storageType === 'cloudinary' || cloudinaryService.isCloudinaryUrl(documentData.fileUrl);
    if (cloudinaryStored) {
      try {
        const token = await auth.currentUser?.getIdToken();
        if (!token || auth.currentUser?.uid !== documentData.studentId) {
          throw new Error('Please sign in again to delete this document.');
        }

        const response = await fetch(`${storageService.baseUrl}/media/cloudinary/delete-student-document`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ documentId }),
        });
        const result = await response.json().catch(() => ({}));
        if (!response.ok || !result.success) {
          throw new Error(result.message || 'Cloudinary could not delete this file.');
        }

        return { success: true, message: 'Document deleted successfully!' };
      } catch (storageError) {
        return { success: false, error: `File deletion failed; the document record was kept. ${storageError.message}` };
      }
    } else if (
      storedPath
      || /^https:\/\/(?:firebasestorage\.googleapis\.com|storage\.googleapis\.com)\//i.test(documentData.fileUrl || '')
    ) {
      try {
        const fileRef = ref(storage, storedPath || documentData.fileUrl);
        await deleteObject(fileRef);
      } catch (storageError) {
        if (storageError?.code !== 'storage/object-not-found') {
          return { success: false, error: `File deletion failed; the document record was kept. ${storageError.message}` };
        }
      }
    }

    await deleteDoc(documentRef);

    return { success: true, message: 'Document deleted successfully!' };
  } catch (error) {
    console.error('❌ Error deleting document:', error);
    return { success: false, error: error.message };
  }
};

// ==================== JOB OPERATIONS ====================

export const getJobs = async (studentId = null) => {
  try {
    const jobsRef = collection(db, COLLECTIONS.JOBS);
    const jobsQuery = query(jobsRef, where('status', '==', 'active'));
    const jobsSnap = await getDocs(jobsQuery);
    const now = Date.now();
    const jobs = jobsSnap.docs
      .map(normalizeOpportunity)
      .filter((job) => !job.deadline || job.deadline.getTime() >= now);

    if (studentId) {
      const studentProfile = await getStudentProfile(studentId);
      if (studentProfile.success) {
        const qualifiedJobs = [];
        for (const job of jobs) {
          const isQualified = await checkJobQualification(studentProfile.data, job);
          if (isQualified) qualifiedJobs.push(job);
        }
        return { success: true, data: qualifiedJobs };
      }
    }

    return { success: true, data: jobs };
  } catch (error) {
    console.error('❌ Error getting jobs:', error);
    return { success: false, error: error.message };
  }
};

export const subscribeToActiveJobs = (onData, onError) => {
  const jobsQuery = query(
    collection(db, COLLECTIONS.JOBS),
    where('status', '==', 'active')
  );

  return subscribeToQuery(jobsQuery, (snapshot) => {
    const now = Date.now();
    const jobs = snapshot.docs
      .map(normalizeOpportunity)
      .filter((job) => {
        if (job.approved === false) return false;
        return !job.deadline || job.deadline.getTime() >= now;
      })
      .sort((left, right) => {
        const leftDate = safeDateConvert(left.createdAt)?.getTime() || 0;
        const rightDate = safeDateConvert(right.createdAt)?.getTime() || 0;
        return rightDate - leftDate;
      });
    onData(jobs);
  }, onError, (snapshot) => snapshot);
};

export const subscribeToSavedJobs = (studentId, onData, onError) => {
  if (!studentId || typeof onData !== 'function') return () => {};
  const savedJobsQuery = query(
    collection(db, 'savedJobs'),
    where('userId', '==', studentId)
  );

  return subscribeToQuery(savedJobsQuery, (snapshot) => {
    onData(snapshot.docs
      .filter((savedJob) => savedJob.data().isActive !== false)
      .map((savedJob) => ({ id: savedJob.id, ...savedJob.data() })));
  }, onError, (snapshot) => snapshot);
};

export const subscribeToCompanyFollows = (studentId, onData, onError) => {
  if (!studentId || typeof onData !== 'function') return () => {};
  const followsQuery = query(collection(db, 'companyFollowers'), where('studentId', '==', studentId));
  return onSnapshot(followsQuery, (snapshot) => {
    onData(new Set(snapshot.docs.filter((entry) => entry.data().status !== 'inactive').map((entry) => entry.data().companyId)));
  }, onError);
};

export const setCompanyFollow = async (studentId, companyId, following) => {
  if (!studentId || !companyId || studentId === companyId) return { success: false, error: 'A valid company is required.' };
  const followerRef = doc(db, 'companyFollowers', `${companyId}_${studentId}`);
  const edgeRef = doc(db, 'company_chat_followers', `${companyId}_${studentId}`);
  try {
    const batch = writeBatch(db);
    if (following) {
      batch.set(followerRef, { companyId, studentId, status: 'active', followedAt: serverTimestamp(), updatedAt: serverTimestamp() }, { merge: true });
      batch.set(edgeRef, { companyId, followerId: studentId, status: 'active', updatedAt: serverTimestamp() }, { merge: true });
    } else {
      batch.delete(followerRef);
      batch.delete(edgeRef);
    }
    await batch.commit();
    return { success: true };
  } catch (error) { return { success: false, error: error.message || 'Unable to update company follow.' }; }
};

export const setStudentJobSaved = async (studentId, jobId, saved) => {
  if (!studentId || !jobId) return { success: false, error: 'Student and job are required.' };
  const savedJobId = `${studentId}_${encodeURIComponent(jobId)}`;
  const savedJobRef = doc(db, 'savedJobs', savedJobId);

  try {
    if (saved) {
      const existingQuery = query(collection(db, 'savedJobs'), where('userId', '==', studentId));
      const existingSnapshot = await getDocs(existingQuery);
      const existingSavedJob = existingSnapshot.docs.find((record) => record.data().jobId === jobId);
      if (existingSavedJob) {
        await updateDoc(existingSavedJob.ref, { isActive: true, savedAt: serverTimestamp() });
        return { success: true };
      }
      await setDoc(savedJobRef, {
        userId: studentId,
        studentId,
        jobId,
        isActive: true,
        savedAt: serverTimestamp(),
      }, { merge: true });
    } else {
      const existingQuery = query(collection(db, 'savedJobs'), where('userId', '==', studentId));
      const existingSnapshot = await getDocs(existingQuery);
      await Promise.all(existingSnapshot.docs
        .filter((record) => record.data().jobId === jobId)
        .map((record) => deleteDoc(record.ref)));
    }
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getRecommendedJobs = async (studentId) => {
  try {
    if (!studentId) return { success: false, error: 'Student ID is required' };

    const studentProfile = await getStudentProfile(studentId);
    if (!studentProfile.success) return { success: false, error: 'Student profile not found' };

    const jobsResult = await getJobs();
    if (!jobsResult.success) return { success: false, error: 'Failed to load jobs' };

    const student = studentProfile.data;
    const studentSkills = Array.isArray(student.skills) ? student.skills : [];
    const studentPreferences = student.jobPreferences || {};

    const recommendedJobs = jobsResult.data.filter((job) => {
      // Check qualifications
      const isQualified = checkJobQualification(student, job);
      if (!isQualified) return false;

      // Check preferences if set
      if (studentPreferences.industries?.length > 0) {
        if (!studentPreferences.industries.includes(job.industry)) return false;
      }

      if (studentPreferences.jobTypes?.length > 0) {
        if (!studentPreferences.jobTypes.includes(job.jobType)) return false;
      }

      if (studentPreferences.minSalary && job.salary) {
        if (job.salary < studentPreferences.minSalary) return false;
      }

      return true;
    });

    // Sort by relevance (more skills matched = higher rank)
    recommendedJobs.sort((a, b) => {
      const aSkills = Array.isArray(a.requirements?.skills) ? a.requirements.skills : [];
      const bSkills = Array.isArray(b.requirements?.skills) ? b.requirements.skills : [];

      const aMatches = aSkills.filter((skill) =>
        studentSkills.some((s) => s.toLowerCase().includes(skill.toLowerCase()))
      ).length;

      const bMatches = bSkills.filter((skill) =>
        studentSkills.some((s) => s.toLowerCase().includes(skill.toLowerCase()))
      ).length;

      return bMatches - aMatches;
    });

    return { success: true, data: recommendedJobs };
  } catch (error) {
    console.error('❌ Error getting recommended jobs:', error);
    return { success: false, error: error.message };
  }
};

// ==================== APPLICATION OPERATIONS ====================

export const applyForJob = async (applicationData) => {
  try {
    const { studentId, jobId } = applicationData || {};
    if (!studentId || !jobId) {
      return { success: false, error: 'Student ID and job ID are required.' };
    }

    const existingQuery = query(
      collection(db, COLLECTIONS.APPLICATIONS),
      where('studentId', '==', studentId)
    );
    const existingApplications = await getDocs(existingQuery);
    if (existingApplications.docs.some((application) => application.data().jobId === jobId)) {
      return { success: false, error: 'You have already applied for this opportunity.' };
    }

    const jobSnapshot = await getDoc(doc(db, COLLECTIONS.JOBS, jobId));
    if (!jobSnapshot.exists()) {
      return { success: false, error: 'This opportunity is no longer available.' };
    }
    const job = normalizeOpportunity(jobSnapshot);
    if (job.status !== 'active') {
      return { success: false, error: 'Applications are closed for this opportunity.' };
    }

    const application = {
      ...applicationData,
      studentId,
      jobId,
      jobTitle: job.title || 'Opportunity',
      jobName: job.title || 'Opportunity',
      companyName: job.companyName || '',
      type: job.type === 'internship' ? 'internship' : 'job',
      appliedAt: serverTimestamp(),
      status: 'pending',
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, COLLECTIONS.APPLICATIONS), application);
    return { success: true, id: docRef.id };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const checkExistingApplication = async (studentId, jobId) => {
  try {
    if (!studentId || !jobId) {
      return { success: false, error: 'Student ID and Job ID are required' };
    }

    const applicationsRef = collection(db, COLLECTIONS.APPLICATIONS);
    const q = query(
      applicationsRef,
      where('studentId', '==', studentId)
    );

    const querySnapshot = await getDocs(q);
    const existingApplication = querySnapshot.docs.find(
      (application) => application.data().jobId === jobId
    );

    if (!existingApplication) {
      return { success: true, exists: false };
    } else {
      return {
        success: true,
        exists: true,
        applicationId: existingApplication.id,
        data: existingApplication.data(),
      };
    }
  } catch (error) {
    console.error('❌ Error checking existing application:', error);
    return { success: false, error: error.message };
  }
};

export const getStudentApplications = async (studentId) => {
  try {
    if (!studentId) return { success: false, error: 'Student ID is required' };

    const applicationsRef = collection(db, COLLECTIONS.APPLICATIONS);
    const q = query(applicationsRef, where('studentId', '==', studentId));

    const snapshot = await getDocs(q);
    const applications = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      appliedAt: safeDateConvert(doc.data().appliedAt),
    }));

    return { success: true, data: applications };
  } catch (error) {
    if (error?.code === 'permission-denied' || error?.message?.toLowerCase().includes('permission')) {
      return { success: false, error: 'You do not have permission to view these applications. Check the Firestore applications rules or contact support.' };
    }

    console.error('❌ Error getting student applications:', error);
    return { success: false, error: error.message };
  }
};

export const subscribeToStudentApplications = (studentId, onData, onError) => {
  if (!studentId || typeof onData !== 'function') return () => {};
  const applicationsQuery = query(
    collection(db, COLLECTIONS.APPLICATIONS),
    where('studentId', '==', studentId)
  );

  return subscribeToQuery(applicationsQuery, (snapshot) => {
    const applications = snapshot.docs
      .map((applicationSnapshot) => {
        const data = applicationSnapshot.data();
        return {
          id: applicationSnapshot.id,
          ...data,
          appliedAt: safeDateConvert(data.appliedAt || data.appliedDate),
        };
      })
      .sort((left, right) => (right.appliedAt?.getTime() || 0) - (left.appliedAt?.getTime() || 0));
    onData(applications);
  }, onError, (snapshot) => snapshot);
};

export const withdrawStudentApplication = async (applicationId, studentId) => {
  if (!applicationId || !studentId) {
    return { success: false, error: 'Application and student are required.' };
  }

  try {
    const applicationRef = doc(db, COLLECTIONS.APPLICATIONS, applicationId);
    await runTransaction(db, async (transaction) => {
      const applicationSnapshot = await transaction.get(applicationRef);
      if (!applicationSnapshot.exists() || applicationSnapshot.data().studentId !== studentId) {
        throw new Error('Application not found.');
      }

      const status = String(applicationSnapshot.data().status || '').toLowerCase();
      if (!['pending', 'under_review'].includes(status)) {
        throw new Error('This application can no longer be withdrawn.');
      }

      transaction.update(applicationRef, {
        status: 'withdrawn',
        updatedAt: serverTimestamp(),
        withdrawnAt: serverTimestamp(),
      });
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getApplicationById = async (applicationId) => {
  try {
    if (!applicationId) {
      return { success: false, error: 'Application ID is required' };
    }

    const applicationRef = doc(db, COLLECTIONS.APPLICATIONS, applicationId);
    const applicationSnap = await getDoc(applicationRef);

    if (applicationSnap.exists()) {
      const data = applicationSnap.data();
      return {
        success: true,
        data: {
          id: applicationSnap.id,
          ...data,
          appliedAt: safeDateConvert(data.appliedAt),
        },
      };
    } else {
      return { success: false, error: 'Application not found' };
    }
  } catch (error) {
    console.error('❌ Error getting application by ID:', error);
    return { success: false, error: error.message };
  }
};

export const getStudentJobApplications = async (studentId) => {
  try {
    if (!studentId) return { success: false, error: 'Student ID is required' };

    const applicationsRef = collection(db, COLLECTIONS.APPLICATIONS);
    const q = query(
      applicationsRef,
      where('studentId', '==', studentId),
      where('type', '==', 'job'),
      orderBy('appliedAt', 'desc')
    );

    const snapshot = await getDocs(q);
    const applications = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      appliedAt: safeDateConvert(doc.data().appliedAt),
    }));

    return { success: true, data: applications };
  } catch (error) {
    console.error('❌ Error getting student job applications:', error);
    return { success: false, error: error.message };
  }
};

export const updateApplicationStatus = async (applicationId, status, notes = '') => {
  try {
    if (!applicationId) {
      return { success: false, error: 'Application ID is required' };
    }

    const applicationRef = doc(db, COLLECTIONS.APPLICATIONS, applicationId);
    await updateDoc(applicationRef, {
      status,
      notes,
      updatedAt: serverTimestamp(),
      reviewedAt: serverTimestamp(),
    });

    return { success: true };
  } catch (error) {
    console.error('❌ Error updating application status:', error);
    return { success: false, error: error.message };
  }
};

// ==================== NOTIFICATION OPERATIONS ====================

export const getStudentNotifications = async (studentId, limitCount = 10) => {
  try {
    if (!studentId) return { success: false, error: 'Student ID is required' };

    const notificationsRef = collection(db, COLLECTIONS.NOTIFICATIONS);
    const q = query(
      notificationsRef,
      where('userId', '==', studentId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    const snapshot = await getDocs(q);
    const notifications = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: safeDateConvert(doc.data().createdAt),
      read: doc.data().read || false,
    }));

    return { success: true, data: notifications };
  } catch (error) {
    console.error('❌ Error getting notifications:', error);
    return { success: false, data: [], error: error.message || 'Unable to load notifications.' };
  }
};

export const markNotificationAsRead = async (notificationId) => {
  try {
    const notificationRef = doc(db, COLLECTIONS.NOTIFICATIONS, notificationId);
    await updateDoc(notificationRef, {
      read: true,
      readAt: Timestamp.now(),
    });
    return { success: true };
  } catch (error) {
    console.error('❌ Error marking notification as read:', error);
    return { success: false, error: error.message };
  }
};

export const getUnreadNotificationsCount = async (studentId) => {
  try {
    const result = await getStudentNotifications(studentId, 100);
    if (result.success) {
      const unreadCount = result.data.filter((notification) => !notification.read).length;
      return { success: true, count: unreadCount };
    }
    return { success: false, count: 0, error: result.error };
  } catch (error) {
    console.error('❌ Error getting unread notifications count:', error);
    return { success: false, count: 0, error: error.message || 'Unable to load unread notifications.' };
  }
};

export const createNotification = async (notificationData) => {
  try {
    const notification = {
      ...notificationData,
      createdAt: serverTimestamp(),
      read: false,
    };

    await addDoc(collection(db, COLLECTIONS.NOTIFICATIONS), notification);
    return { success: true };
  } catch (error) {
    console.error('❌ Error creating notification:', error);
    return { success: false, error: error.message };
  }
};

// ==================== DASHBOARD OPERATIONS ====================

export const getDashboardStats = async (studentId) => {
  try {
    if (!studentId) return { success: false, error: 'Student ID is required' };

    const [applicationsRes, notificationsRes, profileRes, jobMatchesRes] = await Promise.all([
      getStudentApplications(studentId),
      getStudentNotifications(studentId),
      getStudentProfile(studentId),
      getRecommendedJobs(studentId),
    ]);

    const pendingApplications = applicationsRes.success
      ? applicationsRes.data.filter(
          (app) => app.status === 'pending' || app.status === 'under_review'
        ).length
      : 0;

    const acceptedApplications = applicationsRes.success
      ? applicationsRes.data.filter(
          (app) => app.status === 'accepted' || app.status === 'approved' || app.status === 'hired'
        ).length
      : 0;

    const jobMatches = jobMatchesRes.success ? jobMatchesRes.data.length : 0;
    const unreadNotifications = notificationsRes.success
      ? notificationsRes.data.filter((notif) => !notif.read).length
      : 0;

    const profileCompletion = profileRes.success ? profileRes.data.profileCompletion || 0 : 0;

    return {
      success: true,
      data: {
        pendingApplications,
        acceptedApplications,
        jobMatches,
        unreadNotifications,
        profileCompletion,
      },
    };
  } catch (error) {
    console.error('❌ Error getting dashboard stats:', error);
    return { success: false, error: error.message };
  }
};

// ==================== EXPORT DEFAULT ====================

export default {
  // Profile Operations
  initializeStudentProfile,
  getStudentProfile,
  updateStudentProfile,
  updateStudentQualifications,
  updateJobPreferences,

  // Document Operations
  uploadResume,
  getStudentDocuments,
  uploadDocument,
  deleteDocument,

  // Job Operations
  getJobs,
  getRecommendedJobs,
  applyForJob,
  checkExistingApplication,

  // Application Operations
  getStudentApplications,
  getStudentJobApplications,
  getApplicationById,
  updateApplicationStatus,

  // Notification Operations
  getStudentNotifications,
  markNotificationAsRead,
  getUnreadNotificationsCount,
  createNotification,

  // Dashboard Operations
  getDashboardStats,
};
