import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import Container from '../components/ui/Container';
import Card from '../components/ui/Card';
import PrimaryButton from '../components/ui/PrimaryButton';
import { colors, typography, spacing, shadows } from '../theme';
import { clearToken } from '../services/auth';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const quickActions = [
    { title: 'My Groups', icon: '👥', onPress: () => navigation.navigate('Groups') },
    { title: 'Dashboard', icon: '📊', onPress: () => navigation.navigate('Dashboard') },
    { title: 'Create Group', icon: '➕', onPress: () => navigation.navigate('CreateGroup') },
    { title: 'Join Group', icon: '🤝', onPress: () => navigation.navigate('JoinGroup') },
  ];

  const secondaryActions = [
    { title: 'Account Settings', icon: '⚙️', onPress: () => navigation.navigate('AccountSettings') },
    { title: 'Analytics', icon: '📈', onPress: () => navigation.navigate('Analytics') },
    { title: 'Exit Group', icon: '🚪', onPress: () => navigation.navigate('ExitGroup') },
  ];

  const handleLogout = async () => {
    await clearToken();
    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
  };

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor={colors.backgroundSecondary} />
      <Container scrollable style={styles.container}>
        <View style={styles.header}>
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeText}>Welcome back!</Text>
            <Text style={styles.title}>
              Digi <Text style={styles.titleAccent}>बचत</Text>
            </Text>
            <Text style={styles.subtitle}>What would you like to do today?</Text>
          </View>
          <View style={styles.profileSection}>
            <TouchableOpacity 
              style={styles.profileButton}
              onPress={() => navigation.navigate('AccountSettings')}
            >
              <Text style={styles.profileIcon}>👤</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Card variant="elevated" style={styles.quickActionsCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <Text style={styles.sectionSubtitle}>Get started with these common tasks</Text>
          </View>
          <View style={styles.actionsGrid}>
            {quickActions.map((action, index) => (
              <TouchableOpacity
                key={index}
                style={styles.actionCard}
                onPress={action.onPress}
                activeOpacity={0.7}
              >
                <View style={styles.actionIconContainer}>
                  <Text style={styles.actionIcon}>{action.icon}</Text>
                </View>
                <Text style={styles.actionTitle}>{action.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        <Card variant="elevated" style={styles.moreOptionsCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>More Options</Text>
            <Text style={styles.sectionSubtitle}>Additional features and tools</Text>
          </View>
          <View style={styles.buttonList}>
            {secondaryActions.map((action, index) => (
              <TouchableOpacity
                key={index}
                style={styles.optionItem}
                onPress={action.onPress}
              >
                <Text style={styles.optionIcon}>{action.icon}</Text>
                <Text style={styles.optionTitle}>{action.title}</Text>
                <Text style={styles.chevron}>›</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        <Card variant="outlined" style={styles.logoutCard}>
          <TouchableOpacity style={styles.logoutContainer} onPress={handleLogout}>
            <Text style={styles.logoutIcon}>🚪</Text>
            <View style={styles.logoutContent}>
              <Text style={styles.logoutTitle}>Sign Out</Text>
              <Text style={styles.logoutSubtitle}>You can always sign back in</Text>
            </View>
          </TouchableOpacity>
        </Card>
      </Container>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.backgroundSecondary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xl,
    paddingTop: spacing.m,
  },
  welcomeSection: {
    flex: 1,
  },
  welcomeText: {
    ...typography.body,
    color: colors.gray500,
    marginBottom: spacing.xs,
  },
  title: {
    ...typography.h1,
    marginBottom: spacing.s,
  },
  titleAccent: {
    color: colors.brandTeal,
  },
  subtitle: {
    ...typography.body,
    color: colors.gray600,
  },
  profileSection: {
    alignItems: 'flex-end',
  },
  profileButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.brandTeal,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.medium,
  },
  profileIcon: {
    fontSize: 20,
    color: colors.white,
  },
  quickActionsCard: {
    marginBottom: spacing.l,
  },
  sectionHeader: {
    marginBottom: spacing.l,
  },
  sectionTitle: {
    ...typography.h3,
    marginBottom: spacing.xs,
    color: colors.gray900,
  },
  sectionSubtitle: {
    ...typography.caption,
    color: colors.gray500,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.m,
    justifyContent: 'space-between',
  },
  actionCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.backgroundTertiary,
    borderRadius: spacing.l,
    padding: spacing.l,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.gray200,
  },
  actionIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.brandTeal,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.m,
  },
  actionIcon: {
    fontSize: 24,
    color: colors.white,
  },
  actionTitle: {
    ...typography.label,
    textAlign: 'center',
    color: colors.gray700,
  },
  moreOptionsCard: {
    marginBottom: spacing.l,
  },
  buttonList: {
    gap: spacing.xs,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.m,
    paddingHorizontal: spacing.s,
    borderRadius: spacing.m,
    backgroundColor: colors.backgroundTertiary,
  },
  optionIcon: {
    fontSize: 20,
    marginRight: spacing.m,
    width: 24,
    textAlign: 'center',
  },
  optionTitle: {
    ...typography.body,
    flex: 1,
    color: colors.gray700,
  },
  chevron: {
    ...typography.h3,
    color: colors.gray400,
    fontWeight: '300',
  },
  logoutCard: {
    marginTop: spacing.m,
    borderColor: colors.dangerLight,
    backgroundColor: colors.dangerLight,
  },
  logoutContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 0,
  },
  logoutIcon: {
    fontSize: 24,
    marginRight: spacing.m,
  },
  logoutContent: {
    flex: 1,
  },
  logoutTitle: {
    ...typography.labelLarge,
    color: colors.danger,
    marginBottom: spacing.xs,
  },
  logoutSubtitle: {
    ...typography.caption,
    color: colors.danger,
    opacity: 0.8,
  },
});

export default HomeScreen;


