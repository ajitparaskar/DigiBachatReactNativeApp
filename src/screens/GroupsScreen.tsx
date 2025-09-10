import React, { useEffect, useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  Alert, 
  TouchableOpacity, 
  StatusBar, 
  RefreshControl,
  Dimensions
} from 'react-native';
import Container from '../components/ui/Container';
import Card from '../components/ui/Card';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import EmptyState from '../components/ui/EmptyState';
import PrimaryButton from '../components/ui/PrimaryButton';
import { FadeInView, SlideInView } from '../components/ui/AnimatedComponents';
import { colors, typography, spacing, shadows } from '../theme';
import { getUserGroupsApi } from '../services/api';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';

const { width } = Dimensions.get('window');

type Group = {
  id: number | string;
  name: string;
  description?: string;
  savings_amount?: number;
  savings_frequency?: 'weekly' | 'monthly';
  interest_rate?: number;
  total_savings?: number;
  group_code?: string;
  is_leader?: boolean;
  member_count?: number;
  created_at?: string;
  updated_at?: string;
};

type Props = NativeStackScreenProps<RootStackParamList, 'Groups'>;

const GroupsScreen: React.FC<Props> = ({ navigation }) => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadGroups = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const response = await getUserGroupsApi();
      
      if (response?.data?.success && response.data.data?.groups) {
        const groupsData = response.data.data.groups;
        setGroups(Array.isArray(groupsData) ? groupsData : []);
      } else {
        setGroups([]);
      }
    } catch (error: any) {
      console.error('Error loading groups:', error);
      setError('Failed to load groups. Please try again.');
      setGroups([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadGroups();
  }, [loadGroups]);

  const onRefresh = useCallback(() => {
    loadGroups(true);
  }, [loadGroups]);

  const handleGroupPress = (group: Group) => {
    navigation.navigate('GroupDetails', { groupId: Number(group.id) });
  };

  const handleCreateGroup = () => {
    navigation.navigate('CreateGroup');
  };

  const handleJoinGroup = () => {
    navigation.navigate('JoinGroup');
  };

  const getFrequencyText = (frequency?: string) => {
    return frequency === 'weekly' ? 'Weekly' : 'Monthly';
  };

  const getStatusColor = (isLeader?: boolean) => {
    return isLeader ? colors.brandTeal : colors.info;
  };

  const getStatusText = (isLeader?: boolean) => {
    return isLeader ? 'Admin' : 'Member';
  };

  const renderGroupCard = ({ item: group, index }: { item: Group; index: number }) => (
    <SlideInView delay={index * 100} key={group.id}>
      <TouchableOpacity
        style={styles.groupCard}
        onPress={() => handleGroupPress(group)}
        activeOpacity={0.7}
      >
        <Card style={styles.cardContent}>
          <View style={styles.groupHeader}>
            <View style={styles.groupInfo}>
              <Text style={styles.groupName} numberOfLines={1}>
                {group.name}
              </Text>
              <Text style={styles.groupDescription} numberOfLines={2}>
                {group.description || 'No description available'}
              </Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(group.is_leader) }]}>
              <Text style={styles.statusText}>
                {getStatusText(group.is_leader)}
              </Text>
            </View>
          </View>

          <View style={styles.groupStats}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Total Savings</Text>
              <Text style={styles.statValue}>
                ₹{(group.total_savings || 0).toLocaleString()}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Contribution</Text>
              <Text style={styles.statValue}>
                ₹{(group.savings_amount || 0).toLocaleString()}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Frequency</Text>
              <Text style={styles.statValue}>
                {getFrequencyText(group.savings_frequency)}
              </Text>
            </View>
          </View>

          {group.member_count && (
            <View style={styles.memberInfo}>
              <Text style={styles.memberCount}>
                👥 {group.member_count} member{group.member_count !== 1 ? 's' : ''}
              </Text>
            </View>
          )}

          <View style={styles.groupFooter}>
            <Text style={styles.groupCode}>
              Code: {group.group_code || 'N/A'}
            </Text>
            <Text style={styles.chevron}>›</Text>
          </View>
        </Card>
      </TouchableOpacity>
    </SlideInView>
  );

  const renderEmptyState = () => (
    <EmptyState
      icon="👥"
      title="No Groups Yet"
      description="You haven't joined any savings groups yet. Create a new group or join an existing one to start your savings journey."
      actionText="Create Group"
      onAction={handleCreateGroup}
      secondaryActionText="Join Group"
      onSecondaryAction={handleJoinGroup}
    />
  );

  const renderHeader = () => (
    <FadeInView style={styles.header}>
      <Text style={styles.title}>My Groups</Text>
      <Text style={styles.subtitle}>
        Manage your savings groups and track your progress
      </Text>
      
      <View style={styles.actionButtons}>
        <PrimaryButton
          title="Create Group"
          onPress={handleCreateGroup}
          style={styles.actionButton}
          variant="outline"
        />
        <PrimaryButton
          title="Join Group"
          onPress={handleJoinGroup}
          style={styles.actionButton}
        />
      </View>
    </FadeInView>
  );

  if (loading) {
    return <LoadingSpinner text="Loading your groups..." />;
  }

  if (error) {
    return (
      <Container style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.backgroundSecondary} />
        <EmptyState
          icon="❌"
          title="Error Loading Groups"
          description={error}
          actionText="Try Again"
          onAction={() => loadGroups()}
        />
      </Container>
    );
  }

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor={colors.backgroundSecondary} />
      <Container style={styles.container}>
        <FlatList
          data={groups}
          renderItem={renderGroupCard}
          keyExtractor={(item) => item.id.toString()}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmptyState}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      </Container>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
  },
  listContent: {
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
  title: {
    ...typography.h2,
    color: colors.gray900,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    color: colors.gray600,
    marginBottom: spacing.l,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: spacing.m,
  },
  actionButton: {
    flex: 1,
  },
  groupCard: {
    marginHorizontal: spacing.l,
    marginBottom: spacing.m,
  },
  cardContent: {
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
    ...typography.h3,
    color: colors.gray900,
    marginBottom: spacing.xs,
  },
  groupDescription: {
    ...typography.body,
    color: colors.gray600,
    lineHeight: 20,
  },
  statusBadge: {
    paddingHorizontal: spacing.s,
    paddingVertical: spacing.xs,
    borderRadius: spacing.s,
  },
  statusText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: '600',
  },
  groupStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.m,
    paddingVertical: spacing.s,
    borderTopWidth: 1,
    borderTopColor: colors.gray200,
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
    ...typography.labelLarge,
    color: colors.gray900,
    fontWeight: '600',
  },
  memberInfo: {
    marginBottom: spacing.s,
  },
  memberCount: {
    ...typography.caption,
    color: colors.gray600,
  },
  groupFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.s,
    borderTopWidth: 1,
    borderTopColor: colors.gray200,
  },
  groupCode: {
    ...typography.caption,
    color: colors.gray500,
  },
  chevron: {
    ...typography.h3,
    color: colors.gray400,
    fontWeight: '300',
  },
});

export default GroupsScreen;
