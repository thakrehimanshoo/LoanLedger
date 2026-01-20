import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import useFirebase from '../../hooks/useFirebase';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import LegalDisclaimer from '../../components/common/LegalDisclaimer';
import {
  formatCurrency,
  formatDate,
  getNextEMIDueDate,
  getDaysUntilDue,
  calculateLoanProgress,
} from '../../utils/loanCalculations';

/**
 * Dashboard Screen
 * Shows metrics and active loans for the lender
 */
const DashboardScreen = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const { user } = useAuth();
  const { getUserMetrics, getActiveLoans, loading } = useFirebase();

  const [metrics, setMetrics] = useState({
    totalLended: 0,
    totalInterestEarned: 0,
    avgReturn: 0,
    totalLoans: 0,
    activeLoans: 0,
  });
  const [activeLoans, setActiveLoans] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const styles = createStyles(theme);

  // Load data
  const loadData = async () => {
    if (!user) return;

    try {
      const [metricsData, loansData] = await Promise.all([
        getUserMetrics(user.uid),
        getActiveLoans(user.uid),
      ]);

      setMetrics(metricsData);
      setActiveLoans(loansData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  // Reload data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [user])
  );

  // Handle refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  // Navigate to create loan
  const handleCreateLoan = () => {
    navigation.navigate('CreateLoan');
  };

  // Navigate to loan detail
  const handleLoanPress = (loan) => {
    navigation.navigate('LoanDetail', { loanId: loan.id });
  };

  // Render metric card
  const renderMetricCard = (icon, label, value, color) => (
    <Card style={styles.metricCard}>
      <View style={[styles.metricIcon, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </Card>
  );

  // Render loan card
  const renderLoanCard = (loan) => {
    const nextEMI = getNextEMIDueDate(loan.emis);
    const progress = calculateLoanProgress(loan.emis);
    const daysUntilDue = nextEMI ? getDaysUntilDue(nextEMI) : null;

    let statusColor = theme.colors.success;
    let statusText = 'On Track';

    if (daysUntilDue !== null) {
      if (daysUntilDue < 0) {
        statusColor = theme.colors.error;
        statusText = `${Math.abs(daysUntilDue)} days overdue`;
      } else if (daysUntilDue <= 3) {
        statusColor = theme.colors.warning;
        statusText = `Due in ${daysUntilDue} days`;
      } else {
        statusText = `Due in ${daysUntilDue} days`;
      }
    }

    return (
      <Card
        key={loan.id}
        style={styles.loanCard}
        onPress={() => handleLoanPress(loan)}
      >
        {/* Header */}
        <View style={styles.loanHeader}>
          <View style={styles.loanHeaderLeft}>
            <View style={styles.borrowerAvatar}>
              <Text style={styles.borrowerAvatarText}>
                {loan.borrowerName?.charAt(0).toUpperCase() || 'B'}
              </Text>
            </View>
            <View style={styles.loanHeaderInfo}>
              <Text style={styles.borrowerName}>{loan.borrowerName}</Text>
              <Text style={styles.loanAmount}>
                {formatCurrency(loan.amount)}
              </Text>
            </View>
          </View>

          <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
            <Text style={[styles.statusText, { color: statusColor }]}>
              {statusText}
            </Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${progress}%`,
                  backgroundColor: theme.colors.primary,
                },
              ]}
            />
          </View>
          <Text style={styles.progressText}>{progress.toFixed(0)}% paid</Text>
        </View>

        {/* Info */}
        <View style={styles.loanInfo}>
          <View style={styles.loanInfoItem}>
            <Ionicons
              name="calendar-outline"
              size={16}
              color={theme.colors.textTertiary}
            />
            <Text style={styles.loanInfoText}>
              Next EMI: {nextEMI ? formatDate(nextEMI) : 'Completed'}
            </Text>
          </View>

          <View style={styles.loanInfoItem}>
            <Ionicons
              name="trending-up-outline"
              size={16}
              color={theme.colors.textTertiary}
            />
            <Text style={styles.loanInfoText}>
              {(loan.annualInterestRate / 12).toFixed(2)}% /mo
            </Text>
          </View>
        </View>
      </Card>
    );
  };

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
        {/* Metrics Section */}
        <View style={styles.metricsSection}>
          <Text style={styles.sectionTitle}>Your Portfolio</Text>

          <View style={styles.metricsGrid}>
            {renderMetricCard(
              'cash',
              'Total Lended',
              formatCurrency(metrics.totalLended),
              theme.colors.primary
            )}
            {renderMetricCard(
              'trending-up',
              'Interest Earned',
              formatCurrency(metrics.totalInterestEarned),
              theme.colors.success
            )}
            {renderMetricCard(
              'stats-chart',
              'Avg. Return',
              `${metrics.avgReturn}%`,
              theme.colors.warning
            )}
          </View>
        </View>

        {/* Active Loans Section */}
        <View style={styles.loansSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              Active Loans ({activeLoans.length})
            </Text>
            <Button
              title="New Loan"
              onPress={handleCreateLoan}
              variant="primary"
              size="small"
              icon={
                <Ionicons
                  name="add"
                  size={20}
                  color={theme.colors.textInverse}
                  style={{ marginRight: 4 }}
                />
              }
            />
          </View>

          {activeLoans.length > 0 ? (
            activeLoans.map((loan) => renderLoanCard(loan))
          ) : (
            <Card style={styles.emptyState}>
              <Ionicons
                name="document-text-outline"
                size={48}
                color={theme.colors.textTertiary}
              />
              <Text style={styles.emptyStateTitle}>No Active Loans</Text>
              <Text style={styles.emptyStateText}>
                Create your first loan to start tracking payments
              </Text>
              <Button
                title="Create Loan"
                onPress={handleCreateLoan}
                style={styles.emptyStateButton}
              />
            </Card>
          )}
        </View>

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
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      padding: theme.layout.screenPadding,
    },
    metricsSection: {
      marginBottom: theme.spacing.xl,
    },
    sectionTitle: {
      fontSize: theme.typography.fontSize.xl,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.text,
      marginBottom: theme.spacing.md,
    },
    metricsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginHorizontal: -theme.spacing.xs,
    },
    metricCard: {
      flex: 1,
      minWidth: '30%',
      margin: theme.spacing.xs,
      alignItems: 'center',
      padding: theme.spacing.md,
    },
    metricIcon: {
      width: 48,
      height: 48,
      borderRadius: 24,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: theme.spacing.sm,
    },
    metricLabel: {
      fontSize: theme.typography.fontSize.xs,
      color: theme.colors.textTertiary,
      textAlign: 'center',
      marginBottom: theme.spacing.xs,
    },
    metricValue: {
      fontSize: theme.typography.fontSize.lg,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.text,
      textAlign: 'center',
    },
    loansSection: {
      marginBottom: theme.spacing.xl,
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.md,
    },
    loanCard: {
      marginBottom: theme.spacing.md,
    },
    loanHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.md,
    },
    loanHeaderLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    borrowerAvatar: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: theme.colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: theme.spacing.sm,
    },
    borrowerAvatarText: {
      fontSize: theme.typography.fontSize.xl,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.textInverse,
    },
    loanHeaderInfo: {
      flex: 1,
    },
    borrowerName: {
      fontSize: theme.typography.fontSize.lg,
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.text,
    },
    loanAmount: {
      fontSize: theme.typography.fontSize.md,
      color: theme.colors.textSecondary,
      marginTop: theme.spacing.xs,
    },
    statusBadge: {
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.borderRadius.sm,
    },
    statusText: {
      fontSize: theme.typography.fontSize.xs,
      fontWeight: theme.typography.fontWeight.semibold,
    },
    progressContainer: {
      marginBottom: theme.spacing.md,
    },
    progressBar: {
      height: 8,
      backgroundColor: theme.colors.backgroundTertiary,
      borderRadius: 4,
      overflow: 'hidden',
      marginBottom: theme.spacing.xs,
    },
    progressFill: {
      height: '100%',
      borderRadius: 4,
    },
    progressText: {
      fontSize: theme.typography.fontSize.xs,
      color: theme.colors.textTertiary,
      textAlign: 'right',
    },
    loanInfo: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    loanInfoItem: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    loanInfoText: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.textSecondary,
      marginLeft: theme.spacing.xs,
    },
    emptyState: {
      alignItems: 'center',
      padding: theme.spacing.xl,
    },
    emptyStateTitle: {
      fontSize: theme.typography.fontSize.lg,
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.text,
      marginTop: theme.spacing.md,
    },
    emptyStateText: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginTop: theme.spacing.xs,
      marginBottom: theme.spacing.lg,
    },
    emptyStateButton: {
      minWidth: 200,
    },
    disclaimer: {
      marginTop: theme.spacing.lg,
    },
  });

export default DashboardScreen;
