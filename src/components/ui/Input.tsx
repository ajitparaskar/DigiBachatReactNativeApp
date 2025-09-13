import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, TextInputProps, TouchableOpacity } from 'react-native';
import { colors, spacing, borderRadius, typography } from '../../theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode | string;
  rightIcon?: React.ReactNode | string;
  variant?: 'default' | 'filled';
}

const Input: React.FC<InputProps> = ({ 
  label, 
  error, 
  leftIcon,
  rightIcon,
  variant = 'default',
  style, 
  placeholderTextColor = colors.gray500,
  ...rest 
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const getInputStyle = () => {
    const baseStyle = {
      borderWidth: 1,
      borderColor: error ? colors.danger : isFocused ? colors.brandTeal : colors.gray300,
    };

    if (variant === 'filled') {
      return {
        ...baseStyle,
        backgroundColor: colors.gray100,
        borderWidth: 0,
        borderBottomWidth: 2,
        borderRadius: 0,
      };
    }

    return baseStyle;
  };

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.inputContainer, getInputStyle()]}>
        {leftIcon && (
          <View style={styles.leftIcon}>
            {typeof leftIcon === 'string' ? <Text>{leftIcon}</Text> : leftIcon}
          </View>
        )}
        <TextInput
          style={[styles.input, style]}
          placeholderTextColor={placeholderTextColor}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...rest}
        />
        {rightIcon && (
          <View style={styles.rightIcon}>
            {typeof rightIcon === 'string' ? <Text>{rightIcon}</Text> : rightIcon}
          </View>
        )}
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.m,
  },
  label: {
    ...typography.label,
    marginBottom: spacing.xs,
    color: colors.gray700,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.m,
    backgroundColor: colors.white,
  },
  input: {
    flex: 1,
    ...typography.body,
    paddingVertical: spacing.m,
    paddingHorizontal: spacing.m,
    minHeight: 48,
  },
  leftIcon: {
    paddingLeft: spacing.m,
  },
  rightIcon: {
    paddingRight: spacing.m,
  },
  error: {
    ...typography.caption,
    color: colors.danger,
    marginTop: spacing.xs,
  },
});

export default Input;
