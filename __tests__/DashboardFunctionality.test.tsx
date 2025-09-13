import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { Alert } from 'react-native';
import DashboardScreen from '../src/screens/DashboardScreen';

// Mock navigation
const mockNavigate = jest.fn();
const mockNavigation = {
  navigate: mockNavigate,
};

// Mock API functions
jest.mock('../src/services/api', () => ({
  getUserGroupsApi: jest.fn(),
  getUserTotalSavingsApi: jest.fn(),
  getUpcomingContributionsApi: jest.fn(),
  getCurrentUserApi: jest.fn(),
  getUserContributionsByGroupApi: jest.fn(),
  getGroupLoanRequestsApi: jest.fn(),
  approveLoanRequestApi: jest.fn(),
  rejectLoanRequestApi: jest.fn(),
  contributeToGroupApi: jest.fn(),
  makeScheduledContributionApi: jest.fn(),
  getGroupMembersApi: jest.fn(),
  removeMemberFromGroupApi: jest.fn(),
  updateMemberRoleApi: jest.fn(),
  sendGroupInviteApi: jest.fn(),
  getGroupTransactionHistoryApi: jest.fn(),
}));

// Mock react-navigation/native
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => mockNavigation,
}));

// Mock Alert
jest.spyOn(Alert, 'alert').mockImplementation(() => {});

// Mock modals
jest.mock('../src/components/modals/GroupHistoryModal', () => 'GroupHistoryModal');
jest.mock('../src/components/modals/GroupMembersModal', () => 'GroupMembersModal');
jest.mock('../src/components/modals/InviteMembersModal', () => 'InviteMembersModal');
jest.mock('../src/components/modals/ContributeModal', () => 'ContributeModal');

import * as api from '../src/services/api';

describe('DashboardScreen Functionality Tests', () => {
  const mockApiResolve = (data: any) => Promise.resolve({ data: { success: true, data } });

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default API mocks
    (api.getUserTotalSavingsApi as jest.Mock).mockResolvedValue(mockApiResolve({ totalSavings: 50000 }));
    (api.getUpcomingContributionsApi as jest.Mock).mockResolvedValue(mockApiResolve({ items: [{ id: 1 }, { id: 2 }] }));
    (api.getCurrentUserApi as jest.Mock).mockResolvedValue(mockApiResolve({ user: { name: 'John Doe' } }));
    (api.getUserContributionsByGroupApi as jest.Mock).mockResolvedValue(mockApiResolve({ contributions: [] }));
    (api.getUserGroupsApi as jest.Mock).mockResolvedValue(mockApiResolve({
      groups: [
        {
          id: 1,
          name: 'Test Group 1',
          description: 'Test Description 1',
          savings_amount: 5000,
          savings_frequency: 'monthly',
          interest_rate: 10,
          total_savings: 25000,
          is_leader: true,
        },
        {
          id: 2,
          name: 'Test Group 2',
          description: 'Test Description 2',
          savings_amount: 3000,
          savings_frequency: 'weekly',
          interest_rate: 8,
          total_savings: 15000,
          is_leader: false,
        },
      ]
    }));
    (api.getGroupLoanRequestsApi as jest.Mock).mockResolvedValue(mockApiResolve({
      loans: [
        {
          id: 'loan1',
          group_id: 1,
          user_id: 'user1',
          amount: 10000,
          purpose: 'Emergency',
          status: 'pending',
          user_name: 'Jane Doe',
          requested_at: new Date().toISOString(),
        }
      ]
    }));
  });

  describe('1. Dashboard Loading and Data Display', () => {
    it('should load and display user data correctly', async () => {
      const { getByText, queryByText } = render(<DashboardScreen />);

      // Should show loading initially
      expect(queryByText('Loading your dashboard...')).toBeTruthy();

      // Wait for data to load
      await waitFor(() => {
        expect(queryByText('Loading your dashboard...')).toBeNull();
      });

      // Should display personalized greeting
      expect(getByText(/Welcome back, John Doe!/)).toBeTruthy();
      
      // Should display total savings
      expect(getByText('₹ 50,000')).toBeTruthy();
      
      // Should display group count
      expect(getByText('2')).toBeTruthy();
    });

    it('should load and display groups correctly', async () => {
      const { getByText } = render(<DashboardScreen />);

      await waitFor(() => {
        // Should display both groups
        expect(getByText('Test Group 1')).toBeTruthy();
        expect(getByText('Test Group 2')).toBeTruthy();
        expect(getByText('Test Description 1')).toBeTruthy();
        expect(getByText('Test Description 2')).toBeTruthy();
      });
    });
  });

  describe('2. Group Search Functionality', () => {
    it('should filter groups based on search query', async () => {
      const { getByPlaceholderText, getByText, queryByText } = render(<DashboardScreen />);

      await waitFor(() => {
        expect(getByText('Test Group 1')).toBeTruthy();
        expect(getByText('Test Group 2')).toBeTruthy();
      });

      // Search for a specific group
      const searchInput = getByPlaceholderText('Search groups...');
      fireEvent.changeText(searchInput, 'Group 1');

      // Should show only matching group
      expect(getByText('Test Group 1')).toBeTruthy();
      expect(queryByText('Test Group 2')).toBeNull();
    });

    it('should show empty state when no groups match search', async () => {
      const { getByPlaceholderText, getByText } = render(<DashboardScreen />);

      await waitFor(() => {
        expect(getByText('Test Group 1')).toBeTruthy();
      });

      // Search for non-existent group
      const searchInput = getByPlaceholderText('Search groups...');
      fireEvent.changeText(searchInput, 'Non-existent Group');

      // Should show no groups found message
      expect(getByText('No groups found')).toBeTruthy();
      expect(getByText('Try adjusting your search')).toBeTruthy();
    });
  });

  describe('3. Group Expansion and Statistics', () => {
    it('should expand group to show detailed statistics', async () => {
      const { getByText } = render(<DashboardScreen />);

      await waitFor(() => {
        expect(getByText('Test Group 1')).toBeTruthy();
      });

      // Click to expand group
      fireEvent.press(getByText('Test Group 1'));

      // Should show expanded statistics
      expect(getByText('₹5000 / monthly')).toBeTruthy();
      expect(getByText('10%')).toBeTruthy();
      expect(getByText('₹25,000')).toBeTruthy();
    });

    it('should show next contribution date calculation', async () => {
      const { getByText } = render(<DashboardScreen />);

      await waitFor(() => {
        expect(getByText('Test Group 1')).toBeTruthy();
      });

      // Click to expand group
      fireEvent.press(getByText('Test Group 1'));

      // Should calculate and display next contribution date
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      const expectedDate = nextMonth.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
      
      expect(getByText(expectedDate)).toBeTruthy();
    });
  });

  describe('4. Pending Loan Requests Management', () => {
    it('should display pending loan requests for group leaders', async () => {
      const { getByText } = render(<DashboardScreen />);

      await waitFor(() => {
        // Should show loan requests section
        expect(getByText('Pending Loan Requests')).toBeTruthy();
        expect(getByText('Test Group 1')).toBeTruthy();
        expect(getByText('Jane Doe')).toBeTruthy();
        expect(getByText('₹10000')).toBeTruthy();
        expect(getByText('Emergency')).toBeTruthy();
      });
    });

    it('should handle loan approval', async () => {
      (api.approveLoanRequestApi as jest.Mock).mockResolvedValue({ success: true });
      
      const { getByText } = render(<DashboardScreen />);

      await waitFor(() => {
        expect(getByText('Jane Doe')).toBeTruthy();
      });

      // Find and click approve button
      const approveButtons = getByText('✓');
      fireEvent.press(approveButtons);

      await waitFor(() => {
        expect(api.approveLoanRequestApi).toHaveBeenCalledWith(
          1,
          'loan1',
          expect.objectContaining({
            dueDate: expect.any(String),
            interestRate: 10,
            paymentMethod: 'group_funds'
          })
        );
      });
    });

    it('should handle loan rejection', async () => {
      (api.rejectLoanRequestApi as jest.Mock).mockResolvedValue({ success: true });
      
      const { getByText } = render(<DashboardScreen />);

      await waitFor(() => {
        expect(getByText('Jane Doe')).toBeTruthy();
      });

      // Find and click reject button
      const rejectButton = getByText('✕');
      fireEvent.press(rejectButton);

      await waitFor(() => {
        expect(api.rejectLoanRequestApi).toHaveBeenCalledWith(1, 'loan1');
      });
    });
  });

  describe('5. Group Action Buttons', () => {
    it('should show action buttons when group is expanded', async () => {
      const { getByText } = render(<DashboardScreen />);

      await waitFor(() => {
        expect(getByText('Test Group 1')).toBeTruthy();
      });

      // Click to expand group
      fireEvent.press(getByText('Test Group 1'));

      // Should show all action buttons
      expect(getByText('History')).toBeTruthy();
      expect(getByText('Members')).toBeTruthy();
      expect(getByText('Contribute')).toBeTruthy();
      expect(getByText('Invite')).toBeTruthy();
    });
  });

  describe('6. Navigation Integration', () => {
    it('should navigate to CreateGroup when create button is pressed', async () => {
      const { getByText } = render(<DashboardScreen />);

      await waitFor(() => {
        expect(getByText('+ Create')).toBeTruthy();
      });

      fireEvent.press(getByText('+ Create'));
      expect(mockNavigate).toHaveBeenCalledWith('CreateGroup');
    });

    it('should navigate to notifications when notification button is pressed', async () => {
      const { getByText } = render(<DashboardScreen />);

      await waitFor(() => {
        expect(getByText('🔔')).toBeTruthy();
      });

      fireEvent.press(getByText('🔔'));
      expect(mockNavigate).toHaveBeenCalledWith('Notifications');
    });
  });

  describe('7. Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      (api.getUserGroupsApi as jest.Mock).mockRejectedValue(new Error('API Error'));
      
      render(<DashboardScreen />);

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith('Error', 'Failed to load dashboard data');
      });
    });

    it('should show empty state when no groups exist', async () => {
      (api.getUserGroupsApi as jest.Mock).mockResolvedValue(mockApiResolve({ groups: [] }));
      
      const { getByText } = render(<DashboardScreen />);

      await waitFor(() => {
        expect(getByText('No groups yet')).toBeTruthy();
        expect(getByText('Create or join a savings group to get started')).toBeTruthy();
      });
    });
  });

  describe('8. Data Calculations', () => {
    it('should calculate next contribution dates correctly for weekly groups', async () => {
      const { getByText } = render(<DashboardScreen />);

      await waitFor(() => {
        expect(getByText('Test Group 2')).toBeTruthy();
      });

      // Click to expand weekly group
      fireEvent.press(getByText('Test Group 2'));

      // Should calculate next week's date
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      const expectedDate = nextWeek.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
      
      expect(getByText(expectedDate)).toBeTruthy();
    });

    it('should display group statistics correctly', async () => {
      const { getByText } = render(<DashboardScreen />);

      await waitFor(() => {
        expect(getByText('Test Group 1')).toBeTruthy();
      });

      // Click to expand group
      fireEvent.press(getByText('Test Group 1'));

      // Should display all statistics
      expect(getByText('₹5000 / monthly')).toBeTruthy();
      expect(getByText('10%')).toBeTruthy();
      expect(getByText('₹25,000')).toBeTruthy();
    });
  });

  describe('9. UI State Management', () => {
    it('should toggle group expansion correctly', async () => {
      const { getByText, queryByText } = render(<DashboardScreen />);

      await waitFor(() => {
        expect(getByText('Test Group 1')).toBeTruthy();
      });

      // Initially should not show action buttons
      expect(queryByText('History')).toBeNull();

      // Click to expand
      fireEvent.press(getByText('Test Group 1'));
      expect(getByText('History')).toBeTruthy();

      // Click again to collapse
      fireEvent.press(getByText('Test Group 1'));
      expect(queryByText('History')).toBeNull();
    });

    it('should handle multiple group expansions correctly', async () => {
      const { getByText, getAllByText } = render(<DashboardScreen />);

      await waitFor(() => {
        expect(getByText('Test Group 1')).toBeTruthy();
        expect(getByText('Test Group 2')).toBeTruthy();
      });

      // Expand first group
      fireEvent.press(getByText('Test Group 1'));
      expect(getAllByText('History')).toHaveLength(1);

      // Expand second group (should collapse first)
      fireEvent.press(getByText('Test Group 2'));
      expect(getAllByText('History')).toHaveLength(1);
    });
  });
});
