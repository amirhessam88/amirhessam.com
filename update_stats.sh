#!/bin/bash

# Script to update statistics
# This can be run via cron job or manually

echo "Updating statistics..."

# Run the PHP script to update stats
php update_stats.php

# Check if the JSON file was created successfully
if [ -f "assets/data/stats.json" ]; then
    echo "Statistics updated successfully!"
    echo "Contents of stats.json:"
    cat assets/data/stats.json
else
    echo "Error: stats.json was not created!"
    exit 1
fi
