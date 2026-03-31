#!/bin/bash

# STRATIX AI - Bootstrap Script
# This script sets up the local development environment

set -e

echo "🔧 STRATIX AI - Bootstrap"
echo "================================"

# Check if .env exists
if [ ! -f .env ]; then
    echo "📝 Creating .env from .env.example..."
    cp .env.example .env
    echo "✓ .env created. Please update with your local credentials."
else
    echo "✓ .env already exists"
fi

# Generate Prisma client
echo ""
echo "🔄 Generating Prisma client..."
npm run db:generate

# Push schema to database
echo ""
echo "📊 Pushing schema to database..."
npm run db:push

echo ""
echo "✅ Bootstrap complete!"
echo ""
echo "Next steps:"
echo "  1. Update .env with your database credentials if needed"
echo "  2. Run: npm run dev"
