import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import {
  formatCurrency,
  formatDate,
  calculateTotalInterest,
} from '../../utils/loanCalculations';

/**
 * Step 4: Contract Review
 * Final review of all loan details before submission
 */
const Step4ContractReview = ({ loanData, onSubmit, onBack, loading }) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  const totalInterest = calculateTotalInterest(
    loanData.amount,
    loanData.annualInterestRate,
    loanData.durationMonths
  );
  const totalAmount = loanData.amount + totalInterest;
  const firstEMI = loanData.emis[0];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.stepIndicator}>
          <View style={styles.stepNumber}>
            <Text style={styles.stepNumberText}>4</Text>
          </View>
          <Text style={styles.stepTitle}>Review Contract</Text>
        </View>
        <Text style={styles.stepDescription}>
          Review all details before creating the loan
        </Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Contract Summary */}
        <Card style={styles.contractCard}>
          <View style={styles.contractHeader}>
            <Ionicons
              name="document-text"
              size={32}
              color={theme.colors.primary}
            />
            <Text style={styles.contractTitle}>Loan Agreement</Text>
          </View>

          <View style={styles.divider} />

          {/* Parties */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Parties</Text>

            <View style={styles.partyRow}>
              <View style={styles.partyIcon}>
                <Ionicons name="person" size={20} color={theme.colors.primary} />
              </View>
              <View style={styles.partyInfo}>
                <Text style={styles.partyLabel}>Lender</Text>
                <Text style={styles.partyName}>{loanData.lenderName}</Text>
              </View>
            </View>

            <View style={styles.partyRow}>
              <View style={styles.partyIcon}>
                <Ionicons name="person" size={20} color={theme.colors.success} />
              </View>
              <View style={styles.partyInfo}>
                <Text style={styles.partyLabel}>Borrower</Text>
                <Text style={styles.partyName}>{loanData.borrowerName}</Text>
                {loanData.borrowerEmail && (
                  <Text style={styles.partyContact}>
                    {loanData.borrowerEmail}
                  </Text>
                )}
                {loanData.borrowerPhone && (
                  <Text style={styles.partyContact}>
                    {loanData.borrowerPhone}
                  </Text>
                )}
              </View>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Loan Terms */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Loan Terms</Text>

            <View style={styles.termRow}>
              <Text style={styles.termLabel}>Principal Amount</Text>
              <Text style={styles.termValue}>
                {formatCurrency(loanData.amount)}
              </Text>
            </View>

            <View style={styles.termRow}>
              <Text style={styles.termLabel}>Interest Rate</Text>
              <Text style={styles.termValue}>
                {(loanData.annualInterestRate / 12).toFixed(2)}% per month
              </Text>
            </View>

            <View style={styles.termRow}>
              <Text style={styles.termLabel}>Duration</Text>
              <Text style={styles.termValue}>
                {loanData.durationMonths} months
              </Text>
            </View>

            <View style={styles.termRow}>
              <Text style={styles.termLabel}>Monthly EMI</Text>
              <Text style={styles.termValue}>
                {formatCurrency(firstEMI.emi)}
              </Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.termRow}>
              <Text style={styles.termLabelBold}>Total Interest</Text>
              <Text style={styles.termValueHighlight}>
                {formatCurrency(totalInterest)}
              </Text>
            </View>

            <View style={styles.termRow}>
              <Text style={styles.termLabelBold}>Total Repayment</Text>
              <Text style={styles.termValuePrimary}>
                {formatCurrency(totalAmount)}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Payment Schedule Summary */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Payment Schedule</Text>

            <View style={styles.scheduleRow}>
              <Ionicons
                name="calendar"
                size={20}
                color={theme.colors.textSecondary}
              />
              <View style={styles.scheduleInfo}>
                <Text style={styles.scheduleLabel}>First Payment Due</Text>
                <Text style={styles.scheduleValue}>
                  {formatDate(firstEMI.dueDate)}
                </Text>
              </View>
            </View>

            <View style={styles.scheduleRow}>
              <Ionicons
                name="calendar"
                size={20}
                color={theme.colors.textSecondary}
              />
              <View style={styles.scheduleInfo}>
                <Text style={styles.scheduleLabel}>Final Payment Due</Text>
                <Text style={styles.scheduleValue}>
                  {formatDate(loanData.emis[loanData.emis.length - 1].dueDate)}
                </Text>
              </View>
            </View>

            <View style={styles.scheduleRow}>
              <Ionicons
                name="repeat"
                size={20}
                color={theme.colors.textSecondary}
              />
              <View style={styles.scheduleInfo}>
                <Text style={styles.scheduleLabel}>Total Installments</Text>
                <Text style={styles.scheduleValue}>
                  {loanData.emis.length} monthly payments
                </Text>
              </View>
            </View>
          </View>
        </Card>

        {/* Important Notice */}
        <Card style={styles.noticeCard}>
          <View style={styles.noticeHeader}>
            <Ionicons
              name="warning"
              size={24}
              color={theme.colors.warning}
            />
            <Text style={styles.noticeTitle}>Important Notice</Text>
          </View>
          <Text style={styles.noticeText}>
            • This is a record-keeping tool, not a legal contract{'\n'}
            • No money is transferred through this app{'\n'}
            • Both parties should agree to terms offline{'\n'}
            • Users are responsible for tax and legal compliance{'\n'}• This
            app only tracks payment schedules
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
            title="Create Loan"
            onPress={onSubmit}
            loading={loading}
            style={styles.submitButton}
          />
        </View>
      </ScrollView>
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
    contractCard: {
      marginBottom: theme.spacing.lg,
    },
    contractHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.md,
    },
    contractTitle: {
      fontSize: theme.typography.fontSize.xl,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.text,
      marginLeft: theme.spacing.sm,
    },
    divider: {
      height: 1,
      backgroundColor: theme.colors.border,
      marginVertical: theme.spacing.md,
    },
    section: {
      marginBottom: theme.spacing.sm,
    },
    sectionTitle: {
      fontSize: theme.typography.fontSize.lg,
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.text,
      marginBottom: theme.spacing.md,
    },
    partyRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: theme.spacing.md,
    },
    partyIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.colors.backgroundTertiary,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: theme.spacing.sm,
    },
    partyInfo: {
      flex: 1,
    },
    partyLabel: {
      fontSize: theme.typography.fontSize.xs,
      color: theme.colors.textTertiary,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginBottom: theme.spacing.xs,
    },
    partyName: {
      fontSize: theme.typography.fontSize.lg,
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.text,
    },
    partyContact: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.textSecondary,
      marginTop: theme.spacing.xs,
    },
    termRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: theme.spacing.sm,
    },
    termLabel: {
      fontSize: theme.typography.fontSize.md,
      color: theme.colors.textSecondary,
    },
    termLabelBold: {
      fontSize: theme.typography.fontSize.md,
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.text,
    },
    termValue: {
      fontSize: theme.typography.fontSize.md,
      fontWeight: theme.typography.fontWeight.medium,
      color: theme.colors.text,
    },
    termValueHighlight: {
      fontSize: theme.typography.fontSize.lg,
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.warning,
    },
    termValuePrimary: {
      fontSize: theme.typography.fontSize.xl,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.primary,
    },
    scheduleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.md,
    },
    scheduleInfo: {
      marginLeft: theme.spacing.sm,
    },
    scheduleLabel: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.textTertiary,
    },
    scheduleValue: {
      fontSize: theme.typography.fontSize.md,
      fontWeight: theme.typography.fontWeight.medium,
      color: theme.colors.text,
    },
    noticeCard: {
      backgroundColor: theme.colors.warningLight,
      marginBottom: theme.spacing.lg,
    },
    noticeHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.sm,
    },
    noticeTitle: {
      fontSize: theme.typography.fontSize.md,
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.text,
      marginLeft: theme.spacing.sm,
    },
    noticeText: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.text,
      lineHeight: theme.typography.lineHeight.relaxed * theme.typography.fontSize.sm,
    },
    actions: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: theme.spacing.lg,
      marginBottom: theme.spacing.xl,
    },
    backButton: {
      flex: 1,
      marginRight: theme.spacing.sm,
    },
    submitButton: {
      flex: 2,
    },
  });

export default Step4ContractReview;
