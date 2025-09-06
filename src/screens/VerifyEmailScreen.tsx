import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, StatusBar, KeyboardAvoidingView, Platform } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { resendOtpApi, verifyEmailApi } from '../services/api';
import Container from '../components/ui/Container';
import Card from '../components/ui/Card';
import PrimaryButton from '../components/ui/PrimaryButton';
import Input from '../components/ui/Input';
import { colors, typography, spacing, shadows } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, any> & {
  route: { params: { email: string } };
};

const VerifyEmailScreen: React.FC<Props> = ({ route, navigation }) => {
  const emailParam = (route.params as any)?.email || '';
  const [email, setEmail] = useState(emailParam);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    // Start countdown for resend OTP
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const verify = async () => {
    if (!email.trim()) {
      Alert.alert('Missing Email', 'Please enter your email address');
      return;
    }
    
    if (!otp.trim()) {
      Alert.alert('Missing OTP', 'Please enter the verification code');
      return;
    }
    
    if (otp.length !== 6) {
      Alert.alert('Invalid OTP', 'Verification code must be 6 digits');
      return;
    }
    
    setLoading(true);
    try {
      const response = await verifyEmailApi(email.trim(), otp.trim());
      
      if (response?.data) {
        Alert.alert(
          'Email Verified Successfully! ✅',
          'Your account has been verified. You can now sign in to start your savings journey.',
          [
            {
              text: 'Sign In Now',
              onPress: () => navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }]
              })
            }
          ]
        );
      } else {
        throw new Error('Verification failed - no response data');
      }
    } catch (e: any) {
      console.error('Verification error:', e);
      
      let errorMessage = 'Failed to verify email. Please try again.';
      
      if (e?.response?.data?.message) {
        errorMessage = e.response.data.message;
      } else if (e?.response?.status === 400) {
        errorMessage = 'Invalid verification code. Please check and try again.';
      } else if (e?.response?.status === 404) {
        errorMessage = 'Email not found. Please register first.';
      } else if (e?.message) {
        errorMessage = e.message;
      }
      
      Alert.alert('Verification Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    if (!email.trim()) {
      Alert.alert('Missing Email', 'Please enter your email address');
      return;
    }
    
    if (countdown > 0) {
      Alert.alert('Please Wait', `You can resend OTP in ${countdown} seconds`);
      return;
    }
    
    setResending(true);
    try {
      const response = await resendOtpApi(email.trim());
      
      if (response?.data) {
        Alert.alert(
          'OTP Resent Successfully! 📧',
          'A new verification code has been sent to your email. Please check your inbox.'
        );
        setCountdown(60); // 60 second countdown
        setOtp(''); // Clear current OTP
      } else {
        throw new Error('Failed to resend OTP');
      }
    } catch (e: any) {
      console.error('Resend OTP error:', e);
      
      let errorMessage = 'Failed to resend verification code. Please try again.';
      
      if (e?.response?.data?.message) {
        errorMessage = e.response.data.message;
      } else if (e?.response?.status === 404) {
        errorMessage = 'Email not found. Please register first.';
      } else if (e?.message) {
        errorMessage = e.message;
      }
      
      Alert.alert('Resend Failed', errorMessage);
    } finally {
      setResending(false);
    }
  };

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor={colors.backgroundSecondary} />
      <KeyboardAvoidingView 
        style={styles.keyboardView} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Container style={styles.container}>
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Text style={styles.headerIcon}>📧</Text>
            </View>
            <Text style={styles.title}>Verify Your Email</Text>
            <Text style={styles.subtitle}>
              We've sent a 6-digit verification code to
            </Text>
            <Text style={styles.emailText}>{email}</Text>
            <Text style={styles.instruction}>
              Please check your inbox and enter the code below to complete your registration.
            </Text>
          </View>

          <Card variant="elevated" style={styles.verifyCard}>
            <Input
              label="Email Address"
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!loading}
            />
            
            <Input
              label="Verification Code"
              placeholder="Enter 6-digit code"
              value={otp}
              onChangeText={(text) => setOtp(text.replace(/[^0-9]/g, '').slice(0, 6))}
              keyboardType="numeric"
              maxLength={6}
              style={styles.otpInput}
            />
            
            <View style={styles.otpHint}>
              <Text style={styles.hintText}>
                💡 Enter the 6-digit code sent to your email
              </Text>
            </View>
            
            <PrimaryButton 
              title={loading ? 'Verifying...' : 'Verify Email'} 
              onPress={verify} 
              loading={loading}
              disabled={loading || !email.trim() || !otp.trim() || otp.length !== 6}
              size="large"
              style={styles.verifyButton}
            />
            
            <View style={styles.resendSection}>
              <Text style={styles.resendText}>Didn't receive the code?</Text>
              <PrimaryButton
                title={resending ? 'Resending...' : countdown > 0 ? `Resend in ${countdown}s` : 'Resend Code'}
                onPress={resend}
                variant="text"
                disabled={resending || countdown > 0}
                style={styles.resendButton}
              />
            </View>
            
            <View style={styles.backSection}>
              <Text style={styles.backText}>Wrong email? </Text>
              <PrimaryButton
                title="Go Back"
                onPress={() => navigation.goBack()}
                variant="text"
                style={styles.backButton}
              />
            </View>
          </Card>
        </Container>
      </KeyboardAvoidingView>
    </>
  );
};

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
  },
  container: {
    justifyContent: 'center',
    backgroundColor: 'transparent',
    minHeight: '100%',
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.l,
    paddingTop: spacing.xxl,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.brandTeal,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.l,
    ...shadows.medium,
  },
  headerIcon: {
    fontSize: 32,
    color: colors.white,
  },
  title: {
    ...typography.h2,
    textAlign: 'center',
    marginBottom: spacing.m,
    color: colors.gray900,
  },
  subtitle: {
    ...typography.body,
    color: colors.gray600,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  emailText: {
    ...typography.labelLarge,
    color: colors.brandTeal,
    textAlign: 'center',
    marginBottom: spacing.m,
  },
  instruction: {
    ...typography.caption,
    color: colors.gray500,
    textAlign: 'center',
    lineHeight: 20,
  },
  verifyCard: {
    marginHorizontal: spacing.l,
    marginBottom: spacing.xl,
    ...shadows.large,
    borderRadius: 24,
  },
  otpInput: {
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '600',
    letterSpacing: 4,
  },
  otpHint: {
    backgroundColor: colors.infoLight,
    padding: spacing.m,
    borderRadius: spacing.m,
    marginBottom: spacing.l,
  },
  hintText: {
    ...typography.caption,
    color: colors.info,
    textAlign: 'center',
  },
  verifyButton: {
    marginBottom: spacing.l,
  },
  resendSection: {
    alignItems: 'center',
    marginBottom: spacing.m,
  },
  resendText: {
    ...typography.body,
    color: colors.gray600,
    marginBottom: spacing.xs,
  },
  resendButton: {
    paddingHorizontal: 0,
    minHeight: 'auto',
  },
  backSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.s,
  },
  backText: {
    ...typography.body,
    color: colors.gray600,
  },
  backButton: {
    paddingHorizontal: 0,
    minHeight: 'auto',
  },
});

export default VerifyEmailScreen;



