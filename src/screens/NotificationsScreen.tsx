import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, StatusBar, TouchableOpacity } from 'react-native';
import Container from '../components/ui/Container';
import Card from '../components/ui/Card';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { colors, typography, spacing, shadows } from '../theme';

type NotificationItem = {
  id: string;
  title: string;
  body: string;
  created_at: string;
  read?: boolean;
};

const NotificationsScreen: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>([]);

  const load = async () => {
    try {
      setLoading(true);
      // Placeholder data. Integrate with backend when available.
      const now = new Date();
      setItems([
        { id: '1', title: 'Contribution successful', body: 'Your contribution of ₹5,000 to Alpha Group was received successfully.', created_at: now.toISOString(), read: false },
        { id: '2', title: 'New join request', body: 'Riya Sharma requested to join your Family Savings group.', created_at: new Date(now.getTime() - 3600*1000).toISOString(), read: false },
        { id: '3', title: 'Monthly goal achieved', body: 'Congratulations! Your group has reached this month\'s savings target.', created_at: new Date(now.getTime() - 7200*1000).toISOString(), read: true },
        { id: '4', title: 'Payment reminder', body: 'Your next contribution of ₹3,000 is due in 2 days.', created_at: new Date(now.getTime() - 86400*1000).toISOString(), read: true },
        { id: '5', title: 'Group invitation', body: 'You\'ve been invited to join "Office Colleagues" savings group.', created_at: new Date(now.getTime() - 172800*1000).toISOString(), read: true },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

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

  const getNotificationIcon = (title: string) => {
    if (title.toLowerCase().includes('contribution')) return '💰';
    if (title.toLowerCase().includes('request')) return '👤';
    if (title.toLowerCase().includes('goal') || title.toLowerCase().includes('achieved')) return '🎯';
    if (title.toLowerCase().includes('reminder')) return '⏰';
    if (title.toLowerCase().includes('invitation')) return '📨';
    return '🔔';
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

  if (loading) {
    return <LoadingSpinner text="Loading notifications..." />;
  }

  const unreadCount = items.filter(item => !item.read).length;

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor={colors.backgroundSecondary} />
      <Container style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Notifications</Text>
          <Text style={styles.subtitle}>
            {unreadCount > 0 ? `${unreadCount} unread notifications` : 'All caught up!'}
          </Text>
        </View>

        {items.length === 0 ? (
          <Card variant="elevated" style={styles.emptyCard}>
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🔔</Text>
              <Text style={styles.emptyTitle}>No Notifications</Text>
              <Text style={styles.emptyDescription}>You're all caught up! New notifications will appear here.</Text>
            </View>
          </Card>
        ) : (
          <FlatList
            data={items}
            keyExtractor={(i) => i.id}
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
                activeOpacity={0.7}
              >
                <Card 
                  variant="elevated" 
                  style={!item.read ? 
                    {...styles.notificationCard, ...styles.unreadCard} : 
                    styles.notificationCard
                  }
                >
                  <View style={styles.notificationContent}>
                    <View style={styles.notificationHeader}>
                      <View style={styles.notificationLeft}>
                        <Text style={styles.notificationIcon}>
                          {getNotificationIcon(item.title)}
                        </Text>
                        <View style={styles.notificationText}>
                          <Text style={[
                            styles.notificationTitle,
                            !item.read && styles.unreadTitle
                          ]}>
                            {item.title}
                          </Text>
                          <Text style={styles.notificationTime}>
                            {getTimeAgo(item.created_at)}
                          </Text>
                        </View>
                      </View>
                      {!item.read && <View style={styles.unreadBadge} />}
                    </View>
                    <Text style={styles.notificationBody}>{item.body}</Text>
                  </View>
                </Card>
              </TouchableOpacity>
            )}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            contentContainerStyle={styles.listContainer}
          />
        )}
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
  listContainer: {
    paddingBottom: spacing.xl,
  },
  notificationCard: {
    marginBottom: spacing.s,
  },
  unreadCard: {
    borderLeftWidth: 4,
    borderLeftColor: colors.brandTeal,
  },
  notificationContent: {
    padding: 0,
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
  notificationIcon: {
    fontSize: 24,
    marginRight: spacing.m,
    marginTop: spacing.xs,
  },
  notificationText: {
    flex: 1,
  },
  notificationTitle: {
    ...typography.labelLarge,
    color: colors.gray900,
    marginBottom: spacing.xs,
  },
  unreadTitle: {
    fontWeight: '700',
  },
  notificationTime: {
    ...typography.captionSmall,
    color: colors.gray500,
  },
  notificationBody: {
    ...typography.body,
    color: colors.gray700,
    lineHeight: 22,
    marginLeft: 40, // Align with title text
  },
  unreadBadge: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.brandTeal,
    marginTop: spacing.s,
  },
  separator: {
    height: spacing.xs,
  },
  emptyCard: {
    marginTop: spacing.xxl,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: spacing.l,
    opacity: 0.5,
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
    lineHeight: 22,
  },
});

export default NotificationsScreen;


