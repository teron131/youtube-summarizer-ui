#!/bin/bash
# Setup Backend Service for Railway Deployment

echo "🔧 Setting up backend service files..."

# Copy backend ignore file
cp .railwayignore.backend .railwayignore
echo "✅ Copied .railwayignore.backend to .railwayignore"

# Ask user which approach to use
echo ""
echo "Choose deployment approach:"
echo "1) Auto-detection (recommended) - Railway detects Python automatically"
echo "2) Custom nixpacks - Use nixpacks.backend.toml"
read -p "Enter choice (1 or 2): " choice

if [ "$choice" = "1" ]; then
    # Remove nixpacks.toml to use auto-detection
    if [ -f "nixpacks.toml" ]; then
        mv nixpacks.toml nixpacks.toml.backup
        echo "✅ Moved nixpacks.toml to nixpacks.toml.backup"
    fi
    echo "✅ Backend will use Railway's Python auto-detection"
elif [ "$choice" = "2" ]; then
    # Copy backend nixpacks
    cp nixpacks.backend.toml nixpacks.toml
    echo "✅ Copied nixpacks.backend.toml to nixpacks.toml"
else
    echo "❌ Invalid choice"
    exit 1
fi

echo ""
echo "🎯 Backend setup complete!"
echo "Now set these environment variables in Railway:"
echo "  GEMINI_API_KEY=your_actual_key"
echo "  FAL_KEY=your_actual_key"
echo "  ALLOWED_ORIGINS=*"