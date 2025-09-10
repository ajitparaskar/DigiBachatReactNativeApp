import React, { useEffect, useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Alert, 
  TouchableOpacity, 
  StatusBar, 
  ScrollView, 
  TextInput, 
  FlatList, 
  RefreshControl,
  Dimensions 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Container from '../components/ui/Container';
import Card from '../components/ui/Card';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import EmptyState from '../components/ui/EmptyState';
import PrimaryButton from '../components/ui/PrimaryButton';
import { FadeInView, SlideInView, ScaleInView } from '../components/ui/AnimatedComponents';
import { LongPressButton } from '../components/ui/MicroInteractions';
import { colors, typography, spacing, shadows } from '../theme';
import { 
  getUserTotalSavingsApi, 
  getUserGroupsApi, 
  getCurrentUserApi,
} from '../services/api';
import GroupHistoryModal from '../components/modals/GroupHistoryModal';
import GroupMembersModal from '../components/modals/GroupMembersModal';
import InviteMemberModal from '../components/modals/InviteMemberModal';
import ContributionModal from '../components/modals/ContributionModal';

const { width } = Dimensions.get('window');

interface Group {
  id: string | number;
  name: string;
  description: string;
  savings_amount: number;
  savings_frequency: 'weekly' | 'monthly';
  interest_rate: number;
  total_savings?: number;
  group_code?: string;
  is_leader?: boolean;
  member_count?: number;
}

const DashboardScreen: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalSavings, setTotalSavings] = useState<number>(0);
  const [groups, setGroups] = useState<Group[]>([]);
  const [filteredGroups, setFilteredGroups] = useState<Group[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [userName, setUserName] = useState('User');
  
  // Modal states
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showContributeModal, setShowContributeModal] = useState(false);
  const [selectedGroupForModal, setSelectedGroupForModal] = useState<Group | null>(null);
  
  const navigation = useNavigation<any>();

  useEffect(() => {
    loadDashboardData();
  }, []);

  useEffect(() => {
    applySearchFilter();
  }, [groups, searchQuery]);

  const loadDashboardData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const [userResponse, groupsResponse, savingsResponse] = await Promise.all([
        getCurrentUserApi().catch(() => null),
        getUserGroupsApi().catch(() => null),
        getUserTotalSavingsApi().catch(() => null),
      ]);

      // Set user name
      if (userResponse?.data?.data?.name) {
        setUserName(userResponse.data.data.name);
      }

      // Set groups
      if (groupsResponse?.data?.success && groupsResponse.data.data?.groups) {
        const groupsData = groupsResponse.data.data.groups;
        setGroups(Array.isArray(groupsData) ? groupsData : []);
      } else {
        setGroups([]);
      }

      // Set total savings
      if (savingsResponse?.data?.success && typeof savingsResponse.data.data?.total_savings === 'number') {
        setTotalSavings(savingsResponse.data.data.total_savings);
      } else {
        setTotalSavings(0);
      }

    } catch (error: any) {
      console.error('Error loading dashboard data:', error);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const applySearchFilter = () => {
    if (!searchQuery.trim()) {
      setFilteredGroups(groups);
    } else {
      const filtered = groups.filter(group =>
        group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        group.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredGroups(filtered);
    }
  };

  const onRefresh = useCallback(() => {
    loadDashboardData(true);
  }, []);

  const handleGroupPress = (group: Group) => {
    navigation.navigate('GroupDetails', { groupId: Number(group.id) });
  };

  const handleShowHistory = (group: Group) => {
    setSelectedGroupForModal(group);
    setShowHistoryModal(true);
  };

  const handleShowMembers = (group: Group) => {
    setSelectedGroupForModal(group);
    setShowMembersModal(true);
  };

  const handleInviteMembers = (group: Group) => {
    setSelectedGroupForModal(group);
    setShowInviteModal(true);
  };

  const handleContribute = (group: Group) => {
    setSelectedGroupForModal(group);
    setShowContributeModal(true);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString()}`;
  };

  const renderStatsCard = () => (
    <FadeInView style={styles.statsCard}>
      <Card style={styles.statsContent}>
        <View style={styles.statsHeader}>
          <Text style={styles.statsTitle}>Your Savings Overview</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('TotalSavings')}
            style={styles.viewAllButton}
          >
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Total Savings</Text>
            <Text style={styles.statValue}>
              {formatCurrency(totalSavings)}
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Active Groups</Text>
            <Text style={styles.statValue}>{groups.length}</Text>
          </View>
        </View>
      </Card>
    </FadeInView>
  );

  const renderQuickActions = () => (
    <SlideInView delay={200} style={styles.quickActionsSection}>
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.quickActionsGrid}>
        <TouchableOpacity
          style={styles.quickActionCard}
          onPress={() => navigation.navigate('CreateGroup')}
        >
          <Text style={styles.quickActionIcon}>➕</Text>
          <Text style={styles.quickActionText}>Create Group</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.quickActionCard}
          onPress={() => navigation.navigate('JoinGroup')}
        >
          <Text style={styles.quickActionIcon}>🤝</Text>
          <Text style={styles.quickActionText}>Join Group</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.quickActionCard}
          onPress={() => navigation.navigate('Loans')}
        >
          <Text style={styles.quickActionIcon}>💰</Text>
          <Text style={styles.quickActionText}>Loans</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.quickActionCard}
          onPress={() => {
            try {
              navigation.navigate('Analytics');
            } catch (error) {
              Alert.alert('Notice', 'Analytics feature is currently unavailable. Please try again later.');
            }
          }}
        >
          <Text style={styles.quickActionIcon}>📈</Text>
          <Text style={styles.quickActionText}>Analytics</Text>
        </TouchableOpacity>
      </View>
    </SlideInView>
  );

  const renderGroupCard = ({ item: group, index }: { item: Group; index: number }) => (
    <ScaleInView delay={300 + index * 100} key={group.id}>
      <Card style={styles.groupCard}>
        <TouchableOpacity
          onPress={() => handleGroupPress(group)}
          style={styles.groupCardContent}
        >
          <View style={styles.groupHeader}>
            <View style={styles.groupInfo}>
              <Text style={styles.groupName} numberOfLines={1}>
                {group.name}
              </Text>
              <Text style={styles.groupDescription} numberOfLines={2}>
                {group.description || 'No description'}
              </Text>
            </View>
            <View style={[styles.roleBadge, { 
              backgroundColor: group.is_leader ? colors.brandTeal : colors.info 
            }]}>
              <Text style={styles.roleBadgeText}>
                {group.is_leader ? 'Admin' : 'Member'}
              </Text>
            </View>
          </View>

          <View style={styles.groupStats}>
            <View style={styles.groupStatItem}>
              <Text style={styles.groupStatLabel}>Total Savings</Text>
              <Text style={styles.groupStatValue}>
                {formatCurrency(group.total_savings || 0)}
              </Text>
            </View>
            <View style={styles.groupStatItem}>
              <Text style={styles.groupStatLabel}>Monthly</Text>
              <Text style={styles.groupStatValue}>
                {formatCurrency(group.savings_amount || 0)}
              </Text>
            </View>
          </View>

          <View style={styles.groupActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleContribute(group)}
            >
              <Text style={styles.actionButtonText}>Contribute</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleShowMembers(group)}
            >
              <Text style={styles.actionButtonText}>Members</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleShowHistory(group)}
            >
              <Text style={styles.actionButtonText}>History</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Card>
    </ScaleInView>
  );

  const renderGroupsList = () => (
    <SlideInView delay={400} style={styles.groupsSection}>
      <View style={styles.groupsHeader}>
        <Text style={styles.sectionTitle}>My Groups</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('Groups')}
          style={styles.viewAllButton}
        >
          <Text style={styles.viewAllText}>View All</Text>
        </TouchableOpacity>
      </View>

      {groups.length > 3 && (
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search groups..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={colors.gray500}
          />
        </View>
      )}

      {filteredGroups.length === 0 ? (
        <EmptyState
          icon="👥"
          title="No Groups Found"
          description={searchQuery ? "No groups match your search." : "You haven't joined any groups yet."}
          actionText="Create Group"
          onAction={() => navigation.navigate('CreateGroup')}
          secondaryActionText="Join Group"
          onSecondaryAction={() => navigation.navigate('JoinGroup')}
        />
      ) : (
        <FlatList
          data={filteredGroups.slice(0, 3)}
          renderItem={renderGroupCard}
          keyExtractor={(item) => item.id.toString()}
          scrollEnabled={false}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SlideInView>
  );

  if (loading) {
    return <LoadingSpinner text="Loading your dashboard..." />;
  }

  if (error) {
    return (
      <Container style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.backgroundSecondary} />
        <EmptyState
          icon="❌"
          title="Error Loading Dashboard"
          description={error}
          actionText="Try Again"
          onAction={() => loadDashboardData()}
        />
      </Container>
    );
  }

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor={colors.backgroundSecondary} />
      <Container style={styles.container}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Header */}
          <FadeInView style={styles.header}>
            <Text style={styles.greeting}>{getGreeting()}, {userName}!</Text>
            <Text style={styles.headerSubtitle}>Here's your savings overview</Text>
          </FadeInView>

          {/* Stats Card */}
          {renderStatsCard()}

          {/* Quick Actions */}
          {renderQuickActions()}

          {/* Groups List */}
          {renderGroupsList()}
        </ScrollView>

        {/* Modals */}
        {selectedGroupForModal && (
          <>
            <GroupHistoryModal
              visible={showHistoryModal}
              onClose={() => setShowHistoryModal(false)}
              groupId={selectedGroupForModal.id}
              groupName={selectedGroupForModal.name}
            />
            
            <GroupMembersModal
              visible={showMembersModal}
              onClose={() => setShowMembersModal(false)}
              groupId={selectedGroupForModal.id}
              groupName={selectedGroupForModal.name}
            />
            
            <InviteMemberModal
              visible={showInviteModal}
              onClose={() => setShowInviteModal(false)}
              groupId={selectedGroupForModal.id}
              groupName={selectedGroupForModal.name}
            />
            
            <ContributionModal
              visible={showContributeModal}
              onClose={() => setShowContributeModal(false)}
              groupId={selectedGroupForModal.id}
              groupName={selectedGroupForModal.name}
            />
          </>
        )}
      </Container>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
  },
  scrollContent: {
    paddingBottom: spacing.xl,
  },
  header: {
    backgroundColor: colors.white,
    padding: spacing.l,
    marginBottom: spacing.l,
    borderBottomLeftRadius: spacing.l,
    borderBottomRightRadius: spacing.l,
    ...shadows.medium,
  },
  greeting: {
    ...typography.h2,
    color: colors.gray900,
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    ...typography.body,
    color: colors.gray600,
  },
  statsCard: {
    marginHorizontal: spacing.l,
    marginBottom: spacing.l,
  },
  statsContent: {
    padding: spacing.l,
  },
  statsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.l,
  },
  statsTitle: {
    ...typography.h3,
    color: colors.gray900,
  },
  viewAllButton: {
    paddingHorizontal: spacing.s,
    paddingVertical: spacing.xs,
  },
  viewAllText: {
    ...typography.labelMedium,
    color: colors.brandTeal,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    ...typography.caption,
    color: colors.gray500,
    marginBottom: spacing.xs,
  },
  statValue: {
    ...typography.h3,
    color: colors.gray900,
    fontWeight: '600',
  },
  quickActionsSection: {
    marginHorizontal: spacing.l,
    marginBottom: spacing.l,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.gray900,
    marginBottom: spacing.m,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.s,
  },
  quickActionCard: {
    width: (width - spacing.l * 2 - spacing.s) / 2,
    backgroundColor: colors.white,
    padding: spacing.m,
    borderRadius: spacing.m,
    alignItems: 'center',
    ...shadows.small,
  },
  quickActionIcon: {
    fontSize: 24,
    marginBottom: spacing.s,
  },
  quickActionText: {
    ...typography.labelMedium,
    color: colors.gray900,
    fontWeight: '500',
  },
  groupsSection: {
    marginHorizontal: spacing.l,
  },
  groupsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.m,
  },
  searchContainer: {
    marginBottom: spacing.m,
  },
  searchInput: {
    backgroundColor: colors.white,
    borderRadius: spacing.m,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    ...typography.body,
    color: colors.gray900,
    ...shadows.small,
  },
  groupCard: {
    marginBottom: spacing.m,
  },
  groupCardContent: {
    padding: spacing.l,
  },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.m,
  },
  groupInfo: {
    flex: 1,
    marginRight: spacing.m,
  },
  groupName: {
    ...typography.h4,
    color: colors.gray900,
    marginBottom: spacing.xs,
  },
  groupDescription: {
    ...typography.body,
    color: colors.gray600,
    lineHeight: 20,
  },
  roleBadge: {
    paddingHorizontal: spacing.s,
    paddingVertical: spacing.xs,
    borderRadius: spacing.s,
  },
  roleBadgeText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: '600',
  },
  groupStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.m,
    paddingVertical: spacing.s,
    borderTopWidth: 1,
    borderTopColor: colors.gray200,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  groupStatItem: {
    alignItems: 'center',
    flex: 1,
  },
  groupStatLabel: {
    ...typography.caption,
    color: colors.gray500,
    marginBottom: spacing.xs,
  },
  groupStatValue: {
    ...typography.labelLarge,
    color: colors.gray900,
    fontWeight: '600',
  },
  groupActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: spacing.s,
  },
  actionButton: {
    flex: 1,
    backgroundColor: colors.gray100,
    paddingVertical: spacing.s,
    borderRadius: spacing.s,
    alignItems: 'center',
  },
  actionButtonText: {
    ...typography.labelMedium,
    color: colors.gray700,
    fontWeight: '500',
  },
});

export default DashboardScreen;
