#!/bin/bash

# Script to update statistics
# This can be run via cron job or manually

# Source .bashrc to get environment variables (works for both interactive and cron)
# Look for .bashrc in common locations
if [ -f ~/.bashrc ]; then
    source ~/.bashrc
    echo "Sourced ~/.bashrc for environment variables"
fi

# Source database credentials from a separate file if it exists
# This takes precedence over .bashrc
CREDENTIALS_FILE="$(dirname "$0")/db_credentials.env"
if [ -f "$CREDENTIALS_FILE" ]; then
    source "$CREDENTIALS_FILE"
    echo "Database credentials loaded from $CREDENTIALS_FILE"
fi

# Verify credentials are set
if [ -z "$DATABASE_USERNAME" ] || [ -z "$DATABASE_PASSWORD" ]; then
    echo "Error: DATABASE_USERNAME or DATABASE_PASSWORD not set!"
    echo ""
    echo "Troubleshooting:"
    echo "  1. Check if ~/.bashrc contains: export DATABASE_USERNAME=... and export DATABASE_PASSWORD=..."
    echo "  2. Or create $CREDENTIALS_FILE with export statements"
    echo ""
    echo "Current environment:"
    echo "  DATABASE_USERNAME=${DATABASE_USERNAME:-NOT SET}"
    echo "  DATABASE_PASSWORD=${DATABASE_PASSWORD:+SET (hidden)}${DATABASE_PASSWORD:-NOT SET}"
    exit 1
fi

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
