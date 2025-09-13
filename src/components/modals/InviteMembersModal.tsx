import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { colors, typography, spacing, shadows } from '../../theme';
import { sendGroupInviteApi } from '../../services/api';

interface InviteMembersModalProps {
  visible: boolean;
  onClose: () => void;
  group: {
    id: string | number;
    name: string;
    group_code?: string;
  } | null;
}

const InviteMembersModal: React.FC<InviteMembersModalProps> = ({ visible, onClose, group }) => {
  const [emails, setEmails] = useState<string[]>(['']);
  const [phones, setPhones] = useState<string[]>(['']);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [inviteMethod, setInviteMethod] = useState<'email' | 'phone' | 'both'>('email');

  const resetForm = () => {
    setEmails(['']);
    setPhones(['']);
    setMessage('');
    setInviteMethod('email');
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  };

  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  };

  const addEmailField = () => {
    setEmails([...emails, '']);
  };

  const addPhoneField = () => {
    setPhones([...phones, '']);
  };

  const removeEmailField = (index: number) => {
    if (emails.length > 1) {
      setEmails(emails.filter((_, i) => i !== index));
    }
  };

  const removePhoneField = (index: number) => {
    if (phones.length > 1) {
      setPhones(phones.filter((_, i) => i !== index));
    }
  };

  const updateEmail = (index: number, value: string) => {
    const newEmails = [...emails];
    newEmails[index] = value;
    setEmails(newEmails);
  };

  const updatePhone = (index: number, value: string) => {
    const newPhones = [...phones];
    newPhones[index] = value;
    setPhones(newPhones);
  };

  const handleInvite = async () => {
    if (!group) return;

    // Validate inputs based on selected method
    let validEmails: string[] = [];
    let validPhones: string[] = [];

    if (inviteMethod === 'email' || inviteMethod === 'both') {
      validEmails = emails
        .map(email => email.trim())
        .filter(email => email.length > 0 && validateEmail(email));
      
      if ((inviteMethod === 'email' || inviteMethod === 'both') && validEmails.length === 0) {
        Alert.alert('Error', 'Please enter at least one valid email address');
        return;
      }
    }

    if (inviteMethod === 'phone' || inviteMethod === 'both') {
      validPhones = phones
        .map(phone => phone.trim())
        .filter(phone => phone.length > 0 && validatePhone(phone));
      
      if ((inviteMethod === 'phone' || inviteMethod === 'both') && validPhones.length === 0) {
        Alert.alert('Error', 'Please enter at least one valid phone number');
        return;
      }
    }

    if (validEmails.length === 0 && validPhones.length === 0) {
      Alert.alert('Error', 'Please enter at least one valid email or phone number');
      return;
    }

    setLoading(true);
    try {
      const payload: {
        emails?: string[];
        phones?: string[];
        message?: string;
      } = {};

      if (validEmails.length > 0) payload.emails = validEmails;
      if (validPhones.length > 0) payload.phones = validPhones;
      if (message.trim()) payload.message = message.trim();

      await sendGroupInviteApi(group.id, payload);
      
      const totalInvites = validEmails.length + validPhones.length;
      Alert.alert(
        'Success', 
        `${totalInvites} invitation${totalInvites > 1 ? 's' : ''} sent successfully!`,
        [{ text: 'OK', onPress: () => { resetForm(); onClose(); } }]
      );
    } catch (error) {
      console.error('Failed to send invitations:', error);
      Alert.alert('Error', 'Failed to send invitations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Invite Members</Text>
            <Text style={styles.subtitle}>{group?.name}</Text>
          </View>
          <TouchableOpacity onPress={() => { resetForm(); onClose(); }} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Invite Method Selection */}
          <View style={styles.methodSelection}>
            <Text style={styles.sectionTitle}>Choose invite method</Text>
            <View style={styles.methodButtons}>
              <TouchableOpacity
                style={[styles.methodButton, inviteMethod === 'email' && styles.methodButtonActive]}
                onPress={() => setInviteMethod('email')}
              >
                <Text style={styles.methodIcon}>📧</Text>
                <Text style={[styles.methodText, inviteMethod === 'email' && styles.methodTextActive]}>
                  Email
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.methodButton, inviteMethod === 'phone' && styles.methodButtonActive]}
                onPress={() => setInviteMethod('phone')}
              >
                <Text style={styles.methodIcon}>📱</Text>
                <Text style={[styles.methodText, inviteMethod === 'phone' && styles.methodTextActive]}>
                  Phone
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.methodButton, inviteMethod === 'both' && styles.methodButtonActive]}
                onPress={() => setInviteMethod('both')}
              >
                <Text style={styles.methodIcon}>📧📱</Text>
                <Text style={[styles.methodText, inviteMethod === 'both' && styles.methodTextActive]}>
                  Both
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Email Section */}
          {(inviteMethod === 'email' || inviteMethod === 'both') && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Email addresses</Text>
                <TouchableOpacity onPress={addEmailField} style={styles.addButton}>
                  <Text style={styles.addButtonText}>+ Add</Text>
                </TouchableOpacity>
              </View>
              {emails.map((email, index) => (
                <View key={index} style={styles.inputContainer}>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Enter email address"
                    placeholderTextColor={colors.gray500}
                    value={email}
                    onChangeText={(text) => updateEmail(index, text)}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                  {emails.length > 1 && (
                    <TouchableOpacity
                      onPress={() => removeEmailField(index)}
                      style={styles.removeButton}
                    >
                      <Text style={styles.removeButtonText}>✕</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </View>
          )}

          {/* Phone Section */}
          {(inviteMethod === 'phone' || inviteMethod === 'both') && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Phone numbers</Text>
                <TouchableOpacity onPress={addPhoneField} style={styles.addButton}>
                  <Text style={styles.addButtonText}>+ Add</Text>
                </TouchableOpacity>
              </View>
              {phones.map((phone, index) => (
                <View key={index} style={styles.inputContainer}>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Enter phone number"
                    placeholderTextColor={colors.gray500}
                    value={phone}
                    onChangeText={(text) => updatePhone(index, text)}
                    keyboardType="phone-pad"
                  />
                  {phones.length > 1 && (
                    <TouchableOpacity
                      onPress={() => removePhoneField(index)}
                      style={styles.removeButton}
                    >
                      <Text style={styles.removeButtonText}>✕</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </View>
          )}

          {/* Custom Message Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Custom message (optional)</Text>
            <TextInput
              style={styles.messageInput}
              placeholder="Add a personal message to your invitation..."
              placeholderTextColor={colors.gray500}
              value={message}
              onChangeText={setMessage}
              multiline={true}
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          {/* Group Code Section */}
          {group?.group_code && (
            <View style={styles.groupCodeSection}>
              <Text style={styles.sectionTitle}>Or share group code</Text>
              <View style={styles.groupCodeContainer}>
                <Text style={styles.groupCodeText}>{group.group_code}</Text>
                <Text style={styles.groupCodeDescription}>
                  People can join by entering this code in the app
                </Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => { resetForm(); onClose(); }}
            disabled={loading}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.inviteButton, loading && styles.inviteButtonDisabled]}
            onPress={handleInvite}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.inviteButtonText}>Send Invites</Text>
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
  methodSelection: {
    marginBottom: spacing.xl,
  },
  methodButtons: {
    flexDirection: 'row',
    gap: spacing.m,
    marginTop: spacing.m,
  },
  methodButton: {
    flex: 1,
    padding: spacing.m,
    borderRadius: spacing.m,
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.gray200,
    alignItems: 'center',
  },
  methodButtonActive: {
    borderColor: colors.brandTeal,
    backgroundColor: colors.brandTeal + '10',
  },
  methodIcon: {
    fontSize: 24,
    marginBottom: spacing.s,
  },
  methodText: {
    ...typography.caption,
    color: colors.gray700,
    fontWeight: '600',
  },
  methodTextActive: {
    color: colors.brandTeal,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.m,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.gray900,
    fontWeight: '600',
  },
  addButton: {
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    backgroundColor: colors.brandTeal,
    borderRadius: spacing.s,
  },
  addButtonText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.m,
  },
  textInput: {
    flex: 1,
    ...typography.body,
    color: colors.gray900,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.m,
    borderRadius: spacing.s,
    borderWidth: 1,
    borderColor: colors.gray200,
  },
  removeButton: {
    marginLeft: spacing.s,
    padding: spacing.s,
    backgroundColor: colors.danger,
    borderRadius: spacing.s,
  },
  removeButtonText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  messageInput: {
    ...typography.body,
    color: colors.gray900,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.m,
    borderRadius: spacing.s,
    borderWidth: 1,
    borderColor: colors.gray200,
    height: 80,
    marginTop: spacing.m,
  },
  groupCodeSection: {
    marginBottom: spacing.xl,
  },
  groupCodeContainer: {
    backgroundColor: colors.white,
    padding: spacing.l,
    borderRadius: spacing.m,
    marginTop: spacing.m,
    alignItems: 'center',
  },
  groupCodeText: {
    ...typography.h3,
    color: colors.brandTeal,
    fontWeight: '800',
    marginBottom: spacing.s,
    letterSpacing: 2,
  },
  groupCodeDescription: {
    ...typography.caption,
    color: colors.gray600,
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
  inviteButton: {
    flex: 2,
    paddingVertical: spacing.m,
    borderRadius: spacing.m,
    backgroundColor: colors.brandTeal,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inviteButtonDisabled: {
    backgroundColor: colors.gray400,
  },
  inviteButtonText: {
    ...typography.body,
    color: colors.white,
    fontWeight: '700',
  },
});

export default InviteMembersModal;
