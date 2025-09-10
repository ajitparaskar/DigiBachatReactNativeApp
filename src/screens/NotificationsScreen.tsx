import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Alert,
  Dimensions,
  Switch,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Container from '../components/ui/Container';
import Card from '../components/ui/Card';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import EmptyState from '../components/ui/EmptyState';
import ErrorBoundary from '../components/ui/ErrorBoundary';
import { colors, typography, spacing, shadows } from '../theme';
import {
  joinGroupApi,
  approveJoinRequestApi,
  rejectJoinRequestApi,
  contributeToGroupApi,
} from '../services/api';

const { width } = Dimensions.get('window');

type NotificationType = 
  | 'contribution'
  | 'join_request'
  | 'goal_achieved'
  | 'payment_reminder'
  | 'group_invitation'
  | 'loan_request'
  | 'loan_approved'
  | 'loan_repayment'
  | 'system_update'
  | 'promotion';

type NotificationAction = {
  id: string;
  label: string;
  type: 'primary' | 'secondary' | 'danger';
  action: () => void;
};

type NotificationItem = {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  created_at: string;
  read?: boolean;
  priority: 'high' | 'medium' | 'low';
  actions?: NotificationAction[];
  metadata?: {
    groupId?: string;
    groupName?: string;
    amount?: number;
    userId?: string;
    userName?: string;
    requestId?: string;
    loanId?: string;
  };
};

type FilterType = 'all' | 'unread' | 'contributions' | 'groups' | 'loans' | 'system';

const NotificationsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Enhanced notification data with actions and metadata
      const now = new Date();
      const notifications: NotificationItem[] = [
        {
          id: '1',
          type: 'join_request',
          title: 'New Join Request',
          body: 'Riya Sharma wants to join your "Family Savings" group. Review their profile and approve or reject.',
          created_at: now.toISOString(),
          read: false,
          priority: 'high',
          metadata: {
            groupId: '101',
            groupName: 'Family Savings',
            userId: '201',
            userName: 'Riya Sharma',
            requestId: 'req_123'
          },
          actions: [
            {
              id: 'approve',
              label: 'Approve',
              type: 'primary',
              action: () => handleJoinRequestAction('req_123', '101', 'approve')
            },
            {
              id: 'reject',
              label: 'Reject',
              type: 'danger',
              action: () => handleJoinRequestAction('req_123', '101', 'reject')
            }
          ]
        },
        {
          id: '2',
          type: 'group_invitation',
          title: 'Group Invitation',
          body: 'You\'ve been invited to join "Office Colleagues" savings group. Join now to start saving with your teammates!',
          created_at: new Date(now.getTime() - 1800*1000).toISOString(),
          read: false,
          priority: 'high',
          metadata: {
            groupId: '102',
            groupName: 'Office Colleagues',
            userId: '301',
            userName: 'Amit Kumar'
          },
          actions: [
            {
              id: 'join',
              label: 'Join Group',
              type: 'primary',
              action: () => handleJoinGroup('102')
            },
            {
              id: 'decline',
              label: 'Decline',
              type: 'secondary',
              action: () => handleDeclineInvitation('2')
            }
          ]
        },
        {
          id: '3',
          type: 'contribution',
          title: 'Contribution Successful',
          body: 'Your contribution of ₹5,000 to Alpha Group was processed successfully. Thank you for staying on track!',
          created_at: new Date(now.getTime() - 3600*1000).toISOString(),
          read: false,
          priority: 'medium',
          metadata: {
            groupId: '103',
            groupName: 'Alpha Group',
            amount: 5000
          }
        },
        {
          id: '4',
          type: 'payment_reminder',
          title: 'Payment Due Soon',
          body: 'Your next contribution of ₹3,000 to Beta Group is due in 2 days. Set up auto-pay to never miss a payment.',
          created_at: new Date(now.getTime() - 7200*1000).toISOString(),
          read: true,
          priority: 'high',
          metadata: {
            groupId: '104',
            groupName: 'Beta Group',
            amount: 3000
          },
          actions: [
            {
              id: 'pay_now',
              label: 'Pay Now',
              type: 'primary',
              action: () => handlePayNow('104')
            },
            {
              id: 'remind_later',
              label: 'Remind Later',
              type: 'secondary',
              action: () => handleRemindLater('4')
            }
          ]
        },
        {
          id: '5',
          type: 'goal_achieved',
          title: 'Monthly Goal Achieved! 🎉',
          body: 'Congratulations! Your "Family Savings" group has reached this month\'s savings target of ₹50,000.',
          created_at: new Date(now.getTime() - 10800*1000).toISOString(),
          read: true,
          priority: 'medium',
          metadata: {
            groupId: '101',
            groupName: 'Family Savings',
            amount: 50000
          }
        },
        {
          id: '6',
          type: 'loan_request',
          title: 'Loan Request Received',
          body: 'Priya Singh has requested a loan of ₹25,000 from "Tech Savers" group. Review and approve.',
          created_at: new Date(now.getTime() - 14400*1000).toISOString(),
          read: true,
          priority: 'high',
          metadata: {
            groupId: '105',
            groupName: 'Tech Savers',
            amount: 25000,
            userId: '401',
            userName: 'Priya Singh',
            loanId: 'loan_456'
          },
          actions: [
            {
              id: 'review_loan',
              label: 'Review Loan',
              type: 'primary',
              action: () => handleReviewLoan('loan_456', '105')
            }
          ]
        },
        {
          id: '7',
          type: 'system_update',
          title: 'New Feature: Financial Reports',
          body: 'Generate detailed PDF and CSV reports of your savings activity. Check it out in the Analytics section!',
          created_at: new Date(now.getTime() - 86400*1000).toISOString(),
          read: false,
          priority: 'low',
          actions: [
            {
              id: 'explore',
              label: 'Explore Now',
              type: 'primary',
              action: () => navigation.navigate('FinancialReports')
            }
          ]
        }
      ];
      
      setItems(notifications);
    } catch (error: any) {
      console.error('Failed to load notifications:', error);
      setError(error?.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // Action handlers
  const handleJoinRequestAction = async (requestId: string, groupId: string, action: 'approve' | 'reject') => {
    try {
      setActionLoading(requestId);
      
      if (action === 'approve') {
        await approveJoinRequestApi(groupId, requestId);
        Alert.alert('Success', 'Join request approved successfully!');
      } else {
        await rejectJoinRequestApi(groupId, requestId);
        Alert.alert('Success', 'Join request rejected.');
      }
      
      // Remove notification or mark as handled
      setItems(items.filter(item => item.metadata?.requestId !== requestId));
    } catch (error: any) {
      Alert.alert('Error', error?.message || `Failed to ${action} join request`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleJoinGroup = async (groupCode: string) => {
    try {
      setActionLoading(groupCode);
      await joinGroupApi(groupCode);
      Alert.alert('Success!', 'You have successfully joined the group!', [
        {
          text: 'View Group',
          onPress: () => navigation.navigate('GroupDetails', { groupId: groupCode })
        },
        { text: 'OK' }
      ]);
      
      // Remove the invitation notification
      setItems(items.filter(item => item.metadata?.groupId !== groupCode));
    } catch (error: any) {
      Alert.alert('Error', error?.message || 'Failed to join group');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeclineInvitation = (notificationId: string) => {
    Alert.alert(
      'Decline Invitation',
      'Are you sure you want to decline this group invitation?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Decline',
          style: 'destructive',
          onPress: () => {
            setItems(items.filter(item => item.id !== notificationId));
          }
        }
      ]
    );
  };

  const handlePayNow = (groupId: string) => {
    navigation.navigate('Contribution', { groupId: parseInt(groupId) });
  };

  const handleRemindLater = (notificationId: string) => {
    Alert.alert('Reminder Set', 'We\'ll remind you again in 4 hours.');
    markAsRead(notificationId);
  };

  const handleReviewLoan = (loanId: string, groupId: string) => {
    navigation.navigate('Loans', { initialTab: 'requests', groupId });
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const markAsRead = (id: string) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, read: true } : item
    ));
  };

  const markAllAsRead = () => {
    setItems(items.map(item => ({ ...item, read: true })));
  };

  const deleteNotification = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const clearAllNotifications = () => {
    Alert.alert(
      'Clear All Notifications',
      'Are you sure you want to clear all notifications?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: () => setItems([])
        }
      ]
    );
  };

  const filteredItems = items.filter(item => {
    switch (filter) {
      case 'unread':
        return !item.read;
      case 'contributions':
        return item.type === 'contribution' || item.type === 'payment_reminder';
      case 'groups':
        return item.type === 'join_request' || item.type === 'group_invitation' || item.type === 'goal_achieved';
      case 'loans':
        return item.type === 'loan_request' || item.type === 'loan_approved' || item.type === 'loan_repayment';
      case 'system':
        return item.type === 'system_update' || item.type === 'promotion';
      default:
        return true;
    }
  });

  const filterOptions = [
    { key: 'all', label: 'All', icon: '📋' },
    { key: 'unread', label: 'Unread', icon: '🔴' },
    { key: 'contributions', label: 'Payments', icon: '💰' },
    { key: 'groups', label: 'Groups', icon: '👥' },
    { key: 'loans', label: 'Loans', icon: '🏦' },
    { key: 'system', label: 'Updates', icon: '🔔' },
  ];

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'contribution': return '💰';
      case 'join_request': return '👤';
      case 'goal_achieved': return '🎯';
      case 'payment_reminder': return '⏰';
      case 'group_invitation': return '📨';
      case 'loan_request': return '🏦';
      case 'loan_approved': return '✅';
      case 'loan_repayment': return '💳';
      case 'system_update': return '🆕';
      case 'promotion': return '🎁';
      default: return '🔔';
    }
  };

  const getPriorityColor = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high': return colors.error;
      case 'medium': return colors.warning;
      case 'low': return colors.success;
      default: return colors.gray600;
    }
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  // Loading state
  if (loading) {
    return (
      <ErrorBoundary>
        <LoadingSpinner text="Loading notifications..." showIcon={true} />
      </ErrorBoundary>
    );
  }

  // Error state
  if (error) {
    return (
      <ErrorBoundary>
        <Container style={styles.container}>
          <EmptyState
            icon="😔"
            title="Unable to load notifications"
            description={error}
            actionText="Try Again"
            onAction={load}
            variant="large"
          />
        </Container>
      </ErrorBoundary>
    );
  }

  const unreadCount = items.filter(item => !item.read).length;

  return (
    <ErrorBoundary>
      <StatusBar barStyle="dark-content" backgroundColor={colors.backgroundSecondary} />
      <Container style={styles.container}>
        {/* Header with Actions */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.title}>Notifications</Text>
              <Text style={styles.subtitle}>
                {unreadCount > 0 ? `${unreadCount} unread notifications` : 'All caught up! 🎉'}
              </Text>
            </View>
            <View style={styles.headerActions}>
              {unreadCount > 0 && (
                <TouchableOpacity style={styles.markAllButton} onPress={markAllAsRead}>
                  <Text style={styles.markAllText}>✓ Mark All Read</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity style={styles.settingsButton} onPress={clearAllNotifications}>
                <Text style={styles.settingsButtonIcon}>🗑️</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Notification Settings */}
          <Card variant="flat" style={styles.settingsCard}>
            <View style={styles.settingsRow}>
              <View style={styles.settingsLeft}>
                <Text style={styles.settingsIcon}>🔔</Text>
                <Text style={styles.settingsLabel}>Push Notifications</Text>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: colors.gray300, true: colors.brandTeal + '40' }}
                thumbColor={notificationsEnabled ? colors.brandTeal : colors.gray400}
              />
            </View>
          </Card>
        </View>

        {/* Filter Tabs */}
        <ScrollView 
          horizontal={true}
          showsHorizontalScrollIndicator={false} 
          style={styles.filterContainer}
          contentContainerStyle={styles.filterContent}
        >
          {filterOptions.map((option) => {
            const count = option.key === 'all' ? items.length : 
                         option.key === 'unread' ? unreadCount :
                         items.filter(item => {
                           switch (option.key) {
                             case 'contributions': return item.type === 'contribution' || item.type === 'payment_reminder';
                             case 'groups': return item.type === 'join_request' || item.type === 'group_invitation' || item.type === 'goal_achieved';
                             case 'loans': return item.type === 'loan_request' || item.type === 'loan_approved' || item.type === 'loan_repayment';
                             case 'system': return item.type === 'system_update' || item.type === 'promotion';
                             default: return false;
                           }
                         }).length;
            
            return (
              <TouchableOpacity
                key={option.key}
                style={[
                  styles.filterTab,
                  filter === option.key && styles.filterTabActive
                ]}
                onPress={() => setFilter(option.key as FilterType)}
              >
                <Text style={styles.filterTabIcon}>{option.icon}</Text>
                <Text style={[
                  styles.filterTabText,
                  filter === option.key && styles.filterTabTextActive
                ]}>
                  {option.label}
                </Text>
                {count > 0 && (
                  <View style={styles.filterTabBadge}>
                    <Text style={styles.filterTabBadgeText}>{count}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Notifications List */}
        {filteredItems.length === 0 ? (
          <EmptyState
            icon={filter === 'unread' ? "🔔" : "📋"}
            title={filter === 'unread' ? "No Unread Notifications" : "No Notifications"}
            description={
              filter === 'unread' 
                ? "You're all caught up! No unread notifications." 
                : filter === 'all'
                  ? "You'll see new notifications here when they arrive."
                  : `No ${filter} notifications at the moment.`
            }
            variant="minimal"
          />
        ) : (
          <FlatList
            data={filteredItems}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl 
                refreshing={refreshing} 
                onRefresh={onRefresh}
                tintColor={colors.brandTeal}
                colors={[colors.brandTeal]}
              />
            }
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => !item.read && markAsRead(item.id)}
                activeOpacity={0.8}
                style={styles.notificationTouchable}
              >
                <Card 
                  variant="elevated" 
                  style={StyleSheet.flatten([
                    styles.notificationCard,
                    !item.read && styles.unreadCard,
                    item.priority === 'high' && styles.highPriorityCard
                  ])}
                >
                  <View style={styles.notificationContent}>
                    {/* Header */}
                    <View style={styles.notificationHeader}>
                      <View style={styles.notificationLeft}>
                        <View style={[
                          styles.notificationIconContainer,
                          { backgroundColor: getPriorityColor(item.priority) + '15' }
                        ]}>
                          <Text style={styles.notificationIcon}>
                            {getNotificationIcon(item.type)}
                          </Text>
                        </View>
                        <View style={styles.notificationTextContainer}>
                          <View style={styles.notificationTitleRow}>
                            <Text style={[
                              styles.notificationTitle,
                              !item.read && styles.unreadTitle
                            ]}>
                              {item.title}
                            </Text>
                            {item.priority === 'high' && (
                              <View style={styles.priorityBadge}>
                                <Text style={styles.priorityBadgeText}>⚠️</Text>
                              </View>
                            )}
                          </View>
                          <Text style={styles.notificationTime}>
                            {getTimeAgo(item.created_at)}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.notificationRight}>
                        {!item.read && <View style={styles.unreadBadge} />}
                        <TouchableOpacity
                          style={styles.deleteButton}
                          onPress={() => deleteNotification(item.id)}
                        >
                          <Text style={styles.deleteButtonText}>×</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                    
                    {/* Body */}
                    <Text style={styles.notificationBody}>{item.body}</Text>
                    
                    {/* Metadata */}
                    {item.metadata && (
                      <View style={styles.metadataContainer}>
                        {item.metadata.groupName && (
                          <View style={styles.metadataItem}>
                            <Text style={styles.metadataIcon}>👥</Text>
                            <Text style={styles.metadataText}>{item.metadata.groupName}</Text>
                          </View>
                        )}
                        {item.metadata.amount && (
                          <View style={styles.metadataItem}>
                            <Text style={styles.metadataIcon}>💰</Text>
                            <Text style={styles.metadataText}>₹{item.metadata.amount.toLocaleString()}</Text>
                          </View>
                        )}
                      </View>
                    )}
                    
                    {/* Actions */}
                    {item.actions && item.actions.length > 0 && (
                      <View style={styles.actionsContainer}>
                        {item.actions.map((action) => (
                          <TouchableOpacity
                            key={action.id}
                            style={[
                              styles.actionButton,
                              action.type === 'primary' && styles.actionButtonPrimary,
                              action.type === 'danger' && styles.actionButtonDanger,
                              actionLoading === action.id && styles.actionButtonLoading
                            ]}
                            onPress={action.action}
                            disabled={actionLoading === action.id}
                          >
                            {actionLoading === action.id ? (
                              <Text style={styles.actionButtonText}>⏳</Text>
                            ) : (
                              <Text style={[
                                styles.actionButtonText,
                                action.type === 'primary' && styles.actionButtonTextPrimary,
                                action.type === 'danger' && styles.actionButtonTextDanger
                              ]}>
                                {action.label}
                              </Text>
                            )}
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                  </View>
                </Card>
              </TouchableOpacity>
            )}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            contentContainerStyle={styles.listContainer}
          />
        )}
      </Container>
    </ErrorBoundary>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.backgroundSecondary,
    flex: 1,
  },
  
  // Header Styles
  header: {
    marginBottom: spacing.l,
    paddingTop: spacing.m,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.m,
  },
  title: {
    ...typography.h2,
    color: colors.textDark,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.s,
  },
  markAllButton: {
    backgroundColor: colors.brandTeal + '15',
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    borderRadius: spacing.s,
  },
  markAllText: {
    ...typography.caption,
    color: colors.brandTeal,
    fontWeight: '600',
  },
  settingsButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.backgroundLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsButtonIcon: {
    fontSize: 16,
  },
  
  // Settings Card
  settingsCard: {
    backgroundColor: colors.white,
    padding: spacing.m,
    borderRadius: spacing.m,
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingsIcon: {
    fontSize: 18,
    marginRight: spacing.s,
  },
  settingsLabel: {
    ...typography.body,
    color: colors.textDark,
    fontWeight: '500',
  },
  
  // Filter Styles
  filterContainer: {
    marginBottom: spacing.l,
  },
  filterContent: {
    paddingHorizontal: spacing.l,
    gap: spacing.s,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    borderRadius: spacing.l,
    backgroundColor: colors.backgroundLight,
    position: 'relative',
  },
  filterTabActive: {
    backgroundColor: colors.brandTeal,
  },
  filterTabIcon: {
    fontSize: 16,
    marginRight: spacing.xs,
  },
  filterTabText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  filterTabTextActive: {
    color: colors.white,
    fontWeight: '600',
  },
  filterTabBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: colors.error,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterTabBadgeText: {
    ...typography.captionSmall,
    color: colors.white,
    fontWeight: '700',
    fontSize: 10,
  },
  
  // List Styles
  listContainer: {
    paddingHorizontal: spacing.l,
    paddingBottom: spacing.xl,
  },
  separator: {
    height: spacing.s,
  },
  
  // Notification Card Styles
  notificationTouchable: {
    marginBottom: spacing.s,
  },
  notificationCard: {
    backgroundColor: colors.white,
    borderRadius: spacing.m,
    ...shadows.small,
  },
  unreadCard: {
    borderLeftWidth: 4,
    borderLeftColor: colors.brandTeal,
    ...shadows.medium,
  },
  highPriorityCard: {
    borderLeftColor: colors.error,
    ...shadows.large,
  },
  notificationContent: {
    padding: spacing.m,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.s,
  },
  notificationLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  notificationRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.s,
  },
  notificationIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.m,
  },
  notificationIcon: {
    fontSize: 20,
  },
  notificationTextContainer: {
    flex: 1,
  },
  notificationTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  notificationTitle: {
    ...typography.body,
    color: colors.textDark,
    fontWeight: '500',
    flex: 1,
  },
  unreadTitle: {
    fontWeight: '600',
    color: colors.textDark,
  },
  notificationTime: {
    ...typography.captionSmall,
    color: colors.textSecondary,
  },
  notificationBody: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.s,
  },
  
  // Priority and Status Indicators
  priorityBadge: {
    marginLeft: spacing.s,
  },
  priorityBadgeText: {
    fontSize: 12,
  },
  unreadBadge: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.brandTeal,
  },
  deleteButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.backgroundLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButtonText: {
    fontSize: 14,
    color: colors.textLight,
    fontWeight: '600',
  },
  
  // Metadata Styles
  metadataContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.s,
    gap: spacing.m,
  },
  metadataItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundLight,
    paddingHorizontal: spacing.s,
    paddingVertical: spacing.xs,
    borderRadius: spacing.s,
  },
  metadataIcon: {
    fontSize: 12,
    marginRight: spacing.xs,
  },
  metadataText: {
    ...typography.captionSmall,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  
  // Action Button Styles
  actionsContainer: {
    flexDirection: 'row',
    gap: spacing.s,
    marginTop: spacing.s,
  },
  actionButton: {
    flex: 1,
    paddingVertical: spacing.s,
    paddingHorizontal: spacing.m,
    borderRadius: spacing.s,
    backgroundColor: colors.backgroundLight,
    borderWidth: 1,
    borderColor: colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonPrimary: {
    backgroundColor: colors.brandTeal,
    borderColor: colors.brandTeal,
  },
  actionButtonDanger: {
    backgroundColor: colors.error + '15',
    borderColor: colors.error,
  },
  actionButtonLoading: {
    opacity: 0.6,
  },
  actionButtonText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  actionButtonTextPrimary: {
    color: colors.white,
  },
  actionButtonTextDanger: {
    color: colors.error,
  },
});

export default NotificationsScreen;
