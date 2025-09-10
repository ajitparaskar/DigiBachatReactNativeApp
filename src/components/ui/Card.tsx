import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors, spacing, borderRadius, shadows } from '../../theme';

interface CardProps {
  children: React.ReactNode;
  variant?: 'elevated' | 'outlined' | 'filled' | 'flat' | 'minimal';
  style?: ViewStyle;
}

const Card: React.FC<CardProps> = ({ children, variant = 'elevated', style }) => {
  return (
    <View
      style={[
        styles.base,
        variant === 'elevated' && styles.elevated,
        variant === 'outlined' && styles.outlined,
        variant === 'filled' && styles.filled,
        variant === 'flat' && styles.flat,
        variant === 'minimal' && styles.minimal,
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: borderRadius.l,
    padding: spacing.m,
    backgroundColor: colors.white,
    marginBottom: spacing.m,
    overflow: 'hidden',
  },
  elevated: {
    ...shadows.medium,
    backgroundColor: colors.cardElevated,
  },
  outlined: {
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: colors.cardOutlined,
  },
  filled: {
    backgroundColor: colors.cardFilled,
  },
  flat: {
    backgroundColor: colors.white,
    borderRadius: 0,
  },
  minimal: {
    backgroundColor: 'transparent',
    padding: spacing.s,
  },
});

export default Card;
