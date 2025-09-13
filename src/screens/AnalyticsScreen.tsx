import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Dimensions, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Container from '../components/ui/Container';
import Card from '../components/ui/Card';
import { colors, typography, spacing, shadows } from '../theme';

const { width } = Dimensions.get('window');

interface AnalyticsData {
  totalSavings: number;
  monthlyGrowth: number;
  groupCount: number;
  avgContribution: number;
  contributionRate: number;
  monthlyData: Array<{
    month: string;
    savings: number;
    contributions: number;
    withdrawals: number;
  }>;
  groupPerformance: Array<{
    name: string;
    contribution: number;
    target: number;
    percentage: number;
  }>;
}

const AnalyticsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [selectedPeriod, setSelectedPeriod] = useState<'3months' | '6months' | '1year'>('6months');
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    totalSavings: 0,
    monthlyGrowth: 0,
    groupCount: 0,
    avgContribution: 0,
    contributionRate: 0,
    monthlyData: [],
    groupPerformance: []
  });

  const periods = [
    { key: '3months', label: '3 Months' },
    { key: '6months', label: '6 Months' },
    { key: '1year', label: '1 Year' }
  ];

  // Dummy data generator
  const generateDummyData = (period: string): AnalyticsData => {
    const monthCount = period === '3months' ? 3 : period === '6months' ? 6 : 12;
    const monthlyData = [];
    
    for (let i = monthCount - 1; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthName = date.toLocaleDateString('en-US', { month: 'short' });
      
      monthlyData.push({
        month: monthName,
        savings: Math.floor(Math.random() * 15000) + 5000,
        contributions: Math.floor(Math.random() * 8000) + 2000,
        withdrawals: Math.floor(Math.random() * 3000) + 500,
      });
    }

    const totalSavings = monthlyData.reduce((sum, month) => sum + month.savings, 0);
    const totalContributions = monthlyData.reduce((sum, month) => sum + month.contributions, 0);

    return {
      totalSavings,
      monthlyGrowth: 12.5,
      groupCount: 4,
      avgContribution: Math.floor(totalContributions / monthCount),
      contributionRate: 95.2,
      monthlyData,
      groupPerformance: [
        { name: 'Family Savings', contribution: 25000, target: 30000, percentage: 83.3 },
        { name: 'Friends Circle', contribution: 18000, target: 20000, percentage: 90.0 },
        { name: 'Office Group', contribution: 15000, target: 25000, percentage: 60.0 },
        { name: 'Investment Club', contribution: 22000, target: 25000, percentage: 88.0 },
      ]
    };
  };

  useEffect(() => {
    loadAnalyticsData();
  }, [selectedPeriod]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      // Simulate API call delay
      await new Promise<void>((resolve) => setTimeout(resolve, 1000));
      
      // Use dummy data instead of API calls
      const dummyData = generateDummyData(selectedPeriod);
      setAnalyticsData(dummyData);
    } catch (error) {
      console.error('Error loading analytics:', error);
      // Fallback to dummy data even on error
      const dummyData = generateDummyData(selectedPeriod);
      setAnalyticsData(dummyData);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString()}`;
  };

  const renderStatsCards = () => (
    <View style={styles.statsContainer}>
      <Card style={styles.statCard}>
        <Text style={styles.statValue}>{formatCurrency(analyticsData.totalSavings)}</Text>
        <Text style={styles.statLabel}>Total Savings</Text>
        <Text style={styles.statChange}>+{analyticsData.monthlyGrowth}% this month</Text>
      </Card>
      
      <Card style={styles.statCard}>
        <Text style={styles.statValue}>{analyticsData.groupCount}</Text>
        <Text style={styles.statLabel}>Active Groups</Text>
        <Text style={styles.statChange}>All performing well</Text>
      </Card>
      
      <Card style={styles.statCard}>
        <Text style={styles.statValue}>{formatCurrency(analyticsData.avgContribution)}</Text>
        <Text style={styles.statLabel}>Avg Contribution</Text>
        <Text style={styles.statChange}>Per month</Text>
      </Card>
      
      <Card style={styles.statCard}>
        <Text style={styles.statValue}>{analyticsData.contributionRate}%</Text>
        <Text style={styles.statLabel}>Contribution Rate</Text>
        <Text style={styles.statChange}>Excellent!</Text>
      </Card>
    </View>
  );

  // Loading state
  if (loading) {
    return (
      <Container style={StyleSheet.flatten([styles.container, styles.loadingContainer])}>
        <ActivityIndicator size="large" color={colors.brandTeal} />
        <Text style={styles.loadingText}>Loading analytics...</Text>
      </Container>
    );
  }

  return (
    <Container style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Financial Analytics</Text>
          <Text style={styles.subtitle}>
            Investment performance and insights
          </Text>
        </View>

        {/* Period Selector */}
        <View style={styles.periodSelector}>
          {periods.map((period) => (
            <TouchableOpacity
              key={period.key}
              style={[styles.periodButton, selectedPeriod === period.key && styles.periodActive]}
              onPress={() => setSelectedPeriod(period.key as any)}
            >
              <Text style={[styles.periodText, selectedPeriod === period.key && styles.periodTextActive]}>
                {period.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Overview Stats */}
        {renderStatsCards()}

        {/* Monthly Breakdown Table */}
        <Card variant="elevated" style={styles.tableCard}>
          <View style={styles.tableHeader}>
            <Text style={styles.tableTitle}>Monthly Breakdown</Text>
          </View>
          
          <View style={styles.table}>
            <View style={styles.tableHeaderRow}>
              <Text style={[styles.tableCell, styles.tableCellHeader, { flex: 2 }]}>Month</Text>
              <Text style={[styles.tableCell, styles.tableCellHeader]}>Savings</Text>
              <Text style={[styles.tableCell, styles.tableCellHeader]}>Contributions</Text>
              <Text style={[styles.tableCell, styles.tableCellHeader]}>Withdrawals</Text>
            </View>
            
            {(analyticsData.monthlyData || []).map((data, index) => {
              const prevSavings = index > 0 ? (analyticsData.monthlyData[index - 1]?.savings || 0) : 0;
              const currentSavings = data?.savings || 0;
              const growthPercent = prevSavings > 0 
                ? ((currentSavings - prevSavings) / prevSavings * 100).toFixed(1) 
                : '0.0';
              
              return (
                <View key={index} style={styles.tableRow}>
                  <Text style={[styles.tableCell, { flex: 2 }]}>{data?.month || 'Unknown'}</Text>
                  <View style={styles.tableCell}>
                    <Text style={styles.tableCellAmount}>{formatCurrency(currentSavings)}</Text>
                    <Text style={styles.tableCellGrowth}>({growthPercent}%)</Text>
                  </View>
                  <Text style={[styles.tableCell, styles.tableCellPositive]}>+{formatCurrency(data?.contributions || 0)}</Text>
                  <Text style={[styles.tableCell, styles.tableCellNegative]}>
                    {(data?.withdrawals || 0) > 0 ? `- ${formatCurrency(data.withdrawals || 0)}` : '₹0'}
                  </Text>
                </View>
              );
            })}
          </View>
        </Card>

        {/* Financial Reports Button */}
        <TouchableOpacity
          style={styles.reportsButton}
          onPress={() => navigation.navigate('FinancialReports')}
        >
          <View style={styles.reportsButtonContent}>
            <Text style={styles.reportsButtonIcon}>📊</Text>
            <View style={styles.reportsButtonText}>
              <Text style={styles.reportsButtonTitle}>Generate Reports</Text>
              <Text style={styles.reportsButtonSubtitle}>Export detailed financial reports in PDF or CSV</Text>
            </View>
            <Text style={styles.reportsButtonArrow}>→</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </Container>
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
  },
  loadingText: {
    ...typography.body,
    color: colors.gray600,
    marginTop: spacing.m,
  },
  scrollContent: {
    paddingBottom: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.l,
    backgroundColor: colors.white,
    ...shadows.small,
  },
  backButton: {
    padding: spacing.s,
  },
  backButtonText: {
    fontSize: 24,
    color: colors.gray700,
  },
  headerTitle: {
    ...typography.h2,
    color: colors.gray900,
  },
  placeholder: {
    width: 40,
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
  periodSelector: {
    flexDirection: 'row',
    marginHorizontal: spacing.l,
    marginBottom: spacing.l,
    backgroundColor: colors.white,
    borderRadius: spacing.m,
    padding: spacing.xs,
    ...shadows.small,
  },
  periodButton: {
    flex: 1,
    paddingVertical: spacing.s,
    paddingHorizontal: spacing.m,
    borderRadius: spacing.s,
    alignItems: 'center',
  },
  periodActive: {
    backgroundColor: colors.brandTeal,
  },
  periodText: {
    ...typography.labelMedium,
    color: colors.gray600,
  },
  periodTextActive: {
    color: colors.white,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: spacing.l,
    marginBottom: spacing.l,
    justifyContent: 'space-between',
  },
  statCard: {
    width: Math.floor((width - spacing.l * 2 - spacing.s) / 2),
    padding: spacing.m,
    alignItems: 'center',
    marginBottom: spacing.s,
  },
  statValue: {
    ...typography.h3,
    color: colors.gray900,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  statLabel: {
    ...typography.caption,
    color: colors.gray500,
    marginBottom: spacing.xs,
  },
  statChange: {
    ...typography.caption,
    color: colors.success,
    fontWeight: '500',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.l,
    marginBottom: spacing.l,
    justifyContent: 'space-between',
  },
  primaryStatCard: {
    width: width - spacing.l * 2,
    backgroundColor: colors.brandTeal,
    marginBottom: spacing.s,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.s,
  },
  statIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statIcon: {
    fontSize: 22,
    marginRight: spacing.s,
  },
  statTrend: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendIcon: {
    fontSize: 16,
    marginRight: spacing.xs,
  },
  trendText: {
    fontSize: 12,
    color: colors.white,
    fontWeight: '600',
  },
  statValuePrimary: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: spacing.xs,
  },
  statDescription: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  statSubtext: {
    fontSize: 11,
    color: colors.gray500,
  },
  tableCard: {
    marginHorizontal: spacing.l,
    marginBottom: spacing.l,
    padding: spacing.l,
  },
  tableHeader: {
    marginBottom: spacing.m,
  },
  tableTitle: {
    ...typography.h4,
    color: colors.gray900,
  },
  table: {
    gap: spacing.s,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    paddingVertical: spacing.m,
    borderBottomWidth: 2,
    borderBottomColor: colors.gray200,
    marginBottom: spacing.s,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: spacing.m,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.gray200,
  },
  tableCell: {
    flex: 1,
    fontSize: 13,
    color: colors.gray900,
  },
  tableCellHeader: {
    fontWeight: 'bold',
    fontSize: 12,
    color: colors.gray600,
    textTransform: 'uppercase',
  },
  tableCellAmount: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.gray900,
  },
  tableCellGrowth: {
    fontSize: 10,
    marginTop: spacing.xs,
  },
  tableCellPositive: {
    color: colors.success,
    fontWeight: '500',
  },
  tableCellNegative: {
    color: colors.error,
    fontWeight: '500',
  },
  reportsButton: {
    marginHorizontal: spacing.l,
    marginTop: spacing.m,
    marginBottom: spacing.xl,
    backgroundColor: colors.brandTeal,
    borderRadius: spacing.m,
    padding: spacing.m,
    ...shadows.medium,
  },
  reportsButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reportsButtonIcon: {
    fontSize: 24,
    marginRight: spacing.s,
  },
  reportsButtonText: {
    flex: 1,
  },
  reportsButtonTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: spacing.xs,
  },
  reportsButtonSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  reportsButtonArrow: {
    fontSize: 20,
    color: colors.white,
    marginLeft: spacing.s,
  },
});

export default AnalyticsScreen;
