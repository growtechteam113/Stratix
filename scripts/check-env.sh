#!/bin/bash

# STRATIX AI - Environment Check Script
# This script verifies that all required tools are installed

echo "🔍 STRATIX AI - Environment Check"
echo "=================================="

MISSING=0

# Check Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo "✓ Node.js: $NODE_VERSION"
else
    echo "❌ Node.js is not installed. Please install Node.js v20+"
    MISSING=1
fi

# Check npm
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo "✓ npm: $NPM_VERSION"
else
    echo "❌ npm is not installed"
    MISSING=1
fi

# Check PostgreSQL
if command -v psql &> /dev/null; then
    PG_VERSION=$(psql --version)
    echo "✓ PostgreSQL: $PG_VERSION"
else
    echo "❌ PostgreSQL is not installed. Please install PostgreSQL v14+"
    MISSING=1
fi

# Check Redis
if command -v redis-cli &> /dev/null; then
    REDIS_VERSION=$(redis-cli --version)
    echo "✓ Redis: $REDIS_VERSION"
else
    echo "⚠️  Redis is not installed. Background jobs will not work."
    echo "   Install with: brew install redis (macOS) or apt-get install redis-server (Linux)"
fi

# Check .env file
if [ -f .env ]; then
    echo "✓ .env file exists"
else
    echo "⚠️  .env file not found. Run: npm run bootstrap"
fi

echo ""
if [ $MISSING -eq 0 ]; then
    echo "✅ All required tools are installed!"
else
    echo "❌ Some required tools are missing. Please install them."
    exit 1
fi
