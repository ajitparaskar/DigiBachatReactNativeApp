import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Dimensions } from 'react-native';
import Container from '../components/ui/Container';
import Card from '../components/ui/Card';
import { colors, typography, spacing, shadows } from '../theme';

const { width } = Dimensions.get('window');

const AnalyticsScreen: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month');
  const [savingsData] = useState({
    totalSavings: 125000,
    monthlyGrowth: 12.5,
    groupCount: 3,
    avgContribution: 8500
  });

  const periods = [
    { key: 'week', label: 'Week' },
    { key: 'month', label: 'Month' },
    { key: 'year', label: 'Year' }
  ];

  const chartData = [
    { month: 'Jan', amount: 15000 },
    { month: 'Feb', amount: 22000 },
    { month: 'Mar', amount: 18000 },
    { month: 'Apr', amount: 25000 },
    { month: 'May', amount: 30000 },
    { month: 'Jun', amount: 35000 }
  ];

  const maxAmount = Math.max(...chartData.map(d => d.amount));

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor={colors.backgroundSecondary} />
      <Container style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.title}>Analytics Dashboard</Text>
            <Text style={styles.subtitle}>Track your savings performance and insights</Text>
          </View>

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

          <View style={styles.statsGrid}>
            <Card variant="elevated" style={styles.statCard}>
              <View style={styles.statHeader}>
                <Text style={styles.statIcon}>💰</Text>
                <Text style={styles.statLabel}>Total Savings</Text>
              </View>
              <Text style={styles.statValue}>₹ {savingsData.totalSavings.toLocaleString()}</Text>
              <Text style={styles.statTrend}>↗️ +{savingsData.monthlyGrowth}% this month</Text>
            </Card>

            <Card variant="elevated" style={styles.statCard}>
              <View style={styles.statHeader}>
                <Text style={styles.statIcon}>👥</Text>
                <Text style={styles.statLabel}>Active Groups</Text>
              </View>
              <Text style={styles.statValue}>{savingsData.groupCount}</Text>
              <Text style={styles.statTrend}>All groups active</Text>
            </Card>

            <Card variant="elevated" style={styles.statCard}>
              <View style={styles.statHeader}>
                <Text style={styles.statIcon}>📊</Text>
                <Text style={styles.statLabel}>Avg Contribution</Text>
              </View>
              <Text style={styles.statValue}>₹ {savingsData.avgContribution.toLocaleString()}</Text>
              <Text style={styles.statTrend}>Per month</Text>
            </Card>
          </View>

          <Card variant="elevated" style={styles.chartCard}>
            <View style={styles.chartHeader}>
              <Text style={styles.chartTitle}>Savings Trend</Text>
              <Text style={styles.chartSubtitle}>Monthly contributions over time</Text>
            </View>
            
            <View style={styles.chart}>
              <View style={styles.chartBars}>
                {chartData.map((item, index) => {
                  const height = (item.amount / maxAmount) * 120;
                  return (
                    <View key={index} style={styles.barContainer}>
                      <View style={[styles.bar, { height }]} />
                      <Text style={styles.barLabel}>{item.month}</Text>
                      <Text style={styles.barValue}>₹{(item.amount / 1000).toFixed(0)}k</Text>
                    </View>
                  );
                })}
              </View>
            </View>
          </Card>

          <Card variant="elevated" style={styles.insightsCard}>
            <View style={styles.insightsHeader}>
              <Text style={styles.insightsTitle}>💡 Insights</Text>
            </View>
            <View style={styles.insightsList}>
              <View style={styles.insightItem}>
                <Text style={styles.insightIcon}>🎯</Text>
                <View style={styles.insightContent}>
                  <Text style={styles.insightText}>You're on track to reach your yearly goal</Text>
                  <Text style={styles.insightSubtext}>85% completed</Text>
                </View>
              </View>
              <View style={styles.insightItem}>
                <Text style={styles.insightIcon}>📈</Text>
                <View style={styles.insightContent}>
                  <Text style={styles.insightText}>Your savings rate increased by 12% this month</Text>
                  <Text style={styles.insightSubtext}>Great progress!</Text>
                </View>
              </View>
              <View style={styles.insightItem}>
                <Text style={styles.insightIcon}>⏰</Text>
                <View style={styles.insightContent}>
                  <Text style={styles.insightText}>Next contribution due in 5 days</Text>
                  <Text style={styles.insightSubtext}>Family Savings Group</Text>
                </View>
              </View>
            </View>
          </Card>
        </ScrollView>
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
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: spacing.m,
    padding: spacing.xs,
    marginBottom: spacing.l,
    ...shadows.small,
  },
  periodButton: {
    flex: 1,
    paddingVertical: spacing.s,
    alignItems: 'center',
    borderRadius: spacing.s,
  },
  periodActive: {
    backgroundColor: colors.brandTeal,
  },
  periodText: {
    ...typography.label,
    color: colors.gray600,
  },
  periodTextActive: {
    color: colors.white,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.m,
    marginBottom: spacing.l,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    marginBottom: 0,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.m,
  },
  statIcon: {
    fontSize: 24,
    marginRight: spacing.s,
  },
  statLabel: {
    ...typography.caption,
    color: colors.gray500,
  },
  statValue: {
    ...typography.h3,
    color: colors.gray900,
    marginBottom: spacing.xs,
  },
  statTrend: {
    ...typography.caption,
    color: colors.success,
  },
  chartCard: {
    marginBottom: spacing.l,
  },
  chartHeader: {
    marginBottom: spacing.l,
  },
  chartTitle: {
    ...typography.h3,
    marginBottom: spacing.xs,
  },
  chartSubtitle: {
    ...typography.caption,
    color: colors.gray500,
  },
  chart: {
    height: 180,
    justifyContent: 'flex-end',
  },
  chartBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 120,
  },
  barContainer: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: spacing.xs,
  },
  bar: {
    width: '80%',
    backgroundColor: colors.brandTeal,
    borderRadius: spacing.xs,
    marginBottom: spacing.s,
  },
  barLabel: {
    ...typography.captionSmall,
    color: colors.gray500,
    marginBottom: spacing.xs,
  },
  barValue: {
    ...typography.captionSmall,
    color: colors.gray700,
    fontWeight: '600',
  },
  insightsCard: {
    marginBottom: spacing.xl,
  },
  insightsHeader: {
    marginBottom: spacing.l,
  },
  insightsTitle: {
    ...typography.h3,
  },
  insightsList: {
    gap: spacing.m,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  insightIcon: {
    fontSize: 20,
    marginRight: spacing.m,
    marginTop: spacing.xs,
  },
  insightContent: {
    flex: 1,
  },
  insightText: {
    ...typography.body,
    color: colors.gray700,
    marginBottom: spacing.xs,
  },
  insightSubtext: {
    ...typography.caption,
    color: colors.gray500,
  },
});

export default AnalyticsScreen;



