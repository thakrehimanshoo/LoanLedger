import { useState, useEffect } from 'react';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  onSnapshot,
  serverTimestamp,
  where,
} from 'firebase/firestore';
import { db, FIRESTORE_PATHS } from '../config/firebase';

/**
 * Custom hook for Firebase Firestore operations
 * Following the "No Complex Queries" rule - fetch data and filter in memory
 */
const useFirebase = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ==================== USER PROFILE OPERATIONS ====================

  /**
   * Fetch user profile from Firestore
   * Path: /artifacts/loanledger/users/{userId}/profile
   */
  const getUserProfile = async (userId) => {
    try {
      setLoading(true);
      setError(null);

      const profilePath = `artifacts/loanledger/users/${userId}/profile`;
      const profileRef = doc(db, profilePath);
      const profileSnap = await getDoc(profileRef);

      if (profileSnap.exists()) {
        return { id: profileSnap.id, ...profileSnap.data() };
      } else {
        return null;
      }
    } catch (err) {
      console.error('Error fetching user profile:', err);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Create or update user profile
   */
  const saveUserProfile = async (userId, profileData) => {
    try {
      setLoading(true);
      setError(null);

      const profilePath = `artifacts/loanledger/users/${userId}/profile`;
      const profileRef = doc(db, profilePath);

      await setDoc(profileRef, {
        ...profileData,
        updatedAt: serverTimestamp(),
      }, { merge: true });

      return true;
    } catch (err) {
      console.error('Error saving user profile:', err);
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // ==================== LOAN OPERATIONS ====================

  /**
   * Fetch all loans from Firestore
   * Path: /artifacts/loanledger/public/data/loans
   * Returns all loans - filtering happens in memory
   */
  const getAllLoans = async () => {
    try {
      setLoading(true);
      setError(null);

      const loansRef = collection(db, 'artifacts/loanledger/public/data/loans');
      const loansSnap = await getDocs(loansRef);

      const loans = [];
      loansSnap.forEach((doc) => {
        loans.push({ id: doc.id, ...doc.data() });
      });

      return loans;
    } catch (err) {
      console.error('Error fetching loans:', err);
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  /**
   * Get loans for a specific user (as lender)
   * Fetches all loans and filters in memory
   */
  const getUserLoansAsLender = async (userId) => {
    try {
      const allLoans = await getAllLoans();
      // Filter in memory for loans where user is the lender
      return allLoans.filter(loan => loan.lenderId === userId);
    } catch (err) {
      console.error('Error fetching user loans as lender:', err);
      return [];
    }
  };

  /**
   * Get loans for a specific user (as borrower)
   * Fetches all loans and filters in memory
   */
  const getUserLoansAsBorrower = async (userId) => {
    try {
      const allLoans = await getAllLoans();
      // Filter in memory for loans where user is the borrower
      return allLoans.filter(loan => loan.borrowerId === userId);
    } catch (err) {
      console.error('Error fetching user loans as borrower:', err);
      return [];
    }
  };

  /**
   * Get active loans (loans with status 'active')
   * Fetches all loans and filters in memory
   */
  const getActiveLoans = async (userId) => {
    try {
      const userLoans = await getUserLoansAsLender(userId);
      // Filter in memory for active loans
      return userLoans.filter(loan => loan.status === 'active');
    } catch (err) {
      console.error('Error fetching active loans:', err);
      return [];
    }
  };

  /**
   * Get a single loan by ID
   */
  const getLoanById = async (loanId) => {
    try {
      setLoading(true);
      setError(null);

      const loanRef = doc(db, 'artifacts/loanledger/public/data/loans', loanId);
      const loanSnap = await getDoc(loanRef);

      if (loanSnap.exists()) {
        return { id: loanSnap.id, ...loanSnap.data() };
      } else {
        return null;
      }
    } catch (err) {
      console.error('Error fetching loan:', err);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Create a new loan
   */
  const createLoan = async (loanData) => {
    try {
      setLoading(true);
      setError(null);

      // Generate a unique ID for the loan
      const loanId = `loan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const loanRef = doc(db, 'artifacts/loanledger/public/data/loans', loanId);

      const newLoan = {
        ...loanData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        status: 'active',
      };

      await setDoc(loanRef, newLoan);

      return { id: loanId, ...newLoan };
    } catch (err) {
      console.error('Error creating loan:', err);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Update loan (e.g., mark EMI as paid, update status)
   */
  const updateLoan = async (loanId, updates) => {
    try {
      setLoading(true);
      setError(null);

      const loanRef = doc(db, 'artifacts/loanledger/public/data/loans', loanId);

      await updateDoc(loanRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });

      return true;
    } catch (err) {
      console.error('Error updating loan:', err);
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Mark an EMI as paid
   */
  const markEMIAsPaid = async (loanId, emiIndex) => {
    try {
      setLoading(true);
      setError(null);

      // Fetch the current loan
      const loan = await getLoanById(loanId);
      if (!loan) {
        throw new Error('Loan not found');
      }

      // Update the EMI status
      const updatedEMIs = [...loan.emis];
      updatedEMIs[emiIndex] = {
        ...updatedEMIs[emiIndex],
        paid: true,
        paidDate: new Date().toISOString(),
      };

      // Calculate if loan is fully paid
      const allPaid = updatedEMIs.every(emi => emi.paid);
      const newStatus = allPaid ? 'completed' : 'active';

      // Update the loan
      await updateLoan(loanId, {
        emis: updatedEMIs,
        status: newStatus,
      });

      return true;
    } catch (err) {
      console.error('Error marking EMI as paid:', err);
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // ==================== REAL-TIME LISTENERS ====================

  /**
   * Listen to loan updates in real-time
   */
  const subscribeLoanUpdates = (loanId, callback) => {
    const loanRef = doc(db, 'artifacts/loanledger/public/data/loans', loanId);

    const unsubscribe = onSnapshot(
      loanRef,
      (doc) => {
        if (doc.exists()) {
          callback({ id: doc.id, ...doc.data() });
        }
      },
      (error) => {
        console.error('Error listening to loan updates:', error);
        setError(error.message);
      }
    );

    return unsubscribe;
  };

  /**
   * Listen to all loans updates in real-time
   */
  const subscribeAllLoans = (callback) => {
    const loansRef = collection(db, 'artifacts/loanledger/public/data/loans');

    const unsubscribe = onSnapshot(
      loansRef,
      (snapshot) => {
        const loans = [];
        snapshot.forEach((doc) => {
          loans.push({ id: doc.id, ...doc.data() });
        });
        callback(loans);
      },
      (error) => {
        console.error('Error listening to loans updates:', error);
        setError(error.message);
      }
    );

    return unsubscribe;
  };

  // ==================== ANALYTICS / METRICS ====================

  /**
   * Calculate user metrics (total lended, interest earned, avg return)
   * Fetches loans and calculates in memory
   */
  const getUserMetrics = async (userId) => {
    try {
      const userLoans = await getUserLoansAsLender(userId);

      let totalLended = 0;
      let totalInterestEarned = 0;
      let totalExpectedInterest = 0;

      userLoans.forEach(loan => {
        totalLended += loan.amount || 0;

        // Calculate interest from EMIs
        if (loan.emis && Array.isArray(loan.emis)) {
          loan.emis.forEach(emi => {
            totalExpectedInterest += emi.interest || 0;
            if (emi.paid) {
              totalInterestEarned += emi.interest || 0;
            }
          });
        }
      });

      const avgReturn = totalLended > 0
        ? ((totalExpectedInterest / totalLended) * 100).toFixed(2)
        : 0;

      return {
        totalLended,
        totalInterestEarned,
        totalExpectedInterest,
        avgReturn,
        totalLoans: userLoans.length,
        activeLoans: userLoans.filter(l => l.status === 'active').length,
      };
    } catch (err) {
      console.error('Error calculating user metrics:', err);
      return {
        totalLended: 0,
        totalInterestEarned: 0,
        totalExpectedInterest: 0,
        avgReturn: 0,
        totalLoans: 0,
        activeLoans: 0,
      };
    }
  };

  return {
    loading,
    error,
    // User operations
    getUserProfile,
    saveUserProfile,
    // Loan operations
    getAllLoans,
    getUserLoansAsLender,
    getUserLoansAsBorrower,
    getActiveLoans,
    getLoanById,
    createLoan,
    updateLoan,
    markEMIAsPaid,
    // Real-time listeners
    subscribeLoanUpdates,
    subscribeAllLoans,
    // Analytics
    getUserMetrics,
  };
};

export default useFirebase;
