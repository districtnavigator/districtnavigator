#!/bin/bash

# Setup script for District Navigator
# This script helps you configure your Google Maps API key

echo "🗺️  District Navigator - Setup Script"
echo "======================================"
echo ""

# Check if index.html exists
if [ ! -f "index.html" ]; then
    echo "❌ Error: index.html not found in current directory"
    echo "Please run this script from the repository root."
    exit 1
fi

# Check if API key is already configured
if grep -q "YOUR_GOOGLE_MAPS_API_KEY" index.html; then
    echo "📝 Current status: API key not configured"
    echo ""
    
    # Ask for API key
    read -p "Enter your Google Maps API key (or press Enter to skip): " api_key
    
    if [ -z "$api_key" ]; then
        echo "⏭️  Skipped API key configuration"
        echo ""
        echo "ℹ️  To configure later, run this script again or manually edit index.html"
        exit 0
    fi
    
    # Backup original file
    cp index.html index.html.backup
    echo "💾 Created backup: index.html.backup"
    
    # Replace API key
    sed -i.tmp "s/YOUR_GOOGLE_MAPS_API_KEY/$api_key/g" index.html
    rm -f index.html.tmp
    
    echo "✅ API key configured successfully!"
    echo ""
else
    echo "✅ API key is already configured"
    echo ""
    read -p "Do you want to update it? (y/N): " update
    
    if [[ $update =~ ^[Yy]$ ]]; then
        read -p "Enter your new Google Maps API key: " api_key
        
        if [ -z "$api_key" ]; then
            echo "❌ No API key provided. Aborting."
            exit 1
        fi
        
        # Backup original file
        cp index.html index.html.backup
        echo "💾 Created backup: index.html.backup"
        
        # Replace any API key pattern
        sed -i.tmp "s/key=[A-Za-z0-9_-]*/key=$api_key/g" index.html
        rm -f index.html.tmp
        
        echo "✅ API key updated successfully!"
        echo ""
    else
        echo "⏭️  Skipped API key update"
        exit 0
    fi
fi

echo "🧪 Testing configuration..."
echo ""

# Check if the key looks valid
if grep -q "key=[A-Za-z0-9_-]\{30,\}" index.html; then
    echo "✅ API key format looks valid"
else
    echo "⚠️  Warning: API key format may be invalid"
fi

echo ""
echo "🚀 Next Steps:"
echo "1. Test locally: python3 -m http.server 8000"
echo "2. Open http://localhost:8000 in your browser"
echo "3. Verify the map loads and works correctly"
echo "4. Follow DEPLOYMENT.md for GitHub Pages deployment"
echo ""
echo "⚠️  IMPORTANT: Do NOT commit your API key to git!"
echo "   To prevent this, consider adding index.html to .gitignore"
echo ""
echo "📖 For more information, see:"
echo "   - DEPLOYMENT.md for deployment instructions"
echo "   - README.md for general documentation"
echo "   - QUICKSTART.md for quick start guide"
echo ""
