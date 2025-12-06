# 🚀 Car Database API - Quick Reference

## 📦 Installation (3 Commands)

```bash
php artisan migrate
php artisan db:seed
php artisan serve
```

---

## 🔗 API Endpoints

### Base URL
```
http://localhost:8000/api
```

### Authentication
```javascript
headers: {
  'Authorization': 'Bearer YOUR_TOKEN'
}
```

---

## 📋 All Endpoints

### Car Brands
```
GET     /api/car-brands           # List all
GET     /api/car-brands/{id}      # Get one
POST    /api/car-brands           # Create
PUT     /api/car-brands/{id}      # Update
DELETE  /api/car-brands/{id}      # Delete
```

### Car Models
```
GET     /api/car-models           # List all
GET     /api/car-models/{id}      # Get one
POST    /api/car-models           # Create
PUT     /api/car-models/{id}      # Update
DELETE  /api/car-models/{id}      # Delete
```

### Car Trims
```
GET     /api/car-trims            # List all
GET     /api/car-trims/{id}       # Get one
POST    /api/car-trims            # Create
PUT     /api/car-trims/{id}       # Update
DELETE  /api/car-trims/{id}       # Delete
```

---

## 🎯 Common Query Parameters

```
?per_page=20              # Pagination
?search=toyota            # Search
?include_models=1         # Include models (brands)
?include_brand=1          # Include brand (models)
?include_trims=1          # Include trims (models)
?include_model=1          # Include model (trims)
?with_counts=1            # Include counts
?brand_id=1               # Filter by brand (models)
?model_id=1               # Filter by model (trims)
?body_type=SUV            # Filter by body type (trims)
?popularity_level=High    # Filter by popularity (trims)
```

---

## 📝 Request Body Examples

### Create Brand
```json
{
  "name": "BMW"
}
```

### Create Model
```json
{
  "brand_id": 1,
  "model_name": "X5"
}
```

### Create Trim
```json
{
  "model_id": 1,
  "trim_name": "M Sport",
  "body_type": "SUV",
  "popularity_level": "High"
}
```

---

## ⚛️ React Quick Start

### Install Dependencies
```bash
npm install axios @tanstack/react-query
```

### Setup Axios
```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
    'Accept': 'application/json'
  }
});
```

### Fetch Brands
```javascript
const { data } = useQuery({
  queryKey: ['brands'],
  queryFn: async () => {
    const res = await api.get('/car-brands?with_counts=1');
    return res.data;
  }
});
```

### Create Brand
```javascript
const mutation = useMutation({
  mutationFn: async (name) => {
    const res = await api.post('/car-brands', { name });
    return res.data;
  }
});

// Use it
mutation.mutate('New Brand');
```

---

## 🗄️ Database Relationships

```
Brand (1) ──→ Model (N) ──→ Trim (N)
```

**Cascade Delete:**
- Delete Brand → Deletes all Models + Trims
- Delete Model → Deletes all Trims

---

## 🧪 Testing Commands

```bash
# Tinker
php artisan tinker
>>> \App\Models\CarBrand::all()

# Create test data
>>> \App\Models\CarBrand::factory()->create()

# Test relationships
>>> $brand = \App\Models\CarBrand::with('models.trims')->first()
```

---

## 📊 Seeded Data

**8 Brands:**
Toyota • Nissan • Mitsubishi • Jetour • MG • Land Rover • Kia • Hyundai

**13 Models:**
- Toyota: Land Cruiser, Hilux, Camry
- Nissan: Patrol, Sunny, X-Trail
- Mitsubishi: Pajero
- Jetour: T2
- MG: ZS
- Land Rover: Defender, Range Rover
- Kia: Sportage
- Hyundai: Tucson

**18 Trims:**
All with body_type and popularity_level (High/Medium/Low)

---

## 🎨 Response Format

### List Response (Paginated)
```json
{
  "data": [...],
  "links": { "first": "", "last": "", "prev": null, "next": "" },
  "meta": { "current_page": 1, "total": 100, ... }
}
```

### Single Item Response
```json
{
  "data": { "id": 1, "name": "Toyota", ... }
}
```

### Create/Update Response
```json
{
  "message": "Car brand created successfully.",
  "data": { "id": 1, "name": "BMW", ... }
}
```

### Delete Response
```json
{
  "message": "Car brand deleted successfully."
}
```

### Error Response (422)
```json
{
  "message": "The name field is required.",
  "errors": {
    "name": ["The name field is required."]
  }
}
```

---

## 🔧 Useful Laravel Commands

```bash
# Migrations
php artisan migrate
php artisan migrate:rollback
php artisan migrate:fresh --seed

# Seeders
php artisan db:seed
php artisan db:seed --class=CarBrandSeeder

# Routes
php artisan route:list

# Tinker
php artisan tinker

# Code Formatting
vendor/bin/pint

# Tests
php artisan test
```

---

## 📂 Key Files

```
Models:           app/Models/CarBrand.php
Controllers:      app/Http/Controllers/Api/CarBrandController.php
Resources:        app/Http/Resources/CarBrandResource.php
Requests:         app/Http/Requests/StoreCarBrandRequest.php
Migrations:       database/migrations/*_create_car_brands_table.php
Factories:        database/factories/CarBrandFactory.php
Seeders:          database/seeders/CarBrandSeeder.php
Routes:           routes/api.php
```

---

## ✅ Validation Rules

### Brand
- name: required, string, max:255, unique

### Model
- brand_id: required, integer, exists:car_brands
- model_name: required, string, max:255

### Trim
- model_id: required, integer, exists:car_models
- trim_name: required, string, max:255
- body_type: required, string, max:255
- popularity_level: required, enum:High,Medium,Low

---

## 🎯 Common Use Cases

### 1. Get All Brands with Model Counts
```
GET /api/car-brands?with_counts=1
```

### 2. Get Models for Specific Brand
```
GET /api/car-models?brand_id=1&include_brand=1
```

### 3. Get Trims for Specific Model
```
GET /api/car-trims?model_id=1&include_model=1
```

### 4. Search Trims by Body Type
```
GET /api/car-trims?body_type=SUV&popularity_level=High
```

### 5. Get Brand with All Models and Trims
```
GET /api/car-brands/1?include_models=1
```

---

## 🚨 Common Issues

### Issue: 401 Unauthenticated
**Solution:** Add Authorization header with Bearer token

### Issue: 422 Validation Error
**Solution:** Check request body matches validation rules

### Issue: 404 Not Found
**Solution:** Verify the ID exists in database

### Issue: Foreign Key Constraint
**Solution:** Ensure parent record exists before creating child

---

## 📚 Full Documentation

- **API_DOCUMENTATION.md** - Complete API reference
- **REACT_EXAMPLES.tsx** - React/TypeScript examples
- **CAR_DATABASE_README.md** - Comprehensive guide
- **CAR_DATABASE_SUMMARY.md** - Implementation checklist

---

## 🎉 Quick Test

```bash
# 1. Get all brands
curl -H "Authorization: Bearer TOKEN" \
     http://localhost:8000/api/car-brands

# 2. Create a brand
curl -X POST \
     -H "Authorization: Bearer TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"name":"BMW"}' \
     http://localhost:8000/api/car-brands

# 3. Get Toyota models
curl -H "Authorization: Bearer TOKEN" \
     http://localhost:8000/api/car-models?brand_id=1
```

---

**✅ Status:** Production Ready | 15 Endpoints | 8 Brands | 13 Models | 18 Trims
