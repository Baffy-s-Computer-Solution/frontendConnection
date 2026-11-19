import { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { useAuth } from './AuthContext';
import { db } from '../config/firebase';

const CompanyContext = createContext();

export const useCompany = () => {
  const context = useContext(CompanyContext);
  if (!context) {
    throw new Error('useCompany must be used within a CompanyProvider');
  }
  return context;
};

export const CompanyProvider = ({ children }) => {
  const { currentUser, userData } = useAuth();
  const [companyData, setCompanyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Helper to determine if user is a company
  const isUserCompany = useCallback(() => {
    if (!userData) return false;

    const userType = userData.userType || userData.role || userData.type;
    return userType === 'company' || userType === 'Company';
  }, [userData]);

  // Fetch company data
  const fetchCompanyData = useCallback(async () => {
    if (!currentUser || !isUserCompany()) {
      setCompanyData(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const companySnapshot = await getDoc(doc(db, 'companies', currentUser.uid));
      const companyProfile = {
        id: currentUser.uid,
        email: currentUser.email || '',
        companyName:
          companySnapshot.data()?.companyName ||
          companySnapshot.data()?.name ||
          currentUser.displayName ||
          currentUser.email?.split('@')[0] ||
          'Company',
        userType: 'company',
        profileCompletion: companySnapshot.data()?.profileCompletion || 30,
        ...companySnapshot.data(),
      };

      setCompanyData(companyProfile);
    } catch (err) {
      console.error('Error fetching company data:', err);
      setError(err.message);
      setCompanyData(null);
    } finally {
      setLoading(false);
    }
  }, [currentUser, isUserCompany]);

  // Update company data
  const updateCompany = async (updates) => {
    if (!companyData?.id) {
      throw new Error('No company data available');
    }

    try {
      await setDoc(
        doc(db, 'companies', companyData.id),
        { ...updates, updatedAt: serverTimestamp(), uid: companyData.id },
        { merge: true }
      );
      setCompanyData((prev) => ({
        ...prev,
        ...updates,
        updatedAt: new Date().toISOString(),
      }));
      return true;
    } catch (err) {
      console.error('Error updating company:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchCompanyData();
  }, [fetchCompanyData]);

  // Value to provide
  const value = {
    companyData,
    loading,
    error,
    updateCompany,
    refreshData: fetchCompanyData,
    clearError: () => setError(null),
  };

  return <CompanyContext.Provider value={value}>{children}</CompanyContext.Provider>;
};
