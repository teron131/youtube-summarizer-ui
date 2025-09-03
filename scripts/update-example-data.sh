#!/bin/bash

# Update Example Data Script
# =========================
#
# Quick script to update example-data.ts with a specific YouTube URL
#
# Usage: ./scripts/update-example-data.sh

# Set the YouTube URL
YOUTUBE_URL="https://www.youtube.com/watch?v=P_fHJIYENdI"

echo "🚀 Updating example data with URL: $YOUTUBE_URL"
echo ""

# Check if backend is running
if ! curl -s http://localhost:8080/health > /dev/null; then
    echo "❌ Backend server not running on localhost:8080"
    echo "Please start the backend server first:"
    echo "  cd youtube-summarizer && python -m uvicorn app:app --reload"
    exit 1
fi

# Check environment variables
if [ -z "$GEMINI_API_KEY" ]; then
    echo "❌ GEMINI_API_KEY environment variable not set"
    echo "Please set it in your .env file or export it:"
    echo "  export GEMINI_API_KEY=your_key_here"
    exit 1
fi

if [ -z "$APIFY_API_KEY" ]; then
    echo "❌ APIFY_API_KEY environment variable not set"
    echo "Please set it in your .env file or export it:"
    echo "  export APIFY_API_KEY=your_key_here"
    exit 1
fi

# Run the update script
node scripts/update-example-data.js "$YOUTUBE_URL"
