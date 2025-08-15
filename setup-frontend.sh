#!/bin/bash
# Setup Frontend Service for Railway Deployment (Auto-configuration)

echo "🔧 Setting up frontend service files..."

# Copy frontend ignore file
cp .railwayignore.frontend .railwayignore
echo "✅ Copied .railwayignore.frontend to .railwayignore"

# Use Railway auto-detection (recommended approach)
if [ -f "nixpacks.toml" ]; then
    mv nixpacks.toml nixpacks.toml.backup
    echo "✅ Moved nixpacks.toml to nixpacks.toml.backup (using auto-detection)"
fi

echo "✅ Frontend configured for Railway's Node.js auto-detection"
echo ""
echo "🎯 Frontend setup complete!"
echo "Set this environment variable in Railway:"
echo "  VITE_API_BASE_URL=https://your-backend-domain.up.railway.app"
echo ""
echo "💡 Railway will automatically detect Node.js and run 'npm run build'"
echo "💡 Remember to update backend ALLOWED_ORIGINS after frontend deploys!"