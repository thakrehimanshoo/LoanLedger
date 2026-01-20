import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

/**
 * Premium Button Component
 * Variants: primary, secondary, outline, ghost
 */
const Button = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  textStyle,
  icon,
}) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  const buttonStyles = [
    styles.button,
    styles[variant],
    styles[size],
    disabled && styles.disabled,
    style,
  ];

  const textStyles = [
    styles.text,
    styles[`${variant}Text`],
    styles[`${size}Text`],
    disabled && styles.disabledText,
    textStyle,
  ];

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator
          color={
            variant === 'primary' ? theme.colors.textInverse : theme.colors.primary
          }
        />
      ) : (
        <>
          {icon && icon}
          <Text style={textStyles}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const createStyles = (theme) =>
  StyleSheet.create({
    button: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: theme.borderRadius.md,
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg,
    },
    text: {
      fontWeight: theme.typography.fontWeight.semibold,
      textAlign: 'center',
    },

    // Variants
    primary: {
      backgroundColor: theme.colors.primary,
      ...theme.shadows.sm,
    },
    primaryText: {
      color: theme.colors.textInverse,
      fontSize: theme.typography.fontSize.md,
    },

    secondary: {
      backgroundColor: theme.colors.backgroundTertiary,
    },
    secondaryText: {
      color: theme.colors.text,
      fontSize: theme.typography.fontSize.md,
    },

    outline: {
      backgroundColor: 'transparent',
      borderWidth: 2,
      borderColor: theme.colors.primary,
    },
    outlineText: {
      color: theme.colors.primary,
      fontSize: theme.typography.fontSize.md,
    },

    ghost: {
      backgroundColor: 'transparent',
    },
    ghostText: {
      color: theme.colors.primary,
      fontSize: theme.typography.fontSize.md,
    },

    // Sizes
    small: {
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
    },
    smallText: {
      fontSize: theme.typography.fontSize.sm,
    },

    medium: {
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg,
    },
    mediumText: {
      fontSize: theme.typography.fontSize.md,
    },

    large: {
      paddingVertical: theme.spacing.lg,
      paddingHorizontal: theme.spacing.xl,
    },
    largeText: {
      fontSize: theme.typography.fontSize.lg,
    },

    // States
    disabled: {
      opacity: 0.5,
    },
    disabledText: {
      opacity: 0.7,
    },
  });

export default Button;
