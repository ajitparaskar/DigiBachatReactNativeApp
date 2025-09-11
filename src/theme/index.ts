import { DefaultTheme, Theme } from '@react-navigation/native';
import { colors } from './colors';

// Enhanced spacing system (using multiples of 4 for consistency)
export const spacing = {
  none: 0,
  xxs: 2,
  xs: 4,
  s: 8,
  m: 16,
  l: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

// Border Radius
export const borderRadius = {
  s: 4,
  m: 8,
  l: 12,
  xl: 16,
  xxl: 24,
};

// Enhanced typography system
export const typography = {
  h1: {
    fontSize: 36,
    fontWeight: '800' as const,
    lineHeight: 44,
    color: colors.gray900,
    letterSpacing: -0.5,
  },
  h2: {
    fontSize: 28,
    fontWeight: '700' as const,
    lineHeight: 36,
    color: colors.gray900,
    letterSpacing: -0.25,
  },
  h3: {
    fontSize: 22,
    fontWeight: '600' as const,
    lineHeight: 30,
    color: colors.gray900,
  },
  h4: {
    fontSize: 18,
    fontWeight: '600' as const,
    lineHeight: 26,
    color: colors.gray900,
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
    color: colors.gray700,
  },
  bodyLarge: {
    fontSize: 18,
    fontWeight: '400' as const,
    lineHeight: 28,
    color: colors.gray700,
  },
  caption: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
    color: colors.gray500,
  },
  captionSmall: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
    color: colors.gray500,
  },
  label: {
    fontSize: 14,
    fontWeight: '500' as const,
    lineHeight: 20,
    color: colors.gray700,
  },
  labelLarge: {
    fontSize: 16,
    fontWeight: '500' as const,
    lineHeight: 24,
    color: colors.gray700,
  },
  labelMedium: {
    fontSize: 14,
    fontWeight: '500' as const,
    lineHeight: 20,
    color: colors.gray600,
  },
  button: {
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 24,
    letterSpacing: 0.25,
    color: colors.gray900,
  },
  buttonLarge: {
    fontSize: 18,
    fontWeight: '600' as const,
    lineHeight: 28,
    letterSpacing: 0.25,
    color: colors.gray900,
  },
};

// Enhanced shadows system
export const shadows = {
  none: {},
  small: {
    shadowColor: colors.gray900,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  medium: {
    shadowColor: colors.gray900,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  large: {
    shadowColor: colors.gray900,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  xlarge: {
    shadowColor: colors.gray900,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 12,
  },
};

export const AppTheme: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.brandTeal,
    background: colors.white,
    card: colors.white,
    text: colors.gray900,
    border: colors.gray200,
    notification: colors.brandTealLight,
  },
};

export { colors };
