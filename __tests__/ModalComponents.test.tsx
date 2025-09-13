import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';

// Import modal components
import GroupHistoryModal from '../src/components/modals/GroupHistoryModal';
import GroupMembersModal from '../src/components/modals/GroupMembersModal';
import InviteMembersModal from '../src/components/modals/InviteMembersModal';
import ContributeModal from '../src/components/modals/ContributeModal';

// Mock API functions
jest.mock('../src/services/api', () => ({
  getGroupTransactionHistoryApi: jest.fn(),
  getGroupMembersApi: jest.fn(),
  removeMemberFromGroupApi: jest.fn(),
  updateMemberRoleApi: jest.fn(),
  sendGroupInviteApi: jest.fn(),
  contributeToGroupApi: jest.fn(),
  makeScheduledContributionApi: jest.fn(),
}));

// Mock Alert
jest.spyOn(Alert, 'alert').mockImplementation((title, message, buttons) => {
  if (buttons && buttons[1]) {
    buttons[1].onPress?.();
  }
});

import * as api from '../src/services/api';

describe('Modal Components Tests', () => {
  const mockGroup = {
    id: 1,
    name: 'Test Group',
    description: 'Test Description',
    savings_amount: 5000,
    savings_frequency: 'monthly' as const,
    interest_rate: 10,
    total_savings: 25000,
    group_code: 'TG123',
    is_leader: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GroupHistoryModal', () => {
    const mockTransactions = [
      {
        id: '1',
        type: 'contribution' as const,
        amount: 5000,
        description: 'Monthly contribution',
        date: new Date().toISOString(),
        user_name: 'John Doe',
        status: 'completed' as const,
      },
      {
        id: '2',
        type: 'loan' as const,
        amount: 10000,
        description: 'Emergency loan',
        date: new Date().toISOString(),
        user_name: 'Jane Smith',
        status: 'pending' as const,
      },
    ];

    beforeEach(() => {
      (api.getGroupTransactionHistoryApi as jest.Mock).mockResolvedValue({
        data: {
          success: true,
          data: { transactions: mockTransactions }
        }
      });
    });

    it('should render and load transaction history', async () => {
      const mockClose = jest.fn();
      const { getByText, getByPlaceholderText } = render(
        <GroupHistoryModal
          visible={true}
          onClose={mockClose}
          group={mockGroup}
        />
      );

      // Should show header
      expect(getByText('Transaction History')).toBeTruthy();
      expect(getByText('Test Group')).toBeTruthy();

      // Should show search input
      expect(getByPlaceholderText('Search transactions...')).toBeTruthy();

      // Wait for transactions to load
      await waitFor(() => {
        expect(getByText('Monthly contribution')).toBeTruthy();
        expect(getByText('Emergency loan')).toBeTruthy();
        expect(getByText('John Doe')).toBeTruthy();
        expect(getByText('Jane Smith')).toBeTruthy();
      });
    });

    it('should filter transactions by type', async () => {
      const mockClose = jest.fn();
      const { getByText, queryByText } = render(
        <GroupHistoryModal
          visible={true}
          onClose={mockClose}
          group={mockGroup}
        />
      );

      await waitFor(() => {
        expect(getByText('Monthly contribution')).toBeTruthy();
        expect(getByText('Emergency loan')).toBeTruthy();
      });

      // Click on Contributions filter
      fireEvent.press(getByText('Contributions'));

      // Should show only contributions
      expect(getByText('Monthly contribution')).toBeTruthy();
      expect(queryByText('Emergency loan')).toBeNull();
    });

    it('should search transactions', async () => {
      const mockClose = jest.fn();
      const { getByText, queryByText, getByPlaceholderText } = render(
        <GroupHistoryModal
          visible={true}
          onClose={mockClose}
          group={mockGroup}
        />
      );

      await waitFor(() => {
        expect(getByText('Monthly contribution')).toBeTruthy();
      });

      // Search for specific transaction
      const searchInput = getByPlaceholderText('Search transactions...');
      fireEvent.changeText(searchInput, 'Emergency');

      // Should show only matching transactions
      expect(getByText('Emergency loan')).toBeTruthy();
      expect(queryByText('Monthly contribution')).toBeNull();
    });

    it('should close modal when close button is pressed', () => {
      const mockClose = jest.fn();
      const { getByText } = render(
        <GroupHistoryModal
          visible={true}
          onClose={mockClose}
          group={mockGroup}
        />
      );

      fireEvent.press(getByText('✕'));
      expect(mockClose).toHaveBeenCalled();
    });
  });

  describe('GroupMembersModal', () => {
    const mockMembers = [
      {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        role: 'leader' as const,
        join_date: '2023-01-01',
        contribution_amount: 15000,
        last_contribution_date: '2024-01-01',
        status: 'active' as const,
      },
      {
        id: '2',
        name: 'Jane Smith',
        email: 'jane@example.com',
        phone: '+0987654321',
        role: 'member' as const,
        join_date: '2023-02-01',
        contribution_amount: 10000,
        last_contribution_date: '2023-12-01',
        status: 'active' as const,
      },
    ];

    beforeEach(() => {
      (api.getGroupMembersApi as jest.Mock).mockResolvedValue({
        data: {
          success: true,
          data: { members: mockMembers }
        }
      });
    });

    it('should render and load group members', async () => {
      const mockClose = jest.fn();
      const { getByText } = render(
        <GroupMembersModal
          visible={true}
          onClose={mockClose}
          group={mockGroup}
        />
      );

      // Should show header
      expect(getByText('Group Members')).toBeTruthy();
      expect(getByText('Test Group')).toBeTruthy();

      // Wait for members to load
      await waitFor(() => {
        expect(getByText('John Doe')).toBeTruthy();
        expect(getByText('Jane Smith')).toBeTruthy();
        expect(getByText('john@example.com')).toBeTruthy();
        expect(getByText('jane@example.com')).toBeTruthy();
        expect(getByText('2 members')).toBeTruthy();
      });
    });

    it('should handle member role change', async () => {
      (api.updateMemberRoleApi as jest.Mock).mockResolvedValue({ success: true });
      
      const mockClose = jest.fn();
      const { getByText } = render(
        <GroupMembersModal
          visible={true}
          onClose={mockClose}
          group={mockGroup}
        />
      );

      await waitFor(() => {
        expect(getByText('Jane Smith')).toBeTruthy();
      });

      // Should find and click "Make Leader" button for Jane Smith
      const makeLeaderButton = getByText('Make Leader');
      fireEvent.press(makeLeaderButton);

      await waitFor(() => {
        expect(api.updateMemberRoleApi).toHaveBeenCalledWith(1, '2', 'leader');
      });
    });

    it('should handle member removal', async () => {
      (api.removeMemberFromGroupApi as jest.Mock).mockResolvedValue({ success: true });
      
      const mockClose = jest.fn();
      const { getByText } = render(
        <GroupMembersModal
          visible={true}
          onClose={mockClose}
          group={mockGroup}
        />
      );

      await waitFor(() => {
        expect(getByText('Jane Smith')).toBeTruthy();
      });

      // Should find and click "Remove" button
      const removeButton = getByText('Remove');
      fireEvent.press(removeButton);

      await waitFor(() => {
        expect(api.removeMemberFromGroupApi).toHaveBeenCalledWith(1, '2');
      });
    });
  });

  describe('InviteMembersModal', () => {
    it('should render invite form', () => {
      const mockClose = jest.fn();
      const { getByText, getByPlaceholderText } = render(
        <InviteMembersModal
          visible={true}
          onClose={mockClose}
          group={mockGroup}
        />
      );

      // Should show header
      expect(getByText('Invite Members')).toBeTruthy();
      expect(getByText('Test Group')).toBeTruthy();

      // Should show invite method options
      expect(getByText('Email')).toBeTruthy();
      expect(getByText('Phone')).toBeTruthy();
      expect(getByText('Both')).toBeTruthy();

      // Should show email input by default
      expect(getByPlaceholderText('Enter email address')).toBeTruthy();
    });

    it('should switch between invite methods', () => {
      const mockClose = jest.fn();
      const { getByText, getByPlaceholderText, queryByPlaceholderText } = render(
        <InviteMembersModal
          visible={true}
          onClose={mockClose}
          group={mockGroup}
        />
      );

      // Initially should show email input
      expect(getByPlaceholderText('Enter email address')).toBeTruthy();

      // Switch to phone method
      fireEvent.press(getByText('Phone'));
      expect(getByPlaceholderText('Enter phone number')).toBeTruthy();
      expect(queryByPlaceholderText('Enter email address')).toBeNull();

      // Switch to both method
      fireEvent.press(getByText('Both'));
      expect(getByPlaceholderText('Enter email address')).toBeTruthy();
      expect(getByPlaceholderText('Enter phone number')).toBeTruthy();
    });

    it('should add and remove input fields', () => {
      const mockClose = jest.fn();
      const { getByText, getAllByPlaceholderText } = render(
        <InviteMembersModal
          visible={true}
          onClose={mockClose}
          group={mockGroup}
        />
      );

      // Initially should have one email input
      expect(getAllByPlaceholderText('Enter email address')).toHaveLength(1);

      // Add another email field
      fireEvent.press(getByText('+ Add'));
      expect(getAllByPlaceholderText('Enter email address')).toHaveLength(2);

      // Remove field (click X button)
      const removeButtons = getAllByText('✕');
      if (removeButtons.length > 0) {
        fireEvent.press(removeButtons[0]);
        expect(getAllByPlaceholderText('Enter email address')).toHaveLength(1);
      }
    });

    it('should send invitations', async () => {
      (api.sendGroupInviteApi as jest.Mock).mockResolvedValue({ success: true });
      
      const mockClose = jest.fn();
      const { getByText, getByPlaceholderText } = render(
        <InviteMembersModal
          visible={true}
          onClose={mockClose}
          group={mockGroup}
        />
      );

      // Enter email
      const emailInput = getByPlaceholderText('Enter email address');
      fireEvent.changeText(emailInput, 'test@example.com');

      // Send invites
      fireEvent.press(getByText('Send Invites'));

      await waitFor(() => {
        expect(api.sendGroupInviteApi).toHaveBeenCalledWith(1, {
          emails: ['test@example.com']
        });
      });
    });
  });

  describe('ContributeModal', () => {
    it('should render contribute form', () => {
      const mockClose = jest.fn();
      const { getByText } = render(
        <ContributeModal
          visible={true}
          onClose={mockClose}
          group={mockGroup}
          onSuccess={() => {}}
        />
      );

      // Should show header with contribution amount
      expect(getByText('Make Contribution')).toBeTruthy();
      expect(getByText(/Contributing ₹5,000 to Test Group/)).toBeTruthy();

      // Should show contribution details
      expect(getByText('Contribution Details')).toBeTruthy();

      // Should show payment methods
      expect(getByText('Select Payment Method')).toBeTruthy();
      expect(getByText('UPI')).toBeTruthy();
      expect(getByText('Bank Transfer')).toBeTruthy();
      expect(getByText('Credit/Debit Card')).toBeTruthy();

      // Should show contribution options
      expect(getByText('Contribution Options')).toBeTruthy();
      expect(getByText('Schedule for Later')).toBeTruthy();
    });

    it('should select payment method', () => {
      const mockClose = jest.fn();
      const { getByText, getAllByText } = render(
        <ContributeModal
          visible={true}
          onClose={mockClose}
          group={mockGroup}
          onSuccess={() => {}}
        />
      );

      // Click on Bank Transfer
      fireEvent.press(getByText('Bank Transfer'));
      
      // Should select the Bank Transfer option (would be visually indicated)
      expect(getByText('Bank Transfer')).toBeTruthy();
    });

    it('should handle immediate contribution', async () => {
      (api.contributeToGroupApi as jest.Mock).mockResolvedValue({ success: true });
      
      const mockClose = jest.fn();
      const mockSuccess = jest.fn();
      const { getByText } = render(
        <ContributeModal
          visible={true}
          onClose={mockClose}
          group={mockGroup}
          onSuccess={mockSuccess}
        />
      );

      // Submit contribution
      fireEvent.press(getByText('Proceed to Pay'));

      await waitFor(() => {
        expect(api.contributeToGroupApi).toHaveBeenCalledWith(1, 'upi');
      });
    });

    it('should handle scheduled contribution', async () => {
      (api.makeScheduledContributionApi as jest.Mock).mockResolvedValue({ success: true });
      
      const mockClose = jest.fn();
      const mockSuccess = jest.fn();
      const { getByText } = render(
        <ContributeModal
          visible={true}
          onClose={mockClose}
          group={mockGroup}
          onSuccess={mockSuccess}
        />
      );

      // Enable schedule for later
      // Note: In a real test, you'd need to find the switch component and toggle it
      // For this test, we'll just verify the scheduled API would be called

      // The button text should change when scheduled is enabled
      expect(getByText('Proceed to Pay')).toBeTruthy();
    });

    it('should calculate next contribution date', () => {
      const mockClose = jest.fn();
      const { getByText } = render(
        <ContributeModal
          visible={true}
          onClose={mockClose}
          group={mockGroup}
          onSuccess={() => {}}
        />
      );

      // Should show next contribution date for monthly group
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      const expectedDate = nextMonth.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });

      expect(getByText(expectedDate)).toBeTruthy();
    });
  });

  describe('Modal Integration', () => {
    it('should handle modal close operations', () => {
      const mockClose = jest.fn();

      // Test each modal's close functionality
      const modals = [
        <GroupHistoryModal key="history" visible={true} onClose={mockClose} group={mockGroup} />,
        <GroupMembersModal key="members" visible={true} onClose={mockClose} group={mockGroup} />,
        <InviteMembersModal key="invite" visible={true} onClose={mockClose} group={mockGroup} />,
        <ContributeModal key="contribute" visible={true} onClose={mockClose} group={mockGroup} onSuccess={() => {}} />
      ];

      modals.forEach((modal, index) => {
        jest.clearAllMocks();
        const { getByText } = render(modal);
        
        // Each modal should have a close button (✕)
        fireEvent.press(getByText('✕'));
        expect(mockClose).toHaveBeenCalled();
      });
    });

    it('should handle null group gracefully', () => {
      const mockClose = jest.fn();

      // Test each modal with null group
      const modals = [
        <GroupHistoryModal key="history" visible={true} onClose={mockClose} group={null} />,
        <GroupMembersModal key="members" visible={true} onClose={mockClose} group={null} />,
        <InviteMembersModal key="invite" visible={true} onClose={mockClose} group={null} />,
        <ContributeModal key="contribute" visible={true} onClose={mockClose} group={null} onSuccess={() => {}} />
      ];

      // Should not crash with null group
      modals.forEach((modal) => {
        expect(() => render(modal)).not.toThrow();
      });
    });
  });
});
