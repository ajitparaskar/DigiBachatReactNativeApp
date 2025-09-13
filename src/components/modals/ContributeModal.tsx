import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  Switch,
} from 'react-native';
import { colors, typography, spacing, shadows } from '../../theme';
import { contributeToGroupApi, makeScheduledContributionApi } from '../../services/api';

interface ContributeModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  group: {
    id: string | number;
    name: string;
    savings_amount: number;
    savings_frequency: 'weekly' | 'monthly';
  } | null;
}

const ContributeModal: React.FC<ContributeModalProps> = ({ visible, onClose, onSuccess, group }) => {
  const [selectedMethod, setSelectedMethod] = useState<string>('upi');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string>('');
  const [scheduledContribution, setScheduledContribution] = useState(false);
  const [recurringContribution, setRecurringContribution] = useState(false);

  const paymentMethods = [
    { id: 'upi', name: 'UPI', icon: '📱', description: 'Pay via UPI apps' },
    { id: 'bank', name: 'Bank Transfer', icon: '🏦', description: 'Direct bank transfer' },
    { id: 'card', name: 'Credit/Debit Card', icon: '💳', description: 'Pay using your card' },
    { id: 'netbanking', name: 'Net Banking', icon: '💻', description: 'Online banking' },
    { id: 'wallet', name: 'Digital Wallet', icon: '📲', description: 'PayTM, PhonePe, etc.' },
  ];

  const resetForm = () => {
    setSelectedMethod('upi');
    setScheduledContribution(false);
    setRecurringContribution(false);
    setError('');
  };

  const handleSubmit = async () => {
    if (!group) return;

    setError('');
    setIsProcessing(true);

    try {
      if (scheduledContribution) {
        await makeScheduledContributionApi(group.id, {
          paymentMethod: selectedMethod,
          recurring: recurringContribution,
        });
      } else {
        await contributeToGroupApi(group.id, selectedMethod);
      }

      Alert.alert(
        'Success',
        `Contribution of ₹${group.savings_amount} to "${group.name}" has been ${scheduledContribution ? 'scheduled' : 'processed'} successfully!`,
        [{ text: 'OK', onPress: () => { resetForm(); onClose(); onSuccess?.(); } }]
      );
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to process contribution';
      setError(errorMessage);
      Alert.alert('Error', errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const calculateNextContributionDate = () => {
    if (!group) return '';
    const today = new Date();
    let nextDate = new Date(today);
    
    if (group.savings_frequency === 'weekly') {
      nextDate.setDate(today.getDate() + 7);
    } else if (group.savings_frequency === 'monthly') {
      nextDate.setMonth(today.getMonth() + 1);
    }
    
    return nextDate.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Make Contribution</Text>
            <Text style={styles.subtitle}>
              Contributing ₹{group?.savings_amount?.toLocaleString()} to {group?.name}
            </Text>
          </View>
          <TouchableOpacity onPress={() => { resetForm(); onClose(); }} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Contribution Info */}
          <View style={styles.infoCard}>
            <View style={styles.infoHeader}>
              <Text style={styles.infoIcon}>💰</Text>
              <View>
                <Text style={styles.infoTitle}>Contribution Details</Text>
                <Text style={styles.infoDescription}>
                  {group?.savings_frequency} contribution for {group?.name}
                </Text>
              </View>
            </View>
            <View style={styles.infoStats}>
              <View style={styles.infoStat}>
                <Text style={styles.infoStatLabel}>Amount</Text>
                <Text style={styles.infoStatValue}>₹{group?.savings_amount?.toLocaleString()}</Text>
              </View>
              <View style={styles.infoStat}>
                <Text style={styles.infoStatLabel}>Frequency</Text>
                <Text style={styles.infoStatValue}>{group?.savings_frequency}</Text>
              </View>
              <View style={styles.infoStat}>
                <Text style={styles.infoStatLabel}>Next Due</Text>
                <Text style={styles.infoStatValue}>{calculateNextContributionDate()}</Text>
              </View>
            </View>
          </View>

          {/* Payment Method Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select Payment Method</Text>
            <View style={styles.paymentMethods}>
              {paymentMethods.map((method) => (
                <TouchableOpacity
                  key={method.id}
                  style={[
                    styles.paymentMethod,
                    selectedMethod === method.id && styles.paymentMethodActive,
                  ]}
                  onPress={() => setSelectedMethod(method.id)}
                >
                  <View style={styles.paymentMethodContent}>
                    <Text style={styles.paymentMethodIcon}>{method.icon}</Text>
                    <View style={styles.paymentMethodInfo}>
                      <Text style={[
                        styles.paymentMethodName,
                        selectedMethod === method.id && styles.paymentMethodNameActive,
                      ]}>
                        {method.name}
                      </Text>
                      <Text style={styles.paymentMethodDescription}>{method.description}</Text>
                    </View>
                  </View>
                  <View style={[
                    styles.radioButton,
                    selectedMethod === method.id && styles.radioButtonActive,
                  ]}>
                    {selectedMethod === method.id && <View style={styles.radioButtonInner} />}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Scheduling Options */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contribution Options</Text>
            
            <View style={styles.optionItem}>
              <View style={styles.optionContent}>
                <Text style={styles.optionIcon}>⏰</Text>
                <View style={styles.optionInfo}>
                  <Text style={styles.optionTitle}>Schedule for Later</Text>
                  <Text style={styles.optionDescription}>
                    Process this contribution on the next due date
                  </Text>
                </View>
              </View>
              <Switch
                value={scheduledContribution}
                onValueChange={setScheduledContribution}
                trackColor={{ false: colors.gray300, true: colors.brandTeal }}
                thumbColor={scheduledContribution ? colors.white : colors.gray500}
              />
            </View>

            {scheduledContribution && (
              <View style={styles.optionItem}>
                <View style={styles.optionContent}>
                  <Text style={styles.optionIcon}>🔄</Text>
                  <View style={styles.optionInfo}>
                    <Text style={styles.optionTitle}>Recurring Contribution</Text>
                    <Text style={styles.optionDescription}>
                      Automatically contribute {group?.savings_frequency}
                    </Text>
                  </View>
                </View>
                <Switch
                  value={recurringContribution}
                  onValueChange={setRecurringContribution}
                  trackColor={{ false: colors.gray300, true: colors.brandTeal }}
                  thumbColor={recurringContribution ? colors.white : colors.gray500}
                />
              </View>
            )}
          </View>

          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}
        </ScrollView>

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => { resetForm(); onClose(); }}
            disabled={isProcessing}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.contributeButton, isProcessing && styles.contributeButtonDisabled]}
            onPress={handleSubmit}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.contributeButtonText}>
                {scheduledContribution ? 'Schedule Contribution' : 'Proceed to Pay'}
              </Text>
            )}
          </TouchableOpacity>
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
    alignItems: 'flex-start',
    padding: spacing.l,
    paddingTop: spacing.xl,
    backgroundColor: colors.white,
    ...shadows.small,
  },
  title: {
    ...typography.h2,
    color: colors.gray900,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    color: colors.gray600,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.gray100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: colors.gray600,
  },
  content: {
    flex: 1,
    padding: spacing.l,
  },
  infoCard: {
    backgroundColor: colors.white,
    borderRadius: spacing.m,
    padding: spacing.l,
    marginBottom: spacing.xl,
    ...shadows.small,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.m,
  },
  infoIcon: {
    fontSize: 32,
    marginRight: spacing.m,
  },
  infoTitle: {
    ...typography.h4,
    color: colors.gray900,
    fontWeight: '600',
  },
  infoDescription: {
    ...typography.body,
    color: colors.gray600,
  },
  infoStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoStat: {
    flex: 1,
    alignItems: 'center',
  },
  infoStatLabel: {
    ...typography.captionSmall,
    color: colors.gray500,
    textTransform: 'uppercase',
    marginBottom: spacing.xs,
  },
  infoStatValue: {
    ...typography.body,
    color: colors.gray900,
    fontWeight: '600',
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.gray900,
    fontWeight: '600',
    marginBottom: spacing.m,
  },
  paymentMethods: {
    gap: spacing.s,
  },
  paymentMethod: {
    backgroundColor: colors.white,
    borderRadius: spacing.m,
    padding: spacing.m,
    borderWidth: 2,
    borderColor: colors.gray200,
  },
  paymentMethodActive: {
    borderColor: colors.brandTeal,
    backgroundColor: colors.brandTeal + '10',
  },
  paymentMethodContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  paymentMethodIcon: {
    fontSize: 24,
    marginRight: spacing.m,
  },
  paymentMethodInfo: {
    flex: 1,
  },
  paymentMethodName: {
    ...typography.body,
    color: colors.gray900,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  paymentMethodNameActive: {
    color: colors.brandTeal,
  },
  paymentMethodDescription: {
    ...typography.caption,
    color: colors.gray500,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.gray300,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.s,
  },
  radioButtonActive: {
    borderColor: colors.brandTeal,
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.brandTeal,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    borderRadius: spacing.m,
    padding: spacing.m,
    marginBottom: spacing.m,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionIcon: {
    fontSize: 24,
    marginRight: spacing.m,
  },
  optionInfo: {
    flex: 1,
  },
  optionTitle: {
    ...typography.body,
    color: colors.gray900,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  optionDescription: {
    ...typography.caption,
    color: colors.gray600,
  },
  errorContainer: {
    backgroundColor: colors.danger + '20',
    borderRadius: spacing.s,
    padding: spacing.m,
    marginBottom: spacing.m,
  },
  errorText: {
    ...typography.body,
    color: colors.danger,
    textAlign: 'center',
  },
  actionContainer: {
    flexDirection: 'row',
    padding: spacing.l,
    paddingTop: spacing.m,
    backgroundColor: colors.white,
    ...shadows.small,
    gap: spacing.m,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: spacing.m,
    borderRadius: spacing.m,
    backgroundColor: colors.gray100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    ...typography.body,
    color: colors.gray700,
    fontWeight: '600',
  },
  contributeButton: {
    flex: 2,
    paddingVertical: spacing.m,
    borderRadius: spacing.m,
    backgroundColor: colors.brandTeal,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contributeButtonDisabled: {
    backgroundColor: colors.gray400,
  },
  contributeButtonText: {
    ...typography.body,
    color: colors.white,
    fontWeight: '700',
  },
});

export default ContributeModal;
