import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Alert, 
  ScrollView, 
  TouchableOpacity,
  StatusBar
} from 'react-native';
import Container from '../components/ui/Container';
import Card from '../components/ui/Card';
import PrimaryButton from '../components/ui/PrimaryButton';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { contributeToGroupApi, getGroupApi } from '../services/api';
import { colors, typography, spacing } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Contribution'>;

interface GroupData {
  id: number;
  name: string;
  description: string;
  savings_amount: number;
  savings_frequency: 'weekly' | 'monthly';
  group_code: string;
}

const ContributionScreen: React.FC<Props> = ({ route, navigation }) => {
  const { groupId } = route.params;
  const [group, setGroup] = useState<GroupData | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<string>('upi');
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string>('');

  const paymentMethods = [
    { id: 'upi', name: 'UPI', icon: '📱', description: 'Pay via UPI apps like GPay, PhonePe' },
    { id: 'bank', name: 'Bank Transfer', icon: '🏦', description: 'Direct bank transfer' },
    { id: 'cash', name: 'Cash', icon: '💵', description: 'Cash payment' },
    { id: 'wallet', name: 'Digital Wallet', icon: '💳', description: 'Paytm, Mobikwik, etc.' }
  ];

  useEffect(() => {
    loadGroupData();
  }, [groupId]);

  const loadGroupData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await getGroupApi(groupId);
      
      if (response?.data?.data?.group) {
        setGroup(response.data.data.group);
      } else if (response?.data?.group) {
        setGroup(response.data.group);
      } else {
        throw new Error('Group data not found');
      }
    } catch (err: any) {
      console.error('Failed to load group data:', err);
      setError('Failed to load group information');
      Alert.alert('Error', err?.message || 'Failed to load group information');
    } finally {
      setLoading(false);
    }
  };

  const handleContribute = async () => {
    if (!group || !selectedMethod) {
      Alert.alert('Error', 'Please select a payment method');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      await contributeToGroupApi(groupId, selectedMethod);
      
      Alert.alert(
        'Contribution Successful! ✅', 
        `Your contribution of ₹${group.savings_amount.toLocaleString()} to "${group.name}" has been processed successfully via ${paymentMethods.find(p => p.id === selectedMethod)?.name}.`,
        [
          {
            text: 'View Group',
            onPress: () => navigation.navigate('GroupDetails', { groupId })
          },
          {
            text: 'Done',
            onPress: () => navigation.goBack()
          }
        ]
      );
    } catch (err: any) {
      console.error('Contribution failed:', err);
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to process contribution';
      setError(errorMessage);
      Alert.alert('Contribution Failed', errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const getNextContributionDate = () => {
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
      year: 'numeric'
    });
  };

  if (loading) {
    return <LoadingSpinner text="Loading contribution details..." />;
  }

  if (error && !group) {
    return (
      <>
        <StatusBar barStyle="dark-content" backgroundColor={colors.backgroundSecondary} />
        <Container style={styles.container}>
          <View style={styles.errorState}>
            <Text style={styles.errorIcon}>⚠️</Text>
            <Text style={styles.errorTitle}>Failed to Load Group</Text>
            <Text style={styles.errorDescription}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={loadGroupData}>
              <Text style={styles.retryButtonText}>🔄 Retry</Text>
            </TouchableOpacity>
          </View>
        </Container>
      </>
    );
  }

  if (!group) {
    return (
      <>
        <StatusBar barStyle="dark-content" backgroundColor={colors.backgroundSecondary} />
        <Container style={styles.container}>
          <View style={styles.errorState}>
            <Text style={styles.errorIcon}>🔍</Text>
            <Text style={styles.errorTitle}>Group Not Found</Text>
            <Text style={styles.errorDescription}>The requested group could not be found</Text>
          </View>
        </Container>
      </>
    );
  }

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor={colors.backgroundSecondary} />
      <Container style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Make Contribution</Text>
            <Text style={styles.subtitle}>Contribute to your savings group</Text>
          </View>

          {/* Group Information Card */}
          <Card variant="elevated" style={styles.groupInfoCard}>
            <View style={styles.groupHeader}>
              <View style={styles.groupIcon}>
                <Text style={styles.groupIconText}>👥</Text>
              </View>
              <View style={styles.groupDetails}>
                <Text style={styles.groupName}>{group.name}</Text>
                <Text style={styles.groupDescription}>{group.description}</Text>
                <Text style={styles.groupCode}>Code: {group.group_code}</Text>
              </View>
            </View>
            
            <View style={styles.contributionDetails}>
              <View style={styles.amountSection}>
                <Text style={styles.amountLabel}>Contribution Amount</Text>
                <Text style={styles.amountValue}>₹{group.savings_amount.toLocaleString()}</Text>
              </View>
              
              <View style={styles.frequencySection}>
                <View style={styles.frequencyItem}>
                  <Text style={styles.frequencyLabel}>Frequency</Text>
                  <Text style={styles.frequencyValue}>{group.savings_frequency.charAt(0).toUpperCase() + group.savings_frequency.slice(1)}</Text>
                </View>
                <View style={styles.frequencyItem}>
                  <Text style={styles.frequencyLabel}>Next Due</Text>
                  <Text style={styles.frequencyValue}>{getNextContributionDate()}</Text>
                </View>
              </View>
            </View>
          </Card>

          {/* Payment Methods */}
          <Card variant="elevated" style={styles.paymentCard}>
            <Text style={styles.paymentTitle}>Select Payment Method</Text>
            <Text style={styles.paymentSubtitle}>Choose how you'd like to make your contribution</Text>
            
            <View style={styles.paymentMethods}>
              {paymentMethods.map((method) => (
                <TouchableOpacity
                  key={method.id}
                  style={[
                    styles.paymentMethod,
                    selectedMethod === method.id && styles.selectedPaymentMethod
                  ]}
                  onPress={() => setSelectedMethod(method.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.paymentMethodContent}>
                    <Text style={styles.paymentMethodIcon}>{method.icon}</Text>
                    <View style={styles.paymentMethodText}>
                      <Text style={[
                        styles.paymentMethodName,
                        selectedMethod === method.id && styles.selectedPaymentMethodName
                      ]}>
                        {method.name}
                      </Text>
                      <Text style={[
                        styles.paymentMethodDescription,
                        selectedMethod === method.id && styles.selectedPaymentMethodDescription
                      ]}>
                        {method.description}
                      </Text>
                    </View>
                  </View>
                  <View style={[
                    styles.radioButton,
                    selectedMethod === method.id && styles.selectedRadioButton
                  ]}>
                    {selectedMethod === method.id && <View style={styles.radioButtonInner} />}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </Card>

          {/* Summary Card */}
          <Card variant="elevated" style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Contribution Summary</Text>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Group</Text>
              <Text style={styles.summaryValue}>{group.name}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Amount</Text>
              <Text style={styles.summaryValue}>₹{group.savings_amount.toLocaleString()}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Payment Method</Text>
              <Text style={styles.summaryValue}>
                {paymentMethods.find(p => p.id === selectedMethod)?.name || 'Not Selected'}
              </Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryTotal}>
              <Text style={styles.summaryTotalLabel}>Total Amount</Text>
              <Text style={styles.summaryTotalValue}>₹{group.savings_amount.toLocaleString()}</Text>
            </View>
          </Card>

          {error && (
            <Card variant="outlined" style={styles.errorCard}>
              <Text style={styles.errorText}>{error}</Text>
            </Card>
          )}

          {/* Contribute Button */}
          <PrimaryButton
            title={isProcessing ? 'Processing Payment...' : 'Proceed to Pay'}
            onPress={handleContribute}
            loading={isProcessing}
            disabled={isProcessing || !selectedMethod}
            size="large"
            style={styles.contributeButton}
          />

          {/* Information Note */}
          <Card variant="outlined" style={styles.infoCard}>
            <Text style={styles.infoTitle}>📝 Important Information</Text>
            <View style={styles.infoList}>
              <Text style={styles.infoItem}>• Contributions are processed securely</Text>
              <Text style={styles.infoItem}>• You will receive a confirmation once payment is complete</Text>
              <Text style={styles.infoItem}>• Regular contributions help achieve group goals faster</Text>
              <Text style={styles.infoItem}>• Contact group leader for any payment issues</Text>
            </View>
          </Card>
        </ScrollView>
      </Container>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.backgroundSecondary,
  },
  // Header
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
  // Group Information Card
  groupInfoCard: {
    marginHorizontal: spacing.l,
    marginBottom: spacing.l,
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.l,
  },
  groupIcon: {
    width: 56,
    height: 56,
    backgroundColor: colors.brandTeal,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.m,
  },
  groupIconText: {
    fontSize: 24,
    color: colors.white,
  },
  groupDetails: {
    flex: 1,
  },
  groupName: {
    ...typography.h3,
    color: colors.gray900,
    marginBottom: spacing.xs,
  },
  groupDescription: {
    ...typography.body,
    color: colors.gray600,
    marginBottom: spacing.xs,
  },
  groupCode: {
    ...typography.caption,
    color: colors.gray500,
    fontFamily: 'monospace',
  },
  contributionDetails: {
    borderTopWidth: 1,
    borderTopColor: colors.gray200,
    paddingTop: spacing.l,
  },
  amountSection: {
    alignItems: 'center',
    marginBottom: spacing.l,
  },
  amountLabel: {
    ...typography.label,
    color: colors.gray600,
    marginBottom: spacing.s,
  },
  amountValue: {
    ...typography.h1,
    color: colors.brandTeal,
    fontWeight: '700',
  },
  frequencySection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  frequencyItem: {
    alignItems: 'center',
  },
  frequencyLabel: {
    ...typography.captionSmall,
    color: colors.gray500,
    marginBottom: spacing.xs,
  },
  frequencyValue: {
    ...typography.labelLarge,
    color: colors.gray900,
    fontWeight: '600',
  },
  // Payment Methods
  paymentCard: {
    marginHorizontal: spacing.l,
    marginBottom: spacing.l,
  },
  paymentTitle: {
    ...typography.h3,
    color: colors.gray900,
    marginBottom: spacing.s,
  },
  paymentSubtitle: {
    ...typography.body,
    color: colors.gray600,
    marginBottom: spacing.l,
  },
  paymentMethods: {
    gap: spacing.s,
  },
  paymentMethod: {
    borderWidth: 1,
    borderColor: colors.gray300,
    borderRadius: spacing.m,
    padding: spacing.m,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectedPaymentMethod: {
    borderColor: colors.brandTeal,
    backgroundColor: colors.brandTealLight,
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
  paymentMethodText: {
    flex: 1,
  },
  paymentMethodName: {
    ...typography.labelLarge,
    color: colors.gray900,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  selectedPaymentMethodName: {
    color: colors.brandTealDark,
  },
  paymentMethodDescription: {
    ...typography.captionSmall,
    color: colors.gray500,
  },
  selectedPaymentMethodDescription: {
    color: colors.brandTealDark,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.gray400,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedRadioButton: {
    borderColor: colors.brandTeal,
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.brandTeal,
  },
  // Summary Card
  summaryCard: {
    marginHorizontal: spacing.l,
    marginBottom: spacing.l,
  },
  summaryTitle: {
    ...typography.h3,
    color: colors.gray900,
    marginBottom: spacing.l,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.m,
  },
  summaryLabel: {
    ...typography.body,
    color: colors.gray600,
  },
  summaryValue: {
    ...typography.labelLarge,
    color: colors.gray900,
    fontWeight: '600',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: colors.gray200,
    marginVertical: spacing.m,
  },
  summaryTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryTotalLabel: {
    ...typography.labelLarge,
    color: colors.gray900,
    fontWeight: '600',
  },
  summaryTotalValue: {
    ...typography.h3,
    color: colors.brandTeal,
    fontWeight: '700',
  },
  // Contribute Button
  contributeButton: {
    marginHorizontal: spacing.l,
    marginBottom: spacing.l,
  },
  // Information Card
  infoCard: {
    marginHorizontal: spacing.l,
    marginBottom: spacing.xl,
    backgroundColor: colors.gray100,
  },
  infoTitle: {
    ...typography.labelLarge,
    color: colors.gray800,
    marginBottom: spacing.m,
  },
  infoList: {
    gap: spacing.s,
  },
  infoItem: {
    ...typography.caption,
    color: colors.gray600,
    lineHeight: 18,
  },
  // Error States
  errorState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.xxl,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: spacing.l,
  },
  errorTitle: {
    ...typography.h3,
    color: colors.gray700,
    textAlign: 'center',
    marginBottom: spacing.s,
  },
  errorDescription: {
    ...typography.body,
    color: colors.gray500,
    textAlign: 'center',
    marginBottom: spacing.l,
  },
  errorCard: {
    marginHorizontal: spacing.l,
    marginBottom: spacing.l,
    backgroundColor: colors.dangerLight,
    borderColor: colors.danger,
  },
  errorText: {
    ...typography.body,
    color: colors.danger,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: colors.brandTeal,
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.m,
    borderRadius: spacing.m,
  },
  retryButtonText: {
    ...typography.labelLarge,
    color: colors.white,
  },
});

export default ContributionScreen;



