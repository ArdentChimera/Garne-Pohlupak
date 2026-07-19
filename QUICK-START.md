# ⚡ Quick Start Guide

## 🎯 First Time Setup (5 minutes)

### 1. Install Prerequisites
```bash
# Install gcloud CLI
# Mac: brew install google-cloud-sdk
# Or visit: https://cloud.google.com/sdk/docs/install

# Install Firebase CLI
npm install -g firebase-tools
```

### 2. Login to Google Cloud & Firebase
```bash
gcloud auth login
firebase login
```

### 3. Create Google Cloud Project
```bash
# Create project
gcloud projects create garne-pohlupak-prod --name="Garne Pohlupak"

# Set as default
gcloud config set project garne-pohlupak-prod

# Enable APIs
gcloud services enable cloudbuild.googleapis.com run.googleapis.com containerregistry.googleapis.com
```

### 4. Create Firebase Project
- Go to https://console.firebase.google.com/
- Click "Add project"
- Name it: "Garne Pohlupak"
- Enable Google Analytics (optional)
- Copy project ID

### 5. Update Configuration Files

**Backend** - Update `backend/.env.production.example`:
```bash
DATABASE_URL=your_neon_database_url_from_neon_console
JWT_SECRET=$(openssl rand -hex 64)
FRONTEND_URL=https://garne-pohlupak-prod.web.app
```

**Frontend** - Update `frontend/garne-pohlupak/.firebaserc`:
```json
{
  "projects": {
    "default": "your-firebase-project-id"
  }
}
```

---

## 🚀 Deploy to Production

### Option A: One-Command Deploy (Recommended)
```bash
# Deploy backend
./deploy-backend.sh

# Deploy frontend (after getting backend URL)
./deploy-frontend.sh
```

### Option B: Manual Deploy

**Backend:**
```bash
cd backend

# Deploy to Cloud Run
gcloud builds submit --config cloudbuild.yaml

# Get URL
gcloud run services describe garne-pohlupak-backend \
  --region europe-west1 \
  --format 'value(status.url)'
```

**Frontend:**
```bash
cd frontend/garne-pohlupak

# Update .env.production with backend URL
echo "VITE_API_URL=https://your-backend-url.run.app/api" > .env.production

# Build and deploy
npm run build
firebase deploy --only hosting
```

---

## 🔧 Set Environment Variables

After deploying backend, set environment variables:

```bash
gcloud run services update garne-pohlupak-backend \
  --update-env-vars DATABASE_URL="postgresql://..." \
  --update-env-vars JWT_SECRET="your-secret" \
  --update-env-vars FRONTEND_URL="https://your-app.web.app" \
  --region europe-west1
```

---

## ✅ Post-Deployment Checklist

- [ ] Backend health check: `curl https://your-backend.run.app/health`
- [ ] Test products API: `curl https://your-backend.run.app/api/products`
- [ ] Open frontend URL in browser
- [ ] Test login with admin credentials
- [ ] Verify products load from database
- [ ] Test cart functionality
- [ ] Change admin password!

---

## 🔑 Admin Access

**URL**: https://your-app.web.app/admin

**Default Credentials**:
- Email: `admin@garne-pohlupak.com`
- Password: `admin123`

⚠️ **CHANGE PASSWORD IMMEDIATELY!**

---

## 📊 View Logs

**Backend logs:**
```bash
gcloud run services logs read garne-pohlupak-backend \
  --region europe-west1 \
  --tail
```

**Firebase logs:**
```bash
firebase hosting:channel:list
```

---

## 🔄 Update After Changes

**Backend:**
```bash
./deploy-backend.sh
# or
cd backend && gcloud builds submit --config cloudbuild.yaml
```

**Frontend:**
```bash
./deploy-frontend.sh
# or
cd frontend/garne-pohlupak && npm run build && firebase deploy --only hosting
```

---

## 💰 Free Tier Limits

- **Cloud Run**: 2M requests/month, 360k GB-seconds
- **Firebase Hosting**: 10GB storage, 360MB/day transfer
- **Neon DB**: 3GB storage, 1 project

You'll stay in free tier for moderate traffic! 🎉

---

## 🆘 Troubleshooting

**"Permission denied" error:**
```bash
gcloud auth login
gcloud config set project garne-pohlupak-prod
```

**"Service not found":**
Make sure you've deployed first with `gcloud builds submit`

**CORS errors:**
Update `FRONTEND_URL` environment variable in Cloud Run to match your Firebase URL

**Database connection failed:**
Verify your `DATABASE_URL` in environment variables

---

## 📚 Documentation

- Full deployment guide: [DEPLOYMENT.md](DEPLOYMENT.md)
- Project README: [README.md](README.md)

---

## 🎉 That's It!

You're now running on:
- ⚡ Google Cloud Run (backend)
- 🔥 Firebase Hosting (frontend)
- 🐘 Neon PostgreSQL (database)

**Auto-scaling, global CDN, HTTPS included!** 🚀
