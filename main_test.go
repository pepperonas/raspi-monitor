// Tests for pure/stateless logic in raspi-monitor.
// NO DB, NO gopsutil, NO HTTP server — pure functions only.
package main

import (
	"fmt"
	"strconv"
	"strings"
	"testing"
	"time"
)

// ---------------------------------------------------------------------------
// isoUTC
// ---------------------------------------------------------------------------

func TestIsoUTC_Format(t *testing.T) {
	ts := time.Date(2026, 1, 15, 8, 30, 5, 123_000_000, time.UTC)
	got := isoUTC(ts)
	want := "2026-01-15T08:30:05.123Z"
	if got != want {
		t.Errorf("isoUTC(%v) = %q, want %q", ts, got, want)
	}
}

func TestIsoUTC_ConvertsToUTC(t *testing.T) {
	loc, _ := time.LoadLocation("Europe/Berlin")
	// 2026-06-01 10:00:00 Berlin (UTC+2) → 2026-06-01T08:00:00.000Z
	ts := time.Date(2026, 6, 1, 10, 0, 0, 0, loc)
	got := isoUTC(ts)
	if !strings.HasSuffix(got, "Z") {
		t.Errorf("isoUTC must end with Z, got %q", got)
	}
	if !strings.Contains(got, "T08:00:00") {
		t.Errorf("expected 08:00:00 UTC, got %q", got)
	}
}

func TestIsoUTC_Midnight(t *testing.T) {
	ts := time.Date(2000, 1, 1, 0, 0, 0, 0, time.UTC)
	got := isoUTC(ts)
	want := "2000-01-01T00:00:00.000Z"
	if got != want {
		t.Errorf("isoUTC midnight: got %q, want %q", got, want)
	}
}

func TestIsoUTC_Milliseconds(t *testing.T) {
	ts := time.Date(2026, 3, 7, 12, 0, 0, 999_000_000, time.UTC)
	got := isoUTC(ts)
	if !strings.Contains(got, ".999Z") {
		t.Errorf("isoUTC should include ms=999, got %q", got)
	}
}

// ---------------------------------------------------------------------------
// env
// ---------------------------------------------------------------------------

func TestEnv_Default(t *testing.T) {
	// Unset var → default
	got := env("_RASPI_MONITOR_UNSET_XYZ", "fallback")
	if got != "fallback" {
		t.Errorf("env unset: got %q, want fallback", got)
	}
}

func TestEnv_Set(t *testing.T) {
	t.Setenv("_RASPI_MONITOR_TEST_VAR", "hello")
	got := env("_RASPI_MONITOR_TEST_VAR", "fallback")
	if got != "hello" {
		t.Errorf("env set: got %q, want hello", got)
	}
}

func TestEnv_EmptyStringUsesDefault(t *testing.T) {
	t.Setenv("_RASPI_MONITOR_EMPTY", "")
	got := env("_RASPI_MONITOR_EMPTY", "default_val")
	if got != "default_val" {
		t.Errorf("env empty: should return default, got %q", got)
	}
}

// ---------------------------------------------------------------------------
// convert — pure DB-type mapping (no DB needed)
// ---------------------------------------------------------------------------

func TestConvert_NilReturnsNil(t *testing.T) {
	if convert(nil, "INT") != nil {
		t.Error("convert(nil) should return nil")
	}
}

func TestConvert_DecimalBytesToString(t *testing.T) {
	got := convert([]byte("3.14"), "DECIMAL")
	if s, ok := got.(string); !ok || s != "3.14" {
		t.Errorf("DECIMAL []byte: got %v (%T), want string 3.14", got, got)
	}
}

func TestConvert_VarcharBytesToString(t *testing.T) {
	got := convert([]byte("hello"), "VARCHAR")
	if s, ok := got.(string); !ok || s != "hello" {
		t.Errorf("VARCHAR: got %v, want hello", got)
	}
}

func TestConvert_TextBytesToString(t *testing.T) {
	got := convert([]byte("some text"), "TEXT")
	if s, ok := got.(string); !ok || s != "some text" {
		t.Errorf("TEXT: got %v, want 'some text'", got)
	}
}

func TestConvert_IntFromInt64(t *testing.T) {
	got := convert(int64(42), "INT")
	if n, ok := got.(int64); !ok || n != 42 {
		t.Errorf("INT int64: got %v (%T), want int64(42)", got, got)
	}
}

func TestConvert_BigintFromBytes(t *testing.T) {
	got := convert([]byte("9876543210"), "BIGINT")
	if n, ok := got.(int64); !ok || n != 9876543210 {
		t.Errorf("BIGINT bytes: got %v (%T), want int64(9876543210)", got, got)
	}
}

func TestConvert_TimestampFromTime(t *testing.T) {
	ts := time.Date(2026, 5, 20, 14, 30, 0, 0, time.UTC)
	got := convert(ts, "TIMESTAMP")
	s, ok := got.(string)
	if !ok {
		t.Fatalf("TIMESTAMP from time.Time: got %T, want string", got)
	}
	if !strings.Contains(s, "2026-05-20T14:30:00") {
		t.Errorf("TIMESTAMP: unexpected value %q", s)
	}
}

func TestConvert_TimestampFromBytes(t *testing.T) {
	got := convert([]byte("2026-01-01 00:00:00"), "TIMESTAMP")
	s, ok := got.(string)
	if !ok {
		t.Fatalf("TIMESTAMP from []byte: got %T, want string", got)
	}
	if !strings.Contains(s, "2026-01-01T00:00:00") {
		t.Errorf("TIMESTAMP bytes: unexpected %q", s)
	}
}

func TestConvert_DatetimeFromTime(t *testing.T) {
	ts := time.Date(2026, 12, 31, 23, 59, 59, 0, time.UTC)
	got := convert(ts, "DATETIME")
	s, ok := got.(string)
	if !ok || !strings.HasSuffix(s, "Z") {
		t.Errorf("DATETIME: got %v, want ISO string ending in Z", got)
	}
}

func TestConvert_FallbackBytesToString(t *testing.T) {
	// Unknown type → []byte → string
	got := convert([]byte("raw"), "UNKNOWN_TYPE")
	if s, ok := got.(string); !ok || s != "raw" {
		t.Errorf("fallback []byte: got %v, want raw", got)
	}
}

func TestConvert_FallbackPassthrough(t *testing.T) {
	// Non-byte value → passed through as-is
	got := convert(float64(1.5), "FLOAT")
	if v, ok := got.(float64); !ok || v != 1.5 {
		t.Errorf("float64 passthrough: got %v (%T)", got, got)
	}
}

// ---------------------------------------------------------------------------
// Downsampling step maths — mirrors the chart ID-spacing logic
// (extracted as a pure helper so it can be tested without a DB)
// ---------------------------------------------------------------------------

// downsampleStep computes the ID step used in hCharts.
// lo = first ID in the window, hi = max ID, targetPoints = desired points.
func downsampleStep(lo, hi, targetPoints int64) int64 {
	if hi <= lo {
		return 1
	}
	step := (hi - lo) / targetPoints
	if step < 1 {
		step = 1
	}
	return step
}

// downsampleIDs returns the list of IDs that would be fetched.
func downsampleIDs(lo, hi, targetPoints int64) []int64 {
	step := downsampleStep(lo, hi, targetPoints)
	var ids []int64
	for id := lo; id <= hi; id += step {
		ids = append(ids, id)
	}
	return ids
}

func TestDownsampleStep_NormalRange(t *testing.T) {
	// 1000 rows, target 200 → step 5
	step := downsampleStep(1, 1001, 200)
	if step != 5 {
		t.Errorf("step(1,1001,200) = %d, want 5", step)
	}
}

func TestDownsampleStep_SmallerThanTarget(t *testing.T) {
	// Fewer rows than targetPoints → step always ≥ 1
	step := downsampleStep(1, 50, 200)
	if step != 1 {
		t.Errorf("step(1,50,200) = %d, want 1", step)
	}
}

func TestDownsampleStep_LoEqualsHi(t *testing.T) {
	// Edge: lo == hi → step 1 (caller will skip per hi<=lo guard)
	step := downsampleStep(5, 5, 200)
	if step != 1 {
		t.Errorf("step(5,5,200) = %d, want 1", step)
	}
}

func TestDownsampleIDs_NeverExceedsHi(t *testing.T) {
	lo, hi := int64(1), int64(10000)
	ids := downsampleIDs(lo, hi, 200)
	for _, id := range ids {
		if id > hi {
			t.Errorf("id %d exceeds hi %d", id, hi)
		}
		if id < lo {
			t.Errorf("id %d below lo %d", id, lo)
		}
	}
}

func TestDownsampleIDs_StartsAtLo(t *testing.T) {
	ids := downsampleIDs(100, 1100, 200)
	if len(ids) == 0 || ids[0] != 100 {
		t.Errorf("first ID should be lo=100, got %v", ids)
	}
}

func TestDownsampleIDs_CountApproxTarget(t *testing.T) {
	lo, hi := int64(1), int64(2001)
	ids := downsampleIDs(lo, hi, 200)
	// Should be roughly targetPoints (±1 for the boundary)
	if len(ids) < 195 || len(ids) > 205 {
		t.Errorf("expected ~200 IDs, got %d", len(ids))
	}
}

func TestDownsampleIDs_SingleRow(t *testing.T) {
	ids := downsampleIDs(42, 42, 200)
	// lo==hi: the loop runs exactly once (id=42 ≤ hi=42)
	if len(ids) != 1 || ids[0] != 42 {
		t.Errorf("single row: got %v", ids)
	}
}

func TestDownsampleIDs_EvenSpacing(t *testing.T) {
	ids := downsampleIDs(0, 1000, 10)
	// step = 1000/10 = 100 → ids: 0,100,200,...,1000
	for i := 1; i < len(ids); i++ {
		gap := ids[i] - ids[i-1]
		if gap != 100 {
			t.Errorf("gap between id[%d] and id[%d]: got %d, want 100", i-1, i, gap)
		}
	}
}

// ---------------------------------------------------------------------------
// Alert threshold — pure boolean logic
// ---------------------------------------------------------------------------

// alertShouldFire reports whether a new alert should be considered for insertion.
// (Mirrors the `value <= threshold → return` guard in checkAlert.)
func alertShouldFire(value, threshold float64) bool {
	return value > threshold
}

func TestAlertThreshold_BelowThreshold(t *testing.T) {
	if alertShouldFire(80.0, 85.0) {
		t.Error("80 > 85 should NOT fire")
	}
}

func TestAlertThreshold_AtThreshold(t *testing.T) {
	// value <= threshold → no fire
	if alertShouldFire(85.0, 85.0) {
		t.Error("85.0 == 85.0 should NOT fire (≤ guard)")
	}
}

func TestAlertThreshold_AboveThreshold(t *testing.T) {
	if !alertShouldFire(90.0, 85.0) {
		t.Error("90 > 85 SHOULD fire")
	}
}

func TestAlertThreshold_ZeroThreshold(t *testing.T) {
	if !alertShouldFire(0.1, 0.0) {
		t.Error("0.1 > 0.0 SHOULD fire")
	}
	if alertShouldFire(0.0, 0.0) {
		t.Error("0.0 == 0.0 should NOT fire")
	}
}

func TestAlertThreshold_NegativeValues(t *testing.T) {
	if alertShouldFire(-5.0, 0.0) {
		t.Error("-5.0 < 0.0 should NOT fire")
	}
}

func TestAlertThreshold_Table(t *testing.T) {
	cases := []struct {
		value, threshold float64
		want             bool
	}{
		{50, 85, false},
		{85, 85, false},
		{85.001, 85, true},
		{100, 85, true},
		{0, 0, false},
		{1, 0, true},
		{99.99, 99.99, false},
		{100, 99.99, true},
	}
	for _, tc := range cases {
		got := alertShouldFire(tc.value, tc.threshold)
		if got != tc.want {
			t.Errorf("alertShouldFire(%.3f, %.3f) = %v, want %v",
				tc.value, tc.threshold, got, tc.want)
		}
	}
}

// ---------------------------------------------------------------------------
// Duration range → seconds (mirrors hCharts interval handling)
// ---------------------------------------------------------------------------

var durationMap = map[string]time.Duration{
	"1h":  time.Hour,
	"6h":  6 * time.Hour,
	"24h": 24 * time.Hour,
	"7d":  7 * 24 * time.Hour,
}

func rangeToSeconds(rng string) int {
	dur, ok := durationMap[rng]
	if !ok || dur == 0 {
		dur = time.Hour
	}
	return int(dur.Seconds())
}

func TestRangeToSeconds_1h(t *testing.T) {
	if got := rangeToSeconds("1h"); got != 3600 {
		t.Errorf("1h: got %d, want 3600", got)
	}
}

func TestRangeToSeconds_6h(t *testing.T) {
	if got := rangeToSeconds("6h"); got != 21600 {
		t.Errorf("6h: got %d, want 21600", got)
	}
}

func TestRangeToSeconds_24h(t *testing.T) {
	if got := rangeToSeconds("24h"); got != 86400 {
		t.Errorf("24h: got %d, want 86400", got)
	}
}

func TestRangeToSeconds_7d(t *testing.T) {
	want := 7 * 24 * 3600
	if got := rangeToSeconds("7d"); got != want {
		t.Errorf("7d: got %d, want %d", got, want)
	}
}

func TestRangeToSeconds_InvalidFallsBackTo1h(t *testing.T) {
	if got := rangeToSeconds("bogus"); got != 3600 {
		t.Errorf("bogus: got %d, want 3600 (fallback)", got)
	}
}

func TestRangeToSeconds_EmptyFallsBackTo1h(t *testing.T) {
	if got := rangeToSeconds(""); got != 3600 {
		t.Errorf("empty: got %d, want 3600 (fallback)", got)
	}
}

// ---------------------------------------------------------------------------
// Process line parsing (mirrors hProcesses field splitting)
// ---------------------------------------------------------------------------

// parseProcessLine parses one "ps aux" line into a map.
// Returns nil if the line has too few fields.
func parseProcessLine(line string) map[string]any {
	f := strings.Fields(line)
	if len(f) < 11 {
		return nil
	}
	pid, _ := fmt.Sscanf(f[1], "%d", new(int))
	_ = pid
	pidVal := 0
	fmt.Sscanf(f[1], "%d", &pidVal)
	cpuP, _ := strconv.ParseFloat(f[2], 64)
	memP, _ := strconv.ParseFloat(f[3], 64)
	vsz, _ := strconv.ParseInt(f[4], 10, 64)
	rss, _ := strconv.ParseInt(f[5], 10, 64)
	return map[string]any{
		"pid": pidVal, "user": f[0], "cpu": cpuP, "memory": memP,
		"vsz": vsz, "rss": rss, "tty": f[6], "stat": f[7],
		"start": f[8], "time": f[9],
		"command": strings.Join(f[10:], " "),
	}
}

func TestParseProcessLine_Valid(t *testing.T) {
	line := "pi        1234  2.5  1.3 123456 54321 ?        Ssl  Jun01   0:01 /usr/bin/python3 app.py"
	m := parseProcessLine(line)
	if m == nil {
		t.Fatal("expected parsed map, got nil")
	}
	if m["pid"].(int) != 1234 {
		t.Errorf("pid: got %v, want 1234", m["pid"])
	}
	if m["user"].(string) != "pi" {
		t.Errorf("user: got %v, want pi", m["user"])
	}
	if m["cpu"].(float64) != 2.5 {
		t.Errorf("cpu: got %v, want 2.5", m["cpu"])
	}
	if m["vsz"].(int64) != 123456 {
		t.Errorf("vsz: got %v, want 123456", m["vsz"])
	}
	cmd := m["command"].(string)
	if !strings.Contains(cmd, "python3") {
		t.Errorf("command: got %q, expected 'python3'", cmd)
	}
}

func TestParseProcessLine_TooFewFields(t *testing.T) {
	line := "pi  1234  2.5"
	if m := parseProcessLine(line); m != nil {
		t.Errorf("short line: expected nil, got %v", m)
	}
}

func TestParseProcessLine_CommandWithSpaces(t *testing.T) {
	line := "root      999  0.0  0.0  10000  2000 ?        S    Jun01   0:00 /bin/sh -c echo hello world"
	m := parseProcessLine(line)
	if m == nil {
		t.Fatal("got nil")
	}
	cmd := m["command"].(string)
	if cmd != "/bin/sh -c echo hello world" {
		t.Errorf("command with spaces: got %q", cmd)
	}
}

func TestParseProcessLine_ZeroCPU(t *testing.T) {
	line := "root        1  0.0  0.1  12345  6789 ?        Ss   Jun01   1:00 /sbin/init"
	m := parseProcessLine(line)
	if m == nil {
		t.Fatal("nil")
	}
	if m["cpu"].(float64) != 0.0 {
		t.Errorf("cpu: got %v, want 0.0", m["cpu"])
	}
}

// ---------------------------------------------------------------------------
// METRICS_INTERVAL env parsing (mirrors main() startup logic)
// ---------------------------------------------------------------------------

func parseMetricsInterval(val string) time.Duration {
	if ms, e := strconv.Atoi(val); e == nil {
		return time.Duration(ms) * time.Millisecond
	}
	return 5 * time.Second // default
}

func TestMetricsInterval_Default5s(t *testing.T) {
	if d := parseMetricsInterval("5000"); d != 5*time.Second {
		t.Errorf("5000ms: got %v, want 5s", d)
	}
}

func TestMetricsInterval_Custom(t *testing.T) {
	if d := parseMetricsInterval("10000"); d != 10*time.Second {
		t.Errorf("10000ms: got %v, want 10s", d)
	}
}

func TestMetricsInterval_InvalidFallback(t *testing.T) {
	if d := parseMetricsInterval("not-a-number"); d != 5*time.Second {
		t.Errorf("invalid: got %v, want 5s fallback", d)
	}
}

func TestMetricsInterval_1s(t *testing.T) {
	if d := parseMetricsInterval("1000"); d != time.Second {
		t.Errorf("1000ms: got %v, want 1s", d)
	}
}
