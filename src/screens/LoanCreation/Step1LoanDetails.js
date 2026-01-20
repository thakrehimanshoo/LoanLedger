import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import {
  calculateEMI,
  calculateTotalInterest,
  formatCurrency,
} from '../../utils/loanCalculations';

/**
 * Step 1: Loan Details
 * Input Amount, Duration (months), Interest Rate (% per month converted to annual)
 */
const Step1LoanDetails = ({ initialData, onComplete, onCancel }) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  const [amount, setAmount] = useState(initialData.amount?.toString() || '');
  const [durationMonths, setDurationMonths] = useState(
    initialData.durationMonths?.toString() || ''
  );
  const [monthlyInterestRate, setMonthlyInterestRate] = useState(
    initialData.annualInterestRate
      ? (initialData.annualInterestRate / 12).toFixed(2)
      : ''
  );

  const [errors, setErrors] = useState({});

  // Validate inputs
  const validate = () => {
    const newErrors = {};

    if (!amount || parseFloat(amount) <= 0) {
      newErrors.amount = 'Please enter a valid amount';
    }

    if (!durationMonths || parseInt(durationMonths) <= 0) {
      newErrors.durationMonths = 'Please enter a valid duration';
    }

    if (monthlyInterestRate && parseFloat(monthlyInterestRate) < 0) {
      newErrors.monthlyInterestRate = 'Interest rate cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle next
  const handleNext = () => {
    if (validate()) {
      // Convert monthly interest rate to annual
      const annualRate = parseFloat(monthlyInterestRate || 0) * 12;

      onComplete({
        amount,
        durationMonths,
        annualInterestRate: annualRate,
      });
    }
  };

  // Calculate preview values
  const getPreviewValues = () => {
    if (
      amount &&
      durationMonths &&
      parseFloat(amount) > 0 &&
      parseInt(durationMonths) > 0
    ) {
      const annualRate = parseFloat(monthlyInterestRate || 0) * 12;
      const emi = calculateEMI(
        parseFloat(amount),
        annualRate,
        parseInt(durationMonths)
      );
      const totalInterest = calculateTotalInterest(
        parseFloat(amount),
        annualRate,
        parseInt(durationMonths)
      );

      return { emi, totalInterest };
    }

    return { emi: 0, totalInterest: 0 };
  };

  const { emi, totalInterest } = getPreviewValues();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.stepIndicator}>
          <View style={styles.stepNumber}>
            <Text style={styles.stepNumberText}>1</Text>
          </View>
          <Text style={styles.stepTitle}>Loan Details</Text>
        </View>
        <Text style={styles.stepDescription}>
          Enter the loan amount, duration, and interest rate
        </Text>
      </View>

      {/* Form */}
      <Card style={styles.formCard}>
        <Input
          label="Loan Amount (₹)"
          value={amount}
          onChangeText={setAmount}
          placeholder="Enter amount"
          keyboardType="numeric"
          error={errors.amount}
          leftIcon={
            <Ionicons
              name="cash-outline"
              size={20}
              color={theme.colors.textTertiary}
            />
          }
        />

        <Input
          label="Duration (Months)"
          value={durationMonths}
          onChangeText={setDurationMonths}
          placeholder="Enter duration in months"
          keyboardType="numeric"
          error={errors.durationMonths}
          leftIcon={
            <Ionicons
              name="calendar-outline"
              size={20}
              color={theme.colors.textTertiary}
            />
          }
        />

        <Input
          label="Interest Rate (% per month)"
          value={monthlyInterestRate}
          onChangeText={setMonthlyInterestRate}
          placeholder="Enter interest rate"
          keyboardType="decimal-pad"
          error={errors.monthlyInterestRate}
          helperText="Leave blank for 0% interest"
          leftIcon={
            <Ionicons
              name="trending-up-outline"
              size={20}
              color={theme.colors.textTertiary}
            />
          }
        />
      </Card>

      {/* Preview Card */}
      {emi > 0 && (
        <Card style={styles.previewCard}>
          <Text style={styles.previewTitle}>Loan Summary</Text>

          <View style={styles.previewRow}>
            <Text style={styles.previewLabel}>Monthly EMI</Text>
            <Text style={styles.previewValue}>{formatCurrency(emi)}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.previewRow}>
            <Text style={styles.previewLabel}>Total Interest</Text>
            <Text style={styles.previewValue}>
              {formatCurrency(totalInterest)}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.previewRow}>
            <Text style={styles.previewLabel}>Total Amount</Text>
            <Text style={[styles.previewValue, styles.previewTotal]}>
              {formatCurrency(parseFloat(amount) + totalInterest)}
            </Text>
          </View>
        </Card>
      )}

      {/* Actions */}
      <View style={styles.actions}>
        <Button
          title="Cancel"
          onPress={onCancel}
          variant="ghost"
          style={styles.cancelButton}
        />
        <Button
          title="Next: Review Schedule"
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
    formCard: {
      marginBottom: theme.spacing.lg,
    },
    previewCard: {
      backgroundColor: theme.colors.backgroundTertiary,
      marginBottom: theme.spacing.lg,
    },
    previewTitle: {
      fontSize: theme.typography.fontSize.lg,
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.text,
      marginBottom: theme.spacing.md,
    },
    previewRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: theme.spacing.sm,
    },
    previewLabel: {
      fontSize: theme.typography.fontSize.md,
      color: theme.colors.textSecondary,
    },
    previewValue: {
      fontSize: theme.typography.fontSize.lg,
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.text,
    },
    previewTotal: {
      color: theme.colors.primary,
      fontSize: theme.typography.fontSize.xl,
    },
    divider: {
      height: 1,
      backgroundColor: theme.colors.border,
      marginVertical: theme.spacing.xs,
    },
    actions: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: theme.spacing.lg,
    },
    cancelButton: {
      flex: 1,
      marginRight: theme.spacing.sm,
    },
    nextButton: {
      flex: 2,
    },
  });

export default Step1LoanDetails;
