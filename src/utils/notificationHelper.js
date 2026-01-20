/**
 * Notification Helper
 * Mock logic for sending 7-day, 3-day, and 1-day reminders
 *
 * In a production app, this would integrate with:
 * - Expo Notifications for local/push notifications
 * - Email service (SendGrid, AWS SES, etc.)
 * - SMS service (Twilio, etc.)
 *
 * For now, this provides the logic to identify which EMIs need reminders
 */

import { getDaysUntilDue } from './loanCalculations';

/**
 * Check if an EMI needs a reminder notification
 * Returns the reminder type: '7day', '3day', '1day', or null
 */
export const getEMIReminderType = (emi) => {
  if (emi.paid) {
    return null; // No reminder needed for paid EMIs
  }

  const daysUntilDue = getDaysUntilDue(emi.dueDate);

  // Check if EMI is overdue
  if (daysUntilDue < 0) {
    return 'overdue';
  }

  // Check for reminder thresholds
  if (daysUntilDue === 7) {
    return '7day';
  } else if (daysUntilDue === 3) {
    return '3day';
  } else if (daysUntilDue === 1) {
    return '1day';
  }

  return null;
};

/**
 * Get all EMIs that need reminders from a list of loans
 */
export const getEMIsNeedingReminders = (loans) => {
  const reminders = {
    sevenDay: [],
    threeDay: [],
    oneDay: [],
    overdue: [],
  };

  loans.forEach((loan) => {
    if (!loan.emis || loan.status === 'completed') {
      return;
    }

    loan.emis.forEach((emi, index) => {
      const reminderType = getEMIReminderType(emi);

      if (reminderType) {
        const reminderData = {
          loan,
          emi,
          emiIndex: index,
        };

        switch (reminderType) {
          case '7day':
            reminders.sevenDay.push(reminderData);
            break;
          case '3day':
            reminders.threeDay.push(reminderData);
            break;
          case '1day':
            reminders.oneDay.push(reminderData);
            break;
          case 'overdue':
            reminders.overdue.push(reminderData);
            break;
        }
      }
    });
  });

  return reminders;
};

/**
 * Mock function to send email notification
 * In production, this would call an email service
 */
export const sendEmailReminder = async (recipientEmail, reminderData) => {
  console.log('📧 MOCK EMAIL NOTIFICATION');
  console.log('To:', recipientEmail);
  console.log('Subject: Loan Payment Reminder - LoanLedger');
  console.log('Reminder Type:', reminderData.type);
  console.log('Loan ID:', reminderData.loanId);
  console.log('EMI Amount:', reminderData.emiAmount);
  console.log('Due Date:', reminderData.dueDate);
  console.log('Days Until Due:', reminderData.daysUntilDue);

  // In production:
  // await emailService.send({
  //   to: recipientEmail,
  //   subject: 'Loan Payment Reminder',
  //   template: 'emi-reminder',
  //   data: reminderData,
  // });

  return true;
};

/**
 * Mock function to send SMS notification
 * In production, this would call an SMS service
 */
export const sendSMSReminder = async (phoneNumber, reminderData) => {
  console.log('📱 MOCK SMS NOTIFICATION');
  console.log('To:', phoneNumber);
  console.log('Message:');
  console.log(
    `LoanLedger Reminder: EMI of ${reminderData.emiAmount} is due in ${reminderData.daysUntilDue} days (${reminderData.dueDate})`
  );

  // In production:
  // await smsService.send({
  //   to: phoneNumber,
  //   message: `LoanLedger: EMI of ${reminderData.emiAmount} due in ${reminderData.daysUntilDue} days`,
  // });

  return true;
};

/**
 * Mock function to send push notification
 * In production, this would use Expo Notifications
 */
export const sendPushNotification = async (userId, reminderData) => {
  console.log('🔔 MOCK PUSH NOTIFICATION');
  console.log('User ID:', userId);
  console.log('Title:', reminderData.title);
  console.log('Body:', reminderData.body);
  console.log('Data:', reminderData.data);

  // In production with Expo:
  // await Notifications.scheduleNotificationAsync({
  //   content: {
  //     title: reminderData.title,
  //     body: reminderData.body,
  //     data: reminderData.data,
  //   },
  //   trigger: null, // Send immediately
  // });

  return true;
};

/**
 * Process all pending reminders for a user's loans
 * This would typically be called from a background task or cloud function
 */
export const processLoanReminders = async (loans, userContact) => {
  const reminders = getEMIsNeedingReminders(loans);
  const notifications = [];

  // Process 7-day reminders
  for (const reminder of reminders.sevenDay) {
    const daysUntilDue = getDaysUntilDue(reminder.emi.dueDate);

    const reminderData = {
      type: '7day',
      loanId: reminder.loan.id,
      borrowerName: reminder.loan.borrowerName,
      emiAmount: reminder.emi.emi,
      dueDate: reminder.emi.dueDate,
      daysUntilDue,
      title: 'Loan Payment Reminder',
      body: `EMI of ₹${reminder.emi.emi} for ${reminder.loan.borrowerName} is due in 7 days`,
      data: {
        loanId: reminder.loan.id,
        emiIndex: reminder.emiIndex,
      },
    };

    notifications.push(reminderData);

    // Send notifications
    if (userContact.email) {
      await sendEmailReminder(userContact.email, reminderData);
    }
    if (userContact.phone) {
      await sendSMSReminder(userContact.phone, reminderData);
    }
  }

  // Process 3-day reminders
  for (const reminder of reminders.threeDay) {
    const daysUntilDue = getDaysUntilDue(reminder.emi.dueDate);

    const reminderData = {
      type: '3day',
      loanId: reminder.loan.id,
      borrowerName: reminder.loan.borrowerName,
      emiAmount: reminder.emi.emi,
      dueDate: reminder.emi.dueDate,
      daysUntilDue,
      title: 'Urgent: Loan Payment Reminder',
      body: `EMI of ₹${reminder.emi.emi} for ${reminder.loan.borrowerName} is due in 3 days`,
      data: {
        loanId: reminder.loan.id,
        emiIndex: reminder.emiIndex,
      },
    };

    notifications.push(reminderData);

    if (userContact.email) {
      await sendEmailReminder(userContact.email, reminderData);
    }
    if (userContact.phone) {
      await sendSMSReminder(userContact.phone, reminderData);
    }
  }

  // Process 1-day reminders
  for (const reminder of reminders.oneDay) {
    const daysUntilDue = getDaysUntilDue(reminder.emi.dueDate);

    const reminderData = {
      type: '1day',
      loanId: reminder.loan.id,
      borrowerName: reminder.loan.borrowerName,
      emiAmount: reminder.emi.emi,
      dueDate: reminder.emi.dueDate,
      daysUntilDue,
      title: 'URGENT: Payment Due Tomorrow',
      body: `EMI of ₹${reminder.emi.emi} for ${reminder.loan.borrowerName} is due tomorrow!`,
      data: {
        loanId: reminder.loan.id,
        emiIndex: reminder.emiIndex,
      },
    };

    notifications.push(reminderData);

    if (userContact.email) {
      await sendEmailReminder(userContact.email, reminderData);
    }
    if (userContact.phone) {
      await sendSMSReminder(userContact.phone, reminderData);
    }
  }

  // Process overdue reminders
  for (const reminder of reminders.overdue) {
    const daysUntilDue = getDaysUntilDue(reminder.emi.dueDate);

    const reminderData = {
      type: 'overdue',
      loanId: reminder.loan.id,
      borrowerName: reminder.loan.borrowerName,
      emiAmount: reminder.emi.emi,
      dueDate: reminder.emi.dueDate,
      daysUntilDue,
      title: 'OVERDUE: Payment Required',
      body: `EMI of ₹${reminder.emi.emi} for ${reminder.loan.borrowerName} is ${Math.abs(daysUntilDue)} days overdue`,
      data: {
        loanId: reminder.loan.id,
        emiIndex: reminder.emiIndex,
      },
    };

    notifications.push(reminderData);

    if (userContact.email) {
      await sendEmailReminder(userContact.email, reminderData);
    }
    if (userContact.phone) {
      await sendSMSReminder(userContact.phone, reminderData);
    }
  }

  console.log(`📊 Processed ${notifications.length} reminders`);
  return notifications;
};

/**
 * Setup notification channels for the app
 * For Expo Notifications
 */
export const setupNotificationChannels = async () => {
  console.log('🔔 Setting up notification channels (mock)');

  // In production with Expo:
  // await Notifications.setNotificationChannelAsync('loan-reminders', {
  //   name: 'Loan Reminders',
  //   importance: Notifications.AndroidImportance.HIGH,
  //   sound: 'default',
  // });

  return true;
};

export default {
  getEMIReminderType,
  getEMIsNeedingReminders,
  sendEmailReminder,
  sendSMSReminder,
  sendPushNotification,
  processLoanReminders,
  setupNotificationChannels,
};
