#!/bin/bash

# Quick deployment script for frontend to Firebase Hosting
# Usage: ./deploy-frontend.sh

set -e

echo "🎨 Deploying Frontend to Firebase Hosting..."

# Check if firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI is not installed. Installing..."
    npm install -g firebase-tools
fi

# Navigate to frontend directory
cd "$(dirname "$0")/frontend/garne-pohlupak"

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Build for production
echo "🔨 Building for production..."
npm run build

# Deploy to Firebase
echo "🚀 Deploying to Firebase Hosting..."
firebase deploy --only hosting

echo ""
echo "✅ Deployment complete!"
echo ""
echo "🌐 Your frontend is live!"
echo "Run 'firebase hosting:channel:list' to see all channels"
