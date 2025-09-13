import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert, StatusBar, ScrollView, TouchableOpacity } from 'react-native';
import Container from '../components/ui/Container';
import Card from '../components/ui/Card';
import PrimaryButton from '../components/ui/PrimaryButton';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import EmptyState from '../components/ui/EmptyState';
import { FadeInView, SlideInView } from '../components/ui/AnimatedComponents';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { getUserGroupsApi, leaveGroupApi } from '../services/api';
import { colors, typography, spacing, shadows } from '../theme';

type Group = {
  id: number;
  name: string;
  description?: string;
  savings_amount?: number;
  total_savings?: number;
  member_count?: number;
  is_leader?: boolean;
};

type Props = NativeStackScreenProps<RootStackParamList, any>;

const ExitGroupScreen: React.FC<Props> = ({ navigation }) => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [exitingGroupId, setExitingGroupId] = useState<number | null>(null);

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    try {
      setLoading(true);
      const res = await getUserGroupsApi();
      const groupsData = res.data?.data?.groups || res.data?.groups || [];
      // Filter out groups where user is the leader
      const memberGroups = groupsData.filter((group: Group) => !group.is_leader);
      setGroups(memberGroups);
    } catch (e) {
      console.error('Error loading groups:', e);
      setGroups([]);
    } finally {
      setLoading(false);
    }
  };

  const confirmExit = (group: Group) => {
    Alert.alert(
      'Leave Group?',
      `Are you sure you want to leave "${group.name}"?\n\nThis action cannot be undone. You'll lose access to all group activities and your contribution history will be preserved but you won't be able to participate further.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Leave Group',
          style: 'destructive',
          onPress: () => exitGroup(group.id),
        },
      ]
    );
  };

  const exitGroup = async (groupId: number) => {
    try {
      setExitingGroupId(groupId);
      await leaveGroupApi(groupId);
      
      Alert.alert(
        'Successfully Left Group! 👋',
        'You have successfully left the group. Your contribution history has been preserved.',
        [
          {
            text: 'OK',
            onPress: () => {
              setGroups((prevGroups) => prevGroups.filter((g) => g.id !== groupId));
            }
          }
        ]
      );
    } catch (e: any) {
      console.error('Error leaving group:', e);
      let errorMessage = 'Failed to leave group. Please try again.';
      
      if (e?.response?.data?.message) {
        errorMessage = e.response.data.message;
      } else if (e?.message) {
        errorMessage = e.message;
      }
      
      Alert.alert('Error Leaving Group', errorMessage);
    } finally {
      setExitingGroupId(null);
    }
  };

  const renderGroupCard = ({ item: group, index }: { item: Group; index: number }) => (
    <SlideInView delay={index * 100} key={group.id}>
      <Card style={styles.groupCard}>
        <View style={styles.groupHeader}>
          <View style={styles.groupInfo}>
            <Text style={styles.groupName} numberOfLines={1}>
              {group.name}
            </Text>
            <Text style={styles.groupDescription} numberOfLines={2}>
              {group.description || 'No description available'}
            </Text>
          </View>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>Member</Text>
          </View>
        </View>

        <View style={styles.groupStats}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Your Contribution</Text>
            <Text style={styles.statValue}>
              ₹{(group.savings_amount || 0).toLocaleString()}
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Total Savings</Text>
            <Text style={styles.statValue}>
              ₹{(group.total_savings || 0).toLocaleString()}
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Members</Text>
            <Text style={styles.statValue}>
              {group.member_count || 0}
            </Text>
          </View>
        </View>

        <View style={styles.warningBox}>
          <Text style={styles.warningIcon}>⚠️</Text>
          <Text style={styles.warningText}>
            Leaving this group will remove your access permanently. Your contributions will be preserved.
          </Text>
        </View>

        <PrimaryButton
          title={exitingGroupId === group.id ? 'Leaving...' : 'Leave Group'}
          onPress={() => confirmExit(group)}
          variant="outline"
          loading={exitingGroupId === group.id}
          disabled={exitingGroupId === group.id}
          style={StyleSheet.flatten([styles.exitButton, { borderColor: colors.error }])}
        />
      </Card>
    </SlideInView>
  );

  const renderEmptyState = () => (
    <EmptyState
      icon="👥"
      title="No Groups to Leave"
      description="You're either not a member of any groups, or you're the leader of all your groups. Group leaders cannot leave their own groups."
      actionText="View My Groups"
      onAction={() => navigation.navigate('Groups')}
    />
  );

  if (loading) {
    return <LoadingSpinner text="Loading your groups..." />;
  }

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor={colors.backgroundSecondary} />
      <Container style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <FadeInView style={styles.header}>
            <View style={styles.headerIcon}>
              <Text style={styles.icon}>🚪</Text>
            </View>
            <Text style={styles.title}>Leave Groups</Text>
            <Text style={styles.subtitle}>
              Manage your group memberships. Note: You can only leave groups where you're a member, not a leader.
            </Text>
          </FadeInView>

          {groups.length === 0 ? (
            renderEmptyState()
          ) : (
            <View style={styles.groupsList}>
              {groups.map((group, index) => renderGroupCard({ item: group, index }))}
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
    backgroundColor: colors.white,
    padding: spacing.l,
    marginBottom: spacing.l,
    borderBottomLeftRadius: spacing.l,
    borderBottomRightRadius: spacing.l,
    ...shadows.medium,
    alignItems: 'center',
  },
  headerIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.error + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.m,
  },
  icon: {
    fontSize: 30,
  },
  title: {
    ...typography.h2,
    color: colors.gray900,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.body,
    color: colors.gray600,
    textAlign: 'center',
    lineHeight: 22,
  },
  groupsList: {
    paddingHorizontal: spacing.l,
    paddingBottom: spacing.xl,
  },
  groupCard: {
    padding: spacing.l,
    marginBottom: spacing.m,
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
    backgroundColor: colors.info,
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
  warningBox: {
    flexDirection: 'row',
    backgroundColor: colors.warning + '10',
    borderColor: colors.warning + '30',
    borderWidth: 1,
    borderRadius: spacing.m,
    padding: spacing.m,
    marginBottom: spacing.m,
  },
  warningIcon: {
    fontSize: 16,
    marginRight: spacing.s,
    marginTop: 2,
  },
  warningText: {
    ...typography.caption,
    color: colors.warning,
    flex: 1,
    lineHeight: 18,
  },
  exitButton: {
    borderWidth: 2,
  },
});

export default ExitGroupScreen;
