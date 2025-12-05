# Lead API Documentation

## Overview

This API provides complete CRUD operations for managing leads in the CRM system. All endpoints require authentication via Bearer token.

## Base URL

```
http://your-domain.com/api
```

## Authentication

All lead endpoints require authentication. Include the Bearer token in the Authorization header:

```
Authorization: Bearer {access_token}
```

---

## Endpoints

### 1. Get All Leads (with filtering, searching, sorting, and pagination)

Retrieve a paginated list of leads with optional filtering and search capabilities.

**Endpoint:** `GET /api/leads`

**Headers:**
```
Accept: application/json
Authorization: Bearer {access_token}
```

**Query Parameters:**

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `status` | string | Filter by status (new, converted, not_converted) | `?status=new` |
| `priority` | string | Filter by priority (high, medium, low) | `?priority=high` |
| `assigned_to` | integer | Filter by assigned user ID | `?assigned_to=1` |
| `source` | string | Filter by lead source | `?source=Website` |
| `search` | string | Search in lead name, contact name, email, phone | `?search=john` |
| `car_company` | string | Filter by car company (partial match) | `?car_company=Toyota` |
| `model` | string | Filter by model (partial match) | `?model=Camry` |
| `model_year` | integer | Filter by model year | `?model_year=2023` |
| `min_price` | number | Filter by minimum price | `?min_price=10000` |
| `max_price` | number | Filter by maximum price | `?max_price=50000` |
| `sort_by` | string | Sort field (default: created_at) | `?sort_by=price` |
| `sort_direction` | string | Sort direction: asc or desc (default: desc) | `?sort_direction=asc` |
| `per_page` | integer | Items per page (default: 15) | `?per_page=25` |
| `page` | integer | Page number | `?page=2` |

**Success Response (200 OK):**
```json
{
  "data": [
    {
      "id": 1,
      "leadName": "ABC Motors",
      "contactName": "John Doe",
      "email": "john@example.com",
      "phone": "+971-50-123-4567",
      "status": "new",
      "source": "Website",
      "carCompany": "Toyota",
      "model": "Camry Sedan",
      "modelYear": 2022,
      "kilometers": 25000,
      "price": 75000.00,
      "notes": "Interested in immediate purchase",
      "priority": "high",
      "notConvertedReason": null,
      "assignedTo": 1,
      "assignedUser": {
        "id": 1,
        "name": "Manager",
        "email": "manager@example.com",
        "role": "manager"
      },
      "createdAt": "2025-12-05T11:51:18.271348Z",
      "updatedAt": "2025-12-05T11:51:18.271348Z"
    }
  ],
  "links": {
    "first": "http://localhost:8000/api/leads?page=1",
    "last": "http://localhost:8000/api/leads?page=5",
    "prev": null,
    "next": "http://localhost:8000/api/leads?page=2"
  },
  "meta": {
    "current_page": 1,
    "from": 1,
    "last_page": 5,
    "per_page": 15,
    "to": 15,
    "total": 59
  }
}
```

**Example Requests:**

```bash
# Get all leads
curl -X GET "http://localhost:8000/api/leads" \
  -H "Authorization: Bearer {token}"

# Get high priority leads
curl -X GET "http://localhost:8000/api/leads?priority=high" \
  -H "Authorization: Bearer {token}"

# Search for leads
curl -X GET "http://localhost:8000/api/leads?search=john" \
  -H "Authorization: Bearer {token}"

# Get leads with price range
curl -X GET "http://localhost:8000/api/leads?min_price=50000&max_price=100000" \
  -H "Authorization: Bearer {token}"

# Get leads sorted by price ascending
curl -X GET "http://localhost:8000/api/leads?sort_by=price&sort_direction=asc" \
  -H "Authorization: Bearer {token}"
```

---

### 2. Get Single Lead

Retrieve detailed information about a specific lead.

**Endpoint:** `GET /api/leads/{id}`

**Headers:**
```
Accept: application/json
Authorization: Bearer {access_token}
```

**Success Response (200 OK):**
```json
{
  "data": {
    "id": 1,
    "leadName": "ABC Motors",
    "contactName": "John Doe",
    "email": "john@example.com",
    "phone": "+971-50-123-4567",
    "status": "new",
    "source": "Website",
    "carCompany": "Toyota",
    "model": "Camry Sedan",
    "modelYear": 2022,
    "kilometers": 25000,
    "price": 75000.00,
    "notes": "Interested in immediate purchase",
    "priority": "high",
    "notConvertedReason": null,
    "assignedTo": 1,
    "assignedUser": {
      "id": 1,
      "name": "Manager",
      "email": "manager@example.com",
      "role": "manager"
    },
    "createdAt": "2025-12-05T11:51:18.271348Z",
    "updatedAt": "2025-12-05T11:51:18.271348Z"
  }
}
```

**Error Response (404 Not Found):**
```json
{
  "message": "No query results for model [App\\Models\\Lead] 999"
}
```

---

### 3. Create New Lead

Create a new lead in the system.

**Endpoint:** `POST /api/leads`

**Headers:**
```
Content-Type: application/json
Accept: application/json
Authorization: Bearer {access_token}
```

**Request Body:**
```json
{
  "lead_name": "ABC Motors",
  "contact_name": "John Doe",
  "email": "john@example.com",
  "phone": "+971-50-123-4567",
  "status": "new",
  "source": "Website",
  "car_company": "Toyota",
  "model": "Camry",
  "model_year": 2022,
  "kilometers": 25000,
  "price": 75000.00,
  "notes": "Interested in immediate purchase",
  "priority": "high",
  "not_converted_reason": null,
  "assigned_to": 1
}
```

**Validation Rules:**

| Field | Type | Required | Rules |
|-------|------|----------|-------|
| `lead_name` | string | Yes | max:255 |
| `contact_name` | string | Yes | max:255 |
| `email` | string | Yes | valid email, max:255 |
| `phone` | string | Yes | max:20 |
| `status` | string | Yes | Enum: new, converted, not_converted |
| `source` | string | Yes | max:255 |
| `car_company` | string | Yes | max:255 |
| `model` | string | Yes | max:255 |
| `model_year` | integer | Yes | min:1900, max:current_year+2 |
| `kilometers` | integer | Yes | min:0 |
| `price` | number | Yes | min:0 |
| `notes` | string | No | nullable |
| `priority` | string | Yes | Enum: high, medium, low |
| `not_converted_reason` | string | No | nullable |
| `assigned_to` | integer | No | nullable, must exist in users table |

**Success Response (201 Created):**
```json
{
  "message": "Lead created successfully.",
  "data": {
    "id": 60,
    "leadName": "ABC Motors",
    "contactName": "John Doe",
    "email": "john@example.com",
    "phone": "+971-50-123-4567",
    "status": "new",
    "source": "Website",
    "carCompany": "Toyota",
    "model": "Camry",
    "modelYear": 2022,
    "kilometers": 25000,
    "price": 75000.00,
    "notes": "Interested in immediate purchase",
    "priority": "high",
    "notConvertedReason": null,
    "assignedTo": 1,
    "assignedUser": {
      "id": 1,
      "name": "Manager",
      "email": "manager@example.com",
      "role": "manager"
    },
    "createdAt": "2025-12-05T12:30:00.000000Z",
    "updatedAt": "2025-12-05T12:30:00.000000Z"
  }
}
```

**Validation Error Response (422 Unprocessable Entity):**
```json
{
  "message": "Lead name is required. (and 2 more errors)",
  "errors": {
    "lead_name": [
      "Lead name is required."
    ],
    "email": [
      "Please provide a valid email address."
    ],
    "price": [
      "Price cannot be negative."
    ]
  }
}
```

---

### 4. Update Lead

Update an existing lead.

**Endpoint:** `PUT/PATCH /api/leads/{id}`

**Headers:**
```
Content-Type: application/json
Accept: application/json
Authorization: Bearer {access_token}
```

**Request Body:** (All fields are optional, only send fields you want to update)
```json
{
  "status": "converted",
  "price": 72000.00,
  "notes": "Deal closed successfully"
}
```

**Validation Rules:** Same as Create, but all fields are optional (use `sometimes` instead of `required`)

**Success Response (200 OK):**
```json
{
  "message": "Lead updated successfully.",
  "data": {
    "id": 1,
    "leadName": "ABC Motors",
    "contactName": "John Doe",
    "email": "john@example.com",
    "phone": "+971-50-123-4567",
    "status": "converted",
    "source": "Website",
    "carCompany": "Toyota",
    "model": "Camry",
    "modelYear": 2022,
    "kilometers": 25000,
    "price": 72000.00,
    "notes": "Deal closed successfully",
    "priority": "high",
    "notConvertedReason": null,
    "assignedTo": 1,
    "assignedUser": {
      "id": 1,
      "name": "Manager",
      "email": "manager@example.com",
      "role": "manager"
    },
    "createdAt": "2025-12-05T11:51:18.271348Z",
    "updatedAt": "2025-12-05T12:35:00.000000Z"
  }
}
```

---

### 5. Delete Lead

Delete a specific lead.

**Endpoint:** `DELETE /api/leads/{id}`

**Headers:**
```
Accept: application/json
Authorization: Bearer {access_token}
```

**Success Response (200 OK):**
```json
{
  "message": "Lead deleted successfully."
}
```

**Error Response (404 Not Found):**
```json
{
  "message": "No query results for model [App\\Models\\Lead] 999"
}
```

---

### 6. Get Lead Statistics

Get statistical overview of all leads.

**Endpoint:** `GET /api/leads-statistics`

**Headers:**
```
Accept: application/json
Authorization: Bearer {access_token}
```

**Success Response (200 OK):**
```json
{
  "data": {
    "total": 59,
    "new": 18,
    "converted": 15,
    "not_converted": 26,
    "high_priority": 20,
    "medium_priority": 19,
    "low_priority": 20
  }
}
```

---

### 7. Bulk Delete Leads

Delete multiple leads at once.

**Endpoint:** `POST /api/leads-bulk-destroy`

**Headers:**
```
Content-Type: application/json
Accept: application/json
Authorization: Bearer {access_token}
```

**Request Body:**
```json
{
  "ids": [1, 2, 3, 4, 5]
}
```

**Validation Rules:**
- `ids`: required, must be an array
- `ids.*`: required, must be integer, must exist in leads table

**Success Response (200 OK):**
```json
{
  "message": "5 lead(s) deleted successfully."
}
```

**Validation Error Response (422 Unprocessable Entity):**
```json
{
  "message": "The ids field is required.",
  "errors": {
    "ids": [
      "The ids field is required."
    ]
  }
}
```

---

### 8. Export Leads

Export all leads data (useful for CSV/Excel generation on frontend).

**Endpoint:** `GET /api/leads-export`

**Headers:**
```
Accept: application/json
Authorization: Bearer {access_token}
```

**Success Response (200 OK):**
```json
{
  "data": [
    {
      "ID": 1,
      "Lead Name": "ABC Motors",
      "Contact Name": "John Doe",
      "Email": "john@example.com",
      "Phone": "+971-50-123-4567",
      "Status": "new",
      "Source": "Website",
      "Car Company": "Toyota",
      "Model": "Camry",
      "Model Year": 2022,
      "Kilometers": 25000,
      "Price": "75000.00",
      "Priority": "high",
      "Assigned To": "Manager",
      "Created At": "2025-12-05 15:51:18"
    }
  ]
}
```

---

## Lead Status Enum

| Value | Description |
|-------|-------------|
| `new` | New lead, not yet processed |
| `converted` | Lead successfully converted to sale |
| `not_converted` | Lead not converted (requires `not_converted_reason`) |

---

## Lead Priority Enum

| Value | Description |
|-------|-------------|
| `high` | High priority lead |
| `medium` | Medium priority lead |
| `low` | Low priority lead |

---

## Common Lead Sources

- Website
- Phone Call
- Walk-in
- Referral
- Social Media
- Email
- Advertisement

---

## Example React Integration

### Create Lead Service

```javascript
// src/services/leadService.js
import api from './api';

const leadService = {
  // Get all leads
  getAll: async (params = {}) => {
    try {
      const response = await api.get('/leads', { params });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch leads',
      };
    }
  },

  // Get single lead
  getById: async (id) => {
    try {
      const response = await api.get(`/leads/${id}`);
      return { success: true, data: response.data.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch lead',
      };
    }
  },

  // Create lead
  create: async (data) => {
    try {
      const response = await api.post('/leads', data);
      return { success: true, data: response.data.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to create lead',
        errors: error.response?.data?.errors || {},
      };
    }
  },

  // Update lead
  update: async (id, data) => {
    try {
      const response = await api.put(`/leads/${id}`, data);
      return { success: true, data: response.data.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update lead',
        errors: error.response?.data?.errors || {},
      };
    }
  },

  // Delete lead
  delete: async (id) => {
    try {
      const response = await api.delete(`/leads/${id}`);
      return { success: true, message: response.data.message };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to delete lead',
      };
    }
  },

  // Get statistics
  getStatistics: async () => {
    try {
      const response = await api.get('/leads-statistics');
      return { success: true, data: response.data.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch statistics',
      };
    }
  },

  // Bulk delete
  bulkDelete: async (ids) => {
    try {
      const response = await api.post('/leads-bulk-destroy', { ids });
      return { success: true, message: response.data.message };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to delete leads',
      };
    }
  },

  // Export leads
  export: async () => {
    try {
      const response = await api.get('/leads-export');
      return { success: true, data: response.data.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to export leads',
      };
    }
  },
};

export default leadService;
```

### Example Usage in React Component

```javascript
import React, { useState, useEffect } from 'react';
import leadService from '../services/leadService';

const LeadsList = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    search: '',
    page: 1,
  });

  useEffect(() => {
    fetchLeads();
  }, [filters]);

  const fetchLeads = async () => {
    setLoading(true);
    const result = await leadService.getAll(filters);
    if (result.success) {
      setLeads(result.data.data);
      setPagination(result.data.meta);
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this lead?')) {
      const result = await leadService.delete(id);
      if (result.success) {
        alert(result.message);
        fetchLeads();
      } else {
        alert(result.error);
      }
    }
  };

  return (
    <div>
      <h1>Leads</h1>
      {/* Filters */}
      <div>
        <input
          type="text"
          placeholder="Search..."
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
        />
        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
        >
          <option value="">All Statuses</option>
          <option value="new">New</option>
          <option value="converted">Converted</option>
          <option value="not_converted">Not Converted</option>
        </select>
      </div>

      {/* Leads Table */}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Lead Name</th>
              <th>Contact</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Price</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <tr key={lead.id}>
                <td>{lead.id}</td>
                <td>{lead.leadName}</td>
                <td>{lead.contactName}</td>
                <td>{lead.status}</td>
                <td>{lead.priority}</td>
                <td>${lead.price}</td>
                <td>
                  <button onClick={() => handleDelete(lead.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Pagination */}
      <div>
        <button
          disabled={pagination.current_page === 1}
          onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
        >
          Previous
        </button>
        <span>Page {pagination.current_page} of {pagination.last_page}</span>
        <button
          disabled={pagination.current_page === pagination.last_page}
          onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default LeadsList;
```

---

## Error Codes

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 201 | Created |
| 401 | Unauthenticated - Invalid or missing token |
| 404 | Not Found - Lead doesn't exist |
| 422 | Validation Error - Invalid input data |
| 500 | Server Error |

---

## Testing with cURL

```bash
# Login first to get token
TOKEN=$(curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"manager@example.com","password":"password"}' \
  | jq -r '.access_token')

# Get all leads
curl -X GET "http://localhost:8000/api/leads" \
  -H "Authorization: Bearer $TOKEN"

# Create a lead
curl -X POST "http://localhost:8000/api/leads" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "lead_name": "Test Lead",
    "contact_name": "Test Contact",
    "email": "test@example.com",
    "phone": "+971-50-999-9999",
    "status": "new",
    "source": "Website",
    "car_company": "Toyota",
    "model": "Camry",
    "model_year": 2023,
    "kilometers": 5000,
    "price": 80000,
    "priority": "high",
    "assigned_to": 1
  }'

# Update a lead
curl -X PUT "http://localhost:8000/api/leads/1" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"status": "converted", "price": 75000}'

# Get statistics
curl -X GET "http://localhost:8000/api/leads-statistics" \
  -H "Authorization: Bearer $TOKEN"

# Delete a lead
curl -X DELETE "http://localhost:8000/api/leads/1" \
  -H "Authorization: Bearer $TOKEN"
```

---

## Notes

- All timestamps are returned in ISO 8601 format (UTC)
- Prices are stored as decimal with 2 decimal places
- The API uses camelCase for JSON responses but snake_case for request parameters
- Pagination is built-in for the index endpoint
- All endpoints return consistent JSON structure
- Validation errors include field-specific error messages