#!/bin/bash
# Exit immediately if a command exits with a non-zero status
set -e

echo "[VNC Startup] Starting Xvfb virtual framebuffer on display :1..."
# Start Xvfb in the background
Xvfb :1 -screen 0 1280x1024x24 &
export DISPLAY=:1

# Wait for Xvfb to start
sleep 2

echo "[VNC Startup] Starting fluxbox window manager..."
# Start fluxbox in the background
fluxbox &

echo "[VNC Startup] Starting x11vnc server..."
# Start x11vnc in the background without password protection
x11vnc -display :1 -nopw -forever -shared -bg

echo "[VNC Startup] Starting noVNC web proxy..."
# Check for novnc_proxy executable paths
if command -v novnc_proxy >/dev/null 2>&1; then
    novnc_proxy --vnc localhost:5900 --listen 6080 &
elif [ -f /usr/share/novnc/utils/novnc_proxy ]; then
    /usr/share/novnc/utils/novnc_proxy --vnc localhost:5900 --listen 6080 &
else
    echo "Warning: novnc_proxy not found. VNC web access might be unavailable."
fi

echo "[VNC Startup] Launching FastAPI backend application..."
# Start FastAPI backend, replacing the shell process
exec uvicorn main:app --host 0.0.0.0 --port 8000
