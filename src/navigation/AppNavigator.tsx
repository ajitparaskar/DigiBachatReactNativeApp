import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { colors } from '../theme';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import GroupsScreen from '../screens/GroupsScreen';
import SplashScreen from '../screens/SplashScreen';
import DashboardScreen from '../screens/DashboardScreen';
import GroupDetailsScreen from '../screens/GroupDetailsScreen';
import CreateGroupScreen from '../screens/CreateGroupScreen';
import JoinGroupScreen from '../screens/JoinGroupScreen';
import TransactionsScreen from '../screens/TransactionsScreen';
import JoinRequestsScreen from '../screens/JoinRequestsScreen';
import ContributionScreen from '../screens/ContributionScreen';
import SavingsSummaryScreen from '../screens/SavingsSummaryScreen';
import GroupSettingsScreen from '../screens/GroupSettingsScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import ResetPasswordScreen from '../screens/ResetPasswordScreen';
import ExitGroupScreen from '../screens/ExitGroupScreen';
import AnalyticsScreen from '../screens/AnalyticsScreen';
import TotalSavingsScreen from '../screens/TotalSavingsScreen';
import InviteMembersScreen from '../screens/InviteMembersScreen';
import VerifyEmailScreen from '../screens/VerifyEmailScreen';
import AccountSettingsScreen from '../screens/AccountSettingsScreen';
import HelpScreen from '../screens/HelpScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import GroupHistoryScreen from '../screens/GroupHistoryScreen';

export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  Register: undefined;
  Home: undefined;
  Groups: undefined;
  Dashboard: undefined;
  GroupDetails: { groupId: number };
  CreateGroup: undefined;
  JoinGroup: undefined;
  Transactions: { groupId?: number } | undefined;
  JoinRequests: { groupId: number };
  Contribution: { groupId: number };
  SavingsSummary: { groupId: number };
  GroupSettings: { groupId: number };
  ForgotPassword: undefined;
  ResetPassword: undefined;
  ExitGroup: undefined;
  Analytics: undefined;
  TotalSavings: undefined;
  InviteMembers: { groupId: number };
  VerifyEmail: { email: string };
  AccountSettings: undefined;
  Help: undefined;
  Notifications: undefined;
  GroupHistory: { groupId: number };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={{
        headerStyle: { backgroundColor: colors.white },
        headerTitleStyle: { color: colors.gray900 },
        headerTintColor: colors.brandTeal,
      }}
    >
      <Stack.Screen name="Splash" component={SplashScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Create Account' }} />
      <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'DigiBachat' }} />
      <Stack.Screen name="Groups" component={GroupsScreen} options={{ title: 'My Groups' }} />
      <Stack.Screen name="Dashboard" component={DashboardScreen} options={{ title: 'Dashboard' }} />
      <Stack.Screen name="GroupDetails" component={GroupDetailsScreen} options={{ title: 'Group Details' }} />
      <Stack.Screen name="CreateGroup" component={CreateGroupScreen} options={{ title: 'Create Group' }} />
      <Stack.Screen name="JoinGroup" component={JoinGroupScreen} options={{ title: 'Join Group' }} />
      <Stack.Screen name="Transactions" component={TransactionsScreen} options={{ title: 'Transactions' }} />
      <Stack.Screen name="JoinRequests" component={JoinRequestsScreen} options={{ title: 'Join Requests' }} />
      <Stack.Screen name="Contribution" component={ContributionScreen} options={{ title: 'Contribute' }} />
      <Stack.Screen name="SavingsSummary" component={SavingsSummaryScreen} options={{ title: 'Savings Summary' }} />
      <Stack.Screen name="GroupSettings" component={GroupSettingsScreen} options={{ title: 'Group Settings' }} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} options={{ title: 'Forgot Password' }} />
      <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} options={{ title: 'Reset Password' }} />
      <Stack.Screen name="VerifyEmail" component={VerifyEmailScreen} options={{ title: 'Verify Email' }} />
      <Stack.Screen name="ExitGroup" component={ExitGroupScreen} options={{ title: 'Exit Group' }} />
      <Stack.Screen name="Analytics" component={AnalyticsScreen} options={{ title: 'Analytics' }} />
      <Stack.Screen name="TotalSavings" component={TotalSavingsScreen} options={{ title: 'Total Savings' }} />
      <Stack.Screen name="InviteMembers" component={InviteMembersScreen} options={{ title: 'Invite Members' }} />
      <Stack.Screen name="AccountSettings" component={AccountSettingsScreen} options={{ title: 'Account Settings' }} />
      <Stack.Screen name="Help" component={HelpScreen} options={{ title: 'Help' }} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ title: 'Notifications' }} />
      <Stack.Screen name="GroupHistory" component={GroupHistoryScreen} options={{ title: 'Group History' }} />
    </Stack.Navigator>
  );
};

export default AppNavigator;