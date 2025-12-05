// Mock data for testing the frontend without a backend

export const USE_MOCK_MODE = import.meta.env.VITE_USE_MOCK_AUTH === 'true';

// Mock User
export const mockUser = {
  id: 1,
  name: 'John Doe',
  email: 'admin@example.com',
  role: 'Administrator',
};

// Mock Customers
export const mockCustomers = [
  {
    id: 1,
    name: 'John Smith',
    email: 'john.smith@example.com',
    phone: '+1 234-567-8901',
    status: 'active',
    totalPurchases: 2,
    lastContact: '2024-01-15',
    createdAt: '2023-06-10',
    address: '123 Main St',
    city: 'New York',
    state: 'NY',
    zipCode: '10001',
    company: 'Acme Corp',
    notes: 'VIP customer, prefers email communication',
  },
  {
    id: 2,
    name: 'Jane Doe',
    email: 'jane.doe@example.com',
    phone: '+1 234-567-8902',
    status: 'active',
    totalPurchases: 1,
    lastContact: '2024-01-14',
    createdAt: '2023-08-22',
    address: '456 Oak Ave',
    city: 'Los Angeles',
    state: 'CA',
    zipCode: '90001',
    company: 'Tech Solutions Inc',
  },
  {
    id: 3,
    name: 'Bob Johnson',
    email: 'bob.johnson@example.com',
    phone: '+1 234-567-8903',
    status: 'lead',
    totalPurchases: 0,
    lastContact: '2024-01-13',
    createdAt: '2024-01-10',
    address: '789 Pine Rd',
    city: 'Chicago',
    state: 'IL',
    zipCode: '60601',
    company: 'Johnson Industries',
    notes: 'Interested in electric vehicles',
  },
  {
    id: 4,
    name: 'Alice Williams',
    email: 'alice.williams@example.com',
    phone: '+1 234-567-8904',
    status: 'inactive',
    totalPurchases: 3,
    lastContact: '2023-12-20',
    createdAt: '2022-03-15',
    address: '321 Elm St',
    city: 'Houston',
    state: 'TX',
    zipCode: '77001',
    notes: 'Moved to another state, may return',
  },
  {
    id: 5,
    name: 'Charlie Brown',
    email: 'charlie.brown@example.com',
    phone: '+1 234-567-8905',
    status: 'active',
    totalPurchases: 1,
    lastContact: '2024-01-12',
    createdAt: '2023-11-05',
    address: '555 Maple Dr',
    city: 'Phoenix',
    state: 'AZ',
    zipCode: '85001',
    company: 'Brown & Associates',
  },
];

// Mock Leads
export const mockLeads = [
  {
    id: 1,
    leadName: 'Lead-2024-001',
    contactName: 'Sarah Miller',
    email: 'sarah.miller@example.com',
    phone: '+1 345-678-9012',
    status: 'hot',
    source: 'Website',
    carCompany: 'Toyota',
    model: 'Camry',
    modelYear: 2023,
    kilometers: 15000,
    price: 28500,
    createdAt: '2024-01-16',
    lastContact: '2024-01-16',
    notes: 'Very interested, looking to buy within 2 weeks',
  },
  {
    id: 2,
    leadName: 'Lead-2024-002',
    contactName: 'Michael Davis',
    email: 'michael.davis@example.com',
    phone: '+1 345-678-9013',
    status: 'warm',
    source: 'Referral',
    carCompany: 'Honda',
    model: 'Civic',
    modelYear: 2024,
    kilometers: 5000,
    price: 24900,
    createdAt: '2024-01-15',
    lastContact: '2024-01-15',
    notes: 'Trade-in required, following up next week',
  },
  {
    id: 3,
    leadName: 'Lead-2024-003',
    contactName: 'Emily Wilson',
    email: 'emily.wilson@example.com',
    phone: '+1 345-678-9014',
    status: 'cold',
    source: 'Walk-in',
    carCompany: 'Ford',
    model: 'F-150',
    modelYear: 2023,
    kilometers: 8000,
    price: 42000,
    createdAt: '2024-01-12',
    lastContact: '2024-01-12',
    notes: 'Just browsing, will contact in a few months',
  },
  {
    id: 4,
    leadName: 'Lead-2024-004',
    contactName: 'David Martinez',
    email: 'david.martinez@example.com',
    phone: '+1 345-678-9015',
    status: 'hot',
    source: 'Phone Call',
    carCompany: 'Tesla',
    model: 'Model 3',
    modelYear: 2024,
    kilometers: 1000,
    price: 45000,
    createdAt: '2024-01-14',
    lastContact: '2024-01-16',
    notes: 'Pre-approved financing, ready to buy',
  },
];

// Mock Vehicles
export const mockVehicles = [
  {
    id: 1,
    make: 'Toyota',
    model: 'Camry',
    year: 2023,
    vin: '4T1BF1FK5FU123456',
    price: 28500,
    status: 'available',
    mileage: 15000,
    color: 'Silver',
    transmission: 'Automatic',
    fuelType: 'Gasoline',
    stock: 'TC2023-001',
    images: [],
  },
  {
    id: 2,
    make: 'Honda',
    model: 'Civic',
    year: 2024,
    vin: '2HGFC2F59RH123457',
    price: 24900,
    status: 'available',
    mileage: 5000,
    color: 'Blue',
    transmission: 'Automatic',
    fuelType: 'Gasoline',
    stock: 'HC2024-002',
    images: [],
  },
  {
    id: 3,
    make: 'Ford',
    model: 'F-150',
    year: 2023,
    vin: '1FTFW1E85NFA12345',
    price: 42000,
    status: 'sold',
    mileage: 8000,
    color: 'Black',
    transmission: 'Automatic',
    fuelType: 'Gasoline',
    stock: 'FF2023-003',
    images: [],
  },
  {
    id: 4,
    make: 'Tesla',
    model: 'Model 3',
    year: 2024,
    vin: '5YJ3E1EA1PF123458',
    price: 45000,
    status: 'reserved',
    mileage: 1000,
    color: 'White',
    transmission: 'Automatic',
    fuelType: 'Electric',
    stock: 'TM2024-004',
    images: [],
  },
  {
    id: 5,
    make: 'Chevrolet',
    model: 'Silverado',
    year: 2023,
    vin: '1GCUYEED0NZ123459',
    price: 38500,
    status: 'available',
    mileage: 12000,
    color: 'Red',
    transmission: 'Automatic',
    fuelType: 'Gasoline',
    stock: 'CS2023-005',
    images: [],
  },
];

// Mock Sales
export const mockSales = [
  {
    id: 1,
    date: '2024-01-15',
    customer: 'John Smith',
    vehicle: '2023 Toyota Camry',
    salePrice: 28500,
    commission: 1425,
    status: 'completed',
    paymentMethod: 'Financing',
    salesperson: 'John Doe',
  },
  {
    id: 2,
    date: '2024-01-14',
    customer: 'Jane Doe',
    vehicle: '2024 Honda Civic',
    salePrice: 24900,
    commission: 1245,
    status: 'completed',
    paymentMethod: 'Cash',
    salesperson: 'John Doe',
  },
  {
    id: 3,
    date: '2024-01-13',
    customer: 'Charlie Brown',
    vehicle: '2023 Ford F-150',
    salePrice: 42000,
    commission: 2100,
    status: 'pending',
    paymentMethod: 'Financing',
    salesperson: 'John Doe',
  },
  {
    id: 4,
    date: '2024-01-10',
    customer: 'Alice Williams',
    vehicle: '2023 Chevrolet Silverado',
    salePrice: 38500,
    commission: 1925,
    status: 'completed',
    paymentMethod: 'Trade-in + Financing',
    salesperson: 'John Doe',
  },
];

// Mock Dashboard Stats
export const mockDashboardStats = {
  totalCustomers: 1234,
  activeLeads: 456,
  monthlySales: 89234,
  vehiclesSold: 67,
  customerGrowth: '+12%',
  leadGrowth: '+8%',
  salesGrowth: '+23%',
  vehiclesGrowth: '-4%',
};

// Mock Recent Activities
export const mockRecentActivities = [
  {
    id: 1,
    type: 'sale',
    message: 'New sale: Toyota Camry sold to John Smith',
    time: '2 hours ago',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 2,
    type: 'lead',
    message: 'New lead: Sarah Miller interested in Toyota Camry',
    time: '5 hours ago',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 3,
    type: 'customer',
    message: 'New customer registered: Michael Davis',
    time: '1 day ago',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 4,
    type: 'follow-up',
    message: 'Follow-up scheduled with David Martinez',
    time: '1 day ago',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
];

// Mock API delay to simulate network
export const mockDelay = (ms: number = 500) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

// Mock API responses
export const mockAPI = {
  // Authentication
  login: async (email: string, password: string) => {
    await mockDelay(800);
    if (email === mockUser.email && password === 'password') {
      return { success: true, user: mockUser };
    }
    throw new Error('Invalid credentials');
  },

  // Get current user
  getUser: async () => {
    await mockDelay(300);
    return { success: true, user: mockUser };
  },

  // Logout
  logout: async () => {
    await mockDelay(300);
    return { success: true };
  },

  // Customers
  getCustomers: async () => {
    await mockDelay(500);
    return { success: true, data: mockCustomers };
  },

  // Leads
  getLeads: async () => {
    await mockDelay(500);
    return { success: true, data: mockLeads };
  },

  // Vehicles
  getVehicles: async () => {
    await mockDelay(500);
    return { success: true, data: mockVehicles };
  },

  // Sales
  getSales: async () => {
    await mockDelay(500);
    return { success: true, data: mockSales };
  },

  // Dashboard
  getDashboardStats: async () => {
    await mockDelay(500);
    return {
      success: true,
      data: {
        stats: mockDashboardStats,
        recentActivities: mockRecentActivities,
      },
    };
  },
};
