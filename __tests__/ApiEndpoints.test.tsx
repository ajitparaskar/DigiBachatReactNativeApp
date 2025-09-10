import axios from 'axios';
import * as api from '../src/services/api';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock auth service
jest.mock('../src/services/auth', () => ({
  getToken: jest.fn().mockResolvedValue('mock-token'),
}));

describe('API Endpoints Tests', () => {
  const mockAxiosInstance = {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockedAxios.create.mockReturnValue(mockAxiosInstance as any);
  });

  describe('1. Authentication Endpoints', () => {
    it('should call login API correctly', async () => {
      mockAxiosInstance.post.mockResolvedValue({ data: { success: true, token: 'test-token' } });

      await api.loginApi('test@example.com', 'password123');

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/api/auth/login', {
        email: 'test@example.com',
        password: 'password123',
      });
    });

    it('should call register API correctly', async () => {
      mockAxiosInstance.post.mockResolvedValue({ data: { success: true } });

      await api.registerApi('John Doe', 'test@example.com', 'password123', '+1234567890');

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/api/auth/register', {
        name: 'John Doe',
        email: 'test@example.com',
        password: 'password123',
        phone: '+1234567890',
      });
    });

    it('should call verify email API correctly', async () => {
      mockAxiosInstance.post.mockResolvedValue({ data: { success: true } });

      await api.verifyEmailApi('test@example.com', '123456');

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/api/auth/verify-email', {
        email: 'test@example.com',
        otp: '123456',
      });
    });

    it('should call current user API correctly', async () => {
      mockAxiosInstance.get.mockResolvedValue({ 
        data: { success: true, data: { user: { id: 1, name: 'John Doe' } } } 
      });

      await api.getCurrentUserApi();

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/auth/me');
    });
  });

  describe('2. Group Management Endpoints', () => {
    it('should call get user groups API correctly', async () => {
      mockAxiosInstance.get.mockResolvedValue({ 
        data: { success: true, data: { groups: [] } } 
      });

      await api.getUserGroupsApi();

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/groups/my-groups');
    });

    it('should call create group API correctly', async () => {
      const groupData = {
        name: 'Test Group',
        description: 'Test Description',
        savings_frequency: 'monthly' as const,
        savings_amount: 5000,
        interest_rate: 10,
        default_loan_duration: 30,
      };

      mockAxiosInstance.post.mockResolvedValue({ data: { success: true } });

      await api.createGroupApi(groupData);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/api/groups/', groupData);
    });

    it('should call join group API correctly', async () => {
      mockAxiosInstance.post.mockResolvedValue({ data: { success: true } });

      await api.joinGroupApi('ABC123');

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/api/groups/join/ABC123');
    });

    it('should call get group members API correctly', async () => {
      mockAxiosInstance.get.mockResolvedValue({ 
        data: { success: true, data: { members: [] } } 
      });

      await api.getGroupMembersApi(1);

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/groups/1/members');
    });

    it('should call update member role API correctly', async () => {
      mockAxiosInstance.put.mockResolvedValue({ data: { success: true } });

      await api.updateMemberRoleApi(1, 2, 'leader');

      expect(mockAxiosInstance.put).toHaveBeenCalledWith('/api/groups/1/members/2/role', {
        role: 'leader'
      });
    });

    it('should call remove member API correctly', async () => {
      mockAxiosInstance.delete.mockResolvedValue({ data: { success: true } });

      await api.removeMemberFromGroupApi(1, 2);

      expect(mockAxiosInstance.delete).toHaveBeenCalledWith('/api/groups/1/members/2');
    });
  });

  describe('3. Transaction and Contribution Endpoints', () => {
    it('should call contribute to group API correctly', async () => {
      mockAxiosInstance.post.mockResolvedValue({ data: { success: true } });

      await api.contributeToGroupApi(1, 'upi');

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/api/groups/1/contribute', {
        paymentMethod: 'upi'
      });
    });

    it('should call scheduled contribution API correctly', async () => {
      mockAxiosInstance.post.mockResolvedValue({ data: { success: true } });

      const contributionData = {
        paymentMethod: 'upi',
        scheduleDate: '2024-01-01',
        recurring: true,
      };

      await api.makeScheduledContributionApi(1, contributionData);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/api/groups/1/contribute/scheduled', contributionData);
    });

    it('should call get user total savings API correctly', async () => {
      mockAxiosInstance.get.mockResolvedValue({ 
        data: { success: true, data: { totalSavings: 50000 } } 
      });

      await api.getUserTotalSavingsApi();

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/transactions/user/total-savings');
    });

    it('should call get user contributions by group API correctly', async () => {
      mockAxiosInstance.get.mockResolvedValue({ 
        data: { success: true, data: { contributions: [] } } 
      });

      await api.getUserContributionsByGroupApi();

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/transactions/user/contributions-by-group');
    });

    it('should call get group transaction history API correctly', async () => {
      mockAxiosInstance.get.mockResolvedValue({ 
        data: { success: true, data: { transactions: [] } } 
      });

      const filters = {
        type: 'contribution',
        dateRange: '30days',
        memberId: '1',
      };

      await api.getGroupTransactionHistoryApi(1, filters);

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        '/api/groups/1/transactions/history?type=contribution&dateRange=30days&memberId=1'
      );
    });
  });

  describe('4. Loan Management Endpoints', () => {
    it('should call create loan request API correctly', async () => {
      mockAxiosInstance.post.mockResolvedValue({ data: { success: true } });

      const loanData = {
        amount: 10000,
        purpose: 'Emergency'
      };

      await api.createLoanRequestApi(1, loanData);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/api/loans/groups/1/loans', loanData);
    });

    it('should call get group loan requests API correctly', async () => {
      mockAxiosInstance.get.mockResolvedValue({ 
        data: { success: true, data: { loans: [] } } 
      });

      await api.getGroupLoanRequestsApi(1);

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/loans/groups/1/loans');
    });

    it('should call approve loan request API correctly', async () => {
      mockAxiosInstance.put.mockResolvedValue({ data: { success: true } });

      const approvalData = {
        dueDate: '2024-02-01',
        interestRate: 10,
        paymentMethod: 'group_funds'
      };

      await api.approveLoanRequestApi(1, 2, approvalData);

      expect(mockAxiosInstance.put).toHaveBeenCalledWith('/api/loans/groups/1/loans/2/approve', approvalData);
    });

    it('should call reject loan request API correctly', async () => {
      mockAxiosInstance.put.mockResolvedValue({ data: { success: true } });

      await api.rejectLoanRequestApi(1, 2);

      expect(mockAxiosInstance.put).toHaveBeenCalledWith('/api/loans/groups/1/loans/2/reject');
    });

    it('should call make loan repayment API correctly', async () => {
      mockAxiosInstance.post.mockResolvedValue({ data: { success: true } });

      const repaymentData = { amount: 5000 };

      await api.makeLoanRepaymentApi(1, repaymentData);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/api/loans/loans/1/repay', repaymentData);
    });
  });

  describe('5. Invitation and Communication Endpoints', () => {
    it('should call send group invite API correctly', async () => {
      mockAxiosInstance.post.mockResolvedValue({ data: { success: true } });

      const inviteData = {
        emails: ['test1@example.com', 'test2@example.com'],
        phones: ['+1234567890'],
        message: 'Join our savings group!'
      };

      await api.sendGroupInviteApi(1, inviteData);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/api/groups/1/invites/send', inviteData);
    });

    it('should call invite member to group API correctly', async () => {
      mockAxiosInstance.post.mockResolvedValue({ data: { success: true } });

      await api.inviteMemberToGroupApi(1, 'test@example.com');

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/api/groups/1/invite', {
        email: 'test@example.com'
      });
    });
  });

  describe('6. Additional Comprehensive Endpoints', () => {
    it('should call search groups API correctly', async () => {
      mockAxiosInstance.get.mockResolvedValue({ 
        data: { success: true, data: { groups: [] } } 
      });

      await api.searchGroupsApi('test group');

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/groups/search?q=test%20group');
    });

    it('should call get group statistics API correctly', async () => {
      mockAxiosInstance.get.mockResolvedValue({ 
        data: { success: true, data: { statistics: {} } } 
      });

      await api.getGroupStatisticsApi(1);

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/groups/1/statistics');
    });

    it('should call get next contribution date API correctly', async () => {
      mockAxiosInstance.get.mockResolvedValue({ 
        data: { success: true, data: { nextDate: '2024-02-01' } } 
      });

      await api.getNextContributionDateApi(1);

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/groups/1/next-contribution-date');
    });

    it('should call get group active loan holder API correctly', async () => {
      mockAxiosInstance.get.mockResolvedValue({ 
        data: { success: true, data: { loanHolder: 'John Doe' } } 
      });

      await api.getGroupActiveLoanHolderApi(1);

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/loans/groups/1/active-loan-holder');
    });

    it('should call get group loan status API correctly', async () => {
      mockAxiosInstance.get.mockResolvedValue({ 
        data: { success: true, data: { status: 'active' } } 
      });

      await api.getGroupLoanStatusApi(1);

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/loans/groups/1/status');
    });
  });

  describe('7. Password Management Endpoints', () => {
    it('should call forgot password API correctly', async () => {
      mockAxiosInstance.post.mockResolvedValue({ data: { success: true } });

      await api.forgotPasswordApi('test@example.com');

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/api/password/forgot-password', {
        email: 'test@example.com'
      });
    });

    it('should call reset password API correctly', async () => {
      mockAxiosInstance.post.mockResolvedValue({ data: { success: true } });

      const resetData = {
        email: 'test@example.com',
        newPassword: 'newpassword123',
        confirmPassword: 'newpassword123',
        token: 'reset-token'
      };

      await api.resetPasswordApi(resetData);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/api/password/reset-password', resetData);
    });

    it('should call change password API correctly', async () => {
      mockAxiosInstance.post.mockResolvedValue({ data: { success: true } });

      const changeData = {
        currentPassword: 'oldpassword123',
        newPassword: 'newpassword123',
        confirmPassword: 'newpassword123'
      };

      await api.changePasswordApi(changeData);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/api/password/change-password', changeData);
    });
  });

  describe('8. Group Administration Endpoints', () => {
    it('should call update group API correctly', async () => {
      mockAxiosInstance.put.mockResolvedValue({ data: { success: true } });

      const updateData = {
        name: 'Updated Group Name',
        description: 'Updated Description',
        interest_rate: 12
      };

      await api.updateGroupApi(1, updateData);

      expect(mockAxiosInstance.put).toHaveBeenCalledWith('/api/groups/1', updateData);
    });

    it('should call leave group API correctly', async () => {
      mockAxiosInstance.delete.mockResolvedValue({ data: { success: true } });

      await api.leaveGroupApi(1);

      expect(mockAxiosInstance.delete).toHaveBeenCalledWith('/api/groups/1/leave');
    });

    it('should call get join requests API correctly', async () => {
      mockAxiosInstance.get.mockResolvedValue({ 
        data: { success: true, data: { requests: [] } } 
      });

      await api.getJoinRequestsApi(1);

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/groups/1/join-requests');
    });

    it('should call approve join request API correctly', async () => {
      mockAxiosInstance.post.mockResolvedValue({ data: { success: true } });

      await api.approveJoinRequestApi(1, 2);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/api/groups/1/join-requests/2/approve');
    });

    it('should call reject join request API correctly', async () => {
      mockAxiosInstance.post.mockResolvedValue({ data: { success: true } });

      await api.rejectJoinRequestApi(1, 2);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/api/groups/1/join-requests/2/reject');
    });
  });

  describe('9. Transaction Export and Analysis', () => {
    it('should call export transactions API correctly', async () => {
      mockAxiosInstance.post.mockResolvedValue({ data: { success: true } });

      const exportData = {
        type: 'contribution',
        dateRange: '30days',
        group: 'group1',
        format: 'csv'
      };

      await api.exportTransactionsApi(exportData);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/api/transactions/export', exportData);
    });

    it('should call get user transactions API correctly', async () => {
      mockAxiosInstance.get.mockResolvedValue({ 
        data: { success: true, data: { transactions: [] } } 
      });

      await api.getUserTransactionsApi();

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/transactions/user/transactions');
    });

    it('should call get group savings summary API correctly', async () => {
      mockAxiosInstance.get.mockResolvedValue({ 
        data: { success: true, data: { summary: {} } } 
      });

      await api.getGroupSavingsSummaryApi(1);

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/transactions/groups/1/savings-summary');
    });
  });

  describe('10. Account Management', () => {
    it('should call delete account API correctly', async () => {
      mockAxiosInstance.delete.mockResolvedValue({ data: { success: true } });

      await api.deleteAccountApi();

      expect(mockAxiosInstance.delete).toHaveBeenCalledWith('/api/user/account');
    });

    it('should call get upcoming contributions API correctly', async () => {
      mockAxiosInstance.get.mockResolvedValue({ 
        data: { success: true, data: { items: [] } } 
      });

      await api.getUpcomingContributionsApi();

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/transactions/user/upcoming-contributions');
    });
  });

  describe('11. Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      const errorResponse = {
        response: {
          status: 400,
          data: { message: 'Bad Request' }
        }
      };

      mockAxiosInstance.get.mockRejectedValue(errorResponse);

      await expect(api.getUserGroupsApi()).rejects.toEqual(errorResponse);
    });

    it('should handle network errors', async () => {
      const networkError = new Error('Network Error');
      mockAxiosInstance.get.mockRejectedValue(networkError);

      await expect(api.getUserGroupsApi()).rejects.toEqual(networkError);
    });
  });

  describe('12. API Configuration', () => {
    it('should create axios instance with correct base URL', () => {
      expect(mockedAxios.create).toHaveBeenCalledWith({
        baseURL: 'https://digibachat.onrender.com'
      });
    });

    it('should set up request interceptors', () => {
      expect(mockAxiosInstance.interceptors.request.use).toHaveBeenCalled();
    });
  });
});
