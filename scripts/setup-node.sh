#!/bin/bash

# Node.js Environment Setup Script for Container Manager
# This script checks Node.js setup without modifying your shell environment

echo "🔧 Checking Node.js environment..."

# Check if Node.js is available
if command -v node >/dev/null 2>&1; then
    echo "✅ Node.js found: $(node --version)"
    echo "✅ Location: $(which node)"
else
    echo "❌ Node.js not found in PATH"
    echo "💡 Please ensure Node.js is installed and available in your terminal"
    echo "💡 If using NVM with Oh My Zsh, make sure the NVM plugin is enabled"
    exit 1
fi

# Check if NPM is available
if command -v npm >/dev/null 2>&1; then
    echo "✅ NPM found: $(npm --version)"
else
    echo "❌ NPM not found in PATH"
    exit 1
fi

# Check .nvmrc compatibility
if [ -f ".nvmrc" ]; then
    REQUIRED_VERSION=$(cat .nvmrc)
    CURRENT_VERSION=$(node --version)
    echo "📋 Required Node.js version: $REQUIRED_VERSION"
    echo "📋 Current Node.js version: $CURRENT_VERSION"
    
    if [ "$CURRENT_VERSION" != "$REQUIRED_VERSION" ]; then
        echo "⚠️  Version mismatch detected"
        echo "💡 Run 'nvm use' in your terminal to switch to the required version"
    else
        echo "✅ Node.js version matches requirements"
    fi
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo "✅ Dependencies installed"
else
    echo "✅ Dependencies already installed"
fi

echo "🎉 Environment check complete!"
