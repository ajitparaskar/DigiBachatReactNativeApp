import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert, StatusBar, ScrollView } from 'react-native';
import Container from '../components/ui/Container';
import Card from '../components/ui/Card';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { colors, typography, spacing, shadows } from '../theme';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { getGroupSavingsSummaryApi } from '../services/api';

type Props = NativeStackScreenProps<RootStackParamList, any> & {
  route: { params: { groupId: number } };
};

const SavingsSummaryScreen: React.FC<Props> = ({ route }) => {
  const { groupId } = route.params as any;
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getGroupSavingsSummaryApi(groupId);
        setSummary(res.data?.data || res.data || null);
      } catch (e: any) {
        Alert.alert('Error', e?.message || 'Failed to load summary');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [groupId]);

  if (loading) {
    return <LoadingSpinner text="Loading savings summary..." />;
  }

  if (!summary) {
    return (
      <>
        <StatusBar barStyle="dark-content" backgroundColor={colors.backgroundSecondary} />
        <Container style={styles.container}>
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📊</Text>
            <Text style={styles.emptyTitle}>No Data Available</Text>
            <Text style={styles.emptyDescription}>Unable to load savings summary at this time</Text>
          </View>
        </Container>
      </>
    );
  }

  const totalSavings = Number(summary.totalSavings || summary.total || 0);
  const membersCount = summary.membersCount || summary.members?.length || 0;
  const avgSavingsPerMember = membersCount > 0 ? totalSavings / membersCount : 0;
  const targetAmount = summary.targetAmount || summary.goal || 0;
  const progressPercentage = targetAmount > 0 ? (totalSavings / targetAmount) * 100 : 0;

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor={colors.backgroundSecondary} />
      <Container style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.title}>Savings Summary</Text>
            <Text style={styles.subtitle}>Overview of group savings performance</Text>
          </View>

          <View style={styles.statsGrid}>
            <Card variant="elevated" style={styles.statCard}>
              <View style={styles.statHeader}>
                <Text style={styles.statIcon}>💰</Text>
                <Text style={styles.statLabel}>Total Savings</Text>
              </View>
              <Text style={styles.statValue}>₹ {totalSavings.toLocaleString()}</Text>
              <Text style={styles.statTrend}>Group collective amount</Text>
            </Card>

            <Card variant="elevated" style={styles.statCard}>
              <View style={styles.statHeader}>
                <Text style={styles.statIcon}>👥</Text>
                <Text style={styles.statLabel}>Active Members</Text>
              </View>
              <Text style={styles.statValue}>{membersCount}</Text>
              <Text style={styles.statTrend}>Contributing members</Text>
            </Card>

            <Card variant="elevated" style={styles.statCard}>
              <View style={styles.statHeader}>
                <Text style={styles.statIcon}>📊</Text>
                <Text style={styles.statLabel}>Avg per Member</Text>
              </View>
              <Text style={styles.statValue}>₹ {avgSavingsPerMember.toLocaleString()}</Text>
              <Text style={styles.statTrend}>Individual average</Text>
            </Card>

            {targetAmount > 0 && (
              <Card variant="elevated" style={styles.statCard}>
                <View style={styles.statHeader}>
                  <Text style={styles.statIcon}>🎯</Text>
                  <Text style={styles.statLabel}>Goal Progress</Text>
                </View>
                <Text style={styles.statValue}>{progressPercentage.toFixed(1)}%</Text>
                <Text style={styles.statTrend}>of ₹ {targetAmount.toLocaleString()}</Text>
              </Card>
            )}
          </View>

          {targetAmount > 0 && (
            <Card variant="elevated" style={styles.progressCard}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressTitle}>Goal Progress</Text>
                <Text style={styles.progressPercentage}>{progressPercentage.toFixed(1)}%</Text>
              </View>
              <View style={styles.progressBarContainer}>
                <View style={[styles.progressBar, { width: `${Math.min(progressPercentage, 100)}%` }]} />
              </View>
              <View style={styles.progressLabels}>
                <Text style={styles.progressLabel}>₹ {totalSavings.toLocaleString()}</Text>
                <Text style={styles.progressLabel}>₹ {targetAmount.toLocaleString()}</Text>
              </View>
            </Card>
          )}

          {summary.members && Array.isArray(summary.members) && (
            <Card variant="elevated" style={styles.membersCard}>
              <Text style={styles.membersTitle}>Member Contributions</Text>
              <View style={styles.membersList}>
                {summary.members.slice(0, 5).map((member: any, index: number) => (
                  <View key={index} style={styles.memberItem}>
                    <View style={styles.memberInfo}>
                      <Text style={styles.memberName}>{member.name || `Member ${index + 1}`}</Text>
                      <Text style={styles.memberAmount}>₹ {Number(member.amount || member.contribution || 0).toLocaleString()}</Text>
                    </View>
                    <View style={styles.memberProgress}>
                      <View 
                        style={[
                          styles.memberProgressBar, 
                          { width: `${Math.min((Number(member.amount || member.contribution || 0) / totalSavings) * 100, 100)}%` }
                        ]} 
                      />
                    </View>
                  </View>
                ))}
                {summary.members.length > 5 && (
                  <Text style={styles.moreMembers}>+{summary.members.length - 5} more members</Text>
                )}
              </View>
            </Card>
          )}

          <Card variant="elevated" style={styles.insightsCard}>
            <View style={styles.insightsHeader}>
              <Text style={styles.insightsTitle}>💡 Insights</Text>
            </View>
            <View style={styles.insightsList}>
              <View style={styles.insightItem}>
                <Text style={styles.insightIcon}>📈</Text>
                <View style={styles.insightContent}>
                  <Text style={styles.insightText}>
                    {progressPercentage >= 100 
                      ? "Congratulations! You've reached your savings goal" 
                      : progressPercentage >= 75 
                      ? "You're close to reaching your savings goal" 
                      : "Keep contributing regularly to reach your goal"}
                  </Text>
                </View>
              </View>
              <View style={styles.insightItem}>
                <Text style={styles.insightIcon}>⚡</Text>
                <View style={styles.insightContent}>
                  <Text style={styles.insightText}>
                    Average contribution per member is ₹ {avgSavingsPerMember.toLocaleString()}
                  </Text>
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
  progressCard: {
    marginBottom: spacing.l,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.l,
  },
  progressTitle: {
    ...typography.h3,
  },
  progressPercentage: {
    ...typography.h3,
    color: colors.brandTeal,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: colors.gray200,
    borderRadius: 4,
    marginBottom: spacing.m,
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.brandTeal,
    borderRadius: 4,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressLabel: {
    ...typography.caption,
    color: colors.gray500,
  },
  membersCard: {
    marginBottom: spacing.l,
  },
  membersTitle: {
    ...typography.h3,
    marginBottom: spacing.l,
  },
  membersList: {
    gap: spacing.m,
  },
  memberItem: {
    marginBottom: spacing.s,
  },
  memberInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  memberName: {
    ...typography.body,
    color: colors.gray700,
  },
  memberAmount: {
    ...typography.labelLarge,
    color: colors.gray900,
    fontWeight: '600',
  },
  memberProgress: {
    height: 4,
    backgroundColor: colors.gray200,
    borderRadius: 2,
  },
  memberProgressBar: {
    height: '100%',
    backgroundColor: colors.brandTeal,
    borderRadius: 2,
  },
  moreMembers: {
    ...typography.caption,
    color: colors.gray500,
    textAlign: 'center',
    marginTop: spacing.s,
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
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: spacing.l,
  },
  emptyTitle: {
    ...typography.h3,
    marginBottom: spacing.s,
    color: colors.gray700,
  },
  emptyDescription: {
    ...typography.body,
    color: colors.gray500,
    textAlign: 'center',
  },
});

export default SavingsSummaryScreen;



