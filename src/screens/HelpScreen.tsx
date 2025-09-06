import React, { useState } from 'react';
import { View, Text, StyleSheet, Linking, TouchableOpacity, ScrollView, StatusBar } from 'react-native';
import Container from '../components/ui/Container';
import Card from '../components/ui/Card';
import { colors, typography, spacing, shadows } from '../theme';

const faqs = [
  { q: 'What is DigiBachat?', a: 'A group savings app to contribute, track, and manage savings together.' },
  { q: 'How to join a group?', a: 'Ask your leader for a group code and use Join Group to enter.' },
  { q: 'How to contribute?', a: 'Open the group, tap Contribute, and complete the UPI payment.' },
  { q: 'How to invite members?', a: 'Open your group and use Invite to share an invite link or code.' },
  { q: 'Forgot password?', a: 'Use Forgot Password on the login screen to reset it.' },
];

const HelpScreen: React.FC = () => {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor={colors.backgroundSecondary} />
      <Container style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.title}>Help & Support</Text>
            <Text style={styles.subtitle}>Get answers to common questions and contact support</Text>
          </View>

          <Card variant="elevated" style={styles.quickActionsCard}>
            <Text style={styles.sectionTitle}>🚀 Quick Actions</Text>
            <View style={styles.quickActions}>
              <TouchableOpacity 
                style={styles.quickAction}
                onPress={() => Linking.openURL('mailto:support@digibachat.com')}
              >
                <Text style={styles.quickActionIcon}>📧</Text>
                <Text style={styles.quickActionText}>Email Support</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.quickAction}
                onPress={() => Linking.openURL('tel:+918888888888')}
              >
                <Text style={styles.quickActionIcon}>📞</Text>
                <Text style={styles.quickActionText}>Call Support</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.quickAction}
                onPress={() => Linking.openURL('https://digibachat.com/guide')}
              >
                <Text style={styles.quickActionIcon}>📖</Text>
                <Text style={styles.quickActionText}>User Guide</Text>
              </TouchableOpacity>
            </View>
          </Card>

          <Card variant="elevated" style={styles.faqCard}>
            <Text style={styles.sectionTitle}>❓ Frequently Asked Questions</Text>
            {faqs.map((item, idx) => (
              <TouchableOpacity 
                key={idx} 
                style={styles.faqItem}
                onPress={() => toggleFaq(idx)}
                activeOpacity={0.7}
              >
                <View style={styles.faqHeader}>
                  <Text style={styles.faqQuestion}>{item.q}</Text>
                  <Text style={styles.faqToggle}>
                    {expandedFaq === idx ? '−' : '+'}
                  </Text>
                </View>
                {expandedFaq === idx && (
                  <Text style={styles.faqAnswer}>{item.a}</Text>
                )}
              </TouchableOpacity>
            ))}
          </Card>

          <Card variant="elevated" style={styles.contactCard}>
            <Text style={styles.sectionTitle}>💬 Need More Help?</Text>
            <Text style={styles.contactDescription}>
              Can't find what you're looking for? Our support team is here to help!
            </Text>
            <View style={styles.contactMethods}>
              <View style={styles.contactMethod}>
                <Text style={styles.contactIcon}>📧</Text>
                <View style={styles.contactInfo}>
                  <Text style={styles.contactLabel}>Email Support</Text>
                  <TouchableOpacity onPress={() => Linking.openURL('mailto:support@digibachat.com')}>
                    <Text style={styles.contactLink}>support@digibachat.com</Text>
                  </TouchableOpacity>
                  <Text style={styles.contactNote}>Response within 24 hours</Text>
                </View>
              </View>
              <View style={styles.contactMethod}>
                <Text style={styles.contactIcon}>📞</Text>
                <View style={styles.contactInfo}>
                  <Text style={styles.contactLabel}>Phone Support</Text>
                  <TouchableOpacity onPress={() => Linking.openURL('tel:+918888888888')}>
                    <Text style={styles.contactLink}>+91 88888 88888</Text>
                  </TouchableOpacity>
                  <Text style={styles.contactNote}>Mon-Fri, 9 AM - 6 PM IST</Text>
                </View>
              </View>
            </View>
          </Card>

          <Card variant="elevated" style={styles.tipsCard}>
            <Text style={styles.sectionTitle}>💡 Pro Tips</Text>
            <View style={styles.tipsList}>
              <View style={styles.tipItem}>
                <Text style={styles.tipIcon}>🎯</Text>
                <Text style={styles.tipText}>Set up automatic contributions for consistent savings</Text>
              </View>
              <View style={styles.tipItem}>
                <Text style={styles.tipIcon}>👥</Text>
                <Text style={styles.tipText}>Invite friends to join your savings group for better motivation</Text>
              </View>
              <View style={styles.tipItem}>
                <Text style={styles.tipIcon}>📊</Text>
                <Text style={styles.tipText}>Check your analytics regularly to track your progress</Text>
              </View>
            </View>
          </Card>
        </ScrollView>
      </Container>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.backgroundSecondary,
  },
  header: {
    marginBottom: spacing.xl,
    paddingTop: spacing.m,
  },
  title: {
    ...typography.h2,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    color: colors.gray600,
  },
  quickActionsCard: {
    marginBottom: spacing.l,
  },
  sectionTitle: {
    ...typography.h3,
    marginBottom: spacing.l,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  quickAction: {
    alignItems: 'center',
    padding: spacing.m,
    borderRadius: spacing.m,
    backgroundColor: colors.backgroundPrimary,
    minWidth: 80,
  },
  quickActionIcon: {
    fontSize: 24,
    marginBottom: spacing.s,
  },
  quickActionText: {
    ...typography.caption,
    color: colors.gray700,
    textAlign: 'center',
  },
  faqCard: {
    marginBottom: spacing.l,
  },
  faqItem: {
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
    paddingVertical: spacing.m,
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqQuestion: {
    ...typography.body,
    color: colors.gray900,
    fontWeight: '600',
    flex: 1,
    marginRight: spacing.m,
  },
  faqToggle: {
    ...typography.h3,
    color: colors.brandTeal,
    fontWeight: '300',
  },
  faqAnswer: {
    ...typography.body,
    color: colors.gray600,
    marginTop: spacing.m,
    lineHeight: 22,
  },
  contactCard: {
    marginBottom: spacing.l,
  },
  contactDescription: {
    ...typography.body,
    color: colors.gray600,
    marginBottom: spacing.l,
    lineHeight: 22,
  },
  contactMethods: {
    gap: spacing.l,
  },
  contactMethod: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  contactIcon: {
    fontSize: 24,
    marginRight: spacing.m,
    marginTop: spacing.xs,
  },
  contactInfo: {
    flex: 1,
  },
  contactLabel: {
    ...typography.labelLarge,
    color: colors.gray900,
    marginBottom: spacing.xs,
  },
  contactLink: {
    ...typography.body,
    color: colors.brandTeal,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  contactNote: {
    ...typography.caption,
    color: colors.gray500,
  },
  tipsCard: {
    marginBottom: spacing.xl,
  },
  tipsList: {
    gap: spacing.m,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  tipIcon: {
    fontSize: 20,
    marginRight: spacing.m,
    marginTop: spacing.xs,
  },
  tipText: {
    ...typography.body,
    color: colors.gray700,
    flex: 1,
    lineHeight: 22,
  },
});

export default HelpScreen;


