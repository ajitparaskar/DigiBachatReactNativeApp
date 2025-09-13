import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { colors, typography, spacing, shadows } from '../../theme';
import { getGroupMembersApi } from '../../services/api';

interface Member {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'admin' | 'member';
  joined_at: string;
  total_contributions: number;
  status: 'active' | 'inactive';
}

interface GroupMembersModalProps {
  visible: boolean;
  onClose: () => void;
  groupId: string | number;
  groupName: string;
  currentUserId?: string;
}

const GroupMembersModal: React.FC<GroupMembersModalProps> = ({
  visible,
  onClose,
  groupId,
  groupName,
  currentUserId,
}) => {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (visible && groupId) {
      loadGroupMembers();
    }
  }, [visible, groupId]);

  const loadGroupMembers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getGroupMembersApi(groupId);
      
      if (response.data?.success && response.data?.data?.members) {
        setMembers(response.data.data.members);
      } else {
        setMembers([]);
      }
    } catch (error: any) {
      console.error('Failed to load group members:', error);
      setError('Failed to load group members');
      setMembers([]);
    } finally {
      setLoading(false);
    }
  };

  const getRoleIcon = (role: string) => {
    return role === 'admin' ? '👑' : '👤';
  };

  const getRoleColor = (role: string) => {
    return role === 'admin' ? colors.warning : colors.gray600;
  };

  const getStatusColor = (status: string) => {
    return status === 'active' ? colors.success : colors.gray400;
  };

  const formatJoinDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const handleMemberPress = (member: Member) => {
    Alert.alert(
      member.name,
      `Email: ${member.email}${member.phone ? `\nPhone: ${member.phone}` : ''}\nJoined: ${formatJoinDate(member.joined_at)}\nTotal Contributions: ₹${member.total_contributions.toLocaleString()}`,
      [{ text: 'OK' }]
    );
  };

  const renderMember = (member: Member) => {
    const isCurrentUser = member.id === currentUserId;
    
    return (
      <TouchableOpacity
        key={member.id}
        style={[
          styles.memberItem,
          isCurrentUser && styles.currentUserItem,
        ]}
        onPress={() => handleMemberPress(member)}
      >
        <View style={styles.memberHeader}>
          <View style={styles.memberAvatar}>
            <Text style={styles.avatarText}>
              {member.name.charAt(0).toUpperCase()}
            </Text>
          </View>
          
          <View style={styles.memberInfo}>
            <View style={styles.memberNameRow}>
              <Text style={[
                styles.memberName,
                isCurrentUser && styles.currentUserName
              ]}>
                {member.name}
                {isCurrentUser && ' (You)'}
              </Text>
              <View style={styles.memberBadges}>
                <View style={[styles.roleBadge, { backgroundColor: getRoleColor(member.role) + '20' }]}>
                  <Text style={styles.roleIcon}>{getRoleIcon(member.role)}</Text>
                  <Text style={[styles.roleText, { color: getRoleColor(member.role) }]}>
                    {member.role}
                  </Text>
                </View>
              </View>
            </View>
            
            <Text style={styles.memberEmail}>{member.email}</Text>
            
            <View style={styles.memberStats}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Contributions</Text>
                <Text style={styles.statValue}>₹{member.total_contributions.toLocaleString()}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Joined</Text>
                <Text style={styles.statValue}>{formatJoinDate(member.joined_at)}</Text>
              </View>
            </View>
          </View>
          
          <View style={styles.memberStatus}>
            <View style={[
              styles.statusIndicator,
              { backgroundColor: getStatusColor(member.status) }
            ]} />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.title}>Group Members</Text>
            <Text style={styles.subtitle}>
              {groupName} • {members.length} member{members.length !== 1 ? 's' : ''}
            </Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.brandTeal} />
            <Text style={styles.loadingText}>Loading members...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorIcon}>😔</Text>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={loadGroupMembers} style={styles.retryButton}>
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {members.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyIcon}>👥</Text>
                <Text style={styles.emptyTitle}>No Members Found</Text>
                <Text style={styles.emptyDescription}>
                  This group doesn't have any members yet.
                </Text>
              </View>
            ) : (
              <View style={styles.membersList}>
                {members.map(renderMember)}
              </View>
            )}
          </ScrollView>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.l,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
    ...shadows.small,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    ...typography.h3,
    color: colors.gray900,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    color: colors.gray600,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.gray100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: colors.gray600,
  },
  content: {
    flex: 1,
    padding: spacing.l,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...typography.body,
    color: colors.gray600,
    marginTop: spacing.m,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: spacing.m,
  },
  errorText: {
    ...typography.body,
    color: colors.gray600,
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
    ...typography.button,
    color: colors.white,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: spacing.l,
  },
  emptyTitle: {
    ...typography.h3,
    color: colors.gray900,
    textAlign: 'center',
    marginBottom: spacing.m,
  },
  emptyDescription: {
    ...typography.body,
    color: colors.gray600,
    textAlign: 'center',
    lineHeight: 24,
  },
  membersList: {
    gap: spacing.m,
  },
  memberItem: {
    backgroundColor: colors.white,
    padding: spacing.l,
    borderRadius: spacing.l,
    ...shadows.small,
  },
  currentUserItem: {
    borderWidth: 2,
    borderColor: colors.brandTeal + '30',
    backgroundColor: colors.brandTeal + '05',
  },
  memberHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  memberAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.brandTeal,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.m,
  },
  avatarText: {
    ...typography.h4,
    color: colors.white,
    fontWeight: '600',
  },
  memberInfo: {
    flex: 1,
  },
  memberNameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
  },
  memberName: {
    ...typography.labelLarge,
    color: colors.gray900,
    flex: 1,
    marginRight: spacing.s,
  },
  currentUserName: {
    color: colors.brandTeal,
    fontWeight: '600',
  },
  memberBadges: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.s,
    paddingVertical: spacing.xs,
    borderRadius: spacing.s,
    gap: spacing.xs,
  },
  roleIcon: {
    fontSize: 12,
  },
  roleText: {
    ...typography.captionSmall,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  memberEmail: {
    ...typography.caption,
    color: colors.gray600,
    marginBottom: spacing.s,
  },
  memberStats: {
    flexDirection: 'row',
    gap: spacing.l,
  },
  statItem: {
    flex: 1,
  },
  statLabel: {
    ...typography.captionSmall,
    color: colors.gray500,
    marginBottom: spacing.xs,
  },
  statValue: {
    ...typography.caption,
    color: colors.gray900,
    fontWeight: '600',
  },
  memberStatus: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: spacing.xs,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});

export default GroupMembersModal;
