import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert, StatusBar, ScrollView, TouchableOpacity, Clipboard, Share } from 'react-native';
import Container from '../components/ui/Container';
import Card from '../components/ui/Card';
import PrimaryButton from '../components/ui/PrimaryButton';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { FadeInView, SlideInView } from '../components/ui/AnimatedComponents';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { getGroupApi } from '../services/api';
import { colors, typography, spacing, shadows } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, any> & {
  route: { params: { groupId: number } };
};

const InviteMembersScreen: React.FC<Props> = ({ route, navigation }) => {
  const { groupId } = route.params as any;
  const [groupCode, setGroupCode] = useState<string>('');
  const [shareLink, setShareLink] = useState<string>('');
  const [groupName, setGroupName] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [copying, setCopying] = useState<'code' | 'link' | null>(null);

  useEffect(() => {
    loadGroupData();
  }, [groupId]);

  const loadGroupData = async () => {
    try {
      setLoading(true);
      const res = await getGroupApi(groupId);
      const group = res.data?.data?.group || res.data?.group || {};
      setGroupCode(group.group_code || '');
      setShareLink(group.shareable_link || `https://digibachat.app/join/${group.group_code}`);
      setGroupName(group.name || 'Group');
    } catch (e: any) {
      console.error('Error loading group:', e);
      Alert.alert('Error', e?.message || 'Failed to load group details');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string, type: 'code' | 'link') => {
    try {
      setCopying(type);
      await Clipboard.setString(text);
      Alert.alert(
        'Copied! 📋',
        `${type === 'code' ? 'Group code' : 'Share link'} has been copied to your clipboard.`
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to copy to clipboard');
    } finally {
      setCopying(null);
    }
  };

  const shareGroup = async () => {
    try {
      const message = `Join my savings group "${groupName}" on DigiBachat!\n\nGroup Code: ${groupCode}\nOr use this link: ${shareLink}`;
      
      await Share.share({
        message,
        title: `Join ${groupName} on DigiBachat`,
        url: shareLink,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const generateQRCode = () => {
    Alert.alert(
      'QR Code Coming Soon! 🚀',
      'QR code generation for easy group joining will be available in the next update.',
      [{ text: 'OK' }]
    );
  };

  if (loading) {
    return <LoadingSpinner text="Loading group details..." />;
  }

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor={colors.backgroundSecondary} />
      <Container style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <FadeInView style={styles.header}>
            <View style={styles.headerIcon}>
              <Text style={styles.icon}>👥</Text>
            </View>
            <Text style={styles.title}>Invite Members</Text>
            <Text style={styles.subtitle}>
              Share your group code or link to invite new members to "{groupName}"
            </Text>
          </FadeInView>

          <SlideInView delay={100}>
            <Card variant="elevated" style={styles.codeCard}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Group Code</Text>
                <Text style={styles.cardSubtitle}>Share this code with friends</Text>
              </View>
              
              <View style={styles.codeContainer}>
                <Text style={styles.codeText}>{groupCode || 'Loading...'}</Text>
              </View>
              
              <View style={styles.actionButtons}>
                <PrimaryButton
                  title={copying === 'code' ? 'Copying...' : 'Copy Code'}
                  onPress={() => copyToClipboard(groupCode, 'code')}
                  variant="outline"
                  loading={copying === 'code'}
                  disabled={!groupCode || copying === 'code'}
                  style={styles.actionButton}
                />
                <PrimaryButton
                  title="Share Code"
                  onPress={shareGroup}
                  style={styles.actionButton}
                  disabled={!groupCode}
                />
              </View>
            </Card>
          </SlideInView>

          <SlideInView delay={200}>
            <Card variant="elevated" style={styles.linkCard}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Share Link</Text>
                <Text style={styles.cardSubtitle}>Direct link to join your group</Text>
              </View>
              
              <View style={styles.linkContainer}>
                <Text style={styles.linkText} numberOfLines={2}>
                  {shareLink || 'Generating link...'}
                </Text>
              </View>
              
              <View style={styles.actionButtons}>
                <PrimaryButton
                  title={copying === 'link' ? 'Copying...' : 'Copy Link'}
                  onPress={() => copyToClipboard(shareLink, 'link')}
                  variant="outline"
                  loading={copying === 'link'}
                  disabled={!shareLink || copying === 'link'}
                  style={styles.actionButton}
                />
                <PrimaryButton
                  title="Share Link"
                  onPress={shareGroup}
                  style={styles.actionButton}
                  disabled={!shareLink}
                />
              </View>
            </Card>
          </SlideInView>

          <SlideInView delay={300}>
            <Card variant="elevated" style={styles.qrCard}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>QR Code</Text>
                <Text style={styles.cardSubtitle}>Quick scan to join</Text>
              </View>
              
              <View style={styles.qrPlaceholder}>
                <Text style={styles.qrIcon}>📱</Text>
                <Text style={styles.qrText}>QR Code</Text>
                <Text style={styles.comingSoonBadge}>Coming Soon</Text>
              </View>
              
              <PrimaryButton
                title="Generate QR Code"
                onPress={generateQRCode}
                variant="outline"
                style={styles.qrButton}
              />
            </Card>
          </SlideInView>

          <SlideInView delay={400}>
            <View style={styles.infoBox}>
              <Text style={styles.infoIcon}>💡</Text>
              <View style={styles.infoContent}>
                <Text style={styles.infoTitle}>How to invite members:</Text>
                <Text style={styles.infoText}>
                  • Share the group code via text or messaging apps{'\n'}
                  • Send the direct link through email or social media{'\n'}
                  • Use the QR code for in-person invitations (coming soon){'\n'}
                  • Members can also join by searching for your group code in the app
                </Text>
              </View>
            </View>
          </SlideInView>
        </ScrollView>
      </Container>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
  },
  header: {
    backgroundColor: colors.white,
    padding: spacing.l,
    marginBottom: spacing.l,
    borderBottomLeftRadius: spacing.l,
    borderBottomRightRadius: spacing.l,
    ...shadows.medium,
    alignItems: 'center',
  },
  headerIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.brandTeal + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.m,
  },
  icon: {
    fontSize: 30,
  },
  title: {
    ...typography.h2,
    color: colors.gray900,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.body,
    color: colors.gray600,
    textAlign: 'center',
    lineHeight: 22,
  },
  codeCard: {
    marginHorizontal: spacing.l,
    marginBottom: spacing.m,
    padding: spacing.l,
  },
  linkCard: {
    marginHorizontal: spacing.l,
    marginBottom: spacing.m,
    padding: spacing.l,
  },
  qrCard: {
    marginHorizontal: spacing.l,
    marginBottom: spacing.m,
    padding: spacing.l,
  },
  cardHeader: {
    marginBottom: spacing.m,
  },
  cardTitle: {
    ...typography.h3,
    color: colors.gray900,
    marginBottom: spacing.xs,
  },
  cardSubtitle: {
    ...typography.body,
    color: colors.gray600,
  },
  codeContainer: {
    backgroundColor: colors.brandTeal + '10',
    borderColor: colors.brandTeal + '30',
    borderWidth: 2,
    borderRadius: spacing.m,
    padding: spacing.l,
    alignItems: 'center',
    marginBottom: spacing.m,
  },
  codeText: {
    ...typography.h1,
    color: colors.brandTeal,
    fontWeight: '800',
    letterSpacing: 2,
  },
  linkContainer: {
    backgroundColor: colors.gray100,
    borderColor: colors.gray300,
    borderWidth: 1,
    borderRadius: spacing.m,
    padding: spacing.m,
    marginBottom: spacing.m,
  },
  linkText: {
    ...typography.body,
    color: colors.gray700,
    fontFamily: 'monospace',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: spacing.m,
  },
  actionButton: {
    flex: 1,
  },
  qrPlaceholder: {
    backgroundColor: colors.gray100,
    borderColor: colors.gray300,
    borderWidth: 1,
    borderRadius: spacing.m,
    padding: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.m,
    position: 'relative',
  },
  qrIcon: {
    fontSize: 48,
    marginBottom: spacing.s,
  },
  qrText: {
    ...typography.body,
    color: colors.gray600,
    marginBottom: spacing.s,
  },
  comingSoonBadge: {
    ...typography.caption,
    color: colors.warning,
    backgroundColor: colors.warning + '20',
    paddingHorizontal: spacing.s,
    paddingVertical: spacing.xs,
    borderRadius: spacing.s,
    fontWeight: '600',
  },
  qrButton: {
    borderColor: colors.brandTeal,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: colors.info + '10',
    borderColor: colors.info + '30',
    borderWidth: 1,
    borderRadius: spacing.m,
    padding: spacing.m,
    marginHorizontal: spacing.l,
    marginBottom: spacing.xl,
  },
  infoIcon: {
    fontSize: 20,
    marginRight: spacing.s,
    marginTop: 2,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    ...typography.labelLarge,
    color: colors.info,
    marginBottom: spacing.xs,
    fontWeight: '600',
  },
  infoText: {
    ...typography.caption,
    color: colors.info,
    lineHeight: 18,
  },
});

export default InviteMembersScreen;
