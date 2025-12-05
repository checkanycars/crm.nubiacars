# API Integration Guide

This document explains how the frontend connects to the backend API for the Leads management system.

## Overview

The leads management system has been fully integrated with the Laravel backend API. All CRUD operations (Create, Read, Update, Delete) now use real API endpoints instead of mock data.

## Architecture

### Service Layer: `leadsService.ts`

Located at: `frontend/src/services/leadsService.ts`

This service handles all API communication for leads management:

- **getLeads()** - Fetch all leads with optional filters
- **getLead(id)** - Get a single lead by ID
- **createLead(data)** - Create a new lead
- **updateLead(id, data)** - Update an existing lead
- **deleteLead(id)** - Delete a lead
- **getStatistics()** - Get lead statistics
- **bulkDelete(ids)** - Delete multiple leads
- **exportLeads()** - Export leads to CSV

### API Endpoints

Base URL: `http://localhost:8000/api`

#### Authentication Required
All endpoints require authentication via Sanctum token (automatically handled by axios interceptor).

#### Available Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/leads` | List all leads with filters |
| POST | `/api/leads` | Create a new lead |
| GET | `/api/leads/{id}` | Get single lead |
| PUT | `/api/leads/{id}` | Update a lead |
| DELETE | `/api/leads/{id}` | Delete a lead |
| GET | `/api/leads-statistics` | Get statistics |
| POST | `/api/leads-bulk-destroy` | Bulk delete leads |
| GET | `/api/leads-export` | Export leads |

## Data Structure

### Lead Interface

```typescript
interface Lead {
  id: number;
  leadName: string;
  contactName: string;
  email: string;
  phone: string;
  status: 'new' | 'converted' | 'not_converted';
  source: string;
  carCompany: string;
  model: string;
  modelYear: number;
  kilometers: number;
  price: number;
  notes: string;
  priority: 'high' | 'medium' | 'low';
  notConvertedReason?: string;
  assignedTo?: number;
  assignedUser?: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
  createdAt: string;
  updatedAt?: string;
}
```

### Field Mapping (Frontend ↔ Backend)

| Frontend (camelCase) | Backend (snake_case) |
|---------------------|---------------------|
| leadName | lead_name |
| contactName | contact_name |
| carCompany | car_company |
| modelYear | model_year |
| notConvertedReason | not_converted_reason |
| assignedTo | assigned_to |
| assignedUser | assignedUser (relation) |
| createdAt | created_at |
| updatedAt | updated_at |

## Features Implemented

### 1. Fetch Leads
- Loads all leads on page mount
- Displays loading spinner during fetch
- Shows error message with retry button on failure
- Supports pagination (currently fetching 1000 per page)

### 2. Create Lead
- Form validation
- Real-time API integration
- Automatically adds new lead to the Kanban board
- Assigns leads to sales users (by user ID)

### 3. Update Lead (Drag & Drop)
- Updates lead status when dragged between columns
- API call triggers on drop
- Shows reason modal for "not_converted" status
- Includes `notConvertedReason` in update payload

### 4. Assignment System
- Dynamically loads sales users from existing leads
- Falls back to default users if no data available
- Stores assignment by user ID (not email)
- Displays assigned user name and email

### 5. Filtering & Search
- Client-side filtering by search term
- Client-side filtering by assigned user
- Can be extended to use API-level filtering

## API Query Parameters

The `/api/leads` endpoint supports these filters:

```typescript
interface LeadFilters {
  status?: string;              // 'new', 'converted', 'not_converted'
  priority?: string;            // 'high', 'medium', 'low'
  assigned_to?: number;         // User ID
  source?: string;              // Lead source
  search?: string;              // Search in name, email, phone
  car_company?: string;         // Filter by car company
  model?: string;               // Filter by model
  model_year?: number;          // Filter by year
  min_price?: number;           // Minimum price
  max_price?: number;           // Maximum price
  sort_by?: string;             // Field to sort by
  sort_direction?: 'asc' | 'desc';
  per_page?: number;            // Results per page
  page?: number;                // Page number
}
```

## Error Handling

### API Errors
All API errors are caught and handled:
- Network errors
- Validation errors (422)
- Authentication errors (401)
- Server errors (500)

### User Feedback
- Loading states with spinners
- Error messages with retry options
- Success feedback (implicit via UI update)
- Alert dialogs for critical errors

## Authentication Flow

1. User logs in via `/api/login`
2. Sanctum token stored in localStorage
3. Axios interceptor adds token to all requests
4. Protected routes require valid token
5. Expired tokens trigger logout and redirect

## Future Enhancements

### Planned Features
1. **Real-time Updates** - WebSocket integration for live updates
2. **Optimistic Updates** - Update UI before API response
3. **Caching** - Cache frequently accessed data
4. **Infinite Scroll** - Load leads on scroll
5. **Advanced Filters** - More filtering options
6. **Bulk Operations** - Multi-select and bulk actions
7. **Export Functionality** - CSV/Excel export integration

### API Improvements Needed
1. **Users Endpoint** - Dedicated `/api/users?role=sales` endpoint
2. **Batch Updates** - Update multiple leads at once
3. **Activity Log** - Track lead changes
4. **File Uploads** - Attach documents to leads

## Development Notes

### Testing
- Test with real backend running on `http://localhost:8000`
- Ensure database is seeded with test data
- Use test credentials:
  - Manager: `manager@example.com` / `password`
  - Sales 1: `sales1@example.com` / `password`
  - Sales 2: `sales2@example.com` / `password`

### Environment Variables
```env
VITE_API_URL=http://localhost:8000
```

### CORS Configuration
Backend CORS config (`backend/config/cors.php`) must have:
```php
'supports_credentials' => true,
'allowed_origins' => ['http://localhost:3000'],
```

## Troubleshooting

### Common Issues

**1. 401 Unauthorized**
- Check if user is logged in
- Verify token in localStorage
- Check token expiration

**2. CORS Errors**
- Verify CORS config in backend
- Ensure `withCredentials: true` in axios
- Check allowed origins

**3. 422 Validation Errors**
- Check form field names match backend expectations
- Verify required fields are provided
- Check data types (numbers vs strings)

**4. Network Errors**
- Verify backend is running
- Check API URL in environment variables
- Verify network connectivity

### Debug Tips
```typescript
// Enable axios request/response logging
axios.interceptors.request.use(request => {
  console.log('Starting Request', request);
  return request;
});

axios.interceptors.response.use(response => {
  console.log('Response:', response);
  return response;
});
```

## Performance Considerations

- **Pagination**: Currently loading all leads (per_page: 1000)
  - Consider implementing virtual scrolling for large datasets
  - Add "Load More" button for pagination

- **Debouncing**: Search input should debounce API calls
  - Currently using client-side filtering
  - Can switch to server-side search for better performance

- **Caching**: Consider using React Query or SWR for:
  - Automatic caching
  - Background refetching
  - Optimistic updates

## Security Notes

- All API calls require authentication
- Tokens are stored securely in localStorage
- CSRF protection via Sanctum
- Input validation on both frontend and backend
- Role-based access control enforced on backend

## Conclusion

The leads management system is fully integrated with the backend API. All CRUD operations work seamlessly with proper error handling and user feedback. The architecture is scalable and maintainable, following React and TypeScript best practices.