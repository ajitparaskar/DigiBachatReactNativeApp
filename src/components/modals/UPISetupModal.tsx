import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import PrimaryButton from '../ui/PrimaryButton';
import { colors, typography, spacing, shadows } from '../../theme';
import { upiService } from '../../services/upiService';

interface UPISetupModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  groupId: string;
  groupName: string;
  existingUpiId?: string;
  existingUpiName?: string;
}

const UPISetupModal: React.FC<UPISetupModalProps> = ({
  visible,
  onClose,
  onSuccess,
  groupId,
  groupName,
  existingUpiId = '',
  existingUpiName = '',
}) => {
  const [upiId, setUpiId] = useState(existingUpiId);
  const [upiName, setUpiName] = useState(existingUpiName);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ upiId?: string; upiName?: string }>({});

  const popularProviders = upiService.getPopularUPIProviders();

  const validateInputs = () => {
    const validation = upiService.validateGroupUPIDetails(upiId, upiName);
    if (!validation.isValid) {
      if (validation.error?.toLowerCase().includes('upi id')) {
        setErrors({ upiId: validation.error });
      } else if (validation.error?.toLowerCase().includes('name')) {
        setErrors({ upiName: validation.error });
      } else {
        setErrors({ upiId: validation.error });
      }
      return false;
    }
    setErrors({});
    return true;
  };

  const handleSave = async () => {
    if (!validateInputs()) {
      return;
    }

    setIsLoading(true);
    try {
      const success = await upiService.setGroupUPIDetails(groupId, upiId.trim(), upiName.trim());
      
      if (success) {
        Alert.alert(
          'Success! ✅',
          'UPI details have been saved successfully. Group members can now make contributions via UPI.',
          [
            {
              text: 'Done',
              onPress: () => {
                onSuccess();
                onClose();
              },
            },
          ]
        );
      } else {
        Alert.alert('Error', 'Failed to save UPI details. Please try again.');
      }
    } catch (error) {
      console.error('Failed to save UPI details:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleProviderSelect = (provider: { suffix: string }) => {
    const currentBase = upiId.includes('@') ? upiId.split('@')[0] : upiId;
    setUpiId(currentBase + provider.suffix);
    setErrors({ ...errors, upiId: undefined });
  };

  const handleClose = () => {
    setErrors({});
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <LinearGradient
          colors={[colors.brandTeal, colors.success]}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>UPI Setup</Text>
            <View style={styles.placeholder} />
          </View>
          <Text style={styles.headerSubtitle}>Configure UPI for "{groupName}"</Text>
        </LinearGradient>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Instructions */}
          <View style={styles.instructionsCard}>
            <Text style={styles.instructionsTitle}>💡 Setup Instructions</Text>
            <Text style={styles.instructionsText}>
              Configure your UPI details to enable group members to make contributions directly to you via UPI apps.
              {"\n\n"}👍 <Text style={{ fontWeight: '600', color: colors.brandTeal }}>IMPORTANT:</Text> Use your REAL UPI ID (not test accounts) to avoid "security declined" errors in PhonePe/Google Pay.
            </Text>
          </View>

          {/* UPI ID Input */}
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>UPI ID *</Text>
            <View style={[styles.inputContainer, errors.upiId && styles.inputError]}>
              <Text style={styles.inputIcon}>📱</Text>
              <TextInput
                style={styles.textInput}
                value={upiId}
                onChangeText={(text) => {
                  setUpiId(text);
                  setErrors({ ...errors, upiId: undefined });
                }}
                placeholder="9876543210@paytm or yourname@googlepay"
                placeholderTextColor={colors.gray400}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="off"
                autoCorrect={false}
              />
            </View>
            {errors.upiId && (
              <Text style={styles.errorText}>{errors.upiId}</Text>
            )}
            <Text style={styles.inputHint}>
              💡 Use your REAL UPI ID or mobile number (e.g., 9876543210@paytm, yourname@googlepay)
              {"\n"}❌ Don't use test@paytm - it will be declined for security reasons
            </Text>
          </View>

          {/* Popular UPI Providers */}
          <View style={styles.providersSection}>
            <Text style={styles.providersTitle}>Popular UPI Providers</Text>
            <View style={styles.providersGrid}>
              {popularProviders.map((provider, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.providerCard}
                  onPress={() => handleProviderSelect(provider)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.providerName}>{provider.name}</Text>
                  <Text style={styles.providerSuffix}>{provider.suffix}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* UPI Name Input */}
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>Display Name *</Text>
            <View style={[styles.inputContainer, errors.upiName && styles.inputError]}>
              <Text style={styles.inputIcon}>👤</Text>
              <TextInput
                style={styles.textInput}
                value={upiName}
                onChangeText={(text) => {
                  setUpiName(text);
                  setErrors({ ...errors, upiName: undefined });
                }}
                placeholder="Your name as shown in UPI"
                placeholderTextColor={colors.gray400}
                autoCapitalize="words"
                maxLength={50}
              />
            </View>
            {errors.upiName && (
              <Text style={styles.errorText}>{errors.upiName}</Text>
            )}
            <Text style={styles.inputHint}>
              This name will be shown to members when they make payments
            </Text>
          </View>

          {/* Preview Card */}
          {upiId && upiName && (
            <View style={styles.previewCard}>
              <Text style={styles.previewTitle}>Payment Preview</Text>
              <LinearGradient
                colors={[colors.brandTeal + '15', colors.success + '10']}
                style={styles.previewContainer}
              >
                <View style={styles.previewContent}>
                  <Text style={styles.previewLabel}>Pay to:</Text>
                  <Text style={styles.previewName}>{upiName}</Text>
                  <Text style={styles.previewUpiId}>{upiId}</Text>
                  <Text style={styles.previewAmount}>₹5,000</Text>
                  <Text style={styles.previewNote}>Monthly contribution - {groupName}</Text>
                </View>
              </LinearGradient>
            </View>
          )}

          {/* Security Note */}
          <View style={styles.securityCard}>
            <Text style={styles.securityTitle}>🔒 Security & Privacy</Text>
            <View style={styles.securityPoints}>
              <Text style={styles.securityPoint}>
                • UPI details are stored securely and encrypted
              </Text>
              <Text style={styles.securityPoint}>
                • Only group members can see these payment details
              </Text>
              <Text style={styles.securityPoint}>
                • You can update or remove these details anytime
              </Text>
              <Text style={styles.securityPoint}>
                • Payments go directly to your UPI account
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleClose}
            disabled={isLoading}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          
          <PrimaryButton
            title={isLoading ? 'Saving...' : existingUpiId ? 'Update UPI Details' : 'Save UPI Details'}
            onPress={handleSave}
            loading={isLoading}
            disabled={isLoading || !upiId || !upiName}
            style={styles.saveButton}
          />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    paddingTop: spacing.xl,
    paddingBottom: spacing.l,
    paddingHorizontal: spacing.l,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.s,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '600',
  },
  headerTitle: {
    ...typography.h2,
    color: colors.white,
    fontWeight: '700',
  },
  placeholder: {
    width: 32,
  },
  headerSubtitle: {
    ...typography.body,
    color: colors.white,
    opacity: 0.9,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: spacing.l,
  },
  instructionsCard: {
    backgroundColor: colors.brandTeal + '10',
    borderRadius: spacing.m,
    padding: spacing.l,
    marginBottom: spacing.l,
    borderLeftWidth: 4,
    borderLeftColor: colors.brandTeal,
  },
  instructionsTitle: {
    ...typography.labelLarge,
    color: colors.brandTeal,
    fontWeight: '600',
    marginBottom: spacing.s,
  },
  instructionsText: {
    ...typography.body,
    color: colors.gray700,
    lineHeight: 20,
  },
  inputSection: {
    marginBottom: spacing.l,
  },
  inputLabel: {
    ...typography.labelLarge,
    color: colors.gray800,
    marginBottom: spacing.s,
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.gray300,
    borderRadius: spacing.m,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.m,
    ...shadows.small,
  },
  inputError: {
    borderColor: colors.danger,
  },
  inputIcon: {
    fontSize: 18,
    marginRight: spacing.s,
  },
  textInput: {
    flex: 1,
    ...typography.body,
    color: colors.gray900,
    paddingVertical: spacing.m,
    fontSize: 16,
  },
  inputHint: {
    ...typography.caption,
    color: colors.gray500,
    marginTop: spacing.xs,
  },
  errorText: {
    ...typography.caption,
    color: colors.danger,
    marginTop: spacing.xs,
  },
  providersSection: {
    marginBottom: spacing.l,
  },
  providersTitle: {
    ...typography.labelLarge,
    color: colors.gray800,
    marginBottom: spacing.m,
    fontWeight: '600',
  },
  providersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.s,
  },
  providerCard: {
    backgroundColor: colors.gray50,
    borderRadius: spacing.s,
    paddingVertical: spacing.s,
    paddingHorizontal: spacing.m,
    borderWidth: 1,
    borderColor: colors.gray200,
    minWidth: 90,
    alignItems: 'center',
  },
  providerName: {
    ...typography.caption,
    color: colors.gray700,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  providerSuffix: {
    ...typography.captionSmall,
    color: colors.brandTeal,
    fontWeight: '600',
    fontFamily: 'monospace',
  },
  previewCard: {
    marginBottom: spacing.l,
  },
  previewTitle: {
    ...typography.labelLarge,
    color: colors.gray800,
    marginBottom: spacing.s,
    fontWeight: '600',
  },
  previewContainer: {
    borderRadius: spacing.m,
    padding: spacing.l,
    borderWidth: 1,
    borderColor: colors.brandTeal + '20',
  },
  previewContent: {
    alignItems: 'center',
  },
  previewLabel: {
    ...typography.caption,
    color: colors.gray600,
    marginBottom: spacing.xs,
  },
  previewName: {
    ...typography.h3,
    color: colors.gray900,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  previewUpiId: {
    ...typography.body,
    color: colors.brandTeal,
    fontWeight: '600',
    marginBottom: spacing.s,
    fontFamily: 'monospace',
  },
  previewAmount: {
    ...typography.h2,
    color: colors.success,
    fontWeight: '800',
    marginBottom: spacing.xs,
  },
  previewNote: {
    ...typography.caption,
    color: colors.gray600,
    textAlign: 'center',
  },
  securityCard: {
    backgroundColor: colors.success + '10',
    borderRadius: spacing.m,
    padding: spacing.l,
    marginBottom: spacing.l,
    borderLeftWidth: 4,
    borderLeftColor: colors.success,
  },
  securityTitle: {
    ...typography.labelLarge,
    color: colors.success,
    fontWeight: '600',
    marginBottom: spacing.s,
  },
  securityPoints: {
    gap: spacing.xs,
  },
  securityPoint: {
    ...typography.body,
    color: colors.gray700,
    lineHeight: 18,
  },
  actions: {
    flexDirection: 'row',
    padding: spacing.l,
    gap: spacing.m,
    borderTopWidth: 1,
    borderTopColor: colors.gray200,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: spacing.m,
    borderRadius: spacing.m,
    borderWidth: 1,
    borderColor: colors.gray300,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    ...typography.labelLarge,
    color: colors.gray700,
    fontWeight: '600',
  },
  saveButton: {
    flex: 2,
  },
});

export default UPISetupModal;
