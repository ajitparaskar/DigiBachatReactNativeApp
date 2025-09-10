import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Alert, StatusBar, TouchableOpacity, ScrollView } from 'react-native';
import Container from '../components/ui/Container';
import Card from '../components/ui/Card';
import PrimaryButton from '../components/ui/PrimaryButton';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { getGroupApi, getGroupMembersApi } from '../services/api';
import { colors, typography, spacing, shadows } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'GroupDetails'>;

const GroupDetailsScreen: React.FC<Props> = ({ route, navigation }) => {
  const { groupId } = route.params as any;
  const [loading, setLoading] = useState(true);
  const [group, setGroup] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [isLeader, setIsLeader] = useState<boolean>(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [groupRes, membersRes] = await Promise.all([
          getGroupApi(groupId),
          getGroupMembersApi(groupId),
        ]);
        
        // Enhanced mock data for better UI demonstration
        const mockGroup = {
          id: groupId,
          name: 'Family Savings Circle',
          description: 'Monthly family savings for our dream vacation',
          total_savings: 125000,
          target_amount: 200000,
          monthly_contribution: 5000,
          member_count: 8,
          created_at: '2024-01-15',
          next_contribution_date: '2024-02-15',
          is_leader: true,
          status: 'active'
        };
        
        const mockMembers = [
          { id: 1, user_name: 'Rajesh Kumar', user_email: 'rajesh@email.com', is_leader: true, status: 'active', contribution_amount: 5000, last_contribution: '2024-01-15', avatar: '👨‍💼' },
          { id: 2, user_name: 'Priya Sharma', user_email: 'priya@email.com', is_leader: false, status: 'active', contribution_amount: 5000, last_contribution: '2024-01-15', avatar: '👩‍💻' },
          { id: 3, user_name: 'Amit Patel', user_email: 'amit@email.com', is_leader: false, status: 'active', contribution_amount: 5000, last_contribution: '2024-01-14', avatar: '👨‍🎓' },
          { id: 4, user_name: 'Sneha Gupta', user_email: 'sneha@email.com', is_leader: false, status: 'active', contribution_amount: 5000, last_contribution: '2024-01-13', avatar: '👩‍🎨' },
          { id: 5, user_name: 'Vikram Singh', user_email: 'vikram@email.com', is_leader: false, status: 'pending', contribution_amount: 0, last_contribution: null, avatar: '👨‍🔧' },
        ];
        
        setGroup(groupRes.data?.data?.group || groupRes.data?.group || mockGroup);
        setMembers(membersRes.data?.data?.members || membersRes.data?.members || mockMembers);
        setIsLeader(Boolean(groupRes.data?.data?.group?.is_leader || groupRes.data?.group?.is_leader || mockGroup.is_leader));
      } catch (e: any) {
        Alert.alert('Error', e?.message || 'Failed to load group');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [groupId]);

  const getProgressPercentage = () => {
    if (!group?.target_amount) return 0;
    return Math.min((group.total_savings / group.target_amount) * 100, 100);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return colors.success;
      case 'pending': return colors.warning;
      case 'inactive': return colors.error;
      default: return colors.gray500;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return '✅';
      case 'pending': return '⏳';
      case 'inactive': return '❌';
      default: return '❓';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return <LoadingSpinner text="Loading group details..." />;
  }

  if (!group) {
    return (
      <View style={styles.container}>
        <Text>Group not found.</Text>
      </View>
    );
  }

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor={colors.backgroundSecondary} />
      <Container style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Group Header */}
          <Card variant="elevated" style={styles.headerCard}>
            <View style={styles.groupHeader}>
              <View style={styles.groupInfo}>
                <Text style={styles.groupName}>{group.name}</Text>
                <Text style={styles.groupDescription}>{group.description}</Text>
                <View style={styles.groupMeta}>
                  <Text style={styles.metaText}>👥 {group.member_count || members.length} members</Text>
                  <Text style={styles.metaText}>📅 Created {formatDate(group.created_at)}</Text>
                </View>
              </View>
              <View style={styles.groupStatus}>
                <Text style={styles.statusIcon}>{getStatusIcon(group.status)}</Text>
                <Text style={[styles.statusText, { color: getStatusColor(group.status) }]}>
                  {group.status?.toUpperCase()}
                </Text>
              </View>
            </View>
          </Card>

          {/* Savings Progress */}
          <Card variant="elevated" style={styles.progressCard}>
            <Text style={styles.sectionTitle}>💰 Savings Progress</Text>
            <View style={styles.progressHeader}>
              <Text style={styles.currentAmount}>{formatCurrency(group.total_savings)}</Text>
              <Text style={styles.targetAmount}>of {formatCurrency(group.target_amount)}</Text>
            </View>
            <View style={styles.progressBarContainer}>
              <View style={styles.progressBarBackground}>
                <View style={[styles.progressBarFill, { width: `${getProgressPercentage()}%` }]} />
              </View>
              <Text style={styles.progressPercentage}>{getProgressPercentage().toFixed(1)}%</Text>
            </View>
            <View style={styles.progressStats}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{formatCurrency(group.monthly_contribution)}</Text>
                <Text style={styles.statLabel}>Monthly Target</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{formatDate(group.next_contribution_date)}</Text>
                <Text style={styles.statLabel}>Next Due</Text>
              </View>
            </View>
          </Card>

          {/* Quick Actions */}
          <Card variant="elevated" style={styles.actionsCard}>
            <Text style={styles.sectionTitle}>⚡ Quick Actions</Text>
            <View style={styles.actionGrid}>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => navigation.navigate('Contribution', { groupId })}
              >
                <Text style={styles.actionIcon}>💳</Text>
                <Text style={styles.actionText}>Contribute</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => navigation.navigate('Transactions', { groupId })}
              >
                <Text style={styles.actionIcon}>📊</Text>
                <Text style={styles.actionText}>Transactions</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => navigation.navigate('SavingsSummary', { groupId })}
              >
                <Text style={styles.actionIcon}>📈</Text>
                <Text style={styles.actionText}>Summary</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => navigation.navigate('InviteMembers', { groupId })}
              >
                <Text style={styles.actionIcon}>➕</Text>
                <Text style={styles.actionText}>Invite</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => navigation.navigate('LoanRequest', { 
                  groupId: groupId.toString(), 
                  groupName: group.name 
                })}
              >
                <Text style={styles.actionIcon}>💰</Text>
                <Text style={styles.actionText}>Request Loan</Text>
              </TouchableOpacity>
            </View>
            
            {isLeader && (
              <View style={styles.leaderActions}>
                <PrimaryButton
                  title="Join Requests"
                  variant="outline"
                  size="medium"
                  onPress={() => navigation.navigate('JoinRequests', { groupId })}
                  style={styles.leaderButton}
                />
                <PrimaryButton
                  title="Group Settings"
                  variant="outline"
                  size="medium"
                  onPress={() => navigation.navigate('GroupSettings', { groupId })}
                  style={styles.leaderButton}
                />
              </View>
            )}
          </Card>

          {/* Members Section */}
          <Card variant="elevated" style={styles.membersCard}>
            <View style={styles.membersHeader}>
              <Text style={styles.sectionTitle}>👥 Members ({members.length})</Text>
              <TouchableOpacity onPress={() => navigation.navigate('GroupHistory', { groupId })}>
                <Text style={styles.viewAllText}>View History</Text>
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={members}
              keyExtractor={(m) => String(m.user_id || m.id)}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <View style={styles.memberItem}>
                  <View style={styles.memberLeft}>
                    <Text style={styles.memberAvatar}>{item.avatar || '👤'}</Text>
                    <View style={styles.memberInfo}>
                      <View style={styles.memberNameRow}>
                        <Text style={styles.memberName}>{item.user_name || item.name || 'Unknown'}</Text>
                        {item.is_leader && <Text style={styles.leaderBadge}>👑</Text>}
                      </View>
                      <Text style={styles.memberEmail}>{item.user_email}</Text>
                      {item.last_contribution && (
                        <Text style={styles.lastContribution}>
                          Last: {formatDate(item.last_contribution)}
                        </Text>
                      )}
                    </View>
                  </View>
                  <View style={styles.memberRight}>
                    <Text style={[styles.memberStatus, { color: getStatusColor(item.status) }]}>
                      {getStatusIcon(item.status)} {item.status?.toUpperCase()}
                    </Text>
                    {item.contribution_amount > 0 && (
                      <Text style={styles.contributionAmount}>
                        {formatCurrency(item.contribution_amount)}
                      </Text>
                    )}
                  </View>
                </View>
              )}
              ItemSeparatorComponent={() => <View style={styles.memberSeparator} />}
            />
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
  headerCard: {
    marginBottom: spacing.l,
  },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  groupInfo: {
    flex: 1,
    marginRight: spacing.m,
  },
  groupName: {
    ...typography.h2,
    marginBottom: spacing.xs,
  },
  groupDescription: {
    ...typography.body,
    color: colors.gray600,
    marginBottom: spacing.m,
    lineHeight: 22,
  },
  groupMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.m,
  },
  metaText: {
    ...typography.caption,
    color: colors.gray500,
  },
  groupStatus: {
    alignItems: 'center',
  },
  statusIcon: {
    fontSize: 24,
    marginBottom: spacing.xs,
  },
  statusText: {
    ...typography.captionSmall,
    fontWeight: '600',
  },
  progressCard: {
    marginBottom: spacing.l,
  },
  sectionTitle: {
    ...typography.h3,
    marginBottom: spacing.m,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: spacing.m,
  },
  currentAmount: {
    ...typography.h2,
    color: colors.brandTeal,
    marginRight: spacing.s,
  },
  targetAmount: {
    ...typography.body,
    color: colors.gray600,
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.l,
  },
  progressBarBackground: {
    flex: 1,
    height: 8,
    backgroundColor: colors.gray200,
    borderRadius: 4,
    marginRight: spacing.m,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.brandTeal,
    borderRadius: 4,
  },
  progressPercentage: {
    ...typography.label,
    color: colors.brandTeal,
    fontWeight: '600',
  },
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    ...typography.labelLarge,
    color: colors.gray900,
    marginBottom: spacing.xs,
  },
  statLabel: {
    ...typography.captionSmall,
    color: colors.gray500,
  },
  actionsCard: {
    marginBottom: spacing.l,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: spacing.m,
  },
  actionButton: {
    width: '23%',
    aspectRatio: 1,
    backgroundColor: colors.backgroundPrimary,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.s,
    ...shadows.small,
  },
  actionIcon: {
    fontSize: 24,
    marginBottom: spacing.xs,
  },
  actionText: {
    ...typography.captionSmall,
    color: colors.gray700,
    textAlign: 'center',
  },
  leaderActions: {
    flexDirection: 'row',
    gap: spacing.s,
    paddingTop: spacing.m,
    borderTopWidth: 1,
    borderTopColor: colors.gray200,
  },
  leaderButton: {
    flex: 1,
  },
  membersCard: {
    marginBottom: spacing.xl,
  },
  membersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.m,
  },
  viewAllText: {
    ...typography.label,
    color: colors.brandTeal,
  },
  memberItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.m,
  },
  memberLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  memberAvatar: {
    fontSize: 32,
    marginRight: spacing.m,
  },
  memberInfo: {
    flex: 1,
  },
  memberNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  memberName: {
    ...typography.labelLarge,
    color: colors.gray900,
    marginRight: spacing.s,
  },
  leaderBadge: {
    fontSize: 16,
  },
  memberEmail: {
    ...typography.caption,
    color: colors.gray500,
    marginBottom: spacing.xs,
  },
  lastContribution: {
    ...typography.captionSmall,
    color: colors.gray400,
  },
  memberRight: {
    alignItems: 'flex-end',
  },
  memberStatus: {
    ...typography.captionSmall,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  contributionAmount: {
    ...typography.label,
    color: colors.brandTeal,
    fontWeight: '600',
  },
  memberSeparator: {
    height: 1,
    backgroundColor: colors.gray200,
    marginLeft: 56, // Align with member info
  },
});

export default GroupDetailsScreen;


