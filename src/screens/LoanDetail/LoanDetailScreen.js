import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContextLocal';
import useLocalStorage from '../../hooks/useLocalStorage';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import LegalDisclaimer from '../../components/common/LegalDisclaimer';
import {
  formatCurrency,
  formatDate,
  calculateLoanProgress,
  calculateTotalPaid,
  calculateRemainingAmount,
  isEMIOverdue,
  getDaysUntilDue,
} from '../../utils/loanCalculations';

/**
 * Loan Detail Screen
 * Shows loan progress and EMI list with "Mark as Paid" functionality
 */
const LoanDetailScreen = ({ route, navigation }) => {
  const { loanId } = route.params;
  const { theme } = useTheme();
  const { user } = useAuth();
  const { getLoanById, markEMIAsPaid, loading } = useLocalStorage();

  const [loan, setLoan] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const styles = createStyles(theme);

  // Load loan data
  const loadLoan = async () => {
    const loanData = await getLoanById(loanId);
    if (loanData) {
      setLoan(loanData);
    } else {
      Alert.alert('Error', 'Loan not found');
      navigation.goBack();
    }
  };

  useEffect(() => {
    loadLoan();
  }, [loanId]);

  // Handle refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await loadLoan();
    setRefreshing(false);
  };

  // Handle marking EMI as paid
  const handleMarkAsPaid = (emiIndex) => {
    Alert.alert(
      'Mark EMI as Paid',
      `Mark EMI #${emiIndex + 1} as paid?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Mark as Paid',
          onPress: async () => {
            const success = await markEMIAsPaid(loanId, emiIndex);
            if (success) {
              await loadLoan();
              Alert.alert('Success', 'EMI marked as paid');
            } else {
              Alert.alert('Error', 'Failed to mark EMI as paid');
            }
          },
        },
      ]
    );
  };

  if (!loan) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  const progress = calculateLoanProgress(loan.emis);
  const totalPaid = calculateTotalPaid(loan.emis);
  const remaining = calculateRemainingAmount(loan.emis);
  const isLender = user?.uid === loan.lenderId;

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header Card */}
        <Card style={styles.headerCard}>
          <View style={styles.headerRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {loan.borrowerName?.charAt(0).toUpperCase() || 'B'}
              </Text>
            </View>
            <View style={styles.headerInfo}>
              <Text style={styles.role}>
                {isLender ? 'Lending to' : 'Borrowing from'}
              </Text>
              <Text style={styles.name}>
                {isLender ? loan.borrowerName : loan.lenderName}
              </Text>
            </View>
          </View>

          <View style={styles.amountRow}>
            <Text style={styles.amountLabel}>Loan Amount</Text>
            <Text style={styles.amount}>{formatCurrency(loan.amount)}</Text>
          </View>
        </Card>

        {/* Progress Card */}
        <Card style={styles.progressCard}>
          <Text style={styles.cardTitle}>Repayment Progress</Text>

          {/* Progress Bar */}
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${progress}%` },
                ]}
              />
            </View>
            <Text style={styles.progressPercentage}>
              {progress.toFixed(1)}%
            </Text>
          </View>

          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Ionicons
                name="checkmark-circle"
                size={20}
                color={theme.colors.success}
              />
              <Text style={styles.statLabel}>Paid</Text>
              <Text style={styles.statValue}>{formatCurrency(totalPaid)}</Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.stat}>
              <Ionicons
                name="time"
                size={20}
                color={theme.colors.warning}
              />
              <Text style={styles.statLabel}>Remaining</Text>
              <Text style={styles.statValue}>
                {formatCurrency(remaining)}
              </Text>
            </View>
          </View>
        </Card>

        {/* Loan Info Card */}
        <Card style={styles.infoCard}>
          <Text style={styles.cardTitle}>Loan Details</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Interest Rate</Text>
            <Text style={styles.infoValue}>
              {(loan.annualInterestRate / 12).toFixed(2)}% per month
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Duration</Text>
            <Text style={styles.infoValue}>{loan.durationMonths} months</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Monthly EMI</Text>
            <Text style={styles.infoValue}>
              {formatCurrency(loan.emis[0]?.emi || 0)}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Status</Text>
            <Text
              style={[
                styles.infoValue,
                {
                  color:
                    loan.status === 'completed'
                      ? theme.colors.success
                      : theme.colors.primary,
                },
              ]}
            >
              {loan.status === 'completed' ? 'Completed' : 'Active'}
            </Text>
          </View>
        </Card>

        {/* EMI List */}
        <Card style={styles.emiListCard}>
          <Text style={styles.cardTitle}>Payment Schedule</Text>

          {loan.emis.map((emi, index) => {
            const overdue = isEMIOverdue(emi);
            const daysUntil = getDaysUntilDue(emi.dueDate);

            let statusColor = theme.colors.textTertiary;
            let statusIcon = 'ellipse-outline';
            let statusText = 'Pending';

            if (emi.paid) {
              statusColor = theme.colors.success;
              statusIcon = 'checkmark-circle';
              statusText = 'Paid';
            } else if (overdue) {
              statusColor = theme.colors.error;
              statusIcon = 'alert-circle';
              statusText = `${Math.abs(daysUntil)} days overdue`;
            } else if (daysUntil <= 3) {
              statusColor = theme.colors.warning;
              statusIcon = 'warning';
              statusText = `Due in ${daysUntil} days`;
            }

            return (
              <View key={index} style={styles.emiItem}>
                <View style={styles.emiLeft}>
                  <Ionicons name={statusIcon} size={24} color={statusColor} />
                  <View style={styles.emiInfo}>
                    <Text style={styles.emiMonth}>EMI #{index + 1}</Text>
                    <Text style={styles.emiDate}>
                      Due: {formatDate(emi.dueDate)}
                    </Text>
                    {emi.paid && emi.paidDate && (
                      <Text style={styles.emiPaidDate}>
                        Paid: {formatDate(emi.paidDate)}
                      </Text>
                    )}
                  </View>
                </View>

                <View style={styles.emiRight}>
                  <Text style={styles.emiAmount}>
                    {formatCurrency(emi.emi)}
                  </Text>
                  <Text style={[styles.emiStatus, { color: statusColor }]}>
                    {statusText}
                  </Text>

                  {!emi.paid && isLender && (
                    <Button
                      title="Mark Paid"
                      onPress={() => handleMarkAsPaid(index)}
                      variant="ghost"
                      size="small"
                      style={styles.markPaidButton}
                    />
                  )}
                </View>
              </View>
            );
          })}
        </Card>

        {/* Legal Disclaimer */}
        <LegalDisclaimer style={styles.disclaimer} />
      </ScrollView>
    </View>
  );
};

const createStyles = (theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    loadingContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.background,
    },
    loadingText: {
      fontSize: theme.typography.fontSize.md,
      color: theme.colors.textSecondary,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      padding: theme.layout.screenPadding,
    },
    headerCard: {
      marginBottom: theme.spacing.md,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.md,
    },
    avatar: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: theme.colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: theme.spacing.md,
    },
    avatarText: {
      fontSize: theme.typography.fontSize.xxl,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.textInverse,
    },
    headerInfo: {
      flex: 1,
    },
    role: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.textTertiary,
      marginBottom: theme.spacing.xs,
    },
    name: {
      fontSize: theme.typography.fontSize.xl,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.text,
    },
    amountRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingTop: theme.spacing.md,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
    amountLabel: {
      fontSize: theme.typography.fontSize.md,
      color: theme.colors.textSecondary,
    },
    amount: {
      fontSize: theme.typography.fontSize.xxl,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.primary,
    },
    progressCard: {
      marginBottom: theme.spacing.md,
    },
    cardTitle: {
      fontSize: theme.typography.fontSize.lg,
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.text,
      marginBottom: theme.spacing.md,
    },
    progressBarContainer: {
      marginBottom: theme.spacing.md,
    },
    progressBar: {
      height: 12,
      backgroundColor: theme.colors.backgroundTertiary,
      borderRadius: 6,
      overflow: 'hidden',
      marginBottom: theme.spacing.sm,
    },
    progressFill: {
      height: '100%',
      backgroundColor: theme.colors.primary,
      borderRadius: 6,
    },
    progressPercentage: {
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.text,
      textAlign: 'right',
    },
    statsRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
    },
    stat: {
      flex: 1,
      alignItems: 'center',
    },
    statDivider: {
      width: 1,
      backgroundColor: theme.colors.border,
      marginVertical: theme.spacing.sm,
    },
    statLabel: {
      fontSize: theme.typography.fontSize.xs,
      color: theme.colors.textTertiary,
      marginTop: theme.spacing.xs,
    },
    statValue: {
      fontSize: theme.typography.fontSize.lg,
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.text,
      marginTop: theme.spacing.xs,
    },
    infoCard: {
      marginBottom: theme.spacing.md,
    },
    infoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: theme.spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.borderLight,
    },
    infoLabel: {
      fontSize: theme.typography.fontSize.md,
      color: theme.colors.textSecondary,
    },
    infoValue: {
      fontSize: theme.typography.fontSize.md,
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.text,
    },
    emiListCard: {
      marginBottom: theme.spacing.md,
    },
    emiItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.borderLight,
    },
    emiLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    emiInfo: {
      marginLeft: theme.spacing.sm,
    },
    emiMonth: {
      fontSize: theme.typography.fontSize.md,
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.text,
    },
    emiDate: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.textSecondary,
      marginTop: theme.spacing.xs,
    },
    emiPaidDate: {
      fontSize: theme.typography.fontSize.xs,
      color: theme.colors.success,
      marginTop: theme.spacing.xs,
    },
    emiRight: {
      alignItems: 'flex-end',
    },
    emiAmount: {
      fontSize: theme.typography.fontSize.lg,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.text,
    },
    emiStatus: {
      fontSize: theme.typography.fontSize.xs,
      marginTop: theme.spacing.xs,
    },
    markPaidButton: {
      marginTop: theme.spacing.xs,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
    },
    disclaimer: {
      marginTop: theme.spacing.lg,
      marginBottom: theme.spacing.xl,
    },
  });

export default LoanDetailScreen;
