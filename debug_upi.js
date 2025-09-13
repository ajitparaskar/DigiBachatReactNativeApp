// UPI URL Debugging Tool
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function analyzeUPIURL(upiId, payeeName, amount, note) {
  console.log('\n🔍 === UPI URL Analysis ===');
  
  // Check UPI ID format
  const mobileUpiRegex = /^[6-9]\d{9}@[a-zA-Z0-9.-_]+$/;
  const normalUpiRegex = /^[a-zA-Z0-9.-_]+@[a-zA-Z0-9.-_]+$/;
  
  const isMobileUpi = mobileUpiRegex.test(upiId);
  const isNormalUpi = normalUpiRegex.test(upiId);
  
  console.log('📱 UPI ID Analysis:');
  console.log(`   Input: ${upiId}`);
  console.log(`   Is Mobile UPI: ${isMobileUpi ? '✅' : '❌'}`);
  console.log(`   Is Normal UPI: ${isNormalUpi ? '✅' : '❌'}`);
  
  // Check for common test patterns
  const testPatterns = ['test', 'demo', 'sample', 'fake', 'dummy'];
  const hasTestPattern = testPatterns.some(pattern => 
    upiId.toLowerCase().includes(pattern) || 
    payeeName.toLowerCase().includes(pattern)
  );
  
  console.log(`   Contains Test Pattern: ${hasTestPattern ? '❌' : '✅'}`);
  
  // Check provider
  const provider = upiId.split('@')[1];
  const knownProviders = ['paytm', 'ybl', 'okaxis', 'axisbank', 'hdfcbank', 'icici', 'googlepay'];
  const isKnownProvider = knownProviders.some(p => provider && provider.includes(p));
  
  console.log(`   Provider: ${provider}`);
  console.log(`   Known Provider: ${isKnownProvider ? '✅' : '❌'}`);
  
  // Generate UPI URL
  const upiParams = {
    pa: upiId.trim(),
    pn: payeeName.trim().substring(0, 30),
    am: parseFloat(amount).toFixed(2),
    cu: 'INR',
    tn: note.replace(/[^a-zA-Z0-9\s\-_]/g, '').trim().substring(0, 50)
  };
  
  const paramString = Object.entries(upiParams)
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join('&');
  
  const upiUrl = `upi://pay?${paramString}`;
  
  console.log('\n💳 Generated UPI URL:');
  console.log(`   ${upiUrl}`);
  console.log(`   Length: ${upiUrl.length} chars`);
  
  console.log('\n📋 UPI Parameters:');
  Object.entries(upiParams).forEach(([key, value]) => {
    console.log(`   ${key}: ${value}`);
  });
  
  // Security recommendations
  console.log('\n🛡️  Security Analysis:');
  
  if (hasTestPattern) {
    console.log('   ❌ ISSUE: Contains test patterns - will be declined');
    console.log('   💡 FIX: Use your real UPI ID');
  }
  
  if (!isMobileUpi && !isNormalUpi) {
    console.log('   ❌ ISSUE: Invalid UPI format');
    console.log('   💡 FIX: Use format like 9876543210@paytm or name@provider');
  }
  
  if (!isKnownProvider) {
    console.log('   ⚠️  WARNING: Unknown provider - may cause issues');
    console.log('   💡 RECOMMEND: Use @paytm, @ybl, @okaxis, @googlepay');
  }
  
  if (parseFloat(amount) < 1) {
    console.log('   ❌ ISSUE: Amount too small');
    console.log('   💡 FIX: Use amount ≥ ₹1.00');
  }
  
  if (parseFloat(amount) > 100000) {
    console.log('   ⚠️  WARNING: Large amount - may trigger security checks');
  }
  
  console.log('\n✅ Recommendations:');
  console.log('1. Use your REAL UPI ID from your UPI app');
  console.log('2. Test with small amount (₹1-10) first');
  console.log('3. Ensure UPI ID is active and verified');
  console.log('4. Use established providers (@paytm, @ybl, @okaxis)');
  
  return { upiUrl, analysis: { isMobileUpi, isNormalUpi, hasTestPattern, isKnownProvider } };
}

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function main() {
  console.log('🔧 UPI Payment Debugging Tool');
  console.log('===============================\n');
  
  try {
    const upiId = await askQuestion('Enter UPI ID you are using: ');
    const payeeName = await askQuestion('Enter Payee Name: ');
    const amount = await askQuestion('Enter Amount (₹): ');
    const note = await askQuestion('Enter Transaction Note: ');
    
    const result = analyzeUPIURL(upiId, payeeName, amount, note);
    
    console.log('\n🧪 Testing Suggestions:');
    console.log('=======================');
    
    if (result.analysis.hasTestPattern) {
      console.log('\n❌ PRIMARY ISSUE: Using test UPI ID');
      console.log('SOLUTION: Replace with your real UPI ID');
      console.log('Examples:');
      console.log('  - Your mobile: 9876543210@paytm');
      console.log('  - Your name: yourname@googlepay');
      console.log('  - Your account: account@ybl');
    }
    
    console.log('\n✅ Quick Test URLs:');
    console.log('Copy these URLs to test manually:');
    console.log('1. With your mobile: upi://pay?pa=9876543210@paytm&pn=Test&am=1.00&cu=INR&tn=Test');
    console.log('2. Generic test: upi://pay?pa=success@razorpay&pn=Merchant&am=1.00&cu=INR&tn=Test');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    rl.close();
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { analyzeUPIURL };
