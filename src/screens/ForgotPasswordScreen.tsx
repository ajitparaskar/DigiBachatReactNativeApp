import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { forgotPasswordApi } from '../services/api';
import Container from '../components/ui/Container';
import Card from '../components/ui/Card';
import PrimaryButton from '../components/ui/PrimaryButton';

const ForgotPasswordScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!email) return;
    setLoading(true);
    try {
      await forgotPasswordApi(email);
      Alert.alert('Sent', 'Check your email for the reset code');
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container style={{ justifyContent: 'center' }}>
      <Card>
        <Text style={styles.title}>Forgot Password</Text>
        <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} />
        <PrimaryButton title={loading ? 'Sending...' : 'Send Reset Email'} onPress={submit} disabled={loading} />
      </Card>
    </Container>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, justifyContent: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 12 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, marginBottom: 12 },
});

export default ForgotPasswordScreen;



