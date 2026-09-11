# Use python-slim base image matching local environment
FROM python:3.12-slim

# Install system dependencies for VNC, virtual framebuffer, and utilities
RUN apt-get update && apt-get install -y \
    xvfb \
    x11vnc \
    fluxbox \
    novnc \
    websockify \
    curl \
    procps \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Install Playwright Chromium browser and its system dependencies
RUN playwright install chromium
RUN playwright install-deps chromium

# Copy application files
COPY . .

# Copy and set entrypoint script permissions
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Expose ports:
# 8000: FastAPI
# 6080: noVNC web interface
EXPOSE 8000 6080

ENTRYPOINT ["/entrypoint.sh"]
