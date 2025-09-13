import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Animated,
  ScrollView,
} from 'react-native';
import { colors, typography, spacing, shadows } from '../../theme';

const { width: screenWidth } = Dimensions.get('window');

interface ChartDataPoint {
  x: number | string;
  y: number;
  label?: string;
  date?: Date;
  metadata?: any;
}

interface InteractiveLineChartProps {
  data: ChartDataPoint[];
  width?: number;
  height?: number;
  title?: string;
  subtitle?: string;
  color?: string;
  showDots?: boolean;
  animated?: boolean;
  onDataPointPress?: (dataPoint: ChartDataPoint, index: number) => void;
  formatValue?: (value: number) => string;
  formatLabel?: (label: string | number) => string;
}

const InteractiveLineChart: React.FC<InteractiveLineChartProps> = ({
  data,
  width = screenWidth - 40,
  height = 200,
  title,
  subtitle,
  color = colors.brandTeal,
  showDots = true,
  animated = true,
  onDataPointPress,
  formatValue = (value) => `₹${value.toLocaleString()}`,
  formatLabel = (label) => String(label),
}) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [animatedValues, setAnimatedValues] = useState<Animated.Value[]>([]);
  const chartWidth = width - 40;
  const chartHeight = height - 80;

  useEffect(() => {
    if (animated && data.length > 0) {
      const values = data.map(() => new Animated.Value(0));
      setAnimatedValues(values);

      // Animate each point with a staggered delay
      const animations = values.map((value, index) =>
        Animated.timing(value, {
          toValue: 1,
          duration: 800,
          delay: index * 100,
          useNativeDriver: false,
        })
      );

      Animated.parallel(animations).start();
    }
  }, [data, animated]);

  if (!data || data.length === 0) {
    return (
      <View style={[styles.chartContainer, { width, height }]}>
        <Text style={styles.noDataText}>No data available</Text>
      </View>
    );
  }

  const maxValue = Math.max(...data.map(d => d.y));
  const minValue = Math.min(...data.map(d => d.y));
  const range = maxValue - minValue || 1;

  const getPointPosition = (dataPoint: ChartDataPoint, index: number) => {
    const x = (index / Math.max(data.length - 1, 1)) * chartWidth;
    const y = chartHeight - ((dataPoint.y - minValue) / range) * chartHeight;
    return { x, y };
  };

  const pathData = data.map((point, index) => {
    const position = getPointPosition(point, index);
    return `${index === 0 ? 'M' : 'L'} ${position.x} ${position.y}`;
  }).join(' ');

  const handleDataPointPress = (dataPoint: ChartDataPoint, index: number) => {
    setSelectedIndex(index);
    onDataPointPress?.(dataPoint, index);
  };

  return (
    <View style={[styles.chartContainer, { width, height }]}>
      {/* Title */}
      {title && (
        <View style={styles.chartTitleContainer}>
          <Text style={styles.chartTitle}>{title}</Text>
          {subtitle && <Text style={styles.chartSubtitle}>{subtitle}</Text>}
        </View>
      )}

      {/* Chart Area */}
      <View style={[styles.chartArea, { width: chartWidth, height: chartHeight }]}>
        {/* Grid Lines */}
        <View style={styles.gridContainer}>
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
            <View
              key={ratio}
              style={[
                styles.gridLine,
                { top: ratio * chartHeight, width: chartWidth }
              ]}
            />
          ))}
        </View>

        {/* Area Fill */}
        <View style={styles.areaContainer}>
          <View
            style={[
              styles.areaFill,
              {
                backgroundColor: color + '20',
                height: chartHeight,
                width: chartWidth,
              }
            ]}
          />
        </View>

        {/* Line Path */}
        <View style={styles.lineContainer}>
          <View
            style={[
              styles.linePath,
              {
                borderColor: color,
                width: chartWidth,
                height: chartHeight,
              }
            ]}
          />
        </View>

        {/* Data Points */}
        {showDots && data.map((dataPoint, index) => {
          const position = getPointPosition(dataPoint, index);
          const isSelected = selectedIndex === index;
          const animatedValue = animatedValues[index];

          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.dataPoint,
                {
                  left: position.x - 6,
                  top: position.y - 6,
                  backgroundColor: isSelected ? colors.white : color,
                  borderColor: color,
                  borderWidth: isSelected ? 3 : 2,
                  transform: animated && animatedValue ? [
                    {
                      scale: animatedValue.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, isSelected ? 1.5 : 1],
                      })
                    }
                  ] : [{ scale: isSelected ? 1.5 : 1 }]
                }
              ]}
              onPress={() => handleDataPointPress(dataPoint, index)}
              activeOpacity={0.7}
            />
          );
        })}

        {/* Value Labels */}
        {selectedIndex !== null && (
          <View
            style={[
              styles.valueLabel,
              {
                left: Math.max(0, Math.min(
                  chartWidth - 100,
                  getPointPosition(data[selectedIndex], selectedIndex).x - 50
                )),
                top: Math.max(0, getPointPosition(data[selectedIndex], selectedIndex).y - 40),
              }
            ]}
          >
            <Text style={styles.valueLabelText}>
              {formatValue(data[selectedIndex].y)}
            </Text>
            {data[selectedIndex].label && (
              <Text style={styles.valueLabelSubtext}>
                {formatLabel(data[selectedIndex].label!)}
              </Text>
            )}
          </View>
        )}
      </View>

      {/* X-Axis Labels */}
      <View style={[styles.xAxisContainer, { width: chartWidth }]}>
        {data.map((dataPoint, index) => {
          if (data.length > 6 && index % Math.ceil(data.length / 4) !== 0) return null;
          const position = getPointPosition(dataPoint, index);
          return (
            <Text
              key={index}
              style={[
                styles.xAxisLabel,
                { left: position.x - 20, width: 40 }
              ]}
            >
              {formatLabel(dataPoint.x)}
            </Text>
          );
        })}
      </View>

      {/* Y-Axis Labels */}
      <View style={[styles.yAxisContainer, { height: chartHeight }]}>
        {[maxValue, (maxValue + minValue) / 2, minValue].map((value, index) => (
          <Text
            key={index}
            style={[
              styles.yAxisLabel,
              { top: (index / 2) * chartHeight - 10 }
            ]}
          >
            {formatValue(value)}
          </Text>
        ))}
      </View>
    </View>
  );
};

interface PieChartProps {
  data: { label: string; value: number; color?: string }[];
  width?: number;
  height?: number;
  title?: string;
  showLegend?: boolean;
  animated?: boolean;
}

const PieChart: React.FC<PieChartProps> = ({
  data,
  width = 200,
  height = 200,
  title,
  showLegend = true,
  animated = true,
}) => {
  const [animatedValue] = useState(new Animated.Value(0));
  const radius = Math.min(width, height) / 2 - 20;
  const total = data.reduce((sum, item) => sum + item.value, 0);

  useEffect(() => {
    if (animated) {
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: false,
      }).start();
    }
  }, [animated, animatedValue]);

  const defaultColors = [
    colors.brandTeal,
    colors.success,
    colors.warning,
    colors.error,
    colors.info,
    '#9C88FF',
    '#FF8A65',
    '#4DD0E1',
  ];

  let currentAngle = 0;
  const segments = data.map((item, index) => {
    const percentage = (item.value / total) * 100;
    const angle = (item.value / total) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    currentAngle = endAngle;

    return {
      ...item,
      percentage,
      startAngle,
      endAngle,
      color: item.color || defaultColors[index % defaultColors.length],
    };
  });

  return (
    <View style={[styles.pieChartContainer, { width, height: height + (showLegend ? 100 : 0) }]}>
      {title && <Text style={styles.chartTitle}>{title}</Text>}
      
      <View style={[styles.pieChart, { width, height }]}>
        <View style={styles.pieChartInner}>
          {/* Center Circle */}
          <View style={[styles.pieChartCenter, { width: radius, height: radius, borderRadius: radius / 2 }]}>
            <Text style={styles.pieChartCenterText}>Total</Text>
            <Text style={styles.pieChartCenterValue}>₹{total.toLocaleString()}</Text>
          </View>
        </View>
      </View>

      {showLegend && (
        <View style={styles.pieLegend}>
          {segments.map((segment, index) => (
            <View key={index} style={styles.pieLegendItem}>
              <View style={[styles.pieLegendColor, { backgroundColor: segment.color }]} />
              <Text style={styles.pieLegendLabel}>{segment.label}</Text>
              <Text style={styles.pieLegendValue}>{segment.percentage.toFixed(1)}%</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

interface BarChartProps {
  data: ChartDataPoint[];
  width?: number;
  height?: number;
  title?: string;
  color?: string;
  horizontal?: boolean;
  animated?: boolean;
  onBarPress?: (dataPoint: ChartDataPoint, index: number) => void;
}

const BarChart: React.FC<BarChartProps> = ({
  data,
  width = screenWidth - 40,
  height = 200,
  title,
  color = colors.brandTeal,
  horizontal = false,
  animated = true,
  onBarPress,
}) => {
  const [animatedValues, setAnimatedValues] = useState<Animated.Value[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  useEffect(() => {
    if (animated && data.length > 0) {
      const values = data.map(() => new Animated.Value(0));
      setAnimatedValues(values);

      const animations = values.map((value, index) =>
        Animated.timing(value, {
          toValue: 1,
          duration: 600,
          delay: index * 100,
          useNativeDriver: false,
        })
      );

      Animated.parallel(animations).start();
    }
  }, [data, animated]);

  if (!data || data.length === 0) {
    return (
      <View style={[styles.chartContainer, { width, height }]}>
        <Text style={styles.noDataText}>No data available</Text>
      </View>
    );
  }

  const maxValue = Math.max(...data.map(d => d.y));
  const chartWidth = width - 80;
  const chartHeight = height - 80;
  const barWidth = horizontal ? chartHeight / data.length - 10 : chartWidth / data.length - 10;

  return (
    <View style={[styles.chartContainer, { width, height }]}>
      {title && <Text style={styles.chartTitle}>{title}</Text>}
      
      <View style={styles.barChartContainer}>
        {data.map((dataPoint, index) => {
          const barHeight = horizontal ? barWidth : (dataPoint.y / maxValue) * chartHeight;
          const barLength = horizontal ? (dataPoint.y / maxValue) * chartWidth : barWidth;
          const isSelected = selectedIndex === index;
          const animatedValue = animatedValues[index];

          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.barContainer,
                horizontal ? styles.barContainerHorizontal : styles.barContainerVertical,
                {
                  width: horizontal ? chartWidth + 40 : barWidth + 10,
                  height: horizontal ? barHeight + 10 : chartHeight + 20,
                }
              ]}
              onPress={() => {
                setSelectedIndex(index);
                onBarPress?.(dataPoint, index);
              }}
              activeOpacity={0.8}
            >
              <Animated.View
                style={[
                  styles.bar,
                  {
                    width: horizontal ? (animated && animatedValue ? 
                      animatedValue.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, barLength],
                      }) : barLength
                    ) : barWidth,
                    height: horizontal ? barHeight : (animated && animatedValue ?
                      animatedValue.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, barHeight],
                      }) : barHeight
                    ),
                    backgroundColor: isSelected ? colors.brandTeal : color,
                    opacity: isSelected ? 1 : 0.8,
                  }
                ]}
              />
              
              <Text style={[
                styles.barLabel,
                horizontal ? styles.barLabelHorizontal : styles.barLabelVertical
              ]}>
                {String(dataPoint.x)}
              </Text>
              
              {isSelected && (
                <View style={[
                  styles.barValue,
                  horizontal ? styles.barValueHorizontal : styles.barValueVertical
                ]}>
                  <Text style={styles.barValueText}>₹{dataPoint.y.toLocaleString()}</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  chartContainer: {
    backgroundColor: colors.white,
    borderRadius: spacing.m,
    padding: spacing.m,
    ...shadows.medium,
    marginBottom: spacing.m,
  },
  chartTitleContainer: {
    marginBottom: spacing.m,
  },
  chartTitle: {
    ...typography.h3,
    color: colors.gray900,
    marginBottom: spacing.xs,
  },
  chartSubtitle: {
    ...typography.caption,
    color: colors.gray600,
  },
  noDataText: {
    ...typography.body,
    color: colors.gray600,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
  
  // Line Chart Styles
  chartArea: {
    position: 'relative',
    marginVertical: spacing.m,
  },
  gridContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  gridLine: {
    position: 'absolute',
    height: 1,
    backgroundColor: colors.gray200,
    opacity: 0.3,
  },
  areaContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  areaFill: {
    opacity: 0.1,
  },
  lineContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  linePath: {
    borderTopWidth: 2,
    opacity: 0.9,
  },
  dataPoint: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    zIndex: 10,
  },
  valueLabel: {
    position: 'absolute',
    backgroundColor: colors.gray900,
    paddingHorizontal: spacing.s,
    paddingVertical: spacing.xs,
    borderRadius: spacing.xs,
    width: 100,
    alignItems: 'center',
    zIndex: 15,
    ...shadows.small,
  },
  valueLabelText: {
    ...typography.captionSmall,
    color: colors.white,
    fontWeight: '600',
  },
  valueLabelSubtext: {
    ...typography.captionSmall,
    color: colors.white,
    opacity: 0.8,
  },
  xAxisContainer: {
    position: 'relative',
    height: 30,
    marginTop: spacing.s,
  },
  xAxisLabel: {
    position: 'absolute',
    ...typography.captionSmall,
    color: colors.gray600,
    textAlign: 'center',
  },
  yAxisContainer: {
    position: 'absolute',
    left: -35,
    top: 20,
    width: 30,
  },
  yAxisLabel: {
    position: 'absolute',
    ...typography.captionSmall,
    color: colors.gray600,
    textAlign: 'right',
    width: 30,
    height: 20,
  },
  
  // Pie Chart Styles
  pieChartContainer: {
    alignItems: 'center',
    padding: spacing.m,
  },
  pieChart: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pieChartInner: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pieChartCenter: {
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.small,
  },
  pieChartCenterText: {
    ...typography.captionSmall,
    color: colors.gray600,
  },
  pieChartCenterValue: {
    ...typography.body,
    color: colors.gray900,
    fontWeight: '600',
  },
  pieLegend: {
    marginTop: spacing.m,
    width: '100%',
  },
  pieLegendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  pieLegendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: spacing.s,
  },
  pieLegendLabel: {
    ...typography.caption,
    color: colors.gray900,
    flex: 1,
  },
  pieLegendValue: {
    ...typography.caption,
    color: colors.gray600,
    fontWeight: '600',
  },
  
  // Bar Chart Styles
  barChartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    padding: spacing.m,
  },
  barContainer: {
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  barContainerHorizontal: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  barContainerVertical: {
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  bar: {
    borderRadius: spacing.xs,
    minHeight: 4,
    minWidth: 4,
  },
  barLabel: {
    ...typography.captionSmall,
    color: colors.gray600,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  barLabelHorizontal: {
    marginTop: 0,
    marginLeft: spacing.xs,
  },
  barLabelVertical: {
    marginTop: spacing.xs,
  },
  barValue: {
    position: 'absolute',
    backgroundColor: colors.gray900,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: spacing.xs,
    ...shadows.small,
  },
  barValueHorizontal: {
    right: -40,
  },
  barValueVertical: {
    top: -25,
  },
  barValueText: {
    ...typography.captionSmall,
    color: colors.white,
    fontWeight: '600',
  },
});

export { InteractiveLineChart, PieChart, BarChart };
export default InteractiveLineChart;
