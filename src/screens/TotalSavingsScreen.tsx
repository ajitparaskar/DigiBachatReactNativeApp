import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert, StatusBar, ScrollView } from 'react-native';
import Container from '../components/ui/Container';
import Card from '../components/ui/Card';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { colors, typography, spacing, shadows } from '../theme';
import { getUserTotalSavingsApi } from '../services/api';

const TotalSavingsScreen: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState<number>(0);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getUserTotalSavingsApi();
        const amount = res.data?.data?.totalSavings || res.data?.totalSavings || 0;
        setTotal(Number(amount) || 0);
      } catch (e: any) {
        Alert.alert('Error', e?.message || 'Failed to load total savings');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Loading total savings..." />;
  }

  const monthlyGrowth = 8.5; // This would come from API in real implementation
  const yearlyGrowth = 15.2;
  const totalGroups = 3; // This would come from API
  const avgMonthlyContribution = 12500;

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor={colors.backgroundSecondary} />
      <Container style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.title}>Total Savings</Text>
            <Text style={styles.subtitle}>Your complete savings overview</Text>
          </View>

          <Card variant="elevated" style={styles.heroCard}>
            <View style={styles.heroContent}>
              <Text style={styles.heroIcon}>💰</Text>
              <Text style={styles.heroLabel}>Total Accumulated Savings</Text>
              <Text style={styles.heroValue}>₹ {total.toLocaleString()}</Text>
              <Text style={styles.heroTrend}>↗️ +{monthlyGrowth}% this month</Text>
            </View>
          </Card>

          <View style={styles.statsGrid}>
            <Card variant="elevated" style={styles.statCard}>
              <View style={styles.statHeader}>
                <Text style={styles.statIcon}>📈</Text>
                <Text style={styles.statLabel}>Monthly Growth</Text>
              </View>
              <Text style={styles.statValue}>+{monthlyGrowth}%</Text>
              <Text style={styles.statTrend}>vs last month</Text>
            </Card>

            <Card variant="elevated" style={styles.statCard}>
              <View style={styles.statHeader}>
                <Text style={styles.statIcon}>📊</Text>
                <Text style={styles.statLabel}>Yearly Growth</Text>
              </View>
              <Text style={styles.statValue}>+{yearlyGrowth}%</Text>
              <Text style={styles.statTrend}>vs last year</Text>
            </Card>

            <Card variant="elevated" style={styles.statCard}>
              <View style={styles.statHeader}>
                <Text style={styles.statIcon}>👥</Text>
                <Text style={styles.statLabel}>Active Groups</Text>
              </View>
              <Text style={styles.statValue}>{totalGroups}</Text>
              <Text style={styles.statTrend}>Contributing groups</Text>
            </Card>

            <Card variant="elevated" style={styles.statCard}>
              <View style={styles.statHeader}>
                <Text style={styles.statIcon}>💳</Text>
                <Text style={styles.statLabel}>Avg Monthly</Text>
              </View>
              <Text style={styles.statValue}>₹ {avgMonthlyContribution.toLocaleString()}</Text>
              <Text style={styles.statTrend}>Contribution</Text>
            </Card>
          </View>

          <Card variant="elevated" style={styles.milestoneCard}>
            <View style={styles.milestoneHeader}>
              <Text style={styles.milestoneTitle}>🎯 Savings Milestones</Text>
            </View>
            <View style={styles.milestonesList}>
              <View style={styles.milestoneItem}>
                <View style={[styles.milestoneIcon, { backgroundColor: colors.success + '20' }]}>
                  <Text style={styles.milestoneIconText}>✅</Text>
                </View>
                <View style={styles.milestoneContent}>
                  <Text style={styles.milestoneText}>First ₹10,000 saved</Text>
                  <Text style={styles.milestoneDate}>Achieved 3 months ago</Text>
                </View>
              </View>
              <View style={styles.milestoneItem}>
                <View style={[styles.milestoneIcon, { backgroundColor: colors.success + '20' }]}>
                  <Text style={styles.milestoneIconText}>✅</Text>
                </View>
                <View style={styles.milestoneContent}>
                  <Text style={styles.milestoneText}>₹50,000 milestone reached</Text>
                  <Text style={styles.milestoneDate}>Achieved 1 month ago</Text>
                </View>
              </View>
              <View style={styles.milestoneItem}>
                <View style={[styles.milestoneIcon, { backgroundColor: colors.brandTeal + '20' }]}>
                  <Text style={styles.milestoneIconText}>🎯</Text>
                </View>
                <View style={styles.milestoneContent}>
                  <Text style={styles.milestoneText}>Next goal: ₹200,000</Text>
                  <Text style={styles.milestoneDate}>₹{(200000 - total).toLocaleString()} to go</Text>
                </View>
              </View>
            </View>
          </Card>

          <Card variant="elevated" style={styles.insightsCard}>
            <View style={styles.insightsHeader}>
              <Text style={styles.insightsTitle}>💡 Savings Insights</Text>
            </View>
            <View style={styles.insightsList}>
              <View style={styles.insightItem}>
                <Text style={styles.insightIcon}>🚀</Text>
                <View style={styles.insightContent}>
                  <Text style={styles.insightText}>You're saving consistently across {totalGroups} groups</Text>
                  <Text style={styles.insightSubtext}>Great diversification strategy!</Text>
                </View>
              </View>
              <View style={styles.insightItem}>
                <Text style={styles.insightIcon}>📅</Text>
                <View style={styles.insightContent}>
                  <Text style={styles.insightText}>At current rate, you'll reach ₹200K in 8 months</Text>
                  <Text style={styles.insightSubtext}>Keep up the momentum</Text>
                </View>
              </View>
              <View style={styles.insightItem}>
                <Text style={styles.insightIcon}>💪</Text>
                <View style={styles.insightContent}>
                  <Text style={styles.insightText}>Your savings rate is above average</Text>
                  <Text style={styles.insightSubtext}>You're building wealth effectively</Text>
                </View>
              </View>
            </View>
          </Card>
        </ScrollView>
      </Container>
    </>
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
  heroCard: {
    marginBottom: spacing.l,
    backgroundColor: colors.brandTeal,
  },
  heroContent: {
    alignItems: 'center',
    paddingVertical: spacing.l,
  },
  heroIcon: {
    fontSize: 48,
    marginBottom: spacing.m,
  },
  heroLabel: {
    ...typography.body,
    color: colors.white,
    marginBottom: spacing.s,
  },
  heroValue: {
    ...typography.h1,
    color: colors.white,
    marginBottom: spacing.s,
  },
  heroTrend: {
    ...typography.caption,
    color: colors.white,
    opacity: 0.9,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.m,
    marginBottom: spacing.l,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    marginBottom: 0,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.m,
  },
  statIcon: {
    fontSize: 24,
    marginRight: spacing.s,
  },
  statLabel: {
    ...typography.caption,
    color: colors.gray500,
  },
  statValue: {
    ...typography.h3,
    color: colors.gray900,
    marginBottom: spacing.xs,
  },
  statTrend: {
    ...typography.caption,
    color: colors.gray600,
  },
  milestoneCard: {
    marginBottom: spacing.l,
  },
  milestoneHeader: {
    marginBottom: spacing.l,
  },
  milestoneTitle: {
    ...typography.h3,
  },
  milestonesList: {
    gap: spacing.m,
  },
  milestoneItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  milestoneIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.m,
  },
  milestoneIconText: {
    fontSize: 18,
  },
  milestoneContent: {
    flex: 1,
  },
  milestoneText: {
    ...typography.body,
    color: colors.gray700,
    marginBottom: spacing.xs,
  },
  milestoneDate: {
    ...typography.caption,
    color: colors.gray500,
  },
  insightsCard: {
    marginBottom: spacing.xl,
  },
  insightsHeader: {
    marginBottom: spacing.l,
  },
  insightsTitle: {
    ...typography.h3,
  },
  insightsList: {
    gap: spacing.m,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  insightIcon: {
    fontSize: 20,
    marginRight: spacing.m,
    marginTop: spacing.xs,
  },
  insightContent: {
    flex: 1,
  },
  insightText: {
    ...typography.body,
    color: colors.gray700,
    marginBottom: spacing.xs,
  },
  insightSubtext: {
    ...typography.caption,
    color: colors.gray500,
  },
});

export default TotalSavingsScreen;



