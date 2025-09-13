import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert, StatusBar, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import Container from '../components/ui/Container';
import Card from '../components/ui/Card';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { colors, typography, spacing, shadows } from '../theme';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { getGroupSavingsSummaryApi } from '../services/api';

interface GroupMemberSavings {
  user_id: number;
  name: string;
  email: string;
  current_balance: number;
  role: string;
  total_contributed: number;
  total_transactions: number;
}

interface GroupSavingsData {
  group: {
    name: string;
    expected_contribution: number;
  };
  members: GroupMemberSavings[];
  total_group_savings: number;
}

type Props = NativeStackScreenProps<RootStackParamList, any> & {
  route: { params: { groupId: number } };
};

const SavingsSummaryScreen: React.FC<Props> = ({ route }) => {
  const { groupId } = route.params as any;
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [savingsData, setSavingsData] = useState<GroupSavingsData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadGroupSavings = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      
      const response = await getGroupSavingsSummaryApi(groupId);
      
      if (response?.data?.data) {
        setSavingsData(response.data.data);
      } else if (response?.data) {
        setSavingsData(response.data);
      } else {
        setError('No savings data available');
      }
    } catch (err: any) {
      console.error('Failed to load group savings:', err);
      setError('Failed to load group savings data');
      Alert.alert('Error', err?.message || 'Failed to load savings summary');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (groupId) {
      loadGroupSavings();
    }
  }, [groupId]);

  const onRefresh = () => {
    loadGroupSavings(true);
  };

  if (loading) {
    return <LoadingSpinner text="Loading savings summary..." />;
  }

  if (error || !savingsData) {
    return (
      <>
        <StatusBar barStyle="dark-content" backgroundColor={colors.backgroundSecondary} />
        <Container style={styles.container}>
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📊</Text>
            <Text style={styles.emptyTitle}>Failed to Load Group Savings</Text>
            <Text style={styles.emptyDescription}>
              {error || 'Unable to load savings summary at this time'}
            </Text>
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={() => loadGroupSavings()}
            >
              <Text style={styles.retryButtonText}>🔄 Retry</Text>
            </TouchableOpacity>
          </View>
        </Container>
      </>
    );
  }

  // Sort members by total contributed (highest first)
  const sortedMembers = [...savingsData.members].sort((a, b) => b.total_contributed - a.total_contributed);
  const topContributor = sortedMembers[0];
  
  const stats = [
    {
      title: 'Total Group Savings',
      value: `₹${savingsData.total_group_savings.toLocaleString()}`,
      icon: '💰',
      description: 'Across all members'
    },
    {
      title: 'Active Members', 
      value: savingsData.members.length.toString(),
      icon: '👥',
      description: 'Contributing members'
    },
    {
      title: 'Expected Amount',
      value: `₹${savingsData.group.expected_contribution.toLocaleString()}`,
      icon: '🎯',
      description: 'Per member per cycle'
    },
    {
      title: 'Average Contribution',
      value: savingsData.members.length > 0 
        ? `₹${Math.round(savingsData.total_group_savings / savingsData.members.length).toLocaleString()}`
        : '₹0',
      icon: '📊',
      description: 'Per member'
    }
  ];

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor={colors.backgroundSecondary} />
      <Container style={styles.container}>
        <ScrollView 
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          {/* Header */}
          <Card variant="elevated" style={styles.headerCard}>
            <View style={styles.headerContent}>
              <View>
                <Text style={styles.headerTitle}>{savingsData.group.name} - Group Savings</Text>
                <Text style={styles.headerSubtitle}>Track contributions by each member</Text>
              </View>
              <View style={styles.headerAmount}>
                <Text style={styles.totalAmount}>₹{savingsData.total_group_savings.toLocaleString()}</Text>
                <Text style={styles.totalAmountLabel}>Total Collected</Text>
              </View>
            </View>
          </Card>

          {/* Stats Grid */}
          <View style={styles.statsGrid}>
            {stats.map((stat, index) => (
              <Card key={index} variant="elevated" style={styles.statCard}>
                <View style={styles.statContent}>
                  <View>
                    <Text style={styles.statLabel}>{stat.title}</Text>
                    <Text style={styles.statValue}>{stat.value}</Text>
                    <Text style={styles.statDescription}>{stat.description}</Text>
                  </View>
                  <View style={styles.statIconContainer}>
                    <Text style={styles.statIcon}>{stat.icon}</Text>
                  </View>
                </View>
              </Card>
            ))}
          </View>

          {/* Top Contributor */}
          {topContributor && (
            <Card variant="elevated" style={styles.topContributorCard}>
              <View style={styles.topContributorContent}>
                <View style={styles.crownContainer}>
                  <Text style={styles.crownIcon}>👑</Text>
                </View>
                <View>
                  <Text style={styles.topContributorLabel}>Top Contributor</Text>
                  <Text style={styles.topContributorName}>{topContributor.name}</Text>
                  <Text style={styles.topContributorAmount}>₹{topContributor.total_contributed.toLocaleString()} contributed</Text>
                </View>
              </View>
            </Card>
          )}

          {/* Members Savings Breakdown */}
          <Card variant="elevated" style={styles.membersCard}>
            <View style={styles.membersHeader}>
              <Text style={styles.membersTitle}>Member Contributions</Text>
              <TouchableOpacity onPress={() => loadGroupSavings(true)} style={styles.refreshButton}>
                <Text style={styles.refreshText}>🔄 Refresh</Text>
              </TouchableOpacity>
            </View>

            {savingsData.members.length > 0 ? (
              <View style={styles.membersList}>
                {sortedMembers.map((member, index) => {
                  const isTopContributor = member.user_id === topContributor?.user_id;
                  const contributionPercentage = savingsData.group.expected_contribution > 0 
                    ? (member.total_contributed / savingsData.group.expected_contribution) * 100 
                    : 0;

                  return (
                    <View
                      key={member.user_id}
                      style={[
                        styles.memberItem,
                        isTopContributor && styles.topContributorItem
                      ]}
                    >
                      <View style={styles.memberHeader}>
                        <View style={styles.memberNameSection}>
                          <View style={styles.memberIcons}>
                            {index === 0 && <Text style={styles.awardIcon}>🏆</Text>}
                            {member.role === 'leader' && <Text style={styles.leaderIcon}>👑</Text>}
                          </View>
                          <View>
                            <Text style={styles.memberName}>{member.name}</Text>
                            <Text style={styles.memberEmail}>{member.email}</Text>
                          </View>
                          {member.role === 'leader' && (
                            <View style={styles.leaderBadge}>
                              <Text style={styles.leaderBadgeText}>Leader</Text>
                            </View>
                          )}
                        </View>
                        <View style={styles.memberAmountSection}>
                          <Text style={styles.memberTotalAmount}>
                            ₹{member.total_contributed.toLocaleString()}
                          </Text>
                          <Text style={styles.memberTransactions}>
                            {member.total_transactions} {member.total_transactions === 1 ? 'contribution' : 'contributions'}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.memberStats}>
                        <View style={styles.memberStatItem}>
                          <Text style={styles.memberStatLabel}>Current Balance</Text>
                          <Text style={styles.memberStatValue}>₹{member.current_balance.toLocaleString()}</Text>
                        </View>
                        <View style={styles.memberStatItem}>
                          <Text style={styles.memberStatLabel}>Expected vs Actual</Text>
                          <Text style={styles.memberStatValue}>{contributionPercentage.toFixed(0)}%</Text>
                        </View>
                        <View style={styles.memberStatItem}>
                          <Text style={styles.memberStatLabel}>Share of Total</Text>
                          <Text style={styles.memberStatValue}>
                            {savingsData.total_group_savings > 0 
                              ? ((member.total_contributed / savingsData.total_group_savings) * 100).toFixed(1)
                              : '0'
                            }%
                          </Text>
                        </View>
                      </View>

                      {/* Progress Bar */}
                      <View style={styles.progressSection}>
                        <View style={styles.progressBarContainer}>
                          <View
                            style={[
                              styles.memberProgressBar,
                              {
                                width: `${Math.min(contributionPercentage, 100)}%`,
                                backgroundColor: isTopContributor ? colors.warning : colors.brandTeal
                              }
                            ]}
                          />
                        </View>
                        <Text style={styles.progressText}>
                          Progress towards expected: ₹{savingsData.group.expected_contribution.toLocaleString()}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            ) : (
              <View style={styles.emptyMembers}>
                <Text style={styles.emptyMembersIcon}>👥</Text>
                <Text style={styles.emptyMembersTitle}>No contributions yet</Text>
                <Text style={styles.emptyMembersText}>Members haven't started contributing to this group</Text>
              </View>
            )}
          </Card>

          {/* Group Insights */}
          <Card variant="elevated" style={styles.insightsCard}>
            <Text style={styles.insightsTitle}>Group Insights</Text>
            <View style={styles.insightsGrid}>
              <View style={styles.insightCard}>
                <View style={styles.insightHeader}>
                  <Text style={styles.insightIcon}>📈</Text>
                  <Text style={styles.insightLabel}>Collection Rate</Text>
                </View>
                <Text style={styles.insightValue}>
                  {savingsData.members.length > 0 && savingsData.group.expected_contribution > 0
                    ? `${Math.round((savingsData.total_group_savings / (savingsData.members.length * savingsData.group.expected_contribution)) * 100)}%`
                    : '0%'
                  }
                </Text>
                <Text style={styles.insightDescription}>Of expected total</Text>
              </View>
              <View style={styles.insightCard}>
                <View style={styles.insightHeader}>
                  <Text style={styles.insightIcon}>👥</Text>
                  <Text style={styles.insightLabel}>Active Rate</Text>
                </View>
                <Text style={styles.insightValue}>
                  {savingsData.members.filter(m => m.total_contributed > 0).length}/{savingsData.members.length}
                </Text>
                <Text style={styles.insightDescription}>Members contributing</Text>
              </View>
              <View style={styles.insightCard}>
                <View style={styles.insightHeader}>
                  <Text style={styles.insightIcon}>🏆</Text>
                  <Text style={styles.insightLabel}>Best Performer</Text>
                </View>
                <Text style={styles.insightValue}>
                  {topContributor ? topContributor.name.split(' ')[0] : 'N/A'}
                </Text>
                <Text style={styles.insightDescription}>
                  {topContributor ? `₹${topContributor.total_contributed.toLocaleString()}` : 'No contributions yet'}
                </Text>
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
  // Header Card
  headerCard: {
    marginBottom: spacing.l,
    backgroundColor: colors.brandTeal,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    ...typography.h3,
    color: colors.white,
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    ...typography.body,
    color: colors.brandTealLight,
  },
  headerAmount: {
    alignItems: 'flex-end',
  },
  totalAmount: {
    ...typography.h2,
    color: colors.white,
    fontWeight: '700',
  },
  totalAmountLabel: {
    ...typography.caption,
    color: colors.brandTealLight,
  },
  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.m,
    marginBottom: spacing.l,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
  },
  statContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statLabel: {
    ...typography.caption,
    color: colors.gray600,
    marginBottom: spacing.xs,
  },
  statValue: {
    ...typography.h3,
    color: colors.gray900,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  statDescription: {
    ...typography.captionSmall,
    color: colors.gray500,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    backgroundColor: colors.brandTeal,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statIcon: {
    fontSize: 20,
    color: colors.white,
  },
  // Top Contributor
  topContributorCard: {
    backgroundColor: colors.warning,
    marginBottom: spacing.l,
  },
  topContributorContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  crownContainer: {
    width: 56,
    height: 56,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.m,
  },
  crownIcon: {
    fontSize: 24,
    color: colors.white,
  },
  topContributorLabel: {
    ...typography.labelLarge,
    color: colors.white,
    marginBottom: spacing.xs,
  },
  topContributorName: {
    ...typography.h3,
    color: colors.white,
    fontWeight: '700',
  },
  topContributorAmount: {
    ...typography.body,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  // Members Card
  membersCard: {
    marginBottom: spacing.l,
  },
  membersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.l,
  },
  membersTitle: {
    ...typography.h3,
    color: colors.gray900,
  },
  refreshButton: {
    paddingHorizontal: spacing.s,
    paddingVertical: spacing.xs,
  },
  refreshText: {
    ...typography.captionSmall,
    color: colors.brandTeal,
  },
  membersList: {
    gap: spacing.m,
  },
  memberItem: {
    borderWidth: 1,
    borderColor: colors.gray200,
    borderRadius: spacing.m,
    padding: spacing.m,
  },
  topContributorItem: {
    borderColor: colors.warning,
    backgroundColor: colors.warningLight,
  },
  memberHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.m,
  },
  memberNameSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  memberIcons: {
    flexDirection: 'row',
    marginRight: spacing.s,
  },
  awardIcon: {
    fontSize: 16,
    marginRight: spacing.xs,
  },
  leaderIcon: {
    fontSize: 16,
  },
  memberName: {
    ...typography.labelLarge,
    color: colors.gray900,
    fontWeight: '600',
  },
  memberEmail: {
    ...typography.captionSmall,
    color: colors.gray500,
  },
  leaderBadge: {
    backgroundColor: colors.brandTeal,
    paddingHorizontal: spacing.s,
    paddingVertical: spacing.xs,
    borderRadius: spacing.s,
    marginLeft: spacing.s,
  },
  leaderBadgeText: {
    ...typography.captionSmall,
    color: colors.white,
    fontWeight: '600',
  },
  memberAmountSection: {
    alignItems: 'flex-end',
  },
  memberTotalAmount: {
    ...typography.h4,
    color: colors.success,
    fontWeight: '700',
  },
  memberTransactions: {
    ...typography.captionSmall,
    color: colors.gray500,
  },
  memberStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.m,
  },
  memberStatItem: {
    alignItems: 'center',
  },
  memberStatLabel: {
    ...typography.captionSmall,
    color: colors.gray600,
    marginBottom: spacing.xs,
  },
  memberStatValue: {
    ...typography.labelLarge,
    color: colors.gray900,
    fontWeight: '600',
  },
  progressSection: {
    marginTop: spacing.s,
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: colors.gray200,
    borderRadius: 3,
    marginBottom: spacing.xs,
  },
  memberProgressBar: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    ...typography.captionSmall,
    color: colors.gray500,
  },
  emptyMembers: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  emptyMembersIcon: {
    fontSize: 48,
    marginBottom: spacing.m,
  },
  emptyMembersTitle: {
    ...typography.h4,
    color: colors.gray600,
    marginBottom: spacing.s,
  },
  emptyMembersText: {
    ...typography.body,
    color: colors.gray500,
    textAlign: 'center',
  },
  // Insights
  insightsCard: {
    marginBottom: spacing.xl,
  },
  insightsTitle: {
    ...typography.h3,
    color: colors.gray900,
    marginBottom: spacing.l,
  },
  insightsGrid: {
    gap: spacing.m,
  },
  insightCard: {
    backgroundColor: colors.white,
    padding: spacing.m,
    borderRadius: spacing.m,
    borderWidth: 1,
    borderColor: colors.gray200,
    marginBottom: spacing.s,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.s,
  },
  insightIcon: {
    fontSize: 16,
    marginRight: spacing.s,
  },
  insightLabel: {
    ...typography.label,
    color: colors.gray700,
  },
  insightValue: {
    ...typography.h3,
    color: colors.brandTeal,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  insightDescription: {
    ...typography.captionSmall,
    color: colors.gray500,
  },
  // Empty State & Retry
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
    marginBottom: spacing.l,
  },
  retryButton: {
    backgroundColor: colors.brandTeal,
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.m,
    borderRadius: spacing.m,
  },
  retryButtonText: {
    ...typography.labelLarge,
    color: colors.white,
  },
});

export default SavingsSummaryScreen;



