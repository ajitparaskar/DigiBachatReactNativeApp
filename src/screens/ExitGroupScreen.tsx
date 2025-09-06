import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import Container from '../components/ui/Container';
import Card from '../components/ui/Card';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { getUserGroupsApi, leaveGroupApi } from '../services/api';

type Props = NativeStackScreenProps<RootStackParamList, any>;

const ExitGroupScreen: React.FC<Props> = () => {
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getUserGroupsApi();
        const arr = res.data?.data?.groups || res.data?.groups || [];
        setGroups(arr);
      } catch (e) {}
      setLoading(false);
    };
    load();
  }, []);

  const exit = async (groupId: number) => {
    try {
      await leaveGroupApi(groupId);
      Alert.alert('Exited', 'You have left the group');
      setGroups((gs) => gs.filter((g: any) => g.id !== groupId));
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Failed to leave group');
    }
  };

  if (loading) return <Container><Text>Loading...</Text></Container>;

  return (
    <Container>
      <Card>
        <Text style={styles.title}>Exit Group</Text>
        {groups.map((g) => (
          <View key={g.id} style={{ marginBottom: 8 }}>
            <Text style={{ marginBottom: 4 }}>{g.name}</Text>
            <Button title="Exit" color="#b00020" onPress={() => exit(g.id)} />
          </View>
        ))}
        {groups.length === 0 && <Text>No groups available.</Text>}
      </Card>
    </Container>
  );
};

const styles = StyleSheet.create({
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 12 },
});

export default ExitGroupScreen;



