import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Alert, 
  StatusBar,
  RefreshControl,
  ActivityIndicator
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Container from '../components/ui/Container';
import Card from '../components/ui/Card';
import PrimaryButton from '../components/ui/PrimaryButton';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import EmptyState from '../components/ui/EmptyState';
import { FadeInView, SlideInView } from '../components/ui/AnimatedComponents';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { getUserGroupsApi, getJoinRequestsApi, approveJoinRequestApi, rejectJoinRequestApi } from '../services/api';
import { colors, typography, spacing, shadows } from '../theme';

interface JoinRequest {
  id: number;
  user_name: string;
  user_email: string;
  status: string;
  requested_at: string;
  group_id: number;
}

interface Group {
  id: number;
  name: string;
  description?: string;
  created_by: number;
  member_count?: number;
  is_leader?: boolean;
  role?: string;
}

interface GroupWithRequests {
  group: Group;
  requests: JoinRequest[];
}

type Props = NativeStackScreenProps<RootStackParamList, 'JoinRequests'>;

const JoinRequestsScreen: React.FC<Props> = ({ navigation }) => {
  const [groupsWithRequests, setGroupsWithRequests] = useState<GroupWithRequests[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processingRequest, setProcessingRequest] = useState<number | null>(null);

  const fetchJoinRequests = useCallback(async (showLoading = false) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
      setError(null);

      // Get user's groups where they are the leader
      const groupsResponse = await getUserGroupsApi();
      
      if (!groupsResponse?.data?.success || !groupsResponse.data.data?.groups) {
        throw new Error('Failed to fetch groups');
      }

      const allGroups = groupsResponse.data.data.groups;
      
      // Filter groups where current user is the leader with better logic
      const leaderGroups = allGroups.filter((group: Group) => {
        // Check multiple conditions for leadership
        return group.created_by || group.is_leader || group.role === 'admin' || group.role === 'leader';
      });

      if (leaderGroups.length === 0) {
        console.log('User is not a leader of any groups');
        setGroupsWithRequests([]);
        return;
      }

      // Fetch join requests for each leader group with better error handling
      const groupsWithRequestsData: GroupWithRequests[] = [];
      
      for (const group of leaderGroups) {
        try {
          const requestsResponse = await getJoinRequestsApi(group.id);
          
          if (requestsResponse?.data?.success && requestsResponse.data.data?.requests) {
            const pendingRequests = requestsResponse.data.data.requests.filter(
              (req: JoinRequest) => req.status === 'pending'
            );
            
            if (pendingRequests.length > 0) {
              groupsWithRequestsData.push({
                group,
                requests: pendingRequests
              });
            }
          }
        } catch (err: any) {
          // Handle specific error codes
          if (err.response?.status === 403) {
            console.warn(`Access denied for group ${group.id} (${group.name}). User may not have admin permissions.`);
            // Continue to next group instead of failing completely
          } else if (err.response?.status === 404) {
            console.warn(`Join requests endpoint not found for group ${group.id}. API may not be implemented.`);
          } else {
            console.error(`Failed to fetch requests for group ${group.id}:`, err);
          }
          // Continue processing other groups
        }
      }

      setGroupsWithRequests(groupsWithRequestsData);
    } catch (err: any) {
      console.error('Error fetching join requests:', err);
      
      // Provide more specific error messages
      if (err.response?.status === 401) {
        setError('Authentication failed. Please log in again.');
      } else if (err.response?.status === 403) {
        setError('You do not have permission to view join requests.');
      } else {
        setError('Failed to load join requests. Please try again.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchJoinRequests();
  }, [fetchJoinRequests]);

  const onRefresh = useCallback(() => {
    fetchJoinRequests(true);
  }, [fetchJoinRequests]);

  const handleApproveRequest = async (requestId: number, groupId: number, groupName: string, userName: string) => {
    Alert.alert(
      'Approve Request',
      `Are you sure you want to approve ${userName}'s request to join "${groupName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve',
          style: 'default',
          onPress: async () => {
            try {
              setProcessingRequest(requestId);
              await approveJoinRequestApi(groupId, requestId);
              
              Alert.alert(
                'Request Approved! ✅',
                `${userName} has been successfully added to "${groupName}".`
              );
              
              // Refresh the requests list
              fetchJoinRequests();
            } catch (error: any) {
              console.error('Error approving request:', error);
              Alert.alert(
                'Approval Failed',
                error?.response?.data?.message || 'Failed to approve request. Please try again.'
              );
            } finally {
              setProcessingRequest(null);
            }
          }
        }
      ]
    );
  };

  const handleRejectRequest = async (requestId: number, groupId: number, groupName: string, userName: string) => {
    Alert.alert(
      'Reject Request',
      `Are you sure you want to reject ${userName}'s request to join "${groupName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            try {
              setProcessingRequest(requestId);
              await rejectJoinRequestApi(groupId, requestId);
              
              Alert.alert(
                'Request Rejected',
                `${userName}'s request to join "${groupName}" has been rejected.`
              );
              
              // Refresh the requests list
              fetchJoinRequests();
            } catch (error: any) {
              console.error('Error rejecting request:', error);
              Alert.alert(
                'Rejection Failed',
                error?.response?.data?.message || 'Failed to reject request. Please try again.'
              );
            } finally {
              setProcessingRequest(null);
            }
          }
        }
      ]
    );
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Unknown date';
    }
  };

  const renderRequestCard = (request: JoinRequest, group: Group, index: number) => (
    <SlideInView delay={index * 100} key={request.id}>
      <LinearGradient
        colors={[colors.white, colors.gray50]}
        style={styles.requestCard}
      >
        <View style={styles.requestHeader}>
          <View style={styles.userInfo}>
            <LinearGradient
              colors={[colors.brandTeal, colors.brandAccent]}
              style={styles.avatar}
            >
              <Text style={styles.avatarText}>
                {request.user_name.charAt(0).toUpperCase()}
              </Text>
            </LinearGradient>
            <View style={styles.userDetails}>
              <Text style={styles.userName}>{request.user_name} 👤</Text>
              <Text style={styles.userEmail}>📫 {request.user_email}</Text>
              <Text style={styles.requestDate}>
                📅 Requested on {formatDate(request.requested_at)}
              </Text>
            </View>
          </View>
          <LinearGradient
            colors={[colors.warning, colors.warningLight]}
            style={styles.statusBadge}
          >
            <Text style={styles.statusText}>Pending ⏳</Text>
          </LinearGradient>
        </View>

        <LinearGradient
          colors={[colors.gray100, colors.gray50]}
          style={styles.groupInfo}
        >
          <Text style={styles.groupLabel}>Wants to join:</Text>
          <Text style={styles.groupName}>💼 {group.name}</Text>
        </LinearGradient>

        <View style={styles.actionButtons}>
          <TouchableOpacity 
            onPress={() => handleRejectRequest(request.id, group.id, group.name, request.user_name)}
            disabled={processingRequest === request.id}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[colors.error, colors.dangerLight]}
              style={[styles.actionButton, styles.rejectButton]}
            >
              <Text style={styles.actionButtonText}>
                {processingRequest === request.id ? 'Rejecting... ⏳' : 'Reject ❌'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => handleApproveRequest(request.id, group.id, group.name, request.user_name)}
            disabled={processingRequest === request.id}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[colors.success, colors.successLight]}
              style={[styles.actionButton, styles.approveButton]}
            >
              <Text style={styles.actionButtonText}>
                {processingRequest === request.id ? 'Approving... ⏳' : 'Approve ✅'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </SlideInView>
  );

  const renderGroupSection = (groupWithRequests: GroupWithRequests, groupIndex: number) => (
    <View key={groupWithRequests.group.id} style={styles.groupSection}>
      <FadeInView delay={groupIndex * 200}>
        <View style={styles.groupHeader}>
          <Text style={styles.groupSectionTitle}>{groupWithRequests.group.name}</Text>
          <View style={styles.requestCountBadge}>
            <Text style={styles.requestCountText}>
              {groupWithRequests.requests.length} request{groupWithRequests.requests.length !== 1 ? 's' : ''}
            </Text>
          </View>
        </View>
      </FadeInView>
      
      {groupWithRequests.requests.map((request, requestIndex) =>
        renderRequestCard(request, groupWithRequests.group, requestIndex)
      )}
    </View>
  );

  const renderEmptyState = () => (
    <EmptyState
      icon="👥"
      title="No Pending Requests"
      description="You don't have any pending join requests for your groups. When someone requests to join your groups, they'll appear here for approval."
      actionText="View My Groups"
      onAction={() => navigation.navigate('Groups')}
    />
  );

  if (loading) {
    return <LoadingSpinner text="Loading join requests..." />;
  }

  if (error) {
    return (
      <Container style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.backgroundSecondary} />
        <EmptyState
          icon="❌"
          title="Error Loading Requests"
          description={error}
          actionText="Try Again"
          onAction={() => fetchJoinRequests()}
        />
      </Container>
    );
  }

  const totalRequests = groupsWithRequests.reduce(
    (total, group) => total + group.requests.length,
    0
  );

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor={colors.backgroundSecondary} />
      <Container style={styles.container}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <FadeInView>
            <LinearGradient
              colors={[colors.white, colors.gray50]}
              style={styles.header}
            >
              <LinearGradient
                colors={[colors.brandTeal, colors.brandAccent]}
                style={styles.headerIcon}
              >
                <Text style={styles.icon}>👥</Text>
              </LinearGradient>
              <Text style={styles.title}>Join Requests</Text>
              <Text style={styles.subtitle}>
                {totalRequests > 0
                  ? `You have ${totalRequests} pending request${totalRequests !== 1 ? 's' : ''} to review`
                  : 'Manage requests to join your groups'
                }
              </Text>
              {totalRequests > 0 && (
                <LinearGradient
                  colors={[colors.warning, colors.warningLight]}
                  style={styles.pendingBadge}
                >
                  <Text style={styles.pendingBadgeText}>{totalRequests} Pending</Text>
                </LinearGradient>
              )}
            </LinearGradient>
          </FadeInView>

          {groupsWithRequests.length === 0 ? (
            renderEmptyState()
          ) : (
            <View style={styles.requestsList}>
              {groupsWithRequests.map((groupWithRequests, index) =>
                renderGroupSection(groupWithRequests, index)
              )}
            </View>
          )}
        </ScrollView>
      </Container>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
  },
  header: {
    padding: spacing.xl,
    marginBottom: spacing.l,
    borderBottomLeftRadius: spacing.xxl,
    borderBottomRightRadius: spacing.xxl,
    ...shadows.large,
    alignItems: 'center',
  },
  headerIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.m,
    ...shadows.medium,
  },
  pendingBadge: {
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    borderRadius: spacing.l,
    marginTop: spacing.m,
    ...shadows.small,
  },
  pendingBadgeText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: '700',
  },
  icon: {
    fontSize: 36,
    color: colors.white,
  },
  title: {
    ...typography.h1,
    color: colors.gray900,
    marginBottom: spacing.s,
    textAlign: 'center',
    fontWeight: '800',
  },
  subtitle: {
    ...typography.body,
    color: colors.gray600,
    textAlign: 'center',
    lineHeight: 22,
  },
  requestsList: {
    paddingHorizontal: spacing.l,
    paddingBottom: spacing.xl,
  },
  groupSection: {
    marginBottom: spacing.l,
  },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.m,
    paddingHorizontal: spacing.s,
  },
  groupSectionTitle: {
    ...typography.h3,
    color: colors.gray900,
    flex: 1,
  },
  requestCountBadge: {
    backgroundColor: colors.brandTeal,
    paddingHorizontal: spacing.s,
    paddingVertical: spacing.xs,
    borderRadius: spacing.s,
  },
  requestCountText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: '600',
  },
  requestCard: {
    padding: spacing.xl,
    marginBottom: spacing.m,
    borderRadius: spacing.xxl,
    ...shadows.large,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.m,
  },
  userInfo: {
    flexDirection: 'row',
    flex: 1,
    marginRight: spacing.m,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.m,
    ...shadows.medium,
  },
  avatarText: {
    ...typography.h3,
    color: colors.white,
    fontWeight: '600',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    ...typography.h4,
    color: colors.gray900,
    marginBottom: spacing.xs,
  },
  userEmail: {
    ...typography.body,
    color: colors.gray600,
    marginBottom: spacing.xs,
  },
  requestDate: {
    ...typography.caption,
    color: colors.gray500,
  },
  statusBadge: {
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    borderRadius: spacing.l,
    ...shadows.small,
  },
  statusText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: '700',
  },
  groupInfo: {
    padding: spacing.l,
    borderRadius: spacing.l,
    marginBottom: spacing.m,
    ...shadows.small,
  },
  groupLabel: {
    ...typography.caption,
    color: colors.gray600,
    marginBottom: spacing.xs,
  },
  groupName: {
    ...typography.labelLarge,
    color: colors.gray900,
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: spacing.m,
    marginTop: spacing.m,
  },
  actionButton: {
    flex: 1,
    paddingVertical: spacing.m,
    borderRadius: spacing.l,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.medium,
  },
  rejectButton: {
    // Gradient styling applied via LinearGradient
  },
  approveButton: {
    // Gradient styling applied via LinearGradient
  },
  actionButtonText: {
    ...typography.button,
    color: colors.white,
    fontWeight: '700',
    textAlign: 'center',
  },
});

export default JoinRequestsScreen;
