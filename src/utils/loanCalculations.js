/**
 * Loan calculation utilities
 * Amortization schedule calculation and loan metrics
 */

/**
 * Calculate monthly EMI using the standard formula
 * EMI = P × r × (1 + r)^n / ((1 + r)^n - 1)
 * where:
 * P = Principal loan amount
 * r = Monthly interest rate (annual rate / 12 / 100)
 * n = Number of months
 */
export const calculateEMI = (principal, annualInterestRate, durationMonths) => {
  if (annualInterestRate === 0) {
    return principal / durationMonths;
  }

  const monthlyRate = annualInterestRate / 12 / 100;
  const emi =
    (principal * monthlyRate * Math.pow(1 + monthlyRate, durationMonths)) /
    (Math.pow(1 + monthlyRate, durationMonths) - 1);

  return Math.round(emi * 100) / 100; // Round to 2 decimal places
};

/**
 * Generate complete amortization schedule
 * Returns an array of EMI objects with principal, interest, and balance breakdown
 */
export const generateAmortizationSchedule = (
  principal,
  annualInterestRate,
  durationMonths,
  startDate = new Date()
) => {
  const schedule = [];
  const monthlyRate = annualInterestRate / 12 / 100;
  const emi = calculateEMI(principal, annualInterestRate, durationMonths);

  let balance = principal;
  let currentDate = new Date(startDate);

  for (let month = 1; month <= durationMonths; month++) {
    // Calculate interest for this month
    const interestAmount = balance * monthlyRate;

    // Calculate principal for this month
    const principalAmount = emi - interestAmount;

    // Update balance
    balance = Math.max(0, balance - principalAmount);

    // Due date is one month from current date
    const dueDate = new Date(currentDate);
    dueDate.setMonth(dueDate.getMonth() + 1);

    schedule.push({
      month,
      emi: Math.round(emi * 100) / 100,
      principal: Math.round(principalAmount * 100) / 100,
      interest: Math.round(interestAmount * 100) / 100,
      balance: Math.round(balance * 100) / 100,
      dueDate: dueDate.toISOString(),
      paid: false,
      paidDate: null,
    });

    currentDate = new Date(dueDate);
  }

  return schedule;
};

/**
 * Calculate total interest to be paid over the loan period
 */
export const calculateTotalInterest = (principal, annualInterestRate, durationMonths) => {
  const schedule = generateAmortizationSchedule(principal, annualInterestRate, durationMonths);
  const totalInterest = schedule.reduce((sum, emi) => sum + emi.interest, 0);
  return Math.round(totalInterest * 100) / 100;
};

/**
 * Calculate total amount to be paid (principal + interest)
 */
export const calculateTotalAmount = (principal, annualInterestRate, durationMonths) => {
  const totalInterest = calculateTotalInterest(principal, annualInterestRate, durationMonths);
  return Math.round((principal + totalInterest) * 100) / 100;
};

/**
 * Calculate loan progress percentage
 */
export const calculateLoanProgress = (emis) => {
  if (!emis || emis.length === 0) return 0;

  const paidCount = emis.filter((emi) => emi.paid).length;
  const progress = (paidCount / emis.length) * 100;

  return Math.round(progress * 100) / 100;
};

/**
 * Calculate next EMI due date
 */
export const getNextEMIDueDate = (emis) => {
  if (!emis || emis.length === 0) return null;

  const nextUnpaidEMI = emis.find((emi) => !emi.paid);
  return nextUnpaidEMI ? new Date(nextUnpaidEMI.dueDate) : null;
};

/**
 * Calculate total paid amount
 */
export const calculateTotalPaid = (emis) => {
  if (!emis || emis.length === 0) return 0;

  const totalPaid = emis
    .filter((emi) => emi.paid)
    .reduce((sum, emi) => sum + emi.emi, 0);

  return Math.round(totalPaid * 100) / 100;
};

/**
 * Calculate remaining amount
 */
export const calculateRemainingAmount = (emis) => {
  if (!emis || emis.length === 0) return 0;

  const totalRemaining = emis
    .filter((emi) => !emi.paid)
    .reduce((sum, emi) => sum + emi.emi, 0);

  return Math.round(totalRemaining * 100) / 100;
};

/**
 * Check if EMI is overdue
 */
export const isEMIOverdue = (emi) => {
  if (emi.paid) return false;

  const dueDate = new Date(emi.dueDate);
  const today = new Date();

  return today > dueDate;
};

/**
 * Get number of days until due date (negative if overdue)
 */
export const getDaysUntilDue = (dueDate) => {
  const today = new Date();
  const due = new Date(dueDate);

  const diffTime = due - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
};

/**
 * Format currency for display
 */
export const formatCurrency = (amount, currency = '₹') => {
  const formatted = new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);

  return `${currency}${formatted}`;
};

/**
 * Format date for display
 */
export const formatDate = (date, format = 'short') => {
  const d = new Date(date);

  if (format === 'short') {
    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
};

export default {
  calculateEMI,
  generateAmortizationSchedule,
  calculateTotalInterest,
  calculateTotalAmount,
  calculateLoanProgress,
  getNextEMIDueDate,
  calculateTotalPaid,
  calculateRemainingAmount,
  isEMIOverdue,
  getDaysUntilDue,
  formatCurrency,
  formatDate,
};
