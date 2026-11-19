import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';

import { auth, db } from '../config/firebase';

const REQUESTS = 'mentorship_requests';
const MENTORSHIPS = 'mentorships';
const withReadContext = (source, error) => {
  const contextualError = new Error(`${source}: ${error?.message || 'Unable to read mentorship data.'}`);
  contextualError.code = error?.code;
  contextualError.cause = error;
  return contextualError;
};

export const getAvailableMentors = async (search = '') => {
  try {
    const snapshot = await getDocs(query(collection(db, 'mentors'), where('status', '==', 'approved'), limit(200)));
    const needle = search.trim().toLowerCase();
    const mentors = snapshot.docs.map((item) => {
      const data = item.data();
      return {
        id: item.id,
        ...data,
        name: data.name || data.displayName || data.fullName || 'Career mentor',
        title: data.title || data.headline || data.position || data.role || 'Mentor',
        company: data.company || data.currentEmployer || '',
        bio: data.bio || data.about || '',
        expertise: Array.isArray(data.expertise) ? data.expertise : Array.isArray(data.skills) ? data.skills : [],
        photoURL: data.photoURL || data.profilePhoto || '',
      };
    }).filter((mentor) => mentor.isAvailable !== false && (!needle || [mentor.name, mentor.title, mentor.company, mentor.bio, mentor.expertise.join(' ')].join(' ').toLowerCase().includes(needle)));
    return { success: true, data: mentors };
  } catch (error) {
    return { success: false, data: [], error: error.message || 'Mentors are unavailable right now.' };
  }
};

export const subscribeToAvailableMentors = (search = '', onData, onError) => {
  const needle = search.trim().toLowerCase();
  return onSnapshot(
    query(collection(db, 'mentors'), where('status', '==', 'approved'), limit(200)),
    (snapshot) => {
      const mentors = snapshot.docs.map((item) => {
        const data = item.data();
        return {
          id: item.id,
          ...data,
          name: data.name || data.displayName || data.fullName || 'Career mentor',
          title: data.title || data.headline || data.position || data.role || 'Mentor',
          company: data.company || data.currentEmployer || '',
          bio: data.bio || data.about || '',
          expertise: Array.isArray(data.expertise) ? data.expertise : Array.isArray(data.skills) ? data.skills : [],
          photoURL: data.photoURL || data.profilePhoto || '',
        };
      }).filter((mentor) => mentor.isAvailable !== false && (!needle || [mentor.name, mentor.title, mentor.company, mentor.bio, mentor.expertise.join(' ')].join(' ').toLowerCase().includes(needle)));
      onData(mentors);
    },
    (error) => onError(withReadContext('mentors (approved mentor directory)', error))
  );
};

export const subscribeToStudentMentorshipData = (studentId, onData, onError) => {
  if (!studentId) {
    onData({ requests: [], sessions: [] });
    return () => {};
  }
  const requests = new Map();
  const mentorships = new Map();
  const directSessions = new Map();
  const emit = () => {
    const orderNewest = (a, b) => (b.createdAt?.toMillis?.() || new Date(b.createdAt || 0).getTime() || 0) - (a.createdAt?.toMillis?.() || new Date(a.createdAt || 0).getTime() || 0);
    const combinedSessions = [...new Map([...mentorships.values(), ...directSessions.values()].map((item) => [item.id, item])).values()];
    onData({ requests: [...requests.values()].sort(orderNewest), sessions: combinedSessions.sort(orderNewest) });
  };
  const reportReadError = (source) => (error) => onError(withReadContext(source, error));
  const stops = [
    onSnapshot(query(collection(db, REQUESTS), where('studentId', '==', studentId), limit(100)), (snapshot) => { requests.clear(); snapshot.docs.forEach((item) => requests.set(item.id, { id: item.id, ...item.data() })); emit(); }, reportReadError(REQUESTS)),
    onSnapshot(query(collection(db, MENTORSHIPS), where('menteeId', '==', studentId), limit(100)), (snapshot) => { mentorships.clear(); snapshot.docs.forEach((item) => mentorships.set(item.id, { id: item.id, ...item.data() })); emit(); }, reportReadError(MENTORSHIPS)),
    onSnapshot(query(collection(db, 'mentorSessions'), where('menteeId', '==', studentId), limit(100)), (snapshot) => { directSessions.clear(); snapshot.docs.forEach((item) => directSessions.set(item.id, { id: item.id, ...item.data() })); emit(); }, reportReadError('mentorSessions')),
  ];
  return () => stops.forEach((stop) => stop());
};

export const subscribeToRegisteredStudents = (onData, onError) => onSnapshot(
  query(collection(db, 'students'), limit(200)),
  (snapshot) => onData(snapshot.docs
    .map((item) => ({ id: item.id, ...item.data() }))
    .filter((student) => !student.userType || String(student.userType).toLowerCase() === 'student')),
  onError
);

export const createMentorMentorshipRequest = async ({ mentorId, student, topic, message }) => {
  if (!mentorId || auth.currentUser?.uid !== mentorId) return { success: false, error: 'Please sign in again as a mentor.' };
  if (!student?.id || !String(message || '').trim()) return { success: false, error: 'Choose a student and include a short message.' };
  try {
    const existing = await getDocs(query(collection(db, REQUESTS), where('mentorId', '==', mentorId), limit(200)));
    if (existing.docs.some((item) => item.data().studentId === student.id && item.data().initiatedBy === 'mentor' && item.data().status === 'pending')) {
      return { success: false, error: 'You already have a pending request for this student.' };
    }
    const user = auth.currentUser;
    const request = {
      studentId: student.id,
      studentName: student.fullName || student.displayName || student.name || 'Student',
      studentEmail: student.email || '',
      mentorId,
      mentorName: user.displayName || user.email?.split('@')[0] || 'Mentor',
      mentorPhoto: user.photoURL || '',
      topic: String(topic || '').trim().slice(0, 120),
      message: String(message).trim().slice(0, 1000),
      initiatedBy: 'mentor',
      status: 'pending',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    const reference = await addDoc(collection(db, REQUESTS), request);
    return { success: true, data: { id: reference.id, ...request } };
  } catch (error) {
    return { success: false, error: error.message || 'Unable to send this mentorship invitation.' };
  }
};

export const respondToMentorRequest = async (requestId, studentId, status) => {
  if (!requestId || !studentId || auth.currentUser?.uid !== studentId || !['accepted', 'rejected'].includes(status)) {
    return { success: false, error: 'Invalid mentorship response.' };
  }
  try {
    const requestRef = doc(db, REQUESTS, requestId);
    const requestSnapshot = await getDoc(requestRef);
    const request = requestSnapshot.data();
    if (!requestSnapshot.exists() || request.studentId !== studentId || request.initiatedBy !== 'mentor' || request.status !== 'pending') {
      return { success: false, error: 'This mentorship invitation is no longer available.' };
    }
    const batch = writeBatch(db);
    batch.update(requestRef, { status, reviewedAt: serverTimestamp(), updatedAt: serverTimestamp() });
    if (status === 'accepted') {
      batch.set(doc(db, MENTORSHIPS, requestId), {
        mentorId: request.mentorId,
        menteeId: studentId,
        requestId,
        topic: request.topic || '',
        status: 'active',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
    await batch.commit();
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message || 'Could not save your response.' };
  }
};

export const getStudentMentorshipData = async (studentId) => {
  if (!studentId) return { success: false, error: 'Sign in to view mentorship activity.' };
  try {
    const results = await Promise.allSettled([
      getDocs(query(collection(db, REQUESTS), where('studentId', '==', studentId), limit(100))),
      getDocs(query(collection(db, MENTORSHIPS), where('menteeId', '==', studentId), limit(100))),
      getDocs(query(collection(db, 'mentorSessions'), where('menteeId', '==', studentId), limit(100))),
    ]);
    const [requestResult, mentorshipResult, sessionResult] = results;
    if (results.every((result) => result.status === 'rejected')) {
      throw requestResult.reason || mentorshipResult.reason || sessionResult.reason;
    }
    const requests = requestResult.status === 'fulfilled' ? requestResult.value.docs.map((item) => ({ id: item.id, ...item.data() })) : [];
    const mentorships = mentorshipResult.status === 'fulfilled' ? mentorshipResult.value.docs.map((item) => ({ id: item.id, ...item.data() })) : [];
    const directSessions = sessionResult.status === 'fulfilled' ? sessionResult.value.docs.map((item) => ({ id: item.id, ...item.data() })) : [];
    const sessions = [...new Map([...mentorships, ...directSessions].map((item) => [item.id, item])).values()];
    const orderNewest = (a, b) => (b.createdAt?.toMillis?.() || new Date(b.createdAt || 0).getTime() || 0) - (a.createdAt?.toMillis?.() || new Date(a.createdAt || 0).getTime() || 0);
    const hasPartialData = results.some((result) => result.status === 'rejected');
    return { success: true, requests: requests.sort(orderNewest), sessions: sessions.sort(orderNewest), warning: hasPartialData ? 'Some mentorship activity is unavailable under the current Firebase rules.' : '' };
  } catch (error) {
    return { success: false, error: error.message || 'Mentorship activity could not be loaded.' };
  }
};

export const createStudentMentorshipRequest = async ({ studentId, mentor, topic, message }) => {
  if (!studentId || auth.currentUser?.uid !== studentId) return { success: false, error: 'Please sign in again to request mentorship.' };
  if (!mentor?.id || !String(message || '').trim()) return { success: false, error: 'Choose a mentor and include a short message.' };
  let operation = `mentors/${mentor.id} lookup`;
  try {
    const mentorSnapshot = await getDoc(doc(db, 'mentors', mentor.id));
    if (!mentorSnapshot.exists() || mentorSnapshot.data().status !== 'approved' || mentorSnapshot.data().isAvailable === false) {
      return { success: false, error: 'This mentor is no longer available.' };
    }
    operation = `${REQUESTS} student requests lookup`;
    const existing = await getDocs(query(collection(db, REQUESTS), where('studentId', '==', studentId), limit(200)));
    if (existing.docs.some((item) => item.data().mentorId === mentor.id && item.data().status === 'pending')) {
      return { success: false, error: 'You already have a pending request for this mentor.' };
    }
    const currentUser = auth.currentUser;
    const request = {
      studentId,
      studentName: currentUser.displayName || currentUser.email?.split('@')[0] || 'Student',
      studentEmail: currentUser.email || '',
      mentorId: mentor.id,
      mentorName: mentor.name,
      mentorPhoto: mentor.photoURL || '',
      topic: String(topic || '').trim().slice(0, 120),
      message: String(message).trim().slice(0, 1000),
      status: 'pending',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    operation = `${REQUESTS} create`;
    const reference = await addDoc(collection(db, REQUESTS), request);
    return { success: true, data: { id: reference.id, ...request } };
  } catch (error) {
    return { success: false, error: `${operation}: ${error.message || 'Your request could not be sent.'}` };
  }
};

export const cancelStudentMentorshipRequest = async (requestId, studentId) => {
  if (!requestId || !studentId || auth.currentUser?.uid !== studentId) return { success: false, error: 'Please sign in again.' };
  try {
    const reference = doc(db, REQUESTS, requestId);
    const snapshot = await getDoc(reference);
    if (!snapshot.exists() || snapshot.data().studentId !== studentId) return { success: false, error: 'Request not found.' };
    if (snapshot.data().status !== 'pending') return { success: false, error: 'Only pending requests can be cancelled.' };
    await updateDoc(reference, { status: 'cancelled', updatedAt: serverTimestamp() });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message || 'The request could not be cancelled.' };
  }
};
