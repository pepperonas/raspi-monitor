# Raspi Monitor

<div align="center">

![License](https://img.shields.io/badge/License-MIT-blue.svg)
![Node.js](https://img.shields.io/badge/Node.js-18+-339933.svg?logo=nodedotjs&logoColor=white)
![Platform](https://img.shields.io/badge/Platform-Raspberry%20Pi-C51A4A.svg?logo=raspberrypi&logoColor=white)

Real-time system monitoring dashboard for Raspberry Pi with historical data analysis and elegant web interface.

</div>

## Features

- **Live Metrics** — CPU usage, temperature, memory, and disk stats updated in real-time
- **Historical Data** — Track system performance over time with interactive charts
- **Web Dashboard** — Modern, responsive UI accessible from any device on the network
- **REST API** — Programmatic access to all system metrics
- **Alerts** — Configurable thresholds for temperature and resource usage
- **Low Overhead** — Minimal resource footprint designed for always-on monitoring

## Quick Start

```bash
# Clone the repository
git clone https://github.com/pepperonas/raspi-monitor.git
cd raspi-monitor

# Install dependencies
npm install

# Start the application
npm start
```

## API

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Health check |
| `/api/metrics` | GET | Current system metrics (CPU, temp, RAM, disk) |

## Tech Stack

- **Backend** — Node.js, Express
- **Frontend** — HTML5, CSS3, JavaScript
- **Process Manager** — PM2

## Author

**Martin Pfeffer** — [celox.io](https://celox.io)

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
