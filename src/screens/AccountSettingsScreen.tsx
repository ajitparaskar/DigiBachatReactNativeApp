import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, TouchableOpacity, ScrollView, Switch, StatusBar } from 'react-native';
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

  return (
    <ErrorBoundary>
      <StatusBar barStyle="dark-content" backgroundColor={colors.backgroundSecondary} />
      <Container style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.title}>Account Settings</Text>
            <Text style={styles.subtitle}>Manage your account preferences and security</Text>
          </View>

          <View style={styles.tabs}>
            {(['profile','security','notifications','privacy','preferences','payment'] as const).map((t) => (
              <TouchableOpacity key={t} onPress={() => setTab(t)} style={[styles.tab, tab === t && styles.tabActive]}>
                <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
                  {t === 'profile' ? '👤 Profile' : 
                   t === 'security' ? '🔒 Security' :
                   t === 'notifications' ? '🔔 Notifications' :
                   t === 'privacy' ? '🛡️ Privacy' :
                   t === 'preferences' ? '⚙️ Preferences' : '💳 Payment'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

      {tab === 'profile' && (
        <Card>
          <TextInput style={styles.input} placeholder="Name" value={name} onChangeText={setName} />
          <TextInput editable={false} style={styles.input} placeholder="Email" value={email} />
          <TextInput style={styles.input} placeholder="Phone" value={phone} onChangeText={setPhone} />
          <PrimaryButton title={loading ? 'Saving...' : 'Save'} onPress={save} disabled={loading} />
        </Card>
      )}

      {tab === 'security' && (
        <Card variant="elevated" style={styles.tabCard}>
          <Text style={styles.tabTitle}>🔒 Security Settings</Text>
          <Text style={styles.sectionDescription}>
            Update your account password to keep your savings secure
          </Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Current Password</Text>
            <TextInput 
              secureTextEntry={true}
              style={styles.input} 
              placeholder="Enter your current password" 
              value={currentPassword} 
              onChangeText={setCurrentPassword}
              autoCapitalize="none"
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>New Password</Text>
            <TextInput 
              secureTextEntry={true}
              style={styles.input} 
              placeholder="Enter new password (min 6 characters)" 
              value={newPassword} 
              onChangeText={setNewPassword}
              autoCapitalize="none"
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Confirm New Password</Text>
            <TextInput 
              secureTextEntry={true}
              style={styles.input} 
              placeholder="Confirm your new password" 
              value={confirmPassword} 
              onChangeText={setConfirmPassword}
              autoCapitalize="none"
            />
          </View>

          <View style={styles.passwordRequirements}>
            <Text style={styles.requirementsTitle}>Password Requirements:</Text>
            <Text style={[styles.requirement, newPassword.length >= 6 && styles.requirementMet]}>
              • At least 6 characters long
            </Text>
            <Text style={[styles.requirement, newPassword === confirmPassword && newPassword.length > 0 && styles.requirementMet]}>
              • Passwords must match
            </Text>
          </View>
          
          <PrimaryButton 
            title={loading ? 'Updating Password...' : 'Update Password'} 
            onPress={updatePassword} 
            disabled={loading || !currentPassword || !newPassword || !confirmPassword || newPassword !== confirmPassword || newPassword.length < 6}
            style={styles.updateButton}
          />
        </Card>
      )}

      {tab === 'notifications' && (
        <Card variant="elevated" style={styles.tabCard}>
          <Text style={styles.tabTitle}>🔔 Notification Preferences</Text>
          {Object.entries(notif).map(([k, v]) => (
            <View key={k} style={styles.rowBetween}>
              <Text style={styles.settingLabel}>{k.charAt(0).toUpperCase() + k.slice(1)}</Text>
              <Switch 
                value={v as boolean} 
                onValueChange={(nv) => setNotif({ ...notif, [k]: nv } as any)}
                trackColor={{ false: colors.gray300, true: colors.brandTeal + '40' }}
                thumbColor={v ? colors.brandTeal : colors.gray400}
              />
            </View>
          ))}
          <View style={styles.rowBetween}>
            <Text style={styles.settingLabel}>Loan Alerts</Text>
            <Switch 
              value={loanAlerts} 
              onValueChange={setLoanAlerts}
              trackColor={{ false: colors.gray300, true: colors.brandTeal + '40' }}
              thumbColor={loanAlerts ? colors.brandTeal : colors.gray400}
            />
          </View>
          <PrimaryButton title="Save Preferences" onPress={() => Alert.alert('Saved', 'Notification preferences saved')} />
        </Card>
      )}

      {tab === 'privacy' && (
        <Card variant="elevated" style={styles.tabCard}>
          <Text style={styles.tabTitle}>🛡️ Privacy Settings</Text>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Profile Visibility</Text>
            <TextInput style={styles.input} value={privacy.profileVisibility as any} onChangeText={(v) => setPrivacy({ ...privacy, profileVisibility: v as any })} />
          </View>
          {Object.entries(privacy).filter(([k]) => k !== 'profileVisibility').map(([k, v]) => (
            <View key={k} style={styles.rowBetween}>
              <Text style={styles.settingLabel}>{k.charAt(0).toUpperCase() + k.slice(1).replace(/([A-Z])/g, ' $1')}</Text>
              <Switch 
                value={v as boolean} 
                onValueChange={(nv) => setPrivacy({ ...privacy, [k]: nv } as any)}
                trackColor={{ false: colors.gray300, true: colors.brandTeal + '40' }}
                thumbColor={v ? colors.brandTeal : colors.gray400}
              />
            </View>
          ))}
          <PrimaryButton title="Save Settings" onPress={() => Alert.alert('Saved', 'Privacy settings saved')} />
        </Card>
      )}

      {tab === 'preferences' && (
        <ComingSoon
          icon="⚙️"
          title="App Preferences"
          description="Customize your app experience with language, theme, currency, and date format options. These features are being developed to provide you with a fully personalized experience."
          showNotifyButton={true}
          onNotifyPress={() => Alert.alert('Notifications', 'We\'ll notify you when preferences customization is available!')}
          variant="card"
        />
      )}

      {tab === 'payment' && (
        <View>
          <ComingSoon
            icon="💳"
            title="Payment Methods"
            description="Manage your payment methods, cards, and UPI accounts. Set up automatic contributions and view payment history. Advanced payment features are being developed."
            showNotifyButton={true}
            onNotifyPress={() => Alert.alert('Notifications', 'We\'ll notify you when payment management is available!')}
            variant="card"
          />
          
          <Card variant="elevated" style={styles.tabCard}>
            <View style={styles.dangerZone}>
              <Text style={styles.dangerTitle}>⚠️ Danger Zone</Text>
              <Text style={styles.dangerDescription}>
                Permanently delete your account and all associated data. This action cannot be undone.
              </Text>
              <PrimaryButton
                title="Delete Account"
                variant="outline"
                style={styles.deleteButton}
                onPress={() => {
                  Alert.alert(
                    'Delete Account',
                    'This will permanently delete your account and data. Continue?',
                    [
                      { text: 'Cancel', style: 'cancel' },
                      { text: 'Delete', style: 'destructive', onPress: async () => {
                          try {
                            await deleteAccountApi();
                            await clearToken();
                            Alert.alert('Account Deleted', 'Your account has been deleted.');
                            navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
                          } catch (e: any) {
                            Alert.alert('Failed', e?.message || 'Unable to delete account');
                          }
                        } },
                    ]
                  );
                }}
              />
            </View>
          </Card>
        </View>
      )}
        </ScrollView>
      </Container>
    </ErrorBoundary>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.backgroundSecondary,
  },
  header: {
    marginBottom: spacing.xl,
    paddingTop: spacing.m,
  },
  title: {
    ...typography.h2,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    color: colors.gray600,
  },
  tabs: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.l,
    gap: spacing.s,
  },
  tab: {
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    borderRadius: spacing.l,
    borderWidth: 1,
    borderColor: colors.gray300,
    backgroundColor: colors.white,
  },
  tabActive: {
    backgroundColor: colors.brandTeal,
    borderColor: colors.brandTeal,
  },
  tabText: {
    ...typography.caption,
    color: colors.gray700,
  },
  tabTextActive: {
    color: colors.white,
    fontWeight: '600',
  },
  tabCard: {
    marginBottom: spacing.l,
  },
  tabTitle: {
    ...typography.h3,
    marginBottom: spacing.l,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.gray300,
    borderRadius: spacing.m,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    marginBottom: spacing.m,
    backgroundColor: colors.white,
    ...typography.body,
  },
  inputGroup: {
    marginBottom: spacing.m,
  },
  inputLabel: {
    ...typography.label,
    marginBottom: spacing.s,
    color: colors.gray700,
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.m,
  },
  settingLabel: {
    ...typography.body,
    color: colors.gray700,
  },
  infoText: {
    ...typography.body,
    color: colors.gray600,
    marginBottom: spacing.l,
    lineHeight: 22,
  },
  dangerZone: {
    marginTop: spacing.l,
    paddingTop: spacing.l,
    borderTopWidth: 1,
    borderTopColor: colors.gray200,
  },
  dangerTitle: {
    ...typography.labelLarge,
    color: colors.error,
    marginBottom: spacing.s,
  },
  dangerDescription: {
    ...typography.body,
    color: colors.gray600,
    marginBottom: spacing.l,
    lineHeight: 20,
  },
  deleteButton: {
    borderColor: colors.error,
  },
  sectionDescription: {
    ...typography.body,
    color: colors.gray600,
    marginBottom: spacing.l,
    lineHeight: 22,
  },
  passwordRequirements: {
    backgroundColor: colors.gray100,
    padding: spacing.m,
    borderRadius: 8,
    marginBottom: spacing.l,
  },
  requirementsTitle: {
    ...typography.labelLarge,
    color: colors.gray800,
    marginBottom: spacing.s,
  },
  requirement: {
    ...typography.caption,
    color: colors.gray600,
    marginBottom: spacing.xs,
  },
  requirementMet: {
    color: colors.success,
  },
  updateButton: {
    marginTop: spacing.s,
  },
});

export default AccountSettingsScreen;
