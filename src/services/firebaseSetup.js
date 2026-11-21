import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  where,
} from 'firebase/firestore';

import { auth, db } from '../config/firebase';

class FirebaseSetupService {
  static async initializeCollections() {
    try {
      console.log('🔄 Initializing Firebase collections...');

      // Define required collections and their default structure
      const collections = {
        platformStats: {
          defaultDoc: {
            totalStudents: 12500,
            totalInstitutions: 68,
            totalCompanies: 240,
            totalJobs: 850,
            totalMentors: 120,
            totalCourses: 450,
            lastUpdated: new Date(),
          },
          fields: {
            totalStudents: 'number',
            totalInstitutions: 'number',
            totalCompanies: 'number',
            totalJobs: 'number',
            totalMentors: 'number',
            totalCourses: 'number',
            lastUpdated: 'timestamp',
          },
        },
      };

      // Initialize each collection
      for (const [collectionName, config] of Object.entries(collections)) {
        await this.initializeCollection(collectionName, config.defaultDoc);
      }

      console.log('✅ Firebase collections initialized successfully');
      return true;
    } catch (error) {
      console.error('❌ Error initializing Firebase collections:', error);
      return false;
    }
  }

  static async initializeCollection(collectionName, defaultDoc) {
    try {
      const collectionRef = collection(db, collectionName);

      // Check if collection has any documents
      const statsDocRef = doc(collectionRef, 'stats');
      const statsDoc = await getDoc(statsDocRef);

      if (!statsDoc.exists()) {
        console.log(`📝 Creating initial document for ${collectionName}...`);
        await setDoc(statsDocRef, defaultDoc);
      }

      return true;
    } catch (error) {
      console.error(`Error initializing ${collectionName}:`, error);
      return false;
    }
  }

  static async addTestimonial(testimonialData) {
    try {
      const user = auth.currentUser;
      const userType = String(testimonialData.userType || '').toLowerCase();
      if (!user || !['student', 'company', 'mentor'].includes(userType)) {
        throw new Error('Only signed-in students, companies, and mentors can submit testimonials.');
      }

      const newTestimonialRef = doc(db, 'testimonials', user.uid);

      const testimonial = {
        ...testimonialData,
        userId: user.uid,
        userType,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        approved: false,
        status: 'pending',
      };

      await setDoc(newTestimonialRef, testimonial);
      console.log('✅ Testimonial added successfully:', testimonial.id);
      return { success: true, id: newTestimonialRef.id };
    } catch (error) {
      console.error('❌ Error adding testimonial:', error);
      return { success: false, error: error.message };
    }
  }

  static async getTestimonials() {
    try {
      const testimonialsQuery = query(
        collection(db, 'testimonials'),
        where('approved', '==', true),
        orderBy('createdAt', 'desc'),
        limit(6)
      );
      const snapshot = await getDocs(testimonialsQuery);
      return snapshot.docs.map((record) => ({ id: record.id, ...record.data() }));
    } catch (error) {
      console.error('❌ Error getting testimonials:', error);
      throw error;
    }
  }

  static async updatePlatformStats(statsData) {
    try {
      const statsRef = doc(db, 'platformStats', 'stats');
      await setDoc(
        statsRef,
        {
          ...statsData,
          lastUpdated: new Date(),
        },
        { merge: true }
      );

      console.log('✅ Platform stats updated successfully');
      return true;
    } catch (error) {
      console.error('❌ Error updating platform stats:', error);
      return false;
    }
  }
}

export default FirebaseSetupService;
