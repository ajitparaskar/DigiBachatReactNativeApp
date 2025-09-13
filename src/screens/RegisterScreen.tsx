import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, KeyboardAvoidingView, Platform, StatusBar, ScrollView } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { registerApi } from '../services/api';
import Container from '../components/ui/Container';
import Card from '../components/ui/Card';
import PrimaryButton from '../components/ui/PrimaryButton';
import Input from '../components/ui/Input';
import { colors, typography, spacing, shadows } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;

const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string) => {
    return password.length >= 6;
  };

  const validatePhone = (phone: string) => {
    return /^\d{10}$/.test(phone);
  };

  const onRegister = async () => {
    // Validate all fields
    if (!name.trim()) {
      Alert.alert('Missing Name', 'Please enter your full name');
      return;
    }
    
    if (!email.trim()) {
      Alert.alert('Missing Email', 'Please enter your email address');
      return;
    }
    
    if (!validateEmail(email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address');
      return;
    }
    
    if (!phone.trim()) {
      Alert.alert('Missing Phone Number', 'Please enter your phone number');
      return;
    }
    
    if (!validatePhone(phone)) {
      Alert.alert('Invalid Phone Number', 'Please enter a valid 10-digit phone number');
      return;
    }
    
    if (!password) {
      Alert.alert('Missing Password', 'Please create a password');
      return;
    }
    
    if (!validatePassword(password)) {
      Alert.alert('Weak Password', 'Password must be at least 6 characters long');
      return;
    }
    
    if (password !== confirmPassword) {
      Alert.alert('Password Mismatch', 'Passwords do not match. Please check and try again.');
      return;
    }
    
    setLoading(true);
    try {
      console.log('Registration attempt:', {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        passwordLength: password.length
      });
      
      const response = await registerApi(name.trim(), email.trim().toLowerCase(), password, phone.trim());
      console.log('Registration response:', response?.data);
      
      if (response?.data) {
        Alert.alert(
          'Registration Successful! ✅', 
          'We\'ve sent a verification code to your email. Please check your inbox and verify your account.',
          [
            {
              text: 'Continue',
              onPress: () => navigation.navigate('VerifyEmail', { 
                email: email.trim().toLowerCase()
              })
            }
          ]
        );
      } else {
        throw new Error('Registration failed - no response data');
      }
    } catch (e: any) {
      console.error('Registration error details:', {
        message: e?.message,
        status: e?.response?.status,
        statusText: e?.response?.statusText,
        data: e?.response?.data,
        config: e?.config
      });
      
      let errorMessage = 'Registration failed. Please try again.';
      
      if (e?.response?.data?.message) {
        errorMessage = e.response.data.message;
      } else if (e?.response?.data?.error) {
        errorMessage = e.response.data.error;
      } else if (e?.response?.status === 400) {
        errorMessage = 'Invalid registration details. Please check your information and try again.';
      } else if (e?.response?.status === 409) {
        errorMessage = 'An account with this email already exists. Please try logging in instead.';
      } else if (e?.response?.status === 422) {
        errorMessage = 'Please check your input - some fields may be invalid.';
      } else if (e?.message) {
        errorMessage = e.message;
      }
      
      Alert.alert('Registration Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor={colors.backgroundSecondary} />
      <KeyboardAvoidingView 
        style={styles.keyboardView} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Container style={styles.container}>
            <View style={styles.header}>
              <View style={styles.logoContainer}>
                <Text style={styles.logoIcon}>🚀</Text>
                <Text style={styles.title}>Join DigiBachat</Text>
              </View>
              <Text style={styles.subtitle}>
                Create your account and start your savings journey with thousands of users
              </Text>
              <View style={styles.benefitsContainer}>
                <View style={styles.benefit}>
                  <Text style={styles.benefitIcon}>✅</Text>
                  <Text style={styles.benefitText}>Secure group savings</Text>
                </View>
                <View style={styles.benefit}>
                  <Text style={styles.benefitIcon}>✅</Text>
                  <Text style={styles.benefitText}>Track your progress</Text>
                </View>
                <View style={styles.benefit}>
                  <Text style={styles.benefitIcon}>✅</Text>
                  <Text style={styles.benefitText}>Achieve financial goals</Text>
                </View>
              </View>
            </View>

            <Card variant="elevated" style={styles.registerCard}>
              <Text style={styles.cardTitle}>Create Your Account</Text>
              
              <Input
                label="Full Name"
                placeholder="Enter your full name"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />
              
              <Input
                label="Email Address"
                placeholder="Enter your email"
                autoCapitalize="none"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
              />
              
              <Input
                label="Phone Number"
                placeholder="Enter your 10-digit phone number"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
                maxLength={10}
              />
              
              <Input
                label="Password"
                placeholder="Create a strong password (min 6 characters)"
                secureTextEntry={true}
                value={password}
                onChangeText={setPassword}
              />
              
              <Input
                label="Confirm Password"
                placeholder="Confirm your password"
                secureTextEntry={true}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
              
              <View style={styles.passwordRequirements}>
                <Text style={styles.requirementsTitle}>Registration Requirements:</Text>
                <Text style={[styles.requirement, name.trim().length > 0 && styles.requirementMet]}>
                  • Full name provided
                </Text>
                <Text style={[styles.requirement, validateEmail(email) && styles.requirementMet]}>
                  • Valid email address
                </Text>
                <Text style={[styles.requirement, validatePhone(phone) && styles.requirementMet]}>
                  • Valid 10-digit phone number
                </Text>
                <Text style={[styles.requirement, password.length >= 6 && styles.requirementMet]}>
                  • Password at least 6 characters
                </Text>
                <Text style={[styles.requirement, password === confirmPassword && password.length > 0 && styles.requirementMet]}>
                  • Passwords must match
                </Text>
              </View>
              
              <PrimaryButton 
                title={loading ? 'Creating Account...' : 'Create Account'} 
                onPress={onRegister} 
                loading={loading}
                disabled={loading || !name.trim() || !email.trim() || !phone.trim() || !password || !confirmPassword || password !== confirmPassword || !validateEmail(email) || !validatePhone(phone) || !validatePassword(password)}
                size="large"
                style={styles.registerButton}
              />
              
              <View style={styles.loginPrompt}>
                <Text style={styles.loginText}>Already have an account? </Text>
                <PrimaryButton
                  title="Sign In"
                  onPress={() => navigation.navigate('Login')}
                  variant="text"
                  style={styles.loginButton}
                />
              </View>
            </Card>
          </Container>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
};

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
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
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.l,
  },
  logoIcon: {
    fontSize: 40,
    marginRight: spacing.m,
  },
  title: {
    ...typography.h1,
    textAlign: 'center',
    color: colors.brandTeal,
  },
  subtitle: {
    ...typography.bodyLarge,
    color: colors.gray600,
    textAlign: 'center',
    marginBottom: spacing.l,
    lineHeight: 28,
  },
  benefitsContainer: {
    alignSelf: 'stretch',
    gap: spacing.s,
  },
  benefit: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.m,
  },
  benefitIcon: {
    fontSize: 16,
    marginRight: spacing.s,
  },
  benefitText: {
    ...typography.body,
    color: colors.gray700,
  },
  registerCard: {
    marginHorizontal: spacing.l,
    marginBottom: spacing.xl,
    ...shadows.large,
    borderRadius: 24,
  },
  cardTitle: {
    ...typography.h3,
    textAlign: 'center',
    marginBottom: spacing.l,
    color: colors.gray900,
  },
  passwordRequirements: {
    backgroundColor: colors.gray100,
    padding: spacing.m,
    borderRadius: spacing.m,
    marginBottom: spacing.m,
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
  registerButton: {
    marginTop: spacing.l,
    marginBottom: spacing.m,
  },
  loginPrompt: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.s,
  },
  loginText: {
    ...typography.body,
    color: colors.gray600,
  },
  loginButton: {
    paddingHorizontal: 0,
    minHeight: 'auto',
  },
});

export default RegisterScreen;
