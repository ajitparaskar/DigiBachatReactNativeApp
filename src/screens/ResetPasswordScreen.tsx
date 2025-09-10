import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { resetPasswordApi } from '../services/api';
import Container from '../components/ui/Container';
import Card from '../components/ui/Card';
import PrimaryButton from '../components/ui/PrimaryButton';

const ResetPasswordScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!email || !otp || !password || !confirm) return;
    setLoading(true);
    try {
      await resetPasswordApi({ email, newPassword: password, confirmPassword: confirm, token: otp });
      Alert.alert('Success', 'Password reset');
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Failed to reset');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container style={{ justifyContent: 'center' }}>
      <Card>
        <Text style={styles.title}>Reset Password</Text>
        <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} />
        <TextInput style={styles.input} placeholder="OTP" value={otp} onChangeText={setOtp} />
        <TextInput style={styles.input} placeholder="New Password" value={password} onChangeText={setPassword} secureTextEntry={true} />
        <TextInput style={styles.input} placeholder="Confirm Password" value={confirm} onChangeText={setConfirm} secureTextEntry={true} />
        <PrimaryButton title={loading ? 'Saving...' : 'Reset Password'} onPress={submit} disabled={loading} />
      </Card>
    </Container>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, justifyContent: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 12 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, marginBottom: 12 },
});

export default ResetPasswordScreen;
