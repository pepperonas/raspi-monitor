#!/bin/bash

# Pre-start script for Raspberry Pi Monitor
# This script runs before the main application starts

echo "🚀 Pre-start script for Raspberry Pi Monitor"
echo "📅 $(date)"

# Create necessary directories
echo "📁 Creating necessary directories..."
mkdir -p /home/martin/apps/raspi-monitor/backend/logs
mkdir -p /home/martin/apps/raspi-monitor/frontend/build

# Set proper permissions
echo "🔧 Setting permissions..."
chmod 755 /home/martin/apps/raspi-monitor/backend/logs
chmod 755 /home/martin/apps/raspi-monitor/frontend/build

# Check if database is accessible
echo "🗄️ Checking database connection..."
mysql -u raspi_monitor -pmonitoring_secure_pass_2024 -e "SELECT 1 FROM raspi_monitor.system_info LIMIT 1;" 2>/dev/null

if [ $? -eq 0 ]; then
    echo "✅ Database connection successful"
else
    echo "❌ Database connection failed"
    echo "💡 Please ensure MySQL is running and database is set up:"
    echo "   mysql -u root -p < /home/martin/apps/raspi-monitor/database/setup.sql"
    exit 1
fi

# Check if vcgencmd is available (for GPU monitoring)
echo "🎮 Checking GPU monitoring capabilities..."
if command -v vcgencmd &> /dev/null; then
    echo "✅ vcgencmd available - GPU monitoring enabled"
else
    echo "⚠️ vcgencmd not available - GPU monitoring disabled"
fi

# Check system requirements
echo "🔍 Checking system requirements..."
echo "Node.js version: $(node --version)"
echo "NPM version: $(npm --version)"
echo "Free memory: $(free -h | grep '^Mem:' | awk '{print $7}')"
echo "Disk space: $(df -h / | tail -1 | awk '{print $4}' | sed 's/G/ GB/')"

# Test critical system commands
echo "🧪 Testing system monitoring capabilities..."
commands=("top" "ps" "df" "free" "uptime" "cat /proc/cpuinfo" "cat /proc/meminfo")

for cmd in "${commands[@]}"; do
    if eval "$cmd" &> /dev/null; then
        echo "✅ $cmd - OK"
    else
        echo "❌ $cmd - FAILED"
    fi
done

# Clean up old logs if they exist
echo "🧹 Cleaning up old logs..."
find /home/martin/apps/raspi-monitor/backend/logs -name "*.log" -type f -mtime +7 -delete 2>/dev/null || true

# Check if port 4999 is available
echo "🔌 Checking port 4999 availability..."
if ss -tuln | grep -q ':4999 '; then
    echo "⚠️ Port 4999 is already in use"
    echo "🔍 Process using port 4999:"
    ss -tulpn | grep ':4999 '
else
    echo "✅ Port 4999 is available"
fi

# Set environment variables if not already set
export NODE_ENV=${NODE_ENV:-production}
export PORT=${PORT:-4999}

echo "🏁 Pre-start script completed successfully"
echo "🌟 Starting Raspberry Pi Monitor on port $PORT..."
echo "📊 Dashboard will be available at: http://localhost:$PORT"
echo "🔧 API will be available at: http://localhost:$PORT/api"
echo "=================================="