import axios from 'axios';
import { getToken } from './auth';

const API_BASE_URL = 'https://digibachat.onrender.com';

export const api = axios.create({ baseURL: API_BASE_URL });

api.interceptors.request.use(async (config) => {
  const token = await getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  config.headers['Content-Type'] = 'application/json';
  return config;
});

export async function loginApi(email: string, password: string) {
  return api.post('/api/auth/login', { email, password });
}

export async function registerApi(name: string, email: string, password: string) {
  const payload = { name, email, password };
  console.log('Registration API payload:', payload);
  console.log('API Base URL:', API_BASE_URL);
  
  // Try the most common registration endpoints
  const endpoints = ['/api/register', '/register', '/auth/register', '/api/auth/register'];
  
  for (let i = 0; i < endpoints.length; i++) {
    const endpoint = endpoints[i];
    console.log(`Trying endpoint ${i + 1}/${endpoints.length}: ${endpoint}`);
    
    try {
      const response = await api.post(endpoint, payload);
      console.log(`Registration API success with ${endpoint}:`, response.status);
      return response;
    } catch (error: any) {
      console.log(`Endpoint ${endpoint} failed:`, {
        status: error?.response?.status,
        message: error?.response?.data?.message || error?.message
      });
      
      // If this is the last endpoint and it still fails, throw the error
      if (i === endpoints.length - 1) {
        console.error('All registration endpoints failed. Final error:', {
          status: error?.response?.status,
          statusText: error?.response?.statusText,
          data: error?.response?.data,
          url: error?.config?.url,
          method: error?.config?.method,
          fullUrl: `${API_BASE_URL}${error?.config?.url}`
        });
        throw error;
      }
    }
  }
}

export async function verifyEmailApi(email: string, otp: string) {
  const payload = { email, otp };
  console.log('Verify Email API payload:', payload);
  
  // Try common verify email endpoints
  const endpoints = ['/api/verify-email', '/verify-email', '/auth/verify-email', '/api/auth/verify-email'];
  
  for (let i = 0; i < endpoints.length; i++) {
    const endpoint = endpoints[i];
    console.log(`Trying verify endpoint ${i + 1}/${endpoints.length}: ${endpoint}`);
    
    try {
      const response = await api.post(endpoint, payload);
      console.log(`Verify Email API success with ${endpoint}:`, response.status);
      return response;
    } catch (error: any) {
      console.log(`Verify endpoint ${endpoint} failed:`, {
        status: error?.response?.status,
        message: error?.response?.data?.message || error?.message
      });
      
      if (i === endpoints.length - 1) {
        console.error('All verify email endpoints failed:', error?.response?.data);
        throw error;
      }
    }
  }
}

export async function resendOtpApi(email: string) {
  const payload = { email };
  console.log('Resend OTP API payload:', payload);
  
  // Try common resend OTP endpoints
  const endpoints = ['/api/resend-otp', '/resend-otp', '/auth/resend-otp', '/api/auth/resend-otp'];
  
  for (let i = 0; i < endpoints.length; i++) {
    const endpoint = endpoints[i];
    console.log(`Trying resend endpoint ${i + 1}/${endpoints.length}: ${endpoint}`);
    
    try {
      const response = await api.post(endpoint, payload);
      console.log(`Resend OTP API success with ${endpoint}:`, response.status);
      return response;
    } catch (error: any) {
      console.log(`Resend endpoint ${endpoint} failed:`, {
        status: error?.response?.status,
        message: error?.response?.data?.message || error?.message
      });
      
      if (i === endpoints.length - 1) {
        console.error('All resend OTP endpoints failed:', error?.response?.data);
        throw error;
      }
    }
  }
}

export async function getUserGroupsApi() {
  return api.get('/api/groups/my-groups');
}

export async function getUserTotalSavingsApi() {
  return api.get('/api/transactions/user/total-savings');
}

export async function getUpcomingContributionsApi() {
  return api.get('/api/transactions/user/upcoming-contributions');
}

export async function getGroupApi(groupId: string | number) {
  return api.get(`/api/groups/${groupId}`);
}

export async function getGroupMembersApi(groupId: string | number) {
  return api.get(`/api/groups/${groupId}/members`);
}

export async function createGroupApi(payload: {
  name: string;
  description: string;
  savings_frequency: 'weekly' | 'monthly';
  savings_amount: number;
  interest_rate: number;
  default_loan_duration: number;
}) {
  return api.post('/api/groups/', payload);
}

export async function joinGroupApi(groupCode: string) {
  return api.post(`/api/groups/join/${groupCode}`);
}

export async function getUserTransactionsApi() {
  return api.get('/api/transactions/user/transactions');
}

export async function getGroupTransactionsApi(groupId: string | number) {
  return api.get(`/api/groups/${groupId}/transactions`);
}

export async function exportTransactionsApi(payload: {
  type?: 'all' | 'contribution' | 'withdrawal' | 'loan' | 'repayment';
  dateRange?: '7days'|'30days'|'90days'|'1year';
  group?: string;
  format?: 'csv'|'pdf';
}) {
  return api.post('/api/transactions/export', payload);
}

export async function getJoinRequestsApi(groupId: string | number) {
  return api.get(`/api/groups/${groupId}/join-requests`);
}

export async function approveJoinRequestApi(groupId: string | number, requestId: string | number) {
  return api.post(`/api/groups/${groupId}/join-requests/${requestId}/approve`);
}

export async function rejectJoinRequestApi(groupId: string | number, requestId: string | number) {
  return api.post(`/api/groups/${groupId}/join-requests/${requestId}/reject`);
}

export async function contributeToGroupApi(groupId: string | number, paymentMethod: string) {
  return api.post(`/api/groups/${groupId}/contribute`, { paymentMethod });
}

export async function getGroupSavingsSummaryApi(groupId: string | number) {
  return api.get(`/api/transactions/groups/${groupId}/savings-summary`);
}

export async function updateGroupApi(
  groupId: string | number,
  payload: Partial<{
    name: string;
    description: string;
    savings_frequency: 'weekly' | 'monthly';
    savings_amount: number;
    interest_rate: number;
    default_loan_duration: number;
  }>
) {
  return api.put(`/api/groups/${groupId}`, payload);
}

export async function forgotPasswordApi(email: string) {
  return api.post('/api/password/forgot-password', { email });
}

export async function resetPasswordApi(payload: { email: string; newPassword: string; confirmPassword: string; token?: string }) {
  return api.post('/api/password/reset-password', payload);
}

export async function changePasswordApi(payload: { currentPassword: string; newPassword: string; confirmPassword: string }) {
  return api.post('/api/password/change-password', payload);
}

export async function leaveGroupApi(groupId: string | number) {
  return api.delete(`/api/groups/${groupId}/leave`);
}

export async function deleteAccountApi() {
  return api.delete('/api/user/account');
}


