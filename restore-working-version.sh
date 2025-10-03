#!/bin/bash

# Restore Working Version Script
# This script restores the working version of the AI Room Design App

echo "🔄 Restoring working version..."

# Checkout the working version
git checkout v1.0-working

# Install dependencies
echo "📦 Installing backend dependencies..."
cd backend && npm install

echo "📦 Installing frontend dependencies..."
cd ../frontend && npm install

echo "✅ Working version restored!"
echo ""
echo "🚀 To start the app:"
echo "1. Backend: cd backend && API_KEY=AIzaSyA2AxBiyGZ_miSX-zvxHh2vqg2bSI_IAfA node index.js"
echo "2. Frontend: cd frontend && npm run dev"
echo ""
echo "🌐 App will be available at: http://localhost:5173"
