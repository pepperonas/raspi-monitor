-- Raspberry Pi Monitor Database Setup
-- Database: raspi_monitor

CREATE DATABASE IF NOT EXISTS raspi_monitor;
USE raspi_monitor;

-- System Information Table
CREATE TABLE IF NOT EXISTS system_info (
    id INT AUTO_INCREMENT PRIMARY KEY,
    hostname VARCHAR(255) NOT NULL,
    platform VARCHAR(100) NOT NULL,
    arch VARCHAR(50) NOT NULL,
    kernel VARCHAR(100) NOT NULL,
    uptime_seconds BIGINT NOT NULL,
    boot_time TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- CPU Metrics Table
CREATE TABLE IF NOT EXISTS cpu_metrics (
    id INT AUTO_INCREMENT PRIMARY KEY,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    cpu_usage_percent DECIMAL(5,2) NOT NULL,
    cpu_count INT NOT NULL,
    cpu_freq_current DECIMAL(10,2),
    cpu_freq_min DECIMAL(10,2),
    cpu_freq_max DECIMAL(10,2),
    cpu_temp_celsius DECIMAL(5,2),
    load_avg_1min DECIMAL(5,2),
    load_avg_5min DECIMAL(5,2),
    load_avg_15min DECIMAL(5,2),
    INDEX idx_timestamp (timestamp)
);

-- Memory Metrics Table
CREATE TABLE IF NOT EXISTS memory_metrics (
    id INT AUTO_INCREMENT PRIMARY KEY,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total_bytes BIGINT NOT NULL,
    available_bytes BIGINT NOT NULL,
    used_bytes BIGINT NOT NULL,
    free_bytes BIGINT NOT NULL,
    usage_percent DECIMAL(5,2) NOT NULL,
    swap_total_bytes BIGINT,
    swap_used_bytes BIGINT,
    swap_free_bytes BIGINT,
    swap_usage_percent DECIMAL(5,2),
    INDEX idx_timestamp (timestamp)
);

-- Disk Metrics Table
CREATE TABLE IF NOT EXISTS disk_metrics (
    id INT AUTO_INCREMENT PRIMARY KEY,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    filesystem VARCHAR(255) NOT NULL,
    mount_point VARCHAR(255) NOT NULL,
    total_bytes BIGINT NOT NULL,
    used_bytes BIGINT NOT NULL,
    available_bytes BIGINT NOT NULL,
    usage_percent DECIMAL(5,2) NOT NULL,
    inodes_total BIGINT,
    inodes_used BIGINT,
    inodes_free BIGINT,
    INDEX idx_timestamp (timestamp),
    INDEX idx_filesystem (filesystem)
);

-- Network Metrics Table
CREATE TABLE IF NOT EXISTS network_metrics (
    id INT AUTO_INCREMENT PRIMARY KEY,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    interface_name VARCHAR(100) NOT NULL,
    bytes_sent BIGINT NOT NULL,
    bytes_recv BIGINT NOT NULL,
    packets_sent BIGINT NOT NULL,
    packets_recv BIGINT NOT NULL,
    errors_in BIGINT DEFAULT 0,
    errors_out BIGINT DEFAULT 0,
    drops_in BIGINT DEFAULT 0,
    drops_out BIGINT DEFAULT 0,
    speed_mbps DECIMAL(10,2),
    duplex VARCHAR(20),
    mtu INT,
    INDEX idx_timestamp (timestamp),
    INDEX idx_interface (interface_name)
);

-- Process Metrics Table
CREATE TABLE IF NOT EXISTS process_metrics (
    id INT AUTO_INCREMENT PRIMARY KEY,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    running_processes INT NOT NULL,
    sleeping_processes INT NOT NULL,
    zombie_processes INT NOT NULL,
    total_processes INT NOT NULL,
    cpu_usage_percent DECIMAL(5,2),
    memory_usage_percent DECIMAL(5,2),
    INDEX idx_timestamp (timestamp)
);

-- GPU Metrics Table (for Pi 4 with GPU monitoring)
CREATE TABLE IF NOT EXISTS gpu_metrics (
    id INT AUTO_INCREMENT PRIMARY KEY,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    gpu_temp_celsius DECIMAL(5,2),
    gpu_memory_used_bytes BIGINT,
    gpu_memory_total_bytes BIGINT,
    gpu_usage_percent DECIMAL(5,2),
    INDEX idx_timestamp (timestamp)
);

-- Service Status Table
CREATE TABLE IF NOT EXISTS service_status (
    id INT AUTO_INCREMENT PRIMARY KEY,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    service_name VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL,
    cpu_usage_percent DECIMAL(5,2),
    memory_usage_mb DECIMAL(10,2),
    pid INT,
    restart_count INT DEFAULT 0,
    INDEX idx_timestamp (timestamp),
    INDEX idx_service (service_name)
);

-- Alerts Table
CREATE TABLE IF NOT EXISTS alerts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    alert_type VARCHAR(100) NOT NULL,
    severity ENUM('low', 'medium', 'high', 'critical') NOT NULL,
    message TEXT NOT NULL,
    metric_value DECIMAL(10,2),
    threshold_value DECIMAL(10,2),
    resolved BOOLEAN DEFAULT FALSE,
    resolved_at TIMESTAMP NULL,
    INDEX idx_timestamp (timestamp),
    INDEX idx_alert_type (alert_type),
    INDEX idx_severity (severity)
);

-- System Events Table
CREATE TABLE IF NOT EXISTS system_events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    event_type VARCHAR(100) NOT NULL,
    event_data JSON,
    description TEXT,
    INDEX idx_timestamp (timestamp),
    INDEX idx_event_type (event_type)
);

-- Create indexes for better performance
CREATE INDEX idx_cpu_metrics_timestamp ON cpu_metrics(timestamp DESC);
CREATE INDEX idx_memory_metrics_timestamp ON memory_metrics(timestamp DESC);
CREATE INDEX idx_disk_metrics_timestamp ON disk_metrics(timestamp DESC);
CREATE INDEX idx_network_metrics_timestamp ON network_metrics(timestamp DESC);

-- Create database user for the application
CREATE USER IF NOT EXISTS 'raspi_monitor'@'localhost' IDENTIFIED BY 'monitoring_secure_pass_2024';
GRANT ALL PRIVILEGES ON raspi_monitor.* TO 'raspi_monitor'@'localhost';
FLUSH PRIVILEGES;

-- Insert initial system info
INSERT INTO system_info (hostname, platform, arch, kernel, uptime_seconds, boot_time)
VALUES ('raspberrypi', 'linux', 'arm64', 'Linux 6.12.25+rpt-rpi-v8', 0, NOW())
ON DUPLICATE KEY UPDATE
    uptime_seconds = VALUES(uptime_seconds),
    boot_time = VALUES(boot_time);