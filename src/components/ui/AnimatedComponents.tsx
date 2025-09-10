import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  View,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Easing,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { colors, spacing, shadows } from '../../theme';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface FadeInViewProps {
  children: React.ReactNode;
  duration?: number;
  delay?: number;
  style?: ViewStyle;
}

export const FadeInView: React.FC<FadeInViewProps> = ({ 
  children, 
  duration = 500, 
  delay = 0, 
  style 
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration,
        useNativeDriver: true,
      }).start();
    }, delay);

    return () => clearTimeout(timer);
  }, [fadeAnim, duration, delay]);

  return (
    <Animated.View style={[{ opacity: fadeAnim }, style]}>
      {children}
    </Animated.View>
  );
};

interface SlideInViewProps {
  children: React.ReactNode;
  direction?: 'left' | 'right' | 'up' | 'down';
  duration?: number;
  delay?: number;
  distance?: number;
  style?: ViewStyle;
}

export const SlideInView: React.FC<SlideInViewProps> = ({ 
  children, 
  direction = 'up', 
  duration = 500, 
  delay = 0, 
  distance = 50,
  style 
}) => {
  const slideAnim = useRef(new Animated.Value(distance)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration,
          useNativeDriver: true,
        }),
      ]).start();
    }, delay);

    return () => clearTimeout(timer);
  }, [slideAnim, opacityAnim, duration, delay]);

  const getTransform = () => {
    switch (direction) {
      case 'left':
        return [{ translateX: slideAnim }];
      case 'right':
        return [{ translateX: Animated.multiply(slideAnim, -1) }];
      case 'up':
        return [{ translateY: slideAnim }];
      case 'down':
        return [{ translateY: Animated.multiply(slideAnim, -1) }];
      default:
        return [{ translateY: slideAnim }];
    }
  };

  return (
    <Animated.View 
      style={[
        { 
          opacity: opacityAnim,
          transform: getTransform()
        }, 
        style
      ]}
    >
      {children}
    </Animated.View>
  );
};

interface ScaleInViewProps {
  children: React.ReactNode;
  duration?: number;
  delay?: number;
  initialScale?: number;
  style?: ViewStyle;
}

export const ScaleInView: React.FC<ScaleInViewProps> = ({ 
  children, 
  duration = 500, 
  delay = 0, 
  initialScale = 0.8,
  style 
}) => {
  const scaleAnim = useRef(new Animated.Value(initialScale)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: duration * 0.8,
          useNativeDriver: true,
        }),
      ]).start();
    }, delay);

    return () => clearTimeout(timer);
  }, [scaleAnim, opacityAnim, duration, delay]);

  return (
    <Animated.View 
      style={[
        { 
          opacity: opacityAnim,
          transform: [{ scale: scaleAnim }]
        }, 
        style
      ]}
    >
      {children}
    </Animated.View>
  );
};

interface PulseViewProps {
  children: React.ReactNode;
  duration?: number;
  minOpacity?: number;
  maxOpacity?: number;
  style?: ViewStyle;
}

export const PulseView: React.FC<PulseViewProps> = ({ 
  children, 
  duration = 1000, 
  minOpacity = 0.5, 
  maxOpacity = 1,
  style 
}) => {
  const pulseAnim = useRef(new Animated.Value(minOpacity)).current;

  useEffect(() => {
    const pulse = () => {
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: maxOpacity,
          duration: duration / 2,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: minOpacity,
          duration: duration / 2,
          useNativeDriver: true,
        }),
      ]).start(() => pulse());
    };
    pulse();
  }, [pulseAnim, duration, minOpacity, maxOpacity]);

  return (
    <Animated.View style={[{ opacity: pulseAnim }, style]}>
      {children}
    </Animated.View>
  );
};

interface CountUpAnimationProps {
  end: number;
  start?: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  style?: TextStyle;
  shouldAnimate?: boolean;
}

export const CountUpAnimation: React.FC<CountUpAnimationProps> = ({ 
  end, 
  start = 0, 
  duration = 1000, 
  prefix = '', 
  suffix = '',
  style,
  shouldAnimate = true
}) => {
  const [displayValue, setDisplayValue] = useState(start);
  const animatedValue = useRef(new Animated.Value(start)).current;

  useEffect(() => {
    if (!shouldAnimate) {
      setDisplayValue(end);
      return;
    }

    const listener = animatedValue.addListener(({ value }) => {
      setDisplayValue(Math.floor(value));
    });

    Animated.timing(animatedValue, {
      toValue: end,
      duration,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();

    return () => {
      animatedValue.removeListener(listener);
    };
  }, [end, duration, shouldAnimate]);

  return (
    <Animated.Text style={style}>
      {prefix}{displayValue.toLocaleString()}{suffix}
    </Animated.Text>
  );
};

interface FloatingActionButtonProps {
  onPress: () => void;
  icon: string;
  style?: ViewStyle;
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({ 
  onPress, 
  icon, 
  style 
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, style]}>
      <Animated.Text
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        style={{ fontSize: 24 }}
      >
        {icon}
      </Animated.Text>
    </Animated.View>
  );
};

interface AnimatedProgressBarProps {
  progress: number;
  duration?: number;
  height?: number;
  backgroundColor?: string;
  fillColor?: string;
  style?: ViewStyle;
}

export const AnimatedProgressBar: React.FC<AnimatedProgressBarProps> = ({
  progress,
  duration = 1000,
  height = 8,
  backgroundColor = '#e2e8f0',
  fillColor = '#14b8a6',
  style
}) => {
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progress,
      duration,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [progress, duration]);

  return (
    <View style={[
      {
        height,
        backgroundColor,
        borderRadius: height / 2,
        overflow: 'hidden',
      },
      style
    ]}>
      <Animated.View
        style={{
          height: '100%',
          backgroundColor: fillColor,
          width: progressAnim.interpolate({
            inputRange: [0, 1],
            outputRange: ['0%', '100%'],
          }),
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  rippleContainer: {
    overflow: 'hidden',
  },
  ripple: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.white,
    top: '50%',
    left: '50%',
    marginTop: -10,
    marginLeft: -10,
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    zIndex: 1000,
  },
  fabContent: {
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.large,
  },
  progressContainer: {
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    borderRadius: 4,
    position: 'relative',
    overflow: 'hidden',
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 30,
    backgroundColor: colors.white,
  },
});

export default {
  FadeInView,
  SlideInView,
  ScaleInView,
  PulseView,
  CountUpAnimation,
  FloatingActionButton,
  AnimatedProgressBar,
};
