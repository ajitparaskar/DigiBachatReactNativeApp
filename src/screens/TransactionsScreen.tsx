import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Alert, TextInput, TouchableOpacity, Linking, StatusBar } from 'react-native';
import Container from '../components/ui/Container';
import Card from '../components/ui/Card';
import PrimaryButton from '../components/ui/PrimaryButton';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { colors, typography, spacing, shadows } from '../theme';
import { getGroupTransactionsApi, getUserTransactionsApi, exportTransactionsApi, api } from '../services/api';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Transactions'>;

interface Transaction {
  id: number;
  type: 'contribution' | 'withdrawal' | 'loan' | 'repayment';
  amount: number;
  date: string;
  created_at?: string;
  group?: string;
  group_name?: string;
  group_id?: number;
  description?: string;
}

interface TransactionItemProps {
  item: Transaction;
}

const TransactionsScreen: React.FC<Props> = ({ route }) => {
  const groupId = route.params?.groupId;
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<Transaction[]>([]);
  const [search, setSearch] = useState('');
  const [type, setType] = useState<'all' | 'contribution' | 'withdrawal' | 'loan' | 'repayment'>('all');
  const [dateRange, setDateRange] = useState<'7days'|'30days'|'90days'|'1year'>('30days');
  const [groupFilter, setGroupFilter] = useState<'all'|string>('all');
  const [groups, setGroups] = useState<string[]>([]);
  const [format, setFormat] = useState<'csv'|'pdf'>('csv');

  const filtered = useMemo(() => {
    return items.filter((t) => {
      const matchesType = type === 'all' || (t.type === type);
      const s = search.trim().toLowerCase();
      const matchesSearch = !s ||
        String(t.description || '').toLowerCase().includes(s) ||
        String(t.group || t.group_name || '').toLowerCase().includes(s) ||
        String(t.id || '').toLowerCase().includes(s);
      const matchesGroup = groupFilter === 'all' || String(t.group || t.group_name || '') === groupFilter;
      // date filter
      const dt = new Date(t.date || t.created_at || Date.now());
      const today = new Date();
      const diffDays = Math.floor((today.getTime() - dt.getTime()) / (1000*60*60*24));
      let matchesDate = true;
      switch (dateRange) {
        case '7days': matchesDate = diffDays <= 7; break;
        case '30days': matchesDate = diffDays <= 30; break;
        case '90days': matchesDate = diffDays <= 90; break;
        case '1year': matchesDate = diffDays <= 365; break;
      }
      return matchesType && matchesSearch && matchesGroup && matchesDate;
    });
  }, [items, search, type]);

  useEffect(() => {
    const loadTransactions = async () => {
      try {
        setLoading(true);
        const res = groupId 
          ? await getGroupTransactionsApi(groupId)
          : await getUserTransactionsApi();
        
        const arr: Transaction[] = res.data?.data?.transactions || res.data?.transactions || [];
        setItems(arr);
        if (!groupId) {
          const unique = Array.from(new Set(arr.map((t: Transaction) => String(t.group || t.group_name || '')))).filter(Boolean) as string[];
          setGroups(unique);
        }
      } catch (e: unknown) {
        const error = e as { message?: string };
        Alert.alert('Error', error?.message || 'Failed to load transactions');
      } finally {
        setLoading(false);
      }
    };

    loadTransactions();
  }, [groupId]);

  if (loading) {
    return <LoadingSpinner text="Loading transactions..." />;
  }

  const getTransactionIcon = (transactionType: string) => {
    switch (transactionType) {
      case 'contribution': return '💰';
      case 'withdrawal': return '💸';
      case 'loan': return '🏦';
      case 'repayment': return '💳';
      default: return '📊';
    }
  };

  const getTransactionColor = (transactionType: string) => {
    switch (transactionType) {
      case 'contribution': return colors.success;
      case 'withdrawal': return colors.warning;
      case 'loan': return colors.info;
      case 'repayment': return colors.brandTeal;
      default: return colors.gray500;
    }
  };

  const renderTransactionItem = ({ item }: { item: Transaction }) => (
    <TouchableOpacity style={styles.transactionItem} activeOpacity={0.7}>
      <View style={[styles.transactionIcon, { backgroundColor: getTransactionColor(item.type || 'contribution') + '20' }]}>
        <Text style={styles.transactionIconText}>{getTransactionIcon(item.type || 'contribution')}</Text>
      </View>
      <View style={styles.transactionContent}>
        <Text style={styles.transactionTitle}>
          {item.type === 'contribution' ? 'Contribution' :
           item.type === 'withdrawal' ? 'Withdrawal' :
           item.type === 'loan' ? 'Loan' : 'Repayment'}
        </Text>
        <Text style={styles.transactionDate}>
          {new Date(item.date || Date.now()).toLocaleDateString()}
        </Text>
      </View>
      <Text style={[
        styles.transactionAmount,
        { color: getTransactionColor(item.type || 'contribution') }
      ]}>
        {item.type === 'contribution' || item.type === 'repayment' ? '+' : '-'}
        ₹{(item.amount || 0).toLocaleString()}
      </Text>
    </TouchableOpacity>
  );

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor={colors.backgroundSecondary} />
      <Container style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Transactions</Text>
          <Text style={styles.subtitle}>Track all your financial activities</Text>
        </View>

        <Card variant="elevated" style={styles.filtersCard}>
          <Text style={styles.filtersTitle}>Filters & Search</Text>
          
          <TextInput
            placeholder="Search transactions..."
            value={search}
            onChangeText={setSearch}
            style={styles.searchInput}
          />
          
          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>Transaction Type</Text>
            <View style={styles.filterRow}>
              {(['all','contribution','withdrawal','loan','repayment'] as const).map((key) => (
                <TouchableOpacity 
                  key={key} 
                  onPress={() => setType(key)} 
                  style={[styles.filterChip, type === key && styles.filterChipActive]}
                >
                  <Text style={[styles.filterText, type === key && styles.filterTextActive]}>
                    {key === 'all' ? 'All' : key.charAt(0).toUpperCase() + key.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>Time Period</Text>
            <View style={styles.filterRow}>
              {(['7days','30days','90days','1year'] as const).map((k) => (
                <TouchableOpacity 
                  key={k} 
                  onPress={() => setDateRange(k)} 
                  style={[styles.filterChip, dateRange === k && styles.filterChipActive]}
                >
                  <Text style={[styles.filterText, dateRange === k && styles.filterTextActive]}>
                    {k.replace('days', 'd').replace('year', 'y')}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {!groupId && groups.length > 0 && (
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Groups</Text>
              <View style={styles.filterRow}>
                <TouchableOpacity 
                  onPress={() => setGroupFilter('all')} 
                  style={[styles.filterChip, groupFilter === 'all' && styles.filterChipActive]}
                >
                  <Text style={[styles.filterText, groupFilter === 'all' && styles.filterTextActive]}>All</Text>
                </TouchableOpacity>
                {groups.slice(0, 3).map((g) => (
                  <TouchableOpacity 
                    key={g} 
                    onPress={() => setGroupFilter(g)} 
                    style={[styles.filterChip, groupFilter === g && styles.filterChipActive]}
                  >
                    <Text style={[styles.filterText, groupFilter === g && styles.filterTextActive]}>
                      {g.length > 10 ? g.substring(0, 10) + '...' : g}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          <View style={styles.exportSection}>
            <Text style={styles.filterLabel}>Export Format</Text>
            <View style={styles.exportRow}>
              <View style={styles.formatOptions}>
                {(['csv','pdf'] as const).map((f) => (
                  <TouchableOpacity 
                    key={f} 
                    onPress={() => setFormat(f)} 
                    style={[styles.formatChip, format === f && styles.formatChipActive]}
                  >
                    <Text style={[styles.formatText, format === f && styles.formatTextActive]}>
                      {f.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TouchableOpacity
                onPress={async () => {
                  try {
                    const res = await exportTransactionsApi({
                      type: type === 'all' ? undefined : type,
                      dateRange,
                      group: groupFilter === 'all' ? undefined : groupFilter,
                      format,
                    });
                    let url = res.data?.data?.url || res.data?.url;
                    if (url) {
                      if (!/^https?:\/\//i.test(url)) {
                        const base = api.defaults.baseURL?.replace(/\/$/, '') || '';
                        const path = String(url).replace(/^\//, '');
                        url = `${base}/${path}`;
                      }
                      Linking.openURL(url);
                    } else {
                      Alert.alert('Export', 'No download URL returned');
                    }
                  } catch (e: any) {
                    Alert.alert('Export failed', e?.message || 'Unable to export');
                  }
                }}
                style={styles.exportButton}
              >
                <Text style={styles.exportButtonText}>📥 Export</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Card>

        <Card variant="elevated" style={styles.transactionsCard}>
          <View style={styles.transactionsHeader}>
            <Text style={styles.transactionsTitle}>Recent Transactions</Text>
            <Text style={styles.transactionsCount}>{filtered.length} transactions</Text>
          </View>
          
          {filtered.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📋</Text>
              <Text style={styles.emptyTitle}>No Transactions Found</Text>
              <Text style={styles.emptyDescription}>Try adjusting your filters to see more results</Text>
            </View>
          ) : (
            <FlatList
              data={filtered}
              keyExtractor={(_, idx) => String(idx)}
              renderItem={renderTransactionItem}
              showsVerticalScrollIndicator={false}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
          )}
        </Card>
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
  filtersCard: {
    marginBottom: spacing.l,
  },
  filtersTitle: {
    ...typography.h3,
    marginBottom: spacing.l,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: colors.gray300,
    borderRadius: spacing.m,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    marginBottom: spacing.l,
    backgroundColor: colors.white,
    ...typography.body,
  },
  filterSection: {
    marginBottom: spacing.l,
  },
  filterLabel: {
    ...typography.label,
    marginBottom: spacing.s,
    color: colors.gray700,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.s,
  },
  filterChip: {
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    borderRadius: spacing.l,
    borderWidth: 1,
    borderColor: colors.gray300,
    backgroundColor: colors.white,
  },
  filterChipActive: {
    backgroundColor: colors.brandTeal,
    borderColor: colors.brandTeal,
  },
  filterText: {
    ...typography.caption,
    color: colors.gray700,
  },
  filterTextActive: {
    color: colors.white,
    fontWeight: '600',
  },
  exportSection: {
    marginBottom: 0,
  },
  exportRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  formatOptions: {
    flexDirection: 'row',
    gap: spacing.s,
  },
  formatChip: {
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    borderRadius: spacing.s,
    borderWidth: 1,
    borderColor: colors.gray300,
    backgroundColor: colors.white,
  },
  formatChipActive: {
    backgroundColor: colors.info,
    borderColor: colors.info,
  },
  formatText: {
    ...typography.caption,
    color: colors.gray700,
  },
  formatTextActive: {
    color: colors.white,
    fontWeight: '600',
  },
  exportButton: {
    backgroundColor: colors.brandTeal,
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.s,
    borderRadius: spacing.m,
  },
  exportButtonText: {
    ...typography.label,
    color: colors.white,
    fontWeight: '600',
  },
  transactionsCard: {
    marginBottom: spacing.xl,
  },
  transactionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.l,
  },
  transactionsTitle: {
    ...typography.h3,
  },
  transactionsCount: {
    ...typography.caption,
    color: colors.gray500,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.m,
  },
  transactionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.m,
  },
  transactionIconText: {
    fontSize: 20,
  },
  transactionContent: {
    flex: 1,
  },
  transactionTitle: {
    ...typography.labelLarge,
    color: colors.gray900,
    marginBottom: spacing.xs,
    textTransform: 'capitalize',
  },
  transactionGroup: {
    ...typography.caption,
    color: colors.gray500,
    marginBottom: spacing.xs,
  },
  transactionDate: {
    ...typography.captionSmall,
    color: colors.gray400,
  },
  transactionAmount: {
    ...typography.labelLarge,
    fontWeight: '600',
  },
  separator: {
    height: 1,
    backgroundColor: colors.gray200,
    marginVertical: spacing.xs,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: spacing.l,
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
  },
});

export default TransactionsScreen;
