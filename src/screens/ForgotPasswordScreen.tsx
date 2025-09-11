import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, KeyboardAvoidingView, Platform, StatusBar } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { forgotPasswordApi } from '../services/api';
import Container from '../components/ui/Container';
import Card from '../components/ui/Card';
import PrimaryButton from '../components/ui/PrimaryButton';
import Input from '../components/ui/Input';
import { colors, typography, spacing, shadows } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'ForgotPassword'>;

const ForgotPasswordScreen: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const submit = async () => {
    if (!email.trim()) {
      Alert.alert('Missing Email', 'Please enter your email address');
      return;
    }
    
    if (!validateEmail(email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      await forgotPasswordApi(email.trim().toLowerCase());
      Alert.alert(
        'Reset Email Sent! 📧', 
        'We\'ve sent a password reset link to your email. Please check your inbox and follow the instructions to reset your password.',
        [
          {
            text: 'Back to Login',
            onPress: () => navigation.navigate('Login')
          }
        ]
      );
    } catch (e: any) {
      console.error('Forgot password error:', e);
      let errorMessage = 'Failed to send reset email. Please try again.';
      
      if (e?.response?.data?.message) {
        errorMessage = e.response.data.message;
      } else if (e?.response?.status === 404) {
        errorMessage = 'No account found with this email address.';
      } else if (e?.message) {
        errorMessage = e.message;
      }
      
      Alert.alert('Reset Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={colors.brandTeal} />
      <View style={styles.gradientBackground}>
        <KeyboardAvoidingView 
          style={styles.keyboardView} 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <Container style={styles.container}>
            <View style={styles.header}>
              <View style={styles.iconContainer}>
                <Text style={styles.icon}>🔐</Text>
              </View>
              <Text style={styles.title}>Forgot Password?</Text>
              <Text style={styles.subtitle}>
                No worries! Enter your email address and we'll send you a link to reset your password.
              </Text>
            </View>

            <Card variant="elevated" style={styles.resetCard}>
              <Text style={styles.cardTitle}>Reset Your Password</Text>
              
              <Input
                label="Email Address"
                placeholder="Enter your registered email"
                autoCapitalize="none"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
                autoFocus={true}
              />
              
              <View style={styles.infoBox}>
                <Text style={styles.infoIcon}>ℹ️</Text>
                <Text style={styles.infoText}>
                  We'll send you a secure link to reset your password. The link will expire in 24 hours for your security.
                </Text>
              </View>
              
              <PrimaryButton 
                title={loading ? 'Sending Reset Link...' : 'Send Reset Link'} 
                onPress={submit} 
                loading={loading}
                disabled={loading || !email.trim() || !validateEmail(email)}
                size="large"
                style={styles.resetButton}
              />
              
              <View style={styles.actionButtons}>
                <PrimaryButton 
                  title="Back to Login" 
                  onPress={() => navigation.navigate('Login')}
                  variant="text"
                  style={styles.backButton}
                />
                <PrimaryButton 
                  title="Create New Account" 
                  onPress={() => navigation.navigate('Register')}
                  variant="outline"
                  style={styles.registerButton}
                />
              </View>
            </Card>
          </Container>
        </KeyboardAvoidingView>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  gradientBackground: {
    flex: 1,
    backgroundColor: colors.brandTeal,
  },
  keyboardView: {
    flex: 1,
  },
  container: {
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.l,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.l,
  },
  icon: {
    fontSize: 40,
  },
  title: {
    ...typography.h1,
    color: colors.white,
    textAlign: 'center',
    marginBottom: spacing.m,
    fontWeight: '800',
  },
  subtitle: {
    ...typography.bodyLarge,
    color: colors.white,
    textAlign: 'center',
    opacity: 0.9,
    lineHeight: 24,
  },
  resetCard: {
    marginHorizontal: spacing.l,
    ...shadows.large,
    borderRadius: 24,
  },
  cardTitle: {
    ...typography.h3,
    textAlign: 'center',
    marginBottom: spacing.l,
    color: colors.gray900,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: colors.info + '10',
    borderColor: colors.info + '30',
    borderWidth: 1,
    borderRadius: spacing.m,
    padding: spacing.m,
    marginBottom: spacing.l,
  },
  infoIcon: {
    fontSize: 16,
    marginRight: spacing.s,
    marginTop: 2,
  },
  infoText: {
    ...typography.caption,
    color: colors.info,
    flex: 1,
    lineHeight: 18,
  },
  resetButton: {
    marginBottom: spacing.m,
  },
  actionButtons: {
    gap: spacing.m,
  },
  backButton: {
    paddingVertical: spacing.s,
  },
  registerButton: {
    borderColor: colors.brandTeal,
  },
});

export default ForgotPasswordScreen;
