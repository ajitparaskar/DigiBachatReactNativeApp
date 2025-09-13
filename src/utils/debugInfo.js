import { Platform, Alert } from 'react-native';

export const showDebugInfo = () => {
  const info = {
    platform: Platform.OS,
    version: Platform.Version,
    isDev: __DEV__,
    constants: Platform.constants,
  };
  
  console.log('🔍 Platform Debug Info:', info);
  
  Alert.alert(
    'Debug Information',
    `Platform: ${Platform.OS}
Version: ${Platform.Version}
Development: ${__DEV__ ? 'Yes' : 'No'}
    
This helps determine UPI payment behavior.`,
    [{ text: 'OK', style: 'default' }]
  );
  
  return info;
};

export const checkUPICapabilities = async () => {
  const { Linking } = require('react-native');
  
  const testUrls = [
    'upi://pay?pa=test@upi&pn=Test&am=1.00&cu=INR',
    'tez://upi/pay?pa=test@upi&pn=Test&am=1.00&cu=INR',
    'phonepe://pay?pa=test@upi&pn=Test&am=1.00&cu=INR',
  ];
  
  const capabilities = {};
  
  for (const url of testUrls) {
    try {
      const canOpen = await Linking.canOpenURL(url);
      const scheme = url.split('://')[0];
      capabilities[scheme] = canOpen;
      console.log(`Can open ${scheme}:`, canOpen);
    } catch (error) {
      console.log(`Error checking ${url}:`, error);
      capabilities[url.split('://')[0]] = false;
    }
  }
  
  console.log('🔍 UPI Capabilities:', capabilities);
  return capabilities;
};
