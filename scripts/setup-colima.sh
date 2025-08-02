#!/bin/bash

# Container Manager - Colima Setup Helper
# This script helps configure Colima for use with Container Manager

echo "🐳 Container Manager - Colima Setup Helper"
echo "=========================================="

# Check if Colima is installed
if ! command -v colima &> /dev/null; then
    echo "❌ Colima is not installed."
    echo "   Install with: brew install colima"
    exit 1
fi

echo "✅ Colima is installed"

# Check current Colima status
COLIMA_STATUS=$(colima status 2>/dev/null || echo "stopped")

if [[ $COLIMA_STATUS == *"running"* ]]; then
    echo "✅ Colima is currently running"
    
    # Check if API is enabled (port 2375)
    if lsof -i :2375 &> /dev/null; then
        echo "✅ Docker API is available on port 2375"
        echo "🎉 Your setup is ready! Container Manager should connect automatically."
        
        # Test the connection
        echo ""
        echo "Testing connection..."
        if curl -s http://localhost:2375/version > /dev/null; then
            echo "✅ Connection test successful!"
            echo ""
            echo "You can now use Container Manager with:"
            echo "   API URL: http://localhost:2375"
        else
            echo "❌ Connection test failed"
        fi
    else
        echo "⚠️  Docker API is not exposed on TCP port"
        echo ""
        echo "Choose your setup method:"
        echo ""
        echo "Option 1: Restart Colima with API enabled (Recommended)"
        echo "   colima stop"
        echo "   colima start --api --cpu 2 --memory 4"
        echo ""
        echo "Option 2: Create a proxy with socat"
        echo "   brew install socat  # if not installed"
        echo "   socat TCP-LISTEN:2375,reuseaddr,fork UNIX-CONNECT:$HOME/.colima/default/docker.sock &"
        echo ""
        echo "Option 3: Configure Container Manager for Unix socket (Electron only)"
        echo "   Socket path: $HOME/.colima/default/docker.sock"
    fi
else
    echo "❌ Colima is not running"
    echo ""
    echo "Start Colima with API enabled:"
    echo "   colima start --api --cpu 2 --memory 4"
fi

echo ""
echo "Current Docker context:"
docker context ls | head -2

echo ""
echo "For more help, see the Container Manager setup guide."
