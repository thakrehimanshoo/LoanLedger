import { useState } from 'react';
import { localLoans, localUserProfile } from '../services/localStorage';

/**
 * Custom hook for Local Storage operations
 * Mimics the useFirebase hook interface but uses AsyncStorage
 * Following the "No Complex Queries" rule - fetch data and filter in memory
 */
const useLocalStorage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ==================== USER PROFILE OPERATIONS ====================

  /**
   * Fetch user profile from local storage
   */
  const getUserProfile = async (userId) => {
    try {
      setLoading(true);
      setError(null);

      const profile = await localUserProfile.getProfile(userId);
      return profile;
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

      const success = await localUserProfile.updateProfile(userId, profileData);
      return success;
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
   * Fetch all loans from local storage
   * Returns all loans - filtering happens in memory
   */
  const getAllLoans = async () => {
    try {
      setLoading(true);
      setError(null);

      const loans = await localLoans.getAll();
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
      return allLoans.filter((loan) => loan.lenderId === userId);
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
      return allLoans.filter((loan) => loan.borrowerId === userId);
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
      return userLoans.filter((loan) => loan.status === 'active');
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

      const loan = await localLoans.getById(loanId);
      return loan;
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

      const newLoan = await localLoans.create(loanData);
      return newLoan;
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

      const success = await localLoans.update(loanId, updates);
      return success;
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
      const allPaid = updatedEMIs.every((emi) => emi.paid);
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
   * Note: Local storage doesn't support real-time updates,
   * so this is a mock implementation that calls the callback once
   */
  const subscribeLoanUpdates = async (loanId, callback) => {
    const loan = await getLoanById(loanId);
    if (loan) {
      callback(loan);
    }

    // Return a no-op unsubscribe function
    return () => {};
  };

  /**
   * Listen to all loans updates in real-time
   * Note: Local storage doesn't support real-time updates,
   * so this is a mock implementation that calls the callback once
   */
  const subscribeAllLoans = async (callback) => {
    const loans = await getAllLoans();
    callback(loans);

    // Return a no-op unsubscribe function
    return () => {};
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

      userLoans.forEach((loan) => {
        totalLended += loan.amount || 0;

        // Calculate interest from EMIs
        if (loan.emis && Array.isArray(loan.emis)) {
          loan.emis.forEach((emi) => {
            totalExpectedInterest += emi.interest || 0;
            if (emi.paid) {
              totalInterestEarned += emi.interest || 0;
            }
          });
        }
      });

      const avgReturn =
        totalLended > 0
          ? ((totalExpectedInterest / totalLended) * 100).toFixed(2)
          : 0;

      return {
        totalLended,
        totalInterestEarned,
        totalExpectedInterest,
        avgReturn,
        totalLoans: userLoans.length,
        activeLoans: userLoans.filter((l) => l.status === 'active').length,
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

export default useLocalStorage;
