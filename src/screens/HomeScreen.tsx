import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, StatusBar, Dimensions, ScrollView, RefreshControl } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Container from '../components/ui/Container';
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
import { clearToken, getToken } from '../services/auth';
import { 
  getUserTotalSavingsApi, 
  getUserGroupsApi, 
  getUserContributionsApi, 
  getUserContributionsByGroupApi,
  getCurrentUserApi,
  debugTotalSavingsApi,
  api 
} from '../services/api';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';

const { width } = Dimensions.get('window');
const STAT_CARD_WIDTH = Math.floor(width * 0.78);

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const [greeting, setGreeting] = useState('');
  const [userName, setUserName] = useState('User');
  const [isLoading, setIsLoading] = useState(false);
  const [financialData, setFinancialData] = useState({
    totalSavings: 0,
    activeGroups: 0,
    thisMonthContribution: 0,
    totalContribution: 0
  });
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting('Good Morning');
    } else if (hour < 17) {
      setGreeting('Good Afternoon');
    } else {
      setGreeting('Good Evening');
    }
    
    // Load user data and financial overview on component mount
    loadUserData();
    loadFinancialOverview();
  }, []);

  const loadUserData = async () => {
    try {
      console.log('👤 Loading user data using website API structure...');
      
      // Try direct API call like website
      const userResponse = await api.get('/api/auth/me');
      console.log('✅ User API Response (direct):', {
        status: userResponse.status,
        data: userResponse.data,
        keys: Object.keys(userResponse.data || {})
      });
      
      if (userResponse.data?.user?.name || userResponse.data?.name) {
        setUserName(userResponse.data?.user?.name || userResponse.data?.name);
        console.log('📦 User name set:', userResponse.data?.user?.name || userResponse.data?.name);
      }
    } catch (error) {
      console.error('❌ Failed to load user data (direct API):', {
        message: (error as any)?.message,
        status: (error as any)?.status,
        response: (error as any)?.response?.data
      });
      
      // Fallback to wrapper function
      try {
        console.log('🔄 Trying user data fallback...');
        const fallbackResponse = await getCurrentUserApi();
        if (fallbackResponse.data?.user?.name || fallbackResponse.data?.name) {
          setUserName(fallbackResponse.data?.user?.name || fallbackResponse.data?.name);
        }
      } catch (fallbackError) {
        console.error('❌ User data fallback also failed:', fallbackError);
      }
    }
  };

  const loadFinancialOverview = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      }
      
      console.log('🔄 Loading financial overview...');
      
      // Check authentication status first
      const token = await getToken();
      console.log('🔑 Current auth token:', token ? 'Present' : 'Missing');
      console.log('🔑 Token length:', token?.length || 0);
      
      if (!token) {
        console.error('❌ No authentication token found!');
        Alert.alert(
          'Authentication Error',
          'Please log in again to view your financial data.',
          [{ text: 'OK' }]
        );
        return;
      }
      
      // Run debug function to test all endpoints
      await debugTotalSavingsApi();
      
      // Get total savings with multiple fallbacks using exact website API structure
      let totalSavings = 0;
      try {
        console.log('📊 Fetching total savings using website API structure...');
        
        // Try the exact same endpoint as website
        const totalSavingsRes = await api.get('/api/transactions/user/total-savings');
        console.log('✅ Total Savings API Response (direct):', {
          status: totalSavingsRes.status,
          data: totalSavingsRes.data,
          keys: Object.keys(totalSavingsRes.data || {})
        });
        
        // Extract total savings using correct backend structure
        totalSavings = totalSavingsRes.data?.data?.total_savings || 
                      totalSavingsRes.data?.total_savings || 
                      totalSavingsRes.data?.data?.totalSavings || 
                      totalSavingsRes.data?.totalSavings || 0;
        
        console.log('💰 Extracted total savings:', totalSavings);
      } catch (error) {
        console.error('❌ Failed to fetch total savings (direct API):', {
          message: (error as any)?.message,
          status: (error as any)?.status,
          response: (error as any)?.response?.data
        });
        
        // Fallback to wrapper function
        try {
          console.log('🔄 Trying fallback with wrapper function...');
          const fallbackRes = await getUserTotalSavingsApi();
          totalSavings = fallbackRes.data?.data?.total_savings || 
                        fallbackRes.data?.total_savings || 
                        fallbackRes.data?.data?.totalSavings || 
                        fallbackRes.data?.totalSavings || 0;
          console.log('✅ Fallback total savings:', totalSavings);
        } catch (fallbackError) {
          console.error('❌ Fallback also failed:', fallbackError);
        }
      }
      
      // Get user groups using exact website API structure
      let activeGroups = 0;
      try {
        console.log('👥 Fetching user groups using website API structure...');
        
        // Try the exact same endpoint as website
        const groupsRes = await api.get('/api/groups/my-groups');
        console.log('✅ Groups API Response (direct):', {
          status: groupsRes.status,
          data: groupsRes.data,
          keys: Object.keys(groupsRes.data || {})
        });
        
        const groups = groupsRes.data?.data?.groups || groupsRes.data?.groups || [];
        activeGroups = groups.filter(group => group.status === 'active' || !group.status).length;
        
        console.log('🏘️ Active groups count:', activeGroups);
      } catch (error) {
        console.error('❌ Failed to fetch groups (direct API):', {
          message: (error as any)?.message,
          status: (error as any)?.status,
          response: (error as any)?.response?.data
        });
        
        // Fallback to wrapper function
        try {
          console.log('🔄 Trying fallback with wrapper function...');
          const fallbackRes = await getUserGroupsApi();
          const fallbackGroups = fallbackRes.data?.data?.groups || fallbackRes.data?.groups || [];
          activeGroups = fallbackGroups.length;
          console.log('✅ Fallback active groups:', activeGroups);
        } catch (fallbackError) {
          console.error('❌ Fallback also failed:', fallbackError);
        }
      }
      
      // Get contributions with multiple fallbacks
      let thisMonthContribution = 0;
      let totalContribution = 0;
      
      // Try regular contributions using exact website API structure
      try {
        console.log('💳 Fetching user contributions using website API structure...');
        
        // Try the exact same endpoint as website
        const contributionsRes = await api.get('/api/transactions/user/contributions');
        console.log('✅ Contributions API Response (direct):', {
          status: contributionsRes.status,
          data: contributionsRes.data,
          keys: Object.keys(contributionsRes.data || {})
        });
        
        const contributions = contributionsRes.data?.data?.contributions || 
                             contributionsRes.data?.contributions || 
                             contributionsRes.data || [];
        
        console.log('📋 Contributions data:', contributions);
        
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        
        contributions.forEach((contribution: any) => {
          const amount = contribution.total_amount || contribution.amount || 0;
          totalContribution += amount;
          
          // Check if contribution is from this month
          if (contribution.created_at) {
            const contributionDate = new Date(contribution.created_at);
            if (contributionDate.getMonth() === currentMonth && 
                contributionDate.getFullYear() === currentYear) {
              thisMonthContribution += amount;
            }
          }
        });
        
        console.log('💸 Calculated contributions:', {
          thisMonth: thisMonthContribution,
          total: totalContribution
        });
      } catch (error) {
        console.error('❌ Failed to fetch contributions (direct API):', {
          message: (error as any)?.message,
          status: (error as any)?.status,
          response: (error as any)?.response?.data
        });
        
        // Fallback: try wrapper function
        try {
          console.log('🔄 Trying fallback with wrapper function...');
          const fallbackRes = await getUserContributionsApi();
          const fallbackContributions = fallbackRes.data?.data?.contributions || 
                                       fallbackRes.data?.contributions || [];
          
          fallbackContributions.forEach((contribution: any) => {
            const amount = contribution.total_amount || contribution.amount || 0;
            totalContribution += amount;
            
            if (contribution.created_at) {
              const contributionDate = new Date(contribution.created_at);
              const currentMonth = new Date().getMonth();
              const currentYear = new Date().getFullYear();
              
              if (contributionDate.getMonth() === currentMonth && 
                  contributionDate.getFullYear() === currentYear) {
                thisMonthContribution += amount;
              }
            }
          });
        } catch (fallbackError) {
          console.error('❌ Fallback wrapper also failed:', fallbackError);
          
          // Final fallback: try contributions by group
          try {
            console.log('🔄 Trying final fallback: contributions by group...');
            const contributionsByGroupRes = await getUserContributionsByGroupApi();
            console.log('✅ Contributions by Group Response:', {
              status: contributionsByGroupRes.status,
              data: contributionsByGroupRes.data
            });
            
            const contributionsByGroup = contributionsByGroupRes.data?.data?.contributions || 
                                        contributionsByGroupRes.data?.contributions || [];
            
            contributionsByGroup.forEach((contribution: any) => {
              const amount = contribution.total_amount || contribution.amount || 0;
              totalContribution += amount;
              
              // For monthly calculations, we'll use current month
              if (contribution.created_at) {
                const contributionDate = new Date(contribution.created_at);
                const currentMonth = new Date().getMonth();
                const currentYear = new Date().getFullYear();
                
                if (contributionDate.getMonth() === currentMonth && 
                    contributionDate.getFullYear() === currentYear) {
                  thisMonthContribution += amount;
                }
              }
            });
          } catch (finalFallbackError) {
            console.error('❌ All fallbacks failed:', finalFallbackError);
          }
        }
      }
      
      // Check if we received valid data or if APIs failed
      console.log('🔍 Final data check before setting state:', {
        totalSavings,
        activeGroups,
        thisMonthContribution,
        totalContribution
      });
      
      if (totalSavings === 0 && activeGroups === 0 && totalContribution === 0) {
        console.log('⚠️ All APIs returned zero data - checking if user has actual data or auth issue');
        
        // Don't show mock data - show the real zeros and let user know
        setFinancialData({
          totalSavings: 0,
          activeGroups: 0,
          thisMonthContribution: 0,
          totalContribution: 0
        });
        
        console.log('📊 Setting real zero data - user may not have made any contributions yet');
      } else {
        console.log('✅ Setting financial data:', {
          totalSavings,
          activeGroups,
          thisMonthContribution,
          totalContribution
        });
        
        setFinancialData({
          totalSavings,
          activeGroups,
          thisMonthContribution,
          totalContribution
        });
      }
      
    } catch (error) {
      console.error('Failed to load financial overview:', error);
      // Keep existing data if refresh fails
    } finally {
      if (isRefresh) {
        setRefreshing(false);
      }
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            try {
              await clearToken();
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              });
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Error', 'Failed to logout. Please try again.');
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  const quickActions = [
    {
      id: 'groups',
      title: 'My Groups',
      subtitle: 'Manage savings groups',
      icon: '👥',
      color: colors.brandTeal,
      onPress: () => navigation.navigate('Groups'),
      functional: true
    },
    {
      id: 'totalSavings',
      title: 'Total Savings',
      subtitle: 'View all savings',
      icon: '💰',
      color: colors.success,
      onPress: () => navigation.navigate('TotalSavings'),
      functional: true
    },
    {
      id: 'joinRequests',
      title: 'Join Requests',
      subtitle: 'Manage group requests',
      icon: '📋',
      color: colors.warning,
      onPress: () => navigation.navigate('JoinRequests'),
      functional: true
    },
    {
      id: 'loans',
      title: 'Loans',
      subtitle: 'Request & manage loans',
      icon: '🏦',
      color: colors.info,
      onPress: () => navigation.navigate('Loans'),
      functional: true
    },
    {
      id: 'analytics',
      title: 'Analytics',
      subtitle: 'View financial insights',
      icon: '📊',
      color: colors.analytics,
      onPress: () => navigation.navigate('Analytics'),
      functional: true
    },
    {
      id: 'transactions',
      title: 'Transactions',
      subtitle: 'Transaction history',
      icon: '💳',
      color: colors.secondary,
      onPress: () => navigation.navigate('Transactions'),
      functional: true
    }
  ];

  const stats = [
    {
      title: 'Total Savings',
      value: `₹${financialData.totalSavings.toLocaleString()}`,
      subtitle: 'Investment in all groups',
      icon: '💰',
      color: colors.success,
      change: financialData.totalSavings > 0 ? 'Growing' : 'Start saving',
      changeType: financialData.totalSavings > 0 ? 'positive' : 'neutral'
    },
    {
      title: 'Active Groups',
      value: financialData.activeGroups.toString(),
      subtitle: 'Groups you invest in',
      icon: '👥',
      color: colors.brandTeal,
      change: financialData.activeGroups > 0 ? `${financialData.activeGroups} groups` : 'Join a group',
      changeType: financialData.activeGroups > 0 ? 'positive' : 'neutral'
    },
    {
      title: 'This Month',
      value: `₹${financialData.thisMonthContribution.toLocaleString()}`,
      subtitle: 'Total contribution',
      icon: '📅',
      color: colors.info,
      change: financialData.thisMonthContribution > 0 ? 'Contributed' : 'No contributions',
      changeType: financialData.thisMonthContribution > 0 ? 'positive' : 'neutral'
    },
    {
      title: 'All-time Total',
      value: `₹${financialData.totalContribution.toLocaleString()}`,
      subtitle: 'Total contributions made',
      icon: '🎯',
      color: colors.warning,
      change: financialData.totalContribution > 0 ? 'Lifetime total' : 'Start contributing',
      changeType: financialData.totalContribution > 0 ? 'positive' : 'neutral'
    }
  ];

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#0D7377" translucent />
      <ScrollView 
        style={styles.screenContainer} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadFinancialOverview(true)}
            colors={[colors.brandTeal]}
            tintColor={colors.white}
          />
        }
      >
        {/* Card-like Header with Curved Edges */}
        <View style={styles.headerCardWrapper}>
          <LinearGradient
            colors={['#0D7377', '#14A085', '#41B3A3', '#85D4C8']}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
            style={styles.cardLikeHeaderContainer}
          >
            {/* Glass morphism overlay for premium feel */}
            <LinearGradient
              colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)', 'transparent']}
              style={styles.fullGlassOverlay}
            />
            
            {/* App Name at Top */}
            <View style={styles.appNameSection}>
              <Text style={styles.premiumAppNameText}>DigiBachat</Text>
            </View>
            
            {/* Main Header Content */}
            <View style={styles.mainHeaderContent}>
              <View style={styles.leftContent}>
                <Text style={styles.premiumWelcomeText}>Welcome back!</Text>
                <View style={styles.brandNameRow}>
                  <Text style={styles.premiumDigiText}>Digi </Text>
                  <Text style={styles.premiumBachatText}>बचत</Text>
                </View>
                <Text style={styles.premiumQuestionText}>What would you like to do today?</Text>
              </View>
              
              <View style={styles.rightContent}>
                <TouchableOpacity 
                  onPress={() => navigation.navigate('Groups')}
                  activeOpacity={0.8}
                  style={styles.profileButton}
                >
                  <LinearGradient
                    colors={['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.1)']}
                    style={styles.premiumProfileCircle}
                  >
                    <View style={styles.profileIconCore}>
                      <Text style={styles.profileEmoji}>👤</Text>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
            
          </LinearGradient>
        </View>

        <Container style={styles.content}>
          {/* Ultra Premium Stats Cards */}
          <SlideInView delay={300}>
            <View style={styles.statsContainer}>
              <View style={styles.sectionHeader}>
                <LinearGradient
                  colors={['#667eea', '#764ba2']}
                  style={styles.sectionIconGradient}
                >
                  <Text style={styles.sectionIconText}>📊</Text>
                </LinearGradient>
                <View>
                  <Text style={styles.sectionTitle}>Financial Overview</Text>
                  <Text style={styles.sectionSubtitle}>Your progress at a glance</Text>
                </View>
              </View>
              
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.statsScrollContent}
                style={styles.statsScrollView}
                decelerationRate="fast"
                snapToAlignment="start"
                snapToInterval={STAT_CARD_WIDTH + spacing.m}
                disableIntervalMomentum
              >
                {stats.map((stat, index) => (
                  <ScaleInView key={stat.title} delay={400 + index * 100}>
                    <View style={[styles.statCardWrapper, { width: STAT_CARD_WIDTH }]}>
                      <LinearGradient
                        colors={[stat.color, `${stat.color}CC`, `${stat.color}99`]}
                        start={{x: 0, y: 0}}
                        end={{x: 1, y: 1}}
                        style={styles.premiumStatCard}
                      >
                        {/* Glass morphism overlay */}
                        <View style={styles.statCardGlass} />
                        
                        {/* Floating icon */}
                        <View style={styles.statIconFloating}>
                          <LinearGradient
                            colors={['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.1)']}
                            style={styles.statIconContainer}
                          >
                            <Text style={styles.statIcon}>{stat.icon}</Text>
                          </LinearGradient>
                        </View>
                        
                        {/* Content */}
                        <View style={styles.statCardContent}>
                          <Text style={styles.statValue}>{stat.value}</Text>
                          <Text style={styles.statTitle}>{stat.title}</Text>
                          <Text style={styles.statSubtitle}>{stat.subtitle}</Text>
                          
                          {/* Change indicator */}
                          <LinearGradient
                            colors={stat.changeType === 'positive' 
                              ? ['rgba(76, 217, 100, 0.3)', 'rgba(76, 217, 100, 0.1)'] 
                              : ['rgba(255, 59, 48, 0.3)', 'rgba(255, 59, 48, 0.1)']
                            }
                            style={styles.changeIndicator}
                          >
                            <Text style={[styles.changeText, {
                              color: stat.changeType === 'positive' ? '#4CD964' : '#FF3B30'
                            }]}>
                              {stat.changeType === 'positive' ? '↗' : '↘'} {stat.change}
                            </Text>
                          </LinearGradient>
                        </View>
                        
                        {/* Decorative elements */}
                        <View style={styles.statCardDecoration1} />
                        <View style={styles.statCardDecoration2} />
                      </LinearGradient>
                    </View>
                  </ScaleInView>
                ))}
              </ScrollView>
            </View>
          </SlideInView>
          
          {/* Revolutionary Action Cards Grid */}
          <SlideInView delay={500}>
            <View style={styles.actionsContainer}>
              <View style={styles.sectionHeader}>
                <LinearGradient
                  colors={['#ff9a9e', '#fecfef', '#fecfef']}
                  style={styles.sectionIconGradient}
                >
                  <Text style={styles.sectionIconText}>⚡</Text>
                </LinearGradient>
                <View>
                  <Text style={styles.sectionTitle}>Quick Actions</Text>
                  <Text style={styles.sectionSubtitle}>Powerful tools at your fingertips</Text>
                </View>
              </View>
              
              <View style={styles.actionsGrid}>
                {quickActions.map((action, index) => (
                  <ScaleInView key={action.id} delay={600 + index * 75}>
                    <TouchableOpacity
                      onPress={action.onPress}
                      activeOpacity={0.85}
                      disabled={isLoading}
                      style={styles.actionCardWrapper}
                    >
                      <LinearGradient
                        colors={[
                          action.color, 
                          `${action.color}F0`,
                          `${action.color}E0`
                        ]}
                        start={{x: 0, y: 0}}
                        end={{x: 1.2, y: 1.2}}
                        style={styles.revolutionaryActionCard}
                      >
                        {/* Premium glass effect */}
                        <LinearGradient
                          colors={[
                            'rgba(255,255,255,0.25)', 
                            'rgba(255,255,255,0.1)',
                            'transparent'
                          ]}
                          style={styles.actionCardGlass}
                        />
                        
                        {/* Floating icon with premium ring */}
                        <View style={styles.premiumActionIconWrapper}>
                          <LinearGradient
                            colors={['rgba(255,255,255,0.4)', 'rgba(255,255,255,0.2)']}
                            style={styles.actionIconRing}
                          >
                            <LinearGradient
                              colors={['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.7)']}
                              style={styles.actionIconCore}
                            >
                              <Text style={styles.premiumActionIcon}>{action.icon}</Text>
                            </LinearGradient>
                          </LinearGradient>
                          
                          {/* Icon glow */}
                          <View style={styles.iconGlowEffect} />
                        </View>
                        
                        {/* Premium content layout */}
                        <View style={styles.premiumActionContent}>
                          <Text style={styles.premiumActionTitle}>{action.title}</Text>
                          <Text style={styles.premiumActionSubtitle}>{action.subtitle}</Text>
                        </View>
                        
                        {/* Premium arrow with animation hint */}
                        <LinearGradient
                          colors={['rgba(255,255,255,0.8)', 'rgba(255,255,255,0.4)']}
                          style={styles.premiumActionArrow}
                        >
                          <Text style={styles.premiumActionArrowText}>→</Text>
                        </LinearGradient>
                        
                        {/* Multiple decoration layers */}
                        <View style={styles.actionDecoration1} />
                        <View style={styles.actionDecoration2} />
                        <View style={styles.actionDecoration3} />
                        
                        {/* Shimmer effect */}
                        <LinearGradient
                          colors={[
                            'transparent',
                            'rgba(255,255,255,0.1)',
                            'transparent'
                          ]}
                          start={{x: 0, y: 0}}
                          end={{x: 1, y: 1}}
                          style={styles.shimmerEffect}
                        />
                      </LinearGradient>
                    </TouchableOpacity>
                  </ScaleInView>
                ))}
              </View>
            </View>
          </SlideInView>

          {/* Revolutionary Welcome Card */}
          <SlideInView delay={800}>
            <View style={styles.welcomeCardWrapper}>
              <LinearGradient
                colors={['#667eea', '#764ba2', '#f093fb', '#f5576c']}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 1}}
                style={styles.revolutionaryWelcomeCard}
              >
                {/* Premium glass overlay */}
                <LinearGradient
                  colors={[
                    'rgba(255,255,255,0.15)', 
                    'rgba(255,255,255,0.05)',
                    'transparent'
                  ]}
                  style={styles.welcomeCardGlass}
                />
                
                {/* Floating decorations */}
                <View style={styles.welcomeDecoration1} />
                <View style={styles.welcomeDecoration2} />
                <View style={styles.welcomeDecoration3} />
                
                <View style={styles.revolutionaryWelcomeContent}>
                  {/* Premium icon with multiple layers */}
                  <View style={styles.welcomeIconWrapper}>
                    <LinearGradient
                      colors={['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.1)']}
                      style={styles.welcomeIconRing}
                    >
                      <LinearGradient
                        colors={['rgba(255,255,255,0.95)', 'rgba(255,255,255,0.85)']}
                        style={styles.revolutionaryWelcomeIconContainer}
                      >
                        <Text style={styles.revolutionaryWelcomeIcon}>🚀</Text>
                      </LinearGradient>
                    </LinearGradient>
                    <View style={styles.welcomeIconGlow} />
                  </View>
                  
                  <Text style={styles.revolutionaryWelcomeTitle}>Begin Your Wealth Journey</Text>
                  <Text style={styles.revolutionaryWelcomeText}>
                    ✨ Create or join savings groups with friends and family. Build financial security together and achieve your dreams faster than ever!
                  </Text>
                  
                  {/* Premium action buttons */}
                  <View style={styles.revolutionaryWelcomeActions}>
                    <TouchableOpacity 
                      onPress={() => navigation.navigate('JoinGroup')}
                      activeOpacity={0.85}
                      style={styles.revolutionaryWelcomeButtonWrapper}
                    >
                      <LinearGradient
                        colors={['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.7)']}
                        start={{x: 0, y: 0}}
                        end={{x: 1, y: 0}}
                        style={styles.revolutionaryWelcomeButton}
                      >
                        <View style={styles.welcomeButtonContent}>
                          <Text style={styles.welcomeButtonIcon}>👥</Text>
                          <Text style={styles.revolutionaryWelcomeButtonText}>Join Group</Text>
                        </View>
                        <View style={styles.welcomeButtonShine} />
                      </LinearGradient>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      onPress={() => navigation.navigate('CreateGroup')}
                      activeOpacity={0.85}
                      style={styles.revolutionaryWelcomeButtonWrapper}
                    >
                      <LinearGradient
                        colors={['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.7)']}
                        start={{x: 0, y: 0}}
                        end={{x: 1, y: 0}}
                        style={styles.revolutionaryWelcomeButton}
                      >
                        <View style={styles.welcomeButtonContent}>
                          <Text style={styles.welcomeButtonIcon}>✨</Text>
                          <Text style={styles.revolutionaryWelcomeButtonText}>Create Group</Text>
                        </View>
                        <View style={styles.welcomeButtonShine} />
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                </View>
              </LinearGradient>
            </View>
          </SlideInView>

          {/* Logout Button */}
          <SlideInView delay={700}>
            <PrimaryButton
              title={isLoading ? 'Logging out...' : 'Logout'}
              onPress={handleLogout}
              variant="outline"
              loading={isLoading}
              disabled={isLoading}
              style={styles.logoutButton}
            />
          </SlideInView>
        </Container>
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
  },
  headerCardWrapper: {
    paddingHorizontal: spacing.m,
    paddingTop: spacing.xxl + 20,
    paddingBottom: spacing.m,
  },
  cardLikeHeaderContainer: {
    borderRadius: spacing.xl + 5,
    paddingTop: spacing.l,
    paddingBottom: spacing.xl,
    paddingHorizontal: 0,
    overflow: 'hidden',
    position: 'relative',
    minHeight: 180,
    ...shadows.xlarge,
  },
  scrollContainer: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
  },
  fullGlassOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  appNameSection: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.m,
    zIndex: 2,
  },
  premiumAppNameText: {
    ...typography.bodyLarge,
    color: colors.white,
    fontWeight: '700',
    fontSize: 16,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  mainHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: spacing.xl,
    zIndex: 2,
  },
  leftContent: {
    flex: 1,
  },
  rightContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  premiumWelcomeText: {
    ...typography.body,
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    marginBottom: spacing.xs,
  },
  brandNameRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: spacing.s,
  },
  premiumDigiText: {
    ...typography.h1,
    color: colors.white,
    fontWeight: '800',
    fontSize: 28,
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  premiumBachatText: {
    ...typography.h1,
    color: '#FFE66D',
    fontWeight: '800',
    fontSize: 28,
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  premiumQuestionText: {
    ...typography.body,
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
  },
  profileButton: {
    padding: spacing.xs,
  },
  premiumProfileCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.large,
  },
  profileIconCore: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileEmoji: {
    fontSize: 18,
    color: colors.brandTeal,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.l,
  },
  actionsContainer: {
    marginBottom: spacing.l,
  },
  sectionHeader: {
    marginBottom: spacing.m,
    paddingHorizontal: spacing.s,
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.gray900,
    marginBottom: spacing.xs,
  },
  sectionSubtitle: {
    ...typography.caption,
    color: colors.gray600,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.m,
    justifyContent: 'space-between',
  },
  actionCardWrapper: {
    width: (width - spacing.l * 2 - spacing.m * 2) / 3,
  },
  actionCard: {
    height: 140, // Changed from minHeight to fixed height
    borderRadius: spacing.xl,
    padding: spacing.l,
    alignItems: 'center',
    justifyContent: 'space-between', // Changed to space-between for better layout
    ...shadows.large,
    position: 'relative',
    overflow: 'hidden',
  },
  actionGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: spacing.xl,
  },
  actionIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.s,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    ...shadows.medium,
  },
  actionIcon: {
    fontSize: 24,
    color: colors.white,
  },
  actionContent: {
    flex: 1,
    alignItems: 'center', // Center align the text
    justifyContent: 'center', // Center vertically
    paddingVertical: spacing.xs, // Add some padding
  },
  actionTitle: {
    ...typography.body,
    color: colors.white,
    fontWeight: '600',
    marginBottom: spacing.xs,
    textAlign: 'center', // Center align title
    fontSize: 14, // Ensure consistent font size
  },
  actionSubtitle: {
    ...typography.caption,
    color: colors.white,
    opacity: 0.9,
    textAlign: 'center', // Center align subtitle
    fontSize: 11, // Ensure consistent font size
    lineHeight: 14, // Control line height for consistency
  },
  actionArrow: {
    position: 'absolute',
    top: 0,
    right: 0,
    padding: spacing.xs,
  },
  actionArrowText: {
    fontSize: 16,
    color: colors.white,
  },
  welcomeCard: {
    marginBottom: spacing.l,
    borderRadius: spacing.xxl,
    padding: spacing.xl,
    margin: spacing.m,
    ...shadows.xlarge,
  },
  welcomeContent: {
    flex: 1,
  },
  welcomeIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.m,
    ...shadows.medium,
    alignSelf: 'center',
  },
  welcomeIcon: {
    fontSize: 28,
    color: colors.white,
  },
  welcomeTitle: {
    ...typography.h2,
    color: colors.gray900,
    fontWeight: '800',
    marginBottom: spacing.m,
    textAlign: 'center',
  },
  welcomeText: {
    ...typography.bodyLarge,
    color: colors.gray700,
    marginBottom: spacing.xl,
    textAlign: 'center',
    lineHeight: 26,
  },
  welcomeActions: {
    gap: spacing.m,
  },
  welcomeButton: {
    paddingVertical: spacing.m,
    paddingHorizontal: spacing.xl,
    borderRadius: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.medium,
  },
  welcomeButtonText: {
    ...typography.button,
    color: colors.white,
    fontWeight: '700',
  },
  logoutButton: {
    width: '100%',
    marginBottom: spacing.xl,
  },
  
  
  // Premium Stats Cards
  statsContainer: {
    marginBottom: spacing.xl,
  },
  sectionIconGradient: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.m,
    ...shadows.medium,
  },
  sectionIconText: {
    fontSize: 24,
    color: colors.white,
  },
  statsScrollView: {
    marginTop: spacing.m,
  },
  statsScrollContent: {
    paddingHorizontal: spacing.m,
    gap: spacing.m,
  },
  statCardWrapper: {
    // width is set dynamically for snap-to scrolling
  },
  premiumStatCard: {
    borderRadius: spacing.xl,
    padding: spacing.xl,
    position: 'relative',
    overflow: 'hidden',
    minHeight: 180,
    ...shadows.xlarge,
  },
  statCardGlass: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: spacing.xl,
  },
  statIconFloating: {
    position: 'absolute',
    top: spacing.m,
    right: spacing.m,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statIcon: {
    fontSize: 20,
    color: colors.white,
  },
  statCardContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  statValue: {
    ...typography.h1,
    color: colors.white,
    fontWeight: '900',
    fontSize: 32,
    marginBottom: spacing.xs,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  statTitle: {
    ...typography.bodyLarge,
    color: colors.white,
    fontWeight: '700',
    marginBottom: spacing.xs,
    opacity: 0.95,
  },
  statSubtitle: {
    ...typography.caption,
    color: colors.white,
    opacity: 0.8,
    marginBottom: spacing.m,
  },
  changeIndicator: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.s,
    paddingVertical: spacing.xs,
    borderRadius: spacing.s,
  },
  changeText: {
    ...typography.caption,
    fontWeight: '700',
    fontSize: 12,
  },
  statCardDecoration1: {
    position: 'absolute',
    top: -20,
    left: -20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  statCardDecoration2: {
    position: 'absolute',
    bottom: -15,
    right: -15,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  
  // Revolutionary Action Cards
  revolutionaryActionCard: {
    height: 180,
    borderRadius: spacing.xl,
    padding: spacing.l,
    position: 'relative',
    overflow: 'hidden',
    ...shadows.xlarge,
  },
  actionCardGlass: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: spacing.xl,
  },
  premiumActionIconWrapper: {
    alignItems: 'center',
    marginBottom: spacing.m,
    position: 'relative',
  },
  actionIconRing: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.large,
  },
  actionIconCore: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  premiumActionIcon: {
    fontSize: 28,
    color: colors.brandTeal,
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  iconGlowEffect: {
    position: 'absolute',
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255,255,255,0.1)',
    top: -3,
    opacity: 0.6,
  },
  premiumActionContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  premiumActionTitle: {
    ...typography.bodyLarge,
    color: colors.white,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: spacing.xs,
    fontSize: 16,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  premiumActionSubtitle: {
    ...typography.caption,
    color: colors.white,
    opacity: 0.9,
    textAlign: 'center',
    fontSize: 12,
    lineHeight: 16,
  },
  premiumActionArrow: {
    position: 'absolute',
    top: spacing.m,
    right: spacing.m,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.small,
  },
  premiumActionArrowText: {
    fontSize: 16,
    color: colors.brandTeal,
    fontWeight: '800',
  },
  actionDecoration1: {
    position: 'absolute',
    bottom: -10,
    left: -10,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  actionDecoration2: {
    position: 'absolute',
    top: -5,
    left: spacing.l,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  actionDecoration3: {
    position: 'absolute',
    bottom: spacing.l,
    right: -5,
    width: 25,
    height: 25,
    borderRadius: 12.5,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  shimmerEffect: {
    position: 'absolute',
    top: 0,
    left: -width,
    width: width,
    height: '100%',
  },
  
  // Revolutionary Welcome Card
  welcomeCardWrapper: {
    marginBottom: spacing.xl,
    marginHorizontal: spacing.m,
  },
  revolutionaryWelcomeCard: {
    borderRadius: spacing.xxl,
    padding: spacing.xxl,
    position: 'relative',
    overflow: 'hidden',
    ...shadows.xlarge,
  },
  welcomeCardGlass: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: spacing.xxl,
  },
  welcomeDecoration1: {
    position: 'absolute',
    top: -30,
    right: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  welcomeDecoration2: {
    position: 'absolute',
    bottom: -20,
    left: -20,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  welcomeDecoration3: {
    position: 'absolute',
    top: '50%',
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  revolutionaryWelcomeContent: {
    alignItems: 'center',
  },
  welcomeIconWrapper: {
    marginBottom: spacing.l,
    position: 'relative',
  },
  welcomeIconRing: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.xlarge,
  },
  revolutionaryWelcomeIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  revolutionaryWelcomeIcon: {
    fontSize: 36,
    color: colors.brandTeal,
  },
  welcomeIconGlow: {
    position: 'absolute',
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(255,255,255,0.1)',
    top: -5,
    left: -5,
    opacity: 0.5,
  },
  revolutionaryWelcomeTitle: {
    ...typography.h2,
    color: colors.white,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: spacing.m,
    fontSize: 24,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  revolutionaryWelcomeText: {
    ...typography.bodyLarge,
    color: colors.white,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 26,
    opacity: 0.95,
    fontSize: 16,
  },
  revolutionaryWelcomeActions: {
    gap: spacing.m,
    width: '100%',
  },
  revolutionaryWelcomeButtonWrapper: {
    width: '100%',
  },
  revolutionaryWelcomeButton: {
    paddingVertical: spacing.l,
    paddingHorizontal: spacing.xl,
    borderRadius: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    ...shadows.large,
  },
  welcomeButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.s,
  },
  welcomeButtonIcon: {
    fontSize: 20,
  },
  revolutionaryWelcomeButtonText: {
    ...typography.button,
    color: colors.brandTeal,
    fontWeight: '800',
    fontSize: 16,
  },
  welcomeButtonShine: {
    position: 'absolute',
    top: 0,
    left: -width,
    width: width,
    height: '100%',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  decorativeCircle1: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: colors.brandTeal,
    opacity: 0.2,
  },
  decorativeCircle2: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: colors.brandTealDark,
    opacity: 0.2,
  },
  decorativeCircle3: {
    position: 'absolute',
    top: 50,
    left: 50,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.success,
    opacity: 0.1,
  },
  floatingElement1: {
    position: 'absolute',
    top: 100,
    left: 100,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.info,
    opacity: 0.1,
  },
  floatingElement2: {
    position: 'absolute',
    bottom: 100,
    right: 100,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.warning,
    opacity: 0.1,
  },
  sparkle1: {
    position: 'absolute',
    top: 60,
    right: 40,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.white,
    opacity: 0.8,
  },
  sparkle2: {
    position: 'absolute',
    top: 120,
    left: 60,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.brandTealLight,
    opacity: 0.9,
  },
  sparkle3: {
    position: 'absolute',
    bottom: 80,
    left: 40,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.success,
    opacity: 0.7,
  },
});

export default HomeScreen;
