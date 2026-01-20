/**
 * Premium Color Palette for LoanLedger
 * Fintech-inspired dark and light themes
 */

export const lightTheme = {
  // Primary colors
  primary: '#6366F1', // Indigo - primary brand color
  primaryLight: '#818CF8',
  primaryDark: '#4F46E5',

  // Background colors
  background: '#F8FAFC', // Very light gray
  backgroundSecondary: '#FFFFFF',
  backgroundTertiary: '#F1F5F9',

  // Card colors
  card: '#FFFFFF',
  cardElevated: '#FFFFFF',

  // Text colors
  text: '#0F172A', // Dark slate
  textSecondary: '#475569',
  textTertiary: '#94A3B8',
  textInverse: '#FFFFFF',

  // Status colors
  success: '#10B981', // Green
  successLight: '#D1FAE5',
  warning: '#F59E0B', // Amber
  warningLight: '#FEF3C7',
  error: '#EF4444', // Red
  errorLight: '#FEE2E2',
  info: '#3B82F6', // Blue
  infoLight: '#DBEAFE',

  // Border colors
  border: '#E2E8F0',
  borderLight: '#F1F5F9',
  borderDark: '#CBD5E1',

  // Shadow
  shadow: 'rgba(15, 23, 42, 0.08)',
  shadowDark: 'rgba(15, 23, 42, 0.12)',

  // Special colors
  accent: '#EC4899', // Pink
  highlight: '#FBBF24', // Yellow

  // Overlay
  overlay: 'rgba(15, 23, 42, 0.5)',
};

export const darkTheme = {
  // Primary colors
  primary: '#818CF8', // Lighter indigo for dark mode
  primaryLight: '#A5B4FC',
  primaryDark: '#6366F1',

  // Background colors
  background: '#0F172A', // Dark slate
  backgroundSecondary: '#1E293B',
  backgroundTertiary: '#334155',

  // Card colors
  card: '#1E293B',
  cardElevated: '#334155',

  // Text colors
  text: '#F8FAFC', // Light gray
  textSecondary: '#CBD5E1',
  textTertiary: '#94A3B8',
  textInverse: '#0F172A',

  // Status colors
  success: '#34D399', // Lighter green for dark mode
  successLight: '#065F46',
  warning: '#FBBF24', // Lighter amber
  warningLight: '#78350F',
  error: '#F87171', // Lighter red
  errorLight: '#7F1D1D',
  info: '#60A5FA', // Lighter blue
  infoLight: '#1E3A8A',

  // Border colors
  border: '#334155',
  borderLight: '#1E293B',
  borderDark: '#475569',

  // Shadow
  shadow: 'rgba(0, 0, 0, 0.3)',
  shadowDark: 'rgba(0, 0, 0, 0.5)',

  // Special colors
  accent: '#F472B6', // Lighter pink
  highlight: '#FCD34D', // Lighter yellow

  // Overlay
  overlay: 'rgba(0, 0, 0, 0.7)',
};

export default { light: lightTheme, dark: darkTheme };
