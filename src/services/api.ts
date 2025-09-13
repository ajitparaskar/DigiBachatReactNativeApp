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

// Add response interceptor to handle responses consistently
api.interceptors.response.use(
  (response) => {
    // Return the response as-is for successful requests
    console.log(`API Response [${response.config.method?.toUpperCase()}] ${response.config.url}:`, {
      status: response.status,
      data: response.data
    });
    return response;
  },
  (error) => {
    // Log error details for debugging
    console.error(`API Error [${error.config?.method?.toUpperCase()}] ${error.config?.url}:`, {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message
    });
    
    // Don't throw error for successful business logic responses (200 status)
    if (error.response?.status === 200) {
      console.log('Treating 200 status as success despite axios error');
      return error.response;
    }
    
    return Promise.reject(error);
  }
);

export async function loginApi(email: string, password: string) {
  return api.post('/api/auth/login', { email, password });
}

export async function registerApi(name: string, email: string, password: string, phone: string) {
  const payload = { name, email, password, phone };
  console.log('Registration API payload:', payload);
  console.log('API Base URL:', API_BASE_URL);
  
  try {
    // Use the same endpoint as the web version
    const response = await api.post('/api/auth/register', payload);
    console.log('Registration API success:', response.status);
    return response;
  } catch (error: any) {
    console.error('Registration failed:', {
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

export async function verifyEmailApi(email: string, otp: string) {
  const payload = { email, otp };
  console.log('Verify Email API payload:', payload);
  
  try {
    // Use the same endpoint as the web version
    const response = await api.post('/api/auth/verify-email', payload);
    console.log('Verify Email API success:', response.status);
    return response;
  } catch (error: any) {
    console.error('Verify email failed:', error?.response?.data);
    throw error;
  }
}

export async function resendOtpApi(email: string) {
  const payload = { email };
  console.log('Resend OTP API payload:', payload);
  
  try {
    // Use the same endpoint as the web version
    const response = await api.post('/api/auth/resend-otp', payload);
    console.log('Resend OTP API success:', response.status);
    return response;
  } catch (error: any) {
    console.error('Resend OTP failed:', error?.response?.data);
    throw error;
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

export async function contributeToGroupApi(
  groupId: string | number, 
  paymentMethod: string, 
  paymentData?: {
    amount?: number;
    paymentId?: string;
    transactionId?: string;
    upiId?: string;
    note?: string;
  }
) {
  const payload = {
    paymentMethod,
    ...paymentData
  };
  
  console.log('\ud83d\udcbe Contributing to group API:', {
    groupId,
    payload
  });
  
  return api.post(`/api/groups/${groupId}/contribute`, payload);
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

// Loan Management APIs
export async function createLoanRequestApi(groupId: string | number, loanData: { amount: number, purpose: string }) {
  return api.post(`/api/loans/groups/${groupId}/loans`, loanData);
}

export async function getGroupLoanRequestsApi(groupId: string | number) {
  return api.get(`/api/loans/groups/${groupId}/loans`);
}

export async function getUserLoanRequestsApi() {
  return api.get('/api/loans/user/loans');
}

export async function approveLoanRequestApi(
  groupId: string | number, 
  loanId: string | number, 
  approvalData: { 
    dueDate: string; 
    interestRate: number; 
    paymentMethod: string; 
  }
) {
  return api.put(`/api/loans/groups/${groupId}/loans/${loanId}/approve`, {
    dueDate: approvalData.dueDate,
    interestRate: approvalData.interestRate,
    paymentMethod: approvalData.paymentMethod
  });
}

export async function rejectLoanRequestApi(groupId: string | number, loanId: string | number) {
  return api.put(`/api/loans/groups/${groupId}/loans/${loanId}/reject`);
}

export async function makeLoanRepaymentApi(loanId: string | number, repaymentData: { amount: number }) {
  return api.post(`/api/loans/loans/${loanId}/repay`, repaymentData);
}

export async function applyLoanPenaltyApi(groupId: string | number, loanId: string | number, penaltyData: { amount: number }) {
  return api.put(`/api/loans/groups/${groupId}/loans/${loanId}/penalty`, penaltyData);
}

export async function getOverdueLoansApi(groupId: string | number) {
  return api.get(`/api/loans/groups/${groupId}/loans/overdue`);
}

export async function getCurrentUserApi() {
  return api.get('/api/auth/me');
}

// Additional comprehensive API endpoints
export async function getUserContributionsApi() {
  return api.get('/api/transactions/user/contributions');
}

export async function getGroupSavingsSummaryApi(groupId: string | number) {
  return api.get(`/api/transactions/groups/${groupId}/savings-summary`);
}

export async function inviteMemberToGroupApi(groupId: string | number, inviteData: { email: string; name: string; phone?: string }) {
  return api.post(`/api/groups/${groupId}/invite`, inviteData);
}

export async function getGroupHistoryApi(groupId: string | number) {
  return api.get(`/api/groups/${groupId}/history`);
}

export async function removeMemberFromGroupApi(groupId: string | number, userId: string | number) {
  return api.delete(`/api/groups/${groupId}/members/${userId}`);
}

// Additional missing API endpoints to match web functionality
export async function getUserContributionsByGroupApi() {
  return api.get('/api/transactions/user/contributions-by-group');
}

export async function getGroupActiveLoanHolderApi(groupId: string | number) {
  return api.get(`/api/loans/groups/${groupId}/active-loan-holder`);
}

export async function searchGroupsApi(query: string) {
  return api.get(`/api/groups/search?q=${encodeURIComponent(query)}`);
}

export async function getGroupStatisticsApi(groupId: string | number) {
  return api.get(`/api/groups/${groupId}/statistics`);
}

export async function getNextContributionDateApi(groupId: string | number) {
  return api.get(`/api/groups/${groupId}/next-contribution-date`);
}

export async function makeScheduledContributionApi(groupId: string | number, payload: {
  paymentMethod: string;
  scheduleDate?: string;
  recurring?: boolean;
}) {
  return api.post(`/api/groups/${groupId}/contribute/scheduled`, payload);
}

export async function getGroupLoanStatusApi(groupId: string | number) {
  return api.get(`/api/loans/groups/${groupId}/status`);
}

export async function updateMemberRoleApi(groupId: string | number, userId: string | number, role: string) {
  return api.put(`/api/groups/${groupId}/members/${userId}/role`, { role });
}

export async function sendGroupInviteApi(groupId: string | number, payload: {
  emails?: string[];
  phones?: string[];
  message?: string;
}) {
  return api.post(`/api/groups/${groupId}/invites/send`, payload);
}

export async function getGroupTransactionHistoryApi(groupId: string | number, filters?: {
  type?: string;
  dateRange?: string;
  memberId?: string;
}) {
  const params = new URLSearchParams();
  if (filters?.type) params.append('type', filters.type);
  if (filters?.dateRange) params.append('dateRange', filters.dateRange);
  if (filters?.memberId) params.append('memberId', filters.memberId);
  
  const query = params.toString();
  return api.get(`/api/groups/${groupId}/transactions/history${query ? '?' + query : ''}`);
}

export async function makeContributionApi(groupId: string | number, contributionData: { amount: number; description?: string }) {
  return api.post(`/api/groups/${groupId}/contribute`, contributionData);
}

// Debug function to test and compare different total savings endpoints
export async function debugTotalSavingsApi() {
  console.log('=== 🐛 DEBUG: Testing all total savings endpoints ===');
  
  try {
    // Test authentication first
    const token = await getToken();
    console.log('🔑 Auth token status:', token ? 'Present' : 'Missing');
    
    // Test primary endpoint
    console.log('📊 Testing getUserTotalSavingsApi...');
    const totalSavingsRes = await getUserTotalSavingsApi();
    console.log('✅ Primary endpoint response:', {
      status: totalSavingsRes.status,
      dataKeys: Object.keys(totalSavingsRes.data || {}),
      fullData: JSON.stringify(totalSavingsRes.data, null, 2),
      extractedValue: totalSavingsRes.data?.data?.total_savings || totalSavingsRes.data?.total_savings || 0
    });
    
    // Test contributions by group
    console.log('Testing getUserContributionsByGroupApi...');
    const contributionsByGroupRes = await getUserContributionsByGroupApi();
    const contributionsByGroupTotal = contributionsByGroupRes.data?.data?.contributions?.reduce((sum: number, c: any) => sum + (c.total_amount || 0), 0) || 0;
    console.log('Contributions by group response:', {
      status: contributionsByGroupRes.status,
      data: contributionsByGroupRes.data,
      calculatedTotal: contributionsByGroupTotal
    });
    
    // Test user contributions
    console.log('Testing getUserContributionsApi...');
    const userContributionsRes = await getUserContributionsApi();
    const userContributionsTotal = userContributionsRes.data?.data?.contributions?.reduce((sum: number, c: any) => sum + (c.amount || 0), 0) || 0;
    console.log('User contributions response:', {
      status: userContributionsRes.status,
      data: userContributionsRes.data,
      calculatedTotal: userContributionsTotal
    });
    
    console.log('=== DEBUG: Summary ===');
    console.log('Primary API total:', totalSavingsRes.data?.data?.totalSavings || totalSavingsRes.data?.totalSavings || 0);
    console.log('Contributions by group total:', contributionsByGroupTotal);
    console.log('User contributions total:', userContributionsTotal);
    
  } catch (error) {
    console.error('Debug API error:', error);
  }
}
