import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Alert, TouchableOpacity, StatusBar } from 'react-native';
import Container from '../components/ui/Container';
import Card from '../components/ui/Card';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import PrimaryButton from '../components/ui/PrimaryButton';
import { colors, typography, spacing, shadows } from '../theme';
import { getUserGroupsApi } from '../services/api';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';

type Group = {
  id: number;
  name: string;
  description?: string;
};

type Props = NativeStackScreenProps<RootStackParamList, 'Groups'>;

const GroupsScreen: React.FC<Props> = ({ navigation }) => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getUserGroupsApi();
        const apiGroups = res.data?.data?.groups || res.data?.groups || [];
        setGroups(apiGroups);
      } catch (e: any) {
        Alert.alert('Error', e?.message || 'Failed to load groups');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Loading your groups..." />;
  }

  const renderGroupItem = ({ item }: { item: Group }) => (
    <TouchableOpacity 
      onPress={() => navigation.navigate('GroupDetails', { groupId: item.id })}
      style={styles.groupCard}
      activeOpacity={0.7}
    >
      <View style={styles.groupIconContainer}>
        <Text style={styles.groupIcon}>👥</Text>
      </View>
      <View style={styles.groupContent}>
        <View style={styles.groupHeader}>
          <Text style={styles.groupName}>{item.name}</Text>
          <View style={styles.groupBadge}>
            <Text style={styles.badgeText}>Active</Text>
          </View>
        </View>
        {item.description ? (
          <Text style={styles.groupDescription}>{item.description}</Text>
        ) : (
          <Text style={styles.groupDescription}>No description available</Text>
        )}
        <View style={styles.groupFooter}>
          <Text style={styles.groupMembers}>👤 5 members</Text>
          <Text style={styles.groupAmount}>₹ 25,000</Text>
        </View>
      </View>
      <View style={styles.chevronContainer}>
        <Text style={styles.chevron}>›</Text>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconContainer}>
        <Text style={styles.emptyIcon}>🏦</Text>
      </View>
      <Text style={styles.emptyTitle}>Start Your Savings Journey</Text>
      <Text style={styles.emptyDescription}>
        Create or join a group to begin saving together with friends, family, or colleagues. Build wealth through collective savings!
      </Text>
      <View style={styles.emptyFeatures}>
        <View style={styles.feature}>
          <Text style={styles.featureIcon}>🎯</Text>
          <Text style={styles.featureText}>Set savings goals</Text>
        </View>
        <View style={styles.feature}>
          <Text style={styles.featureIcon}>👥</Text>
          <Text style={styles.featureText}>Save with others</Text>
        </View>
        <View style={styles.feature}>
          <Text style={styles.featureIcon}>📈</Text>
          <Text style={styles.featureText}>Track progress</Text>
        </View>
      </View>
      <View style={styles.emptyActions}>
        <PrimaryButton
          title="Create Your First Group"
          onPress={() => navigation.navigate('CreateGroup')}
          size="large"
          style={styles.createButton}
        />
        <PrimaryButton
          title="Join Existing Group"
          onPress={() => navigation.navigate('JoinGroup')}
          variant="outline"
          style={styles.joinButton}
        />
      </View>
    </View>
  );

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor={colors.backgroundSecondary} />
      <Container style={styles.container}>
        {groups.length === 0 ? (
          renderEmptyState()
        ) : (
          <>
            <View style={styles.header}>
              <View style={styles.headerContent}>
                <Text style={styles.title}>My Groups</Text>
                <Text style={styles.subtitle}>
                  {groups.length} active group{groups.length !== 1 ? 's' : ''}
                </Text>
              </View>
              <TouchableOpacity 
                style={styles.addButton}
                onPress={() => navigation.navigate('CreateGroup')}
              >
                <Text style={styles.addButtonText}>+</Text>
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={groups}
              keyExtractor={(item) => String(item.id)}
              renderItem={renderGroupItem}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContent}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
            
            <View style={styles.floatingActions}>
              <PrimaryButton
                title="Join Group"
                onPress={() => navigation.navigate('JoinGroup')}
                variant="outline"
                style={styles.joinGroupButton}
              />
            </View>
          </>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xl,
    paddingTop: spacing.m,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    ...typography.h2,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    color: colors.gray600,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.brandTeal,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.medium,
  },
  addButtonText: {
    fontSize: 24,
    color: colors.white,
    fontWeight: '300',
  },
  listContent: {
    paddingBottom: spacing.xxl,
  },
  separator: {
    height: spacing.m,
  },
  groupCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: spacing.l,
    padding: spacing.l,
    ...shadows.medium,
    borderWidth: 1,
    borderColor: colors.gray200,
  },
  groupIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.brandTeal,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.m,
  },
  groupIcon: {
    fontSize: 24,
    color: colors.white,
  },
  groupContent: {
    flex: 1,
  },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  groupName: {
    ...typography.labelLarge,
    fontWeight: '600',
    color: colors.gray900,
  },
  groupBadge: {
    backgroundColor: colors.successLight,
    paddingHorizontal: spacing.s,
    paddingVertical: spacing.xs,
    borderRadius: spacing.s,
  },
  badgeText: {
    ...typography.captionSmall,
    color: colors.success,
    fontWeight: '600',
  },
  groupDescription: {
    ...typography.caption,
    color: colors.gray500,
    marginBottom: spacing.s,
  },
  groupFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  groupMembers: {
    ...typography.caption,
    color: colors.gray500,
  },
  groupAmount: {
    ...typography.label,
    color: colors.brandTeal,
    fontWeight: '600',
  },
  chevronContainer: {
    marginLeft: spacing.s,
  },
  chevron: {
    ...typography.h3,
    color: colors.gray400,
    fontWeight: '300',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.brandTeal,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  emptyIcon: {
    fontSize: 48,
    color: colors.white,
  },
  emptyTitle: {
    ...typography.h2,
    textAlign: 'center',
    marginBottom: spacing.m,
    color: colors.gray900,
  },
  emptyDescription: {
    ...typography.body,
    color: colors.gray600,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 28,
  },
  emptyFeatures: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: spacing.xl,
  },
  feature: {
    alignItems: 'center',
    flex: 1,
  },
  featureIcon: {
    fontSize: 32,
    marginBottom: spacing.s,
  },
  featureText: {
    ...typography.caption,
    color: colors.gray600,
    textAlign: 'center',
  },
  emptyActions: {
    width: '100%',
    gap: spacing.m,
  },
  createButton: {
    marginBottom: 0,
  },
  joinButton: {
    marginBottom: 0,
    borderColor: colors.brandTeal,
  },
  floatingActions: {
    paddingTop: spacing.m,
  },
  joinGroupButton: {
    marginBottom: 0,
    borderColor: colors.brandTeal,
  },
});

export default GroupsScreen;


