import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, FlatList, Alert } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { getGroupTransactionsApi } from '../services/api';

type Props = NativeStackScreenProps<RootStackParamList, 'GroupHistory'>;

const GroupHistoryScreen: React.FC<Props> = ({ route }) => {
  const { groupId } = route.params;
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getGroupTransactionsApi(groupId);
        const arr = res.data?.data?.transactions || res.data?.transactions || [];
        setItems(arr);
      } catch (e: any) {
        Alert.alert('Error', e?.message || 'Failed to load history');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [groupId]);

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        keyExtractor={(_, idx) => String(idx)}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.name}>{(item.type || 'transaction').toUpperCase()}</Text>
            <Text>₹ {Number(item.amount || 0).toLocaleString()}</Text>
            <Text style={{ color: '#666' }}>{item.description || item.note || '-'}</Text>
            <Text style={{ color: '#777', fontSize: 12 }}>{item.date || item.created_at}</Text>
          </View>
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  item: { paddingVertical: 10 },
  name: { fontSize: 16, fontWeight: '600' },
  separator: { height: 1, backgroundColor: '#eee' },
});

export default GroupHistoryScreen;


