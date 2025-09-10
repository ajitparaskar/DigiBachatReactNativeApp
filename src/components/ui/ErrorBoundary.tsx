import React, { Component, ReactNode } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import PrimaryButton from './PrimaryButton';
import { colors, typography, spacing } from '../../theme';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: any) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: any;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
    });

    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <View style={styles.container}>
          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>⚠️</Text>
            </View>
            
            <Text style={styles.title}>Something went wrong</Text>
            <Text style={styles.description}>
              We encountered an unexpected error. Please try again or contact support if the problem persists.
            </Text>

            {__DEV__ && this.state.error && (
              <View style={styles.errorDetails}>
                <Text style={styles.errorTitle}>Error Details (Development Mode):</Text>
                <Text style={styles.errorText}>
                  {this.state.error.toString()}
                </Text>
                {this.state.errorInfo && (
                  <Text style={styles.errorStack}>
                    {this.state.errorInfo.componentStack}
                  </Text>
                )}
              </View>
            )}

            <View style={styles.actions}>
              <PrimaryButton
                title="Try Again"
                onPress={this.handleRetry}
                style={styles.retryButton}
              />
            </View>
          </ScrollView>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  iconContainer: {
    marginBottom: spacing.l,
  },
  icon: {
    fontSize: 64,
    textAlign: 'center',
  },
  title: {
    ...typography.h2,
    color: colors.gray900,
    textAlign: 'center',
    marginBottom: spacing.m,
  },
  description: {
    ...typography.body,
    color: colors.gray600,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.xl,
    maxWidth: 300,
  },
  errorDetails: {
    backgroundColor: colors.errorLight,
    padding: spacing.m,
    borderRadius: spacing.m,
    marginBottom: spacing.l,
    maxWidth: '100%',
  },
  errorTitle: {
    ...typography.labelLarge,
    color: colors.error,
    marginBottom: spacing.s,
  },
  errorText: {
    ...typography.caption,
    color: colors.error,
    fontFamily: 'monospace',
    marginBottom: spacing.s,
  },
  errorStack: {
    ...typography.captionSmall,
    color: colors.error,
    fontFamily: 'monospace',
  },
  actions: {
    width: '100%',
    maxWidth: 200,
  },
  retryButton: {
    width: '100%',
  },
});

export default ErrorBoundary;
