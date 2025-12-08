import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { leadsService, type Lead } from '../../services/leadsService';
import { usersService } from '../../services/usersService';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import type { DateRange } from 'react-day-picker';

type LeadStatus = 'new' | 'contacted' | 'converted' | 'not_converted';
type DateFilter = 'today' | 'yesterday' | 'monthly' | 'all';

interface SalesPersonStats {
  id: number;
  name: string;
  email: string;
  totals: {
    new: number;
    contacted: number;
    converted: number;
    not_converted: number;
    total: number;
  };
}

const statusColumns: { id: LeadStatus; title: string; color: string; bgColor: string; borderColor: string }[] = [
  { id: 'new', title: 'New', color: 'text-blue-700', bgColor: 'bg-blue-50', borderColor: 'border-blue-200' },
  { id: 'contacted', title: 'Contacted', color: 'text-purple-700', bgColor: 'bg-purple-50', borderColor: 'border-purple-200' },
  { id: 'converted', title: 'Converted', color: 'text-green-700', bgColor: 'bg-green-50', borderColor: 'border-green-200' },
  { id: 'not_converted', title: 'Not Converted', color: 'text-red-700', bgColor: 'bg-red-50', borderColor: 'border-red-200' },
];

export function SalesLeadsWidget() {
  const navigate = useNavigate();
  const [salesData, setSalesData] = useState<SalesPersonStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [allLeads, setAllLeads] = useState<Lead[]>([]);

  useEffect(() => {
    fetchSalesLeadsData();
  }, []);

  useEffect(() => {
    // Reprocess data when date filter changes
    if (allLeads.length > 0) {
      processSalesData(allLeads);
    }
  }, [dateFilter, dateRange]);

  const fetchSalesLeadsData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch sales users and all leads in parallel
      const [salesResponse, leadsResponse] = await Promise.all([
        usersService.getSalesList(),
        leadsService.getLeads({ per_page: 1000 }),
      ]);

      const salesUsers = salesResponse.sales;
      const leads = leadsResponse.data;
      
      setAllLeads(leads);
      processSalesData(leads, salesUsers);
    } catch (err: any) {
      console.error('Failed to fetch sales leads data:', err);
      setError(err?.response?.data?.message || 'Failed to load sales leads data');
    } finally {
      setIsLoading(false);
    }
  };

  const filterLeadsByDate = (leads: Lead[]): Lead[] => {
    if (dateFilter === 'all') return leads;

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    return leads.filter(lead => {
      const leadDate = new Date(lead.createdAt);
      const leadDay = new Date(leadDate.getFullYear(), leadDate.getMonth(), leadDate.getDate());

      switch (dateFilter) {
        case 'today':
          return leadDay.getTime() === today.getTime();
        
        case 'yesterday':
          return leadDay.getTime() === yesterday.getTime();
        
        case 'monthly':
          if (!dateRange?.from) return false;
          
          const fromDate = new Date(dateRange.from);
          fromDate.setHours(0, 0, 0, 0);
          
          // If no 'to' date, use 'from' date as single day
          const toDate = dateRange.to ? new Date(dateRange.to) : new Date(dateRange.from);
          toDate.setHours(23, 59, 59, 999);
          
          return leadDate >= fromDate && leadDate <= toDate;
        
        default:
          return true;
      }
    });
  };

  const processSalesData = async (leads: Lead[], salesUsers?: any[]) => {
    try {
      // If salesUsers not provided, fetch them
      let users = salesUsers;
      if (!users) {
        const salesResponse = await usersService.getSalesList();
        users = salesResponse.sales;
      }

      // Filter leads by date
      const filteredLeads = filterLeadsByDate(leads);

      // Group leads by sales person
      const salesStatsMap = new Map<number, SalesPersonStats>();

      // Initialize stats for each sales person
      users!.forEach(user => {
        salesStatsMap.set(user.id, {
          id: user.id,
          name: user.name,
          email: user.email,
          totals: {
            new: 0,
            contacted: 0,
            converted: 0,
            not_converted: 0,
            total: 0,
          },
        });
      });

      // Count leads for each sales person by status
      filteredLeads.forEach((lead: Lead) => {
        if (lead.assignedTo && salesStatsMap.has(lead.assignedTo)) {
          const stats = salesStatsMap.get(lead.assignedTo)!;
          stats.totals[lead.status]++;
          stats.totals.total++;
        }
      });

      // Convert map to array and sort by total leads
      const salesStats = Array.from(salesStatsMap.values())
        .sort((a, b) => b.totals.total - a.totals.total);

      setSalesData(salesStats);
    } catch (err: any) {
      console.error('Failed to process sales data:', err);
      setError(err?.response?.data?.message || 'Failed to process sales data');
    }
  };

  const handleDateFilterChange = (filter: DateFilter) => {
    setDateFilter(filter);
    if (filter !== 'monthly') {
      setDateRange(undefined);
    }
  };

  const handleViewAllLeads = () => {
    navigate({
      to: '/dashboard/leads',
      search: { action: undefined, assigned_to: undefined },
    });
  };

  const handleViewSalesLeads = (salesId: number) => {
    navigate({
      to: '/dashboard/leads',
      search: { action: undefined, assigned_to: salesId },
    });
  };

  const getDateFilterLabel = () => {
    switch (dateFilter) {
      case 'today':
        return 'Today';
      case 'yesterday':
        return 'Yesterday';
      case 'monthly':
        if (!dateRange?.from) return 'Select Date Range';
        if (!dateRange.to) return format(dateRange.from, 'MMM dd, yyyy');
        return `${format(dateRange.from, 'MMM dd, yyyy')} - ${format(dateRange.to, 'MMM dd, yyyy')}`;
      default:
        return 'All Time';
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-lg bg-white shadow-sm border border-gray-200">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">Sales Performance</h2>
        </div>
        <div className="p-6">
          <div className="flex items-center justify-center py-12">
            <div className="text-gray-500">Loading sales data...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-white shadow-sm border border-gray-200">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">Sales Performance</h2>
        </div>
        <div className="p-6">
          <div className="rounded-lg bg-red-50 border border-red-200 p-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg bg-white shadow-sm border border-gray-200">
      <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Sales Performance</h2>
        <button
          onClick={handleViewAllLeads}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          View All Leads →
        </button>
      </div>

      {/* Date Filter Section */}
      <div className="border-b border-gray-200 px-6 py-4 bg-gray-50">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-700">Filter by:</span>
          
          <div className="flex items-center gap-2">
            <Button
              variant={dateFilter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleDateFilterChange('all')}
              className="h-8"
            >
              All Time
            </Button>
            
            <Button
              variant={dateFilter === 'today' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleDateFilterChange('today')}
              className="h-8"
            >
              Today
            </Button>
            
            <Button
              variant={dateFilter === 'yesterday' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleDateFilterChange('yesterday')}
              className="h-8"
            >
              Yesterday
            </Button>

            {/* Date Range Picker */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={dateFilter === 'monthly' ? 'default' : 'outline'}
                  size="sm"
                  className="h-8 min-w-[140px] justify-start"
                >
                  <svg
                    className="mr-2 h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  {dateFilter === 'monthly' && dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, 'MMM dd')} - {format(dateRange.to, 'MMM dd')}
                      </>
                    ) : (
                      format(dateRange.from, 'MMM dd, yyyy')
                    )
                  ) : (
                    'Date Range'
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="range"
                  selected={dateRange}
                  onSelect={(range) => {
                    setDateRange(range);
                    if (range?.from) {
                      setDateFilter('monthly');
                    }
                  }}
                  initialFocus
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          </div>

          {dateFilter !== 'all' && (
            <div className="ml-auto flex items-center gap-2">
              <span className="text-sm text-gray-600">
                Showing: <span className="font-semibold">{getDateFilterLabel()}</span>
              </span>
              <button
                onClick={() => handleDateFilterChange('all')}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium"
              >
                Clear
              </button>
            </div>
          )}
        </div>
      </div>
      
      <div className="p-6">
        {salesData.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No sales representatives found
          </div>
        ) : salesData.every(s => s.totals.total === 0) ? (
          <div className="text-center py-8 text-gray-500">
            No leads found for the selected period
          </div>
        ) : (
          <div className="space-y-3">
            {salesData.map(salesPerson => (
              <div
                key={salesPerson.id}
                className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleViewSalesLeads(salesPerson.id)}
              >
                <div className="bg-gray-50 px-4 py-3 hover:bg-gray-100 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-600 text-white font-semibold">
                        {salesPerson.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{salesPerson.name}</h3>
                        <p className="text-xs text-gray-500">{salesPerson.email}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      {/* Total Count */}
                      <div className="text-center px-4">
                        <div className="text-2xl font-bold text-gray-900">
                          {salesPerson.totals.total}
                        </div>
                        <div className="text-xs text-gray-500 font-medium">Total Leads</div>
                      </div>

                      {/* Status Counts */}
                      <div className="flex items-center gap-2">
                        {statusColumns.map(column => (
                          <div
                            key={column.id}
                            className={`flex flex-col items-center justify-center min-w-20 px-3 py-2 rounded-lg ${column.bgColor} ${column.borderColor} border`}
                            title={`${column.title}: ${salesPerson.totals[column.id]}`}
                          >
                            <span className={`text-2xl font-bold ${column.color}`}>
                              {salesPerson.totals[column.id]}
                            </span>
                            <span className={`text-xs font-medium ${column.color} mt-1`}>
                              {column.title}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Arrow Icon */}
                      <svg
                        className="w-5 h-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}