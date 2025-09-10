import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, StatusBar, ActivityIndicator, Dimensions } from 'react-native';
import Container from '../components/ui/Container';
import Card from '../components/ui/Card';
import PrimaryButton from '../components/ui/PrimaryButton';
// Import animated components with fallbacks
let FadeInView, SlideInView, ScaleInView, PulseView;
let LongPressButton, ElasticScale;

try {
  const animatedComponents = require('../components/ui/AnimatedComponents');
  FadeInView = animatedComponents.FadeInView;
  SlideInView = animatedComponents.SlideInView;
  ScaleInView = animatedComponents.ScaleInView;
  PulseView = animatedComponents.PulseView;
} catch (error) {
  console.warn('AnimatedComponents not found, using fallbacks');
  // Fallback components
  FadeInView = ({ children }: any) => <View>{children}</View>;
  SlideInView = ({ children }: any) => <View>{children}</View>;
  ScaleInView = ({ children }: any) => <View>{children}</View>;
  PulseView = ({ children }: any) => <View>{children}</View>;
}

try {
  const microInteractions = require('../components/ui/MicroInteractions');
  LongPressButton = microInteractions.LongPressButton;
  ElasticScale = microInteractions.ElasticScale;
} catch (error) {
  console.warn('MicroInteractions not found, using fallbacks');
  // Fallback components
  LongPressButton = ({ children, onPress, style }: any) => (
    <TouchableOpacity onPress={onPress} style={style}>{children}</TouchableOpacity>
  );
  ElasticScale = ({ children }: any) => <View>{children}</View>;
}
import { colors, typography, spacing, shadows } from '../theme';
import { clearToken } from '../services/auth';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';

const { width } = Dimensions.get('window');

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const [greeting, setGreeting] = useState('');
  const [userName] = useState('User'); // This should come from user context/storage
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting('Good Morning');
    } else if (hour < 18) {
      setGreeting('Good Afternoon');
    } else {
      setGreeting('Good Evening');
    }
  }, []);

  const safeNavigate = (screenName: string) => {
    if (isLoading) {
      console.log('Navigation blocked - already loading');
      return; // Prevent multiple rapid taps
    }
    
    console.log(`🚀 Starting navigation to: ${screenName}`);
    setIsLoading(true);
    
    try {
      // Core screens that should always work
      const coreScreens = ['Dashboard', 'Groups', 'AccountSettings'];
      
      // All available screens from AppNavigator.tsx
      const availableScreens = [
        'Dashboard', 'Groups', 'CreateGroup', 'JoinGroup', 'Loans',
        'AccountSettings', 'Analytics', 'FinancialReports', 'Notifications',
        'Help', 'QRScanner', 'GroupDetails', 'Contribution', 'Transactions',
        'JoinRequests', 'SavingsSummary', 'GroupSettings', 'ExitGroup',
        'TotalSavings', 'InviteMembers', 'GroupHistory', 'LoanRequest'
      ];
      
      console.log(`Checking if ${screenName} is in available screens:`, availableScreens.includes(screenName));
      
      // Direct navigation for core screens
      if (coreScreens.includes(screenName)) {
        console.log(`✅ Navigating to core screen: ${screenName}`);
        navigation.navigate(screenName as any);
        showSuccessNavigation(screenName);
      }
      // Try navigation for other available screens
      else if (availableScreens.includes(screenName)) {
        console.log(`✅ Navigating to available screen: ${screenName}`);
        // Add a small delay to ensure proper navigation
        setTimeout(() => {
          try {
            navigation.navigate(screenName as any);
            showSuccessNavigation(screenName);
            console.log(`✅ Successfully navigated to: ${screenName}`);
          } catch (navError) {
            console.error(`❌ Navigation to ${screenName} failed:`, navError);
            Alert.alert(
              'Navigation Error',
              `Could not navigate to ${screenName}. Error: ${navError}`,
              [
                { text: 'OK' },
                { text: 'Try Dashboard', onPress: () => navigation.navigate('Dashboard' as any) }
              ]
            );
          }
        }, 100);
      } else {
        console.log(`❓ Screen ${screenName} not found in available screens, showing coming soon`);
        showComingSoon(screenName);
      }
    } catch (error) {
      console.error(`❌ Navigation setup failed for ${screenName}:`, error);
      Alert.alert(
        'Navigation Issue',
        `Error details: ${error}\n\nLet's go to your dashboard instead.`,
        [{ text: 'OK', onPress: () => navigation.navigate('Dashboard' as any) }]
      );
    }
    
    // Reset loading state after a short delay
    setTimeout(() => {
      setIsLoading(false);
      console.log(`🏁 Loading state reset for ${screenName}`);
    }, 800);
  };
  
  const showComingSoon = (screenName: string) => {
    const featureName = screenName.replace(/([A-Z])/g, ' $1').trim();
    Alert.alert(
      'Coming Soon! 🚀',
      `The ${featureName} feature is being developed with exciting new capabilities! We're constantly improving your experience.`,
      [
        { text: 'Got it!', style: 'default' },
        {
          text: 'View Dashboard',
          onPress: () => {
            console.log('Redirecting to Dashboard after coming soon alert');
            navigation.navigate('Dashboard' as any);
          }
        }
      ]
    );
  };
  
  const showSuccessNavigation = (screenName: string) => {
    // Optional: Add a subtle success indication
    console.log(`✓ Successfully navigated to ${screenName}`);
  };

  const quickActions = [
    { 
      title: 'Dashboard', 
      icon: '📊', 
      color: colors.brandTeal + '20',
      iconBg: colors.brandTeal,
      onPress: () => safeNavigate('Dashboard') 
    },
    { 
      title: 'Groups', 
      icon: '👥', 
      color: colors.info + '20',
      iconBg: colors.info,
      onPress: () => safeNavigate('Groups') 
    },
    { 
      title: 'Create Group', 
      icon: '➕', 
      color: colors.success + '20',
      iconBg: colors.success,
      onPress: () => safeNavigate('CreateGroup') 
    },
    { 
      title: 'Join Group', 
      icon: '🤝', 
      color: colors.secondary + '20',
      iconBg: colors.secondary,
      onPress: () => safeNavigate('JoinGroup') 
    },
  ];

  const moreOptions = [
    { 
      title: 'My Groups', 
      icon: '👥', 
      color: colors.info, 
      onPress: () => safeNavigate('Groups')
    },
    { 
      title: 'Analytics', 
      icon: '📈', 
      color: colors.success, 
      onPress: () => safeNavigate('Analytics')
    },
    { 
      title: 'Account Settings', 
      icon: '⚙️', 
      color: colors.brandTeal, 
      onPress: () => safeNavigate('AccountSettings')
    },
    { 
      title: 'QR Scanner', 
      icon: '📱', 
      color: colors.warning, 
      onPress: () => safeNavigate('QRScanner')
    },
  ];

  const handleLogout = async () => {
    await clearToken();
    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={colors.brandTeal} />
      <Container scrollable style={styles.container}>
        {/* Enhanced Header with Gradient Background */}
        <FadeInView duration={800} delay={100}>
          <View style={styles.headerGradient}>
            <View style={styles.header}>
              <SlideInView direction="left" duration={600} delay={200}>
                <View style={styles.welcomeSection}>
                  <Text style={styles.greetingText}>{greeting}!</Text>
                  <Text style={styles.title}>
                    Digi <Text style={styles.titleAccent}>बचत</Text>
                  </Text>
                  <Text style={styles.subtitle}>Your financial journey starts here</Text>
                  <View style={styles.motivationBadge}>
                    <Text style={styles.motivationIcon}>🚀</Text>
                    <Text style={styles.motivationText}>Ready to save smarter?</Text>
                  </View>
                </View>
              </SlideInView>
              <SlideInView direction="right" duration={600} delay={300}>
                <View style={styles.profileSection}>
                  <PulseView duration={2000} minOpacity={0.8}>
                    <ElasticScale trigger={false} scale={1.1}>
                      <TouchableOpacity 
                        style={[
                          styles.profileButton,
                          isLoading && styles.disabledCard
                        ]}
                        onPress={() => safeNavigate('AccountSettings')}
                        disabled={isLoading}
                      >
                        <Text style={styles.profileIcon}>👤</Text>
                        {isLoading && <ActivityIndicator size="small" color={colors.brandTeal} style={styles.profileLoadingIndicator} />}
                      </TouchableOpacity>
                    </ElasticScale>
                  </PulseView>
                  <TouchableOpacity 
                    style={[
                      styles.notificationButton,
                      isLoading && styles.disabledCard
                    ]}
                    onPress={() => safeNavigate('Notifications')}
                    disabled={isLoading}
                  >
                    <Text style={styles.notificationIcon}>🔔</Text>
                    <View style={styles.notificationBadge}>
                      <Text style={styles.badgeText}>3</Text>
                    </View>
                    {isLoading && <ActivityIndicator size="small" color={colors.white} style={styles.headerLoadingIndicator} />}
                  </TouchableOpacity>
                </View>
              </SlideInView>
            </View>
          </View>
        </FadeInView>

        {/* Quick Actions with Enhanced Design */}
        <SlideInView direction="up" duration={700} delay={500}>
          <Card variant="elevated" style={styles.quickActionsCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>✨ Quick Actions</Text>
              <Text style={styles.sectionSubtitle}>Get started with these popular features</Text>
            </View>
            <View style={styles.actionsGrid}>
              {quickActions.map((action, index) => (
                <ScaleInView key={index} duration={500} delay={600 + index * 100}>
                  <ElasticScale trigger={false} scale={1.05}>
                    <LongPressButton
                      onPress={action.onPress}
                      style={[
                        styles.actionCard, 
                        { backgroundColor: action.color },
                        isLoading && styles.disabledCard
                      ]}
                      hapticFeedback={true}
                      disabled={isLoading}
                    >
                      <View style={[styles.actionIconContainer, { backgroundColor: action.iconBg }]}>
                        <Text style={styles.actionIcon}>{action.icon}</Text>
                      </View>
                      <Text style={styles.actionTitle}>{action.title}</Text>
                      {isLoading && <ActivityIndicator size="small" color={colors.white} style={styles.loadingIndicator} />}
                    </LongPressButton>
                  </ElasticScale>
                </ScaleInView>
              ))}
            </View>
          </Card>
        </SlideInView>

        {/* Dashboard Navigation Card */}
        <SlideInView direction="up" duration={700} delay={800}>
          <Card variant="elevated" style={styles.dashboardCard}>
            <View style={styles.dashboardContent}>
              <View style={styles.dashboardIcon}>
                <Text style={styles.dashboardIconText}>📊</Text>
              </View>
              <View style={styles.dashboardText}>
                <Text style={styles.dashboardTitle}>View Dashboard</Text>
                <Text style={styles.dashboardSubtitle}>Track your savings progress and analytics</Text>
              </View>
              <ElasticScale trigger={false} scale={1.1}>
                <TouchableOpacity 
                  style={[
                    styles.dashboardButton,
                    isLoading && styles.disabledCard
                  ]}
                  onPress={() => safeNavigate('Dashboard')}
                  disabled={isLoading}
                >
                  <Text style={styles.dashboardButtonText}>View</Text>
                  {isLoading && <ActivityIndicator size="small" color={colors.white} />}
                </TouchableOpacity>
              </ElasticScale>
            </View>
          </Card>
        </SlideInView>

        {/* More Options with Better Design */}
        <SlideInView direction="up" duration={700} delay={900}>
          <Card variant="elevated" style={styles.moreOptionsCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>🔧 More Options</Text>
              <Text style={styles.sectionSubtitle}>Additional features and tools</Text>
            </View>
            <View style={styles.optionsGrid}>
              {moreOptions.map((option, index) => (
                <ScaleInView key={index} duration={400} delay={1000 + index * 50}>
                  <ElasticScale trigger={false} scale={1.02}>
                    <TouchableOpacity
                      style={[
                        styles.optionCard,
                        isLoading && styles.disabledCard
                      ]}
                      onPress={option.onPress}
                      activeOpacity={0.8}
                      disabled={isLoading}
                    >
                      <View style={[styles.optionIconContainer, { backgroundColor: option.color + '20' }]}>
                        <Text style={[styles.optionIconText, { color: option.color }]}>{option.icon}</Text>
                      </View>
                      <Text style={styles.optionTitle}>{option.title}</Text>
                      <View style={styles.optionArrow}>
                        <Text style={styles.chevron}>›</Text>
                        {isLoading && <ActivityIndicator size="small" color={option.color} />}
                      </View>
                    </TouchableOpacity>
                  </ElasticScale>
                </ScaleInView>
              ))}
            </View>
          </Card>
        </SlideInView>

        {/* Enhanced Logout Section */}
        <SlideInView direction="up" duration={600} delay={1200}>
          <Card variant="elevated" style={styles.logoutCard}>
            <View style={styles.logoutHeader}>
              <Text style={styles.logoutSectionTitle}>🔐 Account</Text>
            </View>
            <ElasticScale trigger={false} scale={1.02}>
              <TouchableOpacity style={styles.logoutContainer} onPress={handleLogout}>
                <View style={styles.logoutIconContainer}>
                  <Text style={styles.logoutIcon}>🚪</Text>
                </View>
                <View style={styles.logoutContent}>
                  <Text style={styles.logoutTitle}>Sign Out</Text>
                  <Text style={styles.logoutSubtitle}>You can always sign back in anytime</Text>
                </View>
                <View style={styles.logoutArrow}>
                  <Text style={styles.chevron}>›</Text>
                </View>
              </TouchableOpacity>
            </ElasticScale>
          </Card>
        </SlideInView>
      </Container>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.backgroundSecondary,
  },
  
  // Enhanced Header Styles
  headerGradient: {
    backgroundColor: colors.brandTeal,
    borderBottomLeftRadius: spacing.xl,
    borderBottomRightRadius: spacing.xl,
    marginBottom: spacing.l,
    ...shadows.large,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: spacing.l,
    paddingTop: spacing.xl,
    paddingBottom: spacing.l,
  },
  welcomeSection: {
    flex: 1,
  },
  greetingText: {
    ...typography.body,
    color: colors.white,
    opacity: 0.9,
    marginBottom: spacing.xs,
    fontWeight: '500',
  },
  title: {
    ...typography.h1,
    color: colors.white,
    marginBottom: spacing.s,
    fontWeight: '800',
  },
  titleAccent: {
    color: colors.white,
    opacity: 0.9,
  },
  subtitle: {
    ...typography.body,
    color: colors.white,
    opacity: 0.8,
    marginBottom: spacing.m,
  },
  motivationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white + '20',
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    borderRadius: spacing.l,
    alignSelf: 'flex-start',
  },
  motivationIcon: {
    fontSize: 16,
    marginRight: spacing.s,
  },
  motivationText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: '600',
  },
  profileSection: {
    alignItems: 'flex-end',
    gap: spacing.s,
  },
  profileButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.medium,
  },
  profileIcon: {
    fontSize: 20,
    color: colors.brandTeal,
  },
  notificationButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.white + '20',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notificationIcon: {
    fontSize: 20,
    color: colors.white,
  },
  notificationBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    ...typography.captionSmall,
    color: colors.white,
    fontWeight: '700',
    fontSize: 10,
  },
  // Card Styles
  quickActionsCard: {
    marginBottom: spacing.l,
    borderRadius: spacing.xl,
    ...shadows.large,
  },
  sectionHeader: {
    marginBottom: spacing.l,
  },
  sectionTitle: {
    ...typography.h3,
    marginBottom: spacing.xs,
    color: colors.gray900,
    fontWeight: '700',
  },
  sectionSubtitle: {
    ...typography.caption,
    color: colors.gray500,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.m,
    justifyContent: 'space-around',
  },
  actionCard: {
    width: (width - spacing.l * 3 - spacing.m * 2) / 3,
    minHeight: 120,
    borderRadius: spacing.l,
    padding: spacing.l,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.small,
  },
  actionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.s,
    ...shadows.small,
  },
  actionIcon: {
    fontSize: 20,
    color: colors.white,
  },
  actionTitle: {
    ...typography.caption,
    textAlign: 'center',
    color: colors.gray700,
    fontWeight: '600',
  },
  
  // Dashboard Card Styles
  dashboardCard: {
    marginBottom: spacing.l,
    borderRadius: spacing.xl,
    backgroundColor: colors.brandTeal + '10',
    ...shadows.medium,
  },
  dashboardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.l,
  },
  dashboardIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.brandTeal,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.m,
    ...shadows.small,
  },
  dashboardIconText: {
    fontSize: 24,
    color: colors.white,
  },
  dashboardText: {
    flex: 1,
  },
  dashboardTitle: {
    ...typography.labelLarge,
    color: colors.gray900,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  dashboardSubtitle: {
    ...typography.caption,
    color: colors.gray600,
  },
  dashboardButton: {
    backgroundColor: colors.brandTeal,
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.s,
    borderRadius: spacing.l,
    ...shadows.small,
  },
  dashboardButtonText: {
    ...typography.label,
    color: colors.white,
    fontWeight: '600',
  },
  // More Options Styles
  moreOptionsCard: {
    marginBottom: spacing.l,
    borderRadius: spacing.xl,
    ...shadows.large,
  },
  optionsGrid: {
    gap: spacing.s,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.m,
    paddingHorizontal: spacing.l,
    borderRadius: spacing.l,
    backgroundColor: colors.white,
    ...shadows.small,
    marginBottom: spacing.xs,
  },
  optionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.m,
  },
  optionIconText: {
    fontSize: 18,
  },
  optionTitle: {
    ...typography.body,
    flex: 1,
    color: colors.gray700,
    fontWeight: '600',
  },
  optionArrow: {
    width: 24,
    alignItems: 'center',
  },
  chevron: {
    ...typography.h3,
    color: colors.gray400,
    fontWeight: '300',
  },
  
  // Logout Section Styles
  logoutCard: {
    marginTop: spacing.m,
    marginBottom: spacing.xl,
    borderRadius: spacing.xl,
    backgroundColor: colors.white,
    ...shadows.medium,
  },
  logoutHeader: {
    paddingHorizontal: spacing.l,
    paddingTop: spacing.l,
    paddingBottom: spacing.s,
  },
  logoutSectionTitle: {
    ...typography.labelLarge,
    color: colors.gray900,
    fontWeight: '700',
  },
  logoutContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.m,
    borderRadius: spacing.l,
    marginHorizontal: spacing.l,
    marginBottom: spacing.l,
    backgroundColor: colors.danger + '10',
  },
  logoutIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.danger + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.m,
  },
  logoutIcon: {
    fontSize: 18,
    color: colors.danger,
  },
  logoutContent: {
    flex: 1,
  },
  logoutTitle: {
    ...typography.body,
    color: colors.danger,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  logoutSubtitle: {
    ...typography.caption,
    color: colors.danger,
    opacity: 0.8,
  },
  logoutArrow: {
    width: 24,
    alignItems: 'center',
  },
  
  // Loading and disabled states
  disabledCard: {
    opacity: 0.7,
    transform: [{ scale: 0.95 }],
  },
  loadingIndicator: {
    position: 'absolute',
    top: '50%',
    right: 8,
    transform: [{ translateY: -10 }],
  },
  profileLoadingIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
  },
  headerLoadingIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
  },
});

export default HomeScreen;
