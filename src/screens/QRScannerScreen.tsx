import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  StatusBar,
  Animated,
  Vibration,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Container from '../components/ui/Container';
import { colors, typography, spacing, shadows } from '../theme';
import { joinGroupApi } from '../services/api';
import ErrorBoundary from '../components/ui/ErrorBoundary';

// Note: This is a mock QR scanner. In production, you would use:
// import QRCodeScanner from 'react-native-qrcode-scanner';
// or react-native-camera

const QRScannerScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [scanning, setScanning] = useState(false);
  const [flashOn, setFlashOn] = useState(false);
  const animatedValue = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animate the scanning line
    const startAnimation = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(animatedValue, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(animatedValue, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    // Pulse animation for the frame
    const startPulse = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    if (scanning) {
      startAnimation();
      startPulse();
    }

    return () => {
      animatedValue.stopAnimation();
      pulseAnim.stopAnimation();
    };
  }, [scanning]);

  const handleScanStart = () => {
    setScanning(true);
    // In production, start actual camera scanning here
    
    // Mock QR code detection after 3 seconds
    setTimeout(() => {
      handleQRCodeScanned('MOCK_GROUP_CODE_123');
    }, 3000);
  };

  const handleQRCodeScanned = async (data: string) => {
    try {
      setScanning(false);
      Vibration.vibrate(200);
      
      // Extract group code from QR data
      const groupCode = extractGroupCode(data);
      if (!groupCode) {
        Alert.alert('Invalid QR Code', 'This QR code does not contain a valid group invitation.');
        return;
      }

      // Show confirmation
      Alert.alert(
        'Join Group',
        `Do you want to join the group with code: ${groupCode}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Join',
            onPress: () => joinGroup(groupCode),
          },
        ]
      );
    } catch (error) {
      console.error('QR scan error:', error);
      Alert.alert('Error', 'Failed to process QR code');
    }
  };

  const extractGroupCode = (data: string): string | null => {
    // Handle different QR code formats
    if (data.includes('digibachat.com/join/')) {
      return data.split('/join/')[1];
    }
    if (data.startsWith('GROUP:')) {
      return data.replace('GROUP:', '');
    }
    // Direct group code
    if (data.length === 8 && /^[A-Z0-9]+$/.test(data)) {
      return data;
    }
    return null;
  };

  const joinGroup = async (groupCode: string) => {
    try {
      await joinGroupApi(groupCode);
      Alert.alert(
        'Success!',
        'You have successfully joined the group!',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Groups'),
          },
        ]
      );
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Failed to join group';
      Alert.alert('Error', errorMessage);
    }
  };

  const scannerTranslateY = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 200],
  });

  const pulseOpacity = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.8],
  });

  return (
    <ErrorBoundary>
      <StatusBar barStyle="light-content" backgroundColor="black" />
      <Container style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>✕</Text>
          </TouchableOpacity>
          
          <Text style={styles.title}>Scan QR Code</Text>
          
          <TouchableOpacity 
            style={styles.flashButton}
            onPress={() => setFlashOn(!flashOn)}
          >
            <Text style={[styles.flashIcon, flashOn && styles.flashActive]}>
              {flashOn ? '🔦' : '💡'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.scannerContainer}>
          {/* Camera Placeholder */}
          <View style={styles.cameraView}>
            <Text style={styles.cameraPlaceholder}>
              📷 Camera View
              {'\n'}(Production: Use react-native-camera)
            </Text>
          </View>

          {/* Scanning Frame */}
          <View style={styles.frameContainer}>
            <Animated.View 
              style={[
                styles.frame,
                { opacity: pulseOpacity }
              ]}
            >
              {/* Corner indicators */}
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />
              
              {/* Scanning line */}
              {scanning && (
                <Animated.View
                  style={[
                    styles.scanLine,
                    {
                      transform: [{ translateY: scannerTranslateY }]
                    }
                  ]}
                />
              )}
            </Animated.View>
          </View>

          <View style={styles.instructions}>
            <Text style={styles.instructionText}>
              {scanning 
                ? '🔍 Scanning for QR code...' 
                : '📱 Position the QR code within the frame'
              }
            </Text>
          </View>
        </View>

        <View style={styles.controls}>
          {!scanning ? (
            <TouchableOpacity 
              style={styles.scanButton}
              onPress={handleScanStart}
            >
              <Text style={styles.scanButtonText}>Start Scanning</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={styles.stopButton}
              onPress={() => setScanning(false)}
            >
              <Text style={styles.stopButtonText}>Stop Scanning</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity 
            style={styles.manualButton}
            onPress={() => navigation.navigate('JoinGroup')}
          >
            <Text style={styles.manualButtonText}>Enter Code Manually</Text>
          </TouchableOpacity>
        </View>
      </Container>
    </ErrorBoundary>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.l,
    paddingTop: spacing.l,
    paddingBottom: spacing.m,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  title: {
    ...typography.h3,
    color: 'white',
    fontWeight: 'bold',
  },
  flashButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  flashIcon: {
    fontSize: 18,
  },
  flashActive: {
    opacity: 1,
  },
  scannerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  cameraView: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraPlaceholder: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    opacity: 0.7,
  },
  frameContainer: {
    width: 250,
    height: 250,
    alignItems: 'center',
    justifyContent: 'center',
  },
  frame: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: colors.brandTeal,
    borderWidth: 3,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderBottomWidth: 0,
    borderRightWidth: 0,
  },
  topRight: {
    top: 0,
    right: 0,
    borderBottomWidth: 0,
    borderLeftWidth: 0,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderTopWidth: 0,
    borderRightWidth: 0,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderTopWidth: 0,
    borderLeftWidth: 0,
  },
  scanLine: {
    position: 'absolute',
    left: 10,
    right: 10,
    height: 2,
    backgroundColor: colors.brandTeal,
    opacity: 0.8,
  },
  instructions: {
    marginTop: spacing.xl,
    paddingHorizontal: spacing.l,
  },
  instructionText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    opacity: 0.9,
  },
  controls: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
    gap: spacing.m,
  },
  scanButton: {
    backgroundColor: colors.brandTeal,
    paddingVertical: spacing.m,
    paddingHorizontal: spacing.xl,
    borderRadius: 25,
    alignItems: 'center',
    ...shadows.medium,
  },
  scanButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  stopButton: {
    backgroundColor: colors.error,
    paddingVertical: spacing.m,
    paddingHorizontal: spacing.xl,
    borderRadius: 25,
    alignItems: 'center',
    ...shadows.medium,
  },
  stopButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  manualButton: {
    borderWidth: 2,
    borderColor: 'white',
    paddingVertical: spacing.m,
    paddingHorizontal: spacing.xl,
    borderRadius: 25,
    alignItems: 'center',
  },
  manualButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default QRScannerScreen;
