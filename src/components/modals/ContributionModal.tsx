import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Alert } from 'react-native';
import Input from '../ui/Input';
import PrimaryButton from '../ui/PrimaryButton';
import { colors, typography, spacing, shadows } from '../../theme';
import { makeContributionApi } from '../../services/api';

interface ContributionModalProps {
  visible: boolean;
  onClose: () => void;
  groupId: string | number;
  groupName: string;
  onContributionMade?: () => void;
}

const ContributionModal: React.FC<ContributionModalProps> = ({
  visible,
  onClose,
  groupId,
  groupName,
  onContributionMade,
}) => {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    amount?: string;
    description?: string;
  }>({});

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!amount.trim()) {
      newErrors.amount = 'Amount is required';
    } else {
      const numAmount = parseFloat(amount);
      if (isNaN(numAmount) || numAmount <= 0) {
        newErrors.amount = 'Please enter a valid amount greater than 0';
      } else if (numAmount > 1000000) {
        newErrors.amount = 'Amount cannot exceed ₹10,00,000';
      }
    }

    if (description.trim().length > 200) {
      newErrors.description = 'Description cannot exceed 200 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContribution = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      
      const contributionData = {
        amount: parseFloat(amount),
        description: description.trim() || undefined,
      };

      await makeContributionApi(groupId, contributionData);
      
      Alert.alert(
        'Contribution Successful!',
        `You have successfully contributed ₹${parseFloat(amount).toLocaleString()} to ${groupName}`,
        [
          {
            text: 'OK',
            onPress: () => {
              handleClose();
              if (onContributionMade) {
                onContributionMade();
              }
            },
          },
        ]
      );
    } catch (error: any) {
      console.error('Failed to make contribution:', error);
      Alert.alert(
        'Contribution Failed',
        error.response?.data?.message || error.message || 'Failed to process contribution. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setAmount('');
    setDescription('');
    setErrors({});
    onClose();
  };

  const formatAmount = (text: string) => {
    // Remove non-numeric characters except decimal point
    const cleaned = text.replace(/[^0-9.]/g, '');
    
    // Ensure only one decimal point
    const parts = cleaned.split('.');
    if (parts.length > 2) {
      return parts[0] + '.' + parts.slice(1).join('');
    }
    
    return cleaned;
  };

  const handleAmountChange = (text: string) => {
    const formatted = formatAmount(text);
    setAmount(formatted);
    
    // Clear amount error when user starts typing
    if (errors.amount && formatted) {
      setErrors(prev => ({ ...prev, amount: undefined }));
    }
  };

  const quickAmounts = [100, 500, 1000, 2000, 5000];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.title}>Make Contribution</Text>
            <Text style={styles.subtitle}>Add funds to {groupName}</Text>
          </View>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <View style={styles.form}>
            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Contribution Details</Text>
              <Text style={styles.sectionDescription}>
                Enter the amount you want to contribute to the group savings.
              </Text>
            </View>

            <View style={styles.inputContainer}>
              <Input
                label="Amount (₹)"
                value={amount}
                onChangeText={handleAmountChange}
                placeholder="0.00"
                error={errors.amount}
                leftIcon="💰"
                keyboardType="decimal-pad"
                autoCorrect={false}
              />
            </View>

            <View style={styles.quickAmountsContainer}>
              <Text style={styles.quickAmountsLabel}>Quick amounts:</Text>
              <View style={styles.quickAmounts}>
                {quickAmounts.map((quickAmount) => (
                  <TouchableOpacity
                    key={quickAmount}
                    style={[
                      styles.quickAmountButton,
                      amount === quickAmount.toString() && styles.quickAmountButtonActive,
                    ]}
                    onPress={() => setAmount(quickAmount.toString())}
                  >
                    <Text style={[
                      styles.quickAmountText,
                      amount === quickAmount.toString() && styles.quickAmountTextActive,
                    ]}>
                      ₹{quickAmount.toLocaleString()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Input
                label="Description (Optional)"
                value={description}
                onChangeText={setDescription}
                placeholder="Add a note about this contribution"
                error={errors.description}
                leftIcon="📝"
                multiline={true}
                numberOfLines={3}
                maxLength={200}
                autoCorrect={true}
              />
              <Text style={styles.characterCount}>
                {description.length}/200 characters
              </Text>
            </View>

            <View style={styles.summaryBox}>
              <Text style={styles.summaryIcon}>💡</Text>
              <View style={styles.summaryContent}>
                <Text style={styles.summaryTitle}>Contribution Summary</Text>
                <Text style={styles.summaryText}>
                  Amount: <Text style={styles.summaryAmount}>
                    ₹{amount ? parseFloat(amount).toLocaleString() : '0'}
                  </Text>
                </Text>
                <Text style={styles.summaryNote}>
                  This contribution will be added to the group's total savings and will be visible to all members.
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.actions}>
            <PrimaryButton
              title="Cancel"
              onPress={handleClose}
              variant="outline"
              style={styles.cancelButton}
            />
            <PrimaryButton
              title={loading ? "Processing..." : "Contribute"}
              onPress={handleContribution}
              loading={loading}
              disabled={loading || !amount || parseFloat(amount) <= 0}
              style={styles.contributeButton}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.l,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
    ...shadows.small,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    ...typography.h3,
    color: colors.gray900,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    color: colors.gray600,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.gray100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: colors.gray600,
  },
  content: {
    flex: 1,
    padding: spacing.l,
    justifyContent: 'space-between',
  },
  form: {
    flex: 1,
  },
  formSection: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.gray900,
    marginBottom: spacing.s,
  },
  sectionDescription: {
    ...typography.body,
    color: colors.gray600,
    lineHeight: 22,
  },
  inputContainer: {
    marginBottom: spacing.l,
  },
  quickAmountsContainer: {
    marginBottom: spacing.l,
  },
  quickAmountsLabel: {
    ...typography.labelLarge,
    color: colors.gray700,
    marginBottom: spacing.s,
  },
  quickAmounts: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.s,
  },
  quickAmountButton: {
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    borderRadius: spacing.s,
    backgroundColor: colors.gray100,
    borderWidth: 1,
    borderColor: colors.gray200,
  },
  quickAmountButtonActive: {
    backgroundColor: colors.brandTeal,
    borderColor: colors.brandTeal,
  },
  quickAmountText: {
    ...typography.caption,
    color: colors.gray700,
    fontWeight: '600',
  },
  quickAmountTextActive: {
    color: colors.white,
  },
  characterCount: {
    ...typography.captionSmall,
    color: colors.gray500,
    textAlign: 'right',
    marginTop: spacing.xs,
  },
  summaryBox: {
    flexDirection: 'row',
    backgroundColor: colors.success + '10',
    padding: spacing.l,
    borderRadius: spacing.l,
    borderLeftWidth: 4,
    borderLeftColor: colors.success,
    marginTop: spacing.l,
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
    color: colors.success,
    marginBottom: spacing.xs,
  },
  summaryText: {
    ...typography.caption,
    color: colors.gray700,
    marginBottom: spacing.xs,
  },
  summaryAmount: {
    fontWeight: '600',
    color: colors.success,
  },
  summaryNote: {
    ...typography.captionSmall,
    color: colors.gray600,
    lineHeight: 18,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.m,
    paddingTop: spacing.l,
    borderTopWidth: 1,
    borderTopColor: colors.gray200,
  },
  cancelButton: {
    flex: 1,
  },
  contributeButton: {
    flex: 2,
  },
});

export default ContributionModal;
