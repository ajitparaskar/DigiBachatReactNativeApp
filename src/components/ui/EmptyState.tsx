import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import PrimaryButton from './PrimaryButton';
import { colors, typography, spacing, shadows } from '../../theme';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
  secondaryActionText?: string;
  onSecondaryAction?: () => void;
  variant?: 'default' | 'large' | 'compact' | 'minimal';
  style?: ViewStyle;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon = '📭',
  title,
  description,
  actionText,
  onAction,
  secondaryActionText,
  onSecondaryAction,
  variant = 'default',
  style,
}) => {
  const getIconSize = () => {
    switch (variant) {
      case 'large':
        return 80;
      case 'compact':
        return 40;
      default:
        return 60;
    }
  };

  const getContainerStyle = () => {
    return [
      styles.container,
      variant === 'compact' && styles.compactContainer,
      style
    ].filter(Boolean);
  };

  const getIconContainerStyle = () => {
    return [
      styles.iconContainer,
      variant === 'compact' && { marginBottom: spacing.m }
    ].filter(Boolean);
  };

  const getIconStyle = () => {
    return [
      styles.icon,
      variant === 'compact' && styles.compactIcon,
      { fontSize: getIconSize() }
    ].filter(Boolean);
  };

  const getTitleStyle = () => {
    return [
      styles.title,
      variant === 'compact' && styles.compactTitle
    ].filter(Boolean);
  };

  const getDescriptionStyle = () => {
    return [
      styles.description,
      variant === 'compact' && styles.compactDescription
    ].filter(Boolean);
  };

  const getActionsContainerStyle = () => {
    return [
      styles.actionsContainer,
      variant === 'compact' && styles.compactActionsContainer
    ].filter(Boolean);
  };

  return (
    <View style={getContainerStyle()}>
      <View style={styles.content}>
        <View style={getIconContainerStyle()}>
          <Text style={getIconStyle()}>
            {icon}
          </Text>
        </View>
        
        <Text style={getTitleStyle()}>
          {title}
        </Text>
        
        {description && (
          <Text style={getDescriptionStyle()}>
            {description}
          </Text>
        )}
        
        {(actionText && onAction) || (secondaryActionText && onSecondaryAction) ? (
          <View style={getActionsContainerStyle()}>
            {actionText && onAction && (
              <PrimaryButton
                title={actionText}
                onPress={onAction}
                variant="outline"
                style={styles.actionButton}
              />
            )}
            
            {secondaryActionText && onSecondaryAction && (
              <PrimaryButton
                title={secondaryActionText}
                onPress={onSecondaryAction}
                variant="outline"
                style={StyleSheet.flatten([styles.actionButton, styles.secondaryActionButton])}
              />
            )}
          </View>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxl,
  },
  compactContainer: {
    paddingVertical: spacing.l,
  },
  content: {
    alignItems: 'center',
    maxWidth: 300,
  },
  iconContainer: {
    marginBottom: spacing.l,
    alignItems: 'center',
  },
  icon: {
    fontSize: 64,
    textAlign: 'center',
  },
  compactIcon: {
    fontSize: 48,
  },
  title: {
    ...typography.h3,
    color: colors.gray900,
    textAlign: 'center',
    marginBottom: spacing.s,
  },
  compactTitle: {
    ...typography.h4,
  },
  description: {
    ...typography.body,
    color: colors.gray600,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.xl,
    maxWidth: 280,
  },
  compactDescription: {
    marginBottom: spacing.l,
    maxWidth: 240,
  },
  actionsContainer: {
    width: '100%',
    maxWidth: 200,
    gap: spacing.m,
  },
  compactActionsContainer: {
    maxWidth: 180,
  },
  actionButton: {
    width: '100%',
  },
  secondaryActionButton: {
    marginTop: spacing.s,
  },
});

export default EmptyState;
