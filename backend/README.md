# Garne-Pohlupak Backend

Modern e-commerce backend built with Express.js, TypeScript, Drizzle ORM, and PostgreSQL (Neon).

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- PostgreSQL database (Neon recommended)

### Installation

1. **Install dependencies:**
```bash
npm install
```

2. **Set up environment variables:**
Create a `.env` file in the backend directory:
```env
PORT=8080
DATABASE_URL='your_neon_database_url'
JWT_SECRET='your_jwt_secret_key'
GOOGLE_CLIENT_ID='your_google_client_id'
GOOGLE_CLIENT_SECRET='your_google_client_secret'
FRONTEND_URL='http://localhost:3000'
```

3. **Run database migrations:**
```bash
npm run db:push
```

4. **Seed the database:**
```bash
npm run db:seed
```

5. **Start development server:**
```bash
npm run dev
```

Server will be running at `http://localhost:8080`

---

## 📁 Project Structure

```
backend/
├── src/
│   ├── db/
│   │   ├── schema.ts           # Database schema definitions
│   │   ├── index.ts            # Database connection
│   │   ├── seed.ts             # Seed script
│   │   └── migrations/         # Generated migrations
│   ├── routes/
│   │   ├── auth.ts             # Authentication endpoints
│   │   ├── products.ts         # Public product endpoints
│   │   ├── cart.ts             # Cart management
│   │   ├── orders.ts           # Order creation & tracking
│   │   └── admin.ts            # Admin CRUD operations
│   ├── middleware/
│   │   ├── auth.ts             # JWT & role-based auth
│   │   └── validate.ts         # Zod validation middleware
│   ├── utils/
│   │   └── jwt.ts              # JWT utilities
│   ├── cron/
│   │   └── cleanup.ts          # Cleanup expired carts
│   └── server.ts               # Express app setup
├── drizzle.config.ts           # Drizzle ORM config
├── tsconfig.json               # TypeScript config
└── package.json
```

---

## 🔑 Features

### Authentication & Authorization
- ✅ JWT-based authentication
- ✅ Role-based access control (admin, customer, guest)
- ✅ Guest checkout support
- ✅ Password hashing with bcrypt
- ✅ Rate limiting on auth endpoints

### Product Management
- ✅ Public product listing with pagination
- ✅ Search & filter by price/category
- ✅ Admin CRUD operations
- ✅ Stock & inventory management
- ✅ Soft deletes (isActive flag)

### Cart & Orders
- ✅ Cart reservation system (30-min expiry)
- ✅ Stock validation on checkout
- ✅ Guest & authenticated user support
- ✅ Order creation with transaction safety
- ✅ Order status tracking

### Security
- ✅ Helmet.js security headers
- ✅ CORS configuration
- ✅ Rate limiting (100 req/15min global, 5 req/15min auth)
- ✅ Input validation with Zod
- ✅ SQL injection protection (Drizzle ORM)

### Developer Experience
- ✅ TypeScript for type safety
- ✅ Hot reload with tsx watch
- ✅ Database migrations
- ✅ Seed script for testing
- ✅ Drizzle Studio for DB GUI

---

## 📚 API Documentation

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for complete API reference.

**Quick Test:**
```bash
# Test health endpoint
curl http://localhost:8080/health

# Login as admin
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@garne-pohlupak.com","password":"admin123"}'

# List products
curl http://localhost:8080/api/products
```

---

## 🗄️ Database Schema

### Tables
- **users** - User accounts (customers & admins)
- **products** - Product catalog with stock management
- **product_specs** - Product specifications (key-value pairs)
- **orders** - Order records
- **order_items** - Order line items
- **cart_reservations** - Temporary cart items with expiry

### Key Features
- Indexed fields for performance (email, product names)
- Foreign key relationships
- Soft deletes for products/users
- Price stored in cents (integer) for precision

---

## 🛠️ Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with hot reload |
| `npm run build` | Build TypeScript to JavaScript |
| `npm start` | Run production build |
| `npm run db:generate` | Generate migrations from schema |
| `npm run db:push` | Push migrations to database |
| `npm run db:seed` | Seed database with sample data |
| `npm run db:studio` | Open Drizzle Studio (visual DB editor) |

---

## 🔐 Default Admin Credentials

After running `npm run db:seed`:

**Email:** `admin@garne-pohlupak.com`
**Password:** `admin123`

⚠️ **Important:** Change this password in production!

---

## 🚦 CI/CD Pipeline Setup

### Automatic Migrations

Add this to your CI/CD pipeline:

```yaml
# Example GitHub Actions
- name: Run Migrations
  run: npm run db:push
  env:
    DATABASE_URL: ${{ secrets.DATABASE_URL }}
```

### Environment Variables

Required for production:
```
DATABASE_URL
JWT_SECRET
FRONTEND_URL
PORT (optional, defaults to 8080)
```

---

## 🧪 Testing

### Manual Testing with curl

**1. Register a new user:**
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "firstName": "Test",
    "lastName": "User"
  }'
```

**2. Add product to cart:**
```bash
curl -X POST http://localhost:8080/api/cart \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "productId": 1,
    "quantity": 2
  }'
```

**3. Create order:**
```bash
curl -X POST http://localhost:8080/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "shippingAddress": "123 Main St, City, State 12345"
  }'
```

---

## 🎨 Frontend Integration

### React Example

```typescript
// Login
const login = async (email: string, password: string) => {
  const response = await fetch('http://localhost:8080/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  })
  const data = await response.json()
  localStorage.setItem('token', data.data.token)
  return data
}

// Fetch products
const getProducts = async () => {
  const response = await fetch('http://localhost:8080/api/products?page=1&limit=20')
  return response.json()
}

// Add to cart (authenticated)
const addToCart = async (productId: number, quantity: number) => {
  const token = localStorage.getItem('token')
  const response = await fetch('http://localhost:8080/api/cart', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ productId, quantity })
  })
  return response.json()
}
```

---

## 📊 Performance Notes

- **Rate Limiting:** 100 requests per 15 minutes per IP (global)
- **Auth Rate Limiting:** 5 attempts per 15 minutes per IP
- **Cart Expiry:** 30 minutes (cleaned up by cron job)
- **JWT Expiry:** 7 days (guests: 24 hours)

---

## 🐛 Troubleshooting

### "Cannot connect to database"
- Verify `DATABASE_URL` in `.env`
- Ensure Neon database is running
- Check SSL mode in connection string

### "Unauthorized" on admin routes
- Ensure you're using admin token (login with admin@garne-pohlupak.com)
- Check token hasn't expired (7 days)
- Verify `Authorization: Bearer <token>` header format

### TypeScript errors
- Run `npm install` to ensure all types are installed
- Check `tsconfig.json` is properly configured

---

## 📝 License

ISC

---

## 👥 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

---

## 🆘 Support

For issues or questions:
1. Check [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
2. Review error messages in console
3. Open an issue on GitHub

---

**Built with ❤️ for modern e-commerce**
