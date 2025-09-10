import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, typography, spacing, shadows } from '../../theme';

interface ComingSoonProps {
  icon?: string;
  title?: string;
  description?: string;
  showNotifyButton?: boolean;
  onNotifyPress?: () => void;
  variant?: 'card' | 'fullscreen' | 'banner';
}

const ComingSoon: React.FC<ComingSoonProps> = ({
  icon = '🚀',
  title = 'Coming Soon',
  description = 'This feature is under development and will be available soon. Stay tuned for updates!',
  showNotifyButton = false,
  onNotifyPress,
  variant = 'card'
}) => {
  const getContainerStyle = () => {
    switch (variant) {
      case 'fullscreen':
        return styles.fullscreenContainer;
      case 'banner':
        return styles.bannerContainer;
      default:
        return styles.cardContainer;
    }
  };

  return (
    <View style={getContainerStyle()}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>{icon}</Text>
          <View style={styles.sparkles}>
            <Text style={styles.sparkle}>✨</Text>
            <Text style={styles.sparkle}>⭐</Text>
            <Text style={styles.sparkle}>💫</Text>
          </View>
        </View>
        
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
        
        {showNotifyButton && (
          <TouchableOpacity 
            style={styles.notifyButton} 
            onPress={onNotifyPress}
          >
            <Text style={styles.notifyText}>🔔 Notify Me</Text>
          </TouchableOpacity>
        )}
      </View>
      
      <View style={styles.progressBar}>
        <View style={styles.progressFill} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 16,
    padding: spacing.xl,
    margin: spacing.m,
    alignItems: 'center',
    ...shadows.medium,
  },
  fullscreenContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
    padding: spacing.xl,
  },
  bannerContainer: {
    backgroundColor: colors.brandTeal + '10',
    borderRadius: 12,
    padding: spacing.l,
    margin: spacing.m,
    borderWidth: 1,
    borderColor: colors.brandTeal + '20',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    maxWidth: 280,
  },
  iconContainer: {
    position: 'relative',
    marginBottom: spacing.l,
  },
  icon: {
    fontSize: 48,
    textAlign: 'center',
  },
  sparkles: {
    position: 'absolute',
    top: -10,
    right: -10,
    flexDirection: 'row',
  },
  sparkle: {
    fontSize: 16,
    marginHorizontal: 2,
  },
  title: {
    ...typography.h3,
    color: colors.gray900,
    marginBottom: spacing.s,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  description: {
    ...typography.body,
    color: colors.gray600,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.l,
  },
  notifyButton: {
    backgroundColor: colors.brandTeal,
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.m,
    borderRadius: 25,
    ...shadows.small,
    marginBottom: spacing.m,
  },
  notifyText: {
    ...typography.button,
    color: colors.white,
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: colors.gray100,
    borderRadius: 2,
    overflow: 'hidden',
    marginTop: spacing.m,
  },
  progressFill: {
    width: '35%',
    height: '100%',
    backgroundColor: colors.brandTeal,
    borderRadius: 2,
  },
});

export default ComingSoon;
