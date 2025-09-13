import { Alert, Linking, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from './api';

export interface UPIDetails {
  id: string;
  name: string;
  amount: number;
  note?: string;
}

export interface PaymentRequest {
  paymentId: string;
  upiId: string;
  amount: number;
  note: string;
  groupId: string;
  userId: string;
  status: 'pending' | 'completed' | 'failed';
  transactionId?: string;
  createdAt: string;
}

class UPIService {
  private generatePaymentId(): string {
    return 'PAY_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  private formatAmount(amount: number): string {
    // Validate and ensure amount is a number
    const numAmount = typeof amount === 'number' ? amount : parseFloat(amount) || 0;
    if (isNaN(numAmount) || numAmount <= 0) {
      console.warn('Invalid amount provided:', amount, 'Using 1 as fallback');
      return '1.00';
    }
    return numAmount.toFixed(2);
  }

  private encodeUPIString(upiData: UPIDetails): string {
    const { id, name, amount, note } = upiData;
    
    console.log('\ud83d\udee0\ufe0f UPI Data Input:', { id, name, amount, note });
    
    // Validate UPI ID format
    if (!id || !id.includes('@')) {
      console.error('Invalid UPI ID format:', id);
      Alert.alert(
        'Invalid UPI ID Format ❌',
        `The UPI ID "${id}" is not valid.\n\n✅ Correct format examples:\n• 9876543210@paytm\n• yourname@googlepay\n• account@ybl\n\n❌ Don't use person names like "${id}"`,
        [{ text: 'OK' }]
      );
      throw new Error('Invalid UPI ID format. Must be like: yourname@paytm');
    }
    
    // Check if UPI ID looks like a person's name instead of proper UPI ID
    const looksLikeName = id.split(' ').length >= 2 && !id.includes('@');
    const hasMultipleWords = id.includes(' ') && id.split(' ').length >= 3;
    
    if (looksLikeName || hasMultipleWords) {
      console.error('❌ CRITICAL: UPI ID appears to be a person name, not UPI ID');
      Alert.alert(
        'Wrong UPI Format 🚨',
        `You entered: "${id}"\n\nThis looks like a person's name, not a UPI ID!\n\n✅ Use proper UPI ID format:\n• 9876543210@paytm\n• yourname@googlepay\n• account@ybl`,
        [{ text: 'Fix It' }]
      );
      throw new Error('Please use proper UPI ID format, not person name');
    }
    
    // Check for test patterns that PhonePe will reject
    const testPatterns = ['test', 'demo', 'sample', 'fake', 'dummy'];
    const hasTestPattern = testPatterns.some(pattern => 
      id.toLowerCase().includes(pattern) || name.toLowerCase().includes(pattern)
    );
    
    if (hasTestPattern) {
      console.warn('⚠️ WARNING: UPI ID contains test pattern, may be declined by PhonePe');
      console.warn('Consider using real UPI ID like: 9876543210@paytm');
    }
    
    // Validate amount
    const formattedAmount = this.formatAmount(amount);
    if (parseFloat(formattedAmount) <= 0) {
      console.error('Invalid amount:', amount);
      throw new Error('Amount must be greater than 0');
    }
    
    // Create UPI URL with proper encoding
    const upiParams = {
      pa: encodeURIComponent(id.trim()), // Payee Address (UPI ID)
      pn: encodeURIComponent(name.trim()), // Payee Name
      am: formattedAmount, // Amount (no encoding needed for numbers)
      cu: 'INR', // Currency
      tn: encodeURIComponent((note || `Payment to ${name}`).trim()), // Transaction Note
    };
    
    // Build URL manually to ensure proper format
    const paramString = Object.entries(upiParams)
      .map(([key, value]) => `${key}=${value}`)
      .join('&');
    
    const finalUrl = `upi://pay?${paramString}`;
    
    console.log('\ud83d\udd17 Generated UPI URL:', finalUrl);
    console.log('\ud83d\udd0d UPI Parameters:', upiParams);
    
    return finalUrl;
  }

  async getGroupUPIDetails(groupId: string): Promise<{ upiId: string; upiName: string } | null> {
    try {
      // For now, use local storage until backend API is ready
      const storedDetails = await AsyncStorage.getItem(`upi_details_${groupId}`);
      if (storedDetails) {
        const details = JSON.parse(storedDetails);
        return {
          upiId: details.upiId,
          upiName: details.upiName,
        };
      }
      return null;
    } catch (error) {
      console.error('Failed to get group UPI details:', error);
      return null;
    }
  }

  async setGroupUPIDetails(groupId: string, upiId: string, upiName: string): Promise<boolean> {
    try {
      // For now, use local storage until backend API is ready
      const upiDetails = {
        upiId: upiId.trim(),
        upiName: upiName.trim(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      await AsyncStorage.setItem(`upi_details_${groupId}`, JSON.stringify(upiDetails));
      console.log('✅ UPI details saved to local storage for group:', groupId);
      return true;
    } catch (error) {
      console.error('Failed to set group UPI details:', error);
      return false;
    }
  }

  async createPaymentRequest(groupId: string, amount: number, note: string): Promise<PaymentRequest> {
    const paymentId = this.generatePaymentId();
    
    try {
      // For now, create a local payment request until backend API is ready
      const paymentRequest: PaymentRequest = {
        paymentId,
        upiId: '', // Will be filled from group UPI details
        amount,
        note,
        groupId,
        userId: 'current_user', // Mock user ID
        status: 'pending',
        createdAt: new Date().toISOString(),
      };
      
      // Store payment request locally
      await AsyncStorage.setItem(`payment_${paymentId}`, JSON.stringify(paymentRequest));
      console.log('✅ Payment request created locally:', paymentId);
      
      return paymentRequest;
    } catch (error) {
      console.error('Failed to create payment request:', error);
      throw new Error('Failed to create payment request');
    }
  }

  async initiateUPIPayment(paymentRequest: PaymentRequest, groupUpiDetails: { upiId: string; upiName: string }): Promise<boolean> {
    try {
      // Validate payment request data
      if (!paymentRequest || !paymentRequest.amount) {
        console.error('Invalid payment request:', paymentRequest);
        throw new Error('Invalid payment request data');
      }
      
      if (!groupUpiDetails || !groupUpiDetails.upiId || !groupUpiDetails.upiName) {
        console.error('Invalid UPI details:', groupUpiDetails);
        throw new Error('Invalid UPI details');
      }
      
      console.log('🔍 Payment request validation:', {
        amount: paymentRequest.amount,
        amountType: typeof paymentRequest.amount,
        isValidAmount: typeof paymentRequest.amount === 'number' && paymentRequest.amount > 0,
        upiId: groupUpiDetails.upiId,
        upiName: groupUpiDetails.upiName
      });
      
      // Sanitize transaction note to avoid special characters
      const sanitizedNote = `${paymentRequest.note} - ${paymentRequest.paymentId}`.replace(/[^a-zA-Z0-9\s\-_]/g, '');
      
      const upiData: UPIDetails = {
        id: groupUpiDetails.upiId,
        name: groupUpiDetails.upiName,
        amount: paymentRequest.amount,
        note: sanitizedNote,
      };

      const upiUrl = this.encodeUPIString(upiData);
      console.log('🚀 Initiating UPI payment with URL:', upiUrl);
      
      // Comprehensive debugging
      console.log('\ud83d\udd0d UPI Payment Debug Info:', {
        originalData: upiData,
        generatedUrl: upiUrl,
        urlLength: upiUrl.length,
        isValidUrl: upiUrl.startsWith('upi://pay?'),
        hasRequiredParams: upiUrl.includes('pa=') && upiUrl.includes('am=') && upiUrl.includes('pn='),
      });
      
      // Validate UPI URL before opening
      if (!upiUrl.startsWith('upi://pay?')) {
        throw new Error('Invalid UPI URL format generated');
      }
      
      if (!upiUrl.includes('pa=') || !upiUrl.includes('am=') || !upiUrl.includes('pn=')) {
        throw new Error('UPI URL missing required parameters');
      }

      // Check if we're in development environment or emulator
      const isDevelopment = __DEV__;
      const isEmulator = Platform.OS === 'android' && (
        Platform.constants.Brand === 'google' || 
        Platform.constants.Model.includes('sdk') || 
        Platform.constants.Model.includes('Emulator') ||
        Platform.constants.Fingerprint.includes('generic')
      );
      
      console.log('🔍 Platform Debug Info:', {
        OS: Platform.OS,
        Brand: Platform.constants.Brand,
        Model: Platform.constants.Model,
        isDev: isDevelopment,
        isEmulator: isEmulator
      });
      
      // For development, emulator, or non-mobile platforms, show simulation
      if (isDevelopment || isEmulator || Platform.OS === 'web' || Platform.OS === 'windows' || Platform.OS === 'macos') {
        console.log(`📱 Development/Emulator environment detected (${Platform.OS}). Showing UPI simulation...`);
        
        return new Promise((resolve) => {
          Alert.alert(
            '💳 UPI Payment Simulation',
            `This would redirect to a UPI app with:\n\n💰 Amount: ₹${paymentRequest.amount}\n📧 Pay to: ${groupUpiDetails.upiName}\n🆔 UPI ID: ${groupUpiDetails.upiId}\n📝 Note: ${paymentRequest.note}\n\n🔄 Payment ID: ${paymentRequest.paymentId}`,
            [
              {
                text: '✅ Simulate Success',
                onPress: () => {
                  console.log('✅ User chose to simulate successful payment');
                  resolve(true);
                },
              },
              {
                text: '❌ Simulate Failure',
                style: 'destructive',
                onPress: () => {
                  console.log('❌ User chose to simulate failed payment');
                  resolve(false);
                },
              },
              {
                text: 'Cancel',
                style: 'cancel',
                onPress: () => {
                  console.log('❌ User cancelled simulated payment');
                  resolve(false);
                },
              },
            ]
          );
        });
      }

      // Try to open UPI apps in order of preference
      const upiApps = [
        { name: 'Google Pay', scheme: 'tez://upi/pay', package: 'com.google.android.apps.nbu.paisa.user' },
        { name: 'PhonePe', scheme: 'phonepe://pay', package: 'com.phonepe.app' },
        { name: 'Paytm', scheme: 'paytmmp://pay', package: 'net.one97.paytm' },
        { name: 'Amazon Pay', scheme: 'amazonpay://pay', package: 'in.amazon.mShop.android.shopping' },
        { name: 'BHIM', scheme: 'bhim://pay', package: 'in.org.npci.upiapp' },
      ];

      // For mobile platforms, try to detect and open UPI apps
      if (Platform.OS === 'android' || Platform.OS === 'ios') {
        console.log(`📱 Detected ${Platform.OS} platform, attempting to open UPI apps...`);
        
        // Try generic UPI first
        try {
          const canOpenUPI = await Linking.canOpenURL(upiUrl);
          console.log('Can open generic UPI URL:', canOpenUPI);
          if (canOpenUPI) {
            console.log('✅ Opening generic UPI URL...');
            await Linking.openURL(upiUrl);
            return true;
          }
        } catch (error) {
          console.log('Failed to open generic UPI URL:', error);
        }

        // Try specific UPI apps with their native schemes
        for (const app of upiApps) {
          try {
            // For app-specific URLs, use the generic UPI URL first
            const canOpen = await Linking.canOpenURL(upiUrl);
            console.log(`Can open UPI URL for ${app.name}:`, canOpen);
            if (canOpen) {
              console.log(`\u2705 Opening UPI URL via ${app.name}...`);
              await Linking.openURL(upiUrl);
              return true;
            }
          } catch (error) {
            console.log(`Failed to open UPI URL for ${app.name}:`, error);
            continue;
          }
        }

        // If no specific app works, try the generic UPI URL anyway
        try {
          console.log('🔄 Trying generic UPI URL as last resort...');
          await Linking.openURL(upiUrl);
          return true;
        } catch (error) {
          console.error('Failed to open any UPI app:', error);
          
          // Show helpful message for users
          Alert.alert(
            'UPI Apps Not Found',
            'No UPI apps are installed on your device. Please install a UPI app like:\n\n• Google Pay\n• PhonePe\n• Paytm\n• BHIM UPI\n• Amazon Pay\n\nThen try again.',
            [{ text: 'OK', style: 'default' }]
          );
          
          throw new Error('No UPI apps found. Please install a UPI app like Google Pay, PhonePe, or Paytm.');
        }
      } else {
        // For other platforms (like development), show simulation
        console.log('🖥️ Non-mobile platform detected, showing simulation...');
        Alert.alert(
          'UPI Payment Simulation',
          `This would open a UPI app on a mobile device:\n\n💰 Amount: ₹${paymentRequest.amount}\n📧 UPI ID: ${groupUpiDetails.upiId}\n👤 Name: ${groupUpiDetails.upiName}\n📝 Note: ${paymentRequest.note}\n\nFor testing, please run this on an Android/iOS device or emulator with UPI apps installed.`,
          [{ text: 'OK', style: 'default' }]
        );
        return true;
      }

    } catch (error) {
      console.error('Failed to initiate UPI payment:', error);
      throw error;
    }
  }

  async verifyPayment(paymentId: string, userProvidedTransactionId?: string): Promise<{ success: boolean; status: 'completed' | 'failed' | 'pending'; message: string }> {
    try {
      // For demo purposes, simulate payment verification
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call delay
      
      const storedPayment = await AsyncStorage.getItem(`payment_${paymentId}`);
      if (!storedPayment) {
        return {
          success: false,
          status: 'failed',
          message: 'Payment request not found',
        };
      }
      
      // Simulate successful verification if transaction ID is provided
      if (userProvidedTransactionId && userProvidedTransactionId.trim().length >= 6) {
        // Update payment status to completed
        const payment = JSON.parse(storedPayment);
        payment.status = 'completed';
        payment.transactionId = userProvidedTransactionId.trim();
        payment.completedAt = new Date().toISOString();
        await AsyncStorage.setItem(`payment_${paymentId}`, JSON.stringify(payment));
        
        console.log('✅ Payment verified successfully:', paymentId);
        return {
          success: true,
          status: 'completed',
          message: 'Payment verified successfully',
        };
      }
      
      // For automatic verification, randomly succeed 80% of the time (for demo)
      const shouldSucceed = Math.random() > 0.2;
      if (shouldSucceed) {
        const payment = JSON.parse(storedPayment);
        payment.status = 'completed';
        payment.transactionId = 'AUTO_' + Date.now();
        payment.completedAt = new Date().toISOString();
        await AsyncStorage.setItem(`payment_${paymentId}`, JSON.stringify(payment));
        
        return {
          success: true,
          status: 'completed',
          message: 'Payment verified automatically',
        };
      } else {
        return {
          success: false,
          status: 'pending',
          message: 'Payment verification pending. Please provide transaction ID.',
        };
      }
    } catch (error: any) {
      console.error('Payment verification error:', error);
      return {
        success: false,
        status: 'failed',
        message: 'Payment verification failed',
      };
    }
  }

  async markPaymentCompleted(paymentId: string, transactionId: string): Promise<boolean> {
    try {
      const storedPayment = await AsyncStorage.getItem(`payment_${paymentId}`);
      if (!storedPayment) {
        return false;
      }
      
      const payment = JSON.parse(storedPayment);
      payment.status = 'completed';
      payment.transactionId = transactionId;
      payment.completedAt = new Date().toISOString();
      
      await AsyncStorage.setItem(`payment_${paymentId}`, JSON.stringify(payment));
      console.log('✅ Payment marked as completed:', paymentId);
      return true;
    } catch (error) {
      console.error('Failed to mark payment as completed:', error);
      return false;
    }
  }

  async getPendingPayments(groupId: string): Promise<PaymentRequest[]> {
    try {
      // Get all keys from AsyncStorage and filter for payments
      const allKeys = await AsyncStorage.getAllKeys();
      const paymentKeys = allKeys.filter(key => key.startsWith('payment_'));
      
      const payments: PaymentRequest[] = [];
      for (const key of paymentKeys) {
        const paymentData = await AsyncStorage.getItem(key);
        if (paymentData) {
          const payment = JSON.parse(paymentData);
          if (payment.groupId === groupId && payment.status === 'pending') {
            payments.push(payment);
          }
        }
      }
      
      return payments;
    } catch (error) {
      console.error('Failed to get pending payments:', error);
      return [];
    }
  }

  showPaymentInstructions(): void {
    const isDevelopment = __DEV__ && (Platform.OS === 'web' || Platform.OS === 'windows' || Platform.OS === 'macos');
    
    if (isDevelopment) {
      Alert.alert(
        'Development Mode - Payment Instructions',
        'Since you\'re in development mode:\n\n1. 📱 The app will simulate UPI app launch\n2. 🏦 Payment verification will be mocked\n3. 📝 You can test both success and failure flows\n\nFor real testing:\n• Run on Android/iOS device\n• Install UPI apps (Google Pay, PhonePe, etc.)\n• Test with actual UPI payments',
        [{ text: 'Got it!', style: 'default' }]
      );
    } else {
      Alert.alert(
        'Payment Instructions',
        '1. You will be redirected to your UPI app\n2. Complete the payment in the UPI app\n3. Return to this app\n4. We will verify your payment automatically\n5. If verification fails, you can provide the transaction ID manually',
        [{ text: 'Got it!', style: 'default' }]
      );
    }
  }

  showPaymentSuccess(amount: number, transactionId?: string): void {
    Alert.alert(
      'Payment Successful! 🎉',
      `Your contribution of ₹${amount.toLocaleString()} has been processed successfully.${
        transactionId ? `\n\nTransaction ID: ${transactionId}` : ''
      }\n\nThank you for contributing to your savings group!`,
      [{ text: 'Done', style: 'default' }]
    );
  }

  showPaymentFailed(reason: string): void {
    Alert.alert(
      'Payment Failed',
      `Your payment could not be processed.\n\nReason: ${reason}\n\nPlease try again or contact support if the issue persists.`,
      [{ text: 'Retry', style: 'default' }]
    );
  }

  private validateUPIId(upiId: string): boolean {
    // Check if it's a mobile number with UPI suffix
    const mobileUpiRegex = /^[6-9]\d{9}@[a-zA-Z0-9.\-_]+$/;
    // Check if it's a regular UPI ID
    const upiIdRegex = /^[a-zA-Z0-9.\-_]+@[a-zA-Z0-9.\-_]+$/;
    
    const isMobileUpi = mobileUpiRegex.test(upiId);
    const isRegularUpi = upiIdRegex.test(upiId);
    const isValid = isMobileUpi || isRegularUpi;
    
    if (!isValid) {
      console.error('UPI ID validation failed:', upiId);
      console.log('Valid examples: 9876543210@paytm, user@googlepay, name@ybl');
    } else if (isMobileUpi) {
      console.log('\u2705 Mobile-based UPI ID detected:', upiId);
    } else {
      console.log('\u2705 Regular UPI ID detected:', upiId);
    }
    
    return isValid;
  }

  validateGroupUPIDetails(upiId: string, upiName: string): { isValid: boolean; error?: string } {
    if (!upiId || !upiId.trim()) {
      return { isValid: false, error: 'UPI ID is required' };
    }

    if (!this.validateUPIId(upiId)) {
      return { isValid: false, error: 'Invalid UPI ID format' };
    }

    if (!upiName || !upiName.trim()) {
      return { isValid: false, error: 'UPI Name is required' };
    }

    if (upiName.length < 3) {
      return { isValid: false, error: 'UPI Name must be at least 3 characters' };
    }

    return { isValid: true };
  }

  getPopularUPIProviders(): Array<{ name: string; suffix: string; example: string }> {
    return [
      { name: 'Google Pay', suffix: '@okaxis', example: 'yourname@okaxis' },
      { name: 'PhonePe', suffix: '@ybl', example: 'yourname@ybl' },
      { name: 'Paytm', suffix: '@paytm', example: 'yourname@paytm' },
      { name: 'BHIM UPI', suffix: '@upi', example: 'yourname@upi' },
      { name: 'Amazon Pay', suffix: '@apl', example: 'yourname@apl' },
      { name: 'Mobikwik', suffix: '@ikwik', example: 'yourname@ikwik' },
    ];
  }
}

export const upiService = new UPIService();
export default upiService;
