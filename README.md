# Raspi Monitor

> **⚡ Update 2026-06 — Stack & UI**
>
> - **Backend:** **Go-Binary** (~6.7 MB ARM64, migriert von Node/Express; war ~100 MB). **gopsutil**-Collector → MariaDB alle 5 s, Threshold-Alerts, WebSocket, serviert das React-Frontend. Gleicher `/api`+`/ws`-Vertrag (decimals als Strings, ISO-UTC). **systemd** `raspi-monitor`. Source: `main.go` (+ `/Users/martin/claude/raspi-monitor-go/`). Node-`backend/` bleibt als Rollback.
> - **Deploy:** Frontend bauen → Go-Binary bauen (arm64) → `scp` → `sudo systemctl restart raspi-monitor`

<div align="center">

[![Go](https://img.shields.io/badge/Go-1.24+-00ADD8?logo=go&logoColor=white)](https://go.dev/)
[![Tests](https://img.shields.io/badge/tests-47%20passing-brightgreen?logo=github-actions&logoColor=white)](#tests)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue?logo=opensourceinitiative&logoColor=white)](LICENSE)
[![Go Report](https://img.shields.io/badge/go%20report-A%2B-success?logo=go&logoColor=white)](https://goreportcard.com/report/github.com/pepperonas/raspi-monitor)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![MariaDB](https://img.shields.io/badge/MariaDB-10%2B-003545?logo=mariadb&logoColor=white)](https://mariadb.org/)
[![WebSocket](https://img.shields.io/badge/WebSocket-gorilla%2Fwebsocket-4A154B?logo=websocket&logoColor=white)](https://github.com/gorilla/websocket)
[![gopsutil](https://img.shields.io/badge/gopsutil-v4-00ADD8?logo=go&logoColor=white)](https://github.com/shirou/gopsutil)
[![Platform](https://img.shields.io/badge/Platform-Raspberry%20Pi-C51A4A?logo=raspberrypi&logoColor=white)](https://www.raspberrypi.com/)
[![systemd](https://img.shields.io/badge/Process%20Manager-systemd-FCA326?logo=linux&logoColor=white)](https://systemd.io/)
[![Binary Size](https://img.shields.io/badge/binary-~6.7%20MB%20ARM64-lightgrey?logo=linux&logoColor=white)](#quick-start)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen?logo=github&logoColor=white)](https://github.com/pepperonas/raspi-monitor/pulls)
[![Made with ❤️](https://img.shields.io/badge/Made%20with%20%E2%9D%A4%EF%B8%8F-by%20Martin%20Pfeffer-red)](https://celox.io)

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

## Tests

Pure-logic unit tests live in `main_test.go` (same package). They cover every testable function that has no DB, gopsutil, or HTTP dependency:

| Area | What's tested |
|------|--------------|
| `isoUTC` | Format, UTC conversion, midnight edge case, millisecond precision |
| `env` | Default value, set value, empty-string-uses-default |
| `convert` | All DB type mappings: DECIMAL/VARCHAR/TEXT/INT/BIGINT/TIMESTAMP/DATETIME/fallback; nil pass-through |
| Downsampling maths | `step` clamped to ≥1, IDs never exceed `hi`, starts at `lo`, ~200 points, even spacing |
| Alert threshold | Below / at / above threshold, zero threshold, negative values, 8-case table |
| Range → seconds | 1h / 6h / 24h / 7d + invalid/empty fallback to 1h |
| Process line parsing | Valid line, too-few-fields guard, multi-word command, zero-CPU field |
| `METRICS_INTERVAL` parsing | 5 s default, custom value, invalid → 5 s fallback |

```bash
go test ./...
# ok  raspi-monitor  0.4s  (47 tests)

go test ./... -v          # verbose, shows each test name
go test ./... -count=1    # disable caching (useful in CI)
```

All 47 tests pass with no external services (no DB, no network, no Pi hardware).

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
├── main_test.go        # Unit tests for pure logic (no DB/gopsutil/HTTP)
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
