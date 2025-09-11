import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert, StatusBar, ScrollView } from 'react-native';
import Container from '../components/ui/Container';
import Card from '../components/ui/Card';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { colors, typography, spacing, shadows } from '../theme';
import { getUserTotalSavingsApi, getUserContributionsByGroupApi, getUserContributionsApi, getUserGroupsApi } from '../services/api';

const TotalSavingsScreen: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState<number>(0);
  const [groupsCount, setGroupsCount] = useState<number>(0);
  const [monthlyAvg, setMonthlyAvg] = useState<number>(0);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getUserTotalSavingsApi();
        let amount = res.data?.data?.total_savings || res.data?.total_savings || res.data?.data?.totalSavings || res.data?.totalSavings || 0;
        
        console.log('🎯 TotalSavingsScreen API Response:', {
          status: res.status,
          fullData: JSON.stringify(res.data, null, 2),
          extractedAmount: amount
        });
        
        // Fallback method: Calculate from user contributions if primary returns 0
        if (!amount || amount === 0) {
          console.log('Primary total savings API returned 0, trying fallback method');
          amount = await calculateTotalSavingsFromContributions();
        }
        
        setTotal(Number(amount) || 0);
        console.log('Total savings loaded in TotalSavingsScreen:', amount);
        
        // Also fetch groups data
        await loadGroupsData();
        await loadContributionStats();
      } catch (e: any) {
        console.error('Failed to load total savings:', e);
        
        // Final fallback: Try to calculate from contributions
        try {
          const fallbackTotal = await calculateTotalSavingsFromContributions();
          setTotal(Number(fallbackTotal) || 0);
          console.log('Used fallback total savings in TotalSavingsScreen:', fallbackTotal);
        } catch (fallbackError) {
          console.error('Fallback total savings calculation also failed:', fallbackError);
          Alert.alert('Error', e?.message || 'Failed to load total savings');
          setTotal(0);
        }
      } finally {
        setLoading(false);
      }
    };
    
    const calculateTotalSavingsFromContributions = async (): Promise<number> => {
      try {
        // Method 1: Use getUserContributionsByGroupApi with better error handling
        try {
          const contributionsRes = await getUserContributionsByGroupApi();
          if (contributionsRes.data?.success && contributionsRes.data?.data?.contributions) {
            const total = contributionsRes.data.data.contributions.reduce((sum: number, contribution: any) => {
              return sum + (contribution.total_amount || contribution.amount || 0);
            }, 0);
            if (total > 0) {
              console.log('Calculated total from contributions by group (TotalSavingsScreen):', total);
              return total;
            }
          }
        } catch (apiError: any) {
          console.warn('getUserContributionsByGroupApi failed:', apiError.response?.status, apiError.message);
          // Continue to fallback method instead of throwing
        }
        
        // Method 2: Use getUserContributionsApi with better error handling
        try {
          const userContributionsRes = await getUserContributionsApi();
          if (userContributionsRes.data?.success && userContributionsRes.data?.data?.contributions) {
            const total = userContributionsRes.data.data.contributions.reduce((sum: number, contribution: any) => {
              return sum + (contribution.total_amount || contribution.amount || 0);
            }, 0);
            if (total > 0) {
              console.log('Calculated total from user contributions (TotalSavingsScreen):', total);
              return total;
            }
          }
        } catch (apiError: any) {
          console.warn('getUserContributionsApi failed:', apiError.response?.status, apiError.message);
          // Continue to next fallback
        }
        
        // Method 3: Try getUserTotalSavingsApi as final fallback
        try {
          const totalSavingsRes = await getUserTotalSavingsApi();
          const amount = totalSavingsRes.data?.data?.total_savings || totalSavingsRes.data?.total_savings || totalSavingsRes.data?.data?.totalSavings || totalSavingsRes.data?.totalSavings || 0;
          if (amount > 0) {
            console.log('Used getUserTotalSavingsApi as fallback:', amount);
            return Number(amount);
          }
        } catch (apiError: any) {
          console.warn('getUserTotalSavingsApi fallback failed:', apiError.response?.status, apiError.message);
        }
        
        console.log('All API methods returned 0 or failed (TotalSavingsScreen)');
        return 0;
      } catch (error) {
        console.error('Error calculating total savings from contributions (TotalSavingsScreen):', error);
        return 0;
      }
    };
    
    const loadGroupsData = async () => {
      try {
        const groupsRes = await getUserGroupsApi();
        const groups = groupsRes.data?.data?.groups || groupsRes.data?.groups || [];
        const activeGroups = groups.filter((group: any) => group.status === 'active' || !group.status);
        setGroupsCount(activeGroups.length);
        console.log('📊 Groups data loaded in TotalSavingsScreen:', activeGroups.length);
      } catch (error) {
        console.error('Failed to load groups data:', error);
        setGroupsCount(0);
      }
    };
    
    const loadContributionStats = async () => {
      try {
        const contributionsRes = await getUserContributionsApi();
        const contributions = contributionsRes.data?.data?.contributions || contributionsRes.data?.contributions || [];
        
        if (contributions.length > 0) {
          const totalContributions = contributions.reduce((sum: number, contribution: any) => {
            return sum + (contribution.total_amount || contribution.amount || 0);
          }, 0);
          
          // Calculate monthly average (assuming data spans multiple months)
          const avgMonthly = totalContributions / Math.max(contributions.length, 1);
          setMonthlyAvg(Math.round(avgMonthly));
          console.log('💳 Monthly average calculated in TotalSavingsScreen:', avgMonthly);
        }
      } catch (error) {
        console.error('Failed to load contribution stats:', error);
        setMonthlyAvg(0);
      }
    };
    
    load();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Loading total savings..." />;
  }

  const monthlyGrowth = total > 0 ? 8.5 : 0; // This would come from API in real implementation
  const yearlyGrowth = total > 0 ? 15.2 : 0;
  const totalGroups = groupsCount;
  const avgMonthlyContribution = monthlyAvg;

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
