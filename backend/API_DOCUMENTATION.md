# Garne-Pohlupak API Documentation

## Base URL
```
http://localhost:8080/api
```

## Authentication
Most endpoints require a JWT token. Include it in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## 🔐 Authentication Endpoints

### 1. Register New User
**POST** `/api/auth/register`

**Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "customer"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### 2. Login
**POST** `/api/auth/login`

**Body:**
```json
{
  "email": "admin@garne-pohlupak.com",
  "password": "admin123"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "admin@garne-pohlupak.com",
      "role": "admin"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### 3. Generate Guest Token
**POST** `/api/auth/guest`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Guest token generated (valid for 24 hours)"
}
```

---

## 🛍️ Product Endpoints (Public)

### 1. List Products
**GET** `/api/products`

**Query Parameters:**
- `page` (optional, default: 1)
- `limit` (optional, default: 20)
- `search` (optional) - Search by product name
- `minPrice` (optional) - Minimum price in cents
- `maxPrice` (optional) - Maximum price in cents
- `categoryId` (optional) - Filter by category

**Example:**
```
GET /api/products?page=1&limit=10&search=headphones&minPrice=5000&maxPrice=10000
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "products": [
      {
        "id": 1,
        "name": "Wireless Bluetooth Headphones",
        "description": "High-quality wireless headphones...",
        "price": 7999,
        "imageUrl": "https://...",
        "stockQuantity": 50,
        "categoryId": null
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 6,
      "totalPages": 1
    }
  }
}
```

---

### 2. Get Single Product
**GET** `/api/products/:id`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Wireless Bluetooth Headphones",
    "description": "High-quality wireless headphones...",
    "price": 7999,
    "imageUrl": "https://...",
    "stockQuantity": 50,
    "specs": [
      { "key": "color", "value": "black" },
      { "key": "weight", "value": "250g" }
    ]
  }
}
```

---

## 🛒 Cart Endpoints

### 1. Get Cart
**GET** `/api/cart`

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 1,
        "productId": 1,
        "quantity": 2,
        "productName": "Wireless Bluetooth Headphones",
        "productPrice": 7999,
        "productImage": "https://...",
        "availableStock": 50
      }
    ],
    "total": 15998
  }
}
```

---

### 2. Add to Cart
**POST** `/api/cart`

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "productId": 1,
  "quantity": 2
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "userId": 1,
    "productId": 1,
    "quantity": 2,
    "expiresAt": "2026-05-15T18:00:00.000Z"
  },
  "message": "Item added to cart"
}
```

---

### 3. Update Cart Item
**PUT** `/api/cart/:id`

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "quantity": 3
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "quantity": 3,
    "expiresAt": "2026-05-15T18:00:00.000Z"
  }
}
```

---

### 4. Remove Cart Item
**DELETE** `/api/cart/:id`

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "message": "Item removed from cart"
}
```

---

### 5. Clear Cart
**DELETE** `/api/cart`

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "message": "Cart cleared successfully"
}
```

---

## 📦 Order Endpoints

### 1. Create Order
**POST** `/api/orders`

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "shippingAddress": "123 Main St, City, State, 12345",
  "guestEmail": "guest@example.com"  // Required for guest orders
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "userId": 1,
    "status": "pending",
    "totalAmount": 15998,
    "shippingAddress": "123 Main St, City, State, 12345",
    "createdAt": "2026-05-15T17:00:00.000Z"
  },
  "message": "Order created successfully"
}
```

---

### 2. List User Orders
**GET** `/api/orders`

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "status": "pending",
      "totalAmount": 15998,
      "createdAt": "2026-05-15T17:00:00.000Z"
    }
  ]
}
```

---

### 3. Get Order Details
**GET** `/api/orders/:id`

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "status": "pending",
    "totalAmount": 15998,
    "shippingAddress": "123 Main St...",
    "items": [
      {
        "id": 1,
        "productId": 1,
        "quantity": 2,
        "priceAtPurchase": 7999,
        "productName": "Wireless Bluetooth Headphones",
        "productImage": "https://..."
      }
    ]
  }
}
```

---

## 👨‍💼 Admin Endpoints

**All admin endpoints require `Authorization: Bearer <admin_token>`**

### Products Management

#### 1. List All Products (including inactive)
**GET** `/api/admin/products`

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Product Name",
      "price": 7999,
      "stockQuantity": 50,
      "isActive": 1
    }
  ]
}
```

---

#### 2. Get Product
**GET** `/api/admin/products/:id`

---

#### 3. Create Product
**POST** `/api/admin/products`

**Body:**
```json
{
  "name": "New Product",
  "description": "Product description",
  "price": 9999,
  "imageUrl": "https://example.com/image.jpg",
  "stockQuantity": 100,
  "categoryId": null
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": 7,
    "name": "New Product",
    "price": 9999,
    "stockQuantity": 100
  }
}
```

---

#### 4. Update Product
**PUT** `/api/admin/products/:id`

**Body:**
```json
{
  "price": 8999,
  "stockQuantity": 80
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Product Name",
    "price": 8999,
    "stockQuantity": 80
  }
}
```

---

#### 5. Delete Product (Soft Delete)
**DELETE** `/api/admin/products/:id`

**Response (200):**
```json
{
  "success": true,
  "message": "Product deactivated successfully"
}
```

---

### Orders Management

#### 1. List All Orders
**GET** `/api/admin/orders`

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "userId": 1,
      "status": "pending",
      "totalAmount": 15998
    }
  ]
}
```

---

#### 2. Get Order Details
**GET** `/api/admin/orders/:id`

---

#### 3. Update Order Status
**PATCH** `/api/admin/orders/:id/status`

**Body:**
```json
{
  "status": "shipped"
}
```

**Valid statuses:** `pending`, `confirmed`, `shipped`, `delivered`, `cancelled`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "status": "shipped",
    "updatedAt": "2026-05-15T18:00:00.000Z"
  }
}
```

---

### Users Management

#### 1. List All Users
**GET** `/api/admin/users`

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "email": "admin@garne-pohlupak.com",
      "firstName": "Admin",
      "lastName": "User",
      "role": "admin",
      "isActive": 1,
      "createdAt": "2026-05-15T17:00:00.000Z"
    }
  ]
}
```

---

## 🔧 Utility Endpoints

### Health Check
**GET** `/health`

**Response (200):**
```json
{
  "status": "ok"
}
```

---

## 🚨 Error Responses

All errors follow this format:

```json
{
  "success": false,
  "error": "Error message here"
}
```

**Common Status Codes:**
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `429` - Too Many Requests (rate limited)
- `500` - Internal Server Error

---

## 📝 Testing Instructions

### 1. Admin Login
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@garne-pohlupak.com","password":"admin123"}'
```

### 2. List Products
```bash
curl http://localhost:8080/api/products
```

### 3. Create Product (Admin)
```bash
curl -X POST http://localhost:8080/api/admin/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your_admin_token>" \
  -d '{
    "name": "Test Product",
    "price": 5999,
    "description": "Test description",
    "stockQuantity": 10
  }'
```

---

## 🎯 Frontend Integration Tips

1. **Store JWT token** in localStorage or secure cookie
2. **Add Authorization header** to all authenticated requests
3. **Handle 401 errors** by redirecting to login
4. **Prices are in cents** - divide by 100 for display ($79.99 = 7999)
5. **Use pagination** for product listing
6. **Socket.IO** is available on `http://localhost:8080` for real-time updates

---

## 🗃️ Database Seeded Data

**Admin User:**
- Email: `admin@garne-pohlupak.com`
- Password: `admin123`

**Sample Products:** 6 products with stock available

---

## 📌 NPM Scripts

```bash
npm run dev          # Start development server with auto-reload
npm run build        # Build for production
npm start            # Run production build
npm run db:generate  # Generate database migrations
npm run db:push      # Push migrations to database
npm run db:seed      # Seed database with sample data
npm run db:studio    # Open Drizzle Studio (DB GUI)
```
