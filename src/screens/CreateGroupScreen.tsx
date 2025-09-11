import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView, StatusBar, TouchableOpacity, Dimensions } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import Container from '../components/ui/Container';
import Card from '../components/ui/Card';
import PrimaryButton from '../components/ui/PrimaryButton';
import Input from '../components/ui/Input';
import { colors, typography, spacing, shadows } from '../theme';
import { createGroupApi } from '../services/api';

const { width } = Dimensions.get('window');

type Props = NativeStackScreenProps<RootStackParamList, 'CreateGroup'>;

const CreateGroupScreen: React.FC<Props> = ({ navigation }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [frequency, setFrequency] = useState<'weekly' | 'monthly'>('monthly');
  const [interestRate, setInterestRate] = useState('10');
  const [duration, setDuration] = useState('12');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
    amount?: string;
    interestRate?: string;
    duration?: string;
  }>({});

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!name.trim()) {
      newErrors.name = 'Group name is required';
    } else if (name.trim().length < 3) {
      newErrors.name = 'Group name must be at least 3 characters';
    }

    if (!amount.trim()) {
      newErrors.amount = 'Savings amount is required';
    } else {
      const numAmount = parseFloat(amount);
      if (isNaN(numAmount) || numAmount <= 0) {
        newErrors.amount = 'Please enter a valid amount greater than 0';
      } else if (numAmount > 100000) {
        newErrors.amount = 'Amount cannot exceed ₹1,00,000';
      }
    }

    const numInterestRate = parseFloat(interestRate);
    if (isNaN(numInterestRate) || numInterestRate < 0 || numInterestRate > 50) {
      newErrors.interestRate = 'Interest rate must be between 0-50%';
    }

    const numDuration = parseInt(duration);
    if (isNaN(numDuration) || numDuration < 1 || numDuration > 60) {
      newErrors.duration = 'Duration must be between 1-60 months';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateGroup = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const response = await createGroupApi({
        name: name.trim(),
        description: description.trim(),
        savings_frequency: frequency,
        savings_amount: Number(amount),
        interest_rate: Number(interestRate),
        default_loan_duration: Number(duration),
      });

      if (response.data?.success) {
        Alert.alert(
          'Group Created!',
          `Your savings group "${name}" has been created successfully. Share the group code with others to invite them.`,
          [
            {
              text: 'OK',
              onPress: () => {
                setName('');
                setDescription('');
                setAmount('');
                setInterestRate('10');
                setDuration('12');
                navigation.navigate('Groups');
              },
            },
          ]
        );
      } else {
        Alert.alert('Error', response.data?.message || 'Failed to create group');
      }
    } catch (error: any) {
      console.error('Create group error:', error);
      Alert.alert(
        'Creation Failed',
        error.response?.data?.message || error.message || 'Failed to create group. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (text: string) => {
    const cleaned = text.replace(/[^0-9.]/g, '');
    const parts = cleaned.split('.');
    if (parts.length > 2) {
      return parts[0] + '.' + parts.slice(1).join('');
    }
    return cleaned;
  };

  const handleAmountChange = (text: string) => {
    const formatted = formatAmount(text);
    setAmount(formatted);
    if (errors.amount && formatted) {
      setErrors(prev => ({ ...prev, amount: undefined }));
    }
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#0D7377" translucent />
      <LinearGradient
        colors={['#0D7377', '#14A085', '#41B3A3']}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={styles.backgroundGradient}
      >
        <KeyboardAvoidingView 
          style={styles.container} 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Premium Header Section */}
            <View style={styles.premiumHeader}>
              <LinearGradient
                colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.1)']}
                style={styles.headerIconContainer}
              >
                <Text style={styles.headerIcon}>✨</Text>
              </LinearGradient>
              <Text style={styles.premiumTitle}>Create New Group</Text>
              <Text style={styles.premiumSubtitle}>
                Start a new savings group and invite friends or family to save together.
              </Text>
            </View>
            
            <Container style={styles.content}>

            {/* Premium Form Card */}
            <View style={styles.premiumFormCard}>
              <LinearGradient
                colors={['rgba(255,255,255,0.95)', 'rgba(255,255,255,0.9)']}
                style={styles.formGradientCard}
              >
                <View style={styles.form}>
                <View style={styles.premiumSection}>
                  <View style={styles.sectionHeader}>
                    <LinearGradient
                      colors={['#667eea', '#764ba2']}
                      style={styles.sectionIconGradient}
                    >
                      <Text style={styles.sectionIconText}>👥</Text>
                    </LinearGradient>
                    <Text style={styles.premiumSectionTitle}>Basic Information</Text>
                  </View>
                  
                  <Input
                    label="Group Name"
                    value={name}
                    onChangeText={(text) => {
                      setName(text);
                      if (errors.name) setErrors(prev => ({ ...prev, name: undefined }));
                    }}
                    placeholder="Enter group name"
                    error={errors.name}
                    leftIcon="👥"
                    autoCapitalize="words"
                    maxLength={50}
                  />

                  <Input
                    label="Description (Optional)"
                    value={description}
                    onChangeText={setDescription}
                    placeholder="Describe your group's purpose"
                    leftIcon="📝"
                    multiline={true}
                    numberOfLines={3}
                    maxLength={200}
                  />
                </View>

                <View style={styles.premiumSection}>
                  <View style={styles.sectionHeader}>
                    <LinearGradient
                      colors={['#11998e', '#38ef7d']}
                      style={styles.sectionIconGradient}
                    >
                      <Text style={styles.sectionIconText}>💰</Text>
                    </LinearGradient>
                    <Text style={styles.premiumSectionTitle}>Savings Settings</Text>
                  </View>
                  
                  <Input
                    label="Savings Amount (₹)"
                    value={amount}
                    onChangeText={handleAmountChange}
                    placeholder="0.00"
                    error={errors.amount}
                    leftIcon="💰"
                    keyboardType="decimal-pad"
                  />

                  <View style={styles.frequencyContainer}>
                    <Text style={styles.frequencyLabel}>Savings Frequency</Text>
                    <View style={styles.frequencyButtons}>
                      <TouchableOpacity
                        style={[
                          styles.frequencyButton,
                          frequency === 'weekly' && styles.frequencyButtonActive,
                        ]}
                        onPress={() => setFrequency('weekly')}
                      >
                        <Text style={[
                          styles.frequencyButtonText,
                          frequency === 'weekly' && styles.frequencyButtonTextActive,
                        ]}>
                          Weekly
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[
                          styles.frequencyButton,
                          frequency === 'monthly' && styles.frequencyButtonActive,
                        ]}
                        onPress={() => setFrequency('monthly')}
                      >
                        <Text style={[
                          styles.frequencyButtonText,
                          frequency === 'monthly' && styles.frequencyButtonTextActive,
                        ]}>
                          Monthly
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>

                <View style={styles.premiumSection}>
                  <View style={styles.sectionHeader}>
                    <LinearGradient
                      colors={['#f093fb', '#f5576c']}
                      style={styles.sectionIconGradient}
                    >
                      <Text style={styles.sectionIconText}>📈</Text>
                    </LinearGradient>
                    <Text style={styles.premiumSectionTitle}>Loan Settings</Text>
                  </View>
                  
                  <Input
                    label="Interest Rate (%)"
                    value={interestRate}
                    onChangeText={(text) => {
                      setInterestRate(text.replace(/[^0-9.]/g, ''));
                      if (errors.interestRate) setErrors(prev => ({ ...prev, interestRate: undefined }));
                    }}
                    placeholder="10"
                    error={errors.interestRate}
                    leftIcon="📈"
                    keyboardType="decimal-pad"
                  />

                  <Input
                    label="Default Loan Duration (months)"
                    value={duration}
                    onChangeText={(text) => {
                      setDuration(text.replace(/[^0-9]/g, ''));
                      if (errors.duration) setErrors(prev => ({ ...prev, duration: undefined }));
                    }}
                    placeholder="12"
                    error={errors.duration}
                    leftIcon="📅"
                    keyboardType="number-pad"
                  />
                </View>

                <LinearGradient
                  colors={['#667eea', '#764ba2']}
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 0}}
                  style={styles.premiumSummaryBox}
                >
                  <View style={styles.summaryIconWrapper}>
                    <Text style={styles.premiumSummaryIcon}>📋</Text>
                  </View>
                  <View style={styles.summaryContent}>
                    <Text style={styles.premiumSummaryTitle}>Group Summary</Text>
                    <Text style={styles.premiumSummaryText}>
                      Members will save ₹{amount || '0'} {frequency} with {interestRate || '0'}% interest on loans.
                    </Text>
                  </View>
                </LinearGradient>

                <TouchableOpacity
                  onPress={handleCreateGroup}
                  disabled={loading || !name.trim() || !amount.trim()}
                  activeOpacity={0.8}
                  style={[styles.premiumCreateButton, (loading || !name.trim() || !amount.trim()) && styles.premiumCreateButtonDisabled]}
                >
                  <LinearGradient
                    colors={loading || !name.trim() || !amount.trim() ? ['#cccccc', '#999999'] : ['#11998e', '#38ef7d']}
                    start={{x: 0, y: 0}}
                    end={{x: 1, y: 0}}
                    style={styles.createButtonGradient}
                  >
                    <Text style={styles.createButtonText}>
                      {loading ? '✨ Creating Group...' : '🚀 Create Group'}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
                </View>
              </LinearGradient>
            </View>
          </Container>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </>
  );
};

const styles = StyleSheet.create({
  backgroundGradient: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  premiumHeader: {
    alignItems: 'center',
    paddingTop: spacing.xxl + 20,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.l,
  },
  headerIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.m,
    ...shadows.large,
  },
  headerIcon: {
    fontSize: 40,
    color: colors.white,
  },
  premiumTitle: {
    ...typography.h2,
    color: colors.white,
    textAlign: 'center',
    marginBottom: spacing.s,
    fontWeight: '800',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  premiumSubtitle: {
    ...typography.body,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 300,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.l,
    paddingBottom: spacing.xl,
  },
  premiumFormCard: {
    marginBottom: spacing.xl,
    borderRadius: spacing.xxl,
    overflow: 'hidden',
    ...shadows.xlarge,
  },
  formGradientCard: {
    padding: spacing.xl,
  },
  form: {
    gap: spacing.xl,
  },
  premiumSection: {
    gap: spacing.l,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.m,
  },
  sectionIconGradient: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.m,
    ...shadows.medium,
  },
  sectionIconText: {
    fontSize: 20,
    color: colors.white,
  },
  premiumSectionTitle: {
    ...typography.h4,
    color: colors.gray900,
    fontWeight: '700',
  },
  frequencyContainer: {
    gap: spacing.s,
  },
  frequencyLabel: {
    ...typography.labelLarge,
    color: colors.gray700,
  },
  frequencyButtons: {
    flexDirection: 'row',
    gap: spacing.s,
  },
  frequencyButton: {
    flex: 1,
    paddingVertical: spacing.m,
    paddingHorizontal: spacing.l,
    borderRadius: spacing.m,
    backgroundColor: colors.gray100,
    borderWidth: 1,
    borderColor: colors.gray200,
    alignItems: 'center',
  },
  frequencyButtonActive: {
    backgroundColor: colors.brandTeal,
    borderColor: colors.brandTeal,
  },
  frequencyButtonText: {
    ...typography.button,
    color: colors.gray700,
  },
  frequencyButtonTextActive: {
    color: colors.white,
  },
  premiumSummaryBox: {
    flexDirection: 'row',
    padding: spacing.l,
    borderRadius: spacing.xl,
    alignItems: 'center',
    ...shadows.large,
  },
  summaryIconWrapper: {
    marginRight: spacing.m,
  },
  premiumSummaryIcon: {
    fontSize: 24,
    color: colors.white,
  },
  summaryContent: {
    flex: 1,
  },
  premiumSummaryTitle: {
    ...typography.labelLarge,
    color: colors.white,
    marginBottom: spacing.xs,
    fontWeight: '700',
  },
  premiumSummaryText: {
    ...typography.caption,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 20,
  },
  premiumCreateButton: {
    marginTop: spacing.l,
    borderRadius: spacing.xl,
    overflow: 'hidden',
    ...shadows.large,
  },
  premiumCreateButtonDisabled: {
    opacity: 0.6,
  },
  createButtonGradient: {
    paddingVertical: spacing.l,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createButtonText: {
    ...typography.button,
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
});

export default CreateGroupScreen;
