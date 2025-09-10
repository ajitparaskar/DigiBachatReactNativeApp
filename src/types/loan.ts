export interface LoanRequest {
  id: number;
  user_id: number;
  group_id: number;
  amount: number;
  purpose: string;
  status: 'pending' | 'approved' | 'rejected' | 'repaid';
  created_at: string;
  due_date: string | null;
  interest_rate: number | null;
  penalty_amount: number | null;
  repayment_status: 'not_started' | 'partial' | 'complete';
  user_name?: string;
  user_email?: string;
}

export interface CreateLoanRequest {
  amount: number;
  purpose: string;
}

export interface LoanApprovalData {
  dueDate: string;
  interestRate: number;
  paymentMethod: string;
}

export interface LoanRepaymentData {
  amount: number;
}

export interface LoanPenaltyData {
  amount: number;
}

export interface LoanApiResponse {
  success: boolean;
  message: string;
  data?: {
    loans: LoanRequest[];
  };
}
