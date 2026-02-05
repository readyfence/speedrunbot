#!/bin/bash

# Script to start both Minecraft server and bot
# Run this to get everything started quickly

echo "🚀 Starting Minecraft Server and Bot..."
echo ""

# Check if server directory exists
if [ ! -d "/Users/Huxley/minecraft-server" ]; then
    echo "❌ Server directory not found!"
    exit 1
fi

# Check if bot directory exists
if [ ! -d "/Users/Huxley/minecraft-speedrun-ai" ]; then
    echo "❌ Bot directory not found!"
    exit 1
fi

# Start server in background
echo "📦 Starting Minecraft server..."
cd /Users/Huxley/minecraft-server
./start-server.sh > server.log 2>&1 &
SERVER_PID=$!

echo "✅ Server started (PID: $SERVER_PID)"
echo "⏳ Waiting for server to initialize (30 seconds)..."
sleep 30

# Check if server is running
if ! ps -p $SERVER_PID > /dev/null; then
    echo "❌ Server failed to start! Check server.log"
    exit 1
fi

# Check if port is listening
if ! lsof -i :25565 > /dev/null 2>&1; then
    echo "⚠️  Server may not be ready yet. Waiting a bit more..."
    sleep 10
fi

# Start bot
echo ""
echo "🤖 Starting bot..."
cd /Users/Huxley/minecraft-speedrun-ai

# Check which bot to run
if [ "$1" == "ai" ]; then
    echo "Using AI-enhanced bot..."
    npm run start-ai
else
    echo "Using simple bot..."
    npm run start-simple
fi

# Cleanup on exit
trap "echo ''; echo '🛑 Stopping server...'; kill $SERVER_PID 2>/dev/null; exit" INT TERM
