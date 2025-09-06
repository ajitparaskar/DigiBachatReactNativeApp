import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import Container from '../components/ui/Container';
import Card from '../components/ui/Card';
import PrimaryButton from '../components/ui/PrimaryButton';
import { joinGroupApi } from '../services/api';

const JoinGroupScreen: React.FC = () => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const join = async () => {
    if (!code) {
      Alert.alert('Missing code', 'Please enter a group code');
      return;
    }
    setLoading(true);
    try {
      await joinGroupApi(code.trim());
      Alert.alert('Request sent', 'Your join request was submitted');
      setCode('');
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Failed to join group');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Card>
        <Text style={styles.title}>Join Group</Text>
        <TextInput style={styles.input} placeholder="Enter group code" value={code} onChangeText={setCode} />
        <PrimaryButton title={loading ? 'Joining...' : 'Join'} onPress={join} disabled={loading} />
      </Card>
    </Container>
  );
};

const styles = StyleSheet.create({
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 12 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
});

export default JoinGroupScreen;



