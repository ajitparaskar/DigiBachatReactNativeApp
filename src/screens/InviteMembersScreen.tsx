import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import Container from '../components/ui/Container';
import Card from '../components/ui/Card';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { getGroupApi } from '../services/api';

type Props = NativeStackScreenProps<RootStackParamList, any> & {
  route: { params: { groupId: number } };
};

const InviteMembersScreen: React.FC<Props> = ({ route }) => {
  const { groupId } = route.params as any;
  const [groupCode, setGroupCode] = useState<string>('');
  const [shareLink, setShareLink] = useState<string>('');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getGroupApi(groupId);
        const g = res.data?.data?.group || res.data?.group || {};
        setGroupCode(g.group_code || '');
        setShareLink(g.shareable_link || '');
      } catch (e: any) {
        Alert.alert('Error', e?.message || 'Failed to load group');
      }
    };
    load();
  }, [groupId]);

  return (
    <Container>
      <Card>
        <Text style={styles.title}>Invite Members</Text>
        <Text>Group Code: {groupCode || '-'}</Text>
        <Text>Share Link: {shareLink || '-'}</Text>
      </Card>
    </Container>
  );
};

const styles = StyleSheet.create({
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 12 },
});

export default InviteMembersScreen;



