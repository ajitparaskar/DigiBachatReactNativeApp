import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView, StatusBar, TouchableOpacity } from 'react-native';
import Container from '../components/ui/Container';
import Card from '../components/ui/Card';
import PrimaryButton from '../components/ui/PrimaryButton';
import Input from '../components/ui/Input';
import { colors, typography, spacing, shadows } from '../theme';
import { createGroupApi } from '../services/api';

const CreateGroupScreen: React.FC = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [frequency, setFrequency] = useState<'weekly' | 'monthly'>('monthly');
  const [interestRate, setInterestRate] = useState('0');
  const [duration, setDuration] = useState('12');
  const [loading, setLoading] = useState(false);

  const create = async () => {
    if (!name || !amount) {
      Alert.alert('Missing fields', 'Name and amount are required');
      return;
    }
    setLoading(true);
    try {
      await createGroupApi({
        name,
        description,
        savings_frequency: frequency,
        savings_amount: Number(amount),
        interest_rate: Number(interestRate),
        default_loan_duration: Number(duration),
      });
      Alert.alert('Success', 'Group created successfully!');
      setName('');
      setDescription('');
      setAmount('');
      setInterestRate('0');
      setDuration('12');
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Failed to create group');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor={colors.backgroundSecondary} />
      <KeyboardAvoidingView 
        style={styles.keyboardView} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Container scrollable style={styles.container}>
          <View style={styles.header}>
            <View style={styles.headerIcon}>
              <Text style={styles.iconText}>🏦</Text>
            </View>
            <Text style={styles.title}>Create New Group</Text>
            <Text style={styles.subtitle}>
              Set up a savings group and invite members to join your financial journey together
            </Text>
          </View>

          <Card variant="elevated" style={styles.detailsCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Group Details</Text>
              <Text style={styles.sectionSubtitle}>Basic information about your group</Text>
            </View>
            
            <Input
              label="Group Name *"
              placeholder="e.g., Family Savings Circle"
              value={name}
              onChangeText={setName}
            />
            
            <Input
              label="Description"
              placeholder="What is this group for? (optional)"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
            />
          </Card>

          <Card variant="elevated" style={styles.configCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Savings Configuration</Text>
              <Text style={styles.sectionSubtitle}>Set up contribution and loan terms</Text>
            </View>
            
            <Input
              label="Savings Amount *"
              placeholder="Enter amount per contribution"
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
              leftIcon={<Text style={styles.currencyIcon}>₹</Text>}
            />
            
            <View style={styles.frequencyContainer}>
              <Text style={styles.frequencyLabel}>Contribution Frequency</Text>
              <View style={styles.frequencyOptions}>
                <TouchableOpacity 
                  style={[styles.frequencyOption, frequency === 'weekly' && styles.frequencyActive]}
                  onPress={() => setFrequency('weekly')}
                >
                  <Text style={[styles.frequencyText, frequency === 'weekly' && styles.frequencyTextActive]}>Weekly</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.frequencyOption, frequency === 'monthly' && styles.frequencyActive]}
                  onPress={() => setFrequency('monthly')}
                >
                  <Text style={[styles.frequencyText, frequency === 'monthly' && styles.frequencyTextActive]}>Monthly</Text>
                </TouchableOpacity>
              </View>
            </View>
            
            <Input
              label="Interest Rate (%)"
              placeholder="Annual interest rate"
              keyboardType="numeric"
              value={interestRate}
              onChangeText={setInterestRate}
              rightIcon={<Text style={styles.percentIcon}>%</Text>}
            />
            
            <Input
              label="Default Loan Duration (months)"
              placeholder="Loan repayment period"
              keyboardType="numeric"
              value={duration}
              onChangeText={setDuration}
            />
          </Card>

          <Card variant="outlined" style={styles.summaryCard}>
            <View style={styles.summaryHeader}>
              <Text style={styles.summaryTitle}>📊 Summary</Text>
            </View>
            <View style={styles.summaryContent}>
              <Text style={styles.summaryText}>Members will contribute <Text style={styles.highlight}>₹{amount || '0'}</Text> {frequency}</Text>
              <Text style={styles.summaryText}>Interest rate: <Text style={styles.highlight}>{interestRate || '0'}%</Text> per year</Text>
              <Text style={styles.summaryText}>Default loan duration: <Text style={styles.highlight}>{duration || '12'}</Text> months</Text>
            </View>
          </Card>

          <View style={styles.actions}>
            <PrimaryButton 
              title={loading ? 'Creating Group...' : 'Create Group'} 
              onPress={create} 
              loading={loading}
              size="large"
            />
          </View>
        </Container>
      </KeyboardAvoidingView>
    </>
  );
};

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
  },
  container: {
    backgroundColor: 'transparent',
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
    paddingTop: spacing.l,
  },
  headerIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.brandTeal,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.l,
    ...shadows.medium,
  },
  iconText: {
    fontSize: 36,
    color: colors.white,
  },
  title: {
    ...typography.h2,
    marginBottom: spacing.s,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.body,
    color: colors.gray600,
    lineHeight: 28,
    textAlign: 'center',
    paddingHorizontal: spacing.m,
  },
  detailsCard: {
    marginBottom: spacing.l,
  },
  configCard: {
    marginBottom: spacing.l,
  },
  sectionHeader: {
    marginBottom: spacing.l,
  },
  sectionTitle: {
    ...typography.h3,
    marginBottom: spacing.xs,
    color: colors.gray900,
  },
  sectionSubtitle: {
    ...typography.caption,
    color: colors.gray500,
  },
  frequencyContainer: {
    marginBottom: spacing.m,
  },
  frequencyLabel: {
    ...typography.label,
    marginBottom: spacing.s,
    color: colors.gray700,
  },
  frequencyOptions: {
    flexDirection: 'row',
    gap: spacing.s,
  },
  frequencyOption: {
    flex: 1,
    paddingVertical: spacing.m,
    paddingHorizontal: spacing.l,
    borderRadius: spacing.m,
    borderWidth: 1,
    borderColor: colors.gray300,
    backgroundColor: colors.white,
    alignItems: 'center',
  },
  frequencyActive: {
    backgroundColor: colors.brandTeal,
    borderColor: colors.brandTeal,
  },
  frequencyText: {
    ...typography.label,
    color: colors.gray700,
  },
  frequencyTextActive: {
    color: colors.white,
    fontWeight: '600',
  },
  currencyIcon: {
    ...typography.body,
    color: colors.brandTeal,
    fontWeight: '600',
  },
  percentIcon: {
    ...typography.body,
    color: colors.gray500,
  },
  summaryCard: {
    marginBottom: spacing.l,
    backgroundColor: colors.infoLight,
    borderColor: colors.info,
  },
  summaryHeader: {
    marginBottom: spacing.m,
  },
  summaryTitle: {
    ...typography.h4,
    color: colors.info,
  },
  summaryContent: {
    gap: spacing.s,
  },
  summaryText: {
    ...typography.body,
    color: colors.gray700,
  },
  highlight: {
    fontWeight: '600',
    color: colors.brandTeal,
  },
  actions: {
    marginTop: spacing.l,
    paddingBottom: spacing.xl,
  },
});

export default CreateGroupScreen;



