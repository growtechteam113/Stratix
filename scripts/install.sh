#!/bin/bash

# STRATIX AI - Installation Script
# This script installs all dependencies for the monorepo

set -e

echo "🚀 STRATIX AI - Installation"
echo "================================"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install Node.js (v20+)"
    exit 1
fi

echo "✓ Node.js version: $(node --version)"
echo "✓ npm version: $(npm --version)"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

echo ""
echo "✅ Installation complete!"
echo ""
echo "Next steps:"
echo "  1. Run: npm run bootstrap"
echo "  2. Run: npm run dev"
