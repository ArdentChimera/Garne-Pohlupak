#!/bin/bash

# Quick deployment script for backend to Cloud Run
# Usage: ./deploy-backend.sh

set -e

echo "🚀 Deploying Backend to Google Cloud Run..."

# Configuration
PROJECT_ID="garne-pohlupak-prod"
SERVICE_NAME="garne-pohlupak-backend"
REGION="europe-west1"

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo "❌ gcloud CLI is not installed. Please install it first:"
    echo "https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Set project
echo "📦 Setting project to $PROJECT_ID..."
gcloud config set project $PROJECT_ID

# Navigate to backend directory
cd "$(dirname "$0")/backend"

# Build and deploy using Cloud Build
echo "🔨 Building and deploying..."
gcloud builds submit --config cloudbuild.yaml

# Get the service URL
echo "✅ Deployment complete!"
echo ""
echo "🌐 Your backend is live at:"
gcloud run services describe $SERVICE_NAME \
  --region $REGION \
  --format 'value(status.url)'

echo ""
echo "📊 View logs with:"
echo "gcloud run services logs read $SERVICE_NAME --region $REGION --tail"
