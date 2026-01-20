import React, { createContext, useState, useContext, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightTheme, darkTheme } from '../theme/colors';
import themeConfig from '../theme/theme';

const ThemeContext = createContext();

const THEME_STORAGE_KEY = '@loanledger_theme';

export const ThemeProvider = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(systemColorScheme === 'dark');
  const [themePreference, setThemePreference] = useState('system'); // 'light', 'dark', 'system'

  // Load theme preference from storage on mount
  useEffect(() => {
    loadThemePreference();
  }, []);

  // Update theme when system preference changes
  useEffect(() => {
    if (themePreference === 'system') {
      setIsDarkMode(systemColorScheme === 'dark');
    }
  }, [systemColorScheme, themePreference]);

  const loadThemePreference = async () => {
    try {
      const saved = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (saved) {
        const preference = JSON.parse(saved);
        setThemePreference(preference);

        if (preference === 'light') {
          setIsDarkMode(false);
        } else if (preference === 'dark') {
          setIsDarkMode(true);
        } else {
          setIsDarkMode(systemColorScheme === 'dark');
        }
      }
    } catch (error) {
      console.error('Error loading theme preference:', error);
    }
  };

  const saveThemePreference = async (preference) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(preference));
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };

  const setTheme = (preference) => {
    setThemePreference(preference);
    saveThemePreference(preference);

    if (preference === 'light') {
      setIsDarkMode(false);
    } else if (preference === 'dark') {
      setIsDarkMode(true);
    } else {
      setIsDarkMode(systemColorScheme === 'dark');
    }
  };

  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    const newPreference = newMode ? 'dark' : 'light';
    setThemePreference(newPreference);
    saveThemePreference(newPreference);
  };

  // Current theme colors based on mode
  const colors = isDarkMode ? darkTheme : lightTheme;

  // Complete theme object
  const theme = {
    colors,
    isDarkMode,
    ...themeConfig,
  };

  const value = {
    theme,
    isDarkMode,
    themePreference,
    setTheme,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeContext;
