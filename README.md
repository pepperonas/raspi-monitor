# Raspi Monitor

> **⚡ Update 2026-06 — Stack & UI**
>
> - **Backend:** **Go-Binary** (~6.7 MB ARM64, migriert von Node/Express; war ~100 MB). **gopsutil**-Collector → MariaDB alle 5 s, Threshold-Alerts, WebSocket, serviert das React-Frontend. Gleicher `/api`+`/ws`-Vertrag (decimals als Strings, ISO-UTC). **systemd** `raspi-monitor`. Source: `main.go` (+ `/Users/martin/claude/raspi-monitor-go/`). Node-`backend/` bleibt als Rollback.
> - **Deploy:** Frontend bauen → Go-Binary bauen (arm64) → `scp` → `sudo systemctl restart raspi-monitor`

<div align="center">

![License](https://img.shields.io/badge/License-MIT-blue.svg)
![Version](https://img.shields.io/badge/Version-1.0.0-green.svg)
![Go](https://img.shields.io/badge/Go-1.24-00ADD8.svg?logo=go&logoColor=white)
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

The backend is a single self-contained **Go binary** (`raspi-monitor`) run under **systemd** — there is no Node.js runtime or PM2 in production. The React frontend is still built with npm and served by the Go binary from `frontend/build/`.

```bash
# Clone the repository
git clone https://github.com/pepperonas/raspi-monitor.git
cd raspi-monitor

# 1. Build the React frontend (served by the Go binary)
cd frontend && npm install && npm run build && cd ..

# 2. Build the Go backend binary
go build -ldflags "-s -w" -o raspi-monitor .
# Cross-compile for the Pi (ARM64) from another machine:
#   GOOS=linux GOARCH=arm64 go build -ldflags "-s -w" -o raspi-monitor .
```

Run it via systemd (`raspi-monitor.service`):

```ini
[Service]
User=pi
Environment=PORT=4999
Environment=FRONTEND_DIR=/home/pi/apps/raspi-monitor/frontend/build
WorkingDirectory=/home/pi/apps/raspi-monitor
ExecStart=/home/pi/apps/raspi-monitor/raspi-monitor
Restart=on-failure
```

```bash
sudo systemctl enable --now raspi-monitor
sudo journalctl -u raspi-monitor -f   # logs
```

The dashboard is available at `http://<pi-ip>:4999`.

### Deploy an update

```bash
# Rebuild the frontend (if changed)
cd frontend && npm run build && cd ..

# Rebuild + ship the Go binary, then restart the service
GOOS=linux GOARCH=arm64 go build -ldflags "-s -w" -o raspi-monitor .
scp raspi-monitor <pi>:/home/pi/apps/raspi-monitor/raspi-monitor
ssh <pi> 'sudo systemctl restart raspi-monitor'
```

> **Legacy / rollback:** the original Node.js/Express backend lives in `backend/` (with `ecosystem.config.js` for PM2). It is **kept only as a rollback** and is not the active production stack.

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
- **Backend** — Go (single static binary), [gopsutil](https://github.com/shirou/gopsutil) metrics collector, [gorilla/websocket](https://github.com/gorilla/websocket); serves the React build + the `/api`+`/ws` endpoints
- **Database** — MariaDB / MySQL (`raspi_monitor` DB — metrics history, alerts) via `go-sql-driver/mysql`
- **Real-time** — WebSocket with auto-reconnect and REST fallback
- **Process Manager** — **systemd** service `raspi-monitor` (port 4999)

## Project Structure

```
raspi-monitor/
├── main.go             # Go backend: gopsutil collector + /api + /ws + static server
├── go.mod / go.sum     # Go module + dependencies
├── raspi-monitor       # Prebuilt Go binary (ARM64, deployed artifact)
├── raspi-monitor.service  # systemd unit
├── frontend/           # React 18 SPA
│   ├── src/
│   │   ├── components/ # Dashboard, Metrics, Charts, Alerts, Tasks
│   │   ├── config/     # API & WebSocket configuration
│   │   └── services/   # API client, WebSocket service
│   └── build/          # Production build (served by the Go binary)
└── backend/            # LEGACY Node.js/Express backend — rollback only
    ├── src/
    │   ├── routes/     # metrics, alerts, system API routes
    │   └── services/   # MetricsCollector, AlertService, WebSocket
    └── config/         # (ecosystem.config.js = old PM2 config, legacy)
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
