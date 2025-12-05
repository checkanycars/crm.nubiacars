# API Authentication Documentation

## Overview

This API uses Laravel Sanctum for token-based authentication. All protected endpoints require a valid Bearer token in the Authorization header.

## Base URL

```
http://your-domain.com/api
```

## Authentication Endpoints

### 1. Login

Authenticate a user and receive an access token.

**Endpoint:** `POST /api/login`

**Headers:**
```
Content-Type: application/json
Accept: application/json
```

**Request Body:**
```json
{
  "email": "manager@example.com",
  "password": "password"
}
```

**Validation Rules:**
- `email`: required, valid email format, string, max 255 characters
- `password`: required, string, minimum 6 characters

**Success Response (200 OK):**
```json
{
  "message": "Login successful.",
  "user": {
    "id": 1,
    "name": "Manager",
    "email": "manager@example.com",
    "role": "manager",
    "created_at": "2025-12-05T11:51:18.271348Z",
    "updated_at": "2025-12-05T11:51:18.271348Z"
  },
  "access_token": "1|aBcDeFgHiJkLmNoPqRsTuVwXyZ1234567890",
  "token_type": "Bearer"
}
```

**Error Response (422 Unprocessable Entity):**
```json
{
  "message": "The provided credentials are incorrect.",
  "errors": {
    "email": [
      "The provided credentials are incorrect."
    ]
  }
}
```

**Validation Error Response (422 Unprocessable Entity):**
```json
{
  "message": "The email field is required. (and 1 more error)",
  "errors": {
    "email": [
      "Email address is required."
    ],
    "password": [
      "Password is required."
    ]
  }
}
```

---

### 2. Logout

Revoke the current user's access token.

**Endpoint:** `POST /api/logout`

**Headers:**
```
Content-Type: application/json
Accept: application/json
Authorization: Bearer {access_token}
```

**Request Body:** None

**Success Response (200 OK):**
```json
{
  "message": "Logout successful."
}
```

**Error Response (401 Unauthorized):**
```json
{
  "message": "Unauthenticated."
}
```

---

### 3. Get Authenticated User

Retrieve the currently authenticated user's information.

**Endpoint:** `GET /api/me`

**Headers:**
```
Accept: application/json
Authorization: Bearer {access_token}
```

**Success Response (200 OK):**
```json
{
  "user": {
    "id": 1,
    "name": "Manager",
    "email": "manager@example.com",
    "role": "manager",
    "created_at": "2025-12-05T11:51:18.271348Z",
    "updated_at": "2025-12-05T11:51:18.271348Z"
  }
}
```

**Error Response (401 Unauthorized):**
```json
{
  "message": "Unauthenticated."
}
```

---

## User Roles

The system supports the following user roles:

- `manager`: Manager role with administrative privileges
- `sales`: Sales role with limited privileges

---

## Using the Access Token

After successful login, include the access token in all subsequent requests to protected endpoints:

```
Authorization: Bearer {access_token}
```

### Example with cURL:

```bash
curl -X GET \
  http://your-domain.com/api/me \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer 1|aBcDeFgHiJkLmNoPqRsTuVwXyZ1234567890'
```

### Example with JavaScript (Fetch API):

```javascript
const token = '1|aBcDeFgHiJkLmNoPqRsTuVwXyZ1234567890';

fetch('http://your-domain.com/api/me', {
  method: 'GET',
  headers: {
    'Accept': 'application/json',
    'Authorization': `Bearer ${token}`
  }
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));
```

### Example with Axios:

```javascript
import axios from 'axios';

const token = '1|aBcDeFgHiJkLmNoPqRsTuVwXyZ1234567890';

axios.get('http://your-domain.com/api/me', {
  headers: {
    'Accept': 'application/json',
    'Authorization': `Bearer ${token}`
  }
})
.then(response => console.log(response.data))
.catch(error => console.error('Error:', error));
```

---

## Testing with Seeded Users

The following users are seeded in the database for testing:

### Manager User
- **Email:** `manager@example.com`
- **Password:** `password`
- **Role:** `manager`

### Sales User 1
- **Email:** `sales1@example.com`
- **Password:** `password`
- **Role:** `sales`

### Sales User 2
- **Email:** `sales2@example.com`
- **Password:** `password`
- **Role:** `sales`

---

## Timezone Configuration

The server is configured to use **Asia/Dubai (UAE)** timezone (UTC+4:00).

### Important Notes:
- All timestamps in API responses are returned in **ISO 8601 format (UTC)**
- The server processes and stores dates/times in Dubai timezone
- ISO format example: `2025-12-05T11:51:18.271348Z` (UTC)
- Dubai time equivalent: `2025-12-05 15:51:18` (UTC+4)

### Check Server Time:
```bash
GET /api/server-time
```

**Response:**
```json
{
  "timezone": "Asia/Dubai",
  "current_time": "2025-12-05 15:51:18",
  "current_time_iso": "2025-12-05T11:51:18.271348Z",
  "timestamp": 1733405478
}
```

---

## Token Management

### Token Lifecycle
- When a user logs in, all existing tokens for that user are revoked
- A new token is generated with each login
- Tokens remain valid until explicitly revoked via logout or another login

### Security Best Practices
1. Store tokens securely (e.g., httpOnly cookies or secure storage)
2. Never expose tokens in URLs or logs
3. Implement token refresh mechanism for long-lived sessions
4. Always use HTTPS in production
5. Implement rate limiting on authentication endpoints

---

## Error Codes

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 401 | Unauthenticated - Invalid or missing token |
| 422 | Validation Error - Invalid input data |
| 500 | Server Error |

---

## Postman Collection

You can import the following endpoints into Postman for easy testing:

1. **Login**
   - Method: POST
   - URL: `{{base_url}}/api/login`
   - Body: raw JSON
   ```json
   {
     "email": "manager@example.com",
     "password": "password"
   }
   ```

2. **Logout**
   - Method: POST
   - URL: `{{base_url}}/api/logout`
   - Headers: `Authorization: Bearer {{token}}`

3. **Get User Info**
   - Method: GET
   - URL: `{{base_url}}/api/me`
   - Headers: `Authorization: Bearer {{token}}`

Set `base_url` environment variable to your API base URL (e.g., `http://localhost:8000`).