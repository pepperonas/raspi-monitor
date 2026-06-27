// Raspi Monitor backend — Go replacement for the Node/Express+PM2 app.
// Collects system metrics via gopsutil into MariaDB every METRICS_INTERVAL,
// raises threshold alerts, serves the existing React build, and exposes the same
// /api + /ws contract the frontend expects. Faithful to the Node JSON shapes
// (decimals as strings, timestamps as ISO-8601 UTC, bigints as numbers).
package main

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/exec"
	"strconv"
	"strings"
	"sync"
	"time"

	_ "github.com/go-sql-driver/mysql"
	"github.com/gorilla/websocket"
	"github.com/shirou/gopsutil/v4/cpu"
	"github.com/shirou/gopsutil/v4/disk"
	"github.com/shirou/gopsutil/v4/host"
	"github.com/shirou/gopsutil/v4/load"
	"github.com/shirou/gopsutil/v4/mem"
	"github.com/shirou/gopsutil/v4/net"
	"github.com/shirou/gopsutil/v4/process"
)

var (
	db          *sql.DB
	startTime   = time.Now()
	frontendDir string
	hub         = &wsHub{conns: map[*websocket.Conn]bool{}}
)

func env(k, def string) string {
	if v := os.Getenv(k); v != "" {
		return v
	}
	return def
}

func isoUTC(t time.Time) string { return t.UTC().Format("2006-01-02T15:04:05.000Z") }

// ---- generic row → map with Node-compatible type mapping --------------------
func convert(v any, dbType string) any {
	if v == nil {
		return nil
	}
	switch dbType {
	case "DECIMAL", "VARCHAR", "TEXT", "ENUM", "CHAR":
		if b, ok := v.([]byte); ok {
			return string(b)
		}
	case "INT", "BIGINT", "TINYINT", "SMALLINT", "MEDIUMINT", "UNSIGNED INT", "UNSIGNED BIGINT":
		switch x := v.(type) {
		case int64:
			return x
		case []byte:
			n, _ := strconv.ParseInt(string(x), 10, 64)
			return n
		}
	case "TIMESTAMP", "DATETIME", "DATE":
		switch x := v.(type) {
		case time.Time:
			return isoUTC(x)
		case []byte:
			if t, err := time.Parse("2006-01-02 15:04:05", string(x)); err == nil {
				return isoUTC(t)
			}
			return string(x)
		}
	}
	if b, ok := v.([]byte); ok {
		return string(b)
	}
	return v
}

func queryRows(q string, args ...any) ([]map[string]any, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 8*time.Second)
	defer cancel()
	rows, err := db.QueryContext(ctx, q, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	cols, _ := rows.Columns()
	types, _ := rows.ColumnTypes()
	out := []map[string]any{}
	for rows.Next() {
		vals := make([]any, len(cols))
		ptrs := make([]any, len(cols))
		for i := range vals {
			ptrs[i] = &vals[i]
		}
		if err := rows.Scan(ptrs...); err != nil {
			return nil, err
		}
		m := map[string]any{}
		for i, c := range cols {
			m[c] = convert(vals[i], types[i].DatabaseTypeName())
		}
		out = append(out, m)
	}
	return out, nil
}

func latest(table string) map[string]any {
	rows, err := queryRows("SELECT * FROM " + table + " ORDER BY timestamp DESC LIMIT 1")
	if err != nil || len(rows) == 0 {
		return nil
	}
	return rows[0]
}

func writeJSON(w http.ResponseWriter, code int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	json.NewEncoder(w).Encode(v)
}

// ---- collector --------------------------------------------------------------
func collectOnce() {
	now := time.Now().UTC()

	// CPU
	pct, _ := cpu.Percent(0, false)
	usage := 0.0
	if len(pct) > 0 {
		usage = pct[0]
	}
	cnt, _ := cpu.Counts(true)
	var freqCur, freqMin, freqMax float64
	if info, err := cpu.Info(); err == nil && len(info) > 0 {
		freqCur = info[0].Mhz
	}
	if b, err := os.ReadFile("/sys/devices/system/cpu/cpu0/cpufreq/scaling_cur_freq"); err == nil {
		if khz, e := strconv.ParseFloat(strings.TrimSpace(string(b)), 64); e == nil {
			freqCur = khz / 1000
		}
	}
	if b, err := os.ReadFile("/sys/devices/system/cpu/cpu0/cpufreq/scaling_min_freq"); err == nil {
		if khz, e := strconv.ParseFloat(strings.TrimSpace(string(b)), 64); e == nil {
			freqMin = khz / 1000
		}
	}
	if b, err := os.ReadFile("/sys/devices/system/cpu/cpu0/cpufreq/scaling_max_freq"); err == nil {
		if khz, e := strconv.ParseFloat(strings.TrimSpace(string(b)), 64); e == nil {
			freqMax = khz / 1000
		}
	}
	temp := 0.0
	if b, err := os.ReadFile("/sys/class/thermal/thermal_zone0/temp"); err == nil {
		if mC, e := strconv.ParseFloat(strings.TrimSpace(string(b)), 64); e == nil {
			temp = mC / 1000
		}
	}
	db.Exec(`INSERT INTO cpu_metrics (timestamp,cpu_usage_percent,cpu_count,cpu_freq_current,cpu_freq_min,cpu_freq_max,cpu_temp_celsius) VALUES (?,?,?,?,?,?,?)`,
		now, usage, cnt, freqCur, freqMin, freqMax, temp)

	// Memory
	if vm, err := mem.VirtualMemory(); err == nil {
		sw, _ := mem.SwapMemory()
		db.Exec(`INSERT INTO memory_metrics (timestamp,total_bytes,available_bytes,used_bytes,free_bytes,usage_percent,swap_total_bytes,swap_used_bytes,swap_free_bytes,swap_usage_percent) VALUES (?,?,?,?,?,?,?,?,?,?)`,
			now, vm.Total, vm.Available, vm.Used, vm.Free, vm.UsedPercent, sw.Total, sw.Used, sw.Free, sw.UsedPercent)
		checkAlert("memory_usage_high", "medium", vm.UsedPercent, 85, fmt.Sprintf("Memory usage is %.2f%% (threshold: 85%%)", vm.UsedPercent))
	}

	// Disk (physical partitions)
	if parts, err := disk.Partitions(false); err == nil {
		for _, p := range parts {
			if u, e := disk.Usage(p.Mountpoint); e == nil && u.Total > 0 {
				db.Exec(`INSERT INTO disk_metrics (timestamp,filesystem,mount_point,total_bytes,used_bytes,available_bytes,usage_percent) VALUES (?,?,?,?,?,?,?)`,
					now, p.Device, p.Mountpoint, u.Total, u.Used, u.Free, u.UsedPercent)
			}
		}
	}

	// Network
	if ifs, err := net.IOCounters(true); err == nil {
		for _, n := range ifs {
			if n.Name == "lo" {
				continue
			}
			db.Exec(`INSERT INTO network_metrics (timestamp,interface_name,bytes_sent,bytes_recv,packets_sent,packets_recv,errors_in,errors_out,drops_in,drops_out,mtu) VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
				now, n.Name, n.BytesSent, n.BytesRecv, n.PacketsSent, n.PacketsRecv, n.Errin, n.Errout, n.Dropin, n.Dropout, 1500)
		}
	}

	// GPU (no direct access on Pi → null, matches Node)
	db.Exec(`INSERT INTO gpu_metrics (timestamp,gpu_temp_celsius,gpu_memory_used_bytes,gpu_memory_total_bytes,gpu_usage_percent) VALUES (?,NULL,NULL,NULL,NULL)`, now)

	// Process counts
	running, sleeping, zombie, total := procCounts()
	db.Exec(`INSERT INTO process_metrics (timestamp,running_processes,sleeping_processes,zombie_processes,total_processes,cpu_usage_percent,memory_usage_percent) VALUES (?,?,?,?,?,?,?)`,
		now, running, sleeping, zombie, total, 0.0, 0.0)
}

func procCounts() (running, sleeping, zombie, total int) {
	ps, err := process.Processes()
	if err != nil {
		return
	}
	total = len(ps)
	for _, p := range ps {
		st, _ := p.Status()
		for _, s := range st {
			switch s {
			case "running", "R":
				running++
			case "sleep", "S":
				sleeping++
			case "zombie", "Z":
				zombie++
			}
		}
	}
	return
}

// rate-limited alert insert (no duplicate unresolved alert of a type within 10 min)
func checkAlert(typ, severity string, value, threshold float64, msg string) {
	if value <= threshold {
		return
	}
	var n int
	db.QueryRow(`SELECT COUNT(*) FROM alerts WHERE alert_type=? AND resolved=0 AND timestamp > (UTC_TIMESTAMP() - INTERVAL 10 MINUTE)`, typ).Scan(&n)
	if n > 0 {
		return
	}
	db.Exec(`INSERT INTO alerts (timestamp,alert_type,severity,message,metric_value,threshold_value,resolved) VALUES (UTC_TIMESTAMP(),?,?,?,?,?,0)`,
		typ, severity, msg, value, threshold)
}

// ---- HTTP handlers ----------------------------------------------------------
func hMetrics(w http.ResponseWriter, r *http.Request) {
	wrap := func(m map[string]any) []any {
		if m == nil {
			return []any{}
		}
		return []any{m}
	}
	cpuRow := latest("cpu_metrics")
	if cpuRow != nil {
		if l, err := load.Avg(); err == nil {
			cpuRow["load_avg_1min"] = l.Load1
			cpuRow["load_avg_5min"] = l.Load5
			cpuRow["load_avg_15min"] = l.Load15
		}
	}
	gpuRow := latest("gpu_metrics")
	if gpuRow != nil {
		gpuRow["fan_status"] = map[string]any{"level": nil, "status": "unknown", "description": "Fan status unavailable"}
	}
	writeJSON(w, 200, map[string]any{
		"cpu":       wrap(cpuRow),
		"memory":    wrap(latest("memory_metrics")),
		"disk":      wrap(latest("disk_metrics")),
		"network":   wrap(latest("network_metrics")),
		"processes": wrap(latest("process_metrics")),
		"gpu":       wrap(gpuRow),
		"timestamp": isoUTC(time.Now()),
	})
}

func hCharts(w http.ResponseWriter, r *http.Request) {
	rng := r.URL.Query().Get("range")
	if rng == "" {
		rng = "1h"
	}
	dur := map[string]time.Duration{"1h": time.Hour, "6h": 6 * time.Hour, "24h": 24 * time.Hour, "7d": 7 * 24 * time.Hour}[rng]
	if dur == 0 {
		dur = time.Hour
	}
	end := time.Now().UTC()
	start := end.Add(-dur)
	secs := int(dur.Seconds())
	// Downsample by SAMPLING ~targetPoints evenly-spaced rows by primary key.
	// Grouping/AVG over the full window (122k rows for 7d) caused a 32s full
	// table scan; reading ~200 rows by PK (IN-list) is sub-100ms and spans the
	// whole range. Rows are inserted at a fixed interval, so even id-spacing ≈
	// even time-spacing.
	const targetPoints = 200
	series := func(table, col string) []map[string]any {
		out := []map[string]any{}
		var lo, hi sql.NullInt64
		// first id in the window (uses the timestamp index) + latest id (instant)
		db.QueryRow(fmt.Sprintf("SELECT id FROM %s WHERE timestamp >= (UTC_TIMESTAMP() - INTERVAL %d SECOND) ORDER BY timestamp ASC LIMIT 1", table, secs)).Scan(&lo)
		db.QueryRow(fmt.Sprintf("SELECT MAX(id) FROM %s", table)).Scan(&hi)
		if !lo.Valid || !hi.Valid || hi.Int64 <= lo.Int64 {
			return out
		}
		step := (hi.Int64 - lo.Int64) / targetPoints
		if step < 1 {
			step = 1
		}
		var sb strings.Builder
		for id := lo.Int64; id <= hi.Int64; id += step {
			if sb.Len() > 0 {
				sb.WriteByte(',')
			}
			sb.WriteString(strconv.FormatInt(id, 10))
		}
		q := fmt.Sprintf("SELECT timestamp, %s AS v FROM %s WHERE id IN (%s) ORDER BY id ASC", col, table, sb.String())
		rows, err := queryRows(q)
		if err != nil {
			return out
		}
		for _, row := range rows {
			val := 0.0
			switch x := row["v"].(type) {
			case string:
				val, _ = strconv.ParseFloat(x, 64)
			case int64:
				val = float64(x)
			case float64:
				val = x
			}
			out = append(out, map[string]any{"timestamp": row["timestamp"], "value": val})
		}
		return out
	}
	writeJSON(w, 200, map[string]any{
		"range": rng, "startTime": isoUTC(start), "endTime": isoUTC(end),
		"data": map[string]any{
			"cpu":         series("cpu_metrics", "cpu_usage_percent"),
			"memory":      series("memory_metrics", "usage_percent"),
			"temperature": series("cpu_metrics", "cpu_temp_celsius"),
			"network":     series("network_metrics", "bytes_recv"),
		},
	})
}

func hAlerts(w http.ResponseWriter, r *http.Request) {
	rows, err := queryRows("SELECT * FROM alerts ORDER BY timestamp DESC LIMIT 50")
	if err != nil {
		writeJSON(w, 500, map[string]any{"error": err.Error()})
		return
	}
	writeJSON(w, 200, map[string]any{"alerts": rows})
}

func hHealth(w http.ResponseWriter, r *http.Request) {
	dbState := "connected"
	if db.Ping() != nil {
		dbState = "disconnected"
	}
	writeJSON(w, 200, map[string]any{
		"status": "healthy", "timestamp": isoUTC(time.Now()), "database": dbState,
		"uptime": time.Since(startTime).Seconds(), "version": "2.0.0-go",
	})
}

func hProcesses(w http.ResponseWriter, r *http.Request) {
	out, _ := exec.Command("ps", "aux", "--sort=-%cpu", "--no-headers").Output()
	procs := []map[string]any{}
	for i, line := range strings.Split(strings.TrimSpace(string(out)), "\n") {
		if i >= 30 || line == "" {
			break
		}
		f := strings.Fields(line)
		if len(f) < 11 {
			continue
		}
		pid, _ := strconv.Atoi(f[1])
		cpuP, _ := strconv.ParseFloat(f[2], 64)
		memP, _ := strconv.ParseFloat(f[3], 64)
		vsz, _ := strconv.ParseInt(f[4], 10, 64)
		rss, _ := strconv.ParseInt(f[5], 10, 64)
		procs = append(procs, map[string]any{
			"pid": pid, "user": f[0], "cpu": cpuP, "memory": memP, "vsz": vsz, "rss": rss,
			"tty": f[6], "stat": f[7], "start": f[8], "time": f[9],
			"command": strings.Join(f[10:], " "),
		})
	}
	writeJSON(w, 200, map[string]any{"processes": procs})
}

func hLEDControl(w http.ResponseWriter, r *http.Request) {
	var body struct{ Led, Action string }
	json.NewDecoder(r.Body).Decode(&body)
	if body.Led == "" {
		body.Led = "ACT"
	}
	brightness := "0"
	if body.Action == "on" {
		brightness = "1"
	}
	path := "/sys/class/leds/" + body.Led + "/brightness"
	if err := os.WriteFile(path, []byte(brightness), 0o644); err != nil {
		writeJSON(w, 500, map[string]any{"success": false, "error": err.Error()})
		return
	}
	writeJSON(w, 200, map[string]any{"success": true, "led": body.Led, "action": body.Action})
}

func hUptime(w http.ResponseWriter, r *http.Request) {
	ut, _ := host.Uptime()
	l, _ := load.Avg()
	writeJSON(w, 200, map[string]any{
		"uptime_seconds": ut, "boot_time": isoUTC(time.Unix(int64(time.Now().Unix())-int64(ut), 0)),
		"load_avg": map[string]any{"1min": l.Load1, "5min": l.Load5, "15min": l.Load15},
	})
}

func hSysInfo(w http.ResponseWriter, r *http.Request) {
	hi, _ := host.Info()
	writeJSON(w, 200, map[string]any{
		"hostname": hi.Hostname, "os": hi.OS, "platform": hi.Platform,
		"platform_version": hi.PlatformVersion, "kernel": hi.KernelVersion,
		"arch": hi.KernelArch, "uptime_seconds": hi.Uptime,
	})
}

// ---- WebSocket --------------------------------------------------------------
type wsHub struct {
	mu    sync.Mutex
	conns map[*websocket.Conn]bool
}

func (h *wsHub) add(c *websocket.Conn)    { h.mu.Lock(); h.conns[c] = true; h.mu.Unlock() }
func (h *wsHub) remove(c *websocket.Conn) { h.mu.Lock(); delete(h.conns, c); c.Close(); h.mu.Unlock() }
func (h *wsHub) broadcast(v any) {
	b, _ := json.Marshal(v)
	h.mu.Lock()
	defer h.mu.Unlock()
	for c := range h.conns {
		c.WriteMessage(websocket.TextMessage, b)
	}
}

var upgrader = websocket.Upgrader{CheckOrigin: func(r *http.Request) bool { return true }}

func hWS(w http.ResponseWriter, r *http.Request) {
	c, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		return
	}
	hub.add(c)
	defer hub.remove(c)
	c.WriteJSON(map[string]any{"type": "welcome", "data": map[string]any{
		"clientId": fmt.Sprintf("%d", time.Now().UnixNano()), "message": "Connected to Raspberry Pi Monitor",
	}})
	for {
		var msg map[string]any
		if err := c.ReadJSON(&msg); err != nil {
			return
		}
		if t, _ := msg["type"].(string); t == "ping" {
			c.WriteJSON(map[string]any{"type": "pong", "data": map[string]any{"timestamp": isoUTC(time.Now())}})
		}
	}
}

func currentMetrics() map[string]any {
	cpuRow := latest("cpu_metrics")
	return map[string]any{
		"cpu": cpuRow, "memory": latest("memory_metrics"), "disk": latest("disk_metrics"),
		"network": latest("network_metrics"), "gpu": latest("gpu_metrics"),
		"timestamp": isoUTC(time.Now()),
	}
}

// ---- static (React build + SPA fallback) ------------------------------------
func serveStatic(w http.ResponseWriter, r *http.Request) {
	p := strings.TrimPrefix(r.URL.Path, "/")
	if p == "" {
		p = "index.html"
	}
	full := frontendDir + "/" + p
	if st, err := os.Stat(full); err != nil || st.IsDir() {
		full = frontendDir + "/index.html" // SPA fallback
	}
	http.ServeFile(w, r, full)
}

func main() {
	port := env("PORT", "4999")
	frontendDir = env("FRONTEND_DIR", "frontend/build")
	dsn := fmt.Sprintf("%s:%s@tcp(%s:3306)/%s?parseTime=true&loc=UTC&interpolateParams=true&time_zone=%%27%%2B00%%3A00%%27",
		env("DB_USER", "raspi_monitor"), env("DB_PASSWORD", "monitoring_secure_pass_2024"),
		env("DB_HOST", "127.0.0.1"), env("DB_NAME", "raspi_monitor"))
	var err error
	db, err = sql.Open("mysql", dsn)
	if err != nil {
		log.Fatal(err)
	}
	db.SetMaxOpenConns(8)
	if err := db.Ping(); err != nil {
		log.Printf("⚠️  DB not reachable: %v", err)
	} else {
		log.Println("📊 MariaDB connected")
	}

	interval := 5 * time.Second
	if ms, e := strconv.Atoi(env("METRICS_INTERVAL", "5000")); e == nil {
		interval = time.Duration(ms) * time.Millisecond
	}
	go func() {
		t := time.NewTicker(interval)
		for {
			collectOnce()
			hub.broadcast(map[string]any{"type": "metrics", "data": currentMetrics(), "timestamp": isoUTC(time.Now())})
			<-t.C
		}
	}()

	mux := http.NewServeMux()
	mux.HandleFunc("/api/health", hHealth)
	mux.HandleFunc("/api/metrics/charts", hCharts)
	mux.HandleFunc("/api/metrics", hMetrics)
	mux.HandleFunc("/api/alerts", hAlerts)
	mux.HandleFunc("/api/system/processes", hProcesses)
	mux.HandleFunc("/api/system/led-control", hLEDControl)
	mux.HandleFunc("/api/system/uptime", hUptime)
	mux.HandleFunc("/api/system/info", hSysInfo)
	mux.HandleFunc("/ws", hWS)
	mux.HandleFunc("/", serveStatic)

	log.Printf("🚀 Raspi Monitor (Go) on :%s  metrics every %v  frontend=%s", port, interval, frontendDir)
	log.Fatal(http.ListenAndServe("0.0.0.0:"+port, withCORS(mux)))
}

func withCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		if r.Method == http.MethodOptions {
			w.WriteHeader(204)
			return
		}
		next.ServeHTTP(w, r)
	})
}
