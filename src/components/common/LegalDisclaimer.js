import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';

/**
 * Legal Disclaimer Component
 * Required on all lending-related screens as per requirements
 * "This is a record-keeping tool. Users are responsible for their own tax and legal compliance."
 */
const LegalDisclaimer = ({ style }) => {
  const { theme } = useTheme();

  const styles = createStyles(theme);

  return (
    <View style={[styles.container, style]}>
      <Ionicons
        name="information-circle-outline"
        size={16}
        color={theme.colors.textTertiary}
        style={styles.icon}
      />
      <Text style={styles.text}>
        This is a record-keeping tool. Users are responsible for their own tax
        and legal compliance.
      </Text>
    </View>
  );
};

const createStyles = (theme) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.backgroundTertiary,
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      borderRadius: theme.borderRadius.sm,
      borderLeftWidth: 3,
      borderLeftColor: theme.colors.warning,
    },
    icon: {
      marginRight: theme.spacing.sm,
    },
    text: {
      flex: 1,
      fontSize: theme.typography.fontSize.xs,
      color: theme.colors.textSecondary,
      lineHeight: theme.typography.lineHeight.normal * theme.typography.fontSize.xs,
    },
  });

export default LegalDisclaimer;
