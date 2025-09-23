#!/bin/bash

echo "🚀 Starting Usahaku AI Deployment..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ package.json not found. Are you in the project root?"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Type check
echo "🔍 Running type check..."
npm run typecheck

# Lint check
echo "🧹 Running linter..."
npm run lint

# Build the project
echo "🏗️ Building project..."
npm run build

echo "✅ Build successful!"
echo ""
echo "🎯 Next steps:"
echo "1. Push to GitHub: git add . && git commit -m 'Deploy MVP' && git push"
echo "2. Connect to Vercel: https://vercel.com"
echo "3. Add environment variables"
echo "4. Deploy!"
echo ""
echo "🌐 Your app will be live at: https://your-project.vercel.app"