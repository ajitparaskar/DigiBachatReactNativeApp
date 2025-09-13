import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Alert, 
  ScrollView, 
  TouchableOpacity,
  StatusBar,
  TextInput,
  Modal,
  AppState,
  AppStateStatus,
  Platform
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Container from '../components/ui/Container';
import Card from '../components/ui/Card';
import PrimaryButton from '../components/ui/PrimaryButton';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { contributeToGroupApi, getGroupApi } from '../services/api';
import { upiService, PaymentRequest } from '../services/upiService';
import { colors, typography, spacing, shadows } from '../theme';
import { showDebugInfo, checkUPICapabilities } from '../utils/debugInfo';

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
  
  // UPI Payment States
  const [currentPaymentRequest, setCurrentPaymentRequest] = useState<PaymentRequest | null>(null);
  const [groupUpiDetails, setGroupUpiDetails] = useState<{ upiId: string; upiName: string } | null>(null);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationStep, setVerificationStep] = useState<'waiting' | 'manual' | 'success' | 'failed'>('waiting');
  const [userTransactionId, setUserTransactionId] = useState('');
  const [paymentAppReturned, setPaymentAppReturned] = useState(false);

  const paymentMethods = [
    { id: 'upi', name: 'UPI Payment', icon: '📱', description: 'Instant payment via UPI apps', enabled: true },
    { id: 'bank', name: 'Bank Transfer', icon: '🏦', description: 'Manual bank transfer', enabled: false },
    { id: 'cash', name: 'Cash Payment', icon: '💵', description: 'Offline cash payment', enabled: false },
    { id: 'wallet', name: 'Digital Wallet', icon: '💳', description: 'Other payment wallets', enabled: false }
  ];

  // Update selection to UPI if available and no method is selected
  React.useEffect(() => {
    if (groupUpiDetails && selectedMethod === 'upi') {
      // UPI is already selected, no change needed
    } else if (!groupUpiDetails && selectedMethod === 'upi') {
      // UPI was selected but not available, reset to first available method
      const firstAvailable = paymentMethods.find(m => m.enabled && m.id !== 'upi');
      if (firstAvailable) {
        setSelectedMethod(firstAvailable.id);
      }
    }
  }, [groupUpiDetails]);

  useEffect(() => {
    loadGroupData();
  }, [groupId]);

  // Handle app state changes for payment verification
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      console.log('\ud83d\udd04 App state changed:', nextAppState);
      
      if (nextAppState === 'active' && currentPaymentRequest && !paymentAppReturned) {
        console.log('\u2705 User returned from UPI app, starting verification...');
        setPaymentAppReturned(true);
        
        // Small delay to let the UI settle
        setTimeout(() => {
          setShowVerificationModal(true);
          startAutomaticVerification();
        }, 1500); // Increased delay for better UX
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, [currentPaymentRequest, paymentAppReturned]);

  const loadGroupData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const [groupResponse, upiDetailsResponse] = await Promise.all([
        getGroupApi(groupId),
        upiService.getGroupUPIDetails(groupId.toString())
      ]);
      
      if (groupResponse?.data?.data?.group) {
        setGroup(groupResponse.data.data.group);
      } else if (groupResponse?.data?.group) {
        setGroup(groupResponse.data.group);
      } else {
        throw new Error('Group data not found');
      }
      
      // Load UPI details for the group
      setGroupUpiDetails(upiDetailsResponse);
      
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

    if (selectedMethod === 'upi') {
      await handleUPIPayment();
    } else {
      await handleOtherPaymentMethods();
    }
  };

  const handleUPIPayment = async () => {
    if (!group || !groupUpiDetails) {
      Alert.alert(
        'UPI Setup Required',
        'UPI payment is not set up for this group. Please contact the group admin to configure UPI details.',
        [{ text: 'OK' }]
      );
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      console.log('🚀 Starting UPI payment flow...');
      
      // Show payment instructions
      upiService.showPaymentInstructions();
      
      // Validate and get amount (try different field names)
      const amount = group.savings_amount || group.monthly_contribution || group.contribution_amount || 500; // Default to 500 rupees if not set
      console.log('🔍 Group amount validation:', {
        savings_amount: group.savings_amount,
        monthly_contribution: group.monthly_contribution,
        contribution_amount: group.contribution_amount,
        final_amount: amount,
        amount_type: typeof amount,
        group_keys: Object.keys(group || {})
      });
      
      // Create payment request
      const paymentRequest = await upiService.createPaymentRequest(
        groupId.toString(),
        amount,
        `Monthly contribution - ${group.name}`
      );
      
      console.log('✅ Payment request created:', paymentRequest.paymentId);
      
      setCurrentPaymentRequest(paymentRequest);
      setPaymentAppReturned(false);
      
      // Initiate UPI payment - this will redirect to UPI app or simulate
      const paymentInitiated = await upiService.initiateUPIPayment(paymentRequest, groupUpiDetails);
      
      if (paymentInitiated) {
        console.log('✅ UPI payment initiated successfully');
        
        // For development/simulation, show verification modal immediately
        if (__DEV__ || Platform.OS === 'web' || Platform.OS === 'windows' || Platform.OS === 'macos') {
          setPaymentAppReturned(true);
          setTimeout(() => {
            setShowVerificationModal(true);
            startAutomaticVerification();
          }, 1000);
        } else {
          // For real devices, show a helpful message
          console.log('\ud83d\udcf1 UPI app launched. Waiting for user to return...');
          
          // Set a longer timeout as fallback in case app state change doesn't work
          setTimeout(() => {
            if (currentPaymentRequest && !paymentAppReturned) {
              console.log('\u23f0 Fallback: Auto-showing verification modal after timeout');
              setPaymentAppReturned(true);
              setShowVerificationModal(true);
              startAutomaticVerification();
            }
          }, 10000); // 10 seconds fallback
        }
      } else {
        // Payment was cancelled or failed
        setCurrentPaymentRequest(null);
      }
      
    } catch (error: any) {
      console.error('UPI payment failed:', error);
      setError(error.message || 'Failed to initiate UPI payment');
      Alert.alert('Payment Failed', error.message || 'Failed to initiate UPI payment');
      setCurrentPaymentRequest(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleOtherPaymentMethods = async () => {
    if (!group) return;
    
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

  const startAutomaticVerification = async () => {
    if (!currentPaymentRequest) return;

    setVerificationStep('waiting');
    
    try {
      // Wait a bit for the payment to process
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const result = await upiService.verifyPayment(currentPaymentRequest.paymentId);
      
      if (result.success && result.status === 'completed') {
        setVerificationStep('success');
        handlePaymentSuccess(result.message);
      } else if (result.status === 'failed') {
        setVerificationStep('failed');
      } else {
        // Payment is still pending, ask user for transaction ID
        setVerificationStep('manual');
      }
    } catch (error) {
      console.error('Auto verification failed:', error);
      setVerificationStep('manual');
    }
  };

  const handleManualVerification = async () => {
    if (!currentPaymentRequest || !userTransactionId.trim()) {
      Alert.alert('Error', 'Please enter the transaction ID');
      return;
    }

    try {
      const result = await upiService.verifyPayment(currentPaymentRequest.paymentId, userTransactionId.trim());
      
      if (result.success && result.status === 'completed') {
        setVerificationStep('success');
        handlePaymentSuccess(result.message);
      } else {
        Alert.alert('Verification Failed', result.message || 'Could not verify payment');
        setVerificationStep('failed');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Verification failed');
      setVerificationStep('failed');
    }
  };

  const handlePaymentSuccess = async (message?: string) => {
    if (!currentPaymentRequest || !group) return;
    
    try {
      // Call backend API to record the contribution
      console.log('\ud83d\udcbe Recording contribution in backend...');
      await contributeToGroupApi(groupId, 'upi', {
        amount: currentPaymentRequest.amount,
        paymentId: currentPaymentRequest.paymentId,
        transactionId: userTransactionId || 'AUTO_' + Date.now(),
        upiId: groupUpiDetails?.upiId,
        note: currentPaymentRequest.note
      });
      
      console.log('\u2705 Contribution recorded in backend successfully');
      
      // Show success message
      upiService.showPaymentSuccess(currentPaymentRequest.amount, userTransactionId);
      
    } catch (error: any) {
      console.error('\u274c Failed to record contribution in backend:', error);
      // Still show success since UPI payment was completed
      Alert.alert(
        'Payment Successful \u2705',
        `Your UPI payment of \u20b9${currentPaymentRequest.amount} was successful, but there was an issue updating the records. Please contact support with payment ID: ${currentPaymentRequest.paymentId}`,
        [{ text: 'OK' }]
      );
    } finally {
      // Reset states
      setCurrentPaymentRequest(null);
      setShowVerificationModal(false);
      setPaymentAppReturned(false);
      setUserTransactionId('');
      setVerificationStep('waiting');
      
      // Navigate back or to group details
      setTimeout(() => {
        navigation.navigate('GroupDetails', { groupId });
      }, 2000);
    }
  };

  const handlePaymentCancel = () => {
    setCurrentPaymentRequest(null);
    setShowVerificationModal(false);
    setPaymentAppReturned(false);
    setUserTransactionId('');
    setVerificationStep('waiting');
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
                <Text style={styles.amountValue}>₹{(group.savings_amount || group.monthly_contribution || group.contribution_amount || 500).toLocaleString()}</Text>
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
              {paymentMethods.map((method) => {
                const isUPI = method.id === 'upi';
                const isEnabled = method.enabled || (isUPI && groupUpiDetails);
                const isUPINotSetup = isUPI && !groupUpiDetails;
                
                return (
                  <TouchableOpacity
                    key={method.id}
                    style={[
                      styles.paymentMethod,
                      selectedMethod === method.id && styles.selectedPaymentMethod,
                      !isEnabled && styles.disabledPaymentMethod
                    ]}
                    onPress={() => {
                      if (isEnabled) {
                        setSelectedMethod(method.id);
                      } else if (isUPINotSetup) {
                        Alert.alert(
                          'UPI Setup Required',
                          'UPI payment is not configured for this group. Please contact the group admin to set up UPI details.',
                          [{ text: 'OK' }]
                        );
                      } else {
                        Alert.alert(
                          'Coming Soon',
                          `${method.name} will be available in a future update.`,
                          [{ text: 'OK' }]
                        );
                      }
                    }}
                    activeOpacity={isEnabled ? 0.7 : 0.3}
                    disabled={!isEnabled && !isUPINotSetup}
                  >
                    <View style={styles.paymentMethodContent}>
                      <Text style={[
                        styles.paymentMethodIcon,
                        !isEnabled && styles.disabledText
                      ]}>
                        {method.icon}
                      </Text>
                      <View style={styles.paymentMethodText}>
                        <View style={styles.paymentMethodHeader}>
                          <Text style={[
                            styles.paymentMethodName,
                            selectedMethod === method.id && styles.selectedPaymentMethodName,
                            !isEnabled && styles.disabledText
                          ]}>
                            {method.name}
                          </Text>
                          {isUPI && groupUpiDetails && (
                            <View style={styles.upiStatusBadge}>
                              <Text style={styles.upiStatusText}>✓ Ready</Text>
                            </View>
                          )}
                          {isUPINotSetup && (
                            <View style={styles.upiSetupBadge}>
                              <Text style={styles.upiSetupText}>Setup Required</Text>
                            </View>
                          )}
                          {!method.enabled && !isUPI && (
                            <View style={styles.comingSoonBadge}>
                              <Text style={styles.comingSoonText}>Coming Soon</Text>
                            </View>
                          )}
                        </View>
                        <Text style={[
                          styles.paymentMethodDescription,
                          selectedMethod === method.id && styles.selectedPaymentMethodDescription,
                          !isEnabled && styles.disabledText
                        ]}>
                          {isUPI && groupUpiDetails
                            ? `Pay to ${groupUpiDetails.upiName} (${groupUpiDetails.upiId})`
                            : method.description
                          }
                        </Text>
                      </View>
                    </View>
                    <View style={[
                      styles.radioButton,
                      selectedMethod === method.id && styles.selectedRadioButton,
                      !isEnabled && styles.disabledRadioButton
                    ]}>
                      {selectedMethod === method.id && isEnabled && (
                        <View style={styles.radioButtonInner} />
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
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
              <Text style={styles.summaryValue}>₹{(group.savings_amount || group.monthly_contribution || group.contribution_amount || 500).toLocaleString()}</Text>
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
              <Text style={styles.summaryTotalValue}>₹{(group.savings_amount || group.monthly_contribution || group.contribution_amount || 500).toLocaleString()}</Text>
            </View>
          </Card>

          {error && (
            <Card variant="outlined" style={styles.errorCard}>
              <Text style={styles.errorText}>{error}</Text>
            </Card>
          )}

          {/* Debug Section (Development Only) */}
          {__DEV__ && (
            <Card variant="outlined" style={styles.debugCard}>
              <Text style={styles.debugTitle}>🛠️ Debug Tools</Text>
              <View style={styles.debugButtons}>
                <TouchableOpacity 
                  style={styles.debugButton} 
                  onPress={showDebugInfo}
                >
                  <Text style={styles.debugButtonText}>📱 Platform Info</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.debugButton} 
                  onPress={async () => {
                    try {
                      const capabilities = await checkUPICapabilities();
                      Alert.alert(
                        'UPI Capabilities',
                        `Platform: ${Platform.OS}\n\nUPI App Support:\n${Object.entries(capabilities)
                          .map(([scheme, canOpen]) => `• ${scheme}: ${canOpen ? '✅' : '❌'}`)
                          .join('\n')}\n\nNote: On development environment, UPI deep linking may not work as expected.`,
                        [{ text: 'OK' }]
                      );
                    } catch (error) {
                      console.error('Error checking UPI capabilities:', error);
                    }
                  }}
                >
                  <Text style={styles.debugButtonText}>💳 UPI Check</Text>
                </TouchableOpacity>
              </View>
            </Card>
          )}

          {/* Contribute Button */}
          <PrimaryButton
            title={
              isProcessing 
                ? (selectedMethod === 'upi' ? 'Opening UPI App...' : 'Processing Payment...') 
                : (selectedMethod === 'upi' && groupUpiDetails ? 'Pay with UPI' : 'Proceed to Pay')
            }
            onPress={handleContribute}
            loading={isProcessing}
            disabled={
              isProcessing || 
              !selectedMethod || 
              (selectedMethod === 'upi' && !groupUpiDetails)
            }
            size="large"
            style={styles.contributeButton}
          />
          
          {/* Manual Verification Button (shown when payment is in progress) */}
          {currentPaymentRequest && !showVerificationModal && !isProcessing && (
            <TouchableOpacity
              style={styles.manualVerifyButton}
              onPress={() => {
                console.log('\ud83d\udc86 User manually triggered payment verification');
                setPaymentAppReturned(true);
                setShowVerificationModal(true);
                startAutomaticVerification();
              }}
            >
              <Text style={styles.manualVerifyButtonText}>
                🔍 Completed Payment? Verify Now
              </Text>
            </TouchableOpacity>
          )}

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
      
      {/* Payment Verification Modal */}
      <Modal
        visible={showVerificationModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handlePaymentCancel}
      >
        <View style={styles.verificationModal}>
          <LinearGradient
            colors={[colors.brandTeal, colors.success]}
            style={styles.verificationHeader}
          >
            <Text style={styles.verificationTitle}>Payment Verification</Text>
            <Text style={styles.verificationSubtitle}>
              Verifying your payment of ₹{currentPaymentRequest?.amount.toLocaleString()}
            </Text>
          </LinearGradient>
          
          <View style={styles.verificationContent}>
            {verificationStep === 'waiting' && (
              <View style={styles.verificationStep}>
                <View style={styles.loadingContainer}>
                  <Text style={styles.loadingSpinner}>⏳</Text>
                </View>
                <Text style={styles.verificationStepTitle}>Verifying Payment...</Text>
                <Text style={styles.verificationStepText}>
                  Please wait while we verify your payment with the bank.
                </Text>
              </View>
            )}
            
            {verificationStep === 'manual' && (
              <View style={styles.verificationStep}>
                <Text style={styles.verificationStepIcon}>📝</Text>
                <Text style={styles.verificationStepTitle}>Manual Verification</Text>
                <Text style={styles.verificationStepText}>
                  We need your transaction ID to verify the payment. You can find this in your UPI app.
                </Text>
                
                <View style={styles.transactionIdSection}>
                  <Text style={styles.inputLabel}>Transaction ID</Text>
                  <TextInput
                    style={styles.transactionIdInput}
                    value={userTransactionId}
                    onChangeText={setUserTransactionId}
                    placeholder="Enter transaction ID from UPI app"
                    placeholderTextColor={colors.gray400}
                    autoCapitalize="characters"
                  />
                  
                  <PrimaryButton
                    title="Verify Payment"
                    onPress={handleManualVerification}
                    disabled={!userTransactionId.trim()}
                    style={styles.verifyButton}
                  />
                </View>
              </View>
            )}
            
            {verificationStep === 'success' && (
              <View style={styles.verificationStep}>
                <Text style={styles.verificationStepIcon}>✅</Text>
                <Text style={styles.verificationStepTitle}>Payment Successful!</Text>
                <Text style={styles.verificationStepText}>
                  Your contribution has been verified and added to the group savings.
                </Text>
              </View>
            )}
            
            {verificationStep === 'failed' && (
              <View style={styles.verificationStep}>
                <Text style={styles.verificationStepIcon}>❌</Text>
                <Text style={styles.verificationStepTitle}>Payment Failed</Text>
                <Text style={styles.verificationStepText}>
                  We could not verify your payment. Please try again or contact support.
                </Text>
                
                <View style={styles.verificationActions}>
                  <TouchableOpacity
                    style={styles.retryButton}
                    onPress={() => setVerificationStep('manual')}
                  >
                    <Text style={styles.retryButtonText}>Try Manual Verification</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
          
          <View style={styles.verificationFooter}>
            <TouchableOpacity
              style={styles.cancelPaymentButton}
              onPress={handlePaymentCancel}
            >
              <Text style={styles.cancelPaymentButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  // UPI Payment Method Styles
  paymentMethodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  upiStatusBadge: {
    backgroundColor: colors.success + '20',
    paddingHorizontal: spacing.s,
    paddingVertical: spacing.xs,
    borderRadius: spacing.xs,
  },
  upiStatusText: {
    ...typography.captionSmall,
    color: colors.success,
    fontWeight: '600',
    fontSize: 10,
  },
  upiSetupBadge: {
    backgroundColor: colors.warning + '20',
    paddingHorizontal: spacing.s,
    paddingVertical: spacing.xs,
    borderRadius: spacing.xs,
  },
  upiSetupText: {
    ...typography.captionSmall,
    color: colors.warning,
    fontWeight: '600',
    fontSize: 10,
  },
  comingSoonBadge: {
    backgroundColor: colors.gray200,
    paddingHorizontal: spacing.s,
    paddingVertical: spacing.xs,
    borderRadius: spacing.xs,
  },
  comingSoonText: {
    ...typography.captionSmall,
    color: colors.gray500,
    fontWeight: '600',
    fontSize: 10,
  },
  disabledPaymentMethod: {
    opacity: 0.6,
    backgroundColor: colors.gray50,
  },
  disabledText: {
    color: colors.gray400,
  },
  disabledRadioButton: {
    borderColor: colors.gray300,
  },
  // Payment Verification Modal Styles
  verificationModal: {
    flex: 1,
    backgroundColor: colors.white,
  },
  verificationHeader: {
    paddingTop: spacing.xl,
    paddingBottom: spacing.l,
    paddingHorizontal: spacing.l,
    alignItems: 'center',
  },
  verificationTitle: {
    ...typography.h2,
    color: colors.white,
    fontWeight: '700',
    marginBottom: spacing.s,
  },
  verificationSubtitle: {
    ...typography.body,
    color: colors.white,
    opacity: 0.9,
    textAlign: 'center',
  },
  verificationContent: {
    flex: 1,
    padding: spacing.l,
  },
  verificationStep: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.l,
  },
  loadingContainer: {
    marginBottom: spacing.l,
  },
  loadingSpinner: {
    fontSize: 48,
    textAlign: 'center',
  },
  verificationStepIcon: {
    fontSize: 64,
    marginBottom: spacing.l,
  },
  verificationStepTitle: {
    ...typography.h2,
    color: colors.gray900,
    fontWeight: '700',
    marginBottom: spacing.m,
    textAlign: 'center',
  },
  verificationStepText: {
    ...typography.body,
    color: colors.gray600,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.l,
  },
  transactionIdSection: {
    width: '100%',
    marginTop: spacing.l,
  },
  transactionIdInput: {
    borderWidth: 1,
    borderColor: colors.gray300,
    borderRadius: spacing.m,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.m,
    ...typography.body,
    color: colors.gray900,
    backgroundColor: colors.white,
    marginBottom: spacing.l,
    textAlign: 'center',
    fontFamily: 'monospace',
    ...shadows.small,
  },
  verifyButton: {
    width: '100%',
  },
  verificationActions: {
    width: '100%',
    marginTop: spacing.l,
  },
  retryButton: {
    backgroundColor: colors.warning,
    paddingVertical: spacing.m,
    paddingHorizontal: spacing.l,
    borderRadius: spacing.m,
    alignItems: 'center',
    ...shadows.small,
  },
  retryButtonText: {
    ...typography.labelLarge,
    color: colors.white,
    fontWeight: '600',
  },
  verificationFooter: {
    padding: spacing.l,
    borderTopWidth: 1,
    borderTopColor: colors.gray200,
  },
  cancelPaymentButton: {
    paddingVertical: spacing.m,
    alignItems: 'center',
  },
  cancelPaymentButtonText: {
    ...typography.labelLarge,
    color: colors.gray600,
    fontWeight: '600',
  },
  // Debug Styles (Development Only)
  debugCard: {
    marginHorizontal: spacing.l,
    marginBottom: spacing.l,
    backgroundColor: colors.warning + '10',
    borderColor: colors.warning,
  },
  debugTitle: {
    ...typography.labelLarge,
    color: colors.warning,
    fontWeight: '700',
    marginBottom: spacing.m,
  },
  debugButtons: {
    flexDirection: 'row',
    gap: spacing.s,
  },
  debugButton: {
    flex: 1,
    backgroundColor: colors.warning,
    paddingVertical: spacing.s,
    paddingHorizontal: spacing.m,
    borderRadius: spacing.s,
    alignItems: 'center',
  },
  debugButtonText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: '600',
  },
  // Manual Verification Button
  manualVerifyButton: {
    backgroundColor: colors.brandTeal + '15',
    borderWidth: 2,
    borderColor: colors.brandTeal,
    borderStyle: 'dashed',
    paddingVertical: spacing.m,
    paddingHorizontal: spacing.l,
    borderRadius: spacing.m,
    marginHorizontal: spacing.l,
    marginTop: spacing.m,
    alignItems: 'center',
  },
  manualVerifyButtonText: {
    ...typography.labelLarge,
    color: colors.brandTeal,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default ContributionScreen;



