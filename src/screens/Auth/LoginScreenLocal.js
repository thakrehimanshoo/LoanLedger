import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContextLocal';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

/**
 * Login Screen (Local Storage Version)
 * Email/Password authentication with Local Storage
 */
const LoginScreenLocal = () => {
  const { theme } = useTheme();
  const { signIn, signUp, resetPassword } = useAuth();

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const styles = createStyles(theme);

  // Validate inputs
  const validate = () => {
    const newErrors = {};

    if (!email || !email.includes('@')) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!password || password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!isLogin && (!name || name.trim().length === 0)) {
      newErrors.name = 'Please enter your name';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle login
  const handleLogin = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      await signIn(email, password);
      // Navigation will be handled by AuthContext
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Login Failed', error.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  // Handle signup
  const handleSignup = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      await signUp(email, password, name.trim());
      // Navigation will be handled by AuthContext
    } catch (error) {
      console.error('Signup error:', error);
      Alert.alert('Signup Failed', error.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  // Handle forgot password
  const handleForgotPassword = async () => {
    if (!email || !email.includes('@')) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    try {
      await resetPassword(email);
      Alert.alert(
        'Password Reset',
        'Password reset instructions logged to console (mock implementation)'
      );
    } catch (error) {
      console.error('Password reset error:', error);
      Alert.alert('Error', error.message || 'Failed to send password reset');
    }
  };

  // Toggle between login and signup
  const toggleMode = () => {
    setIsLogin(!isLogin);
    setErrors({});
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo/Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Ionicons name="wallet" size={64} color={theme.colors.primary} />
          </View>
          <Text style={styles.title}>LoanLedger</Text>
          <Text style={styles.subtitle}>
            P2P Community Lending Record-Keeper
          </Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>LOCAL STORAGE MODE</Text>
          </View>
        </View>

        {/* Auth Card */}
        <Card style={styles.authCard}>
          <Text style={styles.cardTitle}>
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </Text>
          <Text style={styles.cardSubtitle}>
            {isLogin
              ? 'Sign in to continue'
              : 'Sign up to start tracking loans'}
          </Text>

          {/* Name Input (Signup only) */}
          {!isLogin && (
            <Input
              label="Full Name"
              value={name}
              onChangeText={setName}
              placeholder="Enter your full name"
              error={errors.name}
              leftIcon={
                <Ionicons
                  name="person-outline"
                  size={20}
                  color={theme.colors.textTertiary}
                />
              }
            />
          )}

          {/* Email Input */}
          <Input
            label="Email Address"
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
            error={errors.email}
            leftIcon={
              <Ionicons
                name="mail-outline"
                size={20}
                color={theme.colors.textTertiary}
              />
            }
          />

          {/* Password Input */}
          <Input
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="Enter your password"
            secureTextEntry
            error={errors.password}
            helperText={
              !isLogin ? 'Must be at least 6 characters' : undefined
            }
            leftIcon={
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color={theme.colors.textTertiary}
              />
            }
          />

          {/* Forgot Password (Login only) */}
          {isLogin && (
            <Button
              title="Forgot Password?"
              onPress={handleForgotPassword}
              variant="ghost"
              size="small"
              style={styles.forgotButton}
            />
          )}

          {/* Submit Button */}
          <Button
            title={isLogin ? 'Sign In' : 'Create Account'}
            onPress={isLogin ? handleLogin : handleSignup}
            loading={loading}
            style={styles.submitButton}
          />

          {/* Toggle Mode */}
          <View style={styles.toggleContainer}>
            <Text style={styles.toggleText}>
              {isLogin
                ? "Don't have an account? "
                : 'Already have an account? '}
            </Text>
            <Button
              title={isLogin ? 'Sign Up' : 'Sign In'}
              onPress={toggleMode}
              variant="ghost"
              size="small"
            />
          </View>
        </Card>

        {/* Info Card */}
        <Card style={styles.infoCard}>
          <Ionicons
            name="information-circle"
            size={24}
            color={theme.colors.info}
          />
          <Text style={styles.infoText}>
            Running in LOCAL STORAGE mode. All data is stored on your device.
            No Firebase required!
          </Text>
        </Card>

        {/* Demo Card */}
        <Card style={styles.demoCard}>
          <Text style={styles.demoTitle}>Quick Demo</Text>
          <Text style={styles.demoText}>
            Create an account with any email (e.g., demo@test.com) and password
            (min 6 chars). Your data will be stored locally on this device.
          </Text>
        </Card>
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
      paddingTop: theme.spacing.xxxl,
    },
    header: {
      alignItems: 'center',
      marginBottom: theme.spacing.xl,
    },
    logoContainer: {
      width: 96,
      height: 96,
      borderRadius: 48,
      backgroundColor: theme.colors.primaryLight + '20',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: theme.spacing.md,
    },
    title: {
      fontSize: theme.typography.fontSize.xxxl,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.text,
      marginBottom: theme.spacing.xs,
    },
    subtitle: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.textSecondary,
      textAlign: 'center',
    },
    badge: {
      marginTop: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.xs,
      backgroundColor: theme.colors.success + '20',
      borderRadius: theme.borderRadius.full,
    },
    badgeText: {
      fontSize: theme.typography.fontSize.xs,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.success,
    },
    authCard: {
      marginBottom: theme.spacing.lg,
    },
    cardTitle: {
      fontSize: theme.typography.fontSize.xxl,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.text,
      marginBottom: theme.spacing.xs,
    },
    cardSubtitle: {
      fontSize: theme.typography.fontSize.md,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.xl,
    },
    forgotButton: {
      alignSelf: 'flex-end',
      marginTop: -theme.spacing.sm,
      marginBottom: theme.spacing.md,
    },
    submitButton: {
      marginTop: theme.spacing.md,
    },
    toggleContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: theme.spacing.md,
    },
    toggleText: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.textSecondary,
    },
    infoCard: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      backgroundColor: theme.colors.infoLight,
      marginBottom: theme.spacing.lg,
    },
    infoText: {
      flex: 1,
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.text,
      marginLeft: theme.spacing.sm,
      lineHeight:
        theme.typography.lineHeight.relaxed * theme.typography.fontSize.sm,
    },
    demoCard: {
      backgroundColor: theme.colors.successLight,
    },
    demoTitle: {
      fontSize: theme.typography.fontSize.md,
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.text,
      marginBottom: theme.spacing.sm,
    },
    demoText: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.text,
      lineHeight:
        theme.typography.lineHeight.relaxed * theme.typography.fontSize.sm,
    },
  });

export default LoginScreenLocal;
