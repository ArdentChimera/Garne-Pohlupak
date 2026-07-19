#!/bin/bash

# Simplified deployment script for Cloud Run
set -e

echo "🚀 Deploying Backend to Cloud Run..."

# Configuration
PROJECT_ID="garne-pohlupak-prod"
SERVICE_NAME="garne-pohlupak-backend"
REGION="europe-west1"

# Step 1: Build the container using Cloud Build
echo "📦 Step 1: Building container image..."
gcloud builds submit --tag gcr.io/$PROJECT_ID/$SERVICE_NAME

# Step 2: Deploy to Cloud Run
echo "🚀 Step 2: Deploying to Cloud Run..."
gcloud run deploy $SERVICE_NAME \
  --image gcr.io/$PROJECT_ID/$SERVICE_NAME \
  --region $REGION \
  --platform managed \
  --allow-unauthenticated \
  --max-instances 10 \
  --memory 512Mi \
  --cpu 1 \
  --timeout 60

echo ""
echo "✅ Container built and deployed!"
echo ""
echo "⚙️  Step 3: Now set your environment variables:"
echo ""
echo "Run this command:"
echo ""
echo "gcloud run services update $SERVICE_NAME \\"
echo "  --update-env-vars DATABASE_URL='your_database_url' \\"
echo "  --update-env-vars JWT_SECRET='your_jwt_secret' \\"
echo "  --update-env-vars FRONTEND_URL='https://your-app.web.app' \\"
echo "  --update-env-vars NODE_ENV='production' \\"
echo "  --region $REGION"
echo ""
echo "🌐 Your service URL:"
gcloud run services describe $SERVICE_NAME \
  --region $REGION \
  --format 'value(status.url)'
