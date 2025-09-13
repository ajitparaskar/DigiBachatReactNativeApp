import { getUserGroupsApi } from '../services/api';

export const debugGroupsAPI = async () => {
  console.log('=== GROUPS API DEBUGGING ===');
  
  try {
    console.log('1. Making API call to getUserGroupsApi...');
    const response = await getUserGroupsApi();
    
    console.log('2. Raw response status:', response.status);
    console.log('3. Raw response headers:', response.headers);
    console.log('4. Raw response data:', JSON.stringify(response.data, null, 2));
    
    // Check various possible data structures
    console.log('5. Checking data structures:');
    console.log('   - response.data:', typeof response.data, Array.isArray(response.data));
    console.log('   - response.data.success:', response.data?.success);
    console.log('   - response.data.data:', typeof response.data?.data, Array.isArray(response.data?.data));
    console.log('   - response.data.data.groups:', typeof response.data?.data?.groups, Array.isArray(response.data?.data?.groups));
    console.log('   - response.data.groups:', typeof response.data?.groups, Array.isArray(response.data?.groups));
    
    // Try to extract groups using our logic
    let apiGroups = [];
    if (response.data?.success && response.data?.data?.groups) {
      apiGroups = response.data.data.groups;
      console.log('6. Extracted via: response.data.data.groups');
    } else if (response.data?.data?.groups) {
      apiGroups = response.data.data.groups;
      console.log('6. Extracted via: response.data.data.groups (no success flag)');
    } else if (response.data?.groups) {
      apiGroups = response.data.groups;
      console.log('6. Extracted via: response.data.groups');
    } else if (Array.isArray(response.data?.data)) {
      apiGroups = response.data.data;
      console.log('6. Extracted via: response.data.data (array)');
    } else if (Array.isArray(response.data)) {
      apiGroups = response.data;
      console.log('6. Extracted via: response.data (direct array)');
    } else {
      console.log('6. No groups found in any expected location');
    }
    
    console.log('7. Final extracted groups:', apiGroups);
    console.log('8. Groups count:', apiGroups?.length || 0);
    
    if (apiGroups && apiGroups.length > 0) {
      console.log('9. Sample group structure:', JSON.stringify(apiGroups[0], null, 2));
    }
    
    return {
      success: true,
      groups: apiGroups,
      rawResponse: response.data
    };
    
  } catch (error: any) {
    console.error('=== GROUPS API ERROR ===');
    console.error('Error details:', {
      message: error?.message,
      status: error?.response?.status,
      statusText: error?.response?.statusText,
      data: error?.response?.data,
      url: error?.config?.url,
      method: error?.config?.method,
      headers: error?.config?.headers
    });
    
    return {
      success: false,
      error: error?.message || 'Unknown error',
      rawError: error
    };
  }
};

export const testGroupsEndpoint = async () => {
  console.log('Testing groups endpoint...');
  const result = await debugGroupsAPI();
  
  if (result.success) {
    console.log(`✅ Successfully loaded ${result.groups?.length || 0} groups`);
  } else {
    console.log(`❌ Failed to load groups: ${result.error}`);
  }
  
  return result;
};
