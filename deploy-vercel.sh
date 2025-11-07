#!/bin/bash

# PhotoPileMemory - Vercel Deployment Script
# Run this after setting up your Vercel project

echo "🚀 PhotoPileMemory - Vercel Deployment Helper"
echo "=============================================="
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Not in project root directory"
    echo "Please run this from /home/user/PhotoPileMemory"
    exit 1
fi

echo "✅ Project directory verified"
echo ""

# Check if vercel CLI is available
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel

    if [ $? -ne 0 ]; then
        echo "❌ Failed to install Vercel CLI"
        echo "💡 Try: sudo npm install -g vercel"
        echo "Or use npx: npx vercel deploy --prod"
        exit 1
    fi
fi

echo "✅ Vercel CLI ready"
echo ""

# Check for DATABASE_URL
if [ -z "$DATABASE_URL" ]; then
    echo "⚠️  WARNING: DATABASE_URL not set"
    echo ""
    echo "Before deploying, you need:"
    echo "1. Create a database at https://neon.tech (free)"
    echo "2. Get your connection string"
    echo "3. Add it to Vercel:"
    echo "   - Go to your project settings"
    echo "   - Environment Variables"
    echo "   - Add DATABASE_URL"
    echo ""
    read -p "Have you set up DATABASE_URL in Vercel? (y/n) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Please set up DATABASE_URL first"
        echo "Visit: https://vercel.com/dashboard"
        exit 1
    fi
fi

echo "🔨 Building project..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    exit 1
fi

echo "✅ Build successful"
echo ""

echo "🚀 Deploying to Vercel..."
vercel deploy --prod

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 Deployment successful!"
    echo ""
    echo "Next steps:"
    echo "1. Initialize database: Run this with your production DATABASE_URL:"
    echo "   DATABASE_URL='your-prod-url' npm run db:push"
    echo ""
    echo "2. Test your deployment"
    echo "3. Share your birthday page!"
else
    echo "❌ Deployment failed"
    echo "Check the error messages above"
fi
