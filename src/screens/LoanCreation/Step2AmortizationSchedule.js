import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { formatCurrency, formatDate } from '../../utils/loanCalculations';

/**
 * Step 2: Amortization Schedule
 * Display auto-calculated monthly breakdown of Principal + Interest
 */
const Step2AmortizationSchedule = ({
  schedule,
  amount,
  interestRate,
  duration,
  onNext,
  onBack,
}) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  const totalInterest = schedule.reduce((sum, emi) => sum + emi.interest, 0);
  const totalAmount = amount + totalInterest;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.stepIndicator}>
          <View style={styles.stepNumber}>
            <Text style={styles.stepNumberText}>2</Text>
          </View>
          <Text style={styles.stepTitle}>Payment Schedule</Text>
        </View>
        <Text style={styles.stepDescription}>
          Review the monthly payment breakdown
        </Text>
      </View>

      {/* Summary Card */}
      <Card style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Principal</Text>
            <Text style={styles.summaryValue}>{formatCurrency(amount)}</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Duration</Text>
            <Text style={styles.summaryValue}>{duration} months</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Rate</Text>
            <Text style={styles.summaryValue}>
              {(interestRate / 12).toFixed(2)}% /mo
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total Interest</Text>
          <Text style={styles.totalInterest}>
            {formatCurrency(totalInterest)}
          </Text>
        </View>

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total Repayment</Text>
          <Text style={styles.totalAmount}>{formatCurrency(totalAmount)}</Text>
        </View>
      </Card>

      {/* Schedule Table */}
      <Card style={styles.scheduleCard}>
        <Text style={styles.scheduleTitle}>Monthly Breakdown</Text>

        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderText, styles.monthColumn]}>
            Month
          </Text>
          <Text style={[styles.tableHeaderText, styles.emiColumn]}>EMI</Text>
          <Text style={[styles.tableHeaderText, styles.principalColumn]}>
            Principal
          </Text>
          <Text style={[styles.tableHeaderText, styles.interestColumn]}>
            Interest
          </Text>
          <Text style={[styles.tableHeaderText, styles.balanceColumn]}>
            Balance
          </Text>
        </View>

        <ScrollView
          style={styles.tableBody}
          showsVerticalScrollIndicator={true}
        >
          {schedule.map((emi, index) => (
            <View
              key={index}
              style={[
                styles.tableRow,
                index % 2 === 0 && styles.tableRowEven,
              ]}
            >
              <Text style={[styles.tableCell, styles.monthColumn]}>
                {emi.month}
              </Text>
              <Text style={[styles.tableCell, styles.emiColumn]}>
                ₹{emi.emi.toLocaleString('en-IN')}
              </Text>
              <Text style={[styles.tableCell, styles.principalColumn]}>
                ₹{emi.principal.toLocaleString('en-IN')}
              </Text>
              <Text style={[styles.tableCell, styles.interestColumn]}>
                ₹{emi.interest.toLocaleString('en-IN')}
              </Text>
              <Text style={[styles.tableCell, styles.balanceColumn]}>
                ₹{emi.balance.toLocaleString('en-IN')}
              </Text>
            </View>
          ))}
        </ScrollView>
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
          title="Next: Select Borrower"
          onPress={onNext}
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
    summaryCard: {
      marginBottom: theme.spacing.lg,
    },
    summaryRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: theme.spacing.md,
    },
    summaryItem: {
      flex: 1,
      alignItems: 'center',
    },
    summaryDivider: {
      width: 1,
      backgroundColor: theme.colors.border,
      marginHorizontal: theme.spacing.sm,
    },
    summaryLabel: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.xs,
    },
    summaryValue: {
      fontSize: theme.typography.fontSize.md,
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.text,
    },
    divider: {
      height: 1,
      backgroundColor: theme.colors.border,
      marginVertical: theme.spacing.md,
    },
    totalRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginVertical: theme.spacing.xs,
    },
    totalLabel: {
      fontSize: theme.typography.fontSize.md,
      color: theme.colors.textSecondary,
    },
    totalInterest: {
      fontSize: theme.typography.fontSize.lg,
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.warning,
    },
    totalAmount: {
      fontSize: theme.typography.fontSize.xl,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.primary,
    },
    scheduleCard: {
      marginBottom: theme.spacing.lg,
      maxHeight: 400,
    },
    scheduleTitle: {
      fontSize: theme.typography.fontSize.lg,
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.text,
      marginBottom: theme.spacing.md,
    },
    tableHeader: {
      flexDirection: 'row',
      backgroundColor: theme.colors.backgroundTertiary,
      padding: theme.spacing.sm,
      borderRadius: theme.borderRadius.sm,
      marginBottom: theme.spacing.xs,
    },
    tableHeaderText: {
      fontSize: theme.typography.fontSize.xs,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.text,
    },
    tableBody: {
      maxHeight: 250,
    },
    tableRow: {
      flexDirection: 'row',
      paddingVertical: theme.spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.borderLight,
    },
    tableRowEven: {
      backgroundColor: theme.colors.backgroundTertiary,
    },
    tableCell: {
      fontSize: theme.typography.fontSize.xs,
      color: theme.colors.text,
    },
    monthColumn: {
      width: '12%',
      textAlign: 'center',
    },
    emiColumn: {
      width: '22%',
      textAlign: 'right',
    },
    principalColumn: {
      width: '22%',
      textAlign: 'right',
    },
    interestColumn: {
      width: '22%',
      textAlign: 'right',
    },
    balanceColumn: {
      width: '22%',
      textAlign: 'right',
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

export default Step2AmortizationSchedule;
