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
} from 'react-native';
import { colors, typography, spacing } from '../theme';
import { getGroupHistoryApi } from '../services/api';

interface Transaction {
  id: string;
  type: 'contribution' | 'withdrawal' | 'loan' | 'repayment';
  amount: number;
  description: string;
  user_name: string;
  created_at: string;
  status?: string;
}

interface GroupHistoryModalProps {
  visible: boolean;
  onClose: () => void;
  group: {
    id: number;
    name: string;
  } | null;
}

const GroupHistoryModal: React.FC<GroupHistoryModalProps> = ({ visible, onClose, group }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (visible && group) {
      loadGroupHistory();
    }
  }, [visible, group]);

  const loadGroupHistory = async () => {
    if (!group) return;
    
    setLoading(true);
    setError('');
    
    try {
      const response = await getGroupHistoryApi(group.id);
      
      if (response?.data?.transactions) {
        setTransactions(response.data.transactions);
      } else {
        setTransactions([]);
      }
    } catch (err: any) {
      console.error('Failed to load group history:', err);
      setError('Failed to load transaction history');
      Alert.alert('Error', 'Failed to load transaction history');
    } finally {
      setLoading(false);
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'contribution': return '💰';
      case 'withdrawal': return '💸';
      case 'loan': return '🏦';
      case 'repayment': return '💳';
      default: return '📊';
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'contribution': return colors.success;
      case 'withdrawal': return colors.warning;
      case 'loan': return colors.info;
      case 'repayment': return colors.brandTeal;
      default: return colors.gray500;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Transaction History</Text>
              {group && <Text style={styles.subtitle}>{group.name}</Text>}
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.brandTeal} />
              <Text style={styles.loadingText}>Loading transaction history...</Text>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorIcon}>⚠️</Text>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity onPress={loadGroupHistory} style={styles.retryButton}>
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
              {transactions.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyIcon}>📝</Text>
                  <Text style={styles.emptyTitle}>No Transactions Yet</Text>
                  <Text style={styles.emptyText}>Transaction history will appear here</Text>
                </View>
              ) : (
                <View style={styles.transactionsList}>
                  {transactions.map((transaction) => (
                    <View key={transaction.id} style={styles.transactionItem}>
                      <View style={[styles.transactionIcon, { backgroundColor: getTransactionColor(transaction.type) + '20' }]}>
                        <Text style={styles.transactionIconText}>
                          {getTransactionIcon(transaction.type)}
                        </Text>
                      </View>
                      
                      <View style={styles.transactionDetails}>
                        <Text style={styles.transactionType}>
                          {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                        </Text>
                        <Text style={styles.transactionDescription}>
                          {transaction.description || `${transaction.type} by ${transaction.user_name}`}
                        </Text>
                        <Text style={styles.transactionDate}>
                          {formatDate(transaction.created_at)}
                        </Text>
                      </View>
                      
                      <View style={styles.transactionAmount}>
                        <Text style={[styles.amountText, { color: getTransactionColor(transaction.type) }]}>
                          {transaction.type === 'withdrawal' ? '-' : '+'}₹{transaction.amount.toLocaleString()}
                        </Text>
                        {transaction.status && (
                          <Text style={styles.transactionStatus}>
                            {transaction.status}
                          </Text>
                        )}
                      </View>
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
    maxHeight: '80%',
    minHeight: '50%',
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
  transactionsList: {
    gap: spacing.m,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray200,
    borderRadius: spacing.m,
    padding: spacing.m,
  },
  transactionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.m,
  },
  transactionIconText: {
    fontSize: 20,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionType: {
    ...typography.labelLarge,
    color: colors.gray900,
    fontWeight: '600',
  },
  transactionDescription: {
    ...typography.body,
    color: colors.gray600,
    marginTop: spacing.xs,
  },
  transactionDate: {
    ...typography.caption,
    color: colors.gray500,
    marginTop: spacing.xs,
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  amountText: {
    ...typography.labelLarge,
    fontWeight: '700',
  },
  transactionStatus: {
    ...typography.captionSmall,
    color: colors.gray500,
    marginTop: spacing.xs,
  },
});

export default GroupHistoryModal;
