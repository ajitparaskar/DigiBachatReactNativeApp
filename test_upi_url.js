// Test UPI URL Generator for Debugging
console.log('=== UPI URL Testing ===');

function formatAmount(amount) {
  const numAmount = typeof amount === 'number' ? amount : parseFloat(amount) || 0;
  if (isNaN(numAmount) || numAmount <= 0) {
    console.warn('Invalid amount provided:', amount, 'Using 1 as fallback');
    return '1.00';
  }
  return numAmount.toFixed(2);
}

function generateUPIURL(upiId, payeeName, amount, note) {
  // Validate inputs
  if (!upiId || !upiId.includes('@')) {
    throw new Error('Invalid UPI ID format. Must be like: yourname@paytm');
  }
  
  const formattedAmount = formatAmount(amount);
  
  // Create UPI parameters
  const upiParams = {
    pa: encodeURIComponent(upiId.trim()), // Payee Address
    pn: encodeURIComponent(payeeName.trim()), // Payee Name  
    am: formattedAmount, // Amount
    cu: 'INR', // Currency
    tn: encodeURIComponent((note || `Payment to ${payeeName}`).trim()), // Transaction Note
  };
  
  // Build URL
  const paramString = Object.entries(upiParams)
    .map(([key, value]) => `${key}=${value}`)
    .join('&');
    
  return `upi://pay?${paramString}`;
}

// Test cases
const testCases = [
  { upiId: 'test@paytm', name: 'Demo Account', amount: 5000, note: 'Monthly contribution - Family Savings Circle - PAY_1234567890_abc123' },
  { upiId: 'demo@googlepay', name: 'Test User', amount: 1000, note: 'Test Payment' },
  { upiId: 'sample@phonepe', name: 'Sample Payee', amount: 100, note: 'Sample Transaction' },
];

console.log('\n=== Test UPI URLs ===');
testCases.forEach((testCase, index) => {
  try {
    const url = generateUPIURL(testCase.upiId, testCase.name, testCase.amount, testCase.note);
    console.log(`\nTest ${index + 1}:`);
    console.log(`UPI ID: ${testCase.upiId}`);
    console.log(`Name: ${testCase.name}`);
    console.log(`Amount: ₹${testCase.amount}`);
    console.log(`Generated URL: ${url}`);
    
    // Decode to verify
    const url_obj = new URL(url);
    console.log('Parameters:');
    url_obj.searchParams.forEach((value, key) => {
      console.log(`  ${key}: ${decodeURIComponent(value)}`);
    });
    
  } catch (error) {
    console.error(`Test ${index + 1} failed:`, error.message);
  }
});

console.log('\n=== Expected UPI URL Format ===');
console.log('upi://pay?pa=test%40paytm&pn=Demo%20Account&am=5000.00&cu=INR&tn=Monthly%20contribution%20-%20Family%20Savings%20Circle%20-%20PAY_1234567890_abc123');

console.log('\n=== Manual Test URL ===');
console.log('Copy this URL and test manually:');
const manualTestUrl = generateUPIURL('test@paytm', 'Demo Account', 100, 'Test Payment');
console.log(manualTestUrl);
