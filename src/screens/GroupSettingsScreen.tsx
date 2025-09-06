import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import Container from '../components/ui/Container';
import Card from '../components/ui/Card';
import PrimaryButton from '../components/ui/PrimaryButton';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { getGroupApi, updateGroupApi } from '../services/api';

type Props = NativeStackScreenProps<RootStackParamList, any> & {
  route: { params: { groupId: number } };
};

const GroupSettingsScreen: React.FC<Props> = ({ route }) => {
  const { groupId } = route.params as any;
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [frequency, setFrequency] = useState<'weekly' | 'monthly'>('monthly');
  const [interestRate, setInterestRate] = useState('');
  const [duration, setDuration] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getGroupApi(groupId);
        const g = res.data?.data?.group || res.data?.group;
        if (g) {
          setName(g.name || '');
          setDescription(g.description || '');
          setAmount(String(g.savings_amount || ''));
          setFrequency((g.savings_frequency as any) || 'monthly');
          setInterestRate(String(g.interest_rate || ''));
          setDuration(String(g.default_loan_duration || ''));
        }
      } catch (e: any) {
        Alert.alert('Error', e?.message || 'Failed to load group');
      }
    };
    load();
  }, [groupId]);

  const save = async () => {
    setLoading(true);
    try {
      await updateGroupApi(groupId, {
        name,
        description,
        savings_frequency: frequency,
        savings_amount: Number(amount),
        interest_rate: Number(interestRate),
        default_loan_duration: Number(duration),
      });
      Alert.alert('Saved', 'Group updated');
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Failed to save');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Card>
        <Text style={styles.title}>Group Settings</Text>
        <TextInput style={styles.input} placeholder="Name" value={name} onChangeText={setName} />
        <TextInput style={styles.input} placeholder="Description" value={description} onChangeText={setDescription} />
        <TextInput style={styles.input} placeholder="Amount" value={amount} onChangeText={setAmount} keyboardType="numeric" />
        <TextInput style={styles.input} placeholder="Interest Rate" value={interestRate} onChangeText={setInterestRate} keyboardType="numeric" />
        <TextInput style={styles.input} placeholder="Duration" value={duration} onChangeText={setDuration} keyboardType="numeric" />
        <PrimaryButton title={loading ? 'Saving...' : 'Save'} onPress={save} disabled={loading} />
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

export default GroupSettingsScreen;



