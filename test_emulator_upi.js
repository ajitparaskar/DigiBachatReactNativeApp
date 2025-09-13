// Test UPI URLs for Android Emulator
console.log('🧪 Testing UPI URLs for Android Emulator with PhonePe');
console.log('='.repeat(60));

function generateTestUPIURL(upiId, name, amount, note) {
  const params = {
    pa: upiId,
    pn: name.replace(/\s/g, '%20'),
    am: amount.toFixed(2),
    cu: 'INR',
    tn: note.replace(/\s/g, '%20')
  };
  
  const url = `upi://pay?${Object.entries(params).map(([k,v]) => `${k}=${v}`).join('&')}`;
  console.log(`\n📱 UPI URL: ${url}`);
  console.log(`📋 Copy this URL to test manually in emulator:`);
  console.log(`   adb shell am start -W -a android.intent.action.VIEW -d "${url}"`);
  
  return url;
}

// Test cases for emulator
const testCases = [
  {
    name: 'PhonePe Format (Recommended)',
    upiId: '9876543210@ybl',
    displayName: 'Test User',
    amount: 100,
    note: 'Test Payment'
  },
  {
    name: 'Paytm Format',
    upiId: '9876543210@paytm', 
    displayName: 'Demo Account',
    amount: 50,
    note: 'Demo Transaction'
  },
  {
    name: 'Success Test (Always works)',
    upiId: 'success@razorpay',
    displayName: 'Success Test',
    amount: 1,
    note: 'Success Test'
  }
];

console.log('\n🎯 Recommended Test UPI IDs for Emulator:');
console.log('=' .repeat(50));

testCases.forEach((testCase, index) => {
  console.log(`\n${index + 1}. ${testCase.name}:`);
  console.log(`   UPI ID: ${testCase.upiId}`);
  console.log(`   Name: ${testCase.displayName}`);
  console.log(`   Amount: ₹${testCase.amount}`);
  
  const url = generateTestUPIURL(testCase.upiId, testCase.displayName, testCase.amount, testCase.note);
});

console.log('\n🔧 Manual Testing Commands:');
console.log('=' .repeat(30));
console.log('1. Copy any URL above');
console.log('2. Run in command prompt:');
console.log('   adb shell am start -W -a android.intent.action.VIEW -d "upi://pay?pa=9876543210@ybl&pn=Test%20User&am=1.00&cu=INR&tn=Test"');
console.log('\n✅ This should open PhonePe directly in emulator!');

console.log('\n📝 For Your App UPI Setup:');
console.log('=' .repeat(30));
console.log('Use these in your app UPI Setup:');
testCases.forEach((testCase, index) => {
  console.log(`${index + 1}. UPI ID: ${testCase.upiId}, Name: ${testCase.displayName}`);
});

console.log('\n🚨 AVOID These (Will Fail):');
console.log('❌ GAIKWAD ABHISHEK SANTOSH (Person name)');
console.log('❌ test@test (Invalid provider)');
console.log('❌ demo@demo (Invalid provider)');

console.log('\n🎉 After fixing UPI ID format, your payment should work perfectly!');
