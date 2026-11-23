// src/firebase/imports.js
// Helper to ensure consistent Firebase imports

// Firestore imports
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
  endBefore,
  onSnapshot,
  writeBatch,
  arrayUnion,
  arrayRemove,
  increment,
  Timestamp,
  // Note: aggregate, avg, sum are not available in all Firebase versions
  // Use getCountFromServer() for counts instead
  getCountFromServer,
} from 'firebase/firestore';

// Auth imports
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
} from 'firebase/auth';

// Export everything
export {
  // Firestore
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
  endBefore,
  onSnapshot,
  writeBatch,
  arrayUnion,
  arrayRemove,
  increment,
  Timestamp,
  getCountFromServer,

  // Auth
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
};
