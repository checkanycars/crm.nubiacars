import { createFileRoute, useSearch } from '@tanstack/react-router';
import { useState, useEffect, type DragEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { useAuth } from '../../contexts/AuthContext';
import { leadsService, type Lead, type CreateLeadData, type UpdateLeadData } from '../../services/leadsService';
import { CarBrandSelect } from '@/components/ui/car-brand-select';
import { CarModelSelect } from '@/components/ui/car-model-select';
import { ExportCountrySelect } from '@/components/ui/export-country-select';
import { CustomerSelect } from '@/components/ui/customer-select';
import { LeadTimer } from '@/components/ui/lead-timer';
import { carBrandsService } from '../../services/carBrandsService';
import { carModelsService } from '../../services/carModelsService';
import { customersService, type CreateCustomerData } from '../../services/customersService';
import { usersService } from '../../services/usersService';
import { LayoutGrid, List, Edit, MoreVertical } from 'lucide-react';

export const Route = createFileRoute('/dashboard/leads')({
  component: LeadsKanbanPage,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      action: search.action as string | undefined,
      assigned_to: search.assigned_to as number | undefined,
    };
  },
});

type LeadStatus = 'new' | 'contacted' | 'converted' | 'not_converted';



function LeadsKanbanPage() {
  const { user, hasRole } = useAuth();
  const searchParams = useSearch({ from: '/dashboard/leads' });
  const [leads, setLeads] = useState<Lead[]>([]);
  const [salesUsers, setSalesUsers] = useState<Array<{ id: number; name: string; email: string; role?: string }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [draggedLead, setDraggedLead] = useState<Lead | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [assignedFilter, setAssignedFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [pendingLeadMove, setPendingLeadMove] = useState<{ lead: Lead; newStatus: LeadStatus } | null>(null);
  const [notConvertedReason, setNotConvertedReason] = useState('');
  const [leadCategory, setLeadCategory] = useState<string>('');
  const [conversionSellingPrice, setConversionSellingPrice] = useState<number>(0);
  const [conversionCostPrice, setConversionCostPrice] = useState<number>(0);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');

  // Fetch assignable users (sales and managers) from API
  const fetchSalesUsers = async () => {
    try {
      const response = await usersService.getAssignableList();
      const usersList = response.users.map((user: any) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      }));
      setSalesUsers(usersList);
    } catch (err: any) {
      console.error('Failed to fetch assignable users:', err);
      // Set default users on error
      setSalesUsers([
        { id: 1, name: 'Sales 1', email: 'sales1@example.com' },
        { id: 2, name: 'Sales 2', email: 'sales2@example.com' },
      ]);
    }
  };

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
      // If assigned_to is provided in search params (from widget), use it
      if (searchParams.assigned_to) {
        filters.assigned_to = searchParams.assigned_to;
        setAssignedFilter(String(searchParams.assigned_to));
      }
      const response = await leadsService.getLeads(filters);
      setLeads(response.data);
    } catch (err: any) {
      console.error('Failed to fetch leads:', err);
      setError(err?.response?.data?.message || 'Failed to load leads');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch sales users and leads on mount
  useEffect(() => {
    fetchSalesUsers();
    fetchLeads();
  }, [searchParams.assigned_to]);

  // Auto-open modal when navigated with action=add parameter
  useEffect(() => {
    if (searchParams.action === 'add') {
      setShowAddModal(true);
    }
  }, [searchParams.action]);
  const [formData, setFormData] = useState({
    leadName: '',
    contactName: '',
    customerId: undefined as number | undefined,
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
    interiorColour: '',
    exteriorColour: '',
    gearBox: '',
    carType: 'new' as 'new' | 'used',
    fuelTank: '',
    steeringSide: 'Left',
    exportTo: '',
    exportToCountry: '',
    exportCountryId: undefined as number | undefined,
    quantity: 1,
    sellingPrice: 0,
    costPrice: 0,
    source: 'Website',
    priority: 'medium' as 'high' | 'medium' | 'low',
    category: '' as string,
    notes: '',
    assignedTo: undefined as number | undefined,
  });

  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [customerFormData, setCustomerFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    status: 'lead' as 'active' | 'inactive' | 'lead',
    notes: '',
    documents: [] as File[],
  });

  const columns: { id: LeadStatus; title: string; color: string; bgColor: string }[] = [
    { id: 'new', title: 'Leads', color: 'text-blue-700', bgColor: 'bg-blue-50' },
    { id: 'contacted', title: 'Contacted', color: 'text-purple-700', bgColor: 'bg-purple-50' },
    { id: 'converted', title: 'Converted', color: 'text-green-700', bgColor: 'bg-green-50' },
    { id: 'not_converted', title: 'Not Converted', color: 'text-red-700', bgColor: 'bg-red-50' },
  ];

  const getSalesPersonName = (assignedTo: number | undefined, assignedUser?: Lead['assignedUser']) => {
    if (assignedUser) {
      const role = assignedUser.role ? ` (${assignedUser.role.charAt(0).toUpperCase() + assignedUser.role.slice(1)})` : '';
      return assignedUser.name + role;
    }
    if (!assignedTo) return 'Unassigned';
    const user = salesUsers.find(u => u.id === assignedTo);
    if (user) {
      const role = user.role ? ` (${user.role.charAt(0).toUpperCase() + user.role.slice(1)})` : '';
      return user.name + role;
    }
    return 'Unassigned';
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
      } else if (newStatus === 'converted') {
        // If moving to converted, show category modal
        setPendingLeadMove({ lead: draggedLead, newStatus });
        setLeadCategory(draggedLead.category || '');
        setConversionSellingPrice(draggedLead.sellingPrice || 0);
        setConversionCostPrice(draggedLead.costPrice || 0);
        setShowCategoryModal(true);
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

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pendingLeadMove && leadCategory) {
      try {
        const updatedLead = await leadsService.updateLead(pendingLeadMove.lead.id, {
          status: pendingLeadMove.newStatus,
          category: leadCategory as any,
          sellingPrice: conversionSellingPrice || undefined,
          costPrice: conversionCostPrice || undefined,
        });
        setLeads((prevLeads) =>
          prevLeads.map((lead) =>
            lead.id === pendingLeadMove.lead.id ? updatedLead : lead
          )
        );
        setShowCategoryModal(false);
        setPendingLeadMove(null);
        setLeadCategory('');
        setConversionSellingPrice(0);
        setConversionCostPrice(0);
      } catch (err: any) {
        console.error('Failed to update lead:', err);
        alert(err?.response?.data?.message || 'Failed to update lead');
      }
    }
  };

  const handleCategoryCancel = () => {
    setShowCategoryModal(false);
    setPendingLeadMove(null);
    setLeadCategory('');
    setConversionSellingPrice(0);
    setConversionCostPrice(0);
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
    const numericFields = ['modelYear', 'quantity', 'price', 'assignedTo'];

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

  // Handle export country selection
  const handleCountryChange = (countryId: number | string, countryName?: string) => {
    setFormData((prev) => ({
      ...prev,
      exportCountryId: countryId ? Number(countryId) : undefined,
      exportToCountry: countryName || '',
    }));
  };

  // Handle customer selection
  const handleCustomerChange = async (customerId: number | string, customerName?: string) => {
    // Find the customer to get their details
    if (customerId && typeof customerId === 'number') {
      try {
        const customer = await customersService.getCustomer(customerId);
        setFormData((prev) => ({
          ...prev,
          customerId: customerId,
          contactName: customer.fullName,
          email: customer.email || prev.email,
          phone: customer.phone || prev.phone,
        }));
      } catch (error) {
        console.error('Failed to fetch customer details:', error);
        setFormData((prev) => ({
          ...prev,
          customerId: customerId as number,
          contactName: customerName || '',
        }));
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        customerId: undefined,
        contactName: customerName || '',
      }));
    }
  };

  // Handle opening the Add Customer modal
  const handleOpenAddCustomer = () => {
    setShowAddCustomerModal(true);
  };

  // Handle customer form change
  const handleCustomerFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCustomerFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCustomerDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setCustomerFormData(prev => ({
        ...prev,
        documents: [...prev.documents, ...Array.from(files)],
      }));
    }
  };

  const removeCustomerDocument = (index: number) => {
    setCustomerFormData(prev => ({
      ...prev,
      documents: prev.documents.filter((_, i) => i !== index),
    }));
  };

  // Handle customer creation
  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const customerData: CreateCustomerData = {
        fullName: customerFormData.fullName,
        email: customerFormData.email,
        phone: customerFormData.phone,
        status: customerFormData.status,
        notes: customerFormData.notes,
      };

      const newCustomer = await customersService.createCustomer(
        customerData,
        customerFormData.documents.length > 0 ? customerFormData.documents : undefined
      );

      // Auto-select the newly created customer
      setFormData((prev) => ({
        ...prev,
        customerId: newCustomer.id,
        contactName: newCustomer.fullName,
        email: newCustomer.email,
        phone: newCustomer.phone,
      }));

      // Reset and close modal
      setCustomerFormData({
        fullName: '',
        email: '',
        phone: '',
        status: 'lead',
        notes: '',
        documents: [],
      });
      setShowAddCustomerModal(false);

      alert('Customer created successfully!');
    } catch (err: any) {
      console.error('Failed to create customer:', err);
      alert(err?.response?.data?.message || 'Failed to create customer');
    }
  };

  // Handle edit lead
  const handleEditLead = async (lead: Lead) => {
    setEditingLead(lead);

    // Try to look up brand and model IDs from the database
    let brandId: number | undefined = undefined;
    let brandName = '';
    let companyName = '';
    let modelId: number | undefined = undefined;
    let modelName = '';
    let countryId: number | undefined = undefined;
    let customerId: number | undefined = undefined;

    try {
      // Look up brand by name
      if (lead.carCompany) {
        const brands = await carBrandsService.searchBrands(lead.carCompany, 10);
        const matchingBrand = brands.find(
          b => b.name.toLowerCase() === lead.carCompany.toLowerCase()
        );
        if (matchingBrand) {
          brandId = matchingBrand.id;
          brandName = matchingBrand.name;
          companyName = matchingBrand.name;

          // Look up model by name (filtered by brand)
          if (lead.model) {
            const models = await carModelsService.searchModels(lead.model, matchingBrand.id, 10);
            const matchingModel = models.find(
              m => m.model_name.toLowerCase() === lead.model.toLowerCase()
            );
            if (matchingModel) {
              modelId = matchingModel.id;
              modelName = matchingModel.model_name;
            }
          }
        }
      }

      // Look up export country by name
      if (lead.exportToCountry) {
        const { exportCountriesService } = await import('../../services/exportCountriesService');
        const countries = await exportCountriesService.searchCountries(lead.exportToCountry, 10);
        const matchingCountry = countries.find(
          c => c.name.toLowerCase() === (lead.exportToCountry || '').toLowerCase()
        );
        if (matchingCountry) {
          countryId = matchingCountry.id;
        }
      }

      // Look up customer by name
      if (lead.contactName) {
        const customers = await customersService.searchCustomers(lead.contactName, 10);
        const matchingCustomer = customers.find(
          c => c.fullName.toLowerCase() === lead.contactName.toLowerCase()
        );
        if (matchingCustomer) {
          customerId = matchingCustomer.id;
        }
      }
    } catch (error) {
      console.warn('Failed to look up brand/model/country/customer IDs:', error);
      // Continue with undefined IDs if lookup fails
    }

    setFormData({
      leadName: lead.leadName,
      contactName: lead.contactName,
      customerId: customerId,
      email: lead.email,
      phone: lead.phone,
      carBrandId: brandId,
      carBrand: brandName || lead.carCompany,
      carCompany: companyName || lead.carCompany,
      carModelId: modelId,
      model: modelName || lead.model,
      trim: lead.trim || '',
      spec: lead.spec || '',
      modelYear: lead.modelYear,
      interiorColour: lead.interiorColour || '',
      exteriorColour: lead.exteriorColour || '',
      gearBox: lead.gearBox || '',
      carType: lead.carType || 'new',
      fuelTank: lead.fuelTank || '',
      steeringSide: lead.steeringSide || 'Left',
      exportTo: lead.exportTo || '',
      exportToCountry: lead.exportToCountry || '',
      exportCountryId: countryId,
      quantity: lead.quantity || 1,
      sellingPrice: lead.sellingPrice || 0,
      costPrice: lead.costPrice || 0,
      source: lead.source,
      priority: lead.priority,
      category: lead.category || '',
      notes: lead.notes || '',
      assignedTo: lead.assignedTo,
    });
    setShowEditModal(true);
    setOpenDropdownId(null);
  };

  // Handle update lead
  const handleUpdateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLead) return;

    try {
      const updateData: UpdateLeadData = {
        leadName: formData.leadName,
        customerId: formData.customerId,
        source: formData.source,
        carCompany: formData.carBrand || formData.carCompany,
        model: formData.model,
        trim: formData.trim,
        spec: formData.spec,
        modelYear: formData.modelYear,
        interiorColour: formData.interiorColour,
        exteriorColour: formData.exteriorColour,
        gearBox: formData.gearBox,
        carType: formData.carType,
        fuelTank: formData.fuelTank,
        steeringSide: formData.steeringSide,
        exportTo: formData.exportTo,
        exportToCountry: formData.exportToCountry,
        quantity: formData.quantity,
        sellingPrice: formData.sellingPrice,
        costPrice: formData.costPrice,
        priority: formData.priority,
        category: (formData.category as any) || undefined,
        notes: formData.notes,
        assignedTo: formData.assignedTo,
      };

      const updatedLead = await leadsService.updateLead(editingLead.id, updateData);
      setLeads((prevLeads) =>
        prevLeads.map((lead) => (lead.id === editingLead.id ? updatedLead : lead))
      );
      setShowEditModal(false);
      setEditingLead(null);

      // Reset form
      setFormData({
        leadName: '',
        contactName: '',
        customerId: undefined,
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
        interiorColour: '',
        exteriorColour: '',
        gearBox: '',
        carType: 'new' as 'new' | 'used',
        fuelTank: '',
        steeringSide: 'Left',
        exportTo: '',
        exportToCountry: '',
        exportCountryId: undefined,
        quantity: 1,
        sellingPrice: 0,
        costPrice: 0,
        source: 'Website',
        priority: 'medium' as 'high' | 'medium' | 'low',
        category: '',
        notes: '',
        assignedTo: undefined,
      });
    } catch (err: any) {
      console.error('Failed to update lead:', err);
      alert(err?.response?.data?.message || 'Failed to update lead');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Auto-assign to current user if they are sales and no assignment is made
      const assignedTo = formData.assignedTo || (hasRole('sales') && user?.id ? user.id : undefined);

      const createData: CreateLeadData = {
        leadName: formData.leadName,
        customerId: formData.customerId!,
        source: formData.source,
        carCompany: formData.carBrand || formData.carCompany,
        model: formData.model,
        trim: formData.trim,
        spec: formData.spec,
        modelYear: formData.modelYear,
        interiorColour: formData.interiorColour,
        exteriorColour: formData.exteriorColour,
        gearBox: formData.gearBox,
        carType: formData.carType,
        fuelTank: formData.fuelTank,
        steeringSide: formData.steeringSide,
        exportTo: formData.exportTo,
        exportToCountry: formData.exportToCountry,
        quantity: formData.quantity,
        sellingPrice: formData.sellingPrice,
        costPrice: formData.costPrice,
        priority: formData.priority,
        category: (formData.category as any) || undefined,
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
        customerId: undefined,
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
        interiorColour: '',
        exteriorColour: '',
        gearBox: '',
        carType: 'new',
        fuelTank: '',
        steeringSide: 'Left',
        exportTo: '',
        exportToCountry: '',
        exportCountryId: undefined,
        quantity: 1,
        sellingPrice: 0,
        costPrice: 0,
        source: 'Website',
        priority: 'medium',
        category: '',
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
          <h1 className="text-3xl font-bold text-gray-900">Leads Management</h1>
          <p className="mt-1 text-sm text-gray-500">
            {hasRole('manager') ? 'Manage your sales leads' : 'Your assigned leads'}
            {hasRole('sales') && (
              <span className="ml-2 text-purple-600 font-medium">(Showing only your leads)</span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* View Mode Toggle */}
          <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'kanban' | 'list')} className="w-auto">
            <TabsList>
              <TabsTrigger value="kanban" className="flex items-center gap-2">
                <LayoutGrid className="h-4 w-4" />
                Kanban
              </TabsTrigger>
              <TabsTrigger value="list" className="flex items-center gap-2">
                <List className="h-4 w-4" />
                List
              </TabsTrigger>
            </TabsList>
          </Tabs>
          
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
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {columns.map((column) => (
          <div key={column.id} className={`rounded-lg ${column.bgColor} border border-gray-200 p-4`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${column.color}`}>{column.title}</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">{getStatusCount(column.id)}</p>
              </div>
              <div className={`rounded-full ${column.bgColor} p-3`}>
                {column.id === 'new' && <span className="text-2xl">📥</span>}
                {column.id === 'contacted' && <span className="text-2xl">📞</span>}
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
                <option value="all">All Users</option>
                {salesUsers.map(user => (
                  <option key={user.id} value={user.id.toString()}>
                    {user.name} {user.role ? `(${user.role.charAt(0).toUpperCase() + user.role.slice(1)})` : ''}
                  </option>
                ))}
                <option value="">Unassigned</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Kanban Board */}
      {viewMode === 'kanban' && (
        <div className="grid gap-6 lg:grid-cols-4">
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
            <div className="min-h-[500px] max-h-[700px] overflow-y-auto p-4 space-y-3">
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
                    className={`cursor-move rounded-lg bg-white border-2 p-4 shadow-sm hover:shadow-md transition-all`}
                  >
                    {/* Priority Badge */}
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`h-2 w-2 rounded-full ${getPriorityColor(lead.priority)}`}></span>
                        <span className="text-xs text-gray-500 capitalize">{lead.priority} Priority</span>
                      </div>
                      {hasRole('manager') && (
                        <div className="relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenDropdownId(openDropdownId === lead.id ? null : lead.id);
                            }}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                              />
                            </svg>
                          </button>

                          {/* Dropdown Menu */}
                          {openDropdownId === lead.id && (
                            <>
                              {/* Backdrop to close dropdown */}
                              <div
                                className="fixed inset-0 z-10"
                                onClick={() => setOpenDropdownId(null)}
                              />

                              {/* Dropdown Content */}
                              <div className="absolute right-0 top-6 z-20 w-48 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5">
                                <div className="py-1" role="menu">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleEditLead(lead);
                                    }}
                                    className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    role="menuitem"
                                  >
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                    Edit Lead
                                  </button>
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Lead Timer - Shows time elapsed since creation */}
                    {lead.status === 'new' && (
                      <div className="mb-3">
                        <LeadTimer
                          createdAt={lead.createdAt}
                          priority={lead.priority}
                        />
                      </div>
                    )}

                    {/* Assigned To Badge */}
                    <div className="mb-2">
                      <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-2.5 py-1 text-xs font-medium text-purple-800 border border-purple-200">
                        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        {getSalesPersonName(lead.assignedTo, lead.assignedUser)}
                      </span>
                    </div>

                          {/* Vehicle Details - Simplified Display */}
                          <div className="mb-2 space-y-2">
                      {/* Car Name */}
                      <div className="inline-flex items-center gap-1 rounded bg-blue-100 px-2 py-1 text-lg font-medium text-blue-800">
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

                      {/* Quantity */}
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <span className="font-medium">Quantity:</span>
                        <span>{lead.quantity || 1}</span>
                      </div>

                      {/* Export To */}
                      {lead.exportTo && (
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <span className="font-medium">Export To:</span>
                          <span className="inline-flex items-center rounded bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-800">
                            {lead.exportTo}
                            {lead.exportTo === 'Outside GCC' && lead.exportToCountry && ` - ${lead.exportToCountry}`}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Contact Info - Simplified Display */}
                    <div className="mb-2">
                      <div className="flex items-center gap-2 text-xs text-gray-600 mb-1">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                        <span className="font-medium text-gray-900">{lead.contactName}</span>
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
                      <span className="text-xs text-gray-400">
                        {new Date(lead.createdAt).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Lead Info</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Vehicle</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead>
                  <div className="flex items-center gap-2">
                    Last Updated
                    <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </TableHead>
                {hasRole('manager') && <TableHead className="text-right">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {leads
                .filter(
                  (lead) =>
                    (searchTerm === '' ||
                      lead.leadName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      lead.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      lead.phone.includes(searchTerm)) &&
                    (assignedFilter === 'all' ||
                      (assignedFilter === '' && !lead.assignedTo) ||
                      lead.assignedTo?.toString() === assignedFilter)
                )
                .sort((a, b) => {
                  // Sort by updatedAt (most recent first)
                  const dateA = new Date(a.updatedAt || a.createdAt).getTime();
                  const dateB = new Date(b.updatedAt || b.createdAt).getTime();
                  return dateB - dateA;
                })
                .map((lead) => (
                  <TableRow key={lead.id}>
                    {/* Lead Info */}
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <span className="font-medium text-gray-900">{lead.leadName}</span>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span>Source: {lead.source}</span>
                          {lead.quantity && lead.quantity > 1 && (
                            <span className="inline-flex items-center rounded bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
                              Qty: {lead.quantity}
                            </span>
                          )}
                        </div>
                      </div>
                    </TableCell>

                    {/* Contact */}
                    <TableCell>
                      <div className="flex flex-col gap-1 text-sm">
                        <span className="font-medium text-gray-900">{lead.contactName}</span>
                        <span className="text-gray-600">{lead.phone}</span>
                        <span className="text-gray-500 text-xs">{lead.email}</span>
                      </div>
                    </TableCell>

                    {/* Vehicle */}
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <span className="font-medium text-gray-900">
                          {lead.carCompany} {lead.model}
                        </span>
                        <span className="text-sm text-gray-600">Year: {lead.modelYear}</span>
                        {lead.exportTo && (
                          <span className="inline-flex w-fit items-center rounded bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-800">
                            {lead.exportTo}
                            {lead.exportTo === 'Outside GCC' && lead.exportToCountry && ` - ${lead.exportToCountry}`}
                          </span>
                        )}
                      </div>
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <span
                          className={`inline-flex w-fit items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                            lead.status === 'new'
                              ? 'bg-blue-100 text-blue-800'
                              : lead.status === 'contacted'
                              ? 'bg-purple-100 text-purple-800'
                              : lead.status === 'converted'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {lead.status === 'new'
                            ? 'New'
                            : lead.status === 'contacted'
                            ? 'Contacted'
                            : lead.status === 'converted'
                            ? 'Converted'
                            : 'Not Converted'}
                        </span>
                        {lead.status === 'new' && (
                          <div className="mt-1">
                            <LeadTimer createdAt={lead.createdAt} priority={lead.priority} compact />
                          </div>
                        )}
                        {lead.notConvertedReason && lead.status === 'not_converted' && (
                          <span className="text-xs text-red-600 mt-1">{lead.notConvertedReason}</span>
                        )}
                      </div>
                    </TableCell>

                    {/* Priority */}
                    <TableCell>
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                          lead.priority === 'high'
                            ? 'bg-red-100 text-red-800'
                            : lead.priority === 'medium'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        <span className={`h-2 w-2 rounded-full ${getPriorityColor(lead.priority)}`}></span>
                        {lead.priority.charAt(0).toUpperCase() + lead.priority.slice(1)}
                      </span>
                    </TableCell>

                    {/* Assigned To */}
                    <TableCell>
                      <span className="inline-flex items-center gap-1 text-sm text-gray-700">
                        <svg className="h-4 w-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                        {getSalesPersonName(lead.assignedTo, lead.assignedUser)}
                      </span>
                    </TableCell>

                    {/* Updated */}
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-900">
                            {new Date(lead.updatedAt || lead.createdAt).toLocaleString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                          {(() => {
                            const updatedDate = new Date(lead.updatedAt || lead.createdAt);
                            const now = new Date();
                            const hoursDiff = (now.getTime() - updatedDate.getTime()) / (1000 * 60 * 60);
                            return hoursDiff < 24 && (
                              <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                                New
                              </span>
                            );
                          })()}
                        </div>
                        {lead.updatedAt && lead.updatedAt !== lead.createdAt && (
                          <span className="text-xs text-gray-500">
                            Created: {new Date(lead.createdAt).toLocaleString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        )}
                      </div>
                    </TableCell>

                    {/* Actions */}
                    {hasRole('manager') && (
                      <TableCell className="text-right">
                        <div className="relative inline-block">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenDropdownId(openDropdownId === lead.id ? null : lead.id);
                            }}
                            className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </button>

                          {/* Dropdown Menu */}
                          {openDropdownId === lead.id && (
                            <>
                              {/* Backdrop to close dropdown */}
                              <div className="fixed inset-0 z-10" onClick={() => setOpenDropdownId(null)} />

                              {/* Dropdown Content */}
                              <div className="absolute right-0 top-10 z-20 w-48 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5">
                                <div className="py-1" role="menu">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleEditLead(lead);
                                    }}
                                    className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    role="menuitem"
                                  >
                                    <Edit className="h-4 w-4" />
                                    Edit Lead
                                  </button>
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
            </TableBody>
          </Table>

          {/* Empty State for List View */}
          {leads.filter(
            (lead) =>
              (searchTerm === '' ||
                lead.leadName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                lead.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                lead.phone.includes(searchTerm)) &&
              (assignedFilter === 'all' ||
                (assignedFilter === '' && !lead.assignedTo) ||
                lead.assignedTo?.toString() === assignedFilter)
          ).length === 0 && (
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
              <p className="text-sm text-gray-500">No leads found</p>
              <p className="text-xs text-gray-400 mt-1">Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      )}

      {/* Add Lead Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 z-50 bg-white border-b border-gray-200 px-6 py-4">
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
                    <label htmlFor="customerId" className="block text-sm font-medium text-gray-700 mb-1">
                      Customer Name <span className="text-red-500">*</span>
                    </label>
                    <CustomerSelect
                      id="customerId"
                      name="customerId"
                      value={formData.customerId}
                      onChange={handleCustomerChange}
                      onAddNew={handleOpenAddCustomer}
                      placeholder="Search and select customer..."
                      required
                      className="w-full"
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
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleFormChange}
                      placeholder="john.doe@example.com"
                      className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleFormChange}
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
                    <label htmlFor="interiorColour" className="block text-sm font-medium text-gray-700 mb-1">
                      Interior Colour
                    </label>
                    <input
                      type="text"
                      id="interiorColour"
                      name="interiorColour"
                      value={formData.interiorColour}
                      onChange={handleFormChange}
                      placeholder="e.g., Black, Beige, Brown"
                      className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="exteriorColour" className="block text-sm font-medium text-gray-700 mb-1">
                      Exterior Colour
                    </label>
                    <input
                      type="text"
                      id="exteriorColour"
                      name="exteriorColour"
                      value={formData.exteriorColour}
                      onChange={handleFormChange}
                      placeholder="e.g., Black, White, Silver"
                      className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="gearBox" className="block text-sm font-medium text-gray-700 mb-1">
                      Gear Box
                    </label>
                    <select
                      id="gearBox"
                      name="gearBox"
                      value={formData.gearBox}
                      onChange={handleFormChange}
                      className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="automatic">Automatic</option>
                      <option value="manual">Manual</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="carType" className="block text-sm font-medium text-gray-700 mb-1">
                      Car Type
                    </label>
                    <select
                      id="carType"
                      name="carType"
                      value={formData.carType}
                      onChange={handleFormChange}
                      className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="new">New</option>
                      <option value="used">Used</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="fuelTank" className="block text-sm font-medium text-gray-700 mb-1">
                      Fuel Tank
                    </label>
                    <select
                      id="fuelTank"
                      name="fuelTank"
                      value={formData.fuelTank}
                      onChange={handleFormChange}
                      className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="">Select fuel type</option>
                      <option value="Diesel">Diesel</option>
                      <option value="Petrol">Petrol</option>
                      <option value="Hybrid">Hybrid</option>
                      <option value="Electric">Electric</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="steeringSide" className="block text-sm font-medium text-gray-700 mb-1">
                      Steering Side
                    </label>
                    <select
                      id="steeringSide"
                      name="steeringSide"
                      value={formData.steeringSide}
                      onChange={handleFormChange}
                      className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="Left">Left</option>
                      <option value="Right">Right</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="exportTo" className="block text-sm font-medium text-gray-700 mb-1">
                      Export
                    </label>
                    <select
                      id="exportTo"
                      name="exportTo"
                      value={formData.exportTo}
                      onChange={handleFormChange}
                      className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="">Select export destination</option>
                      <option value="Local (UAE)">Local (UAE)</option>
                      <option value="Outside GCC">Outside GCC</option>
                      <option value="Inside GCC">Inside GCC</option>
                      <option value="Jabal Ali">Jabal Ali</option>
                      <option value="DUCAMZ">DUCAMZ</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
                      Quantity
                    </label>
                    <input
                      type="number"
                      id="quantity"
                      name="quantity"
                      value={formData.quantity}
                      onChange={handleFormChange}
                      min="1"
                      placeholder="e.g., 1"
                      className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  {formData.exportTo === 'Outside GCC' && (
                    <div>
                      <label htmlFor="exportCountryId" className="block text-sm font-medium text-gray-700 mb-1">
                        Country <span className="text-red-500">*</span>
                      </label>
                      <ExportCountrySelect
                        id="exportCountryId"
                        name="exportCountryId"
                        value={formData.exportCountryId}
                        onChange={handleCountryChange}
                        placeholder="Search and select country..."
                        required
                        className="w-full"
                      />
                    </div>
                  )}
                  <div>
                    <label htmlFor="sellingPrice" className="block text-sm font-medium text-gray-700 mb-1">
                      Selling Price (AED)
                    </label>
                    <input
                      type="number"
                      id="sellingPrice"
                      name="sellingPrice"
                      value={formData.sellingPrice}
                      onChange={handleFormChange}
                      min="0"
                      step="100"
                      placeholder="e.g., 35000"
                      className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="costPrice" className="block text-sm font-medium text-gray-700 mb-1">
                      Cost Price (AED)
                    </label>
                    <input
                      type="number"
                      id="costPrice"
                      name="costPrice"
                      value={formData.costPrice}
                      onChange={handleFormChange}
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
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                      Category
                    </label>
                    <select
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleFormChange}
                      className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="">Select category...</option>
                      <option value="local_new">Local New</option>
                      <option value="local_used">Local Used</option>
                      <option value="premium_export">Premium Export</option>
                      <option value="regular_export">Regular Export</option>
                      <option value="commercial_export">Commercial Export</option>
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
                      <option value="">Select user...</option>
                      {salesUsers.map(user => (
                        <option key={user.id} value={user.id}>
                          {user.name} {user.role ? `(${user.role.charAt(0).toUpperCase() + user.role.slice(1)})` : ''} - {user.email}
                        </option>
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

      {/* Edit Lead Modal */}
      {showEditModal && editingLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 z-50 bg-white border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">Edit Lead</h3>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingLead(null);
                  }}
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </Button>
              </div>
            </div>

            <form onSubmit={handleUpdateLead} className="p-6 space-y-6">
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
                    <label htmlFor="edit-leadName" className="block text-sm font-medium text-gray-700 mb-1">
                      Lead Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="edit-leadName"
                      name="leadName"
                      value={formData.leadName}
                      onChange={handleFormChange}
                      required
                      placeholder="e.g., Lead-2024-008"
                      className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="edit-customerId" className="block text-sm font-medium text-gray-700 mb-1">
                      Customer Name <span className="text-red-500">*</span>
                    </label>
                    <CustomerSelect
                      id="edit-customerId"
                      name="customerId"
                      value={formData.customerId}
                      onChange={handleCustomerChange}
                      onAddNew={handleOpenAddCustomer}
                      placeholder="Search and select customer..."
                      required
                      className="w-full"
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
                    <label htmlFor="edit-email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="edit-email"
                      name="email"
                      value={formData.email}
                      onChange={handleFormChange}
                      placeholder="john.doe@example.com"
                      className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="edit-phone" className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="edit-phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleFormChange}
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
                    <label htmlFor="edit-carBrandId" className="block text-sm font-medium text-gray-700 mb-1">
                      Car Brand <span className="text-red-500">*</span>
                    </label>
                    <CarBrandSelect
                      id="edit-carBrandId"
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
                    <label htmlFor="edit-carModelId" className="block text-sm font-medium text-gray-700 mb-1">
                      Model <span className="text-red-500">*</span>
                    </label>
                    <CarModelSelect
                      id="edit-carModelId"
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
                    <label htmlFor="edit-trim" className="block text-sm font-medium text-gray-700 mb-1">
                      Trim
                    </label>
                    <input
                      type="text"
                      id="edit-trim"
                      name="trim"
                      value={formData.trim}
                      onChange={handleFormChange}
                      placeholder="e.g., Sport, Limited, Premium"
                      className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="edit-spec" className="block text-sm font-medium text-gray-700 mb-1">
                      Spec
                    </label>
                    <input
                      type="text"
                      id="edit-spec"
                      name="spec"
                      value={formData.spec}
                      onChange={handleFormChange}
                      placeholder="e.g., GCC, American, European"
                      className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="edit-modelYear" className="block text-sm font-medium text-gray-700 mb-1">
                      Model Year <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      id="edit-modelYear"
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
                    <label htmlFor="edit-interiorColour" className="block text-sm font-medium text-gray-700 mb-1">
                      Interior Colour
                    </label>
                    <input
                      type="text"
                      id="edit-interiorColour"
                      name="interiorColour"
                      value={formData.interiorColour}
                      onChange={handleFormChange}
                      placeholder="e.g., Black, Beige, Brown"
                      className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="edit-exteriorColour" className="block text-sm font-medium text-gray-700 mb-1">
                      Exterior Colour
                    </label>
                    <input
                      type="text"
                      id="edit-exteriorColour"
                      name="exteriorColour"
                      value={formData.exteriorColour}
                      onChange={handleFormChange}
                      placeholder="e.g., Black, White, Silver"
                      className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="edit-gearBox" className="block text-sm font-medium text-gray-700 mb-1">
                      Gear Box
                    </label>
                    <select
                      id="edit-gearBox"
                      name="gearBox"
                      value={formData.gearBox}
                      onChange={handleFormChange}
                      className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="automatic">Automatic</option>
                      <option value="manual">Manual</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="edit-carType" className="block text-sm font-medium text-gray-700 mb-1">
                      Car Type
                    </label>
                    <select
                      id="edit-carType"
                      name="carType"
                      value={formData.carType}
                      onChange={handleFormChange}
                      className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="new">New</option>
                      <option value="used">Used</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="edit-fuelTank" className="block text-sm font-medium text-gray-700 mb-1">
                      Fuel Tank
                    </label>
                    <select
                      id="edit-fuelTank"
                      name="fuelTank"
                      value={formData.fuelTank}
                      onChange={handleFormChange}
                      className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="">Select fuel type</option>
                      <option value="Diesel">Diesel</option>
                      <option value="Petrol">Petrol</option>
                      <option value="Hybrid">Hybrid</option>
                      <option value="Electric">Electric</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="edit-steeringSide" className="block text-sm font-medium text-gray-700 mb-1">
                      Steering Side
                    </label>
                    <select
                      id="edit-steeringSide"
                      name="steeringSide"
                      value={formData.steeringSide}
                      onChange={handleFormChange}
                      className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="Left">Left</option>
                      <option value="Right">Right</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="edit-exportTo" className="block text-sm font-medium text-gray-700 mb-1">
                      Export
                    </label>
                    <select
                      id="edit-exportTo"
                      name="exportTo"
                      value={formData.exportTo}
                      onChange={handleFormChange}
                      className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="">Select export destination</option>
                      <option value="Local (UAE)">Local (UAE)</option>
                      <option value="Outside GCC">Outside GCC</option>
                      <option value="Inside GCC">Inside GCC</option>
                      <option value="Jabal Ali">Jabal Ali</option>
                      <option value="DUCAMZ">DUCAMZ</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="edit-quantity" className="block text-sm font-medium text-gray-700 mb-1">
                      Quantity
                    </label>
                    <input
                      type="number"
                      id="edit-quantity"
                      name="quantity"
                      value={formData.quantity}
                      onChange={handleFormChange}
                      min="1"
                      placeholder="e.g., 1"
                      className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  {formData.exportTo === 'Outside GCC' && (
                    <div>
                      <label htmlFor="edit-exportCountryId" className="block text-sm font-medium text-gray-700 mb-1">
                        Country <span className="text-red-500">*</span>
                      </label>
                      <ExportCountrySelect
                        id="edit-exportCountryId"
                        name="exportCountryId"
                        value={formData.exportCountryId}
                        onChange={handleCountryChange}
                        placeholder="Search and select country..."
                        required
                        className="w-full"
                      />
                    </div>
                  )}
                  <div>
                    <label htmlFor="edit-sellingPrice" className="block text-sm font-medium text-gray-700 mb-1">
                      Selling Price (AED)
                    </label>
                    <input
                      type="number"
                      id="edit-sellingPrice"
                      name="sellingPrice"
                      value={formData.sellingPrice}
                      onChange={handleFormChange}
                      min="0"
                      step="100"
                      placeholder="e.g., 35000"
                      className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="edit-costPrice" className="block text-sm font-medium text-gray-700 mb-1">
                      Cost Price (AED)
                    </label>
                    <input
                      type="number"
                      id="edit-costPrice"
                      name="costPrice"
                      value={formData.costPrice}
                      onChange={handleFormChange}
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
                    <label htmlFor="edit-source" className="block text-sm font-medium text-gray-700 mb-1">
                      Source <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="edit-source"
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
                    <label htmlFor="edit-priority" className="block text-sm font-medium text-gray-700 mb-1">
                      Priority <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="edit-priority"
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
                  <div>
                    <label htmlFor="edit-category" className="block text-sm font-medium text-gray-700 mb-1">
                      Category
                    </label>
                    <select
                      id="edit-category"
                      name="category"
                      value={formData.category}
                      onChange={handleFormChange}
                      className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="">Select category...</option>
                      <option value="local_new">Local New</option>
                      <option value="local_used">Local Used</option>
                      <option value="premium_export">Premium Export</option>
                      <option value="regular_export">Regular Export</option>
                      <option value="commercial_export">Commercial Export</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="edit-assignedTo" className="block text-sm font-medium text-gray-700 mb-1">
                      Assign To <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="edit-assignedTo"
                      name="assignedTo"
                      value={formData.assignedTo}
                      onChange={handleFormChange}
                      required
                      className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="">Select user...</option>
                      {salesUsers.map(user => (
                        <option key={user.id} value={user.id}>
                          {user.name} {user.role ? `(${user.role.charAt(0).toUpperCase() + user.role.slice(1)})` : ''} - {user.email}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="edit-notes" className="block text-sm font-medium text-gray-700 mb-1">
                      Notes
                    </label>
                    <textarea
                      id="edit-notes"
                      name="notes"
                      value={formData.notes}
                      onChange={handleFormChange}
                      rows={4}
                      placeholder="Add any additional notes about this lead..."
                      className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  className="rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300 transition-colors"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingLead(null);
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
                >
                  Update Lead
                </button>
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

      {/* Lead Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="bg-green-50 border-b border-green-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">Lead Converted</h3>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={handleCategoryCancel}
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </Button>
              </div>
            </div>

            <form onSubmit={handleCategorySubmit} className="p-6 space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-4">
                  Please provide details for this converted lead:
                </p>
                <label htmlFor="leadCategory" className="block text-sm font-medium text-gray-700 mb-2">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  id="leadCategory"
                  value={leadCategory}
                  onChange={(e) => setLeadCategory(e.target.value)}
                  required
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                  autoFocus
                >
                  <option value="">Select a category...</option>
                  <option value="local_new">Local New</option>
                  <option value="local_used">Local Used</option>
                  <option value="premium_export">Premium Export</option>
                  <option value="regular_export">Regular Export</option>
                  <option value="commercial_export">Commercial Export</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="conversionSellingPrice" className="block text-sm font-medium text-gray-700 mb-2">
                    Selling Price (AED)
                  </label>
                  <input
                    type="number"
                    id="conversionSellingPrice"
                    value={conversionSellingPrice || ''}
                    onChange={(e) => setConversionSellingPrice(Number(e.target.value))}
                    min="0"
                    step="100"
                    placeholder="e.g., 35000"
                    className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label htmlFor="conversionCostPrice" className="block text-sm font-medium text-gray-700 mb-2">
                    Cost Price (AED)
                  </label>
                  <input
                    type="number"
                    id="conversionCostPrice"
                    value={conversionCostPrice || ''}
                    onChange={(e) => setConversionCostPrice(Number(e.target.value))}
                    min="0"
                    step="100"
                    placeholder="e.g., 25000"
                    className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                  />
                </div>
              </div>

              {/* Profit Margin Indicator */}
              {conversionSellingPrice > 0 && conversionCostPrice > 0 && (
                <div className="rounded-lg bg-blue-50 border border-blue-200 p-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-700">Profit Margin:</span>
                    <span className={`font-bold ${conversionSellingPrice > conversionCostPrice ? 'text-green-600' : 'text-red-600'}`}>
                      ${(conversionSellingPrice - conversionCostPrice).toLocaleString()}
                      ({conversionSellingPrice > 0 ? (((conversionSellingPrice - conversionCostPrice) / conversionSellingPrice) * 100).toFixed(1) : 0}%)
                    </span>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  className="rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300 transition-colors"
                  onClick={handleCategoryCancel}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 transition-colors"
                  disabled={!leadCategory}
                >
                  Confirm Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Customer Modal */}
      {showAddCustomerModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-auto">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <h3 className="text-xl font-semibold text-gray-900">Add New Customer</h3>
              <button
                onClick={() => setShowAddCustomerModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleAddCustomer} className="p-6">
              <div className="space-y-4">
                <div>
                  <label htmlFor="customer-fullName" className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="customer-fullName"
                    name="fullName"
                    value={customerFormData.fullName}
                    onChange={handleCustomerFormChange}
                    required
                    placeholder="e.g., John Doe"
                    className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="customer-email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="customer-email"
                    name="email"
                    value={customerFormData.email}
                    onChange={handleCustomerFormChange}
                    required
                    placeholder="e.g., john@example.com"
                    className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="customer-phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    id="customer-phone"
                    name="phone"
                    value={customerFormData.phone}
                    onChange={handleCustomerFormChange}
                    required
                    placeholder="e.g., +971 50 123 4567"
                    className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="customer-status" className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    id="customer-status"
                    name="status"
                    value={customerFormData.status}
                    onChange={handleCustomerFormChange}
                    className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="lead">Lead</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="customer-notes" className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    id="customer-notes"
                    name="notes"
                    value={customerFormData.notes}
                    onChange={handleCustomerFormChange}
                    rows={3}
                    placeholder="Additional notes about the customer..."
                    className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Documents
                  </label>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <label className="flex-1 cursor-pointer">
                        <div className="flex items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-600 transition-colors hover:border-blue-400 hover:bg-blue-50">
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          <span>Upload Documents</span>
                        </div>
                        <input
                          type="file"
                          multiple
                          onChange={handleCustomerDocumentChange}
                          className="hidden"
                          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        />
                      </label>
                    </div>

                    {customerFormData.documents.length > 0 && (
                      <div className="space-y-2">
                        {customerFormData.documents.map((file, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-3 py-2"
                          >
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <svg className="h-5 w-5 shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              <span className="text-sm text-gray-700 truncate">{file.name}</span>
                              <span className="text-xs text-gray-500 shrink-0">
                                ({(file.size / 1024).toFixed(1)} KB)
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeCustomerDocument(index)}
                              className="ml-2 shrink-0 text-red-500 hover:text-red-700 transition-colors"
                            >
                              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setShowAddCustomerModal(false)}
                  className="rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
                >
                  Add Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
