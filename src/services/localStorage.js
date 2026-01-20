import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Local Storage Service
 * Mimics Firebase operations using AsyncStorage for local development
 */

const STORAGE_KEYS = {
  LOANS: '@loanledger_loans',
  USERS: '@loanledger_users',
  CURRENT_USER: '@loanledger_current_user',
};

// Helper to generate unique IDs
const generateId = () => `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// ==================== AUTH OPERATIONS ====================

export const localAuth = {
  /**
   * Sign in with email and password
   */
  signIn: async (email, password) => {
    try {
      const usersJson = await AsyncStorage.getItem(STORAGE_KEYS.USERS);
      const users = usersJson ? JSON.parse(usersJson) : {};

      const user = Object.values(users).find(
        (u) => u.email === email.toLowerCase() && u.password === password
      );

      if (!user) {
        throw new Error('Invalid email or password');
      }

      // Store current user
      await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));

      return {
        uid: user.uid,
        email: user.email,
        displayName: user.name,
      };
    } catch (error) {
      throw error;
    }
  },

  /**
   * Create new user account
   */
  signUp: async (email, password, name) => {
    try {
      const usersJson = await AsyncStorage.getItem(STORAGE_KEYS.USERS);
      const users = usersJson ? JSON.parse(usersJson) : {};

      // Check if user already exists
      const existingUser = Object.values(users).find(
        (u) => u.email === email.toLowerCase()
      );

      if (existingUser) {
        throw new Error('Email already in use');
      }

      // Create new user
      const uid = `user_${generateId()}`;
      const newUser = {
        uid,
        email: email.toLowerCase(),
        password, // In production, this should be hashed
        name,
        createdAt: new Date().toISOString(),
      };

      users[uid] = newUser;
      await AsyncStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));

      // Store current user
      await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(newUser));

      return {
        uid: newUser.uid,
        email: newUser.email,
        displayName: newUser.name,
      };
    } catch (error) {
      throw error;
    }
  },

  /**
   * Sign out
   */
  signOut: async () => {
    await AsyncStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  },

  /**
   * Get current user
   */
  getCurrentUser: async () => {
    try {
      const userJson = await AsyncStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      if (!userJson) return null;

      const user = JSON.parse(userJson);
      return {
        uid: user.uid,
        email: user.email,
        displayName: user.name,
      };
    } catch (error) {
      return null;
    }
  },

  /**
   * Password reset (mock)
   */
  resetPassword: async (email) => {
    // Mock implementation - just verify user exists
    const usersJson = await AsyncStorage.getItem(STORAGE_KEYS.USERS);
    const users = usersJson ? JSON.parse(usersJson) : {};

    const user = Object.values(users).find(
      (u) => u.email === email.toLowerCase()
    );

    if (!user) {
      throw new Error('No user found with this email');
    }

    // In a real app, this would send an email
    console.log('Password reset link sent to:', email);
    return true;
  },
};

// ==================== USER PROFILE OPERATIONS ====================

export const localUserProfile = {
  /**
   * Get user profile
   */
  getProfile: async (userId) => {
    try {
      const usersJson = await AsyncStorage.getItem(STORAGE_KEYS.USERS);
      const users = usersJson ? JSON.parse(usersJson) : {};

      const user = users[userId];
      if (!user) return null;

      return {
        id: user.uid,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      };
    } catch (error) {
      console.error('Error getting profile:', error);
      return null;
    }
  },

  /**
   * Update user profile
   */
  updateProfile: async (userId, updates) => {
    try {
      const usersJson = await AsyncStorage.getItem(STORAGE_KEYS.USERS);
      const users = usersJson ? JSON.parse(usersJson) : {};

      if (!users[userId]) {
        throw new Error('User not found');
      }

      users[userId] = {
        ...users[userId],
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      await AsyncStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));

      // Update current user if it's the same
      const currentUserJson = await AsyncStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      if (currentUserJson) {
        const currentUser = JSON.parse(currentUserJson);
        if (currentUser.uid === userId) {
          await AsyncStorage.setItem(
            STORAGE_KEYS.CURRENT_USER,
            JSON.stringify(users[userId])
          );
        }
      }

      return true;
    } catch (error) {
      console.error('Error updating profile:', error);
      return false;
    }
  },
};

// ==================== LOAN OPERATIONS ====================

export const localLoans = {
  /**
   * Get all loans
   */
  getAll: async () => {
    try {
      const loansJson = await AsyncStorage.getItem(STORAGE_KEYS.LOANS);
      const loans = loansJson ? JSON.parse(loansJson) : {};
      return Object.values(loans);
    } catch (error) {
      console.error('Error getting loans:', error);
      return [];
    }
  },

  /**
   * Get loan by ID
   */
  getById: async (loanId) => {
    try {
      const loansJson = await AsyncStorage.getItem(STORAGE_KEYS.LOANS);
      const loans = loansJson ? JSON.parse(loansJson) : {};
      return loans[loanId] || null;
    } catch (error) {
      console.error('Error getting loan:', error);
      return null;
    }
  },

  /**
   * Create new loan
   */
  create: async (loanData) => {
    try {
      const loansJson = await AsyncStorage.getItem(STORAGE_KEYS.LOANS);
      const loans = loansJson ? JSON.parse(loansJson) : {};

      const loanId = `loan_${generateId()}`;
      const newLoan = {
        id: loanId,
        ...loanData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'active',
      };

      loans[loanId] = newLoan;
      await AsyncStorage.setItem(STORAGE_KEYS.LOANS, JSON.stringify(loans));

      return newLoan;
    } catch (error) {
      console.error('Error creating loan:', error);
      return null;
    }
  },

  /**
   * Update loan
   */
  update: async (loanId, updates) => {
    try {
      const loansJson = await AsyncStorage.getItem(STORAGE_KEYS.LOANS);
      const loans = loansJson ? JSON.parse(loansJson) : {};

      if (!loans[loanId]) {
        throw new Error('Loan not found');
      }

      loans[loanId] = {
        ...loans[loanId],
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      await AsyncStorage.setItem(STORAGE_KEYS.LOANS, JSON.stringify(loans));
      return true;
    } catch (error) {
      console.error('Error updating loan:', error);
      return false;
    }
  },

  /**
   * Delete loan
   */
  delete: async (loanId) => {
    try {
      const loansJson = await AsyncStorage.getItem(STORAGE_KEYS.LOANS);
      const loans = loansJson ? JSON.parse(loansJson) : {};

      delete loans[loanId];
      await AsyncStorage.setItem(STORAGE_KEYS.LOANS, JSON.stringify(loans));
      return true;
    } catch (error) {
      console.error('Error deleting loan:', error);
      return false;
    }
  },

  /**
   * Clear all data (for testing)
   */
  clearAll: async () => {
    await AsyncStorage.removeItem(STORAGE_KEYS.LOANS);
    await AsyncStorage.removeItem(STORAGE_KEYS.USERS);
    await AsyncStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  },
};

export default {
  auth: localAuth,
  userProfile: localUserProfile,
  loans: localLoans,
};
