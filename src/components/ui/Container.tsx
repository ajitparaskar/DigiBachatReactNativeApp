import React from 'react';
import { View, StyleSheet, ViewStyle, ScrollView } from 'react-native';
import { colors, spacing } from '../../theme';

interface ContainerProps {
  children: React.ReactNode;
  style?: ViewStyle;
  scrollable?: boolean;
  padding?: keyof typeof spacing;
}

const Container: React.FC<ContainerProps> = ({ 
  children, 
  style, 
  scrollable = false,
  padding = 'm'
}) => {
  const containerStyle = [
    styles.base,
    { padding: spacing[padding] },
    style,
  ];

  if (scrollable) {
    return (
      <ScrollView 
        style={[styles.base, { padding: 0 }]}
        contentContainerStyle={[{ padding: spacing[padding] }, style]}
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    );
  }

  return <View style={containerStyle}>{children}</View>;
};

const styles = StyleSheet.create({
  base: {
    flex: 1,
    backgroundColor: colors.gray100,
  },
});

export default Container;