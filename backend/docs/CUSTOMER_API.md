# Customer API Documentation

## Overview

The Customer API provides full CRUD (Create, Read, Update, Delete) operations for managing customers in the CRM system. All endpoints require authentication via Laravel Sanctum.

## Base URL

```
/api/customers
```

## Authentication

All endpoints require the `auth:sanctum` middleware. Include the Bearer token in the Authorization header:

```
Authorization: Bearer {your-token}
```

## Customer Object

| Field | Type | Description |
|-------|------|-------------|
| id | integer | Unique identifier |
| fullName | string | Customer's full name |
| email | string | Customer's email address |
| phone | string | Customer's phone number |
| status | string | Customer status (lead, active, inactive) |
| notes | string\|null | Additional notes about the customer |
| createdAt | string | ISO 8601 timestamp |
| updatedAt | string | ISO 8601 timestamp |

## Customer Statuses

- `lead` - Potential customer
- `active` - Active customer
- `inactive` - Inactive customer

## Endpoints

### List Customers

Retrieve a paginated list of customers with optional filtering and searching.

**Endpoint:** `GET /api/customers`

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| status | string | Filter by status (lead, active, inactive) |
| search | string | Search by full name, email, or phone |
| sort_by | string | Field to sort by (default: created_at) |
| sort_direction | string | Sort direction: asc or desc (default: desc) |
| per_page | integer | Results per page (default: 15) |

**Example Request:**

```bash
GET /api/customers?status=lead&search=john&per_page=10
```

**Example Response:**

```json
{
  "data": [
    {
      "id": 1,
      "fullName": "John Doe",
      "email": "john.doe@example.com",
      "phone": "+1 234-567-8900",
      "status": "lead",
      "notes": "Interested in purchasing a luxury sedan.",
      "createdAt": "2025-12-06T12:00:00.000000Z",
      "updatedAt": "2025-12-06T12:00:00.000000Z"
    }
  ],
  "links": {
    "first": "http://localhost/api/customers?page=1",
    "last": "http://localhost/api/customers?page=3",
    "prev": null,
    "next": "http://localhost/api/customers?page=2"
  },
  "meta": {
    "current_page": 1,
    "from": 1,
    "last_page": 3,
    "per_page": 15,
    "to": 15,
    "total": 33
  }
}
```

### Create Customer

Create a new customer.

**Endpoint:** `POST /api/customers`

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| full_name | string | Yes | Customer's full name (max: 255) |
| email | string | Yes | Valid email address (max: 255) |
| phone | string | Yes | Phone number (max: 20) |
| status | string | Yes | Status: lead, active, or inactive |
| notes | string | No | Additional notes |

**Example Request:**

```json
{
  "full_name": "John Doe",
  "email": "john.doe@example.com",
  "phone": "+1 234-567-8900",
  "status": "lead",
  "notes": "Interested in buying a car"
}
```

**Example Response:**

```json
{
  "message": "Customer created successfully.",
  "data": {
    "id": 1,
    "fullName": "John Doe",
    "email": "john.doe@example.com",
    "phone": "+1 234-567-8900",
    "status": "lead",
    "notes": "Interested in buying a car",
    "createdAt": "2025-12-06T12:00:00.000000Z",
    "updatedAt": "2025-12-06T12:00:00.000000Z"
  }
}
```

**Status Code:** `201 Created`

### Get Customer

Retrieve a specific customer by ID.

**Endpoint:** `GET /api/customers/{id}`

**Example Request:**

```bash
GET /api/customers/1
```

**Example Response:**

```json
{
  "data": {
    "id": 1,
    "fullName": "John Doe",
    "email": "john.doe@example.com",
    "phone": "+1 234-567-8900",
    "status": "lead",
    "notes": "Interested in buying a car",
    "createdAt": "2025-12-06T12:00:00.000000Z",
    "updatedAt": "2025-12-06T12:00:00.000000Z"
  }
}
```

**Status Code:** `200 OK`

**Error Response:**

```json
{
  "message": "No query results for model [App\\Models\\Customer] 999"
}
```

**Status Code:** `404 Not Found`

### Update Customer

Update an existing customer. Supports partial updates.

**Endpoint:** `PUT /api/customers/{id}` or `PATCH /api/customers/{id}`

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| full_name | string | No | Customer's full name (max: 255) |
| email | string | No | Valid email address (max: 255) |
| phone | string | No | Phone number (max: 20) |
| status | string | No | Status: lead, active, or inactive |
| notes | string | No | Additional notes |

**Example Request:**

```json
{
  "status": "active",
  "notes": "Successfully converted to customer"
}
```

**Example Response:**

```json
{
  "message": "Customer updated successfully.",
  "data": {
    "id": 1,
    "fullName": "John Doe",
    "email": "john.doe@example.com",
    "phone": "+1 234-567-8900",
    "status": "active",
    "notes": "Successfully converted to customer",
    "createdAt": "2025-12-06T12:00:00.000000Z",
    "updatedAt": "2025-12-06T12:30:00.000000Z"
  }
}
```

**Status Code:** `200 OK`

### Delete Customer

Delete a customer.

**Endpoint:** `DELETE /api/customers/{id}`

**Example Request:**

```bash
DELETE /api/customers/1
```

**Example Response:**

```json
{
  "message": "Customer deleted successfully."
}
```

**Status Code:** `200 OK`

## Validation Errors

When validation fails, the API returns a `422 Unprocessable Entity` status with error details:

```json
{
  "message": "The full name field is required. (and 1 more error)",
  "errors": {
    "full_name": [
      "Full name is required."
    ],
    "email": [
      "Please provide a valid email address."
    ]
  }
}
```

## Error Messages

### Store/Create Validation Messages

- **full_name.required**: "Full name is required."
- **full_name.max**: "Full name cannot exceed 255 characters."
- **email.required**: "Email address is required."
- **email.email**: "Please provide a valid email address."
- **email.max**: "Email address cannot exceed 255 characters."
- **phone.required**: "Phone number is required."
- **phone.max**: "Phone number cannot exceed 20 characters."
- **status.required**: "Customer status is required."

## Usage Examples

### Using cURL

```bash
# List customers
curl -X GET "http://localhost/api/customers?status=lead" \
  -H "Authorization: Bearer {your-token}" \
  -H "Accept: application/json"

# Create customer
curl -X POST "http://localhost/api/customers" \
  -H "Authorization: Bearer {your-token}" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "full_name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "status": "lead",
    "notes": "Interested in SUVs"
  }'

# Update customer
curl -X PUT "http://localhost/api/customers/1" \
  -H "Authorization: Bearer {your-token}" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "status": "active"
  }'

# Delete customer
curl -X DELETE "http://localhost/api/customers/1" \
  -H "Authorization: Bearer {your-token}" \
  -H "Accept: application/json"
```

### Using JavaScript/Fetch

```javascript
// List customers
const response = await fetch('http://localhost/api/customers?status=lead', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Accept': 'application/json'
  }
});
const data = await response.json();

// Create customer
const response = await fetch('http://localhost/api/customers', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  body: JSON.stringify({
    full_name: 'John Doe',
    email: 'john@example.com',
    phone: '+1234567890',
    status: 'lead',
    notes: 'Interested in SUVs'
  })
});
const data = await response.json();
```

## Testing

Run the Customer API tests:

```bash
php artisan test --filter=CustomerTest
```

All tests include:
- Authentication checks
- CRUD operations
- Filtering and searching
- Sorting and pagination
- Validation rules
- Error handling

## Database Schema

```sql
CREATE TABLE customers (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    status VARCHAR(255) NOT NULL,
    notes TEXT NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    INDEX idx_email (email),
    INDEX idx_phone (phone),
    INDEX idx_status (status)
);
```
