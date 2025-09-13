# 🧪 UPI Payment Testing Guide

## Test UPI Details (Use These for Testing)

### Sample UPI IDs:
- `test@paytm` - Test Paytm Account
- `demo@googlepay` - Demo Google Pay Account  
- `sample@phonepe` - Sample PhonePe Account

### Sample Names:
- `Demo Account`
- `Test User`
- `Sample Payee`

## Step-by-Step Test Process:

### 1. Setup UPI Details
1. Open your app
2. Go to any Group Details screen
3. Tap "UPI Setup" button
4. Enter:
   - UPI ID: `test@paytm`
   - Name: `Demo Account`
5. Tap "Save UPI Details"

### 2. Test Payment Flow
1. Go to Contribution screen
2. Verify UPI shows "✓ Ready" status
3. Tap "Pay with UPI" button
4. Choose "✅ Simulate Success" in the dialog

### 3. Test Verification
1. Wait for verification modal to appear
2. Either:
   - Wait for automatic verification (usually succeeds)
   - Or enter transaction ID: `TEST123456789`

### 4. Expected Results
- Success message should appear
- Payment should be recorded
- You should return to group details

## Troubleshooting:
- If UPI shows "Setup Required" - Setup UPI details first
- If "not designed" appears - Restart app and try again
- Check console logs for debug information

## Next Steps for Production:
- Replace with real UPI IDs
- Test on actual Android device with UPI apps
- Integration with actual payment gateway
