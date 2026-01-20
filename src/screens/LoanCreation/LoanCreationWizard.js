import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContextLocal';
import useLocalStorage from '../../hooks/useLocalStorage';

// Steps
import Step1LoanDetails from './Step1LoanDetails';
import Step2AmortizationSchedule from './Step2AmortizationSchedule';
import Step3SelectBorrower from './Step3SelectBorrower';
import Step4ContractReview from './Step4ContractReview';

// Components
import LegalDisclaimer from '../../components/common/LegalDisclaimer';

// Utils
import { generateAmortizationSchedule } from '../../utils/loanCalculations';

/**
 * Loan Creation Wizard
 * 4-step process to create a new loan
 */
const LoanCreationWizard = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const { user } = useAuth();
  const { createLoan, loading } = useLocalStorage();

  const [currentStep, setCurrentStep] = useState(1);
  const [loanData, setLoanData] = useState({
    // Step 1: Loan Details
    amount: '',
    durationMonths: '',
    annualInterestRate: '',

    // Step 2: Amortization Schedule (auto-generated)
    emis: [],

    // Step 3: Borrower
    borrowerId: '',
    borrowerName: '',
    borrowerEmail: '',
    borrowerPhone: '',

    // Step 4: Contract (auto-generated)
    // This step just reviews everything

    // Metadata
    lenderId: user?.uid || '',
    lenderName: user?.displayName || user?.email || '',
  });

  const styles = createStyles(theme);

  // Update loan data
  const updateLoanData = (updates) => {
    setLoanData((prev) => ({ ...prev, ...updates }));
  };

  // Navigate to next step
  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  // Navigate to previous step
  const previousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Handle completion of Step 1
  const handleStep1Complete = (data) => {
    // Generate amortization schedule
    const schedule = generateAmortizationSchedule(
      parseFloat(data.amount),
      parseFloat(data.annualInterestRate),
      parseInt(data.durationMonths)
    );

    updateLoanData({
      amount: parseFloat(data.amount),
      durationMonths: parseInt(data.durationMonths),
      annualInterestRate: parseFloat(data.annualInterestRate),
      emis: schedule,
    });

    nextStep();
  };

  // Handle completion of Step 2
  const handleStep2Complete = () => {
    nextStep();
  };

  // Handle completion of Step 3
  const handleStep3Complete = (borrowerData) => {
    updateLoanData(borrowerData);
    nextStep();
  };

  // Handle final submission (Step 4)
  const handleFinalSubmit = async () => {
    try {
      const newLoan = await createLoan({
        ...loanData,
        createdAt: new Date().toISOString(),
      });

      if (newLoan) {
        // Navigate back to dashboard
        navigation.navigate('Home', { screen: 'Dashboard' });
      }
    } catch (error) {
      console.error('Error creating loan:', error);
    }
  };

  // Render current step
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Step1LoanDetails
            initialData={loanData}
            onComplete={handleStep1Complete}
            onCancel={() => navigation.goBack()}
          />
        );
      case 2:
        return (
          <Step2AmortizationSchedule
            schedule={loanData.emis}
            amount={loanData.amount}
            interestRate={loanData.annualInterestRate}
            duration={loanData.durationMonths}
            onNext={handleStep2Complete}
            onBack={previousStep}
          />
        );
      case 3:
        return (
          <Step3SelectBorrower
            initialData={loanData}
            onComplete={handleStep3Complete}
            onBack={previousStep}
          />
        );
      case 4:
        return (
          <Step4ContractReview
            loanData={loanData}
            onSubmit={handleFinalSubmit}
            onBack={previousStep}
            loading={loading}
          />
        );
      default:
        return null;
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={100}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {renderStep()}

        {/* Legal Disclaimer at bottom */}
        <LegalDisclaimer style={styles.disclaimer} />
      </ScrollView>
    </KeyboardAvoidingView>
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
    disclaimer: {
      marginTop: theme.spacing.xl,
      marginBottom: theme.spacing.lg,
    },
  });

export default LoanCreationWizard;
