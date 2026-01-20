import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

/**
 * Step 3: Select Borrower
 * Enter borrower details (name, email, phone)
 * In a full implementation, this would integrate with contacts or a community list
 */
const Step3SelectBorrower = ({ initialData, onComplete, onBack }) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  const [borrowerName, setBorrowerName] = useState(
    initialData.borrowerName || ''
  );
  const [borrowerEmail, setBorrowerEmail] = useState(
    initialData.borrowerEmail || ''
  );
  const [borrowerPhone, setBorrowerPhone] = useState(
    initialData.borrowerPhone || ''
  );

  const [errors, setErrors] = useState({});

  // Validate inputs
  const validate = () => {
    const newErrors = {};

    if (!borrowerName || borrowerName.trim().length === 0) {
      newErrors.borrowerName = 'Please enter borrower name';
    }

    if (borrowerEmail && !isValidEmail(borrowerEmail)) {
      newErrors.borrowerEmail = 'Please enter a valid email';
    }

    if (borrowerPhone && !isValidPhone(borrowerPhone)) {
      newErrors.borrowerPhone = 'Please enter a valid phone number';
    }

    if (!borrowerEmail && !borrowerPhone) {
      newErrors.borrowerEmail = 'Please provide email or phone number';
      newErrors.borrowerPhone = 'Please provide email or phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isValidPhone = (phone) => {
    const phoneRegex = /^[0-9]{10}$/;
    return phoneRegex.test(phone.replace(/[\s-]/g, ''));
  };

  // Handle next
  const handleNext = () => {
    if (validate()) {
      // Generate a borrower ID (in a real app, this would come from user database)
      const borrowerId = `borrower_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;

      onComplete({
        borrowerId,
        borrowerName: borrowerName.trim(),
        borrowerEmail: borrowerEmail.trim(),
        borrowerPhone: borrowerPhone.trim(),
      });
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.stepIndicator}>
          <View style={styles.stepNumber}>
            <Text style={styles.stepNumberText}>3</Text>
          </View>
          <Text style={styles.stepTitle}>Select Borrower</Text>
        </View>
        <Text style={styles.stepDescription}>
          Enter borrower details or select from contacts
        </Text>
      </View>

      {/* Info Card */}
      <Card style={styles.infoCard}>
        <View style={styles.infoRow}>
          <Ionicons
            name="information-circle"
            size={24}
            color={theme.colors.info}
          />
          <Text style={styles.infoText}>
            This is a small community lending app. Enter the borrower's contact
            details to send them loan notifications.
          </Text>
        </View>
      </Card>

      {/* Form */}
      <Card style={styles.formCard}>
        <Input
          label="Borrower Name *"
          value={borrowerName}
          onChangeText={setBorrowerName}
          placeholder="Enter borrower's full name"
          error={errors.borrowerName}
          leftIcon={
            <Ionicons
              name="person-outline"
              size={20}
              color={theme.colors.textTertiary}
            />
          }
        />

        <Input
          label="Email Address"
          value={borrowerEmail}
          onChangeText={setBorrowerEmail}
          placeholder="Enter email address"
          keyboardType="email-address"
          autoCapitalize="none"
          error={errors.borrowerEmail}
          helperText="Email or phone is required"
          leftIcon={
            <Ionicons
              name="mail-outline"
              size={20}
              color={theme.colors.textTertiary}
            />
          }
        />

        <Input
          label="Phone Number"
          value={borrowerPhone}
          onChangeText={setBorrowerPhone}
          placeholder="Enter 10-digit phone number"
          keyboardType="phone-pad"
          error={errors.borrowerPhone}
          helperText="Email or phone is required"
          leftIcon={
            <Ionicons
              name="call-outline"
              size={20}
              color={theme.colors.textTertiary}
            />
          }
        />
      </Card>

      {/* Future Enhancement Card */}
      <Card style={styles.futureCard}>
        <Text style={styles.futureTitle}>
          <Ionicons name="rocket-outline" size={16} /> Coming Soon
        </Text>
        <Text style={styles.futureText}>
          • Select from device contacts{'\n'}
          • Search community members{'\n'}• Quick add from recent borrowers
        </Text>
      </Card>

      {/* Actions */}
      <View style={styles.actions}>
        <Button
          title="Back"
          onPress={onBack}
          variant="outline"
          style={styles.backButton}
        />
        <Button
          title="Next: Review Contract"
          onPress={handleNext}
          style={styles.nextButton}
        />
      </View>
    </View>
  );
};

const createStyles = (theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    header: {
      marginBottom: theme.spacing.xl,
    },
    stepIndicator: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.sm,
    },
    stepNumber: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: theme.colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: theme.spacing.sm,
    },
    stepNumberText: {
      fontSize: theme.typography.fontSize.md,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.textInverse,
    },
    stepTitle: {
      fontSize: theme.typography.fontSize.xxl,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.text,
    },
    stepDescription: {
      fontSize: theme.typography.fontSize.md,
      color: theme.colors.textSecondary,
      marginTop: theme.spacing.xs,
    },
    infoCard: {
      backgroundColor: theme.colors.infoLight,
      marginBottom: theme.spacing.lg,
    },
    infoRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
    },
    infoText: {
      flex: 1,
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.text,
      marginLeft: theme.spacing.sm,
      lineHeight: theme.typography.lineHeight.relaxed * theme.typography.fontSize.sm,
    },
    formCard: {
      marginBottom: theme.spacing.lg,
    },
    futureCard: {
      backgroundColor: theme.colors.backgroundTertiary,
      borderStyle: 'dashed',
      borderWidth: 2,
      borderColor: theme.colors.border,
      marginBottom: theme.spacing.lg,
    },
    futureTitle: {
      fontSize: theme.typography.fontSize.md,
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.sm,
    },
    futureText: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.textTertiary,
      lineHeight: theme.typography.lineHeight.relaxed * theme.typography.fontSize.sm,
    },
    actions: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: theme.spacing.lg,
    },
    backButton: {
      flex: 1,
      marginRight: theme.spacing.sm,
    },
    nextButton: {
      flex: 2,
    },
  });

export default Step3SelectBorrower;
