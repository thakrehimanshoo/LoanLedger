import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

/**
 * Premium Card Component
 * Rounded cards with 24px border radius and proper shadows
 */
const Card = ({ children, style, onPress, elevated = false }) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  const cardStyle = [
    styles.card,
    elevated && styles.elevated,
    style,
  ];

  if (onPress) {
    return (
      <TouchableOpacity
        style={cardStyle}
        onPress={onPress}
        activeOpacity={0.7}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={cardStyle}>{children}</View>;
};

const createStyles = (theme) =>
  StyleSheet.create({
    card: {
      backgroundColor: theme.colors.card,
      borderRadius: theme.borderRadius.xl, // 24px as specified
      padding: theme.layout.cardPadding,
      ...theme.shadows.md,
    },
    elevated: {
      backgroundColor: theme.colors.cardElevated,
      ...theme.shadows.lg,
    },
  });

export default Card;
