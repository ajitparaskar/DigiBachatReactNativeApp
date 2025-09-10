import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { colors, typography, spacing } from '../theme';
import { getGroupMembersApi, removeMemberFromGroupApi } from '../services/api';

interface GroupMember {
  id: number;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: 'admin' | 'member';
  joined_at: string;
  total_contributions: number;
  last_contribution_date?: string;
  is_active: boolean;
}

interface GroupMembersModalProps {
  visible: boolean;
  onClose: () => void;
  group: {
    id: number;
    name: string;
  } | null;
  currentUserId?: number;
}

const GroupMembersModal: React.FC<GroupMembersModalProps> = ({ 
  visible, 
  onClose, 
  group,
  currentUserId 
}) => {
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [removingMember, setRemovingMember] = useState<number | null>(null);

  useEffect(() => {
    if (visible && group) {
      loadGroupMembers();
    }
  }, [visible, group]);

  const loadGroupMembers = async () => {
    if (!group) return;
    
    setLoading(true);
    setError('');
    
    try {
      const response = await getGroupMembersApi(group.id);
      
      if (response?.data?.members) {
        setMembers(response.data.members);
      } else {
        setMembers([]);
      }
    } catch (err: any) {
      console.error('Failed to load group members:', err);
      setError('Failed to load group members');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = (member: GroupMember) => {
    if (member.id === currentUserId) {
      Alert.alert('Cannot Remove', 'You cannot remove yourself from the group');
      return;
    }

    if (member.role === 'admin') {
      Alert.alert('Cannot Remove', 'Cannot remove group admin');
      return;
    }

    Alert.alert(
      'Remove Member',
      `Are you sure you want to remove ${member.name} from the group?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive',
          onPress: () => removeMember(member.id)
        }
      ]
    );
  };

  const removeMember = async (memberId: number) => {
    if (!group) return;

    setRemovingMember(memberId);
    
    try {
      await removeMemberFromGroupApi(group.id, memberId);
      
      // Remove member from local state
      setMembers(prev => prev.filter(member => member.id !== memberId));
      
      Alert.alert('Success', 'Member removed from group');
    } catch (err: any) {
      console.error('Failed to remove member:', err);
      Alert.alert('Error', err.response?.data?.message || 'Failed to remove member');
    } finally {
      setRemovingMember(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getMemberStatusIcon = (member: GroupMember) => {
    if (!member.is_active) return '😴';
    if (member.role === 'admin') return '👑';
    return '👤';
  };

  const getMemberStatusColor = (member: GroupMember) => {
    if (!member.is_active) return colors.gray400;
    if (member.role === 'admin') return colors.warning;
    return colors.brandTeal;
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Group Members</Text>
              {group && <Text style={styles.subtitle}>{group.name}</Text>}
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.brandTeal} />
              <Text style={styles.loadingText}>Loading group members...</Text>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorIcon}>⚠️</Text>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity onPress={loadGroupMembers} style={styles.retryButton}>
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
              {members.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyIcon}>👥</Text>
                  <Text style={styles.emptyTitle}>No Members Found</Text>
                  <Text style={styles.emptyText}>Group members will appear here</Text>
                </View>
              ) : (
                <View style={styles.membersList}>
                  <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                      <Text style={styles.statValue}>{members.length}</Text>
                      <Text style={styles.statLabel}>Total Members</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={styles.statValue}>
                        {members.filter(m => m.is_active).length}
                      </Text>
                      <Text style={styles.statLabel}>Active</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={styles.statValue}>
                        {members.filter(m => m.role === 'admin').length}
                      </Text>
                      <Text style={styles.statLabel}>Admins</Text>
                    </View>
                  </View>

                  {members.map((member) => (
                    <View key={member.id} style={styles.memberItem}>
                      <View style={styles.memberInfo}>
                        <View style={[styles.memberAvatar, { backgroundColor: getMemberStatusColor(member) + '20' }]}>
                          {member.avatar ? (
                            <Image source={{ uri: member.avatar }} style={styles.avatarImage} />
                          ) : (
                            <Text style={styles.memberAvatarText}>
                              {getMemberStatusIcon(member)}
                            </Text>
                          )}
                        </View>
                        
                        <View style={styles.memberDetails}>
                          <View style={styles.memberNameRow}>
                            <Text style={styles.memberName}>{member.name}</Text>
                            {member.role === 'admin' && (
                              <View style={styles.adminBadge}>
                                <Text style={styles.adminBadgeText}>ADMIN</Text>
                              </View>
                            )}
                            {!member.is_active && (
                              <View style={styles.inactiveBadge}>
                                <Text style={styles.inactiveBadgeText}>INACTIVE</Text>
                              </View>
                            )}
                          </View>
                          <Text style={styles.memberEmail}>{member.email}</Text>
                          {member.phone && (
                            <Text style={styles.memberPhone}>{member.phone}</Text>
                          )}
                          
                          <View style={styles.memberStats}>
                            <Text style={styles.memberStat}>
                              💰 ₹{member.total_contributions.toLocaleString()} contributed
                            </Text>
                            <Text style={styles.memberStat}>
                              📅 Joined {formatDate(member.joined_at)}
                            </Text>
                            {member.last_contribution_date && (
                              <Text style={styles.memberStat}>
                                🗓️ Last contribution: {formatDate(member.last_contribution_date)}
                              </Text>
                            )}
                          </View>
                        </View>
                      </View>
                      
                      {member.id !== currentUserId && member.role !== 'admin' && (
                        <TouchableOpacity 
                          onPress={() => handleRemoveMember(member)}
                          style={styles.removeButton}
                          disabled={removingMember === member.id}
                        >
                          {removingMember === member.id ? (
                            <ActivityIndicator size="small" color={colors.error} />
                          ) : (
                            <Text style={styles.removeButtonText}>Remove</Text>
                          )}
                        </TouchableOpacity>
                      )}
                    </View>
                  ))}
                </View>
              )}
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: colors.white,
    borderTopLeftRadius: spacing.l,
    borderTopRightRadius: spacing.l,
    maxHeight: '85%',
    minHeight: '60%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.l,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  title: {
    ...typography.h3,
    color: colors.gray900,
  },
  subtitle: {
    ...typography.body,
    color: colors.gray600,
    marginTop: spacing.xs,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.gray200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    ...typography.labelLarge,
    color: colors.gray600,
  },
  content: {
    flex: 1,
    padding: spacing.l,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  loadingText: {
    ...typography.body,
    color: colors.gray600,
    marginTop: spacing.m,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
    ...typography.labelLarge,
    color: colors.white,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: spacing.m,
  },
  emptyTitle: {
    ...typography.h4,
    color: colors.gray600,
    marginBottom: spacing.s,
  },
  emptyText: {
    ...typography.body,
    color: colors.gray500,
    textAlign: 'center',
  },
  membersList: {
    gap: spacing.m,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: colors.gray50,
    borderRadius: spacing.m,
    padding: spacing.m,
    marginBottom: spacing.l,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    ...typography.h4,
    color: colors.brandTeal,
    fontWeight: '700',
  },
  statLabel: {
    ...typography.caption,
    color: colors.gray600,
    marginTop: spacing.xs,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray200,
    borderRadius: spacing.m,
    padding: spacing.m,
  },
  memberInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.m,
  },
  avatarImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  memberAvatarText: {
    fontSize: 24,
  },
  memberDetails: {
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
    fontWeight: '600',
    marginRight: spacing.s,
  },
  adminBadge: {
    backgroundColor: colors.warning + '20',
    paddingHorizontal: spacing.s,
    paddingVertical: 2,
    borderRadius: spacing.xs,
    marginRight: spacing.s,
  },
  adminBadgeText: {
    ...typography.captionSmall,
    color: colors.warning,
    fontWeight: '600',
  },
  inactiveBadge: {
    backgroundColor: colors.gray400 + '20',
    paddingHorizontal: spacing.s,
    paddingVertical: 2,
    borderRadius: spacing.xs,
  },
  inactiveBadgeText: {
    ...typography.captionSmall,
    color: colors.gray400,
    fontWeight: '600',
  },
  memberEmail: {
    ...typography.body,
    color: colors.gray600,
    marginBottom: spacing.xs,
  },
  memberPhone: {
    ...typography.caption,
    color: colors.gray500,
    marginBottom: spacing.s,
  },
  memberStats: {
    gap: spacing.xs,
  },
  memberStat: {
    ...typography.caption,
    color: colors.gray500,
  },
  removeButton: {
    backgroundColor: colors.error + '10',
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    borderRadius: spacing.s,
    minWidth: 60,
    alignItems: 'center',
  },
  removeButtonText: {
    ...typography.caption,
    color: colors.error,
    fontWeight: '600',
  },
});

export default GroupMembersModal;
