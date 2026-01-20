import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider } from './src/contexts/ThemeContext';
import { AuthProvider } from './src/contexts/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';

/**
 * LoanLedger - P2P Community Lending Record-Keeper
 * A React Native (Expo) mobile application for tracking loans in small communities
 */
export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <StatusBar style="auto" />
        <AppNavigator />
      </AuthProvider>
    </ThemeProvider>
  );
}
