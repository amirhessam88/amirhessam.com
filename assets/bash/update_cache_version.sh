#!/bin/bash

# Script to update cache version numbers in HTML files
# This helps ensure new images and assets are loaded

echo "🔄 Updating cache version numbers..."

# Get current timestamp
CURRENT_VERSION=$(date +"%Y%m%d%H%M%S")

# Update index.html with new version numbers
if [ -f "index.html" ]; then
    echo "📝 Updating index.html with version: $CURRENT_VERSION"
    
    # Update main.js version
    sed -i.bak "s/main\.js?v=[0-9]*/main.js?v=$CURRENT_VERSION/g" index.html
    
    # Update cache-buster.js version
    sed -i.bak "s/cache-buster\.js?v=[0-9]*/cache-buster.js?v=$CURRENT_VERSION/g" index.html
    
    # Update CSS version
    sed -i.bak "s/style\.css?v=[0-9]*/style.css?v=$CURRENT_VERSION/g" index.html
    
    # Remove backup files
    rm -f index.html.bak
    
    echo "✅ Cache versions updated successfully!"
    echo "📊 New version: $CURRENT_VERSION"
else
    echo "❌ index.html not found!"
    exit 1
fi

# Optional: Update other HTML files if they exist
for file in publications/*.html; do
    if [ -f "$file" ]; then
        echo "📝 Updating $file with version: $CURRENT_VERSION"
        sed -i.bak "s/main\.js?v=[0-9]*/main.js?v=$CURRENT_VERSION/g" "$file"
        sed -i.bak "s/cache-buster\.js?v=[0-9]*/cache-buster.js?v=$CURRENT_VERSION/g" "$file"
        sed -i.bak "s/style\.css?v=[0-9]*/style.css?v=$CURRENT_VERSION/g" "$file"
        rm -f "$file.bak"
    fi
done

echo "🎉 All cache versions updated!"
echo "💡 Tip: Run this script whenever you update images or assets"
