import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors, shadows, spacing } from '../theme';

// Screens
import DashboardScreen from '../screens/DashboardScreen';
import GroupsScreen from '../screens/GroupsScreen';
import AnalyticsScreen from '../screens/AnalyticsScreen';
import LoansScreen from '../screens/LoansScreen';
import AccountSettingsScreen from '../screens/AccountSettingsScreen';

interface TabIconProps {
  focused: boolean;
  icon: string;
  label: string;
}

const TabIcon: React.FC<TabIconProps> = ({ focused, icon, label }) => {
  return (
    <View style={[styles.tabItem, focused && styles.tabItemActive]}>
      <View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
        <Text style={[styles.icon, focused && styles.iconActive]}>{icon}</Text>
      </View>
      <Text style={[styles.label, focused && styles.labelActive]}>{label}</Text>
      {focused && <View style={styles.activeIndicator} />}
    </View>
  );
};

const BottomTabNavigator = () => {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = React.useState('Dashboard');

  const tabs = [
    { name: 'Dashboard', icon: '🏠', label: 'Home', component: DashboardScreen },
    { name: 'Groups', icon: '👥', label: 'Groups', component: GroupsScreen },
    { name: 'Analytics', icon: '📊', label: 'Analytics', component: AnalyticsScreen },
    { name: 'Loans', icon: '💰', label: 'Loans', component: LoansScreen },
    { name: 'Profile', icon: '⚙️', label: 'Profile', component: AccountSettingsScreen },
  ];

  const ActiveComponent = tabs.find(tab => tab.name === activeTab)?.component || DashboardScreen;

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <ActiveComponent {...({} as any)} />
      </View>
      <View style={styles.tabBar}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.name}
            onPress={() => setActiveTab(tab.name)}
            style={styles.tabButton}
          >
            <TabIcon 
              focused={activeTab === tab.name} 
              icon={tab.icon} 
              label={tab.label} 
            />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  content: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.gray200,
    paddingBottom: spacing.s,
    paddingTop: spacing.s,
    height: 65,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  tabItemActive: {
    transform: [{ scale: 1.05 }],
  },
  iconContainer: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: colors.gray100,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  iconContainerActive: {
    backgroundColor: colors.brandTeal,
    ...shadows.small,
  },
  icon: {
    fontSize: 22,
    color: colors.gray500,
  },
  iconActive: {
    color: colors.white,
  },
  label: {
    fontSize: 10,
    fontWeight: '500',
    color: colors.gray600,
    marginTop: 2,
  },
  labelActive: {
    color: colors.brandTeal,
    fontWeight: '600',
  },
  activeIndicator: {
    position: 'absolute',
    top: -5,
    width: 30,
    height: 3,
    backgroundColor: colors.brandTeal,
    borderRadius: 2,
  },
});

export default BottomTabNavigator;
