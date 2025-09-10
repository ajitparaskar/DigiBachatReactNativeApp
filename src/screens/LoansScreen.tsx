import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
  StatusBar,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import {
  getUserLoanRequestsApi,
  getGroupLoanRequestsApi,
  getUserGroupsApi,
  approveLoanRequestApi,
  rejectLoanRequestApi,
  makeLoanRepaymentApi,
} from '../services/api';
import Container from '../components/ui/Container';
import Card from '../components/ui/Card';
import PrimaryButton from '../components/ui/PrimaryButton';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import EmptyState from '../components/ui/EmptyState';
import { colors, typography, spacing, shadows } from '../theme';
import type { LoanRequest } from '../types/loan';

type Props = NativeStackScreenProps<RootStackParamList, 'Loans'>;

interface Group {
  id: number;
  name: string;
  is_leader?: boolean;
  created_by?: number;
}

const LoansScreen: React.FC<Props> = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState<'my-requests' | 'manage-requests'>('my-requests');
  const [myLoans, setMyLoans] = useState<LoanRequest[]>([]);
  const [groupLoans, setGroupLoans] = useState<LoanRequest[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      
      const [groupsResponse, loansResponse] = await Promise.all([
        getUserGroupsApi(),
        getUserLoanRequestsApi()
      ]);

      if (groupsResponse?.data?.data?.groups) {
        const userGroups = groupsResponse.data.data.groups;
        setGroups(userGroups);
        
        const leaderGroups = userGroups.filter((group: any) => 
          group.is_leader || group.created_by
        );
        if (leaderGroups.length > 0 && !selectedGroup) {
          setSelectedGroup(leaderGroups[0].id.toString());
        }
      }

      if (loansResponse?.data?.data?.loans) {
        setMyLoans(loansResponse.data.data.loans);
      }

    } catch (error) {
      console.error('Error loading loans data:', error);
      Alert.alert('Error', 'Failed to load loans data');
    } finally {
      setLoading(false);
    }
  }, [selectedGroup]);

  const loadGroupLoans = useCallback(async () => {
    if (!selectedGroup) return;
    
    try {
      const response = await getGroupLoanRequestsApi(selectedGroup);
      if (response?.data?.data?.loans) {
        setGroupLoans(response.data.data.loans);
      }
    } catch (error) {
      console.error('Error loading group loans:', error);
    }
  }, [selectedGroup]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (selectedGroup && activeTab === 'manage-requests') {
      loadGroupLoans();
    }
  }, [selectedGroup, activeTab, loadGroupLoans]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    if (activeTab === 'manage-requests') {
      await loadGroupLoans();
    }
    setRefreshing(false);
  }, [loadData, loadGroupLoans, activeTab]);

  const handleApproveLoan = async (loan: LoanRequest) => {
    Alert.alert(
      'Approve Loan',
      `Approve loan request of ₹${loan.amount.toLocaleString()} from ${loan.user_name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve',
          onPress: async () => {
            try {
              const dueDate = new Date();
              dueDate.setMonth(dueDate.getMonth() + 1);
              
              await approveLoanRequestApi(loan.group_id, loan.id, {
                dueDate: dueDate.toISOString(),
                interestRate: 10,
                paymentMethod: 'group_funds'
              });
              
              Alert.alert('Success', 'Loan approved successfully');
              loadGroupLoans();
            } catch (error: any) {
              Alert.alert('Error', error.response?.data?.message || 'Failed to approve loan');
            }
          }
        }
      ]
    );
  };

  const handleRejectLoan = async (loan: LoanRequest) => {
    Alert.alert(
      'Reject Loan',
      `Reject loan request of ₹${loan.amount.toLocaleString()} from ${loan.user_name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            try {
              await rejectLoanRequestApi(loan.group_id, loan.id);
              Alert.alert('Success', 'Loan rejected');
              loadGroupLoans();
            } catch (error: any) {
              Alert.alert('Error', error.response?.data?.message || 'Failed to reject loan');
            }
          }
        }
      ]
    );
  };

  const handleRequestLoan = () => {
    if (groups.length === 0) {
      Alert.alert('No Groups', 'You need to join a group first to request a loan');
      return;
    }
    
    // Navigate to loan request screen with first group
    navigation.navigate('LoanRequest', {
      groupId: groups[0].id.toString(),
      groupName: groups[0].name
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return colors.success;
      case 'rejected':
        return colors.error;
      case 'pending':
        return colors.warning;
      default:
        return colors.gray500;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return '✅';
      case 'rejected':
        return '❌';
      case 'pending':
        return '⏳';
      default:
        return '📄';
    }
  };

  const renderLoanCard = (loan: LoanRequest, isManaging = false) => (
    <Card key={loan.id} style={styles.loanCard}>
      <View style={styles.loanHeader}>
        <View style={styles.loanInfo}>
          <Text style={styles.loanAmount}>₹{loan.amount.toLocaleString()}</Text>
          <Text style={styles.loanPurpose}>{loan.purpose}</Text>
          {isManaging && loan.user_name && (
            <Text style={styles.loanUser}>Requested by: {loan.user_name}</Text>
          )}
        </View>
        <View style={styles.loanStatus}>
          <Text style={styles.statusIcon}>{getStatusIcon(loan.status)}</Text>
          <Text style={[styles.statusText, { color: getStatusColor(loan.status) }]}>
            {loan.status.charAt(0).toUpperCase() + loan.status.slice(1)}
          </Text>
        </View>
      </View>

      <View style={styles.loanDetails}>
        <Text style={styles.loanDate}>
          Requested: {new Date(loan.created_at).toLocaleDateString()}
        </Text>
        {loan.due_date && (
          <Text style={styles.loanDate}>
            Due: {new Date(loan.due_date).toLocaleDateString()}
          </Text>
        )}
        {loan.interest_rate && (
          <Text style={styles.loanDate}>
            Interest: {loan.interest_rate}%
          </Text>
        )}
      </View>

      {isManaging && loan.status === 'pending' && (
        <View style={styles.loanActions}>
          <PrimaryButton
            title="Approve"
            onPress={() => handleApproveLoan(loan)}
            variant="outline"
            style={StyleSheet.flatten([styles.actionButton, { borderColor: colors.success }])}
          />
          <PrimaryButton
            title="Reject"
            onPress={() => handleRejectLoan(loan)}
            variant="outline"
            style={StyleSheet.flatten([styles.actionButton, { borderColor: colors.error }])}
          />
        </View>
      )}
    </Card>
  );

  if (loading) {
    return <LoadingSpinner text="Loading loans..." />;
  }

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor={colors.backgroundSecondary} />
      <Container style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Loans</Text>
          <Text style={styles.subtitle}>Manage your loan requests and approvals</Text>
        </View>

        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'my-requests' && styles.activeTab]}
            onPress={() => setActiveTab('my-requests')}
          >
            <Text style={[styles.tabText, activeTab === 'my-requests' && styles.activeTabText]}>
              My Requests
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'manage-requests' && styles.activeTab]}
            onPress={() => setActiveTab('manage-requests')}
          >
            <Text style={[styles.tabText, activeTab === 'manage-requests' && styles.activeTabText]}>
              Manage Requests
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.content}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          showsVerticalScrollIndicator={false}
        >
          {activeTab === 'my-requests' ? (
            <View style={styles.tabContent}>
              <View style={styles.actionHeader}>
                <PrimaryButton
                  title="Request New Loan"
                  onPress={handleRequestLoan}
                  style={styles.requestButton}
                />
              </View>

              {myLoans.length === 0 ? (
                <EmptyState
                  icon="💰"
                  title="No Loan Requests"
                  description="You haven't requested any loans yet. Request a loan from your savings group when you need financial assistance."
                  actionText="Request Loan"
                  onAction={handleRequestLoan}
                />
              ) : (
                <View style={styles.loansList}>
                  {myLoans.map(loan => renderLoanCard(loan))}
                </View>
              )}
            </View>
          ) : (
            <View style={styles.tabContent}>
              {groups.filter(g => g.is_leader || g.created_by).length === 0 ? (
                <EmptyState
                  icon="👑"
                  title="No Groups to Manage"
                  description="You need to be a group admin to manage loan requests."
                />
              ) : (
                <>
                  {groups.filter(g => g.is_leader || g.created_by).length > 1 && (
                    <View style={styles.groupSelector}>
                      <Text style={styles.groupSelectorLabel}>Select Group:</Text>
                      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {groups.filter(g => g.is_leader || g.created_by).map(group => (
                          <TouchableOpacity
                            key={group.id}
                            style={[
                              styles.groupButton,
                              selectedGroup === group.id.toString() && styles.selectedGroupButton
                            ]}
                            onPress={() => setSelectedGroup(group.id.toString())}
                          >
                            <Text style={[
                              styles.groupButtonText,
                              selectedGroup === group.id.toString() && styles.selectedGroupButtonText
                            ]}>
                              {group.name}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                  )}

                  {groupLoans.length === 0 ? (
                    <EmptyState
                      icon="📋"
                      title="No Loan Requests"
                      description="No pending loan requests in this group."
                    />
                  ) : (
                    <View style={styles.loansList}>
                      {groupLoans.map(loan => renderLoanCard(loan, true))}
                    </View>
                  )}
                </>
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
    padding: spacing.l,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  title: {
    ...typography.h2,
    color: colors.gray900,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    color: colors.gray600,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.m,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: colors.brandTeal,
  },
  tabText: {
    ...typography.button,
    color: colors.gray600,
  },
  activeTabText: {
    color: colors.brandTeal,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  tabContent: {
    padding: spacing.l,
  },
  actionHeader: {
    marginBottom: spacing.l,
  },
  requestButton: {
    alignSelf: 'flex-start',
  },
  loansList: {
    gap: spacing.m,
  },
  loanCard: {
    padding: spacing.l,
  },
  loanHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.m,
  },
  loanInfo: {
    flex: 1,
  },
  loanAmount: {
    ...typography.h3,
    color: colors.gray900,
    marginBottom: spacing.xs,
  },
  loanPurpose: {
    ...typography.body,
    color: colors.gray700,
    marginBottom: spacing.xs,
  },
  loanUser: {
    ...typography.caption,
    color: colors.gray600,
  },
  loanStatus: {
    alignItems: 'center',
  },
  statusIcon: {
    fontSize: 20,
    marginBottom: spacing.xs,
  },
  statusText: {
    ...typography.caption,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  loanDetails: {
    marginBottom: spacing.m,
  },
  loanDate: {
    ...typography.caption,
    color: colors.gray600,
    marginBottom: spacing.xs,
  },
  loanActions: {
    flexDirection: 'row',
    gap: spacing.m,
  },
  actionButton: {
    flex: 1,
  },
  groupSelector: {
    marginBottom: spacing.l,
  },
  groupSelectorLabel: {
    ...typography.labelLarge,
    color: colors.gray700,
    marginBottom: spacing.s,
  },
  groupButton: {
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    borderRadius: spacing.s,
    backgroundColor: colors.gray100,
    marginRight: spacing.s,
  },
  selectedGroupButton: {
    backgroundColor: colors.brandTeal,
  },
  groupButtonText: {
    ...typography.caption,
    color: colors.gray700,
  },
  selectedGroupButtonText: {
    color: colors.white,
  },
});

export default LoansScreen;
