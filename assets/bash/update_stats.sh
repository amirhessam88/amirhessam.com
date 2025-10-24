#!/bin/bash

# Script to update statistics
# This can be run via cron job or manually

# Set the absolute path to your website root
# Change this to your actual website path
WEBSITE_ROOT="/home/amirhessam/public_html"

# Change to website root directory
cd "$WEBSITE_ROOT" || {
    echo "Error: Could not change to website root directory: $WEBSITE_ROOT"
    exit 1
}

echo "Updating statistics..."
echo "Working directory: $(pwd)"
echo "PHP script path: assets/php/update_stats.php"

# Run the PHP script to update stats
php assets/php/update_stats.php

# Check if the JSON file was created successfully
if [ -f "assets/data/stats.json" ]; then
    echo "Statistics updated successfully!"
    echo "Contents of stats.json:"
    cat assets/data/stats.json
else
    echo "Error: stats.json was not created!"
    echo "Checking if assets/data directory exists..."
    ls -la assets/
    echo "Checking for any data directories..."
    find . -name "data" -type d
    echo "Checking for stats.json files..."
    find . -name "stats.json" -type f
    exit 1
fi
