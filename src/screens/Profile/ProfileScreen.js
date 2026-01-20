import React from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';

/**
 * Profile Screen
 * User profile with theme toggle and logout
 */
const ProfileScreen = () => {
  const { theme, isDarkMode, toggleTheme } = useTheme();
  const { user, userProfile, signOut } = useAuth();

  const styles = createStyles(theme);

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          try {
            await signOut();
          } catch (error) {
            Alert.alert('Error', 'Failed to logout');
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <Card style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {userProfile?.name?.charAt(0).toUpperCase() ||
                user?.email?.charAt(0).toUpperCase() ||
                'U'}
            </Text>
          </View>

          <Text style={styles.name}>
            {userProfile?.name || 'User'}
          </Text>
          <Text style={styles.email}>{user?.email}</Text>
        </Card>

        {/* Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>

          <Card style={styles.settingCard}>
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Ionicons
                  name={isDarkMode ? 'moon' : 'sunny'}
                  size={24}
                  color={theme.colors.primary}
                />
                <View style={styles.settingInfo}>
                  <Text style={styles.settingTitle}>Dark Mode</Text>
                  <Text style={styles.settingDescription}>
                    {isDarkMode ? 'Enabled' : 'Disabled'}
                  </Text>
                </View>
              </View>

              <Button
                title={isDarkMode ? 'Disable' : 'Enable'}
                onPress={toggleTheme}
                variant="outline"
                size="small"
              />
            </View>
          </Card>
        </View>

        {/* App Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>

          <Card style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Ionicons
                name="information-circle-outline"
                size={20}
                color={theme.colors.textTertiary}
              />
              <Text style={styles.infoText}>Version 1.0.0</Text>
            </View>

            <View style={styles.infoRow}>
              <Ionicons
                name="shield-checkmark-outline"
                size={20}
                color={theme.colors.textTertiary}
              />
              <Text style={styles.infoText}>
                This is a record-keeping tool only
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Ionicons
                name="people-outline"
                size={20}
                color={theme.colors.textTertiary}
              />
              <Text style={styles.infoText}>
                For small communities (up to 10 people)
              </Text>
            </View>
          </Card>
        </View>

        {/* Logout Button */}
        <Button
          title="Logout"
          onPress={handleLogout}
          variant="outline"
          style={styles.logoutButton}
          icon={
            <Ionicons
              name="log-out-outline"
              size={20}
              color={theme.colors.error}
              style={{ marginRight: 8 }}
            />
          }
          textStyle={{ color: theme.colors.error }}
        />
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
    profileCard: {
      alignItems: 'center',
      marginBottom: theme.spacing.xl,
    },
    avatar: {
      width: 96,
      height: 96,
      borderRadius: 48,
      backgroundColor: theme.colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: theme.spacing.md,
    },
    avatarText: {
      fontSize: theme.typography.fontSize.huge,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.textInverse,
    },
    name: {
      fontSize: theme.typography.fontSize.xxl,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.text,
      marginBottom: theme.spacing.xs,
    },
    email: {
      fontSize: theme.typography.fontSize.md,
      color: theme.colors.textSecondary,
    },
    section: {
      marginBottom: theme.spacing.xl,
    },
    sectionTitle: {
      fontSize: theme.typography.fontSize.lg,
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.text,
      marginBottom: theme.spacing.md,
    },
    settingCard: {
      padding: theme.spacing.md,
    },
    settingRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    settingLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    settingInfo: {
      marginLeft: theme.spacing.md,
    },
    settingTitle: {
      fontSize: theme.typography.fontSize.md,
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.text,
    },
    settingDescription: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.textSecondary,
      marginTop: theme.spacing.xs,
    },
    infoCard: {
      padding: theme.spacing.md,
    },
    infoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: theme.spacing.sm,
    },
    infoText: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.textSecondary,
      marginLeft: theme.spacing.sm,
    },
    logoutButton: {
      marginTop: theme.spacing.lg,
      marginBottom: theme.spacing.xl,
      borderColor: theme.colors.error,
    },
  });

export default ProfileScreen;
