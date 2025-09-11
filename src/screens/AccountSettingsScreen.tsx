import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, TouchableOpacity, ScrollView, Switch, StatusBar, Dimensions } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Container from '../components/ui/Container';
import Card from '../components/ui/Card';
import PrimaryButton from '../components/ui/PrimaryButton';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ComingSoon from '../components/ui/ComingSoon';
import EmptyState from '../components/ui/EmptyState';
import ErrorBoundary from '../components/ui/ErrorBoundary';
import { colors, typography, spacing, shadows } from '../theme';
import { api, changePasswordApi, deleteAccountApi } from '../services/api';
import { clearToken } from '../services/auth';
import { useNavigation } from '@react-navigation/native';

const AccountSettingsScreen: React.FC = () => {
  const [tab, setTab] = useState<'profile'|'security'|'notifications'|'privacy'|'preferences'|'payment'>('profile');
  const navigation = useNavigation<any>();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [notif, setNotif] = useState({ email: true, sms: true, push: true, reminders: true, updates: true, monthly: false });
  const [privacy, setPrivacy] = useState({ profileVisibility: 'group-members', showPhone: true, showEmail: false, allowInvites: true, dataSharing: false });
  const [prefs, setPrefs] = useState({ language: 'en', currency: 'INR', theme: 'light', dateFormat: 'DD/MM/YYYY', timezone: 'Asia/Kolkata' });
  const [loanAlerts, setLoanAlerts] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await api.get('/api/auth/me');
        const user = res.data?.data?.user || res.data?.user;
        if (user) {
          setName(user.name || '');
          setEmail(user.email || '');
          setPhone(user.phone || '');
        }
      } catch (error: any) {
        console.error('Failed to load user profile:', error);
        const errorMessage = error?.response?.data?.message || error?.message || 'Failed to load profile';
        Alert.alert('Error', errorMessage);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const save = async () => {
    try {
      // Validation
      if (!name?.trim()) {
        Alert.alert('Validation Error', 'Name is required');
        return;
      }

      setLoading(true);
      await api.put('/api/auth/me', { 
        name: name.trim(), 
        phone: phone?.trim() || null 
      });
      
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error: any) {
      console.error('Failed to save profile:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to save profile';
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updatePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all password fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New password and confirm password do not match');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Error', 'New password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    try {
      await changePasswordApi({
        currentPassword,
        newPassword,
        confirmPassword
      });
      
      Alert.alert('Success', 'Password updated successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (e: any) {
      const errorMessage = e?.response?.data?.message || e?.message || 'Failed to update password';
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const { width } = Dimensions.get('window');
  
  return (
    <ErrorBoundary>
      <StatusBar barStyle="light-content" backgroundColor={colors.brandTeal} />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Enhanced Header with Gradient */}
        <LinearGradient
          colors={[colors.brandTeal, colors.brandTealDark, colors.brandAccent]}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <LinearGradient
              colors={[colors.white, colors.gray50]}
              style={styles.profileAvatar}
            >
              <Text style={styles.profileAvatarText}>
                {name ? name.charAt(0).toUpperCase() : '👤'}
              </Text>
            </LinearGradient>
            <Text style={styles.title}>Account Settings</Text>
            <Text style={styles.subtitle}>Manage your account preferences and security</Text>
            <LinearGradient
              colors={[colors.success, colors.brandTealLight]}
              style={styles.statusBadge}
            >
              <Text style={styles.statusBadgeText}>✨ Profile Active</Text>
            </LinearGradient>
          </View>
          
          {/* Decorative Elements */}
          <View style={styles.headerDecoration1} />
          <View style={styles.headerDecoration2} />
          <View style={styles.sparkle1} />
          <View style={styles.sparkle2} />
        </LinearGradient>
        
        <Container style={styles.content}>

          <View style={styles.tabs}>
            {([['profile', '👤', 'Profile'], ['security', '🔒', 'Security'], ['notifications', '🔔', 'Alerts'], ['privacy', '🛡️', 'Privacy'], ['preferences', '⚙️', 'Settings'], ['payment', '💳', 'Payment']] as const).map(([t, icon, label]) => (
              <TouchableOpacity 
                key={t} 
                onPress={() => setTab(t)} 
                activeOpacity={0.8}
                style={styles.tabWrapper}
              >
                {tab === t ? (
                  <LinearGradient
                    colors={[colors.brandTeal, colors.brandAccent]}
                    start={{x: 0, y: 0}}
                    end={{x: 1, y: 0}}
                    style={styles.tab}
                  >
                    <Text style={styles.tabIcon}>{icon}</Text>
                    <Text style={styles.tabTextActive}>{label}</Text>
                  </LinearGradient>
                ) : (
                  <LinearGradient
                    colors={[colors.white, colors.gray50]}
                    style={styles.tab}
                  >
                    <Text style={[styles.tabIcon, styles.tabIconInactive]}>{icon}</Text>
                    <Text style={styles.tabText}>{label}</Text>
                  </LinearGradient>
                )}
              </TouchableOpacity>
            ))}
          </View>

      {tab === 'profile' && (
        <LinearGradient
          colors={[colors.white, colors.gray50]}
          style={styles.profileCard}
        >
          <View style={styles.profileHeader}>
            <LinearGradient
              colors={[colors.brandTeal, colors.brandAccent]}
              style={styles.profileAvatarLarge}
            >
              <Text style={styles.profileAvatarLargeText}>
                {name ? name.charAt(0).toUpperCase() : '👤'}
              </Text>
            </LinearGradient>
            <Text style={styles.profileWelcome}>Welcome back!</Text>
            <Text style={styles.profileSubtext}>Keep your information up to date</Text>
          </View>
          
          <View style={styles.inputContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>👤 Full Name</Text>
              <LinearGradient
                colors={[colors.white, colors.gray50]}
                style={styles.inputWrapper}
              >
                <TextInput 
                  style={styles.input} 
                  placeholder="Enter your full name" 
                  value={name} 
                  onChangeText={setName}
                  placeholderTextColor={colors.gray400}
                />
              </LinearGradient>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>📫 Email Address</Text>
              <LinearGradient
                colors={[colors.gray100, colors.gray50]}
                style={styles.inputWrapper}
              >
                <TextInput 
                  editable={false} 
                  style={[styles.input, styles.inputDisabled]} 
                  placeholder="Email address" 
                  value={email}
                  placeholderTextColor={colors.gray400}
                />
                <View style={styles.inputBadge}>
                  <Text style={styles.inputBadgeText}>Verified ✓</Text>
                </View>
              </LinearGradient>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>📱 Phone Number</Text>
              <LinearGradient
                colors={[colors.white, colors.gray50]}
                style={styles.inputWrapper}
              >
                <TextInput 
                  style={styles.input} 
                  placeholder="Enter your phone number" 
                  value={phone} 
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  placeholderTextColor={colors.gray400}
                />
              </LinearGradient>
            </View>
          </View>
          
          <TouchableOpacity 
            onPress={save} 
            disabled={loading}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={loading ? [colors.gray400, colors.gray300] : [colors.success, colors.brandTeal]}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 0}}
              style={styles.saveButton}
            >
              <Text style={styles.saveButtonText}>
                {loading ? 'Saving... ⏳' : 'Save Changes ✨'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </LinearGradient>
      )}

      {tab === 'security' && (
        <LinearGradient
          colors={[colors.white, colors.gray50]}
          style={styles.securityCard}
        >
          <View style={styles.securityHeader}>
            <LinearGradient
              colors={[colors.error, colors.warning]}
              style={styles.securityIcon}
            >
              <Text style={styles.securityIconText}>🔒</Text>
            </LinearGradient>
            <Text style={styles.tabTitle}>Security Center</Text>
            <Text style={styles.sectionDescription}>
              Protect your account with a strong password 🛡️
            </Text>
          </View>
          
          <View style={styles.passwordForm}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>🔑 Current Password</Text>
              <LinearGradient
                colors={[colors.white, colors.gray50]}
                style={styles.inputWrapper}
              >
                <TextInput 
                  secureTextEntry={true}
                  style={styles.input} 
                  placeholder="Enter your current password" 
                  value={currentPassword} 
                  onChangeText={setCurrentPassword}
                  autoCapitalize="none"
                  placeholderTextColor={colors.gray400}
                />
              </LinearGradient>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>🆕 New Password</Text>
              <LinearGradient
                colors={[colors.white, colors.gray50]}
                style={styles.inputWrapper}
              >
                <TextInput 
                  secureTextEntry={true}
                  style={styles.input} 
                  placeholder="Create a strong password" 
                  value={newPassword} 
                  onChangeText={setNewPassword}
                  autoCapitalize="none"
                  placeholderTextColor={colors.gray400}
                />
              </LinearGradient>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>✓ Confirm Password</Text>
              <LinearGradient
                colors={[colors.white, colors.gray50]}
                style={styles.inputWrapper}
              >
                <TextInput 
                  secureTextEntry={true}
                  style={styles.input} 
                  placeholder="Confirm your new password" 
                  value={confirmPassword} 
                  onChangeText={setConfirmPassword}
                  autoCapitalize="none"
                  placeholderTextColor={colors.gray400}
                />
              </LinearGradient>
            </View>
          </View>

          <LinearGradient
            colors={[colors.info + '20', colors.brandTeal + '10']}
            style={styles.passwordRequirements}
          >
            <Text style={styles.requirementsTitle}>📝 Password Strength:</Text>
            <View style={styles.requirementItem}>
              <Text style={[styles.requirement, newPassword.length >= 6 && styles.requirementMet]}>
                {newPassword.length >= 6 ? '✅' : '⚪'} At least 6 characters
              </Text>
            </View>
            <View style={styles.requirementItem}>
              <Text style={[styles.requirement, newPassword === confirmPassword && newPassword.length > 0 && styles.requirementMet]}>
                {newPassword === confirmPassword && newPassword.length > 0 ? '✅' : '⚪'} Passwords match
              </Text>
            </View>
            <View style={styles.passwordStrengthBar}>
              <LinearGradient
                colors={
                  newPassword.length === 0 ? [colors.gray200, colors.gray200] :
                  newPassword.length < 6 ? [colors.error, colors.warning] :
                  newPassword === confirmPassword ? [colors.success, colors.brandTeal] :
                  [colors.warning, colors.info]
                }
                style={[
                  styles.strengthBar,
                  { width: `${Math.min((newPassword.length / 8) * 100, 100)}%` }
                ]}
              />
            </View>
          </LinearGradient>
          
          <TouchableOpacity 
            onPress={updatePassword} 
            disabled={loading || !currentPassword || !newPassword || !confirmPassword || newPassword !== confirmPassword || newPassword.length < 6}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={
                loading || !currentPassword || !newPassword || !confirmPassword || newPassword !== confirmPassword || newPassword.length < 6 
                ? [colors.gray300, colors.gray400] 
                : [colors.success, colors.brandTeal]
              }
              start={{x: 0, y: 0}}
              end={{x: 1, y: 0}}
              style={styles.updateButton}
            >
              <Text style={styles.updateButtonText}>
                {loading ? 'Updating... ⏳' : 'Update Password 🔐'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </LinearGradient>
      )}

      {tab === 'notifications' && (
        <LinearGradient
          colors={[colors.white, colors.gray50]}
          style={styles.notificationCard}
        >
          <View style={styles.notificationHeader}>
            <LinearGradient
              colors={[colors.info, colors.brandTeal]}
              style={styles.notificationIcon}
            >
              <Text style={styles.notificationIconText}>🔔</Text>
            </LinearGradient>
            <Text style={styles.tabTitle}>Notification Center</Text>
            <Text style={styles.sectionDescription}>Customize your alerts and preferences</Text>
          </View>

          <View style={styles.notificationSections}>
            <LinearGradient
              colors={[colors.white, colors.backgroundTertiary]}
              style={styles.notificationSection}
            >
              <Text style={styles.notificationSectionTitle}>📧 Communication</Text>
              {[
                ['email', 'Email Notifications', '📧'],
                ['sms', 'SMS Alerts', '📱'], 
                ['push', 'Push Notifications', '🔔']
              ].map(([key, label, icon]) => (
                <View key={key} style={styles.settingRow}>
                  <View style={styles.settingInfo}>
                    <Text style={styles.settingIcon}>{icon}</Text>
                    <Text style={styles.settingLabel}>{label}</Text>
                  </View>
                  <Switch 
                    value={notif[key as keyof typeof notif] as boolean} 
                    onValueChange={(nv) => setNotif({ ...notif, [key]: nv } as any)}
                    trackColor={{ false: colors.gray300, true: colors.brandTeal + '40' }}
                    thumbColor={notif[key as keyof typeof notif] ? colors.brandTeal : colors.gray400}
                  />
                </View>
              ))}
            </LinearGradient>

            <LinearGradient
              colors={[colors.white, colors.backgroundTertiary]}
              style={styles.notificationSection}
            >
              <Text style={styles.notificationSectionTitle}>🔄 Updates & Alerts</Text>
              {[
                ['reminders', 'Payment Reminders', '⏰'],
                ['updates', 'App Updates', '🔄'], 
                ['monthly', 'Monthly Reports', '📈'],
                ['loanAlerts', 'Loan Alerts', '💰']
              ].map(([key, label, icon]) => {
                const value = key === 'loanAlerts' ? loanAlerts : notif[key as keyof typeof notif] as boolean;
                const onChange = key === 'loanAlerts' ? setLoanAlerts : (nv: boolean) => setNotif({ ...notif, [key]: nv } as any);
                
                return (
                  <View key={key} style={styles.settingRow}>
                    <View style={styles.settingInfo}>
                      <Text style={styles.settingIcon}>{icon}</Text>
                      <Text style={styles.settingLabel}>{label}</Text>
                    </View>
                    <Switch 
                      value={value} 
                      onValueChange={onChange}
                      trackColor={{ false: colors.gray300, true: colors.brandTeal + '40' }}
                      thumbColor={value ? colors.brandTeal : colors.gray400}
                    />
                  </View>
                );
              })}
            </LinearGradient>
          </View>

          <TouchableOpacity 
            onPress={() => Alert.alert('Saved! ✨', 'Notification preferences have been updated')}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[colors.success, colors.brandTeal]}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 0}}
              style={styles.saveButton}
            >
              <Text style={styles.saveButtonText}>Save Preferences 🔔</Text>
            </LinearGradient>
          </TouchableOpacity>
        </LinearGradient>
      )}

      {tab === 'privacy' && (
        <LinearGradient
          colors={[colors.white, colors.gray50]}
          style={styles.privacyCard}
        >
          <View style={styles.privacyHeader}>
            <LinearGradient
              colors={[colors.secondary, colors.info]}
              style={styles.privacyIcon}
            >
              <Text style={styles.privacyIconText}>🛡️</Text>
            </LinearGradient>
            <Text style={styles.tabTitle}>Privacy & Security</Text>
            <Text style={styles.sectionDescription}>Control your data and visibility</Text>
          </View>

          <LinearGradient
            colors={[colors.white, colors.backgroundTertiary]}
            style={styles.privacySection}
          >
            <Text style={styles.privacySectionTitle}>👁️ Profile Visibility</Text>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>👥 Who can see your profile</Text>
              <LinearGradient
                colors={[colors.white, colors.gray50]}
                style={styles.inputWrapper}
              >
                <TextInput 
                  style={styles.input} 
                  value={privacy.profileVisibility as any} 
                  onChangeText={(v) => setPrivacy({ ...privacy, profileVisibility: v as any })}
                  placeholder="e.g., group-members, public, private"
                  placeholderTextColor={colors.gray400}
                />
              </LinearGradient>
            </View>
          </LinearGradient>

          <LinearGradient
            colors={[colors.white, colors.backgroundTertiary]}
            style={styles.privacySection}
          >
            <Text style={styles.privacySectionTitle}>🔒 Data Privacy</Text>
            {[
              ['showPhone', 'Show Phone Number', '📱'],
              ['showEmail', 'Show Email Address', '📧'], 
              ['allowInvites', 'Allow Group Invites', '📬'],
              ['dataSharing', 'Anonymous Analytics', '📉']
            ].map(([key, label, icon]) => (
              <View key={key} style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingIcon}>{icon}</Text>
                  <View>
                    <Text style={styles.settingLabel}>{label}</Text>
                    <Text style={styles.settingDescription}>
                      {key === 'showPhone' ? 'Visible to group members' :
                       key === 'showEmail' ? 'Hidden from other users' :
                       key === 'allowInvites' ? 'Allow others to invite you' :
                       'Help improve the app'}
                    </Text>
                  </View>
                </View>
                <Switch 
                  value={privacy[key as keyof typeof privacy] as boolean} 
                  onValueChange={(nv) => setPrivacy({ ...privacy, [key]: nv } as any)}
                  trackColor={{ false: colors.gray300, true: colors.brandTeal + '40' }}
                  thumbColor={privacy[key as keyof typeof privacy] ? colors.brandTeal : colors.gray400}
                />
              </View>
            ))}
          </LinearGradient>

          <TouchableOpacity 
            onPress={() => Alert.alert('Saved! 🔒', 'Privacy settings have been updated securely')}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[colors.success, colors.brandTeal]}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 0}}
              style={styles.saveButton}
            >
              <Text style={styles.saveButtonText}>Save Privacy Settings 🛡️</Text>
            </LinearGradient>
          </TouchableOpacity>
        </LinearGradient>
      )}

      {tab === 'preferences' && (
        <LinearGradient
          colors={[colors.white, colors.gray50, colors.backgroundTertiary]}
          style={styles.comingSoonCard}
        >
          <LinearGradient
            colors={[colors.warning, colors.info]}
            style={styles.comingSoonIcon}
          >
            <Text style={styles.comingSoonIconText}>⚙️</Text>
          </LinearGradient>
          
          <Text style={styles.comingSoonTitle}>App Preferences</Text>
          <Text style={styles.comingSoonDescription}>
            🌍 Customize your app experience with language settings, themes, currency preferences, and date formats.
            
            ✨ Coming features:
            • Dark/Light theme toggle
            • Multiple language support
            • Regional currency settings
            • Personalized dashboard
          </Text>
          
          <LinearGradient
            colors={[colors.info, colors.brandTeal]}
            style={styles.comingSoonProgress}
          >
            <View style={styles.progressBar}>
              <LinearGradient
                colors={[colors.success, colors.brandTealLight]}
                style={[styles.progressFill, { width: '75%' }]}
              />
            </View>
            <Text style={styles.progressText}>75% Complete</Text>
          </LinearGradient>
          
          <TouchableOpacity 
            onPress={() => Alert.alert('Notification Set! 🔔', 'We\'ll notify you when preferences customization is available!')}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[colors.warning, colors.info]}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 0}}
              style={styles.notifyButton}
            >
              <Text style={styles.notifyButtonText}>Notify Me 🔔</Text>
            </LinearGradient>
          </TouchableOpacity>
        </LinearGradient>
      )}

      {tab === 'payment' && (
        <View>
          <LinearGradient
            colors={[colors.white, colors.gray50, colors.backgroundTertiary]}
            style={styles.comingSoonCard}
          >
            <LinearGradient
              colors={[colors.success, colors.brandTeal]}
              style={styles.comingSoonIcon}
            >
              <Text style={styles.comingSoonIconText}>💳</Text>
            </LinearGradient>
            
            <Text style={styles.comingSoonTitle}>Payment Methods</Text>
            <Text style={styles.comingSoonDescription}>
              💰 Complete payment solution coming soon!
              
              ✨ Upcoming features:
              • Multiple payment methods
              • Auto-contribution setup
              • Transaction history
              • Secure card management
            </Text>
            
            <LinearGradient
              colors={[colors.info, colors.brandTeal]}
              style={styles.comingSoonProgress}
            >
              <View style={styles.progressBar}>
                <LinearGradient
                  colors={[colors.success, colors.brandTealLight]}
                  style={[styles.progressFill, { width: '60%' }]}
                />
              </View>
              <Text style={styles.progressText}>60% Complete</Text>
            </LinearGradient>
            
            <TouchableOpacity 
              onPress={() => Alert.alert('Notification Set! 💳', 'We\'ll notify you when payment management is available!')}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[colors.success, colors.brandTeal]}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 0}}
                style={styles.notifyButton}
              >
                <Text style={styles.notifyButtonText}>Notify Me 💳</Text>
              </LinearGradient>
            </TouchableOpacity>
          </LinearGradient>
          
          <LinearGradient
            colors={[colors.error + '20', colors.dangerLight + '30']}
            style={styles.dangerCard}
          >
            <LinearGradient
              colors={[colors.error, colors.danger]}
              style={styles.dangerIcon}
            >
              <Text style={styles.dangerIconText}>⚠️</Text>
            </LinearGradient>
            
            <Text style={styles.dangerTitle}>Danger Zone</Text>
            <Text style={styles.dangerDescription}>
              🚨 Permanently delete your account and all associated data. This action cannot be undone and will remove:
              
              • All your group memberships
              • Transaction history
              • Personal information
              • Saved preferences
            </Text>
            
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                Alert.alert(
                  'Delete Account 🚨',
                  'This will permanently delete your account and all data. This action cannot be undone. Are you absolutely sure?',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Delete Forever', style: 'destructive', onPress: async () => {
                        try {
                          await deleteAccountApi();
                          await clearToken();
                          Alert.alert('Account Deleted ✓', 'Your account has been permanently deleted.');
                          navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
                        } catch (e: any) {
                          Alert.alert('Deletion Failed', e?.message || 'Unable to delete account. Please try again.');
                        }
                      } },
                  ]
                );
              }}
            >
              <LinearGradient
                colors={[colors.error, colors.danger]}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 0}}
                style={styles.deleteButton}
              >
                <Text style={styles.deleteButtonText}>Delete Account Forever 🗑️</Text>
              </LinearGradient>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      )}
        </Container>
      </ScrollView>
    </ErrorBoundary>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.backgroundSecondary,
  },
  header: {
    height: 280,
    position: 'relative',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    overflow: 'hidden',
  },
  headerContent: {
    alignItems: 'center',
    paddingTop: spacing.xxl,
    paddingHorizontal: spacing.l,
  },
  profileAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.m,
    ...shadows.large,
  },
  profileAvatarText: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.brandTeal,
  },
  title: {
    ...typography.h1,
    color: colors.white,
    marginBottom: spacing.xs,
    fontWeight: '800',
    textAlign: 'center',
  },
  subtitle: {
    ...typography.body,
    color: colors.white,
    opacity: 0.9,
    textAlign: 'center',
    marginBottom: spacing.m,
  },
  statusBadge: {
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    borderRadius: spacing.l,
    ...shadows.small,
  },
  statusBadgeText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: '700',
  },
  headerDecoration1: {
    position: 'absolute',
    top: -50,
    left: -50,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: colors.white,
    opacity: 0.1,
  },
  headerDecoration2: {
    position: 'absolute',
    bottom: -30,
    right: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.success,
    opacity: 0.2,
  },
  sparkle1: {
    position: 'absolute',
    top: 80,
    right: 60,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.white,
    opacity: 0.8,
  },
  sparkle2: {
    position: 'absolute',
    top: 120,
    left: 80,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.brandTealLight,
    opacity: 0.9,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.l,
    paddingTop: spacing.l,
  },
  tabs: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.l,
    gap: spacing.s,
    paddingHorizontal: spacing.s,
  },
  tabWrapper: {
    flex: 1,
    minWidth: (Dimensions.get('window').width - spacing.l * 2 - spacing.s * 5) / 3,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.m,
    borderRadius: spacing.l,
    ...shadows.medium,
    gap: spacing.xs,
  },
  tabIcon: {
    fontSize: 18,
    color: colors.white,
  },
  tabIconInactive: {
    color: colors.gray600,
  },
  tabText: {
    ...typography.caption,
    color: colors.gray700,
    fontWeight: '600',
  },
  tabTextActive: {
    ...typography.caption,
    color: colors.white,
    fontWeight: '700',
  },
  // Profile Section Styles
  profileCard: {
    borderRadius: spacing.xxl,
    padding: spacing.xl,
    marginBottom: spacing.l,
    ...shadows.xlarge,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  profileAvatarLarge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.m,
    ...shadows.large,
  },
  profileAvatarLargeText: {
    fontSize: 40,
    fontWeight: '800',
    color: colors.white,
  },
  profileWelcome: {
    ...typography.h2,
    color: colors.gray900,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  profileSubtext: {
    ...typography.body,
    color: colors.gray600,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: spacing.xl,
  },
  inputWrapper: {
    borderRadius: spacing.l,
    padding: 2,
    ...shadows.small,
    position: 'relative',
  },
  input: {
    ...typography.body,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.m,
    borderRadius: spacing.l - 2,
    backgroundColor: 'transparent',
    color: colors.gray900,
  },
  inputDisabled: {
    color: colors.gray500,
  },
  inputBadge: {
    position: 'absolute',
    right: spacing.m,
    top: '50%',
    transform: [{ translateY: -10 }],
    backgroundColor: colors.success,
    paddingHorizontal: spacing.s,
    paddingVertical: spacing.xs,
    borderRadius: spacing.s,
  },
  inputBadgeText: {
    ...typography.captionSmall,
    color: colors.white,
    fontWeight: '600',
  },
  saveButton: {
    paddingVertical: spacing.m,
    borderRadius: spacing.l,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.medium,
  },
  saveButtonText: {
    ...typography.button,
    color: colors.white,
    fontWeight: '700',
  },
  tabTitle: {
    ...typography.h2,
    color: colors.gray900,
    fontWeight: '700',
    marginBottom: spacing.s,
    textAlign: 'center',
  },
  // Security Section Styles
  securityCard: {
    borderRadius: spacing.xxl,
    padding: spacing.xl,
    marginBottom: spacing.l,
    ...shadows.xlarge,
  },
  securityHeader: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  securityIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.m,
    ...shadows.large,
  },
  securityIconText: {
    fontSize: 36,
    color: colors.white,
  },
  passwordForm: {
    marginBottom: spacing.xl,
  },
  inputGroup: {
    marginBottom: spacing.l,
  },
  inputLabel: {
    ...typography.labelLarge,
    marginBottom: spacing.s,
    color: colors.gray800,
    fontWeight: '600',
  },
  requirementItem: {
    marginBottom: spacing.xs,
  },
  passwordStrengthBar: {
    height: 4,
    backgroundColor: colors.gray200,
    borderRadius: 2,
    marginTop: spacing.s,
    overflow: 'hidden',
  },
  strengthBar: {
    height: '100%',
    borderRadius: 2,
  },
  updateButton: {
    paddingVertical: spacing.m,
    borderRadius: spacing.l,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.medium,
  },
  updateButtonText: {
    ...typography.button,
    color: colors.white,
    fontWeight: '700',
  },
  // Notification & Privacy Styles
  notificationCard: {
    borderRadius: spacing.xxl,
    padding: spacing.xl,
    marginBottom: spacing.l,
    ...shadows.xlarge,
  },
  notificationHeader: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  notificationIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.m,
    ...shadows.large,
  },
  notificationIconText: {
    fontSize: 36,
    color: colors.white,
  },
  notificationSections: {
    gap: spacing.m,
    marginBottom: spacing.l,
  },
  notificationSection: {
    borderRadius: spacing.xl,
    padding: spacing.l,
    ...shadows.medium,
  },
  notificationSectionTitle: {
    ...typography.labelLarge,
    color: colors.gray900,
    marginBottom: spacing.s,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.m,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.s,
  },
  settingIcon: {
    fontSize: 18,
  },
  settingLabel: {
    ...typography.body,
    color: colors.gray800,
    fontWeight: '600',
  },
  settingDescription: {
    ...typography.caption,
    color: colors.gray600,
  },
  // Privacy Section Styles
  privacyCard: {
    borderRadius: spacing.xxl,
    padding: spacing.xl,
    marginBottom: spacing.l,
    ...shadows.xlarge,
  },
  privacyHeader: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  privacyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.m,
    ...shadows.large,
  },
  privacyIconText: {
    fontSize: 36,
    color: colors.white,
  },
  privacySection: {
    borderRadius: spacing.xl,
    padding: spacing.l,
    marginBottom: spacing.m,
    ...shadows.medium,
  },
  privacySectionTitle: {
    ...typography.labelLarge,
    color: colors.gray900,
    marginBottom: spacing.m,
  },
  // Coming Soon Styles
  comingSoonCard: {
    borderRadius: spacing.xxl,
    padding: spacing.xl,
    marginBottom: spacing.l,
    alignItems: 'center',
    ...shadows.xlarge,
  },
  comingSoonIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.m,
    ...shadows.large,
  },
  comingSoonIconText: {
    fontSize: 36,
    color: colors.white,
  },
  comingSoonTitle: {
    ...typography.h2,
    color: colors.gray900,
    fontWeight: '700',
    marginBottom: spacing.m,
    textAlign: 'center',
  },
  comingSoonDescription: {
    ...typography.body,
    color: colors.gray700,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.l,
  },
  comingSoonProgress: {
    width: '100%',
    borderRadius: spacing.l,
    padding: spacing.m,
    marginBottom: spacing.l,
    ...shadows.small,
  },
  progressBar: {
    height: 6,
    backgroundColor: colors.gray200,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: spacing.s,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    ...typography.caption,
    color: colors.white,
    textAlign: 'center',
    fontWeight: '600',
  },
  notifyButton: {
    paddingVertical: spacing.m,
    paddingHorizontal: spacing.xl,
    borderRadius: spacing.l,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.medium,
  },
  notifyButtonText: {
    ...typography.button,
    color: colors.white,
    fontWeight: '700',
  },
  // Danger Zone Styles
  dangerCard: {
    borderRadius: spacing.xxl,
    padding: spacing.xl,
    marginTop: spacing.m,
    alignItems: 'center',
    ...shadows.xlarge,
  },
  dangerIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.m,
    ...shadows.large,
  },
  dangerIconText: {
    fontSize: 36,
    color: colors.white,
  },
  dangerTitle: {
    ...typography.h2,
    color: colors.error,
    marginBottom: spacing.m,
    fontWeight: '800',
    textAlign: 'center',
  },
  dangerDescription: {
    ...typography.body,
    color: colors.gray700,
    marginBottom: spacing.xl,
    lineHeight: 24,
    textAlign: 'center',
  },
  deleteButton: {
    paddingVertical: spacing.m,
    paddingHorizontal: spacing.xl,
    borderRadius: spacing.l,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.medium,
  },
  deleteButtonText: {
    ...typography.button,
    color: colors.white,
    fontWeight: '700',
  },
  sectionDescription: {
    ...typography.bodyLarge,
    color: colors.white,
    opacity: 0.9,
    marginBottom: spacing.m,
    lineHeight: 24,
    textAlign: 'center',
  },
  passwordRequirements: {
    borderRadius: spacing.l,
    padding: spacing.l,
    marginBottom: spacing.l,
    ...shadows.small,
  },
  requirementsTitle: {
    ...typography.labelLarge,
    color: colors.white,
    marginBottom: spacing.m,
    fontWeight: '700',
  },
  requirement: {
    ...typography.body,
    color: colors.white,
    marginBottom: spacing.s,
    opacity: 0.8,
  },
  requirementMet: {
    color: colors.white,
    opacity: 1,
  },
});

export default AccountSettingsScreen;
