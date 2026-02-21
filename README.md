# Raspi Monitor

<div align="center">

![License](https://img.shields.io/badge/License-MIT-blue.svg)
![Version](https://img.shields.io/badge/Version-1.0.0-green.svg)
![Node.js](https://img.shields.io/badge/Node.js-18+-339933.svg?logo=nodedotjs&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB.svg?logo=react&logoColor=black)
![Platform](https://img.shields.io/badge/Platform-Raspberry%20Pi-C51A4A.svg?logo=raspberrypi&logoColor=white)

Real-time system monitoring dashboard for Raspberry Pi with live WebSocket updates, historical charts, process management, and configurable alerts.

</div>

## Features

- **Live Metrics** — CPU, temperature, memory, disk, and network stats via WebSocket (1s refresh)
- **Historical Charts** — Interactive Recharts visualizations (1h / 6h / 24h / 7d)
- **Task Manager** — Sortable process list by CPU, RAM, and network usage
- **Alert System** — Configurable thresholds with active alert tracking
- **System Info** — Detailed hardware and OS information, service status, uptime
- **Fan & LED Control** — Raspberry Pi 5 fan monitoring, ACT/PWR LED management
- **REST API** — Full metrics and system API for external integrations
- **PWA** — Installable as standalone app, works behind reverse proxy
- **Reverse Proxy Ready** — Works seamlessly behind nginx (HashRouter, relative assets)

## Quick Start

```bash
# Clone the repository
git clone https://github.com/pepperonas/raspi-monitor.git
cd raspi-monitor

# Install dependencies
npm install
cd frontend && npm install && npm run build && cd ..
cd backend && npm install && cd ..

# Start with PM2
pm2 start ecosystem.config.js
```

The dashboard is available at `http://<pi-ip>:4999`.

## API

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Health check with DB status |
| `GET` | `/api/metrics` | Current system metrics |
| `GET` | `/api/metrics/latest` | Latest metric snapshot |
| `GET` | `/api/metrics/cpu` | CPU history |
| `GET` | `/api/metrics/memory` | Memory history |
| `GET` | `/api/metrics/disk` | Disk usage history |
| `GET` | `/api/metrics/network` | Network stats history |
| `GET` | `/api/system/info` | System hardware & OS info |
| `GET` | `/api/system/services` | Running services |
| `GET` | `/api/system/uptime` | Uptime information |
| `GET` | `/api/alerts` | Alert history |
| `GET` | `/api/alerts/active` | Currently active alerts |
| `PUT` | `/api/alerts/:id/resolve` | Resolve an alert |

WebSocket endpoint: `ws://<host>/ws` (via nginx) or `ws://<host>:4999` (direct)

## Tech Stack

- **Frontend** — React 18, Recharts, React Router (HashRouter), CSS Modules
- **Backend** — Node.js, Express, Winston logging, Helmet security
- **Database** — MySQL (metrics history, alerts)
- **Real-time** — WebSocket (ws) with auto-reconnect and REST fallback
- **Process Manager** — PM2 with memory limits and scheduled restarts

## Project Structure

```
raspi-monitor/
├── frontend/           # React 18 SPA
│   ├── src/
│   │   ├── components/ # Dashboard, Metrics, Charts, Alerts, Tasks
│   │   ├── config/     # API & WebSocket configuration
│   │   └── services/   # API client, WebSocket service
│   └── build/          # Production build (served by Express)
├── backend/
│   ├── src/
│   │   ├── routes/     # metrics, alerts, system API routes
│   │   └── services/   # MetricsCollector, AlertService, WebSocket
│   └── config/         # Database configuration
└── ecosystem.config.js # PM2 configuration
```

## Nginx Reverse Proxy

Works behind nginx with the following configuration:

```nginx
# Full app UI
location /app/monitor/ {
    proxy_pass http://127.0.0.1:4999/;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
}

# API proxy
location /api/ {
    proxy_pass http://127.0.0.1:4999/api/;
}

# WebSocket proxy
location /ws {
    proxy_pass http://127.0.0.1:4999;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
}
```

## Author

**Martin Pfeffer** — [celox.io](https://celox.io)

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
