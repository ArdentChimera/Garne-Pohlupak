# 🚀 Deployment Guide - Garne Pohlupak

Complete guide to deploy your Bulgarian clay pots e-commerce site to Google Cloud Platform.

---

## 📋 Prerequisites

Before starting, make sure you have:

1. **Google Cloud Account** - [Create one here](https://cloud.google.com/)
2. **Firebase Project** - [Create one here](https://console.firebase.google.com/)
3. **Google Cloud CLI (gcloud)** - [Install here](https://cloud.google.com/sdk/docs/install)
4. **Firebase CLI** - Install with: `npm install -g firebase-tools`
5. **Docker** (optional, for local testing) - [Install here](https://docs.docker.com/get-docker/)

---

## 🎯 Part 1: Deploy Backend to Cloud Run

### Step 1: Set up Google Cloud Project

```bash
# Login to Google Cloud
gcloud auth login

# Create a new project (or use existing)
gcloud projects create garne-pohlupak-prod --name="Garne Pohlupak Production"

# Set the project as default
gcloud config set project garne-pohlupak-prod

# Enable required APIs
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com
```

### Step 2: Configure Environment Variables

You'll need to set these secrets in Cloud Run:

```bash
# Navigate to backend directory
cd backend

# Set environment variables in Cloud Run (one by one)
gcloud run deploy garne-pohlupak-backend \
  --set-env-vars DATABASE_URL="your_neon_database_url" \
  --set-env-vars JWT_SECRET="your_jwt_secret_key" \
  --set-env-vars FRONTEND_URL="https://your-app.web.app" \
  --set-env-vars NODE_ENV="production" \
  --region europe-west1 \
  --platform managed \
  --allow-unauthenticated \
  --no-traffic
```

**⚠️ Important**: Replace the placeholder values:
- `your_neon_database_url` - Your Neon PostgreSQL connection string
- `your_jwt_secret_key` - Generate with: `openssl rand -hex 64`
- `your-app.web.app` - Your Firebase Hosting URL (get this in Part 2)

### Step 3: Build and Deploy Backend

```bash
# Make sure you're in the backend directory
cd /Users/nikolay/Desktop/Garne-Pohlupak/backend

# Submit to Cloud Build and deploy
gcloud builds submit --config cloudbuild.yaml

# OR manually build and deploy:
# Build Docker image
gcloud builds submit --tag gcr.io/garne-pohlupak-prod/garne-pohlupak-backend

# Deploy to Cloud Run
gcloud run deploy garne-pohlupak-backend \
  --image gcr.io/garne-pohlupak-prod/garne-pohlupak-backend \
  --region europe-west1 \
  --platform managed \
  --allow-unauthenticated \
  --max-instances 10 \
  --memory 512Mi \
  --cpu 1 \
  --timeout 60
```

### Step 4: Get Backend URL

```bash
# Get the deployed URL
gcloud run services describe garne-pohlupak-backend \
  --region europe-west1 \
  --format 'value(status.url)'
```

**Save this URL!** You'll need it for the frontend configuration.

Example: `https://garne-pohlupak-backend-xxxxx.run.app`

### Step 5: Test Backend

```bash
# Test health endpoint
curl https://your-backend-url.run.app/health

# Should return: {"status":"ok"}

# Test products endpoint
curl https://your-backend-url.run.app/api/products
```

---

## 🎨 Part 2: Deploy Frontend to Firebase Hosting

### Step 1: Initialize Firebase

```bash
# Navigate to frontend directory
cd /Users/nikolay/Desktop/Garne-Pohlupak/frontend/garne-pohlupak

# Login to Firebase
firebase login

# Initialize Firebase (if not already done)
firebase init hosting

# When prompted:
# - Select "Use an existing project" and choose your project
# - Public directory: dist
# - Single-page app: Yes
# - Set up automatic builds: No (we'll do manual for now)
# - Overwrite index.html: No
```

### Step 2: Update Frontend Environment Variables

Edit `.env.production` file:

```bash
# Update with your actual Cloud Run backend URL
VITE_API_URL=https://garne-pohlupak-backend-xxxxx.run.app/api
```

### Step 3: Build Frontend

```bash
# Build for production
npm run build

# This creates a 'dist' folder with optimized files
```

### Step 4: Deploy to Firebase Hosting

```bash
# Deploy to Firebase Hosting
firebase deploy --only hosting

# You'll get a URL like: https://garne-pohlupak-prod.web.app
```

### Step 5: Update Backend CORS

Now that you have your Firebase URL, update the backend:

```bash
# Update Cloud Run environment variables with the Firebase URL
gcloud run services update garne-pohlupak-backend \
  --update-env-vars FRONTEND_URL=https://garne-pohlupak-prod.web.app \
  --region europe-west1
```

---

## 🔄 Part 3: Set Up Continuous Deployment (Optional)

### For Backend (Cloud Build Triggers):

```bash
# Connect your GitHub repository
gcloud alpha builds triggers create github \
  --repo-name=Garne-Pohlupak \
  --repo-owner=your-github-username \
  --branch-pattern="^main$" \
  --build-config=backend/cloudbuild.yaml \
  --included-files="backend/**"
```

### For Frontend (GitHub Actions):

Create `.github/workflows/deploy-frontend.yml`:

```yaml
name: Deploy to Firebase Hosting

on:
  push:
    branches:
      - main
    paths:
      - 'frontend/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Install dependencies
        working-directory: frontend/garne-pohlupak
        run: npm ci

      - name: Build
        working-directory: frontend/garne-pohlupak
        run: npm run build
        env:
          VITE_API_URL: ${{ secrets.VITE_API_URL }}

      - name: Deploy to Firebase
        uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: ${{ secrets.GITHUB_TOKEN }}
          firebaseServiceAccount: ${{ secrets.FIREBASE_SERVICE_ACCOUNT }}
          channelId: live
          projectId: garne-pohlupak-prod
          entryPoint: frontend/garne-pohlupak
```

---

## 🗄️ Part 4: Database Setup (Neon DB)

Your Neon DB is already set up, but for production:

### Run Migrations:

```bash
cd backend

# Push schema to production database
npm run db:push

# Seed production data (optional - be careful!)
npm run db:seed
```

**⚠️ Warning**: Only run seed in production if the database is empty!

---

## 🔐 Part 5: Security Checklist

- [ ] Environment variables are set in Cloud Run (not in code)
- [ ] JWT_SECRET is a strong random string
- [ ] Database credentials are secure
- [ ] CORS is configured correctly
- [ ] HTTPS is enabled (automatic with Cloud Run & Firebase)
- [ ] Rate limiting is active
- [ ] Admin routes are protected

---

## 📊 Part 6: Monitoring & Logs

### View Backend Logs:

```bash
# Stream logs from Cloud Run
gcloud run services logs read garne-pohlupak-backend \
  --region europe-west1 \
  --tail
```

### View in Cloud Console:

1. Go to [Cloud Run Console](https://console.cloud.google.com/run)
2. Click on your service
3. Go to "Logs" tab

### Firebase Hosting Analytics:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to "Hosting" → "Usage"

---

## 💰 Estimated Costs (Monthly)

**Small traffic (< 1k users/day):**
- Cloud Run: $0-5 (free tier covers most)
- Firebase Hosting: $0 (free tier)
- Neon DB: $0 (free tier)
- **Total: ~$0-5/month**

**Medium traffic (10k users/day):**
- Cloud Run: $20-50
- Firebase Hosting: $0 (still free)
- Cloud SQL: $50-100 (if you upgrade from Neon)
- **Total: ~$70-150/month**

---

## 🆘 Troubleshooting

### Backend not responding:

```bash
# Check if service is running
gcloud run services list --region europe-west1

# Check logs
gcloud run services logs read garne-pohlupak-backend --region europe-west1 --limit 50
```

### CORS errors:

Make sure `FRONTEND_URL` environment variable in Cloud Run matches your Firebase Hosting URL exactly.

### Database connection issues:

Verify your `DATABASE_URL` is correct and Neon DB allows connections from Cloud Run.

---

## 🔄 Updating Your App

### Update Backend:

```bash
cd backend
gcloud builds submit --config cloudbuild.yaml
```

### Update Frontend:

```bash
cd frontend/garne-pohlupak
npm run build
firebase deploy --only hosting
```

---

## 📞 Quick Commands Reference

```bash
# Backend
gcloud run services list                          # List all services
gcloud run services describe SERVICE_NAME         # Get service details
gcloud run services delete SERVICE_NAME           # Delete service

# Frontend
firebase deploy --only hosting                    # Deploy hosting
firebase hosting:channel:deploy CHANNEL_NAME      # Deploy to preview channel
firebase serve                                    # Test locally

# Logs
gcloud run services logs tail SERVICE_NAME        # Stream logs
gcloud logging read "resource.type=cloud_run_revision" # Advanced logs
```

---

## ✅ Deployment Checklist

Before going live:

- [ ] Backend deployed to Cloud Run
- [ ] Frontend deployed to Firebase Hosting
- [ ] Environment variables configured
- [ ] Database seeded (if needed)
- [ ] CORS configured correctly
- [ ] SSL/HTTPS working (automatic)
- [ ] Admin login working
- [ ] Products loading from database
- [ ] Cart functionality working
- [ ] Test order creation
- [ ] Custom domain configured (optional)
- [ ] Analytics set up (optional)

---

## 🎉 You're Live!

Your URLs:
- **Frontend**: https://garne-pohlupak-prod.web.app
- **Backend**: https://garne-pohlupak-backend-xxxxx.run.app
- **Admin**: https://garne-pohlupak-prod.web.app/admin

Login with:
- Email: admin@garne-pohlupak.com
- Password: admin123

**⚠️ Remember to change the admin password immediately after first login!**

---

## 📚 Additional Resources

- [Cloud Run Documentation](https://cloud.google.com/run/docs)
- [Firebase Hosting Documentation](https://firebase.google.com/docs/hosting)
- [Neon DB Documentation](https://neon.tech/docs)
- [Google Cloud Pricing Calculator](https://cloud.google.com/products/calculator)

---

Need help? Check the logs first, then consult the documentation above. Good luck! 🍀
