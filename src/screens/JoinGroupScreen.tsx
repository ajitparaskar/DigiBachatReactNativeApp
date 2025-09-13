import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView, StatusBar } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import Container from '../components/ui/Container';
import Card from '../components/ui/Card';
import PrimaryButton from '../components/ui/PrimaryButton';
import Input from '../components/ui/Input';
import { colors, typography, spacing, shadows } from '../theme';
import { joinGroupApi } from '../services/api';

type Props = NativeStackScreenProps<RootStackParamList, 'JoinGroup'>;

const JoinGroupScreen: React.FC<Props> = ({ navigation }) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCodeChange = (text: string) => {
    // Remove any non-alphanumeric characters and convert to uppercase
    const cleanedText = text.replace(/[^A-Z0-9]/gi, '').toUpperCase();
    setCode(cleanedText);
  };

  const handleJoinGroup = async () => {
    const trimmedCode = code.trim().toUpperCase();
    
    if (!trimmedCode) {
      Alert.alert('Missing Code', 'Please enter a group code to join');
      return;
    }

    if (trimmedCode.length !== 8) {
      Alert.alert('Invalid Code', 'Group code must be exactly 8 characters long');
      return;
    }

    // Validate that code contains only alphanumeric characters
    if (!/^[A-Z0-9]{8}$/.test(trimmedCode)) {
      Alert.alert('Invalid Code', 'Group code must contain only letters and numbers');
      return;
    }

    setLoading(true);
    try {
      const response = await joinGroupApi(trimmedCode);
      
      if (response.data?.success) {
        Alert.alert(
          'Join Request Sent!',
          'Your request to join the group has been submitted. You will be notified once the group admin approves your request.',
          [
            {
              text: 'OK',
              onPress: () => {
                setCode('');
                navigation.goBack();
              },
            },
          ]
        );
      } else {
        Alert.alert('Error', response.data?.message || 'Failed to send join request');
      }
    } catch (error: any) {
      console.error('Join group error:', error);
      Alert.alert(
        'Join Failed',
        error.response?.data?.message || error.message || 'Failed to join group. Please check the group code and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor={colors.backgroundSecondary} />
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Container style={styles.content}>
            <View style={styles.header}>
              <Text style={styles.headerIcon}>🤝</Text>
              <Text style={styles.title}>Join a Group</Text>
              <Text style={styles.subtitle}>
                Enter the group code shared by the group admin to request to join their savings group.
              </Text>
            </View>

            <Card style={styles.formCard}>
              <View style={styles.form}>
                <Input
                  label="Group Code"
                  value={code}
                  onChangeText={handleCodeChange}
                  placeholder="Enter 8-character group code"
                  leftIcon="🔑"
                  autoCapitalize="characters"
                  autoCorrect={false}
                  maxLength={8}
                  style={styles.input}
                />

                <View style={styles.infoBox}>
                  <Text style={styles.infoIcon}>💡</Text>
                  <View style={styles.infoContent}>
                    <Text style={styles.infoTitle}>How to join a group</Text>
                    <Text style={styles.infoText}>
                      Ask the group admin for the 8-character group code. Once you submit your request, 
                      the admin will review and approve your membership.
                    </Text>
                  </View>
                </View>

                <PrimaryButton
                  title={loading ? 'Sending Request...' : 'Send Join Request'}
                  onPress={handleJoinGroup}
                  loading={loading}
                  disabled={loading || !code.trim()}
                  style={styles.joinButton}
                />
              </View>
            </Card>
          </Container>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: spacing.l,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  headerIcon: {
    fontSize: 64,
    marginBottom: spacing.m,
  },
  title: {
    ...typography.h2,
    color: colors.gray900,
    textAlign: 'center',
    marginBottom: spacing.s,
  },
  subtitle: {
    ...typography.body,
    color: colors.gray600,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 300,
  },
  formCard: {
    marginBottom: spacing.xl,
  },
  form: {
    gap: spacing.l,
  },
  input: {
    marginBottom: spacing.m,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: colors.info + '10',
    padding: spacing.l,
    borderRadius: spacing.l,
    borderLeftWidth: 4,
    borderLeftColor: colors.info,
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
  joinButton: {
    marginTop: spacing.m,
  },
});

export default JoinGroupScreen;
