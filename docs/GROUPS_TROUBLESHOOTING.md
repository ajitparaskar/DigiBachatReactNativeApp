# Groups Functionality Troubleshooting Guide

## Issue: "My groups is not working properly"

This guide will help you diagnose and fix issues with the groups functionality in the DigiBachat mobile app.

## Quick Fixes Applied

### 1. **Enhanced GroupsScreen with Better Error Handling**
- **File**: `src/screens/GroupsScreen.tsx`
- **Changes**:
  - Added comprehensive error handling and logging
  - Improved API response parsing to handle different response structures
  - Added pull-to-refresh functionality with RefreshControl
  - Better loading and error states
  - Enhanced debugging capabilities

### 2. **Groups Debug Utilities**
- **Files**: 
  - `src/utils/groupsDebugger.ts` (Debug utility)
  - `src/screens/GroupsDebugScreen.tsx` (Debug screen)
- **Purpose**: Provides detailed logging and troubleshooting tools

## Common Issues & Solutions

### Issue 1: Groups Not Loading
**Symptoms**: Empty screen, loading spinner that never stops, or error messages

**Debugging Steps**:
1. **Check Authentication**:
   ```javascript
   // In console, check if user is logged in
   import { getToken } from '../services/auth';
   console.log('Token:', await getToken());
   ```

2. **Test API Endpoint**:
   - Use the GroupsDebugScreen (if added to navigation)
   - Or call the debug function manually:
   ```javascript
   import { debugGroupsAPI } from '../utils/groupsDebugger';
   debugGroupsAPI();
   ```

3. **Check Network/Server**:
   - Verify API base URL: `https://digibachat.onrender.com`
   - Test endpoint: `GET /api/groups/my-groups`

### Issue 2: API Response Structure Issues
**Symptoms**: Groups data exists but not displaying

**Debug Steps**:
```javascript
// Check what the API is actually returning
const response = await getUserGroupsApi();
console.log('Raw response:', response.data);
```

**Possible Response Structures**:
- `response.data.success = true, response.data.data.groups = [...]`
- `response.data.data.groups = [...]`
- `response.data.groups = [...]`
- `response.data.data = [...] (direct array)`
- `response.data = [...] (direct array)`

### Issue 3: Navigation Issues
**Symptoms**: Can't navigate to group details, create group, or join group screens

**Solution**: Check if these screens exist and are properly configured in navigation:
- `GroupDetails` screen
- `CreateGroup` screen  
- `JoinGroup` screen

### Issue 4: No Groups to Display
**Symptoms**: Empty state shown but user should have groups

**Check**:
1. User has actually created or joined groups
2. Groups are active and not deleted
3. User permissions are correct

## Manual Testing Steps

### Step 1: Test API Connection
1. Open developer console
2. Run: `debugGroupsAPI()` 
3. Check the detailed logs for API response structure

### Step 2: Test Basic Functionality
1. Try creating a new group
2. Try joining an existing group
3. Check if groups appear after creation/joining

### Step 3: Check Data Flow
1. Login to the app
2. Navigate to Groups screen
3. Pull down to refresh
4. Check console logs for any errors

## Expected API Response Format

The groups API should return data in one of these formats:

```json
// Format 1: Success wrapper
{
  "success": true,
  "data": {
    "groups": [
      {
        "id": 1,
        "name": "My Savings Group",
        "description": "Family savings",
        "savings_amount": 1000,
        "savings_frequency": "monthly",
        "interest_rate": 12,
        "total_savings": 5000,
        "member_count": 5,
        "is_leader": true
      }
    ]
  }
}

// Format 2: Direct data
{
  "data": {
    "groups": [...]
  }
}

// Format 3: Direct groups
{
  "groups": [...]
}

// Format 4: Direct array
[...]
```

## Emergency Fixes

### If Groups Screen Crashes:
1. Check console for specific error messages
2. Verify all imported components exist:
   - `Container`, `Card`, `LoadingSpinner`, `PrimaryButton`
   - `colors`, `typography`, `spacing`, `shadows`

### If API Calls Fail:
1. Check authentication token
2. Verify API base URL
3. Test network connectivity
4. Check server status

## Debug Mode Features

When running in development mode (`__DEV__ = true`), the app will:
1. Use detailed debug logging for groups API
2. Show comprehensive error information
3. Log all response structures for analysis

## Files Modified for Fix

1. **`src/screens/GroupsScreen.tsx`** - Enhanced with better error handling
2. **`src/utils/groupsDebugger.ts`** - New debug utilities
3. **`src/screens/GroupsDebugScreen.tsx`** - New debug interface

## Next Steps for Permanent Fix

1. **Identify Root Cause**: Use the debug tools to determine exact issue
2. **API Standardization**: Ensure consistent API response format
3. **Error Recovery**: Implement graceful error recovery
4. **User Feedback**: Add proper user-facing error messages

## Contact for Support

If issues persist:
1. Check console logs for specific error messages
2. Run the debug utilities to get detailed information
3. Share the debug output for further analysis

---

**The enhanced GroupsScreen should now work more reliably with better error handling and debugging capabilities.**
