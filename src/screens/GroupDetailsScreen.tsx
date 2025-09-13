import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Alert, StatusBar, TouchableOpacity, ScrollView, Dimensions, Animated } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Container from '../components/ui/Container';
import Card from '../components/ui/Card';
import PrimaryButton from '../components/ui/PrimaryButton';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { getGroupApi, getGroupMembersApi } from '../services/api';
import { upiService } from '../services/upiService';
import UPISetupModal from '../components/modals/UPISetupModal';
import { colors, typography, spacing, shadows } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'GroupDetails'>;

const GroupDetailsScreen: React.FC<Props> = ({ route, navigation }) => {
  const { groupId } = route.params as any;
  const [loading, setLoading] = useState(true);
  const [group, setGroup] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [isLeader, setIsLeader] = useState<boolean>(false);
  const [showUPISetupModal, setShowUPISetupModal] = useState(false);
  const [groupUpiDetails, setGroupUpiDetails] = useState<{ upiId: string; upiName: string } | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [groupRes, membersRes, upiDetailsRes] = await Promise.all([
          getGroupApi(groupId),
          getGroupMembersApi(groupId),
          upiService.getGroupUPIDetails(groupId.toString()),
        ]);
        
        // Enhanced mock data for better UI demonstration
        const mockGroup = {
          id: groupId,
          name: 'Family Savings Circle',
          description: 'Monthly family savings for our dream vacation',
          total_savings: 125000,
          target_amount: 200000,
          monthly_contribution: 5000,
          member_count: 8,
          created_at: '2024-01-15',
          next_contribution_date: '2024-02-15',
          is_leader: true,
          status: 'active'
        };
        
        const mockMembers = [
          { id: 1, user_name: 'Rajesh Kumar', user_email: 'rajesh@email.com', is_leader: true, status: 'active', contribution_amount: 5000, last_contribution: '2024-01-15', avatar: '👨‍💼' },
          { id: 2, user_name: 'Priya Sharma', user_email: 'priya@email.com', is_leader: false, status: 'active', contribution_amount: 5000, last_contribution: '2024-01-15', avatar: '👩‍💻' },
          { id: 3, user_name: 'Amit Patel', user_email: 'amit@email.com', is_leader: false, status: 'active', contribution_amount: 5000, last_contribution: '2024-01-14', avatar: '👨‍🎓' },
          { id: 4, user_name: 'Sneha Gupta', user_email: 'sneha@email.com', is_leader: false, status: 'active', contribution_amount: 5000, last_contribution: '2024-01-13', avatar: '👩‍🎨' },
          { id: 5, user_name: 'Vikram Singh', user_email: 'vikram@email.com', is_leader: false, status: 'pending', contribution_amount: 0, last_contribution: null, avatar: '👨‍🔧' },
        ];
        
        setGroup(groupRes.data?.data?.group || groupRes.data?.group || mockGroup);
        setMembers(membersRes.data?.data?.members || membersRes.data?.members || mockMembers);
        setIsLeader(Boolean(groupRes.data?.data?.group?.is_leader || groupRes.data?.group?.is_leader || mockGroup.is_leader));
        setGroupUpiDetails(upiDetailsRes);
      } catch (e: any) {
        Alert.alert('Error', e?.message || 'Failed to load group');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [groupId]);

  const getProgressPercentage = () => {
    if (!group?.target_amount || !group?.total_savings) return 0;
    const percentage = (group.total_savings / group.target_amount) * 100;
    return Math.min(isNaN(percentage) ? 0 : percentage, 100);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return colors.success;
      case 'pending': return colors.warning;
      case 'inactive': return colors.error;
      default: return colors.gray500;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return '✅';
      case 'pending': return '⏳';
      case 'inactive': return '❌';
      default: return '💵'; // Changed from question mark to money bag icon
    }
  };

  const formatCurrency = (amount: number | null | undefined) => {
    if (!amount || isNaN(amount) || amount < 0) return '₹0'; // Return ₹0 for invalid amounts
    try {
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
      }).format(amount);
    } catch (error) {
      return `₹${amount.toLocaleString('en-IN')}`; // Fallback formatting
    }
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'Not set';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid date';
      return date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  const safeGetValue = (value: any, fallback: any = 0) => {
    return (value !== null && value !== undefined && !isNaN(value)) ? value : fallback;
  };

  const safeGetString = (value: any, fallback: string = '') => {
    return (value && typeof value === 'string') ? value : fallback;
  };

  const handleUPISetupSuccess = async () => {
    // Reload UPI details after successful setup
    try {
      const upiDetails = await upiService.getGroupUPIDetails(groupId.toString());
      setGroupUpiDetails(upiDetails);
    } catch (error) {
      console.error('Failed to reload UPI details:', error);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading group details..." />;
  }

  if (!group) {
    return (
      <View style={styles.container}>
        <Text>Group not found.</Text>
      </View>
    );
  }

  const { width } = Dimensions.get('window');
  
  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={colors.brandTeal} />
      <ScrollView 
        style={styles.container} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* 🌟 SPECTACULAR ULTRA-PREMIUM GROUP HEADER */}
        <View style={styles.spectacularHeaderWrapper}>
          <LinearGradient
            colors={['#0F4C75', '#3282B8', '#41B3A3', '#BBE1FA']}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
            style={styles.spectacularHeaderGradient}
          />
          {/* 🌈 Advanced Multi-Layer Glass Morphism */}
          <LinearGradient
            colors={[
              'rgba(255,255,255,0.15)', 
              'rgba(255,255,255,0.08)', 
              'rgba(255,255,255,0.03)',
              'transparent'
            ]}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
            style={styles.ultraGlassMorphism}
          />
          
          {/* ✨ Magical Floating Universe */}
          <View style={styles.magicalFloatingUniverse}>
            {/* Large floating orbs */}
            <View style={styles.floatingOrb1} />
            <View style={styles.floatingOrb2} />
            <View style={styles.floatingOrb3} />
            <View style={styles.floatingOrb4} />
            
            {/* Micro sparkles constellation */}
            <View style={styles.sparkleConstellation1} />
            <View style={styles.sparkleConstellation2} />
            <View style={styles.sparkleConstellation3} />
            <View style={styles.sparkleConstellation4} />
            <View style={styles.sparkleConstellation5} />
            <View style={styles.sparkleConstellation6} />
            
            {/* Floating geometric shapes */}
            <View style={styles.geometricShape1} />
            <View style={styles.geometricShape2} />
          </View>
          
          {/* 🎨 Revolutionary Background Art */}
          <View style={styles.revolutionaryBackgroundArt}>
            <View style={styles.artLayer1}>
              <View style={styles.abstractCircle1} />
              <View style={styles.abstractCircle2} />
              <View style={styles.abstractCircle3} />
            </View>
            <View style={styles.artLayer2}>
              <View style={styles.flowingWave1} />
              <View style={styles.flowingWave2} />
            </View>
            <View style={styles.artLayer3}>
              <View style={styles.energyPulse1} />
              <View style={styles.energyPulse2} />
              <View style={styles.energyPulse3} />
            </View>
          </View>
          
          <View style={styles.spectacularHeaderContent}>
            {/* 🎭 REVOLUTIONARY HEADER LAYOUT */}
            <View style={styles.revolutionaryHeaderLayout}>
              
              {/* 🌟 LEGENDARY AVATAR SECTION */}
              <View style={styles.legendaryAvatarSection}>
                <View style={styles.avatarMasterpiece}>
                  {/* Multi-ring avatar container */}
                  <View style={styles.avatarRingOuter}>
                    <View style={styles.avatarRingMiddle}>
                      <LinearGradient
                        colors={[
                          'rgba(255,255,255,0.4)', 
                          'rgba(255,255,255,0.2)', 
                          'rgba(255,255,255,0.1)'
                        ]}
                        style={styles.avatarRingInner}
                      >
                        <LinearGradient
                          colors={[
                            '#FFE5CC', '#FFD3A5', '#FD9853', '#FC6076'
                          ]}
                          start={{x: 0, y: 0}}
                          end={{x: 1, y: 1}}
                          style={styles.avatarCore}
                        >
                          <Text style={styles.legendaryAvatarText}>
                            {safeGetString(group.name, 'G').charAt(0).toUpperCase()}
                          </Text>
                          
                          {/* Floating crown for active status */}
                          {group.status === 'active' && (
                            <View style={styles.floatingCrown}>
                              <Text style={styles.crownEmoji}>👑</Text>
                            </View>
                          )}
                        </LinearGradient>
                      </LinearGradient>
                    </View>
                  </View>
                  
                  {/* Ultra-premium status indicator */}
                  <View style={styles.ultraStatusIndicator}>
                    <LinearGradient
                      colors={[
                        getStatusColor(group.status || 'active') + '40',
                        getStatusColor(group.status || 'active') + '20'
                      ]}
                      style={styles.statusGlowRing}
                    >
                      <View style={[
                        styles.statusCore,
                        { backgroundColor: getStatusColor(group.status || 'active') }
                      ]} />
                    </LinearGradient>
                  </View>
                  
                  {/* Pulsing animation ring */}
                  <View style={styles.pulsingRing} />
                </View>
              </View>
              
              {/* 🏆 LEGENDARY TITLE & PROGRESS SECTION */}
              <View style={styles.legendaryTitleContainer}>
                {/* Epic group name with multiple effects */}
                <View style={styles.epicTitleWrapper}>
                  <LinearGradient
                    colors={['rgba(255,255,255,0.1)', 'transparent']}
                    style={styles.titleBackdrop}
                  >
                    <Text style={styles.legendaryGroupName}>
                      {safeGetString(group.name, 'Dream Achievers')}
                    </Text>
                    <View style={styles.titleUnderline} />
                  </LinearGradient>
                </View>
                
                {/* Revolutionary Progress Display */}
                <View style={styles.revolutionaryProgressDisplay}>
                  <View style={styles.progressMasterpiece}>
                    {/* Glass container with multiple layers */}
                    <LinearGradient
                      colors={[
                        'rgba(255,255,255,0.25)', 
                        'rgba(255,255,255,0.15)', 
                        'rgba(255,255,255,0.08)'
                      ]}
                      style={styles.progressGlassContainer}
                    >
                      <View style={styles.revolutionaryProgressBar}>
                        {/* Progress fill with shimmer */}
                        <LinearGradient
                          colors={[
                            '#FFE5CC', '#FFD3A5', '#FD9853', '#FC6076', '#4FACFE'
                          ]}
                          start={{x: 0, y: 0}}
                          end={{x: 1, y: 0}}
                          style={[
                            styles.revolutionaryProgressFill, 
                            { width: `${Math.max(12, Math.floor(getProgressPercentage()))}%` }
                          ]}
                        />
                        
                        {/* Shimmer effect */}
                        <LinearGradient
                          colors={[
                            'transparent', 
                            'rgba(255,255,255,0.6)', 
                            'transparent'
                          ]}
                          start={{x: 0, y: 0}}
                          end={{x: 1, y: 0}}
                          style={[
                            styles.progressShimmer,
                            { width: `${Math.max(12, Math.floor(getProgressPercentage()))}%` }
                          ]}
                        />
                        
                        {/* Glow trail */}
                        <View style={[
                          styles.progressGlowTrail,
                          { width: `${Math.max(12, Math.floor(getProgressPercentage()))}%` }
                        ]} />
                      </View>
                    </LinearGradient>
                  </View>
                  
                  {/* Epic progress badge */}
                  <View style={styles.epicProgressBadge}>
                    <LinearGradient
                      colors={[
                        'rgba(255,255,255,0.35)', 
                        'rgba(255,255,255,0.2)', 
                        'rgba(255,255,255,0.1)'
                      ]}
                      style={styles.progressBadgeContainer}
                    >
                      <Text style={styles.epicProgressIcon}>🚀</Text>
                      <Text style={styles.epicProgressText}>
                        {Math.floor(getProgressPercentage()) || 0}% Complete
                      </Text>
                    </LinearGradient>
                  </View>
                </View>
              </View>
              
              {/* ⚡ ULTIMATE QUICK STATS */}
              <View style={styles.ultimateQuickStats}>
                {/* Members stat with pulsing effect */}
                <View style={styles.statMasterpiece}>
                  <LinearGradient
                    colors={[
                      'rgba(255,255,255,0.35)', 
                      'rgba(255,255,255,0.2)', 
                      'rgba(255,255,255,0.1)'
                    ]}
                    style={styles.statGlassContainer}
                  >
                    <View style={styles.statContent}>
                      <Text style={styles.statIconPremium}>👥</Text>
                      <Text style={styles.statNumberPremium}>{safeGetValue(group.member_count, members.length)}</Text>
                      <Text style={styles.statLabelPremium}>Members</Text>
                    </View>
                    <View style={styles.statGlowEffect} />
                  </LinearGradient>
                </View>
                
                {/* Savings stat with shimmer */}
                <View style={styles.statMasterpiece}>
                  <LinearGradient
                    colors={[
                      'rgba(255,255,255,0.35)', 
                      'rgba(255,255,255,0.2)', 
                      'rgba(255,255,255,0.1)'
                    ]}
                    style={styles.statGlassContainer}
                  >
                    <View style={styles.statContent}>
                      <Text style={styles.statIconPremium}>💰</Text>
                      <Text style={styles.statNumberPremium}>
                        ₹{Math.floor(safeGetValue(group.total_savings) / 1000)}K
                      </Text>
                      <Text style={styles.statLabelPremium}>Saved</Text>
                    </View>
                    <LinearGradient
                      colors={[
                        'transparent',
                        'rgba(255,255,255,0.3)',
                        'transparent'
                      ]}
                      style={styles.statShimmerEffect}
                      start={{x: 0, y: 0}}
                      end={{x: 1, y: 0}}
                    />
                  </LinearGradient>
                </View>
              </View>
            </View>
            
            {/* 🌟 MAGICAL BOTTOM INFO PARADISE */}
            <View style={styles.magicalBottomParadise}>
              {/* Epic description with backdrop */}
              <View style={styles.descriptionMasterpiece}>
                <LinearGradient
                  colors={[
                    'rgba(255,255,255,0.15)', 
                    'rgba(255,255,255,0.08)', 
                    'transparent'
                  ]}
                  style={styles.descriptionBackdrop}
                >
                  <Text style={styles.epicGroupDescription} numberOfLines={2}>
                    ✨ {safeGetString(group.description, 'Building dreams together through smart savings and collective growth')}
                  </Text>
                </LinearGradient>
              </View>
              
              {/* 🎨 Ultra-Premium Info Pills Gallery */}
              <View style={styles.infoPillsGallery}>
                {/* Created date pill with icon animation */}
                <View style={styles.infoPillContainer}>
                  <LinearGradient
                    colors={[
                      'rgba(255,255,255,0.4)', 
                      'rgba(255,255,255,0.25)', 
                      'rgba(255,255,255,0.1)'
                    ]}
                    start={{x: 0, y: 0}}
                    end={{x: 1, y: 1}}
                    style={styles.epicInfoPill}
                  >
                    <View style={styles.pillIconContainer}>
                      <Text style={styles.pillIcon}>📅</Text>
                      <View style={styles.iconGlowEffect} />
                    </View>
                    <Text style={styles.epicPillText}>
                      Born {formatDate(group.created_at).split(' ').slice(1, 3).join(' ')}
                    </Text>
                  </LinearGradient>
                </View>
                
                {/* Target amount pill with progress indication */}
                <View style={styles.infoPillContainer}>
                  <LinearGradient
                    colors={[
                      'rgba(255,255,255,0.4)', 
                      'rgba(255,255,255,0.25)', 
                      'rgba(255,255,255,0.1)'
                    ]}
                    start={{x: 0, y: 0}}
                    end={{x: 1, y: 1}}
                    style={styles.epicInfoPill}
                  >
                    <View style={styles.pillIconContainer}>
                      <Text style={styles.pillIcon}>🎯</Text>
                      <View style={styles.iconPulseEffect} />
                    </View>
                    <Text style={styles.epicPillText}>
                      Dream {formatCurrency(safeGetValue(group.target_amount))}
                    </Text>
                  </LinearGradient>
                </View>
                
                {/* Status pill with dynamic coloring */}
                <View style={styles.infoPillContainer}>
                  <LinearGradient
                    colors={[
                      getStatusColor(group.status || 'active') + '60',
                      getStatusColor(group.status || 'active') + '30',
                      'rgba(255,255,255,0.1)'
                    ]}
                    start={{x: 0, y: 0}}
                    end={{x: 1, y: 1}}
                    style={styles.epicInfoPill}
                  >
                    <View style={styles.pillIconContainer}>
                      <Text style={styles.pillIcon}>{getStatusIcon(group.status || 'active')}</Text>
                      <View style={[
                        styles.iconStatusEffect,
                        { backgroundColor: getStatusColor(group.status || 'active') + '40' }
                      ]} />
                    </View>
                    <Text style={styles.epicPillText}>
                      {(group.status || 'THRIVING').toUpperCase()}
                    </Text>
                  </LinearGradient>
                </View>
              </View>
            </View>
          </View>
        </View>
        
        <Container style={styles.content}>

          {/* Redesigned Savings Progress */}
          <View style={styles.progressSection}>
            {/* Progress Header */}
            <View style={styles.progressHeader}>
              <Text style={styles.progressTitle}>Savings Overview</Text>
              <Text style={styles.progressSubtitle}>Track your group's financial progress</Text>
            </View>
            
            {/* Enhanced Main Progress Card */}
            <View style={styles.enhancedProgressCardWrapper}>
              <LinearGradient
                colors={[
                  '#FFFFFF',
                  '#F8FFFE', 
                  '#F0FDFA',
                  '#E6FFFA',
                  colors.brandTeal + '08'
                ]}
                start={{x: 0, y: 0}}
                end={{x: 0, y: 1}}
                style={styles.enhancedMainProgressCard}
              >
                {/* Beautiful Background Decorations */}
                <View style={styles.progressCardDecorations}>
                  <View style={styles.progressDecoration1} />
                  <View style={styles.progressDecoration2} />
                  <View style={styles.progressDecoration3} />
                </View>
                
                {/* Floating Elements */}
                <View style={styles.floatingElements}>
                  <View style={styles.floatingCircle1} />
                  <View style={styles.floatingCircle2} />
                  <View style={styles.sparkle1} />
                  <View style={styles.sparkle2} />
                </View>
                
                <View style={styles.verticalProgressContent}>
                  {/* Beautiful Header Section */}
                  <View style={styles.progressHeaderSection}>
                    <LinearGradient
                      colors={[
                        colors.brandTeal + '20',
                        colors.success + '15',
                        'rgba(255,255,255,0.8)'
                      ]}
                      style={styles.progressHeaderBadge}
                    >
                      <Text style={styles.progressHeaderIcon}>💰</Text>
                      <Text style={styles.progressHeaderText}>Total Savings</Text>
                    </LinearGradient>
                  </View>
                  
                  {/* Enhanced Central Progress Display */}
                  <View style={styles.verticalProgressRingSection}>
                    <View style={styles.enhancedProgressRingContainer}>
                      {/* Multiple Ring Layers for Depth */}
                      <View style={styles.progressRingOuter}>
                        {/* Animated Progress Ring */}
                        <LinearGradient
                          colors={[
                            colors.brandTeal, 
                            colors.success,
                            '#4FACFE',
                            colors.brandTeal
                          ]}
                          start={{x: 0, y: 0}}
                          end={{x: 1, y: 1}}
                          style={[
                            styles.enhancedProgressRingFill,
                            {
                              transform: [{
                                rotate: `${(getProgressPercentage() / 100) * 360}deg`
                              }]
                            }
                          ]}
                        />
                        
                        {/* Glow Effect Ring */}
                        <View style={[
                          styles.progressGlowRing,
                          {
                            transform: [{
                              rotate: `${(getProgressPercentage() / 100) * 360}deg`
                            }]
                          }
                        ]} />
                      </View>
                      
                      {/* Beautiful Center Content */}
                      <LinearGradient
                        colors={[
                          'rgba(255,255,255,0.95)',
                          'rgba(255,255,255,0.8)',
                          'rgba(248,255,254,0.9)'
                        ]}
                        style={styles.enhancedProgressCenter}
                      >
                        <Text style={styles.enhancedProgressMainNumber}>
                          {Math.floor(getProgressPercentage()) || 0}%
                        </Text>
                        <Text style={styles.enhancedProgressCenterLabel}>Complete</Text>
                      </LinearGradient>
                    </View>
                  </View>
                  
                  {/* Beautiful Amount Display */}
                  <View style={styles.verticalAmountDisplay}>
                    <View style={styles.verticalAmountContainer}>
                      <View style={styles.amountIconContainer}>
                        <LinearGradient
                          colors={[colors.brandTeal, colors.success]}
                          style={styles.amountIconBadge}
                        >
                          <Text style={styles.amountIcon}>💎</Text>
                        </LinearGradient>
                      </View>
                      
                      <Text 
                        style={styles.verticalCurrentAmount}
                        numberOfLines={1}
                        adjustsFontSizeToFit
                        minimumFontScale={0.7}
                      >
                        {formatCurrency(safeGetValue(group.total_savings))}
                      </Text>
                      
                      <Text style={styles.verticalAmountSubtitle}>
                        Group Savings Balance
                      </Text>
                    </View>
                  </View>
                  
                  {/* Beautiful Achievement Badge */}
                  {getProgressPercentage() > 50 && (
                    <LinearGradient
                      colors={[
                        colors.warning + '20',
                        colors.success + '15'
                      ]}
                      style={styles.verticalAchievementBadge}
                    >
                      <Text style={styles.achievementIcon}>🏆</Text>
                      <Text style={styles.achievementText}>Great Progress!</Text>
                    </LinearGradient>
                  )}
                </View>
              </LinearGradient>
            </View>
            
            {/* Stats Grid */}
            <View style={styles.statsGrid}>
              <LinearGradient
                colors={[colors.success, colors.brandTeal]}
                style={styles.statCardNew}
              >
                <View style={styles.statCardContent}>
                  <Text style={styles.statCardIcon}>💳</Text>
                  <Text style={styles.statCardValue}>{formatCurrency(safeGetValue(group.monthly_contribution))}</Text>
                  <Text style={styles.statCardLabel}>Monthly Target</Text>
                </View>
              </LinearGradient>
              
              <LinearGradient
                colors={[colors.info, colors.brandTeal]}
                style={styles.statCardNew}
              >
                <View style={styles.statCardContent}>
                  <Text style={styles.statCardIcon}>📅</Text>
                  <Text style={styles.statCardValue}>{formatDate(group.next_contribution_date).split(' ')[0] || 'Not set'}</Text>
                  <Text style={styles.statCardLabel}>Next Due</Text>
                </View>
              </LinearGradient>
              
              <LinearGradient
                colors={[colors.warning, colors.info]}
                style={styles.statCardNew}
              >
                <View style={styles.statCardContent}>
                  <Text style={styles.statCardIcon}>📈</Text>
                  <Text style={styles.statCardValue}>{formatCurrency(safeGetValue(group.target_amount) - safeGetValue(group.total_savings))}</Text>
                  <Text style={styles.statCardLabel}>Remaining</Text>
                </View>
              </LinearGradient>
            </View>
          </View>

          {/* Action Buttons Section */}
          <View style={styles.actionsSection}>
            {/* Section Header */}
            <View style={styles.actionsSectionHeader}>
              <Text style={styles.actionsSectionTitle}>Quick Actions</Text>
              <Text style={styles.actionsSectionSubtitle}>Manage your group efficiently</Text>
            </View>
            
            {/* Primary Actions */}
            <View style={styles.primaryActionsContainer}>
              <TouchableOpacity 
                activeOpacity={0.8}
                onPress={() => navigation.navigate('Contribution', { groupId })}
              >
                <LinearGradient
                  colors={[colors.brandTeal, colors.success]}
                  style={styles.primaryActionButton}
                >
                  <View style={styles.primaryActionContent}>
                    <View style={styles.primaryActionIconContainer}>
                      <Text style={styles.primaryActionIcon}>💳</Text>
                    </View>
                    <View style={styles.primaryActionTextContainer}>
                      <Text style={styles.primaryActionTitle}>Make Contribution</Text>
                      <Text style={styles.primaryActionSubtitle}>Add funds to group savings</Text>
                    </View>
                    <Text style={styles.primaryActionArrow}>→</Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
              
              <TouchableOpacity 
                activeOpacity={0.8}
                onPress={() => navigation.navigate('Transactions', { groupId })}
              >
                <LinearGradient
                  colors={[colors.info, colors.brandTeal]}
                  style={styles.primaryActionButton}
                >
                  <View style={styles.primaryActionContent}>
                    <View style={styles.primaryActionIconContainer}>
                      <Text style={styles.primaryActionIcon}>📄</Text>
                    </View>
                    <View style={styles.primaryActionTextContainer}>
                      <Text style={styles.primaryActionTitle}>View Transactions</Text>
                      <Text style={styles.primaryActionSubtitle}>Track all group activity</Text>
                    </View>
                    <Text style={styles.primaryActionArrow}>→</Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            </View>
            
            {/* Secondary Actions Grid */}
            <View style={styles.secondaryActionsContainer}>
              <Text style={styles.secondaryActionsTitle}>More Options</Text>
              <View style={styles.secondaryActionsGrid}>
                {[
                  { icon: '📈', label: 'Summary', colors: [colors.secondary, colors.info], route: 'SavingsSummary' },
                  { icon: '➕', label: 'Invite', colors: [colors.warning, colors.info], route: 'InviteMembers' },
                  { icon: '💰', label: 'Loan', colors: [colors.brandTeal, colors.success], route: 'LoanRequest' },
                  { icon: '📅', label: 'History', colors: [colors.secondary, colors.brandTeal], route: 'GroupHistory' }
                ].map((action, index) => (
                  <TouchableOpacity 
                    key={index}
                    activeOpacity={0.8}
                    onPress={() => {
                      if (action.route === 'LoanRequest') {
                        navigation.navigate('LoanRequest', { 
                          groupId: groupId.toString(), 
                          groupName: group.name 
                        });
                      } else {
                        navigation.navigate(action.route as any, { groupId });
                      }
                    }}
                  >
                    <LinearGradient
                      colors={action.colors}
                      style={styles.secondaryActionCard}
                    >
                      <View style={styles.secondaryActionContent}>
                        <Text style={styles.secondaryActionIcon}>{action.icon}</Text>
                        <Text style={styles.secondaryActionLabel}>{action.label}</Text>
                      </View>
                    </LinearGradient>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            {/* Leader Section */}
            {isLeader && (
              <View style={styles.leaderSection}>
                <LinearGradient
                  colors={[colors.info + '15', colors.brandTeal + '10']}
                  style={styles.leaderBadge}
                >
                  <Text style={styles.leaderBadgeText}>👑 Leadership Panel</Text>
                </LinearGradient>
                
                <View style={styles.leaderActionsGrid}>
                  <TouchableOpacity 
                    onPress={() => navigation.navigate('JoinRequests', { groupId })}
                    activeOpacity={0.8}
                    style={styles.leaderActionItem}
                  >
                    <LinearGradient
                      colors={[colors.warning, colors.info]}
                      style={styles.leaderActionButton}
                    >
                      <Text style={styles.leaderActionIcon}>📎</Text>
                      <Text style={styles.leaderActionText}>Join Requests</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    onPress={() => setShowUPISetupModal(true)}
                    activeOpacity={0.8}
                    style={styles.leaderActionItem}
                  >
                    <LinearGradient
                      colors={[colors.brandTeal, colors.success]}
                      style={styles.leaderActionButton}
                    >
                      <Text style={styles.leaderActionIcon}>💳</Text>
                      <Text style={styles.leaderActionText}>
                        {groupUpiDetails ? 'UPI Settings' : 'Setup UPI'}
                      </Text>
                      {groupUpiDetails && (
                        <View style={styles.upiConfiguredBadge}>
                          <Text style={styles.upiConfiguredText}>✓</Text>
                        </View>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    onPress={() => navigation.navigate('GroupSettings', { groupId })}
                    activeOpacity={0.8}
                    style={styles.leaderActionItem}
                  >
                    <LinearGradient
                      colors={[colors.secondary, colors.info]}
                      style={styles.leaderActionButton}
                    >
                      <Text style={styles.leaderActionIcon}>⚙️</Text>
                      <Text style={styles.leaderActionText}>Settings</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>

          {/* Visual Separator */}
          <View style={styles.sectionSeparator} />
          
          {/* Team Members Section */}
          <View style={styles.membersSection}>
            {/* Members Header */}
            <View style={styles.membersSectionHeader}>
              <View style={styles.membersHeaderContent}>
                <Text style={styles.membersSectionTitle}>Team Members</Text>
                <Text style={styles.membersSectionSubtitle}>{members.length} active contributors building together</Text>
              </View>
              <TouchableOpacity 
                onPress={() => navigation.navigate('GroupHistory', { groupId })}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={[colors.info, colors.brandTeal]}
                  style={styles.membersHistoryButton}
                >
                  <Text style={styles.membersHistoryText}>📈 History</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
            
            {/* Members List */}
            <View style={styles.enhancedMembersList}>
              {members.map((item, index) => (
                <View key={String(item.user_id || item.id)} style={styles.memberCardWrapper}>
                  <LinearGradient
                    colors={[colors.white, colors.gray50]}
                    style={styles.enhancedMemberCard}
                  >
                    {/* Member Avatar Section */}
                    <View style={styles.memberLeftSection}>
                      <View style={styles.memberAvatarWrapper}>
                        <LinearGradient
                          colors={item.is_leader 
                            ? [colors.warning, colors.success] 
                            : item.status === 'active'
                            ? [colors.brandTeal, colors.success]
                            : item.status === 'pending'
                            ? [colors.warning, colors.info]
                            : [colors.gray400, colors.gray500]
                          }
                          style={styles.enhancedMemberAvatar}
                        >
                          <Text style={styles.enhancedMemberAvatarText}>
                            {item.avatar || (safeGetString(item.user_name || item.name, 'U').charAt(0).toUpperCase())}
                          </Text>
                          {item.is_leader && (
                            <View style={styles.enhancedCrownBadge}>
                              <Text style={styles.enhancedCrownText}>👑</Text>
                            </View>
                          )}
                        </LinearGradient>
                        
                        {/* Status Indicator */}
                        <View style={[
                          styles.memberStatusIndicator,
                          {
                            backgroundColor: item.status === 'active' ? colors.success : 
                                           item.status === 'pending' ? colors.warning : colors.error
                          }
                        ]} />
                      </View>
                    </View>
                    
                    {/* Member Info Section */}
                    <View style={styles.memberRightSection}>
                      <View style={styles.memberTopRow}>
                        <View style={styles.memberNameContainer}>
                          <Text style={styles.enhancedMemberName}>
                            {safeGetString(item.user_name || item.name, 'Member')}
                          </Text>
                          {item.is_leader && (
                            <Text style={styles.memberRoleText}>Leader</Text>
                          )}
                        </View>
                        
                        <LinearGradient
                          colors={item.status === 'active' ? [colors.success + '20', colors.success + '10'] :
                                 item.status === 'pending' ? [colors.warning + '20', colors.warning + '10'] :
                                 [colors.error + '20', colors.error + '10']}
                          style={styles.enhancedStatusChip}
                        >
                          <Text style={[styles.enhancedStatusChipText, {
                            color: item.status === 'active' ? colors.success : 
                                   item.status === 'pending' ? colors.warning : colors.error
                          }]}>
                            {getStatusIcon(item.status || 'inactive')} {(item.status || 'INACTIVE')?.toUpperCase()}
                          </Text>
                        </LinearGradient>
                      </View>
                      
                      <Text style={styles.enhancedMemberEmail}>{safeGetString(item.user_email, 'No email')}</Text>
                      
                      {/* Member Stats Row */}
                      <View style={styles.memberStatsRow}>
                        {safeGetValue(item.contribution_amount) > 0 && (
                          <LinearGradient
                            colors={[colors.brandTeal + '15', colors.success + '10']}
                            style={styles.enhancedContributionBadge}
                          >
                            <Text style={styles.enhancedContributionIcon}>💰</Text>
                            <Text style={styles.enhancedContributionAmount}>
                              {formatCurrency(safeGetValue(item.contribution_amount))}
                            </Text>
                          </LinearGradient>
                        )}
                        
                        {item.last_contribution && (
                          <LinearGradient
                            colors={[colors.info + '15', colors.brandTeal + '10']}
                            style={styles.enhancedDateBadge}
                          >
                            <Text style={styles.enhancedDateIcon}>📅</Text>
                            <Text style={styles.enhancedLastContribution}>
                              {formatDate(item.last_contribution).split(' ')[0] || 'No date'}
                            </Text>
                          </LinearGradient>
                        )}
                      </View>
                    </View>
                  </LinearGradient>
                  
                  {/* Member Card Decoration */}
                  <View style={styles.memberCardDecoration} />
                </View>
              ))}
            </View>
          </View>
        </Container>
      </ScrollView>
      
      {/* UPI Setup Modal */}
      <UPISetupModal
        visible={showUPISetupModal}
        onClose={() => setShowUPISetupModal(false)}
        onSuccess={handleUPISetupSuccess}
        groupId={groupId.toString()}
        groupName={safeGetString(group?.name, 'Group')}
        existingUpiId={groupUpiDetails?.upiId}
        existingUpiName={groupUpiDetails?.upiName}
      />
    </>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: spacing.l,
    backgroundColor: colors.backgroundSecondary,
  },
  // 🎆 SPECTACULAR HEADER STYLES 🎆
  spectacularHeaderWrapper: {
    position: 'relative',
    minHeight: 320,
    width: '100%',
    overflow: 'hidden',
    borderBottomLeftRadius: 45,
    borderBottomRightRadius: 45,
    marginBottom: spacing.xl,
    backgroundColor: '#3282B8', // Fallback background
    ...shadows.xlarge,
  },
  spectacularHeaderGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    minHeight: 320,
  },
  
  // 🌈 ULTRA GLASS MORPHISM
  ultraGlassMorphism: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    borderBottomLeftRadius: 45,
    borderBottomRightRadius: 45,
  },
  
  // ✨ MAGICAL FLOATING UNIVERSE
  magicalFloatingUniverse: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  // Floating orbs with gradients
  floatingOrb1: {
    position: 'absolute',
    top: 20,
    left: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 229, 204, 0.2)',
    shadowColor: '#FFE5CC',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 10,
  },
  floatingOrb2: {
    position: 'absolute',
    top: 70,
    right: 30,
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: 'rgba(252, 96, 118, 0.15)',
    shadowColor: '#FC6076',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 15,
    elevation: 8,
  },
  floatingOrb3: {
    position: 'absolute',
    bottom: 80,
    left: 40,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(79, 172, 254, 0.18)',
    shadowColor: '#4FACFE',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 18,
    elevation: 9,
  },
  floatingOrb4: {
    position: 'absolute',
    top: 120,
    right: 80,
    width: 35,
    height: 35,
    borderRadius: 17.5,
    backgroundColor: 'rgba(255, 211, 165, 0.12)',
    shadowColor: '#FFD3A5',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 6,
  },
  
  // Sparkle constellations
  sparkleConstellation1: {
    position: 'absolute',
    top: 40,
    right: 60,
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#FFE5CC',
    opacity: 0.9,
  },
  sparkleConstellation2: {
    position: 'absolute',
    top: 90,
    left: 80,
    width: 2,
    height: 2,
    borderRadius: 1,
    backgroundColor: '#FC6076',
    opacity: 0.8,
  },
  sparkleConstellation3: {
    position: 'absolute',
    top: 160,
    left: 120,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#4FACFE',
    opacity: 0.7,
  },
  sparkleConstellation4: {
    position: 'absolute',
    bottom: 120,
    right: 100,
    width: 2.5,
    height: 2.5,
    borderRadius: 1.25,
    backgroundColor: '#FFD3A5',
    opacity: 0.85,
  },
  sparkleConstellation5: {
    position: 'absolute',
    bottom: 140,
    left: 90,
    width: 3.5,
    height: 3.5,
    borderRadius: 1.75,
    backgroundColor: '#FFE5CC',
    opacity: 0.6,
  },
  sparkleConstellation6: {
    position: 'absolute',
    top: 200,
    right: 120,
    width: 2,
    height: 2,
    borderRadius: 1,
    backgroundColor: '#FC6076',
    opacity: 0.9,
  },
  
  // Geometric shapes
  geometricShape1: {
    position: 'absolute',
    top: 50,
    left: width * 0.7,
    width: 8,
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    transform: [{ rotate: '45deg' }],
  },
  geometricShape2: {
    position: 'absolute',
    bottom: 100,
    right: 60,
    width: 6,
    height: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 3,
  },
  // 🎆 SPECTACULAR HEADER CONTENT
  spectacularHeaderContent: {
    position: 'relative',
    paddingTop: spacing.xxl + 15,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl + 10,
    minHeight: 280,
    zIndex: 10,
    width: '100%',
  },
  
  // 🎨 REVOLUTIONARY BACKGROUND ART
  revolutionaryBackgroundArt: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    zIndex: 1,
  },
  artLayer1: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    opacity: 0.6,
  },
  artLayer2: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    opacity: 0.4,
  },
  artLayer3: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    opacity: 0.2,
  },
  abstractCircle1: {
    position: 'absolute',
    top: -80,
    right: -80,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 229, 204, 0.08)',
  },
  abstractCircle2: {
    position: 'absolute',
    top: 60,
    left: -60,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(252, 96, 118, 0.06)',
  },
  abstractCircle3: {
    position: 'absolute',
    bottom: -40,
    right: 20,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(79, 172, 254, 0.04)',
  },
  flowingWave1: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    transform: [{ skewY: '-2deg' }],
  },
  flowingWave2: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    transform: [{ skewY: '1deg' }],
  },
  energyPulse1: {
    position: 'absolute',
    top: '30%',
    left: '70%',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 211, 165, 0.1)',
  },
  energyPulse2: {
    position: 'absolute',
    top: '60%',
    left: '20%',
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(252, 96, 118, 0.08)',
  },
  energyPulse3: {
    position: 'absolute',
    top: '80%',
    left: '80%',
    width: 25,
    height: 25,
    borderRadius: 12.5,
    backgroundColor: 'rgba(79, 172, 254, 0.06)',
  },
  
  headerWave: {
    position: 'absolute',
    bottom: -1,
    left: 0,
    right: 0,
    height: 30,
    backgroundColor: colors.backgroundSecondary,
    transform: [{ skewY: '-2deg' }],
    transformOrigin: 'bottom left',
  },
  groupHeaderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.l,
  },
  avatarGlassContainer: {
    position: 'relative',
  },
  groupAvatarGlass: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 2,
    ...shadows.xlarge,
  },
  groupAvatarInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.medium,
  },
  groupAvatarText: {
    fontSize: 28,
    fontWeight: '900',
    color: colors.brandTeal,
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  statusDotContainer: {
    position: 'absolute',
    right: -2,
    bottom: -2,
  },
  groupStatusDotGlow: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    opacity: 0.4,
  },
  groupStatusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.white,
    ...shadows.medium,
  },
  statusBadge: {
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    borderRadius: spacing.l,
    ...shadows.medium,
  },
  statusBadgeText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: '700',
  },
  groupInfo: {
    alignItems: 'center',
  },
  groupName: {
    ...typography.h1,
    color: colors.white,
    marginBottom: spacing.xs,
    fontWeight: '800',
    textAlign: 'center',
  },
  groupDescription: {
    ...typography.bodyLarge,
    color: colors.white,
    opacity: 0.9,
    marginBottom: spacing.l,
    lineHeight: 24,
    textAlign: 'center',
  },
  groupStats: {
    flexDirection: 'row',
    gap: spacing.m,
  },
  statBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    borderRadius: spacing.l,
    gap: spacing.xs,
  },
  statIcon: {
    fontSize: 16,
  },
  statText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: '600',
  },
  headerDecoration1: {
    position: 'absolute',
    top: -50,
    left: -50,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: colors.white,
    opacity: 0.1,
  },
  headerDecoration2: {
    position: 'absolute',
    bottom: -30,
    right: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.success,
    opacity: 0.2,
  },
  sparkle1: {
    position: 'absolute',
    top: 60,
    right: 40,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.white,
    opacity: 0.8,
  },
  sparkle2: {
    position: 'absolute',
    top: 120,
    left: 60,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.brandTealLight,
    opacity: 0.9,
  },
  sparkle3: {
    position: 'absolute',
    bottom: 80,
    left: 80,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.success,
    opacity: 0.7,
  },
  // Header Pattern and Decorations
  headerPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  patternCircle1: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  patternCircle2: {
    position: 'absolute',
    top: 50,
    left: -30,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  patternCircle3: {
    position: 'absolute',
    top: 100,
    left: width * 0.3,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  patternWave: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    transform: [{ skewY: '-1deg' }],
  },
  // Compact Header Layout
  // 🎆 REVOLUTIONARY HEADER LAYOUT
  revolutionaryHeaderLayout: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: spacing.l,
    paddingHorizontal: spacing.s,
  },
  // 🌟 LEGENDARY AVATAR SECTION
  legendaryAvatarSection: {
    alignItems: 'center',
    position: 'relative',
  },
  avatarMasterpiece: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarRingOuter: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.large,
  },
  avatarRingMiddle: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarRingInner: {
    width: 74,
    height: 74,
    borderRadius: 37,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarCore: {
    width: 66,
    height: 66,
    borderRadius: 33,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    ...shadows.xlarge,
  },
  legendaryAvatarText: {
    fontSize: 28,
    fontWeight: '900',
    color: colors.white,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  floatingCrown: {
    position: 'absolute',
    top: -8,
    right: -8,
    zIndex: 10,
  },
  crownEmoji: {
    fontSize: 20,
    textShadowColor: 'rgba(255,215,0,0.8)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  ultraStatusIndicator: {
    position: 'absolute',
    bottom: -2,
    right: -2,
  },
  statusGlowRing: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusCore: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: colors.white,
    ...shadows.medium,
  },
  pulsingRing: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    top: -5,
    left: -5,
  },
  
  // 🏆 LEGENDARY TITLE CONTAINER
  legendaryTitleContainer: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: spacing.m,
  },
  epicTitleWrapper: {
    alignItems: 'center',
    marginBottom: spacing.m,
  },
  titleBackdrop: {
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.s,
    borderRadius: spacing.m,
    alignItems: 'center',
    position: 'relative',
  },
  legendaryGroupName: {
    ...typography.h1,
    color: colors.white,
    fontWeight: '900',
    fontSize: 22,
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 8,
    letterSpacing: 0.5,
  },
  titleUnderline: {
    width: 60,
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 1.5,
    marginTop: spacing.xs,
    ...shadows.medium,
  },
  
  // 🚀 REVOLUTIONARY PROGRESS DISPLAY
  revolutionaryProgressDisplay: {
    width: '100%',
    alignItems: 'center',
  },
  progressMasterpiece: {
    width: '95%',
    marginBottom: spacing.s,
  },
  progressGlassContainer: {
    borderRadius: 12,
    padding: 3,
    ...shadows.large,
  },
  revolutionaryProgressBar: {
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.3)',
    overflow: 'hidden',
    position: 'relative',
  },
  revolutionaryProgressFill: {
    height: '100%',
    borderRadius: 6,
    ...shadows.medium,
  },
  progressShimmer: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    borderRadius: 6,
  },
  progressGlowTrail: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    opacity: 0.8,
  },
  epicProgressBadge: {
    alignItems: 'center',
  },
  progressBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    borderRadius: spacing.l,
    gap: spacing.xs,
    ...shadows.medium,
  },
  epicProgressIcon: {
    fontSize: 16,
  },
  epicProgressText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: '800',
    fontSize: 12,
    opacity: 0.95,
  },
  
  // ⚡ ULTIMATE QUICK STATS
  ultimateQuickStats: {
    alignItems: 'flex-end',
    gap: spacing.s,
  },
  statMasterpiece: {
    position: 'relative',
  },
  statGlassContainer: {
    alignItems: 'center',
    paddingVertical: spacing.s,
    paddingHorizontal: spacing.m,
    borderRadius: spacing.m,
    minWidth: 70,
    ...shadows.large,
    position: 'relative',
    overflow: 'hidden',
  },
  statContent: {
    alignItems: 'center',
    gap: 2,
  },
  statIconPremium: {
    fontSize: 16,
    marginBottom: 2,
  },
  statNumberPremium: {
    ...typography.bodyLarge,
    color: colors.white,
    fontWeight: '900',
    fontSize: 16,
    lineHeight: 18,
  },
  statLabelPremium: {
    ...typography.caption,
    color: colors.white,
    fontWeight: '600',
    fontSize: 9,
    opacity: 0.9,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statGlowEffect: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: spacing.m,
    opacity: 0.6,
  },
  statShimmerEffect: {
    position: 'absolute',
    top: 0,
    left: -50,
    right: 0,
    bottom: 0,
    borderRadius: spacing.m,
  },
  titleWithEnhancedShadow: {
    alignItems: 'center',
    marginBottom: spacing.s,
  },
  compactGroupNameShadow: {
    ...typography.h2,
    color: 'rgba(0,0,0,0.2)',
    fontWeight: '900',
    fontSize: 21,
    textAlign: 'center',
    position: 'absolute',
    top: 1,
  },
  ultraPremiumGroupName: {
    ...typography.h1,
    color: colors.white,
    fontWeight: '900',
    fontSize: 24,
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 6,
    letterSpacing: 0.5,
  },
  ultraPremiumProgressContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: spacing.s,
  },
  progressBarUltraContainer: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 8,
    padding: 2,
    width: '90%',
    ...shadows.medium,
    marginBottom: spacing.s,
  },
  ultraCompactProgressBar: {
    width: '100%',
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.25)',
    overflow: 'hidden',
    position: 'relative',
  },
  ultraProgressFill: {
    height: '100%',
    borderRadius: 4,
    ...shadows.medium,
  },
  progressGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    opacity: 0.6,
  },
  progressTextBadge: {
    borderRadius: spacing.m,
    paddingHorizontal: spacing.s,
    paddingVertical: spacing.xs,
    ...shadows.small,
  },
  ultraProgressText: {
    ...typography.caption,
    color: colors.white,
    opacity: 0.95,
    fontSize: 11,
    fontWeight: '700',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  avatarSection: {
    alignItems: 'center',
    gap: spacing.s,
    position: 'relative',
  },
  quickStatsCompact: {
    alignItems: 'flex-end',
    gap: spacing.xs,
  },
  quickStatMini: {
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderRadius: 8,
    minWidth: 40,
    ...shadows.small,
  },
  quickStatIconMini: {
    fontSize: 12,
    marginBottom: 1,
  },
  quickStatNumberMini: {
    ...typography.caption,
    color: colors.white,
    fontWeight: '800',
    fontSize: 11,
    lineHeight: 12,
  },
  // 🌟 MAGICAL BOTTOM PARADISE
  magicalBottomParadise: {
    alignItems: 'center',
    marginTop: spacing.l,
    paddingHorizontal: spacing.m,
  },
  descriptionMasterpiece: {
    width: '100%',
    alignItems: 'center',
    marginBottom: spacing.l,
  },
  descriptionBackdrop: {
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.m,
    borderRadius: spacing.l,
    alignItems: 'center',
    width: '100%',
  },
  epicGroupDescription: {
    ...typography.body,
    color: colors.white,
    opacity: 0.95,
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },
  premiumGroupDescription: {
    ...typography.body,
    color: colors.white,
    opacity: 0.9,
    textAlign: 'center',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: spacing.m,
    paddingHorizontal: spacing.s,
  },
  // 🎨 INFO PILLS GALLERY
  infoPillsGallery: {
    flexDirection: 'row',
    gap: spacing.s,
    justifyContent: 'center',
    flexWrap: 'wrap',
    width: '100%',
  },
  infoPillContainer: {
    marginVertical: spacing.xs,
  },
  epicInfoPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    borderRadius: spacing.xl,
    gap: spacing.xs,
    ...shadows.large,
    minHeight: 36,
  },
  pillIconContainer: {
    position: 'relative',
  },
  pillIcon: {
    fontSize: 14,
  },
  epicPillText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: '700',
    fontSize: 11,
    opacity: 0.95,
  },
  iconGlowEffect: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    top: -3,
    left: -3,
    opacity: 0.6,
  },
  iconPulseEffect: {
    position: 'absolute',
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(255,255,255,0.15)',
    top: -2,
    left: -2,
    opacity: 0.8,
  },
  iconStatusEffect: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    top: -1,
    left: -1,
    opacity: 0.4,
  },
  premiumStatPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.s,
    borderRadius: spacing.m,
    gap: 4,
    ...shadows.medium,
  },
  premiumStatIcon: {
    fontSize: 12,
  },
  premiumStatText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: '700',
    fontSize: 10,
    opacity: 0.95,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.m,
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  enhancedStatPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs, // Reduced padding
    paddingHorizontal: spacing.s, // Reduced padding
    borderRadius: spacing.l, // Smaller radius
    gap: spacing.xs,
    ...shadows.small,
  },
  statPillIconContainer: {
    width: 20, // Smaller container
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statPillIcon: {
    fontSize: 10, // Smaller icon
  },
  statPillText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: '700',
    opacity: 0.95,
    fontSize: 10, // Slightly larger for readability
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.l,
    paddingTop: spacing.l,
    paddingBottom: spacing.l, // Normal bottom padding
  },
  // Standard Card Layout
  cardBase: {
    borderRadius: spacing.xl,
    padding: spacing.xl,
    marginBottom: spacing.l,
    ...shadows.large,
  },
  // Section Header (consistent across all sections)
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.l,
    gap: spacing.m,
  },
  sectionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.medium,
  },
  sectionIconText: {
    fontSize: 24,
    color: colors.white,
  },
  // Progress Section Styles
  progressSection: {
    marginBottom: spacing.l,
  },
  progressHeader: {
    marginBottom: spacing.l,
    paddingHorizontal: spacing.m,
  },
  progressTitle: {
    ...typography.h2,
    color: colors.gray900,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  progressSubtitle: {
    ...typography.body,
    color: colors.gray600,
    opacity: 0.8,
  },
  mainProgressCard: {
    borderRadius: spacing.xl,
    padding: spacing.xl,
    marginBottom: spacing.l,
    ...shadows.large,
  },
  // Enhanced Progress Card Styles
  enhancedProgressCardWrapper: {
    marginBottom: spacing.l,
    marginHorizontal: spacing.xs,
  },
  enhancedMainProgressCard: {
    borderRadius: 24,
    padding: spacing.xl,
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.brandTeal + '15',
    shadowColor: colors.brandTeal,
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 20,
  },
  progressCardDecorations: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  progressDecoration1: {
    position: 'absolute',
    top: -30,
    right: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.brandTeal + '08',
  },
  progressDecoration2: {
    position: 'absolute',
    bottom: -40,
    left: -40,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.success + '06',
  },
  progressDecoration3: {
    position: 'absolute',
    top: '40%',
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.info + '05',
  },
  floatingElements: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  floatingCircle1: {
    position: 'absolute',
    top: 20,
    left: 20,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.brandTeal + '30',
  },
  floatingCircle2: {
    position: 'absolute',
    top: 60,
    right: 40,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.success + '25',
  },
  sparkle1: {
    position: 'absolute',
    top: 40,
    left: '70%',
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.warning + '40',
  },
  sparkle2: {
    position: 'absolute',
    bottom: 30,
    right: '30%',
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: colors.info + '35',
  },
  enhancedProgressContent: {
    alignItems: 'center',
    position: 'relative',
    zIndex: 1,
  },
  verticalProgressContent: {
    alignItems: 'center',
    position: 'relative',
    zIndex: 1,
    width: '100%',
    paddingVertical: spacing.s,
  },
  progressHeaderSection: {
    marginBottom: spacing.l,
  },
  progressHeaderBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.s,
    borderRadius: spacing.xl,
    gap: spacing.s,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  progressHeaderIcon: {
    fontSize: 16,
  },
  progressHeaderText: {
    ...typography.body,
    fontSize: 14,
    color: colors.brandTeal,
    fontWeight: '700',
  },
  enhancedCentralProgress: {
    alignItems: 'center',
    marginBottom: spacing.l,
  },
  verticalProgressRingSection: {
    alignItems: 'center',
    marginBottom: spacing.l,
    width: '100%',
  },
  enhancedProgressRingContainer: {
    marginBottom: spacing.m,
    alignItems: 'center',
    justifyContent: 'center',
  },
  enhancedProgressRingFill: {
    position: 'absolute',
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 6,
    borderColor: 'transparent',
    borderTopColor: colors.brandTeal,
    borderRightColor: colors.success,
    shadowColor: colors.brandTeal,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  progressGlowRing: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 1,
    borderColor: colors.brandTeal + '20',
    top: -5,
    left: -5,
  },
  enhancedProgressCenter: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1,
    borderColor: colors.brandTeal + '10',
  },
  enhancedProgressMainNumber: {
    ...typography.h1,
    fontSize: 28,
    color: colors.brandTeal,
    fontWeight: '900',
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  enhancedProgressCenterLabel: {
    ...typography.caption,
    fontSize: 11,
    color: colors.gray600,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  progressDots: {
    flexDirection: 'row',
    gap: 4,
  },
  progressDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  enhancedAmountDisplay: {
    width: '100%',
  },
  verticalAmountDisplay: {
    width: '100%',
    alignItems: 'center',
    marginBottom: spacing.l,
  },
  verticalAmountContainer: {
    alignItems: 'center',
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.l,
    borderRadius: spacing.l,
    width: '90%',
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderWidth: 1,
    borderColor: colors.brandTeal + '20',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
  },
  amountDisplayContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.m,
    borderRadius: spacing.l,
    gap: spacing.s,
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.gray100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
  },
  amountIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  amountIconBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.brandTeal,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  amountIcon: {
    fontSize: 20,
  },
  verticalCurrentAmount: {
    ...typography.h1,
    fontSize: 24,
    color: colors.gray900,
    fontWeight: '800',
    marginTop: spacing.s,
    marginBottom: spacing.xs,
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.05)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    lineHeight: 28,
  },
  verticalAmountSubtitle: {
    ...typography.caption,
    fontSize: 12,
    color: colors.gray600,
    fontWeight: '600',
    textAlign: 'center',
    opacity: 0.8,
    lineHeight: 16,
  },
  amountTextContainer: {
    flex: 1,
  },
  enhancedCurrentAmountLarge: {
    ...typography.h2,
    fontSize: 22,
    color: colors.gray900,
    fontWeight: '800',
    marginBottom: 2,
    textShadowColor: 'rgba(0,0,0,0.05)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    lineHeight: 24,
  },
  amountSubtitle: {
    ...typography.caption,
    fontSize: 12,
    color: colors.gray600,
    fontWeight: '500',
    opacity: 0.8,
    lineHeight: 14,
  },
  shimmerEffect: {
    position: 'absolute',
    top: 0,
    left: -100,
    right: 0,
    bottom: 0,
    width: '120%',
  },
  achievementBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.s,
    borderRadius: spacing.l,
    gap: spacing.s,
    marginTop: spacing.m,
    shadowColor: colors.warning,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  verticalAchievementBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.s,
    borderRadius: spacing.l,
    gap: spacing.s,
    marginTop: spacing.s,
    width: '80%',
    alignSelf: 'center',
    shadowColor: colors.warning,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  achievementIcon: {
    fontSize: 16,
  },
  achievementText: {
    ...typography.caption,
    color: colors.warning,
    fontWeight: '700',
  },
  progressContent: {
    alignItems: 'center',
  },
  centralProgress: {
    alignItems: 'center',
    marginBottom: spacing.l,
  },
  progressRingContainer: {
    marginBottom: spacing.m,
  },
  progressRingOuter: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 8,
    borderColor: colors.gray200,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  progressRingFill: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 8,
    borderColor: 'transparent',
    borderTopColor: colors.brandTeal,
    borderRightColor: colors.success,
  },
  progressCenter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressMainNumber: {
    ...typography.h1,
    fontSize: 28,
    color: colors.brandTeal,
    fontWeight: '800',
  },
  progressCenterLabel: {
    ...typography.caption,
    color: colors.gray600,
    fontWeight: '600',
  },
  amountDisplay: {
    alignItems: 'center',
  },
  currentAmountLarge: {
    ...typography.h2,
    color: colors.gray900,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  targetAmountSmall: {
    ...typography.body,
    color: colors.gray600,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: spacing.m,
  },
  statCardNew: {
    flex: 1,
    borderRadius: spacing.l,
    padding: spacing.m,
    alignItems: 'center',
    ...shadows.medium,
  },
  statCardContent: {
    alignItems: 'center',
  },
  statCardIcon: {
    fontSize: 24,
    marginBottom: spacing.xs,
  },
  statCardValue: {
    ...typography.bodyLarge,
    color: colors.white,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  statCardLabel: {
    ...typography.caption,
    color: colors.white,
    opacity: 0.9,
    textAlign: 'center',
  },
  // Actions Section Styles
  actionsSection: {
    marginBottom: spacing.l,
  },
  actionsSectionHeader: {
    marginBottom: spacing.l,
    paddingHorizontal: spacing.m,
  },
  actionsSectionTitle: {
    ...typography.h2,
    color: colors.gray900,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  actionsSectionSubtitle: {
    ...typography.body,
    color: colors.gray600,
    opacity: 0.8,
  },
  primaryActionsContainer: {
    gap: spacing.m,
    marginBottom: spacing.l,
  },
  primaryActionButton: {
    borderRadius: spacing.l,
    paddingVertical: spacing.m,
    paddingHorizontal: spacing.l,
    ...shadows.medium,
  },
  primaryActionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.m,
  },
  primaryActionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryActionIcon: {
    fontSize: 20,
  },
  primaryActionTextContainer: {
    flex: 1,
  },
  primaryActionTitle: {
    ...typography.bodyLarge,
    color: colors.white,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  primaryActionSubtitle: {
    ...typography.caption,
    color: colors.white,
    opacity: 0.9,
  },
  primaryActionArrow: {
    ...typography.h3,
    color: colors.white,
    opacity: 0.7,
  },
  secondaryActionsContainer: {
    marginBottom: spacing.l,
  },
  secondaryActionsTitle: {
    ...typography.bodyLarge,
    color: colors.gray700,
    fontWeight: '600',
    marginBottom: spacing.m,
    paddingHorizontal: spacing.m,
  },
  secondaryActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.m,
  },
  secondaryActionCard: {
    width: (width - spacing.l * 2 - spacing.m) / 2,
    borderRadius: spacing.l,
    padding: spacing.m,
    alignItems: 'center',
    ...shadows.small,
  },
  secondaryActionContent: {
    alignItems: 'center',
  },
  secondaryActionIcon: {
    fontSize: 24,
    marginBottom: spacing.xs,
  },
  secondaryActionLabel: {
    ...typography.caption,
    color: colors.white,
    fontWeight: '600',
    textAlign: 'center',
  },
  leaderSection: {
    marginTop: spacing.l,
    paddingTop: spacing.m,
    borderTopWidth: 1,
    borderTopColor: colors.gray200,
  },
  leaderBadge: {
    paddingVertical: spacing.m,
    paddingHorizontal: spacing.l,
    borderRadius: spacing.xl,
    marginBottom: spacing.l,
    alignItems: 'center',
    ...shadows.small,
  },
  leaderBadgeText: {
    ...typography.bodyLarge,
    color: colors.brandTeal,
    fontWeight: '800',
    fontSize: 14,
  },
  leaderActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'stretch',
    gap: spacing.m,
  },
  leaderActionItem: {
    flex: 1,
    minWidth: '30%',
    position: 'relative',
  },
  leaderActionButton: {
    flex: 1,
    borderRadius: spacing.l,
    paddingVertical: spacing.l,
    paddingHorizontal: spacing.m,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 80,
    position: 'relative',
    ...shadows.medium,
  },
  upiConfiguredBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.white,
    ...shadows.small,
  },
  upiConfiguredText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: '700',
  },
  leaderActionIcon: {
    fontSize: 20,
    marginBottom: spacing.s,
  },
  leaderActionText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: '700',
    textAlign: 'center',
    fontSize: 12,
  },
  // Visual Separator
  sectionSeparator: {
    height: 1,
    backgroundColor: colors.gray200,
    marginVertical: spacing.l,
    marginHorizontal: spacing.l,
    opacity: 0.5,
  },
  // Members Section Styles
  membersSection: {
    marginBottom: spacing.l, // Normal bottom margin
  },
  membersSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.l,
    paddingHorizontal: spacing.m,
  },
  membersHeaderContent: {
    flex: 1,
  },
  membersSectionTitle: {
    ...typography.h2,
    color: colors.gray900,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  membersSectionSubtitle: {
    ...typography.body,
    color: colors.gray600,
    opacity: 0.8,
  },
  membersHistoryButton: {
    paddingVertical: spacing.s,
    paddingHorizontal: spacing.m,
    borderRadius: spacing.m,
    ...shadows.small,
  },
  membersHistoryText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: '600',
  },
  enhancedMembersList: {
    gap: spacing.m,
  },
  memberCardWrapper: {
    position: 'relative',
  },
  enhancedMemberCard: {
    borderRadius: spacing.l,
    padding: spacing.m,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.m,
    ...shadows.medium,
  },
  memberLeftSection: {
    alignItems: 'center',
  },
  memberAvatarWrapper: {
    position: 'relative',
  },
  enhancedMemberAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.medium,
  },
  enhancedMemberAvatarText: {
    ...typography.h3,
    color: colors.white,
    fontWeight: '700',
  },
  enhancedCrownBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.warning,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.small,
  },
  enhancedCrownText: {
    fontSize: 12,
  },
  memberStatusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    position: 'absolute',
    bottom: 2,
    right: 2,
    borderWidth: 2,
    borderColor: colors.white,
  },
  memberRightSection: {
    flex: 1,
  },
  memberTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
  },
  memberNameContainer: {
    flex: 1,
    marginRight: spacing.s,
  },
  enhancedMemberName: {
    ...typography.bodyLarge,
    color: colors.gray900,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  memberRoleText: {
    ...typography.caption,
    color: colors.warning,
    fontWeight: '600',
    opacity: 0.8,
  },
  enhancedStatusChip: {
    paddingHorizontal: spacing.s,
    paddingVertical: spacing.xs,
    borderRadius: spacing.s,
  },
  enhancedStatusChipText: {
    ...typography.caption,
    fontWeight: '600',
    fontSize: 10,
  },
  enhancedMemberEmail: {
    ...typography.caption,
    color: colors.gray600,
    marginBottom: spacing.s,
  },
  memberStatsRow: {
    flexDirection: 'row',
    gap: spacing.s,
  },
  enhancedContributionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.s,
    paddingVertical: spacing.xs,
    borderRadius: spacing.s,
    gap: spacing.xs,
  },
  enhancedContributionIcon: {
    fontSize: 12,
  },
  enhancedContributionAmount: {
    ...typography.caption,
    color: colors.brandTeal,
    fontWeight: '600',
    fontSize: 11,
  },
  enhancedDateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.s,
    paddingVertical: spacing.xs,
    borderRadius: spacing.s,
    gap: spacing.xs,
  },
  enhancedDateIcon: {
    fontSize: 12,
  },
  enhancedLastContribution: {
    ...typography.caption,
    color: colors.info,
    fontWeight: '600',
    fontSize: 11,
  },
  memberCardDecoration: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: colors.brandTeal,
    borderTopLeftRadius: spacing.l,
    borderBottomLeftRadius: spacing.l,
    opacity: 0.3,
  },
});

export default GroupDetailsScreen;


