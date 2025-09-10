import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, KeyboardAvoidingView, Platform, StatusBar } from 'react-native';
import Container from '../components/ui/Container';
import Card from '../components/ui/Card';
import PrimaryButton from '../components/ui/PrimaryButton';
import Input from '../components/ui/Input';
import { colors, typography, spacing, shadows } from '../theme';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { loginApi } from '../services/api';
import { saveToken } from '../services/auth';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const onLogin = async () => {
    if (!email || !password) {
      Alert.alert('Missing details', 'Please enter email and password');
      return;
    }
    setLoading(true);
    try {
      const response = await loginApi(email, password);
      const token = response.data?.token;
      if (token) {
        await saveToken(token);
      }
      navigation.replace('Home');
    } catch (e) {
      Alert.alert('Login failed', 'Please try again');
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
              <View style={styles.logoContainer}>
                <Text style={styles.logoIcon}>💰</Text>
                <Text style={styles.title}>
                  <Text style={styles.titleBrand}>Digi</Text>
                  <Text style={styles.titleAccent}>बचत</Text>
                </Text>
              </View>
              <Text style={styles.subtitle}>
                Your smart savings companion
              </Text>
              <Text style={styles.welcomeText}>
                Welcome back! Sign in to continue your savings journey.
              </Text>
            </View>

            <Card variant="elevated" style={styles.loginCard}>
              <Text style={styles.cardTitle}>Sign In</Text>
              
              <Input
                label="Email Address"
                placeholder="Enter your email"
                autoCapitalize="none"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
              />
              <Input
                label="Password"
                placeholder="Enter your password"
                secureTextEntry={true}
                value={password}
                onChangeText={setPassword}
              />
              
              <PrimaryButton 
                title={loading ? 'Signing in...' : 'Sign In'} 
                onPress={onLogin} 
                loading={loading}
                size="large"
                style={styles.loginButton}
              />
              
              <View style={styles.actionButtons}>
                <PrimaryButton 
                  title="Create New Account" 
                  onPress={() => navigation.navigate('Register')}
                  variant="outline"
                  style={styles.createAccountButton}
                />
                <PrimaryButton 
                  title="Forgot Password?" 
                  onPress={() => navigation.navigate('ForgotPassword')}
                  variant="text"
                  style={styles.forgotButton}
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
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.m,
  },
  logoIcon: {
    fontSize: 48,
    marginRight: spacing.m,
  },
  title: {
    ...typography.h1,
    textAlign: 'center',
  },
  titleBrand: {
    color: colors.white,
    fontWeight: '800',
  },
  titleAccent: {
    color: colors.brandTealLighter,
    fontWeight: '800',
  },
  subtitle: {
    ...typography.bodyLarge,
    color: colors.white,
    textAlign: 'center',
    marginBottom: spacing.s,
    opacity: 0.9,
  },
  welcomeText: {
    ...typography.body,
    color: colors.white,
    textAlign: 'center',
    opacity: 0.8,
  },
  loginCard: {
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
  loginButton: {
    marginTop: spacing.l,
    marginBottom: spacing.m,
  },
  actionButtons: {
    gap: spacing.m,
  },
  createAccountButton: {
    borderColor: colors.brandTeal,
  },
  forgotButton: {
    paddingVertical: spacing.s,
  },
});

export default LoginScreen;
