import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Alert } from 'react-native';
import Input from '../ui/Input';
import PrimaryButton from '../ui/PrimaryButton';
import { colors, typography, spacing, shadows } from '../../theme';
import { inviteMemberToGroupApi } from '../../services/api';

interface InviteMemberModalProps {
  visible: boolean;
  onClose: () => void;
  groupId: string | number;
  groupName: string;
  onMemberInvited?: () => void;
}

const InviteMemberModal: React.FC<InviteMemberModalProps> = ({
  visible,
  onClose,
  groupId,
  groupName,
  onMemberInvited,
}) => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string;
    name?: string;
    phone?: string;
  }>({});

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!name.trim()) {
      newErrors.name = 'Name is required';
    } else if (name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (phone.trim() && !/^\+?[\d\s-()]+$/.test(phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInvite = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      
      const inviteData = {
        email: email.trim(),
        name: name.trim(),
        phone: phone.trim() || undefined,
      };

      await inviteMemberToGroupApi(groupId, inviteData);
      
      Alert.alert(
        'Invitation Sent!',
        `An invitation has been sent to ${name} at ${email}`,
        [
          {
            text: 'OK',
            onPress: () => {
              handleClose();
              if (onMemberInvited) {
                onMemberInvited();
              }
            },
          },
        ]
      );
    } catch (error: any) {
      console.error('Failed to invite member:', error);
      Alert.alert(
        'Invitation Failed',
        error.response?.data?.message || error.message || 'Failed to send invitation. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setEmail('');
    setName('');
    setPhone('');
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
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.title}>Invite Member</Text>
            <Text style={styles.subtitle}>Add a new member to {groupName}</Text>
          </View>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <View style={styles.form}>
            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Member Information</Text>
              <Text style={styles.sectionDescription}>
                Enter the details of the person you want to invite to this savings group.
              </Text>
            </View>

            <View style={styles.inputContainer}>
              <Input
                label="Full Name"
                value={name}
                onChangeText={setName}
                placeholder="Enter member's full name"
                error={errors.name}
                leftIcon="👤"
                autoCapitalize="words"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputContainer}>
              <Input
                label="Email Address"
                value={email}
                onChangeText={setEmail}
                placeholder="Enter member's email"
                error={errors.email}
                leftIcon="📧"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputContainer}>
              <Input
                label="Phone Number (Optional)"
                value={phone}
                onChangeText={setPhone}
                placeholder="Enter member's phone number"
                error={errors.phone}
                leftIcon="📱"
                keyboardType="phone-pad"
                autoCorrect={false}
              />
            </View>

            <View style={styles.infoBox}>
              <Text style={styles.infoIcon}>💡</Text>
              <View style={styles.infoContent}>
                <Text style={styles.infoTitle}>How invitations work</Text>
                <Text style={styles.infoText}>
                  The invited person will receive an email with instructions to join your savings group. 
                  They'll need to create an account or sign in to accept the invitation.
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
              title={loading ? "Sending..." : "Send Invitation"}
              onPress={handleInvite}
              loading={loading}
              disabled={loading}
              style={styles.inviteButton}
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
  infoBox: {
    flexDirection: 'row',
    backgroundColor: colors.info + '10',
    padding: spacing.l,
    borderRadius: spacing.l,
    borderLeftWidth: 4,
    borderLeftColor: colors.info,
    marginTop: spacing.l,
  },
  infoIcon: {
    fontSize: 20,
    marginRight: spacing.m,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    ...typography.labelLarge,
    color: colors.info,
    marginBottom: spacing.xs,
  },
  infoText: {
    ...typography.caption,
    color: colors.gray700,
    lineHeight: 20,
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
  inviteButton: {
    flex: 2,
  },
});

export default InviteMemberModal;
