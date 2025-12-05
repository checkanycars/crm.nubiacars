import { createFileRoute, useSearch } from '@tanstack/react-router';
import { useState, useEffect, type DragEvent } from 'react';
import { Button } from '@/components/ui/button';

export const Route = createFileRoute('/dashboard/leads')({
  component: LeadsKanbanPage,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      action: search.action as string | undefined,
    };
  },
});

type LeadStatus = 'new' | 'converted' | 'not_converted';

interface Lead {
  id: number;
  leadName: string;
  contactName: string;
  email: string;
  phone: string;
  status: LeadStatus;
  source: string;
  carCompany: string;
  model: string;
  modelYear: number;
  kilometers: number;
  price: number;
  notes: string;
  createdAt: string;
  priority: 'high' | 'medium' | 'low';
}

// Mock leads data
const initialLeads: Lead[] = [
  {
    id: 1,
    leadName: 'Lead-2024-001',
    contactName: 'Sarah Miller',
    email: 'sarah.miller@example.com',
    phone: '+1 345-678-9012',
    status: 'new',
    source: 'Website',
    carCompany: 'Toyota',
    model: 'Camry',
    modelYear: 2023,
    kilometers: 15000,
    price: 28500,
    notes: 'Very interested, looking to buy within 2 weeks',
    createdAt: '2024-01-16',
    priority: 'high',
  },
  {
    id: 2,
    leadName: 'Lead-2024-002',
    contactName: 'Michael Davis',
    email: 'michael.davis@example.com',
    phone: '+1 345-678-9013',
    status: 'new',
    source: 'Referral',
    carCompany: 'Honda',
    model: 'Civic',
    modelYear: 2024,
    kilometers: 5000,
    price: 24900,
    notes: 'Trade-in required, following up next week',
    createdAt: '2024-01-15',
    priority: 'medium',
  },
  {
    id: 3,
    leadName: 'Lead-2024-003',
    contactName: 'Emily Wilson',
    email: 'emily.wilson@example.com',
    phone: '+1 345-678-9014',
    status: 'new',
    source: 'Walk-in',
    carCompany: 'Ford',
    model: 'F-150',
    modelYear: 2023,
    kilometers: 8000,
    price: 42000,
    notes: 'Just browsing, will contact in a few months',
    createdAt: '2024-01-12',
    priority: 'low',
  },
  {
    id: 4,
    leadName: 'Lead-2024-004',
    contactName: 'David Martinez',
    email: 'david.martinez@example.com',
    phone: '+1 345-678-9015',
    status: 'converted',
    source: 'Phone Call',
    carCompany: 'Tesla',
    model: 'Model 3',
    modelYear: 2024,
    kilometers: 1000,
    price: 45000,
    notes: 'Pre-approved financing, purchased yesterday!',
    createdAt: '2024-01-14',
    priority: 'high',
  },
  {
    id: 5,
    leadName: 'Lead-2024-005',
    contactName: 'Lisa Anderson',
    email: 'lisa.anderson@example.com',
    phone: '+1 345-678-9016',
    status: 'converted',
    source: 'Website',
    carCompany: 'Chevrolet',
    model: 'Silverado',
    modelYear: 2023,
    kilometers: 12000,
    price: 38500,
    notes: 'Completed sale last week',
    createdAt: '2024-01-10',
    priority: 'high',
  },
  {
    id: 6,
    leadName: 'Lead-2024-006',
    contactName: 'Robert Taylor',
    email: 'robert.taylor@example.com',
    phone: '+1 345-678-9017',
    status: 'not_converted',
    source: 'Walk-in',
    carCompany: 'BMW',
    model: 'X5',
    modelYear: 2023,
    kilometers: 20000,
    price: 55000,
    notes: 'Found better deal at competitor',
    createdAt: '2024-01-08',
    priority: 'medium',
  },
  {
    id: 7,
    leadName: 'Lead-2024-007',
    contactName: 'Jennifer White',
    email: 'jennifer.white@example.com',
    phone: '+1 345-678-9018',
    status: 'not_converted',
    source: 'Phone Call',
    carCompany: 'Mazda',
    model: 'CX-5',
    modelYear: 2022,
    kilometers: 25000,
    price: 30000,
    notes: 'Budget constraints, not ready to buy',
    createdAt: '2024-01-05',
    priority: 'low',
  },
];

function LeadsKanbanPage() {
  const searchParams = useSearch({ from: '/dashboard/leads' });
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [draggedLead, setDraggedLead] = useState<Lead | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

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
    carCompany: '',
    model: '',
    modelYear: new Date().getFullYear(),
    kilometers: 0,
    price: 0,
    source: 'Website',
    priority: 'medium' as 'high' | 'medium' | 'low',
    notes: '',
  });

  const columns: { id: LeadStatus; title: string; color: string; bgColor: string }[] = [
    { id: 'new', title: 'New Leads', color: 'text-blue-700', bgColor: 'bg-blue-50' },
    { id: 'converted', title: 'Converted', color: 'text-green-700', bgColor: 'bg-green-50' },
    { id: 'not_converted', title: 'Not Converted', color: 'text-red-700', bgColor: 'bg-red-50' },
  ];

  const getLeadsByStatus = (status: LeadStatus) => {
    return leads.filter(
      (lead) =>
        lead.status === status &&
        (searchTerm === '' ||
            lead.leadName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            lead.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            lead.phone.includes(searchTerm))
    );
  };

  const handleDragStart = (e: DragEvent<HTMLDivElement>, lead: Lead) => {
    setDraggedLead(lead);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>, newStatus: LeadStatus) => {
    e.preventDefault();
    if (draggedLead && draggedLead.status !== newStatus) {
      setLeads((prevLeads) =>
        prevLeads.map((lead) =>
          lead.id === draggedLead.id ? { ...lead, status: newStatus } : lead
        )
      );
    }
    setDraggedLead(null);
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
    const numericFields = ['modelYear', 'kilometers', 'price'];

    setFormData((prev) => ({
      ...prev,
      [name]: numericFields.includes(name)
            ? value === '' ? '' : Number(value)
            : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newLead: Lead = {
      id: Math.max(...leads.map(l => l.id), 0) + 1,
      ...formData,
      status: 'new',
      createdAt: new Date().toISOString().split('T')[0],
    };
    setLeads([newLead, ...leads]);
    setShowAddModal(false);
    // Reset form
    setFormData({
      leadName: '',
      contactName: '',
      email: '',
      phone: '',
      carCompany: '',
      model: '',
      modelYear: new Date().getFullYear(),
      kilometers: 0,
      price: 0,
      source: 'Website',
      priority: 'medium',
      notes: '',
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Leads Kanban Board</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your sales leads with drag and drop
            {import.meta.env.VITE_USE_MOCK_AUTH === 'true' && (
              <span className="ml-2 text-blue-600 font-medium">(Mock Data)</span>
            )}
          </p>
        </div>
        <Button
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
          onClick={() => setShowAddModal(true)}>
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Lead
        </Button>
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

      {/* Search Bar */}
      <div className="rounded-lg bg-white shadow-sm border border-gray-200 p-4">
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
                    className={`cursor-move rounded-lg bg-white border border-gray-200 p-4 shadow-sm hover:shadow-md transition-all ${
                      draggedLead?.id === lead.id ? 'opacity-50' : ''
                    }`}
                  >
                    {/* Priority Badge */}
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`h-2 w-2 rounded-full ${getPriorityColor(lead.priority)}`}></span>
                        <span className="text-xs text-gray-500 capitalize">{lead.priority} Priority</span>
                      </div>
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
                      <div className="flex items-center justify-between text-xs text-gray-600">
                        <span><span className="font-medium">KM:</span> {lead.kilometers.toLocaleString()}</span>
                        <span className="font-semibold text-green-600">AED {lead.price.toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Notes */}
                    {lead.notes && (
                      <p className="text-xs text-gray-500 italic line-clamp-2 mb-2">{lead.notes}</p>
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
                    <label htmlFor="carCompany" className="block text-sm font-medium text-gray-700 mb-1">
                      Car Company <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="carCompany"
                      name="carCompany"
                      value={formData.carCompany}
                      onChange={handleFormChange}
                      required
                      placeholder="e.g., Toyota, Honda, Ford"
                      className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-1">
                      Model <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="model"
                      name="model"
                      value={formData.model}
                      onChange={handleFormChange}
                      required
                      placeholder="e.g., Camry, Civic, F-150"
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
                <button
                  type="button"
                  className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
                >
                  Add Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
