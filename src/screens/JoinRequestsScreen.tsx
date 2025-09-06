import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Alert, Button } from 'react-native';
import Container from '../components/ui/Container';
import Card from '../components/ui/Card';
import { approveJoinRequestApi, getJoinRequestsApi, rejectJoinRequestApi } from '../services/api';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, any> & {
  route: { params: { groupId: number } };
};

const JoinRequestsScreen: React.FC<Props> = ({ route }) => {
  const { groupId } = route.params as any;
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<any[]>([]);

  const load = async () => {
    setLoading(true);
    try {
      const res = await getJoinRequestsApi(groupId);
      const arr = res.data?.data?.requests || res.data?.requests || [];
      setItems(arr);
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [groupId]);

  const act = async (requestId: string | number, approve: boolean) => {
    try {
      if (approve) await approveJoinRequestApi(groupId, requestId);
      else await rejectJoinRequestApi(groupId, requestId);
      await load();
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Action failed');
    }
  };

  if (loading) {
    return (
      <Container>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator />
        </View>
      </Container>
    );
  }

  return (
    <Container>
      <Card>
        <FlatList
          data={items}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <View style={styles.item}>
              <Text style={styles.name}>{item.user?.name || item.user_name || 'User'}</Text>
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 6 }}>
                <Button title="Approve" onPress={() => act(item.id, true)} />
                <Button title="Reject" color="#b00020" onPress={() => act(item.id, false)} />
              </View>
            </View>
          )}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={<Text>No requests.</Text>}
        />
      </Card>
    </Container>
  );
};

const styles = StyleSheet.create({
  item: { paddingVertical: 10 },
  name: { fontSize: 16, fontWeight: '600' },
  separator: { height: 1, backgroundColor: '#eee' },
});

export default JoinRequestsScreen;



