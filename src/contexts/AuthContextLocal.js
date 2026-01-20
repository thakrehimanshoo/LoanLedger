import React, { createContext, useState, useContext, useEffect } from 'react';
import { localAuth } from '../services/localStorage';
import useLocalStorage from '../hooks/useLocalStorage';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const { getUserProfile } = useLocalStorage();

  useEffect(() => {
    // Check if user is already logged in
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      const currentUser = await localAuth.getCurrentUser();

      if (currentUser) {
        setUser(currentUser);

        // Fetch user profile
        const profile = await getUserProfile(currentUser.uid);
        setUserProfile(profile);
      }
    } catch (error) {
      console.error('Error checking auth state:', error);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email, password) => {
    try {
      const user = await localAuth.signIn(email, password);
      setUser(user);

      // Fetch user profile
      const profile = await getUserProfile(user.uid);
      setUserProfile(profile);

      return user;
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  };

  const signUp = async (email, password, name) => {
    try {
      const user = await localAuth.signUp(email, password, name);
      setUser(user);

      // Profile is already created during signup
      const profile = await getUserProfile(user.uid);
      setUserProfile(profile);

      return user;
    } catch (error) {
      console.error('Error signing up:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await localAuth.signOut();
      setUser(null);
      setUserProfile(null);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const resetPassword = async (email) => {
    try {
      await localAuth.resetPassword(email);
    } catch (error) {
      console.error('Error resetting password:', error);
      throw error;
    }
  };

  const refreshUserProfile = async () => {
    if (user) {
      const profile = await getUserProfile(user.uid);
      setUserProfile(profile);
    }
  };

  const value = {
    user,
    userProfile,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    refreshUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
