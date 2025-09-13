import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import Card from './Card';
import { colors, typography, spacing, shadows, borderRadius } from '../../theme';

const { width } = Dimensions.get('window');

interface InsightData {
  totalSavings: number;
  monthlyGrowth: number;
  avgContribution: number;
  contributionRate: number;
  groupCount: number;
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

interface Insight {
  id: string;
  type: 'success' | 'warning' | 'info' | 'tip' | 'achievement' | 'prediction';
  title: string;
  description: string;
  icon: string;
  priority: 'high' | 'medium' | 'low';
  actionable: boolean;
  action?: {
    label: string;
    onPress: () => void;
  };
  metadata?: {
    value?: number;
    trend?: 'up' | 'down' | 'stable';
    timeframe?: string;
    confidence?: number;
  };
}

interface FinancialInsightsProps {
  data: InsightData;
  onInsightAction?: (insight: Insight) => void;
}

const FinancialInsights: React.FC<FinancialInsightsProps> = ({ 
  data, 
  onInsightAction 
}) => {
  
  const generateInsights = (analyticsData: InsightData): Insight[] => {
    const insights: Insight[] = [];
    
    // Growth Analysis
    if (analyticsData.monthlyGrowth > 15) {
      insights.push({
        id: 'excellent_growth',
        type: 'achievement',
        title: '🚀 Excellent Growth!',
        description: `Your savings grew by ${analyticsData.monthlyGrowth}% this month! You're on track to exceed your annual goals.`,
        icon: '📈',
        priority: 'high',
        actionable: false,
        metadata: {
          value: analyticsData.monthlyGrowth,
          trend: 'up',
          timeframe: 'monthly',
          confidence: 95
        }
      });
    } else if (analyticsData.monthlyGrowth < 0) {
      insights.push({
        id: 'negative_growth',
        type: 'warning',
        title: '⚠️ Savings Decline',
        description: `Your savings decreased by ${Math.abs(analyticsData.monthlyGrowth)}% this month. Consider reviewing your expenses and increasing contributions.`,
        icon: '📉',
        priority: 'high',
        actionable: true,
        action: {
          label: 'Review Strategy',
          onPress: () => onInsightAction?.({} as Insight)
        },
        metadata: {
          value: analyticsData.monthlyGrowth,
          trend: 'down',
          timeframe: 'monthly',
          confidence: 88
        }
      });
    }

    // Contribution Rate Analysis
    if (analyticsData.contributionRate < 60) {
      insights.push({
        id: 'low_contribution_rate',
        type: 'warning',
        title: '⏰ Consistency Opportunity',
        description: `Your contribution rate is ${analyticsData.contributionRate}%. Consistent contributions compound better over time.`,
        icon: '🎯',
        priority: 'medium',
        actionable: true,
        action: {
          label: 'Set Reminders',
          onPress: () => onInsightAction?.({} as Insight)
        },
        metadata: {
          value: analyticsData.contributionRate,
          trend: analyticsData.contributionRate > 50 ? 'stable' : 'down',
          confidence: 92
        }
      });
    }

    // Group Performance Analysis
    const bestGroup = analyticsData.groupPerformance.reduce((best, current) => 
      (current?.percentage || 0) > (best?.percentage || 0) ? current : best
    );
    const worstGroup = analyticsData.groupPerformance.reduce((worst, current) => 
      (current?.percentage || 0) < (worst?.percentage || 0) ? current : worst
    );

    if (bestGroup && bestGroup.percentage > 80) {
      insights.push({
        id: 'star_performer',
        type: 'success',
        title: '⭐ Star Performer',
        description: `"${bestGroup.name}" is your top-performing group at ${bestGroup.percentage}%. Consider increasing contributions here.`,
        icon: '🏆',
        priority: 'medium',
        actionable: true,
        action: {
          label: 'Boost Investment',
          onPress: () => onInsightAction?.({} as Insight)
        },
        metadata: {
          value: bestGroup.percentage,
          trend: 'up',
          confidence: 85
        }
      });
    }

    if (worstGroup && worstGroup.percentage < 40) {
      insights.push({
        id: 'underperforming_group',
        type: 'info',
        title: '💡 Improvement Potential',
        description: `"${worstGroup.name}" could use attention. It's at ${worstGroup.percentage}% of target. Small increases can make a big difference.`,
        icon: '🔧',
        priority: 'low',
        actionable: true,
        action: {
          label: 'Review Group',
          onPress: () => onInsightAction?.({} as Insight)
        },
        metadata: {
          value: worstGroup.percentage,
          trend: 'down',
          confidence: 78
        }
      });
    }

    // Savings Milestone Predictions
    const avgMonthlySavings = analyticsData.monthlyData.length > 0 
      ? analyticsData.monthlyData.reduce((sum, month) => sum + month.contributions, 0) / analyticsData.monthlyData.length
      : 0;

    if (avgMonthlySavings > 0) {
      const monthsToNextMilestone = Math.ceil((100000 - analyticsData.totalSavings) / avgMonthlySavings);
      if (monthsToNextMilestone <= 12 && monthsToNextMilestone > 0) {
        insights.push({
          id: 'milestone_prediction',
          type: 'prediction',
          title: '🔮 Milestone Forecast',
          description: `At your current pace, you'll reach ₹1 lakh in approximately ${monthsToNextMilestone} months!`,
          icon: '🎯',
          priority: 'medium',
          actionable: false,
          metadata: {
            value: monthsToNextMilestone,
            timeframe: `${monthsToNextMilestone} months`,
            confidence: 75
          }
        });
      }
    }

    // Diversification Analysis
    if (analyticsData.groupCount === 1) {
      insights.push({
        id: 'diversification_tip',
        type: 'tip',
        title: '🌱 Diversification Tip',
        description: 'Consider joining additional savings groups to spread risk and potentially increase returns.',
        icon: '🌐',
        priority: 'low',
        actionable: true,
        action: {
          label: 'Explore Groups',
          onPress: () => onInsightAction?.({} as Insight)
        },
        metadata: {
          value: analyticsData.groupCount,
          confidence: 70
        }
      });
    }

    // Seasonal Analysis
    const currentMonth = new Date().getMonth();
    const isEndOfYear = currentMonth >= 10; // November/December
    if (isEndOfYear && analyticsData.monthlyGrowth > 0) {
      insights.push({
        id: 'year_end_strategy',
        type: 'tip',
        title: '📅 Year-End Strategy',
        description: 'Strong finish to the year! Consider maximizing contributions in December for tax benefits.',
        icon: '💼',
        priority: 'medium',
        actionable: true,
        action: {
          label: 'Plan Contributions',
          onPress: () => onInsightAction?.({} as Insight)
        },
        metadata: {
          timeframe: 'year-end',
          confidence: 82
        }
      });
    }

    // Consistency Rewards
    const recentMonths = analyticsData.monthlyData.slice(-3);
    const hasConsistentGrowth = recentMonths.every((month, index) => 
      index === 0 || month.contributions > recentMonths[index - 1].contributions
    );

    if (hasConsistentGrowth && recentMonths.length >= 3) {
      insights.push({
        id: 'consistency_achievement',
        type: 'achievement',
        title: '🎉 Consistency Champion',
        description: 'You\'ve increased your contributions for 3 consecutive months! Consistency is key to long-term wealth building.',
        icon: '⚡',
        priority: 'high',
        actionable: false,
        metadata: {
          trend: 'up',
          timeframe: '3 months',
          confidence: 95
        }
      });
    }

    // Smart Insights based on patterns
    if (analyticsData.totalSavings > 50000 && analyticsData.monthlyGrowth > 5) {
      insights.push({
        id: 'investment_readiness',
        type: 'info',
        title: '💎 Investment Ready',
        description: 'Your savings discipline is excellent! You might be ready to explore higher-yield investment options.',
        icon: '📊',
        priority: 'medium',
        actionable: true,
        action: {
          label: 'Learn More',
          onPress: () => onInsightAction?.({} as Insight)
        },
        metadata: {
          value: analyticsData.totalSavings,
          trend: 'up',
          confidence: 80
        }
      });
    }

    // Sort insights by priority and relevance
    return insights.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      const confidenceA = a.metadata?.confidence || 50;
      const confidenceB = b.metadata?.confidence || 50;
      
      return (priorityOrder[b.priority] - priorityOrder[a.priority]) || (confidenceB - confidenceA);
    });
  };

  const getInsightStyle = (type: Insight['type']) => {
    switch (type) {
      case 'warning':
        return { backgroundColor: colors.warningLight, borderColor: colors.warning };
      case 'success':
        return { backgroundColor: colors.successLight, borderColor: colors.success };
      case 'prediction':
        return { backgroundColor: '#9C88FF15', borderColor: '#9C88FF' };
      case 'tip':
        return { backgroundColor: colors.gray600 + '15', borderColor: colors.gray600 };
      default:
        return { backgroundColor: colors.gray100, borderColor: colors.gray200 };
    }
  };

  const getConfidenceLabel = (confidence?: number) => {
    if (!confidence) return '';
    if (confidence >= 90) return 'High confidence';
    if (confidence >= 75) return 'Medium confidence';
    return 'Low confidence';
  };

  const insights = generateInsights(data);

  if (insights.length === 0) {
    return (
      <Card variant="elevated" style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🔍</Text>
          <Text style={styles.emptyTitle}>Gathering Insights</Text>
          <Text style={styles.emptyDescription}>
            Keep contributing to your savings groups to unlock personalized financial insights!
          </Text>
        </View>
      </Card>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>💡 Smart Insights</Text>
        <Text style={styles.subtitle}>
          AI-powered recommendations based on your savings patterns
        </Text>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.insightsList}
      >
        {insights.map((insight) => {
          const insightStyle = getInsightStyle(insight.type);
          
          return (
            <Card 
              variant="elevated" 
              style={StyleSheet.flatten([styles.insightCard, insightStyle])}
              key={insight.id}
            >
              <View style={styles.insightHeader}>
                <View style={styles.insightHeaderLeft}>
                  <Text style={styles.insightIcon}>{insight.icon}</Text>
                  <View style={styles.insightTitleContainer}>
                    <Text style={styles.insightTitle}>{insight.title}</Text>
                    {insight.metadata?.confidence && (
                      <Text style={styles.confidenceLabel}>
                        {getConfidenceLabel(insight.metadata.confidence)}
                      </Text>
                    )}
                  </View>
                </View>
                <View style={styles.priorityBadge}>
                  <Text style={[
                    styles.priorityText,
                    { color: insightStyle.borderColor }
                  ]}>
                    {insight.priority.toUpperCase()}
                  </Text>
                </View>
              </View>

              <Text style={styles.insightDescription}>{insight.description}</Text>

              {insight.metadata && (
                <View style={styles.metadataContainer}>
                  {insight.metadata.value !== undefined && (
                    <View style={styles.metadataItem}>
                      <Text style={styles.metadataLabel}>Value:</Text>
                      <Text style={styles.metadataValue}>
                        {typeof insight.metadata.value === 'number' 
                          ? insight.metadata.value.toFixed(1) 
                          : insight.metadata.value}
                        {insight.type === 'prediction' ? ' months' : insight.metadata.trend ? '%' : ''}
                      </Text>
                    </View>
                  )}
                  {insight.metadata.trend && (
                    <View style={styles.metadataItem}>
                      <Text style={styles.metadataLabel}>Trend:</Text>
                      <Text style={[
                        styles.trendIndicator,
                        { 
                          color: insight.metadata.trend === 'up' ? colors.success : 
                                 insight.metadata.trend === 'down' ? colors.error : colors.gray600
                        }
                      ]}>
                        {insight.metadata.trend === 'up' ? '↗️ Rising' : 
                         insight.metadata.trend === 'down' ? '↘️ Falling' : '➡️ Stable'}
                      </Text>
                    </View>
                  )}
                  {insight.metadata.timeframe && (
                    <View style={styles.metadataItem}>
                      <Text style={styles.metadataLabel}>Timeframe:</Text>
                      <Text style={styles.metadataValue}>{insight.metadata.timeframe}</Text>
                    </View>
                  )}
                </View>
              )}

              {insight.actionable && insight.action && (
                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    { borderColor: insightStyle.borderColor }
                  ]}
                  onPress={insight.action.onPress}
                  activeOpacity={0.8}
                >
                  <Text style={[
                    styles.actionButtonText,
                    { color: insightStyle.borderColor }
                  ]}>
                    {insight.action.label}
                  </Text>
                  <Text style={[
                    styles.actionArrow,
                    { color: insightStyle.borderColor }
                  ]}>
                    →
                  </Text>
                </TouchableOpacity>
              )}
            </Card>
          );
        })}
      </ScrollView>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          💡 Insights update automatically based on your savings activity
        </Text>
      </View>
    </View>
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
    paddingBottom: spacing.m,
    backgroundColor: colors.white,
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
    lineHeight: 20,
  },
  insightsList: {
    paddingHorizontal: spacing.l,
    paddingBottom: spacing.xl,
  },
  insightCard: {
    backgroundColor: colors.white,
    borderRadius: spacing.m,
    padding: spacing.l,
    marginBottom: spacing.m,
    borderLeftWidth: 4,
    ...shadows.small,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: spacing.m,
  },
  insightHeaderLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  insightIcon: {
    fontSize: 24,
    marginRight: spacing.m,
  },
  insightTitleContainer: {
    flex: 1,
  },
  insightTitle: {
    ...typography.body,
    color: colors.gray900,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  confidenceLabel: {
    ...typography.captionSmall,
    color: colors.gray600,
    fontStyle: 'italic',
  },
  priorityBadge: {
    paddingHorizontal: spacing.s,
    paddingVertical: spacing.xs,
    borderRadius: spacing.s,
    alignSelf: 'flex-start',
  },
  priorityText: {
    ...typography.captionSmall,
    fontWeight: '600',
  },
  insightDescription: {
    ...typography.body,
    color: colors.gray600,
    lineHeight: 22,
    marginBottom: spacing.m,
  },
  metadataContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.s,
    marginTop: spacing.s,
  },
  metadataItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray50,
    paddingHorizontal: spacing.s,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.s,
  },
  metadataLabel: {
    ...typography.captionSmall,
    color: colors.gray600,
    marginRight: spacing.xs,
  },
  metadataValue: {
    ...typography.captionSmall,
    color: colors.gray900,
    fontWeight: '600',
  },
  trendIndicator: {
    ...typography.captionSmall,
    fontWeight: '600',
  },
  actionButton: {
    backgroundColor: colors.brandTeal,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    borderRadius: spacing.s,
    alignSelf: 'flex-start',
    marginTop: spacing.s,
  },
  actionButtonText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: '600',
  },
  actionArrow: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: spacing.xs,
  },
  footer: {
    padding: spacing.l,
    alignItems: 'center',
  },
  footerText: {
    ...typography.caption,
    color: colors.gray600,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: spacing.m,
  },
  emptyTitle: {
    ...typography.h3,
    color: colors.gray900,
    marginBottom: spacing.s,
  },
  emptyDescription: {
    ...typography.body,
    color: colors.gray600,
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default FinancialInsights;
