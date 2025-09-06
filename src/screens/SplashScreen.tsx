import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { getToken } from '../services/auth';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { colors, typography, spacing } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList>;

const SplashScreen: React.FC<Props> = ({ navigation }) => {
  useEffect(() => {
    const check = async () => {
      const token = await getToken();
      if (token) {
        navigation.replace('Home');
      } else {
        navigation.replace('Login');
      }
    };
    check();
  }, [navigation]);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>
          Digi <Text style={styles.titleAccent}>बचत</Text>
        </Text>
        <Text style={styles.subtitle}>Smart Savings, Brighter Future</Text>
        <LoadingSpinner text="Loading your account..." />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.brandTeal,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  title: {
    ...typography.h1,
    color: colors.white,
    marginBottom: spacing.s,
    textAlign: 'center',
  },
  titleAccent: {
    color: colors.white,
    fontWeight: '400',
  },
  subtitle: {
    ...typography.body,
    color: colors.white,
    opacity: 0.9,
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
});

export default SplashScreen;



