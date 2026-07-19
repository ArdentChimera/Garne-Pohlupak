# 🏺 Garne Pohlupak - Traditional Bulgarian Clay Pots E-commerce

Modern e-commerce platform for traditional Bulgarian clay pottery, built with React, TypeScript, Express, and PostgreSQL.

## 🚀 Quick Start

### Local Development

**Backend:**
```bash
cd backend
npm install
npm run dev
```

**Frontend:**
```bash
cd frontend/garne-pohlupak
npm install
npm run dev
```

Visit: http://localhost:5174

## 📦 Tech Stack

### Frontend
- ⚛️ React 18 + TypeScript
- ⚡ Vite
- 🎨 Ant Design + Tailwind CSS
- 🔄 React Router
- 🎭 Framer Motion

### Backend
- 🟢 Node.js + Express
- 📘 TypeScript
- 🗄️ PostgreSQL (Neon DB)
- 🔨 Drizzle ORM
- 🔐 JWT Authentication
- 🛡️ Helmet + CORS

## 🌍 Deployment

### Prerequisites
- Google Cloud Account
- Firebase Project
- gcloud CLI installed
- Firebase CLI installed

### Deploy to Production

**1. Deploy Backend (Cloud Run):**
```bash
./deploy-backend.sh
```

**2. Deploy Frontend (Firebase Hosting):**
```bash
./deploy-frontend.sh
```

📖 **Full deployment guide**: See [DEPLOYMENT.md](DEPLOYMENT.md)

## 🔐 Environment Variables

### Backend (.env)
```
PORT=8080
DATABASE_URL=your_neon_database_url
JWT_SECRET=your_jwt_secret
FRONTEND_URL=http://localhost:5174
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:8080/api
```

## 📁 Project Structure

```
Garne-Pohlupak/
├── backend/
│   ├── src/
│   │   ├── routes/          # API routes
│   │   ├── db/              # Database schema & config
│   │   ├── middleware/      # Auth, validation
│   │   └── server.ts        # Express server
│   ├── Dockerfile           # Cloud Run deployment
│   └── cloudbuild.yaml      # GCP build config
│
├── frontend/garne-pohlupak/
│   ├── src/
│   │   ├── pages/           # React pages
│   │   ├── components/      # Reusable components
│   │   ├── services/        # API services
│   │   └── contexts/        # React contexts
│   ├── firebase.json        # Firebase config
│   └── .firebaserc          # Firebase project
│
└── DEPLOYMENT.md            # Deployment guide
```

## 👤 Default Admin Credentials

```
Email: admin@garne-pohlupak.com
Password: admin123
```

⚠️ **Change these immediately in production!**

## 🛠️ Available Scripts

### Backend
```bash
npm run dev        # Start dev server
npm run build      # Build TypeScript
npm run start      # Start production server
npm run db:push    # Push schema to database
npm run db:seed    # Seed database
```

### Frontend
```bash
npm run dev        # Start dev server
npm run build      # Build for production
npm run preview    # Preview production build
```

## 📊 Features

- ✅ Product catalog with filters
- ✅ Shopping cart
- ✅ User authentication
- ✅ Admin dashboard
- ✅ Product management
- ✅ Order management
- ✅ Responsive design
- ✅ Bulgarian localization

## 🔄 Database Schema

- **users** - User accounts
- **products** - Product catalog
- **orders** - Customer orders
- **orderItems** - Order line items
- **cartReservations** - Shopping cart items

## 📈 Scaling

**Current Setup** (Free tier):
- Cloud Run: Auto-scales 0-10 instances
- Firebase Hosting: Global CDN
- Neon DB: 3GB storage

**Upgrade Path**:
1. Small → Cloud Run + Neon DB Free
2. Medium → Cloud Run + Cloud SQL
3. Large → GKE + Cloud SQL HA

## 📞 Support

- [Cloud Run Docs](https://cloud.google.com/run/docs)
- [Firebase Hosting Docs](https://firebase.google.com/docs/hosting)
- [Neon DB Docs](https://neon.tech/docs)

## 📄 License

Private - All rights reserved

---

Built with ❤️ for traditional Bulgarian craftsmanship 🇧🇬
