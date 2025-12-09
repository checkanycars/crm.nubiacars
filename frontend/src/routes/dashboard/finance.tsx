import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '../../contexts/AuthContext';
import { financeService, type FinanceLead, type FinanceStatistics } from '../../services/financeService';
import { CheckCircle, XCircle, Clock, DollarSign, TrendingUp, Users, Search, FileText } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Alert,
  AlertDescription,
} from '@/components/ui/alert';

export const Route = createFileRoute('/dashboard/finance')({
  component: FinancePage,
});

function FinancePage() {
  const { user, hasRole } = useAuth();
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [pendingLeads, setPendingLeads] = useState<FinanceLead[]>([]);
  const [approvedLeads, setApprovedLeads] = useState<FinanceLead[]>([]);
  const [rejectedLeads, setRejectedLeads] = useState<FinanceLead[]>([]);
  const [statistics, setStatistics] = useState<FinanceStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState<FinanceLead | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Check if user has finance or manager role
  useEffect(() => {
    if (!hasRole('finance') && !hasRole('manager')) {
      setError('Unauthorized. Only finance users and managers can access this page.');
      setIsLoading(false);
    }
  }, [hasRole]);

  // Fetch statistics
  const fetchStatistics = async () => {
    try {
      const stats = await financeService.getStatistics();
      setStatistics(stats);
    } catch (err: any) {
      console.error('Failed to fetch statistics:', err);
    }
  };

  // Fetch pending leads
  const fetchPendingLeads = async () => {
    try {
      const response = await financeService.getPendingApprovals({ 
        search: searchTerm,
        per_page: 100 
      });
      setPendingLeads(response.data || []);
    } catch (err: any) {
      console.error('Failed to fetch pending leads:', err);
      setPendingLeads([]);
      throw err; // Re-throw to be caught by fetchAllData
    }
  };

  // Fetch approved leads
  const fetchApprovedLeads = async () => {
    try {
      const response = await financeService.getApprovedLeads({ 
        search: searchTerm,
        per_page: 100 
      });
      setApprovedLeads(response.data || []);
    } catch (err: any) {
      console.error('Failed to fetch approved leads:', err);
      setApprovedLeads([]);
      throw err; // Re-throw to be caught by fetchAllData
    }
  };

  // Fetch rejected leads
  const fetchRejectedLeads = async () => {
    try {
      const response = await financeService.getRejectedLeads({ 
        search: searchTerm,
        per_page: 100 
      });
      setRejectedLeads(response.data || []);
    } catch (err: any) {
      console.error('Failed to fetch rejected leads:', err);
      setRejectedLeads([]);
      throw err; // Re-throw to be caught by fetchAllData
    }
  };

  // Initial load
  useEffect(() => {
    if (hasRole('finance') || hasRole('manager')) {
      fetchAllData();
    }
  }, [hasRole]);

  const fetchAllData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await Promise.all([
        fetchStatistics(),
        fetchPendingLeads(),
        fetchApprovedLeads(),
        fetchRejectedLeads(),
      ]);
    } catch (err: any) {
      console.error('Failed to fetch data:', err);
      const errorMessage = err?.response?.data?.message || 'Failed to load finance data. Please try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Search handler with debounce
  useEffect(() => {
    if (!hasRole('finance') && !hasRole('manager')) return;
    
    const timer = setTimeout(() => {
      setError(null); // Clear any existing errors
      if (activeTab === 'pending') {
        fetchPendingLeads().catch(() => {});
      } else if (activeTab === 'approved') {
        fetchApprovedLeads().catch(() => {});
      } else {
        fetchRejectedLeads().catch(() => {});
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, activeTab]);

  // Approve lead handler
  const handleApproveLead = async (lead: FinanceLead) => {
    if (!confirm(`Are you sure you want to approve this lead for ${lead.lead_name}?`)) {
      return;
    }

    setIsProcessing(true);
    try {
      await financeService.approveLead(lead.id);
      alert('Lead approved successfully! Commission has been added to the sales user.');
      await fetchAllData();
    } catch (err: any) {
      console.error('Failed to approve lead:', err);
      alert(err?.response?.data?.message || 'Failed to approve lead');
    } finally {
      setIsProcessing(false);
    }
  };

  // Open reject modal
  const handleOpenRejectModal = (lead: FinanceLead) => {
    setSelectedLead(lead);
    setRejectionReason('');
    setShowRejectModal(true);
  };

  // Reject lead handler
  const handleRejectLead = async () => {
    if (!selectedLead || !rejectionReason.trim()) {
      alert('Please provide a rejection reason.');
      return;
    }

    setIsProcessing(true);
    try {
      await financeService.rejectLead(selectedLead.id, { rejection_reason: rejectionReason });
      alert('Lead rejected successfully.');
      setShowRejectModal(false);
      setSelectedLead(null);
      setRejectionReason('');
      await fetchAllData();
    } catch (err: any) {
      console.error('Failed to reject lead:', err);
      alert(err?.response?.data?.message || 'Failed to reject lead');
    } finally {
      setIsProcessing(false);
    }
  };

  // Mark commission as paid
  const handleMarkCommissionPaid = async (lead: FinanceLead) => {
    if (!confirm(`Mark commission as paid for ${lead.lead_name}?`)) {
      return;
    }

    setIsProcessing(true);
    try {
      await financeService.markCommissionPaid(lead.id);
      alert('Commission marked as paid successfully.');
      await fetchAllData();
    } catch (err: any) {
      console.error('Failed to mark commission as paid:', err);
      alert(err?.response?.data?.message || 'Failed to mark commission as paid');
    } finally {
      setIsProcessing(false);
    }
  };

  // Show lead details
  const handleShowDetails = (lead: FinanceLead) => {
    setSelectedLead(lead);
    setShowDetailsModal(true);
  };

  // Format currency
  const formatCurrency = (amount: number | undefined) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: 'AED',
    }).format(amount);
  };

  // Format date
  const formatDate = (date: string | undefined) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Calculate profit
  const calculateProfit = (lead: FinanceLead) => {
    const selling = lead.selling_price || 0;
    const cost = lead.cost_price || 0;
    return selling - cost;
  };

  if (!hasRole('finance') && !hasRole('manager')) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertDescription>
            Unauthorized. Only finance users and managers can access this page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Loading finance data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Finance Approval</h1>
        <p className="text-muted-foreground mt-1">
          Review and approve converted leads to process commission payments
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.pending_approvals}</div>
              <p className="text-xs text-muted-foreground mt-1">Leads awaiting approval</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved Leads</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.approved_leads}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Total value: {formatCurrency(statistics.total_approved_value)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Commission</CardTitle>
              <DollarSign className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.pending_commission_payment}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Amount: {formatCurrency(statistics.total_pending_commission)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Commission Paid</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(statistics.total_commission_paid)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Total paid commissions</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search Bar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by lead name, customer, car model..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <TabsList>
          <TabsTrigger value="pending">
            Pending ({pendingLeads.length})
          </TabsTrigger>
          <TabsTrigger value="approved">
            Approved ({approvedLeads.length})
          </TabsTrigger>
          <TabsTrigger value="rejected">
            Rejected ({rejectedLeads.length})
          </TabsTrigger>
        </TabsList>

        {/* Pending Approvals Tab */}
        <TabsContent value="pending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pending Approvals</CardTitle>
              <CardDescription>
                Review and approve converted leads to process commission payments
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pendingLeads.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No pending approvals at the moment
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Lead Name</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Sales Person</TableHead>
                        <TableHead>Car Details</TableHead>
                        <TableHead>Selling Price</TableHead>
                        <TableHead>Cost Price</TableHead>
                        <TableHead>Profit</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingLeads.map((lead) => (
                        <TableRow key={lead.id}>
                          <TableCell className="font-medium">{lead.lead_name}</TableCell>
                          <TableCell>
                            {lead.customer?.full_name || 'N/A'}
                          </TableCell>
                          <TableCell>
                            {lead.assigned_user?.name || 'Unassigned'}
                          </TableCell>
                          <TableCell>
                            {lead.car_company} {lead.model} {lead.model_year}
                          </TableCell>
                          <TableCell>{formatCurrency(lead.selling_price)}</TableCell>
                          <TableCell>{formatCurrency(lead.cost_price)}</TableCell>
                          <TableCell>
                            <span className={calculateProfit(lead) > 0 ? 'text-green-600 font-semibold' : 'text-red-600'}>
                              {formatCurrency(calculateProfit(lead))}
                            </span>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {formatDate(lead.updated_at)}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleShowDetails(lead)}
                                variant="outline"
                              >
                                <FileText className="h-4 w-4 mr-1" />
                                Details
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleApproveLead(lead)}
                                disabled={isProcessing}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleOpenRejectModal(lead)}
                                disabled={isProcessing}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Approved Leads Tab */}
        <TabsContent value="approved" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Approved Leads</CardTitle>
              <CardDescription>
                Leads that have been approved and commissions calculated
              </CardDescription>
            </CardHeader>
            <CardContent>
              {approvedLeads.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No approved leads yet
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Lead Name</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Sales Person</TableHead>
                        <TableHead>Car Details</TableHead>
                        <TableHead>Profit</TableHead>
                        <TableHead>Approved By</TableHead>
                        <TableHead>Approved Date</TableHead>
                        <TableHead>Commission Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {approvedLeads.map((lead) => (
                        <TableRow key={lead.id}>
                          <TableCell className="font-medium">{lead.lead_name}</TableCell>
                          <TableCell>
                            {lead.customer?.full_name || 'N/A'}
                          </TableCell>
                          <TableCell>
                            {lead.assigned_user?.name || 'Unassigned'}
                          </TableCell>
                          <TableCell>
                            {lead.car_company} {lead.model} {lead.model_year}
                          </TableCell>
                          <TableCell>
                            <span className="text-green-600 font-semibold">
                              {formatCurrency(calculateProfit(lead))}
                            </span>
                          </TableCell>
                          <TableCell className="text-sm">
                            {lead.approved_by_user?.name || user?.name || 'Finance'}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {formatDate(lead.approved_at)}
                          </TableCell>
                          <TableCell>
                            {lead.commission_paid ? (
                              <Badge className="bg-green-600">Paid</Badge>
                            ) : (
                              <Badge variant="outline" className="border-yellow-600 text-yellow-600">
                                Pending
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleShowDetails(lead)}
                                variant="outline"
                              >
                                <FileText className="h-4 w-4 mr-1" />
                                Details
                              </Button>
                              {!lead.commission_paid && (
                                <Button
                                  size="sm"
                                  onClick={() => handleMarkCommissionPaid(lead)}
                                  disabled={isProcessing}
                                >
                                  <DollarSign className="h-4 w-4 mr-1" />
                                  Mark Paid
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Rejected Leads Tab */}
        <TabsContent value="rejected" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Rejected Leads</CardTitle>
              <CardDescription>
                Leads that have been rejected with reasons
              </CardDescription>
            </CardHeader>
            <CardContent>
              {rejectedLeads.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No rejected leads
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Lead Name</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Sales Person</TableHead>
                        <TableHead>Car Details</TableHead>
                        <TableHead>Rejected By</TableHead>
                        <TableHead>Rejected Date</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rejectedLeads.map((lead) => (
                        <TableRow key={lead.id}>
                          <TableCell className="font-medium">{lead.lead_name}</TableCell>
                          <TableCell>
                            {lead.customer?.full_name || 'N/A'}
                          </TableCell>
                          <TableCell>
                            {lead.assigned_user?.name || 'Unassigned'}
                          </TableCell>
                          <TableCell>
                            {lead.car_company} {lead.model} {lead.model_year}
                          </TableCell>
                          <TableCell className="text-sm">
                            {lead.approved_by_user?.name || user?.name || 'Finance'}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {formatDate(lead.approved_at)}
                          </TableCell>
                          <TableCell className="max-w-xs truncate text-sm">
                            {lead.rejection_reason || 'N/A'}
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              onClick={() => handleShowDetails(lead)}
                              variant="outline"
                            >
                              <FileText className="h-4 w-4 mr-1" />
                              Details
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Reject Modal */}
      <Dialog open={showRejectModal} onOpenChange={setShowRejectModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Lead</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this lead: {selectedLead?.lead_name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="rejection_reason">Rejection Reason *</Label>
              <Textarea
                id="rejection_reason"
                placeholder="Enter the reason for rejection..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowRejectModal(false);
                setSelectedLead(null);
                setRejectionReason('');
              }}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRejectLead}
              disabled={isProcessing || !rejectionReason.trim()}
            >
              {isProcessing ? 'Rejecting...' : 'Reject Lead'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Details Modal */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Lead Details</DialogTitle>
            <DialogDescription>
              Complete information for {selectedLead?.lead_name}
            </DialogDescription>
          </DialogHeader>
          {selectedLead && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Lead Name</Label>
                  <p className="font-medium">{selectedLead.lead_name}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <p className="font-medium capitalize">{selectedLead.status}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Customer</Label>
                  <p className="font-medium">{selectedLead.customer?.full_name || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Sales Person</Label>
                  <p className="font-medium">{selectedLead.assigned_user?.name || 'Unassigned'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Car Company</Label>
                  <p className="font-medium">{selectedLead.car_company}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Model</Label>
                  <p className="font-medium">{selectedLead.model}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Model Year</Label>
                  <p className="font-medium">{selectedLead.model_year}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Quantity</Label>
                  <p className="font-medium">{selectedLead.quantity || 1}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Selling Price</Label>
                  <p className="font-medium text-green-600">{formatCurrency(selectedLead.selling_price)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Cost Price</Label>
                  <p className="font-medium">{formatCurrency(selectedLead.cost_price)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Profit</Label>
                  <p className={`font-bold ${calculateProfit(selectedLead) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(calculateProfit(selectedLead))}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Priority</Label>
                  <Badge variant={selectedLead.priority === 'high' ? 'destructive' : 'outline'}>
                    {selectedLead.priority}
                  </Badge>
                </div>
                {selectedLead.finance_approved !== null && (
                  <>
                    <div>
                      <Label className="text-muted-foreground">Approval Status</Label>
                      <p className="font-medium">
                        {selectedLead.finance_approved ? (
                          <Badge className="bg-green-600">Approved</Badge>
                        ) : (
                          <Badge variant="destructive">Rejected</Badge>
                        )}
                      </p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Processed By</Label>
                      <p className="font-medium">{selectedLead.approved_by_user?.name || user?.name || 'Finance'}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Processed Date</Label>
                      <p className="font-medium">{formatDate(selectedLead.approved_at)}</p>
                    </div>
                    {selectedLead.finance_approved && (
                      <div>
                        <Label className="text-muted-foreground">Commission Status</Label>
                        <p className="font-medium">
                          {selectedLead.commission_paid ? (
                            <Badge className="bg-green-600">Paid</Badge>
                          ) : (
                            <Badge variant="outline" className="border-yellow-600 text-yellow-600">
                              Pending Payment
                            </Badge>
                          )}
                        </p>
                      </div>
                    )}
                    {selectedLead.rejection_reason && (
                      <div className="col-span-2">
                        <Label className="text-muted-foreground">Rejection Reason</Label>
                        <p className="font-medium text-red-600">{selectedLead.rejection_reason}</p>
                      </div>
                    )}
                  </>
                )}
              </div>
              {selectedLead.notes && (
                <div>
                  <Label className="text-muted-foreground">Notes</Label>
                  <p className="mt-1 text-sm">{selectedLead.notes}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowDetailsModal(false);
                setSelectedLead(null);
              }}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}