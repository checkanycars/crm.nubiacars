import axios from '../lib/axios';

export interface FinanceLead {
  id: number;
  lead_name: string;
  customer_id?: number;
  customer?: {
    id: number;
    full_name: string;
    email: string;
    phone: string;
    status: string;
  };
  status: 'new' | 'contacted' | 'converted' | 'not_converted';
  category?: string;
  source: string;
  car_company: string;
  model: string;
  trim?: string;
  spec?: string;
  model_year: number;
  interior_colour?: string;
  exterior_colour?: string;
  gear_box?: string;
  car_type?: 'new' | 'used';
  fuel_tank?: string;
  steering_side?: string;
  export_to?: string;
  export_to_country?: string;
  quantity?: number;
  selling_price?: number;
  cost_price?: number;
  notes?: string;
  priority: 'high' | 'medium' | 'low';
  not_converted_reason?: string;
  assigned_to?: number;
  assigned_user?: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
  finance_approved?: boolean | null;
  approved_by?: number;
  approved_by_user?: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
  approved_at?: string;
  rejection_reason?: string;
  commission_paid?: boolean;
  created_at: string;
  updated_at?: string;
}

export interface FinanceStatistics {
  pending_approvals: number;
  approved_leads: number;
  rejected_leads: number;
  pending_commission_payment: number;
  total_approved_value: number;
  total_commission_paid: number;
  total_pending_commission: number;
  top_sales_users: Array<{
    assigned_to: number;
    approved_count: number;
    assigned_user: {
      id: number;
      name: string;
      email: string;
    };
  }>;
  recent_activities: FinanceLead[];
}

export interface PaginatedFinanceLeadsResponse {
  data: FinanceLead[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

export interface ApproveLeadResponse {
  message: string;
  lead: FinanceLead;
}

export interface RejectLeadData {
  rejection_reason: string;
}

export interface RejectLeadResponse {
  message: string;
  lead: FinanceLead;
}

export interface FinanceLeadsFilters {
  search?: string;
  assigned_to?: number;
  commission_paid?: boolean;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  per_page?: number;
  page?: number;
}

class FinanceService {
  /**
   * Get all converted leads pending finance approval
   */
  async getPendingApprovals(filters?: FinanceLeadsFilters): Promise<PaginatedFinanceLeadsResponse> {
    const response = await axios.get('api/finance/pending-approvals', { params: filters });
    return response.data;
  }

  /**
   * Get all approved leads
   */
  async getApprovedLeads(filters?: FinanceLeadsFilters): Promise<PaginatedFinanceLeadsResponse> {
    const response = await axios.get('api/finance/approved-leads', { params: filters });
    return response.data;
  }

  /**
   * Get all rejected leads
   */
  async getRejectedLeads(filters?: FinanceLeadsFilters): Promise<PaginatedFinanceLeadsResponse> {
    const response = await axios.get('api/finance/rejected-leads', { params: filters });
    return response.data;
  }

  /**
   * Approve a converted lead
   */
  async approveLead(leadId: number): Promise<ApproveLeadResponse> {
    const response = await axios.post(`api/finance/leads/${leadId}/approve`);
    return response.data;
  }

  /**
   * Reject a converted lead
   */
  async rejectLead(leadId: number, data: RejectLeadData): Promise<RejectLeadResponse> {
    const response = await axios.post(`api/finance/leads/${leadId}/reject`, data);
    return response.data;
  }

  /**
   * Mark commission as paid for an approved lead
   */
  async markCommissionPaid(leadId: number): Promise<{ message: string; lead: FinanceLead }> {
    const response = await axios.patch(`api/finance/leads/${leadId}/mark-commission-paid`);
    return response.data;
  }

  /**
   * Get finance statistics
   */
  async getStatistics(): Promise<FinanceStatistics> {
    const response = await axios.get('api/finance/statistics');
    return response.data;
  }
}

export const financeService = new FinanceService();
