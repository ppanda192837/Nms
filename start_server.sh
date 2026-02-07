#!/bin/bash

# Kill any existing server on port 8443
echo "Checking for existing server..."
PID=$(lsof -ti:8443)
if [ ! -z "$PID" ]; then
    echo "Killing existing server (PID: $PID)..."
    kill -9 $PID
    sleep 1
fi

# Start the server
echo "Starting News Management Server..."
cd /workspaces/Nms
python3 server.py --no-ssl
