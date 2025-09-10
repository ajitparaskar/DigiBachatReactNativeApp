import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { createLoanRequestApi } from '../services/api';
import Container from '../components/ui/Container';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import PrimaryButton from '../components/ui/PrimaryButton';
import { colors, typography, spacing } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'LoanRequest'>;

const LoanRequestScreen: React.FC<Props> = ({ navigation, route }) => {
  const { groupId, groupName } = route.params;
  const [amount, setAmount] = useState('');
  const [purpose, setPurpose] = useState('');
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid loan amount');
      return false;
    }

    if (!purpose.trim()) {
      Alert.alert('Missing Purpose', 'Please explain the purpose of this loan');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await createLoanRequestApi(groupId, {
        amount: Number(amount),
        purpose: purpose.trim(),
      });

      if (response?.data) {
        Alert.alert(
          'Loan Request Submitted',
          'Your loan request has been submitted successfully. Group leaders will review your request.',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      } else {
        throw new Error('Failed to submit loan request');
      }
    } catch (error: any) {
      console.error('Loan request error:', error);
      let errorMessage = 'Failed to submit loan request. Please try again.';
      
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }

      Alert.alert('Request Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Container style={styles.content}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.title}>Request a Loan</Text>
            <Text style={styles.subtitle}>
              Submit a loan request to {groupName}
            </Text>
          </View>

          <Card variant="elevated" style={styles.formCard}>
            <View style={styles.infoSection}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>💰 Requesting from:</Text>
                <Text style={styles.infoValue}>{groupName}</Text>
              </View>
              <Text style={styles.infoNote}>
                Your request will be reviewed by group leaders
              </Text>
            </View>

            <Input
              label="Loan Amount ($)"
              placeholder="Enter the amount you need"
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
              style={styles.input}
            />

            <View style={styles.textAreaContainer}>
              <Text style={styles.textAreaLabel}>Purpose of Loan *</Text>
              <Input
                placeholder="Explain why you need this loan and how you plan to use it"
                value={purpose}
                onChangeText={setPurpose}
                multiline={true}
                numberOfLines={4}
                style={[styles.input, styles.textArea]}
              />
            </View>

            <View style={styles.guidelines}>
              <Text style={styles.guidelinesTitle}>📋 Loan Guidelines:</Text>
              <View style={styles.guidelinesList}>
                <Text style={styles.guideline}>• Be clear about your purpose</Text>
                <Text style={styles.guideline}>• Ensure you can repay on time</Text>
                <Text style={styles.guideline}>• Interest rates are set by group leaders</Text>
                <Text style={styles.guideline}>• Late payments may incur penalties</Text>
              </View>
            </View>

            <PrimaryButton
              title={loading ? 'Submitting Request...' : 'Submit Loan Request'}
              onPress={handleSubmit}
              loading={loading}
              disabled={loading || !amount || !purpose.trim()}
              size="large"
              style={styles.submitButton}
            />
          </Card>
        </ScrollView>
      </Container>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
  },
  content: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  header: {
    paddingHorizontal: spacing.l,
    paddingTop: spacing.l,
    marginBottom: spacing.l,
  },
  title: {
    ...typography.h2,
    color: colors.brandTeal,
    textAlign: 'center',
    marginBottom: spacing.s,
  },
  subtitle: {
    ...typography.body,
    color: colors.gray600,
    textAlign: 'center',
  },
  formCard: {
    marginHorizontal: spacing.l,
    marginBottom: spacing.l,
  },
  infoSection: {
    backgroundColor: colors.brandTealLight,
    padding: spacing.m,
    borderRadius: spacing.m,
    marginBottom: spacing.l,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.s,
  },
  infoLabel: {
    ...typography.label,
    color: colors.brandTealDark,
  },
  infoValue: {
    ...typography.label,
    color: colors.brandTealDark,
    fontWeight: '600',
  },
  infoNote: {
    ...typography.caption,
    color: colors.brandTealDark,
    fontStyle: 'italic',
  },
  input: {
    marginBottom: spacing.m,
  },
  textAreaContainer: {
    marginBottom: spacing.m,
  },
  textAreaLabel: {
    ...typography.label,
    color: colors.gray700,
    marginBottom: spacing.s,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  guidelines: {
    backgroundColor: colors.gray100,
    padding: spacing.m,
    borderRadius: spacing.m,
    marginBottom: spacing.l,
  },
  guidelinesTitle: {
    ...typography.labelLarge,
    color: colors.gray800,
    marginBottom: spacing.s,
  },
  guidelinesList: {
    gap: spacing.xs,
  },
  guideline: {
    ...typography.caption,
    color: colors.gray600,
    lineHeight: 18,
  },
  submitButton: {
    marginTop: spacing.m,
  },
});

export default LoanRequestScreen;
