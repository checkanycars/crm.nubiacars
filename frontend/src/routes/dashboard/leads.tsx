import { createFileRoute, useSearch } from '@tanstack/react-router';
import { useState, useEffect, type DragEvent } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '../../contexts/AuthContext';
import { leadsService, type Lead, type CreateLeadData, type UpdateLeadData } from '../../services/leadsService';
import { CarBrandSelect } from '@/components/ui/car-brand-select';
import { CarModelSelect } from '@/components/ui/car-model-select';

export const Route = createFileRoute('/dashboard/leads')({
  component: LeadsKanbanPage,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      action: search.action as string | undefined,
    };
  },
});

type LeadStatus = 'new' | 'converted' | 'not_converted';



function LeadsKanbanPage() {
  const { user, hasRole } = useAuth();
  const searchParams = useSearch({ from: '/dashboard/leads' });
  const [leads, setLeads] = useState<Lead[]>([]);
  const [salesUsers, setSalesUsers] = useState<Array<{ id: number; name: string; email: string }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [draggedLead, setDraggedLead] = useState<Lead | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [assignedFilter, setAssignedFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [pendingLeadMove, setPendingLeadMove] = useState<{ lead: Lead; newStatus: LeadStatus } | null>(null);
  const [notConvertedReason, setNotConvertedReason] = useState('');

  // Fetch leads from API
  const fetchLeads = async () => {
    try {
      setIsLoading(true);
      setError(null);
      // If user is sales, filter by their ID, otherwise show all
      const filters: any = { per_page: 1000 };
      if (hasRole('sales') && user?.id) {
        filters.assigned_to = user.id;
      }
      const response = await leadsService.getLeads(filters);
      setLeads(response.data);

      // Extract unique sales users from leads data
      const usersMap = new Map<number, { id: number; name: string; email: string }>();
      response.data.forEach(lead => {
        if (lead.assignedUser && !usersMap.has(lead.assignedUser.id)) {
          usersMap.set(lead.assignedUser.id, {
            id: lead.assignedUser.id,
            name: lead.assignedUser.name,
            email: lead.assignedUser.email,
          });
        }
      });

      // If no users found from leads, use default sales users
      if (usersMap.size === 0) {
        setSalesUsers([
          { id: 1, name: 'Sales 1', email: 'sales1@example.com' },
          { id: 2, name: 'Sales 2', email: 'sales2@example.com' },
        ]);
      } else {
        setSalesUsers(Array.from(usersMap.values()));
      }
    } catch (err: any) {
      console.error('Failed to fetch leads:', err);
      setError(err?.response?.data?.message || 'Failed to load leads');
      // Set default sales users on error
      setSalesUsers([
        { id: 1, name: 'Sales 1', email: 'sales1@example.com' },
        { id: 2, name: 'Sales 2', email: 'sales2@example.com' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch leads on mount
  useEffect(() => {
    fetchLeads();
  }, []);

  // Auto-open modal when navigated with action=add parameter
  useEffect(() => {
    if (searchParams.action === 'add') {
      setShowAddModal(true);
    }
  }, [searchParams.action]);
  const [formData, setFormData] = useState({
    leadName: '',
    contactName: '',
    email: '',
    phone: '',
    carBrandId: undefined as number | undefined,
    carBrand: '',
    carCompany: '',
    carModelId: undefined as number | undefined,
    model: '',
    trim: '',
    spec: '',
    modelYear: new Date().getFullYear(),
    kilometers: 0,
    price: 0,
    source: 'Website',
    priority: 'medium' as 'high' | 'medium' | 'low',
    notes: '',
    assignedTo: undefined,
  });

  const columns: { id: LeadStatus; title: string; color: string; bgColor: string }[] = [
    { id: 'new', title: 'New Leads', color: 'text-blue-700', bgColor: 'bg-blue-50' },
    { id: 'converted', title: 'Converted', color: 'text-green-700', bgColor: 'bg-green-50' },
    { id: 'not_converted', title: 'Not Converted', color: 'text-red-700', bgColor: 'bg-red-50' },
  ];

  const getSalesPersonName = (assignedTo: number | undefined, assignedUser?: Lead['assignedUser']) => {
    if (assignedUser) {
      return assignedUser.name;
    }
    if (!assignedTo) return 'Unassigned';
    const user = salesUsers.find(u => u.id === assignedTo);
    return user ? user.name : 'Unassigned';
  };

  const getLeadsByStatus = (status: LeadStatus) => {
    return leads.filter(
      (lead) =>
        lead.status === status &&
        (searchTerm === '' ||
            lead.leadName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            lead.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            lead.phone.includes(searchTerm)) &&
        (assignedFilter === 'all' ||
         (assignedFilter === '' && !lead.assignedTo) ||
         lead.assignedTo?.toString() === assignedFilter)
    );
  };

  const handleDragStart = (e: DragEvent<HTMLDivElement>, lead: Lead) => {
    if (isLoading) {
      e.preventDefault();
      return;
    }
    setDraggedLead(lead);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: DragEvent<HTMLDivElement>, newStatus: LeadStatus) => {
    e.preventDefault();
    if (draggedLead && draggedLead.status !== newStatus) {
      // If moving to not_converted, show reason modal
      if (newStatus === 'not_converted') {
        setPendingLeadMove({ lead: draggedLead, newStatus });
        setShowReasonModal(true);
      } else {
        // Otherwise, update status directly
        try {
          const updatedLead = await leadsService.updateLead(draggedLead.id, { status: newStatus });
          setLeads((prevLeads) =>
            prevLeads.map((lead) =>
              lead.id === draggedLead.id ? updatedLead : lead
            )
          );
        } catch (err: any) {
          console.error('Failed to update lead status:', err);
          alert(err?.response?.data?.message || 'Failed to update lead status');
        }
      }
    }
    setDraggedLead(null);
  };

  const handleReasonSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pendingLeadMove && notConvertedReason.trim()) {
      try {
        const updatedLead = await leadsService.updateLead(pendingLeadMove.lead.id, {
          status: pendingLeadMove.newStatus,
          notConvertedReason: notConvertedReason.trim(),
        });
        setLeads((prevLeads) =>
          prevLeads.map((lead) =>
            lead.id === pendingLeadMove.lead.id ? updatedLead : lead
          )
        );
        setShowReasonModal(false);
        setPendingLeadMove(null);
        setNotConvertedReason('');
      } catch (err: any) {
        console.error('Failed to update lead:', err);
        alert(err?.response?.data?.message || 'Failed to update lead');
      }
    }
  };

  const handleReasonCancel = () => {
    setShowReasonModal(false);
    setPendingLeadMove(null);
    setNotConvertedReason('');
  };

  const handleDragEnd = () => {
    setDraggedLead(null);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusCount = (status: LeadStatus) => {
    return leads.filter((lead) => lead.status === status).length;
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const numericFields = ['modelYear', 'kilometers', 'price', 'assignedTo'];

    setFormData((prev) => ({
      ...prev,
      [name]: numericFields.includes(name)
            ? value === '' ? undefined : Number(value)
            : value,
    }));
  };

  // Handle car brand selection
  const handleBrandChange = (brandId: number | string, brandName?: string) => {
    setFormData((prev) => ({
      ...prev,
      carBrandId: brandId ? Number(brandId) : undefined,
      carBrand: brandName || '',
      carCompany: brandName || '',
      carModelId: undefined,
      model: '',
    }));
  };

  // Handle car model selection
  const handleModelChange = (modelId: number | string, modelName?: string) => {
    setFormData((prev) => ({
      ...prev,
      carModelId: modelId ? Number(modelId) : undefined,
      model: modelName || '',
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Auto-assign to current user if they are sales and no assignment is made
      const assignedTo = formData.assignedTo || (hasRole('sales') && user?.id ? user.id : undefined);

      const createData: CreateLeadData = {
        leadName: formData.leadName,
        contactName: formData.contactName,
        email: formData.email,
        phone: formData.phone,
        source: formData.source,
        carCompany: formData.carBrand || formData.carCompany,
        model: formData.model,
        trim: formData.trim,
        spec: formData.spec,
        modelYear: formData.modelYear,
        kilometers: formData.kilometers,
        price: formData.price,
        priority: formData.priority,
        notes: formData.notes,
        assignedTo: assignedTo,
      };

      const newLead = await leadsService.createLead(createData);
      setLeads([newLead, ...leads]);
      setShowAddModal(false);
      // Reset form
      setFormData({
        leadName: '',
        contactName: '',
        email: '',
        phone: '',
        carBrandId: undefined,
        carBrand: '',
        carCompany: '',
        carModelId: undefined,
        model: '',
        trim: '',
        spec: '',
        modelYear: new Date().getFullYear(),
        kilometers: 0,
        price: 0,
        source: 'Website',
        priority: 'medium',
        notes: '',
        assignedTo: undefined,
      });
    } catch (err: any) {
      console.error('Failed to create lead:', err);
      alert(err?.response?.data?.message || 'Failed to create lead');
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <svg className="animate-spin h-12 w-12 text-blue-600 mx-auto" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <p className="mt-4 text-gray-600">Loading leads...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <svg className="h-12 w-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to Load Leads</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchLeads}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Leads Kanban Board</h1>
          <p className="mt-1 text-sm text-gray-500">
            {hasRole('manager') ? 'Manage your sales leads with drag and drop' : 'Your assigned leads'}
            {hasRole('sales') && (
              <span className="ml-2 text-purple-600 font-medium">(Showing only your leads)</span>
            )}
          </p>
        </div>
        {hasRole('manager') && (
          <Button
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
            onClick={() => setShowAddModal(true)}>
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Lead
          </Button>
        )}
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 sm:grid-cols-3">
        {columns.map((column) => (
          <div key={column.id} className={`rounded-lg ${column.bgColor} border border-gray-200 p-4`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${column.color}`}>{column.title}</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">{getStatusCount(column.id)}</p>
              </div>
              <div className={`rounded-full ${column.bgColor} p-3`}>
                {column.id === 'new' && <span className="text-2xl">📥</span>}
                {column.id === 'converted' && <span className="text-2xl">✅</span>}
                {column.id === 'not_converted' && <span className="text-2xl">❌</span>}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Search and Filter Bar */}
      <div className="rounded-lg bg-white shadow-sm border border-gray-200 p-4">
        <div className={`grid gap-4 ${hasRole('manager') ? 'sm:grid-cols-2' : 'sm:grid-cols-1'}`}>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search leads by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full rounded-lg border border-gray-300 py-2 pl-10 pr-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          {hasRole('manager') && (
            <div>
              <select
                value={assignedFilter}
                onChange={(e) => setAssignedFilter(e.target.value)}
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="all">All Sales People</option>
                {salesUsers.map(user => (
                  <option key={user.id} value={user.id.toString()}>{user.name}</option>
                ))}
                <option value="">Unassigned</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Kanban Board */}
      <div className="grid gap-6 lg:grid-cols-3">
        {columns.map((column) => (
          <div
            key={column.id}
            className="rounded-lg bg-gray-50 border-2 border-gray-200"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, column.id)}
          >
            {/* Column Header */}
            <div className={`border-b-2 border-gray-200 ${column.bgColor} px-4 py-3`}>
              <div className="flex items-center justify-between">
                <h3 className={`font-semibold ${column.color}`}>{column.title}</h3>
                <span className={`rounded-full ${column.bgColor} px-2.5 py-0.5 text-xs font-medium ${column.color}`}>
                  {getLeadsByStatus(column.id).length}
                </span>
              </div>
            </div>

            {/* Column Content */}
            <div className="min-h-[500px] p-4 space-y-3">
              {getLeadsByStatus(column.id).length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="rounded-full bg-gray-200 p-3 mb-3">
                    <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                      />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-500">No leads in this column</p>
                  <p className="text-xs text-gray-400 mt-1">Drag leads here to update status</p>
                </div>
              ) : (
                getLeadsByStatus(column.id).map((lead) => (
                  <div
                    key={lead.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, lead)}
                    onDragEnd={handleDragEnd}
                    className={`cursor-move rounded-lg bg-white border-2 p-4 shadow-sm hover:shadow-md transition-all ${
                      draggedLead?.id === lead.id ? 'opacity-50' : ''
                    } ${
                      lead.status === 'converted'
                        ? 'border-green-500'
                        : lead.status === 'not_converted'
                        ? 'border-red-500'
                        : 'border-gray-200'
                    }`}
                  >
                    {/* Priority Badge */}
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`h-2 w-2 rounded-full ${getPriorityColor(lead.priority)}`}></span>
                        <span className="text-xs text-gray-500 capitalize">{lead.priority} Priority</span>
                      </div>
                      {hasRole('manager') && (
                        <button className="text-gray-400 hover:text-gray-600">
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                            />
                          </svg>
                        </button>
                      )}
                    </div>

                    {/* Assigned To Badge */}
                    <div className="mb-2">
                      <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-2.5 py-1 text-xs font-medium text-purple-800 border border-purple-200">
                        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        {getSalesPersonName(lead.assignedTo, lead.assignedUser)}
                      </span>
                    </div>

                    {/* Lead & Contact Name */}
                    <div className="mb-2">
                      <h4 className="font-semibold text-gray-900">{lead.contactName}</h4>
                      <p className="text-xs text-gray-500">{lead.leadName}</p>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-1 mb-3">
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                          />
                        </svg>
                        <span className="truncate">{lead.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                          />
                        </svg>
                        <span>{lead.phone}</span>
                      </div>
                    </div>

                    {/* Vehicle Details */}
                    <div className="mb-2 space-y-1">
                      <div className="inline-flex items-center gap-1 rounded bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                        <svg
                          className="h-3 w-3"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          viewBox="0 0 24 24"
                        >
                          <path d="M3 13l1.5-4.5A2 2 0 0 1 6.4 7h11.2a2 2 0 0 1 1.9 1.5L21 13" />
                          <path d="M3 13h18v5a1 1 0 0 1-1 1h-1a2 2 0 0 1-2-2v-1H7v1a2 2 0 0 1-2 2H4a1 1 0 0 1-1-1v-5z" />
                          <circle cx="7.5" cy="16.5" r="1.5" />
                          <circle cx="16.5" cy="16.5" r="1.5" />
                        </svg>

                        {lead.carCompany} {lead.model} ({lead.modelYear})
                      </div>
                      {(lead.trim || lead.spec) && (
                        <div className="flex flex-wrap gap-1 text-xs mt-1">
                          {lead.trim && (
                            <span className="inline-flex items-center rounded bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-800">
                              Trim: {lead.trim}
                            </span>
                          )}
                          {lead.spec && (
                            <span className="inline-flex items-center rounded bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800">
                              Spec: {lead.spec}
                            </span>
                          )}
                        </div>
                      )}
                      <div className="flex items-center justify-between text-xs text-gray-600">
                        <span><span className="font-medium">KM:</span> {lead.kilometers.toLocaleString()}</span>
                        <span className="font-semibold text-green-600">AED {lead.price.toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Notes */}
                    {lead.notes && (
                      <p className="text-xs text-gray-500 italic line-clamp-2 mb-2">{lead.notes}</p>
                    )}

                    {/* Not Converted Reason */}
                    {lead.notConvertedReason && lead.status === 'not_converted' && (
                      <div className="mb-2 p-2 bg-red-50 border border-red-200 rounded">
                        <p className="text-xs font-medium text-red-800 mb-1">Reason for not converting:</p>
                        <p className="text-xs text-red-700">{lead.notConvertedReason}</p>
                      </div>
                    )}

                    {/* Source & Date */}
                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                      <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                        <span className="font-medium">Source:</span> {lead.source}
                      </span>
                      <span className="text-xs text-gray-400">{lead.createdAt}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add Lead Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">Add New Lead</h3>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setShowAddModal(false)}
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </Button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Lead Information Section */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Lead Information
                </h4>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="leadName" className="block text-sm font-medium text-gray-700 mb-1">
                      Lead Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="leadName"
                      name="leadName"
                      value={formData.leadName}
                      onChange={handleFormChange}
                      required
                      placeholder="e.g., Lead-2024-008"
                      className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="contactName" className="block text-sm font-medium text-gray-700 mb-1">
                      Contact Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="contactName"
                      name="contactName"
                      value={formData.contactName}
                      onChange={handleFormChange}
                      required
                      placeholder="e.g., John Doe"
                      className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Contact Channels Section */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Contact Channels
                </h4>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleFormChange}
                      required
                      placeholder="john.doe@example.com"
                      className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleFormChange}
                      required
                      placeholder="+1 234-567-8900"
                      className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Vehicle Details Section */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                  </svg>
                  Vehicle Details
                </h4>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="carBrandId" className="block text-sm font-medium text-gray-700 mb-1">
                      Car Brand <span className="text-red-500">*</span>
                    </label>
                    <CarBrandSelect
                      id="carBrandId"
                      name="carBrandId"
                      value={formData.carBrandId}
                      onChange={handleBrandChange}
                      placeholder="Search and select car brand..."
                      required
                      className="w-full"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Type to search (e.g., "toy" for Toyota)
                    </p>
                  </div>
                  <div>
                    <label htmlFor="carModelId" className="block text-sm font-medium text-gray-700 mb-1">
                      Model <span className="text-red-500">*</span>
                    </label>
                    <CarModelSelect
                      id="carModelId"
                      name="carModelId"
                      value={formData.carModelId}
                      brandId={formData.carBrandId}
                      onChange={handleModelChange}
                      placeholder="Search and select car model..."
                      required
                      className="w-full"
                    />
                    {!formData.carBrandId ? (
                      <p className="mt-1 text-xs text-gray-500">
                        Please select a brand first
                      </p>
                    ) : (
                      <p className="mt-1 text-xs text-gray-500">
                        Models from {formData.carBrand} only
                      </p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="trim" className="block text-sm font-medium text-gray-700 mb-1">
                      Trim
                    </label>
                    <input
                      type="text"
                      id="trim"
                      name="trim"
                      value={formData.trim}
                      onChange={handleFormChange}
                      placeholder="e.g., Sport, Limited, Premium"
                      className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="spec" className="block text-sm font-medium text-gray-700 mb-1">
                      Spec
                    </label>
                    <input
                      type="text"
                      id="spec"
                      name="spec"
                      value={formData.spec}
                      onChange={handleFormChange}
                      placeholder="e.g., GCC, American, European"
                      className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="modelYear" className="block text-sm font-medium text-gray-700 mb-1">
                      Model Year <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      id="modelYear"
                      name="modelYear"
                      value={formData.modelYear}
                      onChange={handleFormChange}
                      required
                      min="1900"
                      max={new Date().getFullYear() + 1}
                      className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="kilometers" className="block text-sm font-medium text-gray-700 mb-1">
                      Kilometers <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      id="kilometers"
                      name="kilometers"
                      value={formData.kilometers}
                      onChange={handleFormChange}
                      required
                      min="0"
                      placeholder="e.g., 15000"
                      className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                      Price ($) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      id="price"
                      name="price"
                      value={formData.price}
                      onChange={handleFormChange}
                      required
                      min="0"
                      step="100"
                      placeholder="e.g., 25000"
                      className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Additional Details Section */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Additional Details
                </h4>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="source" className="block text-sm font-medium text-gray-700 mb-1">
                      Source <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="source"
                      name="source"
                      value={formData.source}
                      onChange={handleFormChange}
                      required
                      className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="Website">Website</option>
                      <option value="Phone Call">Phone Call</option>
                      <option value="Walk-in">Walk-in</option>
                      <option value="Referral">Referral</option>
                      <option value="Email">Email</option>
                      <option value="Social Media">Social Media</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
                      Priority <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="priority"
                      name="priority"
                      value={formData.priority}
                      onChange={handleFormChange}
                      required
                      className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="assignedTo" className="block text-sm font-medium text-gray-700 mb-1">
                      Assign To <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="assignedTo"
                      name="assignedTo"
                      value={formData.assignedTo}
                      onChange={handleFormChange}
                      required
                      className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="">Select sales person...</option>
                      {salesUsers.map(user => (
                        <option key={user.id} value={user.id}>{user.name} ({user.email})</option>
                      ))}
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                      Notes
                    </label>
                    <textarea
                      id="notes"
                      name="notes"
                      value={formData.notes}
                      onChange={handleFormChange}
                      rows={3}
                      placeholder="Add any additional notes or comments..."
                      className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <Button
                  type="button"
                  className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
                >
                  Add Lead
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Not Converted Reason Modal */}
      {showReasonModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="bg-red-50 border-b border-red-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">Lead Not Converted</h3>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={handleReasonCancel}
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </Button>
              </div>
            </div>

            <form onSubmit={handleReasonSubmit} className="p-6 space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-4">
                  Please provide a reason why this lead was not converted:
                </p>
                <label htmlFor="notConvertedReason" className="block text-sm font-medium text-gray-700 mb-2">
                  Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="notConvertedReason"
                  value={notConvertedReason}
                  onChange={(e) => setNotConvertedReason(e.target.value)}
                  required
                  rows={4}
                  placeholder="e.g., Found better deal at competitor, Budget constraints, Changed mind, etc."
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                  autoFocus
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  className="rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300 transition-colors"
                  onClick={handleReasonCancel}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors"
                  disabled={!notConvertedReason.trim()}
                >
                  Submit Reason
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
