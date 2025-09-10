import React, { useRef, useState } from 'react';
import { TouchableOpacity, Animated, ViewStyle, GestureResponderEvent } from 'react-native';

interface LongPressButtonProps {
  children: React.ReactNode;
  onPress: () => void;
  onLongPress?: () => void;
  style?: ViewStyle;
  pressScale?: number;
  hapticFeedback?: boolean;
  disabled?: boolean;
}

export const LongPressButton: React.FC<LongPressButtonProps> = ({
  children,
  onPress,
  onLongPress,
  style,
  pressScale = 0.95,
  hapticFeedback = false,
  disabled = false,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (disabled) return;
    
    Animated.spring(scaleAnim, {
      toValue: pressScale,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();
  };

  const handlePressOut = () => {
    if (disabled) return;
    
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();
  };

  const handlePress = () => {
    if (disabled) return;
    onPress();
  };

  const handleLongPress = () => {
    if (disabled) return;
    if (onLongPress) {
      onLongPress();
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      onLongPress={handleLongPress}
      style={style}
      disabled={disabled}
    >
      <Animated.View
        style={{
          transform: [{ scale: scaleAnim }],
        }}
      >
        {children}
      </Animated.View>
    </TouchableOpacity>
  );
};

interface ElasticScaleProps {
  children: React.ReactNode;
  trigger: boolean;
  scale?: number;
  duration?: number;
  style?: ViewStyle;
}

export const ElasticScale: React.FC<ElasticScaleProps> = ({
  children,
  trigger,
  scale = 1.1,
  duration = 300,
  style,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    if (trigger) {
      Animated.sequence([
        Animated.spring(scaleAnim, {
          toValue: scale,
          useNativeDriver: true,
          tension: 100,
          friction: 3,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }),
      ]).start();
    }
  }, [trigger, scale, scaleAnim]);

  return (
    <Animated.View
      style={[
        {
          transform: [{ scale: scaleAnim }],
        },
        style,
      ]}
    >
      {children}
    </Animated.View>
  );
};

interface SuccessCheckmarkProps {
  visible: boolean;
  size?: number;
  color?: string;
  duration?: number;
  style?: ViewStyle;
}

export const SuccessCheckmark: React.FC<SuccessCheckmarkProps> = ({
  visible,
  size = 24,
  color = '#10b981',
  duration = 500,
  style,
}) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: duration * 0.5,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 0,
          duration: duration * 0.3,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: duration * 0.3,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, duration, scaleAnim, opacityAnim]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          justifyContent: 'center',
          alignItems: 'center',
          transform: [{ scale: scaleAnim }],
          opacity: opacityAnim,
        },
        style,
      ]}
    >
      <Animated.Text
        style={{
          color: 'white',
          fontSize: size * 0.6,
          fontWeight: 'bold',
        }}
      >
        ✓
      </Animated.Text>
    </Animated.View>
  );
};

interface FloatingBubbleProps {
  visible: boolean;
  text: string;
  x: number;
  y: number;
  duration?: number;
  style?: ViewStyle;
}

export const FloatingBubble: React.FC<FloatingBubbleProps> = ({
  visible,
  text,
  x,
  y,
  duration = 2000,
  style,
}) => {
  const translateYAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  React.useEffect(() => {
    if (visible) {
      // Reset animations
      translateYAnim.setValue(0);
      opacityAnim.setValue(0);
      scaleAnim.setValue(0.8);

      // Start floating animation
      Animated.parallel([
        Animated.timing(translateYAnim, {
          toValue: -50,
          duration,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.parallel([
            Animated.timing(opacityAnim, {
              toValue: 1,
              duration: duration * 0.2,
              useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
              toValue: 1,
              useNativeDriver: true,
              tension: 100,
              friction: 8,
            }),
          ]),
          Animated.timing(opacityAnim, {
            toValue: 0,
            duration: duration * 0.3,
            delay: duration * 0.5,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    }
  }, [visible, duration, translateYAnim, opacityAnim, scaleAnim]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          left: x,
          top: y,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          paddingHorizontal: 12,
          paddingVertical: 8,
          borderRadius: 20,
          transform: [
            { translateY: translateYAnim },
            { scale: scaleAnim },
          ],
          opacity: opacityAnim,
          zIndex: 1000,
        },
        style,
      ]}
    >
      <Animated.Text
        style={{
          color: 'white',
          fontSize: 14,
          fontWeight: '600',
          textAlign: 'center',
        }}
      >
        {text}
      </Animated.Text>
    </Animated.View>
  );
};

interface PressableScaleProps {
  children: React.ReactNode;
  onPress: () => void;
  style?: ViewStyle;
  scaleValue?: number;
  disabled?: boolean;
}

export const PressableScale: React.FC<PressableScaleProps> = ({
  children,
  onPress,
  style,
  scaleValue = 0.96,
  disabled = false,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (disabled) return;
    
    Animated.timing(scaleAnim, {
      toValue: scaleValue,
      duration: 100,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    if (disabled) return;
    
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();
  };

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={disabled ? undefined : onPress}
      style={style}
      disabled={disabled}
    >
      <Animated.View
        style={{
          transform: [{ scale: scaleAnim }],
        }}
      >
        {children}
      </Animated.View>
    </TouchableOpacity>
  );
};

interface ShakeAnimationProps {
  children: React.ReactNode;
  trigger: boolean;
  intensity?: number;
  duration?: number;
  style?: ViewStyle;
}

export const ShakeAnimation: React.FC<ShakeAnimationProps> = ({
  children,
  trigger,
  intensity = 10,
  duration = 500,
  style,
}) => {
  const shakeAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (trigger) {
      const shakeSequence = [];
      const steps = 8;
      
      for (let i = 0; i < steps; i++) {
        shakeSequence.push(
          Animated.timing(shakeAnim, {
            toValue: i % 2 === 0 ? intensity : -intensity,
            duration: duration / steps,
            useNativeDriver: true,
          })
        );
      }
      
      shakeSequence.push(
        Animated.timing(shakeAnim, {
          toValue: 0,
          duration: duration / steps,
          useNativeDriver: true,
        })
      );

      Animated.sequence(shakeSequence).start();
    }
  }, [trigger, intensity, duration, shakeAnim]);

  return (
    <Animated.View
      style={[
        {
          transform: [{ translateX: shakeAnim }],
        },
        style,
      ]}
    >
      {children}
    </Animated.View>
  );
};
