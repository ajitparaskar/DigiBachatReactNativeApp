import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView, StatusBar, TouchableOpacity } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import Container from '../components/ui/Container';
import Card from '../components/ui/Card';
import PrimaryButton from '../components/ui/PrimaryButton';
import Input from '../components/ui/Input';
import { colors, typography, spacing, shadows } from '../theme';
import { createGroupApi } from '../services/api';

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
      <StatusBar barStyle="dark-content" backgroundColor={colors.backgroundSecondary} />
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Container style={styles.content}>
            <View style={styles.header}>
              <Text style={styles.headerIcon}>➕</Text>
              <Text style={styles.title}>Create New Group</Text>
              <Text style={styles.subtitle}>
                Start a new savings group and invite friends or family to save together.
              </Text>
            </View>

            <Card style={styles.formCard}>
              <View style={styles.form}>
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Basic Information</Text>
                  
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

                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Savings Settings</Text>
                  
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

                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Loan Settings</Text>
                  
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

                <View style={styles.summaryBox}>
                  <Text style={styles.summaryIcon}>📋</Text>
                  <View style={styles.summaryContent}>
                    <Text style={styles.summaryTitle}>Group Summary</Text>
                    <Text style={styles.summaryText}>
                      Members will save ₹{amount || '0'} {frequency} with {interestRate || '0'}% interest on loans.
                    </Text>
                  </View>
                </View>

                <PrimaryButton
                  title={loading ? 'Creating Group...' : 'Create Group'}
                  onPress={handleCreateGroup}
                  loading={loading}
                  disabled={loading || !name.trim() || !amount.trim()}
                  style={styles.createButton}
                />
              </View>
            </Card>
          </Container>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: spacing.l,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  headerIcon: {
    fontSize: 64,
    marginBottom: spacing.m,
  },
  title: {
    ...typography.h2,
    color: colors.gray900,
    textAlign: 'center',
    marginBottom: spacing.s,
  },
  subtitle: {
    ...typography.body,
    color: colors.gray600,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 300,
  },
  formCard: {
    marginBottom: spacing.xl,
  },
  form: {
    gap: spacing.l,
  },
  section: {
    gap: spacing.m,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.gray900,
    marginBottom: spacing.s,
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
  summaryBox: {
    flexDirection: 'row',
    backgroundColor: colors.brandTeal + '10',
    padding: spacing.l,
    borderRadius: spacing.l,
    borderLeftWidth: 4,
    borderLeftColor: colors.brandTeal,
  },
  summaryIcon: {
    fontSize: 20,
    marginRight: spacing.m,
  },
  summaryContent: {
    flex: 1,
  },
  summaryTitle: {
    ...typography.labelLarge,
    color: colors.brandTeal,
    marginBottom: spacing.xs,
  },
  summaryText: {
    ...typography.caption,
    color: colors.gray700,
    lineHeight: 20,
  },
  createButton: {
    marginTop: spacing.m,
  },
});

export default CreateGroupScreen;
