import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import Container from '../components/ui/Container';
import Card from '../components/ui/Card';
import PrimaryButton from '../components/ui/PrimaryButton';
import { colors, typography, spacing } from '../theme';
import { testGroupsEndpoint, debugGroupsAPI } from '../utils/groupsDebugger';
import { getUserGroupsApi } from '../services/api';

const GroupsDebugScreen: React.FC = () => {
  const [debugResult, setDebugResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const runFullDebug = async () => {
    setLoading(true);
    try {
      const result = await testGroupsEndpoint();
      setDebugResult(result);
    } catch (error) {
      Alert.alert('Debug Error', String(error));
    } finally {
      setLoading(false);
    }
  };

  const testBasicAPI = async () => {
    setLoading(true);
    try {
      console.log('Testing basic API call...');
      const response = await getUserGroupsApi();
      console.log('Basic API response:', response);
      Alert.alert('API Test', `Status: ${response.status}\nData: ${JSON.stringify(response.data, null, 2)}`);
    } catch (error: any) {
      Alert.alert('API Error', error?.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const clearResults = () => {
    setDebugResult(null);
  };

  return (
    <Container style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Card variant="elevated" style={styles.card}>
          <Text style={styles.title}>Groups API Debugger</Text>
          <Text style={styles.subtitle}>
            Use this screen to debug and test the groups API functionality
          </Text>
          
          <View style={styles.buttonContainer}>
            <PrimaryButton
              title={loading ? "Testing..." : "Run Full Debug"}
              onPress={runFullDebug}
              disabled={loading}
              style={styles.button}
            />
            
            <PrimaryButton
              title={loading ? "Testing..." : "Test Basic API"}
              onPress={testBasicAPI}
              variant="outline"
              disabled={loading}
              style={styles.button}
            />
            
            <PrimaryButton
              title="Clear Results"
              onPress={clearResults}
              variant="outline"
              style={styles.button}
            />
          </View>
        </Card>

        {debugResult && (
          <Card variant="elevated" style={styles.card}>
            <Text style={styles.title}>Debug Results</Text>
            
            <View style={styles.resultItem}>
              <Text style={styles.resultLabel}>Status:</Text>
              <Text style={[styles.resultValue, debugResult.success ? styles.success : styles.error]}>
                {debugResult.success ? 'SUCCESS ✅' : 'FAILED ❌'}
              </Text>
            </View>

            {debugResult.success ? (
              <>
                <View style={styles.resultItem}>
                  <Text style={styles.resultLabel}>Groups Found:</Text>
                  <Text style={styles.resultValue}>{debugResult.groups?.length || 0}</Text>
                </View>

                {debugResult.groups && debugResult.groups.length > 0 && (
                  <View style={styles.resultItem}>
                    <Text style={styles.resultLabel}>Sample Group:</Text>
                    <ScrollView style={styles.codeBlock} horizontal>
                      <Text style={styles.codeText}>
                        {JSON.stringify(debugResult.groups[0], null, 2)}
                      </Text>
                    </ScrollView>
                  </View>
                )}

                <View style={styles.resultItem}>
                  <Text style={styles.resultLabel}>Raw Response:</Text>
                  <ScrollView style={styles.codeBlock} horizontal>
                    <Text style={styles.codeText}>
                      {JSON.stringify(debugResult.rawResponse, null, 2)}
                    </Text>
                  </ScrollView>
                </View>
              </>
            ) : (
              <>
                <View style={styles.resultItem}>
                  <Text style={styles.resultLabel}>Error:</Text>
                  <Text style={[styles.resultValue, styles.error]}>{debugResult.error}</Text>
                </View>

                {debugResult.rawError && (
                  <View style={styles.resultItem}>
                    <Text style={styles.resultLabel}>Error Details:</Text>
                    <ScrollView style={styles.codeBlock} horizontal>
                      <Text style={styles.codeText}>
                        {JSON.stringify({
                          message: debugResult.rawError?.message,
                          status: debugResult.rawError?.response?.status,
                          statusText: debugResult.rawError?.response?.statusText,
                          data: debugResult.rawError?.response?.data,
                        }, null, 2)}
                      </Text>
                    </ScrollView>
                  </View>
                )}
              </>
            )}
          </Card>
        )}

        <Card variant="elevated" style={styles.card}>
          <Text style={styles.title}>Troubleshooting Tips</Text>
          
          <View style={styles.tipItem}>
            <Text style={styles.tipNumber}>1.</Text>
            <Text style={styles.tipText}>
              Check if you're logged in and have a valid authentication token
            </Text>
          </View>

          <View style={styles.tipItem}>
            <Text style={styles.tipNumber}>2.</Text>
            <Text style={styles.tipText}>
              Verify the API endpoint URL is correct: /api/groups/my-groups
            </Text>
          </View>

          <View style={styles.tipItem}>
            <Text style={styles.tipNumber}>3.</Text>
            <Text style={styles.tipText}>
              Ensure you have at least one group created or joined
            </Text>
          </View>

          <View style={styles.tipItem}>
            <Text style={styles.tipNumber}>4.</Text>
            <Text style={styles.tipText}>
              Check network connectivity and server status
            </Text>
          </View>

          <View style={styles.tipItem}>
            <Text style={styles.tipNumber}>5.</Text>
            <Text style={styles.tipText}>
              Look at the console logs for detailed error information
            </Text>
          </View>
        </Card>

        <Text style={styles.footer}>
          Open the developer console to see detailed logging information
        </Text>
      </ScrollView>
    </Container>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.backgroundSecondary,
  },
  card: {
    marginBottom: spacing.l,
  },
  title: {
    ...typography.h3,
    marginBottom: spacing.m,
    color: colors.gray900,
  },
  subtitle: {
    ...typography.body,
    color: colors.gray600,
    marginBottom: spacing.l,
  },
  buttonContainer: {
    gap: spacing.m,
  },
  button: {
    marginBottom: 0,
  },
  resultItem: {
    marginBottom: spacing.m,
    paddingBottom: spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  resultLabel: {
    ...typography.labelLarge,
    color: colors.gray700,
    marginBottom: spacing.xs,
    fontWeight: '600',
  },
  resultValue: {
    ...typography.body,
    color: colors.gray900,
  },
  success: {
    color: colors.success,
  },
  error: {
    color: colors.danger,
  },
  codeBlock: {
    backgroundColor: colors.gray100,
    padding: spacing.m,
    borderRadius: spacing.s,
    maxHeight: 200,
  },
  codeText: {
    ...typography.caption,
    fontFamily: 'monospace',
    color: colors.gray800,
    lineHeight: 16,
  },
  tipItem: {
    flexDirection: 'row',
    marginBottom: spacing.m,
    alignItems: 'flex-start',
  },
  tipNumber: {
    ...typography.labelLarge,
    color: colors.brandTeal,
    fontWeight: '700',
    marginRight: spacing.s,
    minWidth: 20,
  },
  tipText: {
    ...typography.body,
    color: colors.gray700,
    flex: 1,
    lineHeight: 22,
  },
  footer: {
    ...typography.caption,
    color: colors.gray500,
    textAlign: 'center',
    marginTop: spacing.l,
    marginBottom: spacing.xxl,
    fontStyle: 'italic',
  },
});

export default GroupsDebugScreen;
