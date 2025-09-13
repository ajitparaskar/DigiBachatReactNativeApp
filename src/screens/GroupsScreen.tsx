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
  Dimensions,
  ScrollView
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Container from '../components/ui/Container';
import Card from '../components/ui/Card';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import EmptyState from '../components/ui/EmptyState';
import PrimaryButton from '../components/ui/PrimaryButton';
import { FadeInView, SlideInView } from '../components/ui/AnimatedComponents';
import { colors, typography, spacing, shadows } from '../theme';
import { getUserGroupsApi, getGroupMembersApi } from '../services/api';
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
      console.log('🔍 Groups API Response:', {
        status: response?.status,
        dataStructure: Object.keys(response?.data || {}),
        groupsArray: response?.data?.data?.groups?.length || 0,
        firstGroupSample: response?.data?.data?.groups?.[0]
      });
      
      if (response?.data?.success && response.data.data?.groups) {
        let groupsData = response.data.data.groups;
        
        // Fetch member count for each group
        const groupsWithMembers = await Promise.all(
          groupsData.map(async (group: any) => {
            try {
              const membersResponse = await getGroupMembersApi(group.id);
              const memberCount = membersResponse?.data?.data?.members?.length || 0;
              console.log(`👥 Group "${group.name}" has ${memberCount} members`);
              return {
                ...group,
                member_count: memberCount
              };
            } catch (error) {
              console.error(`❌ Failed to fetch members for group ${group.id}:`, error);
              return {
                ...group,
                member_count: 0
              };
            }
          })
        );
        
        console.log('✅ Groups with member counts:', groupsWithMembers.map(g => ({name: g.name, members: g.member_count})));
        setGroups(Array.isArray(groupsWithMembers) ? groupsWithMembers : []);
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
        style={styles.premiumGroupCard}
        onPress={() => handleGroupPress(group)}
        activeOpacity={0.85}
      >
        <LinearGradient
          colors={['#FFFFFF', '#FDFDFD', '#F8FFFE']}
          style={styles.premiumCardContainer}
        >
          {/* Card Header with Avatar and Status */}
          <View style={styles.premiumGroupHeader}>
            <View style={styles.groupAvatarContainer}>
              <LinearGradient
                colors={group.is_leader 
                  ? [colors.brandTeal, colors.success]
                  : [colors.info, colors.brandTeal]
                }
                style={styles.groupAvatar}
              >
                <Text style={styles.groupAvatarText}>
                  {group.name.charAt(0).toUpperCase()}
                </Text>
              </LinearGradient>
              
              <LinearGradient
                colors={group.is_leader 
                  ? [colors.warning, colors.warningLight]
                  : [colors.info, colors.infoLight]
                }
                style={styles.premiumStatusBadge}
              >
                <Text style={styles.premiumStatusText}>
                  {group.is_leader ? '👑 Admin' : '👤 Member'}
                </Text>
              </LinearGradient>
            </View>
            
            <View style={styles.groupTitleSection}>
              <Text style={styles.premiumGroupName} numberOfLines={1}>
                {group.name}
              </Text>
              <Text style={styles.premiumGroupDescription} numberOfLines={2}>
                {group.description || 'Building wealth together through smart savings'}
              </Text>
            </View>
          </View>

          {/* Enhanced Stats Section */}
          <View style={styles.premiumStatsContainer}>
            <LinearGradient
              colors={[colors.success + '15', colors.success + '08']}
              style={styles.premiumStatCard}
            >
              <Text style={styles.statIconPremium}>💰</Text>
              <Text
                style={styles.statValuePremium}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.7}
              >
                ₹{(group.total_savings || 0).toLocaleString()}
              </Text>
              <Text style={styles.statLabelPremium}>Total Saved</Text>
            </LinearGradient>
            
            <LinearGradient
              colors={[colors.info + '15', colors.info + '08']}
              style={styles.premiumStatCard}
            >
              <Text style={styles.statIconPremium}>💳</Text>
              <Text
                style={styles.statValuePremium}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.7}
              >
                ₹{(group.savings_amount || 0).toLocaleString()}
              </Text>
              <Text style={styles.statLabelPremium}>{getFrequencyText(group.savings_frequency)}</Text>
            </LinearGradient>
            
            <LinearGradient
              colors={[colors.brandTeal + '15', colors.brandTeal + '08']}
              style={styles.premiumStatCard}
            >
              <Text style={styles.statIconPremium}>👥</Text>
              <Text
                style={styles.statValuePremium}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.7}
              >
                {group.member_count || 0}
              </Text>
              <Text style={styles.statLabelPremium}>Members</Text>
            </LinearGradient>
          </View>

          {/* Card Footer */}
          <View style={styles.premiumGroupFooter}>
            <LinearGradient
              colors={[colors.gray100, colors.gray50]}
              style={styles.groupCodeContainer}
            >
              <Text style={styles.premiumGroupCode}>
                🔑 {group.group_code || 'N/A'}
              </Text>
            </LinearGradient>
            
            <LinearGradient
              colors={[colors.brandTeal + '20', colors.brandTeal + '10']}
              style={styles.chevronContainer}
            >
              <Text style={styles.premiumChevron}>→</Text>
            </LinearGradient>
          </View>
          
          {/* Decorative Elements */}
          <View style={styles.cardDecoration1} />
          <View style={styles.cardDecoration2} />
        </LinearGradient>
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
    <FadeInView>
      <LinearGradient
        colors={[colors.brandTeal, colors.info, colors.success]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.premiumHeader}
      >
        {/* Background decorative elements */}
        <View style={styles.headerDecoration1} />
        <View style={styles.headerDecoration2} />
        <View style={styles.headerDecoration3} />
        
        <View style={styles.headerContent}>
          <Text style={styles.premiumTitle}>💎 My Groups</Text>
          <Text style={styles.premiumSubtitle}>
            Manage your premium savings groups and track your wealth journey
          </Text>
          
          <View style={styles.premiumActionButtons}>
            <LinearGradient
              colors={[colors.white + 'E6', colors.white + 'CC']}
              style={styles.premiumActionButton}
            >
              <TouchableOpacity
                onPress={handleCreateGroup}
                style={styles.premiumButtonTouchable}
                activeOpacity={0.8}
              >
                <Text style={styles.premiumButtonTextPrimary}>✨ Create Group</Text>
              </TouchableOpacity>
            </LinearGradient>
            
            <LinearGradient
              colors={[colors.white + 'E6', colors.white + 'CC']}
              style={styles.premiumActionButton}
            >
              <TouchableOpacity
                onPress={handleJoinGroup}
                style={styles.premiumButtonTouchable}
                activeOpacity={0.8}
              >
                <Text style={styles.premiumButtonTextPrimary}>🚀 Join Group</Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        </View>
      </LinearGradient>
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
  
  // New Premium Card Styles
  premiumGroupCard: {
    marginHorizontal: spacing.l,
    marginVertical: spacing.m,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: colors.brandTeal,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 12,
  },
  premiumCardContainer: {
    padding: 20,
    position: 'relative',
    borderWidth: 1,
    borderColor: colors.gray100,
  },
  premiumGroupHeader: {
    marginBottom: spacing.l,
  },
  groupAvatarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.m,
  },
  groupAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.m,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  groupAvatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.white,
  },
  premiumStatusBadge: {
    paddingHorizontal: spacing.m,
    paddingVertical: 6,
    borderRadius: 20,
    marginLeft: 'auto',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  premiumStatusText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.white,
  },
  groupTitleSection: {
    flex: 1,
  },
  premiumGroupName: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textDark,
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  premiumGroupDescription: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
    opacity: 0.8,
  },
  premiumStatsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.l,
    gap: spacing.s,
  },
  premiumStatCard: {
    flex: 1,
    paddingVertical: spacing.m,
    paddingHorizontal: spacing.xs,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.gray50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    minHeight: 85,
    justifyContent: 'center',
  },
  statIconPremium: {
    fontSize: 22,
    marginBottom: 6,
  },
  statValuePremium: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textDark,
    marginBottom: 3,
    textAlign: 'center',
    lineHeight: 16,
    includeFontPadding: false,
    flexShrink: 1,
    maxWidth: '100%',
  },
  statLabelPremium: {
    fontSize: 10,
    color: colors.textSecondary,
    textAlign: 'center',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    lineHeight: 12,
    includeFontPadding: false,
  },
  premiumGroupFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.m,
  },
  groupCodeContainer: {
    flex: 1,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    borderRadius: spacing.m,
    borderWidth: 1,
    borderColor: colors.gray100,
  },
  premiumGroupCode: {
    fontSize: 12,
    color: colors.textSecondary,
    fontFamily: 'monospace',
    fontWeight: '600',
  },
  chevronContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.brandTeal + '30',
  },
  premiumChevron: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.brandTeal,
  },
  cardDecoration1: {
    position: 'absolute',
    top: -10,
    right: -10,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.brandTeal + '05',
  },
  cardDecoration2: {
    position: 'absolute',
    bottom: -15,
    left: -15,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.success + '08',
  },
  
  // Premium Header Styles
  premiumHeader: {
    padding: 24,
    marginBottom: spacing.l,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 16,
    position: 'relative',
    overflow: 'hidden',
  },
  headerContent: {
    position: 'relative',
    zIndex: 1,
  },
  headerDecoration1: {
    position: 'absolute',
    top: -30,
    right: -30,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.white + '10',
  },
  headerDecoration2: {
    position: 'absolute',
    bottom: -20,
    left: -20,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.white + '08',
  },
  headerDecoration3: {
    position: 'absolute',
    top: '50%',
    right: '10%',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white + '15',
  },
  premiumTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.white,
    marginBottom: 8,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    letterSpacing: -0.5,
  },
  premiumSubtitle: {
    fontSize: 16,
    color: colors.white + 'E6',
    marginBottom: 24,
    lineHeight: 22,
    opacity: 0.9,
  },
  premiumActionButtons: {
    flexDirection: 'row',
    gap: 16,
  },
  premiumActionButton: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.white + '30',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  secondaryButton: {
    borderColor: colors.white + '50',
  },
  premiumButtonTouchable: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  premiumButtonTextPrimary: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.brandTeal,
  },
  premiumButtonTextSecondary: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.white,
  },
});

export default GroupsScreen;
