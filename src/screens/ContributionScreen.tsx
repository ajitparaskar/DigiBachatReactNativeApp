import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import Container from '../components/ui/Container';
import Card from '../components/ui/Card';
import PrimaryButton from '../components/ui/PrimaryButton';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { contributeToGroupApi } from '../services/api';

type Props = NativeStackScreenProps<RootStackParamList, any> & {
  route: { params: { groupId: number } };
};

const ContributionScreen: React.FC<Props> = ({ route }) => {
  const { groupId } = route.params as any;
  const [method, setMethod] = useState('wallet');
  const [loading, setLoading] = useState(false);

  const contribute = async () => {
    setLoading(true);
    try {
      await contributeToGroupApi(groupId, method);
      Alert.alert('Success', 'Contribution created');
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Failed to contribute');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Card>
        <Text style={styles.title}>Contribute to Group</Text>
        <TextInput style={styles.input} value={method} onChangeText={setMethod} placeholder="payment method" />
        <PrimaryButton title={loading ? 'Submitting...' : 'Contribute'} onPress={contribute} disabled={loading} />
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

export default ContributionScreen;



