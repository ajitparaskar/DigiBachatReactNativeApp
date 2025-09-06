import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity, StatusBar, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Container from '../components/ui/Container';
import Card from '../components/ui/Card';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { colors, typography, spacing, shadows } from '../theme';
import { getUpcomingContributionsApi, getUserTotalSavingsApi } from '../services/api';

const DashboardScreen: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [totalSavings, setTotalSavings] = useState<number>(0);
  const [upcomingCount, setUpcomingCount] = useState<number>(0);
  const navigation = useNavigation<any>();

  useEffect(() => {
    const load = async () => {
      try {
        const [savingsRes, upcomingRes] = await Promise.all([
          getUserTotalSavingsApi(),
          getUpcomingContributionsApi(),
        ]);
        const savings = savingsRes.data?.data?.totalSavings || savingsRes.data?.totalSavings || 0;
        const upcoming = upcomingRes.data?.data?.items?.length || upcomingRes.data?.items?.length || 0;
        setTotalSavings(Number(savings) || 0);
        setUpcomingCount(Number(upcoming) || 0);
      } catch (e: any) {
        Alert.alert('Error', e?.message || 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Loading your dashboard..." />;
  }

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor={colors.backgroundSecondary} />
      <Container scrollable style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.greeting}>Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'}!</Text>
            <Text style={styles.title}>
              Your <Text style={styles.titleAccent}>Financial Dashboard</Text>
            </Text>
            <Text style={styles.subtitle}>Track your savings progress and manage your groups</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity 
              onPress={() => navigation.navigate('Notifications')} 
              style={styles.headerButton}
            >
              <Text style={styles.headerButtonText}>🔔</Text>
              <View style={styles.notificationBadge}>
                <Text style={styles.badgeText}>2</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => navigation.navigate('AccountSettings')} 
              style={styles.headerButton}
            >
              <Text style={styles.headerButtonText}>⚙️</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => navigation.navigate('Help')} 
              style={styles.headerButton}
            >
              <Text style={styles.headerButtonText}>❓</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.statsContainer}>
          <Card variant="elevated" style={StyleSheet.flatten([styles.statCard, styles.primaryStatCard])}>
            <View style={styles.statCardHeader}>
              <View style={styles.statIconContainer}>
                <Text style={styles.statIcon}>💰</Text>
              </View>
              <Text style={styles.statLabel}>Total Savings</Text>
            </View>
            <Text style={styles.statValue}>₹ {totalSavings.toLocaleString()}</Text>
            <View style={styles.statFooter}>
              <Text style={styles.statTrend}>↗️ +12% this month</Text>
            </View>
          </Card>

          <Card variant="elevated" style={styles.statCard}>
            <View style={styles.statCardHeader}>
              <View style={styles.statIconContainer}>
                <Text style={styles.statIcon}>📅</Text>
              </View>
              <Text style={styles.statLabel}>Upcoming</Text>
            </View>
            <Text style={styles.statValue}>{upcomingCount}</Text>
            <Text style={styles.statSubtext}>Contributions due</Text>
          </Card>
        </View>

        <Card variant="elevated" style={styles.quickActionsCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <Text style={styles.sectionSubtitle}>Manage your savings and groups</Text>
          </View>
          <View style={styles.quickActions}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => navigation.navigate('Groups')}
            >
              <View style={styles.actionIconContainer}>
                <Text style={styles.actionIcon}>👥</Text>
              </View>
              <Text style={styles.actionText}>My Groups</Text>
              <Text style={styles.actionSubtext}>Manage memberships</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => navigation.navigate('Analytics')}
            >
              <View style={styles.actionIconContainer}>
                <Text style={styles.actionIcon}>📊</Text>
              </View>
              <Text style={styles.actionText}>Analytics</Text>
              <Text style={styles.actionSubtext}>View insights</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => navigation.navigate('TotalSavings')}
            >
              <View style={styles.actionIconContainer}>
                <Text style={styles.actionIcon}>💎</Text>
              </View>
              <Text style={styles.actionText}>Savings</Text>
              <Text style={styles.actionSubtext}>View details</Text>
            </TouchableOpacity>
          </View>
        </Card>

        <Card variant="elevated" style={styles.recentActivityCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Transactions')}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.activityList}>
            <View style={styles.activityItem}>
              <View style={styles.activityIcon}>
                <Text>💵</Text>
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>Monthly Contribution</Text>
                <Text style={styles.activityTime}>2 hours ago</Text>
              </View>
              <Text style={styles.activityAmount}>+₹ 5,000</Text>
            </View>
            <View style={styles.activityItem}>
              <View style={styles.activityIcon}>
                <Text>🎉</Text>
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>Goal Achieved</Text>
                <Text style={styles.activityTime}>Yesterday</Text>
              </View>
              <Text style={styles.activityAmount}>₹ 50,000</Text>
            </View>
          </View>
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
  headerContent: {
    flex: 1,
  },
  greeting: {
    ...typography.body,
    color: colors.gray500,
    marginBottom: spacing.xs,
  },
  title: {
    ...typography.h2,
    marginBottom: spacing.xs,
  },
  titleAccent: {
    color: colors.brandTeal,
  },
  subtitle: {
    ...typography.body,
    color: colors.gray600,
  },
  headerActions: {
    flexDirection: 'row',
    gap: spacing.s,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.medium,
    position: 'relative',
  },
  headerButtonText: {
    fontSize: 18,
  },
  notificationBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    ...typography.captionSmall,
    color: colors.white,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: spacing.m,
    marginBottom: spacing.l,
  },
  statCard: {
    flex: 1,
    marginBottom: 0,
  },
  primaryStatCard: {
    backgroundColor: colors.brandTeal,
  },
  statCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.m,
  },
  statIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.s,
  },
  statIcon: {
    fontSize: 16,
  },
  statLabel: {
    ...typography.caption,
    color: colors.white,
    fontWeight: '500',
  },
  statValue: {
    ...typography.h2,
    color: colors.white,
    fontWeight: '800',
    marginBottom: spacing.xs,
  },
  statFooter: {
    marginTop: spacing.xs,
  },
  statTrend: {
    ...typography.caption,
    color: colors.white,
    opacity: 0.8,
  },
  statSubtext: {
    ...typography.caption,
    color: colors.gray500,
  },
  quickActionsCard: {
    marginBottom: spacing.l,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.l,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.gray900,
  },
  sectionSubtitle: {
    ...typography.caption,
    color: colors.gray500,
  },
  viewAllText: {
    ...typography.label,
    color: colors.brandTeal,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.s,
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    padding: spacing.m,
    borderRadius: spacing.l,
    backgroundColor: colors.backgroundTertiary,
    borderWidth: 1,
    borderColor: colors.gray200,
  },
  actionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.brandTeal,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.s,
  },
  actionIcon: {
    fontSize: 20,
    color: colors.white,
  },
  actionText: {
    ...typography.label,
    color: colors.gray700,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  actionSubtext: {
    ...typography.captionSmall,
    color: colors.gray500,
    textAlign: 'center',
  },
  recentActivityCard: {
    marginBottom: spacing.xl,
  },
  activityList: {
    gap: spacing.m,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.s,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.backgroundTertiary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.m,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    ...typography.body,
    color: colors.gray700,
    marginBottom: spacing.xs,
  },
  activityTime: {
    ...typography.caption,
    color: colors.gray500,
  },
  activityAmount: {
    ...typography.labelLarge,
    color: colors.brandTeal,
    fontWeight: '600',
  },
});

export default DashboardScreen;



