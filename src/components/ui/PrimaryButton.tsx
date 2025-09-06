import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, ViewStyle } from 'react-native';
import { colors, spacing, borderRadius, typography, shadows } from '../../theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'text';
  size?: 'medium' | 'large';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

const PrimaryButton: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  style,
}) => {
  const getVariantStyle = () => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: disabled ? colors.gray300 : colors.brandTeal,
          ...shadows.small,
        };
      case 'secondary':
        return {
          backgroundColor: disabled ? colors.gray300 : colors.success,
          ...shadows.small,
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: disabled ? colors.gray300 : colors.brandTeal,
        };
      case 'text':
        return {
          backgroundColor: 'transparent',
          paddingVertical: spacing.xs,
        };
      default:
        return {};
    }
  };

  const getTextColor = () => {
    if (variant === 'outline' || variant === 'text') {
      return disabled ? colors.gray300 : colors.brandTeal;
    }
    return colors.white;
  };

  return (
    <TouchableOpacity
      style={[
        styles.base,
        getVariantStyle(),
        size === 'large' && styles.large,
        disabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.8}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} size="small" />
      ) : (
        <Text style={[styles.text, { color: getTextColor() }]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: borderRadius.l,
    paddingVertical: spacing.m,
    paddingHorizontal: spacing.l,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 48,
  },
  large: {
    paddingVertical: spacing.l,
    minHeight: 56,
  },
  disabled: {
    opacity: 0.6,
  },
  text: {
    ...typography.button,
    textAlign: 'center',
  },
});

export default PrimaryButton;


