import React from 'react';
import { View, ViewStyle } from 'react-native';
import { colors } from '../../theme';

// Note: This is a fallback implementation. 
// Install react-native-linear-gradient for true gradient support

interface GradientProps {
  children?: React.ReactNode;
  colors?: string[];
  start?: { x: number; y: number };
  end?: { x: number; y: number };
  style?: ViewStyle;
  variant?: 'primary' | 'secondary' | 'warm' | 'cool' | 'success' | 'error';
  angle?: number;
}

const Gradient: React.FC<GradientProps> = ({
  children,
  colors: customColors,
  start = { x: 0, y: 0 },
  end = { x: 1, y: 1 },
  style,
  variant = 'primary',
  angle
}) => {
  const getGradientColors = () => {
    if (customColors) return customColors;
    
    switch (variant) {
      case 'primary':
        return colors.gradients.primary;
      case 'secondary':
        return colors.gradients.secondary;
      case 'warm':
        return colors.gradients.warm;
      case 'cool':
        return colors.gradients.cool;
      case 'success':
        return colors.gradients.success;
      case 'error':
        return colors.gradients.error;
      default:
        return colors.gradients.primary;
    }
  };

  const getGradientDirection = () => {
    if (angle !== undefined) {
      const radians = (angle * Math.PI) / 180;
      return {
        start: { x: 0, y: 0 },
        end: { x: Math.cos(radians), y: Math.sin(radians) }
      };
    }
    return { start, end };
  };

  const { start: gradientStart, end: gradientEnd } = getGradientDirection();

  // Fallback to solid color (first color of gradient)
  const fallbackColor = getGradientColors()[0];

  return (
    <View style={[style, { backgroundColor: fallbackColor }]}>
      {children}
    </View>
  );
};

export default Gradient;
