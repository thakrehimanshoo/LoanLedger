import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider } from './src/contexts/ThemeContext';
import { AuthProvider } from './src/contexts/AuthContextLocal';
import AppNavigatorLocal from './src/navigation/AppNavigatorLocal';

/**
 * LoanLedger - P2P Community Lending Record-Keeper
 * A React Native (Expo) mobile application for tracking loans in small communities
 *
 * LOCAL STORAGE MODE: All data stored locally using AsyncStorage
 * No Firebase required for quick setup and testing
 */
export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <StatusBar style="auto" />
        <AppNavigatorLocal />
      </AuthProvider>
    </ThemeProvider>
  );
}
