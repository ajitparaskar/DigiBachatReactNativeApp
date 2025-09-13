import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  StatusBar,
  Share,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Container from '../components/ui/Container';
import Card from '../components/ui/Card';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import EmptyState from '../components/ui/EmptyState';
import ErrorBoundary from '../components/ui/ErrorBoundary';
import { colors, typography, spacing, shadows } from '../theme';
import {
  exportTransactionsApi,
  getUserTransactionsApi,
  getUserGroupsApi,
} from '../services/api';

const { width } = Dimensions.get('window');

interface ReportFilter {
  type: 'all' | 'contribution' | 'withdrawal' | 'loan' | 'repayment';
  dateRange: '7days' | '30days' | '90days' | '1year' | 'custom';
  group?: string;
  format: 'csv' | 'pdf';
}

interface TransactionSummary {
  totalContributions: number;
  totalWithdrawals: number;
  totalLoans: number;
  totalRepayments: number;
  netAmount: number;
}

interface SummaryCardProps {
  title: string;
  amount: number;
  icon: string;
  color: string;
  percentage?: number;
}

interface Transaction {
  id: number;
  type: 'contribution' | 'withdrawal' | 'loan' | 'repayment';
  amount: number;
  date: string;
  created_at: string;
  group_id?: number;
}

const FinancialReportsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [groups, setGroups] = useState<{ id: number; name: string }[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<TransactionSummary>({
    totalContributions: 0,
    totalWithdrawals: 0,
    totalLoans: 0,
    totalRepayments: 0,
    netAmount: 0,
  });
  
  const [filters, setFilters] = useState<ReportFilter>({
    type: 'all',
    dateRange: '30days',
    format: 'pdf',
  });

  const transactionTypes = [
    { key: 'all', label: '📊 All Transactions', icon: '📊' },
    { key: 'contribution', label: '💰 Contributions', icon: '💰' },
    { key: 'withdrawal', label: '💸 Withdrawals', icon: '💸' },
    { key: 'loan', label: '🏦 Loans', icon: '🏦' },
    { key: 'repayment', label: '💳 Repayments', icon: '💳' },
  ];

  const dateRanges = [
    { key: '7days', label: 'Last 7 days' },
    { key: '30days', label: 'Last 30 days' },
    { key: '90days', label: 'Last 3 months' },
    { key: '1year', label: 'Last year' },
    { key: 'custom', label: 'Custom range' },
  ];

  const formats = [
    { key: 'pdf', label: '📄 PDF Report', icon: '📄' },
    { key: 'csv', label: '📊 CSV Data', icon: '📊' },
  ];

  useEffect(() => {
    loadData();
  }, [filters]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [transactionsRes, groupsRes] = await Promise.all([
        getUserTransactionsApi(),
        getUserGroupsApi(),
      ]);

      const transactionsData = transactionsRes.data?.data?.transactions || transactionsRes.data?.transactions || [];
      const groupsData = groupsRes.data?.data?.groups || groupsRes.data?.groups || [];

      setTransactions(transactionsData);
      setGroups(groupsData);
      
      // Calculate summary
      calculateSummary(transactionsData);
    } catch (error: any) {
      console.error('Failed to load financial data:', error);
      setError(error?.message || 'Failed to load financial reports');
    } finally {
      setLoading(false);
    }
  };

  const calculateSummary = (transactionsData: Transaction[]) => {
    const filtered = filterTransactions(transactionsData);
    
    const summary = filtered.reduce(
      (acc, transaction) => {
        const amount = transaction.amount || 0;
        switch (transaction.type) {
          case 'contribution':
            acc.totalContributions += amount;
            acc.netAmount += amount;
            break;
          case 'withdrawal':
            acc.totalWithdrawals += amount;
            acc.netAmount -= amount;
            break;
          case 'loan':
            acc.totalLoans += amount;
            acc.netAmount -= amount;
            break;
          case 'repayment':
            acc.totalRepayments += amount;
            acc.netAmount += amount;
            break;
        }
        return acc;
      },
      {
        totalContributions: 0,
        totalWithdrawals: 0,
        totalLoans: 0,
        totalRepayments: 0,
        netAmount: 0,
      }
    );

    setSummary(summary);
  };

  const filterTransactions = (transactionsData: Transaction[]) => {
    let filtered = transactionsData;

    // Filter by type
    if (filters.type !== 'all') {
      filtered = filtered.filter(t => t.type === filters.type);
    }

    // Filter by date range
    const now = new Date();
    const cutoffDate = new Date();
    switch (filters.dateRange) {
      case '7days':
        cutoffDate.setDate(now.getDate() - 7);
        break;
      case '30days':
        cutoffDate.setDate(now.getDate() - 30);
        break;
      case '90days':
        cutoffDate.setDate(now.getDate() - 90);
        break;
      case '1year':
        cutoffDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    if (filters.dateRange !== 'custom') {
      filtered = filtered.filter(t => new Date(t.date || t.created_at) >= cutoffDate);
    }

    // Filter by group
    if (filters.group) {
      filtered = filtered.filter(t => t.group_id?.toString() === filters.group);
    }

    return filtered;
  };

  const handleExportReport = async () => {
    try {
      setExporting(true);
      
      const response = await exportTransactionsApi({
        type: filters.type === 'all' ? undefined : filters.type,
        dateRange: filters.dateRange === 'custom' ? undefined : filters.dateRange,
        group: filters.group,
        format: filters.format,
      });

      // In a real implementation, this would download or share the file
      // For now, we'll simulate sharing
      const reportName = `financial_report_${filters.dateRange}_${filters.type}.${filters.format}`;
      
      await Share.share({
        message: `Financial Report Generated: ${reportName}`,
        title: 'DigiBachat Financial Report',
      });

      Alert.alert(
        'Report Generated!',
        `Your ${filters.format.toUpperCase()} report has been generated successfully.`,
        [{ text: 'OK' }]
      );
    } catch (error: any) {
      console.error('Export failed:', error);
      Alert.alert('Export Failed', error?.message || 'Failed to generate report');
    } finally {
      setExporting(false);
    }
  };

  const SummaryCard: React.FC<SummaryCardProps> = ({ title, amount, icon, color, percentage }) => (
    <Card variant="elevated" style={StyleSheet.flatten([styles.summaryCard, { borderLeftColor: color }])}>
      <View style={styles.summaryHeader}>
        <View style={StyleSheet.flatten([styles.summaryIcon, { backgroundColor: color + '20' }])}>
          <Text style={styles.summaryIconText}>{icon}</Text>
        </View>
        <View style={styles.summaryContent}>
          <Text style={styles.summaryLabel}>{title}</Text>
          <Text style={styles.summaryAmount}>₹{amount.toLocaleString()}</Text>
          {percentage !== undefined && (
            <Text style={[styles.summaryChange, { color }]}>
              {percentage > 0 ? '+' : ''}{percentage}%
            </Text>
          )}
        </View>
      </View>
    </Card>
  );

  if (loading) {
    return (
      <ErrorBoundary>
        <LoadingSpinner text="Loading financial reports..." />
      </ErrorBoundary>
    );
  }

  if (error) {
    return (
      <ErrorBoundary>
        <Container style={styles.container}>
          <EmptyState
            icon="📊"
            title="Unable to load reports"
            description={error}
            actionText="Try Again"
            onAction={loadData}
            variant="large"
          />
        </Container>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <StatusBar barStyle="dark-content" backgroundColor={colors.backgroundSecondary} />
      <Container style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Financial Reports</Text>
            <Text style={styles.subtitle}>Generate and export detailed financial reports</Text>
          </View>

          {/* Summary Cards */}
          <View style={styles.summaryGrid}>
            <SummaryCard
              title="Total Contributions"
              amount={summary.totalContributions}
              icon="💰"
              color={colors.success}
            />
            <SummaryCard
              title="Total Withdrawals"
              amount={summary.totalWithdrawals}
              icon="💸"
              color={colors.warning}
            />
            <SummaryCard
              title="Active Loans"
              amount={summary.totalLoans}
              icon="🏦"
              color={colors.error}
            />
            <SummaryCard
              title="Net Amount"
              amount={summary.netAmount}
              icon="📈"
              color={summary.netAmount >= 0 ? colors.success : colors.error}
            />
          </View>

          {/* Filters */}
          <Card variant="elevated" style={styles.filtersCard}>
            <Text style={styles.filtersTitle}>📋 Report Filters</Text>
            
            {/* Report Type */}
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Transaction Type</Text>
              <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
                <View style={styles.filterOptions}>
                  {transactionTypes.map((type) => (
                    <TouchableOpacity
                      key={type.key}
                      style={[
                        styles.filterOption,
                        filters.type === type.key && styles.filterOptionActive
                      ]}
                      onPress={() => setFilters({ ...filters, type: type.key as any })}
                    >
                      <Text style={styles.filterOptionIcon}>{type.icon}</Text>
                      <Text style={[
                        styles.filterOptionText,
                        filters.type === type.key && styles.filterOptionTextActive
                      ]}>
                        {type.label.split(' ')[1]}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            {/* Date Range */}
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Date Range</Text>
              <View style={styles.dateRangeOptions}>
                {dateRanges.map((range) => (
                  <TouchableOpacity
                    key={range.key}
                    onPress={() => setFilters(prev => ({ ...prev, dateRange: range.key as ReportFilter['dateRange'] }))}
                    style={[
                      styles.dateRangeOption,
                      filters.dateRange === range.key && styles.dateRangeOptionActive
                    ]}
                  >
                    <Text style={[
                      styles.dateRangeText,
                      filters.dateRange === range.key && styles.dateRangeTextActive
                    ]}>
                      {range.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Group Filter */}
            {groups.length > 0 && (
              <View style={styles.filterSection}>
                <Text style={styles.filterLabel}>Group (Optional)</Text>
                <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
                  <View style={styles.groupOptions}>
                    <TouchableOpacity
                      style={[
                        styles.groupOption,
                        !filters.group && styles.groupOptionActive
                      ]}
                      onPress={() => setFilters({ ...filters, group: undefined })}
                    >
                      <Text style={[
                        styles.groupOptionText,
                        !filters.group && styles.groupOptionTextActive
                      ]}>
                        All Groups
                      </Text>
                    </TouchableOpacity>
                    {groups.map((group) => (
                      <TouchableOpacity
                        key={group.id}
                        style={[
                          styles.groupOption,
                          filters.group === group.id.toString() && styles.groupOptionActive
                        ]}
                        onPress={() => setFilters({ ...filters, group: group.id.toString() })}
                      >
                        <Text style={[
                          styles.groupOptionText,
                          filters.group === group.id.toString() && styles.groupOptionTextActive
                        ]}>
                          {group.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>
            )}

            {/* Export Format */}
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Export Format</Text>
              <View style={styles.formatOptions}>
                {formats.map((format) => (
                  <TouchableOpacity
                    key={format.key}
                    style={[
                      styles.formatOption,
                      filters.format === format.key && styles.formatOptionActive
                    ]}
                    onPress={() => setFilters({ ...filters, format: format.key as any })}
                  >
                    <Text style={styles.formatOptionIcon}>{format.icon}</Text>
                    <Text style={[
                      styles.formatOptionText,
                      filters.format === format.key && styles.formatOptionTextActive
                    ]}>
                      {format.label.split(' ')[1]}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </Card>

          {/* Export Button */}
          <TouchableOpacity
            style={[styles.exportButton, exporting && styles.exportButtonDisabled]}
            onPress={handleExportReport}
            disabled={exporting}
          >
            <Text style={styles.exportButtonIcon}>
              {exporting ? '⏳' : '📤'}
            </Text>
            <Text style={styles.exportButtonText}>
              {exporting ? 'Generating Report...' : `Generate ${filters.format.toUpperCase()} Report`}
            </Text>
          </TouchableOpacity>

          {/* Recent Transactions Preview */}
          <Card variant="elevated" style={styles.previewCard}>
            <Text style={styles.previewTitle}>📄 Report Preview</Text>
            <Text style={styles.previewSubtitle}>
              Showing {filterTransactions(transactions).length} transactions
            </Text>
            
            {filterTransactions(transactions).slice(0, 5).map((transaction, index) => (
              <View key={index} style={styles.previewItem}>
                <View style={styles.previewItemLeft}>
                  <Text style={styles.previewItemType}>
                    {transaction.type === 'contribution' ? '💰' :
                     transaction.type === 'withdrawal' ? '💸' :
                     transaction.type === 'loan' ? '🏦' : '💳'}
                  </Text>
                  <View>
                    <Text style={styles.previewItemTitle}>
                      {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                    </Text>
                    <Text style={styles.previewItemDate}>
                      {new Date(transaction.date || transaction.created_at).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
                <Text style={[
                  styles.previewItemAmount,
                  transaction.type === 'contribution' || transaction.type === 'repayment' 
                    ? styles.previewItemAmountPositive 
                    : styles.previewItemAmountNegative
                ]}>
                  {transaction.type === 'contribution' || transaction.type === 'repayment' ? '+' : '-'}
                  ₹{(transaction.amount || 0).toLocaleString()}
                </Text>
              </View>
            ))}

            {filterTransactions(transactions).length > 5 && (
              <Text style={styles.previewMore}>
                ... and {filterTransactions(transactions).length - 5} more transactions
              </Text>
            )}
          </Card>
        </ScrollView>
      </Container>
    </ErrorBoundary>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
  },
  loadingText: {
    marginTop: spacing.m,
    fontSize: 14,
    color: colors.gray600,
    fontWeight: '500',
  },
  header: {
    paddingHorizontal: spacing.l,
    paddingTop: spacing.l,
    paddingBottom: spacing.l,
    backgroundColor: colors.white,
    marginBottom: spacing.m,
    borderBottomWidth: 0.5,
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
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: spacing.l,
    marginBottom: spacing.l,
    gap: spacing.s,
  },
  summaryCard: {
    flex: 1,
    minWidth: (width - spacing.l * 2 - spacing.s) / 2,
    backgroundColor: colors.white,
    borderRadius: spacing.m,
    padding: spacing.m,
    ...shadows.small,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.m,
  },
  summaryIconText: {
    fontSize: 18,
    color: colors.white,
  },
  summaryContent: {
    flex: 1,
  },
  summaryLabel: {
    ...typography.caption,
    color: colors.gray600,
    marginBottom: spacing.xs,
  },
  summaryAmount: {
    ...typography.h4,
    color: colors.gray900,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },
  summaryChange: {
    ...typography.captionSmall,
    fontWeight: '500',
  },
  filtersCard: {
    marginHorizontal: spacing.l,
    marginBottom: spacing.l,
    padding: spacing.l,
  },
  filtersTitle: {
    ...typography.h3,
    color: colors.gray900,
    marginBottom: spacing.l,
  },
  filterSection: {
    marginBottom: spacing.l,
  },
  filterLabel: {
    ...typography.label,
    color: colors.gray900,
    marginBottom: spacing.m,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.s,
  },
  filterOption: {
    alignItems: 'center',
    padding: spacing.m,
    borderRadius: spacing.m,
    backgroundColor: colors.gray100,
    minWidth: 80,
  },
  filterOptionActive: {
    backgroundColor: colors.brandTeal,
  },
  filterOptionIcon: {
    fontSize: 20,
    marginBottom: spacing.xs,
  },
  filterOptionText: {
    ...typography.captionSmall,
    color: colors.gray600,
    textAlign: 'center',
  },
  filterOptionTextActive: {
    color: colors.white,
  },
  dateRangeOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.s,
  },
  dateRangeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.s,
  },
  dateRangeOption: {
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    borderRadius: spacing.s,
    backgroundColor: colors.gray100,
    borderWidth: 1,
    borderColor: colors.gray200,
  },
  dateRangeOptionActive: {
    backgroundColor: colors.brandTeal,
    borderColor: colors.brandTeal,
  },
  dateRangeText: {
    ...typography.caption,
    color: colors.gray600,
  },
  dateRangeTextActive: {
    color: colors.white,
  },
  groupOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.s,
  },
  groupOption: {
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    borderRadius: spacing.s,
    backgroundColor: colors.gray100,
    borderWidth: 1,
    borderColor: colors.gray200,
  },
  groupOptionActive: {
    backgroundColor: colors.brandTeal,
    borderColor: colors.brandTeal,
  },
  groupOptionText: {
    ...typography.caption,
    color: colors.gray600,
  },
  groupOptionTextActive: {
    color: colors.white,
  },
  formatOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.m,
  },
  formatOption: {
    flex: 1,
    alignItems: 'center',
    padding: spacing.m,
    borderRadius: spacing.m,
    backgroundColor: colors.gray100,
    borderWidth: 2,
    borderColor: colors.gray200,
  },
  formatOptionActive: {
    backgroundColor: colors.brandTeal + '20',
    borderColor: colors.brandTeal,
  },
  formatOptionIcon: {
    fontSize: 28,
    marginBottom: spacing.s,
  },
  formatOptionText: {
    ...typography.caption,
    color: colors.gray600,
    fontWeight: '500',
  },
  formatOptionTextActive: {
    color: colors.brandTeal,
    fontWeight: 'bold',
  },
  generateButton: {
    marginHorizontal: spacing.l,
    marginBottom: spacing.l,
  },
  previewCard: {
    marginHorizontal: spacing.l,
    marginBottom: spacing.l,
    padding: spacing.l,
  },
  previewTitle: {
    ...typography.h3,
    color: colors.gray900,
    marginBottom: spacing.xs,
  },
  previewSubtitle: {
    ...typography.caption,
    color: colors.gray600,
    marginBottom: spacing.l,
  },
  previewItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  previewItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  previewItemType: {
    fontSize: 20,
    marginRight: spacing.m,
  },
  previewItemContent: {
    flex: 1,
  },
  previewItemTitle: {
    ...typography.body,
    color: colors.gray900,
    fontWeight: '500',
  },
  previewItemDate: {
    ...typography.captionSmall,
    color: colors.gray600,
    marginTop: spacing.xs,
  },
  previewItemAmount: {
    ...typography.body,
    fontWeight: '600',
    fontSize: 16,
  },
  previewItemAmountPositive: {
    color: colors.success,
  },
  previewItemAmountNegative: {
    color: colors.error,
  },
  previewMore: {
    ...typography.caption,
    color: colors.gray600,
    textAlign: 'center',
    marginTop: spacing.m,
    fontStyle: 'italic',
  },
  exportButton: {
    backgroundColor: colors.brandTeal,
    marginHorizontal: spacing.l,
    paddingVertical: spacing.m,
    borderRadius: spacing.m,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.l,
    ...shadows.medium,
  },
  exportButtonDisabled: {
    backgroundColor: colors.gray400,
  },
  exportButtonIcon: {
    fontSize: 20,
    marginRight: spacing.s,
  },
  exportButtonText: {
    ...typography.button,
    color: colors.white,
    fontSize: 16,
  },
});

export default FinancialReportsScreen;
