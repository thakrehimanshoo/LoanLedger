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
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { auth } from '../../config/firebase';
import useFirebase from '../../hooks/useFirebase';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

/**
 * Login Screen
 * Email/Password authentication with Firebase
 */
const LoginScreen = () => {
  const { theme } = useTheme();
  const { saveUserProfile } = useFirebase();

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
      await signInWithEmailAndPassword(auth, email, password);
      // Auth state change will be handled by AuthContext
    } catch (error) {
      console.error('Login error:', error);
      let errorMessage = 'Failed to login';

      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many attempts. Please try again later';
      }

      Alert.alert('Login Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Handle signup
  const handleSignup = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      // Create user profile in Firestore
      await saveUserProfile(userCredential.user.uid, {
        name: name.trim(),
        email: email.toLowerCase(),
        createdAt: new Date().toISOString(),
      });

      // Auth state change will be handled by AuthContext
    } catch (error) {
      console.error('Signup error:', error);
      let errorMessage = 'Failed to create account';

      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'An account with this email already exists';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak';
      }

      Alert.alert('Signup Failed', errorMessage);
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
      await sendPasswordResetEmail(auth, email);
      Alert.alert(
        'Password Reset',
        'A password reset link has been sent to your email'
      );
    } catch (error) {
      console.error('Password reset error:', error);
      Alert.alert('Error', 'Failed to send password reset email');
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
            LoanLedger is a record-keeping tool for small community lending. No
            money is transferred through this app.
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
    },
    infoText: {
      flex: 1,
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.text,
      marginLeft: theme.spacing.sm,
      lineHeight: theme.typography.lineHeight.relaxed * theme.typography.fontSize.sm,
    },
  });

export default LoginScreen;
