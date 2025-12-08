# Customer Documents API Documentation

## Overview

This API provides endpoints for managing documents associated with customers. Documents are stored securely on the server and linked to customer records.

## Features

- Upload multiple PDF documents (up to 2MB each)
- List all documents for a customer
- Download documents
- Delete documents
- Automatic cleanup when customers are deleted

## Base URL

All document endpoints are prefixed with `/api/customers/{customer_id}/documents`

## Authentication

All endpoints require authentication using Laravel Sanctum. Include the bearer token in the Authorization header:

```
Authorization: Bearer {token}
```

---

## Endpoints

### 1. List Customer Documents

Get all documents associated with a customer.

**Endpoint:** `GET /api/customers/{customer}/documents`

**Parameters:**
- `customer` (path, required) - Customer ID

**Response:** `200 OK`

```json
{
  "data": [
    {
      "id": 1,
      "customer_id": 5,
      "filename": "contract.pdf",
      "stored_name": "550e8400-e29b-41d4-a716-446655440000.pdf",
      "path": "customer-documents/5/550e8400-e29b-41d4-a716-446655440000.pdf",
      "size": 1048576,
      "formatted_size": "1.00 MB",
      "mime_type": "application/pdf",
      "url": "https://api.example.com/api/customers/5/documents/1/download",
      "created_at": "2024-12-08T12:00:00.000000Z",
      "updated_at": "2024-12-08T12:00:00.000000Z"
    }
  ]
}
```

---

### 2. Upload Documents

Upload one or more PDF documents for a customer.

**Endpoint:** `POST /api/customers/{customer}/documents`

**Parameters:**
- `customer` (path, required) - Customer ID

**Request Body:** `multipart/form-data`

```
documents[]: File (required, PDF, max 2MB)
```

**Example using cURL:**

```bash
curl -X POST https://api.example.com/api/customers/5/documents \
  -H "Authorization: Bearer {token}" \
  -F "documents[]=@/path/to/document1.pdf" \
  -F "documents[]=@/path/to/document2.pdf"
```

**Example using JavaScript:**

```javascript
const formData = new FormData();
formData.append('documents[]', file1);
formData.append('documents[]', file2);

const response = await fetch('/api/customers/5/documents', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + token
  },
  body: formData
});
```

**Validation Rules:**

- `documents` - Required, must be an array with at least one file
- `documents.*` - Required, must be a PDF file, maximum size 2MB (2048 KB)

**Response:** `201 Created`

```json
{
  "message": "2 documents uploaded successfully.",
  "data": [
    {
      "id": 1,
      "customer_id": 5,
      "filename": "contract.pdf",
      "stored_name": "550e8400-e29b-41d4-a716-446655440000.pdf",
      "path": "customer-documents/5/550e8400-e29b-41d4-a716-446655440000.pdf",
      "size": 1048576,
      "formatted_size": "1.00 MB",
      "mime_type": "application/pdf",
      "url": "https://api.example.com/api/customers/5/documents/1/download",
      "created_at": "2024-12-08T12:00:00.000000Z",
      "updated_at": "2024-12-08T12:00:00.000000Z"
    },
    {
      "id": 2,
      "customer_id": 5,
      "filename": "invoice.pdf",
      "stored_name": "660e8400-e29b-41d4-a716-446655440001.pdf",
      "path": "customer-documents/5/660e8400-e29b-41d4-a716-446655440001.pdf",
      "size": 524288,
      "formatted_size": "512.00 KB",
      "mime_type": "application/pdf",
      "url": "https://api.example.com/api/customers/5/documents/2/download",
      "created_at": "2024-12-08T12:00:01.000000Z",
      "updated_at": "2024-12-08T12:00:01.000000Z"
    }
  ]
}
```

**Error Responses:**

`422 Unprocessable Entity` - Validation failed

```json
{
  "message": "The documents field is required. (and 1 more error)",
  "errors": {
    "documents": ["The documents field is required."],
    "documents.0": ["Only PDF files are allowed."]
  }
}
```

---

### 3. Get Document Details

Get details of a specific document.

**Endpoint:** `GET /api/customers/{customer}/documents/{document}`

**Parameters:**
- `customer` (path, required) - Customer ID
- `document` (path, required) - Document ID

**Response:** `200 OK`

```json
{
  "data": {
    "id": 1,
    "customer_id": 5,
    "filename": "contract.pdf",
    "stored_name": "550e8400-e29b-41d4-a716-446655440000.pdf",
    "path": "customer-documents/5/550e8400-e29b-41d4-a716-446655440000.pdf",
    "size": 1048576,
    "formatted_size": "1.00 MB",
    "mime_type": "application/pdf",
    "url": "https://api.example.com/api/customers/5/documents/1/download",
    "created_at": "2024-12-08T12:00:00.000000Z",
    "updated_at": "2024-12-08T12:00:00.000000Z"
  }
}
```

**Error Responses:**

`404 Not Found` - Document not found or doesn't belong to customer

```json
{
  "message": "Document not found."
}
```

---

### 4. Download Document

Download a document file.

**Endpoint:** `GET /api/customers/{customer}/documents/{document}/download`

**Parameters:**
- `customer` (path, required) - Customer ID
- `document` (path, required) - Document ID

**Response:** `200 OK`

Returns the PDF file as a download with proper headers:
- `Content-Type: application/pdf`
- `Content-Disposition: attachment; filename="original_filename.pdf"`

**Error Responses:**

`404 Not Found` - Document not found

```json
{
  "message": "Document not found."
}
```

```json
{
  "message": "File not found on server."
}
```

---

### 5. Delete Document

Delete a document from the system.

**Endpoint:** `DELETE /api/customers/{customer}/documents/{document}`

**Parameters:**
- `customer` (path, required) - Customer ID
- `document` (path, required) - Document ID

**Response:** `200 OK`

```json
{
  "message": "Document deleted successfully."
}
```

**Error Responses:**

`404 Not Found` - Document not found

```json
{
  "message": "Document not found."
}
```

---

## Integration with Customer Endpoints

Documents can also be uploaded when creating or updating customers by including files in the request.

### Create Customer with Documents

**Endpoint:** `POST /api/customers`

**Request Body:** `multipart/form-data`

```
full_name: string (required)
email: string (required)
phone: string (required)
status: string (required) - "active", "inactive", or "lead"
notes: string (optional)
documents[]: File (optional, PDF, max 2MB each)
```

**Example:**

```bash
curl -X POST https://api.example.com/api/customers \
  -H "Authorization: Bearer {token}" \
  -F "full_name=John Doe" \
  -F "email=john@example.com" \
  -F "phone=+1234567890" \
  -F "status=active" \
  -F "notes=VIP customer" \
  -F "documents[]=@/path/to/contract.pdf"
```

**Response:** `201 Created`

```json
{
  "message": "Customer created successfully.",
  "data": {
    "id": 5,
    "fullName": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "status": "active",
    "notes": "VIP customer",
    "documents": [
      {
        "id": 1,
        "customer_id": 5,
        "filename": "contract.pdf",
        "stored_name": "550e8400-e29b-41d4-a716-446655440000.pdf",
        "path": "customer-documents/5/550e8400-e29b-41d4-a716-446655440000.pdf",
        "size": 1048576,
        "formatted_size": "1.00 MB",
        "mime_type": "application/pdf",
        "url": "https://api.example.com/api/customers/5/documents/1/download",
        "created_at": "2024-12-08T12:00:00.000000Z",
        "updated_at": "2024-12-08T12:00:00.000000Z"
      }
    ],
    "createdAt": "2024-12-08T12:00:00.000000Z",
    "updatedAt": "2024-12-08T12:00:00.000000Z"
  }
}
```

### Update Customer with Documents

**Endpoint:** `PUT /api/customers/{customer}`

Since we need to support file uploads, use POST with `_method=PUT`:

**Request Body:** `multipart/form-data`

```
_method: PUT (required when using POST)
full_name: string (optional)
email: string (optional)
phone: string (optional)
status: string (optional)
notes: string (optional)
documents[]: File (optional, PDF, max 2MB each)
```

**Example:**

```bash
curl -X POST https://api.example.com/api/customers/5 \
  -H "Authorization: Bearer {token}" \
  -F "_method=PUT" \
  -F "full_name=John Doe Updated" \
  -F "documents[]=@/path/to/new_document.pdf"
```

---

## Database Schema

### `customer_documents` Table

| Column       | Type               | Description                          |
|--------------|--------------------|--------------------------------------|
| id           | BIGINT UNSIGNED    | Primary key                          |
| customer_id  | BIGINT UNSIGNED    | Foreign key to customers table       |
| filename     | VARCHAR(255)       | Original filename                    |
| stored_name  | VARCHAR(255)       | Unique stored filename (UUID)        |
| path         | VARCHAR(255)       | Storage path                         |
| size         | BIGINT UNSIGNED    | File size in bytes                   |
| mime_type    | VARCHAR(255)       | MIME type (application/pdf)          |
| created_at   | TIMESTAMP          | Creation timestamp                   |
| updated_at   | TIMESTAMP          | Last update timestamp                |

**Indexes:**
- Primary key on `id`
- Foreign key on `customer_id` with cascade delete
- Index on `customer_id`

---

## File Storage

### Storage Location

Files are stored in the Laravel storage directory:
```
storage/app/customer-documents/{customer_id}/{uuid}.pdf
```

### Storage Disk

- **Disk:** `local`
- **Visibility:** Private (not publicly accessible)
- **Access:** Only through API endpoints with authentication

### File Naming

- Files are renamed using UUID v4 to ensure uniqueness
- Original filename is preserved in the database
- Format: `{uuid}.pdf`

### Automatic Cleanup

When a customer is deleted:
1. All associated document files are deleted from storage
2. All document database records are cascade deleted

---

## Security Considerations

### Access Control

- All endpoints require authentication
- Users can only access documents for customers they have permission to view
- Document ownership is verified before any operation

### File Validation

- Only PDF files are accepted
- File size limited to 2MB per file
- MIME type verification
- File extension verification

### Storage Security

- Files stored in private storage (not in public directory)
- Direct file access is prevented
- Files only accessible through authenticated API endpoints
- UUID-based filenames prevent guessing

### Recommendations

1. **Virus Scanning:** Implement virus scanning for uploaded files in production
2. **Rate Limiting:** Apply rate limits to upload endpoints
3. **Audit Logging:** Log all document uploads and deletions
4. **Backup:** Regularly backup the customer-documents directory
5. **Monitoring:** Monitor storage usage and implement quotas if needed

---

## Error Codes

| Status Code | Description                                    |
|-------------|------------------------------------------------|
| 200         | Success                                        |
| 201         | Resource created successfully                  |
| 401         | Unauthorized (missing or invalid token)        |
| 404         | Resource not found                             |
| 422         | Validation error                               |
| 500         | Internal server error                          |

---

## Rate Limiting

To prevent abuse, consider implementing rate limiting:

- Upload endpoint: 10 requests per minute per user
- Download endpoint: 30 requests per minute per user
- Delete endpoint: 20 requests per minute per user

---

## Testing

### Example Test Cases

1. **Upload Single Document**
   - Upload a valid PDF file
   - Verify file is stored
   - Verify database record is created

2. **Upload Multiple Documents**
   - Upload 3 PDF files at once
   - Verify all files are stored
   - Verify all database records are created

3. **Validation Tests**
   - Upload non-PDF file (should fail)
   - Upload file over 2MB (should fail)
   - Upload without authentication (should fail)

4. **Download Document**
   - Upload a document
   - Download it
   - Verify correct file is returned

5. **Delete Document**
   - Upload a document
   - Delete it
   - Verify file is removed from storage
   - Verify database record is deleted

6. **Customer Deletion**
   - Create customer with documents
   - Delete customer
   - Verify all documents are deleted

### PHPUnit Test Example

```php
public function test_can_upload_document_to_customer()
{
    $user = User::factory()->create();
    $customer = Customer::factory()->create();
    
    $file = UploadedFile::fake()->create('test.pdf', 1024, 'application/pdf');
    
    $response = $this->actingAs($user)
        ->postJson("/api/customers/{$customer->id}/documents", [
            'documents' => [$file]
        ]);
    
    $response->assertStatus(201)
        ->assertJsonStructure([
            'message',
            'data' => [
                '*' => ['id', 'filename', 'size', 'url']
            ]
        ]);
    
    $this->assertDatabaseHas('customer_documents', [
        'customer_id' => $customer->id,
        'filename' => 'test.pdf'
    ]);
}
```

---

## Changelog

### Version 1.0.0 (2024-12-08)

- Initial release
- Support for PDF document uploads
- CRUD operations for documents
- Integration with customer create/update endpoints
- Automatic cleanup on customer deletion
- File size limit: 2MB per file
- Storage location: `storage/app/customer-documents/`

---

## Support

For issues or questions regarding the Customer Documents API, please contact the development team or create an issue in the project repository.