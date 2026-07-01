#!/bin/bash
# Keep raspi_monitor metric tables at 30 days (bounded growth). Runs nightly as root
# (mysql socket auth). timestamp is indexed → the DELETE is fast.
for T in disk_metrics network_metrics memory_metrics cpu_metrics process_metrics gpu_metrics; do
  mysql raspi_monitor -e "SET @c=(SELECT MAX(timestamp) FROM ${T}); DELETE FROM ${T} WHERE timestamp < @c - INTERVAL 30 DAY;" 2>/dev/null
done
