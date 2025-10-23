#!/bin/bash

# Mave CMS - Quick Setup Script
# Run this script to set up the project quickly

set -e  # Exit on error

echo "🚀 Mave CMS - Setup Starting..."
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 20+ first."
    exit 1
fi

echo "✅ Node.js version: $(node --version)"

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo "📦 Installing pnpm..."
    npm install -g pnpm
fi

echo "✅ pnpm version: $(pnpm --version)"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
pnpm install

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo ""
    echo "📝 Creating .env file..."
    cp env.example .env
    echo "✅ .env file created. Please update it with your configuration."
else
    echo "✅ .env file already exists."
fi

# Generate Prisma Client
echo ""
echo "🔨 Generating Prisma Client..."
pnpm prisma generate

# Ask if user wants to run migrations
echo ""
read -p "Do you want to run database migrations now? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🗄️  Running database migrations..."
    pnpm prisma migrate dev --name init
    echo "✅ Migrations completed!"
else
    echo "⏭️  Skipping migrations. You can run them later with: pnpm prisma migrate dev"
fi

# Create necessary directories
echo ""
echo "📁 Creating directories..."
mkdir -p logs
mkdir -p uploads
mkdir -p src/modules
mkdir -p src/common
mkdir -p src/config
mkdir -p src/database

echo ""
echo "✨ Setup complete!"
echo ""
echo "📋 Next steps:"
echo "  1. Update your .env file with your database credentials"
echo "  2. Run: pnpm prisma migrate dev (if you skipped it)"
echo "  3. Run: pnpm run start:dev"
echo "  4. Visit: http://localhost:7845/graphql"
echo ""
echo "🎉 Happy coding!"

